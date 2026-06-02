import { useState, useEffect } from 'react'
import { X, Download, TrendingUp, TrendingDown, BarChart3, FileText, Calendar, Users } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const API_BASE = 'https://finance-backend-so86.onrender.com/api/v1'

export default function ReportViewer({ report, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!report) return
    const id = report.report_id || report.id
    fetch(`${API_BASE}/report-viewer/${id}`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    }).then(r => r.json()).then(d => {
      setData(d?.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [report])

  if (!report) return null

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}} onClick={onClose}>
      <div style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:16,width:'90%',maxWidth:900,maxHeight:'90vh',overflowY:'auto'}} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 24px',borderBottom:'1px solid #e2e8f0'}}>
          <div>
            <h2 style={{color:'#0f172a',margin:0,fontSize:18}}>{report.name}</h2>
            <div style={{display:'flex',gap:12,marginTop:6}}>
              <span style={{background:'#ffffff',color:'#475569',padding:'2px 10px',borderRadius:20,fontSize:11}}>{report.domain}</span>
              <span style={{background:'#ffffff',color:'#475569',padding:'2px 10px',borderRadius:20,fontSize:11}}>{report.frequency}</span>
              <span style={{background:report.complianceStatus==='Required'?'#ef444420':'#10b98120',color:report.complianceStatus==='Required'?'#ef4444':'#10b981',padding:'2px 10px',borderRadius:20,fontSize:11}}>{report.complianceStatus||report.compliance_status||'Optional'}</span>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => alert('PDF export coming soon')} style={{display:'flex',alignItems:'center',gap:6,background:'#3b82f6',border:'none',borderRadius:8,color:'#fff',padding:'8px 14px',cursor:'pointer',fontSize:12,fontWeight:600}}>
              <Download size={14}/> Export PDF
            </button>
            <button onClick={onClose} style={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8,color:'#475569',padding:'8px 12px',cursor:'pointer'}}>
              <X size={16}/>
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{padding:40,textAlign:'center',color:'#64748b'}}>Loading report data...</div>
        ) : data ? (
          <div style={{padding:24}}>

            {/* KPI Metrics */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
              {data.metrics.map((m, i) => (
                <div key={i} style={{background:'#ffffff',borderRadius:10,padding:16,borderTop:`3px solid ${m.color}`}}>
                  <div style={{fontSize:11,color:'#64748b',marginBottom:4}}>{m.label}</div>
                  <div style={{fontSize:22,fontWeight:700,color:m.color}}>{m.value}</div>
                  <div style={{fontSize:11,color:m.change.startsWith('-')?'#ef4444':'#10b981',marginTop:4}}>{m.change}</div>
                </div>
              ))}
            </div>

            {/* Trend Chart */}
            <div style={{background:'#ffffff',borderRadius:10,padding:20,marginBottom:24}}>
              <h3 style={{color:'#0f172a',marginBottom:16,fontSize:14}}>{data.chartLabel} - 6 Month Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                  <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:11}}/>
                  <YAxis tick={{fill:'#64748b',fontSize:11}}/>
                  <Tooltip contentStyle={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8}}/>
                  <ReferenceLine y={85} stroke="#f59e0b" strokeDasharray="3 3" label={{value:'Target',fill:'#f59e0b',fontSize:10}}/>
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{fill:'#3b82f6'}} name="Actual"/>
                  <Line type="monotone" dataKey="previous" stroke="#64748b" strokeWidth={1} strokeDasharray="4 4" name="Previous"/>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div style={{background:'#ffffff',borderRadius:10,padding:20,marginBottom:24}}>
              <h3 style={{color:'#0f172a',marginBottom:16,fontSize:14}}>Actual vs Target Comparison</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0"/>
                  <XAxis dataKey="month" tick={{fill:'#64748b',fontSize:11}}/>
                  <YAxis tick={{fill:'#64748b',fontSize:11}}/>
                  <Tooltip contentStyle={{background:'#ffffff',border:'1px solid #e2e8f0',borderRadius:8}}/>
                  <Bar dataKey="value" fill="#3b82f6" name="Actual" radius={[4,4,0,0]}/>
                  <Bar dataKey="target" fill="#f59e0b" name="Target" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Data Table */}
            <div style={{background:'#ffffff',borderRadius:10,padding:20}}>
              <h3 style={{color:'#0f172a',marginBottom:16,fontSize:14}}>Monthly Data Breakdown</h3>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid #e2e8f0'}}>
                    {['Month','Actual','Target','Variance','Status'].map(h => (
                      <th key={h} style={{color:'#64748b',fontSize:11,padding:'8px',textAlign:'left',textTransform:'uppercase'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.tableData.map((row, i) => (
                    <tr key={i} style={{borderBottom:'1px solid #1e293b'}}>
                      <td style={{color:'#0f172a',padding:'10px 8px',fontSize:13}}>{row.month}</td>
                      <td style={{color:'#3b82f6',padding:'10px 8px',fontSize:13,fontWeight:600}}>{row.actual}%</td>
                      <td style={{color:'#f59e0b',padding:'10px 8px',fontSize:13}}>{row.target}%</td>
                      <td style={{color:row.variance>=0?'#10b981':'#ef4444',padding:'10px 8px',fontSize:13}}>{row.variance>=0?'+':''}{row.variance}%</td>
                      <td style={{padding:'10px 8px'}}>
                        <span style={{background:row.status==='On Track'?'#10b98120':'#ef444420',color:row.status==='On Track'?'#10b981':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:11}}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        ) : (
          <div style={{padding:40,textAlign:'center',color:'#64748b'}}>Failed to load report data</div>
        )}
      </div>
    </div>
  )
}
