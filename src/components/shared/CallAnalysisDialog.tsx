'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Download, 
  FileText, 
  MessageSquare,
  Clock,
  DollarSign,
  Zap
} from 'lucide-react'
import { CallLog } from '@/lib/types'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface CallAnalysisDialogProps {
  isOpen: boolean
  onClose: () => void
  call: CallLog | null
}

interface Message {
  role: 'assistant' | 'user'
  text: string
}

export function CallAnalysisDialog({ isOpen, onClose, call }: CallAnalysisDialogProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Auto-pause and reset when dialog closes or call changes
  useEffect(() => {
    if (!isOpen || !call) {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setIsPlaying(false)
      setCurrentTime(0)
      setPlaybackRate(1)
    }
  }, [isOpen, call])

  // Apply playback speed rate whenever audio plays or speed changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate
    }
  }, [playbackRate, isPlaying])

  const durationSec = call?.duration || call?.duration_seconds || 0
  const cost = call?.cost_usd || 0
  const summary = call?.summary || 'No summary available'
  const dateStr = call?.started_at || call?.createdAt || call?.created_at || new Date().toISOString()
  
  // Resolve recording URL. Fallback to a sample audio file if dummy/missing
  const rawUrl = call?.recording_url || '';
  const isDummyUrl = !rawUrl || rawUrl.includes('example.com');
  const audioUrl = isDummyUrl 
    ? 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' 
    : rawUrl;

  // Transcript parsing logic
  const messages: Message[] = []
  let parsedTranscript = call?.transcript
  if (typeof call?.transcript === 'string') {
    try {
      const parsed = JSON.parse(call.transcript)
      if (Array.isArray(parsed) || typeof parsed === 'object') {
        parsedTranscript = parsed
      }
    } catch (e) {
      // Keep as raw string
    }
  }

  if (Array.isArray(parsedTranscript)) {
    parsedTranscript.forEach((t: any) => {
      if (t && typeof t === 'object') {
        const text = t.text || t.message || '';
        const role = (t.role === 'assistant' || t.role === 'ai' || t.role === 'agent') ? 'assistant' : 'user';
        if (text) {
          messages.push({ role, text });
        }
      }
    });
  } else if (typeof parsedTranscript === 'string' && parsedTranscript.trim()) {
    const lines = parsedTranscript.replace(/\\n/g, '\n').split('\n');
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      const match = trimmed.match(/^(AI|Customer|User|Guileo AI|assistant|customer|agent)\s*:\s*(.*)$/i);
      if (match) {
        const prefix = match[1].toLowerCase();
        const text = match[2].trim();
        const role = (prefix === 'ai' || prefix === 'assistant' || prefix === 'guileo ai' || prefix === 'agent') ? 'assistant' : 'user';
        if (text) {
          messages.push({ role, text });
        }
      } else {
        if (messages.length > 0) {
          messages[messages.length - 1].text += '\n' + trimmed;
        } else {
          messages.push({ role: 'user', text: trimmed });
        }
      }
    });
  }

  // Audio Handlers
  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(err => console.log('Audio play error:', err))
      setIsPlaying(true)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleSeekBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleSeekForward = () => {
    if (audioRef.current) {
      const maxDuration = duration || audioRef.current.duration || 0
      audioRef.current.currentTime = Math.min(maxDuration, audioRef.current.currentTime + 10)
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const val = parseFloat(e.target.value)
      audioRef.current.currentTime = val
      setCurrentTime(val)
    }
  }

  const cycleSpeed = () => {
    let nextRate = 1
    if (playbackRate === 1) nextRate = 1.5
    else if (playbackRate === 1.5) nextRate = 2
    else nextRate = 1
    
    setPlaybackRate(nextRate)
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate
    }
  }

  const handleDownload = async () => {
    if (!audioUrl) return
    try {
      const response = await fetch(audioUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `recording_${call?.id}.mp3`
      document.body.appendChild(a)
      a.click()
      a.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      window.open(audioUrl, '_blank')
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  if (!call) return null
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-surface border border-border text-text-primary p-6 rounded-xl flex flex-col gap-6 scrollbar-thin">
        
        {/* Hidden Audio Tag */}
        <audio 
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
          className="hidden"
          preload="metadata"
        />

        <DialogHeader className="pb-2 border-b border-border/50">
          <div className="flex items-center justify-between gap-4 mb-2">
            <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
              {call.type || 'WEBCALL'} · {call.source || 'VAPI'}
            </Badge>
            <span className="text-[10px] font-mono text-text-muted select-all">ID: {call.id}</span>
          </div>
          <DialogTitle className="text-2xl font-black text-text-primary uppercase tracking-tighter">
            Call Analysis
          </DialogTitle>
          <DialogDescription className="text-text-muted text-xs font-semibold">
            {format(new Date(dateStr), 'MMMM d, yyyy · h:mm a')}
          </DialogDescription>
        </DialogHeader>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 bg-surface2 border-border flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Duration</p>
              <p className="text-lg font-black text-text-primary">
                {Math.floor(durationSec / 60)}m {Math.floor(durationSec % 60)}s
              </p>
            </div>
          </Card>
          <Card className="p-4 bg-surface2 border-border flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Cost</p>
              <p className="text-lg font-black text-emerald-500">${cost.toFixed(2)}</p>
            </div>
          </Card>
        </div>

        {/* AI Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> AI Summary
          </h4>
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl italic text-sm text-text-primary leading-relaxed">
            "{summary}"
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="space-y-3 bg-surface2/60 border border-border p-4 rounded-xl">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {/* Seek Backward */}
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-9 w-9 text-text-muted hover:text-text-primary hover:bg-surface border border-border/50"
                onClick={handleSeekBackward}
                title="Backward 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              {/* Play/Pause */}
              <Button 
                size="icon" 
                variant="default" 
                className="h-10 w-10 bg-primary hover:bg-primary/95 text-white rounded-full flex items-center justify-center shadow-lg"
                onClick={togglePlay}
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 fill-white text-white" />
                ) : (
                  <Play className="w-4 h-4 fill-white text-white pl-0.5" />
                )}
              </Button>

              {/* Seek Forward */}
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-9 w-9 text-text-muted hover:text-text-primary hover:bg-surface border border-border/50"
                onClick={handleSeekForward}
                title="Forward 10s"
              >
                <RotateCw className="w-4 h-4" />
              </Button>

              {/* Speed Controller */}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 px-3 gap-1.5 text-xs text-text-muted hover:text-text-primary hover:bg-surface border border-border/50 font-bold"
                onClick={cycleSpeed}
                title="Toggle Speed"
              >
                <Zap className={cn("w-3.5 h-3.5", playbackRate > 1 ? "text-amber-500 fill-amber-500" : "")} />
                <span>{playbackRate}x</span>
              </Button>
            </div>

            {/* Download */}
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 text-xs text-text-primary border-border bg-surface hover:bg-surface2 gap-1.5 font-bold uppercase tracking-wider"
              onClick={handleDownload}
            >
              <Download className="w-4 h-4" /> Download
            </Button>
          </div>

          {/* Timeline slider scrubber */}
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max={duration || durationSec || 100}
              value={currentTime}
              onChange={handleScrubChange}
              className="flex-1 h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
            />
            <span className="text-xs font-mono text-text-muted select-none w-24 text-right">
              {formatTime(currentTime)} / {formatTime(duration || durationSec)}
            </span>
          </div>
        </div>

        {/* Transcript Dialogue Bubbles */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-500" /> Transcript
          </h4>
          
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin border border-border/40 p-4 rounded-xl bg-surface2/30">
            {messages.length > 0 ? (
              messages.map((msg, i) => {
                const isAI = msg.role === 'assistant';
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "flex flex-col gap-1 max-w-[85%] transition-all",
                      isAI ? "items-start mr-auto" : "items-end ml-auto"
                    )}
                  >
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">
                      {isAI ? 'Guileo AI' : (call.customer_name || 'Customer')}
                    </span>
                    <div 
                      className={cn(
                        "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                        isAI 
                          ? "bg-primary/10 text-text-primary rounded-tl-none border border-primary/20" 
                          : "bg-surface border border-border text-text-primary rounded-tr-none"
                      )}
                    >
                      {msg.text}
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-xs text-text-muted italic text-center py-8">
                No transcript available for this call.
              </p>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
