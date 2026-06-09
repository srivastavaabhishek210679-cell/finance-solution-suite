import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, RefreshCw, Search, Download, Package, AlertTriangle, TrendingDown } from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/inventory-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['Electronics','Furniture','Stationery','IT Equipment','Raw Materials','Finished Goods','Consumables','Spare Parts','Safety Equipment','Other']
const STATUS_COLOR = { Active:'#10b981', 'Low Stock':'#f59e0b', 'Out of Stock':'#ef4444', Discontinued:'#64748b', Reorder:'#8b5cf6' }
const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#ec4899']

export default function InventoryManagement() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [activeTab, setActiveTab] = useState('list')
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({item_name:'',item_code:'',category:'Electronics',supplier:'',unit:'Units',current_stock:0,minimum_stock:10,maximum_stock:100,unit_price:0,location:'',status:'Active',notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [iRes, sRes] = await Promise.all([fetch(API,{headers:getHeaders()}), fetch(API+'/stats',{headers:getHeaders()})])
      const [i, s] = await Promise.all([iRes.json(), sRes.json()])
      setItems(i.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed','error') }
  }
  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    if(!form.item_name) { showToast('Item name required','error'); return }
    try {
      const url = editItem ? API+'/'+editItem.item_id : API
      const res = await fetch(url, {method:editItem?'PUT':'POST',headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast('Saved!'); setShowForm(false); setEditItem(null); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleStockUpdate = async (id, qty) => {
    await fetch(API+'/'+id+'/stock', {method:'PUT',headers:getHeaders(),body:JSON.stringify({current_stock:qty})})
    showToast('Stock updated'); load()
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete item?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const exportCSV = () => {
    const rows = [['Item Name','Code','Category','Supplier','Unit','Stock','Min Stock','Max Stock','Unit Price','Stock Value','Status'],
      ...filtered.map(i=>[i.item_name,i.item_code||'',i.category,i.supplier||'',i.unit,i.current_stock,i.minimum_stock,i.maximum_stock,i.unit_price,i.current_stock*i.unit_price,i.status])]
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(rows.map(r=>r.join(',')).join('\n')); el.download='inventory.csv'; el.click()
  }

  const getItemStatus = (item) => {
    if(item.current_stock===0) return 'Out of Stock'
    if(item.current_stock<=item.minimum_stock) return 'Low Stock'
    return item.status||'Active'
  }

  const filtered = items.filter(i=>{
    const ms = !search||i.item_name?.toLowerCase().includes(search.toLowerCase())||i.item_code?.toLowerCase().includes(search.toLowerCase())||i.supplier?.toLowerCase().includes(search.toLowerCase())
    const status = getItemStatus(i)
    return ms&&(filterCat==='All'||i.category===filterCat)&&(filterStatus==='All'||status===filterStatus)
  })

  const totalValue = items.reduce((s,i)=>s+(i.current_stock*parseFloat(i.unit_price||0)),0)
  const lowStockItems = items.filter(i=>i.current_stock<=i.minimum_stock&&i.current_stock>0).length
  const outOfStock = items.filter(i=>i.current_stock===0).length
  const catData = CATEGORIES.map(c=>({name:c.split(' ')[0],value:items.filter(i=>i.category===c).length,stockValue:items.filter(i=>i.category===c).reduce((s,i)=>s+(i.current_stock*parseFloat(i.unit_price||0)),0)})).filter(d=>d.value>0)
  const statusDist = [{name:'Active',value:items.filter(i=>i.current_stock>i.minimum_stock).length},{name:'Low Stock',value:lowStockItems},{name:'Out of Stock',value:outOfStock}].filter(d=>d.value>0)
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Package size={24} style={{color:'#3b82f6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Inventory Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track stock levels, reorder points and valuation</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          {lowStockItems>0&&<div style={{background:'#f59e0b20',border:'1px solid #f59e0b40',borderRadius:8,padding:'8px 12px',color:'#f59e0b',fontSize:12,display:'flex',alignItems:'center',gap:6}}><AlertTriangle size={14}/>{lowStockItems} low stock</div>}
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditItem(null);setForm({item_name:'',item_code:'',category:'Electronics',supplier:'',unit:'Units',current_stock:0,minimum_stock:10,maximum_stock:100,unit_price:0,location:'',status:'Active',notes:''})}} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Item</button>
        </div>
      </div>
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['list','Inventory List'],['analytics','Analytics & Valuation']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #3b82f6':'2px solid transparent',background:'transparent',color:activeTab===id?'#3b82f6':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[{label:'Total Items',value:items.length,color:'#3b82f6'},{label:'In Stock',value:items.filter(i=>i.current_stock>i.minimum_stock).length,color:'#10b981'},{label:'Low Stock',value:lowStockItems,color:'#f59e0b'},{label:'Out of Stock',value:outOfStock,color:'#ef4444'},{label:'Total Value',value:'Rs.'+Math.round(totalValue/1000)+'K',color:'#10b981'}].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:14,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>
        {activeTab==='list' && (
          <div>
            <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 12px',flex:1}}>
                <Search size={13} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['All',...CATEGORIES].map(c=><option key={c}>{c}</option>)}
              </select>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['All','Active','Low Stock','Out of Stock'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#0f172a'}}>{['Item','Code','Category','Supplier','Unit Price','Stock','Min/Max','Stock Value','Status','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 12px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155',whiteSpace:'nowrap'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length===0?<tr><td colSpan={10} style={{textAlign:'center',padding:40,color:'#64748b'}}>No items found</td></tr>
                  :filtered.map(i=>{
                    const itemStatus = getItemStatus(i)
                    const stockPct = Math.min(100,Math.round(i.current_stock/Math.max(i.maximum_stock,1)*100))
                    const stockColor = i.current_stock===0?'#ef4444':i.current_stock<=i.minimum_stock?'#f59e0b':'#10b981'
                    return (
                      <tr key={i.item_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{padding:'10px 12px'}}>
                          <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{i.item_name}</div>
                          {i.location&&<div style={{color:'#475569',fontSize:10}}>📍 {i.location}</div>}
                        </td>
                        <td style={{padding:'10px 12px',color:'#3b82f6',fontSize:11}}>{i.item_code||'—'}</td>
                        <td style={{padding:'10px 12px',color:'#94a3b8',fontSize:12}}>{i.category}</td>
                        <td style={{padding:'10px 12px',color:'#64748b',fontSize:12}}>{i.supplier||'—'}</td>
                        <td style={{padding:'10px 12px',color:'#f1f5f9',fontSize:13}}>Rs.{Number(i.unit_price||0).toLocaleString()}</td>
                        <td style={{padding:'10px 12px'}}>
                          <div style={{color:stockColor,fontSize:14,fontWeight:700}}>{i.current_stock} {i.unit}</div>
                          <div style={{height:4,background:'#334155',borderRadius:2,marginTop:3,width:60}}>
                            <div style={{height:'100%',width:stockPct+'%',background:stockColor,borderRadius:2}}></div>
                          </div>
                        </td>
                        <td style={{padding:'10px 12px',color:'#64748b',fontSize:12}}>{i.minimum_stock} / {i.maximum_stock}</td>
                        <td style={{padding:'10px 12px',color:'#10b981',fontSize:12,fontWeight:600}}>Rs.{Number(i.current_stock*parseFloat(i.unit_price||0)).toLocaleString()}</td>
                        <td style={{padding:'10px 12px'}}>
                          <span style={{background:STATUS_COLOR[itemStatus]+'20',color:STATUS_COLOR[itemStatus]||'#64748b',padding:'3px 8px',borderRadius:20,fontSize:11,fontWeight:600}}>{itemStatus}</span>
                        </td>
                        <td style={{padding:'10px 12px'}}>
                          <div style={{display:'flex',gap:4}}>
                            <input type="number" defaultValue={i.current_stock} onBlur={e=>parseInt(e.target.value)!==i.current_stock&&handleStockUpdate(i.item_id,parseInt(e.target.value))} style={{width:55,background:'#0f172a',border:'1px solid #334155',borderRadius:4,color:'#f1f5f9',padding:'3px 6px',fontSize:11}} title="Update stock"/>
                            <button onClick={()=>{setEditItem(i);setForm({item_name:i.item_name,item_code:i.item_code||'',category:i.category,supplier:i.supplier||'',unit:i.unit||'Units',current_stock:i.current_stock,minimum_stock:i.minimum_stock,maximum_stock:i.maximum_stock,unit_price:i.unit_price||0,location:i.location||'',status:i.status,notes:i.notes||''});setShowForm(true)}} style={{background:'#3b82f620',border:'none',borderRadius:4,color:'#3b82f6',padding:'3px 6px',cursor:'pointer',fontSize:11}}>Edit</button>
                            <button onClick={()=>handleDelete(i.item_id)} style={{background:'#ef444420',border:'none',borderRadius:4,color:'#ef4444',padding:'3px 5px',cursor:'pointer'}}><X size={10}/></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab==='analytics' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Stock Status</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90}>
                  {statusDist.map((_,i)=><Cell key={i} fill={['#10b981','#f59e0b','#ef4444'][i]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Items by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={catData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Bar dataKey="value" name="Items" fill="#3b82f6" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Stock Value by Category</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={catData}><CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}} tickFormatter={v=>'Rs.'+Math.round(v/1000)+'K'}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}} formatter={v=>['Rs.'+Number(v).toLocaleString(),'Value']}/>
                  <Bar dataKey="stockValue" name="Stock Value" fill="#10b981" radius={[6,6,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {lowStockItems>0&&(
              <div style={{background:'#f59e0b10',border:'1px solid #f59e0b30',borderRadius:12,padding:20,gridColumn:'span 2'}}>
                <h3 style={{color:'#f59e0b',margin:'0 0 12px',fontSize:14,fontWeight:600}}>⚠ Items Needing Reorder</h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:10}}>
                  {items.filter(i=>i.current_stock<=i.minimum_stock).map(i=>(
                    <div key={i.item_id} style={{background:'#0f172a',borderRadius:8,padding:10,borderLeft:`3px solid ${i.current_stock===0?'#ef4444':'#f59e0b'}`}}>
                      <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{i.item_name}</div>
                      <div style={{color:i.current_stock===0?'#ef4444':'#f59e0b',fontSize:12}}>{i.current_stock===0?'Out of stock':`Only ${i.current_stock} ${i.unit} left`}</div>
                      <div style={{color:'#475569',fontSize:11}}>Min: {i.minimum_stock} {i.unit}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editItem?'Edit Item':'Add Item'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Item Name *</label><input value={form.item_name} onChange={e=>setForm({...form,item_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Item Code</label><input value={form.item_code} onChange={e=>setForm({...form,item_code:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={inputStyle}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Supplier</label><input value={form.supplier} onChange={e=>setForm({...form,supplier:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Unit</label><select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})} style={inputStyle}>{['Units','Kg','Litres','Meters','Boxes','Pieces','Sets','Rolls'].map(u=><option key={u}>{u}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Unit Price (Rs)</label><input type="number" value={form.unit_price} onChange={e=>setForm({...form,unit_price:parseFloat(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Current Stock</label><input type="number" value={form.current_stock} onChange={e=>setForm({...form,current_stock:parseInt(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Minimum Stock</label><input type="number" value={form.minimum_stock} onChange={e=>setForm({...form,minimum_stock:parseInt(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Maximum Stock</label><input type="number" value={form.maximum_stock} onChange={e=>setForm({...form,maximum_stock:parseInt(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Location</label><input value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Warehouse/Shelf" style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} style={inputStyle}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editItem?'Update':'Add Item'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}