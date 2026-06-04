import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, ArrowLeft, Plus, Star, X, Edit } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/vendor-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['IT Hardware','Cloud Services','Office Supplies','Security','HR Services','Logistics','Consulting','Maintenance']

export default function VendorManagement() {
  const navigate = useNavigate()
  const [vendors, setVendors] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editVendor, setEditVendor] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({vendor_name:'',vendor_code:'',category:'IT Hardware',contact_person:'',email:'',phone:'',address:'',payment_terms:'Net 30'})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [vRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [v, s] = await Promise.all([vRes.json(), sRes.json()])
      setVendors(v.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    const url = editVendor ? API+'/'+editVendor.vendor_id : API
    const method = editVendor ? 'PUT' : 'POST'
    const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast(editVendor?'Vendor updated!':'Vendor added!'); setShowForm(false); setEditVendor(null); load() }
    else showToast(data.message,'error')
  }

  const filtered = vendors.filter(v =>
    (v.vendor_name+v.category+v.contact_person).toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus==='All' || v.status===filterStatus)
  )

  const renderStars = (rating) => {
    return Array.from({length:5},(_,i)=>(
      <Star key={i} size={12} style={{color:i<Math.floor(rating)?'#f59e0b':'#334155',fill:i<Math.floor(rating)?'#f59e0b':'none'}}/>
    ))
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Truck size={28} style={{color:'#14b8a6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Vendor Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage vendors, suppliers and partners</p></div>
        <button onClick={()=>{setShowForm(true);setEditVendor(null);setForm({vendor_name:'',vendor_code:'',category:'IT Hardware',contact_person:'',email:'',phone:'',address:'',payment_terms:'Net 30'})}} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Vendor</button>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Vendors', value:stats.total, color:'#3b82f6'},
              {label:'Active Vendors', value:stats.active, color:'#10b981'},
              {label:'Top Vendor', value:stats.topVendors?.[0]?.vendor_name||'N/A', color:'#f59e0b'},
              {label:'Top Vendor Value', value:'₹'+(Number(stats.topVendors?.[0]?.total_value||0).toLocaleString()), color:'#8b5cf6'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:i===2?14:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'flex',gap:12,marginBottom:16,alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search vendors..." style={{flex:1,background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'10px 14px',fontSize:13}}/>
          <div style={{display:'flex',gap:4,background:'#1e293b',padding:4,borderRadius:8}}>
            {['All','Active','Inactive'].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:'6px 14px',borderRadius:6,border:'none',background:filterStatus===s?'#14b8a6':'transparent',color:filterStatus===s?'#fff':'#64748b',cursor:'pointer',fontSize:12}}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          {filtered.map(v=>(
            <div key={v.vendor_id} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                <div>
                  <div style={{color:'#f1f5f9',fontWeight:700,fontSize:15}}>{v.vendor_name}</div>
                  <div style={{color:'#64748b',fontSize:12}}>{v.vendor_code}</div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                  <span style={{background:v.status==='Active'?'#10b98120':'#ef444420',color:v.status==='Active'?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11}}>{v.status}</span>
                  <div style={{display:'flex',gap:1}}>{renderStars(v.rating)}</div>
                </div>
              </div>
              <div style={{background:'#0f172a',borderRadius:8,padding:10,marginBottom:12}}>
                <div style={{fontSize:11,color:'#64748b',marginBottom:2}}>Category</div>
                <div style={{fontSize:13,color:'#94a3b8'}}>{v.category}</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12,fontSize:12}}>
                <div><span style={{color:'#64748b'}}>Contact: </span><span style={{color:'#94a3b8'}}>{v.contact_person}</span></div>
                <div><span style={{color:'#64748b'}}>Phone: </span><span style={{color:'#94a3b8'}}>{v.phone}</span></div>
                <div><span style={{color:'#64748b'}}>Orders: </span><span style={{color:'#3b82f6',fontWeight:600}}>{v.total_orders}</span></div>
                <div><span style={{color:'#64748b'}}>Terms: </span><span style={{color:'#94a3b8'}}>{v.payment_terms}</span></div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{color:'#10b981',fontWeight:700,fontSize:14}}>₹{Number(v.total_value).toLocaleString()}</span>
                <button onClick={()=>{setEditVendor(v);setForm(v);setShowForm(true)}} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'4px 10px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}><Edit size={12}/> Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:540}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>{editVendor?'Edit Vendor':'Add Vendor'}</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['vendor_name','Vendor Name'],['vendor_code','Vendor Code'],['contact_person','Contact Person'],['email','Email'],['phone','Phone'],['payment_terms','Payment Terms']].map(([key,label])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category||'IT Hardware'} onChange={e=>setForm({...form,category:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              {editVendor && <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status||'Active'} onChange={e=>setForm({...form,status:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{['Active','Inactive'].map(s=><option key={s}>{s}</option>)}</select></div>}
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Address</label><input value={form.address||''} onChange={e=>setForm({...form,address:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editVendor?'Update':'Add Vendor'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}