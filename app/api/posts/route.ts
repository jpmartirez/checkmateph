import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
	Post,
	PostCategory,
	PostStatus,
} from "@/components/main/feed/feed-types";

function formatTimeAgo(iso: string): string {
	const date = new Date(iso);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

	const minutes = Math.floor(diffSeconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	if (days === 1) return "Yesterday";
	return `${days} days ago`;
}

function mapDbPostToUi(row: unknown): Post | null {
	if (!isRecord(row)) return null;

	const id = getString(row.id);
	const createdAt = getString(row.created_at);
	const category = getString(row.category) as PostCategory | undefined;
	const content = getString(row.content);
	const imageUrl = getString(row.image_url);

	if (!id || !createdAt || !content) return null;
	if (category !== "CLAIM" && category !== "OPINION") return null;

	const statusRaw = row.status;
	const status = Array.isArray(statusRaw)
		? (statusRaw.filter((s) => typeof s === "string") as PostStatus[])
		: [];

	// `author` sometimes comes back as an object or a 1-item array, depending on PostgREST inference.
	const authorRaw = row.author;
	const author = isRecord(authorRaw)
		? authorRaw
		: Array.isArray(authorRaw) && authorRaw.length > 0 && isRecord(authorRaw[0])
			? authorRaw[0]
			: null;

	const authorId = getString(author?.id) ?? "unknown";
	const authorName = getString(author?.display_name) ?? "Unknown";
	const authorAvatar =
		getString(author?.avatar_url) ?? `https://i.pravatar.cc/150?u=${authorId}`;
	const authorRole = getString(author?.role) ?? undefined;

	const reactionsCount =
		typeof row.reactions_count === "number" ? row.reactions_count : 0;
	const commentsCount =
		typeof row.comments_count === "number" ? row.comments_count : 0;
	const sharesCount = typeof row.shares_count === "number" ? row.shares_count : 0;

	const sourcesRaw = row.sources;
	const sources = Array.isArray(sourcesRaw) ? sourcesRaw : [];
	const referencesCount = sources.length;

	return {
		id,
		author: {
			id: authorId,
			name: authorName,
			avatarUrl: authorAvatar,
			role: authorRole,
		},
		timeAgo: formatTimeAgo(createdAt),
		contentText: content,
		image: imageUrl ?? undefined,
		status: status.length ? status : undefined,
		category,
		stats: {
			reactions: reactionsCount,
			comments: commentsCount,
			shares: sharesCount,
			references: referencesCount,
		},
	};
}

const postSelect =
	"id, created_at, category, content, image_url, status, reactions_count, comments_count, shares_count, author:profiles!posts_author_id_fkey(id, display_name, avatar_url, role), sources:post_sources(id, title, url)";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
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

export async function GET(request: Request) {
	const supabase = await createClient();
	const { data: auth } = await supabase.auth.getUser();
	if (!auth?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const url = new URL(request.url);
	const limitParam = url.searchParams.get("limit");
	const limit = Math.min(
		50,
		Math.max(1, Number.parseInt(limitParam ?? "20", 10) || 20),
	);

	const { data, error } = await supabase
		.from("posts")
		.select(postSelect)
		.order("created_at", { ascending: false })
		.limit(limit);

	if (error) {
		return NextResponse.json(
			{ error: error.message },
			{ status: 500 },
		);
	}

	const posts = (data ?? [])
		.map((row) => mapDbPostToUi(row))
		.filter((p): p is Post => p !== null);
	return NextResponse.json({ posts });
}

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
	const contentText = getString(body.contentText);
	const imageUrl = getString(body.imageUrl);
	const sources = getSources(body.sources);

	if (category !== "CLAIM" && category !== "OPINION") {
		return NextResponse.json({ error: "Invalid category" }, { status: 400 });
	}
	if (!contentText || typeof contentText !== "string" || !contentText.trim()) {
		return NextResponse.json({ error: "Content is required" }, { status: 400 });
	}

	// Ensure the user has a profile row (trigger should create it, but this makes the API robust).
	const fallbackName = user.email ? user.email.split("@")[0] : "User";
	const userMeta = (isRecord(user.user_metadata)
		? user.user_metadata
		: {}) as Record<string, unknown>;
	const metaDisplayName = getString(userMeta.display_name);
	const metaName = getString(userMeta.name);
	const metaAvatarUrl = getString(userMeta.avatar_url);

	await supabase.from("profiles").upsert(
		{
			id: user.id,
			display_name: metaDisplayName ?? metaName ?? fallbackName,
			avatar_url: metaAvatarUrl ?? null,
		},
		{ onConflict: "id" },
	);

	const initialStatus: PostStatus[] =
		category === "CLAIM" ? ["UNDER_REVIEW"] : [];

	const { data: inserted, error: insertError } = await supabase
		.from("posts")
		.insert({
			author_id: user.id,
			category,
			content: contentText.trim(),
			image_url: imageUrl ?? null,
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

	const normalizedSources = sources
		.map((s) => ({
			title: String(s?.title ?? "").trim(),
			url: String(s?.url ?? "").trim(),
		}))
		.filter((s) => s.title && s.url)
		.slice(0, 20);

	if (normalizedSources.length > 0) {
		const { error: sourcesError } = await supabase.from("post_sources").insert(
			normalizedSources.map((s) => ({
				post_id: inserted.id,
				title: s.title,
				url: s.url,
			})),
		);

		if (sourcesError) {
			return NextResponse.json(
				{ error: sourcesError.message },
				{ status: 500 },
			);
		}
	}

	const { data: created, error: createdError } = await supabase
		.from("posts")
		.select(postSelect)
		.eq("id", inserted.id)
		.single();

	if (createdError || !created) {
		return NextResponse.json(
			{ error: createdError?.message ?? "Failed to load created post" },
			{ status: 500 },
		);
	}

	const post = mapDbPostToUi(created);
	if (!post) {
		return NextResponse.json(
			{ error: "Failed to map created post" },
			{ status: 500 },
		);
	}

	return NextResponse.json({ post });
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

	const url = new URL(request.url);
	const id = url.searchParams.get("id");
	if (!id || typeof id !== "string") {
		return NextResponse.json({ error: "Missing id" }, { status: 400 });
	}

	const { data: existing, error: existingError } = await supabase
		.from("posts")
		.select("id, author_id")
		.eq("id", id)
		.single();

	if (existingError || !existing) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	if (existing.author_id !== user.id) {
		return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	}

	const { error: deleteError } = await supabase
		.from("posts")
		.delete()
		.eq("id", id);

	if (deleteError) {
		return NextResponse.json({ error: deleteError.message }, { status: 500 });
	}

	return NextResponse.json({ ok: true });
}
