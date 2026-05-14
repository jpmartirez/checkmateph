import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

function normalizeUsername(value: string): string {
	return value.trim().toLowerCase();
}

function isValidUsername(value: string): boolean {
	return /^[a-z0-9_]{3,20}$/.test(value);
}

export default async function ProfileMePage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/login");

	
	const fallbackName = user.email ? user.email.split("@")[0] : "User";
	const meta =
		typeof user.user_metadata === "object" && user.user_metadata !== null
			? (user.user_metadata as Record<string, unknown>)
			: {};
	const metaDisplayName =
		typeof meta.display_name === "string" ? meta.display_name : undefined;
	const metaName = typeof meta.name === "string" ? meta.name : undefined;
	const metaAvatarUrl =
		typeof meta.avatar_url === "string" ? meta.avatar_url : undefined;
	const metaUsername = typeof meta.username === "string" ? meta.username : undefined;

	const defaultCover =
		"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop";

	const { error: upsertError } = await supabase.from("profiles").upsert(
		{
			id: user.id,
			display_name: metaDisplayName ?? metaName ?? fallbackName,
			avatar_url: metaAvatarUrl ?? null,
			role: "NORMAL",
			cover_url: defaultCover,
			subtitle: "Community Member",
			intro_text: '"Welcome to CheckMatePH. Keep it evidence-based."',
			bio: "No bio yet.",
		},
		{ onConflict: "id" },
	);

	if (upsertError) {
		const { error: minimalUpsertError } = await supabase.from("profiles").upsert(
			{
				id: user.id,
				display_name: metaDisplayName ?? metaName ?? fallbackName,
				avatar_url: metaAvatarUrl ?? null,
				role: "NORMAL",
			},
			{ onConflict: "id" },
		);

		if (minimalUpsertError) {
			const errorSummary = `${minimalUpsertError.code ?? ""}${minimalUpsertError.code ? ": " : ""}${minimalUpsertError.message}`;
			return (
				<div className="p-8 max-w-2xl mx-auto">
					<h1 className="text-xl font-bold">Profile setup failed</h1>
					<p className="text-sm text-muted-foreground mt-2">
						We’re signed in, but we can’t create/read your profile row in Supabase.
					</p>
					<div className="mt-4 rounded-lg border border-border/50 bg-card/50 p-4 space-y-2">
						<p className="text-sm">
							Logged-in user id: <span className="font-mono">{user.id}</span>
						</p>
						<p className="text-sm">
							Database error: <span className="font-mono">{errorSummary}</span>
						</p>
					</div>
					<div className="mt-4 rounded-lg border border-border/50 bg-card/50 p-4">
						<p className="text-sm">
							Run <span className="font-mono">supabase/schema.sql</span> in Supabase → SQL Editor.
							 If the error mentions <span className="font-mono">permission denied</span>, ensure
							 the schema includes GRANTs for the <span className="font-mono">authenticated</span> role.
						</p>
					</div>
					<div className="mt-4">
						<Link
							href="/feed"
							className="text-sm font-semibold text-purple-400 hover:underline"
						>
							Back to feed
						</Link>
					</div>
				</div>
			);
		}
	}

	
	const { data: profileRow } = await supabase
		.from("profiles")
		.select("id, username")
		.eq("id", user.id)
		.single();

	let username = typeof profileRow?.username === "string" ? profileRow.username : "";
	if (!username) {
		const base = normalizeUsername(
			(metaUsername && isValidUsername(normalizeUsername(metaUsername))
				? metaUsername
				: fallbackName) || "user",
		);

		const candidates: string[] = [];
		if (isValidUsername(base)) candidates.push(base);
		for (let i = 0; i < 5; i += 1) {
			const suffix = Math.random().toString(36).slice(2, 6);
			const candidate = `${base}_${suffix}`.slice(0, 20);
			if (isValidUsername(candidate)) candidates.push(candidate);
		}

		for (const candidate of candidates) {
			const { error: usernameError } = await supabase
				.from("profiles")
				.update({ username: candidate })
				.eq("id", user.id)
				.is("username", null);
			if (!usernameError) {
				username = candidate;
				break;
			}
		}
	}

	redirect(username ? `/profile/${username}` : `/profile/${user.id}`);
}
