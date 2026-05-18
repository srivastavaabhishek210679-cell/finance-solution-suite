import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Zap, Play, Pause, Plus, Trash2, Edit3,
  CheckCircle, Clock, AlertTriangle, XCircle, ChevronRight,
  GitBranch, Bell, FileText, Mail, Users, Shield,
  BarChart3, RefreshCw, Filter, Calendar, Eye,
  TrendingUp, Activity, Settings, ArrowRight
} from 'lucide-react'
import './WorkflowAutomation.css'

// ─────────────────────────────────────────────────────────────
// MOCK DATA — workflows, approvals, history
// ─────────────────────────────────────────────────────────────

const INITIAL_WORKFLOWS = [
  {
    id: 1, name: 'Monthly Finance Report Submission', status: 'active', category: 'Compliance',
    trigger: { type: 'schedule', value: 'Monthly — 1st of month, 9:00 AM' },
    actions: ['Generate Finance summary report', 'Send to CFO via email', 'Post to Compliance Calendar'],
    lastRun: '2026-05-01 09:02', nextRun: '2026-06-01 09:00', runsTotal: 12, runsSuccess: 11,
    createdBy: 'Alice', createdAt: '2025-06-01', priority: 'high',
  },
  {
    id: 2, name: 'Risk Threshold Alert', status: 'active', category: 'Risk',
    trigger: { type: 'threshold', value: 'Risk score exceeds 75 (any domain)' },
    actions: ['Send alert to Risk Officer', 'Create incident ticket', 'Escalate to CRO if unresolved in 24h'],
    lastRun: '2026-05-14 14:30', nextRun: 'On trigger', runsTotal: 7, runsSuccess: 7,
    createdBy: 'Alice', createdAt: '2025-09-15', priority: 'critical',
  },
  {
    id: 3, name: 'Compliance Deadline Reminder', status: 'active', category: 'Compliance',
    trigger: { type: 'schedule', value: '7 days before any compliance deadline' },
    actions: ['Email responsible stakeholder', 'Create dashboard notification', 'Log in audit trail'],
    lastRun: '2026-05-11 08:00', nextRun: '2026-05-18 08:00', runsTotal: 45, runsSuccess: 45,
    createdBy: 'Alice', createdAt: '2025-04-01', priority: 'high',
  },
  {
    id: 4, name: 'New Report Approval Pipeline', status: 'active', category: 'Governance',
    trigger: { type: 'event', value: 'New report created in any domain' },
    actions: ['Assign to domain head for review', 'Wait for approval (48h SLA)', 'Notify creator of outcome', 'Publish if approved'],
    lastRun: '2026-05-16 11:20', nextRun: 'On trigger', runsTotal: 23, runsSuccess: 21,
    createdBy: 'Alice', createdAt: '2025-11-01', priority: 'medium',
  },
  {
    id: 5, name: 'Weekly HR Analytics Digest', status: 'paused', category: 'HR',
    trigger: { type: 'schedule', value: 'Every Monday, 8:00 AM' },
    actions: ['Compile HR KPI summary', 'Generate PDF report', 'Email to HR Head and CHRO'],
    lastRun: '2026-05-11 08:01', nextRun: 'Paused', runsTotal: 32, runsSuccess: 31,
    createdBy: 'Alice', createdAt: '2025-07-08', priority: 'medium',
  },
  {
    id: 6, name: 'IT Security Incident Escalation', status: 'active', category: 'IT',
    trigger: { type: 'threshold', value: 'Failed login attempts > 5 in 10 minutes' },
    actions: ['Lock account temporarily', 'Alert IT Security team', 'Log security event', 'Notify CIO if > 3 occurrences/day'],
    lastRun: '2026-05-15 03:14', nextRun: 'On trigger', runsTotal: 3, runsSuccess: 3,
    createdBy: 'Alice', createdAt: '2026-01-15', priority: 'critical',
  },
]

