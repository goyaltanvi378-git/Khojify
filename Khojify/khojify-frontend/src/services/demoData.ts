// DEMO backend: mirrors what the FastAPI backend must do (matching, alerts, claims, analytics).
// In API mode none of this runs: see services/api.ts for the endpoints to implement.
import type { Report, ReportInput, ReportType, Match, MatchResponse, Analytics, Notice, Claim, ClaimReview, ClaimInput, BreakdownItem, Role } from '../types'

export const CATEGORIES = ['Electronics', 'Documents', 'Bags', 'Accessories', 'Clothing', 'Books', 'Water Bottles', 'Other']
export const LOCATIONS = ['Library', 'Cafeteria', 'Academic Block', 'Computer Labs', 'Sports Ground', 'Parking Area']
export const COLORS = ['Black', 'Blue', 'Navy', 'White', 'Grey', 'Red', 'Green', 'Brown']

// ---------- Smart matching ----------
const STOP = new Set(['a', 'an', 'the', 'of', 'and', 'with', 'near', 'at', 'in', 'on', 'my', 'is', 'it', 'was', 'to', 'for', 'small', 'big'])
const COLOR_CANON: Record<string, string> = { navy: 'blue', 'dark blue': 'blue', 'royal blue': 'blue', 'sky blue': 'blue', 'light blue': 'blue', blue: 'blue', 'jet black': 'black', black: 'black', gray: 'grey', grey: 'grey', 'dark grey': 'grey', silver: 'grey', white: 'white', red: 'red', green: 'green', brown: 'brown' }
const COLOR_KEYS = Object.keys(COLOR_CANON).sort((a, b) => b.length - a.length)
const COLOR_WORDS = new Set(COLOR_KEYS.flatMap((k) => k.split(' ')))
const PHRASES: [RegExp, string][] = [[/water bottle|bottle|flask|sipper/g, 'bottle'], [/mobile phone|mobile|smartphone|phone/g, 'phone'], [/charging adapter|charging cable|charger|adapter/g, 'charger'], [/tote bag|school bag|backpack|rucksack|bag/g, 'backpack'], [/student id card|id card|identity card|student id/g, 'idcard'], [/airpods case|airpods|earbuds|earphones/g, 'earbuds'], [/hoodie|sweatshirt/g, 'hoodie'], [/spectacles|glasses/g, 'glasses'], [/notebook|diary/g, 'notebook']]
const NOUN_CAT: Record<string, string> = { bottle: 'Water Bottles', phone: 'Electronics', charger: 'Electronics', earbuds: 'Electronics', laptop: 'Electronics', calculator: 'Electronics', backpack: 'Bags', idcard: 'Documents', hoodie: 'Clothing', glasses: 'Accessories', umbrella: 'Accessories', notebook: 'Books' }
const BRANDS = ['milton', 'hp', 'apple', 'nike', 'mi', 'wildcraft', 'fybros', 'classmate', 'casio', 'ray-ban', 'boat', 'dell', 'samsung', 'cello']
const NEAR: Record<string, string[]> = { Library: ['Academic Block'], 'Academic Block': ['Library', 'Computer Labs', 'Cafeteria'], 'Computer Labs': ['Academic Block'], Cafeteria: ['Academic Block'], 'Sports Ground': ['Parking Area'], 'Parking Area': ['Sports Ground'] }

