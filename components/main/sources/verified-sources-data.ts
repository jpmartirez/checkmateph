export type SourceCategory = "news" | "government" | "agency";
export type SourceTab = "all" | SourceCategory;

export interface SourceItem {
	id: number;
	name: string;
	url: string;
	description: string;
	category: SourceCategory;
	logo: string;
}

export const SOURCES: SourceItem[] = [
	{
		id: 1,
		name: "GMA Network",
		url: "gmanetwork.com",
		description:
			"The Philippines' leading news and entertainment network, providing up-to-the-minute news, breaking stories, and comprehensive coverage of national events.",
		category: "news",
		logo: "GMA",
	},
	{
		id: 2,
		name: "Philippine News Agency",
		url: "pna.gov.ph",
		description:
			"The official news agency of the Republic of the Philippines, serving as a clearinghouse of government information and national developments.",
		category: "agency",
		logo: "PNA",
	},
	{
		id: 3,
		name: "Official Gazette",
		url: "officialgazette.gov.ph",
		description:
			"The public journal and main publication of the Government of the Republic of the Philippines. It publishes laws, executive orders, and other government documents.",
		category: "government",
		logo: "OG",
	},
	{
		id: 4,
		name: "ABS-CBN News",
		url: "abscbnnews.com",
		description:
			"Broadcast network providing comprehensive news coverage, investigative journalism, and in-depth analysis of current events.",
		category: "news",
		logo: "ABS",
	},
	{
		id: 5,
		name: "Philippine Statistics Authority",
		url: "psa.gov.ph",
		description:
			"The national statistical office responsible for collecting, analyzing, and disseminating statistical information about the Philippines.",
		category: "agency",
		logo: "PSA",
	},
	{
		id: 6,
		name: "Bureau of Internal Revenue",
		url: "bir.gov.ph",
		description:
			"Government agency responsible for assessment and collection of national internal revenue taxes in the Philippines.",
		category: "government",
		logo: "BIR",
	},
];

export const CATEGORY_LABELS: Record<SourceCategory, string> = {
	news: "News Organizations",
	government: "Official Gazette",
	agency: "Gov Agencies",
};

export const SOURCE_TABS: Array<{ id: SourceTab; label: string }> = [
	{ id: "all", label: "All Sources" },
	{ id: "news", label: "News Organizations" },
	{ id: "government", label: "Official Gazette" },
	{ id: "agency", label: "Gov Agencies" },
];
