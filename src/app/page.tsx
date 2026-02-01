'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, Loader2, Sparkles, BookOpen, Search, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'

interface Document {
  id: string
  name: string
  size: number
  uploadedAt: Date
  status: 'uploading' | 'processing' | 'ready' | 'error'
}

interface QueryAnalysis {
  type: string
  complexity: number
  entities: string[]
  chunksNeeded: number
  confidence: number
}

interface RetrievedChunk {
  id: string
  content: string
  relevance: number
  source: string
}

interface Answer {
  text: string
  chunks?: RetrievedChunk[]
  verification?: {
    claims: number
    verified: number
    accuracy: number
  }
}

export default function DocumentQAPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [analysis, setAnalysis] = useState<QueryAnalysis | null>(null)
  const [answer, setAnswer] = useState<Answer | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    const newDocs: Document[] = fileArray.map(file => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      uploadedAt: new Date(),
      status: 'uploading'
    }))

    setDocuments(prev => [...prev, ...newDocs])

    for (let i = 0; i < newDocs.length; i++) {
      const doc = newDocs[i]
      const formData = new FormData()
      formData.append('file', fileArray[i])

      try {
        setDocuments(prev =>
          prev.map(d =>
            d.id === doc.id ? { ...d, status: 'processing' } : d
          )
        )

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          setDocuments(prev =>
            prev.map(d =>
              d.id === doc.id ? { ...d, status: 'ready' } : d
            )
          )
          toast({
            title: 'Success',
            description: `Document "${fileArray[i].name}" processed successfully`
          })
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        setDocuments(prev =>
          prev.map(d =>
            d.id === doc.id ? { ...d, status: 'error' } : d
          )
        )
        toast({
          title: 'Error',
          description: `Failed to process "${fileArray[i].name}"`,
          variant: 'destructive'
        })
      }
    }
  }

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a question',
        variant: 'destructive'
      })
      return
    }

    const readyDocs = documents.filter(d => d.status === 'ready')
    if (readyDocs.length === 0) {
      toast({
        title: 'Error',
        description: 'Please upload at least one document first',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    setAnalysis(null)
    setAnswer(null)

    try {
      // First, analyze the question
      const analyzeResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      })

      if (!analyzeResponse.ok) throw new Error('Analysis failed')

      const analysisData = await analyzeResponse.json()
      setAnalysis(analysisData)

      // Then, generate the answer with adaptive retrieval
      const answerResponse = await fetch('/api/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          documentIds: readyDocs.map(d => d.id),
          analysis: analysisData
        })
      })

      if (!answerResponse.ok) throw new Error('Answer generation failed')

      const answerData = await answerResponse.json()
      setAnswer(answerData)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process your question',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1048576).toFixed(1) + ' MB'
  }

  const getQueryTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'factual': return 'bg-blue-500 hover:bg-blue-600'
      case 'comparative': return 'bg-purple-500 hover:bg-purple-600'
      case 'analytical': return 'bg-orange-500 hover:bg-orange-600'
      case 'aggregative': return 'bg-green-500 hover:bg-green-600'
      case 'yes/no': return 'bg-cyan-500 hover:bg-cyan-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const getComplexityColor = (score: number) => {
    if (score <= 3) return 'text-green-600'
    if (score <= 7) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Context Flow</h1>
              <p className="text-sm text-muted-foreground">Adaptive Intelligence with AI-Powered Retrieval</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Document Upload */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Documents
                </CardTitle>
                <CardDescription>
                  Upload PDFs to enable intelligent Q&A
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Drag and drop files here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF documents
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                  />
                </div>

                {/* Document List */}
                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <ScrollArea className="h-64">
                      <div className="space-y-2 pr-4">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                          >
                            {doc.status === 'uploading' && (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            )}
                            {doc.status === 'processing' && (
                              <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                            )}
                            {doc.status === 'ready' && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                            {doc.status === 'error' && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(doc.size)}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {doc.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Query Analysis Preview */}
            {analysis && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4" />
                    Smart Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Query Type:</span>
                    <Badge className={getQueryTypeColor(analysis.type)}>
                      {analysis.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Complexity:</span>
                    <span className={`font-semibold ${getComplexityColor(analysis.complexity)}`}>
                      {analysis.complexity}/10
                    </span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Entities Detected:</span>
                    <div className="flex flex-wrap gap-1">
                      {analysis.entities.map((entity, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {entity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Chunks Retrieving:</span>
                    <span className="font-semibold text-primary">{analysis.chunksNeeded}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Confidence:</span>
                    <Progress value={analysis.confidence} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column: Q&A Interface */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Ask Your Question
                </CardTitle>
                <CardDescription>
                  Our adaptive intelligence will analyze your question and retrieve the optimal amount of information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Ask a question about your documents... (e.g., 'What are the main benefits of using TypeScript in web development?')"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAskQuestion()
                    }
                  }}
                  rows={4}
                  className="resize-none"
                />
                <Button
                  onClick={handleAskQuestion}
                  disabled={isLoading || documents.filter(d => d.status === 'ready').length === 0}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get Answer
                    </>
                  )}
                </Button>

                {isLoading && (
                  <div className="space-y-3">
                    <Alert>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <AlertDescription className="text-sm">
                        {analysis
                          ? `Retrieving ${analysis.chunksNeeded} chunks and generating answer...`
                          : 'Analyzing your question...'
                        }
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Answer Display */}
                {answer && !isLoading && (
                  <div className="space-y-4">
                    <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <AlertDescription className="text-sm text-green-900 dark:text-green-100">
                        Answer generated using document content
                      </AlertDescription>
                    </Alert>

                    <div className="rounded-lg border bg-card p-6 space-y-4">
                      <h3 className="font-semibold text-lg">Answer</h3>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          {answer.text}
                        </p>
                      </div>

                      {/* Verification Stats */}
                      {answer.verification && (
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Verification Results
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-primary">{answer.verification.claims}</div>
                              <div className="text-xs text-muted-foreground">Claims</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">{answer.verification.verified}</div>
                              <div className="text-xs text-muted-foreground">Verified</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="text-2xl font-bold text-green-600">{answer.verification.accuracy}%</div>
                              <div className="text-xs text-muted-foreground">Accuracy</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Retrieved Chunks */}
                      {answer.chunks && answer.chunks.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="font-medium text-sm mb-3">
                            Source Documents ({answer.chunks.length} chunks retrieved)
                          </h4>
                          <ScrollArea className="h-64">
                            <div className="space-y-3 pr-4">
                              {answer.chunks.map((chunk, i) => (
                                <div
                                  key={chunk.id}
                                  className="p-4 rounded-lg bg-muted/50 border border-border/50"
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      Chunk {i + 1}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {(chunk.relevance * 100).toFixed(0)}% relevant
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-3">
                                    {chunk.content}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    Source: {chunk.source}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <p className="font-medium">Upload Documents</p>
                    <p className="text-muted-foreground">Upload PDF documents that will be processed and indexed for intelligent search</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <p className="font-medium">Smart Question Analysis</p>
                    <p className="text-muted-foreground">Our system analyzes your question type, complexity, and entities to understand what you need</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <p className="font-medium">Adaptive Retrieval</p>
                    <p className="text-muted-foreground">Automatically retrieves 2-15 chunks based on your question's needs - not a fixed amount</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <p className="font-medium">Verified Answers</p>
                    <p className="text-muted-foreground">AI generates accurate, well-cited answers with full verification of all claims</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}