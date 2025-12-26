import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAuthContext, requireAuth, requireRole, type AuthenticatedContext } from '@/lib/auth/context'
import { createAuditLogger } from '@/lib/audit/logger'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthContext()
    requireAuth(auth)
    const ctx = auth as AuthenticatedContext

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: posts, error } = await supabaseAdmin
      .from('posts')
      .select(`
        *,
        author:profiles!missionary_id(id, first_name, last_name, avatar_url)
      `)
      .eq('tenant_id', ctx.tenantId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const postIds = (posts || []).map((p: { id: string }) => p.id)
    const { data: likes } = await supabaseAdmin
      .from('post_likes')
      .select('post_id')
      .in('post_id', postIds)
      .eq('user_id', ctx.userId)

    const { data: prayers } = await supabaseAdmin
      .from('post_prayers')
      .select('post_id')
      .in('post_id', postIds)
      .eq('user_id', ctx.userId)

    const likedSet = new Set((likes || []).map((l: { post_id: string }) => l.post_id))
    const prayedSet = new Set((prayers || []).map((p: { post_id: string }) => p.post_id))

    const postsWithStatus = (posts || []).map((post: { id: string }) => ({
      ...post,
      user_liked: likedSet.has(post.id),
      user_prayed: prayedSet.has(post.id),
    }))

    return NextResponse.json({ posts: postsWithStatus })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: message.includes('Unauthorized') ? 401 : 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext()
    requireRole(auth, ['missionary'])
    const ctx = auth as AuthenticatedContext
    const audit = createAuditLogger(ctx, request)

    const body = await request.json()
    const { content, media = [] } = body

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', ctx.userId)
      .eq('tenant_id', ctx.tenantId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const { data: post, error } = await supabaseAdmin
      .from('posts')
      .insert({
        tenant_id: ctx.tenantId,
        missionary_id: profile.id,
        content: content.trim(),
        media,
      })
      .select(`
        *,
        author:profiles!missionary_id(id, first_name, last_name, avatar_url)
      `)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    await audit.logPost(post.id, 'post_created')
    return NextResponse.json({ post }, { status: 201 })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal error'
    const status = message.includes('Unauthorized') ? 401 : message.includes('Forbidden') ? 403 : 500
    return NextResponse.json({ error: message }, { status })
  }
}