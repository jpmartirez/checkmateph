import { createClient } from '@/lib/supabase/server'
import type { Comment } from '@/lib/types'

export async function getCommentsByPost(postId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments').select('*').eq('post_id', postId)
    .order('timestamp', { ascending: true })
  if (error) throw error
  return data as Comment[]
}

export async function createComment(comment: Pick<Comment, 'post_id' | 'user_id' | 'content' | 'category'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('comments').insert(comment).select().single()
  if (error) throw error
  return data as Comment
}

export async function deleteComment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('comments').delete().eq('id', id)
  if (error) throw error
}