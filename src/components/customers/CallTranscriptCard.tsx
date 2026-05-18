'use client'

import { useState } from 'react'
import { Phone, MessageSquare, ChevronDown, ChevronUp, Play, Download } from 'lucide-react'
import { CallLog } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface CallTranscriptCardProps {
  call: CallLog
}

export function CallTranscriptCard({ call }: CallTranscriptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const channel = call.channel || 'VOICE'
  const duration = call.duration || call.duration_seconds || 0
  const intent = call.intent || call.summary || 'Customer Inquiry'
  const sentiment = call.sentiment || 'POSITIVE'
  const dateStr = call.createdAt || call.started_at || call.created_at || new Date().toISOString()
  
  // Cleanly parse transcript string or JSONB array format
  const transcriptStr = typeof call.transcript === 'string'
    ? call.transcript
    : (Array.isArray(call.transcript)
        ? call.transcript.map((t: any) => `${t.role === 'assistant' ? 'AI' : 'Customer'}: ${t.text}`).join('. ')
        : '')

  return (
    <Card className="bg-surface border-border overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface2/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-2 rounded-lg",
            channel === 'VOICE' ? "bg-violet-500/10 text-violet-500" : "bg-emerald-500/10 text-emerald-500"
          )}>
            {channel === 'VOICE' ? <Phone className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-primary">{intent}</span>
              {call.orderCreated && (
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] h-4">ORDER CREATED</Badge>
              )}
            </div>
            <p className="text-xs text-text-muted">
              {format(new Date(dateStr), 'MMM d, yyyy · h:mm a')} · {Math.floor(duration / 60)}m {duration % 60}s
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={cn(
            "text-[10px] uppercase font-bold tracking-widest",
            sentiment === 'POSITIVE' ? "text-emerald-500 border-emerald-500/20" : 
            sentiment === 'NEGATIVE' ? "text-red-500 border-red-500/20" : "text-text-muted border-border"
          )}>
            {sentiment}
          </Badge>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-text-muted" /> : <ChevronDown className="w-4 h-4 text-text-muted" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-border animate-in slide-in-from-top-2 duration-200">
          <div className="bg-surface2 rounded-xl p-4 mt-4 relative">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary">
                  <Play className="w-4 h-4 fill-primary" />
                </Button>
                <div className="h-1.5 w-32 bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-1/3" />
                </div>
                <span className="text-[10px] font-mono text-text-muted">0:45 / 2:22</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-text-muted hover:text-text-primary">
                <Download className="w-3 h-3 mr-1" /> Download
              </Button>
            </div>

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
              {transcriptStr ? transcriptStr.split('. ').map((line, i) => {
                const isAI = line.startsWith('AI:') || line.startsWith('assistant:')
                const cleanLine = line.replace('AI: ', '').replace('Customer: ', '').replace('assistant: ', '').replace('user: ', '')
                if (!cleanLine.trim()) return null
                return (
                  <div key={i} className={cn("flex flex-col", isAI ? "items-start" : "items-end")}>
                    <span className="text-[10px] font-bold text-text-muted uppercase mb-1">
                      {isAI ? 'Guileo AI' : 'Customer'}
                    </span>
                    <div className={cn(
                      "px-3 py-2 rounded-2xl text-sm max-w-[80%]",
                      isAI ? "bg-primary/10 text-text-primary rounded-tl-none border border-primary/20" : "bg-surface text-text-primary rounded-tr-none border border-border"
                    )}>
                      {cleanLine}
                    </div>
                  </div>
                )
              }) : (
                <p className="text-xs text-text-muted italic text-center py-4">No transcript text available.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
