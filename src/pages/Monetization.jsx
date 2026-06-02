import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, CreditCard, Check, X, Zap, Shield, Users,
  BarChart3, Globe, Upload, RefreshCw, AlertTriangle,
  CheckCircle, Star, TrendingUp, Database, Clock,
  Download, ChevronRight, Settings, Eye, Palette
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import './Monetization.css'

// ─────────────────────────────────────────────────────────────
// PLANS DATA
// ─────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 99,
    period: 'month',
    description: 'Perfect for small teams getting started with financial compliance',
    color: '#3b82f6',
    popular: false,
    limits: { users: 5, reports: 50, domains: 2, apiCalls: 10000, storage: 5 },
    features: [
      { label: '5 Users',                   included: true  },
      { label: '50 Reports',                included: true  },
      { label: '2 Business Domains',        included: true  },
      { label: 'Basic Analytics',           included: true  },
      { label: 'Email Support',             included: true  },
      { label: 'Compliance Calendar',       included: true  },
      { label: 'AI Copilot',               included: false },
      { label: 'Predictive Analytics',      included: false },
      { label: 'White Label',              included: false },
      { label: 'API Access',               included: false },
      { label: 'Custom Integrations',      included: false },
      { label: 'Dedicated Support',        included: false },
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 299,
    period: 'month',
    description: 'For growing businesses that need advanced analytics and AI features',
    color: '#8b5cf6',
    popular: true,
    limits: { users: 25, reports: 250, domains: 8, apiCalls: 100000, storage: 50 },
    features: [
      { label: '25 Users',                  included: true  },
      { label: '250 Reports',               included: true  },
      { label: '8 Business Domains',        included: true  },
      { label: 'Advanced Analytics',        included: true  },
      { label: 'Priority Support',          included: true  },
      { label: 'Compliance Calendar',       included: true  },
      { label: 'AI Copilot',               included: true  },
      { label: 'Predictive Analytics',      included: true  },
      { label: 'White Label',              included: false },
      { label: 'API Access',               included: true  },
      { label: 'Custom Integrations',      included: false },
      { label: 'Dedicated Support',        included: false },
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    period: 'month',
    description: 'Full-featured platform for large enterprises with unlimited scale',
    color: '#10b981',
    popular: false,
    limits: { users: -1, reports: -1, domains: 13, apiCalls: -1, storage: 500 },
    features: [
      { label: 'Unlimited Users',           included: true  },
      { label: 'Unlimited Reports',         included: true  },
      { label: 'All 13 Domains',           included: true  },
      { label: 'Executive Reporting',       included: true  },
      { label: 'Dedicated Support',        included: true  },
      { label: 'Compliance Calendar',       included: true  },
      { label: 'AI Copilot',               included: true  },
      { label: 'Predictive Analytics',      included: true  },
      { label: 'White Label',              included: true  },
      { label: 'API Access',               included: true  },
      { label: 'Custom Integrations',      included: true  },
      { label: 'SLA 99.9%',               included: true  },
    ]
  }
]

const CURRENT_PLAN = 'professional'

// ─────────────────────────────────────────────────────────────
// BILLING DATA
// ─────────────────────────────────────────────────────────────
const INVOICES = [
  { id:'INV-2026-05', date:'2026-05-01', amount:299, status:'paid',    period:'May 2026'   },
  { id:'INV-2026-04', date:'2026-04-01', amount:299, status:'paid',    period:'Apr 2026'   },
  { id:'INV-2026-03', date:'2026-03-01', amount:299, status:'paid',    period:'Mar 2026'   },
  { id:'INV-2026-02', date:'2026-02-01', amount:299, status:'paid',    period:'Feb 2026'   },
  { id:'INV-2026-01', date:'2026-01-01', amount:299, status:'paid',    period:'Jan 2026'   },
  { id:'INV-2025-12', date:'2025-12-01', amount:99,  status:'paid',    period:'Dec 2025'   },
]

const USAGE = {
  users:    { used: 18, limit: 25, label: 'Users',        icon: Users,    color: '#3b82f6' },
  reports:  { used: 187, limit: 250, label: 'Reports',    icon: BarChart3,color: '#10b981' },
  apiCalls: { used: 67420, limit: 100000, label: 'API Calls', icon: Zap, color: '#f59e0b' },
  storage:  { used: 23.4, limit: 50, label: 'Storage (GB)', icon: Database, color: '#8b5cf6' },
}

