import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'https://finance-backend-so86.onrender.com/api/v1'
const api = axios.create({ baseURL: API_BASE, timeout: 15000 })
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ─── Mock fallback ────────────────────────────────────────────
const MOCK_INTEGRATIONS = [
  { source_id:1, source_name:'SAP S/4HANA',        source_type:'ERP',      is_active:true,  last_sync: new Date(Date.now()-7200000).toISOString(),  sync_status:'idle',    last_sync_status:'success', last_sync_count:1240 },
  { source_id:2, source_name:'Salesforce CRM',      source_type:'CRM',      is_active:true,  last_sync: new Date(Date.now()-3600000).toISOString(),  sync_status:'idle',    last_sync_status:'success', last_sync_count:856  },
  { source_id:3, source_name:'Workday HCM',          source_type:'HRMS',     is_active:true,  last_sync: new Date(Date.now()-21600000).toISOString(), sync_status:'idle',    last_sync_status:'success', last_sync_count:423  },
  { source_id:4, source_name:'Oracle EBS',           source_type:'ERP',      is_active:true,  last_sync: new Date(Date.now()-14400000).toISOString(), sync_status:'idle',    last_sync_status:'partial', last_sync_count:678  },
  { source_id:5, source_name:'PostgreSQL Analytics', source_type:'Database', is_active:true,  last_sync: new Date(Date.now()-1800000).toISOString(),  sync_status:'idle',    last_sync_status:'success', last_sync_count:9823 },
  { source_id:6, source_name:'HubSpot CRM',          source_type:'CRM',      is_active:true,  last_sync: new Date(Date.now()-7200000).toISOString(),  sync_status:'idle',    last_sync_status:'success', last_sync_count:312  },
  { source_id:7, source_name:'BambooHR',             source_type:'HRMS',     is_active:true,  last_sync: new Date(Date.now()-43200000).toISOString(), sync_status:'idle',    last_sync_status:'success', last_sync_count:189  },
  { source_id:8, source_name:'Microsoft Dynamics',   source_type:'ERP',      is_active:false, last_sync: null,                                        sync_status:'disabled',last_sync_status:null,      last_sync_count:0    },
]

// ─── useIntegrations ──────────────────────────────────────────
export function useIntegrations() {
  const [integrations, setIntegrations] = useState(MOCK_INTEGRATIONS)
  const [syncStatus,   setSyncStatus]   = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [syncing,      setSyncing]      = useState({})
  const [isLive,       setIsLive]       = useState(false)

  const fetchIntegrations = useCallback(async () => {
    try {
      const [listRes, statusRes] = await Promise.all([
        api.get('/integrations'),
        api.get('/integrations/sync/status'),
      ])
      if (listRes.data?.data?.length > 0) {
        setIntegrations(listRes.data.data)
        setIsLive(true)
      }
      if (statusRes.data?.summary) {
        setSyncStatus(statusRes.data.summary)
      }
    } catch (err) {
      console.warn('⚠️ Integrations API unavailable — using mock data')
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // Trigger manual sync
  const triggerSync = useCallback(async (sourceId) => {
    setSyncing(prev => ({ ...prev, [sourceId]: true }))
    try {
      const res = await api.post(`/integrations/${sourceId}/sync`)
      const result = res.data?.data

      // Update the integration with new sync data
      setIntegrations(prev => prev.map(i =>
        i.source_id === sourceId
          ? { ...i, last_sync: new Date().toISOString(),
              last_sync_status: result?.status || 'success',
              last_sync_count:  result?.records_synced || 0,
              sync_status: 'idle' }
          : i
      ))
      return result
    } catch (err) {
      // Demo sync if API fails
      setIntegrations(prev => prev.map(i =>
        i.source_id === sourceId
          ? { ...i, last_sync: new Date().toISOString(),
              last_sync_status: 'demo',
              last_sync_count: Math.floor(Math.random() * 500) + 100 }
          : i
      ))
    } finally {
      setSyncing(prev => ({ ...prev, [sourceId]: false }))
    }
  }, [])

  // Toggle integration on/off
  const toggleIntegration = useCallback(async (sourceId) => {
    setIntegrations(prev => prev.map(i =>
      i.source_id === sourceId ? { ...i, is_active: !i.is_active } : i
    ))
    try {
      await api.put(`/integrations/${sourceId}/toggle`)
    } catch (_) {}
  }, [])

  // Save credentials
  const saveCredentials = useCallback(async (sourceId, credentials) => {
    try {
      await api.post(`/integrations/${sourceId}/credentials`, credentials)
      return true
    } catch (err) {
      console.error('Failed to save credentials:', err.message)
      return false
    }
  }, [])

  useEffect(() => { fetchIntegrations() }, [fetchIntegrations])

  // Computed summary
  const summary = syncStatus || {
    total:        integrations.length,
    active:       integrations.filter(i => i.is_active).length,
    synced_today: integrations.filter(i => i.last_sync && new Date(i.last_sync) > new Date(Date.now() - 86400000)).length,
    errors:       integrations.filter(i => i.last_sync_status === 'failed').length,
  }

  return {
    integrations, summary, loading, syncing, isLive,
    refresh: fetchIntegrations, triggerSync, toggleIntegration, saveCredentials,
  }
}
