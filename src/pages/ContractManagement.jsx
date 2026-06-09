import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, RefreshCw, Search, Download, FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/contract-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CONTRACT_TYPES = ['Service Agreement','NDA','Vendor Contract','Employment','Lease','License','Partnership','Maintenance']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const STATUS_COLOR = { Draft:'#64748b', Active:'#10b981', Expired:'#ef4444', Terminated:'#8b5cf6', 'Under Review':'#f59e0b', Renewed:'#3b82f6' }
const COLORS = ['#10b981','#ef4444','#f59e0b','#3b82f6','#8b5cf6','#64748b','#14b8a6','#f97316']

export default function ContractManagement() {
  const navigate = useNavigate()
  const [contracts, setContracts] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [filterDept, setFilterDept] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({contract_name:'',contract_number:'',contract_type:'Service Agreement',vendor_name:'',department:'Legal',value:0,start_date:'',end_date:'',signed_by:'',auto_renewal:false,status:'Draft',description:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [cRes, sRes] = await Promise.all([fetch(API,{headers:getHeaders()}), fetch(API+'/stats',{headers:getHeaders()})])
      const [c, s] = await Promise.all([cRes.json(), sRes.json()])
      setContracts(c.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.contract_name) { showToast('Contract name required','error'); return }
    try {
      const url = editItem ? API+'/'+editItem.contract_id : API
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
    if(!confirm('Delete contract?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const exportCSV = () => {
    const rows = [['Contract Name','Number','Type','Vendor','Dept','Value','Start','End','Status'],
      ...filtered.map(c=>[c.contract_name,c.contract_number||'',c.contract_type,c.vendor_name||'',c.department,c.value||0,c.start_date||'',c.end_date||'',c.status])]
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='contracts.csv'; el.click()
  }

  const filtered = contracts.filter(c=>{
    const ms = !search||c.contract_name?.toLowerCase().includes(search.toLowerCase())||c.vendor_name?.toLowerCase().includes(search.toLowerCase())||c.contract_number?.toLowerCase().includes(search.toLowerCase())
    return ms&&(filterStatus==='All'||c.status===filterStatus)&&(filterType==='All'||c.contract_type===filterType)&&(filterDept==='All'||c.department===filterDept)
  })

  const totalValue = contracts.reduce((s,c)=>s+parseFloat(c.value||0),0)
  const activeValue = contracts.filter(c=>c.status==='Active').reduce((s,c)=>s+parseFloat(c.value||0),0)
  const expiringSoon = contracts.filter(c=>c.end_date&&new Date(c.end_date)<new Date(Date.now()+30*24*3600*1000)&&new Date(c.end_date)>new Date()&&c.status==='Active').length
  const statusData = Object.keys(STATUS_COLOR).map(s=>({name:s,value:contracts.filter(c=>c.status===s).length})).filter(d=>d.value>0)
  const typeData = CONTRACT_TYPES.map(t=>({name:t.split(' ')[0],value:contracts.filter(c=>c.contract_type===t).length})).filter(d=>d.value>0)
  const deptData = DEPTS.map(d=>({dept:d,count:contracts.filter(c=>c.department===d).length,value:contracts.filter(c=>c.department===d).reduce((s,c)=>s+parseFloat(c.value||0),0)})).filter(d=>d.count>0)
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <FileText size={24} style={{color:'#3b82f6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Contract Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track contracts, renewals and compliance</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          {expiringSoon>0&&<div style={{background:'#f59e0b20',border:'1px solid #f59e0b40',borderRadius:8,padding:'8px 14px',color:'#f59e0b',fontSize:12,display:'flex',alignItems:'center',gap:6}}><AlertTriangle size={14}/>{expiringSoon} expiring soon</div>}
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditItem(null);setForm({contract_name:'',contract_number:'',contract_type:'Service Agreement',vendor_name:'',department:'Legal',value:0,start_date:'',end_date:'',signed_by:'',auto_renewal:false,status:'Draft',description:''})}} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> New Contract</button>
        </div>
      </div>
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Contracts'],['analytics','Analytics']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #3b82f6':'2px solid transparent',background:'transparent',color:activeTab===id?'#3b82f6':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total',value:contracts.length,color:'#3b82f6'},{label:'Active',value:contracts.filter(c=>c.status==='Active').length,color:'#10b981'},{label:'Expiring (30d)',value:expiringSoon,color:'#f59e0b'},{label:'Total Value',value:'Rs.'+Math.round(totalValue/100000)+'L',color:'#3b82f6'},{label:'Active Value',value:'Rs.'+Math.round(activeValue/100000)+'L',color:'#10b981'}].map((s,i)=>(
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
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contracts..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              {[[['All',...Object.keys(STATUS_COLOR)],filterStatus,setFilterStatus],[['All',...CONTRACT_TYPES],filterType,setFilterType],[['All',...DEPTS],filterDept,setFilterDept]].map(([opts,val,setter],i)=>(
                <select key={i} value={val} onChange={e=>setter(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{opts.map(o=><option key={o}>{o}</option>)}</select>
              ))}
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>{['Contract Name','#','Type','Vendor','Dept','Value','Start','End','Auto-Renew','Status','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px 12px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length===0?<tr><td colSpan={11} style={{textAlign:'center',padding:40,color:'#64748b'}}>No contracts</td></tr>
                  :filtered.map(c=>{
                    const isExpiringSoon = c.end_date&&new Date(c.end_date)<new Date(Date.now()+30*24*3600*1000)&&new Date(c.end_date)>new Date()&&c.status==='Active'
                    return (
                      <tr key={c.contract_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{padding:'8px 12px'}}>
                          <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{c.contract_name}</div>
                          {isExpiringSoon&&<span style={{color:'#f59e0b',fontSize:10}}>⚠ Expiring soon</span>}
                        </td>
                        <td style={{padding:'8px 12px',color:'#3b82f6',fontSize:11}}>{c.contract_number||'—'}</td>
                        <td style={{padding:'8px 12px',color:'#94a3b8',fontSize:11}}>{c.contract_type}</td>
                        <td style={{padding:'8px 12px',color:'#64748b',fontSize:12}}>{c.vendor_name||'—'}</td>
                        <td style={{padding:'8px 12px',color:'#64748b',fontSize:12}}>{c.department}</td>
                        <td style={{padding:'8px 12px',color:'#10b981',fontSize:13,fontWeight:600}}>Rs.{Number(c.value||0).toLocaleString()}</td>
                        <td style={{padding:'8px 12px',color:'#64748b',fontSize:11}}>{c.start_date?new Date(c.start_date).toLocaleDateString('en-IN'):'—'}</td>
                        <td style={{padding:'8px 12px',color:isExpiringSoon?'#f59e0b':'#64748b',fontSize:11}}>{c.end_date?new Date(c.end_date).toLocaleDateString('en-IN'):'—'}</td>
                        <td style={{padding:'8px 12px',textAlign:'center'}}>{c.auto_renewal?'✅':'—'}</td>
                        <td style={{padding:'8px 12px'}}>
                          <select value={c.status} onChange={e=>handleStatus(c.contract_id,e.target.value)} style={{background:STATUS_COLOR[c.status]+'20',border:`1px solid ${STATUS_COLOR[c.status]}40`,borderRadius:20,color:STATUS_COLOR[c.status],padding:'3px 6px',fontSize:10,cursor:'pointer',fontWeight:600}}>
                            {Object.keys(STATUS_COLOR).map(s=><option key={s}>{s}</option>)}
                          </select>
                        </td>
                        <td style={{padding:'8px 12px'}}>
                          <div style={{display:'flex',gap:4}}>
                            <button onClick={()=>{setEditItem(c);setForm({contract_name:c.contract_name,contract_number:c.contract_number||'',contract_type:c.contract_type,vendor_name:c.vendor_name||'',department:c.department,value:c.value||0,start_date:c.start_date?.split('T')[0]||'',end_date:c.end_date?.split('T')[0]||'',signed_by:c.signed_by||'',auto_renewal:c.auto_renewal||false,status:c.status,description:c.description||''});setShowForm(true)}} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:11}}>Edit</button>
                            <button onClick={()=>handleDelete(c.contract_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 6px',cursor:'pointer'}}><X size={11}/></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab==='analytics' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Contract Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {statusData.map((s,i)=><Cell key={i} fill={STATUS_COLOR[s.name]||COLORS[i]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>By Contract Type</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={typeData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" fill="#3b82f6" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Contract Value by Department</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="dept" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}} tickFormatter={v=>'Rs.'+Math.round(v/1000)+'K'}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}} formatter={v=>['Rs.'+Number(v).toLocaleString(),'Value']}/>
                  <Bar dataKey="value" fill="#10b981" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:580,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editItem?'Edit Contract':'New Contract'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Contract Name *</label><input value={form.contract_name} onChange={e=>setForm({...form,contract_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Contract Number</label><input value={form.contract_number} onChange={e=>setForm({...form,contract_number:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Contract Type</label><select value={form.contract_type} onChange={e=>setForm({...form,contract_type:e.target.value})} style={inputStyle}>{CONTRACT_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Vendor/Party Name</label><input value={form.vendor_name} onChange={e=>setForm({...form,vendor_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inputStyle}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Contract Value (Rs)</label><input type="number" value={form.value} onChange={e=>setForm({...form,value:parseFloat(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Signed By</label><input value={form.signed_by} onChange={e=>setForm({...form,signed_by:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Start Date</label><input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>End Date</label><input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>{Object.keys(STATUS_COLOR).map(s=><option key={s}>{s}</option>)}</select></div>
              <div style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={form.auto_renewal} onChange={e=>setForm({...form,auto_renewal:e.target.checked})} id="ar"/><label htmlFor="ar" style={{color:'#94a3b8',fontSize:13,cursor:'pointer'}}>Auto Renewal</label></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editItem?'Update':'Create Contract'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}