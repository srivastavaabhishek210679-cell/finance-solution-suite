import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  BarChart3, 
  Building2, 
  Users, 
  MessageCircle, 
  Sparkles, 
  Settings, 
  Share2, 
  Star, 
  Package,
  DollarSign,
  Briefcase, 
  Eye,
  FileText,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  CheckCircle,
  AlertCircle,
  GitBranch,
  Brain,
  BookOpen,
  Plane,
  Clock,
  Headphones,
  TrendingUp,
  UserPlus,
  Shield,
  Calendar,
  Truck,
  Link2,
  CreditCard
} from 'lucide-react'
import './Sidebar.css'

function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedDomains, setExpandedDomains] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)

  // 13 Domains
  const DOMAINS = [
    { name: 'Finance', icon: '💰', color: '#10b981' },
    { name: 'HR', icon: '👥', color: '#3b82f6' },
    { name: 'Operations', icon: '⚙️', color: '#f59e0b' },
    { name: 'Sales', icon: '📊', color: '#8b5cf6' },
    { name: 'IT', icon: '💻', color: '#06b6d4' },
    { name: 'Healthcare', icon: '🏥', color: '#ec4899' },
    { name: 'Telecom', icon: '📡', color: '#14b8a6' },
    { name: 'Retail', icon: '🛒', color: '#f97316' },
    { name: 'Energy', icon: '⚡', color: '#eab308' },
    { name: 'Manufacturing', icon: '🏭', color: '#6366f1' },
    { name: 'Banking', icon: '🏦', color: '#22c55e' },
    { name: 'Education', icon: '🎓', color: '#a855f7' },
    { name: 'General', icon: '📋', color: '#64748b' }
  ]

  // Fetch reports on mount
  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const workspace = JSON.parse(localStorage.getItem('userWorkspace') || '{}')
      const domains = workspace.selected_domains || []
      const domainParam = domains.length ? domains.join(',') : '1,2,3,4,5,6,7,8,9,10,11,12,13'
      const res = await fetch('https://finance-backend-so86.onrender.com/api/v1/workspace/reports-by-domains?domains=' + domainParam, {
        headers: { Authorization: 'Bearer ' + token }
      })
      const data = await res.json()
      setReports(data.data || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }
    }
  }

  const isActive = (path) => location.pathname === path

  // Toggle domain expansion
  const toggleDomain = (domain) => {
    setExpandedDomains(prev => ({
      ...prev,
      [domain]: !prev[domain]
    }))
  }

  // Expand all domains
  const expandAll = () => {
    const allExpanded = {}
    DOMAINS.forEach(domain => {
      allExpanded[domain.name] = true
    })
    setExpandedDomains(allExpanded)
  }

  // Collapse all domains
  const collapseAll = () => {
    setExpandedDomains({})
  }

  // Get reports by domain with search filter
  const getReportsByDomain = (domainName) => {
    let domainReports = reports.filter(r => r.domain === domainName)
    
    if (searchQuery) {
      domainReports = domainReports.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    return domainReports
  }

  // Main menu items
  const mainMenuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  const featureMenuItems = [
    { path: '/chatbot',               icon: MessageCircle, label: 'AI Assistant',         badge: 'AI',  badgeColor: '#8b5cf6' },
    { path: '/ai-copilot',            icon: Brain,         label: 'AI Copilot',           badge: 'New', badgeColor: '#8b5cf6' },
    { path: '/workflow-automation',   icon: GitBranch,     label: 'Workflow Automation',  badge: 'New', badgeColor: '#10b981' },
    { path: '/executive-reporting',   icon: BarChart3,     label: 'Executive Reports',    badge: 'New', badgeColor: '#0f766e' },
    { path: '/integration-ecosystem', icon: Link2,         label: 'Integrations',         badge: 'New', badgeColor: '#0e7490' },
    { path: '/monetization',          icon: CreditCard,    label: 'Billing & Plans',      badge: 'New', badgeColor: '#7c3aed' },
    { path: '/customers',            icon: Users,         label: 'Customers' },
    { path: '/tenants',              icon: Building2,     label: 'Multi-Tenant',         adminOnly: true },
    { path: '/ai-insights',          icon: Sparkles,      label: 'AI Insights',          badge: 'New', badgeColor: '#10b981' },
    { path: '/collaboration',        icon: Share2,        label: 'Collaboration' },
    { path: '/reviews',              icon: Star,          label: 'Reviews & Ratings' },
    { path: '/personalization',      icon: Settings,      label: 'Personalization' },
    { path: '/modules',              icon: Package,       label: 'Module Manager',       adminOnly: true },
    { path: '/project-mgmt',               icon: Briefcase,     label: 'Project Management',  badge: 'NEW', badgeColor: '#f59e0b' },
    { path: '/resources-mgmt',              icon: Users,         label: 'Resource Management', badge: 'NEW', badgeColor: '#3b82f6' },
    { path: '/budget-mgmt',             icon: DollarSign,    label: 'Budget Management',   badge: 'NEW', badgeColor: '#10b981' },
    { path: '/leave-mgmt',              icon: Calendar,      label: 'Leave Management',    badge: 'NEW', badgeColor: '#8b5cf6' },
    { path: '/vendor-mgmt',             icon: Truck,         label: 'Vendor Management',   badge: 'NEW', badgeColor: '#14b8a6' },
    { path: '/asset-mgmt',              icon: Package,       label: 'Asset Management',    badge: 'NEW', badgeColor: '#f59e0b' },
    { path: '/inventory-mgmt',            icon: Package,       label: 'Inventory Management', badge: 'NEW', badgeColor: '#3b82f6' },
    { path: '/crm-mgmt',                  icon: Users,         label: 'CRM',                  badge: 'NEW', badgeColor: '#6366f1' },
    { path: '/document-mgmt',             icon: FileText,      label: 'Document Management',  badge: 'NEW', badgeColor: '#14b8a6' },
    { path: '/risk-mgmt',                 icon: Shield,        label: 'Risk Management',      badge: 'NEW', badgeColor: '#ef4444' },
    { path: '/expense-mgmt',              icon: CreditCard,    label: 'Expense Management',   badge: 'NEW', badgeColor: '#f59e0b' },
    { path: '/performance-mgmt',          icon: TrendingUp,    label: 'Performance',          badge: 'NEW', badgeColor: '#10b981' },
    { path: '/invoices',                  icon: FileText,      label: 'Invoices AP/AR',       badge: 'NEW', badgeColor: '#3b82f6' },
    { path: '/training',                  icon: BookOpen,      label: 'Training Management',  badge: 'NEW', badgeColor: '#8b5cf6' },
    { path: '/travel',                    icon: Plane,         label: 'Travel Management',    badge: 'NEW', badgeColor: '#14b8a6' },
    { path: '/attendance',               icon: Clock,         label: 'Attendance',           badge: 'NEW', badgeColor: '#f59e0b' },
    { path: '/sales-pipeline',           icon: TrendingUp,    label: 'Sales Pipeline',       badge: 'NEW', badgeColor: '#10b981' },
    { path: '/helpdesk',                 icon: Headphones,    label: 'IT Helpdesk',          badge: 'NEW', badgeColor: '#3b82f6' },
    { path: '/audit-log',                icon: Shield,        label: 'Audit Log',            badge: 'NEW', badgeColor: '#10b981' },
    { path: '/compliance',               icon: Shield,        label: 'Compliance',           badge: 'NEW', badgeColor: '#10b981' },
    { path: '/recruitment-mgmt',          icon: UserPlus,      label: 'Recruitment',          badge: 'NEW', badgeColor: '#8b5cf6' },
    { path: '/contract-mgmt',           icon: FileText,      label: 'Contract Management', badge: 'NEW', badgeColor: '#6366f1' },
    { path: '/payroll',              icon: DollarSign,    label: 'Payroll Management',   badge: 'NEW', badgeColor: '#10b981' },
    { path: '/accessibility',        icon: Eye,           label: 'Accessibility' },
  ]

  const getDomainData = (domainName) => {
    return DOMAINS.find(d => d.name === domainName) || { icon: '📋', color: '#64748b' }
  }

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <FileText className="brand-icon" size={16} />
          <div>
            <h2 className="brand-title">Finance Dashboard</h2>
            <p className="brand-subtitle">500 Reports · 13 Domains</p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="sidebar-nav">
        {/* Main Menu */}
        <div className="menu-section">
          <div className="menu-section-header">Main</div>
          <div className="menu-items">
            {mainMenuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`menu-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <item.icon className="menu-item-icon" />
                <span className="menu-item-label">{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* New Features Section - As Tiles */}
        <div className="menu-section">
          <div className="menu-section-header">
            <span>New Features</span>
            <span className="feature-count">{featureMenuItems.length}</span>
          </div>
          <div className="feature-tiles">
            {featureMenuItems.map((item) => (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`feature-tile ${isActive(item.path) ? 'active' : ''}`}
              >
                <div className="feature-tile-header">
                  <item.icon className="feature-tile-icon" />
                  <span className="feature-tile-name">{item.label}</span>
                </div>
                <div className="feature-tile-badges">
                  {item.badge && (
                    <span className="feature-badge" style={{ background: item.badgeColor }}>
                      {item.badge}
                    </span>
                  )}
                  {item.adminOnly && (
                    <span className="feature-admin-badge">Admin</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports Section with Tiles */}
        <div className="menu-section reports-section">
          <div className="menu-section-header">
            <span>All Reports ({reports.length})</span>
          </div>

          {/* Search Box */}
          <div className="sidebar-search">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="search-clear">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Expand/Collapse All */}
          <div className="expand-collapse-buttons">
            <button onClick={expandAll} className="expand-btn">Expand All</button>
            <button onClick={collapseAll} className="collapse-btn">Collapse All</button>
          </div>

          {/* Domain List with Report Tiles */}
          {loading ? (
            <div className="loading-state">Loading reports...</div>
          ) : (
            <div className="domains-list">
              {DOMAINS.map((domain) => {
                const domainReports = getReportsByDomain(domain.name)
                const isExpanded = expandedDomains[domain.name]

                if (searchQuery && domainReports.length === 0) {
                  return null
                }

                return (
                  <div key={domain.name} className="domain-group">
                    {/* Domain Header */}
                    <button
                      onClick={() => toggleDomain(domain.name)}
                      className="domain-header"
                      style={{ borderLeftColor: domain.color }}
                    >
                      <div className="domain-header-left">
                        {isExpanded ? (
                          <ChevronDown className="domain-chevron" />
                        ) : (
                          <ChevronRight className="domain-chevron" />
                        )}
                        <span className="domain-icon">{domain.icon}</span>
                        <span className="domain-name">{domain.name}</span>
                      </div>
                      <span className="domain-count" style={{ background: `${domain.color}20`, color: domain.color }}>
                        {domainReports.length}
                      </span>
                    </button>

                    {/* Domain Reports as Tiles */}
                    {isExpanded && (
                      <div className="reports-tiles">
                        {domainReports.map((report) => (
                          <div
                            key={report.id}
                            onClick={() => navigate(`/reports/${report.id}`)}
                            className={`report-tile ${location.pathname === `/reports/${report.id}` ? 'active' : ''}`}
                            style={{ borderLeftColor: domain.color }}
                          >
                            <div className="report-tile-header">
                              <FileText className="report-tile-icon" size={16} />
                              <span className="report-tile-name">{report.name}</span>
                            </div>
                            <div className="report-tile-meta">
                              <span className="report-frequency">{report.frequency}</span>
                              {report.complianceStatus === 'Required' && (
                                <span className="report-badge required">
                                  <CheckCircle size={10} />
                                  Required
                                </span>
                              )}
                              {report.complianceStatus === 'Optional' && (
                                <span className="report-badge optional">
                                  <AlertCircle size={10} />
                                  Optional
                                </span>
                              )}
                            </div>
                            <p className="report-tile-description">{report.description}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* No Results */}
          {searchQuery && reports.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
            <div className="no-results">
              No reports found for "{searchQuery}"
            </div>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="footer-info-box">
          <Sparkles className="footer-icon" />
          <div>
            <div className="footer-title">500 Reports Available</div>
            <div className="footer-subtitle">Access all reports across 13 domains</div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar












