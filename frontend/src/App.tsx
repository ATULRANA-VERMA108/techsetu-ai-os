import { useState } from 'react'
import { LandingPage } from './components/landing/LandingPage'
import { Navbar } from './components/ui/Navbar'
import { Sidebar } from './components/ui/Sidebar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui/Card'
import { AuthModal } from './components/auth/AuthModal'
import { DashboardView } from './components/dashboard/DashboardView'
import { ChatView } from './components/chat/ChatView'
import { RecruitmentView } from './components/recruitment/RecruitmentView'
import { DocumentView } from './components/document/DocumentView'
import { AgentView } from './components/agent/AgentView'
import { CollaborationView } from './components/collaboration/CollaborationView'
import { AnalyticsView } from './components/analytics/AnalyticsView'
import { AlertTriangle } from 'lucide-react'

function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing')
  const [activeTab, setActiveTab] = useState('Dashboard')
  
  // Auth state variables
  const [token, setToken] = useState<string | null>(localStorage.getItem('jwtToken'))
  const [userName, setUserName] = useState<string | null>(localStorage.getItem('userName'))
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const handleLaunch = () => {
    if (token) {
      setView('app')
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const handleAuthSuccess = (jwt: string, name: string, email: string) => {
    localStorage.setItem('jwtToken', jwt)
    localStorage.setItem('userName', name)
    localStorage.setItem('userEmail', email)
    setToken(jwt)
    setUserName(name)
    setIsAuthModalOpen(false)
    setView('app')
  }

  const handleLogout = () => {
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    setToken(null)
    setUserName(null)
    setView('landing')
  }

  if (view === 'landing') {
    return (
      <>
        <LandingPage onLaunch={handleLaunch} />
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
          onSuccess={handleAuthSuccess} 
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col">
      {/* 1. Navbar */}
      <Navbar userDisplayName={userName || 'Atul'} onExit={handleLogout} />

      {/* Main layout container with sidebar + main content */}
      <div className="flex flex-1 relative">
        {/* 2. Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* 3. Main Content Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">
              {activeTab} <span className="text-xs text-ai-blue font-bold uppercase ml-2 px-2 py-0.5 rounded-full border border-ai-blue/30 bg-ai-blue/10">UI Style Guide</span>
            </h1>
            <p className="text-gray-400 text-sm">
              Exploring the reusable components, glassmorphic themes, and responsive design systems.
            </p>
          </div>

          {/* Conditional Layout depending on active tab */}
          {activeTab === 'Dashboard' ? (
            <DashboardView userName={userName} onTabChange={setActiveTab} />
          ) : activeTab === 'AI Chat' ? (
            <ChatView token={token} />
          ) : activeTab === 'AI Recruitment' ? (
            <RecruitmentView token={token} />
          ) : activeTab === 'Document AI' ? (
            <DocumentView token={token} />
          ) : activeTab === 'AI Agents' ? (
            <AgentView token={token} />
          ) : activeTab === 'Real-Time Collaboration' ? (
            <CollaborationView userName={userName} />
          ) : activeTab === 'Analytics' ? (
            <AnalyticsView token={token} />
          ) : (
            // Fallback content for other tabs (Placeholder pages for future phases)
            <div className="flex items-center justify-center h-[50vh]">
              <Card className="max-w-md text-center">
                <CardHeader className="items-center">
                  <AlertTriangle className="w-12 h-12 text-ai-purple mb-2 animate-bounce" />
                  <CardTitle>{activeTab} Module</CardTitle>
                  <CardDescription>Phase integration pending</CardDescription>
                </CardHeader>
                <CardContent>
                  This screen will be completed in the upcoming phases of the <strong>TECHSETU AI OS</strong> roadmap. Click back to <strong>Dashboard</strong> to view the design system showcase.
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
