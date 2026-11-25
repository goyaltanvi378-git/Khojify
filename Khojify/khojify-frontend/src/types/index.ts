export type ReportType = 'lost' | 'found'
export type Status = 'Active' | 'Reunited'
export type Role = 'user' | 'moderator'
export interface Report {
  id: string; type: ReportType; name: string; category: string; color: string; brand: string
  location: string; date: string; time: string; description: string; status: Status
  reunitedAt?: string; photo?: string; extra?: string; mine?: boolean
  secret?: string // private identifying detail; accepted on create, never returned by public endpoints
}
export type ReportInput = Omit<Report, 'id' | 'status' | 'type' | 'reunitedAt' | 'mine'>
export interface BreakdownItem { factor: string; points: number; max: number }
export interface Match { report: Report; score: number; label: string; reasons: string[]; breakdown: BreakdownItem[] }
export interface MatchResponse { source: Report | null; query?: string; matches: Match[] }
export interface LocationStat { name: string; lost: number; found: number; top_items: { name: string; count: number }[]; recent: Report[] }
export interface Analytics {
  total: number; lost: number; found: number; reunited: number; active_lost: number
  by_category: { name: string; count: number }[]
  by_location: { name: string; count: number }[]
  top_lost_categories: { name: string; count: number }[]
  hotspots: { name: string; count: number }[]
  locations: LocationStat[]
}
export interface Notice { id: string; text: string; time: string; link: string; read: boolean; score?: number }
export type ClaimStatus = 'Pending Verification' | 'Additional Information Required' | 'Verified' | 'Rejected'
export interface Claim { id: string; code: string; reportId: string; reportName: string; detail: string; mark: string; proof?: string; status: ClaimStatus; note?: string; createdAt: string; reviewedAt?: string }
export interface ClaimReview extends Claim { claimant: string; reporterSecret?: string }
export interface ClaimInput { detail: string; mark: string; proof?: string }
