import { useState } from 'react'
import {
  Calendar, Plus, Trash2, Edit3, CheckCircle, Clock,
  Mail, FileText, Bell, Play, Pause, RefreshCw,
  ChevronDown, X, Users, BarChart3
} from 'lucide-react'
import './ScheduledReports.css'

// ─────────────────────────────────────────────────────────────
// INITIAL DATA
// ─────────────────────────────────────────────────────────────
const INITIAL_SCHEDULES = [
  {
    id:1, name:'Monthly Finance Executive Summary',
    domain:'Finance', reportType:'Executive Brief',
    frequency:'Monthly', day:'1st of month', time:'08:00',
    recipients:['cfo@company.com','finance-team@company.com'],
    format:'PDF', active:true,
    lastSent:'2026-05-01 08:02', nextSend:'2026-06-01 08:00',
    sentCount:11, description:'Comprehensive monthly finance overview for C-suite'
  },
  {
    id:2, name:'Weekly Compliance Status',
    domain:'Audit', reportType:'Compliance Status',
    frequency:'Weekly', day:'Monday', time:'09:00',
    recipients:['cae@company.com','compliance@company.com'],
    format:'PDF', active:true,
    lastSent:'2026-05-13 09:01', nextSend:'2026-05-20 09:00',
    sentCount:48, description:'Weekly compliance status update for audit committee'
  },
  {
    id:3, name:'Daily Risk Dashboard',
    domain:'Risk', reportType:'Risk Report',
    frequency:'Daily', day:'Every weekday', time:'07:30',
    recipients:['cro@company.com','risk-team@company.com'],
    format:'Excel', active:true,
    lastSent:'2026-05-16 07:31', nextSend:'2026-05-19 07:30',
    sentCount:124, description:'Daily risk exposure metrics for the risk management team'
  },
  {
    id:4, name:'Quarterly Board Pack',
    domain:'Finance', reportType:'Detailed Analysis',
    frequency:'Quarterly', day:'Last day of quarter', time:'06:00',
    recipients:['board@company.com','ceo@company.com','cfo@company.com'],
    format:'PDF', active:true,
    lastSent:'2026-03-31 06:05', nextSend:'2026-06-30 06:00',
    sentCount:4, description:'Comprehensive quarterly board reporting package'
  },
  {
    id:5, name:'HR Monthly Analytics',
    domain:'HR', reportType:'Trend Analysis',
    frequency:'Monthly', day:'5th of month', time:'09:00',
    recipients:['chro@company.com','hr-head@company.com'],
    format:'Excel', active:false,
    lastSent:'2026-05-05 09:02', nextSend:'Paused',
    sentCount:14, description:'Monthly HR analytics including attrition and headcount'
  },
]

const DOMAINS    = ['Finance','Tax','Operations','Audit','Risk','Treasury','HR','Legal','IT','Sales','Supply Chain','ESG']
const REPORT_TYPES = ['Executive Brief','Detailed Analysis','Risk Report','Compliance Status','Trend Analysis']
const FREQUENCIES  = ['Daily','Weekly','Bi-weekly','Monthly','Quarterly','Annual']
const FORMATS      = ['PDF','Excel','CSV']
const DAYS_WEEKLY  = ['Monday','Tuesday','Wednesday','Thursday','Friday']
const DAYS_MONTHLY = ['1st','5th','10th','15th','20th','25th','Last day']

