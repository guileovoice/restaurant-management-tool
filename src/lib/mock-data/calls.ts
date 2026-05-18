import { CallLog } from '../types'

export const callLogs: any[] = [
  {
    id: 'call_1',
    started_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    customer_phone: '+1 718-555-0101',
    customer_name: 'João Mendes',
    duration_seconds: 142,
    status: 'completed',
    cost_usd: 0.45,
    source: 'vapi',
    transcript: [
      { role: 'assistant', text: 'Hello, welcome to NYPDQ. How can I help you today?' },
      { role: 'user', text: 'Hi, I would like to order two cheese breads and a coffee.' },
      { role: 'assistant', text: 'Great! Two Pão de Queijo and one Brazilian Coffee. Anything else?' },
      { role: 'user', text: 'No, that is all. For pickup.' }
    ],
    summary: 'Customer ordered 2x Pão de Queijo and 1x Coffee for pickup.',
    recording_url: 'https://example.com/recording1.mp3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vapi_account: 'normal',
    assistantId: 'ast_123',
    type: 'inbound'
  },
  {
    id: 'call_2',
    started_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    customer_phone: '+1 718-555-0202',
    customer_name: 'Sarah Connor',
    duration_seconds: 85,
    status: 'completed',
    cost_usd: 0.28,
    source: 'vapi',
    transcript: [
      { role: 'assistant', text: 'Hello, NYPDQ. Alex speaking.' },
      { role: 'user', text: 'Do you have gluten free options?' },
      { role: 'assistant', text: 'Yes, our Pão de Queijo is naturally gluten free as it is made with tapioca flour.' }
    ],
    summary: 'Inquiry about gluten-free options.',
    recording_url: 'https://example.com/recording2.mp3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vapi_account: 'normal',
    assistantId: 'ast_123',
    type: 'inbound'
  },
  {
    id: 'call_3',
    started_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    customer_phone: '+1 718-555-0303',
    customer_name: 'Marcus Wright',
    duration_seconds: 12,
    status: 'missed',
    cost_usd: 0,
    source: 'vapi',
    transcript: [],
    summary: 'Missed call from customer.',
    recording_url: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vapi_account: 'normal',
    assistantId: 'ast_123',
    type: 'inbound'
  }
]
