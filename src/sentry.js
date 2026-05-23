import * as Sentry from '@sentry/react'

const SENTRY_DSN = 'https://9c43e7b65eb7cddca2c022bf06135134@o4511439760916480.ingest.us.sentry.io/4511439766683648'
const ENV       = import.meta.env.MODE || 'production'

Sentry.init({
  dsn:         SENTRY_DSN,
  environment: ENV,
  enabled:     ENV !== 'development', // disable in dev to avoid noise

  // Performance monitoring — tracks page load, API calls, navigation
  tracesSampleRate: ENV === 'production' ? 0.2 : 1.0, // 20% in prod, 100% in dev

  // Session replay — records user actions before an error
  replaysSessionSampleRate: 0.05,  // 5% of sessions
  replaysOnErrorSampleRate:  1.0,  // 100% of sessions with errors

  // Release tracking — tie errors to deployments
  release: import.meta.env.VITE_APP_VERSION || '1.0.0',

  // Ignore common non-actionable errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    'Network Error',
    'ChunkLoadError',
    /^Loading chunk \d+ failed/,
    /^Loading CSS chunk \d+ failed/,
  ],

  // Don't send errors from these URLs
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
  ],

  sendDefaultPii: false, // don't send IP addresses by default
})

// ── Set user context when logged in ──────────────────────────────────────────
export function setSentryUser(user) {
  if (!user) {
    Sentry.setUser(null)
    return
  }
  Sentry.setUser({
    id:       String(user.userId || user.user_id),
    email:    user.email,
    username: `${user.firstName || user.first_name} ${user.lastName || user.last_name}`.trim(),
  })
  Sentry.setTag('tenant_id', String(user.tenantId || user.tenant_id || ''))
}

// ── Clear user on logout ──────────────────────────────────────────────────────
export function clearSentryUser() {
  Sentry.setUser(null)
}

// ── Capture custom error with context ────────────────────────────────────────
export function captureError(error, context = {}) {
  Sentry.withScope(scope => {
    Object.entries(context).forEach(([key, value]) => {
      scope.setExtra(key, value)
    })
    Sentry.captureException(error)
  })
}

// ── Track custom events (e.g. report downloaded, filter applied) ──────────────
export function trackEvent(name, data = {}) {
  Sentry.addBreadcrumb({
    category: 'user-action',
    message:  name,
    data,
    level:    'info',
  })
}

export { Sentry }
export default Sentry

