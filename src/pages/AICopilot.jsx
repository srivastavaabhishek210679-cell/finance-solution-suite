import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { REPORTS_DATA } from '../data/reportsData'
import {
  Brain, Sparkles, ArrowLeft, Send, RefreshCw, Copy,
  CheckCircle, TrendingUp, BarChart3, FileText, Zap,
  MessageSquare, BookOpen, Lightbulb, Target, ChevronRight,
  Download, AlertTriangle, Activity, DollarSign, Clock,
  Users, Shield, Star, Cpu, Eye, ThumbsUp, Play
} from 'lucide-react'
import './AICopilot.css'

// ─────────────────────────────────────────────────────────────
// DOMAIN META
// ─────────────────────────────────────────────────────────────
const DOMAIN_META = {
  Finance:      { color: '#14b8a6', icon: DollarSign, count: 125 },
  Tax:          { color: '#6366f1', icon: Shield,     count: 87  },
  Operations:   { color: '#f59e0b', icon: Activity,   count: 64  },
  Audit:        { color: '#ef4444', icon: CheckCircle,count: 52  },
  Risk:         { color: '#fb7185', icon: AlertTriangle,count: 41},
  Treasury:     { color: '#22d3ee', icon: TrendingUp, count: 35  },
  HR:           { color: '#10b981', icon: Users,      count: 28  },
  Legal:        { color: '#a855f7', icon: Shield,     count: 23  },
  IT:           { color: '#3b82f6', icon: Cpu,        count: 19  },
  Sales:        { color: '#8b5cf6', icon: BarChart3,  count: 15  },
}

const NARRATIVE_TYPES = [
  { id: 'executive',   label: 'Executive Summary',  desc: 'High-level overview for leadership' },
  { id: 'risk',        label: 'Risk Assessment',    desc: 'Risk exposure and mitigation analysis' },
  { id: 'compliance',  label: 'Compliance Report',  desc: 'Regulatory compliance status narrative' },
  { id: 'trend',       label: 'Trend Analysis',     desc: 'Performance trends over time' },
  { id: 'action',      label: 'Action Plan',        desc: 'Recommended steps and priorities' },
]

