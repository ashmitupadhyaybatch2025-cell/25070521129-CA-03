/**
 * Badge component.
 * type: 'workshop'|'sports'|'cultural'|'technical'|'social'|'past'|'full'|'admin'|'user'|'new'
 */
export default function Badge({ type = 'user', children }) {
  const cls = `badge badge-${type.toLowerCase()}`
  return <span className={cls}>{children}</span>
}

export function CategoryBadge({ category }) {
  return <Badge type={category?.toLowerCase() || 'social'}>{category}</Badge>
}
