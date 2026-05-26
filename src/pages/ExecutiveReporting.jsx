import { useState, useEffect } from 'react'
import { schedulesAPI } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { REPORTS_DATA } from '../data/reportsData'
import {
  ArrowLeft, BarChart3, TrendingUp, TrendingDown,
  FileText, Calendar, CheckCircle, AlertTriangle,
  Shield, Users, Activity, ChevronRight, ChevronDown,
  RefreshCw, Download, Zap, Eye, Clock, Building2,
  Maximize2, Minimize2, Plus, Trash2, Edit3, Mail,
  Play, Pause, Brain, Copy, X
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts'
import './ExecutiveReporting.css'

// ── SAFE DATA ────────────────────────────────────────────────
const safeReports = Array.isArray(REPORTS_DATA) ? REPORTS_DATA : []

const DOMAIN_PERF = [
  { domain:'Finance',     compliance:94, efficiency:88, risk:18, reports:125, color:'#14b8a6' },
  { domain:'Tax',         compliance:91, efficiency:82, risk:24, reports:87,  color:'#6366f1' },
  { domain:'Operations',  compliance:87, efficiency:91, risk:31, reports:64,  color:'#f59e0b' },
  { domain:'Audit',       compliance:98, efficiency:79, risk:12, reports:52,  color:'#ef4444' },
  { domain:'Risk',        compliance:89, efficiency:85, risk:28, reports:41,  color:'#fb7185' },
  { domain:'Treasury',    compliance:96, efficiency:90, risk:15, reports:35,  color:'#22d3ee' },
  { domain:'HR',          compliance:85, efficiency:88, risk:22, reports:28,  color:'#10b981' },
  { domain:'Legal',       compliance:93, efficiency:76, risk:19, reports:23,  color:'#a855f7' },
  { domain:'IT',          compliance:97, efficiency:94, risk:14, reports:19,  color:'#3b82f6' },
  { domain:'Sales',       compliance:82, efficiency:86, risk:27, reports:15,  color:'#8b5cf6' },
]

const REVENUE_TREND = [
  { month:'Jul 25', value:8.2  }, { month:'Aug 25', value:9.1  },
  { month:'Sep 25', value:8.7  }, { month:'Oct 25', value:10.2 },
  { month:'Nov 25', value:11.5 }, { month:'Dec 25', value:12.8 },
  { month:'Jan 26', value:13.4 }, { month:'Feb 26', value:14.1 },
  { month:'Mar 26', value:15.0 }, { month:'Apr 26', value:15.8 },
  { month:'May 26', value:16.9 },
]

const HIGHLIGHTS = [
  { type:'positive', text:'Compliance rate improved to 94.2% — highest in 3 quarters' },
  { type:'positive', text:'IT domain leads with 97% compliance and lowest risk score' },
  { type:'warning',  text:'ESG domain at 79% compliance — requires immediate attention' },
  { type:'positive', text:'Revenue trend shows consistent month-over-month growth of 8.2%' },
  { type:'warning',  text:'Sales domain automation rate is below target — review recommended' },
]

const INITIAL_SCHEDULES = [
  { id:1, name:'Monthly Finance Summary',  domain:'Finance', frequency:'Monthly', time:'08:00', recipients:['cfo@company.com'], format:'PDF',   active:true,  lastSent:'2026-05-01', nextSend:'2026-06-01', sentCount:11 },
  { id:2, name:'Weekly Compliance Status', domain:'Audit',   frequency:'Weekly',  time:'09:00', recipients:['cae@company.com'], format:'PDF',   active:true,  lastSent:'2026-05-13', nextSend:'2026-05-20', sentCount:48 },
  { id:3, name:'Daily Risk Dashboard',     domain:'Risk',    frequency:'Daily',   time:'07:30', recipients:['cro@company.com'], format:'Excel', active:true,  lastSent:'2026-05-16', nextSend:'2026-05-17', sentCount:124},
  { id:4, name:'Quarterly Board Pack',     domain:'Finance', frequency:'Quarterly',time:'06:00',recipients:['board@company.com']  ,format:'PDF', active:true, lastSent:'2026-03-31', nextSend:'2026-06-30', sentCount:4  },
  { id:5, name:'HR Monthly Analytics',     domain:'HR',      frequency:'Monthly', time:'09:00', recipients:['chro@company.com'], format:'Excel',active:false, lastSent:'2026-05-05', nextSend:'Paused',     sentCount:14 },
]

const SUMMARY_TYPES = ['Executive Brief','Detailed Analysis','Risk Report','Compliance Status','Trend Analysis']
const DOMAINS_LIST  = ['Finance','Tax','Operations','Audit','Risk','Treasury','HR','Legal','IT','Sales']
const FREQUENCIES   = ['Daily','Weekly','Monthly','Quarterly','Annual']
const FORMATS       = ['PDF','Excel','CSV']

// ── TOOLTIP ──────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8, padding:'10px 14px', fontSize:12 }}>
      <p style={{ color:'#94a3b8', marginBottom:4, fontWeight:600 }}>{label}</p>
      {payload.map((e,i) => <p key={i} style={{ color:e.color||'#14b8a6', margin:'2px 0' }}>{e.name}: <strong>{e.value}</strong></p>)}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ExecutiveReporting() {
  const navigate = useNavigate()

  const [activeTab,     setActiveTab]     = useState('executive')
  const [boardroom,     setBoardroom]     = useState(false)
  const [drillDomain,   setDrillDomain]   = useState(null)
  const [benchDomains,  setBenchDomains]  = useState(['Finance','Tax','HR'])
  const [benchMetric,   setBenchMetric]   = useState('compliance')
  const [schedules, setSchedules] = useState([])
  const [schedLoading, setSchedLoading] = useState(true)
  const [schedError, setSchedError] = useState(null)
  useEffect(() => {
    schedulesAPI.getAll()
      .then(r => setSchedules((r?.data || r || []).map(s => ({
        ...s, id: s.schedule_id, active: s.is_active,
        lastSent: s.last_sent_at ? new Date(s.last_sent_at).toLocaleDateString() : 'Never',
        nextSend: s.next_send_at ? new Date(s.next_send_at).toLocaleDateString() : 'Scheduled',
        sentCount: s.sent_count || 0
      }))))
      .catch(e => setSchedError(e.message))
      .finally(() => setSchedLoading(false))
  }, [])
  const [showForm,      setShowForm]      = useState(false)
  const [selDomain,     setSelDomain]     = useState('Finance')
  const [selType,       setSelType]       = useState('Executive Brief')
  const [summary,       setSummary]       = useState('')
  const [summaryLoading,setSummaryLoading]= useState(false)
  const [form,          setForm]          = useState({ name:'', domain:'Finance', frequency:'Monthly', time:'09:00', recipients:'', format:'PDF' })

  const totalReports    = safeReports.length
  const requiredReports = safeReports.filter(r=>(r.complianceStatus||r.compliance_status)==='Required').length
  const benchData       = DOMAIN_PERF.filter(d => benchDomains.includes(d.domain))

  const radarData = benchData.map(d => ({
    subject:    d.domain.length > 8 ? d.domain.slice(0,8) : d.domain,
    Compliance: d.compliance,
    Efficiency: d.efficiency,
    Safety:     100 - d.risk,
  }))

  const KPIS = [
    { label:'Total Reports',    value:totalReports,                  target:550, unit:'',  trend:'+8.2%',  up:true,  color:'#3b82f6', icon:FileText      },
    { label:'Compliance Rate',  value:'94.2',                        target:95,  unit:'%', trend:'+4.1%',  up:true,  color:'#10b981', icon:CheckCircle   },
    { label:'Active Domains',   value:13,                            target:13,  unit:'',  trend:'Full',   up:true,  color:'#14b8a6', icon:Activity      },
    { label:'Required Reports', value:requiredReports,               target:350, unit:'',  trend:'+3.2%',  up:true,  color:'#8b5cf6', icon:Shield        },
    { label:'Risk Score',       value:'24.8',                        target:30,  unit:'',  trend:'-5.3',   up:true,  color:'#f59e0b', icon:AlertTriangle },
    { label:'Automation Rate',  value:'0.0',                         target:40,  unit:'%', trend:'+12%',   up:true,  color:'#ec4899', icon:Zap           },
  ]

  const TABS = [
    { id:'executive',  label:'Executive Dashboard', icon:BarChart3  },
    { id:'summaries',  label:'Report Summaries',    icon:FileText   },
    { id:'scheduled',  label:'Scheduled Reports',   icon:Calendar   },
    { id:'drilldown',  label:'Drill-Down',           icon:Eye        },
    { id:'benchmark',  label:'Benchmarking',        icon:Activity   },
  ]

  // ── SCHEDULED helpers ──────────────────────────────────────
  const toggleSchedule = async (id) => {
    try {
      await schedulesAPI.toggle(id)
      setSchedules(p => p.map(s => s.id===id ? {...s, active:!s.active} : s))
    } catch(e) { console.error('Toggle failed:', e) }
  }
  const deleteSchedule = async (id) => {
    try {
      await schedulesAPI.delete(id)
      setSchedules(p => p.filter(s => s.id!==id))
    } catch(e) { console.error('Delete failed:', e) }
  }
  const saveSchedule = async () => {
    try {
      const payload = {
        name: form.name, domain: form.domain, frequency: form.frequency,
        send_time: form.time, recipients: form.recipients.split(',').map(r=>r.trim()).filter(Boolean),
        format: form.format
      }
      const r = await schedulesAPI.create(payload)
      const s = r?.data || r
      setSchedules(p => [{ ...s, id: s.schedule_id, active: s.is_active, lastSent:'Never', nextSend:'Scheduled', sentCount:0 }, ...p])
      setForm({ name:'', domain:'Finance', frequency:'Monthly', time:'09:00', recipients:'', format:'PDF' })
    } catch(e) { console.error('Save failed:', e) }
  }

  // ── SUMMARY generator ──────────────────────────────────────
  const generateSummary = async () => {
    setSummaryLoading(true)
    setSummary('')
    const key = import.meta.env.VITE_ANTHROPIC_API_KEY
    const domainCount = safeReports.filter(r=>(r.domain||'Other')===selDomain).length

    if (!key) {
      setTimeout(() => {
        setSummary(`# ${selDomain} — ${selType}\n\n## Executive Summary\nThe ${selDomain} domain manages ${domainCount} compliance reports.\n\n## Key Findings\n• Compliance rate: 94.2% — above industry benchmark\n• ${Math.floor(domainCount*0.35)} reports suitable for automation\n• Risk profile: Medium\n\n## Recommendations\n1. Automate top ${Math.floor(domainCount*0.35)} identified reports\n2. Schedule quarterly review of all ${domainCount} reports\n3. Implement automated deadline alerts\n\n## Next Steps\n- Week 1: Stakeholder review and sign-off\n- Month 1: Automation pilot for top 10 reports\n\n---\n*Generated by AI Copilot — Add VITE_ANTHROPIC_API_KEY for full Claude AI*`)
        setSummaryLoading(false)
      }, 1000)
      return
    }
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method:'POST',
        headers:{ 'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true' },
        body: JSON.stringify({ model:'claude-sonnet-4-6', max_tokens:1000, messages:[{ role:'user', content:`Generate a professional ${selType} for the ${selDomain} domain of our enterprise finance platform. It has ${domainCount} compliance reports. Include: Executive Summary, Key Findings, Risk Assessment, Recommendations, Next Steps. Be specific and board-ready.` }] })
      })
      const data = await res.json()
      setSummary(data.content?.[0]?.text || 'No content generated.')
    } catch(e) { setSummary(`Error: ${e.message}`) }
    setSummaryLoading(false)
  }

  const exportTxt = () => {
    const blob = new Blob([summary], {type:'text/plain'})
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href=url; a.download=`${selDomain}-${selType}.txt`; a.click()
    URL.revokeObjectURL(url)
  }

  const freqColor = { Daily:'#3b82f6', Weekly:'#10b981', Monthly:'#8b5cf6', Quarterly:'#f59e0b', Annual:'#ec4899' }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="er-root">

      {/* Header */}
      {!boardroom && (
        <div className="er-header">
          <div className="er-header-left">
            <button className="er-back-btn" onClick={()=>navigate('/dashboard')}><ArrowLeft size={14}/> Back</button>
            <div className="er-title-group">
              <div className="er-title-icon"><BarChart3 size={20}/></div>
              <div>
                <h1 className="er-title">Executive Reporting</h1>
                <p className="er-subtitle">Boardroom Intelligence · AI Summaries · Benchmarking · Drill-Down</p>
              </div>
            </div>
          </div>
          <span className="er-data-badge"><Activity size={11}/> {totalReports} reports · 13 domains</span>
        </div>
      )}

      {/* Tabs */}
      {!boardroom && (
        <div className="er-tab-bar">
          {TABS.map(t => {
            const Icon = t.icon
            return <button key={t.id} className={`er-tab-btn ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}><Icon size={13}/>{t.label}</button>
          })}
        </div>
      )}

      {/* ── EXECUTIVE DASHBOARD ─────────────────────────────── */}
      {(activeTab==='executive'||boardroom) && (
        <div className={`er-exec ${boardroom?'boardroom':''}`}>
          <div className="er-exec-toolbar">
            <div>
              <h2 className="er-exec-title">Executive Dashboard</h2>
              <p className="er-exec-sub">{new Date().toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
            </div>
            <button className="er-boardroom-btn" onClick={()=>setBoardroom(!boardroom)}>
              {boardroom ? <><Minimize2 size={13}/> Exit Boardroom</> : <><Maximize2 size={13}/> Boardroom Mode</>}
            </button>
          </div>

          {/* KPI Grid */}
          <div className="er-kpi-grid">
            {KPIS.map((k,i) => {
              const Icon = k.icon
              const pct  = k.target ? Math.min(100, (parseFloat(String(k.value))||0) / k.target * 100) : 100
              return (
                <div key={i} className="er-kpi-card" style={{ borderTopColor:k.color }}>
                  <div className="er-kpi-top">
                    <div className="er-kpi-icon" style={{ background:`${k.color}22`, color:k.color }}><Icon size={16}/></div>
                    <span className={`er-kpi-trend ${k.up?'up':'down'}`}>{k.up?<TrendingUp size={11}/>:<TrendingDown size={11}/>} {k.trend}</span>
                  </div>
                  <div className="er-kpi-value" style={{ color:k.color }}>{k.value}{k.unit}</div>
                  <div className="er-kpi-label">{k.label}</div>
                  <div className="er-kpi-bar"><div className="er-kpi-bar-fill" style={{ width:`${pct}%`, background:k.color }}/></div>
                  <div className="er-kpi-target">Target: {k.target}{k.unit}</div>
                </div>
              )
            })}
          </div>

          {/* Charts */}
          <div className="er-charts-row">
            <div className="er-chart-card">
              <div className="er-chart-header"><span className="er-chart-title"><TrendingUp size={14}/> Revenue Trend (M$)</span></div>
              <div style={{ padding:'12px 12px 0' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={REVENUE_TREND} margin={{ top:5, right:16, left:0, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                    <XAxis dataKey="month" tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
                    <YAxis tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
                    <Tooltip content={<ChartTip/>}/>
                    <Line type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill:'#14b8a6', r:3 }} name="Revenue $M"/>
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="er-chart-card">
              <div className="er-chart-header"><span className="er-chart-title"><Shield size={14}/> Compliance by Domain</span></div>
              <div style={{ padding:'12px 12px 0' }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={DOMAIN_PERF.slice(0,8)} layout="vertical" margin={{ top:5, right:16, left:60, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                    <XAxis type="number" domain={[0,100]} tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
                    <YAxis dataKey="domain" type="category" tick={{ fill:'#94a3b8', fontSize:10 }} tickLine={false} width={58}/>
                    <Tooltip content={<ChartTip/>}/>
                    <Bar dataKey="compliance" name="Compliance %" radius={[0,3,3,0]}>
                      {DOMAIN_PERF.slice(0,8).map((d,i) => <Cell key={i} fill={d.color}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="er-highlights">
            <div className="er-highlights-title"><CheckCircle size={14}/> Key Highlights</div>
            {HIGHLIGHTS.map((h,i) => (
              <div key={i} className={`er-highlight-item ${h.type}`}>
                {h.type==='positive' ? <CheckCircle size={13} style={{ color:'#10b981',flexShrink:0 }}/> : <AlertTriangle size={13} style={{ color:'#f59e0b',flexShrink:0 }}/>}
                <span>{h.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── REPORT SUMMARIES ────────────────────────────────── */}
      {activeTab==='summaries' && !boardroom && (
        <div className="er-exec" style={{ flexDirection:'row', gap:20 }}>

          {/* Controls */}
          <div style={{ width:260, flexShrink:0, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:16, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', display:'flex', alignItems:'center', gap:6 }}><Brain size={13}/> Configure</div>

              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <label style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase' }}>Domain</label>
                <select className="er-select" value={selDomain} onChange={e=>setSelDomain(e.target.value)}>
                  {DOMAINS_LIST.map(d=><option key={d}>{d}</option>)}
                </select>
                <span style={{ fontSize:10, color:'#64748b' }}>{safeReports.filter(r=>(r.domain||'Other')===selDomain).length} reports</span>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                <label style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase' }}>Summary Type</label>
                {SUMMARY_TYPES.map(t => (
                  <button key={t} className={`er-type-btn ${selType===t?'active':''}`} onClick={()=>setSelType(t)}>{t}</button>
                ))}
              </div>

              <button className="er-generate-btn" onClick={generateSummary} disabled={summaryLoading}>
                {summaryLoading ? <><RefreshCw size={13} style={{ animation:'spin 1s linear infinite' }}/> Generating…</> : <><Brain size={13}/> Generate</>}
              </button>

              {summary && (
                <div style={{ display:'flex', flexDirection:'column', gap:6, paddingTop:10, borderTop:'1px solid #334155' }}>
                  <button className="er-export-btn" onClick={()=>navigator.clipboard.writeText(summary)}><Copy size={12}/> Copy</button>
                  <button className="er-export-btn" onClick={exportTxt}><Download size={12}/> Download .txt</button>
                </div>
              )}
            </div>
          </div>

          {/* Output */}
          <div style={{ flex:1, background:'#1e293b', border:'1px solid #334155', borderRadius:12, overflow:'hidden', display:'flex', flexDirection:'column', minHeight:400 }}>
            {!summary && !summaryLoading && (
              <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#64748b', gap:8, padding:40, textAlign:'center' }}>
                <Brain size={44} style={{ color:'#334155' }}/>
                <p style={{ fontSize:13, margin:0 }}>Select domain and type, then click Generate</p>
              </div>
            )}
            {summaryLoading && (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', flexDirection:'column', gap:10 }}>
                <RefreshCw size={24} style={{ animation:'spin 1s linear infinite', color:'#3b82f6' }}/>
                <span style={{ fontSize:13 }}>Generating {selType} for {selDomain}…</span>
              </div>
            )}
            {summary && !summaryLoading && (
              <div style={{ padding:'16px 20px', overflow:'auto', flex:1 }}>
                <div style={{ fontSize:10, color:'#64748b', marginBottom:12, display:'flex', gap:8, alignItems:'center' }}>
                  <FileText size={12}/> {selDomain} · {selType} · {new Date().toLocaleDateString()}
                </div>
                <pre style={{ fontFamily:'inherit', fontSize:13, color:'#e2e8f0', lineHeight:1.7, whiteSpace:'pre-wrap', margin:0 }}>{summary}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SCHEDULED REPORTS ───────────────────────────────── */}
      {activeTab==='scheduled' && !boardroom && (
        <div className="er-exec">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <div>
              <h2 className="er-exec-title">Scheduled Reports</h2>
              <p className="er-exec-sub">{schedules.filter(s=>s.active).length} active · {schedules.filter(s=>!s.active).length} paused</p>
            </div>
            <button className="er-boardroom-btn" onClick={()=>setShowForm(!showForm)}>
              <Plus size={13}/> New Schedule
            </button>
          </div>

          {showForm && (
            <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:18, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontSize:14, fontWeight:700, color:'#f1f5f9' }}>New Scheduled Report</span>
                <button onClick={()=>setShowForm(false)} style={{ background:'none', border:'none', color:'#64748b', cursor:'pointer' }}><X size={16}/></button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  { label:'Schedule Name', key:'name',      type:'text',   placeholder:'e.g. Monthly Finance Summary' },
                  { label:'Time',          key:'time',      type:'time',   placeholder:'' },
                  { label:'Recipients',    key:'recipients',type:'text',   placeholder:'email1@co.com, email2@co.com' },
                ].map(f => (
                  <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:4, gridColumn: f.key==='name'||f.key==='recipients' ? '1/-1' : 'auto' }}>
                    <label style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase' }}>{f.label}</label>
                    <input className="er-select" type={f.type} placeholder={f.placeholder} value={form[f.key]||''} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} style={{ padding:'8px 12px' }}/>
                  </div>
                ))}
                {[
                  { label:'Domain',    key:'domain',    opts:DOMAINS_LIST },
                  { label:'Frequency', key:'frequency', opts:FREQUENCIES  },
                  { label:'Format',    key:'format',    opts:FORMATS      },
                ].map(f => (
                  <div key={f.key} style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    <label style={{ fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase' }}>{f.label}</label>
                    <select className="er-select" value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))}>
                      {f.opts.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                <button onClick={()=>setShowForm(false)} style={{ padding:'7px 16px', background:'#1e293b', border:'1px solid #334155', borderRadius:7, color:'#94a3b8', cursor:'pointer', fontSize:12 }}>Cancel</button>
                <button onClick={saveSchedule} disabled={!form.name.trim()} style={{ padding:'7px 16px', background:'#10b981', border:'none', borderRadius:7, color:'#fff', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                  <CheckCircle size={12}/> Create
                </button>
              </div>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {schedules.map(s => (
              <div key={s.id} style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:16, display:'flex', alignItems:'center', gap:14, opacity:s.active?1:0.7 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:s.active?'#10b981':'#f59e0b', flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'#f1f5f9' }}>{s.name}</span>
                    <span style={{ fontSize:10, padding:'2px 7px', background:'#334155', color:'#94a3b8', borderRadius:20 }}>{s.domain}</span>
                    <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:20, background:`${freqColor[s.frequency]||'#64748b'}20`, color:freqColor[s.frequency]||'#64748b' }}>{s.frequency}</span>
                    <span style={{ fontSize:10, padding:'2px 7px', background:'#3b82f620', color:'#3b82f6', borderRadius:20 }}>{s.format}</span>
                    {!s.active && <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', background:'#f59e0b20', color:'#f59e0b', borderRadius:20 }}>Paused</span>}
                  </div>
                  <div style={{ display:'flex', gap:14, fontSize:11, color:'#64748b', flexWrap:'wrap' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Mail size={11}/> {(s.recipients||[]).length} recipient{s.recipients?.length!==1?'s':''}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><Clock size={11}/> {s.time}</span>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}><RefreshCw size={11}/> Sent {s.sentCount}×</span>
                    <span style={{ color:s.active?'#10b981':'#f59e0b' }}>Next: {s.nextSend}</span>
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                  {[
                    { icon: s.active?Pause:Play, action:()=>toggleSchedule(s.id) },
                    { icon: Trash2, action:()=>deleteSchedule(s.id), danger:true },
                  ].map((btn,i) => {
                    const Icon = btn.icon
                    return (
                      <button key={i} onClick={btn.action} style={{ width:30, height:30, background:'#0f172a', border:'1px solid #334155', borderRadius:7, color:'#94a3b8', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <Icon size={13}/>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── DRILL-DOWN ───────────────────────────────────────── */}
      {activeTab==='drilldown' && !boardroom && (
        <div className="er-exec">
          <div>
            <h2 className="er-exec-title">Drill-Down Explorer</h2>
            <p className="er-exec-sub">Click any domain to explore its reports and metrics</p>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', background:'#1e293b', border:'1px solid #334155', borderRadius:8, fontSize:12 }}>
            <button style={{ background:'none', border:'none', color:drillDomain?'#3b82f6':'#f1f5f9', cursor:'pointer', fontSize:12 }} onClick={()=>setDrillDomain(null)}>All Domains</button>
            {drillDomain && <><ChevronRight size={12} style={{ color:'#475569' }}/><span style={{ color:'#f1f5f9', fontWeight:600 }}>{drillDomain}</span></>}
          </div>

          {!drillDomain && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
              {DOMAIN_PERF.map(d => (
                <button key={d.domain} onClick={()=>setDrillDomain(d.domain)}
                  style={{ background:'#1e293b', border:`1px solid #334155`, borderTop:`3px solid ${d.color}`, borderRadius:10, padding:16, cursor:'pointer', textAlign:'left', transition:'all 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='none'}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:'#f1f5f9' }}>{d.domain}</span>
                    <span style={{ fontSize:12, fontWeight:700, color:d.color }}>{d.reports}</span>
                  </div>
                  <div style={{ display:'flex', gap:8, fontSize:11, flexWrap:'wrap', marginBottom:10 }}>
                    <span style={{ color:'#10b981' }}>C:{d.compliance}%</span>
                    <span style={{ color:'#3b82f6' }}>E:{d.efficiency}%</span>
                    <span style={{ color:d.risk>30?'#ef4444':'#f59e0b' }}>R:{d.risk}</span>
                  </div>
                  <div style={{ height:4, background:'#334155', borderRadius:2, overflow:'hidden' }}>
                    <div style={{ width:`${d.compliance}%`, height:'100%', background:d.color, borderRadius:2 }}/>
                  </div>
                  <div style={{ fontSize:11, color:'#475569', marginTop:8, display:'flex', alignItems:'center', gap:4 }}><Eye size={10}/> Explore <ChevronRight size={10}/></div>
                </button>
              ))}
            </div>
          )}

          {drillDomain && (() => {
            const domain  = DOMAIN_PERF.find(d=>d.domain===drillDomain)
            const reports = safeReports.filter(r=>(r.domain||'Other')===drillDomain).slice(0,10)
            return (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>
                  {[
                    { label:'Compliance', value:`${domain?.compliance}%`, color:'#10b981' },
                    { label:'Efficiency',  value:`${domain?.efficiency}%`, color:'#3b82f6' },
                    { label:'Risk Score',  value:domain?.risk,             color:'#f59e0b' },
                  ].map((m,i) => (
                    <div key={i} style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:10, padding:20, textAlign:'center' }}>
                      <div style={{ fontSize:32, fontWeight:800, color:m.color }}>{m.value}</div>
                      <div style={{ fontSize:12, color:'#64748b', marginTop:4 }}>{m.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:10, overflow:'hidden' }}>
                  <div style={{ padding:'10px 16px', background:'#0f172a', borderBottom:'1px solid #334155', fontSize:12, fontWeight:700, color:'#94a3b8', display:'flex', alignItems:'center', gap:6 }}>
                    <FileText size={13}/> {drillDomain} Reports ({reports.length})
                  </div>
                  {reports.map((r,i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 16px', borderBottom:'1px solid #1e293b', borderLeft:`3px solid ${domain?.color}` }}>
                      <span style={{ flex:1, fontSize:12, color:'#f1f5f9' }}>{r.name||r.report_name}</span>
                      <span style={{ fontSize:10, color:'#64748b' }}>{r.frequency}</span>
                      <span style={{ fontSize:10, fontWeight:600, padding:'1px 6px', borderRadius:20, background:(r.complianceStatus||r.compliance_status)==='Required'?'#10b98120':'#f59e0b20', color:(r.complianceStatus||r.compliance_status)==='Required'?'#10b981':'#f59e0b' }}>
                        {r.complianceStatus||r.compliance_status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* ── BENCHMARKING ─────────────────────────────────────── */}
      {activeTab==='benchmark' && !boardroom && (
        <div className="er-exec">
          <div>
            <h2 className="er-exec-title">Domain Benchmarking</h2>
            <p className="er-exec-sub">Compare performance — select up to 5 domains</p>
          </div>

          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {DOMAIN_PERF.map(d => (
              <button key={d.domain}
                onClick={()=>setBenchDomains(p=>p.includes(d.domain)?p.filter(x=>x!==d.domain):p.length<5?[...p,d.domain]:p)}
                style={{ padding:'5px 14px', background: benchDomains.includes(d.domain)?`${d.color}18`:'#1e293b', border:`1px solid ${benchDomains.includes(d.domain)?d.color:'#334155'}`, borderRadius:20, color:benchDomains.includes(d.domain)?d.color:'#64748b', fontSize:12, cursor:'pointer', fontWeight:benchDomains.includes(d.domain)?600:400 }}
              >
                {d.domain}
              </button>
            ))}
          </div>

          <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:12, color:'#64748b', fontWeight:600 }}>Compare:</span>
            {[{k:'compliance',l:'Compliance'},{k:'efficiency',l:'Efficiency'},{k:'risk',l:'Risk'},{k:'reports',l:'Reports'}].map(m => (
              <button key={m.k} onClick={()=>setBenchMetric(m.k)}
                style={{ padding:'5px 12px', background:benchMetric===m.k?'#1e3a5f':'#1e293b', border:`1px solid ${benchMetric===m.k?'#3b82f640':'#334155'}`, borderRadius:7, color:benchMetric===m.k?'#3b82f6':'#64748b', fontSize:12, cursor:'pointer' }}>
                {m.l}
              </button>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="er-chart-card">
              <div className="er-chart-header"><span className="er-chart-title"><BarChart3 size={14}/> {benchMetric} Comparison</span></div>
              <div style={{ padding:'12px 12px 0' }}>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={benchData} margin={{ top:10, right:20, left:0, bottom:0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                    <XAxis dataKey="domain" tick={{ fill:'#94a3b8', fontSize:10 }} tickLine={false}/>
                    <YAxis tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
                    <Tooltip content={<ChartTip/>}/>
                    <Bar dataKey={benchMetric} name={benchMetric} radius={[4,4,0,0]}>
                      {benchData.map((d,i)=><Cell key={i} fill={d.color}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="er-chart-card">
              <div className="er-chart-header"><span className="er-chart-title"><Activity size={14}/> Multi-Dimension Radar</span></div>
              <div style={{ padding:'12px 12px 0' }}>
                {radarData.length > 0 && (
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={radarData} margin={{ top:10, right:20, left:20, bottom:10 }}>
                      <PolarGrid stroke="#334155"/>
                      <PolarAngleAxis dataKey="subject" tick={{ fill:'#94a3b8', fontSize:10 }}/>
                      <PolarRadiusAxis angle={90} domain={[0,100]} tick={{ fill:'#64748b', fontSize:9 }}/>
                      <Radar name="Compliance" dataKey="Compliance" stroke="#10b981" fill="#10b981" fillOpacity={0.2}/>
                      <Radar name="Efficiency" dataKey="Efficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2}/>
                      <Radar name="Safety"     dataKey="Safety"     stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2}/>
                      <Legend wrapperStyle={{ color:'#94a3b8', fontSize:11 }}/>
                      <Tooltip content={<ChartTip/>}/>
                    </RadarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Benchmark table */}
          <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:10, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr 1fr', gap:12, padding:'10px 16px', background:'#0f172a', borderBottom:'1px solid #334155', fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase' }}>
              {['Domain','Compliance','Efficiency','Risk','Reports','Score'].map(h=><span key={h}>{h}</span>)}
            </div>
            {benchData.map((d,i)=>{
              const score = ((d.compliance+d.efficiency+(100-d.risk))/3).toFixed(1)
              const clr   = v => v>=90?'#10b981':v>=75?'#f59e0b':'#ef4444'
              return (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr 1fr 1fr 1fr', gap:12, padding:'10px 16px', borderBottom:'1px solid #1e293b', fontSize:12 }}>
                  <span style={{ color:d.color, fontWeight:700 }}>{d.domain}</span>
                  <span style={{ color:clr(d.compliance), fontWeight:600 }}>{d.compliance}%</span>
                  <span style={{ color:clr(d.efficiency), fontWeight:600 }}>{d.efficiency}%</span>
                  <span style={{ color:d.risk<=20?'#10b981':d.risk<=30?'#f59e0b':'#ef4444', fontWeight:600 }}>{d.risk}</span>
                  <span style={{ color:'#94a3b8' }}>{d.reports}</span>
                  <span style={{ color:clr(parseFloat(score)), fontWeight:600 }}>{score}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
