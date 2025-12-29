'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Plus,
  Download,
  Heart,
  MessageSquare,
  Check,
  Send,
  Copy,
  ExternalLink,
  Pencil,
  User,
  ArrowLeft,
  CheckCircle2,
  ArrowUpRight,
  Calendar,
  History,
  Briefcase,
  Clock,
  Brain,
  Sparkles,
  Lightbulb,
  Zap,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { AddPartnerDialog } from '@/features/missionary/components/add-partner-dialog'
import { toast } from 'sonner'

type ActivityType = 'gift' | 'note' | 'call' | 'email' | 'meeting' | 'task'

interface Activity {
  id: string
  type: ActivityType
  date: string
  title: string
  description?: string
  amount?: number
  status?: string
}

interface Donor {
  id: string
  name: string
  initials: string
  type: 'Individual' | 'Organization' | 'Church'
  status: 'Active' | 'Lapsed' | 'New' | 'At Risk'
  total_given: number
  last_gift_date: string | null
  last_gift_amount: number | null
  frequency: 'Monthly' | 'One-Time' | 'Annually' | 'Irregular'
  email: string
  phone: string
  avatar_url?: string
  location: string
  address: {
    street?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  joined_date: string
  tags: string[]
  score: number
  activities: Activity[]
}

const formatCurrency = (value: number | null) => {
  if (value === null) return '$0'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Active': return 'bg-emerald-500'
    case 'Lapsed': return 'bg-zinc-400'
    case 'New': return 'bg-blue-500'
    case 'At Risk': return 'bg-amber-500'
    default: return 'bg-zinc-400'
  }
}

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Lapsed: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    New: 'bg-blue-50 text-blue-700 border-blue-200',
    'At Risk': 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <Badge variant="outline" className={cn('font-semibold border px-2.5 py-0.5 text-[11px] uppercase tracking-wider', styles[status])}>
      {status}
    </Badge>
  )
}

const getActivityIcon = (type: ActivityType) => {
  switch(type) {
    case 'gift': return <Heart className="h-4 w-4 text-white" />
    case 'call': return <Phone className="h-4 w-4 text-white" />
    case 'email': return <Mail className="h-4 w-4 text-white" />
    case 'note': return <MessageSquare className="h-4 w-4 text-white" />
    case 'meeting': return <Briefcase className="h-4 w-4 text-white" />
    case 'task': return <CheckCircle2 className="h-4 w-4 text-white" />
    default: return <Clock className="h-4 w-4 text-white" />
  }
}

const getActivityBg = (type: ActivityType) => {
  switch(type) {
    case 'gift': return 'bg-rose-500'
    case 'call': return 'bg-blue-500'
    case 'email': return 'bg-purple-500'
    case 'note': return 'bg-zinc-500'
    case 'meeting': return 'bg-emerald-500'
    case 'task': return 'bg-amber-500'
    default: return 'bg-zinc-400'
  }
}

