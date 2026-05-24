'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRestaurantStore } from '@/lib/stores/restaurantStore'
import { Search, MoreVertical, Paperclip, Send, CheckCircle2, MessageSquare, Settings as SettingsIcon } from 'lucide-react'
import { format } from 'date-fns'

interface Message {
  id: string
  tenant_id: string
  phone_number: string
  contact_name: string
  direction: 'inbound' | 'outbound'
  message_body: string
  status: string
  created_at: string
}

interface ChatContact {
  phone_number: string
  contact_name: string
  last_message: string
  last_message_at: string
  unread_count: number
}

export function WhatsAppPanel() {
  const { info } = useRestaurantStore()
  const tenantId = info?.id || '395b50b9-9504-47ce-a8be-3b5c3ff22315'
  
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat')
  
  // Chat state
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [inputText, setInputText] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Settings state
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [settingsSaved, setSettingsSaved] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load Settings
  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('tenant_id', tenantId)
        .single()
      
      if (data) {
        setPhoneNumberId(data.phone_number_id || '')
        setAccessToken(data.access_token || '')
        setVerifyToken(data.verify_token || '')
      }
    }
    loadSettings()
  }, [tenantId])

  // Save Settings
  const handleSaveSettings = async () => {
    const { error } = await supabase
      .from('whatsapp_config')
      .upsert({
        tenant_id: tenantId,
        phone_number_id: phoneNumberId,
        access_token: accessToken,
        verify_token: verifyToken,
        updated_at: new Date().toISOString()
      }, { onConflict: 'tenant_id' })
      
    if (!error) {
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 3000)
    }
  }

  // Load Contacts
  useEffect(() => {
    async function loadContacts() {
      // For simplicity, we just aggregate from whatsapp_messages or whatsapp_inbound
      // A full implementation would use a proper GROUP BY view.
      const { data } = await supabase
        .from('whatsapp_messages')
        .select('phone_number, contact_name, message_body, created_at')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
      
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
    }
    
    loadContacts()
    
    // Subscribe to new messages
    const channel = supabase
      .channel('whatsapp-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'whatsapp_messages', filter: `tenant_id=eq.${tenantId}` },
        (payload) => {
          const newMsg = payload.new as Message
          
          setMessages(prev => {
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
        }
      )
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [tenantId, selectedPhone])

  // Load Messages for selected contact
  useEffect(() => {
    if (!selectedPhone) return
    
    async function loadMessages() {
      const { data } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('tenant_id', tenantId)
        .eq('phone_number', selectedPhone)
        .order('created_at', { ascending: true })
        
      if (data) {
        setMessages(data as Message[])
      }
    }
    loadMessages()
  }, [selectedPhone, tenantId])
  
  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedPhone) return
    
    const outMsg = {
      tenant_id: tenantId,
      phone_number: selectedPhone,
      contact_name: contacts.find(c => c.phone_number === selectedPhone)?.contact_name || selectedPhone,
      direction: 'outbound',
      message_body: inputText,
      status: 'sent'
    }
    
    setInputText('')
    
    // Insert Outbound
    const { data: insertedMsg } = await supabase.from('whatsapp_messages').insert(outMsg).select().single()
    
    // Dummy Testing Mode: Simulate an inbound reply 3 seconds later
    setTimeout(async () => {
      await supabase.from('whatsapp_messages').insert({
        tenant_id: tenantId,
        phone_number: selectedPhone,
        contact_name: outMsg.contact_name,
        direction: 'inbound',
        message_body: `Dummy Reply: I received "${insertedMsg?.message_body || outMsg.message_body}"`,
        status: 'received'
      })
    }, 3000)
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-[#09090B] text-text-primary">
      
      {/* Left Sidebar - Tab Navigation & Contacts list */}
      <div className="w-full md:w-[350px] flex flex-col border-r border-border bg-[#13131A]">
        {/* Tabs */}
        <div className="flex p-4 border-b border-border gap-2">
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${activeTab === 'chat' ? 'bg-primary text-white' : 'bg-surface hover:bg-surface2 text-text-muted'}`}
          >
            <MessageSquare size={16} /> Chat
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${activeTab === 'settings' ? 'bg-primary text-white' : 'bg-surface hover:bg-surface2 text-text-muted'}`}
          >
            <SettingsIcon size={16} /> Settings
          </button>
        </div>

        {activeTab === 'chat' && (
          <>
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search chats..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary text-white"
                />
              </div>
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
                      <h3 className="font-medium text-white truncate">{contact.contact_name}</h3>
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
                  No active chats found.
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right Area - Chat View or Settings View */}
      <div className="flex-1 flex flex-col bg-[#0f0f13] relative h-full">
        {activeTab === 'settings' ? (
          <div className="p-8 max-w-2xl mx-auto w-full">
            <h2 className="text-xl font-bold text-white mb-6">WhatsApp Meta API Settings</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Phone Number ID</label>
                <input 
                  type="text" 
                  value={phoneNumberId}
                  onChange={e => setPhoneNumberId(e.target.value)}
                  placeholder="e.g. 123456789012345"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Access Token</label>
                <input 
                  type="password" 
                  value={accessToken}
                  onChange={e => setAccessToken(e.target.value)}
                  placeholder="EAA..."
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-muted">Verify Token (Webhook)</label>
                <input 
                  type="text" 
                  value={verifyToken}
                  onChange={e => setVerifyToken(e.target.value)}
                  placeholder="my_secure_token_123"
                  className="w-full bg-surface border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSaveSettings}
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {settingsSaved ? <><CheckCircle2 size={18} /> Saved!</> : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          selectedPhone ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-border bg-[#13131A] flex items-center justify-between px-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {contacts.find(c => c.phone_number === selectedPhone)?.contact_name.substring(0, 2).toUpperCase() || 'CU'}
                  </div>
                  <div>
                    <h2 className="font-medium text-white">{contacts.find(c => c.phone_number === selectedPhone)?.contact_name || selectedPhone}</h2>
                    <p className="text-xs text-text-muted">{selectedPhone}</p>
                  </div>
                </div>
                <button className="text-text-muted hover:text-white transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-whatsapp-bg" style={{ backgroundImage: "url('https://i.pinimg.com/originals/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')", backgroundSize: 'cover', backgroundBlendMode: 'overlay', backgroundColor: 'rgba(15,15,19,0.9)' }}>
                {messages.map(msg => {
                  const isOutbound = msg.direction === 'outbound'
                  return (
                    <div key={msg.id} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-lg px-4 py-2 shadow-sm ${isOutbound ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-white rounded-tl-none'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.message_body}</p>
                        <div className="flex justify-end items-center gap-1 mt-1">
                          <span className="text-[10px] text-white/60">
                            {format(new Date(msg.created_at), 'HH:mm')}
                          </span>
                          {isOutbound && (
                            <CheckCircle2 size={12} className={msg.status === 'read' ? 'text-blue-400' : 'text-white/60'} />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-[#13131A] border-t border-border flex items-end gap-3 flex-shrink-0">
                <button className="p-2 text-text-muted hover:text-white transition-colors flex-shrink-0">
                  <Paperclip size={20} />
                </button>
                <textarea 
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message (Dummy Mode active)..."
                  className="flex-1 bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary resize-none h-[44px] max-h-[120px]"
                  rows={1}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-text-muted">
              Select a conversation to start chatting
            </div>
          )
        )}
      </div>
    </div>
  )
}
