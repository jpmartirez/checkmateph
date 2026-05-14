import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function getNumber(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function clampScore(value: number): number {
	return Math.min(5, Math.max(1, Math.round(value)));
}

function normalizeStatus(current: string[] | null | undefined, next: string[]): string[] {
	const set = new Set(current ?? []);
	next.forEach((status) => set.add(status));
	return Array.from(set);
}

function removeStatuses(current: string[], toRemove: string[]): string[] {
	const removeSet = new Set(toRemove);
	return current.filter((status) => !removeSet.has(status));
}

export async function GET(
	_request: Request,
	{ params }: { params: Promise<{ postId: string }> },
) {
	const supabase = await createClient();
	const { data: auth } = await supabase.auth.getUser();
	if (!auth?.user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { postId } = await params;
	if (!postId) {
		return NextResponse.json({ error: "Missing post id" }, { status: 400 });
	}

	const { data: reviewRows, error } = await supabase
		.from("expert_reviews")
		.select("average_score")
		.eq("post_id", postId);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	const scores = (reviewRows ?? [])
		.map((row) => (isRecord(row) ? row.average_score : null))
		.filter((score): score is number => typeof score === "number");

	const supported = scores.filter((score) => score >= 3).length;
	const disputed = scores.filter((score) => score < 3).length;
	const total = supported + disputed;
	const leaning =
		total === 0 || supported === disputed
			? "NEUTRAL"
			: supported > disputed
				? "SUPPORTED"
				: "DISPUTED";

	return NextResponse.json({ supported, disputed, total, leaning });
}

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ postId: string }> },
) {
	const supabase = await createClient();
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	const { postId } = await params;
	if (!postId) {
		return NextResponse.json({ error: "Missing post id" }, { status: 400 });
	}

	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	const role = isRecord(profile) ? profile.role : null;
	if (role !== "EXPERT") {
		return NextResponse.json(
			{ error: "Only verified experts can submit reviews" },
			{ status: 403 },
		);
	}

	const { data: postRow, error: postError } = await supabase
		.from("posts")
		.select("id, category")
		.eq("id", postId)
		.single();

	if (postError || !postRow) {
		return NextResponse.json({ error: "Post not found" }, { status: 404 });
	}

	if (postRow.category !== "CLAIM") {
		return NextResponse.json(
			{ error: "Only claim posts can be reviewed" },
			{ status: 400 },
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	if (!isRecord(body)) {
		return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
	}

	const sourceCredibility = getNumber(body.sourceCredibility);
	const evidenceQuality = getNumber(body.evidenceQuality);
	const consistency = getNumber(body.consistency);
	const verifiability = getNumber(body.verifiability);
	const contextAccuracy = getNumber(body.contextAccuracy);

	if (
		sourceCredibility === null ||
		evidenceQuality === null ||
		consistency === null ||
		verifiability === null ||
		contextAccuracy === null
	) {
		return NextResponse.json(
			{ error: "All ratings are required" },
			{ status: 400 },
		);
	}

	const payload = {
		post_id: postId,
		expert_id: user.id,
		source_credibility: clampScore(sourceCredibility),
		evidence_quality: clampScore(evidenceQuality),
		consistency: clampScore(consistency),
		verifiability: clampScore(verifiability),
		context_accuracy: clampScore(contextAccuracy),
	};

	const { error: upsertError } = await supabase
		.from("expert_reviews")
		.upsert(payload, { onConflict: "post_id,expert_id" });

	if (upsertError) {
		return NextResponse.json({ error: upsertError.message }, { status: 500 });
	}

	const { data: reviewRows, error: reviewError } = await supabase
		.from("expert_reviews")
		.select("average_score")
		.eq("post_id", postId);

	if (reviewError) {
		return NextResponse.json({ error: reviewError.message }, { status: 500 });
	}

	const scores = (reviewRows ?? [])
		.map((row) => (isRecord(row) ? row.average_score : null))
		.filter((score): score is number => typeof score === "number");

	const supported = scores.filter((score) => score >= 3).length;
	const disputed = scores.filter((score) => score < 3).length;
	const total = supported + disputed;
	const leaning =
		total === 0 || supported === disputed
			? "NEUTRAL"
			: supported > disputed
				? "SUPPORTED"
				: "DISPUTED";

	const { data: postStatusRow } = await supabase
		.from("posts")
		.select("status")
		.eq("id", postId)
		.single();

	const currentStatus =
		isRecord(postStatusRow) && Array.isArray(postStatusRow.status)
			? (postStatusRow.status.filter((status) => typeof status === "string") as string[])
			: [];

	let nextStatus = removeStatuses(currentStatus, ["UNDER_REVIEW", "SUPPORTED", "DISPUTED"]);
	if (leaning === "SUPPORTED") {
		nextStatus = normalizeStatus(nextStatus, ["SUPPORTED"]);
	} else if (leaning === "DISPUTED") {
		nextStatus = normalizeStatus(nextStatus, ["DISPUTED"]);
	} else if (total === 0) {
		nextStatus = normalizeStatus(nextStatus, ["UNDER_REVIEW"]);
	}

	await supabase.from("posts").update({ status: nextStatus }).eq("id", postId);

	return NextResponse.json({ supported, disputed, total, leaning });
}
