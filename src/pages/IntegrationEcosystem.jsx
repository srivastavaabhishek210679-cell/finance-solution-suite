import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Link2, CheckCircle, XCircle, AlertTriangle,
  RefreshCw, Settings, Plus, Trash2, Play, Pause,
  Activity, Clock, Database, Zap, Globe, Shield,
  ChevronRight, Copy, Eye, EyeOff, BarChart3,
  Server, Wifi
} from 'lucide-react'
import './IntegrationEcosystem.css'
import { useIntegrations } from '../hooks/useIntegrations'
import { integrationManageAPI } from '../services/api'
import { SkeletonCard, SkeletonConnector } from '../components/Skeleton'

const ERP_CONNECTORS = [
  { id:'sap',      name:'SAP S/4HANA',           vendor:'SAP',       logo:'🟡', category:'ERP',  status:'connected',    lastSync:'2026-05-19 14:30', syncFreq:'Every 2h', records:124500, health:98, version:'2023.1',    modules:['Finance','Controlling','Materials Management','Sales'] },
  { id:'oracle',   name:'Oracle EBS',             vendor:'Oracle',    logo:'🔴', category:'ERP',  status:'connected',    lastSync:'2026-05-19 13:15', syncFreq:'Every 4h', records:89200,  health:95, version:'R12.2.9',   modules:['General Ledger','Accounts Payable','Accounts Receivable','Fixed Assets'] },
  { id:'dynamics', name:'Microsoft Dynamics 365', vendor:'Microsoft', logo:'🔵', category:'ERP',  status:'disconnected', lastSync:'Never',             syncFreq:'Not set',  records:0,      health:0,  version:'Latest',    modules:['Finance','Supply Chain','Project Operations'] },
]
const CRM_CONNECTORS = [
  { id:'salesforce',name:'Salesforce',            vendor:'Salesforce',logo:'☁️', category:'CRM',  status:'connected',    lastSync:'2026-05-19 15:00', syncFreq:'Every 1h', records:45300,  health:99, version:'Spring 24', modules:['Sales Cloud','Service Cloud','Analytics'] },
  { id:'hubspot',   name:'HubSpot CRM',           vendor:'HubSpot',   logo:'🟠', category:'CRM',  status:'connected',    lastSync:'2026-05-19 14:45', syncFreq:'Every 2h', records:18700,  health:97, version:'Latest',    modules:['Contacts','Deals','Reports','Marketing Hub'] },
  { id:'zoho',      name:'Zoho CRM',              vendor:'Zoho',      logo:'🟣', category:'CRM',  status:'error',        lastSync:'2026-05-18 09:00', syncFreq:'Daily',    records:5200,   health:62, version:'Latest',    modules:['Leads','Accounts','Opportunities'] },
]
const HRMS_CONNECTORS = [
  { id:'workday',  name:'Workday HCM',            vendor:'Workday',   logo:'🌐', category:'HRMS', status:'connected',    lastSync:'2026-05-19 12:00', syncFreq:'Every 6h', records:12400,  health:96, version:'2024.1',    modules:['HCM Core','Payroll','Benefits','Recruiting'] },
  { id:'bamboo',   name:'BambooHR',               vendor:'BambooHR',  logo:'🎋', category:'HRMS', status:'connected',    lastSync:'2026-05-19 11:30', syncFreq:'Daily',    records:3200,   health:94, version:'Latest',    modules:['Employee Records','Time Off','Performance','Reports'] },
  { id:'adp',      name:'ADP Workforce Now',      vendor:'ADP',       logo:'🔶', category:'HRMS', status:'disconnected', lastSync:'Never',             syncFreq:'Not set',  records:0,      health:0,  version:'Latest',    modules:['Payroll','HR','Benefits','Time & Attendance'] },
]
const ALL_CONNECTORS = [...ERP_CONNECTORS, ...CRM_CONNECTORS, ...HRMS_CONNECTORS]

