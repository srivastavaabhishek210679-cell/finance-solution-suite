import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ArrowLeft, Plus, X, Edit, MessageSquare, TrendingUp } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/crm-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const STATUS_COLOR = { Active:'#10b981', Inactive:'#ef4444', Prospect:'#f59e0b', Lead:'#3b82f6' }
const INDUSTRIES = ['Manufacturing','IT Services','Trading','Retail','Finance','Healthcare','Education','Real Estate','Startup','Other']

export default function CustomerManagement() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [stats, setStats] = useState(null)
  const [interactions, setInteractions] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [tab, setTab] = useState('customers')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [showInteraction, setShowInteraction] = useState(false)
  const [editCustomer, setEditCustomer] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({company_name:'',contact_name:'',email:'',phone:'',industry:'IT Services',country:'India',status:'Active',customer_type:'B2B',assigned_to:'',notes:''})
  const [intForm, setIntForm] = useState({type:'Call',subject:'',notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [cRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [c, s] = await Promise.all([cRes.json(), sRes.json()])
      setCustomers(c.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  const loadInteractions = async (customer) => {
    setSelectedCustomer(customer)
    setTab('interactions')
    const res = await fetch(API+'/'+customer.customer_id+'/interactions', {headers:getHeaders()})
    const data = await res.json()
    setInteractions(data.data||[])
  }

  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    const url = editCustomer ? API+'/'+editCustomer.customer_id : API
    const method = editCustomer ? 'PUT' : 'POST'
    const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast(editCustomer?'Customer updated!':'Customer added!'); setShowForm(false); setEditCustomer(null); load() }
    else showToast(data.message,'error')
  }

  const handleAddInteraction = async () => {
    const res = await fetch(API+'/interactions', {method:'POST', headers:getHeaders(), body:JSON.stringify({...intForm, customer_id:selectedCustomer.customer_id})})
    const data = await res.json()
    if(data.status==='success') { showToast('Interaction logged!'); setShowInteraction(false); loadInteractions(selectedCustomer) }
    else showToast(data.message,'error')
  }

  const filtered = customers.filter(c =>
    (c.company_name+c.contact_name+c.industry).toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus==='All' || c.status===filterStatus)
  )

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>tab==='interactions'?setTab('customers'):navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> {tab==='interactions'?'Customers':'Back'}</button>
        <Users size={28} style={{color:'#6366f1'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>{tab==='interactions'&&selectedCustomer?selectedCustomer.company_name:'Customer Management (CRM)'}</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>{tab==='interactions'?'Customer Interactions':'Manage customers, leads and interactions'}</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          {tab==='interactions' && <button onClick={()=>setShowInteraction(true)} style={{display:'flex',alignItems:'center',gap:6,background:'#6366f1',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Log Interaction</button>}
          {tab==='customers' && <button onClick={()=>{setShowForm(true);setEditCustomer(null);setForm({company_name:'',contact_name:'',email:'',phone:'',industry:'IT Services',country:'India',status:'Active',customer_type:'B2B',assigned_to:'',notes:''})}} style={{display:'flex',alignItems:'center',gap:6,background:'#6366f1',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Customer</button>}
        </div>
      </div>

      <div style={{padding:24}}>
        {tab==='customers' && (
          <div>
            {stats && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
                {[
                  {label:'Total Customers', value:stats.total, color:'#6366f1'},
                  {label:'Active Customers', value:stats.active, color:'#10b981'},
                  {label:'Total Revenue', value:'₹'+Number(stats.totalRevenue||0).toLocaleString(), color:'#3b82f6'},
                  {label:'Industries', value:stats.byIndustry?.length||0, color:'#f59e0b'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                    <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                    <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:'flex',gap:12,marginBottom:16}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search customers..." style={{flex:1,background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'10px 14px',fontSize:13}}/>
              <div style={{display:'flex',gap:4,background:'#1e293b',padding:4,borderRadius:8}}>
                {['All','Active','Prospect','Inactive'].map(s=>(
                  <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:filterStatus===s?'#6366f1':'transparent',color:filterStatus===s?'#fff':'#64748b',cursor:'pointer',fontSize:12}}>{s}</button>
                ))}
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
              {filtered.map(c=>(
                <div key={c.customer_id} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                    <div>
                      <div style={{color:'#f1f5f9',fontWeight:700,fontSize:15}}>{c.company_name}</div>
                      <div style={{color:'#64748b',fontSize:12}}>{c.contact_name} • {c.country}</div>
                    </div>
                    <span style={{background:STATUS_COLOR[c.status]+'20',color:STATUS_COLOR[c.status],padding:'2px 8px',borderRadius:20,fontSize:11,height:'fit-content'}}>{c.status}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:12,fontSize:12}}>
                    <div><span style={{color:'#64748b'}}>Industry: </span><span style={{color:'#94a3b8'}}>{c.industry}</span></div>
                    <div><span style={{color:'#64748b'}}>Type: </span><span style={{color:'#94a3b8'}}>{c.customer_type}</span></div>
                    <div><span style={{color:'#64748b'}}>Email: </span><span style={{color:'#94a3b8',fontSize:11}}>{c.email}</span></div>
                    <div><span style={{color:'#64748b'}}>Assigned: </span><span style={{color:'#94a3b8'}}>{c.assigned_to}</span></div>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <div style={{color:'#10b981',fontWeight:700,fontSize:14}}>₹{Number(c.total_revenue).toLocaleString()}</div>
                    <div style={{color:'#64748b',fontSize:11}}>Last contact: {c.last_contact?.slice(0,10)||'Never'}</div>
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>loadInteractions(c)} style={{flex:1,background:'#6366f120',border:'none',borderRadius:6,color:'#6366f1',padding:'6px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}><MessageSquare size={12}/> Interactions</button>
                    <button onClick={()=>{setEditCustomer(c);setForm(c);setShowForm(true)}} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'6px 10px',cursor:'pointer',fontSize:12}}><Edit size={12}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='interactions' && selectedCustomer && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20,background:'#0f172a',borderRadius:10,padding:16}}>
              {[['Industry',selectedCustomer.industry],['Revenue','₹'+Number(selectedCustomer.total_revenue).toLocaleString()],['Phone',selectedCustomer.phone],['Email',selectedCustomer.email]].map(([l,v],i)=>(
                <div key={i}><div style={{fontSize:10,color:'#64748b',marginBottom:4}}>{l}</div><div style={{fontSize:13,color:'#f1f5f9',fontWeight:600}}>{v}</div></div>
              ))}
            </div>
            {interactions.length===0 ? <div style={{textAlign:'center',padding:40,color:'#64748b'}}>No interactions yet. Log the first interaction!</div> : (
              <div>
                {interactions.map(i=>(
                  <div key={i.interaction_id} style={{background:'#0f172a',borderRadius:10,padding:16,marginBottom:12}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                      <div style={{display:'flex',gap:8,alignItems:'center'}}>
                        <span style={{background:'#6366f120',color:'#6366f1',padding:'2px 8px',borderRadius:20,fontSize:11}}>{i.type}</span>
                        <span style={{color:'#f1f5f9',fontWeight:600,fontSize:13}}>{i.subject}</span>
                      </div>
                      <span style={{color:'#64748b',fontSize:11}}>{new Date(i.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{color:'#94a3b8',fontSize:12,margin:0}}>{i.notes}</p>
                    <div style={{fontSize:11,color:'#64748b',marginTop:6}}>By: {i.created_by}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>{editCustomer?'Edit Customer':'Add Customer'}</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['company_name','Company Name'],['contact_name','Contact Name'],['email','Email'],['phone','Phone'],['country','Country'],['assigned_to','Assigned To']].map(([key,label])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Industry</label><select value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{['Active','Prospect','Lead','Inactive'].map(s=><option key={s}>{s}</option>)}</select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><textarea value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#6366f1',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editCustomer?'Update':'Add Customer'}</button>
            </div>
          </div>
        </div>
      )}

      {showInteraction && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowInteraction(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:420}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>Log Interaction</h2><button onClick={()=>setShowInteraction(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Type</label><select value={intForm.type} onChange={e=>setIntForm({...intForm,type:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{['Call','Email','Meeting','Demo','Follow-up','Support'].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Subject</label><input value={intForm.subject} onChange={e=>setIntForm({...intForm,subject:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><textarea value={intForm.notes} onChange={e=>setIntForm({...intForm,notes:e.target.value})} rows={3} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowInteraction(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleAddInteraction} style={{flex:2,background:'#6366f1',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Log Interaction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
