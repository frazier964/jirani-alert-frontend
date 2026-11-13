import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  MessageSquare,
  RefreshCw,
  Send,
  ShieldAlert,
  User,
} from 'lucide-react'
import {
  getPublicReport,
  listPublicAlerts,
  updatePublicAlert,
} from '../../lib/reportApi'

function getLocalAlert(id) {
  try {
    return JSON.parse(localStorage.getItem('jiranialert_alerts') || '[]').find((item) => item.id === id) || null
  } catch {
    return null
  }
}

function formatDate(value) {
  const timestamp = value && typeof value._seconds === 'number' ? value._seconds * 1000 : value
  const date = new Date(timestamp)
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleString()
}

function toSlug(item) {
  return `${item.type || ''}-${item.location || item.title || ''}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const severityStyles = {
  Critical: 'border-red-200 bg-red-100 text-red-800',
  High: 'border-orange-200 bg-orange-100 text-orange-800',
  Medium: 'border-amber-200 bg-amber-100 text-amber-800',
  Low: 'border-emerald-200 bg-emerald-100 text-emerald-800',
}

export default function AlertDetails() {
  const { id } = useParams()
  const [alert, setAlert] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    let cancelled = false
    async function loadAlert() {
      setLoading(true)
      setError('')
      try {
        let result
        try {
          result = await getPublicReport(id)
        } catch {
          const listed = await listPublicAlerts()
          const match = (listed?.alerts || []).find((item) => item.id === id || toSlug(item) === id)
          if (match) result = { report: match }
        }
        if (!cancelled) setAlert(result?.report || getLocalAlert(id))
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError?.message || 'Unable to load this alert.')
          setAlert(getLocalAlert(id))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadAlert()
    return () => {
      cancelled = true
    }
  }, [id])

  async function submitAction(action, text = '') {
    if (!alert || actionLoading) return
    setActionLoading(action)
    setError('')
    try {
      const result = await updatePublicAlert({ reportId: alert.id, action, text })
      setAlert((current) => ({ ...current, ...(result?.report || {}), ...(action === 'resolve' ? { status: 'resolved' } : {}) }))
      if (action === 'comment') setComment('')
    } catch (actionError) {
      setError(actionError?.message || 'This update could not be saved.')
    } finally {
      setActionLoading('')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl animate-pulse space-y-4">
          <div className="h-10 w-36 rounded-full bg-slate-200" />
          <div className="h-56 rounded-3xl bg-white shadow-sm" />
          <div className="h-72 rounded-3xl bg-white shadow-sm" />
        </div>
      </main>
    )
  }

  if (!alert) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6">
        <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h1 className="mt-4 text-2xl font-black">Alert not found</h1>
          <p className="mt-2 text-slate-600">{error || 'This alert may have been removed.'}</p>
          <Link to="/alerts" className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700">
            Go to reports
          </Link>
        </section>
      </main>
    )
  }

  const comments = Array.isArray(alert.comments) ? alert.comments : []
  const resolved = String(alert.status || '').toLowerCase() === 'resolved'

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link to="/alerts" className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to reports
        </Link>

        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.08)]">
          <header className="bg-gradient-to-br from-[#1E3A5F] via-[#2563EB] to-[#0f172a] p-5 text-white sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-100">
                  <ShieldAlert className="h-4 w-4" /> Community alert
                </p>
                <h1 className="break-words text-3xl font-black sm:text-4xl">{alert.title || alert.type || 'Emergency alert'}</h1>
                <p className="mt-2 break-words text-blue-100">{alert.type || 'Emergency'} · {alert.location || 'Location pending'}</p>
              </div>
              <span className={`inline-flex h-fit shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${severityStyles[alert.severity] || severityStyles.High}`}>
                {alert.severity || 'High'}
              </span>
            </div>
          </header>

          <div className="space-y-6 p-5 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [MapPin, 'Location', alert.location || 'Location pending'],
                [Clock, 'Reported', formatDate(alert.createdAt)],
                [User, 'Reporter', alert.anonymous ? 'Anonymous' : alert.reporterEmail || 'Community member'],
                [CheckCircle2, 'Status', alert.status || 'Active'],
              ].map(([Icon, label, value]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500"><Icon className="h-4 w-4" /> {label}</div>
                  <p className="mt-2 break-words font-bold capitalize text-slate-900">{value}</p>
                </div>
              ))}
            </div>

            <section>
              <h2 className="text-lg font-black">Details</h2>
              <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 leading-7 text-slate-700">{alert.description || 'No additional details were provided.'}</p>
            </section>

            {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

            <section className="border-t border-slate-100 pt-6">
              <h2 className="flex items-center gap-2 text-lg font-black"><MessageSquare className="h-5 w-5" /> Live updates ({comments.length})</h2>
              <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
                {comments.length === 0 ? <p className="py-6 text-center text-sm text-slate-500">No updates yet.</p> : comments.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-semibold text-slate-900">{item.text}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatDate(item.at)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="border-t border-slate-100 pt-6">
              <label htmlFor="alert-update" className="text-sm font-bold">Add an update</label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input id="alert-update" value={comment} onChange={(event) => setComment(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && submitAction('comment', comment.trim())} placeholder="Share an observation or status update..." className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />
                <button type="button" onClick={() => submitAction('comment', comment.trim())} disabled={!comment.trim() || Boolean(actionLoading)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                  <Send className="h-4 w-4" /> {actionLoading === 'comment' ? 'Posting…' : 'Post'}
                </button>
              </div>
            </section>

            {resolved ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center font-bold text-emerald-800">This alert has been resolved.</div>
            ) : (
              <button type="button" onClick={() => submitAction('resolve')} disabled={Boolean(actionLoading)} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60">
                {actionLoading === 'resolve' ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {actionLoading === 'resolve' ? 'Updating…' : 'Mark as Resolved'}
              </button>
            )}
          </div>
        </article>
      </div>
    </main>
  )
}
