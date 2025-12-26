import { createCollection, liveQueryCollectionOptions } from '@tanstack/react-db'
import { z } from 'zod'
import type {
  Profile,
  Missionary,
  Donor,
  Post,
  PostComment,
  PostLike,
  PostPrayer,
  Donation,
  Fund,
  RecurringGiving,
  Follow,
} from '@/types/database'

const profileSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  user_id: z.string().uuid(),
  role: z.enum(['donor', 'missionary', 'admin']),
  first_name: z.string(),
  last_name: z.string(),
  email: z.string().email(),
  avatar_url: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

const missionarySchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  bio: z.string().nullable(),
  tagline: z.string().nullable(),
  location: z.string().nullable(),
  phone: z.string().nullable(),
  social_links: z.record(z.string(), z.string()).default({}),
  mission_field: z.string().nullable(),
  funding_goal: z.number().default(0),
  current_funding: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string(),
})

const donorSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  profile_id: z.string().uuid(),
  giving_preferences: z.record(z.string(), z.unknown()).default({}),
  total_given: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string(),
})

const postSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  missionary_id: z.string().uuid(),
  content: z.string(),
  media: z.array(z.object({
    url: z.string(),
    type: z.enum(['image', 'video']),
    width: z.number().optional(),
    height: z.number().optional(),
  })).default([]),
  like_count: z.number().default(0),
  prayer_count: z.number().default(0),
  comment_count: z.number().default(0),
  created_at: z.string(),
  updated_at: z.string(),
})

const postCommentSchema = z.object({
  id: z.string().uuid(),
  post_id: z.string().uuid(),
  user_id: z.string().uuid(),
  content: z.string(),
  created_at: z.string(),
})

const postLikeSchema = z.object({
  id: z.string().uuid(),
  post_id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string(),
})

const postPrayerSchema = z.object({
  id: z.string().uuid(),
  post_id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string(),
})

const donationSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  donor_id: z.string().uuid(),
  missionary_id: z.string().uuid(),
  fund_id: z.string().uuid().nullable(),
  amount: z.number(),
  currency: z.string().default('usd'),
  stripe_payment_intent_id: z.string().nullable(),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']).default('pending'),
  created_at: z.string(),
})

const fundSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  target_amount: z.number().default(0),
  current_amount: z.number().default(0),
  missionary_id: z.string().uuid().nullable(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
})

const recurringGivingSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  donor_id: z.string().uuid(),
  missionary_id: z.string().uuid().nullable(),
  fund_id: z.string().uuid().nullable(),
  amount: z.number(),
  currency: z.string().default('usd'),
  frequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly', 'yearly']),
  next_charge_date: z.string(),
  stripe_subscription_id: z.string().nullable(),
  is_active: z.boolean().default(true),
  created_at: z.string(),
  updated_at: z.string(),
})

const followSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  donor_id: z.string().uuid(),
  missionary_id: z.string().uuid(),
  created_at: z.string(),
})

export const profilesCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'profiles',
    schema: profileSchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('profiles'),
  })
)

export const missionariesCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'missionaries',
    schema: missionarySchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('missionaries'),
  })
)

export const donorsCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'donors',
    schema: donorSchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('donors'),
  })
)

export const postsCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'posts',
    schema: postSchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('posts'),
  })
)

export const postCommentsCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'post_comments',
    schema: postCommentSchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('post_comments'),
  })
)

export const postLikesCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'post_likes',
    schema: postLikeSchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('post_likes'),
  })
)

export const postPrayersCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'post_prayers',
    schema: postPrayerSchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('post_prayers'),
  })
)

export const donationsCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'donations',
    schema: donationSchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('donations'),
  })
)

export const fundsCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'funds',
    schema: fundSchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('funds'),
  })
)

export const recurringGivingCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'recurring_giving',
    schema: recurringGivingSchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('recurring_giving'),
  })
)

export const followsCollection = createCollection(
  liveQueryCollectionOptions({
    id: 'follows',
    schema: followSchema as any,
    getKey: (item: any) => item.id,
    query: (q: any) => q.from('follows'),
  })
)
