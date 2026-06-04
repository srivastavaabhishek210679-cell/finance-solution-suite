import { useState, useEffect } from 'react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/gdpr'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

export default function CookieBanner() {
  const [show, setShow] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false, functional: true })

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if(!consent) setShow(true)
  }, [])

  const saveConsent = async (analytics, marketing) => {
    const consent = { analytics, marketing, functional: true }
    localStorage.setItem('cookieConsent', JSON.stringify(consent))
    try {
      await fetch(API+'/cookie-consent', {method:'POST', headers:getHeaders(), body:JSON.stringify(consent)})
    } catch(e) {}
    setShow(false)
  }

  if(!show) return null

  return (
    <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:9998,background:'#1e293b',borderTop:'1px solid #334155',padding:'16px 24px',fontFamily:'Inter,sans-serif'}}>
      <div style={{maxWidth:1200,margin:'0 auto'}}>
        {!showDetails ? (
          <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:300}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{fontSize:18}}>🍪</span>
                <span style={{color:'#f1f5f9',fontWeight:600,fontSize:14}}>We use cookies</span>
              </div>
              <p style={{color:'#64748b',fontSize:12,margin:0}}>We use essential cookies for authentication and optional analytics cookies to improve your experience. <button onClick={()=>setShowDetails(true)} style={{background:'none',border:'none',color:'#3b82f6',cursor:'pointer',fontSize:12,padding:0}}>Manage preferences</button></p>
            </div>
            <div style={{display:'flex',gap:10,flexShrink:0}}>
              <button onClick={()=>saveConsent(false,false)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 16px',cursor:'pointer',fontSize:13}}>Reject Optional</button>
              <button onClick={()=>saveConsent(true,false)} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:600}}>Accept Analytics</button>
              <button onClick={()=>saveConsent(true,true)} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:700}}>Accept All</button>
            </div>
          </div>
        ) : (
          <div>
            <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:15}}>Cookie Preferences</h3>
            <div style={{display:'grid',gap:10,marginBottom:16}}>
              {[
                {key:'functional', label:'Essential Cookies', desc:'Required for login and core functionality. Cannot be disabled.', locked:true},
                {key:'analytics', label:'Analytics Cookies', desc:'Help us understand how you use the platform to improve it.', locked:false},
                {key:'marketing', label:'Marketing Cookies', desc:'Used for personalized content and advertisements.', locked:false},
              ].map(c=>(
                <div key={c.key} style={{display:'flex',alignItems:'center',gap:12,background:'#0f172a',borderRadius:8,padding:12}}>
                  <div style={{flex:1}}>
                    <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{c.label} {c.locked&&<span style={{background:'#334155',color:'#64748b',fontSize:10,padding:'1px 6px',borderRadius:4,marginLeft:6}}>Always On</span>}</div>
                    <div style={{color:'#64748b',fontSize:12}}>{c.desc}</div>
                  </div>
                  <button disabled={c.locked} onClick={()=>!c.locked&&setPrefs({...prefs,[c.key]:!prefs[c.key]})} style={{width:44,height:24,borderRadius:12,border:'none',background:(c.locked||prefs[c.key])?'#10b981':'#334155',cursor:c.locked?'not-allowed':'pointer',position:'relative',opacity:c.locked?0.7:1}}>
                    <div style={{width:18,height:18,borderRadius:'50%',background:'#fff',position:'absolute',top:3,left:(c.locked||prefs[c.key])?23:3,transition:'left 0.2s'}}></div>
                  </button>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button onClick={()=>setShowDetails(false)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 16px',cursor:'pointer',fontSize:13}}>Back</button>
              <button onClick={()=>saveConsent(prefs.analytics,prefs.marketing)} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:600}}>Save Preferences</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}