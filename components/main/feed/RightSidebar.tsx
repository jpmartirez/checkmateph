import React from "react";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { MOCK_EXPERTS } from "./feed-data";

export const RightSidebar = () => {
	return (
		<aside className="w-[320px] flex-shrink-0 flex flex-col gap-6 sticky top-20">
			{/* Verified Experts Section */}
			<Card className="bg-card border-border/50">
				<CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
					<CardTitle className="text-sm font-semibold">
						Verified Experts
					</CardTitle>
					<Button variant="link" className="text-xs text-purple-400 p-0 h-auto">
						View All
					</Button>
				</CardHeader>
				<CardContent className="p-4 pt-2 flex flex-col gap-4">
					{MOCK_EXPERTS.map((expert) => (
						<div key={expert.id} className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Avatar className="h-9 w-9">
									<AvatarImage src={expert.avatarUrl} alt={expert.name} />
									<AvatarFallback>{expert.name[0]}</AvatarFallback>
								</Avatar>
								<div className="flex flex-col">
									<span className="text-sm font-medium">{expert.name}</span>
									<span className="text-xs text-muted-foreground">
										{expert.expertise}
									</span>
								</div>
							</div>
							<Button
								variant="ghost"
								className="text-xs text-purple-400 font-semibold p-0 h-auto hover:bg-transparent hover:text-purple-300"
							>
								Follow
							</Button>
						</div>
					))}
				</CardContent>
			</Card>

			{/* Verification Status Section */}
			<Card className="bg-card border-border/50 text-center flex flex-col items-center p-6">
				<div className="text-sm font-semibold self-start mb-4">
					Verification Status
				</div>

				<div className="w-12 h-12 rounded-full border-2 border-purple-500/30 bg-purple-500/10 flex items-center justify-center mb-4">
					<ShieldCheck className="w-6 h-6 text-purple-400" />
				</div>

				<h3 className="font-semibold text-sm mb-2">Join the Collective</h3>
				<p className="text-xs text-muted-foreground mb-6 leading-relaxed">
					Become a verified contributor and help secure national information
					integrity.
				</p>

				<Button className="w-full bg-purple-400 hover:bg-purple-500 text-white font-semibold">
					Apply for Credentials Now
				</Button>
			</Card>
		</aside>
	);
};
