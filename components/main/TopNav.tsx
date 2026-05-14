"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Menu, Search, ShieldCheck } from "@/lib/icons/icons";
import { X } from "lucide-react";
import { NotificationsPopover } from "@/components/main/NotificationsPopover";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopNavProps {
	onMenuClick: () => void;
}

function getInitials(name: string): string {
	const trimmed = name.trim();
	if (!trimmed) return "U";
	const parts = trimmed.split(/\s+/).filter(Boolean);
	const first = parts[0]?.[0] ?? "U";
	const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
	return (first + second).toUpperCase();
}

const TopNav = ({ onMenuClick }: TopNavProps) => {
	const [userId, setUserId] = useState<string | null>(null);
	const [displayName, setDisplayName] = useState<string>("DC");
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const [searchValue, setSearchValue] = useState("");
	const router = useRouter();

	useEffect(() => {
		let cancelled = false;
		const supabase = createClient();

		const run = async () => {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user || cancelled) return;
				setUserId(user.id);

				const meta =
					typeof user.user_metadata === "object" && user.user_metadata !== null
						? (user.user_metadata as Record<string, unknown>)
						: {};
				const metaDisplayName =
					typeof meta.display_name === "string" ? meta.display_name : undefined;
				const metaName = typeof meta.name === "string" ? meta.name : undefined;
				const metaAvatarUrl =
					typeof meta.avatar_url === "string" ? meta.avatar_url : undefined;

				const { data: profile } = await supabase
					.from("profiles")
					.select("display_name, avatar_url")
					.eq("id", user.id)
					.single();

				if (cancelled) return;
				setDisplayName(
					profile?.display_name ?? metaDisplayName ?? metaName ?? user.email ?? "User",
				);
				setAvatarUrl(
					profile?.avatar_url ?? metaAvatarUrl ?? `https://i.pravatar.cc/150?u=${user.id}`,
				);
			} catch {
				// leave placeholder
			}
		};

		void run();
		return () => {
			cancelled = true;
		};
	}, []);

	const initials = useMemo(() => getInitials(displayName), [displayName]);
	const profileHref = userId ? "/profile" : "/login";

	const handleGoToProfile = () => {
		router.push(profileHref);
	};

	const handleLogout = async () => {
		try {
			await fetch("/api/auth/logout", { method: "POST" });
		} catch {
			// ignore
		}

		try {
			// Ensure client-side state is cleared as well.
			const supabase = createClient();
			await supabase.auth.signOut();
		} catch {
			// ignore
		}

		setUserId(null);
		router.push("/login");
		router.refresh();
	};

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
							<Search className="h-4 w-4 shrink-0" />
							<Input
								value={searchValue}
								onChange={(e) => setSearchValue(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										const q = searchValue.trim();
										router.push(q ? `/feed?q=${encodeURIComponent(q)}` : "/feed");
									}
									if (e.key === "Escape") {
										setSearchValue("");
										router.push("/feed");
									}
								}}
								placeholder="Search posts…"
								className="h-7 w-full border-none bg-transparent px-0 text-sm text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-0"
							/>
							{searchValue && (
								<button
									type="button"
									aria-label="Clear search"
									onClick={() => {
										setSearchValue("");
										router.push("/feed");
									}}
									className="shrink-0 text-(--text-muted) hover:text-(--text-primary)"
								>
									<X className="h-3.5 w-3.5" />
								</button>
							)}
						</div>
					</div>
				</div>

				{/* 3. RIGHT SECTION: Icons & Profile */}
				<div className="flex shrink-0 items-center gap-2">
					<Button variant="ghost" size="icon" className="hidden sm:inline-flex">
						<ShieldCheck className="h-4 w-4" />
					</Button>

					<NotificationsPopover />

					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Avatar asChild className="h-8 w-8">
								<button
									type="button"
									aria-label="Open profile menu"
									className="bg-(--bg-tertiary) text-(--text-secondary) hover:opacity-90"
								>
									<AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
									<AvatarFallback>{initials}</AvatarFallback>
								</button>
							</Avatar>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-40">
							<DropdownMenuItem
								onSelect={(e) => {
									e.preventDefault();
									handleGoToProfile();
								}}
							>
								<User className="h-4 w-4" />
								Profile
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								variant="destructive"
								disabled={!userId}
								onSelect={(e) => {
									e.preventDefault();
									if (!userId) return;
									void handleLogout();
								}}
							>
								<LogOut className="h-4 w-4" />
								Logout
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</header>
	);
};

export default TopNav;
