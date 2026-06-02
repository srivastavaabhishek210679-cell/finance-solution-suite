import { TrendingUp, TrendingDown, Target, Shield } from 'lucide-react'
import './ForecastOverlay.css'

/**
 * ForecastOverlay — drop this inside any KPI tile to show a mini AI forecast.
 *
 * Props:
 *   currentValue  (number)  Current metric value
 *   forecastValue (number)  Predicted next-period value
 *   forecastLabel (string)  e.g. "Next Month Forecast"
 *   confidence    (number)  0–100 confidence score
 *   prefix        (string)  e.g. "$", "€"
 *   suffix        (string)  e.g. "%", "K", "M"
 *   compact       (bool)    Smaller inline variant
 */
function ForecastOverlay({
  currentValue,
  forecastValue,
  forecastLabel = 'Next Period Forecast',
  confidence    = 85,
  prefix        = '',
  suffix        = '',
  compact       = false,
}) {
  const isNumeric = typeof currentValue === 'number' && typeof forecastValue === 'number'
  const delta     = isNumeric ? forecastValue - currentValue : 0
  const pct       = isNumeric && currentValue !== 0
    ? ((delta / Math.abs(currentValue)) * 100).toFixed(1)
    : '0.0'
  const isUp      = delta >= 0

  const confColor = confidence >= 80 ? '#10b981' : confidence >= 60 ? '#f59e0b' : '#ef4444'

  if (compact) {
    return (
      <div className="fo-compact">
        <span className="fo-compact-label"><Target size={10} /> AI:</span>
        <span className="fo-compact-value">{prefix}{forecastValue?.toLocaleString()}{suffix}</span>
        <span className={`fo-compact-change ${isUp ? 'up' : 'down'}`}>
          {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {isUp ? '+' : ''}{pct}%
        </span>
        <span className="fo-compact-conf" style={{ color: confColor }}>{confidence}%</span>
      </div>
    )
  }

  return (
    <div className="fo-container">
      {/* Header row */}
      <div className="fo-header">
        <span className="fo-label">
          <Target size={11} />
          {forecastLabel}
        </span>
        <span className="fo-model-tag">AI Forecast</span>
      </div>

      {/* Value + change */}
      <div className="fo-value-row">
        <span className="fo-forecast-value">
          {prefix}{forecastValue?.toLocaleString()}{suffix}
        </span>
        <span className={`fo-change-badge ${isUp ? 'up' : 'down'}`}>
          {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {isUp ? '+' : ''}{pct}%
        </span>
      </div>

      {/* Confidence bar */}
      <div className="fo-confidence-row">
        <Shield size={10} style={{ color: confColor, flexShrink: 0 }} />
        <div className="fo-conf-bar-track">
          <div
            className="fo-conf-bar-fill"
            style={{ width: `${confidence}%`, background: confColor }}
          />
        </div>
        <span className="fo-conf-label" style={{ color: confColor }}>
          {confidence}% confident
        </span>
      </div>
    </div>
  )
}

export default ForecastOverlay

