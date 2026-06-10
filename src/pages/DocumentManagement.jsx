import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FileText, ArrowLeft, Plus, X, Edit, Trash2, Search, Tag } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/document-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['Policy','Financial','Legal','Sales','HR','IT','Operations','Marketing','Process','Compliance']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const FILE_TYPES = ['PDF','DOCX','XLSX','PPTX','CSV','TXT','JPG','PNG']
const TYPE_COLORS = { PDF:'#ef4444', DOCX:'#3b82f6', XLSX:'#10b981', PPTX:'#f59e0b', CSV:'#8b5cf6', TXT:'#64748b', JPG:'#14b8a6', PNG:'#14b8a6' }

export default function DocumentManagement() {
  const navigate = useNavigate()
  const [docs, setDocs] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterDept, setFilterDept] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editDoc, setEditDoc] = useState(null)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [form, setForm] = useState({title:'',category:'Policy',department:'HR',file_type:'PDF',file_size:'',version:'v1.0',author:'',description:'',tags:[]})
  const [tagInput, setTagInput] = useState('')

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [dRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [d, s] = await Promise.all([dRes.json(), sRes.json()])
      setDocs(d.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    const url = editDoc ? API+'/'+editDoc.doc_id : API
    const method = editDoc ? 'PUT' : 'POST'
    const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast(editDoc?'Document updated!':'Document added!'); setShowForm(false); setEditDoc(null); load() }
    else showToast(data.message,'error')
  }

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this document?')) return
    await fetch(API+'/'+id, {method:'DELETE', headers:getHeaders()})
    showToast('Document deleted','warning'); load()
  }

  const addTag = () => { if(tagInput.trim()) { setForm({...form,tags:[...(form.tags||[]),tagInput.trim()]}); setTagInput('') } }

  const filtered = docs.filter(d =>
    (d.title+d.author+d.category).toLowerCase().includes(search.toLowerCase()) &&
    (filterCat==='All' || d.category===filterCat) &&
    (filterDept==='All' || d.department===filterDept)
  )

  const exportCSV = () => { const rows = [['Title','Category','Type','Size','Owner','Status'],...(documents||[]).map(d=>[d.title||d.document_name||'',d.category||'',d.file_type||'',d.file_size||0,d.owner||d.uploaded_by||'',d.status||''])]; const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='documents.csv'; el.click() }
  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <FileText size={28} style={{color:'#14b8a6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Document Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Store, organize and manage company documents</p></div>
        <button onClick={()=>{setShowForm(true);setEditDoc(null);setForm({title:'',category:'Policy',department:'HR',file_type:'PDF',file_size:'',version:'v1.0',author:'',description:'',tags:[]})}} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Document</button>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Documents', value:stats.total, color:'#14b8a6'},
              {label:'Categories', value:stats.byCategory?.length||0, color:'#3b82f6'},
              {label:'Departments', value:stats.byDepartment?.length||0, color:'#8b5cf6'},
              {label:'Active Documents', value:docs.filter(d=>d.status==='Active').length, color:'#10b981'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 12px',flex:1,minWidth:200}}>
            <Search size={14} style={{color:'#64748b'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search documents..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
          </div>
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
            <option value="All">All Departments</option>
            {DEPTS.map(d=><option key={d}>{d}</option>)}
          </select>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {filtered.map(doc=>(
            <div key={doc.doc_id} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <div style={{display:'flex',gap:12,marginBottom:12}}>
                <div style={{width:44,height:44,borderRadius:8,background:(TYPE_COLORS[doc.file_type]||'#64748b')+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <span style={{color:TYPE_COLORS[doc.file_type]||'#64748b',fontSize:11,fontWeight:700}}>{doc.file_type}</span>
                </div>
                <div style={{flex:1}}>
                  <div style={{color:'#f1f5f9',fontWeight:600,fontSize:14,marginBottom:2}}>{doc.title}</div>
                  <div style={{color:'#64748b',fontSize:11}}>{doc.author} • {doc.version}</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:10,fontSize:12}}>
                <div><span style={{color:'#64748b'}}>Category: </span><span style={{color:'#94a3b8'}}>{doc.category}</span></div>
                <div><span style={{color:'#64748b'}}>Dept: </span><span style={{color:'#94a3b8'}}>{doc.department}</span></div>
                <div><span style={{color:'#64748b'}}>Size: </span><span style={{color:'#94a3b8'}}>{doc.file_size}</span></div>
                <div><span style={{color:'#64748b'}}>Updated: </span><span style={{color:'#94a3b8'}}>{doc.updated_at?.slice(0,10)}</span></div>
              </div>
              {doc.description && <p style={{color:'#64748b',fontSize:12,margin:'0 0 10px',lineHeight:1.4}}>{doc.description.slice(0,80)}{doc.description.length>80?'...':''}</p>}
              {(doc.tags||[]).length>0 && (
                <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
                  {(doc.tags||[]).map((t,i)=><span key={i} style={{background:'#334155',color:'#94a3b8',padding:'1px 6px',borderRadius:10,fontSize:10}}>{t}</span>)}
                </div>
              )}
              <div style={{display:'flex',gap:6}}>
                <button onClick={()=>{setEditDoc(doc);setForm({...doc,tags:doc.tags||[]});setShowForm(true)}} style={{flex:1,background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'6px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}><Edit size={12}/> Edit</button>
                <button onClick={()=>handleDelete(doc.doc_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'6px 10px',cursor:'pointer',fontSize:12}}><Trash2 size={12}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>{editDoc?'Edit Document':'Add Document'}</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['title','Title'],['author','Author'],['file_size','File Size'],['version','Version']].map(([key,label])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>File Type</label><select value={form.file_type} onChange={e=>setForm({...form,file_type:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{FILE_TYPES.map(f=><option key={f}>{f}</option>)}</select></div>
              {editDoc && <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status||'Active'} onChange={e=>setForm({...form,status:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{['Active','Archived','Draft'].map(s=><option key={s}>{s}</option>)}</select></div>}
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} rows={2} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
              <div style={{gridColumn:'span 2'}}>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Tags</label>
                <div style={{display:'flex',gap:8,marginBottom:6}}>
                  <input value={tagInput} onChange={e=>setTagInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addTag()} placeholder="Add tag and press Enter" style={{flex:1,background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}/>
                  <button onClick={addTag} style={{background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'8px 12px',cursor:'pointer',fontSize:12}}>Add</button>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {(form.tags||[]).map((t,i)=><span key={i} style={{background:'#334155',color:'#94a3b8',padding:'2px 8px',borderRadius:20,fontSize:12,display:'flex',alignItems:'center',gap:4}}>{t}<button onClick={()=>setForm({...form,tags:form.tags.filter((_,idx)=>idx!==i)})} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',padding:0,fontSize:10}}>×</button></span>)}
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editDoc?'Update':'Add Document'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}