import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Filter,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './Analytics.css';

const Analytics = () => {
  const navigate = useNavigate();
  const [timePeriod, setTimePeriod] = useState('Monthly');
  const [reportFilter, setReportFilter] = useState('All Reports');
  const [isFiltered, setIsFiltered] = useState(false);
  const [filteredDashboards, setFilteredDashboards] = useState([]);

  // KPI Metrics Data
  const kpiMetrics = {
    generations: { value: 145, change: 4.2 },
    total: { value: 145, change: -2.1 },
    avgTime: { value: '2.3s', change: 3.5 },
    successRate: { value: '94.5%', change: 2.1 },
    uploads: { value: 234, change: 28.3 },
    totalFiles: { value: 234, change: 28.3 },
    downloads: { value: 189, change: 15.7 },
    avgSize: { value: '4.2 MB', change: -3.2 },
    view: 'Monthly',
    report: 'All',
    status: 'Active'
  };

  // Dashboard Cards Data
  const dashboards = [
    {
      id: 1,
      title: 'Profit & Loss',
      category: 'FINANCE',
      role: 'CFO',
      metrics: [
        { label: 'REVENUE', value: '5,234,567.89', change: 12.5 },
        { label: 'EXPENSES', value: '3,456,789.12', change: -5.2 },
        { label: 'MARGIN', value: '1,777,778.77', change: 8.3 }
      ]
    },
    {
      id: 2,
      title: 'Balance Sheet',
      category: 'FINANCE',
      role: 'CFO',
      metrics: [
        { label: 'REVENUE', value: '4,468,535.90', change: 5.8 },
        { label: 'EXPENSES', value: '7,972,798.93', change: 13.4 },
        { label: 'MARGIN', value: '8,674,269.26', change: 13.2 }
      ]
    },
    {
      id: 3,
      title: 'Cash Flow',
      category: 'FINANCE',
      role: 'CFO',
      metrics: [
        { label: 'REVENUE', value: '6,114,555.71', change: 3.2 },
        { label: 'EXPENSES', value: '1,091,891.85', change: 18.5 },
        { label: 'MARGIN', value: '7,226,523.72', change: 4.8 }
      ]
    },
    {
      id: 4,
      title: 'Accounts Receivable Aging',
      category: 'FINANCE',
      role: 'CFO',
      metrics: [
        { label: 'CURRENT', value: '4,787,550.69', change: 3.1 },
        { label: 'OVERDUE', value: '1,874,434.16', change: -5.2 },
        { label: 'MARGIN', value: '5,169,534.95', change: 7.8 }
      ]
    },
    {
      id: 5,
      title: 'Accounts Payable Aging',
      category: 'FINANCE',
      role: 'CFO',
      metrics: [
        { label: 'CURRENT', value: '9,867,116.23', change: 4.5 },
        { label: 'OVERDUE', value: '9281968.99', change: -2.1 },
        { label: 'MARGIN', value: '7,163,330.42', change: 6.3 }
      ]
    },
    {
      id: 6,
      title: 'Budget vs Actual',
      category: 'FINANCE',
      role: 'CFO',
      metrics: [
        { label: 'BUDGET', value: '2,402,423.47', change: 1.2 },
        { label: 'ACTUAL', value: '810,349.85', change: 3.8 },
        { label: 'VARIANCE', value: '4,833,085.49', change: -2.5 }
      ]
    },
    {
      id: 7,
      title: 'Expense Breakdown',
      category: 'FINANCE',
      role: 'CFO',
      metrics: [
        { label: 'REVENUE', value: '4,802,211.01', change: 5.1 },
        { label: 'EXPENSES', value: '2,419,215.70', change: 14.1 },
        { label: 'MARGIN', value: '6,561,320.63', change: 12.3 }
      ]
    },
    {
      id: 8,
      title: 'Invoice Register',
      category: 'FINANCE',
      role: 'CFO',
      metrics: [
        { label: 'REVENUE', value: '7,881,608.62', change: -15.6 },
        { label: 'EXPENSES', value: '2,563,978.60', change: 15.2 },
        { label: 'MARGIN', value: '635,496.82', change: 3.8 }
      ]
    },
    {
      id: 9,
      title: 'Sales Pipeline',
      category: 'SALES',
      role: 'VP of Sales / CMO',
      metrics: [
        { label: 'REVENUE', value: '6,114,555.71', change: 3.2 },
        { label: 'EXPENSES', value: '1,091,891.85', change: 18.5 },
        { label: 'MARGIN', value: '7,226,523.72', change: 4.8 }
      ]
    },
    {
      id: 10,
      title: 'Revenue Forecast',
      category: 'SALES',
      role: 'VP of Sales / CMO',
      metrics: [
        { label: 'REVENUE', value: '1,845,878.38', change: 7.8 },
        { label: 'EXPENSES', value: '3,857,585.51', change: -8.1 },
        { label: 'MARGIN', value: '2,099,522.62', change: 4.1 }
      ]
    },
    {
      id: 11,
      title: 'Lead Source Analysis',
      category: 'SALES',
      role: 'VP of Sales / CMO',
      metrics: [
        { label: 'PIPELINE', value: '1,323,181.65', change: 9.1 },
        { label: 'DEALS', value: '4,641,816.11', change: 15.2 },
        { label: 'CONVERSION', value: '3,519,874.62', change: 8.5 }
      ]
    },
    {
      id: 12,
      title: 'Campaign Performance',
      category: 'SALES',
      role: 'VP of Sales / CMO',
      metrics: [
        { label: 'TOTAL SPEND', value: '$2.6M', change: 4.3 },
        { label: 'CAMPAIGN ROI', value: '4.5x', change: 7.3 },
        { label: 'TOTAL REACH', value: '1,914,192', change: 1.5 }
      ]
    },
    {
      id: 13,
      title: 'Customer Acquisition Cost',
      category: 'SALES',
      role: 'VP of Sales / CMO',
      metrics: [
        { label: 'BLENDED CAC', value: '$2.0K', change: 0.3 },
        { label: 'AVG LTV', value: '$44.3K', change: 1.9 },
        { label: 'LTV:CAC', value: '20.7x', change: 0.1 }
      ]
    },
    {
      id: 14,
      title: 'Customer Lifetime Value',
      category: 'SALES',
      role: 'VP of Sales / CMO',
      metrics: [
        { label: 'AVG LTV', value: '$48.0K', change: 1.0 },
        { label: 'TOP SEGMENT LTV', value: '$129.4K', change: 8.0 },
        { label: 'RETENTION RATE', value: '94.2%', change: 5.6 }
      ]
    },
    {
      id: 15,
      title: 'Win/Loss Analysis',
      category: 'SALES',
      role: 'VP of Sales / CMO',
      metrics: [
        { label: 'WIN RATE', value: '30.3%', change: 6.5 },
        { label: 'LOSS RATE', value: '38.4%', change: 6.6 },
        { label: 'NO DECISION', value: '23.3%', change: 4.4 }
      ]
    },
    {
      id: 16,
      title: 'Sales by Region/Product',
      category: 'SALES',
      role: 'VP of Sales / CMO',
      metrics: [
        { label: 'TOTAL SALES', value: '$31.2M', change: 6.9 },
        { label: 'AMERICAS', value: '$14.2M', change: 3.1 },
        { label: 'EMEA', value: '$9.8M', change: 9.3 }
      ]
    },
    {
      id: 17,
      title: 'Inventory Levels',
      category: 'OPERATIONS',
      role: 'COO',
      metrics: [
        { label: 'TOTAL INVENTORY', value: '$29.9M', change: 1.6 },
        { label: 'TURNOVER RATIO', value: '7.8x', change: 5.8 },
        { label: 'STOCK-OUT RISK', value: '5.7%', change: -3.1 }
      ]
    },
    {
      id: 18,
      title: 'Order Fulfillment',
      category: 'OPERATIONS',
      role: 'COO',
      metrics: [
        { label: 'ORDERS/DAY', value: '812', change: 3.5 },
        { label: 'FILL RATE', value: '97.1%', change: 3.1 },
        { label: 'CYCLE TIME', value: '4 days', change: 2.2 }
      ]
    },
    // TAX DOMAIN
    {
      id: 19,
      title: 'Tax Compliance Status',
      category: 'TAX',
      role: 'Tax Director',
      metrics: [
        { label: 'FILINGS', value: '24', change: 0 },
        { label: 'ON TIME', value: '23', change: 4.5 },
        { label: 'OVERDUE', value: '1', change: -50 }
      ]
    },
    {
      id: 20,
      title: 'Tax Liability Analysis',
      category: 'TAX',
      role: 'Tax Director',
      metrics: [
        { label: 'CURRENT LIABILITY', value: '$2.3M', change: 5.2 },
        { label: 'DEFERRED', value: '$1.1M', change: -3.1 },
        { label: 'CREDITS', value: '$450K', change: 12.3 }
      ]
    },
    // AUDIT DOMAIN
    {
      id: 21,
      title: 'Internal Audit Findings',
      category: 'AUDIT',
      role: 'Chief Audit Executive',
      metrics: [
        { label: 'TOTAL FINDINGS', value: '47', change: -15.2 },
        { label: 'HIGH RISK', value: '3', change: -25 },
        { label: 'RESOLVED', value: '42', change: 16.7 }
      ]
    },
    {
      id: 22,
      title: 'Audit Coverage Report',
      category: 'AUDIT',
      role: 'Chief Audit Executive',
      metrics: [
        { label: 'AUDITS COMPLETED', value: '12', change: 20 },
        { label: 'COVERAGE %', value: '85%', change: 8.3 },
        { label: 'PENDING', value: '3', change: -25 }
      ]
    },
    // RISK DOMAIN
    {
      id: 23,
      title: 'Enterprise Risk Dashboard',
      category: 'RISK',
      role: 'Chief Risk Officer',
      metrics: [
        { label: 'RISK SCORE', value: '18.5', change: -5.3 },
        { label: 'CRITICAL RISKS', value: '2', change: -33 },
        { label: 'MITIGATED', value: '15', change: 25 }
      ]
    },
    {
      id: 24,
      title: 'Cyber Risk Assessment',
      category: 'RISK',
      role: 'Chief Risk Officer',
      metrics: [
        { label: 'VULNERABILITIES', value: '23', change: -18.9 },
        { label: 'INCIDENTS', value: '2', change: 0 },
        { label: 'PATCHES', value: '45', change: 32.4 }
      ]
    },
    // TREASURY DOMAIN
    {
      id: 25,
      title: 'Cash Position Dashboard',
      category: 'TREASURY',
      role: 'Treasurer',
      metrics: [
        { label: 'CASH ON HAND', value: '$15.2M', change: 8.7 },
        { label: 'INVESTMENTS', value: '$8.5M', change: 4.2 },
        { label: 'LIQUIDITY RATIO', value: '2.8x', change: 6.1 }
      ]
    },
    {
      id: 26,
      title: 'FX Exposure Report',
      category: 'TREASURY',
      role: 'Treasurer',
      metrics: [
        { label: 'EXPOSURE', value: '$4.2M', change: -12.5 },
        { label: 'HEDGED', value: '78%', change: 5.4 },
        { label: 'UNREALIZED G/L', value: '$125K', change: 45.2 }
      ]
    },
    // HR DOMAIN
    {
      id: 27,
      title: 'Workforce Analytics',
      category: 'HR',
      role: 'CHRO',
      metrics: [
        { label: 'HEADCOUNT', value: '1,248', change: 8.2 },
        { label: 'TURNOVER', value: '12.3%', change: -2.1 },
        { label: 'OPEN ROLES', value: '47', change: 23.7 }
      ]
    },
    {
      id: 28,
      title: 'Compensation & Benefits',
      category: 'HR',
      role: 'CHRO',
      metrics: [
        { label: 'TOTAL COMP', value: '$82.4M', change: 9.5 },
        { label: 'BENEFITS', value: '$15.2M', change: 6.8 },
        { label: 'PER EMPLOYEE', value: '$78.2K', change: 4.3 }
      ]
    },
    // LEGAL DOMAIN
    {
      id: 29,
      title: 'Legal Case Management',
      category: 'LEGAL',
      role: 'General Counsel',
      metrics: [
        { label: 'ACTIVE CASES', value: '23', change: -12.5 },
        { label: 'SETTLED', value: '18', change: 28.6 },
        { label: 'LEGAL SPEND', value: '$1.2M', change: -8.3 }
      ]
    },
    {
      id: 30,
      title: 'Contract Compliance',
      category: 'LEGAL',
      role: 'General Counsel',
      metrics: [
        { label: 'CONTRACTS', value: '342', change: 12.5 },
        { label: 'RENEWALS DUE', value: '28', change: 7.7 },
        { label: 'COMPLIANCE %', value: '96.8%', change: 2.1 }
      ]
    },
    // IT DOMAIN
    {
      id: 31,
      title: 'IT Infrastructure Health',
      category: 'IT',
      role: 'CIO',
      metrics: [
        { label: 'UPTIME', value: '99.97%', change: 0.1 },
        { label: 'INCIDENTS', value: '12', change: -25 },
        { label: 'RESPONSE TIME', value: '15min', change: -16.7 }
      ]
    },
    {
      id: 32,
      title: 'IT Project Portfolio',
      category: 'IT',
      role: 'CIO',
      metrics: [
        { label: 'PROJECTS', value: '18', change: 12.5 },
        { label: 'ON TRACK', value: '15', change: 7.1 },
        { label: 'BUDGET UTIL', value: '87%', change: 4.8 }
      ]
    },
    // SUPPLY CHAIN DOMAIN
    {
      id: 33,
      title: 'Supply Chain Performance',
      category: 'SUPPLY CHAIN',
      role: 'Supply Chain Director',
      metrics: [
        { label: 'ON-TIME DELIVERY', value: '94.2%', change: 3.5 },
        { label: 'LEAD TIME', value: '12 days', change: -8.3 },
        { label: 'SUPPLIER SCORE', value: '87.5', change: 5.2 }
      ]
    },
    {
      id: 34,
      title: 'Procurement Analytics',
      category: 'SUPPLY CHAIN',
      role: 'Supply Chain Director',
      metrics: [
        { label: 'SPEND', value: '$45.2M', change: 6.8 },
        { label: 'SAVINGS', value: '$3.1M', change: 15.2 },
        { label: 'VENDORS', value: '248', change: -5.7 }
      ]
    },
    // ESG DOMAIN
    {
      id: 35,
      title: 'ESG Performance Dashboard',
      category: 'ESG',
      role: 'Sustainability Officer',
      metrics: [
        { label: 'ESG SCORE', value: '78.5', change: 12.3 },
        { label: 'CARBON REDUCED', value: '1,245T', change: 18.7 },
        { label: 'INITIATIVES', value: '24', change: 33.3 }
      ]
    },
    {
      id: 36,
      title: 'Sustainability Metrics',
      category: 'ESG',
      role: 'Sustainability Officer',
      metrics: [
        { label: 'RENEWABLE %', value: '45%', change: 25 },
        { label: 'WASTE DIVERSION', value: '72%', change: 8.3 },
        { label: 'WATER SAVED', value: '2.4M gal', change: 15.8 }
      ]
    }
  ];

  // Category Distribution Data
  const categoryData = [
    { name: 'Finance & Accounting', value: 8, color: '#14b8a6' },
    { name: 'Sales & Marketing', value: 8, color: '#8b5cf6' },
    { name: 'Operations & Supply Chain', value: 6, color: '#f59e0b' },
    { name: 'HR & People', value: 5, color: '#10b981' },
    { name: 'Compliance & Governance', value: 7, color: '#ef4444' },
    { name: 'Customer Success', value: 5, color: '#06b6d4' },
    { name: 'IT & System Health', value: 3, color: '#8b5cf6' },
    { name: 'Product & Innovation', value: 5, color: '#ec4899' },
    { name: 'Sustainability & ESG', value: 5, color: '#84cc16' },
    { name: 'Executive & Strategic', value: 5, color: '#f97316' }
  ];

  // Role Distribution Data
  const roleData = [
    { name: 'CFO', value: 8, color: '#14b8a6' },
    { name: 'VP of Sales', value: 8, color: '#8b5cf6' },
    { name: 'COO', value: 6, color: '#f59e0b' },
    { name: 'HR Manager', value: 5, color: '#10b981' },
    { name: 'Compliance Officer', value: 7, color: '#ef4444' },
    { name: 'Customer Success Manager', value: 5, color: '#06b6d4' },
    { name: 'CIO', value: 3, color: '#8b5cf6' },
    { name: 'Product Manager', value: 5, color: '#ec4899' },
    { name: 'ESG Officer', value: 5, color: '#84cc16' },
    { name: 'CEO', value: 5, color: '#f97316' }
  ];

  // Access Matrix Data
  const accessMatrix = [
    { dashboard: 'Profit & Loss', category: 'FINANCE', CFO: true, VP_Sales: false, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Balance Sheet', category: 'FINANCE', CFO: true, VP_Sales: false, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Cash Flow', category: 'FINANCE', CFO: true, VP_Sales: false, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Accounts Receivable Aging', category: 'FINANCE', CFO: true, VP_Sales: false, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Accounts Payable Aging', category: 'FINANCE', CFO: true, VP_Sales: false, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Budget vs Actual', category: 'FINANCE', CFO: true, VP_Sales: false, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Expense Breakdown', category: 'FINANCE', CFO: true, VP_Sales: false, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Invoice Register', category: 'FINANCE', CFO: true, VP_Sales: false, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Sales Pipeline', category: 'SALES', CFO: false, VP_Sales: true, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Revenue Forecast', category: 'SALES', CFO: false, VP_Sales: true, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Lead Source Analysis', category: 'SALES', CFO: false, VP_Sales: true, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Campaign Performance', category: 'SALES', CFO: false, VP_Sales: true, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Customer Acquisition Cost', category: 'SALES', CFO: false, VP_Sales: true, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Customer Lifetime Value', category: 'SALES', CFO: false, VP_Sales: true, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false },
    { dashboard: 'Win/Loss Analysis', category: 'SALES', CFO: false, VP_Sales: true, COO: false, HR_Manager: false, Compliance: false, CS_Manager: false, CIO: false, Product_Mgr: false }
  ];

  // Filter dashboards based on selected filters
  useEffect(() => {
    let filtered = [...dashboards];

    // Apply category filter
    if (reportFilter !== 'All Reports') {
      const categoryMap = {
        'Finance Reports': 'FINANCE',
        'Tax Reports': 'TAX',
        'Operations Reports': 'OPERATIONS',
        'Audit Reports': 'AUDIT',
        'Risk Reports': 'RISK',
        'Treasury Reports': 'TREASURY',
        'HR Reports': 'HR',
        'Legal Reports': 'LEGAL',
        'IT Reports': 'IT',
        'Sales Reports': 'SALES',
        'Supply Chain Reports': 'SUPPLY CHAIN',
        'ESG Reports': 'ESG'
      };

      const category = categoryMap[reportFilter];
      if (category) {
        filtered = filtered.filter(d => d.category === category);
      }
    }

    // Update filtered dashboards
    setFilteredDashboards(filtered);
  }, [reportFilter, timePeriod, isFiltered]);

  // Get dashboards to display
  const dashboardsToDisplay = isFiltered ? filteredDashboards : dashboards;

  const renderTrendIndicator = (change) => {
    if (change > 0) {
      return (
        <span className="trend-up">
          <TrendingUp size={12} />
          {change}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="trend-down">
          <TrendingDown size={12} />
          {Math.abs(change)}%
        </span>
      );
    }
    return null;
  };

  return (
    <div className="analytics-container">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-left">
          <h1>Report Analytics Intelligence</h1>
          <p>Upload Data & Generation Performance Dashboard</p>
        </div>
        <div className="header-right">
          <button className="btn-back-analytics" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <div className="header-time">
            <Clock size={18} />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filter-group">
          <div className="filter-control">
            <Calendar size={16} />
            <label>TIME PERIOD</label>
            <select 
              value={timePeriod} 
              onChange={(e) => setTimePeriod(e.target.value)}
              className="filter-select"
            >
              <option>Monthly</option>
              <option>Weekly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
            </select>
          </div>

          <div className="filter-control">
            <FileText size={16} />
            <label>REPORT</label>
            <select 
              value={reportFilter} 
              onChange={(e) => setReportFilter(e.target.value)}
              className="filter-select"
            >
              <option>All Reports</option>
              <option>Finance Reports</option>
              <option>Tax Reports</option>
              <option>Operations Reports</option>
              <option>Audit Reports</option>
              <option>Risk Reports</option>
              <option>Treasury Reports</option>
              <option>HR Reports</option>
              <option>Legal Reports</option>
              <option>IT Reports</option>
              <option>Sales Reports</option>
              <option>Supply Chain Reports</option>
              <option>ESG Reports</option>
            </select>
          </div>

          <button 
            className={`btn-filter ${isFiltered ? 'active' : ''}`}
            onClick={() => setIsFiltered(!isFiltered)}
          >
            <Filter size={16} />
            FILTERED
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="kpi-metrics-grid">
        <div className="kpi-section-left">
          <div className="kpi-metric-item">
            <div className="metric-label">GENERATIONS</div>
            <div className="metric-value">{kpiMetrics.generations.value}</div>
            <div className="metric-change">
              {renderTrendIndicator(kpiMetrics.generations.change)}
            </div>
          </div>

          <div className="kpi-metric-item">
            <div className="metric-label">TOTAL</div>
            <div className="metric-value">{kpiMetrics.total.value}</div>
            <div className="metric-change">
              {renderTrendIndicator(kpiMetrics.total.change)}
            </div>
          </div>

          <div className="kpi-metric-item">
            <div className="metric-label">AVG TIME</div>
            <div className="metric-value">{kpiMetrics.avgTime.value}</div>
            <div className="metric-change">
              {renderTrendIndicator(kpiMetrics.avgTime.change)}
            </div>
          </div>

          <div className="kpi-metric-item">
            <div className="metric-label">SUCCESS RATE</div>
            <div className="metric-value">{kpiMetrics.successRate.value}</div>
            <div className="metric-change">
              {renderTrendIndicator(kpiMetrics.successRate.change)}
            </div>
          </div>
        </div>

        <div className="kpi-section-middle">
          <div className="kpi-metric-item">
            <div className="metric-label">UPLOADS</div>
            <div className="metric-value">{kpiMetrics.uploads.value}</div>
            <div className="metric-change">
              {renderTrendIndicator(kpiMetrics.uploads.change)}
            </div>
          </div>

          <div className="kpi-metric-item">
            <div className="metric-label">TOTAL FILES</div>
            <div className="metric-value">{kpiMetrics.totalFiles.value}</div>
            <div className="metric-change">
              {renderTrendIndicator(kpiMetrics.totalFiles.change)}
            </div>
          </div>

          <div className="kpi-metric-item">
            <div className="metric-label">DOWNLOADS</div>
            <div className="metric-value">{kpiMetrics.downloads.value}</div>
            <div className="metric-change">
              {renderTrendIndicator(kpiMetrics.downloads.change)}
            </div>
          </div>

          <div className="kpi-metric-item">
            <div className="metric-label">AVG SIZE</div>
            <div className="metric-value">{kpiMetrics.avgSize.value}</div>
            <div className="metric-change">
              {renderTrendIndicator(kpiMetrics.avgSize.change)}
            </div>
          </div>
        </div>

        <div className="kpi-section-right">
          <div className="kpi-status-item">
            <div className="status-label">VIEW</div>
            <div className="status-value">{kpiMetrics.view}</div>
          </div>

          <div className="kpi-status-item">
            <div className="status-label">REPORT</div>
            <div className="status-value">{kpiMetrics.report}</div>
          </div>

          <div className="kpi-status-item">
            <div className="status-label">STATUS</div>
            <div className="status-value status-active">{kpiMetrics.status}</div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="dashboard-section-header">
        <h2>Dashboards</h2>
        <span className="dashboard-count">
          Showing {dashboardsToDisplay.length} of {dashboards.length} dashboards
        </span>
      </div>
      
      <div className="dashboards-grid">
        {dashboardsToDisplay.length > 0 ? (
          dashboardsToDisplay.map((dashboard) => (
            <div key={dashboard.id} className="dashboard-card">
              <div className="card-header">
                <h3>{dashboard.title}</h3>
                <span className={`category-badge ${dashboard.category.toLowerCase()}`}>
                  {dashboard.category}
                </span>
              </div>
              <div className="card-role">{dashboard.role}</div>
              <div className="card-metrics">
                {dashboard.metrics.map((metric, idx) => (
                  <div key={idx} className="metric-row">
                    <div className="metric-value-large">{metric.value}</div>
                    <div className="metric-details">
                      <span className="metric-label-small">{metric.label}</span>
                      {renderTrendIndicator(metric.change)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No dashboards match the selected filters.</p>
            <button onClick={() => {
              setReportFilter('All Reports');
              setIsFiltered(false);
            }} className="btn-reset-filters">
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Dashboards by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: '#1e293b', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Legend 
                wrapperStyle={{ color: '#94a3b8' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Role Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roleData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={150} 
                stroke="#64748b" 
              />
              <Tooltip 
                contentStyle={{ 
                  background: '#1e293b', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {roleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Access Matrix Table */}
      <div className="access-matrix-section">
        <h2>COMPLETE ROLE × DASHBOARD ACCESS MATRIX</h2>
        <div className="matrix-table-container">
          <table className="matrix-table">
            <thead>
              <tr>
                <th>DASHBOARD</th>
                <th>CATEGORY</th>
                <th>CFO</th>
                <th>VP OF SALES</th>
                <th>COO</th>
                <th>HR MANAGER</th>
                <th>COMPLIANCE OFFICER</th>
                <th>CUSTOMER SUCCESS MANAGER</th>
                <th>CIO</th>
                <th>PRODUCT MANAGER</th>
              </tr>
            </thead>
            <tbody>
              {accessMatrix.map((row, idx) => (
                <tr key={idx}>
                  <td className="dashboard-name">{row.dashboard}</td>
                  <td>
                    <span className={`category-badge ${row.category.toLowerCase()}`}>
                      {row.category}
                    </span>
                  </td>
                  <td className="access-cell">
                    {row.CFO && <CheckCircle size={18} className="check-icon" />}
                  </td>
                  <td className="access-cell">
                    {row.VP_Sales && <CheckCircle size={18} className="check-icon" />}
                  </td>
                  <td className="access-cell">
                    {row.COO && <CheckCircle size={18} className="check-icon" />}
                  </td>
                  <td className="access-cell">
                    {row.HR_Manager && <CheckCircle size={18} className="check-icon" />}
                  </td>
                  <td className="access-cell">
                    {row.Compliance && <CheckCircle size={18} className="check-icon" />}
                  </td>
                  <td className="access-cell">
                    {row.CS_Manager && <CheckCircle size={18} className="check-icon" />}
                  </td>
                  <td className="access-cell">
                    {row.CIO && <CheckCircle size={18} className="check-icon" />}
                  </td>
                  <td className="access-cell">
                    {row.Product_Mgr && <CheckCircle size={18} className="check-icon" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

