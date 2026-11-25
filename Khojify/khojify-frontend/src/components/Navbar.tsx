import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import { Plus, Menu, X, Bell, LogIn, LogOut } from 'lucide-react'
import { Logo } from './ui'
import { useApp } from './Providers'
import { getUnread } from '../services/api'

const links = [['/', 'Home'], ['/browse', 'Explore'], ['/matches', 'Smart Matches'], ['/insights', 'Campus Insights'], ['/hotspots', 'Hotspot Map']]

export default function Navbar() {
  const [open, setOpen] = useState(false), [unread, setUnread] = useState(0)
  const { user, signOut } = useApp(), loc = useLocation(), nav = useNavigate()
  useEffect(() => { const f = () => getUnread().then(setUnread); f(); window.addEventListener('khojify:notices', f); return () => window.removeEventListener('khojify:notices', f) }, [loc.pathname, user])
  useEffect(() => setOpen(false), [loc.pathname])
  const cls = ({ isActive }: { isActive: boolean }) => `rounded-full px-3.5 py-2 text-sm font-semibold transition ${isActive ? 'bg-forest text-ivory' : 'text-muted hover:bg-sage hover:text-forest'}`
  return (
    <header className="sticky top-3 z-50 px-3">
      <div className="mx-auto max-w-6xl rounded-[28px] border border-line bg-ivory/95 shadow-soft backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-5">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">{links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{l}</NavLink>)}</nav>
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="btn-line relative !px-3" aria-label={`Notifications, ${unread} unread`}><Bell size={16} />{unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-terra px-1 text-[11px] font-bold text-ivory">{unread}</span>}</Link>
            {user ? <><Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full bg-beige font-bold text-forest" aria-label="Profile">{user.name[0]?.toUpperCase()}</Link><button className="btn-line hidden !px-3 sm:inline-flex" onClick={() => { signOut(); nav('/') }} aria-label="Sign out"><LogOut size={16} /></button></>
              : <Link to="/login" className="btn hidden text-forest hover:bg-sage sm:inline-flex"><LogIn size={16} />Sign In</Link>}
            <Link to="/report-lost" className="btn-dark hidden sm:inline-flex"><Plus size={16} />Report an Item</Link>
            <button className="btn-line !px-3 lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Menu">{open ? <X size={18} /> : <Menu size={18} />}</button>
          </div>
        </div>
        {open && (
          <div className="animate-rise border-t border-line p-3 lg:hidden"><div className="flex flex-col gap-1">
            {links.map(([to, l]) => <NavLink key={to} to={to} end={to === '/'} className={cls}>{l}</NavLink>)}
            <Link to="/report-lost" className="btn-dark mt-2">Report Lost Item</Link><Link to="/report-found" className="btn-line">Report Found Item</Link>
            {user ? <button className="btn-line" onClick={() => { signOut(); nav('/') }}>Sign out</button> : <Link to="/login" className="btn-line">Sign In</Link>}
          </div></div>
        )}
      </div>
    </header>
  )
}
