import { createClient } from '@/lib/supabase/server'
import type { AISourceCheck, SourcePostCoherence } from '@/lib/types'

export async function getAICheckByPost(postId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_source_checks').select('*').eq('post_id', postId).single()
  if (error) throw error
  return data as AISourceCheck
}

export async function saveAICheck(check: Omit<AISourceCheck, 'id' | 'timestamp'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ai_source_checks').insert(check).select().single()
  if (error) throw error
  return data as AISourceCheck
}

// Parses Claude's raw text response into a structured AISourceCheck result
export function parseAICheckResponse(raw: string): {
  verdict: SourcePostCoherence
  confidence: number
  rationale: string
} {
  const clean = raw.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)
  return {
    verdict: parsed.verdict,
    confidence: parsed.confidence,
    rationale: parsed.rationale,
  }
}