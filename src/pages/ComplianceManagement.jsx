import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft, Plus, X, Edit, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/compliance'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['Tax','Legal','Quality','IT','HR','Finance','Environmental','Safety']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const PRIORITY_COLOR = { High:'#ef4444', Medium:'#f59e0b', Low:'#10b981' }
const STATUS_COLOR = { Pending:'#f59e0b', 'In Progress':'#3b82f6', Completed:'#10b981', Overdue:'#ef4444' }

export default function ComplianceManagement() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('All')
  const [filterCat, setFilterCat] = useState('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({title:'',category:'Tax',department:'Finance',description:'',due_date:'',owner:'',priority:'High',regulatory_body:'',penalty:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [iRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [i, s] = await Promise.all([iRes.json(), sRes.json()])
      setItems(i.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    const url = editItem ? API+'/'+editItem.compliance_id : API
    const method = editItem ? 'PUT' : 'POST'
    const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast(editItem?'Updated!':'Created!'); setShowForm(false); setEditItem(null); load() }
    else showToast(data.message,'error')
  }

  const handleStatusUpdate = async (id, status) => {
    const item = items.find(i=>i.compliance_id===id)
    await fetch(API+'/'+id, {method:'PUT', headers:getHeaders(), body:JSON.stringify({...item, status})})
    showToast('Status updated!'); load()
  }

  const getDaysUntilDue = (dueDate) => Math.ceil((new Date(dueDate)-new Date())/(1000*60*60*24))

  const filtered = items.filter(i =>
    (i.title+i.owner+i.regulatory_body).toLowerCase().includes(search.toLowerCase()) &&
    (filter==='All' || i.status===filter) &&
    (filterCat==='All' || i.category===filterCat)
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',color:'#0f172a',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#ffffff',borderBottom:'1px solid #e2e8f0',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Shield size={28} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Compliance Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track regulatory compliance, deadlines and audits</p></div>
        <button onClick={()=>{setShowForm(true);setEditItem(null);setForm({title:'',category:'Tax',department:'Finance',description:'',due_date:'',owner:'',priority:'High',regulatory_body:'',penalty:''})}} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Item</button>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Items', value:stats.total, color:'#3b82f6'},
              {label:'Pending', value:stats.pending, color:'#f59e0b'},
              {label:'Completed', value:stats.completed, color:'#10b981'},
              {label:'Overdue', value:stats.overdue, color:'#ef4444'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Category breakdown */}
        {stats?.byCategory?.length > 0 && (
          <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
            {stats.byCategory.map(c=>(
              <div key={c.category} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,padding:'8px 14px',display:'flex',gap:8,alignItems:'center',cursor:'pointer'}} onClick={()=>setFilterCat(filterCat===c.category?'All':c.category)}>
                <span style={{fontSize:12,color:'#475569'}}>{c.category}:</span>
                <span style={{fontSize:13,fontWeight:700,color:'#10b981'}}>{c.count}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search compliance items..." style={{flex:1,minWidth:180,background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'10px 14px',fontSize:13}}/>
          <div style={{display:'flex',gap:4,background:'#ffffff',padding:4,borderRadius:8}}>
            {['All','Pending','In Progress','Completed'].map(s=>(
              <button key={s} onClick={()=>setFilter(s)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:filter===s?'#10b981':'transparent',color:filter===s?'#fff':'#64748b',cursor:'pointer',fontSize:12}}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gap:12}}>
          {filtered.map(item=>{
            const days = getDaysUntilDue(item.due_date)
            const isOverdue = days < 0 && item.status !== 'Completed'
            const isUrgent = days <= 7 && days >= 0 && item.status !== 'Completed'
            return (
              <div key={item.compliance_id} style={{background:'#ffffff',border:`1px solid ${isOverdue?'#ef444440':isUrgent?'#f59e0b40':'#e2e8f0'}`,borderLeft:`4px solid ${isOverdue?'#ef4444':isUrgent?'#f59e0b':PRIORITY_COLOR[item.priority]}`,borderRadius:12,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <div style={{display:'flex',gap:10,alignItems:'center'}}>
                    {item.status==='Completed' ? <CheckCircle size={18} style={{color:'#10b981'}}/> : isOverdue ? <AlertTriangle size={18} style={{color:'#ef4444'}}/> : <Clock size={18} style={{color:'#f59e0b'}}/>}
                    <div>
                      <div style={{color:'#0f172a',fontWeight:700,fontSize:14}}>{item.title}</div>
                      <div style={{color:'#64748b',fontSize:12}}>{item.category} • {item.department} • {item.regulatory_body}</div>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <span style={{background:PRIORITY_COLOR[item.priority]+'20',color:PRIORITY_COLOR[item.priority],padding:'2px 8px',borderRadius:20,fontSize:11}}>{item.priority}</span>
                    <span style={{background:STATUS_COLOR[item.status]+'20',color:STATUS_COLOR[item.status]||'#64748b',padding:'2px 8px',borderRadius:20,fontSize:11}}>{item.status}</span>
                    <button onClick={()=>{setEditItem(item);setForm(item);setShowForm(true)}} style={{background:'#e2e8f0',border:'none',borderRadius:6,color:'#475569',padding:'4px 8px',cursor:'pointer'}}><Edit size={12}/></button>
                  </div>
                </div>
                {item.description && <p style={{color:'#475569',fontSize:12,margin:'0 0 10px'}}>{item.description}</p>}
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,fontSize:12}}>
                  <div><span style={{color:'#64748b'}}>Owner: </span><span style={{color:'#475569'}}>{item.owner}</span></div>
                  <div><span style={{color:'#64748b'}}>Due: </span><span style={{color:isOverdue?'#ef4444':isUrgent?'#f59e0b':'#475569'}}>{item.due_date?.slice(0,10)}</span></div>
                  <div><span style={{color:'#64748b'}}>Days: </span><span style={{color:isOverdue?'#ef4444':isUrgent?'#f59e0b':'#10b981',fontWeight:600}}>{isOverdue?Math.abs(days)+' overdue':days+' remaining'}</span></div>
                  {item.penalty && <div><span style={{color:'#64748b'}}>Penalty: </span><span style={{color:'#ef4444',fontSize:11}}>{item.penalty}</span></div>}
                </div>
                {item.status !== 'Completed' && (
                  <div style={{display:'flex',gap:6,marginTop:10}}>
                    {item.status==='Pending' && <button onClick={()=>handleStatusUpdate(item.compliance_id,'In Progress')} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 10px',cursor:'pointer',fontSize:11}}>Start</button>}
                    {item.status==='In Progress' && <button onClick={()=>handleStatusUpdate(item.compliance_id,'Completed')} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'4px 10px',cursor:'pointer',fontSize:11}}>Mark Complete</button>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24,width:560,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#0f172a',margin:0}}>{editItem?'Edit Item':'Add Compliance Item'}</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['title','Title'],['owner','Owner'],['regulatory_body','Regulatory Body'],['penalty','Penalty'],['due_date','Due Date','date']].map(([key,label,type='text'])=>(
                <div key={key} style={{gridColumn:key==='title'?'span 2':'auto'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Priority</label><select value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{['High','Medium','Low'].map(p=><option key={p}>{p}</option>)}</select></div>
              {editItem && <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status||'Pending'} onChange={e=>setForm({...form,status:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{['Pending','In Progress','Completed'].map(s=><option key={s}>{s}</option>)}</select></div>}
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} rows={2} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editItem?'Update':'Add Item'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
