'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import {
  Send,
  MoreHorizontal,
  MessageCircle,
  Loader2,
  Globe,
  ChevronDown,
  X,
  Lock,
  Users,
  Check,
  CornerDownRight,
  ShieldCheck,
  ShieldAlert,
  ShieldHalf,
  Shield,
  Settings,
  Pin,
  Trash2,
  Save,
  Clock,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(
  () => import('@/components/ui/RichTextEditor').then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="h-[250px] w-full bg-muted rounded-2xl animate-pulse" />,
  }
)

type Visibility = 'public' | 'partners' | 'private'
type SecurityLevel = 'high' | 'medium' | 'low'
type AccessLevel = 'view' | 'comment'
type PostStatus = 'published' | 'draft'

interface Follower {
  id: string
  name: string
  email: string
  avatar: string
  isDonor: boolean
  accessLevel: AccessLevel
  status: 'pending' | 'approved'
  date: string
  handle?: string
  initials: string
}

interface Post {
  id: string
  post_type: string
  content: string
  created_at: string
  likes_count?: number
  prayers_count?: number
  fires_count?: number
  comments?: any[]
  media?: any[]
  isPinned?: boolean
  visibility: Visibility
  status: PostStatus
  user_liked?: boolean
  user_prayed?: boolean
  user_fired?: boolean
  author?: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string
  }
}

const INITIAL_FOLLOWERS: Follower[] = [
  {
    id: 'f1',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    avatar: 'https://picsum.photos/id/101/100/100',
    isDonor: true,
    accessLevel: 'comment',
    status: 'approved',
    date: '2 hours ago',
    handle: '@wintersoldier',
    initials: 'SC',
  },
  {
    id: 'f2',
    name: 'Kyle Reese',
    email: 'kyle@future.org',
    avatar: 'https://picsum.photos/id/102/100/100',
    isDonor: false,
    accessLevel: 'view',
    status: 'pending',
    date: '1 day ago',
    handle: '@cap_america',
    initials: 'KR',
  },
  {
    id: 'f3',
    name: 'John Doe',
    email: 'john@unknown.com',
    avatar: 'https://picsum.photos/id/103/100/100',
    isDonor: false,
    accessLevel: 'view',
    status: 'pending',
    date: '3 days ago',
    handle: '@shield_maria',
    initials: 'JD',
  },
]

