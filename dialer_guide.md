# Vapi Outbound "Test Call" Dialer Implementation Guide

This guide explains how to replicate the Vapi Outbound Dialer in another Next.js (App Router) project using Supabase and Vapi.

---

## 1. Database Setup (Supabase)

Make sure you have a `vapi_call_logs` table in your database to store call results. 

---

## 2. Environment Variables (`.env.local`)

Add the following environment variables to your project:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Vapi Integration Keys
VAPI_PRIVATE_KEY=your_vapi_private_key_here
VAPI_ASSISTANT_ID=your_assistant_id_here
VAPI_PHONE_NUMBER_ID=your_phone_number_id_here
```

---

## 3. Backend Route Handlers

### A. Initiate Outbound Call
Create `src/app/api/vapi/call/route.ts`:

```typescript
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber || !phoneNumber.startsWith('+')) {
      return NextResponse.json(
        { error: 'Phone number must be in E.164 format, starting with +' },
        { status: 400 }
      )
    }

    const VAPI_KEY = process.env.VAPI_PRIVATE_KEY
    const ASSISTANT_ID = process.env.VAPI_ASSISTANT_ID
    const PHONE_NUMBER_ID = process.env.VAPI_PHONE_NUMBER_ID

    if (!VAPI_KEY || VAPI_KEY === 'your_vapi_private_key_here') {
      return NextResponse.json(
        { error: 'Vapi Private API Key is not configured. Please add VAPI_PRIVATE_KEY in .env.local' },
        { status: 500 }
      )
    }

    const body = {
      assistantId: ASSISTANT_ID,
      phoneNumberId: PHONE_NUMBER_ID,
      customer: {
        number: phoneNumber
      }
    }

    const response = await fetch('https://api.vapi.ai/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VAPI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || 'Failed to place call via Vapi' },
        { status: response.status }
      )
    }

    return NextResponse.json({
      callId: data.id,
      status: data.status,
      assistantId: data.assistantId,
      customer: data.customer
    })
  } catch (error: any) {
    console.error('Error starting Vapi call:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

---

### B. Poll Status & End Call Handler
Create `src/app/api/vapi/call/[callId]/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// GET: Poll call details and insert into DB when ended
export async function GET(
  request: Request,
  { params }: { params: Promise<{ callId: string }> }
) {
  try {
    const { callId } = await params

    if (!callId) {
      return NextResponse.json({ error: 'Call ID is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabaseServer = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Check if the call log already exists in the database
    const { data: dbCall } = await supabaseServer
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
      const customerPhone = vapiCall.customer?.number || ''
      let customerName = 'Unknown Customer'
      
      // Look up customer name from DB
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

      // Map status based on endedReason or duration
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

    // Call is active/ringing, return current status
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

// POST: Terminate an active call
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
```

---

## 4. Frontend Dialer Component

Create `src/app/(dashboard)/dialer/page.tsx`:

```tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Clock, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Volume2,
  Trash2,
  FileText
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function DialerPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [callId, setCallId] = useState<string | null>(null)
  const [callStatus, setCallStatus] = useState<string>('idle') // idle, placing, ringing, in-progress, ended, error
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [finalCallLog, setFinalCallLog] = useState<any | null>(null)
  const [isEnding, setIsEnding] = useState(false)

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleDialClick = (digit: string) => {
    if (callStatus !== 'idle' && callStatus !== 'ended' && callStatus !== 'error') return
    if (phoneNumber === '' && digit !== '+') {
      setPhoneNumber('+' + digit)
    } else {
      setPhoneNumber(prev => prev + digit)
    }
  }

  const handleBackspace = () => {
    if (callStatus !== 'idle' && callStatus !== 'ended' && callStatus !== 'error') return
    setPhoneNumber(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    if (callStatus !== 'idle' && callStatus !== 'ended' && callStatus !== 'error') return
    setPhoneNumber('')
  }

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins}:${s < 10 ? '0' : ''}${s}`
  }

  const startCall = async () => {
    if (!phoneNumber || !phoneNumber.startsWith('+')) {
      toast.error('Please enter a valid phone number starting with +')
      return
    }

    setCallStatus('placing')
    setErrorMessage(null)
    setSeconds(0)
    setFinalCallLog(null)

    try {
      const res = await fetch('/api/vapi/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to place call')

      setCallId(data.callId)
      setCallStatus(data.status || 'ringing')
      toast.success('Call initiated!')
      startPolling(data.callId)
    } catch (err: any) {
      setCallStatus('error')
      setErrorMessage(err.message || 'Failed to connect')
      toast.error(err.message || 'Failed to initiate call')
    }
  }

  const endCall = async () => {
    if (!callId) return
    setIsEnding(true)
    const toastId = toast.loading('Ending call...')

    try {
      const res = await fetch(`/api/vapi/call/${callId}`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to end call')
      toast.success('Call ended successfully', { id: toastId })
    } catch (err: any) {
      toast.error(err.message || 'Error ending call', { id: toastId })
    } finally {
      setIsEnding(false)
    }
  }

  const startPolling = (id: string) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/vapi/call/${id}`)
        const data = await res.json()
        if (!res.ok) throw new Error('Polling error')

        const newStatus = data.status
        if (newStatus === 'ended' || newStatus === 'completed' || newStatus === 'missed') {
          setCallStatus('ended')
          if (data.call) setFinalCallLog(data.call)
          stopPolling()
        } else {
          setCallStatus(newStatus)
        }
      } catch (err) {
        console.error(err)
      }
    }, 2000)
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  useEffect(() => {
    if (callStatus === 'in-progress') {
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
      }
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [callStatus])

  useEffect(() => {
    return () => stopPolling()
  }, [])

  const dialButtons = [
    { num: '1', letters: ' ' }, { num: '2', letters: 'ABC' }, { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' }, { num: '5', letters: 'JKL' }, { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' }, { num: '8', letters: 'TUV' }, { num: '9', letters: 'WXYZ' },
    { num: '+', letters: ' ' }, { num: '0', letters: '+' }, { num: '⌫', letters: 'DEL' },
  ]

  return (
    <div className="space-y-8 p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vapi Test Dialer</h1>
          <p className="text-sm text-gray-400">Place and test outbound calls</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Dialpad */}
        <Card className="p-6 flex flex-col items-center gap-6">
          <div className="w-full">
            <Input
              type="tel"
              placeholder="+14155552671"
              className="h-14 text-center text-xl font-mono font-bold"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={callStatus !== 'idle' && callStatus !== 'ended' && callStatus !== 'error'}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
            {dialButtons.map((btn) => (
              <button
                key={btn.num}
                onClick={() => btn.num === '⌫' ? handleBackspace() : handleDialClick(btn.num)}
                disabled={callStatus !== 'idle' && callStatus !== 'ended' && callStatus !== 'error'}
                className="w-16 h-16 rounded-full border border-gray-700 bg-gray-800 hover:bg-gray-700 text-white flex flex-col justify-center items-center active:scale-95 transition-all"
              >
                <span className="text-xl font-bold">{btn.num}</span>
                <span className="text-[8px] text-gray-400">{btn.letters}</span>
              </button>
            ))}
          </div>

          <div className="w-full">
            {callStatus === 'idle' || callStatus === 'ended' || callStatus === 'error' ? (
              <Button onClick={startCall} className="w-full h-12 bg-green-600 hover:bg-green-700 text-white">
                Call Assistant
              </Button>
            ) : (
              <Button onClick={endCall} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white">
                End Call
              </Button>
            )}
          </div>
        </Card>

        {/* Call Status Screen */}
        <Card className="p-6 flex flex-col justify-between min-h-[400px]">
          <div className="space-y-4">
            <h3 className="text-xs uppercase text-gray-400 tracking-wider">Status Monitor</h3>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center min-h-[200px]">
              <div className="text-center">
                {callStatus === 'idle' && <p className="text-gray-400 font-bold">Ready</p>}
                {callStatus === 'placing' && <p className="text-blue-400 animate-pulse">Placing Call...</p>}
                {callStatus === 'ringing' && <p className="text-blue-400 animate-bounce">Ringing...</p>}
                {callStatus === 'in-progress' && (
                  <div className="space-y-2">
                    <p className="text-green-500 font-bold">Connected</p>
                    <p className="font-mono text-xl">{formatTime(seconds)}</p>
                  </div>
                )}
                {callStatus === 'ended' && <p className="text-amber-500 font-bold">Call Ended</p>}
                {callStatus === 'error' && <p className="text-red-500">{errorMessage}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            {callId && <p className="text-xs font-mono text-gray-400">ID: {callId}</p>}
            {finalCallLog && (
              <div className="mt-2 text-xs bg-gray-900 p-3 rounded-lg border border-gray-800">
                <p className="font-bold uppercase text-[9px] text-gray-500">Summary</p>
                <p className="italic mt-1 text-gray-300">"{finalCallLog.summary}"</p>
                <div className="flex justify-between mt-3 text-gray-400">
                  <span>Duration: {finalCallLog.duration_seconds}s</span>
                  <span>Cost: ${finalCallLog.cost_usd.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
```