const INITIAL_WEBHOOKS = [
  { id:1, name:'Report Created Notification', url:'https://api.yourapp.com/webhooks/report-created',  direction:'outbound', event:'report.created',   status:'active',   lastTriggered:'2026-05-19 14:32', successRate:99,  triggers:248, secret:'wh_sec_abc123' },
  { id:2, name:'Compliance Alert',            url:'https://api.yourapp.com/webhooks/compliance-alert', direction:'outbound', event:'compliance.breach', status:'active',   lastTriggered:'2026-05-18 09:15', successRate:100, triggers:12,  secret:'wh_sec_def456' },
  { id:3, name:'SAP Data Push',               url:'https://sap.yourcompany.com/inbound/finance',       direction:'inbound',  event:'erp.sync',         status:'active',   lastTriggered:'2026-05-19 14:30', successRate:98,  triggers:720, secret:'wh_sec_ghi789' },
  { id:4, name:'Salesforce Lead Sync',        url:'https://api.yourapp.com/webhooks/sf-leads',         direction:'inbound',  event:'crm.lead.created', status:'active',   lastTriggered:'2026-05-19 15:00', successRate:97,  triggers:156, secret:'wh_sec_jkl012' },
  { id:5, name:'HR Headcount Update',         url:'https://api.yourapp.com/webhooks/hr-update',        direction:'inbound',  event:'hrms.headcount',   status:'inactive', lastTriggered:'2026-05-10 08:00', successRate:95,  triggers:30,  secret:'wh_sec_mno345' },
]

const SYNC_LOGS = [
  { id:1,  system:'SAP S/4HANA', category:'ERP',  type:'Full Sync',        status:'success', records:1240, duration:'2m 14s', timestamp:'2026-05-19 14:30', size:'4.2 MB'  },
  { id:2,  system:'Salesforce',  category:'CRM',  type:'Incremental Sync', status:'success', records:45,   duration:'0m 28s', timestamp:'2026-05-19 15:00', size:'0.1 MB'  },
  { id:3,  system:'Workday HCM', category:'HRMS', type:'Full Sync',        status:'success', records:312,  duration:'1m 44s', timestamp:'2026-05-19 12:00', size:'1.1 MB'  },
  { id:4,  system:'HubSpot CRM', category:'CRM',  type:'Incremental Sync', status:'success', records:28,   duration:'0m 19s', timestamp:'2026-05-19 14:45', size:'0.08 MB' },
  { id:5,  system:'Oracle EBS',  category:'ERP',  type:'Incremental Sync', status:'success', records:890,  duration:'3m 02s', timestamp:'2026-05-19 13:15', size:'2.8 MB'  },
  { id:6,  system:'Zoho CRM',    category:'CRM',  type:'Full Sync',        status:'failed',  records:0,    duration:'0m 05s', timestamp:'2026-05-19 10:00', size:'0 MB',    error:'Authentication token expired' },
  { id:7,  system:'BambooHR',    category:'HRMS', type:'Incremental Sync', status:'success', records:15,   duration:'0m 22s', timestamp:'2026-05-19 11:30', size:'0.05 MB' },
  { id:8,  system:'SAP S/4HANA', category:'ERP',  type:'Incremental Sync', status:'success', records:340,  duration:'1m 08s', timestamp:'2026-05-19 12:30', size:'1.2 MB'  },
  { id:9,  system:'Salesforce',  category:'CRM',  type:'Incremental Sync', status:'success', records:22,   duration:'0m 15s', timestamp:'2026-05-19 14:00', size:'0.06 MB' },
  { id:10, system:'Zoho CRM',    category:'CRM',  type:'Incremental Sync', status:'failed',  records:0,    duration:'0m 03s', timestamp:'2026-05-18 14:00', size:'0 MB',    error:'Connection timeout' },
  { id:11, system:'Workday HCM', category:'HRMS', type:'Incremental Sync', status:'success', records:8,    duration:'0m 18s', timestamp:'2026-05-19 06:00', size:'0.02 MB' },
  { id:12, system:'Oracle EBS',  category:'ERP',  type:'Full Sync',        status:'warning', records:650,  duration:'5m 30s', timestamp:'2026-05-18 22:00', size:'2.1 MB',  error:'3 records skipped — schema mismatch' },
]

