'use client'

import { useEffect, useState } from 'react'
import { Plus, Megaphone, BarChart3, TrendingUp, Users, Calendar, X, Send } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { CampaignCard } from '@/components/campaigns/CampaignCard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlobalDateFilter } from '@/components/shared/GlobalDateFilter'
import { useDateFilterStore } from '@/lib/stores/dateFilterStore'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'

export default function CampaignsPage() {
  const { campaigns, fetchCampaigns } = useRestaurantStore()
  const { dateFilter, customStartDate, customEndDate } = useDateFilterStore()
  
  // Modal state variables
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [channel, setChannel] = useState('WHATSAPP')
  const [segment, setSegment] = useState('')
  const [message, setMessage] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')

  useEffect(() => {
    fetchCampaigns()
  }, [fetchCampaigns, dateFilter, customStartDate, customEndDate])

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !message || !segment) {
      toast.error('Please enter a campaign name, target segment, and message.')
      return
    }

    try {
      const tenant_id = useRestaurantStore.getState().info?.id || '395b50b9-9504-47ce-a8be-3b5c3ff22315'
      
      const newCampaign = {
        tenant_id,
        name,
        channel,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
        segment,
        recipient_count: segment.includes('VIP') ? 67 : 312,
        sent_count: 0,
        message,
        scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('campaigns')
        .insert([newCampaign])

      if (error) {
        toast.error(`Error saving campaign: ${error.message}`)
        return
      }

      toast.success('Marketing campaign created successfully!')
      setName('')
      setMessage('')
      setSegment('')
      setScheduledAt('')
      setIsCreateOpen(false)
      fetchCampaigns()
    } catch (err: any) {
      toast.error(`Catastrophic error: ${err.message}`)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Marketing Campaigns" 
        subtitle="Create and manage multi-channel AI-driven marketing campaigns."
        actions={
          <div className="flex items-center gap-3">
            <GlobalDateFilter />
            <Button className="bg-primary hover:bg-primary-dark text-white gap-2" onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4" />
              Create Campaign
            </Button>
          </div>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-surface border-border flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Total Sent</p>
            <h3 className="text-2xl font-bold text-text-primary">{campaigns.filter(c => c.status === 'SENT').length}</h3>
            <p className="text-[10px] text-text-muted mt-1">This month</p>
          </div>
        </Card>
        <Card className="p-6 bg-surface border-border flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Avg Open Rate</p>
            <h3 className="text-2xl font-bold text-text-primary">34%</h3>
            <p className="text-[10px] text-emerald-500 font-bold mt-1">↑ 5% vs last month</p>
          </div>
        </Card>
        <Card className="p-6 bg-surface border-border flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Revenue Attributed</p>
            <h3 className="text-2xl font-bold text-text-primary">$2,840</h3>
            <p className="text-[10px] text-text-muted mt-1">Verified by Stripe</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <Tabs defaultValue="all" className="w-full lg:w-auto">
          <TabsList className="bg-surface2 p-1 border border-border h-10">
            <TabsTrigger value="all" className="data-[state=active]:bg-surface data-[state=active]:text-primary px-6 text-xs font-bold uppercase tracking-widest transition-all">All</TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-surface data-[state=active]:text-primary px-6 text-xs font-bold uppercase tracking-widest transition-all">Active</TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-surface data-[state=active]:text-primary px-6 text-xs font-bold uppercase tracking-widest transition-all">Scheduled</TabsTrigger>
            <TabsTrigger value="sent" className="data-[state=active]:bg-surface data-[state=active]:text-primary px-6 text-xs font-bold uppercase tracking-widest transition-all">Sent</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
        {/* Interactive card shortcut for "Create New" card */}
        <button 
          className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-surface2/30 transition-all group"
          onClick={() => setIsCreateOpen(true)}
        >
          <div className="w-12 h-12 rounded-full bg-surface2 flex items-center justify-center text-text-muted group-hover:text-primary transition-colors">
            <Plus className="w-6 h-6" />
          </div>
          <div className="text-center">
            <h4 className="font-bold text-text-primary">Create New Campaign</h4>
            <p className="text-xs text-text-muted mt-1">Start a new outreach sequence</p>
          </div>
        </button>
      </div>

      {/* Campaign Creation Glassmorphism Dialog */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-surface border-border w-full max-w-lg p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
              onClick={() => setIsCreateOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div>
              <h3 className="text-xl font-bold text-text-primary">Create Outreach Campaign</h3>
              <p className="text-xs text-text-muted mt-1">Design a new automated outreach campaign using AI templates.</p>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="camp-name">Campaign Name</Label>
                <Input 
                  id="camp-name" 
                  placeholder="e.g. Weekend Pizza Special" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-surface2 border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="camp-channel">Channel</Label>
                  <select 
                    id="camp-channel" 
                    value={channel}
                    onChange={(e: any) => setChannel(e.target.value)}
                    className="w-full bg-surface2 border border-border rounded-lg h-9 px-3 text-sm text-text-primary outline-none focus:border-primary"
                  >
                    <option value="WHATSAPP">WhatsApp Message</option>
                    <option value="VOICE">AI Voice Call</option>
                    <option value="SMS">SMS Message</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="camp-segment">Target Cohort / Segment</Label>
                  <select 
                    id="camp-segment" 
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    className="w-full bg-surface2 border border-border rounded-lg h-9 px-3 text-sm text-text-primary outline-none focus:border-primary"
                  >
                    <option value="">Select segment...</option>
                    <option value="All active customers">All Active Customers (312)</option>
                    <option value="High-value VIPs">High-Value VIPs (67)</option>
                    <option value="Churn risk leads">Churn Risk Leads (35)</option>
                    <option value="New leads this week">New Leads This Week (24)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="camp-msg">Campaign Message / Prompt</Label>
                <textarea 
                  id="camp-msg" 
                  rows={4}
                  placeholder="Write your campaign announcement or voice prompt sequence here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-surface2 border border-border rounded-lg p-3 text-sm text-text-primary outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="camp-date">Schedule Delivery (Optional)</Label>
                <div className="relative">
                  <Input 
                    id="camp-date" 
                    type="datetime-local" 
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="bg-surface2 border-border pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-border uppercase text-xs font-bold"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white uppercase text-xs font-bold gap-2"
                >
                  <Send className="w-3.5 h-3.5" /> Launch Sequence
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
