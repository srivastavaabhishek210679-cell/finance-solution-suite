import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, ArrowLeft, Plus, Star, X, Edit, Trash2, RefreshCw, Search, Download, Phone, Mail } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/vendor-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['IT Hardware','Cloud Services','Office Supplies','Security','HR Services','Logistics','Consulting','Maintenance','Utilities','Marketing']
const STATUS_COLOR = { Active:'#10b981', Inactive:'#64748b', Blacklisted:'#ef4444', 'Under Review':'#f59e0b' }
const PAYMENT_TERMS = ['Net 15','Net 30','Net 45','Net 60','Immediate','Monthly','Quarterly']
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899']

export default function VendorManagement() {
  const navigate = useNavigate()
  const [vendors, setVendors] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterCat, setFilterCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editVendor, setEditVendor] = useState(null)
  const [selectedVendor, setSelectedVendor] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({vendor_name:'',vendor_code:'',category:'IT Hardware',contact_person:'',email:'',phone:'',address:'',city:'',country:'India',payment_terms:'Net 30',credit_limit:0,tax_id:'',website:'',rating:3,status:'Active',notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [vRes, sRes] = await Promise.all([fetch(API,{headers:getHeaders()}), fetch(API+'/stats',{headers:getHeaders()})])
      const [v, s] = await Promise.all([vRes.json(), sRes.json()])
      setVendors(v.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.vendor_name) { showToast('Vendor name required','error'); return }
    try {
      const url = editVendor ? API+'/'+editVendor.vendor_id : API
      const method = editVendor ? 'PUT' : 'POST'
      const res = await fetch(url, {method,headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast(editVendor?'Vendor updated!':'Vendor added!'); setShowForm(false); setEditVendor(null); load() }
      else showToast(data.message||'Failed','error')
    } catch(e) { showToast('Failed','error') }
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete this vendor?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Vendor deleted'); load()
  }

  const handleStatusUpdate = async (id, status) => {
    await fetch(API+'/'+id+'/status', {method:'PUT',headers:getHeaders(),body:JSON.stringify({status})})
    showToast('Status updated'); load()
  }

  const exportCSV = () => {
    const hdrs = ['Vendor Name','Code','Category','Contact','Email','Phone','City','Payment Terms','Rating','Status']
    const rows = filtered.map(v=>[v.vendor_name,v.vendor_code||'',v.category,v.contact_person||'',v.email||'',v.phone||'',v.city||'',v.payment_terms,v.rating||'',v.status])
    const csv = [hdrs,...rows].map(r=>r.join(',')).join('\n')
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); el.download='vendors.csv'; el.click()
  }

  const filtered = vendors.filter(v=>{
    const ms = !search||v.vendor_name?.toLowerCase().includes(search.toLowerCase())||v.contact_person?.toLowerCase().includes(search.toLowerCase())||v.email?.toLowerCase().includes(search.toLowerCase())
    const mc = filterCat==='All'||v.category===filterCat
    const ms2 = filterStatus==='All'||v.status===filterStatus
    return ms&&mc&&ms2
  })

  const catData = CATEGORIES.map(c=>({name:c,value:vendors.filter(v=>v.category===c).length})).filter(d=>d.value>0)
  const statusData = Object.keys(STATUS_COLOR).map(s=>({name:s,value:vendors.filter(v=>v.status===s).length})).filter(d=>d.value>0)
  const avgRating = vendors.length ? (vendors.reduce((s,v)=>s+(parseFloat(v.rating)||0),0)/vendors.length).toFixed(1) : 0

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  const StarRating = ({rating, onRate}) => (
    <div style={{display:'flex',gap:2}}>
      {[1,2,3,4,5].map(i=>(
        <Star key={i} size={14} fill={i<=rating?'#f59e0b':'none'} stroke={i<=rating?'#f59e0b':'#64748b'} style={{cursor:onRate?'pointer':'default'}} onClick={()=>onRate&&onRate(i)}/>
      ))}
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Truck size={24} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Vendor Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage vendors, ratings and performance</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:12}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditVendor(null);setForm({vendor_name:'',vendor_code:'',category:'IT Hardware',contact_person:'',email:'',phone:'',address:'',city:'',country:'India',payment_terms:'Net 30',credit_limit:0,tax_id:'',website:'',rating:3,status:'Active',notes:''})}} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Vendor</button>
        </div>
      </div>

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Vendor List'],['analytics','Analytics']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #10b981':'2px solid transparent',background:'transparent',color:activeTab===id?'#10b981':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>

      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Total Vendors', value:vendors.length, color:'#3b82f6'},
            {label:'Active', value:vendors.filter(v=>v.status==='Active').length, color:'#10b981'},
            {label:'Avg Rating', value:avgRating+'/5', color:'#f59e0b'},
            {label:'Blacklisted', value:vendors.filter(v=>v.status==='Blacklisted').length, color:'#ef4444'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:14,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {activeTab==='list' && (
          <div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding:14,marginBottom:16,display:'flex',gap:10,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#0f172a',border:'1px solid #334155',borderRadius:8,padding:'7px 12px',flex:1,minWidth:200}}>
                <Search size={13} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vendors..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'7px 12px',fontSize:13,cursor:'pointer'}}>
                {['All',...CATEGORIES].map(c=><option key={c}>{c}</option>)}
              </select>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'7px 12px',fontSize:13,cursor:'pointer'}}>
                {['All','Active','Inactive','Blacklisted','Under Review'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
              {filtered.map(v=>(
                <div key={v.vendor_id} style={{background:'#1e293b',border:`1px solid ${STATUS_COLOR[v.status]||'#334155'}30`,borderRadius:12,padding:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                    <div>
                      <div style={{color:'#f1f5f9',fontWeight:700,fontSize:15,marginBottom:2}}>{v.vendor_name}</div>
                      <div style={{color:'#64748b',fontSize:11}}>{v.vendor_code||'No code'}</div>
                    </div>
                    <select value={v.status} onChange={e=>handleStatusUpdate(v.vendor_id,e.target.value)} style={{background:STATUS_COLOR[v.status]+'20',border:`1px solid ${STATUS_COLOR[v.status]}40`,borderRadius:20,color:STATUS_COLOR[v.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                      {['Active','Inactive','Blacklisted','Under Review'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
                    <span style={{background:'#334155',color:'#94a3b8',padding:'2px 8px',borderRadius:20,fontSize:11}}>{v.category}</span>
                    <span style={{background:'#334155',color:'#94a3b8',padding:'2px 8px',borderRadius:20,fontSize:11}}>{v.payment_terms}</span>
                  </div>
                  {v.contact_person && <div style={{color:'#94a3b8',fontSize:12,marginBottom:4}}>👤 {v.contact_person}</div>}
                  {v.email && <div style={{color:'#64748b',fontSize:12,marginBottom:4}}>📧 {v.email}</div>}
                  {v.phone && <div style={{color:'#64748b',fontSize:12,marginBottom:8}}>📞 {v.phone}</div>}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <StarRating rating={v.rating||0}/>
                    {v.city && <span style={{color:'#64748b',fontSize:11}}>📍 {v.city}</span>}
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>setSelectedVendor(v)} style={{flex:1,background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'6px',cursor:'pointer',fontSize:12}}>View</button>
                    <button onClick={()=>{setEditVendor(v);setForm({vendor_name:v.vendor_name,vendor_code:v.vendor_code||'',category:v.category,contact_person:v.contact_person||'',email:v.email||'',phone:v.phone||'',address:v.address||'',city:v.city||'',country:v.country||'India',payment_terms:v.payment_terms||'Net 30',credit_limit:v.credit_limit||0,tax_id:v.tax_id||'',website:v.website||'',rating:v.rating||3,status:v.status,notes:v.notes||''});setShowForm(true)}} style={{flex:1,background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'6px',cursor:'pointer',fontSize:12}}>Edit</button>
                    <button onClick={()=>handleDelete(v.vendor_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'6px 8px',cursor:'pointer'}}><Trash2 size={13}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab==='analytics' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Vendors by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {catData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Vendor Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11}}/>
                  <YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" radius={[6,6,0,0]}>
                    {statusData.map((s,i)=><Cell key={i} fill={STATUS_COLOR[s.name]||COLORS[i]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Top Rated Vendors</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
                {vendors.filter(v=>v.rating>=4).sort((a,b)=>(b.rating||0)-(a.rating||0)).slice(0,8).map((v,i)=>(
                  <div key={i} style={{background:'#0f172a',borderRadius:8,padding:12,borderLeft:'3px solid #f59e0b'}}>
                    <div style={{color:'#f1f5f9',fontWeight:600,fontSize:13,marginBottom:4}}>{v.vendor_name}</div>
                    <StarRating rating={v.rating||0}/>
                    <div style={{color:'#64748b',fontSize:11,marginTop:4}}>{v.category}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedVendor && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelectedVendor(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:500,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{selectedVendor.vendor_name}</h2>
              <button onClick={()=>setSelectedVendor(null)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={18}/></button>
            </div>
            <StarRating rating={selectedVendor.rating||0}/>
            <div style={{marginTop:12,display:'grid',gap:6}}>
              {[['Category',selectedVendor.category],['Contact',selectedVendor.contact_person||'N/A'],['Email',selectedVendor.email||'N/A'],['Phone',selectedVendor.phone||'N/A'],['Address',(selectedVendor.address||'')+(selectedVendor.city?', '+selectedVendor.city:'')],['Country',selectedVendor.country||'N/A'],['Payment Terms',selectedVendor.payment_terms],['Credit Limit','Rs.'+Number(selectedVendor.credit_limit||0).toLocaleString()],['Tax ID',selectedVendor.tax_id||'N/A'],['Website',selectedVendor.website||'N/A'],['Status',selectedVendor.status],['Notes',selectedVendor.notes||'—']].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'7px 10px',background:'#0f172a',borderRadius:6,fontSize:13}}>
                  <span style={{color:'#64748b'}}>{l}</span><span style={{color:'#f1f5f9'}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:600,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editVendor?'Edit Vendor':'Add Vendor'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['vendor_name','Vendor Name *','text'],['vendor_code','Vendor Code','text'],['contact_person','Contact Person','text'],['email','Email','email'],['phone','Phone','tel'],['address','Address','text'],['city','City','text'],['country','Country','text'],['tax_id','Tax ID / GST','text'],['website','Website','url']].map(([k,l,t])=>(
                <div key={k}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{l}</label>
                <input type={t} value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})} style={inputStyle}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inputStyle}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Payment Terms</label>
                <select value={form.payment_terms} onChange={e=>setForm({...form,payment_terms:e.target.value})} style={inputStyle}>
                  {PAYMENT_TERMS.map(p=><option key={p}>{p}</option>)}
                </select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Credit Limit</label>
                <input type="number" value={form.credit_limit} onChange={e=>setForm({...form,credit_limit:parseFloat(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>
                  {['Active','Inactive','Blacklisted','Under Review'].map(s=><option key={s}>{s}</option>)}
                </select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Rating (1-5)</label>
                <div style={{display:'flex',gap:6,marginTop:4}}><StarRating rating={form.rating} onRate={r=>setForm({...form,rating:r})}/></div>
              </div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label>
                <textarea value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editVendor?'Update Vendor':'Add Vendor'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}