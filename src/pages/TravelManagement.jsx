import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, ArrowLeft, Plus, X, CheckCircle, XCircle, Plane } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/travel'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const STATUS_COLOR = { Approved:'#10b981', Pending:'#f59e0b', Rejected:'#ef4444', Completed:'#3b82f6' }
const TRAVEL_MODES = ['Flight','Train','Bus','Car','Cab']

export default function TravelManagement() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({employee_name:'',department:'Finance',destination:'',purpose:'',departure_date:'',return_date:'',travel_mode:'Flight',estimated_cost:0,hotel_required:false,advance_required:0,notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [rRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [r, s] = await Promise.all([rRes.json(), sRes.json()])
      setRequests(r.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleCreate = async () => {
    const res = await fetch(API, {method:'POST', headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast('Travel request submitted!'); setShowForm(false); load() }
    else showToast(data.message,'error')
  }

  const handleUpdateStatus = async (id, status) => {
    await fetch(API+'/'+id+'/status', {method:'PUT', headers:getHeaders(), body:JSON.stringify({status, approved_by:'Admin'})})
    showToast('Status updated!'); load()
  }

  const filtered = requests.filter(r =>
    (r.employee_name+r.destination+r.department).toLowerCase().includes(search.toLowerCase()) &&
    (filter==='All' || r.status===filter)
  )

  const getDays = (dep, ret) => {
    if(!dep || !ret) return 0
    return Math.ceil((new Date(ret)-new Date(dep))/(1000*60*60*24))
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Plane size={28} style={{color:'#14b8a6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Travel Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage travel requests, approvals and expenses</p></div>
        <button onClick={()=>setShowForm(true)} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> New Request</button>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Requests', value:stats.total, color:'#14b8a6'},
              {label:'Pending Approval', value:stats.pending, color:'#f59e0b'},
              {label:'Approved Trips', value:stats.approved, color:'#10b981'},
              {label:'Total Travel Cost', value:'₹'+Number(stats.totalCost||0).toLocaleString(), color:'#3b82f6'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'flex',gap:12,marginBottom:16}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search travel requests..." style={{flex:1,background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'10px 14px',fontSize:13}}/>
          <div style={{display:'flex',gap:4,background:'#1e293b',padding:4,borderRadius:8}}>
            {['All','Pending','Approved','Rejected','Completed'].map(s=>(
              <button key={s} onClick={()=>setFilter(s)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:filter===s?'#14b8a6':'transparent',color:filter===s?'#fff':'#64748b',cursor:'pointer',fontSize:12}}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gap:12}}>
          {filtered.map(r=>(
            <div key={r.travel_id} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                <div style={{display:'flex',gap:12,alignItems:'center'}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:'#14b8a620',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Plane size={18} style={{color:'#14b8a6'}}/>
                  </div>
                  <div>
                    <div style={{color:'#f1f5f9',fontWeight:700,fontSize:14}}>{r.employee_name} → {r.destination}</div>
                    <div style={{color:'#64748b',fontSize:12}}>{r.department} • {r.travel_mode} • {getDays(r.departure_date,r.return_date)} days</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{background:STATUS_COLOR[r.status]+'20',color:STATUS_COLOR[r.status],padding:'2px 8px',borderRadius:20,fontSize:11}}>{r.status}</span>
                  {r.status==='Pending' && (
                    <div style={{display:'flex',gap:4}}>
                      <button onClick={()=>handleUpdateStatus(r.travel_id,'Approved')} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'4px 8px',cursor:'pointer',fontSize:11}}><CheckCircle size={12}/></button>
                      <button onClick={()=>handleUpdateStatus(r.travel_id,'Rejected')} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 8px',cursor:'pointer',fontSize:11}}><XCircle size={12}/></button>
                    </div>
                  )}
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,fontSize:12}}>
                <div><span style={{color:'#64748b'}}>Departure: </span><span style={{color:'#94a3b8'}}>{r.departure_date?.slice(0,10)}</span></div>
                <div><span style={{color:'#64748b'}}>Return: </span><span style={{color:'#94a3b8'}}>{r.return_date?.slice(0,10)}</span></div>
                <div><span style={{color:'#64748b'}}>Est. Cost: </span><span style={{color:'#14b8a6',fontWeight:600}}>₹{Number(r.estimated_cost).toLocaleString()}</span></div>
                <div><span style={{color:'#64748b'}}>Hotel: </span><span style={{color:'#94a3b8'}}>{r.hotel_required?'Required':'Not Required'}</span></div>
                <div><span style={{color:'#64748b'}}>Advance: </span><span style={{color:'#f59e0b'}}>₹{Number(r.advance_required).toLocaleString()}</span></div>
              </div>
              {r.purpose && <div style={{background:'#0f172a',borderRadius:8,padding:10,marginTop:10,fontSize:12,color:'#94a3b8'}}><span style={{color:'#64748b'}}>Purpose: </span>{r.purpose}</div>}
              {r.approved_by && <div style={{fontSize:11,color:'#64748b',marginTop:8}}>Approved by: {r.approved_by}</div>}
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:580,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>New Travel Request</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['employee_name','Employee Name'],['destination','Destination'],['departure_date','Departure Date','date'],['return_date','Return Date','date'],['estimated_cost','Estimated Cost','number'],['advance_required','Advance Required','number']].map(([key,label,type='text'])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Travel Mode</label><select value={form.travel_mode} onChange={e=>setForm({...form,travel_mode:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{TRAVEL_MODES.map(m=><option key={m}>{m}</option>)}</select></div>
              <div style={{display:'flex',alignItems:'center',gap:8,paddingTop:20}}><input type="checkbox" checked={form.hotel_required} onChange={e=>setForm({...form,hotel_required:e.target.checked})} style={{width:16,height:16}}/><label style={{color:'#94a3b8',fontSize:13}}>Hotel Required</label></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Purpose</label><textarea value={form.purpose||''} onChange={e=>setForm({...form,purpose:e.target.value})} rows={2} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}