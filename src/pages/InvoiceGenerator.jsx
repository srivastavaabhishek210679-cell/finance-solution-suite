import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Download, Eye, Send, Trash2, RefreshCw, X, FileText, CheckCircle } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const API = 'https://finance-backend-so86.onrender.com/api/v1'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const STATUS_COLOR = { Draft:'#64748b', Sent:'#3b82f6', Paid:'#10b981', Overdue:'#ef4444', Cancelled:'#f59e0b' }

export default function InvoiceGenerator() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showFromOrder, setShowFromOrder] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({customer_name:'',customer_email:'',customer_phone:'',billing_address:'',due_date:'',notes:'',terms:'Payment due within 30 days'})
  const [items, setItems] = useState([{description:'',quantity:1,unit_price:0}])
  const [selectedOrderId, setSelectedOrderId] = useState('')

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  useEffect(()=>{ load() },[])

  const load = async () => {
    setLoading(true)
    try {
      const [invRes, ordRes] = await Promise.all([
        fetch(API+'/invoice-gen', {headers:getHeaders()}),
        fetch(API+'/orders', {headers:getHeaders()})
      ])
      const [invData, ordData] = await Promise.all([invRes.json(), ordRes.json()])
      setInvoices(invData.data||[])
      setOrders(ordData.data||[])
    } catch(e) { showToast('Failed to load','error') }
    setLoading(false)
  }

  const handleCreate = async () => {
    if(!form.customer_name) { showToast('Customer name required','error'); return }
    try {
      const res = await fetch(API+'/invoice-gen', {method:'POST',headers:getHeaders(),body:JSON.stringify({...form,items})})
      const data = await res.json()
      if(data.status==='success') { showToast('Invoice created!'); setShowForm(false); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleFromOrder = async () => {
    if(!selectedOrderId) { showToast('Select an order','error'); return }
    try {
      const res = await fetch(API+'/invoice-gen/from-order', {method:'POST',headers:getHeaders(),body:JSON.stringify({order_id:selectedOrderId})})
      const data = await res.json()
      if(data.status==='success') { showToast('Invoice generated from order!'); setShowFromOrder(false); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleStatusUpdate = async (id, status) => {
    await fetch(API+'/invoice-gen/'+id+'/status', {method:'PUT',headers:getHeaders(),body:JSON.stringify({status})})
    showToast('Status updated'); load()
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete this invoice?')) return
    await fetch(API+'/invoice-gen/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const handleViewInvoice = async (inv) => {
    const res = await fetch(API+'/invoice-gen/'+inv.invoice_id, {headers:getHeaders()})
    const data = await res.json()
    setSelectedInvoice(data.data)
  }

  const exportPDF = (inv) => {
    const doc = new jsPDF()
    const pw = doc.internal.pageSize.getWidth()
    doc.setFillColor(15,23,42)
    doc.rect(0,0,pw,40,'F')
    doc.setTextColor(16,185,129)
    doc.setFontSize(20)
    doc.setFont('helvetica','bold')
    doc.text('INVOICE', 14, 20)
    doc.setTextColor(241,245,249)
    doc.setFontSize(10)
    doc.text(inv.invoice_number, 14, 30)
    doc.setTextColor(100,116,139)
    doc.text('Date: '+new Date(inv.invoice_date).toLocaleDateString('en-IN'), pw-14, 20, {align:'right'})
    doc.text('Due: '+new Date(inv.due_date).toLocaleDateString('en-IN'), pw-14, 28, {align:'right'})
    doc.setTextColor(15,23,42)
    doc.setFontSize(11)
    doc.setFont('helvetica','bold')
    doc.text('Bill To:', 14, 55)
    doc.setFont('helvetica','normal')
    doc.setFontSize(10)
    doc.text(inv.customer_name||'', 14, 63)
    doc.text(inv.customer_email||'', 14, 70)
    doc.text(inv.billing_address||'', 14, 77)

    const tableItems = (inv.items||[]).map(i=>[i.description, i.quantity, 'Rs.'+Number(i.unit_price).toLocaleString(), 'Rs.'+Number(i.total_price).toLocaleString()])
    autoTable(doc, {
      startY: 90,
      head: [['Description','Qty','Unit Price','Total']],
      body: tableItems,
      theme: 'grid',
      headStyles: {fillColor:[16,185,129],textColor:[255,255,255]},
      styles: {fontSize:10}
    })

    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(10)
    doc.text('Subtotal: Rs.'+Number(inv.subtotal).toLocaleString(), pw-14, finalY, {align:'right'})
    doc.text('Tax ('+inv.tax_percent+'%): Rs.'+Number(inv.tax_amount).toLocaleString(), pw-14, finalY+8, {align:'right'})
    doc.setFont('helvetica','bold')
    doc.setFontSize(12)
    doc.text('Total: Rs.'+Number(inv.total_amount).toLocaleString(), pw-14, finalY+18, {align:'right'})

    if(inv.terms) {
      doc.setFont('helvetica','normal')
      doc.setFontSize(9)
      doc.setTextColor(100,116,139)
      doc.text('Terms: '+inv.terms, 14, finalY+30)
    }
    doc.save(inv.invoice_number+'.pdf')
  }

  const addItem = () => setItems([...items,{description:'',quantity:1,unit_price:0}])
  const removeItem = (i) => setItems(items.filter((_,idx)=>idx!==i))
  const updateItem = (i,f,v) => { const n=[...items]; n[i]={...n[i],[f]:v}; setItems(n) }
  const subtotal = items.reduce((s,i)=>s+(i.quantity*i.unit_price),0)

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <FileText size={24} style={{color:'#3b82f6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Invoice Generator</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Create and manage professional invoices</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={()=>setShowFromOrder(true)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 14px',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6}}><FileText size={14}/> From Order</button>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>setShowForm(true)} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> New Invoice</button>
        </div>
      </div>

      <div style={{padding:24}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Total Invoices', value:invoices.length, color:'#3b82f6'},
            {label:'Draft', value:invoices.filter(i=>i.status==='Draft').length, color:'#64748b'},
            {label:'Sent', value:invoices.filter(i=>i.status==='Sent').length, color:'#3b82f6'},
            {label:'Paid', value:invoices.filter(i=>i.status==='Paid').length, color:'#10b981'},
            {label:'Total Value', value:'Rs.'+invoices.reduce((s,i)=>s+parseFloat(i.total_amount||0),0).toLocaleString(), color:'#10b981'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Invoices Table */}
        <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#0f172a'}}>
                {['Invoice #','Customer','Date','Due Date','Amount','Status','Actions'].map(h=>(
                  <th key={h} style={{color:'#64748b',fontSize:11,padding:'12px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'#64748b'}}>Loading...</td></tr>
              : invoices.length===0 ? <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'#64748b'}}>No invoices yet. Create your first invoice!</td></tr>
              : invoices.map(inv=>(
                <tr key={inv.invoice_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px',color:'#3b82f6',fontWeight:600,fontSize:13}}>{inv.invoice_number}</td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{color:'#f1f5f9',fontSize:13}}>{inv.customer_name}</div>
                    <div style={{color:'#64748b',fontSize:11}}>{inv.customer_email}</div>
                  </td>
                  <td style={{padding:'12px 16px',color:'#64748b',fontSize:12}}>{new Date(inv.invoice_date).toLocaleDateString('en-IN')}</td>
                  <td style={{padding:'12px 16px',color:'#64748b',fontSize:12}}>{inv.due_date?new Date(inv.due_date).toLocaleDateString('en-IN'):'N/A'}</td>
                  <td style={{padding:'12px 16px',color:'#f1f5f9',fontWeight:600}}>Rs.{Number(inv.total_amount).toLocaleString()}</td>
                  <td style={{padding:'12px 16px'}}>
                    <select value={inv.status} onChange={e=>handleStatusUpdate(inv.invoice_id,e.target.value)} style={{background:STATUS_COLOR[inv.status]+'20',border:`1px solid ${STATUS_COLOR[inv.status]}40`,borderRadius:20,color:STATUS_COLOR[inv.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                      {['Draft','Sent','Paid','Overdue','Cancelled'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>handleViewInvoice(inv)} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}><Eye size={12}/> View</button>
                      <button onClick={()=>exportPDF(inv)} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'4px 8px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}><Download size={12}/> PDF</button>
                      <button onClick={()=>handleDelete(inv.invoice_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 8px',cursor:'pointer',fontSize:12}}><Trash2 size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {selectedInvoice && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelectedInvoice(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,width:'90%',maxWidth:700,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{background:'#0f172a',padding:'20px 24px',borderRadius:'16px 16px 0 0',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{color:'#3b82f6',fontWeight:700,fontSize:18}}>{selectedInvoice.invoice_number}</div>
                <div style={{color:'#64748b',fontSize:12}}>{new Date(selectedInvoice.invoice_date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>exportPDF(selectedInvoice)} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> PDF</button>
                <button onClick={()=>setSelectedInvoice(null)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px',cursor:'pointer'}}><X size={16}/></button>
              </div>
            </div>
            <div style={{padding:24}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
                <div style={{background:'#0f172a',borderRadius:10,padding:16}}>
                  <div style={{fontSize:11,color:'#3b82f6',marginBottom:8,fontWeight:600}}>BILL TO</div>
                  <div style={{color:'#f1f5f9',fontWeight:600}}>{selectedInvoice.customer_name}</div>
                  <div style={{color:'#64748b',fontSize:12}}>{selectedInvoice.customer_email}</div>
                  <div style={{color:'#64748b',fontSize:12}}>{selectedInvoice.customer_phone}</div>
                  <div style={{color:'#64748b',fontSize:12,marginTop:4}}>{selectedInvoice.billing_address}</div>
                </div>
                <div style={{background:'#0f172a',borderRadius:10,padding:16}}>
                  <div style={{fontSize:11,color:'#10b981',marginBottom:8,fontWeight:600}}>INVOICE DETAILS</div>
                  {[['Due Date', selectedInvoice.due_date?new Date(selectedInvoice.due_date).toLocaleDateString('en-IN'):'N/A'],
                    ['Status', selectedInvoice.status],['Tax Rate', selectedInvoice.tax_percent+'%']].map(([l,v])=>(
                    <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'4px 0',fontSize:13}}>
                      <span style={{color:'#64748b'}}>{l}</span><span style={{color:'#f1f5f9'}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <table style={{width:'100%',borderCollapse:'collapse',marginBottom:16}}>
                <thead>
                  <tr style={{background:'#0f172a'}}>
                    {['Description','Qty','Unit Price','Total'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 12px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {(selectedInvoice.items||[]).map((item,i)=>(
                    <tr key={i} style={{borderBottom:'1px solid #334155'}}>
                      <td style={{padding:'10px 12px',color:'#f1f5f9',fontSize:13}}>{item.description}</td>
                      <td style={{padding:'10px 12px',color:'#94a3b8',fontSize:13}}>{item.quantity}</td>
                      <td style={{padding:'10px 12px',color:'#94a3b8',fontSize:13}}>Rs.{Number(item.unit_price).toLocaleString()}</td>
                      <td style={{padding:'10px 12px',color:'#f1f5f9',fontWeight:600,fontSize:13}}>Rs.{Number(item.total_price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{display:'flex',justifyContent:'flex-end'}}>
                <div style={{width:250}}>
                  {[['Subtotal','Rs.'+Number(selectedInvoice.subtotal).toLocaleString()],
                    ['Tax ('+selectedInvoice.tax_percent+'%)','Rs.'+Number(selectedInvoice.tax_amount).toLocaleString()],
                    ['Discount',selectedInvoice.discount>0?'-Rs.'+Number(selectedInvoice.discount).toLocaleString():'None']].map(([l,v])=>(
                    <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #334155',fontSize:13}}>
                      <span style={{color:'#64748b'}}>{l}</span><span style={{color:'#94a3b8'}}>{v}</span>
                    </div>
                  ))}
                  <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',fontSize:16,fontWeight:700}}>
                    <span style={{color:'#f1f5f9'}}>Total</span>
                    <span style={{color:'#10b981'}}>Rs.{Number(selectedInvoice.total_amount).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              {selectedInvoice.terms && <div style={{background:'#0f172a',borderRadius:8,padding:12,marginTop:12,fontSize:12,color:'#64748b'}}>{selectedInvoice.terms}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:680,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>Create Invoice</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              {[['customer_name','Customer Name *'],['customer_email','Email'],['customer_phone','Phone'],['due_date','Due Date']].map(([k,l])=>(
                <div key={k}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{l}</label>
                <input type={k==='due_date'?'date':'text'} value={form[k]||''} onChange={e=>setForm({...form,[k]:e.target.value})} style={inputStyle}/></div>
              ))}
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Billing Address</label><input value={form.billing_address||''} onChange={e=>setForm({...form,billing_address:e.target.value})} style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Terms</label><input value={form.terms||''} onChange={e=>setForm({...form,terms:e.target.value})} style={inputStyle}/></div>
            </div>

            <h3 style={{color:'#f1f5f9',fontSize:14,margin:'0 0 10px'}}>Line Items</h3>
            {items.map((item,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'2.5fr 0.8fr 1fr auto',gap:8,marginBottom:8,alignItems:'center'}}>
                <input placeholder="Description" value={item.description} onChange={e=>updateItem(i,'description',e.target.value)} style={inputStyle}/>
                <input type="number" placeholder="Qty" value={item.quantity} onChange={e=>updateItem(i,'quantity',parseInt(e.target.value)||1)} style={inputStyle}/>
                <input type="number" placeholder="Unit Price" value={item.unit_price} onChange={e=>updateItem(i,'unit_price',parseFloat(e.target.value)||0)} style={inputStyle}/>
                <button onClick={()=>removeItem(i)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'8px',cursor:'pointer'}}><X size={14}/></button>
              </div>
            ))}
            <button onClick={addItem} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'6px 14px',cursor:'pointer',fontSize:12,marginBottom:16}}>+ Add Item</button>
            <div style={{background:'#0f172a',borderRadius:8,padding:12,marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}><span style={{color:'#64748b'}}>Subtotal</span><span style={{color:'#f1f5f9'}}>Rs.{subtotal.toLocaleString()}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}><span style={{color:'#64748b'}}>Tax (18%)</span><span style={{color:'#94a3b8'}}>Rs.{(subtotal*0.18).toLocaleString()}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:15,fontWeight:700}}><span style={{color:'#f1f5f9'}}>Total</span><span style={{color:'#10b981'}}>Rs.{(subtotal*1.18).toLocaleString(undefined,{maximumFractionDigits:0})}</span></div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {/* From Order Modal */}
      {showFromOrder && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowFromOrder(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:480}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#f1f5f9',margin:'0 0 20px'}}>Generate Invoice from Order</h2>
            <select value={selectedOrderId} onChange={e=>setSelectedOrderId(e.target.value)} style={{...inputStyle,marginBottom:16}}>
              <option value="">Select an order...</option>
              {orders.map(o=><option key={o.order_id} value={o.order_id}>{o.order_number} - {o.customer_name} (Rs.{Number(o.total_amount).toLocaleString()})</option>)}
            </select>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowFromOrder(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleFromOrder} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Generate Invoice</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}