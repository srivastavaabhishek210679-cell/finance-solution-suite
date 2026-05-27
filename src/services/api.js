export const collaborationAPI = {
  getRooms:    ()           => api.get('/collaboration'),
  createRoom:  (data)       => api.post('/collaboration', data),
  getComments: (roomId)     => api.get('/collaboration/' + roomId + '/comments'),
  addComment:  (roomId, data) => api.post('/collaboration/' + roomId + '/comments', data),
  deleteRoom:  (id)         => api.delete('/collaboration/' + id),
}

export const preferencesAPI = {
  get:  ()     => api.get('/preferences'),
  save: (data) => api.post('/preferences', data),
}

export const schedulesAPI = {
  getAll:   ()        => api.get('/schedules'),
  create:   (data)    => api.post('/schedules', data),
  update:   (id,data) => api.put(`/schedules/${id}`, data),
  toggle:   (id)      => api.patch(`/schedules/${id}/toggle`),
  delete:   (id)      => api.delete(`/schedules/${id}`),
  sendNow:  (id)      => api.post(`/schedules/${id}/send`),
}


import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'https://finance-backend-so86.onrender.com/api/v1'

// â”€â”€ Token storage helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TOKEN_KEY   = 'auth_token'
const REFRESH_KEY = 'auth_refresh_token'
const USER_KEY    = 'auth_user'

export const tokenStorage = {
  getToken:         ()      => localStorage.getItem(TOKEN_KEY),
  getRefreshToken:  ()      => localStorage.getItem(REFRESH_KEY),
  getUser:          ()      => { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null } },

  setTokens: (token, refreshToken, user) => {
    localStorage.setItem(TOKEN_KEY, token)
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
    if (user)         localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  clearAll: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
    // Legacy keys
    localStorage.removeItem('token')
    sessionStorage.removeItem('token')
  },
}

// â”€â”€ Axios instance â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// â”€â”€ Request interceptor â€” attach JWT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
api.interceptors.request.use(
  (config) => {
    // Try new token key first, fall back to legacy key
    const token = tokenStorage.getToken()
      || localStorage.getItem('token')
      || sessionStorage.getItem('token')

    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error),
)

// â”€â”€ Refresh token state â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let isRefreshing   = false
let failedQueue    = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else       prom.resolve(token)
  })
  failedQueue = []
}

// â”€â”€ Response interceptor â€” auto-refresh on 401 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only handle 401 errors that haven't been retried yet
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        }).catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing            = true

      const refreshToken = tokenStorage.getRefreshToken()

      if (!refreshToken) {
        // No refresh token â€” log user out
        isRefreshing = false
        tokenStorage.clearAll()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const response = await axios.post(`${API_BASE}/auth/refresh`, {
          token: refreshToken,
        })

        const { token, refreshToken: newRefreshToken, user } = response.data?.data || response.data

        tokenStorage.setTokens(token, newRefreshToken || refreshToken, user)
        api.defaults.headers.common.Authorization = `Bearer ${token}`

        processQueue(null, token)
        originalRequest.headers.Authorization = `Bearer ${token}`

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        tokenStorage.clearAll()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // Handle other error types
    if (error.response?.status === 429) {
      console.warn('[API] Rate limit exceeded:', error.response.data?.message)
    }

    if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
      console.warn('[API] Network error â€” backend may be sleeping (cold start ~30s)')
    }

    return Promise.reject(error)
  },
)

// â”€â”€ Auth API calls â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const data = res.data?.data

    // Store tokens on successful login
    if (data?.token) {
      tokenStorage.setTokens(data.token, data.refreshToken, data.user)
      // Also set legacy key for backward compat
      localStorage.setItem('token', data.token)
    }

    return data
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData)
    return res.data?.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // Continue logout even if API call fails
    } finally {
      tokenStorage.clearAll()
    }
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me')
    return res.data?.data
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email })
    return res.data
  },

  resetPassword: async (token, newPassword) => {
    const res = await api.post('/auth/reset-password', { token, password: newPassword })
    return res.data
  },
}

// â”€â”€ Reports API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const reportsAPI = {
  getAll:   (params = {}) => api.get('/reports/master', { params }),
  getById:  (id)          => api.get(`/reports/master/${id}`),
  create:   (data)        => api.post('/reports/master', data),
  update:   (id, data)    => api.put(`/reports/master/${id}`, data),
  delete:   (id)          => api.delete(`/reports/master/${id}`),
  export:   (format, params = {}) => api.get('/reports/export', {
    params: { format, ...params },
    responseType: 'blob',
  }),
}

// â”€â”€ Analytics API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard-stats'),
  getSummary:        () => api.get('/analytics/summary'),
}

// â”€â”€ Compliance API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const complianceAPI = {
  getCalendar:  (params = {}) => api.get('/compliance-calendar', { params }),
  getById:      (id)          => api.get(`/compliance-calendar/${id}`),
  update:       (id, data)    => api.put(`/compliance-calendar/${id}`, data),
}

// â”€â”€ Notifications API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const notificationsAPI = {
  getAll:      (params = {}) => api.get('/notifications', { params }),
  markRead:    (id)          => api.put(`/notifications/${id}/read`),
  markAllRead: ()            => api.put('/notifications/mark-all-read'),
}

// â”€â”€ Workflows API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const workflowsAPI = {
  getAll:     (params = {}) => api.get('/workflow-definitions', { params }),
  getSummary: ()            => api.get('/workflow-definitions/summary'),
  getInstances: (params={}) => api.get('/workflow-instances', { params }),
  toggle:     (id)          => api.put(`/workflow-definitions/${id}/toggle`),
}

// â”€â”€ Integrations API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const integrationsAPI = {
  getAll:      ()    => api.get('/integrations'),
  getStatus:   ()    => api.get('/integrations/sync/status'),
  sync:        (id)  => api.post(`/integrations/${id}/sync`),
  toggle:      (id)  => api.put(`/integrations/${id}/toggle`),
  saveCredentials: (id, creds) => api.post(`/integrations/${id}/credentials`, creds),
}

// â”€â”€ Audit Logs API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const auditAPI = {
  getAll:     (params = {}) => api.get('/audit-logs', { params }),
  getSummary: ()            => api.get('/audit-logs/summary'),
}

export default api







