import { Link } from 'react-router-dom'
import { MapPin, Calendar, ArrowUpRight } from 'lucide-react'
import type { Report } from '../types'
import { Badge, ItemArt, fmtDate } from './ui'

export default function ItemCard({ r, h = 'h-48' }: { r: Report; h?: string }) {
  return (
    <article className="card lift group mb-6 flex break-inside-avoid flex-col overflow-hidden">
      <div className={`relative ${h} overflow-hidden`}><ItemArt category={r.category} color={r.color} photo={r.photo} className="h-full w-full" />
        <div className="absolute left-4 top-4 flex gap-2"><Badge type={r.type} /></div></div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2"><h3 className="text-lg font-bold leading-snug">{r.name}</h3><ArrowUpRight size={18} className="shrink-0 text-muted" /></div>
        <p className="text-sm text-muted">{r.color} · {r.brand}</p>
        <div className="space-y-1.5 text-sm text-muted">
          <p className="flex items-center gap-2"><MapPin size={14} />{r.location}</p>
          <p className="flex items-center gap-2"><Calendar size={14} />{fmtDate(r.date)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === 'Reunited' ? 'bg-gold/40 text-deep' : 'bg-sage text-moss'}`}>{r.status}</span>
          <Link to={`/item/${r.id}`} className="btn-line !py-2">View Details</Link>
        </div>
      </div>
    </article>
  )
}
