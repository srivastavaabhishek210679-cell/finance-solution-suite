import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, ArrowLeft, Plus, X, Edit, DollarSign } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/sales-pipeline'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const STAGES = ['Prospecting','Qualification','Demonstration','Proposal','Negotiation','Closed Won','Closed Lost']
const STAGE_COLOR = { Prospecting:'#64748b', Qualification:'#3b82f6', Demonstration:'#8b5cf6', Proposal:'#f59e0b', Negotiation:'#f97316', 'Closed Won':'#10b981', 'Closed Lost':'#ef4444' }
const SOURCES = ['Website','Referral','Cold Call','LinkedIn','Conference','Email','Existing Customer','Other']

export default function SalesPipeline() {
  const navigate = useNavigate()
  const [deals, setDeals] = useState([])
  const [stats, setStats] = useState(null)
  const [view, setView] = useState('kanban')
  const [showForm, setShowForm] = useState(false)
  const [editDeal, setEditDeal] = useState(null)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({deal_name:'',company_name:'',contact_name:'',deal_value:0,stage:'Prospecting',probability:20,expected_close:'',assigned_to:'',source:'Website',notes:''})

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),3000) }

  const load = async () => {
    try {
      const [dRes, sRes] = await Promise.all([fetch(API, {headers:getHeaders()}), fetch(API+'/stats', {headers:getHeaders()})])
      const [d, s] = await Promise.all([dRes.json(), sRes.json()])
      setDeals(d.data||[]); setStats(s.data||null)
    } catch(e) { showToast('Failed to load','error') }
  }

  useEffect(()=>{ load() },[])

  const handleSave = async () => {
    const url = editDeal ? API+'/'+editDeal.deal_id : API
    const method = editDeal ? 'PUT' : 'POST'
    const res = await fetch(url, {method, headers:getHeaders(), body:JSON.stringify(form)})
    const data = await res.json()
    if(data.status==='success') { showToast(editDeal?'Deal updated!':'Deal created!'); setShowForm(false); setEditDeal(null); load() }
    else showToast(data.message,'error')
  }

  const handleStageUpdate = async (deal, newStage) => {
    const prob = { Prospecting:10, Qualification:25, Demonstration:40, Proposal:60, Negotiation:80, 'Closed Won':100, 'Closed Lost':0 }
    await fetch(API+'/'+deal.deal_id, {method:'PUT', headers:getHeaders(), body:JSON.stringify({...deal, stage:newStage, probability:prob[newStage]||deal.probability})})
    load()
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      {toast && <div style={{position:'fixed',top:20,right:20,background:toast.type==='success'?'#10b981':'#ef4444',color:'#fff',padding:'12px 20px',borderRadius:10,zIndex:9999,fontWeight:600}}>{toast.msg}</div>}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate('/dashboard')} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <TrendingUp size={28} style={{color:'#10b981'}}/>
        <div><h1 style={{margin:0,fontSize:20,fontWeight:700}}>Sales Pipeline</h1><p style={{margin:0,fontSize:12,color:'#64748b'}}>Track deals, stages and revenue forecast</p></div>
        <div style={{marginLeft:'auto',display:'flex',gap:10}}>
          <div style={{display:'flex',gap:4,background:'#0f172a',padding:4,borderRadius:8}}>
            {['kanban','list'].map(v=><button key={v} onClick={()=>setView(v)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:view===v?'#334155':'transparent',color:view===v?'#f1f5f9':'#64748b',cursor:'pointer',fontSize:12,textTransform:'capitalize'}}>{v}</button>)}
          </div>
          <button onClick={()=>{setShowForm(true);setEditDeal(null);setForm({deal_name:'',company_name:'',contact_name:'',deal_value:0,stage:'Prospecting',probability:20,expected_close:'',assigned_to:'',source:'Website',notes:''})}} style={{display:'flex',alignItems:'center',gap:6,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px 16px',cursor:'pointer',fontWeight:600}}><Plus size={14}/> New Deal</button>
        </div>
      </div>

      <div style={{padding:24}}>
        {stats && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
            {[
              {label:'Total Pipeline', value:'₹'+Number(stats.pipelineValue||0).toLocaleString(), color:'#3b82f6'},
              {label:'Deals Won', value:'₹'+Number(stats.wonValue||0).toLocaleString(), color:'#10b981'},
              {label:'Forecast Revenue', value:'₹'+Number(stats.forecast||0).toLocaleString(), color:'#8b5cf6'},
              {label:'Total Deals', value:stats.total, color:'#f59e0b'},
            ].map((s,i)=>(
              <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,borderTop:`3px solid ${s.color}`}}>
                <div style={{fontSize:12,color:'#64748b',marginBottom:6}}>{s.label}</div>
                <div style={{fontSize:20,fontWeight:700,color:s.color}}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {stats?.byStage?.length > 0 && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:20}}>
            <h3 style={{color:'#f1f5f9',marginBottom:16,fontSize:14}}>Pipeline by Stage (₹ Lakhs)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={stats.byStage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                <XAxis dataKey="stage" tick={{fill:'#64748b',fontSize:10}}/>
                <YAxis tick={{fill:'#64748b',fontSize:10}} tickFormatter={v=>'₹'+Number(v/100000).toFixed(0)+'L'}/>
                <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155'}} formatter={v=>['₹'+Number(v).toLocaleString(),'']}/>
                <Bar dataKey="value" fill="#10b981" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {view==='kanban' && (
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:8,overflowX:'auto'}}>
            {STAGES.map(stage=>(
              <div key={stage} style={{background:'#1e293b',borderRadius:10,padding:10,minHeight:300}}>
                <div style={{marginBottom:10}}>
                  <div style={{fontSize:11,fontWeight:600,color:STAGE_COLOR[stage],marginBottom:4}}>{stage}</div>
                  <div style={{fontSize:11,color:'#64748b'}}>{deals.filter(d=>d.stage===stage).length} deals</div>
                </div>
                {deals.filter(d=>d.stage===stage).map(deal=>(
                  <div key={deal.deal_id} style={{background:'#0f172a',borderRadius:8,padding:10,marginBottom:8,border:`1px solid ${STAGE_COLOR[stage]}30`}}>
                    <div style={{fontSize:12,color:'#f1f5f9',fontWeight:600,marginBottom:4}}>{deal.deal_name}</div>
                    <div style={{fontSize:10,color:'#64748b',marginBottom:6}}>{deal.company_name}</div>
                    <div style={{fontSize:13,color:'#10b981',fontWeight:700,marginBottom:6}}>₹{Number(deal.deal_value).toLocaleString()}</div>
                    <div style={{fontSize:10,color:'#64748b',marginBottom:6}}>{deal.probability}% probability</div>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      {stage!=='Closed Won' && stage!=='Closed Lost' && (
                        <button onClick={()=>handleStageUpdate(deal, STAGES[STAGES.indexOf(stage)+1])} style={{background:'#334155',border:'none',borderRadius:4,color:'#94a3b8',padding:'2px 6px',cursor:'pointer',fontSize:9}}>→ Next</button>
                      )}
                      <button onClick={()=>{setEditDeal(deal);setForm(deal);setShowForm(true)}} style={{background:'#334155',border:'none',borderRadius:4,color:'#94a3b8',padding:'2px 6px',cursor:'pointer',fontSize:9}}><Edit size={8}/></button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {view==='list' && (
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid #334155'}}>{['Deal','Company','Contact','Value','Stage','Probability','Close Date','Assigned To',''].map(h=><th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
              <tbody>
                {deals.map(d=>(
                  <tr key={d.deal_id} style={{borderBottom:'1px solid #0f172a'}}>
                    <td style={{padding:'10px 8px',color:'#f1f5f9',fontWeight:600,fontSize:13}}>{d.deal_name}</td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{d.company_name}</td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{d.contact_name}</td>
                    <td style={{padding:'10px 8px',color:'#10b981',fontWeight:700}}>₹{Number(d.deal_value).toLocaleString()}</td>
                    <td style={{padding:'10px 8px'}}><span style={{background:STAGE_COLOR[d.stage]+'20',color:STAGE_COLOR[d.stage],padding:'2px 8px',borderRadius:20,fontSize:11}}>{d.stage}</span></td>
                    <td style={{padding:'10px 8px',color:'#f59e0b',fontWeight:600}}>{d.probability}%</td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{d.expected_close?.slice(0,10)}</td>
                    <td style={{padding:'10px 8px',color:'#94a3b8',fontSize:12}}>{d.assigned_to}</td>
                    <td style={{padding:'10px 8px'}}><button onClick={()=>{setEditDeal(d);setForm(d);setShowForm(true)}} style={{background:'#334155',border:'none',borderRadius:6,color:'#94a3b8',padding:'4px 8px',cursor:'pointer',fontSize:12}}><Edit size={12}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={()=>setShowForm(false)}>
          <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:16,padding:24,width:560}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}><h2 style={{color:'#f1f5f9',margin:0}}>{editDeal?'Edit Deal':'New Deal'}</h2><button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'#94a3b8',cursor:'pointer'}}><X size={20}/></button></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[['deal_name','Deal Name'],['company_name','Company'],['contact_name','Contact'],['deal_value','Deal Value','number'],['probability','Probability %','number'],['expected_close','Expected Close','date'],['assigned_to','Assigned To']].map(([key,label,type='text'])=>(
                <div key={key}><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>{label}</label><input type={type} value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/></div>
              ))}
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Stage</label><select value={form.stage} onChange={e=>setForm({...form,stage:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{STAGES.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label style={{fontSize:11,color:'#64748b',display:'block',marginBottom:4}}>Source</label><select value={form.source} onChange={e=>setForm({...form,source:e.target.value})} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13}}>{SOURCES.map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div style={{display:'flex',gap:12,marginTop:20}}>
              <button onClick={()=>setShowForm(false)} style={{flex:1,background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'10px',cursor:'pointer'}}>Cancel</button>
              <button onClick={handleSave} style={{flex:2,background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px',cursor:'pointer',fontWeight:600}}>{editDeal?'Update':'Create Deal'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}