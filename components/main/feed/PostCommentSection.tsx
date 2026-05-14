"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Plus, X, ExternalLink } from "lucide-react";
import type { CommentType, PostComment } from "./feed-types";
import { createClient } from "@/lib/supabase/client";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatTime(iso: string): string {
	const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
	const minutes = Math.floor(diffSeconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes}m`;
	if (hours < 24) return `${hours}h`;
	if (days === 1) return "1d";
	return `${days}d`;
}

function hostFromUrl(url: string): string {
	try {
		const host = new URL(url).hostname.replace(/^www\./, "");
		return host;
	} catch {
		return url;
	}
}

// ---------------------------------------------------------------------------
// Type badge
// ---------------------------------------------------------------------------

const TYPE_STYLES: Record<CommentType, string> = {
	OPINION: "bg-slate-500/10 text-slate-500",
	CLAIM: "bg-blue-500/10 text-blue-600",
	COUNTER_CLAIM: "bg-orange-500/10 text-orange-600",
};

const TYPE_LABELS: Record<CommentType, string> = {
	OPINION: "Opinion",
	CLAIM: "Claim",
	COUNTER_CLAIM: "Counter-Claim",
};

function TypeBadge({ type }: { type: CommentType }) {
	return (
		<span
			className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide leading-none ${TYPE_STYLES[type]}`}
		>
			{TYPE_LABELS[type]}
		</span>
	);
}

// ---------------------------------------------------------------------------
// Source input list
// ---------------------------------------------------------------------------

interface Source {
	title: string;
	url: string;
}