const PENDING_APPROVALS = [
  { id:1, title:'Q1 Finance Consolidated Report',   domain:'Finance',    requestedBy:'Bob Chen',      requestedAt:'2026-05-15 14:20', priority:'high',   description:'Consolidated Q1 P&L, Balance Sheet and Cash Flow with variance analysis.',      daysRemaining: 1 },
  { id:2, title:'Annual Tax Compliance Audit',      domain:'Tax',        requestedBy:'Sarah Kim',     requestedAt:'2026-05-14 09:15', priority:'critical',description:'Annual tax compliance audit report covering GST, TDS and corporate tax filings.', daysRemaining: 0 },
  { id:3, title:'HR Attrition Risk Assessment Q2',  domain:'HR',         requestedBy:'Mark Patel',    requestedAt:'2026-05-13 16:40', priority:'medium',  description:'Quarterly attrition risk analysis with department breakdown and recommendations.', daysRemaining: 2 },
  { id:4, title:'IT Infrastructure Security Review',domain:'IT',         requestedBy:'Lisa Wang',     requestedAt:'2026-05-12 11:00', priority:'high',    description:'Bi-annual infrastructure security review including vulnerability assessment.',      daysRemaining: 3 },
  { id:5, title:'Supply Chain Vendor Report',       domain:'Supply Chain',requestedBy:'James Torres',  requestedAt:'2026-05-11 10:30', priority:'low',     description:'Quarterly vendor performance report with SLA metrics and risk ratings.',          daysRemaining: 5 },
]

const EXECUTION_HISTORY = [
  { id:1,  workflowName:'Monthly Finance Report Submission', status:'success',  startedAt:'2026-05-01 09:00', duration:'2m 14s', trigger:'Scheduled',         actions:3, domain:'Finance'   },
  { id:2,  workflowName:'Risk Threshold Alert',             status:'success',  startedAt:'2026-05-14 14:30', duration:'0m 45s', trigger:'Threshold breach',   actions:3, domain:'Risk'      },
  { id:3,  workflowName:'Compliance Deadline Reminder',     status:'success',  startedAt:'2026-05-11 08:00', duration:'1m 02s', trigger:'Scheduled',         actions:3, domain:'Compliance' },
  { id:4,  workflowName:'New Report Approval Pipeline',     status:'failed',   startedAt:'2026-05-10 15:20', duration:'0m 08s', trigger:'Report created',     actions:1, domain:'Finance'   },
  { id:5,  workflowName:'IT Security Incident Escalation',  status:'success',  startedAt:'2026-05-15 03:14', duration:'0m 12s', trigger:'Threshold breach',   actions:4, domain:'IT'        },
  { id:6,  workflowName:'Weekly HR Analytics Digest',       status:'success',  startedAt:'2026-05-11 08:01', duration:'3m 22s', trigger:'Scheduled',         actions:3, domain:'HR'        },
  { id:7,  workflowName:'Compliance Deadline Reminder',     status:'success',  startedAt:'2026-05-04 08:00', duration:'0m 58s', trigger:'Scheduled',         actions:3, domain:'Compliance' },
  { id:8,  workflowName:'New Report Approval Pipeline',     status:'success',  startedAt:'2026-05-08 11:20', duration:'1m 44s', trigger:'Report created',     actions:4, domain:'Audit'     },
  { id:9,  workflowName:'Monthly Finance Report Submission', status:'failed',  startedAt:'2026-04-01 09:00', duration:'0m 22s', trigger:'Scheduled',         actions:1, domain:'Finance'   },
  { id:10, workflowName:'Risk Threshold Alert',             status:'success',  startedAt:'2026-04-28 17:45', duration:'0m 39s', trigger:'Threshold breach',   actions:3, domain:'Risk'      },
]

// ─────────────────────────────────────────────────────────────
// BUILDER FORM — initial state
// ─────────────────────────────────────────────────────────────
const BUILDER_INIT = {
  name: '', category: 'Compliance', priority: 'medium',
  triggerType: 'schedule', triggerValue: '',
  actions: [''],
}

