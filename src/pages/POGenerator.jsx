import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Download, Eye, Trash2, RefreshCw, X, Truck } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const API = 'https://finance-backend-so86.onrender.com/api/v1'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const STATUS_COLOR = { Draft:'#64748b', Approved:'#3b82f6', Sent:'#8b5cf6', Received:'#10b981', Cancelled:'#ef4444' }

export default function POGenerator() {
  const navigate = useNavigate()
  const [pos, setPOs] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedPO, setSelectedPO] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({supplier_id:'',delivery_address:'',expected_delivery:'',notes:'',terms:'Standard payment terms apply'})
  const [items, setItems] = useState([{description:'',quantity:1,unit_price:0}])

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }
  useEffect(()=>{ load() },[])

  const load = async () => {
    setLoading(true)
    try {
      const [pRes, sRes] = await Promise.all([
        fetch(API+'/po-gen', {headers:getHeaders()}),
        fetch(API+'/supply/suppliers', {headers:getHeaders()})
      ])
      const [pData, sData] = await Promise.all([pRes.json(), sRes.json()])
      setPOs(pData.data||[])
      setSuppliers(sData.data||[])
    } catch(e) { showToast('Failed','error') }
    setLoading(false)
  }

  const handleCreate = async () => {
    try {
      const res = await fetch(API+'/po-gen', {method:'POST',headers:getHeaders(),body:JSON.stringify({...form,items})})
      const data = await res.json()
      if(data.status==='success') { showToast('PO created!'); setShowForm(false); load() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleStatus = async (id, status) => {
    await fetch(API+'/po-gen/'+id+'/status', {method:'PUT',headers:getHeaders(),body:JSON.stringify({status})})
    showToast('Updated'); load()
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete this PO?')) return
    await fetch(API+'/po-gen/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load()
  }

  const handleView = async (po) => {
    const res = await fetch(API+'/po-gen/'+po.po_id, {headers:getHeaders()})
    const data = await res.json()
    setSelectedPO(data.data)
  }

  const exportPDF = (po) => {
    const doc = new jsPDF()
    const pw = doc.internal.pageSize.getWidth()
    doc.setFillColor(15,23,42); doc.rect(0,0,pw,40,'F')
    doc.setTextColor(20,184,166); doc.setFontSize(20); doc.setFont('helvetica','bold')
    doc.text('PURCHASE ORDER', 14, 20)
    doc.setTextColor(241,245,249); doc.setFontSize(10)
    doc.text(po.po_number, 14, 30)
    doc.setTextColor(100,116,139)
    doc.text('Date: '+new Date(po.order_date).toLocaleDateString('en-IN'), pw-14, 20, {align:'right'})
    doc.setTextColor(15,23,42); doc.setFontSize(11); doc.setFont('helvetica','bold')
    doc.text('Supplier:', 14, 55)
    doc.setFont('helvetica','normal'); doc.setFontSize(10)
    doc.text(po.supplier_name||'', 14, 63)
    if(po.delivery_address) doc.text('Deliver to: '+po.delivery_address, 14, 71)
    const tableItems = (po.items||[]).map(i=>[i.description,i.quantity,'Rs.'+Number(i.unit_price).toLocaleString(),'Rs.'+Number(i.total_price).toLocaleString()])
    autoTable(doc, { startY:85, head:[['Description','Qty','Unit Price','Total']], body:tableItems, theme:'grid', headStyles:{fillColor:[20,184,166],textColor:[255,255,255]} })
    const y = doc.lastAutoTable.finalY+10
    doc.text('Subtotal: Rs.'+Number(po.subtotal).toLocaleString(), pw-14, y, {align:'right'})
    doc.text('Tax: Rs.'+Number(po.tax_amount).toLocaleString(), pw-14, y+8, {align:'right'})
    doc.setFont('helvetica','bold'); doc.setFontSize(12)
    doc.text('Total: Rs.'+Number(po.total_amount).toLocaleString(), pw-14, y+18, {align:'right'})
    doc.save(po.po_number+'.pdf')
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
        <Truck size={24} style={{color:'#14b8a6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Purchase Order Generator</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Create and manage purchase orders</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={load} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>setShowForm(true)} style={{background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> New PO</button>
        </div>
      </div>
      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Total POs', value:pos.length, color:'#14b8a6'},
            {label:'Draft', value:pos.filter(p=>p.status==='Draft').length, color:'#64748b'},
            {label:'Approved', value:pos.filter(p=>p.status==='Approved').length, color:'#3b82f6'},
            {label:'Total Value', value:'Rs.'+pos.reduce((s,p)=>s+parseFloat(p.total_amount||0),0).toLocaleString(), color:'#10b981'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>
        <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#0f172a'}}>
              {['PO Number','Supplier','Order Date','Expected','Amount','Status','Actions'].map(h=>(
                <th key={h} style={{color:'#64748b',fontSize:11,padding:'12px 16px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155'}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'#64748b'}}>Loading...</td></tr>
              : pos.length===0 ? <tr><td colSpan={7} style={{textAlign:'center',padding:40,color:'#64748b'}}>No purchase orders yet.</td></tr>
              : pos.map(po=>(
                <tr key={po.po_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'12px 16px',color:'#14b8a6',fontWeight:600,fontSize:13}}>{po.po_number}</td>
                  <td style={{padding:'12px 16px',color:'#f1f5f9',fontSize:13}}>{po.supplier_name||po.sup_name||'N/A'}</td>
                  <td style={{padding:'12px 16px',color:'#64748b',fontSize:12}}>{new Date(po.order_date).toLocaleDateString('en-IN')}</td>
                  <td style={{padding:'12px 16px',color:'#64748b',fontSize:12}}>{po.expected_delivery?new Date(po.expected_delivery).toLocaleDateString('en-IN'):'N/A'}</td>
                  <td style={{padding:'12px 16px',color:'#f1f5f9',fontWeight:600}}>Rs.{Number(po.total_amount).toLocaleString()}</td>
                  <td style={{padding:'12px 16px'}}>
                    <select value={po.status} onChange={e=>handleStatus(po.po_id,e.target.value)} style={{background:STATUS_COLOR[po.status]+'20',border:`1px solid ${STATUS_COLOR[po.status]}40`,borderRadius:20,color:STATUS_COLOR[po.status],padding:'3px 8px',fontSize:11,cursor:'pointer',fontWeight:600}}>
                      {['Draft','Approved','Sent','Received','Cancelled'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{padding:'12px 16px'}}>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>handleView(po)} style={{background:'#14b8a620',border:'none',borderRadius:6,color:'#14b8a6',padding:'4px 8px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}><Eye size={12}/> View</button>
                      <button onClick={()=>exportPDF(po)} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'4px 8px',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}><Download size={12}/> PDF</button>
                      <button onClick={()=>handleDelete(po.po_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 8px',cursor:'pointer',fontSize:12}}><Trash2 size={12}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:660,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>Create Purchase Order</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Supplier</label>
                <select value={form.supplier_id} onChange={e=>setForm({...form,supplier_id:e.target.value})} style={inputStyle}>
                  <option value="">Select supplier...</option>
                  {suppliers.map(s=><option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
                </select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Expected Delivery</label><input type="date" value={form.expected_delivery} onChange={e=>setForm({...form,expected_delivery:e.target.value})} style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Delivery Address</label><input value={form.delivery_address} onChange={e=>setForm({...form,delivery_address:e.target.value})} style={inputStyle}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Terms</label><input value={form.terms} onChange={e=>setForm({...form,terms:e.target.value})} style={inputStyle}/></div>
            </div>
            <h3 style={{color:'#f1f5f9',fontSize:14,margin:'0 0 10px'}}>Items</h3>
            {items.map((item,i)=>(
              <div key={i} style={{display:'grid',gridTemplateColumns:'2.5fr 0.8fr 1fr auto',gap:8,marginBottom:8,alignItems:'center'}}>
                <input placeholder="Description" value={item.description} onChange={e=>updateItem(i,'description',e.target.value)} style={inputStyle}/>
                <input type="number" value={item.quantity} onChange={e=>updateItem(i,'quantity',parseInt(e.target.value)||1)} style={inputStyle}/>
                <input type="number" value={item.unit_price} onChange={e=>updateItem(i,'unit_price',parseFloat(e.target.value)||0)} style={inputStyle}/>
                <button onClick={()=>removeItem(i)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'8px',cursor:'pointer'}}><X size={14}/></button>
              </div>
            ))}
            <button onClick={addItem} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'6px 14px',cursor:'pointer',fontSize:12,marginBottom:16}}>+ Add Item</button>
            <div style={{background:'#0f172a',borderRadius:8,padding:12,marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}><span style={{color:'#64748b'}}>Subtotal</span><span style={{color:'#f1f5f9'}}>Rs.{subtotal.toLocaleString()}</span></div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:15,fontWeight:700}}><span style={{color:'#f1f5f9'}}>Total (with 18% tax)</span><span style={{color:'#14b8a6'}}>Rs.{(subtotal*1.18).toLocaleString(undefined,{maximumFractionDigits:0})}</span></div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create PO</button>
            </div>
          </div>
        </div>
      )}

      {selectedPO && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelectedPO(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:600,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <div><div style={{color:'#14b8a6',fontWeight:700,fontSize:18}}>{selectedPO.po_number}</div><div style={{color:'#64748b',fontSize:12}}>Supplier: {selectedPO.supplier_name}</div></div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>exportPDF(selectedPO)} style={{background:'#14b8a6',border:'none',borderRadius:8,color:'#fff',padding:'8px 14px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Download size={14}/> PDF</button>
                <button onClick={()=>setSelectedPO(null)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px',cursor:'pointer'}}><X size={16}/></button>
              </div>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse',marginBottom:16}}>
              <thead><tr style={{background:'#0f172a'}}>
                {['Description','Qty','Unit Price','Total'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 12px',textAlign:'left'}}>{h}</th>)}
              </tr></thead>
              <tbody>
                {(selectedPO.items||[]).map((item,i)=>(
                  <tr key={i} style={{borderBottom:'1px solid #334155'}}>
                    <td style={{padding:'10px 12px',color:'#f1f5f9',fontSize:13}}>{item.description}</td>
                    <td style={{padding:'10px 12px',color:'#94a3b8',fontSize:13}}>{item.quantity}</td>
                    <td style={{padding:'10px 12px',color:'#94a3b8',fontSize:13}}>Rs.{Number(item.unit_price).toLocaleString()}</td>
                    <td style={{padding:'10px 12px',color:'#f1f5f9',fontWeight:600,fontSize:13}}>Rs.{Number(item.total_price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:16,fontWeight:700,color:'#14b8a6'}}>Total: Rs.{Number(selectedPO.total_amount).toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}