'use client'

import { useState } from 'react'
import { 
  Building2, 
  Mic2, 
  Bell, 
  Link as LinkIcon, 
  Users, 
  CreditCard, 
  AlertTriangle,
  Play,
  Upload,
  Save,
  CheckCircle2,
  Plus
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { toast } from 'react-hot-toast'

export default function SettingsPage() {
  const { info, voiceSettings, updateInfo, updateVoiceSettings } = useRestaurantStore()
  const [localInfo, setLocalInfo] = useState(info || { name: '', address: '', phone: '', category: '' })

  // Voice settings states
  const [localVoiceName, setLocalVoiceName] = useState(voiceSettings?.agentName || 'Alex')
  const [autoLanguage, setAutoLanguage] = useState(voiceSettings?.language === 'both')
  const [escalationThreshold, setEscalationThreshold] = useState(2)

  // Notifications states
  const [orderAlerts, setOrderAlerts] = useState(true)
  const [lowInventory, setLowInventory] = useState(true)
  const [dailySummaries, setDailySummaries] = useState(false)

  // Team states
  const [team, setTeam] = useState([
    { name: 'Abeer', email: 'abeer@guileo.ai', role: 'Owner' },
    { name: 'Sofia', email: 'sofia@guileo.ai', role: 'Manager' }
  ])
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('Manager')

  const handleSaveInfo = () => {
    updateInfo(localInfo)
    toast.success('Business settings updated!')
  }

  const handleSaveVoice = async () => {
    await updateVoiceSettings({
      agentName: localVoiceName,
      voiceId: localVoiceName.toLowerCase() + '-v1',
      language: autoLanguage ? 'both' : 'en'
    })
    toast.success('Voice Persona settings updated!')
  }

  const handleSaveNotifications = () => {
    toast.success('Notification preferences updated!')
  }

  const handleAddTeamMember = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberName || !newMemberEmail) {
      toast.error('Please fill in all team member fields.')
      return
    }
    setTeam([...team, { name: newMemberName, email: newMemberEmail, role: newMemberRole }])
    setNewMemberName('')
    setNewMemberEmail('')
    setShowAddMember(false)
    toast.success(`Successfully invited ${newMemberName} to your team!`)
  }

  return (
    <div className="space-y-8 pb-24">
      <PageHeader 
        title="Settings" 
        subtitle="Manage your restaurant configuration, voice agent, and integrations."
      />

      <Tabs defaultValue="business" className="flex flex-col lg:flex-row gap-8">
        <TabsList className="bg-surface border border-border flex flex-col items-stretch h-auto p-2 lg:w-[240px] shrink-0">
          {[
            { id: 'business', label: 'Business Info', icon: Building2 },
            { id: 'voice', label: 'Voice Agent', icon: Mic2 },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'integrations', label: 'Integrations', icon: LinkIcon },
            { id: 'team', label: 'Team Members', icon: Users },
            { id: 'billing', label: 'Billing', icon: CreditCard },
            { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, color: 'text-danger' },
          ].map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id}
              className={cn(
                "justify-start gap-3 px-4 py-3 h-auto data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-text-muted hover:text-text-primary transition-all",
                tab.color
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-semibold">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex-1">
          <TabsContent value="business" className="m-0 space-y-6">
            <Card className="p-6 bg-surface border-border">
              <h3 className="text-lg font-bold text-text-primary mb-6">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="biz-name">Restaurant Name</Label>
                  <Input 
                    id="biz-name" 
                    value={localInfo.name} 
                    onChange={(e) => setLocalInfo({...localInfo, name: e.target.value})}
                    className="bg-surface2 border-border" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biz-phone">Business Phone (Managed by Guileo)</Label>
                  <Input 
                    id="biz-phone" 
                    value={localInfo.phone} 
                    onChange={(e) => setLocalInfo({...localInfo, phone: e.target.value})}
                    className="bg-surface2 border-border" 
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="biz-addr">Address</Label>
                  <Input 
                    id="biz-addr" 
                    value={localInfo.address} 
                    onChange={(e) => setLocalInfo({...localInfo, address: e.target.value})}
                    className="bg-surface2 border-border" 
                  />
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-surface2 border-2 border-dashed border-border flex items-center justify-center text-text-muted">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text-primary">Restaurant Logo</p>
                    <p className="text-xs text-text-muted">Recommended size: 512x512px</p>
                  </div>
                </div>
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white gap-2"
                  onClick={handleSaveInfo}
                >
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-surface border-border">
              <h3 className="text-lg font-bold text-text-primary mb-6">Operating Hours</h3>
              <div className="space-y-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-3 w-32">
                      <Switch checked={day !== 'Sunday'} />
                      <span className={cn("text-sm font-bold", day === 'Sunday' ? "text-text-muted" : "text-text-primary")}>{day}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Input defaultValue="09:00" className="w-24 bg-surface2 border-border h-8 text-center" />
                      <span className="text-text-muted">—</span>
                      <Input defaultValue="22:00" className="w-24 bg-surface2 border-border h-8 text-center" />
                    </div>
                    {day === 'Sunday' && <Badge variant="outline" className="border-border text-text-muted">Closed</Badge>}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="voice" className="m-0 space-y-6">
            <Card className="p-6 bg-surface border-border">
              <h3 className="text-lg font-bold text-text-primary mb-6">Voice Persona Settings</h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input 
                    id="agent-name" 
                    value={localVoiceName} 
                    onChange={(e) => setLocalVoiceName(e.target.value)} 
                    className="bg-surface2 border-border" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Alex', desc: 'Professional & Warm', gender: 'Male' },
                    { name: 'Sofia', desc: 'Friendly & Energetic', gender: 'Female' },
                    { name: 'Marcus', desc: 'Calm & Clear', gender: 'Male' },
                  ].map((voice) => (
                    <div 
                      key={voice.name} 
                      onClick={() => setLocalVoiceName(voice.name)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all cursor-pointer group",
                        voice.name === localVoiceName ? "border-primary bg-primary/5" : "border-border bg-surface2/50 hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={voice.name === localVoiceName ? "bg-primary text-white" : "bg-surface text-text-muted"}>{voice.gender}</Badge>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-primary group-hover:scale-110 transition-transform"
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success(`Playing sample audio for ${voice.name}...`);
                          }}
                        >
                          <Play className="w-4 h-4 fill-primary" />
                        </Button>
                      </div>
                      <h4 className="font-bold text-text-primary">{voice.name}</h4>
                      <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-1">{voice.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Auto-Language Detection</h4>
                      <p className="text-xs text-text-muted">Automatically switch between English and Portuguese based on customer speech.</p>
                    </div>
                    <Switch checked={autoLanguage} onCheckedChange={setAutoLanguage} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Escalation Threshold</h4>
                      <p className="text-xs text-text-muted">Transfer to human after multiple unanswered questions.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7 border-border" onClick={() => setEscalationThreshold(Math.max(1, escalationThreshold - 1))}>-</Button>
                      <span className="text-sm font-bold w-4 text-center">{escalationThreshold}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7 border-border" onClick={() => setEscalationThreshold(escalationThreshold + 1)}>+</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex justify-end">
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white gap-2"
                  onClick={handleSaveVoice}
                >
                  <Save className="w-4 h-4" /> Save Voice Settings
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="m-0 space-y-6">
            <Card className="p-6 bg-surface border-border">
              <h3 className="text-lg font-bold text-text-primary mb-6">Notification Preferences</h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">New Order Alerts</h4>
                    <p className="text-xs text-text-muted">Receive live dashboard sound effects and popups on new phone/web orders.</p>
                  </div>
                  <Switch checked={orderAlerts} onCheckedChange={setOrderAlerts} />
                </div>

                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Low Inventory Warnings</h4>
                    <p className="text-xs text-text-muted">Send automatic SMS alerts when popular ingredients are running thin.</p>
                  </div>
                  <Switch checked={lowInventory} onCheckedChange={setLowInventory} />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Daily Marketing Summaries</h4>
                    <p className="text-xs text-text-muted">Get a summary email of campaign delivery rates, consent count and total attributed revenue.</p>
                  </div>
                  <Switch checked={dailySummaries} onCheckedChange={setDailySummaries} />
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex justify-end">
                <Button 
                  className="bg-primary hover:bg-primary-dark text-white gap-2"
                  onClick={handleSaveNotifications}
                >
                  <Save className="w-4 h-4" /> Save Preferences
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="m-0 space-y-6">
            <Card className="p-6 bg-surface border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Team Members</h3>
                  <p className="text-xs text-text-muted">Manage access levels and configure notifications for your staff.</p>
                </div>
                <Button className="bg-primary hover:bg-primary-dark text-white gap-2" onClick={() => setShowAddMember(true)}>
                  <Plus className="w-4 h-4" /> Invite Member
                </Button>
              </div>

              {showAddMember && (
                <form onSubmit={handleAddTeamMember} className="p-4 bg-surface2 rounded-xl border border-border space-y-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="mem-name" className="text-xs">Full Name</Label>
                      <Input 
                        id="mem-name" 
                        placeholder="John Doe" 
                        value={newMemberName} 
                        onChange={(e) => setNewMemberName(e.target.value)}
                        className="bg-surface border-border h-9 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="mem-email" className="text-xs">Email Address</Label>
                      <Input 
                        id="mem-email" 
                        type="email"
                        placeholder="john@restaurant.com" 
                        value={newMemberEmail} 
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="bg-surface border-border h-9 text-xs" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="mem-role" className="text-xs">Role</Label>
                      <Input 
                        id="mem-role" 
                        placeholder="Manager / Cashier / Chef" 
                        value={newMemberRole} 
                        onChange={(e) => setNewMemberRole(e.target.value)}
                        className="bg-surface border-border h-9 text-xs" 
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" size="sm" className="border-border text-xs" onClick={() => setShowAddMember(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-primary text-white text-xs">
                      Send Invitation
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {team.map((member, i) => (
                  <div key={i} className="p-4 bg-surface2 border border-border rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                        {member.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary text-sm">{member.name}</h4>
                        <p className="text-xs text-text-muted">{member.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-border text-xs text-text-muted uppercase tracking-wider">{member.role}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="m-0 space-y-6">
            <Card className="p-6 bg-surface border-border">
              <h3 className="text-lg font-bold text-text-primary mb-2">Subscription & Usage</h3>
              <p className="text-xs text-text-muted mb-6">View your usage and manage your Stripe recurring subscription.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="p-4 bg-primary/5 border border-primary/20 flex flex-col justify-between">
                  <div>
                    <Badge className="bg-primary text-white text-[10px] font-bold tracking-widest uppercase">ACTIVE PLAN</Badge>
                    <h4 className="text-xl font-bold text-text-primary mt-2">Guileo Pro</h4>
                    <p className="text-xs text-text-muted">For high-velocity independent restaurants.</p>
                  </div>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-text-primary">$149</span>
                    <span className="text-xs text-text-muted">/ month</span>
                  </div>
                </Card>

                <Card className="p-4 bg-surface2/50 border border-border space-y-4">
                  <h4 className="font-bold text-text-primary text-xs uppercase tracking-widest">Monthly Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-text-primary">
                      <span>AI Voice Minutes</span>
                      <span>240 / 1,000 mins</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '24%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-text-primary">
                      <span>WhatsApp Outreach</span>
                      <span>430 / 2,000 messages</span>
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '21.5%' }} />
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex gap-4 justify-end">
                <Button variant="outline" className="border-border bg-surface text-text-primary uppercase text-xs font-bold" onClick={() => toast.success('Redirecting to Stripe Billing Portal...')}>
                  Manage Payments
                </Button>
                <Button className="bg-primary hover:bg-primary-dark text-white uppercase text-xs font-bold" onClick={() => toast.success('Opening checkout page...')}>
                  Change Plan
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="m-0 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: 'Stripe Connect', desc: 'Handle payments and payouts', icon: '💳', status: 'Connected', account: 'acct_123...abc' },
                { name: 'Twilio', desc: 'AI Voice & SMS gateway', icon: '📞', status: 'Connected', account: '+1 718-555-0100' },
                { name: 'DoorDash Drive', desc: 'On-demand delivery fleet', icon: '🛵', status: 'Disconnected' },
                { name: 'Toast POS', desc: 'Sync menu and orders', icon: '🍞', status: 'Coming Soon' },
              ].map((integ) => (
                <Card key={integ.name} className="p-6 bg-surface border-border flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-surface2 flex items-center justify-center text-2xl">
                        {integ.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary">{integ.name}</h4>
                        <p className="text-xs text-text-muted mt-1">{integ.desc}</p>
                      </div>
                    </div>
                    {integ.status === 'Connected' ? (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-bold">CONNECTED</Badge>
                    ) : (
                      <Badge variant="outline" className="text-text-muted border-border text-[10px] font-bold uppercase">{integ.status}</Badge>
                    )}
                  </div>
                  {integ.account && <p className="text-[10px] font-mono text-text-muted mb-4">{integ.account}</p>}
                  <Button 
                    variant={integ.status === 'Connected' ? "outline" : "default"} 
                    onClick={() => {
                      if (integ.status === 'Connected') {
                        toast.success(`Opening Stripe/Twilio integration dashboard for ${integ.name}...`);
                      } else if (integ.status === 'Disconnected') {
                        const loadingToast = toast.loading(`Connecting ${integ.name} gateway...`);
                        setTimeout(() => {
                          toast.dismiss(loadingToast);
                          toast.success(`${integ.name} successfully connected!`);
                        }, 1500);
                      }
                    }}
                    className={cn(
                      "w-full text-xs font-bold uppercase tracking-widest",
                      integ.status === 'Connected' ? "border-border text-text-primary" : integ.status === 'Disconnected' ? "bg-primary text-white" : "opacity-50 pointer-events-none"
                    )}
                  >
                    {integ.status === 'Connected' ? 'Manage' : integ.status === 'Disconnected' ? 'Connect Now' : 'Coming Soon'}
                  </Button>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="danger" className="m-0 space-y-6">
            <Card className="p-6 bg-red-500/5 border-2 border-red-500/20">
              <h3 className="text-lg font-bold text-danger mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h3>
              <p className="text-sm text-text-muted mb-8">
                These actions are irreversible. Please be certain before proceeding.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between py-4 border-b border-red-500/10">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Export All Restaurant Data</h4>
                    <p className="text-xs text-text-muted">Download all orders, customers, and menu in JSON/CSV format.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-border bg-surface2 text-text-primary"
                    onClick={() => {
                      toast.success("Successfully compiled and downloaded restaurant-data.json");
                    }}
                  >
                    Export Data
                  </Button>
                </div>
                <div className="flex items-center justify-between py-4 border-b border-red-500/10">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary">Delete All Customer Data</h4>
                    <p className="text-xs text-text-muted">Wipe all customer records for privacy compliance.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-red-500/30 bg-red-500/10 text-danger hover:bg-red-500/20"
                    onClick={() => {
                      const c = confirm("Are you absolutely sure you want to delete all customer intelligence profiles? This action is irreversible.");
                      if (c) {
                        toast.error("All customer data wiped for privacy compliance!");
                      }
                    }}
                  >
                    Delete Data
                  </Button>
                </div>
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="text-sm font-bold text-danger">Deactivate Restaurant</h4>
                    <p className="text-xs text-text-muted">Pause all AI operations and set account to dormant.</p>
                  </div>
                  <Button 
                    className="bg-danger hover:bg-red-700 text-white font-bold"
                    onClick={() => {
                      const c = confirm("Are you sure you want to pause all NYPDQ operations? The AI voice persona Sofia will stop answering incoming customer orders.");
                      if (c) {
                        toast.error("Restaurant has been deactivated. Sofia is offline.");
                      }
                    }}
                  >
                    Deactivate Account
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
