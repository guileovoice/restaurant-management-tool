'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useRestaurantStore()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const email = (formData.get('email') as string) || ''
    const password = (formData.get('password') as string) || ''

    try {
      const success = await login(email, password)
      if (success) {
        toast.success('Welcome back!')
        router.push('/overview')
      } else {
        toast.error('Could not sign you in. Please check your credentials.')
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(108,60,225,0.08)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,rgba(16,185,129,0.04)_0%,transparent_50%)]" />

      <div className="relative w-full max-w-sm mx-auto p-6 flex flex-col justify-center min-h-screen">
        <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center gap-4 mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-10 h-10">
              <rect width="32" height="32" rx="6" fill="#6C3CE1"/>
              <text x="16" y="22" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle">G</text>
            </svg>
            <div className="text-center">
              <h1 className="text-xl font-bold text-text-primary tracking-tight">
                Guileo<span className="text-primary">AI</span>
              </h1>
              <p className="text-xs text-text-muted mt-0.5">Restaurant Dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-text-muted uppercase tracking-widest">Email</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="name@restaurant.com" 
                  className="pl-10 bg-surface2 border-border h-11 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-text-muted uppercase tracking-widest">Password</Label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-primary transition-colors" />
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                  className="pl-10 pr-10 bg-surface2 border-border h-11 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 text-sm"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-all shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-[10px] text-text-muted text-center">
          &copy; {new Date().getFullYear()} Guileo AI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
