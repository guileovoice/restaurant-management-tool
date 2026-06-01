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
import { PageHeader } from '@/components/shared/PageHeader'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { CallAnalysisDialog } from '@/components/shared/CallAnalysisDialog'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

export default function DialerPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [callId, setCallId] = useState<string | null>(null)
  const [callStatus, setCallStatus] = useState<string>('idle') // idle, placing, ringing, in-progress, ended, error
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [finalCallLog, setFinalCallLog] = useState<any | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEnding, setIsEnding] = useState(false)

  // Polling interval ref
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Timer interval ref
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Handle dial button click
  const handleDialClick = (digit: string) => {
    if (callStatus !== 'idle' && callStatus !== 'ended' && callStatus !== 'error') return
    
    // Auto add + if it's the first character and not already there
    if (phoneNumber === '' && digit !== '+') {
      setPhoneNumber('+' + digit)
    } else {
      setPhoneNumber(prev => prev + digit)
    }
  }

  // Handle backspace
  const handleBackspace = () => {
    if (callStatus !== 'idle' && callStatus !== 'ended' && callStatus !== 'error') return
    setPhoneNumber(prev => prev.slice(0, -1))
  }

  // Handle clear
  const handleClear = () => {
    if (callStatus !== 'idle' && callStatus !== 'ended' && callStatus !== 'error') return
    setPhoneNumber('')
  }

  // Format timer seconds to mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins}:${s < 10 ? '0' : ''}${s}`
  }

  // Start outbound call
  const startCall = async () => {
    if (!phoneNumber) {
      toast.error('Please enter a phone number')
      return
    }

    if (!phoneNumber.startsWith('+')) {
      toast.error('Phone number must start with + and include country code')
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

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to initiate call')
      }

      setCallId(data.callId)
      setCallStatus(data.status || 'ringing')
      toast.success('Call initiated successfully!')

      // Start polling status
      startPolling(data.callId)
    } catch (err: any) {
      console.error(err)
      setCallStatus('error')
      setErrorMessage(err.message || 'Call failed to start')
      toast.error(err.message || 'Failed to start call')
    }
  }

  // End active call
  const endCall = async () => {
    if (!callId) return
    setIsEnding(true)
    const toastId = toast.loading('Ending call...')

    try {
      const res = await fetch(`/api/vapi/call/${callId}`, {
        method: 'POST'
      })

      if (!res.ok) {
        throw new Error('Failed to end call')
      }

      toast.success('Call ended request sent', { id: toastId })
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to end call', { id: toastId })
    } finally {
      setIsEnding(false)
    }
  }

  // Poll call status
  const startPolling = (id: string) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current)

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/vapi/call/${id}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data?.error || 'Failed to get status')
        }

        const newStatus = data.status

        if (newStatus === 'ended' || newStatus === 'completed' || newStatus === 'missed') {
          // Call finished
          setCallStatus('ended')
          if (data.call) {
            setFinalCallLog(data.call)
          }
          stopPolling()
          toast.success('Call finished!')
        } else {
          setCallStatus(newStatus)
        }
      } catch (err: any) {
        console.error('Polling error:', err)
      }
    }, 2000)
  }

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  // Manage timer interval based on call status
  useEffect(() => {
    if (callStatus === 'in-progress') {
      if (!timerIntervalRef.current) {
        timerIntervalRef.current = setInterval(() => {
          setSeconds(s => s + 1)
        }, 1000)
      }
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [callStatus])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [])

  // Dial buttons helper
  const dialButtons = [
    { num: '1', letters: ' ' },
    { num: '2', letters: 'ABC' },
    { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' },
    { num: '5', letters: 'JKL' },
    { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' },
    { num: '8', letters: 'TUV' },
    { num: '9', letters: 'WXYZ' },
    { num: '+', letters: ' ' },
    { num: '0', letters: '+' },
    { num: '⌫', letters: 'DEL', isAction: true },
  ]

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="Test Call Dialer" 
          subtitle="Initiate real outbound voice calls from Vapi to test your restaurant assistant live."
        />
        <Link href="/calls">
          <Button variant="outline" className="border-border bg-surface hover:bg-surface2 gap-2 text-xs font-bold uppercase tracking-wider h-10">
            <ArrowLeft className="w-4 h-4" /> Back to Logs
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left column: Dial pad UI */}
        <Card className="p-6 bg-surface border-border flex flex-col items-center justify-center gap-6 shadow-sm">
          <div className="w-full space-y-2">
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em]">Phone Number</label>
            <div className="relative flex items-center">
              <Input
                type="tel"
                placeholder="+14155552671"
                className="h-14 bg-surface2 border-border text-center text-xl font-mono tracking-wider font-bold"
                value={phoneNumber}
                onChange={(e) => {
                  let val = e.target.value
                  if (val && !val.startsWith('+') && !val.startsWith('0')) {
                    val = '+' + val
                  }
                  setPhoneNumber(val)
                }}
                disabled={callStatus !== 'idle' && callStatus !== 'ended' && callStatus !== 'error'}
              />
              {phoneNumber && (callStatus === 'idle' || callStatus === 'ended' || callStatus === 'error') && (
                <button 
                  onClick={handleClear} 
                  className="absolute right-3 p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-surface transition-all"
                  title="Clear number"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-text-muted italic leading-relaxed text-center">
              Must include country code, e.g. +14155552671 or +919876543210.
            </p>
          </div>

          {/* Grid dial pad */}
          <div className="grid grid-cols-3 gap-4 w-full max-w-[280px]">
            {dialButtons.map((btn, idx) => {
              const isDel = btn.num === '⌫'
              return (
                <button
                  key={idx}
                  onClick={() => isDel ? handleBackspace() : handleDialClick(btn.num)}
                  disabled={callStatus !== 'idle' && callStatus !== 'ended' && callStatus !== 'error'}
                  className="flex flex-col items-center justify-center w-16 h-16 rounded-full border border-border bg-surface2 hover:bg-primary/20 hover:border-primary/50 text-text-primary active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none mx-auto"
                >
                  <span className="text-xl font-black">{btn.num}</span>
                  <span className="text-[8px] font-bold text-text-muted tracking-wider uppercase">
                    {btn.letters}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Action button */}
          <div className="w-full pt-4 border-t border-border">
            {callStatus === 'idle' || callStatus === 'ended' || callStatus === 'error' ? (
              <Button 
                onClick={startCall}
                disabled={!phoneNumber}
                className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl shadow-lg flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm transition-all hover:shadow-emerald-500/20 active:scale-[0.99] cursor-pointer"
              >
                <Phone className="w-5 h-5 fill-current animate-bounce" /> Call Assistant
              </Button>
            ) : (
              <Button 
                onClick={endCall}
                disabled={isEnding}
                className="w-full h-14 bg-gradient-to-r from-danger to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl shadow-lg flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm transition-all hover:shadow-red-500/20 active:scale-[0.99] cursor-pointer"
              >
                {isEnding ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <PhoneOff className="w-5 h-5 fill-current animate-pulse" />
                )}
                End Call
              </Button>
            )}
          </div>
        </Card>

        {/* Right column: Status Display screen */}
        <Card className="p-6 bg-surface border-border flex flex-col gap-6 min-h-[460px] justify-between shadow-sm">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-[0.2em]">Call Status Monitor</h3>
            
            {/* Visual Screen Container */}
            <div className="w-full bg-[#13131A] border border-border/80 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px] relative overflow-hidden select-none">
              
              {/* Visual waves effect when active */}
              {callStatus !== 'idle' && callStatus !== 'ended' && callStatus !== 'error' && (
                <div className="absolute inset-0 opacity-10 bg-gradient-to-t from-primary/20 via-transparent to-transparent animate-pulse" />
              )}

              {/* Icon & Call Status */}
              <div className="z-10 flex flex-col items-center gap-4 text-center">
                {callStatus === 'idle' && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-surface2 border border-border flex items-center justify-center text-text-muted">
                      <Volume2 className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-text-primary uppercase tracking-wide">Ready for Test</p>
                      <p className="text-xs text-text-muted mt-1">Configure your dialer and click Call to start</p>
                    </div>
                  </>
                )}

                {callStatus === 'placing' && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                      <Loader2 className="w-8 h-8 animate-spin" />
                    </div>
                    <div>
                      <Badge className="bg-primary/20 text-primary border-none text-[9px] px-2 py-0.5 animate-pulse">
                        PLACING CALL
                      </Badge>
                      <p className="text-xl font-bold text-text-primary mt-2">Connecting Vapi...</p>
                    </div>
                  </>
                )}

                {callStatus === 'ringing' && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-primary/25 border border-primary/50 flex items-center justify-center text-primary animate-bounce">
                      <PhoneCall className="w-8 h-8" />
                    </div>
                    <div>
                      <Badge className="bg-primary/20 text-primary border-none text-[9px] px-2 py-0.5">
                        RINGING
                      </Badge>
                      <p className="text-xl font-bold text-text-primary mt-2">{phoneNumber}</p>
                      <p className="text-xs text-text-muted mt-1 animate-pulse">Waiting for answer...</p>
                    </div>
                  </>
                )}

                {callStatus === 'in-progress' && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-500 animate-pulse">
                      <Phone className="w-8 h-8 fill-emerald-500/10" />
                    </div>
                    <div>
                      <Badge className="bg-emerald-500/20 text-emerald-500 border-none text-[9px] px-2 py-0.5">
                        CONNECTED
                      </Badge>
                      <p className="text-xl font-bold text-text-primary mt-2">{phoneNumber}</p>
                      
                      {/* Active Duration Timer */}
                      <div className="flex items-center justify-center gap-1.5 mt-3 text-lg font-mono text-emerald-400 font-bold">
                        <Clock className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>{formatTime(seconds)}</span>
                      </div>
                    </div>
                  </>
                )}

                {callStatus === 'ended' && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <Badge className="bg-amber-500/20 text-amber-500 border-none text-[9px] px-2 py-0.5">
                        CALL ENDED
                      </Badge>
                      <p className="text-xl font-bold text-text-primary mt-2">Call Finished</p>
                      {finalCallLog && (
                        <p className="text-xs text-text-muted mt-2 font-mono">
                          Duration: {Math.floor(finalCallLog.duration_seconds / 60)}m {finalCallLog.duration_seconds % 60}s
                        </p>
                      )}
                    </div>
                  </>
                )}

                {callStatus === 'error' && (
                  <>
                    <div className="w-16 h-16 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center text-danger">
                      <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <Badge className="bg-danger/20 text-danger border-none text-[9px] px-2 py-0.5">
                        CALL ERROR
                      </Badge>
                      <p className="text-xl font-bold text-text-primary mt-2">Failed to Call</p>
                      <p className="text-xs text-danger mt-2 max-w-[200px] leading-relaxed break-words font-semibold mx-auto">
                        {errorMessage}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Card section: Call details */}
          <div className="space-y-4 pt-4 border-t border-border">
            {callId && (
              <div className="flex items-center justify-between text-xs font-mono py-1 border-b border-border/40">
                <span className="text-text-muted">Call ID:</span>
                <span className="text-text-primary font-bold select-all">{callId}</span>
              </div>
            )}

            {/* If call is ended and we have a log in DB, show summaries */}
            {callStatus === 'ended' && finalCallLog ? (
              <div className="space-y-3 animate-fadeIn">
                <div className="p-3.5 bg-surface2/60 border border-border rounded-xl">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">AI Summary</span>
                  <p className="text-xs text-text-primary leading-relaxed italic">
                    "{finalCallLog.summary || 'No summary available.'}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2 bg-surface2 rounded-lg flex items-center justify-between">
                    <span className="text-text-muted">Cost:</span>
                    <span className="text-emerald-500 font-bold">${(finalCallLog.cost_usd || 0).toFixed(2)}</span>
                  </div>
                  <div className="p-2 bg-surface2 rounded-lg flex items-center justify-between">
                    <span className="text-text-muted">Status:</span>
                    <span className="text-text-primary font-bold uppercase">{finalCallLog.status}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="w-full bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary hover:text-primary font-bold uppercase tracking-wider text-xs h-11 rounded-lg gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4" /> View Full Analysis
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-surface2/40 border border-border/50 rounded-xl text-center">
                <p className="text-xs text-text-muted leading-relaxed">
                  Call Logs are automatically saved in the database and linked to customers upon completion.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      

      {/* Call Analysis Modal */}
      {finalCallLog && (
        <CallAnalysisDialog 
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          call={finalCallLog}
        />
      )}
    </div>
  )
}
