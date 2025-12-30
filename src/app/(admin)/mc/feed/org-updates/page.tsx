'use client'

import React, { useState, useMemo, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  Send,
  Globe,
  ChevronDown,
  X,
  Lock,
  Users,
  Pin,
  Trash2,
  Edit3,
  Clock,
  Building2,
  Image as ImageIcon,
  Loader2,
  MoreHorizontal,
  Eye,
  TrendingUp,
  MessageCircle,
  CheckCircle2,
  FileText,
  Megaphone,
  Heart,
  ChevronRight,
  Settings,
  ExternalLink,
  Calendar,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { PageHeader } from '@/components/page-header'

const RichTextEditor = dynamic(
  () => import('@/components/ui/RichTextEditor').then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="h-[200px] w-full bg-zinc-100 rounded-xl animate-pulse" />,
  }
)

const smoothTransition = { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }

type Visibility = 'public' | 'partners' | 'private'

interface OrgPost {
  id: string
  post_type: string
  content: string
  created_at: string
  updated_at?: string
  likes_count: number
  prayers_count: number
  fires_count: number
  comments_count: number
  visibility: Visibility
  isPinned: boolean
  isPublished: boolean
  media?: { url: string; type: string }[]
}

const MOCK_ORG_POSTS: OrgPost[] = [
  {
    id: 'o1',
    post_type: 'Announcement',
    content: '<p><strong>Year-End Giving Reminder</strong></p><p>All donations made before December 31st will be included in your 2024 tax-deductible statement. Thank you for your continued support!</p>',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes_count: 156,
    prayers_count: 23,
    fires_count: 45,
    comments_count: 12,
    visibility: 'public',
    isPinned: true,
    isPublished: true,
  },
  {
    id: 'o2',
    post_type: 'Newsletter',
    content: '<p><strong>December Newsletter</strong></p><p>This month we celebrate 50 new missionaries joining our network and the completion of 12 major projects across 8 countries.</p>',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    likes_count: 234,
    prayers_count: 56,
    fires_count: 78,
    comments_count: 34,
    visibility: 'public',
    isPinned: false,
    isPublished: true,
    media: [
      { url: 'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=800', type: 'image' }
    ],
  },
  {
    id: 'o3',
    post_type: 'Prayer Request',
    content: '<p>Please join us in prayer for the missionaries serving in regions affected by recent natural disasters. Your prayers and support mean everything.</p>',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    likes_count: 89,
    prayers_count: 312,
    fires_count: 23,
    comments_count: 45,
    visibility: 'partners',
    isPinned: false,
    isPublished: true,
  },
]

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function StatCard({ 
  label, 
  value, 
  icon: Icon,
  description,
}: { 
  label: string
  value: number | string
  icon: React.ElementType
  description?: string
}) {
  return (
    <Card className="rounded-2xl border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
            {description && (
              <p className="text-[10px] text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ComposeSheet({
  open,
  onOpenChange,
  editingPost,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingPost?: OrgPost | null
  onSave: (post: Partial<OrgPost>) => void
}) {
  const [postContent, setPostContent] = useState(editingPost?.content || '')
  const [postType, setPostType] = useState(editingPost?.post_type || 'Announcement')
  const [visibility, setVisibility] = useState<Visibility>(editingPost?.visibility || 'public')
  const [isPinned, setIsPinned] = useState(editingPost?.isPinned || false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: string }[]>(editingPost?.media || [])
  const [isUploading, setIsUploading] = useState(false)

  const handlePublish = async () => {
    if (!postContent.trim()) return
    setIsPublishing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onSave({
      content: postContent,
      post_type: postType,
      visibility,
      isPinned,
      media: selectedMedia,
      isPublished: true,
    })
    
    toast.success(editingPost ? 'Update saved!' : 'Organization update published!')
    setPostContent('')
    setSelectedMedia([])
    setIsPinned(false)
    setIsPublishing(false)
    onOpenChange(false)
  }

  const handleSaveDraft = async () => {
    if (!postContent.trim()) return
    setIsPublishing(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onSave({
      content: postContent,
      post_type: postType,
      visibility,
      isPinned,
      media: selectedMedia,
      isPublished: false,
    })
    
    toast.success('Draft saved!')
    setIsPublishing(false)
    onOpenChange(false)
  }

  const handleAddMedia = async () => {
    setIsUploading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    const demoImages = [
      'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
    ]
    const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)]
    setSelectedMedia(prev => [...prev, { url: randomImage, type: 'image' }])
    setIsUploading(false)
    toast.success('Image added')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl p-0 bg-background flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <SheetTitle className="text-lg font-bold">
                {editingPost ? 'Edit Update' : 'New Organization Update'}
              </SheetTitle>
              <SheetDescription>
                Publish to all donors and missionaries
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Post Type
              </Label>
              <div className="flex gap-2 flex-wrap">
                {['Announcement', 'Newsletter', 'Update', 'Prayer Request'].map((type) => (
                  <Button
                    key={type}
                    variant={postType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPostType(type)}
                    className="text-[10px] h-8 px-4 rounded-xl font-bold uppercase tracking-wider"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Content
              </Label>
              <div className="rounded-xl border border-border overflow-hidden focus-within:ring-2 focus-within:ring-ring/20">
                <RichTextEditor
                  value={postContent}
                  onChange={setPostContent}
                  placeholder={`Write your ${postType.toLowerCase()}...`}
                  className=""
                  contentClassName="py-4 px-4 text-sm min-h-[200px]"
                  toolbarPosition="bottom"
                  proseInvert={false}
                />
              </div>
            </div>

            <AnimatePresence>
              {selectedMedia.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Attached Media
                  </Label>
                  <div className="flex gap-3 flex-wrap">
                    {selectedMedia.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group"
                      >
                        <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-border">
                          <Image src={item.url} alt="" fill className="object-cover" sizes="80px" />
                        </div>
                        <button
                          onClick={() => setSelectedMedia(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddMedia}
                disabled={isUploading}
                className="h-9 px-4 rounded-xl gap-2 font-bold text-[10px] uppercase tracking-wider"
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
                Add Media
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Settings
              </Label>

              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center border">
                    {visibility === 'public' ? <Globe className="h-4 w-4 text-emerald-600" /> : 
                     visibility === 'partners' ? <Users className="h-4 w-4 text-blue-600" /> : 
                     <Lock className="h-4 w-4 text-amber-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Visibility</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{visibility}</p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg gap-1.5">
                      Change <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <DropdownMenuItem onClick={() => setVisibility('public')} className="rounded-lg gap-2">
                      <Globe className="h-4 w-4 text-emerald-600" /> Public
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setVisibility('partners')} className="rounded-lg gap-2">
                      <Users className="h-4 w-4 text-blue-600" /> Partners Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setVisibility('private')} className="rounded-lg gap-2">
                      <Lock className="h-4 w-4 text-amber-600" /> Private
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center border">
                    <Pin className={cn('h-4 w-4', isPinned ? 'text-blue-600' : 'text-zinc-400')} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Pin to Top</p>
                    <p className="text-[10px] text-muted-foreground">Appears at top of all feeds</p>
                  </div>
                </div>
                <Switch checked={isPinned} onCheckedChange={setIsPinned} />
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-xl text-xs text-muted-foreground">
              <Megaphone className="h-4 w-4 shrink-0 text-primary" />
              <span>Organization posts appear in all followers&apos; feeds and can reach thousands of supporters.</span>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter className="p-6 pt-4 border-t bg-zinc-50/50">
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isPublishing || !postContent.trim()}
              className="flex-1 h-11 rounded-xl font-bold"
            >
              Save Draft
            </Button>
            <Button
              onClick={handlePublish}
              disabled={isPublishing || !postContent.trim()}
              className="flex-1 h-11 rounded-xl font-bold gap-2"
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Publish
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function OrgPostCard({
  post,
  onEdit,
  onDelete,
  onTogglePin,
}: {
  post: OrgPost
  onEdit: () => void
  onDelete: () => void
  onTogglePin: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={smoothTransition}
    >
      <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-5">
          <div className="flex gap-4">
            <Avatar className="h-11 w-11 shrink-0 border-2 border-background shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                <Building2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-foreground">Give Hope Global</span>
                    <Badge variant="secondary" className="text-[8px] h-5 px-2 rounded-full font-bold uppercase tracking-wider">
                      {post.post_type}
                    </Badge>
                    {post.isPinned && (
                      <Badge className="text-[8px] h-5 px-2 gap-1 bg-blue-100 text-blue-700 rounded-full font-bold uppercase tracking-wider border-0">
                        <Pin className="h-2.5 w-2.5" /> Pinned
                      </Badge>
                    )}
                    {!post.isPublished && (
                      <Badge variant="outline" className="text-[8px] h-5 px-2 gap-1 rounded-full font-bold uppercase tracking-wider">
                        <Clock className="h-2.5 w-2.5" /> Draft
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground font-medium">{formatTimeAgo(post.created_at)}</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                      {post.visibility === 'public' ? <Globe className="h-3 w-3" /> : 
                       post.visibility === 'partners' ? <Users className="h-3 w-3" /> : 
                       <Lock className="h-3 w-3" />}
                      <span className="capitalize">{post.visibility}</span>
                    </span>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem onClick={onEdit} className="rounded-lg gap-2">
                      <Edit3 className="h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onTogglePin} className="rounded-lg gap-2">
                      <Pin className="h-4 w-4" /> {post.isPinned ? 'Unpin' : 'Pin to Top'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg gap-2">
                      <ExternalLink className="h-4 w-4" /> View Public
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-destructive rounded-lg gap-2">
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div 
                className="prose prose-sm max-w-none text-sm text-foreground/80 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {post.media && post.media.length > 0 && (
                <div className="flex gap-2">
                  {post.media.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden border border-border">
                      <Image src={item.url} alt="" fill className="object-cover" sizes="80px" />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 pt-1 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1">❤️ {post.likes_count}</span>
                <span className="flex items-center gap-1">🙏 {post.prayers_count}</span>
                <span className="flex items-center gap-1">🔥 {post.fires_count}</span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" /> {post.comments_count}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function OrgUpdatesPage() {
  const [posts, setPosts] = useState<OrgPost[]>(MOCK_ORG_POSTS)
  const [composeOpen, setComposeOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<OrgPost | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)

  const stats = useMemo(() => ({
    totalPosts: posts.length,
    totalReach: posts.reduce((sum, p) => sum + p.likes_count + p.prayers_count + p.fires_count, 0),
    pinnedPosts: posts.filter(p => p.isPinned).length,
    drafts: posts.filter(p => !p.isPublished).length,
  }), [posts])

  const handleSavePost = useCallback((postData: Partial<OrgPost>) => {
    if (editingPost) {
      setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, ...postData, updated_at: new Date().toISOString() } : p))
    } else {
      const newPost: OrgPost = {
        id: `o${Date.now()}`,
        post_type: postData.post_type || 'Update',
        content: postData.content || '',
        created_at: new Date().toISOString(),
        likes_count: 0,
        prayers_count: 0,
        fires_count: 0,
        comments_count: 0,
        visibility: postData.visibility || 'public',
        isPinned: postData.isPinned || false,
        isPublished: postData.isPublished || false,
        media: postData.media,
      }
      setPosts(prev => [newPost, ...prev])
    }
    setEditingPost(null)
  }, [editingPost])

  const handleEdit = (post: OrgPost) => {
    setEditingPost(post)
    setComposeOpen(true)
  }

  const handleDelete = (postId: string) => {
    setPostToDelete(postId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (postToDelete) {
      setPosts(prev => prev.filter(p => p.id !== postToDelete))
      toast.success('Post deleted')
    }
    setDeleteDialogOpen(false)
    setPostToDelete(null)
  }

  const handleTogglePin = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, isPinned: !p.isPinned } : p
    ))
    const post = posts.find(p => p.id === postId)
    toast.success(post?.isPinned ? 'Post unpinned' : 'Post pinned')
  }

  return (
    <div className="p-6 pb-20 space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Organization Updates" 
        description="Publish announcements, newsletters, and updates to all your supporters."
      >
        <Link href="/mc/feed">
          <Button variant="outline" size="sm" className="h-9 gap-2 rounded-xl">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Moderation</span>
          </Button>
        </Link>
        <Button onClick={() => setComposeOpen(true)} className="h-9 gap-2 rounded-xl font-bold">
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">New Update</span>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Published" value={stats.totalPosts} icon={FileText} description="Organization posts" />
        <StatCard label="Total Reach" value={stats.totalReach} icon={TrendingUp} description="Total engagements" />
        <StatCard label="Pinned" value={stats.pinnedPosts} icon={Pin} description="Top of feed" />
        <StatCard label="Drafts" value={stats.drafts} icon={Clock} description="Unpublished" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-50 rounded-2xl border-2 border-dashed border-border">
              <Megaphone className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-foreground">No organization updates yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">Create your first update to reach all supporters.</p>
              <Button onClick={() => setComposeOpen(true)} className="rounded-xl font-bold">
                <Send className="h-4 w-4 mr-2" /> Create Update
              </Button>
            </div>
          ) : (
            posts.map((post) => (
              <OrgPostCard
                key={post.id}
                post={post}
                onEdit={() => handleEdit(post)}
                onDelete={() => handleDelete(post.id)}
                onTogglePin={() => handleTogglePin(post.id)}
              />
            ))
          )}
        </div>

        <div className="xl:col-span-4 space-y-6">
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Organization Profile</h3>
                  <p className="text-xs text-muted-foreground">Give Hope Global</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-foreground">Followers</p>
                  <p className="text-[10px] text-muted-foreground">Donors following org updates</p>
                </div>
                <span className="text-2xl font-bold text-foreground">2,847</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-foreground">Missionaries</p>
                  <p className="text-[10px] text-muted-foreground">Active on platform</p>
                </div>
                <span className="text-2xl font-bold text-foreground">156</span>
              </div>
              <Button variant="outline" className="w-full rounded-xl gap-2 font-bold text-[10px] uppercase tracking-wider h-10">
                <Settings className="h-4 w-4" /> Organization Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-zinc-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-zinc-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Quick Actions</h3>
                  <p className="text-xs text-muted-foreground">Common tasks</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start rounded-xl h-11 gap-3 font-medium"
                onClick={() => {
                  setEditingPost(null)
                  setComposeOpen(true)
                }}
              >
                <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Megaphone className="h-4 w-4 text-emerald-600" />
                </div>
                New Announcement
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start rounded-xl h-11 gap-3 font-medium"
                onClick={() => {
                  setEditingPost(null)
                  setComposeOpen(true)
                }}
              >
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                Draft Newsletter
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start rounded-xl h-11 gap-3 font-medium"
                onClick={() => {
                  setEditingPost(null)
                  setComposeOpen(true)
                }}
              >
                <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-purple-600" />
                </div>
                Prayer Request
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-foreground">Engagement Tip</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Posts with images get 2.5x more engagement. Try adding photos to your next update!
                  </p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs font-bold">
                    View Analytics <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ComposeSheet
        open={composeOpen}
        onOpenChange={(open) => {
          setComposeOpen(open)
          if (!open) setEditingPost(null)
        }}
        editingPost={editingPost}
        onSave={handleSavePost}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Update?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The update will be permanently removed from all feeds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 rounded-xl">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
