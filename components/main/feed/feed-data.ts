import { Expert, Post } from "./feed-types";

export const MOCK_POSTS: Post[] = [
	{
		id: "p1",
		author: {
			id: "u1",
			name: "Inquirer.net",
			avatarUrl: "https://i.pravatar.cc/150?u=inquirer",
		},
		timeAgo: "2 hours ago",
		category: "CLAIM",
		status: ["SUPPORTED", "DEBATED"],
		contentText:
			"Pulse Asia: 94% of Filipinos say corruption in PH gov't is widespread. In the National Capital Region, 96 percent of respondents said corruption in the Philippines is widespread. The same view was shared by 93 percent of respondents in Balance Luzon, and 94 percent in Mindanao.",
		image:
			"https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1000&auto=format&fit=crop", // placeholder image representing rally/posters
		stats: {
			reactions: 124,
			comments: 45,
			shares: 12,
			references: 3,
		},
	},
	{
		id: "p2",
		author: {
			id: "u2",
			name: "Ruiz Consolacion",
			avatarUrl: "https://i.pravatar.cc/150?u=ruiz",
		},
		timeAgo: "5 hours ago",
		category: "OPINION",
		status: ["DISPUTED"],
		contentText:
			'Another issue buried by mainstream media. Local celebrity allegedly linked to secret anti-government meetings according to "anonymous sources." Why is mainstream media hiding this? #WakeUpPhilippines',
		stats: {
			reactions: 89,
			comments: 102,
			shares: 34,
			references: 0,
		},
	},
	{
		id: "p3",
		author: {
			id: "u3",
			name: "Aljazeera",
			avatarUrl: "https://i.pravatar.cc/150?u=aljazeera",
		},
		timeAgo: "Yesterday",
		category: "CLAIM",
		status: ["UNDER_REVIEW"],
		contentText:
			"Philippine Congress impeaches VP Sara Duterte for a second time The Philippine House of Representatives has voted overwhelmingly to impeach Vice President Sara Duterte for the second time, even as her impending trial remains in question after her allies wrested control of the Philippine Senate.",
		image:
			"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwNus5gqVUHJScZly1lytCRLEBkwxl0BvwBA&s", // placeholder
		stats: {
			reactions: 124,
			comments: 88,
			shares: 12,
			references: 3,
		},
	},
];

export const MOCK_EXPERTS: Expert[] = [
	{
		id: "e1",
		name: "Dr. Elena Santos",
		expertise: "Macroeconomist",
		avatarUrl: "https://i.pravatar.cc/150?u=elena",
	},
	{
		id: "e2",
		name: "Atty. Mateo Ruiz",
		expertise: "Constitutional Law",
		avatarUrl: "https://i.pravatar.cc/150?u=mateo",
	},
	{
		id: "e3",
		name: "Sofia Mercado",
		expertise: "Investigative Journalist",
		avatarUrl: "https://i.pravatar.cc/150?u=sofia",
	},
];
