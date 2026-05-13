import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import type { UserProfile, UserRole } from "@/components/profile/profile-types";
import type { Post, PostCategory, PostStatus } from "@/components/main/feed/feed-types";

function formatTimeAgo(iso: string): string {
	const date = new Date(iso);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

	const minutes = Math.floor(diffSeconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	if (minutes < 1) return "Just now";
	if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
	if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
	if (days === 1) return "Yesterday";
	return `${days} days ago`;
}

function formatFollowersCount(count: number): string {
	if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
	if (count >= 10_000) return `${Math.round(count / 1000)}k`;
	if (count >= 1_000) return `${(count / 1000).toFixed(1)}k`;
	return String(count);
}

function monthYear(iso: string): string {
	const date = new Date(iso);
	return date.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function coerceRole(value: string | null | undefined): UserRole {
	return value === "CANDIDATE" ? "CANDIDATE" : "NORMAL";
}

type DbProfileRow = {
	id: string;
	username: string | null;
	display_name: string | null;
	avatar_url: string | null;
	cover_url: string | null;
	subtitle: string | null;
	intro_text: string | null;
	bio: string | null;
	role: string | null;
	is_verified: boolean | null;
	followers_count: number | null;
	created_at: string;
};

type DbPostRow = {
	id: string;
	created_at: string;
	category: PostCategory;
	content: string;
	image_url: string | null;
	status: PostStatus[];
	reactions_count: number;
	comments_count: number;
	shares_count: number;
	sources: Array<{ id: string; title: string; url: string }>;
};

function isUuid(value: string): boolean {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
		value,
	);
}

function normalizeUsername(value: string): string {
	return value.trim().toLowerCase();
}

function isValidUsername(value: string): boolean {
	return /^[a-z0-9_]{3,20}$/.test(value);
}

export default async function ProfilePage({
	params,
}: {
	params: Promise<{ id?: string }>;
}) {
	const resolvedParams = await params;
	const handle = typeof resolvedParams?.id === "string" ? resolvedParams.id : "";
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user) redirect("/login");

	// Guard against broken links like /profile/undefined (would cause Postgres uuid cast errors).
	if (!handle || handle === "undefined" || handle === "null") {
		redirect("/profile");
	}

	const handleIsUuid = isUuid(handle);
	const username = handleIsUuid ? "" : normalizeUsername(handle);
	if (!handleIsUuid && !isValidUsername(username)) {
		return (
			<div className="p-8 max-w-2xl mx-auto">
				<h1 className="text-xl font-bold">Invalid profile link</h1>
				<p className="text-sm text-muted-foreground mt-2">
					This profile username is not valid.
				</p>
				<div className="mt-4 rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
					<p className="text-sm">
						Requested profile: <span className="font-mono">{handle}</span>
					</p>
					<p className="text-sm">
						Logged-in user id: <span className="font-mono">{user.id}</span>
					</p>
				</div>
				<div className="mt-4">
					<Link
						href="/profile"
						className="text-sm font-semibold text-purple-400 hover:underline"
					>
						Go to my profile
					</Link>
				</div>
			</div>
		);
	}

	const profileQuery = supabase.from("profiles").select("*");
	const { data: profileRow, error: profileError } = handleIsUuid
		? await profileQuery.eq("id", handle).single()
		: await profileQuery.eq("username", username).single();
	// If the DB schema isn't applied yet, avoid a confusing 404.
	// Supabase returns an error in this case; `data` will be null.
	if (!profileRow) {
		const errorSummary = profileError
			? `${profileError.code ?? ""}${profileError.code ? ": " : ""}${profileError.message}`
			: "(no error returned)";
		const errorDetails = profileError
			? {
				code: profileError.code ?? null,
				message: profileError.message ?? null,
				details: profileError.details ?? null,
				hint: profileError.hint ?? null,
			}
			: null;

		return (
			<div className="p-8 max-w-2xl mx-auto">
				<h1 className="text-xl font-bold">Profile is not ready yet</h1>
				<p className="text-sm text-muted-foreground mt-2">
					We couldn’t load the profile record for this user.
				</p>
				<div className="mt-4 rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
					<p className="text-sm">
						Requested profile: <span className="font-mono">{handle}</span>
					</p>
					<p className="text-sm">
						Logged-in user id: <span className="font-mono">{user.id}</span>
					</p>
				</div>

				<div className="mt-4 rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
					<p className="text-sm font-semibold">Database error</p>
					<p className="text-sm">
						<span className="font-mono">{errorSummary}</span>
					</p>
					{errorDetails && (errorDetails.details || errorDetails.hint) ? (
						<div className="text-sm text-muted-foreground space-y-1">
							{errorDetails.details ? (
								<p>
									Details: <span className="font-mono">{errorDetails.details}</span>
								</p>
							) : null}
							{errorDetails.hint ? (
								<p>
									Hint: <span className="font-mono">{errorDetails.hint}</span>
								</p>
							) : null}
						</div>
					) : null}
				</div>

				<div className="mt-4 rounded-lg border border-border/50 bg-card/50 p-4">
					<p className="text-sm">
						If you haven’t yet, run <span className="font-mono">supabase/schema.sql</span> in
						 Supabase → SQL Editor, then refresh.
					</p>
					<p className="text-sm text-muted-foreground mt-2">
						If the error mentions <span className="font-mono">permission denied</span>, your
						 database likely needs GRANTs for the <span className="font-mono">authenticated</span>
						 role.
					</p>
				</div>

				<div className="mt-4">
					<Link
						href="/profile"
						className="text-sm font-semibold text-purple-400 hover:underline"
					>
						Go to my profile
					</Link>
				</div>
			</div>
		);
	}

	const profileDb = profileRow as DbProfileRow;
	const role = coerceRole(profileDb.role);
	const name = profileDb.display_name ?? "Unknown";
	const avatarUrl =
		profileDb.avatar_url ?? `https://i.pravatar.cc/150?u=${profileDb.id}`;
	const coverUrl =
		profileDb.cover_url ??
		"https://images.unsplash.com/photo-1541872703-74c5e44368f9?q=80&w=1200&auto=format&fit=crop";

	const { data: postsRows, error: postsError } = await supabase
		.from("posts")
		.select(
			"id, created_at, category, content, image_url, status, reactions_count, comments_count, shares_count, sources:post_sources(id, title, url)",
		)
		.eq("author_id", profileDb.id)
		.order("created_at", { ascending: false })
		.limit(50);

	if (postsError) {
		// Keep page resilient even if posts query fails.
		console.error("Failed to load profile posts", postsError.message);
	}

	const posts: Post[] = (postsRows as DbPostRow[] | null | undefined)?.map(
		(row) => ({
			id: row.id,
			author: {
				id: profileDb.id,
				name,
				avatarUrl,
				role,
			},
			timeAgo: formatTimeAgo(row.created_at),
			contentText: row.content,
			image: row.image_url ?? undefined,
			status: row.status?.length ? row.status : undefined,
			category: row.category,
			stats: {
				reactions: row.reactions_count ?? 0,
				comments: row.comments_count ?? 0,
				shares: row.shares_count ?? 0,
				references: row.sources?.length ?? 0,
			},
		}),
	) ?? [];

	const profile: UserProfile = {
		id: profileDb.id,
		name,
		role,
		avatarUrl,
		coverUrl,
		isVerified: !!profileDb.is_verified,
		followersCount: formatFollowersCount(profileDb.followers_count ?? 0),
		subtitle:
			profileDb.subtitle ?? (role === "CANDIDATE" ? "Public Figure" : "Community Member"),
		introText:
			profileDb.intro_text ??
			'"Welcome to CheckMatePH. Keep it evidence-based."',
		joinDate: monthYear(profileDb.created_at),
		bio: profileDb.bio ?? "No bio yet.",
		posts,
	};

	return <ProfilePageClient profile={profile} />;
}
