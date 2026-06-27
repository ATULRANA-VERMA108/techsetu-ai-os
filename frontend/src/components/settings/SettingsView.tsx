import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { 
  Key, KeyRound, Server, ShieldCheck, Database, RefreshCw, Trash2, Eye, EyeOff,
  User as UserIcon, Bell, Settings as SettingsIcon, Info, Sun, Moon
} from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../../config'

interface SettingsViewProps {
  token: string | null
  onProfileUpdate?: (name: string) => void
  currentTheme?: 'dark' | 'light'
  onThemeToggle?: () => void
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  token, 
  onProfileUpdate,
  currentTheme = 'dark',
  onThemeToggle
}) => {
  // Profile settings state
  const [displayName, setDisplayName] = useState(localStorage.getItem('userName') || 'Atul')
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'HR Recruiter')
  const [profileSaved, setProfileSaved] = useState(false)

  // API Key override state
  const [apiKey, setApiKey] = useState(localStorage.getItem('geminiApiKey') || '')
  const [showKey, setShowKey] = useState(false)
  const [keySaved, setKeySaved] = useState(false)
  
  // App preferences state
  const [emailAlerts, setEmailAlerts] = useState(localStorage.getItem('prefEmailAlerts') !== 'false')
  const [pushAlerts, setPushAlerts] = useState(localStorage.getItem('prefPushAlerts') !== 'false')
  const [autoIndex, setAutoIndex] = useState(localStorage.getItem('prefAutoIndex') === 'true')
  const [prefSaved, setPrefSaved] = useState(false)

  // Connection status ping variables
  const [pingStatus, setPingStatus] = useState<'testing' | 'online' | 'offline'>('testing')
  const [dbStatus, setDbStatus] = useState<string>('Testing...')

  const checkBackendHealth = async () => {
    setPingStatus('testing')
    setDbStatus('Testing connection...')
    try {
      const res = await axios.get(`${API_BASE_URL}/api/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.status === 200) {
        setPingStatus('online')
        setDbStatus('PostgreSQL & MongoDB Connected')
      } else {
        setPingStatus('offline')
        setDbStatus('API unreachable')
      }
    } catch (err) {
      console.error('Health check failed', err)
      setPingStatus('offline')
      setDbStatus('API offline or CORS blocked')
    }
  }

  useEffect(() => {
    if (token) {
      checkBackendHealth()
    } else {
      setPingStatus('offline')
      setDbStatus('Unauthorized')
    }
  }, [token])

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (displayName.trim()) {
      localStorage.setItem('userName', displayName.trim())
      localStorage.setItem('userRole', userRole)
      if (onProfileUpdate) {
        onProfileUpdate(displayName.trim())
      }
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    }
  }

  // Save preferences changes
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('prefEmailAlerts', String(emailAlerts))
    localStorage.setItem('prefPushAlerts', String(pushAlerts))
    localStorage.setItem('prefAutoIndex', String(autoIndex))
    setPrefSaved(true)
    setTimeout(() => setPrefSaved(false), 3000)
  }

  // Save API Key key override
  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      localStorage.setItem('geminiApiKey', apiKey.trim())
      setKeySaved(true)
      setTimeout(() => setKeySaved(false), 3000)
    }
  }

  const handleClearKey = () => {
    localStorage.removeItem('geminiApiKey')
    setApiKey('')
    setKeySaved(false)
  }

  const handleWipeCache = () => {
    if (confirm('Are you sure you want to clear your local cache? This will log you out.')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const userEmail = localStorage.getItem('userEmail') || 'atulverma@gmail.com'

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      
      {/* 1. User Profile Settings */}
      <Card className="border border-gray-800/80 bg-gray-900/40 backdrop-blur-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-ai-purple/10 border border-ai-purple/30 text-ai-purple">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">User Profile Details</h2>
              <p className="text-sm text-gray-400">Configure your personal info and role details displayed inside the workspace.</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-400 uppercase font-semibold block mb-1.5">Display Name</label>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-gray-900/60 border-gray-800 hover:border-gray-700 focus:border-ai-purple transition-all"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase font-semibold block mb-1.5">Organization Role</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-gray-900/60 border border-gray-805 text-sm text-gray-300 hover:border-gray-700 focus:border-ai-purple focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Developer">Developer</option>
                  <option value="HR Recruiter">HR Recruiter</option>
                  <option value="System Admin">System Admin</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Guest Evaluator">Guest Evaluator</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <Button 
                type="submit" 
                className="bg-ai-purple hover:bg-ai-purple/80 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(139,92,246,0.2)] border border-ai-purple/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Save Profile Changes
              </Button>
              
              {profileSaved && (
                <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5 animate-pulse">
                  <ShieldCheck className="w-4 h-4" /> Profile updated successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      </Card>

      {/* 2. System Preferences & Theme Settings */}
      <Card className="border border-gray-800/80 bg-gray-900/40 backdrop-blur-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">System & Preferences</h2>
              <p className="text-sm text-gray-400">Toggle UI themes, alert preferences, and AI automation triggers.</p>
            </div>
          </div>

          <form onSubmit={handleSavePreferences} className="space-y-5 mt-6">
            
            {/* Theme Selector */}
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-4">
              <div>
                <span className="text-sm font-bold text-white block">Appearance Mode</span>
                <span className="text-xs text-gray-400">Toggle light theme or dark theme across the dashboard.</span>
              </div>
              {onThemeToggle && (
                <button
                  type="button"
                  onClick={onThemeToggle}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 border border-gray-700 hover:border-gray-600 text-xs font-semibold text-white transition-all cursor-pointer"
                >
                  {currentTheme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span>Switch to Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-ai-purple" />
                      <span>Switch to Dark Mode</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Mock Switches */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">Email Alerts</span>
                  <span className="text-xs text-gray-400">Receive reports and candidate matching alerts directly in your inbox.</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-800 text-ai-blue focus:ring-ai-blue cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">Push Notifications</span>
                  <span className="text-xs text-gray-400">Show transient updates and system pings on the top navbar.</span>
                </div>
                <input
                  type="checkbox"
                  checked={pushAlerts}
                  onChange={(e) => setPushAlerts(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-800 text-ai-blue focus:ring-ai-blue cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-white block">AI Auto-Index Uploaded Files</span>
                  <span className="text-xs text-gray-400">Immediately run OCR, split chunks, and build index for files on upload.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoIndex}
                  onChange={(e) => setAutoIndex(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-800 text-ai-blue focus:ring-ai-blue cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <Button 
                type="submit" 
                className="bg-emerald-500 hover:bg-emerald-500/80 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(16,185,129,0.2)] border border-emerald-500/30 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Save Preferences
              </Button>
              
              {prefSaved && (
                <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5 animate-pulse">
                  <ShieldCheck className="w-4 h-4" /> System preferences saved!
                </span>
              )}
            </div>

          </form>
        </div>
      </Card>

      {/* 3. API Configuration Card */}
      <Card className="border border-gray-800/80 bg-gray-900/40 backdrop-blur-md">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-ai-blue/10 border border-ai-blue/30 text-ai-blue">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Google Gemini API Key Override</h2>
              <p className="text-sm text-gray-400">Manage client-side API credentials to run chat and recruitment features.</p>
            </div>
          </div>

          <form onSubmit={handleSaveKey} className="space-y-4 mt-6">
            <div className="relative">
              <Input
                type={showKey ? 'text' : 'password'}
                placeholder="Paste your custom Gemini API key (AQ.Ab8RN6... or AIzaSy...)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-12 w-full bg-gray-900/60 border-gray-800 hover:border-gray-700 focus:border-ai-blue transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex gap-3">
                <Button 
                  type="submit" 
                  className="bg-ai-blue hover:bg-ai-blue/80 text-white px-5 py-2.5 rounded-xl font-medium shadow-[0_0_15px_rgba(59,130,246,0.2)] border border-ai-blue/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Save Key Override
                </Button>
                {apiKey && (
                  <Button 
                    type="button" 
                    onClick={handleClearKey}
                    className="bg-transparent hover:bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Reset to Server Default
                  </Button>
                )}
              </div>
              
              {keySaved && (
                <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1.5 animate-pulse">
                  <ShieldCheck className="w-4 h-4" /> Key override updated successfully!
                </span>
              )}
            </div>
          </form>
        </div>
      </Card>

      {/* 4. Diagnostics & active sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Connection Diagnostics Card */}
        <Card className="border border-gray-800/80 bg-gray-900/40 backdrop-blur-md">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-ai-purple/10 border border-ai-purple/30 text-ai-purple">
                  <Server className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">System Diagnostics</h3>
              </div>
              <button 
                type="button"
                onClick={checkBackendHealth}
                className="p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-gray-800 text-gray-400 hover:text-white transition-all cursor-pointer"
                title="Re-run health check"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 mt-6">
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">API Base URL</span>
                <code className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-950 border border-gray-800 text-gray-300 block overflow-x-auto whitespace-nowrap">
                  {API_BASE_URL}
                </code>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">Server Status</span>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    pingStatus === 'online' ? 'bg-emerald-500 animate-pulse' :
                    pingStatus === 'testing' ? 'bg-amber-500 animate-ping' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm font-semibold capitalize text-gray-200">{pingStatus}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">Database Connectivity</span>
                <span className="text-sm text-gray-400 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-ai-blue" />
                  {dbStatus}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Session Card */}
        <Card className="border border-gray-800/80 bg-gray-900/40 backdrop-blur-md">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Active Session</h3>
            </div>

            <div className="space-y-3 mt-6">
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold block mb-0.5">Logged In User</span>
                <span className="text-sm font-bold text-white">{displayName}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase font-semibold block mb-0.5">Linked Email</span>
                <span className="text-sm text-gray-400">{userEmail}</span>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={handleWipeCache}
                  className="w-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 hover:border-transparent py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Wipe Browser Session Cache
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

    </div>
  )
}
