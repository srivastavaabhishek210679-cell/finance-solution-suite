import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, DollarSign, ArrowLeft, Plus, Play, Eye, Search, Edit, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/payroll'
const getToken = () => localStorage.getItem('token')
const headers = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() })

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DEPARTMENTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const EMPTY_EMP = { employee_code:'', first_name:'', last_name:'', email:'', phone:'', department:'Finance', designation:'', employment_type:'Full-Time', date_of_joining:'', basic_salary:'', hra:'', transport_allowance:'', medical_allowance:'', other_allowance:'', pf_deduction:'', tax_deduction:'', other_deduction:'', bank_account:'', bank_name:'', pan_number:'' }

export default function PayrollManagement() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('employees')
  const [employees, setEmployees] = useState([])
  const [payrollRuns, setPayrollRuns] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editEmp, setEditEmp] = useState(null)
  const [form, setForm] = useState(EMPTY_EMP)
  const [showPayroll, setShowPayroll] = useState(false)
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1)
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear())
  const [selectedRun, setSelectedRun] = useState(null)
  const [payslips, setPayslips] = useState([])
  const [reportsData, setReportsData] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const loadReportsData = async () => {
    try {
      const res = await fetch(API+'/reports-data', {headers:headers()})
      const data = await res.json()
      setReportsData(data.data || null)
    } catch(e) { showToast('Failed to load reports data', 'error') }
  }
  const loadData = async () => {
    setLoading(true)
    try {
      const [empRes, runsRes, statsRes] = await Promise.all([
        fetch(API+'/employees', {headers:headers()}),
        fetch(API+'/runs', {headers:headers()}),
        fetch(API+'/stats', {headers:headers()})
      ])
      const [empData, runsData, statsData] = await Promise.all([empRes.json(), runsRes.json(), statsRes.json()])
      setEmployees(empData.data || [])
      setPayrollRuns(runsData.data || [])
      setStats(statsData.data || null)
    } catch(e) { showToast('Failed to load data', 'error') }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleSaveEmployee = async () => {
    try {
      const url = editEmp ? API+'/employees/'+editEmp.employee_id : API+'/employees'
      const method = editEmp ? 'PUT' : 'POST'
      const res = await fetch(url, { method, headers:headers(), body: JSON.stringify(form) })
      const data = await res.json()
      if (data.status === 'success') {
        showToast(editEmp ? 'Employee updated!' : 'Employee added!')
        setShowForm(false); setEditEmp(null); setForm(EMPTY_EMP); loadData()
      } else showToast(data.message || 'Failed', 'error')
    } catch(e) { showToast('Error saving employee', 'error') }
  }

  const handleRunPayroll = async () => {
    try {
      const res = await fetch(API+'/run', { method:'POST', headers:headers(), body: JSON.stringify({month:payrollMonth, year:payrollYear}) })
      const data = await res.json()
      if (data.status === 'success') {
        showToast('Payroll processed successfully!')
        setShowPayroll(false); loadData()
      } else showToast(data.message || 'Failed', 'error')
    } catch(e) { showToast('Error running payroll', 'error') }
  }

  const handleViewPayslips = async (run) => {
    setSelectedRun(run)
    try {
      const res = await fetch(API+'/runs/'+run.payroll_id+'/payslips', {headers:headers()})
      const data = await res.json()
      setPayslips(data.data || [])
    } catch(e) { showToast('Error loading payslips', 'error') }
  }

  const filteredEmployees = employees.filter(e =>
    (e.first_name+' '+e.last_name+' '+e.employee_code+' '+e.department).toLowerCase().includes(search.toLowerCase())
  )

  const s = { container:{ minHeight:'100vh', background:'#0f172a', color:'#f1f5f9', fontFamily:'Inter,sans-serif' }, header:{ background:'#1e293b', borderBottom:'1px solid #334155', padding:'16px 24px', display:'flex', alignItems:'center', gap:16 }, content:{ padding:24 }, card:{ background:'#1e293b', border:'1px solid #334155', borderRadius:12, padding:20 } }

  return (
    <div style={s.container}>
      {/* Toast */}
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}

      {/* Header */}
      <div style={s.header}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <DollarSign size={28} style={{color:'#10b981'}}/>
        <div>
          <h1 style={{margin:0,fontSize:20,fontWeight:700}}>Payroll Management</h1>
          <p style={{margin:0,fontSize:12,color:'#64748b'}}>Manage employees, salaries and payroll processing</p>
        </div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <button onClick={()=>{setShowPayroll(true)}} style={{display:'flex',alignItems:'center',gap:6,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Play size={14}/> Run Payroll</button>
          <button onClick={()=>{setShowForm(true);setEditEmp(null);setForm(EMPTY_EMP)}} style={{display:'flex',alignItems:'center',gap:6,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Employee</button>
        </div>
      </div>

      <div style={s.content}>
        {/* Stats */}
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Employees', value:stats.totalEmployees, color:'#3b82f6', icon:Users},
              {label:'Monthly Gross', value:'₹'+Number(stats.lastPayroll?.total_gross||0).toLocaleString(), color:'#10b981', icon:DollarSign},
              {label:'Total Deductions', value:'₹'+Number(stats.lastPayroll?.total_deductions||0).toLocaleString(), color:'#ef4444', icon:AlertCircle},
              {label:'Net Payroll', value:'₹'+Number(stats.lastPayroll?.total_net||0).toLocaleString(), color:'#8b5cf6', icon:CheckCircle},
            ].map((s,i) => { const Icon=s.icon; return (
              <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontSize:12,color:'#64748b'}}>{s.label}</span>
                  <Icon size={18} style={{color:s.color}}/>
                </div>
                <div style={{fontSize:24,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            )})}
          </div>
        )}

        {/* Department Cost Chart */}
        {stats?.departmentCosts?.length > 0 && (
          <div style={{...s.card, marginBottom:24}}>
            <h3 style={{color:'#f1f5f9',marginBottom:16,fontSize:14}}>Department Payroll Cost</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.departmentCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                <XAxis dataKey="department" tick={{fill:'#64748b',fontSize:11}}/>
                <YAxis tick={{fill:'#64748b',fontSize:11}}/>
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8}} formatter={(v)=>['₹'+Number(v).toLocaleString(),'Cost']}/>
                <Bar dataKey="total_cost" fill="#3b82f6" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:20,background:'#1e293b',padding:4,borderRadius:10,width:'fit-content'}}>
        {[['employees','Employees'],['payroll','Payroll Runs'],['reports','Reports']].map(([id,label])=>(
            <button key={id} onClick={()=>{setTab(id);if(id==='reports')loadReportsData()}} style={{padding:'8px 20px',borderRadius:8,border:'none',background:tab===id?'#3b82f6':'transparent',color:tab===id?'#fff':'#64748b',cursor:'pointer',fontWeight:600,fontSize:13}}>{label}</button>
          ))}
        </div>

        {/* Employees Tab */}
        {tab === 'employees' && (
          <div style={s.card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <h3 style={{color:'#f1f5f9',margin:0}}>Employees ({filteredEmployees.length})</h3>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#0f172a',border:'1px solid #334155',borderRadius:8,padding:'8px 12px'}}>
                <Search size={14} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employees..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',width:200}}/>
              </div>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #334155'}}>
                  {['Code','Name','Department','Designation','Basic Salary','Gross','Status','Actions'].map(h=>(
                    <th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map(emp => {
                  const gross = Number(emp.basic_salary)+Number(emp.hra)+Number(emp.transport_allowance)+Number(emp.medical_allowance)+Number(emp.other_allowance)
                  return (
                    <tr key={emp.employee_id} style={{borderBottom:'1px solid #1e293b'}}>
                      <td style={{padding:'12px 8px',color:'#94a3b8',fontSize:12}}>{emp.employee_code}</td>
                      <td style={{padding:'12px 8px',color:'#f1f5f9',fontWeight:600,fontSize:13}}>{emp.first_name} {emp.last_name}</td>
                      <td style={{padding:'12px 8px',color:'#94a3b8',fontSize:12}}>{emp.department}</td>
                      <td style={{padding:'12px 8px',color:'#94a3b8',fontSize:12}}>{emp.designation}</td>
                      <td style={{padding:'12px 8px',color:'#10b981',fontSize:13}}>₹{Number(emp.basic_salary).toLocaleString()}</td>
                      <td style={{padding:'12px 8px',color:'#3b82f6',fontSize:13,fontWeight:600}}>₹{gross.toLocaleString()}</td>
                      <td style={{padding:'12px 8px'}}>
                        <span style={{background:emp.status==='Active'?'#10b98120':'#ef444420',color:emp.status==='Active'?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11}}>{emp.status}</span>
                      </td>
                      <td style={{padding:'12px 8px'}}>
                        <div style={{display:'flex',gap:6}}>
                          <button onClick={()=>{setEditEmp(emp);setForm(emp);setShowForm(true)}} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'4px 8px',cursor:'pointer'}}><Edit size={12}/></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Payroll Runs Tab */}
        {tab === 'payroll' && (
          <div style={s.card}>
            <h3 style={{color:'#f1f5f9',margin:'0 0 16px'}}>Payroll Runs</h3>
            {payrollRuns.length === 0 ? (
              <div style={{textAlign:'center',padding:40,color:'#64748b'}}>No payroll runs yet. Click "Run Payroll" to process.</div>
            ) : (
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid #334155'}}>
                    {['Period','Employees','Gross','Deductions','Net Pay','Status','Actions'].map(h=>(
                      <th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payrollRuns.map(run => (
                    <tr key={run.payroll_id} style={{borderBottom:'1px solid #1e293b'}}>
                      <td style={{padding:'12px 8px',color:'#f1f5f9',fontWeight:600}}>{MONTHS[run.month-1]} {run.year}</td>
                      <td style={{padding:'12px 8px',color:'#94a3b8'}}>{run.total_employees}</td>
                      <td style={{padding:'12px 8px',color:'#10b981'}}>₹{Number(run.total_gross).toLocaleString()}</td>
                      <td style={{padding:'12px 8px',color:'#ef4444'}}>₹{Number(run.total_deductions).toLocaleString()}</td>
                      <td style={{padding:'12px 8px',color:'#3b82f6',fontWeight:600}}>₹{Number(run.total_net).toLocaleString()}</td>
                      <td style={{padding:'12px 8px'}}>
                        <span style={{background:'#10b98120',color:'#10b981',padding:'2px 8px',borderRadius:20,fontSize:11}}>{run.status}</span>
                      </td>
                      <td style={{padding:'12px 8px'}}>
                        <button onClick={()=>handleViewPayslips(run)} style={{display:'flex',alignItems:'center',gap:4,background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'4px 10px',cursor:'pointer',fontSize:12}}><Eye size={12}/> View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Employee Modal */}

        {tab === "reports" && (
          <div>
            {!reportsData ? (
              <div style={{textAlign:"center",padding:40,color:"#64748b"}}>Click Reports tab to load data...</div>
            ) : (
              <div>
                <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:20,marginBottom:20}}>
                  <h3 style={{color:"#f1f5f9",marginBottom:16,fontSize:14}}>Payroll Cost by Department</h3>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr style={{borderBottom:"1px solid #334155"}}>{["Department","Employees","Avg Salary","Total Gross"].map(h=>(<th key={h} style={{color:"#64748b",fontSize:11,padding:"8px",textAlign:"left",textTransform:"uppercase"}}>{h}</th>))}</tr></thead>
                    <tbody>{reportsData.deptSummary.map((d,i)=>(<tr key={i} style={{borderBottom:"1px solid #0f172a"}}><td style={{padding:"10px 8px",color:"#f1f5f9",fontWeight:600}}>{d.department}</td><td style={{padding:"10px 8px",color:"#94a3b8"}}>{d.count}</td><td style={{padding:"10px 8px",color:"#10b981"}}>{"?"+Number(d.avg_salary).toLocaleString()}</td><td style={{padding:"10px 8px",color:"#3b82f6",fontWeight:600}}>{"?"+Number(d.total_gross).toLocaleString()}</td></tr>))}</tbody>
                  </table>
                </div>
                <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:20,marginBottom:20}}>
                  <h3 style={{color:"#f1f5f9",marginBottom:16,fontSize:14}}>Salary Band by Designation</h3>
                  <table style={{width:"100%",borderCollapse:"collapse"}}>
                    <thead><tr style={{borderBottom:"1px solid #334155"}}>{["Designation","Employees","Avg Basic Salary"].map(h=>(<th key={h} style={{color:"#64748b",fontSize:11,padding:"8px",textAlign:"left",textTransform:"uppercase"}}>{h}</th>))}</tr></thead>
                    <tbody>{reportsData.salaryBands.map((s,i)=>(<tr key={i} style={{borderBottom:"1px solid #0f172a"}}><td style={{padding:"10px 8px",color:"#f1f5f9",fontWeight:600}}>{s.designation}</td><td style={{padding:"10px 8px",color:"#94a3b8"}}>{s.count}</td><td style={{padding:"10px 8px",color:"#10b981",fontWeight:600}}>{"?"+Number(s.avg_salary).toLocaleString()}</td></tr>))}</tbody>
                  </table>
                </div>
                {reportsData.trend.length > 0 && (
                  <div style={{background:"#1e293b",border:"1px solid #334155",borderRadius:12,padding:20}}>
                    <h3 style={{color:"#f1f5f9",marginBottom:16,fontSize:14}}>Monthly Payroll Trend</h3>
                    <table style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead><tr style={{borderBottom:"1px solid #334155"}}>{["Month","Year","Gross","Deductions","Net Pay"].map(h=>(<th key={h} style={{color:"#64748b",fontSize:11,padding:"8px",textAlign:"left",textTransform:"uppercase"}}>{h}</th>))}</tr></thead>
                      <tbody>{reportsData.trend.map((t,i)=>(<tr key={i} style={{borderBottom:"1px solid #0f172a"}}><td style={{padding:"10px 8px",color:"#f1f5f9"}}>{t.month}</td><td style={{padding:"10px 8px",color:"#94a3b8"}}>{t.year}</td><td style={{padding:"10px 8px",color:"#10b981"}}>{"?"+Number(t.gross).toLocaleString()}</td><td style={{padding:"10px 8px",color:"#ef4444"}}>{"?"+Number(t.deductions).toLocaleString()}</td><td style={{padding:"10px 8px",color:"#3b82f6",fontWeight:600}}>{"?"+Number(t.net).toLocaleString()}</td></tr>))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:600,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editEmp?'Edit Employee':'Add Employee'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[
                ['employee_code','Employee Code'],['first_name','First Name'],['last_name','Last Name'],
                ['email','Email'],['phone','Phone'],['designation','Designation'],
                ['date_of_joining','Date of Joining','date'],['date_of_birth','Date of Birth','date'],
                ['basic_salary','Basic Salary','number'],['hra','HRA','number'],
                ['transport_allowance','Transport Allowance','number'],['medical_allowance','Medical Allowance','number'],
                ['other_allowance','Other Allowance','number'],['pf_deduction','PF Deduction','number'],
                ['tax_deduction','Tax Deduction','number'],['other_deduction','Other Deduction','number'],
                ['bank_account','Bank Account'],['bank_name','Bank Name'],['pan_number','PAN Number']
              ].map(([key,label,type='text'])=>(
                <div key={key}>
                  <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label>
                  <input type={type} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})}
                    style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/>
                </div>
              ))}
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label>
                <select value={form.department||'Finance'} onChange={e=>setForm({...form,department:e.target.value})}
                  style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                  {DEPARTMENTS.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Employment Type</label>
                <select value={form.employment_type||'Full-Time'} onChange={e=>setForm({...form,employment_type:e.target.value})}
                  style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                  {['Full-Time','Part-Time','Contract','Intern'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSaveEmployee} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editEmp?'Update Employee':'Add Employee'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Run Payroll Modal */}
      {showPayroll && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowPayroll(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:400}} onClick={e=>e.stopPropagation()}>
            <h2 style={{color:'#f1f5f9',marginBottom:20}}>Run Payroll</h2>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Month</label>
                <select value={payrollMonth} onChange={e=>setPayrollMonth(Number(e.target.value))}
                  style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>
                  {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Year</label>
                <input type="number" value={payrollYear} onChange={e=>setPayrollYear(Number(e.target.value))}
                  style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/>
              </div>
            </div>
            <div style={{background:'#0f172a',borderRadius:8,padding:12,marginBottom:20,fontSize:13,color:'#94a3b8'}}>
              This will process payroll for <strong style={{color:'#f1f5f9'}}>{stats?.totalEmployees||0} active employees</strong> for <strong style={{color:'#10b981'}}>{MONTHS[payrollMonth-1]} {payrollYear}</strong>
            </div>
            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>setShowPayroll(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleRunPayroll} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}><Play size={14}/> Process Payroll</button>
            </div>
          </div>
        </div>
      )}

      {/* Payslips Modal */}
      {selectedRun && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelectedRun(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:800,maxHeight:'90vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>Payslips — {MONTHS[selectedRun.month-1]} {selectedRun.year}</h2>
              <button onClick={()=>setSelectedRun(null)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid #334155'}}>
                  {['Employee','Department','Basic','HRA','Gross','Deductions','Net Pay'].map(h=>(
                    <th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payslips.map(p=>(
                  <tr key={p.payslip_id} style={{borderBottom:'1px solid #0f172a'}}>
                    <td style={{padding:'10px 8px'}}>
                      <div style={{color:'#f1f5f9',fontWeight:600,fontSize:13}}>{p.first_name} {p.last_name}</div>
                      <div style={{color:'#64748b',fontSize:11}}>{p.employee_code}</div>
                    </td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{p.department}</td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>₹{Number(p.basic_salary).toLocaleString()}</td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>₹{Number(p.hra).toLocaleString()}</td>
                    <td style={{padding:'10px 8px',color:'#10b981',fontWeight:600}}>₹{Number(p.gross_salary).toLocaleString()}</td>
                    <td style={{padding:'10px 8px',color:'#ef4444'}}>₹{Number(p.total_deductions).toLocaleString()}</td>
                    <td style={{padding:'10px 8px',color:'#3b82f6',fontWeight:700,fontSize:14}}>₹{Number(p.net_salary).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{borderTop:'2px solid #334155',background:'#0f172a'}}>
                  <td colSpan={4} style={{padding:'12px 8px',color:'#f1f5f9',fontWeight:700}}>TOTAL</td>
                  <td style={{padding:'12px 8px',color:'#10b981',fontWeight:700}}>₹{Number(selectedRun.total_gross).toLocaleString()}</td>
                  <td style={{padding:'12px 8px',color:'#ef4444',fontWeight:700}}>₹{Number(selectedRun.total_deductions).toLocaleString()}</td>
                  <td style={{padding:'12px 8px',color:'#3b82f6',fontWeight:700}}>₹{Number(selectedRun.total_net).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
