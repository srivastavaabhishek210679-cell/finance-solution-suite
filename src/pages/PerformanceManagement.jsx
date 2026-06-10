import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, RefreshCw, Search, Download, Award, Star, Target, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/performance-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const PERIODS = ['Q1 2026','Q2 2026','Q3 2026','Q4 2026','Annual 2025','Annual 2026']
const STATUS_COLOR = { Draft:'#64748b', 'In Progress':'#f59e0b', Completed:'#10b981', Approved:'#3b82f6' }
const COLORS = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#14b8a6']

export default function PerformanceManagement() {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editReview, setEditReview] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({employee_name:'',department:'IT',review_period:'Q1 2026',reviewer:'',overall_rating:3,goals_achieved:0,total_goals:5,strengths:'',improvements:'',status:'In Progress',comments:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [rRes, sRes] = await Promise.all([fetch(API,{headers:getHeaders()}), fetch(API+'/stats',{headers:getHeaders()})])
      const [r, s] = await Promise.all([rRes.json(), sRes.json()])
      setReviews(r.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.employee_name) { showToast('Employee name required','error'); return }
    try {
      const url = editReview ? API+'/'+editReview.review_id : API
      const res = await fetch(url, {method:editReview?'PUT':'POST',headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast('Saved!'); setShowForm(false); setEditReview(null); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleStatus = async (id, status) => {
    await fetch(API+'/'+id+'/status', {method:'PUT',headers:getHeaders(),body:JSON.stringify({status})})
    showToast('Updated'); load()
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete review?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const exportCSV = () => {
    const rows = [['Employee','Dept','Period','Reviewer','Rating','Goals','Status'],
      ...filtered.map(r=>[r.employee_name,r.department,r.review_period,r.reviewer||'',r.overall_rating||0,`${r.goals_achieved||0}/${r.total_goals||0}`,r.status])]
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='performance.csv'; el.click()
  }

  const filtered = reviews.filter(r=>{
    const ms = !search||r.employee_name?.toLowerCase().includes(search.toLowerCase())||r.reviewer?.toLowerCase().includes(search.toLowerCase())
    return ms&&(filterDept==='All'||r.department===filterDept)&&(filterStatus==='All'||r.status===filterStatus)
  })

  const avgRating = reviews.length ? (reviews.reduce((s,r)=>s+parseFloat(r.overall_rating||0),0)/reviews.length).toFixed(1) : 0
  const ratingData = [1,2,3,4,5].map(r=>({name:r+' Star',value:reviews.filter(rev=>Math.round(parseFloat(rev.overall_rating||0))===r).length})).filter(d=>d.value>0)
  const deptData = DEPTS.map(d=>({name:d,count:reviews.filter(r=>r.department===d).length,avgRating:reviews.filter(r=>r.department===d).length?parseFloat((reviews.filter(r=>r.department===d).reduce((s,r)=>s+parseFloat(r.overall_rating||0),0)/reviews.filter(r=>r.department===d).length).toFixed(1)):0})).filter(d=>d.count>0)
  const statusData = Object.keys(STATUS_COLOR).map(s=>({name:s,value:reviews.filter(r=>r.status===s).length})).filter(d=>d.value>0)
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  const StarRating = ({rating}) => (
    <div style={{display:'flex',gap:2}}>
      {[1,2,3,4,5].map(i=><Star key={i} size={12} fill={i<=rating?'#f59e0b':'none'} stroke={i<=rating?'#f59e0b':'#64748b'}/>)}
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Award size={24} style={{color:'#3b82f6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Performance Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track employee reviews, goals and ratings</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditReview(null);setForm({employee_name:'',department:'IT',review_period:'Q1 2026',reviewer:'',overall_rating:3,goals_achieved:0,total_goals:5,strengths:'',improvements:'',status:'In Progress',comments:''})}} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> New Review</button>
        </div>
      </div>

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Reviews'],['analytics','Analytics']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #3b82f6':'2px solid transparent',background:'transparent',color:activeTab===id?'#3b82f6':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>

      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total Reviews',value:reviews.length,color:'#3b82f6'},{label:'Completed',value:reviews.filter(r=>r.status==='Completed').length,color:'#10b981'},{label:'In Progress',value:reviews.filter(r=>r.status==='In Progress').length,color:'#f59e0b'},{label:'Avg Rating',value:avgRating+'/5',color:'#f59e0b'},{label:'Top Performers',value:reviews.filter(r=>parseFloat(r.overall_rating||0)>=4).length,color:'#10b981'}].map((s,i)=>(
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
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employee..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['All',...DEPTS].map(d=><option key={d}>{d}</option>)}
              </select>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['All',...Object.keys(STATUS_COLOR)].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:14}}>
              {filtered.length===0?<div style={{textAlign:'center',padding:60,color:'#64748b',gridColumn:'span 3'}}>No reviews found</div>
              :filtered.map(r=>(
                <div key={r.review_id} style={{background:'#1e293b',border:`1px solid ${STATUS_COLOR[r.status]||'#334155'}30`,borderRadius:12,padding:18}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                    <div>
                      <div style={{color:'#f1f5f9',fontWeight:600,fontSize:14,marginBottom:2}}>{r.employee_name}</div>
                      <div style={{color:'#64748b',fontSize:12}}>{r.department} • {r.review_period}</div>
                    </div>
                    <select value={r.status} onChange={e=>handleStatus(r.review_id,e.target.value)} style={{background:STATUS_COLOR[r.status]+'20',border:`1px solid ${STATUS_COLOR[r.status]}40`,borderRadius:20,color:STATUS_COLOR[r.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                      {Object.keys(STATUS_COLOR).map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <StarRating rating={Math.round(parseFloat(r.overall_rating||0))}/>
                    <span style={{color:'#f59e0b',fontWeight:700,fontSize:14}}>{r.overall_rating||0}/5</span>
                  </div>
                  <div style={{marginBottom:8}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748b',marginBottom:4}}>
                      <span>Goals Achieved</span><span>{r.goals_achieved||0}/{r.total_goals||5}</span>
                    </div>
                    <div style={{height:6,background:'#334155',borderRadius:3}}>
                      <div style={{height:'100%',width:Math.min(100,Math.round((r.goals_achieved||0)/(r.total_goals||5)*100))+'%',background:'#10b981',borderRadius:3}}></div>
                    </div>
                  </div>
                  {r.reviewer&&<div style={{color:'#475569',fontSize:11,marginBottom:10}}>Reviewer: {r.reviewer}</div>}
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>{setEditReview(r);setForm({employee_name:r.employee_name,department:r.department,review_period:r.review_period,reviewer:r.reviewer||'',overall_rating:r.overall_rating||3,goals_achieved:r.goals_achieved||0,total_goals:r.total_goals||5,strengths:r.strengths||'',improvements:r.improvements||'',status:r.status,comments:r.comments||''});setShowForm(true)}} style={{flex:1,background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'6px',cursor:'pointer',fontSize:12}}>Edit</button>
                    <button onClick={()=>handleDelete(r.review_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'6px 8px',cursor:'pointer'}}><X size={13}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==='analytics' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Rating Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ratingData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" name="Reviews" fill="#f59e0b" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Review Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {statusData.map((s,i)=><Cell key={i} fill={STATUS_COLOR[s.name]||COLORS[i]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Avg Rating by Department</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}} domain={[0,5]}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="avgRating" name="Avg Rating" fill="#3b82f6" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editReview?'Edit Review':'New Review'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Employee Name *</label><input value={form.employee_name} onChange={e=>setForm({...form,employee_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inputStyle}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Review Period</label><select value={form.review_period} onChange={e=>setForm({...form,review_period:e.target.value})} style={inputStyle}>{PERIODS.map(p=><option key={p}>{p}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Reviewer</label><input value={form.reviewer} onChange={e=>setForm({...form,reviewer:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Overall Rating (1-5)</label><input type="number" min="1" max="5" step="0.5" value={form.overall_rating} onChange={e=>setForm({...form,overall_rating:parseFloat(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>{Object.keys(STATUS_COLOR).map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Goals Achieved</label><input type="number" value={form.goals_achieved} onChange={e=>setForm({...form,goals_achieved:parseInt(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Total Goals</label><input type="number" value={form.total_goals} onChange={e=>setForm({...form,total_goals:parseInt(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Strengths</label><input value={form.strengths} onChange={e=>setForm({...form,strengths:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Areas for Improvement</label><input value={form.improvements} onChange={e=>setForm({...form,improvements:e.target.value})} style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Comments</label><textarea value={form.comments} onChange={e=>setForm({...form,comments:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editReview?'Update':'Create Review'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}