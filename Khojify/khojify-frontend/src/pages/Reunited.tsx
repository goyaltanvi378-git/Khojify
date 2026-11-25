import { PartyPopper, MapPin } from 'lucide-react'
import BrandArt from '../components/BrandArt'
import { Empty, ErrorState, ItemArt, Skeleton, fmtDate } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { getReports } from '../services/api'

export default function Reunited() {
  const { data, loading, error, reload } = useAsync(getReports)
  const rows = (data || []).filter((r) => r.status === 'Reunited').sort((a, b) => +new Date(b.reunitedAt || 0) - +new Date(a.reunitedAt || 0))
  return (
    <div className="wrap py-14">
      <div className="mb-10 grid items-center gap-8 overflow-hidden rounded-[32px] bg-beige/60 p-8 md:grid-cols-[1.2fr_1fr] md:p-12">
        <div><h1 className="h1">Every reunion is a little <span className="font-serif font-medium italic text-gold">victory.</span></h1>
          <div className="mt-6 inline-flex items-center gap-3 rounded-full bg-forest px-6 py-3 text-ivory"><PartyPopper className="text-gold" /><span className="text-3xl font-extrabold">{rows.length}</span><span className="text-sm text-ivory/80">items reunited</span></div></div>
        <BrandArt className="hidden w-full md:block" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-72" />)}{error && <ErrorState message={error} retry={reload} />}
        {!loading && !error && !rows.length && <Empty title="No reunions yet" text="When a claim is verified, the item appears here." />}
        {rows.map((r) => <article key={r.id} className="card lift group overflow-hidden"><ItemArt category={r.category} color={r.color} photo={r.photo} className="h-44" />
          <div className="space-y-2 p-5"><h3 className="text-lg font-bold">{r.name}</h3><p className="flex items-center gap-2 text-sm text-muted"><MapPin size={14} />Originally at {r.location}</p>
            <div className="flex items-center justify-between text-sm"><span className="rounded-full bg-terra/20 px-2.5 py-1 font-semibold text-moss">Reunited</span><span className="text-muted">{r.reunitedAt && fmtDate(r.reunitedAt)}</span></div></div></article>)}
      </div>
    </div>
  )
}
