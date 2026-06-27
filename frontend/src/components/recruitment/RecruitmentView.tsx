import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Loader } from '../ui/Loader'
import { 
  Upload, Briefcase, Sparkles, User, Mail, 
  CheckCircle, AlertTriangle, HelpCircle
} from 'lucide-react'
import axios from 'axios'

interface RecruitmentViewProps {
  token: string | null
}

interface AnalysisResult {
  candidateName: string
  email: string
  skills: string[]
  matchRate: number
  skillGap: string[]
  interviewQuestions: string[]
}

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({ token }) => {
  const [file, setFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const templates = [
    {
      title: 'Senior React Developer',
      desc: 'Looking for a Senior React Engineer with 5+ years of experience. Must have strong skills in TypeScript, React, Tailwind CSS, State Management (Zustand/Redux), Next.js, and automated unit testing.'
    },
    {
      title: 'Spring Boot Architect',
      desc: 'Seeking a Spring Boot Backend Architect. Core requirements: Java 21, Spring Security 6, JPA/Hibernate, PostgreSQL, MongoDB, Redis, Docker orchestration, and microservices design patterns.'
    },
    {
      title: 'AI Data Engineer',
      desc: 'Requires an AI Data Engineer experienced in building LLM apps. Skills needed: Python, FastAPI, LangChain, Google Gemini API, Vector Databases (Pinecone/Chroma), RAG indexing, and dockerized services.'
    }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Please select or upload a resume file (PDF or TXT)')
      return
    }
    if (!jobDescription.trim()) {
      setError('Please provide a job description for analysis')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('jobDescription', jobDescription)

    const customKey = localStorage.getItem('geminiApiKey') || ''

    try {
      const res = await axios.post('http://localhost:8080/api/recruitment/parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
          'X-Gemini-Key': customKey
        }
      })
      setResult(res.data)
    } catch (err: any) {
      console.error('Error matching resume', err)
      const errorMsg = err.response?.data?.error || err.message || 'ATS analysis failed.'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-500'
    if (score >= 50) return 'text-amber-400 stroke-amber-500'
    return 'text-rose-400 stroke-rose-500'
  }

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      <div className="glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-dark-card/50 via-ai-purple/5 to-ai-blue/5">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          AI Recruitment & ATS Matcher 👋
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Evaluate resume profiles against job parameters, calculate compliance scores, flag skill gaps, and auto-compile targeted interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Form Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card hoverGlow={true} className="border border-white/5 bg-dark-card/20 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-ai-blue" />
              Upload & Requirements
            </h3>
            
            <form onSubmit={handleAnalyze} className="flex flex-col gap-5">
              
              {/* File Dropzone */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Candidate Resume</label>
                <div className="relative border border-dashed border-gray-700/60 rounded-xl hover:border-ai-blue/50 hover:bg-white/2 transition-all p-5 flex flex-col items-center justify-center text-center cursor-pointer min-h-[120px]">
                  <input 
                    type="file" 
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-gray-500 mb-2" />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-white truncate max-w-[200px]">{file.name}</span>
                      <span className="text-[10px] text-gray-500 font-semibold mt-0.5">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-gray-400 font-semibold">Drag resume here or click to select</span>
                      <span className="text-[9px] text-gray-500 font-semibold mt-1">Supports PDF, TXT (Max 5MB)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Prefill templates */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">JD Templates</span>
                <div className="flex flex-wrap gap-2">
                  {templates.map((t) => (
                    <button
                      key={t.title}
                      type="button"
                      onClick={() => setJobDescription(t.desc)}
                      className="px-2.5 py-1.5 rounded-lg border border-gray-800 text-[10px] text-gray-450 hover:text-white hover:border-gray-700 bg-white/2 hover:bg-white/5 transition-all cursor-pointer font-bold"
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Description Textarea */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste core job profile details, technical requirements, and expectations here..."
                  rows={6}
                  className="w-full bg-black/40 border border-gray-850 focus:border-ai-blue rounded-xl p-3 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-ai-blue/30 leading-relaxed"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg border border-red-500/20 bg-red-950/10 text-xs text-red-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                variant="primary" 
                disabled={loading || !file || !jobDescription}
                className="w-full py-3"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader type="spinner" size="sm" />
                    <span>Analyzing Match...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span>Evaluate Match Rate</span>
                  </div>
                )}
              </Button>

            </form>
          </Card>
        </div>

        {/* Right Output Column */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {loading ? (
            /* Loading State Display */
            <Card className="border border-white/5 bg-dark-card/10 flex-1 flex flex-col items-center justify-center p-12 min-h-[450px]">
              <Loader type="glow-pulse" size="lg" />
              <h4 className="text-base font-bold text-white tracking-tight mt-6">Evaluating Candidate Credentials</h4>
              <p className="text-gray-500 text-xs text-center max-w-sm mt-2 leading-relaxed">
                Gemini is extracting resume profiles, compiling requirement checkmarks, performing cross-matching compliance scores, and indexing gaps.
              </p>
            </Card>
          ) : result ? (
            /* Results Screen */
            <div className="flex flex-col gap-6 flex-1">
              
              {/* Top Row: Score + Profile Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Score Dial widget */}
                <Card className="border border-white/5 bg-dark-card/20 p-5 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">ATS Match Score</span>
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* SVG Radial Gauge */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="stroke-gray-800"
                        strokeWidth="3.5"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={`stroke-current transition-all duration-1000 ${getScoreColor(result.matchRate)}`}
                        strokeWidth="3.5"
                        strokeDasharray={`${result.matchRate}, 100`}
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white">{result.matchRate}%</span>
                    </div>
                  </div>
                </Card>

                {/* Candidate basic profile cards */}
                <Card className="border border-white/5 bg-dark-card/20 p-5 sm:col-span-2 flex flex-col justify-between text-left">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Candidate Summary</span>
                    <div className="flex items-center gap-2 text-white font-bold text-base tracking-tight mt-1">
                      <User className="w-4 h-4 text-ai-blue shrink-0" />
                      <span>{result.candidateName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400 text-xs mt-0.5">
                      <Mail className="w-4 h-4 text-ai-purple shrink-0" />
                      <span>{result.email}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-800/80 pt-3 mt-3">
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Identified Core Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.skills.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded bg-ai-blue/10 border border-ai-blue/20 text-[10px] text-ai-blue font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Middle Row: Skill Gaps */}
              <Card className="border border-white/5 bg-dark-card/20 p-5">
                <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Skill Gap Analysis
                </h4>
                {result.skillGap.length === 0 ? (
                  <p className="text-emerald-400 text-xs flex items-center gap-2 font-semibold">
                    <CheckCircle className="w-4 h-4" /> Perfect Match! No critical skill gaps identified.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <p className="text-gray-450 text-xs leading-relaxed">
                      The candidate is missing or demonstrates weak coverage for the following required skills.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {result.skillGap.map((gap) => (
                        <span key={gap} className="px-2 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400 font-bold">
                          {gap}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Bottom Row: Interview Questions */}
              <Card className="border border-white/5 bg-dark-card/20 p-5">
                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-ai-purple" />
                  AI-Generated Interview Questions
                </h4>
                <div className="flex flex-col gap-3">
                  {result.interviewQuestions.map((q, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-black/40 border border-gray-800/80 hover:border-gray-700/80 transition-all flex gap-3 text-left">
                      <div className="w-5 h-5 rounded-lg bg-ai-purple/10 border border-ai-purple/20 flex items-center justify-center shrink-0 text-[10px] text-ai-purple font-black">
                        {idx + 1}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <p className="text-xs text-gray-300 leading-relaxed font-semibold">{q}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

            </div>
          ) : (
            /* Empty State display */
            <Card className="border border-white/5 bg-dark-card/10 flex-1 flex flex-col items-center justify-center p-12 min-h-[450px] text-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ai-blue to-ai-purple flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-bold text-white mt-4">ATS Analysis Pipeline</h4>
              <p className="text-gray-500 text-xs max-w-sm mt-2 leading-relaxed">
                Upload a candidate's resume (PDF or TXT) and enter the Job Description parameters on the left to activate the matcher pipeline.
              </p>
            </Card>
          )}

        </div>

      </div>

    </div>
  )
}
