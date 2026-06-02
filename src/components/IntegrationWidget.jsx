import { useNavigate } from 'react-router-dom'
import { Link2, CheckCircle, AlertTriangle, XCircle, ChevronRight, RefreshCw } from 'lucide-react'
import './IntegrationWidget.css'

// Same connector data — lightweight version
const CONNECTORS = [
  { name:'SAP S/4HANA',   status:'connected',    health:98, category:'ERP', logo:'🟡' },
  { name:'Oracle EBS',    status:'connected',    health:95, category:'ERP', logo:'🔴' },
  { name:'Dynamics 365',  status:'disconnected', health:0,  category:'ERP', logo:'🔵' },
  { name:'Salesforce',    status:'connected',    health:99, category:'CRM', logo:'☁️' },
  { name:'HubSpot',       status:'connected',    health:97, category:'CRM', logo:'🟠' },
  { name:'Zoho CRM',      status:'error',        health:62, category:'CRM', logo:'🟣' },
  { name:'Workday HCM',   status:'connected',    health:96, category:'HRMS',logo:'🌐' },
  { name:'BambooHR',      status:'connected',    health:94, category:'HRMS',logo:'🎋' },
  { name:'ADP',           status:'disconnected', health:0,  category:'HRMS',logo:'🔶' },
]

const STATUS_ICON = { connected: CheckCircle, disconnected: XCircle, error: AlertTriangle }
const STATUS_COLOR= { connected:'#10b981', disconnected:'#64748b', error:'#ef4444' }

export default function IntegrationWidget() {
  const navigate    = useNavigate()
  const connected   = CONNECTORS.filter(c=>c.status==='connected').length
  const errors      = CONNECTORS.filter(c=>c.status==='error').length
  const avgHealth   = CONNECTORS.filter(c=>c.status==='connected').reduce((s,c,_,a)=>s+c.health/a.length,0).toFixed(0)

  return (
    <div className="iw-root" onClick={()=>navigate('/integration-ecosystem')}>
      <div className="iw-header">
        <div className="iw-header-left">
          <div className="iw-icon"><Link2 size={14}/></div>
          <div>
            <div className="iw-title">Integration Ecosystem</div>
            <div className="iw-subtitle">ERP · CRM · HRMS</div>
          </div>
        </div>
        <ChevronRight size={14} style={{ color:'#475569' }}/>
      </div>

      {/* Quick Stats */}
      <div className="iw-stats">
        <div className="iw-stat">
          <span className="iw-stat-val" style={{ color:'#10b981' }}>{connected}</span>
          <span className="iw-stat-lbl">Connected</span>
        </div>
        <div className="iw-divider"/>
        <div className="iw-stat">
          <span className="iw-stat-val" style={{ color: errors>0?'#ef4444':'#64748b' }}>{errors}</span>
          <span className="iw-stat-lbl">Errors</span>
        </div>
        <div className="iw-divider"/>
        <div className="iw-stat">
          <span className="iw-stat-val" style={{ color:'#14b8a6' }}>{avgHealth}%</span>
          <span className="iw-stat-lbl">Avg Health</span>
        </div>
      </div>

      {/* Connector Status Dots */}
      <div className="iw-connectors">
        {CONNECTORS.map(c => {
          const Icon  = STATUS_ICON[c.status] || XCircle
          const color = STATUS_COLOR[c.status] || '#64748b'
          return (
            <div key={c.name} className="iw-connector-dot" title={`${c.name} — ${c.status} ${c.health?`(${c.health}%)`:''}`}>
              <span style={{ fontSize:12 }}>{c.logo}</span>
              <div className="iw-dot" style={{ background: color }}/>
            </div>
          )
        })}
      </div>

      {/* Health Bar */}
      <div className="iw-health-section">
        <div className="iw-health-label">
          <span>Overall Health</span>
          <span style={{ color:'#14b8a6', fontWeight:600 }}>{avgHealth}%</span>
        </div>
        <div className="iw-health-bar">
          <div className="iw-health-fill" style={{ width:`${avgHealth}%` }}/>
        </div>
      </div>

      {errors > 0 && (
        <div className="iw-alert">
          <AlertTriangle size={11} style={{ color:'#ef4444', flexShrink:0 }}/>
          <span>{errors} integration{errors>1?'s':''} require attention</span>
        </div>
      )}
    </div>
  )
}