const canon = (s: string) => PHRASES.reduce((t, [re, to]) => t.replace(re, to), s.toLowerCase())
const tokens = (s: string) => canon(s).split(/[^a-z0-9-]+/).filter((w) => w && !STOP.has(w) && !COLOR_WORDS.has(w))
const nouns = (s: string) => tokens(s).filter((w) => w in NOUN_CAT)
const colorOf = (color: string, name: string) => { const t = `${color} ${name}`.toLowerCase(); const k = COLOR_KEYS.find((c) => t.includes(c)); return k ? { raw: k, canon: COLOR_CANON[k] } : null }
const brandOf = (b: string, text: string) => { const x = b.trim().toLowerCase(); if (x && !['unknown', 'generic', 'university', 'other'].includes(x)) return x; return tokens(text).find((w) => BRANDS.includes(w)) || '' }
const jac = (a: string[], b: string[]) => { const A = new Set(a), B = new Set(b); if (!A.size || !B.size) return 0; let i = 0; A.forEach((x) => B.has(x) && i++); return i / (A.size + B.size - i) }
const labelOf = (s: number) => (s >= 85 ? 'Excellent Match' : s >= 65 ? 'Strong Match' : s >= 40 ? 'Possible Match' : 'Low Confidence')

type Probe = Pick<Report, 'name' | 'category' | 'color' | 'brand' | 'location' | 'description'> & { date?: string }

function scorePair(a: Probe, b: Report) {
  const an = nouns(a.name), bn = nouns(b.name), catA = a.category || NOUN_CAT[an[0]] || '', catEq = !!catA && catA === b.category
  const item = !an.length || !bn.length ? Math.max(jac(tokens(a.name), tokens(b.name)), catEq ? 0.3 : 0) : an.some((n) => bn.includes(n)) ? 1 : catEq ? 0.3 : 0
  const ca = colorOf(a.color, a.name), cb = colorOf(b.color, b.name)
  const colour = !ca || !cb ? 0.5 : ca.raw === cb.raw ? 1 : ca.canon === cb.canon ? 0.85 : 0
  const ba = brandOf(a.brand, a.name), bb = brandOf(b.brand, b.name)
  const brand = !ba || !bb ? 0.5 : ba === bb ? 1 : 0
  const loc = !a.location ? 0.5 : a.location === b.location ? 1 : NEAR[a.location]?.includes(b.location) ? 0.45 : 0
  const days = a.date ? Math.abs(+new Date(a.date) - +new Date(b.date)) / 86400000 : -1
  const time = days < 0 ? 0.5 : days <= 1 ? 1 : days <= 3 ? 0.8 : days <= 7 ? 0.5 : days <= 14 ? 0.25 : 0
  const desc = Math.min(1, jac(tokens(a.description || a.name), tokens(b.description || b.name)) * 2)
  const parts: [string, number, number][] = [['Item similarity', item, 30], ['Colour similarity', colour, 20], ['Brand similarity', brand, 15], ['Location similarity', loc, 15], ['Time proximity', time, 10], ['Description similarity', desc, 10]]
  const breakdown: BreakdownItem[] = parts.map(([factor, s, max]) => ({ factor, max, points: Math.round(s * max * 10) / 10 }))
  const score = Math.min(100, Math.round(breakdown.reduce((t, x) => t + x.points, 0)))
  const reasons = [item >= 0.6 && 'Similar item type', colour >= 0.85 && (colour === 1 ? 'Matching colour' : 'Related colour (e.g. navy ≈ blue)'), brand === 1 && 'Matching brand', loc >= 0.45 && (loc === 1 ? 'Same location' : 'Nearby location'), time >= 0.8 && 'Reported close in time', desc >= 0.4 && 'Similar description'].filter(Boolean) as string[]
  return { score, breakdown, reasons }
}
const rank = (src: Probe, pool: Report[]): Match[] => pool.map((r) => ({ report: r, ...scorePair(src, r), label: '' })).map((m) => ({ ...m, label: labelOf(m.score) })).filter((m) => m.score >= 40).sort((a, b) => b.score - a.score).slice(0, 8)

