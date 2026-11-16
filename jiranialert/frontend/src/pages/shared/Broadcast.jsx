import { useEffect, useState } from 'react'
import { ArrowLeft, CalendarDays, Megaphone } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { listSystemAnnouncements } from '../../lib/announcementApi'

function formatDate(value) {
  if (!value) return 'Recently'
  const date = value?.toDate ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleString()
}

export default function Broadcast() {
  const { id } = useParams()
  const [broadcast, setBroadcast] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false

    const loadBroadcast = async () => {
      try {
        const announcements = await listSystemAnnouncements()
        const match = announcements.find((announcement) => announcement.id === id)
        if (!cancelled) {
          setBroadcast(match || null)
          setStatus(match ? 'ready' : 'missing')
        }
      } catch {
        if (!cancelled) setStatus('error')
      }
    }

    void loadBroadcast()
    return () => {
      cancelled = true
    }
  }, [id])

  return (
    <main className="min-h-[calc(100svh-var(--announcement-bar-height))] bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-900">
          <ArrowLeft className="h-4 w-4" /> Back to Jirani Alert
        </Link>

        {status === 'loading' && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 text-sm font-semibold text-slate-600 shadow-sm">
            Loading broadcast...
          </div>
        )}

        {status === 'error' && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">
            This broadcast could not be loaded. Please try again later.
          </div>
        )}

        {status === 'missing' && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-black text-slate-950">Broadcast not found</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">This announcement may have been removed or is no longer available.</p>
          </div>
        )}

        {broadcast && (
          <article className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-slate-900 px-6 py-8 text-white sm:px-10 sm:py-10">
              <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.16em] text-blue-100">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                  <Megaphone className="h-5 w-5" />
                </span>
                Community broadcast
              </div>
              <h1 className="mt-6 break-words text-3xl font-black tracking-tight sm:text-4xl">{broadcast.title}</h1>
              <div className="mt-5 flex items-center gap-2 text-sm text-blue-100">
                <CalendarDays className="h-4 w-4" />
                <time dateTime={broadcast.createdAt?.toDate ? broadcast.createdAt.toDate().toISOString() : broadcast.createdAt}>
                  {formatDate(broadcast.createdAt)}
                </time>
              </div>
            </div>
            <div className="px-6 py-7 sm:px-10 sm:py-9">
              <p className="whitespace-pre-wrap break-words text-base leading-8 text-slate-700 sm:text-lg">{broadcast.message}</p>
            </div>
          </article>
        )}
      </div>
    </main>
  )
}
