import { useState, useEffect } from 'react'
import { useBeforeUnload } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ReportViewerModal from '../components/ReportViewerModal'
import { Search, LayoutDashboard, Clock, FileText, ChevronRight, Settings, LogOut, RefreshCw } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const MODULE_ICONS = {
  '/payroll':'💰', '/budget-mgmt':'📊', '/expense-mgmt':'💳', '/invoices':'🧾',
  '/leave-mgmt':'🏖️', '/attendance':'⏰', '/performance-mgmt':'🏆', '/recruitment-mgmt':'👥',
  '/training':'📚', '/travel':'✈️', '/helpdesk':'🎧', '/asset-mgmt':'📦',
  '/document-mgmt':'📄', '/risk-mgmt':'🛡️', '/sales-pipeline':'📈', '/crm-mgmt':'🤝',
  '/vendor-mgmt':'🚚', '/inventory-mgmt':'🏭', '/contract-mgmt':'📋', '/resources-mgmt':'👤',
  '/project-mgmt':'🎯', '/compliance':'✅'
}

export default function Workspace() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [workspace, setWorkspace] = useState(null)
  const [reportHistory, setReportHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState('All')
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [previewReport, setPreviewReport] = useState(null)

  useEffect(()=>{
    loadWorkspace()
    // Push extra history entry so back button goes to login
    window.history.pushState(null, '', window.location.href)
    const handlePop = async () => { await logout(); navigate('/login', {replace:true}) }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  },[]) // eslint-disable-line

  const loadWorkspace = async () => {
    setLoading(true)
    try {
      const [wsRes, histRes] = await Promise.all([
        fetch(API+'/workspace', {headers:getHeaders()}),
        fetch(API+'/workspace/report-history?limit=20', {headers:getHeaders()})
      ])
      const [wsData, histData] = await Promise.all([wsRes.json(), histRes.json()])
      if(wsData.data?.onboarding_complete === false) {
        navigate('/onboarding')
        return
      }
      setWorkspace(wsData.data||null)
      setReportHistory(histData.data||[])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const loadReport = async (historyId) => {
    try {
      const res = await fetch(API+'/workspace/report/'+historyId, {headers:getHeaders()})
      const data = await res.json()
      if(data.status==='success') setPreviewReport(data.data)
    } catch(e) { console.error(e) }
  }

  const handleSearch = async () => {
    if(!search.trim()) return
    setSearching(true)
    try {
      const res = await fetch(API+'/workspace/report-history?search='+encodeURIComponent(search)+(domainFilter!=='All'?'&domain='+encodeURIComponent(domainFilter):''), {headers:getHeaders()})
      const data = await res.json()
      setSearchResults(data.data||[])
      setShowSearch(true)
    } catch(e) { console.error(e) }
    setSearching(false)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if(loading) return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:48,height:48,border:'3px solid #334155',borderTop:'3px solid #10b981',borderRadius:'50%',margin:'0 auto 16px',animation:'spin 1s linear infinite'}}></div>
        <p>Loading your workspace...</p>
      </div>
    </div>
  )

  const selectedModules = workspace?.selected_modules || []
  const selectedDomains = workspace?.selected_domains || []
  const selectedReports = workspace?.selected_reports || []
  const uniqueDomains = [...new Set(reportHistory.map(r=>r.domain_name).filter(Boolean))]

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',fontFamily:'Inter,sans-serif',color:'#f1f5f9'}}>
      {/* Header */}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <div style={{width:40,height:40,background:'linear-gradient(135deg,#10b981,#3b82f6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>💼</div>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:700}}>My Workspace</h1>
          <p style={{margin:0,fontSize:12,color:'#64748b'}}>Welcome back, {user?.firstName||user?.email}!</p>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:10,alignItems:'center'}}>
          <button onClick={()=>navigate('/dashboard', {state:{from:'workspace'}})} style={{display:'flex',alignItems:'center',gap:6,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px 20px',cursor:'pointer',fontWeight:600,fontSize:13}}>Go to Dashboard</button>
          <button onClick={()=>navigate('/onboarding')} style={{display:'flex',alignItems:'center',gap:6,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 14px',cursor:'pointer',fontSize:13}}><Settings size={14}/> Edit Workspace</button>
          <button onClick={()=>navigate('/dashboard', {state:{from:'workspace'}})} style={{display:'flex',alignItems:'center',gap:6,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px 20px',cursor:'pointer',fontWeight:600,fontSize:13}}><LayoutDashboard size={14}/> Go to Dashboard</button>
          <button onClick={handleLogout} style={{display:'flex',alignItems:'center',gap:6,background:'#ef444420',border:'none',borderRadius:8,color:'#ef4444',padding:'8px 14px',cursor:'pointer',fontSize:13}}><LogOut size={14}/> Logout</button>
        </div>
      </div>

      <div style={{padding:24}}>
        {/* Stats Row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          {[
            {label:'Active Modules', value:selectedModules.length, color:'#3b82f6', icon:'📦'},
            {label:'Active Domains', value:selectedDomains.length, color:'#10b981', icon:'🌐'},
            {label:'Selected Reports', value:selectedReports.length, color:'#8b5cf6', icon:'📊'},
            {label:'Reports Generated', value:reportHistory.length, color:'#f59e0b', icon:'📈'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontSize:12,color:'#64748b'}}>{s.label}</span>
                <span style={{fontSize:18}}>{s.icon}</span>
              </div>
              <div style={{fontSize:28,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
          <div>
            {/* My Modules */}
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:15,fontWeight:600}}>My Modules</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {selectedModules.map((path, i)=>{
                  const icon = MODULE_ICONS[path] || '📋'
                  const name = path.replace('/', '').replace(/-/g,' ').replace(/\b\w/g, l=>l.toUpperCase())
                  return (
                    <button key={i} onClick={()=>navigate(path)} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:8,padding:'12px 10px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'border-color 0.2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#10b981'} onMouseLeave={e=>e.currentTarget.style.borderColor='#334155'}>
                      <span style={{fontSize:18}}>{icon}</span>
                      <span style={{color:'#f1f5f9',fontSize:11,textAlign:'left',lineHeight:1.3}}>{name}</span>
                      <ChevronRight size={12} style={{color:'#64748b',marginLeft:'auto',flexShrink:0}}/>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Report History */}
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h3 style={{color:'#f1f5f9',margin:0,fontSize:15,fontWeight:600}}>Recent Reports</h3>
                <button onClick={loadWorkspace} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer'}}><RefreshCw size={14}/></button>
              </div>
              {reportHistory.length===0 ? (
                <div style={{textAlign:'center',padding:40,color:'#64748b'}}>
                  <div style={{fontSize:32,marginBottom:8}}>📊</div>
                  <p>No reports generated yet. Upload data to generate your first report!</p>
                  <button onClick={()=>navigate('/upload-data')} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 20px',cursor:'pointer',marginTop:8,fontSize:13}}>Upload Data</button>
                </div>
              ) : (
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{borderBottom:'1px solid #334155'}}>{['Report Name','Domain','Generated On','Status'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {reportHistory.map(r=>(
                      <tr key={r.history_id} style={{borderBottom:'1px solid #0f172a'}}>
                        <td style={{padding:'10px 8px',color:'#f1f5f9',fontSize:13,fontWeight:500}}>{r.report_name}</td>
                        <td style={{padding:'10px 8px'}}><span style={{background:'#3b82f620',color:'#3b82f6',padding:'2px 8px',borderRadius:20,fontSize:11}}>{r.domain_name}</span></td>
                        <td style={{padding:'10px 8px',color:'#64748b',fontSize:12}}>{new Date(r.run_at).toLocaleDateString()}</td>
                        <td style={{padding:'10px 8px'}}><span style={{background:'#10b98120',color:'#10b981',padding:'2px 8px',borderRadius:20,fontSize:11}}>{r.status}</span></td>
                      <td style={{padding:'10px 8px'}}><button onClick={()=>loadReport(r.history_id)} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 10px',cursor:'pointer',fontSize:12}}>?? View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Panel - Search */}
          <div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:15,fontWeight:600}}>🔍 Find a Report</h3>
              <div style={{display:'grid',gap:10}}>
                <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} placeholder="Report name, domain, date..." style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'10px 12px',fontSize:13,boxSizing:'border-box'}}/>
                <select value={domainFilter} onChange={e=>setDomainFilter(e.target.value)} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'10px 12px',fontSize:13}}>
                  <option value="All">All Domains</option>
                  {uniqueDomains.map(d=><option key={d}>{d}</option>)}
                </select>
                <button onClick={handleSearch} disabled={searching||!search.trim()} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600,fontSize:13,opacity:searching||!search.trim()?0.6:1}}>
                  {searching?'Searching...':'Search Reports'}
                </button>
              </div>
              {showSearch && (
                <div style={{marginTop:16}}>
                  <div style={{fontSize:12,color:'#64748b',marginBottom:8}}>{searchResults.length} result(s) found</div>
                  {searchResults.length===0 ? (
                    <div style={{textAlign:'center',padding:20,color:'#64748b',fontSize:13}}>No reports found matching your search</div>
                  ) : (
                    <div style={{display:'grid',gap:6,maxHeight:300,overflowY:'auto'}}>
                      {searchResults.map(r=>(
                        <div key={r.history_id} style={{background:'#0f172a',borderRadius:8,padding:10}}>
                          <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500,marginBottom:4}}>{r.report_name}</div>
                          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748b'}}>
                            <span>{r.domain_name}</span>
                            <span>{new Date(r.run_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:15,fontWeight:600}}>Quick Actions</h3>
              <div style={{display:'grid',gap:8}}>
                {[
                  {label:'Upload Data & Generate Report', icon:'📤', path:'/upload-data', color:'#10b981'},
                  {label:'View Full Dashboard', icon:'📊', path:'/dashboard', color:'#3b82f6'},
                  {label:'AI Copilot', icon:'🤖', path:'/ai-copilot', color:'#8b5cf6'},
                  {label:'KPI Dashboard', icon:'📈', path:'/kpi-dashboard', color:'#f59e0b'},
                  {label:'Edit Workspace Settings', icon:'⚙️', path:'/onboarding', color:'#64748b'},
                ].map((a,i)=>(
                  <button key={i} onClick={()=>navigate(a.path)} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:8,padding:'10px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:10,width:'100%',textAlign:'left'}} onMouseEnter={e=>e.currentTarget.style.borderColor=a.color} onMouseLeave={e=>e.currentTarget.style.borderColor='#334155'}>
                    <span style={{fontSize:16}}>{a.icon}</span>
                    <span style={{color:'#f1f5f9',fontSize:13}}>{a.label}</span>
                    <ChevronRight size={14} style={{color:'#64748b',marginLeft:'auto'}}/>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewReport && <ReportViewerModal report={previewReport} onClose={()=>setPreviewReport(null)} />}




































































    </div>
  )
}


