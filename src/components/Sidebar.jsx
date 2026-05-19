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
  Link2
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
      // TODO: Replace with actual API call
      const mockReports = []
      DOMAINS.forEach((domain, domainIndex) => {
        const reportsPerDomain = Math.floor(500 / 13) + (domainIndex < 500 % 13 ? 1 : 0)
        for (let i = 0; i < reportsPerDomain; i++) {
          mockReports.push({
            id: mockReports.length + 1,
            name: `${domain.name} Report ${i + 1}`,
            domain: domain.name,
            frequency: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'][i % 5],
            complianceStatus: i % 3 === 0 ? 'Required' : 'Optional',
            description: `Detailed ${domain.name.toLowerCase()} report for ${['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'][i % 5].toLowerCase()} analysis`
          })
        }
      })
      setReports(mockReports)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
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
    { path: '/customers',            icon: Users,         label: 'Customers' },
    { path: '/tenants',              icon: Building2,     label: 'Multi-Tenant',         adminOnly: true },
    { path: '/ai-insights',          icon: Sparkles,      label: 'AI Insights',          badge: 'New', badgeColor: '#10b981' },
    { path: '/collaboration',        icon: Share2,        label: 'Collaboration' },
    { path: '/reviews',              icon: Star,          label: 'Reviews & Ratings' },
    { path: '/personalization',      icon: Settings,      label: 'Personalization' },
    { path: '/modules',              icon: Package,       label: 'Module Manager',       adminOnly: true },
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
