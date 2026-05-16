import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageSquare, CheckCircle2, Clock, User, MapPin, AlertCircle, Send } from 'lucide-react'

function getAlerts() {
  try {
    return JSON.parse(localStorage.getItem('jiranialert_alerts') || '[]')
  } catch (e) {
    return []
  }
}

function saveAlerts(alerts) {
  localStorage.setItem('jiranialert_alerts', JSON.stringify(alerts || []))
}

function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleString()
}

export default function AlertDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [alert, setAlert] = useState(null)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const alerts = getAlerts()
    const a = alerts.find((x) => x.id === id)
    setAlert(a || null)
    setLoading(false)
  }, [id])

  function addComment() {
    if (!comment.trim() || !alert) return
    const alerts = getAlerts()
    const idx = alerts.findIndex((x) => x.id === alert.id)
    if (idx === -1) return
    alerts[idx].comments = alerts[idx].comments || []
    alerts[idx].comments.push({
      id: Date.now().toString(),
      text: comment.trim(),
      at: new Date().toISOString(),
    })
    saveAlerts(alerts)
    setAlert(alerts[idx])
    setComment('')
  }

  function markResolved() {
    const alerts = getAlerts()
    const idx = alerts.findIndex((x) => x.id === alert.id)
    if (idx === -1) return
    alerts[idx].status = 'resolved'
    saveAlerts(alerts)
    setAlert(alerts[idx])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <p className="text-slate-700">Loading alert...</p>
        </div>
      </div>
    )
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Alert not found</h2>
            <p className="mt-2 text-slate-600">The alert you're looking for doesn't exist or may have been removed.</p>
            <Link
              to="/resident/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
            >
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  const severityColors = {
    Critical: 'bg-red-100 text-red-800 border-red-200',
    High: 'bg-orange-100 text-orange-800 border-orange-200',
    Medium: 'bg-amber-100 text-amber-800 border-amber-200',
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h1 className="text-3xl font-black text-slate-900">{alert.type}</h1>
              <p className="mt-2 text-lg text-slate-600">{alert.title}</p>
            </div>
            <span
              className={`inline-block shrink-0 rounded-full border px-4 py-2 text-sm font-bold whitespace-nowrap ${
                severityColors[alert.severity] || severityColors.High
              }`}
            >
              {alert.severity}
            </span>
          </div>

          {/* Alert Info Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                <MapPin className="h-4 w-4" />
                Location
              </div>
              <p className="text-slate-900 font-semibold">{alert.location}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                <Clock className="h-4 w-4" />
                Reported
              </div>
              <p className="text-slate-900 font-semibold">{formatDate(alert.createdAt)}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                <User className="h-4 w-4" />
                Reporter
              </div>
              <p className="text-slate-900 font-semibold">{alert.anonymous ? 'Anonymous' : alert.reporterEmail || 'Community Member'}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                <CheckCircle2 className="h-4 w-4" />
                Status
              </div>
              <p className="text-slate-900 font-semibold capitalize">{alert.status || 'Active'}</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Details</h3>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-slate-700 leading-6">{alert.description}</p>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-slate-600" />
              <h3 className="text-lg font-bold text-slate-900">Live Updates ({(alert.comments || []).length})</h3>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(alert.comments || []).length === 0 ? (
                <p className="text-slate-500 text-sm py-6 text-center">No updates yet. Be the first to comment.</p>
              ) : (
                (alert.comments || []).map((c) => (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-slate-900 font-semibold">{c.text}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatDate(c.at)}</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Comment Input */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <label className="block text-sm font-semibold text-slate-900">Add an update</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addComment()
                }}
                placeholder="Share your observation or status update..."
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent"
              />
              <button
                onClick={addComment}
                disabled={!comment.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                Post
              </button>
            </div>
          </div>

          {/* Mark Safe Button */}
          {alert.status !== 'resolved' && (
            <motion.button
              onClick={markResolved}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors"
            >
              Mark as Resolved
            </motion.button>
          )}

          {alert.status === 'resolved' && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-center">
              <p className="text-emerald-800 font-semibold">✓ This alert has been resolved</p>
            </div>
          )}
        </motion.article>
      </motion.div>
    </div>
  )
}
