import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, RefreshCw, Search, Download, Headphones, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/helpdesk'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const PRIORITIES = ['Low','Medium','High','Critical']
const CATEGORIES = ['Technical','Billing','HR','IT Support','Facilities','General','Security','Network']
const STATUS_COLOR = { Open:'#3b82f6', 'In Progress':'#f59e0b', Resolved:'#10b981', Closed:'#64748b', Reopened:'#ef4444' }
const PRIORITY_COLOR = { Low:'#64748b', Medium:'#f59e0b', High:'#ef4444', Critical:'#8b5cf6' }
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899']

export default function HelpdeskManagement() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterPriority, setFilterPriority] = useState('All')
  const [filterCat, setFilterCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [editTicket, setEditTicket] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({title:'',description:'',category:'Technical',priority:'Medium',assigned_to:'',requester_name:'',requester_email:'',status:'Open'})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [tRes, sRes] = await Promise.all([fetch(API,{headers:getHeaders()}), fetch(API+'/stats',{headers:getHeaders()})])
      const [t, s] = await Promise.all([tRes.json(), sRes.json()])
      setTickets(t.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.title) { showToast('Title required','error'); return }
    try {
      const url = editTicket ? API+'/'+editTicket.ticket_id : API
      const res = await fetch(url, {method:editTicket?'PUT':'POST',headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast('Ticket saved!'); setShowForm(false); setEditTicket(null); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleStatus = async (id, status) => {
    await fetch(API+'/'+id+'/status', {method:'PUT',headers:getHeaders(),body:JSON.stringify({status})})
    showToast('Updated'); load()
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete ticket?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const exportCSV = () => {
    const rows = [['Ticket#','Title','Category','Priority','Status','Requester','Assigned To','Created'],
      ...filtered.map(t=>[t.ticket_number||t.ticket_id,t.title,t.category,t.priority,t.status,t.requester_name||'',t.assigned_to||'',t.created_at?.split('T')[0]||''])]
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='tickets.csv'; el.click()
  }

  const filtered = tickets.filter(t=>{
    const ms = !search||t.title?.toLowerCase().includes(search.toLowerCase())||t.requester_name?.toLowerCase().includes(search.toLowerCase())
    return ms&&(filterStatus==='All'||t.status===filterStatus)&&(filterPriority==='All'||t.priority===filterPriority)&&(filterCat==='All'||t.category===filterCat)
  })

  const statusData = Object.keys(STATUS_COLOR).map(s=>({name:s,value:tickets.filter(t=>t.status===s).length})).filter(d=>d.value>0)
  const priorityData = PRIORITIES.map(p=>({name:p,value:tickets.filter(t=>t.priority===p).length})).filter(d=>d.value>0)
  const catData = CATEGORIES.map(c=>({name:c,value:tickets.filter(t=>t.category===c).length})).filter(d=>d.value>0)
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Headphones size={24} style={{color:'#3b82f6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Helpdesk Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track and resolve support tickets</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditTicket(null);setForm({title:'',description:'',category:'Technical',priority:'Medium',assigned_to:'',requester_name:'',requester_email:'',status:'Open'})}} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> New Ticket</button>
        </div>
      </div>
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Tickets'],['analytics','Analytics']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #3b82f6':'2px solid transparent',background:'transparent',color:activeTab===id?'#3b82f6':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total',value:tickets.length,color:'#3b82f6'},{label:'Open',value:tickets.filter(t=>t.status==='Open').length,color:'#3b82f6'},{label:'In Progress',value:tickets.filter(t=>t.status==='In Progress').length,color:'#f59e0b'},{label:'Resolved',value:tickets.filter(t=>t.status==='Resolved').length,color:'#10b981'},{label:'Critical',value:tickets.filter(t=>t.priority==='Critical').length,color:'#8b5cf6'}].map((s,i)=>(
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
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tickets..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              {[['All','Open','In Progress','Resolved','Closed'],['All',...PRIORITIES],['All',...CATEGORIES]].map((opts,i)=>{
                const vals = [filterStatus,filterPriority,filterCat]; const setters = [setFilterStatus,setFilterPriority,setFilterCat]
                return <select key={i} value={vals[i]} onChange={e=>setters[i](e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{opts.map(o=><option key={o}>{o}</option>)}</select>
              })}
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>{['#','Title','Category','Priority','Requester','Assigned','Status','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 14px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length===0?<tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'#64748b'}}>No tickets found</td></tr>
                  :filtered.map(t=>(
                    <tr key={t.ticket_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'10px 14px',color:'#3b82f6',fontSize:12,fontWeight:600}}>#{t.ticket_number||t.ticket_id}</td>
                      <td style={{padding:'10px 14px'}}>
                        <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{t.title}</div>
                        {t.description&&<div style={{color:'#64748b',fontSize:11,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:200}}>{t.description}</div>}
                      </td>
                      <td style={{padding:'10px 14px',color:'#94a3b8',fontSize:12}}>{t.category}</td>
                      <td style={{padding:'10px 14px'}}><span style={{background:PRIORITY_COLOR[t.priority]+'20',color:PRIORITY_COLOR[t.priority],padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600}}>{t.priority}</span></td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{t.requester_name||'N/A'}</td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{t.assigned_to||'Unassigned'}</td>
                      <td style={{padding:'10px 14px'}}>
                        <select value={t.status} onChange={e=>handleStatus(t.ticket_id,e.target.value)} style={{background:STATUS_COLOR[t.status]+'20',border:`1px solid ${STATUS_COLOR[t.status]}40`,borderRadius:20,color:STATUS_COLOR[t.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                          {['Open','In Progress','Resolved','Closed','Reopened'].map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{padding:'10px 14px'}}>
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>setSelectedTicket(t)} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'4px 8px',cursor:'pointer',fontSize:11}}>View</button>
                          <button onClick={()=>{setEditTicket(t);setForm({title:t.title,description:t.description||'',category:t.category,priority:t.priority,assigned_to:t.assigned_to||'',requester_name:t.requester_name||'',requester_email:t.requester_email||'',status:t.status});setShowForm(true)}} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:11}}>Edit</button>
                          <button onClick={()=>handleDelete(t.ticket_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 6px',cursor:'pointer'}}><X size={11}/></button>
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
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Ticket Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {statusData.map((s,i)=><Cell key={i} fill={STATUS_COLOR[s.name]||COLORS[i]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>By Priority</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" name="Tickets" radius={[6,6,0,0]}>{priorityData.map((p,i)=><Cell key={i} fill={PRIORITY_COLOR[p.name]||COLORS[i]}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Tickets by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis type="number" tick={{fill:'#64748b',fontSize:10}}/><YAxis type="category" dataKey="name" tick={{fill:'#94a3b8',fontSize:11}} width={100}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" fill="#3b82f6" radius={[0,6,6,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      {selectedTicket && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelectedTicket(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:500}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{color:'#f1f5f9',margin:0,fontSize:16}}>#{selectedTicket.ticket_number||selectedTicket.ticket_id}: {selectedTicket.title}</h2>
              <button onClick={()=>setSelectedTicket(null)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={16}/></button>
            </div>
            {selectedTicket.description&&<p style={{color:'#94a3b8',fontSize:13,marginBottom:16}}>{selectedTicket.description}</p>}
            <div style={{display:'grid',gap:6}}>
              {[['Category',selectedTicket.category],['Priority',selectedTicket.priority],['Status',selectedTicket.status],['Requester',selectedTicket.requester_name||'N/A'],['Email',selectedTicket.requester_email||'N/A'],['Assigned To',selectedTicket.assigned_to||'Unassigned'],['Created',selectedTicket.created_at?new Date(selectedTicket.created_at).toLocaleDateString('en-IN'):'N/A']].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 10px',background:'#0f172a',borderRadius:6,fontSize:13}}>
                  <span style={{color:'#64748b'}}>{l}</span><span style={{color:'#f1f5f9'}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:520}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editTicket?'Edit Ticket':'New Ticket'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} style={{...inputStyle,resize:'vertical'}}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inputStyle}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Priority</label><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={inputStyle}>{PRIORITIES.map(p=><option key={p}>{p}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Requester Name</label><input value={form.requester_name} onChange={e=>setForm({...form,requester_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Requester Email</label><input value={form.requester_email} onChange={e=>setForm({...form,requester_email:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Assigned To</label><input value={form.assigned_to} onChange={e=>setForm({...form,assigned_to:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>{['Open','In Progress','Resolved','Closed'].map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editTicket?'Update':'Create Ticket'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}