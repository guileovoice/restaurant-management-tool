'use client'

import { useState } from 'react'
import { Flame, Edit, Trash2, Eye, EyeOff, Clock, AlertCircle } from 'lucide-react'
import { MenuItem } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface MenuItemCardProps {
  item: MenuItem
  onEdit?: (item: MenuItem) => void
  onToggle?: (id: string, available: boolean) => void
  onDelete?: (id: string) => void
}

export function MenuItemCard({ item, onEdit, onToggle, onDelete }: MenuItemCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card 
      className="bg-surface border-border overflow-hidden flex flex-col group h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-video bg-surface2 flex items-center justify-center overflow-hidden">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
        ) : (
          <span className="text-4xl">🇧🇷</span>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {item.popular && (
            <Badge className="bg-amber-500 text-white border-none gap-1">
              <Flame className="w-3 h-3 fill-white" /> Popular
            </Badge>
          )}
          {!item.available && (
            <Badge variant="destructive" className="gap-1">
              <EyeOff className="w-3 h-3" /> Unavailable
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-text-primary group-hover:text-primary transition-colors">{item.name}</h3>
          <span className="font-bold text-text-primary text-lg">${item.price.toFixed(2)}</span>
        </div>
        
        <p className="text-xs text-text-muted mb-4 line-clamp-2 flex-1">
          {item.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted bg-surface2 px-1.5 py-0.5 rounded">
            <Clock className="w-3 h-3" /> {item.preparationTime} MIN
          </div>
          {(Array.isArray(item.allergens) ? item.allergens : (typeof (item.allergens as any) === 'string' && item.allergens ? (item.allergens as any).split(',') : [])).map((allergen: string) => (
            <div key={allergen} className="flex items-center gap-1 text-[10px] font-bold text-amber-500/80 bg-amber-500/10 px-1.5 py-0.5 rounded">
              <AlertCircle className="w-3 h-3" /> {String(allergen).trim().toUpperCase()}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
          <div className="flex items-center gap-2">
            <Switch 
              checked={item.available} 
              onCheckedChange={(checked) => onToggle?.(item.id, checked)}
              className="data-[state=checked]:bg-emerald-500"
            />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">
              {item.available ? 'Available' : 'Hidden'}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="w-8 h-8 text-text-muted hover:text-primary" onClick={() => onEdit?.(item)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 text-text-muted hover:text-danger" onClick={() => onDelete?.(item.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
