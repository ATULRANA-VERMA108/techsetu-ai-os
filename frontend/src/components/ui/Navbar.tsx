import React from 'react'
import { Sparkles, Bell, User } from 'lucide-react'

interface NavbarProps {
  userDisplayName?: string
  onExit?: () => void
  onProfileClick?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ userDisplayName = 'Atul', onExit, onProfileClick }) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/8 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-ai-blue to-ai-purple flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.3)]">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          TECHSETU <span className="ai-gradient-text">AI OS</span>
        </span>
      </div>

      {/* Right Side: Welcome Message, Alerts, Profile */}
      <div className="flex items-center gap-4">
        {onExit && (
          <button
            onClick={onExit}
            className="text-xs font-semibold text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-all cursor-pointer mr-2 bg-white/2"
          >
            Exit OS
          </button>
        )}
        <span className="hidden md:inline text-sm text-gray-400">
          Good Morning, <span className="text-white font-semibold">{userDisplayName} 👋</span>
        </span>

        {/* Notifications Icon */}
        <button className="relative p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-ai-purple animate-pulse"></span>
        </button>

        {/* Profile Avatar placeholder */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
          <button
            onClick={onProfileClick}
            className="w-8 h-8 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center text-ai-blue shadow-inner cursor-pointer hover:border-ai-blue/50 transition-colors focus:outline-none"
            title="Open Settings"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
