import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Briefcase, ArrowLeft, Plus, Search, Edit, X, CheckCircle, AlertCircle, Link, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/resources'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#14b8a6']
const DEPARTMENTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const EMPTY_RES = { name:'', email:'', role:'', department:'IT', skills:[], availability_percent:100, hourly_rate:0, status:'Available', location:'' }
const EMPTY_PRJ = { project_name:'', project_code:'', client:'', start_date:'', end_date:'', status:'Active', priority:'Medium', budget:0, department:'IT', description:'' }

export default function ResourceManagement() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('resources')
  const [resources, setResources] = useState([])
  const [projects, setProjects] = useState([])
  const [allocations, setAllocations] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showResForm, setShowResForm] = useState(false)
  const [showPrjForm, setShowPrjForm] = useState(false)
  const [showAllocForm, setShowAllocForm] = useState(false)
  const [editRes, setEditRes] = useState(null)
  const [resForm, setResForm] = useState(EMPTY_RES)
  const [prjForm, setPrjForm] = useState(EMPTY_PRJ)
  const [allocForm, setAllocForm] = useState({ resource_id:'', project_id:'', allocation_percent:100, start_date:'', end_date:'', role_in_project:'' })
  const [toast, setToast] = useState(null)
  const [skillInput, setSkillInput] = useState('')

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const loadData = async () => {
    setLoading(true)
    try {
      const [resRes, prjRes, allocRes, statsRes] = await Promise.all([
        fetch(API+'/resources', {headers:getHeaders()}),
        fetch(API+'/projects', {headers:getHeaders()}),
        fetch(API+'/allocations', {headers:getHeaders()}),
        fetch(API+'/stats', {headers:getHeaders()})
      ])
      const [res, prj, alloc, st] = await Promise.all([resRes.json(), prjRes.json(), allocRes.json(), statsRes.json()])
      setResources(res.data||[])
      setProjects(prj.data||[])
      setAllocations(alloc.data||[])
      setStats(st.data||null)
    } catch(e) { showToast('Failed to load data','error') }
    setLoading(false)
  }

  useEffect(()=>{ loadData() },[])

  const handleSaveResource = async () => {
    try {
      const url = editRes ? API+'/resources/'+editRes.resource_id : API+'/resources'
      const method = editRes ? 'PUT' : 'POST'
      const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(resForm)})
      const data = await res.json()
      if(data.status==='success') { showToast(editRes?'Resource updated!':'Resource added!'); setShowResForm(false); setEditRes(null); setResForm(EMPTY_RES); loadData() }
      else showToast(data.message||'Failed','error')
    } catch(e) { showToast('Error','error') }
  }

  const handleSaveProject = async () => {
    try {
      const res = await fetch(API+'/projects', {method:'POST', headers:getHeaders(), body:JSON.stringify(prjForm)})
      const data = await res.json()
      if(data.status==='success') { showToast('Project created!'); setShowPrjForm(false); setPrjForm(EMPTY_PRJ); loadData() }
      else showToast(data.message||'Failed','error')
    } catch(e) { showToast('Error','error') }
  }

  const handleAllocate = async () => {
    try {
      const res = await fetch(API+'/allocations', {method:'POST', headers:getHeaders(), body:JSON.stringify(allocForm)})
      const data = await res.json()
      if(data.status==='success') { showToast('Resource allocated!'); setShowAllocForm(false); loadData() }
      else showToast(data.message||'Failed','error')
    } catch(e) { showToast('Error','error') }
  }

  const handleRemoveAllocation = async (id) => {
    try {
      await fetch(API+'/allocations/'+id, {method:'DELETE', headers:getHeaders()})
      showToast('Allocation removed','warning'); loadData()
    } catch(e) { showToast('Error','error') }
  }

  const addSkill = () => { if(skillInput.trim()) { setResForm({...resForm, skills:[...(resForm.skills||[]), skillInput.trim()]}); setSkillInput('') } }
  const removeSkill = (i) => setResForm({...resForm, skills:resForm.skills.filter((_,idx)=>idx!==i)})

  const filtered = resources.filter(r => (r.name+r.role+r.department).toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Users size={28} style={{color:'#3b82f6'}}/>
        <div>
          <h1 style={{margin:0,fontSize:20,fontWeight:700}}>Resource Management</h1>
          <p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage resources, projects and allocations</p>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <button onClick={()=>setShowAllocForm(true)} style={{display:'flex',alignItems:'center',gap:6,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Link size={14}/> Allocate</button>
          <button onClick={()=>setShowPrjForm(true)} style={{display:'flex',alignItems:'center',gap:6,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Briefcase size={14}/> New Project</button>
          <button onClick={()=>{setShowResForm(true);setEditRes(null);setResForm(EMPTY_RES)}} style={{display:'flex',alignItems:'center',gap:6,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Resource</button>
        </div>
      </div>

      <div style={{padding:24}}>
        {/* Stats */}
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Resources', value:stats.totalResources, color:'#3b82f6'},
              {label:'Available', value:stats.availableResources, color:'#10b981'},
              {label:'Allocated', value:Number(stats.totalResources)-Number(stats.availableResources), color:'#f59e0b'},
              {label:'Active Projects', value:stats.activeProjects, color:'#8b5cf6'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:8}}>{s.label}</div>
                <div style={{fontSize:28,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Department Chart */}
        {stats?.departmentBreakdown?.length > 0 && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:24}}>
            <h3 style={{color:'#f1f5f9',marginBottom:16,fontSize:14}}>Resource Distribution by Department</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={stats.departmentBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="department" tick={{fill:'#64748b',fontSize:10}}/>
                  <YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155'}}/>
                  <Bar dataKey="count" fill="#3b82f6" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={stats.departmentBreakdown} dataKey="count" nameKey="department" cx="50%" cy="50%" outerRadius={70} label={({department,count})=>`${department}: ${count}`}>
                    {stats.departmentBreakdown.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:20,background:'#1e293b',padding:4,borderRadius:10,width:'fit-content'}}>
          {[['resources','Resources'],['projects','Projects'],['allocations','Allocations']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:'8px 20px',borderRadius:8,border:'none',background:tab===id?'#3b82f6':'transparent',color:tab===id?'#fff':'#64748b',cursor:'pointer',fontWeight:600,fontSize:13}}>{label}</button>
          ))}
        </div>

        {/* Resources Tab */}
        {tab==='resources' && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{color:'#f1f5f9',margin:0}}>Resource Pool ({filtered.length})</h3>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#0f172a',border:'1px solid #334155',borderRadius:8,padding:'8px 12px'}}>
                <Search size={14} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search resources..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',width:180}}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {filtered.map(r=>(
                <div key={r.resource_id} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:10,padding:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <div>
                      <div style={{color:'#f1f5f9',fontWeight:600,fontSize:14}}>{r.name}</div>
                      <div style={{color:'#64748b',fontSize:12}}>{r.role}</div>
                    </div>
                    <span style={{background:r.status==='Available'?'#10b98120':'#f59e0b20',color:r.status==='Available'?'#10b981':'#f59e0b',padding:'2px 8px',borderRadius:20,fontSize:11,height:'fit-content'}}>{r.status}</span>
                  </div>
                  <div style={{fontSize:12,color:'#64748b',marginBottom:8}}>{r.department} • {r.location}</div>
                  <div style={{marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748b',marginBottom:4}}><span>Availability</span><span style={{color:'#10b981'}}>{r.availability_percent}%</span></div>
                    <div style={{background:'#1e293b',borderRadius:4,height:6}}><div style={{background:'#10b981',height:6,borderRadius:4,width:`${r.availability_percent}%`}}></div></div>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
                    {(r.skills||[]).slice(0,3).map((s,i)=><span key={i} style={{background:'#1e293b',color:'#94a3b8',fontSize:10,padding:'2px 6px',borderRadius:10}}>{s}</span>)}
                    {(r.skills||[]).length>3 && <span style={{color:'#64748b',fontSize:10}}>+{r.skills.length-3} more</span>}
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{color:'#3b82f6',fontSize:12,fontWeight:600}}>₹{Number(r.hourly_rate).toLocaleString()}/hr</span>
                    <button onClick={()=>{setEditRes(r);setResForm({...r,skills:r.skills||[]});setShowResForm(true)}} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'4px 8px',cursor:'pointer',fontSize:12}}><Edit size={12}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {tab==='projects' && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
            <h3 style={{color:'#f1f5f9',margin:'0 0 16px'}}>Projects ({projects.length})</h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16}}>
              {projects.map(p=>(
                <div key={p.project_id} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:10,padding:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <div>
                      <div style={{color:'#f1f5f9',fontWeight:600,fontSize:14}}>{p.project_name}</div>
                      <div style={{color:'#64748b',fontSize:12}}>{p.project_code} • {p.client}</div>
                    </div>
                    <span style={{background:p.priority==='High'?'#ef444420':'#f59e0b20',color:p.priority==='High'?'#ef4444':'#f59e0b',padding:'2px 8px',borderRadius:20,fontSize:11,height:'fit-content'}}>{p.priority}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
                    <div style={{fontSize:11,color:'#64748b'}}>Start: <span style={{color:'#94a3b8'}}>{p.start_date?.slice(0,10)}</span></div>
                    <div style={{fontSize:11,color:'#64748b'}}>End: <span style={{color:'#94a3b8'}}>{p.end_date?.slice(0,10)}</span></div>
                    <div style={{fontSize:11,color:'#64748b'}}>Budget: <span style={{color:'#10b981'}}>₹{Number(p.budget).toLocaleString()}</span></div>
                    <div style={{fontSize:11,color:'#64748b'}}>Team: <span style={{color:'#3b82f6'}}>{p.team_size} members</span></div>
                  </div>
                  <span style={{background:'#10b98120',color:'#10b981',padding:'2px 8px',borderRadius:20,fontSize:11}}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Allocations Tab */}
        {tab==='allocations' && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
            <h3 style={{color:'#f1f5f9',margin:'0 0 16px'}}>Resource Allocations ({allocations.length})</h3>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #334155'}}>
                  {['Resource','Role','Project','Allocation %','Period','Status','Action'].map(h=>(
                    <th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allocations.map(a=>(
                  <tr key={a.allocation_id} style={{borderBottom:'1px solid #0f172a'}}>
                    <td style={{padding:'10px 8px'}}>
                      <div style={{color:'#f1f5f9',fontWeight:600,fontSize:13}}>{a.resource_name}</div>
                      <div style={{color:'#64748b',fontSize:11}}>{a.department}</div>
                    </td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{a.role_in_project}</td>
                    <td style={{padding:'10px 8px',color:'#3b82f6',fontSize:12}}>{a.project_name}</td>
                    <td style={{padding:'10px 8px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{background:'#1e293b',borderRadius:4,height:6,width:60}}><div style={{background:'#3b82f6',height:6,borderRadius:4,width:`${a.allocation_percent}%`}}></div></div>
                        <span style={{color:'#3b82f6',fontSize:12}}>{a.allocation_percent}%</span>
                      </div>
                    </td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:11}}>{a.start_date?.slice(0,10)} → {a.end_date?.slice(0,10)}</td>
                    <td style={{padding:'10px 8px'}}>
                      <span style={{background:a.status==='Active'?'#10b98120':'#ef444420',color:a.status==='Active'?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11}}>{a.status}</span>
                    </td>
                    <td style={{padding:'10px 8px'}}>
                      <button onClick={()=>handleRemoveAllocation(a.allocation_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 8px',cursor:'pointer',fontSize:12}}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      {showResForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowResForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editRes?'Edit Resource':'Add Resource'}</h2>
              <button onClick={()=>setShowResForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['name','Name'],['email','Email'],['role','Role'],['location','Location'],['availability_percent','Availability %','number'],['hourly_rate','Hourly Rate','number']].map(([key,label,type='text'])=>(
                <div key={key}>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label>
                  <input type={type} value={resForm[key]||''} onChange={e=>setResForm({...resForm,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label>
                <select value={resForm.department} onChange={e=>setResForm({...resForm,department:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                  {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label>
                <select value={resForm.status} onChange={e=>setResForm({...resForm,status:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                  {['Available','Allocated','On Leave','Inactive'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginTop:12}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Skills</label>
              <div style={{display:'flex',gap:8,marginBottom:8}}>
                <input value={skillInput} onChange={e=>setSkillInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addSkill()} placeholder="Add skill and press Enter" style={{flex:1,background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}/>
                <button onClick={addSkill} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 12px',cursor:'pointer'}}>Add</button>
              </div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {(resForm.skills||[]).map((s,i)=><span key={i} style={{background:'#334155',color:'#94a3b8',padding:'2px 8px',borderRadius:20,fontSize:12,display:'flex',alignItems:'center',gap:4}}>{s}<button onClick={()=>removeSkill(i)} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',padding:0,fontSize:10}}>×</button></span>)}
              </div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowResForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSaveResource} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editRes?'Update':'Add Resource'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showPrjForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowPrjForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>New Project</h2>
              <button onClick={()=>setShowPrjForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['project_name','Project Name'],['project_code','Project Code'],['client','Client'],['budget','Budget','number'],['start_date','Start Date','date'],['end_date','End Date','date']].map(([key,label,type='text'])=>(
                <div key={key}>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label>
                  <input type={type} value={prjForm[key]||''} onChange={e=>setPrjForm({...prjForm,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Priority</label>
                <select value={prjForm.priority} onChange={e=>setPrjForm({...prjForm,priority:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                  {['High','Medium','Low'].map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label>
                <select value={prjForm.department} onChange={e=>setPrjForm({...prjForm,department:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                  {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{marginTop:12}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label>
              <textarea value={prjForm.description||''} onChange={e=>setPrjForm({...prjForm,description:e.target.value})} rows={3} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowPrjForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSaveProject} style={{flex:2,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create Project</button>
            </div>
          </div>
        </div>
      )}

      {/* Allocate Modal */}
      {showAllocForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowAllocForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:480}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>Allocate Resource</h2>
              <button onClick={()=>setShowAllocForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gap:12}}>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Resource</label>
                <select value={allocForm.resource_id} onChange={e=>setAllocForm({...allocForm,resource_id:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                  <option value="">Select Resource</option>
                  {resources.map(r=><option key={r.resource_id} value={r.resource_id}>{r.name} — {r.role}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Project</label>
                <select value={allocForm.project_id} onChange={e=>setAllocForm({...allocForm,project_id:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                  <option value="">Select Project</option>
                  {projects.map(p=><option key={p.project_id} value={p.project_id}>{p.project_name}</option>)}
                </select>
              </div>
              {[['role_in_project','Role in Project'],['allocation_percent','Allocation %','number'],['start_date','Start Date','date'],['end_date','End Date','date']].map(([key,label,type='text'])=>(
                <div key={key}>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label>
                  <input type={type} value={allocForm[key]||''} onChange={e=>setAllocForm({...allocForm,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowAllocForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleAllocate} style={{flex:2,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Allocate Resource</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}