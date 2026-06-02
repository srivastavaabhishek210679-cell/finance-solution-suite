import './Skeleton.css'

// ── Base shimmer block ────────────────────────────────────────────────────────
export function Skeleton({ width = '100%', height = 14, radius = 4, style = {} }) {
  return (
    <div
      className="sk-pulse"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

// ── Stat / KPI card ───────────────────────────────────────────────────────────
export function SkeletonCard({ style = {} }) {
  return (
    <div className="sk-card" style={style}>
      <div className="sk-card-top">
        <Skeleton width={36} height={36} radius={8} />
        <Skeleton width="55%" height={26} radius={5} />
      </div>
      <Skeleton width="70%" height={11} radius={3} />
    </div>
  )
}

// ── Table / list row ──────────────────────────────────────────────────────────
export function SkeletonRow({ cols = 4 }) {
  const widths = ['30%', '20%', '15%', '15%', '10%', '10%']
  return (
    <div className="sk-row">
      {Array(cols).fill(0).map((_, i) => (
        <Skeleton key={i} width={widths[i] || '15%'} height={11} radius={3} />
      ))}
    </div>
  )
}

// ── Notification item ─────────────────────────────────────────────────────────
export function SkeletonNotification() {
  return (
    <div className="sk-notif">
      <Skeleton width={32} height={32} radius={8} style={{ flexShrink: 0 }} />
      <div className="sk-notif-body">
        <Skeleton width="65%" height={12} radius={3} />
        <Skeleton width="88%" height={10} radius={3} />
        <Skeleton width="38%" height={9}  radius={3} />
      </div>
    </div>
  )
}

// ── Connector card (Integration page) ────────────────────────────────────────
export function SkeletonConnector() {
  return (
    <div className="sk-connector">
      <div className="sk-connector-header">
        <Skeleton width={38} height={38} radius={8} style={{ flexShrink: 0 }} />
        <div className="sk-connector-info">
          <Skeleton width="60%" height={13} radius={3} />
          <Skeleton width="42%" height={10} radius={3} />
        </div>
        <Skeleton width={72} height={22} radius={11} style={{ flexShrink: 0 }} />
      </div>
      <Skeleton width="100%" height={6}  radius={3} />
      <div className="sk-connector-stats">
        <Skeleton width="44%" height={10} radius={3} />
        <Skeleton width="44%" height={10} radius={3} />
      </div>
      <div className="sk-connector-tags">
        {[55, 40, 65, 48].map((w, i) => (
          <Skeleton key={i} width={w} height={18} radius={9} />
        ))}
      </div>
      <div className="sk-connector-actions">
        <Skeleton width={80}  height={26} radius={5} />
        <Skeleton width={88}  height={26} radius={5} />
        <Skeleton width={100} height={26} radius={5} />
      </div>
    </div>
  )
}

// ── Workflow card ─────────────────────────────────────────────────────────────
export function SkeletonWorkflow() {
  return (
    <div className="sk-workflow">
      <div className="sk-workflow-header">
        <div style={{ flex: 1 }}>
          <Skeleton width="55%" height={13} radius={3} />
          <Skeleton width="35%" height={10} radius={3} style={{ marginTop: 6 }} />
        </div>
        <Skeleton width={60} height={22} radius={11} style={{ flexShrink: 0 }} />
      </div>
      <div className="sk-workflow-meta">
        <Skeleton width={90}  height={10} radius={3} />
        <Skeleton width={110} height={10} radius={3} />
      </div>
    </div>
  )
}
