'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  Search,
  Filter,
  MoreHorizontal,
  MessageCircle,
  Loader2,
  Globe,
  ChevronDown,
  X,
  Lock,
  Users,
  Check,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Pin,
  Trash2,
  Eye,
  EyeOff,
  Flag,
  AlertTriangle,
  UserX,
  Edit3,
  Clock,
  TrendingUp,
  Activity,
  Building2,
  Send,
  Image as ImageIcon,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Download,
  ArrowUpDown,
  Megaphone,
  Sparkles,
  UserPlus,
  Star,
} from 'lucide-react'
import { motion, AnimatePresence, LayoutGroup } from 'motion/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
    loading: () => <div className="h-[200px] w-full bg-muted rounded-xl animate-pulse" />,
  }
)

const springTransition = { type: 'spring' as const, stiffness: 400, damping: 30 }
const smoothTransition = { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }

type PostStatus = 'published' | 'flagged' | 'hidden' | 'pending_review'
type Visibility = 'public' | 'partners' | 'private'
type ModerationAction = 'approve' | 'hide' | 'flag' | 'delete' | 'edit'

interface ModerationLog {
  id: string
  action: ModerationAction
  actor: string
  timestamp: string
  reason?: string
  previousState?: string
  newState?: string
}

interface Post {
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
  status: PostStatus
  isPinned?: boolean
  isFlagged?: boolean
  flagReason?: string
  media?: { url: string; type: string }[]
  author: {
    id: string
    name: string
    avatar_url: string
    role: 'missionary' | 'organization'
    location?: string
  }
  moderationHistory?: ModerationLog[]
}

interface Comment {
  id: string
  content: string
  created_at: string
  author: {
    id: string
    name: string
    avatar_url: string
  }
  post_id: string
  is_flagged?: boolean
}

interface ModerationStats {
  totalPosts: number
  flaggedPosts: number
  hiddenPosts: number
  pendingReview: number
  totalComments: number
  flaggedComments: number
  actionsToday: number
}

const MOCK_STATS: ModerationStats = {
  totalPosts: 1247,
  flaggedPosts: 12,
  hiddenPosts: 3,
  pendingReview: 8,
  totalComments: 4892,
  flaggedComments: 5,
  actionsToday: 23,
}

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    post_type: 'Update',
    content: '<p>The well project in Chiang Mai is 75% complete. We hit bedrock but the team persevered. Looking forward to the dedication ceremony next week!</p><p>Thank you to all our partners for making this possible. 🙏</p>',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes_count: 45,
    prayers_count: 12,
    fires_count: 8,
    comments_count: 7,
    visibility: 'public',
    status: 'published',
    isPinned: true,
    author: {
      id: 'w1',
      name: 'The Miller Family',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'missionary',
      location: 'Thailand',
    },
    media: [
      { url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1931&auto=format&fit=crop', type: 'image' }
    ],
  },
  {
    id: '2',
    post_type: 'Prayer Request',
    content: '<p>Please pray for our medical supply shipment. It has been held up at customs for 3 days now.</p><p>We are running low on essential antibiotics and insulin.</p>',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes_count: 15,
    prayers_count: 89,
    fires_count: 2,
    comments_count: 3,
    visibility: 'partners',
    status: 'flagged',
    isFlagged: true,
    flagReason: 'Potentially sensitive medical content',
    author: {
      id: 'w2',
      name: 'Dr. Sarah Smith',
      avatar_url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'missionary',
      location: 'Kenya',
    },
  },
  {
    id: '3',
    post_type: 'Story',
    content: '<p>Meet Aroon. He\'s 8 years old and just attended his first English class today. Before our center opened, he spent his days collecting recyclables to help his family.</p><p>His dream is to become a pilot so he can see the world.</p>',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    likes_count: 124,
    prayers_count: 5,
    fires_count: 31,
    comments_count: 12,
    visibility: 'public',
    status: 'published',
    author: {
      id: 'w1',
      name: 'The Miller Family',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'missionary',
      location: 'Thailand',
    },
    media: [
      { url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&auto=format&fit=crop&q=80', type: 'image' }
    ],
  },
  {
    id: '4',
    post_type: 'Announcement',
    content: '<p><strong>Year-End Giving Reminder</strong></p><p>All donations made before December 31st will be included in your 2024 tax-deductible statement. Thank you for your continued support!</p>',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    likes_count: 67,
    prayers_count: 0,
    fires_count: 12,
    comments_count: 4,
    visibility: 'public',
    status: 'published',
    isPinned: true,
    author: {
      id: 'org1',
      name: 'Give Hope Global',
      avatar_url: '',
      role: 'organization',
    },
  },
]

