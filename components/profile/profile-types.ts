export type UserRole = "CANDIDATE" | "NORMAL";

import { Post } from "@/components/main/feed/feed-types";

export interface UserProfile {
	id: string;
	name: string;
	role: UserRole;
	avatarUrl: string;
	coverUrl: string;
	isVerified: boolean;
	followersCount: string;
	subtitle: string;

	// Sidebar Info
	introText: string;
	joinDate?: string;
	verifiedClaimsCount?: number;
	education?: string;
	experienceYears?: number;
	billsAuthored?: number;

	bio: string;

	relatedCandidates?: {
		id: string;
		name: string;
		avatarUrl: string;
		isVerified: boolean;
		integrityScore: number;
	}[];

	posts: Post[];
	communityPosts?: Post[];
}
