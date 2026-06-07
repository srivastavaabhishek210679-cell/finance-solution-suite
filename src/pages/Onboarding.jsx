import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Search, ChevronDown, ChevronUp, CheckCircle, ArrowRight, ArrowLeft, X } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

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
    let newModules
    if(exists) {
      newModules = selectedModules.filter(m => !(m.module_name === mod.module_name && m.domain_id === mod.domain_id))
    } else {
      newModules = [...selectedModules, mod]
    }
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

  // Group modules by domain
  const groupedModules = modules.reduce((acc, mod) => {
    const key = mod.domain_name
    if(!acc[key]) acc[key] = { color: mod.domain_color, modules: [] }
    acc[key].modules.push(mod)
    return acc
  }, {})

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

  const filteredReportGroups = Object.entries(groupedReports).map(([domain, data]) => ({
    domain, domain_id: data.domain_id,
    reports: data.reports.filter(r => !reportSearch || r.name.toLowerCase().includes(reportSearch.toLowerCase()))
  })).filter(d => d.reports.length > 0)

  const STEPS = ['Select Modules', 'Choose Reports', 'Confirm & Launch']

  const inputStyle = { width:'100%', background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8, color:'#1e293b', padding:'10px 14px', fontSize:14, boxSizing:'border-box', outline:'none' }

  if(loading) return (
    <div style={{minHeight:'100vh',background:'#f1f5f9',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Inter,sans-serif'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:48,height:48,border:'3px solid #e2e8f0',borderTop:'3px solid #6366f1',borderRadius:'50%',margin:'0 auto 16px',animation:'spin 1s linear infinite'}}></div>
        <p style={{color:'#64748b'}}>Loading workspace setup...</p>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#f1f5f9',fontFamily:'Inter,sans-serif',color:'#1e293b'}}>
      {/* Top Header */}
      <div style={{background:'#ffffff',borderBottom:'1px solid #e2e8f0',padding:'0 32px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between',boxShadow:'0 1px 3px rgba(0,0,0,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:16}}>F</div>
          <span style={{fontWeight:700,fontSize:16,color:'#1e293b'}}>Finance Solution Suite</span>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>navigate('/dashboard',{state:{from:'workspace'}})} style={{background:'#6366f1',border:'none',borderRadius:8,color:'#fff',padding:'8px 18px',cursor:'pointer',fontWeight:600,fontSize:13}}>Go to Dashboard</button>
          <button onClick={()=>navigate(-1)} style={{background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:8,color:'#64748b',padding:'8px 16px',cursor:'pointer',fontSize:13}}>Cancel</button>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{background:'#ffffff',borderBottom:'1px solid #e2e8f0',padding:'16px 32px'}}>
        <div style={{maxWidth:700,margin:'0 auto',display:'flex',alignItems:'center',gap:0}}>
          {STEPS.map((s,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',flex:i<STEPS.length-1?1:'auto'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:32,height:32,borderRadius:'50%',background:step>i+1?'#6366f1':step===i+1?'#6366f1':'#e2e8f0',color:step>=i+1?'#fff':'#94a3b8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,flexShrink:0}}>
                  {step>i+1?'✓':i+1}
                </div>
                <span style={{fontSize:13,fontWeight:step===i+1?600:400,color:step>=i+1?'#6366f1':'#94a3b8',whiteSpace:'nowrap'}}>{s}</span>
              </div>
              {i<STEPS.length-1 && <div style={{flex:1,height:2,background:step>i+1?'#6366f1':'#e2e8f0',margin:'0 16px'}}></div>}
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:'32px',maxWidth:900,margin:'0 auto'}}>

        {/* STEP 1: Select Modules */}
        {step===1 && (
          <div>
            <div style={{marginBottom:28}}>
              <h2 style={{color:'#1e293b',fontSize:24,fontWeight:700,margin:'0 0 8px'}}>Select Your Work Modules</h2>
              <p style={{color:'#64748b',fontSize:15,margin:0}}>Choose the departments and modules you work with. Use the dropdown to select modules under each domain.</p>
            </div>

            <div style={{display:'flex',gap:12,marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,padding:'10px 14px',flex:1,boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
                <Search size={16} style={{color:'#94a3b8'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search domains or modules..." style={{background:'none',border:'none',color:'#1e293b',fontSize:14,outline:'none',flex:1}}/>
              </div>
              <div style={{background:'#6366f120',border:'1px solid #6366f140',borderRadius:8,padding:'10px 16px',fontSize:13,color:'#6366f1',fontWeight:600}}>
                {selectedModules.length} selected
              </div>
            </div>

            <div style={{display:'grid',gap:12}}>
              {filteredGroups.map(([domain, data])=>{
                const selectedInDomain = data.modules.filter(m => selectedModules.find(sm => sm.module_name===m.module_name && sm.domain_id===m.domain_id))
                const isOpen = openDropdown === domain
                return (
                  <div key={domain} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
                    {/* Domain Header - Click to open dropdown */}
                    <div onClick={()=>setOpenDropdown(isOpen?null:domain)} style={{padding:'14px 20px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:isOpen?'#f8fafc':'#ffffff',userSelect:'none'}}>
                      <div style={{width:12,height:12,borderRadius:'50%',background:data.color,flexShrink:0}}></div>
                      <span style={{fontWeight:600,fontSize:14,color:'#1e293b',flex:1}}>{domain}</span>
                      <span style={{fontSize:12,color:'#64748b'}}>{data.modules.length} modules</span>
                      {selectedInDomain.length > 0 && (
                        <span style={{background:'#6366f120',color:'#6366f1',padding:'2px 10px',borderRadius:20,fontSize:12,fontWeight:600}}>{selectedInDomain.length} selected</span>
                      )}
                      {isOpen ? <ChevronUp size={16} style={{color:'#64748b'}}/> : <ChevronDown size={16} style={{color:'#64748b'}}/>}
                    </div>

                    {/* Dropdown Module List */}
                    {isOpen && (
                      <div style={{borderTop:'1px solid #f1f5f9',padding:'8px 0'}}>
                        {/* Select All option */}
                        <div onClick={()=>{
                          const allSelected = data.modules.every(m => selectedModules.find(sm => sm.module_name===m.module_name && sm.domain_id===m.domain_id))
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
                        }} style={{padding:'10px 20px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:'#f8fafc',borderBottom:'1px solid #f1f5f9'}}>
                          <div style={{width:18,height:18,borderRadius:4,border:'2px solid #6366f1',background:data.modules.every(m=>selectedModules.find(sm=>sm.module_name===m.module_name&&sm.domain_id===m.domain_id))?'#6366f1':'transparent',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            {data.modules.every(m=>selectedModules.find(sm=>sm.module_name===m.module_name&&sm.domain_id===m.domain_id)) && <span style={{color:'#fff',fontSize:11}}>✓</span>}
                          </div>
                          <span style={{fontSize:13,color:'#6366f1',fontWeight:600}}>Select All in {domain}</span>
                        </div>
                        {data.modules.map(mod=>{
                          const isSelected = !!selectedModules.find(m=>m.module_name===mod.module_name&&m.domain_id===mod.domain_id)
                          return (
                            <div key={mod.module_path+mod.domain_id} onClick={()=>toggleModule(mod)} style={{padding:'10px 20px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:isSelected?'#6366f108':'transparent'}} onMouseEnter={e=>e.currentTarget.style.background=isSelected?'#6366f110':'#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background=isSelected?'#6366f108':'transparent'}>
                              <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${isSelected?'#6366f1':'#cbd5e1'}`,background:isSelected?'#6366f1':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                {isSelected && <span style={{color:'#fff',fontSize:11}}>✓</span>}
                              </div>
                              <span style={{fontSize:14,color:isSelected?'#6366f1':'#475569',fontWeight:isSelected?500:400}}>{mod.module_name}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Selected Modules Summary */}
            {selectedModules.length > 0 && (
              <div style={{marginTop:20,background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:16,boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
                <div style={{fontSize:13,color:'#64748b',marginBottom:10,fontWeight:600}}>SELECTED MODULES</div>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {selectedModules.map(m=>(
                    <span key={m.module_name+m.domain_id} style={{background:'#6366f115',color:'#6366f1',border:'1px solid #6366f130',padding:'4px 12px',borderRadius:20,fontSize:12,display:'flex',alignItems:'center',gap:6}}>
                      {m.module_name}
                      <button onClick={()=>toggleModule(m)} style={{background:'none',border:'none',color:'#6366f1',cursor:'pointer',padding:0,display:'flex',alignItems:'center'}}><X size={12}/></button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{display:'flex',justifyContent:'flex-end',marginTop:24}}>
              <button onClick={()=>setStep(2)} disabled={selectedModules.length===0} style={{background:'#6366f1',border:'none',borderRadius:10,color:'#fff',padding:'12px 32px',fontSize:14,fontWeight:700,cursor:selectedModules.length===0?'not-allowed':'pointer',opacity:selectedModules.length===0?0.5:1,display:'flex',alignItems:'center',gap:8}}>
                Continue to Reports <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Reports */}
        {step===2 && (
          <div>
            <div style={{marginBottom:28}}>
              <h2 style={{color:'#1e293b',fontSize:24,fontWeight:700,margin:'0 0 8px'}}>Choose Your Reports</h2>
              <p style={{color:'#64748b',fontSize:15,margin:0}}>Select which reports you want to work with. Reports are filtered based on your selected modules.</p>
            </div>

            <div style={{display:'flex',gap:12,marginBottom:20}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,padding:'10px 14px',flex:1,boxShadow:'0 1px 2px rgba(0,0,0,0.05)'}}>
                <Search size={16} style={{color:'#94a3b8'}}/>
                <input value={reportSearch} onChange={e=>setReportSearch(e.target.value)} placeholder="Search reports..." style={{background:'none',border:'none',color:'#1e293b',fontSize:14,outline:'none',flex:1}}/>
              </div>
              <button onClick={()=>setSelectedReports(reports)} style={{background:'#6366f1',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontSize:13,fontWeight:600}}>Select All ({reports.length})</button>
              <button onClick={()=>setSelectedReports([])} style={{background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:8,color:'#64748b',padding:'10px 16px',cursor:'pointer',fontSize:13}}>Clear</button>
              <div style={{background:'#6366f120',border:'1px solid #6366f140',borderRadius:8,padding:'10px 16px',fontSize:13,color:'#6366f1',fontWeight:600}}>
                {selectedReports.length} selected
              </div>
            </div>

            {reports.length === 0 ? (
              <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:60,textAlign:'center'}}>
                <div style={{fontSize:48,marginBottom:12}}>📊</div>
                <p style={{color:'#64748b'}}>No reports found for selected modules. Try selecting different modules.</p>
              </div>
            ) : (
              <div style={{display:'grid',gap:10}}>
                {filteredReportGroups.map(({domain, domain_id, reports: domReports})=>{
                  const allSelected = domReports.every(r=>selectedReports.find(sr=>sr.report_id===r.report_id))
                  const someSelected = domReports.some(r=>selectedReports.find(sr=>sr.report_id===r.report_id))
                  const isOpen = openReportDomain === domain
                  return (
                    <div key={domain} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,overflow:'hidden',boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
                      <div onClick={()=>setOpenReportDomain(isOpen?null:domain)} style={{padding:'14px 20px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:isOpen?'#f8fafc':'#ffffff'}}>
                        <button onClick={e=>{e.stopPropagation();selectAllInDomain(domain)}} style={{width:20,height:20,borderRadius:4,border:`2px solid ${allSelected?'#6366f1':someSelected?'#8b5cf6':'#cbd5e1'}`,background:allSelected?'#6366f1':someSelected?'#8b5cf620':'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,padding:0}}>
                          {allSelected && <span style={{color:'#fff',fontSize:10}}>✓</span>}
                          {someSelected && !allSelected && <span style={{color:'#8b5cf6',fontSize:10}}>-</span>}
                        </button>
                        <span style={{fontWeight:600,fontSize:14,color:'#1e293b',flex:1}}>{domain}</span>
                        <span style={{fontSize:12,color:'#64748b'}}>{domReports.filter(r=>selectedReports.find(sr=>sr.report_id===r.report_id)).length}/{domReports.length} selected</span>
                        {isOpen ? <ChevronUp size={16} style={{color:'#64748b'}}/> : <ChevronDown size={16} style={{color:'#64748b'}}/>}
                      </div>
                      {isOpen && (
                        <div style={{borderTop:'1px solid #f1f5f9',padding:'8px 0',maxHeight:280,overflowY:'auto'}}>
                          {domReports.map(report=>{
                            const isSelected = !!selectedReports.find(r=>r.report_id===report.report_id)
                            return (
                              <div key={report.report_id} onClick={()=>toggleReport(report)} style={{padding:'10px 20px',display:'flex',alignItems:'center',gap:12,cursor:'pointer',background:isSelected?'#6366f108':'transparent'}} onMouseEnter={e=>e.currentTarget.style.background=isSelected?'#6366f110':'#f8fafc'} onMouseLeave={e=>e.currentTarget.style.background=isSelected?'#6366f108':'transparent'}>
                                <div style={{width:18,height:18,borderRadius:4,border:`2px solid ${isSelected?'#6366f1':'#cbd5e1'}`,background:isSelected?'#6366f1':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                  {isSelected && <span style={{color:'#fff',fontSize:11}}>✓</span>}
                                </div>
                                <div style={{flex:1}}>
                                  <div style={{fontSize:13,color:isSelected?'#6366f1':'#475569',fontWeight:isSelected?500:400}}>{report.name}</div>
                                  {report.report_category && <div style={{fontSize:11,color:'#94a3b8'}}>{report.report_category} • {report.frequency}</div>}
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
              <button onClick={()=>setStep(1)} style={{background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:10,color:'#64748b',padding:'12px 24px',fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}><ArrowLeft size={16}/> Back</button>
              <button onClick={()=>setStep(3)} disabled={selectedReports.length===0} style={{background:'#6366f1',border:'none',borderRadius:10,color:'#fff',padding:'12px 32px',fontSize:14,fontWeight:700,cursor:selectedReports.length===0?'not-allowed':'pointer',opacity:selectedReports.length===0?0.5:1,display:'flex',alignItems:'center',gap:8}}>
                Review & Confirm <ArrowRight size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Confirm */}
        {step===3 && (
          <div>
            <div style={{marginBottom:28}}>
              <h2 style={{color:'#1e293b',fontSize:24,fontWeight:700,margin:'0 0 8px'}}>Review Your Workspace</h2>
              <p style={{color:'#64748b',fontSize:15,margin:0}}>Confirm your selections before launching your personalized workspace.</p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
              <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <h3 style={{color:'#1e293b',margin:0,fontSize:14,fontWeight:600}}>Selected Modules</h3>
                  <span style={{background:'#6366f120',color:'#6366f1',padding:'2px 10px',borderRadius:20,fontSize:12,fontWeight:600}}>{selectedModules.length}</span>
                </div>
                <div style={{display:'grid',gap:6}}>
                  {selectedModules.map(m=>(
                    <div key={m.module_name+m.domain_id} style={{background:'#f8fafc',borderRadius:8,padding:'8px 12px',fontSize:13,color:'#475569',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span>{m.module_name}</span>
                      <span style={{fontSize:11,color:'#6366f1',background:'#6366f110',padding:'2px 8px',borderRadius:10}}>{m.domain_name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,boxShadow:'0 1px 3px rgba(0,0,0,0.05)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <h3 style={{color:'#1e293b',margin:0,fontSize:14,fontWeight:600}}>Selected Reports</h3>
                  <span style={{background:'#6366f120',color:'#6366f1',padding:'2px 10px',borderRadius:20,fontSize:12,fontWeight:600}}>{selectedReports.length}</span>
                </div>
                <div style={{maxHeight:280,overflowY:'auto',display:'grid',gap:4}}>
                  {selectedReports.map(r=>(
                    <div key={r.report_id} style={{background:'#f8fafc',borderRadius:8,padding:'8px 12px',fontSize:12,color:'#475569',display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                      <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.name}</span>
                      <span style={{fontSize:10,color:'#6366f1',flexShrink:0}}>{r.domain_name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{background:'#6366f110',border:'1px solid #6366f130',borderRadius:12,padding:20,marginBottom:24,display:'flex',gap:16,alignItems:'center'}}>
              <CheckCircle size={28} style={{color:'#6366f1',flexShrink:0}}/>
              <div>
                <div style={{color:'#6366f1',fontWeight:700,fontSize:15,marginBottom:4}}>Ready to launch!</div>
                <div style={{color:'#64748b',fontSize:13}}>{selectedModules.length} modules • {selectedDomains.length} domains • {selectedReports.length} reports selected</div>
              </div>
            </div>

            <div style={{display:'flex',justifyContent:'space-between'}}>
              <button onClick={()=>setStep(2)} style={{background:'#f1f5f9',border:'1px solid #e2e8f0',borderRadius:10,color:'#64748b',padding:'12px 24px',fontSize:14,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}><ArrowLeft size={16}/> Back</button>
              <button onClick={handleSave} disabled={saving} style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)',border:'none',borderRadius:10,color:'#fff',padding:'12px 32px',fontSize:14,fontWeight:700,cursor:saving?'not-allowed':'pointer',opacity:saving?0.6:1,display:'flex',alignItems:'center',gap:8}}>
                {saving ? 'Setting up...' : 'Launch My Workspace'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}