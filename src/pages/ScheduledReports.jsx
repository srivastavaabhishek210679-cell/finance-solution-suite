import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Mail, RefreshCw, X, Clock, Play, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/scheduled-reports'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const REPORT_TYPES = ['Financial Summary','Sales Report','HR Report','Inventory Report','Expense Report','Payroll Report','Order Report','Compliance Report','KPI Dashboard','Custom']
const FREQ_COLOR = { daily:'#10b981', weekly:'#3b82f6', monthly:'#8b5cf6' }

export default function ScheduledReports() {
  const navigate = useNavigate()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({report_name:'',report_type:'Financial Summary',frequency:'weekly',send_time:'08:00',send_day:1,recipients:'',filters:{}})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }
  useEffect(()=>{ load() },[])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(API, {headers:getHeaders()})
      const data = await res.json()
      setSchedules(data.data||[])
    } catch(e) {}
    setLoading(false)
  }

  const handleCreate = async () => {
    if(!form.report_name||!form.recipients) { showToast('Name and recipients required','error'); return }
    try {
      const recipients = form.recipients.split(',').map(r=>r.trim()).filter(Boolean)
      const res = await fetch(API, {method:'POST',headers:getHeaders(),body:JSON.stringify({...form,recipients})})
      const data = await res.json()
      if(data.status==='success') { showToast('Schedule created!'); setShowForm(false); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleToggle = async (id) => {
    await fetch(API+'/'+id+'/toggle', {method:'PUT',headers:getHeaders()})
    showToast('Updated'); load()
  }

  const handleSendNow = async (id) => {
    const res = await fetch(API+'/'+id+'/send-now', {method:'POST',headers:getHeaders()})
    const data = await res.json()
    showToast(data.message||'Report sent!')
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete this schedule?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Mail size={24} style={{color:'#8b5cf6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Scheduled Reports</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Auto-email reports daily, weekly or monthly</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>setShowForm(true)} style={{background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> New Schedule</button>
        </div>
      </div>

      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Total Schedules', value:schedules.length, color:'#8b5cf6'},
            {label:'Active', value:schedules.filter(s=>s.is_active).length, color:'#10b981'},
            {label:'Paused', value:schedules.filter(s=>!s.is_active).length, color:'#64748b'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {loading ? <div style={{textAlign:'center',padding:60,color:'#64748b'}}>Loading...</div>
        : schedules.length===0 ? (
          <div style={{textAlign:'center',padding:80,color:'#64748b',background:'#1e293b',borderRadius:12}}>
            <Mail size={48} style={{marginBottom:16,opacity:0.3}}/>
            <h3 style={{color:'#94a3b8',margin:'0 0 8px'}}>No scheduled reports</h3>
            <p style={{margin:'0 0 20px',fontSize:13}}>Set up automated reports to be emailed regularly</p>
            <button onClick={()=>setShowForm(true)} style={{background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px 24px',cursor:'pointer',fontWeight:600}}>Create First Schedule</button>
          </div>
        ) : (
          <div style={{display:'grid',gap:16}}>
            {schedules.map(s=>(
              <div key={s.schedule_id} style={{background:'#1e293b',border:`1px solid ${s.is_active?'#8b5cf640':'#334155'}`,borderRadius:12,padding:20}}>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <div style={{width:48,height:48,borderRadius:10,background:s.is_active?'#8b5cf620':'#334155',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Mail size={22} style={{color:s.is_active?'#8b5cf6':'#64748b'}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                      <span style={{color:'#f1f5f9',fontWeight:700,fontSize:15}}>{s.report_name}</span>
                      <span style={{background:FREQ_COLOR[s.frequency]+'20',color:FREQ_COLOR[s.frequency],padding:'2px 8px',borderRadius:20,fontSize:11,textTransform:'capitalize'}}>{s.frequency}</span>
                      <span style={{background:s.is_active?'#10b98120':'#64748b20',color:s.is_active?'#10b981':'#64748b',padding:'2px 8px',borderRadius:20,fontSize:11}}>{s.is_active?'Active':'Paused'}</span>
                    </div>
                    <div style={{color:'#64748b',fontSize:12,marginBottom:4}}>{s.report_type} • Sends at {s.send_time}</div>
                    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                      {(s.recipients||[]).map((r,i)=><span key={i} style={{background:'#334155',color:'#94a3b8',padding:'2px 8px',borderRadius:20,fontSize:11}}>{r}</span>)}
                    </div>
                    <div style={{display:'flex',gap:16,marginTop:6,fontSize:11,color:'#475569'}}>
                      {s.last_sent && <span>Last sent: {new Date(s.last_sent).toLocaleDateString('en-IN')}</span>}
                      {s.next_send && <span>Next: {new Date(s.next_send).toLocaleDateString('en-IN')}</span>}
                    </div>
                  </div>
                  <div style={{display:'flex',gap:6,flexShrink:0}}>
                    <button onClick={()=>handleSendNow(s.schedule_id)} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:4}}><Play size={12}/> Send Now</button>
                    <button onClick={()=>handleToggle(s.schedule_id)} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'6px 10px',cursor:'pointer',fontSize:12}}>{s.is_active?'Pause':'Resume'}</button>
                    <button onClick={()=>handleDelete(s.schedule_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'6px 8px',cursor:'pointer'}}><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:500}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>Create Scheduled Report</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Report Name *</label><input value={form.report_name} onChange={e=>setForm({...form,report_name:e.target.value})} placeholder="Weekly Finance Summary" style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Report Type</label>
                <select value={form.report_type} onChange={e=>setForm({...form,report_type:e.target.value})} style={inputStyle}>
                  {REPORT_TYPES.map(t=><option key={t}>{t}</option>)}
                </select></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Frequency</label>
                  <select value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})} style={inputStyle}>
                    {['daily','weekly','monthly'].map(f=><option key={f}>{f}</option>)}
                  </select></div>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Send Time</label><input type="time" value={form.send_time} onChange={e=>setForm({...form,send_time:e.target.value})} style={inputStyle}/></div>
              </div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Recipients * (comma separated)</label><input value={form.recipients} onChange={e=>setForm({...form,recipients:e.target.value})} placeholder="email1@company.com, email2@company.com" style={inputStyle}/></div>
              <div style={{background:'#0f172a',borderRadius:8,padding:12}}>
                <div style={{fontSize:11,color:'#64748b',marginBottom:6}}>Schedule Preview</div>
                <div style={{color:'#94a3b8',fontSize:13}}>This report will be sent {form.frequency} at {form.send_time} to {form.recipients.split(',').filter(Boolean).length||0} recipient(s)</div>
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}