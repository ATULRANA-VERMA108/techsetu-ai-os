import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User as UserIcon, X, Sparkles } from 'lucide-react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import axios from 'axios'
import { API_BASE_URL } from '../../config'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (token: string, userName: string, email: string) => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      if (activeTab === 'login') {
        const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
          email,
          password
        })
        const data = res.data
        onSuccess(data.token, data.name, data.email)
      } else {
        await axios.post(`${API_BASE_URL}/api/auth/signup`, {
          name,
          email,
          password
        })
        setSuccessMsg('Registration successful! Please sign in.')
        setActiveTab('login')
        setName('')
        setPassword('')
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error)
      } else {
        setError('Connection failed. Make sure backend is running.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleMockLogin = () => {
    setLoading(true)
    setError('')
    setTimeout(() => {
      onSuccess('mock-google-oauth2-jwt-token-xyz', 'Atul Google', email || 'atul@google.com')
      setLoading(false)
    }, 1200)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="w-full max-w-md glass-panel rounded-2xl p-6 shadow-2xl relative border border-white/10 z-10"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-gray-800/60 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-ai-blue to-ai-purple flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.3)] mb-3">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Access TechSetu OS</h3>
              <p className="text-gray-400 text-xs mt-1 text-center">
                Authorize your secure workspace session
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800/80 mb-5">
              <button
                onClick={() => { setActiveTab('login'); setError(''); }}
                className={`flex-grow pb-3 text-sm font-bold border-b-2 cursor-pointer transition-all ${
                  activeTab === 'login' ? 'border-ai-purple text-white' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setActiveTab('signup'); setError(''); }}
                className={`flex-grow pb-3 text-sm font-bold border-b-2 cursor-pointer transition-all ${
                  activeTab === 'signup' ? 'border-ai-purple text-white' : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-xs text-left">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs text-left">
                {successMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {activeTab === 'signup' && (
                <Input
                  label="Full Name"
                  placeholder="Atul Kumar"
                  icon={<UserIcon className="w-4 h-4" />}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <Input
                label="Email Address"
                placeholder="name@company.com"
                icon={<Mail className="w-4 h-4" />}
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Password"
                placeholder="••••••••"
                icon={<Lock className="w-4 h-4" />}
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button variant="primary" type="submit" isLoading={loading} className="w-full mt-2">
                {activeTab === 'login' ? 'Authenticate Session' : 'Register Account'}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-grow border-t border-gray-800/80"></div>
              <span className="text-[10px] text-gray-500 uppercase font-bold px-3">Or Continue With</span>
              <div className="flex-grow border-t border-gray-800/80"></div>
            </div>

            {/* Google OAuth mock */}
            <button
              onClick={handleGoogleMockLogin}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2.5 bg-gray-800/50 hover:bg-gray-800 text-gray-200 text-sm font-semibold py-3 px-4 rounded-xl border border-gray-800 hover:border-gray-700 transition duration-300 transform active:scale-[0.98] cursor-pointer"
              type="button"
            >
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