function FollowerRequestItem({
  request,
  onResolve,
}: {
  request: Follower
  onResolve: (id: string, approved: boolean) => void
}) {
  const [status, setStatus] = useState<'pending' | 'processing' | 'approved' | 'ignored' | 'collapsing'>('pending')

  const handleAction = async (action: 'approve' | 'ignore') => {
    setStatus('processing')
    await new Promise((resolve) => setTimeout(resolve, 800))
    setStatus(action === 'approve' ? 'approved' : 'ignored')

    setTimeout(() => {
      setStatus('collapsing')
      setTimeout(() => {
        onResolve(request.id, action === 'approve')
      }, 400)
    }, 1500)
  }

  if (status === 'collapsing') {
    return <div className="h-0 opacity-0 overflow-hidden transition-all duration-500" />
  }

  return (
    <div
      className={cn(
        'transition-all duration-500 ease-in-out border-b border-border last:border-0 p-4',
        status === 'approved' || status === 'ignored' ? 'bg-muted/50' : 'bg-card'
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={request.avatar} />
            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-bold">
              {request.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-foreground truncate">{request.name}</p>
                <p className="text-[10px] text-muted-foreground truncate font-medium">
                  {request.handle || request.email}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground">{request.date}</span>
            </div>
          </div>
        </div>

        <div className="h-9 relative">
          {status === 'pending' && (
            <div className="flex gap-2 absolute inset-0">
              <Button
                size="sm"
                variant="maia"
                className="flex-1 h-9 text-[10px] uppercase tracking-wider rounded-xl"
                onClick={() => handleAction('approve')}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="maia-outline"
                className="flex-1 h-9 text-[10px] uppercase tracking-wider rounded-xl"
                onClick={() => handleAction('ignore')}
              >
                Ignore
              </Button>
            </div>
          )}

          {status === 'processing' && (
            <div className="flex items-center justify-center h-full absolute inset-0">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {status === 'approved' && (
            <div className="flex items-center gap-2 h-full absolute inset-0 text-emerald-600 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-emerald-100 rounded-full p-1">
                <Check className="h-3 w-3" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Accepted</span>
            </div>
          )}

          {status === 'ignored' && (
            <div className="flex items-center gap-2 h-full absolute inset-0 text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-muted rounded-full p-1">
                <X className="h-3 w-3" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Removed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FloatingEmoji({ emoji }: { emoji: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        scale: [0, 1.8, 1.2, 0.8],
        y: [-20, -120],
        x: (Math.random() - 0.5) * 80,
        rotate: (Math.random() - 0.5) * 90,
      }}
      transition={{
        duration: 1.2,
        ease: 'easeOut',
        times: [0, 0.2, 0.8, 1],
      }}
      className="absolute pointer-events-none z-50 text-2xl filter drop-shadow-md"
    >
      {emoji}
    </motion.div>
  )
}

function ReactionButton({
  isActive,
  count,
  type,
  label,
  onClick,
}: {
  isActive: boolean
  count: number
  type: 'heart' | 'fire' | 'prayer'
  label: string
  onClick: () => void
}) {
  const [particles, setParticles] = useState<{ id: number; emoji: string }[]>([])

  const config = {
    heart: {
      emoji: '❤️',
      activeColor: 'text-rose-600',
      bg: 'bg-rose-50',
      hoverBg: 'hover:bg-rose-50',
    },
    fire: {
      emoji: '🔥',
      activeColor: 'text-amber-600',
      bg: 'bg-amber-50',
      hoverBg: 'hover:bg-amber-50',
    },
    prayer: {
      emoji: '🙏',
      activeColor: 'text-indigo-600',
      bg: 'bg-indigo-50',
      hoverBg: 'hover:bg-indigo-50',
    },
  }

  const { emoji, activeColor, bg, hoverBg } = config[type]

  const handleClick = () => {
    if (!isActive) {
      const newParticles = Array.from({ length: 8 }).map((_, i) => ({
        id: Date.now() + i,
        emoji: emoji,
      }))
      setParticles((prev) => [...prev, ...newParticles])
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)))
      }, 1500)
    }
    onClick()
  }

  return (
    <div className="relative">
      <AnimatePresence>
        {particles.map((p) => (
          <FloatingEmoji key={p.id} emoji={p.emoji} />
        ))}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
        className={cn(
          'relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 font-bold text-[11px] sm:text-xs uppercase tracking-wide overflow-hidden',
          isActive ? cn(bg, activeColor, 'shadow-sm ring-1 ring-black/5') : 'text-muted-foreground bg-card border border-border',
          !isActive && hoverBg
        )}
      >
        <motion.div
          className="text-base sm:text-lg relative z-10 select-none"
          animate={
            isActive
              ? {
                  scale: [1, 1.3, 1],
                  rotate: [0, 10, -10, 0],
                }
              : {}
          }
          transition={{ duration: 0.4 }}
        >
          {emoji}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="relative z-10 tabular-nums min-w-[1ch]"
          >
            {count > 0 ? count : label}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  )
}

function CommentSection({
  comments,
  onAddComment,
  onDeleteComment,
  canManageComments,
}: {
  comments: any[]
  onAddComment: (text: string, parentId?: string) => void
  onDeleteComment: (commentId: string, parentId?: string) => void
  canManageComments: boolean
}) {
  const [text, setText] = useState('')
  const [replyText, setReplyText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const submitReply = (parentId: string) => {
    if (replyText.trim()) {
      onAddComment(replyText, parentId)
      setReplyText('')
      setReplyingTo(null)
    }
  }

  return (
    <div className="bg-muted/30 rounded-b-2xl border-t border-border p-4 sm:p-6 space-y-4 sm:space-y-6">
      {comments.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="group">
              <div className="flex gap-3 sm:gap-4 text-sm">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 bg-card border border-border mt-1 shadow-sm">
                  <AvatarFallback className="text-[10px] text-muted-foreground font-bold">
                    {comment.avatar || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="bg-card p-3 sm:p-4 rounded-2xl rounded-tl-none border border-border shadow-sm inline-block min-w-[200px] sm:min-w-[240px] relative">
                    <div className="flex items-center justify-between gap-2 sm:gap-4 mb-1">
                      <span className="font-bold text-foreground text-xs">
                        {comment.author?.full_name || 'Anonymous'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                        {canManageComments && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-muted-foreground/50 hover:text-destructive transition-colors">
                                <MoreHorizontal className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl p-1 shadow-lg border-border">
                              <DropdownMenuItem
                                onClick={() => onDeleteComment(comment.id)}
                                className="text-destructive font-bold text-[10px] uppercase tracking-wider rounded-lg"
                              >
                                <Trash2 className="h-3 w-3 mr-2" /> Delete Comment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 pl-3">
                    <button
                      className="text-[10px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                      Reply
                    </button>
                    <button className="text-[10px] font-bold text-muted-foreground hover:text-rose-600 uppercase tracking-wider transition-colors">
                      Like
                    </button>
                  </div>
                </div>
              </div>

              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 sm:ml-10 mt-4 space-y-4 pl-4 border-l-2 border-border">
                  {comment.replies.map((reply: any) => (
                    <div key={reply.id} className="flex gap-3 sm:gap-4 text-sm">
                      <Avatar className="h-6 w-6 sm:h-7 sm:w-7 bg-card border border-border shadow-sm mt-1">
                        <AvatarFallback className="text-[9px] text-muted-foreground font-bold">
                          {reply.author?.avatar_url || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div
                          className={cn(
                            'p-3 rounded-2xl rounded-tl-none inline-block shadow-sm',
                            reply.isWorker
                              ? 'bg-blue-50 border border-blue-100 text-blue-900'
                              : 'bg-card border border-border'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[11px]">{reply.author?.full_name || 'Anonymous'}</span>
                              {reply.isWorker && (
                                <Badge
                                  variant="secondary"
                                  className="text-[8px] h-3.5 px-1.5 bg-blue-100 text-blue-700 border-none font-bold uppercase tracking-wider"
                                >
                                  Author
                                </Badge>
                              )}
                            </div>
                            {canManageComments && (
                              <button
                                onClick={() => onDeleteComment(reply.id, comment.id)}
                                className="text-muted-foreground/50 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed opacity-90">{reply.content}</p>
                        </div>
                        <div className="flex items-center gap-3 pl-2">
                          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {replyingTo === comment.id && (
                <div className="ml-10 sm:ml-14 mt-4 flex gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="relative flex-1">
                    <Input
                      autoFocus
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitReply(comment.id)}
                      placeholder={`Reply to ${comment.author?.full_name || 'user'}...`}
                      className="h-10 text-sm bg-card pr-10 rounded-xl shadow-sm border-border"
                    />
                    <button
                      onClick={() => submitReply(comment.id)}
                      disabled={!replyText}
                      className="absolute right-2 top-2 p-1.5 text-primary hover:bg-muted rounded-lg disabled:opacity-50 transition-all"
                    >
                      <CornerDownRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider text-center py-4">
          No comments yet
        </p>
      )}

      <div className="pt-2 relative">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="h-11 sm:h-12 pr-12 bg-card shadow-sm border-border focus:border-ring rounded-xl transition-all"
          onKeyDown={(e) => e.key === 'Enter' && text && (onAddComment(text), setText(''))}
        />
        <Button
          size="icon"
          className="absolute right-1.5 top-1.5 h-8 w-8 sm:h-9 sm:w-9 bg-primary hover:bg-primary/90 transition-all shadow-sm rounded-lg"
          onClick={() => {
            if (text) {
              onAddComment(text)
              setText('')
            }
          }}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function PostCard({
  post,
  onEdit,
  onDelete,
  onReaction,
  expandedComments,
  setExpandedComments,
}: {
  post: Post
  onEdit: () => void
  onDelete: () => void
  onReaction: (type: 'heart' | 'fire' | 'prayer') => void
  expandedComments: string | null
  setExpandedComments: (id: string | null) => void
}) {
  const authorName = post.author ? `${post.author.first_name} ${post.author.last_name}` : 'Marcus Miller'
  const authorAvatar =
    post.author?.avatar_url ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card className="overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-500 rounded-2xl sm:rounded-3xl group bg-card">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4 flex flex-row items-start justify-between space-y-0">
          <div className="flex gap-3 sm:gap-4">
            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-background shadow-md ring-1 ring-border">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>{post.author?.first_name?.[0] || 'M'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <h3 className="font-bold text-foreground text-base sm:text-lg tracking-tight">{authorName}</h3>
                <Badge className="bg-muted text-muted-foreground border-none font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  {post.post_type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <span className="text-border">•</span>
                <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {post.visibility === 'public' ? (
                    <Globe className="h-3 w-3" />
                  ) : post.visibility === 'partners' ? (
                    <Users className="h-3 w-3" />
                  ) : (
                    <Lock className="h-3 w-3" />
                  )}
                  <span className="hidden xs:inline">{post.visibility}</span>
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 text-muted-foreground hover:text-foreground rounded-xl transition-all"
              >
                <MoreHorizontal className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-border shadow-lg p-2 min-w-[160px] sm:min-w-[180px]">
              <DropdownMenuItem className="font-bold text-[10px] uppercase tracking-wider rounded-lg py-2.5 sm:py-3 cursor-pointer gap-2.5 sm:gap-3">
                <Pin className="h-3.5 w-3.5 text-muted-foreground" /> Pin to Top
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={onEdit}
                className="font-bold text-[10px] uppercase tracking-wider rounded-lg py-2.5 sm:py-3 cursor-pointer gap-2.5 sm:gap-3"
              >
                <Settings className="h-3.5 w-3.5 text-muted-foreground" /> Edit Post
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                onClick={onDelete}
                className="font-bold text-[10px] uppercase tracking-wider rounded-lg py-2.5 sm:py-3 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer gap-2.5 sm:gap-3"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-0">
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
            <div
              className="prose prose-sm sm:prose-base max-w-none text-foreground/80 leading-relaxed
                        prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight
                        prose-strong:font-bold prose-strong:text-foreground
                        prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:border-l-4 prose-blockquote:border-border prose-blockquote:italic prose-blockquote:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            {post.media && post.media.length > 0 && (
              <div className="rounded-xl sm:rounded-2xl overflow-hidden border border-border shadow-md group-hover:shadow-lg transition-all duration-500">
                {post.media.length === 1 ? (
                  <img src={post.media[0].url} alt="Update" className="w-full h-auto object-cover max-h-[400px] sm:max-h-[600px]" />
                ) : (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {post.media.map((item: any, idx: number) => (
                        <CarouselItem key={idx}>
                          <img
                            src={item.url}
                            alt={`Update ${idx + 1}`}
                            className="w-full h-auto object-cover max-h-[400px] sm:max-h-[600px]"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-2 sm:left-4 bg-background/80 border-none hover:bg-background transition-all shadow-md" />
                    <CarouselNext className="right-2 sm:right-4 bg-background/80 border-none hover:bg-background transition-all shadow-md" />
                  </Carousel>
                )}
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              <ReactionButton
                isActive={post.user_liked || false}
                count={post.likes_count || 0}
                type="heart"
                label="Love"
                onClick={() => onReaction('heart')}
              />
              <ReactionButton
                isActive={post.user_fired || false}
                count={post.fires_count || 0}
                type="fire"
                label="Hot"
                onClick={() => onReaction('fire')}
              />
              <ReactionButton
                isActive={post.user_prayed || false}
                count={post.prayers_count || 0}
                type="prayer"
                label="Pray"
                onClick={() => onReaction('prayer')}
              />
            </div>
            <button
              className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-all group/comm"
              onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground/50 group-hover/comm:scale-110 transition-transform" />
              {(post.comments || []).length} comments
            </button>
          </div>

          <AnimatePresence>
            {expandedComments === post.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <CommentSection
                  comments={post.comments || []}
                  canManageComments={true}
                  onAddComment={() => {
                    toast.success('Comment published')
                  }}
                  onDeleteComment={() => {}}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function WorkerFeed() {
  const [postType, setPostType] = useState('Update')
  const [postContent, setPostContent] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [drafts, setDrafts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<PostStatus>('published')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [expandedComments, setExpandedComments] = useState<string | null>(null)
  const [postPrivacy, setPostPrivacy] = useState<Visibility>('public')
  const [selectedMedia, setSelectedMedia] = useState<any[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>('medium')
  const [followers, setFollowers] = useState<Follower[]>(INITIAL_FOLLOWERS)

  const pendingRequests = useMemo(() => followers.filter((f) => f.status === 'pending'), [followers])

  const simulateUpload = async () => {
    setIsUploading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const demoImages = [
      'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&q=80&w=1200',
    ]
    const randomImage = demoImages[Math.floor(Math.random() * demoImages.length)]
    setSelectedMedia((prev) => [...prev, { url: randomImage, type: 'image' }])
    setIsUploading(false)
    toast.success('Image uploaded successfully!')
  }

  const fetchPosts = useCallback(async (status: PostStatus = 'published') => {
    try {
      const res = await fetch(`/api/posts?status=${status}`)
      const data = await res.json()
      if (status === 'published') setPosts(data.posts || [])
      else setDrafts(data.posts || [])
    } catch (err) {
      console.error('Failed to fetch posts:', err)
      toast.error('Could not load feed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts('published')
    fetchPosts('draft')
  }, [fetchPosts])

  useEffect(() => {
    if (
      !postContent ||
      postContent === '<p></p>' ||
      postContent === '<p><br></p>' ||
      isSaving ||
      (activeTab === 'published' && !editingPostId)
    )
      return

    const timer = setTimeout(() => {
      handlePost('draft')
    }, 30000)

    return () => clearTimeout(timer)
  }, [postContent])

  const handlePost = async (status: PostStatus = 'published') => {
    const plainText = postContent.replace(/<[^>]*>?/gm, '').trim()
    if (!plainText && !postContent.includes('<img')) return

    setIsSaving(true)
    try {
      const method = editingPostId ? 'PATCH' : 'POST'
      const url = editingPostId ? `/api/posts/${editingPostId}` : '/api/posts'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent,
          post_type: postType,
          visibility: postPrivacy,
          status,
          media: selectedMedia,
        }),
      })

      if (!res.ok) throw new Error('Failed to save post')

      const { post } = await res.json()

      if (status === 'published') {
        if (editingPostId && activeTab === 'draft') {
          setDrafts((prev) => prev.filter((d) => d.id !== editingPostId))
          setPosts((prev) => [post, ...prev])
        } else {
          setPosts((prev) => (editingPostId ? prev.map((p) => (p.id === editingPostId ? post : p)) : [post, ...prev]))
        }
        toast.success(editingPostId ? 'Update updated!' : 'Update published!')
      } else {
        setDrafts((prev) => (editingPostId ? prev.map((p) => (p.id === editingPostId ? post : p)) : [post, ...prev]))
        setLastSaved(new Date())
        toast.success('Draft saved!')
      }

      setPostContent('')
      setEditingPostId(null)
      setPostType('Update')
      setSelectedMedia([])
    } catch (err) {
      toast.error('Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditDraft = (draft: Post) => {
    setPostContent(draft.content)
    setPostType(draft.post_type)
    setPostPrivacy(draft.visibility)
    setEditingPostId(draft.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    toast.info('Editing draft...')
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this?')) return

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')

      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setDrafts((prev) => prev.filter((p) => p.id !== postId))
      toast.success('Post deleted')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const handleResolveRequest = (id: string, approved: boolean) => {
    setFollowers((prev) =>
      prev
        .map((f) => {
          if (f.id === id) {
            return { ...f, status: approved ? ('approved' as const) : f.status }
          }
          return f
        })
        .filter((f) => approved || f.id !== id)
    )
    toast.success(approved ? 'Follower accepted' : 'Request removed')
  }

  const handleReaction = async (postId: string, type: 'heart' | 'fire' | 'prayer') => {
    const post = [...posts, ...drafts].find((p) => p.id === postId)
    if (!post) return

    const endpointMap = { heart: 'like', fire: 'fire', prayer: 'prayer' }
    const statusKeyMap = { heart: 'user_liked', fire: 'user_fired', prayer: 'user_prayed' }
    const countKeyMap = { heart: 'likes_count', fire: 'fires_count', prayer: 'prayers_count' }

    const endpoint = endpointMap[type]
    const statusKey = statusKeyMap[type] as keyof Post
    const countKey = countKeyMap[type] as keyof Post

    const isActive = post[statusKey]
    const method = isActive ? 'DELETE' : 'POST'

    const updatePosts = (prev: Post[]) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            [statusKey]: !isActive,
            [countKey]: Math.max(0, (Number(p[countKey]) || 0) + (isActive ? -1 : 1)),
          }
        }
        return p
      })

    setPosts(updatePosts)
    setDrafts(updatePosts)

    try {
      const res = await fetch(`/api/posts/${postId}/${endpoint}`, { method })
      if (!res.ok) throw new Error('Failed to update reaction')
    } catch (err) {
      fetchPosts('published')
      fetchPosts('draft')
      toast.error('Failed to update reaction')
    }
  }

  return (
    <div className="max-w-[1500px] mx-auto pb-20 px-4 sm:px-6 lg:px-8 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight">My Feed</h1>
          <p className="text-muted-foreground font-medium mt-1 sm:mt-2 text-sm sm:text-base uppercase tracking-wider opacity-70">
            Your journey, shared.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="maia-outline" className="h-10 sm:h-11 px-4 sm:px-6 text-[10px] uppercase tracking-wider font-bold">
              <ShieldCheck className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Security & Access</span>
              <span className="sm:hidden">Security</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-2xl sm:rounded-3xl p-0 overflow-hidden border-border shadow-xl mx-4 sm:mx-0">
            <DialogHeader className="p-6 sm:p-8 pb-4 bg-muted/30 border-b border-border">
              <DialogTitle className="font-bold text-lg sm:text-xl tracking-tight">Security & Access</DialogTitle>
              <DialogDescription className="font-medium text-sm">
                Manage how your feed is shared and who can see your updates.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 sm:p-8 space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                {[
                  {
                    level: 'high' as SecurityLevel,
                    icon: ShieldAlert,
                    title: 'High',
                    description: 'Manual approval required. Granular permissions.',
                  },
                  {
                    level: 'medium' as SecurityLevel,
                    icon: ShieldHalf,
                    title: 'Medium',
                    description: 'Auto-follow for donors. Open to followers.',
                  },
                  {
                    level: 'low' as SecurityLevel,
                    icon: Shield,
                    title: 'Low',
                    description: 'Public feed on giving page. Auto-sync.',
                  },
                ].map(({ level, icon: Icon, title, description }) => (
                  <div
                    key={level}
                    onClick={() => setSecurityLevel(level)}
                    className={cn(
                      'p-4 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 sm:gap-4',
                      securityLevel === level ? 'border-primary bg-muted/50' : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <div
                      className={cn(
                        'p-2 rounded-full',
                        securityLevel === level ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wider text-foreground">{title}</p>
                      <p className="text-[10px] sm:text-[11px] text-muted-foreground font-medium leading-relaxed mt-1">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border space-y-4 sm:space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold uppercase tracking-wider">Public Mirror</Label>
                    <p className="text-[10px] text-muted-foreground font-medium">Sync to Giving Page</p>
                  </div>
                  <Switch
                    checked={securityLevel === 'low'}
                    onCheckedChange={(val) => setSecurityLevel(val ? 'low' : 'medium')}
                    disabled={securityLevel === 'high'}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-bold uppercase tracking-wider">Auto-Approval</Label>
                    <p className="text-[10px] text-muted-foreground font-medium">Instantly accept donors</p>
                  </div>
                  <Switch
                    checked={securityLevel !== 'high'}
                    onCheckedChange={(val) => setSecurityLevel(val ? 'medium' : 'high')}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="p-6 sm:p-8 pt-0">
              <Button
                onClick={() => toast.success('Security settings saved')}
                className="w-full h-11 sm:h-12 rounded-xl bg-primary font-bold text-xs uppercase tracking-wider"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
        <div className="lg:col-span-9 space-y-6 sm:space-y-8 lg:space-y-10">
          <Card className="overflow-hidden border border-border shadow-md rounded-2xl sm:rounded-3xl bg-card">
            <div className="p-4 sm:p-6">
              <div className="flex gap-2 sm:gap-3 flex-wrap items-center mb-4 sm:mb-6">
                {['Update', 'Prayer Request', 'Story', 'Newsletter'].map((type) => (
                  <Button
                    key={type}
                    variant={postType === type ? 'maia' : 'maia-outline'}
                    onClick={() => setPostType(type)}
                    className={cn(
                      'px-3 sm:px-5 py-2 h-8 sm:h-9 text-[9px] sm:text-[10px] uppercase tracking-wider font-bold',
                      postType === type && 'shadow-md'
                    )}
                  >
                    {type}
                  </Button>
                ))}
                {editingPostId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingPostId(null)
                      setPostContent('')
                    }}
                    className="ml-auto text-destructive font-bold text-[10px] uppercase tracking-wider hover:bg-destructive/10 rounded-xl"
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>

              <div className="flex gap-4 sm:gap-6">
                <Avatar className="h-10 w-10 sm:h-14 sm:w-14 border-2 border-border shadow-md shrink-0 hidden sm:block">
                  <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80" />
                  <AvatarFallback className="font-bold">MF</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="rounded-xl sm:rounded-2xl border border-border bg-muted/20 overflow-hidden focus-within:border-ring focus-within:bg-card transition-all">
                    <RichTextEditor
                      value={postContent}
                      onChange={setPostContent}
                      placeholder={`What's happening? Share a ${postType.toLowerCase()}...`}
                      className="border-none shadow-none rounded-none px-1 sm:px-2"
                      contentClassName="py-4 sm:py-6 px-4 sm:px-6 text-base sm:text-lg text-foreground placeholder:text-muted-foreground min-h-[150px] sm:min-h-[200px] leading-relaxed"
                      toolbarPosition="bottom"
                      proseInvert={false}
                      actions={
                        <div className="flex flex-col gap-3 sm:gap-4 w-full">
                          {selectedMedia.length > 0 && (
                            <div className="flex gap-3 sm:gap-4 px-4 sm:px-6 pb-3 sm:pb-4 overflow-x-auto no-scrollbar">
                              {selectedMedia.map((item, idx) => (
                                <div key={idx} className="relative group/img shrink-0">
                                  <img
                                    src={item.url}
                                    className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-xl border-2 border-background shadow-md"
                                  />
                                  <button
                                    onClick={() => setSelectedMedia((prev) => prev.filter((_, i) => i !== idx))}
                                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity shadow-md"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-2 w-full px-4 sm:px-6 pb-4">
                            {lastSaved && (
                              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mr-2 animate-in fade-in duration-500 hidden sm:inline-block">
                                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}

                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isUploading}
                              onClick={simulateUpload}
                              className="h-9 sm:h-10 text-muted-foreground gap-1.5 sm:gap-2 font-bold text-[10px] uppercase tracking-wider hover:bg-muted rounded-xl px-3 border border-border transition-all active:scale-95"
                            >
                              {isUploading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <ImageIcon className="h-3.5 w-3.5" />
                              )}
                              <span className="hidden xs:inline">Add Media</span>
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 sm:h-10 text-muted-foreground gap-1.5 sm:gap-2 font-bold text-[10px] uppercase tracking-wider hover:bg-muted rounded-xl px-3 border border-border transition-all active:scale-95"
                                >
                                  {postPrivacy === 'public' ? (
                                    <Globe className="h-3.5 w-3.5" />
                                  ) : postPrivacy === 'partners' ? (
                                    <Users className="h-3.5 w-3.5" />
                                  ) : (
                                    <Lock className="h-3.5 w-3.5" />
                                  )}
                                  <span className="hidden sm:inline">
                                    {postPrivacy === 'partners' ? 'Partners' : postPrivacy}
                                  </span>
                                  <ChevronDown className="h-3 w-3 opacity-30" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                className="rounded-xl border-border shadow-lg p-2 min-w-[180px] sm:min-w-[200px] animate-in slide-in-from-top-2 duration-300"
                              >
                                <DropdownMenuItem
                                  onClick={() => setPostPrivacy('public')}
                                  className="font-bold text-[10px] uppercase tracking-wider rounded-lg py-2.5 sm:py-3 cursor-pointer gap-2.5 sm:gap-3"
                                >
                                  <div className="p-1.5 bg-muted rounded-full">
                                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                                  </div>
                                  Public Feed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setPostPrivacy('partners')}
                                  className="font-bold text-[10px] uppercase tracking-wider rounded-lg py-2.5 sm:py-3 cursor-pointer gap-2.5 sm:gap-3"
                                >
                                  <div className="p-1.5 bg-muted rounded-full">
                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                  </div>
                                  Partners Only
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setPostPrivacy('private')}
                                  className="font-bold text-[10px] uppercase tracking-wider rounded-lg py-2.5 sm:py-3 cursor-pointer gap-2.5 sm:gap-3"
                                >
                                  <div className="p-1.5 bg-muted rounded-full">
                                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                  </div>
                                  Private Update
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <div className="flex-1 min-w-[10px]" />

                            <Button
                              onClick={() => handlePost('draft')}
                              variant="maia-outline"
                              disabled={
                                isSaving ||
                                isUploading ||
                                ((!postContent || postContent === '<p></p>' || postContent === '<p><br></p>') &&
                                  selectedMedia.length === 0)
                              }
                              className="h-9 sm:h-10 px-3 sm:px-5 text-[10px] uppercase tracking-wider rounded-xl border-border"
                            >
                              {isSaving ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="h-3.5 w-3.5 sm:mr-2" />
                              )}
                              <span className="hidden sm:inline">Save Draft</span>
                            </Button>

                            <Button
                              onClick={() => handlePost('published')}
                              variant="maia"
                              disabled={
                                isSaving ||
                                isUploading ||
                                ((!postContent || postContent === '<p></p>' || postContent === '<p><br></p>') &&
                                  selectedMedia.length === 0)
                              }
                              className="h-9 sm:h-10 px-4 sm:px-6 text-[10px] uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg"
                            >
                              {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Publish'}
                            </Button>
                          </div>
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            <Tabs
              defaultValue="published"
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as PostStatus)}
              className="w-full"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <TabsList className="bg-muted/50 p-1 rounded-xl h-auto border border-border backdrop-blur-sm">
                  <TabsTrigger
                    value="published"
                    className="rounded-lg px-4 sm:px-6 py-2 font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
                  >
                    Published
                  </TabsTrigger>
                  <TabsTrigger
                    value="draft"
                    className="rounded-lg px-4 sm:px-6 py-2 font-bold text-[10px] uppercase tracking-wider data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all flex items-center gap-2"
                  >
                    Drafts
                    {drafts.length > 0 && (
                      <Badge className="bg-primary text-primary-foreground border-none h-4 px-1 text-[8px] font-bold">
                        {drafts.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Last synced: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <TabsContent value="published" className="mt-0">
                <motion.div layout className="space-y-6 sm:space-y-8 lg:space-y-10">
                  <AnimatePresence mode="popLayout">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4">
                        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-muted-foreground/30" />
                        <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground/50">
                          Loading Feed...
                        </p>
                      </div>
                    ) : posts.length > 0 ? (
                      posts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                          onEdit={() => handleEditDraft(post)}
                          onDelete={() => handleDeletePost(post.id)}
                          onReaction={(type: 'heart' | 'fire' | 'prayer') => handleReaction(post.id, type)}
                          expandedComments={expandedComments}
                          setExpandedComments={setExpandedComments}
                        />
                      ))
                    ) : (
                      <div className="text-center py-20 sm:py-32 bg-muted/20 rounded-2xl sm:rounded-3xl border-2 border-dashed border-border">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md">
                          <Globe className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30" />
                        </div>
                        <h3 className="font-bold text-lg sm:text-2xl text-foreground tracking-tight">
                          Your feed is empty
                        </h3>
                        <p className="text-muted-foreground font-medium mt-2 text-sm sm:text-base">
                          Start sharing your journey with your partners.
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </TabsContent>

              <TabsContent value="draft" className="mt-0">
                <motion.div layout className="space-y-4 sm:space-y-6 lg:space-y-8">
                  <AnimatePresence mode="popLayout">
                    {drafts.length > 0 ? (
                      drafts.map((draft) => (
                        <motion.div
                          key={draft.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="group"
                        >
                          <Card className="overflow-hidden border border-border hover:border-muted-foreground/30 transition-all duration-500 rounded-2xl sm:rounded-3xl bg-card p-4 sm:p-6 lg:p-8">
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6 lg:gap-8">
                              <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                  <Badge className="bg-muted text-muted-foreground border-none font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                                    Draft • {draft.post_type}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground font-medium">
                                    Saved {new Date(draft.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <div
                                  className="prose prose-sm sm:prose-base max-w-none line-clamp-3 opacity-60 text-foreground"
                                  dangerouslySetInnerHTML={{ __html: draft.content }}
                                />
                              </div>
                              <div className="flex flex-row sm:flex-col gap-2 shrink-0 w-full sm:w-auto">
                                <Button
                                  variant="maia"
                                  size="sm"
                                  onClick={() => handleEditDraft(draft)}
                                  className="flex-1 sm:flex-none h-9 sm:h-10 px-4 sm:px-6 text-[10px] uppercase tracking-wider rounded-xl"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                  <span className="hidden sm:inline">Edit & Publish</span>
                                  <span className="sm:hidden">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePost(draft.id)}
                                  className="flex-1 sm:flex-none h-9 sm:h-10 text-destructive hover:bg-destructive/10 font-bold text-[10px] uppercase tracking-wider rounded-xl"
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="text-center py-20 sm:py-32 bg-muted/20 rounded-2xl sm:rounded-3xl border-2 border-dashed border-border">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-md">
                          <Save className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/30" />
                        </div>
                        <h3 className="font-bold text-lg sm:text-2xl text-foreground tracking-tight">No drafts yet</h3>
                        <p className="text-muted-foreground font-medium mt-2 text-sm sm:text-base">
                          Drafts allow you to perfect your updates before sharing.
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6 sm:space-y-8 lg:space-y-10">
          <Card className="rounded-2xl sm:rounded-3xl border border-border shadow-sm overflow-hidden bg-card flex flex-col">
            <div className="p-4 sm:p-6 border-b border-border bg-muted/30 flex flex-row items-center justify-between">
              <h3 className="font-bold text-[11px] uppercase tracking-wider text-foreground">Follow Requests</h3>
              {pendingRequests.length > 0 && (
                <Badge className="bg-destructive text-destructive-foreground border-none font-bold text-[10px] h-5 px-1.5 animate-pulse rounded-full">
                  {pendingRequests.length}
                </Badge>
              )}
            </div>
            <CardContent className="p-0">
              {pendingRequests.length > 0 ? (
                <div className="divide-y divide-border">
                  {pendingRequests.map((req) => (
                    <FollowerRequestItem key={req.id} request={req} onResolve={handleResolveRequest} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 sm:py-12 px-4 sm:px-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-emerald-100">
                    <Check className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">All caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
