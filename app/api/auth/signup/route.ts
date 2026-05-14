import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function normalizeUsername(value: string): string {
  return value.trim().toLowerCase();
}

function isValidUsername(value: string): boolean {
  return /^[a-z0-9_]{3,20}$/.test(value);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const body = await request.json();
  const {
    email,
    password,
    username: rawUsername,
    firstName,
    lastName,
  } = body as {
    email?: string;
    password?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };

  const username = typeof rawUsername === "string" ? normalizeUsername(rawUsername) : "";
  const safeFirstName = typeof firstName === "string" ? firstName.trim() : "";
  const safeLastName = typeof lastName === "string" ? lastName.trim() : "";
  const displayName = `${safeFirstName} ${safeLastName}`.trim();

  if (!email || !password || !username || !safeFirstName || !safeLastName) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 },
    );
  }
  if (!isValidUsername(username)) {
    return NextResponse.json(
      { error: "Invalid username. Use 3–20 chars: a-z, 0-9, _." },
      { status: 400 },
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        first_name: safeFirstName,
        last_name: safeLastName,
        display_name: displayName,
      },
    },
  });

  if (error) {
    const message = error.message ?? "Failed to create account.";
    const lower = message.toLowerCase();
    if (lower.includes("username") && (lower.includes("duplicate") || lower.includes("already"))) {
      return NextResponse.json(
        { error: "Username already taken." },
        { status: 400 },
      );
    }
    if (lower.includes("duplicate") && lower.includes("profiles")) {
      return NextResponse.json(
        { error: "Username already taken." },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({
    message: "Check your email for the confirmation link.",
    user: data.user,
  });
}