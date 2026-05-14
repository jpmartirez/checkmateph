import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
	Post,
	PostCategory,
	PostComment,
	CommentSource,
	CommentType,
	PostSource,
	PostStatus,
} from "@/components/main/feed/feed-types";



function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

function formatTimeAgo(iso: string): string {
	const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
	const minutes = Math.floor(diffSeconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	if (days === 1) return "Yesterday";
	return `${days} days ago`;
}

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

function mapRowToComment(
	row: Record<string, unknown>,
	commentSources: Record<string, unknown>[],
): PostComment | null {
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

	const sources = commentSources
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

	// --- Fetch post ---
	const { data: postRow, error: postError } = await supabase
		.from("posts")
		.select(POST_SELECT)
		.eq("id", postId)
		.single();

	if (postError || !postRow) {
		return NextResponse.json({ error: "Post not found" }, { status: 404 });
	}

	const post = mapRowToPost(postRow);
	if (!post) {
		return NextResponse.json({ error: "Failed to map post" }, { status: 500 });
	}

	// --- Fetch live reactions count ---
	const { count: reactionsCount } = await supabase
		.from("post_reactions")
		.select("id", { count: "exact", head: true })
		.eq("post_id", postId);

	// --- Fetch comments ---
	const { data: commentRows, error: commentError } = await supabase
		.from("post_comments")
		.select("id, post_id, type, content, status, created_at, author:profiles!author_id(id, display_name, avatar_url, role)")
		.eq("post_id", postId)
		.order("created_at", { ascending: true });

	if (commentError) {
		return NextResponse.json({ error: commentError.message }, { status: 500 });
	}

	// --- Fetch comment sources in one query ---
	const commentIds = (commentRows ?? []).map((r) => r.id as string);
	const sourcesMap: Record<string, Record<string, unknown>[]> = {};
	if (commentIds.length > 0) {
		const { data: sourcesRows } = await supabase
			.from("comment_sources")
			.select("id, comment_id, title, url, is_verified")
			.in("comment_id", commentIds);
		for (const s of (sourcesRows ?? []) as Record<string, unknown>[]) {
			const cid = getString(s.comment_id);
			if (cid) (sourcesMap[cid] ??= []).push(s);
		}
	}

	const comments = (commentRows ?? [])
		.map((row) => mapRowToComment(row as Record<string, unknown>, sourcesMap[row.id as string] ?? []))
		.filter((c): c is PostComment => c !== null);

	// --- Expert review consensus (claim posts only) ---
	const { data: reviewRows } = await supabase
		.from("expert_reviews")
		.select("average_score")
		.eq("post_id", postId);

	const scores = (reviewRows ?? [])
		.map((r) => (isRecord(r) ? r.average_score : null))
		.filter((s): s is number => typeof s === "number");

	const supported = scores.filter((s) => s >= 3).length;
	const disputed = scores.filter((s) => s < 3).length;
	const total = supported + disputed;
	const leaning =
		total === 0 || supported === disputed ? "NEUTRAL" : supported > disputed ? "SUPPORTED" : "DISPUTED";

	return NextResponse.json({
		post: {
			...post,
			stats: {
				...post.stats,
				reactions: typeof reactionsCount === "number" ? reactionsCount : post.stats.reactions,
			},
			consensus: { supported, disputed, total, leaning },
		},
		comments,
	});
}
