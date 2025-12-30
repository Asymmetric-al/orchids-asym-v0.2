'use client'

import React, { useState, useMemo } from 'react'
import { 
  Search, Filter, Plus, MoreHorizontal, LayoutGrid, List, 
  ArrowUpDown, Mail, Phone, Tag, X, ChevronRight,
  Columns, ArrowUpRight, User, MessageSquare, Paperclip,
  CheckSquare, MoreVertical, Calendar, Brain, Sparkles, Lightbulb, Zap,
  MapPin, Briefcase, History, Download, ExternalLink, Send,
  FileText
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel 
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, formatCurrency } from '@/lib/utils'

// --- Types ---

type Stage = 'New' | 'Contacted' | 'Meeting' | 'Proposal' | 'Won'

interface Activity {
  id: string
  type: 'note' | 'call' | 'email' | 'meeting' | 'stage_change' | 'gift'
  date: string
  title: string
  description?: string
  amount?: number
}

interface Contact {
  id: string
  name: string
  avatar?: string
  title: string
  company: string
  email: string
  phone: string
  value: number
  stage: Stage
  owner: string
  lastActivity: string
  tags: string[]
  city: string
  bio: string
  activities: Activity[]
}

const STAGES: Stage[] = ['New', 'Contacted', 'Meeting', 'Proposal', 'Won']

const STAGE_COLORS: Record<Stage, string> = {
  New: 'bg-blue-50 text-blue-700 border-blue-100',
  Contacted: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  Meeting: 'bg-amber-50 text-amber-700 border-amber-100',
  Proposal: 'bg-purple-50 text-purple-700 border-purple-100',
  Won: 'bg-emerald-50 text-emerald-700 border-emerald-100',
}

// --- Mock Data ---

const MOCK_CONTACTS: Contact[] = [
  { 
    id: '1', name: 'Alice Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60', 
    title: 'Director of Giving', company: 'TechFoundations',
    email: 'alice@techfoundations.org', phone: '+1 555-0101', value: 50000, stage: 'Proposal', owner: 'Me', lastActivity: '2 hours ago', tags: ['High Value'], city: 'San Francisco',
    bio: "Alice leads philanthropy for TechFoundations. She's interested in sustainable water projects.",
    activities: [
        { id: 'a1', type: 'meeting', date: '2024-12-18T10:00:00Z', title: 'Q4 Strategy Session', description: 'Discussed scaling the well project in Chiang Mai.' },
        { id: 'a2', type: 'gift', date: '2024-11-15T09:00:00Z', title: 'Corporate Grant', amount: 25000 }
    ]
  },
  { 
    id: '2', name: 'Bob Smith', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    title: 'CEO', company: 'Global Ventures',
    email: 'bob@globalventures.com', phone: '+1 555-0102', value: 12000, stage: 'Meeting', owner: 'Sarah', lastActivity: '1 day ago', tags: ['Corporate'], city: 'New York',
    bio: "Long-time supporter of educational initiatives in South America.",
    activities: []
  }
]

// --- Components ---

