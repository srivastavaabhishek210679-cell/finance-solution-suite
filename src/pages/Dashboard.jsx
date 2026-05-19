import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Navigation from '../components/Navigation'
import Sidebar from '../components/Sidebar'
import ReportDetail from '../components/ReportDetail'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import ReportModal from '../components/ReportModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import Pagination from '../components/Pagination'
import FilterPanel from '../components/FilterPanel'
import KPIPanel from '../components/KPIPanel'
import AdvancedCharts from '../components/AdvancedCharts'
import AdvancedTable from '../components/AdvancedTable'
import ExportImport from '../components/ExportImport'
import ComplianceCalendar from '../components/ComplianceCalendar'
import DomainDashboard from '../components/DomainDashboard'
import { useReports } from '../hooks/useReports'
import { useSimulatedRealTime } from '../hooks/useRealTime'
import RealTimeIndicator from '../components/RealTimeIndicator'
import RealTimeAlerts, { RealTimeAlertTypes, showRealTimeAlert } from '../components/RealTimeAlerts'
import { REPORTS_DATA, DOMAINS } from '../data/reportsData'
import { TrendingUp, TrendingDown, FileText, CheckCircle, AlertTriangle, BarChart3, Clock, Upload, Brain, GitBranch, Link2, CreditCard, Menu, X } from 'lucide-react'
import './dashboard.css'



// Domain ID to Name mapping
const DOMAIN_ID_MAP = {
  1: 'Finance',
  2: 'HR',
  3: 'Operations',
  4: 'Sales',
  5: 'IT',
  6: 'Healthcare',
  7: 'Telecom',
  8: 'Retail',
  9: 'Energy',
  10: 'Manufacturing',
  11: 'Banking',
  12: 'Education',
  13: 'General'
}

