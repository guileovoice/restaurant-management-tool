import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ callId: string }> }
) {
  try {
    const { callId } = await params

    if (!callId) {
      return NextResponse.json({ error: 'Call ID is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rvqcajvsnvafzdmdotcw.supabase.co'
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Check if the call log already exists in the database
    const { data: dbCall, error: dbError } = await supabaseServer
      .from('vapi_call_logs')
      .select('*')
      .eq('id', callId)
      .maybeSingle()

    if (dbCall) {
      return NextResponse.json({
        status: dbCall.status,
        endedReason: 'ended',
        call: dbCall
      })
    }

    // 2. Fetch call details from Vapi API
    const VAPI_KEY = process.env.VAPI_PRIVATE_KEY
    if (!VAPI_KEY || VAPI_KEY === 'your_vapi_private_key_here') {
      return NextResponse.json({ error: 'Vapi Private Key is not configured' }, { status: 500 })
    }

    const response = await fetch(`https://api.vapi.ai/call/${callId}`, {
      headers: {
        'Authorization': `Bearer ${VAPI_KEY}`
      }
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData?.message || 'Failed to fetch call details from Vapi' },
        { status: response.status }
      )
    }

    const vapiCall = await response.json()

    // 3. If call has ended, insert it into Supabase database
    if (vapiCall.status === 'ended') {
      // Find customer name if exists
      const customerPhone = vapiCall.customer?.number || ''
      let customerName = 'Unknown Customer'
      if (customerPhone) {
        const { data: customerData } = await supabaseServer
          .from('customers')
          .select('name')
          .eq('phone', customerPhone)
          .limit(1)

        if (customerData && customerData.length > 0) {
          customerName = customerData[0].name
        }
      }

      // Map status
      let mappedStatus = 'completed'
      if (
        vapiCall.endedReason === 'no-answer' || 
        vapiCall.endedReason === 'voicemail' || 
        (vapiCall.durationSeconds || 0) === 0
      ) {
        mappedStatus = 'missed'
      }

      const startedAt = vapiCall.startedAt || vapiCall.createdAt || new Date().toISOString()
      
      const record = {
        id: callId,
        started_at: startedAt,
        customer_phone: customerPhone,
        customer_name: customerName,
        duration_seconds: Math.round(vapiCall.durationSeconds || 0),
        status: mappedStatus,
        cost_usd: vapiCall.cost || 0,
        source: 'VAPI',
        transcript: vapiCall.transcript || vapiCall.analysis?.transcript || '',
        summary: vapiCall.analysis?.summary || 'Call completed successfully.',
        recording_url: vapiCall.recordingUrl || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        vapi_account: 'sandbox',
        assistantId: vapiCall.assistantId || process.env.VAPI_ASSISTANT_ID || '',
        type: 'outboundPhoneCall'
      }

      const { error: insertErr } = await supabaseServer
        .from('vapi_call_logs')
        .insert(record)

      if (insertErr) {
        console.error('Error inserting call log into Supabase:', insertErr)
      }

      return NextResponse.json({
        status: mappedStatus,
        endedReason: vapiCall.endedReason,
        call: record
      })
    }

    // Call has not ended yet, return current status
    return NextResponse.json({
      status: vapiCall.status,
      endedReason: null,
      call: {
        id: callId,
        status: vapiCall.status,
        customer_phone: vapiCall.customer?.number || ''
      }
    })
  } catch (error: any) {
    console.error('Error polling Vapi call status:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ callId: string }> }
) {
  try {
    const { callId } = await params

    if (!callId) {
      return NextResponse.json({ error: 'Call ID is required' }, { status: 400 })
    }

    const VAPI_KEY = process.env.VAPI_PRIVATE_KEY
    if (!VAPI_KEY || VAPI_KEY === 'your_vapi_private_key_here') {
      return NextResponse.json({ error: 'Vapi Private Key is not configured' }, { status: 500 })
    }

    const response = await fetch(`https://api.vapi.ai/call/${callId}/end`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_KEY}`
      }
    })

    const data = await response.json().catch(() => ({}))

    return NextResponse.json({
      success: response.ok,
      data
    })
  } catch (error: any) {
    console.error('Error ending Vapi call:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
