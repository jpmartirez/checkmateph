import { NextResponse } from 'next/server'
import { getPosts, createPost } from '@/lib/posts'
import { getCitationsByPost } from '@/lib/source-citations'
import { saveAICheck, parseAICheckResponse } from '@/lib/ai-source-checks'

export async function GET() {
  const posts = await getPosts()
  return NextResponse.json(posts)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { user_id, content_text, category, source_urls } = body

  // Create the post first
  const post = await createPost({ user_id, content_text, category })

  // If it's a CLAIM, trigger AI fact-check automatically
  if (category === 'CLAIM' && source_urls?.length) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/fact-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: post.id,
          claim: content_text,
          source_urls,
        }),
      })
      // Non-blocking — post is still created even if AI check fails
      if (!res.ok) console.error('AI fact-check failed:', await res.text())
    } catch (err) {
      console.error('AI fact-check error:', err)
    }
  }

  return NextResponse.json(post, { status: 201 })
}