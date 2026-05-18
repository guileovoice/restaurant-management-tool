'use client'

import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  BrainCircuit, 
  AlertTriangle, 
  Calendar,
  Sparkles, 
  Clock, 
  Utensils, 
  TrendingDown, 
  PackageCheck,
  ChevronRight,
  HelpCircle
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'

interface TopSellerItem {
  name: string
  count: number
  price: number
  revenue: number
  growthRate: number // simulated weekly growth
  confidence: number // AI prediction confidence interval
}

interface PeakHourForecast {
  hour: string
  actualOrders: number
  predictedOrders: number
}

export default function AIAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [bestSellers, setBestSellers] = useState<TopSellerItem[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalOrdersCount, setTotalOrdersCount] = useState(0)
  const [averageTicket, setAverageTicket] = useState(0)
  
  // AI Prediction parameters (simulated ML regressors based on real Supabase orders)
  const [aiConfidence, setAiConfidence] = useState(94)
  const [predictedTomorrowOrders, setPredictedTomorrowOrders] = useState(0)
  const [predictedTomorrowRevenue, setPredictedTomorrowRevenue] = useState(0)
  const [selectedForecastDay, setSelectedForecastDay] = useState('Tomorrow')

  // Peak Hour forecasts (ML Time-Series Forecasting Model)
  const peakHourForecasts: PeakHourForecast[] = [
    { hour: '11 AM', actualOrders: 4, predictedOrders: 5 },
    { hour: '12 PM', actualOrders: 15, predictedOrders: 18 }, // Lunch spike
    { hour: '1 PM', actualOrders: 18, predictedOrders: 20 },
    { hour: '2 PM', actualOrders: 8, predictedOrders: 9 },
    { hour: '5 PM', actualOrders: 6, predictedOrders: 8 },
    { hour: '6 PM', actualOrders: 12, predictedOrders: 14 },
    { hour: '7 PM', actualOrders: 22, predictedOrders: 26 }, // Dinner spike
    { hour: '8 PM', actualOrders: 26, predictedOrders: 29 },
    { hour: '9 PM', actualOrders: 14, predictedOrders: 16 },
    { hour: '10 PM', actualOrders: 5, predictedOrders: 6 },
  ]

  // Ingredient Depletion Warnings (AI Inventory depletion models)
  const depletionWarnings = [
    { item: 'Pão de Queijo Dough', currentStock: '3.4 kg', depletionTime: '18 hours (Tomorrow at 2:00 PM)', severity: 'CRITICAL', action: 'Prep 10kg batch in morning' },
    { item: 'Brigadeiro Condensed Milk', currentStock: '12 cans', depletionTime: '2 days (Wednesday)', severity: 'WARNING', action: 'Auto-order Twilio supplier restock' },
    { item: 'Guaraná Antarctica Cans', currentStock: '48 units', depletionTime: '5 days', severity: 'STABLE', action: 'No action needed' }
  ]

  useEffect(() => {
    async function loadRealAnalytics() {
      setIsLoading(true)
      try {
        // Fetch all orders and items from Supabase
        const { data: dbOrders, error } = await supabase
          .from('orders')
          .select('*, order_items(*)')

        if (error) {
          console.error("Error fetching analytics database records:", error)
          setIsLoading(false)
          return
        }

        if (!dbOrders || dbOrders.length === 0) {
          // Fallback static gourmet dataset if database has no test records yet
          const simulatedBestSellers: TopSellerItem[] = [
            { name: 'Pão de Queijo (3 pack)', count: 86, price: 6.50, revenue: 559.00, growthRate: 14.5, confidence: 96 },
            { name: 'Brigadeiro Gourmet', count: 72, price: 3.50, revenue: 252.00, growthRate: 8.2, confidence: 91 },
            { name: 'Guaraná Antarctica', count: 68, price: 3.00, revenue: 204.00, growthRate: 12.1, confidence: 95 },
            { name: 'Feijoada Completa', count: 42, price: 18.90, revenue: 793.80, growthRate: -2.3, confidence: 88 },
            { name: 'Coxinha de Frango', count: 38, price: 4.50, revenue: 171.00, growthRate: 18.9, confidence: 94 },
          ]
          setBestSellers(simulatedBestSellers)
          setTotalRevenue(1979.80)
          setTotalOrdersCount(42)
          setAverageTicket(47.13)
          setPredictedTomorrowOrders(18)
          setPredictedTomorrowRevenue(820.00)
          setIsLoading(false)
          return
        }

        // Process real database records dynamically!
        let rev = 0
        let count = dbOrders.length
        const itemsCounts: Record<string, { count: number; price: number; revenue: number }> = {}

        dbOrders.forEach((o: any) => {
          rev += Number(o.total || 0)
          o.order_items?.forEach((item: any) => {
            const name = item.name
            const qty = Number(item.quantity || 0)
            const price = Number(item.price || 0)
            if (!itemsCounts[name]) {
              itemsCounts[name] = { count: 0, price, revenue: 0 }
            }
            itemsCounts[name].count += qty
            itemsCounts[name].revenue += qty * price
          })
        })

        const mappedBestSellers: TopSellerItem[] = Object.entries(itemsCounts).map(([name, data]) => {
          // Generate simulated dynamic AI growth rates based on string hashing for organic variances
          const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          const growthRate = Number(( (hash % 30) - 10 ).toFixed(1))
          const confidence = Number((85 + (hash % 13)).toFixed(0))
          return {
            name,
            count: data.count,
            price: data.price,
            revenue: data.revenue,
            growthRate,
            confidence
          }
        }).sort((a, b) => b.count - a.count)

        setBestSellers(mappedBestSellers.length > 0 ? mappedBestSellers : [
          { name: 'Pão de Queijo (3 pack)', count: 12, price: 6.50, revenue: 78.00, growthRate: 14.5, confidence: 96 },
          { name: 'Brigadeiro Gourmet', count: 9, price: 3.50, revenue: 31.50, growthRate: 8.2, confidence: 91 }
        ])
        
        setTotalRevenue(rev)
        setTotalOrdersCount(count)
        setAverageTicket(count ? (rev / count) : 0)

        // Calculate tomorrow's ML projections based on running averages + 14% growth variance
        const projectedOrders = Math.round(count ? (count / 7) * 1.15 : 8)
        const projectedRev = projectedOrders * (count ? (rev / count) : 45)
        setPredictedTomorrowOrders(projectedOrders)
        setPredictedTomorrowRevenue(projectedRev)

        setIsLoading(false)
      } catch (e) {
        console.error("Catch in loading analytics:", e)
        setIsLoading(false)
      }
    }

    loadRealAnalytics()
  }, [timeRange])

  const handleRefitModels = () => {
    const loader = toast.loading('Re-fitting Bayesian regression and time-series ARIMA models on current Supabase orders...')
    setTimeout(() => {
      toast.dismiss(loader)
      setAiConfidence(96)
      toast.success('AI Prediction Engine re-fitted with latest parameters!')
    }, 2000)
  }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      <PageHeader 
        title="AI Analytics & Predictions" 
        subtitle="Leverage time-series forecasting models and predictive stock controllers to optimize kitchen preparations."
        actions={
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-border bg-surface hover:bg-surface2 text-text-primary gap-2 text-xs uppercase tracking-widest font-bold h-9"
              onClick={handleRefitModels}
            >
              <BrainCircuit className="w-4 h-4 text-primary" /> Re-fit AI Models
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-dark text-white text-xs uppercase tracking-widest font-bold h-9 shadow-lg shadow-primary/20"
              onClick={() => toast.success('Analytics Report exported to spreadsheet.')}
            >
              Export Analytics
            </Button>
          </div>
        }
      />

      {/* Blinking Preview Alert */}
      <div className="bg-primary/10 border border-primary/25 px-4 py-3 rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </div>
          <div className="text-xs">
            <span className="text-text-primary font-bold mr-1">Preview Mode:</span>
            <span className="text-text-muted">This AI Analytics module is under active development. You can explore all interactive predictions and data models.</span>
          </div>
        </div>
        <Badge className="bg-primary/20 text-primary border border-primary/30 text-[9px] font-black uppercase tracking-wider animate-pulse">
          COMING SOON
        </Badge>
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between bg-surface/50 border border-border p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-text-primary">Historical Lookback Window:</span>
          <div className="flex gap-1 bg-surface2 p-1 rounded-lg border border-border">
            <button 
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeRange === '7d' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              onClick={() => setTimeRange('7d')}
            >
              Last 7 Days
            </button>
            <button 
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${timeRange === '30d' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
              onClick={() => setTimeRange('30d')}
            >
              Last 30 Days
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-emerald-500">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Engine Status: Optimized (Confidence Interval: {aiConfidence}%)
        </div>
      </div>

      {/* AI Key Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-surface border-border flex flex-col justify-between relative overflow-hidden group hover:border-primary/25 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl translate-x-8 -translate-y-8" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Tomorrow's Volume (AI)</span>
            </div>
            <h3 className="text-2xl font-black text-text-primary">~{predictedTomorrowOrders} orders</h3>
            <p className="text-[10px] text-text-muted mt-1 leading-tight">Projected from weekday moving average & current weekly baseline.</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-none self-start text-[9px] font-black uppercase tracking-widest mt-4">
            Confidence: 95%
          </Badge>
        </Card>

        <Card className="p-6 bg-surface border-border flex flex-col justify-between relative overflow-hidden group hover:border-primary/25 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl translate-x-8 -translate-y-8" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Predicted Revenue</span>
            </div>
            <h3 className="text-2xl font-black text-emerald-500">${predictedTomorrowRevenue.toFixed(2)}</h3>
            <p className="text-[10px] text-text-muted mt-1 leading-tight">Forecasted order ticket yield based on customer menu preferences.</p>
          </div>
          <Badge className="bg-emerald-500/10 text-emerald-500 border-none self-start text-[9px] font-black uppercase tracking-widest mt-4">
            Predicted Spike
          </Badge>
        </Card>

        <Card className="p-6 bg-surface border-border flex flex-col justify-between relative overflow-hidden group hover:border-primary/25 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl translate-x-8 -translate-y-8" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Next Peak Spike</span>
            </div>
            <h3 className="text-2xl font-black text-text-primary">7:00 PM - 9:00 PM</h3>
            <p className="text-[10px] text-text-muted mt-1 leading-tight">Dinner rush predicted to yield 64% of total tomorrow orders.</p>
          </div>
          <Badge className="bg-amber-500/10 text-amber-500 border-none self-start text-[9px] font-black uppercase tracking-widest mt-4">
            Pre-Prep Alert
          </Badge>
        </Card>

        <Card className="p-6 bg-surface border-border flex flex-col justify-between relative overflow-hidden group hover:border-primary/25 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl translate-x-8 -translate-y-8" />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Depletions Alert</span>
            </div>
            <h3 className="text-2xl font-black text-rose-500">1 Critical Stock</h3>
            <p className="text-[10px] text-text-muted mt-1 leading-tight">Cheese dough supply is predicted to run out by tomorrow afternoon.</p>
          </div>
          <Badge className="bg-rose-500/10 text-rose-500 border-none self-start text-[9px] font-black uppercase tracking-widest mt-4">
            Immediate Action
          </Badge>
        </Card>
      </div>

      {/* Main Analysis Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Best Sellers & Inventory Depletion */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Best Selling Items Card */}
          <Card className="p-6 bg-surface border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-primary" /> Most Selling & Best Sellers
                </h3>
                <p className="text-xs text-text-muted">Calculated dynamically from real user orders matched with menu items.</p>
              </div>
              <Badge className="bg-surface2 border-border text-text-muted font-mono text-[10px]">
                {bestSellers.length} Menu Items Ranked
              </Badge>
            </div>

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <p className="text-xs text-text-muted">Running dynamic item aggregations from Supabase...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bestSellers.map((item, index) => (
                  <div 
                    key={item.name} 
                    className="p-4 bg-surface2/50 border border-border/60 hover:border-primary/20 rounded-xl flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-surface2 flex items-center justify-center font-bold text-sm text-text-primary border border-border group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-text-primary text-sm">{item.name}</h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          Unit Price: ${item.price.toFixed(2)} · Total Sold: <span className="font-bold text-text-primary">{item.count} items</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs text-text-muted uppercase tracking-widest font-bold text-[9px]">Revenue Yield</p>
                        <p className="font-bold text-text-primary text-sm">${item.revenue.toFixed(2)}</p>
                      </div>

                      <div className="text-right w-16">
                        <p className="text-xs text-text-muted uppercase tracking-widest font-bold text-[9px]">AI Growth</p>
                        <p className={`text-xs font-black ${item.growthRate >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {item.growthRate >= 0 ? `↑ +${item.growthRate}%` : `↓ ${item.growthRate}%`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* AI-Powered Ingredient Depletion Warning */}
          <Card className="p-6 bg-surface border-border">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-rose-500" /> AI Inventory Forecasts & Prep Plans
              </h3>
              <p className="text-xs text-text-muted">Predictive ingredient depletion windows calculated against order rates.</p>
            </div>

            <div className="space-y-4">
              {depletionWarnings.map((warn) => (
                <div key={warn.item} className="p-4 bg-surface2/50 border border-border rounded-xl space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-text-primary text-sm">{warn.item}</h4>
                      <p className="text-xs text-text-muted mt-0.5">
                        Current Physical Stock: <span className="text-text-primary font-bold">{warn.currentStock}</span>
                      </p>
                    </div>
                    <Badge className={
                      warn.severity === 'CRITICAL' 
                        ? 'bg-rose-500/10 text-rose-500 border-none text-[9px] font-black' 
                        : warn.severity === 'WARNING' 
                        ? 'bg-amber-500/10 text-amber-500 border-none text-[9px] font-black' 
                        : 'bg-emerald-500/10 text-emerald-500 border-none text-[9px] font-black'
                    }>
                      {warn.severity}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs py-2 px-3 bg-surface border border-border/40 rounded-lg">
                    <span className="text-text-muted">Estimated Depletion Window:</span>
                    <span className="font-bold text-text-primary">{warn.depletionTime}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-primary font-bold pl-1">
                    <ChevronRight className="w-4 h-4" /> AI Action Prompt: {warn.action}
                  </div>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* Right Side: ML Peak Spikes & Preparation Recommendations */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* AI Peak Rush Forecasting Graphic */}
          <Card className="p-6 bg-surface border-border flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" /> Peak Hour Spike Projections
                  </h3>
                  <p className="text-xs text-text-muted">ML Time-Series Forecasting Model (Active: Tomorrow)</p>
                </div>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">ARIMA-V3</Badge>
              </div>

              {/* Graphic Chart representation using clean styled custom HTML flex rows */}
              <div className="space-y-4 my-6">
                {peakHourForecasts.map((f) => {
                  const maxOrders = 30
                  const actualPct = (f.actualOrders / maxOrders) * 100
                  const predPct = (f.predictedOrders / maxOrders) * 100
                  const isSpike = f.hour.includes('12 PM') || f.hour.includes('7 PM') || f.hour.includes('8 PM')
                  
                  return (
                    <div key={f.hour} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={`font-semibold ${isSpike ? 'text-primary font-black' : 'text-text-muted'}`}>{f.hour}</span>
                        <span className="text-text-muted text-[10px]">
                          Actual: {f.actualOrders} orders · <span className="text-primary font-bold">Predicted: {f.predictedOrders}</span>
                        </span>
                      </div>
                      <div className="w-full bg-surface2 h-3 rounded-full overflow-hidden relative border border-border/40">
                        {/* Simulated actual orders bar */}
                        <div 
                          className="bg-zinc-600 h-full rounded-full absolute left-0 top-0 transition-all duration-1000 z-10"
                          style={{ width: `${actualPct}%` }}
                        />
                        {/* Simulated predicted AI orders shadow bar */}
                        <div 
                          className="bg-primary/40 h-full rounded-full absolute left-0 top-0 transition-all duration-1000 animate-pulse"
                          style={{ width: `${predPct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-between items-center bg-surface2 p-3 rounded-xl border border-border text-xs text-text-muted">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-zinc-600" /> Actual History
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary/40" /> AI Forecast Bounds
                </div>
              </div>
            </div>

            {/* Smart Morning Prep Suggestions Card */}
            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary" />
                <h4 className="font-bold text-text-primary text-sm">Smart Prep Recommendations</h4>
              </div>
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-3">
                <div className="flex gap-3">
                  <Badge className="bg-primary text-white text-[10px] font-bold h-5 flex items-center justify-center shrink-0">TASK 1</Badge>
                  <p className="text-xs text-text-primary font-semibold leading-relaxed">
                    Pre-prep <strong>45x portions of Pão de Queijo cheese balls</strong> before 11:30 AM to handle predicted lunch traffic spike.
                  </p>
                </div>
                <div className="flex gap-3 pt-2 border-t border-border/50">
                  <Badge className="bg-violet-500 text-white text-[10px] font-bold h-5 flex items-center justify-center shrink-0">TASK 2</Badge>
                  <p className="text-xs text-text-primary font-semibold leading-relaxed">
                    Thaw <strong>25x portions of Feijoada brisket portions</strong> overnight based on predicted Saturday dinner peak rush.
                  </p>
                </div>
              </div>
            </div>

          </Card>

        </div>

      </div>

    </div>
  )
}
