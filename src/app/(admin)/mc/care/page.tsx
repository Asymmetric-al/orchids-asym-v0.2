'use client';

import React from 'react';
import { useCarePersonnel, useCareActivity } from '@/features/mission-control/care/hooks/use-care';
import { CareDashboard } from '@/features/mission-control/care/components/CareDashboard';
import { CareTools } from '@/features/mission-control/care/components/CareTools';
import { PageHeader } from '@/features/mission-control/components/patterns/page-header';
import { Button } from '@/components/ui/button';
import { Heart, BookOpen, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MemberCareDashboardPage() {
  const { data: personnel, isLoading: loadingPersonnel } = useCarePersonnel();
  const { data: activities, isLoading: loadingActivities } = useCareActivity();

  if (loadingPersonnel || loadingActivities) {
    return (
      <div className="p-6 space-y-8 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-7">
          <Skeleton className="md:col-span-4 h-[600px] w-full rounded-xl" />
          <Skeleton className="md:col-span-3 h-[600px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pb-20 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Member Care</h2>
          <p className="text-slate-500 mt-1 font-medium">Holistic support and health monitoring for your global team.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9 px-4 font-bold border-slate-200">
            <BookOpen className="mr-2 h-4 w-4 text-slate-400" /> Resources
          </Button>
          <Button className="h-9 px-4 font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200">
            <Heart className="mr-2 h-4 w-4" /> Log Check-in
          </Button>
        </div>
      </div>

      <CareDashboard 
        personnel={personnel || []} 
        activities={activities || []} 
      />

      <CareTools personnel={personnel || []} />
    </div>
  );
}
