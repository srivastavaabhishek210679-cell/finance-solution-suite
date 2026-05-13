import { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Zap, Clock, AlertTriangle, 
  CheckCircle, Target, BarChart3, Activity, Shield,
  Calendar, AlertCircle, Award, Percent
} from 'lucide-react';
import './KPIPanel.css';

function KPIPanel({ reports }) {
  const [selectedMetric, setSelectedMetric] = useState(null);

  // ===== AUTOMATION METRICS =====
  const calculateAutomationMetrics = () => {
    const automated = reports.filter(r => 
      r.automationStatus === 'Automated' || r.automation_status === 'Automated'
    ).length;
    const manual = reports.filter(r => 
      r.automationStatus === 'Manual' || r.automation_status === 'Manual' || 
      (!r.automationStatus && !r.automation_status)
    ).length;
    const hybrid = reports.filter(r => 
      r.automationStatus === 'Hybrid' || r.automation_status === 'Hybrid'
    ).length;
    
    const total = reports.length;
    const automationRate = total > 0 ? ((automated / total) * 100).toFixed(1) : 0;
    const timeSavedHours = automated * 2; // Assume 2 hours saved per automated report
    
    return { automated, manual, hybrid, automationRate, timeSavedHours };
  };

  // ===== PERFORMANCE METRICS =====
  const calculatePerformanceMetrics = () => {
    const total = reports.length;
    
    // Completion rate (assuming reports with lastSubmitted are completed)
    const completed = reports.filter(r => 
      r.lastSubmitted || r.last_submitted || r.completedAt || r.completed_at
    ).length;
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
    
    // On-time submissions (mock data - would come from actual submission dates vs deadlines)
    const onTimeSubmissions = Math.floor(completed * 0.85); // 85% on-time
    const onTimeRate = completed > 0 ? ((onTimeSubmissions / completed) * 100).toFixed(1) : 0;
    
    // Overdue reports (mock - would check against actual deadlines)
    const overdueReports = total - completed;
    
    // Quality score (mock - would come from review scores)
    const qualityScore = 87.5;
    
    // Average processing time in hours (mock)
    const avgProcessingTime = 12.5;
    
    return { 
      completionRate, 
      onTimeRate, 
      overdueReports, 
      qualityScore,
      avgProcessingTime,
      completed
    };
  };

  // ===== RISK METRICS =====
  const calculateRiskMetrics = () => {
    const low = reports.filter(r => 
      r.riskLevel === 'Low' || r.risk_level === 'Low'
    ).length;
    const medium = reports.filter(r => 
      r.riskLevel === 'Medium' || r.risk_level === 'Medium'
    ).length;
    const high = reports.filter(r => 
      r.riskLevel === 'High' || r.risk_level === 'High'
    ).length;
    const critical = reports.filter(r => 
      r.riskLevel === 'Critical' || r.risk_level === 'Critical'
    ).length;
    
    // If no risk data, distribute evenly for demo
    const total = reports.length;
    const hasRiskData = low + medium + high + critical > 0;
    
    const riskDistribution = hasRiskData ? {
      low,
      medium,
      high,
      critical
    } : {
      low: Math.floor(total * 0.5),
      medium: Math.floor(total * 0.3),
      high: Math.floor(total * 0.15),
      critical: Math.floor(total * 0.05)
    };
    
    // Overall risk score (0-100, lower is better)
    const riskScore = (
      (riskDistribution.low * 10) +
      (riskDistribution.medium * 30) +
      (riskDistribution.high * 60) +
      (riskDistribution.critical * 100)
    ) / (total || 1);
    
    return { ...riskDistribution, riskScore: riskScore.toFixed(1) };
  };

  // ===== COMPLIANCE METRICS =====
  const calculateComplianceMetrics = () => {
    const required = reports.filter(r => 
      r.complianceStatus === 'Required' || r.compliance_status === 'Required'
    ).length;
    const optional = reports.filter(r => 
      r.complianceStatus === 'Optional' || r.compliance_status === 'Optional'
    ).length;
    const recommended = reports.filter(r => 
      r.complianceStatus === 'Recommended' || r.compliance_status === 'Recommended'
    ).length;
    
    const total = reports.length;
    const compliantReports = required; // Mock: assume all required are compliant
    const complianceRate = total > 0 ? ((compliantReports / total) * 100).toFixed(1) : 0;
    
    // Upcoming deadlines (mock - next 30 days)
    const upcomingDeadlines = Math.floor(required * 0.2);
    
    // Overdue compliance (mock)
    const overdueCompliance = Math.floor(required * 0.05);
    
    return {
      required,
      optional,
      recommended,
      complianceRate,
      upcomingDeadlines,
      overdueCompliance
    };
  };

  const automation = calculateAutomationMetrics();
  const performance = calculatePerformanceMetrics();
  const risk = calculateRiskMetrics();
  const compliance = calculateComplianceMetrics();

  const kpiSections = [
    {
      id: 'automation',
      title: 'Automation Status',
      icon: Zap,
      color: '#3b82f6',
      metrics: [
        {
          label: 'Automation Rate',
          value: `${automation.automationRate}%`,
          trend: '+12.3%',
          trendUp: true,
          icon: Percent,
          description: `${automation.automated} of ${reports.length} automated`
        },
        {
          label: 'Automated Reports',
          value: automation.automated,
          trend: '+15',
          trendUp: true,
          icon: Zap,
          description: 'Fully automated processes'
        },
        {
          label: 'Manual Reports',
          value: automation.manual,
          trend: '-8',
          trendUp: true,
          icon: Clock,
          description: 'Require manual intervention'
        },
        {
          label: 'Time Saved',
          value: `${automation.timeSavedHours}h`,
          trend: '+23%',
          trendUp: true,
          icon: TrendingUp,
          description: 'Monthly time savings'
        }
      ]
    },
    {
      id: 'performance',
      title: 'Performance Indicators',
      icon: Activity,
      color: '#10b981',
      metrics: [
        {
          label: 'Completion Rate',
          value: `${performance.completionRate}%`,
          trend: '+5.2%',
          trendUp: true,
          icon: CheckCircle,
          description: `${performance.completed} completed reports`
        },
        {
          label: 'On-Time Rate',
          value: `${performance.onTimeRate}%`,
          trend: '+3.1%',
          trendUp: true,
          icon: Calendar,
          description: 'Submitted by deadline'
        },
        {
          label: 'Quality Score',
          value: performance.qualityScore,
          trend: '+2.4%',
          trendUp: true,
          icon: Award,
          description: 'Average quality rating'
        },
        {
          label: 'Avg Processing',
          value: `${performance.avgProcessingTime}h`,
          trend: '-1.2h',
          trendUp: true,
          icon: Clock,
          description: 'Average completion time'
        }
      ]
    },
    {
      id: 'risk',
      title: 'Risk Metrics',
      icon: Shield,
      color: '#ef4444',
      metrics: [
        {
          label: 'Risk Score',
          value: risk.riskScore,
          trend: '-5.3',
          trendUp: true,
          icon: Target,
          description: 'Lower is better (0-100)',
          isRisk: true
        },
        {
          label: 'Critical Risk',
          value: risk.critical,
          trend: '-2',
          trendUp: true,
          icon: AlertTriangle,
          description: 'Immediate attention required',
          riskLevel: 'critical'
        },
        {
          label: 'High Risk',
          value: risk.high,
          trend: '+1',
          trendUp: false,
          icon: AlertCircle,
          description: 'Requires monitoring',
          riskLevel: 'high'
        },
        {
          label: 'Low Risk',
          value: risk.low,
          trend: '+12',
          trendUp: true,
          icon: CheckCircle,
          description: 'Well managed',
          riskLevel: 'low'
        }
      ]
    },
    {
      id: 'compliance',
      title: 'Compliance Metrics',
      icon: CheckCircle,
      color: '#8b5cf6',
      metrics: [
        {
          label: 'Compliance Rate',
          value: `${compliance.complianceRate}%`,
          trend: '+4.1%',
          trendUp: true,
          icon: Percent,
          description: 'Regulatory compliance'
        },
        {
          label: 'Required Reports',
          value: compliance.required,
          trend: '+3',
          trendUp: true,
          icon: AlertTriangle,
          description: 'Mandatory compliance'
        },
        {
          label: 'Upcoming Deadlines',
          value: compliance.upcomingDeadlines,
          trend: 'Next 30 days',
          trendUp: null,
          icon: Calendar,
          description: 'Reports due soon'
        },
        {
          label: 'Overdue',
          value: compliance.overdueCompliance,
          trend: '-1',
          trendUp: true,
          icon: AlertCircle,
          description: 'Past deadline',
          isWarning: true
        }
      ]
    }
  ];

  return (
    <div className="kpi-panel-container">
      <div className="kpi-panel-header">
        <div>
          <h2 className="kpi-panel-title">
            <BarChart3 size={16} />
            Advanced KPI Dashboard
          </h2>
          <p className="kpi-panel-subtitle">
            Real-time performance metrics and analytics
          </p>
        </div>
      </div>

      <div className="kpi-sections-grid">
        {kpiSections.map(section => {
          const SectionIcon = section.icon;
          return (
            <div key={section.id} className="kpi-section">
              <div className="kpi-section-header" style={{ borderLeftColor: section.color }}>
                <SectionIcon size={14} style={{ color: section.color }} />
                <h3>{section.title}</h3>
              </div>

              <div className="kpi-metrics-grid">
                {section.metrics.map((metric, idx) => {
                  const MetricIcon = metric.icon;
                  const trendColor = metric.trendUp === true ? '#10b981' : 
                                    metric.trendUp === false ? '#ef4444' : '#64748b';
                  
                  return (
                    <div 
                      key={idx} 
                      className={`kpi-metric-card ${metric.isWarning ? 'warning' : ''} ${metric.riskLevel || ''}`}
                      onClick={() => setSelectedMetric(metric)}
                    >
                      <div className="kpi-metric-icon">
                        <MetricIcon size={13} />
                      </div>
                      <div className="kpi-metric-content">
                        <div className="kpi-metric-label">{metric.label}</div>
                        <div className="kpi-metric-value">{metric.value}</div>
                        <div className="kpi-metric-description">{metric.description}</div>
                        {metric.trend && (
                          <div className="kpi-metric-trend" style={{ color: trendColor }}>
                            {metric.trendUp === true && <TrendingUp size={10} />}
                            {metric.trendUp === false && <TrendingDown size={10} />}
                            <span>{metric.trend}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Bar */}
      <div className="kpi-summary-bar">
        <div className="kpi-summary-item">
          <span className="kpi-summary-label">Overall Health Score</span>
          <span className="kpi-summary-value">85.3%</span>
          <span className="kpi-summary-trend positive">↑ 3.2%</span>
        </div>
        <div className="kpi-summary-item">
          <span className="kpi-summary-label">Automation Coverage</span>
          <span className="kpi-summary-value">{automation.automationRate}%</span>
          <span className="kpi-summary-trend positive">↑ 12.3%</span>
        </div>
        <div className="kpi-summary-item">
          <span className="kpi-summary-label">Risk Level</span>
          <span className="kpi-summary-value">{risk.riskScore}</span>
          <span className="kpi-summary-trend positive">↓ 5.3</span>
        </div>
        <div className="kpi-summary-item">
          <span className="kpi-summary-label">Compliance</span>
          <span className="kpi-summary-value">{compliance.complianceRate}%</span>
          <span className="kpi-summary-trend positive">↑ 4.1%</span>
        </div>
      </div>
    </div>
  );
}

export default KPIPanel;
