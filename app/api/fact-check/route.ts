import { NextResponse } from "next/server";

export async function POST(request: Request) {
	return NextResponse.json(
		{ error: "Fact check route not implemented." },
		{ status: 501 },
	);
}
