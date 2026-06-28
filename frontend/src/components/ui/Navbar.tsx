import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Bell, User, Sun, Moon, LogOut, Settings as SettingsIcon, Menu } from 'lucide-react'

interface NavbarProps {
  userDisplayName?: string
  onProfileClick?: () => void
  onLogout?: () => void
  onThemeToggle?: () => void
  currentTheme?: 'dark' | 'light'
  onMenuClick?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ 
  userDisplayName = 'Atul', 
  onProfileClick, 
  onLogout,
  onThemeToggle,
  currentTheme = 'dark',
  onMenuClick
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const userEmail = localStorage.getItem('userEmail') || 'atulverma@gmail.com'

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/8 backdrop-blur-md px-4 sm:px-6 py-4 flex items-center justify-between">
      {/* Brand / Logo */}
      <div className="flex items-center gap-2">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="md:hidden p-1.5 -ml-1 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-ai-blue to-ai-purple flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.3)] shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          TECHSETU <span className="ai-gradient-text">AI OS</span>
        </span>
      </div>

      {/* Right Side: Welcome Message, Alerts, Profile */}
      <div className="flex items-center gap-4">
        
        {/* Dynamic greeting */}
        <span className="hidden md:inline text-sm text-gray-400">
          {getGreeting()}, <span className="text-white font-semibold">{userDisplayName} 👋</span>
        </span>

        {/* Notifications Icon */}
        <button className="relative p-2 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 text-gray-400 hover:text-white transition-all cursor-pointer">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-ai-purple animate-pulse"></span>
        </button>

        {/* Profile Avatar & Interactive Dropdown */}
        <div className="flex items-center gap-2 pl-2 border-l border-gray-800 relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`w-8 h-8 rounded-xl bg-gray-800 border flex items-center justify-center text-ai-blue shadow-inner cursor-pointer hover:border-ai-blue/50 transition-colors focus:outline-none ${
              showDropdown ? 'border-ai-blue bg-gray-700/80 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'border-gray-700'
            }`}
            title="User Account Menu"
          >
            <User className="w-4 h-4" />
          </button>

          {/* Account Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 top-11 w-56 glass-panel rounded-2xl border border-white/10 shadow-2xl p-2.5 z-50 flex flex-col bg-gray-900/95 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* User Bio Header */}
              <div className="px-3.5 py-3 border-b border-gray-800/80 flex flex-col gap-0.5 mb-2 select-text">
                <span className="text-xs font-extrabold text-white truncate">{userDisplayName}</span>
                <span className="text-[10px] text-gray-500 truncate">{userEmail}</span>
              </div>

              {/* Theme Toggle option */}
              {onThemeToggle && (
                <button
                  onClick={() => {
                    onThemeToggle()
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer text-left"
                >
                  {currentTheme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Switch to Light Theme</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-ai-purple shrink-0" />
                      <span>Switch to Dark Theme</span>
                    </>
                  )}
                </button>
              )}

              {/* Settings navigation Option */}
              {onProfileClick && (
                <button
                  onClick={() => {
                    onProfileClick()
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer text-left"
                >
                  <SettingsIcon className="w-4 h-4 text-ai-blue shrink-0" />
                  <span>Configure Settings</span>
                </button>
              )}

              {/* Logout Option */}
              {onLogout && (
                <button
                  onClick={() => {
                    onLogout()
                    setShowDropdown(false)
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer text-left mt-1.5 border-t border-gray-800/50 pt-2"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log Out Session</span>
                </button>
              )}

            </div>
          )}
        </div>
      </div>
    </header>
  )
}
