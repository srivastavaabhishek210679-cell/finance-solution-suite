import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowLeft, Plus, X, Star, Target } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/performance-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const RATING_COLOR = (r) => r >= 4.5 ? '#10b981' : r >= 3.5 ? '#3b82f6' : r >= 2.5 ? '#f59e0b' : '#ef4444'

export default function PerformanceManagement() {
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [goals, setGoals] = useState([])
  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState('reviews')
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editReview, setEditReview] = useState(null)
  const [selectedReview, setSelectedReview] = useState(null)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [reviewForm, setReviewForm] = useState({employee_name:'',department:'Finance',reviewer:'',review_period:'Q1 2026',overall_rating:0,goals_score:0,skills_score:0,attitude_score:0,leadership_score:0,status:'Draft',comments:''})
  const [goalForm, setGoalForm] = useState({employee_name:'',department:'Finance',goal_title:'',description:'',target_date:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [rRes, gRes, sRes] = await Promise.all([
        fetch(API+'/reviews', {headers:getHeaders()}),
        fetch(API+'/goals', {headers:getHeaders()}),
        fetch(API+'/stats', {headers:getHeaders()})
      ])
      const [r, g, s] = await Promise.all([rRes.json(), gRes.json(), sRes.json()])
      setReviews(r.data||[]); setGoals(g.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleSaveReview = async () => {
    const url = editReview ? API+'/reviews/'+editReview.review_id : API+'/reviews'
    const method = editReview ? 'PUT' : 'POST'
    const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(reviewForm)})
    const data = await res.json()
    if(data.status==='success') { showToast(editReview?'Review updated!':'Review created!'); setShowReviewForm(false); setEditReview(null); load() }
    else showToast(data.message,'error')
  }

  const handleSaveGoal = async () => {
    const res = await fetch(API+'/goals', {method:'POST', headers:getHeaders(), body:JSON.stringify(goalForm)})
    const data = await res.json()
    if(data.status==='success') { showToast('Goal created!'); setShowGoalForm(false); load() }
    else showToast(data.message,'error')
  }

  const handleUpdateProgress = async (goalId, progress) => {
    const status = progress >= 100 ? 'Completed' : 'In Progress'
    await fetch(API+'/goals/'+goalId+'/progress', {method:'PUT', headers:getHeaders(), body:JSON.stringify({progress, status})})
    load()
  }

  const getRadarData = (review) => [
    {subject:'Goals', score:review.goals_score},
    {subject:'Skills', score:review.skills_score},
    {subject:'Attitude', score:review.attitude_score},
    {subject:'Leadership', score:review.leadership_score},
  ]

  const exportCSV = () => { const rows = [['Employee','Dept','Rating','Period','Goals','Status'],...(reviews||[]).map(r=>[r.employee_name||'',r.department||'',r.overall_rating||0,r.review_period||'',r.goals_met||0,r.status||''])]; const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='performance.csv'; el.click() }
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>selectedReview?setSelectedReview(null):navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> {selectedReview?'Reviews':'Back'}</button>
        <TrendingUp size={28} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Performance Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Reviews, goals and performance tracking</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <button onClick={()=>setShowGoalForm(true)} style={{display:'flex',alignItems:'center',gap:6,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Target size={14}/> Add Goal</button>
          <button onClick={()=>{setShowReviewForm(true);setEditReview(null);setReviewForm({employee_name:'',department:'Finance',reviewer:'',review_period:'Q1 2026',overall_rating:0,goals_score:0,skills_score:0,attitude_score:0,leadership_score:0,status:'Draft',comments:''})}} style={{display:'flex',alignItems:'center',gap:6,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> New Review</button>
        </div>
      </div>

      <div style={{padding:24}}>
        {stats && !selectedReview && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Reviews', value:stats.total, color:'#3b82f6'},
              {label:'Avg Rating', value:Number(stats.avgRating||0).toFixed(1)+'/5', color:'#10b981'},
              {label:'Completed', value:stats.completed, color:'#8b5cf6'},
              {label:'Active Goals', value:goals.filter(g=>g.status==='In Progress').length, color:'#f59e0b'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {!selectedReview && (
          <div style={{display:'flex',gap:4,marginBottom:20,background:'#1e293b',padding:4,borderRadius:10,width:'fit-content'}}>
            {[['reviews','Performance Reviews'],['goals','Goals']].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{padding:'8px 20px',borderRadius:8,border:'none',background:tab===id?'#10b981':'transparent',color:tab===id?'#fff':'#64748b',cursor:'pointer',fontWeight:600,fontSize:13}}>{label}</button>
            ))}
          </div>
        )}

        {!selectedReview && tab==='reviews' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {reviews.map(r=>(
              <div key={r.review_id} onClick={()=>setSelectedReview(r)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,cursor:'pointer',transition:'border-color 0.2s'}} onMouseEnter={e=>e.currentTarget.style.borderColor='#10b981'} onMouseLeave={e=>e.currentTarget.style.borderColor='#334155'}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <div>
                    <div style={{color:'#f1f5f9',fontWeight:700,fontSize:14}}>{r.employee_name}</div>
                    <div style={{color:'#64748b',fontSize:12}}>{r.department} • {r.review_period}</div>
                  </div>
                  <div style={{textAlign:'center'}}>
                    <div style={{fontSize:24,fontWeight:700,color:RATING_COLOR(r.overall_rating)}}>{Number(r.overall_rating).toFixed(1)}</div>
                    <div style={{fontSize:10,color:'#64748b'}}>/ 5.0</div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12}}>
                  {[['Goals',r.goals_score],['Skills',r.skills_score],['Attitude',r.attitude_score],['Leadership',r.leadership_score]].map(([label,score])=>(
                    <div key={label}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748b',marginBottom:3}}><span>{label}</span><span style={{color:'#f1f5f9'}}>{score}%</span></div>
                      <div style={{background:'#0f172a',borderRadius:4,height:4}}><div style={{background:'#10b981',height:4,borderRadius:4,width:score+'%'}}></div></div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{background:r.status==='Completed'?'#10b98120':'#f59e0b20',color:r.status==='Completed'?'#10b981':'#f59e0b',padding:'2px 8px',borderRadius:20,fontSize:11}}>{r.status}</span>
                  <span style={{color:'#64748b',fontSize:11}}>By: {r.reviewer}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!selectedReview && tab==='goals' && (
          <div style={{display:'grid',gap:12}}>
            {goals.map(g=>(
              <div key={g.goal_id} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <div>
                    <div style={{color:'#f1f5f9',fontWeight:600,fontSize:14}}>{g.goal_title}</div>
                    <div style={{color:'#64748b',fontSize:12}}>{g.employee_name} • {g.department} • Due: {g.target_date?.slice(0,10)}</div>
                  </div>
                  <span style={{background:g.status==='Completed'?'#10b98120':'#3b82f620',color:g.status==='Completed'?'#10b981':'#3b82f6',padding:'2px 8px',borderRadius:20,fontSize:11,height:'fit-content'}}>{g.status}</span>
                </div>
                {g.description && <p style={{color:'#94a3b8',fontSize:12,margin:'0 0 12px'}}>{g.description}</p>}
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#64748b',marginBottom:4}}><span>Progress</span><span style={{color:'#10b981',fontWeight:600}}>{g.progress}%</span></div>
                    <div style={{background:'#0f172a',borderRadius:6,height:8}}><div style={{background:'#10b981',height:8,borderRadius:6,width:g.progress+'%',transition:'width 0.3s'}}></div></div>
                  </div>
                  <input type="number" min="0" max="100" defaultValue={g.progress} onBlur={e=>handleUpdateProgress(g.goal_id, Number(e.target.value))} style={{width:60,background:'#0f172a',border:'1px solid #334155',borderRadius:6,color:'#f1f5f9',padding:'4px 8px',fontSize:12,textAlign:'center'}}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedReview && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div>
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:16}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
                  <div><h2 style={{color:'#f1f5f9',margin:'0 0 4px',fontSize:18}}>{selectedReview.employee_name}</h2><p style={{color:'#64748b',margin:0,fontSize:13}}>{selectedReview.department} • {selectedReview.review_period}</p></div>
                  <div style={{textAlign:'center',background:RATING_COLOR(selectedReview.overall_rating)+'20',borderRadius:12,padding:'12px 20px'}}><div style={{fontSize:32,fontWeight:700,color:RATING_COLOR(selectedReview.overall_rating)}}>{Number(selectedReview.overall_rating).toFixed(1)}</div><div style={{fontSize:11,color:'#64748b'}}>Overall Rating</div></div>
                </div>
                <div style={{display:'grid',gap:10}}>
                  {[['Goals Achievement',selectedReview.goals_score,'#10b981'],['Technical Skills',selectedReview.skills_score,'#3b82f6'],['Work Attitude',selectedReview.attitude_score,'#8b5cf6'],['Leadership',selectedReview.leadership_score,'#f59e0b']].map(([label,score,color])=>(
                    <div key={label}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'#64748b',marginBottom:4}}><span>{label}</span><span style={{color,fontWeight:600}}>{score}%</span></div>
                      <div style={{background:'#0f172a',borderRadius:6,height:8}}><div style={{background:color,height:8,borderRadius:6,width:score+'%'}}></div></div>
                    </div>
                  ))}
                </div>
                {selectedReview.comments && <div style={{background:'#0f172a',borderRadius:8,padding:12,marginTop:12,fontSize:13,color:'#94a3b8'}}><strong style={{color:'#f1f5f9'}}>Comments: </strong>{selectedReview.comments}</div>}
              </div>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',marginBottom:16,fontSize:14}}>Performance Radar</h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={getRadarData(selectedReview)}>
                  <PolarGrid stroke="#334155"/>
                  <PolarAngleAxis dataKey="subject" tick={{fill:'#64748b',fontSize:12}}/>
                  <Radar dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.3}/>
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {showReviewForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowReviewForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>Performance Review</h2><button onClick={()=>setShowReviewForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['employee_name','Employee Name'],['reviewer','Reviewer'],['review_period','Review Period']].map(([key,label])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input value={reviewForm[key]||''} onChange={e=>setReviewForm({...reviewForm,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={reviewForm.department} onChange={e=>setReviewForm({...reviewForm,department:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              {[['overall_rating','Overall Rating (0-5)'],['goals_score','Goals Score (0-100)'],['skills_score','Skills Score (0-100)'],['attitude_score','Attitude Score (0-100)'],['leadership_score','Leadership Score (0-100)']].map(([key,label])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type="number" value={reviewForm[key]||0} onChange={e=>setReviewForm({...reviewForm,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={reviewForm.status} onChange={e=>setReviewForm({...reviewForm,status:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{['Draft','In Progress','Completed'].map(s=><option key={s}>{s}</option>)}</select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Comments</label><textarea value={reviewForm.comments||''} onChange={e=>setReviewForm({...reviewForm,comments:e.target.value})} rows={3} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowReviewForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSaveReview} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Save Review</button>
            </div>
          </div>
        </div>
      )}

      {showGoalForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowGoalForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:460}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>Add Goal</h2><button onClick={()=>setShowGoalForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gap:12}}>
              {[['employee_name','Employee Name'],['goal_title','Goal Title'],['target_date','Target Date','date']].map(([key,label,type='text'])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={goalForm[key]||''} onChange={e=>setGoalForm({...goalForm,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={goalForm.department} onChange={e=>setGoalForm({...goalForm,department:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={goalForm.description||''} onChange={e=>setGoalForm({...goalForm,description:e.target.value})} rows={2} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowGoalForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSaveGoal} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Add Goal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}