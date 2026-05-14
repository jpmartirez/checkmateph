import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
	_request: Request,
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

	const { data: existing } = await supabase
		.from("post_reactions")
		.select("id")
		.eq("post_id", postId)
		.eq("user_id", user.id)
		.single();

	let liked = false;
	let delta = 0;
	if (existing?.id) {
		await supabase.from("post_reactions").delete().eq("id", existing.id);
		liked = false;
		delta = -1;
	} else {
		const { error: insertError } = await supabase.from("post_reactions").insert({
			post_id: postId,
			user_id: user.id,
		});
		if (insertError) {
			return NextResponse.json({ error: insertError.message }, { status: 500 });
		}
		liked = true;
		delta = 1;
	}

	const { data: postRow } = await supabase
		.from("posts")
		.select("reactions_count")
		.eq("id", postId)
		.single();

	const currentCount =
		postRow && typeof postRow.reactions_count === "number"
			? postRow.reactions_count
			: 0;
	const nextCount = Math.max(0, currentCount + delta);

	await supabase
		.from("posts")
		.update({ reactions_count: nextCount })
		.eq("id", postId);

	return NextResponse.json({ liked, count: nextCount });
}
