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
import { TrendingUp, TrendingDown, FileText, CheckCircle, AlertTriangle, BarChart3, Clock, Upload } from 'lucide-react'
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

              <div className="flex items-center gap-2.5">
                {/* Digital Clock */}
                <div className="flex items-center gap-1.5 bg-gray-700 px-2.5 py-1.5 rounded border border-gray-600">
                  <Clock size={13} className="text-teal-400" />
                  <span className="text-xs font-mono font-semibold text-teal-400">{formatTime(currentTime)}</span>
                </div>

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

                <button
                  onClick={toggleBackend}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
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
                    <button onClick={refresh} disabled={loading} className="bg-gray-700 hover:bg-gray-600 px-2.5 py-1.5 rounded">
                      <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>

                    <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded text-xs font-medium flex items-center gap-1.5">
                      <span className="text-sm">+</span>
                      <span>New Report</span>
                    </button>
                  </>
                )}

                <button onClick={showDashboard} className={`px-4 py-1.5 rounded text-xs font-medium ${
                  currentView === 'dashboard' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                }`}>
                  Dashboard
                </button>
                <button 
                  onClick={() => navigate('/upload-data')} 
                  className="bg-teal-600 hover:bg-teal-700 px-4 py-1.5 rounded text-xs font-medium flex items-center gap-1.5"
                >
                 <Upload size={14} />
                 <span>Upload Data</span>
                 </button>
                
                <button 
                  onClick={() => navigate('/kpi-dashboard')} 
                  className="bg-cyan-600 hover:bg-cyan-700 px-4 py-1.5 rounded text-xs font-medium flex items-center gap-1.5"
                >
                 <BarChart3 size={14} />
                 <span>KPI Dashboard</span>
                 </button>

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
              <div className="dashboard-main-content">
                <div className="dashboard-content-wrapper">
                  {/* Page Header */}
                  <div className="dashboard-page-header">
                    <h1>Dashboard Overview</h1>
                    <p>Real-Time Intelligence Platform • {reports.length} reports across {activeDomains} domains</p>
                  </div>

                  {/* Advanced Filter Panel */}
                  <FilterPanel
                    activeFilters={activeFilters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetFilters}
                  />

                  {/* Advanced KPI Dashboard */}
                  <KPIPanel reports={displayReports} />

                  {/* Advanced Charts with Drill-Down */}
                  <AdvancedCharts reports={displayReports} />

                  {/* Advanced Tables with Pivot, Sort, Filter */}
                  <AdvancedTable reports={displayReports} />

                  {/* Export & Import System */}
                  <ExportImport reports={displayReports} />
				  
				  {/* Compliance Calendar */}
                  <ComplianceCalendar />
				  
				  {/*Inside your component:*/}
                  <DomainDashboard domain="Healthcare" reports={reports} />
                  <DomainDashboard domain="Telecom" reports={reports} />
                  <DomainDashboard domain="Banking" reports={reports} />
                  <DomainDashboard domain="Manufacturing" reports={reports} />

                  {/* Filter Results Counter */}
                  {Object.keys(activeFilters).length > 0 && (
                    <div style={{
                      background: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '0.75rem 1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span style={{ color: '#14b8a6', fontSize: '0.875rem', fontWeight: 600 }}>
                        📊 Showing {totalReports} of {reports.length} reports
                      </span>
                      <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                        {Object.keys(activeFilters).length} filter{Object.keys(activeFilters).length !== 1 ? 's' : ''} active
                      </span>
                    </div>
                  )}

                  {/* Stats Overview */}
                  <div className="stats-overview-grid">
                    <div className="stat-overview-card" style={{ '--accent-color': '#3B82F6' }}>
                      <div className="stat-card-header">
                        <span className="stat-card-label">Total Reports</span>
                      </div>
                      <div className="stat-card-value">{totalReports}</div>
                      <div className="stat-card-subtitle">
                        {Object.keys(activeFilters).length > 0 ? 'Filtered results' : 'Active across all domains'}
                      </div>
                      <div className="stat-card-change">
                        <span className="change-indicator positive">
                          <TrendingUp size={16} />
                          <span>12.5%</span>
                        </span>
                        <span className="change-label">vs last month</span>
                      </div>
                    </div>

                    <div className="stat-overview-card" style={{ '--accent-color': '#EF4444' }}>
                      <div className="stat-card-header">
                        <span className="stat-card-label">Required Compliance</span>
                      </div>
                      <div className="stat-card-value">{requiredReports}</div>
                      <div className="stat-card-subtitle">Mandatory reports</div>
                      <div className="stat-card-change">
                        <span className="change-indicator positive">
                          <TrendingUp size={16} />
                          <span>5.2%</span>
                        </span>
                        <span className="change-label">compliance rate</span>
                      </div>
                    </div>

                    <div className="stat-overview-card" style={{ '--accent-color': '#10B981' }}>
                      <div className="stat-card-header">
                        <span className="stat-card-label">Active Domains</span>
                      </div>
                      <div className="stat-card-value">{activeDomains}</div>
                      <div className="stat-card-subtitle">Business functions</div>
                      <div className="stat-card-change">
                        <span className="change-indicator positive">
                          <TrendingUp size={16} />
                          <span>8.1%</span>
                        </span>
                        <span className="change-label">coverage increase</span>
                      </div>
                    </div>

                    <div className="stat-overview-card" style={{ '--accent-color': '#8B5CF6' }}>
                      <div className="stat-card-header">
                        <span className="stat-card-label">Optional Reports</span>
                      </div>
                      <div className="stat-card-value">{optionalReports}</div>
                      <div className="stat-card-subtitle">Supplementary insights</div>
                      <div className="stat-card-change">
                        <span className="change-indicator positive">
                          <TrendingUp size={16} />
                          <span>15.7%</span>
                        </span>
                        <span className="change-label">adoption rate</span>
                      </div>
                    </div>
                  </div>

                  {/* Category Filters */}
                  <div className="category-filters">
                    <button
                      className={`category-pill ${selectedCategory === 'All' ? 'active' : ''}`}
                      onClick={() => setSelectedCategory('All')}
                    >
                      All Domains
                    </button>
                    {DOMAINS.map(domain => (
                      <button
                        key={domain}
                        className={`category-pill ${selectedCategory === domain ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(domain)}
                      >
                        {domain}
                      </button>
                    ))}
                  </div>

                  {/* Domain Cards */}
                  <div className="domain-cards-grid">
                    {filteredDomains.map(({ domain, count, percentage }) => (
                      <div key={domain} className="domain-card">
                        <div className="domain-card-header">
                          <div>
                            <div className="domain-card-title">{domain}</div>
                            <div className="domain-card-category">Business Function</div>
                          </div>
                        </div>
                        <div className="domain-metrics">
                          <div className="metric-item">
                            <span className="metric-value">{count}</span>
                            <span className="metric-label">Reports</span>
                            <div className="metric-change up">↑ 8.2%</div>
                          </div>
                          <div className="metric-item">
                            <span className="metric-value">{percentage}%</span>
                            <span className="metric-label">of Total</span>
                            <div className="metric-change up">↑ 2.1%</div>
                          </div>
                          <div className="metric-item">
                            <span className="metric-value">{Math.floor(count * 0.7)}</span>
                            <span className="metric-label">Active</span>
                            <div className="metric-change up">↑ 5.4%</div>
                          </div>
                        </div>

                        {/* Clickable Reports */}
                        {displayReports.filter(r => r.domain === domain).slice(0, 5).length > 0 && (
                          <div style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '1px solid #334155'
                          }}>
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#64748b',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              fontWeight: 600,
                              marginBottom: '0.75rem'
                            }}>
                              Recent Reports
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {displayReports.filter(r => r.domain === domain).slice(0, 5).map(report => (
                                <button
                                  type="button"
                                  key={report.id || report.report_id}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                      e.preventDefault()  // ⭐ ADD THIS
                                      console.log('🔍 Button clicked!')
                                    handleReportSelect(report)
                                  }}
                                  style={{
                                    padding: '0.75rem',
                                    background: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '6px',
                                    color: '#f1f5f9',
                                    fontSize: '0.875rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '100%',
                                    textAlign: 'left'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#1e293b'
                                    e.currentTarget.style.borderColor = '#14B8A6'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#0f172a'
                                    e.currentTarget.style.borderColor = '#334155'
                                  }}
                                >
                                  <span style={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flex: 1
                                  }}>
                                    {report.name}
                                  </span>
                                  <FileText size={16} style={{ color: '#14B8A6', flexShrink: 0, marginLeft: '0.5rem' }} />
                                </button>
                              ))}
                            </div>
                            {count > 5 && (
                              <button
                               type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedCategory(domain)
                                }}
                                style={{
                                  marginTop: '0.75rem',
                                  width: '100%',
                                  padding: '0.5rem',
                                  background: 'transparent',
                                  border: '1px solid #334155',
                                  borderRadius: '6px',
                                  color: '#14B8A6',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(20, 184, 166, 0.1)'
                                  e.currentTarget.style.borderColor = '#14B8A6'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent'
                                  e.currentTarget.style.borderColor = '#334155'
                                }}
                              >
                                View All {count} Reports
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {isUsingBackend && pagination && (
                    <Pagination pagination={pagination} onPageChange={handlePageChange} loading={loading} />
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