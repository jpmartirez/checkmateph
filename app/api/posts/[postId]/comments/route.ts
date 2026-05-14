import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { CommentType } from "@/components/main/feed/feed-types";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

function normalizeHost(url: string): string | null {
	try {
		const parsed = new URL(url);
		const host = parsed.hostname.toLowerCase();
		return host.startsWith("www.") ? host.slice(4) : host;
	} catch {
		return null;
	}
}

function getSources(value: unknown): Array<{ title: string; url: string }> {
	if (!Array.isArray(value)) return [];
	return value
		.map((item) => {
			if (!isRecord(item)) return null;
			const title = getString(item.title);
			const url = getString(item.url);
			if (!title || !url) return null;
			return { title, url };
		})
		.filter((x): x is { title: string; url: string } => x !== null);
}

function isValidCommentType(value: unknown): value is CommentType {
	return value === "OPINION" || value === "CLAIM" || value === "COUNTER_CLAIM";
}

function isUuid(value: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
		value,
	);
}

function mergeStatus(current: string[] | null | undefined, next: string[]): string[] {
	const set = new Set(current ?? []);
	next.forEach((status) => set.add(status));
	return Array.from(set);
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
		return NextResponse.json({ error: "Missing post id" }, { status: 400 });
	}
	if (!isUuid(postId)) {
		return NextResponse.json(
			{ error: "Invalid post id" },
			{ status: 400 },
		);
	}

	const { data: commentRows, error } = await supabase
		.from("post_comments")
		.select(
			"id, post_id, type, content, created_at, author:profiles!post_comments_author_id_fkey(id, display_name, avatar_url, role), sources:comment_sources(id, title, url, is_verified)",
		)
		.eq("post_id", postId)
		.order("created_at", { ascending: true });

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ comments: commentRows ?? [] });
}

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
		return NextResponse.json({ error: "Missing post id" }, { status: 400 });
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

	const content = getString(body.content);
	const type = body.type;
	const sources = getSources(body.sources);

	if (!content || !content.trim()) {
		return NextResponse.json({ error: "Content is required" }, { status: 400 });
	}
	if (!isValidCommentType(type)) {
		return NextResponse.json({ error: "Invalid comment type" }, { status: 400 });
	}
	if ((type === "CLAIM" || type === "COUNTER_CLAIM") && sources.length === 0) {
		return NextResponse.json(
			{ error: "Claims require at least one source" },
			{ status: 400 },
		);
	}

	const commentId = crypto.randomUUID();
	const { error: insertError } = await supabase.from("post_comments").insert({
		id: commentId,
		post_id: postId,
		author_id: user.id,
		type,
		content: content.trim(),
	});

	if (insertError) {
		return NextResponse.json(
			{
				error: insertError.message ?? "Failed to create comment",
				code: insertError.code,
				details: insertError.details,
				hint: insertError.hint,
			},
			{ status: 500 },
		);
	}

	const normalizedSources = sources
		.map((s) => ({
			title: String(s?.title ?? "").trim(),
			url: String(s?.url ?? "").trim(),
		}))
		.filter((s) => s.title && s.url)
		.slice(0, 20);

	if (normalizedSources.length > 0) {
		const hostByUrl = new Map<string, string>();
		const hosts = normalizedSources
			.map((source) => {
				const host = normalizeHost(source.url);
				if (host) {
					hostByUrl.set(source.url, host);
				}
				return host;
			})
			.filter((host): host is string => Boolean(host));

		const { data: verifiedHosts } = await supabase
			.from("verified_sources")
			.select("host")
			.in("host", hosts.length ? hosts : ["__none__"]);

		const verifiedHostSet = new Set(
			(verifiedHosts ?? [])
				.map((row) => (isRecord(row) ? getString(row.host) : undefined))
				.filter((host): host is string => Boolean(host)),
		);

		const { error: sourcesError } = await supabase.from("comment_sources").insert(
			normalizedSources.map((source) => {
				const host = hostByUrl.get(source.url) ?? null;
				return {
					comment_id: commentId,
					title: source.title,
					url: source.url,
					host,
					is_verified: host ? verifiedHostSet.has(host) : false,
				};
			}),
		);

		if (sourcesError) {
			return NextResponse.json(
				{ error: sourcesError.message },
				{ status: 500 },
			);
		}
	}

	const { count } = await supabase
		.from("post_comments")
		.select("id", { count: "exact", head: true })
		.eq("post_id", postId);

	await supabase
		.from("posts")
		.update({ comments_count: count ?? 0 })
		.eq("id", postId);

	if (type === "COUNTER_CLAIM") {
		const { data: postRow } = await supabase
			.from("posts")
			.select("status")
			.eq("id", postId)
			.single();

		const currentStatus =
			isRecord(postRow) && Array.isArray(postRow.status)
				? (postRow.status.filter((status) => typeof status === "string") as string[])
				: [];

		await supabase
			.from("posts")
			.update({ status: mergeStatus(currentStatus, ["DEBATED"]) })
			.eq("id", postId);
	}

	return NextResponse.json({ ok: true });
}
