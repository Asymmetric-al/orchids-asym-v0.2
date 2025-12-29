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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
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
  ArrowDownUp,
  Calendar,
  History,
  Briefcase,
  Clock,
  AlertCircle,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  Tag,
  X,
  Check,
  CreditCard,
  Building2,
  Globe,
  DollarSign,
  TrendingUp,
  Users,
  Star,
  Home,
  Gift,
} from 'lucide-react'
import { format, formatDistanceToNow, differenceInMonths } from 'date-fns'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { AddPartnerDialog } from '@/features/missionary/components/add-partner-dialog'
import { toast } from 'sonner'

type ActivityType = 'gift' | 'note' | 'call' | 'email' | 'meeting' | 'pledge_started' | 'pledge_completed'
type GiftType = 'Online' | 'Check' | 'Cash' | 'Bank Transfer' | 'Stock' | 'In-Kind'
type PledgeStatus = 'active' | 'completed' | 'paused' | 'cancelled'

interface Activity {
  id: string
  type: ActivityType
  date: string
  title: string
  description?: string
  amount?: number
  status?: string
  giftType?: GiftType
  note?: string
}

interface Pledge {
  id: string
  amount: number
  frequency: 'Monthly' | 'Quarterly' | 'Annually'
  status: PledgeStatus
  startDate: string
  endDate?: string
  nextPaymentDate?: string
  totalPaid: number
  totalExpected: number
  paymentsCompleted: number
  paymentsRemaining: number
}

interface Address {
  street?: string
  street2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
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
  frequency: 'Monthly' | 'One-Time' | 'Annually' | 'Irregular' | 'Quarterly'
  email: string
  phone: string
  mobile?: string
  workPhone?: string
  preferredContact: 'email' | 'phone' | 'text'
  avatar_url?: string
  location: string
  address: Address
  workAddress?: Address
  website?: string
  organization?: string
  title?: string
  joined_date: string
  birthday?: string
  anniversary?: string
  spouse?: string
  notes?: string
  tags: string[]
  score: number
  activities: Activity[]
  pledges: Pledge[]
  hasActivePledge: boolean
}

