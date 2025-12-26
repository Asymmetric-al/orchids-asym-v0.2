'use client';

import React from 'react';
import { useCarePersonnel } from '@/features/mission-control/care/hooks/use-care';
import { PersonnelList } from '@/features/mission-control/care/components/PersonnelList';
import { Button } from '@/components/ui/button';
import { Plus, Download, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CareDirectoryPage() {
  const { data: personnel, isLoading } = useCarePersonnel();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 border-b border-zinc-100 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Care Protocol</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-zinc-900 lg:text-6xl uppercase">Personnel Directory</h1>
          <p className="text-zinc-400 mt-3 text-sm font-bold uppercase tracking-widest leading-relaxed">Manage and monitor all global team members.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" size="sm" className="h-14 px-8 font-black border-zinc-200 text-zinc-500 uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-zinc-50 hover:text-zinc-900 transition-all">
            <Download className="mr-3 h-4 w-4 text-zinc-400" /> Export
          </Button>
          <Button className="h-14 px-10 font-black bg-zinc-900 text-white hover:bg-zinc-800 shadow-2xl shadow-zinc-200 uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all">
            <Plus className="mr-3 h-4 w-4" /> Add Personnel
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border-zinc-100 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="border-b border-zinc-50 p-10 bg-zinc-50/20">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">All Personnel</CardTitle>
              <p className="text-2xl font-black text-zinc-900 tracking-tight mt-1">Global Workforce Matrix</p>
            </div>
            <Button variant="outline" size="sm" className="h-11 px-6 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-zinc-100 rounded-xl hover:bg-white hover:text-zinc-900 transition-all">
              <Filter className="mr-3 h-4 w-4" /> Advanced Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6">
            <PersonnelList data={personnel || []} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
