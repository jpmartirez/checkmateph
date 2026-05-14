export type PostCategory = "OPINION" | "CLAIM";
export type PostStatus =
	| "SUPPORTED"
	| "DEBATED"
	| "DISPUTED"
	| "UNDER_REVIEW"
	| "VERIFIED";

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