// ─────────────────────────────────────────────────────────────
// TRIAL DATA
// ─────────────────────────────────────────────────────────────
const TRIALS = [
  { id:1, tenant:'Acme Corp',         plan:'Enterprise', startDate:'2026-05-05', endDate:'2026-06-04', daysLeft:16, users:8,  status:'active',  contact:'john@acmecorp.com'   },
  { id:2, tenant:'TechVentures Ltd',  plan:'Professional',startDate:'2026-05-10', endDate:'2026-06-09', daysLeft:21, users:4,  status:'active',  contact:'sarah@techventures.com'},
  { id:3, tenant:'FinServ Global',    plan:'Enterprise', startDate:'2026-04-20', endDate:'2026-05-19', daysLeft:0,  users:12, status:'expired', contact:'mike@finserv.com'    },
  { id:4, tenant:'DataDriven Inc',    plan:'Starter',    startDate:'2026-05-14', endDate:'2026-06-13', daysLeft:25, users:2,  status:'active',  contact:'lisa@datadriven.com' },
  { id:5, tenant:'RegTech Partners',  plan:'Professional',startDate:'2026-05-01', endDate:'2026-05-31', daysLeft:12, users:6,  status:'active',  contact:'tom@regtech.com'     },
]

// ─────────────────────────────────────────────────────────────
// USAGE CHARTS DATA
// ─────────────────────────────────────────────────────────────
const API_USAGE_CHART = [
  { day:'May 13', calls:4200 }, { day:'May 14', calls:5100 }, { day:'May 15', calls:4800 },
  { day:'May 16', calls:6200 }, { day:'May 17', calls:5500 }, { day:'May 18', calls:7100 },
  { day:'May 19', calls:8420 },
]
const USER_ACTIVITY = [
  { day:'May 13', active:12 }, { day:'May 14', active:15 }, { day:'May 15', active:14 },
  { day:'May 16', active:18 }, { day:'May 17', active:16 }, { day:'May 18', active:17 },
  { day:'May 19', active:18 },
]
const REPORT_GEN = [
  { month:'Dec', count:42 }, { month:'Jan', count:58 }, { month:'Feb', count:71 },
  { month:'Mar', count:89 }, { month:'Apr', count:124 }, { month:'May', count:187 },
]

// ─────────────────────────────────────────────────────────────
// WHITE LABEL DEFAULTS
// ─────────────────────────────────────────────────────────────
const WL_DEFAULTS = {
  companyName:  'Enterprise Finance Platform',
  primaryColor: '#14b8a6',
  secondaryColor: '#3b82f6',
  accentColor:  '#8b5cf6',
  domain:       'finance.yourcompany.com',
  logoText:     'EFP',
  tagline:      'Real-Time Intelligence Platform',
  footerText:   'Powered by Enterprise Finance Suite',
}

