import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, RefreshCw, CheckCircle, AlertCircle, Settings, Eye } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/ftp'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

export default function FTPWatcher() {
  const navigate = useNavigate()
  const [configs, setConfigs] = useState([])
  const [processedFiles, setProcessedFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeTab, setActiveTab] = useState('configs')
  const [form, setForm] = useState({name:'',protocol:'sftp',host:'',port:'22',username:'',password:'',remote_path:'/'})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),4000) }

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [cfgRes, filesRes] = await Promise.all([
        fetch(API, {headers:getHeaders()}),
        fetch(API+'/processed-files', {headers:getHeaders()})
      ])
      const [cfgData, filesData] = await Promise.all([cfgRes.json(), filesRes.json()])
      setConfigs(cfgData.data||[])
      setProcessedFiles(filesData.data||[])
    } catch(e) { showToast('Failed to load data','error') }
    setLoading(false)
  }

  const handleSave = async () => {
    if(!form.name||!form.host||!form.username||!form.password) { showToast('Please fill all required fields','error'); return }
    try {
      const res = await fetch(API, {method:'POST', headers:getHeaders(), body:JSON.stringify({...form, port:parseInt(form.port)||22})})
      const data = await res.json()
      if(data.status==='success') { showToast('FTP config saved!'); setShowForm(false); setForm({name:'',protocol:'sftp',host:'',port:'22',username:'',password:'',remote_path:'/'}); loadData() }
      else showToast(data.message,'error')
    } catch(e) { showToast('Failed to save','error') }
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete this FTP configuration?')) return
    try {
      await fetch(API+'/'+id, {method:'DELETE', headers:getHeaders()})
      showToast('Config deleted'); loadData()
    } catch(e) { showToast('Failed to delete','error') }
  }

  const handleToggle = async (config) => {
    try {
      await fetch(API+'/'+config.config_id, {method:'PUT', headers:getHeaders(), body:JSON.stringify({...config, is_active:!config.is_active})})
      showToast(config.is_active?'Config disabled':'Config enabled'); loadData()
    } catch(e) { showToast('Failed to update','error') }
  }

  const handleTrigger = async () => {
    setTriggering(true)
    try {
      const res = await fetch(API+'/trigger', {method:'POST', headers:getHeaders()})
      const data = await res.json()
      showToast('FTP watch triggered! Check processed files shortly.')
      setTimeout(loadData, 3000)
    } catch(e) { showToast('Failed to trigger','error') }
    setTriggering(false)
  }

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'10px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <div style={{fontSize:24}}>📡</div>
        <div>
          <h1 style={{margin:0,fontSize:20,fontWeight:700}}>FTP/SFTP File Watcher</h1>
          <p style={{margin:0,fontSize:12,color:'#64748b'}}>Auto-import files from remote servers every 120 minutes</p>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <button onClick={loadData} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><RefreshCw size={14}/> Refresh</button>
          <button onClick={handleTrigger} disabled={triggering} style={{background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,opacity:triggering?0.6:1}}>
            {triggering?'Running...':'▶ Run Now'}
          </button>
          <button onClick={()=>setShowForm(true)} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add FTP Config</button>
        </div>
      </div>

      <div style={{padding:24}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
          {[
            {label:'Active Configs', value:configs.filter(c=>c.is_active).length, color:'#10b981', icon:'📡'},
            {label:'Total Configs', value:configs.length, color:'#3b82f6', icon:'⚙️'},
            {label:'Files Processed', value:processedFiles.length, color:'#8b5cf6', icon:'📄'},
            {label:'Check Interval', value:'120 min', color:'#f59e0b', icon:'⏱️'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:24,marginBottom:8}}>{s.icon}</div>
              <div style={{fontSize:24,fontWeight:700,color:s.color}}>{s.value}</div>
              <div style={{fontSize:12,color:'#64748b'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:4,background:'#1e293b',padding:4,borderRadius:8,marginBottom:20,width:'fit-content'}}>
          {['configs','processed'].map(tab=>(
            <button key={tab} onClick={()=>setActiveTab(tab)} style={{padding:'8px 20px',borderRadius:6,border:'none',background:activeTab===tab?'#3b82f6':'transparent',color:activeTab===tab?'#fff':'#64748b',cursor:'pointer',fontSize:13,textTransform:'capitalize'}}>{tab==='configs'?'FTP Configs':'Processed Files'}</button>
          ))}
        </div>

        {/* FTP Configs */}
        {activeTab==='configs' && (
          <div>
            {configs.length===0 ? (
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:60,textAlign:'center'}}>
                <div style={{fontSize:48,marginBottom:16}}>📡</div>
                <h3 style={{color:'#f1f5f9',margin:'0 0 8px'}}>No FTP Configurations</h3>
                <p style={{color:'#64748b',margin:'0 0 20px'}}>Add an FTP/SFTP server to start auto-importing files</p>
                <button onClick={()=>setShowForm(true)} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px 24px',cursor:'pointer',fontWeight:600}}>Add FTP Config</button>
              </div>
            ) : (
              <div style={{display:'grid',gap:16}}>
                {configs.map(config=>(
                  <div key={config.config_id} style={{background:'#1e293b',border:`1px solid ${config.is_active?'#10b98140':'#334155'}`,borderRadius:12,padding:20}}>
                    <div style={{display:'flex',alignItems:'center',gap:16}}>
                      <div style={{width:48,height:48,borderRadius:12,background:config.is_active?'#10b98120':'#334155',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>📡</div>
                      <div style={{flex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                          <span style={{color:'#f1f5f9',fontWeight:700,fontSize:15}}>{config.name}</span>
                          <span style={{background:config.is_active?'#10b98120':'#ef444420',color:config.is_active?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11}}>{config.is_active?'Active':'Inactive'}</span>
                          <span style={{background:'#3b82f620',color:'#3b82f6',padding:'2px 8px',borderRadius:20,fontSize:11}}>{config.protocol.toUpperCase()}</span>
                        </div>
                        <div style={{display:'flex',gap:16,fontSize:12,color:'#64748b'}}>
                          <span>🖥️ {config.host}:{config.port}</span>
                          <span>👤 {config.username}</span>
                          <span>📁 {config.remote_path}</span>
                          {config.last_checked && <span>🕐 Last: {new Date(config.last_checked).toLocaleString()}</span>}
                        </div>
                      </div>
                      <div style={{display:'flex',gap:8}}>
                        <button onClick={()=>handleToggle(config)} style={{background:config.is_active?'#ef444420':'#10b98120',border:'none',borderRadius:8,color:config.is_active?'#ef4444':'#10b981',padding:'8px 14px',cursor:'pointer',fontSize:12,fontWeight:600}}>
                          {config.is_active?'Disable':'Enable'}
                        </button>
                        <button onClick={()=>handleDelete(config.config_id)} style={{background:'#ef444420',border:'none',borderRadius:8,color:'#ef4444',padding:'8px',cursor:'pointer'}}><Trash2 size={14}/></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Processed Files */}
        {activeTab==='processed' && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
            {processedFiles.length===0 ? (
              <div style={{textAlign:'center',padding:60,color:'#64748b'}}>
                <div style={{fontSize:48,marginBottom:16}}>📄</div>
                <p>No files processed yet. Run the watcher to import files.</p>
              </div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#0f172a'}}>
                    {['File Name','Config','Processed At'].map(h=>(
                      <th key={h} style={{color:'#64748b',fontSize:11,padding:'12px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {processedFiles.map(f=>(
                    <tr key={f.id} style={{borderBottom:'1px solid #0f172a'}}>
                      <td style={{padding:'10px 16px',color:'#f1f5f9',fontSize:13}}>{f.file_name}</td>
                      <td style={{padding:'10px 16px'}}><span style={{background:'#3b82f620',color:'#3b82f6',padding:'2px 8px',borderRadius:20,fontSize:11}}>{f.config_name}</span></td>
                      <td style={{padding:'10px 16px',color:'#64748b',fontSize:12}}>{new Date(f.processed_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Add Config Modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:28,width:500}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#f1f5f9',margin:'0 0 20px',fontSize:16}}>Add FTP/SFTP Configuration</h2>
            <div style={{display:'grid',gap:12}}>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Config Name *</label>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Sales Data Server" style={inputStyle}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Protocol</label>
                  <select value={form.protocol} onChange={e=>setForm({...form,protocol:e.target.value,port:e.target.value==='sftp'?'22':'21'})} style={inputStyle}>
                    <option value="sftp">SFTP (Secure)</option>
                    <option value="ftp">FTP</option>
                  </select>
                </div>
                <div>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Port</label>
                  <input value={form.port} onChange={e=>setForm({...form,port:e.target.value})} placeholder="22" style={inputStyle}/>
                </div>
              </div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Host/IP *</label>
                <input value={form.host} onChange={e=>setForm({...form,host:e.target.value})} placeholder="192.168.1.100 or ftp.example.com" style={inputStyle}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Username *</label>
                  <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="ftpuser" style={inputStyle}/>
                </div>
                <div>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Password *</label>
                  <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" style={inputStyle}/>
                </div>
              </div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Remote Path</label>
                <input value={form.remote_path} onChange={e=>setForm({...form,remote_path:e.target.value})} placeholder="/data/reports" style={inputStyle}/>
              </div>
            </div>
            <div style={{background:'#0f172a',borderRadius:8,padding:12,marginTop:12,fontSize:12,color:'#64748b'}}>
              ℹ️ The watcher will check this server every 120 minutes for new CSV, Excel or text files and auto-generate reports.
            </div>
            <div style={{display:'flex',gap:10,marginTop:16}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Save Configuration</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}