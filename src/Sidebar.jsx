import { useState } from 'react'
import { DOMAINS } from '../data/reportsData'
import './Sidebar.css'

function Sidebar({ onReportSelect, selectedReportId, reports = [] }) {
  const [expandedDomains, setExpandedDomains] = useState({})
  const [sidebarSearch, setSidebarSearch] = useState('')
  const [isCollapsed, setIsCollapsed] = useState(false)

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
      allExpanded[domain] = true
    })
    setExpandedDomains(allExpanded)
  }

  // Collapse all domains
  const collapseAll = () => {
    setExpandedDomains({})
  }

  // Get reports by domain with search filter
  const getReportsByDomain = (domain) => {
    let filteredReports = reports.filter(r => r.domain === domain)
    
    if (sidebarSearch) {
      filteredReports = filteredReports.filter(r => 
        r.name.toLowerCase().includes(sidebarSearch.toLowerCase())
      )
    }
    
    return filteredReports
  }

  // Get domain report count
  const getDomainCount = (domain) => {
    return getReportsByDomain(domain).length
  }

  // Total reports count
  const totalReportsCount = reports.length

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-80'} bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-700">
        {!isCollapsed && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-blue-400">Reports Menu</h2>
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-gray-400 hover:text-white"
                title="Collapse Sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>
            
            {/* Search */}
            <input
              type="text"
              placeholder="Search reports..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
            
            {/* Expand/Collapse All */}
            <div className="flex gap-2 mt-2">
              <button
                onClick={expandAll}
                className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-gray-300"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="flex-1 text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-gray-300"
              >
                Collapse All
              </button>
            </div>
          </>
        )}
        
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="text-gray-400 hover:text-white w-full flex justify-center"
            title="Expand Sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Domains & Reports List */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="p-2">
            {DOMAINS.map(domain => {
              const domainReports = getReportsByDomain(domain)
              const isExpanded = expandedDomains[domain]
              const reportCount = getDomainCount(domain)

              if (sidebarSearch && reportCount === 0) return null

              return (
                <div key={domain} className="mb-2">
                  {/* Domain Header */}
                  <button
                    onClick={() => toggleDomain(domain)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-left transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <svg 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="font-medium text-white">{domain}</span>
                    </div>
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      {reportCount}
                    </span>
                  </button>

                  {/* Reports List */}
                  {isExpanded && (
                    <div className="mt-1 ml-4 space-y-1">
                      {domainReports.map(report => (
                        <button
                          key={report.id}
                          onClick={() => onReportSelect(report)}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            selectedReportId === report.id
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="flex-1">{report.name}</span>
                            {report.complianceStatus === 'Required' && (
                              <span className="text-xs bg-red-900 text-red-200 px-1.5 py-0.5 rounded flex-shrink-0">
                                Req
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {report.frequency}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* No Results */}
            {sidebarSearch && DOMAINS.every(domain => getDomainCount(domain) === 0) && (
              <div className="text-center py-8 text-gray-400">
                <p>No reports found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        )}

        {/* Collapsed View - Domain Icons */}
        {isCollapsed && (
          <div className="p-2 space-y-2">
            {DOMAINS.map(domain => {
              const reportCount = reports.filter(r => r.domain === domain).length
              return (
                <button
                  key={domain}
                  onClick={() => {
                    setIsCollapsed(false)
                    setExpandedDomains({ [domain]: true })
                  }}
                  className="w-full p-2 bg-gray-700 hover:bg-gray-600 rounded text-center transition-colors"
                  title={`${domain} (${reportCount} reports)`}
                >
                  <div className="text-xl font-bold text-blue-400">
                    {domain.charAt(0)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {reportCount}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-700">
        {!isCollapsed && (
          <div className="text-xs text-gray-400 text-center">
            <div className="font-semibold text-blue-400">{totalReportsCount} Reports</div>
            <div className="mt-1">{DOMAINS.length} Domains</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
