import { useState } from 'react';
import { 
  Activity, Users, Bed, Heart, Clock, TrendingUp, TrendingDown,
  Phone, Signal, DollarSign, Wifi, UserPlus, PhoneCall,
  Building2, Shield, PieChart, AlertCircle, TrendingUp as Growth,
  Package, CheckCircle, XCircle, AlertTriangle, BarChart3
} from 'lucide-react';
import './DomainDashboard.css';

function DomainDashboard({ domain = 'Healthcare', reports }) {
  const [selectedMetric, setSelectedMetric] = useState(null);

  // Healthcare Metrics
  const healthcareMetrics = {
    census: {
      totalBeds: 450,
      occupiedBeds: 382,
      availableBeds: 68,
      occupancyRate: 84.9,
      trend: '+2.3%'
    },
    patients: {
      inpatients: 382,
      outpatients: 156,
      icu: 45,
      emergency: 23,
      avgStayDays: 4.2
    },
    departments: [
      { name: 'Emergency', beds: 50, occupied: 42, occupancy: 84, waitTime: 18 },
      { name: 'ICU', beds: 60, occupied: 45, occupancy: 75, waitTime: 0 },
      { name: 'General Ward', beds: 200, occupied: 175, occupancy: 87.5, waitTime: 12 },
      { name: 'Pediatrics', beds: 80, occupied: 68, occupancy: 85, waitTime: 15 },
      { name: 'Maternity', beds: 60, occupied: 52, occupancy: 86.7, waitTime: 8 }
    ],
    quality: {
      readmissionRate: 8.2,
      mortalityRate: 1.8,
      infectionRate: 2.1,
      patientSatisfaction: 4.3
    }
  };

  // Telecom Metrics
  const telecomMetrics = {
    arpu: {
      overall: 285,
      prepaid: 165,
      postpaid: 485,
      trend: '+5.2%',
      mom: '+12.50'
    },
    subscribers: {
      total: 12500000,
      active: 11875000,
      prepaid: 8750000,
      postpaid: 3125000,
      churnRate: 2.8
    },
    network: {
      coverage: 94.5,
      dataUsageGB: 8.5,
      voiceMinutes: 450,
      smsCount: 85,
      networkUptime: 99.7
    },
    revenue: [
      { service: 'Voice', revenue: 1250, percentage: 35, growth: 2.1 },
      { service: 'Data', revenue: 1850, percentage: 52, growth: 12.5 },
      { service: 'SMS', revenue: 180, percentage: 5, growth: -5.2 },
      { service: 'VAS', revenue: 285, percentage: 8, growth: 8.7 }
    ]
  };

  // Banking Metrics
  const bankingMetrics = {
    capitalAdequacy: {
      cet1Ratio: 12.5,
      tier1Ratio: 14.2,
      totalCapitalRatio: 16.8,
      leverageRatio: 5.2,
      regulatory: { cet1: 8.0, tier1: 9.5, total: 12.5 }
    },
    assets: {
      totalAssets: 850000,
      loans: 595000,
      investments: 127500,
      cash: 85000,
      npl: 2.8
    },
    performance: {
      roe: 14.5,
      roa: 1.2,
      nim: 3.4,
      costToIncome: 48.5,
      creditGrowth: 12.3
    },
    riskMetrics: [
      { category: 'Credit Risk', score: 85, status: 'good', limit: 100 },
      { category: 'Market Risk', score: 72, status: 'medium', limit: 80 },
      { category: 'Operational Risk', score: 91, status: 'good', limit: 100 },
      { category: 'Liquidity Risk', score: 88, status: 'good', limit: 95 }
    ]
  };

  // Manufacturing Metrics
  const manufacturingMetrics = {
    quality: {
      defectRate: 0.85,
      firstPassYield: 96.5,
      scrapRate: 1.2,
      reworkRate: 2.3,
      customerReturns: 0.4
    },
    production: {
      totalUnits: 125000,
      targetUnits: 130000,
      efficiency: 96.2,
      oee: 82.5,
      downtime: 3.2
    },
    defects: [
      { type: 'Dimensional', count: 245, percentage: 28.8, severity: 'medium' },
      { type: 'Surface Finish', count: 198, percentage: 23.3, severity: 'low' },
      { type: 'Assembly', count: 156, percentage: 18.4, severity: 'high' },
      { type: 'Material', count: 134, percentage: 15.8, severity: 'high' },
      { type: 'Others', count: 117, percentage: 13.7, severity: 'low' }
    ],
    processes: [
      { name: 'Stamping', defectRate: 0.92, yield: 95.8, status: 'good' },
      { name: 'Welding', defectRate: 1.15, yield: 94.2, status: 'medium' },
      { name: 'Painting', defectRate: 0.68, yield: 97.5, status: 'good' },
      { name: 'Assembly', defectRate: 1.42, yield: 93.1, status: 'medium' },
      { name: 'Testing', defectRate: 0.45, yield: 98.2, status: 'good' }
    ]
  };

  const renderHealthcareDashboard = () => (
    <div className="domain-dashboard">
      {/* Census Overview */}
      <div className="domain-section">
        <h3 className="domain-section-title">
          <Bed size={14} />
          Census Tracking
        </h3>
        <div className="metric-cards-grid">
          <div className="metric-card primary">
            <div className="metric-icon">
              <Activity size={14} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Occupancy Rate</div>
              <div className="metric-value">{healthcareMetrics.census.occupancyRate}%</div>
              <div className="metric-trend positive">{healthcareMetrics.census.trend}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <Bed size={14} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Total Beds</div>
              <div className="metric-value">{healthcareMetrics.census.totalBeds}</div>
              <div className="metric-description">Capacity</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <Users size={14} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Occupied</div>
              <div className="metric-value">{healthcareMetrics.census.occupiedBeds}</div>
              <div className="metric-description">Patients</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <CheckCircle size={14} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Available</div>
              <div className="metric-value">{healthcareMetrics.census.availableBeds}</div>
              <div className="metric-description">Ready</div>
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      <div className="domain-section">
        <h3 className="domain-section-title">
          <Building2 size={14} />
          Department Census
        </h3>
        <div className="department-list">
          {healthcareMetrics.departments.map((dept, idx) => (
            <div key={idx} className="department-item">
              <div className="department-header">
                <span className="department-name">{dept.name}</span>
                <span className="department-occupancy" style={{
                  color: dept.occupancy > 90 ? '#ef4444' : dept.occupancy > 80 ? '#f59e0b' : '#10b981'
                }}>
                  {dept.occupancy}%
                </span>
              </div>
              <div className="department-stats">
                <div className="stat-item">
                  <span className="stat-label">Beds:</span>
                  <span className="stat-value">{dept.occupied}/{dept.beds}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Wait:</span>
                  <span className="stat-value">{dept.waitTime}min</span>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ 
                  width: `${dept.occupancy}%`,
                  background: dept.occupancy > 90 ? '#ef4444' : dept.occupancy > 80 ? '#f59e0b' : '#10b981'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTelecomDashboard = () => (
    <div className="domain-dashboard">
      {/* ARPU Metrics */}
      <div className="domain-section">
        <h3 className="domain-section-title">
          <DollarSign size={14} />
          ARPU Metrics
        </h3>
        <div className="metric-cards-grid">
          <div className="metric-card primary">
            <div className="metric-icon">
              <TrendingUp size={14} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Overall ARPU</div>
              <div className="metric-value">₹{telecomMetrics.arpu.overall}</div>
              <div className="metric-trend positive">{telecomMetrics.arpu.trend}</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <Phone size={14} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Prepaid ARPU</div>
              <div className="metric-value">₹{telecomMetrics.arpu.prepaid}</div>
              <div className="metric-description">Per user</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <PhoneCall size={14} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Postpaid ARPU</div>
              <div className="metric-value">₹{telecomMetrics.arpu.postpaid}</div>
              <div className="metric-description">Per user</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <Growth size={14} />
            </div>
            <div className="metric-content">
              <div className="metric-label">MoM Growth</div>
              <div className="metric-value">₹{telecomMetrics.arpu.mom}</div>
              <div className="metric-description">Increase</div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="domain-section">
        <h3 className="domain-section-title">
          <BarChart3 size={14} />
          Revenue by Service
        </h3>
        <div className="revenue-list">
          {telecomMetrics.revenue.map((item, idx) => (
            <div key={idx} className="revenue-item">
              <div className="revenue-header">
                <span className="revenue-service">{item.service}</span>
                <span className="revenue-amount">₹{item.revenue}M</span>
              </div>
              <div className="revenue-meta">
                <span className="revenue-percentage">{item.percentage}% of total</span>
                <span className={`revenue-growth ${item.growth > 0 ? 'positive' : 'negative'}`}>
                  {item.growth > 0 ? '↑' : '↓'} {Math.abs(item.growth)}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${item.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBankingDashboard = () => (
    <div className="domain-dashboard">
      {/* Capital Adequacy */}
      <div className="domain-section">
        <h3 className="domain-section-title">
          <Shield size={14} />
          Capital Adequacy Ratios
        </h3>
        <div className="capital-grid">
          <div className="capital-card">
            <div className="capital-header">
              <span className="capital-label">CET1 Ratio</span>
              <span className="capital-status good">Above Min</span>
            </div>
            <div className="capital-value">{bankingMetrics.capitalAdequacy.cet1Ratio}%</div>
            <div className="capital-comparison">
              <span>Regulatory: {bankingMetrics.capitalAdequacy.regulatory.cet1}%</span>
              <span className="capital-buffer">+{(bankingMetrics.capitalAdequacy.cet1Ratio - bankingMetrics.capitalAdequacy.regulatory.cet1).toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill good" style={{ 
                width: `${(bankingMetrics.capitalAdequacy.cet1Ratio / 20) * 100}%`
              }} />
              <div className="progress-marker" style={{ left: `${(bankingMetrics.capitalAdequacy.regulatory.cet1 / 20) * 100}%` }} />
            </div>
          </div>
          
          <div className="capital-card">
            <div className="capital-header">
              <span className="capital-label">Tier 1 Ratio</span>
              <span className="capital-status good">Above Min</span>
            </div>
            <div className="capital-value">{bankingMetrics.capitalAdequacy.tier1Ratio}%</div>
            <div className="capital-comparison">
              <span>Regulatory: {bankingMetrics.capitalAdequacy.regulatory.tier1}%</span>
              <span className="capital-buffer">+{(bankingMetrics.capitalAdequacy.tier1Ratio - bankingMetrics.capitalAdequacy.regulatory.tier1).toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill good" style={{ 
                width: `${(bankingMetrics.capitalAdequacy.tier1Ratio / 20) * 100}%`
              }} />
              <div className="progress-marker" style={{ left: `${(bankingMetrics.capitalAdequacy.regulatory.tier1 / 20) * 100}%` }} />
            </div>
          </div>

          <div className="capital-card">
            <div className="capital-header">
              <span className="capital-label">Total Capital Ratio</span>
              <span className="capital-status good">Above Min</span>
            </div>
            <div className="capital-value">{bankingMetrics.capitalAdequacy.totalCapitalRatio}%</div>
            <div className="capital-comparison">
              <span>Regulatory: {bankingMetrics.capitalAdequacy.regulatory.total}%</span>
              <span className="capital-buffer">+{(bankingMetrics.capitalAdequacy.totalCapitalRatio - bankingMetrics.capitalAdequacy.regulatory.total).toFixed(1)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill good" style={{ 
                width: `${(bankingMetrics.capitalAdequacy.totalCapitalRatio / 20) * 100}%`
              }} />
              <div className="progress-marker" style={{ left: `${(bankingMetrics.capitalAdequacy.regulatory.total / 20) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="domain-section">
        <h3 className="domain-section-title">
          <AlertCircle size={14} />
          Risk Assessment
        </h3>
        <div className="risk-list">
          {bankingMetrics.riskMetrics.map((risk, idx) => (
            <div key={idx} className="risk-item">
              <div className="risk-header">
                <span className="risk-category">{risk.category}</span>
                <span className={`risk-status ${risk.status}`}>{risk.status}</span>
              </div>
              <div className="risk-score">
                <span className="score-value">{risk.score}</span>
                <span className="score-limit">/ {risk.limit}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ 
                  width: `${(risk.score / risk.limit) * 100}%`,
                  background: risk.status === 'good' ? '#10b981' : risk.status === 'medium' ? '#f59e0b' : '#ef4444'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderManufacturingDashboard = () => (
    <div className="domain-dashboard">
      {/* Quality Control */}
      <div className="domain-section">
        <h3 className="domain-section-title">
          <CheckCircle size={14} />
          Quality Control Metrics
        </h3>
        <div className="metric-cards-grid">
          <div className="metric-card primary">
            <div className="metric-icon">
              <AlertTriangle size={14} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Defect Rate</div>
              <div className="metric-value">{manufacturingMetrics.quality.defectRate}%</div>
              <div className="metric-trend positive">↓ 0.15%</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <CheckCircle size={14} />
            </div>
            <div className="metric-content">
              <div className="metric-label">First Pass Yield</div>
              <div className="metric-value">{manufacturingMetrics.quality.firstPassYield}%</div>
              <div className="metric-description">Quality</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <XCircle size={14} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Scrap Rate</div>
              <div className="metric-value">{manufacturingMetrics.quality.scrapRate}%</div>
              <div className="metric-description">Waste</div>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon">
              <Package size={14} />
            </div>
            <div className="metric-content">
              <div className="metric-label">Rework Rate</div>
              <div className="metric-value">{manufacturingMetrics.quality.reworkRate}%</div>
              <div className="metric-description">Repairs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Defect Analysis */}
      <div className="domain-section">
        <h3 className="domain-section-title">
          <BarChart3 size={14} />
          Defect Analysis
        </h3>
        <div className="defect-list">
          {manufacturingMetrics.defects.map((defect, idx) => (
            <div key={idx} className="defect-item">
              <div className="defect-header">
                <span className="defect-type">{defect.type}</span>
                <span className={`defect-severity ${defect.severity}`}>{defect.severity}</span>
              </div>
              <div className="defect-stats">
                <span className="defect-count">{defect.count} units</span>
                <span className="defect-percentage">{defect.percentage}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ 
                  width: `${defect.percentage}%`,
                  background: defect.severity === 'high' ? '#ef4444' : defect.severity === 'medium' ? '#f59e0b' : '#64748b'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="domain-dashboard-container">
      <div className="domain-header">
        <h2 className="domain-title">{domain} Dashboard</h2>
        <p className="domain-subtitle">Industry-specific metrics and KPIs</p>
      </div>

      {domain === 'Healthcare' && renderHealthcareDashboard()}
      {domain === 'Telecom' && renderTelecomDashboard()}
      {domain === 'Banking' && renderBankingDashboard()}
      {domain === 'Manufacturing' && renderManufacturingDashboard()}
    </div>
  );
}

export default DomainDashboard;
