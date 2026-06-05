import { useState } from 'react'
import { X, Download, BarChart3, TrendingUp, DollarSign, FileText } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#10b981','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#14b8a6','#f97316','#06b6d4']

export default function ReportViewerModal({ report, onClose }) {
  const [activeChart, setActiveChart] = useState('bar')
  if(!report) return null

  const summary = report.report_data?.summary || {}
  const rawData = report.report_data?.data || []
  const data = Array.isArray(rawData) ? rawData : []

  // Build chart data from report data
  const chartData = data.slice(0,12).map((row,i) => {
    const keys = Object.keys(row)
    const numKeys = keys.filter(k => !isNaN(parseFloat(row[k])))
    return {
      name: String(Object.values(row)[0]).slice(0,10) || 'Item '+(i+1),
      ...numKeys.reduce((acc,k) => ({...acc, [k]: parseFloat(row[k])||0}), {})
    }
  })

  const numericKeys = chartData.length > 0 ? Object.keys(chartData[0]).filter(k => k !== 'name') : []

  // Summary cards
  const summaryEntries = typeof summary === 'object' ? Object.entries(summary) : []

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}>
      <div style={{background:'#0f172a',border:'1px solid #334155',borderRadius:16,width:'95%',maxWidth:1100,maxHeight:'92vh',overflowY:'auto',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16,borderRadius:'16px 16px 0 0',flexShrink:0}}>
          <div style={{width:40,height:40,background:'linear-gradient(135deg,#10b981,#3b82f6)',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>📊</div>
          <div style={{flex:1}}>
            <h2 style={{margin:0,fontSize:16,fontWeight:700,color:'#f1f5f9'}}>{report.report_name}</h2>
            <p style={{margin:0,fontSize:11,color:'#64748b'}}>{report.domain_name} • {new Date(report.run_at).toLocaleString()} • {report.total_records} records</p>
          </div>
          <button onClick={onClose} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',width:32,height:32,cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
        </div>

        <div style={{padding:20,flex:1}}>

          {/* Summary KPI Cards */}
          {summaryEntries.length > 0 && (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
              {summaryEntries.map(([key,val],i)=>(
                <div key={key} style={{background:'#1e293b',borderRadius:12,padding:16,borderTop:`3px solid ${COLORS[i%COLORS.length]}`}}>
                  <div style={{fontSize:11,color:'#64748b',marginBottom:6,textTransform:'uppercase',letterSpacing:'0.5px'}}>{key.replace(/([A-Z])/g,' $1').replace(/_/g,' ').trim()}</div>
                  <div style={{fontSize:20,fontWeight:700,color:COLORS[i%COLORS.length]}}>{String(val)}</div>
                </div>
              ))}
            </div>
          )}

          {/* Chart Section */}
          {chartData.length > 0 && numericKeys.length > 0 && (
            <div style={{background:'#1e293b',borderRadius:12,padding:20,marginBottom:20}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h3 style={{color:'#f1f5f9',margin:0,fontSize:14,fontWeight:600}}>Data Visualization</h3>
                <div style={{display:'flex',gap:6}}>
                  {['bar','line','pie'].map(type=>(
                    <button key={type} onClick={()=>setActiveChart(type)} style={{background:activeChart===type?'#3b82f6':'#334155',border:'none',borderRadius:6,color:activeChart===type?'#fff':'#94a3b8',padding:'4px 12px',cursor:'pointer',fontSize:12,textTransform:'capitalize'}}>{type}</button>
                  ))}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={280}>
                {activeChart==='bar' ? (
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                    <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}}/>
                    <YAxis tick={{fill:'#64748b',fontSize:10}}/>
                    <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9'}}/>
                    <Legend/>
                    {numericKeys.slice(0,4).map((key,i)=>(
                      <Bar key={key} dataKey={key} fill={COLORS[i%COLORS.length]} radius={[4,4,0,0]}/>
                    ))}
                  </BarChart>
                ) : activeChart==='line' ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155"/>
                    <XAxis dataKey="name" tick={{fill:'#64748b',fontSize:10}}/>
                    <YAxis tick={{fill:'#64748b',fontSize:10}}/>
                    <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9'}}/>
                    <Legend/>
                    {numericKeys.slice(0,4).map((key,i)=>(
                      <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i%COLORS.length]} strokeWidth={2} dot={{fill:COLORS[i%COLORS.length]}}/>
                    ))}
                  </LineChart>
                ) : (
                  <PieChart>
                    <Pie data={chartData.slice(0,8)} dataKey={numericKeys[0]} nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`}>
                      {chartData.slice(0,8).map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip contentStyle={{background:'#1e293b',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9'}}/>
                    <Legend/>
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          )}

          {/* Data Table */}
          {data.length > 0 && (
            <div style={{background:'#1e293b',borderRadius:12,padding:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 14px',fontSize:14,fontWeight:600}}>Data Table ({data.length} records)</h3>
              <div style={{overflowX:'auto',maxHeight:250,overflowY:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead style={{position:'sticky',top:0,background:'#0f172a'}}>
                    <tr>
                      {Object.keys(data[0]).map(h=>(
                        <th key={h} style={{padding:'8px 12px',textAlign:'left',color:'#64748b',fontWeight:600,textTransform:'uppercase',fontSize:10,whiteSpace:'nowrap',borderBottom:'1px solid #334155'}}>{h.replace(/_/g,' ')}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row,i)=>(
                      <tr key={i} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#1e293b':'#0f172a'}}>
                        {Object.values(row).map((val,j)=>(
                          <td key={j} style={{padding:'8px 12px',color:'#f1f5f9',whiteSpace:'nowrap'}}>{String(val)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No data fallback */}
          {data.length === 0 && summaryEntries.length === 0 && (
            <div style={{textAlign:'center',padding:60,color:'#64748b'}}>
              <div style={{fontSize:48,marginBottom:12}}>📊</div>
              <p style={{fontSize:14}}>No data available for preview.</p>
              <p style={{fontSize:12}}>Generate a new report by uploading data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}