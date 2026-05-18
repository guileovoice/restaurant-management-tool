import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ConsentBadgesProps {
  consents: {
    essential: boolean
    marketing: boolean
    intelligence: boolean
  }
}

export function ConsentBadges({ consents }: ConsentBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 py-1">
        <ShieldCheck className="w-3.5 h-3.5" /> Essential
      </Badge>
      <Badge className={cn(
        "gap-1.5 py-1",
        consents.marketing 
          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
          : "bg-surface2 text-text-muted border-border"
      )}>
        {consents.marketing ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldX className="w-3.5 h-3.5" />}
        Marketing
      </Badge>
      <Badge className={cn(
        "gap-1.5 py-1",
        consents.intelligence 
          ? "bg-violet-500/10 text-violet-500 border-violet-500/20" 
          : "bg-surface2 text-text-muted border-border"
      )}>
        {consents.intelligence ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldX className="w-3.5 h-3.5" />}
        Intelligence
      </Badge>
    </div>
  )
}
