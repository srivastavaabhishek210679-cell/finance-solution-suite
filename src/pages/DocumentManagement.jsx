import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, RefreshCw, Search, Download, FileText, Eye, Trash2, Filter } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/document-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['Contract','Policy','Report','Invoice','HR Document','Legal','Financial','Technical','Marketing','Other']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const STATUS_COLOR = { Active:'#10b981', Archived:'#64748b', Draft:'#f59e0b', Expired:'#ef4444' }
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899']

export default function DocumentManagement() {
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterDept, setFilterDept] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editDoc, setEditDoc] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({title:'',category:'Contract',department:'Legal',description:'',file_type:'PDF',file_size:'',version:'1.0',status:'Active',tags:'',owner:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [dRes, sRes] = await Promise.all([fetch(API,{headers:getHeaders()}), fetch(API+'/stats',{headers:getHeaders()})])
      const [d, s] = await Promise.all([dRes.json(), sRes.json()])
      setDocs(d.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.title) { showToast('Title required','error'); return }
    try {
      const url = editDoc ? API+'/'+editDoc.document_id : API
      const res = await fetch(url, {method:editDoc?'PUT':'POST',headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast(editDoc?'Updated!':'Document added!'); setShowForm(false); setEditDoc(null); load() }
      else showToast(data.message||'Failed','error')
    } catch(e) { showToast('Failed','error') }
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete document?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const handleStatus = async (id, status) => {
    await fetch(API+'/'+id+'/status', {method:'PUT',headers:getHeaders(),body:JSON.stringify({status})})
    showToast('Updated'); load()
  }

  const exportCSV = () => {
    const rows = [['Title','Category','Department','File Type','Version','Status','Owner','Tags'],
      ...filtered.map(d=>[d.title,d.category,d.department,d.file_type||'',d.version||'',d.status,d.owner||'',d.tags||''])]
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='documents.csv'; el.click()
  }

  const filtered = docs.filter(d=>{
    const ms = !search||d.title?.toLowerCase().includes(search.toLowerCase())||d.owner?.toLowerCase().includes(search.toLowerCase())
    return ms&&(filterCat==='All'||d.category===filterCat)&&(filterDept==='All'||d.department===filterDept)&&(filterStatus==='All'||d.status===filterStatus)
  })

  const catData = CATEGORIES.map(c=>({name:c.split(' ')[0],value:docs.filter(d=>d.category===c).length})).filter(d=>d.value>0)
  const deptData = DEPTS.map(d=>({name:d,value:docs.filter(doc=>doc.department===d).length})).filter(d=>d.value>0)
  const statusData = Object.keys(STATUS_COLOR).map(s=>({name:s,value:docs.filter(d=>d.status===s).length})).filter(d=>d.value>0)
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <FileText size={24} style={{color:'#14b8a6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Document Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage company documents and files</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditDoc(null);setForm({title:'',category:'Contract',department:'Legal',description:'',file_type:'PDF',file_size:'',version:'1.0',status:'Active',tags:'',owner:''})}} style={{background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Document</button>
        </div>
      </div>

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Documents'],['analytics','Analytics']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #14b8a6':'2px solid transparent',background:'transparent',color:activeTab===id?'#14b8a6':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>

      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total Documents',value:docs.length,color:'#3b82f6'},{label:'Active',value:docs.filter(d=>d.status==='Active').length,color:'#10b981'},{label:'Draft',value:docs.filter(d=>d.status==='Draft').length,color:'#f59e0b'},{label:'Archived',value:docs.filter(d=>d.status==='Archived').length,color:'#64748b'}].map((s,i)=>(
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
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              {[[['All',...CATEGORIES],filterCat,setFilterCat],[['All',...DEPTS],filterDept,setFilterDept],[['All','Active','Draft','Archived','Expired'],filterStatus,setFilterStatus]].map(([opts,val,setter],i)=>(
                <select key={i} value={val} onChange={e=>setter(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{opts.map(o=><option key={o}>{o}</option>)}</select>
              ))}
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>{['Title','Category','Dept','Type','Version','Owner','Status','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 14px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length===0?<tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'#64748b'}}>No documents found</td></tr>
                  :filtered.map(d=>(
                    <tr key={d.document_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'10px 14px'}}>
                        <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{d.title}</div>
                        {d.tags&&<div style={{color:'#475569',fontSize:10}}>{d.tags}</div>}
                      </td>
                      <td style={{padding:'10px 14px',color:'#94a3b8',fontSize:12}}>{d.category}</td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{d.department}</td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{d.file_type||'—'}</td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>v{d.version||'1.0'}</td>
                      <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{d.owner||'—'}</td>
                      <td style={{padding:'10px 14px'}}>
                        <select value={d.status} onChange={e=>handleStatus(d.document_id,e.target.value)} style={{background:STATUS_COLOR[d.status]+'20',border:`1px solid ${STATUS_COLOR[d.status]}40`,borderRadius:20,color:STATUS_COLOR[d.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                          {['Active','Draft','Archived','Expired'].map(s=><option key={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{padding:'10px 14px'}}>
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>{setEditDoc(d);setForm({title:d.title,category:d.category,department:d.department,description:d.description||'',file_type:d.file_type||'PDF',file_size:d.file_size||'',version:d.version||'1.0',status:d.status,tags:d.tags||'',owner:d.owner||''});setShowForm(true)}} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:11}}>Edit</button>
                          <button onClick={()=>handleDelete(d.document_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 6px',cursor:'pointer'}}><Trash2 size={11}/></button>
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
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Documents by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={catData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" fill="#14b8a6" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {statusData.map((s,i)=><Cell key={i} fill={STATUS_COLOR[s.name]||COLORS[i]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Documents by Department</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" fill="#3b82f6" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:540,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editDoc?'Edit Document':'Add Document'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inputStyle}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inputStyle}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>File Type</label><select value={form.file_type} onChange={e=>setForm({...form,file_type:e.target.value})} style={inputStyle}>{['PDF','Word','Excel','PowerPoint','Image','Text','Other'].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Version</label><input value={form.version} onChange={e=>setForm({...form,version:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Owner</label><input value={form.owner} onChange={e=>setForm({...form,owner:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>{['Active','Draft','Archived','Expired'].map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Tags</label><input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="comma separated" style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editDoc?'Update':'Add Document'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}