import { useState, useEffect } from 'react'
import { AlertTriangle, WifiOff, Lock, ServerCrash, X, RefreshCw } from 'lucide-react'
import './ApiErrorBanner.css'

// ── Error type config ─────────────────────────────────────────────────────────
const ERROR_CONFIG = {
  network: {
    icon:    WifiOff,
    color:   '#f59e0b',
    bg:      '#f59e0b12',
    border:  '#f59e0b30',
    title:   'No connection',
    default: 'Unable to reach the server. Check your internet connection.',
  },
  auth: {
    icon:    Lock,
    color:   '#8b5cf6',
    bg:      '#8b5cf612',
    border:  '#8b5cf630',
    title:   'Session expired',
    default: 'Your session has expired. Please log in again.',
  },
  server: {
    icon:    ServerCrash,
    color:   '#ef4444',
    bg:      '#ef444412',
    border:  '#ef444430',
    title:   'Server error',
    default: 'The server encountered an error. Please try again shortly.',
  },
  notfound: {
    icon:    AlertTriangle,
    color:   '#64748b',
    bg:      '#64748b12',
    border:  '#64748b30',
    title:   'Not found',
    default: 'The requested resource could not be found.',
  },
  error: {
    icon:    AlertTriangle,
    color:   '#ef4444',
    bg:      '#ef444412',
    border:  '#ef444430',
    title:   'Something went wrong',
    default: 'An unexpected error occurred. Please try again.',
  },
}

// ── Parse raw error into typed error object ───────────────────────────────────
export function parseApiError(err, context = '') {
  if (!err) return null

  // Axios / fetch response errors
  const status = err?.response?.status || err?.status
  if (!navigator.onLine || err?.code === 'ERR_NETWORK' || err?.message === 'Network Error') {
    return { type: 'network', message: 'No internet connection.' }
  }
  if (status === 401 || status === 403) {
    return { type: 'auth', message: 'Your session has expired. Please log in again.' }
  }
  if (status === 404) {
    return { type: 'notfound', message: context ? `${context} not found.` : ERROR_CONFIG.notfound.default }
  }
  if (status >= 500) {
    return { type: 'server', message: 'The server encountered an error. Please try again shortly.' }
  }

  return { type: 'error', message: err?.message || ERROR_CONFIG.error.default }
}

// ── ApiErrorBanner component ──────────────────────────────────────────────────
export function ApiErrorBanner({
  error,          // { type, message } or null
  onRetry,        // optional retry callback
  onDismiss,      // optional dismiss callback — if omitted, auto-dismiss after 8s
  autoDismiss = true,
  position = 'top', // 'top' | 'inline'
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(true) // reset when error changes
    if (!error || !autoDismiss || onDismiss) return
    const timer = setTimeout(() => setVisible(false), 8000)
    return () => clearTimeout(timer)
  }, [error, autoDismiss, onDismiss])

  if (!error || !visible) return null

  const cfg  = ERROR_CONFIG[error.type] || ERROR_CONFIG.error
  const Icon = cfg.icon

  const handleDismiss = () => {
    setVisible(false)
    onDismiss?.()
  }

  return (
    <div
      className={`aeb-root ${position === 'top' ? 'aeb-top' : 'aeb-inline'}`}
      style={{ background: cfg.bg, borderColor: cfg.border }}
      role="alert"
    >
      {/* Icon */}
      <div className="aeb-icon" style={{ color: cfg.color }}>
        <Icon size={16} />
      </div>

      {/* Content */}
      <div className="aeb-body">
        <span className="aeb-title" style={{ color: cfg.color }}>{cfg.title}</span>
        <span className="aeb-message">{error.message || cfg.default}</span>
      </div>

      {/* Actions */}
      <div className="aeb-actions">
        {onRetry && (
          <button className="aeb-retry" style={{ color: cfg.color, borderColor: cfg.border }} onClick={onRetry}>
            <RefreshCw size={12} /> Retry
          </button>
        )}
        <button className="aeb-dismiss" onClick={handleDismiss} title="Dismiss">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}

// ── useApiError hook ──────────────────────────────────────────────────────────
export function useApiError() {
  const [apiError, setApiError] = useState(null)

  const handleError = (err, context = '') => {
    const parsed = parseApiError(err, context)
    setApiError(parsed)
    // Log to console for debugging
    console.error(`[API Error${context ? ` — ${context}` : ''}]`, err?.message || err)
  }

  const clearError = () => setApiError(null)

  return { apiError, handleError, clearError }
}

export default ApiErrorBanner
