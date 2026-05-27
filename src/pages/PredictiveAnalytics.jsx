import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Brain, TrendingUp, TrendingDown, Target, AlertTriangle,
  Users, DollarSign, Activity, ArrowLeft, RefreshCw,
  ChevronUp, ChevronDown, Shield, Clock, Cpu,
  Lightbulb, Filter, BarChart3, Star, CheckCircle, Zap
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, Line
} from 'recharts'
import './PredictiveAnalytics.css'

import { useAnalytics } from '../hooks/useAnalytics'
// MOCK DATA
// ─────────────────────────────────────────────────────────────

const REVENUE_FORECAST = [
  { month: 'Jul 25', actual: 8.2,  forecast: 8.2,  upper: null, lower: null },
  { month: 'Aug 25', actual: 9.1,  forecast: 9.1,  upper: null, lower: null },
  { month: 'Sep 25', actual: 8.7,  forecast: 8.7,  upper: null, lower: null },
  { month: 'Oct 25', actual: 10.2, forecast: 10.2, upper: null, lower: null },
  { month: 'Nov 25', actual: 11.5, forecast: 11.5, upper: null, lower: null },
  { month: 'Dec 25', actual: 12.8, forecast: 12.8, upper: null, lower: null },
  { month: 'Jan 26', actual: null, forecast: 13.4, upper: 14.8, lower: 12.1 },
  { month: 'Feb 26', actual: null, forecast: 14.1, upper: 15.9, lower: 12.4 },
  { month: 'Mar 26', actual: null, forecast: 15.0, upper: 17.2, lower: 12.9 },
  { month: 'Apr 26', actual: null, forecast: 15.8, upper: 18.5, lower: 13.2 },
  { month: 'May 26', actual: null, forecast: 16.9, upper: 19.8, lower: 14.1 },
  { month: 'Jun 26', actual: null, forecast: 18.2, upper: 21.5, lower: 15.0 },
]

const DEMAND_FORECAST = [
  { month: 'Jul 25', actual: 420, forecast: 420, upper: null, lower: null },
  { month: 'Aug 25', actual: 485, forecast: 485, upper: null, lower: null },
  { month: 'Sep 25', actual: 462, forecast: 462, upper: null, lower: null },
  { month: 'Oct 25', actual: 510, forecast: 510, upper: null, lower: null },
  { month: 'Nov 25', actual: 548, forecast: 548, upper: null, lower: null },
  { month: 'Dec 25', actual: 590, forecast: 590, upper: null, lower: null },
  { month: 'Jan 26', actual: null, forecast: 615, upper: 680, lower: 555 },
  { month: 'Feb 26', actual: null, forecast: 648, upper: 720, lower: 578 },
  { month: 'Mar 26', actual: null, forecast: 695, upper: 780, lower: 612 },
  { month: 'Apr 26', actual: null, forecast: 732, upper: 825, lower: 640 },
  { month: 'May 26', actual: null, forecast: 778, upper: 880, lower: 678 },
  { month: 'Jun 26', actual: null, forecast: 820, upper: 940, lower: 702 },
]

const KPI_HEALTH = [
  { name: 'Revenue Growth',         score: 87, trend: 'up',   value: '$18.2M', change: '+8.2%', domain: 'Finance',      icon: DollarSign    },
  { name: 'Customer Retention',     score: 72, trend: 'down', value: '84.2%',  change: '-2.1%', domain: 'Sales',        icon: Users         },
  { name: 'Operational Efficiency', score: 91, trend: 'up',   value: '94.5%',  change: '+3.4%', domain: 'Operations',   icon: Activity      },
  { name: 'Compliance Score',       score: 95, trend: 'up',   value: '98.5%',  change: '+0.8%', domain: 'Audit',        icon: Shield        },
  { name: 'Cash Flow Health',       score: 68, trend: 'down', value: '$4.2M',  change: '-5.3%', domain: 'Treasury',     icon: TrendingUp    },
  { name: 'Risk Exposure',          score: 55, trend: 'down', value: 'Medium', change: '+12%',  domain: 'Risk',         icon: AlertTriangle },
  { name: 'HR Productivity',        score: 82, trend: 'up',   value: '89.1%',  change: '+4.2%', domain: 'HR',           icon: Users         },
  { name: 'IT System Health',       score: 96, trend: 'up',   value: '99.2%',  change: '+0.5%', domain: 'IT',           icon: Cpu           },
]

