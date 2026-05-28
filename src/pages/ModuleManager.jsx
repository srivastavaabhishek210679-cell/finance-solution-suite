import React, { useState } from 'react'
import { Package, Search, Download, Trash2, Settings, CheckCircle, XCircle, AlertCircle, RefreshCw, BarChart3, Link } from 'lucide-react'
import './ModuleManager.css'

function ModuleManager() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [showMarketplace, setShowMarketplace] = useState(false)

  const [modules, setModules] = useState([
    { id:1, name:'Financial Statements Package', category:'report', version:'2.1.0', status:'active', description:'Complete P&L, Balance Sheet, Cash Flow reports', reports:45, size:'12.5 MB', lastUpdated:'2 days ago', dependencies:[] },
    { id:2, name:'Tax Compliance Module', category:'report', version:'3.0.1', status:'active', description:'GST, Income Tax, TDS reporting and calculations', reports:28, size:'8.2 MB', lastUpdated:'1 week ago', dependencies:['Financial Statements Package'] },
    { id:3, name:'HR Analytics Suite', category:'report', version:'1.5.0', status:'active', description:'Workforce analytics, attrition, payroll reports', reports:32, size:'9.1 MB', lastUpdated:'3 days ago', dependencies:[] },
    { id:4, name:'Risk Management Module', category:'compliance', version:'2.0.0', status:'inactive', description:'Risk assessment, audit trails, compliance tracking', reports:18, size:'6.8 MB', lastUpdated:'2 weeks ago', dependencies:[] },
    { id:5, name:'Executive Dashboard Pack', category:'dashboard', version:'1.2.0', status:'active', description:'Board-level KPI dashboards and executive summaries', reports:12, size:'4.5 MB', lastUpdated:'5 days ago', dependencies:['Financial Statements Package'] },
    { id:6, name:'Supply Chain Analytics', category:'report', version:'1.0.0', status:'inactive', description:'Inventory, procurement, logistics reporting', reports:22, size:'7.3 MB', lastUpdated:'1 month ago', dependencies:[] },
  ])

  const [availableModules, setAvailableModules] = useState([
    { id:7, name:'Banking Reconciliation', category:'report', version:'1.2.0', description:'Automated bank statement reconciliation', reports:12, size:'6.4 MB', price:'Free', dependencies:[] },
    { id:8, name:'Inventory Management', category:'report', version:'2.0.0', description:'Stock tracking and warehouse management', reports:22, size:'11.2 MB', price:'$49/month', dependencies:[] },
    { id:9, name:'QuickBooks Connector', category:'integration', version:'3.1.0', description:'Sync data with QuickBooks Online', reports:0, size:'8.9 MB', price:'Free', dependencies:[] },
  ])

  const stats = [
    { label:'Installed Modules', value: modules.length, icon: Package, color:'#3b82f6' },
    { label:'Active Modules', value: modules.filter(m => m.status==='active').length, icon: CheckCircle, color:'#10b981' },
    { label:'Inactive Modules', value: modules.filter(m => m.status==='inactive').length, icon: XCircle, color:'#ef4444' },
    { label:'Total Reports', value: modules.reduce((s,m) => s+m.reports, 0), icon: BarChart3, color:'#8b5cf6' },
  ]

  const filteredModules = modules.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'all' || m.status === filterStatus
    const matchCategory = filterCategory === 'all' || m.category === filterCategory
    return matchSearch && matchStatus && matchCategory
  })

  const toggleModule = (id) => setModules(modules.map(m => m.id===id ? {...m, status: m.status==='active'?'inactive':'active'} : m))

  const uninstallModule = (id) => {
    const mod = modules.find(m => m.id===id)
    const deps = modules.filter(m => (m.dependencies||[]).includes(mod.name))
    if (deps.length > 0) { alert(`Cannot uninstall. Required by: ${deps.map(m=>m.name).join(', ')}`); return }
    if (window.confirm(`Uninstall ${mod.name}?`)) setModules(modules.filter(m => m.id!==id))
  }

  const installModule = (mod) => {
    setModules([...modules, {...mod, status:'active', lastUpdated:'Just now'}])
    setAvailableModules(availableModules.filter(m => m.id!==mod.id))
    alert(`${mod.name} installed successfully!`)
  }

  const MARKETPLACE_MODULES = [
    { name:'Advanced Tax Engine', price:'$99/month', desc:'Multi-jurisdiction tax calculations', category:'Tax' },
    { name:'ESG Reporting Suite', price:'$149/month', desc:'Environmental & social governance reports', category:'ESG' },
    { name:'Payroll Integration', price:'Free', desc:'Connect payroll providers automatically', category:'HR' },
    { name:'Budget Planning Tool', price:'$79/month', desc:'Interactive budget forecasting & planning', category:'Finance' },
    { name:'Audit Trail Module', price:'Free', desc:'Complete audit log tracking & compliance', category:'Compliance' },
    { name:'Multi-Currency Module', price:'$59/month', desc:'Handle 150+ currencies seamlessly', category:'Finance' },
  ]

  return (
    <div className="module-manager-page">
      <div className="module-header">
        <div className="header-content">
          <div className="title-section">
            <Package size={32} className="header-icon" />
            <div>
              <h1>Module Manager</h1>
              <p>Install, update and manage report modules</p>
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowMarketplace(true)}>
          <Download size={18} />
          Browse Marketplace
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((s,i) => {
          const Icon = s.icon
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{background:`${s.color}20`,color:s.color}}><Icon size={20}/></div>
              <div className="stat-content">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search size={16}/>
          <input placeholder="Search modules..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
        </div>
        <div className="filter-tabs">
          {['all','report','compliance','dashboard','integration'].map(cat => (
            <button key={cat} className={filterCategory===cat?'active':''} onClick={() => setFilterCategory(cat)}>
              {cat==='all'?'All Categories':cat.charAt(0).toUpperCase()+cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="status-filters">
          {['all','active','inactive'].map(s => (
            <button key={s} className={filterStatus===s?'active':''} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="modules-section">
        <h2>Installed Modules ({filteredModules.length})</h2>
        <div className="modules-grid">
          {filteredModules.map(mod => (
            <div key={mod.id} className={`module-card ${mod.status}`}>
              <div className="module-card-header">
                <div className="module-icon"><Package size={20}/></div>
                <div className="module-info">
                  <h3>{mod.name}</h3>
                  <span className="module-version">v{mod.version}</span>
                </div>
                <div className="module-status">
                  {mod.status==='active' ? <CheckCircle size={16} style={{color:'#10b981'}}/> : <XCircle size={16} style={{color:'#ef4444'}}/>}
                </div>
              </div>
              <p className="module-description">{mod.description}</p>
              <div className="module-meta">
                <span>{mod.reports} reports</span>
                <span>{mod.size}</span>
                <span>Updated {mod.lastUpdated}</span>
              </div>
              {(mod.dependencies||[]).length > 0 && (
                <div className="module-dependencies">
                  <AlertCircle size={12}/> Requires: {mod.dependencies.join(', ')}
                </div>
              )}
              <div className="module-actions">
                <button onClick={() => toggleModule(mod.id)} className='toggle-btn'>
                  {mod.status==='active'?'Disable':'Enable'}
                </button>
                <button onClick={() => alert('Downloading latest version...')} className="btn-secondary">
                  <RefreshCw size={14}/> Update
                </button>
                <button onClick={() => alert('Opening configuration...')} className="btn-secondary">
                  <Settings size={14}/>
                </button>
                <button onClick={() => uninstallModule(mod.id)} className="btn-danger">
                  <Trash2 size={14}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="modules-section">
        <h2>Available for Installation ({availableModules.length})</h2>
        <div className="modules-grid">
          {availableModules.map(mod => (
            <div key={mod.id} className="module-card available">
              <div className="module-card-header">
                <div className="module-icon"><Package size={20}/></div>
                <div className="module-info">
                  <h3>{mod.name}</h3>
                  <span className="module-version">v{mod.version}</span>
                </div>
                <span className="module-price">{mod.price}</span>
              </div>
              <p className="module-description">{mod.description}</p>
              <div className="module-meta">
                <span>{mod.reports} reports</span>
                <span>{mod.size}</span>
              </div>
              <button className="install-btn" onClick={() => installModule(mod)}>
                <Download size={16}/> Install Module
              </button>
            </div>
          ))}
        </div>
      </div>

      {showMarketplace && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={() => setShowMarketplace(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:24,width:600,maxHeight:'80vh',overflowY:'auto'}} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>Module Marketplace</h2>
              <button onClick={() => setShowMarketplace(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer',fontSize:24}}>x</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              {MARKETPLACE_MODULES.map((m,i) => (
                <div key={i} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:10,padding:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{color:'#f1f5f9',fontWeight:600,fontSize:13}}>{m.name}</span>
                    <span style={{color:m.price==='Free'?'#10b981':'#f59e0b',fontSize:12,fontWeight:600}}>{m.price}</span>
                  </div>
                  <p style={{color:'#64748b',fontSize:12,margin:'0 0 12px'}}>{m.desc}</p>
                  <span style={{background:'#1e293b',color:'#94a3b8',fontSize:10,padding:'2px 8px',borderRadius:20}}>{m.category}</span>
                  <button onClick={() => alert(m.name + ' - Contact sales to purchase')} style={{display:'block',width:'100%',marginTop:12,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px',cursor:'pointer',fontSize:12,fontWeight:600}}>
                    Get Module
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModuleManager
