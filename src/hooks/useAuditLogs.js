import { useState, useEffect, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'https://finance-backend-so86.onrender.com/api/v1'

// Mock fallback data
const MOCK_LOGS = [
  { log_id: 1, action: 'login',         table_name: 'users',          resource_id: '2', event_details: { method: 'password' },             ip_address: '192.168.1.10', created_at: new Date(Date.now() - 3600000).toISOString(),  user_email: 'admin@financesuite.com' },
  { log_id: 2, action: 'report_viewed', table_name: 'reports_master', resource_id: '42', event_details: { report: 'Cash Flow Report' },      ip_address: '192.168.1.10', created_at: new Date(Date.now() - 7200000).toISOString(),  user_email: 'admin@financesuite.com' },
  { log_id: 3, action: 'report_export', table_name: 'reports_master', resource_id: '42', event_details: { format: 'pdf', domain: 'Finance' }, ip_address: '192.168.1.11', created_at: new Date(Date.now() - 10800000).toISOString(), user_email: 'alice@financesuite.com' },
  { log_id: 4, action: 'workflow_run',  table_name: 'workflow_definitions', resource_id: '1', event_details: { status: 'completed' },         ip_address: '10.0.0.1',     created_at: new Date(Date.now() - 14400000).toISOString(), user_email: 'system' },
  { log_id: 5, action: 'login',         table_name: 'users',          resource_id: '3', event_details: { method: 'password' },               ip_address: '192.168.1.15', created_at: new Date(Date.now() - 18000000).toISOString(), user_email: 'alice@financesuite.com' },
  { log_id: 6, action: 'report_create', table_name: 'reports_master', resource_id: '461', event_details: { name: 'ESG Quarterly Summary' },   ip_address: '192.168.1.10', created_at: new Date(Date.now() - 86400000).toISOString(),  user_email: 'admin@financesuite.com' },
  { log_id: 7, action: 'user_update',   table_name: 'users',          resource_id: '3', event_details: { field: 'email' },                   ip_address: '192.168.1.10', created_at: new Date(Date.now() - 90000000).toISOString(),  user_email: 'admin@financesuite.com' },
  { log_id: 8, action: 'compliance_check', table_name: 'compliance_calendar', resource_id: '2', event_details: { status: 'passed' },          ip_address: '10.0.0.1',     created_at: new Date(Date.now() - 172800000).toISOString(), user_email: 'system' },
  { log_id: 9, action: 'workflow_run',  table_name: 'workflow_definitions', resource_id: '3', event_details: { status: 'completed' },         ip_address: '10.0.0.1',     created_at: new Date(Date.now() - 180000000).toISOString(), user_email: 'system' },
  { log_id:10, action: 'login_failed',  table_name: 'users',          resource_id: null, event_details: { reason: 'wrong password' },         ip_address: '203.0.113.5',  created_at: new Date(Date.now() - 259200000).toISOString(), user_email: null },
]

const MOCK_SUMMARY = {
  total: 10,
  byAction: [
    { action: 'login',           count: '2', last_occurrence: new Date().toISOString() },
    { action: 'report_viewed',   count: '1', last_occurrence: new Date().toISOString() },
    { action: 'workflow_run',    count: '2', last_occurrence: new Date().toISOString() },
    { action: 'report_export',   count: '1', last_occurrence: new Date().toISOString() },
    { action: 'compliance_check',count: '1', last_occurrence: new Date().toISOString() },
  ],
}

export function useAuditLogs({ limit = 50, page = 1, action = '', table = '' } = {}) {
  const [logs,    setLogs]    = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [isLive,  setIsLive]  = useState(false)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: String(limit), page: String(page) })
      if (action) params.set('action', action)
      if (table)  params.set('table', table)

      const [logsRes, summaryRes] = await Promise.all([
        fetch(`${API_BASE}/audit-logs?${params}`),
        fetch(`${API_BASE}/audit-logs/summary`),
      ])

      if (logsRes.ok) {
        const data = await logsRes.json()
        if (data.data?.length > 0) {
          setLogs(data.data)
          setPagination(data.pagination || {})
          setIsLive(true)
        } else {
          setLogs(MOCK_LOGS)
          setPagination({ page: 1, limit: 50, total: MOCK_LOGS.length, totalPages: 1 })
        }
      } else {
        setLogs(MOCK_LOGS)
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json()
        setSummary(data.total > 0 ? data : MOCK_SUMMARY)
      } else {
        setSummary(MOCK_SUMMARY)
      }
    } catch (err) {
      console.warn('[useAuditLogs] API unavailable — using mock data')
      setLogs(MOCK_LOGS)
      setSummary(MOCK_SUMMARY)
      setPagination({ page: 1, limit: 50, total: MOCK_LOGS.length, totalPages: 1 })
    } finally {
      setLoading(false)
    }
  }, [limit, page, action, table])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  return { logs, summary, loading, error, pagination, isLive, refresh: fetchLogs }
}

// ── Export trigger helper ─────────────────────────────────────────────────────
export async function triggerReportExport(format = 'csv', domain = 'All', limit = 500) {
  try {
    const params = new URLSearchParams({ format, limit: String(limit) })
    if (domain !== 'All') params.set('domain', domain)

    const url = `${API_BASE}/reports/export?${params}`

    // Trigger browser download
    const link = document.createElement('a')
    link.href = url
    link.download = `reports_${new Date().toISOString().slice(0,10)}.${format === 'excel' ? 'xlsx' : format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    return { success: true }
  } catch (err) {
    console.error('[triggerReportExport]', err)
    return { success: false, error: String(err) }
  }
}

// ── Email delivery trigger ────────────────────────────────────────────────────
export async function triggerScheduledEmail(scheduleId) {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token')
    const res = await fetch(`${API_BASE}/email/send-scheduled`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ scheduleId }),
    })
    return await res.json()
  } catch (err) {
    return { success: false, error: String(err) }
  }
}
