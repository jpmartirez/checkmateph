"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/components/profile/profile-types";
import { Button } from "@/components/ui/button";
import { BadgeCheck, MoreHorizontal, UserPlus, ArrowLeft, Pencil } from "lucide-react";
import { EditProfileModal } from "@/components/profile/EditProfileModal";

interface ProfileHeaderProps {
	profile: UserProfile;
	isOwnProfile?: boolean;
}

export const ProfileHeader = ({ profile, isOwnProfile = false }: ProfileHeaderProps) => {
	const router = useRouter();
	const [editOpen, setEditOpen] = useState(false);

	return (
		<div className="w-full">
			<div className="h-64 md:h-80 w-full relative">
				<Image
					src={profile.coverUrl}
					alt="Cover"
					fill
					className="object-cover"
					priority
				/>
				<div className="absolute top-4 left-4 md:top-6 md:left-6 z-10">
					<Button
						variant="secondary"
						size="icon"
						className="rounded-full bg-black/40 hover:bg-black/60 text-white border-0 backdrop-blur-sm w-10 h-10"
						onClick={() => router.back()}
					>
						<ArrowLeft className="w-5 h-5" />
					</Button>
				</div>
			</div>

			<div className="max-w-5xl mx-auto px-4 md:px-6 relative sm:h-32">
				<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end pb-4 border-b border-border/50">
					<div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 w-full">
						<div className="w-32 h-32 md:w-40 md:h-40 relative rounded-full overflow-hidden border-4 border-background mt-[-64px] shrink-0 bg-muted">
							<Image
								src={profile.avatarUrl}
								alt={profile.name}
								fill
								className="object-cover"
							/>
						</div>

						<div className="flex-1 text-center sm:text-left mt-2 sm:mt-0 pb-1 w-full flex flex-col items-center sm:items-start">
							<div className="flex items-center gap-2">
								<h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
								{profile.isVerified && (
									<BadgeCheck className="w-6 h-6 text-purple-600 shrink-0" />
								)}
							</div>
							<div className="text-muted-foreground text-sm space-y-1">
								<div>{profile.followersCount} followers</div>
								<div className="text-xs">{profile.subtitle}</div>
							</div>
						</div>
					</div>

					<div className="flex gap-2 mt-4 sm:mt-0 w-full sm:w-auto shrink-0 justify-center sm:justify-end pb-1">
						{isOwnProfile ? (
							<>
								<Button
									variant="secondary"
									className="w-full sm:w-auto rounded-md border border-border/50 bg-secondary/20"
									onClick={() => setEditOpen(true)}
								>
									<Pencil className="w-4 h-4 mr-2" />
									Edit Profile
								</Button>
								<Button
									variant="secondary"
									size="icon"
									className="shrink-0 rounded-md bg-secondary/20"
								>
									<MoreHorizontal className="w-4 h-4" />
								</Button>
							</>
						) : (
							<>
								<Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto rounded-md px-6 text-white">
									<UserPlus className="w-4 h-4 mr-2" />
									Follow
								</Button>
								<Button
									variant="secondary"
									size="icon"
									className="shrink-0 rounded-md bg-secondary/50"
								>
									<MoreHorizontal className="w-4 h-4" />
								</Button>
							</>
						)}
					</div>
				</div>
			</div>

			{isOwnProfile && (
				<EditProfileModal
					open={editOpen}
					onOpenChange={setEditOpen}
					userId={profile.id}
					displayName={profile.name}
					currentAvatarUrl={profile.avatarUrl}
					currentCoverUrl={profile.coverUrl}
				/>
			)}
		</div>
	);
};
