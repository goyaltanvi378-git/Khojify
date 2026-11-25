import { FileText, PackageSearch, PackageCheck, HeartHandshake, Lightbulb } from 'lucide-react'
import StatsCard from '../components/StatsCard'
import { ErrorState, PageHead, Skeleton } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { getAnalytics } from '../services/api'

function Bars({ rows, max }: { rows: { name: string; count: number }[]; max?: number }) {
  const m = max ?? Math.max(...rows.map((r) => r.count), 1)
  return <ul className="space-y-3">{rows.map((r) => <li key={r.name}><div className="mb-1 flex justify-between text-sm"><span className="font-medium">{r.name}</span><span className="text-muted">{r.count}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-sage"><div className="h-full rounded-full bg-forest transition-all duration-1000" style={{ width: `${(r.count / m) * 100}%` }} /></div></li>)}</ul>
}

export default function Insights() {
  const { data: a, loading, error, reload } = useAsync(getAnalytics)
  if (error) return <div className="wrap py-16"><ErrorState message={error} retry={reload} /></div>
  if (loading || !a) return <div className="wrap grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36" />)}</div>
  const lostPct = (a.lost / a.total) * 100, c = 2 * Math.PI * 40
  const Panel = ({ t, children }: { t: string; children: React.ReactNode }) => <section className="card p-6"><h3 className="mb-5 text-lg font-bold">{t}</h3>{children}</section>
  return (
    <div className="wrap py-14">
      <PageHead title="Small patterns. Big discoveries." sub="Calculated live from 150 fictional sample records. Not real campus statistics." />
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4"><StatsCard icon={FileText} label="Total Reports" value={a.total} /><StatsCard icon={PackageSearch} label="Lost Items" value={a.lost} /><StatsCard icon={PackageCheck} label="Found Items" value={a.found} /><StatsCard icon={HeartHandshake} label="Reunited Items" value={a.reunited} /></div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel t="Most lost items"><Bars rows={a.top_lost_categories} /></Panel>
        <Panel t="Campus hotspots"><ol className="space-y-3">{a.hotspots.map((h, i) => <li key={h.name} className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-sm font-bold text-gold">{i + 1}</span><span className="flex-1 font-semibold">{h.name}</span><span className="text-muted">{h.count} reports</span></li>)}</ol></Panel>
        <Panel t="Lost vs found"><div className="flex items-center gap-8"><svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90" role="img" aria-label={`${a.lost} lost, ${a.found} found`}><circle cx="50" cy="50" r="40" fill="none" stroke="#35251D" strokeWidth="18" /><circle cx="50" cy="50" r="40" fill="none" stroke="#C47B59" strokeWidth="18" strokeDasharray={`${(c * lostPct) / 100} ${c}`} /></svg>
          <ul className="space-y-2 text-sm"><li className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-terra" />Lost: {a.lost} ({lostPct.toFixed(0)}%)</li><li className="flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-forest" />Found: {a.found} ({(100 - lostPct).toFixed(0)}%)</li></ul></div></Panel>
        <Panel t="Reports by category"><Bars rows={a.by_category} /></Panel>
        <div className="lg:col-span-2"><Panel t="Reports by campus location"><Bars rows={a.by_location} /></Panel></div>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2">{[`${a.top_lost_categories[0].name} is the most frequently reported lost category.`, `The ${a.hotspots[0].name} has the highest number of reported missing items.`].map((t) => <p key={t} className="card flex gap-3 bg-sage p-5 font-semibold text-forest"><Lightbulb className="shrink-0 text-moss" />{t}</p>)}</div>
    </div>
  )
}
