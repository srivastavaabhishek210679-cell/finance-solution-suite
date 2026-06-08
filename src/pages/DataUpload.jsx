import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, CheckCircle, AlertCircle, Download, ArrowLeft, RefreshCw } from 'lucide-react'
import { exportToPDF } from '../utils/pdfExport'
import * as XLSX from 'xlsx'

const API = 'https://finance-backend-so86.onrender.com/api/v1'
const getHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + localStorage.getItem('token') })

const detectReportType = (headers) => {
  const h = headers.map(h => h.toLowerCase()).join(' ')
  if (h.match(/salary|payroll|wage|compensation|pf|esi|tds/)) return 'Payroll Report'
  if (h.match(/revenue|profit|expense|budget|forecast|cost|invoice|payment|tax/)) return 'Financial Report'
  if (h.match(/sales|deal|pipeline|customer|lead|opportunity|conversion/)) return 'Sales Report'
  if (h.match(/inventory|stock|warehouse|sku|product|quantity|reorder/)) return 'Inventory Report'
  if (h.match(/employee|attendance|leave|performance|training|hr/)) return 'HR Report'
  if (h.match(/project|milestone|task|deadline|resource|sprint/)) return 'Project Report'
  if (h.match(/risk|compliance|audit|regulation|policy|control/)) return 'Compliance Report'
  if (h.match(/vendor|supplier|purchase|procurement|po\b/)) return 'Supply Chain Report'
  if (h.match(/asset|depreciation|maintenance|equipment/)) return 'Asset Report'
  if (h.match(/ticket|helpdesk|support|incident|resolution/)) return 'Helpdesk Report'
  return 'General Report'
}

const generateSummary = (data, headers) => {
  const summary = { 'Total Records': data.length }
  headers.forEach(h => {
    const vals = data.map(r => parseFloat(r[h])).filter(v => !isNaN(v) && isFinite(v))
    if (vals.length > 0 && vals.length >= data.length * 0.3) {
      summary['Total ' + h] = vals.reduce((a, b) => a + b, 0).toFixed(2)
      summary['Average ' + h] = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2)
      summary['Max ' + h] = Math.max(...vals).toFixed(2)
      summary['Min ' + h] = Math.min(...vals).toFixed(2)
    }
  })
  return summary
}

