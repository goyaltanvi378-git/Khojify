import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Calendar, Check } from 'lucide-react'
import type { Match } from '../types'
import { ItemArt, fmtDate } from './ui'

export function Ring({ score }: { score: number }) {
  const [v, setV] = useState(0)
  useEffect(() => { const t = setTimeout(() => setV(score), 80); return () => clearTimeout(t) }, [score])
  const r = 34, c = 2 * Math.PI * r
  return (
    <div className="relative h-24 w-24 shrink-0" role="img" aria-label={`${score} percent match`}>
      <svg viewBox="0 0 80 80" className="-rotate-90"><circle cx="40" cy="40" r={r} fill="none" stroke="#EFE3D0" strokeWidth="8" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={score >= 65 ? '#35251D' : '#C47B59'} strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * v) / 100} style={{ transition: 'stroke-dashoffset 1s ease-out' }} /></svg>
      <span className="absolute inset-0 grid place-items-center text-xl font-extrabold">{score}%</span>
    </div>
  )
}

export default function MatchCard({ m }: { m: Match }) {
  const r = m.report
  return (
    <article className="card lift grid gap-5 p-5 sm:grid-cols-[150px_1fr]">
      <ItemArt category={r.category} color={r.color} photo={r.photo} className="h-36 rounded-2xl sm:h-full" />
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div><h3 className="text-lg font-bold">{r.name}</h3><p className="text-sm text-muted">{r.color} · {r.brand}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-muted"><MapPin size={14} />{r.location}</p><p className="flex items-center gap-2 text-sm text-muted"><Calendar size={14} />{fmtDate(r.date)}</p></div>
          <div className="text-center"><Ring score={m.score} /><p className="mt-1 text-xs font-bold text-moss">{m.label}</p></div>
        </div>
        <ul className="flex flex-wrap gap-2">{m.reasons.map((x) => <li key={x} className="flex items-center gap-1 rounded-full bg-sage px-3 py-1 text-xs font-medium text-moss"><Check size={12} />{x}</li>)}</ul>
        <details className="text-sm"><summary className="cursor-pointer font-semibold text-forest">Why this score?</summary>
          <ul className="mt-3 space-y-2">{m.breakdown.map((b) => <li key={b.factor}><div className="flex justify-between text-xs"><span>{b.factor}</span><span className="text-muted">{b.points} / {b.max}</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-sage"><div className="h-full rounded-full bg-gold" style={{ width: `${(b.points / b.max) * 100}%` }} /></div></li>)}</ul>
          <p className="mt-3 text-xs text-muted">A match score is not proof of ownership. Owners are verified privately.</p></details>
        <Link to={`/item/${r.id}`} className="btn-dark self-start">View Details</Link>
      </div>
    </article>
  )
}
