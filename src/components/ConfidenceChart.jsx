import { Target, Shield, Cpu } from 'lucide-react'
import {
  ComposedChart, Area, Line, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import './ConfidenceChart.css'

/**
 * ConfidenceChart — reusable forecast chart with confidence bands.
 *
 * Props:
 *   data          (array)   Array of data objects
 *   xKey          (string)  Key for x-axis (e.g. "month")
 *   actualKey     (string)  Key for actual/historical values
 *   forecastKey   (string)  Key for forecast values
 *   upperKey      (string)  Key for upper confidence bound
 *   lowerKey      (string)  Key for lower confidence bound
 *   todayMarker   (string)  x-axis value where "Today" reference line appears
 *   height        (number)  Chart height in px (default 280)
 *   accuracy      (number)  Model accuracy %, shown in header
 *   confidence    (number)  Confidence interval %, shown in header
 *   modelName     (string)  AI model name, shown in header
 *   title         (string)  Section title above chart
 *   prefix        (string)  Value prefix e.g. "$"
 *   suffix        (string)  Value suffix e.g. "M", "%"
 *   chartType     ('area'|'bar')  Secondary series display type (default 'area')
 *   actualColor   (string)  Color for actual line (default #10b981)
 *   forecastColor (string)  Color for forecast line (default #3b82f6)
 *   bandColor     (string)  Color for confidence band (default #3b82f6)
 */
function ConfidenceChart({
  data          = [],
  xKey          = 'label',
  actualKey     = 'actual',
  forecastKey   = 'forecast',
  upperKey      = 'upper',
  lowerKey      = 'lower',
  todayMarker   = null,
  height        = 280,
  accuracy      = null,
  confidence    = null,
  modelName     = null,
  title         = null,
  prefix        = '',
  suffix        = '',
  chartType     = 'area',
  actualColor   = '#10b981',
  forecastColor = '#3b82f6',
  bandColor     = '#3b82f6',
}) {
  const gradientId = `ccBand-${Math.random().toString(36).slice(2, 7)}`

  // ── Custom dark tooltip ──
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="cc-tooltip">
        <p className="cc-tooltip-label">{label}</p>
        {payload.map((entry, i) =>
          entry.value !== null &&
          entry.name !== 'Upper Band' &&
          entry.name !== 'Lower Band' && (
            <p key={i} className="cc-tooltip-item" style={{ color: entry.color }}>
              <span>{entry.name}:</span>
              <span>
                {prefix}
                {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                {suffix}
              </span>
            </p>
          )
        )}
      </div>
    )
  }

  return (
    <div className="cc-wrapper">
      {/* Optional header */}
      {(title || accuracy !== null || confidence !== null || modelName) && (
        <div className="cc-header">
          {title && <span className="cc-title">{title}</span>}
          <div className="cc-meta">
            {accuracy  !== null && (
              <span className="cc-meta-item"><Target size={11} /> Accuracy: <strong>{accuracy}%</strong></span>
            )}
            {confidence !== null && (
              <span className="cc-meta-item"><Shield size={11} /> Confidence: <strong>{confidence}%</strong></span>
            )}
            {modelName && (
              <span className="cc-meta-item"><Cpu size={11} /> <strong>{modelName}</strong></span>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="cc-chart-area">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={bandColor} stopOpacity={0.18} />
                <stop offset="95%" stopColor={bandColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey={xKey}
              tick={{ fill: '#475569', fontSize: 11 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#475569', fontSize: 11 }}
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              tickFormatter={v => `${prefix}${v}${suffix}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#475569', fontSize: 12, paddingTop: 10 }} />

            {/* Today marker */}
            {todayMarker && (
              <ReferenceLine
                x={todayMarker}
                stroke="#475569"
                strokeDasharray="5 4"
                label={{ value: 'Today', fill: '#64748b', fontSize: 11 }}
              />
            )}

            {/* Confidence band (upper then lower — lower overwrites fill to bg) */}
            <Area
              type="monotone"
              dataKey={upperKey}
              fill={`url(#${gradientId})`}
              stroke="none"
              name="Upper Band"
              legendType="none"
            />
            <Area
              type="monotone"
              dataKey={lowerKey}
              fill="#f8fafc"
              stroke="none"
              name="Lower Band"
              legendType="none"
            />

            {/* Actual values */}
            {chartType === 'bar' ? (
              <Bar
                dataKey={actualKey}
                fill={actualColor}
                name="Actual"
                radius={[3, 3, 0, 0]}
                opacity={0.85}
              />
            ) : (
              <Line
                type="monotone"
                dataKey={actualKey}
                stroke={actualColor}
                strokeWidth={2.5}
                dot={{ fill: actualColor, r: 4 }}
                name="Actual"
                connectNulls={false}
              />
            )}

            {/* Forecast values */}
            {chartType === 'bar' ? (
              <Bar
                dataKey={forecastKey}
                fill={forecastColor}
                name="Forecast"
                radius={[3, 3, 0, 0]}
                opacity={0.75}
              />
            ) : (
              <Line
                type="monotone"
                dataKey={forecastKey}
                stroke={forecastColor}
                strokeWidth={2.5}
                strokeDasharray="6 3"
                dot={{ fill: forecastColor, r: 3 }}
                name="Forecast"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ConfidenceChart

