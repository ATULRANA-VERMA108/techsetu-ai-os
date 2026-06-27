import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, LayoutDashboard, 
  MessageSquare, UserCheck, FileText, Bot, BarChart3, Users, Settings
} from 'lucide-react'

interface SidebarProps {
  activeTab?: string
  setActiveTab?: (tab: string) => void
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab = 'Dashboard', setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'AI Chat', icon: MessageSquare },
    { name: 'AI Recruitment', icon: UserCheck },
    { name: 'Document AI', icon: FileText },
    { name: 'AI Agents', icon: Bot },
    { name: 'Real-Time Collaboration', icon: Users },
    { name: 'Analytics', icon: BarChart3 },
  ]

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="glass-panel border-r border-white/8 h-[calc(100vh-73px)] sticky top-[73px] flex flex-col justify-between py-6 select-none shrink-0 z-35"
    >
      {/* Navigation items */}
      <div className="flex flex-col gap-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab?.(item.name)}
              className={`flex items-center gap-4.5 px-4 py-3 rounded-xl transition-all relative cursor-pointer ${
                isActive 
                  ? 'text-white font-bold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-ai-blue/25 to-ai-purple/25 border-l-2 border-ai-purple rounded-xl -z-10"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-ai-blue' : 'text-gray-400'}`} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 }}
                  className="text-sm tracking-wide"
                >
                  {item.name}
                </motion.span>
              )}
            </button>
          )
        })}
      </div>

      {/* Bottom control */}
      <div className="flex flex-col gap-2 px-3 border-t border-gray-800/80 pt-6">
        <button className="flex items-center gap-4.5 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
          <Settings className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span className="text-sm tracking-wide">Settings</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center p-2 mt-2 rounded-xl bg-gray-800/40 hover:bg-gray-800 border border-gray-800/80 hover:border-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer align-self-center"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </motion.aside>
  )
}
