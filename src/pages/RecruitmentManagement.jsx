import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { UserPlus, ArrowLeft, Plus, X, Briefcase, Users, ChevronRight } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/recruitment-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const JOB_TYPES = ['Full-Time','Part-Time','Contract','Internship','Freelance']
const APP_STAGES = ['Applied','Resume Reviewed','Technical Test','Interview Scheduled','Final Interview','Offer Extended','Hired','Rejected']
const STAGE_COLORS = { Applied:'#64748b','Resume Reviewed':'#3b82f6','Technical Test':'#8b5cf6','Interview Scheduled':'#f59e0b','Final Interview':'#f97316','Offer Extended':'#10b981',Hired:'#059669',Rejected:'#ef4444' }

export default function RecruitmentManagement() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState('jobs')
  const [selectedJob, setSelectedJob] = useState(null)
  const [search, setSearch] = useState('')
  const [showJobForm, setShowJobForm] = useState(false)
  const [showAppForm, setShowAppForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [jobForm, setJobForm] = useState({job_title:'',department:'IT',location:'',job_type:'Full-Time',experience:'',salary_range:'',openings:1,closing_date:'',description:''})
  const [appForm, setAppForm] = useState({job_id:'',candidate_name:'',email:'',phone:'',experience_years:0,current_company:'',notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [jRes, aRes, sRes] = await Promise.all([
        fetch(API+'/jobs', {headers:getHeaders()}),
        fetch(API+'/applications', {headers:getHeaders()}),
        fetch(API+'/stats', {headers:getHeaders()})
      ])
      const [j, a, s] = await Promise.all([jRes.json(), aRes.json(), sRes.json()])
      setJobs(j.data||[]); setApplications(a.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleSaveJob = async () => {
    const res = await fetch(API+'/jobs', {method:'POST', headers:getHeaders(), body:JSON.stringify(jobForm)})
    const data = await res.json()
    if(data.status==='success') { showToast('Job posted!'); setShowJobForm(false); load() }
    else showToast(data.message,'error')
  }

  const handleSaveApp = async () => {
    const res = await fetch(API+'/applications', {method:'POST', headers:getHeaders(), body:JSON.stringify(appForm)})
    const data = await res.json()
    if(data.status==='success') { showToast('Application added!'); setShowAppForm(false); load() }
    else showToast(data.message,'error')
  }

  const handleUpdateStatus = async (id, status) => {
    await fetch(API+'/applications/'+id+'/status', {method:'PUT', headers:getHeaders(), body:JSON.stringify({status})})
    showToast('Status updated!'); load()
  }

  const filteredJobs = jobs.filter(j => (j.job_title+j.department+j.location).toLowerCase().includes(search.toLowerCase()))
  const jobApps = selectedJob ? applications.filter(a => a.job_id === selectedJob.job_id) : []
  const pipeline = APP_STAGES.map(stage => ({ stage, count: applications.filter(a => a.status === stage).length })).filter(s => s.count > 0)

  const exportCSV = () => { const rows = [['Candidate','Position','Dept','Stage','Applied','Status'],...(candidates||[]).map(c=>[c.candidate_name||'',c.position||'',c.department||'',c.stage||'',c.applied_date||'',c.status||''])]; const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='recruitment.csv'; el.click() }
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>selectedJob?setSelectedJob(null):navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> {selectedJob?'Jobs':'Back'}</button>
        <UserPlus size={28} style={{color:'#8b5cf6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>{selectedJob?selectedJob.job_title:'Recruitment Management'}</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>{selectedJob?`${selectedJob.department} • ${selectedJob.location}`:'Manage job postings and candidate pipeline'}</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          {selectedJob && <button onClick={()=>{setShowAppForm(true);setAppForm({...appForm,job_id:selectedJob.job_id})}} style={{display:'flex',alignItems:'center',gap:6,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Candidate</button>}
          {!selectedJob && <button onClick={()=>setShowJobForm(true)} style={{display:'flex',alignItems:'center',gap:6,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Post Job</button>}
        </div>
      </div>

      <div style={{padding:24}}>
        {!selectedJob && stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Jobs', value:stats.totalJobs, color:'#8b5cf6'},
              {label:'Open Positions', value:stats.openJobs, color:'#10b981'},
              {label:'Total Applications', value:stats.totalApplications, color:'#3b82f6'},
              {label:'Pipeline Stages', value:stats.byStatus?.length||0, color:'#f59e0b'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {!selectedJob && pipeline.length > 0 && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:20}}>
            <h3 style={{color:'#f1f5f9',marginBottom:16,fontSize:14}}>Recruitment Pipeline</h3>
            <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
              {pipeline.map((p,i)=>(
                <div key={p.stage} style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{background:STAGE_COLORS[p.stage]+'20',border:`1px solid ${STAGE_COLORS[p.stage]}40`,borderRadius:8,padding:'10px 14px',textAlign:'center'}}>
                    <div style={{fontSize:18,fontWeight:700,color:STAGE_COLORS[p.stage]}}>{p.count}</div>
                    <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{p.stage}</div>
                  </div>
                  {i < pipeline.length-1 && <ChevronRight size={16} style={{color:'#334155'}}/>}
                </div>
              ))}
            </div>
          </div>
        )}

        {!selectedJob && (
          <div>
            <div style={{display:'flex',gap:4,marginBottom:16,background:'#1e293b',padding:4,borderRadius:10,width:'fit-content'}}>
              {[['jobs','Job Postings'],['pipeline','All Applications']].map(([id,label])=>(
                <button key={id} onClick={()=>setTab(id)} style={{padding:'8px 20px',borderRadius:8,border:'none',background:tab===id?'#8b5cf6':'transparent',color:tab===id?'#fff':'#64748b',cursor:'pointer',fontWeight:600,fontSize:13}}>{label}</button>
              ))}
            </div>

            {tab==='jobs' && (
              <div>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search jobs..." style={{width:'100%',background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'10px 14px',fontSize:13,marginBottom:16,boxSizing:'border-box'}}/>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
                  {filteredJobs.map(j=>(
                    <div key={j.job_id} onClick={()=>setSelectedJob(j)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,cursor:'pointer',transition:'border-color 0.2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#8b5cf6'} onMouseLeave={e=>e.currentTarget.style.borderColor='#334155'}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                        <Briefcase size={20} style={{color:'#8b5cf6'}}/>
                        <span style={{background:j.status==='Open'?'#10b98120':'#ef444420',color:j.status==='Open'?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11}}>{j.status}</span>
                      </div>
                      <div style={{color:'#f1f5f9',fontWeight:700,fontSize:15,marginBottom:4}}>{j.job_title}</div>
                      <div style={{color:'#64748b',fontSize:12,marginBottom:10}}>{j.department} • {j.location} • {j.job_type}</div>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:12,marginBottom:10}}>
                        <div><span style={{color:'#64748b'}}>Exp: </span><span style={{color:'#94a3b8'}}>{j.experience}</span></div>
                        <div><span style={{color:'#64748b'}}>Openings: </span><span style={{color:'#3b82f6',fontWeight:600}}>{j.openings}</span></div>
                        <div><span style={{color:'#64748b'}}>Salary: </span><span style={{color:'#10b981'}}>{j.salary_range}</span></div>
                        <div><span style={{color:'#64748b'}}>Applied: </span><span style={{color:'#f59e0b',fontWeight:600}}>{j.applications}</span></div>
                      </div>
                      <div style={{fontSize:11,color:'#64748b'}}>Closes: {j.closing_date?.slice(0,10)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab==='pipeline' && (
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{borderBottom:'1px solid #334155'}}>{['Candidate','Job','Company','Experience','Status','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
                  <tbody>
                    {applications.map(a=>(
                      <tr key={a.application_id} style={{borderBottom:'1px solid #0f172a'}}>
                        <td style={{padding:'10px 8px'}}>
                          <div style={{color:'#f1f5f9',fontWeight:600,fontSize:13}}>{a.candidate_name}</div>
                          <div style={{color:'#64748b',fontSize:11}}>{a.email}</div>
                        </td>
                        <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{a.job_title}</td>
                        <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{a.current_company}</td>
                        <td style={{padding:'10px 8px',color:'#3b82f6',fontSize:12}}>{a.experience_years} yrs</td>
                        <td style={{padding:'10px 8px'}}>
                          <span style={{background:(STAGE_COLORS[a.status]||'#64748b')+'20',color:STAGE_COLORS[a.status]||'#64748b',padding:'2px 8px',borderRadius:20,fontSize:11}}>{a.status}</span>
                        </td>
                        <td style={{padding:'10px 8px'}}>
                          <select onChange={e=>handleUpdateStatus(a.application_id,e.target.value)} value={a.status} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#f1f5f9',padding:'4px 8px',fontSize:11,cursor:'pointer'}}>
                            {APP_STAGES.map(s=><option key={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {selectedJob && (
          <div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,marginBottom:20,display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12}}>
              {[['Type',selectedJob.job_type],['Experience',selectedJob.experience],['Salary',selectedJob.salary_range],['Openings',selectedJob.openings],['Closes',selectedJob.closing_date?.slice(0,10)]].map(([l,v],i)=>(
                <div key={i}><div style={{fontSize:10,color:'#64748b',marginBottom:4}}>{l}</div><div style={{fontSize:13,color:'#f1f5f9',fontWeight:600}}>{v}</div></div>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:20}}>
              {APP_STAGES.map(stage=>{
                const count = jobApps.filter(a=>a.status===stage).length
                const exportCSV = () => { const rows = [['Candidate','Position','Dept','Stage','Applied','Status'],...(candidates||[]).map(c=>[c.candidate_name||'',c.position||'',c.department||'',c.stage||'',c.applied_date||'',c.status||''])]; const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='recruitment.csv'; el.click() }
  return (
                  <div key={stage} style={{background:'#1e293b',borderRadius:8,padding:10,textAlign:'center',border:`1px solid ${count>0?STAGE_COLORS[stage]+'40':'#334155'}`}}>
                    <div style={{fontSize:18,fontWeight:700,color:count>0?STAGE_COLORS[stage]:'#334155'}}>{count}</div>
                    <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{stage}</div>
                  </div>
                )
              })}
            </div>

            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14}}>Candidates ({jobApps.length})</h3>
              {jobApps.length===0 ? <div style={{textAlign:'center',padding:40,color:'#64748b'}}>No applications yet</div> : (
                <div style={{display:'grid',gap:10}}>
                  {jobApps.map(a=>(
                    <div key={a.application_id} style={{background:'#0f172a',borderRadius:10,padding:16,display:'flex',alignItems:'center',gap:16}}>
                      <div style={{width:40,height:40,borderRadius:'50%',background:'#8b5cf620',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:'#8b5cf6',flexShrink:0}}>{a.candidate_name?.charAt(0)}</div>
                      <div style={{flex:1}}>
                        <div style={{color:'#f1f5f9',fontWeight:600,fontSize:14}}>{a.candidate_name}</div>
                        <div style={{color:'#64748b',fontSize:12}}>{a.email} • {a.current_company} • {a.experience_years} yrs exp</div>
                        {a.interview_date && <div style={{color:'#f59e0b',fontSize:11,marginTop:2}}>Interview: {a.interview_date?.slice(0,10)}</div>}
                      </div>
                      <select onChange={e=>handleUpdateStatus(a.application_id,e.target.value)} value={a.status} style={{background:'#1e293b',border:`1px solid ${STAGE_COLORS[a.status]||'#334155'}`,borderRadius:8,color:STAGE_COLORS[a.status]||'#94a3b8',padding:'6px 12px',fontSize:12,cursor:'pointer',fontWeight:600}}>
                        {APP_STAGES.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showJobForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowJobForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>Post New Job</h2><button onClick={()=>setShowJobForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['job_title','Job Title'],['location','Location'],['experience','Experience Required'],['salary_range','Salary Range'],['openings','No. of Openings','number'],['closing_date','Closing Date','date']].map(([key,label,type='text'])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={jobForm[key]||''} onChange={e=>setJobForm({...jobForm,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={jobForm.department} onChange={e=>setJobForm({...jobForm,department:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Job Type</label><select value={jobForm.job_type} onChange={e=>setJobForm({...jobForm,job_type:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{JOB_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Job Description</label><textarea value={jobForm.description||''} onChange={e=>setJobForm({...jobForm,description:e.target.value})} rows={3} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowJobForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSaveJob} style={{flex:2,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Post Job</button>
            </div>
          </div>
        </div>
      )}

      {showAppForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowAppForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:460}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>Add Candidate</h2><button onClick={()=>setShowAppForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['candidate_name','Full Name'],['email','Email'],['phone','Phone'],['current_company','Current Company'],['experience_years','Years of Experience','number']].map(([key,label,type='text'])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={appForm[key]||''} onChange={e=>setAppForm({...appForm,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><textarea value={appForm.notes||''} onChange={e=>setAppForm({...appForm,notes:e.target.value})} rows={2} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowAppForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSaveApp} style={{flex:2,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Add Candidate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}