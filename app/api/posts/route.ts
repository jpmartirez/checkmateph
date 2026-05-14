import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Post, PostCategory, PostSource, PostStatus } from "@/components/main/feed/feed-types";



function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

function formatTimeAgo(iso: string): string {
	const date = new Date(iso);
	const diffSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
	const minutes = Math.floor(diffSeconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	if (days === 1) return "Yesterday";
	return `${days} days ago`;
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

// Joined select used whenever we fetch posts.
const POST_SELECT =
	"id, created_at, category, content, image_url, status, reactions_count, comments_count, shares_count, " +
	"author:profiles!posts_author_id_fkey(id, display_name, avatar_url, role), " +
	"sources:post_sources(id, title, url, is_verified)";

function mapRowToPost(row: unknown): Post | null {
	if (!isRecord(row)) return null;

	const id = getString(row.id);
	const createdAt = getString(row.created_at);
	const category = getString(row.category) as PostCategory | undefined;
	const content = getString(row.content);

	if (!id || !createdAt || !content) return null;
	if (category !== "CLAIM" && category !== "OPINION") return null;

	const status = Array.isArray(row.status)
		? (row.status.filter((s) => typeof s === "string") as PostStatus[])
		: [];

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

	const sourcesRaw = Array.isArray(row.sources) ? row.sources : [];
	const sources = sourcesRaw
		.map((s): PostSource | null => {
			if (!isRecord(s)) return null;
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
		.filter((s): s is PostSource => s !== null);

	return {
		id,
		author: { id: authorId, name: authorName, avatarUrl: authorAvatar, role: authorRole },
		timeAgo: formatTimeAgo(createdAt),
		contentText: content,
		image: getString(row.image_url),
		status: status.length ? status : undefined,
		category,
		sources: sources.length ? sources : undefined,
		stats: {
			reactions: typeof row.reactions_count === "number" ? row.reactions_count : 0,
			comments: typeof row.comments_count === "number" ? row.comments_count : 0,
			shares: typeof row.shares_count === "number" ? row.shares_count : 0,
			references: sources.length,
		},
	};
}



export async function GET(request: Request) {
	const supabase = await createClient();
	const { data: auth } = await supabase.auth.getUser();
	if (!auth?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const url = new URL(request.url);
	const limit = Math.min(50, Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "20", 10) || 20));
	const q = url.searchParams.get("q")?.trim() ?? "";

	const baseQuery = supabase
		.from("posts")
		.select(POST_SELECT)
		.order("created_at", { ascending: false })
		.limit(limit);

	const { data, error } = await (q
		? baseQuery.ilike("content", `%${q}%`)
		: baseQuery);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	const posts = (data ?? []).map(mapRowToPost).filter((p): p is Post => p !== null);

	
	let likedSet = new Set<string>();
	if (posts.length > 0) {
		const { data: likedRows } = await supabase
			.from("post_reactions")
			.select("post_id")
			.eq("user_id", auth.user.id)
			.in("post_id", posts.map((p) => p.id));
		likedSet = new Set((likedRows ?? []).map((r) => (r as { post_id: string }).post_id));
	}

	return NextResponse.json({
		posts: posts.map((p) => ({ ...p, isLikedByCurrentUser: likedSet.has(p.id) })),
	});
}

// ---------------------------------------------------------------------------
// POST /api/posts  — create a new post
//
// Body: { category, contentText, imageUrl?, sources? }
//
// OPINION: sources optional, no status tags.
// CLAIM:   sources required (≥ 1), starts as UNDER_REVIEW; gains VERIFIED_SOURCE
//          if any source domain is in the verified_sources registry.
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

	const category = body.category as PostCategory | undefined;
	const contentText = getString(body.contentText)?.trim();
	const imageUrl = getString(body.imageUrl)?.trim() || null;
	const sources = parseSources(body.sources);

	// --- Validation ---
	if (category !== "OPINION" && category !== "CLAIM") {
		return NextResponse.json({ error: "category must be OPINION or CLAIM" }, { status: 400 });
	}
	if (!contentText) {
		return NextResponse.json({ error: "Content is required" }, { status: 400 });
	}
	if (category === "CLAIM" && sources.length === 0) {
		return NextResponse.json(
			{ error: "Claim posts require at least one source" },
			{ status: 400 },
		);
	}

	// --- Ensure profile row exists (created by DB trigger on signup; this is a safety net) ---
	const userMeta = isRecord(user.user_metadata) ? user.user_metadata : {};
	const displayName =
		getString(userMeta.display_name) ??
		getString(userMeta.name) ??
		(user.email ? user.email.split("@")[0] : "User");

	await supabase
		.from("profiles")
		.upsert({ id: user.id, display_name: displayName }, { onConflict: "id" });

	// --- Determine initial post status ---
	// OPINION posts have no status tags.
	// CLAIM posts start as UNDER_REVIEW; we may also add VERIFIED_SOURCE below.
	const initialStatus: PostStatus[] = category === "CLAIM" ? ["UNDER_REVIEW"] : [];

	// --- Insert post ---
	const { data: inserted, error: insertError } = await supabase
		.from("posts")
		.insert({
			author_id: user.id,
			category,
			content: contentText,
			image_url: imageUrl,
			status: initialStatus,
		})
		.select("id")
		.single();

	if (insertError || !inserted) {
		return NextResponse.json(
			{ error: insertError?.message ?? "Failed to create post" },
			{ status: 500 },
		);
	}

	// --- Insert sources and check verified registry ---
	let hasVerifiedSource = false;

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
			(verifiedRows ?? []).map((r) => (isRecord(r) ? getString(r.host) : undefined)).filter(Boolean) as string[],
		);

		const { error: sourcesError } = await supabase.from("post_sources").insert(
			sources.map((s) => {
				const host = hostByUrl.get(s.url) ?? null;
				const isVerified = host ? verifiedHosts.has(host) : false;
				if (isVerified) hasVerifiedSource = true;
				return { post_id: inserted.id, title: s.title, url: s.url, host, is_verified: isVerified };
			}),
		);

		if (sourcesError) {
			return NextResponse.json({ error: sourcesError.message }, { status: 500 });
		}

		// Add VERIFIED_SOURCE tag if any source is from the registry.
		if (category === "CLAIM" && hasVerifiedSource) {
			await supabase
				.from("posts")
				.update({ status: [...initialStatus, "VERIFIED_SOURCE"] })
				.eq("id", inserted.id);
		}
	}

	// --- Return the created post ---
	const { data: created, error: createdError } = await supabase
		.from("posts")
		.select(POST_SELECT)
		.eq("id", inserted.id)
		.single();

	if (createdError || !created) {
		return NextResponse.json(
			{ error: createdError?.message ?? "Failed to load created post" },
			{ status: 500 },
		);
	}

	const post = mapRowToPost(created);
	if (!post) {
		return NextResponse.json({ error: "Failed to map created post" }, { status: 500 });
	}

	return NextResponse.json({ post }, { status: 201 });
}


export async function DELETE(request: Request) {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const id = new URL(request.url).searchParams.get("id");
	if (!id) {
		return NextResponse.json({ error: "Missing id" }, { status: 400 });
	}

	const { data: existing, error: existingError } = await supabase
		.from("posts")
		.select("id, author_id")
		.eq("id", id)
		.single();

	if (existingError || !existing) {
		return NextResponse.json({ error: "Post not found" }, { status: 404 });
	}
	if (existing.author_id !== user.id) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { error: deleteError } = await supabase.from("posts").delete().eq("id", id);
	if (deleteError) {
		return NextResponse.json({ error: deleteError.message }, { status: 500 });
	}

	return NextResponse.json({ ok: true });
}
