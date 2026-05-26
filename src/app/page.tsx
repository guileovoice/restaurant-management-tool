'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  ShoppingBag, 
  ChevronRight, 
  Plus, 
  Minus, 
  Search, 
  Clock, 
  Truck, 
  MapPin,
  Flame,
  CheckCircle2,
  LogIn,
  CreditCard,
  User,
  Phone,
  Sparkles,
  ShieldCheck,
  Star,
  Quote,
  UtensilsCrossed,
  Heart,
  ChevronDown
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { supabase, upsertCustomerForOrder } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'

export default function ProfessionalLandingPage() {
  const { menu, info, fetchMenu, fetchTenantInfo } = useRestaurantStore()
  const [cart, setCart] = useState<{id: string, quantity: number}[]>([])
  const [orderType, setOrderType] = useState<'PICKUP' | 'DELIVERY'>('PICKUP')
  const [activeCategory, setActiveCategory] = useState('All')
  const [step, setStep] = useState<'MENU' | 'SUCCESS'>('MENU')
  const [searchQuery, setSearchQuery] = useState('')

  // Checkout Form States
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  // Payment Modal States
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [isPaying, setIsPaying] = useState(false)

  // Success States
  const [placedOrderNumber, setPlacedOrderNumber] = useState('')
  const [placedOrderTotal, setPlacedOrderTotal] = useState(0)

  // Refs for smooth scroll
  const menuSectionRef = useRef<HTMLDivElement>(null)

  // Load menu items and tenant details from Supabase on mount
  useEffect(() => {
    fetchTenantInfo('nypdq')
    fetchMenu()
  }, [fetchMenu, fetchTenantInfo])

  const categories = ['All', ...Array.from(new Set(menu.map(i => i.category)))]
  
  const addToCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id)
      if (existing) return prev.map(item => item.id === id ? {...item, quantity: item.quantity + 1} : item)
      return [...prev, {id, quantity: 1}]
    })
    toast.success('Added to basket!')
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.map(item => item.id === id ? {...item, quantity: Math.max(0, item.quantity - 1)} : item).filter(i => i.quantity > 0))
  }

  const getItem = (id: string) => menu.find(i => i.id === id)!
  const cartTotal = cart.reduce((sum, item) => sum + (getItem(item.id).price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  
  const tax = cartTotal * 0.08875
  const deliveryFee = orderType === 'DELIVERY' ? 2.50 : 0
  const finalTotal = cartTotal + tax + deliveryFee

  const handleCheckoutClick = () => {
    if (!customerName || !customerPhone) {
      toast.error('Please enter your name and phone number.')
      return
    }
    if (orderType === 'DELIVERY' && !address) {
      toast.error('Please enter a delivery address.')
      return
    }
    setIsPaymentOpen(true)
  }

  const handlePaymentDone = async () => {
    setIsPaying(true)
    try {
      // 1. Generate Order Number
      const orderNum = Math.floor(1000 + Math.random() * 9000).toString()
      const orderId = crypto.randomUUID()
      const tenantId = info?.id || '395b50b9-9504-47ce-a8be-3b5c3ff22315'

      // 1.5. Upsert customer and get customer_id
      const customerId = await upsertCustomerForOrder(
        tenantId,
        customerName,
        customerPhone,
        finalTotal
      )

      // 2. Insert into orders table in Supabase
      const { error: orderErr } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          order_number: orderNum,
          tenant_id: tenantId,
          customer_id: customerId,
          customer_name: customerName,
          customer_phone: customerPhone,
          subtotal: cartTotal,
          delivery_fee: deliveryFee,
          tax: tax,
          total: finalTotal,
          status: 'PAID',
          type: orderType,
          channel: 'WEB',
          address: orderType === 'DELIVERY' ? address : null,
          payment_status: 'PAID',
          notes: notes,
          order_place_at: new Date().toISOString(),
          order_items: JSON.stringify(cart.map(item => {
            const dish = getItem(item.id)
            return {
              id: dish.id,
              name: dish.name,
              quantity: item.quantity,
              price: dish.price,
              notes: ''
            }
          })),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (orderErr) throw orderErr

      // 3. Insert into order_items table in Supabase
      const orderItems = cart.map(item => {
        const dish = getItem(item.id)
        return {
          id: crypto.randomUUID(),
          order_id: orderId,
          menu_item_id: dish.id,
          name: dish.name,
          quantity: item.quantity,
          price: dish.price
        }
      })

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsErr) throw itemsErr

      // 4. Trigger Success State
      setPlacedOrderNumber(orderNum)
      setPlacedOrderTotal(finalTotal)
      setIsPaymentOpen(false) // Close the modal first

      // Ping n8n Webhook to trigger WhatsApp confirmation for Web Orders
      try {
        fetch('https://n8n.srv1010832.hstgr.cloud/webhook/web-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            orderId,
            orderNumber: orderNum,
            customerName,
            customerPhone,
            address: orderType === 'DELIVERY' ? address : 'Pickup at 3101 31st Ave, Astoria, NY',
            subtotal: cartTotal,
            tax: tax,
            total: finalTotal,
            items: orderItems,
            paymentLink: `https://pay.guileo.com/order/${orderNum}`
          })
        }).catch(err => console.error('Failed to trigger WA webhook', err));
      } catch (err) {
        console.error('Failed to trigger WA webhook', err);
      }

      // Ping n8n Webhook to trigger SMS confirmation for Web Orders
      try {
        fetch('https://n8n.srv1010832.hstgr.cloud/webhook/sms-notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'order_confirmation',
            tenant_id: tenantId,
            phone_number: customerPhone,
            customer_name: customerName,
            order_number: orderNum,
            total: finalTotal,
            link: `https://pay.guileo.com/order/${orderNum}`
          })
        }).catch(err => console.error('Failed to trigger SMS webhook', err));
      } catch (err) {
        console.error('Failed to trigger SMS webhook', err);
      }

      // Wait 300ms before changing UI step so the Radix Dialog can cleanly remove the body scroll lock!
      setTimeout(() => {
        setStep('SUCCESS')
        setCart([])
      }, 300)
      
      toast.success('Payment authorized! Order sent to kitchen.')
    } catch (err: any) {
      console.error(err)
      toast.error(`Transaction Declined: ${err.message || err}`)
    } finally {
      setIsPaying(false)
    }
  }

  // Scroll to menu
  const scrollToMenu = () => {
    menuSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Filter menu items by category and search query
  const filteredMenu = menu.filter(item => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (step === 'SUCCESS') {
    return (
      <div className="min-h-screen bg-[#0D0D11] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-6 animate-pulse border border-emerald-500/20">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Order Confirmed!</h1>
        <p className="text-zinc-400 max-w-md mx-auto mb-8 leading-relaxed">
          Culinary prep is underway! Chef is crafting your gourmet selection. Your order reference is <span className="text-amber-500 font-bold font-mono">#{placedOrderNumber}</span>.
        </p>
        
        <Card className="w-full max-w-sm bg-zinc-900/90 border-zinc-800 p-6 mb-8 text-left shadow-2xl">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Gourmet Summary</h3>
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-4">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Type</span>
              <span className="text-sm font-bold text-white">{orderType}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Est. Pickup Time</span>
              <span className="text-sm font-bold text-emerald-500">~20 minutes</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-white uppercase tracking-tighter">Amount Paid</span>
            <span className="text-2xl font-black text-amber-500">${placedOrderTotal.toFixed(2)}</span>
          </div>
        </Card>

        <div className="space-y-4 w-full max-w-sm">
          <div className="flex items-center gap-3 justify-center text-sm text-zinc-400">
            <Clock className="w-4 h-4 text-amber-500" /> Real-time ticket is open on our kitchen board
          </div>
          <Button 
            className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-bold uppercase tracking-widest rounded-xl transition-all" 
            onClick={() => window.location.reload()}
          >
            Order Something Else
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0D0D11] text-zinc-100 flex flex-col font-sans overflow-x-hidden">
      
      {/* Premium Dark Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 bg-[#0D0D11]/85 backdrop-blur-md z-40 border-b border-zinc-900/80 transition-all">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-amber-500/10">
              {info?.name?.[0] || 'N'}
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight uppercase block leading-none text-white">
                {info?.name || 'NYPDQ Restaurant'}
              </span>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-[0.15em] mt-1 block">
                Artisan Cuisine
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="hover:text-amber-500 transition-colors">Home</button>
            <button onClick={scrollToMenu} className="hover:text-amber-500 transition-colors">Culinary Menu</button>
            <a href="#about" className="hover:text-amber-500 transition-colors">Our Craft</a>
            <a href="#testimonials" className="hover:text-amber-500 transition-colors">Reviews</a>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              onClick={scrollToMenu} 
              className="hidden sm:flex bg-amber-500 hover:bg-amber-600 text-black text-xs font-bold uppercase tracking-wider h-10 px-6 rounded-xl transition-all shadow-lg shadow-amber-500/10"
            >
              Order Online
            </Button>
            <Link 
              href="/login" 
              className="p-2.5 bg-zinc-900 border border-zinc-800/80 hover:bg-amber-500/10 hover:text-amber-500 transition-all rounded-xl text-zinc-400 flex items-center gap-2"
              title="Employee Admin Access"
            >
              <LogIn className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider hidden lg:inline">Admin Entrance</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Gourmet Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 overflow-hidden border-b border-zinc-900">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full">
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              ✨ Premium Brazilian Fusion & Stone Baked Pizza
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.05] uppercase">
              Artisan <span className="text-amber-500 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">Brazilian</span> Bites & Pizzeria
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
              Savor authentic, golden-crisp Brazilian coxinhas, delicate warm pão de queijo, and wood-fired stone pizzas. Handcrafted with clean, locally sourced organic ingredients.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Button 
                onClick={scrollToMenu} 
                className="w-full sm:w-auto h-14 bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase tracking-widest px-8 rounded-2xl transition-all shadow-xl shadow-amber-500/15 flex items-center gap-2 text-sm"
              >
                Explore Culinary Menu <ChevronRight className="w-5 h-5" />
              </Button>
              <Button 
                onClick={scrollToMenu}
                variant="outline" 
                className="w-full sm:w-auto h-14 border-zinc-800 hover:bg-zinc-900 text-white font-bold uppercase tracking-widest px-8 rounded-2xl transition-all text-xs"
              >
                Chef's Specials
              </Button>
            </div>

            {/* Micro Stats Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-6 border-t border-zinc-900/60 text-xs text-zinc-500 font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-white">4.9 Star Rating</span> (2.4k+ Diners)
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-white">⏱ ~20 Mins Delivery</span> Fast & Fresh
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center relative">
            {/* Visual Glassmorphic Accent Graphic */}
            <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-[48px] bg-gradient-to-br from-zinc-800 to-zinc-900/40 border border-zinc-800 p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 font-extrabold uppercase text-[9px] tracking-widest">
                  Live Cooking
                </Badge>
              </div>

              <div>
                <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">Gourmet Selection</p>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Wood-Fired & Golden Glazed</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  Wood-fired, stone-oven stone Pizzas paired with our hand-kneaded signature appetizers. Made fresh daily.
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                <span>Astoria, Queens</span>
                <span className="text-amber-500 flex items-center gap-1">Order Now <ChevronRight className="w-3.5 h-3.5" /></span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Down Arrow */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer opacity-40 hover:opacity-100 transition-opacity" onClick={scrollToMenu}>
          <ChevronDown className="w-6 h-6 text-zinc-400" />
        </div>
      </section>

      {/* Culinary Excellence features */}
      <section id="about" className="py-24 bg-[#0A0A0D] border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              🌿 Our Philosophy
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">Culinary Perfection, Delivered</h2>
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              We fuse time-honored baking methods with high-quality local ingredients to craft a truly memorable dining experience in your own home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-zinc-900/60 border-zinc-800/80 p-8 flex flex-col justify-between hover:border-amber-500/35 transition-all duration-300 rounded-2xl group">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5 fill-amber-500/20" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Wood-Fired Baking</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Pizzas cooked inside brick stone ovens at 800°F to produce absolute crust perfection and smoky wood flavors.
              </p>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800/80 p-8 flex flex-col justify-between hover:border-amber-500/35 transition-all duration-300 rounded-2xl group">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Hand-Glazed Savory</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Artisanal Brazilian bites filled with slow-cooked shredded chicken breast and cream cheese inside a crispy panko glaze.
              </p>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800/80 p-8 flex flex-col justify-between hover:border-amber-500/35 transition-all duration-300 rounded-2xl group">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">Organic Ingredients</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                Zero artificial preservatives, processed cheese, or fillers. Just fresh produce and premium imported cheese.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Interactive Menu Explorer */}
      <section ref={menuSectionRef} className="py-24 bg-[#0D0D11]">
        <div className="max-w-6xl mx-auto px-6">
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest mb-3">
                🍽 Gourmet Menu
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">Explore Our Masterpieces</h2>
              <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider mt-2">
                Loaded live from NYPDQ culinary reserve
              </p>
            </div>

            {/* Search filter */}
            <div className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input 
                placeholder="Search specialty dishes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 h-11 text-xs rounded-xl focus:border-amber-500"
              />
            </div>
          </div>

          {/* Category Capsules */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide border-b border-zinc-900">
            {categories.map(cat => (
              <button
                key={cat}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border",
                  activeCategory === cat 
                    ? "bg-amber-500 text-black border-amber-500 font-extrabold shadow-lg shadow-amber-500/15" 
                    : "bg-transparent text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                )}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Culinary menu items grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.slice(1).map(category => {
              if (activeCategory !== 'All' && activeCategory !== category) return null
              
              const items = filteredMenu.filter(i => i.category === category)
              if (items.length === 0) return null

              return (
                <div key={category} className="col-span-full space-y-6">
                  <div className="flex items-center gap-4 mt-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.25em] text-zinc-500">{category}</h3>
                    <div className="flex-1 h-px bg-zinc-900" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map(item => (
                      <Card key={item.id} className="bg-zinc-900/40 border-zinc-800/80 hover:border-amber-500/30 overflow-hidden flex flex-col justify-between group transition-all duration-300 rounded-2xl h-full">
                        
                        <div className="relative aspect-video bg-zinc-900 flex items-center justify-center overflow-hidden border-b border-zinc-900">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                          ) : (
                            <span className="text-4xl">
                              {item.category === 'Doces' ? '🍩' : item.category === 'Bebidas' ? '🥤' : '🥐'}
                            </span>
                          )}
                          <div className="absolute top-2 right-2 flex gap-2">
                            {item.popular && (
                              <Badge className="bg-amber-500 text-black border-none gap-1 font-bold text-[9px] uppercase tracking-wider">
                                <Flame className="w-2.5 h-2.5 fill-black" /> Popular
                              </Badge>
                            )}
                            {!item.available && (
                              <Badge variant="destructive" className="font-bold text-[9px] uppercase tracking-wider">
                                Sold Out
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start">
                              <h4 className="font-extrabold text-white text-sm group-hover:text-amber-500 transition-colors uppercase tracking-tight">{item.name}</h4>
                              <span className="font-black text-amber-500 text-sm font-mono">${item.price.toFixed(2)}</span>
                            </div>
                            <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-zinc-900">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">
                              ⏱ {item.preparationTime || 5} Min Prep
                            </span>
                            
                            <div className="flex items-center gap-2">
                              {cart.find(i => i.id === item.id) ? (
                                <div className="flex items-center bg-amber-500 rounded-lg">
                                  <button className="p-1 text-black" onClick={() => removeFromCart(item.id)}><Minus className="w-3.5 h-3.5" /></button>
                                  <span className="text-xs font-black text-black w-6 text-center">{cart.find(i => i.id === item.id)?.quantity}</span>
                                  <button className="p-1 text-black" onClick={() => addToCart(item.id)}><Plus className="w-3.5 h-3.5" /></button>
                                </div>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 border-zinc-800 text-zinc-300 hover:bg-amber-500 hover:text-black hover:border-amber-500 px-3 rounded-lg font-bold text-xs uppercase tracking-wider"
                                  onClick={() => addToCart(item.id)}
                                  disabled={!item.available}
                                >
                                  {item.available ? 'Add +' : 'Sold Out'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredMenu.length === 0 && (
            <div className="text-center py-20 border border-dashed border-zinc-900 rounded-2xl bg-zinc-900/10">
              <p className="text-sm text-zinc-500">No masterpieces match your query.</p>
            </div>
          )}
        </div>
      </section>

      {/* Customer testimonials */}
      <section id="testimonials" className="py-24 bg-[#0A0A0D] border-t border-b border-zinc-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              ⭐ DINER TESTIMONIALS
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white uppercase tracking-tight">Highly Appraised By Queens Locals</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-zinc-900/30 border-zinc-800/80 p-8 rounded-2xl flex flex-col justify-between">
              <Quote className="w-8 h-8 text-amber-500/30 mb-4" />
              <p className="text-zinc-300 text-xs leading-relaxed font-medium mb-6 italic">
                "The wood-fired stone pizza base has that perfect char from the brick oven. And the chicken coxinhas are incredibly golden and crispy on the outside, but completely tender and moist inside!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-amber-500">MC</div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Maria Caldas</h4>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">Astoria Resident</span>
                </div>
              </div>
            </Card>

            <Card className="bg-zinc-900/30 border-zinc-800/80 p-8 rounded-2xl flex flex-col justify-between">
              <Quote className="w-8 h-8 text-amber-500/30 mb-4" />
              <p className="text-zinc-300 text-xs leading-relaxed font-medium mb-6 italic">
                "Finding high-quality Brazilian bites in Queens that actually taste authentic has been a challenge until NYPDQ opened. Fast delivery, beautifully boxed, and the pão de queijo is always warm."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-amber-500">JM</div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">João Mendes</h4>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">Gourmet Critic</span>
                </div>
              </div>
            </Card>

            <Card className="bg-zinc-900/30 border-zinc-800/80 p-8 rounded-2xl flex flex-col justify-between">
              <Quote className="w-8 h-8 text-amber-500/30 mb-4" />
              <p className="text-zinc-300 text-xs leading-relaxed font-medium mb-6 italic">
                "Stunning ordering flow. I placed an order directly via their frontend, filled out card details, and it arrived hot at my doorstep in 20 minutes flat. Best local bistro by far."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-amber-500">CS</div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase">Carlos Santos</h4>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">Astoria Local</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="bg-[#08080A] py-12 text-zinc-500 text-xs border-t border-zinc-900/80">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-black font-black text-base shadow shadow-amber-500/10">
              {info?.name?.[0] || 'N'}
            </div>
            <div>
              <span className="text-zinc-300 font-bold uppercase tracking-wider block">
                {info?.name || 'NYPDQ'}
              </span>
              <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest mt-0.5 block">
                © 2026. All Rights Reserved.
              </span>
            </div>
          </div>

          <div className="flex gap-6 uppercase font-bold tracking-widest text-[9px] text-zinc-400">
            <a href="#about" className="hover:text-amber-500 transition-colors">Our Kitchen</a>
            <a href="#testimonials" className="hover:text-amber-500 transition-colors">Diner Feedback</a>
            <Link href="/login" className="hover:text-amber-500 transition-colors">Employee Login</Link>
          </div>
        </div>
      </footer>

      {/* Floating Basket Sheet button */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 z-30 pointer-events-none max-w-lg mx-auto">
          <Sheet>
            <SheetTrigger asChild>
              <Button className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-black shadow-2xl shadow-amber-500/25 pointer-events-auto rounded-2xl flex items-center justify-between px-6 transition-all active:scale-95">
                <div className="flex items-center gap-3">
                  <div className="bg-black/10 px-2 py-1 rounded text-xs font-black">{cartCount}</div>
                  <span className="font-extrabold uppercase tracking-widest text-xs">View Basket Selection</span>
                </div>
                <span className="font-black text-base font-mono">${cartTotal.toFixed(2)}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-zinc-950 border-l border-zinc-900 w-full sm:max-w-md p-5 flex flex-col text-white h-full">
              <SheetHeader className="mb-4 border-b border-zinc-900 pb-3">
                <SheetTitle className="text-lg font-black uppercase tracking-tighter text-white flex items-center justify-between">
                  Culinary Order Basket
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                </SheetTitle>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                
                {/* Cart Items list */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Dished items</span>
                  {cart.map(item => {
                    const details = getItem(item.id)
                    return (
                      <div key={item.id} className="flex items-center justify-between group py-2 border-b border-zinc-900/60">
                        <div className="flex-1">
                          <h4 className="text-xs font-extrabold text-white uppercase tracking-tight">{details.name}</h4>
                          <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-mono">${details.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center bg-zinc-900 rounded-xl border border-zinc-800">
                          <button className="p-1.5 text-zinc-400 hover:text-amber-500" onClick={() => removeFromCart(item.id)}><Minus className="w-3 h-3" /></button>
                          <span className="text-xs font-black text-white w-6 text-center">{item.quantity}</span>
                          <button className="p-1.5 text-zinc-400 hover:text-amber-500" onClick={() => addToCart(item.id)}><Plus className="w-3 h-3" /></button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Contact Information Form */}
                <div className="pt-5 border-t border-zinc-900 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">Diner & Details</span>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="custName" className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Full Name *</Label>
                      <Input 
                        id="custName" 
                        value={customerName} 
                        onChange={(e) => setCustomerName(e.target.value)} 
                        placeholder="John Doe" 
                        className="bg-zinc-900 border-zinc-800 text-xs h-10 rounded-xl text-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="custPhone" className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Phone Number *</Label>
                      <Input 
                        id="custPhone" 
                        value={customerPhone} 
                        onChange={(e) => setCustomerPhone(e.target.value)} 
                        placeholder="718-555-0199" 
                        className="bg-zinc-900 border-zinc-800 text-xs h-10 rounded-xl text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                    <button 
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all",
                        orderType === 'PICKUP' ? "bg-amber-500 text-black shadow-lg" : "text-zinc-400 hover:text-white"
                      )}
                      onClick={() => setOrderType('PICKUP')}
                    >
                      <MapPin className="w-3 h-3" /> Pickup Counter
                    </button>
                    <button 
                      className={cn(
                        "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all",
                        orderType === 'DELIVERY' ? "bg-amber-500 text-black shadow-lg" : "text-zinc-400 hover:text-white"
                      )}
                      onClick={() => setOrderType('DELIVERY')}
                    >
                      <Truck className="w-3 h-3" /> Delivery
                    </button>
                  </div>

                  {orderType === 'DELIVERY' && (
                    <div className="space-y-1">
                      <Label htmlFor="delAddress" className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Delivery Address *</Label>
                      <Input 
                        id="delAddress" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        placeholder="3101 31st Ave, Astoria, NY" 
                        className="bg-zinc-900 border-zinc-800 text-xs h-10 rounded-xl text-white"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <Label htmlFor="orderNotes" className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Cooking Requests</Label>
                    <Input 
                      id="orderNotes" 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)} 
                      placeholder="Extra crispy pastries, garlic sauce, etc..." 
                      className="bg-zinc-900 border-zinc-800 text-xs h-10 rounded-xl text-white"
                    />
                  </div>
                </div>

                {/* Subtotals & Fees */}
                <div className="space-y-2 pt-5 border-t border-zinc-900">
                  <div className="flex justify-between text-[9px] text-zinc-500 uppercase tracking-wider font-bold">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-zinc-500 uppercase tracking-wider font-bold">
                    <span>NY Sales Tax (8.875%)</span>
                    <span className="font-mono text-white">${tax.toFixed(2)}</span>
                  </div>
                  {orderType === 'DELIVERY' && (
                    <div className="flex justify-between text-[9px] text-zinc-500 uppercase tracking-wider font-bold">
                      <span>Delivery Fee</span>
                      <span className="font-mono text-white">$2.50</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 text-base font-black text-white uppercase tracking-tighter border-t border-zinc-900 mt-2">
                    <span>Total Bill</span>
                    <span className="text-amber-500 font-mono">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Confirm button */}
              <div className="pt-4 mt-auto border-t border-zinc-900">
                <Button 
                  className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-amber-500/20"
                  onClick={handleCheckoutClick}
                >
                  Proceed to Checkout <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Premium Payment Dialog with Credit Card Mockup */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-900 text-white max-w-sm rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-white text-lg font-bold flex items-center gap-2 uppercase tracking-wide">
              <CreditCard className="w-5 h-5 text-amber-500" /> Payment Authorization
            </DialogTitle>
          </DialogHeader>

          {/* Interactive Credit Card Mockup */}
          <div className="max-w-[280px] w-full mx-auto aspect-[1.586/1] rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 p-4 flex flex-col justify-between text-black relative shadow-2xl overflow-hidden mb-4">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">NYPDQ Premium</span>
              <span className="font-bold text-[10px]">VISA</span>
            </div>

            <div className="space-y-3">
              <div className="text-sm font-mono font-bold tracking-widest text-center">
                {cardNumber ? cardNumber.replace(/(\d{4})/g, '$1 ').trim() : '•••• •••• •••• ••••'}
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[7px] uppercase tracking-widest text-zinc-900 font-bold block">Card Holder</span>
                  <span className="text-[10px] font-bold uppercase tracking-tight truncate max-w-[120px] block">
                    {customerName || 'YOUR NAME'}
                  </span>
                </div>
                <div>
                  <span className="text-[7px] uppercase tracking-widest text-zinc-900 font-bold block">Expiry</span>
                  <span className="text-[10px] font-mono font-bold">{cardExpiry || 'MM/YY'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 py-2">
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-900 flex items-center justify-between text-xs">
              <div>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Gourmet Billing</span>
                <span className="text-white font-bold">{orderType} Mode</span>
              </div>
              <span className="text-lg font-mono font-black text-amber-500">${finalTotal.toFixed(2)}</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cardNum" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Card Number</Label>
                <Input 
                  id="cardNum" 
                  value={cardNumber} 
                  onChange={(e) => setCardNumber(e.target.value)} 
                  placeholder="4111 2222 3333 4444" 
                  maxLength={16}
                  className="bg-zinc-900 border-zinc-850 text-xs rounded-xl h-11 text-white focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cardExp" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Expiry Date</Label>
                  <Input 
                    id="cardExp" 
                    value={cardExpiry} 
                    onChange={(e) => setCardExpiry(e.target.value)} 
                    placeholder="MM/YY" 
                    maxLength={5}
                    className="bg-zinc-900 border-zinc-850 text-xs rounded-xl h-11 text-white focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cardCVV" className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">CVV</Label>
                  <Input 
                    id="cardCVV" 
                    type="password"
                    value={cardCvv} 
                    onChange={(e) => setCardCvv(e.target.value)} 
                    placeholder="***" 
                    maxLength={3}
                    className="bg-zinc-900 border-zinc-850 text-xs rounded-xl h-11 text-white focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="border-zinc-800 text-zinc-400 hover:bg-zinc-900" 
              onClick={() => setIsPaymentOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold uppercase text-xs tracking-wider" 
              onClick={handlePaymentDone}
              disabled={isPaying}
            >
              {isPaying ? 'Authorizing...' : 'Payment Done ✓'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
