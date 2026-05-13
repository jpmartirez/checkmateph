"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Menu, Search, ShieldCheck } from "@/lib/icons/icons";
import Image from "next/image";

interface TopNavProps {
	onMenuClick: () => void;
}

const TopNav = ({ onMenuClick }: TopNavProps) => {
	return (
		<header className="fixed left-0 top-0 z-50 h-[var(--navbar-height)] w-full border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
			<div className="mx-auto flex h-full w-full max-w-6xl items-center gap-3 px-4 md:px-6">
				<Button
					variant="ghost"
					size="icon"
					className="md:hidden"
					onClick={onMenuClick}
					aria-label="Open sidebar"
				>
					<Menu className="h-4 w-4" />
				</Button>

				<Image
					src={"/checkmateph-logo.png"}
					alt="logo"
					width={35}
					height={35}
				/>

				<div className="flex h-9 w-full max-w-md items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-3 text-[var(--text-secondary)]">
					<Search className="h-4 w-4" />
					<Input
						placeholder="Search CheckMatePh"
						className="h-7 border-none bg-transparent px-0 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:ring-0"
					/>
				</div>

				<div className="ml-auto flex items-center gap-2">
					<Button variant="ghost" size="icon" className="hidden sm:inline-flex">
						<ShieldCheck className="h-4 w-4" />
					</Button>
					<Button variant="ghost" size="icon" className="relative">
						<Bell className="h-4 w-4" />
						<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--color-brand)]" />
					</Button>
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-xs font-semibold text-[var(--text-secondary)]">
						DC
					</div>
				</div>
			</div>
		</header>
	);
};

export default TopNav;
