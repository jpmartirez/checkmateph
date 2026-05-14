"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CommentType, Post, PostComment } from "./feed-types";
import { Globe, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const REVIEW_CRITERIA = [
	{ key: "sourceCredibility", label: "Source Credibility" },
	{ key: "evidenceQuality", label: "Evidence Quality" },
	{ key: "consistency", label: "Consistency" },
	{ key: "verifiability", label: "Verifiability" },
	{ key: "contextAccuracy", label: "Context & Accuracy" },
] as const;

type ReviewFormState = Record<(typeof REVIEW_CRITERIA)[number]["key"], number>;

const defaultReviewState: ReviewFormState = {
	sourceCredibility: 3,
	evidenceQuality: 3,
	consistency: 3,
	verifiability: 3,
	contextAccuracy: 3,
};

const formatTimeAgo = (iso: string) => {
	const date = new Date(iso);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

	const minutes = Math.floor(diffSeconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	if (days === 1) return "Yesterday";
	return `${days} days ago`;
};

interface PostDetailOverlayProps {
	open: boolean;
	postId: string | null;
	initialPost?: Post | null;
	onOpenChange: (open: boolean) => void;
}

export const PostDetailOverlay = ({
	open,
	postId,
	initialPost = null,
	onOpenChange,
}: PostDetailOverlayProps) => {
	const [post, setPost] = useState<Post | null>(initialPost);
	const [comments, setComments] = useState<PostComment[]>([]);
	const [loading, setLoading] = useState(false);
	const [commentType, setCommentType] = useState<CommentType>("OPINION");
	const [commentText, setCommentText] = useState("");
	const [commentSourceInput, setCommentSourceInput] = useState("");
	const [commentSources, setCommentSources] = useState<
		Array<{ id: string; title: string; url: string }>
	>([]);
	const [commentError, setCommentError] = useState<string | null>(null);
	const [reviewForm, setReviewForm] = useState<ReviewFormState>(
		defaultReviewState,
	);
	const [reviewError, setReviewError] = useState<string | null>(null);
	const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);
	const [reviewOpen, setReviewOpen] = useState(false);

	const consensus = post?.consensus;
	const consensusSupportedPct = useMemo(() => {
		if (!consensus || consensus.total === 0) return 50;
		return Math.round((consensus.supported / consensus.total) * 100);
	}, [consensus]);

	const fetchPost = async () => {
		if (!postId) return;
		setLoading(true);
		try {
			const response = await fetch(`/api/posts/${postId}`);
			if (!response.ok) {
				setComments([]);
				return;
			}
			const data = (await response.json()) as {
				post?: Post;
				comments?: PostComment[];
			};
			setPost(data.post ?? initialPost ?? null);
			setComments(data.comments ?? []);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!open) return;
		setPost(initialPost ?? null);
		fetchPost().catch(() => {
			setLoading(false);
		});
	}, [open, postId, initialPost]);

	useEffect(() => {
		if (!open || !postId) return;
		const supabase = createClient();
		const channel = supabase
			.channel(`post-comments-${postId}`)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "post_comments",
					filter: `post_id=eq.${postId}`,
				},
				() => {
					fetchPost().catch(() => {
						// ignore
					});
					setTimeout(() => {
						fetchPost().catch(() => {
							// ignore
						});
					}, 300);
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [open, postId]);

	const handleAddCommentSource = () => {
		if (!commentSourceInput.trim()) return;
		setCommentSources((prev) => [
			...prev,
			{
				id: crypto.randomUUID(),
				title: commentSourceInput.trim(),
				url: commentSourceInput.trim(),
			},
		]);
		setCommentSourceInput("");
	};

	const handleSubmitComment = async () => {
		if (!postId) return;
		if (!commentText.trim()) return;
		if (
			(commentType === "CLAIM" || commentType === "COUNTER_CLAIM") &&
			commentSources.length === 0
		) {
			setCommentError("Claims and counter claims need at least one source.");
			return;
		}
		setCommentError(null);
		try {
			const response = await fetch(`/api/posts/${postId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					content: commentText,
					type: commentType,
					sources: commentSources.map((source) => ({
						title: source.title,
						url: source.url,
					})),
				}),
			});

			if (!response.ok) {
				const err = await response.json().catch(() => ({}));
				const detail =
					typeof err?.details === "string" && err.details
						? ` (${err.details})`
						: "";
				setCommentError(
					typeof err?.error === "string"
						? `${err.error}${detail}`
						: "Failed to create comment.",
				);
				return;
			}

			setCommentText("");
			setCommentSources([]);
			await fetchPost();
		} catch {
			setCommentError("Failed to create comment.");
		}
	};

	const handleSubmitReview = async () => {
		if (!postId) return;
		setReviewError(null);
		setReviewSuccess(null);
		try {
			const response = await fetch(`/api/posts/${postId}/reviews`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(reviewForm),
			});
			if (!response.ok) {
				const err = await response.json().catch(() => ({}));
				setReviewError(
					typeof err?.error === "string" ? err.error : "Failed to submit review.",
				);
				return;
			}
			setReviewSuccess("Review submitted.");
			await fetchPost();
		} catch {
			setReviewError("Failed to submit review.");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-800 text-zinc-100">
				<DialogHeader>
					<DialogTitle>{post?.author.name ?? "Post"}</DialogTitle>
				</DialogHeader>

				{loading && (
					<div className="py-10 text-sm text-muted-foreground">Loading...</div>
				)}

				{!loading && !post && (
					<div className="py-10 text-sm text-muted-foreground">
						Post not found.
					</div>
				)}

				{post && (
					<div className="space-y-6">
						<div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
							<div className="flex items-start justify-between gap-4">
								<div className="flex gap-3">
									<Avatar>
										<AvatarImage
											src={post.author.avatarUrl}
											alt={post.author.name}
										/>
										<AvatarFallback>{post.author.name[0]}</AvatarFallback>
									</Avatar>
									<div>
										<div className="text-sm font-semibold">
											{post.author.name}
										</div>
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<span>{post.timeAgo}</span>
											<span>·</span>
											<Globe className="h-3 w-3" />
										</div>
									</div>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant="outline" className="text-[10px] uppercase">
										{post.category}
									</Badge>
									{post.status?.map((status) => (
										<Badge
											key={status}
											variant="secondary"
											className="text-[10px] uppercase"
										>
											{status.replace("_", " ")}
										</Badge>
									))}
								</div>
							</div>
							<p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">
								{post.contentText}
							</p>
						</div>

						{post.sources && post.sources.length > 0 && (
							<div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
								<div className="text-sm font-semibold mb-3">
									Sources & References
								</div>
								<div className="space-y-3">
									{post.sources.map((source) => (
										<div
											key={source.id}
											className="flex items-center justify-between gap-2 text-xs"
										>
											<div className="truncate">
												<div className="font-semibold truncate">
													{source.title}
												</div>
												<div className="text-muted-foreground truncate">
													{source.url}
												</div>
											</div>
											<Badge
												variant="secondary"
												className={
													source.isVerified
														? "bg-emerald-500/10 text-emerald-400"
														: "bg-orange-500/10 text-orange-400"
												}
											>
												{source.isVerified ? "Verified Source" : "Unverified Source"}
											</Badge>
										</div>
									))}
								</div>
							</div>
						)}

						<div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
							<div className="text-sm font-semibold mb-3">Expert Analysis</div>
							<div className="consensus-meter">
								<div
									className="consensus-meter-for"
									style={{ width: `${consensusSupportedPct}%` }}
								/>
								<div
									className="consensus-meter-against"
									style={{ width: `${100 - consensusSupportedPct}%` }}
								/>
							</div>
							<div className="mt-3 flex justify-between text-xs text-muted-foreground">
								<span>Disputed: {consensus?.disputed ?? 0}</span>
								<span>Supported: {consensus?.supported ?? 0}</span>
							</div>
							<Button
								className="mt-4 w-full bg-purple-500 hover:bg-purple-600"
								onClick={() => setReviewOpen(true)}
							>
								Review post as expert
							</Button>
						</div>

						<div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
							<div className="text-sm font-semibold">
								Comments ({comments.length})
							</div>
							<div className="mt-4 space-y-3">
								{comments.length === 0 && (
									<div className="text-sm text-muted-foreground">
										No comments yet. Be the first to comment.
									</div>
								)}
								{comments.map((comment) => (
									<div
										key={comment.id}
										className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4"
									>
										<div className="flex items-start justify-between">
											<div className="flex gap-2">
												<Avatar className="h-8 w-8">
													<AvatarImage
														src={comment.author.avatarUrl}
														alt={comment.author.name}
													/>
													<AvatarFallback>
														{comment.author.name[0]}
													</AvatarFallback>
												</Avatar>
												<div>
													<div className="text-sm font-semibold">
														{comment.author.name}
													</div>
													<div className="text-xs text-muted-foreground">
														{formatTimeAgo(comment.createdAt)}
													</div>
												</div>
											</div>
											<Badge className="text-[10px] uppercase">
												{comment.type.replace("_", " ")}
											</Badge>
										</div>
										<p className="mt-3 text-sm text-muted-foreground">
											{comment.content}
										</p>
										{comment.sources && comment.sources.length > 0 && (
											<div className="mt-3 space-y-1 text-xs">
												{comment.sources.map((source) => (
													<div
														key={source.id}
														className="flex items-center justify-between gap-2"
													>
														<div className="truncate">
															<div className="font-semibold truncate">
																{source.title}
															</div>
															<div className="text-muted-foreground truncate">
																{source.url}
															</div>
														</div>
														<Badge
															variant="secondary"
															className={
																source.isVerified
																	? "bg-emerald-500/10 text-emerald-400"
																	: "bg-orange-500/10 text-orange-400"
															}
														>
															{source.isVerified ? "Verified" : "Unverified"}
														</Badge>
													</div>
												))}
											</div>
										)}
									</div>
								))}
							</div>

							<div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
								<div className="flex flex-wrap gap-2 mb-3">
									{(["OPINION", "CLAIM", "COUNTER_CLAIM"] as CommentType[]).map(
										(type) => (
											<Button
												key={type}
												variant={commentType === type ? "default" : "outline"}
												onClick={() => setCommentType(type)}
												className="text-xs"
											>
												{type.replace("_", " ")}
											</Button>
										),
									)}
								</div>
								<Textarea
									value={commentText}
									onChange={(event) => setCommentText(event.target.value)}
									placeholder="Write your comment..."
									className="mb-3"
								/>
								{(commentType === "CLAIM" || commentType === "COUNTER_CLAIM") && (
									<div className="mb-3 space-y-2">
										<div className="flex gap-2">
											<Input
												value={commentSourceInput}
												onChange={(event) =>
													setCommentSourceInput(event.target.value)
												}
												placeholder="Add a source URL"
											/>
											<Button
												variant="secondary"
												onClick={handleAddCommentSource}
											>
												Add
											</Button>
										</div>
										{commentSources.length > 0 && (
											<div className="space-y-1 text-xs">
												{commentSources.map((source) => (
													<div key={source.id} className="truncate">
														{source.url}
													</div>
												))}
											</div>
										)}
									</div>
								)}
								{commentError && (
									<div className="mb-2 text-xs text-red-400">
										{commentError}
									</div>
								)}
								<Button onClick={handleSubmitComment}>Post Comment</Button>
							</div>
						</div>
					</div>
				)}

				<Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
					<DialogContent className="w-[95vw] max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-100">
						<DialogHeader>
							<DialogTitle>Review Post As Expert</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							{REVIEW_CRITERIA.map((criterion) => (
								<div key={criterion.key} className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">
										{criterion.label}
									</div>
									<div className="flex items-center gap-1">
										{[1, 2, 3, 4, 5].map((value) => (
											<button
												key={value}
												type="button"
												onClick={() =>
													setReviewForm((prev) => ({
														...prev,
														[criterion.key]: value,
													}))
												}
												className="rounded-full p-1"
												aria-label={`${criterion.label} ${value} star`}
											>
												<Star
													className={
														value <= reviewForm[criterion.key]
															? "h-4 w-4 text-purple-400"
															: "h-4 w-4 text-muted-foreground"
													}
													fill={
														value <= reviewForm[criterion.key]
															? "currentColor"
															: "none"
													}
												/>
											</button>
										))}
									</div>
								</div>
							))}
							{reviewError && (
								<div className="text-xs text-red-400">{reviewError}</div>
							)}
							{reviewSuccess && (
								<div className="text-xs text-emerald-400">{reviewSuccess}</div>
							)}
							<div className="flex justify-end gap-2">
								<Button variant="ghost" onClick={() => setReviewOpen(false)}>
									Cancel
								</Button>
								<Button
									onClick={async () => {
										await handleSubmitReview();
										setReviewOpen(false);
									}}
								>
									Submit Review
								</Button>
							</div>
						</div>
					</DialogContent>
				</Dialog>
			</DialogContent>
		</Dialog>
	);
};
