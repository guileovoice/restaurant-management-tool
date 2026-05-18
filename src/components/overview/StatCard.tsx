import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  change: number
  trend: 'up' | 'down'
  color: 'violet' | 'amber' | 'emerald' | 'blue' | 'red'
}

const colorMap = {
  violet: 'bg-violet-500/10 text-violet-500',
  amber: 'bg-amber-500/10 text-amber-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  blue: 'bg-blue-500/10 text-blue-500',
  red: 'bg-red-500/10 text-red-500'
}

export function StatCard({ icon: Icon, label, value, change, trend, color }: StatCardProps) {
  return (
    <Card className="p-4 bg-surface border-border hover:border-primary/30 transition-all group">
      <div className="flex items-center justify-between mb-3">
        <div className={cn("p-2 rounded-lg transition-transform group-hover:scale-110 duration-200", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          "text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5",
          trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
        )}>
          {trend === 'up' ? '↑' : '↓'} {change}%
        </div>
      </div>
      <div>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider mb-1">{label}</p>
        <h3 className="text-2xl font-bold text-text-primary">{value}</h3>
      </div>
    </Card>
  )
}
