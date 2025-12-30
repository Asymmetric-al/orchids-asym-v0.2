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
    onInsert: async ({ transaction }) => {
      const supabase = getSupabase()
      const posts = transaction.mutations.map((m) => m.modified)
      const { error } = await supabase.from('posts').insert(posts)
      if (error) throw error
    },
    onUpdate: async ({ transaction }) => {
      const supabase = getSupabase()
      await Promise.all(
        transaction.mutations.map(async (mutation) => {
          const { error } = await supabase
            .from('posts')
            .update(mutation.modified)
            .eq('id', mutation.key as string)
          if (error) throw error
        })
      )
    },
    onDelete: async ({ transaction }) => {
      const supabase = getSupabase()
      const ids = transaction.mutations.map((m) => m.key as string)
      const { error } = await supabase.from('posts').delete().in('id', ids)
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
    onInsert: async ({ transaction }) => {
      const supabase = getSupabase()
      const comments = transaction.mutations.map((m) => m.modified)
      const { error } = await supabase.from('post_comments').insert(comments)
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
    onInsert: async ({ transaction }) => {
      const supabase = getSupabase()
      const follows = transaction.mutations.map((m) => m.modified)
      const { error } = await supabase.from('follows').insert(follows)
      if (error) throw error
    },
    onDelete: async ({ transaction }) => {
      const supabase = getSupabase()
      const ids = transaction.mutations.map((m) => m.key as string)
      const { error } = await supabase.from('follows').delete().in('id', ids)
      if (error) throw error
    },
  })
)
