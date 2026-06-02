import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ArrowLeft, Plus, AlertTriangle, X, Edit } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/asset-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['IT Equipment','Office Equipment','Furniture','Electrical','IT Infrastructure','Vehicle','Security','Machinery']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']

export default function AssetManagement() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editAsset, setEditAsset] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({asset_name:'',asset_code:'',category:'IT Equipment',department:'IT',assigned_to:'',purchase_date:'',purchase_price:0,current_value:0,depreciation_rate:20,status:'Active',location:'',warranty_expiry:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [aRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [a, s] = await Promise.all([aRes.json(), sRes.json()])
      setAssets(a.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    const url = editAsset ? API+'/'+editAsset.asset_id : API
    const method = editAsset ? 'PUT' : 'POST'
    const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast(editAsset?'Asset updated!':'Asset added!'); setShowForm(false); setEditAsset(null); load() }
    else showToast(data.message,'error')
  }

  const filtered = assets.filter(a =>
    (a.asset_name+a.asset_code+a.department).toLowerCase().includes(search.toLowerCase()) &&
    (filterCat==='All' || a.category===filterCat)
  )

  const categories = ['All', ...new Set(assets.map(a=>a.category))]

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Package size={28} style={{color:'#f59e0b'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Asset Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track assets, depreciation and maintenance</p></div>
        <button onClick={()=>{setShowForm(true);setEditAsset(null);setForm({asset_name:'',asset_code:'',category:'IT Equipment',department:'IT',assigned_to:'',purchase_date:'',purchase_price:0,current_value:0,depreciation_rate:20,status:'Active',location:'',warranty_expiry:''})}} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Asset</button>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Assets', value:stats.total, color:'#3b82f6'},
              {label:'Total Value', value:'₹'+Number(stats.totalValue||0).toLocaleString(), color:'#10b981'},
              {label:'Expiring Warranty', value:stats.expiringWarranty?.length||0, color:'#ef4444'},
              {label:'Categories', value:stats.byCategory?.length||0, color:'#8b5cf6'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {stats?.expiringWarranty?.length > 0 && (
          <div style={{background:'#ef444415',border:'1px solid #ef444440',borderRadius:12,padding:16,marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><AlertTriangle size={16} style={{color:'#ef4444'}}/><span style={{color:'#ef4444',fontWeight:600,fontSize:13}}>Warranty Expiring Soon ({stats.expiringWarranty.length} assets)</span></div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {stats.expiringWarranty.map(a=>(
                <span key={a.asset_id} style={{background:'#0f172a',color:'#f59e0b',padding:'4px 10px',borderRadius:20,fontSize:12}}>{a.asset_name} — {a.warranty_expiry?.slice(0,10)}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{display:'flex',gap:12,marginBottom:16,alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search assets..." style={{flex:1,background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'10px 14px',fontSize:13}}/>
          <div style={{display:'flex',gap:4,background:'#1e293b',padding:4,borderRadius:8,flexWrap:'wrap'}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>setFilterCat(c)} style={{padding:'5px 10px',borderRadius:6,border:'none',background:filterCat===c?'#f59e0b':'transparent',color:filterCat===c?'#fff':'#64748b',cursor:'pointer',fontSize:11}}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
          <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14}}>Assets ({filtered.length})</h3>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:'1px solid #334155'}}>{['Asset','Code','Category','Department','Assigned To','Purchase Price','Current Value','Depreciation','Status',''].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(a=>{
                const depreciation = Math.round(((Number(a.purchase_price)-Number(a.current_value))/Number(a.purchase_price))*100)
                return (
                  <tr key={a.asset_id} style={{borderBottom:'1px solid #0f172a'}}>
                    <td style={{padding:'10px 8px',color:'#f1f5f9',fontWeight:600,fontSize:13}}>{a.asset_name}</td>
                    <td style={{padding:'10px 8px',color:'#64748b',fontSize:11}}>{a.asset_code}</td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{a.category}</td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{a.department}</td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{a.assigned_to||'Unassigned'}</td>
                    <td style={{padding:'10px 8px',color:'#3b82f6'}}>₹{Number(a.purchase_price).toLocaleString()}</td>
                    <td style={{padding:'10px 8px',color:'#10b981',fontWeight:600}}>₹{Number(a.current_value).toLocaleString()}</td>
                    <td style={{padding:'10px 8px',color:'#f59e0b',fontSize:12}}>{depreciation}% depreciated</td>
                    <td style={{padding:'10px 8px'}}><span style={{background:a.status==='Active'?'#10b98120':'#ef444420',color:a.status==='Active'?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11}}>{a.status}</span></td>
                    <td style={{padding:'10px 8px'}}><button onClick={()=>{setEditAsset(a);setForm(a);setShowForm(true)}} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'4px 8px',cursor:'pointer',fontSize:12}}><Edit size={12}/></button></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:580,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>{editAsset?'Edit Asset':'Add Asset'}</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['asset_name','Asset Name'],['asset_code','Asset Code'],['assigned_to','Assigned To'],['location','Location'],['purchase_date','Purchase Date','date'],['warranty_expiry','Warranty Expiry','date'],['purchase_price','Purchase Price','number'],['current_value','Current Value','number'],['depreciation_rate','Depreciation Rate %','number']].map(([key,label,type='text'])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{['Active','Under Maintenance','Disposed','Lost'].map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editAsset?'Update':'Add Asset'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}