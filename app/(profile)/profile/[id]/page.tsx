"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { MOCK_PROFILES } from "@/components/profile/profile-data";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { ProfileBody } from "@/components/profile/ProfileBody";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
	const params = useParams();
	const id = params.id as string;
	const profile = MOCK_PROFILES[id] || MOCK_PROFILES["maria-clara"];
	const [activeTab, setActiveTab] = useState("Posts");

	if (!profile) {
		return <div className="p-8 text-center">Profile not found</div>;
	}

	return (
		<div className="w-full pb-20 relative">
			<ProfileHeader profile={profile} />
			<ProfileNav
				profile={profile}
				activeTab={activeTab}
				onTabChange={setActiveTab}
			/>
			<ProfileBody profile={profile} activeTab={activeTab} />

			{/* Floating Action Button - like in the screenshot for normal user */}
			{profile.role === "NORMAL" && (
				<div className="fixed bottom-6 right-6 z-50">
					<Button
						size="icon"
						className="w-14 h-14 rounded-full bg-[#d08bff] hover:bg-[#b06be0] text-black shadow-lg"
					>
						<Pencil className="w-6 h-6" />
					</Button>
				</div>
			)}
		</div>
	);
}
