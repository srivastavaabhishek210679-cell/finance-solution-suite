import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { REPORTS_DATA } from '../data/reportsData'
import {
  ArrowLeft, BarChart3, TrendingUp, TrendingDown, Target,
  FileText, Calendar, Layers, GitCompare, Maximize2, Minimize2,
  CheckCircle, AlertTriangle, Shield, DollarSign, Users, Activity,
  ChevronRight, ChevronDown, RefreshCw, Download, Zap, Eye,
  Award, Clock, Building2, Globe
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import ReportSummaryGenerator from '../components/ReportSummaryGenerator'
import ScheduledReports       from '../components/ScheduledReports'
import './ExecutiveReporting.css'

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────

const EXEC_KPIS = [
  { label:'Total Reports',      value: REPORTS_DATA.length, target:550, unit:'',   trend:'+8.2%',  trendUp:true,  color:'#3b82f6', icon:FileText    },
  { label:'Compliance Rate',    value:'94.2',               target:95,  unit:'%',  trend:'+4.1%',  trendUp:true,  color:'#10b981', icon:CheckCircle  },
  { label:'Active Domains',     value:13,                   target:13,  unit:'',   trend:'Full',   trendUp:true,  color:'#14b8a6', icon:Globe        },
  { label:'Required Reports',   value: REPORTS_DATA.filter(r=>(r.complianceStatus||r.compliance_status)==='Required').length,
                                                            target:350, unit:'',   trend:'+3.2%',  trendUp:true,  color:'#8b5cf6', icon:Shield       },
  { label:'Risk Score',         value:'24.8',               target:30,  unit:'',   trend:'-5.3',   trendUp:true,  color:'#f59e0b', icon:AlertTriangle },
  { label:'Automation Rate',    value:'0.0',                target:40,  unit:'%',  trend:'+12%',   trendUp:true,  color:'#ec4899', icon:Zap          },
]

const DOMAIN_PERFORMANCE = [
  { domain:'Finance',      compliance:94, efficiency:88, risk:18, reports:125, color:'#14b8a6' },
  { domain:'Tax',          compliance:91, efficiency:82, risk:24, reports:87,  color:'#6366f1' },
  { domain:'Operations',   compliance:87, efficiency:91, risk:31, reports:64,  color:'#f59e0b' },
  { domain:'Audit',        compliance:98, efficiency:79, risk:12, reports:52,  color:'#ef4444' },
  { domain:'Risk',         compliance:89, efficiency:85, risk:28, reports:41,  color:'#fb7185' },
  { domain:'Treasury',     compliance:96, efficiency:90, risk:15, reports:35,  color:'#22d3ee' },
  { domain:'HR',           compliance:85, efficiency:88, risk:22, reports:28,  color:'#10b981' },
  { domain:'Legal',        compliance:93, efficiency:76, risk:19, reports:23,  color:'#a855f7' },
  { domain:'IT',           compliance:97, efficiency:94, risk:14, reports:19,  color:'#3b82f6' },
  { domain:'Sales',        compliance:82, efficiency:86, risk:27, reports:15,  color:'#8b5cf6' },
  { domain:'Supply Chain', compliance:88, efficiency:83, risk:33, reports:8,   color:'#f97316' },
  { domain:'ESG',          compliance:79, efficiency:71, risk:21, reports:3,   color:'#84cc16' },
]

const REVENUE_TREND = [
  { month:'Jul 25', actual:8.2  },
  { month:'Aug 25', actual:9.1  },
  { month:'Sep 25', actual:8.7  },
  { month:'Oct 25', actual:10.2 },
  { month:'Nov 25', actual:11.5 },
  { month:'Dec 25', actual:12.8 },
  { month:'Jan 26', actual:13.4 },
  { month:'Feb 26', actual:14.1 },
  { month:'Mar 26', actual:15.0 },
  { month:'Apr 26', actual:15.8 },
  { month:'May 26', actual:16.9 },
]

const HIGHLIGHTS = [
  { type:'positive', text:'Compliance rate improved to 94.2% — highest in 3 quarters' },
  { type:'positive', text:'IT domain leads with 97% compliance and lowest risk score' },
  { type:'warning',  text:'ESG domain at 79% compliance — requires immediate attention' },
  { type:'positive', text:'Revenue trend shows consistent month-over-month growth of 8.2%' },
  { type:'warning',  text:'Sales domain automation rate is below target — review recommended' },
]

// Drill-down data
const DRILL_TREE = DOMAIN_PERFORMANCE.map(d => ({
  ...d,
  subMetrics: [
    { label:'Required Reports', value: Math.floor(d.reports * 0.68) },
    { label:'Optional Reports', value: Math.floor(d.reports * 0.32) },
    { label:'Daily Reports',    value: Math.floor(d.reports * 0.15) },
    { label:'Monthly Reports',  value: Math.floor(d.reports * 0.42) },
    { label:'Quarterly Reports',value: Math.floor(d.reports * 0.28) },
  ],
  reports: REPORTS_DATA.filter(r => (r.domain || 'Other') === d.domain).slice(0, 10)
}))

// ─────────────────────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:8, padding:'10px 14px', fontSize:12 }}>
      <p style={{ color:'#94a3b8', marginBottom:6, fontWeight:600 }}>{label}</p>
      {payload.map((e, i) => (
        <p key={i} style={{ color:e.color, margin:'3px 0' }}>{e.name}: <strong>{e.value}</strong></p>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
function ExecutiveReporting() {
  const navigate = useNavigate()

  const [activeTab,     setActiveTab]     = useState('executive')
  const [boardroomMode, setBoardroomMode] = useState(false)
  const [drillDomain,   setDrillDomain]   = useState(null)
  const [drillMetric,   setDrillMetric]   = useState(null)
  const [benchDomains,  setBenchDomains]  = useState(['Finance', 'Tax', 'HR'])
  const [benchMetric,   setBenchMetric]   = useState('compliance')

  const TABS = [
    { id:'executive',   label:'Executive Dashboard', icon:BarChart3    },
    { id:'summaries',   label:'Report Summaries',    icon:FileText     },
    { id:'scheduled',   label:'Scheduled Reports',   icon:Calendar     },
    { id:'drilldown',   label:'Drill-Down Explorer', icon:Layers       },
    { id:'benchmark',   label:'Benchmarking',        icon:GitCompare   },
  ]

  const benchData = DOMAIN_PERFORMANCE.filter(d => benchDomains.includes(d.domain))

  const radarData = benchData.map(d => ({
    domain:     d.domain.length > 8 ? d.domain.slice(0,8) : d.domain,
    Compliance: d.compliance,
    Efficiency: d.efficiency,
    Safety:     100 - d.risk,
  }))

  const toggleBenchDomain = (domain) => {
    setBenchDomains(prev =>
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : prev.length < 5 ? [...prev, domain] : prev
    )
  }

  // ── TAB: EXECUTIVE DASHBOARD ────────────────────────────────
  const renderExecutive = () => (
    <div className={`er-exec ${boardroomMode ? 'boardroom' : ''}`}>

      {/* Boardroom toggle */}
      <div className="er-exec-toolbar">
        <div>
          <h2 className="er-exec-title">Executive Dashboard</h2>
          <p className="er-exec-sub">Real-time boardroom intelligence · {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
        <button className="er-boardroom-btn" onClick={() => setBoardroomMode(!boardroomMode)}>
          {boardroomMode ? <><Minimize2 size={13}/> Exit Boardroom</> : <><Maximize2 size={13}/> Boardroom Mode</>}
        </button>
      </div>

      {/* KPI Scorecards */}
      <div className="er-kpi-grid">
        {EXEC_KPIS.map((kpi, i) => {
          const Icon = kpi.icon
          const pct  = kpi.target ? Math.min(100, (parseFloat(kpi.value) / kpi.target) * 100) : 100
          return (
            <div key={i} className="er-kpi-card" style={{ borderTopColor: kpi.color }}>
              <div className="er-kpi-top">
                <div className="er-kpi-icon" style={{ background:`${kpi.color}22`, color:kpi.color }}>
                  <Icon size={16}/>
                </div>
                <span className={`er-kpi-trend ${kpi.trendUp ? 'up' : 'down'}`}>
                  {kpi.trendUp ? <TrendingUp size={11}/> : <TrendingDown size={11}/>} {kpi.trend}
                </span>
              </div>
              <div className="er-kpi-value" style={{ color: kpi.color }}>{kpi.value}{kpi.unit}</div>
              <div className="er-kpi-label">{kpi.label}</div>
              <div className="er-kpi-bar">
                <div className="er-kpi-bar-fill" style={{ width:`${pct}%`, background:kpi.color }}/>
              </div>
              <div className="er-kpi-target">Target: {kpi.target}{kpi.unit}</div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="er-charts-row">

        {/* Revenue trend */}
        <div className="er-chart-card">
          <div className="er-chart-header">
            <span className="er-chart-title"><TrendingUp size={14}/> Revenue Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={REVENUE_TREND} margin={{ top:10, right:16, left:0, bottom:0 }}>
              <defs>
                <linearGradient id="revLine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
              <XAxis dataKey="month" tick={{ fill:'#64748b', fontSize:10 }} axisLine={{ stroke:'#334155' }} tickLine={false}/>
              <YAxis tick={{ fill:'#64748b', fontSize:10 }} axisLine={{ stroke:'#334155' }} tickLine={false} tickFormatter={v=>`$${v}M`}/>
              <Tooltip content={<ChartTip/>}/>
              <Line type="monotone" dataKey="actual" stroke="#14b8a6" strokeWidth={2.5} dot={{ fill:'#14b8a6', r:3 }} name="Revenue ($M)"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance by domain */}
        <div className="er-chart-card">
          <div className="er-chart-header">
            <span className="er-chart-title"><Shield size={14}/> Compliance by Domain</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DOMAIN_PERFORMANCE.slice(0,8)} layout="vertical" margin={{ top:5, right:16, left:60, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
              <XAxis type="number" domain={[0,100]} tick={{ fill:'#64748b', fontSize:10 }} tickLine={false} tickFormatter={v=>`${v}%`}/>
              <YAxis dataKey="domain" type="category" tick={{ fill:'#94a3b8', fontSize:10 }} tickLine={false} width={58}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey="compliance" name="Compliance %" radius={[0,3,3,0]}>
                {DOMAIN_PERFORMANCE.slice(0,8).map((d,i) => <Cell key={i} fill={d.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Key Highlights */}
      <div className="er-highlights">
        <div className="er-highlights-title"><Award size={14}/> Key Highlights</div>
        <div className="er-highlights-list">
          {HIGHLIGHTS.map((h, i) => (
            <div key={i} className={`er-highlight-item ${h.type}`}>
              {h.type === 'positive'
                ? <CheckCircle size={13} style={{ color:'#10b981', flexShrink:0 }}/>
                : <AlertTriangle size={13} style={{ color:'#f59e0b', flexShrink:0 }}/>
              }
              <span>{h.text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )

  // ── TAB: DRILL-DOWN ──────────────────────────────────────────
  const renderDrillDown = () => {
    const selected = drillDomain ? DRILL_TREE.find(d => d.domain === drillDomain) : null

    return (
      <div className="er-drilldown">
        <div className="er-dd-header">
          <h2 className="er-exec-title">Drill-Down Explorer</h2>
          <p className="er-exec-sub">Click any domain to explore sub-metrics and individual reports</p>
        </div>

        {/* Breadcrumb */}
        <div className="er-breadcrumb">
          <button className="er-bc-item root" onClick={() => { setDrillDomain(null); setDrillMetric(null) }}>
            All Domains
          </button>
          {drillDomain && <><ChevronRight size={12} style={{ color:'#475569' }}/><span className="er-bc-item active">{drillDomain}</span></>}
          {drillMetric && <><ChevronRight size={12} style={{ color:'#475569' }}/><span className="er-bc-item active">{drillMetric}</span></>}
        </div>

        {!drillDomain && (
          <div className="er-dd-domains">
            {DRILL_TREE.map(d => (
              <button key={d.domain} className="er-dd-domain-card" onClick={() => setDrillDomain(d.domain)} style={{ borderTopColor: d.color }}>
                <div className="er-dd-domain-top">
                  <span className="er-dd-domain-name">{d.domain}</span>
                  <span className="er-dd-domain-count" style={{ color:d.color }}>{d.reports} reports</span>
                </div>
                <div className="er-dd-domain-metrics">
                  <span style={{ color:'#10b981' }}>Compliance {d.compliance}%</span>
                  <span style={{ color:'#3b82f6' }}>Efficiency {d.efficiency}%</span>
                  <span style={{ color: d.risk > 30 ? '#ef4444' : '#f59e0b' }}>Risk {d.risk}</span>
                </div>
                <div className="er-dd-bar">
                  <div style={{ width:`${d.compliance}%`, background:d.color, height:'100%', borderRadius:2 }}/>
                </div>
                <div className="er-dd-explore"><Eye size={11}/> Explore <ChevronRight size={11}/></div>
              </button>
            ))}
          </div>
        )}

        {drillDomain && selected && !drillMetric && (
          <div className="er-dd-detail">
            <div className="er-dd-sub-grid">
              {selected.subMetrics.map((m, i) => (
                <button key={i} className="er-dd-sub-card" onClick={() => setDrillMetric(m.label)}>
                  <div className="er-dd-sub-value" style={{ color:selected.color }}>{m.value}</div>
                  <div className="er-dd-sub-label">{m.label}</div>
                  <ChevronRight size={12} style={{ color:'#475569', marginTop:4 }}/>
                </button>
              ))}
            </div>
            <div className="er-dd-reports-section">
              <div className="er-dd-reports-title"><FileText size={13}/> Sample {drillDomain} Reports</div>
              {selected.reports.slice(0,8).map((r, i) => (
                <div key={i} className="er-dd-report-row" style={{ borderLeftColor:selected.color }}>
                  <span className="er-dd-report-name">{r.name || r.report_name}</span>
                  <span className="er-dd-report-freq">{r.frequency}</span>
                  <span className={`er-dd-report-status ${(r.complianceStatus||r.compliance_status||'').toLowerCase()}`}>
                    {r.complianceStatus || r.compliance_status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {drillMetric && selected && (
          <div className="er-dd-metric-view">
            <div className="er-dd-metric-title">
              <span style={{ color:selected.color }}>{drillDomain}</span> → {drillMetric}
            </div>
            <div className="er-dd-metric-chart">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={selected.subMetrics} margin={{ top:10, right:20, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="label" tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
                  <YAxis tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
                  <Tooltip content={<ChartTip/>}/>
                  <Bar dataKey="value" name="Count" radius={[4,4,0,0]} fill={selected.color}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── TAB: BENCHMARKING ────────────────────────────────────────
  const renderBenchmarking = () => (
    <div className="er-bench">
      <div className="er-dd-header">
        <h2 className="er-exec-title">Domain Benchmarking</h2>
        <p className="er-exec-sub">Compare performance across domains — select up to 5</p>
      </div>

      {/* Domain selector */}
      <div className="er-bench-selector">
        {DOMAIN_PERFORMANCE.map(d => (
          <button
            key={d.domain}
            className={`er-bench-domain-btn ${benchDomains.includes(d.domain) ? 'selected' : ''}`}
            style={benchDomains.includes(d.domain) ? { borderColor:d.color, background:`${d.color}18`, color:d.color } : {}}
            onClick={() => toggleBenchDomain(d.domain)}
          >
            {d.domain}
          </button>
        ))}
      </div>

      {/* Metric selector */}
      <div className="er-bench-metric-row">
        <span className="er-bench-metric-label">Compare by:</span>
        {[
          { key:'compliance', label:'Compliance %' },
          { key:'efficiency', label:'Efficiency %' },
          { key:'risk',       label:'Risk Score'   },
          { key:'reports',    label:'Report Count' },
        ].map(m => (
          <button
            key={m.key}
            className={`er-bench-metric-btn ${benchMetric === m.key ? 'active' : ''}`}
            onClick={() => setBenchMetric(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="er-bench-charts">

        {/* Bar comparison */}
        <div className="er-chart-card">
          <div className="er-chart-header">
            <span className="er-chart-title"><BarChart3 size={14}/> {benchMetric.charAt(0).toUpperCase()+benchMetric.slice(1)} Comparison</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={benchData} margin={{ top:10, right:20, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
              <XAxis dataKey="domain" tick={{ fill:'#94a3b8', fontSize:10 }} tickLine={false}/>
              <YAxis tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
              <Tooltip content={<ChartTip/>}/>
              <Bar dataKey={benchMetric} name={benchMetric} radius={[4,4,0,0]}>
                {benchData.map((d,i) => <Cell key={i} fill={d.color}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="er-chart-card">
          <div className="er-chart-header">
            <span className="er-chart-title"><Globe size={14}/> Multi-Dimension Radar</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData} margin={{ top:10, right:20, left:20, bottom:10 }}>
              <PolarGrid stroke="#334155"/>
              <PolarAngleAxis dataKey="domain" tick={{ fill:'#94a3b8', fontSize:10 }}/>
              <PolarRadiusAxis angle={90} domain={[0,100]} tick={{ fill:'#64748b', fontSize:9 }}/>
              <Radar name="Compliance" dataKey="Compliance" stroke="#10b981" fill="#10b981" fillOpacity={0.2}/>
              <Radar name="Efficiency" dataKey="Efficiency" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2}/>
              <Radar name="Safety"     dataKey="Safety"     stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2}/>
              <Legend wrapperStyle={{ color:'#94a3b8', fontSize:11 }}/>
              <Tooltip content={<ChartTip/>}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Benchmark table */}
      <div className="er-bench-table-wrap">
        <div className="er-bench-table-head">
          <span>Domain</span>
          <span>Compliance</span>
          <span>Efficiency</span>
          <span>Risk Score</span>
          <span>Reports</span>
          <span>Overall</span>
        </div>
        {benchData.map((d,i) => {
          const overall = ((d.compliance + d.efficiency + (100-d.risk)) / 3).toFixed(1)
          return (
            <div key={i} className="er-bench-table-row">
              <span className="er-bench-domain-name" style={{ color:d.color }}>{d.domain}</span>
              <span className={`er-bench-cell ${d.compliance >= 90 ? 'good' : d.compliance >= 80 ? 'warn' : 'bad'}`}>{d.compliance}%</span>
              <span className={`er-bench-cell ${d.efficiency >= 85 ? 'good' : d.efficiency >= 75 ? 'warn' : 'bad'}`}>{d.efficiency}%</span>
              <span className={`er-bench-cell ${d.risk <= 20 ? 'good' : d.risk <= 30 ? 'warn' : 'bad'}`}>{d.risk}</span>
              <span className="er-bench-cell neutral">{d.reports}</span>
              <span className={`er-bench-cell ${parseFloat(overall) >= 80 ? 'good' : parseFloat(overall) >= 70 ? 'warn' : 'bad'}`}>{overall}</span>
            </div>
          )
        })}
      </div>

    </div>
  )

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <div className={`er-root ${boardroomMode ? 'boardroom-root' : ''}`}>

      {!boardroomMode && (
        <div className="er-header">
          <div className="er-header-left">
            <button className="er-back-btn" onClick={() => navigate('/dashboard')}>
              <ArrowLeft size={14}/> Back
            </button>
            <div className="er-title-group">
              <div className="er-title-icon"><BarChart3 size={20}/></div>
              <div>
                <h1 className="er-title">Executive Reporting</h1>
                <p className="er-subtitle">Boardroom Intelligence · AI Summaries · Benchmarking · Drill-Down</p>
              </div>
            </div>
          </div>
          <div className="er-header-right">
            <span className="er-data-badge"><Activity size={11}/> {REPORTS_DATA.length} reports · 13 domains</span>
          </div>
        </div>
      )}

      {!boardroomMode && (
        <div className="er-tab-bar">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} className={`er-tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
                <Icon size={13}/>{t.label}
              </button>
            )
          })}
        </div>
      )}

      <div className="er-content">
        {(activeTab === 'executive' || boardroomMode) && renderExecutive()}
        {activeTab === 'summaries'  && !boardroomMode && <ReportSummaryGenerator/>}
        {activeTab === 'scheduled'  && !boardroomMode && <ScheduledReports/>}
        {activeTab === 'drilldown'  && !boardroomMode && renderDrillDown()}
        {activeTab === 'benchmark'  && !boardroomMode && renderBenchmarking()}
      </div>

    </div>
  )
}

export default ExecutiveReporting
