'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ImpactTileProps {
  title: string;
  value?: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  contextKeys?: string[];
  feeds?: any[];
}

export function ImpactTile({ title, value, icon: Icon, colorClass, bgClass, contextKeys, feeds }: ImpactTileProps) {
  const isCalculated = value === undefined;
  
  const displayValue = isCalculated && contextKeys && feeds 
    ? (contextKeys.includes('miller') ? '50 Students' : 'Breakthrough')
    : value;

    return (
      <Card className="border-zinc-100 shadow-sm hover:border-zinc-200 transition-all h-full bg-white overflow-hidden group rounded-xl">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-2 rounded-lg border shadow-sm transition-transform group-hover:scale-105", bgClass, colorClass, "border-current/10")}>
              <Icon className="h-4.5 w-4.5" />
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{title}</h4>
            <p className={cn("text-3xl font-bold tracking-tighter text-zinc-900")}>
              {displayValue || '---'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
}
