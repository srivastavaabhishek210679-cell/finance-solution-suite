import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, RefreshCw, X, ChevronLeft, ChevronRight, Calendar, Sync } from 'lucide-react'

const API = 'https://finance-backend-so86.onrender.com/api/v1/calendar'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const EVENT_TYPES = [
  {type:'general', color:'#3b82f6', label:'General'},
  {type:'leave', color:'#f59e0b', label:'Leave'},
  {type:'project', color:'#8b5cf6', label:'Project'},
  {type:'meeting', color:'#10b981', label:'Meeting'},
  {type:'deadline', color:'#ef4444', label:'Deadline'},
  {type:'holiday', color:'#14b8a6', label:'Holiday'},
]

export default function CalendarScheduler() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [toast, setToast] = useState(null)
  const [viewMode, setViewMode] = useState('month')
  const [form, setForm] = useState({title:'',description:'',event_type:'general',start_date:'',end_date:'',start_time:'',end_time:'',all_day:true,color:'#3b82f6'})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  useEffect(() => { loadEvents() }, [currentDate])

  const loadEvents = async () => {
    try {
      const res = await fetch(API+'?month='+(currentDate.getMonth()+1)+'&year='+currentDate.getFullYear(), {headers:getHeaders()})
      const data = await res.json()
      setEvents(data.data||[])
    } catch(e) {}
  }

  const handleCreate = async () => {
    if(!form.title||!form.start_date) { showToast('Title and date required','error'); return }
    try {
      const res = await fetch(API, {method:'POST',headers:getHeaders(),body:JSON.stringify(form)})
      const data = await res.json()
      if(data.status==='success') { showToast('Event created!'); setShowForm(false); loadEvents() }
    } catch(e) { showToast('Failed','error') }
  }

  const handleDelete = async (id) => {
    await fetch(API+'/'+id, {method:'DELETE',headers:getHeaders()})
    showToast('Deleted'); setSelectedEvent(null); loadEvents()
  }

  const handleSync = async () => {
    await fetch(API+'/sync', {method:'POST',headers:getHeaders()})
    showToast('Calendar synced with leaves and projects!'); loadEvents()
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear(), month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month+1, 0).getDate()
    const days = []
    for(let i=0; i<firstDay; i++) days.push(null)
    for(let i=1; i<=daysInMonth; i++) days.push(new Date(year, month, i))
    return days
  }

  const getEventsForDate = (date) => {
    if(!date) return []
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(e => {
      const start = e.start_date?.split('T')[0]
      const end = (e.end_date||e.start_date)?.split('T')[0]
      return dateStr >= start && dateStr <= end
    })
  }

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  const days = getDaysInMonth(currentDate)
  const today = new Date().toISOString().split('T')[0]

  const upcomingEvents = events.filter(e => new Date(e.start_date) >= new Date()).sort((a,b)=>new Date(a.start_date)-new Date(b.start_date)).slice(0,10)

  const inputStyle = {width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}

      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Calendar size={24} style={{color:'#3b82f6'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Calendar & Scheduler</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Events, leaves, project milestones</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={handleSync} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 14px',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6}}><RefreshCw size={14}/> Sync</button>
          <button onClick={()=>{setShowForm(true);setForm({...form,start_date:selectedDate||today})}} style={{background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}><Plus size={14}/> Add Event</button>
        </div>
      </div>

      <div style={{padding:24,display:'grid',gridTemplateColumns:'1fr 300px',gap:20}}>
        {/* Calendar Grid */}
        <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,overflow:'hidden'}}>
          {/* Month Navigation */}
          <div style={{padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid #334155'}}>
            <button onClick={()=>setCurrentDate(new Date(currentDate.getFullYear(),currentDate.getMonth()-1))} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'6px 10px',cursor:'pointer'}}><ChevronLeft size={16}/></button>
            <h2 style={{color:'#f1f5f9',margin:0,fontSize:18,fontWeight:700}}>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={()=>setCurrentDate(new Date(currentDate.getFullYear(),currentDate.getMonth()+1))} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'6px 10px',cursor:'pointer'}}><ChevronRight size={16}/></button>
          </div>

          {/* Day Headers */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',background:'#0f172a'}}>
            {dayNames.map(d=><div key={d} style={{padding:'10px',textAlign:'center',color:'#64748b',fontSize:12,fontWeight:600,textTransform:'uppercase'}}>{d}</div>)}
          </div>

          {/* Days Grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
            {days.map((day,i)=>{
              const dateStr = day ? day.toISOString().split('T')[0] : null
              const dayEvents = day ? getEventsForDate(day) : []
              const isToday = dateStr === today
              const isSelected = dateStr === selectedDate
              return (
                <div key={i} onClick={()=>day&&setSelectedDate(dateStr)} style={{minHeight:90,padding:6,border:'1px solid #334155',background:isSelected?'#3b82f610':isToday?'#10b98108':'transparent',cursor:day?'pointer':'default',position:'relative'}} onMouseEnter={e=>{if(day)e.currentTarget.style.background='#0f172a'}} onMouseLeave={e=>{e.currentTarget.style.background=isSelected?'#3b82f610':isToday?'#10b98108':'transparent'}}>
                  {day && (
                    <>
                      <div style={{width:28,height:28,borderRadius:'50%',background:isToday?'#3b82f6':'transparent',display:'flex',alignItems:'center',justifyContent:'center',color:isToday?'#fff':'#94a3b8',fontSize:13,fontWeight:isToday?700:400,marginBottom:4}}>{day.getDate()}</div>
                      <div style={{display:'flex',flexDirection:'column',gap:2}}>
                        {dayEvents.slice(0,3).map((e,j)=>(
                          <div key={j} onClick={ev=>{ev.stopPropagation();setSelectedEvent(e)}} style={{background:e.color||'#3b82f6',borderRadius:3,padding:'1px 4px',fontSize:10,color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',cursor:'pointer'}}>{e.title}</div>
                        ))}
                        {dayEvents.length>3 && <div style={{fontSize:10,color:'#64748b'}}>+{dayEvents.length-3} more</div>}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {/* Event Type Legend */}
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16}}>
            <h3 style={{color:'#f1f5f9',margin:'0 0 12px',fontSize:13,fontWeight:600}}>Event Types</h3>
            <div style={{display:'grid',gap:6}}>
              {EVENT_TYPES.map(t=>(
                <div key={t.type} style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:12,height:12,borderRadius:3,background:t.color,flexShrink:0}}></div>
                  <span style={{color:'#94a3b8',fontSize:12}}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Date Events */}
          {selectedDate && (
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <h3 style={{color:'#f1f5f9',margin:0,fontSize:13,fontWeight:600}}>{new Date(selectedDate+'T12:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'long'})}</h3>
                <button onClick={()=>{setShowForm(true);setForm({...form,start_date:selectedDate})}} style={{background:'#3b82f620',border:'none',borderRadius:6,color:'#3b82f6',padding:'4px 8px',cursor:'pointer',fontSize:11}}>+ Add</button>
              </div>
              {getEventsForDate(new Date(selectedDate+'T12:00:00')).length===0
                ? <div style={{color:'#475569',fontSize:12,textAlign:'center',padding:'12px 0'}}>No events</div>
                : getEventsForDate(new Date(selectedDate+'T12:00:00')).map((e,i)=>(
                  <div key={i} onClick={()=>setSelectedEvent(e)} style={{padding:'8px 10px',borderRadius:6,cursor:'pointer',borderLeft:`3px solid ${e.color||'#3b82f6'}`,background:'#0f172a',marginBottom:6}}>
                    <div style={{color:'#f1f5f9',fontSize:12,fontWeight:600}}>{e.title}</div>
                    <div style={{color:'#64748b',fontSize:11,textTransform:'capitalize'}}>{e.event_type}</div>
                  </div>
                ))
              }
            </div>
          )}

          {/* Upcoming Events */}
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,flex:1}}>
            <h3 style={{color:'#f1f5f9',margin:'0 0 12px',fontSize:13,fontWeight:600}}>Upcoming Events</h3>
            {upcomingEvents.length===0
              ? <div style={{color:'#475569',fontSize:12,textAlign:'center',padding:'20px 0'}}>No upcoming events</div>
              : upcomingEvents.map((e,i)=>(
                <div key={i} onClick={()=>setSelectedEvent(e)} style={{padding:'8px 0',borderBottom:'1px solid #334155',cursor:'pointer',display:'flex',gap:10,alignItems:'flex-start'}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:e.color||'#3b82f6',flexShrink:0,marginTop:4}}></div>
                  <div style={{flex:1}}>
                    <div style={{color:'#f1f5f9',fontSize:12,fontWeight:500}}>{e.title}</div>
                    <div style={{color:'#64748b',fontSize:11}}>{new Date(e.start_date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setSelectedEvent(null)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:400}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:12,height:12,borderRadius:3,background:selectedEvent.color||'#3b82f6'}}></div>
                <h2 style={{color:'#f1f5f9',margin:0,fontSize:16}}>{selectedEvent.title}</h2>
              </div>
              <button onClick={()=>setSelectedEvent(null)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={16}/></button>
            </div>
            {[
              ['Type', selectedEvent.event_type],
              ['Start', new Date(selectedEvent.start_date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})],
              ['End', selectedEvent.end_date?new Date(selectedEvent.end_date).toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'}):'Same day'],
              ['Description', selectedEvent.description||'No description'],
            ].map(([l,v])=>(
              <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #334155',fontSize:13}}>
                <span style={{color:'#64748b'}}>{l}</span><span style={{color:'#f1f5f9'}}>{v}</span>
              </div>
            ))}
            <button onClick={()=>handleDelete(selectedEvent.event_id)} style={{width:'100%',background:'#ef444420',border:'1px solid #ef444440',borderRadius:8,color:'#ef4444',padding:'10px',cursor:'pointer',fontWeight:600,marginTop:16}}>Delete Event</button>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:480}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:20}}>
              <h2 style={{color:'#f1f5f9',margin:0}}>Add Event</h2>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button>
            </div>
            <div style={{display:'grid',gap:12}}>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} style={inputStyle}/></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Event Type</label>
                <select value={form.event_type} onChange={e=>{const t=EVENT_TYPES.find(x=>x.type===e.target.value);setForm({...form,event_type:e.target.value,color:t?.color||'#3b82f6'})}} style={inputStyle}>
                  {EVENT_TYPES.map(t=><option key={t.type} value={t.type}>{t.label}</option>)}
                </select></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Start Date *</label><input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} style={inputStyle}/></div>
                <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>End Date</label><input type="date" value={form.end_date} onChange={e=>setForm({...form,end_date:e.target.value})} style={inputStyle}/></div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <input type="checkbox" checked={form.all_day} onChange={e=>setForm({...form,all_day:e.target.checked})} id="allday"/>
                <label htmlFor="allday" style={{color:'#94a3b8',fontSize:13,cursor:'pointer'}}>All Day Event</label>
              </div>
              {!form.all_day && (
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Start Time</label><input type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} style={inputStyle}/></div>
                  <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>End Time</label><input type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} style={inputStyle}/></div>
                </div>
              )}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Description</label><textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={2} style={{...inputStyle,resize:'vertical'}}/></div>
            </div>
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleCreate} style={{flex:2,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>Create Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}