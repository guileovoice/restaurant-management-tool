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
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

export default function CustomerDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { customers, fetchCustomers, menu, fetchMenu } = useRestaurantStore()
  
  const [orders, setOrders] = useState<any[]>([])
  const [calls, setCalls] = useState<any[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)

  useEffect(() => {
    if (customers.length === 0) {
      fetchCustomers()
    }
    if (menu.length === 0) {
      fetchMenu()
    }
  }, [customers, fetchCustomers, menu, fetchMenu])

  const customer = customers.find(c => c.id === id)

  useEffect(() => {
    if (!customer) return

    const customerId = customer.id
    const customerPhone = customer.phone

    async function loadCustomerData() {
      setIsDataLoading(true)
      try {
        // Fetch orders for this customer (matching either customer_id or phone to be safe)
        const { data: dbOrders, error: ordersErr } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .or(`customer_id.eq.${customerId},customer_phone.eq.${customerPhone}`)
          .order('created_at', { ascending: false })

        if (ordersErr) {
          console.error("Error fetching customer orders:", ordersErr)
        } else if (dbOrders) {
          const mappedOrders = dbOrders.map(o => {
            let orderStatus = o.status
            let orderNotes = o.notes || ''

            if (orderNotes.includes('[STATUS:OUT_FOR_DELIVERY]')) {
              orderStatus = 'OUT_FOR_DELIVERY'
              orderNotes = orderNotes.replace(/\[STATUS:OUT_FOR_DELIVERY\]/g, '').trim()
            }

            return {
              id: o.id,
              orderNumber: o.order_number || '',
              tenantId: o.tenant_id || '',
              customerId: o.customer_id || '',
              customerName: o.customer_name || '',
              customerPhone: o.customer_phone || '',
              items: (o.order_items || []).map((item: any) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: Number(item.price),
                notes: item.notes || ''
              })),
              subtotal: Number(o.subtotal || 0),
              deliveryFee: Number(o.delivery_fee || 0),
              tax: Number(o.tax || 0),
              total: Number(o.total || 0),
              status: orderStatus,
              type: o.type,
              channel: o.channel,
              address: o.address || '',
              notes: orderNotes,
              paymentStatus: o.payment_status,
              createdAt: o.created_at,
              updatedAt: o.updated_at,
              estimatedReadyAt: o.estimated_ready_at || undefined
            }
          })
          setOrders(mappedOrders)
        }

        // Fetch call logs matching customer phone
        if (customerPhone) {
          const { data: dbCalls, error: callsErr } = await supabase
            .from('vapi_call_logs')
            .select('*')
            .eq('customer_phone', customerPhone)
            .order('started_at', { ascending: false })

          if (callsErr) {
            console.error("Error fetching call logs:", callsErr)
          } else if (dbCalls) {
            setCalls(dbCalls)
          }
        }
      } catch (err) {
        console.error("Error loading customer data from Supabase:", err)
      } finally {
        setIsDataLoading(false)
      }
    }

    loadCustomerData()
  }, [customer])

  const handleDeleteProfile = async () => {
    if (!customer) return
    const confirmed = window.confirm(`Are you sure you want to permanently delete the profile for ${customer.name}?`)
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customer.id)

      if (error) {
        toast.error(`Error deleting profile: ${error.message}`)
      } else {
        toast.success("Customer profile deleted successfully.")
        fetchCustomers()
        router.push('/customers')
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`)
    }
  }

  if (!customer) {
    return (
      <div className="py-24 text-center">
        <p className="text-text-muted font-bold">Loading customer profile...</p>
      </div>
    )
  }

  // Calculate dynamic values
  const customerAddress = orders.find(o => o.address)?.address || 'Astoria, NY'

  // Dynamic order stats summing from fetched orders, fallback to customer model when loading
  const computedTotalSpent = isDataLoading 
    ? customer.totalSpent 
    : orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.total : 0), 0)
  const computedTotalOrders = isDataLoading 
    ? customer.totalOrders 
    : orders.filter(o => o.status !== 'CANCELLED').length
  const computedAvgOrder = computedTotalOrders > 0 ? computedTotalSpent / computedTotalOrders : 0

  const memberSinceDate = new Date(customer.firstOrderAt || customer.createdAt || new Date())
  const diffTime = Math.abs(new Date().getTime() - memberSinceDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const diffMonths = Math.floor(diffDays / 30)
  const memberSinceStr = diffMonths <= 0 ? 'Joined this month' : `${diffMonths} month${diffMonths > 1 ? 's' : ''}`

  // Growth opportunity text based on untried popular menu items
  const orderedItemNames = new Set(
    orders.flatMap(o => (o.items || []).map((item: any) => item.name.toLowerCase()))
  )
  const untriedPopularItem = menu.find(item => item.popular && !orderedItemNames.has(item.name.toLowerCase())) || menu[0]
  const growthOpportunityText = untriedPopularItem 
    ? `${customer.name.split(' ')[0]} hasn't tried our ${untriedPopularItem.name} yet. Mention it on the next call to increase AOV.`
    : `Suggest our daily specials to ${customer.name.split(' ')[0]} to increase their average order value.`

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
              {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
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
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-text-muted" /> {customerAddress}</span>
              </div>
              <ConsentBadges consents={customer.consents} />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Orders</p>
              <h4 className="text-xl font-bold text-text-primary">{computedTotalOrders}</h4>
              <p className="text-[10px] text-emerald-500 font-bold">Active Buyer</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total Spent</p>
              <h4 className="text-xl font-bold text-text-primary">${computedTotalSpent.toFixed(2)}</h4>
              <p className="text-[10px] text-text-muted">Lifetime value</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Avg Order</p>
              <h4 className="text-xl font-bold text-text-primary">${computedAvgOrder.toFixed(2)}</h4>
              <p className="text-[10px] text-emerald-500 font-bold">LTV Contribution</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Member Since</p>
              <h4 className="text-xl font-bold text-text-primary">{memberSinceStr}</h4>
              <p className="text-[10px] text-text-muted">Joined {format(new Date(customer.firstOrderAt || customer.createdAt), 'MMM yyyy')}</p>
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
              {isDataLoading ? (
                <div className="py-8 text-center text-text-muted text-sm font-semibold">Loading order history...</div>
              ) : orders.length === 0 ? (
                <Card className="p-6 text-center bg-surface border-border text-text-muted text-sm italic">
                  No order history found for this customer.
                </Card>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className="p-4 bg-surface border-border hover:border-primary/30 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-surface2 flex items-center justify-center font-mono text-xs font-bold text-text-muted">
                          #{order.orderNumber || order.id.slice(0, 4)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">
                            {format(new Date(order.createdAt), 'MMM d, yyyy · h:mm a')}
                          </p>
                          <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">
                            {order.items && order.items.length > 0
                              ? order.items.map((item: any) => `${item.quantity}x ${item.name}`).join(', ')
                              : 'No items detailed'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-text-primary">${order.total.toFixed(2)}</span>
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  </Card>
                ))
              )}
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
              {isDataLoading ? (
                <div className="py-8 text-center text-text-muted text-sm font-semibold">Loading conversations...</div>
              ) : calls.length === 0 ? (
                <Card className="p-6 text-center bg-surface border-border text-text-muted text-sm italic">
                  No conversations recorded for this customer yet.
                </Card>
              ) : (
                calls.map(call => (
                  <CallTranscriptCard key={call.id} call={call} />
                ))
              )}
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
                  <span className={cn(
                    "font-bold",
                    customer.churnRisk === 'HIGH' ? "text-red-500" :
                    customer.churnRisk === 'MEDIUM' ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {customer.churnRisk} ({customer.churnRisk === 'HIGH' ? '78%' : customer.churnRisk === 'MEDIUM' ? '45%' : '12%'})
                  </span>
                </div>
                <div className="h-2 w-full bg-surface2 rounded-full overflow-hidden">
                  <div className={cn(
                    "h-full rounded-full",
                    customer.churnRisk === 'HIGH' ? "bg-red-500 w-[78%]" :
                    customer.churnRisk === 'MEDIUM' ? "bg-amber-500 w-[45%]" : "bg-emerald-500 w-[12%]"
                  )} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-surface2 rounded-xl border border-border">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">LTV Projection</p>
                  <p className="text-lg font-bold text-text-primary">${(computedTotalSpent * 1.25).toFixed(2)}</p>
                  <p className="text-[10px] text-emerald-500 font-bold">Next 12 months</p>
                </div>
                <div className="p-3 bg-surface2 rounded-xl border border-border">
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Next Order</p>
                  <p className="text-lg font-bold text-text-primary">
                    {customer.rfmSegment === 'CHAMPION' ? '~3 days' : 
                     customer.rfmSegment === 'LOYAL' ? '~5 days' : '~10 days'}
                  </p>
                  <p className="text-[10px] text-text-muted font-bold">Based on history</p>
                </div>
              </div>

              <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                <p className="text-xs font-bold text-violet-400 mb-2 uppercase tracking-widest">Growth Opportunity</p>
                <p className="text-xs text-text-primary leading-relaxed">
                  {growthOpportunityText}
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
                <TrendingUp className="w-4 h-4 text-primary" /> Create Campaign for {customer.name.split(' ')[0]}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="border-border bg-surface2 text-text-primary gap-2 h-10">
                  <Share2 className="w-3.5 h-3.5" /> Export Data
                </Button>
                <Button 
                  onClick={handleDeleteProfile}
                  variant="outline" 
                  className="border-border bg-surface2 text-danger hover:bg-danger/10 hover:border-danger/30 gap-2 h-10"
                >
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
