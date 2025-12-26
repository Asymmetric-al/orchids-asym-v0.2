'use client'

import React, { useState, useMemo } from 'react'
import {
  Send,
  MoreHorizontal,
  MessageCircle,
  Heart,
  Share2,
  Loader2,
  Globe,
  ChevronDown,
  X,
  Lock,
  Users,
  UserPlus,
  Check,
  CornerDownRight,
  ShieldCheck,
  Search,
  UserCheck,
  AlertCircle,
  Pin,
  Trash2,
  Flame,
  ShieldAlert,
  ShieldHalf,
  Shield,
  Settings,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

// --- Types ---

type Visibility = 'public' | 'partners' | 'private'
type SecurityLevel = 'high' | 'medium' | 'low'
type AccessLevel = 'view' | 'comment'

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
  id: number
  type: string
  content: string
  time: string
  likes: number
  prayers: number
  fires: number
  comments: any[]
  image: string | null
  isPinned?: boolean
  privacy: Visibility
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

const MOCK_POSTS: Post[] = [
  {
    id: 1,
    type: 'Update',
    content:
      '<p>We completed the foundation for the new school block today! It was hard work in the heat, but the community turned out in full force to help mix concrete and carry stones. 🙏 This is just the beginning of a safe learning space for <strong>200 children</strong>.</p>',
    time: '2 hours ago',
    likes: 24,
    prayers: 8,
    fires: 12,
    privacy: 'public',
    comments: [
      {
        id: 'c1',
        author: 'Sarah Jenkins',
        text: 'This is amazing progress! So proud of the team.',
        time: '1h ago',
        avatar: 'SJ',
        replies: [
          {
            id: 'r1',
            author: 'The Miller Family',
            text: 'Thank you Sarah! The team worked incredibly hard.',
            time: '45m ago',
            avatar: 'MF',
            isWorker: true,
          },
        ],
      },
    ],
    image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1000&auto=format&fit=crop',
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

        <div className="pl-[3.25rem] h-8 relative">
          {status === 'pending' && (
            <div className="flex gap-2 absolute inset-0">
              <Button
                size="sm"
                className="flex-1 h-8 text-[10px] bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold uppercase tracking-wider"
                onClick={() => handleAction('approve')}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-[10px] text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50 rounded-lg font-bold uppercase tracking-wider"
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
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      className={cn(
        'flex items-center gap-2 transition-all duration-300 px-3 h-9 rounded-full relative overflow-hidden group font-bold text-[11px] uppercase tracking-wider',
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
      <span className={cn('tabular-nums', count > 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
        {count > 0 ? count : label}
      </span>
    </Button>
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
                  <AvatarFallback className="text-[10px] text-slate-500 font-bold">{comment.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm inline-block min-w-[240px] relative">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="font-bold text-slate-900 text-xs">{comment.author}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">{comment.time}</span>
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
                    <p className="text-slate-600 leading-relaxed text-sm">{comment.text}</p>
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
                        <AvatarFallback className="text-[9px] text-slate-500 font-bold">{reply.avatar}</AvatarFallback>
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
                              <span className="font-bold text-[11px]">{reply.author}</span>
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
                          <p className="text-sm leading-relaxed opacity-90">{reply.text}</p>
                        </div>
                        <div className="flex items-center gap-3 pl-2">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {reply.time}
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
                      placeholder={`Reply to ${comment.author}...`}
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
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [expandedComments, setExpandedComments] = useState<number | null>(null)
  const [postPrivacy, setPostPrivacy] = useState<Visibility>('public')

  // Security & Follower State
  const [securityLevel, setSecurityLevel] = useState<SecurityLevel>('medium')
  const [followers, setFollowers] = useState<Follower[]>(INITIAL_FOLLOWERS)
  const [followerSearch, setFollowerSearch] = useState('')

  // Derived follower lists
  const pendingRequests = useMemo(() => followers.filter((f) => f.status === 'pending'), [followers])
  const activeFollowers = useMemo(
    () =>
      followers.filter(
        (f) =>
          f.status === 'approved' &&
          (f.name.toLowerCase().includes(followerSearch.toLowerCase()) ||
            f.email.toLowerCase().includes(followerSearch.toLowerCase()))
      ),
    [followers, followerSearch]
  )

  const handlePost = () => {
    const plainText = postContent.replace(/<[^>]*>?/gm, '').trim()
    if (!plainText && !postContent.includes('<img')) return

    const newPost: Post = {
      id: Date.now(),
      type: postType,
      content: postContent,
      time: 'Just now',
      likes: 0,
      prayers: 0,
      fires: 0,
      privacy: postPrivacy,
      comments: [],
      image: null,
    }
    setPosts([newPost, ...posts])
    setPostContent('')
    toast.success('Update published!')
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

  const handleRemoveFollower = (id: string) => {
    setFollowers((prev) => prev.filter((f) => f.id !== id))
    toast.success('Follower removed')
  }

  const handleUpdateAccess = (id: string, level: AccessLevel) => {
    setFollowers((prev) => prev.map((f) => (f.id === id ? { ...f, accessLevel: level } : f)))
    toast.success(`Access updated to ${level}`)
  }

  const handleDeleteComment = (postId: number, commentId: string, parentId?: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          if (parentId) {
            const updatedComments = p.comments.map((c) => {
              if (c.id === parentId) {
                return { ...c, replies: c.replies.filter((r: any) => r.id !== commentId) }
              }
              return c
            })
            return { ...p, comments: updatedComments }
          } else {
            return { ...p, comments: p.comments.filter((c: any) => c.id !== commentId) }
          }
        }
        return p
      })
    )
    toast.success('Comment deleted')
  }

    return (
    <div className="max-w-[1400px] mx-auto pb-24 px-6 pt-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Feed</h1>
          <p className="text-slate-500 font-medium mt-2">Connect with your supporters and share your journey.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-2xl border-slate-200 hover:bg-slate-50 font-bold text-xs uppercase tracking-widest h-11 px-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* MAIN COLUMN: Feed Stream (span 8) */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="overflow-hidden border-none shadow-2xl rounded-[3rem] bg-slate-50/50 p-1">
            <div className="bg-white rounded-[2.8rem] overflow-hidden">
              <div className="px-8 pt-8 pb-2">
                <div className="flex gap-2 flex-wrap items-center">
                  {['Update', 'Prayer Request', 'Story', 'Newsletter'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setPostType(type)}
                      className={cn(
                        'px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border shadow-sm',
                        postType === type
                          ? 'bg-slate-900 text-white border-slate-900 scale-105'
                          : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-8 pt-4">
                <div className="flex gap-4">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-md shrink-0 hidden sm:block">
                    <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80" />
                    <AvatarFallback>MF</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <RichTextEditor
                      value={postContent}
                      onChange={setPostContent}
                      placeholder={`Share your latest ${postType.toLowerCase()}...`}
                      className="border-none shadow-none rounded-none px-0"
                      contentClassName="py-2 text-xl text-slate-700 placeholder:text-slate-300 min-h-[160px]"
                      toolbarPosition="bottom"
                      actions={
                        <div className="flex items-center gap-4 ml-auto">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 text-slate-500 gap-2 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-100 rounded-xl"
                              >
                                {postPrivacy === 'public' ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                {postPrivacy}
                                <ChevronDown className="h-3 w-3 opacity-30" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-2">
                              <DropdownMenuItem onClick={() => setPostPrivacy('public')} className="font-bold text-xs rounded-xl py-3">
                                <Globe className="h-4 w-4 mr-3 text-slate-400" /> Public Feed
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setPostPrivacy('partners')} className="font-bold text-xs rounded-xl py-3">
                                <Users className="h-4 w-4 mr-3 text-slate-400" /> Partners Only
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setPostPrivacy('private')} className="font-bold text-xs rounded-xl py-3">
                                <Lock className="h-4 w-4 mr-3 text-slate-400" /> Private Update
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          <Button
                            onClick={handlePost}
                            disabled={!postContent || postContent === '<p></p>' || postContent === '<p><br></p>'}
                            className="bg-slate-900 text-white hover:bg-slate-800 shadow-xl h-11 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95"
                          >
                            Publish <Send className="h-4 w-4 ml-2 opacity-70" />
                          </Button>
                        </div>
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="space-y-12 mt-12">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-700 rounded-[2.5rem] group bg-white border-none">
                <CardHeader className="p-8 pb-4 flex flex-row items-start justify-between space-y-0">
                  <div className="flex gap-5">
                    <Avatar className="h-12 w-12 border-4 border-white shadow-xl ring-1 ring-slate-100">
                      <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80" />
                      <AvatarFallback>MF</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-black text-slate-900 text-base tracking-tight">The Miller Family</h3>
                        <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] uppercase tracking-[0.15em] px-2 py-0.5 rounded-md">
                          {post.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{post.time}</span>
                        <span className="text-slate-200">•</span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {post.privacy === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          {post.privacy}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 hover:text-slate-900 rounded-2xl transition-all">
                        <MoreHorizontal className="h-6 w-6" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[180px]">
                      <DropdownMenuItem className="font-bold text-xs rounded-xl py-3 cursor-pointer">
                        <Pin className="h-4 w-4 mr-3 text-slate-400" /> Pin to Top
                      </DropdownMenuItem>
                      <DropdownMenuItem className="font-bold text-xs rounded-xl py-3 cursor-pointer">
                        <Settings className="h-4 w-4 mr-3 text-slate-400" /> Edit Post
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-50" />
                      <DropdownMenuItem className="font-bold text-xs rounded-xl py-3 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                        <Trash2 className="h-4 w-4 mr-3" /> Delete Post
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="px-8 pb-8 space-y-6">
                    <div
                      className="prose prose-slate prose-lg max-w-none text-slate-700 leading-relaxed
                                prose-headings:font-black prose-headings:text-slate-900 prose-headings:tracking-tight
                                prose-strong:font-black prose-strong:text-slate-900
                                prose-a:text-blue-600 prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                                prose-blockquote:border-l-4 prose-blockquote:border-slate-200 prose-blockquote:italic prose-blockquote:text-slate-500"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    {post.image && (
                      <div className="rounded-[2.5rem] overflow-hidden border border-slate-50 shadow-2xl group-hover:scale-[1.01] transition-transform duration-700">
                        <img src={post.image} alt="Update" className="w-full h-auto object-cover max-h-[550px]" />
                      </div>
                    )}
                  </div>

                  <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between">
                    <div className="flex gap-2">
                      <ReactionButton
                        isActive={false}
                        count={post.likes}
                        icon={Heart}
                        label="Love"
                        onClick={() => {}}
                        colorClass="text-rose-600 bg-rose-50"
                        hoverClass="hover:text-rose-600 hover:bg-rose-50"
                      />
                      <ReactionButton
                        isActive={false}
                        count={post.fires}
                        icon={Flame}
                        label="Hot"
                        onClick={() => {}}
                        colorClass="text-orange-500 bg-orange-50"
                        hoverClass="hover:text-orange-500 hover:bg-orange-50"
                      />
                      <ReactionButton
                        isActive={false}
                        count={post.prayers}
                        icon={PrayerHandsIcon}
                        label="Pray"
                        onClick={() => {}}
                        colorClass="text-indigo-600 bg-indigo-50"
                        hoverClass="hover:text-indigo-600 hover:bg-indigo-50"
                        fillOnActive={false}
                      />
                    </div>
                    <button
                      className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-slate-900 transition-all group/comm"
                      onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                    >
                      <MessageCircle className="h-4 w-4 text-slate-300 group-hover/comm:scale-110 transition-transform" />
                      {post.comments.length} comments
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
                          comments={post.comments}
                          canManageComments={true} // In real app, check if user is Missionary or Tenant Admin
                          onAddComment={(text, parentId) => {
                            const newComment = {
                              id: Date.now().toString(),
                              author: 'You',
                              text,
                              time: 'Just now',
                              avatar: 'ME',
                              replies: [],
                            }
                            setPosts(prev => prev.map(p => {
                              if (p.id === post.id) {
                                  if (parentId) {
                                      return { ...p, comments: p.comments.map(c => c.id === parentId ? { ...c, replies: [...c.replies, newComment] } : c) }
                                  }
                                  return { ...p, comments: [...p.comments, newComment] }
                              }
                              return p
                            }))
                            toast.success('Comment published')
                          }}
                          onDeleteComment={(commentId, parentId) => handleDeleteComment(post.id, commentId, parentId)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Community & Follower Management (span 4) */}
        <div className="lg:col-span-4 space-y-8">
          <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-row items-center justify-between">
              <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">Follow Requests</h3>
              {pendingRequests.length > 0 && (
                <Badge className="bg-rose-500 text-white border-none font-black text-[10px] h-5 px-1.5 animate-pulse">
                  {pendingRequests.length}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {pendingRequests.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {pendingRequests.map((req) => (
                    <FollowerRequestItem key={req.id} request={req} onResolve={handleResolveRequest} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-6">
                  <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                    <Check className="h-5 w-5 text-emerald-500" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">All caught up!</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-slate-200 shadow-sm overflow-hidden flex flex-col max-h-[600px] bg-white">
            <CardHeader className="p-6 border-b border-slate-50 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900">My Community</h3>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-black text-[10px] h-5">
                  {activeFollowers.length}
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-300" />
                <Input
                  placeholder="Search community..."
                  value={followerSearch}
                  onChange={(e) => setFollowerSearch(e.target.value)}
                  className="pl-9 h-10 text-xs bg-slate-50 border-none rounded-2xl focus:ring-slate-200"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto flex-1 no-scrollbar">
              {activeFollowers.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {activeFollowers.map((follower) => (
                    <div key={follower.id} className="p-5 hover:bg-slate-50/50 transition-colors group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                            <AvatarImage src={follower.avatar} />
                            <AvatarFallback className="text-[10px] font-bold bg-slate-100 text-slate-600">
                              {follower.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold text-slate-900 leading-none">{follower.name}</p>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              {follower.isDonor && (
                                <Badge className="h-3.5 px-1.5 text-[8px] bg-emerald-100 text-emerald-700 border-none font-black uppercase tracking-widest">
                                  Donor
                                </Badge>
                              )}
                              <Badge className="h-3.5 px-1.5 text-[8px] bg-blue-100 text-blue-700 border-none font-black uppercase tracking-widest">
                                {follower.accessLevel}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300 hover:text-slate-900 rounded-xl">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2 min-w-[160px]">
                            <DropdownMenuLabel className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2 py-1.5">
                              Manage Access
                            </DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateAccess(follower.id, 'view')}
                              className="font-bold text-xs rounded-xl py-2.5 cursor-pointer"
                            >
                              <Globe className="h-3.5 w-3.5 mr-2" /> View Only
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleUpdateAccess(follower.id, 'comment')}
                              className="font-bold text-xs rounded-xl py-2.5 cursor-pointer"
                            >
                              <MessageCircle className="h-3.5 w-3.5 mr-2" /> View & Comment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-50" />
                            <DropdownMenuItem 
                              onClick={() => handleRemoveFollower(follower.id)}
                              className="text-red-600 font-bold text-xs rounded-xl py-2.5 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Remove Follower
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No followers found</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-slate-200 shadow-sm p-8 bg-slate-900 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
            <h3 className="font-black text-[11px] uppercase tracking-[0.2em] mb-8 opacity-60">Community Pulse</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-3xl font-black tracking-tight">{followers.filter(f => f.status === 'approved').length}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.1em] opacity-40">Followers</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-black tracking-tight text-emerald-400">+12</div>
                <div className="text-[10px] font-black uppercase tracking-[0.1em] opacity-40">Growth</div>
              </div>
            </div>
                <div className="flex -space-x-3 mb-6">
                  {followers.slice(0, 5).map((f) => (
                    <Avatar key={f.id} className="h-10 w-10 border-4 border-slate-900 shadow-2xl ring-1 ring-white/10">
                      <AvatarImage src={f.avatar} />
                      <AvatarFallback className="bg-slate-800 text-white text-[10px] font-black">
                        {f.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {followers.length > 5 && (
                      <div className="h-10 w-10 rounded-full bg-slate-800 border-4 border-slate-900 flex items-center justify-center text-[10px] font-black shadow-2xl ring-1 ring-white/10">
                          +{followers.length - 5}
                      </div>
                  )}
              </div>
              <Button variant="ghost" className="w-full h-11 rounded-2xl border border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all">
                  Analytics Report
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
    )
  }
