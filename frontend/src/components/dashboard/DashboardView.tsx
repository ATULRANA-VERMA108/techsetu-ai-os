import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  Sparkles, Terminal, Activity, Zap, 
  MessageSquare, UserCheck, FileText, Bot, 
  ArrowUpRight, ArrowDownRight, Shield, Cpu, Database 
} from 'lucide-react'

interface DashboardViewProps {
  userName: string | null
  onTabChange: (tab: string) => void
}

export const DashboardView: React.FC<DashboardViewProps> = ({ userName, onTabChange }) => {
  const stats = [
    {
      title: 'Total AI Tokens',
      value: '245,890',
      change: '+12.3% this week',
      isPositive: true,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10'
    },
    {
      title: 'Active Agents',
      value: '12 Tasks',
      change: '92% success rate',
      isPositive: true,
      color: 'text-ai-purple',
      bg: 'bg-ai-purple/10'
    },
    {
      title: 'ATS Resumes Scanned',
      value: '45 Profiles',
      change: '+8 new today',
      isPositive: true,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10'
    },
    {
      title: 'Average Latency',
      value: '340ms',
      change: '-15% compile latency',
      isPositive: true, // positive meaning improvement
      color: 'text-pink-500',
      bg: 'bg-pink-500/10'
    }
  ]

  const recommendations = [
    {
      id: 1,
      type: 'agent',
      icon: Bot,
      color: 'text-ai-purple',
      title: 'Optimize AI services code',
      desc: 'Coding Agent identified redundancy in main.py. Optimize functions to reduce response overhead by 15%.'
    },
    {
      id: 2,
      type: 'recruitment',
      icon: UserCheck,
      color: 'text-emerald-400',
      title: 'New High-Score Candidate matching',
      desc: '3 recently uploaded CVs scored > 85% match against the "Senior React Developer" position profile.'
    },
    {
      id: 3,
      type: 'security',
      icon: Shield,
      color: 'text-sky-400',
      title: 'Stateless session verified',
      desc: 'Spring Security validated stateless sessions. JWT validation signature is secure.'
    }
  ]

  const activities = [
    {
      action: 'Chatted with Gemini 1.5 Pro',
      detail: '"Outline SaaS roadmap and backend integrations"',
      time: '2 mins ago',
      icon: MessageSquare,
      color: 'text-sky-400'
    },
    {
      action: 'HR Agent ran ATS CV Parse',
      detail: 'Extracted skills and generated questions for atul_resume.pdf',
      time: '1 hour ago',
      icon: UserCheck,
      color: 'text-emerald-400'
    },
    {
      action: 'Data Agent completed query report',
      detail: 'Aggregated token consumption and database metrics',
      time: '4 hours ago',
      icon: Activity,
      color: 'text-pink-500'
    }
  ]

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      
      {/* 1. Welcome Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-dark-card/50 via-ai-purple/5 to-ai-blue/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Good Morning, {userName || 'Atul'} 👋
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Here is your AI productivity overview and system diagnostics report for today.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-gray-800/40 border border-gray-700/50 text-xs text-ai-blue font-semibold shrink-0 self-start sm:self-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          System Stable
        </div>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} hoverScale={true} className="border border-white/5 bg-dark-card/30 p-5 flex flex-col justify-between h-[130px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.title}</span>
              <div className={`p-1.5 rounded-lg ${stat.bg} ${stat.color}`}>
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold text-white tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
                {stat.isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{stat.change}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 3. AI Recommendations (Insights) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card hoverGlow={true} className="border border-white/5 flex-1 flex flex-col justify-between">
            <CardHeader className="mb-5">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-ai-blue animate-pulse" />
                AI Recommendations & Insights
              </CardTitle>
              <CardDescription>Automated actions triggered by autonomous OS monitors.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {recommendations.map((rec) => {
                const Icon = rec.icon
                return (
                  <div key={rec.id} className="p-4 rounded-xl bg-dark-card/40 border border-gray-800/80 hover:border-gray-700/80 transition-all flex gap-4 items-start">
                    <div className={`p-2 rounded-lg bg-gray-800/80 border border-gray-700/50 shrink-0 ${rec.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 flex flex-col gap-0.5 text-left">
                      <div className="text-sm font-bold text-white">{rec.title}</div>
                      <div className="text-xs text-gray-400 leading-relaxed mt-1">{rec.desc}</div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* 4. Quick Actions Panel */}
        <Card hoverGlow={true} className="border border-white/5 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-ai-purple" />
              Quick Actions
            </CardTitle>
            <CardDescription>Fast-track workspace commands</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button variant="glass" className="justify-start w-full py-3" onClick={() => onTabChange('AI Chat')}>
              <MessageSquare className="w-4 h-4 mr-3 text-sky-400" /> Launch New Chat
            </Button>
            <Button variant="glass" className="justify-start w-full py-3" onClick={() => onTabChange('AI Recruitment')}>
              <UserCheck className="w-4 h-4 mr-3 text-emerald-400" /> Scan Resume Pool
            </Button>
            <Button variant="glass" className="justify-start w-full py-3" onClick={() => onTabChange('Document AI')}>
              <FileText className="w-4 h-4 mr-3 text-pink-500" /> Upload PDF Document
            </Button>
            <Button variant="glass" className="justify-start w-full py-3" onClick={() => onTabChange('AI Agents')}>
              <Bot className="w-4 h-4 mr-3 text-ai-purple" /> Deploy Task Agent
            </Button>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 5. Recent Activity Feed */}
        <Card hoverGlow={true} className="border border-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-ai-blue" />
              Recent Activity Feed
            </CardTitle>
            <CardDescription>Real-time updates of operations executed in your session.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {activities.map((act, index) => {
              const Icon = act.icon
              return (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-800/40 last:border-b-0 last:pb-0">
                  <div className={`p-2 rounded-lg bg-gray-800/40 border border-gray-700/50 shrink-0 ${act.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 flex flex-col text-left">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-white">{act.action}</span>
                      <span className="text-[10px] text-gray-500 font-semibold uppercase">{act.time}</span>
                    </div>
                    <span className="text-xs text-gray-400 leading-normal mt-1">{act.detail}</span>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* 6. System Health Monitor */}
        <Card hoverGlow={true} className="border border-white/5 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-ai-blue" />
              Diagnostics & Health
            </CardTitle>
            <CardDescription>Local infrastructure metrics</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {/* CPU Metric */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-400 uppercase tracking-wide">CPU Allocation</span>
                <span className="text-white">28% Usage</span>
              </div>
              <div className="w-full bg-gray-850 h-2 rounded-full overflow-hidden border border-gray-800">
                <div className="bg-gradient-to-r from-ai-blue to-ai-purple h-full rounded-full w-[28%]" />
              </div>
            </div>

            {/* Memory Metric */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-400 uppercase tracking-wide">RAM Allocation</span>
                <span className="text-white">4.2 / 8.0 GB</span>
              </div>
              <div className="w-full bg-gray-850 h-2 rounded-full overflow-hidden border border-gray-800">
                <div className="bg-gradient-to-r from-ai-blue to-ai-purple h-full rounded-full w-[52.5%]" />
              </div>
            </div>

            {/* Database grid */}
            <div className="border-t border-gray-800/80 pt-4 mt-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-ai-purple" /> Docker Instances
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-emerald-950/20 px-2 py-1.5 rounded-lg border border-emerald-500/20 text-center flex flex-col items-center">
                  <span className="text-[9px] text-gray-500 uppercase font-bold">SQL</span>
                  <span className="text-[10px] text-emerald-400 font-bold mt-0.5">Online</span>
                </div>
                <div className="bg-emerald-950/20 px-2 py-1.5 rounded-lg border border-emerald-500/20 text-center flex flex-col items-center">
                  <span className="text-[9px] text-gray-500 uppercase font-bold">MONGO</span>
                  <span className="text-[10px] text-emerald-400 font-bold mt-0.5">Online</span>
                </div>
                <div className="bg-emerald-950/20 px-2 py-1.5 rounded-lg border border-emerald-500/20 text-center flex flex-col items-center">
                  <span className="text-[9px] text-gray-500 uppercase font-bold">REDIS</span>
                  <span className="text-[10px] text-emerald-400 font-bold mt-0.5">Online</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
