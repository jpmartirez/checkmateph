import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CommentType, PostComment, CommentSource, PostStatus } from "@/components/main/feed/feed-types";



function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

function normalizeHost(url: string): string | null {
	try {
		const host = new URL(url).hostname.toLowerCase();
		return host.startsWith("www.") ? host.slice(4) : host;
	} catch {
		return null;
	}
}

function parseSources(value: unknown): Array<{ title: string; url: string }> {
	if (!Array.isArray(value)) return [];
	return value
		.map((item) => {
			if (!isRecord(item)) return null;
			const title = getString(item.title)?.trim();
			const url = getString(item.url)?.trim();
			if (!title || !url) return null;
			return { title, url };
		})
		.filter((x): x is { title: string; url: string } => x !== null)
		.slice(0, 20);
}


export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ postId: string }> },
) {
	const supabase = await createClient();
	const { data: auth } = await supabase.auth.getUser();
	if (!auth?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { postId } = await params;
	if (!postId) {
		return NextResponse.json({ error: "Missing postId" }, { status: 400 });
	}

	const { data: commentRows, error: commentError } = await supabase
		.from("post_comments")
		.select(
			"id, post_id, type, content, status, created_at, " +
			"author:profiles!author_id(id, display_name, avatar_url, role)",
		)
		.eq("post_id", postId)
		.order("created_at", { ascending: true });

	if (commentError) {
		return NextResponse.json({ error: commentError.message }, { status: 500 });
	}

	const rows = (commentRows ?? []) as unknown as Record<string, unknown>[];

	// Batch-fetch all comment sources in a single query.
	const commentIds = rows.map((r) => getString(r.id)).filter(Boolean) as string[];
	const sourcesMap: Record<string, Record<string, unknown>[]> = {};
	if (commentIds.length > 0) {
		const { data: sourceRows } = await supabase
			.from("comment_sources")
			.select("id, comment_id, title, url, is_verified")
			.in("comment_id", commentIds);
		for (const s of (sourceRows ?? []) as unknown as Record<string, unknown>[]) {
			const cid = getString(s.comment_id);
			if (cid) (sourcesMap[cid] ??= []).push(s);
		}
	}

	const comments: PostComment[] = rows
		.map((row): PostComment | null => {
			const id = getString(row.id);
			const postId = getString(row.post_id);
			const content = getString(row.content);
			const type = getString(row.type) as CommentType | undefined;
			const createdAt = getString(row.created_at);

			if (!id || !postId || !content || !createdAt) return null;
			if (type !== "OPINION" && type !== "CLAIM" && type !== "COUNTER_CLAIM") return null;

			const authorRaw = row.author;
			const authorObj = isRecord(authorRaw)
				? authorRaw
				: Array.isArray(authorRaw) && isRecord(authorRaw[0])
					? authorRaw[0]
					: null;

			const authorId = getString(authorObj?.id) ?? "unknown";
			const authorName = getString(authorObj?.display_name) ?? "Unknown";
			const authorAvatar = getString(authorObj?.avatar_url) ?? `https://i.pravatar.cc/150?u=${authorId}`;
			const authorRole = getString(authorObj?.role);

			const commentStatus = Array.isArray(row.status)
				? (row.status.filter((s) => typeof s === "string") as PostStatus[])
				: [];

			const sources = (sourcesMap[id] ?? [])
				.map((s): CommentSource | null => {
					const sid = getString(s.id);
					const title = getString(s.title);
					const url = getString(s.url);
					if (!sid || !title || !url) return null;
					return {
						id: sid,
						title,
						url,
						...(typeof s.is_verified === "boolean" ? { isVerified: s.is_verified } : {}),
					};
				})
				.filter((s): s is CommentSource => s !== null);

			return {
				id,
				postId,
				author: { id: authorId, name: authorName, avatarUrl: authorAvatar, role: authorRole },
				content,
				type,
				status: commentStatus.length ? commentStatus : undefined,
				createdAt,
				sources: sources.length ? sources : undefined,
			};
		})
		.filter((c): c is PostComment => c !== null);

	return NextResponse.json({ comments });
}

// ---------------------------------------------------------------------------
// POST /api/posts/[postId]/comments  — create a comment
//
// Body: { type, content, sources? }
//
// OPINION:       No sources required.
// CLAIM:         At least one source required.
// COUNTER_CLAIM: At least one source required.
//                Automatically adds DEBATED to the original post's status.
// ---------------------------------------------------------------------------
export async function POST(
	request: Request,
	{ params }: { params: Promise<{ postId: string }> },
) {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { postId } = await params;
	if (!postId) {
		return NextResponse.json({ error: "Missing postId" }, { status: 400 });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}
	if (!isRecord(body)) {
		return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
	}

	const type = body.type as CommentType | undefined;
	const content = getString(body.content)?.trim();
	const sources = parseSources(body.sources);

	// --- Validation ---
	if (type !== "OPINION" && type !== "CLAIM" && type !== "COUNTER_CLAIM") {
		return NextResponse.json(
			{ error: "type must be OPINION, CLAIM, or COUNTER_CLAIM" },
			{ status: 400 },
		);
	}
	if (!content) {
		return NextResponse.json({ error: "Content is required" }, { status: 400 });
	}
	if ((type === "CLAIM" || type === "COUNTER_CLAIM") && sources.length === 0) {
		return NextResponse.json(
			{ error: `${type === "CLAIM" ? "Claim" : "Counter claim"} comments require at least one source` },
			{ status: 400 },
		);
	}

	// --- Verify post exists ---
	const { data: postRow, error: postError } = await supabase
		.from("posts")
		.select("id, status")
		.eq("id", postId)
		.single();

	if (postError || !postRow) {
		return NextResponse.json({ error: "Post not found" }, { status: 404 });
	}

	// --- Insert comment ---
	const { data: inserted, error: insertError } = await supabase
		.from("post_comments")
		.insert({
			post_id: postId,
			author_id: user.id,
			type,
			content,
		})
		.select("id")
		.single();

	if (insertError || !inserted) {
		return NextResponse.json(
			{ error: insertError?.message ?? "Failed to create comment" },
			{ status: 500 },
		);
	}

	const commentId = inserted.id as string;

	// --- Insert comment sources into comment_sources table ---
	if (sources.length > 0) {
		const hostByUrl = new Map<string, string>();
		const hosts: string[] = [];

		for (const source of sources) {
			const host = normalizeHost(source.url);
			if (host) {
				hostByUrl.set(source.url, host);
				hosts.push(host);
			}
		}

		const { data: verifiedRows } = await supabase
			.from("verified_sources")
			.select("host")
			.in("host", hosts.length ? hosts : ["__none__"]);

		const verifiedHosts = new Set(
			(verifiedRows ?? [])
				.map((r) => (isRecord(r) ? getString(r.host) : undefined))
				.filter(Boolean) as string[],
		);

		await supabase.from("comment_sources").insert(
			sources.map((s) => {
				const host = hostByUrl.get(s.url) ?? null;
				return {
					comment_id: commentId,
					title: s.title,
					url: s.url,
					host,
					is_verified: host ? verifiedHosts.has(host) : false,
				};
			}),
		);
	}

	// --- Update post comments_count ---
	const { count } = await supabase
		.from("post_comments")
		.select("id", { count: "exact", head: true })
		.eq("post_id", postId);

	await supabase
		.from("posts")
		.update({ comments_count: count ?? 0 })
		.eq("id", postId);

	// --- COUNTER_CLAIM: tag original post as DEBATED ---
	if (type === "COUNTER_CLAIM") {
		const currentStatus = Array.isArray(postRow.status)
			? (postRow.status.filter((s) => typeof s === "string") as string[])
			: [];

		if (!currentStatus.includes("DEBATED")) {
			await supabase
				.from("posts")
				.update({ status: [...currentStatus, "DEBATED"] })
				.eq("id", postId);
		}
	}

	return NextResponse.json({ ok: true, commentId }, { status: 201 });
}
