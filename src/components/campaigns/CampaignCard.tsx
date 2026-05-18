'use client'

import { Campaign } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  MessageSquare, 
  Phone, 
  Globe, 
  BarChart3, 
  Copy, 
  Trash2, 
  ArrowRight,
  TrendingUp,
  Users
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface CampaignCardProps {
  campaign: Campaign
}

const statusConfig = {
  DRAFT: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  SCHEDULED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  SENT: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  FAILED: 'bg-red-500/10 text-red-400 border-red-500/20'
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <Card className="bg-surface border-border overflow-hidden flex flex-col h-full group hover:border-primary/30 transition-all">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              campaign.channel === 'WHATSAPP' ? "bg-emerald-500/10 text-emerald-500" : "bg-violet-500/10 text-violet-500"
            )}>
              {campaign.channel === 'WHATSAPP' ? <MessageSquare className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary group-hover:text-primary transition-colors">{campaign.name}</h3>
              <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-0.5">
                {campaign.channel} · {campaign.status === 'SENT' ? `Sent ${format(new Date(campaign.sentAt!), 'MMM d')}` : `Scheduled ${format(new Date(campaign.scheduledAt!), 'MMM d')}`}
              </p>
            </div>
          </div>
          <Badge className={cn("text-[10px] uppercase font-bold tracking-widest", statusConfig[campaign.status])}>
            {campaign.status}
          </Badge>
        </div>

        <div className="bg-surface2/50 rounded-xl p-3 mb-6 border border-border/50">
          <p className="text-xs text-text-primary italic line-clamp-3">"{campaign.message}"</p>
        </div>

        {campaign.status === 'SENT' && (
          <div className="grid grid-cols-3 gap-4 mb-2">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Open Rate</p>
              <p className="text-lg font-bold text-text-primary">{campaign.openRate}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Conversions</p>
              <p className="text-lg font-bold text-text-primary">{campaign.conversionRate}%</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Revenue</p>
              <p className="text-lg font-bold text-emerald-500">${campaign.revenue}</p>
            </div>
          </div>
        )}

        {campaign.status === 'SCHEDULED' && (
          <div className="flex items-center gap-4 py-4">
            <div className="flex-1 space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Estimated Reach</p>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-text-primary">{campaign.recipientCount} people</span>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Segment</p>
              <Badge variant="outline" className="text-[10px] text-text-muted border-border font-bold uppercase tracking-widest">
                {campaign.segment}
              </Badge>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-surface2/30 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-text-muted hover:text-primary">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 text-text-muted hover:text-danger">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold text-primary uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
          {campaign.status === 'SENT' ? 'View Full Report' : 'Edit Campaign'} <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </Card>
  )
}