const DetailDrawer = ({ contact, onClose }: { contact: Contact, onClose: () => void }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [summary, setSummary] = useState<{ category: string; focus: string; nextMove: string; } | null>(null)

  const summarizeContact = async () => {
    setIsAnalyzing(true)
    await new Promise(r => setTimeout(r, 1000))
    setSummary({
        category: "Active Partner",
        focus: "Sustainable infrastructure and water projects.",
        nextMove: "Share the Chiang Mai impact video."
    })
    setIsAnalyzing(false)
  }

  return (
    <Sheet open={!!contact} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl p-0 gap-0 border-l border-slate-200 bg-slate-50 shadow-2xl overflow-hidden flex flex-col h-full text-left">
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-10">
             <div className="flex items-center gap-2 text-sm font-bold text-slate-900 uppercase tracking-wider">
                <User className="h-4 w-4 text-slate-400" />
                <span>Contact Details</span>
             </div>
             <div className="flex items-center gap-1">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 text-[10px] font-bold uppercase tracking-wider gap-2 border border-slate-100 bg-white text-slate-700 hover:bg-slate-50"
                    onClick={summarizeContact}
                    disabled={isAnalyzing}
                >
                  <FileText className={cn("h-3.5 w-3.5", isAnalyzing && "animate-pulse")} /> 
                  {isAnalyzing ? "Summarizing..." : "Quick Summary"}
                </Button>
                <div className="h-4 w-px bg-slate-200 mx-2" />
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400">
                   <X className="h-4 w-4" />
                </Button>
             </div>
        </div>

        <ScrollArea className="flex-1">
            <div className="p-6 space-y-8">
                {/* Profile Header */}
                <div className="flex gap-6 items-start">
                    <Avatar className="h-20 w-20 border-4 border-white shadow-sm">
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xl">{contact.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 pt-1">
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{contact.name}</h2>
                        <p className="text-sm text-slate-500 font-medium">{contact.title} at <span className="text-slate-900">{contact.company}</span></p>
                        <div className="flex gap-2 pt-2">
                            <Badge variant="outline" className={cn("h-5 text-[10px] font-bold uppercase tracking-wider border shadow-none", STAGE_COLORS[contact.stage])}>
                                {contact.stage}
                            </Badge>
                            <Badge variant="secondary" className="h-5 text-[10px] font-bold uppercase tracking-wider border-none bg-slate-100 text-slate-500">
                                {formatCurrency(contact.value)}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Summary Card */}
                <AnimatePresence>
                    {summary && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                        >
                            <div className="flex items-center gap-2 text-slate-900 font-bold text-[10px] uppercase tracking-[0.2em]">
                                <FileText className="h-3.5 w-3.5 text-slate-400" /> Highlights
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Type</span>
                                    <p className="text-sm font-bold text-slate-900">{summary.category}</p>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ministry Focus</span>
                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{summary.focus}</p>
                                </div>
                                <div>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Next Step</span>
                                    <p className="text-xs text-slate-900 font-bold">{summary.nextMove}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Tabs defaultValue="activity">
                    <TabsList className="bg-transparent h-9 p-0 gap-6 border-b border-slate-200 w-full rounded-none justify-start">
                        <TabsTrigger value="activity" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 rounded-none px-0 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 shadow-none">Activity</TabsTrigger>
                        <TabsTrigger value="properties" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:text-slate-900 rounded-none px-0 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 shadow-none">Properties</TabsTrigger>
                    </TabsList>

                    <TabsContent value="activity" className="pt-6 space-y-6">
                        {/* Activity Composer */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                            <textarea 
                                placeholder="Log a note, call, or meeting..." 
                                className="w-full h-20 bg-slate-50 border-none focus:ring-0 text-sm resize-none p-0"
                            />
                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600"><Paperclip className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-600"><History className="h-3.5 w-3.5" /></Button>
                                </div>
                                <Button size="sm" className="h-7 px-4 text-[10px] font-bold uppercase tracking-wider">Save Note</Button>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-6 pl-4 border-l border-slate-200 ml-2">
                            {contact.activities.map(act => (
                                <div key={act.id} className="relative group">
                                    <div className="absolute -left-[21px] top-0 h-4 w-4 rounded-full border-2 border-white bg-slate-200 z-10 transition-colors group-hover:bg-slate-900" />
                                    <div className="pb-4 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-900">{act.title}</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(act.date).toLocaleDateString()}</span>
                                        </div>
                                        {act.description && <p className="text-xs text-slate-500 leading-relaxed bg-white p-3 rounded-lg border border-slate-100 shadow-sm">{act.description}</p>}
                                        {act.amount && <p className="text-xs font-bold text-emerald-600">+{formatCurrency(act.amount)} Gift Received</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="properties" className="pt-6 grid grid-cols-2 gap-8 text-left">
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                                <p className="text-sm font-bold text-slate-900 truncate hover:text-blue-600 cursor-pointer">{contact.email}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                                <p className="text-sm font-bold text-slate-900">{contact.phone}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">City</label>
                                <p className="text-sm font-bold text-slate-900">{contact.city}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Owner</label>
                                <p className="text-sm font-bold text-slate-900">{contact.owner}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tags</label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {contact.tags.map(t => <Badge key={t} variant="secondary" className="text-[9px] px-1.5 h-4 bg-slate-100 text-slate-500 border-none shadow-none">{t}</Badge>)}
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

export default function MissionControlCRM() {
  const [view, setView] = useState<'table' | 'kanban'>('table')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredContacts = useMemo(() => {
    return MOCK_CONTACTS.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.company.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery])

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col bg-slate-50 overflow-hidden border border-slate-200 rounded-xl">
      
      {/* CRM Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <div className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
              <User className="h-4 w-4" />
            </div>
            <span className="uppercase tracking-widest text-[11px]">People</span>
            <span className="text-slate-300 font-light mx-1">|</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:bg-slate-100 px-2 py-1 rounded transition-colors text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <span>All Contacts</span>
                  <ChevronRight className="h-3 w-3 rotate-90 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem>All Contacts</DropdownMenuItem>
                <DropdownMenuItem>High Value Donors</DropdownMenuItem>
                <DropdownMenuItem>Recent Inquiries</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 max-w-lg px-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-2.5 top-1.5 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search people, companies, or emails..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-4 bg-slate-100 border-transparent rounded-md text-xs focus:bg-white focus:ring-2 focus:ring-slate-100 focus:border-slate-200 transition-all outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button 
              onClick={() => setView('table')}
              className={cn("p-1.5 rounded-md transition-all", view === 'table' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
            >
              <List className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={cn("p-1.5 rounded-md transition-all", view === 'kanban' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
            >
              <Columns className="h-4 w-4" />
            </button>
          </div>
          <Button size="sm" className="h-8 px-4 font-bold uppercase tracking-wider text-[10px]">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New Person
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden p-0 relative">
        {view === 'table' ? (
          <div className="h-full p-4 md:p-6 overflow-auto">
             <div className="w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm divide-y divide-slate-100">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                                <th className="p-3 font-bold text-slate-500 uppercase text-[10px] tracking-widest pl-6">Name</th>
                                <th className="p-3 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Company</th>
                                <th className="p-3 font-bold text-slate-500 uppercase text-[10px] tracking-widest">Stage</th>
                                <th className="p-3 font-bold text-slate-500 uppercase text-[10px] tracking-widest text-right pr-6">Value</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {filteredContacts.map(c => (
                                <tr key={c.id} onClick={() => setSelectedContact(c)} className="hover:bg-slate-50/50 cursor-pointer h-12 border-b border-slate-50 last:border-0">
                                    <td className="p-3 pl-6 flex items-center gap-3">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={c.avatar} />
                                            <AvatarFallback className="text-[10px] font-bold">{c.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-bold text-slate-900">{c.name}</span>
                                    </td>
                                    <td className="p-3 text-slate-500 font-medium">{c.company}</td>
                                    <td className="p-3">
                                        <Badge variant="outline" className={cn("h-5 text-[9px] font-bold uppercase tracking-widest border px-1.5 shadow-none", STAGE_COLORS[c.stage])}>{c.stage}</Badge>
                                    </td>
                                    <td className="p-3 text-right pr-6 font-bold text-slate-900 tabular-nums">{formatCurrency(c.value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             </div>
          </div>
        ) : (
          <div className="h-full overflow-x-auto flex p-4 md:p-6 gap-4 items-start">
            {STAGES.map(stage => (
              <div key={stage} className="flex-shrink-0 w-80 flex flex-col h-full bg-slate-50/50 rounded-xl border border-slate-200/50 overflow-hidden">
                <div className="p-3 bg-slate-100/50 border-b border-slate-200 flex items-center justify-between">
                    <Badge variant="secondary" className={cn("px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] rounded shadow-none border", STAGE_COLORS[stage])}>{stage}</Badge>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filteredContacts.filter(c => c.stage === stage).length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {filteredContacts.filter(c => c.stage === stage).map(c => (
                        <div key={c.id} onClick={() => setSelectedContact(c)} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3">
                            <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-900 text-xs truncate leading-none">{c.name}</span>
                                <MoreHorizontal className="h-3.5 w-3.5 text-slate-300" />
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-500 border border-slate-200">{c.company[0]}</div>
                                <span className="text-[10px] text-slate-500 font-medium truncate">{c.company}</span>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                <span className="text-[10px] font-bold text-slate-900 tabular-nums">{formatCurrency(c.value)}</span>
                                <Avatar className="h-4 w-4">
                                    <AvatarImage src={c.avatar} />
                                    <AvatarFallback className="text-[8px] font-bold">{c.name[0]}</AvatarFallback>
                                </Avatar>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedContact && <DetailDrawer contact={selectedContact} onClose={() => setSelectedContact(null)} />}
    </div>
  )
}
