'use client';

import React, { useState } from 'react';
import { 
  CreditCard, MoreHorizontal, 
  PauseCircle, 
  PlayCircle, X, DollarSign,
  Clock, ArrowRightLeft, Plus, Lock, ArrowLeft,
  Edit2, Landmark, MapPin, Check, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, addMonths } from 'date-fns';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { cn, formatCurrency } from '@/lib/utils';

// --- Types & Mock Data ---

type PledgeStatus = 'Active' | 'Paused' | 'Processing' | 'Failed';

interface PaymentMethod {
  id: string;
  name: string;
  brand: string;
  last4: string;
  type: 'card' | 'bank';
}

interface Pledge {
  id: string;
  recipientName: string;
  recipientCategory: string; 
  recipientAvatar: string;
  amount: number;
  frequency: 'Monthly' | 'Quarterly' | 'Annually';
  nextChargeDate: string; // ISO Date
  status: PledgeStatus;
  paymentMethodId: string;
  pausedUntil?: string; // ISO Date if paused
}

const MOCK_WALLETS: PaymentMethod[] = [
  { id: 'pm1', name: 'Visa ending in 4242', brand: 'Visa', last4: '4242', type: 'card' },
  { id: 'pm2', name: 'Mastercard ending in 9821', brand: 'Mastercard', last4: '9821', type: 'card' },
  { id: 'pm3', name: 'Chase Checking ****6789', brand: 'Chase', last4: '6789', type: 'bank' },
];

const MOCK_PLEDGES: Pledge[] = [
  {
    id: 'p1',
    recipientName: 'The Miller Family',
    recipientCategory: 'Missionary',
    recipientAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80',
    amount: 100,
    frequency: 'Monthly',
    nextChargeDate: '2025-01-01',
    status: 'Active',
    paymentMethodId: 'pm1'
  },
  {
    id: 'p2',
    recipientName: 'Clean Water Initiative',
    recipientCategory: 'Project',
    recipientAvatar: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?fit=crop&w=256&h=256&q=80',
    amount: 50,
    frequency: 'Monthly',
    nextChargeDate: '2025-01-15',
    status: 'Active',
    paymentMethodId: 'pm2'
  },
  {
    id: 'p3',
    recipientName: 'Dr. Sarah Smith',
    recipientCategory: 'Medical',
    recipientAvatar: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?fit=facearea&facepad=2&w=256&h=256&q=80',
    amount: 200,
    frequency: 'Monthly',
    nextChargeDate: '2025-02-01',
    status: 'Paused',
    pausedUntil: '2025-03-01',
    paymentMethodId: 'pm3'
  }
];

// --- Components ---

