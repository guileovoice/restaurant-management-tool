import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rvqcajvsnvafzdmdotcw.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

export async function upsertCustomerForOrder(
  tenantId: string,
  customerName: string,
  customerPhone: string,
  orderTotal: number
) {
  try {
    const phoneToQuery = customerPhone.trim()

    // 1. Query existing customer
    const { data: existingCustList, error: fetchErr } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phoneToQuery)
      .eq('tenant_id', tenantId)
      .limit(1)

    const existingCust = existingCustList && existingCustList.length > 0 ? existingCustList[0] : null

    if (fetchErr) {
      console.error("Error fetching existing customer:", fetchErr)
    }

    if (existingCust) {
      // 2. Fetch all orders for this customer (by phone or customer_id)
      const { data: customerOrders } = await supabase
        .from('orders')
        .select('total, status')
        .or(`customer_id.eq.${existingCust.id},customer_phone.eq.${phoneToQuery}`)

      const nonCancelledOrders = (customerOrders || []).filter(o => o.status !== 'CANCELLED')
      const totalSpent = nonCancelledOrders.reduce((sum, o) => sum + Number(o.total || 0), 0) + orderTotal

      const { error: updateErr } = await supabase
        .from('customers')
        .update({
          ltv: totalSpent,
          last_order_at: new Date().toISOString()
        })
        .eq('id', existingCust.id)

      if (updateErr) throw updateErr

      return existingCust.id
    } else {
      // 3. Create new customer
      const newCustomerId = crypto.randomUUID()
      const { error: insertErr } = await supabase
        .from('customers')
        .insert({
          id: newCustomerId,
          tenant_id: tenantId,
          name: customerName,
          phone: phoneToQuery,
          email: '',
          preferred_channel: 'WEB',
          consents: { essential: true, marketing: false, intelligence: false },
          churn_risk: 'LOW',
          ltv: orderTotal,
          rfm_segment: 'New',
          created_at: new Date().toISOString(),
          last_order_at: new Date().toISOString()
        })

      if (insertErr) throw insertErr
      return newCustomerId
    }
  } catch (err) {
    console.error("Error in upsertCustomerForOrder:", err)
    throw err
  }
}

