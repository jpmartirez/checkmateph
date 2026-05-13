export type UserRole = 'STANDARD_USER' | 'VERIFIED_POLITICIAN' | 'VERIFIED_EXPERT'
export type PostStatus = 'UNDER_REVIEW' | 'VERIFIED' | 'DISPUTED'
export type PostCategory = 'OPINION' | 'CLAIM'
export type CommentCategory = 'OPINION' | 'CLAIM' | 'COUNTER_CLAIM'
export type ExpertRating = 'STRONGLY_AGREE' | 'AGREE' | 'NEUTRAL' | 'DISAGREE' | 'STRONGLY_DISAGREE'
export type SourcePostCoherence = 'STRONGLY_AGREE' | 'AGREE' | 'NEUTRAL' | 'DISAGREE' | 'STRONGLY_DISAGREE'

export type User = {
  id: string
  email: string
  role: UserRole
}

export type UserProfile = {
  id: string
  user_id: string
  display_name: string
  bio: string
}

export type ExpertProfile = {
  id: string
  user_id: string
  display_name: string
  credentials: string
  field_of_expertise: string
  integrity_score: number
}

export type GovernmentProfile = {
  id: string
  user_id: string
  display_name: string
  political_affiliation: string
  biography: string
}

export type PageProfile = {
  id: string
  user_id: string
  display_name: string
  affiliation: string
  biography: string
}

export type Post = {
  id: string
  user_id: string
  content_text: string
  status: PostStatus
  category: PostCategory
  timestamp: string
}

export type ExpertReview = {
  id: string
  expert_id: string
  post_id: string
  rating: ExpertRating
  timestamp: string
}

export type Comment = {
  id: string
  post_id: string
  user_id: string
  content: string
  category: CommentCategory
  timestamp: string
}

export type SourceCitation = {
  id: string
  post_id: string
  comment_id: string | null
  url: string
}

export type AISourceCheck = {
  id: string
  post_id: string
  verdict: SourcePostCoherence
  confidence: number
  rationale: string
  timestamp: string
}

export type Reaction = {
  id: string
  post_id: string
  user_id: string
  type: string
}