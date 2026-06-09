import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Zap, Trash2, RefreshCw, X, CheckCircle, XCircle, ToggleLeft, ToggleRight } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/webhooks-config'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const EVENTS = ['order.created','order.updated','order.delivered','invoice.created','invoice.paid','po.created','po.approved','approval.approved','approval.rejected','payment.received','customer.created']

export default function WebhooksConfig() {
  const navigate = useNavigate()
  const [webhooks, setWebhooks] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [tab, setTab] = useState('webhooks')
  const [toast, setToast] = useState(null)
  const [testing, setTesting] = useState(null)
  const [form, setForm] = useState({name:'',url:'',events:[],secret:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }
  useEffect(()=>{ load() },[])

  const load = async () => {
    setLoading(true)
    try {
      const [wRes, lRes] = await Promise.all([
        fetch(API, {headers:getHeaders()}),
        fetch(API+'/logs', {headers:getHeaders()})
      ])
      const [wData, lData] = await Promise.all([wRes.json(), lRes.json()])
      setWebhooks(wData.data||[])
      setLogs(lData.data||[])
    } catch(e) {}
    setLoading(false)
  }

  const handleCreate = async () => {
    if(!form.name||!form.url) { showToast('Name and URL required','error'); return }
    try {
      const res = await fetch(API, {method:'POST',headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast('Webhook created!'); setShowForm(false); setForm({name:'',url:'',events:[],secret:''}); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleToggle = async (id) => {
    await fetch(API+'/'+id+'/toggle', {method:'PUT',headers:getHeaders()})
    showToast('Updated'); load()
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete webhook?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const handleTest = async (id) => {
    setTesting(id)
    try {
      const res = await fetch(API+'/'+id+'/test', {method:'POST',headers:getHeaders()})
      const data = await res.json()
      if(data.status==='success') showToast('Test sent! Status: '+data.response_status)
      else showToast('Test failed: '+data.message,'error')
      load()
    } catch(e) { showToast('Test failed','error') }
    setTesting(null)
  }

  const toggleEvent = (e) => setForm(f=>({...f,events:f.events.includes(e)?f.events.filter(x=>x!==e):[...f.events,e]}))
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Zap size={24} style={{color:'#f59e0b'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>API Webhooks</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Trigger external systems on events</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>setShowForm(true)} style={{background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Webhook</button>
        </div>
      </div>
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['webhooks','Webhooks'],['logs','Event Logs']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:tab===id?'2px solid #f59e0b':'2px solid transparent',background:'transparent',color:tab===id?'#f59e0b':'#64748b',cursor:'pointer',fontSize:13}}>{label}</button>
        ))}
      </div>
      <div style={{padding:24}}>
        {tab==='webhooks' && (
          <div style={{display:'grid',gap:16}}>
            {loading ? <div style={{textAlign:'center',padding:60,color:'#64748b'}}>Loading...</div>
            : webhooks.length===0 ? (
              <div style={{textAlign:'center',padding:60,color:'#64748b',background:'#1e293b',borderRadius:12}}>
                <Zap size={40} style={{marginBottom:12,opacity:0.3}}/>
                <p>No webhooks configured. Add one to start receiving events.</p>
              </div>
            ) : webhooks.map(w=>(
              <div key={w.webhook_id} style={{background:'#1e293b',border:`1px solid ${w.is_active?'#f59e0b40':'#334155'}`,borderRadius:12,padding:20}}>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <div style={{width:44,height:44,borderRadius:10,background:w.is_active?'#f59e0b20':'#334155',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Zap size={20} style={{color:w.is_active?'#f59e0b':'#64748b'}}/></div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                      <span style={{color:'#f1f5f9',fontWeight:700,fontSize:15}}>{w.name}</span>
                      <span style={{background:w.is_active?'#10b98120':'#ef444420',color:w.is_active?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11}}>{w.is_active?'Active':'Inactive'}</span>
                    </div>
                    <div style={{color:'#64748b',fontSize:12,marginBottom:6}}>{w.url}</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                      {(w.events||[]).map(e=><span key={e} style={{background:'#334155',color:'#94a3b8',padding:'2px 6px',borderRadius:4,fontSize:10}}>{e}</span>)}
                    </div>
                    {w.last_triggered && <div style={{color:'#475569',fontSize:11,marginTop:6}}>Last triggered: {new Date(w.last_triggered).toLocaleString('en-IN')} • {w.trigger_count} times</div>}
                  </div>
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <button onClick={()=>handleTest(w.webhook_id)} disabled={testing===w.webhook_id} style={{background:'#f59e0b20',border:'none',borderRadius:6,color:'#f59e0b',padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:600}}>{testing===w.webhook_id?'Testing...':'Test'}</button>
                    <button onClick={()=>handleToggle(w.webhook_id)} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'6px 10px',cursor:'pointer',fontSize:12}}>{w.is_active?'Disable':'Enable'}</button>
                    <button onClick={()=>handleDelete(w.webhook_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'6px 8px',cursor:'pointer'}}><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='logs' && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
            {logs.length===0 ? <div style={{textAlign:'center',padding:60,color:'#64748b'}}>No webhook logs yet</div> : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>
                  {['Webhook','Event','Status','Time'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'12px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {logs.map(l=>(
                    <tr key={l.log_id} style={{borderBottom:'1px solid #0f172a'}}>
                      <td style={{padding:'10px 16px',color:'#f1f5f9',fontSize:13}}>{l.webhook_name}</td>
                      <td style={{padding:'10px 16px'}}><span style={{background:'#f59e0b20',color:'#f59e0b',padding:'2px 8px',borderRadius:20,fontSize:11}}>{l.event}</span></td>
                      <td style={{padding:'10px 16px'}}><span style={{background:l.response_status>=200&&l.response_status<300?'#10b98120':'#ef444420',color:l.response_status>=200&&l.response_status<300?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11}}>{l.response_status||'Failed'}</span></td>
                      <td style={{padding:'10px 16px',color:'#64748b',fontSize:12}}>{new Date(l.triggered_at).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:520,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>Add Webhook</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gap:12,marginBottom:16}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Name *</label><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="My Webhook" style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Endpoint URL *</label><input value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="https://your-app.com/webhook" style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Secret Key (optional)</label><input value={form.secret} onChange={e=>setForm({...form,secret:e.target.value})} placeholder="webhook_secret_key" style={inputStyle}/></div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:8}}>Events to Subscribe</label>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {EVENTS.map(e=>(
                    <button key={e} onClick={()=>toggleEvent(e)} style={{background:form.events.includes(e)?'#f59e0b20':'#0f172a',border:`1px solid ${form.events.includes(e)?'#f59e0b':'#334155'}`,borderRadius:6,color:form.events.includes(e)?'#f59e0b':'#64748b',padding:'4px 10px',cursor:'pointer',fontSize:11}}>{e}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create Webhook</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}