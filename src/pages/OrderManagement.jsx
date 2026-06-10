import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts'
import { ArrowLeft, Plus, Search, RefreshCw, X, Package, Filter, Download, ChevronDown, ChevronUp, Eye, CheckCircle, XCircle, Truck } from 'lucide-react'

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
  const [filterPayment, setFilterPayment] = useState('All')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [toast, setToast] = useState(null)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [sortBy, setSortBy] = useState('created_at')
  const [sortDir, setSortDir] = useState('desc')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState('orders')
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
    } catch(e) { showToast('Failed','error') }
  }

  const handleStatusUpdate = async (orderId, status, payment_status) => {
    try {
      await fetch(API+'/'+orderId+'/status', {method:'PUT', headers:getHeaders(), body:JSON.stringify({status, payment_status})})
      showToast('Updated!'); load()
      if(selectedOrder?.order_id === orderId) setSelectedOrder({...selectedOrder, status, payment_status})
    } catch(e) { showToast('Failed','error') }
  }

  const handleBulkAction = async (action) => {
    if(selectedOrders.length === 0) { showToast('Select orders first','error'); return }
    try {
      await Promise.all(selectedOrders.map(id => {
        const order = orders.find(o => o.order_id === id)
        return fetch(API+'/'+id+'/status', {method:'PUT', headers:getHeaders(), body:JSON.stringify({status:action, payment_status:order?.payment_status||'Unpaid'})})
      }))
      showToast(`${selectedOrders.length} orders updated to ${action}`)
      setSelectedOrders([])
      load()
    } catch(e) { showToast('Bulk action failed','error') }
  }

  const addItem = () => setItems([...items, {product_name:'',sku:'',quantity:1,unit_price:0}])
  const removeItem = (i) => setItems(items.filter((_,idx)=>idx!==i))
  const updateItem = (i, f, v) => { const n=[...items]; n[i]={...n[i],[f]:v}; setItems(n) }

  const toggleSelectOrder = (id) => setSelectedOrders(prev => prev.includes(id) ? prev.filter(i=>i!==id) : [...prev, id])
  const toggleSelectAll = () => setSelectedOrders(selectedOrders.length === filtered.length ? [] : filtered.map(o=>o.order_id))

  const sorted = [...orders].sort((a,b) => {
    const va = sortBy === 'total_amount' ? parseFloat(a[sortBy]) : a[sortBy]
    const vb = sortBy === 'total_amount' ? parseFloat(b[sortBy]) : b[sortBy]
    return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
  })

  const filtered = sorted.filter(o => {
    const matchSearch = !search || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.customer_email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus==='All' || o.status===filterStatus
    const matchPayment = filterPayment==='All' || o.payment_status===filterPayment
    const matchDateFrom = !dateFrom || new Date(o.order_date) >= new Date(dateFrom)
    const matchDateTo = !dateTo || new Date(o.order_date) <= new Date(dateTo)
    return matchSearch && matchStatus && matchPayment && matchDateFrom && matchDateTo
  })

  // Advanced analytics
  const deliveredOrders = orders.filter(o => o.status === 'Delivered')
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled')
  const pendingOrders = orders.filter(o => o.status === 'Pending')
  const amounts = orders.map(o => parseFloat(o.total_amount)||0)
  const maxOrder = amounts.length ? Math.max(...amounts) : 0
  const minOrder = amounts.length ? Math.min(...amounts) : 0
  const avgOrder = amounts.length ? amounts.reduce((a,b)=>a+b,0)/amounts.length : 0
  const topOrder = orders.find(o => parseFloat(o.total_amount) === maxOrder)
  const totalValue = amounts.reduce((a,b)=>a+b,0)
  const paidRevenue = orders.filter(o=>o.payment_status==='Paid').reduce((s,o)=>s+parseFloat(o.total_amount||0),0)
  const unpaidValue = orders.filter(o=>o.payment_status==='Unpaid').reduce((s,o)=>s+parseFloat(o.total_amount||0),0)

  const exportCSV = () => {
    const headers = ['Order#','Customer','Email','Phone','Date','Amount','Status','Payment','Shipping']
    const rows = filtered.map(o => [o.order_number,o.customer_name,o.customer_email,o.customer_phone,o.order_date,o.total_amount,o.status,o.payment_status,o.shipping_address])
    const csv = [headers,...rows].map(r=>r.join(',')).join('\n')
    const a = document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv)
    a.download='orders.csv'; a.click()
  }

  const totalValue2 = items.reduce((s,i)=>s+(i.quantity*i.unit_price),0)
  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  const handleSort = (col) => { if(sortBy===col) setSortDir(d=>d==='asc'?'desc':'asc'); else { setSortBy(col); setSortDir('desc') } }
  const SortIcon = ({col}) => sortBy===col ? (sortDir==='asc'?<ChevronUp size={12}/>:<ChevronDown size={12}/>) : null

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>{toast.msg}</div>}

      {/* Header */}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Package size={24} style={{color:'#3b82f6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Order Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>{orders.length} total orders • Rs.{totalValue.toLocaleString()} total value</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:12}}><Download size={14}/> Export</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>setShowForm(true)} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> New Order</button>
        </div>
      </div>


      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>{[['orders','Orders'],['analytics','Analytics']].map(([id,label])=>(<button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #3b82f6':'2px solid transparent',background:'transparent',color:activeTab===id?'#3b82f6':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>))}</div>
      {activeTab==='analytics' && (<div style={{padding:24}}><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}><div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}><h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14}}>Revenue Trend</h3><ResponsiveContainer width='100%' height={250}><BarChart data={Object.values(orders.reduce((acc,o)=>{const m=new Date(o.order_date||Date.now()).toLocaleString('en',{month:'short'});if(!acc[m])acc[m]={name:m,revenue:0,count:0};acc[m].revenue+=parseFloat(o.total_amount||0);acc[m].count++;return acc},{})).slice(-6)}><CartesianGrid strokeDasharray='3 3' stroke='#334155'/><XAxis dataKey='name' tick={{fill:'#64748b',fontSize:11}}/><YAxis tick={{fill:'#64748b',fontSize:10}}/><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/><Bar dataKey='revenue' name='Revenue' fill='#3b82f6' radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div><div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}><h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14}}>Order Status</h3><ResponsiveContainer width='100%' height={250}><PieChart><Pie data={Object.entries(orders.reduce((acc,o)=>{acc[o.status]=(acc[o.status]||0)+1;return acc},{})).map(([name,value])=>({name,value}))} dataKey='value' nameKey='name' cx='50%' cy='50%' outerRadius={90}>{['#f59e0b','#3b82f6','#8b5cf6','#10b981','#ef4444'].map((c,i)=><Cell key={i} fill={c}/>)}</Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart></ResponsiveContainer></div><div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}><h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14}}>Top Customers</h3><div style={{display:'grid',gap:8}}>{Object.entries(orders.reduce((acc,o)=>{acc[o.customer_name]=(acc[o.customer_name]||0)+parseFloat(o.total_amount||0);return acc},{})).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name,val],i)=>(<div key={i} style={{display:'flex',justifyContent:'space-between',padding:'8px 10px',background:'#0f172a',borderRadius:6}}><span style={{color:'#94a3b8',fontSize:12}}>{name}</span><span style={{color:'#10b981',fontSize:12,fontWeight:600}}>Rs.{Number(val).toLocaleString()}</span></div>))}</div></div></div></div>)}
      {activeTab==='orders' && <div style={{padding:24}}>
        {/* Main Stats Row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
          {[
            {label:'Total Revenue', value:'Rs.'+totalValue.toLocaleString(), sub:`${orders.length} orders`, color:'#3b82f6'},
            {label:'Paid Revenue', value:'Rs.'+paidRevenue.toLocaleString(), sub:`${orders.filter(o=>o.payment_status==='Paid').length} paid`, color:'#10b981'},
            {label:'Outstanding', value:'Rs.'+unpaidValue.toLocaleString(), sub:`${orders.filter(o=>o.payment_status==='Unpaid').length} unpaid`, color:'#ef4444'},
            {label:'Avg Order Value', value:'Rs.'+avgOrder.toLocaleString(undefined,{maximumFractionDigits:0}), sub:'per order', color:'#f59e0b'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
              <div style={{fontSize:11,color:'#475569',marginTop:2}}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Order Analytics Row */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:16}}>
          {[
            {label:'Pending', value:pendingOrders.length, color:'#f59e0b', icon:'⏳'},
            {label:'Processing', value:orders.filter(o=>o.status==='Processing').length, color:'#3b82f6', icon:'⚙️'},
            {label:'Delivered', value:deliveredOrders.length, color:'#10b981', icon:'✅'},
            {label:'Cancelled', value:cancelledOrders.length, color:'#ef4444', icon:'❌'},
            {label:'Shipped', value:orders.filter(o=>o.status==='Shipped').length, color:'#8b5cf6', icon:'🚚'},
          ].map((s,i)=>(
            <div key={i} onClick={()=>setFilterStatus(s.label==='Pending'?'Pending':s.label==='Processing'?'Processing':s.label==='Delivered'?'Delivered':s.label==='Cancelled'?'Cancelled':'Shipped')} style={{background:'#1e293b',border:`1px solid ${filterStatus===s.label?s.color:'#334155'}`,borderRadius:10,padding:12,cursor:'pointer',textAlign:'center',transition:'all 0.2s'}}>
              <div style={{fontSize:20,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
              <div style={{fontSize:11,color:'#64748b'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Top/Min/Max Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding:14,borderLeft:'3px solid #10b981'}}>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>HIGHEST ORDER</div>
            <div style={{fontSize:18,fontWeight:700,color:'#10b981'}}>Rs.{maxOrder.toLocaleString()}</div>
            <div style={{fontSize:11,color:'#94a3b8'}}>{topOrder?.order_number} • {topOrder?.customer_name}</div>
          </div>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding:14,borderLeft:'3px solid #f59e0b'}}>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>LOWEST ORDER</div>
            <div style={{fontSize:18,fontWeight:700,color:'#f59e0b'}}>Rs.{minOrder.toLocaleString()}</div>
            <div style={{fontSize:11,color:'#94a3b8'}}>{orders.find(o=>parseFloat(o.total_amount)===minOrder)?.order_number}</div>
          </div>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding:14,borderLeft:'3px solid #ef4444'}}>
            <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>CANCELLED VALUE</div>
            <div style={{fontSize:18,fontWeight:700,color:'#ef4444'}}>Rs.{cancelledOrders.reduce((s,o)=>s+parseFloat(o.total_amount||0),0).toLocaleString()}</div>
            <div style={{fontSize:11,color:'#94a3b8'}}>{cancelledOrders.length} cancelled orders</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding:14,marginBottom:16}}>
          <div style={{display:'flex',gap:10,marginBottom:showFilters?12:0}}>
            <div style={{display:'flex',alignItems:'center',gap:8,background:'#0f172a',border:'1px solid #334155',borderRadius:8,padding:'8px 14px',flex:1}}>
              <Search size={14} style={{color:'#64748b'}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by order #, customer name or email..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              {search && <button onClick={()=>setSearch('')} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer'}}><X size={12}/></button>}
            </div>
            <button onClick={()=>setShowFilters(!showFilters)} style={{background:showFilters?'#3b82f620':'#0f172a',border:'1px solid '+(showFilters?'#3b82f6':'#334155'),borderRadius:8,color:showFilters?'#3b82f6':'#94a3b8',padding:'8px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:13}}><Filter size={14}/> Filters</button>
            {selectedOrders.length > 0 && (
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <span style={{color:'#64748b',fontSize:12}}>{selectedOrders.length} selected</span>
                {['Processing','Shipped','Delivered','Cancelled'].map(a=>(
                  <button key={a} onClick={()=>handleBulkAction(a)} style={{background:STATUS_COLOR[a]+'20',border:'none',borderRadius:6,color:STATUS_COLOR[a],padding:'6px 10px',cursor:'pointer',fontSize:11,fontWeight:600}}>{a}</button>
                ))}
              </div>
            )}
          </div>

          {showFilters && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,paddingTop:12,borderTop:'1px solid #334155'}}>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label>
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{...inputStyle,background:'#0f172a'}}>
                  <option>All</option>
                  {['Pending','Processing','Shipped','Delivered','Cancelled'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Payment</label>
                <select value={filterPayment} onChange={e=>setFilterPayment(e.target.value)} style={{...inputStyle,background:'#0f172a'}}>
                  <option>All</option>
                  {['Paid','Unpaid','Partial','Refunded'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Date From</label>
                <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} style={{...inputStyle,background:'#0f172a'}}/>
              </div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Date To</label>
                <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} style={{...inputStyle,background:'#0f172a'}}/>
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
          <div style={{padding:'10px 16px',borderBottom:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:13,color:'#94a3b8'}}>{filtered.length} orders{filtered.length !== orders.length ? ' (filtered)' : ''}</span>
            <button onClick={()=>{ setFilterStatus('All'); setFilterPayment('All'); setDateFrom(''); setDateTo(''); setSearch('') }} style={{background:'none',border:'none',color:'#64748b',cursor:'pointer',fontSize:12}}>Clear filters</button>
          </div>
          <div style={{overflowX:'auto'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#0f172a'}}>
                  <th style={{padding:'10px 16px',textAlign:'left',borderBottom:'1px solid #334155'}}>
                    <input type="checkbox" checked={selectedOrders.length===filtered.length&&filtered.length>0} onChange={toggleSelectAll} style={{cursor:'pointer'}}/>
                  </th>
                  {[['order_number','Order #'],['customer_name','Customer'],['order_date','Date'],['item_count','Items'],['total_amount','Amount'],['status','Status'],['payment_status','Payment'],['Actions','']].map(([col,label])=>(
                    <th key={col} onClick={col!=='Actions'?()=>handleSort(col):undefined} style={{color:'#64748b',fontSize:11,padding:'10px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155',cursor:col!=='Actions'?'pointer':'default',userSelect:'none',whiteSpace:'nowrap'}}>
                      <span style={{display:'flex',alignItems:'center',gap:4}}>{label}<SortIcon col={col}/></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{textAlign:'center',padding:40,color:'#64748b'}}>Loading orders...</td></tr>
                ) : filtered.length===0 ? (
                  <tr><td colSpan={9} style={{textAlign:'center',padding:40,color:'#64748b'}}>No orders found. Try adjusting filters.</td></tr>
                ) : filtered.map(o=>(
                  <tr key={o.order_id} style={{borderBottom:'1px solid #0f172a',background:selectedOrders.includes(o.order_id)?'#3b82f610':'transparent'}} onMouseEnter={e=>e.currentTarget.style.background=selectedOrders.includes(o.order_id)?'#3b82f615':'#0f172a'} onMouseLeave={e=>e.currentTarget.style.background=selectedOrders.includes(o.order_id)?'#3b82f610':'transparent'}>
                    <td style={{padding:'10px 16px'}}><input type="checkbox" checked={selectedOrders.includes(o.order_id)} onChange={()=>toggleSelectOrder(o.order_id)} style={{cursor:'pointer'}}/></td>
                    <td style={{padding:'10px 16px',color:'#3b82f6',fontSize:13,fontWeight:600,cursor:'pointer'}} onClick={()=>setSelectedOrder(o)}>{o.order_number}</td>
                    <td style={{padding:'10px 16px'}}>
                      <div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{o.customer_name}</div>
                      <div style={{color:'#64748b',fontSize:11}}>{o.customer_email}</div>
                    </td>
                    <td style={{padding:'10px 16px',color:'#64748b',fontSize:12,whiteSpace:'nowrap'}}>{new Date(o.order_date).toLocaleDateString('en-IN')}</td>
                    <td style={{padding:'10px 16px',color:'#94a3b8',fontSize:13,textAlign:'center'}}>{o.item_count||0}</td>
                    <td style={{padding:'10px 16px',color:'#f1f5f9',fontSize:13,fontWeight:600,whiteSpace:'nowrap'}}>Rs.{Number(o.total_amount).toLocaleString()}</td>
                    <td style={{padding:'10px 16px'}}>
                      <select value={o.status} onChange={e=>handleStatusUpdate(o.order_id, e.target.value, o.payment_status)} style={{background:STATUS_COLOR[o.status]+'20',border:`1px solid ${STATUS_COLOR[o.status]}40`,borderRadius:20,color:STATUS_COLOR[o.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                        {['Pending','Processing','Shipped','Delivered','Cancelled'].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{padding:'10px 16px'}}>
                      <select value={o.payment_status} onChange={e=>handleStatusUpdate(o.order_id, o.status, e.target.value)} style={{background:PAYMENT_COLOR[o.payment_status]+'20',border:`1px solid ${PAYMENT_COLOR[o.payment_status]}40`,borderRadius:20,color:PAYMENT_COLOR[o.payment_status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                        {['Unpaid','Partial','Paid','Refunded'].map(s=><option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{padding:'10px 16px'}}>
                      <button onClick={()=>setSelectedOrder(o)} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 10px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}><Eye size={12}/> View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      }

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'flex-end',justifyContent:'flex-end',padding:20}} onClick={()=>setSelectedOrder(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:0,width:480,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{background:'#0f172a',padding:'16px 20px',borderRadius:'16px 16px 0 0',display:'flex',justifyContent:'space-between',alignItems:'center',position:'sticky',top:0}}>
              <div>
                <div style={{color:'#3b82f6',fontWeight:700,fontSize:16}}>{selectedOrder.order_number}</div>
                <div style={{color:'#64748b',fontSize:11}}>{new Date(selectedOrder.order_date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
              </div>
              <button onClick={()=>setSelectedOrder(null)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'6px',cursor:'pointer'}}><X size={16}/></button>
            </div>

            <div style={{padding:20}}>
              {/* Status badges */}
              <div style={{display:'flex',gap:8,marginBottom:16}}>
                <span style={{background:STATUS_COLOR[selectedOrder.status]+'20',color:STATUS_COLOR[selectedOrder.status],padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600,border:`1px solid ${STATUS_COLOR[selectedOrder.status]}40`}}>{selectedOrder.status}</span>
                <span style={{background:PAYMENT_COLOR[selectedOrder.payment_status]+'20',color:PAYMENT_COLOR[selectedOrder.payment_status],padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600,border:`1px solid ${PAYMENT_COLOR[selectedOrder.payment_status]}40`}}>{selectedOrder.payment_status}</span>
              </div>

              {/* Quick Actions */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
                {selectedOrder.status === 'Pending' && <button onClick={()=>handleStatusUpdate(selectedOrder.order_id,'Processing',selectedOrder.payment_status)} style={{background:'#3b82f620',border:'none',borderRadius:8,color:'#3b82f6',padding:'8px',cursor:'pointer',fontSize:12,fontWeight:600}}>Process</button>}
                {selectedOrder.status === 'Processing' && <button onClick={()=>handleStatusUpdate(selectedOrder.order_id,'Shipped',selectedOrder.payment_status)} style={{background:'#8b5cf620',border:'none',borderRadius:8,color:'#8b5cf6',padding:'8px',cursor:'pointer',fontSize:12,fontWeight:600}}><Truck size={12}/> Ship</button>}
                {selectedOrder.status === 'Shipped' && <button onClick={()=>handleStatusUpdate(selectedOrder.order_id,'Delivered','Paid')} style={{background:'#10b98120',border:'none',borderRadius:8,color:'#10b981',padding:'8px',cursor:'pointer',fontSize:12,fontWeight:600}}><CheckCircle size={12}/> Deliver</button>}
                {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Delivered' && <button onClick={()=>handleStatusUpdate(selectedOrder.order_id,'Cancelled',selectedOrder.payment_status)} style={{background:'#ef444420',border:'none',borderRadius:8,color:'#ef4444',padding:'8px',cursor:'pointer',fontSize:12,fontWeight:600}}><XCircle size={12}/> Cancel</button>}
                {selectedOrder.payment_status !== 'Paid' && <button onClick={()=>handleStatusUpdate(selectedOrder.order_id,selectedOrder.status,'Paid')} style={{background:'#10b98120',border:'none',borderRadius:8,color:'#10b981',padding:'8px',cursor:'pointer',fontSize:12,fontWeight:600}}>Mark Paid</button>}
              </div>

              {/* Customer Info */}
              <div style={{background:'#0f172a',borderRadius:10,padding:14,marginBottom:14}}>
                <div style={{fontSize:11,color:'#3b82f6',marginBottom:8,fontWeight:600,textTransform:'uppercase'}}>Customer</div>
                <div style={{color:'#f1f5f9',fontWeight:600,marginBottom:4}}>{selectedOrder.customer_name}</div>
                <div style={{color:'#64748b',fontSize:12}}>{selectedOrder.customer_email}</div>
                <div style={{color:'#64748b',fontSize:12}}>{selectedOrder.customer_phone}</div>
              </div>

              {/* Shipping */}
              {selectedOrder.shipping_address && (
                <div style={{background:'#0f172a',borderRadius:10,padding:14,marginBottom:14}}>
                  <div style={{fontSize:11,color:'#8b5cf6',marginBottom:8,fontWeight:600,textTransform:'uppercase'}}>Shipping Address</div>
                  <div style={{color:'#94a3b8',fontSize:13}}>{selectedOrder.shipping_address}</div>
                </div>
              )}

              {/* Order Summary */}
              <div style={{background:'#0f172a',borderRadius:10,padding:14,marginBottom:14}}>
                <div style={{fontSize:11,color:'#10b981',marginBottom:10,fontWeight:600,textTransform:'uppercase'}}>Order Summary</div>
                {[
                  ['Subtotal', 'Rs.'+Number(selectedOrder.total_amount - (selectedOrder.tax_amount||0)).toLocaleString()],
                  ['Tax (18%)', 'Rs.'+Number(selectedOrder.tax_amount||0).toLocaleString()],
                  ['Discount', selectedOrder.discount > 0 ? '-Rs.'+Number(selectedOrder.discount).toLocaleString() : 'None'],
                  ['Payment Method', selectedOrder.payment_method||'N/A'],
                  ['Delivery Date', selectedOrder.delivery_date ? new Date(selectedOrder.delivery_date).toLocaleDateString('en-IN') : 'Not set'],
                ].map(([label,val])=>(
                  <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid #1e293b',fontSize:13}}>
                    <span style={{color:'#64748b'}}>{label}</span>
                    <span style={{color:'#f1f5f9'}}>{val}</span>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0 0',fontSize:15,fontWeight:700}}>
                  <span style={{color:'#94a3b8'}}>Total</span>
                  <span style={{color:'#10b981'}}>Rs.{Number(selectedOrder.total_amount).toLocaleString()}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div style={{background:'#f59e0b10',border:'1px solid #f59e0b30',borderRadius:10,padding:12}}>
                  <div style={{fontSize:11,color:'#f59e0b',marginBottom:4,fontWeight:600}}>NOTES</div>
                  <div style={{color:'#94a3b8',fontSize:13}}>{selectedOrder.notes}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:700,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0,fontSize:18}}>Create New Order</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              {[['customer_name','Customer Name *','text'],['customer_email','Email','email'],['customer_phone','Phone','tel'],['delivery_date','Delivery Date','date']].map(([key,label,type])=>(
                <div key={key}>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label>
                  <input type={type} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={inputStyle}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Payment Method</label>
                <select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})} style={inputStyle}>
                  {['Bank Transfer','NEFT','RTGS','UPI','Cheque','Cash','Credit Card','Credit'].map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div style={{gridColumn:'span 2'}}>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Shipping Address</label>
                <input value={form.shipping_address||''} onChange={e=>setForm({...form,shipping_address:e.target.value})} placeholder="Street, City, State, PIN" style={inputStyle}/>
              </div>
              <div style={{gridColumn:'span 2'}}>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label>
                <input value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} style={inputStyle}/>
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <h3 style={{color:'#f1f5f9',margin:0,fontSize:14}}>Order Items</h3>
                <button onClick={addItem} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'4px 12px',cursor:'pointer',fontSize:12}}>+ Add Item</button>
              </div>
              <div style={{background:'#0f172a',borderRadius:8,padding:10}}>
                <div style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr auto',gap:8,marginBottom:6}}>
                  {['Product Name','SKU','Qty','Unit Price',''].map(h=><div key={h} style={{fontSize:10,color:'#64748b',textTransform:'uppercase'}}>{h}</div>)}
                </div>
                {items.map((item,i)=>(
                  <div key={i} style={{display:'grid',gridTemplateColumns:'2.5fr 1fr 1fr 1fr auto',gap:8,marginBottom:6,alignItems:'center'}}>
                    <input placeholder="Product name" value={item.product_name} onChange={e=>updateItem(i,'product_name',e.target.value)} style={inputStyle}/>
                    <input placeholder="SKU001" value={item.sku} onChange={e=>updateItem(i,'sku',e.target.value)} style={inputStyle}/>
                    <input type="number" min="1" value={item.quantity} onChange={e=>updateItem(i,'quantity',parseInt(e.target.value)||1)} style={inputStyle}/>
                    <input type="number" min="0" value={item.unit_price} onChange={e=>updateItem(i,'unit_price',parseFloat(e.target.value)||0)} style={inputStyle}/>
                    <button onClick={()=>removeItem(i)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'8px',cursor:'pointer'}}><X size={12}/></button>
                  </div>
                ))}
                <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0 0',borderTop:'1px solid #334155',marginTop:4}}>
                  <span style={{color:'#64748b',fontSize:13}}>Subtotal</span>
                  <span style={{color:'#f1f5f9',fontWeight:600,fontSize:13}}>Rs.{totalValue2.toLocaleString()}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}>
                  <span style={{color:'#64748b',fontSize:13}}>Tax (18%)</span>
                  <span style={{color:'#94a3b8',fontSize:13}}>Rs.{(totalValue2*0.18).toLocaleString()}</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontWeight:700}}>
                  <span style={{color:'#f1f5f9',fontSize:14}}>Total</span>
                  <span style={{color:'#10b981',fontSize:15}}>Rs.{(totalValue2*1.18).toLocaleString(undefined,{maximumFractionDigits:0})}</span>
                </div>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600,fontSize:14}}>Create Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}