const AVAILABLE_TAGS = [
  { id: 'major-donor', label: 'Major Donor', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'monthly-partner', label: 'Monthly Partner', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { id: 'prayer-partner', label: 'Prayer Partner', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { id: 'church-contact', label: 'Church Contact', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { id: 'family', label: 'Family', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'friend', label: 'Friend', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { id: 'first-time-giver', label: 'First-Time Giver', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'legacy-giver', label: 'Legacy Giver', color: 'bg-zinc-100 text-zinc-700 border-zinc-200' },
  { id: 'volunteer', label: 'Volunteer', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { id: 'board-member', label: 'Board Member', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'vip', label: 'VIP', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { id: 'needs-followup', label: 'Needs Follow-up', color: 'bg-red-50 text-red-700 border-red-200' },
]

const MOCK_DONORS: Donor[] = [
  {
    id: '1',
    name: 'Sarah & Michael Johnson',
    initials: 'SJ',
    type: 'Individual',
    status: 'Active',
    total_given: 24500,
    last_gift_date: '2024-12-15T10:30:00Z',
    last_gift_amount: 500,
    frequency: 'Monthly',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    mobile: '(555) 987-6543',
    preferredContact: 'email',
    location: 'Denver, CO',
    address: {
      street: '1234 Mountain View Dr',
      street2: 'Unit 5B',
      city: 'Denver',
      state: 'CO',
      zip: '80202',
      country: 'United States',
    },
    spouse: 'Michael Johnson',
    birthday: '1985-03-15',
    anniversary: '2010-06-20',
    joined_date: '2020-01-15',
    tags: ['monthly-partner', 'major-donor', 'prayer-partner'],
    score: 95,
    hasActivePledge: true,
    pledges: [
      {
        id: 'p1',
        amount: 500,
        frequency: 'Monthly',
        status: 'active',
        startDate: '2023-01-01',
        nextPaymentDate: '2025-01-15',
        totalPaid: 12000,
        totalExpected: 18000,
        paymentsCompleted: 24,
        paymentsRemaining: 12,
      },
    ],
    activities: [
      { id: 'a1', type: 'gift', date: '2024-12-15T10:30:00Z', title: 'Monthly Gift', amount: 500, status: 'Succeeded', giftType: 'Online' },
      { id: 'a2', type: 'call', date: '2024-12-10T14:00:00Z', title: 'Phone Call', description: 'Discussed upcoming mission trip. They expressed interest in joining the prayer team.' },
      { id: 'a3', type: 'gift', date: '2024-11-15T10:30:00Z', title: 'Monthly Gift', amount: 500, status: 'Succeeded', giftType: 'Online' },
      { id: 'a4', type: 'email', date: '2024-11-01T09:00:00Z', title: 'Thank You Email', description: 'Sent personalized thank you for their continued support.' },
      { id: 'a5', type: 'gift', date: '2024-10-15T10:30:00Z', title: 'Monthly Gift', amount: 500, status: 'Succeeded', giftType: 'Online' },
      { id: 'a6', type: 'meeting', date: '2024-09-20T18:00:00Z', title: 'Dinner Meeting', description: 'Met for dinner to share ministry updates. Great conversation about future goals.' },
      { id: 'a7', type: 'gift', date: '2024-09-15T10:30:00Z', title: 'Monthly Gift', amount: 500, status: 'Succeeded', giftType: 'Online' },
      { id: 'a8', type: 'gift', date: '2024-08-15T10:30:00Z', title: 'Monthly Gift', amount: 500, status: 'Succeeded', giftType: 'Online' },
    ],
  },
  {
    id: '2',
    name: 'First Baptist Church',
    initials: 'FB',
    type: 'Church',
    status: 'Active',
    total_given: 36000,
    last_gift_date: '2024-12-01T00:00:00Z',
    last_gift_amount: 1500,
    frequency: 'Monthly',
    email: 'missions@firstbaptist.org',
    phone: '(555) 234-5678',
    workPhone: '(555) 234-5679',
    preferredContact: 'email',
    website: 'www.firstbaptist.org',
    location: 'Austin, TX',
    address: {
      street: '500 Church Street',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      country: 'United States',
    },
    organization: 'First Baptist Church',
    title: 'Missions Committee',
    joined_date: '2019-06-01',
    tags: ['church-contact', 'monthly-partner', 'major-donor'],
    score: 98,
    hasActivePledge: true,
    pledges: [
      {
        id: 'p2',
        amount: 1500,
        frequency: 'Monthly',
        status: 'active',
        startDate: '2022-01-01',
        nextPaymentDate: '2025-01-01',
        totalPaid: 36000,
        totalExpected: 54000,
        paymentsCompleted: 24,
        paymentsRemaining: 12,
      },
    ],
    activities: [
      { id: 'b1', type: 'gift', date: '2024-12-01T00:00:00Z', title: 'Monthly Support', amount: 1500, status: 'Succeeded', giftType: 'Check' },
      { id: 'b2', type: 'meeting', date: '2024-11-15T19:00:00Z', title: 'Missions Committee Presentation', description: 'Presented ministry update to missions committee. Very positive response.' },
      { id: 'b3', type: 'gift', date: '2024-11-01T00:00:00Z', title: 'Monthly Support', amount: 1500, status: 'Succeeded', giftType: 'Check' },
      { id: 'b4', type: 'gift', date: '2024-10-01T00:00:00Z', title: 'Monthly Support', amount: 1500, status: 'Succeeded', giftType: 'Check' },
    ],
  },
  {
    id: '3',
    name: 'Robert Williams',
    initials: 'RW',
    type: 'Individual',
    status: 'At Risk',
    total_given: 8500,
    last_gift_date: '2024-08-20T00:00:00Z',
    last_gift_amount: 250,
    frequency: 'Irregular',
    email: 'robert.w@gmail.com',
    phone: '(555) 345-6789',
    preferredContact: 'phone',
    location: 'Phoenix, AZ',
    address: {
      street: '789 Desert Bloom Ave',
      city: 'Phoenix',
      state: 'AZ',
      zip: '85001',
      country: 'United States',
    },
    joined_date: '2021-03-10',
    birthday: '1972-11-08',
    tags: ['needs-followup', 'friend'],
    score: 45,
    hasActivePledge: false,
    pledges: [
      {
        id: 'p3',
        amount: 250,
        frequency: 'Monthly',
        status: 'paused',
        startDate: '2023-06-01',
        totalPaid: 3500,
        totalExpected: 6000,
        paymentsCompleted: 14,
        paymentsRemaining: 10,
      },
    ],
    activities: [
      { id: 'c1', type: 'gift', date: '2024-08-20T00:00:00Z', title: 'One-Time Gift', amount: 250, status: 'Succeeded', giftType: 'Online' },
      { id: 'c2', type: 'note', date: '2024-10-15T00:00:00Z', title: 'Follow-up Needed', description: 'Haven\'t heard from Robert in a while. Need to reach out and check in.' },
      { id: 'c3', type: 'call', date: '2024-07-10T00:00:00Z', title: 'Voicemail Left', description: 'Called but got voicemail. Left message about upcoming newsletter.' },
      { id: 'c4', type: 'gift', date: '2024-05-15T00:00:00Z', title: 'Monthly Gift', amount: 250, status: 'Succeeded', giftType: 'Online' },
    ],
  },
  {
    id: '4',
    name: 'Grace Community Foundation',
    initials: 'GC',
    type: 'Organization',
    status: 'Active',
    total_given: 50000,
    last_gift_date: '2024-06-30T00:00:00Z',
    last_gift_amount: 25000,
    frequency: 'Annually',
    email: 'grants@gracefoundation.org',
    phone: '(555) 456-7890',
    workPhone: '(555) 456-7891',
    preferredContact: 'email',
    website: 'www.gracefoundation.org',
    location: 'Chicago, IL',
    address: {
      street: '100 Foundation Plaza',
      street2: 'Suite 400',
      city: 'Chicago',
      state: 'IL',
      zip: '60601',
      country: 'United States',
    },
    organization: 'Grace Community Foundation',
    title: 'Grants Department',
    joined_date: '2022-01-01',
    tags: ['major-donor', 'legacy-giver'],
    score: 90,
    hasActivePledge: true,
    pledges: [
      {
        id: 'p4',
        amount: 25000,
        frequency: 'Annually',
        status: 'active',
        startDate: '2022-01-01',
        nextPaymentDate: '2025-06-30',
        totalPaid: 50000,
        totalExpected: 75000,
        paymentsCompleted: 2,
        paymentsRemaining: 1,
      },
    ],
    activities: [
      { id: 'd1', type: 'gift', date: '2024-06-30T00:00:00Z', title: 'Annual Grant', amount: 25000, status: 'Succeeded', giftType: 'Bank Transfer', note: 'Second year of 3-year grant commitment' },
      { id: 'd2', type: 'meeting', date: '2024-05-15T10:00:00Z', title: 'Grant Review Meeting', description: 'Annual review with program officer. Discussed impact metrics and future funding.' },
      { id: 'd3', type: 'email', date: '2024-04-01T00:00:00Z', title: 'Grant Report Submitted', description: 'Submitted annual progress report with photos and testimonials.' },
      { id: 'd4', type: 'gift', date: '2023-06-30T00:00:00Z', title: 'Annual Grant', amount: 25000, status: 'Succeeded', giftType: 'Bank Transfer', note: 'First year of 3-year grant commitment' },
    ],
  },
  {
    id: '5',
    name: 'Emily Chen',
    initials: 'EC',
    type: 'Individual',
    status: 'New',
    total_given: 150,
    last_gift_date: '2024-12-20T00:00:00Z',
    last_gift_amount: 150,
    frequency: 'One-Time',
    email: 'emily.chen@outlook.com',
    phone: '(555) 567-8901',
    mobile: '(555) 567-8902',
    preferredContact: 'text',
    location: 'Seattle, WA',
    address: {
      street: '456 Pine Street',
      street2: 'Apt 12',
      city: 'Seattle',
      state: 'WA',
      zip: '98101',
      country: 'United States',
    },
    joined_date: '2024-12-20',
    birthday: '1995-07-22',
    tags: ['first-time-giver'],
    score: 60,
    hasActivePledge: false,
    pledges: [],
    activities: [
      { id: 'e1', type: 'gift', date: '2024-12-20T00:00:00Z', title: 'First Gift', amount: 150, status: 'Succeeded', giftType: 'Online', note: 'Found us through social media' },
      { id: 'e2', type: 'email', date: '2024-12-21T00:00:00Z', title: 'Welcome Email Sent', description: 'Sent welcome package and thank you email.' },
    ],
  },
  {
    id: '6',
    name: 'David & Lisa Thompson',
    initials: 'DT',
    type: 'Individual',
    status: 'Lapsed',
    total_given: 12000,
    last_gift_date: '2023-12-15T00:00:00Z',
    last_gift_amount: 1000,
    frequency: 'Monthly',
    email: 'thompson.family@email.com',
    phone: '(555) 678-9012',
    preferredContact: 'email',
    location: 'Portland, OR',
    address: {
      street: '321 Oak Lane',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      country: 'United States',
    },
    spouse: 'Lisa Thompson',
    joined_date: '2018-09-01',
    birthday: '1968-02-14',
    anniversary: '1995-08-12',
    tags: ['family', 'prayer-partner'],
    score: 30,
    hasActivePledge: false,
    pledges: [
      {
        id: 'p6',
        amount: 200,
        frequency: 'Monthly',
        status: 'cancelled',
        startDate: '2020-01-01',
        endDate: '2023-12-31',
        totalPaid: 9600,
        totalExpected: 9600,
        paymentsCompleted: 48,
        paymentsRemaining: 0,
      },
    ],
    activities: [
      { id: 'f1', type: 'gift', date: '2023-12-15T00:00:00Z', title: 'Year-End Gift', amount: 1000, status: 'Succeeded', giftType: 'Check' },
      { id: 'f2', type: 'note', date: '2024-03-01T00:00:00Z', title: 'Status Update', description: 'David mentioned job transition. May need to pause giving temporarily.' },
      { id: 'f3', type: 'call', date: '2024-01-15T00:00:00Z', title: 'Check-in Call', description: 'Spoke briefly. They are dealing with some family health issues.' },
    ],
  },
  {
    id: '7',
    name: 'James Martinez',
    initials: 'JM',
    type: 'Individual',
    status: 'Active',
    total_given: 3600,
    last_gift_date: '2024-12-25T00:00:00Z',
    last_gift_amount: 100,
    frequency: 'Monthly',
    email: 'jmartinez@company.com',
    phone: '(555) 789-0123',
    workPhone: '(555) 789-0124',
    preferredContact: 'email',
    location: 'San Diego, CA',
    address: {
      street: '555 Harbor View Blvd',
      city: 'San Diego',
      state: 'CA',
      zip: '92101',
      country: 'United States',
    },
    workAddress: {
      street: '1000 Corporate Center Dr',
      street2: 'Floor 15',
      city: 'San Diego',
      state: 'CA',
      zip: '92121',
    },
    organization: 'Tech Solutions Inc.',
    title: 'Senior Engineer',
    joined_date: '2022-01-01',
    birthday: '1988-09-30',
    tags: ['monthly-partner', 'volunteer'],
    score: 80,
    hasActivePledge: true,
    pledges: [
      {
        id: 'p7',
        amount: 100,
        frequency: 'Monthly',
        status: 'active',
        startDate: '2022-01-01',
        nextPaymentDate: '2025-01-25',
        totalPaid: 3600,
        totalExpected: 4800,
        paymentsCompleted: 36,
        paymentsRemaining: 12,
      },
    ],
    activities: [
      { id: 'g1', type: 'gift', date: '2024-12-25T00:00:00Z', title: 'Monthly Gift', amount: 100, status: 'Succeeded', giftType: 'Online' },
      { id: 'g2', type: 'gift', date: '2024-11-25T00:00:00Z', title: 'Monthly Gift', amount: 100, status: 'Succeeded', giftType: 'Online' },
      { id: 'g3', type: 'gift', date: '2024-10-25T00:00:00Z', title: 'Monthly Gift', amount: 100, status: 'Succeeded', giftType: 'Online' },
      { id: 'g4', type: 'meeting', date: '2024-10-05T12:00:00Z', title: 'Lunch Meeting', description: 'Caught up over lunch. James shared about his church small group.' },
    ],
  },
  {
    id: '8',
    name: 'Bethel Church International',
    initials: 'BC',
    type: 'Church',
    status: 'Active',
    total_given: 18000,
    last_gift_date: '2024-10-01T00:00:00Z',
    last_gift_amount: 3000,
    frequency: 'Quarterly',
    email: 'outreach@bethelchurch.org',
    phone: '(555) 890-1234',
    preferredContact: 'email',
    website: 'www.bethelchurch.org',
    location: 'Nashville, TN',
    address: {
      street: '2000 Worship Way',
      city: 'Nashville',
      state: 'TN',
      zip: '37201',
      country: 'United States',
    },
    organization: 'Bethel Church International',
    title: 'Global Outreach',
    joined_date: '2021-04-01',
    tags: ['church-contact', 'vip'],
    score: 88,
    hasActivePledge: true,
    pledges: [
      {
        id: 'p8',
        amount: 3000,
        frequency: 'Quarterly',
        status: 'active',
        startDate: '2023-01-01',
        nextPaymentDate: '2025-01-01',
        totalPaid: 18000,
        totalExpected: 24000,
        paymentsCompleted: 6,
        paymentsRemaining: 2,
      },
    ],
    activities: [
      { id: 'h1', type: 'gift', date: '2024-10-01T00:00:00Z', title: 'Quarterly Support', amount: 3000, status: 'Succeeded', giftType: 'Bank Transfer' },
      { id: 'h2', type: 'gift', date: '2024-07-01T00:00:00Z', title: 'Quarterly Support', amount: 3000, status: 'Succeeded', giftType: 'Bank Transfer' },
      { id: 'h3', type: 'meeting', date: '2024-06-15T10:00:00Z', title: 'Video Call with Pastor', description: 'Discussed partnership renewal and potential for increased support.' },
    ],
  },
]

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

const getPledgeStatusBadge = (status: PledgeStatus) => {
  const styles: Record<PledgeStatus, string> = {
    active: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    completed: 'bg-blue-50 text-blue-700 border-blue-100',
    paused: 'bg-amber-50 text-amber-700 border-amber-100',
    cancelled: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  }
  return (
    <Badge variant="outline" className={cn('font-black border text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full', styles[status])}>
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
    case 'pledge_started': return <TrendingUp className="h-3.5 w-3.5 text-white" />
    case 'pledge_completed': return <Check className="h-3.5 w-3.5 text-white" />
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
    case 'pledge_started': return 'bg-indigo-500'
    case 'pledge_completed': return 'bg-teal-500'
    default: return 'bg-zinc-400'
  }
}

const getGiftTypeIcon = (type: GiftType) => {
  switch(type) {
    case 'Online': return <CreditCard className="h-3.5 w-3.5" />
    case 'Check': return <Mail className="h-3.5 w-3.5" />
    case 'Cash': return <DollarSign className="h-3.5 w-3.5" />
    case 'Bank Transfer': return <Building2 className="h-3.5 w-3.5" />
    case 'Stock': return <TrendingUp className="h-3.5 w-3.5" />
    case 'In-Kind': return <Gift className="h-3.5 w-3.5" />
    default: return <DollarSign className="h-3.5 w-3.5" />
  }
}

const getTagStyle = (tagId: string) => {
  const tag = AVAILABLE_TAGS.find(t => t.id === tagId)
  return tag?.color || 'bg-zinc-100 text-zinc-600 border-zinc-200'
}

const getTagLabel = (tagId: string) => {
  const tag = AVAILABLE_TAGS.find(t => t.id === tagId)
  return tag?.label || tagId
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

type SortOption = 'name' | 'last_gift' | 'total_given' | 'joined_date'

export default function DonorsPage() {
  const { profile } = useAuth()
  const [donors, setDonors] = React.useState<Donor[]>(MOCK_DONORS)
  const [selectedDonorId, setSelectedDonorId] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('All')
  const [tagFilter, setTagFilter] = React.useState<string[]>([])
  const [pledgeFilter, setPledgeFilter] = React.useState<string>('All')
  const [sortBy, setSortBy] = React.useState<SortOption>('last_gift')
  const [sortAsc, setSortAsc] = React.useState(false)
  const [loading] = React.useState(false)
  const [error] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState('overview')
  const [noteInput, setNoteInput] = React.useState('')
  const [isNoteDialogOpen, setIsNoteDialogOpen] = React.useState(false)
  const [isTagDialogOpen, setIsTagDialogOpen] = React.useState(false)
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])

  const fetchDonors = React.useCallback(() => {
    setDonors(MOCK_DONORS)
  }, [])

  const filteredDonors = React.useMemo(() => {
    let result = donors.filter(donor => {
      const matchesSearch = (donor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (donor.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (donor.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (donor.organization || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'All' || donor.status === statusFilter
      const matchesTags = tagFilter.length === 0 || tagFilter.some(t => donor.tags.includes(t))
      const matchesPledge = pledgeFilter === 'All' || 
                            (pledgeFilter === 'Active' && donor.hasActivePledge) ||
                            (pledgeFilter === 'Inactive' && !donor.hasActivePledge)
      return matchesSearch && matchesStatus && matchesTags && matchesPledge
    })

    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '')
          break
        case 'last_gift':
          const dateA = a.last_gift_date ? new Date(a.last_gift_date).getTime() : 0
          const dateB = b.last_gift_date ? new Date(b.last_gift_date).getTime() : 0
          comparison = dateB - dateA
          break
        case 'total_given':
          comparison = (b.total_given || 0) - (a.total_given || 0)
          break
        case 'joined_date':
          const joinA = a.joined_date ? new Date(a.joined_date).getTime() : 0
          const joinB = b.joined_date ? new Date(b.joined_date).getTime() : 0
          comparison = joinB - joinA
          break
      }
      return sortAsc ? -comparison : comparison
    })

    return result
  }, [donors, searchTerm, statusFilter, tagFilter, pledgeFilter, sortBy, sortAsc])

  const selectedDonor = React.useMemo(() => 
    donors.find(d => d.id === selectedDonorId) || null
  , [donors, selectedDonorId])

  React.useEffect(() => {
    if (selectedDonor) {
      setSelectedTags(selectedDonor.tags)
    }
  }, [selectedDonor])

  const copyToClipboard = React.useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }, [])

  const handleAddNote = React.useCallback(() => {
    if (!selectedDonor || !noteInput.trim()) return
    toast.success('Note added successfully')
    setNoteInput('')
    setIsNoteDialogOpen(false)
  }, [selectedDonor, noteInput])

  const handleSaveTags = React.useCallback(() => {
    if (!selectedDonor) return
    setDonors(prev => prev.map(d => 
      d.id === selectedDonor.id ? { ...d, tags: selectedTags } : d
    ))
    toast.success('Tags updated successfully')
    setIsTagDialogOpen(false)
  }, [selectedDonor, selectedTags])

  const toggleTag = React.useCallback((tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }, [])

  const activeCount = donors.filter(d => d.status === 'Active').length
  const atRiskCount = donors.filter(d => d.status === 'At Risk').length
  const activePledgeCount = donors.filter(d => d.hasActivePledge).length
  const monthlyPledgeTotal = donors.reduce((sum, d) => {
    const activePledge = d.pledges.find(p => p.status === 'active')
    if (!activePledge) return sum
    const monthly = activePledge.frequency === 'Monthly' ? activePledge.amount :
                    activePledge.frequency === 'Quarterly' ? activePledge.amount / 3 :
                    activePledge.amount / 12
    return sum + monthly
  }, 0)

  const formatAddress = (address: Address) => {
    const parts = []
    if (address.street) parts.push(address.street)
    if (address.street2) parts.push(address.street2)
    const cityLine = [address.city, address.state, address.zip].filter(Boolean).join(', ')
    if (cityLine) parts.push(cityLine)
    if (address.country && address.country !== 'United States') parts.push(address.country)
    return parts
  }

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
                <Users className="h-4 w-4 text-zinc-900" />
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
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Active Pledges</p>
                <p className="text-xl font-bold tracking-tight text-zinc-900">{activePledgeCount}</p>
                <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">{formatCurrency(monthlyPledgeTotal)}/mo</span>
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
                        <ArrowDownUp className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl border-zinc-100 shadow-xl">
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Sort By</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      {[
                        { value: 'last_gift', label: 'Last Gift Date' },
                        { value: 'total_given', label: 'Total Given' },
                        { value: 'name', label: 'Name' },
                        { value: 'joined_date', label: 'Partner Since' },
                      ].map(opt => (
                        <DropdownMenuCheckboxItem
                          key={opt.value}
                          checked={sortBy === opt.value}
                          onCheckedChange={() => setSortBy(opt.value as SortOption)}
                          className="text-xs font-medium"
                        >
                          {opt.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      <DropdownMenuCheckboxItem
                        checked={sortAsc}
                        onCheckedChange={() => setSortAsc(!sortAsc)}
                        className="text-xs font-medium"
                      >
                        Ascending
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn('h-8 w-8 rounded-lg', (statusFilter !== 'All' || tagFilter.length > 0 || pledgeFilter !== 'All') ? 'text-blue-600 bg-blue-50' : 'text-zinc-400 hover:text-zinc-900')}>
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl border-zinc-100 shadow-xl">
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Filter by Status</DropdownMenuLabel>
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
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Filter by Pledge</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      {['All', 'Active', 'Inactive'].map(p => (
                        <DropdownMenuCheckboxItem
                          key={p}
                          checked={pledgeFilter === p}
                          onCheckedChange={() => setPledgeFilter(p)}
                          className="text-xs font-medium"
                        >
                          {p === 'Active' ? 'Has Active Pledge' : p === 'Inactive' ? 'No Active Pledge' : 'All'}
                        </DropdownMenuCheckboxItem>
                      ))}
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Filter by Tag</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-zinc-100" />
                      {AVAILABLE_TAGS.slice(0, 6).map(tag => (
                        <DropdownMenuCheckboxItem
                          key={tag.id}
                          checked={tagFilter.includes(tag.id)}
                          onCheckedChange={() => setTagFilter(prev => 
                            prev.includes(tag.id) ? prev.filter(t => t !== tag.id) : [...prev, tag.id]
                          )}
                          className="text-xs font-medium"
                        >
                          {tag.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                      {(statusFilter !== 'All' || tagFilter.length > 0 || pledgeFilter !== 'All') && (
                        <>
                          <DropdownMenuSeparator className="bg-zinc-100" />
                          <DropdownMenuItem 
                            onClick={() => { setStatusFilter('All'); setTagFilter([]); setPledgeFilter('All') }}
                            className="text-xs font-medium text-rose-600"
                          >
                            Clear All Filters
                          </DropdownMenuItem>
                        </>
                      )}
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
              {(tagFilter.length > 0 || statusFilter !== 'All' || pledgeFilter !== 'All') && (
                <div className="flex flex-wrap gap-1.5">
                  {statusFilter !== 'All' && (
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border-zinc-200">
                      {statusFilter}
                      <button onClick={() => setStatusFilter('All')} className="ml-1 hover:text-zinc-900">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  )}
                  {pledgeFilter !== 'All' && (
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border-blue-200">
                      {pledgeFilter === 'Active' ? 'Has Pledge' : 'No Pledge'}
                      <button onClick={() => setPledgeFilter('All')} className="ml-1 hover:text-blue-900">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  )}
                  {tagFilter.map(tag => (
                    <Badge key={tag} variant="outline" className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border', getTagStyle(tag))}>
                      {getTagLabel(tag)}
                      <button onClick={() => setTagFilter(prev => prev.filter(t => t !== tag))} className="ml-1">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <ScrollArea className="h-[calc(100vh-30rem)]">
              {error ? (
                <ErrorState message={error} onRetry={fetchDonors} />
              ) : loading ? (
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
                          {donor.hasActivePledge && (
                            <div className={cn('h-2 w-2 rounded-full shrink-0 ml-1', selectedDonorId === donor.id ? 'bg-emerald-400' : 'bg-emerald-500')} title="Active pledge" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={cn('text-[10px] truncate max-w-[100px] font-medium uppercase tracking-wider', selectedDonorId === donor.id ? 'text-zinc-400' : 'text-zinc-400')}>
                            {donor.location || 'Unknown'}
                          </span>
                          <span className={cn('text-xs font-black', selectedDonorId === donor.id ? 'text-zinc-300' : 'text-zinc-900')}>
                            {formatCurrency(donor.total_given)}
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
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {selectedDonor.location || 'Unknown'}
                        </span>
                        <span className="flex items-center gap-1 capitalize">
                          {selectedDonor.type === 'Church' ? <Building2 className="h-3 w-3" /> : selectedDonor.type === 'Organization' ? <Briefcase className="h-3 w-3" /> : <User className="h-3 w-3" />}
                          {selectedDonor.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 px-4 text-xs font-medium rounded-xl border-zinc-200 hover:bg-zinc-50" onClick={() => setIsNoteDialogOpen(true)}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" /> Note
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 px-4 text-xs font-medium rounded-xl border-zinc-200 hover:bg-zinc-50" asChild>
                      <a href={`tel:${selectedDonor.phone}`}>
                        <Phone className="h-3.5 w-3.5 mr-1.5" /> Call
                      </a>
                    </Button>
                    <Button size="sm" className="flex-1 sm:flex-none h-9 px-4 text-xs font-medium rounded-xl" asChild>
                      <a href={`mailto:${selectedDonor.email}`}>
                        <Mail className="h-3.5 w-3.5 mr-1.5" /> Email
                      </a>
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
                        <DropdownMenuItem onClick={() => setIsTagDialogOpen(true)} className="text-xs font-medium">
                          <Tag className="h-3.5 w-3.5 mr-2" /> Manage Tags
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs font-medium">
                          <Pencil className="h-3.5 w-3.5 mr-2" /> Edit Profile
                        </DropdownMenuItem>
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
                      {selectedDonor.last_gift_date && differenceInMonths(new Date(), new Date(selectedDonor.last_gift_date)) < 1 && (
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    {selectedDonor.last_gift_date && (
                      <p className="text-[10px] text-zinc-400 mt-0.5">{formatDistanceToNow(new Date(selectedDonor.last_gift_date), { addSuffix: true })}</p>
                    )}
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

                <div className="flex flex-wrap items-center gap-1.5 mt-4">
                  {selectedDonor.tags.map(tag => (
                    <Badge key={tag} variant="outline" className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border', getTagStyle(tag))}>
                      {getTagLabel(tag)}
                    </Badge>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900"
                    onClick={() => setIsTagDialogOpen(true)}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Tag
                  </Button>
                </div>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 py-4 border-b border-zinc-100">
                  <TabsList className="bg-zinc-100/50 border border-zinc-100 p-1.5 h-auto rounded-2xl w-full sm:w-auto grid grid-cols-4 sm:flex">
                    <TabsTrigger 
                      value="overview" 
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 data-[state=active]:text-zinc-900 transition-all"
                    >
                      Overview
                    </TabsTrigger>
                    <TabsTrigger 
                      value="contact" 
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 data-[state=active]:text-zinc-900 transition-all"
                    >
                      Contact
                    </TabsTrigger>
                    <TabsTrigger 
                      value="pledges" 
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 data-[state=active]:text-zinc-900 transition-all"
                    >
                      Pledges
                    </TabsTrigger>
                    <TabsTrigger 
                      value="giving" 
                      className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 data-[state=active]:text-zinc-900 transition-all"
                    >
                      Giving
                    </TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="h-[calc(100vh-42rem)]">
                  <div className="p-6">
                    <TabsContent value="overview" className="mt-0 space-y-6">
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        <Textarea
                          placeholder="Log a call, meeting notes, or observation..."
                          className="min-h-[80px] border-none bg-white focus:ring-0 resize-none text-sm p-3 rounded-xl shadow-sm"
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
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
                          <Button size="sm" className="h-8 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest" onClick={handleAddNote} disabled={!noteInput.trim()}>
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
                                      {activity.giftType && (
                                        <span className="flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                                          {getGiftTypeIcon(activity.giftType)}
                                          {activity.giftType}
                                        </span>
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
                                    {activity.note && (
                                      <p className="text-xs text-zinc-400 italic">{activity.note}</p>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 whitespace-nowrap">
                                    {format(new Date(activity.date), 'MMM d, yyyy')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    <TabsContent value="contact" className="mt-0 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Contact Information</h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-zinc-200 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                  <Mail className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email</p>
                                    {selectedDonor.preferredContact === 'email' && (
                                      <Badge className="bg-blue-50 text-blue-600 border-0 text-[8px] font-black uppercase tracking-widest px-1.5 py-0">Preferred</Badge>
                                    )}
                                  </div>
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
                                  <div className="flex items-center gap-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Phone</p>
                                    {selectedDonor.preferredContact === 'phone' && (
                                      <Badge className="bg-emerald-50 text-emerald-600 border-0 text-[8px] font-black uppercase tracking-widest px-1.5 py-0">Preferred</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium text-zinc-900">{selectedDonor.phone || 'N/A'}</p>
                                </div>
                              </div>
                              {selectedDonor.phone && (
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl" onClick={() => copyToClipboard(selectedDonor.phone, 'Phone')}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            {selectedDonor.mobile && (
                              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-zinc-200 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                    <MessageSquare className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Mobile</p>
                                      {selectedDonor.preferredContact === 'text' && (
                                        <Badge className="bg-purple-50 text-purple-600 border-0 text-[8px] font-black uppercase tracking-widest px-1.5 py-0">Preferred</Badge>
                                      )}
                                    </div>
                                    <p className="text-sm font-medium text-zinc-900">{selectedDonor.mobile}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl" onClick={() => copyToClipboard(selectedDonor.mobile!, 'Mobile')}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {selectedDonor.workPhone && (
                              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-zinc-200 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-600 flex items-center justify-center">
                                    <Briefcase className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Work Phone</p>
                                    <p className="text-sm font-medium text-zinc-900">{selectedDonor.workPhone}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl" onClick={() => copyToClipboard(selectedDonor.workPhone!, 'Work Phone')}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {selectedDonor.website && (
                              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-zinc-200 transition-all">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <Globe className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Website</p>
                                    <p className="text-sm font-medium text-zinc-900 truncate">{selectedDonor.website}</p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl" asChild>
                                  <a href={`https://${selectedDonor.website}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Address</h3>
                          <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
                                  <Home className="h-4 w-4" />
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Home Address</p>
                                  {selectedDonor.address?.street ? (
                                    formatAddress(selectedDonor.address).map((line, i) => (
                                      <p key={i} className={cn('text-sm', i === 0 ? 'font-medium text-zinc-900' : 'text-zinc-500')}>{line}</p>
                                    ))
                                  ) : (
                                    <p className="text-sm text-zinc-500">No address on file</p>
                                  )}
                                </div>
                              </div>
                              {selectedDonor.address?.street && (
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl" asChild>
                                  <a href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress(selectedDonor.address).join(', '))}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>

                          {selectedDonor.workAddress?.street && (
                            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
                                    <Building2 className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Work Address</p>
                                    {formatAddress(selectedDonor.workAddress).map((line, i) => (
                                      <p key={i} className={cn('text-sm', i === 0 ? 'font-medium text-zinc-900' : 'text-zinc-500')}>{line}</p>
                                    ))}
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl" asChild>
                                  <a href={`https://maps.google.com/?q=${encodeURIComponent(formatAddress(selectedDonor.workAddress).join(', '))}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            </div>
                          )}

                          {(selectedDonor.organization || selectedDonor.title) && (
                            <>
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-6">Organization</h3>
                              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                <div className="flex items-start gap-3">
                                  <div className="h-10 w-10 rounded-xl bg-zinc-100 text-zinc-500 flex items-center justify-center shrink-0">
                                    <Briefcase className="h-4 w-4" />
                                  </div>
                                  <div>
                                    {selectedDonor.organization && (
                                      <p className="text-sm font-medium text-zinc-900">{selectedDonor.organization}</p>
                                    )}
                                    {selectedDonor.title && (
                                      <p className="text-sm text-zinc-500">{selectedDonor.title}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {(selectedDonor.spouse || selectedDonor.birthday || selectedDonor.anniversary) && (
                            <>
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-6">Personal Details</h3>
                              <div className="space-y-3">
                                {selectedDonor.spouse && (
                                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                        <Heart className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Spouse</p>
                                        <p className="text-sm font-medium text-zinc-900">{selectedDonor.spouse}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {selectedDonor.birthday && (
                                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                        <Star className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Birthday</p>
                                        <p className="text-sm font-medium text-zinc-900">{format(new Date(selectedDonor.birthday), 'MMMM d, yyyy')}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {selectedDonor.anniversary && (
                                  <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                                    <div className="flex items-center gap-3">
                                      <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                                        <Calendar className="h-4 w-4" />
                                      </div>
                                      <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Anniversary</p>
                                        <p className="text-sm font-medium text-zinc-900">{format(new Date(selectedDonor.anniversary), 'MMMM d, yyyy')}</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="pledges" className="mt-0 space-y-6">
                      {selectedDonor.pledges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                            <TrendingUp className="h-7 w-7 text-zinc-300" />
                          </div>
                          <p className="text-sm font-bold text-zinc-900">No pledges recorded</p>
                          <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">When this partner makes a pledge commitment, it will appear here.</p>
                          <Button className="mt-6 h-10 px-6 rounded-xl" size="sm">
                            <Plus className="h-4 w-4 mr-2" /> Record Pledge
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selectedDonor.pledges.map((pledge) => (
                            <div key={pledge.id} className={cn(
                              'p-5 rounded-2xl border transition-all',
                              pledge.status === 'active' 
                                ? 'bg-emerald-50/50 border-emerald-200' 
                                : 'bg-zinc-50 border-zinc-200'
                            )}>
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-lg font-bold text-zinc-900">{formatCurrency(pledge.amount)}/{pledge.frequency.toLowerCase()}</h4>
                                    {getPledgeStatusBadge(pledge.status)}
                                  </div>
                                  <p className="text-xs text-zinc-500">
                                    Started {format(new Date(pledge.startDate), 'MMMM d, yyyy')}
                                    {pledge.endDate && ` • Ends ${format(new Date(pledge.endDate), 'MMMM d, yyyy')}`}
                                  </p>
                                </div>
                                {pledge.status === 'active' && pledge.nextPaymentDate && (
                                  <div className="text-right">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Next Payment</p>
                                    <p className="text-sm font-bold text-zinc-900">{format(new Date(pledge.nextPaymentDate), 'MMM d, yyyy')}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Total Paid</p>
                                  <p className="text-sm font-bold text-zinc-900">{formatCurrency(pledge.totalPaid)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Expected</p>
                                  <p className="text-sm font-bold text-zinc-900">{formatCurrency(pledge.totalExpected)}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Completed</p>
                                  <p className="text-sm font-bold text-zinc-900">{pledge.paymentsCompleted} payments</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Remaining</p>
                                  <p className="text-sm font-bold text-zinc-900">{pledge.paymentsRemaining} payments</p>
                                </div>
                              </div>

                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Progress</span>
                                  <span className="text-xs font-bold text-zinc-600">{Math.round((pledge.totalPaid / pledge.totalExpected) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                                  <div 
                                    className={cn(
                                      'h-full rounded-full transition-all',
                                      pledge.status === 'active' ? 'bg-emerald-500' : 
                                      pledge.status === 'completed' ? 'bg-blue-500' : 'bg-zinc-400'
                                    )}
                                    style={{ width: `${Math.min((pledge.totalPaid / pledge.totalExpected) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="giving" className="mt-0">
                      <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                        <table className="w-full text-sm text-left">
                          <thead className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 border-b border-zinc-200">
                            <tr>
                              <th className="px-6 py-4">Date</th>
                              <th className="px-6 py-4">Type</th>
                              <th className="px-6 py-4">Method</th>
                              <th className="px-6 py-4">Amount</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4">Note</th>
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
                                    {gift.title}
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="flex items-center gap-1.5 text-zinc-500">
                                      {gift.giftType && getGiftTypeIcon(gift.giftType)}
                                      {gift.giftType || 'Unknown'}
                                    </span>
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
                                  <td className="px-6 py-4 text-zinc-400 text-xs max-w-[200px] truncate">
                                    {gift.note || '—'}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6}>
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
                <p className="mt-2 text-sm font-medium text-zinc-400 max-w-[280px] mx-auto">Choose a donor from the list to view their profile, pledges, and giving history.</p>
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

      <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold tracking-tight">Manage Tags</DialogTitle>
            <DialogDescription className="text-sm text-zinc-500">Select tags for {selectedDonor?.name}. Tags help you organize and filter your partners.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-bold border transition-all',
                    selectedTags.includes(tag.id)
                      ? cn(tag.color, 'ring-2 ring-offset-1 ring-zinc-400')
                      : 'bg-zinc-50 text-zinc-400 border-zinc-200 hover:bg-zinc-100'
                  )}
                >
                  {selectedTags.includes(tag.id) && <Check className="h-3 w-3 inline mr-1" />}
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)} className="h-10 px-6 rounded-xl border-zinc-200">Cancel</Button>
            <Button onClick={handleSaveTags} className="h-10 px-6 rounded-xl">Save Tags</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
