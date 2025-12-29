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
import { PageHeader } from '@/components/page-header'
import {
  Search,
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
  TrendingUp,
  ArrowUpRight,
  MoreHorizontal,
  Globe,
  Sparkles,
  Calendar,
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
  address: any
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
    case 'Lapsed': return 'bg-zinc-300'
    case 'New': return 'bg-blue-500'
    case 'At Risk': return 'bg-amber-500'
    default: return 'bg-zinc-300'
  }
}

export default function DonorsPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [donors, setDonors] = React.useState<Donor[]>([])
  const [selectedDonorId, setSelectedDonorId] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [loading, setLoading] = React.useState(true)

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
        activities: (d.activities || []).sort((a: any, b: any) => 
          new Date(b.date || b.created_at).getTime() - new Date(a.date || a.created_at).getTime()
        )
      }))

      setDonors(formattedDonors)
    } catch (error: any) {
      toast.error('Failed to load donors')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [profile?.id, supabase])

  React.useEffect(() => {
    fetchDonors()
  }, [fetchDonors])

  const filteredDonors = donors.filter(donor => {
    const matchesSearch = donor.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const selectedDonor = donors.find(d => d.id === selectedDonorId)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  return (
    <div className="flex flex-col gap-6 lg:h-[calc(100vh-10rem)] lg:flex-row">
      <div className={cn(
        "flex flex-col gap-4 lg:w-80 lg:shrink-0",
        selectedDonorId && "hidden lg:flex"
      )}>
        <PageHeader 
          title="Partners" 
          description={loading ? 'Loading...' : `${donors.length} partners in ministry`}
          className="pb-0"
        >
          {profile?.id && (
            <AddPartnerDialog 
              missionaryId={profile.id} 
              onSuccess={fetchDonors}
              trigger={
                <Button size="icon" className="h-9 w-9 rounded-lg">
                  <Plus className="h-4 w-4" />
                </Button>
              }
            />
          )}
        </PageHeader>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <Input 
            placeholder="Search partners..." 
            className="h-12 pl-11 bg-white border-zinc-100 rounded-2xl shadow-sm focus:bg-white focus:ring-2 focus:ring-zinc-900/5 transition-all text-sm font-bold placeholder:text-zinc-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="flex flex-col gap-3 py-2">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 w-full animate-pulse rounded-[2rem] bg-zinc-50" />
              ))
            ) : filteredDonors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-sm font-bold text-zinc-400">No partners found</p>
              </div>
            ) : (
              filteredDonors.map((donor) => (
                <button
                  key={donor.id}
                  onClick={() => setSelectedDonorId(donor.id)}
                  className={cn(
                    "flex items-center gap-4 rounded-[2rem] border-2 p-4 text-left transition-all group",
                    selectedDonorId === donor.id 
                      ? "border-zinc-900 bg-white shadow-xl shadow-zinc-200/50 scale-[1.02]" 
                      : "border-transparent bg-transparent hover:bg-zinc-50"
                  )}
                >
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={donor.avatar_url} />
                    <AvatarFallback className="bg-zinc-900 text-[10px] font-black text-white">
                      {donor.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-black text-zinc-900 tracking-tight">{donor.name}</p>
                      <div className={cn("h-2 w-2 rounded-full", getStatusColor(donor.status))} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{donor.location || 'Unknown Location'}</span>
                      <span className="text-xs font-black text-zinc-900">{formatCurrency(donor.last_gift_amount)}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className={cn(
        "flex-1 min-w-0 flex flex-col gap-8",
        !selectedDonorId && "hidden lg:flex"
      )}>
        {selectedDonor ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8 h-full"
          >
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden h-10 w-10 rounded-xl"
                onClick={() => setSelectedDonorId(null)}
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <div className="flex flex-1 items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                   <Avatar className="h-16 w-16 border-2 border-white shadow-xl">
                    <AvatarImage src={selectedDonor.avatar_url} />
                    <AvatarFallback className="bg-zinc-900 text-sm font-black text-white">
                      {selectedDonor.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-3xl font-black tracking-tighter text-zinc-900">{selectedDonor.name}</h2>
                    <p className="text-xs font-bold text-zinc-400 mt-1 uppercase tracking-[0.2em]">{selectedDonor.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="hidden sm:flex h-11 px-6 rounded-2xl border-zinc-200 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900">
                    Edit Profile
                  </Button>
                  <Button size="sm" className="h-11 px-8 rounded-2xl bg-zinc-900 text-[10px] font-black uppercase tracking-widest text-white hover:bg-zinc-800 shadow-xl shadow-zinc-200/50">
                    Contact
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
               <Card className="border-zinc-100 bg-white shadow-sm rounded-3xl group hover:border-zinc-900/10 transition-all">
                <CardContent className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-900 transition-colors">Lifetime Support</p>
                  <p className="mt-2 text-3xl font-black text-zinc-900 tracking-tighter">{formatCurrency(selectedDonor.total_given)}</p>
                </CardContent>
              </Card>
              <Card className="border-zinc-100 bg-white shadow-sm rounded-3xl group hover:border-zinc-900/10 transition-all">
                <CardContent className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-900 transition-colors">Last Contribution</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="text-3xl font-black text-zinc-900 tracking-tighter">{formatCurrency(selectedDonor.last_gift_amount)}</p>
                    {selectedDonor.last_gift_date && (
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{format(new Date(selectedDonor.last_gift_date), 'MMM d')}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="border-zinc-100 bg-white shadow-sm rounded-3xl group hover:border-zinc-900/10 transition-all">
                <CardContent className="p-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-zinc-900 transition-colors">Partner Status</p>
                  <div className="mt-2 flex items-center gap-3">
                    <p className="text-3xl font-black text-zinc-900 tracking-tighter">{selectedDonor.frequency || 'Irregular'}</p>
                    <div className={cn("h-2.5 w-2.5 rounded-full ring-4 ring-zinc-50", getStatusColor(selectedDonor.status))} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="timeline" className="flex-1 flex flex-col min-h-0 bg-white border border-zinc-100 rounded-[2.5rem] shadow-sm overflow-hidden">
              <TabsList className="w-full justify-start border-b border-zinc-50 bg-zinc-50/30 p-1.5 h-auto rounded-none gap-1">
                <TabsTrigger 
                  value="timeline" 
                  className="rounded-2xl px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all"
                >
                  Activity Feed
                </TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  className="rounded-2xl px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all"
                >
                  Partner Details
                </TabsTrigger>
              </TabsList>
              <div className="flex-1 min-h-0 p-8">
                <TabsContent value="timeline" className="h-full m-0 outline-none">
                   <ScrollArea className="h-full pr-6">
                    <div className="space-y-10">
                      {selectedDonor.activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                          <Calendar className="h-12 w-12 text-zinc-200 mb-4" />
                          <p className="text-sm font-bold text-zinc-400">No recent activity</p>
                        </div>
                      ) : (
                        selectedDonor.activities.map((activity, i) => (
                          <div key={activity.id} className="relative pl-10 group/item">
                            {i !== selectedDonor.activities.length - 1 && (
                              <div className="absolute left-[13px] top-8 h-[calc(100%+2.5rem)] w-0.5 bg-zinc-50" />
                            )}
                            <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-[0.6rem] border-2 border-zinc-50 bg-white shadow-sm transition-transform group-hover/item:scale-110">
                              <div className="h-2 w-2 rounded-full bg-zinc-900" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between gap-4">
                                <p className="text-sm font-black text-zinc-900 tracking-tight">{activity.title}</p>
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                                  {format(new Date(activity.date), 'MMM d, yyyy')}
                                </span>
                              </div>
                              {activity.description && (
                                <p className="text-xs font-medium text-zinc-500 leading-relaxed max-w-xl">{activity.description}</p>
                              )}
                              {activity.amount && (
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] font-black px-2 py-0.5 rounded-full">
                                    {formatCurrency(activity.amount)}
                                  </Badge>
                                  <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">Processed</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="details" className="h-full m-0 outline-none">
                  <div className="grid gap-12 sm:grid-cols-2">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-zinc-900 rounded-full" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Communication</h3>
                      </div>
                      <div className="space-y-5">
                        <div 
                          className="flex items-center gap-4 group cursor-pointer"
                          onClick={() => copyToClipboard(selectedDonor.email, 'Email')}
                        >
                          <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-100 transition-colors border border-transparent group-hover:border-zinc-200">
                            <Mail className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none mb-1.5">Email</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-zinc-900">{selectedDonor.email}</span>
                              <Copy className="h-3 w-3 text-zinc-200 group-hover:text-zinc-900 transition-colors" />
                            </div>
                          </div>
                        </div>
                        <div 
                          className="flex items-center gap-4 group cursor-pointer"
                          onClick={() => selectedDonor.phone && copyToClipboard(selectedDonor.phone, 'Phone')}
                        >
                          <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-100 transition-colors border border-transparent group-hover:border-zinc-200">
                            <Phone className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none mb-1.5">Phone</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-zinc-900">{selectedDonor.phone || 'N/A'}</span>
                              {selectedDonor.phone && <Copy className="h-3 w-3 text-zinc-200 group-hover:text-zinc-900 transition-colors" />}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 group cursor-pointer">
                          <div className="h-10 w-10 rounded-xl bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-100 transition-colors border border-transparent group-hover:border-zinc-200">
                            <MapPin className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-none mb-1.5">Location</span>
                            <span className="text-sm font-bold text-zinc-900">{selectedDonor.location || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-8">
                      <div className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-1 bg-zinc-900 rounded-full" />
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Ministry Connection</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(selectedDonor.tags || []).length > 0 ? (
                            selectedDonor.tags.map(tag => (
                              <Badge key={tag} className="bg-zinc-100 text-zinc-600 border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                                {tag}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs font-medium text-zinc-400 italic">No tags assigned</span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-zinc-400 tracking-tight leading-relaxed">
                          Partner since <span className="text-zinc-900 font-black">{format(new Date(selectedDonor.joined_date), 'MMMM yyyy')}</span>
                        </p>
                      </div>
                      
                      <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] text-zinc-900 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
                          <Sparkles className="h-24 w-24" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Partner Score</h4>
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-black tracking-tighter">{(selectedDonor.score / 10).toFixed(1)}</span>
                          <span className="text-[10px] font-bold text-emerald-600 mb-2 uppercase tracking-widest">+0.4</span>
                        </div>
                        <p className="mt-3 text-[10px] font-bold text-zinc-400 leading-relaxed uppercase tracking-wider">
                          Engagement rating based on support frequency and activity levels.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center p-12 border-4 border-dashed border-zinc-50 rounded-[3rem] bg-zinc-50/20">
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white shadow-xl border border-zinc-50 mb-8 scale-110">
              <User className="h-10 w-10 text-zinc-100" />
            </div>
            <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Select a Partner</h3>
            <p className="mt-3 text-sm font-medium text-zinc-400 max-w-[280px] leading-relaxed">Select a donor from the list to view their full profile, history, and engagement metrics.</p>
            {profile?.id && (
              <AddPartnerDialog 
                missionaryId={profile.id} 
                onSuccess={fetchDonors}
                trigger={
                  <Button className="mt-10 h-12 px-10 rounded-2xl bg-zinc-900 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-zinc-800 shadow-xl shadow-zinc-200/50">
                    Add New Partner
                  </Button>
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