export default function DataUpload() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [rawData, setRawData] = useState([])
  const [headers, setHeaders] = useState([])
  const [reportType, setReportType] = useState('')
  const [reportName, setReportName] = useState('')
  const [columnTypes, setColumnTypes] = useState({})
  const [processing, setProcessing] = useState(false)
  const [generatedReport, setGeneratedReport] = useState(null)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target.result
          const wb = XLSX.read(data, { type: 'binary' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          const json = XLSX.utils.sheet_to_json(ws, { defval: '' })
          resolve(json)
        } catch (err) { reject(err) }
      }
      reader.onerror = () => reject(new Error('File read error'))
      reader.readAsBinaryString(file)
    })
  }

  const detectColumnTypes = (data, headers) => {
    const types = {}
    headers.forEach(h => {
      const vals = data.slice(0, 20).map(r => r[h])
      const numCount = vals.filter(v => !isNaN(parseFloat(v)) && isFinite(v)).length
      const dateCount = vals.filter(v => !isNaN(Date.parse(String(v)))).length
      if (numCount >= vals.length * 0.7) types[h] = 'numeric'
      else if (dateCount >= vals.length * 0.7) types[h] = 'date'
      else types[h] = 'text'
    })
    return types
  }

  const handleFile = async (file) => {
    const allowed = ['.csv', '.xlsx', '.xls', '.txt']
    const ext = '.' + file.name.split('.').pop().toLowerCase()
    if (!allowed.includes(ext)) { setError('Only CSV, Excel and text files are supported'); return }
    setError(null)
    setProcessing(true)
    try {
      const data = await readFile(file)
      if (!data || data.length === 0) throw new Error('No data found in file')
      const hdrs = Object.keys(data[0])
      const detected = detectReportType(hdrs)
      const types = detectColumnTypes(data, hdrs)
      setUploadedFile(file)
      setRawData(data)
      setHeaders(hdrs)
      setReportType(detected)
      setReportName(file.name.replace(/\.[^.]+$/, '') + ' - ' + detected)
      setColumnTypes(types)
      setStep(2)
    } catch (e) { setError(e.message) }
    setProcessing(false)
  }

  const handleGenerate = async () => {
    setProcessing(true)
    try {
      const summary = generateSummary(rawData, headers)
      const report = {
        report_name: reportName,
        domain_name: reportType,
        template_id: reportType.toLowerCase().replace(/ /g, '_'),
        total_records: rawData.length,
        file_name: uploadedFile.name,
        report_data: { summary, data: rawData.slice(0, 500) },
        notes: 'Auto-generated from ' + uploadedFile.name
      }
      const res = await fetch(API + '/workspace/save-report', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(report)
      })
      const result = await res.json()
      setGeneratedReport({ ...report, history_id: result.data?.history_id })
      setStep(3)
    } catch (e) { setError('Failed to generate report: ' + e.message) }
    setProcessing(false)
  }

  const downloadCSV = () => {
    const hdrs = headers.join(',')
    const rows = rawData.map(r => headers.map(h => '"' + String(r[h] || '').replace(/"/g, '""') + '"').join(','))
    const csv = [hdrs, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = reportName + '.csv'; a.click()
  }

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(rawData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Report')
    XLSX.writeFile(wb, reportName + '.xlsx')
  }

  const downloadPDF = () => {
    exportToPDF({
      report_name: reportName,
      domain_name: reportType,
      run_at: new Date().toISOString(),
      total_records: rawData.length,
      report_data: { summary: generateSummary(rawData, headers), data: rawData.slice(0, 100) }
    })
  }

  const numericCols = headers.filter(h => columnTypes[h] === 'numeric')
  const textCols = headers.filter(h => columnTypes[h] === 'text')
  const dateCols = headers.filter(h => columnTypes[h] === 'date')

  return (
    <div style={{minHeight:'100vh',background:'#0f172a',color:'#f1f5f9',fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'16px 24px',display:'flex',alignItems:'center',gap:16}}>
        <button onClick={()=>navigate(-1)} style={{background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:6}}><ArrowLeft size={16}/> Back</button>
        <Upload size={22} style={{color:'#10b981'}}/>
        <div>
          <h1 style={{margin:0,fontSize:18,fontWeight:700}}>Smart Data Upload</h1>
          <p style={{margin:0,fontSize:12,color:'#64748b'}}>Upload any file — columns auto-detected, report generated instantly</p>
        </div>
        {step > 1 && <button onClick={()=>{setStep(1);setUploadedFile(null);setRawData([]);setGeneratedReport(null);setError(null)}} style={{marginLeft:'auto',background:'#334155',border:'none',borderRadius:8,color:'#94a3b8',padding:'8px 14px',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',gap:6}}><RefreshCw size={14}/> Upload New</button>}
      </div>

      {/* Progress */}
      <div style={{background:'#1e293b',borderBottom:'1px solid #334155',padding:'12px 24px',display:'flex',gap:0}}>
        {['Upload File','Review Columns','Generate Report'].map((s,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',flex:i<2?1:'auto'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:28,height:28,borderRadius:'50%',background:step>i+1?'#10b981':step===i+1?'#3b82f6':'#334155',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700}}>{step>i+1?'✓':i+1}</div>
              <span style={{fontSize:13,color:step===i+1?'#f1f5f9':step>i+1?'#10b981':'#64748b'}}>{s}</span>
            </div>
            {i<2 && <div style={{flex:1,height:1,background:step>i+1?'#10b981':'#334155',margin:'0 12px'}}></div>}
          </div>
        ))}
      </div>

      <div style={{padding:24,maxWidth:900,margin:'0 auto'}}>
        {error && <div style={{background:'#ef444420',border:'1px solid #ef444440',borderRadius:8,padding:12,marginBottom:16,color:'#ef4444',display:'flex',gap:10,alignItems:'center'}}><AlertCircle size={16}/>{error}</div>}

        {/* STEP 1: Upload */}
        {step===1 && (
          <div>
            <div onDrop={e=>{e.preventDefault();setDragOver(false);const f=e.dataTransfer.files[0];if(f)handleFile(f)}} onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)} onClick={()=>document.getElementById('fileInput').click()} style={{border:`2px dashed ${dragOver?'#10b981':'#334155'}`,borderRadius:16,padding:60,textAlign:'center',cursor:'pointer',background:dragOver?'#10b98110':'#1e293b',transition:'all 0.2s'}}>
              {processing ? (
                <div><div style={{width:48,height:48,border:'3px solid #334155',borderTop:'3px solid #10b981',borderRadius:'50%',margin:'0 auto 16px',animation:'spin 1s linear infinite'}}></div><p style={{color:'#64748b'}}>Reading your file...</p></div>
              ) : (
                <div>
                  <Upload size={48} style={{color:dragOver?'#10b981':'#334155',marginBottom:16}}/>
                  <h2 style={{color:'#f1f5f9',fontSize:20,fontWeight:700,margin:'0 0 8px'}}>Drop your file here</h2>
                  <p style={{color:'#64748b',margin:'0 0 16px'}}>or click to browse</p>
                  <div style={{display:'flex',gap:8,justifyContent:'center'}}>
                    {['.CSV','.XLSX','.XLS','.TXT'].map(ext=><span key={ext} style={{background:'#334155',color:'#94a3b8',padding:'4px 12px',borderRadius:20,fontSize:12}}>{ext}</span>)}
                  </div>
                </div>
              )}
              <input id="fileInput" type="file" accept=".csv,.xlsx,.xls,.txt" style={{display:'none'}} onChange={e=>e.target.files[0]&&handleFile(e.target.files[0])}/>
            </div>

            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginTop:20}}>
              <h3 style={{color:'#f1f5f9',margin:'0 0 12px',fontSize:14}}>How it works:</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[
                  ['Auto Column Detection','All columns from your file are automatically detected regardless of format'],
                  ['Smart Type Detection','Numeric, date and text columns identified automatically'],
                  ['Auto Report Type','Report category detected from column names'],
                  ['Instant Statistics','Sum, average, min, max calculated for all numeric columns'],
                  ['Zero Manual Mapping','No need to manually map any columns'],
                  ['Multiple Export Formats','Download as CSV, Excel or PDF instantly']
                ].map(([title,desc],i)=>(
                  <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                    <CheckCircle size={14} style={{color:'#10b981',flexShrink:0,marginTop:2}}/>
                    <div><div style={{color:'#f1f5f9',fontSize:13,fontWeight:500}}>{title}</div><div style={{color:'#64748b',fontSize:12}}>{desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Review Columns */}
        {step===2 && (
          <div>
            <div style={{background:'#1e293b',border:'1px solid #334155',borderRadius:12,padding:20,marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
                <div>
                  <h3 style={{color:'#f1f5f9',margin:'0 0 4px',fontSize:16}}>File Analyzed Successfully</h3>
                  <p style={{color:'#64748b',margin:0,fontSize:13}}>{uploadedFile?.name} • {rawData.length} records • {headers.length} columns</p>
                </div>
                <span style={{background:'#10b98120',color:'#10b981',padding:'4px 12px',borderRadius:20,fontSize:12,fontWeight:600}}>{reportType}</span>
              </div>

              <div style={{marginBottom:16}}>
                <label style={{fontSize:12,color:'#64748b',display:'block',marginBottom:6}}>Report Name</label>
                <input value={reportName} onChange={e=>setReportName(e.target.value)} style={{width:'100%',background:'#0f172a',border:'1px solid #334155',borderRadius:8,color:'#f1f5f9',padding:'8px 12px',fontSize:13,boxSizing:'border-box'}}/>
              </div>

              {/* Column Type Summary */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
                {[
                  {label:'Numeric Columns', cols:numericCols, color:'#10b981'},
                  {label:'Text Columns', cols:textCols, color:'#3b82f6'},
                  {label:'Date Columns', cols:dateCols, color:'#f59e0b'}
                ].map((g,i)=>(
                  <div key={i} style={{background:'#0f172a',borderRadius:8,padding:12,border:`1px solid ${g.color}30`}}>
                    <div style={{fontSize:11,color:g.color,marginBottom:8,fontWeight:600,textTransform:'uppercase'}}>{g.label} ({g.cols.length})</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                      {g.cols.slice(0,8).map(c=><span key={c} style={{background:g.color+'15',color:g.color,padding:'2px 8px',borderRadius:10,fontSize:11}}>{c}</span>)}
                      {g.cols.length>8 && <span style={{color:'#64748b',fontSize:11}}>+{g.cols.length-8} more</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Preview */}
              <h4 style={{color:'#f1f5f9',margin:'0 0 10px',fontSize:13}}>Data Preview (first 5 rows of {rawData.length})</h4>
              <div style={{overflowX:'auto',maxHeight:200,overflowY:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead style={{position:'sticky',top:0,background:'#0f172a'}}>
                    <tr>{headers.map(h=><th key={h} style={{padding:'6px 10px',textAlign:'left',color:'#64748b',fontSize:10,textTransform:'uppercase',whiteSpace:'nowrap',borderBottom:'1px solid #334155'}}>{h}<span style={{marginLeft:4,fontSize:9,color:columnTypes[h]==='numeric'?'#10b981':columnTypes[h]==='date'?'#f59e0b':'#3b82f6'}}>({columnTypes[h]})</span></th>)}</tr>
                  </thead>
                  <tbody>
                    {rawData.slice(0,5).map((row,i)=>(
                      <tr key={i} style={{borderBottom:'1px solid #0f172a',background:i%2===0?'#1e293b':'#0f172a'}}>
                        {headers.map(h=><td key={h} style={{padding:'6px 10px',color:'#f1f5f9',whiteSpace:'nowrap'}}>{String(row[h]||'')}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button onClick={handleGenerate} disabled={processing} style={{width:'100%',background:processing?'#334155':'linear-gradient(135deg,#10b981,#059669)',border:'none',borderRadius:10,color:'#fff',padding:'14px',fontSize:15,fontWeight:700,cursor:processing?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              {processing ? <><div style={{width:20,height:20,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid #fff',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>Generating...</> : <><CheckCircle size={18}/>Generate Report & Save to Database</>}
            </button>
          </div>
        )}

        {/* STEP 3: Generated */}
        {step===3 && generatedReport && (
          <div>
            <div style={{background:'#10b98120',border:'1px solid #10b98140',borderRadius:12,padding:20,marginBottom:20,display:'flex',gap:16,alignItems:'center'}}>
              <CheckCircle size={36} style={{color:'#10b981',flexShrink:0}}/>
              <div>
                <h2 style={{color:'#10b981',margin:'0 0 4px',fontSize:18,fontWeight:700}}>Report Generated & Saved!</h2>
                <p style={{color:'#94a3b8',margin:0,fontSize:13}}>{generatedReport.total_records} records • {headers.length} columns • Saved to Reports Database</p>
              </div>
            </div>

            {/* Summary Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:12,marginBottom:20}}>
              {Object.entries(generateSummary(rawData,headers)).slice(0,8).map(([key,val],i)=>(
                <div key={i} style={{background:'#1e293b',border:'1px solid #334155',borderRadius:10,padding:14}}>
                  <div style={{fontSize:10,color:'#64748b',marginBottom:4,textTransform:'uppercase'}}>{key}</div>
                  <div style={{fontSize:18,fontWeight:700,color:'#10b981'}}>{val}</div>
                </div>
              ))}
            </div>

            {/* Download buttons */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
              <button onClick={downloadCSV} style={{background:'#10b981',border:'none',borderRadius:10,color:'#fff',padding:'12px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><Download size={16}/> Download CSV</button>
              <button onClick={downloadExcel} style={{background:'#8b5cf6',border:'none',borderRadius:10,color:'#fff',padding:'12px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><Download size={16}/> Download Excel</button>
              <button onClick={downloadPDF} style={{background:'#ef4444',border:'none',borderRadius:10,color:'#fff',padding:'12px',cursor:'pointer',fontWeight:600,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><Download size={16}/> Download PDF</button>
            </div>

            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>navigate('/reports-db')} style={{flex:1,background:'#3b82f6',border:'none',borderRadius:10,color:'#fff',padding:'12px',cursor:'pointer',fontWeight:600,fontSize:13}}>View in Reports Database</button>
              <button onClick={()=>navigate('/workspace')} style={{flex:1,background:'#334155',border:'none',borderRadius:10,color:'#94a3b8',padding:'12px',cursor:'pointer',fontSize:13}}>Go to Workspace</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}