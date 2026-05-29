import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, ArrowLeft, Plus, Search, Edit, X, CheckCircle, Clock, AlertCircle, BarChart3, Flag, Users, Calendar, DollarSign, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/projects-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const STATUS_COLORS = { 'Planning':'#64748b', 'In Progress':'#3b82f6', 'Completed':'#10b981', 'On Hold':'#f59e0b', 'Cancelled':'#ef4444' }
const PRIORITY_COLORS = { 'High':'#ef4444', 'Medium':'#f59e0b', 'Low':'#10b981' }
const TASK_COLUMNS = ['Todo', 'In Progress', 'Review', 'Done']
const DEPARTMENTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const EMPTY_PRJ = { project_name:'', project_code:'', description:'', client:'', project_manager:'', department:'IT', start_date:'', end_date:'', status:'Planning', priority:'Medium', budget:0 }
const EMPTY_TASK = { task_name:'', description:'', assigned_to:'', status:'Todo', priority:'Medium', due_date:'', estimated_hours:8 }

export default function ProjectManagement() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('overview')
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showPrjForm, setShowPrjForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editPrj, setEditPrj] = useState(null)
  const [editTask, setEditTask] = useState(null)
  const [prjForm, setPrjForm] = useState(EMPTY_PRJ)
  const [taskForm, setTaskForm] = useState(EMPTY_TASK)
  const [toast, setToast] = useState(null)
  const [view, setView] = useState('grid')

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const loadProjects = async () => {
    setLoading(true)
    try {
      const [prjRes, statsRes] = await Promise.all([
        fetch(API, {headers:getHeaders()}),
        fetch(API+'/stats', {headers:getHeaders()})
      ])
      const [prj, st] = await Promise.all([prjRes.json(), statsRes.json()])
      setProjects(prj.data||[])
      setStats(st.data||null)
    } catch(e) { showToast('Failed to load','error') }
    setLoading(false)
  }

  const loadProjectDetail = async (project) => {
    setSelectedProject(project)
    setTab('detail')
    try {
      const [taskRes, msRes] = await Promise.all([
        fetch(API+'/'+project.project_id+'/tasks', {headers:getHeaders()}),
        fetch(API+'/'+project.project_id+'/milestones', {headers:getHeaders()})
      ])
      const [taskData, msData] = await Promise.all([taskRes.json(), msRes.json()])
      setTasks(taskData.data||[])
      setMilestones(msData.data||[])
    } catch(e) { showToast('Failed to load project details','error') }
  }

  useEffect(()=>{ loadProjects() },[])

  const handleSaveProject = async () => {
    try {
      const url = editPrj ? API+'/'+editPrj.project_id : API
      const method = editPrj ? 'PUT' : 'POST'
      const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(prjForm)})
      const data = await res.json()
      if(data.status==='success') { showToast(editPrj?'Project updated!':'Project created!'); setShowPrjForm(false); setEditPrj(null); setPrjForm(EMPTY_PRJ); loadProjects() }
      else showToast(data.message||'Failed','error')
    } catch(e) { showToast('Error','error') }
  }

  const handleSaveTask = async () => {
    try {
      const body = editTask ? {...taskForm} : {...taskForm, project_id: selectedProject.project_id}
      const url = editTask ? API+'/tasks/'+editTask.task_id : API+'/tasks'
      const method = editTask ? 'PUT' : 'POST'
      const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(body)})
      const data = await res.json()
      if(data.status==='success') { showToast(editTask?'Task updated!':'Task created!'); setShowTaskForm(false); setEditTask(null); setTaskForm(EMPTY_TASK); loadProjectDetail(selectedProject) }
      else showToast(data.message||'Failed','error')
    } catch(e) { showToast('Error','error') }
  }

  const handleDeleteTask = async (id) => {
    if(!window.confirm('Delete this task?')) return
    await fetch(API+'/tasks/'+id, {method:'DELETE', headers:getHeaders()})
    showToast('Task deleted','warning')
    loadProjectDetail(selectedProject)
  }

  const handleMilestoneToggle = async (ms) => {
    const newStatus = ms.status==='Completed' ? 'Pending' : 'Completed'
    await fetch(API+'/milestones/'+ms.milestone_id, {method:'PUT', headers:getHeaders(), body:JSON.stringify({status:newStatus})})
    loadProjectDetail(selectedProject)
  }

  const handleUpdateTaskStatus = async (task, newStatus) => {
    await fetch(API+'/tasks/'+task.task_id, {method:'PUT', headers:getHeaders(), body:JSON.stringify({...task, status:newStatus})})
    loadProjectDetail(selectedProject)
  }

  const filtered = projects.filter(p =>
    (p.project_name+p.client+p.department).toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus==='All' || p.status===filterStatus)
  )

  const budgetData = projects.slice(0,6).map(p=>({ name:p.project_name.slice(0,12), budget:Number(p.budget)/100000, spent:Number(p.spent)/100000 }))

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>tab==='detail'?setTab('overview'):navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> {tab==='detail'?'Projects':'Back'}</button>
        <Briefcase size={28} style={{color:'#f59e0b'}}/>
        <div>
          <h1 style={{margin:0,fontSize:20,fontWeight:700}}>{tab==='detail'&&selectedProject ? selectedProject.project_name : 'Project Management'}</h1>
          <p style={{margin:0,fontSize:12,color:'#64748b'}}>{tab==='detail'&&selectedProject ? `${selectedProject.department} • ${selectedProject.status}` : 'Manage projects, tasks and milestones'}</p>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          {tab==='detail' && <button onClick={()=>{setShowTaskForm(true);setEditTask(null);setTaskForm(EMPTY_TASK)}} style={{display:'flex',alignItems:'center',gap:6,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Task</button>}
          {tab==='overview' && <button onClick={()=>{setShowPrjForm(true);setEditPrj(null);setPrjForm(EMPTY_PRJ)}} style={{display:'flex',alignItems:'center',gap:6,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> New Project</button>}
        </div>
      </div>

      <div style={{padding:24}}>
        {tab==='overview' && (
          <div>
            {/* Stats */}
            {stats && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:16,marginBottom:24}}>
                {[
                  {label:'Total Projects', value:stats.totalProjects, color:'#3b82f6'},
                  {label:'In Progress', value:stats.activeProjects, color:'#f59e0b'},
                  {label:'Completed', value:stats.completedProjects, color:'#10b981'},
                  {label:'Total Budget', value:'₹'+Number(stats.totalBudget||0).toLocaleString(), color:'#8b5cf6'},
                  {label:'Total Spent', value:'₹'+Number(stats.totalSpent||0).toLocaleString(), color:'#ef4444'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,borderTop:`3px solid ${s.color}`}}>
                    <div style={{fontSize:11,color:'#64748b',marginBottom:6}}>{s.label}</div>
                    <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Budget Chart */}
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:24}}>
              <h3 style={{color:'#f1f5f9',marginBottom:16,fontSize:14}}>Budget vs Spent (₹ Lakhs)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}}/>
                  <YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155'}} formatter={(v)=>['₹'+v+'L','']}/>
                  <Bar dataKey="budget" fill="#3b82f6" name="Budget" radius={[4,4,0,0]}/>
                  <Bar dataKey="spent" fill="#ef4444" name="Spent" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Filters */}
            <div style={{display:'flex',gap:12,marginBottom:16,alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 12px',flex:1}}>
                <Search size={14} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              <div style={{display:'flex',gap:4,background:'#1e293b',padding:4,borderRadius:8}}>
                {['All','Planning','In Progress','Completed','On Hold'].map(s=>(
                  <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:filterStatus===s?'#3b82f6':'transparent',color:filterStatus===s?'#fff':'#64748b',cursor:'pointer',fontSize:12}}>{s}</button>
                ))}
              </div>
            </div>

            {/* Projects Grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {filtered.map(p=>(
                <div key={p.project_id} onClick={()=>loadProjectDetail(p)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,cursor:'pointer',transition:'border-color 0.2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#3b82f6'} onMouseLeave={e=>e.currentTarget.style.borderColor='#334155'}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                    <span style={{background:STATUS_COLORS[p.status]+'20',color:STATUS_COLORS[p.status],padding:'2px 8px',borderRadius:20,fontSize:11}}>{p.status}</span>
                    <span style={{background:PRIORITY_COLORS[p.priority]+'20',color:PRIORITY_COLORS[p.priority],padding:'2px 8px',borderRadius:20,fontSize:11}}>{p.priority}</span>
                  </div>
                  <h3 style={{color:'#f1f5f9',margin:'0 0 4px',fontSize:15}}>{p.project_name}</h3>
                  <p style={{color:'#64748b',fontSize:12,margin:'0 0 12px'}}>{p.client} • {p.department}</p>
                  <div style={{marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748b',marginBottom:4}}><span>Progress</span><span style={{color:'#10b981'}}>{p.progress}%</span></div>
                    <div style={{background:'#0f172a',borderRadius:4,height:6}}><div style={{background:'#10b981',height:6,borderRadius:4,width:`${p.progress}%`,transition:'width 0.3s'}}></div></div>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:11,color:'#64748b'}}>
                    <div><Users size={10} style={{marginRight:4}}/>{p.project_manager}</div>
                    <div><Calendar size={10} style={{marginRight:4}}/>{p.end_date?.slice(0,10)}</div>
                    <div><DollarSign size={10} style={{marginRight:4}}/>₹{Number(p.budget).toLocaleString()}</div>
                    <div><CheckCircle size={10} style={{marginRight:4}}/>{p.completed_tasks}/{p.total_tasks} tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='detail' && selectedProject && (
          <div>
            {/* Project Info Bar */}
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,marginBottom:24,display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:16}}>
              {[
                {label:'Manager', value:selectedProject.project_manager},
                {label:'Start', value:selectedProject.start_date?.slice(0,10)},
                {label:'End', value:selectedProject.end_date?.slice(0,10)},
                {label:'Budget', value:'₹'+Number(selectedProject.budget).toLocaleString()},
                {label:'Spent', value:'₹'+Number(selectedProject.spent).toLocaleString()},
              ].map((i,idx)=>(
                <div key={idx}>
                  <div style={{fontSize:10,color:'#64748b',marginBottom:4}}>{i.label}</div>
                  <div style={{fontSize:13,color:'#f1f5f9',fontWeight:600}}>{i.value}</div>
                </div>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
              {/* Kanban Board */}
              <div>
                <h3 style={{color:'#f1f5f9',marginBottom:16,fontSize:14}}>Task Board</h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
                  {TASK_COLUMNS.map(col=>(
                    <div key={col} style={{background:'#1e293b',borderRadius:10,padding:12,minHeight:200}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                        <span style={{fontSize:12,fontWeight:600,color:'#94a3b8'}}>{col}</span>
                        <span style={{background:'#334155',color:'#64748b',fontSize:10,padding:'2px 6px',borderRadius:10}}>{tasks.filter(t=>t.status===col).length}</span>
                      </div>
                      {tasks.filter(t=>t.status===col).map(task=>(
                        <div key={task.task_id} style={{background:'#0f172a',borderRadius:8,padding:10,marginBottom:8,border:'1px solid #334155'}}>
                          <div style={{fontSize:12,color:'#f1f5f9',fontWeight:600,marginBottom:4}}>{task.task_name}</div>
                          <div style={{fontSize:10,color:'#64748b',marginBottom:6}}>{task.assigned_to}</div>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span style={{background:PRIORITY_COLORS[task.priority]+'20',color:PRIORITY_COLORS[task.priority],fontSize:10,padding:'1px 6px',borderRadius:10}}>{task.priority}</span>
                            <div style={{display:'flex',gap:4}}>
                              {col!=='Done' && <button onClick={()=>handleUpdateTaskStatus(task, TASK_COLUMNS[TASK_COLUMNS.indexOf(col)+1])} style={{background:'#334155',border:'none',borderRadius:4,color:'#94a3b8',padding:'2px 6px',cursor:'pointer',fontSize:10}}>→</button>}
                              <button onClick={()=>{setEditTask(task);setTaskForm(task);setShowTaskForm(true)}} style={{background:'#334155',border:'none',borderRadius:4,color:'#94a3b8',padding:'2px 6px',cursor:'pointer',fontSize:10}}><Edit size={10}/></button>
                              <button onClick={()=>handleDeleteTask(task.task_id)} style={{background:'#ef444420',border:'none',borderRadius:4,color:'#ef4444',padding:'2px 6px',cursor:'pointer',fontSize:10}}><Trash2 size={10}/></button>
                            </div>
                          </div>
                          {task.due_date && <div style={{fontSize:10,color:'#64748b',marginTop:4}}><Calendar size={8}/> {task.due_date?.slice(0,10)}</div>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 style={{color:'#f1f5f9',marginBottom:16,fontSize:14}}>Milestones</h3>
                <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding:16}}>
                  {milestones.map((ms,i)=>(
                    <div key={ms.milestone_id} style={{display:'flex',gap:12,alignItems:'flex-start',marginBottom:16,paddingBottom:16,borderBottom:i<milestones.length-1?'1px solid #334155':'none'}}>
                      <button onClick={()=>handleMilestoneToggle(ms)} style={{background:'none',border:'none',cursor:'pointer',padding:0,marginTop:2}}>
                        {ms.status==='Completed' ? <CheckCircle size={18} style={{color:'#10b981'}}/> : <Clock size={18} style={{color:'#64748b'}}/>}
                      </button>
                      <div>
                        <div style={{fontSize:13,color:ms.status==='Completed'?'#10b981':'#f1f5f9',fontWeight:600,textDecoration:ms.status==='Completed'?'line-through':'none'}}>{ms.milestone_name}</div>
                        <div style={{fontSize:11,color:'#64748b'}}>{ms.due_date?.slice(0,10)}</div>
                      </div>
                    </div>
                  ))}
                  {milestones.length===0 && <div style={{color:'#64748b',fontSize:13,textAlign:'center',padding:20}}>No milestones yet</div>}
                </div>

                {/* Quick Stats */}
                <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding:16,marginTop:16}}>
                  <h4 style={{color:'#f1f5f9',margin:'0 0 12px',fontSize:13}}>Task Summary</h4>
                  {TASK_COLUMNS.map(col=>(
                    <div key={col} style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <span style={{fontSize:12,color:'#64748b'}}>{col}</span>
                      <span style={{fontSize:13,fontWeight:600,color:'#f1f5f9'}}>{tasks.filter(t=>t.status===col).length}</span>
                    </div>
                  ))}
                  <div style={{borderTop:'1px solid #334155',paddingTop:8,marginTop:8,display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:12,color:'#64748b'}}>Total</span>
                    <span style={{fontSize:13,fontWeight:700,color:'#3b82f6'}}>{tasks.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Project Modal */}
      {showPrjForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowPrjForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:580,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editPrj?'Edit Project':'New Project'}</h2>
              <button onClick={()=>setShowPrjForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['project_name','Project Name'],['project_code','Code'],['client','Client'],['project_manager','Project Manager'],['start_date','Start Date','date'],['end_date','End Date','date'],['budget','Budget','number']].map(([key,label,type='text'])=>(
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
              <button onClick={handleSaveProject} style={{flex:2,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editPrj?'Update':'Create Project'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {showTaskForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowTaskForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:480}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editTask?'Edit Task':'Add Task'}</h2>
              <button onClick={()=>setShowTaskForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gap:12}}>
              {[['task_name','Task Name'],['assigned_to','Assigned To'],['due_date','Due Date','date'],['estimated_hours','Estimated Hours','number']].map(([key,label,type='text'])=>(
                <div key={key}>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label>
                  <input type={type} value={taskForm[key]||''} onChange={e=>setTaskForm({...taskForm,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/>
                </div>
              ))}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label>
                  <select value={taskForm.status} onChange={e=>setTaskForm({...taskForm,status:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                    {TASK_COLUMNS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Priority</label>
                  <select value={taskForm.priority} onChange={e=>setTaskForm({...taskForm,priority:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                    {['High','Medium','Low'].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label>
                <textarea value={taskForm.description||''} onChange={e=>setTaskForm({...taskForm,description:e.target.value})} rows={2} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/>
              </div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowTaskForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSaveTask} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editTask?'Update Task':'Add Task'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}