import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, RefreshCw, Search, Download, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/leave-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const LEAVE_TYPES = ['Annual Leave','Sick Leave','Casual Leave','Maternity Leave','Paternity Leave','Emergency Leave','Study Leave','Unpaid Leave']
const STATUS_COLOR = { Pending:'#f59e0b', Approved:'#10b981', Rejected:'#ef4444', Cancelled:'#64748b' }
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']

export default function LeaveManagement() {
  const navigate = useNavigate()
  const [leaves, setLeaves] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [filterDept, setFilterDept] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editLeave, setEditLeave] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({employee_name:'',department:'Finance',leave_type:'Annual Leave',start_date:'',end_date:'',reason:'',status:'Pending'})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [lRes, sRes] = await Promise.all([fetch(API,{headers:getHeaders()}), fetch(API+'/stats',{headers:getHeaders()})])
      const [l, s] = await Promise.all([lRes.json(), sRes.json()])
      setLeaves(l.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.employee_name||!form.start_date) { showToast('Name and dates required','error'); return }
    try {
      const url = editLeave ? API+'/'+editLeave.leave_id : API
      const res = await fetch(url, {method:editLeave?'PUT':'POST',headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast(editLeave?'Updated!':'Leave applied!'); setShowForm(false); setEditLeave(null); load() }
      else showToast(data.message||'Failed','error')
    } catch(e) { showToast('Failed','error') }
  }

  const handleStatus = async (id, status) => {
    await fetch(API+'/'+id+'/status', {method:'PUT',headers:getHeaders(),body:JSON.stringify({status})})
    showToast('Status updated'); load()
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete this leave?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const exportCSV = () => {
    const rows = [['Employee','Dept','Type','Start','End','Days','Status','Reason'],...filtered.map(l=>[l.employee_name,l.department,l.leave_type,l.start_date,l.end_date,l.total_days||'',l.status,l.reason||''])]
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='leaves.csv'; el.click()
  }

  const filtered = leaves.filter(l=>{
    const ms = !search||l.employee_name?.toLowerCase().includes(search.toLowerCase())
    return ms&&(filterStatus==='All'||l.status===filterStatus)&&(filterType==='All'||l.leave_type===filterType)&&(filterDept==='All'||l.department===filterDept)
  })

  const statusData = Object.keys(STATUS_COLOR).map(s=>({name:s,value:leaves.filter(l=>l.status===s).length})).filter(d=>d.value>0)
  const typeData = LEAVE_TYPES.map(t=>({name:t.replace(' Leave',''),value:leaves.filter(l=>l.leave_type===t).length})).filter(d=>d.value>0)
  const deptData = DEPTS.map(d=>({dept:d,total:leaves.filter(l=>l.department===d).length,approved:leaves.filter(l=>l.department===d&&l.status==='Approved').length})).filter(d=>d.total>0)
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Calendar size={24} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Leave Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Apply, approve and track employee leaves</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditLeave(null)}} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Apply Leave</button>
        </div>
      </div>
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Leave Requests'],['analytics','Analytics']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #10b981':'2px solid transparent',background:'transparent',color:activeTab===id?'#10b981':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total',value:leaves.length,color:'#3b82f6'},{label:'Pending',value:leaves.filter(l=>l.status==='Pending').length,color:'#f59e0b'},{label:'Approved',value:leaves.filter(l=>l.status==='Approved').length,color:'#10b981'},{label:'Rejected',value:leaves.filter(l=>l.status==='Rejected').length,color:'#ef4444'}].map((s,i)=>(
            <div key={i} onClick={()=>setFilterStatus(i===0?'All':s.label)} style={{background:'#1e293b',border:`1px solid ${filterStatus===s.label?s.color:'#334155'}`,borderRadius:12,padding:14,borderTop:`3px solid ${s.color}`,cursor:'pointer'}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>
        {activeTab==='list' && (
          <div>
            <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 12px',flex:1,minWidth:200}}>
                <Search size={13} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employee..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              {[['filterType',['All',...LEAVE_TYPES],filterType,setFilterType],['filterDept',['All',...DEPTS],filterDept,setFilterDept]].map(([k,opts,val,setter])=>(
                <select key={k} value={val} onChange={e=>setter(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                  {opts.map(o=><option key={o}>{o}</option>)}
                </select>
              ))}
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>{['Employee','Dept','Type','Start','End','Days','Status','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 14px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length===0?<tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'#64748b'}}>No leave requests</td></tr>
                  :filtered.map(l=>(
                    <tr key={l.leave_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'10px 14px',color:'#f1f5f9',fontSize:13,fontWeight:500}}>{l.employee_name}</td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{l.department}</td>
                      <td style={{padding:'10px 14px',color:'#94a3b8',fontSize:12}}>{l.leave_type}</td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{l.start_date?new Date(l.start_date).toLocaleDateString('en-IN'):''}</td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{l.end_date?new Date(l.end_date).toLocaleDateString('en-IN'):''}</td>
                      <td style={{padding:'10px 14px',color:'#f1f5f9',fontSize:13,fontWeight:600}}>{l.total_days||'—'}</td>
                      <td style={{padding:'10px 14px'}}>
                        <select value={l.status} onChange={e=>handleStatus(l.leave_id,e.target.value)} style={{background:STATUS_COLOR[l.status]+'20',border:`1px solid ${STATUS_COLOR[l.status]}40`,borderRadius:20,color:STATUS_COLOR[l.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                          {['Pending','Approved','Rejected','Cancelled'].map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{padding:'10px 14px'}}>
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>{setEditLeave(l);setForm({employee_name:l.employee_name,department:l.department,leave_type:l.leave_type,start_date:l.start_date?.split('T')[0]||'',end_date:l.end_date?.split('T')[0]||'',reason:l.reason||'',status:l.status});setShowForm(true)}} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:11}}>Edit</button>
                          <button onClick={()=>handleDelete(l.leave_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 6px',cursor:'pointer'}}><X size={11}/></button>
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
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Leave Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {statusData.map((s,i)=><Cell key={i} fill={STATUS_COLOR[s.name]||COLORS[i]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Leaves by Type</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={typeData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:9}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" name="Leaves" radius={[6,6,0,0]}>{typeData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Leave Requests by Department</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="dept" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/>
                  <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[4,4,0,0]}/>
                  <Bar dataKey="approved" name="Approved" fill="#10b981" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:480}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editLeave?'Edit Leave':'Apply Leave'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Employee Name *</label><input value={form.employee_name} onChange={e=>setForm({...form,employee_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label>
                <select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inputStyle}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Leave Type</label>
                <select value={form.leave_type} onChange={e=>setForm({...form,leave_type:e.target.value})} style={inputStyle}>{LEAVE_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Start Date</label><input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>End Date</label><input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Reason</label><textarea value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>{['Pending','Approved','Rejected'].map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editLeave?'Update':'Apply Leave'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}