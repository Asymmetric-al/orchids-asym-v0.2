'use client'

import { useLiveQuery, eq } from '@tanstack/react-db'
import {
  postsCollection,
  profilesCollection,
  missionariesCollection,
  donorsCollection,
  donationsCollection,
  fundsCollection,
  followsCollection,
  postCommentsCollection,
} from './collections'

export function usePostsWithAuthors(missionaryId?: string) {
  return useLiveQuery((q) => {
    let query = q.from({ post: postsCollection })
    
    if (missionaryId) {
      query = query.where(({ post }) => eq(post.missionary_id, missionaryId))
    }
    
    return query
      .join(
        { missionary: missionariesCollection },
        ({ post, missionary }) => eq(post.missionary_id, missionary.id)
      )
      .join(
        { profile: profilesCollection },
        ({ missionary, profile }) => eq(missionary.profile_id, profile.id)
      )
      .select(({ post, profile }) => ({
        ...post,
        author: profile,
      }))
      .orderBy(({ post }) => post.created_at, 'desc')
  })
}

export function usePostsForFollowedMissionaries(donorId: string) {
  return useLiveQuery((q) => {
    return q
      .from({ post: postsCollection })
      .join(
        { follow: followsCollection },
        ({ post, follow }) => eq(post.missionary_id, follow.missionary_id)
      )
      .where(({ follow }) => eq(follow.donor_id, donorId))
      .join(
        { missionary: missionariesCollection },
        ({ post, missionary }) => eq(post.missionary_id, missionary.id)
      )
      .join(
        { profile: profilesCollection },
        ({ missionary, profile }) => eq(missionary.profile_id, profile.id)
      )
      .select(({ post, profile }) => ({
        ...post,
        author: profile,
      }))
      .orderBy(({ post }) => post.created_at, 'desc')
  })
}

export function useDonorGivingHistory(donorId: string) {
  return useLiveQuery((q) => {
    return q
      .from({ donation: donationsCollection })
      .where(({ donation }) => eq(donation.donor_id, donorId))
      .join(
        { missionary: missionariesCollection },
        ({ donation, missionary }) => eq(donation.missionary_id, missionary.id)
      )
      .join(
        { profile: profilesCollection },
        ({ missionary, profile }) => eq(missionary.profile_id, profile.id)
      )
      .leftJoin(
        { fund: fundsCollection },
        ({ donation, fund }) => eq(donation.fund_id, fund.id)
      )
      .select(({ donation, profile, fund }) => ({
        ...donation,
        missionary: profile,
        fund: fund ?? null,
      }))
      .orderBy(({ donation }) => donation.created_at, 'desc')
  })
}

export function useMissionarySupporters(missionaryId: string) {
  return useLiveQuery((q) => {
    return q
      .from({ donation: donationsCollection })
      .where(({ donation }) => 
        eq(donation.missionary_id, missionaryId) && eq(donation.status, 'completed')
      )
      .join(
        { donor: donorsCollection },
        ({ donation, donor }) => eq(donation.donor_id, donor.id)
      )
      .join(
        { profile: profilesCollection },
        ({ donor, profile }) => eq(donor.profile_id, profile.id)
      )
      .select(({ profile }) => ({
        ...profile,
        totalGiven: 0,
        donationCount: 0,
      }))
  })
}

export function useCommentsWithAuthors(postId: string) {
  return useLiveQuery((q) => {
    return q
      .from({ comment: postCommentsCollection })
      .where(({ comment }) => eq(comment.post_id, postId))
      .join(
        { profile: profilesCollection },
        ({ comment, profile }) => eq(comment.user_id, profile.user_id)
      )
      .select(({ comment, profile }) => ({
        ...comment,
        author: profile,
      }))
      .orderBy(({ comment }) => comment.created_at, 'asc')
  })
}

export function useFundsWithProgress(missionaryId?: string) {
  return useLiveQuery((q) => {
    let query = q.from({ fund: fundsCollection }).where(({ fund }) => eq(fund.is_active, true))
    
    if (missionaryId) {
      query = query.where(({ fund }) => eq(fund.missionary_id, missionaryId))
    }
    
    return query
      .leftJoin(
        { missionary: missionariesCollection },
        ({ fund, missionary }) => eq(fund.missionary_id, missionary.id)
      )
      .leftJoin(
        { profile: profilesCollection },
        ({ missionary, profile }) => eq(missionary.profile_id, profile.id)
      )
      .select(({ fund, profile }) => ({
        ...fund,
        missionary: profile ?? null,
        progressPercent: fund.target_amount > 0 
          ? Math.round((fund.current_amount / fund.target_amount) * 100) 
          : 0,
      }))
  })
}

export function useMissionaryDashboard(missionaryId: string) {
  return useLiveQuery((q) => {
    return q
      .from({ donation: donationsCollection })
      .where(({ donation }) => eq(donation.missionary_id, missionaryId))
  })
}

export function useMissionaryStats(missionaryId: string) {
  return useLiveQuery((q) => {
    return q
      .from({ donation: donationsCollection })
      .where(({ donation }) => eq(donation.missionary_id, missionaryId))
      .select(({ donation }) => donation)
  })
}
