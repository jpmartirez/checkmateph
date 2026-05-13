"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
	BadgeCheck,
	FileText,
	Home,
	ShieldAlert,
	UserCheck,
} from "@/lib/icons/icons";
import { Button } from "@/components/ui/button";
import { SideBarProps } from "@/components/main/sidebar-types";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function getInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "U";
	if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
	return `${parts[0]!.slice(0, 1)}${parts[parts.length - 1]!.slice(0, 1)}`.toUpperCase();
}

const SideBar = ({ isOpen, onClose }: SideBarProps) => {
	const pathname = usePathname();
	const [displayName, setDisplayName] = useState<string>("User");
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
	const initials = useMemo(() => getInitials(displayName), [displayName]);

	useEffect(() => {
		let cancelled = false;
		const supabase = createClient();

		const run = async () => {
			const { data } = await supabase.auth.getUser();
			const user = data.user;
			if (!user) return;

			const meta =
				typeof user.user_metadata === "object" && user.user_metadata !== null
					? (user.user_metadata as Record<string, unknown>)
					: {};
			const metaDisplayName =
				typeof meta.display_name === "string" ? meta.display_name : undefined;
			const metaName = typeof meta.name === "string" ? meta.name : undefined;
			const metaAvatarUrl =
				typeof meta.avatar_url === "string" ? meta.avatar_url : undefined;

			// Prefer DB profile values (first+last name -> display_name)
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
				profile?.avatar_url ?? metaAvatarUrl ?? (user.id ? `https://i.pravatar.cc/150?u=${user.id}` : null),
			);
		};

		run().catch(() => {
			// ignore; keep defaults
		});

		return () => {
			cancelled = true;
		};
	}, []);

	const navItems = [
		{ label: "Home", href: "/feed", icon: Home },
		{ label: "Verified Sources", href: "/sources", icon: BadgeCheck },
		{ label: "Government Officials", href: "/politicians", icon: UserCheck },
	];

	const shortcuts = [
		{ label: "Recent Fact-Checks", href: "#", icon: FileText },
		{ label: "Active Claims", href: "#", icon: ShieldAlert },
	];

	return (
		<>
			<div
				className={cn(
					"fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden",
					isOpen ? "opacity-100" : "pointer-events-none opacity-0",
				)}
				onClick={onClose}
			/>
			<aside
				className={cn(
					"fixed left-0 top-(--navbar-height) z-50 h-[calc(100vh-var(--navbar-height))] w-(--sidebar-width) border-r border-(--border-subtle) bg-(--bg-secondary) text-(--text-primary) transition-transform",
					isOpen ? "translate-x-0" : "-translate-x-full",
					"md:translate-x-0",
				)}
			>
				<div className="flex h-full flex-col px-4 py-6">
					<div className="flex items-center gap-3 px-2">
						<Avatar className="h-11 w-11">
							<AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
							<AvatarFallback className="bg-(--bg-tertiary) text-(--text-primary)">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0">
							<p className="truncate text-sm font-semibold">{displayName}</p>
						</div>
					</div>

					<nav className="mt-6 flex flex-col gap-1">
						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = pathname === item.href;

							return (
								<Button
									key={item.label}
									variant="ghost"
									asChild
									className={cn(
										"h-11 justify-start gap-3 rounded-xl px-3 text-sm font-medium",
										isActive
											? "bg-(--bg-tertiary) text-(--text-primary)"
											: "text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary)",
									)}
								>
									<Link href={item.href}>
										<Icon className="h-5 w-5" />
										<span>{item.label}</span>
									</Link>
								</Button>
							);
						})}
					</nav>

					<div className="mt-6 border-t border-(--border-subtle) pt-5">
						<p className="mb-3 px-2 text-xs font-semibold text-(--text-muted)">
							Your shortcuts
						</p>
						<div className="flex flex-col gap-1">
							{shortcuts.map((shortcut) => {
								const Icon = shortcut.icon;
								return (
									<Button
										key={shortcut.label}
										variant="ghost"
										asChild
										className="h-10 justify-start gap-3 rounded-xl px-3 text-sm text-(--text-secondary) hover:bg-(--bg-tertiary) hover:text-(--text-primary)"
									>
										<Link href={shortcut.href}>
											<Icon className="h-4 w-4" />
											<span>{shortcut.label}</span>
										</Link>
									</Button>
								);
							})}
						</div>
					</div>

					<div className="mt-auto px-2 pt-6 text-[11px] text-(--text-muted)">
						<p>
							Privacy · Terms · Advertising · Ad Choices · Cookies · Meta © 2024
						</p>
					</div>
				</div>
			</aside>
		</>
	);
};

export default SideBar;
