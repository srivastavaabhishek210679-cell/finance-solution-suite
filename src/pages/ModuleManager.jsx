import React, { useState } from 'react'
import { Package, Search, Download, Trash2, Settings, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
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

  const stats = {
    total: modules.length,
    active: modules.filter(m => m.status === 'active').length,
    inactive: modules.filter(m => m.status === 'inactive').length,
  }

  const filteredModules = modules.filter(module => {
    const matchSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) || module.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchStatus = filterStatus === 'all' || module.status === filterStatus
    const matchCategory = filterCategory === 'all' || module.category === filterCategory
    return matchSearch && matchStatus && matchCategory
  })

  const toggleModule = (moduleId) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' } : m))
  }

  const uninstallModule = (moduleId) => {
    const module = modules.find(m => m.id === moduleId)
    const dependentModules = modules.filter(m => (m.dependencies || []).includes(module.name))
    if (dependentModules.length > 0) {
      alert(`Cannot uninstall. Required by: ${dependentModules.map(m => m.name).join(', ')}`)
      return
    }
    if (window.confirm(`Uninstall ${module.name}?`)) {
      setModules(modules.filter(m => m.id !== moduleId))
    }
  }

  const installModule = (module) => {
    const newModule = { ...module, status: 'active', lastUpdated: 'Just now' }
    setModules([...modules, newModule])
    setAvailableModules(availableModules.filter(m => m.id !== module.id))
    alert(`${module.name} installed successfully!`)
  }

  const updateModule = () => alert('Module update functionality - Downloads and installs latest version')
  const configureModule = () => alert('Configuration panel - Opens module settings')

  const getStatusIcon = (status) => status === 'active'
    ? React.createElement(CheckCircle, { size:16, style:{ color:'#10b981' } })
    : React.createElement(XCircle, { size:16, style:{ color:'#ef4444' } })

  const MARKETPLACE_MODULES = [
    { name:'Advanced Tax Engine', price:'$99/month', desc:'Multi-jurisdiction tax calculations', category:'Tax' },
    { name:'ESG Reporting Suite', price:'$149/month', desc:'Environmental & social governance reports', category:'ESG' },
    { name:'Payroll Integration', price:'Free', desc:'Connect payroll providers', category:'HR' },
    { name:'Budget Planning Tool', price:'$79/month', desc:'Interactive budget forecasting', category:'Finance' },
    { name:'Audit Trail Module', price:'Free', desc:'Complete audit log tracking', category:'Compliance' },
    { name:'Multi-Currency Module', price:'$59/month', desc:'Handle 150+ currencies', category:'Finance' },
  ]

  return (
    <div className="module-manager-page">
      <div className="module-header">
        <div>
          <h1>Module Manager</h1>
          <p>Manage installed modules and extensions</p>
        </div>
        <button className="btn-primary" onClick={() => setShowMarketplace(true)}>
          <Download size={18} />
          Browse Marketplace
        </button>
      </div>

      <div className="module-stats">
        <div className="stat-card"><span className="stat-value">{stats.total}</span><span className="stat-label">Total Modules</span></div>
        <div className="stat-card"><span className="stat-value" style={{ color:'#10b981' }}>{stats.active}</span><span className="stat-label">Active</span></div>
        <div className="stat-card"><span className="stat-value" style={{ color:'#ef4444' }}>{stats.inactive}</span><span className="stat-label">Inactive</span></div>
      </div>

      <div className="module-filters">
        <div className="search-bar">
          <Search size={16} />
          <input placeholder="Search modules..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="report">Reports</option>
          <option value="compliance">Compliance</option>
          <option value="dashboard">Dashboard</option>
          <option value="integration">Integration</option>
        </select>
      </div>

      <div className="modules-section">
        <h2>Installed Modules ({filteredModules.length})</h2>
        <div className="modules-grid">
          {filteredModules.map(module => (
            <div key={module.id} className={`module-card ${module.status}`}>
              <div className="module-card-header">
                <div className="module-icon"><Package size={20} /></div>
                <div className="module-info">
                  <h3>{module.name}</h3>
                  <span className="module-version">v{module.version}</span>
                </div>
                <div className="module-status">{getStatusIcon(module.status)}</div>
              </div>
              <p className="module-description">{module.description}</p>
              <div className="module-meta">
                <span>{module.reports} reports</span>
                <span>{module.size}</span>
                <span>Updated {module.lastUpdated}</span>
              </div>
              {(module.dependencies || []).length > 0 && (
                <div className="module-dependencies">
                  <AlertCircle size={12} /> Requires: {module.dependencies.join(', ')}
                </div>
              )}
              <div className="module-actions">
                <button onClick={() => toggleModule(module.id)} className={module.status === 'active' ? 'btn-warning' : 'btn-success'}>
                  {module.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => updateModule(module.id)} className="btn-secondary">
                  <RefreshCw size={14} /> Update
                </button>
                <button onClick={() => configureModule(module.id)} className="btn-secondary">
                  <Settings size={14} />
                </button>
                <button onClick={() => uninstallModule(module.id)} className="btn-danger">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="modules-section">
        <h2>Available for Installation ({availableModules.length})</h2>
        <div className="modules-grid">
          {availableModules.map(module => (
            <div key={module.id} className="module-card available">
              <div className="module-card-header">
                <div className="module-icon"><Package size={20} /></div>
                <div className="module-info">
                  <h3>{module.name}</h3>
                  <span className="module-version">v{module.version}</span>
                </div>
                <span className="module-price">{module.price}</span>
              </div>
              <p className="module-description">{module.description}</p>
              <div className="module-meta">
                <span>{module.reports} reports</span>
                <span>{module.size}</span>
              </div>
              <button className="install-btn" onClick={() => installModule(module)}>
                <Download size={16} />
                Install Module
              </button>
            </div>
          ))}
        </div>
      </div>

      {showMarketplace && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => setShowMarketplace(false)}>
          <div style={{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:24, width:600, maxHeight:'80vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h2 style={{ color:'#f1f5f9', margin:0 }}>Module Marketplace</h2>
              <button onClick={() => setShowMarketplace(false)} style={{ background:'none', border:'none', color:'#94a3b8', cursor:'pointer', fontSize:20 }}>x</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {MARKETPLACE_MODULES.map((m, i) => (
                <div key={i} style={{ background:'#0f172a', border:'1px solid #334155', borderRadius:10, padding:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ color:'#f1f5f9', fontWeight:600, fontSize:13 }}>{m.name}</span>
                    <span style={{ color: m.price === 'Free' ? '#10b981' : '#f59e0b', fontSize:12, fontWeight:600 }}>{m.price}</span>
                  </div>
                  <p style={{ color:'#64748b', fontSize:12, margin:'0 0 12px' }}>{m.desc}</p>
                  <span style={{ background:'#1e293b', color:'#94a3b8', fontSize:10, padding:'2px 8px', borderRadius:20 }}>{m.category}</span>
                  <button onClick={() => alert(m.name + ' - Contact sales to purchase')} style={{ display:'block', width:'100%', marginTop:12, background:'#3b82f6', border:'none', borderRadius:8, color:'#fff', padding:'8px', cursor:'pointer', fontSize:12, fontWeight:600 }}>
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