// Central API service. Set VITE_USE_DEMO=false and VITE_API_URL to use the FastAPI backend.
// Endpoints the backend must expose (demo mode implements the same behaviour in demoData.ts):
//   POST /reports/lost | /reports/found   GET /reports   GET /matches/{id}   GET /matches/search?q=   GET /matches/preview
//   PATCH /reports/{id}/reunited          GET /analytics (incl. per-location stats)
//   POST /uploads (multipart) -> {url}
//   GET /notifications  GET /notifications/unread-count  PATCH /notifications/{id}/read  PATCH /notifications/read-all
//   POST /claims  GET /claims -> {mine,toReview}  PATCH /claims/{id}/review {action,note}   (review requires reporter/moderator auth)
import type { Report, ReportInput, MatchResponse, Match, Analytics, Notice, Claim, ClaimInput, ClaimReview } from '../types'
import * as demo from './demoData'

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8000'
export const USE_DEMO = import.meta.env.VITE_USE_DEMO !== 'false'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('khojify_token')
  let res: Response
  try { res = await fetch(`${BASE}${path}`, { ...init, headers: { ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init?.headers } }) }
  catch { throw new Error('Cannot reach the KHOJIFY server. Check your connection or try again shortly.') }
  if (res.status === 401 || res.status === 403) throw new Error('You are not authorised to do that. Sign in with the right account.')
  if (!res.ok) throw new Error(`Request failed (${res.status}). Please try again.`)
  return res.json() as Promise<T>
}
const ping = () => window.dispatchEvent(new Event('khojify:notices'))
const body = (b: unknown, method = 'POST'): RequestInit => ({ method, body: JSON.stringify(b) })

export const getReports = (): Promise<Report[]> => (USE_DEMO ? demo.listReports() : request('/reports'))
export const createLostReport = (b: ReportInput): Promise<Report> => (USE_DEMO ? demo.createReport('lost', b) : request('/reports/lost', body(b)))
export const createFoundReport = async (b: ReportInput): Promise<Report> => { const r = await (USE_DEMO ? demo.createReport('found', b) : request<Report>('/reports/found', body(b))); ping(); return r }
export const getMatches = (id: string): Promise<MatchResponse> => (USE_DEMO ? demo.getMatches(id) : request(`/matches/${id}`))
export const searchMatches = (q: string): Promise<MatchResponse> => (USE_DEMO ? demo.searchMatches(q) : request(`/matches/search?q=${encodeURIComponent(q)}`))
export const previewMatch = (): Promise<Match> => (USE_DEMO ? demo.previewMatch() : request('/matches/preview'))
export const markReunited = (id: string): Promise<Report> => (USE_DEMO ? demo.markReunited(id) : request(`/reports/${id}/reunited`, { method: 'PATCH' }))
export const getAnalytics = (): Promise<Analytics> => (USE_DEMO ? demo.getAnalytics() : request('/analytics'))

export async function uploadPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Choose a JPG, PNG or WebP image.')
  if (file.size > 5_000_000) throw new Error('Image must be under 5 MB.')
  if (!USE_DEMO) { const f = new FormData(); f.append('file', file); return (await request<{ url: string }>('/uploads', { method: 'POST', body: f })).url }
  return new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result as string); r.onerror = () => no(new Error('Could not read the image.')); r.readAsDataURL(file) }) // demo only: stored in the browser
}

export const getNotices = (): Promise<Notice[]> => (USE_DEMO ? demo.listNotices() : request('/notifications'))
export const getUnread = async (): Promise<number> => { try { return USE_DEMO ? await demo.unreadCount() : (await request<{ count: number }>('/notifications/unread-count')).count } catch { return 0 } }
export const readNotice = async (id?: string): Promise<void> => { if (USE_DEMO) await demo.markNoticeRead(id); else { await request(id ? `/notifications/${id}/read` : '/notifications/read-all', { method: 'PATCH' }); ping() } }

export const createClaim = (id: string, b: ClaimInput): Promise<Claim> => (USE_DEMO ? demo.createClaim(id, b) : request('/claims', body({ report_id: id, ...b })))
export const getClaims = (): Promise<{ mine: Claim[]; toReview: ClaimReview[] }> => (USE_DEMO ? demo.listClaims() : request('/claims'))
export const reviewClaim = (id: string, action: 'approve' | 'reject' | 'more_info', note = ''): Promise<Claim> => (USE_DEMO ? demo.reviewClaim(id, action, note) : request(`/claims/${id}/review`, body({ action, note }, 'PATCH')))
