import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, CheckCircle, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const API = 'https://finance-backend-so86.onrender.com/api/v1/mfa'
const getHeaders = () => ({ 'Content-Type': 'application/json' })

export default function MFASettings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState(false)
  const [showOTPVerify, setShowOTPVerify] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [toast, setToast] = useState(null)
  const email = user?.email || localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').email : ''

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  useEffect(()=>{
    if(email) {
      fetch(API+'/status?email='+encodeURIComponent(email), {headers:getHeaders()})
        .then(r=>r.json())
        .then(d=>{ if(d.status==='success') setMfaEnabled(d.data?.mfa_enabled||false) })
        .finally(()=>setLoading(false))
    }
  },[email])

  const handleToggle = async () => {
    if(!mfaEnabled) {
      // Enabling MFA - send OTP to verify email first
      setToggling(true)
      try {
        const res = await fetch(API+'/send-otp', {method:'POST', headers:getHeaders(), body:JSON.stringify({email})})
        const data = await res.json()
        if(data.status==='success') { setOtpSent(true); setShowOTPVerify(true); showToast('OTP sent to your email') }
        else showToast(data.message,'error')
      } catch(e) { showToast('Failed to send OTP','error') }
      setToggling(false)
    } else {
      // Disabling MFA
      setToggling(true)
      try {
        const res = await fetch(API+'/toggle', {method:'POST', headers:getHeaders(), body:JSON.stringify({email, enabled:false})})
        const data = await res.json()
        if(data.status==='success') { setMfaEnabled(false); showToast('MFA disabled successfully') }
        else showToast(data.message,'error')
      } catch(e) { showToast('Failed to disable MFA','error') }
      setToggling(false)
    }
  }

  const handleVerifyAndEnable = async () => {
    setToggling(true)
    try {
      const verifyRes = await fetch(API+'/verify-otp', {method:'POST', headers:getHeaders(), body:JSON.stringify({email, otp})})
      const verifyData = await verifyRes.json()
      if(verifyData.status==='success') {
        const toggleRes = await fetch(API+'/toggle', {method:'POST', headers:getHeaders(), body:JSON.stringify({email, enabled:true})})
        const toggleData = await toggleRes.json()
        if(toggleData.status==='success') {
          setMfaEnabled(true)
          setShowOTPVerify(false)
          setOtp('')
          showToast('MFA enabled successfully! 🎉')
        }
      } else {
        showToast(verifyData.message,'error')
      }
    } catch(e) { showToast('Verification failed','error') }
    setToggling(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',color:'#f8fafc',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}

      <div style={{background:'#ffffff',borderBottom:'1px solid #e2e8f0',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Shield size={28} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>MFA Settings</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage Two-Factor Authentication for your account</p></div>
      </div>

      <div style={{padding:24,maxWidth:600,margin:'0 auto'}}>
        {/* Status Card */}
        <div style={{background:'#ffffff',border:`1px solid ${mfaEnabled?'#10b98140':'#e2e8f0'}`,borderRadius:16,padding:24,marginBottom:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <div style={{width:48,height:48,borderRadius:12,background:mfaEnabled?'#10b98120':'#e2e8f0',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🔐</div>
              <div>
                <h3 style={{color:'#f8fafc',margin:0,fontSize:16,fontWeight:600}}>Two-Factor Authentication</h3>
                <p style={{color:'#64748b',margin:0,fontSize:13}}>Email OTP verification on login</p>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12}}>
              <span style={{background:mfaEnabled?'#10b98120':'#ef444420',color:mfaEnabled?'#10b981':'#ef4444',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600}}>{mfaEnabled?'ENABLED':'DISABLED'}</span>
              <button onClick={handleToggle} disabled={loading||toggling} style={{background:mfaEnabled?'#ef4444':'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 20px',cursor:'pointer',fontWeight:600,fontSize:13,opacity:loading||toggling?0.6:1}}>
                {toggling?'Processing...':(mfaEnabled?'Disable MFA':'Enable MFA')}
              </button>
            </div>
          </div>

          {mfaEnabled && (
            <div style={{background:'#10b98110',borderRadius:10,padding:14,display:'flex',gap:10,alignItems:'flex-start'}}>
              <CheckCircle size={16} style={{color:'#10b981',flexShrink:0,marginTop:2}}/>
              <p style={{color:'#10b981',margin:0,fontSize:13}}>MFA is active. Every login requires a 6-digit OTP sent to <strong>{email}</strong></p>
            </div>
          )}
          {!mfaEnabled && (
            <div style={{background:'#f59e0b10',borderRadius:10,padding:14,display:'flex',gap:10,alignItems:'flex-start'}}>
              <Shield size={16} style={{color:'#f59e0b',flexShrink:0,marginTop:2}}/>
              <p style={{color:'#f59e0b',margin:0,fontSize:13}}>MFA is not enabled. Your account is less secure. We recommend enabling MFA.</p>
            </div>
          )}
        </div>

        {/* How it works */}
        <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24,marginBottom:20}}>
          <h3 style={{color:'#f8fafc',margin:'0 0 16px',fontSize:15,fontWeight:600}}>How MFA Works</h3>
          <div style={{display:'grid',gap:12}}>
            {[
              ['1','Enter your email and password as usual','#3b82f6'],
              ['2','A 6-digit OTP is sent to your registered email','#8b5cf6'],
              ['3','Enter the OTP within 10 minutes to complete login','#10b981'],
            ].map(([num,text,color])=>(
              <div key={num} style={{display:'flex',gap:12,alignItems:'center'}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color,flexShrink:0}}>{num}</div>
                <p style={{color:'#475569',margin:0,fontSize:13}}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24}}>
          <h3 style={{color:'#f8fafc',margin:'0 0 16px',fontSize:15,fontWeight:600}}>Account Information</h3>
          <div style={{display:'grid',gap:10}}>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #e2e8f0'}}>
              <span style={{color:'#64748b',fontSize:13}}>Email</span>
              <span style={{color:'#f8fafc',fontSize:13,fontWeight:600}}>{email}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid #e2e8f0'}}>
              <span style={{color:'#64748b',fontSize:13}}>MFA Status</span>
              <span style={{color:mfaEnabled?'#10b981':'#ef4444',fontSize:13,fontWeight:600}}>{mfaEnabled?'Protected':'Not Protected'}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0'}}>
              <span style={{color:'#64748b',fontSize:13}}>OTP Delivery</span>
              <span style={{color:'#475569',fontSize:13}}>Email</span>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPVerify && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowOTPVerify(false)}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:32,width:380,textAlign:'center'}} onClick={e=>e.stopPropagation()}>
            <div style={{fontSize:40,marginBottom:16}}>📧</div>
            <h2 style={{color:'#f8fafc',margin:'0 0 8px',fontSize:18,fontWeight:700}}>Verify Your Email</h2>
            <p style={{color:'#64748b',fontSize:13,margin:'0 0 20px'}}>Enter the 6-digit OTP sent to <strong style={{color:'#10b981'}}>{email}</strong> to enable MFA</p>
            <input
              type="text"
              value={otp}
              onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
              placeholder="000000"
              maxLength={6}
              style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:10,color:'#f8fafc',padding:'14px',fontSize:28,fontWeight:700,letterSpacing:12,textAlign:'center',boxSizing:'border-box',marginBottom:16}}
              onKeyDown={e=>e.key==='Enter'&&handleVerifyAndEnable()}
            />
            <div style={{display:'grid',gap:8}}>
              <button onClick={handleVerifyAndEnable} disabled={toggling||otp.length!==6} style={{background:'#10b981',border:'none',borderRadius:10,color:'#fff',padding:'12px',cursor:'pointer',fontWeight:700,fontSize:14,opacity:toggling||otp.length!==6?0.6:1}}>
                {toggling?'Verifying...':'Verify & Enable MFA'}
              </button>
              <button onClick={()=>{setShowOTPVerify(false);setOtp('')}} style={{background:'#e2e8f0',border:'none',borderRadius:10,color:'#475569',padding:'12px',cursor:'pointer',fontSize:13}}>Cancel</button>
            </div>
            <button onClick={()=>sendOTP&&fetch(API+'/send-otp',{method:'POST',headers:getHeaders(),body:JSON.stringify({email})}).then(r=>r.json()).then(d=>showToast(d.message))} style={{background:'none',border:'none',color:'#3b82f6',cursor:'pointer',fontSize:12,marginTop:12}}>Resend OTP</button>
          </div>
        </div>
      )}
    </div>
  )
}

