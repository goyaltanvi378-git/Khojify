import { Link, useParams } from 'react-router-dom'
import { MapPin, Calendar, Hash, ShieldCheck, Flag, MessageSquare, KeyRound, Check } from 'lucide-react'
import { Badge, ItemArt, ErrorState, Skeleton, fmtDate } from '../components/ui'
import ItemCard from '../components/ItemCard'
import { useApp } from '../components/Providers'
import { useAsync } from '../hooks/useAsync'
import { getReports, markReunited } from '../services/api'

export default function ItemDetails() {
  const { id } = useParams(), { toast, user } = useApp()
  const { data, loading, error, reload } = useAsync(getReports)
  if (error) return <div className="wrap py-16"><ErrorState message={error} retry={reload} /></div>
  if (loading || !data) return <div className="wrap grid gap-8 py-16 md:grid-cols-2"><Skeleton className="h-96" /><Skeleton className="h-96" /></div>
  const r = data.find((x) => x.id === id)
  if (!r) return <div className="wrap py-16"><ErrorState message="We couldn’t find that report. It may have been removed." /><Link to="/browse" className="btn-dark mt-6">Back to Explore</Link></div>
  const similar = data.filter((x) => x.id !== r.id && x.category === r.category && x.status === 'Active').slice(0, 3)
  const reunite = async () => { try { await markReunited(r.id); toast('One more belonging found its way home!'); reload() } catch (e) { toast((e as Error).message, 'err') } }
  return (
    <div className="wrap py-14">
      <div className="grid gap-10 md:grid-cols-2">
        <ItemArt category={r.category} color={r.color} photo={r.photo} className="group h-80 rounded-3xl border border-line md:h-[30rem]" />
        <div>
          <Badge type={r.type} /><h1 className="h1 mt-3 !text-4xl">{r.name}</h1><p className="mt-3 text-muted">{r.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">{[['Category', r.category], ['Colour', r.color], ['Brand', r.brand], ['Status', r.status]].map(([k, v]) => <div key={k}><dt className="text-muted">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl>
          <div className="mt-5 space-y-2 text-sm text-muted"><p className="flex items-center gap-2"><MapPin size={15} />{r.location}</p><p className="flex items-center gap-2"><Calendar size={15} />{fmtDate(r.date)}</p><p className="flex items-center gap-2"><Hash size={15} />{r.id}</p></div>
          {r.type === 'found' && r.status === 'Active' && <div className="card mt-8 bg-sage p-5"><p className="font-bold">Is this your item?</p><p className="mt-1 text-sm text-muted">Ownership is verified privately. Matching text alone never approves a claim.</p><Link to={`/claim/${r.id}`} className="btn-dark mt-4"><KeyRound size={16} />Claim This Item</Link></div>}
          {r.type === 'lost' && r.status === 'Active' && <Link to="/report-found" className="btn-dark mt-8"><Check size={16} />I found this item</Link>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="btn-line" onClick={() => toast('Messaging needs backend integration. Use the claim flow to reach the reporter.')}><MessageSquare size={16} />Contact Reporter</button>
            <button className="btn-line" onClick={() => toast('Thanks, this report was flagged for review (demo).')}><Flag size={16} />Report Incorrect Information</button>
            {r.status === 'Active' && (r.mine || user?.role === 'moderator') && <button className="btn-line" onClick={reunite}>Mark as Reunited</button>}
          </div>
          <p className="mt-6 flex gap-2 rounded-2xl bg-sage p-4 text-sm text-moss"><ShieldCheck size={18} className="shrink-0" />Contact details and private identifying details are never shown publicly.</p>
        </div>
      </div>
      {similar.length > 0 && <><h2 className="h2 mb-6 mt-16">Similar items</h2><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{similar.map((s) => <div key={s.id} className="[&>article]:mb-0"><ItemCard r={s} /></div>)}</div></>}
    </div>
  )
}
