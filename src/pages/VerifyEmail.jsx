import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

const API = 'https://finance-backend-so86.onrender.com/api/v1/email-verify'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    if (!token || !email) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }
    fetch(API+'/verify?token='+encodeURIComponent(token)+'&email='+encodeURIComponent(email))
      .then(r=>r.json())
      .then(d=>{
        if(d.status==='success') { setStatus('success'); setMessage(d.message) }
        else { setStatus('error'); setMessage(d.message) }
      })
      .catch(()=>{ setStatus('error'); setMessage('Verification failed. Please try again.') })
  },[])

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:40,maxWidth:440,textAlign:'center'}}>
        {status==='verifying' && <>
          <div style={{fontSize:48,marginBottom:16}}>⏳</div>
          <h2 style={{color:'#f1f5f9',fontSize:20,fontWeight:700}}>Verifying your email...</h2>
        </>}
        {status==='success' && <>
          <div style={{fontSize:48,marginBottom:16}}>✅</div>
          <h2 style={{color:'#10b981',fontSize:20,fontWeight:700}}>Email Verified!</h2>
          <p style={{color:'#64748b',fontSize:14,margin:'12px 0 24px'}}>{message}</p>
          <button onClick={()=>navigate('/login')} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'12px 32px',cursor:'pointer',fontWeight:600,fontSize:14}}>Go to Login</button>
        </>}
        {status==='error' && <>
          <div style={{fontSize:48,marginBottom:16}}>❌</div>
          <h2 style={{color:'#ef4444',fontSize:20,fontWeight:700}}>Verification Failed</h2>
          <p style={{color:'#64748b',fontSize:14,margin:'12px 0 24px'}}>{message}</p>
          <button onClick={()=>navigate('/login')} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'12px 32px',cursor:'pointer',fontWeight:600,fontSize:14}}>Go to Login</button>
        </>}
      </div>
    </div>
  )
}