// ---------- Seed data (150 fictional records) ----------
function rng(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 } }
const TEMPLATES: [string, string, string][] = [['Electronics', 'Laptop', 'HP'], ['Electronics', 'AirPods Case', 'Apple'], ['Electronics', 'Charging Adapter', 'Mi'], ['Documents', 'Student ID Card', 'University'], ['Bags', 'Backpack', 'Wildcraft'], ['Accessories', 'Umbrella', 'Fybros'], ['Clothing', 'Hoodie', 'Nike'], ['Books', 'Notebook', 'Classmate'], ['Water Bottles', 'Water Bottle', 'Milton'], ['Accessories', 'Spectacles', 'Ray-Ban'], ['Electronics', 'Calculator', 'Casio'], ['Bags', 'School Bag', 'Generic']]

function seed(): Report[] {
  const r = rng(42), pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)], now = Date.now(), H = 3600000
  const fixed: Report[] = [
    { id: 'KHJ-1001', type: 'found', name: 'Blue Milton Water Bottle', category: 'Water Bottles', color: 'Blue', brand: 'Milton', location: 'Library', date: new Date(now - 2 * H).toISOString(), time: '', description: 'Blue steel bottle with a small dent near the base, found on a reading table.', status: 'Active', secret: 'Initials “RS” scratched under the base' },
    { id: 'KHJ-1002', type: 'found', name: 'Black Mi Charging Adapter', category: 'Electronics', color: 'Black', brand: 'Mi', location: 'Computer Labs', date: new Date(now - 5 * H).toISOString(), time: '', description: 'Black phone charging adapter left plugged in near a lab desk.', status: 'Active', secret: 'Blue tape wrapped on the cable' },
    { id: 'KHJ-1003', type: 'lost', name: 'Grey Nike Hoodie', category: 'Clothing', color: 'Grey', brand: 'Nike', location: 'Academic Block', date: new Date(now - 9 * H).toISOString(), time: '', description: 'Grey hoodie lost after the afternoon lecture.', status: 'Active' },
    { id: 'KHJ-1004', type: 'lost', name: 'Navy Milton Water Bottle', category: 'Water Bottles', color: 'Navy', brand: 'Milton', location: 'Library', date: new Date(now - 26 * H).toISOString(), time: '', description: 'Navy water bottle with a faded sticker on the side.', status: 'Active' }
  ]
  const out: Report[] = []
  for (let i = 0; i < 146; i++) {
    const [category, name, brand] = TEMPLATES[Math.floor(Math.pow(r(), 1.4) * TEMPLATES.length)], color = pick(COLORS), type: ReportType = r() < 0.55 ? 'lost' : 'found'
    const location = LOCATIONS[Math.floor(Math.pow(r(), 1.6) * LOCATIONS.length)], d = new Date(now - 12 * H - r() * 40 * 86400000), reunited = r() < 0.18
    out.push({ id: `KHJ-${1005 + i}`, type, name: `${color} ${['Generic', 'University'].includes(brand) ? '' : brand + ' '}${name}`.replace(/\s+/g, ' ').trim(), category, color, brand, location, date: d.toISOString(), time: '',
      description: `${color} ${name.toLowerCase()} ${type === 'lost' ? 'last seen' : 'found'} near the ${location}. Small scratches, nothing else distinctive.`, status: reunited ? 'Reunited' : 'Active', reunitedAt: reunited ? new Date(d.getTime() + 86400000 * (1 + r() * 3)).toISOString() : undefined,
      secret: type === 'found' ? `Marked with the letters ${String.fromCharCode(65 + Math.floor(r() * 26))}${String.fromCharCode(65 + Math.floor(r() * 26))}` : undefined })
  }
  return [...fixed, ...out].sort((a, b) => +new Date(b.date) - +new Date(a.date)).map((x) => ({ ...x, time: new Date(x.date).toTimeString().slice(0, 5) }))
}
const SEED = seed()

// ---------- Persistence helpers ----------
const K = { rep: 'khojify_user_reports', reu: 'khojify_reunited', notes: 'khojify_notices', claims: 'khojify_claims', user: 'khojify_demo_user' }
const load = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || '') as T } catch { return d } }
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { throw new Error('Browser storage is full. Remove a photo and try again.') } }
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))
const ping = () => window.dispatchEvent(new Event('khojify:notices'))
interface Me { name: string; email: string; role?: Role }
const needUser = (): Me => { const u = load<Me | null>(K.user, null); if (!u) throw new Error('Sign in to continue.'); return u }

