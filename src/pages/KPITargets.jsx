import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Target, RefreshCw, X, TrendingUp, TrendingDown, Minus, Sync } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/kpi-targets'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['finance','sales','hr','supply','inventory','operations','compliance','project']
const PERIODS = ['daily','weekly','monthly','quarterly','annual']

export default function KPITargets() {
  const navigate = useNavigate()
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [filterCat, setFilterCat] = useState('all')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({category:'finance',metric_name:'',target_value:'',unit:'',period:'monthly',description:'',target_date:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }
  useEffect(()=>{ load() },[])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(API, {headers:getHeaders()})
      const data = await res.json()
      setTargets(data.data||[])
    } catch(e) {}
    setLoading(false)
  }

  const handleSave = async () => {
    if(!form.metric_name||!form.target_value) { showToast('Name and target required','error'); return }
    try {
      const url = editTarget ? API+'/'+editTarget.target_id : API
      const method = editTarget ? 'PUT' : 'POST'
      const res = await fetch(url, {method,headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast(editTarget?'Updated!':'Target created!'); setShowForm(false); setEditTarget(null); setForm({category:'finance',metric_name:'',target_value:'',unit:'',period:'monthly',description:'',target_date:''}); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleUpdateCurrent = async (id, current_value) => {
    await fetch(API+'/'+id, {method:'PUT',headers:getHeaders(),body:JSON.stringify({current_value})})
    showToast('Updated!'); load()
  }

  const handleDelete = async (id) => {
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const handleSync = async () => {
    await fetch(API+'/sync', {method:'PUT',headers:getHeaders()})
    showToast('Synced from live data!'); load()
  }

  const getProgress = (current, target) => Math.min(Math.round((parseFloat(current)||0) / (parseFloat(target)||1) * 100), 100)
  const getStatus = (progress) => progress >= 100 ? 'achieved' : progress >= 75 ? 'on-track' : progress >= 50 ? 'at-risk' : 'behind'
  const STATUS_COLOR = { achieved:'#10b981', 'on-track':'#3b82f6', 'at-risk':'#f59e0b', behind:'#ef4444' }

  const filtered = filterCat==='all' ? targets : targets.filter(t=>t.category===filterCat)

  const categoryStats = CATEGORIES.map(c => {
    const cats = targets.filter(t=>t.category===c)
    const avg = cats.length ? cats.reduce((s,t)=>s+getProgress(t.current_value,t.target_value),0)/cats.length : 0
    return {category:c, progress:Math.round(avg), count:cats.length}
  }).filter(c=>c.count>0)

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Target size={24} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>KPI Targets</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track performance against targets</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={handleSync} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 14px',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6}}><RefreshCw size={14}/> Sync Live</button>
          <button onClick={()=>setShowForm(true)} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Target</button>
        </div>
      </div>

      <div style={{padding:24}}>
        {/* Summary Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Total Targets', value:targets.length, color:'#3b82f6'},
            {label:'Achieved', value:targets.filter(t=>getProgress(t.current_value,t.target_value)>=100).length, color:'#10b981'},
            {label:'On Track', value:targets.filter(t=>{const p=getProgress(t.current_value,t.target_value);return p>=75&&p<100}).length, color:'#3b82f6'},
            {label:'Behind', value:targets.filter(t=>getProgress(t.current_value,t.target_value)<50).length, color:'#ef4444'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Category Progress Chart */}
        {categoryStats.length > 0 && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:20}}>
            <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>KPI Achievement by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                <XAxis dataKey="category" tick={{fill:'#64748b',fontSize:11}}/>
                <YAxis tick={{fill:'#64748b',fontSize:10}} domain={[0,100]} unit="%"/>
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9'}} formatter={(v)=>[v+'%','Achievement']}/>
                <Bar dataKey="progress" name="Achievement" fill="#10b981" radius={[6,6,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Filter */}
        <div style={{display:'flex',gap:6,marginBottom:16,flexWrap:'wrap'}}>
          {['all',...CATEGORIES].map(c=>(
            <button key={c} onClick={()=>setFilterCat(c)} style={{padding:'5px 14px',borderRadius:20,border:'1px solid '+(filterCat===c?'#10b981':'#334155'),background:filterCat===c?'#10b98120':'transparent',color:filterCat===c?'#10b981':'#64748b',cursor:'pointer',fontSize:12,textTransform:'capitalize'}}>{c}</button>
          ))}
        </div>

        {/* Targets Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
          {loading ? <div style={{color:'#64748b',gridColumn:'span 3',textAlign:'center',padding:60}}>Loading...</div>
          : filtered.map(t=>{
            const progress = getProgress(t.current_value, t.target_value)
            const status = getStatus(progress)
            const color = STATUS_COLOR[status]
            return (
              <div key={t.target_id} style={{background:'#1e293b',border:`1px solid ${color}30`,borderRadius:12,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <div>
                    <div style={{color:'#f1f5f9',fontWeight:600,fontSize:14,marginBottom:4}}>{t.metric_name}</div>
                    <div style={{display:'flex',gap:6}}>
                      <span style={{background:'#334155',color:'#94a3b8',padding:'2px 8px',borderRadius:20,fontSize:10,textTransform:'capitalize'}}>{t.category}</span>
                      <span style={{background:'#334155',color:'#94a3b8',padding:'2px 8px',borderRadius:20,fontSize:10,textTransform:'capitalize'}}>{t.period}</span>
                    </div>
                  </div>
                  <span style={{background:color+'20',color,padding:'4px 10px',borderRadius:20,fontSize:11,fontWeight:600,textTransform:'capitalize'}}>{status}</span>
                </div>

                {/* Progress Bar */}
                <div style={{marginBottom:12}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6,fontSize:12}}>
                    <span style={{color:'#64748b'}}>Progress</span>
                    <span style={{color,fontWeight:700}}>{progress}%</span>
                  </div>
                  <div style={{height:8,background:'#334155',borderRadius:4,overflow:'hidden'}}>
                    <div style={{height:'100%',width:progress+'%',background:`linear-gradient(90deg,${color},${color}aa)`,borderRadius:4,transition:'width 0.3s'}}></div>
                  </div>
                </div>

                {/* Values */}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                  <div style={{background:'#0f172a',borderRadius:8,padding:10}}>
                    <div style={{fontSize:10,color:'#64748b',marginBottom:2}}>CURRENT</div>
                    <div style={{fontSize:16,fontWeight:700,color:'#f1f5f9'}}>{parseFloat(t.current_value||0).toLocaleString()} <span style={{fontSize:11,color:'#64748b'}}>{t.unit}</span></div>
                  </div>
                  <div style={{background:'#0f172a',borderRadius:8,padding:10}}>
                    <div style={{fontSize:10,color:'#64748b',marginBottom:2}}>TARGET</div>
                    <div style={{fontSize:16,fontWeight:700,color:color}}>{parseFloat(t.target_value).toLocaleString()} <span style={{fontSize:11,color:'#64748b'}}>{t.unit}</span></div>
                  </div>
                </div>

                {/* Update Current Value */}
                <div style={{display:'flex',gap:6}}>
                  <input type="number" placeholder="Update current value" defaultValue={t.current_value} onBlur={e=>e.target.value!==String(t.current_value)&&handleUpdateCurrent(t.target_id,e.target.value)} style={{flex:1,background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#f1f5f9',padding:'6px 10px',fontSize:12}}/>
                  <button onClick={()=>{setEditTarget(t);setForm({category:t.category,metric_name:t.metric_name,target_value:t.target_value,unit:t.unit||'',period:t.period,description:t.description||'',target_date:t.target_date||''});setShowForm(true)}} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'6px 10px',cursor:'pointer',fontSize:12}}>Edit</button>
                  <button onClick={()=>handleDelete(t.target_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'6px 8px',cursor:'pointer'}}><X size={12}/></button>
                </div>

                {t.description && <div style={{color:'#475569',fontSize:11,marginTop:8}}>{t.description}</div>}
              </div>
            )
          })}
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:480}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editTarget?'Edit Target':'Add KPI Target'}</h2>
              <button onClick={()=>{setShowForm(false);setEditTarget(null)}} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label>
                  <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inputStyle}>
                    {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                  </select></div>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Period</label>
                  <select value={form.period} onChange={e=>setForm({...form,period:e.target.value})} style={inputStyle}>
                    {PERIODS.map(p=><option key={p}>{p}</option>)}
                  </select></div>
              </div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Metric Name *</label><input value={form.metric_name} onChange={e=>setForm({...form,metric_name:e.target.value})} placeholder="e.g. Monthly Revenue" style={inputStyle}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Target Value *</label><input type="number" value={form.target_value} onChange={e=>setForm({...form,target_value:e.target.value})} style={inputStyle}/></div>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Unit</label><input value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} placeholder="Rs, %, orders..." style={inputStyle}/></div>
              </div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Target Date</label><input type="date" value={form.target_date} onChange={e=>setForm({...form,target_date:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={inputStyle}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>{setShowForm(false);setEditTarget(null)}} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editTarget?'Update':'Create Target'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}