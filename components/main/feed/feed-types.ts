export type PostCategory = "OPINION" | "CLAIM";
export type PostStatus =
	| "SUPPORTED"
	| "DEBATED"
	| "DISPUTED"
	| "UNDER_REVIEW"
	| "VERIFIED";

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
	stats: {
		reactions: number;
		comments: number;
		shares: number;
		references: number;
	};
}

export interface Expert {
	id: string;
	name: string;
	avatarUrl: string;
	expertise: string;
}
