'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { 
  ShoppingBag, 
  ChevronRight, 
  Plus, 
  Minus, 
  Search, 
  Clock, 
  Truck, 
  MapPin,
  ArrowLeft,
  Flame,
  CheckCircle2
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { Label } from '@/components/ui/label'
import { useOrdersStore } from '@/lib/stores/ordersStore'
import { LanguageSelector } from '@/components/shared/LanguageSelector'

export default function PublicOrderPage() {
  const { tenant } = useParams()
  const { menu, info } = useRestaurantStore()
  const { addOrder } = useOrdersStore()
  const [cart, setCart] = useState<{id: string, quantity: number}[]>([])
  const [orderType, setOrderType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP')
  const [activeCategory, setActiveCategory] = useState('All')
  const [step, setStep] = useState<'MENU' | 'CHECKOUT' | 'SUCCESS'>('MENU')

  const categories = ['All', ...Array.from(new Set(menu.map(i => i.category)))]
  
  const addToCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id)
      if (existing) return prev.map(item => item.id === id ? {...item, quantity: item.quantity + 1} : item)
      return [...prev, {id, quantity: 1}]
    })
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.map(item => item.id === id ? {...item, quantity: Math.max(0, item.quantity - 1)} : item).filter(i => i.quantity > 0))
  }

  const getItem = (id: string) => menu.find(i => i.id === id)!
  const cartTotal = cart.reduce((sum, item) => sum + (getItem(item.id).price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCheckout = async () => {
    setIsSubmitting(true)
    const orderItems = cart.map(item => {
      const details = getItem(item.id)
      return {
         id: item.id,
         name: details.name,
         quantity: item.quantity,
         price: details.price,
         notes: ''
      }
    })
    
    const newOrder = {
      id: crypto.randomUUID(),
      orderNumber: Math.floor(1000 + Math.random() * 9000).toString(),
      customerName: 'Guest User',
      customerPhone: '',
      items: orderItems,
      subtotal: cartTotal,
      tax: cartTotal * 0.08875,
      deliveryFee: orderType === 'DELIVERY' ? 2.5 : 0,
      total: cartTotal * 1.08875 + (orderType === 'DELIVERY' ? 2.5 : 0),
      status: 'PENDING',
      type: orderType,
      channel: 'WEB',
      address: '',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await addOrder(newOrder as any)
    setIsSubmitting(false)
    setStep('SUCCESS')
  }

  if (step === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black text-text-primary mb-2">Order Confirmed!</h1>
        <p className="text-text-muted mb-8">Your order <span className="text-primary font-bold">#1048</span> has been placed successfully.</p>
        
        <Card className="w-full max-w-sm bg-surface border-border p-6 mb-8 text-left">
          <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-4">Summary</h3>
          <div className="space-y-3 mb-6">
            {cart.map(item => {
              const details = getItem(item.id)
              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-text-primary">{item.quantity}x {details.name}</span>
                  <span className="text-text-primary font-bold">${(details.price * item.quantity).toFixed(2)}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-lg font-black text-text-primary uppercase tracking-tighter">Total Paid</span>
            <span className="text-2xl font-black text-primary">${(cartTotal * 1.08).toFixed(2)}</span>
          </div>
        </Card>

        <div className="space-y-4 w-full max-w-sm">
          <div className="flex items-center gap-3 justify-center text-sm text-text-muted">
            <Clock className="w-4 h-4" /> Ready in ~20 minutes
          </div>
          <Button className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-bold uppercase tracking-widest" onClick={() => window.location.reload()}>
            Order Something Else
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-text-primary max-w-2xl mx-auto flex flex-col">
      {/* Mobile Header */}
      <header className="p-6 pb-2 sticky top-0 bg-background/80 backdrop-blur z-20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xl">
              {info?.name?.[0] || 'G'}
            </div>
            <div>
              <h1 className="text-lg font-black uppercase tracking-tight leading-none">{info?.name || 'Restaurant'}</h1>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mt-1">{info?.category || 'Cafe'} · {info?.address || 'Location'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector />
            <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-2 py-0.5 text-[10px] font-bold">OPEN NOW</Badge>
          </div>
        </div>

        <div className="flex bg-surface rounded-xl p-1 border border-border mb-6">
          <button 
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
              orderType === 'PICKUP' ? "bg-primary text-white shadow-lg" : "text-text-muted hover:text-text-primary"
            )}
            onClick={() => setOrderType('PICKUP')}
          >
            <MapPin className="w-3.5 h-3.5" /> Pickup
          </button>
          <button 
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all",
              orderType === 'DELIVERY' ? "bg-primary text-white shadow-lg" : "text-text-muted hover:text-text-primary"
            )}
            onClick={() => setOrderType('DELIVERY')}
          >
            <Truck className="w-3.5 h-3.5" /> Delivery
          </button>
        </div>

        {orderType === 'DELIVERY' && (
          <div className="relative mb-6">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
            <Input placeholder="Enter your delivery address..." className="pl-10 bg-surface border-border h-11 text-sm rounded-xl focus:ring-1 focus:ring-primary" />
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                activeCategory === cat 
                  ? "bg-text-primary text-background border-text-primary" 
                  : "bg-transparent text-text-muted border-border hover:border-text-muted"
              )}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Menu Sections */}
      <main className="flex-1 p-6 pt-2 space-y-8">
        {categories.slice(1).map(category => {
          if (activeCategory !== 'All' && activeCategory !== category) return null
          const items = menu.filter(i => i.category === category)
          return (
            <section key={category} className="space-y-4">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {items.map(item => (
                  <Card key={item.id} className="bg-surface border-border p-4 flex flex-col justify-between group active:scale-[0.98] transition-transform">
                    <div className="flex justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-text-primary">{item.name}</h4>
                          {item.popular && <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />}
                        </div>
                        <p className="text-[10px] text-text-muted line-clamp-2">{item.description}</p>
                      </div>
                      <div className="w-16 h-16 bg-surface2 rounded-lg flex items-center justify-center text-2xl shrink-0">
                        {item.id === 'm1' ? '🥯' : item.id === 'm10' ? '☕' : item.id === 'm16' ? '🥣' : '🇧🇷'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-primary">${item.price.toFixed(2)}</span>
                      <div className="flex items-center gap-2">
                        {cart.find(i => i.id === item.id) ? (
                          <div className="flex items-center bg-primary rounded-lg">
                            <button className="p-1.5 text-white" onClick={() => removeFromCart(item.id)}><Minus className="w-3 h-3" /></button>
                            <span className="text-xs font-bold text-white w-6 text-center">{cart.find(i => i.id === item.id)?.quantity}</span>
                            <button className="p-1.5 text-white" onClick={() => addToCart(item.id)}><Plus className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 border-primary text-primary hover:bg-primary hover:text-white px-4 rounded-lg font-bold text-xs"
                            onClick={() => addToCart(item.id)}
                          >
                            Add +
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )
        })}
      </main>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 z-30 pointer-events-none max-w-2xl mx-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full h-14 bg-primary hover:bg-primary-dark text-white shadow-2xl shadow-primary/40 pointer-events-auto rounded-2xl flex items-center justify-between px-6 transition-all active:scale-95">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 px-2 py-1 rounded text-xs font-black">{cartCount}</div>
                  <span className="font-black uppercase tracking-widest text-sm">View Cart</span>
                </div>
                <span className="font-black text-lg">${cartTotal.toFixed(2)}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="bg-surface border-t-2 border-primary h-[85vh] rounded-t-[32px] p-6 flex flex-col">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl font-black uppercase tracking-tighter text-text-primary flex items-center justify-between">
                  My Order
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                <div className="space-y-4">
                  {cart.map(item => {
                    const details = getItem(item.id)
                    return (
                      <div key={item.id} className="flex items-center justify-between group">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-text-primary">{details.name}</h4>
                          <p className="text-[10px] text-text-muted uppercase tracking-widest">${details.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center bg-surface2 rounded-xl border border-border">
                          <button className="p-2 text-text-muted hover:text-primary" onClick={() => removeFromCart(item.id)}><Minus className="w-4 h-4" /></button>
                          <span className="text-sm font-bold text-text-primary w-8 text-center">{item.quantity}</span>
                          <button className="p-2 text-text-muted hover:text-primary" onClick={() => addToCart(item.id)}><Plus className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="pt-6 border-t border-border space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Special Instructions</Label>
                  <Input placeholder="Extra crispy, no sugar, etc..." className="bg-surface2 border-border h-12" />
                </div>

                <div className="space-y-2 pt-6">
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>Estimated Tax (8.875%)</span>
                    <span>${(cartTotal * 0.08875).toFixed(2)}</span>
                  </div>
                  {orderType === 'DELIVERY' && (
                    <div className="flex justify-between text-xs text-text-muted">
                      <span>Delivery Fee</span>
                      <span>$2.50</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-4 text-xl font-black text-text-primary uppercase tracking-tighter">
                    <span>Total</span>
                    <span className="text-primary">${(cartTotal * 1.08 + (orderType === 'DELIVERY' ? 2.5 : 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-auto">
                <Button 
                  disabled={isSubmitting}
                  className="w-full h-16 bg-primary hover:bg-primary-dark text-white font-black text-xl uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20"
                  onClick={handleCheckout}
                >
                  {isSubmitting ? 'Processing...' : <><span className="mr-2">Confirm & Pay</span> <ChevronRight className="w-6 h-6" /></>}
                </Button>
                <p className="text-[10px] text-center text-text-muted mt-4">
                  By placing this order you agree to our Terms of Service.
                </p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  )
}
