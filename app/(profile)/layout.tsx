"use client";

import React from "react";
import TopNav from "@/components/main/TopNav";

export default function ProfileLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-(--bg-primary) text-(--text-primary)">
			<TopNav onMenuClick={() => {}} />
			<div className="pt-(--navbar-height)">
				<main className="mx-auto w-full">{children}</main>
			</div>
		</div>
	);
}
