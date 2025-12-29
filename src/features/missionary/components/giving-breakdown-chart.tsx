'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { useDonationMetrics } from '@/hooks'

/**
 * Chart configuration for donation type categories
 * Colors use a cohesive palette based on zinc/slate tones
 */
const chartConfig = {
  recurring: {
    label: 'Recurring',
    color: 'oklch(0.45 0.10 250)',
  },
  oneTime: {
    label: 'One-Time',
    color: 'oklch(0.60 0.08 250)',
  },
  offline: {
    label: 'Offline',
    color: 'oklch(0.75 0.05 250)',
  },
} satisfies ChartConfig

const SKELETON_HEIGHTS = [45, 62, 38, 71, 55, 82, 48, 67, 41, 75, 58, 89, 52]

function GivingBreakdownSkeleton() {
  return (
    <div className="h-[200px] sm:h-[250px] md:h-[300px] w-full flex flex-col">
      <div className="flex-1 flex items-end justify-around gap-1 px-4 pb-6">
        {SKELETON_HEIGHTS.map((height, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <Skeleton 
              className="w-full rounded-t-sm" 
              style={{ height: `${height}%` }} 
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-4 pt-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

interface GivingBreakdownChartProps {
  missionaryId: string
}

/**
 * GivingBreakdownChart displays a stacked bar chart showing donation trends
 * over 13 months, broken down by donation type:
 * - Recurring: Monthly automated donations
 * - One-Time: Single online donations
 * - Offline: Checks, cash, and other offline gifts
 */
export function GivingBreakdownChart({ missionaryId }: GivingBreakdownChartProps) {
  const { monthlyBreakdown, isLoading, error } = useDonationMetrics(missionaryId)

  if (isLoading) {
    return <GivingBreakdownSkeleton />
  }

  if (error) {
    return (
      <div className="h-[200px] sm:h-[250px] md:h-[300px] w-full flex items-center justify-center text-sm text-zinc-400">
        Unable to load chart data
      </div>
    )
  }

  const hasData = monthlyBreakdown.some(m => m.total > 0)

  if (!hasData) {
    return (
      <div className="h-[200px] sm:h-[250px] md:h-[300px] w-full flex items-center justify-center text-sm text-zinc-400">
        No donation data available
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[200px] sm:h-[250px] md:h-[300px] w-full min-h-[180px]">
      <BarChart
        data={monthlyBreakdown}
        margin={{
          top: 5,
          right: 5,
          left: 0,
          bottom: 0,
        }}
        barGap={2}
      >
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="oklch(0.92 0.004 286.32)" opacity={0.3} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={5}
          axisLine={false}
          fontSize={9}
          fontWeight={700}
          stroke="oklch(0.55 0.01 286.32)"
          interval="preserveStartEnd"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={9}
          fontWeight={700}
          tickFormatter={(value) => value >= 1000 ? `$${(value/1000).toFixed(0)}k` : `$${value}`}
          width={35}
          tickMargin={4}
          stroke="oklch(0.55 0.01 286.32)"
        />
        <ChartTooltip
          cursor={{ fill: 'oklch(0.96 0.004 286.32)', opacity: 0.4 }}
          content={
            <ChartTooltipContent 
              indicator="dot" 
              className="bg-white/95 backdrop-blur-xl border-zinc-200 shadow-2xl rounded-xl p-2.5 min-w-[160px] text-[10px] font-bold"
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  recurring: 'Recurring',
                  oneTime: 'One-Time',
                  offline: 'Offline',
                }
                return (
                  <span className="flex items-center gap-2">
                    <span>{labels[name as string] || name}</span>
                    <span className="font-black">${Number(value).toLocaleString()}</span>
                  </span>
                )
              }}
            />
          }
        />
        <ChartLegend 
          content={<ChartLegendContent />} 
          className="pt-2 text-[10px] [&_.recharts-legend-item-text]:!text-zinc-600"
          wrapperStyle={{ fontSize: '10px' }}
        />
        <Bar
          dataKey="recurring"
          stackId="donations"
          fill="var(--color-recurring)"
          radius={[0, 0, 0, 0]}
          maxBarSize={48}
        />
        <Bar
          dataKey="oneTime"
          stackId="donations"
          fill="var(--color-oneTime)"
          radius={[0, 0, 0, 0]}
          maxBarSize={48}
        />
        <Bar
          dataKey="offline"
          stackId="donations"
          fill="var(--color-offline)"
          radius={[4, 4, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ChartContainer>
  )
}
