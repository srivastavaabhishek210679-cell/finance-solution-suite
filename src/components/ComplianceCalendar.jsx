import { useState } from 'react';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight,
  FileText, Building2, TrendingUp, Shield, Leaf, Bell
} from 'lucide-react';
import './ComplianceCalendar.css';

function ComplianceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'list'

  // Compliance Events Data
  const complianceEvents = [
    // Tax Deadlines
    { id: 1, title: 'GST Return Filing', category: 'Tax', date: new Date(2026, 4, 20), status: 'upcoming', priority: 'high', description: 'Monthly GST return submission' },
    { id: 2, title: 'TDS Payment', category: 'Tax', date: new Date(2026, 4, 7), status: 'upcoming', priority: 'critical', description: 'Quarterly TDS payment deadline' },
    { id: 3, title: 'Income Tax Filing', category: 'Tax', date: new Date(2026, 4, 31), status: 'upcoming', priority: 'high', description: 'Annual income tax return' },
    { id: 4, title: 'VAT Declaration', category: 'Tax', date: new Date(2026, 4, 15), status: 'completed', priority: 'medium', description: 'Monthly VAT declaration' },
    
    // Audit Schedules
    { id: 5, title: 'Internal Audit Q2', category: 'Audit', date: new Date(2026, 4, 25), status: 'upcoming', priority: 'high', description: 'Quarterly internal audit review' },
    { id: 6, title: 'External Audit Prep', category: 'Audit', date: new Date(2026, 5, 10), status: 'pending', priority: 'critical', description: 'Preparation for annual external audit' },
    { id: 7, title: 'Compliance Audit', category: 'Audit', date: new Date(2026, 4, 18), status: 'upcoming', priority: 'medium', description: 'Regulatory compliance audit' },
    
    // ROC Filings
    { id: 8, title: 'AOC-4 Filing', category: 'ROC', date: new Date(2026, 4, 30), status: 'upcoming', priority: 'critical', description: 'Annual financial statements filing' },
    { id: 9, title: 'MGT-7 Filing', category: 'ROC', date: new Date(2026, 5, 15), status: 'pending', priority: 'high', description: 'Annual return filing with ROC' },
    { id: 10, title: 'DIR-3 KYC', category: 'ROC', date: new Date(2026, 4, 10), status: 'upcoming', priority: 'medium', description: 'Director KYC submission' },
    
    // SEBI/SEC Compliance
    { id: 11, title: 'Quarterly Results', category: 'SEBI/SEC', date: new Date(2026, 4, 14), status: 'upcoming', priority: 'critical', description: 'Q1 FY2026 results announcement' },
    { id: 12, title: 'Insider Trading Report', category: 'SEBI/SEC', date: new Date(2026, 4, 5), status: 'completed', priority: 'high', description: 'Quarterly insider trading disclosure' },
    { id: 13, title: 'Corporate Governance', category: 'SEBI/SEC', date: new Date(2026, 4, 28), status: 'upcoming', priority: 'medium', description: 'CG compliance report submission' },
    
    // ESG Reporting
    { id: 14, title: 'Carbon Footprint Report', category: 'ESG', date: new Date(2026, 5, 5), status: 'pending', priority: 'medium', description: 'Annual carbon emissions disclosure' },
    { id: 15, title: 'Sustainability Report', category: 'ESG', date: new Date(2026, 5, 30), status: 'pending', priority: 'high', description: 'Annual sustainability reporting' },
    { id: 16, title: 'ESG Risk Assessment', category: 'ESG', date: new Date(2026, 4, 22), status: 'upcoming', priority: 'medium', description: 'Quarterly ESG risk review' }
  ];

  const categories = [
    { name: 'All', icon: Calendar, color: '#14b8a6', count: complianceEvents.length },
    { name: 'Tax', icon: FileText, color: '#3b82f6', count: complianceEvents.filter(e => e.category === 'Tax').length },
    { name: 'Audit', icon: Shield, color: '#8b5cf6', count: complianceEvents.filter(e => e.category === 'Audit').length },
    { name: 'ROC', icon: Building2, color: '#f59e0b', count: complianceEvents.filter(e => e.category === 'ROC').length },
    { name: 'SEBI/SEC', icon: TrendingUp, color: '#10b981', count: complianceEvents.filter(e => e.category === 'SEBI/SEC').length },
    { name: 'ESG', icon: Leaf, color: '#22c55e', count: complianceEvents.filter(e => e.category === 'ESG').length }
  ];

  const priorityColors = {
    critical: '#ef4444',
    high: '#f59e0b',
    medium: '#3b82f6',
    low: '#64748b'
  };

  const statusColors = {
    upcoming: '#3b82f6',
    pending: '#f59e0b',
    completed: '#10b981',
    overdue: '#ef4444'
  };

  // Filter events
  const filteredEvents = selectedCategory === 'All' 
    ? complianceEvents 
    : complianceEvents.filter(e => e.category === selectedCategory);

  // Get events for current month
  const getEventsForMonth = () => {
    return filteredEvents.filter(event => {
      return event.date.getMonth() === currentDate.getMonth() &&
             event.date.getFullYear() === currentDate.getFullYear();
    });
  };

  // Get upcoming events (next 30 days)
  const getUpcomingEvents = () => {
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);
    
    return filteredEvents
      .filter(event => event.date >= today && event.date <= thirtyDaysLater)
      .sort((a, b) => a.date - b.date);
  };

  // Calendar navigation
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  // Get events for specific day
  const getEventsForDay = (date) => {
    return filteredEvents.filter(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };

  // Statistics
  const stats = {
    total: filteredEvents.length,
    upcoming: filteredEvents.filter(e => e.status === 'upcoming').length,
    pending: filteredEvents.filter(e => e.status === 'pending').length,
    completed: filteredEvents.filter(e => e.status === 'completed').length,
    critical: filteredEvents.filter(e => e.priority === 'critical').length
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="compliance-calendar-container">
      {/* Header */}
      <div className="calendar-header">
        <div>
          <h2 className="calendar-title">
            <Calendar size={16} />
            Compliance Calendar
          </h2>
          <p className="calendar-subtitle">
            Track all compliance deadlines and schedules
          </p>
        </div>
        <div className="calendar-view-switcher">
          <button 
            className={`view-btn ${viewMode === 'month' ? 'active' : ''}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="calendar-stats">
        <div className="stat-item">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <FileText size={12} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Events</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
            <Clock size={12} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.upcoming}</div>
            <div className="stat-label">Upcoming</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Bell size={12} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <CheckCircle size={12} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertTriangle size={12} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-label">Critical</div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="calendar-categories">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.name}
              className={`category-btn ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.name)}
              style={selectedCategory === cat.name ? { 
                borderColor: cat.color,
                background: `${cat.color}15`
              } : {}}
            >
              <Icon size={12} style={{ color: cat.color }} />
              <span>{cat.name}</span>
              <span className="category-count">{cat.count}</span>
            </button>
          );
        })}
      </div>

      {/* Calendar Navigation */}
      {viewMode === 'month' && (
        <>
          <div className="calendar-navigation">
            <button className="nav-btn" onClick={previousMonth}>
              <ChevronLeft size={16} />
            </button>
            <div className="current-month">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <button className="nav-btn" onClick={goToToday}>
              Today
            </button>
            <button className="nav-btn" onClick={nextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="calendar-grid">
            {/* Day Headers */}
            {dayNames.map(day => (
              <div key={day} className="calendar-day-header">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {generateCalendarDays().map((dayObj, index) => {
              const dayEvents = getEventsForDay(dayObj.date);
              const isToday = dayObj.date.toDateString() === new Date().toDateString();
              
              return (
                <div 
                  key={index} 
                  className={`calendar-day ${!dayObj.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                >
                  <div className="day-number">{dayObj.day}</div>
                  <div className="day-events">
                    {dayEvents.slice(0, 3).map(event => (
                      <div 
                        key={event.id} 
                        className="event-dot"
                        style={{ background: statusColors[event.status] }}
                        title={event.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="more-events">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="calendar-list">
          <h3 className="list-title">Upcoming Events (Next 30 Days)</h3>
          {getUpcomingEvents().map(event => {
            const Icon = categories.find(c => c.name === event.category)?.icon || FileText;
            return (
              <div key={event.id} className="event-item">
                <div className="event-date">
                  <div className="date-month">{monthNames[event.date.getMonth()].substring(0, 3)}</div>
                  <div className="date-day">{event.date.getDate()}</div>
                </div>
                <div className="event-details">
                  <div className="event-header">
                    <div className="event-title-row">
                      <Icon size={14} style={{ color: categories.find(c => c.name === event.category)?.color }} />
                      <span className="event-title">{event.title}</span>
                    </div>
                    <div className="event-badges">
                      <span 
                        className="priority-badge"
                        style={{ background: priorityColors[event.priority] }}
                      >
                        {event.priority}
                      </span>
                      <span 
                        className="status-badge"
                        style={{ background: statusColors[event.status] }}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                  <div className="event-description">{event.description}</div>
                  <div className="event-category">{event.category}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ComplianceCalendar;
