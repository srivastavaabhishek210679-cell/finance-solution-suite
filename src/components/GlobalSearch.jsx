import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight, FileText, Package, Users, DollarSign, Shield, TrendingUp, Clock } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const MODULE_MAP = {
  payroll: { path:'/payroll', icon:'💰', color:'#10b981' },
  budget: { path:'/budget-mgmt', icon:'📊', color:'#3b82f6' },
  expense: { path:'/expense-mgmt', icon:'💳', color:'#f59e0b' },
  invoice: { path:'/invoices', icon:'🧾', color:'#6366f1' },
  leave: { path:'/leave-mgmt', icon:'🏖️', color:'#8b5cf6' },
  attendance: { path:'/attendance', icon:'⏰', color:'#f59e0b' },
  performance: { path:'/performance-mgmt', icon:'🏆', color:'#10b981' },
  recruitment: { path:'/recruitment-mgmt', icon:'👥', color:'#3b82f6' },
  training: { path:'/training', icon:'📚', color:'#8b5cf6' },
  travel: { path:'/travel', icon:'✈️', color:'#14b8a6' },
  helpdesk: { path:'/helpdesk', icon:'🎧', color:'#3b82f6' },
  asset: { path:'/asset-mgmt', icon:'📦', color:'#f59e0b' },
  document: { path:'/document-mgmt', icon:'📄', color:'#14b8a6' },
  risk: { path:'/risk-mgmt', icon:'🛡️', color:'#ef4444' },
  sales: { path:'/sales-pipeline', icon:'📈', color:'#10b981' },
  crm: { path:'/crm-mgmt', icon:'🤝', color:'#6366f1' },
  vendor: { path:'/vendor-mgmt', icon:'🚚', color:'#14b8a6' },
  inventory: { path:'/inventory-mgmt', icon:'🏭', color:'#3b82f6' },
  contract: { path:'/contract-mgmt', icon:'📋', color:'#6366f1' },
  resource: { path:'/resources-mgmt', icon:'👤', color:'#8b5cf6' },
  project: { path:'/project-mgmt', icon:'🎯', color:'#f59e0b' },
  compliance: { path:'/compliance', icon:'✅', color:'#10b981' },
}

