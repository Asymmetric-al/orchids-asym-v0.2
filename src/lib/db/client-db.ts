'use client'

import { createCollection } from '@tanstack/db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { QueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Profile, Missionary, Donor, Post, Donation, Fund, Follow, PostComment } from '@/types/database'

let queryClient: QueryClient | null = null
let supabaseClient: ReturnType<typeof createClient> | null = null

function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
          gcTime: 5 * 60 * 1000,
          refetchOnWindowFocus: false,
        },
      },
    })
  }
  return queryClient
}

export function setQueryClient(client: QueryClient) {
  queryClient = client
}

export const profilesCollection = createCollection<Profile>(
  queryCollectionOptions({
    queryKey: ['profiles'],
    queryClient: getQueryClient(),
    getKey: (item) => item.id,
    queryFn: async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) throw error
      return data ?? []
    },
  })
)

export const missionariesCollection = createCollection<Missionary>(
  queryCollectionOptions({
    queryKey: ['missionaries'],
    queryClient: getQueryClient(),
    getKey: (item) => item.id,
    queryFn: async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.from('missionaries').select('*')
      if (error) throw error
      return data ?? []
    },
  })
)

export const donorsCollection = createCollection<Donor>(
  queryCollectionOptions({
    queryKey: ['donors'],
    queryClient: getQueryClient(),
    getKey: (item) => item.id,
    queryFn: async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.from('donors').select('*')
      if (error) throw error
      return data ?? []
    },
  })
)

export const postsCollection = createCollection<Post>(
  queryCollectionOptions({
    queryKey: ['posts'],
    queryClient: getQueryClient(),
    getKey: (item) => item.id,
    queryFn: async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    onInsert: async (post) => {
      const supabase = getSupabase()
      const { error } = await supabase.from('posts').insert(post)
      if (error) throw error
    },
    onUpdate: async (post) => {
      const supabase = getSupabase()
      const { error } = await supabase.from('posts').update(post).eq('id', post.id)
      if (error) throw error
    },
    onDelete: async (post) => {
      const supabase = getSupabase()
      const { error } = await supabase.from('posts').delete().eq('id', post.id)
      if (error) throw error
    },
  })
)

export const postCommentsCollection = createCollection<PostComment>(
  queryCollectionOptions({
    queryKey: ['post_comments'],
    queryClient: getQueryClient(),
    getKey: (item) => item.id,
    queryFn: async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('post_comments')
        .select('*')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    onInsert: async (comment) => {
      const supabase = getSupabase()
      const { error } = await supabase.from('post_comments').insert(comment)
      if (error) throw error
    },
  })
)

export const donationsCollection = createCollection<Donation>(
  queryCollectionOptions({
    queryKey: ['donations'],
    queryClient: getQueryClient(),
    getKey: (item) => item.id,
    queryFn: async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase
        .from('donations')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
)

export const fundsCollection = createCollection<Fund>(
  queryCollectionOptions({
    queryKey: ['funds'],
    queryClient: getQueryClient(),
    getKey: (item) => item.id,
    queryFn: async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.from('funds').select('*')
      if (error) throw error
      return data ?? []
    },
  })
)

export const followsCollection = createCollection<Follow>(
  queryCollectionOptions({
    queryKey: ['follows'],
    queryClient: getQueryClient(),
    getKey: (item) => item.id,
    queryFn: async () => {
      const supabase = getSupabase()
      const { data, error } = await supabase.from('follows').select('*')
      if (error) throw error
      return data ?? []
    },
    onInsert: async (follow) => {
      const supabase = getSupabase()
      const { error } = await supabase.from('follows').insert(follow)
      if (error) throw error
    },
    onDelete: async (follow) => {
      const supabase = getSupabase()
      const { error } = await supabase.from('follows').delete().eq('id', follow.id)
      if (error) throw error
    },
  })
)
