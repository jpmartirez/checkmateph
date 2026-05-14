"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CreatePostBox } from "@/components/main/feed/CreatePostBox";
import { PostCard } from "@/components/main/feed/PostCard";
import { RightSidebar } from "@/components/main/feed/RightSidebar";
import { MOCK_POSTS } from "@/components/main/feed/feed-data";
import { CreatePostModal } from "@/components/main/feed/CreatePostModal";
import { Post } from "@/components/main/feed/feed-types";
import { createClient } from "@/lib/supabase/client";
import { PostDetailOverlay } from "@/components/main/feed/PostDetailOverlay";
import { Search, X } from "lucide-react";

// ---------------------------------------------------------------------------
// Inner component — needs Suspense because it calls useSearchParams()
// ---------------------------------------------------------------------------

function FeedContent() {
	const searchParams = useSearchParams();
	const q = searchParams.get("q") ?? "";

	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [initialIntent, setInitialIntent] = useState<"OPINION" | "CLAIM">("CLAIM");
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
	const [activePostId, setActivePostId] = useState<string | null>(null);
	const [activePost, setActivePost] = useState<Post | null>(null);

	// Fetch posts whenever the search query changes
	useEffect(() => {
		let isMounted = true;
		setLoading(true);

		const url = q ? `/api/posts?q=${encodeURIComponent(q)}` : "/api/posts";

		fetch(url)
			.then((res) => res.json())
			.then((data: { posts?: Post[] }) => {
				if (!isMounted) return;
				const apiPosts = data?.posts;
				if (Array.isArray(apiPosts)) {
					setPosts(apiPosts);
					const initialLiked: Record<string, boolean> = {};
					for (const p of apiPosts) {
						if (p.isLikedByCurrentUser) initialLiked[p.id] = true;
					}
					setLikedPosts(initialLiked);
				} else {
					// Fallback to mock data only when there's no query
					if (!q) setPosts(MOCK_POSTS);
				}
			})
			.catch(() => {
				if (isMounted && !q) setPosts(MOCK_POSTS);
			})
			.finally(() => {
				if (isMounted) setLoading(false);
			});

		return () => {
			isMounted = false;
		};
	}, [q]);

	useEffect(() => {
		let cancelled = false;
		const supabase = createClient();
		const loadUser = async () => {
			const { data } = await supabase.auth.getUser();
			if (!cancelled) setCurrentUserId(data.user?.id ?? null);
		};
		loadUser().catch(() => {
			if (!cancelled) setCurrentUserId(null);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const handleOpenModal = (intent: "OPINION" | "CLAIM" = "CLAIM") => {
		setInitialIntent(intent);
		setIsModalOpen(true);
	};

	const handleCreatePost = (newPost: Post) => {
		setPosts((prev) => [newPost, ...prev]);
	};

	const handleDeletePost = async (postId: string) => {
		const confirmed = window.confirm("Delete this post?");
		if (!confirmed) return;
		try {
			const response = await fetch(`/api/posts?id=${encodeURIComponent(postId)}`, {
				method: "DELETE",
			});
			if (!response.ok) return;
			setPosts((prev) => prev.filter((post) => post.id !== postId));
		} catch {
			// ignore
		}
	};

	const handleOpenDetails = (postId: string, post: Post) => {
		setActivePostId(postId);
		setActivePost(post);
	};

	const handleToggleLike = async (postId: string) => {
		try {
			const response = await fetch(`/api/posts/${postId}/reactions`, { method: "POST" });
			if (!response.ok) return;
			const data = (await response.json()) as { liked?: boolean; count?: number };
			if (typeof data.count === "number") {
				setPosts((prev) =>
					prev.map((post) =>
						post.id === postId
							? { ...post, stats: { ...post.stats, reactions: data.count! } }
							: post,
					),
				);
			}
			if (typeof data.liked === "boolean") {
				setLikedPosts((prev) => ({ ...prev, [postId]: data.liked! }));
			}
		} catch {
			// ignore
		}
	};

	const handleCommentAdded = (postId: string) => {
		setPosts((prev) =>
			prev.map((post) =>
				post.id === postId
					? { ...post, stats: { ...post.stats, comments: post.stats.comments + 1 } }
					: post,
			),
		);
	};

	return (
		<div className="flex justify-center gap-8 w-full max-w-6xl mx-auto px-4 py-6">
			<div className="flex-1 max-w-150 flex flex-col w-full">
				<CreatePostBox onOpenModal={handleOpenModal} />

				<CreatePostModal
					open={isModalOpen}
					onOpenChange={setIsModalOpen}
					initialIntent={initialIntent}
					onSubmit={handleCreatePost}
				/>

				{/* Feed header */}
				{q ? (
					<div className="flex items-center gap-2 mb-4">
						<Search className="h-4 w-4 text-muted-foreground shrink-0" />
						<span className="text-lg font-bold">
							Results for <span className="text-purple-400">"{q}"</span>
						</span>
						<a
							href="/feed"
							className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
						>
							<X className="h-3.5 w-3.5" />
							Clear
						</a>
					</div>
				) : (
					<div className="mb-4 text-lg font-bold">Feed</div>
				)}

				{/* Posts */}
				{loading ? (
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="rounded-xl border border-border/50 bg-card p-4 animate-pulse">
								<div className="flex gap-3 mb-4">
									<div className="h-10 w-10 rounded-full bg-muted" />
									<div className="space-y-2 flex-1">
										<div className="h-3 w-32 rounded bg-muted" />
										<div className="h-3 w-20 rounded bg-muted" />
									</div>
								</div>
								<div className="space-y-2">
									<div className="h-3 w-full rounded bg-muted" />
									<div className="h-3 w-4/5 rounded bg-muted" />
								</div>
							</div>
						))}
					</div>
				) : posts.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-20 text-center">
						<Search className="h-10 w-10 text-muted-foreground mb-3" />
						<p className="text-base font-semibold">No posts found</p>
						<p className="text-sm text-muted-foreground mt-1">
							{q
								? `No results matched "${q}". Try a different keyword.`
								: "There are no posts yet. Be the first to post!"}
						</p>
						{q && (
							<a
								href="/feed"
								className="mt-4 text-sm text-purple-400 hover:underline"
							>
								Back to feed
							</a>
						)}
					</div>
				) : (
					<div className="flex flex-col gap-2">
						{posts.map((post) => (
							<PostCard
								key={post.id}
								post={post}
								currentUserId={currentUserId}
								isLiked={likedPosts[post.id] ?? false}
								onDelete={handleDeletePost}
								onLike={handleToggleLike}
								onOpenDetails={(postId) => handleOpenDetails(postId, post)}
								onCommentAdded={handleCommentAdded}
							/>
						))}
					</div>
				)}
			</div>

			<div className="hidden lg:block w-[320px]">
				<RightSidebar />
			</div>

			<PostDetailOverlay
				open={Boolean(activePostId)}
				postId={activePostId}
				initialPost={activePost}
				onOpenChange={(open) => {
					if (!open) {
						setActivePostId(null);
						setActivePost(null);
					}
				}}
			/>
		</div>
	);
}



export default function FeedPage() {
	return (
		<Suspense>
			<FeedContent />
		</Suspense>
	);
}
