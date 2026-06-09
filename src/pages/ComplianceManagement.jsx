import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, RefreshCw, Search, Download, Shield, CheckCircle, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/compliance-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['Data Privacy','Financial','Employment','Health & Safety','Environmental','Tax','Industry Specific','Security','Contractual']
const STATUS_COLOR = { Compliant:'#10b981', 'Non-Compliant':'#ef4444', 'In Progress':'#f59e0b', 'Under Review':'#3b82f6', 'Not Applicable':'#64748b' }
const COLORS = ['#10b981','#ef4444','#f59e0b','#3b82f6','#8b5cf6','#14b8a6']

export default function ComplianceManagement() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterCat, setFilterCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({title:'',description:'',category:'Data Privacy',regulation:'',responsible_person:'',due_date:'',review_date:'',status:'In Progress',notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [iRes, sRes] = await Promise.all([fetch(API,{headers:getHeaders()}), fetch(API+'/stats',{headers:getHeaders()})])
      const [i, s] = await Promise.all([iRes.json(), sRes.json()])
      setItems(i.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.title) { showToast('Title required','error'); return }
    try {
      const url = editItem ? API+'/'+editItem.compliance_id : API
      const res = await fetch(url, {method:editItem?'PUT':'POST',headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast('Saved!'); setShowForm(false); setEditItem(null); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleStatus = async (id, status) => {
    await fetch(API+'/'+id+'/status', {method:'PUT',headers:getHeaders(),body:JSON.stringify({status})})
    showToast('Updated'); load()
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete item?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const exportCSV = () => {
    const rows = [['Title','Category','Regulation','Responsible','Status','Due Date','Review Date'],
      ...filtered.map(i=>[i.title,i.category,i.regulation||'',i.responsible_person||'',i.status,i.due_date||'',i.review_date||''])]
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='compliance.csv'; el.click()
  }

  const filtered = items.filter(i=>{
    const ms = !search||i.title?.toLowerCase().includes(search.toLowerCase())||i.regulation?.toLowerCase().includes(search.toLowerCase())
    return ms&&(filterStatus==='All'||i.status===filterStatus)&&(filterCat==='All'||i.category===filterCat)
  })

  const statusData = Object.keys(STATUS_COLOR).map(s=>({name:s,value:items.filter(i=>i.status===s).length})).filter(d=>d.value>0)
  const catData = CATEGORIES.map(c=>({name:c.split(' ')[0],full:c,compliant:items.filter(i=>i.category===c&&i.status==='Compliant').length,nonCompliant:items.filter(i=>i.category===c&&i.status==='Non-Compliant').length})).filter(d=>d.compliant+d.nonCompliant>0)
  const complianceRate = items.length ? Math.round(items.filter(i=>i.status==='Compliant').length/items.length*100) : 0
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Shield size={24} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Compliance Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track regulatory and policy compliance</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditItem(null);setForm({title:'',description:'',category:'Data Privacy',regulation:'',responsible_person:'',due_date:'',review_date:'',status:'In Progress',notes:''})}} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Item</button>
        </div>
      </div>
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Compliance Items'],['analytics','Analytics']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #10b981':'2px solid transparent',background:'transparent',color:activeTab===id?'#10b981':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total Items',value:items.length,color:'#3b82f6'},{label:'Compliant',value:items.filter(i=>i.status==='Compliant').length,color:'#10b981'},{label:'Non-Compliant',value:items.filter(i=>i.status==='Non-Compliant').length,color:'#ef4444'},{label:'In Progress',value:items.filter(i=>i.status==='In Progress').length,color:'#f59e0b'},{label:'Compliance Rate',value:complianceRate+'%',color:'#10b981'}].map((s,i)=>(
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
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search compliance items..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['All',...Object.keys(STATUS_COLOR)].map(s=><option key={s}>{s}</option>)}
              </select>
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['All',...CATEGORIES].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>{['Title','Category','Regulation','Responsible','Due Date','Review','Status','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 14px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length===0?<tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'#64748b'}}>No compliance items</td></tr>
                  :filtered.map(i=>(
                    <tr key={i.compliance_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'10px 14px'}}>
                        <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{i.title}</div>
                        {i.description&&<div style={{color:'#64748b',fontSize:11}}>{i.description.substring(0,50)}...</div>}
                      </td>
                      <td style={{padding:'10px 14px',color:'#94a3b8',fontSize:12}}>{i.category}</td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{i.regulation||'—'}</td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{i.responsible_person||'—'}</td>
                      <td style={{padding:'10px 14px',color:i.due_date&&new Date(i.due_date)<new Date()?'#ef4444':'#64748b',fontSize:12}}>{i.due_date?new Date(i.due_date).toLocaleDateString('en-IN'):'—'}</td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{i.review_date?new Date(i.review_date).toLocaleDateString('en-IN'):'—'}</td>
                      <td style={{padding:'10px 14px'}}>
                        <select value={i.status} onChange={e=>handleStatus(i.compliance_id,e.target.value)} style={{background:STATUS_COLOR[i.status]+'20',border:`1px solid ${STATUS_COLOR[i.status]}40`,borderRadius:20,color:STATUS_COLOR[i.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                          {Object.keys(STATUS_COLOR).map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{padding:'10px 14px'}}>
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>{setEditItem(i);setForm({title:i.title,description:i.description||'',category:i.category,regulation:i.regulation||'',responsible_person:i.responsible_person||'',due_date:i.due_date?.split('T')[0]||'',review_date:i.review_date?.split('T')[0]||'',status:i.status,notes:i.notes||''});setShowForm(true)}} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:11}}>Edit</button>
                          <button onClick={()=>handleDelete(i.compliance_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 6px',cursor:'pointer'}}><X size={11}/></button>
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
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Compliance Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {statusData.map((s,i)=><Cell key={i} fill={STATUS_COLOR[s.name]||COLORS[i]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600,alignSelf:'flex-start'}}>Overall Compliance Rate</h3>
              <div style={{fontSize:80,fontWeight:800,color:complianceRate>=80?'#10b981':complianceRate>=50?'#f59e0b':'#ef4444'}}>{complianceRate}%</div>
              <div style={{width:'100%',height:16,background:'#334155',borderRadius:8,marginTop:16}}>
                <div style={{height:'100%',width:complianceRate+'%',background:complianceRate>=80?'#10b981':complianceRate>=50?'#f59e0b':'#ef4444',borderRadius:8,transition:'width 1s'}}></div>
              </div>
              <div style={{color:'#64748b',fontSize:13,marginTop:8}}>{items.filter(i=>i.status==='Compliant').length} of {items.length} items compliant</div>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Compliance by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/>
                  <Bar dataKey="compliant" name="Compliant" fill="#10b981" radius={[4,4,0,0]}/>
                  <Bar dataKey="nonCompliant" name="Non-Compliant" fill="#ef4444" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:520,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editItem?'Edit Item':'Add Compliance Item'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inputStyle}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Regulation/Standard</label><input value={form.regulation} onChange={e=>setForm({...form,regulation:e.target.value})} placeholder="GDPR, ISO 27001..." style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Responsible Person</label><input value={form.responsible_person} onChange={e=>setForm({...form,responsible_person:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>{Object.keys(STATUS_COLOR).map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Due Date</label><input type="date" value={form.due_date} onChange={e=>setForm({...form,due_date:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Review Date</label><input type="date" value={form.review_date} onChange={e=>setForm({...form,review_date:e.target.value})} style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editItem?'Update':'Add Item'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}