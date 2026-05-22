import { create } from 'zustand'

export type DateFilterType = 'today' | 'last7days' | 'last30days' | 'thisMonth' | 'last3Months' | 'last6Months' | 'last1Year' | 'custom' | 'all'

interface DateFilterState {
  dateFilter: DateFilterType
  customStartDate: Date | null
  customEndDate: Date | null
  setDateFilter: (filter: DateFilterType, start?: Date | null, end?: Date | null) => void
  getDateRange: () => { startDate: Date | null; endDate: Date | null }
}

export const useDateFilterStore = create<DateFilterState>((set, get) => ({
  dateFilter: 'today',
  customStartDate: null,
  customEndDate: null,
  
  setDateFilter: (filter: DateFilterType, start?: Date | null, end?: Date | null) => {
    set({ 
      dateFilter: filter,
      ...(start !== undefined && { customStartDate: start }),
      ...(end !== undefined && { customEndDate: end })
    })
  },
  
  getDateRange: () => {
    const { dateFilter, customStartDate, customEndDate } = get()
    
    if (dateFilter === 'all') {
      return { startDate: null, endDate: null }
    }

    if (dateFilter === 'custom') {
      return { startDate: customStartDate, endDate: customEndDate }
    }

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date(todayStart)
    todayEnd.setDate(todayEnd.getDate() + 1) // strictly less than todayEnd

    const start = new Date(todayStart)

    switch (dateFilter) {
      case 'today':
        return { startDate: todayStart, endDate: todayEnd }
      case 'last7days':
        start.setDate(todayStart.getDate() - 7)
        return { startDate: start, endDate: todayEnd }
      case 'last30days':
        start.setDate(todayStart.getDate() - 30)
        return { startDate: start, endDate: todayEnd }
      case 'thisMonth':
        start.setDate(1)
        return { startDate: start, endDate: todayEnd }
      case 'last3Months':
        start.setMonth(todayStart.getMonth() - 3)
        return { startDate: start, endDate: todayEnd }
      case 'last6Months':
        start.setMonth(todayStart.getMonth() - 6)
        return { startDate: start, endDate: todayEnd }
      case 'last1Year':
        start.setFullYear(todayStart.getFullYear() - 1)
        return { startDate: start, endDate: todayEnd }
      default:
        return { startDate: todayStart, endDate: todayEnd }
    }
  }
}))
