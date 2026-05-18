import { useState, useEffect, useCallback } from 'react'
import { complianceAPI } from '../services/api'

// ─────────────────────────────────────────────────────────────
// FALLBACK MOCK EVENTS
// Used when backend returns no data or is unavailable
// ─────────────────────────────────────────────────────────────
const FALLBACK_EVENTS = [
  { id: 1,  title: 'GST Return Filing',      category: 'Tax',      date: new Date(2026, 4, 20), status: 'upcoming',  priority: 'high',     description: 'Monthly GST return submission' },
  { id: 2,  title: 'TDS Payment',            category: 'Tax',      date: new Date(2026, 4, 7),  status: 'upcoming',  priority: 'critical', description: 'Quarterly TDS payment deadline' },
  { id: 3,  title: 'Income Tax Filing',      category: 'Tax',      date: new Date(2026, 4, 31), status: 'upcoming',  priority: 'high',     description: 'Annual income tax return' },
  { id: 4,  title: 'VAT Declaration',        category: 'Tax',      date: new Date(2026, 4, 15), status: 'completed', priority: 'medium',   description: 'Monthly VAT declaration' },
  { id: 5,  title: 'Internal Audit Q2',      category: 'Audit',    date: new Date(2026, 4, 25), status: 'upcoming',  priority: 'high',     description: 'Quarterly internal audit review' },
  { id: 6,  title: 'External Audit Prep',    category: 'Audit',    date: new Date(2026, 5, 10), status: 'pending',   priority: 'critical', description: 'Preparation for annual external audit' },
  { id: 7,  title: 'Compliance Audit',       category: 'Audit',    date: new Date(2026, 4, 18), status: 'upcoming',  priority: 'medium',   description: 'Regulatory compliance audit' },
  { id: 8,  title: 'AOC-4 Filing',           category: 'ROC',      date: new Date(2026, 4, 30), status: 'upcoming',  priority: 'critical', description: 'Annual financial statements filing' },
  { id: 9,  title: 'MGT-7 Filing',           category: 'ROC',      date: new Date(2026, 5, 15), status: 'pending',   priority: 'high',     description: 'Annual return filing with ROC' },
  { id: 10, title: 'DIR-3 KYC',              category: 'ROC',      date: new Date(2026, 4, 10), status: 'upcoming',  priority: 'medium',   description: 'Director KYC submission' },
  { id: 11, title: 'Quarterly Results',      category: 'SEBI/SEC', date: new Date(2026, 4, 14), status: 'upcoming',  priority: 'critical', description: 'Q1 FY2026 results announcement' },
  { id: 12, title: 'Insider Trading Report', category: 'SEBI/SEC', date: new Date(2026, 4, 5),  status: 'completed', priority: 'high',     description: 'Quarterly insider trading disclosure' },
  { id: 13, title: 'Corporate Governance',   category: 'SEBI/SEC', date: new Date(2026, 4, 28), status: 'upcoming',  priority: 'medium',   description: 'CG compliance report submission' },
  { id: 14, title: 'Carbon Footprint Report',category: 'ESG',      date: new Date(2026, 5, 5),  status: 'pending',   priority: 'medium',   description: 'Annual carbon emissions disclosure' },
  { id: 15, title: 'Sustainability Report',  category: 'ESG',      date: new Date(2026, 5, 30), status: 'pending',   priority: 'high',     description: 'Annual sustainability reporting' },
  { id: 16, title: 'ESG Risk Assessment',    category: 'ESG',      date: new Date(2026, 4, 22), status: 'upcoming',  priority: 'medium',   description: 'Quarterly ESG risk review' },
]

// ─────────────────────────────────────────────────────────────
// Transform backend event to component format
// Handles multiple possible field names from backend
// ─────────────────────────────────────────────────────────────
const transformEvent = (event, index) => {
  // Determine date — try multiple field names
  const rawDate =
    event.due_date        ||
    event.deadline        ||
    event.scheduled_date  ||
    event.date            ||
    event.event_date      ||
    null

  // Determine category
  const category =
    event.category        ||
    event.report_category ||
    event.domain          ||
    event.type            ||
    'General'

  // Determine status
  const rawStatus = (
    event.status          ||
    event.submission_status ||
    'upcoming'
  ).toLowerCase()

  const statusMap = {
    'completed': 'completed',
    'complete':  'completed',
    'done':      'completed',
    'submitted': 'completed',
    'pending':   'pending',
    'in_progress':'pending',
    'overdue':   'overdue',
    'missed':    'overdue',
  }
  const status = statusMap[rawStatus] || 'upcoming'

  // Determine priority
  const rawPriority = (
    event.priority        ||
    event.risk_level      ||
    'medium'
  ).toLowerCase()

  const priorityMap = {
    'critical': 'critical',
    'high':     'high',
    'medium':   'medium',
    'low':      'low',
    'mandatory':'critical',
    'required': 'high',
    'optional': 'low',
  }
  const priority = priorityMap[rawPriority] || 'medium'

  return {
    id:          event.id || event.calendar_id || event.submission_id || index + 1,
    title:       event.title || event.event_name || event.name || event.report_name || 'Compliance Event',
    category,
    date:        rawDate ? new Date(rawDate) : new Date(),
    status,
    priority,
    description: event.description || event.notes || '',
  }
}

// ─────────────────────────────────────────────────────────────
// useComplianceData — main hook
// ─────────────────────────────────────────────────────────────
export function useComplianceData() {
  const [events,   setEvents]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)
  const [isLive,   setIsLive]   = useState(false)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Try compliance calendar endpoint first
      const calendarData = await complianceAPI.getCalendar({ limit: 100 })

      // Try submissions endpoint as secondary source
      let allEvents = []

      if (Array.isArray(calendarData) && calendarData.length > 0) {
        allEvents = calendarData.map(transformEvent)
        console.log(`✅ Compliance calendar: ${allEvents.length} real events loaded`)
        setIsLive(true)
      } else if (calendarData && typeof calendarData === 'object' && !Array.isArray(calendarData)) {
        // Sometimes API returns { data: [...] } without the interceptor stripping it
        const inner = calendarData.data || calendarData.events || calendarData.items || []
        if (Array.isArray(inner) && inner.length > 0) {
          allEvents = inner.map(transformEvent)
          setIsLive(true)
        }
      }

      // If calendar empty, try submissions
      if (allEvents.length === 0) {
        try {
          const subData = await complianceAPI.getSubmissions({ limit: 100 })
          const subs = Array.isArray(subData) ? subData :
                       (subData?.data || subData?.items || [])

          if (Array.isArray(subs) && subs.length > 0) {
            allEvents = subs.map(transformEvent)
            console.log(`✅ Compliance submissions: ${allEvents.length} real events loaded`)
            setIsLive(true)
          }
        } catch (_) {
          // Submissions also unavailable
        }
      }

      // Fall back to mock events if both APIs return nothing
      if (allEvents.length === 0) {
        console.warn('⚠️ No compliance data from backend — using fallback events')
        setEvents(FALLBACK_EVENTS)
        setIsLive(false)
      } else {
        setEvents(allEvents)
      }

    } catch (err) {
      console.warn('⚠️ Compliance API unavailable — using fallback events:', err.message)
      setError(err.message)
      setEvents(FALLBACK_EVENTS)
      setIsLive(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchEvents() }, [fetchEvents])

  return { events, loading, error, isLive, refresh: fetchEvents }
}
