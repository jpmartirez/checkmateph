import { createClient } from '@/lib/supabase/server'
import type { User, UserProfile, ExpertProfile, GovernmentProfile, PageProfile } from '@/lib/types'

export async function getUserById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users').select('*').eq('id', id).single()
  if (error) throw error
  return data as User
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_profiles').select('*').eq('user_id', userId).single()
  if (error) throw error
  return data as UserProfile
}

export async function upsertUserProfile(userId: string, updates: Partial<Omit<UserProfile, 'id' | 'user_id'>>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ user_id: userId, ...updates })
    .select().single()
  if (error) throw error
  return data as UserProfile
}

export async function getExpertProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expert_profiles').select('*').eq('user_id', userId).single()
  if (error) throw error
  return data as ExpertProfile
}

export async function getGovernmentProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('government_profiles').select('*').eq('user_id', userId).single()
  if (error) throw error
  return data as GovernmentProfile
}

export async function getPageProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('page_profiles').select('*').eq('user_id', userId).single()
  if (error) throw error
  return data as PageProfile
}

export async function updateUserRole(userId: string, role: User['role']) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users').update({ role }).eq('id', userId).select().single()
  if (error) throw error
  return data as User
}