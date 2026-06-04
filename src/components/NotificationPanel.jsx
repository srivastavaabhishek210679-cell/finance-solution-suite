import { useState, useRef, useEffect } from 'react'
import { Bell, X, Check, CheckCheck, AlertTriangle,
         Info, CheckCircle, Zap, RefreshCw } from 'lucide-react'
import { useNotifications } from '../hooks/useNotifications'
import { SkeletonNotification } from './Skeleton'
import './NotificationPanel.css'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const getIcon = (notif) => {
  const ttl = (notif.title || '').toLowerCase()
  if (ttl.includes('risk')    || ttl.includes('alert'))    return { Icon: AlertTriangle, color: '#ef4444' }
  if (ttl.includes('complet') || ttl.includes('approved')) return { Icon: CheckCircle,   color: '#10b981' }
  if (ttl.includes('workflow')|| ttl.includes('sync'))     return { Icon: Zap,           color: '#3b82f6' }
  if (ttl.includes('deadline')|| ttl.includes('due'))      return { Icon: AlertTriangle, color: '#f59e0b' }
  return { Icon: Info, color: '#6366f1' }
}

const timeAgo = (dateStr) => {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

// ─────────────────────────────────────────────────────────────────────────────
// NotificationPanel
// ─────────────────────────────────────────────────────────────────────────────
export default function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [tab,  setTab]  = useState('all')
  const panelRef = useRef(null)

  const {
    notifications, unread, unreadCount,
    loading, isLive, refresh,
    markAsRead, markAllAsRead,
  } = useNotifications({ pollInterval: 30000 })

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const displayed = tab === 'unread' ? unread : notifications

  return (
    <div className="notif-wrapper" ref={panelRef}>

      {/* Bell Button */}
      <button className="notif-bell" onClick={() => setOpen(o => !o)}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="notif-panel">

          {/* Header */}
          <div className="notif-header">
            <div className="notif-header-left">
              <Bell size={16} />
              <span>Notifications</span>
              {isLive && <span className="notif-live-badge">LIVE</span>}
            </div>
            <div className="notif-header-actions">
              <button onClick={refresh} className="notif-action-btn" title="Refresh">
                <RefreshCw size={14} />
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="notif-action-btn" title="Mark all read">
                  <CheckCheck size={14} />
                </button>
              )}
              <button onClick={() => setOpen(false)} className="notif-action-btn">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="notif-tabs">
            <button className={`notif-tab ${tab==='all'?'active':''}`} onClick={() => setTab('all')}>
              All <span className="notif-tab-count">{notifications.length}</span>
            </button>
            <button className={`notif-tab ${tab==='unread'?'active':''}`} onClick={() => setTab('unread')}>
              Unread <span className="notif-tab-count">{unreadCount}</span>
            </button>
          </div>

          {/* List */}
          <div className="notif-list">
            {loading ? (
              // ── Skeleton loading state ──────────────────────────────────
              <>
                <SkeletonNotification />
                <SkeletonNotification />
                <SkeletonNotification />
                <SkeletonNotification />
              </>
            ) : displayed.length === 0 ? (
              <div className="notif-empty">
                <Bell size={24} />
                <span>{tab === 'unread' ? 'No unread notifications' : 'No notifications'}</span>
              </div>
            ) : (
              displayed.map(notif => {
                const { Icon, color } = getIcon(notif)
                const isUnread = !notif.read_at
                return (
                  <div
                    key={notif.notif_id}
                    className={`notif-item ${isUnread ? 'unread' : ''}`}
                    onClick={() => isUnread && markAsRead(notif.notif_id)}
                  >
                    <div className="notif-item-icon" style={{ color, background: color + '20' }}>
                      <Icon size={14} />
                    </div>
                    <div className="notif-item-body">
                      <div className="notif-item-title">{notif.title}</div>
                      <div className="notif-item-msg">{notif.message}</div>
                      <div className="notif-item-meta">
                        <span>{timeAgo(notif.created_at)}</span>
                        <span className="notif-channel">{notif.channel}</span>
                      </div>
                    </div>
                    {isUnread && (
                      <button
                        className="notif-mark-read"
                        onClick={(e) => { e.stopPropagation(); markAsRead(notif.notif_id) }}
                        title="Mark as read"
                      >
                        <Check size={12} />
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          <div className="notif-footer">
            <span className="notif-source">
              {isLive ? '● Live data' : '○ Demo data'}
            </span>
            <span>{notifications.length} total</span>
          </div>

        </div>
      )}
    </div>
  )
}
