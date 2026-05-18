import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import Sidebar from '../components/Sidebar'
import { REPORTS_DATA, DOMAINS } from '../data/reportsData'
import {
  Send, Sparkles, FileText, Download, Trash2, Bot,
  Brain, BarChart3, ChevronRight, Zap, Filter,
  CheckCircle, AlertTriangle, RefreshCw, TrendingUp,
  Shield, Users, DollarSign, Activity, Clock, Search,
  MessageSquare, Info, Star, Database, Layers, Eye
} from 'lucide-react'
import './ChatbotAssistant.css'

// ─────────────────────────────────────────────────────────────
// DOMAIN KNOWLEDGE — baked into system prompt
// ─────────────────────────────────────────────────────────────

const DOMAIN_COLORS = {
  'Finance':        '#14b8a6',
  'Tax':            '#6366f1',
  'Operations':     '#f59e0b',
  'Audit':          '#ef4444',
  'Risk':           '#fb7185',
  'Treasury':       '#22d3ee',
  'HR':             '#10b981',
  'Legal':          '#a855f7',
  'IT':             '#3b82f6',
  'Sales':          '#8b5cf6',
  'Healthcare':     '#06b6d4',
  'Telecom':        '#f97316',
  'Retail':         '#84cc16',
  'Manufacturing':  '#eab308',
  'Energy':         '#ec4899',
  'Banking':        '#14b8a6',
  'Education':      '#8b5cf6',
  'General':        '#94a3b8',
}

const DOMAIN_ICONS = {
  'Finance': DollarSign, 'Tax': Shield, 'Operations': Activity,
  'Audit': CheckCircle, 'Risk': AlertTriangle, 'Treasury': TrendingUp,
  'HR': Users, 'Legal': Shield, 'IT': Database, 'Sales': BarChart3,
  default: FileText
}

