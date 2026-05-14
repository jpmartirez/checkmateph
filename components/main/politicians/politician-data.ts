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
		id: "ferdinand-marcos-jr",
		name: "Ferdinand Marcos Jr.",
		role: "President of the Philippines",
		office: "Office of the President",
		branch: "executive",
		location: "national",
		imageUrl: "/officials/ferdinand-marcos-jr.jpg",
		verified: true,
		background:
			"Former Ilocos Norte governor, congressman, and senator who became the 17th President of the Philippines in 2022. He is the son of former President Ferdinand Marcos Sr. and former First Lady Imelda Marcos.",
		education:
			"Studied at University of Oxford and received a Special Diploma in Social Studies. He also attended the Wharton School of the University of Pennsylvania but did not complete the MBA program.",
		knownFor:
			"Infrastructure projects, economic programs, and digitalization initiatives under his administration.",
	},
	{
		id: "sara-duterte",
		name: "Sara Duterte",
		role: "Vice President of the Philippines",
		office: "Office of the Vice President",
		branch: "executive",
		location: "national",
		imageUrl: "/officials/sara-duterte.jpg",
		verified: true,
		background:
			"Former mayor of Davao City known for her strong leadership style and local governance programs. She is the daughter of former President Rodrigo Duterte.",
		education:
			"Earned a degree in Respiratory Therapy from San Pedro College and completed law studies at San Sebastian College–Recoletos.",
		knownFor:
			"Education advocacy, peace and order programs, and youth-related initiatives.",
	},
	{
		id: "francis-escudero",
		name: "Francis Escudero",
		role: "Senate President",
		office: "Senate of the Philippines",
		branch: "legislative",
		location: "national",
		imageUrl: "/officials/francis-escudero.jpg",
		verified: true,
		background:
			"Experienced lawyer and legislator who served as representative of Sorsogon before becoming senator.",
		education:
			"Graduated in Political Science from University of the Philippines Diliman and studied law there as well.",
		knownFor:
			"Legislative reforms, public policy discussions, and budget-related measures.",
	},
	{
		id: "martin-romualdez",
		name: "Martin Romualdez",
		role: "Speaker of the House of Representatives",
		office: "House of Representatives",
		branch: "legislative",
		location: "national",
		imageUrl: "/officials/martin-romualdez.jpg",
		verified: true,
		background:
			"Leyte representative and cousin of President Marcos Jr. who leads the House of Representatives.",
		education:
			"Studied at Cornell University and earned his law degree from University of the Philippines.",
		knownFor:
			"Supporting administration bills and leading legislative priorities in Congress.",
	},
	{
		id: "risa-hontiveros",
		name: "Risa Hontiveros",
		role: "Senator",
		office: "Senate of the Philippines",
		branch: "legislative",
		location: "national",
		imageUrl: "/officials/risa-hontiveros.png",
		verified: true,
		background:
			"Former journalist and activist recognized for advocating women's rights, healthcare, and social justice.",
		education:
			"Graduated in Social Sciences from Ateneo de Manila University.",
		knownFor:
			"Mental health advocacy, gender equality laws, and healthcare reforms.",
	},
	{
		id: "benhur-abalos",
		name: "Benhur Abalos",
		role: "Secretary of the Interior and Local Government",
		office: "Department of the Interior and Local Government",
		branch: "executive",
		location: "national",
		imageUrl: "/officials/benhur-abalos.jpg",
		verified: true,
		background:
			"Former mayor of Mandaluyong and former MMDA chairman with experience in local governance.",
		education:
			"Graduated in Business Administration from De La Salle University.",
		knownFor:
			"Traffic management programs, local government coordination, and public safety initiatives.",
	},
	{
		id: "joy-belmonte",
		name: "Joy Belmonte",
		role: "Mayor of Quezon City",
		office: "Quezon City Hall",
		branch: "local",
		location: "metro-manila",
		imageUrl: "/officials/joy-belmonte.jpg",
		verified: true,
		background:
			"Former vice mayor who continued her family's involvement in public service.",
		education:
			"Graduated in Public Administration from University of the Philippines Diliman.",
		knownFor:
			"Environmental programs, women's welfare projects, and urban development initiatives.",
	},
	{
		id: "vico-sotto",
		name: "Vico Sotto",
		role: "Mayor of Pasig",
		office: "Pasig City Hall",
		branch: "local",
		location: "metro-manila",
		imageUrl: "/officials/vico-sotto.jpg",
		verified: true,
		background:
			"Young reform-oriented leader and son of actor-comedian Vic Sotto and actress Coney Reyes.",
		education:
			"Graduated in Political Science from Ateneo de Manila University.",
		knownFor:
			"Transparency, anti-corruption efforts, and modernization of local government services.",
	},
	{
		id: "gwendolyn-garcia",
		name: "Gwendolyn Garcia",
		role: "Governor of Cebu",
		office: "Cebu Provincial Capitol",
		branch: "local",
		location: "visayas",
		imageUrl: "/officials/gwendolyn-garcia.jpg",
		verified: true,
		background:
			"Veteran politician who has served multiple terms as Cebu governor and congresswoman.",
		education: "Studied at University of San Carlos.",
		knownFor:
			"Tourism development, provincial infrastructure projects, and economic growth programs.",
	},
	{
		id: "lani-mercado",
		name: "Lani Mercado",
		role: "Mayor of Bacoor",
		office: "Bacoor City Hall",
		branch: "local",
		location: "metro-manila",
		imageUrl: "/officials/lani-mercado.jpg",
		verified: true,
		background:
			"Former actress and wife of Senator Bong Revilla Jr. who later entered politics.",
		education: "Attended Colegio San Agustin-Bacolod.",
		knownFor:
			"Community outreach projects and local development programs in Bacoor.",
	},
	{
		id: "nancy-binay",
		name: "Nancy Binay",
		role: "Senator",
		office: "Senate of the Philippines",
		branch: "legislative",
		location: "national",
		imageUrl: "/officials/nancy-binay.jpg",
		verified: true,
		background:
			"Daughter of former Vice President Jejomar Binay and active in public service programs before entering the Senate.",
		education: "Graduated from University of the Philippines Diliman.",
		knownFor:
			"Advocacy for tourism, education, and local business support.",
	},
	{
		id: "ramon-revilla-jr",
		name: "Ramon Revilla Jr.",
		role: "Senator",
		office: "Senate of the Philippines",
		branch: "legislative",
		location: "national",
		imageUrl: "/officials/ramon-revilla-jr.png",
		verified: true,
		background:
			"Former actor who transitioned into politics and served multiple terms in the Senate.",
		education: "Studied at Far Eastern University.",
		knownFor:
			"Public service programs, entertainment industry influence, and social assistance initiatives.",
	},
];
