"use client";

import React, { useState } from "react";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileNav } from "@/components/profile/ProfileNav";
import { ProfileBody } from "@/components/profile/ProfileBody";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/components/profile/profile-types";
import { EditProfileModal } from "@/components/profile/EditProfileModal";

export default function ProfilePageClient({
	profile,
	isOwnProfile = false,
}: {
	profile: UserProfile;
	isOwnProfile?: boolean;
}) {
	const [activeTab, setActiveTab] = useState("Posts");
	const [editOpen, setEditOpen] = useState(false);

	return (
		<div className="w-full pb-20 relative">
			<ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
			<ProfileNav
				profile={profile}
				activeTab={activeTab}
				onTabChange={setActiveTab}
			/>
			<ProfileBody profile={profile} activeTab={activeTab} />

			{/* Floating edit button for own profile on mobile */}
			{isOwnProfile && profile.role === "NORMAL" && (
				<>
					<div className="fixed bottom-6 right-6 z-50">
						<Button
							size="icon"
							className="w-14 h-14 rounded-full bg-[#d08bff] hover:bg-[#b06be0] text-black shadow-lg"
							onClick={() => setEditOpen(true)}
						>
							<Pencil className="w-6 h-6" />
						</Button>
					</div>
					<EditProfileModal
						open={editOpen}
						onOpenChange={setEditOpen}
						userId={profile.id}
						displayName={profile.name}
						currentAvatarUrl={profile.avatarUrl}
						currentCoverUrl={profile.coverUrl}
					/>
				</>
			)}
		</div>
	);
}
