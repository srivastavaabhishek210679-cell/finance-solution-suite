import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ArrowLeft, Plus, AlertTriangle, X, Edit, Trash2, RefreshCw, Search, Download, TrendingDown } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/asset-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['IT Equipment','Office Equipment','Furniture','Electrical','IT Infrastructure','Vehicle','Security','Machinery']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const STATUS_COLOR = { Active:'#10b981', 'In Repair':'#f59e0b', Disposed:'#ef4444', Idle:'#64748b', 'Under Maintenance':'#8b5cf6' }

export default function AssetManagement() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterDept, setFilterDept] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editAsset, setEditAsset] = useState(null)
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({asset_name:'',asset_code:'',category:'IT Equipment',department:'IT',assigned_to:'',purchase_date:'',purchase_price:0,current_value:0,depreciation_rate:20,status:'Active',location:'',warranty_expiry:'',serial_number:'',notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [aRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [a, s] = await Promise.all([aRes.json(), sRes.json()])
      setAssets(a.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.asset_name) { showToast('Asset name required','error'); return }
    try {
      const url = editAsset ? API+'/'+editAsset.asset_id : API
      const method = editAsset ? 'PUT' : 'POST'
      const res = await fetch(url, {method,headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast(editAsset?'Asset updated!':'Asset added!'); setShowForm(false); setEditAsset(null); load() }
      else showToast(data.message||'Failed','error')
    } catch(e) { showToast('Failed','error') }
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete this asset?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Asset deleted'); load()
  }

  const handleStatusUpdate = async (id, status) => {
    await fetch(API+'/'+id+'/status', {method:'PUT',headers:getHeaders(),body:JSON.stringify({status})})
    showToast('Status updated'); load()
  }

  const exportCSV = () => {
    const hdrs = ['Asset Name','Code','Category','Department','Assigned To','Status','Purchase Price','Current Value','Location','Purchase Date']
    const rows = filtered.map(a=>[a.asset_name,a.asset_code,a.category,a.department,a.assigned_to||'',a.status,a.purchase_price,a.current_value,a.location||'',a.purchase_date||''])
    const csv = [hdrs,...rows].map(r=>r.join(',')).join('\n')
    const el = document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); el.download='assets.csv'; el.click()
  }

  const calcDepreciation = (asset) => {
    if(!asset.purchase_date||!asset.purchase_price) return 0
    const years = (new Date()-new Date(asset.purchase_date))/(365.25*24*3600*1000)
    return Math.max(0, asset.purchase_price - asset.purchase_price*Math.pow(1-asset.depreciation_rate/100, years))
  }

  const filtered = assets.filter(a=>{
    const ms = !search||a.asset_name?.toLowerCase().includes(search.toLowerCase())||a.asset_code?.toLowerCase().includes(search.toLowerCase())||a.assigned_to?.toLowerCase().includes(search.toLowerCase())
    const mc = filterCat==='All'||a.category===filterCat
    const ms2 = filterStatus==='All'||a.status===filterStatus
    const md = filterDept==='All'||a.department===filterDept
    return ms&&mc&&ms2&&md
  })

  const totalValue = assets.reduce((s,a)=>s+parseFloat(a.current_value||0),0)
  const totalPurchase = assets.reduce((s,a)=>s+parseFloat(a.purchase_price||0),0)
  const warrantyExpiring = assets.filter(a=>a.warranty_expiry&&new Date(a.warranty_expiry)<new Date(Date.now()+30*24*3600*1000)&&new Date(a.warranty_expiry)>new Date()).length

  const catData = CATEGORIES.map(c=>({ name:c, value:assets.filter(a=>a.category===c).length })).filter(d=>d.value>0)
  const deptData = DEPTS.map(d=>({ name:d, value:assets.filter(a=>a.department===d).reduce((s,a)=>s+parseFloat(a.current_value||0),0) })).filter(d=>d.value>0)
  const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899']

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Package size={24} style={{color:'#f59e0b'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Asset Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track, manage and depreciate company assets</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:12}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditAsset(null);setForm({asset_name:'',asset_code:'',category:'IT Equipment',department:'IT',assigned_to:'',purchase_date:'',purchase_price:0,current_value:0,depreciation_rate:20,status:'Active',location:'',warranty_expiry:'',serial_number:'',notes:''})}} style={{background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Asset</button>
        </div>
      </div>

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Asset List'],['analytics','Analytics & Depreciation']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #f59e0b':'2px solid transparent',background:'transparent',color:activeTab===id?'#f59e0b':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>

      <div style={{padding:24}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Total Assets', value:assets.length, color:'#3b82f6'},
            {label:'Active', value:assets.filter(a=>a.status==='Active').length, color:'#10b981'},
            {label:'Purchase Value', value:'Rs.'+Math.round(totalPurchase/1000)+'K', color:'#f59e0b'},
            {label:'Current Value', value:'Rs.'+Math.round(totalValue/1000)+'K', color:'#10b981'},
            {label:'Warranty Expiring', value:warrantyExpiring, color:'#ef4444'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:14,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {activeTab==='list' && (
          <div>
            {/* Filters */}
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding:14,marginBottom:16,display:'flex',gap:10,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#0f172a',border:'1px solid #334155',borderRadius:8,padding:'7px 12px',flex:1,minWidth:200}}>
                <Search size={13} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search assets..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              {[['filterCat',['All',...CATEGORIES],filterCat,setFilterCat],['filterStatus',['All','Active','In Repair','Under Maintenance','Idle','Disposed'],filterStatus,setFilterStatus],['filterDept',['All',...DEPTS],filterDept,setFilterDept]].map(([key,opts,val,setter])=>(
                <select key={key} value={val} onChange={e=>setter(e.target.value)} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'7px 12px',fontSize:13,cursor:'pointer'}}>
                  {opts.map(o=><option key={o}>{o}</option>)}
                </select>
              ))}
            </div>

            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <div style={{padding:'10px 16px',borderBottom:'1px solid #334155',color:'#64748b',fontSize:12}}>{filtered.length} assets</div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:'#0f172a'}}>
                    {['Asset','Code','Category','Dept','Assigned To','Purchase','Current Value','Depreciation','Status','Actions'].map(h=>(
                      <th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 14px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155',whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {filtered.map(a=>{
                      const depr = calcDepreciation(a)
                      const deprPct = a.purchase_price>0 ? Math.round(depr/a.purchase_price*100) : 0
                      const warrantyExpired = a.warranty_expiry && new Date(a.warranty_expiry) < new Date()
                      return (
                        <tr key={a.asset_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{padding:'10px 14px'}}>
                            <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{a.asset_name}</div>
                            {warrantyExpired && <span style={{color:'#ef4444',fontSize:10}}>⚠ Warranty expired</span>}
                            {a.serial_number && <div style={{color:'#64748b',fontSize:10}}>S/N: {a.serial_number}</div>}
                          </td>
                          <td style={{padding:'10px 14px',color:'#3b82f6',fontSize:12,fontWeight:600}}>{a.asset_code||'—'}</td>
                          <td style={{padding:'10px 14px',color:'#94a3b8',fontSize:12}}>{a.category}</td>
                          <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{a.department}</td>
                          <td style={{padding:'10px 14px',color:'#94a3b8',fontSize:12}}>{a.assigned_to||'Unassigned'}</td>
                          <td style={{padding:'10px 14px',color:'#f1f5f9',fontSize:12}}>Rs.{Number(a.purchase_price||0).toLocaleString()}</td>
                          <td style={{padding:'10px 14px',color:'#10b981',fontSize:12,fontWeight:600}}>Rs.{Number(a.current_value||0).toLocaleString()}</td>
                          <td style={{padding:'10px 14px'}}>
                            <div style={{fontSize:11,color:'#ef4444'}}>{deprPct}% depreciated</div>
                            <div style={{height:4,background:'#334155',borderRadius:2,marginTop:3}}><div style={{height:'100%',width:deprPct+'%',background:'#ef4444',borderRadius:2}}></div></div>
                          </td>
                          <td style={{padding:'10px 14px'}}>
                            <select value={a.status} onChange={e=>handleStatusUpdate(a.asset_id,e.target.value)} style={{background:STATUS_COLOR[a.status]+'20',border:`1px solid ${STATUS_COLOR[a.status]}40`,borderRadius:20,color:STATUS_COLOR[a.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                              {['Active','In Repair','Under Maintenance','Idle','Disposed'].map(s=><option key={s}>{s}</option>)}
                            </select>
                          </td>
                          <td style={{padding:'10px 14px'}}>
                            <div style={{display:'flex',gap:4}}>
                              <button onClick={()=>{setEditAsset(a);setForm({asset_name:a.asset_name,asset_code:a.asset_code||'',category:a.category,department:a.department,assigned_to:a.assigned_to||'',purchase_date:a.purchase_date?.split('T')[0]||'',purchase_price:a.purchase_price,current_value:a.current_value,depreciation_rate:a.depreciation_rate||20,status:a.status,location:a.location||'',warranty_expiry:a.warranty_expiry?.split('T')[0]||'',serial_number:a.serial_number||'',notes:a.notes||''});setShowForm(true)}} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:11}}><Edit size={11}/></button>
                              <button onClick={()=>setSelectedAsset(a)} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'4px 8px',cursor:'pointer',fontSize:11}}>View</button>
                              <button onClick={()=>handleDelete(a.asset_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 6px',cursor:'pointer'}}><Trash2 size={11}/></button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab==='analytics' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Assets by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={catData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name,value})=>name+': '+value}>
                  {catData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Asset Value by Department</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis type="number" tick={{fill:'#64748b',fontSize:10}} tickFormatter={v=>'Rs.'+Math.round(v/1000)+'K'}/>
                  <YAxis type="category" dataKey="name" tick={{fill:'#94a3b8',fontSize:11}} width={90}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}} formatter={v=>['Rs.'+Number(v).toLocaleString(),'Value']}/>
                  <Bar dataKey="value" fill="#f59e0b" radius={[0,6,6,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Depreciation Overview</h3>
              <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
                {[
                  {label:'Total Purchase Value', value:'Rs.'+Number(totalPurchase).toLocaleString(), color:'#3b82f6'},
                  {label:'Current Book Value', value:'Rs.'+Number(totalValue).toLocaleString(), color:'#10b981'},
                  {label:'Total Depreciation', value:'Rs.'+Number(totalPurchase-totalValue).toLocaleString(), color:'#ef4444'},
                  {label:'Avg Depreciation Rate', value:assets.length?Math.round(assets.reduce((s,a)=>s+parseFloat(a.depreciation_rate||0),0)/assets.length)+'%':'0%', color:'#f59e0b'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'#0f172a',borderRadius:10,padding:14,borderLeft:`3px solid ${s.color}`}}>
                    <div style={{fontSize:10,color:'#64748b',marginBottom:4}}>{s.label}</div>
                    <div style={{fontSize:16,fontWeight:700,color:s.color}}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelectedAsset(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:500}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0,fontSize:16}}>{selectedAsset.asset_name}</h2>
              <button onClick={()=>setSelectedAsset(null)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={18}/></button>
            </div>
            <div style={{display:'grid',gap:8}}>
              {[
                ['Asset Code',selectedAsset.asset_code||'N/A'],['Category',selectedAsset.category],
                ['Department',selectedAsset.department],['Assigned To',selectedAsset.assigned_to||'Unassigned'],
                ['Serial Number',selectedAsset.serial_number||'N/A'],['Location',selectedAsset.location||'N/A'],
                ['Purchase Date',selectedAsset.purchase_date?new Date(selectedAsset.purchase_date).toLocaleDateString('en-IN'):'N/A'],
                ['Purchase Price','Rs.'+Number(selectedAsset.purchase_price||0).toLocaleString()],
                ['Current Value','Rs.'+Number(selectedAsset.current_value||0).toLocaleString()],
                ['Depreciation Rate',selectedAsset.depreciation_rate+'% p.a.'],
                ['Warranty Expiry',selectedAsset.warranty_expiry?new Date(selectedAsset.warranty_expiry).toLocaleDateString('en-IN'):'N/A'],
                ['Status',selectedAsset.status],['Notes',selectedAsset.notes||'—'],
              ].map(([l,v])=>(
                <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',background:'#0f172a',borderRadius:6,fontSize:13}}>
                  <span style={{color:'#64748b'}}>{l}</span><span style={{color:'#f1f5f9',fontWeight:500}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:600,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editAsset?'Edit Asset':'Add New Asset'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['asset_name','Asset Name *','text'],['asset_code','Asset Code','text'],['serial_number','Serial Number','text'],['location','Location','text'],['assigned_to','Assigned To','text'],['purchase_date','Purchase Date','date'],['warranty_expiry','Warranty Expiry','date']].map(([k,l,t])=>(
                <div key={k}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{l}</label>
                <input type={t} value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})} style={inputStyle}/></div>
              ))}
              {[['purchase_price','Purchase Price','number'],['current_value','Current Value','number'],['depreciation_rate','Depreciation Rate (%)','number']].map(([k,l,t])=>(
                <div key={k}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{l}</label>
                <input type={t} value={form[k]||0} onChange={e=>setForm({...form,[k]:parseFloat(e.target.value)||0})} style={inputStyle}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inputStyle}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label>
                <select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inputStyle}>
                  {DEPTS.map(d=><option key={d}>{d}</option>)}
                </select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>
                  {['Active','In Repair','Under Maintenance','Idle','Disposed'].map(s=><option key={s}>{s}</option>)}
                </select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label>
                <textarea value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editAsset?'Update Asset':'Add Asset'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}