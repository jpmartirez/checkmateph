import { createClient } from '@/lib/supabase/server'
import type { Post, PostStatus } from '@/lib/types'

export async function getPosts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts').select('*').order('timestamp', { ascending: false })
  if (error) throw error
  return data as Post[]
}

export async function getPostById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts').select('*').eq('id', id).single()
  if (error) throw error
  return data as Post
}

export async function getPostsByUser(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts').select('*').eq('user_id', userId)
    .order('timestamp', { ascending: false })
  if (error) throw error
  return data as Post[]
}

export async function getPostsByStatus(status: PostStatus) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts').select('*').eq('status', status)
    .order('timestamp', { ascending: false })
  if (error) throw error
  return data as Post[]
}

// Posts always start UNDER_REVIEW — status is never set by the caller
export async function createPost(post: Pick<Post, 'user_id' | 'content_text' | 'category'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .insert({ ...post, status: 'UNDER_REVIEW' })
    .select().single()
  if (error) throw error
  return data as Post
}

export async function updatePostStatus(id: string, status: PostStatus) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts').update({ status }).eq('id', id).select().single()
  if (error) throw error
  return data as Post
}

export async function deletePost(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw error
}