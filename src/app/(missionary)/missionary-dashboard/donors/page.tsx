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
import { Skeleton } from '@/components/ui/skeleton'
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
  ArrowUpRight,
  Calendar,
  History,
  Briefcase,
  Clock,
  Brain,
  Sparkles,
  Lightbulb,
  Zap,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { AddPartnerDialog } from '@/features/missionary/components/add-partner-dialog'
import { toast } from 'sonner'

type ActivityType = 'gift' | 'note' | 'call' | 'email' | 'meeting'

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

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return '$0'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value)
}

const getStatusColor = (status: string) => {
  switch(status) {
    case 'Active': return 'bg-emerald-500'
    case 'Lapsed': return 'bg-muted-foreground'
    case 'New': return 'bg-blue-500'
    case 'At Risk': return 'bg-amber-500'
    default: return 'bg-muted-foreground'
  }
}

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Lapsed: 'bg-muted text-muted-foreground border-border',
    New: 'bg-blue-50 text-blue-700 border-blue-200',
    'At Risk': 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <Badge variant="outline" className={cn('font-semibold border px-2.5 py-0.5 text-[11px] uppercase tracking-wider', styles[status] || styles['Lapsed'])}>
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
    default: return <Clock className="h-4 w-4 text-white" />
  }
}

const getActivityBg = (type: ActivityType) => {
  switch(type) {
    case 'gift': return 'bg-rose-500'
    case 'call': return 'bg-blue-500'
    case 'email': return 'bg-purple-500'
    case 'note': return 'bg-primary'
    case 'meeting': return 'bg-emerald-500'
    default: return 'bg-muted-foreground'
  }
}

function DonorListSkeleton() {
  return (
    <div className="p-2 space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-card">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-6">
      <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <p className="text-sm font-medium text-foreground mb-2">Something went wrong</p>
      <p className="text-xs text-muted-foreground mb-4">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-3.5 w-3.5" />
        Try Again
      </Button>
    </div>
  )
}

