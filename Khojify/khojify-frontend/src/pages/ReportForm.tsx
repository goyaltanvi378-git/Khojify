import { useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { UploadCloud, X, CheckCircle2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import { PageHead } from '../components/ui'
import { useApp } from '../components/Providers'
import { createLostReport, createFoundReport, uploadPhoto } from '../services/api'
import { CATEGORIES, LOCATIONS } from '../services/demoData'
import type { Report } from '../types'

const today = () => new Date().toISOString().slice(0, 10)
export default function ReportForm({ kind }: { kind: 'lost' | 'found' }) {
  const lost = kind === 'lost', nav = useNavigate(), { toast } = useApp(), file = useRef<HTMLInputElement>(null)
  const [v, setV] = useState({ name: '', category: CATEGORIES[0], color: '', brand: '', location: LOCATIONS[0], date: today(), time: '12:00', description: '', extra: '', secret: '' })
  const [photo, setPhoto] = useState<string>(), [ok, setOk] = useState(false), [errs, setErrs] = useState<Record<string, string>>({}), [busy, setBusy] = useState(false), [done, setDone] = useState<Report | null>(null), [drag, setDrag] = useState(false)
  const on = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value })
  const pick = async (f?: File) => { if (!f) return; try { setPhoto(await uploadPhoto(f)) } catch (x) { toast((x as Error).message, 'err') } }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const er: Record<string, string> = {}
    if (v.name.trim().length < 2) er.name = 'Enter what the item is.'
    if (!v.color.trim()) er.color = 'Enter a colour.'
    if (v.description.trim().length < 10) er.description = 'Add at least 10 characters of detail.'
    if (new Date(v.date) > new Date()) er.date = 'Date cannot be in the future.'
    if (!ok) er.ok = 'Please confirm the details are accurate.'
    setErrs(er); if (Object.keys(er).length) return
    setBusy(true)
    try {
      const { color, brand, secret, ...rest } = v
      const r = await (lost ? createLostReport : createFoundReport)({ ...rest, color: color.trim(), brand: brand.trim() || 'Unknown', date: new Date(`${v.date}T${v.time}`).toISOString(), photo, secret: lost ? undefined : secret.trim() || undefined })
      setDone(r); toast('Report submitted')
    } catch (x) { toast((x as Error).message, 'err') } finally { setBusy(false) }
  }
  if (done) return (
    <div className="wrap grid place-items-center py-24 text-center">
      <span className="grid h-20 w-20 animate-pop place-items-center rounded-full bg-forest text-gold"><CheckCircle2 size={40} /></span>
      <h1 className="h2 mt-6">Report submitted.</h1><p className="mt-2 text-muted">Your report ID</p>
      <p className="mt-1 rounded-full bg-sage px-5 py-2 text-lg font-extrabold tracking-wider text-forest">{done.id}</p>
      <p className="mt-4 max-w-md text-muted">{lost ? 'We checked found reports for possible matches.' : 'We checked lost reports that might belong to this item, and matching owners get an in-app alert.'}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3"><button className="btn-dark" onClick={() => nav(`/matches/${done.id}`)}>See possible matches<ArrowRight size={16} /></button><Link to="/browse" className="btn-line">Browse board</Link></div>
    </div>
  )
  const Err = ({ k }: { k: string }) => errs[k] ? <p className="mt-1 text-xs font-medium text-red-700" role="alert">{errs[k]}</p> : null
  return (
    <div className="wrap max-w-3xl py-14">
      <PageHead title={lost ? "Let's find what you've lost." : 'You found something? That’s wonderful.'} sub={lost ? 'Share a few details. Your campus community is here to help.' : 'One small report could make someone’s day.'} />
      <form onSubmit={submit} noValidate className="card grid gap-5 p-6 sm:grid-cols-2 sm:p-8">
        <div><label className="label" htmlFor="name">Item name</label><input id="name" className="input" placeholder="e.g. Blue water bottle" value={v.name} onChange={on('name')} /><Err k="name" /></div>
        <div><label className="label" htmlFor="cat">Category</label><select id="cat" className="input" value={v.category} onChange={on('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="label" htmlFor="color">Colour</label><input id="color" className="input" placeholder="e.g. Navy" value={v.color} onChange={on('color')} /><Err k="color" /></div>
        <div><label className="label" htmlFor="brand">Brand <span className="font-normal text-muted">(optional)</span></label><input id="brand" className="input" placeholder="e.g. Milton" value={v.brand} onChange={on('brand')} /></div>
        <div><label className="label" htmlFor="loc">{lost ? 'Last seen location' : 'Found at location'}</label><select id="loc" className="input" value={v.location} onChange={on('location')}>{LOCATIONS.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="date">{lost ? 'Date lost' : 'Date found'}</label><input id="date" type="date" max={today()} className="input" value={v.date} onChange={on('date')} /><Err k="date" /></div>
          <div><label className="label" htmlFor="time">{lost ? 'Approx. time' : 'Time found'}</label><input id="time" type="time" className="input" value={v.time} onChange={on('time')} /></div></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="desc">Description</label><textarea id="desc" rows={3} className="input" placeholder="Stickers, scratches, contents, anything that stands out" value={v.description} onChange={on('description')} /><Err k="description" /></div>
        <div className="sm:col-span-2"><span className="label">Item photo <span className="font-normal text-muted">(optional)</span></span>
          {photo ? <div className="relative inline-block"><img src={photo} alt="Preview of uploaded item" className="h-40 rounded-2xl object-cover" /><button type="button" onClick={() => file.current?.click()} className="btn-line absolute bottom-2 left-2 !px-3 !py-1 text-xs">Replace</button><button type="button" onClick={() => setPhoto(undefined)} aria-label="Remove photo" className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-forest text-ivory"><X size={14} /></button></div>
            : <button type="button" onClick={() => file.current?.click()} onDragOver={(e) => { e.preventDefault(); setDrag(true) }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
              className={`grid w-full place-items-center gap-1 rounded-2xl border-2 border-dashed py-8 text-sm transition ${drag ? 'border-moss bg-sage' : 'border-line hover:border-moss'}`}><UploadCloud className="text-moss" /><span className="font-semibold">Drag a photo here or click to upload</span><span className="text-muted">JPG or PNG, up to 5 MB</span></button>}
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} /></div>
        {lost && <div className="sm:col-span-2"><label className="label" htmlFor="extra">Additional identifying details <span className="font-normal text-muted">(optional)</span></label><input id="extra" className="input" placeholder="Engraving, case, wallpaper..." value={v.extra} onChange={on('extra')} /></div>}
        {!lost && <div className="sm:col-span-2"><label className="label" htmlFor="secret">Private identifying detail <span className="font-normal text-muted">(never shown publicly)</span></label><input id="secret" className="input" placeholder="Something only the owner would know, e.g. initials inside" value={v.secret} onChange={on('secret')} /></div>}
        {!lost && <p className="flex gap-2 rounded-2xl bg-sage p-4 text-sm text-moss sm:col-span-2"><ShieldCheck size={18} className="shrink-0" />Never share sensitive personal information publicly. The rightful owner can verify their belongings privately.</p>}
        <div className="sm:col-span-2"><label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1 accent-forest" checked={ok} onChange={(e) => setOk(e.target.checked)} />I confirm that the information provided is accurate.</label><Err k="ok" /></div>
        <button disabled={busy} className="btn-dark sm:col-span-2 !py-3.5 disabled:opacity-70">{busy ? <><Loader2 size={16} className="animate-spin" />Submitting…</> : <>{lost ? 'Find My Item' : 'Submit Found Report'}<ArrowRight size={16} /></>}</button>
      </form>
    </div>
  )
}
