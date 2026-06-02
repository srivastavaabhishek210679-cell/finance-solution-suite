import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Headphones, ArrowLeft, Plus, X, Edit, CheckCircle } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/helpdesk'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const PRIORITY_COLOR = { High:'#ef4444', Medium:'#f59e0b', Low:'#10b981', Critical:'#8b5cf6' }
const STATUS_COLOR = { Open:'#f59e0b', 'In Progress':'#3b82f6', Resolved:'#10b981', Closed:'#64748b' }
const CATEGORIES = ['Hardware','Software','Network','Access','Email','Printer','Other']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const AGENTS = ['Amit Kumar','Rajesh Mehta','IT Support Team']

export default function HelpdeskManagement() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('All')
  const [filterPriority, setFilterPriority] = useState('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({title:'',description:'',category:'Hardware',priority:'Medium',raised_by:'',department:'IT'})
  const [updateForm, setUpdateForm] = useState({status:'In Progress',assigned_to:'',resolution:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [tRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [t, s] = await Promise.all([tRes.json(), sRes.json()])
      setTickets(t.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleCreate = async () => {
    const res = await fetch(API, {method:'POST', headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast('Ticket created!'); setShowForm(false); load() }
    else showToast(data.message,'error')
  }

  const handleUpdate = async () => {
    const res = await fetch(API+'/'+selectedTicket.ticket_id, {method:'PUT', headers:getHeaders(), body:JSON.stringify(updateForm)})
    const data = await res.json()
    if(data.status==='success') { showToast('Ticket updated!'); setShowUpdateForm(false); load() }
    else showToast(data.message,'error')
  }

  const filtered = tickets.filter(t =>
    (t.title+t.raised_by+t.category).toLowerCase().includes(search.toLowerCase()) &&
    (filter==='All' || t.status===filter) &&
    (filterPriority==='All' || t.priority===filterPriority)
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',color:'#0f172a',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#ffffff',borderBottom:'1px solid #e2e8f0',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Headphones size={28} style={{color:'#3b82f6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>IT Helpdesk</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage support tickets and IT requests</p></div>
        <button onClick={()=>setShowForm(true)} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> New Ticket</button>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Tickets', value:stats.total, color:'#3b82f6'},
              {label:'Open', value:stats.open, color:'#f59e0b'},
              {label:'In Progress', value:stats.inProgress, color:'#8b5cf6'},
              {label:'Resolved', value:stats.resolved, color:'#10b981'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tickets..." style={{flex:1,minWidth:180,background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'10px 14px',fontSize:13}}/>
          <div style={{display:'flex',gap:4,background:'#ffffff',padding:4,borderRadius:8}}>
            {['All','Open','In Progress','Resolved','Closed'].map(s=>(
              <button key={s} onClick={()=>setFilter(s)} style={{padding:'6px 10px',borderRadius:6,border:'none',background:filter===s?'#3b82f6':'transparent',color:filter===s?'#fff':'#64748b',cursor:'pointer',fontSize:11}}>{s}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:4,background:'#ffffff',padding:4,borderRadius:8}}>
            {['All','Critical','High','Medium','Low'].map(p=>(
              <button key={p} onClick={()=>setFilterPriority(p)} style={{padding:'6px 10px',borderRadius:6,border:'none',background:filterPriority===p?'#8b5cf6':'transparent',color:filterPriority===p?'#fff':'#64748b',cursor:'pointer',fontSize:11}}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gap:10}}>
          {filtered.map(t=>(
            <div key={t.ticket_id} style={{background:'#ffffff',border:`1px solid ${STATUS_COLOR[t.status]}30`,borderLeft:`4px solid ${STATUS_COLOR[t.status]}`,borderRadius:12,padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                <div style={{display:'flex',gap:10,alignItems:'center'}}>
                  <span style={{color:'#64748b',fontSize:11,fontWeight:600}}>{t.ticket_number}</span>
                  <span style={{color:'#0f172a',fontWeight:600,fontSize:14}}>{t.title}</span>
                </div>
                <div style={{display:'flex',gap:6,alignItems:'center'}}>
                  <span style={{background:PRIORITY_COLOR[t.priority]+'20',color:PRIORITY_COLOR[t.priority],padding:'2px 8px',borderRadius:20,fontSize:11}}>{t.priority}</span>
                  <span style={{background:STATUS_COLOR[t.status]+'20',color:STATUS_COLOR[t.status],padding:'2px 8px',borderRadius:20,fontSize:11}}>{t.status}</span>
                  <button onClick={()=>{setSelectedTicket(t);setUpdateForm({status:t.status,assigned_to:t.assigned_to||'',resolution:t.resolution||''});setShowUpdateForm(true)}} style={{background:'#e2e8f0',border:'none',borderRadius:6,color:'#475569',padding:'4px 8px',cursor:'pointer',fontSize:11}}><Edit size={10}/></button>
                </div>
              </div>
              {t.description && <p style={{color:'#475569',fontSize:12,margin:'0 0 8px'}}>{t.description}</p>}
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,fontSize:12}}>
                <div><span style={{color:'#64748b'}}>Raised by: </span><span style={{color:'#475569'}}>{t.raised_by}</span></div>
                <div><span style={{color:'#64748b'}}>Dept: </span><span style={{color:'#475569'}}>{t.department}</span></div>
                <div><span style={{color:'#64748b'}}>Category: </span><span style={{color:'#475569'}}>{t.category}</span></div>
                <div><span style={{color:'#64748b'}}>Assigned: </span><span style={{color:'#3b82f6'}}>{t.assigned_to||'Unassigned'}</span></div>
              </div>
              {t.resolution && <div style={{background:'#f8fafc',borderRadius:8,padding:8,marginTop:8,fontSize:12,color:'#475569'}}><span style={{color:'#10b981',fontWeight:600}}>Resolution: </span>{t.resolution}</div>}
              <div style={{fontSize:11,color:'#64748b',marginTop:6}}>{new Date(t.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24,width:500}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#0f172a',margin:0}}>New Support Ticket</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['title','Title'],['raised_by','Raised By']].map(([key,label])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Priority</label><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{['Critical','High','Medium','Low'].map(p=><option key={p}>{p}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} rows={3} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create Ticket</button>
            </div>
          </div>
        </div>
      )}

      {showUpdateForm && selectedTicket && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowUpdateForm(false)}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24,width:440}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#0f172a',margin:0}}>Update Ticket</h2><button onClick={()=>setShowUpdateForm(false)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{background:'#f8fafc',borderRadius:8,padding:10,marginBottom:16,fontSize:13,color:'#475569'}}>{selectedTicket.ticket_number} — {selectedTicket.title}</div>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={updateForm.status} onChange={e=>setUpdateForm({...updateForm,status:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{['Open','In Progress','Resolved','Closed'].map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Assign To</label><select value={updateForm.assigned_to} onChange={e=>setUpdateForm({...updateForm,assigned_to:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}><option value="">Unassigned</option>{AGENTS.map(a=><option key={a}>{a}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Resolution Notes</label><textarea value={updateForm.resolution} onChange={e=>setUpdateForm({...updateForm,resolution:e.target.value})} rows={3} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowUpdateForm(false)} style={{flex:1,background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleUpdate} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Update Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
