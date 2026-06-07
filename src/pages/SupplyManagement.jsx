import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, RefreshCw, X, Truck, Star } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/supply'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const STATUS_COLOR = { Draft:'#64748b', Approved:'#3b82f6', Shipped:'#8b5cf6', Received:'#10b981', Cancelled:'#ef4444', Pending:'#f59e0b' }

export default function SupplyManagement() {
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState([])
  const [pos, setPOs] = useState([])
  const [supplierStats, setSupplierStats] = useState(null)
  const [poStats, setPOStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('suppliers')
  const [search, setSearch] = useState('')
  const [showSupplierForm, setShowSupplierForm] = useState(false)
  const [showPOForm, setShowPOForm] = useState(false)
  const [editSupplier, setEditSupplier] = useState(null)
  const [toast, setToast] = useState(null)
  const [supplierForm, setSupplierForm] = useState({supplier_name:'',contact_person:'',email:'',phone:'',address:'',city:'',country:'India',category:'',payment_terms:'Net 30',lead_time_days:7})
  const [poForm, setPOForm] = useState({supplier_id:'',expected_delivery:'',notes:''})
  const [poItems, setPOItems] = useState([{product_name:'',sku:'',quantity:1,unit_price:0}])

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [sRes, pRes, ssRes, psRes] = await Promise.all([
        fetch(API+'/suppliers', {headers:getHeaders()}),
        fetch(API+'/purchase-orders', {headers:getHeaders()}),
        fetch(API+'/suppliers/stats', {headers:getHeaders()}),
        fetch(API+'/purchase-orders/stats', {headers:getHeaders()})
      ])
      const [sData, pData, ssData, psData] = await Promise.all([sRes.json(), pRes.json(), ssRes.json(), psRes.json()])
      setSuppliers(sData.data||[])
      setPOs(pData.data||[])
      setSupplierStats(ssData.data||null)
      setPOStats(psData.data||null)
    } catch(e) { showToast('Failed to load','error') }
    setLoading(false)
  }

  const handleSaveSupplier = async () => {
    if(!supplierForm.supplier_name) { showToast('Supplier name required','error'); return }
    try {
      const url = editSupplier ? API+'/suppliers/'+editSupplier.supplier_id : API+'/suppliers'
      const method = editSupplier ? 'PUT' : 'POST'
      const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(supplierForm)})
      const data = await res.json()
      if(data.status==='success') { showToast(editSupplier?'Supplier updated!':'Supplier added!'); setShowSupplierForm(false); setEditSupplier(null); load() }
      else showToast(data.message,'error')
    } catch(e) { showToast('Failed to save','error') }
  }

  const handleDeleteSupplier = async (id) => {
    if(!confirm('Delete this supplier?')) return
    try {
      await fetch(API+'/suppliers/'+id, {method:'DELETE', headers:getHeaders()})
      showToast('Supplier deleted'); load()
    } catch(e) { showToast('Failed to delete','error') }
  }

  const handleSavePO = async () => {
    if(!poForm.supplier_id) { showToast('Select a supplier','error'); return }
    try {
      const res = await fetch(API+'/purchase-orders', {method:'POST', headers:getHeaders(), body:JSON.stringify({...poForm, items:poItems})})
      const data = await res.json()
      if(data.status==='success') { showToast('Purchase order created!'); setShowPOForm(false); load() }
      else showToast(data.message,'error')
    } catch(e) { showToast('Failed to create PO','error') }
  }

  const handleUpdatePOStatus = async (poId, status, payment_status) => {
    try {
      await fetch(API+'/purchase-orders/'+poId+'/status', {method:'PUT', headers:getHeaders(), body:JSON.stringify({status, payment_status})})
      showToast('Status updated!'); load()
    } catch(e) { showToast('Failed','error') }
  }

  const addPOItem = () => setPOItems([...poItems, {product_name:'',sku:'',quantity:1,unit_price:0}])
  const removePOItem = (i) => setPOItems(poItems.filter((_,idx)=>idx!==i))
  const updatePOItem = (i,f,v) => { const ni=[...poItems]; ni[i]={...ni[i],[f]:v}; setPOItems(ni) }

  const filteredSuppliers = suppliers.filter(s => !search || s.supplier_name?.toLowerCase().includes(search.toLowerCase()) || s.category?.toLowerCase().includes(search.toLowerCase()))
  const filteredPOs = pos.filter(p => !search || p.po_number?.toLowerCase().includes(search.toLowerCase()) || p.supplier_name?.toLowerCase().includes(search.toLowerCase()))

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Truck size={24} style={{color:'#14b8a6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Supply Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage suppliers and purchase orders</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          {tab==='suppliers' && <button onClick={()=>{setShowSupplierForm(true);setEditSupplier(null);setSupplierForm({supplier_name:'',contact_person:'',email:'',phone:'',address:'',city:'',country:'India',category:'',payment_terms:'Net 30',lead_time_days:7})}} style={{background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Supplier</button>}
          {tab==='pos' && <button onClick={()=>{setShowPOForm(true);setPOForm({supplier_id:'',expected_delivery:'',notes:''});setPOItems([{product_name:'',sku:'',quantity:1,unit_price:0}])}} style={{background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Create PO</button>}
        </div>
      </div>

      <div style={{padding:24}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Total Suppliers', value:supplierStats?.total||0, color:'#14b8a6'},
            {label:'Active Suppliers', value:supplierStats?.active||0, color:'#10b981'},
            {label:'Purchase Orders', value:poStats?.total||0, color:'#3b82f6'},
            {label:'Total Spend', value:'Rs.'+Number(poStats?.total_spend||0).toLocaleString(), color:'#f59e0b'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:4,background:'#1e293b',padding:4,borderRadius:8,marginBottom:16,width:'fit-content'}}>
          {[['suppliers','Suppliers'],['pos','Purchase Orders']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:'8px 20px',borderRadius:6,border:'none',background:tab===id?'#14b8a6':'transparent',color:tab===id?'#fff':'#64748b',cursor:'pointer',fontSize:13}}>{label}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 14px',marginBottom:16,maxWidth:400}}>
          <Search size={14} style={{color:'#64748b'}}/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
        </div>

        {/* Suppliers Tab */}
        {tab==='suppliers' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {filteredSuppliers.map(s=>(
              <div key={s.supplier_id} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <div>
                    <div style={{color:'#f1f5f9',fontWeight:700,fontSize:15}}>{s.supplier_name}</div>
                    <div style={{color:'#64748b',fontSize:12}}>{s.supplier_code} · {s.category}</div>
                  </div>
                  <span style={{background:s.status==='Active'?'#10b98120':'#ef444420',color:s.status==='Active'?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11,height:'fit-content'}}>{s.status}</span>
                </div>
                <div style={{display:'grid',gap:6,fontSize:12,marginBottom:12}}>
                  <div style={{color:'#94a3b8'}}>{s.contact_person} · {s.phone}</div>
                  <div style={{color:'#64748b'}}>{s.city}, {s.country}</div>
                  <div style={{display:'flex',gap:16}}>
                    <span style={{color:'#64748b'}}>Terms: <span style={{color:'#94a3b8'}}>{s.payment_terms}</span></span>
                    <span style={{color:'#64748b'}}>Lead: <span style={{color:'#94a3b8'}}>{s.lead_time_days}d</span></span>
                  </div>
                  {s.rating>0 && (
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                      <Star size={12} style={{color:'#f59e0b'}}/>
                      <span style={{color:'#f59e0b',fontSize:12}}>{s.rating}</span>
                    </div>
                  )}
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>{setEditSupplier(s);setSupplierForm({...s});setShowSupplierForm(true)}} style={{flex:1,background:'#14b8a620',border:'none',borderRadius:6,color:'#14b8a6',padding:'6px',cursor:'pointer',fontSize:12}}>Edit</button>
                  <button onClick={()=>handleDeleteSupplier(s.supplier_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'6px 10px',cursor:'pointer',fontSize:12}}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Purchase Orders Tab */}
        {tab==='pos' && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#0f172a'}}>
                  {['PO Number','Supplier','Order Date','Expected','Amount','Status','Payment','Actions'].map(h=>(
                    <th key={h} style={{color:'#64748b',fontSize:11,padding:'12px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPOs.map(po=>(
                  <tr key={po.po_id} style={{borderBottom:'1px solid #0f172a'}}>
                    <td style={{padding:'12px 16px',color:'#14b8a6',fontWeight:600,fontSize:13}}>{po.po_number}</td>
                    <td style={{padding:'12px 16px',color:'#f1f5f9',fontSize:13}}>{po.supplier_name}</td>
                    <td style={{padding:'12px 16px',color:'#64748b',fontSize:12}}>{new Date(po.order_date).toLocaleDateString()}</td>
                    <td style={{padding:'12px 16px',color:'#64748b',fontSize:12}}>{po.expected_delivery?new Date(po.expected_delivery).toLocaleDateString():'N/A'}</td>
                    <td style={{padding:'12px 16px',color:'#f1f5f9',fontWeight:600,fontSize:13}}>Rs.{Number(po.total_amount).toLocaleString()}</td>
                    <td style={{padding:'12px 16px'}}>
                      <select value={po.status} onChange={e=>handleUpdatePOStatus(po.po_id, e.target.value, po.payment_status)} style={{background:STATUS_COLOR[po.status]+'20',border:`1px solid ${STATUS_COLOR[po.status]}40`,borderRadius:20,color:STATUS_COLOR[po.status],padding:'3px 8px',fontSize:11,cursor:'pointer'}}>
                        {['Draft','Approved','Shipped','Received','Cancelled'].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{padding:'12px 16px'}}>
                      <select value={po.payment_status} onChange={e=>handleUpdatePOStatus(po.po_id, po.status, e.target.value)} style={{background:'#f59e0b20',border:'1px solid #f59e0b40',borderRadius:20,color:'#f59e0b',padding:'3px 8px',fontSize:11,cursor:'pointer'}}>
                        {['Pending','Partial','Paid'].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{padding:'12px 16px',color:'#64748b',fontSize:12}}>{po.supplier_code}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Supplier Form Modal */}
      {showSupplierForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowSupplierForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0,fontSize:16}}>{editSupplier?'Edit Supplier':'Add Supplier'}</h2>
              <button onClick={()=>setShowSupplierForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['supplier_name','Supplier Name *'],['contact_person','Contact Person'],['email','Email'],['phone','Phone'],['city','City'],['country','Country'],['category','Category'],['payment_terms','Payment Terms']].map(([key,label])=>(
                <div key={key}>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label>
                  <input value={supplierForm[key]||''} onChange={e=>setSupplierForm({...supplierForm,[key]:e.target.value})} style={inputStyle}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Lead Time (days)</label>
                <input type="number" value={supplierForm.lead_time_days||7} onChange={e=>setSupplierForm({...supplierForm,lead_time_days:parseInt(e.target.value)||7})} style={inputStyle}/>
              </div>
              {editSupplier && <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label>
                <select value={supplierForm.status||'Active'} onChange={e=>setSupplierForm({...supplierForm,status:e.target.value})} style={inputStyle}>
                  <option>Active</option><option>Inactive</option>
                </select>
              </div>}
              <div style={{gridColumn:'span 2'}}>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Address</label>
                <input value={supplierForm.address||''} onChange={e=>setSupplierForm({...supplierForm,address:e.target.value})} style={inputStyle}/>
              </div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowSupplierForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSaveSupplier} style={{flex:2,background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editSupplier?'Update':'Add Supplier'}</button>
            </div>
          </div>
        </div>
      )}

      {/* PO Form Modal */}
      {showPOForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowPOForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:640,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0,fontSize:16}}>Create Purchase Order</h2>
              <button onClick={()=>setShowPOForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Supplier *</label>
                <select value={poForm.supplier_id} onChange={e=>setPOForm({...poForm,supplier_id:e.target.value})} style={inputStyle}>
                  <option value="">Select Supplier</option>
                  {suppliers.filter(s=>s.status==='Active').map(s=><option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Expected Delivery</label>
                <input type="date" value={poForm.expected_delivery} onChange={e=>setPOForm({...poForm,expected_delivery:e.target.value})} style={inputStyle}/>
              </div>
              <div style={{gridColumn:'span 2'}}>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label>
                <input value={poForm.notes} onChange={e=>setPOForm({...poForm,notes:e.target.value})} style={inputStyle}/>
              </div>
            </div>
            <h3 style={{color:'#f1f5f9',fontSize:14,margin:'0 0 10px'}}>Items</h3>
            {poItems.map((item,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:8,marginBottom:8,alignItems:'center'}}>
                <input placeholder="Product" value={item.product_name} onChange={e=>updatePOItem(i,'product_name',e.target.value)} style={inputStyle}/>
                <input placeholder="SKU" value={item.sku} onChange={e=>updatePOItem(i,'sku',e.target.value)} style={inputStyle}/>
                <input type="number" placeholder="Qty" value={item.quantity} onChange={e=>updatePOItem(i,'quantity',parseInt(e.target.value)||1)} style={inputStyle}/>
                <input type="number" placeholder="Price" value={item.unit_price} onChange={e=>updatePOItem(i,'unit_price',parseFloat(e.target.value)||0)} style={inputStyle}/>
                <button onClick={()=>removePOItem(i)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'8px',cursor:'pointer'}}><X size={14}/></button>
              </div>
            ))}
            <button onClick={addPOItem} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 16px',cursor:'pointer',fontSize:13,marginBottom:16}}>+ Add Item</button>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowPOForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSavePO} style={{flex:2,background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create PO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}