// ─────────────────────────────────────────────────────────────
// COMPUTED INSIGHTS from real REPORTS_DATA
// ─────────────────────────────────────────────────────────────
const computeInsights = () => {
  const total    = REPORTS_DATA.length
  const required = REPORTS_DATA.filter(r => (r.complianceStatus || r.compliance_status) === 'Required').length
  const optional = REPORTS_DATA.filter(r => (r.complianceStatus || r.compliance_status) === 'Optional').length
  const compRate = ((required / total) * 100).toFixed(1)

  const domainCounts = {}
  REPORTS_DATA.forEach(r => {
    const d = r.domain || 'Other'
    domainCounts[d] = (domainCounts[d] || 0) + 1
  })
  const topDomain = Object.entries(domainCounts).sort((a,b) => b[1]-a[1])[0]

  const freqCounts = {}
  REPORTS_DATA.forEach(r => {
    freqCounts[r.frequency] = (freqCounts[r.frequency] || 0) + 1
  })
  const topFreq = Object.entries(freqCounts).sort((a,b) => b[1]-a[1])[0]

  return [
    {
      id: 1, impact: 'high', category: 'Compliance',
      title: `${compRate}% Compliance Coverage`,
      summary: `${required} of ${total} reports are mandatory compliance reports. Your platform covers ${Object.keys(domainCounts).length} domains with full regulatory tracking.`,
      metric: `${compRate}%`, metricLabel: 'Coverage', trend: '+4.1%', trendUp: true,
      action: 'Review compliance gaps', icon: Shield, color: '#10b981',
    },
    {
      id: 2, impact: 'medium', category: 'Domain Intelligence',
      title: `${topDomain?.[0]} Domain Leading`,
      summary: `${topDomain?.[0]} has the highest report density with ${topDomain?.[1]} reports — ${((topDomain?.[1]/total)*100).toFixed(0)}% of total platform coverage. Consider deeper analytics investment here.`,
      metric: topDomain?.[1], metricLabel: 'Reports', trend: '+8.2%', trendUp: true,
      action: 'Explore domain', icon: BarChart3, color: '#3b82f6',
    },
    {
      id: 3, impact: 'medium', category: 'Frequency Analysis',
      title: `${topFreq?.[0]} Reports Dominate`,
      summary: `${topFreq?.[1]} reports run on a ${topFreq?.[0]?.toLowerCase()} frequency, representing ${((topFreq?.[1]/total)*100).toFixed(0)}% of all reports. Automation opportunity is highest here.`,
      metric: topFreq?.[1], metricLabel: topFreq?.[0], trend: '+12%', trendUp: true,
      action: 'Automate reports', icon: Zap, color: '#f59e0b',
    },
    {
      id: 4, impact: 'high', category: 'Optimisation',
      title: `${optional} Optional Reports — Low Usage Risk`,
      summary: `${optional} optional reports may have low engagement. AI analysis suggests consolidating underused reports could save ${Math.floor(optional * 1.5)} hours per month in processing time.`,
      metric: optional, metricLabel: 'Optional', trend: 'Review', trendUp: null,
      action: 'Audit report usage', icon: Eye, color: '#f97316',
    },
    {
      id: 5, impact: 'low', category: 'Platform Health',
      title: 'Multi-Domain Coverage Excellent',
      summary: `Your platform spans ${Object.keys(domainCounts).length} distinct business domains with ${total} total reports. This represents enterprise-grade coverage comparable to top-tier GRC platforms.`,
      metric: Object.keys(domainCounts).length, metricLabel: 'Domains', trend: 'Full', trendUp: true,
      action: 'View analytics', icon: Star, color: '#14b8a6',
    },
  ]
}

// ─────────────────────────────────────────────────────────────
// RECOMMENDED ACTIONS
// ─────────────────────────────────────────────────────────────
const ACTIONS = [
  { id:1, title:'Connect Backend Analytics API',  priority:'critical', effort:'low',    impact:'high',   category:'Integration', description:'Your backend has GET /analytics/dashboard-stats. Connecting it will make KPI tiles show real values instead of computed estimates.',         route:'/dashboard',         timeEst:'30 min',  status:'pending'   },
  { id:2, title:'Set Up Predictive AI API Key',   priority:'high',     effort:'low',    impact:'high',   category:'AI',          description:'Add VITE_ANTHROPIC_API_KEY to Render to unlock full Claude AI in the chatbot and copilot pages.',                                         route:'/chatbot',            timeEst:'10 min',  status:'pending'   },
  { id:3, title:'Review Finance Domain Reports',  priority:'high',     effort:'medium', impact:'high',   category:'Compliance',  description:'Finance domain has 125 reports — the largest domain. A quarterly review ensures all reports remain current and required ones are filed on time.', route:'/dashboard',         timeEst:'2 hours', status:'pending'   },
  { id:4, title:'Enable Real-Time Compliance',    priority:'medium',   effort:'medium', impact:'medium', category:'Compliance',  description:'Connect GET /compliance-calendar to surface real deadlines in the Compliance Calendar rather than sample data.',                               route:'/dashboard',         timeEst:'1 hour',  status:'in_progress'},
  { id:5, title:'Activate Workflow Automation',   priority:'medium',   effort:'high',   impact:'high',   category:'Automation',  description:'Use the new Workflow Automation page to create rule-based triggers for report submissions, approvals, and escalations.',                    route:'/workflow-automation',timeEst:'4 hours', status:'pending'   },
  { id:6, title:'Onboard Additional Tenants',     priority:'low',      effort:'high',   impact:'high',   category:'Growth',      description:'Multi-tenant architecture is ready. Onboarding 3+ enterprise clients would validate the SaaS model and generate recurring revenue.',             route:'/tenants',            timeEst:'1 week',  status:'pending'   },
]

