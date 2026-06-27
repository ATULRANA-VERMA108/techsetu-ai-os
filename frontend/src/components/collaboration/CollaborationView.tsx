import React, { useState, useEffect, useRef } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  Users, MessageSquare, Send, Radio, Activity, Cpu, Database 
} from 'lucide-react'
import { WS_BASE_URL } from '../../config'
interface CollaborationViewProps {
  userName: string | null
}

interface ChatLogMessage {
  type: 'CHAT' | 'JOIN'
  sender: string
  content: string
  timestamp: string
}

export const CollaborationView: React.FC<CollaborationViewProps> = ({ userName }) => {
  const [messages, setMessages] = useState<ChatLogMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [activeUsers, setActiveUsers] = useState(1)
  
  // Real-time system diagnostics pushed over WebSocket
  const [cpuUsage, setCpuUsage] = useState(24.5)
  const [ramUsage, setRamUsage] = useState(4.2)
  const [isConnected, setIsConnected] = useState(false)

  const socketRef = useRef<WebSocket | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 1. Establish native HTML5 WebSocket connection
    const socket = new WebSocket(WS_BASE_URL)
    socketRef.current = socket

    socket.onopen = () => {
      setIsConnected(true)
      // Send JOIN notification
      const joinFrame = JSON.stringify({
        type: 'JOIN',
        sender: userName || 'Atul',
        content: 'joined the collaboration workspace'
      })
      socket.send(joinFrame)
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        
        if (data.type === 'CHAT' || data.type === 'JOIN') {
          const newMsg: ChatLogMessage = {
            type: data.type,
            sender: data.sender,
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
          setMessages(prev => [...prev, newMsg])
        } else if (data.type === 'STATUS') {
          // Update live telemetry dials
          setCpuUsage(data.cpu)
          setRamUsage(data.ram)
          setActiveUsers(data.activeUsers)
        }
      } catch (err) {
        console.error('Error parsing socket event data', err)
      }
    }

    socket.onclose = () => {
      setIsConnected(false)
    }

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close()
      }
    }
  }, [userName])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !socketRef.current || !isConnected) return

    const chatFrame = JSON.stringify({
      type: 'CHAT',
      sender: userName || 'Atul',
      content: inputText
    })
    socketRef.current.send(chatFrame)
    setInputText('')
  }

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      {/* Welcome banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-dark-card/50 via-ai-purple/5 to-ai-blue/5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Real-Time Collaboration Workspace 👥
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Exchange instant messages with active members and monitor live telemetry streams over WebSockets.
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gray-800/40 border border-gray-700/50 text-xs font-semibold shrink-0 ${
          isConnected ? 'text-emerald-400' : 'text-rose-450'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
          {isConnected ? 'WebSocket Connected' : 'Disconnected'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        
        {/* Shared Chat Column */}
        <div className="lg:col-span-2 glass-panel border border-white/5 rounded-2xl flex flex-col justify-between overflow-hidden bg-dark-card/10 h-full">
          <div className="flex-1 overflow-y-auto p-6 flex flex-col">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto gap-3 self-center">
                <MessageSquare className="w-10 h-10 text-gray-750 animate-bounce" />
                <h4 className="text-sm font-bold text-white tracking-tight">Real-Time Chat Feed</h4>
                <p className="text-gray-550 text-xs leading-relaxed">
                  Workspace chat messages will stream here in real-time. Type a message below to share it with connected members.
                </p>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isSystemJoin = m.type === 'JOIN'
                return (
                  <div key={idx} className={`mb-4 flex flex-col ${isSystemJoin ? 'items-center justify-center' : 'items-start'}`}>
                    {isSystemJoin ? (
                      <span className="px-3 py-1.5 rounded-lg bg-gray-850/50 border border-gray-800/60 text-[10px] text-ai-blue font-bold tracking-normal">
                        📢 {m.sender} {m.content}
                      </span>
                    ) : (
                      <div className="rounded-xl px-4 py-2.5 glass-panel border border-white/5 bg-dark-card/30 max-w-[85%] text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] text-ai-purple font-black uppercase tracking-wider">{m.sender}</span>
                          <span className="text-[9px] text-gray-500 font-semibold">{m.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-300 leading-normal">{m.content}</p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form input bar */}
          <div className="p-4 border-t border-white/5 bg-dark-card/25">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <Input
                placeholder={isConnected ? "Write a group message..." : "Socket disconnected. Reconnecting..."}
                disabled={!isConnected}
                className="py-3 bg-black/40 border-gray-800"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="primary" 
                disabled={!isConnected || !inputText.trim()} 
                className="px-5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Live Telemetry Column */}
        <div className="flex flex-col gap-6 h-full">
          
          {/* Active Members Card */}
          <Card className="border border-white/5 bg-dark-card/20 p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-ai-blue/15 border border-ai-blue/30 text-ai-blue shrink-0">
              <Users className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-gray-550 uppercase font-black tracking-wider">Active Collaborators</span>
              <h4 className="text-2xl font-black text-white tracking-tight mt-0.5">{activeUsers} connected</h4>
            </div>
          </Card>

          {/* Live System Telemetry metrics */}
          <Card className="border border-white/5 bg-dark-card/20 p-5 flex-1 flex flex-col justify-between text-left">
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 border-b border-gray-800 pb-3 mb-4">
                <Radio className="w-4.5 h-4.5 text-ai-purple animate-ping shrink-0" /> Live Socket Telemetry
              </h4>
              
              <div className="flex flex-col gap-5 mt-2">
                {/* CPU Metric */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-450 uppercase font-bold text-[10px] flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-ai-blue" /> Server CPU usage
                    </span>
                    <span className="text-white font-bold">{cpuUsage}%</span>
                  </div>
                  <div className="w-full bg-gray-850 h-2 rounded-full overflow-hidden border border-gray-800">
                    <div 
                      className="bg-gradient-to-r from-ai-blue to-ai-purple h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${cpuUsage}%` }}
                    />
                  </div>
                </div>

                {/* RAM Metric */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-450 uppercase font-bold text-[10px] flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-ai-purple" /> RAM Allocation
                    </span>
                    <span className="text-white font-bold">{ramUsage} GB</span>
                  </div>
                  <div className="w-full bg-gray-850 h-2 rounded-full overflow-hidden border border-gray-800">
                    <div 
                      className="bg-gradient-to-r from-ai-blue to-ai-purple h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(ramUsage / 8.0) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Docker Database tagging */}
            <div className="border-t border-gray-800/80 pt-4 mt-6">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider flex items-center gap-1.5 mb-3">
                <Database className="w-3.5 h-3.5 text-ai-blue" /> Infrastructure State
              </span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-emerald-950/15 border border-emerald-500/20 px-2 py-1.5 rounded-lg">
                  <div className="text-[8px] text-gray-550 font-bold uppercase">WebSockets</div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Active</div>
                </div>
                <div className="bg-emerald-950/15 border border-emerald-500/20 px-2 py-1.5 rounded-lg">
                  <div className="text-[8px] text-gray-550 font-bold uppercase">Schedules</div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Active</div>
                </div>
              </div>
            </div>
          </Card>

        </div>

      </div>

    </div>
  )
}
