import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = await createClient()

  
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  
  return NextResponse.json({ message: 'Signed out successfully' })
}