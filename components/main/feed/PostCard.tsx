"use client";

import { useState } from "react";
import Link from "next/link";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Globe,
	MessageSquare,
	MoreHorizontal,
	Share2,
	ThumbsUp,
} from "lucide-react";
import { Post } from "./feed-types";
import { PostCommentSection } from "./PostCommentSection";

const getStatusBadgeVariant = (status: string) => {
	switch (status) {
		case "SUPPORTED":
			return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
		case "DEBATED":
			return "bg-orange-700/10 text-orange-700 hover:bg-orange-700/20";
		case "DISPUTED":
			return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
		case "UNDER_REVIEW":
			return "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20";
		default:
			return "bg-secondary text-secondary-foreground";
	}
};

export const PostCard = ({
	post,
	currentUserId,
	isLiked = false,
	onDelete,
	onLike,
	onOpenDetails,
	onCommentAdded,
}: {
	post: Post;
	currentUserId?: string | null;
	isLiked?: boolean;
	onDelete?: (postId: string) => void;
	onLike?: (postId: string) => void;
	onOpenDetails?: (postId: string) => void;
	onCommentAdded?: (postId: string) => void;
}) => {
	const isAuthor = Boolean(currentUserId && post.author.id === currentUserId);
	const [showComments, setShowComments] = useState(false);

	return (
		<Card className="mb-6 bg-card border-border/50">
			<CardHeader className="p-4 pb-2">
				<div className="flex justify-between items-start">
					<Link
						href={post.author.id && post.author.id !== "unknown" ? `/profile/${post.author.id}` : "#"}
						className="flex gap-3 hover:opacity-80 transition-opacity"
					>
						<Avatar>
							<AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
							<AvatarFallback>{post.author.name[0]}</AvatarFallback>
						</Avatar>
						<div>
							<h3 className="font-semibold text-sm hover:underline">{post.author.name}</h3>
							<div className="flex items-center text-xs text-muted-foreground gap-1">
								<span>{post.timeAgo}</span>
								<span>·</span>
								<Globe className="w-3 h-3" />
							</div>
						</div>
					</Link>

					<div className="flex items-center gap-2">
						{post.status?.map((statusItem) => (
							<Badge
								key={statusItem}
								variant="secondary"
								className={`rounded-sm px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wide ${getStatusBadgeVariant(statusItem)}`}
							>
								{statusItem.replace("_", " ")}
							</Badge>
						))}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-muted-foreground"
								>
									<MoreHorizontal className="w-4 h-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{isAuthor ? (
									<DropdownMenuItem
										variant="destructive"
										onClick={() => onDelete?.(post.id)}
									>
										Delete
									</DropdownMenuItem>
								) : (
									<DropdownMenuItem disabled>No actions</DropdownMenuItem>
								)}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</CardHeader>

			<CardContent className="p-0">
				<div className="px-4 pb-3">
					<Badge
						variant="outline"
						className="mb-2 text-[10px] rounded-sm bg-muted/50 border-input font-medium uppercase text-muted-foreground"
					>
						{post.category}
					</Badge>
					<p className="text-sm leading-relaxed whitespace-pre-wrap">
						{post.contentText}
					</p>
					{post.category === "CLAIM" && (
						<Button
							variant="link"
							className="p-0 h-auto text-purple-400 text-xs font-semibold mt-1"
							onClick={() => onOpenDetails?.(post.id)}
						>
							View Sources & References
						</Button>
					)}
				</div>

				{post.image && (
					<div className="w-full max-h-[400px] overflow-hidden bg-muted">
						<img
							src={post.image}
							alt="Post content"
							className="w-full h-full object-cover"
						/>
					</div>
				)}
			</CardContent>

			<CardFooter className="flex flex-col p-0">
				<div className="flex flex-col w-full px-4 pt-3 pb-1">
					{/* Stats row */}
					<div className="flex justify-between items-center w-full text-xs text-muted-foreground mb-3 pb-3 border-b border-border/50">
						<div className="flex items-center gap-1.5">
							<div className="bg-purple-500 rounded-full p-0.5">
								<ThumbsUp className="w-3 h-3 text-white fill-white" />
							</div>
							<span>{post.stats.reactions} {post.stats.reactions === 1 ? "like" : "likes"}</span>
						</div>
						<div className="flex gap-2">
							{post.stats.comments > 0 && (
								<button
									type="button"
									className="hover:underline"
									onClick={() => setShowComments((v) => !v)}
								>
									{post.stats.comments} {post.stats.comments === 1 ? "comment" : "comments"}
								</button>
							)}
							{post.stats.references > 0 && (
								<span>{post.stats.references} references</span>
							)}
						</div>
					</div>

					{/* Actions row */}
					<div className="flex justify-between w-full mb-1">
						<Button
							variant="ghost"
							className={`flex-1 rounded-none gap-2 ${
								isLiked
									? "text-purple-500 hover:text-purple-400"
									: "text-muted-foreground hover:text-foreground"
							}`}
							onClick={() => onLike?.(post.id)}
						>
							<ThumbsUp
								className="w-4 h-4"
								fill={isLiked ? "currentColor" : "none"}
							/>
							{isLiked ? "Liked" : "Like"}
						</Button>
						<Button
							variant="ghost"
							className={`flex-1 rounded-none gap-2 ${
								showComments
									? "text-purple-500 hover:text-purple-400"
									: "text-muted-foreground hover:text-foreground"
							}`}
							onClick={() => setShowComments((v) => !v)}
						>
							<MessageSquare className="w-4 h-4" />
							Comment
						</Button>
						<Button
							variant="ghost"
							className="flex-1 rounded-none gap-2 text-muted-foreground hover:text-foreground"
						>
							<Share2 className="w-4 h-4" />
							Share
						</Button>
					</div>
				</div>

				{showComments && (
					<PostCommentSection
						postId={post.id}
						onCommentAdded={() => onCommentAdded?.(post.id)}
					/>
				)}
			</CardFooter>
		</Card>
	);
};
