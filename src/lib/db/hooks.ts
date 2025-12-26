'use client'

import { useLiveQuery } from '@tanstack/react-db'
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
    let query = q.from({ post: postsCollection as any })
    
    if (missionaryId) {
      query = query.where(({ post }: any) => post.missionary_id === missionaryId)
    }
    
    return query
      .join(
        { missionary: missionariesCollection as any },
        ({ post, missionary }: any) => post.missionary_id === missionary.id
      )
      .join(
        { profile: profilesCollection as any },
        ({ missionary, profile }: any) => missionary.profile_id === profile.id
      )
      .select(({ post, profile }: any) => ({
        ...post,
        author: profile,
      }))
      .orderBy(({ post }: any) => post.created_at, 'desc')
  })
}

export function usePostsForFollowedMissionaries(donorId: string) {
  return useLiveQuery((q) => {
    const followedMissionaryIds = q
      .from({ follow: followsCollection as any })
      .where(({ follow }: any) => follow.donor_id === donorId)
      .select(({ follow }: any) => follow.missionary_id)

    return q
      .from({ post: postsCollection as any })
      .where(({ post }: any) => (post.missionary_id as any).in(followedMissionaryIds))
      .join(
        { missionary: missionariesCollection as any },
        ({ post, missionary }: any) => post.missionary_id === missionary.id
      )
      .join(
        { profile: profilesCollection as any },
        ({ missionary, profile }: any) => missionary.profile_id === profile.id
      )
      .select(({ post, profile }: any) => ({
        ...post,
        author: profile,
      }))
      .orderBy(({ post }: any) => post.created_at, 'desc')
  })
}

export function useDonorGivingHistory(donorId: string) {
  return useLiveQuery((q) => {
    return q
      .from({ donation: donationsCollection as any })
      .where(({ donation }: any) => donation.donor_id === donorId)
      .join(
        { missionary: missionariesCollection as any },
        ({ donation, missionary }: any) => donation.missionary_id === missionary.id
      )
      .join(
        { profile: profilesCollection as any },
        ({ missionary, profile }: any) => missionary.profile_id === profile.id
      )
      .leftJoin(
        { fund: fundsCollection as any },
        ({ donation, fund }: any) => donation.fund_id === fund.id
      )
      .select(({ donation, profile, fund }: any) => ({
        ...donation,
        missionary: profile,
        fund: fund || null,
      }))
      .orderBy(({ donation }: any) => donation.created_at, 'desc')
  })
}

export function useMissionarySupporters(missionaryId: string) {
  return useLiveQuery((q) => {
    return q
      .from({ donation: donationsCollection as any })
      .where(({ donation }: any) => donation.missionary_id === missionaryId && donation.status === 'completed')
      .join(
        { donor: donorsCollection as any },
        ({ donation, donor }: any) => donation.donor_id === donor.id
      )
      .join(
        { profile: profilesCollection as any },
        ({ donor, profile }: any) => donor.profile_id === profile.id
      )
      .select(({ profile }: any) => ({
        ...profile,
        totalGiven: 0,
        donationCount: 0,
      }))
  })
}

export function useCommentsWithAuthors(postId: string) {
  return useLiveQuery((q) => {
    return q
      .from({ comment: postCommentsCollection as any })
      .where(({ comment }: any) => comment.post_id === postId)
      .join(
        { profile: profilesCollection as any },
        ({ comment, profile }: any) => comment.user_id === profile.user_id
      )
      .select(({ comment, profile }: any) => ({
        ...comment,
        author: profile,
      }))
      .orderBy(({ comment }: any) => comment.created_at, 'asc')
  })
}

export function useFundsWithProgress(missionaryId?: string) {
  return useLiveQuery((q) => {
    let query = q.from({ fund: fundsCollection as any }).where(({ fund }: any) => fund.is_active === true)
    
    if (missionaryId) {
      query = query.where(({ fund }: any) => fund.missionary_id === missionaryId)
    }
    
    return query
      .leftJoin(
        { missionary: missionariesCollection as any },
        ({ fund, missionary }: any) => fund.missionary_id === missionary.id
      )
      .leftJoin(
        { profile: profilesCollection as any },
        ({ missionary, profile }: any) => missionary.profile_id === profile.id
      )
      .select(({ fund, profile }: any) => ({
        ...fund,
        missionary: profile || null,
        progressPercent: (fund.target_amount as any) > 0 
          ? Math.round(((fund.current_amount as any) / (fund.target_amount as any)) * 100) 
          : 0,
      }))
  })
}

export function useMissionaryDashboard(missionaryId: string) {
  return useLiveQuery((q) => {
    return {
      donations: q.from({ donation: donationsCollection as any }).where(({ donation }: any) => donation.missionary_id === missionaryId)
    } as any
  })
}

export function useMissionaryStats(missionaryId: string) {
  return useLiveQuery((q) => {
    return q
      .from({ donation: donationsCollection as any })
      .where(({ donation }: any) => donation.missionary_id === missionaryId)
      .select(({ donation }: any) => donation)
  })
}
