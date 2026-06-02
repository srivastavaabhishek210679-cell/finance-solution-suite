import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ArrowLeft, Plus, X, Calendar } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/attendance'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const STATUS_COLOR = { Present:'#10b981', Absent:'#ef4444', Late:'#f59e0b', 'Half Day':'#8b5cf6', 'Work From Home':'#3b82f6' }

export default function AttendanceManagement() {
  const navigate = useNavigate()
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0,10))
  const [showForm, setShowForm] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({employee_name:'',department:'Finance',date:'',check_in:'09:00',check_out:'18:00',working_hours:9,status:'Present',overtime_hours:0,notes:''})

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

  useEffect(()=>{ load(selectedDate) },[selectedDate])

  const handleCreate = async () => {
    const res = await fetch(API, {method:'POST', headers:getHeaders(), body:JSON.stringify({...form, date:selectedDate})})
    const data = await res.json()
    if(data.status==='success') { showToast('Attendance marked!'); setShowForm(false); load(selectedDate) }
    else showToast(data.message,'error')
  }

  const totalPresent = records.filter(r=>r.status==='Present'||r.status==='Late'||r.status==='Work From Home').length
  const totalAbsent = records.filter(r=>r.status==='Absent').length
  const avgHours = records.length > 0 ? (records.reduce((sum,r)=>sum+Number(r.working_hours),0)/records.length).toFixed(1) : 0

  return (
    <div style={{minHeight:'100vh',background:'#f1f5f9',color:'#1e293b',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Clock size={28} style={{color:'#f59e0b'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Attendance Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track daily attendance, check-in and working hours</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:10,alignItems:'center'}}>
          <input type="date" value={selectedDate} onChange={e=>setSelectedDate(e.target.value)} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13}}/>
          <button onClick={()=>{setShowForm(true);setForm({employee_name:'',department:'Finance',date:selectedDate,check_in:'09:00',check_out:'18:00',working_hours:9,status:'Present',overtime_hours:0,notes:''})}} style={{display:'flex',alignItems:'center',gap:6,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Mark Attendance</button>
        </div>
      </div>

      <div style={{padding:24}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          {[
            {label:'Present Today', value:stats?.present||totalPresent, color:'#10b981'},
            {label:'Absent Today', value:stats?.absent||totalAbsent, color:'#ef4444'},
            {label:'Late Arrivals', value:stats?.late||records.filter(r=>r.status==='Late').length, color:'#f59e0b'},
            {label:'Avg Working Hours', value:(stats?.avgHours||avgHours)+' hrs', color:'#3b82f6'},
          ].map((s,i)=>(
            <div key={i} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
              <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
              <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Attendance Summary by Status */}
        <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
          {Object.entries(STATUS_COLOR).map(([status,color])=>{
            const count = records.filter(r=>r.status===status).length
            return (
              <div key={status} style={{background:'#ffffff',border:`1px solid ${color}30`,borderRadius:8,padding:'8px 14px',display:'flex',gap:8,alignItems:'center'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:color}}></div>
                <span style={{fontSize:12,color:'#475569'}}>{status}:</span>
                <span style={{fontSize:13,fontWeight:700,color}}>{count}</span>
              </div>
            )
          })}
        </div>

        <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:12,padding:20}}>
          <h3 style={{color:'#1e293b',margin:'0 0 16px',fontSize:14}}>Attendance Records — {selectedDate} ({records.length} employees)</h3>
          {records.length===0 ? (
            <div style={{textAlign:'center',padding:40,color:'#64748b'}}>No attendance records for {selectedDate}</div>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid #e2e8f0'}}>{['Employee','Department','Check In','Check Out','Working Hours','Overtime','Status','Notes'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
              <tbody>
                {records.map(r=>(
                  <tr key={r.attendance_id} style={{borderBottom:'1px solid #f1f5f9'}}>
                    <td style={{padding:'10px 8px',color:'#1e293b',fontWeight:600,fontSize:13}}>{r.employee_name}</td>
                    <td style={{padding:'10px 8px',color:'#475569',fontSize:12}}>{r.department}</td>
                    <td style={{padding:'10px 8px',color:'#10b981',fontSize:12,fontWeight:600}}>{r.check_in||'--:--'}</td>
                    <td style={{padding:'10px 8px',color:'#475569',fontSize:12}}>{r.check_out||'--:--'}</td>
                    <td style={{padding:'10px 8px',color:'#3b82f6',fontWeight:600}}>{r.working_hours}h</td>
                    <td style={{padding:'10px 8px',color:Number(r.overtime_hours)>0?'#f59e0b':'#64748b',fontSize:12}}>{r.overtime_hours}h</td>
                    <td style={{padding:'10px 8px'}}><span style={{background:STATUS_COLOR[r.status]+'20',color:STATUS_COLOR[r.status],padding:'2px 8px',borderRadius:20,fontSize:11}}>{r.status}</span></td>
                    <td style={{padding:'10px 8px',color:'#64748b',fontSize:11}}>{r.notes||'-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:16,padding:24,width:520}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#1e293b',margin:0}}>Mark Attendance</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['employee_name','Employee Name'],['check_in','Check In','time'],['check_out','Check Out','time'],['working_hours','Working Hours','number'],['overtime_hours','Overtime Hours','number']].map(([key,label,type='text'])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={form.department} onChange={e=>setForm({...form,department:e.target.value})} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13}}>{Object.keys(STATUS_COLOR).map(s=><option key={s}>{s}</option>)}</select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Notes</label><input value={form.notes||''} onChange={e=>setForm({...form,notes:e.target.value})} style={{width:'100%',background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#1e293b',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#e2e8f0',border:'none',borderRadius:8,color:'#475569',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#f59e0b',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Mark Attendance</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
