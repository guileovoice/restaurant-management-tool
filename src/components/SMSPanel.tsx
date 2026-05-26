'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import {
  Search,
  MoreVertical,
  Send,
  CheckCircle2,
  MessageSquare,
  Settings as SettingsIcon,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Info
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

interface SMSMessage {
  id: string
  tenant_id: string
  phone_number: string
  contact_name: string
  direction: 'inbound' | 'outbound'
  message_body: string
  status: 'queued' | 'sent' | 'delivered' | 'failed' | 'received'
  created_at: string
}

interface ChatContact {
  phone_number: string
  contact_name: string
  last_message: string
  last_message_at: string
  unread_count: number
}

interface CustomerConsent {
  essential: boolean
  marketing: boolean
  intelligence: boolean
}

export function SMSPanel() {
  const { info } = useRestaurantStore()
  const tenantId = info?.id || '395b50b9-9504-47ce-a8be-3b5c3ff22315'

  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat')

  // Chat states
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [messages, setMessages] = useState<SMSMessage[]>([])
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isMarketingMessage, setIsMarketingMessage] = useState(false)

  // New Chat states
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [newChatPhone, setNewChatPhone] = useState('')
  const [newChatName, setNewChatName] = useState('')

  // Customer details & consent
  const [customerConsent, setCustomerConsent] = useState<CustomerConsent | null>(null)
  const [customerName, setCustomerName] = useState<string>('')

  // Settings states
  const [accountSid, setAccountSid] = useState('')
  const [authToken, setAuthToken] = useState('')
  const [twilioNumber, setTwilioNumber] = useState('')
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load Twilio Settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from('sms_config')
          .select('*')
          .eq('tenant_id', tenantId)
          .maybeSingle()

        if (error) {
          console.error('Error loading SMS settings:', error)
        } else if (data) {
          setAccountSid(data.account_sid || '')
          setAuthToken(data.auth_token || '')
          setTwilioNumber(data.twilio_number || '')
        }
      } catch (e) {
        console.error(e)
      }
    }
    loadSettings()
  }, [tenantId])

  // Save Settings
  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('sms_config')
        .upsert({
          tenant_id: tenantId,
          account_sid: accountSid,
          auth_token: authToken,
          twilio_number: twilioNumber,
          updated_at: new Date().toISOString()
        }, { onConflict: 'tenant_id' })

      if (error) {
        toast.error(`Failed to save settings: ${error.message}`)
      } else {
        setSettingsSaved(true)
        toast.success('Twilio credentials updated successfully!')
        setTimeout(() => setSettingsSaved(false), 3000)
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  // Load Contacts
  useEffect(() => {
    async function loadContacts() {
      try {
        const { data, error } = await supabase
          .from('sms_messages')
          .select('phone_number, contact_name, message_body, created_at')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading contacts:', error)
          return
        }

        if (data) {
          const contactMap = new Map<string, ChatContact>()
          data.forEach(msg => {
            if (!contactMap.has(msg.phone_number)) {
              contactMap.set(msg.phone_number, {
                phone_number: msg.phone_number,
                contact_name: msg.contact_name || msg.phone_number,
                last_message: msg.message_body,
                last_message_at: msg.created_at,
                unread_count: 0
              })
            }
          })
          setContacts(Array.from(contactMap.values()))
        }
      } catch (err) {
        console.error(err)
      }
    }

    loadContacts()

    // Subscribe to new messages for real-time
    const channel = supabase
      .channel('sms-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sms_messages', filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as SMSMessage

            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev
              if (selectedPhone === newMsg.phone_number) {
                return [...prev, newMsg]
              }
              return prev
            })

            setContacts(prev => {
              const existing = prev.find(c => c.phone_number === newMsg.phone_number)
              if (existing) {
                return [
                  { ...existing, last_message: newMsg.message_body, last_message_at: newMsg.created_at },
                  ...prev.filter(c => c.phone_number !== newMsg.phone_number)
                ]
              } else {
                return [
                  {
                    phone_number: newMsg.phone_number,
                    contact_name: newMsg.contact_name || newMsg.phone_number,
                    last_message: newMsg.message_body,
                    last_message_at: newMsg.created_at,
                    unread_count: 0
                  },
                  ...prev
                ]
              }
            })
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as SMSMessage
            setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m))
            setContacts(prev => prev.map(c => c.phone_number === updatedMsg.phone_number ? { ...c, last_message: updatedMsg.message_body, last_message_at: updatedMsg.created_at } : c))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tenantId, selectedPhone])

  // Load Messages for selected contact & check consents
  useEffect(() => {
    if (!selectedPhone) return

    async function loadMessages() {
      const { data } = await supabase
        .from('sms_messages')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('phone_number', selectedPhone)
        .order('created_at', { ascending: true })

      if (data) {
        setMessages(data as SMSMessage[])
      }
    }

    async function checkConsent() {
      try {
        const { data } = await supabase
          .from('customers')
          .select('name, consents')
          .eq('phone', selectedPhone)
          .eq('tenant_id', tenantId)
          .maybeSingle()

        if (data) {
          setCustomerName(data.name || '')
          setCustomerConsent(data.consents as CustomerConsent)
        } else {
          setCustomerName('')
          setCustomerConsent(null)
        }
      } catch (err) {
        console.error(err)
      }
    }

    loadMessages()
    checkConsent()
  }, [selectedPhone, tenantId])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleStartNewChat = () => {
    if (!newChatPhone.trim()) return
    const formattedPhone = newChatPhone.trim()
    const name = newChatName.trim() || formattedPhone

    const existing = contacts.find(c => c.phone_number === formattedPhone)
    if (!existing) {
      const newContact: ChatContact = {
        phone_number: formattedPhone,
        contact_name: name,
        last_message: 'New chat initiated',
        last_message_at: new Date().toISOString(),
        unread_count: 0
      }
      setContacts([newContact, ...contacts])
    }

    setSelectedPhone(formattedPhone)
    setShowNewChatModal(false)
    setNewChatPhone('')
    setNewChatName('')
  }

  // Send SMS
  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedPhone) return

    // 1. Consent Check for Marketing messages
    if (isMarketingMessage && customerConsent && !customerConsent.marketing) {
      toast.error('Cannot send marketing content. Customer has opted out.')
      return
    }

    const contactNameStr = contacts.find(c => c.phone_number === selectedPhone)?.contact_name || selectedPhone
    const outMsg = {
      tenant_id: tenantId,
      phone_number: selectedPhone,
      contact_name: contactNameStr,
      direction: 'outbound',
      message_body: inputText,
      status: 'queued'
    }

    setInputText('')

    // Insert outbound message to DB (Will trigger n8n flow via DB webhooks)
    const { data: insertedMsg, error } = await supabase
      .from('sms_messages')
      .insert(outMsg)
      .select()
      .single()

    if (error) {
      toast.error(`Failed to send: ${error.message}`)
      return
    }

    // In demo mode (no Twilio SID saved) update status to 'sent' after 1s and simulate inbound reply
    if (!accountSid && insertedMsg) {
      setTimeout(async () => {
        await supabase
          .from('sms_messages')
          .update({ status: 'sent' })
          .eq('id', insertedMsg.id)
      }, 1000)

      setTimeout(async () => {
        await supabase.from('sms_messages').insert({
          tenant_id: tenantId,
          phone_number: selectedPhone,
          contact_name: contactNameStr,
          direction: 'inbound',
          message_body: `Simulated Reply: Received message! Config your Twilio credentials to route real SMS.`,
          status: 'received'
        })
      }, 4000)
    }
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#09090B] text-text-primary">

      {/* Left Sidebar - Chat Contact List & Tab Toggle */}
      <div className="w-full md:w-[350px] flex flex-col border-r border-border bg-[#13131A] shrink-0">
        <div className="flex p-4 border-b border-border gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'bg-primary text-white' : 'bg-surface hover:bg-surface2 text-text-muted'}`}
          >
            <MessageSquare size={16} /> Chat
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors ${activeTab === 'settings' ? 'bg-primary text-white' : 'bg-surface hover:bg-surface2 text-text-muted'}`}
          >
            <SettingsIcon size={16} /> Settings
          </button>
        </div>

        {activeTab === 'chat' && (
          <>
            <div className="p-4 border-b border-border flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search SMS..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-white"
                />
              </div>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="bg-primary hover:bg-primary/95 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 transition-all active:scale-95"
              >
                + New
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {contacts.filter(c => c.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone_number.includes(searchQuery)).map(contact => (
                <div
                  key={contact.phone_number}
                  onClick={() => setSelectedPhone(contact.phone_number)}
                  className={`flex items-start gap-3 p-4 cursor-pointer hover:bg-surface2 transition-colors border-b border-border/50 ${selectedPhone === contact.phone_number ? 'bg-surface2' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary font-bold">
                    {contact.contact_name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-white truncate">{contact.contact_name}</h3>
                      <span className="text-[10px] text-text-muted">
                        {format(new Date(contact.last_message_at), 'HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted truncate">{contact.last_message}</p>
                  </div>
                </div>
              ))}
              {contacts.length === 0 && (
                <div className="p-8 text-center text-text-muted text-sm">
                  No active SMS logs found.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 flex flex-col bg-[#0F0F13] relative h-full">
        {activeTab === 'settings' ? (
          <div className="p-8 max-w-2xl mx-auto w-full overflow-y-auto">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6 flex gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-500 uppercase tracking-wide">Twilio Configuration</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Provide credentials from your Twilio Console. Webhooks will use these to route outbound/inbound SMS and process live updates. Leave blank to run in mock sandbox mode.
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-white mb-6">SMS Integrations Config</h2>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-muted">Account SID</label>
                <input
                  type="text"
                  value={accountSid}
                  onChange={e => setAccountSid(e.target.value)}
                  placeholder="AC..."
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-muted">Auth Token</label>
                <input
                  type="password"
                  value={authToken}
                  onChange={e => setAuthToken(e.target.value)}
                  placeholder="Enter Auth Token"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-text-muted">Twilio Number (SMS Enabled)</label>
                <input
                  type="text"
                  value={twilioNumber}
                  onChange={e => setTwilioNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="bg-primary hover:bg-primary/95 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg font-bold transition-all flex items-center gap-2"
                >
                  {settingsSaved ? <><CheckCircle2 size={18} /> Credentials Updated!</> : 'Save Credentials'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          selectedPhone ? (
            <>
              {/* Chat View Header */}
              <div className="h-20 border-b border-border bg-[#13131A] flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {customerName ? customerName.substring(0, 2).toUpperCase() : selectedPhone.substring(selectedPhone.length - 2)}
                  </div>
                  <div>
                    <h2 className="font-bold text-white">{customerName || 'Unknown Recipient'}</h2>
                    <p className="text-xs text-text-muted">{selectedPhone}</p>
                  </div>
                </div>

                {/* Compliance & Consent Badges */}
                <div className="flex items-center gap-3">
                  {customerConsent ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Consent Tier:</span>
                      {customerConsent.marketing ? (
                        <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded text-[10px] font-bold border border-emerald-500/20">
                          <ShieldCheck size={12} /> Marketing OK
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 bg-danger/10 text-danger px-2 py-1 rounded text-[10px] font-bold border border-danger/20">
                          <ShieldX size={12} /> Marketing Blocked
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-text-muted italic flex items-center gap-1">
                      <Info size={12} /> Auto-Essential Alerts Only
                    </span>
                  )}
                </div>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-950/20">
                {messages.map(msg => {
                  const isOutbound = msg.direction === 'outbound'
                  return (
                    <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-xl px-4 py-3 shadow-md ${isOutbound ? 'bg-primary/95 text-white rounded-tr-none' : 'bg-surface2 border border-border text-white rounded-tl-none'}`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message_body}</p>
                        <div className="flex justify-end items-center gap-2 mt-1.5 border-t border-white/10 pt-1">
                          <span className="text-[9px] text-white/50">
                            {format(new Date(msg.created_at), 'MMM d, HH:mm')}
                          </span>
                          {isOutbound && (
                            <span className={`text-[9px] font-bold uppercase ${msg.status === 'delivered' ? 'text-emerald-400' : msg.status === 'failed' ? 'text-danger' : 'text-white/55'}`}>
                              {msg.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>


            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-3">
              <MessageSquare size={48} className="text-border" />
              <p className="text-sm">Select an active SMS thread or save credentials in Settings.</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
