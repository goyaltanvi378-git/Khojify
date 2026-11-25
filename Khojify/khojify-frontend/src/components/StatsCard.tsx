import type { LucideIcon } from 'lucide-react'
export default function StatsCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <div className="card lift p-6"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-sage text-moss"><Icon size={20} /></span>
      <p className="mt-4 text-4xl font-extrabold tracking-tight text-forest">{value}</p><p className="mt-1 text-sm text-muted">{label}</p></div>
  )
}
