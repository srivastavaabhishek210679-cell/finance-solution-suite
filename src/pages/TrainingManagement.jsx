import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ArrowLeft, Plus, X, CheckCircle, Award } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/training'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const CATEGORIES = ['Technical','Soft Skills','Finance','HR','Sales','Compliance','Leadership','Safety']
const DEPTS = ['Finance','HR','IT','Sales','Operations','Marketing','Legal','Admin']
const MODE_COLOR = { Online:'#3b82f6', Classroom:'#10b981', Hybrid:'#8b5cf6' }

export default function TrainingManagement() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [stats, setStats] = useState(null)
  const [tab, setTab] = useState('courses')
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showEnrollForm, setShowEnrollForm] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [toast, setToast] = useState(null)
  const [courseForm, setCourseForm] = useState({course_name:'',category:'Technical',instructor:'',duration_hours:8,mode:'Online',max_participants:20,start_date:'',end_date:'',description:''})
  const [enrollForm, setEnrollForm] = useState({course_id:'',employee_name:'',department:'IT'})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [cRes, eRes, sRes] = await Promise.all([
        fetch(API+'/courses', {headers:getHeaders()}),
        fetch(API+'/enrollments', {headers:getHeaders()}),
        fetch(API+'/stats', {headers:getHeaders()})
      ])
      const [c, e, s] = await Promise.all([cRes.json(), eRes.json(), sRes.json()])
      setCourses(c.data||[]); setEnrollments(e.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleCreateCourse = async () => {
    const res = await fetch(API+'/courses', {method:'POST', headers:getHeaders(), body:JSON.stringify(courseForm)})
    const data = await res.json()
    if(data.status==='success') { showToast('Course created!'); setShowCourseForm(false); load() }
    else showToast(data.message,'error')
  }

  const handleEnroll = async () => {
    const res = await fetch(API+'/enroll', {method:'POST', headers:getHeaders(), body:JSON.stringify(enrollForm)})
    const data = await res.json()
    if(data.status==='success') { showToast('Enrolled successfully!'); setShowEnrollForm(false); load() }
    else showToast(data.message,'error')
  }

  const handleUpdateEnrollment = async (id, status, score) => {
    const completion_date = status==='Completed' ? new Date().toISOString().slice(0,10) : null
    const certificate_issued = status==='Completed' && score >= 70
    await fetch(API+'/enrollments/'+id, {method:'PUT', headers:getHeaders(), body:JSON.stringify({status, score, completion_date, certificate_issued})})
    showToast('Updated!'); load()
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <BookOpen size={28} style={{color:'#8b5cf6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Training Management</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Courses, enrollments and certifications</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <button onClick={()=>{setShowEnrollForm(true);setEnrollForm({course_id:courses[0]?.course_id||'',employee_name:'',department:'IT'})}} style={{display:'flex',alignItems:'center',gap:6,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Enroll</button>
          <button onClick={()=>setShowCourseForm(true)} style={{display:'flex',alignItems:'center',gap:6,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> Add Course</button>
        </div>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Courses', value:stats.totalCourses, color:'#8b5cf6'},
              {label:'Total Enrollments', value:stats.totalEnrollments, color:'#3b82f6'},
              {label:'Completed', value:stats.completed, color:'#10b981'},
              {label:'Certificates Issued', value:stats.certificates, color:'#f59e0b'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{display:'flex',gap:4,marginBottom:20,background:'#1e293b',padding:4,borderRadius:10,width:'fit-content'}}>
          {[['courses','Courses'],['enrollments','Enrollments']].map(([id,label])=>(
            <button key={id} onClick={()=>setTab(id)} style={{padding:'8px 20px',borderRadius:8,border:'none',background:tab===id?'#8b5cf6':'transparent',color:tab===id?'#fff':'#64748b',cursor:'pointer',fontWeight:600,fontSize:13}}>{label}</button>
          ))}
        </div>

        {tab==='courses' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
            {courses.map(c=>(
              <div key={c.course_id} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <span style={{background:(MODE_COLOR[c.mode]||'#64748b')+'20',color:MODE_COLOR[c.mode]||'#64748b',padding:'2px 8px',borderRadius:20,fontSize:11}}>{c.mode}</span>
                  <span style={{background:c.status==='Active'?'#10b98120':'#64748b20',color:c.status==='Active'?'#10b981':'#64748b',padding:'2px 8px',borderRadius:20,fontSize:11}}>{c.status}</span>
                </div>
                <h3 style={{color:'#f1f5f9',margin:'0 0 4px',fontSize:15}}>{c.course_name}</h3>
                <p style={{color:'#64748b',fontSize:12,margin:'0 0 12px'}}>{c.category} • {c.instructor}</p>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:12,marginBottom:12}}>
                  <div><span style={{color:'#64748b'}}>Duration: </span><span style={{color:'#94a3b8'}}>{c.duration_hours}h</span></div>
                  <div><span style={{color:'#64748b'}}>Enrolled: </span><span style={{color:'#3b82f6',fontWeight:600}}>{c.enrolled}/{c.max_participants}</span></div>
                  <div><span style={{color:'#64748b'}}>Start: </span><span style={{color:'#94a3b8'}}>{c.start_date?.slice(0,10)}</span></div>
                  <div><span style={{color:'#64748b'}}>End: </span><span style={{color:'#94a3b8'}}>{c.end_date?.slice(0,10)}</span></div>
                </div>
                <div style={{background:'#0f172a',borderRadius:6,height:6,marginBottom:8}}>
                  <div style={{background:'#8b5cf6',height:6,borderRadius:6,width:Math.min(100,Math.round((c.enrolled/c.max_participants)*100))+'%'}}></div>
                </div>
                <button onClick={()=>{setShowEnrollForm(true);setEnrollForm({course_id:c.course_id,employee_name:'',department:'IT'})}} style={{width:'100%',background:'#8b5cf620',border:'none',borderRadius:6,color:'#8b5cf6',padding:'6px',cursor:'pointer',fontSize:12,fontWeight:600}}>+ Enroll Employee</button>
              </div>
            ))}
          </div>
        )}

        {tab==='enrollments' && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid #334155'}}>{['Employee','Department','Course','Category','Status','Score','Certificate','Actions'].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
              <tbody>
                {enrollments.map(e=>(
                  <tr key={e.enrollment_id} style={{borderBottom:'1px solid #0f172a'}}>
                    <td style={{padding:'10px 8px',color:'#f1f5f9',fontWeight:600,fontSize:13}}>{e.employee_name}</td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{e.department}</td>
                    <td style={{padding:'10px 8px',color:'#8b5cf6',fontSize:12}}>{e.course_name}</td>
                    <td style={{padding:'10px 8px',color:'#64748b',fontSize:12}}>{e.category}</td>
                    <td style={{padding:'10px 8px'}}><span style={{background:e.status==='Completed'?'#10b98120':e.status==='Enrolled'?'#3b82f620':'#64748b20',color:e.status==='Completed'?'#10b981':e.status==='Enrolled'?'#3b82f6':'#64748b',padding:'2px 8px',borderRadius:20,fontSize:11}}>{e.status}</span></td>
                    <td style={{padding:'10px 8px',color:e.score>=70?'#10b981':'#94a3b8',fontWeight:600}}>{e.score||'-'}</td>
                    <td style={{padding:'10px 8px'}}>{e.certificate_issued?<Award size={14} style={{color:'#f59e0b'}}/>:'-'}</td>
                    <td style={{padding:'10px 8px'}}>
                      {e.status==='Enrolled' && (
                        <button onClick={()=>handleUpdateEnrollment(e.enrollment_id,'Completed',85)} style={{background:'#10b98120',border:'none',borderRadius:6,color:'#10b981',padding:'4px 8px',cursor:'pointer',fontSize:11}}>Mark Complete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCourseForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowCourseForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:540}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>Add Course</h2><button onClick={()=>setShowCourseForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['course_name','Course Name'],['instructor','Instructor'],['duration_hours','Duration (Hours)','number'],['max_participants','Max Participants','number'],['start_date','Start Date','date'],['end_date','End Date','date']].map(([key,label,type='text'])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={courseForm[key]||''} onChange={e=>setCourseForm({...courseForm,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Category</label><select value={courseForm.category} onChange={e=>setCourseForm({...courseForm,category:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Mode</label><select value={courseForm.mode} onChange={e=>setCourseForm({...courseForm,mode:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{['Online','Classroom','Hybrid'].map(m=><option key={m}>{m}</option>)}</select></div>
              <div style={{gridColumn:'span 2'}}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={courseForm.description||''} onChange={e=>setCourseForm({...courseForm,description:e.target.value})} rows={2} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box',resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowCourseForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreateCourse} style={{flex:2,background:'#8b5cf6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create Course</button>
            </div>
          </div>
        </div>
      )}

      {showEnrollForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowEnrollForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:400}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>Enroll Employee</h2><button onClick={()=>setShowEnrollForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Course</label><select value={enrollForm.course_id} onChange={e=>setEnrollForm({...enrollForm,course_id:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{courses.map(c=><option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Employee Name</label><input value={enrollForm.employee_name} onChange={e=>setEnrollForm({...enrollForm,employee_name:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Department</label><select value={enrollForm.department} onChange={e=>setEnrollForm({...enrollForm,department:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowEnrollForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleEnroll} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Enroll</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}