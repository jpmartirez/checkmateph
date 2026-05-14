"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";



const MOCK_NOTIFICATIONS = [
	{
		id: "1",
		avatarUrl: "https://i.pravatar.cc/150?u=juan",
		name: "Juan dela Cruz",
		message: "reacted to your claim post.",
		timeAgo: "2m ago",
		read: false,
	},
	{
		id: "2",
		avatarUrl: "https://i.pravatar.cc/150?u=ana",
		name: "Ana Reyes",
		message: 'commented: "Can you share your source for this?"',
		timeAgo: "15m ago",
		read: false,
	},
	{
		id: "3",
		avatarUrl: "https://i.pravatar.cc/150?u=marco",
		name: "Marco Santos",
		message: "added a counter-claim to your post.",
		timeAgo: "1h ago",
		read: false,
	},
	{
		id: "4",
		avatarUrl: "https://i.pravatar.cc/150?u=lea",
		name: "Lea Villanueva",
		message: "followed you.",
		timeAgo: "3h ago",
		read: true,
	},
	{
		id: "5",
		avatarUrl: "https://i.pravatar.cc/150?u=danrj",
		name: "Dan Ramos",
		message: "liked your opinion post.",
		timeAgo: "Yesterday",
		read: true,
	},
	{
		id: "6",
		avatarUrl: "https://i.pravatar.cc/150?u=cris",
		name: "Cristina Lim",
		message: "Your claim was marked as Verified Source.",
		timeAgo: "2 days ago",
		read: true,
	},
];



export function NotificationsPopover() {
	const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
	const unreadCount = notifications.filter((n) => !n.read).length;

	const markAllRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
	};

	const markRead = (id: string) => {
		setNotifications((prev) =>
			prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
		);
	};

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="icon" className="relative">
					<Bell className="h-4 w-4" />
					{unreadCount > 0 && (
						<span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-bold text-white">
							{unreadCount > 9 ? "9+" : unreadCount}
						</span>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent
				align="end"
				className="w-80 p-0 bg-card border-border shadow-lg"
			>
				{/* Header */}
				<div className="flex items-center justify-between px-4 py-3 border-b border-border">
					<span className="font-semibold text-sm">Notifications</span>
					{unreadCount > 0 && (
						<button
							type="button"
							onClick={markAllRead}
							className="text-xs text-purple-400 hover:underline"
						>
							Mark all as read
						</button>
					)}
				</div>

				{/* List */}
				<div className="max-h-96 overflow-y-auto divide-y divide-border/50">
					{notifications.map((n) => (
						<button
							key={n.id}
							type="button"
							onClick={() => markRead(n.id)}
							className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
								!n.read ? "bg-purple-500/5" : ""
							}`}
						>
							<div className="relative shrink-0">
								<Avatar className="h-9 w-9">
									<AvatarImage src={n.avatarUrl} alt={n.name} />
									<AvatarFallback className="text-[10px]">{n.name[0]}</AvatarFallback>
								</Avatar>
								{!n.read && (
									<span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-purple-500 border-2 border-card" />
								)}
							</div>
							<div className="min-w-0 flex-1">
								<p className="text-xs leading-snug">
									<span className="font-semibold">{n.name}</span>{" "}
									<span className="text-muted-foreground">{n.message}</span>
								</p>
								<p className="mt-0.5 text-[10px] text-muted-foreground">{n.timeAgo}</p>
							</div>
						</button>
					))}
				</div>

				{/* Footer */}
				<div className="border-t border-border px-4 py-2.5 text-center">
					<button
						type="button"
						className="text-xs text-purple-400 hover:underline"
					>
						See all notifications
					</button>
				</div>
			</PopoverContent>
		</Popover>
	);
}
