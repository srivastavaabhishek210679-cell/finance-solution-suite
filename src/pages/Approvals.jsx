import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, CheckCircle, XCircle, Clock, RefreshCw, X, AlertTriangle } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/approvals'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const STATUS_COLOR = { Pending:'#f59e0b', Approved:'#10b981', Rejected:'#ef4444' }
const PRIORITY_COLOR = { Low:'#64748b', Normal:'#3b82f6', High:'#f59e0b', Urgent:'#ef4444' }

export default function Approvals() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [toast, setToast] = useState(null)
  const [comments, setComments] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [form, setForm] = useState({request_type:'Expense',title:'',description:'',amount:'',priority:'Normal',due_date:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }
  useEffect(()=>{ load() },[])

  const load = async () => {
    setLoading(true)
    try {
      const [rRes, sRes] = await Promise.all([
        fetch(API, {headers:getHeaders()}),
        fetch(API+'/stats', {headers:getHeaders()})
      ])
      const [rData, sData] = await Promise.all([rRes.json(), sRes.json()])
      setRequests(rData.data||[])
      setStats(sData.data||null)
    } catch(e) { showToast('Failed','error') }
    setLoading(false)
  }

  const handleCreate = async () => {
    if(!form.title) { showToast('Title required','error'); return }
    try {
      const res = await fetch(API, {method:'POST',headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast('Request submitted!'); setShowForm(false); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleApprove = async (id) => {
    await fetch(API+'/'+id+'/approve', {method:'PUT',headers:getHeaders(),body:JSON.stringify({comments})})
    showToast('Approved!'); setSelected(null); setComments(''); load()
  }

  const handleReject = async (id) => {
    if(!comments) { showToast('Please add rejection reason','error'); return }
    await fetch(API+'/'+id+'/reject', {method:'PUT',headers:getHeaders(),body:JSON.stringify({comments})})
    showToast('Rejected'); setSelected(null); setComments(''); load()
  }

  const filtered = filterStatus==='All' ? requests : requests.filter(r=>r.status===filterStatus)
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <CheckCircle size={24} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Approval Workflows</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Multi-level approval management</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>setShowForm(true)} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> New Request</button>
        </div>
      </div>
      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            {[
              {label:'Total Requests', value:stats.total||0, color:'#3b82f6'},
              {label:'Pending', value:stats.pending||0, color:'#f59e0b'},
              {label:'Approved', value:stats.approved||0, color:'#10b981'},
              {label:'Rejected', value:stats.rejected||0, color:'#ef4444'},
            ].map((s,i)=>(
              <div key={i} onClick={()=>setFilterStatus(i===0?'All':s.label)} style={{background:'#1e293b',border:`1px solid ${filterStatus===s.label?s.color:'#334155'}`,borderRadius:12,padding:16,borderTop:`3px solid ${s.color}`,cursor:'pointer'}}>
                <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'grid',gap:12}}>
          {loading ? <div style={{textAlign:'center',padding:60,color:'#64748b'}}>Loading...</div>
          : filtered.length===0 ? <div style={{textAlign:'center',padding:60,color:'#64748b',background:'#1e293b',borderRadius:12}}><CheckCircle size={40} style={{marginBottom:12,opacity:0.3}}/><p>No approval requests found</p></div>
          : filtered.map(r=>(
            <div key={r.request_id} style={{background:'#1e293b',border:`1px solid ${STATUS_COLOR[r.status]||'#334155'}30`,borderRadius:12,padding:20,display:'flex',gap:16,alignItems:'flex-start'}}>
              <div style={{width:44,height:44,borderRadius:10,background:STATUS_COLOR[r.status]+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {r.status==='Approved'?<CheckCircle size={20} style={{color:'#10b981'}}/>:r.status==='Rejected'?<XCircle size={20} style={{color:'#ef4444'}}/>:<Clock size={20} style={{color:'#f59e0b'}}/>}
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                  <div>
                    <span style={{color:'#f1f5f9',fontWeight:600,fontSize:15}}>{r.title}</span>
                    <span style={{background:'#3b82f620',color:'#3b82f6',padding:'2px 8px',borderRadius:20,fontSize:11,marginLeft:8}}>{r.request_type}</span>
                    <span style={{background:PRIORITY_COLOR[r.priority]+'20',color:PRIORITY_COLOR[r.priority],padding:'2px 8px',borderRadius:20,fontSize:11,marginLeft:4}}>{r.priority}</span>
                  </div>
                  <span style={{background:STATUS_COLOR[r.status]+'20',color:STATUS_COLOR[r.status],padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600}}>{r.status}</span>
                </div>
                {r.description && <p style={{color:'#64748b',fontSize:13,margin:'0 0 8px'}}>{r.description}</p>}
                <div style={{display:'flex',gap:16,fontSize:12,color:'#475569'}}>
                  {r.amount && <span>Amount: Rs.{Number(r.amount).toLocaleString()}</span>}
                  {r.due_date && <span>Due: {new Date(r.due_date).toLocaleDateString('en-IN')}</span>}
                  <span>Submitted: {new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
              {r.status==='Pending' && (
                <button onClick={()=>setSelected(r)} style={{background:'#10b98120',border:'1px solid #10b98140',borderRadius:8,color:'#10b981',padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:600,flexShrink:0}}>Review</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelected(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:500}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#f1f5f9',margin:'0 0 16px'}}>{selected.title}</h2>
            <div style={{background:'#0f172a',borderRadius:8,padding:14,marginBottom:16}}>
              {[['Type',selected.request_type],['Priority',selected.priority],['Amount',selected.amount?'Rs.'+Number(selected.amount).toLocaleString():'N/A'],['Description',selected.description||'N/A']].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #1e293b',fontSize:13}}>
                  <span style={{color:'#64748b'}}>{l}</span><span style={{color:'#f1f5f9'}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:6}}>Comments</label>
              <textarea value={comments} onChange={e=>setComments(e.target.value)} rows={3} placeholder="Add approval/rejection comments..." style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'10px 12px',fontSize:13,resize:'vertical',boxSizing:'border-box'}}/>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setSelected(null)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={()=>handleReject(selected.request_id)} style={{flex:1,background:'#ef444420',border:'1px solid #ef444440',borderRadius:8,color:'#ef4444',padding:'10px',cursor:'pointer',fontWeight:600}}>Reject</button>
              <button onClick={()=>handleApprove(selected.request_id)} style={{flex:1,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Approve</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:500}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>New Approval Request</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Type</label>
                <select value={form.request_type} onChange={e=>setForm({...form,request_type:e.target.value})} style={inputStyle}>
                  {['Expense','Leave','Purchase Order','Invoice','Contract','Other'].map(t=><option key={t}>{t}</option>)}
                </select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} style={{...inputStyle,resize:'vertical'}}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Amount</label><input type="number" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} style={inputStyle}/></div>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Priority</label>
                  <select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={inputStyle}>
                    {['Low','Normal','High','Urgent'].map(p=><option key={p}>{p}</option>)}
                  </select></div>
              </div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Due Date</label><input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} style={inputStyle}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}