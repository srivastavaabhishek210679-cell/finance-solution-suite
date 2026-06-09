import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Users, Settings, ToggleLeft, ToggleRight, RefreshCw, Search, Trash2, Key, Activity, Package, CreditCard, FileText, CheckCircle, XCircle, AlertTriangle, Server } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/admin'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const PLAN_COLORS = { Free:'#64748b', Starter:'#3b82f6', Professional:'#8b5cf6', Enterprise:'#f59e0b' }

export default function AdminPanel() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [settings, setSettings] = useState([])
  const [modules, setModules] = useState([])
  const [plans, setPlans] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [health, setHealth] = useState(null)
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [editSetting, setEditSetting] = useState(null)
  const [settingValue, setSettingValue] = useState('')

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  useEffect(() => { loadTab(tab) }, [tab])

  const loadTab = async (t) => {
    setLoading(true)
    try {
      if (t==='dashboard') {
        const [sRes, hRes] = await Promise.all([fetch(API+'/dashboard',{headers:getHeaders()}), fetch(API+'/health',{headers:getHeaders()})])
        const [sData, hData] = await Promise.all([sRes.json(), hRes.json()])
        setStats(sData.data); setHealth(hData.data)
      } else if (t==='users') {
        const res = await fetch(API+'/users',{headers:getHeaders()})
        const data = await res.json(); setUsers(data.data||[])
      } else if (t==='settings') {
        const res = await fetch(API+'/settings',{headers:getHeaders()})
        const data = await res.json(); setSettings(data.data||[])
      } else if (t==='modules') {
        const res = await fetch(API+'/modules',{headers:getHeaders()})
        const data = await res.json(); setModules(data.data||[])
      } else if (t==='billing') {
        const [pRes, tRes] = await Promise.all([fetch(API+'/plans',{headers:getHeaders()}), fetch(API+'/tenants',{headers:getHeaders()})])
        const [pData, tData] = await Promise.all([pRes.json(), tRes.json()])
        setPlans(pData.data||[]); setTenants(tData.data||[])
      } else if (t==='audit') {
        const res = await fetch(API+'/audit-log?limit=50',{headers:getHeaders()})
        const data = await res.json(); setAuditLog(data.data||[])
      }
    } catch(e) { showToast('Failed to load','error') }
    setLoading(false)
  }

  const handleToggleUser = async (id) => {
    const res = await fetch(API+'/users/'+id+'/toggle',{method:'PUT',headers:getHeaders()})
    const data = await res.json()
    showToast(data.data?.is_active?'User activated':'User deactivated')
    loadTab('users')
  }

  const handleResetPassword = async (id) => {
    if(!confirm('Reset this user password?')) return
    const res = await fetch(API+'/users/'+id+'/reset-password',{method:'PUT',headers:getHeaders()})
    const data = await res.json()
    if(data.data?.temporary_password) {
      showToast('New password: '+data.data.temporary_password)
      alert('Temporary password: '+data.data.temporary_password+'\n\nPlease share this with the user securely.')
    }
  }

  const handleDeleteUser = async (id) => {
    if(!confirm('Permanently delete this user?')) return
    await fetch(API+'/users/'+id,{method:'DELETE',headers:getHeaders()})
    showToast('User deleted'); loadTab('users')
  }

  const handleToggleModule = async (id) => {
    await fetch(API+'/modules/'+id+'/toggle',{method:'PUT',headers:getHeaders()})
    showToast('Module updated'); loadTab('modules')
  }

  const handleUpdateSetting = async () => {
    await fetch(API+'/settings/'+editSetting.setting_key,{method:'PUT',headers:getHeaders(),body:JSON.stringify({setting_value:settingValue})})
    showToast('Setting updated'); setEditSetting(null); loadTab('settings')
  }

  const filteredUsers = users.filter(u=>!search||u.email?.toLowerCase().includes(search.toLowerCase())||(u.first_name+' '+u.last_name).toLowerCase().includes(search.toLowerCase()))
  const settingsByCategory = settings.reduce((acc,s)=>{ if(!acc[s.category]) acc[s.category]=[]; acc[s.category].push(s); return acc },{})

  const tabs = [
    {id:'dashboard', label:'Dashboard', icon:Activity},
    {id:'users', label:'Users', icon:Users},
    {id:'modules', label:'Modules', icon:Package},
    {id:'settings', label:'Settings', icon:Settings},
    {id:'billing', label:'Billing', icon:CreditCard},
    {id:'audit', label:'Audit Log', icon:FileText},
  ]

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600,maxWidth:400}}>{toast.msg}</div>}

      <div style={{background:'linear-gradient(135deg,#1e1b4b,#1e293b)',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'rgba(255,255,255,0.1)',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Shield size={24} style={{color:'#8b5cf6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Admin Panel</h1><p style={{margin:0,fontSize:12,color:'#94a3b8'}}>System administration and management</p></div>
        <button onClick={()=>loadTab(tab)} style={{marginLeft:'auto',background:'rgba(255,255,255,0.1)',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
      </div>

      {/* Tabs */}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex',gap:0,overflowX:'auto'}}>
        {tabs.map(({id,label,Icon=Activity})=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:tab===id?'2px solid #8b5cf6':'2px solid transparent',background:'transparent',color:tab===id?'#8b5cf6':'#64748b',cursor:'pointer',fontSize:13,fontWeight:tab===id?600:400,display:'flex',alignItems:'center',gap:6,whiteSpace:'nowrap'}}>
            {label}
          </button>
        ))}
      </div>

      <div style={{padding:24}}>

        {/* DASHBOARD TAB */}
        {tab==='dashboard' && stats && (
          <div>
            {/* System Health Banner */}
            {health && (
              <div style={{background:health.db_status==='healthy'?'#10b98120':'#f59e0b20',border:`1px solid ${health.db_status==='healthy'?'#10b98140':'#f59e0b40'}`,borderRadius:12,padding:16,marginBottom:20,display:'flex',gap:20,alignItems:'center',flexWrap:'wrap'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <Server size={18} style={{color:health.db_status==='healthy'?'#10b981':'#f59e0b'}}/>
                  <span style={{color:'#f1f5f9',fontWeight:600}}>System Health</span>
                  <span style={{background:health.db_status==='healthy'?'#10b981':'#f59e0b',color:'#fff',padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:700,textTransform:'uppercase'}}>{health.db_status}</span>
                </div>
                {[
                  ['DB Latency', health.db_latency_ms+'ms'],
                  ['DB Size', health.db_size],
                  ['Tables', health.table_count],
                  ['Total Rows', Number(health.total_rows||0).toLocaleString()],
                  ['Uptime', Math.floor((health.uptime||0)/3600)+'h '+Math.floor(((health.uptime||0)%3600)/60)+'m'],
                ].map(([l,v])=>(
                  <div key={l} style={{textAlign:'center'}}>
                    <div style={{fontSize:16,fontWeight:700,color:'#f1f5f9'}}>{v}</div>
                    <div style={{fontSize:10,color:'#64748b'}}>{l}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Stats Grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
              {[
                {label:'Total Users', value:stats.users?.total||0, sub:stats.users?.new_this_week+' new this week', color:'#3b82f6'},
                {label:'Active Users', value:stats.users?.active||0, sub:'of '+stats.users?.total+' total', color:'#10b981'},
                {label:'Total Orders', value:stats.orders?.total||0, sub:'Rs.'+Number(stats.orders?.revenue||0).toLocaleString()+' revenue', color:'#f59e0b'},
                {label:'Reports Generated', value:stats.reports?.total||0, sub:'all time', color:'#8b5cf6'},
                {label:'Invoices', value:stats.invoices?.total||0, sub:stats.invoices?.paid+' paid', color:'#10b981'},
                {label:'Notifications', value:stats.notifications?.total||0, sub:stats.notifications?.unread+' unread', color:'#f59e0b'},
                {label:'Approvals', value:stats.approvals?.total||0, sub:stats.approvals?.pending+' pending', color:'#ef4444'},
                {label:'Webhooks', value:stats.webhooks?.total||0, sub:stats.webhooks?.active+' active', color:'#14b8a6'},
              ].map((s,i)=>(
                <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,borderLeft:`3px solid ${s.color}`}}>
                  <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
                  <div style={{fontSize:22,fontWeight:700,color:s.color,marginBottom:2}}>{s.value}</div>
                  <div style={{fontSize:11,color:'#475569'}}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Quick Actions</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
                {[
                  {label:'Manage Users', action:()=>setTab('users'), color:'#3b82f6'},
                  {label:'System Settings', action:()=>setTab('settings'), color:'#8b5cf6'},
                  {label:'Toggle Modules', action:()=>setTab('modules'), color:'#10b981'},
                  {label:'View Audit Log', action:()=>setTab('audit'), color:'#f59e0b'},
                  {label:'Billing & Plans', action:()=>setTab('billing'), color:'#14b8a6'},
                  {label:'Refresh Health', action:()=>loadTab('dashboard'), color:'#64748b'},
                ].map((a,i)=>(
                  <button key={i} onClick={a.action} style={{background:a.color+'20',border:`1px solid ${a.color}30`,borderRadius:8,color:a.color,padding:'12px',cursor:'pointer',fontSize:13,fontWeight:600}}>{a.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {tab==='users' && (
          <div>
            <div style={{display:'flex',gap:10,marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 14px',flex:1}}>
                <Search size={14} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users by name or email..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 16px',color:'#64748b',fontSize:13}}>{filteredUsers.length} users</div>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>
                  {['User','Email','Tenant','Roles','Status','Last Login','Actions'].map(h=>(
                    <th key={h} style={{color:'#64748b',fontSize:11,padding:'12px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'#64748b'}}>Loading...</td></tr>
                  : filteredUsers.map(u=>(
                    <tr key={u.user_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:'#334155',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:12,fontWeight:700,marginBottom:0,display:'inline-flex',marginRight:8}}>{(u.first_name||u.email||'?')[0].toUpperCase()}</div>
                        <span style={{color:'#f1f5f9',fontSize:13}}>{u.first_name||''} {u.last_name||''}</span>
                      </td>
                      <td style={{padding:'12px 16px',color:'#64748b',fontSize:13}}>{u.email}</td>
                      <td style={{padding:'12px 16px',color:'#94a3b8',fontSize:12}}>{u.tenant_name||'N/A'}</td>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          {(u.roles||[]).filter(r=>r).map((r,i)=><span key={i} style={{background:'#8b5cf620',color:'#8b5cf6',padding:'1px 6px',borderRadius:20,fontSize:10}}>{r}</span>)}
                        </div>
                      </td>
                      <td style={{padding:'12px 16px'}}>
                        <span style={{background:u.is_active?'#10b98120':'#ef444420',color:u.is_active?'#10b981':'#ef4444',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600}}>{u.is_active?'Active':'Inactive'}</span>
                      </td>
                      <td style={{padding:'12px 16px',color:'#64748b',fontSize:11}}>{u.last_login?new Date(u.last_login).toLocaleDateString('en-IN'):'Never'}</td>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{display:'flex',gap:4}}>
                          <button onClick={()=>handleToggleUser(u.user_id)} style={{background:u.is_active?'#ef444420':'#10b98120',border:'none',borderRadius:6,color:u.is_active?'#ef4444':'#10b981',padding:'4px 8px',cursor:'pointer',fontSize:11}}>{u.is_active?'Deactivate':'Activate'}</button>
                          <button onClick={()=>handleResetPassword(u.user_id)} style={{background:'#f59e0b20',border:'none',borderRadius:6,color:'#f59e0b',padding:'4px 8px',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',gap:3}}><Key size={10}/> Reset</button>
                          <button onClick={()=>handleDeleteUser(u.user_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 6px',cursor:'pointer'}}><Trash2 size={12}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODULES TAB */}
        {tab==='modules' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
              {modules.map(m=>(
                <div key={m.id} style={{background:'#1e293b',border:`1px solid ${m.is_enabled?'#10b98130':'#334155'}`,borderRadius:12,padding:16,display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:40,height:40,borderRadius:8,background:m.is_enabled?'#10b98120':'#334155',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Package size={18} style={{color:m.is_enabled?'#10b981':'#64748b'}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{color:'#f1f5f9',fontWeight:600,fontSize:13,textTransform:'capitalize',marginBottom:2}}>{m.module_name.replace(/_/g,' ')}</div>
                    <div style={{display:'flex',gap:6,alignItems:'center'}}>
                      <span style={{background:PLAN_COLORS[m.plan_required]?PLAN_COLORS[m.plan_required]+'20':'#33415520',color:PLAN_COLORS[m.plan_required]||'#64748b',padding:'1px 6px',borderRadius:20,fontSize:10,textTransform:'capitalize'}}>{m.plan_required}</span>
                      <span style={{color:m.is_enabled?'#10b981':'#64748b',fontSize:11}}>{m.is_enabled?'Enabled':'Disabled'}</span>
                    </div>
                  </div>
                  <button onClick={()=>handleToggleModule(m.id)} style={{background:m.is_enabled?'#10b98120':'#334155',border:'none',borderRadius:8,color:m.is_enabled?'#10b981':'#64748b',padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:600,flexShrink:0}}>{m.is_enabled?'Disable':'Enable'}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab==='settings' && (
          <div>
            {Object.entries(settingsByCategory).map(([category, categorySettings])=>(
              <div key={category} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:16}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 14px',fontSize:14,fontWeight:600,textTransform:'capitalize'}}>{category} Settings</h3>
                <div style={{display:'grid',gap:10}}>
                  {categorySettings.map(s=>(
                    <div key={s.setting_key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#0f172a',borderRadius:8}}>
                      <div style={{flex:1}}>
                        <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{s.setting_key.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
                        {s.description && <div style={{color:'#64748b',fontSize:11}}>{s.description}</div>}
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        {editSetting?.setting_key===s.setting_key ? (
                          <>
                            <input value={settingValue} onChange={e=>setSettingValue(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:6,color:'#f1f5f9',padding:'4px 10px',fontSize:12,width:160}}/>
                            <button onClick={handleUpdateSetting} style={{background:'#10b981',border:'none',borderRadius:6,color:'#fff',padding:'4px 10px',cursor:'pointer',fontSize:12,fontWeight:600}}>Save</button>
                            <button onClick={()=>setEditSetting(null)} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'4px 8px',cursor:'pointer',fontSize:12}}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <span style={{color:'#10b981',fontSize:13,fontWeight:600,background:'#10b98110',padding:'3px 10px',borderRadius:6}}>{s.setting_value}</span>
                            <button onClick={()=>{setEditSetting(s);setSettingValue(s.setting_value)}} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'4px 10px',cursor:'pointer',fontSize:12}}>Edit</button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* BILLING TAB */}
        {tab==='billing' && (
          <div>
            <h2 style={{color:'#f1f5f9',margin:'0 0 20px',fontSize:16}}>Subscription Plans</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
              {plans.map(p=>(
                <div key={p.plan_id} style={{background:'#1e293b',border:`1px solid ${PLAN_COLORS[p.plan_name]||'#334155'}40`,borderRadius:12,padding:20,borderTop:`4px solid ${PLAN_COLORS[p.plan_name]||'#64748b'}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <span style={{color:PLAN_COLORS[p.plan_name]||'#f1f5f9',fontWeight:800,fontSize:18}}>{p.plan_name}</span>
                    {p.sub_status && <span style={{background:'#10b98120',color:'#10b981',padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600}}>ACTIVE</span>}
                  </div>
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:24,fontWeight:700,color:'#f1f5f9'}}>Rs.{Number(p.price_monthly).toLocaleString()}<span style={{fontSize:12,color:'#64748b'}}>/mo</span></div>
                    <div style={{fontSize:12,color:'#64748b'}}>Rs.{Number(p.price_annual).toLocaleString()}/year</div>
                  </div>
                  <div style={{fontSize:12,color:'#64748b',marginBottom:10}}>{p.max_users} users • {p.max_modules} modules</div>
                  <div style={{display:'grid',gap:4}}>
                    {(p.features||[]).map((f,i)=>(
                      <div key={i} style={{display:'flex',gap:6,alignItems:'center'}}>
                        <CheckCircle size={12} style={{color:PLAN_COLORS[p.plan_name]||'#64748b',flexShrink:0}}/>
                        <span style={{color:'#94a3b8',fontSize:11}}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {tenants.length > 0 && (
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Tenant Subscriptions</h3>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:'#0f172a'}}>
                    {['Tenant','Users','Plan','Status'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 14px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {tenants.map(t=>(
                      <tr key={t.tenant_id} style={{borderBottom:'1px solid #0f172a'}}>
                        <td style={{padding:'10px 14px',color:'#f1f5f9',fontSize:13}}>{t.company_name}</td>
                        <td style={{padding:'10px 14px',color:'#64748b',fontSize:13}}>{t.user_count}</td>
                        <td style={{padding:'10px 14px'}}><span style={{background:PLAN_COLORS[t.plan_name]?PLAN_COLORS[t.plan_name]+'20':'#33415520',color:PLAN_COLORS[t.plan_name]||'#64748b',padding:'2px 8px',borderRadius:20,fontSize:11}}>{t.plan_name||'Free'}</span></td>
                        <td style={{padding:'10px 14px'}}><span style={{background:'#10b98120',color:'#10b981',padding:'2px 8px',borderRadius:20,fontSize:11}}>{t.sub_status||'active'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {tab==='audit' && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
            {auditLog.length===0 ? <div style={{textAlign:'center',padding:60,color:'#64748b'}}>No audit logs found</div> : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>
                  {['Time','User','Action','Module','Details','IP'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'12px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {auditLog.map((log,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'10px 16px',color:'#64748b',fontSize:11,whiteSpace:'nowrap'}}>{new Date(log.created_at).toLocaleString('en-IN')}</td>
                      <td style={{padding:'10px 16px',color:'#94a3b8',fontSize:12}}>{log.email||'System'}</td>
                      <td style={{padding:'10px 16px'}}><span style={{background:'#3b82f620',color:'#3b82f6',padding:'2px 8px',borderRadius:20,fontSize:11}}>{log.action}</span></td>
                      <td style={{padding:'10px 16px',color:'#64748b',fontSize:12}}>{log.module||'N/A'}</td>
                      <td style={{padding:'10px 16px',color:'#64748b',fontSize:11,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{log.details||'-'}</td>
                      <td style={{padding:'10px 16px',color:'#475569',fontSize:11}}>{log.ip_address||'-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}