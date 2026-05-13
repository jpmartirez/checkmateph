"use client";

import React, { useState } from "react";
import { CreatePostBox } from "@/components/main/feed/CreatePostBox";
import { PostCard } from "@/components/main/feed/PostCard";
import { RightSidebar } from "@/components/main/feed/RightSidebar";
import { MOCK_POSTS } from "@/components/main/feed/feed-data";
import { CreatePostModal } from "@/components/main/feed/CreatePostModal";
import { Post } from "@/components/main/feed/feed-types";

const FeedPage = () => {
	const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [initialIntent, setInitialIntent] = useState<"OPINION" | "CLAIM">(
		"CLAIM",
	);

	const handleOpenModal = (intent: "OPINION" | "CLAIM" = "CLAIM") => {
		setInitialIntent(intent);
		setIsModalOpen(true);
	};

	const handleCreatePost = (newPost: Post) => {
		setPosts([newPost, ...posts]);
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
						<PostCard key={post.id} post={post} />
					))}
				</div>
			</div>

			{/* Right Sidebar */}
			<div className="hidden lg:block w-[320px]">
				<RightSidebar />
			</div>
		</div>
	);
};

export default FeedPage;
