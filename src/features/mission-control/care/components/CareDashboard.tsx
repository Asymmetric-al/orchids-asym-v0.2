'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, Users, ClipboardList, AlertTriangle, 
  ArrowUpRight, Clock, MapPin, Search
} from 'lucide-react';
import { CarePersonnel, ActivityLogEntry } from '../types';
import { PersonnelList } from './PersonnelList';
import { cn } from '@/lib/utils';

interface CareDashboardProps {
  personnel: CarePersonnel[];
  activities: ActivityLogEntry[];
}

export function CareDashboard({ personnel, activities }: CareDashboardProps) {
  const stats = [
    { label: 'Total Personnel', value: personnel.length, icon: Users, color: 'text-blue-600', sub: 'active missionaries' },
    { label: 'Open Care Plans', value: 12, icon: ClipboardList, color: 'text-amber-500', sub: 'active interventions' },
    { label: 'Check-ins (30d)', value: 89, icon: Heart, color: 'text-emerald-600', sub: 'on schedule' },
    { label: 'At-Risk Alerts', value: personnel.filter(p => p.status === 'At Risk' || p.status === 'Crisis').length, icon: AlertTriangle, color: 'text-rose-600', sub: 'require attention' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">{stat.label}</CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Personnel List (Main) */}
        <Card className="md:col-span-4 shadow-sm border-slate-200">
          <CardHeader className="border-b border-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Health Status Feed</CardTitle>
                <CardDescription className="text-xs">Recent activity and wellness updates across the team.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <PersonnelList data={personnel} />
          </CardContent>
        </Card>

        {/* Priority Alerts & Gaps */}
        <div className="md:col-span-3 space-y-6">
          <Card className="shadow-sm border-slate-200 bg-rose-50/10">
            <CardHeader className="border-b border-rose-100/50">
              <CardTitle className="text-base font-bold text-rose-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Urgent Alerts
              </CardTitle>
              <CardDescription className="text-xs text-rose-600">Personnel requiring immediate attention.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { type: 'Gap in Updates', count: 2, desc: 'No check-in for 45+ days' },
                { type: 'Financial Gap', count: 1, desc: 'Support below 70% for 3 months' },
              ].map((alert) => (
                  <div key={alert.type} className="p-3 rounded-xl border border-rose-100 bg-white shadow-sm flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{alert.type}</span>
                      <Badge className="h-4 px-1 bg-rose-600 text-white border-none text-[10px] font-bold">{alert.count}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{alert.desc}</p>
                  </div>
                </div>
              ))}
              <Button className="w-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white h-10 mt-2 shadow-lg shadow-rose-200">
                Review Care Alerts
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-400 text-left">Upcoming Check-ins</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {personnel.slice(0, 3).map(p => (
                  <div key={p.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">{p.initials}</div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{p.name}</p>
                        <p className="text-[10px] text-slate-500">Scheduled for Tomorrow</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
