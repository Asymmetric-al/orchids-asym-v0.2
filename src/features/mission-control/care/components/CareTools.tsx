'use client';

import React, { useCallback, useEffectEvent } from 'react';
import { 
  CommandDialog, CommandEmpty, CommandGroup, 
  CommandInput, CommandItem, CommandList 
} from '@/components/ui/command';
import { 
  Search, User, Heart, 
  Settings, Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CarePersonnel } from '../types';
import { Button } from '@/components/ui/button';

interface CareToolsProps {
  personnel: CarePersonnel[];
}

export function CareTools({ personnel }: CareToolsProps) {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const onKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen((open) => !open);
    }
  });

  React.useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const navigate = useCallback((path: string) => {
    setOpen(false);
    router.push(path);
  }, [router]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setOpen(true)}
          className="h-12 w-12 rounded-full bg-slate-900 text-white shadow-2xl hover:bg-slate-800 border-none group"
        >
          <Zap className="h-5 w-5 transition-transform group-hover:scale-110" />
        </Button>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search personnel, actions, or care threads..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Personnel">
            {personnel.map((p) => (
              <CommandItem 
                key={p.id} 
                onSelect={() => navigate(`/mc/care/directory/${p.id}`)}
                className="flex items-center gap-2"
              >
                <User className="mr-2 h-4 w-4" />
                <span>{p.name}</span>
                <span className="ml-auto text-[10px] text-slate-400 font-bold uppercase">{p.region}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => navigate('/mc/care/directory')}>
              <Search className="mr-2 h-4 w-4" />
              <span>Browse Directory</span>
            </CommandItem>
            <CommandItem onSelect={() => {}}>
              <Heart className="mr-2 h-4 w-4" />
              <span>Log Quick Check-in</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate('/mc/care/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Care Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
