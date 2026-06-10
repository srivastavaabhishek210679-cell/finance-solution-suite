import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, RefreshCw, Search, Download, Users, Briefcase, CheckCircle } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/recruitment'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const STAGES = ['Applied','Screening','Interview','Technical','HR Round','Offer','Hired','Rejected']
const STATUS_COLOR = { Applied:'#3b82f6', Screening:'#f59e0b', Interview:'#8b5cf6', Technical:'#14b8a6', 'HR Round':'#10b981', Offer:'#f97316', Hired:'#10b981', Rejected:'#ef4444' }
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899']

export default function RecruitmentManagement() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [jobs, setJobs] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('All')
  const [filterDept, setFilterDept] = useState('All')
  const [showAppForm, setShowAppForm] = useState(false)
  const [showJobForm, setShowJobForm] = useState(false)
  const [editApp, setEditApp] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [appForm, setAppForm] = useState({candidate_name:'',email:'',phone:'',position:'',department:'IT',source:'LinkedIn',stage:'Applied',experience_years:0,notes:''})
  const [jobForm, setJobForm] = useState({title:'',department:'IT',location:'',type:'Full Time',openings:1,description:'',status:'Open'})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [aRes, jRes, sRes] = await Promise.all([
        fetch(API+'/applications',{headers:getHeaders()}),
        fetch(API+'/jobs',{headers:getHeaders()}),
        fetch(API+'/stats',{headers:getHeaders()})
      ])
      const [a, j, s] = await Promise.all([aRes.json(), jRes.json(), sRes.json()])
      setApplications(a.data||[]); setJobs(j.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSaveApp = async () => {
    if(!appForm.candidate_name||!appForm.position) { showToast('Name and position required','error'); return }
    try {
      const url = editApp ? API+'/applications/'+editApp.application_id : API+'/applications'
      const res = await fetch(url, {method:editApp?'PUT':'POST',headers:getHeaders(),body:JSON.stringify(appForm)})
      const data = await res.json()
      if(data.status==='success') { showToast('Saved!'); setShowAppForm(false); setEditApp(null); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleSaveJob = async () => {
    if(!jobForm.title) { showToast('Title required','error'); return }
    try {
      const res = await fetch(API+'/jobs', {method:'POST',headers:getHeaders(),body:JSON.stringify(jobForm)})
      const data = await res.json()
      if(data.status==='success') { showToast('Job posted!'); setShowJobForm(false); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleStage = async (id, stage) => {
    await fetch(API+'/applications/'+id+'/stage', {method:'PUT',headers:getHeaders(),body:JSON.stringify({stage})})
    showToast('Updated'); load()
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete application?')) return
    await fetch(API+'/applications/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const exportCSV = () => {
    const rows = [['Candidate','Position','Dept','Stage','Source','Experience','Email','Phone'],
      ...filtered.map(a=>[a.candidate_name,a.position,a.department,a.stage,a.source||'',a.experience_years||0,a.email||'',a.phone||''])]
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='recruitment.csv'; el.click()
  }

  const filtered = applications.filter(a=>{
    const ms = !search||a.candidate_name?.toLowerCase().includes(search.toLowerCase())||a.position?.toLowerCase().includes(search.toLowerCase())
    return ms&&(filterStage==='All'||a.stage===filterStage)&&(filterDept==='All'||a.department===filterDept)
  })

  const stageData = STAGES.map(s=>({name:s,value:applications.filter(a=>a.stage===s).length})).filter(d=>d.value>0)
  const deptData = DEPTS.map(d=>({name:d,value:applications.filter(a=>a.department===d).length})).filter(d=>d.value>0)
  const sourceData = [...new Set(applications.map(a=>a.source||'Unknown'))].map(s=>({name:s,value:applications.filter(a=>(a.source||'Unknown')===s).length}))
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Users size={24} style={{color:'#8b5cf6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Recruitment Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track candidates and manage hiring pipeline</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>setShowJobForm(true)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 14px',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6}}><Briefcase size={14}/> Post Job</button>
          <button onClick={()=>{setShowAppForm(true);setEditApp(null)}} style={{background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Candidate</button>
        </div>
      </div>

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Pipeline'],['jobs','Open Positions'],['analytics','Analytics']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #8b5cf6':'2px solid transparent',background:'transparent',color:activeTab===id?'#8b5cf6':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>

      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total',value:applications.length,color:'#3b82f6'},{label:'In Progress',value:applications.filter(a=>!['Hired','Rejected'].includes(a.stage)).length,color:'#f59e0b'},{label:'Hired',value:applications.filter(a=>a.stage==='Hired').length,color:'#10b981'},{label:'Rejected',value:applications.filter(a=>a.stage==='Rejected').length,color:'#ef4444'},{label:'Open Jobs',value:jobs.filter(j=>j.status==='Open').length,color:'#8b5cf6'}].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:14,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {activeTab==='list' && (
          <div>
            <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 12px',flex:1}}>
                <Search size={13} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search candidate or position..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              <select value={filterStage} onChange={e=>setFilterStage(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['All',...STAGES].map(s=><option key={s}>{s}</option>)}
              </select>
              <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['All',...DEPTS].map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
              {filtered.map(a=>(
                <div key={a.application_id} style={{background:'#1e293b',border:`1px solid ${STATUS_COLOR[a.stage]||'#334155'}30`,borderRadius:12,padding:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                    <div>
                      <div style={{color:'#f1f5f9',fontWeight:600,fontSize:14}}>{a.candidate_name}</div>
                      <div style={{color:'#64748b',fontSize:12}}>{a.position} • {a.department}</div>
                    </div>
                    <select value={a.stage} onChange={e=>handleStage(a.application_id,e.target.value)} style={{background:STATUS_COLOR[a.stage]+'20',border:`1px solid ${STATUS_COLOR[a.stage]}40`,borderRadius:20,color:STATUS_COLOR[a.stage],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                      {STAGES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  {a.email&&<div style={{color:'#64748b',fontSize:12,marginBottom:2}}>📧 {a.email}</div>}
                  {a.phone&&<div style={{color:'#64748b',fontSize:12,marginBottom:6}}>📞 {a.phone}</div>}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <span style={{background:'#334155',color:'#94a3b8',padding:'2px 8px',borderRadius:20,fontSize:11}}>{a.source||'Unknown'}</span>
                    <span style={{color:'#64748b',fontSize:11}}>{a.experience_years||0} yrs exp</span>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>{setEditApp(a);setAppForm({candidate_name:a.candidate_name,email:a.email||'',phone:a.phone||'',position:a.position,department:a.department,source:a.source||'LinkedIn',stage:a.stage,experience_years:a.experience_years||0,notes:a.notes||''});setShowAppForm(true)}} style={{flex:1,background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'6px',cursor:'pointer',fontSize:12}}>Edit</button>
                    <button onClick={()=>handleDelete(a.application_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'6px 8px',cursor:'pointer'}}><X size={13}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==='jobs' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
            {jobs.map(j=>(
              <div key={j.job_id} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:18}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{color:'#f1f5f9',fontWeight:600,fontSize:14}}>{j.title}</span>
                  <span style={{background:j.status==='Open'?'#10b98120':'#ef444420',color:j.status==='Open'?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11}}>{j.status}</span>
                </div>
                <div style={{color:'#64748b',fontSize:12,marginBottom:4}}>{j.department} • {j.location||'Remote'}</div>
                <div style={{color:'#94a3b8',fontSize:12,marginBottom:8}}>{j.type||'Full Time'} • {j.openings||1} opening(s)</div>
                <div style={{color:'#475569',fontSize:11}}>{applications.filter(a=>a.position===j.title).length} applicants</div>
              </div>
            ))}
            {jobs.length===0&&<div style={{textAlign:'center',padding:60,color:'#64748b',gridColumn:'span 3'}}>No job postings yet</div>}
          </div>
        )}

        {activeTab==='analytics' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Pipeline Stages</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stageData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" fill="#8b5cf6" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Source Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {sourceData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Applications by Department</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" fill="#10b981" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {showAppForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowAppForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:520}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editApp?'Edit Application':'Add Candidate'}</h2>
              <button onClick={()=>setShowAppForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Candidate Name *</label><input value={appForm.candidate_name} onChange={e=>setAppForm({...appForm,candidate_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Position *</label><input value={appForm.position} onChange={e=>setAppForm({...appForm,position:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Email</label><input value={appForm.email} onChange={e=>setAppForm({...appForm,email:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Phone</label><input value={appForm.phone} onChange={e=>setAppForm({...appForm,phone:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={appForm.department} onChange={e=>setAppForm({...appForm,department:e.target.value})} style={inputStyle}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Source</label><select value={appForm.source} onChange={e=>setAppForm({...appForm,source:e.target.value})} style={inputStyle}>{['LinkedIn','Indeed','Referral','Company Website','Naukri','Other'].map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Stage</label><select value={appForm.stage} onChange={e=>setAppForm({...appForm,stage:e.target.value})} style={inputStyle}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Experience (years)</label><input type="number" value={appForm.experience_years} onChange={e=>setAppForm({...appForm,experience_years:parseInt(e.target.value)||0})} style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><textarea value={appForm.notes} onChange={e=>setAppForm({...appForm,notes:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowAppForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSaveApp} style={{flex:2,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editApp?'Update':'Add Candidate'}</button>
            </div>
          </div>
        </div>
      )}

      {showJobForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowJobForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:480}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>Post New Job</h2>
              <button onClick={()=>setShowJobForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Job Title *</label><input value={jobForm.title} onChange={e=>setJobForm({...jobForm,title:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={jobForm.department} onChange={e=>setJobForm({...jobForm,department:e.target.value})} style={inputStyle}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Location</label><input value={jobForm.location} onChange={e=>setJobForm({...jobForm,location:e.target.value})} placeholder="City or Remote" style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Type</label><select value={jobForm.type} onChange={e=>setJobForm({...jobForm,type:e.target.value})} style={inputStyle}>{['Full Time','Part Time','Contract','Internship'].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Openings</label><input type="number" value={jobForm.openings} onChange={e=>setJobForm({...jobForm,openings:parseInt(e.target.value)||1})} style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={jobForm.description} onChange={e=>setJobForm({...jobForm,description:e.target.value})} rows={3} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowJobForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSaveJob} style={{flex:2,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Post Job</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}