export default function GlobalSearch({ onClose }) {
  const workspace = JSON.parse(localStorage.getItem('userWorkspace') || '{}')
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const saved = localStorage.getItem('searchHistory')
    if(saved) setRecent(JSON.parse(saved).slice(0,2))
  }, [])

  const search = async (q) => {
    if(!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const [reportRes, histRes] = await Promise.all([
        fetch(API+'/workspace/reports-by-domains?domains=1,2,3,4,5,6,7,8,9,10,11,12,13&search='+encodeURIComponent(q), {headers:getHeaders()}).catch(()=>({json:()=>({data:[]})})),
        fetch(API+'/workspace/report-history?search='+encodeURIComponent(q)+'&limit=5', {headers:getHeaders()}).catch(()=>({json:()=>({data:[]})}))
      ])
      const [reportData, histData] = await Promise.all([reportRes.json(), histRes.json()])

      const selectedMods = workspace?.selected_modules || []
      const moduleResults = Object.entries(MODULE_MAP)
        .filter(([key,val]) => selectedMods.length === 0 || selectedMods.some(m => m === val.path || val.path.includes(m)))
        .map(([key,val]) => ({ type:'module', name:key.charAt(0).toUpperCase()+key.slice(1)+' Management', ...val }))
        .filter(([key, val]) => key.includes(q.toLowerCase()) || val.path.includes(q.toLowerCase()))
        .map(([key, val]) => ({ type:'module', name:key.charAt(0).toUpperCase()+key.slice(1)+' Management', ...val }))

      const reportResults = (reportData.data||[]).slice(0,2).map(r=>({ type:'report', name:r.name, domain:r.domain_name, icon:'📊', color:'#8b5cf6', path:'/upload-data' }))
      const histResults = (histData.data||[]).slice(0,3).map(r=>({ type:'history', name:r.report_name, domain:r.domain_name, icon:'🕐', color:'#64748b', path:'/workspace', historyId:r.history_id }))

      setResults([...moduleResults, ...reportResults, ...histResults])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (result) => {
    // Save to recent
    const history = JSON.parse(localStorage.getItem('searchHistory')||'[]')
    const newHistory = [result.name, ...history.filter(h=>h!==result.name)].slice(0,2)
    localStorage.setItem('searchHistory', JSON.stringify(newHistory))
    navigate(result.path)
    onClose()
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:9999,display:'flex',alignItems:'flex-start',justifyContent:'center',paddingTop:80}} onClick={onClose}>
      <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,width:'100%',maxWidth:600,maxHeight:'70vh',display:'flex',flexDirection:'column',overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
        
        {/* Search Input */}
        <div style={{display:'flex',alignItems:'center',gap:12,padding:'16px 20px',borderBottom:'1px solid #334155'}}>
          <Search size={20} style={{color:'#64748b',flexShrink:0}}/>
          <input
            ref={inputRef}
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="Search modules, reports, documents..."
            style={{flex:1,background:'none',border:'none',color:'#f1f5f9',fontSize:16,outline:'none'}}
            onKeyDown={e=>e.key==='Escape'&&onClose()}
          />
          {loading && <div style={{width:16,height:16,border:'2px solid #334155',borderTop:'2px solid #10b981',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>}
          <button onClick={onClose} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'4px 8px',cursor:'pointer'}}>ESC</button>
        </div>

        {/* Results */}
        <div style={{overflowY:'auto',flex:1}}>
          {!query && recent.length > 0 && (
            <div style={{padding:'12px 20px'}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:8,textTransform:'uppercase',fontWeight:600}}>Recent Searches</div>
              {recent.map((r,i)=>(
                <div key={i} onClick={()=>setQuery(r)} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',cursor:'pointer',borderBottom:'1px solid #0f172a'}}>
                  <Clock size={14} style={{color:'#64748b'}}/>
                  <span style={{color:'#94a3b8',fontSize:13}}>{r}</span>
                </div>
              ))}
            </div>
          )}

          {!query && (
            <div style={{padding:'12px 20px'}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:10,textTransform:'uppercase',fontWeight:600}}>Quick Access</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                {Object.entries(MODULE_MAP).map(([key,val])=>(
                  <div key={key} onClick={()=>handleSelect({...val,name:key.charAt(0).toUpperCase()+key.slice(1)})} style={{background:'#0f172a',borderRadius:8,padding:'10px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,border:'1px solid #334155'}} onMouseEnter={e=>e.currentTarget.style.borderColor=val.color} onMouseLeave={e=>e.currentTarget.style.borderColor='#334155'}>
                    <span style={{fontSize:16}}>{val.icon}</span>
                    <span style={{color:'#94a3b8',fontSize:12,textTransform:'capitalize'}}>{key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && results.length === 0 && !loading && (
            <div style={{textAlign:'center',padding:40,color:'#64748b'}}>
              <div style={{fontSize:32,marginBottom:8}}>🔍</div>
              <p>No results found for "{query}"</p>
            </div>
          )}

          {query && results.length > 0 && (
            <div style={{padding:'8px 0'}}>
              {['module','report','history'].map(type=>{
                const typeResults = results.filter(r=>r.type===type)
                if(!typeResults.length) return null
                const labels = {module:'Modules',report:'Reports',history:'Recent Reports'}
                return (
                  <div key={type}>
                    <div style={{padding:'8px 20px',fontSize:11,color:'#64748b',textTransform:'uppercase',fontWeight:600}}>{labels[type]}</div>
                    {typeResults.map((r,i)=>(
                      <div key={i} onClick={()=>handleSelect(r)} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 20px',cursor:'pointer',transition:'background 0.15s'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <div style={{width:32,height:32,borderRadius:8,background:r.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{r.icon}</div>
                        <div style={{flex:1}}>
                          <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{r.name}</div>
                          {r.domain && <div style={{color:'#64748b',fontSize:11}}>{r.domain}</div>}
                        </div>
                        <ArrowRight size={14} style={{color:'#64748b'}}/>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div style={{padding:'10px 20px',borderTop:'1px solid #334155',fontSize:11,color:'#64748b',display:'flex',gap:16}}>
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  )
}



