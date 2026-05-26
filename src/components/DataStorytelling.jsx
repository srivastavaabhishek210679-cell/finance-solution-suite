import { useState } from 'react'
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react'

const CLAUDE_API = 'https://api.anthropic.com/v1/messages'

export default function DataStorytelling({ analyticsStats }) {
  const [narrative, setNarrative] = useState('')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const [generated, setGenerated] = useState(false)

  const generateNarrative = async () => {
    if (!analyticsStats) return
    setLoading(true)
    setNarrative('')

    const topDomains = (analyticsStats.domainBreakdown || [])
      .slice(0, 5)
      .map(d => `${d.domain}: ${d.count} reports`)
      .join(', ')

    const complianceBreakdown = (analyticsStats.complianceBreakdown || [])
      .map(c => `${c.status}: ${c.count}`)
      .join(', ')

    const freqBreakdown = (analyticsStats.frequencyBreakdown || [])
      .map(f => `${f.frequency}: ${f.count}`)
      .join(', ')

    const prompt = `You are a financial data analyst. Based on this enterprise finance platform data, write a concise 3-paragraph executive narrative (max 150 words total) explaining the key insights. Be specific with numbers. Use plain business language.

Data:
- Total Reports: ${analyticsStats.totalReports}
- Active Domains: ${analyticsStats.activeDomains}
- Required Reports: ${analyticsStats.requiredReports} (${analyticsStats.complianceRate}% compliance rate)
- Risk Score: ${analyticsStats.riskScore}
- Top Domains: ${topDomains}
- Compliance Breakdown: ${complianceBreakdown}
- Frequency Breakdown: ${freqBreakdown}

Write 3 short paragraphs:
1. Overall platform health summary
2. Key compliance and risk insights
3. Recommended focus areas`

    try {
      const res = await fetch(CLAUDE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      const text = data.content?.[0]?.text || 'Unable to generate narrative.'
      setNarrative(text)
      setGenerated(true)
    } catch (err) {
      setNarrative('Failed to generate narrative. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!analyticsStats) return null

  return (
    <div style={{
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: 12,
      padding: 20,
      marginBottom: 16
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: expanded ? 16 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: '#7c3aed20', borderRadius: 8, padding: '6px 8px' }}>
            <Sparkles size={16} style={{ color: '#a78bfa' }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>AI Data Narrative</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Auto-generated insights from your platform data</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!loading && (
            <button onClick={generateNarrative} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#7c3aed', border: 'none', borderRadius: 8,
              color: '#fff', fontSize: 12, fontWeight: 600,
              padding: '6px 14px', cursor: 'pointer'
            }}>
              <RefreshCw size={12} />
              {generated ? 'Regenerate' : 'Generate Narrative'}
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)} style={{
            background: 'none', border: '1px solid #334155',
            borderRadius: 8, color: '#94a3b8', cursor: 'pointer', padding: '6px 8px'
          }}>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', color: '#94a3b8', fontSize: 13 }}>
              <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite', color: '#a78bfa' }} />
              Analyzing your platform data...
            </div>
          )}

          {!loading && !narrative && (
            <div style={{ padding: '12px 0', color: '#475569', fontSize: 13, fontStyle: 'italic' }}>
              Click "Generate Narrative" to get AI-powered insights about your platform data.
            </div>
          )}

          {!loading && narrative && (
            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.7 }}>
              {narrative.split('\n\n').map((para, i) => (
                <p key={i} style={{ marginBottom: i < narrative.split('\n\n').length - 1 ? 12 : 0 }}>
                  {para.replace(/^\d+\.\s*/, '')}
                </p>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
            {[
              { label: 'Total Reports', value: analyticsStats.totalReports, color: '#3b82f6' },
              { label: 'Compliance Rate', value: `${analyticsStats.complianceRate}%`, color: '#10b981' },
              { label: 'Risk Score', value: analyticsStats.riskScore, color: '#f59e0b' },
              { label: 'Active Domains', value: analyticsStats.activeDomains, color: '#8b5cf6' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: '#0f172a', borderRadius: 8, padding: '8px 14px',
                border: `1px solid ${stat.color}30`
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
