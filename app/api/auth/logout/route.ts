import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()

  // Verify the user's session before attempting to sign out
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // This clears the session on the Supabase side
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  // frontend will handle the redirect
  return NextResponse.json({ message: 'Signed out successfully' })
}