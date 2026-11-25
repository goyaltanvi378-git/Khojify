import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ImagePlus, ArrowRight, SearchX, PackageCheck, MapPin, Clock, ClipboardList, GitMerge, HeartHandshake, FileText, PackageSearch, Flame } from 'lucide-react'
import ItemCard from '../components/ItemCard'
import StatsCard from '../components/StatsCard'
import { Badge, ErrorState, ItemArt, Skeleton, fmtDate } from '../components/ui'
import { Ring } from '../components/MatchCard'
import { useApp } from '../components/Providers'
import { useAsync } from '../hooks/useAsync'
import { getReports, getAnalytics, previewMatch } from '../services/api'

const chips = ['ID Card', 'Bottle', 'Charger', 'Backpack', 'Hoodie']
const HEIGHTS = ['h-44', 'h-60', 'h-52', 'h-64', 'h-48', 'h-56']

export default function Home() {
  const nav = useNavigate(), { toast } = useApp(), [q, setQ] = useState('')
  const reports = useAsync(getReports), stats = useAsync(getAnalytics), preview = useAsync(previewMatch)
  const active = reports.data?.filter((r) => r.status === 'Active') || []
  const go = (term: string) => nav(`/matches?q=${encodeURIComponent(term)}`)
  const top3 = new Set(stats.data?.hotspots.map((h) => h.name))
  const maxLoc = Math.max(...(stats.data?.locations.map((l) => l.lost + l.found) || [1]), 1)
  return (
    <>
      {/* HERO: centred, search-first */}
      <section className="px-3 pt-6"><div className="mx-auto max-w-6xl overflow-hidden rounded-[36px] bg-beige/60 px-5 pb-24 pt-16 text-center sm:px-10 sm:pt-20">
        <p className="mb-5 text-xs font-bold tracking-[0.18em] text-moss">THE SMARTER WAY TO FIND WHAT’S LOST</p>
        <h1 className="mx-auto max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-tight text-forest sm:text-7xl">Lost it?<br />Let’s <span className="font-serif font-medium italic text-gold">KHOJIFY</span> it.</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted">From misplaced ID cards to forgotten water bottles, reconnect with your belongings through the power of your campus community.</p>
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()) }} className="mx-auto mt-9 flex max-w-2xl items-center gap-2 rounded-full border border-line bg-ivory p-2 pl-5 shadow-soft">
          <Search size={20} className="shrink-0 text-muted" />
          <input aria-label="Search" className="min-w-0 flex-1 bg-transparent py-2.5 text-base outline-none" placeholder="Search an item, colour, brand or location..." value={q} onChange={(e) => setQ(e.target.value)} />
          <button type="button" className="btn-line hidden !px-3.5 sm:inline-flex" onClick={() => toast('Photo search is not available yet. Attach a photo when you report an item instead.', 'err')}><ImagePlus size={16} />Photo</button>
          <button className="btn-dark !px-6">Search</button>
        </form>
        <div className="mt-5 flex flex-wrap justify-center gap-2"><span className="py-2 text-sm text-muted">Popular:</span>{chips.map((c) => <button key={c} onClick={() => go(c)} className="btn-line !py-2 !text-xs">{c}</button>)}</div>
      </div></section>

      {/* QUICK ACTIONS overlap the hero */}
      <section className="wrap -mt-14 grid gap-5 md:grid-cols-2">
        <Link to="/report-lost" className="card lift group relative overflow-hidden bg-ivory p-8 shadow-soft">
          <SearchX size={110} strokeWidth={1} className="absolute -right-4 -top-4 text-beige transition group-hover:rotate-6" aria-hidden />
          <p className="text-xs font-bold tracking-[0.16em] text-terra">I LOST SOMETHING</p><h2 className="mt-3 max-w-xs text-2xl font-extrabold">Tell us what went missing. Let’s find it together.</h2>
          <span className="mt-6 inline-flex items-center gap-2 font-semibold text-forest">Report Lost Item<ArrowRight size={16} className="transition group-hover:translate-x-1" /></span></Link>
        <Link to="/report-found" className="card lift group relative overflow-hidden border-forest bg-forest p-8 text-ivory shadow-soft">
          <PackageCheck size={110} strokeWidth={1} className="absolute -right-4 -top-4 text-moss transition group-hover:-rotate-6" aria-hidden />
          <p className="text-xs font-bold tracking-[0.16em] text-gold">I FOUND SOMETHING</p><h2 className="mt-3 max-w-xs text-2xl font-extrabold">You found it. Someone is looking for it.</h2>
          <span className="mt-6 inline-flex items-center gap-2 font-semibold text-gold">Report Found Item<ArrowRight size={16} className="transition group-hover:translate-x-1" /></span></Link>
      </section>

      {/* LIVE ACTIVITY + STATS */}
      <section className="wrap grid gap-8 py-20 lg:grid-cols-[1.3fr_1fr]">
        <div className="card p-6"><div className="mb-4 flex items-center gap-2"><span className="relative flex h-2.5 w-2.5"><span className="absolute h-full w-full animate-ping rounded-full bg-terra opacity-60" /><span className="h-2.5 w-2.5 rounded-full bg-terra" /></span><h2 className="text-xl font-extrabold">Live campus activity</h2></div>
          {reports.error && <ErrorState message={reports.error} retry={reports.reload} />}
          {reports.loading ? <Skeleton className="h-72" /> : <ul className="divide-y divide-line">{active.slice(0, 5).map((r) => (
            <li key={r.id} className="flex items-center gap-4 py-3"><ItemArt category={r.category} color={r.color} photo={r.photo} className="h-14 w-14 shrink-0 rounded-2xl [&>div:last-child]:h-10 [&>div:last-child]:w-10 [&>div:last-child>svg]:h-5 [&>div:last-child>svg]:w-5" />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{r.name} <span className="font-normal text-muted">reported {r.type} near {r.location}</span></p><p className="flex items-center gap-1 text-xs text-muted"><Clock size={12} />{fmtDate(r.date)}</p></div>
              <Badge type={r.type} /><Link to={`/item/${r.id}`} className="btn-line !px-3.5 !py-1.5 text-xs">View report</Link></li>))}</ul>}</div>
        <div><div className="grid grid-cols-2 gap-4">
          {stats.loading ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36" />) : stats.data && <><StatsCard icon={FileText} label="Total Reports" value={stats.data.total} /><StatsCard icon={PackageSearch} label="Lost Items" value={stats.data.lost} /><StatsCard icon={PackageCheck} label="Found Items" value={stats.data.found} /><StatsCard icon={HeartHandshake} label="Successfully Reunited" value={stats.data.reunited} /></>}</div>
          {stats.error && <ErrorState message={stats.error} retry={stats.reload} />}<p className="mt-3 text-xs text-muted">Sample records are fictional demo data.</p></div>
      </section>

      {/* RECENT: masonry */}
      <section className="wrap pb-20">
        <div className="mb-8 flex items-end justify-between gap-4"><h2 className="h2 max-w-lg">Recently <span className="font-serif font-medium italic text-gold">reported</span> items</h2><Link to="/browse" className="btn-line">View All Reports<ArrowRight size={16} /></Link></div>
        {reports.loading ? <div className="grid gap-6 sm:grid-cols-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-80" />)}</div> : <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">{active.slice(0, 6).map((r, i) => <ItemCard key={r.id} r={r} h={HEIGHTS[i % 6]} />)}</div>}
      </section>

      {/* SMARTMATCH PREVIEW */}
      <section className="bg-sage py-20"><div className="wrap">
        <h2 className="h2 mx-auto mb-10 max-w-xl text-center">Two reports. One happy <span className="font-serif font-medium italic text-gold">reunion.</span></h2>
        {preview.error && <ErrorState message={preview.error} retry={preview.reload} />}
        {preview.loading ? <Skeleton className="mx-auto h-56 max-w-4xl" /> : preview.data && (
          <div className="mx-auto grid max-w-4xl items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
            <div className="card p-5"><Badge type="lost" /><p className="mt-3 text-lg font-bold">Navy Milton Water Bottle</p><p className="text-sm text-muted">Sample lost report · Library</p></div>
            <div className="flex flex-col items-center gap-2"><svg width="120" height="24" viewBox="0 0 120 24" className="hidden md:block" aria-hidden><path d="M2 12H118" stroke="#B58A62" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" className="animate-dash" /></svg><Ring score={preview.data.score} /><p className="text-sm font-bold text-moss">{preview.data.score}% Potential Match</p></div>
            <div className="card p-5"><Badge type="found" /><p className="mt-3 text-lg font-bold">{preview.data.report.name}</p><p className="text-sm text-muted">Sample found report · {preview.data.report.location}</p></div>
          </div>)}
        {preview.data && <ul className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">{preview.data.reasons.map((x) => <li key={x} className="rounded-full bg-ivory px-4 py-1.5 text-sm font-medium text-moss">{x}</li>)}</ul>}
        <div className="mt-8 text-center"><Link to="/matches" className="btn-dark">Explore Smart Matches<ArrowRight size={16} /></Link><p className="mt-3 text-xs text-muted">Score calculated by the matching service from two sample reports.</p></div>
      </div></section>

      {/* HOTSPOTS */}
      <section className="wrap py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><h2 className="h2 max-w-md">Where do things go missing most?</h2><Link to="/hotspots" className="btn-line">Open hotspot map<ArrowRight size={16} /></Link></div>
        {stats.data && <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{stats.data.locations.map((l) => { const n = l.lost + l.found, hot = top3.has(l.name); return (
            <Link key={l.name} to="/hotspots" className={`card lift p-5 ${hot ? 'border-terra bg-sage' : ''}`}><MapPin size={18} className={hot ? 'text-terra' : 'text-muted'} /><p className="mt-3 font-bold">{l.name}</p><p className="text-2xl font-extrabold">{n}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-beige"><div className="h-full rounded-full bg-terra" style={{ width: `${(n / maxLoc) * 100}%` }} /></div>{hot && <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-terra"><Flame size={12} />Top 3 hotspot</p>}</Link>) })}</div>
          <p className="mt-5 text-muted">The {stats.data.hotspots[0].name} has the highest number of reported missing items.</p></>}
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="scroll-mt-28 bg-forest py-20 text-ivory"><div className="wrap">
        <h2 className="h2 mb-12">How KHOJIFY works</h2>
        <ol className="grid gap-8 md:grid-cols-3">{[[ClipboardList, 'REPORT', 'Tell us what you lost or found.'], [GitMerge, 'MATCH', 'Our smart system discovers potential matches.'], [HeartHandshake, 'REUNITE', 'Verify ownership and get your belongings back.']].map(([I, t, d], i) => { const Icon = I as typeof Search; return (
          <li key={t as string} className="rounded-3xl border border-ivory/15 p-6"><div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-gold text-deep"><Icon size={22} /></span><span className="font-serif text-4xl italic text-gold">0{i + 1}</span></div><h3 className="mt-5 text-lg font-bold tracking-wide">{t as string}</h3><p className="mt-1 text-ivory/70">{d as string}</p></li>) })}</ol>
      </div></section>
    </>
  )
}
