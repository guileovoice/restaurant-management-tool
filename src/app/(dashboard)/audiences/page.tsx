'use client'

import { useState } from 'react'
import { Info, RefreshCw, Plus, CheckCircle2, AlertCircle, X, Check } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { adAudiences } from '@/lib/mock-data/campaigns'
import { toast } from 'react-hot-toast'

export default function AudiencesPage() {
  const [audiences, setAudiences] = useState(adAudiences)
  const [tiktokConnected, setTiktokConnected] = useState(false)
  
  // Custom dialog states
  const [showNewAudience, setShowNewAudience] = useState(false)
  const [newAudName, setNewAudName] = useState('')
  const [newAudSize, setNewAudSize] = useState('120')
  const [newAudPlatform, setNewAudPlatform] = useState<'META' | 'GOOGLE'>('META')

  const handleAccountSettings = (platform: string) => {
    toast.success(`Opening integration preferences for ${platform}...`)
  }

  const handleSyncNow = (audienceId: string, name: string) => {
    const loadingToast = toast.loading(`Hashing customer emails locally via SHA-256 and syncing to Meta Audience API...`)
    setTimeout(() => {
      toast.dismiss(loadingToast)
      setAudiences(prev => prev.map(aud => {
        if (aud.id === audienceId) {
          return { ...aud, lastSyncAt: new Date().toISOString() }
        }
        return aud
      }))
      toast.success(`Successfully uploaded SHA-256 matched records for "${name}"!`)
    }, 1500)
  }

  const handleLookalike = (name: string) => {
    toast.success(`Meta Lookalike Audience (1% ratio) generated based on "${name}" segment!`)
  }

  const handleConnectTikTok = () => {
    const loadingToast = toast.loading('Redirecting to TikTok OAuth 2.0 authorization node...')
    setTimeout(() => {
      toast.dismiss(loadingToast)
      setTiktokConnected(true)
      toast.success('Successfully connected TikTok pixel tracking and events!')
    }, 1200)
  }

  const handleCreateAudience = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAudName) {
      toast.error('Please enter an audience name.')
      return
    }

    const newAud = {
      id: `aud-${Date.now()}`,
      tenantId: 'nypdq',
      platform: newAudPlatform,
      name: newAudName,
      size: Number(newAudSize) || 120,
      lastSyncAt: new Date().toISOString(),
      status: 'SYNCED' as const,
      consentGated: true
    }

    setAudiences([...audiences, newAud])
    setNewAudName('')
    setShowNewAudience(false)
    toast.success(`Synced new ${newAudPlatform === 'META' ? 'Meta' : 'Google Customer Match'} segment: ${newAudName}`)
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Ad Audiences" 
        subtitle="Sync your customer segments to Meta, Google, and TikTok for better targeting."
      />

      <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex gap-4 items-start">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-text-primary font-bold mb-1">Privacy First Syncing</p>
          <p className="text-text-muted leading-relaxed">
            Only customers with <strong>Intelligence-tier consent</strong> are synced. All data is hashed using SHA-256 locally on your browser before being sent to ad platforms. 187 of 312 customers (60%) are eligible for syncing.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Meta Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Meta Custom Audiences</h3>
                <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3" /> Connected as "NYPDQ Ad Account"
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-border bg-surface text-text-primary text-xs font-bold uppercase tracking-widest h-9"
              onClick={() => handleAccountSettings('Meta Ads')}
            >
              Account Settings
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audiences.filter(a => a.platform === 'META').map(audience => (
              <Card key={audience.id} className="p-5 bg-surface border-border flex flex-col justify-between group hover:border-primary/30 transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-text-primary">{audience.name}</h4>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                        {audience.size} people · Last synced {audience.lastSyncAt ? 'just now' : '2h ago'}
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-black tracking-widest">SYNCED</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-border bg-surface2 text-text-primary h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white border-none"
                    onClick={() => handleSyncNow(audience.id, audience.name)}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Sync Now
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-border bg-surface2 text-text-primary h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-surface2"
                    onClick={() => handleLookalike(audience.name)}
                  >
                    Lookalike
                  </Button>
                </div>
              </Card>
            ))}
            <button 
              className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-surface2/30 transition-all text-text-muted hover:text-primary min-h-[140px]"
              onClick={() => {
                setNewAudPlatform('META')
                setShowNewAudience(true)
              }}
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-widest">New Audience</span>
            </button>
          </div>
        </section>

        {/* Google Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Google Customer Match</h3>
                <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-border bg-surface text-text-primary text-xs font-bold uppercase tracking-widest h-9"
              onClick={() => handleAccountSettings('Google Ads')}
            >
              Account Settings
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audiences.filter(a => a.platform === 'GOOGLE').map(audience => (
              <Card key={audience.id} className="p-5 bg-surface border-border flex flex-col justify-between group hover:border-primary/30 transition-all">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-text-primary">{audience.name}</h4>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">
                        {audience.size} people · Last synced {audience.lastSyncAt ? 'just now' : '2h ago'}
                      </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] font-black tracking-widest">SYNCED</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-border bg-surface2 text-text-primary h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-white border-none"
                    onClick={() => handleSyncNow(audience.id, audience.name)}
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Sync Now
                  </Button>
                </div>
              </Card>
            ))}
            <button 
              className="border-2 border-dashed border-border rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-surface2/30 transition-all text-text-muted hover:text-primary h-[140px]"
              onClick={() => {
                setNewAudPlatform('GOOGLE')
                setShowNewAudience(true)
              }}
            >
              <Plus className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-widest">New Google Audience</span>
            </button>
          </div>
        </section>

        {/* TikTok Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white shadow-lg">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.59-1.01-.01 2.62-.01 5.24-.02 7.86-.01 2.31-.5 4.67-2.14 6.28-1.58 1.64-4.04 2.37-6.26 2.05-2.61-.31-4.84-2.14-5.69-4.63-.98-2.63-.26-5.87 1.83-7.79 1.61-1.54 3.99-2.09 6.13-1.53v4.21c-1.1-.31-2.45-.16-3.32.61-1.12.87-1.28 2.61-.41 3.63.87 1.14 2.61 1.28 3.63.41.44-.37.71-.92.76-1.48.06-3.79.02-7.57.03-11.36z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">TikTok Events</h3>
                {tiktokConnected ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold uppercase tracking-widest">
                    <Check className="w-3 h-3 text-emerald-500" /> Connected
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-amber-500 font-bold uppercase tracking-widest">
                    <AlertCircle className="w-3 h-3" /> Not Connected
                  </div>
                )}
              </div>
            </div>
            {tiktokConnected ? (
              <Button 
                variant="outline" 
                className="border-border text-text-primary text-xs font-bold uppercase tracking-widest h-9"
                onClick={() => handleAccountSettings('TikTok Ads')}
              >
                Account Settings
              </Button>
            ) : (
              <Button 
                className="bg-primary hover:bg-primary-dark text-white text-xs font-bold uppercase tracking-widest h-9 px-6 shadow-lg shadow-primary/20"
                onClick={handleConnectTikTok}
              >
                Connect TikTok Ads
              </Button>
            )}
          </div>
        </section>
      </div>

      {/* New Audience Dialog */}
      {showNewAudience && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-surface border-border w-full max-w-md p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
              onClick={() => setShowNewAudience(false)}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div>
              <h3 className="text-lg font-bold text-text-primary">New Custom Ad Audience</h3>
              <p className="text-xs text-text-muted mt-1">Create a segment synced to your ad accounts.</p>
            </div>

            <form onSubmit={handleCreateAudience} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="aud-name">Audience Name</Label>
                <Input 
                  id="aud-name" 
                  placeholder="e.g. VIP Customers Q2" 
                  value={newAudName}
                  onChange={(e) => setNewAudName(e.target.value)}
                  className="bg-surface2 border-border"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="aud-size">Estimated Reach size (people)</Label>
                <Input 
                  id="aud-size" 
                  type="number"
                  placeholder="120" 
                  value={newAudSize}
                  onChange={(e) => setNewAudSize(e.target.value)}
                  className="bg-surface2 border-border"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="aud-plat">Target Platform</Label>
                <select 
                  id="aud-plat"
                  value={newAudPlatform}
                  onChange={(e: any) => setNewAudPlatform(e.target.value)}
                  className="w-full bg-surface2 border border-border rounded-lg h-9 px-3 text-sm text-text-primary outline-none focus:border-primary"
                >
                  <option value="META">Meta Ads (Facebook / Instagram)</option>
                  <option value="GOOGLE">Google Customer Match</option>
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="border-border uppercase text-xs font-bold"
                  onClick={() => setShowNewAudience(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary-dark text-white uppercase text-xs font-bold"
                >
                  Create & Sync
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
