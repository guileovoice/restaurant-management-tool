'use client'

import * as React from 'react'
import { CalendarIcon } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { DateRange } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useDateFilterStore, DateFilterType } from '@/lib/stores/dateFilterStore'

const PRESETS: { label: string; value: DateFilterType }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Last 7 days', value: 'last7days' },
  { label: 'Last 30 days', value: 'last30days' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last 3 Months', value: 'last3Months' },
  { label: 'Last 6 Months', value: 'last6Months' },
  { label: 'Last 1 year', value: 'last1Year' },
  { label: 'Custom Range', value: 'custom' },
]

export function GlobalDateFilter() {
  const { dateFilter, setDateFilter, getDateRange } = useDateFilterStore()
  const [open, setOpen] = React.useState(false)
  
  // Local state for the popover
  const [localPreset, setLocalPreset] = React.useState<DateFilterType>(dateFilter)
  const [localDate, setLocalDate] = React.useState<DateRange | undefined>(undefined)

  // Initialize local state when popover opens
  React.useEffect(() => {
    if (open) {
      setLocalPreset(dateFilter)
      const { startDate, endDate } = getDateRange()
      if (startDate) {
        setLocalDate({ 
          from: startDate, 
          to: endDate ? new Date(endDate.getTime() - 1) : undefined // convert exclusive end date to inclusive for the calendar visual
        })
      } else {
        setLocalDate(undefined)
      }
    }
  }, [open, dateFilter, getDateRange])

  const handlePresetClick = (preset: DateFilterType) => {
    setLocalPreset(preset)
    if (preset !== 'custom') {
      // Calculate dates for the preset
      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)
      const start = new Date(todayStart)

      switch (preset) {
        case 'today':
          setLocalDate({ from: todayStart, to: todayStart })
          break
        case 'last7days':
          start.setDate(todayStart.getDate() - 7)
          setLocalDate({ from: start, to: todayStart })
          break
        case 'last30days':
          start.setDate(todayStart.getDate() - 30)
          setLocalDate({ from: start, to: todayStart })
          break
        case 'thisMonth':
          start.setDate(1)
          setLocalDate({ from: start, to: todayStart })
          break
        case 'last3Months':
          start.setMonth(todayStart.getMonth() - 3)
          setLocalDate({ from: start, to: todayStart })
          break
        case 'last6Months':
          start.setMonth(todayStart.getMonth() - 6)
          setLocalDate({ from: start, to: todayStart })
          break
        case 'last1Year':
          start.setFullYear(todayStart.getFullYear() - 1)
          setLocalDate({ from: start, to: todayStart })
          break
      }
    }
  }

  const handleCalendarSelect = (range: DateRange | undefined) => {
    setLocalDate(range)
    setLocalPreset('custom')
  }

  const handleClear = () => {
    setLocalDate(undefined)
    setLocalPreset('custom')
  }

  const handleApply = () => {
    if (localPreset === 'custom') {
      if (localDate?.from) {
        const endDate = localDate.to ? new Date(localDate.to) : new Date(localDate.from)
        endDate.setHours(23, 59, 59, 999) // make it end of the day
        
        const endOfRange = new Date(endDate.getTime() + 1) // convert back to exclusive end date for the backend queries
        setDateFilter('custom', localDate.from, endOfRange)
      } else {
        setDateFilter('all') // Or handle empty case
      }
    } else {
      setDateFilter(localPreset)
    }
    setOpen(false)
  }

  // Format display text for the trigger button
  const { startDate, endDate } = getDateRange()
  let displayText = "Select Date Range"
  if (startDate && endDate) {
    const displayEnd = new Date(endDate.getTime() - 1) // exclusive to inclusive
    if (isSameDay(startDate, displayEnd)) {
      displayText = format(startDate, "MMM d, yyyy")
    } else {
      displayText = `${format(startDate, "MMM d, yyyy")} - ${format(displayEnd, "MMM d, yyyy")}`
    }
  } else if (dateFilter === 'all') {
    displayText = "All Time"
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal h-9 bg-surface",
            !localDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
          {displayText}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-surface border-border" align="end">
        <div className="flex flex-col sm:flex-row">
          {/* Left panel: Presets */}
          <div className="flex flex-col gap-1 border-b sm:border-b-0 sm:border-r border-border p-4 w-full sm:w-[160px]">
            {PRESETS.map((preset) => (
              <Button
                key={preset.value}
                variant="ghost"
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "justify-start font-normal hover:bg-surface2",
                  localPreset === preset.value && "bg-surface2 text-primary font-medium"
                )}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Right panel: Calendar */}
          <div className="p-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={localDate?.from}
              selected={localDate}
              onSelect={handleCalendarSelect}
              numberOfMonths={2}
              className="border-none"
            />
          </div>
        </div>

        {/* Bottom panel: Actions */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-surface2/50">
          <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={handleClear}>
            Clear
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-surface hover:bg-surface2" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-primary text-white hover:bg-primary-dark" onClick={handleApply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
