import { Component } from 'react'
import * as Sentry from '@sentry/react'
import './ErrorBoundary.css'

function ErrorFallback({ error, errorInfo, onReset, pageName, eventId }) {
  const isDev = import.meta.env.DEV
  return (
    <div className="eb-root">
      <div className="eb-card">
        <div className="eb-icon-wrap">
          <svg className="eb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="eb-title">Something went wrong</h2>
        <p className="eb-subtitle">
          {pageName ? `The ${pageName} page ran into an unexpected error.` : 'This page ran into an unexpected error.'}
          {' '}Your data is safe.
        </p>
        {error?.message && (
          <div className="eb-error-msg">
            <span className="eb-error-label">Error</span>
            <span className="eb-error-text">{error.message}</span>
          </div>
        )}
        {eventId && (
          <div className="eb-error-msg">
            <span className="eb-error-label">Ref</span>
            <span className="eb-error-text" style={{ fontFamily:'monospace', fontSize:11 }}>{eventId}</span>
          </div>
        )}
        {isDev && errorInfo?.componentStack && (
          <details className="eb-stack">
            <summary>Component stack (dev only)</summary>
            <pre>{errorInfo.componentStack}</pre>
          </details>
        )}
        <div className="eb-actions">
          <button className="eb-btn-primary" onClick={onReset}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} width={14} height={14}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>
            </svg>
            Try Again
          </button>
          <button className="eb-btn-secondary" onClick={() => window.location.href='/dashboard'}>Go to Dashboard</button>
          <button className="eb-btn-ghost" onClick={() => window.location.reload()}>Reload Page</button>
        </div>
        {eventId && <p className="eb-help">Error ID: <code style={{fontSize:10}}>{eventId}</code></p>}
      </div>
    </div>
  )
}

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null, eventId: null }
    this.handleReset = this.handleReset.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Caught error:', error)
    const eventId = Sentry.captureException(error, {
      extra: { componentStack: errorInfo?.componentStack, pageName: this.props.pageName },
    })
    this.setState({ errorInfo, eventId })
  }

  handleReset() {
    this.setState({ hasError: false, error: null, errorInfo: null, eventId: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({ error: this.state.error, errorInfo: this.state.errorInfo, onReset: this.handleReset })
      }
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
          pageName={this.props.pageName}
          eventId={this.state.eventId}
        />
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary

