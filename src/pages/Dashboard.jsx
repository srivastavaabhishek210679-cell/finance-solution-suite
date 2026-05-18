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
import { TrendingUp, TrendingDown, FileText, CheckCircle, AlertTriangle, BarChart3, Clock, Upload,Brain } from 'lucide-react'
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
  const [showUserMenu, setShowUserMenu] = useState(false)
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
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    return `${hours}:${minutes}:${seconds}`
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
  
  // Transform reports to add domain property from domain_id
  const transformedReports = reports.map(report => ({
    ...report,
    domain: report.domain || (report.domain_id ? DOMAIN_ID_MAP[report.domain_id] : null)
  }))
  
  const isUsingBackend = useBackend && !loading && !error && backendReports.length > 0

  // Initial fetch with higher limit to show reports from all domains
  useEffect(() => {
    if (useBackend) {
      fetchReports(1, 100) // Fetch first 100 reports to cover all 13 domains
    }
  }, []) // Empty dependency array = runs once on mount

  // Real-Time Updates - Optimized
  const realtime = useSimulatedRealTime({
    interval: 5000, // Update every 5 seconds
    dataGenerator: () => ({
      timestamp: new Date().toISOString(),
      totalReports: reports.length,
      activeUsers: Math.floor(Math.random() * 50) + 200,
      systemLoad: (Math.random() * 30 + 40).toFixed(1)
    }),
    autoStart: false
  })

  // Debounced alert system - only show alerts every 60 seconds
  const lastAlertTime = useRef(0)
  
  useEffect(() => {
    if (realtime.data && realtime.updateCount > 0) {
      const now = Date.now()
      // Show update alert every 60 seconds instead of every 5 seconds
      if (now - lastAlertTime.current > 60000) {
        RealTimeAlertTypes.dataUpdated()
        lastAlertTime.current = now
      }
    }
  }, [realtime.updateCount])

  // Monitor backend reports for NEW reports only (not every update)
  const previousReportCount = useRef(0)
  
  useEffect(() => {
    if (useBackend && backendReports.length > 0) {
      const currentCount = backendReports.length
      
      // Only alert if count actually increased (new report)
      if (previousReportCount.current > 0 && currentCount > previousReportCount.current) {
        RealTimeAlertTypes.newReport('New compliance report added')
      }
      
      previousReportCount.current = currentCount
    }
  }, [backendReports.length, useBackend])  // Only watch length, not entire array

  // Advanced Filter Handler
  const handleFilterChange = (filters) => {
    setActiveFilters(filters)
    
    let filtered = [...transformedReports]
    
    // Filter by frequency
    if (filters.frequency && filters.frequency.length > 0) {
      filtered = filtered.filter(r => 
        filters.frequency.includes(r.frequency)
      )
    }
    
    // Filter by domains
    if (filters.domains && filters.domains.length > 0) {
      filtered = filtered.filter(r => 
        filters.domains.includes(r.domain)
      )
    }
    
    // Filter by compliance
    if (filters.compliance && filters.compliance.length > 0) {
      filtered = filtered.filter(r => 
        filters.compliance.includes(r.complianceStatus || r.compliance_status)
      )
    }
    
    // Filter by automation
    if (filters.automation && filters.automation.length > 0) {
      filtered = filtered.filter(r => 
        filters.automation.includes(r.automationStatus || 'Manual')
      )
    }
    
    // Filter by regions
    if (filters.regions && filters.regions.length > 0) {
      filtered = filtered.filter(r => 
        r.region && filters.regions.includes(r.region)
      )
    }
    
    // Filter by risk level
    if (filters.riskLevel && filters.riskLevel.length > 0) {
      filtered = filtered.filter(r => 
        r.riskLevel && filters.riskLevel.includes(r.riskLevel)
      )
    }
    
    // Filter by roles
    if (filters.roles && filters.roles.length > 0) {
      filtered = filtered.filter(r => 
        r.roles && r.roles.some(role => filters.roles.includes(role))
      )
    }
    
    // Filter by date range
    if (filters.dateRange) {
      if (filters.dateRange.from) {
        filtered = filtered.filter(r => {
          const reportDate = new Date(r.createdAt || r.created_at || r.lastSubmitted)
          return reportDate >= new Date(filters.dateRange.from)
        })
      }
      if (filters.dateRange.to) {
        filtered = filtered.filter(r => {
          const reportDate = new Date(r.createdAt || r.created_at || r.lastSubmitted)
          return reportDate <= new Date(filters.dateRange.to)
        })
      }
    }
    
    setFilteredReports(filtered)
  }

  const handleResetFilters = () => {
    setActiveFilters({})
    setFilteredReports([])
  }

  // Use filtered reports when filters are active
  const displayReports = Object.keys(activeFilters).length > 0 ? filteredReports : transformedReports

  const handlePageChange = (newPage) => {
    fetchReports(newPage, 100) // Match initial fetch limit
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  //const handleReportSelect = (report) => {
    //setSelectedReport(report)
    //setCurrentView('detail')
  //}

  const handleReportSelect = (report) => {
  console.log('🔍 Report clicked:', report.name)
  console.log('🔍 Setting currentView to: detail')
  setSelectedReport(report)
  setCurrentView('detail')
  console.log('🔍 After setState calls')
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
      showRealTimeAlert({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to save report',
        duration: 5000
      })
      throw new Error(err.message || 'Failed to save report')
    }
  }

  const handleDeleteReport = async () => {
    try {
      await deleteReport(reportToDelete.id)
      showToast('Report deleted successfully!', 'success')
      if (selectedReport?.id === reportToDelete.id) {
        showDashboard()
      }
      setIsDeleteModalOpen(false)
    } catch (err) {
      showToast('Failed to delete report', 'error')
      throw err
    }
  }

  const toggleBackend = () => {
    setUseBackend(!useBackend)
    if (!useBackend) {
      refresh()
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Calculate comprehensive stats (use displayReports for filtered stats)
  const totalReports = displayReports.length
  const requiredReports = displayReports.filter(r => r.complianceStatus === 'Required' || r.compliance_status === 'Required').length
  const optionalReports = displayReports.filter(r => r.complianceStatus === 'Optional' || r.compliance_status === 'Optional').length
  const activeDomains = DOMAINS.length
  
  const domainCounts = DOMAINS.map(domain => ({
    domain,
    count: displayReports.filter(r => r.domain === domain).length,
    percentage: totalReports > 0 ? ((displayReports.filter(r => r.domain === domain).length / totalReports) * 100).toFixed(1) : 0
  }))

  const filteredDomains = selectedCategory === 'All' 
    ? domainCounts 
    : domainCounts.filter(d => d.domain === selectedCategory)

  return (
    <>
      <Navigation />
      <RealTimeAlerts position="top-right" maxAlerts={5} />
      <div className="h-screen flex flex-col bg-gray-900 text-white">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-4 z-50 animate-fade-in">
            <div className={`rounded-lg px-6 py-3 shadow-lg ${
              toast.type === 'success'
                ? 'bg-green-600 border border-green-500'
                : 'bg-red-600 border border-red-500'
            }`}>
              <div className="flex items-center gap-2 text-white">
                {toast.type === 'success' ? (
                  <CheckCircle size={20} />
                ) : (
                  <AlertTriangle size={20} />
                )}
                <span>{toast.message}</span>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <ReportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveReport}
          report={reportToEdit}
          mode={modalMode}
        />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteReport}
          report={reportToDelete}
        />

        {/* Top Header - Compact & Aligned */}
        <header className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
          <div className="px-4 py-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={showDashboard} className="hover:opacity-80 transition-opacity">
                  <h1 className="text-lg font-bold text-blue-400">Enterprise Finance Platform</h1>
                </button>
                <span className="text-xs text-gray-400">{reports.length} Reports • {DOMAINS.length} Domains</span>
                {isUsingBackend && (
                  <span className="text-[10px] bg-green-900 text-green-200 px-1.5 py-0.5 rounded font-medium">Live Data</span>
                )}
              </div>

              <div className="flex items-center gap-2">

                {/* Real-Time Indicator */}
                <RealTimeIndicator
                  isConnected={realtime.isActive}
                  connectionType="polling"
                  lastUpdate={realtime.lastUpdate}
                  updateCount={realtime.updateCount}
                  onRefresh={realtime.refresh}
                  showDetails={true}
                  compact={false}
                />

                {/* Predictive AI Button */}
                <button
                  onClick={() => navigate('/predictive-analytics')}
                  className="bg-violet-600 hover:bg-violet-700 px-4 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Brain size={14} />
                  <span>Predictive AI</span>
                </button>

                {/* Backend Toggle */}
                <button
                  onClick={toggleBackend}
                  className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                    useBackend ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isUsingBackend ? 'bg-green-300 animate-pulse' : 'bg-gray-400'
                    }`}></div>
                    <span>{useBackend ? 'Backend: ON' : 'Backend: OFF'}</span>
                  </div>
                </button>

                {useBackend && (
                  <>
                    {/* Refresh */}
                    <button onClick={refresh} disabled={loading} className="bg-gray-700 hover:bg-gray-600 px-2.5 py-1.5 rounded transition-colors">
                      <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>

                    {/* New Report */}
                    <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors">
                      <span className="text-sm">+</span>
                      <span>New Report</span>
                    </button>
                  </>
                )}

                {/* Dashboard */}
                <button onClick={showDashboard} className={`px-4 py-1.5 rounded text-xs font-medium transition-colors ${
                  currentView === 'dashboard' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}>
                  Dashboard
                </button>

                {/* Upload Data */}
                <button
                  onClick={() => navigate('/upload-data')}
                  className="bg-teal-600 hover:bg-teal-700 px-4 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Upload size={14} />
                  <span>Upload Data</span>
                </button>

                {/* KPI Dashboard */}
                <button
                  onClick={() => navigate('/kpi-dashboard')}
                  className="bg-cyan-600 hover:bg-cyan-700 px-4 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <BarChart3 size={14} />
                  <span>KPI Dashboard</span>
                </button>

                {/* Digital Clock — far right before avatar */}
                <div className="flex items-center gap-1.5 bg-gray-700 px-2.5 py-1.5 rounded border border-gray-600">
                  <Clock size={13} className="text-teal-400" />
                  <span className="text-xs font-mono font-semibold text-teal-400">{formatTime(currentTime)}</span>
                </div>

                {/* User Avatar */}
                <div className="relative">
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs">{user?.firstName || user?.email}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-700">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                      </div>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700">
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar onReportSelect={handleReportSelect} selectedReportId={selectedReport?.id} reports={displayReports} />

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