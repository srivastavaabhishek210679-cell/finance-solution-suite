import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Shield, Users, RefreshCw, X, Trash2, Edit } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/rbac'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const ALL_PERMISSIONS = ['payroll','budget','invoices','expense','leave','attendance','recruitment','performance','training','inventory','order','supply','vendor','asset','helpdesk','crm','risk','compliance','contract','travel','project','reports','analytics','users','settings']

export default function RBACManager() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('roles')
  const [showForm, setShowForm] = useState(false)
  const [editRole, setEditRole] = useState(null)
  const [showAssign, setShowAssign] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({role_name:'',description:'',permissions:{}})
  const [assignRoleId, setAssignRoleId] = useState('')

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }
  useEffect(()=>{ load() },[])

  const load = async () => {
    setLoading(true)
    try {
      const [rRes, uRes] = await Promise.all([
        fetch(API+'/roles', {headers:getHeaders()}),
        fetch(API+'/users', {headers:getHeaders()})
      ])
      const [rData, uData] = await Promise.all([rRes.json(), uRes.json()])
      setRoles(rData.data||[])
      setUsers(uData.data||[])
    } catch(e) {}
    setLoading(false)
  }

  const handleSaveRole = async () => {
    if(!form.role_name) { showToast('Role name required','error'); return }
    try {
      const url = editRole ? API+'/roles/'+editRole.role_id : API+'/roles'
      const method = editRole ? 'PUT' : 'POST'
      const res = await fetch(url, {method,headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast(editRole?'Role updated!':'Role created!'); setShowForm(false); setEditRole(null); setForm({role_name:'',description:'',permissions:{}}); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleDeleteRole = async (id) => {
    if(!confirm('Delete this role?')) return
    await fetch(API+'/roles/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Role deleted'); load()
  }

  const handleAssignRole = async (userId) => {
    if(!assignRoleId) { showToast('Select a role','error'); return }
    await fetch(API+'/assign', {method:'POST',headers:getHeaders(),body:JSON.stringify({user_id:userId,role_id:assignRoleId})})
    showToast('Role assigned!'); setShowAssign(null); setAssignRoleId(''); load()
  }

  const togglePermission = (perm) => setForm(f=>({...f,permissions:{...f.permissions,[perm]:!f.permissions[perm]}}))

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Shield size={24} style={{color:'#8b5cf6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Role-Based Access Control</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage roles and permissions</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          {tab==='roles' && <button onClick={()=>{setShowForm(true);setEditRole(null);setForm({role_name:'',description:'',permissions:{}})}} style={{background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> New Role</button>}
        </div>
      </div>

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['roles','Roles & Permissions'],['users','User Assignments']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:tab===id?'2px solid #8b5cf6':'2px solid transparent',background:'transparent',color:tab===id?'#8b5cf6':'#64748b',cursor:'pointer',fontSize:13}}>{label}</button>
        ))}
      </div>

      <div style={{padding:24}}>
        {tab==='roles' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:16}}>
            {roles.map(role=>(
              <div key={role.role_id} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <div>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                      <Shield size={16} style={{color:'#8b5cf6'}}/>
                      <span style={{color:'#f1f5f9',fontWeight:700,fontSize:15}}>{role.role_name}</span>
                      {role.is_system && <span style={{background:'#8b5cf620',color:'#8b5cf6',padding:'1px 8px',borderRadius:20,fontSize:10}}>System</span>}
                    </div>
                    <div style={{color:'#64748b',fontSize:12}}>{role.description}</div>
                    <div style={{color:'#475569',fontSize:11,marginTop:4}}>{role.user_count||0} users assigned</div>
                  </div>
                  {!role.is_system && (
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>{setEditRole(role);setForm({role_name:role.role_name,description:role.description||'',permissions:role.permissions||{}});setShowForm(true)}} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'6px 8px',cursor:'pointer'}}><Edit size={14}/></button>
                      <button onClick={()=>handleDeleteRole(role.role_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'6px 8px',cursor:'pointer'}}><Trash2 size={14}/></button>
                    </div>
                  )}
                </div>
                <div>
                  <div style={{fontSize:11,color:'#64748b',marginBottom:6}}>PERMISSIONS</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                    {role.permissions && role.permissions.all ? (
                      <span style={{background:'#10b98120',color:'#10b981',padding:'2px 8px',borderRadius:4,fontSize:11}}>All Access</span>
                    ) : role.permissions && role.permissions.view_only ? (
                      <span style={{background:'#3b82f620',color:'#3b82f6',padding:'2px 8px',borderRadius:4,fontSize:11}}>View Only</span>
                    ) : Object.entries(role.permissions||{}).filter(([,v])=>v).map(([k])=>(
                      <span key={k} style={{background:'#334155',color:'#94a3b8',padding:'2px 6px',borderRadius:4,fontSize:10}}>{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='users' && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{background:'#0f172a'}}>
                {['User','Email','Assigned Roles','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'12px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {users.map(u=>(
                  <tr key={u.user_id} style={{borderBottom:'1px solid #0f172a'}}>
                    <td style={{padding:'12px 16px',color:'#f1f5f9',fontSize:13}}>{u.first_name||''} {u.last_name||''}</td>
                    <td style={{padding:'12px 16px',color:'#64748b',fontSize:13}}>{u.email}</td>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                        {(u.roles||[]).filter(r=>r).map((r,i)=><span key={i} style={{background:'#8b5cf620',color:'#8b5cf6',padding:'2px 8px',borderRadius:20,fontSize:11}}>{r}</span>)}
                        {!(u.roles||[]).some(r=>r) && <span style={{color:'#475569',fontSize:12}}>No roles assigned</span>}
                      </div>
                    </td>
                    <td style={{padding:'12px 16px'}}>
                      <button onClick={()=>setShowAssign(u)} style={{background:'#8b5cf620',border:'none',borderRadius:6,color:'#8b5cf6',padding:'4px 12px',cursor:'pointer',fontSize:12,fontWeight:600}}>Assign Role</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:540,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editRole?'Edit Role':'Create Role'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gap:12,marginBottom:16}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Role Name *</label><input value={form.role_name} onChange={e=>setForm({...form,role_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><input value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={inputStyle}/></div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:8}}>Module Permissions</label>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
                  {ALL_PERMISSIONS.map(p=>(
                    <label key={p} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',padding:'6px 8px',background:form.permissions[p]?'#8b5cf620':'#0f172a',borderRadius:6,border:`1px solid ${form.permissions[p]?'#8b5cf640':'#334155'}`}}>
                      <input type="checkbox" checked={!!form.permissions[p]} onChange={()=>togglePermission(p)} style={{cursor:'pointer'}}/>
                      <span style={{color:form.permissions[p]?'#8b5cf6':'#64748b',fontSize:12}}>{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSaveRole} style={{flex:2,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editRole?'Update Role':'Create Role'}</button>
            </div>
          </div>
        </div>
      )}

      {showAssign && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowAssign(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:400}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#f1f5f9',margin:'0 0 16px'}}>Assign Role to {showAssign.email}</h2>
            <select value={assignRoleId} onChange={e=>setAssignRoleId(e.target.value)} style={{...inputStyle,marginBottom:16}}>
              <option value="">Select role...</option>
              {roles.map(r=><option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
            </select>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowAssign(null)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={()=>handleAssignRole(showAssign.user_id)} style={{flex:2,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Assign Role</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}