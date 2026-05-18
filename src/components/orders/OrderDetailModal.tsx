'use client'

import { Order } from '@/lib/types'
import { cn } from '@/lib/utils'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Phone, 
  MapPin, 
  Clock, 
  CreditCard, 
  Printer, 
  MessageSquare,
  ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'

interface OrderDetailModalProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailModal({ order, isOpen, onClose }: OrderDetailModalProps) {
  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-surface border border-border w-full sm:max-w-2xl overflow-y-auto max-h-[90vh] p-6 shadow-2xl">
        <DialogHeader className="text-left space-y-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xl font-black text-text-muted">#{order.orderNumber}</span>
            <StatusBadge status={order.status} />
          </div>
          <DialogTitle className="text-2xl font-bold text-text-primary">Order Details</DialogTitle>
          <DialogDescription className="text-text-muted">
            Placed via {order.channel} · {format(new Date(order.createdAt), 'MMM d, yyyy h:mm a')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8">
          {/* Customer Section */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Customer Information</h4>
            <Card className="p-4 bg-surface2 border-border flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {order.customerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-bold text-text-primary">{order.customerName}</p>
                  <p className="text-xs text-text-muted">{order.customerPhone}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-primary hover:bg-primary/10">
                <Phone className="w-4 h-4" />
              </Button>
            </Card>
          </section>

          {/* Items Section */}
          <section className="space-y-4">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Items ({order.items.length})</h4>
            <div className="bg-surface2 rounded-xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface border-b border-border">
                  <tr className="text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">
                    <th className="px-4 py-2">Item</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {order.items.map((item) => (
                    <tr key={item.id} className="text-text-primary">
                      <td className="px-4 py-3 font-medium">{item.name}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right font-bold">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 bg-surface/50 space-y-2 border-t border-border">
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Delivery Fee</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 text-lg font-bold text-text-primary">
                  <span>Total</span>
                  <span className="text-primary">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Delivery Section */}
          {order.type === 'DELIVERY' && (
            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Delivery Address</h4>
              <Card className="p-4 bg-surface2 border-border flex items-center gap-4">
                <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                  <MapPin className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-text-primary">{order.address}</p>
              </Card>
            </section>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button variant="outline" className="border-border bg-surface text-text-primary gap-2 h-12">
              <Printer className="w-4 h-4" /> Print Ticket
            </Button>
            <Button variant="outline" className="border-border bg-surface text-text-primary gap-2 h-12">
              <MessageSquare className="w-4 h-4" /> SMS Update
            </Button>
            <Button className="col-span-2 bg-primary hover:bg-primary-dark text-white h-12 text-lg font-bold">
              Move to Next Status <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("rounded-xl border", className)}>{children}</div>
}
