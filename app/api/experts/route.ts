import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Expert } from "@/components/main/feed/feed-types";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function getString(value: unknown): string | undefined {
	return typeof value === "string" ? value : undefined;
}

export async function GET() {
	const supabase = await createClient();
	const { data: auth } = await supabase.auth.getUser();
	if (!auth?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { data, error } = await supabase
		.from("profiles")
		.select("id, display_name, avatar_url, subtitle")
		.eq("role", "EXPERT")
		.order("display_name", { ascending: true })
		.limit(12);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	const experts: Expert[] = (data ?? [])
		.map((row) => {
			if (!isRecord(row)) return null;
			const id = getString(row.id);
			const name = getString(row.display_name) ?? "Expert";
			const avatarUrl =
				getString(row.avatar_url) ?? `https://i.pravatar.cc/150?u=${id}`;
			const expertise = getString(row.subtitle) ?? "Verified Expert";
			if (!id) return null;
			return { id, name, avatarUrl, expertise };
		})
		.filter((expert): expert is Expert => expert !== null);

	return NextResponse.json({ experts });
}
