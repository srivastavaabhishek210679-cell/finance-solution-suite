import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Activity } from 'lucide-react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API = 'https://finance-backend-so86.onrender.com/api/v1/live-data'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })
const COLORS = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316']
const CAT_COLOR = { finance:'#10b981', sales:'#3b82f6', supply:'#f59e0b', hr:'#8b5cf6', inventory:'#14b8a6' }

export default function LiveDashboard() {
  const navigate = useNavigate()
  const [kpiRaw, setKPIRaw] = useState([])
  const [charts, setCharts] = useState([])
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [kRes, cRes, lRes] = await Promise.all([
        fetch(API+'/kpis', {headers:getHeaders()}),
        fetch(API+'/charts', {headers:getHeaders()}),
        fetch(API+'/refresh-log', {headers:getHeaders()})
      ])
      const [kData, cData, lData] = await Promise.all([kRes.json(), cRes.json(), lRes.json()])
      setKPIRaw(Array.isArray(kData.raw) ? kData.raw : [])
      setCharts(Array.isArray(cData.data) ? cData.data : [])
      setLog(Array.isArray(lData.data) ? lData.data : [])
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const triggerRefresh = async () => {
    setRefreshing(true)
    try {
      await fetch(API+'/refresh', {method:'POST', headers:getHeaders()})
      setTimeout(() => { loadAll(); setRefreshing(false) }, 8000)
    } catch(e) { setRefreshing(false) }
  }

  const categories = [...new Set(kpiRaw.map(k => k.category))]
  const filteredKPIs = activeCategory === 'all' ? kpiRaw : kpiRaw.filter(k => k.category === activeCategory)
  const filteredCharts = activeCategory === 'all' ? charts : charts.filter(c => c.category === activeCategory)

  const parseChartData = (chart) => {
    try {
      const series = typeof chart.series_data === 'string' ? JSON.parse(chart.series_data) : chart.series_data
      const labels = typeof chart.labels === 'string' ? JSON.parse(chart.labels) : chart.labels
      return { series: series || [], labels: labels || [] }
    } catch(e) { return { series: [], labels: [] } }
  }

  const renderChart = (chart) => {
    const { series, labels } = parseChartData(chart)
    if (!series || series.length === 0) return <div style={{color:'#64748b',textAlign:'center',padding:40}}>No data available</div>

    if (chart.chart_type === 'pie') {
      const pieData = Array.isArray(series) ? series : []
      if (pieData.length === 0) return <div style={{color:'#64748b',textAlign:'center',padding:40}}>No data</div>
      return (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({name,percent})=>name+' '+(percent*100).toFixed(0)+'%'}>
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
            </Pie>
            <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9'}}/>
            <Legend/>
          </PieChart>
        </ResponsiveContainer>
      )
    }

    if (chart.chart_type === 'line' && Array.isArray(series) && Array.isArray(labels)) {
      const chartData = labels.map((label, i) => {
        const point = { name: label }
        series.forEach(s => { if(s && s.name) point[s.name] = (s.data && s.data[i]) || 0 })
        return point
      })
      return (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
            <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}}/>
            <YAxis tick={{fill:'#64748b',fontSize:10}}/>
            <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9'}}/>
            <Legend/>
            {series.map((s, i) => s && <Line key={i} type="monotone" dataKey={s.name} stroke={COLORS[i%COLORS.length]} strokeWidth={2}/>)}
          </LineChart>
        </ResponsiveContainer>
      )
    }
    return <div style={{color:'#64748b',textAlign:'center',padding:40}}>Unsupported chart type</div>
  }

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Activity size={24} style={{color:'#10b981'}}/>
        <div>
          <h1 style={{margin:0,fontSize:20,fontWeight:700}}>Live Analytics Dashboard</h1>
          <p style={{margin:0,fontSize:12,color:'#64748b'}}>Real-time data refreshed every 2 hours</p>
        </div>
        <button onClick={triggerRefresh} disabled={refreshing} style={{marginLeft:'auto',background:refreshing?'#334155':'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'8px 16px',cursor:refreshing?'not-allowed':'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',gap:6}}>
          <RefreshCw size={14}/> {refreshing?'Refreshing...':'Refresh Now'}
        </button>
      </div>

      <div style={{padding:24}}>
        <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
          {['all',...categories].map(cat=>(
            <button key={cat} onClick={()=>setActiveCategory(cat)} style={{padding:'6px 16px',borderRadius:20,border:'1px solid '+(activeCategory===cat?CAT_COLOR[cat]||'#10b981':'#334155'),background:activeCategory===cat?(CAT_COLOR[cat]||'#10b981')+'20':'transparent',color:activeCategory===cat?(CAT_COLOR[cat]||'#10b981'):'#64748b',cursor:'pointer',fontSize:13}}>
              {cat==='all'?'All':cat.charAt(0).toUpperCase()+cat.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{textAlign:'center',padding:80,color:'#64748b'}}>
            <div style={{width:48,height:48,border:'3px solid #334155',borderTop:'3px solid #10b981',borderRadius:'50%',margin:'0 auto 16px',animation:'spin 1s linear infinite'}}></div>
            <p>Loading live data...</p>
          </div>
        ) : (
          <>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginBottom:24}}>
              {filteredKPIs.map((kpi, i) => (
                <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:16,borderTop:`3px solid ${CAT_COLOR[kpi.category]||'#64748b'}`}}>
                  <div style={{fontSize:11,color:'#64748b',marginBottom:4,textTransform:'uppercase'}}>{kpi.metric_name}</div>
                  <div style={{fontSize:22,fontWeight:700,color:CAT_COLOR[kpi.category]||'#f1f5f9'}}>{kpi.metric_text||kpi.metric_value}</div>
                  <div style={{fontSize:11,color:'#475569',marginTop:4}}>{kpi.category}</div>
                </div>
              ))}
            </div>

            {filteredCharts.length > 0 && (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(480px,1fr))',gap:20,marginBottom:24}}>
                {filteredCharts.map(chart => (
                  <div key={chart.chart_id} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
                      <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>{chart.chart_name}</h3>
                      <span style={{background:'#334155',color:'#94a3b8',padding:'2px 8px',borderRadius:20,fontSize:11}}>{chart.chart_type}</span>
                    </div>
                    {renderChart(chart)}
                    <div style={{fontSize:11,color:'#475569',marginTop:8,textAlign:'right'}}>Updated: {new Date(chart.generated_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}

            {log.length > 0 && (
              <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20}}>
                <h3 style={{color:'#f1f5f9',margin:'0 0 14px',fontSize:14,fontWeight:600}}>Refresh History</h3>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead><tr style={{borderBottom:'1px solid #334155'}}>
                    {['Source','Completed','Status','Records'].map(h=><th key={h} style={{color:'#64748b',padding:'8px',textAlign:'left',fontSize:11,textTransform:'uppercase'}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {log.slice(0,10).map((l, i) => (
                      <tr key={i} style={{borderBottom:'1px solid #0f172a'}}>
                        <td style={{padding:'8px',color:'#f1f5f9'}}>{l.source_name}</td>
                        <td style={{padding:'8px',color:'#64748b'}}>{l.completed_at?new Date(l.completed_at).toLocaleString():'-'}</td>
                        <td style={{padding:'8px'}}><span style={{background:l.status==='success'?'#10b98120':'#ef444420',color:l.status==='success'?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20}}>{l.status}</span></td>
                        <td style={{padding:'8px',color:'#94a3b8'}}>{l.records_processed||0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredKPIs.length === 0 && filteredCharts.length === 0 && (
              <div style={{textAlign:'center',padding:80,color:'#64748b'}}>
                <div style={{fontSize:48,marginBottom:16}}>📊</div>
                <h3 style={{color:'#f1f5f9',margin:'0 0 8px'}}>No live data yet</h3>
                <p style={{margin:'0 0 20px'}}>Click Refresh Now to fetch live data</p>
                <button onClick={triggerRefresh} style={{background:'#10b981',border:'none',borderRadius:8,color:'#fff',padding:'10px 24px',cursor:'pointer',fontWeight:600}}>Refresh Now</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}