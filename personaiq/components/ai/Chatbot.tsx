'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [available, setAvailable] = useState(false)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check chatbot availability on mount
  useEffect(() => {
    async function checkAvailability() {
      try {
        const response = await fetch('/api/ai/chatbot')
        const data = await response.json()
        setAvailable(data.available)
        setSuggestedQuestions(data.suggestedQuestions || [])

        if (data.available) {
          setMessages([{
            role: 'assistant',
            content: "Hi! I'm your AI adoption coach assistant. I'm here to help you with questions about AI tools, best practices, and overcoming challenges. How can I help you today?",
            timestamp: new Date()
          }])
        }
      } catch (error) {
        console.error('Error checking chatbot availability:', error)
      }
    }

    if (isOpen && messages.length === 0) {
      checkAvailability()
    }
  }, [isOpen])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string = input) => {
    if (!text.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text.trim() })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or contact your coach.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question)
  }

  if (!available && isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl w-96 border border-gray-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">AI Coach Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600 mb-4">AI assistant is currently unavailable.</p>
            <p className="text-sm text-gray-500">Please contact your coach for support.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white rounded-full p-4 shadow-2xl hover:bg-blue-700 transition-all hover:scale-110"
          aria-label="Open AI Coach Assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl w-96 h-[600px] flex flex-col border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold">AI Coach Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Suggested Questions (show when no messages) */}
              {messages.length === 1 && suggestedQuestions.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Suggested questions:</p>
                  {suggestedQuestions.slice(0, 3).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="w-full text-left p-2 text-sm bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage()
                }}
                className="flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
              <p className="text-xs text-gray-400 mt-2">
                AI-powered assistant • Your questions are confidential
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
