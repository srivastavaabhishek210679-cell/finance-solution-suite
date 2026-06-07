import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Search, ChevronDown, ChevronUp, CheckCircle, ArrowRight, ArrowLeft, X } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const DOMAIN_COLORS = {
  Finance:'#10b981', HR:'#8b5cf6', Operations:'#f59e0b', Sales:'#3b82f6',
  IT:'#06b6d4', Healthcare:'#ef4444', Banking:'#0891b2', Telecom:'#7c3aed',
  Retail:'#f97316', Energy:'#16a34a', Manufacturing:'#b45309', Education:'#0284c7', General:'#6b7280'
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [modules, setModules] = useState([])
  const [reports, setReports] = useState([])
  const [selectedModules, setSelectedModules] = useState([])
  const [selectedDomains, setSelectedDomains] = useState([])
  const [selectedReports, setSelectedReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [reportSearch, setReportSearch] = useState('')
  const [openDropdown, setOpenDropdown] = useState(null)
  const [openReportDomain, setOpenReportDomain] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const res = await fetch(API+'/workspace/modules', {headers:getHeaders()})
      const data = await res.json()
      setModules(data.data||[])
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
    let newModules = exists
      ? selectedModules.filter(m => !(m.module_name === mod.module_name && m.domain_id === mod.domain_id))
      : [...selectedModules, mod]
    setSelectedModules(newModules)
    const domainIds = [...new Set(newModules.map(m => m.domain_id))]
    const modPaths = newModules.map(m => m.module_path).filter(p => p && p !== '/upload-data')
    setSelectedDomains(domainIds)
    loadReports(domainIds, modPaths)
  }

  const toggleReport = (report) => {
    const exists = selectedReports.find(r => r.report_id === report.report_id)
    if(exists) setSelectedReports(selectedReports.filter(r => r.report_id !== report.report_id))
    else setSelectedReports([...selectedReports, report])
  }

  const selectAllInDomain = (domainName) => {
    const domReports = groupedReports[domainName]?.reports || []
    const allSelected = domReports.every(r => selectedReports.find(sr => sr.report_id === r.report_id))
    if(allSelected) setSelectedReports(selectedReports.filter(r => r.domain_name !== domainName))
    else {
      const newReports = [...selectedReports]
      domReports.forEach(r => { if(!newReports.find(sr => sr.report_id === r.report_id)) newReports.push(r) })
      setSelectedReports(newReports)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(API+'/workspace/save', {
        method:'POST', headers:getHeaders(),
        body:JSON.stringify({
          selected_modules: selectedModules.map(m => m.module_path === '/upload-data' ? 'domain:'+m.domain_id : m.module_path),
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

  const groupedModules = modules.reduce((acc, mod) => {
    const key = mod.domain_name
    if(!acc[key]) acc[key] = { color: DOMAIN_COLORS[key]||'#6b7280', modules: [] }
    acc[key].modules.push(mod)
    return acc
  }, {})

  const filteredGroups = Object.entries(groupedModules).filter(([domain, data]) => {
    if(!search) return true
    return domain.toLowerCase().includes(search.toLowerCase()) ||
      data.modules.some(m => m.module_name.toLowerCase().includes(search.toLowerCase()))
  })

  const groupedReports = reports.reduce((acc, r) => {
    if(!acc[r.domain_name]) acc[r.domain_name] = { domain_id: r.domain_id, reports: [] }
    acc[r.domain_name].reports.push(r)
    return acc
  }, {})

  const filteredReportGroups = Object.entries(groupedReports).map(([domain, data]) => ({
    domain, domain_id: data.domain_id,
    reports: data.reports.filter(r => !reportSearch || r.name.toLowerCase().includes(reportSearch.toLowerCase()))
  })).filter(d => d.reports.length > 0)

  const STEPS = ['Select Modules', 'Choose Reports', 'Confirm']

  if(loading) return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:56,height:56,border:'3px solid rgba(99,102,241,0.3)',borderTop:'3px solid #6366f1',borderRadius:'50%',margin:'0 auto 20px',animation:'spin 1s linear infinite'}}></div>
        <p style={{color:'#94a3b8',fontSize:15}}>Setting up your workspace...</p>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)',fontFamily:'Inter,sans-serif',color:'#f1f5f9'}}>

      {/* Header */}
      <div style={{background:'rgba(255,255,255,0.05)',backdropFilter:'blur(10px)',borderBottom:'1px solid rgba(255,255,255,0.1)',padding:'0 32px',height:68,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          <div style={{width:38,height:38,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:17}}>F</div>
          <div>
            <div style={{fontWeight:700,fontSize:16,color:'#f1f5f9'}}>Finance Solution Suite</div>
            <div style={{fontSize:11,color:'#64748b'}}>Workspace Setup</div>
          </div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>navigate('/dashboard',{state:{from:'workspace'}})} style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:8,color:'#fff',padding:'9px 20px',cursor:'pointer',fontWeight:600,fontSize:13}}>Go to Dashboard</button>
          <button onClick={()=>navigate(-1)} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:8,color:'#94a3b8',padding:'9px 16px',cursor:'pointer',fontSize:13}}>Cancel</button>
        </div>
      </div>

      {/* Progress Steps */}
      <div style={{padding:'24px 32px 0'}}>
        <div style={{maxWidth:600,margin:'0 auto',display:'flex',alignItems:'center'}}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:'auto'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:step>i+1?'#10b981':step===i+1?'#6366f1':'rgba(255,255,255,0.1)',border:step===i+1?'2px solid #818cf8':'none',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,flexShrink:0,boxShadow:step===i+1?'0 0 20px rgba(99,102,241,0.4)':'none'}}>
                  {step>i+1?'✓':i+1}
                </div>
                <span style={{fontSize:13,fontWeight:step===i+1?600:400,color:step===i+1?'#818cf8':step>i+1?'#10b981':'#475569'}}>{s}</span>
              </div>
              {i<STEPS.length-1 && <div style={{flex:1,height:1,background:step>i+1?'#10b981':'rgba(255,255,255,0.1)',margin:'0 16px'}}></div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:'28px 32px',maxWidth:900,margin:'0 auto'}}>

        {/* STEP 1: Select Modules */}
        {step===1 && (
          <div>
            <div style={{marginBottom:24}}>
              <h2 style={{color:'#f1f5f9',fontSize:22,fontWeight:700,margin:'0 0 8px'}}>Select Your Work Modules</h2>
              <p style={{color:'#64748b',fontSize:14,margin:0}}>Click on a domain to expand and select the modules you work with.</p>
            </div>

            <div style={{display:'flex',gap:12,marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'10px 16px',flex:1}}>
                <Search size={16} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search domains or modules..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:14,outline:'none',flex:1}}/>
              </div>
              {selectedModules.length > 0 && (
                <div style={{background:'rgba(99,102,241,0.2)',border:'1px solid rgba(99,102,241,0.4)',borderRadius:10,padding:'10px 18px',fontSize:13,color:'#818cf8',fontWeight:600,display:'flex',alignItems:'center'}}>
                  {selectedModules.length} selected
                </div>
              )}
            </div>

            <div style={{display:'grid',gap:10}}>
              {filteredGroups.map(([domain, data])=>{
                const domColor = data.color
                const selectedInDomain = data.modules.filter(m => selectedModules.find(sm => sm.module_name===m.module_name && sm.domain_id===m.domain_id))
                const isOpen = openDropdown === domain
                const allSelected = data.modules.every(m => selectedModules.find(sm => sm.module_name===m.module_name && sm.domain_id===m.domain_id))
                return (
                  <div key={domain} style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${selectedInDomain.length>0?domColor+'50':'rgba(255,255,255,0.1)'}`,borderRadius:12,overflow:'hidden',transition:'border-color 0.2s'}}>
                    <div onClick={()=>setOpenDropdown(isOpen?null:domain)} style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:isOpen?'rgba(255,255,255,0.07)':'transparent'}}>
                      <div style={{width:10,height:10,borderRadius:'50%',background:domColor,flexShrink:0,boxShadow:`0 0 8px ${domColor}80`}}></div>
                      <span style={{fontWeight:600,fontSize:14,color:'#f1f5f9',flex:1}}>{domain}</span>
                      <span style={{fontSize:12,color:'#475569'}}>{data.modules.length} modules</span>
                      {selectedInDomain.length > 0 && (
                        <span style={{background:domColor+'25',color:domColor,border:`1px solid ${domColor}40`,padding:'2px 10px',borderRadius:20,fontSize:12,fontWeight:600}}>{selectedInDomain.length} selected</span>
                      )}
                      {isOpen ? <ChevronUp size={16} style={{color:'#64748b'}}/> : <ChevronDown size={16} style={{color:'#64748b'}}/>}
                    </div>

                    {isOpen && (
                      <div style={{borderTop:'1px solid rgba(255,255,255,0.08)'}}>
                        <div onClick={()=>{
                          if(allSelected) {
                            const newMods = selectedModules.filter(sm => sm.domain_id !== data.modules[0].domain_id)
                            setSelectedModules(newMods)
                            const domIds = [...new Set(newMods.map(m=>m.domain_id))]
                            setSelectedDomains(domIds)
                            loadReports(domIds, newMods.map(m=>m.module_path).filter(p=>p&&p!=='/upload-data'))
                          } else {
                            const newMods = [...selectedModules, ...data.modules.filter(m => !selectedModules.find(sm => sm.module_name===m.module_name && sm.domain_id===m.domain_id))]
                            setSelectedModules(newMods)
                            const domIds = [...new Set(newMods.map(m=>m.domain_id))]
                            setSelectedDomains(domIds)
                            loadReports(domIds, newMods.map(m=>m.module_path).filter(p=>p&&p!=='/upload-data'))
                          }
                        }} style={{padding:'10px 18px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:'rgba(255,255,255,0.04)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                          <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${domColor}`,background:allSelected?domColor:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                            {allSelected && <span style={{color:'#fff',fontSize:10,fontWeight:700}}>✓</span>}
                          </div>
                          <span style={{fontSize:13,color:domColor,fontWeight:600}}>Select all in {domain}</span>
                        </div>
                        {data.modules.map(mod=>{
                          const isSelected = !!selectedModules.find(m=>m.module_name===mod.module_name&&m.domain_id===mod.domain_id)
                          return (
                            <div key={mod.module_path+mod.domain_id} onClick={()=>toggleModule(mod)} style={{padding:'11px 18px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:isSelected?`${domColor}12`:'transparent',borderBottom:'1px solid rgba(255,255,255,0.04)'}} onMouseEnter={e=>e.currentTarget.style.background=isSelected?`${domColor}18`:'rgba(255,255,255,0.04)'} onMouseLeave={e=>e.currentTarget.style.background=isSelected?`${domColor}12`:'transparent'}>
                              <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${isSelected?domColor:'rgba(255,255,255,0.2)'}`,background:isSelected?domColor:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                {isSelected && <span style={{color:'#fff',fontSize:10,fontWeight:700}}>✓</span>}
                              </div>
                              <span style={{fontSize:14,color:isSelected?'#f1f5f9':'#94a3b8',fontWeight:isSelected?500:400}}>{mod.module_name}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {selectedModules.length > 0 && (
              <div style={{marginTop:20,background:'rgba(99,102,241,0.1)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:12,padding:16}}>
                <div style={{fontSize:12,color:'#818cf8',marginBottom:10,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>Selected Modules</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {selectedModules.map(m=>(
                    <span key={m.module_name+m.domain_id} style={{background:'rgba(99,102,241,0.2)',color:'#818cf8',border:'1px solid rgba(99,102,241,0.3)',padding:'4px 12px',borderRadius:20,fontSize:12,display:'flex',alignItems:'center',gap:6}}>
                      {m.module_name}
                      <button onClick={(e)=>{e.stopPropagation();toggleModule(m)}} style={{background:'none',border:'none',color:'#818cf8',cursor:'pointer',padding:0,display:'flex',alignItems:'center'}}><X size={12}/></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{display:'flex',justifyContent:'flex-end',marginTop:24}}>
              <button onClick={()=>setStep(2)} disabled={selectedModules.length===0} style={{background:selectedModules.length===0?'rgba(99,102,241,0.3)':'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:10,color:'#fff',padding:'13px 32px',fontSize:14,fontWeight:700,cursor:selectedModules.length===0?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:10,boxShadow:selectedModules.length>0?'0 4px 20px rgba(99,102,241,0.3)':'none'}}>
                Continue <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Reports */}
        {step===2 && (
          <div>
            <div style={{marginBottom:24}}>
              <h2 style={{color:'#f1f5f9',fontSize:22,fontWeight:700,margin:'0 0 8px'}}>Choose Your Reports</h2>
              <p style={{color:'#64748b',fontSize:14,margin:0}}>Select reports filtered by your chosen modules. Click a domain to expand.</p>
            </div>

            <div style={{display:'flex',gap:12,marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'10px 16px',flex:1}}>
                <Search size={16} style={{color:'#64748b'}}/>
                <input value={reportSearch} onChange={e=>setReportSearch(e.target.value)} placeholder="Search reports..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:14,outline:'none',flex:1}}/>
              </div>
              <button onClick={()=>setSelectedReports(reports)} style={{background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:10,color:'#10b981',padding:'10px 18px',cursor:'pointer',fontSize:13,fontWeight:600}}>All ({reports.length})</button>
              <button onClick={()=>setSelectedReports([])} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,color:'#64748b',padding:'10px 16px',cursor:'pointer',fontSize:13}}>Clear</button>
              {selectedReports.length > 0 && <div style={{background:'rgba(99,102,241,0.2)',border:'1px solid rgba(99,102,241,0.4)',borderRadius:10,padding:'10px 16px',fontSize:13,color:'#818cf8',fontWeight:600,display:'flex',alignItems:'center'}}>{selectedReports.length}</div>}
            </div>

            {reports.length === 0 ? (
              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:60,textAlign:'center'}}>
                <div style={{fontSize:40,marginBottom:12}}>📊</div>
                <p style={{color:'#64748b'}}>No reports found. Try selecting different modules.</p>
              </div>
            ) : (
              <div style={{display:'grid',gap:10}}>
                {filteredReportGroups.map(({domain, domain_id, reports: domReports})=>{
                  const domColor = DOMAIN_COLORS[domain]||'#6b7280'
                  const allSelected = domReports.every(r=>selectedReports.find(sr=>sr.report_id===r.report_id))
                  const someSelected = domReports.some(r=>selectedReports.find(sr=>sr.report_id===r.report_id))
                  const isOpen = openReportDomain === domain
                  const selCount = domReports.filter(r=>selectedReports.find(sr=>sr.report_id===r.report_id)).length
                  return (
                    <div key={domain} style={{background:'rgba(255,255,255,0.05)',border:`1px solid ${selCount>0?domColor+'50':'rgba(255,255,255,0.1)'}`,borderRadius:12,overflow:'hidden'}}>
                      <div onClick={()=>setOpenReportDomain(isOpen?null:domain)} style={{padding:'14px 18px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:isOpen?'rgba(255,255,255,0.07)':'transparent'}}>
                        <button onClick={e=>{e.stopPropagation();selectAllInDomain(domain)}} style={{width:20,height:20,borderRadius:4,border:`2px solid ${allSelected?domColor:someSelected?domColor:' rgba(255,255,255,0.2)'}`,background:allSelected?domColor:'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,padding:0}}>
                          {allSelected&&<span style={{color:'#fff',fontSize:10,fontWeight:700}}>✓</span>}
                          {someSelected&&!allSelected&&<span style={{color:domColor,fontSize:12,fontWeight:700}}>-</span>}
                        </button>
                        <div style={{width:8,height:8,borderRadius:'50%',background:domColor,flexShrink:0}}></div>
                        <span style={{fontWeight:600,fontSize:14,color:'#f1f5f9',flex:1}}>{domain}</span>
                        <span style={{fontSize:12,color:'#64748b'}}>{selCount}/{domReports.length}</span>
                        {isOpen?<ChevronUp size={16} style={{color:'#64748b'}}/>:<ChevronDown size={16} style={{color:'#64748b'}}/>}
                      </div>
                      {isOpen && (
                        <div style={{borderTop:'1px solid rgba(255,255,255,0.08)',maxHeight:280,overflowY:'auto'}}>
                          {domReports.map(report=>{
                            const isSelected = !!selectedReports.find(r=>r.report_id===report.report_id)
                            return (
                              <div key={report.report_id} onClick={()=>toggleReport(report)} style={{padding:'10px 18px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:isSelected?`${domColor}12`:'transparent',borderBottom:'1px solid rgba(255,255,255,0.04)'}} onMouseEnter={e=>e.currentTarget.style.background=isSelected?`${domColor}18`:'rgba(255,255,255,0.04)'} onMouseLeave={e=>e.currentTarget.style.background=isSelected?`${domColor}12`:'transparent'}>
                                <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${isSelected?domColor:'rgba(255,255,255,0.2)'}`,background:isSelected?domColor:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                  {isSelected&&<span style={{color:'#fff',fontSize:10,fontWeight:700}}>✓</span>}
                                </div>
                                <div style={{flex:1}}>
                                  <div style={{fontSize:13,color:isSelected?'#f1f5f9':'#94a3b8',fontWeight:isSelected?500:400}}>{report.name}</div>
                                  {report.report_category&&<div style={{fontSize:11,color:'#475569'}}>{report.report_category} · {report.frequency}</div>}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{display:'flex',justifyContent:'space-between',marginTop:24}}>
              <button onClick={()=>setStep(1)} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,color:'#94a3b8',padding:'13px 24px',fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}><ArrowLeft size={16}/> Back</button>
              <button onClick={()=>setStep(3)} disabled={selectedReports.length===0} style={{background:selectedReports.length===0?'rgba(99,102,241,0.3)':'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:10,color:'#fff',padding:'13px 32px',fontSize:14,fontWeight:700,cursor:selectedReports.length===0?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:10,boxShadow:selectedReports.length>0?'0 4px 20px rgba(99,102,241,0.3)':'none'}}>
                Review <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm */}
        {step===3 && (
          <div>
            <div style={{marginBottom:24}}>
              <h2 style={{color:'#f1f5f9',fontSize:22,fontWeight:700,margin:'0 0 8px'}}>Review Your Workspace</h2>
              <p style={{color:'#64748b',fontSize:14,margin:0}}>Confirm your selections before launching.</p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>Modules</h3>
                  <span style={{background:'rgba(99,102,241,0.2)',color:'#818cf8',padding:'2px 10px',borderRadius:20,fontSize:12,fontWeight:600}}>{selectedModules.length}</span>
                </div>
                <div style={{display:'grid',gap:6}}>
                  {selectedModules.map(m=>(
                    <div key={m.module_name+m.domain_id} style={{background:'rgba(255,255,255,0.05)',borderRadius:8,padding:'8px 12px',fontSize:13,color:'#94a3b8',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span>{m.module_name}</span>
                      <span style={{fontSize:11,color:DOMAIN_COLORS[m.domain_name]||'#6b7280'}}>{m.domain_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>Reports</h3>
                  <span style={{background:'rgba(99,102,241,0.2)',color:'#818cf8',padding:'2px 10px',borderRadius:20,fontSize:12,fontWeight:600}}>{selectedReports.length}</span>
                </div>
                <div style={{maxHeight:260,overflowY:'auto',display:'grid',gap:4}}>
                  {selectedReports.map(r=>(
                    <div key={r.report_id} style={{background:'rgba(255,255,255,0.05)',borderRadius:8,padding:'7px 12px',fontSize:12,color:'#94a3b8',display:'flex',justifyContent:'space-between',gap:8}}>
                      <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.name}</span>
                      <span style={{fontSize:10,color:DOMAIN_COLORS[r.domain_name]||'#6b7280',flexShrink:0}}>{r.domain_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{background:'rgba(16,185,129,0.1)',border:'1px solid rgba(16,185,129,0.25)',borderRadius:12,padding:20,marginBottom:24,display:'flex',gap:16,alignItems:'center'}}>
              <CheckCircle size={28} style={{color:'#10b981',flexShrink:0}}/>
              <div>
                <div style={{color:'#10b981',fontWeight:700,fontSize:15,marginBottom:4}}>Ready to launch your workspace!</div>
                <div style={{color:'#64748b',fontSize:13}}>{selectedModules.length} modules · {selectedDomains.length} domains · {selectedReports.length} reports</div>
              </div>
            </div>

            <div style={{display:'flex',justifyContent:'space-between'}}>
              <button onClick={()=>setStep(2)} style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,color:'#94a3b8',padding:'13px 24px',fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}><ArrowLeft size={16}/> Back</button>
              <button onClick={handleSave} disabled={saving} style={{background:saving?'rgba(99,102,241,0.4)':'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:10,color:'#fff',padding:'13px 36px',fontSize:14,fontWeight:700,cursor:saving?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 24px rgba(99,102,241,0.4)'}}>
                {saving ? 'Launching...' : 'Launch Workspace'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}