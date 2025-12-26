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

const chartData = [
  { month: 'Nov 23', recurring: 3200, online: 800, offline: 400 },
  { month: 'Dec 23', recurring: 3300, online: 2500, offline: 1200 },
  { month: 'Jan 24', recurring: 3400, online: 600, offline: 300 },
  { month: 'Feb 24', recurring: 3450, online: 500, offline: 300 },
  { month: 'Mar 24', recurring: 3500, online: 900, offline: 400 },
  { month: 'Apr 24', recurring: 3550, online: 700, offline: 350 },
  { month: 'May 24', recurring: 3600, online: 800, offline: 500 },
  { month: 'Jun 24', recurring: 3650, online: 1200, offline: 400 },
  { month: 'Jul 24', recurring: 3700, online: 900, offline: 300 },
  { month: 'Aug 24', recurring: 3800, online: 1100, offline: 600 },
  { month: 'Sep 24', recurring: 3900, online: 1300, offline: 500 },
  { month: 'Oct 24', recurring: 4100, online: 1500, offline: 800 },
  { month: 'Nov 24', recurring: 4200, online: 1800, offline: 1200 },
]

const chartConfig = {
    recurring: {
      label: 'Recurring',
      color: 'oklch(0.32 0.05 255.65)',
    },
    online: {
      label: 'One-Time',
      color: 'oklch(0.60 0.05 255.65)',
    },
    offline: {
      label: 'Offline',
      color: 'oklch(0.90 0.05 255.65)',
    },
  } satisfies ChartConfig
  
    export function GivingBreakdownChart() {
        return (
          <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px] w-full">
              <BarChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 5,
                  left: 5,
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
                  tickFormatter={(value) => value.split(' ')[0]}
                  stroke="oklch(0.55 0.01 286.32)"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={9}
                  fontWeight={700}
                  tickFormatter={(value) => `$${value}`}
                  width={40}
                  tickMargin={8}
                  stroke="oklch(0.55 0.01 286.32)"
                />
                <ChartTooltip
                  cursor={{ fill: 'oklch(0.96 0.004 286.32)', opacity: 0.4 }}
                  content={
                    <ChartTooltipContent 
                      indicator="dot" 
                      className="bg-white/95 backdrop-blur-xl border-zinc-200 shadow-2xl rounded-xl p-2.5 min-w-[140px] text-[10px] font-bold"
                    />
                  }
                />
                <ChartLegend 
                  content={<ChartLegendContent />} 
                  className="pt-2 scale-75 md:scale-90"
                />
                  <Bar
                    dataKey="recurring"
                    stackId="a"
                    fill="var(--color-recurring)"
                    radius={[0, 0, 0, 0]}
                    maxBarSize={52}
                  />
                  <Bar
                    dataKey="online"
                    stackId="a"
                    fill="var(--color-online)"
                    radius={[0, 0, 0, 0]}
                    maxBarSize={52}
                  />
                  <Bar
                    dataKey="offline"
                    stackId="a"
                    fill="var(--color-offline)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={52}
                  />
              </BarChart>
          </ChartContainer>
        )
      }

