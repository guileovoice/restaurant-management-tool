'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Filter, Users, UserCheck, UserX, Heart } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { GlobalDateFilter } from '@/components/shared/GlobalDateFilter'
import { CustomerTable } from '@/components/customers/CustomerTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { useDateFilterStore } from '@/lib/stores/dateFilterStore'
import { toast } from 'react-hot-toast'

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [segmentFilter, setSegmentFilter] = useState('all')
  const [consentFilter, setConsentFilter] = useState('all')
  const { customers, fetchCustomers } = useRestaurantStore()
  const { dateFilter, customStartDate, customEndDate } = useDateFilterStore()

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers, dateFilter, customStartDate, customEndDate])

  // Calculate dynamic stats
  const totalCount = customers.length
  const activeCount = customers.filter(c => c.churnRisk === 'LOW' || c.totalOrders > 5).length
  const atRiskCount = customers.filter(c => c.churnRisk === 'HIGH').length
  const marketingCount = customers.filter(c => c.consents?.marketing).length

  // Filter customers dynamically
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesSegment = 
      segmentFilter === 'all' ||
      (segmentFilter === 'champions' && c.rfmSegment === 'CHAMPION') ||
      (segmentFilter === 'loyal' && c.rfmSegment === 'LOYAL') ||
      (segmentFilter === 'at-risk' && c.churnRisk === 'HIGH')

    const matchesConsent = 
      consentFilter === 'all' ||
      (consentFilter === 'essential' && c.consents?.essential) ||
      (consentFilter === 'marketing' && c.consents?.marketing) ||
      (consentFilter === 'intelligence' && c.consents?.intelligence)

    return matchesSearch && matchesSegment && matchesConsent
  })

  // Export filtered customer database as a real CSV file
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) {
      toast.error("No customer records available to export!")
      return
    }

    const headers = [
      "Customer ID", 
      "Name", 
      "Phone", 
      "Email", 
      "Preferred Channel", 
      "Total Orders", 
      "Total Spent ($)", 
      "Avg Order Value ($)", 
      "Churn Risk", 
      "RFM Segment", 
      "Marketing Consent", 
      "Intelligence Consent"
    ]

    const rows = filteredCustomers.map(c => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email || ''}"`,
      `"${c.preferredChannel}"`,
      c.totalOrders,
      (c.totalSpent || 0).toFixed(2),
      (c.averageOrderValue || 0).toFixed(2),
      `"${c.churnRisk}"`,
      `"${c.rfmSegment}"`,
      c.consents?.marketing ? "YES" : "NO",
      c.consents?.intelligence ? "YES" : "NO"
    ])

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `guileo_customers_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Customer database exported successfully!")
  }

  return (
    <div suppressHydrationWarning className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Customer Intelligence" 
        subtitle="Manage and analyze your customer base, preferences, and predictive traits."
        actions={
          <div className="flex flex-wrap gap-3 items-center">
            <GlobalDateFilter />
            <Button 
              suppressHydrationWarning
              onClick={handleExportCSV}
              variant="outline" 
              className="border-border bg-surface text-text-primary gap-2 text-xs font-bold uppercase tracking-wider h-9"
            >
              <Download className="w-4 h-4 text-primary" />
              Export CSV
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface border-border flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Customers</p>
            <h3 className="text-xl font-bold text-text-primary">{totalCount}</h3>
          </div>
        </Card>
        <Card className="p-4 bg-surface border-border flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Active Buyers</p>
            <h3 className="text-xl font-bold text-text-primary">{activeCount}</h3>
          </div>
        </Card>
        <Card className="p-4 bg-surface border-border flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500 shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">At Churn Risk</p>
            <h3 className="text-xl font-bold text-text-primary">{atRiskCount}</h3>
          </div>
        </Card>
        <Card className="p-4 bg-surface border-border flex items-center gap-4">
          <div className="p-3 bg-violet-500/10 rounded-xl text-violet-500 shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Marketing Consent</p>
            <h3 className="text-xl font-bold text-text-primary">{marketingCount}</h3>
          </div>
        </Card>
      </div>

      {/* Dynamic Filters Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <Input 
              placeholder="Search by name, phone or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface2 border-border h-10 w-full" 
            />
          </div>
          
          <Select value={segmentFilter} onValueChange={setSegmentFilter}>
            <SelectTrigger className="w-[160px] bg-surface2 border-border h-10 text-xs font-semibold text-text-primary">
              <SelectValue placeholder="All Segments" />
            </SelectTrigger>
            <SelectContent className="bg-surface border border-border">
              <SelectItem value="all" className="text-xs font-semibold text-text-primary">All Segments</SelectItem>
              <SelectItem value="champions" className="text-xs font-semibold text-text-primary">Champions</SelectItem>
              <SelectItem value="loyal" className="text-xs font-semibold text-text-primary">Loyal Customers</SelectItem>
              <SelectItem value="at-risk" className="text-xs font-semibold text-text-primary">At Risk</SelectItem>
            </SelectContent>
          </Select>

          <Select value={consentFilter} onValueChange={setConsentFilter}>
            <SelectTrigger className="w-[160px] bg-surface2 border-border h-10 text-xs font-semibold text-text-primary">
              <SelectValue placeholder="Consent Tier" />
            </SelectTrigger>
            <SelectContent className="bg-surface border border-border">
              <SelectItem value="all" className="text-xs font-semibold text-text-primary">All Tiers</SelectItem>
              <SelectItem value="essential" className="text-xs font-semibold text-text-primary">Essential Only</SelectItem>
              <SelectItem value="marketing" className="text-xs font-semibold text-text-primary">Marketing</SelectItem>
              <SelectItem value="intelligence" className="text-xs font-semibold text-text-primary">Intelligence</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <CustomerTable data={filteredCustomers} />
    </div>
  )
}