export default function DonorPledgesPage() {
  const [pledges, setPledges] = useState<Pledge[]>(MOCK_PLEDGES);
  const [wallets, setWallets] = useState<PaymentMethod[]>(MOCK_WALLETS);
  
  // --- Edit State ---
  const [editingPledge, setEditingPledge] = useState<Pledge | null>(null);
  const [editForm, setEditForm] = useState<{
    amount: number;
    frequency: string;
  }>({ amount: 0, frequency: '' });

  // --- Move/Swap State ---
  const [movingPledge, setMovingPledge] = useState<Pledge | null>(null);
  const [moveView, setMoveView] = useState<'select' | 'add'>('select');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  
  // New Payment Method State
  const [newMethodType, setNewMethodType] = useState<'card' | 'bank'>('card');
  const [newCard, setNewCard] = useState({ number: '', expiry: '', cvc: '' });
  const [newBank, setNewBank] = useState({ routing: '', account: '', holderName: '', type: 'Checking' });
  
  // Billing Address State
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [billingAddress, setBillingAddress] = useState({ 
    street: '', city: '', state: '', zip: '', country: 'USA' 
  });

  // Mock Profile Address
  const profileAddress = "123 Maple Ave, Denver, CO 80203";

  // --- Pause Flow State ---
  const [isPauseOpen, setIsPauseOpen] = useState(false);
  const [pauseDuration, setPauseDuration] = useState('1'); // Months
  const [customResumeDate, setCustomResumeDate] = useState('');

  // --- Handlers ---

  const handleEditClick = (pledge: Pledge) => {
    setEditingPledge(pledge);
    setEditForm({
      amount: pledge.amount,
      frequency: pledge.frequency
    });
    setIsPauseOpen(false);
  };

  const handleOpenMove = (pledge: Pledge) => {
    setMovingPledge(pledge);
    setSelectedTargetId(pledge.paymentMethodId);
    setMoveView('select');
    // Reset add form
    setNewMethodType('card');
    setUseProfileAddress(true);
    setNewCard({ number: '', expiry: '', cvc: '' });
    setNewBank({ routing: '', account: '', holderName: '', type: 'Checking' });
    // Close other dialogs if open
    setEditingPledge(null); 
  };

  const handleSaveChanges = () => {
    if (!editingPledge) return;
    
    const updatedPledges = pledges.map(p => {
      if (p.id === editingPledge.id) {
        return {
          ...p,
          amount: editForm.amount,
          frequency: editForm.frequency as any,
        };
      }
      return p;
    });
    
    setPledges(updatedPledges);
    setEditingPledge(null);
  };

  const handleConfirmMove = () => {
    if (!movingPledge || !selectedTargetId) return;

    const updatedPledges = pledges.map(p => 
      p.id === movingPledge.id ? { ...p, paymentMethodId: selectedTargetId } : p
    );
    setPledges(updatedPledges);
    setMovingPledge(null);
  };

  const handleSaveNewMethod = () => {
    const newMethodId = `pm_new_${Date.now()}`;
    let newMethod: PaymentMethod;

    if (newMethodType === 'card') {
      newMethod = {
        id: newMethodId,
        name: `Visa ending ${newCard.number.slice(-4) || '8888'}`,
        brand: 'Visa',
        last4: newCard.number.slice(-4) || '8888',
        type: 'card'
      };
    } else {
      newMethod = {
        id: newMethodId,
        name: `${newBank.type} ****${newBank.account.slice(-4) || '1234'}`,
        brand: 'Bank', // Using 'Bank' as generic brand for display
        last4: newBank.account.slice(-4) || '1234',
        type: 'bank'
      };
    }
    
    setWallets([...wallets, newMethod]);
    setSelectedTargetId(newMethodId);
    setMoveView('select'); // Go back to selection with new one selected
  };

  const handlePausePledge = () => {
    if (!editingPledge) return;
    
    const resumeDate = customResumeDate 
      ? new Date(customResumeDate) 
      : addMonths(new Date(), parseInt(pauseDuration));
    
    const updatedPledges = pledges.map(p => {
      if (p.id === editingPledge.id) {
        return {
          ...p,
          status: 'Paused' as PledgeStatus,
          pausedUntil: format(resumeDate, 'yyyy-MM-dd'),
          nextChargeDate: format(resumeDate, 'yyyy-MM-dd') 
        };
      }
      return p;
    });

    setPledges(updatedPledges);
    setIsPauseOpen(false);
    setEditingPledge(null);
  };

  const handleResumePledge = (id: string) => {
    const updatedPledges = pledges.map(p => {
      if (p.id === id) {
        const nextDate = format(addMonths(new Date(), 1), 'yyyy-MM-01');
        return {
          ...p,
          status: 'Active' as PledgeStatus,
          pausedUntil: undefined,
          nextChargeDate: nextDate
        };
      }
      return p;
    });
    setPledges(updatedPledges);
  };

  const handleStopPledge = (id: string) => {
    if (confirm("Are you sure you want to cancel this pledge? This action cannot be undone.")) {
        setPledges(prev => prev.filter(p => p.id !== id));
        setEditingPledge(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24 pt-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1 text-left">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Recurring Pledges</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage your ongoing commitments and impact.</p>
        </div>
        <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl transition-all h-12 px-6 rounded-full font-bold">
           <DollarSign className="mr-2 h-5 w-5" /> New Pledge
        </Button>
      </div>

      {/* Grid of Pledges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode='popLayout'>
          {pledges.map((pledge) => {
            const method = wallets.find(w => w.id === pledge.paymentMethodId) || wallets[0];
            const isPaused = pledge.status === 'Paused';

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={pledge.id}
              >
                <Card className={cn(
                  "border overflow-hidden transition-all duration-300 relative group text-left",
                  isPaused 
                    ? "bg-slate-50 border-slate-200" 
                    : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-md"
                )}>
                  {/* Status Indicator Bar */}
                  {isPaused ? (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-400 z-10" />
                  ) : (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500 z-10" />
                  )}

                  <CardContent className="p-0 pl-1">
                    <div className="p-6">
                      
                      {/* Header: Recipient & Actions */}
                      <div className="flex justify-between items-start gap-4 mb-6">
                        <div className="flex items-start gap-4">
                          <Avatar className={cn("h-14 w-14 border-2 shadow-sm", isPaused ? "border-slate-200 grayscale" : "border-white ring-1 ring-slate-100")}>
                            <AvatarImage src={pledge.recipientAvatar} className="object-cover" />
                            <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">{pledge.recipientName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <Badge variant="outline" className={cn("text-[10px] font-bold uppercase tracking-wider border-slate-200", isPaused ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-700 border-blue-100")}>
                              {pledge.recipientCategory}
                            </Badge>
                            <h3 className={cn("text-lg font-bold leading-tight", isPaused ? "text-slate-500" : "text-slate-900")}>
                              {pledge.recipientName}
                            </h3>
                          </div>
                        </div>

                        {/* Three Dots Menu - Lifecycle Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 -mr-2">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            {pledge.status === 'Active' ? (
                              <DropdownMenuItem onClick={() => { handleEditClick(pledge); setIsPauseOpen(true); }}>
                                <PauseCircle className="mr-2 h-4 w-4" /> Pause Pledge
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleResumePledge(pledge.id)} className="text-emerald-600">
                                <PlayCircle className="mr-2 h-4 w-4" /> Resume Pledge
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleStopPledge(pledge.id)}>
                              <X className="mr-2 h-4 w-4" /> Cancel Pledge
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Body: Amount & Controls */}
                      <div className="flex items-end justify-between mb-6">
                        <div>
                          <div className={cn("text-3xl font-bold tabular-nums tracking-tight", isPaused ? "text-slate-400" : "text-slate-900")}>
                            {formatCurrency(pledge.amount)}
                          </div>
                          <div className="text-sm font-medium text-slate-500">
                            {pledge.frequency}
                          </div>
                        </div>

                        {/* Main Edit Button */}
                        {isPaused ? (
                           <Button 
                              onClick={() => handleResumePledge(pledge.id)} 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md gap-2"
                           >
                              <PlayCircle className="h-4 w-4" /> Resume Now
                           </Button>
                        ) : (
                           <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditClick(pledge)}
                              className="border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 gap-2 bg-white shadow-sm"
                           >
                              <Edit2 className="h-3.5 w-3.5" /> Edit Details
                           </Button>
                        )}
                      </div>

                      <Separator className="mb-4" />

                      {/* Footer: Payment & Dates */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
                        
                        {/* Payment Method with Swap */}
                        <div className="flex items-center gap-3">
                          <div className={cn("p-1.5 rounded border shadow-sm", isPaused ? "bg-slate-50 border-slate-200 text-slate-400" : "bg-white border-slate-200 text-slate-700")}>
                            {method.type === 'card' ? <CreditCard className="h-4 w-4" /> : <Landmark className="h-4 w-4" />}
                          </div>
                          <div className="flex flex-col">
                             <span className={cn("text-xs font-semibold", isPaused ? "text-slate-400" : "text-slate-700")}>
                               {method.brand} ••{method.last4}
                             </span>
                             <button 
                                onClick={() => handleOpenMove(pledge)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline text-left flex items-center gap-1 mt-0.5"
                             >
                                Change <ArrowRightLeft className="h-2.5 w-2.5" />
                             </button>
                          </div>
                        </div>

                        {/* Date Info */}
                        <div className="flex items-center gap-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 self-start sm:self-auto">
                           {isPaused ? (
                             <>
                                <PauseCircle className="h-3.5 w-3.5 text-amber-500" />
                                <span className="text-xs font-medium">Paused until {format(new Date(pledge.pausedUntil!), 'MMM d')}</span>
                             </>
                           ) : (
                             <>
                                <Clock className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="text-xs font-medium">Next: {format(new Date(pledge.nextChargeDate), 'MMM d, yyyy')}</span>
                             </>
                           )}
                        </div>

                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* --- EDIT PLEDGE DIALOG --- */}
      <Dialog open={!!editingPledge} onOpenChange={(open) => !open && setEditingPledge(null)}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden shadow-2xl border-none rounded-2xl">
          <div className="bg-slate-900 p-6 text-white relative overflow-hidden text-left">
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <ShieldCheck className="h-32 w-32 -rotate-12" />
             </div>
             <div className="relative z-10 flex gap-4 items-center">
                <Avatar className="h-16 w-16 border-2 border-white/20 shadow-lg">
                   <AvatarImage src={editingPledge?.recipientAvatar} />
                   <AvatarFallback>GH</AvatarFallback>
                </Avatar>
                <div>
                   <DialogTitle className="text-xl font-bold text-white">{editingPledge?.recipientName}</DialogTitle>
                   <DialogDescription className="text-slate-400 text-sm mt-0.5">Update your commitment</DialogDescription>
                </div>
             </div>
             <button onClick={() => setEditingPledge(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
             </button>
          </div>

          <div className="flex flex-col h-full bg-slate-50 text-left">
             {!isPauseOpen ? (
                // --- EDIT VIEW ---
                <>
                   <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 gap-5">
                         <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Amount</Label>
                            <div className="relative">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                               <Input 
                                  type="number" 
                                  value={editForm.amount} 
                                  onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value)})}
                                  className="pl-8 text-lg font-bold text-slate-900 bg-white shadow-sm h-11"
                               />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Frequency</Label>
                            <Select value={editForm.frequency} onValueChange={(v) => setEditForm({...editForm, frequency: v})}>
                               <SelectTrigger className="bg-white shadow-sm h-11">
                                 <SelectValue placeholder="Select frequency" />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="Monthly">Monthly</SelectItem>
                                 <SelectItem value="Quarterly">Quarterly</SelectItem>
                                 <SelectItem value="Annually">Annually</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                      </div>

                      {/* Payment Method Display in Edit (Read Only / Trigger Move) */}
                      <div className="space-y-2">
                         <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Payment Method</Label>
                         <div 
                            className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
                            onClick={() => editingPledge && handleOpenMove(editingPledge)}
                         >
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 p-1.5 rounded text-slate-600">
                                    <CreditCard className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900">
                                        {wallets.find(w => w.id === editingPledge?.paymentMethodId)?.brand} ••{wallets.find(w => w.id === editingPledge?.paymentMethodId)?.last4}
                                    </p>
                                    <p className="text-[10px] text-slate-500">Click to change method</p>
                                </div>
                            </div>
                            <ArrowRightLeft className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                         </div>
                      </div>

                      {/* Status Control */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                         <div>
                            <span className="text-sm font-bold text-slate-900 block">Pledge Status</span>
                            <span className="text-xs text-slate-500">
                               {editingPledge?.status === 'Active' ? 'Currently active and processing.' : `Paused until ${editingPledge?.pausedUntil}`}
                            </span>
                         </div>
                         {editingPledge?.status === 'Active' ? (
                            <Button size="sm" variant="outline" onClick={() => setIsPauseOpen(true)} className="text-amber-600 hover:bg-amber-50 hover:text-amber-700 border-amber-200">
                               <PauseCircle className="mr-2 h-4 w-4" /> Pause
                            </Button>
                         ) : (
                            <Button size="sm" onClick={() => handleResumePledge(editingPledge!.id)} className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm">
                               <PlayCircle className="mr-2 h-4 w-4" /> Resume
                            </Button>
                         )}
                      </div>
                   </div>

                   <div className="p-6 bg-white border-t border-slate-200 flex justify-between items-center">
                      <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2" onClick={() => handleStopPledge(editingPledge!.id)}>Stop Support</Button>
                      <div className="flex gap-3">
                         <Button variant="outline" onClick={() => setEditingPledge(null)}>Cancel</Button>
                         <Button onClick={handleSaveChanges} className="bg-slate-900 text-white shadow-md">Save Changes</Button>
                      </div>
                   </div>
                </>
             ) : (
                // --- PAUSE VIEW ---
                <motion.div 
                   initial={{ opacity: 0, x: 20 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   className="flex flex-col h-full"
                >
                   <div className="p-6 flex-1 space-y-6">
                      <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                         <PauseCircle className="h-5 w-5" />
                         <span className="font-bold text-sm">Pause Pledge</span>
                      </div>
                      
                      <div className="space-y-4">
                         <Label className="text-sm font-medium text-slate-700">How long would you like to pause?</Label>
                         <div className="grid grid-cols-2 gap-3">
                            {['1', '3', '6'].map(m => (
                               <div 
                                  key={m}
                                  onClick={() => { setPauseDuration(m); setCustomResumeDate(''); }}
                                  className={cn(
                                     "cursor-pointer p-4 rounded-xl border text-center transition-all hover:shadow-md",
                                     pauseDuration === m && !customResumeDate 
                                        ? "bg-amber-50 border-amber-500 text-amber-900 font-bold ring-1 ring-amber-500" 
                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                  )}
                               >
                                  {m} Month{m !== '1' && 's'}
                               </div>
                            ))}
                            <div 
                               onClick={() => { setPauseDuration(''); }}
                               className={cn(
                                  "cursor-pointer p-4 rounded-xl border text-center transition-all hover:shadow-md flex flex-col justify-center",
                                  customResumeDate 
                                     ? "bg-amber-50 border-amber-500 text-amber-900 font-bold ring-1 ring-amber-500" 
                                     : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                               )}
                            >
                               <span className="text-sm">Specific Date</span>
                               {customResumeDate && <span className="text-xs mt-1">{customResumeDate}</span>}
                            </div>
                         </div>

                         {pauseDuration === '' && (
                            <div className="pt-2 animate-in fade-in slide-in-from-top-2">
                               <Label className="mb-2 block text-xs uppercase font-bold text-slate-500">Resume Date</Label>
                               <Input 
                                  type="date" 
                                  min={format(addMonths(new Date(), 1), 'yyyy-MM-dd')}
                                  onChange={(e) => setCustomResumeDate(e.target.value)}
                                  className="bg-white"
                               />
                            </div>
                         )}
                         
                         {!customResumeDate && (
                            <p className="text-xs text-slate-500 text-center bg-slate-100 p-3 rounded-lg">
                               Pledge will automatically resume on <strong>{format(addMonths(new Date(), parseInt(pauseDuration || '0')), 'MMMM d, yyyy')}</strong>.
                            </p>
                         )}
                      </div>
                   </div>

                   <div className="p-6 bg-white border-t border-slate-200 flex justify-between items-center">
                      <Button variant="ghost" onClick={() => setIsPauseOpen(false)}>Back</Button>
                      <Button onClick={handlePausePledge} disabled={pauseDuration === '' && !customResumeDate} className="bg-amber-600 hover:bg-amber-700 text-white shadow-md">
                         Confirm Pause
                      </Button>
                   </div>
                </motion.div>
             )}
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MOVE / ADD PAYMENT DIALOG --- */}
      <Dialog open={!!movingPledge} onOpenChange={(open) => !open && setMovingPledge(null)}>
         <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden shadow-2xl border-none rounded-2xl max-h-[90vh] overflow-y-auto text-left">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 z-10">
               <div>
                  <DialogTitle className="text-lg font-bold text-slate-900">
                     {moveView === 'select' ? 'Move Pledge' : 'Add New Payment Method'}
                  </DialogTitle>
                  <DialogDescription className="text-xs mt-1">
                     {moveView === 'select' ? `Select a payment method for ${movingPledge?.recipientName}.` : 'Enter your new payment details securely.'}
                  </DialogDescription>
               </div>
               {moveView === 'add' && (
                  <Button variant="ghost" size="sm" onClick={() => setMoveView('select')} className="h-8 text-xs">
                     <ArrowLeft className="h-3 w-3 mr-1" /> Back
                  </Button>
               )}
            </div>

            <div className="p-6 bg-white min-h-[350px]">
               {moveView === 'select' ? (
                  <div className="space-y-4">
                     <div className="space-y-2">
                        {wallets.map(wallet => (
                           <div 
                              key={wallet.id}
                              onClick={() => setSelectedTargetId(wallet.id)}
                              className={cn(
                                 "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                                 selectedTargetId === wallet.id 
                                    ? "bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm" 
                                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              )}
                           >
                              <div className={cn(
                                 "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                                 selectedTargetId === wallet.id ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"
                              )}>
                                 {selectedTargetId === wallet.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              
                              <div className="bg-white border border-slate-200 p-1.5 rounded flex items-center justify-center w-10 h-7 shadow-sm">
                                 {wallet.type === 'card' ? <CreditCard className="h-4 w-4 text-slate-700" /> : <Landmark className="h-4 w-4 text-emerald-600" />}
                              </div>
                              
                              <div className="flex-1">
                                 <p className="text-sm font-bold text-slate-900">{wallet.brand} ••{wallet.last4}</p>
                                 <p className="text-[10px] text-slate-500">Expires 12/26</p>
                              </div>
                           </div>
                        ))}
                     </div>

                     <Button 
                        variant="outline" 
                        onClick={() => setMoveView('add')} 
                        className="w-full border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-all h-12"
                     >
                        <Plus className="h-4 w-4 mr-2" /> Add New Payment Method
                     </Button>
                  </div>
               ) : (
                  <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                     
                     {/* Type Selector */}
                     <div className="flex p-1 bg-slate-100 rounded-lg">
                        <button
                           onClick={() => setNewMethodType('card')}
                           className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2",
                              newMethodType === 'card' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                           )}
                        >
                           <CreditCard className="h-3.5 w-3.5" /> Credit Card
                        </button>
                        <button
                           onClick={() => setNewMethodType('bank')}
                           className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-2",
                              newMethodType === 'bank' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                           )}
                        >
                           <Landmark className="h-3.5 w-3.5" /> Bank Account
                        </button>
                     </div>

                     {newMethodType === 'card' ? (
                        /* CREDIT CARD FORM */
                        <div className="space-y-5">
                           <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Card Number</Label>
                              <div className="relative">
                                 <CreditCard className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                 <Input 
                                    placeholder="0000 0000 0000 0000" 
                                    className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all font-mono" 
                                    value={newCard.number}
                                    onChange={(e) => setNewCard({...newCard, number: e.target.value})}
                                 />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Expiry</Label>
                                 <Input 
                                    placeholder="MM/YY" 
                                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white text-center font-mono" 
                                    value={newCard.expiry}
                                    onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                                 />
                              </div>
                              <div className="space-y-2">
                                 <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">CVC</Label>
                                 <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 h-3 w-3 text-slate-400" />
                                    <Input 
                                       placeholder="123" 
                                       className="pl-8 h-11 bg-slate-50 border-slate-200 focus:bg-white text-center font-mono" 
                                       value={newCard.cvc}
                                       onChange={(e) => setNewCard({...newCard, cvc: e.target.value})}
                                    />
                                 </div>
                              </div>
                           </div>
                        </div>
                     ) : (
                        /* BANK ACCOUNT FORM */
                        <div className="space-y-5">
                           <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Account Holder Name</Label>
                              <Input 
                                 placeholder="Full Name on Account" 
                                 className="h-11 bg-slate-50 border-slate-200 focus:bg-white" 
                                 value={newBank.holderName}
                                 onChange={(e) => setNewBank({...newBank, holderName: e.target.value})}
                              />
                           </div>
                           <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Routing Number</Label>
                              <div className="relative">
                                 <Landmark className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                 <Input 
                                    placeholder="9 Digit Routing" 
                                    className="pl-9 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all font-mono" 
                                    value={newBank.routing}
                                    onChange={(e) => setNewBank({...newBank, routing: e.target.value})}
                                 />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Account Number</Label>
                              <Input 
                                 placeholder="Account Number" 
                                 className="h-11 bg-slate-50 border-slate-200 focus:bg-white font-mono" 
                                 value={newBank.account}
                                 onChange={(e) => setNewBank({...newBank, account: e.target.value})}
                              />
                           </div>
                           <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100">
                              <p>By providing your bank information, you authorize Orchids to debit your account for this pledge.</p>
                           </div>
                        </div>
                     )}

                     <Separator />

                     {/* Billing Address Section */}
                     <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <Label className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-2">
                              <MapPin className="h-3 w-3" /> Billing Address
                           </Label>
                           <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-600">Use profile address?</span>
                              <Switch 
                                 checked={useProfileAddress}
                                 onCheckedChange={setUseProfileAddress}
                              />
                           </div>
                        </div>

                        {useProfileAddress ? (
                           <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600 flex items-start gap-2">
                              <Check className="h-4 w-4 text-emerald-500 mt-0.5" />
                              <span>{profileAddress}</span>
                           </div>
                        ) : (
                           <div className="space-y-3 animate-in slide-in-from-top-2 fade-in">
                              <Input 
                                 placeholder="Street Address" 
                                 className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                                 value={billingAddress.street}
                                 onChange={(e) => setBillingAddress({...billingAddress, street: e.target.value})}
                              />
                              <div className="grid grid-cols-2 gap-3">
                                 <Input 
                                    placeholder="City" 
                                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                                    value={billingAddress.city}
                                    onChange={(e) => setBillingAddress({...billingAddress, city: e.target.value})}
                                 />
                                 <Input 
                                    placeholder="State" 
                                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                                    value={billingAddress.state}
                                    onChange={(e) => setBillingAddress({...billingAddress, state: e.target.value})}
                                 />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                 <Input 
                                    placeholder="Zip Code" 
                                    className="h-10 bg-slate-50 border-slate-200 focus:bg-white"
                                    value={billingAddress.zip}
                                    onChange={(e) => setBillingAddress({...billingAddress, zip: e.target.value})}
                                 />
                                 <Select value={billingAddress.country} onValueChange={(v) => setBillingAddress({...billingAddress, country: v})}>
                                   <SelectTrigger className="h-10 bg-slate-50 border-slate-200 focus:bg-white">
                                     <SelectValue placeholder="Country" />
                                   </SelectTrigger>
                                   <SelectContent>
                                     <SelectItem value="USA">USA</SelectItem>
                                     <SelectItem value="CAN">Canada</SelectItem>
                                     <SelectItem value="UK">UK</SelectItem>
                                   </SelectContent>
                                 </Select>
                              </div>
                           </div>
                        )}
                     </div>

                     <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" /> Securely encrypted by Stripe
                     </div>
                  </div>
               )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-between items-center sticky bottom-0 z-10">
               <Button variant="ghost" onClick={() => setMovingPledge(null)}>Cancel</Button>
               {moveView === 'select' ? (
                  <Button onClick={handleConfirmMove} disabled={!selectedTargetId} className="bg-slate-900 text-white shadow-md">
                     Confirm Move
                  </Button>
               ) : (
                  <Button onClick={handleSaveNewMethod} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                     Save & Use {newMethodType === 'card' ? 'Card' : 'Account'}
                  </Button>
               )}
            </div>
         </DialogContent>
      </Dialog>

    </div>
  );
}
