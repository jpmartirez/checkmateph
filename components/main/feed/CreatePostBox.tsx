import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, MessageSquare, Megaphone } from "lucide-react";

interface CreatePostBoxProps {
	onOpenModal?: (intent?: "OPINION" | "CLAIM") => void;
}

export const CreatePostBox = ({ onOpenModal }: CreatePostBoxProps) => {
	return (
		<Card className="mb-6 bg-card">
			<CardContent className="p-4 flex items-center gap-4">
				<Avatar className="h-10 w-10">
					<AvatarImage src="https://i.pravatar.cc/150?u=current_user" />
					<AvatarFallback>ME</AvatarFallback>
				</Avatar>

				<div
					className="flex-1 bg-muted/50 rounded-full flex items-center px-4 py-2 border border-border cursor-pointer transition-colors hover:bg-muted"
					onClick={() => onOpenModal && onOpenModal()}
				>
					<Input
						placeholder="Create A Post..."
						className="border-0 bg-transparent shadow-none focus-visible:ring-0 p-0 h-auto cursor-pointer pointer-events-none"
						readOnly
					/>
				</div>

				<div className="flex items-center gap-2">
					<Button
						variant="ghost"
						size="icon"
						className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
						onClick={() => onOpenModal && onOpenModal()}
					>
						<ImageIcon className="w-5 h-5" />
					</Button>
					<Button
						variant="outline"
						className="rounded-full gap-2 font-medium"
						onClick={() => onOpenModal && onOpenModal("OPINION")}
					>
						<MessageSquare className="w-4 h-4" />
						Opinion
					</Button>
					<Button
						className="rounded-full gap-2 bg-purple-500 hover:bg-purple-600 text-white font-medium"
						onClick={() => onOpenModal && onOpenModal("CLAIM")}
					>
						<Megaphone className="w-4 h-4" />
						Claim
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};
