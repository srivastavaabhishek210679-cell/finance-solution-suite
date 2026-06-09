import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, Download, RefreshCw, X, CheckCircle, AlertTriangle, FileText } from 'lucide-react'
import * as XLSX from 'xlsx'

const API = 'https://finance-backend-so86.onrender.com/api/v1/bulk-import'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

export default function BulkImportExport() {
  const navigate = useNavigate()
  const [modules, setModules] = useState([])
  const [jobs, setJobs] = useState([])
  const [selectedModule, setSelectedModule] = useState(null)
  const [tab, setTab] = useState('import')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [importResult, setImportResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  useEffect(()=>{ loadModules(); loadJobs() },[])

  const loadModules = async () => {
    const res = await fetch(API+'/modules', {headers:getHeaders()})
    const data = await res.json()
    setModules(data.data||[])
  }

  const loadJobs = async () => {
    const res = await fetch(API+'/jobs', {headers:getHeaders()})
    const data = await res.json()
    setJobs(data.data||[])
  }

  const downloadTemplate = (mod) => {
    const ws = XLSX.utils.aoa_to_sheet([[...mod.columns], [...mod.columns.map(()=>'')]])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, mod.module)
    XLSX.writeFile(wb, mod.module+'_template.xlsx')
  }

  const handleFile = async (file, mod) => {
    if(!mod) { showToast('Select a module first','error'); return }
    setLoading(true)
    setImportResult(null)
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const wb = XLSX.read(e.target.result, {type:'binary'})
          const ws = wb.Sheets[wb.SheetNames[0]]
          const data = XLSX.utils.sheet_to_json(ws, {defval:''})
          const res = await fetch(API+'/import', {method:'POST',headers:getHeaders(),body:JSON.stringify({module:mod.module,data})})
          const result = await res.json()
          if(result.status==='success') {
            setImportResult(result.data)
            showToast(`Imported ${result.data.processed} records!`)
            loadJobs()
          } else { showToast(result.message||'Import failed','error') }
        } catch(err) { showToast('Failed to parse file','error') }
        setLoading(false)
      }
      reader.readAsBinaryString(file)
    } catch(e) { showToast('Failed','error'); setLoading(false) }
  }

  const handleExport = async (mod) => {
    setLoading(true)
    try {
      const res = await fetch(API+'/export/'+mod.module, {headers:getHeaders()})
      const data = await res.json()
      if(data.data?.length > 0) {
        const ws = XLSX.utils.json_to_sheet(data.data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, mod.module)
        XLSX.writeFile(wb, mod.module+'_export.xlsx')
        showToast(`Exported ${data.count} records!`)
      } else { showToast('No data to export','error') }
    } catch(e) { showToast('Export failed','error') }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Upload size={24} style={{color:'#f59e0b'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Bulk Import / Export</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Import or export data for any module</p></div>
        <button onClick={()=>{loadModules();loadJobs()}} style={{marginLeft:'auto',background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
      </div>

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['import','Bulk Import'],['export','Bulk Export'],['jobs','Import History']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:tab===id?'2px solid #f59e0b':'2px solid transparent',background:'transparent',color:tab===id?'#f59e0b':'#64748b',cursor:'pointer',fontSize:13}}>{label}</button>
        ))}
      </div>

      <div style={{padding:24}}>
        {tab==='import' && (
          <div>
            {/* Module Selection */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10,marginBottom:20}}>
              {modules.map(m=>(
                <div key={m.module} onClick={()=>setSelectedModule(selectedModule?.module===m.module?null:m)} style={{background:selectedModule?.module===m.module?'#f59e0b20':'#1e293b',border:`1px solid ${selectedModule?.module===m.module?'#f59e0b':'#334155'}`,borderRadius:10,padding:14,cursor:'pointer',textAlign:'center'}}>
                  <div style={{color:selectedModule?.module===m.module?'#f59e0b':'#f1f5f9',fontWeight:600,fontSize:13,textTransform:'capitalize',marginBottom:4}}>{m.module}</div>
                  <div style={{color:'#64748b',fontSize:10}}>{m.columns.length} columns</div>
                </div>
              ))}
            </div>

            {selectedModule && (
              <div>
                {/* Template Download */}
                <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <h3 style={{color:'#f1f5f9',margin:0,fontSize:14}}>Template for: <span style={{color:'#f59e0b',textTransform:'capitalize'}}>{selectedModule.module}</span></h3>
                    <button onClick={()=>downloadTemplate(selectedModule)} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'6px 14px',cursor:'pointer',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',gap:6}}><Download size={12}/> Download Template</button>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {selectedModule.columns.map(c=><span key={c} style={{background:'#334155',color:'#94a3b8',padding:'3px 8px',borderRadius:4,fontSize:11}}>{c}</span>)}
                  </div>
                </div>

                {/* Drop Zone */}
                <div onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFile(f,selectedModule)}} onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onClick={()=>document.getElementById('bulkFile').click()} style={{border:`2px dashed ${dragOver?'#f59e0b':'#334155'}`,borderRadius:12,padding:48,textAlign:'center',cursor:'pointer',background:dragOver?'#f59e0b08':'#1e293b',transition:'all 0.2s',marginBottom:16}}>
                  {loading ? (
                    <div><div style={{width:40,height:40,border:'3px solid #334155',borderTop:'3px solid #f59e0b',borderRadius:'50%',margin:'0 auto 12px',animation:'spin 1s linear infinite'}}></div><p style={{color:'#64748b',margin:0}}>Importing data...</p></div>
                  ) : (
                    <div>
                      <Upload size={40} style={{color:dragOver?'#f59e0b':'#334155',marginBottom:12}}/>
                      <p style={{color:'#f1f5f9',fontWeight:600,fontSize:15,margin:'0 0 6px'}}>Drop your file here</p>
                      <p style={{color:'#64748b',fontSize:13,margin:0}}>or click to browse — CSV, XLSX supported</p>
                    </div>
                  )}
                  <input id="bulkFile" type="file" accept=".csv,.xlsx,.xls" style={{display:'none'}} onChange={e=>e.target.files[0]&&handleFile(e.target.files[0],selectedModule)}/>
                </div>

                {/* Import Result */}
                {importResult && (
                  <div style={{background:importResult.failed===0?'#10b98120':'#f59e0b20',border:`1px solid ${importResult.failed===0?'#10b98140':'#f59e0b40'}`,borderRadius:12,padding:20}}>
                    <div style={{display:'flex',gap:16,marginBottom:importResult.errors?.length?12:0}}>
                      <div style={{textAlign:'center'}}>
                        <div style={{fontSize:28,fontWeight:700,color:'#10b981'}}>{importResult.processed}</div>
                        <div style={{fontSize:11,color:'#64748b'}}>Imported</div>
                      </div>
                      {importResult.failed > 0 && <div style={{textAlign:'center'}}>
                        <div style={{fontSize:28,fontWeight:700,color:'#ef4444'}}>{importResult.failed}</div>
                        <div style={{fontSize:11,color:'#64748b'}}>Failed</div>
                      </div>}
                    </div>
                    {importResult.errors?.slice(0,3).map((e,i)=>(
                      <div key={i} style={{background:'rgba(0,0,0,0.2)',borderRadius:6,padding:'6px 10px',marginBottom:4,fontSize:11,color:'#f87171'}}>{e.error}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {tab==='export' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
            {modules.map(m=>(
              <div key={m.module} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <h3 style={{color:'#f1f5f9',margin:0,fontSize:15,fontWeight:600,textTransform:'capitalize'}}>{m.module}</h3>
                  <FileText size={18} style={{color:'#64748b'}}/>
                </div>
                <div style={{color:'#64748b',fontSize:12,marginBottom:12}}>{m.columns.length} columns • Exports up to 1000 rows</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                  <button onClick={()=>downloadTemplate(m)} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'8px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}><Download size={12}/> Template</button>
                  <button onClick={()=>handleExport(m)} disabled={loading} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'8px',cursor:'pointer',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}><Download size={12}/> Export</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='jobs' && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
            {jobs.length===0 ? <div style={{textAlign:'center',padding:60,color:'#64748b'}}>No import jobs yet</div> : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>
                  {['Module','File','Total','Processed','Failed','Status','Date'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'12px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {jobs.map(j=>(
                    <tr key={j.job_id} style={{borderBottom:'1px solid #0f172a'}}>
                      <td style={{padding:'10px 16px',color:'#f1f5f9',fontSize:13,textTransform:'capitalize'}}>{j.module}</td>
                      <td style={{padding:'10px 16px',color:'#64748b',fontSize:12}}>{j.file_name||'N/A'}</td>
                      <td style={{padding:'10px 16px',color:'#94a3b8',fontSize:13}}>{j.total_records}</td>
                      <td style={{padding:'10px 16px',color:'#10b981',fontSize:13}}>{j.processed_records}</td>
                      <td style={{padding:'10px 16px',color:j.failed_records>0?'#ef4444':'#64748b',fontSize:13}}>{j.failed_records}</td>
                      <td style={{padding:'10px 16px'}}>
                        <span style={{background:j.status==='completed'?'#10b98120':j.status==='partial'?'#f59e0b20':'#3b82f620',color:j.status==='completed'?'#10b981':j.status==='partial'?'#f59e0b':'#3b82f6',padding:'2px 8px',borderRadius:20,fontSize:11,textTransform:'capitalize'}}>{j.status}</span>
                      </td>
                      <td style={{padding:'10px 16px',color:'#64748b',fontSize:12}}>{new Date(j.created_at).toLocaleDateString('en-IN')}</td>
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