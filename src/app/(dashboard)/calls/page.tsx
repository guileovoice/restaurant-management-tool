'use client'

import { useState } from 'react'
import { 
  Phone, 
  MessageSquare, 
  Search, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  Filter,
  PlayCircle,
  FileText
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { CallAnalysisDialog } from '@/components/shared/CallAnalysisDialog'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabaseClient'
import { useEffect } from 'react'
import { GlobalDateFilter } from '@/components/shared/GlobalDateFilter'
import { useDateFilterStore } from '@/lib/stores/dateFilterStore'

export default function CallLogsPage() {
  const [callLogs, setCallLogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCall, setSelectedCall] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const { dateFilter, customStartDate, customEndDate, getDateRange } = useDateFilterStore()

  useEffect(() => {
    async function fetchCalls() {
      try {
        let query = supabase
          .from('vapi_call_logs')
          .select('*')
          .order('started_at', { ascending: false })

        const { startDate, endDate } = getDateRange()
        
        if (startDate) {
          query = query.gte('started_at', startDate.toISOString())
        }
        if (endDate) {
          query = query.lt('started_at', endDate.toISOString())
        }

        const { data, error } = await query
        if (error) {
          console.error("Error fetching call logs:", error)
        } else if (data) {
          setCallLogs(data)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCalls()
  }, [dateFilter, customStartDate, customEndDate])

  const filteredLogs = callLogs.filter(log => 
    ((log.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
     (log.customer_phone || '').includes(searchQuery))
  )

  const totalDuration = callLogs.reduce((acc, c) => acc + c.duration_seconds, 0)
  const avgDuration = callLogs.length > 0 ? totalDuration / callLogs.length : 0

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Call & Message Logs" 
        subtitle="Review AI agent interactions and performance metrics from Vapi."
        actions={
          <div className="flex items-center">
            <GlobalDateFilter />
          </div>
        }
      />

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-5 bg-surface border-border">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Calls Today</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-text-primary">{callLogs.length}</h3>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Phone className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-surface border-border">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Total Cost (USD)</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-text-primary">
              ${callLogs.reduce((acc, call) => acc + call.cost_usd, 0).toFixed(2)}
            </h3>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-surface border-border">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Successful Calls</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-text-primary">
              {callLogs.filter(c => c.status === 'completed').length}
            </h3>
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-500">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-5 bg-surface border-border">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] mb-1">Avg Duration</p>
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-text-primary">
              {Math.floor(avgDuration / 60)}m {Math.floor(avgDuration % 60)}s
            </h3>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex flex-wrap gap-4 items-center justify-between bg-surface2/30">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <Input 
                placeholder="Search logs by customer..." 
                className="pl-10 bg-surface2 border-border h-10" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] bg-surface2 border-border h-10">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-surface border-border">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" size="icon" className="h-10 w-10 border border-border bg-surface2 text-text-muted">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-surface2/50">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-text-muted h-12">Customer</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-text-muted h-12">Time</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-text-muted h-12">Duration</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-text-muted h-12">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-text-muted h-12">Cost</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-widest text-text-muted h-12">Summary</TableHead>
                <TableHead className="h-12 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow 
                  key={log.id} 
                  className="border-border hover:bg-surface2/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedCall(log)}
                >
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {log.customer_name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">{log.customer_name || 'Unknown'}</p>
                        <p className="text-[10px] text-text-muted">{log.customer_phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-text-muted">
                    {format(new Date(log.started_at), 'MMM d, h:mm a')}
                  </TableCell>
                  <TableCell className="text-xs text-text-primary font-mono">
                    {Math.floor(log.duration_seconds / 60)}m {Math.floor(log.duration_seconds % 60)}s
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      "text-[10px] font-bold uppercase border-none",
                      log.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" : 
                      log.status === 'missed' ? "bg-danger/10 text-danger" : "bg-amber-500/10 text-amber-500"
                    )}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-text-primary">
                    ${log.cost_usd.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <p className="text-xs text-text-muted line-clamp-1 max-w-[200px] italic">
                      {log.summary || 'No summary available'}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10 text-[10px] font-bold uppercase tracking-widest">
                      Details <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Call Detail Modal */}
      <CallAnalysisDialog 
        isOpen={!!selectedCall}
        onClose={() => setSelectedCall(null)}
        call={selectedCall}
      />
    </div>
  )
}
