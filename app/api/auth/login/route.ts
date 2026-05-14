import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
	const supabase = await createClient();

	
	const body = await request.json();
	const { email, password } = body;

	
	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	});

	
	if (error) {
		return NextResponse.json(
			{ error: "Invalid login credentials" },
			{ status: 401 },
		);
	}

	
	return NextResponse.json({ message: "Login successful" });
}
