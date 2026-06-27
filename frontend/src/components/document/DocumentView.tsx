import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Loader } from '../ui/Loader'
import { Input } from '../ui/Input'
import { 
  FileText, Upload, Trash2, Send, Sparkles, BookOpen, 
  HelpCircle, ChevronDown, ChevronUp, AlertCircle 
} from 'lucide-react'
import axios from 'axios'
import { API_BASE_URL } from '../../config'

interface DocumentViewProps {
  token: string | null
}

interface DocumentInfo {
  id: string
  filename: string
  fileSize: number
  createdAt: string
}

interface QueryResult {
  answer: string
  sources: string[]
}

export const DocumentView: React.FC<DocumentViewProps> = ({ token }) => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([])
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null)
  
  const [uploading, setUploading] = useState(false)
  const [querying, setQuerying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSources, setShowSources] = useState(false)

  // Summarization state
  const [summary, setSummary] = useState<string | null>(null)
  const [loadingSummary, setLoadingSummary] = useState(false)

  const loadDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDocuments(res.data)
      if (res.data.length > 0 && !selectedDocId) {
        setSelectedDocId(res.data[0].id)
      }
    } catch (err) {
      console.error('Error loading documents', err)
    }
  }

  useEffect(() => {
    if (token) {
      loadDocuments()
    }
  }, [token])

  useEffect(() => {
    if (selectedDocId && token) {
      const fetchSummary = async () => {
        setLoadingSummary(true)
        setSummary(null)
        setQueryResult(null)
        setError(null)
        const customKey = localStorage.getItem('geminiApiKey') || ''
        try {
          const res = await axios.get(`${API_BASE_URL}/api/documents/${selectedDocId}/summary`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'X-Gemini-Key': customKey
            }
          })
          setSummary(res.data.summary)
        } catch (err: any) {
          console.error('Error loading summary', err)
          setError(err.response?.data?.error || 'Failed to generate document summary. Make sure your Gemini API key is valid.')
        } finally {
          setLoadingSummary(false)
        }
      }
      fetchSummary()
    }
  }, [selectedDocId, token])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    setUploading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post(`${API_BASE_URL}/api/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      })
      setDocuments([res.data, ...documents])
      setSelectedDocId(res.data.id)
      setQueryResult(null)
    } catch (err: any) {
      console.error('Error uploading document', err)
      const errorMsg = err.response?.data?.error || err.message || 'Upload failed.'
      setError(errorMsg)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation()
    try {
      await axios.delete(`${API_BASE_URL}/api/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const filtered = documents.filter(d => d.id !== docId)
      setDocuments(filtered)
      if (selectedDocId === docId) {
        setSelectedDocId(filtered.length > 0 ? filtered[0].id : null)
        setQueryResult(null)
        setSummary(null)
      }
    } catch (err) {
      console.error('Error deleting document', err)
    }
  }

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim() || querying || !selectedDocId) return

    setQuerying(true)
    setError(null)
    setQueryResult(null)

    const customKey = localStorage.getItem('geminiApiKey') || ''

    try {
      const res = await axios.post(`${API_BASE_URL}/api/documents/${selectedDocId}/query`, { question }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Gemini-Key': customKey
        }
      })
      setQueryResult(res.data)
      setQuestion('')
    } catch (err: any) {
      console.error('Error querying document', err)
      const errorMsg = err.response?.data?.error || err.message || 'Query failed.'
      setError(errorMsg)
    } finally {
      setQuerying(false)
    }
  }

  const renderMarkdown = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let cleanLine = line.trim()
      if (!cleanLine) return <div key={idx} className="h-2" />
      
      if (cleanLine.startsWith('###')) {
        return <h5 key={idx} className="text-xs font-bold text-white mt-3 mb-1.5">{cleanLine.replace('###', '').trim()}</h5>
      }
      if (cleanLine.startsWith('##')) {
        return <h4 key={idx} className="text-sm font-bold text-white mt-4 mb-2">{cleanLine.replace('##', '').trim()}</h4>
      }
      
      const isBullet = cleanLine.startsWith('-') || cleanLine.startsWith('*')
      if (isBullet) {
        cleanLine = cleanLine.substring(1).trim()
      }
      
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g)
      const content = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-extrabold text-white">{part.slice(2, -2)}</strong>
        }
        return part
      })
      
      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-[11px] sm:text-xs text-gray-300 leading-relaxed mb-1.5">
            {content}
          </li>
        )
      }
      
      return (
        <p key={idx} className="text-[11px] sm:text-xs text-gray-300 leading-relaxed mb-2">
          {content}
        </p>
      )
    })
  }

  const selectedDoc = documents.find(d => d.id === selectedDocId)

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 w-full text-left relative overflow-hidden">
      
      {/* Sidebar - Files List */}
      <aside className="w-64 glass-panel border border-white/5 rounded-2xl p-4 flex flex-col justify-between shrink-0 bg-dark-card/20">
        <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
          <h3 className="font-bold text-white text-xs uppercase tracking-wider">Document Library</h3>

          {/* Inline Upload Trigger */}
          <div className="relative border border-dashed border-gray-700/60 rounded-xl hover:border-ai-blue/50 hover:bg-white/2 transition-all p-3 flex flex-col items-center justify-center text-center cursor-pointer min-h-[80px]">
            <input 
              type="file" 
              accept=".pdf,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {uploading ? (
              <Loader type="spinner" size="sm" />
            ) : (
              <>
                <Upload className="w-4 h-4 text-gray-500 mb-1" />
                <span className="text-[10px] text-gray-400 font-bold">Add PDF / TXT file</span>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {documents.map((d) => {
              const isActive = selectedDocId === d.id
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDocId(d.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer border ${
                    isActive 
                      ? 'bg-gradient-to-r from-ai-blue/10 to-ai-purple/10 border-ai-blue/30 text-white font-semibold' 
                      : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                    <FileText className="w-4 h-4 shrink-0 text-gray-500" />
                    <div className="flex flex-col truncate">
                      <span className="text-xs truncate">{d.filename}</span>
                      <span className="text-[9px] text-gray-500">{(d.fileSize / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDeleteDocument(e, d.id)}
                    className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-white/5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </aside>

      {/* Main Panel */}
      <section className="flex-1 glass-panel border border-white/5 rounded-2xl flex flex-col justify-between overflow-hidden bg-dark-card/10">
        
        {/* Workspace Display */}
        <div className="flex-grow flex flex-col min-h-0">
          
          {error && (
            <div className="mx-6 mt-6 p-3 rounded-lg border border-red-500/20 bg-red-950/10 text-xs text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!selectedDoc ? (
            /* Empty Library State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-xl mx-auto gap-4 self-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-ai-blue to-ai-purple flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-bold text-white tracking-tight mt-2">Upload Document to Index</h4>
              <p className="text-gray-400 text-sm leading-relaxed">
                Add PDF files or TXT guidelines to the Document library. Our RAG engine will split, index, and query candidate vectors locally.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              
              {/* Header Info */}
              <div className="mx-6 pt-5 pb-3 border-b border-gray-800/60 flex-shrink-0">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Active Document Reference</span>
                <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mt-1">
                  <FileText className="w-4 h-4 text-ai-blue" />
                  {selectedDoc.filename}
                </h4>
              </div>

              {/* Two-Column split screen */}
              <div className="flex-1 flex gap-6 p-6 min-h-0 overflow-hidden">
                
                {/* Left Column - Summary (55% width) */}
                <div className="flex-[1.3] flex flex-col min-h-0 bg-dark-card/20 border border-white/5 rounded-xl p-5 overflow-y-auto">
                  <div className="text-[10px] font-bold text-ai-blue uppercase tracking-wider mb-3 flex items-center gap-1.5 sticky top-0 bg-dark-card/25 backdrop-blur-sm py-1">
                    <Sparkles className="w-3.5 h-3.5 text-ai-blue" /> Document Summary & Key Insights
                  </div>
                  
                  {loadingSummary ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
                      <Loader type="glow-pulse" size="sm" />
                      <span className="text-[10px] text-gray-400 font-bold mt-2">Reading chunks and generating summary...</span>
                    </div>
                  ) : summary ? (
                    <div className="space-y-1 pr-1 select-text">
                      {renderMarkdown(summary)}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-550 italic py-8">Summary generation failed or not started.</div>
                  )}
                </div>

                {/* Right Column - Q&A Chat (45% width) */}
                <div className="flex-1 flex flex-col min-h-0 bg-black/10 border border-white/5 rounded-xl p-4">
                  
                  {/* Answers scroll area */}
                  <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
                    {querying ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12">
                        <Loader type="spinner" size="md" />
                        <h4 className="text-xs font-bold text-white tracking-tight mt-3">Searching indexed vectors</h4>
                        <p className="text-gray-550 text-[10px] text-center max-w-xs leading-relaxed">
                          TF-IDF search is matching term frequencies and querying Gemini.
                        </p>
                      </div>
                    ) : queryResult ? (
                      <div className="flex flex-col gap-4">
                        {/* Answer Card */}
                        <div className="border border-white/5 bg-black/30 p-4 rounded-xl">
                          <div className="text-[10px] font-bold text-gray-450 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-ai-purple" /> AI Response
                          </div>
                          <p className="text-[11px] sm:text-xs text-gray-200 leading-relaxed whitespace-pre-wrap select-text">
                            {queryResult.answer}
                          </p>
                        </div>

                        {/* Sources Accordion */}
                        <div className="border border-gray-800/80 rounded-xl overflow-hidden bg-black/20">
                          <button
                            onClick={() => setShowSources(!showSources)}
                            className="w-full flex items-center justify-between px-3 py-2 bg-gray-900/60 text-[10px] font-bold text-gray-400 hover:text-white cursor-pointer transition-colors"
                            type="button"
                          >
                            <span className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-ai-purple" />
                              Retrieved Context ({queryResult.sources.length} chunks)
                            </span>
                            {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          
                          {showSources && (
                            <div className="p-2.5 flex flex-col gap-2 max-h-40 overflow-y-auto border-t border-gray-800/80">
                              {queryResult.sources.map((src, idx) => (
                                <div key={idx} className="p-2 bg-black/40 rounded-lg border border-gray-800/50 text-[9px] text-gray-400 leading-relaxed font-mono select-text">
                                  <div className="text-[8px] font-bold text-ai-purple mb-0.5 uppercase tracking-wider">Source Chunk #{idx + 1}</div>
                                  {src}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
                        <HelpCircle className="w-8 h-8 text-gray-650" />
                        <h4 className="text-xs font-bold text-white tracking-tight">Ask Document Questions</h4>
                        <p className="text-gray-500 text-[10px] leading-relaxed max-w-xs">
                          The document content has been split and indexed. Write a question below to query its context semantically.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Query Input Bar */}
                  <div className="pt-3 mt-3 border-t border-white/5 flex-shrink-0">
                    <form onSubmit={handleQuery} className="flex gap-2">
                      <Input
                        placeholder="Ask a question..."
                        disabled={querying}
                        className="py-2 px-3 text-xs bg-black/40 border-gray-800"
                        value={question}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
                      />
                      <Button 
                        type="submit" 
                        variant="primary" 
                        disabled={querying || !question.trim()} 
                        className="px-4 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </Button>
                    </form>
                  </div>

                </div>

              </div>

            </div>
          )}
        </div>

      </section>

    </div>
  )
}