const CHURN_RISK_DATA = [
  { segment: '0–20%',   count: 342 },
  { segment: '21–40%',  count: 218 },
  { segment: '41–60%',  count: 156 },
  { segment: '61–80%',  count: 89  },
  { segment: '81–100%', count: 47  },
]

const AT_RISK_CUSTOMERS = [
  { id: 1, name: 'Apex Financial Ltd',  segment: 'Enterprise', churnRisk: 84, revenueRisk: '$420K', lastActivity: '18 days ago', reason: 'Declining usage, payment delays'       },
  { id: 2, name: 'Metro Retail Group',  segment: 'Mid-Market', churnRisk: 76, revenueRisk: '$180K', lastActivity: '12 days ago', reason: 'Support tickets, low engagement'       },
  { id: 3, name: 'Summit Healthcare',   segment: 'Enterprise', churnRisk: 71, revenueRisk: '$290K', lastActivity: '9 days ago',  reason: 'Competitor evaluation, feature gaps'  },
  { id: 4, name: 'Harbor Logistics',    segment: 'SMB',        churnRisk: 65, revenueRisk: '$85K',  lastActivity: '22 days ago', reason: 'Budget constraints, low login rate'    },
  { id: 5, name: 'Nordic Ventures',     segment: 'Mid-Market', churnRisk: 62, revenueRisk: '$145K', lastActivity: '7 days ago',  reason: 'Contract renewal upcoming'            },
]

const ANOMALIES = [
  { id: 1, title: 'Revenue Spike Detected',    domain: 'Finance',      severity: 'high',     time: '2 hours ago', description: '42% above forecast for Q4 revenue — possible large one-time deal closure.',   status: 'investigating' },
  { id: 2, title: 'Unusual Login Pattern',      domain: 'IT',           severity: 'critical', time: '4 hours ago', description: 'Multiple failed login attempts from 3 unrecognized IP addresses detected.',    status: 'resolved'      },
  { id: 3, title: 'Inventory Level Drop',       domain: 'Supply Chain', severity: 'medium',   time: '6 hours ago', description: 'SKU-2847 inventory fell below minimum threshold unexpectedly.',               status: 'open'          },
  { id: 4, title: 'HR Attrition Alert',         domain: 'HR',           severity: 'medium',   time: '1 day ago',   description: '3 senior engineers submitted resignation within 48 hours.',                    status: 'open'          },
  { id: 5, title: 'Compliance Deadline Alert',  domain: 'Audit',        severity: 'high',     time: '1 day ago',   description: 'GST quarterly filing deadline approaching — 2 days remaining.',                status: 'open'          },
  { id: 6, title: 'Customer Churn Signal',      domain: 'Sales',        severity: 'medium',   time: '2 days ago',  description: 'Apex Financial showing critical disengagement patterns across modules.',       status: 'investigating' },
]

