import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type {
	Post,
	PostCategory,
	PostComment,
	CommentSource,
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
	const mappedSources = sources
		.map((source): PostSource | null => {
			if (!isRecord(source)) return null;
			const sourceId = getString(source.id);
			const title = getString(source.title);
			const url = getString(source.url);
			if (!sourceId || !title || !url) return null;
			const isVerified =
				typeof source.is_verified === "boolean" ? source.is_verified : undefined;
			return {
				id: sourceId,
				title,
				url,
				...(typeof isVerified === "boolean" ? { isVerified } : {}),
			};
		})
		.filter((source): source is PostSource => source !== null);

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
		sources: mappedSources.length ? mappedSources : undefined,
		stats: {
			reactions: reactionsCount,
			comments: commentsCount,
			shares: sharesCount,
			references: referencesCount,
		},
	};
}

function mapDbCommentToUi(row: unknown): PostComment | null {
	if (!isRecord(row)) return null;

	const id = getString(row.id);
	const postId = getString(row.post_id);
	const content = getString(row.content);
	const type = getString(row.type) as PostComment["type"] | undefined;
	const createdAt = getString(row.created_at);
	if (!id || !postId || !content || !type || !createdAt) return null;

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

	const sourcesRaw = row.sources;
	const sources = Array.isArray(sourcesRaw) ? sourcesRaw : [];
	const mappedSources = sources
		.map((source): CommentSource | null => {
			if (!isRecord(source)) return null;
			const sourceId = getString(source.id);
			const title = getString(source.title);
			const url = getString(source.url);
			if (!sourceId || !title || !url) return null;
			const isVerified =
				typeof source.is_verified === "boolean" ? source.is_verified : undefined;
			return {
				id: sourceId,
				title,
				url,
				...(typeof isVerified === "boolean" ? { isVerified } : {}),
			};
		})
		.filter((source): source is CommentSource => source !== null);

	return {
		id,
		postId,
		author: {
			id: authorId,
			name: authorName,
			avatarUrl: authorAvatar,
			role: authorRole,
		},
		content,
		type,
		createdAt,
		sources: mappedSources.length ? mappedSources : undefined,
	};
}

const postSelect =
	"id, created_at, category, content, image_url, status, reactions_count, comments_count, shares_count, author:profiles!posts_author_id_fkey(id, display_name, avatar_url, role), sources:post_sources(id, title, url, is_verified)";

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

	const { data: postRow, error: postError } = await supabase
		.from("posts")
		.select(postSelect)
		.eq("id", postId)
		.single();

	if (postError || !postRow) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	const post = mapDbPostToUi(postRow);
	if (!post) {
		console.error("Failed to map post. Row data:", JSON.stringify(postRow, null, 2));
		return NextResponse.json({ error: "Failed to map post" }, { status: 500 });
	}

	const { count: reactionsCount, error: reactionsError } = await supabase
		.from("post_reactions")
		.select("id", { count: "exact", head: true })
		.eq("post_id", postId);

	const resolvedReactionsCount =
		reactionsError || typeof reactionsCount !== "number"
			? post.stats.reactions
			: reactionsCount;

	const { data: commentRows, error: commentError } = await supabase
		.from("post_comments")
		.select(
			"id, post_id, type, content, created_at, author:profiles!post_comments_author_id_fkey(id, display_name, avatar_url, role)",
		)
		.eq("post_id", postId)
		.order("created_at", { ascending: true });

	if (commentError) {
		console.error("commentError:", commentError);
		return NextResponse.json({ error: "commentError: " + commentError.message }, { status: 500 });
	}

	const commentIds = (commentRows ?? []).map((row) => row.id);
	let allCommentSources: any[] = [];
	if (commentIds.length > 0) {
		const { data: sourcesData } = await supabase
			.from("comment_sources")
			.select("id, comment_id, title, url, is_verified")
			.in("comment_id", commentIds);
		allCommentSources = sourcesData ?? [];
	}

	const comments = (commentRows ?? [])
		.map((row) => {
			const rowSources = allCommentSources.filter(s => s.comment_id === row.id);
			return mapDbCommentToUi({ ...row, sources: rowSources });
		})
		.filter((item): item is PostComment => item !== null);

	const { data: reviewRows, error: reviewError } = await supabase
		.from("expert_reviews")
		.select("average_score")
		.eq("post_id", postId);

	if (reviewError) {
		console.error("reviewError:", reviewError);
		return NextResponse.json({ error: "reviewError: " + reviewError.message }, { status: 500 });
	}

	const scores = (reviewRows ?? [])
		.map((row) => (isRecord(row) ? row.average_score : null))
		.filter((score): score is number => typeof score === "number");

	const supported = scores.filter((score) => score >= 3).length;
	const disputed = scores.filter((score) => score < 3).length;
	const total = supported + disputed;
	const leaning =
		total === 0 || supported === disputed
			? "NEUTRAL"
			: supported > disputed
				? "SUPPORTED"
				: "DISPUTED";

	return NextResponse.json({
		post: {
			...post,
			stats: {
				...post.stats,
				reactions: resolvedReactionsCount,
			},
			consensus: {
				supported,
				disputed,
				total,
				leaning,
			},
		},
		comments,
	});
}
