import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, TrendingUp, AlertTriangle, Lightbulb, BarChart3, Target, Zap, RefreshCw } from 'lucide-react'
import './AIInsights.css'

function AIInsights() {
  const navigate = useNavigate()
  const [selectedInsightType, setSelectedInsightType] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  // Sample AI insights data
  const insights = [
    {
      id: 1,
      type: 'anomaly',
      severity: 'high',
      title: 'Unusual Spike in Operating Expenses',
      description: 'Operating expenses increased by 47% in Q1 2026 compared to the previous quarter',
      recommendation: 'Review vendor contracts and identify cost-saving opportunities',
      affectedReports: ['Monthly P&L', 'Budget vs Actuals'],
      confidence: 94,
      timestamp: '2 hours ago'
    },
    {
      id: 2,
      type: 'forecast',
      severity: 'medium',
      title: 'Revenue Forecast for Q2 2026',
      description: 'Based on current trends, Q2 revenue is projected to reach $8.2M (±12%)',
      recommendation: 'Current trajectory is 8% below target. Consider accelerating sales initiatives',
      affectedReports: ['Sales Pipeline', 'Revenue Forecast'],
      confidence: 87,
      timestamp: '5 hours ago'
    },
    {
      id: 3,
      type: 'recommendation',
      severity: 'low',
      title: 'Cash Flow Optimization Opportunity',
      description: 'Analysis shows potential to reduce Days Sales Outstanding (DSO) by 15 days',
      recommendation: 'Implement automated payment reminders and offer early payment discounts',
      affectedReports: ['Cash Flow Statement', 'AR Aging'],
      confidence: 91,
      timestamp: '1 day ago'
    },
    {
      id: 4,
      type: 'anomaly',
      severity: 'critical',
      title: 'Tax Liability Mismatch Detected',
      description: 'Calculated tax liability differs from reported amount by $127,000',
      recommendation: 'Immediate review required. Consult with tax advisor before filing',
      affectedReports: ['Tax Provision', 'Income Tax Return'],
      confidence: 98,
      timestamp: '30 minutes ago'
    },
    {
      id: 5,
      type: 'trend',
      severity: 'medium',
      title: 'Declining Customer Retention Rate',
      description: 'Customer churn increased from 3.2% to 5.8% over the past 6 months',
      recommendation: 'Launch customer retention program and conduct satisfaction surveys',
      affectedReports: ['Customer Analytics', 'MRR Report'],
      confidence: 89,
      timestamp: '6 hours ago'
    },
    {
      id: 6,
      type: 'recommendation',
      severity: 'low',
      title: 'Inventory Optimization Suggestion',
      description: 'SKU A247 has been overstocked by 230% for 4 consecutive months',
      recommendation: 'Reduce reorder quantity and implement just-in-time ordering',
      affectedReports: ['Inventory Turnover', 'Stock Levels'],
      confidence: 83,
      timestamp: '2 days ago'
    }
  ]

  // Filter insights
  const filteredInsights = selectedInsightType === 'all' 
    ? insights 
    : insights.filter(i => i.type === selectedInsightType)

  // Statistics
  const stats = {
    total: insights.length,
    anomalies: insights.filter(i => i.type === 'anomaly').length,
    forecasts: insights.filter(i => i.type === 'forecast').length,
    recommendations: insights.filter(i => i.type === 'recommendation').length,
    avgConfidence: Math.round(insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length)
  }

  // Severity colors
  const severityColors = {
    critical: '#ef4444',
    high: '#f59e0b',
    medium: '#3b82f6',
    low: '#10b981'
  }

  // Type icons
  const typeIcons = {
    anomaly: AlertTriangle,
    forecast: TrendingUp,
    recommendation: Lightbulb,
    trend: BarChart3
  }

  // Refresh insights
  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

  return (
    <div className="ai-insights-page">
      {/* Header */}
      <div className="insights-header">
        <div className="header-content">
          <div className="title-section">
            <Brain size={32} className="header-icon" />
            <div>
              <h1>AI Insights</h1>
              <p>Automated anomaly detection, forecasting & recommendations</p>
            </div>
          </div>
          <button 
            className="btn-primary" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Analyzing...' : 'Refresh Insights'}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <Zap className="stat-icon" style={{ color: '#3b82f6' }} size={32} />
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Insights</div>
          </div>
        </div>

        <div className="stat-card">
          <AlertTriangle className="stat-icon" style={{ color: '#ef4444' }} size={32} />
          <div className="stat-content">
            <div className="stat-value">{stats.anomalies}</div>
            <div className="stat-label">Anomalies Detected</div>
          </div>
        </div>

        <div className="stat-card">
          <TrendingUp className="stat-icon" style={{ color: '#10b981' }} size={32} />
          <div className="stat-content">
            <div className="stat-value">{stats.forecasts}</div>
            <div className="stat-label">Forecasts Generated</div>
          </div>
        </div>

        <div className="stat-card">
          <Target className="stat-icon" style={{ color: '#8b5cf6' }} size={32} />
          <div className="stat-content">
            <div className="stat-value">{stats.avgConfidence}%</div>
            <div className="stat-label">Avg Confidence</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {[
          { id: 'all', label: 'All Insights', icon: Brain },
          { id: 'anomaly', label: 'Anomalies', icon: AlertTriangle },
          { id: 'forecast', label: 'Forecasts', icon: TrendingUp },
          { id: 'recommendation', label: 'Recommendations', icon: Lightbulb },
          { id: 'trend', label: 'Trends', icon: BarChart3 }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={selectedInsightType === tab.id ? 'active' : ''}
              onClick={() => setSelectedInsightType(tab.id)}
            >
              <Icon size={18} />
              {tab.label}
              {tab.id !== 'all' && (
                <span className="count-badge">
                  {insights.filter(i => i.type === tab.id).length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Insights List */}
      <div className="insights-list">
        {filteredInsights.map(insight => {
          const Icon = typeIcons[insight.type]
          return (
            <div key={insight.id} className="insight-card">
              <div className="insight-header">
                <div className="insight-type">
                  <div 
                    className="type-icon"
                    style={{ background: severityColors[insight.severity] }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="type-label">{insight.type}</div>
                    <div className="timestamp">{insight.timestamp}</div>
                  </div>
                </div>
                <div className="severity-badge" style={{ background: severityColors[insight.severity] }}>
                  {insight.severity}
                </div>
              </div>

              <h3 className="insight-title">{insight.title}</h3>
              <p className="insight-description">{insight.description}</p>

              <div className="recommendation-box">
                <Lightbulb size={16} />
                <strong>Recommendation:</strong> {insight.recommendation}
              </div>

              <div className="insight-footer">
                <div className="affected-reports">
                  <strong>Affected Reports:</strong>
                  {insight.affectedReports.map((report, idx) => (
                    <span key={idx} className="report-tag">{report}</span>
                  ))}
                </div>
                <div className="confidence-meter">
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ 
                        width: `${insight.confidence}%`,
                        background: insight.confidence >= 90 ? '#10b981' : insight.confidence >= 75 ? '#3b82f6' : '#f59e0b'
                      }}
                    ></div>
                  </div>
                  <span className="confidence-text">{insight.confidence}% confidence</span>
                </div>
              </div>

              <div className="insight-actions">
                <button className="btn-text">View Details</button>
                <button className="btn-text">Apply Recommendation</button>
                <button className="btn-text">Dismiss</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AIInsights

