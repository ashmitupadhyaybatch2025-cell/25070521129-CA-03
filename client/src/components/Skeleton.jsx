/**
 * Skeleton loader blocks.
 * Props: width, height, radius, count (renders multiple)
 */
export function SkeletonBlock({ width = '100%', height = '20px', radius = '8px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div
      className="flexi-card"
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}
    >
      <SkeletonBlock height="14px" width="40%" />
      <SkeletonBlock height="20px" />
      <SkeletonBlock height="14px" width="70%" />
      <SkeletonBlock height="14px" width="55%" />
      <SkeletonBlock height="36px" radius="999px" width="100px" style={{ marginTop: '8px' }} />
    </div>
  )
}

export function SkeletonCards({ count = 6 }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }, (_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
