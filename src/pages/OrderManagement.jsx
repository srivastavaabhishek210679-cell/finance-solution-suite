import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Search, RefreshCw, X, Package, TrendingUp, DollarSign, AlertCircle } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/orders'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const STATUS_COLOR = { Pending:'#f59e0b', Processing:'#3b82f6', Shipped:'#8b5cf6', Delivered:'#10b981', Cancelled:'#ef4444' }
const PAYMENT_COLOR = { Paid:'#10b981', Unpaid:'#ef4444', Partial:'#f59e0b', Refunded:'#8b5cf6' }

export default function OrderManagement() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [toast, setToast] = useState(null)
  const [tab, setTab] = useState('orders')
  const [form, setForm] = useState({customer_name:'',customer_email:'',customer_phone:'',delivery_date:'',payment_method:'Bank Transfer',shipping_address:'',notes:''})
  const [items, setItems] = useState([{product_name:'',sku:'',quantity:1,unit_price:0}])

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const [oRes, sRes] = await Promise.all([
        fetch(API, {headers:getHeaders()}),
        fetch(API+'/stats', {headers:getHeaders()})
      ])
      const [oData, sData] = await Promise.all([oRes.json(), sRes.json()])
      setOrders(oData.data||[])
      setStats(sData.data||null)
    } catch(e) { showToast('Failed to load','error') }
    setLoading(false)
  }

  const handleSave = async () => {
    if(!form.customer_name) { showToast('Customer name required','error'); return }
    try {
      const res = await fetch(API, {method:'POST', headers:getHeaders(), body:JSON.stringify({...form, items})})
      const data = await res.json()
      if(data.status==='success') { showToast('Order created!'); setShowForm(false); load() }
      else showToast(data.message,'error')
    } catch(e) { showToast('Failed to create order','error') }
  }

  const handleStatusUpdate = async (orderId, status, payment_status) => {
    try {
      await fetch(API+'/'+orderId+'/status', {method:'PUT', headers:getHeaders(), body:JSON.stringify({status, payment_status})})
      showToast('Status updated!'); load()
    } catch(e) { showToast('Failed to update','error') }
  }

  const addItem = () => setItems([...items, {product_name:'',sku:'',quantity:1,unit_price:0}])
  const removeItem = (i) => setItems(items.filter((_,idx)=>idx!==i))
  const updateItem = (i, field, val) => { const newItems=[...items]; newItems[i]={...newItems[i],[field]:val}; setItems(newItems) }

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.order_number?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus==='All' || o.status===filterStatus
    return matchSearch && matchStatus
  })

  const totalValue = items.reduce((s,i)=>s+(i.quantity*i.unit_price),0)

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Package size={24} style={{color:'#3b82f6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Order Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track and manage customer orders</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>setShowForm(true)} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> New Order</button>
        </div>
      </div>

      <div style={{padding:24}}>
        {/* Stats */}
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
            {[
              {label:'Total Orders', value:stats.total_orders, color:'#3b82f6'},
              {label:'Revenue', value:'Rs.'+Number(stats.total_revenue||0).toLocaleString(), color:'#10b981'},
              {label:'Pending', value:stats.pending, color:'#f59e0b'},
              {label:'Processing', value:stats.processing, color:'#8b5cf6'},
              {label:'Delivered', value:stats.delivered, color:'#10b981'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{display:'flex',gap:12,marginBottom:16}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'#1e293b',border:'1px solid #334155',borderRadius:8,padding:'8px 14px',flex:1}}>
            <Search size={14} style={{color:'#64748b'}}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search orders..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
          </div>
          <div style={{display:'flex',gap:4,background:'#1e293b',padding:4,borderRadius:8}}>
            {['All','Pending','Processing','Shipped','Delivered','Cancelled'].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:'5px 10px',borderRadius:6,border:'none',background:filterStatus===s?'#3b82f6':'transparent',color:filterStatus===s?'#fff':'#64748b',cursor:'pointer',fontSize:11}}>{s}</button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#0f172a'}}>
                {['Order #','Customer','Date','Items','Amount','Status','Payment','Actions'].map(h=>(
                  <th key={h} style={{color:'#64748b',fontSize:11,padding:'12px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'#64748b'}}>Loading orders...</td></tr>
              ) : filtered.length===0 ? (
                <tr><td colSpan={8} style={{textAlign:'center',padding:40,color:'#64748b'}}>No orders found</td></tr>
              ) : filtered.map(o=>(
                <tr key={o.order_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px',color:'#3b82f6',fontSize:13,fontWeight:600}}>{o.order_number}</td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{o.customer_name}</div>
                    <div style={{color:'#64748b',fontSize:11}}>{o.customer_email}</div>
                  </td>
                  <td style={{padding:'12px 16px',color:'#64748b',fontSize:12}}>{new Date(o.order_date).toLocaleDateString()}</td>
                  <td style={{padding:'12px 16px',color:'#94a3b8',fontSize:13}}>{o.item_count||0}</td>
                  <td style={{padding:'12px 16px',color:'#f1f5f9',fontSize:13,fontWeight:600}}>Rs.{Number(o.total_amount).toLocaleString()}</td>
                  <td style={{padding:'12px 16px'}}>
                    <select value={o.status} onChange={e=>handleStatusUpdate(o.order_id, e.target.value, o.payment_status)} style={{background:STATUS_COLOR[o.status]+'20',border:`1px solid ${STATUS_COLOR[o.status]}40`,borderRadius:20,color:STATUS_COLOR[o.status],padding:'3px 8px',fontSize:11,cursor:'pointer'}}>
                      {['Pending','Processing','Shipped','Delivered','Cancelled'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <select value={o.payment_status} onChange={e=>handleStatusUpdate(o.order_id, o.status, e.target.value)} style={{background:PAYMENT_COLOR[o.payment_status]+'20',border:`1px solid ${PAYMENT_COLOR[o.payment_status]}40`,borderRadius:20,color:PAYMENT_COLOR[o.payment_status],padding:'3px 8px',fontSize:11,cursor:'pointer'}}>
                      {['Unpaid','Partial','Paid','Refunded'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <button onClick={()=>setSelectedOrder(o)} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 10px',cursor:'pointer',fontSize:12}}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Order Modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:680,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>Create New Order</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              {[['customer_name','Customer Name *'],['customer_email','Email'],['customer_phone','Phone'],['delivery_date','Delivery Date']].map(([key,label])=>(
                <div key={key}>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label>
                  <input type={key==='delivery_date'?'date':'text'} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={inputStyle}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Payment Method</label>
                <select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})} style={inputStyle}>
                  {['Bank Transfer','Cheque','NEFT','UPI','Credit','Cash'].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div style={{gridColumn:'span 2'}}>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Shipping Address</label>
                <input value={form.shipping_address||''} onChange={e=>setForm({...form,shipping_address:e.target.value})} style={inputStyle}/>
              </div>
            </div>

            <h3 style={{color:'#f1f5f9',fontSize:14,margin:'0 0 10px'}}>Order Items</h3>
            {items.map((item,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:8,marginBottom:8,alignItems:'center'}}>
                <input placeholder="Product Name" value={item.product_name} onChange={e=>updateItem(i,'product_name',e.target.value)} style={inputStyle}/>
                <input placeholder="SKU" value={item.sku} onChange={e=>updateItem(i,'sku',e.target.value)} style={inputStyle}/>
                <input type="number" placeholder="Qty" value={item.quantity} onChange={e=>updateItem(i,'quantity',parseInt(e.target.value)||1)} style={inputStyle}/>
                <input type="number" placeholder="Price" value={item.unit_price} onChange={e=>updateItem(i,'unit_price',parseFloat(e.target.value)||0)} style={inputStyle}/>
                <button onClick={()=>removeItem(i)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'8px',cursor:'pointer'}}><X size={14}/></button>
              </div>
            ))}
            <button onClick={addItem} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 16px',cursor:'pointer',fontSize:13,marginBottom:16}}>+ Add Item</button>

            <div style={{background:'#0f172a',borderRadius:8,padding:12,marginBottom:16,display:'flex',justifyContent:'space-between'}}>
              <span style={{color:'#64748b'}}>Subtotal</span><span style={{color:'#f1f5f9',fontWeight:600}}>Rs.{totalValue.toLocaleString()}</span>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create Order</button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelectedOrder(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0,fontSize:16}}>{selectedOrder.order_number}</h2>
              <button onClick={()=>setSelectedOrder(null)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gap:8}}>
              {[['Customer',selectedOrder.customer_name],['Email',selectedOrder.customer_email],['Phone',selectedOrder.customer_phone],['Order Date',new Date(selectedOrder.order_date).toLocaleDateString()],['Delivery Date',selectedOrder.delivery_date?new Date(selectedOrder.delivery_date).toLocaleDateString():'N/A'],['Total Amount','Rs.'+Number(selectedOrder.total_amount).toLocaleString()],['Tax','Rs.'+Number(selectedOrder.tax_amount||0).toLocaleString()],['Payment Method',selectedOrder.payment_method],['Shipping',selectedOrder.shipping_address]].map(([label,val])=>(
                <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #334155'}}>
                  <span style={{color:'#64748b',fontSize:13}}>{label}</span>
                  <span style={{color:'#f1f5f9',fontSize:13,fontWeight:500,maxWidth:250,textAlign:'right'}}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}