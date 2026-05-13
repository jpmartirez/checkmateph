import React from "react";
import { UserProfile } from "@/components/profile/profile-types";
import { Button } from "@/components/ui/button";

interface ProfileNavProps {
	profile: UserProfile;
	activeTab: string;
	onTabChange: (tab: string) => void;
}

export const ProfileNav = ({
	profile,
	activeTab,
	onTabChange,
}: ProfileNavProps) => {
	const isCandidate = profile.role === "CANDIDATE";

	const tabs = ["Posts"];
	if (isCandidate) {
		tabs.push("Community Discussion");
	}
	tabs.push("About");

	return (
		<div className="max-w-5xl mx-auto px-4 md:px-6 mt-2 sm:mt-0">
			<nav className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b-2 border-transparent">
				{tabs.map((tab) => (
					<Button
						key={tab}
						variant="ghost"
						onClick={() => onTabChange(tab)}
						className={`relative rounded-none px-4 py-6 font-semibold hover:bg-transparent ${
							activeTab === tab
								? "text-purple-400"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						{tab}
						{activeTab === tab && (
							<div className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-purple-500" />
						)}
					</Button>
				))}
			</nav>
		</div>
	);
};
