'use client'

import React, { useState, useMemo } from 'react';
import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  getFilteredRowModel, 
  getPaginationRowModel, 
  getSortedRowModel, 
  useReactTable, 
  SortingState, 
  RowSelectionState
} from '@tanstack/react-table';
import { 
  ArrowUpDown, Download, Filter, Search, 
  CheckCircle2, XCircle, Clock, MoreHorizontal, 
  CreditCard, Landmark, DollarSign,
  SlidersHorizontal, RefreshCcw, Mail,
  ChevronLeft, ChevronRight, X, Trash2, Plus,
  LayoutTemplate, MapPin, Briefcase, 
  ExternalLink, Copy, CalendarRange, Tag, Layers, Smartphone, Globe, Monitor,
  FileDown, Phone
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn, formatCurrency, getInitials } from '@/lib/utils';

// --- Types ---

interface Transaction {
  id: string;
  date: string;
  donorName: string;
  donorEmail: string;
  designation: string; 
  method: 'Card' | 'ACH' | 'Check' | 'Manual';
  brand?: 'Visa' | 'Mastercard' | 'Amex' | 'Discover' | 'Bank'; 
  last4?: string;
  status: 'Succeeded' | 'Pending' | 'Failed' | 'Refunded';
  amountGross: number;
  fee: number;
  amountNet: number;
  frequency: 'One-Time' | 'Monthly' | 'Annual';
  source: 'Web' | 'Mobile App' | 'Admin Entry';
}

interface FilterState {
  status: string[];
  designation: string[];
  method: string[];
  brand: string[];
  frequency: string[];
  source: string[];
  amountMin: string;
  amountMax: string;
  dateStart: string;
  dateEnd: string;
}

interface SavedView {
  id: string;
  name: string;
  filters: FilterState;
  sorting: SortingState;
}

interface DonorProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  avatar: string;
  jobTitle: string;
  company: string;
  lifetimeValue: number;
  giftCount: number;
  firstGiftDate: string;
  lastGiftDate: string;
  fundsSupported: string[];
  status: "Active" | "Lapsed" | "New";
  bio: string;
}

// --- Mock Data Generator ---

const FUNDS = ['General Fund', 'Water Initiative', 'The Miller Family', 'Dr. Sarah Smith', 'Emergency Relief', 'Operations'];
const NAMES = ['Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Diana Evans', 'Evan Wright', 'Fiona Green', 'George Hall', 'Hannah Lee', 'Ian Clark'];

// Generate consistent profiles for the names
const DONOR_PROFILES: Record<string, DonorProfile> = {};

NAMES.forEach(name => {
  DONOR_PROFILES[name] = {
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    phone: `+1 (555) ${Math.floor(Math.random() * 899 + 100)}-${Math.floor(Math.random() * 8999 + 1000)}`,
    address: `${Math.floor(Math.random() * 999)} Maple Avenue`,
    city: ['Denver', 'Seattle', 'Austin', 'New York', 'Chicago'][Math.floor(Math.random() * 5)],
    state: ['CO', 'WA', 'TX', 'NY', 'IL'][Math.floor(Math.random() * 5)],
    zip: '80203',
    country: 'USA',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    jobTitle: ['Software Engineer', 'Product Manager', 'Teacher', 'Director', 'Consultant'][Math.floor(Math.random() * 5)],
    company: ['Tech Corp', 'Global Solutions', 'Local School', 'Creative Agency'][Math.floor(Math.random() * 4)],
    lifetimeValue: Math.floor(Math.random() * 50000) + 500,
    giftCount: Math.floor(Math.random() * 50) + 1,
    firstGiftDate: subMonths(new Date(), Math.floor(Math.random() * 24 + 1)).toISOString(),
    lastGiftDate: new Date().toISOString(),
    fundsSupported: [FUNDS[Math.floor(Math.random() * FUNDS.length)], FUNDS[Math.floor(Math.random() * FUNDS.length)]],
    status: Math.random() > 0.8 ? 'Lapsed' : Math.random() > 0.9 ? 'New' : 'Active',
    bio: "Passionate about humanitarian aid and education reform. Has been a loyal supporter since 2019."
  };
});

