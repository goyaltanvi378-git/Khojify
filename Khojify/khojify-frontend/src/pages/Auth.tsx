import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Info } from 'lucide-react'
import BrandArt from '../components/BrandArt'
import { Logo } from '../components/ui'
import { useApp } from '../components/Providers'

type Mode = 'login' | 'signup' | 'forgot'
const COPY = { login: ['Welcome back.', 'Sign in'], signup: ['Join your campus community.', 'Create account'], forgot: ['Reset your password.', 'Send reset link'] }

export default function Auth({ mode }: { mode: Mode }) {
  const { signIn, toast } = useApp(), nav = useNavigate()
  const [mod, setMod] = useState(false), [f, setF] = useState({ name: '', email: '', password: '', confirm: '' }), [err, setErr] = useState('')
  const on = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr('Enter a valid email address.')
    if (mode === 'forgot') { toast('Demo mode: no email was sent.'); return nav('/login') }
    if (f.password.length < 8) return setErr('Password must be at least 8 characters.')
    if (mode === 'signup') { if (f.name.trim().length < 2) return setErr('Enter your full name.'); if (f.password !== f.confirm) return setErr('Passwords do not match.') }
    signIn({ name: mode === 'signup' ? f.name.trim() : f.email.split('@')[0], email: f.email, role: mod ? 'moderator' : 'user' }); toast('Signed in (demo mode)'); nav('/profile')
  }
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden place-items-center bg-beige p-10 lg:grid"><div className="max-w-md"><BrandArt className="w-full" /><p className="mt-6 font-serif text-2xl italic text-moss">Lost it? Let’s KHOJIFY it!!!</p></div></div>
      <div className="grid place-items-center p-6">
        <form onSubmit={submit} noValidate className="w-full max-w-sm space-y-4">
          <Logo /><h1 className="pt-4 text-3xl font-extrabold">{COPY[mode][0]}</h1>
          <p className="flex gap-2 rounded-2xl bg-sage p-3 text-xs text-moss"><Info size={16} className="shrink-0" />Demo mode: no real authentication happens. Do not enter a real password.</p>
          {mode === 'signup' && <div><label className="label" htmlFor="n">Full name</label><input id="n" className="input" value={f.name} onChange={on('name')} autoComplete="name" /></div>}
          <div><label className="label" htmlFor="e">{mode === 'signup' ? 'University email' : 'Email'}</label><input id="e" type="email" className="input" value={f.email} onChange={on('email')} autoComplete="email" /></div>
          {mode !== 'forgot' && <div><label className="label" htmlFor="p">Password</label><input id="p" type="password" className="input" value={f.password} onChange={on('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></div>}
          {mode === 'signup' && <div><label className="label" htmlFor="c">Confirm password</label><input id="c" type="password" className="input" value={f.confirm} onChange={on('confirm')} autoComplete="new-password" /></div>}
          {mode === 'login' && <div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2"><input type="checkbox" className="accent-forest" />Remember me</label><Link to="/forgot-password" className="font-semibold text-forest">Forgot password?</Link></div>}
          {mode !== 'forgot' && <label className="flex items-start gap-2 text-xs text-muted"><input type="checkbox" className="mt-0.5 accent-forest" checked={mod} onChange={(e) => setMod(e.target.checked)} />Demo only: sign in as a moderator to review claims. Real moderator roles must be granted by the backend.</label>}
          {err && <p role="alert" className="text-sm font-medium text-red-700">{err}</p>}
          <button className="btn-dark w-full !py-3">{COPY[mode][1]}</button>
          <p className="text-center text-sm text-muted">{mode === 'login' ? <>New here? <Link className="font-semibold text-forest" to="/signup">Create account</Link></> : <>Already registered? <Link className="font-semibold text-forest" to="/login">Sign in</Link></>}</p>
        </form>
      </div>
    </div>
  )
}
