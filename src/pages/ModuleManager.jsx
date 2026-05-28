import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Search, Download, Trash2, Settings, CheckCircle, XCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react'

function ModuleManager() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showMarketplace, setShowMarketplace] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')

  // Installed modules
  const [modules, setModules] = useState([
    {
      id: 1,
      name: 'Financial Statements Package',
      category: 'report',
      version: '2.1.0',
      status: 'active',
      description: 'Complete P&L, Balance Sheet, Cash Flow reports',
      reports: 45,
      size: '12.5 MB',
      lastUpdated: '2 days ago',
      dependencies: []
    },
    {
      id: 2,
      name: 'Tax Compliance Module',
      category: 'report',
      version: '3.0.1',
      status: 'active',
      description: 'GST, Income Tax, TDS reporting and calculations',
      reports: 28,
      size: '8.2 MB',
      lastUpdated: '1 week ago',
      dependencies: ['Financial Statements Package']
    },
    {
      id: 3,
      name: 'Advanced Charts Library',
      category: 'chart',
      version: '1.5.2',
      status: 'active',
      description: 'Interactive charts with drill-down capabilities',
      reports: 0,
      size: '15.3 MB',
      lastUpdated: '3 days ago',
      dependencies: []
    },
    {
      id: 4,
      name: 'SAP Integration',
      category: 'integration',
      version: '4.2.0',
      status: 'inactive',
      description: 'Connect to SAP ERP for real-time data sync',
      reports: 0,
      size: '22.1 MB',
      lastUpdated: '2 weeks ago',
      dependencies: []
    },
    {
      id: 5,
      name: 'Audit Trail Logger',
      category: 'custom',
      version: '1.0.3',
      status: 'active',
      description: 'Track all user actions and data changes',
      reports: 0,
      size: '5.7 MB',
      lastUpdated: '1 month ago',
      dependencies: []
    },
    {
      id: 6,
      name: 'ESG Metrics Dashboard',
      category: 'report',
      version: '2.3.0',
      status: 'active',
      description: 'Environmental, Social, Governance reporting',
      reports: 18,
      size: '9.8 MB',
      lastUpdated: '5 days ago',
      dependencies: []
    }
  ])

  // Available modules for installation
  const [availableModules, setAvailableModules] = useState([
    {
      id: 7,
      name: 'Banking Reconciliation',
      category: 'report',
      version: '1.2.0',
      description: 'Automated bank statement reconciliation',
      reports: 12,
      size: '6.4 MB',
      price: 'Free'
    },
    {
      id: 8,
      name: 'Inventory Management',
      category: 'report',
      version: '2.0.0',
      description: 'Stock tracking and warehouse management',
      reports: 22,
      size: '11.2 MB',
      price: '$49/month'
    },
    {
      id: 9,
      name: 'QuickBooks Connector',
      category: 'integration',
      version: '3.1.0',
      description: 'Sync data with QuickBooks Online',
      reports: 0,
      size: '8.9 MB',
      price: 'Free'
    }
  ])

  // Categories
  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'report', name: 'Report Modules', icon: '📊' },
    { id: 'chart', name: 'Chart Modules', icon: '📈' },
    { id: 'integration', name: 'Integrations', icon: '🔗' },
    { id: 'custom', name: 'Custom Modules', icon: '⚙️' }
  ]

  // Filter modules
  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || module.status === filterStatus
    const matchesCategory = filterCategory === 'all' || module.category === filterCategory
    return matchesSearch && matchesStatus && matchesCategory
  })

  // Statistics
  const stats = {
    total: modules.length,
    active: modules.filter(m => m.status === 'active').length,
    inactive: modules.filter(m => m.status === 'inactive').length,
    totalReports: modules.reduce((sum, m) => sum + m.reports, 0)
  }

  // Toggle module status
  const toggleModule = (moduleId) => {
    setModules(modules.map(m =>
      m.id === moduleId
        ? { ...m, status: m.status === 'active' ? 'inactive' : 'active' }
        : m
    ))
  }

  // Uninstall module
  const uninstallModule = (moduleId) => {
    const module = modules.find(m => m.id === moduleId)
    
    // Check dependencies
    const dependentModules = modules.filter(m => m.dependencies.includes(module.name))
    
    if (dependentModules.length > 0) {
      alert(`Cannot uninstall. Required by: ${dependentModules.map(m => m.name).join(', ')}`)
      return
    }
    
    if (confirm(`Uninstall ${module.name}? This will remove all associated reports.`)) {
      setModules(modules.filter(m => m.id !== moduleId))
    }
  }

  // Install module
  const installModule = (module) => {
    const newModule = {
      ...module,
      status: 'active',
      lastUpdated: 'Just now'
    }
    setModules([...modules, newModule])
    setAvailableModules(availableModules.filter(m => m.id !== module.id))
    alert(`${module.name} installed successfully!`)
  }

  // Update module
  const updateModule = (moduleId) => {
    alert('Module update functionality - Downloads and installs latest version')
  }

  // Configure module
  const configureModule = (moduleId) => {
    alert('Module configuration - Opens settings modal')
  }

  return (
    <div className="module-manager-page">
      {/* Header */}
      <div className='module-header'>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button onClick={() => navigate('/dashboard')} style={{ display:'flex', alignItems:'center', gap:6, background:'#1e293b', border:'1px solid #334155', borderRadius:8, color:'#94a3b8', padding:'8px 12px', cursor:'pointer', fontSize:13 }}><ArrowLeft size={16}/> Back</button>
          <div className='header-content'>
            <div>
              <h1>Module Manager</h1>
              <p>Install, update and manage report modules</p>
            </div>
          </div>
          <button className='btn-primary' onClick={() => setShowMarketplace(true)}>
            <Download size={18} />
            Browse Marketplace
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <Package className="stat-icon" style={{ color: '#3b82f6' }} size={28} />
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Installed Modules</div>
          </div>
        </div>

        <div className="stat-card">
          <CheckCircle className="stat-icon" style={{ color: '#10b981' }} size={28} />
          <div className="stat-content">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active Modules</div>
          </div>
        </div>

        <div className="stat-card">
          <XCircle className="stat-icon" style={{ color: '#ef4444' }} size={28} />
          <div className="stat-content">
            <div className="stat-value">{stats.inactive}</div>
            <div className="stat-label">Inactive Modules</div>
          </div>
        </div>

        <div className="stat-card">
          <Settings className="stat-icon" style={{ color: '#8b5cf6' }} size={28} />
          <div className="stat-content">
            <div className="stat-value">{stats.totalReports}</div>
            <div className="stat-label">Total Reports</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={filterCategory === cat.id ? 'active' : ''}
              onClick={() => setFilterCategory(cat.id)}
            >
              {cat.icon && <span>{cat.icon}</span>}
              {cat.name}
            </button>
          ))}
        </div>

        <div className="status-filters">
          {['all', 'active', 'inactive'].map(status => (
            <button
              key={status}
              className={filterStatus === status ? 'active' : ''}
              onClick={() => setFilterStatus(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Installed Modules */}
      <div className="modules-section">
        <h2>Installed Modules ({filteredModules.length})</h2>
        
        <div className="modules-grid">
          {filteredModules.map(module => (
            <div key={module.id} className={`module-card ${module.status}`}>
              <div className="module-header">
                <div className="module-info">
                  <h3>{module.name}</h3>
                  <span className="version-badge">v{module.version}</span>
                </div>
                <div className={`status-indicator ${module.status}`}>
                  {module.status === 'active' ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                </div>
              </div>

              <p className="module-description">{module.description}</p>

              <div className="module-meta">
                <span className="meta-item">
                  {module.category === 'report' && '📊'}
                  {module.category === 'chart' && '📈'}
                  {module.category === 'integration' && '🔗'}
                  {module.category === 'custom' && '⚙️'}
                  {module.category}
                </span>
                {module.reports > 0 && (
                  <span className="meta-item">{module.reports} reports</span>
                )}
                <span className="meta-item">{module.size}</span>
              </div>

              {(module.dependencies?.length || 0) > 0 && (
                <div className="dependencies">
                  <AlertCircle size={14} />
                  <span>Requires: {module.dependencies.join(', ')}</span>
                </div>
              )}

              <div className="module-actions">
                <button
                  className={`toggle-btn ${module.status}`}
                  onClick={() => toggleModule(module.id)}
                >
                  {module.status === 'active' ? 'Disable' : 'Enable'}
                </button>
                <button className="config-btn" onClick={() => configureModule(module.id)}>
                  <Settings size={16} />
                  Configure
                </button>
                <button className="update-btn" onClick={() => updateModule(module.id)}>
                  <RefreshCw size={16} />
                  Update
                </button>
                <button className="uninstall-btn" onClick={() => uninstallModule(module.id)}>
                  <Trash2 size={16} />
                  Uninstall
                </button>
              </div>

              <div className="module-footer">
                <span className="last-updated">Updated {module.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Modules */}
      <div className="modules-section">
        <h2>Available for Installation ({availableModules.length})</h2>
        
        <div className="modules-grid">
          {availableModules.map(module => (
            <div key={module.id} className="module-card available">
              <div className="module-header">
                <div className="module-info">
                  <h3>{module.name}</h3>
                  <span className="version-badge">v{module.version}</span>
                </div>
                <span className="price-badge">{module.price}</span>
              </div>

              <p className="module-description">{module.description}</p>

              <div className="module-meta">
                <span className="meta-item">
                  {module.category === 'report' && '📊'}
                  {module.category === 'chart' && '📈'}
                  {module.category === 'integration' && '🔗'}
                  {module.category}
                </span>
                {module.reports > 0 && (
                  <span className="meta-item">{module.reports} reports</span>
                )}
                <span className="meta-item">{module.size}</span>
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
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center" }} onClick={() => setShowMarketplace(false)}>
          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:24, width:600, maxHeight:"80vh", overflowY:"auto" }} onClick={e => e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <h2 style={{ color:"#f1f5f9", margin:0 }}>Module Marketplace</h2>
              <button onClick={() => setShowMarketplace(false)} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:20 }}>�</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
              {[
                { name:"Advanced Tax Engine", price:"$99/month", desc:"Multi-jurisdiction tax calculations", category:"Tax" },
                { name:"ESG Reporting Suite", price:"$149/month", desc:"Environmental & social governance reports", category:"ESG" },
                { name:"Payroll Integration", price:"Free", desc:"Connect payroll providers", category:"HR" },
                { name:"Budget Planning Tool", price:"$79/month", desc:"Interactive budget forecasting", category:"Finance" },
                { name:"Audit Trail Module", price:"Free", desc:"Complete audit log tracking", category:"Compliance" },
                { name:"Multi-Currency Module", price:"$59/month", desc:"Handle 150+ currencies", category:"Finance" },
              ].map((m,i) => (
                <div key={i} style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:10, padding:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <span style={{ color:"#f1f5f9", fontWeight:600, fontSize:13 }}>{m.name}</span>
                    <span style={{ color: m.price==="Free"?"#10b981":"#f59e0b", fontSize:12, fontWeight:600 }}>{m.price}</span>
                  </div>
                  <p style={{ color:"#64748b", fontSize:12, margin:"0 0 12px" }}>{m.desc}</p>
                  <span style={{ background:"#1e293b", color:"#94a3b8", fontSize:10, padding:"2px 8px", borderRadius:20 }}>{m.category}</span>
                  <button onClick={() => { alert(m.name + " - Contact sales@financeplatform.com to purchase"); }} style={{ display:"block", width:"100%", marginTop:12, background:"#3b82f6", border:"none", borderRadius:8, color:"#fff", padding:"8px", cursor:"pointer", fontSize:12, fontWeight:600 }}>
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
