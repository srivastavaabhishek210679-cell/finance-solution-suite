import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard, ArrowLeft, Plus, X, CheckCircle, XCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/expense-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['Travel','Meals','Software','Hardware','Training','Marketing','Maintenance','Supplies','Entertainment','Other']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const PAYMENT_METHODS = ['Credit Card','Debit Card','Bank Transfer','Petty Cash','Cheque']
const STATUS_COLOR = { Approved:'#10b981', Pending:'#f59e0b', Rejected:'#ef4444' }

export default function ExpenseManagement() {
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterCat, setFilterCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({title:'',category:'Travel',department:'Finance',amount:0,expense_date:'',submitted_by:'',payment_method:'Credit Card',notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [eRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [e, s] = await Promise.all([eRes.json(), sRes.json()])
      setExpenses(e.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleCreate = async () => {
    const res = await fetch(API, {method:'POST', headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast('Expense submitted!'); setShowForm(false); load() }
    else showToast(data.message,'error')
  }

  const handleUpdateStatus = async (id, status) => {
    await fetch(API+'/'+id+'/status', {method:'PUT', headers:getHeaders(), body:JSON.stringify({status, approved_by:'Admin'})})
    showToast('Status updated!'); load()
  }

  const filtered = expenses.filter(e =>
    (e.title+e.category+e.submitted_by).toLowerCase().includes(search.toLowerCase()) &&
    (filterStatus==='All' || e.status===filterStatus) &&
    (filterCat==='All' || e.category===filterCat)
  )

  return (
    <div style={{minHeight:'100vh',background:'#f1f5f9',color:'#1e293b',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <CreditCard size={28} style={{color:'#f59e0b'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Expense Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Submit, track and approve business expenses</p></div>
        <button onClick={()=>setShowForm(true)} style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Submit Expense</button>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Expenses', value:stats.total, color:'#3b82f6'},
              {label:'Total Amount', value:'₹'+Number(stats.totalAmount||0).toLocaleString(), color:'#f59e0b'},
              {label:'Pending Approval', value:stats.pending+' (₹'+Number(stats.pendingAmount||0).toLocaleString()+')', color:'#f59e0b'},
              {label:'Approved Amount', value:'₹'+Number(stats.approvedAmount||0).toLocaleString(), color:'#10b981'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:i===2?14:20,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {stats?.byCategory?.length > 0 && (
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,marginBottom:20}}>
            <h3 style={{color:'#1e293b',marginBottom:16,fontSize:14}}>Expenses by Category</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.byCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                <XAxis dataKey="category" tick={{fill:'#64748b',fontSize:10}}/>
                <YAxis tick={{fill:'#64748b',fontSize:10}} tickFormatter={v=>'₹'+Number(v/1000).toFixed(0)+'K'}/>
                <Tooltip contentStyle={{background:'#ffffff',border:'1px solid #e2e8f0'}} formatter={v=>['₹'+Number(v).toLocaleString(),'']}/>
                <Bar dataKey="total" fill="#f59e0b" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search expenses..." style={{flex:1,minWidth:180,background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'10px 14px',fontSize:13}}/>
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13}}>
            <option value="All">All Categories</option>
            {CATEGORIES.map(c=><option key={c}>{c}</option>)}
          </select>
          <div style={{display:'flex',gap:4,background:'#ffffff',padding:4,borderRadius:8}}>
            {['All','Pending','Approved','Rejected'].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:filterStatus===s?'#f59e0b':'transparent',color:filterStatus===s?'#fff':'#64748b',cursor:'pointer',fontSize:12}}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{borderBottom:'1px solid #e2e8f0'}}>{['Date','Title','Category','Department','Amount','Submitted By','Payment','Status','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(e=>(
                <tr key={e.expense_id} style={{borderBottom:'1px solid #f1f5f9'}}>
                  <td style={{padding:'10px 8px',color:'#475569',fontSize:12}}>{e.expense_date?.slice(0,10)}</td>
                  <td style={{padding:'10px 8px',color:'#1e293b',fontWeight:600,fontSize:13}}>{e.title}</td>
                  <td style={{padding:'10px 8px',color:'#475569',fontSize:12}}>{e.category}</td>
                  <td style={{padding:'10px 8px',color:'#475569',fontSize:12}}>{e.department}</td>
                  <td style={{padding:'10px 8px',color:'#f59e0b',fontWeight:700,fontSize:14}}>₹{Number(e.amount).toLocaleString()}</td>
                  <td style={{padding:'10px 8px',color:'#475569',fontSize:12}}>{e.submitted_by}</td>
                  <td style={{padding:'10px 8px',color:'#64748b',fontSize:11}}>{e.payment_method}</td>
                  <td style={{padding:'10px 8px'}}>
                    <span style={{background:STATUS_COLOR[e.status]+'20',color:STATUS_COLOR[e.status],padding:'2px 8px',borderRadius:20,fontSize:11}}>{e.status}</span>
                  </td>
                  <td style={{padding:'10px 8px'}}>
                    {e.status==='Pending' && (
                      <div style={{display:'flex',gap:4}}>
                        <button onClick={()=>handleUpdateStatus(e.expense_id,'Approved')} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'4px 8px',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',gap:2}}><CheckCircle size={10}/> Approve</button>
                        <button onClick={()=>handleUpdateStatus(e.expense_id,'Rejected')} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 8px',cursor:'pointer',fontSize:11,display:'flex',alignItems:'center',gap:2}}><XCircle size={10}/> Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24,width:520}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#1e293b',margin:0}}>Submit Expense</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['title','Title'],['submitted_by','Submitted By'],['amount','Amount','number'],['expense_date','Expense Date','date']].map(([key,label,type='text'])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13}}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Payment Method</label><select value={form.payment_method} onChange={e=>setForm({...form,payment_method:e.target.value})} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13}}>{PAYMENT_METHODS.map(p=><option key={p}>{p}</option>)}</select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><textarea value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} rows={2} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Submit Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
