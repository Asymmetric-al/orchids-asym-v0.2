'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/page-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Calendar,
  Download,
  Sparkles,
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Area, 
  AreaChart 
} from 'recharts'

const monthlyData = [
  { month: 'Jul', total: 3200, recurring: 2800, oneTime: 400 },
  { month: 'Aug', total: 3450, recurring: 2900, oneTime: 550 },
  { month: 'Sep', total: 3100, recurring: 2850, oneTime: 250 },
  { month: 'Oct', total: 4200, recurring: 3000, oneTime: 1200 },
  { month: 'Nov', total: 3800, recurring: 3100, oneTime: 700 },
  { month: 'Dec', total: 4250, recurring: 3250, oneTime: 1000 },
]

const donorSegments = [
  { name: 'Active', value: 4, color: '#18181b' },
  { name: 'New', value: 2, color: '#71717a' },
  { name: 'At Risk', value: 1, color: '#eab308' },
  { name: 'Lapsed', value: 1, color: '#a1a1aa' },
]

const yearOverYear = [
  { month: 'Jan', current: 3500, previous: 3200 },
  { month: 'Feb', current: 3800, previous: 3100 },
  { month: 'Mar', current: 4100, previous: 3400 },
  { month: 'Apr', current: 3900, previous: 3600 },
  { month: 'May', current: 4200, previous: 3800 },
  { month: 'Jun', current: 4000, previous: 3500 },
  { month: 'Jul', current: 3200, previous: 3000 },
  { month: 'Aug', current: 3450, previous: 3200 },
  { month: 'Sep', current: 3100, previous: 2900 },
  { month: 'Oct', current: 4200, previous: 3700 },
  { month: 'Nov', current: 3800, previous: 3400 },
  { month: 'Dec', current: 4250, previous: 3600 },
]

function StatCard({ title, value, subtitle, trend, trendValue, icon: Icon }: {
  title: string
  value: string
  subtitle?: string
  trend?: 'up' | 'down'
  trendValue?: string
  icon: React.ElementType
}) {
  return (
    <Card className="border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-all rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{title}</p>
            <p className="text-xl font-bold tracking-tight text-zinc-900">{value}</p>
            {(subtitle || trendValue) && (
              <div className="flex items-center gap-1.5 mt-0.5">
                {trend && trendValue && (
                  <span className={`flex items-center text-[10px] font-bold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                    {trendValue}
                  </span>
                )}
                {subtitle && <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider leading-none">{subtitle}</span>}
              </div>
            )}
          </div>
          <div className="h-9 w-9 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
            <Icon className="h-4 w-4 text-zinc-900" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader 
        title="Analytics" 
        description="Detailed insights into your support network and trends."
      >
        <Button variant="outline" size="sm" className="h-9 px-4 text-xs font-medium">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button size="sm" className="h-9 px-4 text-xs font-medium">
          <Sparkles className="mr-2 h-4 w-4" />
          Insights
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Monthly Support" 
          value="$4,250" 
          subtitle="of $5,000 goal" 
          trend="up" 
          trendValue="12%" 
          icon={DollarSign} 
        />
        <StatCard 
          title="Active Partners" 
          value="42" 
          subtitle="+3 this month" 
          trend="up" 
          trendValue="8%" 
          icon={Users} 
        />
        <StatCard 
          title="Retention Rate" 
          value="94.2%" 
          subtitle="Past 12 months" 
          trend="up" 
          trendValue="2%" 
          icon={Target} 
        />
        <StatCard 
          title="Avg. Gift Size" 
          value="$101" 
          subtitle="Per partner" 
          trend="down" 
          trendValue="4%" 
          icon={Calendar} 
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-zinc-200 bg-white rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
            <div className="space-y-0.5">
              <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Giving Trends</CardTitle>
              <p className="text-lg font-bold text-zinc-900 tracking-tight">Support Overview</p>
            </div>
            <Select defaultValue="6m">
              <SelectTrigger className="w-[100px] h-8 rounded-lg text-[9px] font-bold uppercase tracking-wider border-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-zinc-100">
                <SelectItem value="6m">Last 6m</SelectItem>
                <SelectItem value="12m">Last 12m</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="h-[250px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} barGap={6}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#a1a1aa' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 9, fontWeight: 700, fill: '#a1a1aa' }}
                    tickFormatter={(value) => `$${value}`}
                    width={35}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f4f4f5', radius: 4 }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '9px', fontWeight: '700' }}
                  />
                  <Bar dataKey="recurring" fill="#18181b" radius={[3, 3, 0, 0]} name="Recurring" />
                  <Bar dataKey="oneTime" fill="#e4e4e7" radius={[3, 3, 0, 0]} name="One-time" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 bg-white flex flex-col rounded-xl">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Partner Segments</CardTitle>
            <p className="text-lg font-bold text-zinc-900 tracking-tight">Breakdown</p>
          </CardHeader>
          <CardContent className="p-6 pt-0 flex-1 flex flex-col">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donorSegments}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {donorSegments.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '9px', fontWeight: '700' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {donorSegments.map((segment) => (
                <div key={segment.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: segment.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 group-hover:text-zinc-900 transition-colors">{segment.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-zinc-900">{segment.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 bg-white rounded-xl overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-50 bg-zinc-50/20 py-4 px-6">
          <div className="space-y-0.5">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Yearly Performance</CardTitle>
            <p className="text-xl font-black text-zinc-900 tracking-tighter">YOY Comparison</p>
          </div>
          <Badge className="bg-emerald-50 text-emerald-700 border-0 font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider">
            +12.4% vs 2023
          </Badge>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearOverYear}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#18181b" stopOpacity={0.06}/>
                    <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#a1a1aa' }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 700, fill: '#a1a1aa' }}
                  tickFormatter={(value) => `$${value}`}
                  width={35}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', fontSize: '9px', fontWeight: '700' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="current" 
                  stroke="#18181b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorCurrent)" 
                  name="2024" 
                />
                <Area 
                  type="monotone" 
                  dataKey="previous" 
                  stroke="#e4e4e7" 
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fill="transparent" 
                  name="2023" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
