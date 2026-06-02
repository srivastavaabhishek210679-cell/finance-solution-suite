import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle, AlertTriangle, Loader } from 'lucide-react'
import './ForgotPassword.css'

const API_BASE = import.meta.env.VITE_API_URL || 'https://finance-backend-so86.onrender.com/api/v1'

export default function ForgotPassword() {
  const [email,     setEmail]     = useState('')
  const [status,    setStatus]    = useState('idle')  // idle | loading | success | error
  const [message,   setMessage]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    setMessage('')

    try {
      const res  = await fetch(`${API_BASE}/auth/forgot-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Reset link sent! Check your inbox.')
      } else {
        setStatus('error')
        setMessage(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Could not connect to server. Please check your connection.')
    }
  }

  return (
    <div className="fp-root">
      <div className="fp-card">

        {/* Logo */}
        <div className="fp-logo">
          <div className="fp-logo-icon">💼</div>
          <div className="fp-logo-text">Finance Solution Suite</div>
        </div>

        {status === 'success' ? (
          /* ── Success state ── */
          <div className="fp-success">
            <div className="fp-success-icon"><CheckCircle size={40} /></div>
            <h2 className="fp-success-title">Check your email</h2>
            <p className="fp-success-msg">{message}</p>
            <p className="fp-success-note">
              The link expires in <strong>1 hour</strong>.
              If you don't see the email, check your spam folder.
            </p>
            <button className="fp-resend-btn" onClick={() => setStatus('idle')}>
              Send another link
            </button>
            <Link to="/login" className="fp-back-link">
              <ArrowLeft size={14}/> Back to login
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <h1 className="fp-title">Forgot password?</h1>
            <p className="fp-subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {status === 'error' && (
              <div className="fp-error-banner">
                <AlertTriangle size={14}/>
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="fp-form">
              <div className="fp-field">
                <label className="fp-label">Email address</label>
                <div className="fp-input-wrap">
                  <Mail size={16} className="fp-input-icon"/>
                  <input
                    type="email"
                    className="fp-input"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    disabled={status === 'loading'}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="fp-submit-btn"
                disabled={status === 'loading' || !email.trim()}
              >
                {status === 'loading' ? (
                  <><Loader size={16} className="fp-spin"/> Sending...</>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>

            <Link to="/login" className="fp-back-link">
              <ArrowLeft size={14}/> Back to login
            </Link>
          </>
        )}

      </div>
    </div>
  )
}
