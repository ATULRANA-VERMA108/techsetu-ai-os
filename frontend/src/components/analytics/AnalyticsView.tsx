import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Loader } from '../ui/Loader'
import { 
  BarChart3, Activity, AlertTriangle, Bot, MessageSquare, FileText 
} from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../../config'

interface AnalyticsViewProps {
  token: string | null
}

interface TokenTrendData {
  day: string
  tokens: number
}

interface AtsDistributionData {
  category: string
  count: number
}

interface AnalyticsPayload {
  conversationsCount: number
  resumesCount: number
  agentsCompleted: number
  agentsRunning: number
  agentsFailed: number
  tokenTrend: TokenTrendData[]
  atsDistribution: AtsDistributionData[]
  totalTokensUsed: number
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ token }) => {
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(res.data)
    } catch (err) {
      console.error('Error loading analytics', err)
      setError('Failed to fetch system telemetry aggregates.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      loadAnalytics()
    }
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh] flex-col gap-3">
        <Loader type="spinner" size="md" />
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Loading System Analytics...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6 text-center text-rose-450 border border-rose-500/20 bg-rose-950/10 rounded-2xl">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
        <p className="text-xs font-semibold">{error || 'Failed to initialize analytics workspace.'}</p>
      </div>
    )
  }

  // Calculate Agent totals
  const totalAgents = data.agentsCompleted + data.agentsRunning + data.agentsFailed

  // Custom SVG line calculations for token trend:
  // Points: Mon (12000), Tue (19000), Wed (15000), Thu (29000), Fri (35000), Sat (22000), Sun (45000)
  // Box: w=400, h=150. Margins: left=40, right=10, top=10, bottom=20
  const maxTokens = 50000
  const linePoints = data.tokenTrend.map((t, idx) => {
    const x = 40 + (idx * 55) // index space
    const y = 130 - (t.tokens / maxTokens) * 110 // height ratio
    return { x, y, label: t.day, val: t.tokens }
  })

  // Build SVG path string (e.g. "M x0 y0 L x1 y1 ...")
  const pathD = linePoints.reduce((acc, p, idx) => {
    return acc + (idx === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`)
  }, '')

  // Calculate Donut circle strokes:
  // Success vs Failed vs Running. Total = 100%. Radius = 15.9155 (circumference = 100)
  const successPct = totalAgents > 0 ? (data.agentsCompleted / totalAgents) * 100 : 0
  const runningPct = totalAgents > 0 ? (data.agentsRunning / totalAgents) * 100 : 0
  const failedPct = totalAgents > 0 ? (data.agentsFailed / totalAgents) * 100 : 0

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-dark-card/50 via-ai-purple/5 to-ai-blue/5">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          System Telemetry & Analytics 📊
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Monitor token consumption statistics, evaluate resume match distributions, and audit autonomous agent outcome rates.
        </p>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1: Tokens */}
        <Card className="border border-white/5 bg-dark-card/25 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-gray-550 uppercase font-black tracking-wider">Tokens Utilized</span>
            <h4 className="text-xl font-black text-white tracking-tight mt-0.5">{data.totalTokensUsed.toLocaleString()}</h4>
          </div>
        </Card>

        {/* Stat 2: Resumes */}
        <Card className="border border-white/5 bg-dark-card/25 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-550 uppercase font-black tracking-wider">Resumes Indexed</span>
            <h4 className="text-xl font-black text-white tracking-tight mt-0.5">{data.resumesCount} Profiles</h4>
          </div>
        </Card>

        {/* Stat 3: Chats */}
        <Card className="border border-white/5 bg-dark-card/25 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-ai-purple/10 border border-ai-purple/20 text-ai-purple shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-550 uppercase font-black tracking-wider">Chat Threads</span>
            <h4 className="text-xl font-black text-white tracking-tight mt-0.5">{data.conversationsCount} Threads</h4>
          </div>
        </Card>

        {/* Stat 4: Agents */}
        <Card className="border border-white/5 bg-dark-card/25 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-550 uppercase font-black tracking-wider">Agent Missions</span>
            <h4 className="text-xl font-black text-white tracking-tight mt-0.5">{totalAgents} Runs</h4>
          </div>
        </Card>

      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Token Usage Line Chart */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <Card hoverGlow={true} className="border border-white/5 bg-dark-card/15 p-5 flex-1 flex flex-col justify-between">
            <div className="mb-4">
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-ai-blue animate-pulse" /> Weekly Token Trend
              </h4>
              <p className="text-gray-500 text-xs mt-0.5">Aggregated token allocations processed by Gemini models.</p>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="w-full relative h-[200px]">
              <svg className="w-full h-full" viewBox="0 0 400 150">
                {/* Grids */}
                <line x1="40" y1="20" x2="390" y2="20" className="stroke-gray-850" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="40" y1="75" x2="390" y2="75" className="stroke-gray-850" strokeWidth="0.5" strokeDasharray="3" />
                <line x1="40" y1="130" x2="390" y2="130" className="stroke-gray-800" strokeWidth="0.5" />

                {/* Y Axis Labels */}
                <text x="32" y="24" className="fill-gray-600 font-mono text-[8px] text-right" textAnchor="end">50K</text>
                <text x="32" y="79" className="fill-gray-600 font-mono text-[8px] text-right" textAnchor="end">25K</text>
                <text x="32" y="134" className="fill-gray-600 font-mono text-[8px] text-right" textAnchor="end">0</text>

                {/* Line Path */}
                <path
                  d={pathD}
                  fill="none"
                  className="stroke-ai-blue"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Glow Filter Area under line */}
                <path
                  d={`${pathD} L 370 130 L 40 130 Z`}
                  className="fill-gradient-area"
                  fill="url(#areaGlow)"
                  opacity="0.15"
                />

                {/* Data Points */}
                {linePoints.map((p, idx) => (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="4"
                      className="fill-black stroke-ai-blue"
                      strokeWidth="2"
                    />
                    <text x={p.x} y="145" className="fill-gray-500 font-mono text-[8px] text-center" textAnchor="middle">{p.label}</text>
                  </g>
                ))}

                {/* Definitions for Gradients */}
                <defs>
                  <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </Card>
        </div>

        {/* Agent Success rate Donut Chart */}
        <Card hoverGlow={true} className="border border-white/5 bg-dark-card/15 p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Bot className="w-4.5 h-4.5 text-ai-purple" /> Agent Mission Outcomes
            </h4>
            <p className="text-gray-500 text-xs mt-0.5">Ratios of background task outcomes.</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-6 py-2">
            {totalAgents === 0 ? (
              <div className="h-28 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase">No tasks executed yet</span>
              </div>
            ) : (
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* SVG Donut */}
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <circle cx="18" cy="18" r="15.9155" fill="transparent" className="stroke-gray-850" strokeWidth="4.5" />
                  
                  {/* Success segment */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.9155" 
                    fill="transparent" 
                    className="stroke-emerald-500" 
                    strokeWidth="4.5" 
                    strokeDasharray={`${successPct} ${100 - successPct}`}
                    strokeDashoffset="0"
                  />
                  
                  {/* Running segment */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.9155" 
                    fill="transparent" 
                    className="stroke-ai-blue" 
                    strokeWidth="4.5" 
                    strokeDasharray={`${runningPct} ${100 - runningPct}`}
                    strokeDashoffset={-successPct}
                  />

                  {/* Failed segment */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.9155" 
                    fill="transparent" 
                    className="stroke-rose-500" 
                    strokeWidth="4.5" 
                    strokeDasharray={`${failedPct} ${100 - failedPct}`}
                    strokeDashoffset={-(successPct + runningPct)}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-white">{Math.round(successPct)}%</span>
                  <span className="text-[8px] text-gray-500 font-semibold uppercase">Success</span>
                </div>
              </div>
            )}

            {/* Legends */}
            <div className="grid grid-cols-3 gap-2 w-full border-t border-gray-800/60 pt-4 mt-2">
              <div className="text-center flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-[9px] text-gray-400 font-bold">Done</span>
                </div>
                <span className="text-xs font-black text-white mt-0.5">{data.agentsCompleted}</span>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-ai-blue shrink-0"></span>
                  <span className="text-[9px] text-gray-400 font-bold">Active</span>
                </div>
                <span className="text-xs font-black text-white mt-0.5">{data.agentsRunning}</span>
              </div>
              <div className="text-center flex flex-col items-center">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="text-[9px] text-gray-400 font-bold">Fail</span>
                </div>
                <span className="text-xs font-black text-white mt-0.5">{data.agentsFailed}</span>
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* Bottom ATS Match Distribution Bar Chart */}
      <div className="grid grid-cols-1 gap-6">
        <Card hoverGlow={true} className="border border-white/5 bg-dark-card/15 p-5">
          <div className="mb-6 text-left">
            <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-emerald-450" /> ATS Match Score Distributions
            </h4>
            <p className="text-gray-500 text-xs mt-0.5">Distributions of candidate scores evaluating resume compliance parameters.</p>
          </div>

          <div className="flex flex-col gap-4 py-2">
            {data.atsDistribution.map((item) => {
              const maxCount = 20
              const percentage = Math.min((item.count / maxCount) * 100, 100)
              const isHigh = item.category.includes('High')
              const isMid = item.category.includes('Mid')
              const colorClass = isHigh ? 'bg-emerald-500' : isMid ? 'bg-amber-400' : 'bg-rose-500'

              return (
                <div key={item.category} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
                  <span className="text-[10px] text-gray-400 font-bold w-28 shrink-0">{item.category}</span>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="w-full bg-gray-850 h-3.5 rounded-lg overflow-hidden border border-gray-800 flex items-center">
                      <div 
                        className={`h-full rounded-lg transition-all duration-1000 ${colorClass}`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white w-8 shrink-0">{item.count} profiles</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

    </div>
  )
}
