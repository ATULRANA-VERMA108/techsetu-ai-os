import React, { useState, useEffect, useRef } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Loader } from '../ui/Loader'
import { 
  Bot, Terminal, Play, CheckCircle, Clock, AlertTriangle, 
  Sparkles, ListChecks, ChevronRight, Activity 
} from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../../config'

interface AgentViewProps {
  token: string | null
}

interface SubTask {
  title: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED'
  log: string
}

interface AgentTask {
  id: string
  taskDescription: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED'
  subTasks: SubTask[]
  createdAt: string
}

export const AgentView: React.FC<AgentViewProps> = ({ token }) => {
  const [tasks, setTasks] = useState<AgentTask[]>([])
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  const [taskDescription, setTaskDescription] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const terminalEndRef = useRef<HTMLDivElement>(null)

  const templates = [
    {
      title: 'Scaffold User Profile APIs',
      prompt: 'Scaffold a complete Spring Boot REST API suite for User Profiles, including entities, repositories, validation controllers, and DTO structures.'
    },
    {
      title: 'Audit DB Connection pool',
      prompt: 'Perform a comprehensive system audit on PostgreSQL connection parameters, checking configurations, thread limits, idle timeouts, and logs.'
    },
    {
      title: 'Generate UI Test Suite',
      prompt: 'Write automated Cypress test scripts to validate JWT local storage logins, workspace tab navigation routing, and responsive sidebar toggles.'
    }
  ]

  const loadTasks = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/agents/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTasks(res.data)
    } catch (err) {
      console.error('Error loading agent tasks', err)
    }
  }

  const loadSingleTask = async (id: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/agents/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Update tasks list with updated status
      setTasks(prev => prev.map(t => t.id === id ? res.data : t))
      return res.data
    } catch (err) {
      console.error('Error polling agent task', err)
      return null
    }
  }

  useEffect(() => {
    if (token) {
      loadTasks()
    }
  }, [token])

  // Polling hook when active task is running
  useEffect(() => {
    let intervalId: any = null

    const activeTask = tasks.find(t => t.id === activeTaskId)
    if (activeTask && (activeTask.status === 'RUNNING' || activeTask.status === 'PENDING')) {
      intervalId = setInterval(async () => {
        const updated = await loadSingleTask(activeTask.id)
        if (updated && (updated.status === 'COMPLETED' || updated.status === 'FAILED')) {
          if (intervalId) clearInterval(intervalId)
          loadTasks() // reload history list to update timestamps
        }
      }, 2000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [activeTaskId, tasks])

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [tasks, activeTaskId])

  const handleLaunchAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskDescription.trim() || loading) return

    setLoading(true)
    setError(null)
    const goal = taskDescription
    setTaskDescription('')

    const customKey = localStorage.getItem('geminiApiKey') || ''

    try {
      const res = await axios.post(`${API_BASE_URL}/api/agents/tasks`, { taskDescription: goal }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Gemini-Key': customKey
        }
      })
      setTasks([res.data, ...tasks])
      setActiveTaskId(res.data.id)
    } catch (err: any) {
      console.error('Error starting agent', err)
      const errorMsg = err.response?.data?.error || err.message || 'Agent launch failed.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const activeTask = tasks.find(t => t.id === activeTaskId)

  // Compile all subtask logs in sequence to print in the terminal console
  const getCompiledLogs = (task: AgentTask) => {
    let lines: string[] = []
    lines.push(`[SYSTEM] Initializing Agent Engine...`)
    lines.push(`[SYSTEM] Objective: "${task.taskDescription}"`)
    lines.push(`[SYSTEM] Planned ${task.subTasks.length} sequential execution stages.`)
    lines.push(`-----------------------------------------------------------------`)

    task.subTasks.forEach((st, idx) => {
      if (st.status === 'RUNNING') {
        lines.push(`\n[AGENT RUN - STAGE ${idx + 1}/${task.subTasks.length}] "${st.title}"...`)
        lines.push(`[AGENT] Executing subprocess...`)
        lines.push(`_`) // Blinking cursor representation
      } else if (st.status === 'COMPLETED') {
        lines.push(`\n[AGENT RUN - STAGE ${idx + 1}/${task.subTasks.length}] "${st.title}"`)
        lines.push(st.log)
        lines.push(`[SYSTEM] Stage ${idx + 1} completed successfully.`)
      } else {
        lines.push(`\n[STAGE ${idx + 1}/${task.subTasks.length}] "${st.title}" - PENDING`)
      }
    })

    if (task.status === 'COMPLETED') {
      lines.push(`\n-----------------------------------------------------------------`)
      lines.push(`[SYSTEM] SUCCESS: Autonomous Agent finished all objectives.`)
    } else if (task.status === 'FAILED') {
      lines.push(`\n-----------------------------------------------------------------`)
      lines.push(`[SYSTEM] ERROR: Subprocess execution encountered a fatal crash.`)
    }

    return lines.join('\n')
  }

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 w-full text-left relative overflow-hidden">
      
      {/* Sidebar - Task History */}
      <aside className="w-64 glass-panel border border-white/5 rounded-2xl p-4 flex flex-col justify-between shrink-0 bg-dark-card/20">
        <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider">Agent Missions</h3>

          <div className="flex flex-col gap-2 mt-2">
            {tasks.map((t) => {
              const isActive = activeTaskId === t.id
              const isRunning = t.status === 'RUNNING' || t.status === 'PENDING'
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveTaskId(t.id)
                    setError(null)
                  }}
                  className={`flex flex-col gap-1 px-3 py-2.5 rounded-xl transition-all cursor-pointer border ${
                    isActive 
                      ? 'bg-gradient-to-r from-ai-blue/10 to-ai-purple/10 border-ai-blue/30 text-white font-semibold' 
                      : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="text-xs truncate">{t.taskDescription}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    {isRunning ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-ai-blue animate-pulse shrink-0"></span>
                        <span className="text-[9px] text-ai-blue font-bold uppercase">Running</span>
                      </>
                    ) : t.status === 'COMPLETED' ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="text-[9px] text-emerald-450 font-bold uppercase">Finished</span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                        <span className="text-[9px] text-rose-450 font-bold uppercase">Failed</span>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <section className="flex-1 glass-panel border border-white/5 rounded-2xl flex flex-col justify-between overflow-hidden bg-dark-card/10">
        
        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {error && (
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-950/10 text-xs text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Goal Input form top banner */}
          <Card className="border border-white/5 bg-dark-card/20 p-5 text-left flex flex-col gap-4">
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-ai-purple animate-pulse" /> Launch New Agent
              </h4>
              <p className="text-gray-400 text-xs mt-0.5">Specify a complex mission goal. The agent will split it into sub-tasks and run them in the background.</p>
            </div>
            
            <form onSubmit={handleLaunchAgent} className="flex gap-3">
              <Input
                placeholder="Describe the agent mission (e.g. Audit security setup)..."
                disabled={loading}
                className="py-2.5 bg-black/40 border-gray-805"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading || !taskDescription.trim()} 
                className="px-5 cursor-pointer whitespace-nowrap"
              >
                {loading ? (
                  <Loader type="spinner" size="sm" />
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Play className="w-4 h-4" /> Run Agent
                  </div>
                )}
              </Button>
            </form>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-800/40 mt-1">
              {templates.map((t) => (
                <button
                  key={t.title}
                  type="button"
                  onClick={() => setTaskDescription(t.prompt)}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-800 text-[10px] text-gray-450 hover:text-white hover:border-gray-700 bg-white/2 hover:bg-white/5 transition-all cursor-pointer font-bold flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3 text-ai-blue" /> {t.title}
                </button>
              ))}
            </div>
          </Card>

          {!activeTask ? (
            /* Empty State display */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 max-w-sm mx-auto gap-3 self-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ai-blue to-ai-purple flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)] animate-pulse">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-base font-bold text-white mt-2">Autonomous Agent Panel</h4>
              <p className="text-gray-500 text-xs leading-relaxed">
                Launch a task objective above or select a past mission from the sidebar history to watch execution logs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 text-left">
              
              {/* Planning Subtask List checkmarks */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <Card className="border border-white/5 bg-dark-card/25 p-5">
                  <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider flex items-center gap-1.5">
                    <ListChecks className="w-4 h-4 text-ai-blue" />
                    Agent Checklist Pipeline
                  </h4>
                  <div className="flex flex-col gap-3.5">
                    {activeTask.subTasks.map((st, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-gray-850">
                        <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                          <span className="text-[10px] text-gray-500 font-black">{idx + 1}</span>
                          <span className="text-xs text-gray-300 truncate font-semibold">{st.title}</span>
                        </div>
                        <div className="shrink-0">
                          {st.status === 'COMPLETED' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : st.status === 'RUNNING' ? (
                            <Loader type="spinner" size="sm" />
                          ) : (
                            <Clock className="w-4 h-4 text-gray-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Status indicator widget */}
                <Card className="border border-white/5 bg-dark-card/25 p-5 flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-800/40 shrink-0`}>
                    <Activity className={`w-5 h-5 ${activeTask.status === 'RUNNING' ? 'text-ai-blue animate-pulse' : 'text-emerald-500'}`} />
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Mission Status</span>
                    <h5 className="text-xs font-bold text-white mt-0.5">
                      {activeTask.status === 'RUNNING' ? 'Processing Background Subtasks...' : 
                       activeTask.status === 'COMPLETED' ? 'Mission Success' : 
                       activeTask.status === 'PENDING' ? 'Planning Workflow...' : 'Mission Failed'}
                    </h5>
                  </div>
                </Card>
              </div>

              {/* Terminal Logs window */}
              <div className="lg:col-span-3 flex flex-col min-h-[350px]">
                <div className="flex-1 rounded-xl bg-black border border-gray-850 p-4 font-mono text-[10px] leading-relaxed text-gray-400 overflow-y-auto flex flex-col justify-between max-h-[450px]">
                  <div className="flex items-center gap-2 border-b border-gray-900 pb-2 mb-2 text-gray-500 text-[9px] uppercase font-bold tracking-wider">
                    <Terminal className="w-3.5 h-3.5" /> Agent execution console logs
                  </div>
                  <pre className="flex-1 overflow-x-auto whitespace-pre-wrap select-text text-left">
                    {getCompiledLogs(activeTask)}
                  </pre>
                  <div ref={terminalEndRef} />
                </div>
              </div>

            </div>
          )}

        </div>

      </section>

    </div>
  )
}
