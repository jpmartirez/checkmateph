import { UserProfile } from "./profile-types";
import { MOCK_POSTS } from "../main/feed/feed-data";

export const MOCK_PROFILES: Record<string, UserProfile> = {
	"maria-clara": {
		id: "maria-clara",
		name: "Senator Maria Clara",
		role: "CANDIDATE",
		avatarUrl: "https://i.pravatar.cc/150?u=maria",
		coverUrl:
			"https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1000&auto=format&fit=crop",
		isVerified: true,
		followersCount: "12.4k",
		subtitle: "Incumbent Senator | Republic of the Philippines",
		introText:
			'"Dedicated to transparency in governance and accessible healthcare for all Filipinos."',
		experienceYears: 12,
		billsAuthored: 142,
		verifiedClaimsCount: 88,
		education: "Graduate of Constitutional Law",
		bio: "Senator Maria Clara has dedicated over a decade to public service, focusing on transparency in governance and accessible healthcare. She has championed numerous bills aimed at digital literacy and civic accountability.",
		relatedCandidates: [
			{
				id: "jose-rizal",
				name: "Rep. Jose Rizal II",
				avatarUrl: "https://i.pravatar.cc/150?u=jose",
				isVerified: true,
				integrityScore: 91,
			},
			{
				id: "elena-adarna",
				name: "Sen. Elena Adarna",
				avatarUrl: "https://i.pravatar.cc/150?u=elena",
				isVerified: true,
				integrityScore: 82,
			},
		],
		posts: [
			{
				...MOCK_POSTS[0],
				id: "post-1",
				author: {
					id: "maria-clara",
					name: "Senator Maria Clara",
					avatarUrl: "https://i.pravatar.cc/150?u=maria",
				},
				category: "CLAIM",
				contentText:
					"The new healthcare initiative has reached over 2 million beneficiaries in rural areas since its launch last quarter.",
				status: ["SUPPORTED"],
				stats: {
					reactions: 352,
					comments: 15,
					shares: 36,
					references: 3,
				},
			},
			{
				...MOCK_POSTS[1],
				id: "post-2",
				author: {
					id: "maria-clara",
					name: "Senator Maria Clara",
					avatarUrl: "https://i.pravatar.cc/150?u=maria",
				},
				category: "OPINION",
				contentText:
					"Fact-checking should not only correct false information. It should also teach people how to evaluate sources, compare claims, and understand why misinformation spreads.",
				status: [],
				stats: {
					reactions: 89,
					comments: 4,
					shares: 15,
					references: 0,
				},
			},
			{
				...MOCK_POSTS[0],
				id: "post-3",
				author: {
					id: "maria-clara",
					name: "Senator Maria Clara",
					avatarUrl: "https://i.pravatar.cc/150?u=maria",
				},
				category: "CLAIM",
				image: undefined,
				contentText:
					'"Inflation rates have dropped by 5% compared to the same period last year."',
				status: [],
				stats: {
					reactions: 0,
					comments: 0,
					shares: 0,
					references: 0,
				},
			},
		],
		communityPosts: [
			{
				...MOCK_POSTS[0],
				id: "post-4",
				author: {
					id: "jeff",
					name: "Jeff Cabalsa",
					avatarUrl: "https://i.pravatar.cc/150?u=jeff",
				},
				category: "CLAIM",
				status: ["SUPPORTED", "DEBATED"],
			},
		],
	},
	dave: {
		id: "dave",
		name: "Dave Capistrano",
		role: "NORMAL",
		avatarUrl: "https://i.pravatar.cc/150?u=dave",
		coverUrl:
			"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000",
		isVerified: false,
		followersCount: "12.4k",
		subtitle: "Community Member",
		introText:
			'"Passionate on using technology and community discussions to make public information easier to verify"',
		joinDate: "March 2026",
		verifiedClaimsCount: 36,
		education: "Bachelor of Science in Computer Science",
		bio: "A Computer Science student with a strong interest in building practical digital solutions through software development, database management, and data analysis.",
		posts: [
			{
				...MOCK_POSTS[0],
				id: "post-5",
				author: {
					id: "dave",
					name: "Dave Capistrano",
					avatarUrl: "https://i.pravatar.cc/150?u=dave",
				},
				category: "CLAIM",
				contentText:
					"Several public infrastructure projects are being questioned because citizens claim that flood control funds were spent, yet some areas continue to experience severe flooding.",
				status: ["SUPPORTED"],
				image: undefined,
				stats: {
					reactions: 352,
					comments: 15,
					shares: 36,
					references: 0,
				},
			},
			{
				...MOCK_POSTS[1],
				id: "post-6",
				author: {
					id: "dave",
					name: "Dave Capistrano",
					avatarUrl: "https://i.pravatar.cc/150?u=dave",
				},
				category: "OPINION",
				contentText:
					"Fact-checking should not only correct false information. It should also teach people how to evaluate sources, compare claims, and understand why misinformation spreads.",
				status: [],
				stats: {
					reactions: 89,
					comments: 4,
					shares: 15,
					references: 0,
				},
			},
			{
				...MOCK_POSTS[0],
				id: "post-7",
				author: {
					id: "dave",
					name: "Dave Capistrano",
					avatarUrl: "https://i.pravatar.cc/150?u=dave",
				},
				category: "CLAIM",
				image: undefined,
				contentText:
					"Some citizens claim that certain politicians only become visible during election season, even though they rarely provide updates about their projects, attendance, or public service work during their actual term.",
				status: ["SUPPORTED"],
				stats: {
					reactions: 222,
					comments: 59,
					shares: 30,
					references: 0,
				},
			},
		],
	},
};
