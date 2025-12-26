'use client'

import * as React from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { TrendingUp, TrendingDown } from 'lucide-react'

const chartConfig = {
  value: {
    label: 'Amount',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

interface MetricTileProps {
  title: string
  amount: string
  change?: string
  trend?: 'up' | 'down'
  data: { date: string; value: number }[]
  color?: string
}

function MetricTile({ title, amount, change, trend, data, color = 'var(--primary)' }: MetricTileProps) {
  return (
    <Card className="overflow-hidden border-zinc-200 shadow-sm bg-white hover:border-zinc-300 transition-all duration-300 group">
      <CardContent className="p-0 flex flex-row items-stretch h-[72px]">
        <div className="flex flex-col justify-between p-2.5 pr-0 flex-1 min-w-0">
          <div className="space-y-0">
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-0.5">{title}</p>
            <h3 className="text-lg md:text-xl font-black text-zinc-900 tracking-tighter leading-tight">{amount}</h3>
          </div>
          {change && (
            <div className="flex items-center gap-1">
              <Badge 
                variant="secondary" 
                className={cn(
                  "px-1 py-0 text-[8px] font-bold border-none",
                  trend === 'up' 
                    ? "bg-emerald-50 text-emerald-600" 
                    : "bg-amber-50 text-amber-600"
                )}
              >
                {trend === 'up' ? "+" : ""}{change}
              </Badge>
              <span className="text-[8px] text-zinc-400 font-bold uppercase tracking-tighter whitespace-nowrap">vs last month</span>
            </div>
          )}
        </div>
        <div className="w-[80px] md:w-[100px] h-full relative overflow-hidden">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="natural"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
                dot={false}
                isAnimationActive={true}
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

import { cn } from '@/lib/utils'

export function MetricTiles() {
  const thisMonthData = [
    { date: '1', value: 200 }, { date: '2', value: 450 }, { date: '3', value: 300 },
    { date: '4', value: 600 }, { date: '5', value: 550 }, { date: '6', value: 800 },
    { date: '7', value: 750 }, { date: '8', value: 900 }, { date: '9', value: 1100 }
  ]

  const lastMonthData = [
    { date: '1', value: 800 }, { date: '2', value: 700 }, { date: '3', value: 850 },
    { date: '4', value: 600 }, { date: '5', value: 500 }, { date: '6', value: 550 },
    { date: '7', value: 400 }, { date: '8', value: 450 }, { date: '9', value: 300 }
  ]

  const ytdData = [
    { date: '1', value: 2000 }, { date: '2', value: 4500 }, { date: '3', value: 7000 },
    { date: '4', value: 12000 }, { date: '5', value: 18000 }, { date: '6', value: 25000 },
    { date: '7', value: 32000 }, { date: '8', value: 42000 }, { date: '9', value: 54200 }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
      <MetricTile 
        title="This Month" 
        amount="$4,850" 
        change="+12.2%" 
        trend="up" 
        data={thisMonthData}
        color="oklch(0.627 0.265 303.891)" 
      />
      <MetricTile 
        title="Last Month" 
        amount="$4,320" 
        change="-4.5%" 
        trend="down" 
        data={lastMonthData}
        color="oklch(0.707 0.022 261.325)" 
      />
      <MetricTile 
        title="Year to Date" 
        amount="$54,200" 
        change="+24.8%" 
        trend="up" 
        data={ytdData}
        color="oklch(0.609 0.126 221.723)" 
      />
    </div>
  )
}
