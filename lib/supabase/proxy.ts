import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet, headers) {
					cookiesToSet.forEach(({ name, value }) =>
						request.cookies.set(name, value),
					);
					supabaseResponse = NextResponse.next({
						request,
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options),
					);
					Object.entries(headers).forEach(([key, value]) =>
						supabaseResponse.headers.set(key, value),
					);
				},
			},
		},
	);

	// Do not run code between createServerClient and
	// supabase.auth.getClaims(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// IMPORTANT: If you remove getClaims() and you use server-side rendering
	// with the Supabase client, your users may be randomly logged out.
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const isAuthRoute =
		request.nextUrl.pathname.startsWith("/login") ||
		request.nextUrl.pathname.startsWith("/register");
	const isProtectedRoute =
		!isAuthRoute &&
		!request.nextUrl.pathname.startsWith("/api") &&
		request.nextUrl.pathname !== "/";

	if (!user && isProtectedRoute) {
		const loginUrl = request.nextUrl.clone();
		loginUrl.pathname = "/login";
		return NextResponse.redirect(loginUrl);
	}

	if (user && isAuthRoute) {
		const redirectUrl = request.nextUrl.clone();
		redirectUrl.pathname = "/feed"; // redirect logged in users to feed
		return NextResponse.redirect(redirectUrl);
	}

	return supabaseResponse;
}
