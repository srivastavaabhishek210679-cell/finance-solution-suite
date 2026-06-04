import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const inputStyle = {width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:10,color:'#1e293b',padding:'12px 16px',fontSize:14,boxSizing:'border-box',outline:'none'}
  const btnStyle = (bg, disabled) => ({width:'100%',background:bg,border:'none',borderRadius:10,color:'#fff',padding:'13px',fontSize:14,fontWeight:700,cursor:disabled?'not-allowed':'pointer',marginTop:8,opacity:disabled?0.6:1})

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/onboarding')
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      await login('alice.smith@demo.com', 'password123')
      navigate('/onboarding')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif',padding:20}}>
      <div style={{width:'100%',maxWidth:420}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{width:56,height:56,background:'linear-gradient(135deg,#10b981,#3b82f6)',borderRadius:16,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:24}}>💼</div>
          <h1 style={{color:'#1e293b',fontSize:24,fontWeight:800,margin:0}}>Finance Solution Suite</h1>
          <p style={{color:'#64748b',fontSize:14,marginTop:6}}>Enterprise Financial Management Platform</p>
        </div>

        <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:32}}>
          <h2 style={{color:'#1e293b',fontSize:20,fontWeight:700,margin:'0 0 24px'}}>Sign In</h2>
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
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:12,margin:'20px 0'}}>
            <div style={{flex:1,height:1,background:'#e2e8f0'}}></div>
            <span style={{color:'#64748b',fontSize:12}}>or</span>
            <div style={{flex:1,height:1,background:'#e2e8f0'}}></div>
          </div>

          <button onClick={handleDemoLogin} disabled={loading} style={btnStyle('#1e40af', loading)}>
            {loading ? 'Loading...' : '🎯 Try Demo Account'}
          </button>
          <div style={{background:'#f8fafc',borderRadius:8,padding:10,marginTop:8,fontSize:11,color:'#64748b',textAlign:'center'}}>
            Demo access is view-only. Full features require registration.
          </div>

          <p style={{color:'#64748b',fontSize:13,textAlign:'center',marginTop:20}}>
            Don't have an account? <Link to="/register" style={{color:'#10b981',textDecoration:'none',fontWeight:600}}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