const EMPTY_WEBHOOK = { name:'', url:'', direction:'outbound', event:'report.created', status:'active' }

const STATUS_CONFIG = {
  connected:    { color:'#10b981', bg:'#10b98120', label:'Connected',    icon: CheckCircle   },
  disconnected: { color:'#64748b', bg:'#64748b20', label:'Disconnected', icon: XCircle       },
  error:        { color:'#ef4444', bg:'#ef444420', label:'Error',        icon: AlertTriangle },
  pending:      { color:'#f59e0b', bg:'#f59e0b20', label:'Pending',      icon: Clock         },
}

// ── Merge live API data into mock connector shape ─────────────────────────────
function mergeWithLive(mockConns, liveSources) {
  if (!liveSources?.length) return mockConns
  return mockConns.map(mock => {
    const mockKey = mock.name.toLowerCase().split(/[\s/]/)[0]
    const live = liveSources.find(s => {
      const liveKey = s.source_name.toLowerCase().split(/[\s/]/)[0]
      return liveKey === mockKey || mockKey.startsWith(liveKey) || liveKey.startsWith(mockKey)
    })
    if (!live) return mock
    return {
      ...mock,
      status:    !live.is_active ? 'disconnected'
               : live.last_sync_status === 'failed' ? 'error'
               : 'connected',
      lastSync:  live.last_sync ? new Date(live.last_sync).toLocaleString() : mock.lastSync,
      records:   live.last_sync_count ?? mock.records,
      _sourceId: live.source_id,
    }
  })
}

