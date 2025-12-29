'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
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
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
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
    case 'Lapsed': return 'bg-zinc-400'
    case 'New': return 'bg-blue-500'
    case 'At Risk': return 'bg-amber-500'
    default: return 'bg-zinc-400'
  }
}

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    Lapsed: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    New: 'bg-blue-50 text-blue-700 border-blue-100',
    'At Risk': 'bg-amber-50 text-amber-700 border-amber-100',
  }
  return (
    <Badge variant="outline" className={cn('font-black border text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full', styles[status] || styles['Lapsed'])}>
      {status}
    </Badge>
  )
}

const getActivityIcon = (type: ActivityType) => {
  switch(type) {
    case 'gift': return <Heart className="h-3.5 w-3.5 text-white" />
    case 'call': return <Phone className="h-3.5 w-3.5 text-white" />
    case 'email': return <Mail className="h-3.5 w-3.5 text-white" />
    case 'note': return <MessageSquare className="h-3.5 w-3.5 text-white" />
    case 'meeting': return <Briefcase className="h-3.5 w-3.5 text-white" />
    default: return <Clock className="h-3.5 w-3.5 text-white" />
  }
}

const getActivityBg = (type: ActivityType) => {
  switch(type) {
    case 'gift': return 'bg-rose-500'
    case 'call': return 'bg-blue-500'
    case 'email': return 'bg-purple-500'
    case 'note': return 'bg-zinc-600'
    case 'meeting': return 'bg-emerald-500'
    default: return 'bg-zinc-400'
  }
}

