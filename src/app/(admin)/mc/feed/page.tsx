'use client'

import React, { useState } from 'react'
import { 
  Image as ImageIcon, Send, Sparkles, MoreHorizontal, 
  MessageCircle, Heart, Share2, PenTool, Loader2,
  Globe, ChevronDown, Wand2, X, Lock, Users,
  ShieldCheck, UserPlus, Check, Settings, CornerDownRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

// --- Mock Data ---

const MOCK_ADMIN_POSTS = [
  {
    id: 1,
    author: 'Thailand Team',
    type: 'Update',
    content: "<p>The well project in Chiang Mai is 75% complete. We hit bedrock but the team persevered. Looking forward to the dedication ceremony next week!</p>",
    time: "2 hours ago",
    likes: 45,
    prayers: 12,
    comments: [
      { id: 'c1', author: 'Sarah Jenkins', text: 'Incredible news!', time: '1h ago', avatar: 'SJ' }
    ]
  },
  {
    id: 2,
    author: 'Admin Team',
    type: 'Announcement',
    content: "<p>Year-end giving reports are now available in the Donor Portal. Please encourage your supporters to download them for their tax records.</p>",
    time: "Yesterday",
    likes: 12,
    prayers: 0,
    comments: []
  }
]

export default function MissionControlFeed() {
  const [posts, setPosts] = useState(MOCK_ADMIN_POSTS)
  const [postContent, setPostContent] = useState('')
  const [postType, setPostType] = useState('Update')

  const handlePost = () => {
    if (!postContent.trim()) return
    const newPost = {
        id: Date.now(),
        author: 'Mission Control',
        type: postType,
        content: `<p>${postContent}</p>`,
        time: 'Just now',
        likes: 0,
        prayers: 0,
        comments: []
    }
    setPosts([newPost, ...posts])
    setPostContent('')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Global Feed</h1>
            <p className="text-sm text-slate-500 mt-1">Org-wide updates, stories, and prayer requests.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full bg-white h-9 px-4 font-bold uppercase tracking-wider text-[10px]">
            <Settings className="h-3.5 w-3.5 mr-2" /> Feed Settings
        </Button>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
        <div className="px-5 pt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
           {['Update', 'Announcement', 'Prayer Request'].map((type) => (
             <button 
                key={type}
                onClick={() => setPostType(type)}
                className={cn(
                    "px-3 py-1 text-[10px] font-bold rounded-full border transition-all uppercase tracking-wider",
                    postType === type 
                        ? "bg-slate-900 text-white border-slate-900" 
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                )}
             >
                {type}
             </button>
           ))}
        </div>
        <CardContent className="p-5">
            <div className="flex gap-4">
                <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                    <AvatarFallback className="bg-slate-900 text-white text-xs font-bold">MC</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                    <textarea 
                        className="w-full min-h-[100px] border-none focus:ring-0 text-sm placeholder:text-slate-300 resize-none p-0"
                        placeholder={`Share a global ${postType.toLowerCase()}...`}
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-900 px-2 h-8">
                            <ImageIcon className="h-4 w-4 mr-2" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Add Media</span>
                        </Button>
                        <Button 
                            onClick={handlePost} 
                            disabled={!postContent.trim()} 
                            size="sm"
                            className="h-8 px-4 font-bold uppercase tracking-wider text-[10px]"
                        >
                            Publish
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden border-slate-200 shadow-sm bg-white">
                <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="flex gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200">
                            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">{post.author[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-sm">{post.author}</h3>
                                <Badge variant="secondary" className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-wider border-none bg-slate-100 text-slate-500">{post.type}</Badge>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{post.time}</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </CardHeader>
                
                <CardContent className="px-5 pb-5">
                    <div 
                        className="prose prose-slate prose-sm max-w-none text-slate-700 leading-relaxed font-medium"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                    
                    <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-50">
                        <button className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors">
                            <Heart className="h-4 w-4" />
                            <span className="text-xs font-bold tabular-nums">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-slate-400 hover:text-blue-500 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span className="text-xs font-bold tabular-nums">{post.comments.length}</span>
                        </button>
                        <button className="flex items-center gap-2 text-slate-400 hover:text-amber-500 transition-colors ml-auto">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-[11px] font-bold uppercase tracking-wider">Pray</span>
                        </button>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  )
}
