import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, Plus, X, Edit, AlertTriangle } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/risk-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['Cybersecurity','HR','Compliance','Operational','Financial','Legal','Strategic','Environmental']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const getRiskLevel = (score) => score >= 15 ? {label:'Critical',color:'#ef4444'} : score >= 10 ? {label:'High',color:'#f59e0b'} : score >= 5 ? {label:'Medium',color:'#3b82f6'} : {label:'Low',color:'#10b981'}

export default function RiskManagement() {
  const navigate = useNavigate()
  const [risks, setRisks] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editRisk, setEditRisk] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({risk_name:'',category:'Operational',department:'IT',description:'',likelihood:3,impact:3,owner:'',mitigation:'',due_date:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [rRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [r, s] = await Promise.all([rRes.json(), sRes.json()])
      setRisks(r.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    const url = editRisk ? API+'/'+editRisk.risk_id : API
    const method = editRisk ? 'PUT' : 'POST'
    const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast(editRisk?'Risk updated!':'Risk added!'); setShowForm(false); setEditRisk(null); load() }
    else showToast(data.message,'error')
  }

  const filtered = risks.filter(r =>
    (r.risk_name+r.category+r.department).toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus==='All' || r.status===filterStatus)
  )

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Shield size={28} style={{color:'#ef4444'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Risk Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Identify, assess and mitigate business risks</p></div>
        <button onClick={()=>{setShowForm(true);setEditRisk(null);setForm({risk_name:'',category:'Operational',department:'IT',description:'',likelihood:3,impact:3,owner:'',mitigation:'',due_date:''})}} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,background:'#ef4444',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Risk</button>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Risks', value:stats.total, color:'#3b82f6'},
              {label:'Open Risks', value:stats.open, color:'#f59e0b'},
              {label:'Critical/High Risks', value:stats.highRisk, color:'#ef4444'},
              {label:'Risk Categories', value:stats.byCategory?.length||0, color:'#8b5cf6'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Risk Matrix */}
        <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:20}}>
          <h3 style={{color:'#f1f5f9',marginBottom:16,fontSize:14}}>Risk Heatmap</h3>
          <div style={{display:'grid',gridTemplateColumns:'40px repeat(5,1fr)',gap:4}}>
            <div></div>
            {[1,2,3,4,5].map(i=><div key={i} style={{textAlign:'center',fontSize:10,color:'#64748b',padding:'4px 0'}}>Impact {i}</div>)}
            {[5,4,3,2,1].map(likelihood=>(
              <>
                <div key={'l'+likelihood} style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'#64748b'}}>L{likelihood}</div>
                {[1,2,3,4,5].map(impact=>{
                  const score = likelihood * impact
                  const level = getRiskLevel(score)
                  const count = risks.filter(r=>r.likelihood==likelihood && r.impact==impact).length
                  return (
                    <div key={impact} style={{background:level.color+'30',border:`1px solid ${level.color}40`,borderRadius:6,padding:'8px 4px',textAlign:'center',minHeight:40,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
                      <div style={{fontSize:10,color:level.color,fontWeight:600}}>{score}</div>
                      {count>0 && <div style={{fontSize:9,color:'#fff',background:level.color,borderRadius:10,padding:'0 4px',marginTop:2}}>{count}</div>}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </div>

        <div style={{display:'flex',gap:12,marginBottom:16}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search risks..." style={{flex:1,background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'10px 14px',fontSize:13}}/>
          <div style={{display:'flex',gap:4,background:'#1e293b',padding:4,borderRadius:8}}>
            {['All','Open','Mitigated','Closed'].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:filterStatus===s?'#ef4444':'transparent',color:filterStatus===s?'#fff':'#64748b',cursor:'pointer',fontSize:12}}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gap:12}}>
          {filtered.map(r=>{
            const level = getRiskLevel(r.risk_score)
            return (
              <div key={r.risk_id} style={{background:'#1e293b',border:`1px solid ${level.color}30`,borderLeft:`4px solid ${level.color}`,borderRadius:12,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    <AlertTriangle size={16} style={{color:level.color}}/>
                    <div>
                      <div style={{color:'#f1f5f9',fontWeight:700,fontSize:14}}>{r.risk_name}</div>
                      <div style={{color:'#64748b',fontSize:12}}>{r.category} • {r.department}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <div style={{textAlign:'center',background:level.color+'20',borderRadius:8,padding:'6px 12px'}}>
                      <div style={{fontSize:20,fontWeight:700,color:level.color}}>{r.risk_score}</div>
                      <div style={{fontSize:10,color:level.color}}>{level.label}</div>
                    </div>
                    <button onClick={()=>{setEditRisk(r);setForm(r);setShowForm(true)}} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'6px 8px',cursor:'pointer'}}><Edit size={12}/></button>
                  </div>
                </div>
                <p style={{color:'#94a3b8',fontSize:13,margin:'0 0 12px'}}>{r.description}</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,fontSize:12}}>
                  <div><span style={{color:'#64748b'}}>Likelihood: </span><span style={{color:'#f1f5f9',fontWeight:600}}>{r.likelihood}/5</span></div>
                  <div><span style={{color:'#64748b'}}>Impact: </span><span style={{color:'#f1f5f9',fontWeight:600}}>{r.impact}/5</span></div>
                  <div><span style={{color:'#64748b'}}>Owner: </span><span style={{color:'#94a3b8'}}>{r.owner}</span></div>
                  <div><span style={{color:'#64748b'}}>Due: </span><span style={{color:'#94a3b8'}}>{r.due_date?.slice(0,10)}</span></div>
                </div>
                {r.mitigation && <div style={{background:'#0f172a',borderRadius:8,padding:10,marginTop:10,fontSize:12,color:'#94a3b8'}}><span style={{color:'#10b981',fontWeight:600}}>Mitigation: </span>{r.mitigation}</div>}
                <div style={{marginTop:10}}><span style={{background:r.status==='Open'?'#f59e0b20':r.status==='Mitigated'?'#10b98120':'#64748b20',color:r.status==='Open'?'#f59e0b':r.status==='Mitigated'?'#10b981':'#64748b',padding:'2px 8px',borderRadius:20,fontSize:11}}>{r.status}</span></div>
              </div>
            )
          })}
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>{editRisk?'Edit Risk':'Add Risk'}</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['risk_name','Risk Name'],['owner','Risk Owner'],['due_date','Due Date','date']].map(([key,label,type='text'])=>(
                <div key={key} style={{gridColumn:key==='risk_name'?'span 2':'auto'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Likelihood (1-5)</label><input type="range" min="1" max="5" value={form.likelihood} onChange={e=>setForm({...form,likelihood:Number(e.target.value)})} style={{width:'100%'}}/><div style={{textAlign:'center',color:'#f1f5f9',fontSize:13,fontWeight:600}}>{form.likelihood}</div></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Impact (1-5)</label><input type="range" min="1" max="5" value={form.impact} onChange={e=>setForm({...form,impact:Number(e.target.value)})} style={{width:'100%'}}/><div style={{textAlign:'center',color:getRiskLevel(form.likelihood*form.impact).color,fontSize:13,fontWeight:600}}>Score: {form.likelihood*form.impact} ({getRiskLevel(form.likelihood*form.impact).label})</div></div>
              {editRisk && <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status||'Open'} onChange={e=>setForm({...form,status:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{['Open','Mitigated','Closed','Accepted'].map(s=><option key={s}>{s}</option>)}</select></div>}
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} rows={2} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Mitigation Plan</label><textarea value={form.mitigation||''} onChange={e=>setForm({...form,mitigation:e.target.value})} rows={2} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#ef4444',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editRisk?'Update':'Add Risk'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}