const DOMAIN_META = {
  Finance:      { count: 125, description: 'P&L, Balance Sheet, Cash Flow, Budget vs Actual, Revenue, AR/AP Aging, Invoice reports' },
  Tax:          { count: 87,  description: 'GST, Corporate Tax, VAT, Transfer Pricing, Withholding Tax, Tax Liability reports' },
  Operations:   { count: 64,  description: 'Inventory, Order Fulfillment, Process Efficiency, SLA, Capacity Planning reports' },
  Audit:        { count: 52,  description: 'Internal Audit, Control Testing, Risk Assessment, Audit Findings, Coverage reports' },
  Risk:         { count: 41,  description: 'Enterprise Risk, Credit Risk, Operational Risk, Cyber Risk, Risk Register reports' },
  Treasury:     { count: 35,  description: 'Cash Position, FX Exposure, Liquidity, Investment Portfolio, Hedging reports' },
  HR:           { count: 28,  description: 'Workforce Analytics, Payroll, Attrition, Performance, Leave, Compensation reports' },
  Legal:        { count: 23,  description: 'Contract Management, Litigation, Regulatory Compliance, Legal Entity reports' },
  IT:           { count: 19,  description: 'Infrastructure Health, Security Posture, Project Portfolio, IT SLA, Incident reports' },
  Sales:        { count: 15,  description: 'Pipeline, Revenue Forecast, CAC, LTV, Campaign Performance, Win/Loss reports' },
  'Supply Chain':{ count: 8,  description: 'Procurement Analytics, Vendor Performance, Logistics, Supply Chain KPI reports' },
  ESG:          { count: 3,   description: 'Sustainability Metrics, Carbon Footprint, ESG Score, Social Impact reports' },
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const DOMAIN_ID_MAP = {
  1:'Finance', 2:'HR', 3:'Operations', 4:'Sales', 5:'IT',
  6:'Healthcare', 7:'Telecom', 8:'Retail', 9:'Energy',
  10:'Manufacturing', 11:'Banking', 12:'Education', 13:'General'
}

const getDomainName = (r) =>
  r.domain || (r.domain_id ? DOMAIN_ID_MAP[r.domain_id] : 'Other') || 'Other'

const getDomainColor = (domain) => DOMAIN_COLORS[domain] || '#94a3b8'

const getReportName = (r) => r.name || r.report_name || 'Unnamed Report'

const getComplianceStatus = (r) => r.compliance_status || r.complianceStatus || ''

// Filter REPORTS_DATA by Claude-returned filters
const filterReports = (filters = {}) => {
  let result = REPORTS_DATA.map(r => ({ ...r, _domain: getDomainName(r) }))

  if (filters.domain) {
    const d = filters.domain.toLowerCase()
    result = result.filter(r => r._domain.toLowerCase().includes(d))
  }
  if (filters.frequency) {
    const f = filters.frequency.toLowerCase()
    result = result.filter(r => r.frequency?.toLowerCase().includes(f))
  }
  if (filters.compliance) {
    const c = filters.compliance.toLowerCase()
    result = result.filter(r => getComplianceStatus(r).toLowerCase().includes(c))
  }
  if (filters.keyword) {
    const k = filters.keyword.toLowerCase()
    result = result.filter(r =>
      getReportName(r).toLowerCase().includes(k) ||
      (r.description || '').toLowerCase().includes(k)
    )
  }
  return result
}

// ─────────────────────────────────────────────────────────────
// SYSTEM PROMPT — all app knowledge baked in
// ─────────────────────────────────────────────────────────────

const buildSystemPrompt = () => {
  const domainSummary = Object.entries(DOMAIN_META)
    .map(([name, meta]) => `  - ${name} (${meta.count} reports): ${meta.description}`)
    .join('\n')

  const allDomainNames = Object.keys(DOMAIN_META).join(', ')
  const totalReports   = Object.values(DOMAIN_META).reduce((s, m) => s + m.count, 0)

  return `You are an expert AI assistant embedded inside the Enterprise Finance Solution Suite — an enterprise-grade multi-tenant SaaS platform for financial reporting, analytics, and compliance.

═══════════════════════════════════════════
PLATFORM KNOWLEDGE
═══════════════════════════════════════════

TOTAL: ${totalReports} pre-built compliance reports across 13 business domains.

13 DOMAINS:
${domainSummary}

REPORT FREQUENCIES: Daily, Weekly, Monthly, Quarterly, Annual, Ad-hoc
COMPLIANCE STATUS: Required (~68% of reports), Optional (~32%)

PLATFORM PAGES & FEATURES:
1. Dashboard — Main hub with KPI tiles, domain cards (13), advanced filters (8 types),
   compliance calendar, real-time updates (5s polling), report CRUD, Export (CSV/Excel/PDF)
2. Analytics — 36 domain dashboards with Pie, Bar, Line, Doughnut charts; time period filter;
   animation toggle; scale slider (70–130%); trend analysis (6–24 months)
3. Predictive AI Analytics — 5 tabs: AI Overview (8 KPI health scores), Forecasting (revenue +
   demand with confidence intervals), Churn Prediction (852 customers scored), Anomaly Detection
   (live feed), AI Recommendations (priority ranked)
4. AI Insights — Anomaly detection, AI forecasting, smart recommendations with confidence scoring
5. AI Chatbot Assistant — This assistant! Natural language querying of all reports and features
6. Compliance Calendar — Deadline tracking with domain-specific compliance dates
7. Multi-Tenant Management — Tenant isolation, role-based access, organization management
8. Customer Management — Customer profiles, segments, account management
9. Personalization — Layout options, theme (dark/light), favorites, notifications
10. Collaboration — Shared dashboards, threaded comments, team management, @mentions
11. Reviews & Ratings — 5-star ratings, review breakdown, helpful voting
12. Module Manager — Install/uninstall modules, marketplace, dependency tracking
13. Accessibility — WCAG 2.1 Level AA settings, font size, high contrast, keyboard nav

TECH STACK (for technical queries):
- Frontend: React 18 + Vite + Tailwind CSS (port 3001)
- Backend: Node.js + Express + TypeScript (port 3000) — 570+ REST endpoints
- Database: PostgreSQL — 127 tables, 33 modules, 190+ indexes
- Auth: JWT (access + refresh tokens), multi-tenant row-level security
- Real-time: WebSocket + polling fallback, 5-second intervals
- Charts: recharts + Chart.js

═══════════════════════════════════════════
RESPONSE FORMAT — STRICT JSON ONLY
═══════════════════════════════════════════

Always reply with valid JSON exactly matching this structure. No text outside the JSON:

{
  "message": "Your clear, helpful response text. Use markdown-style formatting with \\n for line breaks.",
  "type": "text | reports | domain_info | analytics | features",
  "filters": {
    "domain": "Exact domain name from the 13 domains, or null",
    "frequency": "Daily | Weekly | Monthly | Quarterly | Annual | Ad-hoc, or null",
    "compliance": "Required | Optional, or null",
    "keyword": "search keyword, or null"
  },
  "domainInfo": null,
  "suggestions": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]
}

TYPE RULES:
- "reports": Use when user wants to SEE, SHOW, LIST, FIND, GET, SEARCH reports
- "domain_info": Use when asking about a specific domain (what it covers, how many reports)
- "analytics": Use when asking about dashboards, charts, KPIs, metrics, trends
- "features": Use when asking about platform capabilities, pages, features
- "text": Use for all other questions, greetings, explanations

FILTER RULES:
- Set domain when user mentions any domain name or synonym (e.g. "payroll" → domain: "HR")
- Set frequency when user mentions daily/weekly/monthly/quarterly/annual/ad-hoc
- Set compliance when user says "required" or "mandatory" or "optional"
- Set keyword for specific report name searches
- Leave null when not applicable

SYNONYM MAPPING (use these to set domain):
- "financial", "finance", "revenue", "cash flow", "balance sheet", "p&l", "profit" → Finance
- "tax", "gst", "vat", "corporate tax", "taxation" → Tax
- "operations", "operational", "inventory", "order", "fulfillment" → Operations
- "audit", "internal audit", "control", "findings" → Audit
- "risk", "credit risk", "cyber risk", "risk register" → Risk
- "treasury", "cash position", "fx", "liquidity", "forex" → Treasury
- "hr", "human resource", "payroll", "workforce", "attrition", "employee", "leave" → HR
- "legal", "contract", "litigation", "regulatory" → Legal
- "it", "infrastructure", "security", "tech", "technology", "system" → IT
- "sales", "marketing", "pipeline", "cac", "campaign", "revenue forecast" → Sales
- "supply chain", "procurement", "vendor", "logistics" → Supply Chain
- "esg", "sustainability", "carbon", "environment", "green" → ESG

BEHAVIOR:
- Always be helpful, specific, and data-driven
- When showing reports, explain what filters you applied
- Offer actionable suggestions
- If asked "all reports" with no filter, set type: "reports" with all filters null (shows all 500)
- Always provide 3 relevant suggestions
- If asked about a feature, describe it accurately based on the platform knowledge above`
}

// ─────────────────────────────────────────────────────────────
// RULE-BASED FALLBACK (when no API key)
// ─────────────────────────────────────────────────────────────

const ruleBasedResponse = (message) => {
  const lower = message.toLowerCase()
  const filters = { domain: null, frequency: null, compliance: null, keyword: null }
  let type = 'text'
  let responseMessage = ''

  // Domain matching
  const domainMap = [
    [['finance','financial','revenue','cash flow','balance sheet','p&l','profit','invoice','ar ','ap ','payable','receivable'], 'Finance'],
    [['tax','gst','vat','taxation','corporate tax'], 'Tax'],
    [['operations','operational','inventory','order','fulfillment','sla'], 'Operations'],
    [['audit','internal audit','control','findings','coverage'], 'Audit'],
    [['risk','credit risk','cyber risk','risk register'], 'Risk'],
    [['treasury','cash position','fx ','liquidity','forex','hedging'], 'Treasury'],
    [['hr ','human resource','payroll','workforce','attrition','employee','leave','compensation'], 'HR'],
    [['legal','contract','litigation','regulatory compliance'], 'Legal'],
    [['it ','infrastructure','security posture','tech report','system health'], 'IT'],
    [['sales','marketing','pipeline','campaign','cac','ltv','win loss'], 'Sales'],
    [['supply chain','procurement','vendor','logistics'], 'Supply Chain'],
    [['esg','sustainability','carbon','environment'], 'ESG'],
  ]

  for (const [keywords, domain] of domainMap) {
    if (keywords.some(k => lower.includes(k))) {
      filters.domain = domain
      type = 'reports'
      responseMessage = `Here are all **${domain}** reports in the platform.`
      break
    }
  }

  // Frequency matching
  const freqMap = [['daily'], ['weekly'], ['monthly'], ['quarterly'], ['annual','yearly'], ['ad-hoc','adhoc','on demand']]
  const freqNames = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual', 'Ad-hoc']
  freqMap.forEach((keywords, i) => {
    if (keywords.some(k => lower.includes(k))) {
      filters.frequency = freqNames[i]
      type = 'reports'
      if (!responseMessage) responseMessage = `Here are all **${freqNames[i]}** reports across all domains.`
    }
  })

  // Compliance matching
  if (lower.includes('required') || lower.includes('mandatory')) {
    filters.compliance = 'Required'
    type = 'reports'
    if (!responseMessage) responseMessage = 'Here are all **Required** compliance reports.'
  } else if (lower.includes('optional')) {
    filters.compliance = 'Optional'
    type = 'reports'
    if (!responseMessage) responseMessage = 'Here are all **Optional** reports.'
  }

  // Show all
  if ((lower.includes('all report') || lower.includes('show all') || lower.includes('list all') || lower.includes('every report')) && !filters.domain) {
    type = 'reports'
    responseMessage = 'Here are all **500 reports** across all 13 domains.'
  }

  // Domain info
  if (lower.includes('how many') || lower.includes('domain') || lower.includes('about finance') || lower.includes('what is')) {
    type = 'domain_info'
    responseMessage = `The platform has 13 business domains covering 500 reports total. Each domain has dedicated dashboards and compliance tracking.`
  }

  // Feature questions
  if (lower.includes('feature') || lower.includes('page') || lower.includes('dashboard') || lower.includes('analytics') || lower.includes('what can')) {
    type = 'features'
    responseMessage = `The Enterprise Finance Solution Suite has 13 feature pages:\n\n📊 Dashboard — Main hub with KPI tiles, 13 domain cards, and real-time updates\n📈 Analytics — 36 domain dashboards with interactive charts\n🧠 Predictive AI — Forecasting, churn prediction, anomaly detection\n🤖 AI Insights — AI-powered anomalies and recommendations\n💬 AI Chatbot — That's me! Natural language report search\n📅 Compliance Calendar — Deadline tracking\n🏢 Multi-Tenant — Organization management\n👥 Customers — Customer account management\n⚙️ Personalization — Theme, layout, favorites\n🤝 Collaboration — Team sharing and comments\n⭐ Reviews & Ratings — Report feedback system\n📦 Module Manager — Install/manage modules\n♿ Accessibility — WCAG 2.1 settings`
    return { message: responseMessage, type, filters: {}, suggestions: ['Show me Finance reports', 'What compliance reports are required?', 'How many reports are in HR domain?'] }
  }

  // Default
  if (!responseMessage) {
    responseMessage = `I can help you search through **500 reports** across **13 domains**. Try asking:\n\n• "Show me all Finance reports"\n• "List all required compliance reports"\n• "Find monthly HR reports"\n• "What reports are in the Risk domain?"\n\n_Note: Connect an Anthropic API key for full AI capabilities._`
  }

  const suggestions = filters.domain
    ? [`Show ${filters.domain} required reports`, `Show ${filters.domain} monthly reports`, `How many ${filters.domain} reports are there?`]
    : ['Show me Finance reports', 'List required compliance reports', 'Find monthly reports']

  return { message: responseMessage, type, filters, suggestions }
}

// ─────────────────────────────────────────────────────────────
// QUICK ACTIONS
// ─────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: 'All Finance reports',         query: 'Show me all Finance reports'                         },
  { label: 'Required compliance reports', query: 'Show all required compliance reports'                },
  { label: 'Monthly reports',             query: 'List all monthly reports'                            },
  { label: 'HR & Payroll reports',        query: 'Show all HR and payroll reports'                     },
  { label: 'Risk reports',               query: 'Find all risk management reports'                    },
  { label: 'All 500 reports',            query: 'Show me all reports'                                 },
  { label: 'Tax compliance',             query: 'Show all tax compliance reports'                     },
  { label: 'Platform features',          query: 'What features does this platform have?'              },
  { label: 'Daily reports',              query: 'Show all daily reports'                              },
  { label: 'ESG & Sustainability',       query: 'Show ESG and sustainability reports'                 },
]

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

