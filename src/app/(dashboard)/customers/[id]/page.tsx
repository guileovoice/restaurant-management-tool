'use client'

import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  MapPin, 
  TrendingUp, 
  ShoppingBag, 
  Calendar,
  MessageSquare,
  BarChart3,
  ExternalLink,
  Trash2,
  Share2
} from 'lucide-react'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ConsentBadges } from '@/components/customers/ConsentBadges'
import { CallTranscriptCard } from '@/components/customers/CallTranscriptCard'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { format } from 'date-fns'
import { useEffect } from 'react'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { customers, fetchCustomers } = useRestaurantStore()

  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers()
    }
  }, [customers, fetchCustomers])

  const customer = customers.find(c => c.id === id)

  if (!customer) {
    return (
      <div className="py-24 text-center">
        <p className="text-text-muted font-bold">Loading customer profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 border border-border bg-surface text-text-muted hover:text-text-primary"
          onClick={() => router.back()}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-[0.2em]">Customer Profile</h2>
          <h1 className="text-2xl font-bold text-text-primary">{customer.name}</h1>
        </div>
      </div>

      {/* Header Info Card */}
      <Card className="p-6 bg-surface border-border">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-center">
          <div className="flex items-center gap-6 pr-8 lg:border-r border-border">
            <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary text-3xl font-black">
              {customer.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest">
                  {customer.rfmSegment}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Phone className="w-3 h-3" /> {customer.phone}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-text-primary font-medium">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-text-muted" /> {customer.email || 'No email'}</span>
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-text-muted" /> Astoria, NY</span>
              </div>
              <ConsentBadges consents={customer.consents} />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Orders</p>
              <h4 className="text-xl font-bold text-text-primary">{customer.totalOrders}</h4>
              <p className="text-[10px] text-emerald-500 font-bold">Top 5% customer</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Spent</p>
              <h4 className="text-xl font-bold text-text-primary">${customer.totalSpent.toFixed(2)}</h4>
              <p className="text-[10px] text-text-muted">Lifetime value</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Avg Order</p>
              <h4 className="text-xl font-bold text-text-primary">${customer.averageOrderValue.toFixed(2)}</h4>
              <p className="text-[10px] text-emerald-500 font-bold">↑ 8% this month</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Member Since</p>
              <h4 className="text-xl font-bold text-text-primary">8 months</h4>
              <p className="text-[10px] text-text-muted">Joined {format(new Date(customer.firstOrderAt), 'MMM yyyy')}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - History */}
        <div className="lg:col-span-8 space-y-8">
          {/* Order History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" /> Order History
              </h3>
              <Button variant="link" className="text-primary text-xs font-bold uppercase tracking-widest p-0 h-auto">View all orders</Button>
            </div>
            
            <div className="space-y-3">
              {[1, 2, 3].map((_, i) => (
                <Card key={i} className="p-4 bg-surface border-border hover:border-primary/30 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-surface2 flex items-center justify-center font-mono text-xs font-bold text-text-muted">
                        #104{7-i}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">May {15-i}, 2024 · 2:45 PM</p>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">2x Pão de Queijo, 1x Brazilian Coffee</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-text-primary">$24.50</span>
                      <StatusBadge status={i === 0 ? 'PAID' : 'DELIVERED'} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Conversation History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-violet-500" /> Conversations
              </h3>
              <Button variant="link" className="text-primary text-xs font-bold uppercase tracking-widest p-0 h-auto">Full archives</Button>
            </div>
            <div className="space-y-4">
              {customer.calls.map(call => (
                <CallTranscriptCard key={call.id} call={call} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Intelligence & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 bg-surface border-border overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16" />
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-emerald-500" /> Predictive Intelligence
            </h3>
            
            <div className="space-y-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-text-muted">Churn Risk</span>
                  <span className="text-emerald-500">LOW (12%)</span>
                </div>
                <div className="h-2 w-full bg-surface2 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[12%]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-surface2 rounded-xl border border-border">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">LTV Projection</p>
                  <p className="text-lg font-bold text-text-primary">${customer.ltv}</p>
                  <p className="text-[10px] text-emerald-500 font-bold">Next 12 months</p>
                </div>
                <div className="p-3 bg-surface2 rounded-xl border border-border">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Next Order</p>
                  <p className="text-lg font-bold text-text-primary">~5 days</p>
                  <p className="text-[10px] text-text-muted font-bold">Based on history</p>
                </div>
              </div>

              <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <p className="text-xs font-bold text-violet-400 mb-2 uppercase tracking-widest">Growth Opportunity</p>
                <p className="text-xs text-text-primary leading-relaxed">
                  João hasn't tried our <strong>Acai Bowls</strong> yet. Mention it on the next call to increase AOV.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-surface border-border">
            <h3 className="text-lg font-bold text-text-primary mb-6">Actions</h3>
            <div className="space-y-3">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-3 h-11">
                <MessageSquare className="w-4 h-4" /> Send WhatsApp Message
              </Button>
              <Button variant="outline" className="w-full border-border bg-surface2 text-text-primary gap-3 h-11">
                <TrendingUp className="w-4 h-4 text-primary" /> Create Campaign for João
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="border-border bg-surface2 text-text-primary gap-2 h-10">
                  <Share2 className="w-3.5 h-3.5" /> Export Data
                </Button>
                <Button variant="outline" className="border-border bg-surface2 text-danger hover:bg-danger/10 hover:border-danger/30 gap-2 h-10">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Profile
                </Button>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold uppercase tracking-widest justify-center">
            <ExternalLink className="w-3 h-3" /> GDPR/LGPD Compliance ID: {customer.id}-442
          </div>
        </div>
      </div>
    </div>
  )
}
