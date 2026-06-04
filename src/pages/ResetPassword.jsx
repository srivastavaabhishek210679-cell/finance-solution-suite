import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Loader, ArrowLeft } from 'lucide-react'
import './ResetPassword.css'

const API_BASE = import.meta.env.VITE_API_URL || 'https://finance-backend-so86.onrender.com/api/v1'

// Password strength checker
function getStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= 8)                    score++
  if (pwd.length >= 12)                   score++
  if (/[A-Z]/.test(pwd))                  score++
  if (/[0-9]/.test(pwd))                  score++
  if (/[^A-Za-z0-9]/.test(pwd))           score++
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#10b981']
  return { score, label: labels[score] || 'Weak', color: colors[score] || '#ef4444' }
}

export default function ResetPassword() {
  const [searchParams]  = useSearchParams()
  const navigate        = useNavigate()
  const token           = searchParams.get('token')

  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [showPwd,     setShowPwd]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status,      setStatus]      = useState('idle')  // idle | loading | success | error
  const [message,     setMessage]     = useState('')

  // Redirect to forgot-password if no token in URL
  useEffect(() => {
    if (!token) navigate('/forgot-password', { replace: true })
  }, [token, navigate])

  const strength   = getStrength(password)
  const pwdMatch   = password && confirm && password === confirm
  const pwdNoMatch = confirm && password !== confirm
  const canSubmit  = password.length >= 8 && pwdMatch && status !== 'loading'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return

    setStatus('loading')
    setMessage('')

    try {
      const res  = await fetch(`${API_BASE}/auth/reset-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Password reset successfully!')
        // Auto-redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setStatus('error')
        setMessage(data.message || 'Failed to reset password. The link may have expired.')
      }
    } catch {
      setStatus('error')
      setMessage('Could not connect to server. Please check your connection.')
    }
  }

  if (!token) return null

  return (
    <div className="rp-root">
      <div className="rp-card">

        {/* Logo */}
        <div className="rp-logo">
          <div className="rp-logo-icon">💼</div>
          <div className="rp-logo-text">Finance Solution Suite</div>
        </div>

        {status === 'success' ? (
          /* ── Success ── */
          <div className="rp-success">
            <div className="rp-success-icon"><CheckCircle size={44}/></div>
            <h2 className="rp-success-title">Password changed!</h2>
            <p className="rp-success-msg">{message}</p>
            <p className="rp-success-note">Redirecting you to login in a moment...</p>
            <Link to="/login" className="rp-login-btn">Go to Login →</Link>
          </div>
        ) : (
          /* ── Form ── */
          <>
            <h1 className="rp-title">Set new password</h1>
            <p className="rp-subtitle">
              Choose a strong password for your account. Must be at least 8 characters.
            </p>

            {status === 'error' && (
              <div className="rp-error-banner">
                <AlertTriangle size={14}/>
                <div>
                  <div>{message}</div>
                  <Link to="/forgot-password" className="rp-error-link">Request a new reset link →</Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="rp-form">

              {/* New password */}
              <div className="rp-field">
                <label className="rp-label">New password</label>
                <div className="rp-input-wrap">
                  <Lock size={15} className="rp-input-icon"/>
                  <input
                    type={showPwd ? 'text' : 'password'}
                    className="rp-input"
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoFocus
                    disabled={status === 'loading'}
                  />
                  <button type="button" className="rp-eye-btn" onClick={() => setShowPwd(v => !v)}>
                    {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>

                {/* Strength bar */}
                {password && (
                  <div className="rp-strength">
                    <div className="rp-strength-bar">
                      {[1,2,3,4,5].map(i => (
                        <div
                          key={i}
                          className="rp-strength-seg"
                          style={{ background: i <= strength.score ? strength.color : '#334155' }}
                        />
                      ))}
                    </div>
                    <span style={{ color: strength.color, fontSize: 11 }}>{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="rp-field">
                <label className="rp-label">Confirm password</label>
                <div className="rp-input-wrap">
                  <Lock size={15} className="rp-input-icon"/>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    className={`rp-input ${pwdNoMatch ? 'rp-input-error' : pwdMatch ? 'rp-input-ok' : ''}`}
                    placeholder="Repeat your password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    disabled={status === 'loading'}
                  />
                  <button type="button" className="rp-eye-btn" onClick={() => setShowConfirm(v => !v)}>
                    {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
                {pwdNoMatch && <span className="rp-mismatch">Passwords do not match</span>}
                {pwdMatch   && <span className="rp-match"><CheckCircle size={11}/> Passwords match</span>}
              </div>

              {/* Requirements */}
              <div className="rp-requirements">
                {[
                  { label: 'At least 8 characters',   ok: password.length >= 8 },
                  { label: 'One uppercase letter',     ok: /[A-Z]/.test(password) },
                  { label: 'One number',               ok: /[0-9]/.test(password) },
                  { label: 'Passwords match',          ok: pwdMatch },
                ].map((req, i) => (
                  <div key={i} className={`rp-req ${req.ok ? 'ok' : ''}`}>
                    <CheckCircle size={11}/>
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>

              <button type="submit" className="rp-submit-btn" disabled={!canSubmit}>
                {status === 'loading' ? (
                  <><Loader size={16} className="rp-spin"/> Resetting...</>
                ) : (
                  'Reset password'
                )}
              </button>
            </form>

            <Link to="/login" className="rp-back-link">
              <ArrowLeft size={14}/> Back to login
            </Link>
          </>
        )}

      </div>
    </div>
  )
}
