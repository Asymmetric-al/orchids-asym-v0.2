'use client'

import React from 'react'
import Link from 'next/link'
import { type ColumnDef } from '@tanstack/react-table'
import { ChevronRight, ArrowUpDown } from 'lucide-react'

import { CarePersonnel } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DataTable, DataTableColumnHeader, type DataTableFilterField } from '@/components/ui/data-table'
import { cn } from '@/lib/utils'

interface PersonnelListProps {
  data: CarePersonnel[]
}

const columns: ColumnDef<CarePersonnel>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Personnel" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10 border border-border shadow-sm">
          <AvatarImage src={row.original.avatarUrl} />
          <AvatarFallback className="text-[10px] font-semibold bg-primary text-primary-foreground">
            {row.original.initials}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-0.5">
          <div className="font-semibold text-sm text-foreground tracking-tight">{row.original.name}</div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{row.original.role}</div>
        </div>
      </div>
    ),
    meta: {
      label: "Personnel",
    },
  },
  {
    accessorKey: 'region',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Region" />,
    cell: ({ row }) => (
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {row.original.region}
      </span>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: {
      label: "Region",
      filterVariant: "select",
      filterOptions: [
        { label: "Africa", value: "Africa" },
        { label: "SE Asia", value: "SE Asia" },
        { label: "Europe", value: "Europe" },
        { label: "Latin America", value: "Latin America" },
        { label: "Middle East", value: "Middle East" },
        { label: "North America", value: "North America" },
      ],
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => (
      <Badge 
        variant="outline" 
        className={cn(
          "text-[9px] font-semibold h-6 uppercase tracking-wider px-3 rounded-full border-transparent shadow-none",
          row.original.status === 'Healthy' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" :
          row.original.status === 'At Risk' ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400" :
          row.original.status === 'Crisis' ? "bg-destructive text-destructive-foreground shadow-lg" :
          "bg-secondary text-secondary-foreground"
        )}
      >
        {row.original.status}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: {
      label: "Status",
      filterVariant: "select",
      filterOptions: [
        { label: "Healthy", value: "Healthy" },
        { label: "Needs Attention", value: "Needs Attention" },
        { label: "At Risk", value: "At Risk" },
        { label: "Crisis", value: "Crisis" },
      ],
    },
  },
  {
    accessorKey: 'lastCheckIn',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Check-in" />,
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {new Date(row.original.lastCheckIn).toLocaleDateString()}
      </div>
    ),
    meta: {
      label: "Last Check-in",
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <Link href={`/mc/care/directory/${row.original.id}`}>
        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted transition-all text-muted-foreground hover:text-foreground">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </Link>
    ),
  },
]

const filterFields: DataTableFilterField<CarePersonnel>[] = [
  {
    id: 'status',
    label: 'Status',
    variant: 'select',
    options: [
      { label: "Healthy", value: "Healthy" },
      { label: "Needs Attention", value: "Needs Attention" },
      { label: "At Risk", value: "At Risk" },
      { label: "Crisis", value: "Crisis" },
    ],
  },
  {
    id: 'region',
    label: 'Region',
    variant: 'select',
    options: [
      { label: "Africa", value: "Africa" },
      { label: "SE Asia", value: "SE Asia" },
      { label: "Europe", value: "Europe" },
      { label: "Latin America", value: "Latin America" },
      { label: "Middle East", value: "Middle East" },
      { label: "North America", value: "North America" },
    ],
  },
]

export function PersonnelList({ data }: PersonnelListProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      filterFields={filterFields}
      searchKey="name"
      searchPlaceholder="Search personnel..."
      config={{
        enableRowSelection: false,
        enableColumnVisibility: true,
        enablePagination: true,
        enableFilters: true,
        enableSorting: true,
      }}
    />
  )
}
