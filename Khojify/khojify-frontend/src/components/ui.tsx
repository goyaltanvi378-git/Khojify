import { Link } from 'react-router-dom'
import { Search, SearchX, AlertTriangle, Laptop, FileText, Backpack, Glasses, Shirt, BookOpen, GlassWater, Package, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="KHOJIFY home">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest text-gold">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 21s-6-5.2-6-10a6 6 0 0 1 12 0c0 4.8-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /><path d="m13.8 12.8 2 2" /></svg>
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-ivory' : 'text-forest'}`}>KHOJIFY</span>
    </Link>
  )
}

export const CAT_ICON: Record<string, LucideIcon> = { Electronics: Laptop, Documents: FileText, Bags: Backpack, Accessories: Glasses, Clothing: Shirt, Books: BookOpen, 'Water Bottles': GlassWater, Other: Package }
const SWATCH: Record<string, string> = { Black: '#222', Blue: '#2F6BB5', White: '#9AA5A0', Grey: '#7C8884', Red: '#B8453B', Green: '#2F7D52', Navy: '#1E3A6B', Brown: '#7A5233' }

// Illustrated tile in place of stock photos: category icon tinted with the item colour
export function ItemArt({ category, color, photo, className = '' }: { category: string; color: string; photo?: string; className?: string }) {
  const Icon = CAT_ICON[category] || Package
  if (photo) return <img src={photo} alt="" loading="lazy" className={`object-cover ${className}`} />
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-sage ${className}`} aria-hidden>
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(#E5D2B8 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
      <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-ivory shadow-soft transition duration-500 group-hover:scale-110">
        <Icon size={38} strokeWidth={1.6} style={{ color: SWATCH[color] || '#79543B' }} />
      </div>
    </div>
  )
}

export const Badge = ({ type }: { type: 'lost' | 'found' }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-bold ${type === 'lost' ? 'bg-gold text-deep' : 'bg-forest text-ivory'}`}>{type === 'lost' ? 'LOST' : 'FOUND'}</span>
)

export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-shimmer rounded-2xl bg-gradient-to-r from-sage via-cream to-sage bg-[length:200%_100%] ${className}`} />
)

export function Empty({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="card col-span-full grid place-items-center gap-3 px-6 py-16 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-sage text-moss"><SearchX size={28} /></span>
      <h3 className="text-xl font-bold">{title}</h3><p className="max-w-sm text-muted">{text}</p>{action}
    </div>
  )
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="card col-span-full grid place-items-center gap-3 px-6 py-14 text-center" role="alert">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-red-50 text-red-700"><AlertTriangle size={24} /></span>
      <p className="max-w-md text-muted">{message}</p>
      {retry && <button className="btn-dark" onClick={retry}>Try again</button>}
    </div>
  )
}

export const PageHead = ({ title, sub }: { title: ReactNode; sub?: string }) => (
  <div className="mb-10"><h1 className="h1 max-w-3xl">{title}</h1>{sub && <p className="mt-3 max-w-xl text-lg text-muted">{sub}</p>}</div>
)

export const SearchIcon = Search
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ', ' + new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
