import { Link } from 'react-router-dom'
import { Logo } from './ui'
import { useApp } from './Providers'

export default function Footer() {
  const { toast } = useApp()
  const info = (t: string) => (e: React.MouseEvent) => { e.preventDefault(); toast(`${t} content is provided by your institution.`) }
  return (
    <footer className="mt-24 bg-deep text-ivory">
      <div className="wrap grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div><Logo light /><p className="mt-4 font-serif text-xl italic text-gold">Lost it? Let’s KHOJIFY it!!!</p><p className="mt-2 max-w-xs text-sm text-ivory/70">Every lost thing deserves a way back.</p></div>
        <div className="flex flex-col gap-2 text-sm text-ivory/80"><Link to="/browse" className="hover:text-gold">Explore Reports</Link><Link to="/report-lost" className="hover:text-gold">Report Lost</Link><Link to="/report-found" className="hover:text-gold">Report Found</Link><Link to="/insights" className="hover:text-gold">Campus Insights</Link></div>
        <div className="flex flex-col gap-2 text-sm text-ivory/80">{['Contact', 'Privacy Policy'].map((t) => <a key={t} href="#" onClick={info(t)} className="hover:text-gold">{t}</a>)}</div>
      </div>
      <div className="border-t border-ivory/10 py-5 text-center text-xs text-ivory/50">© {new Date().getFullYear()} KHOJIFY. Sample records are fictional.</div>
    </footer>
  )
}