function ChatbotAssistant() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [messages,           setMessages]           = useState([])
  const [conversationHistory,setConversationHistory] = useState([])
  const [inputMessage,       setInputMessage]       = useState('')
  const [loading,            setLoading]            = useState(false)
  const [hasApiKey,          setHasApiKey]          = useState(false)

  const messagesEndRef   = useRef(null)
  const inputRef         = useRef(null)
  const systemPromptRef  = useRef('')

  // Initialise
  useEffect(() => {
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY
    setHasApiKey(!!key && key.length > 10)
    systemPromptRef.current = buildSystemPrompt()

    setMessages([{
      id: 1,
      role: 'assistant',
      content: `Hello ${user?.firstName || 'there'}! 👋 I'm your **AI Assistant** for the Enterprise Finance Solution Suite.\n\nI have full knowledge of all **500 reports** across **13 domains**, every platform feature, dashboard, and analytics capability.\n\nAsk me anything — I can show you reports, explain features, or answer compliance questions.`,
      type: 'text',
      reports: [],
      suggestions: ['Show me all Finance reports', 'What are the required compliance reports?', 'Tell me about the platform features'],
      timestamp: new Date().toISOString(),
    }])
  }, [user])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Call Claude API ──────────────────────────────────────────
  const callClaudeAPI = useCallback(async (userMessage, history) => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!apiKey) throw new Error('NO_API_KEY')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPromptRef.current,
        messages: [
          ...history,
          { role: 'user', content: userMessage }
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err?.error?.message || `API error ${response.status}`)
    }

    const data = await response.json()
    const rawText = data.content?.[0]?.text || '{}'

    // Strip markdown fences if present
    const clean = rawText.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  }, [])

  // ── Main send handler ────────────────────────────────────────
  const handleSendMessage = useCallback(async (text = inputMessage) => {
    const msg = (text || '').trim()
    if (!msg || loading) return

    setInputMessage('')
    setLoading(true)

    // Add user message to UI
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: msg,
      type: 'text',
      reports: [],
      suggestions: [],
      timestamp: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMsg])

    try {
      let parsed
      try {
        // Try Claude API first
        parsed = await callClaudeAPI(msg, conversationHistory)
      } catch (e) {
        if (e.message === 'NO_API_KEY') {
          // Use rule-based fallback
          parsed = ruleBasedResponse(msg)
        } else {
          throw e
        }
      }

      // Apply filters to REPORTS_DATA
      const matchedReports = (parsed.type === 'reports' && parsed.filters)
        ? filterReports(parsed.filters)
        : []

      // Build assistant message
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: parsed.message || 'Here is what I found.',
        type: parsed.type || 'text',
        filters: parsed.filters || {},
        reports: matchedReports,
        suggestions: parsed.suggestions || [],
        timestamp: new Date().toISOString(),
      }

      setMessages(prev => [...prev, assistantMsg])

      // Update conversation history for Claude (keep last 10 turns)
      setConversationHistory(prev => {
        const updated = [
          ...prev,
          { role: 'user',      content: msg },
          { role: 'assistant', content: JSON.stringify(parsed) },
        ]
        return updated.slice(-20) // keep last 10 exchanges
      })

    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Sorry, I encountered an error: **${err.message}**\n\nPlease check your API key or try again.`,
        type: 'text',
        reports: [],
        suggestions: ['Show me Finance reports', 'List all domains', 'Show required reports'],
        timestamp: new Date().toISOString(),
      }])
    }

    setLoading(false)
    inputRef.current?.focus()
  }, [inputMessage, loading, conversationHistory, callClaudeAPI])

  // ── Clear chat ───────────────────────────────────────────────
  const clearChat = () => {
    setConversationHistory([])
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: 'Chat cleared! How can I help you with the Finance Solution Suite today?',
      type: 'text',
      reports: [],
      suggestions: ['Show me all Finance reports', 'List required compliance reports', 'What features are available?'],
      timestamp: new Date().toISOString(),
    }])
  }

  // ── Export chat ──────────────────────────────────────────────
  const exportChat = () => {
    const text = messages.map(m =>
      `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role === 'user' ? 'You' : 'AI Assistant'}: ${m.content}${
        m.reports?.length ? `\n  → Showing ${m.reports.length} reports` : ''
      }`
    ).join('\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `chat-export-${new Date().toISOString().slice(0,10)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────

  const renderFilterBadges = (filters = {}) => {
    const badges = []
    if (filters.domain)     badges.push({ label: filters.domain,     color: getDomainColor(filters.domain) })
    if (filters.frequency)  badges.push({ label: filters.frequency,  color: '#3b82f6' })
    if (filters.compliance) badges.push({ label: filters.compliance, color: filters.compliance === 'Required' ? '#10b981' : '#f59e0b' })
    if (filters.keyword)    badges.push({ label: `"${filters.keyword}"`, color: '#8b5cf6' })
    if (!badges.length) return null
    return (
      <div className="cba-filter-badges">
        <Filter size={11} style={{ color: '#64748b' }} />
        {badges.map((b, i) => (
          <span key={i} className="cba-filter-badge" style={{ background: `${b.color}22`, color: b.color, border: `1px solid ${b.color}40` }}>
            {b.label}
          </span>
        ))}
      </div>
    )
  }

  const renderReportCards = (reports = []) => {
    if (!reports.length) return null
    const display = reports.slice(0, 30) // show max 30 inline
    const total   = reports.length

    return (
      <div className="cba-reports-wrap">
        <div className="cba-reports-header">
          <Database size={13} />
          <span>Showing <strong>{Math.min(30, total)}</strong> of <strong>{total}</strong> reports</span>
          {total > 30 && <span className="cba-reports-more">+{total - 30} more — use Dashboard filters to see all</span>}
        </div>
        <div className="cba-report-cards">
          {display.map((report, i) => {
            const domain = report._domain || getDomainName(report)
            const color  = getDomainColor(domain)
            const Icon   = DOMAIN_ICONS[domain] || FileText
            return (
              <div
                key={report.id || report.report_id || i}
                className="cba-report-card"
                style={{ borderLeft: `3px solid ${color}` }}
                onClick={() => navigate('/dashboard')}
              >
                <div className="cba-report-card-top">
                  <div className="cba-report-icon" style={{ background: `${color}18`, color }}>
                    <Icon size={13} />
                  </div>
                  <div className="cba-report-info">
                    <span className="cba-report-name">{getReportName(report)}</span>
                    <div className="cba-report-meta">
                      <span className="cba-report-domain" style={{ color }}>{domain}</span>
                      {report.frequency && <span className="cba-report-freq">· {report.frequency}</span>}
                      {getComplianceStatus(report) && (
                        <span className={`cba-report-compliance ${getComplianceStatus(report).toLowerCase()}`}>
                          · {getComplianceStatus(report)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronRight size={14} style={{ color: '#475569', flexShrink: 0 }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDomainInfo = () => (
    <div className="cba-domain-grid">
      {Object.entries(DOMAIN_META).map(([name, meta]) => {
        const color = getDomainColor(name)
        const Icon  = DOMAIN_ICONS[name] || FileText
        return (
          <div key={name} className="cba-domain-info-card" style={{ borderLeft: `3px solid ${color}` }}>
            <div className="cba-di-header">
              <div className="cba-di-icon" style={{ background: `${color}18`, color }}>
                <Icon size={13} />
              </div>
              <span className="cba-di-name">{name}</span>
              <span className="cba-di-count" style={{ color }}>{meta.count}</span>
            </div>
            <p className="cba-di-desc">{meta.description}</p>
          </div>
        )
      })}
    </div>
  )

  // Format message text (bold **text**, newlines)
  const formatContent = (text) => {
    if (!text) return ''
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <span key={i}>
          {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      )
    })
  }

  const renderMessage = (msg) => {
    const isUser = msg.role === 'user'

    if (isUser) {
      return (
        <div key={msg.id} className="cba-msg-row user">
          <div className="cba-bubble user">
            <p>{msg.content}</p>
            <span className="cba-timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
          </div>
          <div className="cba-avatar user">
            <span>{user?.firstName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}</span>
          </div>
        </div>
      )
    }

    return (
      <div key={msg.id} className="cba-msg-row assistant">
        <div className="cba-avatar assistant">
          <Brain size={16} />
        </div>
        <div className="cba-bubble assistant">
          {/* Main text */}
          <div className="cba-msg-text">{formatContent(msg.content)}</div>

          {/* Filter badges */}
          {msg.filters && Object.values(msg.filters).some(Boolean) && renderFilterBadges(msg.filters)}

          {/* Report cards */}
          {msg.type === 'reports' && msg.reports?.length > 0 && renderReportCards(msg.reports)}

          {/* Domain info grid */}
          {msg.type === 'domain_info' && renderDomainInfo()}

          {/* No results */}
          {msg.type === 'reports' && msg.reports?.length === 0 && (
            <div className="cba-no-results">
              <Search size={16} />
              <span>No reports matched those filters. Try broadening your search.</span>
            </div>
          )}

          {/* Suggestions */}
          {msg.suggestions?.length > 0 && (
            <div className="cba-suggestions">
              {msg.suggestions.map((s, i) => (
                <button key={i} className="cba-suggestion-chip" onClick={() => handleSendMessage(s)}>
                  <Zap size={10} />{s}
                </button>
              ))}
            </div>
          )}

          <span className="cba-timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  const totalDomainReports = Object.values(DOMAIN_META).reduce((s, m) => s + m.count, 0)

  return (
    <div className="cba-root">
      <Navigation />
      <div className="cba-layout">
        <Sidebar />

        <main className="cba-main">
          {/* Header */}
          <div className="cba-header">
            <div className="cba-header-left">
              <div className="cba-header-icon"><Brain size={22} /></div>
              <div>
                <h1 className="cba-title">AI Chatbot Assistant</h1>
                <p className="cba-subtitle">
                  Full knowledge of {totalDomainReports} reports · 13 domains · All platform features
                  {!hasApiKey && <span className="cba-mode-badge">· Rule-based mode</span>}
                  {hasApiKey  && <span className="cba-mode-badge ai">· Claude AI powered</span>}
                </p>
              </div>
            </div>
            <div className="cba-header-actions">
              <button onClick={exportChat} className="cba-action-btn">
                <Download size={14} /> Export
              </button>
              <button onClick={clearChat} className="cba-action-btn danger">
                <Trash2 size={14} /> Clear
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="cba-body">

            {/* Chat area */}
            <div className="cba-chat-panel">

              {/* API key warning */}
              {!hasApiKey && (
                <div className="cba-api-warning">
                  <Info size={14} />
                  <span>
                    Running in <strong>rule-based mode</strong>. Add <code>VITE_ANTHROPIC_API_KEY</code> to your Render environment variables for full Claude AI responses.
                  </span>
                </div>
              )}

              {/* Messages */}
              <div className="cba-messages">
                {messages.map(renderMessage)}

                {/* Typing indicator */}
                {loading && (
                  <div className="cba-msg-row assistant">
                    <div className="cba-avatar assistant"><Brain size={16} /></div>
                    <div className="cba-bubble assistant">
                      <div className="cba-typing">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="cba-input-area">
                <div className="cba-input-wrap">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    placeholder="Ask me anything — 'Show Finance reports', 'List required reports', 'What features exist?'..."
                    className="cba-input"
                    disabled={loading}
                    autoFocus
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={loading || !inputMessage.trim()}
                    className="cba-send-btn"
                  >
                    <Send size={17} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right sidebar */}
            <div className="cba-sidebar-panel">

              {/* Quick Actions */}
              <div className="cba-sidebar-section">
                <h3 className="cba-sidebar-title"><Zap size={14} /> Quick Actions</h3>
                <div className="cba-quick-list">
                  {QUICK_ACTIONS.map((action, i) => (
                    <button key={i} className="cba-quick-btn" onClick={() => handleSendMessage(action.query)} disabled={loading}>
                      <ChevronRight size={12} />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="cba-sidebar-section">
                <h3 className="cba-sidebar-title"><Database size={14} /> Knowledge Base</h3>
                <div className="cba-stats-list">
                  {[
                    { label: 'Total Reports',   value: totalDomainReports },
                    { label: 'Domains',          value: 13   },
                    { label: 'Platform Pages',   value: 13   },
                    { label: 'API Endpoints',    value: '570+'},
                    { label: 'DB Tables',        value: 127  },
                    { label: 'Chat Messages',    value: messages.length },
                  ].map((s, i) => (
                    <div key={i} className="cba-stat-row">
                      <span className="cba-stat-label">{s.label}</span>
                      <span className="cba-stat-value">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Domain quick links */}
              <div className="cba-sidebar-section">
                <h3 className="cba-sidebar-title"><Layers size={14} /> Domains</h3>
                <div className="cba-domain-links">
                  {Object.entries(DOMAIN_META).map(([name, meta]) => (
                    <button
                      key={name}
                      className="cba-domain-link"
                      onClick={() => handleSendMessage(`Show me all ${name} reports`)}
                      disabled={loading}
                    >
                      <span className="cba-domain-dot" style={{ background: getDomainColor(name) }}></span>
                      <span className="cba-domain-link-name">{name}</span>
                      <span className="cba-domain-link-count">{meta.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI badge */}
              <div className="cba-ai-badge">
                <Sparkles size={14} />
                <div>
                  <div className="cba-ai-badge-title">
                    {hasApiKey ? 'Claude AI Powered' : 'Rule-Based Mode'}
                  </div>
                  <div className="cba-ai-badge-sub">
                    {hasApiKey
                      ? 'Full natural language understanding with multi-turn conversation memory'
                      : 'Add VITE_ANTHROPIC_API_KEY for full AI capabilities'}
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
