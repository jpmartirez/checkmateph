"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CommentType, Post, PostComment } from "./feed-types";
import { ExternalLink, Globe, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SOURCES } from "@/components/main/sources/verified-sources-data";

// ---------------------------------------------------------------------------
// Verified source check against mock data
// ---------------------------------------------------------------------------

const VERIFIED_HOSTS = new Set(
	SOURCES.map((s) => s.url.toLowerCase().replace(/^www\./, "")),
);

function isSourceVerified(url: string, flagFromDb?: boolean): boolean {
	if (flagFromDb) return true;
	try {
		const host = new URL(
			url.startsWith("http") ? url : `https://${url}`,
		).hostname.toLowerCase().replace(/^www\./, "");
		return VERIFIED_HOSTS.has(host);
	} catch {
		return false;
	}
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
	const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
	const minutes = Math.floor(diffSeconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	if (days === 1) return "Yesterday";
	return `${days} days ago`;
};

const COMMENT_TYPE_STYLES: Record<CommentType, string> = {
	OPINION: "bg-slate-500/10 text-slate-400",
	CLAIM: "bg-blue-500/10 text-blue-400",
	COUNTER_CLAIM: "bg-orange-500/10 text-orange-400",
};

const COMMENT_TYPE_LABELS: Record<CommentType, string> = {
	OPINION: "Opinion",
	CLAIM: "Claim",
	COUNTER_CLAIM: "Counter-Claim",
};

// ---------------------------------------------------------------------------
// Source link card — shared by post sources and comment sources
// ---------------------------------------------------------------------------

function SourceCard({ title, url, isVerified: isVerifiedFromDb }: { title: string; url: string; isVerified?: boolean }) {
	const verified = isSourceVerified(url, isVerifiedFromDb);
	const href = url.startsWith("http") ? url : `https://${url}`;

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="flex items-start gap-3 rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-4 py-3 hover:bg-zinc-700/60 transition-colors group"
		>
			<ExternalLink className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-400 group-hover:text-purple-300" />
			<div className="min-w-0 flex-1">
				<p className="text-sm font-medium text-zinc-100 underline underline-offset-2 group-hover:text-purple-300 leading-snug break-words">
					{title}
				</p>
				<p className="mt-0.5 text-xs text-zinc-400 break-all">{url}</p>
			</div>
			<Badge
				variant="secondary"
				className={`flex-shrink-0 self-center text-[10px] font-semibold ${
					verified
						? "bg-emerald-500/10 text-emerald-400"
						: "bg-orange-500/10 text-orange-400"
				}`}
			>
				{verified ? "Verified" : "Unverified"}
			</Badge>
		</a>
	);
}

