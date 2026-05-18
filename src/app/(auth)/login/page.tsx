'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useRestaurantStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Mock authentication
    setTimeout(() => {
      setIsLoading(false)
      login()
      toast.success('Welcome back, Alex!')
      router.push('/overview')
    }, 1500)
  }

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* Left Section - 60% */}
      <div className="w-full lg:w-[60%] p-8 md:p-16 lg:p-24 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-text-primary tracking-tight">
            Guileo<span className="text-primary">AI</span>
          </span>
          <span className="text-xs text-text-muted mt-1">for Restaurants</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h1>
            <p className="text-text-muted">Sign in to your restaurant dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@restaurant.com" 
                  className="pl-10 bg-surface2 border-border h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline font-medium">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="pl-10 pr-10 bg-surface2 border-border h-12"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="remember" className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
              <label htmlFor="remember" className="text-sm text-text-muted cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary-dark text-white font-semibold text-base transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-text-muted">or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              type="button"
              className="w-full h-12 border-border bg-transparent text-text-primary hover:bg-surface2"
            >
              Sign in with Magic Link
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-text-muted">
          Don't have an account? <Link href="/signup" className="text-primary hover:underline font-bold">Start your free trial</Link>
        </div>
      </div>

      {/* Right Section - 40% */}
      <div className="hidden lg:flex w-[40%] bg-surface/50 border-l border-border relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        <div className="relative z-10 w-full max-w-sm space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border p-6 rounded-2xl shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">LIVE</Badge>
            </div>
            <p className="text-text-muted text-sm mb-1">Orders today</p>
            <h3 className="text-4xl font-bold text-text-primary">47</h3>
            <p className="text-emerald-500 text-sm mt-1 font-medium">↑ 12% vs yesterday</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-surface border border-border p-6 rounded-2xl shadow-2xl ml-8"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 font-bold">JM</div>
              <div>
                <p className="text-sm font-semibold text-text-primary">João Mendes</p>
                <p className="text-[10px] text-text-muted">Ordered via VOICE · 2m ago</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">2x Pão de Queijo</span>
                <span className="text-text-primary font-medium">$17.00</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-muted">1x Brazilian Coffee</span>
                <span className="text-text-primary font-medium">$4.00</span>
              </div>
            </div>
          </motion.div>

          <div className="text-center space-y-4 pt-8">
            <p className="text-text-muted text-xs uppercase tracking-widest font-semibold">Integrates with</p>
            <div className="flex items-center justify-center gap-6 grayscale opacity-50">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-5" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Twilio-Logo.svg" alt="Twilio" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/22/Vapi-Logo.svg" alt="Vapi" className="h-5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