export default function DonorsPage() {
  const { profile, loading: authLoading } = useAuth()
  const supabase = React.useMemo(() => createClient(), [])
  const [donors, setDonors] = React.useState<Donor[]>([])
  const [selectedDonorId, setSelectedDonorId] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('All')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState('timeline')
  const [noteInput, setNoteInput] = React.useState('')
  const [isNoteDialogOpen, setIsNoteDialogOpen] = React.useState(false)
  const [aiAnalysis, setAiAnalysis] = React.useState<{ persona: string; strategy: string; nextMove: string } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)

  const fetchDonors = React.useCallback(async () => {
    if (!profile?.id) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: fetchError } = await supabase
        .from('donors')
        .select(`
          *,
          activities: donor_activities(*)
        `)
        .eq('missionary_id', profile.id)
        .order('name', { ascending: true })

      if (fetchError) throw fetchError

      const formattedDonors = (data || []).map(d => ({
        ...d,
        initials: d.name ? d.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : '??',
        activities: (d.activities || []).sort((a: Activity, b: Activity) => 
          new Date(b.date || '').getTime() - new Date(a.date || '').getTime()
        )
      }))

      setDonors(formattedDonors)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load donors'
      setError(errorMessage)
      toast.error('Failed to load donors')
      console.error('Donors fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [profile?.id, supabase])

  React.useEffect(() => {
    if (!authLoading) {
      fetchDonors()
    }
  }, [fetchDonors, authLoading])

  React.useEffect(() => {
    setAiAnalysis(null)
  }, [selectedDonorId])

  const filteredDonors = React.useMemo(() => {
    const result = donors.filter(donor => {
      const matchesSearch = (donor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (donor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const selectedDonor = React.useMemo(() => 
    donors.find(d => d.id === selectedDonorId) || null
  , [donors, selectedDonorId])

  const copyToClipboard = React.useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }, [])

  const handleAddNote = React.useCallback(async () => {
    if (!selectedDonor || !noteInput.trim()) return
    
    try {
      const { error: insertError } = await supabase
        .from('donor_activities')
        .insert({
          donor_id: selectedDonor.id,
          type: 'note',
          title: 'Note',
          description: noteInput.trim(),
          date: new Date().toISOString()
        })
      
      if (insertError) throw insertError
      
      toast.success('Note added successfully')
      setNoteInput('')
      setIsNoteDialogOpen(false)
      fetchDonors()
    } catch (err) {
      toast.error('Failed to add note')
      console.error(err)
    }
  }, [selectedDonor, noteInput, supabase, fetchDonors])

  const analyzeDonorRelationship = React.useCallback(async () => {
    if (!selectedDonor) return
    setIsAnalyzing(true)
    setAiAnalysis(null)

    await new Promise(r => setTimeout(r, 1500))
    
    const personas = [
      { persona: 'The Community Builder', strategy: 'Values personal connection and tangible project updates. Responds well to stories about specific individuals.', nextMove: 'Send a photo update of current projects and include a personal thank you note.' },
      { persona: 'The Strategic Giver', strategy: 'Data-driven decision maker who wants to see measurable impact. Appreciates efficiency and clear ROI.', nextMove: 'Share quarterly impact metrics and highlight cost-effectiveness of programs.' },
      { persona: 'The Faith Partner', strategy: 'Deeply motivated by spiritual calling. Values prayer partnership and ministry alignment.', nextMove: 'Invite them to join your monthly prayer team and share specific prayer requests.' },
      { persona: 'The Legacy Builder', strategy: 'Thinks long-term about their giving impact. Interested in sustainable, generational change.', nextMove: 'Discuss planned giving options and share stories of long-term transformation.' },
    ]
    
    const randomPersona = personas[Math.floor(Math.random() * personas.length)]
    setAiAnalysis(randomPersona)
    setIsAnalyzing(false)
  }, [selectedDonor])

  const isLoading = authLoading || loading

  return (
    <div className="flex h-[calc(100vh-5rem)] w-full bg-background animate-in fade-in duration-300 relative overflow-hidden rounded-2xl border border-border shadow-sm">
      
      <div className={cn(
        'flex flex-col h-full border-r border-border bg-card w-full lg:w-[400px] xl:w-[450px] transition-all duration-300 absolute lg:relative z-10',
        selectedDonorId ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
      )}>
        <div className="p-4 border-b border-border space-y-4 shrink-0 bg-card z-20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-foreground">Partners</h2>
              <p className="text-xs text-muted-foreground font-medium">
                {isLoading ? 'Loading...' : `${filteredDonors.length} contacts`}
              </p>
            </div>
            <div className="flex gap-1.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground">
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
                    <Button size="icon" className="h-9 w-9 rounded-xl">
                      <Plus className="h-4 w-4" />
                    </Button>
                  }
                />
              )}
            </div>
          </div>
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search partners..."
              className="pl-9 bg-secondary/50 border-border focus:bg-card focus:ring-2 focus:ring-ring/20 transition-all h-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {error ? (
            <ErrorState message={error} onRetry={fetchDonors} />
          ) : isLoading ? (
            <DonorListSkeleton />
          ) : filteredDonors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-6">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">No partners found</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredDonors.map((donor) => (
                <motion.div
                  key={donor.id}
                  layoutId={`donor-card-${donor.id}`}
                  onClick={() => setSelectedDonorId(donor.id)}
                  className={cn(
                    'group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border relative overflow-hidden',
                    selectedDonorId === donor.id
                      ? 'bg-primary/5 border-primary/20 shadow-sm'
                      : 'bg-card border-transparent hover:bg-secondary/50 hover:border-border'
                  )}
                >
                  {selectedDonorId === donor.id && (
                    <motion.div layoutId="selection-bar" className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r" />
                  )}
                  
                  <div className="relative shrink-0">
                    <Avatar className={cn('h-12 w-12 border-2 transition-all', selectedDonorId === donor.id ? 'border-primary/20' : 'border-card shadow-sm')}>
                      <AvatarImage src={donor.avatar_url} />
                      <AvatarFallback className="bg-secondary text-muted-foreground font-bold text-xs">
                        {donor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn('absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card ring-1 ring-black/5', getStatusColor(donor.status))} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={cn('font-semibold text-sm truncate transition-colors', selectedDonorId === donor.id ? 'text-primary' : 'text-foreground')}>
                        {donor.name}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap ml-2">
                        {donor.last_gift_date ? formatDistanceToNow(new Date(donor.last_gift_date), { addSuffix: true }) : 'No gifts'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {donor.location || 'Unknown'}
                      </span>
                      <span className="text-xs font-bold text-foreground bg-secondary px-1.5 py-0.5 rounded-md">
                        {formatCurrency(donor.last_gift_amount)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className={cn(
        'flex-1 flex flex-col bg-card h-full overflow-hidden absolute inset-0 lg:relative z-20 lg:z-0 transition-transform duration-300',
        selectedDonorId ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      )}>
        {selectedDonor ? (
          <div className="flex flex-col h-full bg-background/50">
            <div className="shrink-0 h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card/80 backdrop-blur-md sticky top-0 z-30">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 -ml-2 text-muted-foreground" onClick={() => setSelectedDonorId(null)}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-foreground truncate hidden sm:block">{selectedDonor.name}</h2>
                  {getStatusBadge(selectedDonor.status)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-9 text-xs font-semibold gap-2 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-800 rounded-xl',
                    isAnalyzing && 'opacity-80'
                  )}
                  onClick={analyzeDonorRelationship}
                  disabled={isAnalyzing}
                >
                  <Brain className={cn('h-3.5 w-3.5', isAnalyzing && 'animate-pulse')} />
                  <span className="hidden sm:inline">{isAnalyzing ? 'Analyzing...' : 'Analyze DNA'}</span>
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
                <Button variant="outline" size="sm" className="hidden sm:flex h-9 text-xs font-semibold gap-2 rounded-xl" onClick={() => setIsNoteDialogOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" /> Note
                </Button>
                <Button variant="outline" size="sm" className="hidden md:flex h-9 text-xs font-semibold gap-2 rounded-xl">
                  <Phone className="h-3.5 w-3.5" /> Call
                </Button>
                <Button size="sm" className="h-9 text-xs font-semibold gap-2 rounded-xl">
                  <Mail className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Email</span>
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
                  <div className="flex items-center gap-6 min-w-[280px]">
                    <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-card shadow-lg rounded-2xl bg-card">
                      <AvatarImage src={selectedDonor.avatar_url} />
                      <AvatarFallback className="text-xl md:text-2xl font-bold bg-secondary text-muted-foreground">
                        {selectedDonor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1.5">
                      <h1 className="text-xl md:text-2xl font-bold text-foreground">{selectedDonor.name}</h1>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> {selectedDonor.location || 'Unknown'}
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {(selectedDonor.tags || []).slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-card border border-border rounded-lg text-[10px] font-semibold text-muted-foreground shadow-sm uppercase tracking-wide">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 w-full grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Lifetime</p>
                        <p className="text-lg md:text-xl font-bold text-foreground">{formatCurrency(selectedDonor.total_given)}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Last Gift</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-lg md:text-xl font-bold text-foreground">{formatCurrency(selectedDonor.last_gift_amount)}</p>
                          {selectedDonor.last_gift_date && new Date(selectedDonor.last_gift_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" title="Recent Gift" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Frequency</p>
                        <div className="flex items-center gap-1">
                          <ArrowUpRight className="h-3 w-3 text-emerald-600" />
                          <p className="text-sm font-bold text-foreground">{selectedDonor.frequency}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4 space-y-1">
                        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Partner Since</p>
                        <p className="text-sm font-bold text-foreground">{selectedDonor.joined_date ? new Date(selectedDonor.joined_date).getFullYear() : 'N/A'}</p>
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
                      <div className="relative rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50 p-6 shadow-sm">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                          <Brain className="h-20 w-20 md:h-24 md:w-24 text-purple-900" />
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-purple-600 fill-purple-200" />
                            <h3 className="text-sm font-bold text-purple-900 uppercase tracking-widest">Relationship Intelligence</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="bg-white/60 p-4 rounded-xl border border-purple-100 backdrop-blur-sm">
                              <div className="flex items-center gap-2 mb-2 text-purple-800 font-semibold text-xs uppercase tracking-wider">
                                <User className="h-3.5 w-3.5" /> Giving Persona
                              </div>
                              <p className="font-bold text-foreground text-base md:text-lg">{aiAnalysis.persona}</p>
                            </div>
                            <div className="bg-white/60 p-4 rounded-xl border border-purple-100 backdrop-blur-sm">
                              <div className="flex items-center gap-2 mb-2 text-purple-800 font-semibold text-xs uppercase tracking-wider">
                                <Lightbulb className="h-3.5 w-3.5" /> Strategy
                              </div>
                              <p className="text-sm text-muted-foreground leading-relaxed">{aiAnalysis.strategy}</p>
                            </div>
                            <div className="bg-white/60 p-4 rounded-xl border border-purple-100 backdrop-blur-sm">
                              <div className="flex items-center gap-2 mb-2 text-purple-800 font-semibold text-xs uppercase tracking-wider">
                                <Zap className="h-3.5 w-3.5" /> Next Move
                              </div>
                              <p className="text-sm text-foreground leading-relaxed font-medium">{aiAnalysis.nextMove}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-border">
                    <TabsList className="bg-transparent h-auto p-0 gap-4 md:gap-6">
                      {[
                        { key: 'timeline', label: 'Timeline' },
                        { key: 'contact-info', label: 'Contact' },
                        { key: 'giving-history', label: 'Giving' },
                      ].map(tab => (
                        <TabsTrigger
                          key={tab.key}
                          value={tab.key}
                          className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-1 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-all hover:text-foreground"
                        >
                          {tab.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  <div className="pt-6">
                    <TabsContent value="timeline" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="bg-card p-4 rounded-2xl border border-border shadow-sm flex gap-4 transition-all focus-within:ring-2 focus-within:ring-ring/20">
                        <Avatar className="h-9 w-9 hidden md:flex">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">ME</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <Textarea
                            placeholder="Log a call, meeting notes, or observation..."
                            className="min-h-[60px] border-none bg-secondary/50 focus:bg-card focus:ring-0 resize-none text-sm p-3 rounded-xl transition-colors placeholder:text-muted-foreground"
                          />
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary gap-1.5 rounded-lg">
                                <Phone className="h-3.5 w-3.5" /> Log Call
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary gap-1.5 rounded-lg">
                                <Check className="h-3.5 w-3.5" /> Task
                              </Button>
                            </div>
                            <Button size="sm" className="h-8 text-xs rounded-xl gap-1.5">
                              Post <Send className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6 pl-4 border-l-2 border-border ml-4 relative pb-10">
                        {selectedDonor.activities.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center pl-8">
                            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                              <Calendar className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">No activity recorded yet</p>
                            <p className="text-xs text-muted-foreground mt-1">Start by logging your first interaction</p>
                          </div>
                        ) : (
                          selectedDonor.activities.map((activity, i) => (
                            <div key={activity.id} className="relative pl-8 group">
                              {i !== selectedDonor.activities.length - 1 && (
                                <div className="absolute left-[-9px] top-8 h-[calc(100%+1.5rem)] w-0.5 bg-border" />
                              )}
                              <div className={cn(
                                'absolute -left-[41px] top-0 h-8 w-8 rounded-full border-4 border-background flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110',
                                getActivityBg(activity.type)
                              )}>
                                {getActivityIcon(activity.type)}
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1 bg-card p-4 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                                <div className="space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-sm font-bold text-foreground">{activity.title}</span>
                                    {activity.amount && (
                                      <Badge variant="secondary" className={cn(
                                        'font-bold px-2 h-5 rounded-lg',
                                        activity.status === 'Failed' 
                                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                                          : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      )}>
                                        {formatCurrency(activity.amount)}
                                      </Badge>
                                    )}
                                    {activity.status === 'Failed' && (
                                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                                        Failed
                                      </Badge>
                                    )}
                                  </div>
                                  {activity.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{activity.description}</p>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                                  {format(new Date(activity.date), 'MMM d, h:mm a')}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="contact-info" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <Card className="shadow-sm border-border">
                          <CardHeader className="pb-3 border-b border-border">
                            <CardTitle className="text-sm font-semibold">Contact Methods</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4 space-y-4">
                            <div className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                  <Mail className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs text-muted-foreground font-medium">Email</p>
                                  <p className="text-sm font-medium text-foreground truncate">{selectedDonor.email}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 rounded-xl shrink-0" onClick={() => copyToClipboard(selectedDonor.email, 'Email')}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                  <Phone className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs text-muted-foreground font-medium">Phone</p>
                                  <p className="text-sm font-medium text-foreground">{selectedDonor.phone || 'N/A'}</p>
                                </div>
                              </div>
                              {selectedDonor.phone && (
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 rounded-xl shrink-0" onClick={() => copyToClipboard(selectedDonor.phone, 'Phone')}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="shadow-sm border-border">
                          <CardHeader className="pb-3 border-b border-border">
                            <CardTitle className="text-sm font-semibold">Address</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="h-9 w-9 rounded-xl bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
                                  <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                  {selectedDonor.address?.street ? (
                                    <>
                                      <p className="text-sm font-medium text-foreground">{selectedDonor.address.street}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {selectedDonor.address.city}, {selectedDonor.address.state} {selectedDonor.address.zip}
                                      </p>
                                      {selectedDonor.address.country && (
                                        <p className="text-xs text-muted-foreground mt-1 uppercase font-bold">{selectedDonor.address.country}</p>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">{selectedDonor.location || 'No address on file'}</p>
                                  )}
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl shrink-0">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>

                    <TabsContent value="giving-history" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <Card className="shadow-sm border-border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left min-w-[500px]">
                            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                              <tr>
                                <th className="px-4 md:px-6 py-3 font-semibold">Date</th>
                                <th className="px-4 md:px-6 py-3 font-semibold">Type</th>
                                <th className="px-4 md:px-6 py-3 font-semibold">Amount</th>
                                <th className="px-4 md:px-6 py-3 font-semibold">Status</th>
                                <th className="px-4 md:px-6 py-3 font-semibold text-right">Receipt</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {selectedDonor.activities.filter(a => a.type === 'gift').length > 0 ? (
                                selectedDonor.activities.filter(a => a.type === 'gift').map((gift) => (
                                  <tr key={gift.id} className="hover:bg-secondary/30 transition-colors">
                                    <td className="px-4 md:px-6 py-4 font-medium text-foreground whitespace-nowrap">
                                      {format(new Date(gift.date), 'MMM d, yyyy')}
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-muted-foreground">
                                      Online Gift
                                    </td>
                                    <td className="px-4 md:px-6 py-4 font-bold text-foreground">
                                      {formatCurrency(gift.amount || 0)}
                                    </td>
                                    <td className="px-4 md:px-6 py-4">
                                      <Badge 
                                        variant="outline" 
                                        className={cn(
                                          'font-semibold rounded-lg',
                                          gift.status === 'Failed' 
                                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        )}
                                      >
                                        {gift.status || 'Succeeded'}
                                      </Badge>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-right">
                                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary rounded-lg">
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5}>
                                    <div className="p-12 text-center text-muted-foreground">
                                      <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                                        <History className="h-6 w-6" />
                                      </div>
                                      <p className="text-sm font-medium">No giving history available</p>
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
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in fade-in zoom-in-95 duration-500 bg-background/50">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-card border-2 border-border rounded-full flex items-center justify-center mb-6 shadow-sm">
              <User className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Select a Partner</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8 leading-relaxed text-sm">
              Choose a donor from the list to view their profile, interaction timeline, and giving history.
            </p>
            {profile?.id && (
              <AddPartnerDialog
                missionaryId={profile.id}
                onSuccess={fetchDonors}
                trigger={
                  <Button className="shadow-md px-6 h-11 rounded-2xl font-semibold gap-2">
                    <Plus className="h-4 w-4" /> Add New Partner
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
              className="min-h-[150px] resize-none rounded-xl"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)} className="rounded-xl">Cancel</Button>
            <Button onClick={handleAddNote} disabled={!noteInput.trim()} className="rounded-xl">Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
