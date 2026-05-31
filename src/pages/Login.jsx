import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const API = 'https://finance-backend-so86.onrender.com/api/v1/mfa'
const getHeaders = () => ({ 'Content-Type': 'application/json' })

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState('login') // login | otp
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [pendingUser, setPendingUser] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // First check if MFA is enabled for this user
      const mfaRes = await fetch(API+'/status?email='+encodeURIComponent(email), {headers:getHeaders()})
      const mfaData = await mfaRes.json()
      
      // Try login first to verify credentials
      const result = await login(email, password)
      
      if (mfaData.status === 'success' && mfaData.data?.mfa_enabled) {
        // MFA enabled - send OTP and go to OTP step
        setPendingUser(result)
        setMfaEnabled(true)
        await sendOTP(email)
        // Logout immediately until OTP verified
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setStep('otp')
      } else {
        // No MFA - proceed normally
        const role = mfaData.data?.role || 'user'
        if (role === 'demo') {
          navigate('/dashboard')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const sendOTP = async (userEmail) => {
    setOtpLoading(true)
    try {
      const res = await fetch(API+'/send-otp', {method:'POST', headers:getHeaders(), body:JSON.stringify({email: userEmail || email})})
      const data = await res.json()
      if (data.status === 'success') {
        setOtpSent(true)
      } else {
        setError(data.message)
      }
    } catch(e) {
      setError('Failed to send OTP')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setError(null)
    setOtpLoading(true)
    try {
      const res = await fetch(API+'/verify-otp', {method:'POST', headers:getHeaders(), body:JSON.stringify({email, otp})})
      const data = await res.json()
      if (data.status === 'success') {
        // Re-login after OTP verified
        const result = await login(email, password)
        navigate('/dashboard')
      } else {
        setError(data.message)
      }
    } catch(e) {
      setError('OTP verification failed')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      await login('alice.smith@demo.com', 'password123')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {width:'100%',background:'#1e293b',border:'1px solid #334155',borderRadius:10,color:'#f1f5f9',padding:'12px 16px',fontSize:14,boxSizing:'border-box',outline:'none'}
  const btnStyle = (bg) => ({width:'100%',background:bg,border:'none',borderRadius:10,color:'#fff',padding:'13px',fontSize:14,fontWeight:700,cursor:'pointer',marginTop:8})

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',padding:20}}>
      <div style={{width:'100%',maxWidth:420}}>
        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:56,height:56,background:'linear-gradient(135deg,#10b981,#3b82f6)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:24}}>💼</div>
          <h1 style={{color:'#f1f5f9',fontSize:24,fontWeight:800,margin:0}}>Finance Solution Suite</h1>
          <p style={{color:'#64748b',fontSize:14,marginTop:6}}>Enterprise Financial Management Platform</p>
        </div>

        <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:32}}>
          
          {step === 'login' && (
            <>
              <h2 style={{color:'#f1f5f9',fontSize:20,fontWeight:700,margin:'0 0 24px'}}>Sign In</h2>
              
              {error && <div style={{background:'#ef444420',border:'1px solid #ef444440',borderRadius:8,padding:'10px 14px',color:'#ef4444',fontSize:13,marginBottom:16}}>{error}</div>}
              
              <div style={{display:'grid',gap:14}}>
                <div>
                  <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:6}}>Email Address</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} onKeyDown={e=>e.key==='Enter'&&handleSubmit(e)}/>
                </div>
                <div>
                  <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:6}}>Password</label>
                  <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" style={inputStyle} onKeyDown={e=>e.key==='Enter'&&handleSubmit(e)}/>
                  <div style={{textAlign:'right',marginTop:6}}>
                    <Link to="/forgot-password" style={{color:'#3b82f6',fontSize:12,textDecoration:'none'}}>Forgot password?</Link>
                  </div>
                </div>
                <button onClick={handleSubmit} disabled={loading||!email||!password} style={{...btnStyle('#10b981'),opacity:loading||!email||!password?0.6:1}}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:12,margin:'20px 0'}}>
                <div style={{flex:1,height:1,background:'#334155'}}></div>
                <span style={{color:'#64748b',fontSize:12}}>or</span>
                <div style={{flex:1,height:1,background:'#334155'}}></div>
              </div>

              {/* Demo Login */}
              <button onClick={handleDemoLogin} disabled={loading} style={{...btnStyle('#1e40af'),opacity:loading?0.6:1}}>
                {loading ? 'Loading...' : '🎯 Try Demo Account'}
              </button>
              <div style={{background:'#0f172a',borderRadius:8,padding:12,marginTop:10,fontSize:12,color:'#64748b'}}>
                <strong style={{color:'#94a3b8'}}>Demo Access:</strong> Limited view-only access to dashboard. Full features require a registered account.
              </div>

              <p style={{color:'#64748b',fontSize:13,textAlign:'center',marginTop:20}}>
                Don't have an account? <Link to="/register" style={{color:'#10b981',textDecoration:'none',fontWeight:600}}>Sign Up</Link>
              </p>
            </>
          )}

          {step === 'otp' && (
            <>
              <div style={{textAlign:'center',marginBottom:24}}>
                <div style={{fontSize:40,marginBottom:12}}>🔐</div>
                <h2 style={{color:'#f1f5f9',fontSize:20,fontWeight:700,margin:'0 0 8px'}}>Two-Factor Authentication</h2>
                <p style={{color:'#64748b',fontSize:13,margin:0}}>We sent a 6-digit OTP to <strong style={{color:'#10b981'}}>{email}</strong></p>
              </div>

              {error && <div style={{background:'#ef444420',border:'1px solid #ef444440',borderRadius:8,padding:'10px 14px',color:'#ef4444',fontSize:13,marginBottom:16}}>{error}</div>}

              {otpSent && <div style={{background:'#10b98120',border:'1px solid #10b98140',borderRadius:8,padding:'10px 14px',color:'#10b981',fontSize:13,marginBottom:16}}>✓ OTP sent to your email. Check your inbox.</div>}

              <div style={{marginBottom:16}}>
                <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:6}}>Enter OTP</label>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} 
                  placeholder="000000" 
                  maxLength={6}
                  style={{...inputStyle,textAlign:'center',fontSize:28,fontWeight:700,letterSpacing:12}}
                  onKeyDown={e=>e.key==='Enter'&&handleVerifyOTP()}
                />
              </div>

              <button onClick={handleVerifyOTP} disabled={otpLoading||otp.length!==6} style={{...btnStyle('#10b981'),opacity:otpLoading||otp.length!==6?0.6:1}}>
                {otpLoading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                <button onClick={()=>setStep('login')} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:13}}>← Back to Login</button>
                <button onClick={()=>sendOTP(email)} disabled={otpLoading} style={{background:'none',border:'none',color:'#3b82f6',cursor:'pointer',fontSize:13,opacity:otpLoading?0.6:1}}>
                  {otpLoading ? 'Sending...' : 'Resend OTP'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login