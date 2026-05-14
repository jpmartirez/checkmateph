"use client";

import React, { useEffect, useState } from "react";
import { CreatePostBox } from "@/components/main/feed/CreatePostBox";
import { PostCard } from "@/components/main/feed/PostCard";
import { RightSidebar } from "@/components/main/feed/RightSidebar";
import { MOCK_POSTS } from "@/components/main/feed/feed-data";
import { CreatePostModal } from "@/components/main/feed/CreatePostModal";
import { Post } from "@/components/main/feed/feed-types";
import axios from "axios";
import { createClient } from "@/lib/supabase/client";
import { PostDetailOverlay } from "@/components/main/feed/PostDetailOverlay";

const FeedPage = () => {
	const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [initialIntent, setInitialIntent] = useState<"OPINION" | "CLAIM">(
		"CLAIM",
	);
	const [currentUserId, setCurrentUserId] = useState<string | null>(null);
	const [activePostId, setActivePostId] = useState<string | null>(null);
	const [activePost, setActivePost] = useState<Post | null>(null);

	useEffect(() => {
		let isMounted = true;
		axios
			.get("/api/posts")
			.then((res) => {
				const apiPosts = res?.data?.posts as Post[] | undefined;
				if (isMounted && Array.isArray(apiPosts)) {
					setPosts(apiPosts);
				}
			})
			.catch(() => {
				// Keep MOCK_POSTS if the DB isn't set up yet.
			});
		return () => {
			isMounted = false;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		const supabase = createClient();
		const loadUser = async () => {
			const { data } = await supabase.auth.getUser();
			if (!cancelled) {
				setCurrentUserId(data.user?.id ?? null);
			}
		};
		loadUser().catch(() => {
			if (!cancelled) {
				setCurrentUserId(null);
			}
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
			const response = await fetch(`/api/posts?id=${encodeURIComponent(postId)}`,
				{
					method: "DELETE",
				},
			);
			if (!response.ok) {
				const err = await response.json().catch(() => ({}));
				console.error("Failed to delete post", err);
				return;
			}
			setPosts((prev) => prev.filter((post) => post.id !== postId));
		} catch (error) {
			console.error("Failed to delete post", error);
		}
	};

	const handleOpenDetails = (postId: string, post: Post) => {
		setActivePostId(postId);
		setActivePost(post);
	};

	const handleToggleLike = async (postId: string) => {
		try {
			const response = await fetch(`/api/posts/${postId}/reactions`, {
				method: "POST",
			});
			if (!response.ok) {
				const err = await response.json().catch(() => ({}));
				console.error("Failed to toggle like", err);
				return;
			}
			const data = (await response.json()) as { count?: number };
			if (typeof data.count === "number") {
				setPosts((prev) =>
					prev.map((post) =>
						post.id === postId
							? {
									...post,
									stats: {
										...post.stats,
										reactions: data.count ?? post.stats.reactions,
									},
								}
							: post,
					),
				);
			}
		} catch (error) {
			console.error("Failed to toggle like", error);
		}
	};

	return (
		<div className="flex justify-center gap-8 w-full max-w-6xl mx-auto px-4 py-6">
			{/* Main Feed Content */}
			<div className="flex-1 max-w-150 flex flex-col w-full">
				<CreatePostBox onOpenModal={handleOpenModal} />

				<CreatePostModal
					open={isModalOpen}
					onOpenChange={setIsModalOpen}
					initialIntent={initialIntent}
					onSubmit={handleCreatePost}
				/>

				<div className="mb-4 text-lg font-bold">Feed</div>

				<div className="flex flex-col gap-2">
					{posts.map((post) => (
						<PostCard
							key={post.id}
							post={post}
							currentUserId={currentUserId}
							onDelete={handleDeletePost}
							onLike={handleToggleLike}
							onOpenDetails={(postId) => handleOpenDetails(postId, post)}
						/>
					))}
				</div>
			</div>

			{/* Right Sidebar */}
			<div className="hidden lg:block w-[320px]">
				<RightSidebar />
			</div>

			<PostDetailOverlay
				open={Boolean(activePostId)}
				postId={activePostId}
				initialPost={activePost}
				onOpenChange={(open) => {
					if (!open) setActivePostId(null);
					if (!open) setActivePost(null);
				}}
			/>
		</div>
	);
};

export default FeedPage;
