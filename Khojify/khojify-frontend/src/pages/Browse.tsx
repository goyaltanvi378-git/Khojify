import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, FilterX } from 'lucide-react'
import ItemCard from '../components/ItemCard'
import { Empty, ErrorState, PageHead, Skeleton } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { getReports } from '../services/api'
import { CATEGORIES, COLORS, LOCATIONS } from '../services/demoData'

const PAGE = 9
export default function Browse() {
  const [sp, setSp] = useSearchParams(), [shown, setShown] = useState(PAGE)
  const { data, loading, error, reload } = useAsync(getReports)
  const f = { q: sp.get('q') || '', type: sp.get('type') || '', category: sp.get('category') || '', color: sp.get('color') || '', location: sp.get('location') || '', date: sp.get('date') || '', sort: sp.get('sort') || 'latest' }
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n, { replace: true }); setShown(PAGE) }
  const rows = useMemo(() => {
    const q = f.q.toLowerCase(), days = Number(f.date) || 0
    const out = (data || []).filter((r) => (!q || `${r.name} ${r.color} ${r.brand} ${r.location}`.toLowerCase().includes(q)) && (!f.type || r.type === f.type) && (!f.category || r.category === f.category)
      && (!f.color || r.color === f.color) && (!f.location || r.location.toLowerCase().includes(f.location.toLowerCase())) && (!days || Date.now() - +new Date(r.date) <= days * 86400000))
    return out.sort((a, b) => (f.sort === 'oldest' ? +new Date(a.date) - +new Date(b.date) : +new Date(b.date) - +new Date(a.date)))
  }, [data, f.q, f.type, f.category, f.color, f.location, f.date, f.sort])
  const Sel = ({ k, label, opts }: { k: string; label: string; opts: string[] }) => (
    <select aria-label={label} className="input" value={f[k as keyof typeof f]} onChange={(e) => set(k, e.target.value)}><option value="">{label}</option>{opts.map((o) => <option key={o}>{o}</option>)}</select>
  )
  return (
    <div className="wrap py-14">
      <PageHead title="Explore the Lost & Found board" sub="Every report brings something one step closer to home." />
      <div className="card mb-8 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2"><Search size={16} className="absolute left-3.5 top-3.5 text-muted" /><input aria-label="Search by item name" className="input !pl-10" placeholder="Search by item name..." value={f.q} onChange={(e) => set('q', e.target.value)} /></div>
        <select aria-label="Lost or found" className="input" value={f.type} onChange={(e) => set('type', e.target.value)}><option value="">Lost &amp; Found</option><option value="lost">Lost</option><option value="found">Found</option></select>
        <select aria-label="Sort" className="input" value={f.sort} onChange={(e) => set('sort', e.target.value)}><option value="latest">Latest first</option><option value="oldest">Oldest first</option></select>
        <Sel k="category" label="All categories" opts={CATEGORIES} /><Sel k="color" label="All colours" opts={COLORS} /><Sel k="location" label="All locations" opts={LOCATIONS} />
        <select aria-label="Date" className="input" value={f.date} onChange={(e) => set('date', e.target.value)}><option value="">Any date</option><option value="1">Last 24 hours</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select>
      </div>
      <p className="mb-5 text-sm text-muted" aria-live="polite">{loading ? 'Loading reports…' : `${rows.length} reports`}</p>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 [&>article]:mb-0">
        {loading && Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-96" />)}
        {error && <ErrorState message={error} retry={reload} />}
        {!loading && !error && rows.length === 0 && <Empty title="Nothing matches those filters" text="Try removing a filter, or report the item so the community can help." action={<button className="btn-dark" onClick={() => { setSp({}); setShown(PAGE) }}><FilterX size={16} />Clear filters</button>} />}
        {rows.slice(0, shown).map((r) => <ItemCard key={r.id} r={r} />)}
      </div>
      {shown < rows.length && <div className="mt-10 text-center"><button className="btn-line" onClick={() => setShown(shown + PAGE)}>Load more ({rows.length - shown} left)</button></div>}
    </div>
  )
}
