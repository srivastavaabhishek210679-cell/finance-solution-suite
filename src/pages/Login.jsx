import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const BACKEND = 'https://finance-backend-so86.onrender.com/api/v1'
const getHeaders = () => ({ 'Content-Type': 'application/json' })

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [step, setStep] = useState('login')
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const inputStyle = {width:'100%',background:'#1e293b',border:'1px solid #334155',borderRadius:10,color:'#f1f5f9',padding:'12px 16px',fontSize:14,boxSizing:'border-box',outline:'none'}
  const btnStyle = (bg, disabled) => ({width:'100%',background:bg,border:'none',borderRadius:10,color:'#fff',padding:'13px',fontSize:14,fontWeight:700,cursor:disabled?'not-allowed':'pointer',marginTop:8,opacity:disabled?0.6:1})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // Step 1: Verify credentials via API WITHOUT setting auth state
      const credRes = await fetch(BACKEND+'/auth/login', {
        method:'POST',
        headers:getHeaders(),
        body:JSON.stringify({email, password})
      })
      const credData = await credRes.json()
      if(!credRes.ok || credData.status !== 'success') {
        setError(credData.message || 'Invalid credentials')
        setLoading(false)
        return
      }

      // Step 2: Send OTP - credentials are valid
      const otpRes = await fetch(BACKEND+'/mfa/send-otp', {
        method:'POST',
        headers:getHeaders(),
        body:JSON.stringify({email})
      })
      const otpData = await otpRes.json()
      if(otpData.status === 'success') {
        setOtpSent(true)
        setStep('otp')
      } else {
        setError('Failed to send OTP: ' + (otpData.message || 'Unknown error'))
      }
    } catch (err) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    setError(null)
    setOtpLoading(true)
    try {
      // Step 3: Verify OTP
      const verifyRes = await fetch(BACKEND+'/mfa/verify-otp', {
        method:'POST',
        headers:getHeaders(),
        body:JSON.stringify({email, otp})
      })
      const verifyData = await verifyRes.json()
      if(verifyData.status === 'success') {
        // Step 4: Now actually login and set auth state
        await login(email, password)
        navigate('/workspace')
      } else {
        setError(verifyData.message || 'Invalid OTP. Please try again.')
      }
    } catch(e) {
      setError('OTP verification failed. Please try again.')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setOtpLoading(true)
    setError(null)
    try {
      const res = await fetch(BACKEND+'/mfa/send-otp', {method:'POST', headers:getHeaders(), body:JSON.stringify({email})})
      const data = await res.json()
      if(data.status==='success') { setOtpSent(true) }
      else setError(data.message)
    } catch(e) { setError('Failed to resend OTP') }
    setOtpLoading(false)
  }

  const handleDemoLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      await login('alice.smith@demo.com', 'password123')
      navigate('/workspace')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',padding:20}}>
      <div style={{width:'100%',maxWidth:420}}>
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
                <button onClick={handleSubmit} disabled={loading||!email||!password} style={btnStyle('#10b981', loading||!email||!password)}>
                  {loading ? 'Verifying credentials...' : 'Continue →'}
                </button>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:12,margin:'20px 0'}}>
                <div style={{flex:1,height:1,background:'#334155'}}></div>
                <span style={{color:'#64748b',fontSize:12}}>or</span>
                <div style={{flex:1,height:1,background:'#334155'}}></div>
              </div>
              <button onClick={handleDemoLogin} disabled={loading} style={btnStyle('#1e40af', loading)}>
                {loading ? 'Loading...' : '🎯 Try Demo Account (No 2FA)'}
              </button>
              <div style={{background:'#0f172a',borderRadius:8,padding:10,marginTop:8,fontSize:11,color:'#64748b',textAlign:'center'}}>
                Demo access is view-only. Full features require registration.
              </div>
              <p style={{color:'#64748b',fontSize:13,textAlign:'center',marginTop:20}}>
                Don't have an account? <Link to="/register" style={{color:'#10b981',textDecoration:'none',fontWeight:600}}>Sign Up</Link>
              </p>
            </>
          )}

          {step === 'otp' && (
            <>
              <div style={{textAlign:'center',marginBottom:24}}>
                <div style={{fontSize:48,marginBottom:12}}>🔐</div>
                <h2 style={{color:'#f1f5f9',fontSize:20,fontWeight:700,margin:'0 0 8px'}}>Two-Factor Authentication</h2>
                <p style={{color:'#64748b',fontSize:13,margin:0,lineHeight:1.5}}>
                  A 6-digit verification code has been sent to<br/>
                  <strong style={{color:'#10b981'}}>{email}</strong>
                </p>
              </div>
              {error && <div style={{background:'#ef444420',border:'1px solid #ef444440',borderRadius:8,padding:'10px 14px',color:'#ef4444',fontSize:13,marginBottom:16}}>{error}</div>}
              {otpSent && !error && <div style={{background:'#10b98120',border:'1px solid #10b98140',borderRadius:8,padding:'10px 14px',color:'#10b981',fontSize:13,marginBottom:16,textAlign:'center'}}>✓ OTP sent. Check your email inbox.</div>}
              <div style={{marginBottom:20}}>
                <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:8,textAlign:'center'}}>Enter 6-digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                  placeholder="• • • • • •"
                  maxLength={6}
                  autoFocus
                  style={{...inputStyle,textAlign:'center',fontSize:32,fontWeight:700,letterSpacing:16,padding:'16px'}}
                  onKeyDown={e=>e.key==='Enter'&&otp.length===6&&handleVerifyOTP()}
                />
              </div>
              <button onClick={handleVerifyOTP} disabled={otpLoading||otp.length!==6} style={btnStyle('#10b981', otpLoading||otp.length!==6)}>
                {otpLoading ? 'Verifying...' : '✓ Verify & Sign In'}
              </button>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:16}}>
                <button onClick={()=>{setStep('login');setOtp('');setError(null)}} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:13}}>← Back</button>
                <button onClick={handleResendOTP} disabled={otpLoading} style={{background:'none',border:'none',color:'#3b82f6',cursor:'pointer',fontSize:13,opacity:otpLoading?0.6:1}}>
                  {otpLoading?'Sending...':'Resend OTP'}
                </button>
              </div>
              <div style={{background:'#0f172a',borderRadius:8,padding:12,marginTop:16,fontSize:12,color:'#64748b',textAlign:'center'}}>
                <strong style={{color:'#f59e0b'}}>⏱ OTP expires in 10 minutes</strong><br/>
                Check your spam folder if not received
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
