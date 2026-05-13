import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Parsing JSON from the body instead of FormData
  const body = await request.json()
  const { email, password } = body

  // Attempting to sign in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // In an API, we return the error code so the frontend can handle it
  if (error) {
    return NextResponse.json(
      { error: "Invalid login credentials" }, 
      { status: 401 }
    )
  }

  // Success: Return a clear message
  // The middleware (proxy.ts) handles the actual cookie setting/refreshing
  return NextResponse.json({ message: 'Login successful' })
}