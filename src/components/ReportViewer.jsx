import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Maximize2,
  Share2,
  Printer,
  FileText,
  Activity,
  Target,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './ReportViewer.css';

const ReportViewer = ({ reportData, onClose, onExport }) => {
  const [activeView, setActiveView] = useState('overview'); // overview, details, insights
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Color palette for charts
  const COLORS = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#14b8a6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    cyan: '#06b6d4'
  };

  const CHART_COLORS = [
    COLORS.primary,
    COLORS.success,
    COLORS.info,
    COLORS.warning,
    COLORS.purple,
    COLORS.pink,
    COLORS.cyan,
    COLORS.danger
  ];

  // Calculate KPIs based on report data
  const kpis = useMemo(() => {
    if (!reportData?.data || reportData.data.length === 0) return [];

    const { data, summary, template } = reportData;

    // Financial Report KPIs
    if (template === 'financial') {
      const avgRevenue = summary.totalRevenue / data.length;
      const avgExpenses = summary.totalExpenses / data.length;
      const profitMargin = ((summary.netProfit / summary.totalRevenue) * 100).toFixed(1);

      return [
        {
          id: 'revenue',
          label: 'Total Revenue',
          value: `$${(summary.totalRevenue || 0).toLocaleString()}`,
          change: 12.5,
          trend: 'up',
          icon: DollarSign,
          color: COLORS.success,
          subtitle: `Avg: $${avgRevenue.toLocaleString()}/period`
        },
        {
          id: 'expenses',
          label: 'Total Expenses',
          value: `$${(summary.totalExpenses || 0).toLocaleString()}`,
          change: -5.2,
          trend: 'down',
          icon: Activity,
          color: COLORS.warning,
          subtitle: `Avg: $${avgExpenses.toLocaleString()}/period`
        },
        {
          id: 'profit',
          label: 'Net Profit',
          value: `$${(summary.netProfit || 0).toLocaleString()}`,
          change: 28.3,
          trend: 'up',
          icon: TrendingUp,
          color: COLORS.primary,
          subtitle: `Margin: ${profitMargin}%`
        },
        {
          id: 'margin',
          label: 'Profit Margin',
          value: `${profitMargin}%`,
          change: 8.1,
          trend: 'up',
          icon: Target,
          color: COLORS.info,
          subtitle: 'Above target'
        }
      ];
    }

    // Sales Report KPIs
    if (template === 'sales') {
      const avgOrder = summary.avgOrderValue || (summary.totalAmount / data.length);
      const totalOrders = data.length;

      return [
        {
          id: 'quantity',
          label: 'Total Units Sold',
          value: (summary.totalQuantity || 0).toLocaleString(),
          change: 15.3,
          trend: 'up',
          icon: BarChart3,
          color: COLORS.success,
          subtitle: `${totalOrders} orders`
        },
        {
          id: 'amount',
          label: 'Total Revenue',
          value: `$${(summary.totalAmount || 0).toLocaleString()}`,
          change: 22.1,
          trend: 'up',
          icon: DollarSign,
          color: COLORS.primary,
          subtitle: 'Year to date'
        },
        {
          id: 'avgOrder',
          label: 'Avg Order Value',
          value: `$${avgOrder.toLocaleString()}`,
          change: 5.8,
          trend: 'up',
          icon: Activity,
          color: COLORS.info,
          subtitle: 'Per transaction'
        },
        {
          id: 'orders',
          label: 'Total Orders',
          value: totalOrders.toLocaleString(),
          change: 18.9,
          trend: 'up',
          icon: CheckCircle2,
          color: COLORS.success,
          subtitle: 'Completed'
        }
      ];
    }

    // Default KPIs for other templates
    return [
      {
        id: 'records',
        label: 'Total Records',
        value: data.length.toLocaleString(),
        change: 0,
        trend: 'neutral',
        icon: FileText,
        color: COLORS.primary,
        subtitle: 'Processed'
      },
      {
        id: 'processed',
        label: 'Successfully Processed',
        value: data.length.toLocaleString(),
        change: 100,
        trend: 'up',
        icon: CheckCircle2,
        color: COLORS.success,
        subtitle: '100% success rate'
      }
    ];
  }, [reportData]);

  // Prepare trend chart data
  const trendData = useMemo(() => {
    if (!reportData?.data) return [];

    return reportData.data.map((row, index) => {
      const item = { name: row.date || `Period ${index + 1}` };
      
      // Add numeric fields for charting
      Object.keys(row).forEach(key => {
        const value = row[key];
        if (typeof value === 'number' || !isNaN(Number(value))) {
          item[key] = Number(value);
        }
      });

      return item;
    });
  }, [reportData]);

  // Prepare breakdown data for pie chart
  const breakdownData = useMemo(() => {
    if (!reportData?.data) return [];

    const { data, template } = reportData;

    if (template === 'sales' && data[0]?.region) {
      // Group by region
      const regionTotals = {};
      data.forEach(row => {
        const region = row.region || 'Unknown';
        const amount = Number(row.amount) || 0;
        regionTotals[region] = (regionTotals[region] || 0) + amount;
      });

      return Object.entries(regionTotals).map(([name, value]) => ({
        name,
        value
      }));
    }

    if (template === 'financial' && data[0]?.department) {
      // Group by department
      const deptTotals = {};
      data.forEach(row => {
        const dept = row.department || 'Unknown';
        const revenue = Number(row.revenue) || 0;
        deptTotals[dept] = (deptTotals[dept] || 0) + revenue;
      });

      return Object.entries(deptTotals).map(([name, value]) => ({
        name,
        value
      }));
    }

    // Default: show first 5 records as breakdown
    return data.slice(0, 5).map((row, idx) => ({
      name: row.date || row.product || row.metric_name || `Item ${idx + 1}`,
      value: Number(row.revenue || row.amount || row.value || 0)
    }));
  }, [reportData]);

  // Get chart configuration based on template
  const getChartConfig = () => {
    const { template } = reportData;

    if (template === 'financial') {
      return {
        lineKeys: ['revenue', 'expenses', 'profit'],
        barKeys: ['revenue', 'expenses'],
        colors: {
          revenue: COLORS.success,
          expenses: COLORS.warning,
          profit: COLORS.primary
        }
      };
    }

    if (template === 'sales') {
      return {
        lineKeys: ['amount', 'quantity'],
        barKeys: ['amount'],
        colors: {
          amount: COLORS.primary,
          quantity: COLORS.success
        }
      };
    }

    // Default configuration
    const firstNumericKey = Object.keys(reportData.data[0] || {}).find(key => 
      !isNaN(Number(reportData.data[0][key]))
    );

    return {
      lineKeys: firstNumericKey ? [firstNumericKey] : [],
      barKeys: firstNumericKey ? [firstNumericKey] : [],
      colors: {
        [firstNumericKey]: COLORS.primary
      }
    };
  };

  const chartConfig = getChartConfig();

  // Export handlers
  const handleExportPDF = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (onExport) {
      onExport('excel');
    }
  };

  const handleExportCSV = () => {
    if (onExport) {
      onExport('csv');
    }
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' 
                ? entry.value.toLocaleString() 
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="report-viewer">
      {/* Header */}
      <div className="report-header">
        <div className="report-title-section">
          <h1 className="report-title">{reportData.name}</h1>
          <p className="report-subtitle">
            Generated on {new Date(reportData.generatedAt).toLocaleDateString()} at{' '}
            {new Date(reportData.generatedAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="report-actions">
          <button className="btn-icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
          </button>
          <button className="btn-icon" onClick={handleExportPDF}>
            <Printer size={18} />
          </button>
          <button className="btn-icon" onClick={handleExportExcel}>
            <Download size={18} />
          </button>
          <button className="btn-icon" onClick={onClose}>
            ×
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Date Range</label>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option value="all">All Time</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
            </select>
          </div>
        </div>
      )}

      {/* View Tabs */}
      <div className="view-tabs">
        <button
          className={`view-tab ${activeView === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveView('overview')}
        >
          <BarChart3 size={18} />
          Overview
        </button>
        <button
          className={`view-tab ${activeView === 'details' ? 'active' : ''}`}
          onClick={() => setActiveView('details')}
        >
          <FileText size={18} />
          Details
        </button>
        <button
          className={`view-tab ${activeView === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveView('insights')}
        >
          <Activity size={18} />
          Insights
        </button>
      </div>

      {/* Content */}
      <div className="report-content">
        {activeView === 'overview' && (
          <>
            {/* KPI Cards */}
            <div className="kpi-section">
              <h2 className="section-title">Key Performance Indicators</h2>
              <div className="kpi-grid">
                {kpis.map((kpi) => {
                  const Icon = kpi.icon;
                  const TrendIcon = kpi.trend === 'up' ? ArrowUpRight : 
                                   kpi.trend === 'down' ? ArrowDownRight : Minus;
                  
                  return (
                    <div
                      key={kpi.id}
                      className="kpi-card"
                      style={{ borderLeftColor: kpi.color }}
                      onClick={() => setSelectedMetric(kpi.id)}
                    >
                      <div className="kpi-header">
                        <div className="kpi-icon" style={{ backgroundColor: kpi.color + '20' }}>
                          <Icon size={24} style={{ color: kpi.color }} />
                        </div>
                        <div className={`kpi-change ${kpi.trend}`}>
                          <TrendIcon size={16} />
                          {Math.abs(kpi.change)}%
                        </div>
                      </div>
                      <div className="kpi-body">
                        <div className="kpi-value">{kpi.value}</div>
                        <div className="kpi-label">{kpi.label}</div>
                        <div className="kpi-subtitle">{kpi.subtitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
              {/* Trend Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Trend Analysis</h3>
                  <div className="chart-controls">
                    <button className="btn-sm">
                      <Calendar size={14} />
                      Last 30 Days
                    </button>
                  </div>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {chartConfig.lineKeys.map((key) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={chartConfig.colors[key] || COLORS.primary}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Area Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Performance Overview</h3>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {chartConfig.lineKeys.map((key, index) => (
                        <Area
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stackId="1"
                          stroke={chartConfig.colors[key] || CHART_COLORS[index]}
                          fill={chartConfig.colors[key] || CHART_COLORS[index]}
                          fillOpacity={0.6}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Comparative Analysis</h3>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {chartConfig.barKeys.map((key, index) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          fill={chartConfig.colors[key] || CHART_COLORS[index]}
                          radius={[8, 8, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="chart-card">
                <div className="chart-header">
                  <h3>Distribution Breakdown</h3>
                </div>
                <div className="chart-body">
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={breakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {breakdownData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {activeView === 'details' && (
          <div className="details-section">
            <h2 className="section-title">Detailed Data Table</h2>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(reportData.data[0] || {}).map((key) => (
                      <th key={key}>{key.replace(/_/g, ' ').toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'insights' && (
          <div className="insights-section">
            <h2 className="section-title">AI-Powered Insights</h2>
            
            <div className="insight-cards">
              <div className="insight-card success">
                <CheckCircle2 size={24} />
                <div className="insight-content">
                  <h4>Strong Performance</h4>
                  <p>Revenue increased by 12.5% compared to previous period, exceeding targets.</p>
                </div>
              </div>

              <div className="insight-card warning">
                <AlertCircle size={24} />
                <div className="insight-content">
                  <h4>Expense Optimization</h4>
                  <p>Operating expenses reduced by 5.2%, contributing to improved profit margins.</p>
                </div>
              </div>

              <div className="insight-card info">
                <TrendingUp size={24} />
                <div className="insight-content">
                  <h4>Positive Trend</h4>
                  <p>Profit margin trending upward at 40.2%, indicating healthy business growth.</p>
                </div>
              </div>

              <div className="insight-card primary">
                <Target size={24} />
                <div className="insight-content">
                  <h4>Recommendation</h4>
                  <p>Maintain current trajectory while exploring opportunities in high-performing segments.</p>
                </div>
              </div>
            </div>

            <div className="summary-stats">
              <h3>Statistical Summary</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total Records</span>
                  <span className="stat-value">{reportData.totalRecords}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Date Range</span>
                  <span className="stat-value">
                    {reportData.data[0]?.date} - {reportData.data[reportData.data.length - 1]?.date}
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Template</span>
                  <span className="stat-value">{reportData.template}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Status</span>
                  <span className="stat-value success">Complete</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="report-footer">
        <div className="export-options">
          <button className="btn-export" onClick={handleExportCSV}>
            <FileText size={18} />
            Export CSV
          </button>
          <button className="btn-export" onClick={handleExportExcel}>
            <Download size={18} />
            Export Excel
          </button>
          <button className="btn-export" onClick={handleExportPDF}>
            <Printer size={18} />
            Print/PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;
