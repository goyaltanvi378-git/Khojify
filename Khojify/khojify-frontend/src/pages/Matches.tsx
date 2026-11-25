import { useState } from 'react'
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { Sparkles, Search } from 'lucide-react'
import MatchCard from '../components/MatchCard'
import { Badge, ItemArt, ErrorState, Skeleton, fmtDate } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { getMatches, searchMatches } from '../services/api'
import type { MatchResponse } from '../types'

export default function Matches() {
  const { id } = useParams(), [sp] = useSearchParams(), nav = useNavigate(), q = (sp.get('q') || '').trim(), [text, setText] = useState(q)
  const { data, loading, error, reload } = useAsync<MatchResponse | null>(() => (id ? getMatches(id) : q ? searchMatches(q) : Promise.resolve(null)), [id, q])
  const s = data?.source
  return (
    <div className="wrap max-w-4xl py-14">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-moss"><Sparkles size={16} />Smart matching</p>
      <h1 className="h1">{id ? (data?.matches.length ? 'We might have found a match!' : 'No exact match yet.') : 'Describe it. We’ll look for it.'}</h1>
      {!id && <><form onSubmit={(e) => { e.preventDefault(); if (text.trim()) nav(`/matches?q=${encodeURIComponent(text.trim())}`) }} className="mt-6 flex items-center gap-2 rounded-full border border-line bg-ivory p-1.5 pl-5 shadow-soft"><Search size={18} className="text-muted" /><input aria-label="Describe your item" className="min-w-0 flex-1 bg-transparent py-2 outline-none" placeholder="e.g. navy bottle" value={text} onChange={(e) => setText(e.target.value)} /><button className="btn-dark">Find matches</button></form>
        <p className="mt-3 text-sm text-muted">Smart matching understands related words: navy ≈ blue, bottle ≈ water bottle, mobile ≈ phone, backpack ≈ school bag.</p></>}
      {error && <div className="mt-8"><ErrorState message={error} retry={reload} /></div>}
      {loading && <div className="mt-8 grid gap-5"><Skeleton className="h-56" /><Skeleton className="h-56" /></div>}
      {s && <div className="card mt-8 flex items-center gap-5 bg-sage p-5"><ItemArt category={s.category} color={s.color} photo={s.photo} className="h-24 w-24 shrink-0 rounded-2xl" /><div><Badge type={s.type} /><h2 className="mt-2 text-xl font-bold">{s.name}</h2><p className="text-sm text-muted">{s.color} · {s.brand} · {s.location} · {fmtDate(s.date)} · {s.id}</p></div></div>}
      {data && !loading && (data.matches.length ? <>
        <h2 className="mb-5 mt-10 text-2xl font-extrabold">Potential Matches</h2><div className="grid gap-5">{data.matches.map((m) => <MatchCard key={m.report.id} m={m} />)}</div>
        <Link to="/browse" className="btn-line mt-8">View All Matches</Link></>
        : <div className="card mt-10 p-10 text-center"><p className="text-lg text-muted">No exact match yet. Don't worry, we'll keep {id ? 'your report' : 'looking: report it'} on the board.</p><Link to={id ? '/browse' : '/report-lost'} className="btn-dark mt-5">{id ? 'Browse All Reports' : 'Report Lost Item'}</Link></div>)}
    </div>
  )
}
