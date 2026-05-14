"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, MessageSquare, Megaphone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CreatePostBoxProps {
	onOpenModal?: (intent?: "OPINION" | "CLAIM") => void;
}

export const CreatePostBox = ({ onOpenModal }: CreatePostBoxProps) => {
	const [displayName, setDisplayName] = useState<string>("User");
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const initials = useMemo(() => {
		const parts = displayName.trim().split(/\s+/).filter(Boolean);
		if (parts.length === 0) return "U";
		if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
		return `${parts[0]!.slice(0, 1)}${parts[parts.length - 1]!.slice(0, 1)}`.toUpperCase();
	}, [displayName]);

	useEffect(() => {
		let cancelled = false;
		const supabase = createClient();
		const run = async () => {
			const { data } = await supabase.auth.getUser();
			const user = data.user;
			if (!user) return;

			const meta =
				typeof user.user_metadata === "object" && user.user_metadata !== null
					? (user.user_metadata as Record<string, unknown>)
					: {};
			const metaDisplayName =
				typeof meta.display_name === "string" ? meta.display_name : undefined;
			const metaName = typeof meta.name === "string" ? meta.name : undefined;
			const metaAvatarUrl =
				typeof meta.avatar_url === "string" ? meta.avatar_url : undefined;

			const { data: profile } = await supabase
				.from("profiles")
				.select("display_name, avatar_url")
				.eq("id", user.id)
				.single();

			if (cancelled) return;
			setDisplayName(
				profile?.display_name ?? metaDisplayName ?? metaName ?? user.email ?? "User",
			);
			setAvatarUrl(
				profile?.avatar_url ?? metaAvatarUrl ?? `https://i.pravatar.cc/150?u=${user.id}`,
			);
		};
		run().catch(() => {
			// ignore; keep defaults
		});
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<Card className="mb-6 bg-card">
			<CardContent className="p-4 flex items-center gap-4">
				<Avatar className="h-10 w-10">
					<AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
					<AvatarFallback>{initials}</AvatarFallback>
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
