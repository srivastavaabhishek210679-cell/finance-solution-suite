import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft, Plus, AlertTriangle, X, Edit, RefreshCw } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/contract-mgmt'
const VENDOR_API = 'https://finance-backend-so86.onrender.com/api/v1/vendor-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const STATUS_COLOR = { Active:'#10b981', Expired:'#ef4444', Draft:'#64748b', Terminated:'#f59e0b' }
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const CONTRACT_TYPES = ['Service','SaaS','Supply','Maintenance','Consulting','License','NDA','Employment']

export default function ContractManagement() {
  const navigate = useNavigate()
  const [contracts, setContracts] = useState([])
  const [vendors, setVendors] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editContract, setEditContract] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({contract_name:'',contract_number:'',vendor_id:'',contract_type:'Service',department:'IT',start_date:'',end_date:'',value:0,status:'Active',auto_renewal:false,signed_by:'',description:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [cRes, vRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(VENDOR_API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [c, v, s] = await Promise.all([cRes.json(), vRes.json(), sRes.json()])
      setContracts(c.data||[]); setVendors(v.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    const url = editContract ? API+'/'+editContract.contract_id : API
    const method = editContract ? 'PUT' : 'POST'
    const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast(editContract?'Contract updated!':'Contract created!'); setShowForm(false); setEditContract(null); load() }
    else showToast(data.message,'error')
  }

  const getDaysUntilExpiry = (endDate) => {
    const days = Math.ceil((new Date(endDate)-new Date())/(1000*60*60*24))
    return days
  }

  const filtered = contracts.filter(c =>
    (c.contract_name+c.vendor_name+c.department).toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus==='All' || c.status===filterStatus)
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',color:'#0f172a',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#ffffff',borderBottom:'1px solid #e2e8f0',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <FileText size={28} style={{color:'#6366f1'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Contract Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage contracts, renewals and compliance</p></div>
        <button onClick={()=>{setShowForm(true);setEditContract(null);setForm({contract_name:'',contract_number:'',vendor_id:'',contract_type:'Service',department:'IT',start_date:'',end_date:'',value:0,status:'Active',auto_renewal:false,signed_by:'',description:''})}} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,background:'#6366f1',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> New Contract</button>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Contracts', value:stats.total, color:'#6366f1'},
              {label:'Active Contracts', value:stats.active, color:'#10b981'},
              {label:'Total Value', value:'₹'+Number(stats.totalValue||0).toLocaleString(), color:'#3b82f6'},
              {label:'Expiring Soon', value:stats.expiringSoon?.length||0, color:'#ef4444'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {stats?.expiringSoon?.length > 0 && (
          <div style={{background:'#ef444415',border:'1px solid #ef444440',borderRadius:12,padding:16,marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:12}}><AlertTriangle size={16} style={{color:'#ef4444'}}/><span style={{color:'#ef4444',fontWeight:600,fontSize:13}}>Contracts Expiring in 90 Days</span></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {stats.expiringSoon.map(c=>{
                const days = getDaysUntilExpiry(c.end_date)
                return (
                  <div key={c.contract_id} style={{background:'#f8fafc',borderRadius:8,padding:10}}>
                    <div style={{color:'#0f172a',fontWeight:600,fontSize:12}}>{c.contract_name}</div>
                    <div style={{color:'#64748b',fontSize:11}}>{c.vendor_name}</div>
                    <div style={{color:days<30?'#ef4444':'#f59e0b',fontSize:11,fontWeight:600,marginTop:4}}>{days} days remaining • {c.end_date?.slice(0,10)}</div>
                    {c.auto_renewal && <div style={{color:'#10b981',fontSize:10,marginTop:2}}><RefreshCw size={10}/> Auto-renewal enabled</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{display:'flex',gap:12,marginBottom:16}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contracts..." style={{flex:1,background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'10px 14px',fontSize:13}}/>
          <div style={{display:'flex',gap:4,background:'#ffffff',padding:4,borderRadius:8}}>
            {['All','Active','Expired','Draft','Terminated'].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:filterStatus===s?'#6366f1':'transparent',color:filterStatus===s?'#fff':'#64748b',cursor:'pointer',fontSize:12}}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16}}>
          {filtered.map(c=>{
            const days = getDaysUntilExpiry(c.end_date)
            return (
              <div key={c.contract_id} style={{background:'#ffffff',border:`1px solid ${days<30&&c.status==='Active'?'#ef444460':'#e2e8f0'}`,borderRadius:12,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <div>
                    <div style={{color:'#0f172a',fontWeight:700,fontSize:14}}>{c.contract_name}</div>
                    <div style={{color:'#64748b',fontSize:12}}>{c.contract_number} • {c.vendor_name||'No Vendor'}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4}}>
                    <span style={{background:STATUS_COLOR[c.status]+'20',color:STATUS_COLOR[c.status],padding:'2px 8px',borderRadius:20,fontSize:11}}>{c.status}</span>
                    {c.auto_renewal && <span style={{background:'#10b98120',color:'#10b981',padding:'2px 6px',borderRadius:10,fontSize:9,display:'flex',alignItems:'center',gap:2}}><RefreshCw size={8}/> Auto-renewal</span>}
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12,fontSize:12}}>
                  <div><span style={{color:'#64748b'}}>Type: </span><span style={{color:'#475569'}}>{c.contract_type}</span></div>
                  <div><span style={{color:'#64748b'}}>Dept: </span><span style={{color:'#475569'}}>{c.department}</span></div>
                  <div><span style={{color:'#64748b'}}>Value: </span><span style={{color:'#10b981',fontWeight:600}}>₹{Number(c.value).toLocaleString()}</span></div>
                  <div><span style={{color:'#64748b'}}>Start: </span><span style={{color:'#475569'}}>{c.start_date?.slice(0,10)}</span></div>
                  <div><span style={{color:'#64748b'}}>End: </span><span style={{color:days<30&&c.status==='Active'?'#ef4444':'#475569'}}>{c.end_date?.slice(0,10)}</span></div>
                  <div><span style={{color:'#64748b'}}>Signed: </span><span style={{color:'#475569'}}>{c.signed_by}</span></div>
                </div>
                {c.status==='Active' && <div style={{fontSize:11,color:days<30?'#ef4444':days<90?'#f59e0b':'#10b981',marginBottom:8}}>{days>0?`${days} days remaining`:'Expired'}</div>}
                <button onClick={()=>{setEditContract(c);setForm({...c,vendor_id:c.vendor_id||''});setShowForm(true)}} style={{background:'#e2e8f0',border:'none',borderRadius:6,color:'#475569',padding:'4px 10px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}><Edit size={12}/> Edit</button>
              </div>
            )
          })}
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24,width:580,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#0f172a',margin:0}}>{editContract?'Edit Contract':'New Contract'}</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['contract_name','Contract Name'],['contract_number','Contract Number'],['signed_by','Signed By'],['value','Contract Value','number'],['start_date','Start Date','date'],['end_date','End Date','date']].map(([key,label,type='text'])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Vendor</label><select value={form.vendor_id} onChange={e=>setForm({...form,vendor_id:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}><option value="">No Vendor</option>{vendors.map(v=><option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Contract Type</label><select value={form.contract_type} onChange={e=>setForm({...form,contract_type:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{CONTRACT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{['Active','Draft','Expired','Terminated'].map(s=><option key={s}>{s}</option>)}</select></div>
              <div style={{display:'flex',alignItems:'center',gap:8,paddingTop:20}}><input type="checkbox" checked={form.auto_renewal} onChange={e=>setForm({...form,auto_renewal:e.target.checked})} style={{width:16,height:16}}/><label style={{color:'#475569',fontSize:13}}>Auto Renewal</label></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={form.description||''} onChange={e=>setForm({...form,description:e.target.value})} rows={2} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#6366f1',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editContract?'Update':'Create Contract'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
