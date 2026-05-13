import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // For API routes, you usually parse JSON instead of FormData
  const body = await request.json()
  const { email, password } = body

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ 
    message: 'Check your email for the confirmation link.',
    user: data.user 
  })
}