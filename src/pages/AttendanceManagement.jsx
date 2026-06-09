import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ArrowLeft, Plus, X, Calendar, RefreshCw, Search, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/attendance'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const STATUS_COLOR = { Present:'#10b981', Absent:'#ef4444', Late:'#f59e0b', 'Half Day':'#8b5cf6', 'Work From Home':'#3b82f6', 'On Leave':'#64748b' }
const COLORS = ['#10b981','#ef4444','#f59e0b','#8b5cf6','#3b82f6','#64748b']

export default function AttendanceManagement() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10))
  const [filterDept, setFilterDept] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('daily')
  const [toast, setToast] = useState(null)
  const [editRecord, setEditRecord] = useState(null)
  const [form, setForm] = useState({employee_name:'',department:'Finance',date:new Date().toISOString().slice(0,10),check_in:'09:00',check_out:'18:00',working_hours:9,status:'Present',overtime_hours:0,notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async (date) => {
    try {
      const [rRes, sRes] = await Promise.all([
        fetch(API+'?date='+date, {headers:getHeaders()}),
        fetch(API+'/stats', {headers:getHeaders()})
      ])
      const [r, s] = await Promise.all([rRes.json(), sRes.json()])
      setRecords(r.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  const loadMonthly = async () => {
    try {
      const res = await fetch(API+'/monthly', {headers:getHeaders()})
      const data = await res.json()
      setMonthly(data.data||[])
    } catch(e) {}
  }

  useEffect(()=>{ load(selectedDate); loadMonthly() },[])

  const handleSave = async () => {
    if(!form.employee_name||!form.date) { showToast('Employee name and date required','error'); return }
    try {
      const url = editRecord ? API+'/'+editRecord.attendance_id : API
      const method = editRecord ? 'PUT' : 'POST'
      const res = await fetch(url, {method,headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast(editRecord?'Updated!':'Attendance marked!'); setShowForm(false); setEditRecord(null); load(selectedDate) }
      else showToast(data.message||'Failed','error')
    } catch(e) { showToast('Failed','error') }
  }

  const handleDelete = async (id) => {
    if(!confirm('Delete this record?')) return
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); load(selectedDate)
  }

  const handleBulkMark = async (status) => {
    const employees = [...new Set(records.map(r=>r.employee_name))]
    showToast('Bulk marking '+employees.length+' employees as '+status+'...')
  }

  const exportCSV = () => {
    const hdrs = ['Employee','Department','Date','Check In','Check Out','Working Hours','Overtime','Status']
    const rows = filtered.map(r=>[r.employee_name,r.department,r.date,r.check_in||'',r.check_out||'',r.working_hours||0,r.overtime_hours||0,r.status])
    const csv = [hdrs,...rows].map(r=>r.join(',')).join('\n')
    const el=document.createElement('a'); el.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); el.download='attendance_'+selectedDate+'.csv'; el.click()
  }

  const filtered = records.filter(r=>{
    const ms = !search||r.employee_name?.toLowerCase().includes(search.toLowerCase())
    const md = filterDept==='All'||r.department===filterDept
    const ms2 = filterStatus==='All'||r.status===filterStatus
    return ms&&md&&ms2
  })

  const presentCount = records.filter(r=>r.status==='Present').length
  const absentCount = records.filter(r=>r.status==='Absent').length
  const lateCount = records.filter(r=>r.status==='Late').length
  const wfhCount = records.filter(r=>r.status==='Work From Home').length
  const totalHours = records.reduce((s,r)=>s+parseFloat(r.working_hours||0),0)
  const totalOT = records.reduce((s,r)=>s+parseFloat(r.overtime_hours||0),0)

  const statusChartData = Object.entries(
    records.reduce((acc,r)=>{ acc[r.status]=(acc[r.status]||0)+1; return acc },{})
  ).map(([name,value])=>({name,value}))

  const deptData = DEPTS.map(d=>({
    dept:d,
    present:records.filter(r=>r.department===d&&r.status==='Present').length,
    absent:records.filter(r=>r.department===d&&r.status==='Absent').length,
    late:records.filter(r=>r.department===d&&r.status==='Late').length,
  })).filter(d=>d.present+d.absent+d.late>0)

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Clock size={24} style={{color:'#3b82f6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Attendance Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track daily attendance, overtime and patterns</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={exportCSV} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:12}}><Download size={14}/> Export</button>
          <button onClick={()=>load(selectedDate)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer'}}><RefreshCw size={14}/></button>
          <button onClick={()=>{setShowForm(true);setEditRecord(null);setForm({employee_name:'',department:'Finance',date:selectedDate,check_in:'09:00',check_out:'18:00',working_hours:9,status:'Present',overtime_hours:0,notes:''})}} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Mark Attendance</button>
        </div>
      </div>

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'0 24px',display:'flex'}}>
        {[['daily','Daily View'],['analytics','Analytics & Trends']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'12px 20px',border:'none',borderBottom:activeTab===id?'2px solid #3b82f6':'2px solid transparent',background:'transparent',color:activeTab===id?'#3b82f6':'#64748b',cursor:'pointer',fontSize:13,fontWeight:activeTab===id?600:400}}>{label}</button>
        ))}
      </div>

      <div style={{padding:24}}>
        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12,marginBottom:20}}>
          {[
            {label:'Present', value:presentCount, color:'#10b981', icon:'✅'},
            {label:'Absent', value:absentCount, color:'#ef4444', icon:'❌'},
            {label:'Late', value:lateCount, color:'#f59e0b', icon:'⏰'},
            {label:'WFH', value:wfhCount, color:'#3b82f6', icon:'🏠'},
            {label:'Total Hours', value:totalHours.toFixed(0)+'h', color:'#8b5cf6', icon:'⏱'},
            {label:'Overtime', value:totalOT.toFixed(0)+'h', color:'#f59e0b', icon:'➕'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:14,borderTop:`3px solid ${s.color}`,textAlign:'center'}}>
              <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
              <div style={{fontSize:11,color:'#64748b'}}>{s.label}</div>
            </div>
          ))}
        </div>

        {activeTab==='daily' && (
          <div>
            {/* Date & Filters */}
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding:14,marginBottom:16,display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <Calendar size={14} style={{color:'#64748b'}}/>
                <input type="date" value={selectedDate} onChange={e=>{setSelectedDate(e.target.value);load(e.target.value)}} style={{...inputStyle,width:'auto'}}/>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,background:'#0f172a',border:'1px solid #334155',borderRadius:8,padding:'7px 12px',flex:1,minWidth:160}}>
                <Search size={13} style={{color:'#64748b'}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employee..." style={{background:'none',border:'none',color:'#f1f5f9',fontSize:13,outline:'none',flex:1}}/>
              </div>
              <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'7px 12px',fontSize:13,cursor:'pointer'}}>
                {['All',...DEPTS].map(d=><option key={d}>{d}</option>)}
              </select>
              <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'7px 12px',fontSize:13,cursor:'pointer'}}>
                {['All','Present','Absent','Late','Half Day','Work From Home','On Leave'].map(s=><option key={s}>{s}</option>)}
              </select>
              <div style={{display:'flex',gap:6}}>
                {['Present','Absent','Work From Home'].map(s=>(
                  <button key={s} onClick={()=>handleBulkMark(s)} style={{background:STATUS_COLOR[s]+'20',border:'none',borderRadius:6,color:STATUS_COLOR[s],padding:'6px 10px',cursor:'pointer',fontSize:11,fontWeight:600}}>Bulk {s}</button>
                ))}
              </div>
            </div>

            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
              <div style={{padding:'10px 16px',borderBottom:'1px solid #334155',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{color:'#64748b',fontSize:12}}>{filtered.length} records for {selectedDate}</span>
                <div style={{display:'flex',gap:8}}>
                  {Object.entries(STATUS_COLOR).map(([s,c])=>(
                    <span key={s} style={{color:c,fontSize:11,display:'flex',alignItems:'center',gap:4}}>
                      <span style={{width:8,height:8,borderRadius:'50%',background:c,display:'inline-block'}}></span>{s}: {records.filter(r=>r.status===s).length}
                    </span>
                  ))}
                </div>
              </div>
              {filtered.length===0 ? (
                <div style={{textAlign:'center',padding:60,color:'#64748b'}}>
                  <Clock size={40} style={{marginBottom:12,opacity:0.3}}/>
                  <p>No attendance records for {selectedDate}</p>
                  <button onClick={()=>setShowForm(true)} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 20px',cursor:'pointer',fontWeight:600,marginTop:8}}>Mark Attendance</button>
                </div>
              ) : (
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:'#0f172a'}}>
                    {['Employee','Department','Check In','Check Out','Hours','Overtime','Status','Notes','Actions'].map(h=>(
                      <th key={h} style={{color:'#64748b',fontSize:11,padding:'10px 14px',textAlign:'left',textTransform:'uppercase',borderBottom:'1px solid #334155',whiteSpace:'nowrap'}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {filtered.map(r=>(
                      <tr key={r.attendance_id} style={{borderBottom:'1px solid #0f172a'}} onMouseEnter={e=>e.currentTarget.style.background='#0f172a'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{padding:'10px 14px',color:'#f1f5f9',fontSize:13,fontWeight:500}}>{r.employee_name}</td>
                        <td style={{padding:'10px 14px',color:'#64748b',fontSize:12}}>{r.department}</td>
                        <td style={{padding:'10px 14px',color:'#94a3b8',fontSize:13}}>{r.check_in||'—'}</td>
                        <td style={{padding:'10px 14px',color:'#94a3b8',fontSize:13}}>{r.check_out||'—'}</td>
                        <td style={{padding:'10px 14px',color:'#f1f5f9',fontSize:13}}>{r.working_hours||0}h</td>
                        <td style={{padding:'10px 14px',color:r.overtime_hours>0?'#f59e0b':'#64748b',fontSize:13}}>{r.overtime_hours||0}h</td>
                        <td style={{padding:'10px 14px'}}>
                          <span style={{background:STATUS_COLOR[r.status]+'20',color:STATUS_COLOR[r.status],padding:'3px 8px',borderRadius:20,fontSize:11,fontWeight:600}}>{r.status}</span>
                        </td>
                        <td style={{padding:'10px 14px',color:'#64748b',fontSize:11,maxWidth:120,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.notes||'—'}</td>
                        <td style={{padding:'10px 14px'}}>
                          <div style={{display:'flex',gap:4}}>
                            <button onClick={()=>{setEditRecord(r);setForm({employee_name:r.employee_name,department:r.department,date:r.date?.split('T')[0]||selectedDate,check_in:r.check_in||'09:00',check_out:r.check_out||'18:00',working_hours:r.working_hours||9,status:r.status,overtime_hours:r.overtime_hours||0,notes:r.notes||''});setShowForm(true)}} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:11}}>Edit</button>
                            <button onClick={()=>handleDelete(r.attendance_id)} style={{background:'#ef444420',border:'none',borderRadius:6,color:'#ef4444',padding:'4px 6px',cursor:'pointer'}}><X size={11}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab==='analytics' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Today Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={statusChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name,value})=>name+': '+value}>
                  {statusChartData.map((s,i)=><Cell key={i} fill={STATUS_COLOR[s.name]||COLORS[i%COLORS.length]}/>)}
                </Pie><Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/><Legend/></PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Attendance by Department</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                  <XAxis dataKey="dept" tick={{fill:'#64748b',fontSize:10}}/>
                  <YAxis tick={{fill:'#64748b',fontSize:10}}/>
                  <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',color:'#f1f5f9'}}/>
                  <Legend/>
                  <Bar dataKey="present" name="Present" fill="#10b981" stackId="a" radius={[0,0,0,0]}/>
                  <Bar dataKey="late" name="Late" fill="#f59e0b" stackId="a"/>
                  <Bar dataKey="absent" name="Absent" fill="#ef4444" stackId="a" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {stats && (
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,gridColumn:'span 2'}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 16px',fontSize:14,fontWeight:600}}>Overall Statistics</h3>
                <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
                  {[
                    {label:'Total Records', value:stats.total_records||0, color:'#3b82f6'},
                    {label:'Present Rate', value:stats.present_rate||'0%', color:'#10b981'},
                    {label:'Avg Working Hours', value:(stats.avg_working_hours||0).toFixed(1)+'h', color:'#f59e0b'},
                    {label:'Total Overtime', value:(stats.total_overtime||0)+'h', color:'#8b5cf6'},
                  ].map((s,i)=>(
                    <div key={i} style={{background:'#0f172a',borderRadius:10,padding:14,borderLeft:`3px solid ${s.color}`}}>
                      <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{s.label}</div>
                      <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:520}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>{editRecord?'Edit Record':'Mark Attendance'}</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Employee Name *</label><input value={form.employee_name} onChange={e=>setForm({...form,employee_name:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label>
                <select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={inputStyle}>
                  {DEPTS.map(d=><option key={d}>{d}</option>)}
                </select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Date</label><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Check In</label><input type="time" value={form.check_in} onChange={e=>setForm({...form,check_in:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Check Out</label><input type="time" value={form.check_out} onChange={e=>setForm({...form,check_out:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Working Hours</label><input type="number" step="0.5" value={form.working_hours} onChange={e=>setForm({...form,working_hours:parseFloat(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Overtime Hours</label><input type="number" step="0.5" value={form.overtime_hours} onChange={e=>setForm({...form,overtime_hours:parseFloat(e.target.value)||0})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={inputStyle}>
                  {['Present','Absent','Late','Half Day','Work From Home','On Leave'].map(s=><option key={s}>{s}</option>)}
                </select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><input value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} style={inputStyle}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editRecord?'Update':'Mark Attendance'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}