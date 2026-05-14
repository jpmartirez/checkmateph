export type PoliticianBranch =
	| "executive"
	| "legislative"
	| "judiciary"
	| "local";
export type PoliticianLocation =
	| "national"
	| "metro-manila"
	| "north-luzon"
	| "visayas"
	| "mindanao";

export type PoliticianBranchFilter = PoliticianBranch | "all";
export type PoliticianLocationFilter = PoliticianLocation | "all";

export type Politician = {
	id: string;
	name: string;
	role: string;
	office: string;
	branch: PoliticianBranch;
	location: PoliticianLocation;
	imageUrl: string;
	verified: boolean;
	background?: string;
	education?: string;
	knownFor?: string;
};
