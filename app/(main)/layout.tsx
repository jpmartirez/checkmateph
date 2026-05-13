// Sidebar + topbar shell

import React from "react";

// check if user session exists
// uncomment the imports and the client and additional checks
// and make FeedLayout async

// import { createClient } from "@/lib/supabase/server"; //
// import { redirect } from "next/navigation";


export default function FeedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// const supabase = await createClient();
    
	// const { data: { user } } = await supabase.auth.getUser();

	// // If no user is found, redirect to the login page immediately
	// if (!user) {
	// 	redirect("/login");
	// }

	return <div>{children}</div>;
}