import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'https://finance-backend-so86.onrender.com/api/v1'

const api = axios.create({ baseURL: API_BASE, timeout: 10000 })

// Inject auth token if available
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ─────────────────────────────────────────────────────────────
// MOCK FALLBACK DATA
// ─────────────────────────────────────────────────────────────
const MOCK_WORKFLOWS = [
  { workflow_id:1, name:'Monthly Finance Report Submission', category:'Compliance', status:'active',  trigger_type:'schedule', schedule_cron:'0 9 1 * *', run_count:12, success_count:11, last_run_at:'2026-05-01T09:02:00Z', next_run_at:'2026-06-01T09:00:00Z', successRate:91.7, description:'Auto-submits monthly finance reports to compliance portal' },
  { workflow_id:2, name:'Risk Threshold Alert',              category:'Risk',       status:'active',  trigger_type:'trigger',  schedule_cron:null,         run_count:7,  success_count:7,  last_run_at:'2026-05-14T14:30:00Z', next_run_at:'On trigger',             successRate:100,  description:'Fires alert when risk score exceeds configured threshold' },
  { workflow_id:3, name:'Compliance Deadline Reminder',      category:'Compliance', status:'active',  trigger_type:'schedule', schedule_cron:'0 8 * * 1',  run_count:45, success_count:45, last_run_at:'2026-05-11T08:00:00Z', next_run_at:'2026-05-18T08:00:00Z',   successRate:100,  description:'Weekly reminder emails for upcoming compliance deadlines' },
  { workflow_id:4, name:'New Report Approval Pipeline',      category:'Governance', status:'active',  trigger_type:'trigger',  schedule_cron:null,         run_count:23, success_count:21, last_run_at:'2026-05-16T11:20:00Z', next_run_at:'On trigger',             successRate:91.3, description:'Routes new reports through multi-step approval chain' },
  { workflow_id:5, name:'Weekly HR Analytics Digest',        category:'HR',         status:'paused',  trigger_type:'schedule', schedule_cron:'0 8 * * 1',  run_count:32, success_count:31, last_run_at:'2026-05-11T08:01:00Z', next_run_at:'Paused',                 successRate:96.9, description:'Compiles and emails HR analytics digest to leadership' },
  { workflow_id:6, name:'IT Security Incident Escalation',   category:'IT',         status:'active',  trigger_type:'trigger',  schedule_cron:null,         run_count:3,  success_count:3,  last_run_at:'2026-05-15T03:14:00Z', next_run_at:'On trigger',             successRate:100,  description:'Auto-escalates security incidents based on severity level' },
]

const MOCK_SUMMARY = {
  totalWorkflows:6, activeWorkflows:5, pausedWorkflows:1,
  totalRuns:122, successfulRuns:118, failedRuns:4,
  runsToday:3, overallSuccessRate:96.7,
}

// ─────────────────────────────────────────────────────────────
// useWorkflows — workflow definitions with live/mock fallback
// ─────────────────────────────────────────────────────────────
export function useWorkflows(params = {}) {
  const [workflows, setWorkflows] = useState(MOCK_WORKFLOWS)
  const [summary,   setSummary]   = useState(MOCK_SUMMARY)
  const [loading,   setLoading]   = useState(true)
  const [isLive,    setIsLive]    = useState(false)

  const fetchWorkflows = useCallback(async () => {
    try {
      setLoading(true)
      const [defsRes, sumRes] = await Promise.all([
        api.get('/workflow-definitions',         { params }),
        api.get('/workflow-definitions/summary'),
      ])

      const defs = defsRes.data?.data || defsRes.data
      const sum  = sumRes.data

      if (Array.isArray(defs) && defs.length > 0) {
        setWorkflows(defs)
        setIsLive(true)
        console.log(`✅ Workflows: ${defs.length} real workflows loaded`)
      }
      if (sum && typeof sum === 'object' && sum.totalWorkflows !== undefined) {
        setSummary(sum)
      }
    } catch (err) {
      console.warn('⚠️ Workflows API unavailable — using mock data:', err.message)
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchWorkflows() }, [fetchWorkflows])

  // Toggle workflow status via API
  const toggleWorkflow = useCallback(async (id) => {
    try {
      const res  = await api.post(`/workflow-definitions/${id}/toggle`)
      const updated = res.data
      setWorkflows(prev => prev.map(w =>
        (w.workflow_id === id || w.id === id) ? { ...w, ...updated } : w
      ))
    } catch (_) {
      // Optimistic update if API fails
      setWorkflows(prev => prev.map(w =>
        (w.workflow_id === id || w.id === id)
          ? { ...w, status: w.status === 'active' ? 'paused' : 'active' }
          : w
      ))
    }
  }, [])

  return { workflows, summary, loading, isLive, refresh: fetchWorkflows, toggleWorkflow }
}

// ─────────────────────────────────────────────────────────────
// useWorkflowInstances — run history
// ─────────────────────────────────────────────────────────────
export function useWorkflowInstances(workflowId = null) {
  const [instances, setInstances] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [isLive,    setIsLive]    = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const params = workflowId ? { workflow_id: workflowId, limit: 50 } : { limit: 50 }
        const res    = await api.get('/workflow-instances', { params })
        const data   = res.data?.data || res.data
        if (Array.isArray(data) && data.length > 0) {
          setInstances(data)
          setIsLive(true)
        }
      } catch (err) {
        console.warn('⚠️ Workflow instances API unavailable:', err.message)
        setIsLive(false)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [workflowId])

  return { instances, loading, isLive }
}
