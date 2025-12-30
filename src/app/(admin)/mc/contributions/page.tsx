'use client'

import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { 
  DollarSign, FileDown, Mail, MapPin, Phone, Briefcase
} from 'lucide-react'
import { CheckCircle2, RefreshCcw, Download, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DataTable, type DataTableFilterField } from '@/components/ui/data-table'
import { cn, formatCurrency, getInitials } from '@/lib/utils'

import { getColumns } from './columns'
import { TRANSACTIONS_DATA, DONOR_PROFILES } from './data'
import type { Transaction, DonorProfile } from './types'

const filterFields: DataTableFilterField<Transaction>[] = [
  {
    id: 'status',
    label: 'Status',
    variant: 'select',
    options: [
      { label: 'Succeeded', value: 'Succeeded' },
      { label: 'Pending', value: 'Pending' },
      { label: 'Failed', value: 'Failed' },
      { label: 'Refunded', value: 'Refunded' },
    ],
  },
  {
    id: 'frequency',
    label: 'Frequency',
    variant: 'select',
    options: [
      { label: 'One-Time', value: 'One-Time' },
      { label: 'Monthly', value: 'Monthly' },
      { label: 'Annual', value: 'Annual' },
    ],
  },
  {
    id: 'source',
    label: 'Source',
    variant: 'select',
    options: [
      { label: 'Web', value: 'Web' },
      { label: 'Mobile App', value: 'Mobile App' },
      { label: 'Admin Entry', value: 'Admin Entry' },
    ],
  },
]

export default function ContributionsHub() {
  const [selectedDonorProfile, setSelectedDonorProfile] = useState<DonorProfile | null>(null)
  
  const columns = useMemo(
    () => getColumns({ onViewDonor: setSelectedDonorProfile }),
    []
  )

  const totalVolume = useMemo(
    () => TRANSACTIONS_DATA.reduce((sum, row) => sum + (row.status === 'Succeeded' ? row.amountGross : 0), 0),
    []
  )
  const totalNet = useMemo(
    () => TRANSACTIONS_DATA.reduce((sum, row) => sum + (row.status === 'Succeeded' ? row.amountNet : 0), 0),
    []
  )
  const totalFees = useMemo(
    () => TRANSACTIONS_DATA.reduce((sum, row) => sum + (row.status === 'Succeeded' ? row.fee : 0), 0),
    []
  )
  const successCount = useMemo(
    () => TRANSACTIONS_DATA.filter(r => r.status === 'Succeeded').length,
    []
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Contributions Hub</h1>
          <p className="text-muted-foreground mt-1">Financial oversight and transaction management.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl">
            <FileDown className="mr-2 h-4 w-4" /> Reports
          </Button>
          <Button className="rounded-xl">
            <DollarSign className="mr-2 h-4 w-4" /> Manual Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Volume</p>
            <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{formatCurrency(totalVolume)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-chart-2 uppercase tracking-wider">Net Revenue</p>
            <div className="text-2xl font-bold text-chart-2 mt-1 tabular-nums">{formatCurrency(totalNet)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Processing Fees</p>
            <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{formatCurrency(totalFees)}</div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Successful Txns</p>
            <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{successCount} <span className="text-sm font-normal text-muted-foreground">/ {TRANSACTIONS_DATA.length}</span></div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={TRANSACTIONS_DATA}
        filterFields={filterFields}
        searchKey="donorName"
        searchPlaceholder="Search by donor name or email..."
        config={{
          enableRowSelection: true,
          enableColumnVisibility: true,
          enablePagination: true,
          enableFilters: true,
          enableSorting: true,
        }}
        actionBarActions={[
          {
            label: "Export",
            icon: Download,
            onClick: (rows) => console.log("Export:", rows),
          },
          {
            label: "Re-Receipt",
            icon: RefreshCcw,
            onClick: (rows) => console.log("Re-receipt:", rows),
          },
          {
            label: "Delete",
            icon: Trash2,
            onClick: (rows) => console.log("Delete:", rows),
            variant: "destructive",
          },
        ]}
        initialState={{
          sorting: [{ id: 'date', desc: true }],
          columnVisibility: {
            frequency: false,
            source: false,
          },
        }}
      />

      <Sheet open={!!selectedDonorProfile} onOpenChange={(open) => !open && setSelectedDonorProfile(null)}>
        <SheetContent className="w-full sm:max-w-2xl p-0 bg-background">
          {selectedDonorProfile && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="bg-card border-b border-border p-8 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-6">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                      <AvatarImage src={selectedDonorProfile.avatar} />
                      <AvatarFallback>{getInitials(selectedDonorProfile.name)}</AvatarFallback>
                    </Avatar>
                    <div className="pt-2">
                      <h2 className="text-2xl font-bold text-foreground">{selectedDonorProfile.name}</h2>
                      <div className="flex items-center gap-2 text-muted-foreground mt-1">
                        <Mail className="h-4 w-4" /> {selectedDonorProfile.email}
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Badge variant="secondary" className="bg-chart-1/10 text-chart-1 rounded-lg shadow-none">
                          {selectedDonorProfile.status} Partner
                        </Badge>
                        <Badge variant="outline" className="bg-card text-muted-foreground rounded-lg shadow-none">
                          Partner since {format(new Date(selectedDonorProfile.firstGiftDate), 'yyyy')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl"><Phone className="h-4 w-4" /></Button>
                </div>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="bg-transparent h-auto p-0 gap-8 border-none">
                    <TabsTrigger value="overview" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary transition-all">Overview</TabsTrigger>
                    <TabsTrigger value="giving" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary transition-all">Giving History</TabsTrigger>
                    <TabsTrigger value="activity" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-primary transition-all">Activity</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <ScrollArea className="flex-1 p-8">
                <div className="space-y-8">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="p-4 rounded-xl">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Lifetime Value</p>
                      <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(selectedDonorProfile.lifetimeValue)}</p>
                    </Card>
                    <Card className="p-4 rounded-xl">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Total Gifts</p>
                      <p className="text-xl font-bold text-foreground mt-1">{selectedDonorProfile.giftCount}</p>
                    </Card>
                    <Card className="p-4 rounded-xl">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Last Gift</p>
                      <p className="text-xl font-bold text-foreground mt-1">{format(new Date(selectedDonorProfile.lastGiftDate), 'MMM d')}</p>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Partner Biography</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed bg-card p-4 rounded-xl border border-border shadow-sm italic">
                      &quot;{selectedDonorProfile.bio}&quot;
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Contact Info</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4 text-muted-foreground/70" /> {selectedDonorProfile.phone}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-muted-foreground/70" /> {selectedDonorProfile.address}, {selectedDonorProfile.city}, {selectedDonorProfile.state}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Designations</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedDonorProfile.fundsSupported.map(fund => (
                          <Badge key={fund} variant="secondary" className="bg-secondary text-secondary-foreground rounded-lg shadow-none">{fund}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-6 bg-card border-t border-border flex justify-end gap-3">
                <Button variant="outline" className="rounded-xl" onClick={() => setSelectedDonorProfile(null)}>Close</Button>
                <Button className="rounded-xl">Full Profile Record</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
