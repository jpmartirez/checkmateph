import React from "react";
import { UserProfile } from "@/components/profile/profile-types";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PostCard } from "@/components/main/feed/PostCard";
import {
	Flag,
	FileText,
	CheckCircle2,
	GraduationCap,
	ShieldCheck,
	Image as ImageIcon,
	MessageSquare,
	Megaphone,
} from "lucide-react";
import Image from "next/image";

interface ProfileBodyProps {
	profile: UserProfile;
	activeTab: string;
}

export const ProfileBody = ({ profile, activeTab }: ProfileBodyProps) => {
	const isCandidate = profile.role === "CANDIDATE";

	return (
		<div className="max-w-5xl mx-auto px-4 md:px-6 py-6 border-t border-border/50">
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Sidebar */}
				<div className="space-y-6">
					{/* Intro Card */}
					<Card className="bg-card/50 border-border/50">
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">Intro</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="p-4 rounded-md border border-border/50 text-sm text-center text-muted-foreground italic bg-secondary/10">
								{profile.introText}
							</div>

							<div className="space-y-3 text-sm text-muted-foreground">
								{profile.joinDate && (
									<div className="flex items-center gap-3">
										<Flag className="w-4 h-4 text-purple-400" />
										<span>Joined {profile.joinDate}</span>
									</div>
								)}
								{profile.experienceYears !== undefined && (
									<div className="flex items-center gap-3">
										<Flag className="w-4 h-4 text-purple-400" />
										<span>
											Served as {profile.subtitle.split(" | ")[0]} for{" "}
											{profile.experienceYears} years
										</span>
									</div>
								)}
								{profile.billsAuthored !== undefined && (
									<div className="flex items-center gap-3">
										<FileText className="w-4 h-4 text-yellow-500" />
										<span>
											Authored{" "}
											<span className="font-semibold text-foreground">
												{profile.billsAuthored}
											</span>{" "}
											Bills during current term
										</span>
									</div>
								)}
								{profile.verifiedClaimsCount !== undefined && (
									<div className="flex items-center gap-3">
										<CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
										<span>
											{isCandidate ? "Has" : "Posted"}{" "}
											<span className="font-semibold text-foreground">
												{profile.verifiedClaimsCount}
											</span>{" "}
											Verified Claims{isCandidate ? " on platform" : ""}
										</span>
									</div>
								)}
								{profile.education && (
									<div className="flex items-center gap-3">
										<GraduationCap className="w-4 h-4 text-yellow-500" />
										<span>{profile.education}</span>
									</div>
								)}
							</div>
						</CardContent>
					</Card>

					{/* Bio Card */}
					<Card className="bg-card/50 border-border/50">
						<CardHeader className="pb-3">
							<CardTitle className="text-lg">Personal Bio</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground leading-relaxed">
								{profile.bio}
							</p>
						</CardContent>
					</Card>

					{/* Role Specific Side Cards */}
					{isCandidate && profile.relatedCandidates && (
						<Card className="bg-card/50 border-border/50">
							<CardHeader className="pb-3 flex flex-row items-center justify-between">
								<CardTitle className="text-lg">Related Candidates</CardTitle>
								<Button
									variant="link"
									className="px-0 text-purple-400 h-auto font-normal"
								>
									See all
								</Button>
							</CardHeader>
							<CardContent className="space-y-4">
								{profile.relatedCandidates.map((candidate) => (
									<div
										key={candidate.id}
										className="flex items-center justify-between"
									>
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 relative rounded-full overflow-hidden shrink-0">
												<Image
													src={candidate.avatarUrl}
													alt={candidate.name}
													fill
													className="object-cover"
												/>
											</div>
											<div>
												<div className="text-sm font-semibold flex items-center gap-1">
													{candidate.name}
													{candidate.isVerified && (
														<CheckBadge className="w-4 h-4 text-purple-600" />
													)}
												</div>
												<div className="text-[10px] font-bold text-yellow-500 tracking-wider">
													{candidate.integrityScore}% INTEGRITY
												</div>
											</div>
										</div>
										<Button
											size="sm"
											variant="secondary"
											className="h-7 text-xs bg-secondary/50"
										>
											View
										</Button>
									</div>
								))}
							</CardContent>
						</Card>
					)}

					{!isCandidate && (
						<Card className="bg-card/50 border-border/50">
							<CardHeader className="pb-3">
								<CardTitle className="text-lg">Verification Status</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex gap-4">
									<ShieldCheck className="w-10 h-10 text-purple-600 shrink-0" />
									<div>
										<div className="font-semibold text-sm">
											Join the Collective
										</div>
										<div className="text-xs text-muted-foreground mt-1 mb-3 leading-relaxed">
											Become a verified contributor and help secure national
											information integrity.
										</div>
										<Button className="w-full bg-[#d08bff] hover:bg-[#b06be0] text-black font-semibold h-8 text-xs">
											Verify Credentials Now
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Main Content Area */}
				<div className="lg:col-span-2 space-y-6">
					{activeTab === "Community Discussion" && isCandidate && (
						<div className="bg-card/50 border border-border/50 rounded-xl p-4 flex items-center gap-4">
							<div className="w-10 h-10 relative rounded-full overflow-hidden shrink-0 bg-muted">
								{/* Current User Avatar Placeholder - normally from auth context */}
								<Image
									src="https://i.pravatar.cc/150?u=current_user"
									alt="You"
									fill
									className="object-cover"
								/>
							</div>
							<div className="flex-1 rounded-full bg-secondary/20 border border-border/50 px-4 py-2 flex items-center justify-between text-muted-foreground cursor-text">
								<span className="text-sm">
									Create A Post about {profile.name.split(" ").pop()}.
								</span>
								<div className="flex items-center gap-3">
									<ImageIcon className="w-4 h-4 text-green-500" />
									<div className="flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded text-xs text-foreground">
										<MessageSquare className="w-3 h-3" />
										Opinion
									</div>
									<div className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs">
										<Megaphone className="w-3 h-3" />
										Claim
									</div>
								</div>
							</div>
						</div>
					)}

					{/* Posts Header */}
					{(activeTab === "Posts" || activeTab === "Community Discussion") && (
						<div className="flex items-center justify-between p-4 bg-card/50 border border-border/50 rounded-xl">
							<h2 className="text-lg font-bold">Posts</h2>
							<div className="flex gap-2">
								<Button
									variant="secondary"
									size="sm"
									className="bg-secondary/40 text-xs"
								>
									<Flag className="w-3 h-3 mr-2" /> Filters
								</Button>
								<Button
									variant="secondary"
									size="sm"
									className="bg-secondary/40 text-xs"
								>
									<CheckCircle2 className="w-3 h-3 mr-2" /> Manage
								</Button>
							</div>
						</div>
					)}

					{/* Feed */}
					<div className="space-y-4">
						{activeTab === "Posts" &&
							profile.posts.map((post) => (
								<PostCard key={post.id} post={post} />
							))}

						{activeTab === "Community Discussion" &&
							profile.communityPosts?.map((post) => (
								<PostCard key={post.id} post={post} />
							))}

						{activeTab === "About" && (
							<Card className="bg-card/50 border-border/50">
								<CardHeader>
									<CardTitle>About Content Here</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground text-sm">
										Detailed about section content goes here.
									</p>
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

// Helper inside the file, you can move CheckBadge to icons.ts if not there
const CheckBadge = ({ className }: { className?: string }) => (
	<svg
		className={className}
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="currentColor"
	>
		<path
			fillRule="evenodd"
			d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
			clipRule="evenodd"
		/>
	</svg>
);