// ─────────────────────────────────────────────────────────────
// CUSTOM TOOLTIP
// ─────────────────────────────────────────────────────────────
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:8, padding:'10px 14px', fontSize:12 }}>
      <p style={{ color:'#475569', marginBottom:4, fontWeight:600 }}>{label}</p>
      {payload.map((e,i) => <p key={i} style={{ color:e.color||'#14b8a6', margin:'2px 0' }}>{e.name}: <strong>{e.value?.toLocaleString()}</strong></p>)}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Monetization() {
  const navigate = useNavigate()

  const [activeTab, setActiveTab]   = useState('plans')
  const [billing,   setBilling]     = useState('monthly')
  const [wl,        setWL]          = useState(WL_DEFAULTS)
  const [wlSaved,   setWLSaved]     = useState(false)
  const [toast,     setToast]       = useState(null)

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const currentPlan = PLANS.find(p => p.id === CURRENT_PLAN)
  const discount = billing === 'annual' ? 0.2 : 0

  const saveWhiteLabel = () => {
    setWLSaved(true)
    showToast('White label settings saved successfully!')
    setTimeout(() => setWLSaved(false), 2000)
  }

  const TABS = [
    { id:'plans',   label:'Pricing Plans',    icon: Star      },
    { id:'billing', label:'Billing',          icon: CreditCard },
    { id:'whitelabel',label:'White Label',    icon: Palette   },
    { id:'trials',  label:'Trial Management', icon: Clock     },
    { id:'usage',   label:'Usage Analytics',  icon: BarChart3 },
  ]

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="mon-root">

      {/* Toast */}
      {toast && (
        <div className={`mon-toast ${toast.type}`}>
          <CheckCircle size={14}/> {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mon-header">
        <div className="mon-header-left">
          <button className="mon-back-btn" onClick={()=>navigate('/dashboard')}><ArrowLeft size={14}/> Back</button>
          <div className="mon-title-group">
            <div className="mon-title-icon"><CreditCard size={20}/></div>
            <div>
              <h1 className="mon-title">SaaS Monetization</h1>
              <p className="mon-subtitle">Pricing Plans · Billing · White Label · Trial Management</p>
            </div>
          </div>
        </div>
        <div className="mon-current-plan">
          <span className="mon-plan-badge" style={{ background:`${currentPlan?.color}20`, color:currentPlan?.color, border:`1px solid ${currentPlan?.color}40` }}>
            <Star size={11}/> {currentPlan?.name} Plan
          </span>
          <span className="mon-next-billing"><Clock size={11}/> Next billing: Jun 1, 2026</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="mon-tab-bar">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} className={`mon-tab-btn ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>
              <Icon size={13}/>{t.label}
            </button>
          )
        })}
      </div>

      {/* ── PRICING PLANS ───────────────────────────────────── */}
      {activeTab==='plans' && (
        <div className="mon-content">

          {/* Billing toggle */}
          <div className="mon-billing-toggle">
            <button className={`mon-toggle-btn ${billing==='monthly'?'active':''}`} onClick={()=>setBilling('monthly')}>Monthly</button>
            <button className={`mon-toggle-btn ${billing==='annual'?'active':''}`} onClick={()=>setBilling('annual')}>
              Annual <span className="mon-save-badge">Save 20%</span>
            </button>
          </div>

          {/* Plan Cards */}
          <div className="mon-plans-grid">
            {PLANS.map(plan => {
              const isCurrent  = plan.id === CURRENT_PLAN
              const price      = billing==='annual' ? Math.round(plan.price * 0.8) : plan.price
              return (
                <div key={plan.id} className={`mon-plan-card ${plan.popular?'popular':''} ${isCurrent?'current':''}`} style={{ borderTopColor:plan.color }}>
                  {plan.popular && <div className="mon-popular-badge">Most Popular</div>}
                  {isCurrent   && <div className="mon-current-badge">Current Plan</div>}

                  <div className="mon-plan-header">
                    <div className="mon-plan-name" style={{ color:plan.color }}>{plan.name}</div>
                    <div className="mon-plan-price">
                      <span className="mon-price-currency">$</span>
                      <span className="mon-price-amount">{price}</span>
                      <span className="mon-price-period">/{billing==='annual'?'mo, billed annually':'month'}</span>
                    </div>
                    {billing==='annual' && <div className="mon-annual-saving">Save ${(plan.price - price) * 12}/year</div>}
                    <p className="mon-plan-desc">{plan.description}</p>
                  </div>

                  <div className="mon-plan-limits">
                    {[
                      { key:'users',    label:'Users',       val: plan.limits.users    },
                      { key:'reports',  label:'Reports',     val: plan.limits.reports  },
                      { key:'domains',  label:'Domains',     val: plan.limits.domains  },
                      { key:'apiCalls', label:'API Calls/mo',val: plan.limits.apiCalls },
                      { key:'storage',  label:'Storage',     val: plan.limits.storage  },
                    ].map(l => (
                      <div key={l.key} className="mon-limit-row">
                        <span className="mon-limit-label">{l.label}</span>
                        <span className="mon-limit-val" style={{ color:plan.color }}>
                          {l.val === -1 ? 'Unlimited' : l.key==='storage' ? `${l.val} GB` : l.key==='apiCalls' ? l.val.toLocaleString() : l.val}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mon-plan-features">
                    {plan.features.map((f,i) => (
                      <div key={i} className="mon-feature-row">
                        {f.included
                          ? <CheckCircle size={13} style={{ color:'#10b981', flexShrink:0 }}/>
                          : <X size={13} style={{ color:'#475569', flexShrink:0 }}/>
                        }
                        <span style={{ color: f.included ? '#94a3b8' : '#475569' }}>{f.label}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="mon-plan-btn"
                    style={{
                      background: isCurrent ? 'transparent' : plan.color,
                      border: `1px solid ${plan.color}`,
                      color: isCurrent ? plan.color : '#fff',
                    }}
                    onClick={() => isCurrent ? null : showToast(`Upgrading to ${plan.name}… Contact sales to complete.`)}
                    disabled={isCurrent}
                  >
                    {isCurrent ? '✓ Current Plan' : plan.id==='enterprise' ? 'Contact Sales' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              )
            })}
          </div>

          {/* Feature comparison table */}
          <div className="mon-compare-section">
            <h3 className="mon-compare-title">Full Feature Comparison</h3>
            <div className="mon-compare-table">
              <div className="mon-compare-head">
                <span>Feature</span>
                {PLANS.map(p => <span key={p.id} style={{ color:p.color }}>{p.name}</span>)}
              </div>
              {PLANS[0].features.map((f,i) => (
                <div key={i} className="mon-compare-row">
                  <span className="mon-compare-feature">{f.label}</span>
                  {PLANS.map(p => (
                    <span key={p.id} className="mon-compare-cell">
                      {p.features[i].included
                        ? <CheckCircle size={14} style={{ color:'#10b981' }}/>
                        : <X size={14} style={{ color:'#334155' }}/>
                      }
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── BILLING ─────────────────────────────────────────── */}
      {activeTab==='billing' && (
        <div className="mon-content">

          {/* Current plan summary */}
          <div className="mon-billing-summary">
            <div className="mon-bs-left">
              <div className="mon-bs-plan" style={{ color:currentPlan?.color }}>{currentPlan?.name} Plan</div>
              <div className="mon-bs-price">${currentPlan?.price}<span>/month</span></div>
              <div className="mon-bs-renewal"><Clock size={12}/> Renews June 1, 2026</div>
            </div>
            <div className="mon-bs-right">
              <button className="mon-bs-btn upgrade" onClick={()=>setActiveTab('plans')}>
                <TrendingUp size={13}/> Upgrade Plan
              </button>
              <button className="mon-bs-btn" onClick={()=>showToast('Cancellation — please contact support')}>
                Cancel Subscription
              </button>
            </div>
          </div>

          {/* Usage Meters */}
          <div className="mon-usage-section">
            <h3 className="mon-section-title"><BarChart3 size={14}/> Current Usage</h3>
            <div className="mon-usage-grid">
              {Object.entries(USAGE).map(([key, u]) => {
                const Icon = u.icon
                const pct  = u.limit === -1 ? 0 : (u.used / u.limit) * 100
                const warn = pct > 80
                const crit = pct > 95
                return (
                  <div key={key} className="mon-usage-card">
                    <div className="mon-usage-header">
                      <div className="mon-usage-icon" style={{ background:`${u.color}22`, color:u.color }}><Icon size={16}/></div>
                      <div>
                        <div className="mon-usage-label">{u.label}</div>
                        <div className="mon-usage-val">
                          <span style={{ color: crit?'#ef4444':warn?'#f59e0b':u.color, fontWeight:700 }}>
                            {typeof u.used === 'number' && u.used > 1000 ? u.used.toLocaleString() : u.used}
                          </span>
                          <span style={{ color:'#475569' }}>
                            {' / '}{u.limit === -1 ? '∞' : typeof u.limit === 'number' && u.limit > 1000 ? u.limit.toLocaleString() : u.limit}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize:12, fontWeight:700, color:crit?'#ef4444':warn?'#f59e0b':'#64748b', marginLeft:'auto' }}>
                        {u.limit === -1 ? '∞' : `${pct.toFixed(0)}%`}
                      </span>
                    </div>
                    <div className="mon-usage-bar">
                      <div className="mon-usage-fill" style={{ width:`${Math.min(100,pct)}%`, background:crit?'#ef4444':warn?'#f59e0b':u.color }}/>
                    </div>
                    {warn && !crit && <div className="mon-usage-warn"><AlertTriangle size={11}/> Approaching limit</div>}
                    {crit && <div className="mon-usage-crit"><AlertTriangle size={11}/> Near limit — upgrade recommended</div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div className="mon-payment-section">
            <h3 className="mon-section-title"><CreditCard size={14}/> Payment Method</h3>
            <div className="mon-payment-card">
              <div className="mon-payment-card-icon">💳</div>
              <div>
                <div className="mon-payment-card-num">Visa ending in •••• 4242</div>
                <div className="mon-payment-card-exp">Expires 08/2028</div>
              </div>
              <button className="mon-update-card-btn" onClick={()=>showToast('Card update — redirect to payment portal')}>Update Card</button>
            </div>
          </div>

          {/* Invoice History */}
          <div className="mon-invoices-section">
            <h3 className="mon-section-title"><Download size={14}/> Invoice History</h3>
            <div className="mon-invoices-table">
              <div className="mon-inv-head">
                <span>Invoice</span><span>Period</span><span>Date</span><span>Amount</span><span>Status</span><span>Action</span>
              </div>
              {INVOICES.map(inv => (
                <div key={inv.id} className="mon-inv-row">
                  <span className="mon-inv-id">{inv.id}</span>
                  <span className="mon-inv-period">{inv.period}</span>
                  <span className="mon-inv-date">{inv.date}</span>
                  <span className="mon-inv-amount">${inv.amount}</span>
                  <span className="mon-inv-status paid"><CheckCircle size={11}/> {inv.status}</span>
                  <button className="mon-inv-download" onClick={()=>showToast(`Downloading ${inv.id}...`)}><Download size={12}/> PDF</button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── WHITE LABEL ─────────────────────────────────────── */}
      {activeTab==='whitelabel' && (
        <div className="mon-content">
          <div className="mon-wl-layout">

            {/* Controls */}
            <div className="mon-wl-controls">
              <div className="mon-wl-section-title"><Settings size={13}/> Brand Settings</div>

              {[
                { label:'Company Name',  key:'companyName',    type:'text',  placeholder:'Your Company Name' },
                { label:'Tagline',       key:'tagline',        type:'text',  placeholder:'Your platform tagline' },
                { label:'Custom Domain', key:'domain',         type:'text',  placeholder:'app.yourcompany.com' },
                { label:'Logo Text',     key:'logoText',       type:'text',  placeholder:'Abbrev e.g. EFP' },
                { label:'Footer Text',   key:'footerText',     type:'text',  placeholder:'Powered by...' },
              ].map(f => (
                <div key={f.key} className="mon-wl-field">
                  <label className="mon-wl-label">{f.label}</label>
                  <input className="mon-wl-input" type={f.type} placeholder={f.placeholder}
                    value={wl[f.key]} onChange={e=>setWL(p=>({...p,[f.key]:e.target.value}))}/>
                </div>
              ))}

              <div className="mon-wl-colors">
                <div className="mon-wl-label">Brand Colors</div>
                {[
                  { label:'Primary',   key:'primaryColor'   },
                  { label:'Secondary', key:'secondaryColor' },
                  { label:'Accent',    key:'accentColor'    },
                ].map(c => (
                  <div key={c.key} className="mon-color-row">
                    <label className="mon-color-label">{c.label}</label>
                    <div className="mon-color-input-wrap">
                      <input type="color" className="mon-color-picker" value={wl[c.key]} onChange={e=>setWL(p=>({...p,[c.key]:e.target.value}))}/>
                      <input type="text" className="mon-color-text" value={wl[c.key]} onChange={e=>setWL(p=>({...p,[c.key]:e.target.value}))}/>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mon-wl-field">
                <label className="mon-wl-label">Logo Upload</label>
                <div className="mon-logo-upload">
                  <Upload size={20} style={{ color:'#475569' }}/>
                  <span>Click to upload logo</span>
                  <span style={{ fontSize:10, color:'#475569' }}>PNG, SVG up to 2MB</span>
                </div>
              </div>

              <button className="mon-save-wl-btn" onClick={saveWhiteLabel}>
                {wlSaved ? <><CheckCircle size={14}/> Saved!</> : <><Eye size={14}/> Save & Apply</>}
              </button>
            </div>

            {/* Live Preview */}
            <div className="mon-wl-preview">
              <div className="mon-wl-preview-label"><Eye size={12}/> Live Preview</div>

              <div className="mon-preview-frame">
                {/* Preview Header */}
                <div className="mon-prev-header" style={{ background:'#ffffff', borderBottom:'1px solid #e2e8f0' }}>
                  <div className="mon-prev-brand">
                    <div className="mon-prev-logo" style={{ background:wl.primaryColor }}>
                      <span style={{ fontSize:10, fontWeight:700, color:'#fff' }}>{wl.logoText}</span>
                    </div>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:wl.primaryColor }}>{wl.companyName}</div>
                      <div style={{ fontSize:9, color:'#64748b' }}>{wl.tagline}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    {['Dashboard','Analytics','Reports'].map(b => (
                      <div key={b} style={{ fontSize:9, padding:'3px 8px', background:`${wl.primaryColor}20`, color:wl.primaryColor, borderRadius:4 }}>{b}</div>
                    ))}
                  </div>
                </div>

                {/* Preview Sidebar */}
                <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
                  <div style={{ width:100, background:'#f8fafc', borderRight:'1px solid #e2e8f0', padding:8, display:'flex', flexDirection:'column', gap:4 }}>
                    {['Finance','HR','Operations','Audit','Risk'].map(d => (
                      <div key={d} style={{ fontSize:9, padding:'4px 6px', background:'#ffffff', borderRadius:4, color:'#64748b', borderLeft:`2px solid ${wl.primaryColor}` }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ flex:1, padding:10, display:'flex', flexDirection:'column', gap:6 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:'#1e293b' }}>Dashboard Overview</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
                      {[
                        { label:'Reports', val:'500', color:wl.primaryColor },
                        { label:'Domains', val:'13',  color:wl.secondaryColor },
                        { label:'Compliance', val:'94%', color:wl.accentColor },
                        { label:'Risk Score', val:'24',  color:'#f59e0b' },
                      ].map(k => (
                        <div key={k.label} style={{ background:'#ffffff', border:`1px solid #334155`, borderTop:`2px solid ${k.color}`, borderRadius:4, padding:'6px 8px' }}>
                          <div style={{ fontSize:14, fontWeight:800, color:k.color }}>{k.val}</div>
                          <div style={{ fontSize:8, color:'#64748b' }}>{k.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview Footer */}
                <div style={{ padding:'6px 10px', borderTop:'1px solid #e2e8f0', background:'#f8fafc', fontSize:9, color:'#475569', textAlign:'center' }}>
                  {wl.footerText} · {wl.domain}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TRIAL MANAGEMENT ────────────────────────────────── */}
      {activeTab==='trials' && (
        <div className="mon-content">

          {/* Trial Stats */}
          <div className="mon-trial-stats">
            {[
              { label:'Active Trials',   value: TRIALS.filter(t=>t.status==='active').length,  color:'#10b981' },
              { label:'Expired Trials',  value: TRIALS.filter(t=>t.status==='expired').length, color:'#ef4444' },
              { label:'Trial Users',     value: TRIALS.reduce((s,t)=>s+t.users,0),             color:'#3b82f6' },
              { label:'Conversion Rate', value: '42%',                                          color:'#8b5cf6' },
            ].map((s,i) => (
              <div key={i} className="mon-trial-stat" style={{ borderTopColor:s.color }}>
                <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:11, color:'#64748b', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.3px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Trials List */}
          <div className="mon-trials-table-wrap">
            <div className="mon-trials-head">
              <span>Tenant</span><span>Plan</span><span>Contact</span>
              <span>Start</span><span>End</span><span>Days Left</span>
              <span>Users</span><span>Status</span><span>Action</span>
            </div>
            {TRIALS.map(t => (
              <div key={t.id} className="mon-trial-row">
                <span className="mon-trial-tenant">{t.tenant}</span>
                <span className="mon-trial-plan">{t.plan}</span>
                <span className="mon-trial-contact">{t.contact}</span>
                <span style={{ fontSize:11, color:'#64748b' }}>{t.startDate}</span>
                <span style={{ fontSize:11, color:'#64748b' }}>{t.endDate}</span>
                <span style={{ fontSize:12, fontWeight:700, color:t.daysLeft===0?'#ef4444':t.daysLeft<=7?'#f59e0b':'#10b981' }}>
                  {t.daysLeft===0 ? 'Expired' : `${t.daysLeft}d`}
                </span>
                <span style={{ fontSize:12, color:'#475569' }}>{t.users}</span>
                <span className={`mon-trial-status ${t.status}`}>{t.status}</span>
                <div style={{ display:'flex', gap:4 }}>
                  <button className="mon-trial-btn extend" onClick={()=>showToast(`Trial extended for ${t.tenant}`)}>Extend</button>
                  <button className="mon-trial-btn convert" onClick={()=>showToast(`Converting ${t.tenant} to paid`)}>Convert</button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Trial */}
          <div className="mon-new-trial">
            <div style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:12 }}>Start New Trial</div>
            <div className="mon-new-trial-form">
              <input className="mon-wl-input" placeholder="Tenant / Company name"/>
              <input className="mon-wl-input" placeholder="Contact email"/>
              <select className="mon-wl-input">
                {PLANS.map(p=><option key={p.id}>{p.name}</option>)}
              </select>
              <select className="mon-wl-input">
                {[14,21,30,45,60].map(d=><option key={d}>{d} days</option>)}
              </select>
              <button className="mon-save-wl-btn" style={{ margin:0 }} onClick={()=>showToast('Trial created and invitation sent!')}>
                <Zap size={13}/> Start Trial
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ── USAGE ANALYTICS ─────────────────────────────────── */}
      {activeTab==='usage' && (
        <div className="mon-content">

          {/* Summary stats */}
          <div className="mon-usage-summary">
            {[
              { label:'API Calls (7 days)', value:'41,370',  trend:'+18%',  color:'#f59e0b', icon:Zap      },
              { label:'Active Users',        value:'18',      trend:'+2',    color:'#3b82f6', icon:Users    },
              { label:'Reports Generated',   value:'187',     trend:'+51%',  color:'#10b981', icon:BarChart3},
              { label:'Storage Used',        value:'23.4 GB', trend:'+2.1',  color:'#8b5cf6', icon:Database },
            ].map((s,i) => {
              const Icon = s.icon
              return (
                <div key={i} className="mon-usage-summary-card" style={{ borderTopColor:s.color }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ width:34, height:34, background:`${s.color}22`, color:s.color, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}><Icon size={16}/></div>
                    <span style={{ fontSize:11, fontWeight:600, padding:'2px 7px', background:`${s.color}18`, color:s.color, borderRadius:20 }}>{s.trend}</span>
                  </div>
                  <div style={{ fontSize:22, fontWeight:800, color:'#1e293b', lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:11, color:'#64748b', marginTop:4 }}>{s.label}</div>
                </div>
              )
            })}
          </div>

          {/* Charts */}
          <div className="mon-usage-charts">
            <div className="mon-chart-card">
              <div className="mon-chart-header">API Calls — Last 7 Days</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={API_USAGE_CHART} margin={{ top:10,right:16,left:0,bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="day" tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
                  <YAxis tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
                  <Tooltip content={<ChartTip/>}/>
                  <Line type="monotone" dataKey="calls" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill:'#f59e0b', r:3 }} name="API Calls"/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mon-chart-card">
              <div className="mon-chart-header">Active Users — Last 7 Days</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={USER_ACTIVITY} margin={{ top:10,right:16,left:0,bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="day" tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
                  <YAxis tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
                  <Tooltip content={<ChartTip/>}/>
                  <Line type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill:'#3b82f6', r:3 }} name="Active Users"/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mon-chart-card">
              <div className="mon-chart-header">Reports Generated — Last 6 Months</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={REPORT_GEN} margin={{ top:10,right:16,left:0,bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="month" tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
                  <YAxis tick={{ fill:'#64748b', fontSize:10 }} tickLine={false}/>
                  <Tooltip content={<ChartTip/>}/>
                  <Bar dataKey="count" fill="#10b981" radius={[4,4,0,0]} name="Reports"/>
                </BarChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Limit warnings */}
          <div className="mon-limit-alerts">
            <div style={{ fontSize:13, fontWeight:700, color:'#1e293b', marginBottom:12 }}>Limit Alerts</div>
            {Object.entries(USAGE).map(([key, u]) => {
              const pct = u.limit === -1 ? 0 : (u.used / u.limit) * 100
              if (pct < 70) return null
              return (
                <div key={key} className={`mon-limit-alert ${pct>90?'critical':'warning'}`}>
                  <AlertTriangle size={13}/>
                  <span><strong>{u.label}</strong> is at {pct.toFixed(0)}% capacity — {pct>90?'upgrade strongly recommended':'consider upgrading soon'}</span>
                  <button className="mon-alert-upgrade" onClick={()=>setActiveTab('plans')}>View Plans <ChevronRight size={11}/></button>
                </div>
              )
            })}
          </div>

        </div>
      )}

    </div>
  )
}