function DonorListSkeleton() {
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-zinc-100">
          <Skeleton className="h-11 w-11 rounded-full" />
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
      <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
        <AlertCircle className="h-7 w-7 text-rose-500" />
      </div>
      <p className="text-sm font-bold text-zinc-900 mb-1">Something went wrong</p>
      <p className="text-xs text-zinc-500 mb-4">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry} className="h-9 rounded-2xl border-zinc-200 bg-white text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900">
        <RefreshCw className="h-3.5 w-3.5 mr-2" />
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

  const isLoading = authLoading || loading

  const activeCount = donors.filter(d => d.status === 'Active').length
  const atRiskCount = donors.filter(d => d.status === 'At Risk').length

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Partners" 
        description="Manage your support network and donor relationships."
      >
        <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        {profile?.id && (
          <AddPartnerDialog
            missionaryId={profile.id}
            onSuccess={fetchDonors}
            trigger={
              <Button size="sm" className="h-9 px-4 text-xs font-medium">
                <Plus className="mr-2 h-4 w-4" />
                Add Partner
              </Button>
            }
          />
        )}
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-all rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Partners</p>
                <p className="text-xl font-bold tracking-tight text-zinc-900">{donors.length}</p>
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{activeCount} active</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                <User className="h-4 w-4 text-zinc-900" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-all rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Given</p>
                <p className="text-xl font-bold tracking-tight text-zinc-900">{formatCurrency(donors.reduce((sum, d) => sum + (d.total_given || 0), 0))}</p>
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Lifetime</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Heart className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-all rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Monthly</p>
                <p className="text-xl font-bold tracking-tight text-zinc-900">{donors.filter(d => d.frequency === 'Monthly').length}</p>
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Recurring</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-all rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">At Risk</p>
                <p className="text-xl font-bold tracking-tight text-zinc-900">{atRiskCount}</p>
                <span className="text-[10px] font-medium text-amber-500 uppercase tracking-wider">Needs attention</span>
              </div>
              <div className="h-9 w-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xl:col-span-3">
          <Card className="border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-zinc-100 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Partner List</h2>
                <div className="flex gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 rounded-lg">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl border-zinc-100 shadow-xl">
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Filter Status</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      {['All', 'Active', 'New', 'Lapsed', 'At Risk'].map(s => (
                        <DropdownMenuCheckboxItem
                          key={s}
                          checked={statusFilter === s}
                          onCheckedChange={() => setStatusFilter(s)}
                          className="text-xs font-medium"
                        >
                          {s}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search partners..."
                  className="pl-9 bg-zinc-50 border-zinc-100 focus:bg-white focus:border-zinc-300 transition-all h-10 rounded-xl text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-28rem)]">
              {error ? (
                <ErrorState message={error} onRetry={fetchDonors} />
              ) : isLoading ? (
                <DonorListSkeleton />
              ) : filteredDonors.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-zinc-300" />
                  </div>
                  <p className="text-sm font-bold text-zinc-900">No partners found</p>
                  <p className="text-xs text-zinc-400 mt-1">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredDonors.map((donor) => (
                    <div
                      key={donor.id}
                      onClick={() => setSelectedDonorId(donor.id)}
                      className={cn(
                        'group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border',
                        selectedDonorId === donor.id
                          ? 'bg-zinc-900 border-zinc-900'
                          : 'bg-white border-transparent hover:bg-zinc-50 hover:border-zinc-200'
                      )}
                    >
                      <div className="relative shrink-0">
                        <Avatar className={cn('h-10 w-10 border-2', selectedDonorId === donor.id ? 'border-zinc-700' : 'border-white shadow-sm')}>
                          <AvatarImage src={donor.avatar_url} />
                          <AvatarFallback className={cn('text-xs font-bold', selectedDonorId === donor.id ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-500')}>
                            {donor.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2', selectedDonorId === donor.id ? 'border-zinc-900' : 'border-white', getStatusColor(donor.status))} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className={cn('font-bold text-sm truncate', selectedDonorId === donor.id ? 'text-white' : 'text-zinc-900')}>
                            {donor.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={cn('text-[10px] truncate max-w-[100px] font-medium uppercase tracking-wider', selectedDonorId === donor.id ? 'text-zinc-400' : 'text-zinc-400')}>
                            {donor.location || 'Unknown'}
                          </span>
                          <span className={cn('text-xs font-black', selectedDonorId === donor.id ? 'text-zinc-300' : 'text-zinc-900')}>
                            {formatCurrency(donor.last_gift_amount)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={cn('h-4 w-4 shrink-0 transition-transform', selectedDonorId === donor.id ? 'text-zinc-500' : 'text-zinc-300 group-hover:translate-x-0.5')} />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </Card>
        </div>

        <div className="lg:col-span-8 xl:col-span-9">
          {selectedDonor ? (
            <Card className="border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="border-b border-zinc-100 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 text-zinc-400 rounded-xl hover:bg-zinc-100" onClick={() => setSelectedDonorId(null)}>
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <Avatar className="h-14 w-14 border-2 border-white shadow-lg rounded-2xl">
                      <AvatarImage src={selectedDonor.avatar_url} />
                      <AvatarFallback className="text-lg font-bold bg-zinc-100 text-zinc-500">
                        {selectedDonor.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-lg font-bold text-zinc-900 tracking-tight">{selectedDonor.name}</h2>
                        {getStatusBadge(selectedDonor.status)}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <MapPin className="h-3 w-3" /> {selectedDonor.location || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 px-4 text-xs font-medium rounded-xl border-zinc-200 hover:bg-zinc-50" onClick={() => setIsNoteDialogOpen(true)}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" /> Note
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 px-4 text-xs font-medium rounded-xl border-zinc-200 hover:bg-zinc-50">
                      <Phone className="h-3.5 w-3.5 mr-1.5" /> Call
                    </Button>
                    <Button size="sm" className="flex-1 sm:flex-none h-9 px-4 text-xs font-medium rounded-xl">
                      <Mail className="h-3.5 w-3.5 mr-1.5" /> Email
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 rounded-xl hover:bg-zinc-100">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-zinc-100 shadow-xl">
                        <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-100" />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Lifetime</p>
                    <p className="text-lg font-bold text-zinc-900">{formatCurrency(selectedDonor.total_given)}</p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Last Gift</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-zinc-900">{formatCurrency(selectedDonor.last_gift_amount)}</p>
                      {selectedDonor.last_gift_date && new Date(selectedDonor.last_gift_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Frequency</p>
                    <div className="flex items-center gap-1.5">
                      <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" />
                      <p className="text-sm font-bold text-zinc-900">{selectedDonor.frequency}</p>
                    </div>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Partner Since</p>
                    <p className="text-sm font-bold text-zinc-900">{selectedDonor.joined_date ? format(new Date(selectedDonor.joined_date), 'MMM yyyy') : 'N/A'}</p>
                  </div>
                </div>

                {selectedDonor.tags && selectedDonor.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {selectedDonor.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-zinc-100 border border-zinc-200 rounded-full text-[9px] font-black text-zinc-600 uppercase tracking-widest">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 py-4 border-b border-zinc-100">
                  <TabsList className="bg-zinc-100/50 border border-zinc-100 p-1.5 h-auto rounded-2xl w-full sm:w-auto">
                    <TabsTrigger 
                      value="timeline" 
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 data-[state=active]:text-zinc-900 transition-all"
                    >
                      Timeline
                    </TabsTrigger>
                    <TabsTrigger 
                      value="contact" 
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 data-[state=active]:text-zinc-900 transition-all"
                    >
                      Contact
                    </TabsTrigger>
                    <TabsTrigger 
                      value="giving" 
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 data-[state=active]:text-zinc-900 transition-all"
                    >
                      Giving
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="h-[calc(100vh-40rem)]">
                  <div className="p-6">
                    <TabsContent value="timeline" className="mt-0 space-y-6">
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        <Textarea
                          placeholder="Log a call, meeting notes, or observation..."
                          className="min-h-[80px] border-none bg-white focus:ring-0 resize-none text-sm p-3 rounded-xl shadow-sm"
                        />
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100">
                              <Phone className="h-3.5 w-3.5 mr-1.5" /> Call
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100">
                              <Briefcase className="h-3.5 w-3.5 mr-1.5" /> Meeting
                            </Button>
                          </div>
                          <Button size="sm" className="h-8 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest">
                            Post <Send className="h-3 w-3 ml-1.5" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-4 relative">
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-zinc-100" />
                        
                        {selectedDonor.activities.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 text-center ml-8">
                            <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                              <Calendar className="h-7 w-7 text-zinc-300" />
                            </div>
                            <p className="text-sm font-bold text-zinc-900">No activity recorded yet</p>
                            <p className="text-xs text-zinc-400 mt-1">Start by logging your first interaction</p>
                          </div>
                        ) : (
                          selectedDonor.activities.map((activity) => (
                            <div key={activity.id} className="relative pl-10 group">
                              <div className={cn(
                                'absolute left-0 top-1 h-8 w-8 rounded-xl flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110',
                                getActivityBg(activity.type)
                              )}>
                                {getActivityIcon(activity.type)}
                              </div>
                              
                              <div className="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/40 transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-1">
                                  <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="text-sm font-bold text-zinc-900">{activity.title}</span>
                                      {activity.amount && (
                                        <Badge className={cn(
                                          'font-black px-2 h-5 rounded-lg text-[9px] uppercase tracking-widest border-0',
                                          activity.status === 'Failed' 
                                            ? 'bg-rose-50 text-rose-600'
                                            : 'bg-emerald-50 text-emerald-700'
                                        )}>
                                          {formatCurrency(activity.amount)}
                                        </Badge>
                                      )}
                                      {activity.status === 'Failed' && (
                                        <Badge className="bg-rose-50 text-rose-600 border-0 text-[9px] font-black uppercase tracking-widest">
                                          Failed
                                        </Badge>
                                      )}
                                    </div>
                                    {activity.description && (
                                      <p className="text-sm text-zinc-500 leading-relaxed">{activity.description}</p>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 whitespace-nowrap">
                                    {format(new Date(activity.date), 'MMM d, h:mm a')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="contact" className="mt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Contact Methods</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-zinc-200 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                  <Mail className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email</p>
                                  <p className="text-sm font-medium text-zinc-900 truncate">{selectedDonor.email}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl" onClick={() => copyToClipboard(selectedDonor.email, 'Email')}>
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-zinc-200 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                  <Phone className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Phone</p>
                                  <p className="text-sm font-medium text-zinc-900">{selectedDonor.phone || 'N/A'}</p>
                                </div>
                              </div>
                              {selectedDonor.phone && (
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl" onClick={() => copyToClipboard(selectedDonor.phone, 'Phone')}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Address</h3>
                          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
                                  <MapPin className="h-4 w-4" />
                                </div>
                                <div>
                                  {selectedDonor.address?.street ? (
                                    <>
                                      <p className="text-sm font-medium text-zinc-900">{selectedDonor.address.street}</p>
                                      <p className="text-sm text-zinc-500">
                                        {selectedDonor.address.city}, {selectedDonor.address.state} {selectedDonor.address.zip}
                                      </p>
                                      {selectedDonor.address.country && (
                                        <p className="text-[10px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">{selectedDonor.address.country}</p>
                                      )}
                                    </>
                                  ) : (
                                    <p className="text-sm text-zinc-500">{selectedDonor.location || 'No address on file'}</p>
                                  )}
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl">
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="giving" className="mt-0">
                      <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                        <table className="w-full text-sm text-left">
                          <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 border-b border-zinc-200">
                            <tr>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Type</th>
                              <th className="px-6 py-4">Amount</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-right">Receipt</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {selectedDonor.activities.filter(a => a.type === 'gift').length > 0 ? (
                              selectedDonor.activities.filter(a => a.type === 'gift').map((gift) => (
                                <tr key={gift.id} className="hover:bg-zinc-50 transition-colors">
                                  <td className="px-6 py-4 font-medium text-zinc-900 whitespace-nowrap">
                                    {format(new Date(gift.date), 'MMM d, yyyy')}
                                  </td>
                                  <td className="px-6 py-4 text-zinc-500">
                                    Online Gift
                                  </td>
                                  <td className="px-6 py-4 font-bold text-zinc-900">
                                    {formatCurrency(gift.amount || 0)}
                                  </td>
                                  <td className="px-6 py-4">
                                    <Badge className={cn(
                                      'font-black rounded-full text-[9px] uppercase tracking-widest border-0',
                                      gift.status === 'Failed' 
                                        ? 'bg-rose-50 text-rose-600'
                                        : 'bg-emerald-50 text-emerald-700'
                                    )}>
                                      {gift.status || 'Succeeded'}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-zinc-100 rounded-lg">
                                      <Download className="h-4 w-4 text-zinc-400" />
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5}>
                                  <div className="p-16 text-center">
                                    <div className="h-14 w-14 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                      <History className="h-6 w-6 text-zinc-300" />
                                    </div>
                                    <p className="text-sm font-bold text-zinc-900">No giving history available</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>
            </Card>
          ) : (
            <Card className="border-zinc-200 border-dashed bg-zinc-50/30 rounded-[2.5rem] h-full min-h-[500px] flex items-center justify-center">
              <CardContent className="p-16 text-center">
                <div className="h-20 w-20 rounded-3xl bg-white shadow-sm border border-zinc-100 flex items-center justify-center mx-auto mb-8">
                  <User className="h-10 w-10 text-zinc-200" />
                </div>
                <h3 className="font-black text-2xl text-zinc-900 tracking-tight">Select a Partner</h3>
                <p className="mt-2 text-sm font-medium text-zinc-400 max-w-[280px] mx-auto">Choose a donor from the list to view their profile, timeline, and giving history.</p>
                {profile?.id && (
                  <AddPartnerDialog
                    missionaryId={profile.id}
                    onSuccess={fetchDonors}
                    trigger={
                      <Button className="mt-10 h-11 px-8 rounded-2xl bg-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-zinc-800">
                        <Plus className="h-4 w-4 mr-2" /> Add Partner
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">Add Note</DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">Add a private note to {selectedDonor?.name}&apos;s timeline.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Type your note here..."
              className="min-h-[150px] resize-none rounded-xl border-zinc-200"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)} className="h-10 px-6 rounded-xl border-zinc-200">Cancel</Button>
            <Button onClick={handleAddNote} disabled={!noteInput.trim()} className="h-10 px-6 rounded-xl">Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
