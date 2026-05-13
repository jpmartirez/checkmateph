"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Menu, Search, ShieldCheck } from "@/lib/icons/icons";
import Image from "next/image";
import Link from "next/link";

interface TopNavProps {
	onMenuClick: () => void;
}

const TopNav = ({ onMenuClick }: TopNavProps) => {
	return (
		<header className="fixed left-0 top-0 z-50 h-(--navbar-height) w-full border-b border-(--border-subtle) bg-(--bg-secondary)">
			{/* Changed to justify-between to anchor the left and right edges */}
			<div className="mx-auto flex h-full w-full items-center justify-between gap-4 px-4 md:px-6">
				{/* 1. LEFT SECTION: Menu & Logo */}
				<div className="flex shrink-0 items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						className="md:hidden"
						onClick={onMenuClick}
						aria-label="Open sidebar"
					>
						<Menu className="h-4 w-4" />
					</Button>

					<Link href="/">
						<Image
							src={"/checkmateph-logo.png"}
							alt="logo"
							width={35}
							height={35}
							className="shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
						/>
					</Link>

					<div className="flex flex-1 items-center justify-center">
						<div className="flex h-9 w-full max-w-md items-center gap-2 rounded-full border border-(--border-subtle) bg-(--bg-tertiary) px-3 text-(--text-secondary)">
							<Search className="h-4 w-10 shrink-0" />
							<Input
								placeholder="Search CheckMatePh"
								className="h-7 w-full border-none bg-transparent px-0 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-0"
							/>
						</div>
					</div>
				</div>

				{/* 3. RIGHT SECTION: Icons & Profile */}
				<div className="flex shrink-0 items-center gap-2">
					<Button variant="ghost" size="icon" className="hidden sm:inline-flex">
						<ShieldCheck className="h-4 w-4" />
					</Button>

					<Button variant="ghost" size="icon" className="relative">
						<Bell className="h-4 w-4" />
						<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-brand" />
					</Button>

					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-(--bg-tertiary) text-xs font-semibold text-(--text-secondary)">
						DC
					</div>
				</div>
			</div>
		</header>
	);
};

export default TopNav;
