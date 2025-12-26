import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const supabase = await createClient()
  const { postId } = await params
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error: fireError } = await supabase
    .from('post_fires')
    .insert({ post_id: postId, user_id: user.id })

  if (fireError) {
    if (fireError.code === '23505') {
      return NextResponse.json({ error: 'Already fired' }, { status: 409 })
    }
    return NextResponse.json({ error: fireError.message }, { status: 500 })
  }

  // Update count in posts table
  await supabase
    .from('posts')
    .update({ fires_count: (await supabase.from('posts').select('fires_count').eq('id', postId).single()).data.fires_count + 1 })
    .eq('id', postId)

  return NextResponse.json({ success: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const supabase = await createClient()
  const { postId } = await params
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('post_fires')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update count in posts table
  await supabase
    .from('posts')
    .update({ fires_count: Math.max(0, (await supabase.from('posts').select('fires_count').eq('id', postId).single()).data.fires_count - 1) })
    .eq('id', postId)

  return NextResponse.json({ success: true })
}