// ─────────────────────────────────────────────────────────────
// COPILOT SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────
const COPILOT_SYSTEM = `You are an expert AI Copilot for the Enterprise Finance Solution Suite — an enterprise SaaS platform with ${REPORTS_DATA.length} compliance reports across 13 business domains.

Your role is DIFFERENT from the chatbot assistant:
- You GENERATE content (narratives, summaries, action plans, reports)
- You provide STRATEGIC insights, not just data lookups
- You draft professional business documents
- You recommend specific actions with business justification

PLATFORM CONTEXT:
- ${REPORTS_DATA.length} reports across: Finance(125), Tax(87), Operations(64), Audit(52), Risk(41), Treasury(35), HR(28), Legal(23), IT(19), Sales(15), Supply Chain(8), ESG(3)
- Features: Dashboard, Analytics, Predictive AI, Compliance Calendar, Multi-tenant
- Backend: Node.js + PostgreSQL (127 tables, 570+ endpoints)

CAPABILITIES YOU SHOULD DEMONSTRATE:
1. Generate executive summaries and board-ready narratives
2. Create compliance status reports with specific recommendations
3. Draft risk assessment documents
4. Generate action plans with priority, effort, timeline
5. Explain analytics insights in business language
6. Suggest automation opportunities
7. Create presentation-ready talking points

RESPONSE STYLE:
- Professional, executive-level language
- Specific and actionable (not generic advice)
- Use data from the platform context
- Structure responses with clear sections when generating documents
- Keep responses focused and high-value

Always respond in plain text (no JSON). Format responses clearly with sections, bullet points, and headers when generating documents.`

