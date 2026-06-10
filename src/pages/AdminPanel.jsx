import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Users, Settings, RefreshCw, Search, Trash2, Key, Activity, Package, CreditCard, FileText, CheckCircle, Server, Bell, Database, UserPlus, Edit, Play, AlertTriangle, Zap } from 'lucide-react'

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
  const [systemStats, setSystemStats] = useState(null)
  const [dbStats, setDbStats] = useState([])
  const [userActivity, setUserActivity] = useState([])
  const [tenants, setTenants] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [editSetting, setEditSetting] = useState(null)
  const [settingValue, setSettingValue] = useState('')
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [showEditUser, setShowEditUser] = useState(null)
  const [broadcast, setBroadcast] = useState({title:'',message:'',type:'info',link:''})
  const [newUser, setNewUser] = useState({email:'',first_name:'',last_name:'',role:'user',password:'Welcome@2026'})
  const [editUserForm, setEditUserForm] = useState({first_name:'',last_name:'',role:'',status:''})
  const [impersonating, setImpersonating] = useState(null)

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),4000) }

  useEffect(() => { loadTab(tab) }, [tab])

  const loadTab = async (t) => {
    setLoading(true)
    try {
      if (t==='dashboard') {
        const [sRes, hRes, ssRes] = await Promise.all([
          fetch(API+'/dashboard',{headers:getHeaders()}),
          fetch(API+'/health',{headers:getHeaders()}),
          fetch(API+'/system-stats',{headers:getHeaders()})
        ])
        const [sData, hData, ssData] = await Promise.all([sRes.json(), hRes.json(), ssRes.json()])
        setStats(sData.data); setHealth(hData.data); setSystemStats(ssData.data)
      } else if (t==='users') {
        const [uRes, aRes] = await Promise.all([
          fetch(API+'/users',{headers:getHeaders()}),
          fetch(API+'/user-activity',{headers:getHeaders()})
        ])
        const [uData, aData] = await Promise.all([uRes.json(), aRes.json()])
        setUsers(uData.data||[]); setUserActivity(aData.data||[])
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
        const res = await fetch(API+'/audit-log?limit=100',{headers:getHeaders()})
        const data = await res.json(); setAuditLog(data.data||[])
      } else if (t==='database') {
        const res = await fetch(API+'/db-stats',{headers:getHeaders()})
        const data = await res.json(); setDbStats(data.data||[])
      }
    } catch(e) { showToast('Failed to load: '+String(e),'error') }
    setLoading(false)
  }

  const handleToggleUser = async (id) => {
    const res = await fetch(API+'/users/'+id+'/toggle',{method:'PUT',headers:getHeaders()})
    const data = await res.json()
    showToast(data.data?.status==='active'?'User activated':'User deactivated')
    loadTab('users')
  }

  const handleResetPassword = async (id) => {
    if(!confirm('Reset password for this user?')) return
    const res = await fetch(API+'/users/'+id+'/reset-password',{method:'PUT',headers:getHeaders()})
    const data = await res.json()
    if(data.data?.temporary_password) alert('Temporary password: '+data.data.temporary_password+'\nShare securely with the user.')
  }

  const handleDeleteUser = async (id) => {
    if(!confirm('Permanently delete this user? This cannot be undone.')) return
    await fetch(API+'/users/'+id,{method:'DELETE',headers:getHeaders()})
    showToast('User deleted'); loadTab('users')
  }

  const handleImpersonate = async (id, email) => {
    if(!confirm('Impersonate '+email+'? You will be logged in as this user.')) return
    const res = await fetch(API+'/users/'+id+'/impersonate',{method:'POST',headers:getHeaders()})
    const data = await res.json()
    if(data.status==='success') {
      const origToken = localStorage.getItem('token')
      localStorage.setItem('admin_token_backup', origToken)
      localStorage.setItem('token', data.data.token)
      setImpersonating(email)
      showToast('Now impersonating '+email+'. Navigate to any page.')
    } else showToast(data.message,'error')
  }

  const handleStopImpersonating = () => {
    const orig = localStorage.getItem('admin_token_backup')
    if(orig) { localStorage.setItem('token', orig); localStorage.removeItem('admin_token_backup') }
    setImpersonating(null); showToast('Returned to admin account')
  }

  const handleToggleModule = async (id) => {
    await fetch(API+'/modules/'+id+'/toggle',{method:'PUT',headers:getHeaders()})
    showToast('Module updated'); loadTab('modules')
  }

  const handleUpdateSetting = async () => {
    await fetch(API+'/settings/'+editSetting.setting_key,{method:'PUT',headers:getHeaders(),body:JSON.stringify({setting_value:settingValue})})
    showToast('Setting updated'); setEditSetting(null); loadTab('settings')
  }

  const handleBroadcast = async () => {
    if(!broadcast.title||!broadcast.message) { showToast('Title and message required','error'); return }
    const res = await fetch(API+'/broadcast',{method:'POST',headers:getHeaders(),body:JSON.stringify(broadcast)})
    const data = await res.json()
    showToast(data.message||'Broadcast sent!'); setShowBroadcast(false); setBroadcast({title:'',message:'',type:'info',link:''})
  }

  const handleCreateUser = async () => {
    if(!newUser.email) { showToast('Email required','error'); return }
    const res = await fetch(API+'/users',{method:'POST',headers:getHeaders(),body:JSON.stringify(newUser)})
    const data = await res.json()
    if(data.status==='success') { showToast('User created!'); setShowCreateUser(false); loadTab('users') }
    else showToast(data.message,'error')
  }

  const handleEditUser = async () => {
    const res = await fetch(API+'/users/'+showEditUser.user_id,{method:'PUT',headers:getHeaders(),body:JSON.stringify(editUserForm)})
    const data = await res.json()
    if(data.status==='success') { showToast('User updated!'); setShowEditUser(null); loadTab('users') }
  }

  const handleCleanup = async () => {
    if(!confirm('Clean up old read notifications and webhook logs older than 90 days?')) return
    const res = await fetch(API+'/cleanup',{method:'POST',headers:getHeaders(),body:JSON.stringify({days:90})})
    const data = await res.json()
    showToast(data.message||'Cleanup done!')
  }

  const filteredUsers = users.filter(u=>!search||u.email?.toLowerCase().includes(search.toLowerCase())||(u.first_name+' '+u.last_name).toLowerCase().includes(search.toLowerCase()))
  const settingsByCategory = settings.reduce((acc,s)=>{ if(!acc[s.category]) acc[s.category]=[]; acc[s.category].push(s); return acc },{})

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  const tabs = [
    {id:'dashboard',label:'Dashboard'},
    {id:'users',label:'Users'},
    {id:'modules',label:'Modules'},
    {id:'settings',label:'Settings'},
    {id:'billing',label:'Billing'},
    {id:'database',label:'Database'},
    {id:'audit',label:'Audit Log'},
  ]

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600,maxWidth:400,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>{toast.msg}</div>}

      {/* Impersonation Banner */}
      {impersonating && (
        <div style={{background:'#f59e0b',padding:'8px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{color:'#000',fontWeight:600,fontSize:13}}>Impersonating: {impersonating}</span>
          <button onClick={handleStopImpersonating} style={{background:'#000',border:'none',borderRadius:6,color:'#f59e0b',padding:'4px 14px',cursor:'pointer',fontWeight:600,fontSize:12}}>Stop Impersonating</button>
        </div>
      )}

      <div style={{background:'linear-gradient(135deg,#1e1b4b,#1e293b)',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'rgba(255,255,255,0.1)',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Shield size={24} style={{color:'#8b5cf6'}}/>
        <div>
          <h1 style={{margin:0,fontSize:20,fontWeight:700}}>Admin Panel</h1>
          <p style={{margin:0,fontSize:12,color:'#94a3b8'}}>Superuser control panel</p>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={()=>setShowBroadcast(true)} style={{background:'#f59e0b20',border:'1px solid #f59e0b40',borderRadius:8,color:'#f59e0b',padding:'8px 14px',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6}}><Bell size={14}/> Broadcast</button>
          <button onClick={handleCleanup} style={{background:'#ef444420',border:'1px solid #ef444440',borderRadius:8,color:'#ef4444',padding:'8px 14px',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6}}><Zap size={14}/> Cleanup</button>
          <button onClick={()=>loadTab(tab)} style={{background:'rgba(255,255,255,0.1)',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
        </div>
      </div>

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex',overflowX:'auto'}}>
        {tabs.map(({id,label})=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:tab===id?'2px solid #8b5cf6':'2px solid transparent',background:'transparent',color:tab===id?'#8b5cf6':'#64748b',cursor:'pointer',fontSize:13,fontWeight:tab===id?600:400,whiteSpace:'nowrap'}}>{label}</button>
        ))}
      </div>

      <div style={{padding:24}}>

        {/* DASHBOARD */}
        {tab==='dashboard' && stats && (
          <div>
            {health && (
              <div style={{background:health.db_status==='healthy'?'#10b98115':'#f59e0b15',border:`1px solid ${health.db_status==='healthy'?'#10b98140':'#f59e0b40'}`,borderRadius:12,padding:16,marginBottom:20,display:'flex',gap:24,alignItems:'center',flexWrap:'wrap'}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <Server size={20} style={{color:health.db_status==='healthy'?'#10b981':'#f59e0b'}}/>
                  <span style={{color:'#f1f5f9',fontWeight:700,fontSize:15}}>System Status</span>
                  <span style={{background:health.db_status==='healthy'?'#10b981':'#f59e0b',color:'#fff',padding:'3px 12px',borderRadius:20,fontSize:11,fontWeight:700}}>{health.db_status?.toUpperCase()}</span>
                </div>
                {[['DB Latency',health.db_latency_ms+'ms'],['DB Size',health.db_size],['Tables',health.table_count],['Total Rows',Number(health.total_rows||0).toLocaleString()],['Uptime',Math.floor((health.uptime||0)/3600)+'h '+Math.floor(((health.uptime||0)%3600)/60)+'m']].map(([l,v])=>(
                  <div key={l} style={{textAlign:'center'}}>
                    <div style={{fontSize:15,fontWeight:700,color:'#f1f5f9'}}>{v}</div>
                    <div style={{fontSize:10,color:'#64748b'}}>{l}</div>
                  </div>
                ))}
                {systemStats && (
                  <>
                    <div style={{textAlign:'center'}}><div style={{fontSize:15,fontWeight:700,color:'#f1f5f9'}}>{systemStats.connections?.active||0}/{systemStats.connections?.total||0}</div><div style={{fontSize:10,color:'#64748b'}}>DB Connections</div></div>
                    <div style={{textAlign:'center'}}><div style={{fontSize:15,fontWeight:700,color:'#f1f5f9'}}>{systemStats.node_version}</div><div style={{fontSize:10,color:'#64748b'}}>Node.js</div></div>
                    <div style={{textAlign:'center'}}><div style={{fontSize:15,fontWeight:700,color:'#f1f5f9'}}>{Math.round((systemStats.memory?.heapUsed||0)/1024/1024)}MB</div><div style={{fontSize:10,color:'#64748b'}}>Heap Used</div></div>
                  </>
                )}
              </div>
            )}

            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
              {[
                {label:'Total Users', value:parseInt(stats.users?.total||0), sub:parseInt(stats.users?.new_this_week||0)+' new this week', color:'#3b82f6'},
                {label:'Active Users', value:parseInt(stats.users?.active||0), sub:'of '+parseInt(stats.users?.total||0)+' total', color:'#10b981'},
                {label:'Total Orders', value:parseInt(stats.orders?.total||0), sub:'Rs.'+Number(stats.orders?.revenue||0).toLocaleString(), color:'#f59e0b'},
                {label:'Reports', value:parseInt(stats.reports?.total||0), sub:'all time', color:'#8b5cf6'},
                {label:'Invoices', value:parseInt(stats.invoices?.total||0), sub:parseInt(stats.invoices?.paid||0)+' paid', color:'#10b981'},
                {label:'Notifications', value:parseInt(stats.notifications?.total||0), sub:parseInt(stats.notifications?.unread||0)+' unread', color:'#f59e0b'},
                {label:'Approvals', value:parseInt(stats.approvals?.total||0), sub:parseInt(stats.approvals?.pending||0)+' pending', color:'#ef4444'},
                {label:'Webhooks', value:parseInt(stats.webhooks?.total||0), sub:parseInt(stats.webhooks?.active||0)+' active', color:'#14b8a6'},
              ].map((s,i)=>(
                <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,borderLeft:`3px solid ${s.color}`}}>
                  <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
                  <div style={{fontSize:22,fontWeight:700,color:s.color,marginBottom:2}}>{s.value}</div>
                  <div style={{fontSize:11,color:'#475569'}}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 14px',fontSize:14,fontWeight:600}}>Quick Actions</h3>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  {[
                    {label:'Manage Users', action:()=>setTab('users'), color:'#3b82f6'},
                    {label:'System Settings', action:()=>setTab('settings'), color:'#8b5cf6'},
                    {label:'Toggle Modules', action:()=>setTab('modules'), color:'#10b981'},
                    {label:'Database Stats', action:()=>setTab('database'), color:'#14b8a6'},
                    {label:'Audit Log', action:()=>setTab('audit'), color:'#f59e0b'},
                    {label:'Broadcast Alert', action:()=>setShowBroadcast(true), color:'#ef4444'},
                  ].map((a,i)=>(
                    <button key={i} onClick={a.action} style={{background:a.color+'15',border:`1px solid ${a.color}30`,borderRadius:8,color:a.color,padding:'10px',cursor:'pointer',fontSize:12,fontWeight:600}}>{a.label}</button>
                  ))}
                </div>
              </div>

              {/* User Activity */}
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 14px',fontSize:14,fontWeight:600}}>Recent User Activity</h3>
                <div style={{display:'grid',gap:6,maxHeight:200,overflowY:'auto'}}>
                  {userActivity.slice(0,8).map((u,i)=>(
                    <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:'1px solid #334155'}}>
                      <div>
                        <div style={{color:'#f1f5f9',fontSize:12,fontWeight:500}}>{u.email}</div>
                        <div style={{color:'#64748b',fontSize:10}}>{u.action_count||0} actions this week</div>
                      </div>
                      <div style={{color:'#475569',fontSize:11}}>{u.last_login?new Date(u.last_login).toLocaleDateString('en-IN'):'Never'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* USERS */}
        {tab==='users' && (
          <div>
            <div style={{display:'flex',gap:10,marginBottom:16,alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 14px',flex:1}}>
                <Search size={14} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              <span style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 16px',color:'#64748b',fontSize:13}}>{filteredUsers.length} users</span>
              <button onClick={()=>setShowCreateUser(true)} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><UserPlus size={14}/> Create User</button>
            </div>

            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>
                  {['User','Email','Tenant','Role','Status','Last Login','Actions'].map(h=>(
                    <th key={h} style={{color:'#64748b',fontSize:11,padding:'12px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {loading ? <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'#64748b'}}>Loading...</td></tr>
                  : filteredUsers.map(u=>(
                    <tr key={u.user_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{padding:'12px 16px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{width:30,height:30,borderRadius:'50%',background:'#334155',display:'flex',alignItems:'center',justifyContent:'center',color:'#94a3b8',fontSize:11,fontWeight:700,flexShrink:0}}>{(u.first_name||u.email||'?')[0].toUpperCase()}</div>
                          <span style={{color:'#f1f5f9',fontSize:13}}>{u.first_name||''} {u.last_name||''}</span>
                        </div>
                      </td>
                      <td style={{padding:'12px 16px',color:'#64748b',fontSize:13}}>{u.email}</td>
                      <td style={{padding:'12px 16px',color:'#94a3b8',fontSize:12}}>{u.tenant_name||'N/A'}</td>
                      <td style={{padding:'12px 16px'}}><span style={{background:'#8b5cf620',color:'#8b5cf6',padding:'2px 8px',borderRadius:20,fontSize:11}}>{u.role||'user'}</span></td>
                      <td style={{padding:'12px 16px'}}><span style={{background:u.status==='active'?'#10b98120':'#ef444420',color:u.status==='active'?'#10b981':'#ef4444',padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:600}}>{u.status==='active'?'Active':'Inactive'}</span></td>
                      <td style={{padding:'12px 16px',color:'#64748b',fontSize:11}}>{u.last_login?new Date(u.last_login).toLocaleDateString('en-IN'):'Never'}</td>
                      <td style={{padding:'10px 16px'}}>
                        <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                          <button onClick={()=>{setShowEditUser(u);setEditUserForm({first_name:u.first_name||'',last_name:u.last_name||'',role:u.role||'user',status:u.status||'active'})}} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',gap:3}}><Edit size={10}/> Edit</button>
                          <button onClick={()=>handleToggleUser(u.user_id)} style={{background:u.status==='active'?'#ef444420':'#10b98120',border:'none',borderRadius:6,color:u.status==='active'?'#ef4444':'#10b981',padding:'4px 8px',cursor:'pointer',fontSize:11}}>{u.status==='active'?'Deactivate':'Activate'}</button>
                          <button onClick={()=>handleResetPassword(u.user_id)} style={{background:'#f59e0b20',border:'none',borderRadius:6,color:'#f59e0b',padding:'4px 8px',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',gap:3}}><Key size={10}/> Reset</button>
                          <button onClick={()=>handleImpersonate(u.user_id, u.email)} style={{background:'#8b5cf620',border:'none',borderRadius:6,color:'#8b5cf6',padding:'4px 8px',cursor:'pointer',fontSize:11}}>Login As</button>
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

        {/* MODULES */}
        {tab==='modules' && (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16,alignItems:'center'}}>
              <div style={{color:'#64748b',fontSize:13}}>{modules.filter(m=>m.is_enabled).length} of {modules.length} modules enabled</div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={async()=>{for(const m of modules.filter(x=>!x.is_enabled)){await fetch(API+'/modules/'+m.id+'/toggle',{method:'PUT',headers:getHeaders()})};loadTab('modules');showToast('All modules enabled')}} style={{background:'#10b98120',border:'none',borderRadius:8,color:'#10b981',padding:'8px 14px',cursor:'pointer',fontSize:13}}>Enable All</button>
                <button onClick={async()=>{for(const m of modules.filter(x=>x.is_enabled)){await fetch(API+'/modules/'+m.id+'/toggle',{method:'PUT',headers:getHeaders()})};loadTab('modules');showToast('All modules disabled')}} style={{background:'#ef444420',border:'none',borderRadius:8,color:'#ef4444',padding:'8px 14px',cursor:'pointer',fontSize:13}}>Disable All</button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
              {modules.map(m=>(
                <div key={m.id} style={{background:'#1e293b',border:`1px solid ${m.is_enabled?'#10b98130':'#334155'}`,borderRadius:12,padding:16,display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:40,height:40,borderRadius:8,background:m.is_enabled?'#10b98120':'#334155',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Package size={18} style={{color:m.is_enabled?'#10b981':'#64748b'}}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{color:'#f1f5f9',fontWeight:600,fontSize:13,marginBottom:2,textTransform:'capitalize'}}>{m.module_name.replace(/_/g,' ')}</div>
                    <span style={{background:PLAN_COLORS[m.plan_required]?PLAN_COLORS[m.plan_required]+'20':'#33415520',color:PLAN_COLORS[m.plan_required]||'#64748b',padding:'1px 6px',borderRadius:20,fontSize:10,textTransform:'capitalize'}}>{m.plan_required}</span>
                  </div>
                  <button onClick={()=>handleToggleModule(m.id)} style={{background:m.is_enabled?'#10b98120':'#ef444420',border:'none',borderRadius:8,color:m.is_enabled?'#10b981':'#ef4444',padding:'6px 12px',cursor:'pointer',fontSize:12,fontWeight:600,flexShrink:0}}>{m.is_enabled?'ON':'OFF'}</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab==='settings' && (
          <div>
            {Object.entries(settingsByCategory).map(([category,catSettings])=>(
              <div key={category} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:16}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 14px',fontSize:14,fontWeight:600,textTransform:'capitalize'}}>{category} Settings</h3>
                <div style={{display:'grid',gap:8}}>
                  {catSettings.map(s=>(
                    <div key={s.setting_key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#0f172a',borderRadius:8,gap:16}}>
                      <div style={{flex:1}}>
                        <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{s.setting_key.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</div>
                        {s.description && <div style={{color:'#64748b',fontSize:11}}>{s.description}</div>}
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
                        {editSetting?.setting_key===s.setting_key ? (
                          <>
                            <input value={settingValue} onChange={e=>setSettingValue(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:6,color:'#f1f5f9',padding:'4px 10px',fontSize:12,width:180}}/>
                            <button onClick={handleUpdateSetting} style={{background:'#10b981',border:'none',borderRadius:6,color:'#fff',padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:600}}>Save</button>
                            <button onClick={()=>setEditSetting(null)} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'4px 8px',cursor:'pointer',fontSize:12}}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <span style={{color:'#10b981',fontSize:13,fontWeight:600,background:'#10b98110',padding:'3px 10px',borderRadius:6,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.setting_value}</span>
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

        {/* BILLING */}
        {tab==='billing' && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
              {plans.map(p=>(
                <div key={p.plan_id} style={{background:'#1e293b',border:`1px solid ${PLAN_COLORS[p.plan_name]||'#334155'}40`,borderRadius:12,padding:20,borderTop:`4px solid ${PLAN_COLORS[p.plan_name]||'#64748b'}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                    <span style={{color:PLAN_COLORS[p.plan_name]||'#f1f5f9',fontWeight:800,fontSize:18}}>{p.plan_name}</span>
                    {p.sub_status && <span style={{background:'#10b98120',color:'#10b981',padding:'2px 8px',borderRadius:20,fontSize:10,fontWeight:600}}>ACTIVE</span>}
                  </div>
                  <div style={{marginBottom:8}}>
                    <span style={{fontSize:22,fontWeight:700,color:'#f1f5f9'}}>Rs.{Number(p.price_monthly).toLocaleString()}</span>
                    <span style={{fontSize:12,color:'#64748b'}}>/mo</span>
                  </div>
                  <div style={{fontSize:11,color:'#64748b',marginBottom:12}}>{p.max_users} users • {p.max_modules} modules</div>
                  <div style={{display:'grid',gap:4}}>
                    {(p.features||[]).map((f,i)=>(
                      <div key={i} style={{display:'flex',gap:6,alignItems:'center'}}>
                        <CheckCircle size={11} style={{color:PLAN_COLORS[p.plan_name]||'#64748b',flexShrink:0}}/>
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
                    {['Tenant','Users','Plan','Status','Created'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 14px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {tenants.map(t=>(
                      <tr key={t.tenant_id} style={{borderBottom:'1px solid #0f172a'}}>
                        <td style={{padding:'10px 14px',color:'#f1f5f9',fontSize:13}}>{t.tenant_name}</td>
                        <td style={{padding:'10px 14px',color:'#64748b',fontSize:13}}>{t.user_count}</td>
                        <td style={{padding:'10px 14px'}}><span style={{background:PLAN_COLORS[t.plan_name]?PLAN_COLORS[t.plan_name]+'20':'#33415520',color:PLAN_COLORS[t.plan_name]||'#64748b',padding:'2px 8px',borderRadius:20,fontSize:11}}>{t.plan_name||'Free'}</span></td>
                        <td style={{padding:'10px 14px'}}><span style={{background:'#10b98120',color:'#10b981',padding:'2px 8px',borderRadius:20,fontSize:11}}>{t.sub_status||'active'}</span></td>
                        <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{new Date(t.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* DATABASE */}
        {tab==='database' && (
          <div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <div style={{padding:'14px 20px',borderBottom:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>Database Tables ({dbStats.length})</h3>
                <button onClick={handleCleanup} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:6}}><Zap size={12}/> Run Cleanup</button>
              </div>
              <div style={{maxHeight:600,overflowY:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead style={{position:'sticky',top:0}}><tr style={{background:'#0f172a'}}>
                    {['#','Table Name','Row Count','Size'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {dbStats.map((t,i)=>(
                      <tr key={i} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{padding:'8px 16px',color:'#475569',fontSize:12}}>{i+1}</td>
                        <td style={{padding:'8px 16px',color:'#3b82f6',fontSize:13,fontWeight:500}}>{t.table_name}</td>
                        <td style={{padding:'8px 16px',color:'#f1f5f9',fontSize:13}}>{Number(t.row_count||0).toLocaleString()}</td>
                        <td style={{padding:'8px 16px',color:'#64748b',fontSize:12}}>{t.total_size||'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AUDIT LOG */}
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
                      <td style={{padding:'10px 16px',color:'#94a3b8',fontSize:12}}>{String(log.email||'System')}</td>
                      <td style={{padding:'10px 16px'}}><span style={{background:'#3b82f620',color:'#3b82f6',padding:'2px 8px',borderRadius:20,fontSize:11}}>{String(log.action||'')}</span></td>
                      <td style={{padding:'10px 16px',color:'#64748b',fontSize:12}}>{String(log.module||'N/A')}</td>
                      <td style={{padding:'10px 16px',color:'#64748b',fontSize:11,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{String(log.details||'-')}</td>
                      <td style={{padding:'10px 16px',color:'#475569',fontSize:11}}>{String(log.ip_address||'-')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowBroadcast(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:480}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#f1f5f9',margin:'0 0 20px',display:'flex',alignItems:'center',gap:10}}><Bell size={20} style={{color:'#f59e0b'}}/> Broadcast Notification</h2>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Title *</label><input value={broadcast.title} onChange={e=>setBroadcast({...broadcast,title:e.target.value})} placeholder="System Maintenance Notice" style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Message *</label><textarea value={broadcast.message} onChange={e=>setBroadcast({...broadcast,message:e.target.value})} rows={3} placeholder="The system will be under maintenance..." style={{...inputStyle,resize:'vertical'}}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Type</label>
                  <select value={broadcast.type} onChange={e=>setBroadcast({...broadcast,type:e.target.value})} style={inputStyle}>
                    {['info','warning','success','error'].map(t=><option key={t}>{t}</option>)}
                  </select></div>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Link (optional)</label><input value={broadcast.link} onChange={e=>setBroadcast({...broadcast,link:e.target.value})} placeholder="/dashboard" style={inputStyle}/></div>
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowBroadcast(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleBroadcast} style={{flex:2,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Send to All Users</button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowCreateUser(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:460}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#f1f5f9',margin:'0 0 20px'}}>Create New User</h2>
            <div style={{display:'grid',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>First Name</label><input value={newUser.first_name} onChange={e=>setNewUser({...newUser,first_name:e.target.value})} style={inputStyle}/></div>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Last Name</label><input value={newUser.last_name} onChange={e=>setNewUser({...newUser,last_name:e.target.value})} style={inputStyle}/></div>
              </div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Email *</label><input value={newUser.email} onChange={e=>setNewUser({...newUser,email:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Role</label>
                <select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})} style={inputStyle}>
                  {['user','admin','manager','viewer'].map(r=><option key={r}>{r}</option>)}
                </select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Password</label><input value={newUser.password} onChange={e=>setNewUser({...newUser,password:e.target.value})} style={inputStyle}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowCreateUser(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreateUser} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create User</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowEditUser(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:420}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#f1f5f9',margin:'0 0 20px'}}>Edit User: {showEditUser.email}</h2>
            <div style={{display:'grid',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>First Name</label><input value={editUserForm.first_name} onChange={e=>setEditUserForm({...editUserForm,first_name:e.target.value})} style={inputStyle}/></div>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Last Name</label><input value={editUserForm.last_name} onChange={e=>setEditUserForm({...editUserForm,last_name:e.target.value})} style={inputStyle}/></div>
              </div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Role</label>
                <select value={editUserForm.role} onChange={e=>setEditUserForm({...editUserForm,role:e.target.value})} style={inputStyle}>
                  {['user','admin','manager','viewer'].map(r=><option key={r}>{r}</option>)}
                </select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label>
                <select value={editUserForm.status} onChange={e=>setEditUserForm({...editUserForm,status:e.target.value})} style={inputStyle}>
                  {['active','inactive'].map(s=><option key={s}>{s}</option>)}
                </select></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowEditUser(null)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleEditUser} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Update User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}