const EMPTY_FORM = {
  name:'', domain:'Finance', reportType:'Executive Brief',
  frequency:'Monthly', day:'1st', time:'09:00',
  recipients:'', format:'PDF', description:'', active:true,
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
function ScheduledReports() {
  const [schedules,   setSchedules]   = useState(INITIAL_SCHEDULES)
  const [showForm,    setShowForm]    = useState(false)
  const [editId,      setEditId]      = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [filterFreq,  setFilterFreq]  = useState('All')
  const [filterDom,   setFilterDom]   = useState('All')
  const [saved,       setSaved]       = useState(false)

  // Stats
  const stats = {
    total:   schedules.length,
    active:  schedules.filter(s => s.active).length,
    paused:  schedules.filter(s => !s.active).length,
    totalSent: schedules.reduce((sum, s) => sum + s.sentCount, 0),
  }

  // Filter
  const filtered = schedules.filter(s => {
    const freqOk = filterFreq === 'All' || s.frequency === filterFreq
    const domOk  = filterDom  === 'All' || s.domain    === filterDom
    return freqOk && domOk
  })

  // Toggle active
  const toggleActive = (id) =>
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, active: !s.active, nextSend: !s.active ? 'Scheduled' : 'Paused' } : s))

  // Delete
  const deleteSchedule = (id) => setSchedules(prev => prev.filter(s => s.id !== id))

  // Open edit
  const openEdit = (s) => {
    setForm({
      name: s.name, domain: s.domain, reportType: s.reportType,
      frequency: s.frequency, day: s.day, time: s.time,
      recipients: s.recipients.join(', '), format: s.format,
      description: s.description, active: s.active,
    })
    setEditId(s.id)
    setShowForm(true)
  }

  // Save form
  const saveForm = () => {
    if (!form.name.trim() || !form.recipients.trim()) return
    const recipList = form.recipients.split(',').map(r => r.trim()).filter(Boolean)

    if (editId) {
      setSchedules(prev => prev.map(s => s.id === editId
        ? { ...s, ...form, recipients: recipList }
        : s
      ))
    } else {
      const newSched = {
        id: Date.now(), ...form,
        recipients: recipList,
        lastSent: 'Never',
        nextSend: 'Scheduled',
        sentCount: 0,
      }
      setSchedules(prev => [newSched, ...prev])
    }
    setSaved(true)
    setTimeout(() => { setSaved(false); setShowForm(false); setEditId(null); setForm(EMPTY_FORM) }, 1200)
  }

  const cancelForm = () => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM) }

  const freqColor = { Daily:'#3b82f6', Weekly:'#10b981', 'Bi-weekly':'#14b8a6', Monthly:'#8b5cf6', Quarterly:'#f59e0b', Annual:'#ec4899' }

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <div className="sr-root">

      {/* Stats */}
      <div className="sr-stats-row">
        {[
          { label:'Total Schedules', value:stats.total,    color:'#3b82f6', icon:Calendar   },
          { label:'Active',          value:stats.active,   color:'#10b981', icon:Play        },
          { label:'Paused',          value:stats.paused,   color:'#f59e0b', icon:Pause       },
          { label:'Total Sent',      value:stats.totalSent,color:'#8b5cf6', icon:Mail        },
        ].map((s,i) => {
          const Icon = s.icon
          return (
            <div key={i} className="sr-stat-card" style={{ borderTopColor:s.color }}>
              <div className="sr-stat-icon" style={{ background:`${s.color}22`, color:s.color }}><Icon size={16}/></div>
              <div className="sr-stat-value">{s.value}</div>
              <div className="sr-stat-label">{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* Toolbar */}
      <div className="sr-toolbar">
        <div className="sr-filters">
          <select className="sr-filter-select" value={filterFreq} onChange={e => setFilterFreq(e.target.value)}>
            <option value="All">All Frequencies</option>
            {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
          </select>
          <select className="sr-filter-select" value={filterDom} onChange={e => setFilterDom(e.target.value)}>
            <option value="All">All Domains</option>
            {DOMAINS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <button className="sr-new-btn" onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true) }}>
          <Plus size={13}/> New Schedule
        </button>
      </div>

      {/* New / Edit Form */}
      {showForm && (
        <div className="sr-form-card">
          <div className="sr-form-header">
            <span className="sr-form-title">{editId ? 'Edit Schedule' : 'New Scheduled Report'}</span>
            <button className="sr-form-close" onClick={cancelForm}><X size={16}/></button>
          </div>

          {saved && (
            <div className="sr-saved-toast"><CheckCircle size={14}/> Schedule {editId ? 'updated' : 'created'} successfully!</div>
          )}

          <div className="sr-form-grid">
            <div className="sr-form-group full">
              <label className="sr-label">Schedule Name</label>
              <input className="sr-input" placeholder="e.g. Monthly Finance Executive Summary"
                value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))}/>
            </div>

            <div className="sr-form-group">
              <label className="sr-label">Domain</label>
              <select className="sr-select" value={form.domain} onChange={e => setForm(p=>({...p,domain:e.target.value}))}>
                {DOMAINS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="sr-form-group">
              <label className="sr-label">Report Type</label>
              <select className="sr-select" value={form.reportType} onChange={e => setForm(p=>({...p,reportType:e.target.value}))}>
                {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div className="sr-form-group">
              <label className="sr-label">Frequency</label>
              <select className="sr-select" value={form.frequency} onChange={e => setForm(p=>({...p,frequency:e.target.value}))}>
                {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            <div className="sr-form-group">
              <label className="sr-label">{form.frequency === 'Weekly' || form.frequency === 'Bi-weekly' ? 'Day of Week' : 'Day of Month'}</label>
              <select className="sr-select" value={form.day} onChange={e => setForm(p=>({...p,day:e.target.value}))}>
                {(form.frequency === 'Weekly' || form.frequency === 'Bi-weekly' ? DAYS_WEEKLY : DAYS_MONTHLY).map(d => <option key={d}>{d}</option>)}
              </select>
            </div>

            <div className="sr-form-group">
              <label className="sr-label">Time</label>
              <input className="sr-input" type="time" value={form.time} onChange={e => setForm(p=>({...p,time:e.target.value}))}/>
            </div>

            <div className="sr-form-group">
              <label className="sr-label">Format</label>
              <div className="sr-format-btns">
                {FORMATS.map(f => (
                  <button key={f} className={`sr-format-btn ${form.format===f?'active':''}`} onClick={() => setForm(p=>({...p,format:f}))}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="sr-form-group full">
              <label className="sr-label">Recipients (comma separated emails)</label>
              <input className="sr-input" placeholder="cfo@company.com, finance@company.com"
                value={form.recipients} onChange={e => setForm(p=>({...p,recipients:e.target.value}))}/>
            </div>

            <div className="sr-form-group full">
              <label className="sr-label">Description (optional)</label>
              <input className="sr-input" placeholder="Brief description of this scheduled report"
                value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))}/>
            </div>
          </div>

          <div className="sr-form-footer">
            <label className="sr-active-toggle">
              <input type="checkbox" checked={form.active} onChange={e => setForm(p=>({...p,active:e.target.checked}))}/>
              <span>Activate immediately</span>
            </label>
            <div style={{ display:'flex', gap:8 }}>
              <button className="sr-cancel-btn" onClick={cancelForm}>Cancel</button>
              <button className="sr-save-btn" onClick={saveForm} disabled={!form.name.trim()||!form.recipients.trim()}>
                <CheckCircle size={13}/> {editId ? 'Update' : 'Create'} Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Cards */}
      <div className="sr-schedules-list">
        {filtered.map(s => (
          <div key={s.id} className={`sr-schedule-card ${!s.active ? 'paused' : ''}`}>
            <div className="sr-sc-left">
              <div className="sr-sc-status-dot" style={{ background: s.active ? '#10b981' : '#f59e0b' }}/>
            </div>

            <div className="sr-sc-body">
              <div className="sr-sc-top">
                <span className="sr-sc-name">{s.name}</span>
                <div className="sr-sc-tags">
                  <span className="sr-sc-domain">{s.domain}</span>
                  <span className="sr-sc-freq" style={{ background:`${freqColor[s.frequency]}20`, color:freqColor[s.frequency] }}>
                    {s.frequency}
                  </span>
                  <span className="sr-sc-format">{s.format}</span>
                  {!s.active && <span className="sr-sc-paused-badge">Paused</span>}
                </div>
              </div>

              {s.description && <p className="sr-sc-desc">{s.description}</p>}

              <div className="sr-sc-meta-row">
                <span><Mail size={11}/> {s.recipients.length} recipient{s.recipients.length!==1?'s':''}</span>
                <span><Clock size={11}/> {s.time} · {s.day}</span>
                <span><RefreshCw size={11}/> Sent {s.sentCount}×</span>
                <span><Calendar size={11}/> Last: {s.lastSent}</span>
                <span style={{ color: s.active?'#10b981':'#f59e0b' }}>Next: {s.nextSend}</span>
              </div>

              <div className="sr-sc-recipients">
                {s.recipients.slice(0,3).map((r,i) => (
                  <span key={i} className="sr-recipient-chip"><Mail size={10}/>{r}</span>
                ))}
                {s.recipients.length > 3 && <span className="sr-recipient-chip muted">+{s.recipients.length-3} more</span>}
              </div>
            </div>

            <div className="sr-sc-actions">
              <button className="sr-sc-btn" onClick={() => toggleActive(s.id)} title={s.active?'Pause':'Resume'}>
                {s.active ? <Pause size={13}/> : <Play size={13}/>}
              </button>
              <button className="sr-sc-btn" onClick={() => openEdit(s)} title="Edit">
                <Edit3 size={13}/>
              </button>
              <button className="sr-sc-btn danger" onClick={() => deleteSchedule(s.id)} title="Delete">
                <Trash2 size={13}/>
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="sr-empty">
            <Calendar size={40} style={{ color:'#334155' }}/>
            <p>No schedules match the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScheduledReports
