import { useState, useEffect } from 'react'
import { Settings, Layout, Bell, Palette, Save, RotateCcw, Download, Upload, Check } from 'lucide-react'
import { preferencesAPI } from '../services/api'
import './Personalization.css'

function Personalization() {
  const [activeTab, setActiveTab] = useState('layout')
  const [savedMessage, setSavedMessage] = useState('')

  // Layout preferences
  const [layoutPrefs, setLayoutPrefs] = useState({
    defaultView: 'dashboard',
    sidebarPosition: 'left',
    compactMode: false,
    showBreadcrumbs: true,
    cardsPerRow: 4
  })

  // Favorite reports
  const [favoriteReports, setFavoriteReports] = useState([
    { id: 1, name: 'Monthly P&L', domain: 'Finance', pinned: true },
    { id: 2, name: 'Cash Flow Statement', domain: 'Finance', pinned: true },
    { id: 3, name: 'Tax Provision', domain: 'Tax', pinned: false },
    { id: 4, name: 'Budget vs Actuals', domain: 'Finance', pinned: false }
  ])

  // Notification preferences
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: {
      newReports: true,
      complianceDeadlines: true,
      systemUpdates: false,
      weeklyDigest: true
    },
    inApp: {
      newReports: true,
      complianceDeadlines: true,
      systemUpdates: true,
      aiInsights: true
    },
    sms: {
      criticalAlerts: true,
      complianceDeadlines: false
    }
  })

  // Theme preferences
  const [themePrefs, setThemePrefs] = useState({
    theme: 'dark',
    accentColor: '#3b82f6',
    fontSize: 'medium',
    chartStyle: 'modern'
  })

  // Dashboard widgets
  const [selectedWidgets, setSelectedWidgets] = useState([
    { id: 'kpi-overview', name: 'KPI Overview', enabled: true },
    { id: 'recent-reports', name: 'Recent Reports', enabled: true },
    { id: 'compliance-calendar', name: 'Compliance Calendar', enabled: true },
    { id: 'ai-insights', name: 'AI Insights', enabled: false },
    { id: 'quick-actions', name: 'Quick Actions', enabled: true },
    { id: 'domain-breakdown', name: 'Domain Breakdown', enabled: true }
  ])

  // Available dashboard widgets
  const availableWidgets = [
    { id: 'financial-summary', name: 'Financial Summary', category: 'Finance' },
    { id: 'tax-calendar', name: 'Tax Calendar', category: 'Tax' },
    { id: 'team-activity', name: 'Team Activity', category: 'Collaboration' },
    { id: 'pending-approvals', name: 'Pending Approvals', category: 'Workflow' }
  ]

  useEffect(() => {
    preferencesAPI.get().then(r => {
      const d = r?.data?.data || r?.data
      if (!d) return
      if (d.layout_prefs && Object.keys(d.layout_prefs).length) setLayoutPrefs(d.layout_prefs)
      if (d.notification_prefs && Object.keys(d.notification_prefs).length) setNotificationPrefs(d.notification_prefs)
      if (d.theme_prefs && Object.keys(d.theme_prefs).length) setThemePrefs(d.theme_prefs)
      if (d.favorite_reports?.length) setFavoriteReports(d.favorite_reports)
    }).catch(() => {})
  }, [])

  // Save preferences
  const savePreferences = async () => {
    try {
      await preferencesAPI.save({ layout_prefs: layoutPrefs, notification_prefs: notificationPrefs, theme_prefs: themePrefs, favorite_reports: favoriteReports, domain_priorities: [] })
      setSavedMessage('Preferences saved successfully!')
      setTimeout(() => setSavedMessage(''), 3000)
    } catch (e) { setSavedMessage('Failed to save preferences') }
  }
  const resetToDefaults = () => {
    if (confirm('Reset all preferences to default values?')) {
      setLayoutPrefs({
        defaultView: 'dashboard',
        sidebarPosition: 'left',
        compactMode: false,
        showBreadcrumbs: true,
        cardsPerRow: 4
      })
      setSavedMessage('Preferences reset to defaults')
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  // Export preferences
  const exportPreferences = () => {
    const prefs = {
      layout: layoutPrefs,
      favorites: favoriteReports,
      notifications: notificationPrefs,
      theme: themePrefs,
      widgets: selectedWidgets
    }
    const blob = new Blob([JSON.stringify(prefs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'dashboard-preferences.json'
    link.click()
  }

  // Toggle widget
  const toggleWidget = (widgetId) => {
    setSelectedWidgets(widgets => 
      widgets.map(w => 
        w.id === widgetId ? { ...w, enabled: !w.enabled } : w
      )
    )
  }

  // Add widget
  const addWidget = (widget) => {
    setSelectedWidgets([...selectedWidgets, { ...widget, enabled: true }])
  }

  // Remove favorite
  const removeFavorite = (reportId) => {
    setFavoriteReports(reports => reports.filter(r => r.id !== reportId))
  }

  // Toggle pin
  const togglePin = (reportId) => {
    setFavoriteReports(reports =>
      reports.map(r =>
        r.id === reportId ? { ...r, pinned: !r.pinned } : r
      )
    )
  }

  return (
    <div className="personalization-page">
      {/* Header */}
      <div className="personalization-header">
        <div className="header-content">
          <div className="title-section">
            <Settings size={32} className="header-icon" />
            <div>
              <h1>Personalization</h1>
              <p>Customize your dashboard layouts, favorites & preferences</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={exportPreferences}>
              <Download size={18} />
              Export
            </button>
            <button className="btn-secondary" onClick={resetToDefaults}>
              <RotateCcw size={18} />
              Reset
            </button>
            <button className="btn-primary" onClick={savePreferences}>
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {savedMessage && (
        <div className="success-message">
          <Check size={20} />
          {savedMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="personalization-tabs">
        <button
          className={activeTab === 'layout' ? 'active' : ''}
          onClick={() => setActiveTab('layout')}
        >
          <Layout size={18} />
          Layout & Widgets
        </button>
        <button
          className={activeTab === 'favorites' ? 'active' : ''}
          onClick={() => setActiveTab('favorites')}
        >
          ⭐ Favorite Reports
        </button>
        <button
          className={activeTab === 'notifications' ? 'active' : ''}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={18} />
          Notifications
        </button>
        <button
          className={activeTab === 'theme' ? 'active' : ''}
          onClick={() => setActiveTab('theme')}
        >
          <Palette size={18} />
          Appearance
        </button>
      </div>

      {/* Content */}
      <div className="personalization-content">
        {/* Layout & Widgets Tab */}
        {activeTab === 'layout' && (
          <div className="settings-section">
            <h2>Layout Preferences</h2>
            
            <div className="setting-item">
              <label>Default View on Login</label>
              <select
                value={layoutPrefs.defaultView}
                onChange={(e) => setLayoutPrefs({ ...layoutPrefs, defaultView: e.target.value })}
              >
                <option value="dashboard">Dashboard</option>
                <option value="analytics">Analytics</option>
                <option value="reports">Reports List</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Sidebar Position</label>
              <select
                value={layoutPrefs.sidebarPosition}
                onChange={(e) => setLayoutPrefs({ ...layoutPrefs, sidebarPosition: e.target.value })}
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div className="setting-item">
              <label>Cards Per Row</label>
              <select
                value={layoutPrefs.cardsPerRow}
                onChange={(e) => setLayoutPrefs({ ...layoutPrefs, cardsPerRow: parseInt(e.target.value) })}
              >
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="6">6</option>
              </select>
            </div>

            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={layoutPrefs.compactMode}
                  onChange={(e) => setLayoutPrefs({ ...layoutPrefs, compactMode: e.target.checked })}
                />
                Enable Compact Mode
              </label>
            </div>

            <div className="setting-item checkbox-item">
              <label>
                <input
                  type="checkbox"
                  checked={layoutPrefs.showBreadcrumbs}
                  onChange={(e) => setLayoutPrefs({ ...layoutPrefs, showBreadcrumbs: e.target.checked })}
                />
                Show Breadcrumb Navigation
              </label>
            </div>

            <h2 style={{ marginTop: '2rem' }}>Dashboard Widgets</h2>
            
            <div className="widgets-grid">
              {selectedWidgets.map(widget => (
                <div key={widget.id} className="widget-card">
                  <input
                    type="checkbox"
                    checked={widget.enabled}
                    onChange={() => toggleWidget(widget.id)}
                  />
                  <span>{widget.name}</span>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: '1.5rem' }}>Add More Widgets</h3>
            <div className="available-widgets">
              {availableWidgets.map(widget => (
                <button
                  key={widget.id}
                  className="add-widget-btn"
                  onClick={() => addWidget(widget)}
                >
                  + {widget.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div className="settings-section">
            <h2>Favorite Reports ({favoriteReports.length})</h2>
            <p className="section-description">
              Quickly access your most-used reports. Pinned reports appear at the top.
            </p>

            <div className="favorites-list">
              {favoriteReports.map(report => (
                <div key={report.id} className="favorite-item">
                  <div className="favorite-info">
                    <span className={`pin-icon ${report.pinned ? 'pinned' : ''}`}>📌</span>
                    <div>
                      <strong>{report.name}</strong>
                      <span className="domain-badge">{report.domain}</span>
                    </div>
                  </div>
                  <div className="favorite-actions">
                    <button onClick={() => togglePin(report.id)}>
                      {report.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button onClick={() => removeFavorite(report.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-primary" style={{ marginTop: '1rem' }}>
              + Add Favorite Report
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="settings-section">
            <h2>Email Notifications</h2>
            <div className="notification-group">
              <label className="notification-item">
                <input
                  type="checkbox"
                  checked={notificationPrefs.email.newReports}
                  onChange={(e) => setNotificationPrefs({
                    ...notificationPrefs,
                    email: { ...notificationPrefs.email, newReports: e.target.checked }
                  })}
                />
                <div>
                  <strong>New Reports Published</strong>
                  <p>Get notified when new reports are available</p>
                </div>
              </label>

              <label className="notification-item">
                <input
                  type="checkbox"
                  checked={notificationPrefs.email.complianceDeadlines}
                  onChange={(e) => setNotificationPrefs({
                    ...notificationPrefs,
                    email: { ...notificationPrefs.email, complianceDeadlines: e.target.checked }
                  })}
                />
                <div>
                  <strong>Compliance Deadlines</strong>
                  <p>Reminders for upcoming tax and audit deadlines</p>
                </div>
              </label>

              <label className="notification-item">
                <input
                  type="checkbox"
                  checked={notificationPrefs.email.systemUpdates}
                  onChange={(e) => setNotificationPrefs({
                    ...notificationPrefs,
                    email: { ...notificationPrefs.email, systemUpdates: e.target.checked }
                  })}
                />
                <div>
                  <strong>System Updates</strong>
                  <p>Platform updates and new features</p>
                </div>
              </label>

              <label className="notification-item">
                <input
                  type="checkbox"
                  checked={notificationPrefs.email.weeklyDigest}
                  onChange={(e) => setNotificationPrefs({
                    ...notificationPrefs,
                    email: { ...notificationPrefs.email, weeklyDigest: e.target.checked }
                  })}
                />
                <div>
                  <strong>Weekly Digest</strong>
                  <p>Summary of activity and reports (every Monday)</p>
                </div>
              </label>
            </div>

            <h2 style={{ marginTop: '2rem' }}>In-App Notifications</h2>
            <div className="notification-group">
              <label className="notification-item">
                <input
                  type="checkbox"
                  checked={notificationPrefs.inApp.aiInsights}
                  onChange={(e) => setNotificationPrefs({
                    ...notificationPrefs,
                    inApp: { ...notificationPrefs.inApp, aiInsights: e.target.checked }
                  })}
                />
                <div>
                  <strong>AI Insights</strong>
                  <p>Anomalies, forecasts, and recommendations</p>
                </div>
              </label>
            </div>

            <h2 style={{ marginTop: '2rem' }}>SMS Notifications</h2>
            <div className="notification-group">
              <label className="notification-item">
                <input
                  type="checkbox"
                  checked={notificationPrefs.sms.criticalAlerts}
                  onChange={(e) => setNotificationPrefs({
                    ...notificationPrefs,
                    sms: { ...notificationPrefs.sms, criticalAlerts: e.target.checked }
                  })}
                />
                <div>
                  <strong>Critical Alerts Only</strong>
                  <p>Urgent compliance issues and system errors</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <div className="settings-section">
            <h2>Theme</h2>
            <div className="theme-options">
              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={themePrefs.theme === 'dark'}
                  onChange={(e) => setThemePrefs({ ...themePrefs, theme: e.target.value })}
                />
                <div className="theme-preview dark-theme">Dark</div>
              </label>
              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={themePrefs.theme === 'light'}
                  onChange={(e) => setThemePrefs({ ...themePrefs, theme: e.target.value })}
                />
                <div className="theme-preview light-theme">Light</div>
              </label>
            </div>

            <h2 style={{ marginTop: '2rem' }}>Accent Color</h2>
            <div className="color-options">
              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                <label key={color} className="color-option">
                  <input
                    type="radio"
                    name="accentColor"
                    value={color}
                    checked={themePrefs.accentColor === color}
                    onChange={(e) => setThemePrefs({ ...themePrefs, accentColor: e.target.value })}
                  />
                  <div className="color-preview" style={{ background: color }}></div>
                </label>
              ))}
            </div>

            <h2 style={{ marginTop: '2rem' }}>Font Size</h2>
            <div className="font-size-options">
              {['small', 'medium', 'large'].map(size => (
                <label key={size} className="size-option">
                  <input
                    type="radio"
                    name="fontSize"
                    value={size}
                    checked={themePrefs.fontSize === size}
                    onChange={(e) => setThemePrefs({ ...themePrefs, fontSize: e.target.value })}
                  />
                  <span>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                </label>
              ))}
            </div>

            <h2 style={{ marginTop: '2rem' }}>Chart Style</h2>
            <div className="chart-style-options">
              <label className="chart-option">
                <input
                  type="radio"
                  name="chartStyle"
                  value="modern"
                  checked={themePrefs.chartStyle === 'modern'}
                  onChange={(e) => setThemePrefs({ ...themePrefs, chartStyle: e.target.value })}
                />
                <span>Modern (Rounded)</span>
              </label>
              <label className="chart-option">
                <input
                  type="radio"
                  name="chartStyle"
                  value="classic"
                  checked={themePrefs.chartStyle === 'classic'}
                  onChange={(e) => setThemePrefs({ ...themePrefs, chartStyle: e.target.value })}
                />
                <span>Classic (Sharp)</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Personalization

