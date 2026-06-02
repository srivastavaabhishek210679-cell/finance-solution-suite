import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, ArrowLeft, Plus, CheckCircle, XCircle, Clock, X } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/leave-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const STATUS_COLOR = { Approved:'#10b981', Pending:'#f59e0b', Rejected:'#ef4444' }

export default function LeaveManagement() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [types, setTypes] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({employee_name:'',leave_type:'Annual Leave',start_date:'',end_date:'',reason:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [rRes, tRes, sRes] = await Promise.all([
        fetch(API, {headers:getHeaders()}),
        fetch(API+'/types', {headers:getHeaders()}),
        fetch(API+'/stats', {headers:getHeaders()})
      ])
      const [r, t, s] = await Promise.all([rRes.json(), tRes.json(), sRes.json()])
      setRequests(r.data||[]); setTypes(t.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleCreate = async () => {
    const days = Math.ceil((new Date(form.end_date)-new Date(form.start_date))/(1000*60*60*24))+1
    const res = await fetch(API, {method:'POST', headers:getHeaders(), body:JSON.stringify({...form,days})})
    const data = await res.json()
    if(data.status==='success') { showToast('Leave request submitted!'); setShowForm(false); load() }
    else showToast(data.message,'error')
  }

  const handleUpdateStatus = async (id, status) => {
    await fetch(API+'/'+id+'/status', {method:'PUT', headers:getHeaders(), body:JSON.stringify({status, approved_by:'Admin'})})
    showToast('Status updated!'); load()
  }

  const filtered = requests.filter(r => filter==='All' || r.status===filter)

  return (
    <div style={{minHeight:'100vh',background:'#f1f5f9',color:'#1e293b',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Calendar size={28} style={{color:'#8b5cf6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Leave Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage leave requests and approvals</p></div>
        <button onClick={()=>setShowForm(true)} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> New Request</button>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Requests', value:stats.total, color:'#3b82f6'},
              {label:'Pending', value:stats.pending, color:'#f59e0b'},
              {label:'Approved', value:stats.approved, color:'#10b981'},
              {label:'Leave Types', value:types.length, color:'#8b5cf6'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:28,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{color:'#1e293b',margin:0,fontSize:14}}>Leave Requests ({filtered.length})</h3>
              <div style={{display:'flex',gap:4,background:'#f8fafc',padding:4,borderRadius:8}}>
                {['All','Pending','Approved','Rejected'].map(s=>(
                  <button key={s} onClick={()=>setFilter(s)} style={{padding:'4px 12px',borderRadius:6,border:'none',background:filter===s?'#8b5cf6':'transparent',color:filter===s?'#fff':'#64748b',cursor:'pointer',fontSize:12}}>{s}</button>
                ))}
              </div>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid #e2e8f0'}}>{['Employee','Type','From','To','Days','Reason','Status','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
              <tbody>
                {filtered.map(r=>(
                  <tr key={r.leave_id} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={{padding:'10px 8px',color:'#1e293b',fontWeight:600,fontSize:13}}>{r.employee_name}</td>
                    <td style={{padding:'10px 8px',color:'#475569',fontSize:12}}>{r.leave_type}</td>
                    <td style={{padding:'10px 8px',color:'#475569',fontSize:12}}>{r.start_date?.slice(0,10)}</td>
                    <td style={{padding:'10px 8px',color:'#475569',fontSize:12}}>{r.end_date?.slice(0,10)}</td>
                    <td style={{padding:'10px 8px',color:'#3b82f6',fontWeight:600}}>{r.days}</td>
                    <td style={{padding:'10px 8px',color:'#64748b',fontSize:12,maxWidth:150,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.reason}</td>
                    <td style={{padding:'10px 8px'}}>
                      <span style={{background:STATUS_COLOR[r.status]+'20',color:STATUS_COLOR[r.status],padding:'2px 8px',borderRadius:20,fontSize:11}}>{r.status}</span>
                    </td>
                    <td style={{padding:'10px 8px'}}>
                      {r.status==='Pending' && (
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>handleUpdateStatus(r.leave_id,'Approved')} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'4px 8px',cursor:'pointer',fontSize:11}}><CheckCircle size={12}/></button>
                          <button onClick={()=>handleUpdateStatus(r.leave_id,'Rejected')} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 8px',cursor:'pointer',fontSize:11}}><XCircle size={12}/></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
            <h3 style={{color:'#1e293b',margin:'0 0 16px',fontSize:14}}>Leave Types</h3>
            {types.map(t=>(
              <div key={t.type_id} style={{background:'#f8fafc',borderRadius:8,padding:12,marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{color:'#1e293b',fontWeight:600,fontSize:13}}>{t.type_name}</div>
                  <div style={{color:'#64748b',fontSize:11}}>Max {t.max_days} days • {t.carry_forward?'Carry Forward':'No Carry Forward'}</div>
                </div>
                <span style={{background:'#e2e8f0',color:'#475569',padding:'4px 10px',borderRadius:20,fontSize:12,fontWeight:600}}>{t.max_days}d</span>
              </div>
            ))}
            {stats?.byType && (
              <div style={{marginTop:16}}>
                <h4 style={{color:'#1e293b',margin:'0 0 12px',fontSize:13}}>Usage by Type</h4>
                {stats.byType.map(t=>(
                  <div key={t.leave_type} style={{marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748b',marginBottom:4}}><span>{t.leave_type}</span><span style={{color:'#1e293b'}}>{t.count} requests • {t.total_days} days</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24,width:480}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#1e293b',margin:0}}>New Leave Request</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Employee Name</label><input value={form.employee_name} onChange={e=>setForm({...form,employee_name:e.target.value})} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Leave Type</label><select value={form.leave_type} onChange={e=>setForm({...form,leave_type:e.target.value})} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13}}>{types.map(t=><option key={t.type_id}>{t.type_name}</option>)}</select></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Start Date</label><input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>End Date</label><input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              </div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Reason</label><textarea value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} rows={3} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
