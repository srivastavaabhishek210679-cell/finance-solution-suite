import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, RefreshCw, Search, Download, AlertTriangle, Shield } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/risk-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['Financial','Operational','Strategic','Compliance','Technology','Legal','HR','Market','Reputational']
const IMPACTS = ['Low','Medium','High','Critical']
const LIKELIHOODS = ['Rare','Unlikely','Possible','Likely','Almost Certain']
const STATUS_COLOR = { Open:'#ef4444', 'In Progress':'#f59e0b', Mitigated:'#10b981', Closed:'#64748b', Accepted:'#8b5cf6' }
const IMPACT_COLOR = { Low:'#10b981', Medium:'#f59e0b', High:'#ef4444', Critical:'#8b5cf6' }
const COLORS = ['#ef4444','#f59e0b','#10b981','#3b82f6','#8b5cf6','#14b8a6','#f97316','#ec4899']

export default function RiskManagement() {
  const navigate = useNavigate()
  const [risks, setRisks] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterImpact, setFilterImpact] = useState('All')
  const [filterCat, setFilterCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editRisk, setEditRisk] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({risk_name:'',description:'',category:'Operational',impact:'Medium',likelihood:'Possible',risk_score:0,owner:'',department:'',mitigation:'',status:'Open',due_date:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [rRes, sRes] = await Promise.all([fetch(API,{headers:getHeaders()}), fetch(API+'/stats',{headers:getHeaders()})])
      const [r, s] = await Promise.all([rRes.json(), sRes.json()])
      setRisks(r.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.risk_name) { showToast('Risk name required','error'); return }
    try {
      const url = editRisk ? API+'/'+editRisk.risk_id : API
      const res = await fetch(url, {method:editRisk?'PUT':'POST',headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast('Risk saved!'); setShowForm(false); setEditRisk(null); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleStatus = async (id, status) => {
    await fetch(API+'/'+id+'/status', {method:'PUT',headers:getHeaders(),body:JSON.stringify({status})})
    showToast('Updated'); load()
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete risk?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const exportCSV = () => {
    const rows = [['Risk Name','Category','Impact','Likelihood','Score','Owner','Status','Due Date'],
      ...filtered.map(r=>[r.risk_name,r.category,r.impact,r.likelihood,r.risk_score||'',r.owner||'',r.status,r.due_date||''])]
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='risks.csv'; el.click()
  }

  const filtered = risks.filter(r=>{
    const ms = !search||r.risk_name?.toLowerCase().includes(search.toLowerCase())||r.owner?.toLowerCase().includes(search.toLowerCase())
    return ms&&(filterStatus==='All'||r.status===filterStatus)&&(filterImpact==='All'||r.impact===filterImpact)&&(filterCat==='All'||r.category===filterCat)
  })

  const statusData = Object.keys(STATUS_COLOR).map(s=>({name:s,value:risks.filter(r=>r.status===s).length})).filter(d=>d.value>0)
  const impactData = IMPACTS.map(i=>({name:i,value:risks.filter(r=>r.impact===i).length})).filter(d=>d.value>0)
  const catData = CATEGORIES.map(c=>({name:c,value:risks.filter(r=>r.category===c).length,high:risks.filter(r=>r.category===c&&(r.impact==='High'||r.impact==='Critical')).length})).filter(d=>d.value>0)
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <AlertTriangle size={24} style={{color:'#ef4444'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Risk Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Identify, assess and mitigate risks</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditRisk(null);setForm({risk_name:'',description:'',category:'Operational',impact:'Medium',likelihood:'Possible',risk_score:0,owner:'',department:'',mitigation:'',status:'Open',due_date:''})}} style={{background:'#ef4444',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Risk</button>
        </div>
      </div>
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Risk Register'],['analytics','Risk Analytics'],['matrix','Risk Matrix']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #ef4444':'2px solid transparent',background:'transparent',color:activeTab===id?'#ef4444':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total Risks',value:risks.length,color:'#3b82f6'},{label:'Open',value:risks.filter(r=>r.status==='Open').length,color:'#ef4444'},{label:'High/Critical',value:risks.filter(r=>r.impact==='High'||r.impact==='Critical').length,color:'#f59e0b'},{label:'Mitigated',value:risks.filter(r=>r.status==='Mitigated').length,color:'#10b981'},{label:'Overdue',value:risks.filter(r=>r.due_date&&new Date(r.due_date)<new Date()&&r.status==='Open').length,color:'#8b5cf6'}].map((s,i)=>(
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
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search risks..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              {[[['All',...Object.keys(STATUS_COLOR)],filterStatus,setFilterStatus],[['All',...IMPACTS],filterImpact,setFilterImpact],[['All',...CATEGORIES],filterCat,setFilterCat]].map(([opts,val,setter],i)=>(
                <select key={i} value={val} onChange={e=>setter(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{opts.map(o=><option key={o}>{o}</option>)}</select>
              ))}
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>{['Risk','Category','Impact','Likelihood','Score','Owner','Status','Due','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 14px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length===0?<tr><td colSpan={9} style={{textAlign:'center',padding:40,color:'#64748b'}}>No risks found</td></tr>
                  :filtered.map(r=>(
                    <tr key={r.risk_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'10px 14px'}}>
                        <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{r.risk_name}</div>
                        {r.mitigation&&<div style={{color:'#64748b',fontSize:10}}>Mitigation: {r.mitigation.substring(0,40)}...</div>}
                      </td>
                      <td style={{padding:'10px 14px',color:'#94a3b8',fontSize:12}}>{r.category}</td>
                      <td style={{padding:'10px 14px'}}><span style={{background:IMPACT_COLOR[r.impact]+'20',color:IMPACT_COLOR[r.impact],padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600}}>{r.impact}</span></td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{r.likelihood}</td>
                      <td style={{padding:'10px 14px',color:'#f1f5f9',fontWeight:700,fontSize:13}}>{r.risk_score||'—'}</td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{r.owner||'—'}</td>
                      <td style={{padding:'10px 14px'}}>
                        <select value={r.status} onChange={e=>handleStatus(r.risk_id,e.target.value)} style={{background:STATUS_COLOR[r.status]+'20',border:`1px solid ${STATUS_COLOR[r.status]}40`,borderRadius:20,color:STATUS_COLOR[r.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                          {['Open','In Progress','Mitigated','Accepted','Closed'].map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{padding:'10px 14px',color:r.due_date&&new Date(r.due_date)<new Date()?'#ef4444':'#64748b',fontSize:12}}>{r.due_date?new Date(r.due_date).toLocaleDateString('en-IN'):'—'}</td>
                      <td style={{padding:'10px 14px'}}>
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>{setEditRisk(r);setForm({risk_name:r.risk_name,description:r.description||'',category:r.category,impact:r.impact,likelihood:r.likelihood,risk_score:r.risk_score||0,owner:r.owner||'',department:r.department||'',mitigation:r.mitigation||'',status:r.status,due_date:r.due_date?.split('T')[0]||''});setShowForm(true)}} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:11}}>Edit</button>
                          <button onClick={()=>handleDelete(r.risk_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 6px',cursor:'pointer'}}><X size={11}/></button>
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
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Risk Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {statusData.map((s,i)=><Cell key={i} fill={STATUS_COLOR[s.name]||COLORS[i]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Impact Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={impactData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" name="Risks" radius={[6,6,0,0]}>{impactData.map((d,i)=><Cell key={i} fill={IMPACT_COLOR[d.name]||COLORS[i]}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Risks by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/>
                  <Bar dataKey="value" name="Total" fill="#3b82f6" radius={[4,4,0,0]}/>
                  <Bar dataKey="high" name="High/Critical" fill="#ef4444" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {activeTab==='matrix' && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
            <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Risk Heat Map</h3>
            <div style={{display:'grid',gridTemplateColumns:'80px repeat(5,1fr)',gap:4}}>
              <div></div>
              {LIKELIHOODS.map(l=><div key={l} style={{textAlign:'center',color:'#64748b',fontSize:11,padding:8,fontWeight:600}}>{l}</div>)}
              {IMPACTS.slice().reverse().map(impact=>(
                <>
                  <div key={impact} style={{display:'flex',alignItems:'center',color:'#64748b',fontSize:11,fontWeight:600,padding:8}}>{impact}</div>
                  {LIKELIHOODS.map(likelihood=>{
                    const count = risks.filter(r=>r.impact===impact&&r.likelihood===likelihood).length
                    const impactScore = IMPACTS.indexOf(impact)+1
                    const likeScore = LIKELIHOODS.indexOf(likelihood)+1
                    const heat = impactScore*likeScore
                    const bg = heat>=15?'#ef4444':heat>=9?'#f59e0b':heat>=4?'#3b82f6':'#10b981'
                    return <div key={likelihood} style={{background:count>0?bg+'40':bg+'15',border:`1px solid ${bg}30`,borderRadius:6,padding:12,textAlign:'center',minHeight:60,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column'}}>
                      {count>0&&<div style={{fontSize:18,fontWeight:700,color:bg}}>{count}</div>}
                      {count>0&&<div style={{fontSize:9,color:bg}}>risks</div>}
                    </div>
                  })}
                </>
              ))}
            </div>
          </div>
        )}
      </div>
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:580,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editRisk?'Edit Risk':'Add Risk'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Risk Name *</label><input value={form.risk_name} onChange={e=>setForm({...form,risk_name:e.target.value})} style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inputStyle}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Impact</label><select value={form.impact} onChange={e=>setForm({...form,impact:e.target.value})} style={inputStyle}>{IMPACTS.map(i=><option key={i}>{i}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Likelihood</label><select value={form.likelihood} onChange={e=>setForm({...form,likelihood:e.target.value})} style={inputStyle}>{LIKELIHOODS.map(l=><option key={l}>{l}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Risk Score</label><input type="number" value={form.risk_score} onChange={e=>setForm({...form,risk_score:parseInt(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Owner</label><input value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Due Date</label><input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>{['Open','In Progress','Mitigated','Accepted','Closed'].map(s=><option key={s}>{s}</option>)}</select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Mitigation Plan</label><textarea value={form.mitigation} onChange={e=>setForm({...form,mitigation:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#ef4444',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editRisk?'Update':'Add Risk'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}