// ── Connector Card ────────────────────────────────────────────────────────────
function ConnectorCard({ conn, onConnect, onDisconnect, onSync, onConfigure }) {
  const cfg    = STATUS_CONFIG[conn.status] || STATUS_CONFIG.disconnected
  const Icon   = cfg.icon
  const isConn = conn.status === 'connected'
  return (
    <div className="ie-conn-card" style={{ borderTopColor: cfg.color }}>
      <div className="ie-conn-header">
        <div className="ie-conn-logo">{conn.logo}</div>
        <div className="ie-conn-info">
          <div className="ie-conn-name">{conn.name}</div>
          <div className="ie-conn-vendor">{conn.vendor} · v{conn.version}</div>
        </div>
        <div className="ie-conn-status" style={{ background:cfg.bg, color:cfg.color }}>
          <Icon size={11}/> {cfg.label}
        </div>
      </div>
      {isConn && (
        <>
          <div className="ie-conn-health-row">
            <span className="ie-conn-health-label">Health Score</span>
            <span className="ie-conn-health-val" style={{ color:conn.health>=90?'#10b981':conn.health>=70?'#f59e0b':'#ef4444' }}>{conn.health}%</span>
          </div>
          <div className="ie-health-bar">
            <div className="ie-health-bar-fill" style={{ width:`${conn.health}%`, background:conn.health>=90?'#10b981':conn.health>=70?'#f59e0b':'#ef4444' }}/>
          </div>
          <div className="ie-conn-stats">
            <div className="ie-conn-stat"><Database size={11}/><span>{conn.records.toLocaleString()} records</span></div>
            <div className="ie-conn-stat"><Clock size={11}/><span>{conn.syncFreq}</span></div>
          </div>
          <div className="ie-conn-modules">
            {conn.modules.map(m => <span key={m} className="ie-module-chip">{m}</span>)}
          </div>
          <div className="ie-conn-last-sync"><RefreshCw size={10}/> Last sync: {conn.lastSync}</div>
        </>
      )}
      <div className="ie-conn-actions">
        {isConn ? (
          <>
            <button className="ie-btn-sync"       onClick={() => onSync(conn.id)}><RefreshCw size={12}/> Sync Now</button>
            <button className="ie-btn-config"     onClick={() => onConfigure(conn.id)}><Settings size={12}/> Configure</button>
            <button className="ie-btn-disconnect" onClick={() => onDisconnect(conn.id)}><XCircle size={12}/> Disconnect</button>
          </>
        ) : (
          <button className="ie-btn-connect" onClick={() => onConnect(conn.id)}><Link2 size={12}/> Connect</button>
        )}
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function IntegrationEcosystem() {
  const navigate = useNavigate()

  // Live data hook
  const {
    integrations: liveIntegrations,
    summary:      liveSummary,
    loading: liveLoading, triggerSync: apiSync,
    isLive,
  } = useIntegrations()

  const [activeTab,   setActiveTab]   = useState('overview')
  const [connectors,  setConnectors]  = useState(ALL_CONNECTORS)
  const [webhooks,    setWebhooks]    = useState(INITIAL_WEBHOOKS)
  const [showWHForm,  setShowWHForm]  = useState(false)
  const [whForm,      setWHForm]      = useState(EMPTY_WEBHOOK)
  const [logFilter,   setLogFilter]   = useState({ status:'All', category:'All' })
  const [syncing,     setSyncing]     = useState({})
  const [showSecrets, setShowSecrets] = useState({})
  const [toast,       setToast]       = useState(null)

  // Sync live data into connector state
  useEffect(() => {
    if (liveIntegrations?.length) {
      setConnectors(mergeWithLive(ALL_CONNECTORS, liveIntegrations))
    }
  }, [liveIntegrations]) // eslint-disable-line


  useEffect(() => {
    integrationManageAPI.getAll().then(r => {
      const data = r?.data?.data || r?.data || []
      if (data.length) {
        setConnectors(prev => prev.map(c => {
          const live = data.find(d => d.source_name.toLowerCase().includes(c.name.toLowerCase().split(" ")[0]) || c.name.toLowerCase().includes(d.source_name.toLowerCase().split(" ")[0]))
          if (!live) return c
          return { ...c, _dbId: live.source_id, status: live.connection_status === 'connected' ? 'connected' : c.status, health: live.health_score > 0 ? live.health_score : c.health, records: live.last_sync_count || c.records, lastSync: live.last_sync ? new Date(live.last_sync).toLocaleString() : c.lastSync }
        }))
    }).catch(() => {})
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleConnect = async (id) => {
    const conn = connectors.find(c => c.id === id)
    const dbId = conn?._dbId || id
    try {
      await integrationManageAPI.connect(dbId, {})
      setConnectors(p => p.map(c => c.id===id ? {...c, status:'connected', health:88} : c))
      showToast('Integration connected!')
    } catch { showToast('Connect failed', 'error') }
  }
  const handleDisconnect = async (id) => {
    const conn = connectors.find(c => c.id === id)
    const dbId = conn?._dbId || id
    try {
      await integrationManageAPI.disconnect(dbId)
      setConnectors(p => p.map(c => c.id===id ? {...c, status:'disconnected', health:0} : c))
      showToast('Disconnected', 'warning')
    } catch { showToast('Disconnect failed', 'error') }
  }

  const handleSync = async (id) => {
    const conn = connectors.find(c => c.id === id)
    const dbId = conn?._dbId || id
    setSyncing(p => ({...p, [id]: true}))
    try {
      const r = await integrationManageAPI.sync(dbId)
      const count = r?.data?.data?.last_sync_count || 0
      setConnectors(p => p.map(c => c.id===id ? {...c, lastSync: new Date().toLocaleString(), records: c.records + count} : c))
      showToast('Sync done � ' + count + ' records')
    } catch { showToast('Sync failed', 'warning') }
    finally { setSyncing(p => ({...p, [id]: false})) }
  }

  const handleConfigure  = ()   => showToast('Configuration panel � coming soon')
  const deleteWebhook = (id) => { setWebhooks(p => p.filter(w => w.id!==id)); showToast('Webhook deleted') }
  const toggleWebhook = (id) => setWebhooks(p => p.map(w => w.id===id ? {...w, status:w.status==='active'?'inactive':'active'} : w))
  const saveWebhook   = () => {
    if (!whForm.name.trim() || !whForm.url.trim()) return
    setWebhooks(p => [{id:Date.now(), ...whForm, lastTriggered:'Never', successRate:100, triggers:0, secret:`wh_sec_${Math.random().toString(36).slice(2,8)}`}, ...p])
    setWHForm(EMPTY_WEBHOOK); setShowWHForm(false); showToast('Webhook created!')
  }

  // Stats — live summary when available
  const connectedCount = liveSummary?.active ?? connectors.filter(c => c.status==='connected').length
  const errorCount     = liveSummary?.errors ?? connectors.filter(c => c.status==='error').length
  const totalRecords   = connectors.reduce((s,c) => s + c.records, 0)
  const avgHealth      = connectors.filter(c=>c.status==='connected').reduce((s,c,_,a)=>s+c.health/a.length,0).toFixed(0)

  const filteredLogs = SYNC_LOGS.filter(l =>
    (logFilter.status==='All'   || l.status===logFilter.status) &&
    (logFilter.category==='All' || l.category===logFilter.category)
  )

  const TABS = [
    { id:'overview', label:'Overview',  icon: Activity },
    { id:'erp',      label:'ERP',       icon: Server   },
    { id:'crm',      label:'CRM',       icon: Globe    },
    { id:'hrms',     label:'HRMS',      icon: Database },
    { id:'webhooks', label:'Webhooks',  icon: Zap      },
    { id:'logs',     label:'Sync Logs', icon: Clock    },
  ]
  const logClr = { success:'#10b981', failed:'#ef4444', warning:'#f59e0b' }

  return (
    <div className="ie-root">

      {toast && (
        <div className={`ie-toast ${toast.type}`}>
          {toast.type==='success'?<CheckCircle size={14}/>:<AlertTriangle size={14}/>} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="ie-header">
        <div className="ie-header-left">
          <button className="ie-back-btn" onClick={()=>navigate('/dashboard')}><ArrowLeft size={14}/> Back</button>
          <div className="ie-title-group">
            <div className="ie-title-icon"><Link2 size={20}/></div>
            <div>
              <h1 className="ie-title">Integration Ecosystem</h1>
              <p className="ie-subtitle">ERP · CRM · HRMS · Webhooks · Sync Logs</p>
            </div>
          </div>
        </div>
        <div className="ie-header-badges">
          <span className="ie-badge connected"><Wifi size={11}/> {connectedCount} Connected</span>
          {errorCount>0 && <span className="ie-badge error"><AlertTriangle size={11}/> {errorCount} Error</span>}
          <span className="ie-badge neutral"><Database size={11}/> {totalRecords.toLocaleString()} Records</span>
          {isLive && (
            <span style={{fontSize:10,padding:'2px 8px',borderRadius:10,background:'#10b98122',color:'#10b981',fontWeight:600,letterSpacing:'0.04em'}}>
              ● LIVE
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="ie-tab-bar">
        {TABS.map(t => { const Icon=t.icon; return (
          <button key={t.id} className={`ie-tab-btn ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>
            <Icon size={13}/>{t.label}
          </button>
        )})}
      </div>

      {/* OVERVIEW */}
      {activeTab==='overview' && (
        <div className="ie-content">
          <div className="ie-stats-grid">
            {[
              {label:'Total Integrations',  value:connectors.length,                              color:'#3b82f6',icon:Link2       },
              {label:'Connected',           value:connectedCount,                                  color:'#10b981',icon:CheckCircle },
              {label:'With Errors',         value:errorCount,                                      color:'#ef4444',icon:XCircle     },
              {label:'Avg Health Score',    value:`${avgHealth}%`,                                color:'#14b8a6',icon:Activity    },
              {label:'Total Records Synced',value:totalRecords.toLocaleString(),                   color:'#8b5cf6',icon:Database    },
              {label:'Active Webhooks',     value:webhooks.filter(w=>w.status==='active').length,  color:'#f59e0b',icon:Zap         },
            ].map((s,i)=>{ const Icon=s.icon; return (
              <div key={i} className="ie-stat-card" style={{borderTopColor:s.color}}>
                <div className="ie-stat-icon" style={{background:`${s.color}22`,color:s.color}}><Icon size={16}/></div>
                <div className="ie-stat-value">{s.value}</div>
                <div className="ie-stat-label">{s.label}</div>
              </div>
            )})}
          </div>

          <div className="ie-section">
            <div className="ie-section-title"><Activity size={14}/> Integration Health Overview</div>
            <div className="ie-health-overview">
              {connectors.map(c => { const cfg=STATUS_CONFIG[c.status]||STATUS_CONFIG.disconnected; const Icon=cfg.icon; return (
                <div key={c.id} className="ie-health-row-item">
                  <span className="ie-health-emoji">{c.logo}</span>
                  <div className="ie-health-name-wrap">
                    <span className="ie-health-name">{c.name}</span>
                    <span className="ie-health-cat">{c.category}</span>
                  </div>
                  <div className="ie-health-bar-wrap">
                    <div className="ie-health-bar-bg">
                      <div className="ie-health-bar-fill" style={{width:`${c.health}%`,background:c.health>=90?'#10b981':c.health>=70?'#f59e0b':'#64748b'}}/>
                    </div>
                  </div>
                  <span style={{fontSize:11,fontWeight:700,color:c.health>=90?'#10b981':c.health>=70?'#f59e0b':'#64748b',width:32,textAlign:'right'}}>{c.health}%</span>
                  <span className="ie-health-status-badge" style={{background:cfg.bg,color:cfg.color}}><Icon size={10}/> {cfg.label}</span>
                  <button className="ie-health-sync-btn" onClick={()=>handleSync(c.id)} disabled={c.status!=='connected'||syncing[c.id]}>
                    <RefreshCw size={11} style={{animation:syncing[c.id]?'ie-spin 1s linear infinite':'none'}}/>
                  </button>
                </div>
              )})}
            </div>
          </div>

          <div className="ie-section">
            <div className="ie-section-title"><Clock size={14}/> Recent Sync Activity</div>
            <div className="ie-mini-logs">
              {SYNC_LOGS.slice(0,6).map(l => (
                <div key={l.id} className="ie-mini-log-row">
                  <span className="ie-mini-log-status" style={{color:logClr[l.status]}}>
                    {l.status==='success'?<CheckCircle size={12}/>:l.status==='failed'?<XCircle size={12}/>:<AlertTriangle size={12}/>}
                  </span>
                  <span className="ie-mini-log-system">{l.system}</span>
                  <span className="ie-mini-log-type">{l.type}</span>
                  <span className="ie-mini-log-records">{l.records.toLocaleString()} records</span>
                  <span className="ie-mini-log-time">{l.timestamp}</span>
                  <span className="ie-mini-log-dur">{l.duration}</span>
                </div>
              ))}
            </div>
            <button className="ie-view-all-btn" onClick={()=>setActiveTab('logs')}>View All Logs <ChevronRight size={12}/></button>
          </div>
        </div>
      )}

      {/* ERP / CRM / HRMS */}
      {['erp','crm','hrms'].includes(activeTab) && (
        <div className="ie-content">
          <div className="ie-connectors-header">
            <div>
              <h2 className="ie-section-title" style={{fontSize:16,marginBottom:4}}>
                {activeTab==='erp'?'ERP Connectors':activeTab==='crm'?'CRM Connectors':'HRMS Connectors'}
              </h2>
              <p style={{fontSize:12,color:'#64748b',margin:0}}>
                {activeTab==='erp'?'Connect SAP, Oracle, and Microsoft Dynamics for financial data sync':
                 activeTab==='crm'?'Sync Salesforce, HubSpot, and Zoho CRM data':
                 'Connect Workday, BambooHR, and ADP for HR data integration'}
              </p>
            </div>
          </div>
          <div className="ie-connectors-grid">
      {liveLoading
        ? Array(3).fill(0).map((_, i) => <SkeletonConnector key={i} />)
        : (activeTab==='erp'?ERP_CONNECTORS:activeTab==='crm'?CRM_CONNECTORS:HRMS_CONNECTORS).map(conn => {
              const live = connectors.find(c=>c.id===conn.id)||conn
              return <ConnectorCard key={conn.id} conn={live} onConnect={handleConnect} onDisconnect={handleDisconnect} onSync={handleSync} onConfigure={handleConfigure}/>
            })}
          </div>
        </div>
      )}

      {/* WEBHOOKS */}
      {activeTab==='webhooks' && (
        <div className="ie-content">
          <div className="ie-connectors-header">
            <div>
              <h2 className="ie-section-title" style={{fontSize:16,marginBottom:4}}>Webhook Manager</h2>
              <p style={{fontSize:12,color:'#64748b',margin:0}}>Manage inbound and outbound webhooks for real-time event notifications</p>
            </div>
            <button className="ie-add-btn" onClick={()=>setShowWHForm(!showWHForm)}><Plus size={13}/> New Webhook</button>
          </div>
          {showWHForm && (
            <div className="ie-wh-form">
              <div className="ie-wh-form-title">New Webhook</div>
              <div className="ie-wh-form-grid">
                <div className="ie-form-group full"><label className="ie-label">Webhook Name</label><input className="ie-input" placeholder="e.g. Report Created Notification" value={whForm.name} onChange={e=>setWHForm(p=>({...p,name:e.target.value}))}/></div>
                <div className="ie-form-group full"><label className="ie-label">Endpoint URL</label><input className="ie-input" placeholder="https://api.example.com/webhooks/..." value={whForm.url} onChange={e=>setWHForm(p=>({...p,url:e.target.value}))}/></div>
                <div className="ie-form-group"><label className="ie-label">Direction</label>
                  <select className="ie-select" value={whForm.direction} onChange={e=>setWHForm(p=>({...p,direction:e.target.value}))}>
                    <option value="outbound">Outbound (we send)</option><option value="inbound">Inbound (we receive)</option>
                  </select>
                </div>
                <div className="ie-form-group"><label className="ie-label">Event Type</label>
                  <select className="ie-select" value={whForm.event} onChange={e=>setWHForm(p=>({...p,event:e.target.value}))}>
                    {['report.created','report.updated','compliance.breach','erp.sync','crm.lead.created','hrms.headcount','workflow.completed'].map(ev=><option key={ev}>{ev}</option>)}
                  </select>
                </div>
              </div>
              <div className="ie-wh-form-footer">
                <button onClick={()=>setShowWHForm(false)} className="ie-btn-cancel">Cancel</button>
                <button onClick={saveWebhook} disabled={!whForm.name.trim()||!whForm.url.trim()} className="ie-btn-save"><CheckCircle size={12}/> Create Webhook</button>
              </div>
            </div>
          )}
          <div className="ie-webhooks-list">
            {webhooks.map(wh => (
              <div key={wh.id} className="ie-wh-card">
                <div className="ie-wh-header">
                  <div className="ie-wh-name-row">
                    <span className="ie-wh-name">{wh.name}</span>
                    <span className={`ie-wh-direction ${wh.direction}`}>{wh.direction==='outbound'?'→ Outbound':'← Inbound'}</span>
                    <span className={`ie-wh-status ${wh.status}`}>{wh.status}</span>
                  </div>
                  <div className="ie-wh-actions">
                    <button className="ie-wh-btn" onClick={()=>toggleWebhook(wh.id)}>{wh.status==='active'?<Pause size={12}/>:<Play size={12}/>}</button>
                    <button className="ie-wh-btn danger" onClick={()=>deleteWebhook(wh.id)}><Trash2 size={12}/></button>
                  </div>
                </div>
                <div className="ie-wh-url"><Globe size={11} style={{color:'#475569',flexShrink:0}}/><span>{wh.url}</span></div>
                <div className="ie-wh-meta">
                  <span><Zap size={11}/> {wh.event}</span>
                  <span><Activity size={11}/> {wh.successRate}% success</span>
                  <span><BarChart3 size={11}/> {wh.triggers} triggers</span>
                  <span><Clock size={11}/> Last: {wh.lastTriggered}</span>
                </div>
                <div className="ie-wh-secret">
                  <Shield size={11} style={{color:'#475569'}}/>
                  <span className="ie-wh-secret-val">{showSecrets[wh.id]?wh.secret:'••••••••••••••••'}</span>
                  <button className="ie-wh-secret-btn" onClick={()=>setShowSecrets(p=>({...p,[wh.id]:!p[wh.id]}))}>{showSecrets[wh.id]?<EyeOff size={11}/>:<Eye size={11}/>}</button>
                  <button className="ie-wh-secret-btn" onClick={()=>{navigator.clipboard.writeText(wh.secret);showToast('Secret copied!')}}><Copy size={11}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SYNC LOGS */}
      {activeTab==='logs' && (
        <div className="ie-content">
          <div className="ie-connectors-header">
            <div>
              <h2 className="ie-section-title" style={{fontSize:16,marginBottom:4}}>Sync Logs</h2>
              <p style={{fontSize:12,color:'#64748b',margin:0}}>{filteredLogs.length} events · {SYNC_LOGS.filter(l=>l.status==='failed').length} failures</p>
            </div>
            <div className="ie-log-filters">
              {[{key:'status',opts:['All','success','failed','warning']},{key:'category',opts:['All','ERP','CRM','HRMS']}].map(f=>(
                <select key={f.key} className="ie-filter-select" value={logFilter[f.key]} onChange={e=>setLogFilter(p=>({...p,[f.key]:e.target.value}))}>
                  {f.opts.map(o=><option key={o}>{o}</option>)}
                </select>
              ))}
            </div>
          </div>
          <div className="ie-logs-table-wrap">
            <div className="ie-logs-head"><span>System</span><span>Category</span><span>Type</span><span>Status</span><span>Records</span><span>Duration</span><span>Size</span><span>Timestamp</span></div>
            {filteredLogs.map(l => (
              <div key={l.id} className="ie-log-row">
                <span className="ie-log-system">{l.system}</span>
                <span className="ie-log-cat">{l.category}</span>
                <span className="ie-log-type">{l.type}</span>
                <span className="ie-log-status" style={{color:logClr[l.status],background:`${logClr[l.status]}18`}}>
                  {l.status==='success'?<CheckCircle size={11}/>:l.status==='failed'?<XCircle size={11}/>:<AlertTriangle size={11}/>} {l.status}
                </span>
                <span className="ie-log-records">{l.records.toLocaleString()}</span>
                <span className="ie-log-dur">{l.duration}</span>
                <span className="ie-log-size">{l.size}</span>
                <span className="ie-log-time">{l.timestamp}</span>
              </div>
            ))}
          </div>
          <div className="ie-log-stats">
            {[
              {v:SYNC_LOGS.filter(l=>l.status==='success').length, l:'Successful Syncs', c:'#10b981'},
              {v:SYNC_LOGS.filter(l=>l.status==='failed').length,  l:'Failed Syncs',     c:'#ef4444'},
              {v:SYNC_LOGS.filter(l=>l.status==='warning').length, l:'Warnings',         c:'#f59e0b'},
              {v:SYNC_LOGS.reduce((s,l)=>s+l.records,0).toLocaleString(), l:'Total Records', c:'#3b82f6'},
            ].map((s,i)=>(
              <div key={i} className="ie-log-stat-card" style={{borderColor:s.c}}>
                <div style={{fontSize:24,fontWeight:800,color:s.c}}>{s.v}</div>
                <div style={{fontSize:11,color:'#64748b'}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}




