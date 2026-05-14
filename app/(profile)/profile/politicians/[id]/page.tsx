import { notFound } from "next/navigation";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import { POLITICIANS } from "@/components/main/politicians/politician-data";
import type { Politician } from "@/components/main/politicians/politician-types";
import type { UserProfile } from "@/components/profile/profile-types";
import type { Post } from "@/components/main/feed/feed-types";



const COVER_IMAGES: Record<string, string> = {
	executive:
		"https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop",
	legislative:
		"https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1200&auto=format&fit=crop",
	local:
		"https://images.unsplash.com/photo-1486325212027-8081e485255e?q=80&w=1200&auto=format&fit=crop",
	judiciary:
		"https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop",
};




const MOCK_STATS: Record<
	string,
	{
		experienceYears: number;
		billsAuthored: number;
		verifiedClaimsCount: number;
		followersCount: string;
		integrityScore: number;
	}
> = {
	"ferdinand-marcos-jr": {
		experienceYears: 12,
		billsAuthored: 48,
		verifiedClaimsCount: 23,
		followersCount: "2.4M",
		integrityScore: 68,
	},
	"sara-duterte": {
		experienceYears: 8,
		billsAuthored: 31,
		verifiedClaimsCount: 15,
		followersCount: "1.8M",
		integrityScore: 72,
	},
	"francis-escudero": {
		experienceYears: 18,
		billsAuthored: 124,
		verifiedClaimsCount: 41,
		followersCount: "890k",
		integrityScore: 81,
	},
	"martin-romualdez": {
		experienceYears: 14,
		billsAuthored: 87,
		verifiedClaimsCount: 29,
		followersCount: "720k",
		integrityScore: 74,
	},
	"risa-hontiveros": {
		experienceYears: 10,
		billsAuthored: 96,
		verifiedClaimsCount: 52,
		followersCount: "1.1M",
		integrityScore: 88,
	},
	"benhur-abalos": {
		experienceYears: 9,
		billsAuthored: 22,
		verifiedClaimsCount: 18,
		followersCount: "540k",
		integrityScore: 76,
	},
	"joy-belmonte": {
		experienceYears: 7,
		billsAuthored: 18,
		verifiedClaimsCount: 14,
		followersCount: "420k",
		integrityScore: 83,
	},
	"vico-sotto": {
		experienceYears: 6,
		billsAuthored: 15,
		verifiedClaimsCount: 31,
		followersCount: "1.3M",
		integrityScore: 92,
	},
	"gwendolyn-garcia": {
		experienceYears: 16,
		billsAuthored: 34,
		verifiedClaimsCount: 19,
		followersCount: "380k",
		integrityScore: 79,
	},
	"lani-mercado": {
		experienceYears: 5,
		billsAuthored: 12,
		verifiedClaimsCount: 8,
		followersCount: "290k",
		integrityScore: 71,
	},
	"nancy-binay": {
		experienceYears: 12,
		billsAuthored: 67,
		verifiedClaimsCount: 28,
		followersCount: "510k",
		integrityScore: 75,
	},
	"ramon-revilla-jr": {
		experienceYears: 18,
		billsAuthored: 89,
		verifiedClaimsCount: 22,
		followersCount: "620k",
		integrityScore: 69,
	},
};



function makeMockPosts(politician: Politician): Post[] {
	return [
		{
			id: `${politician.id}-post-1`,
			author: {
				id: politician.id,
				name: politician.name,
				avatarUrl: politician.imageUrl,
			},
			timeAgo: "2 days ago",
			contentText:
				"We continue to push forward initiatives that benefit every Filipino. Our office remains committed to transparency and accountability in all government programs.",
			category: "OPINION",
			stats: { reactions: 428, comments: 32, shares: 67, references: 0 },
		},
		{
			id: `${politician.id}-post-2`,
			author: {
				id: politician.id,
				name: politician.name,
				avatarUrl: politician.imageUrl,
			},
			timeAgo: "5 days ago",
			contentText:
				"Our latest program has reached over 500,000 beneficiaries across the country. The data shows a 12% improvement in service delivery compared to last year.",
			category: "CLAIM",
			status: ["UNDER_REVIEW"],
			stats: { reactions: 241, comments: 18, shares: 44, references: 2 },
		},
		{
			id: `${politician.id}-post-3`,
			author: {
				id: politician.id,
				name: politician.name,
				avatarUrl: politician.imageUrl,
			},
			timeAgo: "1 week ago",
			contentText:
				"Infrastructure development remains one of our top priorities. We have allocated additional funds to accelerate road, bridge, and flood control projects in underserved areas.",
			category: "CLAIM",
			status: ["VERIFIED_SOURCE", "SUPPORTED"],
			stats: { reactions: 189, comments: 11, shares: 29, references: 3 },
		},
	];
}



export default async function PoliticianProfilePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	const politician = POLITICIANS.find((p) => p.id === id);
	if (!politician) notFound();

	const stats = MOCK_STATS[id] ?? {
		experienceYears: 5,
		billsAuthored: 20,
		verifiedClaimsCount: 10,
		followersCount: "100k",
		integrityScore: 75,
	};

	const relatedCandidates = POLITICIANS.filter((p) => p.id !== id)
		.slice(0, 3)
		.map((p) => ({
			id: p.id,
			name: p.name,
			avatarUrl: p.imageUrl,
			isVerified: p.verified,
			integrityScore: MOCK_STATS[p.id]?.integrityScore ?? 75,
		}));

	const communityPosts: Post[] = [
		{
			id: `community-${politician.id}-1`,
			author: {
				id: "community-user-1",
				name: "Juan dela Cruz",
				avatarUrl: "https://i.pravatar.cc/150?u=juan",
			},
			timeAgo: "3 hours ago",
			contentText: `${politician.name} recently announced new initiatives. Do you think these will actually benefit ordinary Filipinos?`,
			category: "OPINION",
			stats: { reactions: 54, comments: 8, shares: 5, references: 0 },
		},
		{
			id: `community-${politician.id}-2`,
			author: {
				id: "community-user-2",
				name: "Ana Reyes",
				avatarUrl: "https://i.pravatar.cc/150?u=ana",
			},
			timeAgo: "1 day ago",
			contentText: `According to official records, ${politician.name}'s office has a budget utilization rate of 94% for this fiscal year.`,
			category: "CLAIM",
			status: ["VERIFIED_SOURCE"],
			stats: { reactions: 132, comments: 14, shares: 22, references: 1 },
		},
	];

	const profile: UserProfile = {
		id: politician.id,
		name: politician.name,
		role: "CANDIDATE",
		avatarUrl: politician.imageUrl,
		coverUrl:
			COVER_IMAGES[politician.branch] ?? COVER_IMAGES.executive,
		isVerified: politician.verified,
		followersCount: stats.followersCount,
		subtitle: `${politician.role} | ${politician.office}`,
		introText: `"${politician.knownFor ?? "Dedicated to public service and the welfare of all Filipinos."}"`,
		experienceYears: stats.experienceYears,
		billsAuthored: stats.billsAuthored,
		verifiedClaimsCount: stats.verifiedClaimsCount,
		education: politician.education,
		bio:
			politician.background ??
			"A dedicated public servant committed to improving the lives of Filipinos through effective governance.",
		relatedCandidates,
		posts: makeMockPosts(politician),
		communityPosts,
	};

	return <ProfilePageClient profile={profile} />;
}
