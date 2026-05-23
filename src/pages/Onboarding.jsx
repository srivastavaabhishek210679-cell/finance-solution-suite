import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  CheckCircle, ArrowRight, ArrowLeft, BarChart3, Shield,
  Users, FileText, Zap, Globe, Building2, TrendingUp,
  Briefcase, Scale, Cpu, ShoppingCart, Truck, Leaf, SkipForward
} from 'lucide-react'
import './Onboarding.css'

// ── Domain options ────────────────────────────────────────────────────────────
const DOMAINS = [
  { id:'finance',      label:'Finance',        icon: BarChart3,  color:'#3b82f6' },
  { id:'tax',          label:'Tax',            icon: FileText,   color:'#f59e0b' },
  { id:'operations',   label:'Operations',     icon: Zap,        color:'#10b981' },
  { id:'audit',        label:'Audit',          icon: Shield,     color:'#8b5cf6' },
  { id:'risk',         label:'Risk',           icon: TrendingUp, color:'#ef4444' },
  { id:'treasury',     label:'Treasury',       icon: Building2,  color:'#06b6d4' },
  { id:'hr',           label:'HR',             icon: Users,      color:'#ec4899' },
  { id:'legal',        label:'Legal',          icon: Scale,      color:'#f97316' },
  { id:'it',           label:'IT',             icon: Cpu,        color:'#6366f1' },
  { id:'marketing',    label:'Marketing/Sales',icon: ShoppingCart,color:'#d97706'},
  { id:'supplychain',  label:'Supply Chain',   icon: Truck,      color:'#059669' },
  { id:'esg',          label:'ESG',            icon: Leaf,       color:'#16a34a' },
]

const INDUSTRIES = [
  'Banking & Finance', 'Technology', 'Healthcare', 'Manufacturing',
  'Retail & E-commerce', 'Energy & Utilities', 'Telecommunications',
  'Professional Services', 'Real Estate', 'Government', 'Education', 'Other',
]

const COMPANY_SIZES = [
  { label: '1-10',    value: 'micro'      },
  { label: '11-50',   value: 'small'      },
  { label: '51-200',  value: 'medium'     },
  { label: '201-500', value: 'large'      },
  { label: '500+',    value: 'enterprise' },
]

