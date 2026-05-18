'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Building2, 
  Mic2, 
  UtensilsCrossed, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Play
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { MenuItem } from '@/lib/types'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'

const VOICES = [
  { id: 'v1', name: 'Alex', desc: 'Professional & Warm' },
  { id: 'v2', name: 'Sofia', desc: 'Friendly & Energetic' },
  { id: 'v3', name: 'Marcus', desc: 'Calm & Clear' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { setOnboardingData } = useRestaurantStore()
  const [step, setStep] = useState(1)
  
  // Step 1 Data
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    address: '',
    phone: '',
    category: 'Brazilian Cafe'
  })

  // Step 2 Data
  const [voiceSettings, setVoiceSettings] = useState({
    agentName: 'Alex',
    voiceId: 'v1',
    language: 'both' as const
  })

  // Step 3 Data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: 'initial-1',
      name: 'Pão de Queijo',
      description: 'Traditional Brazilian cheese bread made with tapioca flour.',
      price: 8.50,
      category: 'Salgados',
      imageUrl: '',
      available: true,
      preparationTime: 15,
      popular: true,
      allergens: ['Dairy'],
      tenantId: ''
    }
  ])

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => s - 1)

  const handleFinish = () => {
    setOnboardingData({
      info: businessInfo,
      menu: menuItems,
      voice: voiceSettings
    })
    toast.success('Onboarding complete! Welcome to Guileo.')
    router.push('/overview')
  }

  const addMenuItem = () => {
    const newItem: MenuItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      price: 0,
      category: 'General',
      imageUrl: '',
      available: true,
      preparationTime: 10,
      popular: false,
      allergens: [],
      tenantId: ''
    }
    setMenuItems([...menuItems, newItem])
  }

  const updateMenuItem = (id: string, field: keyof MenuItem, value: any) => {
    setMenuItems(menuItems.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const removeMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id))
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-12 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-border w-full -z-10" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-500 -z-10" 
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i}
              className={cn(
                "w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-300",
                step === i ? "bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/20" : 
                step > i ? "bg-emerald-500 border-emerald-500 text-white" : 
                "bg-surface border-border text-text-muted"
              )}
            >
              {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center lg:text-left">
                <Badge className="bg-primary/10 text-primary border-none mb-4 uppercase tracking-widest px-3 py-1 font-black text-[10px]">Step 1/4</Badge>
                <h1 className="text-4xl font-black text-text-primary mb-2 tracking-tighter">Tell us about your business</h1>
                <p className="text-text-muted">This info will appear on your dashboard and public order pages.</p>
              </div>

              <Card className="p-8 bg-surface border-border space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Restaurant Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <Input 
                        placeholder="e.g. NYPDQ Astoria" 
                        className="pl-10 bg-surface2 border-border h-12"
                        value={businessInfo.name}
                        onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Business Category</Label>
                    <Input 
                      placeholder="e.g. Brazilian Cafe, Italian Pizza" 
                      className="bg-surface2 border-border h-12"
                      value={businessInfo.category}
                      onChange={(e) => setBusinessInfo({...businessInfo, category: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Store Address</Label>
                    <Input 
                      placeholder="Street, City, State, ZIP" 
                      className="bg-surface2 border-border h-12"
                      value={businessInfo.address}
                      onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Contact Phone (For Customers)</Label>
                    <Input 
                      placeholder="+1 (xxx) xxx-xxxx" 
                      className="bg-surface2 border-border h-12"
                      value={businessInfo.phone}
                      onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button 
                  className="h-12 px-8 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-widest gap-2 shadow-xl shadow-primary/20"
                  disabled={!businessInfo.name || !businessInfo.address}
                  onClick={handleNext}
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center lg:text-left">
                <Badge className="bg-primary/10 text-primary border-none mb-4 uppercase tracking-widest px-3 py-1 font-black text-[10px]">Step 2/4</Badge>
                <h1 className="text-4xl font-black text-text-primary mb-2 tracking-tighter">Your AI Voice Agent</h1>
                <p className="text-text-muted">Configure how Guileo AI sounds when answering your calls.</p>
              </div>

              <Card className="p-8 bg-surface border-border space-y-8">
                <div className="space-y-2">
                  <Label>Agent Name</Label>
                  <div className="relative">
                    <Mic2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <Input 
                      placeholder="e.g. Alex" 
                      className="pl-10 bg-surface2 border-border h-12"
                      value={voiceSettings.agentName}
                      onChange={(e) => setVoiceSettings({...voiceSettings, agentName: e.target.value})}
                    />
                  </div>
                  <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">This is how the AI will introduce itself to customers.</p>
                </div>

                <div className="space-y-4">
                  <Label>Choose a Voice</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {VOICES.map((voice) => (
                      <div 
                        key={voice.id} 
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all cursor-pointer group flex flex-col justify-between h-32",
                          voiceSettings.voiceId === voice.id ? "border-primary bg-primary/5" : "border-border bg-surface2/50 hover:border-primary/30"
                        )}
                        onClick={() => setVoiceSettings({...voiceSettings, voiceId: voice.id})}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-text-primary">{voice.name}</h4>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-primary group-hover:scale-110 transition-transform">
                            <Play className="w-4 h-4 fill-primary" />
                          </Button>
                        </div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">{voice.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="flex justify-between">
                <Button variant="ghost" className="text-text-muted hover:text-text-primary font-bold uppercase tracking-widest" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  className="h-12 px-8 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-widest gap-2 shadow-xl shadow-primary/20"
                  onClick={handleNext}
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center lg:text-left flex items-start justify-between">
                <div>
                  <Badge className="bg-primary/10 text-primary border-none mb-4 uppercase tracking-widest px-3 py-1 font-black text-[10px]">Step 3/4</Badge>
                  <h1 className="text-4xl font-black text-text-primary mb-2 tracking-tighter">Seed your Menu</h1>
                  <p className="text-text-muted">Add at least one item to get started. You can add more later.</p>
                </div>
                <Button variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 gap-2 h-12 font-bold uppercase tracking-widest text-xs">
                  <Sparkles className="w-4 h-4" /> Import from PDF
                </Button>
              </div>

              <div className="space-y-4">
                {menuItems.map((item, index) => (
                  <Card key={item.id} className="p-6 bg-surface border-border flex flex-col md:flex-row gap-6 relative group">
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-black text-text-muted">Item Name</Label>
                          <Input 
                            value={item.name} 
                            onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                            placeholder="e.g. Cheese Bread"
                            className="bg-surface2 border-border h-10 font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] uppercase font-black text-text-muted">Price ($)</Label>
                          <Input 
                            type="number"
                            value={item.price} 
                            onChange={(e) => updateMenuItem(item.id, 'price', parseFloat(e.target.value))}
                            className="bg-surface2 border-border h-10 font-bold"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <Label className="text-[10px] uppercase font-black text-text-muted">Description</Label>
                          <Input 
                            value={item.description} 
                            onChange={(e) => updateMenuItem(item.id, 'description', e.target.value)}
                            placeholder="Briefly describe the item..."
                            className="bg-surface2 border-border h-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeMenuItem(item.id)}
                        disabled={menuItems.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}

                <Button 
                  variant="outline" 
                  className="w-full h-16 border-2 border-dashed border-border bg-transparent hover:border-primary/50 hover:bg-primary/5 text-text-muted hover:text-primary gap-2 transition-all group"
                  onClick={addMenuItem}
                >
                  <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-bold uppercase tracking-widest">Add Another Item</span>
                </Button>
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" className="text-text-muted hover:text-text-primary font-bold uppercase tracking-widest" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <Button 
                  className="h-12 px-8 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-widest gap-2 shadow-xl shadow-primary/20"
                  disabled={menuItems.some(i => !i.name || i.price <= 0)}
                  onClick={handleNext}
                >
                  Final Step <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              
              <div>
                <h1 className="text-5xl font-black text-text-primary mb-4 tracking-tighter">You're all set!</h1>
                <p className="text-text-muted text-lg max-w-md mx-auto">
                  Welcome to the future of restaurant management. Your AI voice agent is ready to start taking orders.
                </p>
              </div>

              <div className="bg-surface border border-border p-8 rounded-2xl max-w-sm mx-auto space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Restaurant</span>
                  <span className="text-text-primary font-bold">{businessInfo.name}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">AI Agent</span>
                  <span className="text-text-primary font-bold">{voiceSettings.agentName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Initial Menu</span>
                  <span className="text-text-primary font-bold">{menuItems.length} items</span>
                </div>
              </div>

              <Button 
                className="w-full h-16 bg-primary hover:bg-primary-dark text-white font-black text-xl uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/40"
                onClick={handleFinish}
              >
                Launch Dashboard <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


