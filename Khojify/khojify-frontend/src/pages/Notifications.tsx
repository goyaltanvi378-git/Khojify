import { Link } from 'react-router-dom'
import { Bell, Info, CheckCheck } from 'lucide-react'
import { Empty, ErrorState, PageHead, Skeleton } from '../components/ui'
import { useAsync } from '../hooks/useAsync'
import { getNotices, readNotice } from '../services/api'
import { useApp } from '../components/Providers'

export default function Notifications() {
  const { data, loading, error, reload, setData } = useAsync(getNotices), { toast } = useApp()
  const mark = async (id?: string) => { try { await readNotice(id); setData((data || []).map((n) => (!id || n.id === id ? { ...n, read: true } : n))) } catch (e) { toast((e as Error).message, 'err') } }
  return (
    <div className="wrap max-w-3xl py-14">
      <PageHead title="Match alerts" />
      <p className="mb-6 flex gap-2 rounded-2xl bg-sage p-3 text-sm text-moss"><Info size={16} className="mt-0.5 shrink-0" />In-app alerts generated when a new found report matches your lost report. These are not push notifications.</p>
      {data?.some((n) => !n.read) && <button className="btn-line mb-4" onClick={() => mark()}><CheckCheck size={16} />Mark all as read</button>}
      <div className="grid gap-3">
        {error && <ErrorState message={error} retry={reload} />}{loading && <Skeleton className="h-24" />}
        {!loading && !error && !data?.length && <Empty title="No alerts yet" text="Report a lost item. When a matching found report appears, you’ll see it here." action={<Link to="/report-lost" className="btn-dark">Report Lost Item</Link>} />}
        {data?.map((n) => <div key={n.id} className={`card flex items-start gap-4 p-5 ${n.read ? '' : 'border-terra bg-sage/60'}`}>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-forest text-gold"><Bell size={18} /></span>
          <div className="flex-1"><p className={n.read ? '' : 'font-semibold'}>{n.text}</p><p className="mt-1 text-xs text-muted">{n.score != null && <b className="text-moss">{n.score}% match · </b>}{new Date(n.time).toLocaleString('en-IN')}</p>
            <div className="mt-3 flex gap-2"><Link to={n.link} onClick={() => mark(n.id)} className="btn-dark !px-4 !py-1.5 text-xs">View matching report</Link>{!n.read && <button className="btn-line !px-4 !py-1.5 text-xs" onClick={() => mark(n.id)}>Mark as read</button>}</div></div>
          {!n.read && <span className="mt-2 h-2.5 w-2.5 rounded-full bg-terra" aria-label="Unread" />}</div>)}
      </div>
    </div>
  )
}