const generateData = (count: number): Transaction[] => {
  return Array.from({ length: count }).map((_, i) => {
    const gross = Math.floor(Math.random() * 500) + 10;
    const fee = Math.round((gross * 0.029 + 0.30) * 100) / 100;
    const statusRand = Math.random();
    const status = statusRand > 0.95 ? 'Failed' : statusRand > 0.9 ? 'Refunded' : statusRand > 0.85 ? 'Pending' : 'Succeeded';
    const name = NAMES[Math.floor(Math.random() * NAMES.length)];
    const methodRand = Math.random();
    const method = methodRand > 0.6 ? 'Card' : methodRand > 0.3 ? 'ACH' : 'Check';
    
    return {
      id: `txn_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
      donorName: name,
      donorEmail: DONOR_PROFILES[name].email,
      designation: FUNDS[Math.floor(Math.random() * FUNDS.length)],
      method,
      brand: method === 'Card' ? (Math.random() > 0.5 ? 'Visa' : 'Mastercard') : method === 'ACH' ? 'Bank' : undefined,
      last4: Math.floor(Math.random() * 9000 + 1000).toString(),
      status,
      amountGross: gross,
      fee: fee,
      amountNet: gross - fee,
      frequency: Math.random() > 0.6 ? 'Monthly' : 'One-Time',
      source: Math.random() > 0.8 ? 'Admin Entry' : Math.random() > 0.4 ? 'Mobile App' : 'Web'
    };
  });
};

const DATA = generateData(300);

const DEFAULT_FILTERS: FilterState = {
  status: [],
  designation: [],
  method: [],
  brand: [],
  frequency: [],
  source: [],
  amountMin: '',
  amountMax: '',
  dateStart: '',
  dateEnd: ''
};

const MOCK_SAVED_VIEWS: SavedView[] = [
  { 
    id: 'view_1', 
    name: 'High Value Gifts', 
    filters: { ...DEFAULT_FILTERS, amountMin: '500', status: ['Succeeded'] }, 
    sorting: [{ id: 'amountGross', desc: true }] 
  },
  { 
    id: 'view_2', 
    name: 'Failed Transactions', 
    filters: { ...DEFAULT_FILTERS, status: ['Failed'] }, 
    sorting: [{ id: 'date', desc: true }] 
  },
  { 
    id: 'view_3', 
    name: 'Recurring Revenue (Monthly)', 
    filters: { ...DEFAULT_FILTERS, frequency: ['Monthly'], status: ['Succeeded'] }, 
    sorting: [{ id: 'date', desc: true }] 
  }
];

// --- Custom Components ---

const DonorHoverCard = ({ name, profile, onClick }: { name: string, profile: DonorProfile, onClick: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className="relative flex flex-col items-start group/card"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="font-semibold text-sm text-slate-900 leading-none hover:text-blue-600 hover:underline decoration-blue-300 underline-offset-4 transition-all text-left"
      >
        {name}
      </button>
      <span className="text-xs text-slate-500 mt-0.5">{profile.email}</span>

      {/* Popover Card */}
      <div className={cn(
        "absolute top-full left-0 z-50 pt-2 w-[320px] transition-all duration-200 origin-top-left",
        isOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
      )}>
        <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-4 relative overflow-hidden text-left">
           {/* Decorative Header */}
           <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100" />
           
           <div className="relative z-10 flex gap-4 mt-2">
              <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
                 <AvatarImage src={profile.avatar} />
                 <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
              </Avatar>
              <div className="pt-8">
                 <Badge variant="secondary" className={cn("text-[10px] uppercase font-bold", 
                    profile.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                 )}>
                    {profile.status} Partner
                 </Badge>
              </div>
           </div>

           <div className="mt-3 space-y-3">
              <div>
                 <h4 className="font-bold text-lg text-slate-900">{profile.name}</h4>
                 <div className="flex items-center text-xs text-slate-500 gap-2 mt-0.5">
                    <Briefcase className="h-3 w-3" /> {profile.jobTitle}
                 </div>
                 <div className="flex items-center text-xs text-slate-500 gap-2 mt-0.5">
                    <MapPin className="h-3 w-3" /> {profile.city}, {profile.state}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 bg-slate-50/50 -mx-4 px-4">
                 <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Lifetime</p>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(profile.lifetimeValue)}</p>
                 </div>
                 <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Gifts</p>
                    <p className="text-sm font-bold text-slate-900">{profile.giftCount}</p>
                 </div>
              </div>

              <div>
                 <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1.5">Top Funds</p>
                 <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(profile.fundsSupported)).map(fund => (
                       <span key={fund} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                          {fund}
                       </span>
                    ))}
                 </div>
              </div>

              <Button size="sm" variant="outline" className="w-full text-xs h-8 border-slate-200" onClick={onClick}>
                 View Full CRM Record
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

const FilterSection = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
  <div className="space-y-3">
    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
      <Icon className="h-3.5 w-3.5" /> {title}
    </Label>
    <div className="pl-1">
      {children}
    </div>
  </div>
);

// --- Main Page ---

export default function ContributionsHub() {
  // --- State ---
  const [sorting, setSorting] = useState<SortingState>([{ id: 'date', desc: true }]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');
  
  // Advanced Filter State
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Saved Views State
  const [savedViews, setSavedViews] = useState<SavedView[]>(MOCK_SAVED_VIEWS);
  const [currentViewId, setCurrentViewId] = useState<string | null>(null);
  const [isSaveViewOpen, setIsSaveViewOpen] = useState(false);
  const [newViewName, setNewViewName] = useState('');

  // Donor Profile Sheet
  const [selectedDonorProfile, setSelectedDonorProfile] = useState<DonorProfile | null>(null);

  // --- Handlers ---

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setIsFilterSheetOpen(false);
    setCurrentViewId(null);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setTempFilters(DEFAULT_FILTERS);
    setGlobalFilter('');
    setCurrentViewId(null);
  };

  const handleRemoveFilter = (key: keyof FilterState, value?: string) => {
    if (Array.isArray(filters[key]) && value) {
        setFilters(prev => ({
            ...prev,
            [key]: (prev[key] as string[]).filter(v => v !== value)
        }));
    } else {
        setFilters(prev => ({ ...prev, [key]: '' }));
    }
    setCurrentViewId(null);
  };

  const handleLoadView = (view: SavedView) => {
    setFilters(view.filters);
    setTempFilters(view.filters);
    setSorting(view.sorting);
    setCurrentViewId(view.id);
  };

  const handleSaveView = () => {
    if (!newViewName.trim()) return;
    const newView: SavedView = {
      id: `view_${Date.now()}`,
      name: newViewName,
      filters: filters,
      sorting: sorting
    };
    setSavedViews([...savedViews, newView]);
    setCurrentViewId(newView.id);
    setIsSaveViewOpen(false);
    setNewViewName('');
  };

  const handleDeleteView = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedViews(savedViews.filter(v => v.id !== id));
    if (currentViewId === id) setCurrentViewId(null);
  };

  // --- Filter Logic ---
  
  const filteredData = useMemo(() => {
    return DATA.filter(item => {
      // Global Search
      if (globalFilter) {
        const search = globalFilter.toLowerCase();
        const matches = 
          item.id.toLowerCase().includes(search) ||
          item.donorName.toLowerCase().includes(search) ||
          item.donorEmail.toLowerCase().includes(search) ||
          item.amountGross.toString().includes(search);
        if (!matches) return false;
      }

      // Deep Filters
      if (filters.status.length > 0 && !filters.status.includes(item.status)) return false;
      if (filters.designation.length > 0 && !filters.designation.includes(item.designation)) return false;
      if (filters.method.length > 0 && !filters.method.includes(item.method)) return false;
      if (filters.frequency.length > 0 && !filters.frequency.includes(item.frequency)) return false;
      if (filters.source.length > 0 && !filters.source.includes(item.source)) return false;
      if (filters.brand.length > 0 && item.brand && !filters.brand.includes(item.brand)) return false;
      
      if (filters.amountMin && item.amountGross < parseFloat(filters.amountMin)) return false;
      if (filters.amountMax && item.amountGross > parseFloat(filters.amountMax)) return false;

      if (filters.dateStart && new Date(item.date) < new Date(filters.dateStart)) return false;
      if (filters.dateEnd) {
         const endDate = new Date(filters.dateEnd);
         endDate.setHours(23, 59, 59, 999);
         if (new Date(item.date) > endDate) return false;
      }

      return true;
    });
  }, [filters, globalFilter]);

  // --- Table Configuration ---

  const columns: ColumnDef<Transaction>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "id",
      header: "Txn ID",
      cell: ({ row }) => (
        <div className="flex flex-col text-left">
            <span className="font-mono text-xs text-slate-500">{row.getValue("id")}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
                {row.original.source === 'Web' && <Globe className="h-3 w-3 text-slate-400" />}
                {row.original.source === 'Mobile App' && <Smartphone className="h-3 w-3 text-slate-400" />}
                {row.original.source === 'Admin Entry' && <Monitor className="h-3 w-3 text-slate-400" />}
                <span className="text-[10px] text-slate-400">{row.original.source}</span>
            </div>
        </div>
      ),
      size: 140,
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button variant="ghost" className="-ml-4 h-8 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <span className="text-xs font-medium text-slate-700 whitespace-nowrap block text-left">{format(new Date(row.getValue("date")), "MMM d, yyyy HH:mm")}</span>,
      size: 160,
    },
    {
      accessorKey: "donorName",
      header: "Donor",
      cell: ({ row }) => {
        const name = row.getValue("donorName") as string;
        const profile = DONOR_PROFILES[name];
        
        return (
          <DonorHoverCard 
            name={name} 
            profile={profile} 
            onClick={() => setSelectedDonorProfile(profile)} 
          />
        );
      },
    },
    {
      accessorKey: "designation",
      header: "Details",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-left">
            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-medium w-fit max-w-[150px] truncate shadow-none">
                {row.getValue("designation")}
            </Badge>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-medium">{row.original.frequency}</span>
                {row.original.frequency === 'Monthly' && <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />}
            </div>
        </div>
      ),
    },
    {
      accessorKey: "amountGross",
      header: ({ column }) => (
        <div className="text-right">
          <Button variant="ghost" className="-mr-4 h-8 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-700" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Gross
            <ArrowUpDown className="ml-2 h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col items-end">
            <div className="text-right font-mono font-bold text-slate-900">{formatCurrency(row.getValue("amountGross"))}</div>
            <div className="flex items-center gap-1 mt-0.5">
                {row.original.brand === 'Visa' && <div className="h-2 w-3 bg-blue-800 rounded-[1px]" />}
                {row.original.brand === 'Mastercard' && <div className="h-2 w-3 bg-orange-600 rounded-[1px]" />}
                <span className="text-[10px] text-slate-400">{row.original.brand || row.original.method} ••{row.original.last4?.slice(-2)}</span>
            </div>
        </div>
      ),
    },
    {
      accessorKey: "fee",
      header: () => <div className="text-right text-xs font-bold uppercase tracking-wider text-slate-500">Fee</div>,
      cell: ({ row }) => <div className="text-right font-mono text-xs text-slate-500">-{formatCurrency(row.getValue("fee"))}</div>,
    },
    {
      accessorKey: "amountNet",
      header: () => <div className="text-right text-xs font-bold uppercase tracking-wider text-slate-500">Net</div>,
      cell: ({ row }) => <div className="text-right font-mono text-xs font-bold text-emerald-600">{formatCurrency(row.getValue("amountNet"))}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let color = "bg-slate-100 text-slate-600 border-slate-200";
        let Icon = Clock;
        if (status === 'Succeeded') { color = "bg-emerald-50 text-emerald-700 border-emerald-200"; Icon = CheckCircle2; }
        if (status === 'Pending') { color = "bg-amber-50 text-amber-700 border-amber-200"; Icon = Clock; }
        if (status === 'Failed') { color = "bg-red-50 text-red-700 border-red-200"; Icon = XCircle; }
        if (status === 'Refunded') { color = "bg-purple-50 text-purple-700 border-purple-200"; Icon = RefreshCcw; }
        
        return (
          <Badge variant="outline" className={cn("text-[10px] uppercase font-bold tracking-wider pl-1.5 pr-2.5 py-0.5 h-6 gap-1.5 shadow-none", color)}>
            <Icon className="h-3 w-3" />
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
                Copy Transaction ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedDonorProfile(DONOR_PROFILES[row.original.donorName])}>
                  View Donor Profile
                </DropdownMenuItem>
                <DropdownMenuItem>Download Receipt</DropdownMenuItem>
                <DropdownMenuSeparator />
                {row.original.status === 'Succeeded' && (
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        Refund Donation
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      rowSelection,
    },
  });

  // Calculate Aggregates
  const totalVolume = filteredData.reduce((sum, row) => sum + (row.status === 'Succeeded' ? row.amountGross : 0), 0);
  const totalNet = filteredData.reduce((sum, row) => sum + (row.status === 'Succeeded' ? row.amountNet : 0), 0);
  const totalFees = filteredData.reduce((sum, row) => sum + (row.status === 'Succeeded' ? row.fee : 0), 0);
  const successCount = filteredData.filter(r => r.status === 'Succeeded').length;

  const activeFilterCount = (filters.status.length) + (filters.designation.length) + (filters.method.length) + (filters.brand.length) + (filters.frequency.length) + (filters.source.length) + (filters.amountMin || filters.amountMax ? 1 : 0) + (filters.dateStart || filters.dateEnd ? 1 : 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 p-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Contributions Hub</h1>
          <p className="text-slate-500 mt-1">Financial oversight and transaction management.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white hover:bg-slate-50 border-slate-200">
            <FileDown className="mr-2 h-4 w-4" /> Reports
          </Button>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
            <DollarSign className="mr-2 h-4 w-4" /> Manual Entry
          </Button>
        </div>
      </div>

      {/* Aggregate Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Volume</p>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{formatCurrency(totalVolume)}</div>
            </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5">
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Net Revenue</p>
                <div className="text-2xl font-bold text-emerald-700 mt-1 tabular-nums">{formatCurrency(totalNet)}</div>
            </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Processing Fees</p>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{formatCurrency(totalFees)}</div>
            </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Successful Txns</p>
                <div className="text-2xl font-bold text-slate-900 mt-1 tabular-nums">{successCount} <span className="text-sm font-normal text-slate-400">/ {filteredData.length}</span></div>
            </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col bg-white">
        
        {/* Advanced Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-4">
            <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
                
                {/* Left: Search & Views */}
                <div className="flex items-center gap-3 w-full xl:w-auto">
                    {/* Saved Views Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-10 border-slate-200 bg-white text-slate-700 hover:text-slate-900 gap-2 min-w-[140px] justify-between">
                           <span className="flex items-center gap-2"><LayoutTemplate className="h-4 w-4 text-slate-500" /> {currentViewId ? savedViews.find(v => v.id === currentViewId)?.name : 'All Transactions'}</span>
                           <ChevronRight className="h-3 w-3 opacity-50 rotate-90" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>Saved Views</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleClearFilters} className="justify-between">
                           All Transactions
                           {!currentViewId && <CheckCircle2 className="h-4 w-4 text-slate-900" />}
                        </DropdownMenuItem>
                        {savedViews.map(view => (
                          <DropdownMenuItem key={view.id} onClick={() => handleLoadView(view)} className="justify-between group">
                             <span>{view.name}</span>
                             <div className="flex items-center gap-2">
                               {currentViewId === view.id && <CheckCircle2 className="h-4 w-4 text-slate-900" />}
                               <Trash2 className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-all" onClick={(e) => handleDeleteView(view.id, e)} />
                             </div>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsSaveViewOpen(true)} disabled={activeFilterCount === 0 && !globalFilter}>
                           <Plus className="h-3.5 w-3.5 mr-2" /> Save Current View
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="h-6 w-px bg-slate-200 hidden sm:block" />

                    {/* Search Bar */}
                    <div className="relative flex-1 xl:w-80">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Search by ID, donor, or email..." 
                            value={globalFilter ?? ""}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-9 bg-white border-slate-200 h-10 shadow-sm"
                        />
                    </div>
                </div>

                {/* Right: Filters & Actions */}
                <div className="flex items-center gap-2 w-full xl:w-auto justify-end">
                    
                    {/* Active Filter Chips */}
                    <AnimatePresence>
                        {activeFilterCount > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="hidden lg:flex items-center gap-2 mr-2"
                            >
                                <span className="text-xs text-slate-500 font-medium">Active:</span>
                                {filters.status.map(s => <Badge key={s} variant="secondary" className="gap-1 pr-1 cursor-pointer hover:bg-slate-200 shadow-none" onClick={() => handleRemoveFilter('status', s)}>{s} <X className="h-3 w-3 text-slate-400" /></Badge>)}
                                {filters.frequency.map(s => <Badge key={s} variant="secondary" className="gap-1 pr-1 cursor-pointer hover:bg-slate-200 shadow-none" onClick={() => handleRemoveFilter('frequency', s)}>{s} <X className="h-3 w-3 text-slate-400" /></Badge>)}
                                {filters.source.map(s => <Badge key={s} variant="secondary" className="gap-1 pr-1 cursor-pointer hover:bg-slate-200 shadow-none" onClick={() => handleRemoveFilter('source', s)}>{s} <X className="h-3 w-3 text-slate-400" /></Badge>)}
                                {(filters.amountMin || filters.amountMax) && <Badge variant="secondary" className="gap-1 pr-1 cursor-pointer hover:bg-slate-200 shadow-none" onClick={() => { handleRemoveFilter('amountMin'); handleRemoveFilter('amountMax'); }}>${filters.amountMin || '0'} - ${filters.amountMax || '∞'} <X className="h-3 w-3 text-slate-400" /></Badge>}
                                <Button variant="ghost" size="icon" onClick={handleClearFilters} className="h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-600"><X className="h-3 w-3" /></Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Filter Sheet Trigger */}
                    <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                      <SheetTrigger asChild>
                        <Button variant="outline" className={cn("h-10 border-slate-200 bg-white text-slate-700 hover:text-slate-900 gap-2 relative transition-all", activeFilterCount > 0 && "border-blue-300 bg-blue-50 text-blue-700")}>
                            <SlidersHorizontal className="h-4 w-4" /> Filters
                            {activeFilterCount > 0 && <Badge className="ml-1 h-5 px-1.5 bg-blue-600 text-white rounded-full text-[10px] shadow-none">{activeFilterCount}</Badge>}
                        </Button>
                      </SheetTrigger>
                      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                        <SheetHeader className="pb-4 border-b border-slate-100">
                          <SheetTitle>Filter Transactions</SheetTitle>
                          <SheetDescription>Refine your search with comprehensive criteria.</SheetDescription>
                        </SheetHeader>
                        
                        <div className="py-6 space-y-8 text-left">
                           
                           {/* SECTION 1: Core Details */}
                           <FilterSection title="Transaction Status" icon={CheckCircle2}>
                              <div className="grid grid-cols-2 gap-3">
                                 {['Succeeded', 'Pending', 'Failed', 'Refunded'].map(status => (
                                    <div key={status} className="flex items-center space-x-2">
                                       <Checkbox 
                                          id={`status-${status}`} 
                                          checked={tempFilters.status.includes(status)}
                                          onCheckedChange={(checked) => {
                                             setTempFilters(prev => ({
                                                ...prev,
                                                status: checked ? [...prev.status, status] : prev.status.filter(s => s !== status)
                                             }));
                                          }}
                                       />
                                       <label htmlFor={`status-${status}`} className="text-sm font-medium leading-none">{status}</label>
                                    </div>
                                 ))}
                              </div>
                           </FilterSection>

                           <FilterSection title="Frequency" icon={RefreshCcw}>
                              <div className="flex flex-wrap gap-2">
                                 {['One-Time', 'Monthly', 'Annual'].map(freq => (
                                    <div 
                                        key={freq}
                                        onClick={() => {
                                            setTempFilters(prev => ({
                                                ...prev,
                                                frequency: prev.frequency.includes(freq) ? prev.frequency.filter(f => f !== freq) : [...prev.frequency, freq]
                                            }));
                                        }}
                                        className={cn(
                                            "px-3 py-1.5 rounded-md border text-xs font-medium cursor-pointer transition-all select-none",
                                            tempFilters.frequency.includes(freq) 
                                                ? "bg-blue-50 border-blue-200 text-blue-700" 
                                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                        )}
                                    >
                                        {freq}
                                    </div>
                                 ))}
                              </div>
                           </FilterSection>

                           <Separator />

                           {/* SECTION 2: Payment Details */}
                           <FilterSection title="Payment Method" icon={CreditCard}>
                              <div className="grid grid-cols-3 gap-2">
                                 {['Card', 'ACH', 'Check', 'Manual'].map(method => (
                                    <div 
                                        key={method}
                                        onClick={() => {
                                            setTempFilters(prev => ({
                                                ...prev,
                                                method: prev.method.includes(method) ? prev.method.filter(m => m !== method) : [...prev.method, method]
                                            }));
                                        }}
                                        className={cn(
                                            "px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-all text-center select-none",
                                            tempFilters.method.includes(method) 
                                                ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        {method}
                                    </div>
                                 ))}
                              </div>
                           </FilterSection>

                           {/* Conditional Brand Filter - Only show if Card is selected or no method selected */}
                           {(tempFilters.method.includes('Card') || tempFilters.method.length === 0) && (
                               <FilterSection title="Card Brand" icon={Tag}>
                                  <div className="flex flex-wrap gap-2">
                                     {['Visa', 'Mastercard', 'Amex', 'Discover'].map(brand => (
                                        <div key={brand} className="flex items-center space-x-2">
                                           <Checkbox 
                                              id={`brand-${brand}`} 
                                              checked={tempFilters.brand.includes(brand)}
                                              onCheckedChange={(checked) => {
                                                 setTempFilters(prev => ({
                                                    ...prev,
                                                    brand: checked ? [...prev.brand, brand] : prev.brand.filter(b => b !== brand)
                                                 }));
                                              }}
                                           />
                                           <label htmlFor={`brand-${brand}`} className="text-sm font-medium leading-none">{brand}</label>
                                        </div>
                                     ))}
                                  </div>
                               </FilterSection>
                           )}

                           <Separator />

                           {/* SECTION 3: Context & Amounts */}
                           <FilterSection title="Source" icon={Layers}>
                              <div className="flex flex-wrap gap-2">
                                 {['Web', 'Mobile App', 'Admin Entry'].map(src => (
                                    <div key={src} className="flex items-center space-x-2 mr-4">
                                       <Checkbox 
                                          id={`src-${src}`} 
                                          checked={tempFilters.source.includes(src)}
                                          onCheckedChange={(checked) => {
                                             setTempFilters(prev => ({
                                                ...prev,
                                                source: checked ? [...prev.source, src] : prev.source.filter(s => s !== src)
                                             }));
                                          }}
                                       />
                                       <label htmlFor={`src-${src}`} className="text-sm font-medium leading-none">{src}</label>
                                    </div>
                                 ))}
                              </div>
                           </FilterSection>

                           <FilterSection title="Amount Range" icon={DollarSign}>
                              <div className="flex items-center gap-4">
                                 <div className="relative flex-1">
                                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                                    <Input 
                                      type="number" 
                                      placeholder="Min" 
                                      className="pl-6" 
                                      value={tempFilters.amountMin} 
                                      onChange={(e) => setTempFilters(prev => ({ ...prev, amountMin: e.target.value }))}
                                    />
                                 </div>
                                 <span className="text-slate-400">-</span>
                                 <div className="relative flex-1">
                                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm">$</span>
                                    <Input 
                                      type="number" 
                                      placeholder="Max" 
                                      className="pl-6"
                                      value={tempFilters.amountMax}
                                      onChange={(e) => setTempFilters(prev => ({ ...prev, amountMax: e.target.value }))}
                                    />
                                 </div>
                              </div>
                           </FilterSection>

                           <FilterSection title="Date Range" icon={CalendarRange}>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Start</span>
                                    <Input 
                                      type="date" 
                                      value={tempFilters.dateStart}
                                      onChange={(e) => setTempFilters(prev => ({ ...prev, dateStart: e.target.value }))}
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">End</span>
                                    <Input 
                                      type="date"
                                      value={tempFilters.dateEnd}
                                      onChange={(e) => setTempFilters(prev => ({ ...prev, dateEnd: e.target.value }))}
                                    />
                                 </div>
                              </div>
                           </FilterSection>

                           <FilterSection title="Designation" icon={Tag}>
                              <div className="border border-slate-200 rounded-lg p-3 h-40 overflow-y-auto space-y-2 bg-slate-50/50">
                                 {FUNDS.map(fund => (
                                    <div key={fund} className="flex items-center space-x-2 hover:bg-slate-100 p-1 rounded">
                                       <Checkbox 
                                          id={`fund-${fund}`} 
                                          checked={tempFilters.designation.includes(fund)}
                                          onCheckedChange={(checked) => {
                                             setTempFilters(prev => ({
                                                ...prev,
                                                designation: checked 
                                                   ? [...prev.designation, fund]
                                                   : prev.designation.filter(f => f !== fund)
                                             }));
                                          }}
                                       />
                                       <label htmlFor={`fund-${fund}`} className="text-sm font-medium leading-none cursor-pointer w-full text-left">{fund}</label>
                                    </div>
                                 ))}
                              </div>
                           </FilterSection>
                        </div>

                        <SheetFooter className="pt-4 border-t border-slate-100 flex-col sm:flex-row gap-2 sticky bottom-0 bg-white pb-6">
                           <Button variant="outline" onClick={handleClearFilters} className="w-full sm:w-auto">Reset All</Button>
                           <Button onClick={handleApplyFilters} className="w-full sm:w-auto bg-slate-900 text-white shadow-md">Apply Filters</Button>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>

                    {/* Bulk Actions (Conditional) */}
                    <AnimatePresence>
                        {Object.keys(rowSelection).length > 0 && (
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-1.5 rounded-md shadow-sm ml-2"
                            >
                                <span className="text-xs font-bold mr-2">{Object.keys(rowSelection).length} selected</span>
                                <div className="h-4 w-px bg-slate-700 mx-1" />
                                <Button size="sm" variant="ghost" className="h-7 text-xs hover:bg-slate-800 hover:text-white">
                                    <Download className="mr-1.5 h-3 w-3" /> Export
                                </Button>
                                <Button size="sm" variant="ghost" className="h-7 text-xs hover:bg-slate-800 hover:text-white">
                                    <RefreshCcw className="mr-1.5 h-3 w-3" /> Re-Receipt
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[500px]">
            <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className="h-10 font-bold text-slate-500 uppercase text-[11px] tracking-wider bg-slate-50">
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
              <TableBody>
                          {table.getRowModel().rows.length ? (
                              table.getRowModel().rows.map((row) => (
                                  <TableRow 
                                      key={row.id} 
                                      data-state={row.getIsSelected() && "selected"}
                                      className="hover:bg-slate-50/50 border-slate-100 transition-colors data-[state=selected]:bg-slate-50 h-14 border-b"
                                  >
                                      {row.getVisibleCells().map((cell) => (
                                          <TableCell key={cell.id} className="py-2">
                                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                          </TableCell>
                                      ))}
                                  </TableRow>
                              ))
                          ) : (
                              <TableRow>
                                  <TableCell colSpan={columns.length} className="h-64 text-center text-slate-500">
                                      <div className="flex flex-col items-center justify-center">
                                      <Search className="h-10 w-10 text-slate-300 mb-2" />
                                      <p className="text-lg font-medium text-slate-900">No transactions found</p>
                                      <p className="text-sm text-slate-500">Try adjusting your filters or search terms.</p>
                                      <Button variant="link" onClick={handleClearFilters} className="mt-2">Clear all filters</Button>
                                      </div>
                                  </TableCell>
                              </TableRow>
                          )}
                  </TableBody>
            </Table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/30 flex items-center justify-between">
            <div className="flex-1 text-sm text-slate-500">
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="h-8 w-8 p-0 bg-white"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-xs font-medium text-slate-600 px-2">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="h-8 w-8 p-0 bg-white"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </Card>

      {/* Save View Dialog */}
      <Dialog open={isSaveViewOpen} onOpenChange={setIsSaveViewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Current View</DialogTitle>
            <DialogDescription>
              Save these filters and sorting as a custom view for quick access.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="viewName" className="sr-only">View Name</Label>
              <Input
                id="viewName"
                placeholder="e.g. Monthly High Value"
                value={newViewName}
                onChange={(e) => setNewViewName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button type="button" variant="secondary" onClick={() => setIsSaveViewOpen(false)}>
              Cancel
            </Button>
            <Button type="button" className="bg-slate-900 text-white" onClick={handleSaveView}>
              Save View
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Donor CRM Quick-View Sheet */}
      <Sheet open={!!selectedDonorProfile} onOpenChange={(open) => !open && setSelectedDonorProfile(null)}>
         <SheetContent className="w-full sm:max-w-2xl p-0 bg-slate-50">
            {selectedDonorProfile && (
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="bg-white border-b border-slate-200 p-8 pb-0">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-6">
                                <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-md">
                                    <AvatarImage src={selectedDonorProfile.avatar} />
                                    <AvatarFallback>{getInitials(selectedDonorProfile.name)}</AvatarFallback>
                                </Avatar>
                                <div className="pt-2">
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedDonorProfile.name}</h2>
                                    <div className="flex items-center gap-2 text-slate-500 mt-1">
                                        <Mail className="h-4 w-4" /> {selectedDonorProfile.email}
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 shadow-none">
                                            {selectedDonorProfile.status} Partner
                                        </Badge>
                                        <Badge variant="outline" className="bg-white text-slate-500 shadow-none">
                                            Partner since {format(new Date(selectedDonorProfile.firstGiftDate), 'yyyy')}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" size="icon" className="h-10 w-10"><Phone className="h-4 w-4" /></Button>
                        </div>
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="bg-transparent h-auto p-0 gap-8 border-none">
                                <TabsTrigger value="overview" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-all">Overview</TabsTrigger>
                                <TabsTrigger value="giving" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-all">Giving History</TabsTrigger>
                                <TabsTrigger value="activity" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-0 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-all">Activity</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <ScrollArea className="flex-1 p-8">
                        <div className="space-y-8">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <Card className="p-4 bg-white border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lifetime Value</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(selectedDonorProfile.lifetimeValue)}</p>
                                </Card>
                                <Card className="p-4 bg-white border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Gifts</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">{selectedDonorProfile.giftCount}</p>
                                </Card>
                                <Card className="p-4 bg-white border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Gift</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">{format(new Date(selectedDonorProfile.lastGiftDate), 'MMM d')}</p>
                                </Card>
                            </div>

                            {/* Bio */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Partner Biography</h3>
                                <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm italic">
                                    "{selectedDonorProfile.bio}"
                                </p>
                            </div>

                            {/* Details */}
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Contact Info</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <Phone className="h-4 w-4 text-slate-400" /> {selectedDonorProfile.phone}
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-slate-600">
                                            <MapPin className="h-4 w-4 text-slate-400" /> {selectedDonorProfile.address}, {selectedDonorProfile.city}, {selectedDonorProfile.state}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Designations</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedDonorProfile.fundsSupported.map(fund => (
                                            <Badge key={fund} variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 shadow-none">{fund}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-6 bg-white border-t border-slate-200 flex justify-end gap-3">
                        <Button variant="outline">Close</Button>
                        <Button className="bg-slate-900 text-white">Full Profile Record</Button>
                    </div>
                </div>
            )}
         </SheetContent>
      </Sheet>
    </div>
  );
}
