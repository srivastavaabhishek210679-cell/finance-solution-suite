import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import './KPIHealthScore.css'

/**
 * KPIHealthScore — standalone AI-scored KPI card.
 * Drop anywhere on the Dashboard or Analytics page.
 *
 * Props:
 *   name       (string)     KPI display name
 *   value      (string)     Current formatted value, e.g. "$18.2M"
 *   score      (number)     0–100 AI health score
 *   change     (string)     Formatted delta, e.g. "+8.2%"
 *   trend      ('up'|'down')
 *   domain     (string)     Domain label, e.g. "Finance"
 *   icon       (component)  Lucide icon component
 *   onClick    (fn)         Optional click handler
 */
function KPIHealthScore({
  name   = 'KPI Name',
  value  = '—',
  score  = 0,
  change = '—',
  trend  = 'up',
  domain = '',
  icon: IconComp = Activity,
  onClick,
}) {
  const color    = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const label    = score >= 80 ? 'Healthy' : score >= 60 ? 'Warning' : 'Critical'
  const isUp     = trend === 'up'

  // Arc path for circular score gauge (SVG, r=20)
  const r          = 20
  const circ       = 2 * Math.PI * r
  const dashOffset = circ - (score / 100) * circ

  return (
    <div
      className={`khs-card ${onClick ? 'khs-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Top row: icon + meta + status badge */}
      <div className="khs-top">
        <div className="khs-icon" style={{ background: `${color}22`, color }}>
          <IconComp size={16} />
        </div>
        <div className="khs-meta">
          <span className="khs-name">{name}</span>
          {domain && <span className="khs-domain">{domain}</span>}
        </div>
        <span className="khs-status" style={{ color, background: `${color}18` }}>
          {label}
        </span>
      </div>

      {/* Middle: value + mini gauge */}
      <div className="khs-middle">
        <div className="khs-value-block">
          <span className="khs-value">{value}</span>
          <span className="khs-change" style={{ color: isUp ? '#10b981' : '#ef4444' }}>
            {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {change}
          </span>
        </div>

        {/* Circular gauge */}
        <div className="khs-gauge-wrap">
          <svg width="54" height="54" viewBox="0 0 54 54">
            <circle cx="27" cy="27" r={r} fill="none" stroke="#334155" strokeWidth="5" />
            <circle
              cx="27" cy="27" r={r}
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeDasharray={circ}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 27 27)"
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
          </svg>
          <span className="khs-gauge-label" style={{ color }}>{score}</span>
        </div>
      </div>

      {/* Bottom: progress bar */}
      <div className="khs-bar-row">
        <div className="khs-bar">
          <div className="khs-bar-fill" style={{ width: `${score}%`, background: color }} />
        </div>
        <span className="khs-bar-label">AI Score</span>
      </div>
    </div>
  )
}

export default KPIHealthScore
