'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, MapPin, Filter, ArrowRight, Heart, 
  Globe, ChevronDown, X,
  Sparkles, Activity
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu';
import { QuickGive } from '@/components/feature/QuickGive';
import { getFieldWorkers } from '@/lib/mock-data';
import { formatCurrency, cn } from '@/lib/utils';

// --- Animations ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }
  }
};

export default function WorkerListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [regionFilter, setRegionFilter] = useState<string>('All');

  const workers = getFieldWorkers();

  const categories = ['All', ...Array.from(new Set(workers.map(w => w.category)))];
  const regions = ['All', ...Array.from(new Set(workers.map(w => w.location.split(', ').pop() || 'Global')))];

  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const matchesSearch = worker.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            worker.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            worker.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || worker.category === categoryFilter;
      const matchesRegion = regionFilter === 'All' || worker.location.includes(regionFilter);

      return matchesSearch && matchesCategory && matchesRegion;
    });
  }, [searchTerm, categoryFilter, regionFilter, workers]);

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setRegionFilter('All');
  };

  return (
    <div className="min-h-screen bg-white selection:bg-emerald-500/30">
      
      {/* --- HERO SECTION --- */}
      <section className="relative bg-slate-950 pt-48 pb-64 overflow-hidden isolate">
        {/* Deep Atmosphere */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
           <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-slate-950/80 to-slate-950" />
           <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-600/10 rounded-full blur-[200px]" />
           <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[180px]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-xl">
              <Globe className="w-4 h-4 text-emerald-500" /> Operational Map: {regions.length - 1} Regions
            </div>
            
            <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-white leading-[0.85] font-syne">
              Field <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/20">
                Directory.
              </span>
            </h1>
            
            <p className="text-2xl text-slate-400 max-w-2xl font-light leading-relaxed tracking-tight">
              A verified roster of frontline partners delivering critical restoration. 
              <span className="text-white font-medium"> 100% Direct. 0% Delay.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* --- INTERACTIVE SEARCH BAR --- */}
      <div className="container mx-auto px-6 -mt-32 relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 p-3 md:p-4"
        >
            <div className="flex flex-col lg:flex-row gap-3 items-center">
              {/* Search Input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search name, region, or mission focus..." 
                  className="w-full h-12 pl-12 pr-6 rounded-full bg-slate-50 border-none focus:bg-slate-100/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-900 placeholder:text-slate-400 outline-none text-base font-medium tracking-tight"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
  
              {/* Filters */}
              <div className="flex gap-2 w-full lg:w-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 rounded-full border-slate-100 text-slate-950 hover:bg-slate-50 bg-white gap-2 font-bold font-syne text-[10px] uppercase tracking-[0.2em] transition-all">
                      <Filter className="h-3.5 w-3.5 text-emerald-500" />
                      {categoryFilter === 'All' ? 'Focus' : categoryFilter}
                      <ChevronDown className="h-2.5 w-2.5 opacity-30" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Category Filter</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {categories.map(cat => (
                      <DropdownMenuCheckboxItem 
                        key={cat} 
                        checked={categoryFilter === cat}
                        onCheckedChange={() => setCategoryFilter(cat)}
                        className="rounded-xl h-10 font-bold text-xs uppercase tracking-wider"
                      >
                        {cat}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
  
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-12 px-6 rounded-full border-slate-100 text-slate-950 hover:bg-slate-50 bg-white gap-2 font-bold font-syne text-[10px] uppercase tracking-[0.2em] transition-all">
                      <MapPin className="h-3.5 w-3.5 text-blue-500" />
                      {regionFilter === 'All' ? 'Region' : regionFilter}
                      <ChevronDown className="h-2.5 w-2.5 opacity-30" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl">
                    <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-3">Regional Filter</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {regions.map(reg => (
                      <DropdownMenuCheckboxItem 
                        key={reg} 
                        checked={regionFilter === reg}
                        onCheckedChange={() => setRegionFilter(reg)}
                        className="rounded-xl h-10 font-bold text-xs uppercase tracking-wider"
                      >
                        {reg}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
  
                {(categoryFilter !== 'All' || regionFilter !== 'All' || searchTerm) && (
                  <Button 
                    variant="ghost" 
                    onClick={clearFilters}
                    className="h-12 w-12 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
        </motion.div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="container mx-auto px-6 py-32">
        
        {/* Results Metadata */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Active Ledger</span>
            <p className="text-4xl font-bold tracking-tighter text-slate-950 font-syne">
              <span className="text-emerald-500">{filteredWorkers.length}</span> verified partners matching protocol
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">Sort: Priority Response</span>
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
        >
          <AnimatePresence>
            {filteredWorkers.map((worker) => {
              const percentRaised = Math.min(100, Math.round((worker.raised / worker.goal) * 100));
              
              return (
                  <motion.div 
                    key={worker.id}
                    variants={itemVariants}
                    layout
                    className="group flex flex-col h-full cursor-pointer"
                  >
                    {/* Image Container */}
                      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden mb-6 bg-slate-100 shadow-xl group-hover:shadow-emerald-500/10 transition-all duration-700">
                        <Link href={`/workers/${worker.id}`} className="absolute inset-0 z-10">
                          <span className="sr-only">View {worker.title}</span>
                        </Link>
                        
                        <Image 
                          src={worker.image} 
                          alt={worker.title}
                          fill
                          className="object-cover saturate-[0.8] contrast-[1.1] transition-transform duration-[2s] group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/0 to-transparent opacity-60 group-hover:opacity-40 transition-all" />
                      
                      {/* Floating Badges */}
                      <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-20">
                        <Badge className="bg-white/95 backdrop-blur-xl text-slate-950 font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-full border border-white/50 shadow-2xl">
                          {worker.category}
                        </Badge>
                        <button className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all group/heart">
                          <Heart className="h-4 w-4 transition-transform group-hover/heart:scale-110" />
                        </button>
                      </div>
  
                      <div className="absolute bottom-6 left-6 right-6 z-20">
                         <div className="flex items-center gap-2 text-[9px] font-black text-white/70 uppercase tracking-[0.2em] mb-2">
                            <MapPin className="h-3 w-3 text-blue-400 fill-blue-400" /> {worker.location}
                         </div>
                         <h3 className="text-2xl font-bold text-white font-syne leading-none mb-4 group-hover:translate-x-2 transition-transform duration-500">
                           {worker.title}
                         </h3>
                         
                         {/* Funding Progress */}
                         <div className="space-y-2">
                            <div className="flex justify-between items-end text-[9px] font-black uppercase tracking-widest text-white">
                               <span>Goal</span>
                               <span className="text-base font-syne">{percentRaised}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                               <motion.div 
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${percentRaised}%` }}
                                  transition={{ duration: 1.5, delay: 0.5 }}
                                  className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                               />
                            </div>
                         </div>
                      </div>
                    </div>
  
                    {/* Card Actions Footer */}
                    <div className="space-y-4 flex-1 flex flex-col px-4">
                      <p className="text-slate-500 text-xs leading-relaxed font-light line-clamp-2 flex-1">
                        {worker.description}
                      </p>
  
                      <div className="grid grid-cols-2 gap-3">
                        <QuickGive workerId={worker.id} />
                        <Button 
                          variant="outline" 
                          className="h-11 rounded-xl border-slate-100 text-slate-950 font-black font-syne text-[9px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
                          asChild
                        >
                          <Link href={`/workers/${worker.id}`}>
                            Profile <ArrowRight className="ml-2 h-3 w-3" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredWorkers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg border border-slate-100">
              <Search className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-950 font-syne mb-2">Protocol: No Match</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8 text-base font-light tracking-tight">
              We couldn&apos;t find any verified partners matching your criteria. Reset filters to view all active missions.
            </p>
            <Button onClick={clearFilters} variant="outline" className="h-12 px-8 rounded-full border-slate-200 font-bold font-syne text-[10px] uppercase tracking-widest">
              Reset Security Filters
            </Button>
          </motion.div>
        )}
      </div>
  
      {/* --- BOTTOM CTA --- */}
      <section className="bg-slate-950 py-40 relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600 rounded-full blur-[200px]" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <Sparkles className="h-8 w-8 text-amber-500 mx-auto mb-8" />
          <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-6 font-syne">Undirected Impact.</h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed tracking-tight">
            Can&apos;t decide who to support? Donate to our <strong>Global Resilience</strong> fund. Resources are instantly routed to the highest-priority urgent needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="h-14 px-10 rounded-full bg-white text-slate-950 hover:bg-emerald-400 hover:text-emerald-950 text-lg font-bold font-syne transition-all hover:scale-105 shadow-xl" asChild>
              <Link href="/checkout?fund=general">Support Urgent Needs</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20 text-lg font-bold font-syne backdrop-blur-xl transition-all" asChild>
              <Link href="/about">How We Verify</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
