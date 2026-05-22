import { Component } from 'react'
import './ErrorBoundary.css'

// ── Fallback UI ───────────────────────────────────────────────────────────────
function ErrorFallback({ error, errorInfo, onReset, pageName }) {
  const isDev = import.meta.env.DEV

  return (
    <div className="eb-root">
      <div className="eb-card">

        {/* Icon */}
        <div className="eb-icon-wrap">
          <svg className="eb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Title */}
        <h2 className="eb-title">Something went wrong</h2>
        <p className="eb-subtitle">
          {pageName
            ? `The ${pageName} page ran into an unexpected error.`
            : 'This page ran into an unexpected error.'}
          {' '}Your data is safe — this is a display issue only.
        </p>

        {/* Error message */}
        {error?.message && (
          <div className="eb-error-msg">
            <span className="eb-error-label">Error</span>
            <span className="eb-error-text">{error.message}</span>
          </div>
        )}

        {/* Dev — stack trace */}
        {isDev && errorInfo?.componentStack && (
          <details className="eb-stack">
            <summary>Component stack (dev only)</summary>
            <pre>{errorInfo.componentStack}</pre>
          </details>
        )}

        {/* Actions */}
        <div className="eb-actions">
          <button className="eb-btn-primary" onClick={onReset}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
            </svg>
            Try Again
          </button>
          <button className="eb-btn-secondary" onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </button>
          <button className="eb-btn-ghost" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>

        {/* Help text */}
        <p className="eb-help">
          If this keeps happening, try clearing your browser cache or contact support.
        </p>

      </div>
    </div>
  )
}

// ── Error Boundary class ──────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
    this.handleReset = this.handleReset.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error)
    console.error('[ErrorBoundary] Component stack:', errorInfo?.componentStack)
    this.setState({ errorInfo })

    // Hook for external error tracking (Sentry etc.) — add your DSN here
    // if (window.Sentry) window.Sentry.captureException(error, { extra: errorInfo })
  }

  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Allow custom fallback via prop
      if (this.props.fallback) {
        return this.props.fallback({
          error:     this.state.error,
          errorInfo: this.state.errorInfo,
          onReset:   this.handleReset,
        })
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          pageName={this.props.pageName}
        />
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
