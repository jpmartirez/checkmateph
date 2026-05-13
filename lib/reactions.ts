import { createClient } from '@/lib/supabase/server'
import type { Reaction } from '@/lib/types'

export async function getReactionsByPost(postId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reactions').select('*').eq('post_id', postId)
  if (error) throw error
  return data as Reaction[]
}

export async function addReaction(reaction: Pick<Reaction, 'post_id' | 'user_id' | 'type'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reactions').insert(reaction).select().single()
  if (error) throw error
  return data as Reaction
}

export async function removeReaction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('reactions').delete().eq('id', id)
  if (error) throw error
}