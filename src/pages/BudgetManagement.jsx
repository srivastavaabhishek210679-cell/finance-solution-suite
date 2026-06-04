import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DollarSign, ArrowLeft, Plus, TrendingUp, TrendingDown, AlertCircle, X } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/budget-mgmt'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const COLORS = ['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ef4444','#14b8a6']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']

export default function BudgetManagement() {
  const navigate = useNavigate()
  const [budgets, setBudgets] = useState([])
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [tab, setTab] = useState('overview')
  const [showForm, setShowForm] = useState(false)
  const [showTxForm, setShowTxForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({department:'Finance',fiscal_year:2026,fiscal_quarter:'Q1',category:'Operations',allocated_amount:0})
  const [txForm, setTxForm] = useState({description:'',amount:0,transaction_type:'Expense',created_by:'Admin'})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [bRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [b, s] = await Promise.all([bRes.json(), sRes.json()])
      setBudgets(b.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  const loadTransactions = async (budget) => {
    setSelectedBudget(budget)
    setTab('transactions')
    const res = await fetch(API+'/'+budget.budget_id+'/transactions', {headers:getHeaders()})
    const data = await res.json()
    setTransactions(data.data||[])
  }

  useEffect(()=>{ load() },[])

  const handleCreate = async () => {
    const res = await fetch(API, {method:'POST', headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast('Budget created!'); setShowForm(false); load() }
    else showToast(data.message,'error')
  }

  const handleAddTx = async () => {
    const res = await fetch(API+'/transactions', {method:'POST', headers:getHeaders(), body:JSON.stringify({...txForm, budget_id:selectedBudget.budget_id})})
    const data = await res.json()
    if(data.status==='success') { showToast('Transaction added!'); setShowTxForm(false); loadTransactions(selectedBudget) }
    else showToast(data.message,'error')
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>tab==='transactions'?setTab('overview'):navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> {tab==='transactions'?'Back':'Dashboard'}</button>
        <DollarSign size={28} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Budget Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track budgets, spending and variance</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          {tab==='transactions' && <button onClick={()=>setShowTxForm(true)} style={{display:'flex',alignItems:'center',gap:6,background:'#ef4444',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Expense</button>}
          <button onClick={()=>setShowForm(true)} style={{display:'flex',alignItems:'center',gap:6,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> New Budget</button>
        </div>
      </div>

      <div style={{padding:24}}>
        {tab==='overview' && stats && (
          <div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
              {[
                {label:'Total Budget', value:'₹'+Number(stats.total_budget||0).toLocaleString(), color:'#3b82f6', icon:DollarSign},
                {label:'Total Spent', value:'₹'+Number(stats.total_spent||0).toLocaleString(), color:'#ef4444', icon:TrendingDown},
                {label:'Committed', value:'₹'+Number(stats.total_committed||0).toLocaleString(), color:'#f59e0b', icon:AlertCircle},
                {label:'Available', value:'₹'+Number((stats.total_budget||0)-(stats.total_spent||0)-(stats.total_committed||0)).toLocaleString(), color:'#10b981', icon:TrendingUp},
              ].map((s,i)=>{ const Icon=s.icon; return (
                <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><span style={{fontSize:12,color:'#64748b'}}>{s.label}</span><Icon size={18} style={{color:s.color}}/></div>
                  <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
                </div>
              )})}
            </div>

            {stats.byDepartment?.length > 0 && (
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20,marginBottom:24}}>
                <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                  <h3 style={{color:'#f1f5f9',marginBottom:16,fontSize:14}}>Budget vs Spent by Department</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={stats.byDepartment}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                      <XAxis dataKey="department" tick={{fill:'#64748b',fontSize:10}}/>
                      <YAxis tick={{fill:'#64748b',fontSize:10}} tickFormatter={v=>'₹'+Number(v/100000).toFixed(0)+'L'}/>
                      <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155'}} formatter={v=>['₹'+Number(v).toLocaleString(),'']}/>
                      <Bar dataKey="allocated" fill="#3b82f6" name="Budget" radius={[4,4,0,0]}/>
                      <Bar dataKey="spent" fill="#ef4444" name="Spent" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                  <h3 style={{color:'#f1f5f9',marginBottom:16,fontSize:14}}>Budget Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={stats.byDepartment} dataKey="allocated" nameKey="department" cx="50%" cy="50%" outerRadius={80} label={({department})=>department}>
                        {stats.byDepartment.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                      </Pie>
                      <Tooltip formatter={v=>['₹'+Number(v).toLocaleString(),'']}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14}}>Budget Lines ({budgets.length})</h3>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{borderBottom:'1px solid #334155'}}>{['Department','Year','Quarter','Category','Allocated','Spent','Committed','Utilization',''].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {budgets.map(b=>{
                    const util = Math.round((Number(b.spent_amount)/Number(b.allocated_amount))*100)
                    return (
                      <tr key={b.budget_id} style={{borderBottom:'1px solid #0f172a'}}>
                        <td style={{padding:'10px 8px',color:'#f1f5f9',fontWeight:600}}>{b.department}</td>
                        <td style={{padding:'10px 8px',color:'#94a3b8'}}>{b.fiscal_year}</td>
                        <td style={{padding:'10px 8px',color:'#94a3b8'}}>{b.fiscal_quarter}</td>
                        <td style={{padding:'10px 8px',color:'#94a3b8'}}>{b.category}</td>
                        <td style={{padding:'10px 8px',color:'#3b82f6'}}>₹{Number(b.allocated_amount).toLocaleString()}</td>
                        <td style={{padding:'10px 8px',color:'#ef4444'}}>₹{Number(b.spent_amount).toLocaleString()}</td>
                        <td style={{padding:'10px 8px',color:'#f59e0b'}}>₹{Number(b.committed_amount).toLocaleString()}</td>
                        <td style={{padding:'10px 8px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{background:'#0f172a',borderRadius:4,height:6,width:80}}><div style={{background:util>90?'#ef4444':util>70?'#f59e0b':'#10b981',height:6,borderRadius:4,width:Math.min(100,util)+'%'}}></div></div>
                            <span style={{fontSize:11,color:util>90?'#ef4444':util>70?'#f59e0b':'#10b981'}}>{util}%</span>
                          </div>
                        </td>
                        <td style={{padding:'10px 8px'}}><button onClick={()=>loadTransactions(b)} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'4px 10px',cursor:'pointer',fontSize:12}}>Transactions</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab==='transactions' && selectedBudget && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
            <h3 style={{color:'#f1f5f9',margin:'0 0 4px',fontSize:16}}>{selectedBudget.department} - {selectedBudget.category} - {selectedBudget.fiscal_quarter} {selectedBudget.fiscal_year}</h3>
            <p style={{color:'#64748b',fontSize:12,marginBottom:16}}>Budget: ₹{Number(selectedBudget.allocated_amount).toLocaleString()} | Spent: ₹{Number(selectedBudget.spent_amount).toLocaleString()}</p>
            {transactions.length===0 ? <div style={{textAlign:'center',padding:40,color:'#64748b'}}>No transactions yet</div> : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{borderBottom:'1px solid #334155'}}>{['Date','Description','Type','Amount','Created By'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
                <tbody>
                  {transactions.map(t=>(
                    <tr key={t.transaction_id} style={{borderBottom:'1px solid #0f172a'}}>
                      <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{t.transaction_date?.slice(0,10)}</td>
                      <td style={{padding:'10px 8px',color:'#f1f5f9'}}>{t.description}</td>
                      <td style={{padding:'10px 8px'}}><span style={{background:t.transaction_type==='Expense'?'#ef444420':'#10b98120',color:t.transaction_type==='Expense'?'#ef4444':'#10b981',padding:'2px 8px',borderRadius:20,fontSize:11}}>{t.transaction_type}</span></td>
                      <td style={{padding:'10px 8px',color:'#ef4444',fontWeight:600}}>₹{Number(t.amount).toLocaleString()}</td>
                      <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{t.created_by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:480}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>New Budget</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Fiscal Year</label><input type="number" value={form.fiscal_year} onChange={e=>setForm({...form,fiscal_year:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Quarter</label><select value={form.fiscal_quarter} onChange={e=>setForm({...form,fiscal_quarter:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{['Q1','Q2','Q3','Q4','Annual'].map(q=><option key={q}>{q}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Allocated Amount (₹)</label><input type="number" value={form.allocated_amount} onChange={e=>setForm({...form,allocated_amount:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create Budget</button>
            </div>
          </div>
        </div>
      )}

      {showTxForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowTxForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:400}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>Add Transaction</h2><button onClick={()=>setShowTxForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><input value={txForm.description} onChange={e=>setTxForm({...txForm,description:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Amount (₹)</label><input type="number" value={txForm.amount} onChange={e=>setTxForm({...txForm,amount:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Type</label><select value={txForm.transaction_type} onChange={e=>setTxForm({...txForm,transaction_type:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                {['Expense','Refund','Transfer'].map(t=><option key={t}>{t}</option>)}
              </select></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowTxForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleAddTx} style={{flex:2,background:'#ef4444',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Add Expense</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}