const all = (): Report[] => { const reu = load<Record<string, string>>(K.reu, {}); return [...load<Report[]>(K.rep, []), ...SEED].map((x) => (reu[x.id] ? { ...x, status: 'Reunited' as const, reunitedAt: reu[x.id] } : x)) }
const pub = (r: Report): Report => { const { secret: _s, ...rest } = r; return rest }

export async function listReports(): Promise<Report[]> { await delay(); return all().map(pub) }

export async function createReport(type: ReportType, input: ReportInput): Promise<Report> {
  await delay(500)
  const mine = load<Report[]>(K.rep, []), rep: Report = { ...input, type, id: `KHJ-${2001 + mine.length}`, status: 'Active', mine: true }
  save(K.rep, [rep, ...mine])
  if (type === 'found') { // instant match alerts for the owners of matching lost reports
    const notes = load<Notice[]>(K.notes, [])
    all().filter((l) => l.type === 'lost' && l.mine && l.status === 'Active').forEach((l) => {
      const s = scorePair(l, rep).score
      if (s >= 40) notes.unshift({ id: `n-${rep.id}-${l.id}`, text: `Good news! A ${rep.name.toLowerCase()} matching your lost ${l.name.toLowerCase()} has been reported near the ${rep.location}.`, time: new Date().toISOString(), link: `/matches/${l.id}`, read: false, score: s })
    })
    save(K.notes, notes); ping()
  }
  return pub(rep)
}

export async function getMatches(id: string): Promise<MatchResponse> {
  await delay(400)
  const list = all(), src = list.find((x) => x.id === id); if (!src) throw new Error('Report not found.')
  return { source: pub(src), matches: rank(src, list.filter((c) => c.type !== src.type && c.status === 'Active')).map((m) => ({ ...m, report: pub(m.report) })) }
}
export async function searchMatches(q: string): Promise<MatchResponse> {
  await delay(400)
  const probe: Probe = { name: q, category: '', color: '', brand: '', location: '', description: q }
  return { source: null, query: q, matches: rank(probe, all().filter((c) => c.type === 'found' && c.status === 'Active')).map((m) => ({ ...m, report: pub(m.report) })) }
}
export async function previewMatch(): Promise<Match> {
  await delay(250)
  const f = SEED.find((x) => x.id === 'KHJ-1001')!, l = SEED.find((x) => x.id === 'KHJ-1004')!
  const s = scorePair({ ...l, date: new Date(+new Date(f.date) - 6 * 3600000).toISOString() }, f)
  return { report: pub(f), ...s, label: labelOf(s.score) }
}
export async function markReunited(id: string): Promise<Report> {
  await delay(250)
  const u = needUser(), r = all().find((x) => x.id === id); if (!r) throw new Error('Report not found.')
  if (!(r.mine || u.role === 'moderator')) throw new Error('Only the reporter or a moderator can mark an item as reunited.')
  const reu = load<Record<string, string>>(K.reu, {}); reu[id] = new Date().toISOString(); save(K.reu, reu); return pub({ ...r, status: 'Reunited' })
}

