import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, ChevronRight, LayoutDashboard, 
  MessageSquare, UserCheck, FileText, Bot, BarChart3, Users, Settings
} from 'lucide-react'

interface SidebarProps {
  activeTab?: string
  setActiveTab?: (tab: string) => void
  isMobileOpen?: boolean
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab = 'Dashboard', 
  setActiveTab,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Media query listener to switch responsive modes
  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const handleMediaChange = () => setIsMobile(media.matches)
    handleMediaChange()
    media.addEventListener('change', handleMediaChange)
    return () => media.removeEventListener('change', handleMediaChange)
  }, [])

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'AI Chat', icon: MessageSquare },
    { name: 'AI Recruitment', icon: UserCheck },
    { name: 'Document AI', icon: FileText },
    { name: 'AI Agents', icon: Bot },
    { name: 'Real-Time Collaboration', icon: Users },
    { name: 'Analytics', icon: BarChart3 },
  ]

  const handleTabClick = (tabName: string) => {
    setActiveTab?.(tabName)
    if (isMobile) {
      onCloseMobile?.()
    }
  }

  return (
    <>
      {/* Mobile Drawer Backdrop overlay */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        animate={
          isMobile 
            ? { x: isMobileOpen ? 0 : -280, width: 260 } 
            : { x: 0, width: isCollapsed ? 80 : 260 }
        }
        initial={isMobile ? { x: -280, width: 260 } : { x: 0, width: 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`glass-panel border-r border-white/8 flex flex-col justify-between py-6 select-none shrink-0 ${
          isMobile 
            ? 'fixed top-[73px] left-0 h-[calc(100vh-73px)] z-45 shadow-2xl bg-gray-900/95 backdrop-blur-xl' 
            : 'sticky top-[73px] h-[calc(100vh-73px)] z-35'
        }`}
      >
        {/* Navigation items */}
        <div className="flex flex-col gap-2 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.name
            return (
              <button
                key={item.name}
                onClick={() => handleTabClick(item.name)}
                className={`flex items-center gap-4.5 px-4 py-3 rounded-xl transition-all relative cursor-pointer min-h-[44px] ${
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
                {(!isCollapsed || isMobile) && (
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
          <button 
            onClick={() => handleTabClick('Settings')}
            className={`flex items-center gap-4.5 px-4 py-3 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'Settings' 
                ? 'bg-ai-blue/10 text-ai-blue font-semibold border border-ai-blue/30 shadow-[0_0_15px_rgba(30,144,255,0.15)]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5 shrink-0" />
            {(!isCollapsed || isMobile) && <span className="text-sm tracking-wide">Settings</span>}
          </button>

          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center justify-center p-2 mt-2 rounded-xl bg-gray-800/40 hover:bg-gray-800 border border-gray-800/80 hover:border-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer align-self-center min-h-[36px] min-w-[36px]"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>
      </motion.aside>
    </>
  )
}
