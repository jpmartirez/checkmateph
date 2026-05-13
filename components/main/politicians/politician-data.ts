import type {
	Politician,
	PoliticianBranch,
	PoliticianBranchFilter,
	PoliticianLocation,
	PoliticianLocationFilter,
} from "./politician-types";

export const POLITICIAN_BRANCHES: Array<{
	id: PoliticianBranchFilter;
	label: string;
}> = [
	{ id: "all", label: "All Branches" },
	{ id: "executive", label: "Executive" },
	{ id: "legislative", label: "Legislative" },
	{ id: "judiciary", label: "Judiciary" },
	{ id: "local", label: "Local Government" },
];

export const POLITICIAN_LOCATIONS: Array<{
	id: PoliticianLocationFilter;
	label: string;
}> = [
	{ id: "all", label: "Location" },
	{ id: "national", label: "National" },
	{ id: "metro-manila", label: "Metro Manila" },
	{ id: "north-luzon", label: "North Luzon" },
	{ id: "visayas", label: "Visayas" },
	{ id: "mindanao", label: "Mindanao" },
];

export const BRANCH_LABELS: Record<PoliticianBranch, string> = {
	executive: "Executive Branch",
	legislative: "Legislative Branch",
	judiciary: "Judiciary Branch",
	local: "Local Government",
};

export const LOCATION_LABELS: Record<PoliticianLocation, string> = {
	national: "National Office",
	"metro-manila": "Metro Manila",
	"north-luzon": "North Luzon",
	visayas: "Visayas",
	mindanao: "Mindanao",
};

export const POLITICIANS: Politician[] = [
	{
		id: "maya-delacruz",
		name: "Maya Dela Cruz",
		role: "Secretary of Public Services",
		office: "Department of Public Services",
		branch: "executive",
		location: "national",
		imageUrl:
			"https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80",
		verified: true,
	},
	{
		id: "adrian-santos",
		name: "Adrian Santos",
		role: "District Representative",
		office: "Central District",
		branch: "legislative",
		location: "metro-manila",
		imageUrl:
			"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
		verified: true,
	},
	{
		id: "lia-fernandez",
		name: "Lia Fernandez",
		role: "Associate Justice",
		office: "Court of Appeals",
		branch: "judiciary",
		location: "national",
		imageUrl:
			"https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
		verified: true,
	},
	{
		id: "kenneth-reyes",
		name: "Kenneth Reyes",
		role: "City Mayor",
		office: "Caloocan City",
		branch: "local",
		location: "metro-manila",
		imageUrl:
			"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
		verified: true,
	},
	{
		id: "alicia-lim",
		name: "Alicia Lim",
		role: "Provincial Governor",
		office: "Ilocos Norte",
		branch: "local",
		location: "north-luzon",
		imageUrl:
			"https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80",
		verified: false,
	},
	{
		id: "enzo-navarro",
		name: "Enzo Navarro",
		role: "Party-list Representative",
		office: "Youth Futures",
		branch: "legislative",
		location: "national",
		imageUrl:
			"https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=800&q=80",
		verified: true,
	},
	{
		id: "mira-velasco",
		name: "Mira Velasco",
		role: "Regional Administrator",
		office: "Western Visayas",
		branch: "executive",
		location: "visayas",
		imageUrl:
			"https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=800&q=80",
		verified: true,
	},
	{
		id: "rafael-diaz",
		name: "Rafael Diaz",
		role: "Provincial Board Member",
		office: "Davao del Sur",
		branch: "local",
		location: "mindanao",
		imageUrl:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
		verified: false,
	},
];
