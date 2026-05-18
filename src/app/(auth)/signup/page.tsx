'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2, Building2, ArrowRight, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { signup } = useRestaurantStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Mock signup process
    setTimeout(() => {
      setIsLoading(false)
      signup()
      toast.success('Account created! Welcome to Guileo AI.')
      router.push('/onboarding')
    }, 2000)
  }

  return (
    <div className="flex min-h-screen w-full bg-background overflow-hidden">
      {/* Left Section - 60% */}
      <div className="w-full lg:w-[60%] p-8 md:p-16 lg:p-24 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <Link href="/login" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-text-primary tracking-tight">
              Guileo<span className="text-primary">AI</span>
            </span>
            <span className="text-xs text-text-muted mt-1">for Restaurants</span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto py-12">
          <div className="mb-8 text-center lg:text-left">
            <Badge className="bg-primary/10 text-primary border-none mb-4 uppercase tracking-widest px-3 py-1 font-black text-[10px]">Start your 14-day free trial</Badge>
            <h1 className="text-4xl font-black text-text-primary mb-2 tracking-tighter">Create your account</h1>
            <p className="text-text-muted">Set up your AI restaurant dashboard in minutes.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="restaurant">Restaurant Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input 
                  id="restaurant" 
                  placeholder="e.g. Astoria Pizza" 
                  className="pl-10 bg-surface2 border-border h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
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
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="At least 8 characters" 
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

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox id="terms" className="mt-1 border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary" required />
              <label htmlFor="terms" className="text-xs text-text-muted leading-relaxed">
                I agree to the <button type="button" className="text-primary hover:underline">Terms of Service</button> and <button type="button" className="text-primary hover:underline">Privacy Policy</button>, including automated processing of call transcripts.
              </label>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-primary hover:bg-primary-dark text-white font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-primary/20 gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Get Started Now <ArrowRight className="w-5 h-5" /></>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-text-muted">
            Already have an account? <Link href="/login" className="text-primary hover:underline font-bold">Sign in</Link>
          </p>
        </div>

        <div className="text-[10px] text-text-muted flex gap-6 justify-center lg:justify-start">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-500" /> GDPR Compliant</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-amber-500" /> Instant Setup</span>
        </div>
      </div>

      {/* Right Section - 40% */}
      <div className="hidden lg:flex w-[40%] bg-surface/50 border-l border-border relative overflow-hidden flex-col items-center justify-center p-12">
        <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        <div className="relative z-10 w-full max-w-sm space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-black text-text-primary tracking-tighter mb-4">Everything you need to automate your store.</h2>
            <p className="text-text-muted text-sm">Join 500+ restaurants using Guileo AI to save 40+ hours every month.</p>
          </div>

          <div className="space-y-4">
            {[
              { title: 'AI Voice Ordering', desc: 'Handle 100% of calls automatically.' },
              { title: 'Predictive CRM', desc: 'Know which customers are about to churn.' },
              { title: 'Automated Campaigns', desc: 'Sync audiences with Meta & TikTok ads.' },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface border border-border p-4 rounded-xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-text-primary">{feature.title}</h4>
                  <p className="text-[10px] text-text-muted uppercase tracking-widest">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl relative">
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
              99%
            </div>
            <p className="text-sm italic text-text-primary leading-relaxed">
              "Guileo handled 140 orders in its first weekend without a single error. Our staff finally stopped fearing the phone."
            </p>
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mt-4">— Marco, Astoria Pizza</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
