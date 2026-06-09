import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, RefreshCw, Search, Download, Plane, MapPin } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/travel'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const PURPOSES = ['Business Meeting','Conference','Training','Client Visit','Site Inspection','Sales Trip','Other']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const STATUS_COLOR = { Pending:'#f59e0b', Approved:'#10b981', Rejected:'#ef4444', Cancelled:'#64748b', Completed:'#3b82f6' }
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899']

export default function TravelManagement() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDept, setFilterDept] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({employee_name:'',department:'Sales',destination:'',purpose:'Business Meeting',departure_date:'',return_date:'',estimated_cost:0,actual_cost:0,transport_mode:'Flight',accommodation:'',advance_required:0,status:'Pending',notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [rRes, sRes] = await Promise.all([fetch(API,{headers:getHeaders()}), fetch(API+'/stats',{headers:getHeaders()})])
      const [r, s] = await Promise.all([rRes.json(), sRes.json()])
      setRequests(r.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.employee_name||!form.destination) { showToast('Employee and destination required','error'); return }
    try {
      const url = editItem ? API+'/'+editItem.travel_id : API
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
    const rows = [['Employee','Dept','Destination','Purpose','Departure','Return','Est.Cost','Act.Cost','Status'],
      ...filtered.map(r=>[r.employee_name,r.department,r.destination,r.purpose,r.departure_date||'',r.return_date||'',r.estimated_cost||0,r.actual_cost||0,r.status])]
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='travel.csv'; el.click()
  }

  const filtered = requests.filter(r=>{
    const ms = !search||r.employee_name?.toLowerCase().includes(search.toLowerCase())||r.destination?.toLowerCase().includes(search.toLowerCase())
    return ms&&(filterStatus==='All'||r.status===filterStatus)&&(filterDept==='All'||r.department===filterDept)
  })

  const statusData = Object.keys(STATUS_COLOR).map(s=>({name:s,value:requests.filter(r=>r.status===s).length})).filter(d=>d.value>0)
  const deptCost = DEPTS.map(d=>({dept:d,cost:requests.filter(r=>r.department===d).reduce((s,r)=>s+parseFloat(r.estimated_cost||0),0)})).filter(d=>d.cost>0)
  const purposeData = PURPOSES.map(p=>({name:p.split(' ')[0],value:requests.filter(r=>r.purpose===p).length})).filter(d=>d.value>0)
  const totalCost = requests.reduce((s,r)=>s+parseFloat(r.estimated_cost||0),0)
  const approvedCost = requests.filter(r=>r.status==='Approved'||r.status==='Completed').reduce((s,r)=>s+parseFloat(r.estimated_cost||0),0)
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Plane size={24} style={{color:'#14b8a6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Travel Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage business travel requests and expenses</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditItem(null);setForm({employee_name:'',department:'Sales',destination:'',purpose:'Business Meeting',departure_date:'',return_date:'',estimated_cost:0,actual_cost:0,transport_mode:'Flight',accommodation:'',advance_required:0,status:'Pending',notes:''})}} style={{background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> New Request</button>
        </div>
      </div>
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Travel Requests'],['analytics','Analytics']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #14b8a6':'2px solid transparent',background:'transparent',color:activeTab===id?'#14b8a6':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total Requests',value:requests.length,color:'#3b82f6'},{label:'Approved',value:requests.filter(r=>r.status==='Approved').length,color:'#10b981'},{label:'Total Cost',value:'Rs.'+Math.round(totalCost/1000)+'K',color:'#f59e0b'},{label:'Approved Cost',value:'Rs.'+Math.round(approvedCost/1000)+'K',color:'#10b981'}].map((s,i)=>(
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
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employee or destination..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['All',...Object.keys(STATUS_COLOR)].map(s=><option key={s}>{s}</option>)}
              </select>
              <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['All',...DEPTS].map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>{['Employee','Dept','Destination','Purpose','Departure','Return','Est.Cost','Status','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 12px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length===0?<tr><td colSpan={9} style={{textAlign:'center',padding:40,color:'#64748b'}}>No travel requests</td></tr>
                  :filtered.map(r=>(
                    <tr key={r.travel_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'10px 12px',color:'#f1f5f9',fontSize:13,fontWeight:500}}>{r.employee_name}</td>
                      <td style={{padding:'10px 12px',color:'#64748b',fontSize:12}}>{r.department}</td>
                      <td style={{padding:'10px 12px'}}>
                        <div style={{color:'#14b8a6',fontSize:13,display:'flex',alignItems:'center',gap:4}}><MapPin size={11}/>{r.destination}</div>
                      </td>
                      <td style={{padding:'10px 12px',color:'#94a3b8',fontSize:12}}>{r.purpose}</td>
                      <td style={{padding:'10px 12px',color:'#64748b',fontSize:12}}>{r.departure_date?new Date(r.departure_date).toLocaleDateString('en-IN'):'—'}</td>
                      <td style={{padding:'10px 12px',color:'#64748b',fontSize:12}}>{r.return_date?new Date(r.return_date).toLocaleDateString('en-IN'):'—'}</td>
                      <td style={{padding:'10px 12px',color:'#f1f5f9',fontSize:13,fontWeight:600}}>Rs.{Number(r.estimated_cost||0).toLocaleString()}</td>
                      <td style={{padding:'10px 12px'}}>
                        <select value={r.status} onChange={e=>handleStatus(r.travel_id,e.target.value)} style={{background:STATUS_COLOR[r.status]+'20',border:`1px solid ${STATUS_COLOR[r.status]}40`,borderRadius:20,color:STATUS_COLOR[r.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                          {Object.keys(STATUS_COLOR).map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{padding:'10px 12px'}}>
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>{setEditItem(r);setForm({employee_name:r.employee_name,department:r.department,destination:r.destination,purpose:r.purpose,departure_date:r.departure_date?.split('T')[0]||'',return_date:r.return_date?.split('T')[0]||'',estimated_cost:r.estimated_cost||0,actual_cost:r.actual_cost||0,transport_mode:r.transport_mode||'Flight',accommodation:r.accommodation||'',advance_required:r.advance_required||0,status:r.status,notes:r.notes||''});setShowForm(true)}} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:11}}>Edit</button>
                          <button onClick={()=>handleDelete(r.travel_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 6px',cursor:'pointer'}}><X size={11}/></button>
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
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Request Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {statusData.map((s,i)=><Cell key={i} fill={STATUS_COLOR[s.name]||COLORS[i]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Travel by Purpose</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={purposeData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" name="Trips" fill="#14b8a6" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Travel Cost by Department</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptCost}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="dept" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}} tickFormatter={v=>'Rs.'+Math.round(v/1000)+'K'}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}} formatter={v=>['Rs.'+Number(v).toLocaleString(),'Cost']}/>
                  <Bar dataKey="cost" name="Estimated Cost" fill="#14b8a6" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:580,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editItem?'Edit Request':'New Travel Request'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Employee Name *</label><input value={form.employee_name} onChange={e=>setForm({...form,employee_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inputStyle}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Destination *</label><input value={form.destination} onChange={e=>setForm({...form,destination:e.target.value})} placeholder="City, Country" style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Purpose</label><select value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})} style={inputStyle}>{PURPOSES.map(p=><option key={p}>{p}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Departure Date</label><input type="date" value={form.departure_date} onChange={e=>setForm({...form,departure_date:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Return Date</label><input type="date" value={form.return_date} onChange={e=>setForm({...form,return_date:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Transport Mode</label><select value={form.transport_mode} onChange={e=>setForm({...form,transport_mode:e.target.value})} style={inputStyle}>{['Flight','Train','Bus','Car','Other'].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Accommodation</label><input value={form.accommodation} onChange={e=>setForm({...form,accommodation:e.target.value})} placeholder="Hotel name" style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Estimated Cost (Rs)</label><input type="number" value={form.estimated_cost} onChange={e=>setForm({...form,estimated_cost:parseFloat(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Advance Required (Rs)</label><input type="number" value={form.advance_required} onChange={e=>setForm({...form,advance_required:parseFloat(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>{Object.keys(STATUS_COLOR).map(s=><option key={s}>{s}</option>)}</select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editItem?'Update':'Submit Request'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}