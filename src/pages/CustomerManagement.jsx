import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, RefreshCw, Search, Download, Users, TrendingUp, Phone, Mail } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/crm'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const INDUSTRIES = ['Technology','Finance','Healthcare','Retail','Manufacturing','Education','Real Estate','Logistics','Media','Other']
const STATUSES = ['Lead','Prospect','Active','Inactive','Churned','VIP']
const STATUS_COLOR = { Lead:'#3b82f6', Prospect:'#f59e0b', Active:'#10b981', Inactive:'#64748b', Churned:'#ef4444', VIP:'#8b5cf6' }
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899']

export default function CustomerManagement() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterIndustry, setFilterIndustry] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({company_name:'',contact_name:'',email:'',phone:'',industry:'Technology',website:'',address:'',city:'',country:'India',annual_revenue:0,employee_count:0,status:'Lead',assigned_to:'',notes:'',tags:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [cRes, sRes] = await Promise.all([fetch(API,{headers:getHeaders()}), fetch(API+'/stats',{headers:getHeaders()})])
      const [c, s] = await Promise.all([cRes.json(), sRes.json()])
      setCustomers(c.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.company_name) { showToast('Company name required','error'); return }
    try {
      const url = editItem ? API+'/'+editItem.customer_id : API
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
    if(!confirm('Delete customer?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const exportCSV = () => {
    const rows = [['Company','Contact','Email','Phone','Industry','City','Status','Revenue','Employees'],
      ...filtered.map(c=>[c.company_name,c.contact_name||'',c.email||'',c.phone||'',c.industry,c.city||'',c.status,c.annual_revenue||0,c.employee_count||0])]
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='customers.csv'; el.click()
  }

  const filtered = customers.filter(c=>{
    const ms = !search||c.company_name?.toLowerCase().includes(search.toLowerCase())||c.contact_name?.toLowerCase().includes(search.toLowerCase())||c.email?.toLowerCase().includes(search.toLowerCase())
    return ms&&(filterStatus==='All'||c.status===filterStatus)&&(filterIndustry==='All'||c.industry===filterIndustry)
  })

  const statusData = STATUSES.map(s=>({name:s,value:customers.filter(c=>c.status===s).length})).filter(d=>d.value>0)
  const industryData = INDUSTRIES.map(i=>({name:i.split(' ')[0],value:customers.filter(c=>c.industry===i).length})).filter(d=>d.value>0)
  const totalRevenue = customers.reduce((s,c)=>s+parseFloat(c.annual_revenue||0),0)
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Users size={24} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Customer Management (CRM)</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage customers, leads and relationships</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditItem(null)}} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Customer</button>
        </div>
      </div>
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Customer List'],['analytics','Analytics'],['pipeline','Pipeline']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #10b981':'2px solid transparent',background:'transparent',color:activeTab===id?'#10b981':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total',value:customers.length,color:'#3b82f6'},{label:'Active',value:customers.filter(c=>c.status==='Active').length,color:'#10b981'},{label:'Leads',value:customers.filter(c=>c.status==='Lead').length,color:'#f59e0b'},{label:'VIP',value:customers.filter(c=>c.status==='VIP').length,color:'#8b5cf6'},{label:'Total Revenue',value:'Rs.'+Math.round(totalRevenue/100000)+'L',color:'#10b981'}].map((s,i)=>(
            <div key={i} onClick={()=>i>0&&i<4&&setFilterStatus(['All','Active','Lead','VIP'][i])} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:14,borderTop:`3px solid ${s.color}`,cursor:i>0?'pointer':'default'}}>
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
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search company, contact or email..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['All',...STATUSES].map(s=><option key={s}>{s}</option>)}
              </select>
              <select value={filterIndustry} onChange={e=>setFilterIndustry(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['All',...INDUSTRIES].map(i=><option key={i}>{i}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
              {filtered.map(c=>(
                <div key={c.customer_id} style={{background:'#1e293b',border:`1px solid ${STATUS_COLOR[c.status]||'#334155'}30`,borderRadius:12,padding:18}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                    <div>
                      <div style={{color:'#f1f5f9',fontWeight:700,fontSize:14,marginBottom:2}}>{c.company_name}</div>
                      <div style={{color:'#64748b',fontSize:12}}>{c.industry}</div>
                    </div>
                    <select value={c.status} onChange={e=>handleStatus(c.customer_id,e.target.value)} style={{background:STATUS_COLOR[c.status]+'20',border:`1px solid ${STATUS_COLOR[c.status]}40`,borderRadius:20,color:STATUS_COLOR[c.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                      {STATUSES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                  {c.contact_name&&<div style={{color:'#94a3b8',fontSize:12,marginBottom:3}}>👤 {c.contact_name}</div>}
                  {c.email&&<div style={{color:'#64748b',fontSize:12,marginBottom:3}}>📧 {c.email}</div>}
                  {c.phone&&<div style={{color:'#64748b',fontSize:12,marginBottom:8}}>📞 {c.phone}</div>}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    {c.annual_revenue>0&&<span style={{color:'#10b981',fontSize:12,fontWeight:600}}>Rs.{Number(c.annual_revenue).toLocaleString()} revenue</span>}
                    {c.city&&<span style={{color:'#475569',fontSize:11}}>📍 {c.city}</span>}
                  </div>
                  <div style={{display:'flex',gap:6}}>
                    <button onClick={()=>setSelectedCustomer(c)} style={{flex:1,background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'6px',cursor:'pointer',fontSize:12}}>View</button>
                    <button onClick={()=>{setEditItem(c);setForm({company_name:c.company_name,contact_name:c.contact_name||'',email:c.email||'',phone:c.phone||'',industry:c.industry,website:c.website||'',address:c.address||'',city:c.city||'',country:c.country||'India',annual_revenue:c.annual_revenue||0,employee_count:c.employee_count||0,status:c.status,assigned_to:c.assigned_to||'',notes:c.notes||'',tags:c.tags||''});setShowForm(true)}} style={{flex:1,background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'6px',cursor:'pointer',fontSize:12}}>Edit</button>
                    <button onClick={()=>handleDelete(c.customer_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'6px 8px',cursor:'pointer'}}><X size={13}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab==='analytics' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Customer Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {statusData.map((s,i)=><Cell key={i} fill={STATUS_COLOR[s.name]||COLORS[i]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>By Industry</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={industryData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" fill="#10b981" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {activeTab==='pipeline' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {['Lead','Prospect','Active'].map(stage=>(
              <div key={stage} style={{background:'#1e293b',border:`1px solid ${STATUS_COLOR[stage]}30`,borderRadius:12,padding:16}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
                  <span style={{color:STATUS_COLOR[stage],fontWeight:700,fontSize:14}}>{stage}</span>
                  <span style={{background:STATUS_COLOR[stage]+'20',color:STATUS_COLOR[stage],padding:'3px 10px',borderRadius:20,fontSize:12}}>{customers.filter(c=>c.status===stage).length}</span>
                </div>
                <div style={{display:'grid',gap:8}}>
                  {customers.filter(c=>c.status===stage).slice(0,5).map(c=>(
                    <div key={c.customer_id} style={{background:'#0f172a',borderRadius:8,padding:12}}>
                      <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500,marginBottom:2}}>{c.company_name}</div>
                      <div style={{color:'#64748b',fontSize:11}}>{c.industry} • {c.contact_name||'No contact'}</div>
                      {c.annual_revenue>0&&<div style={{color:'#10b981',fontSize:11,marginTop:4}}>Rs.{Number(c.annual_revenue).toLocaleString()}</div>}
                    </div>
                  ))}
                  {customers.filter(c=>c.status===stage).length>5&&<div style={{color:'#64748b',fontSize:11,textAlign:'center'}}>+{customers.filter(c=>c.status===stage).length-5} more</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedCustomer && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelectedCustomer(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:500}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h2 style={{color:'#f1f5f9',margin:0,fontSize:16}}>{selectedCustomer.company_name}</h2>
              <button onClick={()=>setSelectedCustomer(null)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={16}/></button>
            </div>
            <div style={{display:'grid',gap:6}}>
              {[['Contact',selectedCustomer.contact_name||'N/A'],['Email',selectedCustomer.email||'N/A'],['Phone',selectedCustomer.phone||'N/A'],['Industry',selectedCustomer.industry],['Website',selectedCustomer.website||'N/A'],['Address',(selectedCustomer.address||'')+(selectedCustomer.city?', '+selectedCustomer.city:'')],['Annual Revenue','Rs.'+Number(selectedCustomer.annual_revenue||0).toLocaleString()],['Employees',selectedCustomer.employee_count||'N/A'],['Status',selectedCustomer.status],['Assigned To',selectedCustomer.assigned_to||'N/A'],['Notes',selectedCustomer.notes||'—']].map(([l,v])=>(
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
              <h2 style={{color:'#f1f5f9',margin:0}}>{editItem?'Edit Customer':'Add Customer'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Company Name *</label><input value={form.company_name} onChange={e=>setForm({...form,company_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Contact Name</label><input value={form.contact_name} onChange={e=>setForm({...form,contact_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Email</label><input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Phone</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Industry</label><select value={form.industry} onChange={e=>setForm({...form,industry:e.target.value})} style={inputStyle}>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>City</label><input value={form.city} onChange={e=>setForm({...form,city:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Website</label><input value={form.website} onChange={e=>setForm({...form,website:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Annual Revenue</label><input type="number" value={form.annual_revenue} onChange={e=>setForm({...form,annual_revenue:parseFloat(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Employee Count</label><input type="number" value={form.employee_count} onChange={e=>setForm({...form,employee_count:parseInt(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Assigned To</label><input value={form.assigned_to} onChange={e=>setForm({...form,assigned_to:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Tags</label><input value={form.tags} onChange={e=>setForm({...form,tags:e.target.value})} placeholder="comma separated" style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editItem?'Update':'Add Customer'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}