'use client'

import React, { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Send,
  MoreHorizontal,
  MessageCircle,
  Heart,
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
  Flame,
  Pin,
  Trash2,
  Save,
  Clock,
  ExternalLink,
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

const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor').then(mod => mod.RichTextEditor), { 
  ssr: false,
  loading: () => <div className="h-[250px] w-full bg-slate-50/50 rounded-[2.5rem] animate-pulse" />
})

// --- Types ---

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
  author?: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string
  }
}

// --- Mock Data ---

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

// --- Components ---

const FollowerRequestItem = ({
  request,
  onResolve,
}: {
  request: Follower
  onResolve: (id: string, approved: boolean) => void
}) => {
  const [status, setStatus] = useState<'pending' | 'processing' | 'approved' | 'ignored' | 'collapsing'>(
    'pending'
  )

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

  if (status === 'collapsing') return <div className="h-0 opacity-0 overflow-hidden transition-all duration-500" />

  return (
    <div
      className={cn(
        'transition-all duration-500 ease-in-out border-b border-slate-50 last:border-0 p-3',
        status === 'approved' || status === 'ignored' ? 'bg-slate-50/50' : 'bg-white'
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-slate-100">
            <AvatarImage src={request.avatar} />
            <AvatarFallback className="bg-slate-100 text-slate-500 text-xs font-bold">
              {request.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-bold text-slate-900 truncate">{request.name}</p>
                <p className="text-[10px] text-slate-500 truncate font-medium">{request.handle || request.email}</p>
              </div>
              <span className="text-[10px] text-slate-400">{request.date}</span>
            </div>
          </div>
        </div>

        <div className="pl-13 h-8 relative">
            {status === 'pending' && (
              <div className="flex gap-2 absolute inset-0">
                <Button
                  size="sm"
                  variant="maia"
                  className="flex-1 h-8 text-[10px] uppercase tracking-wider shadow-sm rounded-xl"
                  onClick={() => handleAction('approve')}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="maia-outline"
                  className="flex-1 h-8 text-[10px] uppercase tracking-wider shadow-sm rounded-xl"
                  onClick={() => handleAction('ignore')}
                >
                  Ignore
                </Button>
              </div>
            )}

          {status === 'processing' && (
            <div className="flex items-center justify-center h-full absolute inset-0">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
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
            <div className="flex items-center gap-2 h-full absolute inset-0 text-slate-500 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-100 rounded-full p-1">
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

const PrayerHandsIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M12.5 2C12.5 2 17.5 7 17.5 12C17.5 16 15 20 12 22C9 20 6.5 16 6.5 12C6.5 7 11.5 2 11.5 2" />
    <path d="M12 2V22" />
  </svg>
)

const ReactionButton = ({
  isActive,
  count,
  icon: Icon,
  label,
  onClick,
  colorClass,
  hoverClass,
  fillOnActive = true,
}: any) => {
  const [isPopping, setIsPopping] = useState(false)

  const handleClick = () => {
    if (!isActive) {
      setIsPopping(true)
      setTimeout(() => setIsPopping(false), 400)
    }
    onClick()
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className={cn(
          'flex items-center gap-2 transition-all duration-300 px-3 h-9 rounded-full relative overflow-hidden group font-black text-[10px] uppercase tracking-wider',
          isActive ? colorClass : cn('text-slate-500', hoverClass)
        )}
      >
        <div
          className={cn(
            'transition-transform duration-300',
            isPopping ? 'scale-150 rotate-[-12deg]' : 'scale-100 rotate-0'
          )}
        >
          <Icon className={cn('h-4 w-4 transition-all duration-300', isActive && fillOnActive ? 'fill-current' : '')} />
        </div>
        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn('tabular-nums', count > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}
          >
            {count > 0 ? count : label}
          </motion.span>
        </AnimatePresence>
      </Button>
    </motion.div>
  )
}

const WorkerCommentSection = ({
  comments,
  onAddComment,
  onDeleteComment,
  canManageComments,
}: {
  comments: any[]
  onAddComment: (text: string, parentId?: string) => void
  onDeleteComment: (commentId: string, parentId?: string) => void
  canManageComments: boolean
}) => {
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
    <div className="bg-slate-50/50 rounded-b-3xl border-t border-slate-100 p-6 space-y-6">
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="group">
              <div className="flex gap-4 text-sm">
                <Avatar className="h-9 w-9 bg-white border border-slate-200 mt-1 shadow-sm">
                  <AvatarFallback className="text-[10px] text-slate-500 font-bold">{comment.avatar || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm inline-block min-w-[240px] relative">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="font-bold text-slate-900 text-xs">{comment.author?.full_name || 'Anonymous'}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(comment.created_at).toLocaleDateString()}</span>
                        {canManageComments && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-slate-300 hover:text-red-500 transition-colors">
                                <MoreHorizontal className="h-3 w-3" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl p-1 shadow-xl border-slate-100">
                              <DropdownMenuItem
                                onClick={() => onDeleteComment(comment.id)}
                                className="text-red-600 font-bold text-[10px] uppercase tracking-wider rounded-lg"
                              >
                                <Trash2 className="h-3 w-3 mr-2" /> Delete Comment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 pl-3">
                    <button
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors"
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    >
                      Reply
                    </button>
                    <button className="text-[10px] font-bold text-slate-400 hover:text-rose-600 uppercase tracking-widest transition-colors">
                      Like
                    </button>
                  </div>
                </div>
              </div>

              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-10 mt-4 space-y-4 pl-4 border-l-2 border-slate-100">
                  {comment.replies.map((reply: any) => (
                    <div key={reply.id} className="flex gap-4 text-sm">
                      <Avatar className="h-7 w-7 bg-white border border-slate-200 shadow-sm mt-1">
                        <AvatarFallback className="text-[9px] text-slate-500 font-bold">{reply.author?.avatar_url || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div
                          className={cn(
                            'p-3 rounded-2xl rounded-tl-none inline-block shadow-sm',
                            reply.isWorker
                              ? 'bg-blue-50/50 border border-blue-100 text-blue-900'
                              : 'bg-white border border-slate-100'
                          )}
                        >
                          <div className="flex items-center justify-between gap-4 mb-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[11px]">{reply.author?.full_name || 'Anonymous'}</span>
                              {reply.isWorker && (
                                <Badge
                                  variant="secondary"
                                  className="text-[8px] h-3.5 px-1.5 bg-blue-100 text-blue-700 border-none font-black uppercase tracking-widest"
                                >
                                  Author
                                </Badge>
                              )}
                            </div>
                            {canManageComments && (
                              <button
                                onClick={() => onDeleteComment(reply.id, comment.id)}
                                className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm leading-relaxed opacity-90">{reply.content}</p>
                        </div>
                        <div className="flex items-center gap-3 pl-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {new Date(reply.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {replyingTo === comment.id && (
                <div className="ml-14 mt-4 flex gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="relative flex-1">
                    <Input
                      autoFocus
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitReply(comment.id)}
                      placeholder={`Reply to ${comment.author?.full_name || 'user'}...`}
                      className="h-10 text-sm bg-white pr-10 rounded-2xl shadow-sm border-slate-200"
                    />
                    <button
                      onClick={() => submitReply(comment.id)}
                      disabled={!replyText}
                      className="absolute right-2 top-2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-xl disabled:opacity-50 transition-all"
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
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest text-center py-4">No comments yet</p>
      )}

      <div className="pt-2 relative">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="h-12 pr-12 bg-white shadow-md border-slate-200 focus:border-blue-300 rounded-2xl transition-all"
          onKeyDown={(e) => e.key === 'Enter' && text && (onAddComment(text), setText(''))}
        />
        <Button
          size="icon"
          className="absolute right-1.5 top-1.5 h-9 w-9 bg-slate-900 hover:bg-slate-800 transition-all shadow-lg rounded-xl"
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

export default function WorkerFeed() {
  // Feed State
  const [postType, setPostType] = useState('Update')
  const [postContent, setPostContent] = useState('')
  const [posts, setPosts] = useState<Post[]>([])
  const [drafts, setDrafts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState<PostStatus>('published')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [isAutosaving, setIsAutosaving] = useState(false)
    
    const [expandedComments, setExpandedComments] = useState<string | null>(null)
    const [postPrivacy, setPostPrivacy] = useState<Visibility>('public')


  // Security & Follower State
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>('medium')
  const [followers, setFollowers] = useState<Follower[]>(INITIAL_FOLLOWERS)

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

    // Autosave functionality
    useEffect(() => {
      if (!postContent || postContent === '<p></p>' || postContent === '<p><br></p>' || isSaving || activeTab === 'published' && !editingPostId) return

      const timer = setTimeout(() => {
        handlePost('draft')
      }, 30000) // 30 seconds

      return () => clearTimeout(timer)
    }, [postContent])

    // Derived follower lists
    const pendingRequests = useMemo(() => followers.filter((f) => f.status === 'pending'), [followers])


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
          status
        }),
      })

      if (!res.ok) throw new Error('Failed to save post')
      
      const { post } = await res.json()
      
      if (status === 'published') {
        if (editingPostId && activeTab === 'draft') {
          setDrafts(prev => prev.filter(d => d.id !== editingPostId))
          setPosts(prev => [post, ...prev])
        } else {
          setPosts(prev => editingPostId ? prev.map(p => p.id === editingPostId ? post : p) : [post, ...prev])
        }
        toast.success(editingPostId ? 'Update updated!' : 'Update published!')
      } else {
        setDrafts(prev => editingPostId ? prev.map(p => p.id === editingPostId ? post : p) : [post, ...prev])
        setLastSaved(new Date())
        toast.success('Draft saved!')
      }

      setPostContent('')
      setEditingPostId(null)
      setPostType('Update')
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
      
      setPosts(prev => prev.filter(p => p.id !== postId))
      setDrafts(prev => prev.filter(p => p.id !== postId))
      toast.success('Post deleted')
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const handleResolveRequest = (id: string, approved: boolean) => {
    setFollowers((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return { ...f, status: approved ? 'approved' : f.status }
        }
        return f
      }).filter(f => approved || f.id !== id)
    )
    toast.success(approved ? 'Follower accepted' : 'Request removed')
  }

  const handleDeleteComment = async (postId: string, commentId: string) => {
    // API for comments not fully implemented in this snippet, but would go here
    toast.success('Comment deleted')
  }

  return (
    <div className="max-w-[1500px] mx-auto pb-20 px-8 pt-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">My Feed</h1>
          <p className="text-slate-500 font-bold mt-2 text-lg opacity-60 uppercase tracking-widest">Your journey, shared.</p>
        </div>
        
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="maia-outline" className="h-11 px-6 text-[10px] uppercase tracking-widest font-black">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Security & Access
              </Button>
            </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
            <DialogHeader className="p-8 pb-4 bg-slate-50/50 border-b border-slate-100">
              <DialogTitle className="font-black text-xl tracking-tight">Security & Access</DialogTitle>
              <DialogDescription className="font-medium">
                Manage how your feed is shared and who can see your updates.
              </DialogDescription>
            </DialogHeader>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div 
                  onClick={() => setSecurityLevel('high')}
                  className={cn(
                    "p-4 rounded-[1.5rem] border-2 cursor-pointer transition-all flex items-start gap-4",
                    securityLevel === 'high' ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn("p-2 rounded-full", securityLevel === 'high' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest text-slate-900">High</p>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-1">Manual approval required. Granular permissions.</p>
                  </div>
                </div>

                <div 
                  onClick={() => setSecurityLevel('medium')}
                  className={cn(
                    "p-4 rounded-[1.5rem] border-2 cursor-pointer transition-all flex items-start gap-4",
                    securityLevel === 'medium' ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn("p-2 rounded-full", securityLevel === 'medium' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>
                    <ShieldHalf className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest text-slate-900">Medium</p>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-1">Auto-follow for donors. Open to followers.</p>
                  </div>
                </div>

                <div 
                  onClick={() => setSecurityLevel('low')}
                  className={cn(
                    "p-4 rounded-[1.5rem] border-2 cursor-pointer transition-all flex items-start gap-4",
                    securityLevel === 'low' ? "border-slate-900 bg-slate-50" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn("p-2 rounded-full", securityLevel === 'low' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400")}>
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest text-slate-900">Low</p>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed mt-1">Public feed on giving page. Auto-sync.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-black uppercase tracking-widest">Public Mirror</Label>
                    <p className="text-[10px] text-slate-400 font-bold">Sync to Giving Page</p>
                  </div>
                  <Switch 
                      checked={securityLevel === 'low'} 
                      onCheckedChange={(val) => setSecurityLevel(val ? 'low' : 'medium')}
                      disabled={securityLevel === 'high'}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-black uppercase tracking-widest">Auto-Approval</Label>
                    <p className="text-[10px] text-slate-400 font-bold">Instantly accept donors</p>
                  </div>
                  <Switch checked={securityLevel !== 'high'} onCheckedChange={(val) => setSecurityLevel(val ? 'medium' : 'high')} />
                </div>
              </div>
            </div>
            <DialogFooter className="p-8 pt-0">
              <Button onClick={() => toast.success('Security settings saved')} className="w-full h-12 rounded-2xl bg-slate-900 font-black text-xs uppercase tracking-widest">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* MAIN COLUMN: Feed Stream (span 9) */}
          <div className="lg:col-span-9 space-y-10">
              <Card className="overflow-hidden border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[3rem] bg-white p-1.5 transition-all hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)]">
                <div className="bg-white rounded-[2.8rem] overflow-hidden">
                  <div className="px-6 pt-6 pb-2">
                    <div className="flex gap-3 flex-wrap items-center">
                      {['Update', 'Prayer Request', 'Story', 'Newsletter'].map((type) => (
                        <Button
                          key={type}
                          variant={postType === type ? "maia" : "maia-outline"}
                          onClick={() => setPostType(type)}
                          className={cn(
                            "px-6 py-2 h-9 text-[10px] uppercase tracking-widest font-black",
                            postType === type && "scale-105 shadow-xl"
                          )}
                        >
                          {type}
                        </Button>
                      ))}
                      {editingPostId && (
                        <Button variant="ghost" size="sm" onClick={() => {
                          setEditingPostId(null)
                          setPostContent('')
                        }} className="ml-auto text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 rounded-xl">
                          Cancel Edit
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-2">
                  <div className="flex gap-6">
                    <Avatar className="h-14 w-14 border-2 border-slate-50 shadow-xl shrink-0 hidden md:block">
                      <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80" />
                      <AvatarFallback className="font-bold">MF</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="rounded-[2rem] border border-slate-100 bg-slate-50/10 overflow-hidden focus-within:border-slate-200 focus-within:bg-white transition-all shadow-inner">
                        <RichTextEditor
                          value={postContent}
                          onChange={setPostContent}
                          placeholder={`What's happening? Share a ${postType.toLowerCase()}...`}
                          className="border-none shadow-none rounded-none px-2"

                          contentClassName="py-6 px-8 text-xl text-slate-700 placeholder:text-slate-300 min-h-[200px] leading-relaxed"
                          toolbarPosition="bottom"
                          actions={
                            <div className="flex items-center gap-3">
                              {lastSaved && (
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mr-2 animate-in fade-in duration-500">
                                  Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-10 text-slate-500 gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 rounded-xl px-4 border border-slate-100 transition-all active:scale-95"
                                  >
                                    {postPrivacy === 'public' ? <Globe className="h-3.5 w-3.5" /> : postPrivacy === 'partners' ? <Users className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                                    {postPrivacy === 'partners' ? 'Partners Only' : postPrivacy}
                                    <ChevronDown className="h-3 w-3 opacity-30" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[200px] animate-in slide-in-from-top-2 duration-300">
                                  <DropdownMenuItem onClick={() => setPostPrivacy('public')} className="font-black text-[10px] uppercase tracking-widest rounded-xl py-3 cursor-pointer gap-3">
                                    <div className="p-1.5 bg-slate-50 rounded-full"><Globe className="h-3.5 w-3.5 text-slate-600" /></div>
                                    Public Feed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setPostPrivacy('partners')} className="font-black text-[10px] uppercase tracking-widest rounded-xl py-3 cursor-pointer gap-3">
                                    <div className="p-1.5 bg-slate-50 rounded-full"><Users className="h-3.5 w-3.5 text-slate-600" /></div>
                                    Partners Only
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => setPostPrivacy('private')} className="font-black text-[10px] uppercase tracking-widest rounded-xl py-3 cursor-pointer gap-3">
                                    <div className="p-1.5 bg-slate-50 rounded-full"><Lock className="h-3.5 w-3.5 text-slate-600" /></div>
                                    Private Update
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                
                              <Button
                                onClick={() => handlePost('draft')}
                                variant="maia-outline"
                                disabled={isSaving || !postContent || postContent === '<p></p>' || postContent === '<p><br></p>'}
                                className="h-10 px-6 text-[10px] uppercase tracking-widest rounded-xl border-slate-200"
                              >
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-2" />}
                                Save Draft
                              </Button>
                
                              <Button
                                onClick={() => handlePost('published')}
                                variant="maia"
                                disabled={isSaving || !postContent || postContent === '<p></p>' || postContent === '<p><br></p>'}
                                className="h-10 px-8 text-[10px] uppercase tracking-widest rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)]"
                              >
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Publish'}
                              </Button>
                            </div>
                          }

                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="mt-12 space-y-10">
            <Tabs defaultValue="published" value={activeTab} onValueChange={(v) => setActiveTab(v as PostStatus)} className="w-full">
              <div className="flex items-center justify-between mb-6">
                <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-auto border border-slate-200/50 backdrop-blur-sm">
                  <TabsTrigger 
                    value="published" 
                    className="rounded-xl px-6 py-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-400 transition-all"
                  >
                    Published
                  </TabsTrigger>
                  <TabsTrigger 
                    value="draft" 
                    className="rounded-xl px-6 py-2 font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-slate-900 text-slate-400 transition-all flex items-center gap-2"
                  >
                    Drafts
                    {drafts.length > 0 && <Badge className="bg-slate-900 text-white border-none h-4 px-1 text-[8px] font-black">{drafts.length}</Badge>}
                  </TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  Last synced: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <TabsContent value="published" className="mt-0">
                <motion.div layout className="space-y-16">
                  <AnimatePresence mode="popLayout">
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-slate-200" />
                        <p className="font-black text-xs uppercase tracking-[0.2em] text-slate-300">Loading Feed...</p>
                      </div>
                    ) : posts.length > 0 ? (
                      posts.map((post) => (
                        <PostCard key={post.id} post={post} onEdit={() => handleEditDraft(post)} onDelete={() => handleDeletePost(post.id)} setPosts={setPosts} expandedComments={expandedComments} setExpandedComments={setExpandedComments} />
                      ))
                    ) : (
                      <div className="text-center py-32 bg-slate-50/30 rounded-[4rem] border-4 border-dashed border-slate-100">
                         <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <Globe className="h-8 w-8 text-slate-200" />
                         </div>
                         <h3 className="font-black text-2xl text-slate-900 tracking-tight">Your feed is empty</h3>
                         <p className="text-slate-400 font-bold mt-2">Start sharing your journey with your partners.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </TabsContent>

              <TabsContent value="draft" className="mt-0">
                <motion.div layout className="space-y-8">
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
                          <Card className="overflow-hidden border-2 border-slate-100 hover:border-slate-200 transition-all duration-500 rounded-[3rem] bg-white p-8">
                            <div className="flex items-start justify-between gap-8">
                              <div className="flex-1 min-w-0 space-y-4">
                                <div className="flex items-center gap-3">
                                  <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[8px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-full">
                                    Draft • {draft.post_type}
                                  </Badge>
                                  <span className="text-[10px] text-slate-400 font-bold">Saved {new Date(draft.created_at).toLocaleDateString()}</span>
                                </div>
                                <div 
                                  className="prose prose-slate prose-xl max-w-none line-clamp-3 opacity-60"
                                  dangerouslySetInnerHTML={{ __html: draft.content }}
                                />
                              </div>
                              <div className="flex flex-col gap-2 shrink-0">
                                <Button
                                  variant="maia"
                                  size="sm"
                                  onClick={() => handleEditDraft(draft)}
                                  className="h-10 px-6 text-[10px] uppercase tracking-widest rounded-xl"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                  Edit & Publish
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePost(draft.id)}
                                  className="h-10 text-rose-500 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest rounded-xl"
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
                      <div className="text-center py-32 bg-slate-50/30 rounded-[4rem] border-4 border-dashed border-slate-100">
                         <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                            <Save className="h-8 w-8 text-slate-200" />
                         </div>
                         <h3 className="font-black text-2xl text-slate-900 tracking-tight">No drafts yet</h3>
                         <p className="text-slate-400 font-bold mt-2">Drafts allow you to perfect your updates before sharing.</p>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* RIGHT COLUMN: Follower Management (span 3) */}
        <div className="lg:col-span-3 space-y-12">
          <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden bg-white flex flex-col">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex flex-row items-center justify-between">
              <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Follow Requests</h3>
              {pendingRequests.length > 0 && (
                <Badge className="bg-rose-500 text-white border-none font-black text-[10px] h-5 px-1.5 animate-pulse rounded-full">
                  {pendingRequests.length}
                </Badge>
              )}
            </div>
            <CardContent className="p-0">
              {pendingRequests.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {pendingRequests.map((req) => (
                    <FollowerRequestItem key={req.id} request={req} onResolve={handleResolveRequest} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-6">
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                    <Check className="h-6 w-6 text-emerald-500" />
                  </div>
                  <p className="text-xs font-black text-slate-900 uppercase tracking-widest opacity-40">All caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PostCard({ post, onEdit, onDelete, setPosts, expandedComments, setExpandedComments }: any) {
  const authorName = post.author ? `${post.author.first_name} ${post.author.last_name}` : 'The Miller Family'
  const authorAvatar = post.author?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80"
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="overflow-hidden border-none shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] transition-all duration-700 rounded-[2.5rem] group bg-white border border-slate-100/50">
        <CardHeader className="p-8 pb-4 flex flex-row items-start justify-between space-y-0">
          <div className="flex gap-4">
            <Avatar className="h-12 w-12 border-2 border-white shadow-lg ring-1 ring-slate-100">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>{post.author?.first_name?.[0] || 'M'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-black text-slate-900 text-lg tracking-tighter">{authorName}</h3>
                <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-full">
                  {post.post_type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</span>
                <span className="text-slate-200">•</span>
                <span className="flex items-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                  {post.visibility === 'public' ? <Globe className="h-3 w-3" /> : post.visibility === 'partners' ? <Users className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {post.visibility}
                </span>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-slate-900 rounded-xl transition-all">
                <MoreHorizontal className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[180px]">
              <DropdownMenuItem className="font-black text-[10px] uppercase tracking-widest rounded-xl py-3 cursor-pointer gap-3">
                <Pin className="h-3.5 w-3.5 text-slate-400" /> Pin to Top
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit} className="font-black text-[10px] uppercase tracking-widest rounded-xl py-3 cursor-pointer gap-3">
                <Settings className="h-3.5 w-3.5 text-slate-400" /> Edit Post
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-50" />
              <DropdownMenuItem onClick={onDelete} className="font-black text-[10px] uppercase tracking-widest rounded-xl py-3 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer gap-3">
                <Trash2 className="h-3.5 w-3.5" /> Delete Post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-0">
          <div className="px-8 pb-8 space-y-6">
            <div
              className="prose prose-slate prose-xl max-w-none text-slate-700 leading-relaxed
                        prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tighter
                        prose-strong:font-black prose-strong:text-slate-900
                        prose-a:text-blue-600 prose-a:font-black prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:border-l-4 prose-blockquote:border-slate-100 prose-blockquote:italic prose-blockquote:text-slate-400"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            {post.media && post.media.length > 0 && post.media[0].url && (
              <div className="rounded-[2rem] overflow-hidden border border-slate-50 shadow-2xl group-hover:scale-[1.002] transition-transform duration-1000">
                <img src={post.media[0].url} alt="Update" className="w-full h-auto object-cover max-h-[600px]" />
              </div>
            )}
          </div>
  
          <div className="px-8 py-4 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
            <div className="flex gap-2">

              <ReactionButton
                isActive={post.user_liked}
                count={post.likes_count || 0}
                icon={Heart}
                label="Love"
                onClick={() => {}}
                colorClass="text-rose-600 bg-rose-50"
                hoverClass="hover:text-rose-600 hover:bg-rose-50"
              />
              <ReactionButton
                isActive={false}
                count={post.fires_count || 0}
                icon={Flame}
                label="Hot"
                onClick={() => {}}
                colorClass="text-orange-500 bg-orange-50"
                hoverClass="hover:text-orange-500 hover:bg-orange-50"
              />
              <ReactionButton
                isActive={post.user_prayed}
                count={post.prayers_count || 0}
                icon={PrayerHandsIcon}
                label="Pray"
                onClick={() => {}}
                colorClass="text-indigo-600 bg-indigo-50"
                hoverClass="hover:text-indigo-600 hover:bg-indigo-50"
                fillOnActive={false}
              />
            </div>
            <button
              className="flex items-center gap-4 text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all group/comm"
              onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
            >
              <MessageCircle className="h-5 w-5 text-slate-300 group-hover/comm:scale-125 transition-transform" />
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
                <WorkerCommentSection
                  comments={post.comments || []}
                  canManageComments={true}
                  onAddComment={(text) => {
                    toast.success('Comment published')
                  }}
                  onDeleteComment={(commentId) => {}}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