function SourceInputPanel({
	sources,
	onChange,
}: {
	sources: Source[];
	onChange: (sources: Source[]) => void;
}) {
	const [urlDraft, setUrlDraft] = useState("");
	const [titleDraft, setTitleDraft] = useState("");
	const urlRef = useRef<HTMLInputElement>(null);

	const add = () => {
		const url = urlDraft.trim();
		if (!url) return;
		const title = titleDraft.trim() || hostFromUrl(url);
		onChange([...sources, { title, url }]);
		setUrlDraft("");
		setTitleDraft("");
		urlRef.current?.focus();
	};

	const remove = (index: number) => {
		onChange(sources.filter((_, i) => i !== index));
	};

	return (
		<div className="mt-2 space-y-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5">
			<p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
				Sources <span className="text-red-500">*</span>
			</p>

			{/* Added sources */}
			{sources.length > 0 && (
				<ul className="space-y-1">
					{sources.map((s, i) => (
						<li key={i} className="flex items-center gap-1.5 text-xs">
							<span className="flex-1 truncate text-foreground">
								<span className="font-medium">{s.title}</span>{" "}
								<span className="text-muted-foreground">— {s.url}</span>
							</span>
							<button
								type="button"
								onClick={() => remove(i)}
								className="flex-shrink-0 text-muted-foreground hover:text-red-500"
							>
								<X className="h-3 w-3" />
							</button>
						</li>
					))}
				</ul>
			)}

			{/* Inputs */}
			<div className="flex flex-col gap-1.5">
				<input
					ref={urlRef}
					type="url"
					value={urlDraft}
					onChange={(e) => setUrlDraft(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") { e.preventDefault(); add(); }
					}}
					placeholder="https://source-url.com"
					className="w-full rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs outline-none placeholder:text-muted-foreground focus:border-purple-500"
				/>
				<div className="flex gap-1.5">
					<input
						type="text"
						value={titleDraft}
						onChange={(e) => setTitleDraft(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") { e.preventDefault(); add(); }
						}}
						placeholder="Source title (optional)"
						className="flex-1 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs outline-none placeholder:text-muted-foreground focus:border-purple-500"
					/>
					<button
						type="button"
						onClick={add}
						disabled={!urlDraft.trim()}
						className="flex items-center gap-1 rounded-lg bg-purple-500 px-2.5 py-1.5 text-[10px] font-semibold text-white disabled:opacity-40 hover:bg-purple-600"
					>
						<Plus className="h-3 w-3" />
						Add
					</button>
				</div>
			</div>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface Props {
	postId: string;
	onCommentAdded?: () => void;
}

const COMMENT_TYPES: CommentType[] = ["OPINION", "CLAIM", "COUNTER_CLAIM"];

export const PostCommentSection = ({ postId, onCommentAdded }: Props) => {
	const [comments, setComments] = useState<PostComment[]>([]);
	const [loading, setLoading] = useState(true);
	const [text, setText] = useState("");
	const [commentType, setCommentType] = useState<CommentType>("OPINION");
	const [sources, setSources] = useState<Source[]>([]);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [userAvatar, setUserAvatar] = useState<string | undefined>(undefined);
	const [userInitial, setUserInitial] = useState("U");

	useEffect(() => {
		const supabase = createClient();
		supabase.auth.getUser().then(({ data }) => {
			if (!data.user) return;
			supabase
				.from("profiles")
				.select("avatar_url, display_name")
				.eq("id", data.user.id)
				.single()
				.then(({ data: profile }) => {
					if (profile) {
						setUserAvatar((profile.avatar_url as string | null) ?? undefined);
						setUserInitial(((profile.display_name as string) ?? "U")[0]?.toUpperCase() ?? "U");
					}
				});
		});
	}, []);

	const fetchComments = async () => {
		const res = await fetch(`/api/posts/${postId}/comments`);
		if (!res.ok) return;
		const data = (await res.json()) as { comments?: PostComment[] };
		setComments(data.comments ?? []);
	};

	useEffect(() => {
		setLoading(true);
		fetchComments().catch(() => {}).finally(() => setLoading(false));
	}, [postId]);

	const needsSources = commentType === "CLAIM" || commentType === "COUNTER_CLAIM";

	const handleSubmit = async () => {
		if (!text.trim() || submitting) return;
		if (needsSources && sources.length === 0) {
			setError("Please add at least one source for this comment type.");
			return;
		}
		setError(null);
		setSubmitting(true);
		try {
			const res = await fetch(`/api/posts/${postId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: text.trim(), type: commentType, sources }),
			});
			if (res.ok) {
				setText("");
				setSources([]);
				setCommentType("OPINION");
				await fetchComments();
				onCommentAdded?.();
			} else {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				setError(body.error ?? "Failed to post comment.");
			}
		} catch {
			setError("Something went wrong.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="w-full border-t border-border/50 px-4 pt-3 pb-4 space-y-3">

			{/* Comment list */}
			{loading ? (
				<p className="text-xs text-muted-foreground py-2">Loading comments...</p>
			) : (
				<div className="space-y-3">
					{comments.length === 0 && (
						<p className="text-xs text-muted-foreground py-1">No comments yet. Be the first!</p>
					)}
					{comments.map((comment) => (
						<div key={comment.id} className="flex gap-2 items-start justify-start">
							<Link
								href={comment.author.id && comment.author.id !== "unknown" ? `/profile/${comment.author.id}` : "#"}
								className="flex-shrink-0 mt-0.5 hover:opacity-80 transition-opacity"
							>
								<Avatar className="h-8 w-8">
									<AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
									<AvatarFallback className="text-[10px]">{comment.author.name[0]}</AvatarFallback>
								</Avatar>
							</Link>
							<div className="min-w-0">
								<div className="inline-block bg-muted rounded-2xl px-3 py-2 max-w-xs sm:max-w-sm">
									<div className="flex items-center gap-1.5 mb-0.5">
										<Link
											href={comment.author.id && comment.author.id !== "unknown" ? `/profile/${comment.author.id}` : "#"}
											className="text-xs font-semibold leading-tight hover:underline"
										>
											{comment.author.name}
										</Link>
										<TypeBadge type={comment.type} />
									</div>
									<p className="text-sm leading-snug break-words">{comment.content}</p>
									{comment.sources && comment.sources.length > 0 && (
										<div className="mt-2 space-y-1.5">
											{comment.sources.map((s) => (
												<a
													key={s.id}
													href={s.url.startsWith("http") ? s.url : `https://${s.url}`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-start gap-2 rounded-lg border border-border/60 bg-background px-2.5 py-2 hover:bg-muted/60 transition-colors group"
												>
													<ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-purple-500 group-hover:text-purple-400" />
													<div className="min-w-0 flex-1">
														<p className="text-xs font-medium text-foreground underline underline-offset-2 group-hover:text-purple-500 leading-snug break-words">
															{s.title}
														</p>
														<p className="text-[10px] text-muted-foreground truncate mt-0.5">
															{s.url}
														</p>
													</div>
													{s.isVerified && (
														<span className="flex-shrink-0 self-center rounded bg-green-500/10 px-1.5 py-0.5 text-[9px] font-bold text-green-600">
															Verified
														</span>
													)}
												</a>
											))}
										</div>
									)}
								</div>
								<p className="text-[10px] text-muted-foreground mt-1 ml-2">
									{formatTime(comment.createdAt)}
								</p>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Compose area */}
			<div className="space-y-2">
				{/* Type selector */}
				<div className="flex gap-1.5 ml-10">
					{COMMENT_TYPES.map((t) => (
						<button
							key={t}
							type="button"
							onClick={() => { setCommentType(t); setError(null); }}
							className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors ${
								commentType === t
									? TYPE_STYLES[t] + " ring-1 ring-inset ring-current/30"
									: "bg-muted text-muted-foreground hover:text-foreground"
							}`}
						>
							{TYPE_LABELS[t]}
						</button>
					))}
				</div>

				{/* Source panel — shown for Claim and Counter-Claim */}
				{needsSources && (
					<div className="ml-10">
						<SourceInputPanel sources={sources} onChange={setSources} />
					</div>
				)}

				{/* Error */}
				{error && <p className="ml-10 text-[11px] text-red-500">{error}</p>}

				{/* Text input row */}
				<div className="flex gap-2 items-center">
					<Avatar className="h-8 w-8 flex-shrink-0">
						<AvatarImage src={userAvatar} />
						<AvatarFallback className="text-[10px]">{userInitial}</AvatarFallback>
					</Avatar>
					<div className="flex-1 flex items-center gap-1 bg-muted rounded-full px-3 py-2">
						<input
							type="text"
							value={text}
							onChange={(e) => setText(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") { e.preventDefault(); void handleSubmit(); }
							}}
							placeholder={
								commentType === "OPINION"
									? "Write an opinion…"
									: commentType === "CLAIM"
									? "Write a claim…"
									: "Write a counter-claim…"
							}
							className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
						/>
						{text.trim() && (
							<button
								type="button"
								onClick={() => void handleSubmit()}
								disabled={submitting}
								className="text-purple-500 hover:text-purple-400 disabled:opacity-50 flex-shrink-0 p-0.5"
							>
								<Send className="h-3.5 w-3.5" />
							</button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
