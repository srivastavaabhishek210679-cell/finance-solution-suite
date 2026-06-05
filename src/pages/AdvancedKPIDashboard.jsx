import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Calendar,
  Target,
  Shield,
  BarChart3,
  Percent,
  Users,
  Database,
  Upload,
  ArrowLeft,
  X
} from 'lucide-react';
import './AdvancedKPIDashboard.css';

const AdvancedKPIDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Format time ago
  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const [timeAgo, setTimeAgo] = useState(getTimeAgo(lastUpdated));

  // Simulate fetching real-time data
  useEffect(() => {
    const fetchDashboardData = () => {
      // In production, this would fetch from your backend API
      const data = {
        automationStatus: {
          automationRate: 45.5,
          automatedRecords: 1250,
          manualIntervention: 15,
          timeSaved: 156,
          trends: {
            automationRate: 12.3,
            automatedRecords: 15,
            manualIntervention: -8,
            timeSaved: 23
          }
        },
        performanceIndicators: {
          completionRate: 94.2,
          onTimeDelivery: 88.5,
          qualityScore: 92.3,
          avgProcessingTime: 2.4,
          trends: {
            completionRate: 5.2,
            onTimeDelivery: 3.1,
            qualityScore: 2.4,
            avgProcessingTime: -1.2
          }
        },
        riskMetrics: {
          riskScore: 18.5,
          criticalRisk: 2,
          highRisk: 5,
          lowRisk: 23,
          trends: {
            riskScore: -5.3,
            criticalRisk: -2,
            highRisk: 1,
            lowRisk: 12
          }
        },
        complianceMetrics: {
          complianceRate: 96.8,
          requiredReports: 12,
          upcomingDeadlines: 3,
          overdue: 0,
          trends: {
            complianceRate: 4.1,
            requiredReports: 3,
            upcomingDeadlines: 0,
            overdue: -1
          }
        },
        overallScores: {
          healthScore: 91.5,
          healthTrend: 3.2,
          automationCoverage: 45.5,
          automationTrend: 12.3,
          riskLevel: 18.5,
          riskTrend: -5.3,
          compliance: 96.8,
          complianceTrend: 4.1
        }
      };

      setDashboardData(data);
      setLastUpdated(new Date());
      setLoading(false);
    };

    fetchDashboardData();

    // Simulate real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update time ago display every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeAgo(getTimeAgo(lastUpdated));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lastUpdated]);

  const renderTrendIndicator = (value) => {
    if (value > 0) {
      return (
        <span className="trend-indicator positive">
          <TrendingUp size={14} />
          +{value}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="trend-indicator negative">
          <TrendingDown size={14} />
          {value}%
        </span>
      );
    } else {
      return (
        <span className="trend-indicator neutral">
          <Activity size={14} />
          {value}%
        </span>
      );
    }
  };

  const renderKPICard = (config) => {
    const { 
      icon: Icon, 
      label, 
      value, 
      subtitle, 
      trend, 
      colorClass = 'default',
      format = 'number' 
    } = config;

    let displayValue = value;
    if (format === 'percentage') displayValue = `${value}%`;
    if (format === 'currency') displayValue = `$${value.toLocaleString()}`;
    if (format === 'time') displayValue = `${value}h`;

    return (
      <div className={`kpi-metric-card ${colorClass}`}>
        <div className="metric-icon">
          <Icon size={24} />
        </div>
        <div className="metric-content">
          <div className="metric-label">{label}</div>
          <div className="metric-value">{displayValue}</div>
          <div className="metric-subtitle">{subtitle}</div>
          {trend !== undefined && (
            <div className="metric-trend">{renderTrendIndicator(trend)}</div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="kpi-dashboard-container">
        <div className="loading-state">
          <Activity size={48} className="loading-spinner" />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const { automationStatus, performanceIndicators, riskMetrics, complianceMetrics, overallScores } = dashboardData;

  return (
    <div className="kpi-dashboard-container">
      {/* Header */}
      <div className="kpi-dashboard-header">
        <div className="header-content">
          <div className="header-icon">
            <BarChart3 size={32} />
          </div>
          <div className="header-text">
            <h1>Advanced KPI Dashboard</h1>
            <p>Real-time performance metrics and analytics</p>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-back" onClick={() => navigate('/dashboard', {state:{from:'workspace'}})}>
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <button className="btn-refresh">
            <Activity size={18} className="pulse-icon" />
            <span className="live-status">
              <span className="status-dot"></span>
              Live
            </span>
            <span className="separator">•</span>
            <span className="time-ago">{timeAgo}</span>
          </button>
        </div>
      </div>

      {/* KPI Sections */}
      <div className="kpi-sections-grid">
        
        {/* Automation Status */}
        <div className="kpi-section">
          <div className="section-header">
            <Zap size={20} />
            <h2>AUTOMATION STATUS</h2>
          </div>
          <div className="kpi-cards-row">
            {renderKPICard({
              icon: Percent,
              label: 'AUTOMATION RATE',
              value: automationStatus.automationRate,
              subtitle: `${automationStatus.automatedRecords} of ${automationStatus.automatedRecords + automationStatus.manualIntervention} automated`,
              trend: automationStatus.trends.automationRate,
              format: 'percentage',
              colorClass: 'primary'
            })}
            {renderKPICard({
              icon: Zap,
              label: 'AUTOMATED RECORDS',
              value: automationStatus.automatedRecords,
              subtitle: `Fully automated processes`,
              trend: automationStatus.trends.automatedRecords,
              colorClass: 'success'
            })}
            {renderKPICard({
              icon: Users,
              label: 'MANUAL INTERVENTION',
              value: automationStatus.manualIntervention,
              subtitle: 'Requiring manual review',
              trend: automationStatus.trends.manualIntervention,
              colorClass: 'warning'
            })}
            {renderKPICard({
              icon: Clock,
              label: 'TIME SAVED',
              value: automationStatus.timeSaved,
              subtitle: 'Monthly time savings',
              trend: automationStatus.trends.timeSaved,
              format: 'time',
              colorClass: 'info'
            })}
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="kpi-section">
          <div className="section-header">
            <Activity size={20} />
            <h2>PERFORMANCE INDICATORS</h2>
          </div>
          <div className="kpi-cards-row">
            {renderKPICard({
              icon: CheckCircle,
              label: 'COMPLETION RATE',
              value: performanceIndicators.completionRate,
              subtitle: '% of reports completed',
              trend: performanceIndicators.trends.completionRate,
              format: 'percentage',
              colorClass: 'success'
            })}
            {renderKPICard({
              icon: Calendar,
              label: 'ON-TIME DELIVERY',
              value: performanceIndicators.onTimeDelivery,
              subtitle: '% submitted by deadline',
              trend: performanceIndicators.trends.onTimeDelivery,
              format: 'percentage',
              colorClass: 'primary'
            })}
            {renderKPICard({
              icon: Target,
              label: 'QUALITY SCORE',
              value: performanceIndicators.qualityScore,
              subtitle: 'Average quality rating',
              trend: performanceIndicators.trends.qualityScore,
              colorClass: 'info'
            })}
            {renderKPICard({
              icon: Clock,
              label: 'AVG PROCESSING',
              value: performanceIndicators.avgProcessingTime,
              subtitle: 'Average completion time',
              trend: performanceIndicators.trends.avgProcessingTime,
              format: 'time',
              colorClass: 'success'
            })}
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="kpi-section">
          <div className="section-header">
            <Shield size={20} />
            <h2>RISK METRICS</h2>
          </div>
          <div className="kpi-cards-row">
            {renderKPICard({
              icon: Activity,
              label: 'RISK SCORE',
              value: riskMetrics.riskScore,
              subtitle: 'Lower is better (0-100)',
              trend: riskMetrics.trends.riskScore,
              colorClass: 'success'
            })}
            {renderKPICard({
              icon: AlertTriangle,
              label: 'CRITICAL RISK',
              value: riskMetrics.criticalRisk,
              subtitle: 'Immediate attention required',
              trend: riskMetrics.trends.criticalRisk,
              colorClass: 'danger'
            })}
            {renderKPICard({
              icon: AlertTriangle,
              label: 'HIGH RISK',
              value: riskMetrics.highRisk,
              subtitle: 'Proactive monitoring',
              trend: riskMetrics.trends.highRisk,
              colorClass: 'warning'
            })}
            {renderKPICard({
              icon: CheckCircle,
              label: 'LOW RISK',
              value: riskMetrics.lowRisk,
              subtitle: 'Well managed',
              trend: riskMetrics.trends.lowRisk,
              colorClass: 'success'
            })}
          </div>
        </div>

        {/* Compliance Metrics */}
        <div className="kpi-section">
          <div className="section-header">
            <CheckCircle size={20} />
            <h2>COMPLIANCE METRICS</h2>
          </div>
          <div className="kpi-cards-row">
            {renderKPICard({
              icon: Percent,
              label: 'COMPLIANCE RATE',
              value: complianceMetrics.complianceRate,
              subtitle: 'Regulatory compliance',
              trend: complianceMetrics.trends.complianceRate,
              format: 'percentage',
              colorClass: 'success'
            })}
            {renderKPICard({
              icon: FileText,
              label: 'REQUIRED REPORTS',
              value: complianceMetrics.requiredReports,
              subtitle: 'Mandatory compliance',
              trend: complianceMetrics.trends.requiredReports,
              colorClass: 'info'
            })}
            {renderKPICard({
              icon: Calendar,
              label: 'UPCOMING DEADLINES',
              value: complianceMetrics.upcomingDeadlines,
              subtitle: 'Reports due soon',
              trend: complianceMetrics.trends.upcomingDeadlines,
              colorClass: 'warning'
            })}
            {renderKPICard({
              icon: Clock,
              label: 'OVERDUE',
              value: complianceMetrics.overdue,
              subtitle: 'Past deadline',
              trend: complianceMetrics.trends.overdue,
              colorClass: complianceMetrics.overdue > 0 ? 'danger' : 'success'
            })}
          </div>
        </div>
      </div>

      {/* Overall Scores */}
      <div className="overall-scores-section">
        <div className="score-card">
          <div className="score-label">OVERALL HEALTH SCORE</div>
          <div className="score-value" style={{ color: '#10b981' }}>{overallScores.healthScore}%</div>
          <div className="score-trend">{renderTrendIndicator(overallScores.healthTrend)}</div>
        </div>
        <div className="score-card">
          <div className="score-label">AUTOMATION COVERAGE</div>
          <div className="score-value" style={{ color: '#3b82f6' }}>{overallScores.automationCoverage}%</div>
          <div className="score-trend">{renderTrendIndicator(overallScores.automationTrend)}</div>
        </div>
        <div className="score-card">
          <div className="score-label">RISK LEVEL</div>
          <div className="score-value" style={{ color: '#14b8a6' }}>{overallScores.riskLevel}</div>
          <div className="score-trend">{renderTrendIndicator(overallScores.riskTrend)}</div>
        </div>
        <div className="score-card">
          <div className="score-label">COMPLIANCE</div>
          <div className="score-value" style={{ color: '#10b981' }}>{overallScores.compliance}%</div>
          <div className="score-trend">{renderTrendIndicator(overallScores.complianceTrend)}</div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedKPIDashboard;

