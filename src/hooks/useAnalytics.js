import { useState, useEffect, useCallback } from 'react'
import { analyticsAPI } from '../services/api'

// ─────────────────────────────────────────────────────────────
// useAnalytics — fetches dashboard stats from backend
// Falls back to report-derived values if API is unavailable
// ─────────────────────────────────────────────────────────────
export function useAnalytics() {
  const [stats,    setStats]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [isLive,   setIsLive]   = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await analyticsAPI.getDashboardStats()

      if (data && typeof data === 'object') {
        setStats(data?.data || data)
        setIsLive(true)
        console.log('✅ Analytics: real data loaded', data)
      } else {
        setIsLive(false)
      }
    } catch (err) {
      console.warn('⚠️ Analytics API unavailable — using report-derived values:', err.message)
      setError(err.message)
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  return { stats, loading, error, isLive, refresh: fetchStats }
}

// ─────────────────────────────────────────────────────────────
// useReportMetrics — fetches detailed report metrics
// Used for chart trend overlays
// ─────────────────────────────────────────────────────────────
export function useReportMetrics(params = {}) {
  const [metrics,  setMetrics]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [isLive,   setIsLive]   = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const data = await analyticsAPI.getReportMetrics(params)
        if (data && typeof data === 'object') {
          setMetrics(data)
          setIsLive(true)
        }
      } catch (err) {
        console.warn('⚠️ Report metrics API unavailable:', err.message)
        setIsLive(false)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { metrics, loading, isLive }
}

// ─────────────────────────────────────────────────────────────
// useComplianceStatus — fetches compliance status from backend
// ─────────────────────────────────────────────────────────────
export function useComplianceStatus() {
  const [status,   setStatus]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [isLive,   setIsLive]   = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true)
        const data = await analyticsAPI.getComplianceStatus()
        if (data && typeof data === 'object') {
          setStatus(data)
          setIsLive(true)
        }
      } catch (err) {
        console.warn('⚠️ Compliance status API unavailable:', err.message)
        setIsLive(false)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { status, loading, isLive }
}

// ─────────────────────────────────────────────────────────────
// HELPER — extract a numeric value from backend stats object
// Tries multiple key naming conventions (snake_case, camelCase)
// ─────────────────────────────────────────────────────────────
export function extractStat(stats, keys, fallback = null) {
  if (!stats) return fallback
  for (const key of keys) {
    if (stats[key] !== undefined && stats[key] !== null) {
      return stats[key]
    }
  }
  return fallback
}

