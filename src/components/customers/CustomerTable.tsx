'use client'

import { 
  ColumnDef, 
  flexRender, 
  getCoreRowModel, 
  useReactTable, 
  getPaginationRowModel,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Phone, 
  MessageSquare, 
  Globe, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react'
import { Customer, Channel } from '@/lib/types'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const channelIcons = {
  VOICE: <Phone className="w-4 h-4 text-violet-400" />,
  WHATSAPP: <MessageSquare className="w-4 h-4 text-emerald-400" />,
  WEB: <Globe className="w-4 h-4 text-blue-400" />,
  SMS: <MessageSquare className="w-4 h-4 text-amber-400" />
}

const riskColors = {
  LOW: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  MEDIUM: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  HIGH: 'bg-red-500/10 text-red-500 border-red-500/20'
}

interface CustomerTableProps {
  data: Customer[]
}

export function CustomerTable({ data }: CustomerTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 font-bold uppercase text-[10px] tracking-widest text-text-muted"
        >
          Customer <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => {
        const customer = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">{customer.name}</p>
              <p className="text-[10px] text-text-muted font-mono">{customer.phone}</p>
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'totalOrders',
      header: ({ column }) => (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 font-bold uppercase text-[10px] tracking-widest text-text-muted"
        >
          Orders <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <Badge className="bg-surface2 text-text-primary border-border">{row.original.totalOrders}</Badge>
    },
    {
      accessorKey: 'totalSpent',
      header: 'Total Spent',
      cell: ({ row }) => <span className="font-bold text-text-primary">${(row.original.totalSpent || 0).toFixed(2)}</span>
    },
    {
      accessorKey: 'consents',
      header: 'Consent',
      cell: ({ row }) => {
        const { consents } = row.original
        return (
          <div className="flex gap-1.5">
            <div className={cn("p-1 rounded", consents.marketing ? "text-emerald-500 bg-emerald-500/10" : "text-text-muted bg-surface2")}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className={cn("p-1 rounded", consents.intelligence ? "text-violet-500 bg-violet-500/10" : "text-text-muted bg-surface2")}>
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
        )
      }
    },
    {
      accessorKey: 'churnRisk',
      header: 'Churn Risk',
      cell: ({ row }) => (
        <Badge className={riskColors[row.original.churnRisk]}>
          {row.original.churnRisk}
        </Badge>
      )
    },
    {
      accessorKey: 'preferredChannel',
      header: 'Channel',
      cell: ({ row }) => channelIcons[row.original.preferredChannel]
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary hover:bg-primary/10 font-bold uppercase text-[10px] tracking-widest"
          onClick={() => router.push(`/customers/${row.original.id}`)}
        >
          View Profile <ChevronRight className="ml-1 w-3 h-3" />
        </Button>
      )
    }
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    }
  })

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-surface2/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-12">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-border hover:bg-surface2/50 cursor-pointer transition-colors group"
                    onClick={() => router.push(`/customers/${row.original.id}`)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center text-text-muted">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-text-muted">
          Showing {table.getFilteredRowModel().rows.length} customers
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-border bg-surface"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-border bg-surface"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
