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
