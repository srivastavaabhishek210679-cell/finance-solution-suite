import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, Shield, RefreshCw } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const ACTION_COLOR = { LOGIN:'#10b981', CREATE:'#3b82f6', UPDATE:'#f59e0b', DELETE:'#ef4444', VIEW:'#8b5cf6', EXPORT:'#14b8a6', LOGOUT:'#64748b' }

export default function AuditLog() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterAction, setFilterAction] = useState('All')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [toast, setToast] = useState(null)
  const limit = 20

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async (p=1) => {
    setLoading(true)
    try {
      let url = API+'/audit-logs?page='+p+'&limit='+limit
      if(filterAction !== 'All') url += '&action='+filterAction
      if(search) url += '&search='+encodeURIComponent(search)
      const res = await fetch(url, {headers:getHeaders()})
      const data = await res.json()
      setLogs(data.data || data.logs || [])
      setTotal(data.total || 0)
      setPage(p)
    } catch(e) { showToast('Failed to load audit logs','error') }
    setLoading(false)
  }

  useEffect(()=>{ load() },[filterAction])

  const totalPages = Math.ceil(total/limit)

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Shield size={28} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Audit Log</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track all user actions and system events</p></div>
        <button onClick={()=>load(1)} style={{marginLeft:'auto',background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><RefreshCw size={14}/> Refresh</button>
      </div>

      <div style={{padding:24}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {Object.entries(ACTION_COLOR).map(([action,color])=>{
            const count = logs.filter(l=>l.action===action).length
            return (
              <div key={action} onClick={()=>setFilterAction(filterAction===action?'All':action)} style={{background:'#1e293b',border:`1px solid ${filterAction===action?color:'#334155'}`,borderRadius:10,padding:12,cursor:'pointer',textAlign:'center',borderTop:`3px solid ${color}`}}>
                <div style={{fontSize:18,fontWeight:700,color}}>{count}</div>
                <div style={{fontSize:11,color:'#64748b'}}>{action}</div>
              </div>
            )
          })}
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:12,marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 14px',flex:1}}>
            <Search size={14} style={{color:'#64748b'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load(1)} placeholder="Search by user, action, resource..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
          </div>
          <button onClick={()=>load(1)} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:600}}>Search</button>
          <div style={{display:'flex',gap:4,background:'#1e293b',padding:4,borderRadius:8}}>
            {['All','LOGIN','CREATE','UPDATE','DELETE','VIEW','EXPORT'].map(a=>(
              <button key={a} onClick={()=>setFilterAction(a)} style={{padding:'5px 10px',borderRadius:6,border:'none',background:filterAction===a?'#3b82f6':'transparent',color:filterAction===a?'#fff':'#64748b',cursor:'pointer',fontSize:11}}>{a}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <h3 style={{color:'#f1f5f9',margin:0,fontSize:14}}>Audit Events ({total})</h3>
            <span style={{color:'#64748b',fontSize:12}}>Page {page} of {totalPages||1}</span>
          </div>

          {loading ? (
            <div style={{textAlign:'center',padding:40,color:'#64748b'}}>Loading audit logs...</div>
          ) : logs.length === 0 ? (
            <div style={{textAlign:'center',padding:40,color:'#64748b'}}>
              <div style={{fontSize:32,marginBottom:8}}>📋</div>
              <p>No audit logs found</p>
            </div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #334155'}}>
                  {['Time','User','Action','Resource','Details','IP'].map(h=>(
                    <th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log,i)=>(
                  <tr key={log.log_id||i} style={{borderBottom:'1px solid #0f172a'}}>
                    <td style={{padding:'10px 8px',color:'#64748b',fontSize:11,whiteSpace:'nowrap'}}>{new Date(log.created_at||log.timestamp).toLocaleString()}</td>
                    <td style={{padding:'10px 8px',color:'#f1f5f9',fontSize:12,fontWeight:500}}>{log.user_email||log.user_id||'System'}</td>
                    <td style={{padding:'10px 8px'}}>
                      <span style={{background:(ACTION_COLOR[log.action]||'#64748b')+'20',color:ACTION_COLOR[log.action]||'#64748b',padding:'2px 8px',borderRadius:20,fontSize:11,fontWeight:600}}>{log.action}</span>
                    </td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{log.resource_type||log.entity||'-'}</td>
                    <td style={{padding:'10px 8px',color:'#64748b',fontSize:11,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{log.details||log.description||'-'}</td>
                    <td style={{padding:'10px 8px',color:'#64748b',fontSize:11}}>{log.ip_address||'-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:16}}>
              <button onClick={()=>load(page-1)} disabled={page===1} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'6px 12px',cursor:page===1?'not-allowed':'pointer',opacity:page===1?0.5:1}}>← Prev</button>
              {Array.from({length:Math.min(5,totalPages)},(_,i)=>i+Math.max(1,page-2)).map(p=>(
                <button key={p} onClick={()=>load(p)} style={{background:p===page?'#3b82f6':'#334155',border:'none',borderRadius:6,color:p===page?'#fff':'#94a3b8',padding:'6px 12px',cursor:'pointer'}}>{p}</button>
              ))}
              <button onClick={()=>load(page+1)} disabled={page===totalPages} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'6px 12px',cursor:page===totalPages?'not-allowed':'pointer',opacity:page===totalPages?0.5:1}}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}