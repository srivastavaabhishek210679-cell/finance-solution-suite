import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'https://finance-backend-so86.onrender.com/api/v1'

const api = axios.create({ baseURL: API_BASE, timeout: 10000 })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ─────────────────────────────────────────────────────────────
// MOCK FALLBACK
// ─────────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { notif_id:1, title:'Compliance Deadline',   message:'GST Return Filing due in 3 days',               channel:'in_app', status:'sent',    created_at: new Date(Date.now()-7200000).toISOString(),  read_at: null,    data_json:{priority:'high',category:'Tax'} },
  { notif_id:2, title:'Workflow Completed',    message:'Monthly Finance Report ran successfully',        channel:'in_app', status:'read',    created_at: new Date(Date.now()-18000000).toISOString(), read_at: 'read',  data_json:{workflow_id:1} },
  { notif_id:3, title:'Risk Alert',            message:'Operations domain risk score exceeded threshold',channel:'email',  status:'sent',    created_at: new Date(Date.now()-86400000).toISOString(), read_at: null,    data_json:{domain:'Operations'} },
  { notif_id:4, title:'New Report Available',  message:'Q1 FY2026 Finance Report is ready for review',  channel:'in_app', status:'read',    created_at: new Date(Date.now()-172800000).toISOString(),read_at: 'read',  data_json:{report_id:42} },
  { notif_id:5, title:'Sync Completed',        message:'SAP S/4HANA synced 1240 records successfully',  channel:'in_app', status:'sent',    created_at: new Date(Date.now()-10800000).toISOString(), read_at: null,    data_json:{source:'SAP'} },
]

// ─────────────────────────────────────────────────────────────
// useNotifications
// ─────────────────────────────────────────────────────────────
export function useNotifications({ pollInterval = 30000 } = {}) {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS)
  const [unreadCount,   setUnreadCount]   = useState(3)
  const [loading,       setLoading]       = useState(true)
  const [isLive,        setIsLive]        = useState(false)
  const pollRef = useRef(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications', { params: { limit: 20, tenant_id: 1 } })
      const data = res.data

      if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
        setNotifications(data.data)
        setUnreadCount(data.unreadCount || 0)
        setIsLive(true)
        console.log(`✅ Notifications: ${data.data.length} loaded, ${data.unreadCount} unread`)
      }
    } catch (err) {
      console.warn('⚠️ Notifications API unavailable — using mock data:', err.message)
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Mark one notification as read
  const markAsRead = useCallback(async (id) => {
    // Optimistic update
    setNotifications(prev => prev.map(n =>
      n.notif_id === id ? { ...n, status: 'read', read_at: new Date().toISOString() } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await api.put(`/notifications/${id}/read`)
    } catch (_) {
      // Keep optimistic update even if API fails
    }
  }, [])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({
      ...n, status: 'read', read_at: n.read_at || new Date().toISOString()
    })))
    setUnreadCount(0)

    try {
      await api.put('/notifications/mark-all-read')
    } catch (_) {}
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications()
    if (pollInterval > 0) {
      pollRef.current = setInterval(fetchNotifications, pollInterval)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchNotifications, pollInterval])

  // Compute derived state
  const unread = notifications.filter(n => !n.read_at)
  const read   = notifications.filter(n =>  n.read_at)

  return {
    notifications,
    unread,
    read,
    unreadCount: isLive ? unreadCount : unread.length,
    loading,
    isLive,
    refresh:      fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}
