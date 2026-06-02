import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ArrowLeft, Plus, AlertTriangle, X, Edit, RefreshCw } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/inventory-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['Office Supplies','IT Equipment','Furniture','Health & Safety','Electrical','Machinery','Raw Materials','Finished Goods']

export default function InventoryManagement() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [showRestock, setShowRestock] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({item_name:'',item_code:'',category:'Office Supplies',unit:'Unit',current_stock:0,minimum_stock:0,maximum_stock:100,unit_price:0,supplier:'',location:''})
  const [restockForm, setRestockForm] = useState({quantity:0,reference:'',notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [iRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [i, s] = await Promise.all([iRes.json(), sRes.json()])
      setItems(i.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    const url = editItem ? API+'/'+editItem.item_id : API
    const method = editItem ? 'PUT' : 'POST'
    const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast(editItem?'Item updated!':'Item added!'); setShowForm(false); setEditItem(null); load() }
    else showToast(data.message,'error')
  }

  const handleRestock = async () => {
    const res = await fetch(API+'/'+selectedItem.item_id+'/restock', {method:'POST', headers:getHeaders(), body:JSON.stringify(restockForm)})
    const data = await res.json()
    if(data.status==='success') { showToast('Restocked successfully!'); setShowRestock(false); load() }
    else showToast(data.message,'error')
  }

  const filtered = items.filter(i =>
    (i.item_name+i.item_code+i.category).toLowerCase().includes(search.toLowerCase()) &&
    (filterCat==='All' || i.category===filterCat)
  )

  const categories = ['All', ...new Set(items.map(i=>i.category))]

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',color:'#0f172a',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#ffffff',borderBottom:'1px solid #e2e8f0',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Package size={28} style={{color:'#3b82f6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Inventory Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track stock levels, restocking and inventory value</p></div>
        <button onClick={()=>{setShowForm(true);setEditItem(null);setForm({item_name:'',item_code:'',category:'Office Supplies',unit:'Unit',current_stock:0,minimum_stock:0,maximum_stock:100,unit_price:0,supplier:'',location:''})}} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Item</button>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Items', value:stats.total, color:'#3b82f6'},
              {label:'Total Value', value:'₹'+Number(stats.totalValue||0).toLocaleString(), color:'#10b981'},
              {label:'Low Stock Alerts', value:stats.lowStock, color:'#ef4444'},
              {label:'Categories', value:stats.byCategory?.length||0, color:'#8b5cf6'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {items.filter(i=>i.current_stock<=i.minimum_stock).length > 0 && (
          <div style={{background:'#ef444415',border:'1px solid #ef444440',borderRadius:12,padding:16,marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}><AlertTriangle size={16} style={{color:'#ef4444'}}/><span style={{color:'#ef4444',fontWeight:600,fontSize:13}}>Low Stock Alert ({items.filter(i=>i.current_stock<=i.minimum_stock).length} items)</span></div>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {items.filter(i=>i.current_stock<=i.minimum_stock).map(i=>(
                <span key={i.item_id} style={{background:'#f8fafc',color:'#f59e0b',padding:'4px 10px',borderRadius:20,fontSize:12}}>{i.item_name}: {i.current_stock} {i.unit} remaining</span>
              ))}
            </div>
          </div>
        )}

        <div style={{display:'flex',gap:12,marginBottom:16,alignItems:'center',flexWrap:'wrap'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search inventory..." style={{flex:1,minWidth:200,background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'10px 14px',fontSize:13}}/>
          <div style={{display:'flex',gap:4,background:'#ffffff',padding:4,borderRadius:8,flexWrap:'wrap'}}>
            {categories.map(c=>(
              <button key={c} onClick={()=>setFilterCat(c)} style={{padding:'5px 10px',borderRadius:6,border:'none',background:filterCat===c?'#3b82f6':'transparent',color:filterCat===c?'#fff':'#64748b',cursor:'pointer',fontSize:11}}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
          <h3 style={{color:'#0f172a',margin:'0 0 16px',fontSize:14}}>Inventory Items ({filtered.length})</h3>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:'1px solid #e2e8f0'}}>{['Item','Code','Category','Stock','Min/Max','Unit Price','Value','Supplier','Status','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(item=>{
                const isLow = item.current_stock <= item.minimum_stock
                const value = Number(item.current_stock) * Number(item.unit_price)
                return (
                  <tr key={item.item_id} style={{borderBottom:'1px solid #f1f5f9',background:isLow?'#ef444408':'transparent'}}>
                    <td style={{padding:'10px 8px',color:'#0f172a',fontWeight:600,fontSize:13}}>{item.item_name}</td>
                    <td style={{padding:'10px 8px',color:'#64748b',fontSize:11}}>{item.item_code}</td>
                    <td style={{padding:'10px 8px',color:'#475569',fontSize:12}}>{item.category}</td>
                    <td style={{padding:'10px 8px'}}>
                      <span style={{color:isLow?'#ef4444':'#10b981',fontWeight:700,fontSize:14}}>{item.current_stock}</span>
                      <span style={{color:'#64748b',fontSize:11}}> {item.unit}</span>
                    </td>
                    <td style={{padding:'10px 8px',color:'#64748b',fontSize:12}}>{item.minimum_stock}/{item.maximum_stock}</td>
                    <td style={{padding:'10px 8px',color:'#3b82f6'}}>₹{Number(item.unit_price).toLocaleString()}</td>
                    <td style={{padding:'10px 8px',color:'#10b981',fontWeight:600}}>₹{value.toLocaleString()}</td>
                    <td style={{padding:'10px 8px',color:'#475569',fontSize:12}}>{item.supplier}</td>
                    <td style={{padding:'10px 8px'}}><span style={{background:isLow?'#ef444420':'#10b98120',color:isLow?'#ef4444':'#10b981',padding:'2px 8px',borderRadius:20,fontSize:11}}>{isLow?'Low Stock':'OK'}</span></td>
                    <td style={{padding:'10px 8px'}}>
                      <div style={{display:'flex',gap:4}}>
                        <button onClick={()=>{setSelectedItem(item);setRestockForm({quantity:0,reference:'',notes:''});setShowRestock(true)}} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'4px 8px',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',gap:2}}><RefreshCw size={10}/> Restock</button>
                        <button onClick={()=>{setEditItem(item);setForm(item);setShowForm(true)}} style={{background:'#e2e8f0',border:'none',borderRadius:6,color:'#475569',padding:'4px 8px',cursor:'pointer',fontSize:11}}><Edit size={10}/></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24,width:560}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#0f172a',margin:0}}>{editItem?'Edit Item':'Add Item'}</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['item_name','Item Name'],['item_code','Item Code'],['unit','Unit'],['supplier','Supplier'],['location','Location'],['unit_price','Unit Price','number'],['current_stock','Current Stock','number'],['minimum_stock','Min Stock','number'],['maximum_stock','Max Stock','number']].map(([key,label,type='text'])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editItem?'Update':'Add Item'}</button>
            </div>
          </div>
        </div>
      )}

      {showRestock && selectedItem && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowRestock(false)}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24,width:400}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#0f172a',margin:0}}>Restock — {selectedItem.item_name}</h2><button onClick={()=>setShowRestock(false)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{background:'#f8fafc',borderRadius:8,padding:12,marginBottom:16,fontSize:13,color:'#475569'}}>Current Stock: <strong style={{color:'#0f172a'}}>{selectedItem.current_stock} {selectedItem.unit}</strong></div>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Quantity to Add</label><input type="number" value={restockForm.quantity} onChange={e=>setRestockForm({...restockForm,quantity:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>PO Reference</label><input value={restockForm.reference} onChange={e=>setRestockForm({...restockForm,reference:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><textarea value={restockForm.notes} onChange={e=>setRestockForm({...restockForm,notes:e.target.value})} rows={2} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowRestock(false)} style={{flex:1,background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleRestock} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Restock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
