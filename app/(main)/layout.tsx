"use client";

import React, { useState } from "react";
import SideBar from "@/components/main/Sidebar";
import TopNav from "@/components/main/TopNav";

export default function FeedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	return (
		<div className="min-h-screen bg-(--bg-primary) text-(--text-primary)">
			<TopNav onMenuClick={() => setIsSidebarOpen(true)} />
			<SideBar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
			<div className="pt-(--navbar-height) md:ml-(--sidebar-width)">
				<main className="flex-1 p-4">{children}</main>
			</div>
		</div>
	);
}