// ---------------------------------------------------------------------------
// Main overlay
// ---------------------------------------------------------------------------

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
	const [reviewForm, setReviewForm] = useState<ReviewFormState>(defaultReviewState);
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
			if (!response.ok) { setComments([]); return; }
			const data = (await response.json()) as { post?: Post; comments?: PostComment[] };
			setPost(data.post ?? initialPost ?? null);
			setComments(data.comments ?? []);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (!open) return;
		setPost(initialPost ?? null);
		fetchPost().catch(() => setLoading(false));
	}, [open, postId]);

	useEffect(() => {
		if (!open || !postId) return;
		const supabase = createClient();
		const channel = supabase
			.channel(`post-comments-${postId}`)
			.on("postgres_changes", { event: "*", schema: "public", table: "post_comments", filter: `post_id=eq.${postId}` }, () => {
				fetchPost().catch(() => {});
			})
			.subscribe();
		return () => { supabase.removeChannel(channel); };
	}, [open, postId]);

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
				setReviewError(typeof err?.error === "string" ? err.error : "Failed to submit review.");
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
			<DialogContent aria-describedby={undefined} className="w-fit min-w-[min(95vw,520px)] max-w-[95vw] max-h-[90vh] overflow-auto bg-zinc-900 border-zinc-800 text-zinc-100">
				<DialogHeader>
					<DialogTitle>{post?.author.name ?? "Post"}</DialogTitle>
				</DialogHeader>

				{loading && <div className="py-10 text-sm text-muted-foreground">Loading...</div>}
				{!loading && !post && <div className="py-10 text-sm text-muted-foreground">Post not found.</div>}

				{post && (
					<div className="space-y-6">
						{/* Post body */}
						<div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
							<div className="flex items-start justify-between gap-4">
								<Link
									href={post.author.id && post.author.id !== "unknown" ? `/profile/${post.author.id}` : "#"}
									className="flex gap-3 hover:opacity-80 transition-opacity"
								>
									<Avatar>
										<AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
										<AvatarFallback>{post.author.name[0]}</AvatarFallback>
									</Avatar>
									<div>
										<div className="text-sm font-semibold hover:underline">{post.author.name}</div>
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<span>{post.timeAgo}</span>
											<span>·</span>
											<Globe className="h-3 w-3" />
										</div>
									</div>
								</Link>
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant="outline" className="text-[10px] uppercase">{post.category}</Badge>
									{post.status?.map((status) => (
										<Badge key={status} variant="secondary" className="text-[10px] uppercase">
											{status.replace(/_/g, " ")}
										</Badge>
									))}
								</div>
							</div>
							<p className="mt-4 text-sm leading-relaxed whitespace-pre-wrap">{post.contentText}</p>
						</div>

						{/* Sources & References */}
						{post.sources && post.sources.length > 0 && (
							<div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
								<div className="text-sm font-semibold mb-3">Sources & References</div>
								<div className="space-y-2">
									{post.sources.map((source) => (
										<SourceCard
											key={source.id}
											title={source.title}
											url={source.url}
											isVerified={source.isVerified}
										/>
									))}
								</div>
							</div>
						)}

						{/* Expert Analysis */}
						<div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
							<div className="text-sm font-semibold mb-3">Expert Analysis</div>
							<div className="consensus-meter">
								<div className="consensus-meter-for" style={{ width: `${consensusSupportedPct}%` }} />
								<div className="consensus-meter-against" style={{ width: `${100 - consensusSupportedPct}%` }} />
							</div>
							<div className="mt-3 flex justify-between text-xs text-muted-foreground">
								<span>Disputed: {consensus?.disputed ?? 0}</span>
								<span>Supported: {consensus?.supported ?? 0}</span>
							</div>
							<Button className="mt-4 w-full bg-purple-500 hover:bg-purple-600" onClick={() => setReviewOpen(true)}>
								Review post as expert
							</Button>
						</div>

						{/* Comments list */}
						{comments.length > 0 && (
							<div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
								<div className="text-sm font-semibold mb-4">Comments ({comments.length})</div>
								<div className="space-y-4">
									{comments.map((comment) => (
										<div key={comment.id} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
											<div className="flex items-start justify-between gap-2">
												<Link
												href={comment.author.id && comment.author.id !== "unknown" ? `/profile/${comment.author.id}` : "#"}
												className="flex gap-2 hover:opacity-80 transition-opacity"
											>
												<Avatar className="h-8 w-8">
													<AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
													<AvatarFallback>{comment.author.name[0]}</AvatarFallback>
												</Avatar>
												<div>
													<div className="text-sm font-semibold hover:underline">{comment.author.name}</div>
													<div className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</div>
												</div>
											</Link>
												<span className={`rounded px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${COMMENT_TYPE_STYLES[comment.type]}`}>
													{COMMENT_TYPE_LABELS[comment.type]}
												</span>
											</div>
											<p className="mt-3 text-sm leading-relaxed">{comment.content}</p>
											{comment.sources && comment.sources.length > 0 && (
												<div className="mt-3 space-y-2">
													{comment.sources.map((source) => (
														<SourceCard
															key={source.id}
															title={source.title}
															url={source.url}
															isVerified={source.isVerified}
														/>
													))}
												</div>
											)}
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Expert review sub-dialog */}
				<Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
					<DialogContent aria-describedby={undefined} className="w-[95vw] max-w-2xl bg-zinc-900 border-zinc-800 text-zinc-100">
						<DialogHeader>
							<DialogTitle>Review Post As Expert</DialogTitle>
						</DialogHeader>
						<div className="space-y-4">
							{REVIEW_CRITERIA.map((criterion) => (
								<div key={criterion.key} className="flex items-center justify-between">
									<div className="text-sm text-muted-foreground">{criterion.label}</div>
									<div className="flex items-center gap-1">
										{[1, 2, 3, 4, 5].map((value) => (
											<button
												key={value}
												type="button"
												onClick={() => setReviewForm((prev) => ({ ...prev, [criterion.key]: value }))}
												className="rounded-full p-1"
												aria-label={`${criterion.label} ${value} star`}
											>
												<Star
													className={value <= reviewForm[criterion.key] ? "h-4 w-4 text-purple-400" : "h-4 w-4 text-muted-foreground"}
													fill={value <= reviewForm[criterion.key] ? "currentColor" : "none"}
												/>
											</button>
										))}
									</div>
								</div>
							))}
							{reviewError && <div className="text-xs text-red-400">{reviewError}</div>}
							{reviewSuccess && <div className="text-xs text-emerald-400">{reviewSuccess}</div>}
							<div className="flex justify-end gap-2">
								<Button variant="ghost" onClick={() => setReviewOpen(false)}>Cancel</Button>
								<Button onClick={async () => { await handleSubmitReview(); setReviewOpen(false); }}>
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