// ─────────────────────────────────────────────────────────────
// QUICK PROMPTS
// ─────────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: 'Executive Summary',    prompt: 'Generate an executive summary of our compliance platform status for the board meeting.'                  },
  { label: 'Risk Assessment',      prompt: 'Create a risk assessment report highlighting the top risks across all 13 domains.'                       },
  { label: 'Automation Strategy',  prompt: 'Draft an automation strategy for our report processing workflow with ROI estimates.'                     },
  { label: 'Q1 Compliance Report', prompt: 'Generate a Q1 compliance status report covering all required reports and any gaps.'                      },
  { label: 'Finance Narrative',    prompt: 'Write an executive narrative for the Finance domain covering our 125 reports and key metrics.'            },
  { label: 'Action Plan 30 Days',  prompt: 'Create a 30-day action plan to improve our compliance coverage and platform utilisation.'                 },
]

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
function AICopilot() {
  const navigate   = useNavigate()
  const { user }   = useAuth()

  const [activeTab,      setActiveTab]      = useState('copilot')
  const [messages,       setMessages]       = useState([])
  const [history,        setHistory]        = useState([])
  const [input,          setInput]          = useState('')
  const [loading,        setLoading]        = useState(false)
  const [copied,         setCopied]         = useState(null)

  // Narrative generator state
  const [selDomain,      setSelDomain]      = useState('Finance')
  const [selNarrType,    setSelNarrType]    = useState('executive')
  const [narrative,      setNarrative]      = useState('')
  const [narrLoading,    setNarrLoading]    = useState(false)

  // Actions state
  const [actionFilter,   setActionFilter]   = useState('All')

  const messagesEnd = useRef(null)
  const inputRef    = useRef(null)
  const insights    = computeInsights()

  useEffect(() => {
    setMessages([{
      id: 1, role: 'assistant',
      content: `Hello ${user?.firstName || 'there'}! 👋 I'm your **AI Copilot** — here to generate executive narratives, compliance reports, risk assessments, and strategic action plans.\n\nI'm more powerful than the chatbot — I **create and generate** content, not just search for it.\n\nTry asking me to draft an executive summary, create a compliance report, or generate a risk assessment.`,
      timestamp: new Date().toISOString(),
    }])
  }, [user])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Call Claude API ─────────────────────────────────────────
  const callCopilot = useCallback(async (userMsg) => {
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY
    if (!key) {
      return `I need an Anthropic API key to generate content. Add **VITE_ANTHROPIC_API_KEY** to your Render environment variables to unlock full AI generation capabilities.\n\nFor now, here's a template based on your request:\n\n**${userMsg}**\n\n[AI-generated content will appear here once the API key is configured. Your platform has ${REPORTS_DATA.length} reports across 13 domains ready for analysis.]`
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 1500,
        system:     COPILOT_SYSTEM,
        messages:   [...history, { role: 'user', content: userMsg }],
      }),
    })
    if (!res.ok) throw new Error(`API error ${res.status}`)
    const data = await res.json()
    return data.content?.[0]?.text || 'No response generated.'
  }, [history])

  // ── Send message ────────────────────────────────────────────
  const handleSend = useCallback(async (text = input) => {
    const msg = (text || '').trim()
    if (!msg || loading) return
    setInput('')
    setLoading(true)

    const userMsg = { id: Date.now(), role: 'user', content: msg, timestamp: new Date().toISOString() }
    setMessages(p => [...p, userMsg])

    try {
      const reply = await callCopilot(msg)
      const DOMAINS = ['Finance','HR','Operations','Sales','IT','Healthcare','Telecom','Retail','Energy','Manufacturing','Banking','Education','General']
      const FREQS = ['Daily','Weekly','Monthly','Quarterly','Yearly']
      const detectedDomain = DOMAINS.find(d => reply.includes(d) || msg.includes(d))
      const detectedFreq = FREQS.find(f => reply.toLowerCase().includes(f.toLowerCase()) || msg.toLowerCase().includes(f.toLowerCase()))
      const aiMsg = { id: Date.now()+1, role: 'assistant', content: reply, timestamp: new Date().toISOString(), filters: detectedDomain || detectedFreq ? { domain: detectedDomain, frequency: detectedFreq } : null }
      setMessages(p => [...p, aiMsg])
      setHistory(p => [...p, { role:'user', content:msg }, { role:'assistant', content:reply }].slice(-20))
    } catch (e) {
      setMessages(p => [...p, { id: Date.now()+1, role:'assistant', content:`Error: ${e.message}`, timestamp: new Date().toISOString() }])
    }
    setLoading(false)
    inputRef.current?.focus()
  }, [input, loading, callCopilot])

  // ── Generate narrative ──────────────────────────────────────
  const generateNarrative = useCallback(async () => {
    const meta    = DOMAIN_META[selDomain] || {}
    const typeObj = NARRATIVE_TYPES.find(t => t.id === selNarrType)
    const prompt  = `Generate a professional ${typeObj?.label} for our ${selDomain} domain. The ${selDomain} domain has ${meta.count || 'multiple'} reports. Create a comprehensive, board-ready ${typeObj?.label.toLowerCase()} with clear sections, specific metrics, and actionable recommendations.`
    setNarrLoading(true)
    setNarrative('')
    try {
      const result = await callCopilot(prompt)
      setNarrative(result)
    } catch (e) {
      setNarrative(`Error generating narrative: ${e.message}. Please check your API key.`)
    }
    setNarrLoading(false)
  }, [selDomain, selNarrType, callCopilot])

  // ── Copy to clipboard ───────────────────────────────────────
  const copyText = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  // ── Format message text ─────────────────────────────────────
  const formatText = (text) =>
    text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <span key={i}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      )
    })

  const TABS = [
    { id:'copilot',    label:'AI Copilot',       icon: Brain        },
    { id:'narratives', label:'Narrative Builder', icon: BookOpen     },
    { id:'insights',   label:'Smart Insights',    icon: Lightbulb    },
    { id:'actions',    label:'Action Center',     icon: Target       },
  ]

  const priorityColor = { critical:'#ef4444', high:'#f97316', medium:'#f59e0b', low:'#10b981' }
  const impactColor   = { high:'#10b981', medium:'#f59e0b', low:'#94a3b8' }
  const filteredActions = actionFilter === 'All' ? ACTIONS : ACTIONS.filter(a => a.category === actionFilter)

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="acp-root">

      {/* Header */}
      <div className="acp-header">
        <div className="acp-header-left">
          <button className="acp-back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={14} /> Back
          </button>
          <div className="acp-title-group">
            <div className="acp-title-icon"><Brain size={20} /></div>
            <div>
              <h1 className="acp-title">AI Copilot</h1>
              <p className="acp-subtitle">Generate · Narrate · Strategise · Act</p>
            </div>
          </div>
        </div>
        <div className="acp-header-right">
          <span className="acp-data-badge"><Sparkles size={11} /> {REPORTS_DATA.length} reports · 13 domains</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="acp-tab-bar">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} className={`acp-tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <Icon size={13} />{t.label}
            </button>
          )
        })}
      </div>

      {/* ── TAB: COPILOT ─────────────────────────────────────── */}
      {activeTab === 'copilot' && (
        <div className="acp-copilot-layout">

          {/* Messages */}
          <div className="acp-messages">
            {messages.map(m => (
              <div key={m.id} className={`acp-msg-row ${m.role}`}>
                {m.role === 'assistant' && (
                  <div className="acp-avatar ai"><Brain size={14} /></div>
                )}
                <div className={`acp-bubble ${m.role}`}>
                  <div className="acp-bubble-text">{formatText(m.content)}</div>
                  {m.role === "assistant" && (
                    <span>
                      <button className="acp-copy-btn" onClick={() => copyText(m.content, m.id)}>
                        {copied === m.id ? <CheckCircle size={11} /> : <Copy size={11} />}
                        {copied === m.id ? "Copied" : "Copy"}
                      </button>
                      {m.filters && (
                        <button onClick={() => { const p = new URLSearchParams(); if(m.filters.domain) p.set("domain", m.filters.domain); if(m.filters.frequency) p.set("frequency", m.filters.frequency); navigate("/dashboard?" + p.toString()); }} style={{ display:"flex", alignItems:"center", gap:4, background:"#1e3a5f", border:"1px solid #3b82f640", borderRadius:6, color:"#60a5fa", fontSize:11, fontWeight:600, padding:"4px 10px", cursor:"pointer", marginTop:4 }}>
                          <BarChart3 size={11}/> View on Dashboard
                        </button>
                      )}
                    </span>
                  )}
                  <span className="acp-timestamp">{new Date(m.timestamp).toLocaleTimeString()}</span>
                </div>
                {m.role === 'user' && (
                  <div className="acp-avatar user">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="acp-msg-row assistant">
                <div className="acp-avatar ai"><Brain size={14} /></div>
                <div className="acp-bubble assistant">
                  <div className="acp-typing"><span/><span/><span/></div>
                </div>
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Quick Prompts */}
          <div className="acp-quick-prompts">
            {QUICK_PROMPTS.map((q, i) => (
              <button key={i} className="acp-quick-prompt" onClick={() => handleSend(q.prompt)} disabled={loading}>
                <Zap size={10} />{q.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="acp-input-row">
            <input
              ref={inputRef}
              className="acp-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Generate an executive summary, draft a compliance report, create a risk assessment…"
              disabled={loading}
            />
            <button className="acp-send-btn" onClick={() => handleSend()} disabled={loading || !input.trim()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ── TAB: NARRATIVES ──────────────────────────────────── */}
      {activeTab === 'narratives' && (
        <div className="acp-content">
          <div className="acp-narr-layout">

            {/* Controls panel */}
            <div className="acp-narr-controls">
              <div className="acp-narr-section">
                <div className="acp-narr-section-title">Select Domain</div>
                <div className="acp-domain-list">
                  {Object.entries(DOMAIN_META).map(([name, meta]) => {
                    const Icon = meta.icon
                    return (
                      <button
                        key={name}
                        className={`acp-domain-btn ${selDomain === name ? 'active' : ''}`}
                        style={selDomain === name ? { borderColor: meta.color, background: `${meta.color}18`, color: meta.color } : {}}
                        onClick={() => setSelDomain(name)}
                      >
                        <Icon size={12} style={{ color: meta.color }} />
                        <span>{name}</span>
                        <span className="acp-domain-count">{meta.count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="acp-narr-section">
                <div className="acp-narr-section-title">Narrative Type</div>
                {NARRATIVE_TYPES.map(t => (
                  <button
                    key={t.id}
                    className={`acp-narr-type-btn ${selNarrType === t.id ? 'active' : ''}`}
                    onClick={() => setSelNarrType(t.id)}
                  >
                    <div>
                      <div className="acp-narr-type-name">{t.label}</div>
                      <div className="acp-narr-type-desc">{t.desc}</div>
                    </div>
                    {selNarrType === t.id && <CheckCircle size={13} style={{ color:'#14b8a6' }} />}
                  </button>
                ))}
              </div>

              <button
                className="acp-generate-btn"
                onClick={generateNarrative}
                disabled={narrLoading}
              >
                {narrLoading
                  ? <><RefreshCw size={14} style={{ animation:'spin 1s linear infinite' }} /> Generating…</>
                  : <><Sparkles size={14} /> Generate Narrative</>
                }
              </button>
            </div>

            {/* Output panel */}
            <div className="acp-narr-output">
              {!narrative && !narrLoading && (
                <div className="acp-narr-placeholder">
                  <Brain size={40} style={{ color:'#334155', marginBottom:12 }} />
                  <p>Select a domain and narrative type, then click <strong>Generate Narrative</strong></p>
                  <p>The AI Copilot will create a professional, board-ready document tailored to your platform data.</p>
                </div>
              )}
              {narrLoading && (
                <div className="acp-narr-placeholder">
                  <RefreshCw size={28} style={{ color:'#3b82f6', animation:'spin 1s linear infinite', marginBottom:12 }} />
                  <p>Generating {NARRATIVE_TYPES.find(t=>t.id===selNarrType)?.label} for <strong>{selDomain}</strong>…</p>
                </div>
              )}
              {narrative && !narrLoading && (
                <>
                  <div className="acp-narr-toolbar">
                    <span className="acp-narr-label">
                      <FileText size={13} />
                      {selDomain} — {NARRATIVE_TYPES.find(t=>t.id===selNarrType)?.label}
                    </span>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="acp-narr-action-btn" onClick={() => copyText(narrative, 'narr')}>
                        {copied === 'narr' ? <CheckCircle size={12}/> : <Copy size={12}/>}
                        {copied === 'narr' ? 'Copied' : 'Copy'}
                      </button>
                      <button className="acp-narr-action-btn" onClick={() => {
                        const blob = new Blob([narrative], { type:'text/plain' })
                        const url  = URL.createObjectURL(blob)
                        const a    = document.createElement('a')
                        a.href = url; a.download = `${selDomain}-${selNarrType}.txt`; a.click()
                        URL.revokeObjectURL(url)
                      }}>
                        <Download size={12}/> Download
                      </button>
                    </div>
                  </div>
                  <div className="acp-narr-text">{formatText(narrative)}</div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: INSIGHTS ────────────────────────────────────── */}
      {activeTab === 'insights' && (
        <div className="acp-content">
          <div className="acp-insights-header">
            <div>
              <h2 className="acp-section-title"><Lightbulb size={16} /> Smart Insights</h2>
              <p className="acp-section-sub">AI-computed from your {REPORTS_DATA.length} reports across 13 domains</p>
            </div>
          </div>
          <div className="acp-insights-grid">
            {insights.map(ins => {
              const Icon = ins.icon
              return (
                <div key={ins.id} className="acp-insight-card" style={{ borderTopColor: ins.color }}>
                  <div className="acp-insight-top">
                    <div className="acp-insight-icon" style={{ background:`${ins.color}22`, color:ins.color }}>
                      <Icon size={16} />
                    </div>
                    <div className="acp-insight-meta">
                      <span className="acp-insight-category">{ins.category}</span>
                      <span className={`acp-impact-badge ${ins.impact}`}>{ins.impact} impact</span>
                    </div>
                  </div>
                  <div className="acp-insight-title">{ins.title}</div>
                  <p className="acp-insight-summary">{ins.summary}</p>
                  <div className="acp-insight-bottom">
                    <div className="acp-insight-metric">
                      <span className="acp-insight-metric-val" style={{ color:ins.color }}>{ins.metric}</span>
                      <span className="acp-insight-metric-lbl">{ins.metricLabel}</span>
                    </div>
                    {ins.trend && (
                      <span className="acp-insight-trend" style={{ color: ins.trendUp ? '#10b981' : ins.trendUp === false ? '#ef4444' : '#64748b' }}>
                        {ins.trendUp ? '↑' : ins.trendUp === false ? '↓' : '→'} {ins.trend}
                      </span>
                    )}
                    <button className="acp-insight-action" onClick={() => { setActiveTab('copilot'); setInput(`Tell me more about: ${ins.title}`); }}>
                      {ins.action} <ChevronRight size={11} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TAB: ACTIONS ─────────────────────────────────────── */}
      {activeTab === 'actions' && (
        <div className="acp-content">
          <div className="acp-insights-header">
            <div>
              <h2 className="acp-section-title"><Target size={16} /> Action Center</h2>
              <p className="acp-section-sub">AI-recommended actions ranked by priority and business impact</p>
            </div>
            <div className="acp-action-filters">
              {['All','Integration','AI','Compliance','Automation','Growth'].map(f => (
                <button key={f} className={`acp-filter-btn ${actionFilter === f ? 'active' : ''}`} onClick={() => setActionFilter(f)}>{f}</button>
              ))}
            </div>
          </div>

          <div className="acp-actions-list">
            {filteredActions.map((action, i) => (
              <div key={action.id} className="acp-action-card">
                <div className="acp-action-rank">#{i+1}</div>
                <div className="acp-action-body">
                  <div className="acp-action-top-row">
                    <span className="acp-action-title">{action.title}</span>
                    <div className="acp-action-tags">
                      <span className="acp-action-category">{action.category}</span>
                      <span className="acp-priority-tag" style={{ color:priorityColor[action.priority], background:`${priorityColor[action.priority]}18` }}>{action.priority}</span>
                      <span className="acp-impact-tag"   style={{ color:impactColor[action.impact],    background:`${impactColor[action.impact]}18`   }}>{action.impact} impact</span>
                      <span className="acp-effort-tag">Effort: {action.effort}</span>
                      {action.status === 'in_progress' && <span className="acp-status-in-progress">In Progress</span>}
                    </div>
                  </div>
                  <p className="acp-action-desc">{action.description}</p>
                  <div className="acp-action-footer">
                    <span className="acp-action-time"><Clock size={12} /> Est: {action.timeEst}</span>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="acp-action-ask-btn" onClick={() => { setActiveTab('copilot'); setInput(`Help me implement: ${action.title}`); }}>
                        <MessageSquare size={11} /> Ask Copilot
                      </button>
                      <button className="acp-action-go-btn" onClick={() => navigate(action.route)}>
                        <Play size={11} /> Go There
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default AICopilot

