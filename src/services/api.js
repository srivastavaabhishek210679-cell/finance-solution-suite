import axios from 'axios';

// API Base URL - connects to your existing backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper function to transform backend snake_case to frontend camelCase
const transformReport = (report) => {
  if (!report) return null
  
  return {
    id: report.report_id,
    name: report.name,
    description: report.description,
    domain: getDomainName(report.domain_id),
    domainId: report.domain_id,
    frequency: report.frequency,
    complianceStatus: report.compliance_status || report.complianceStatus,
    stakeholders: report.stakeholders || [],
    visualizationType: report.visualization_type || report.visualizationType,
    reportCategory: report.report_category || report.reportCategory,
    isActive: report.is_active !== undefined ? report.is_active : report.isActive,
    createdBy: report.created_by,
    createdAt: report.created_at,
    updatedAt: report.updated_at,
  }
}

// Map domain_id to domain name
const getDomainName = (domainId) => {
  const domainMap = {
    1: 'Finance',
    2: 'HR',
    3: 'Operations',
    4: 'Sales',
    5: 'IT',
    6: 'Healthcare',
    7: 'Telecom',
    8: 'Retail',
    9: 'Manufacturing',
    10: 'Energy',
    11: 'Education',
    12: 'Government',
    13: 'Legal'
  }
  return domainMap[domainId] || 'Other'
}

// Response interceptor - handle errors and extract data
api.interceptors.response.use(
  (response) => {
    // Backend returns { status: "success", data: {...} }
    // Extract the actual data from response.data.data
    if (response.data && response.data.data) {
      const data = response.data.data
      const pagination = response.data.pagination
      
      // Transform arrays of reports
      if (Array.isArray(data)) {
        const transformedData = data.map(transformReport)
        // If pagination exists, return both data and pagination
        if (pagination) {
          return { data: transformedData, pagination }
        }
        return transformedData
      }
      
      // Transform single report
      if (data.report_id) {
        return transformReport(data)
      }
      
      // Return as-is for other data (auth, etc.)
      return data
    }
    // Fallback to response.data for endpoints that don't wrap in data
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication API
export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData) =>
    api.post('/auth/register', userData),
  
  logout: () =>
    api.post('/auth/logout'),
  
  resetPassword: (email) =>
    api.post('/auth/reset-password', { email }),
  
  verifyToken: () =>
    api.get('/auth/verify'),
};

// Reports API
export const reportsAPI = {
  getAll: (params) =>
    api.get('/reports/master', { params }),
  
  getById: (id) =>
    api.get(`/reports/master/${id}`),
  
  create: (data) =>
    api.post('/reports/master', data),
  
  update: (id, data) =>
    api.put(`/reports/master/${id}`, data),
  
  delete: (id) =>
    api.delete(`/reports/master/${id}`),
  
  export: (id, format) =>
    api.get(`/reports/master/${id}/export/${format}`, {
      responseType: 'blob',
    }),
};

// Dashboards API
export const dashboardsAPI = {
  getAll: (params) =>
    api.get('/dashboards', { params }),
  
  getById: (id) =>
    api.get(`/dashboards/${id}`),
  
  create: (data) =>
    api.post('/dashboards', data),
  
  update: (id, data) =>
    api.put(`/dashboards/${id}`, data),
  
  delete: (id) =>
    api.delete(`/dashboards/${id}`),
};

// Users API
export const usersAPI = {
  getAll: (params) =>
    api.get('/users', { params }),
  
  getById: (id) =>
    api.get(`/users/${id}`),
  
  create: (data) =>
    api.post('/users', data),
  
  update: (id, data) =>
    api.put(`/users/${id}`, data),
  
  delete: (id) =>
    api.delete(`/users/${id}`),
};

// Tenants API
export const tenantsAPI = {
  getAll: (params) =>
    api.get('/tenants', { params }),
  
  getById: (id) =>
    api.get(`/tenants/${id}`),
  
  create: (data) =>
    api.post('/tenants', data),
  
  update: (id, data) =>
    api.put(`/tenants/${id}`, data),
  
  delete: (id) =>
    api.delete(`/tenants/${id}`),
};

// Roles API
export const rolesAPI = {
  getAll: (params) =>
    api.get('/roles', { params }),
  
  getById: (id) =>
    api.get(`/roles/${id}`),
  
  create: (data) =>
    api.post('/roles', data),
  
  update: (id, data) =>
    api.put(`/roles/${id}`, data),
  
  delete: (id) =>
    api.delete(`/roles/${id}`),
};

// Activity Logs API
export const activityLogsAPI = {
  getAll: (params) =>
    api.get('/activity-logs', { params }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) =>
    api.get('/notifications', { params }),
  
  markAsRead: (id) =>
    api.put(`/notifications/${id}`, { status: 'read' }),
  
  deleteNotification: (id) =>
    api.delete(`/notifications/${id}`),
};

// Metric Definitions API
export const metricsAPI = {
  getAll: (params) =>
    api.get('/metric-definitions', { params }),
  
  getById: (id) =>
    api.get(`/metric-definitions/${id}`),
};

// Data Sources API
export const dataSourcesAPI = {
  getAll: (params) =>
    api.get('/data-sources', { params }),
  
  getById: (id) =>
    api.get(`/data-sources/${id}`),
};

// AI Insights API
export const aiInsightsAPI = {
  getAll: (params) =>
    api.get('/ai-insights', { params }),
  
  getById: (id) =>
    api.get(`/ai-insights/${id}`),
};

// Compliance API
export const complianceAPI = {
  getCalendar: (params) =>
    api.get('/compliance-calendar', { params }),
  
  getSubmissions: (params) =>
    api.get('/compliance-submissions', { params }),
  
  getDocuments: (params) =>
    api.get('/compliance-documents', { params }),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () =>
    api.get('/analytics/dashboard-stats'),
  
  getReportMetrics: (params) =>
    api.get('/analytics/report-metrics', { params }),
  
  getComplianceStatus: () =>
    api.get('/analytics/compliance-status'),
};


// KPI Scorecards API
export const kpiAPI = {
  getAll: (params) =>
    api.get('/kpi-scorecards', { params }),

  getById: (id) =>
    api.get(`/kpi-scorecards/${id}`),
};

// Report Run History API
export const reportRunAPI = {
  getAll: (params) =>
    api.get('/report-run-history', { params }),

  getByReportId: (reportId) =>
    api.get(`/report-run-history/${reportId}`),
};

// Audit Logs API
export const auditLogsAPI = {
  getAll: (params) =>
    api.get('/audit-logs', { params }),
};

export default api;
