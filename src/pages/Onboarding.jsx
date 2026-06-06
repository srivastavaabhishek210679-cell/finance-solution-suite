import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CheckCircle, ChevronDown, ChevronUp, Search, ArrowRight, Briefcase } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

export default function Onboarding() {
  const navigate = useNavigate()
  
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [modules, setModules] = useState([])
  const [domains, setDomains] = useState([])
  const [reports, setReports] = useState([])
  const [selectedModules, setSelectedModules] = useState([])
  const [selectedDomains, setSelectedDomains] = useState([])
  const [selectedReports, setSelectedReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [expandedDomains, setExpandedDomains] = useState({})
  const [reportSearch, setReportSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [modRes, domRes] = await Promise.all([
        fetch(API+'/workspace/modules', {headers:getHeaders()}),
        fetch(API+'/workspace/domains', {headers:getHeaders()})
      ])
      const [modData, domData] = await Promise.all([modRes.json(), domRes.json()])
      setModules(modData.data||[])
      setDomains(domData.data||[])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const loadReports = async (domainIds, modulePaths = []) => {
    if(!domainIds.length) { setReports([]); return }
    try {
      let url = API+'/workspace/reports-by-domains?domains='+domainIds.join(',')
      if(modulePaths.length > 0) url += '&modules='+modulePaths.map(encodeURIComponent).join(',')
      const res = await fetch(url, {headers:getHeaders()})
      const data = await res.json()
      setReports(data.data||[])
    } catch(e) { console.error(e) }
  }

  const toggleModule = (mod) => {
    const exists = selectedModules.find(m => m.module_name === mod.module_name && m.domain_id === mod.domain_id)
    let newModules, newDomains
    if(exists) {
      newModules = selectedModules.filter(m => !(m.module_name === mod.module_name && m.domain_id === mod.domain_id))
    } else {
      newModules = [...selectedModules, mod]
    }
    setSelectedModules(newModules)
    // Update domains based on selected modules
    const domainIds = [...new Set(newModules.map(m => m.domain_id))]
    setSelectedDomains(domainIds)
    const modPaths = newModules.map(m => m.module_path).filter(p => p && p !== '/upload-data')
    loadReports(domainIds, modPaths)
  }

  const toggleReport = (report) => {
    const exists = selectedReports.find(r => r.report_id === report.report_id)
    if(exists) {
      setSelectedReports(selectedReports.filter(r => r.report_id !== report.report_id))
    } else {
      setSelectedReports([...selectedReports, report])
    }
  }

  const toggleAllReportsInDomain = (domainId) => {
    const domainReports = reports.filter(r => r.domain_id === domainId)
    const allSelected = domainReports.every(r => selectedReports.find(sr => sr.report_id === r.report_id))
    if(allSelected) {
      setSelectedReports(selectedReports.filter(r => r.domain_id !== domainId))
    } else {
      const newReports = [...selectedReports]
      domainReports.forEach(r => { if(!newReports.find(sr => sr.report_id === r.report_id)) newReports.push(r) })
      setSelectedReports(newReports)
    }
  }

  const toggleDomainExpand = (domainId) => {
    setExpandedDomains(prev => ({...prev, [domainId]: !prev[domainId]}))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(API+'/workspace/save', {
        method:'POST',
        headers:getHeaders(),
        body:JSON.stringify({
          selected_modules: selectedModules.map(m => m.module_path),
          selected_domains: selectedDomains,
          selected_reports: selectedReports.map(r => r.report_id)
        })
      })
      const data = await res.json()
      if(data.status==='success') {
        localStorage.setItem('userWorkspace', JSON.stringify({
          selected_modules: selectedModules.map(m => m.module_path === '/upload-data' ? 'domain:'+m.domain_id : m.module_path),
          selected_domains: selectedDomains,
          selected_reports: selectedReports.map(r => r.report_id),
          onboarding_complete: true
        }))
        navigate('/workspace')
      }
    } catch(e) { console.error(e) }
    setSaving(false)
  }

  // Group modules by domain
  const groupedModules = modules.reduce((acc, mod) => {
    const key = mod.domain_name
    if(!acc[key]) acc[key] = { color: mod.domain_color, modules: [] }
    acc[key].modules.push(mod)
    return acc
  }, {})

  // Filter modules by search
  const filteredGroups = Object.entries(groupedModules).filter(([domain, data]) => {
    if(!search) return true
    return domain.toLowerCase().includes(search.toLowerCase()) ||
      data.modules.some(m => m.module_name.toLowerCase().includes(search.toLowerCase()))
  })

  // Group reports by domain
  const groupedReports = reports.reduce((acc, r) => {
    if(!acc[r.domain_name]) acc[r.domain_name] = { domain_id: r.domain_id, reports: [] }
    acc[r.domain_name].reports.push(r)
    return acc
  }, {})

  const filteredReports = Object.entries(groupedReports).map(([domain, data]) => ({
    domain,
    domain_id: data.domain_id,
    reports: data.reports.filter(r =>
      !reportSearch || r.name.toLowerCase().includes(reportSearch.toLowerCase()) ||
      (r.report_category||'').toLowerCase().includes(reportSearch.toLowerCase())
    )
  })).filter(d => d.reports.length > 0)

  if(loading) return (
    <div style={{minHeight:'100vh',background:'#0f172a',display:'flex',alignItems:'center',justifyContent:'center',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:48,height:48,border:'3px solid #334155',borderTop:'3px solid #10b981',borderRadius:'50%',margin:'0 auto 16px',animation:'spin 1s linear infinite'}}></div>
        <p>Loading your workspace setup...</p>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',fontFamily:'Inter,sans-serif',color:'#f1f5f9'}}>
      {/* Header */}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:40,height:40,background:'linear-gradient(135deg,#10b981,#3b82f6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>💼</div>
          <div>
            <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Workspace Setup</h1>
            <p style={{margin:0,fontSize:12,color:'#64748b'}}>Welcome! Set up your personalized workspace</p>
          </div>
          <button onClick={()=>navigate('/dashboard', {state:{from:'workspace'}})} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:600}}>?? Go to Dashboard</button>
          <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 16px',cursor:'pointer',fontSize:13}}>? Cancel</button>

        </div>
        <div style={{display:'flex',gap:8}}>
          {[1,2,3].map(s=>(
            <div key={s} style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:step>=s?'#10b981':'#334155',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:step>=s?'#fff':'#64748b'}}>{step>s?'✓':s}</div>
              <span style={{fontSize:12,color:step>=s?'#10b981':'#64748b',display:s<3?'block':'block'}}>{['Select Modules','Choose Reports','Confirm'][s-1]}</span>
              {s<3 && <div style={{width:20,height:1,background:'#334155'}}></div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:24,maxWidth:1100,margin:'0 auto'}}>

        {/* STEP 1: Select Modules */}
        {step===1 && (
          <div>
            <div style={{marginBottom:24}}>
              <h2 style={{color:'#f1f5f9',fontSize:22,fontWeight:700,margin:'0 0 8px'}}>Select Your Work Modules</h2>
              <p style={{color:'#64748b',fontSize:14,margin:0}}>Choose the modules you work with. Reports and features will be filtered accordingly.</p>
            </div>

            <div style={{display:'flex',gap:12,marginBottom:20,alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 14px',flex:1}}>
                <Search size={16} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search modules..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:14,outline:'none',flex:1}}/>
              </div>
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 14px',fontSize:13,color:'#64748b'}}>
                {selectedModules.length} modules selected
              </div>
            </div>

            <div style={{display:'grid',gap:16}}>
              {filteredGroups.map(([domain, data])=>(
                <div key={domain} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
                  <div style={{padding:'12px 16px',background:data.color+'15',borderBottom:'1px solid #334155',display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:10,height:10,borderRadius:'50%',background:data.color}}></div>
                    <span style={{color:data.color,fontWeight:700,fontSize:14}}>{domain}</span>
                    <span style={{color:'#64748b',fontSize:12}}>({data.modules.length} modules)</span>
                    <span style={{marginLeft:'auto',color:data.color,fontSize:12}}>{data.modules.filter(m=>selectedModules.find(sm=>sm.module_path===m.module_path)).length} selected</span>
                  </div>
                  <div style={{padding:12,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                    {data.modules.map(mod=>{
                      const isSelected = !!selectedModules.find(m=>m.module_name===mod.module_name && m.domain_id===mod.domain_id)
                      return (
                        <button key={mod.module_name+'_'+mod.domain_id} onClick={()=>toggleModule(mod)} style={{background:isSelected?data.color+'20':'#0f172a',border:`1px solid `,borderRadius:8,padding:'10px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'all 0.2s'}}>
                          <div style={{width:20,height:20,borderRadius:4,border:`2px solid ${isSelected?data.color:'#334155'}`,background:isSelected?data.color:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            {isSelected && <span style={{color:'#fff',fontSize:12}}>✓</span>}
                          </div>
                          <span style={{color:isSelected?'#f1f5f9':'#94a3b8',fontSize:13,textAlign:'left'}}>{mod.module_name}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div style={{display:'flex',justifyContent:'flex-end',marginTop:24}}>
              <button onClick={()=>setStep(2)} disabled={selectedModules.length===0} style={{background:'#10b981',border:'none',borderRadius:10,color:'#fff',padding:'12px 32px',fontSize:14,fontWeight:700,cursor:selectedModules.length===0?'not-allowed':'pointer',opacity:selectedModules.length===0?0.5:1,display:'flex',alignItems:'center',gap:8}}>
                Continue to Reports <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Reports */}
        {step===2 && (
          <div>
            <div style={{marginBottom:24}}>
              <h2 style={{color:'#f1f5f9',fontSize:22,fontWeight:700,margin:'0 0 8px'}}>Select Reports to Work With</h2>
              <p style={{color:'#64748b',fontSize:14,margin:0}}>Based on your selected modules, choose which reports you want to generate. You can select all or specific reports.</p>
            </div>

            <div style={{display:'flex',gap:12,marginBottom:20,alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 14px',flex:1}}>
                <Search size={16} style={{color:'#64748b'}}/>
                <input value={reportSearch} onChange={e=>setReportSearch(e.target.value)} placeholder="Search reports..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:14,outline:'none',flex:1}}/>
              </div>
              <button onClick={()=>setSelectedReports(reports)} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:600}}>Select All ({reports.length})</button>
              <button onClick={()=>setSelectedReports([])} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 16px',cursor:'pointer',fontSize:13}}>Clear</button>
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 14px',fontSize:13,color:'#10b981',fontWeight:600}}>
                {selectedReports.length} selected
              </div>
            </div>

            <div style={{display:'grid',gap:12}}>
              {filteredReports.map(({domain, domain_id, reports: domReports})=>{
                const allSelected = domReports.every(r=>selectedReports.find(sr=>sr.report_id===r.report_id))
                const someSelected = domReports.some(r=>selectedReports.find(sr=>sr.report_id===r.report_id))
                const isExpanded = expandedDomains[domain_id] !== false
                return (
                  <div key={domain} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
                    <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:12,cursor:'pointer'}} onClick={()=>toggleDomainExpand(domain_id)}>
                      <button onClick={e=>{e.stopPropagation();toggleAllReportsInDomain(domain_id)}} style={{width:20,height:20,borderRadius:4,border:`2px solid ${allSelected?'#10b981':someSelected?'#f59e0b':'#334155'}`,background:allSelected?'#10b981':someSelected?'#f59e0b20':'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,padding:0}}>
                        {allSelected && <span style={{color:'#fff',fontSize:10}}>✓</span>}
                        {someSelected && !allSelected && <span style={{color:'#f59e0b',fontSize:10}}>-</span>}
                      </button>
                      <span style={{color:'#f1f5f9',fontWeight:600,fontSize:14,flex:1}}>{domain}</span>
                      <span style={{color:'#64748b',fontSize:12}}>{domReports.filter(r=>selectedReports.find(sr=>sr.report_id===r.report_id)).length}/{domReports.length} selected</span>
                      {isExpanded ? <ChevronUp size={16} style={{color:'#64748b'}}/> : <ChevronDown size={16} style={{color:'#64748b'}}/>}
                    </div>
                    {isExpanded && (
                      <div style={{borderTop:'1px solid #334155',padding:12,display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6,maxHeight:300,overflowY:'auto'}}>
                        {domReports.map(report=>{
                          const isSelected = !!selectedReports.find(r=>r.report_id===report.report_id)
                          return (
                            <button key={report.report_id} onClick={()=>toggleReport(report)} style={{background:isSelected?'#10b98115':'#0f172a',border:`1px solid ${isSelected?'#10b981':'#334155'}`,borderRadius:6,padding:'8px 10px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,textAlign:'left',transition:'all 0.2s'}}>
                              <div style={{width:16,height:16,borderRadius:3,border:`2px solid ${isSelected?'#10b981':'#334155'}`,background:isSelected?'#10b981':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                {isSelected && <span style={{color:'#fff',fontSize:9}}>✓</span>}
                              </div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{color:isSelected?'#10b981':'#f1f5f9',fontSize:12,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{report.name}</div>
                                {report.report_category && <div style={{color:'#64748b',fontSize:10}}>{report.report_category}</div>}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div style={{display:'flex',justifyContent:'space-between',marginTop:24}}>
              <button onClick={()=>setStep(1)} style={{background:'#334155',border:'none',borderRadius:10,color:'#94a3b8',padding:'12px 24px',fontSize:14,cursor:'pointer'}}>← Back</button>
              <button onClick={()=>setStep(3)} disabled={selectedReports.length===0} style={{background:'#10b981',border:'none',borderRadius:10,color:'#fff',padding:'12px 32px',fontSize:14,fontWeight:700,cursor:selectedReports.length===0?'not-allowed':'pointer',opacity:selectedReports.length===0?0.5:1,display:'flex',alignItems:'center',gap:8}}>
                Review & Confirm <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm */}
        {step===3 && (
          <div>
            <div style={{marginBottom:24}}>
              <h2 style={{color:'#f1f5f9',fontSize:22,fontWeight:700,margin:'0 0 8px'}}>Confirm Your Workspace</h2>
              <p style={{color:'#64748b',fontSize:14,margin:0}}>Review your selections before setting up your workspace.</p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:15,display:'flex',justifyContent:'space-between'}}>
                  <span>Selected Modules</span>
                  <span style={{color:'#10b981',fontSize:13}}>{selectedModules.length}</span>
                </h3>
                <div style={{display:'grid',gap:6}}>
                  {selectedModules.map(m=>(
                    <div key={m.module_path} style={{background:'#0f172a',borderRadius:6,padding:'6px 10px',fontSize:13,color:'#94a3b8',display:'flex',justifyContent:'space-between'}}>
                      <span>{m.module_name}</span>
                      <span style={{color:'#64748b',fontSize:11}}>{m.domain_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:15,display:'flex',justifyContent:'space-between'}}>
                  <span>Selected Reports</span>
                  <span style={{color:'#10b981',fontSize:13}}>{selectedReports.length}</span>
                </h3>
                <div style={{maxHeight:300,overflowY:'auto',display:'grid',gap:4}}>
                  {selectedReports.map(r=>(
                    <div key={r.report_id} style={{background:'#0f172a',borderRadius:6,padding:'6px 10px',fontSize:12,color:'#94a3b8',display:'flex',justifyContent:'space-between'}}>
                      <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1}}>{r.name}</span>
                      <span style={{color:'#64748b',fontSize:10,marginLeft:8,flexShrink:0}}>{r.domain_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{background:'#10b98115',border:'1px solid #10b98140',borderRadius:12,padding:20,marginBottom:24}}>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <CheckCircle size={24} style={{color:'#10b981',flexShrink:0}}/>
                <div>
                  <div style={{color:'#10b981',fontWeight:700,fontSize:15,marginBottom:4}}>Ready to set up your workspace!</div>
                  <div style={{color:'#94a3b8',fontSize:13}}>{selectedModules.length} modules • {selectedDomains.length} domains • {selectedReports.length} reports selected</div>
                </div>
              </div>
            </div>

            <div style={{display:'flex',justifyContent:'space-between'}}>
              <button onClick={()=>setStep(2)} style={{background:'#334155',border:'none',borderRadius:10,color:'#94a3b8',padding:'12px 24px',fontSize:14,cursor:'pointer'}}>← Back</button>
              <button onClick={handleSave} disabled={saving} style={{background:'#10b981',border:'none',borderRadius:10,color:'#fff',padding:'12px 32px',fontSize:14,fontWeight:700,cursor:saving?'not-allowed':'pointer',opacity:saving?0.6:1,display:'flex',alignItems:'center',gap:8}}>
                {saving ? 'Setting up...' : '🚀 Launch My Workspace'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}