// ── Onboarding component ──────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate  = useNavigate()
  const { user }  = useAuth()

  const [step,          setStep]          = useState(1)
  const [selectedDomains, setDomains]     = useState([])
  const [industry,      setIndustry]      = useState('')
  const [companySize,   setCompanySize]   = useState('')
  const [goals,         setGoals]         = useState([])

  const TOTAL_STEPS = 4
  const firstName   = user?.firstName || user?.first_name || 'there'

  const toggleDomain = (id) => {
    setDomains(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const toggleGoal = (goal) => {
    setGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    )
  }

  const finish = () => {
    // Save preferences to localStorage
    localStorage.setItem('onboarding_complete', 'true')
    localStorage.setItem('onboarding_prefs', JSON.stringify({
      selectedDomains, industry, companySize, goals,
      completedAt: new Date().toISOString(),
    }))
    navigate('/dashboard')
  }

  const skip = () => {
    localStorage.setItem('onboarding_complete', 'true')
    navigate('/dashboard')
  }

  return (
    <div className="ob-root">
      <div className="ob-card">

        {/* Progress bar */}
        <div className="ob-progress-wrap">
          <div className="ob-progress-bar">
            <div className="ob-progress-fill" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}/>
          </div>
          <span className="ob-progress-label">Step {step} of {TOTAL_STEPS}</span>
        </div>

        {/* ── STEP 1: Welcome ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="ob-step">
            <div className="ob-welcome-icon">💼</div>
            <h1 className="ob-title">Welcome to Finance Suite, {firstName}!</h1>
            <p className="ob-subtitle">
              Your account is ready. Let's take 2 minutes to personalise your workspace
              so you get the most out of the platform.
            </p>

            <div className="ob-features">
              {[
                { icon: BarChart3, color:'#3b82f6', title:'500+ Reports',     desc:'Across 13 business domains' },
                { icon: Shield,    color:'#10b981', title:'Compliance Tracking',desc:'Deadlines, audits & regulations' },
                { icon: Zap,       color:'#8b5cf6', title:'AI-Powered Insights',desc:'Predictive analytics & copilot' },
                { icon: Globe,     color:'#f59e0b', title:'Integration Ready', desc:'ERP, CRM, HRMS connectors' },
              ].map((f, i) => {
                const Icon = f.icon
                return (
                  <div key={i} className="ob-feature-card">
                    <div className="ob-feature-icon" style={{ background:`${f.color}22`, color:f.color }}>
                      <Icon size={18}/>
                    </div>
                    <div>
                      <div className="ob-feature-title">{f.title}</div>
                      <div className="ob-feature-desc">{f.desc}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button className="ob-next-btn" onClick={() => setStep(2)}>
              Get Started <ArrowRight size={16}/>
            </button>
          </div>
        )}

        {/* ── STEP 2: Workspace setup ──────────────────────────────────────── */}
        {step === 2 && (
          <div className="ob-step">
            <Briefcase size={32} className="ob-step-icon" style={{ color:'#3b82f6' }}/>
            <h1 className="ob-title">Tell us about your company</h1>
            <p className="ob-subtitle">This helps us tailor reports and dashboards for your industry.</p>

            <div className="ob-form-group">
              <label className="ob-label">Industry</label>
              <div className="ob-industry-grid">
                {INDUSTRIES.map(ind => (
                  <button
                    key={ind}
                    className={`ob-industry-btn ${industry === ind ? 'selected' : ''}`}
                    onClick={() => setIndustry(ind)}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="ob-form-group">
              <label className="ob-label">Company size</label>
              <div className="ob-size-row">
                {COMPANY_SIZES.map(s => (
                  <button
                    key={s.value}
                    className={`ob-size-btn ${companySize === s.value ? 'selected' : ''}`}
                    onClick={() => setCompanySize(s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ob-btn-row">
              <button className="ob-back-btn" onClick={() => setStep(1)}><ArrowLeft size={14}/> Back</button>
              <button className="ob-next-btn" onClick={() => setStep(3)}>
                Continue <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Choose domains ───────────────────────────────────────── */}
        {step === 3 && (
          <div className="ob-step">
            <BarChart3 size={32} className="ob-step-icon" style={{ color:'#8b5cf6' }}/>
            <h1 className="ob-title">Which domains matter most?</h1>
            <p className="ob-subtitle">
              Select the areas you'll use most. We'll highlight relevant reports and dashboards.
              You can always change this later.
            </p>

            <div className="ob-domains-grid">
              {DOMAINS.map(d => {
                const Icon     = d.icon
                const selected = selectedDomains.includes(d.id)
                return (
                  <button
                    key={d.id}
                    className={`ob-domain-btn ${selected ? 'selected' : ''}`}
                    style={selected ? { borderColor: d.color, background: `${d.color}15` } : {}}
                    onClick={() => toggleDomain(d.id)}
                  >
                    <div className="ob-domain-icon" style={{ color: d.color, background: `${d.color}20` }}>
                      <Icon size={16}/>
                    </div>
                    <span className="ob-domain-label">{d.label}</span>
                    {selected && <CheckCircle size={14} className="ob-domain-check" style={{ color: d.color }}/>}
                  </button>
                )
              })}
            </div>

            {selectedDomains.length > 0 && (
              <p className="ob-selected-count">{selectedDomains.length} domain{selectedDomains.length > 1 ? 's' : ''} selected</p>
            )}

            <div className="ob-btn-row">
              <button className="ob-back-btn" onClick={() => setStep(2)}><ArrowLeft size={14}/> Back</button>
              <button className="ob-next-btn" onClick={() => setStep(4)}>
                Continue <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Get started ──────────────────────────────────────────── */}
        {step === 4 && (
          <div className="ob-step ob-step-final">
            <div className="ob-success-icon">🎉</div>
            <h1 className="ob-title">You're all set!</h1>
            <p className="ob-subtitle">
              Your workspace is personalised. Here's what to explore first:
            </p>

            <div className="ob-quickstart">
              {[
                { icon:'📊', title:'Dashboard',         desc:'Your KPIs, reports and domain overview',   path:'/dashboard'              },
                { icon:'🤖', title:'AI Copilot',        desc:'Ask anything about your financial data',   path:'/ai-copilot'             },
                { icon:'📋', title:'Compliance Calendar',desc:'Track upcoming deadlines and audits',      path:'/dashboard'              },
                { icon:'⚡', title:'Workflow Automation',desc:'Automate recurring compliance tasks',      path:'/workflow-automation'    },
              ].map((item, i) => (
                <div key={i} className="ob-quickstart-card">
                  <span className="ob-quickstart-emoji">{item.icon}</span>
                  <div>
                    <div className="ob-quickstart-title">{item.title}</div>
                    <div className="ob-quickstart-desc">{item.desc}</div>
                  </div>
                  <ArrowRight size={14} style={{ color:'#475569', flexShrink:0 }}/>
                </div>
              ))}
            </div>

            <button className="ob-finish-btn" onClick={finish}>
              <CheckCircle size={18}/> Go to Dashboard
            </button>
          </div>
        )}

        {/* Skip link */}
        {step < 4 && (
          <button className="ob-skip-btn" onClick={skip}>
            <SkipForward size={13}/> Skip for now
          </button>
        )}

      </div>
    </div>
  )
}
