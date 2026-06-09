import { useState, useEffect, useRef } from 'react'
import { Bell, X, CheckCheck, Trash2, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const API = 'https://finance-backend-so86.onrender.com/api/v1/notifications'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const TYPE_ICON = { success: CheckCircle, warning: AlertTriangle, error: AlertCircle, info: Info }
const TYPE_COLOR = { success: '#10b981', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' }

export default function NotificationCenter() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const load = async () => {
    try {
      const res = await fetch(API, { headers: getHeaders() })
      const data = await res.json()
      setNotifications(data.data || [])
      setUnread(data.unread || 0)
    } catch(e) {}
  }

  const markRead = async (id) => {
    await fetch(API + '/' + id + '/read', { method: 'PUT', headers: getHeaders() })
    load()
  }

  const markAllRead = async () => {
    await fetch(API + '/read-all', { method: 'PUT', headers: getHeaders() })
    load()
  }

  const deleteNotif = async (id, e) => {
    e.stopPropagation()
    await fetch(API + '/' + id, { method: 'DELETE', headers: getHeaders() })
    load()
  }

  const handleClick = (notif) => {
    markRead(notif.notif_id)
    if (notif.link) { navigate(notif.link); setOpen(false) }
  }

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button onClick={()=>setOpen(!open)} style={{position:'relative',background:'rgba(255,255,255,0.1)',border:'none',borderRadius:8,color:'#f1f5f9',padding:'8px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <Bell size={18}/>
        {unread > 0 && (
          <span style={{position:'absolute',top:-4,right:-4,background:'#ef4444',color:'#fff',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div style={{position:'absolute',right:0,top:'calc(100% + 8px)',width:360,background:'#1e293b',border:'1px solid #334155',borderRadius:12,boxShadow:'0 20px 60px rgba(0,0,0,0.5)',zIndex:9999,maxHeight:480,display:'flex',flexDirection:'column'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
            <div>
              <span style={{color:'#f1f5f9',fontWeight:700,fontSize:14}}>Notifications</span>
              {unread > 0 && <span style={{background:'#ef444420',color:'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11,marginLeft:8}}>{unread} unread</span>}
            </div>
            <div style={{display:'flex',gap:8}}>
              {unread > 0 && <button onClick={markAllRead} style={{background:'none',border:'none',color:'#3b82f6',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}><CheckCheck size={14}/> All read</button>}
              <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer'}}><X size={16}/></button>
            </div>
          </div>

          <div style={{overflowY:'auto',flex:1}}>
            {notifications.length === 0 ? (
              <div style={{textAlign:'center',padding:40,color:'#64748b'}}>
                <Bell size={32} style={{marginBottom:8,opacity:0.3}}/>
                <p style={{margin:0,fontSize:13}}>No notifications</p>
              </div>
            ) : notifications.map(n => {
              const Icon = TYPE_ICON[n.type] || Info
              const color = TYPE_COLOR[n.type] || '#3b82f6'
              return (
                <div key={n.notif_id} onClick={()=>handleClick(n)} style={{padding:'12px 16px',borderBottom:'1px solid #334155',cursor:'pointer',background:n.is_read?'transparent':'rgba(59,130,246,0.05)',display:'flex',gap:10,alignItems:'flex-start'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background=n.is_read?'transparent':'rgba(59,130,246,0.05)'}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:color+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <Icon size={16} style={{color}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                      <span style={{color:n.is_read?'#94a3b8':'#f1f5f9',fontSize:13,fontWeight:n.is_read?400:600,lineHeight:1.3}}>{n.title}</span>
                      <button onClick={e=>deleteNotif(n.notif_id,e)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',flexShrink:0,padding:0}}><Trash2 size={12}/></button>
                    </div>
                    {n.message && <p style={{color:'#64748b',fontSize:12,margin:'3px 0 0',lineHeight:1.4}}>{n.message}</p>}
                    <span style={{color:'#475569',fontSize:11}}>{new Date(n.created_at).toLocaleString('en-IN')}</span>
                  </div>
                  {!n.is_read && <div style={{width:8,height:8,borderRadius:'50%',background:'#3b82f6',flexShrink:0,marginTop:4}}></div>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}