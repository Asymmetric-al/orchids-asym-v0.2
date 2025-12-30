'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { 
  CheckCircle2, XCircle, Clock, RefreshCcw, 
  Globe, Smartphone, Monitor, MoreHorizontal
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { cn, formatCurrency, getInitials } from '@/lib/utils'
import type { Transaction, DonorProfile } from './types'
import { DONOR_PROFILES } from './data'

interface ColumnOptions {
  onViewDonor: (profile: DonorProfile) => void
}

export function getColumns({ onViewDonor }: ColumnOptions): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: "id",
      header: "Txn ID",
      cell: ({ row }) => (
        <div className="flex flex-col text-left">
          <span className="font-mono text-xs text-muted-foreground">{row.getValue("id")}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            {row.original.source === 'Web' && <Globe className="h-3 w-3 text-muted-foreground/70" />}
            {row.original.source === 'Mobile App' && <Smartphone className="h-3 w-3 text-muted-foreground/70" />}
            {row.original.source === 'Admin Entry' && <Monitor className="h-3 w-3 text-muted-foreground/70" />}
            <span className="text-[10px] text-muted-foreground/70">{row.original.source}</span>
          </div>
        </div>
      ),
      size: 140,
      meta: {
        label: "Transaction ID",
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
      cell: ({ row }) => (
        <span className="text-sm font-medium text-foreground whitespace-nowrap block text-left">
          {format(new Date(row.getValue("date")), "MMM d, yyyy HH:mm")}
        </span>
      ),
      size: 160,
      meta: {
        label: "Date",
      },
    },
    {
      accessorKey: "donorName",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Donor" />,
      cell: ({ row }) => {
        const name = row.getValue("donorName") as string
        const profile = DONOR_PROFILES[name]
        
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={profile?.avatar} />
              <AvatarFallback className="text-[10px] font-semibold bg-primary text-primary-foreground">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <button 
                onClick={() => profile && onViewDonor(profile)}
                className="font-semibold text-sm text-foreground leading-none hover:text-primary hover:underline decoration-primary/30 underline-offset-4 transition-all text-left"
              >
                {name}
              </button>
              <span className="text-xs text-muted-foreground mt-0.5">{profile?.email}</span>
            </div>
          </div>
        )
      },
      meta: {
        label: "Donor",
      },
    },
    {
      accessorKey: "designation",
      header: "Details",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-left">
          <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground font-medium w-fit max-w-[150px] truncate shadow-none rounded-lg">
            {row.getValue("designation")}
          </Badge>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground font-medium">{row.original.frequency}</span>
            {row.original.frequency === 'Monthly' && <span className="h-1.5 w-1.5 rounded-full bg-chart-1" />}
          </div>
        </div>
      ),
      meta: {
        label: "Designation",
        filterVariant: "select",
      },
    },
    {
      accessorKey: "amountGross",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader column={column} title="Gross" className="justify-end" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex flex-col items-end">
          <div className="text-right font-mono font-bold text-foreground">{formatCurrency(row.getValue("amountGross"))}</div>
          <div className="flex items-center gap-1 mt-0.5">
            {row.original.brand === 'Visa' && <div className="h-2 w-3 bg-blue-800 rounded-[1px]" />}
            {row.original.brand === 'Mastercard' && <div className="h-2 w-3 bg-orange-600 rounded-[1px]" />}
            <span className="text-[10px] text-muted-foreground">{row.original.brand || row.original.method} ••{row.original.last4?.slice(-2)}</span>
          </div>
        </div>
      ),
      meta: {
        label: "Amount",
      },
    },
    {
      accessorKey: "fee",
      header: () => <div className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fee</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono text-xs text-muted-foreground">
          -{formatCurrency(row.getValue("fee"))}
        </div>
      ),
      meta: {
        label: "Fee",
      },
    },
    {
      accessorKey: "amountNet",
      header: () => <div className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Net</div>,
      cell: ({ row }) => (
        <div className="text-right font-mono text-sm font-bold text-chart-2">
          {formatCurrency(row.getValue("amountNet"))}
        </div>
      ),
      meta: {
        label: "Net",
      },
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      enableHiding: true,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      meta: {
        label: "Frequency",
        filterVariant: "select",
        filterOptions: [
          { label: "One-Time", value: "One-Time" },
          { label: "Monthly", value: "Monthly" },
          { label: "Annual", value: "Annual" },
        ],
      },
    },
    {
      accessorKey: "source",
      header: "Source",
      enableHiding: true,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      meta: {
        label: "Source",
        filterVariant: "select",
        filterOptions: [
          { label: "Web", value: "Web" },
          { label: "Mobile App", value: "Mobile App" },
          { label: "Admin Entry", value: "Admin Entry" },
        ],
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        let color = "bg-secondary text-secondary-foreground"
        let Icon = Clock
        if (status === 'Succeeded') { color = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"; Icon = CheckCircle2 }
        if (status === 'Pending') { color = "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"; Icon = Clock }
        if (status === 'Failed') { color = "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"; Icon = XCircle }
        if (status === 'Refunded') { color = "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400"; Icon = RefreshCcw }
        
        return (
          <Badge variant="outline" className={cn("text-[10px] uppercase font-semibold tracking-wide pl-1.5 pr-2.5 py-0.5 h-6 gap-1.5 shadow-none rounded-lg border-transparent", color)}>
            <Icon className="h-3 w-3" />
            {status}
          </Badge>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      meta: {
        label: "Status",
        filterVariant: "select",
        filterOptions: [
          { label: "Succeeded", value: "Succeeded" },
          { label: "Pending", value: "Pending" },
          { label: "Failed", value: "Failed" },
          { label: "Refunded", value: "Refunded" },
        ],
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const profile = DONOR_PROFILES[row.original.donorName]
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-xl">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={() => navigator.clipboard.writeText(row.original.id)}
                  className="rounded-lg"
                >
                  Copy Transaction ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => profile && onViewDonor(profile)}
                  className="rounded-lg"
                >
                  View Donor Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg">Download Receipt</DropdownMenuItem>
                <DropdownMenuSeparator />
                {row.original.status === 'Succeeded' && (
                  <DropdownMenuItem className="text-destructive focus:text-destructive rounded-lg">
                    Refund Donation
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]
}
