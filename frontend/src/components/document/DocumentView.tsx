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
                  onClick={() => {
                    setSelectedDocId(d.id)
                    setQueryResult(null)
                    setError(null)
                  }}
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
        <div className="flex-1 overflow-y-auto p-6 flex flex-col">
          {error && (
            <div className="p-3 rounded-lg border border-red-500/20 bg-red-950/10 text-xs text-red-400 flex items-center gap-2 mb-4">
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
            <div className="flex flex-col gap-5 flex-1">
              
              {/* Header Info */}
              <div className="border-b border-gray-800/60 pb-4">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Active Document Reference</span>
                <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2 mt-1">
                  <FileText className="w-4.5 h-4.5 text-ai-blue" />
                  {selectedDoc.filename}
                </h4>
              </div>

              {querying ? (
                /* Query Loading state */
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <Loader type="glow-pulse" size="md" />
                  <h4 className="text-sm font-bold text-white tracking-tight mt-3">Searching indexed vectors</h4>
                  <p className="text-gray-550 text-xs text-center max-w-xs leading-relaxed">
                    Local TF-IDF engine is matching term frequencies, isolating cosine chunks, and fetching Gemini responses.
                  </p>
                </div>
              ) : queryResult ? (
                /* Answer Display Screen */
                <div className="flex flex-col gap-5 text-left">
                  
                  {/* Answer card */}
                  <Card className="border border-white/5 bg-dark-card/30 p-5">
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-ai-blue" /> AI Analysis Answer
                    </div>
                    <p className="text-xs sm:text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {queryResult.answer}
                    </p>
                  </Card>

                  {/* Sources Accordion */}
                  <div className="border border-gray-800/80 rounded-xl overflow-hidden bg-black/20">
                    <button
                      onClick={() => setShowSources(!showSources)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-900/60 text-xs font-bold text-gray-400 hover:text-white cursor-pointer transition-colors"
                      type="button"
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-ai-purple" />
                        Retrieved Context Sources ({queryResult.sources.length} chunks)
                      </span>
                      {showSources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {showSources && (
                      <div className="p-4 flex flex-col gap-3 border-t border-gray-800/80">
                        {queryResult.sources.map((src, idx) => (
                          <div key={idx} className="p-3 bg-black/40 rounded-lg border border-gray-800/50 text-[11px] text-gray-400 leading-relaxed font-mono">
                            <div className="text-[9px] font-bold text-ai-purple mb-1 uppercase tracking-wider">Source Chunk #{idx + 1}</div>
                            {src}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ) : (
                /* Initial State / Prompt helper */
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto gap-3 self-center">
                  <HelpCircle className="w-10 h-10 text-gray-650" />
                  <h4 className="text-sm font-bold text-white tracking-tight">Ask Document Questions</h4>
                  <p className="text-gray-550 text-xs leading-relaxed">
                    The document content has been split and indexed. Write a question below to query its context semantically.
                  </p>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer Query Bar */}
        {selectedDoc && (
          <div className="p-4 border-t border-white/5 bg-dark-card/20">
            <form onSubmit={handleQuery} className="flex gap-3">
              <Input
                placeholder="Ask a question about this document..."
                disabled={querying}
                className="py-3 bg-black/40 border-gray-800"
                value={question}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuestion(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="primary" 
                disabled={querying || !question.trim()} 
                className="px-5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        )}

      </section>

    </div>
  )
}