export async function getAnalytics(): Promise<Analytics> {
  await delay(350)
  const l = all(), tally = (f: (r: Report) => string, src = l) => { const m = new Map<string, number>(); src.forEach((r) => m.set(f(r), (m.get(f(r)) || 0) + 1)); return [...m].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count) }
  const by_location = tally((r) => r.location)
  return { total: l.length, lost: l.filter((r) => r.type === 'lost').length, found: l.filter((r) => r.type === 'found').length, reunited: l.filter((r) => r.status === 'Reunited').length, active_lost: l.filter((r) => r.type === 'lost' && r.status === 'Active').length,
    by_category: tally((r) => r.category), by_location, top_lost_categories: tally((r) => r.category, l.filter((r) => r.type === 'lost')).slice(0, 3), hotspots: by_location.slice(0, 3),
    locations: LOCATIONS.map((name) => { const at = l.filter((r) => r.location === name); return { name, lost: at.filter((r) => r.type === 'lost').length, found: at.filter((r) => r.type === 'found').length, top_items: tally((r) => r.category, at).slice(0, 3), recent: at.slice(0, 4).map(pub) } }) }
}

// ---------- In-app notifications (backend-generated alerts, NOT push) ----------
export async function listNotices(): Promise<Notice[]> { await delay(150); return load<Notice[]>(K.notes, []) }
export async function unreadCount(): Promise<number> { return load<Notice[]>(K.notes, []).filter((n) => !n.read).length }
export async function markNoticeRead(id?: string): Promise<void> { save(K.notes, load<Notice[]>(K.notes, []).map((n) => (!id || n.id === id ? { ...n, read: true } : n))); ping() }

// ---------- Safe claim verification ----------
const canReview = (u: Me, r: Report | undefined) => !!r && (u.role === 'moderator' || !!r.mine)
export async function createClaim(reportId: string, input: ClaimInput): Promise<Claim> {
  await delay(500)
  const u = needUser(), r = all().find((x) => x.id === reportId)
  if (!r || r.type !== 'found' || r.status !== 'Active') throw new Error('This item is not open for claims.')
  if (input.detail.trim().length < 3 || input.mark.trim().length < 10) throw new Error('Add the hidden detail and a description of at least 10 characters.')
  const claims = load<(Claim & { claimantEmail: string; claimant: string })[]>(K.claims, [])
  if (claims.some((c) => c.reportId === reportId && c.claimantEmail === u.email && ['Pending Verification', 'Additional Information Required'].includes(c.status))) throw new Error('You already have an open claim for this item.')
  let code = ''; do { code = `KHOJ-${10000 + Math.floor(Math.random() * 90000)}` } while (claims.some((c) => c.code === code))
  const c = { id: `CLM-${claims.length + 1}`, code, reportId, reportName: r.name, ...input, status: 'Pending Verification' as const, createdAt: new Date().toISOString(), claimantEmail: u.email, claimant: u.name }
  save(K.claims, [c, ...claims]); return c
}
export async function listClaims(): Promise<{ mine: Claim[]; toReview: ClaimReview[] }> {
  await delay(250)
  const u = needUser(), claims = load<(Claim & { claimantEmail: string; claimant: string })[]>(K.claims, []), reports = all()
  return { mine: claims.filter((c) => c.claimantEmail === u.email), toReview: claims.filter((c) => c.claimantEmail !== u.email && canReview(u, reports.find((r) => r.id === c.reportId))).map((c) => ({ ...c, reporterSecret: reports.find((r) => r.id === c.reportId)?.secret })) }
}
export async function reviewClaim(id: string, action: 'approve' | 'reject' | 'more_info', note = ''): Promise<Claim> {
  await delay(400)
  const u = needUser(), claims = load<(Claim & { claimantEmail: string; claimant: string })[]>(K.claims, []), c = claims.find((x) => x.id === id)
  if (!c) throw new Error('Claim not found.')
  if (!canReview(u, all().find((r) => r.id === c.reportId)) || c.claimantEmail === u.email) throw new Error('You are not authorised to review this claim.')
  c.status = action === 'approve' ? 'Verified' : action === 'reject' ? 'Rejected' : 'Additional Information Required'; c.note = note || undefined; c.reviewedAt = new Date().toISOString(); save(K.claims, claims)
  if (action === 'approve') { const reu = load<Record<string, string>>(K.reu, {}); reu[c.reportId] = c.reviewedAt; save(K.reu, reu) }
  return c
}
