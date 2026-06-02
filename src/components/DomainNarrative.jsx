import { useState } from 'react'
import { Sparkles, RefreshCw, X } from 'lucide-react'

export default function DomainNarrative({ domain, count, percentage, color, reports }) {
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState(false)

  const generate = async (e) => {
    e.stopPropagation()
    setShow(true)
    setLoading(true)
    setNarrative('')

    const freqBreakdown = {}
    reports.forEach(r => { freqBreakdown[r.frequency] = (freqBreakdown[r.frequency]||0)+1 })
    const freqStr = Object.entries(freqBreakdown).map(([k,v])=>`${k}:${v}`).join(', ')

    const compBreakdown = {}
    reports.forEach(r => {
      const s = r.complianceStatus || r.compliance_status || 'Optional'
      compBreakdown[s] = (compBreakdown[s]||0)+1
    })
    const compStr = Object.entries(compBreakdown).map(([k,v])=>`${k}:${v}`).join(', ')

    const prompt = `Write a 2-sentence executive insight for the ${domain} domain of an enterprise finance platform. Be specific and actionable. Data: ${count} reports (${percentage}% of total), Frequencies: ${freqStr || 'Mixed'}, Compliance: ${compStr || 'Mixed'}. No markdown, no bullet points, plain sentences only.`

    try {
      const res = await fetch('https://finance-backend-so86.onrender.com/api/v1/ai/narrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      setNarrative(data?.data?.narrative || 'Unable to generate insight.')
    } catch {
      setNarrative('Failed to generate insight.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div onClick={e=>e.stopPropagation()}>
      {!show ? (
        <button onClick={generate} style={{
          display:'flex', alignItems:'center', gap:5,
          background:`${color}15`, border:`1px solid ${color}40`,
          borderRadius:6, padding:'4px 10px', cursor:'pointer',
          color, fontSize:11, fontWeight:600, marginTop:8, width:'100%',
          justifyContent:'center'
        }}>
          <Sparkles size={11}/> AI Insight
        </button>
      ) : (
        <div style={{
          marginTop:8, background:'#f8fafc', borderRadius:8,
          padding:10, border:`1px solid ${color}30`, position:'relative'
        }}>
          <button onClick={e=>{e.stopPropagation();setShow(false)}} style={{
            position:'absolute', top:6, right:6, background:'none',
            border:'none', cursor:'pointer', color:'#475569', padding:2
          }}><X size={11}/></button>
          {loading ? (
            <div style={{display:'flex',alignItems:'center',gap:6,color:'#64748b',fontSize:11}}>
              <RefreshCw size={11} style={{animation:'spin 1s linear infinite',color}}/>
              Generating insight...
            </div>
          ) : (
            <p style={{fontSize:11,color:'#cbd5e1',lineHeight:1.6,margin:0,paddingRight:16}}>
              {narrative}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

