import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Eye, RefreshCw, Search } from 'lucide-react'
import ReportViewerModal from '../components/ReportViewerModal'

const API = 'https://finance-backend-so86.onrender.com/api/v1'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

export default function ReportsDatabase() {
  const navigate = useNavigate()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [domainFilter, setDomainFilter] = useState('All')
  const [previewReport, setPreviewReport] = useState(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const limit = 20

  useEffect(() => { load() }, [page, domainFilter])

  const load = async () => {
    setLoading(true)
    try {
      let url = API + '/workspace/report-history?limit=' + limit + '&offset=' + ((page-1)*limit)
      if(domainFilter !== 'All') url += '&domain=' + encodeURIComponent(domainFilter)
      if(search) url += '&search=' + encodeURIComponent(search)
      const res = await fetch(url, {headers:getHeaders()})
      const data = await res.json()
      setReports(data.data || [])
      setTotal(data.total || data.data?.length || 0)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const loadReport = async (historyId) => {
    try {
      const res = await fetch(API+'/workspace/report/'+historyId, {headers:getHeaders()})
      const data = await res.json()
      if(data.status==='success') setPreviewReport(data.data)
    } catch(e) { console.error(e) }
  }

  const domains = [...new Set(reports.map(r => r.domain_name).filter(Boolean))]

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {/* Header */}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <div style={{width:40,height:40,background:'linear-gradient(135deg,#10b981,#3b82f6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📊</div>
        <div>
          <h1 style={{margin:0,fontSize:20,fontWeight:700}}>Reports Database</h1>
          <p style={{margin:0,fontSize:12,color:'#64748b'}}>All generated reports stored in database</p>
        </div>
        <button onClick={load} style={{marginLeft:'auto',background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><RefreshCw size={14}/> Refresh</button>
      </div>

      <div style={{padding:24}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
          {[
            {label:'Total Reports', value:reports.length, color:'#3b82f6', icon:'📊'},
            {label:'Completed', value:reports.filter(r=>r.status==='Completed').length, color:'#10b981', icon:'✅'},
            {label:'Domains', value:domains.length, color:'#8b5cf6', icon:'🌐'},
            {label:'Total Records', value:reports.reduce((s,r)=>s+(r.total_records||0),0).toLocaleString(), color:'#f59e0b', icon:'📋'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
              <div style={{fontSize:24,fontWeight:700,color:s.color}}>{s.value}</div>
              <div style={{fontSize:12,color:'#64748b'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{display:'flex',gap:12,marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 14px',flex:1}}>
            <Search size={14} style={{color:'#64748b'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==='Enter'&&load()} placeholder="Search reports..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
          </div>
          <button onClick={load} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:600}}>Search</button>
          <select value={domainFilter} onChange={e=>{setDomainFilter(e.target.value);setPage(1)}} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
            <option>All</option>
            {domains.map(d=><option key={d}>{d}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#0f172a'}}>
                {['ID','Report Name','Domain','Template','Records','Generated On','Status','Actions'].map(h=>(
                  <th key={h} style={{color:'#64748b',fontSize:11,padding:'12px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'#64748b'}}>Loading reports...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'#64748b'}}>
                  <div style={{fontSize:32,marginBottom:8}}>📊</div>
                  <p>No reports generated yet. Upload data to generate reports.</p>
                </td></tr>
              ) : reports.map(r=>(
                <tr key={r.history_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px',color:'#64748b',fontSize:12}}>#{r.history_id}</td>
                  <td style={{padding:'12px 16px',color:'#f1f5f9',fontSize:13,fontWeight:500,maxWidth:250,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.report_name}</td>
                  <td style={{padding:'12px 16px'}}><span style={{background:'#3b82f620',color:'#3b82f6',padding:'2px 8px',borderRadius:20,fontSize:11}}>{r.domain_name}</span></td>
                  <td style={{padding:'12px 16px',color:'#94a3b8',fontSize:12,textTransform:'capitalize'}}>{r.template_id}</td>
                  <td style={{padding:'12px 16px',color:'#94a3b8',fontSize:12}}>{r.total_records?.toLocaleString()}</td>
                  <td style={{padding:'12px 16px',color:'#64748b',fontSize:12,whiteSpace:'nowrap'}}>{new Date(r.run_at).toLocaleString()}</td>
                  <td style={{padding:'12px 16px'}}><span style={{background:'#10b98120',color:'#10b981',padding:'2px 8px',borderRadius:20,fontSize:11}}>{r.status}</span></td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>loadReport(r.history_id)} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 10px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}><Eye size={12}/> View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {reports.length === limit && (
          <div style={{display:'flex',justifyContent:'center',gap:8,marginTop:16}}>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'6px 16px',cursor:page===1?'not-allowed':'pointer',opacity:page===1?0.5:1}}>← Prev</button>
            <span style={{background:'#1e293b',border:'1px solid #334155',borderRadius:6,color:'#f1f5f9',padding:'6px 16px',fontSize:13}}>Page {page}</span>
            <button onClick={()=>setPage(p=>p+1)} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'6px 16px',cursor:'pointer'}}>Next →</button>
          </div>
        )}
      </div>

      {previewReport && <ReportViewerModal report={previewReport} onClose={()=>setPreviewReport(null)} />}
    </div>
  )
}