const MOCK_FLAGGED_COMMENTS: Comment[] = [
  {
    id: 'c1',
    content: 'This seems suspicious, how do we know this is legitimate?',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    author: { id: 'u1', name: 'John Doe', avatar_url: '' },
    post_id: '1',
    is_flagged: true,
  },
  {
    id: 'c2',
    content: 'I have concerns about how funds are being used here.',
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    author: { id: 'u2', name: 'Jane Smith', avatar_url: '' },
    post_id: '3',
    is_flagged: true,
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
  trend, 
  trendLabel,
  variant = 'default' 
}: { 
  label: string
  value: number | string
  icon: React.ElementType
  trend?: number
  trendLabel?: string
  variant?: 'default' | 'warning' | 'danger' | 'success'
}) {
  const variantStyles = {
    default: 'bg-card border-border',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-rose-50 border-rose-200',
    success: 'bg-emerald-50 border-emerald-200',
  }
  const iconStyles = {
    default: 'bg-muted text-muted-foreground',
    warning: 'bg-amber-100 text-amber-600',
    danger: 'bg-rose-100 text-rose-600',
    success: 'bg-emerald-100 text-emerald-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={smoothTransition}
    >
      <Card className={cn('border shadow-sm', variantStyles[variant])}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
              {trend !== undefined && (
                <p className={cn(
                  'text-[10px] font-medium flex items-center gap-1',
                  trend > 0 ? 'text-emerald-600' : trend < 0 ? 'text-rose-600' : 'text-muted-foreground'
                )}>
                  <TrendingUp className={cn('h-3 w-3', trend < 0 && 'rotate-180')} />
                  {trend > 0 ? '+' : ''}{trend}% {trendLabel}
                </p>
              )}
            </div>
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', iconStyles[variant])}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ModerationQueue({
  posts,
  onAction,
  isLoading,
}: {
  posts: Post[]
  onAction: (postId: string, action: ModerationAction, reason?: string) => void
  isLoading: boolean
}) {
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [actionDialogOpen, setActionDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ postId: string; action: ModerationAction } | null>(null)
  const [actionReason, setActionReason] = useState('')

  const handleActionClick = (postId: string, action: ModerationAction) => {
    if (action === 'delete' || action === 'hide') {
      setPendingAction({ postId, action })
      setActionDialogOpen(true)
    } else {
      onAction(postId, action)
    }
  }

  const confirmAction = () => {
    if (pendingAction) {
      onAction(pendingAction.postId, pendingAction.action, actionReason)
      setPendingAction(null)
      setActionReason('')
    }
    setActionDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
        <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="font-bold text-lg">All Clear!</h3>
        <p className="text-sm text-muted-foreground mt-1">No items require moderation at this time.</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothTransition, delay: index * 0.05 }}
          >
            <Card className={cn(
              'overflow-hidden border shadow-sm transition-all hover:shadow-md',
              post.isFlagged && 'border-amber-300 bg-amber-50/30'
            )}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Avatar className="h-10 w-10 shrink-0 border border-border">
                    <AvatarImage src={post.author.avatar_url} />
                    <AvatarFallback className="text-xs font-bold">
                      {post.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm truncate">{post.author.name}</span>
                          <Badge variant="secondary" className="text-[8px] h-4 px-1.5 shrink-0">
                            {post.post_type}
                          </Badge>
                          {post.isFlagged && (
                            <Badge variant="destructive" className="text-[8px] h-4 px-1.5 gap-1 shrink-0">
                              <Flag className="h-2.5 w-2.5" /> Flagged
                            </Badge>
                          )}
                          {post.isPinned && (
                            <Badge className="text-[8px] h-4 px-1.5 gap-1 bg-blue-100 text-blue-700 shrink-0">
                              <Pin className="h-2.5 w-2.5" /> Pinned
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground">{formatTimeAgo(post.created_at)}</span>
                          <span className="text-muted-foreground/30">•</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            {post.visibility === 'public' ? <Globe className="h-3 w-3" /> : 
                             post.visibility === 'partners' ? <Users className="h-3 w-3" /> : 
                             <Lock className="h-3 w-3" />}
                            {post.visibility}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                onClick={() => handleActionClick(post.id, 'approve')}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Approve</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-amber-600 hover:bg-amber-50"
                                onClick={() => handleActionClick(post.id, 'hide')}
                              >
                                <EyeOff className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Hide Post</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-rose-600 hover:bg-rose-50"
                                onClick={() => handleActionClick(post.id, 'delete')}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete Post</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => setSelectedPost(post)}>
                              <Eye className="h-4 w-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit3 className="h-4 w-4 mr-2" /> Edit Post
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <UserX className="h-4 w-4 mr-2" /> View Author Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-amber-600">
                              <AlertTriangle className="h-4 w-4 mr-2" /> Warn Author
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {post.flagReason && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-100 rounded-lg text-amber-800">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-medium">{post.flagReason}</span>
                      </div>
                    )}

                    <div 
                      className="prose prose-sm max-w-none text-sm text-foreground/80 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {post.media && post.media.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {post.media.slice(0, 3).map((item, idx) => (
                          <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border border-border">
                            <Image src={item.url} alt="" fill className="object-cover" sizes="64px" />
                          </div>
                        ))}
                        {post.media.length > 3 && (
                          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                            +{post.media.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
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
        ))}
      </div>

      <AlertDialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.action === 'delete' ? 'Delete Post?' : 'Hide Post?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.action === 'delete' 
                ? 'This action cannot be undone. The post will be permanently removed.' 
                : 'This post will be hidden from all feeds. You can restore it later.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Reason (optional)
            </Label>
            <Input
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Add a reason for this action..."
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={pendingAction?.action === 'delete' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {pendingAction?.action === 'delete' ? 'Delete' : 'Hide'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
            <DialogDescription>Review and manage this post</DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedPost.author.avatar_url} />
                  <AvatarFallback>{selectedPost.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{selectedPost.author.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedPost.author.location}</p>
                </div>
              </div>
              
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedPost.content }}
              />

              {selectedPost.media && selectedPost.media.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {selectedPost.media.map((item, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden">
                      <Image src={item.url} alt="" fill className="object-cover" sizes="300px" />
                    </div>
                  ))}
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{selectedPost.likes_count}</p>
                  <p className="text-xs text-muted-foreground">Likes</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{selectedPost.prayers_count}</p>
                  <p className="text-xs text-muted-foreground">Prayers</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{selectedPost.fires_count}</p>
                  <p className="text-xs text-muted-foreground">Fires</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{selectedPost.comments_count}</p>
                  <p className="text-xs text-muted-foreground">Comments</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPost(null)}>Close</Button>
            <Button onClick={() => { handleActionClick(selectedPost!.id, 'approve'); setSelectedPost(null); }}>
              <Check className="h-4 w-4 mr-2" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function AllPostsFeed({
  posts,
  searchQuery,
  filterVisibility,
  filterType,
  sortBy,
  onAction,
}: {
  posts: Post[]
  searchQuery: string
  filterVisibility: string
  filterType: string
  sortBy: string
  onAction: (postId: string, action: ModerationAction) => void
}) {
  const filteredPosts = useMemo(() => {
    let result = [...posts]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p => 
        p.content.toLowerCase().includes(query) ||
        p.author.name.toLowerCase().includes(query)
      )
    }

    if (filterVisibility !== 'all') {
      result = result.filter(p => p.visibility === filterVisibility)
    }

    if (filterType !== 'all') {
      result = result.filter(p => p.post_type.toLowerCase() === filterType.toLowerCase())
    }

    if (sortBy === 'engagement') {
      result.sort((a, b) => (b.likes_count + b.prayers_count + b.fires_count) - (a.likes_count + a.prayers_count + a.fires_count))
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return result
  }, [posts, searchQuery, filterVisibility, filterType, sortBy])

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed border-border">
        <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-bold text-lg">No posts found</h3>
        <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredPosts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothTransition, delay: index * 0.03 }}
        >
          <Card className={cn(
            'overflow-hidden border shadow-sm hover:shadow-md transition-all',
            post.status === 'hidden' && 'opacity-60',
            post.isFlagged && 'border-amber-300'
          )}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Avatar className="h-10 w-10 shrink-0 border border-border">
                  <AvatarImage src={post.author.avatar_url} />
                  <AvatarFallback className="text-xs font-bold">
                    {post.author.role === 'organization' ? (
                      <Building2 className="h-4 w-4" />
                    ) : (
                      post.author.name.charAt(0)
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm truncate">{post.author.name}</span>
                        {post.author.role === 'organization' && (
                          <Badge className="text-[8px] h-4 px-1.5 bg-primary/10 text-primary shrink-0">
                            <Building2 className="h-2.5 w-2.5 mr-0.5" /> Org
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[8px] h-4 px-1.5 shrink-0">
                          {post.post_type}
                        </Badge>
                        {post.status === 'hidden' && (
                          <Badge variant="outline" className="text-[8px] h-4 px-1.5 gap-1 shrink-0">
                            <EyeOff className="h-2.5 w-2.5" /> Hidden
                          </Badge>
                        )}
                        {post.isFlagged && (
                          <Badge variant="destructive" className="text-[8px] h-4 px-1.5 gap-1 shrink-0">
                            <Flag className="h-2.5 w-2.5" /> Flagged
                          </Badge>
                        )}
                        {post.isPinned && (
                          <Badge className="text-[8px] h-4 px-1.5 gap-1 bg-blue-100 text-blue-700 shrink-0">
                            <Pin className="h-2.5 w-2.5" /> Pinned
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">{formatTimeAgo(post.created_at)}</span>
                        {post.author.location && (
                          <>
                            <span className="text-muted-foreground/30">•</span>
                            <span className="text-[10px] text-muted-foreground">{post.author.location}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">Quick Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onAction(post.id, 'edit')}>
                          <Edit3 className="h-4 w-4 mr-2" /> Edit Post
                        </DropdownMenuItem>
                        {post.isPinned ? (
                          <DropdownMenuItem>
                            <Pin className="h-4 w-4 mr-2" /> Unpin Post
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>
                            <Pin className="h-4 w-4 mr-2" /> Pin to Top
                          </DropdownMenuItem>
                        )}
                        {post.status === 'hidden' ? (
                          <DropdownMenuItem onClick={() => onAction(post.id, 'approve')}>
                            <Eye className="h-4 w-4 mr-2" /> Restore Post
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onAction(post.id, 'hide')}>
                            <EyeOff className="h-4 w-4 mr-2" /> Hide Post
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <ExternalLink className="h-4 w-4 mr-2" /> View Public Post
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserX className="h-4 w-4 mr-2" /> View Author
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => onAction(post.id, 'delete')}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Post
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div 
                    className="prose prose-sm max-w-none text-sm text-foreground/80 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  {post.media && post.media.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {post.media.slice(0, 4).map((item, idx) => (
                        <div key={idx} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border">
                          <Image src={item.url} alt="" fill className="object-cover" sizes="80px" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">❤️ {post.likes_count}</span>
                    <span className="flex items-center gap-1">🙏 {post.prayers_count}</span>
                    <span className="flex items-center gap-1">🔥 {post.fires_count}</span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {post.comments_count}
                    </span>
                    <span className="ml-auto flex items-center gap-1">
                      {post.visibility === 'public' ? <Globe className="h-3 w-3" /> : 
                       post.visibility === 'partners' ? <Users className="h-3 w-3" /> : 
                       <Lock className="h-3 w-3" />}
                      {post.visibility}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

function OrgPublishingPanel() {
  const [postContent, setPostContent] = useState('')
  const [postType, setPostType] = useState('Announcement')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [isPinned, setIsPinned] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<{ url: string; type: string }[]>([])

  const handlePublish = async () => {
    if (!postContent.trim()) return
    setIsPublishing(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('Organization update published!')
    setPostContent('')
    setSelectedMedia([])
    setIsPinned(false)
    setIsPublishing(false)
  }

  const handleAddMedia = () => {
    const demoImages = [
      'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800',
    ]
    const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)]
    setSelectedMedia(prev => [...prev, { url: randomImage, type: 'image' }])
    toast.success('Image added')
  }

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Organization Updates</h3>
            <p className="text-xs text-muted-foreground">Publish to all donors & missionaries</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['Announcement', 'Newsletter', 'Update', 'Prayer Request'].map((type) => (
            <Button
              key={type}
              variant={postType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPostType(type)}
              className="text-[10px] h-7 px-3 shrink-0"
            >
              {type}
            </Button>
          ))}
        </div>

        <div className="rounded-xl border border-border overflow-hidden focus-within:ring-2 focus-within:ring-ring/20">
          <RichTextEditor
            value={postContent}
            onChange={setPostContent}
            placeholder={`Write your ${postType.toLowerCase()}...`}
            className=""
            contentClassName="py-3 px-4 text-sm min-h-[120px]"
            toolbarPosition="bottom"
            proseInvert={false}
            actions={
              <div className="flex flex-col gap-3 w-full">
                {selectedMedia.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {selectedMedia.map((item, idx) => (
                      <div key={idx} className="relative h-14 w-14 rounded-lg overflow-hidden border shrink-0">
                        <Image src={item.url} alt="" fill className="object-cover" sizes="56px" />
                        <button
                          onClick={() => setSelectedMedia(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <Button variant="ghost" size="sm" onClick={handleAddMedia} className="h-8 text-[10px] gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" /> Media
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 text-[10px] gap-1.5">
                        {visibility === 'public' ? <Globe className="h-3.5 w-3.5" /> : 
                         visibility === 'partners' ? <Users className="h-3.5 w-3.5" /> : 
                         <Lock className="h-3.5 w-3.5" />}
                        {visibility}
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem onClick={() => setVisibility('public')}>
                        <Globe className="h-4 w-4 mr-2" /> Public
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setVisibility('partners')}>
                        <Users className="h-4 w-4 mr-2" /> Partners Only
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setVisibility('private')}>
                        <Lock className="h-4 w-4 mr-2" /> Private
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex items-center gap-2 ml-auto">
                    <Label htmlFor="pin-toggle" className="text-[10px] text-muted-foreground cursor-pointer">
                      Pin
                    </Label>
                    <Switch
                      id="pin-toggle"
                      checked={isPinned}
                      onCheckedChange={setIsPinned}
                      className="scale-75"
                    />
                  </div>

                  <Button
                    onClick={handlePublish}
                    disabled={!postContent.trim() || isPublishing}
                    size="sm"
                    className="h-8 px-4 text-[10px]"
                  >
                    {isPublishing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                    Publish
                  </Button>
                </div>
              </div>
            }
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground">
          <Megaphone className="h-4 w-4 shrink-0" />
          <span>Organization posts appear in all followers&apos; feeds and can be pinned globally.</span>
        </div>
      </CardContent>
    </Card>
  )
}

function FlaggedCommentsPanel({
  comments,
  onAction,
}: {
  comments: Comment[]
  onAction: (commentId: string, action: 'approve' | 'delete') => void
}) {
  if (comments.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-xl border-2 border-dashed border-border">
        <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
        <h3 className="font-bold">No flagged comments</h3>
        <p className="text-xs text-muted-foreground mt-1">All comments are approved.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <Card key={comment.id} className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-3">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="text-xs">{comment.author.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{comment.author.name}</span>
                  <span className="text-[10px] text-muted-foreground">{formatTimeAgo(comment.created_at)}</span>
                </div>
                <p className="text-xs text-foreground/80">{comment.content}</p>
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] text-emerald-600 hover:bg-emerald-50"
                    onClick={() => onAction(comment.id, 'approve')}
                  >
                    <Check className="h-3 w-3 mr-1" /> Approve
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] text-rose-600 hover:bg-rose-50"
                    onClick={() => onAction(comment.id, 'delete')}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function FeedHubPage() {
  const [activeTab, setActiveTab] = useState('moderation')
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [flaggedComments, setFlaggedComments] = useState<Comment[]>(MOCK_FLAGGED_COMMENTS)
  const [stats] = useState<ModerationStats>(MOCK_STATS)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVisibility, setFilterVisibility] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const flaggedPosts = useMemo(() => posts.filter(p => p.isFlagged || p.status === 'pending_review'), [posts])

  const handlePostAction = useCallback((postId: string, action: ModerationAction, reason?: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        switch (action) {
          case 'approve':
            toast.success('Post approved')
            return { ...post, status: 'published' as PostStatus, isFlagged: false, flagReason: undefined }
          case 'hide':
            toast.success('Post hidden')
            return { ...post, status: 'hidden' as PostStatus }
          case 'flag':
            toast.success('Post flagged for review')
            return { ...post, isFlagged: true, flagReason: reason }
          case 'delete':
            toast.success('Post deleted')
            return post
          default:
            return post
        }
      }
      return post
    }))

    if (action === 'delete') {
      setPosts(prev => prev.filter(p => p.id !== postId))
    }
  }, [])

  const handleCommentAction = useCallback((commentId: string, action: 'approve' | 'delete') => {
    if (action === 'delete') {
      setFlaggedComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('Comment deleted')
    } else {
      setFlaggedComments(prev => prev.filter(c => c.id !== commentId))
      toast.success('Comment approved')
    }
  }, [])

  return (
    <div className="max-w-[1600px] mx-auto pb-20">
      <PageHeader 
        title="Feed Hub" 
        description="Moderate content, manage organization publishing, and oversee all feed activity."
      >
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export Report</span>
        </Button>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <StatCard label="Total Posts" value={stats.totalPosts} icon={Activity} />
        <StatCard label="Flagged" value={stats.flaggedPosts} icon={Flag} variant="warning" />
        <StatCard label="Hidden" value={stats.hiddenPosts} icon={EyeOff} />
        <StatCard label="Pending Review" value={stats.pendingReview} icon={Clock} variant="warning" />
        <StatCard label="Comments" value={stats.totalComments} icon={MessageCircle} />
        <StatCard label="Flagged Comments" value={stats.flaggedComments} icon={AlertTriangle} variant={stats.flaggedComments > 0 ? 'danger' : 'default'} />
        <StatCard label="Actions Today" value={stats.actionsToday} icon={ShieldCheck} variant="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <TabsList className="bg-muted/50 p-1 rounded-xl h-auto border border-border">
                <TabsTrigger
                  value="moderation"
                  className="rounded-lg px-4 py-2 font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <ShieldAlert className="h-3.5 w-3.5 mr-1.5" />
                  Moderation Queue
                  {flaggedPosts.length > 0 && (
                    <Badge className="ml-2 h-4 px-1.5 text-[9px] bg-amber-500">
                      {flaggedPosts.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="rounded-lg px-4 py-2 font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:shadow-sm"
                >
                  <Globe className="h-3.5 w-3.5 mr-1.5" />
                  All Posts
                </TabsTrigger>
              </TabsList>

              {activeTab === 'all' && (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-9 w-full sm:w-64"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 gap-1.5">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filter</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">Visibility</DropdownMenuLabel>
                      <DropdownMenuCheckboxItem checked={filterVisibility === 'all'} onCheckedChange={() => setFilterVisibility('all')}>
                        All
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked={filterVisibility === 'public'} onCheckedChange={() => setFilterVisibility('public')}>
                        Public
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked={filterVisibility === 'partners'} onCheckedChange={() => setFilterVisibility('partners')}>
                        Partners
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked={filterVisibility === 'private'} onCheckedChange={() => setFilterVisibility('private')}>
                        Private
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-[10px] uppercase tracking-wider">Type</DropdownMenuLabel>
                      <DropdownMenuCheckboxItem checked={filterType === 'all'} onCheckedChange={() => setFilterType('all')}>
                        All Types
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked={filterType === 'update'} onCheckedChange={() => setFilterType('update')}>
                        Updates
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked={filterType === 'prayer request'} onCheckedChange={() => setFilterType('prayer request')}>
                        Prayer Requests
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked={filterType === 'story'} onCheckedChange={() => setFilterType('story')}>
                        Stories
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem checked={filterType === 'announcement'} onCheckedChange={() => setFilterType('announcement')}>
                        Announcements
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-9 w-32">
                      <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <TabsContent value="moderation" className="mt-0">
              <ModerationQueue
                posts={flaggedPosts}
                onAction={handlePostAction}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="all" className="mt-0">
              <AllPostsFeed
                posts={posts}
                searchQuery={searchQuery}
                filterVisibility={filterVisibility}
                filterType={filterType}
                sortBy={sortBy}
                onAction={handlePostAction}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <OrgPublishingPanel />

          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Flagged Comments</h3>
                    <p className="text-xs text-muted-foreground">{flaggedComments.length} need review</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FlaggedCommentsPanel comments={flaggedComments} onAction={handleCommentAction} />
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Recent Activity</h3>
                  <p className="text-xs text-muted-foreground">Moderation actions</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { action: 'Approved post', actor: 'Admin User', time: '5m ago', icon: Check, color: 'text-emerald-600' },
                { action: 'Flagged comment', actor: 'System', time: '12m ago', icon: Flag, color: 'text-amber-600' },
                { action: 'Hidden post', actor: 'Admin User', time: '1h ago', icon: EyeOff, color: 'text-muted-foreground' },
                { action: 'Deleted comment', actor: 'Admin User', time: '2h ago', icon: Trash2, color: 'text-rose-600' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <div className={cn('h-7 w-7 rounded-full bg-muted flex items-center justify-center', item.color)}>
                    <item.icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.action}</p>
                    <p className="text-muted-foreground">{item.actor}</p>
                  </div>
                  <span className="text-muted-foreground shrink-0">{item.time}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm">AI Moderation</h3>
                  <p className="text-xs text-muted-foreground">
                    Automatic flagging is enabled. Content with potential policy violations will be queued for review.
                  </p>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                    Configure Settings <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
