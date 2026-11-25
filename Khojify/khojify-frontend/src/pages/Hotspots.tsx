import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState, PageHead, Skeleton, fmtDate } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { getAnalytics } from '../services/api'

// Schematic campus floor-map (illustrative layout, NOT GPS coordinates)
const POS: Record<string, { x: number; y: number; w: number; h: number }> = {
  Library: { x: 60, y: 50, w: 150, h: 90 }, 'Academic Block': { x: 250, y: 50, w: 170, h: 90 }, 'Computer Labs': { x: 460, y: 50, w: 120, h: 90 },
  Cafeteria: { x: 60, y: 210, w: 130, h: 80 }, 'Sports Ground': { x: 250, y: 200, w: 190, h: 100 }, 'Parking Area': { x: 480, y: 215, w: 100, h: 80 }
}

export default function Hotspots() {
  const { data, loading, error, reload } = useAsync(getAnalytics)
  const [kind, setKind] = useState<'all' | 'lost' | 'found'>('all'), [sel, setSel] = useState('Library'), [filter, setFilter] = useState('')
  if (error) return <div className="wrap py-16"><ErrorState message={error} retry={reload} /></div>
  if (loading || !data) return <div className="wrap py-16"><Skeleton className="h-96" /></div>
  const n = (l: { lost: number; found: number }) => (kind === 'lost' ? l.lost : kind === 'found' ? l.found : l.lost + l.found)
  const max = Math.max(...data.locations.map(n), 1), cur = data.locations.find((l) => l.name === sel)!
  const heat = (v: number) => `rgba(196,123,89,${0.15 + 0.75 * (v / max)})`
  return (
    <div className="wrap py-14">
      <PageHead title="Campus hotspot map" sub="Bigger, darker markers mean more reports. Click a building for details." />
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="flex rounded-full border border-line bg-ivory p-1" role="group" aria-label="Report type">{(['all', 'lost', 'found'] as const).map((k) => <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${kind === k ? 'bg-forest text-ivory' : 'text-muted'}`}>{k === 'all' ? 'Lost & Found' : k}</button>)}</div>
        <select aria-label="Location filter" className="input !w-auto" value={filter} onChange={(e) => { setFilter(e.target.value); if (e.target.value) setSel(e.target.value) }}><option value="">All locations</option>{data.locations.map((l) => <option key={l.name}>{l.name}</option>)}</select>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card overflow-hidden bg-cream p-3"><svg viewBox="0 0 640 340" className="h-auto w-full" role="group" aria-label="Schematic campus map">
          <path d="M0 175H640M215 0V340M445 0V340" stroke="#E5D2B8" strokeWidth="14" /><path d="M0 175H640" stroke="#FFFCF7" strokeWidth="2" strokeDasharray="8 8" />
          {data.locations.map((l) => { const p = POS[l.name], v = n(l), on = sel === l.name, dim = filter && filter !== l.name; return (
            <g key={l.name} tabIndex={0} role="button" aria-label={`${l.name}: ${v} reports`} className="cursor-pointer outline-none" opacity={dim ? 0.35 : 1} onClick={() => setSel(l.name)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSel(l.name)}>
              <rect x={p.x} y={p.y} width={p.w} height={p.h} rx="16" fill={heat(v)} stroke={on ? '#35251D' : '#B58A62'} strokeWidth={on ? 3 : 1.2} />
              <text x={p.x + p.w / 2} y={p.y + p.h / 2 - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#35251D">{l.name}</text>
              <circle cx={p.x + p.w / 2} cy={p.y + p.h / 2 + 20} r={8 + 12 * (v / max)} fill="#35251D" /><text x={p.x + p.w / 2} y={p.y + p.h / 2 + 24} textAnchor="middle" fontSize="11" fontWeight="800" fill="#FFFCF7">{v}</text></g>) })}</svg></div>
        <div className="card p-6"><h2 className="text-2xl font-extrabold">{cur.name}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl bg-sage p-4"><p className="text-3xl font-extrabold">{cur.lost}</p><p className="text-sm text-muted">Lost reports</p></div><div className="rounded-2xl bg-sage p-4"><p className="text-3xl font-extrabold">{cur.found}</p><p className="text-sm text-muted">Found reports</p></div></div>
          <h3 className="mb-2 mt-5 font-bold">Most frequently lost</h3><ul className="text-sm text-muted">{cur.top_items.map((t) => <li key={t.name}>{t.name} · {t.count}</li>)}</ul>
          <h3 className="mb-2 mt-5 font-bold">Recent reports</h3><ul className="divide-y divide-line text-sm">{cur.recent.filter((r) => kind === 'all' || r.type === kind).map((r) => <li key={r.id} className="flex justify-between gap-2 py-2"><Link to={`/item/${r.id}`} className="font-semibold hover:text-moss">{r.name}</Link><span className="text-muted">{fmtDate(r.date)}</span></li>)}</ul></div>
      </div>
      <p className="mt-4 text-xs text-muted">Schematic layout for illustration. Counts come from fictional sample records.</p>
    </div>
  )
}
