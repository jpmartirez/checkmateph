import { createClient } from '@/lib/supabase/server'
import { updatePostStatus } from '@/lib/posts'
import type { ExpertReview } from '@/lib/types'

const REVIEW_THRESHOLD = 3 // minimum reviews before resolving

const RATING_SCORES: Record<string, number> = {
  STRONGLY_AGREE: 2,
  AGREE: 1,
  NEUTRAL: 0,
  DISAGREE: -1,
  STRONGLY_DISAGREE: -2,
}

export async function getReviewsByPost(postId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expert_reviews').select('*').eq('post_id', postId)
  if (error) throw error
  return data as ExpertReview[]
}

export async function getReviewsByExpert(expertId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expert_reviews').select('*').eq('expert_id', expertId)
  if (error) throw error
  return data as ExpertReview[]
}

export async function createReview(review: Pick<ExpertReview, 'expert_id' | 'post_id' | 'rating'>) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('expert_reviews').insert(review).select().single()
  if (error) throw error

  // After every new review, check if we can resolve the post status
  await resolvePostStatusFromReviews(review.post_id)

  return data as ExpertReview
}

// Tallies all reviews for a post and updates its status if threshold is met.
// avg >= 0.5  → VERIFIED
// avg <= -0.5 → DISPUTED
// otherwise   → stays UNDER_REVIEW
export async function resolvePostStatusFromReviews(postId: string) {
  const reviews = await getReviewsByPost(postId)
  if (reviews.length < REVIEW_THRESHOLD) return null

  const total = reviews.reduce((sum, r) => sum + RATING_SCORES[r.rating], 0)
  const avg = total / reviews.length

  if (avg >= 0.5) return updatePostStatus(postId, 'VERIFIED')
  if (avg <= -0.5) return updatePostStatus(postId, 'DISPUTED')
  return null // not enough signal yet
}