const RECOMMENDATIONS = [
  { id: 1, title: 'Accelerate Q1 Revenue Recovery',       category: 'Revenue',    impact: 'high',   priority: 1, effort: 'medium', description: 'AI models predict a 14% revenue dip in January. Launch early-bird renewal campaigns targeting 45 accounts showing usage decline.',    potentialValue: '+$2.1M',      confidence: 89 },
  { id: 2, title: 'Reduce Apex Financial Churn Risk',     category: 'Retention',  impact: 'high',   priority: 2, effort: 'low',    description: 'Schedule executive business review with Apex Financial within 5 days. Offer usage optimization workshop and roadmap alignment.',       potentialValue: '+$420K',      confidence: 84 },
  { id: 3, title: 'Optimize Inventory Reorder Points',    category: 'Operations', impact: 'medium', priority: 3, effort: 'low',    description: 'Supply chain model shows 23% excess holding cost on 12 SKUs. Implement dynamic reorder triggers based on seasonal demand patterns.', potentialValue: '-$180K cost', confidence: 91 },
  { id: 4, title: 'Expand HR Analytics Adoption',         category: 'HR',         impact: 'medium', priority: 4, effort: 'high',   description: 'Only 34% of HR team uses the predictive attrition model. Training could reduce attrition cost by an estimated $240K annually.',      potentialValue: '+$240K',      confidence: 76 },
  { id: 5, title: 'Automate Compliance Submissions',      category: 'Risk',       impact: 'medium', priority: 5, effort: 'low',    description: 'Automating 18 recurring compliance submissions could save 140 hours per quarter and eliminate all deadline-miss risk.',               potentialValue: '140 hrs',     confidence: 95 },
  { id: 6, title: 'Dynamic Pricing for Enterprise Tier',  category: 'Revenue',    impact: 'high',   priority: 6, effort: 'high',   description: 'Price elasticity model shows 8.5% pricing headroom in Enterprise tier. Phased adjustment could increase ARR without impacting renewals.', potentialValue: '+$890K',   confidence: 72 },
]

