import { useState } from 'react'
import {
  Calendar, Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight,
  FileText, Building2, TrendingUp, Shield, Leaf, Bell, RefreshCw, Wifi, WifiOff
} from 'lucide-react'
import { useComplianceData } from '../hooks/useComplianceData'
import './ComplianceCalendar.css'

function ComplianceCalendar() {
  const [currentDate,       setCurrentDate]       = useState(new Date())
  const [selectedCategory,  setSelectedCategory]  = useState('All')
  const [viewMode,          setViewMode]          = useState('month')

  // ── Fetch real compliance events from backend ───────────────
  const { events: complianceEvents, loading, isLive, refresh } = useComplianceData()

  // ── Categories — derived from actual events ─────────────────
  const CATEGORY_ICONS = {
    Tax:      FileText,
    Audit:    Shield,
    ROC:      Building2,
    'SEBI/SEC': TrendingUp,
    ESG:      Leaf,
    General:  Calendar,
  }

  const CATEGORY_COLORS = {
    Tax:        '#3b82f6',
    Audit:      '#8b5cf6',
    ROC:        '#f59e0b',
    'SEBI/SEC': '#10b981',
    ESG:        '#22c55e',
    General:    '#14b8a6',
  }

  // Build categories from real events
  const uniqueCategories = [...new Set(complianceEvents.map(e => e.category))]
  const categories = [
    { name: 'All', icon: Calendar, color: '#14b8a6', count: complianceEvents.length },
    ...uniqueCategories.map(cat => ({
      name:  cat,
      icon:  CATEGORY_ICONS[cat] || FileText,
      color: CATEGORY_COLORS[cat] || '#64748b',
      count: complianceEvents.filter(e => e.category === cat).length
    }))
  ]

  const priorityColors = {
    critical: '#ef4444',
    high:     '#f59e0b',
    medium:   '#3b82f6',
    low:      '#64748b'
  }

  const statusColors = {
    upcoming:  '#3b82f6',
    pending:   '#f59e0b',
    completed: '#10b981',
    overdue:   '#ef4444'
  }

  // ── Filter events ───────────────────────────────────────────
  const filteredEvents = selectedCategory === 'All'
    ? complianceEvents
    : complianceEvents.filter(e => e.category === selectedCategory)

  // ── Events for current month ────────────────────────────────
  const getEventsForMonth = () =>
    filteredEvents.filter(e =>
      e.date instanceof Date &&
      e.date.getMonth()    === currentDate.getMonth() &&
      e.date.getFullYear() === currentDate.getFullYear()
    )

  // ── Upcoming events (next 30 days) ──────────────────────────
  const getUpcomingEvents = () => {
    const today = new Date()
    const limit = new Date()
    limit.setDate(today.getDate() + 30)
    return filteredEvents
      .filter(e => e.date instanceof Date && e.date >= today && e.date <= limit)
      .sort((a, b) => a.date - b.date)
  }

  // ── Calendar navigation ─────────────────────────────────────
  const previousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth     = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  const goToToday     = () => setCurrentDate(new Date())

  // ── Generate calendar days ──────────────────────────────────
  const generateCalendarDays = () => {
    const year  = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const first = new Date(year, month, 1)
    const last  = new Date(year, month + 1, 0)
    const days  = []

    const prevLast = new Date(year, month, 0).getDate()
    for (let i = first.getDay() - 1; i >= 0; i--)
      days.push({ day: prevLast - i, isCurrentMonth: false, date: new Date(year, month - 1, prevLast - i) })

    for (let i = 1; i <= last.getDate(); i++)
      days.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) })

    for (let i = 1; days.length < 42; i++)
      days.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) })

    return days
  }

  // ── Events for a specific day ───────────────────────────────
  const getEventsForDay = (date) =>
    filteredEvents.filter(e =>
      e.date instanceof Date &&
      e.date.getDate()     === date.getDate()     &&
      e.date.getMonth()    === date.getMonth()     &&
      e.date.getFullYear() === date.getFullYear()
    )

  // ── Stats ───────────────────────────────────────────────────
  const stats = {
    total:     filteredEvents.length,
    upcoming:  filteredEvents.filter(e => e.status === 'upcoming').length,
    pending:   filteredEvents.filter(e => e.status === 'pending').length,
    completed: filteredEvents.filter(e => e.status === 'completed').length,
    critical:  filteredEvents.filter(e => e.priority === 'critical').length,
  }

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"]
  const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]

  // ── RENDER ──────────────────────────────────────────────────
  return (
    <div className="compliance-calendar-container">

      {/* Header */}
      <div className="calendar-header">
        <div>
          <h2 className="calendar-title">
            <Calendar size={16} />
            Compliance Calendar
          </h2>
          <p className="calendar-subtitle">Track all compliance deadlines and schedules</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

          {/* Live / Fallback indicator */}
          <span style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 10, fontWeight: 600,
            color:      isLive ? '#10b981' : '#f59e0b',
            background: isLive ? '#10b98115' : '#f59e0b15',
            border:     `1px solid ${isLive ? '#10b98140' : '#f59e0b40'}`,
            padding: '2px 8px', borderRadius: 20
          }}>
            {isLive ? <Wifi size={11} /> : <WifiOff size={11} />}
            {loading ? 'Loading…' : isLive ? 'Live Data' : 'Sample Data'}
          </span>

          {/* Refresh */}
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: '#1e293b', border: '1px solid #e2e8f0',
              borderRadius: 6, color: '#64748b', cursor: 'pointer',
              padding: '4px 10px', fontSize: 11,
            }}
          >
            <RefreshCw size={11} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>

          {/* View switcher */}
          <div className="calendar-view-switcher">
            <button className={`view-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Month</button>
            <button className={`view-btn ${viewMode === 'list'  ? 'active' : ''}`} onClick={() => setViewMode('list')}>List</button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="calendar-stats">
        {[
          { icon: FileText,      color: '#3b82f6', val: stats.total,     label: 'Total Events' },
          { icon: Clock,         color: '#3b82f6', val: stats.upcoming,  label: 'Upcoming'     },
          { icon: Bell,          color: '#f59e0b', val: stats.pending,   label: 'Pending'      },
          { icon: CheckCircle,   color: '#10b981', val: stats.completed, label: 'Completed'    },
          { icon: AlertTriangle, color: '#ef4444', val: stats.critical,  label: 'Critical'     },
        ].map(({ icon: Icon, color, val, label }) => (
          <div className="stat-item" key={label}>
            <div className="stat-icon" style={{ background: `${color}1a`, color }}>
              <Icon size={12} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{val}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Category Filters */}
      <div className="calendar-categories">
        {categories.map(cat => {
          const Icon = cat.icon
          return (
            <button
              key={cat.name}
              className={`category-btn ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
              style={selectedCategory === cat.name
                ? { borderColor: cat.color, background: `${cat.color}15` }
                : {}}
            >
              <Icon size={12} style={{ color: cat.color }} />
              <span>{cat.name}</span>
              <span className="category-count">{cat.count}</span>
            </button>
          )
        })}
      </div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: 13 }}>
          <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite', marginBottom: 8 }} />
          <div>Loading compliance events…</div>
        </div>
      )}

      {/* Month View */}
      {!loading && viewMode === 'month' && (
        <>
          <div className="calendar-navigation">
            <button className="nav-btn" onClick={previousMonth}><ChevronLeft size={16} /></button>
            <div className="current-month">{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</div>
            <button className="nav-btn" onClick={goToToday}>Today</button>
            <button className="nav-btn" onClick={nextMonth}><ChevronRight size={16} /></button>
          </div>

          <div className="calendar-grid">
            {DAY_NAMES.map(d => (
              <div key={d} className="calendar-day-header">{d}</div>
            ))}
            {generateCalendarDays().map((dayObj, idx) => {
              const dayEvents = getEventsForDay(dayObj.date)
              const isToday   = dayObj.date.toDateString() === new Date().toDateString()
              return (
                <div
                  key={idx}
                  className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                >
                  <div className="day-number">{dayObj.day}</div>
                  <div className="day-events">
                    {dayEvents.slice(0, 3).map(e => (
                      <div
                        key={e.id}
                        className="event-dot"
                        style={{ background: statusColors[e.status] }}
                        title={e.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="more-events">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* List View */}
      {!loading && viewMode === 'list' && (
        <div className="calendar-list">
          <h3 className="list-title">
            Upcoming Events (Next 30 Days)
            {!isLive && <span style={{ fontSize: 10, color: '#f59e0b', marginLeft: 8 }}>— sample data</span>}
          </h3>
          {getUpcomingEvents().length === 0 ? (
            <div style={{ textAlign: 'center', padding: 24, color: '#64748b', fontSize: 13 }}>
              No upcoming events in the next 30 days.
            </div>
          ) : (
            getUpcomingEvents().map(event => {
              const cat  = categories.find(c => c.name === event.category)
              const Icon = cat?.icon || FileText
              return (
                <div key={event.id} className="event-item">
                  <div className="event-date">
                    <div className="date-month">{MONTH_NAMES[event.date.getMonth()].substring(0, 3)}</div>
                    <div className="date-day">{event.date.getDate()}</div>
                  </div>
                  <div className="event-details">
                    <div className="event-header">
                      <div className="event-title-row">
                        <Icon size={14} style={{ color: cat?.color || '#64748b' }} />
                        <span className="event-title">{event.title}</span>
                      </div>
                      <div className="event-badges">
                        <span className="priority-badge" style={{ background: priorityColors[event.priority] }}>
                          {event.priority}
                        </span>
                        <span className="status-badge" style={{ background: statusColors[event.status] }}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                    {event.description && (
                      <div className="event-description">{event.description}</div>
                    )}
                    <div className="event-category">{event.category}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

    </div>
  )
}

export default ComplianceCalendar

