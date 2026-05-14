export type PostCategory = "OPINION" | "CLAIM";

/**
 * Status tags that can appear on a post.
 * OPINION posts: no status tags.
 * CLAIM posts: start as UNDER_REVIEW; gain VERIFIED_SOURCE if any source is in the registry;
 *   gain DEBATED when a COUNTER_CLAIM comment is added; gain SUPPORTED/DISPUTED after expert review.
 * INCOHERENT_SOURCE is applied by AI verification (future integration).
 */
export type PostStatus =
	| "UNDER_REVIEW"
	| "VERIFIED_SOURCE"
	| "INCOHERENT_SOURCE"
	| "SUPPORTED"
	| "DISPUTED"
	| "DEBATED";

export type CommentType = "OPINION" | "CLAIM" | "COUNTER_CLAIM";

export interface PostAuthor {
	id: string;
	name: string;
	avatarUrl: string;
	role?: string;
}

export interface Post {
	id: string;
	author: PostAuthor;
	timeAgo: string;
	contentText: string;
	image?: string;
	status?: PostStatus[];
	category: PostCategory;
	sources?: PostSource[];
	consensus?: PostConsensus;
	isLikedByCurrentUser?: boolean;
	stats: {
		reactions: number;
		comments: number;
		shares: number;
		references: number;
	};
}

export interface PostSource {
	id: string;
	title: string;
	url: string;
	isVerified?: boolean;
}

export interface CommentSource {
	id: string;
	title: string;
	url: string;
	isVerified?: boolean;
}

export interface PostComment {
	id: string;
	postId: string;
	author: PostAuthor;
	content: string;
	type: CommentType;
	/** INCOHERENT_SOURCE applied when AI detects unrelated source (future). */
	status?: PostStatus[];
	createdAt: string;
	sources?: CommentSource[];
}

export interface PostConsensus {
	supported: number;
	disputed: number;
	total: number;
	leaning: "SUPPORTED" | "DISPUTED" | "NEUTRAL";
}

export interface Expert {
	id: string;
	name: string;
	avatarUrl: string;
	expertise: string;
}