const MODEL_PERFORMANCE = [
  { name: 'Revenue Forecast',  accuracy: 91.2, mae: '±$0.8M',   model: 'LSTM Neural Net',  status: 'excellent' },
  { name: 'Demand Forecast',   accuracy: 88.7, mae: '±42 units', model: 'XGBoost',          status: 'good'      },
  { name: 'Churn Prediction',  accuracy: 84.3, mae: '±6.2%',     model: 'Random Forest',    status: 'good'      },
  { name: 'Anomaly Detection', accuracy: 94.8, mae: '±1.2%',     model: 'Isolation Forest', status: 'excellent' },
]

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const getHealthColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444'
const getHealthLabel = (s) => s >= 80 ? 'Healthy' : s >= 60 ? 'Warning' : 'Critical'
const getSeverityColor = (v) => ({ critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#10b981' }[v] || '#94a3b8')
const getImpactColor  = (v) => ({ high: '#10b981', medium: '#f59e0b', low: '#94a3b8' }[v] || '#94a3b8')

// ─────────────────────────────────────────────────────────────
// CUSTOM RECHARTS TOOLTIP
// ─────────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload, label, prefix = '', suffix = '' }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="pa-tooltip">
      <p className="pa-tooltip-label">{label}</p>
      {payload.map((entry, i) =>
        entry.value !== null &&
        entry.name !== 'Upper Band' &&
        entry.name !== 'Lower Band' && (
          <p key={i} className="pa-tooltip-item" style={{ color: entry.color }}>
            <span>{entry.name}:</span>
            <span>{prefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}{suffix}</span>
          </p>
        )
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────

function PredictiveAnalytics() {
  const navigate = useNavigate()
  const [activeTab,      setActiveTab]      = useState('overview')
  const [timeRange,      setTimeRange]      = useState('6M')
  const [isRefreshing,   setIsRefreshing]   = useState(false)
  const { stats: analyticsStats } = useAnalytics()
  const [lastUpdated,    setLastUpdated]    = useState(new Date())
  const [categoryFilter, setCategoryFilter] = useState('All')

  const liveKPIs = analyticsStats ? [
    { name: "Revenue Growth",         score: 87,                                    trend: "up",   value: "$18.2M",                                        change: "+8.2%",  domain: "Finance",    icon: DollarSign    },
    { name: "Customer Retention",     score: 72,                                    trend: "down", value: "84.2%",                                         change: "-2.1%",  domain: "Sales",      icon: Users         },
    { name: "Operational Efficiency", score: Math.round(analyticsStats.automationRate || 87), trend: "up", value: (analyticsStats.automationRate||87).toFixed(1)+"%", change: "+3.4%", domain: "Operations", icon: Activity },
    { name: "Compliance Score",       score: Math.round(analyticsStats.complianceRate || 95), trend: "up", value: (analyticsStats.complianceRate||95).toFixed(1)+"%", change: "+0.8%", domain: "Finance",  icon: Shield   },
    { name: "Cash Flow Health",       score: 68,                                    trend: "down", value: "$4.2M",                                         change: "-5.3%",  domain: "Treasury",   icon: TrendingUp    },
    { name: "Risk Exposure",          score: Math.max(0,100-Math.round(analyticsStats.riskScore||23)), trend: analyticsStats.riskScore>25?"down":"up", value: analyticsStats.riskScore?.toFixed(1)||"23.3", change: "-5.3", domain: "Risk", icon: AlertTriangle },
    { name: "HR Productivity",        score: 82,                                    trend: "up",   value: "89.1%",                                         change: "+4.2%",  domain: "HR",         icon: Users         },
    { name: "IT System Health",       score: 96,                                    trend: "up",   value: "99.2%",                                         change: "+0.5%",  domain: "IT",         icon: Cpu           },
  ] : KPI_HEALTH
  const [severityFilter, setSeverityFilter] = useState('All')

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => { setIsRefreshing(false); setLastUpdated(new Date()) }, 1500)
  }, [])

  const TABS = [
    { id: 'overview',        label: 'AI Overview',       icon: Brain         },
    { id: 'forecasting',     label: 'Forecasting',       icon: TrendingUp    },
    { id: 'churn',           label: 'Churn Prediction',  icon: Users         },
    { id: 'anomaly',         label: 'Anomaly Detection', icon: AlertTriangle },
    { id: 'recommendations', label: 'Recommendations',   icon: Lightbulb     },
  ]

  const filteredAnomalies       = ANOMALIES.filter(a => severityFilter === 'All' || a.severity === severityFilter.toLowerCase())
  const filteredRecommendations = RECOMMENDATIONS.filter(r => categoryFilter === 'All' || r.category === categoryFilter)

  // ── TAB: OVERVIEW ──────────────────────────────────────────
  const renderOverview = () => (
    <div className="pa-tab-content">
      <div className="pa-summary-grid">
        {[
          { icon: Brain,         color: '#3b82f6', label: 'Active AI Models',      value: '6',     badge: 'Running',     badgeClass: 'green'  },
          { icon: Target,        color: '#10b981', label: 'Avg Forecast Accuracy', value: '87.4%', badge: '+2.1%',       badgeClass: 'green'  },
          { icon: AlertTriangle, color: '#ef4444', label: 'Active Anomalies',      value: '6',     badge: '2 Critical',  badgeClass: 'red'    },
          { icon: Users,         color: '#f59e0b', label: 'At-Risk Customers',     value: '136',   badge: '$1.12M risk', badgeClass: 'yellow' },
        ].map(({ icon: Icon, color, label, value, badge, badgeClass }, i) => (
          <div className="pa-summary-card" key={i}>
            <div className="pa-summary-icon" style={{ background: `${color}22`, color }}>
              <Icon size={20} />
            </div>
            <div className="pa-summary-info">
              <span className="pa-summary-value">{value}</span>
              <span className="pa-summary-label">{label}</span>
            </div>
            <span className={`pa-summary-badge ${badgeClass}`}>{badge}</span>
          </div>
        ))}
      </div>

      <div className="pa-section">
        <div className="pa-section-header">
          <h3 className="pa-section-title"><Activity size={15} /> KPI Health Scores</h3>
          <span className="pa-section-sub">AI-evaluated across all domains · 8 KPIs monitored</span>
        </div>
        <div className="pa-health-grid">
          {liveKPIs.map((kpi, i) => {
            const IconComp = kpi.icon
            const color = getHealthColor(kpi.score)
            return (
              <div className="pa-health-card" key={i}>
                <div className="pa-health-header">
                  <div className="pa-health-icon" style={{ background: `${color}22`, color }}>
                    <IconComp size={15} />
                  </div>
                  <div className="pa-health-meta">
                    <span className="pa-health-name">{kpi.name}</span>
                    <span className="pa-health-domain">{kpi.domain}</span>
                  </div>
                </div>
                <div className="pa-health-value-row">
                  <span className="pa-health-value">{kpi.value}</span>
                  <span className="pa-health-change" style={{ color: kpi.trend === 'up' ? '#10b981' : '#ef4444' }}>
                    {kpi.trend === 'up' ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {kpi.change}
                  </span>
                </div>
                <div className="pa-health-bar-row">
                  <div className="pa-health-bar">
                    <div className="pa-health-bar-fill" style={{ width: `${kpi.score}%`, background: color }} />
                  </div>
                  <span className="pa-health-score-num" style={{ color }}>{kpi.score}</span>
                </div>
                <span className="pa-health-status-label" style={{ color, background: `${color}18` }}>
                  {getHealthLabel(kpi.score)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ── TAB: FORECASTING ───────────────────────────────────────
  const renderForecasting = () => (
    <div className="pa-tab-content">
      <div className="pa-section">
        <div className="pa-section-header">
          <h3 className="pa-section-title"><DollarSign size={15} /> Revenue Forecast</h3>
          <div className="pa-range-group">
            {['3M', '6M', '12M'].map(r => (
              <button key={r} className={`pa-range-btn ${timeRange === r ? 'active' : ''}`} onClick={() => setTimeRange(r)}>{r}</button>
            ))}
          </div>
        </div>
        <div className="pa-forecast-meta">
          <span><Target size={12} /> Accuracy: <strong>91.2%</strong></span>
          <span><Shield size={12} /> Confidence: <strong>85%</strong></span>
          <span><Clock  size={12} /> Trained: <strong>2 days ago</strong></span>
          <span><Cpu    size={12} /> Model: <strong>LSTM Neural Net</strong></span>
        </div>
        <div className="pa-chart-wrap">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={REVENUE_FORECAST} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month"    tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <YAxis                    tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} tickFormatter={v => `$${v}M`} />
              <Tooltip content={<ChartTooltip prefix="$" suffix="M" />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 8 }} />
              <ReferenceLine x="Dec 25" stroke="#475569" strokeDasharray="5 4" label={{ value: 'Today', fill: '#64748b', fontSize: 11 }} />
              <Area type="monotone" dataKey="upper"    fill="url(#revGrad)" stroke="none"     name="Upper Band" legendType="none" />
              <Area type="monotone" dataKey="lower"    fill="#0f172a"       stroke="none"     name="Lower Band" legendType="none" />
              <Line type="monotone" dataKey="actual"   stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="Actual"   connectNulls={false} />
              <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="6 3" dot={{ fill: '#3b82f6', r: 3 }} name="Forecast" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pa-section">
        <div className="pa-section-header">
          <h3 className="pa-section-title"><BarChart3 size={15} /> Demand Forecast</h3>
          <span className="pa-forecast-tag">
            <Target size={12} /> Accuracy: <strong>88.7%</strong> · Model: <strong>XGBoost</strong>
          </span>
        </div>
        <div className="pa-chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={DEMAND_FORECAST} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <YAxis                 tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <Tooltip content={<ChartTooltip suffix=" units" />} />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 12, paddingTop: 8 }} />
              <ReferenceLine x="Dec 25" stroke="#475569" strokeDasharray="5 4" />
              <Bar dataKey="actual"   fill="#10b981" name="Actual"   radius={[3,3,0,0]} opacity={0.85} />
              <Bar dataKey="forecast" fill="#3b82f6" name="Forecast" radius={[3,3,0,0]} opacity={0.75} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pa-section">
        <div className="pa-section-header">
          <h3 className="pa-section-title"><Star size={15} /> AI Model Performance</h3>
          <span className="pa-section-sub">Last evaluated 2 days ago</span>
        </div>
        <div className="pa-accuracy-grid">
          {MODEL_PERFORMANCE.map((m, i) => (
            <div className="pa-accuracy-card" key={i}>
              <div className="pa-accuracy-top">
                <span className="pa-accuracy-name">{m.name}</span>
                <span className={`pa-status-pill ${m.status}`}>{m.status}</span>
              </div>
              <div className="pa-accuracy-score">{m.accuracy}%</div>
              <div className="pa-accuracy-bar">
                <div className="pa-accuracy-fill" style={{ width: `${m.accuracy}%`, background: m.accuracy >= 90 ? '#10b981' : '#3b82f6' }} />
              </div>
              <div className="pa-accuracy-meta">
                <span>{m.model}</span>
                <span>{m.mae}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ── TAB: CHURN ─────────────────────────────────────────────
  const renderChurn = () => (
    <div className="pa-tab-content">
      <div className="pa-churn-summary">
        {[
          { value: '47',  label: 'Critical Risk (>80%)', cls: 'red'    },
          { value: '89',  label: 'High Risk (61–80%)',   cls: 'orange' },
          { value: '156', label: 'Medium Risk (41–60%)', cls: 'yellow' },
          { value: '560', label: 'Low / No Risk (<40%)', cls: 'green'  },
        ].map((s, i) => (
          <div className="pa-churn-stat" key={i}>
            <span className={`pa-churn-stat-value ${s.cls}`}>{s.value}</span>
            <span className="pa-churn-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="pa-section">
        <div className="pa-section-header">
          <h3 className="pa-section-title"><BarChart3 size={15} /> Risk Score Distribution</h3>
          <span className="pa-forecast-tag"><Target size={12} /> Model: <strong>Random Forest</strong> · Accuracy: <strong>84.3%</strong></span>
        </div>
        <div className="pa-chart-wrap">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={CHURN_RISK_DATA} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="segment" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <YAxis                   tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: '#334155' }} tickLine={false} />
              <Tooltip content={<ChartTooltip suffix=" customers" />} />
              <Bar dataKey="count" name="Customers" radius={[4,4,0,0]} fill="#3b82f6"
                label={{ position: 'top', fill: '#94a3b8', fontSize: 11 }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pa-section">
        <div className="pa-section-header">
          <h3 className="pa-section-title"><AlertTriangle size={15} /> High-Risk Accounts</h3>
          <span className="pa-section-sub">Ranked by churn probability · Immediate action required</span>
        </div>
        <div className="pa-churn-table-wrap">
          <div className="pa-churn-table-head">
            <span>Account</span><span>Segment</span><span>Churn Risk</span>
            <span>Revenue at Risk</span><span>Last Activity</span><span>Churn Signal</span>
          </div>
          {AT_RISK_CUSTOMERS.map(c => {
            const rc = c.churnRisk >= 80 ? '#ef4444' : c.churnRisk >= 65 ? '#f97316' : '#f59e0b'
            return (
              <div className="pa-churn-table-row" key={c.id}>
                <span className="pa-table-account">{c.name}</span>
                <span className="pa-segment-pill">{c.segment}</span>
                <div className="pa-risk-cell">
                  <div className="pa-risk-bar-track">
                    <div className="pa-risk-bar-fill" style={{ width: `${c.churnRisk}%`, background: rc }} />
                  </div>
                  <span style={{ color: rc, fontWeight: 700, fontSize: 13 }}>{c.churnRisk}%</span>
                </div>
                <span className="pa-revenue-risk">{c.revenueRisk}</span>
                <span className="pa-last-activity">{c.lastActivity}</span>
                <span className="pa-signal-text">{c.reason}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  // ── TAB: ANOMALY ───────────────────────────────────────────
  const renderAnomaly = () => (
    <div className="pa-tab-content">
      <div className="pa-filter-row">
        <Filter size={13} style={{ color: '#94a3b8' }} />
        <span className="pa-filter-label">Severity:</span>
        {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
          <button key={s} className={`pa-filter-btn ${severityFilter === s ? 'active' : ''}`} onClick={() => setSeverityFilter(s)}>{s}</button>
        ))}
        <span className="pa-anomaly-count-badge">{filteredAnomalies.length} detected</span>
      </div>

      <div className="pa-anomaly-list">
        {filteredAnomalies.map(a => {
          const sc = getSeverityColor(a.severity)
          return (
            <div className="pa-anomaly-card" key={a.id}>
              <div className="pa-anomaly-sev-icon" style={{ background: `${sc}18`, border: `1px solid ${sc}40` }}>
                <AlertTriangle size={17} style={{ color: sc }} />
              </div>
              <div className="pa-anomaly-body">
                <div className="pa-anomaly-top-row">
                  <span className="pa-anomaly-title">{a.title}</span>
                  <div className="pa-anomaly-tags">
                    <span className="pa-domain-tag">{a.domain}</span>
                    <span className="pa-severity-tag" style={{ color: sc, background: `${sc}18` }}>{a.severity}</span>
                    <span className={`pa-status-tag ${a.status}`}>{a.status}</span>
                  </div>
                </div>
                <p className="pa-anomaly-desc">{a.description}</p>
                <span className="pa-anomaly-time"><Clock size={11} /> {a.time}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ── TAB: RECOMMENDATIONS ───────────────────────────────────
  const renderRecommendations = () => (
    <div className="pa-tab-content">
      <div className="pa-filter-row">
        <Filter size={13} style={{ color: '#94a3b8' }} />
        <span className="pa-filter-label">Category:</span>
        {['All', 'Revenue', 'Retention', 'Operations', 'HR', 'Risk'].map(c => (
          <button key={c} className={`pa-filter-btn ${categoryFilter === c ? 'active' : ''}`} onClick={() => setCategoryFilter(c)}>{c}</button>
        ))}
      </div>

      <div className="pa-rec-list">
        {filteredRecommendations.map(rec => {
          const ic = getImpactColor(rec.impact)
          return (
            <div className="pa-rec-card" key={rec.id}>
              <div className="pa-rec-priority"><span>#{rec.priority}</span></div>
              <div className="pa-rec-body">
                <div className="pa-rec-top-row">
                  <span className="pa-rec-title">{rec.title}</span>
                  <div className="pa-rec-tags">
                    <span className="pa-rec-category">{rec.category}</span>
                    <span className="pa-rec-impact" style={{ color: ic, background: `${ic}18` }}>{rec.impact} impact</span>
                    <span className="pa-rec-effort">Effort: {rec.effort}</span>
                  </div>
                </div>
                <p className="pa-rec-desc">{rec.description}</p>
                <div className="pa-rec-footer">
                  <span className="pa-rec-value">
                    <Zap size={13} /> Potential: <strong>{rec.potentialValue}</strong>
                  </span>
                  <div className="pa-confidence-group">
                    <span className="pa-confidence-label">AI Confidence</span>
                    <div className="pa-confidence-bar">
                      <div className="pa-confidence-fill" style={{ width: `${rec.confidence}%`, background: rec.confidence >= 85 ? '#10b981' : '#3b82f6' }} />
                    </div>
                    <span className="pa-confidence-num">{rec.confidence}%</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const TAB_CONTENT = {
    overview:        renderOverview(),
    forecasting:     renderForecasting(),
    churn:           renderChurn(),
    anomaly:         renderAnomaly(),
    recommendations: renderRecommendations(),
  }

  // ── RENDER ─────────────────────────────────────────────────
  return (
    <div className="pa-container">

      {/* Header */}
      <div className="pa-header">
        <div className="pa-header-left">
          <button className="pa-back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
          <div className="pa-title-group">
            <div className="pa-title-icon"><Brain size={22} /></div>
            <div>
              <h1 className="pa-title">Predictive AI Analytics</h1>
              <p className="pa-subtitle">Forecasting · Churn Prediction · Anomaly Detection · Recommendations</p>
            </div>
          </div>
        </div>
        <div className="pa-header-right">
          <span className="pa-last-updated">
            <CheckCircle size={13} /> Updated {lastUpdated.toLocaleTimeString()}
          </span>
          <button className={`pa-refresh-btn ${isRefreshing ? 'spinning' : ''}`} onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw size={14} /> {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="pa-tab-bar">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`pa-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="pa-content">
        {TAB_CONTENT[activeTab]}
      </div>

    </div>
  )
}

export default PredictiveAnalytics