function Dashboard() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [selectedReport, setSelectedReport] = useState(null)
  const [currentView, setCurrentView] = useState('dashboard')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [reportToEdit, setReportToEdit] = useState(null)
  const [reportToDelete, setReportToDelete] = useState(null)
  const [useBackend, setUseBackend] = useState(true)
  const [toast, setToast] = useState(null)
  const [showUserMenu,    setShowUserMenu]    = useState(false)
  const [showHamburger,   setShowHamburger]   = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentTime, setCurrentTime] = useState(new Date())
  
  
  // Advanced Filter State
  const [activeFilters, setActiveFilters] = useState({})
  

  // Clock update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  const formatTime = (date) => {
    const h = String(date.getHours()).padStart(2,'0')
    const m = String(date.getMinutes()).padStart(2,'0')
    const s = String(date.getSeconds()).padStart(2,'0')
    return `${h}:${m}:${s}`
  }

  const {
    reports: backendReports,
    pagination,
    loading,
    error,
    createReport,
    updateReport,
    deleteReport,
    refresh,
    fetchReports
  } = useReports()

  const reports = useBackend && !loading && !error ? backendReports : REPORTS_DATA

  const transformedReports = reports.map(report => ({
    ...report,
    domain: report.domain || (report.domain_id ? DOMAIN_ID_MAP[report.domain_id] : null)
  }))

  const isUsingBackend = useBackend && !loading && !error && backendReports.length > 0

  useEffect(() => {
    if (useBackend) {
      fetchReports(1, 100)
    }
  }, [])

  const realtime = useSimulatedRealTime({
    interval: 5000,
    dataGenerator: () => ({
      timestamp: new Date().toISOString(),
      totalReports: reports.length,
      activeUsers: Math.floor(Math.random() * 50) + 200,
      systemLoad: (Math.random() * 30 + 40).toFixed(1)
    }),
    autoStart: false
  })

  const lastAlertTime = useRef(0)
  useEffect(() => {
    if (realtime.data && realtime.updateCount > 0) {
      const now = Date.now()
      if (now - lastAlertTime.current > 60000) {
        RealTimeAlertTypes.dataUpdated()
        lastAlertTime.current = now
      }
    }
  }, [realtime.updateCount])

  const previousReportCount = useRef(0)
  useEffect(() => {
    if (useBackend && backendReports.length > 0) {
      const currentCount = backendReports.length
      if (previousReportCount.current > 0 && currentCount > previousReportCount.current) {
        RealTimeAlertTypes.newReport('New compliance report added')
      }
      previousReportCount.current = currentCount
    }
  }, [backendReports.length, useBackend])

  const [filteredReports, setFilteredReports] = useState([])

  const handleFilterChange = (filters) => {
    setActiveFilters(filters)
    let filtered = [...transformedReports]
    if (filters.frequency && filters.frequency.length > 0)
      filtered = filtered.filter(r => filters.frequency.includes(r.frequency))
    if (filters.domains && filters.domains.length > 0)
      filtered = filtered.filter(r => filters.domains.includes(r.domain))
    if (filters.compliance && filters.compliance.length > 0)
      filtered = filtered.filter(r => filters.compliance.includes(r.complianceStatus || r.compliance_status))
    if (filters.automation && filters.automation.length > 0)
      filtered = filtered.filter(r => filters.automation.includes(r.automationStatus || 'Manual'))
    if (filters.regions && filters.regions.length > 0)
      filtered = filtered.filter(r => r.region && filters.regions.includes(r.region))
    if (filters.riskLevel && filters.riskLevel.length > 0)
      filtered = filtered.filter(r => r.riskLevel && filters.riskLevel.includes(r.riskLevel))
    if (filters.roles && filters.roles.length > 0)
      filtered = filtered.filter(r => r.roles && r.roles.some(role => filters.roles.includes(role)))
    if (filters.dateRange) {
      if (filters.dateRange.from)
        filtered = filtered.filter(r => new Date(r.createdAt || r.created_at || r.lastSubmitted) >= new Date(filters.dateRange.from))
      if (filters.dateRange.to)
        filtered = filtered.filter(r => new Date(r.createdAt || r.created_at || r.lastSubmitted) <= new Date(filters.dateRange.to))
    }
    setFilteredReports(filtered)
  }

  const handleResetFilters = () => {
    setActiveFilters({})
    setFilteredReports([])
  }

  const displayReports = Object.keys(activeFilters).length > 0 ? filteredReports : transformedReports

  const handlePageChange = (newPage) => {
    fetchReports(newPage, 100)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleReportSelect = (report) => {
    setSelectedReport(report)
    setCurrentView('detail')
  }

  const showDashboard = () => {
    setSelectedReport(null)
    setCurrentView('dashboard')
  }

  const openCreateModal = () => {
    setModalMode('create')
    setReportToEdit(null)
    setIsModalOpen(true)
  }

  const openEditModal = (report) => {
    setModalMode('edit')
    setReportToEdit(report)
    setIsModalOpen(true)
  }

  const openDeleteModal = (report) => {
    setReportToDelete(report)
    setIsDeleteModalOpen(true)
  }

  const handleSaveReport = async (formData) => {
    try {
      if (modalMode === 'create') {
        await createReport(formData)
        showToast('Report created successfully!')
        RealTimeAlertTypes.newReport(formData.name || 'New Report')
      } else {
        await updateReport(reportToEdit.id, formData)
        showToast('Report updated successfully!')
        RealTimeAlertTypes.reportUpdated(formData.name || 'Report')
        if (selectedReport?.id === reportToEdit.id) {
          setSelectedReport({ ...reportToEdit, ...formData })
        }
      }
      setIsModalOpen(false)
    } catch (err) {
      showRealTimeAlert({ type: 'error', title: 'Error', message: err.message || 'Failed to save report', duration: 5000 })
      throw new Error(err.message || 'Failed to save report')
    }
  }

  const handleDeleteReport = async () => {
    try {
      await deleteReport(reportToDelete.id)
      showToast('Report deleted successfully!', 'success')
      if (selectedReport?.id === reportToDelete.id) showDashboard()
      setIsDeleteModalOpen(false)
    } catch (err) {
      showToast('Failed to delete report', 'error')
      throw err
    }
  }

  const toggleBackend = () => {
    setUseBackend(!useBackend)
    if (!useBackend) refresh()
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const totalReports    = displayReports.length
  const requiredReports = displayReports.filter(r => r.complianceStatus === 'Required' || r.compliance_status === 'Required').length
  const optionalReports = displayReports.filter(r => r.complianceStatus === 'Optional' || r.compliance_status === 'Optional').length
  const activeDomains   = DOMAINS.length
  const domainCounts    = DOMAINS.map(domain => ({
    domain,
    count: displayReports.filter(r => r.domain === domain).length,
    percentage: totalReports > 0 ? ((displayReports.filter(r => r.domain === domain).length / totalReports) * 100).toFixed(1) : 0
  }))
  const filteredDomains = selectedCategory === 'All'
    ? domainCounts
    : domainCounts.filter(d => d.domain === selectedCategory)


  // ── Shared button style helpers ─────────────────────────────
  const btnStyle = (bg) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    height: 28, padding: '0 8px',
    background: bg, border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6, color: '#f1f5f9',
    fontSize: 11, fontWeight: 500,
    cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'filter 0.15s',
  })
  const iconBtnStyle = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    height: 30, width: 30,
    background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 6, color: '#94a3b8', cursor: 'pointer',
  }

  return (
    <>
      <Navigation />
      <RealTimeAlerts position="top-right" maxAlerts={5} />
      <div className="h-screen flex flex-col bg-gray-900 text-white" style={{overflowX:'hidden',width:'100%'}}>

        {/* Toast */}
        {toast && (
          <div className="fixed top-20 right-4 z-50 animate-fade-in">
            <div className={`rounded-lg px-6 py-3 shadow-lg ${toast.type==='success'?'bg-green-600 border border-green-500':'bg-red-600 border border-red-500'}`}>
              <div className="flex items-center gap-2 text-white">
                {toast.type==='success' ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                <span>{toast.message}</span>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <ReportModal isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)} onSave={handleSaveReport} report={reportToEdit} mode={modalMode}/>
        <DeleteConfirmModal isOpen={isDeleteModalOpen} onClose={()=>setIsDeleteModalOpen(false)} onConfirm={handleDeleteReport} report={reportToDelete}/>

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <header style={{background:'#1e293b',borderBottom:'1px solid #334155',flexShrink:0}}>
          <div style={{padding:'0 16px',height:52,display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,overflow:'hidden'}}>

            {/* LEFT */}
            <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
              <button onClick={showDashboard} style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
                <span style={{fontSize:15,fontWeight:700,color:'#60a5fa',letterSpacing:'-0.3px'}}>Enterprise Finance Platform</span>
              </button>
              <span style={{fontSize:11,color:'#475569',whiteSpace:'nowrap'}}>{reports.length} Reports · {DOMAINS.length} Domains</span>
              {isUsingBackend&&<span style={{fontSize:10,background:'#14532d',color:'#86efac',padding:'2px 7px',borderRadius:4,fontWeight:600,letterSpacing:'0.3px'}}>LIVE</span>}
            </div>

            {/* RIGHT */}
            <div style={{display:'flex',alignItems:'center',gap:3,overflow:'hidden',flexShrink:1}}>
              <RealTimeIndicator isConnected={realtime.isActive} connectionType="polling" lastUpdate={realtime.lastUpdate} updateCount={realtime.updateCount} onRefresh={realtime.refresh} showDetails={false} compact={true}/>
              <div style={{width:1,height:18,background:'#334155',margin:'0 3px'}}/>

              {/* ── Hamburger Menu ──────────────────────────── */}
              <div style={{position:'relative'}}>
                <button
                  onClick={()=>setShowHamburger(!showHamburger)}
                  style={{...btnStyle('#1e293b'), border:'1px solid #334155', gap:5}}
                  title="Features Menu"
                >
                  {showHamburger ? <X size={13}/> : <Menu size={13}/>}
                  <span>Menu</span>
                </button>

                {showHamburger && (
                  <>
                    {/* Backdrop */}
                    <div
                      style={{position:'fixed',inset:0,zIndex:40}}
                      onClick={()=>setShowHamburger(false)}
                    />
                    {/* Dropdown */}
                    <div style={{
                      position:'fixed', top:58, right:16,
                      width:220, background:'#1e293b', border:'1px solid #334155',
                      borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.4)',
                      zIndex:50, overflow:'hidden',
                    }}>
                      <div style={{padding:'8px 12px', fontSize:10, fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid #334155'}}>
                        Feature Pages
                      </div>
                      {[
                        { label:'Predictive Analytics', icon:Brain,       color:'#7c3aed', path:'/predictive-analytics'  },
                        { label:'AI Copilot',            icon:Brain,       color:'#8b5cf6', path:'/ai-copilot'            },
                        { label:'Workflow Automation',   icon:GitBranch,   color:'#059669', path:'/workflow-automation'   },
                        { label:'Executive Reports',     icon:BarChart3,   color:'#0f766e', path:'/executive-reporting'   },
                        { label:'Integrations',          icon:Link2,       color:'#0e7490', path:'/integration-ecosystem' },
                        { label:'Billing & Plans',       icon:CreditCard,  color:'#7c3aed', path:'/monetization'          },
                      ].map((item, i) => {
                        const Icon = item.icon
                        return (
                          <button
                            key={i}
                            onClick={() => { navigate(item.path); setShowHamburger(false) }}
                            style={{
                              display:'flex', alignItems:'center', gap:10,
                              width:'100%', padding:'9px 14px',
                              background:'none', border:'none', cursor:'pointer',
                              borderBottom: i < 5 ? '1px solid #1e293b' : 'none',
                              transition:'background 0.15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background='#334155'}
                            onMouseLeave={e => e.currentTarget.style.background='none'}
                          >
                            <div style={{width:26,height:26,borderRadius:6,background:`${item.color}25`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                              <Icon size={13} style={{color:item.color}}/>
                            </div>
                            <span style={{fontSize:12,fontWeight:600,color:'#f1f5f9'}}>{item.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
              <button onClick={toggleBackend} style={btnStyle(useBackend?'#15803d':'#374151')}>
                <div style={{width:5,height:5,borderRadius:'50%',background:isUsingBackend?'#86efac':'#6b7280',boxShadow:isUsingBackend?'0 0 4px #86efac':'none'}}/>
                <span>{useBackend?'ON':'OFF'}</span>
              </button>
              {useBackend&&(
                <>
                  <button onClick={refresh} disabled={loading} title="Refresh" style={{...iconBtnStyle,width:28,height:28}}>
                    <svg className={loading?'animate-spin':''} width={13} height={13} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                  </button>
                  <button onClick={openCreateModal} style={btnStyle('#1d4ed8')}>
                    <span style={{fontSize:13,lineHeight:1}}>+</span><span>New</span>
                  </button>
                </>
              )}
              <div style={{width:1,height:18,background:'#334155',margin:'0 3px'}}/>
              <button onClick={showDashboard} style={btnStyle(currentView==='dashboard'?'#1d4ed8':'#1e293b')}>
                <BarChart3 size={12}/><span>View</span>
              </button>
              <button onClick={()=>navigate('/upload-data')} style={btnStyle('#0f766e')}>
                <Upload size={12}/><span>Upload</span>
              </button>
              <button onClick={()=>navigate('/kpi-dashboard')} style={btnStyle('#0e7490')}>
                <BarChart3 size={12}/><span>KPI</span>
              </button>
              <div style={{width:1,height:18,background:'#334155',margin:'0 3px'}}/>
              <div style={{display:'flex',alignItems:'center',gap:4,background:'#0f172a',border:'1px solid #334155',borderRadius:6,padding:'0 8px',height:28}}>
                <Clock size={11} style={{color:'#2dd4bf'}}/>
                <span style={{fontSize:11,fontFamily:'monospace',fontWeight:700,color:'#2dd4bf',letterSpacing:'0.5px'}}>{formatTime(currentTime)}</span>
              </div>
              <div className="relative">
                <button onClick={()=>setShowUserMenu(!showUserMenu)} style={{display:'flex',alignItems:'center',gap:5,background:'#0f172a',border:'1px solid #334155',borderRadius:6,padding:'0 8px',height:28,cursor:'pointer'}}>
                  <div style={{width:18,height:18,background:'#2563eb',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:9}}>
                    {user?.firstName?.charAt(0)||user?.email?.charAt(0)?.toUpperCase()}
                  </div>
                  <span style={{fontSize:11,color:'#94a3b8',fontWeight:500}}>{user?.firstName||user?.email}</span>
                </button>
                {showUserMenu&&(
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-sm text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                    </div>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700">Sign Out</button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </header>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar onReportSelect={handleReportSelect} selectedReportId={selectedReport?.id} reports={displayReports}/>
          <main className="flex-1 overflow-auto">

            {loading && useBackend ? (
              <Loading message="Loading reports from backend..." />
            ) : error && useBackend ? (
              <ErrorMessage error={error} onRetry={refresh} />
            ) : currentView === 'detail' ? (
              <ReportDetail
                report={selectedReport}
                onEdit={useBackend ? openEditModal : null}
                onDelete={useBackend ? openDeleteModal : null}
                onBack={() => setCurrentView('dashboard')}
                isBackendMode={useBackend}
              />
            ) : (
              <div className="dm-page">

                {/* ── PAGE HEADER */}
                <div className="dm-page-header">
                  <div className="dm-page-header-left">
                    <div className="dm-page-icon"><BarChart3 size={20} /></div>
                    <div>
                      <h1 className="dm-page-title">Dashboard Overview</h1>
                      <p className="dm-page-subtitle">
                        Real-Time Intelligence Platform &nbsp;·&nbsp;
                        <span className="dm-highlight">{reports.length} reports</span> across&nbsp;
                        <span className="dm-highlight">{activeDomains} domains</span>
                      </p>
                    </div>
                  </div>
                  <div className="dm-page-header-right">
                    {Object.keys(activeFilters).length > 0 && (
                      <div className="dm-filter-counter">
                        <CheckCircle size={13} />
                        <span>Showing <strong>{totalReports}</strong> of {reports.length}</span>
                        <span className="dm-filter-badge">{Object.keys(activeFilters).length} filter{Object.keys(activeFilters).length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                    <div className="dm-live-status">
                      <span className={`dm-live-dot ${isUsingBackend ? 'live' : 'static'}`} />
                      <span>{isUsingBackend ? 'Live data' : 'Static data'}</span>
                    </div>
                  </div>
                </div>

                {/* ── PLATFORM STATS */}
                <div className="dm-stats-grid">
                  <div className="dm-stat-card" style={{'--ac':'#3b82f6'}}>
                    <div className="dm-stat-top">
                      <div className="dm-stat-icon" style={{background:'#3b82f620',color:'#3b82f6'}}><FileText size={16}/></div>
                      <span className="dm-stat-change positive"><TrendingUp size={11}/> 12.5%</span>
                    </div>
                    <div className="dm-stat-value">{totalReports}</div>
                    <div className="dm-stat-label">Total Reports</div>
                    <div className="dm-stat-sub">{Object.keys(activeFilters).length > 0 ? 'Filtered results' : 'Active across all domains'}</div>
                    <div className="dm-stat-bar"><div className="dm-stat-bar-fill" style={{width:'100%',background:'#3b82f6'}}/></div>
                  </div>
                  <div className="dm-stat-card" style={{'--ac':'#ef4444'}}>
                    <div className="dm-stat-top">
                      <div className="dm-stat-icon" style={{background:'#ef444420',color:'#ef4444'}}><CheckCircle size={16}/></div>
                      <span className="dm-stat-change positive"><TrendingUp size={11}/> 5.2%</span>
                    </div>
                    <div className="dm-stat-value">{requiredReports}</div>
                    <div className="dm-stat-label">Required Compliance</div>
                    <div className="dm-stat-sub">Mandatory reports</div>
                    <div className="dm-stat-bar"><div className="dm-stat-bar-fill" style={{width:totalReports?`${(requiredReports/totalReports*100).toFixed(0)}%`:'0%',background:'#ef4444'}}/></div>
                  </div>
                  <div className="dm-stat-card" style={{'--ac':'#10b981'}}>
                    <div className="dm-stat-top">
                      <div className="dm-stat-icon" style={{background:'#10b98120',color:'#10b981'}}><BarChart3 size={16}/></div>
                      <span className="dm-stat-change positive"><TrendingUp size={11}/> 8.1%</span>
                    </div>
                    <div className="dm-stat-value">{activeDomains}</div>
                    <div className="dm-stat-label">Active Domains</div>
                    <div className="dm-stat-sub">Business functions covered</div>
                    <div className="dm-stat-bar"><div className="dm-stat-bar-fill" style={{width:`${(activeDomains/13*100).toFixed(0)}%`,background:'#10b981'}}/></div>
                  </div>
                  <div className="dm-stat-card" style={{'--ac':'#8b5cf6'}}>
                    <div className="dm-stat-top">
                      <div className="dm-stat-icon" style={{background:'#8b5cf620',color:'#8b5cf6'}}><TrendingUp size={16}/></div>
                      <span className="dm-stat-change positive"><TrendingUp size={11}/> 15.7%</span>
                    </div>
                    <div className="dm-stat-value">{optionalReports}</div>
                    <div className="dm-stat-label">Optional Reports</div>
                    <div className="dm-stat-sub">Supplementary insights</div>
                    <div className="dm-stat-bar"><div className="dm-stat-bar-fill" style={{width:totalReports?`${(optionalReports/totalReports*100).toFixed(0)}%`:'0%',background:'#8b5cf6'}}/></div>
                  </div>
                </div>

                {/* ── FILTERS */}
                <div className="dm-section">
                  <div className="dm-section-label"><span className="dm-section-line"/><span>Advanced Filters</span><span className="dm-section-line"/></div>
                  <FilterPanel activeFilters={activeFilters} onFilterChange={handleFilterChange} onReset={handleResetFilters} />
                </div>

                {/* ── KPI PANEL */}
                <div className="dm-section">
                  <div className="dm-section-label"><span className="dm-section-line"/><span>KPI Dashboard</span><span className="dm-section-line"/></div>
                  <KPIPanel reports={displayReports} />
                </div>

                {/* ── CHARTS */}
                <div className="dm-section">
                  <div className="dm-section-label"><span className="dm-section-line"/><span>Analytics &amp; Charts</span><span className="dm-section-line"/></div>
                  <AdvancedCharts reports={displayReports} />
                </div>

                {/* ── TABLE */}
                <div className="dm-section">
                  <div className="dm-section-label"><span className="dm-section-line"/><span>Report Explorer</span><span className="dm-section-line"/></div>
                  <AdvancedTable reports={displayReports} />
                </div>

                {/* ── EXPORT */}
                <div className="dm-section">
                  <div className="dm-section-label"><span className="dm-section-line"/><span>Export &amp; Import</span><span className="dm-section-line"/></div>
                  <ExportImport reports={displayReports} />
                </div>

                {/* ── COMPLIANCE CALENDAR */}
                <div className="dm-section">
                  <div className="dm-section-label"><span className="dm-section-line"/><span>Compliance Calendar</span><span className="dm-section-line"/></div>
                  <ComplianceCalendar />
                </div>

                {/* ── INDUSTRY DASHBOARDS */}
                <div className="dm-section">
                  <div className="dm-section-label"><span className="dm-section-line"/><span>Industry Dashboards</span><span className="dm-section-line"/></div>
                  <DomainDashboard domain="Healthcare"    reports={reports} />
                  <DomainDashboard domain="Telecom"       reports={reports} />
                  <DomainDashboard domain="Banking"       reports={reports} />
                  <DomainDashboard domain="Manufacturing" reports={reports} />
                </div>

                {/* ── DOMAIN EXPLORER */}
                <div className="dm-section">
                  <div className="dm-section-label"><span className="dm-section-line"/><span>Domain Explorer</span><span className="dm-section-line"/></div>

                  <div className="dm-domain-tabs">
                    <button className={`dm-domain-tab ${selectedCategory==='All'?'active':''}`} onClick={()=>setSelectedCategory('All')}>
                      All Domains <span className="dm-tab-count">{reports.length}</span>
                    </button>
                    {DOMAINS.map(domain=>{
                      const cnt=reports.filter(r=>r.domain===domain).length
                      return(
                        <button key={domain} className={`dm-domain-tab ${selectedCategory===domain?'active':''}`} onClick={()=>setSelectedCategory(domain)}>
                          {domain} <span className="dm-tab-count">{cnt}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="dm-domain-grid">
                    {filteredDomains.map(({domain,count,percentage})=>{
                      const DCOLORS={Finance:'#14b8a6',HR:'#3b82f6',Operations:'#f59e0b',Sales:'#8b5cf6',IT:'#06b6d4',Healthcare:'#ec4899',Telecom:'#14b8a6',Retail:'#f97316',Energy:'#eab308',Manufacturing:'#6366f1',Banking:'#22c55e',Education:'#a855f7',General:'#64748b'}
                      const DEMOJI={Finance:'💰',HR:'👥',Operations:'⚙️',Sales:'📊',IT:'💻',Healthcare:'🏥',Telecom:'📡',Retail:'🛒',Energy:'⚡',Manufacturing:'🏭',Banking:'🏦',Education:'🎓',General:'📋'}
                      const color=DCOLORS[domain]||'#64748b'
                      const emoji=DEMOJI[domain]||'📋'
                      const domainReports=displayReports.filter(r=>r.domain===domain)
                      return(
                        <div key={domain} className="dm-domain-card" style={{'--dc':color}}>
                          <div className="dm-dc-header">
                            <div className="dm-dc-icon" style={{background:`${color}22`}}><span style={{fontSize:18}}>{emoji}</span></div>
                            <div className="dm-dc-title-wrap">
                              <div className="dm-dc-title">{domain}</div>
                              <div className="dm-dc-sub">Business Function</div>
                            </div>
                            <div className="dm-dc-badge" style={{background:`${color}20`,color}}>{count}</div>
                          </div>
                          <div className="dm-dc-metrics">
                            <div className="dm-dc-metric"><span className="dm-dc-metric-val">{count}</span><span className="dm-dc-metric-lbl">Reports</span></div>
                            <div className="dm-dc-divider"/>
                            <div className="dm-dc-metric"><span className="dm-dc-metric-val">{percentage}%</span><span className="dm-dc-metric-lbl">of Total</span></div>
                            <div className="dm-dc-divider"/>
                            <div className="dm-dc-metric"><span className="dm-dc-metric-val">{Math.floor(count*0.7)}</span><span className="dm-dc-metric-lbl">Active</span></div>
                          </div>
                          <div className="dm-dc-progress-wrap">
                            <div className="dm-dc-progress"><div className="dm-dc-progress-fill" style={{width:`${percentage}%`,background:color}}/></div>
                            <span className="dm-dc-progress-pct" style={{color}}>{percentage}%</span>
                          </div>
                          {domainReports.slice(0,5).length>0&&(
                            <div className="dm-dc-reports">
                              <div className="dm-dc-reports-label">Recent Reports</div>
                              <div className="dm-dc-reports-list">
                                {domainReports.slice(0,5).map(report=>(
                                  <button type="button" key={report.id||report.report_id} className="dm-dc-report-row" style={{'--dc':color}}
                                    onClick={e=>{e.stopPropagation();e.preventDefault();handleReportSelect(report)}}>
                                    <FileText size={12} style={{color,flexShrink:0}}/>
                                    <span className="dm-dc-report-name">{report.name}</span>
                                    <span className="dm-dc-report-freq">{report.frequency}</span>
                                  </button>
                                ))}
                              </div>
                              {count>5&&(
                                <button type="button" className="dm-dc-view-all" style={{color}}
                                  onClick={e=>{e.stopPropagation();setSelectedCategory(domain)}}>
                                  View all {count} {domain} reports →
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {isUsingBackend&&pagination&&(
                    <div className="dm-pagination-wrap">
                      <Pagination pagination={pagination} onPageChange={handlePageChange} loading={loading}/>
                    </div>
                  )}
                </div>

              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}

export default Dashboard