import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import Sidebar from '../components/Sidebar'
import { MessageCircle, Send, Sparkles, FileText, Search, Download, Trash2, RotateCcw } from 'lucide-react'

function ChatbotAssistant() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // Sample quick actions
  const quickActions = [
    'Show me all finance reports',
    'What are the compliance deadlines this month?',
    'Find reports by domain: Healthcare',
    'Show weekly reports',
    'Search for cash flow reports'
  ]

  // Initial welcome message
  useEffect(() => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: `Hello ${user?.firstName || 'there'}! 👋 I'm your AI assistant. I can help you search through 500 reports across 13 domains, answer questions about compliance, and provide insights. How can I help you today?`,
        timestamp: new Date().toISOString()
      }
    ])
  }, [user])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle send message
  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() && !messageText) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)

    // Simulate AI response - replace with actual Claude API call
    setTimeout(() => {
      const responses = {
        'show me all finance reports': {
          type: 'assistant',
          content: `I found 13 finance reports for you:\n\n1. Cash Flow Report (Daily)\n2. Balance Sheet (Monthly)\n3. P&L Statement (Monthly)\n4. Budget Variance Report (Weekly)\n5. Tax Compliance Report (Quarterly)\n\nWould you like me to show you details for any specific report?`,
          reports: [
            { id: 1, name: 'Cash Flow Report', domain: 'Finance', frequency: 'Daily' },
            { id: 2, name: 'Balance Sheet', domain: 'Finance', frequency: 'Monthly' }
          ]
        },
        default: {
          type: 'assistant',
          content: `I understand you're looking for information about "${messageText}". Let me search through our 500 reports across 13 domains.\n\nBased on your query, here are some relevant reports:\n\n• Cash Flow Report - Tracks daily inflows and outflows\n• Budget Report - Monthly budget analysis\n• Compliance Dashboard - Real-time compliance status\n\nWould you like more details about any of these reports?`
        }
      }

      const responseKey = messageText.toLowerCase()
      const response = responses[responseKey] || responses.default

      const aiMessage = {
        id: messages.length + 2,
        type: response.type,
        content: response.content,
        reports: response.reports,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
      setLoading(false)
    }, 1500)
  }

  // Handle quick action click
  const handleQuickAction = (action) => {
    handleSendMessage(action)
  }

  // Clear chat
  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: `Chat cleared! How can I help you today?`,
        timestamp: new Date().toISOString()
      }
    ])
  }

  // Export chat
  const exportChat = () => {
    const chatText = messages.map(m => 
      `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.type === 'user' ? 'You' : 'AI'}: ${m.content}`
    ).join('\n\n')
    
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-${new Date().toISOString()}.txt`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-blue-500" />
                AI Chatbot Assistant
              </h1>
              <p className="text-gray-400">Ask questions about your 500 reports across 13 domains</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportChat}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={clearChat}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>

          {/* Chat Container */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Chat Area */}
            <div className="lg:col-span-3">
              <div className="bg-gray-800 rounded-lg border border-gray-700 flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-700 text-gray-100'
                        }`}
                      >
                        {/* Message Content */}
                        <div className="whitespace-pre-wrap">{message.content}</div>

                        {/* Report Cards (if any) */}
                        {message.reports && (
                          <div className="mt-4 space-y-2">
                            {message.reports.map((report) => (
                              <div
                                key={report.id}
                                className="bg-gray-800 rounded p-3 border border-gray-600"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{report.name}</div>
                                    <div className="text-sm text-gray-400">
                                      {report.domain} • {report.frequency}
                                    </div>
                                  </div>
                                  <button className="text-blue-400 hover:text-blue-300 text-sm">
                                    View →
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className="text-xs opacity-70 mt-2">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading Indicator */}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-gray-700 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything about your reports..."
                      className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={loading}
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={loading || !inputMessage.trim()}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-blue-500" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action)}
                      className="w-full text-left bg-gray-700 hover:bg-gray-600 text-gray-200 p-3 rounded-lg text-sm transition-colors"
                    >
                      {action}
                    </button>
                  ))}
                </div>

                {/* Stats */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-white font-semibold mb-4">Coverage</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Total Reports</span>
                      <span className="text-white font-semibold">500</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Domains</span>
                      <span className="text-white font-semibold">13</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Messages</span>
                      <span className="text-white font-semibold">{messages.length}</span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="bg-blue-900 bg-opacity-20 border border-blue-700 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400 mt-0.5" />
                      <div className="text-xs text-blue-200">
                        Powered by AI to help you find reports, check compliance, and get insights instantly.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ChatbotAssistant
