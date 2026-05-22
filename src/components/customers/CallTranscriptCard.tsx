'use client'

import { useState } from 'react'
import { Phone, MessageSquare, ExternalLink } from 'lucide-react'
import { CallLog } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CallAnalysisDialog } from '@/components/shared/CallAnalysisDialog'

interface CallTranscriptCardProps {
  call: CallLog
}

export function CallTranscriptCard({ call }: CallTranscriptCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const channel = call.channel || 'VOICE'
  const durationSec = call.duration || call.duration_seconds || 0
  const intent = call.intent || call.summary || 'Customer Inquiry'
  const sentiment = call.sentiment || 'POSITIVE'
  const dateStr = call.createdAt || call.started_at || call.created_at || new Date().toISOString()

  return (
    <>
      <Card 
        className="bg-surface border-border overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-surface2/30 transition-all group"
        onClick={() => setIsDialogOpen(true)}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-2 rounded-lg transition-colors group-hover:bg-primary/10",
              channel === 'VOICE' ? "bg-violet-500/10 text-violet-500" : "bg-emerald-500/10 text-emerald-500"
            )}>
              {channel === 'VOICE' ? <Phone className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">
                  {intent}
                </span>
                {call.orderCreated && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] h-4">
                    ORDER CREATED
                  </Badge>
                )}
              </div>
              <p className="text-xs text-text-muted">
                {format(new Date(dateStr), 'MMM d, yyyy · h:mm a')} · {Math.floor(durationSec / 60)}m {durationSec % 60}s
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
            <ExternalLink className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
          </div>
        </div>
      </Card>

      <CallAnalysisDialog 
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        call={call}
      />
    </>
  )
}
