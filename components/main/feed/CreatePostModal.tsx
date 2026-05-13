"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	MessageSquare,
	Megaphone,
	Image as ImageIcon,
	Link2,
	Paperclip,
	X,
	Globe,
	BadgeCheck,
} from "lucide-react";
import { Post, PostCategory } from "./feed-types";
import { createClient } from "@/lib/supabase/client";

interface SourceLink {
	id: string;
	title: string;
	url: string;
}

interface CreatePostModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (post: Post) => void;
	initialIntent?: "OPINION" | "CLAIM";
}

export function CreatePostModal({
	open,
	onOpenChange,
	onSubmit,
	initialIntent = "CLAIM",
}: CreatePostModalProps) {
	const [intent, setIntent] = useState<"OPINION" | "CLAIM">(initialIntent);
	const [content, setContent] = useState("");
	const [linkInput, setLinkInput] = useState("");
	const [sources, setSources] = useState<SourceLink[]>([]);
	const [certified, setCertified] = useState(false);
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
			// ignore
		});
		return () => {
			cancelled = true;
		};
	}, []);

	// Reset form when modal opens
	const handleOpenChange = (newOpen: boolean) => {
		if (newOpen) {
			setIntent(initialIntent);
			setContent("");
			setLinkInput("");
			setCertified(false);
			setSources([]);
		}
		onOpenChange(newOpen);
	};

	const handleAddSource = () => {
		if (!linkInput.trim()) return;
		setSources([
			...sources,
			{ id: crypto.randomUUID(), title: linkInput, url: linkInput },
		]);
		setLinkInput("");
	};

	const removeSource = (id: string) => {
		setSources(sources.filter((s) => s.id !== id));
	};

	const handleSubmit = async () => {
		if (!content.trim()) return;

		try {
			const response = await fetch("/api/posts", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					category: intent as PostCategory,
					contentText: content,
					sources: sources.map((s) => ({ title: s.title, url: s.url })),
				}),
			});

			if (!response.ok) {
				// Keep UX minimal: just log. Feed will stay unchanged.
				const err = await response.json().catch(() => ({}));
				console.error("Failed to create post", err);
				return;
			}

			const data = (await response.json()) as { post?: Post };
			if (data?.post) {
				onSubmit(data.post);
				onOpenChange(false);
			}
		} catch (e) {
			console.error("Failed to create post", e);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-zinc-100 p-0 sm:rounded-2xl my-4 sm:my-8">
				<div className="p-4 sm:p-6 md:p-8">
					<DialogHeader className="mb-6 flex flex-row items-center justify-between">
						<DialogTitle className="text-xl font-bold">Create Post</DialogTitle>
					</DialogHeader>

					{/* User Info */}
					<div className="flex items-center gap-3 mb-6">
						<Avatar className="w-12 h-12">
							<AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div>
							<div className="font-semibold text-zinc-100">{displayName}</div>
							<div className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded-md mt-1 w-fit border border-zinc-800">
								<Globe className="w-3 h-3" />
								Publicly visible
								<span className="text-zinc-500 ml-1">▾</span>
							</div>
						</div>
					</div>

					<div className="mb-4 text-sm font-medium text-zinc-300">
						Select Intent
					</div>

					{/* Intent Toggle */}
					<div className="flex gap-4 mb-6">
						<button
							className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-colors ${
								intent === "OPINION"
									? "bg-[#B484FF] text-white"
									: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700/50"
							}`}
							onClick={() => setIntent("OPINION")}
						>
							<MessageSquare className="w-5 h-5 mr-2" />
							<span className="font-semibold text-sm">Opinion</span>
						</button>
						<button
							className={`flex-1 flex items-center justify-center py-2.5 rounded-xl transition-colors ${
								intent === "CLAIM"
									? "bg-[#B484FF] text-white"
									: "bg-zinc-800 text-zinc-400 hover:bg-zinc-700/50"
							}`}
							onClick={() => setIntent("CLAIM")}
						>
							<Megaphone className="w-5 h-5 mr-2" />
							<span className="font-semibold text-sm">Claim</span>
						</button>
					</div>

					{/* Text Area */}
					<div className="relative mb-6">
						<Textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							placeholder={
								intent === "CLAIM"
									? "What is the core claim you are submitting?"
									: "What's your opinion?"
							}
							className="min-h-25 border-none text-xl resize-none placeholder:text-[#B484FF]/70 text-[#D0B2FF] focus-visible:ring-0 p-4 pr-12 rounded-xl bg-zinc-800/30"
						/>
						<div className="absolute right-4 top-4 text-emerald-500 hover:text-emerald-400 cursor-pointer">
							<ImageIcon className="w-6 h-6" />
						</div>
					</div>

					{/* Verified Source Badge */}
					{intent === "CLAIM" && (
						<div className="flex justify-end mb-4">
							<div className="flex items-center gap-2 bg-[#1A2235] text-[#849CFF] px-3 py-1.5 rounded-full text-sm font-medium">
								<BadgeCheck className="w-4 h-4" />
								Verified Source
							</div>
						</div>
					)}

					{/* Evidence Section */}
					<div className="bg-zinc-800/80 rounded-xl p-4 mb-6 border border-zinc-700/50">
						<div className="flex justify-between items-center mb-4">
							<h3 className="font-semibold text-sm">Add Evidence to Claim</h3>
							<div className="flex gap-3 text-zinc-400">
								<Paperclip className="w-4 h-4 cursor-pointer hover:text-zinc-200" />
								<Link2 className="w-4 h-4 cursor-pointer hover:text-zinc-200" />
							</div>
						</div>

						{sources.length > 0 && (
							<div className="flex flex-col gap-2 mb-4">
								{sources.map((source) => (
									<div
										key={source.id}
										className="flex items-center justify-between bg-zinc-900 rounded-lg p-3 border border-zinc-800"
									>
										<div className="flex items-center gap-3 overflow-hidden">
											<div className="bg-zinc-100 rounded w-8 h-8 flex items-center justify-center text-black font-serif font-bold text-xs shrink-0">
												PG
											</div>
											<div className="truncate">
												<div className="font-semibold text-sm truncate">
													{source.title}
												</div>
												<div className="text-xs text-zinc-400 truncate">
													{source.url}
												</div>
											</div>
										</div>
										<button
											onClick={() => removeSource(source.id)}
											className="text-zinc-500 hover:text-zinc-300"
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								))}
							</div>
						)}

						<div className="flex gap-2">
							<div className="flex-1 flex items-center gap-2 bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-800 focus-within:border-zinc-700">
								<Link2 className="w-4 h-4 text-zinc-500 shrink-0" />
								<Input
									value={linkInput}
									onChange={(e) => setLinkInput(e.target.value)}
									placeholder="Paste source link here..."
									className="bg-transparent border-0 h-auto p-0 focus-visible:ring-0 text-sm"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											handleAddSource();
										}
									}}
								/>
							</div>
							<Button
								onClick={handleAddSource}
								className="bg-[#B484FF] hover:bg-[#A36DFF] text-white"
							>
								Add
							</Button>
						</div>
					</div>

					{/* Certification */}
					<div className="flex items-start gap-3 mb-6">
						<Checkbox
							id="certify"
							checked={certified}
							onCheckedChange={(c) => setCertified(!!c)}
							className="mt-1 border-zinc-600 data-[state=checked]:bg-[#B484FF] data-[state=checked]:border-[#B484FF]"
						/>
						<label
							htmlFor="certify"
							className="text-xs text-zinc-400 leading-tight"
						>
							I certify that this submission follows the Neutral Attribution
							Policy and is backed by accessible evidence.{" "}
							<a href="#" className="text-blue-400 hover:underline">
								View Submission Guidelines
							</a>
						</label>
					</div>

					{/* Actions */}
					<div className="flex flex-col gap-3">
						<Button
							className="w-full bg-[#B484FF] hover:bg-[#A36DFF] text-white py-6 rounded-xl font-semibold text-lg"
							disabled={!content.trim() || !certified}
							onClick={handleSubmit}
						>
							Submit {intent === "CLAIM" ? "Claim" : "Opinion"}
						</Button>
						<Button
							variant="ghost"
							className="w-full text-zinc-300 hover:text-white hover:bg-zinc-800 py-6 rounded-xl font-semibold text-lg"
							onClick={() => onOpenChange(false)}
						>
							Save Draft
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
