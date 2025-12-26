'use client';

import React from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender, 
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef
} from '@tanstack/react-table';
import { CarePersonnel } from '../types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreHorizontal, Search, ArrowUpDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface PersonnelListProps {
  data: CarePersonnel[];
}

export function PersonnelList({ data }: PersonnelListProps) {
  const [globalFilter, setGlobalFilter] = React.useState('');

  const columns = React.useMemo<ColumnDef<CarePersonnel>[]>(
    () => [
        {
          accessorKey: 'name',
          header: ({ column }) => (
            <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="-ml-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-transparent">
              Personnel
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          ),
          cell: ({ row }) => (
            <div className="flex items-center gap-4">
              <Avatar className="h-10 w-10 border border-zinc-100 shadow-sm">
                <AvatarImage src={row.original.avatarUrl} />
                <AvatarFallback className="text-[10px] font-black bg-zinc-900 text-white">{row.original.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <div className="font-black text-sm text-zinc-900 tracking-tight uppercase">{row.original.name}</div>
                <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{row.original.role}</div>
              </div>
            </div>
          ),
        },
        {
          accessorKey: 'region',
          header: 'Region',
          cell: ({ row }) => <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{row.original.region}</span>,
        },
        {
          accessorKey: 'status',
          header: 'Status',
          cell: ({ row }) => (
            <Badge 
              variant="outline" 
              className={cn(
                "text-[9px] font-black h-6 uppercase tracking-widest px-3 rounded-full border-none",
                row.original.status === 'Healthy' ? "bg-emerald-50 text-emerald-700" :
                row.original.status === 'At Risk' ? "bg-orange-50 text-orange-700" :
                row.original.status === 'Crisis' ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]" :
                "bg-zinc-50 text-zinc-700"
              )}
            >
              {row.original.status}
            </Badge>
          ),
        },
        {
          accessorKey: 'lastCheckIn',
          header: 'Last Check-in',
          cell: ({ row }) => (
            <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              {new Date(row.original.lastCheckIn).toLocaleDateString()}
            </div>
          ),
        },
        {
          id: 'actions',
          cell: ({ row }) => (
            <Link href={`/mc/care/directory/${row.original.id}`}>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-zinc-100 transition-all text-zinc-300 hover:text-zinc-900">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </Link>
          ),
        },
      ],
      []
    );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300" />
          <Input 
            placeholder="SEARCH PERSONNEL..." 
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="pl-12 h-12 text-[10px] font-black tracking-[0.1em] uppercase rounded-2xl bg-zinc-50 border-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="flex-1 sm:flex-none h-10 px-6 text-[10px] font-black uppercase tracking-widest border-zinc-100 rounded-xl">
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="flex-1 sm:flex-none h-10 px-6 text-[10px] font-black uppercase tracking-widest border-zinc-100 rounded-xl">
            Next
          </Button>
        </div>
      </div>

      <div className="rounded-[2rem] border border-zinc-100 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-zinc-50/50 border-b border-zinc-100">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-zinc-50/50 transition-all cursor-pointer group">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-8 py-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
