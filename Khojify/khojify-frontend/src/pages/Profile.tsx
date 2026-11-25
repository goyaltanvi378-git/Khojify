import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { PartyPopper } from 'lucide-react'
import { ErrorState, PageHead, Skeleton } from '../components/ui'
import { useApp } from '../components/Providers'
import { useAsync } from '../hooks/useAsync'
import { getReports, getClaims, reviewClaim } from '../services/api'
import type { ClaimReview } from '../types'

export default function Profile() {
  const { user, signIn, toast } = useApp(), reports = useAsync(getReports), claims = useAsync(getClaims, [user?.email])
  const [f, setF] = useState({ name: user?.name || '', email: user?.email || '' }), [notes, setNotes] = useState<Record<string, string>>({}), [party, setParty] = useState(false)
  if (!user) return <Navigate to="/login" replace />
  const mine = (reports.data || []).filter((r) => r.mine)
  const review = async (c: ClaimReview, a: 'approve' | 'reject' | 'more_info') => {
    try { await reviewClaim(c.id, a, notes[c.id]); if (a === 'approve') { setParty(true); setTimeout(() => setParty(false), 2800) } else toast('Claim updated'); claims.reload(); reports.reload() }
    catch (e) { toast((e as Error).message, 'err') }
  }
  const List = ({ t, rows }: { t: string; rows: typeof mine }) => <section className="card p-6"><h3 className="mb-3 text-lg font-bold">{t} <span className="text-muted">({rows.length})</span></h3>
    {rows.length ? <ul className="divide-y divide-line">{rows.map((r) => <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm"><Link to={`/item/${r.id}`} className="font-semibold hover:text-moss">{r.name}</Link><span className="flex items-center gap-3"><span className="rounded-full bg-sage px-2.5 py-1 text-xs font-semibold text-moss">{r.status}</span><Link to={`/matches/${r.id}`} className="text-forest underline">Matches</Link></span></li>)}</ul> : <p className="text-sm text-muted">Nothing here yet.</p>}</section>
  return (
    <div className="wrap py-14">
      {party && <div className="fixed inset-0 z-[70] grid place-items-center bg-deep/70" role="status"><div className="animate-pop rounded-3xl bg-ivory p-10 text-center"><PartyPopper size={48} className="mx-auto text-terra" /><p className="mt-3 text-2xl font-extrabold">One more belonging found its way home!</p></div></div>}
      <PageHead title="Your profile" />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <form className="card h-fit space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); if (f.name.trim().length < 2) return toast('Enter your name.', 'err'); signIn({ ...user, name: f.name.trim(), email: f.email }); toast('Profile updated') }}>
          <div className="grid h-20 w-20 place-items-center rounded-full bg-forest text-3xl font-extrabold text-gold">{user.name[0]?.toUpperCase()}</div>
          <p className="text-xs font-semibold text-moss">{user.role === 'moderator' ? 'Demo moderator' : 'Member'}</p>
          <div><label className="label" htmlFor="pn">Name</label><input id="pn" className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div><label className="label" htmlFor="pe">Email</label><input id="pe" type="email" className="input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
          <button className="btn-dark w-full">Save changes</button>
        </form>
        <div className="grid gap-5">
          {reports.loading ? <Skeleton className="h-40" /> : <><List t="My Lost Reports" rows={mine.filter((r) => r.type === 'lost')} /><List t="My Found Reports" rows={mine.filter((r) => r.type === 'found')} /><List t="My Reunited Items" rows={mine.filter((r) => r.status === 'Reunited')} /></>}
          <section className="card p-6"><h3 className="mb-3 text-lg font-bold">My claims</h3>
            {claims.error && <ErrorState message={claims.error} retry={claims.reload} />}
            {claims.data?.mine.length ? <ul className="divide-y divide-line text-sm">{claims.data.mine.map((c) => <li key={c.id} className="py-3"><div className="flex justify-between gap-3"><span className="font-semibold">{c.reportName}</span><span className="rounded-full bg-sage px-2.5 py-1 text-xs font-semibold text-moss">{c.status}</span></div><p className="text-xs text-muted">Reference {c.code}{c.note ? ` · Reviewer note: ${c.note}` : ''}</p></li>)}</ul> : <p className="text-sm text-muted">You haven’t claimed anything yet.</p>}</section>
          <section className="card p-6"><h3 className="mb-1 text-lg font-bold">Claims to review</h3><p className="mb-3 text-xs text-muted">Visible to the reporter of the found item and to moderators. Compare the claimant’s private answers with what was stored.</p>
            {claims.data?.toReview.length ? <ul className="space-y-4">{claims.data.toReview.map((c) => { const open = ['Pending Verification', 'Additional Information Required'].includes(c.status); return (
              <li key={c.id} className="rounded-2xl border border-line p-4 text-sm"><div className="flex justify-between gap-3"><span className="font-bold">{c.reportName} · {c.claimant}</span><span className="rounded-full bg-sage px-2.5 py-1 text-xs font-semibold text-moss">{c.status}</span></div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-sage p-3"><p className="text-xs font-semibold text-muted">Claimant’s hidden detail</p><p>{c.detail}</p><p className="mt-2 text-xs font-semibold text-muted">Unique mark</p><p>{c.mark}</p></div>
                  <div className="rounded-xl bg-sage p-3"><p className="text-xs font-semibold text-muted">Stored by the reporter</p><p>{c.reporterSecret || 'No private detail was stored. Ask for more information.'}</p></div></div>
                {open && <div className="mt-3 space-y-2"><input className="input" placeholder="Optional note to the claimant" value={notes[c.id] || ''} onChange={(e) => setNotes({ ...notes, [c.id]: e.target.value })} /><div className="flex flex-wrap gap-2"><button className="btn-dark !py-2" onClick={() => review(c, 'approve')}>Approve</button><button className="btn-line !py-2" onClick={() => review(c, 'more_info')}>Need more info</button><button className="btn-line !py-2" onClick={() => review(c, 'reject')}>Reject</button></div></div>}</li>) })}</ul> : <p className="text-sm text-muted">No claims waiting for you.</p>}</section>
        </div>
      </div>
    </div>
  )
}
