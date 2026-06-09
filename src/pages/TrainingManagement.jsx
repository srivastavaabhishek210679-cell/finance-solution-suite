import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, RefreshCw, Search, Download, BookOpen, Award, Users } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/training'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['Technical','Soft Skills','Compliance','Leadership','Safety','Product','Sales','HR']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const STATUS_COLOR = { Enrolled:'#3b82f6', 'In Progress':'#f59e0b', Completed:'#10b981', Failed:'#ef4444', Cancelled:'#64748b' }
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899']

export default function TrainingManagement() {
  const navigate = useNavigate()
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDept, setFilterDept] = useState('All')
  const [filterCat, setFilterCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({employee_name:'',department:'IT',course_name:'',category:'Technical',trainer:'',start_date:'',end_date:'',duration_hours:8,status:'Enrolled',score:0,certificate_issued:false,notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [eRes, sRes] = await Promise.all([fetch(API,{headers:getHeaders()}), fetch(API+'/stats',{headers:getHeaders()})])
      const [e, s] = await Promise.all([eRes.json(), sRes.json()])
      setEnrollments(e.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.employee_name||!form.course_name) { showToast('Employee and course required','error'); return }
    try {
      const url = editItem ? API+'/'+editItem.enrollment_id : API
      const res = await fetch(url, {method:editItem?'PUT':'POST',headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast('Saved!'); setShowForm(false); setEditItem(null); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleStatus = async (id, status) => {
    await fetch(API+'/'+id+'/status', {method:'PUT',headers:getHeaders(),body:JSON.stringify({status})})
    showToast('Updated'); load()
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const exportCSV = () => {
    const rows = [['Employee','Dept','Course','Category','Trainer','Start','End','Hours','Score','Status','Certificate'],
      ...filtered.map(e=>[e.employee_name,e.department,e.course_name,e.category,e.trainer||'',e.start_date||'',e.end_date||'',e.duration_hours||'',e.score||'',e.status,e.certificate_issued?'Yes':'No'])]
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='training.csv'; el.click()
  }

  const filtered = enrollments.filter(e=>{
    const ms = !search||e.employee_name?.toLowerCase().includes(search.toLowerCase())||e.course_name?.toLowerCase().includes(search.toLowerCase())
    return ms&&(filterStatus==='All'||e.status===filterStatus)&&(filterDept==='All'||e.department===filterDept)&&(filterCat==='All'||e.category===filterCat)
  })

  const statusData = Object.keys(STATUS_COLOR).map(s=>({name:s,value:enrollments.filter(e=>e.status===s).length})).filter(d=>d.value>0)
  const catData = CATEGORIES.map(c=>({name:c,value:enrollments.filter(e=>e.category===c).length})).filter(d=>d.value>0)
  const deptData = DEPTS.map(d=>({dept:d,enrollments:enrollments.filter(e=>e.department===d).length,completed:enrollments.filter(e=>e.department===d&&e.status==='Completed').length})).filter(d=>d.enrollments>0)
  const completionRate = enrollments.length ? Math.round(enrollments.filter(e=>e.status==='Completed').length/enrollments.length*100) : 0
  const avgScore = enrollments.filter(e=>e.score>0).length ? Math.round(enrollments.filter(e=>e.score>0).reduce((s,e)=>s+e.score,0)/enrollments.filter(e=>e.score>0).length) : 0
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <BookOpen size={24} style={{color:'#8b5cf6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Training Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track employee training and certifications</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditItem(null)}} style={{background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Enroll</button>
        </div>
      </div>
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Enrollments'],['analytics','Analytics']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #8b5cf6':'2px solid transparent',background:'transparent',color:activeTab===id?'#8b5cf6':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total',value:enrollments.length,color:'#3b82f6'},{label:'In Progress',value:enrollments.filter(e=>e.status==='In Progress').length,color:'#f59e0b'},{label:'Completed',value:enrollments.filter(e=>e.status==='Completed').length,color:'#10b981'},{label:'Completion Rate',value:completionRate+'%',color:'#10b981'},{label:'Avg Score',value:avgScore+'%',color:'#8b5cf6'}].map((s,i)=>(
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
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employee or course..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              {[[['All',...Object.keys(STATUS_COLOR)],filterStatus,setFilterStatus],[['All',...DEPTS],filterDept,setFilterDept],[['All',...CATEGORIES],filterCat,setFilterCat]].map(([opts,val,setter],i)=>(
                <select key={i} value={val} onChange={e=>setter(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{opts.map(o=><option key={o}>{o}</option>)}</select>
              ))}
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>{['Employee','Dept','Course','Category','Trainer','Start','End','Score','Status','Cert','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px 12px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length===0?<tr><td colSpan={11} style={{textAlign:'center',padding:40,color:'#64748b'}}>No enrollments</td></tr>
                  :filtered.map(e=>(
                    <tr key={e.enrollment_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={el=>el.currentTarget.style.background='#0f172a'} onMouseLeave={el=>el.currentTarget.style.background='transparent'}>
                      <td style={{padding:'8px 12px',color:'#f1f5f9',fontSize:13,fontWeight:500}}>{e.employee_name}</td>
                      <td style={{padding:'8px 12px',color:'#64748b',fontSize:12}}>{e.department}</td>
                      <td style={{padding:'8px 12px',color:'#94a3b8',fontSize:12}}>{e.course_name}</td>
                      <td style={{padding:'8px 12px',color:'#64748b',fontSize:11}}>{e.category}</td>
                      <td style={{padding:'8px 12px',color:'#64748b',fontSize:11}}>{e.trainer||'—'}</td>
                      <td style={{padding:'8px 12px',color:'#64748b',fontSize:11}}>{e.start_date?new Date(e.start_date).toLocaleDateString('en-IN'):'—'}</td>
                      <td style={{padding:'8px 12px',color:'#64748b',fontSize:11}}>{e.end_date?new Date(e.end_date).toLocaleDateString('en-IN'):'—'}</td>
                      <td style={{padding:'8px 12px',color:e.score>=70?'#10b981':'#ef4444',fontSize:13,fontWeight:600}}>{e.score||'—'}</td>
                      <td style={{padding:'8px 12px'}}>
                        <select value={e.status} onChange={el=>handleStatus(e.enrollment_id,el.target.value)} style={{background:STATUS_COLOR[e.status]+'20',border:`1px solid ${STATUS_COLOR[e.status]}40`,borderRadius:20,color:STATUS_COLOR[e.status],padding:'2px 6px',fontSize:10,cursor:'pointer',fontWeight:600}}>
                          {Object.keys(STATUS_COLOR).map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{padding:'8px 12px',textAlign:'center'}}>{e.certificate_issued?'✅':'—'}</td>
                      <td style={{padding:'8px 12px'}}>
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>{setEditItem(e);setForm({employee_name:e.employee_name,department:e.department,course_name:e.course_name,category:e.category,trainer:e.trainer||'',start_date:e.start_date?.split('T')[0]||'',end_date:e.end_date?.split('T')[0]||'',duration_hours:e.duration_hours||8,status:e.status,score:e.score||0,certificate_issued:e.certificate_issued||false,notes:e.notes||''});setShowForm(true)}} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:11}}>Edit</button>
                          <button onClick={()=>handleDelete(e.enrollment_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 6px',cursor:'pointer'}}><X size={11}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab==='analytics' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Enrollment Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {statusData.map((s,i)=><Cell key={i} fill={STATUS_COLOR[s.name]||COLORS[i]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Training by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={catData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" name="Enrollments" radius={[6,6,0,0]}>{catData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Training by Department</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="dept" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/>
                  <Bar dataKey="enrollments" name="Enrolled" fill="#8b5cf6" radius={[4,4,0,0]}/>
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editItem?'Edit Enrollment':'New Enrollment'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Employee Name *</label><input value={form.employee_name} onChange={e=>setForm({...form,employee_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inputStyle}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Course Name *</label><input value={form.course_name} onChange={e=>setForm({...form,course_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inputStyle}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Trainer</label><input value={form.trainer} onChange={e=>setForm({...form,trainer:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Duration (hours)</label><input type="number" value={form.duration_hours} onChange={e=>setForm({...form,duration_hours:parseInt(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Start Date</label><input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>End Date</label><input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Score (%)</label><input type="number" min="0" max="100" value={form.score} onChange={e=>setForm({...form,score:parseInt(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>{Object.keys(STATUS_COLOR).map(s=><option key={s}>{s}</option>)}</select></div>
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 0'}}><input type="checkbox" checked={form.certificate_issued} onChange={e=>setForm({...form,certificate_issued:e.target.checked})} id="cert"/><label htmlFor="cert" style={{color:'#94a3b8',fontSize:13,cursor:'pointer'}}>Certificate Issued</label></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editItem?'Update':'Enroll'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}