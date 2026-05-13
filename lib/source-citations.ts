import { createClient } from '@/lib/supabase/server'
import type { SourceCitation } from '@/lib/types'

export async function getCitationsByPost(postId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('source_citations').select('*').eq('post_id', postId)
  if (error) throw error
  return data as SourceCitation[]
}

export async function getCitationsByComment(commentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('source_citations').select('*').eq('comment_id', commentId)
  if (error) throw error
  return data as SourceCitation[]
}

export async function createCitation(citation: Omit<SourceCitation, 'id'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('source_citations').insert(citation).select().single()
  if (error) throw error
  return data as SourceCitation
}

export async function deleteCitation(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('source_citations').delete().eq('id', id)
  if (error) throw error
}