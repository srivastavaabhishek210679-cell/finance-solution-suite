import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, ArrowLeft, Plus, X, CheckCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/invoices'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const STATUS_COLOR = { Paid:'#10b981', Pending:'#f59e0b', Overdue:'#ef4444', Cancelled:'#64748b' }
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']

export default function InvoiceManagement() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState([])
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('All')
  const [filterType, setFilterType] = useState('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showPayForm, setShowPayForm] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({invoice_number:'',invoice_type:'Receivable',party_name:'',party_email:'',department:'Finance',amount:0,tax_amount:0,total_amount:0,issue_date:'',due_date:'',notes:''})
  const [payForm, setPayForm] = useState({status:'Paid',payment_method:'Bank Transfer',payment_date:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [iRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [i, s] = await Promise.all([iRes.json(), sRes.json()])
      setInvoices(i.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleCreate = async () => {
    const total = Number(form.amount) + Number(form.tax_amount)
    const res = await fetch(API, {method:'POST', headers:getHeaders(), body:JSON.stringify({...form, total_amount:total})})
    const data = await res.json()
    if(data.status==='success') { showToast('Invoice created!'); setShowForm(false); load() }
    else showToast(data.message,'error')
  }

  const handlePay = async () => {
    const res = await fetch(API+'/'+selectedInvoice.invoice_id+'/status', {method:'PUT', headers:getHeaders(), body:JSON.stringify(payForm)})
    const data = await res.json()
    if(data.status==='success') { showToast('Payment recorded!'); setShowPayForm(false); load() }
    else showToast(data.message,'error')
  }

  const filtered = invoices.filter(i =>
    (i.party_name+i.invoice_number+i.department).toLowerCase().includes(search.toLowerCase()) &&
    (filter==='All' || i.status===filter) &&
    (filterType==='All' || i.invoice_type===filterType)
  )

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',color:'#0f172a',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#ffffff',borderBottom:'1px solid #e2e8f0',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <FileText size={28} style={{color:'#3b82f6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Accounts Payable / Receivable</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage invoices, payments and outstanding balances</p></div>
        <button onClick={()=>setShowForm(true)} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> New Invoice</button>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Receivable', value:'₹'+Number(stats.receivable?.total||0).toLocaleString(), sub:stats.receivable?.count+' invoices', color:'#10b981', icon:TrendingUp},
              {label:'Total Payable', value:'₹'+Number(stats.payable?.total||0).toLocaleString(), sub:stats.payable?.count+' invoices', color:'#ef4444', icon:TrendingDown},
              {label:'Pending Amount', value:'₹'+Number(stats.pending?.total||0).toLocaleString(), sub:stats.pending?.count+' invoices', color:'#f59e0b', icon:FileText},
              {label:'Overdue', value:stats.overdue+' invoices', sub:'Immediate action needed', color:'#ef4444', icon:AlertTriangle},
            ].map((s,i)=>{ const Icon=s.icon; return (
              <div key={i} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:12,color:'#64748b'}}>{s.label}</span><Icon size={18} style={{color:s.color}}/></div>
                <div style={{fontSize:20,fontWeight:700,color:s.color,marginBottom:4}}>{s.value}</div>
                <div style={{fontSize:11,color:'#64748b'}}>{s.sub}</div>
              </div>
            )})}
          </div>
        )}

        <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search invoices..." style={{flex:1,minWidth:180,background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'10px 14px',fontSize:13}}/>
          <div style={{display:'flex',gap:4,background:'#ffffff',padding:4,borderRadius:8}}>
            {['All','Receivable','Payable'].map(t=>(
              <button key={t} onClick={()=>setFilterType(t)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:filterType===t?'#3b82f6':'transparent',color:filterType===t?'#fff':'#64748b',cursor:'pointer',fontSize:12}}>{t}</button>
            ))}
          </div>
          <div style={{display:'flex',gap:4,background:'#ffffff',padding:4,borderRadius:8}}>
            {['All','Pending','Paid','Overdue'].map(s=>(
              <button key={s} onClick={()=>setFilter(s)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:filter===s?'#3b82f6':'transparent',color:filter===s?'#fff':'#64748b',cursor:'pointer',fontSize:12}}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:'1px solid #e2e8f0'}}>{['Invoice #','Type','Party','Department','Amount','Tax','Total','Due Date','Status','Action'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(inv=>(
                <tr key={inv.invoice_id} style={{borderBottom:'1px solid #f1f5f9'}}>
                  <td style={{padding:'10px 8px',color:'#3b82f6',fontWeight:600,fontSize:12}}>{inv.invoice_number}</td>
                  <td style={{padding:'10px 8px'}}><span style={{background:inv.invoice_type==='Receivable'?'#10b98120':'#ef444420',color:inv.invoice_type==='Receivable'?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11}}>{inv.invoice_type}</span></td>
                  <td style={{padding:'10px 8px'}}>
                    <div style={{color:'#0f172a',fontWeight:600,fontSize:13}}>{inv.party_name}</div>
                    <div style={{color:'#64748b',fontSize:11}}>{inv.party_email}</div>
                  </td>
                  <td style={{padding:'10px 8px',color:'#475569',fontSize:12}}>{inv.department}</td>
                  <td style={{padding:'10px 8px',color:'#475569'}}>₹{Number(inv.amount).toLocaleString()}</td>
                  <td style={{padding:'10px 8px',color:'#64748b',fontSize:12}}>₹{Number(inv.tax_amount).toLocaleString()}</td>
                  <td style={{padding:'10px 8px',color:'#0f172a',fontWeight:700}}>₹{Number(inv.total_amount).toLocaleString()}</td>
                  <td style={{padding:'10px 8px',color:inv.status==='Overdue'?'#ef4444':'#475569',fontSize:12}}>{inv.due_date?.slice(0,10)}</td>
                  <td style={{padding:'10px 8px'}}><span style={{background:STATUS_COLOR[inv.status]+'20',color:STATUS_COLOR[inv.status],padding:'2px 8px',borderRadius:20,fontSize:11}}>{inv.status}</span></td>
                  <td style={{padding:'10px 8px'}}>
                    {inv.status==='Pending' && <button onClick={()=>{setSelectedInvoice(inv);setPayForm({status:'Paid',payment_method:'Bank Transfer',payment_date:new Date().toISOString().slice(0,10)});setShowPayForm(true)}} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'4px 10px',cursor:'pointer',fontSize:12}}>Mark Paid</button>}
                    {inv.status==='Overdue' && <button onClick={()=>{setSelectedInvoice(inv);setPayForm({status:'Paid',payment_method:'Bank Transfer',payment_date:new Date().toISOString().slice(0,10)});setShowPayForm(true)}} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 10px',cursor:'pointer',fontSize:12}}>Settle</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24,width:560}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#0f172a',margin:0}}>New Invoice</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['invoice_number','Invoice #'],['party_name','Party Name'],['party_email','Party Email'],['amount','Amount','number'],['tax_amount','Tax Amount','number'],['issue_date','Issue Date','date'],['due_date','Due Date','date']].map(([key,label,type='text'])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Type</label><select value={form.invoice_type} onChange={e=>setForm({...form,invoice_type:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{['Receivable','Payable'].map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><textarea value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create Invoice</button>
            </div>
          </div>
        </div>
      )}

      {showPayForm && selectedInvoice && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowPayForm(false)}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24,width:400}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#0f172a',margin:0}}>Record Payment</h2><button onClick={()=>setShowPayForm(false)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{background:'#f8fafc',borderRadius:8,padding:12,marginBottom:16}}>
              <div style={{color:'#0f172a',fontWeight:600}}>{selectedInvoice.invoice_number}</div>
              <div style={{color:'#64748b',fontSize:12}}>{selectedInvoice.party_name}</div>
              <div style={{color:'#10b981',fontWeight:700,fontSize:18,marginTop:4}}>₹{Number(selectedInvoice.total_amount).toLocaleString()}</div>
            </div>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Payment Method</label><select value={payForm.payment_method} onChange={e=>setPayForm({...payForm,payment_method:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13}}>{['Bank Transfer','Cheque','Cash','UPI','Credit Card'].map(m=><option key={m}>{m}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Payment Date</label><input type="date" value={payForm.payment_date} onChange={e=>setPayForm({...payForm,payment_date:e.target.value})} style={{width:'100%',background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:8,color:'#0f172a',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowPayForm(false)} style={{flex:1,background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handlePay} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Record Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
