import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageSquare, Plus, Trash2, Send, Bot, Key, 
  Settings, Check, Activity, User 
} from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Loader } from '../ui/Loader'
import axios from 'axios'
import { API_BASE_URL } from '../../config'

interface ChatViewProps {
  token: string | null
}

interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
}

interface Message {
  id: string
  conversationId: string
  role: 'user' | 'model'
  content: string
  timestamp: string
}

export const ChatView: React.FC<ChatViewProps> = ({ token }) => {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConvId, setActiveConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [prompt, setPrompt] = useState('')
  const [streamingContent, setStreamingContent] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [isSending, setIsSending] = useState(false)
  
  const [showApiKeySetting, setShowApiKeySetting] = useState(false)
  const [tempApiKey, setTempApiKey] = useState(localStorage.getItem('geminiApiKey') || '')
  const [savedApiKey, setSavedApiKey] = useState(localStorage.getItem('geminiApiKey') || '')
  
  // Mobile responsiveness states
  const [showThreadList, setShowThreadList] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setConversations(res.data)
      if (res.data.length > 0 && !activeConvId) {
        setActiveConvId(res.data[0].id)
      }
    } catch (err) {
      console.error('Error loading conversations', err)
    }
  }

  const loadMessages = async (convId: string) => {
    setLoadingHistory(true)
    try {
      const res = await axios.get(`${API_BASE_URL}/api/chat/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data)
    } catch (err) {
      console.error('Error loading messages', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadConversations()
    }
  }, [token])

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId)
    } else {
      setMessages([])
    }
  }, [activeConvId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  const handleCreateConversation = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat/conversations`, { title: 'New Chat' }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setConversations([res.data, ...conversations])
      setActiveConvId(res.data.id)
      setShowThreadList(false) // Close list on mobile
    } catch (err) {
      console.error('Error creating conversation', err)
    }
  }

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation()
    try {
      await axios.delete(`${API_BASE_URL}/api/chat/conversations/${convId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const filtered = conversations.filter(c => c.id !== convId)
      setConversations(filtered)
      if (activeConvId === convId) {
        setActiveConvId(filtered.length > 0 ? filtered[0].id : null)
      }
    } catch (err) {
      console.error('Error deleting conversation', err)
    }
  }

  const saveApiKey = () => {
    localStorage.setItem('geminiApiKey', tempApiKey)
    setSavedApiKey(tempApiKey)
    setShowApiKeySetting(false)
  }

  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isSending || !activeConvId) return

    const userPrompt = prompt
    setPrompt('')
    setIsSending(true)
    setStreamingContent('')

    const dummyUserMsg: Message = {
      id: Date.now().toString(),
      conversationId: activeConvId,
      role: 'user',
      content: userPrompt,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, dummyUserMsg])

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/conversations/${activeConvId}/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Gemini-Key': savedApiKey || ''
        },
        body: JSON.stringify({ prompt: userPrompt })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let done = false
      let fullResponseText = ''

      while (!done && reader) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) {
          const chunkStr = decoder.decode(value, { stream: true })
          const lines = chunkStr.split('\n')
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i]
            if (line.startsWith('event: error')) {
              const nextLine = lines[i + 1] || ''
              const errorMsg = nextLine.startsWith('data:') ? nextLine.substring(5).trim() : 'API key error or prompt block.'
              throw new Error(errorMsg)
            }
            if (line.startsWith('event: chunk')) {
              const nextLine = lines[i + 1] || ''
              if (nextLine.startsWith('data:')) {
                const tokenText = nextLine.substring(5)
                fullResponseText += tokenText
                setStreamingContent(fullResponseText)
              }
            }
            if (line.startsWith('event: done')) {
              done = true
            }
          }
        }
      }

      loadMessages(activeConvId)
      loadConversations()
    } catch (err: any) {
      const errorMsg = err.message || 'Connection failed.'
      const dummyModelErrorMsg: Message = {
        id: (Date.now() + 1).toString(),
        conversationId: activeConvId,
        role: 'model',
        content: `⚠️ **Error:** ${errorMsg}`,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, dummyModelErrorMsg])
    } finally {
      setIsSending(false)
      setStreamingContent('')
    }
  }

  const renderMessageContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g)
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const codeBlock = part.substring(3, part.length - 3)
        const lines = codeBlock.split('\n')
        const language = lines[0].trim() || 'javascript'
        const code = lines.slice(1).join('\n')
        
        return (
          <div key={index} className="my-4 rounded-xl overflow-hidden border border-gray-800 bg-black/60 text-left">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 text-[10px] text-gray-550 font-bold uppercase tracking-wider">
              <span>{language}</span>
              <button 
                onClick={() => navigator.clipboard.writeText(code)}
                className="hover:text-white transition-colors cursor-pointer text-xs"
                type="button"
              >
                Copy Code
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-xs font-mono text-gray-300 leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        )
      } else {
        const lines = part.split('\n')
        return lines.map((line, lineIdx) => {
          if (line.startsWith('### ')) {
            return <h4 key={lineIdx} className="text-sm font-bold text-white mt-4 mb-2">{line.replace('### ', '')}</h4>
          }
          if (line.startsWith('## ')) {
            return <h3 key={lineIdx} className="text-base font-bold text-white mt-5 mb-2.5">{line.replace('## ', '')}</h3>
          }
          if (line.startsWith('# ')) {
            return <h2 key={lineIdx} className="text-lg font-bold text-white mt-6 mb-3">{line.replace('# ', '')}</h2>
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return <li key={lineIdx} className="ml-4 list-disc text-gray-300 my-1">{line.substring(2)}</li>
          }
          
          const boldParts = line.split(/(\*\*.*?\*\*)/g)
          const inlineText = boldParts.map((boldPart, boldIdx) => {
            if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
              return <strong key={boldIdx} className="font-bold text-white">{boldPart.substring(2, boldPart.length - 2)}</strong>
            }
            return boldPart
          })

          return <p key={lineIdx} className="my-1.5 leading-relaxed text-gray-350 min-h-[1rem]">{inlineText}</p>
        })
      }
    })
  }

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 w-full text-left relative overflow-hidden">
      
      {/* Mobile conversations thread backdrop */}
      {showThreadList && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          onClick={() => setShowThreadList(false)}
        />
      )}

      {/* Sidebar - Threads list */}
      <aside className={`glass-panel border border-white/5 rounded-2xl p-4 flex flex-col justify-between shrink-0 transition-all duration-300
        md:w-64 md:relative md:flex md:translate-x-0 md:z-auto md:bg-dark-card/20
        fixed top-[73px] left-0 h-[calc(100vh-140px)] w-64 z-40 bg-gray-900/95 backdrop-blur-xl shadow-2xl
        ${showThreadList ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">AI Conversations</h3>
            <button 
              onClick={() => setShowApiKeySetting(!showApiKeySetting)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors cursor-pointer"
              type="button"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          <Button variant="glass" className="w-full flex items-center justify-center gap-2 py-2 min-h-[40px]" onClick={handleCreateConversation}>
            <Plus className="w-4 h-4" /> New Chat
          </Button>

          <div className="flex flex-col gap-2 mt-2">
            {conversations.map((c) => {
              const isActive = activeConvId === c.id
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveConvId(c.id)
                    setShowThreadList(false) // Close list on mobile
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer border min-h-[40px] ${
                    isActive 
                      ? 'bg-gradient-to-r from-ai-blue/10 to-ai-purple/10 border-ai-blue/30 text-white font-semibold' 
                      : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                    <MessageSquare className="w-4 h-4 shrink-0 text-gray-500" />
                    <span className="text-xs truncate">{c.title}</span>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteConversation(e, c.id)}
                    className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* BYOK Panel inside Sidebar bottom */}
        {showApiKeySetting && (
          <div className="mt-4 border-t border-gray-800/80 pt-4 flex flex-col gap-3">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3 h-3 text-ai-purple" /> BYOK Gemini Key
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Paste key here..."
                type="password"
                className="py-1.5 px-3 text-xs bg-black/40 border-gray-800 rounded-lg focus:border-ai-purple"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
              />
              <button 
                onClick={saveApiKey}
                className="p-2 rounded bg-gradient-to-tr from-ai-blue to-ai-purple text-white hover:opacity-90 cursor-pointer"
                type="button"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main chat window area */}
      <section className="flex-1 glass-panel border border-white/5 rounded-2xl flex flex-col justify-between overflow-hidden bg-dark-card/10">
        
        {/* Chat header (Visible on mobile for threads access) */}
        <div className="px-6 py-4 border-b border-white/5 bg-dark-card/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowThreadList(!showThreadList)}
              className="md:hidden p-2 rounded-xl bg-gray-800/60 border border-gray-700/60 text-gray-300 hover:text-white transition-colors cursor-pointer"
              title="Toggle Chat Threads"
              type="button"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {conversations.find(c => c.id === activeConvId)?.title || 'AI Chat Assistant'}
              </h4>
              <span className="text-[10px] text-gray-500 font-semibold uppercase">Gemini Workspace</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-gray-400 font-bold hidden sm:inline">Active Session</span>
          </div>
        </div>

        {/* Messages list scrollable container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          {loadingHistory ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader type="spinner" size="md" />
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Syncing chat log...</span>
            </div>
          ) : messages.length === 0 && !streamingContent ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-xl mx-auto gap-4 self-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ai-blue to-ai-purple flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white tracking-tight mt-2">What should we create today?</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Start a thread by writing a prompt. You can ask this system to write code, parse documents, create workflows, or troubleshoot configurations.
              </p>
            </div>
          ) : (
            <>
              {/* Message bubbles list */}
              {messages.map((m) => (
                <div key={m.id} className={`flex w-full mb-5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-ai-blue to-ai-purple text-white shadow-lg border border-transparent'
                      : 'glass-panel text-gray-300 border border-white/5 bg-dark-card/40'
                  }`}>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      {m.role === 'user' ? <User className="w-3 h-3 text-white/80" /> : <Bot className="w-3 h-3 text-ai-blue" />}
                      {m.role === 'user' ? 'You' : 'Gemini Assistant'}
                    </div>
                    <div className="text-xs sm:text-sm">
                      {renderMessageContent(m.content)}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Streaming AI message bubble */}
              {streamingContent && (
                <div className="flex w-full justify-start mb-5">
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 glass-panel text-gray-300 border border-white/5 bg-dark-card/40">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Bot className="w-3 h-3 text-ai-blue" />
                      Gemini Assistant (Streaming)
                    </div>
                    <div className="text-xs sm:text-sm">
                      {renderMessageContent(streamingContent)}
                    </div>
                  </div>
                </div>
              )}

              {/* Loader dots when request starts but chunk hasn't arrived */}
              {isSending && !streamingContent && (
                <div className="flex w-full justify-start mb-5">
                  <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 glass-panel text-gray-300 border border-white/5 bg-dark-card/40 flex items-center gap-3">
                    <Loader type="terminal-dots" size="sm" className="h-5" />
                    <span className="text-xs text-gray-500 uppercase font-semibold">Gemini is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input prompt footer bar */}
        <div className="p-4 border-t border-white/5 bg-dark-card/20">
          <form onSubmit={handleSendPrompt} className="flex gap-3">
            <Input
              placeholder={activeConvId ? "Ask Gemini anything..." : "Please select or create an active chat thread first"}
              disabled={!activeConvId || isSending}
              className="py-3 bg-black/40 border-gray-800"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="primary" 
              disabled={!activeConvId || isSending || !prompt.trim()} 
              className="px-5 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

      </section>

    </div>
  )
}
