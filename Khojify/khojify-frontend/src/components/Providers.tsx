import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle } from 'lucide-react'

interface User { name: string; email: string; role?: 'user' | 'moderator' }
interface Toast { id: number; msg: string; kind: 'ok' | 'err' }
interface Ctx { toast: (msg: string, kind?: 'ok' | 'err') => void; user: User | null; signIn: (u: User) => void; signOut: () => void }
const AppCtx = createContext<Ctx>(null as unknown as Ctx)
export const useApp = () => useContext(AppCtx)

export function Providers({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [user, setUser] = useState<User | null>(() => { try { return JSON.parse(localStorage.getItem('khojify_demo_user') || 'null') } catch { return null } })
  const toast = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, msg, kind }]); setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])
  const signIn = (u: User) => { localStorage.setItem('khojify_demo_user', JSON.stringify(u)); setUser(u) }
  const signOut = () => { localStorage.removeItem('khojify_demo_user'); setUser(null) }
  return (
    <AppCtx.Provider value={{ toast, user, signIn, signOut }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[60] flex flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="flex animate-rise items-center gap-2 rounded-2xl bg-forest px-4 py-3 text-sm font-medium text-ivory shadow-soft">
            {t.kind === 'ok' ? <CheckCircle2 size={16} className="text-gold" /> : <AlertCircle size={16} className="text-red-300" />}{t.msg}
          </div>
        ))}
      </div>
    </AppCtx.Provider>
  )
}
