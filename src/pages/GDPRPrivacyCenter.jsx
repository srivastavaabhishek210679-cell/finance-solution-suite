import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, Download, Trash2, Eye, CheckCircle, X, ArrowLeft, Cookie, FileText, AlertTriangle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const API = 'https://finance-backend-so86.onrender.com/api/v1/gdpr'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

export default function GDPRPrivacyCenter() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [userData, setUserData] = useState(null)
  const [consents, setConsents] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [toast, setToast] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [exporting, setExporting] = useState(false)

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),4000) }

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [dataRes, consentRes, reqRes] = await Promise.all([
        fetch(API+'/my-data', {headers:getHeaders()}),
        fetch(API+'/consents', {headers:getHeaders()}),
        fetch(API+'/requests', {headers:getHeaders()})
      ])
      const [dataD, consentD, reqD] = await Promise.all([dataRes.json(), consentRes.json(), reqRes.json()])
      setUserData(dataD.data||null)
      setConsents(consentD.data||[])
      setRequests(reqD.data||[])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch(API+'/export', {headers:getHeaders()})
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'my-data-export.json'
      a.click()
      URL.revokeObjectURL(url)
      showToast('Data exported successfully!')
      loadData()
    } catch(e) { showToast('Export failed','error') }
    setExporting(false)
  }

  const handleDeleteRequest = async () => {
    setDeleting(true)
    try {
      const res = await fetch(API+'/delete-request', {method:'POST', headers:getHeaders(), body:JSON.stringify({reason:deleteReason})})
      const data = await res.json()
      if(data.status==='success') { showToast(data.message); setShowDeleteModal(false); loadData() }
      else showToast(data.message,'error')
    } catch(e) { showToast('Request failed','error') }
    setDeleting(false)
  }

  const handleConsent = async (type, value) => {
    try {
      const res = await fetch(API+'/consent', {method:'POST', headers:getHeaders(), body:JSON.stringify({consent_type:type, consented:value})})
      const data = await res.json()
      if(data.status==='success') { showToast('Consent updated'); loadData() }
    } catch(e) { showToast('Failed to update consent','error') }
  }

  const CONSENT_TYPES = [
    { type:'marketing', label:'Marketing Communications', desc:'Receive product updates, newsletters and promotional content', icon:'📧' },
    { type:'analytics', label:'Analytics & Performance', desc:'Allow us to collect usage data to improve the platform', icon:'📊' },
    { type:'third_party', label:'Third Party Sharing', desc:'Share anonymized data with trusted partners for research', icon:'🤝' },
    { type:'notifications', label:'Push Notifications', desc:'Receive important alerts and system notifications', icon:'🔔' },
  ]

  const tabs = [
    { id:'overview', label:'Overview', icon:'👤' },
    { id:'data', label:'My Data', icon:'📁' },
    { id:'consents', label:'Consents', icon:'✅' },
    { id:'requests', label:'Requests', icon:'📋' },
    { id:'policy', label:'Privacy Policy', icon:'📜' },
  ]

  if(loading) return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:48,height:48,border:'3px solid #334155',borderTop:'3px solid #10b981',borderRadius:'50%',margin:'0 auto 16px',animation:'spin 1s linear infinite'}}></div>
        <p>Loading Privacy Center...</p>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600,boxShadow:'0 4px 12px rgba(0,0,0,0.3)'}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Shield size={28} style={{color:'#10b981'}}/>
        <div>
          <h1 style={{margin:0,fontSize:20,fontWeight:700}}>Privacy Center</h1>
          <p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage your personal data and privacy preferences</p>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <button onClick={handleExport} disabled={exporting} style={{display:'flex',alignItems:'center',gap:6,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:600,opacity:exporting?0.6:1}}>
            <Download size={14}/>{exporting?'Exporting...':'Export My Data'}
          </button>
          <button onClick={()=>setShowDeleteModal(true)} style={{display:'flex',alignItems:'center',gap:6,background:'#ef444420',border:'1px solid #ef444440',borderRadius:8,color:'#ef4444',padding:'8px 16px',cursor:'pointer',fontSize:13}}>
            <Trash2 size={14}/> Request Deletion
          </button>
        </div>
      </div>

      <div style={{display:'flex',maxWidth:1200,margin:'0 auto',padding:24,gap:20}}>
        {/* Sidebar Tabs */}
        <div style={{width:200,flexShrink:0}}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
            {tabs.map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'12px 16px',background:activeTab===tab.id?'#10b98120':'transparent',border:'none',borderLeft:activeTab===tab.id?'3px solid #10b981':'3px solid transparent',color:activeTab===tab.id?'#10b981':'#64748b',cursor:'pointer',fontSize:13,textAlign:'left'}}>
                <span>{tab.icon}</span><span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{flex:1}}>

          {/* OVERVIEW TAB */}
          {activeTab==='overview' && (
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:20}}>
                {[
                  {label:'Reports Generated', value:userData?.reportHistory?.length||0, color:'#3b82f6', icon:'📊'},
                  {label:'Active Consents', value:consents.filter(c=>c.consented).length, color:'#10b981', icon:'✅'},
                  {label:'Data Requests', value:requests.length, color:'#f59e0b', icon:'📋'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                    <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
                    <div style={{fontSize:28,fontWeight:700,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:12,color:'#64748b'}}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:16}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:15,fontWeight:600}}>Your Account Information</h3>
                <div style={{display:'grid',gap:8}}>
                  {userData?.profile && Object.entries({
                    'Name': (userData.profile.first_name||'') + ' ' + (userData.profile.last_name||''),
                    'Email': userData.profile.email,
                    'Account Status': userData.profile.status,
                    'Role': userData.profile.role,
                    'Member Since': new Date(userData.profile.created_at).toLocaleDateString(),
                    'Last Login': userData.profile.last_login ? new Date(userData.profile.last_login).toLocaleString() : 'Never'
                  }).map(([key,val])=>(
                    <div key={key} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #334155'}}>
                      <span style={{color:'#64748b',fontSize:13}}>{key}</span>
                      <span style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{background:'#f59e0b10',border:'1px solid #f59e0b30',borderRadius:12,padding:16,display:'flex',gap:12}}>
                <AlertTriangle size={20} style={{color:'#f59e0b',flexShrink:0,marginTop:2}}/>
                <div>
                  <div style={{color:'#f59e0b',fontWeight:600,fontSize:14,marginBottom:4}}>Your Rights Under GDPR</div>
                  <div style={{color:'#94a3b8',fontSize:13,lineHeight:1.6}}>You have the right to access, rectify, erase, and port your personal data. You can also object to or restrict processing. Use the tabs above to exercise these rights.</div>
                </div>
              </div>
            </div>
          )}

          {/* DATA TAB */}
          {activeTab==='data' && (
            <div>
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:16}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:15,fontWeight:600}}>Data We Store About You</h3>
                {[
                  {label:'Profile Information', desc:'Name, email, role, login history', icon:'👤', color:'#3b82f6'},
                  {label:'Workspace Settings', desc:'Selected modules, domains, reports preferences', icon:'⚙️', color:'#8b5cf6'},
                  {label:'Report History', desc:userData?.reportHistory?.length+' reports generated', icon:'📊', color:'#10b981'},
                  {label:'Consent Records', desc:'Your privacy preferences and consent history', icon:'✅', color:'#f59e0b'},
                  {label:'Audit Logs', desc:'Actions performed within the platform', icon:'🔍', color:'#ef4444'},
                ].map((item,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid #334155'}}>
                    <div style={{width:36,height:36,borderRadius:8,background:item.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>{item.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{item.label}</div>
                      <div style={{color:'#64748b',fontSize:12}}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={handleExport} disabled={exporting} style={{width:'100%',background:'#3b82f6',border:'none',borderRadius:10,color:'#fff',padding:'14px',cursor:'pointer',fontWeight:700,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',gap:8,opacity:exporting?0.6:1}}>
                <Download size={18}/>{exporting?'Preparing export...':'Download All My Data (JSON)'}
              </button>
            </div>
          )}

          {/* CONSENTS TAB */}
          {activeTab==='consents' && (
            <div>
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 8px',fontSize:15,fontWeight:600}}>Manage Your Consents</h3>
                <p style={{color:'#64748b',fontSize:13,margin:'0 0 20px'}}>Control how we use your data. You can change these settings at any time.</p>
                <div style={{display:'grid',gap:12}}>
                  {CONSENT_TYPES.map(ct=>{
                    const existing = consents.find(c=>c.consent_type===ct.type)
                    const isConsented = existing?.consented || false
                    return (
                      <div key={ct.type} style={{background:'#0f172a',borderRadius:10,padding:16,display:'flex',alignItems:'center',gap:16,border:`1px solid ${isConsented?'#10b98140':'#334155'}`}}>
                        <div style={{fontSize:24}}>{ct.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{color:'#f1f5f9',fontSize:13,fontWeight:600,marginBottom:4}}>{ct.label}</div>
                          <div style={{color:'#64748b',fontSize:12}}>{ct.desc}</div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <span style={{fontSize:12,color:isConsented?'#10b981':'#64748b'}}>{isConsented?'Enabled':'Disabled'}</span>
                          <button onClick={()=>handleConsent(ct.type, !isConsented)} style={{width:44,height:24,borderRadius:12,border:'none',background:isConsented?'#10b981':'#334155',cursor:'pointer',position:'relative',transition:'background 0.2s'}}>
                            <div style={{width:18,height:18,borderRadius:'50%',background:'#fff',position:'absolute',top:3,left:isConsented?23:3,transition:'left 0.2s'}}></div>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* REQUESTS TAB */}
          {activeTab==='requests' && (
            <div>
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:15,fontWeight:600}}>Data Requests History</h3>
                {requests.length===0 ? (
                  <div style={{textAlign:'center',padding:40,color:'#64748b'}}>
                    <div style={{fontSize:32,marginBottom:8}}>📋</div>
                    <p>No data requests yet</p>
                  </div>
                ) : (
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead><tr style={{borderBottom:'1px solid #334155'}}>{['Type','Status','Date','Notes'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
                    <tbody>
                      {requests.map(r=>(
                        <tr key={r.request_id} style={{borderBottom:'1px solid #0f172a'}}>
                          <td style={{padding:'10px 8px',color:'#f1f5f9',fontSize:13,textTransform:'capitalize'}}>{r.request_type}</td>
                          <td style={{padding:'10px 8px'}}><span style={{background:r.status==='completed'?'#10b98120':'#f59e0b20',color:r.status==='completed'?'#10b981':'#f59e0b',padding:'2px 8px',borderRadius:20,fontSize:11}}>{r.status}</span></td>
                          <td style={{padding:'10px 8px',color:'#64748b',fontSize:12}}>{new Date(r.created_at).toLocaleDateString()}</td>
                          <td style={{padding:'10px 8px',color:'#64748b',fontSize:12}}>{r.notes||'-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* POLICY TAB */}
          {activeTab==='policy' && (
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:24}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 20px',fontSize:18,fontWeight:700}}>Privacy Policy</h3>
              {[
                {title:'1. Data We Collect', content:'We collect information you provide during registration (name, email, company), usage data (modules accessed, reports generated), and technical data (IP address, browser type, login timestamps).'},
                {title:'2. How We Use Your Data', content:'Your data is used to provide the Finance Solution Suite service, personalize your workspace, improve platform performance, send important service notifications, and comply with legal obligations.'},
                {title:'3. Data Storage & Security', content:'All data is stored on secure servers with encryption at rest and in transit. We use industry-standard security practices including rate limiting, authentication tokens, and regular security audits.'},
                {title:'4. Your Rights (GDPR)', content:'Under GDPR you have the right to: access your data, rectify inaccurate data, erase your data (right to be forgotten), restrict processing, data portability, and object to processing.'},
                {title:'5. Data Retention', content:'We retain your data for as long as your account is active. Upon account deletion request, we will delete your personal data within 30 days, except where required by law.'},
                {title:'6. Third Party Services', content:'We use Resend for email delivery, Render.com for hosting, and Sentry for error monitoring. These services may process your data under their own privacy policies.'},
                {title:'7. Cookie Policy', content:'We use essential cookies for authentication and session management. Analytics cookies are optional and require your consent. You can manage cookie preferences in your browser settings.'},
                {title:'8. Contact Us', content:'For privacy-related inquiries, contact us at: privacy@financesuite.com. For data deletion or export requests, use the Privacy Center tools above.'},
              ].map((section,i)=>(
                <div key={i} style={{marginBottom:20,paddingBottom:20,borderBottom:'1px solid #334155'}}>
                  <h4 style={{color:'#10b981',fontSize:14,fontWeight:600,margin:'0 0 8px'}}>{section.title}</h4>
                  <p style={{color:'#94a3b8',fontSize:13,lineHeight:1.7,margin:0}}>{section.content}</p>
                </div>
              ))}
              <p style={{color:'#64748b',fontSize:11,margin:0}}>Last updated: June 2026 | Version 1.0</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowDeleteModal(false)}>
          <div style={{background:'#1e293b',border:'1px solid #ef444440',borderRadius:16,padding:32,maxWidth:440,width:'90%'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
              <div style={{width:48,height:48,borderRadius:12,background:'#ef444420',display:'flex',alignItems:'center',justifyContent:'center'}}><Trash2 size={24} style={{color:'#ef4444'}}/></div>
              <div>
                <h3 style={{color:'#f1f5f9',margin:0,fontSize:16,fontWeight:700}}>Request Data Deletion</h3>
                <p style={{color:'#64748b',margin:0,fontSize:12}}>This will request deletion of all your personal data</p>
              </div>
            </div>
            <div style={{background:'#ef444410',border:'1px solid #ef444430',borderRadius:8,padding:12,marginBottom:16}}>
              <p style={{color:'#ef4444',fontSize:12,margin:0}}>⚠️ This action cannot be undone. Your account and all associated data will be permanently deleted within 30 days.</p>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:6}}>Reason (optional)</label>
              <textarea value={deleteReason} onChange={e=>setDeleteReason(e.target.value)} placeholder="Tell us why you want to delete your account..." style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:10,fontSize:13,resize:'vertical',minHeight:80,boxSizing:'border-box'}}/>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowDeleteModal(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer',fontSize:13}}>Cancel</button>
              <button onClick={handleDeleteRequest} disabled={deleting} style={{flex:1,background:'#ef4444',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600,fontSize:13,opacity:deleting?0.6:1}}>
                {deleting?'Submitting...':'Submit Deletion Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}