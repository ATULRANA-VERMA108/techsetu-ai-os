import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Bot, UserCheck, BarChart3, ArrowRight, Sparkles, Zap, Shield, Globe } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card, CardContent } from '../ui/Card'

interface LandingPageProps {
  onLaunch: () => void
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunch }) => {
  const features = [
    {
      title: 'AI Chat System',
      description: 'Interact with advanced LLMs (Gemini, GPT, Claude) featuring streaming, markdown rendering, and local context memory.',
      icon: MessageSquare,
      color: 'text-sky-400',
      badge: 'Streaming'
    },
    {
      title: 'Autonomous AI Agents',
      description: 'Deploy specialized task agents (Coding, HR, Research, Data) that execute complex workflows and return files autonomously.',
      icon: Bot,
      color: 'text-ai-purple',
      badge: 'Agentic'
    },
    {
      title: 'AI Recruitment & ATS',
      description: 'Upload resumes, extract skills via OCR, compute automated ATS fit scores, and rank candidate profiles instantly.',
      icon: UserCheck,
      color: 'text-emerald-400',
      badge: 'ATS v2'
    },
    {
      title: 'Advanced AI Analytics',
      description: 'Track token usage, cost breakdowns, model performance, and operational activities with beautiful interactive charts.',
      icon: BarChart3,
      color: 'text-pink-500',
      badge: 'Real-time'
    }
  ]

  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  }

  const itemVariants: any = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col relative overflow-hidden">
      
      {/* Background grids and glowing lights */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.18),rgba(255,255,255,0))] -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 -z-10" />
      
      <div className="absolute top-[10%] left-[15%] w-96 h-96 bg-ai-blue/8 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute top-[20%] right-[10%] w-[30rem] h-[30rem] bg-ai-purple/8 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

      {/* Header / Top Navigation */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-ai-blue to-ai-purple flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.3)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            TECHSETU <span className="ai-gradient-text">AI OS</span>
          </span>
        </div>
        <Button variant="glass" size="sm" onClick={onLaunch}>
          Launch System
        </Button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-20 flex flex-col gap-24">
        
        {/* 1. HERO SECTION */}
        <section className="text-center flex flex-col items-center max-w-4xl mx-auto gap-6 mt-6 md:mt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel text-xs text-ai-purple border border-ai-purple/20 shadow-[0_0_15px_rgba(139,92,246,0.1)] mb-2"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            Empowering Teams with Autonomous AI SaaS
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none bg-gradient-to-b from-white via-gray-150 to-gray-400 bg-clip-text text-transparent"
          >
            The Future <span className="ai-gradient-text">AI Operating System</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 text-lg md:text-xl max-w-2xl leading-relaxed"
          >
            Manage files, run multiple AI models, trigger specialized agents, and rank applicants in a secure, unified workspace. All-in-one productivity suite.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4"
          >
            <Button variant="primary" size="lg" onClick={onLaunch} className="w-full sm:w-auto px-8 py-4 text-base">
              Launch AI OS <ArrowRight className="w-4 h-4 ml-2.5" />
            </Button>
            <a href="#features">
              <Button variant="glass" size="lg" className="w-full sm:w-auto px-8 py-4 text-base">
                Explore Features
              </Button>
            </a>
          </motion.div>
        </section>

        {/* 2. FEATURES GRID SECTION */}
        <section id="features" className="scroll-mt-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Core Modules</h2>
            <p className="text-gray-400 max-w-md mx-auto text-sm">
              An enterprise ecosystem built to deliver speed, customization, and analytical intelligence.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((feat) => {
              const Icon = feat.icon
              return (
                <motion.div key={feat.title} variants={itemVariants}>
                  <Card hoverGlow={true} hoverScale={true} className="h-full border border-white/5 bg-dark-card/30 flex flex-col justify-between">
                    <div className="mb-4 flex flex-row items-start justify-between gap-1.5">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gray-800/60 border border-gray-700/50 ${feat.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white tracking-tight">{feat.title}</h3>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-ai-blue bg-ai-blue/10 border border-ai-blue/20 px-2.5 py-0.5 rounded-full">
                        {feat.badge}
                      </span>
                    </div>
                    <CardContent className="text-gray-400 text-sm leading-relaxed mt-2">
                      {feat.description}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        </section>

        {/* 3. CTA & TRUST BANNER SECTION */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-panel p-8 md:p-12 rounded-3xl ai-glow border border-white/8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 mb-10 bg-gradient-to-r from-dark-card/50 via-ai-purple/5 to-ai-blue/5"
        >
          <div className="flex flex-col gap-3 max-w-xl text-left">
            <h2 className="text-3xl font-extrabold text-white">Experience AI Collaboration</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bring your own keys or leverage our free shared resources to explore collaborative workspaces, shared memory networks, and real-time workflows.
            </p>
            <div className="flex items-center gap-6 mt-2 text-xs text-gray-500 font-semibold">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-emerald-400" /> OAuth2 Secure</span>
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-ai-blue" /> Cloud Native</span>
            </div>
          </div>
          <Button variant="primary" size="lg" onClick={onLaunch} className="px-8 py-4 shrink-0 shadow-xl">
            Get Started Free
          </Button>
        </motion.section>

      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-gray-500 glass-panel">
        TECHSETU AI OS © 2026. Made with Tailwind CSS v4 & Framer Motion.
      </footer>
    </div>
  )
}