export default function DonorsPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [donors, setDonors] = React.useState<Donor[]>([])
  const [selectedDonorId, setSelectedDonorId] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('All')
  const [loading, setLoading] = React.useState(true)
  const [activeTab, setActiveTab] = React.useState('timeline')
  const [noteInput, setNoteInput] = React.useState('')
  const [isNoteDialogOpen, setIsNoteDialogOpen] = React.useState(false)
  const [aiAnalysis, setAiAnalysis] = React.useState<{ persona: string; strategy: string; nextMove: string } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  const fetchDonors = React.useCallback(async () => {
    if (!profile?.id) return
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('donors')
        .select(`
          *,
          activities: donor_activities(*)
        `)
        .eq('missionary_id', profile.id)
        .order('name', { ascending: true })

      if (error) throw error

      const formattedDonors = (data || []).map(d => ({
        ...d,
        initials: d.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        activities: (d.activities || []).sort((a: Activity, b: Activity) => 
          new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
        )
      }))

      setDonors(formattedDonors)
    } catch (error) {
      toast.error('Failed to load donors')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [profile?.id, supabase])

  React.useEffect(() => {
    fetchDonors()
  }, [fetchDonors])

  React.useEffect(() => {
    setAiAnalysis(null)
  }, [selectedDonorId])

  const filteredDonors = React.useMemo(() => {
    let result = donors.filter(donor => {
      const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            donor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (donor.location || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'All' || donor.status === statusFilter
      return matchesSearch && matchesStatus
    })

    result.sort((a, b) => {
      const dateA = a.last_gift_date ? new Date(a.last_gift_date).getTime() : 0
      const dateB = b.last_gift_date ? new Date(b.last_gift_date).getTime() : 0
      return dateB - dateA
    })

    return result
  }, [donors, searchTerm, statusFilter])

  const selectedDonor = donors.find(d => d.id === selectedDonorId)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  const handleAddNote = () => {
    toast.success('Note added successfully')
    setNoteInput('')
    setIsNoteDialogOpen(false)
  }

  const analyzeDonorRelationship = async () => {
    if (!selectedDonor) return
    setIsAnalyzing(true)
    setAiAnalysis(null)

    await new Promise(r => setTimeout(r, 1500))
    setAiAnalysis({
      persona: 'The Community Builder',
      strategy: 'Values personal connection and tangible project updates. Responds well to stories about specific individuals.',
      nextMove: 'Send a photo update of current projects and include a personal thank you note.'
    })
    setIsAnalyzing(false)
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full bg-zinc-50/50 animate-in fade-in duration-300 relative overflow-hidden rounded-2xl border border-zinc-200 shadow-sm">
      
      <div className={cn(
        'flex flex-col h-full border-r border-zinc-200 bg-white w-full lg:w-[400px] xl:w-[450px] transition-all duration-300 absolute lg:relative z-10',
        selectedDonorId ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
      )}>
        <div className="p-4 border-b border-zinc-100 space-y-4 shrink-0 bg-white z-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-900">Partners</h2>
              <p className="text-xs text-zinc-500 font-medium">{filteredDonors.length} contacts</p>
            </div>
            <div className="flex gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {['All', 'Active', 'New', 'Lapsed', 'At Risk'].map(s => (
                    <DropdownMenuCheckboxItem
                      key={s}
                      checked={statusFilter === s}
                      onCheckedChange={() => setStatusFilter(s)}
                    >
                      {s}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {profile?.id && (
                <AddPartnerDialog
                  missionaryId={profile.id}
                  onSuccess={fetchDonors}
                  trigger={
                    <Button size="icon" className="h-8 w-8 bg-zinc-900 hover:bg-zinc-800 shadow-sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  }
                />
              )}
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
            <Input
              placeholder="Search partners..."
              className="pl-9 bg-zinc-50 border-zinc-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all shadow-sm h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 w-full animate-pulse rounded-xl bg-zinc-50" />
              ))
            ) : filteredDonors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                <Search className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No partners found</p>
              </div>
            ) : (
              filteredDonors.map((donor) => (
                <motion.div
                  key={donor.id}
                  layoutId={`donor-card-${donor.id}`}
                  onClick={() => setSelectedDonorId(donor.id)}
                  className={cn(
                    'group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border relative overflow-hidden',
                    selectedDonorId === donor.id
                      ? 'bg-blue-50/60 border-blue-200 shadow-sm'
                      : 'bg-white border-transparent hover:bg-zinc-50 hover:border-zinc-200'
                  )}
                >
                  {selectedDonorId === donor.id && (
                    <motion.div layoutId="selection-bar" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  )}
                  
                  <div className="relative shrink-0">
                    <Avatar className={cn('h-12 w-12 border-2 transition-all', selectedDonorId === donor.id ? 'border-blue-200' : 'border-white shadow-sm')}>
                      <AvatarImage src={donor.avatar_url} />
                      <AvatarFallback className="bg-zinc-100 text-zinc-600 font-bold text-xs">
                        {donor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn('absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ring-1 ring-black/5', getStatusColor(donor.status))} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn('font-bold text-sm truncate transition-colors', selectedDonorId === donor.id ? 'text-blue-900' : 'text-zinc-900')}>
                        {donor.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium whitespace-nowrap">
                        {donor.last_gift_date ? formatDistanceToNow(new Date(donor.last_gift_date), { addSuffix: true }) : 'No gifts'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <span className="truncate max-w-[140px]">{donor.location || 'Unknown'}</span>
                      </div>
                      <div className="text-xs font-bold text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded-md">
                        {formatCurrency(donor.last_gift_amount)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className={cn(
        'flex-1 flex flex-col bg-white h-full overflow-hidden absolute inset-0 lg:relative z-20 lg:z-0 transition-transform duration-300',
        selectedDonorId ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      )}>
        {selectedDonor ? (
          <div className="flex flex-col h-full bg-zinc-50/30">
            <div className="shrink-0 h-16 border-b border-zinc-100 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 -ml-2 text-zinc-500" onClick={() => setSelectedDonorId(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-zinc-900 truncate hidden sm:block">{selectedDonor.name}</h2>
                  {getStatusBadge(selectedDonor.status)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-9 text-xs font-semibold gap-2 border border-purple-100 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 shadow-sm',
                    isAnalyzing && 'opacity-80'
                  )}
                  onClick={analyzeDonorRelationship}
                  disabled={isAnalyzing}
                >
                  <Brain className={cn('h-3.5 w-3.5', isAnalyzing && 'animate-pulse')} />
                  {isAnalyzing ? 'Analyzing...' : 'Analyze DNA'}
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant="outline" size="sm" className="hidden sm:flex h-9 text-xs font-semibold gap-2 border-zinc-200 shadow-sm hover:bg-zinc-50" onClick={() => setIsNoteDialogOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" /> Note
                </Button>
                <Button variant="outline" size="sm" className="hidden sm:flex h-9 text-xs font-semibold gap-2 border-zinc-200 shadow-sm hover:bg-zinc-50">
                  <Phone className="h-3.5 w-3.5" /> Call
                </Button>
                <Button size="sm" className="h-9 text-xs font-semibold gap-2 bg-zinc-900 text-white shadow-md hover:bg-zinc-800">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col md:flex-row gap-8 items-start"
                >
                  <div className="flex items-center gap-6 min-w-[300px]">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-lg rounded-2xl bg-white">
                      <AvatarImage src={selectedDonor.avatar_url} />
                      <AvatarFallback className="text-2xl font-bold bg-zinc-100 text-zinc-500">
                        {selectedDonor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <h1 className="text-2xl font-bold text-zinc-900">{selectedDonor.name}</h1>
                      <div className="flex items-center gap-1.5 text-sm text-zinc-500">
                        <MapPin className="h-3.5 w-3.5" /> {selectedDonor.location || 'Unknown'}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(selectedDonor.tags || []).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-white border border-zinc-200 rounded-md text-[10px] font-semibold text-zinc-600 shadow-sm uppercase tracking-wide">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-none shadow-sm bg-white/60 hover:bg-white transition-colors">
                      <CardContent className="p-4 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Lifetime</p>
                        <p className="text-xl font-bold text-zinc-900">{formatCurrency(selectedDonor.total_given)}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white/60 hover:bg-white transition-colors">
                      <CardContent className="p-4 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Last Gift</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xl font-bold text-zinc-900">{formatCurrency(selectedDonor.last_gift_amount)}</p>
                          {selectedDonor.last_gift_date && new Date(selectedDonor.last_gift_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="Recent Gift" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white/60 hover:bg-white transition-colors">
                      <CardContent className="p-4 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Frequency</p>
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                          <p className="text-sm font-bold text-zinc-900">{selectedDonor.frequency}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm bg-white/60 hover:bg-white transition-colors">
                      <CardContent className="p-4 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Partner Since</p>
                        <p className="text-sm font-bold text-zinc-900">{new Date(selectedDonor.joined_date).getFullYear()}</p>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {aiAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative rounded-xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-6 shadow-sm">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                          <Brain className="h-24 w-24 text-purple-900" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-purple-600 fill-purple-200" />
                            <h3 className="text-sm font-bold text-purple-900 uppercase tracking-widest">Relationship Intelligence</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/60 p-4 rounded-lg border border-purple-100 backdrop-blur-sm">
                              <div className="flex items-center gap-2 mb-2 text-purple-800 font-semibold text-xs uppercase tracking-wider">
                                <User className="h-3.5 w-3.5" /> Giving Persona
                              </div>
                              <p className="font-bold text-zinc-800 text-lg">{aiAnalysis.persona}</p>
                            </div>
                            <div className="bg-white/60 p-4 rounded-lg border border-purple-100 backdrop-blur-sm">
                              <div className="flex items-center gap-2 mb-2 text-purple-800 font-semibold text-xs uppercase tracking-wider">
                                <Lightbulb className="h-3.5 w-3.5" /> Strategy
                              </div>
                              <p className="text-sm text-zinc-700 leading-relaxed">{aiAnalysis.strategy}</p>
                            </div>
                            <div className="bg-white/60 p-4 rounded-lg border border-purple-100 backdrop-blur-sm">
                              <div className="flex items-center gap-2 mb-2 text-purple-800 font-semibold text-xs uppercase tracking-wider">
                                <Zap className="h-3.5 w-3.5" /> Next Move
                              </div>
                              <p className="text-sm text-zinc-700 leading-relaxed font-medium">{aiAnalysis.nextMove}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-zinc-200">
                    <TabsList className="bg-transparent h-auto p-0 gap-6">
                      {[
                        { key: 'timeline', label: 'Timeline' },
                        { key: 'contact-info', label: 'Contact Info' },
                        { key: 'giving-history', label: 'Giving History' },
                      ].map(tab => (
                        <TabsTrigger
                          key={tab.key}
                          value={tab.key}
                          className="bg-transparent border-b-2 border-transparent data-[state=active]:border-zinc-900 data-[state=active]:shadow-none rounded-none px-1 py-3 text-sm font-medium text-zinc-500 data-[state=active]:text-zinc-900 transition-all hover:text-zinc-700"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="pt-6">
                    <TabsContent value="timeline" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex gap-4 transition-all focus-within:ring-2 focus-within:ring-zinc-100">
                        <Avatar className="h-9 w-9 hidden md:block">
                          <AvatarFallback className="bg-zinc-900 text-white text-xs">ME</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <Textarea
                            placeholder="Log a call, meeting notes, or task..."
                            className="min-h-[60px] border-none bg-zinc-50 focus:bg-white focus:ring-0 resize-none text-sm p-3 rounded-lg transition-colors placeholder:text-zinc-400"
                          />
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 gap-1.5">
                                <Phone className="h-3.5 w-3.5" /> Log Call
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 gap-1.5">
                                <Check className="h-3.5 w-3.5" /> Create Task
                              </Button>
                            </div>
                            <Button size="sm" className="h-8 text-xs bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm">
                              Post Activity <Send className="h-3 w-3 ml-1.5" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8 pl-4 border-l-2 border-zinc-200 ml-4 relative pb-10">
                        {selectedDonor.activities.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center pl-8">
                            <Calendar className="h-12 w-12 text-zinc-200 mb-4" />
                            <p className="text-sm font-medium text-zinc-400">No activity recorded yet</p>
                          </div>
                        ) : (
                          selectedDonor.activities.map((activity, i) => (
                            <div key={activity.id} className="relative pl-8 group">
                              {i !== selectedDonor.activities.length - 1 && (
                                <div className="absolute left-[-9px] top-8 h-[calc(100%+2rem)] w-0.5 bg-zinc-100" />
                              )}
                              <div className={cn(
                                'absolute -left-[41px] top-0 h-8 w-8 rounded-full border-4 border-zinc-50 flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110',
                                getActivityBg(activity.type)
                              )}>
                                {getActivityIcon(activity.type)}
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1 bg-white p-4 rounded-xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-zinc-900">{activity.title}</span>
                                    {activity.amount && (
                                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold px-1.5 h-5">
                                        {formatCurrency(activity.amount)}
                                      </Badge>
                                    )}
                                  </div>
                                  {activity.description && (
                                    <p className="text-sm text-zinc-600 leading-relaxed max-w-xl">{activity.description}</p>
                                  )}
                                </div>
                                <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">
                                  {format(new Date(activity.date), 'MMM d, h:mm a')}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="contact-info" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="shadow-sm border-zinc-200">
                          <CardHeader className="pb-3 border-b border-zinc-100">
                            <CardTitle className="text-sm font-semibold">Contact Methods</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4 space-y-4">
                            <div className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                  <Mail className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xs text-zinc-500 font-medium">Email</p>
                                  <p className="text-sm font-medium text-zinc-900">{selectedDonor.email}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => copyToClipboard(selectedDonor.email, 'Email')}>
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                  <Phone className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-xs text-zinc-500 font-medium">Phone</p>
                                  <p className="text-sm font-medium text-zinc-900">{selectedDonor.phone || 'N/A'}</p>
                                </div>
                              </div>
                              {selectedDonor.phone && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => copyToClipboard(selectedDonor.phone, 'Phone')}>
                                  <Copy className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="shadow-sm border-zinc-200">
                          <CardHeader className="pb-3 border-b border-zinc-100">
                            <CardTitle className="text-sm font-semibold">Address</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0">
                                  <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                  {selectedDonor.address?.street ? (
                                    <>
                                      <p className="text-sm font-medium text-zinc-900">{selectedDonor.address.street}</p>
                                      <p className="text-sm text-zinc-600">
                                        {selectedDonor.address.city}, {selectedDonor.address.state} {selectedDonor.address.zip}
                                      </p>
                                      {selectedDonor.address.country && (
                                        <p className="text-xs text-zinc-400 mt-1 uppercase font-bold">{selectedDonor.address.country}</p>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-sm text-zinc-500">{selectedDonor.location || 'No address on file'}</p>
                                  )}
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="giving-history" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <Card className="shadow-sm border-zinc-200 overflow-hidden">
                        <div className="p-0">
                          <table className="w-full text-sm text-left">
                            <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-100">
                              <tr>
                                <th className="px-6 py-3 font-semibold">Date</th>
                                <th className="px-6 py-3 font-semibold">Type</th>
                                <th className="px-6 py-3 font-semibold">Amount</th>
                                <th className="px-6 py-3 font-semibold">Status</th>
                                <th className="px-6 py-3 font-semibold text-right">Receipt</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                              {selectedDonor.activities.filter(a => a.type === 'gift').length > 0 ? (
                                selectedDonor.activities.filter(a => a.type === 'gift').map((gift) => (
                                  <tr key={gift.id} className="hover:bg-zinc-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-zinc-900">
                                      {format(new Date(gift.date), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500">
                                      Online Gift
                                    </td>
                                    <td className="px-6 py-4 font-bold text-zinc-900">
                                      {formatCurrency(gift.amount || 0)}
                                    </td>
                                    <td className="px-6 py-4">
                                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                                        {gift.status || 'Succeeded'}
                                      </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-zinc-100 rounded-full">
                                        <Download className="h-4 w-4 text-zinc-400 hover:text-zinc-900" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5}>
                                    <div className="p-12 text-center text-zinc-400">
                                      <div className="h-12 w-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <History className="h-6 w-6 text-zinc-300" />
                                      </div>
                                      <p>No giving history available.</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in zoom-in-95 duration-500 bg-zinc-50/30">
            <div className="w-24 h-24 bg-white border-2 border-zinc-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <User className="h-10 w-10 text-zinc-300" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Select a Partner</h3>
            <p className="text-zinc-500 max-w-sm mx-auto mb-8 leading-relaxed">
              Select a donor from the list to view their full profile, interaction timeline, and giving history.
            </p>
            {profile?.id && (
              <AddPartnerDialog
                missionaryId={profile.id}
                onSuccess={fetchDonors}
                trigger={
                  <Button className="shadow-md bg-zinc-900 text-white hover:bg-zinc-800 px-6 h-11">
                    <Plus className="mr-2 h-4 w-4" /> Add New Partner
                  </Button>
                }
              />
            )}
          </div>
        )}
      </div>

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
            <DialogDescription>Add a private note to {selectedDonor?.name}&apos;s timeline.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Type your note here..."
              className="min-h-[150px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNote} className="bg-zinc-900 text-white">Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