const TRIGGER_TYPES = [
  { value:'schedule',  label:'Scheduled',        icon: Calendar,  desc:'Run at a fixed time or interval'       },
  { value:'threshold', label:'Threshold Breach',  icon: AlertTriangle, desc:'Trigger when a metric exceeds a limit' },
  { value:'event',     label:'On Event',          icon: Zap,       desc:'Trigger when something happens'       },
  { value:'approval',  label:'Approval Required', icon: CheckCircle, desc:'Require manual approval before proceeding' },
]

const ACTION_TYPES = [
  'Send email notification',
  'Create dashboard alert',
  'Generate PDF report',
  'Escalate to manager',
  'Post to Slack channel',
  'Update compliance status',
  'Create approval request',
  'Log to audit trail',
  'Trigger another workflow',
]

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const statusColor   = { active:'#10b981', paused:'#f59e0b', draft:'#64748b' }
const runStatusClr  = { success:'#10b981', failed:'#ef4444', running:'#3b82f6' }
const priorityColor = { critical:'#ef4444', high:'#f97316', medium:'#f59e0b', low:'#10b981' }

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
function WorkflowAutomation() {
  const navigate = useNavigate()

  const [activeTab,    setActiveTab]    = useState('overview')
  const [workflows,    setWorkflows]    = useState(INITIAL_WORKFLOWS)
  const [approvals,    setApprovals]    = useState(PENDING_APPROVALS)
  const [builder,      setBuilder]      = useState(BUILDER_INIT)
  const [histFilter,   setHistFilter]   = useState('All')
  const [wfFilter,     setWfFilter]     = useState('All')
  const [buildSaved,   setBuildSaved]   = useState(false)

  // Stats
  const stats = {
    total:   workflows.length,
    active:  workflows.filter(w => w.status === 'active').length,
    paused:  workflows.filter(w => w.status === 'paused').length,
    pending: approvals.length,
    success: EXECUTION_HISTORY.filter(h => h.status === 'success').length,
    failed:  EXECUTION_HISTORY.filter(h => h.status === 'failed').length,
  }

  // Toggle workflow status
  const toggleStatus = (id) => {
    setWorkflows(prev => prev.map(w =>
      w.id === id ? { ...w, status: w.status === 'active' ? 'paused' : 'active' } : w
    ))
  }

  // Delete workflow
  const deleteWorkflow = (id) => {
    setWorkflows(prev => prev.filter(w => w.id !== id))
  }

  // Approve / Reject
  const resolveApproval = (id, approved) => {
    setApprovals(prev => prev.filter(a => a.id !== id))
  }

  // Save workflow
  const saveWorkflow = () => {
    if (!builder.name.trim()) return
    const newWf = {
      id: Date.now(), name: builder.name, status: 'active',
      category: builder.category, priority: builder.priority,
      trigger: { type: builder.triggerType, value: builder.triggerValue || 'Configured' },
      actions: builder.actions.filter(a => a.trim()),
      lastRun: 'Never', nextRun: 'Scheduled',
      runsTotal: 0, runsSuccess: 0,
      createdBy: 'Alice', createdAt: new Date().toISOString().slice(0,10),
    }
    setWorkflows(prev => [newWf, ...prev])
    setBuilder(BUILDER_INIT)
    setBuildSaved(true)
    setTimeout(() => { setBuildSaved(false); setActiveTab('workflows') }, 1500)
  }

  const TABS = [
    { id:'overview',  label:'Overview',         icon: BarChart3     },
    { id:'workflows', label:'Workflows',         icon: GitBranch     },
    { id:'builder',   label:'Build Workflow',    icon: Plus          },
    { id:'approvals', label:`Approvals (${approvals.length})`, icon: CheckCircle },
    { id:'history',   label:'Execution History', icon: Clock         },
  ]

  const filteredWorkflows = wfFilter === 'All' ? workflows : workflows.filter(w => w.status === wfFilter || w.category === wfFilter)
  const filteredHistory   = histFilter === 'All' ? EXECUTION_HISTORY : EXECUTION_HISTORY.filter(h => h.status === histFilter)

  // ──────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────
  return (
    <div className="wfa-root">

      {/* Header */}
      <div className="wfa-header">
        <div className="wfa-header-left">
          <button className="wfa-back-btn" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={14}/> Back
          </button>
          <div className="wfa-title-group">
            <div className="wfa-title-icon"><GitBranch size={20}/></div>
            <div>
              <h1 className="wfa-title">Workflow Automation</h1>
              <p className="wfa-subtitle">Rule-based triggers · Approval pipelines · Automated actions</p>
            </div>
          </div>
        </div>
        <div className="wfa-header-right">
          <span className="wfa-live-badge"><Activity size={11}/> {stats.active} active</span>
          <button className="wfa-new-btn" onClick={() => setActiveTab('builder')}>
            <Plus size={13}/> New Workflow
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="wfa-tab-bar">
        {TABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} className={`wfa-tab-btn ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              <Icon size={13}/>{t.label}
            </button>
          )
        })}
      </div>

      {/* ── TAB: OVERVIEW ────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="wfa-content">

          {/* Stats */}
          <div className="wfa-stats-grid">
            {[
              { label:'Total Workflows',  value: stats.total,   color:'#3b82f6', icon: GitBranch      },
              { label:'Active',           value: stats.active,  color:'#10b981', icon: Play           },
              { label:'Paused',           value: stats.paused,  color:'#f59e0b', icon: Pause          },
              { label:'Pending Approvals',value: stats.pending, color:'#f97316', icon: CheckCircle    },
              { label:'Successful Runs',  value: stats.success, color:'#10b981', icon: CheckCircle    },
              { label:'Failed Runs',      value: stats.failed,  color:'#ef4444', icon: XCircle        },
            ].map((s, i) => {
              const Icon = s.icon
              return (
                <div className="wfa-stat-card" key={i} style={{ borderTopColor: s.color }}>
                  <div className="wfa-stat-icon" style={{ background:`${s.color}22`, color:s.color }}>
                    <Icon size={16}/>
                  </div>
                  <div className="wfa-stat-value">{s.value}</div>
                  <div className="wfa-stat-label">{s.label}</div>
                </div>
              )
            })}
          </div>

          {/* Active Workflow Cards */}
          <div className="wfa-section">
            <div className="wfa-section-header">
              <h3 className="wfa-section-title"><Zap size={14}/> Active Workflows</h3>
              <button className="wfa-view-all-btn" onClick={() => setActiveTab('workflows')}>View All <ChevronRight size={11}/></button>
            </div>
            <div className="wfa-overview-grid">
              {workflows.filter(w => w.status === 'active').slice(0,4).map(wf => (
                <div key={wf.id} className="wfa-overview-card">
                  <div className="wfa-ov-header">
                    <span className="wfa-ov-name">{wf.name}</span>
                    <span className="wfa-ov-category">{wf.category}</span>
                  </div>
                  <div className="wfa-ov-trigger">
                    <Zap size={11} style={{ color:'#64748b' }}/>
                    <span>{wf.trigger.value}</span>
                  </div>
                  <div className="wfa-ov-stats">
                    <span><CheckCircle size={11} style={{ color:'#10b981' }}/> {wf.runsSuccess}/{wf.runsTotal} success</span>
                    <span><Clock size={11} style={{ color:'#64748b' }}/> {wf.nextRun}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Approvals */}
          {approvals.length > 0 && (
            <div className="wfa-section">
              <div className="wfa-section-header">
                <h3 className="wfa-section-title"><CheckCircle size={14}/> Pending Approvals</h3>
                <button className="wfa-view-all-btn" onClick={() => setActiveTab('approvals')}>View All <ChevronRight size={11}/></button>
              </div>
              {approvals.slice(0,3).map(ap => (
                <div key={ap.id} className="wfa-approval-row">
                  <div className="wfa-ap-info">
                    <span className="wfa-ap-title">{ap.title}</span>
                    <span className="wfa-ap-domain">{ap.domain}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span className={`wfa-days-badge ${ap.daysRemaining === 0 ? 'overdue' : ap.daysRemaining === 1 ? 'urgent' : ''}`}>
                      {ap.daysRemaining === 0 ? 'Overdue' : `${ap.daysRemaining}d left`}
                    </span>
                    <button className="wfa-approve-btn" onClick={() => resolveApproval(ap.id, true)}><CheckCircle size={12}/> Approve</button>
                    <button className="wfa-reject-btn"  onClick={() => resolveApproval(ap.id, false)}><XCircle size={12}/> Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: WORKFLOWS ───────────────────────────────────── */}
      {activeTab === 'workflows' && (
        <div className="wfa-content">
          <div className="wfa-toolbar">
            <div className="wfa-filter-group">
              {['All','active','paused','Compliance','Risk','HR','IT','Governance'].map(f => (
                <button key={f} className={`wfa-filter-btn ${wfFilter === f ? 'active' : ''}`} onClick={() => setWfFilter(f)}>
                  {f === 'active' ? '● Active' : f === 'paused' ? '⏸ Paused' : f}
                </button>
              ))}
            </div>
            <button className="wfa-new-btn" onClick={() => setActiveTab('builder')}>
              <Plus size={13}/> New Workflow
            </button>
          </div>

          <div className="wfa-workflows-list">
            {filteredWorkflows.map(wf => (
              <div key={wf.id} className="wfa-workflow-card">
                <div className="wfa-wf-left">
                  <div className="wfa-wf-status-dot" style={{ background: statusColor[wf.status] }}/>
                </div>
                <div className="wfa-wf-body">
                  <div className="wfa-wf-top">
                    <span className="wfa-wf-name">{wf.name}</span>
                    <div className="wfa-wf-tags">
                      <span className="wfa-wf-category">{wf.category}</span>
                      <span className="wfa-wf-priority" style={{ color:priorityColor[wf.priority], background:`${priorityColor[wf.priority]}18` }}>{wf.priority}</span>
                      <span className="wfa-wf-status" style={{ color:statusColor[wf.status], background:`${statusColor[wf.status]}18` }}>{wf.status}</span>
                    </div>
                  </div>

                  <div className="wfa-wf-trigger">
                    <Zap size={11} style={{ color:'#64748b', flexShrink:0 }}/>
                    <span>Trigger: {wf.trigger.value}</span>
                  </div>

                  <div className="wfa-wf-actions-preview">
                    {wf.actions.slice(0,3).map((a,i) => (
                      <span key={i} className="wfa-action-chip">
                        <ArrowRight size={9}/> {a}
                      </span>
                    ))}
                    {wf.actions.length > 3 && <span className="wfa-action-chip muted">+{wf.actions.length-3} more</span>}
                  </div>

                  <div className="wfa-wf-footer">
                    <span><CheckCircle size={11} style={{ color:'#10b981' }}/> {wf.runsSuccess}/{wf.runsTotal} success</span>
                    <span><Clock size={11}/> Last: {wf.lastRun}</span>
                    <span><Calendar size={11}/> Next: {wf.nextRun}</span>
                    <span>By {wf.createdBy}</span>
                    <div style={{ marginLeft:'auto', display:'flex', gap:6 }}>
                      <button className="wfa-wf-btn" onClick={() => toggleStatus(wf.id)}>
                        {wf.status === 'active' ? <><Pause size={11}/> Pause</> : <><Play size={11}/> Resume</>}
                      </button>
                      <button className="wfa-wf-btn danger" onClick={() => deleteWorkflow(wf.id)}>
                        <Trash2 size={11}/> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: BUILDER ─────────────────────────────────────── */}
      {activeTab === 'builder' && (
        <div className="wfa-content">
          <div className="wfa-builder">

            {buildSaved && (
              <div className="wfa-saved-toast">
                <CheckCircle size={16}/> Workflow created and activated successfully!
              </div>
            )}

            <div className="wfa-builder-grid">

              {/* Step 1: Basic Info */}
              <div className="wfa-builder-step">
                <div className="wfa-step-header"><span className="wfa-step-num">1</span> Basic Information</div>
                <div className="wfa-form-group">
                  <label className="wfa-label">Workflow Name</label>
                  <input
                    className="wfa-input"
                    placeholder="e.g. Monthly Finance Report Automation"
                    value={builder.name}
                    onChange={e => setBuilder(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="wfa-form-row">
                  <div className="wfa-form-group">
                    <label className="wfa-label">Category</label>
                    <select className="wfa-select" value={builder.category} onChange={e => setBuilder(p => ({ ...p, category: e.target.value }))}>
                      {['Compliance','Risk','Finance','HR','IT','Operations','Governance','ESG'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="wfa-form-group">
                    <label className="wfa-label">Priority</label>
                    <select className="wfa-select" value={builder.priority} onChange={e => setBuilder(p => ({ ...p, priority: e.target.value }))}>
                      {['critical','high','medium','low'].map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Trigger */}
              <div className="wfa-builder-step">
                <div className="wfa-step-header"><span className="wfa-step-num">2</span> Trigger Condition</div>
                <div className="wfa-trigger-types">
                  {TRIGGER_TYPES.map(t => {
                    const Icon = t.icon
                    return (
                      <button
                        key={t.value}
                        className={`wfa-trigger-btn ${builder.triggerType === t.value ? 'active' : ''}`}
                        onClick={() => setBuilder(p => ({ ...p, triggerType: t.value }))}
                      >
                        <Icon size={14}/>
                        <div>
                          <div className="wfa-trigger-name">{t.label}</div>
                          <div className="wfa-trigger-desc">{t.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="wfa-form-group" style={{ marginTop:12 }}>
                  <label className="wfa-label">Trigger Value / Expression</label>
                  <input
                    className="wfa-input"
                    placeholder={
                      builder.triggerType === 'schedule'  ? 'e.g. Every Monday 9:00 AM' :
                      builder.triggerType === 'threshold' ? 'e.g. Compliance rate < 80%' :
                      builder.triggerType === 'event'     ? 'e.g. New report created in Finance domain' :
                      'e.g. Report submitted for review'
                    }
                    value={builder.triggerValue}
                    onChange={e => setBuilder(p => ({ ...p, triggerValue: e.target.value }))}
                  />
                </div>
              </div>

              {/* Step 3: Actions */}
              <div className="wfa-builder-step">
                <div className="wfa-step-header"><span className="wfa-step-num">3</span> Actions (in order)</div>
                {builder.actions.map((action, i) => (
                  <div key={i} className="wfa-action-row">
                    <div className="wfa-action-num">{i+1}</div>
                    <select
                      className="wfa-select"
                      value={action}
                      onChange={e => {
                        const updated = [...builder.actions]
                        updated[i] = e.target.value
                        setBuilder(p => ({ ...p, actions: updated }))
                      }}
                    >
                      <option value="">— Select an action —</option>
                      {ACTION_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    {builder.actions.length > 1 && (
                      <button
                        className="wfa-remove-action"
                        onClick={() => setBuilder(p => ({ ...p, actions: p.actions.filter((_, j) => j !== i) }))}
                      >
                        <Trash2 size={12}/>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  className="wfa-add-action-btn"
                  onClick={() => setBuilder(p => ({ ...p, actions: [...p.actions, ''] }))}
                >
                  <Plus size={13}/> Add Action Step
                </button>
              </div>

              {/* Preview + Save */}
              <div className="wfa-builder-step">
                <div className="wfa-step-header"><span className="wfa-step-num">4</span> Review & Activate</div>
                <div className="wfa-preview">
                  <div className="wfa-preview-row"><span>Name:</span><span>{builder.name || '—'}</span></div>
                  <div className="wfa-preview-row"><span>Category:</span><span>{builder.category}</span></div>
                  <div className="wfa-preview-row"><span>Priority:</span><span style={{ color:priorityColor[builder.priority] }}>{builder.priority}</span></div>
                  <div className="wfa-preview-row"><span>Trigger:</span><span>{TRIGGER_TYPES.find(t => t.value === builder.triggerType)?.label}</span></div>
                  <div className="wfa-preview-row"><span>Value:</span><span>{builder.triggerValue || '—'}</span></div>
                  <div className="wfa-preview-row"><span>Actions:</span><span>{builder.actions.filter(a=>a).length} step(s)</span></div>
                </div>
                <button
                  className="wfa-save-btn"
                  onClick={saveWorkflow}
                  disabled={!builder.name.trim() || buildSaved}
                >
                  <Zap size={14}/> Activate Workflow
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── TAB: APPROVALS ───────────────────────────────────── */}
      {activeTab === 'approvals' && (
        <div className="wfa-content">
          {approvals.length === 0 ? (
            <div className="wfa-empty">
              <CheckCircle size={40} style={{ color:'#10b981' }}/>
              <p>All approvals are cleared! No pending items.</p>
            </div>
          ) : (
            <div className="wfa-approvals-list">
              {approvals.map(ap => (
                <div key={ap.id} className="wfa-approval-card">
                  <div className="wfa-ap-top">
                    <div>
                      <span className="wfa-ap-title-lg">{ap.title}</span>
                      <div className="wfa-ap-meta">
                        <span className="wfa-ap-domain-tag">{ap.domain}</span>
                        <span className="wfa-ap-priority-tag" style={{ color:priorityColor[ap.priority], background:`${priorityColor[ap.priority]}18` }}>
                          {ap.priority}
                        </span>
                        <span className="wfa-ap-date"><Clock size={11}/> Requested {ap.requestedAt}</span>
                        <span className="wfa-ap-by">by {ap.requestedBy}</span>
                      </div>
                    </div>
                    <span className={`wfa-days-badge lg ${ap.daysRemaining === 0 ? 'overdue' : ap.daysRemaining <= 1 ? 'urgent' : ''}`}>
                      {ap.daysRemaining === 0 ? '⚠️ Overdue' : `${ap.daysRemaining}d remaining`}
                    </span>
                  </div>
                  <p className="wfa-ap-desc">{ap.description}</p>
                  <div className="wfa-ap-actions">
                    <button className="wfa-approve-btn lg" onClick={() => resolveApproval(ap.id, true)}>
                      <CheckCircle size={14}/> Approve
                    </button>
                    <button className="wfa-reject-btn lg" onClick={() => resolveApproval(ap.id, false)}>
                      <XCircle size={14}/> Reject
                    </button>
                    <button className="wfa-view-btn" onClick={() => navigate('/dashboard')}>
                      <Eye size={14}/> View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: HISTORY ─────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="wfa-content">
          <div className="wfa-toolbar">
            <div className="wfa-filter-group">
              {['All','success','failed'].map(f => (
                <button key={f} className={`wfa-filter-btn ${histFilter === f ? 'active' : ''}`} onClick={() => setHistFilter(f)}>
                  {f === 'All' ? 'All Runs' : f === 'success' ? '✓ Success' : '✗ Failed'}
                </button>
              ))}
            </div>
            <span style={{ fontSize:12, color:'#64748b' }}>{filteredHistory.length} executions</span>
          </div>

          <div className="wfa-history-table-wrap">
            <div className="wfa-history-head">
              <span>Workflow</span><span>Status</span><span>Triggered</span>
              <span>Started At</span><span>Duration</span><span>Actions</span>
            </div>
            {filteredHistory.map(h => (
              <div key={h.id} className="wfa-history-row">
                <span className="wfa-hist-name">{h.workflowName}</span>
                <span className="wfa-hist-status" style={{ color:runStatusClr[h.status], background:`${runStatusClr[h.status]}18` }}>
                  {h.status === 'success' ? <CheckCircle size={11}/> : <XCircle size={11}/>}
                  {h.status}
                </span>
                <span className="wfa-hist-trigger">{h.trigger}</span>
                <span className="wfa-hist-date">{h.startedAt}</span>
                <span className="wfa-hist-dur">{h.duration}</span>
                <span className="wfa-hist-actions">{h.actions} step{h.actions !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default WorkflowAutomation
