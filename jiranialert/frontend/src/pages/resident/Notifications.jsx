import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  CheckCheck,
  Clock3,
  Loader2,
  MapPin,
  MessageSquare,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
} from 'lucide-react'
import {
  clearNotifications,
  deleteNotification,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../../lib/notificationsApi'

const FILTERS = ['All', 'Unread', 'Emergency', 'Messages', 'System']

function timestampToDate(value) {
  if (!value) return null
  if (typeof value === 'string') return new Date(value)
  if (typeof value === 'number') return new Date(value)
  if (typeof value._seconds === 'number') return new Date(value._seconds * 1000)
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000)
  return null
}

function formatTime(value) {
  const date = timestampToDate(value)
  if (!date || Number.isNaN(date.getTime())) return 'Recently'

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} min ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hr ago`

  return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function classifyNotification(item) {
  const text = `${item.title || ''} ${item.message || ''}`.toLowerCase()
  if (item.reportId || text.includes('report') || text.includes('emergency') || text.includes('alert')) return 'Emergency'
  if (text.includes('message') || text.includes('reply')) return 'Messages'
  return 'System'
}

function getIcon(category) {
  if (category === 'Emergency') return ShieldAlert
  if (category === 'Messages') return MessageSquare
  return Bell
}

function categoryTone(category, read) {
  if (category === 'Emergency') return read ? 'bg-red-50 text-red-700' : 'bg-red-600 text-white'
  if (category === 'Messages') return read ? 'bg-blue-50 text-blue-700' : 'bg-blue-600 text-white'
  return read ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white'
}

export default function Notifications() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [busyId, setBusyId] = useState('')
  const [bulkBusy, setBulkBusy] = useState('')

  async function loadItems({ quiet = false } = {}) {
    if (quiet) setRefreshing(true)
    else setLoading(true)
    setError('')

    try {
      const data = await listNotifications(100)
      setItems(Array.isArray(data?.notifications) ? data.notifications : [])
    } catch (e) {
      setError(e?.message || 'Could not load notifications from the backend.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  const enrichedItems = useMemo(() => {
    return items.map((item) => ({
      ...item,
      category: classifyNotification(item),
      timeLabel: formatTime(item.createdAt || item.updatedAt),
    }))
  }, [items])

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return enrichedItems.filter((item) => {
      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Unread' ? !item.read : item.category === activeFilter)
      const text = `${item.title || ''} ${item.message || ''} ${item.category}`.toLowerCase()
      return matchesFilter && (!query || text.includes(query))
    })
  }, [activeFilter, enrichedItems, searchQuery])

  const unreadCount = enrichedItems.filter((item) => !item.read).length
  const emergencyCount = enrichedItems.filter((item) => item.category === 'Emergency').length
  const latestItem = enrichedItems[0]

  async function markRead(item) {
    if (item.read) return
    setBusyId(item.id)
    try {
      await markNotificationRead(item.id)
      setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, read: true } : entry)))
    } catch (e) {
      setError(e?.message || 'Could not mark notification as read.')
    } finally {
      setBusyId('')
    }
  }

  async function removeItem(item) {
    setBusyId(item.id)
    try {
      await deleteNotification(item.id)
      setItems((current) => current.filter((entry) => entry.id !== item.id))
    } catch (e) {
      setError(e?.message || 'Could not delete notification.')
    } finally {
      setBusyId('')
    }
  }

  async function markAllRead() {
    setBulkBusy('read')
    try {
      await markAllNotificationsRead()
      setItems((current) => current.map((entry) => ({ ...entry, read: true })))
    } catch (e) {
      setError(e?.message || 'Could not mark all notifications as read.')
    } finally {
      setBulkBusy('')
    }
  }

  async function clearAll() {
    setBulkBusy('clear')
    try {
      await clearNotifications()
      setItems([])
    } catch (e) {
      setError(e?.message || 'Could not clear notifications.')
    } finally {
      setBulkBusy('')
    }
  }

  function openNotification(item) {
    markRead(item)
    if (item.reportId) {
      navigate(`/alerts/${item.reportId}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-5 text-slate-950 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto grid max-w-[1500px] gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0 space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#E53935]">Live backend data</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Notifications</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Emergency alerts, report updates, and account messages saved in Firebase.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">Total</p>
                  <p className="mt-1 text-2xl font-black">{enrichedItems.length}</p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs font-bold uppercase text-amber-700">Unread</p>
                  <p className="mt-1 text-2xl font-black text-amber-700">{unreadCount}</p>
                </div>
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-bold uppercase text-red-700">Alerts</p>
                  <p className="mt-1 text-2xl font-black text-red-700">{emergencyCount}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
                  placeholder="Search backend notifications"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {FILTERS.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className={`h-11 rounded-2xl border px-4 text-sm font-bold transition ${
                      activeFilter === filter
                        ? 'border-[#2563EB] bg-[#2563EB] text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          <section className="min-h-[420px] rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            {loading ? (
              <div className="flex min-h-[360px] items-center justify-center text-slate-500">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading notifications from backend...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <Bell className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-2xl font-black text-slate-950">No notifications found</h2>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                  When the backend creates notifications for your account, they will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredItems.map((item, index) => {
                  const Icon = getIcon(item.category)
                  const isBusy = busyId === item.id

                  return (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: index * 0.02 }}
                      className={`grid gap-4 py-4 lg:grid-cols-[1fr_auto] lg:items-center ${
                        item.read ? 'bg-white' : 'rounded-2xl bg-blue-50/70 px-3'
                      }`}
                    >
                      <button type="button" onClick={() => openNotification(item)} className="min-w-0 text-left">
                        <div className="flex min-w-0 gap-3">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${categoryTone(item.category, item.read)}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-600">
                                {item.category}
                              </span>
                              {!item.read ? (
                                <span className="rounded-full bg-[#E53935] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white">
                                  Unread
                                </span>
                              ) : null}
                            </div>
                            <h3 className="mt-2 truncate text-lg font-black text-slate-950">
                              {item.title || 'Notification'}
                            </h3>
                            <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                              {item.message || 'No message was provided for this notification.'}
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-3.5 w-3.5" />
                                {item.timeLabel}
                              </span>
                              {item.reportId ? (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  Linked report
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </button>

                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {item.reportId ? (
                          <button
                            type="button"
                            onClick={() => openNotification(item)}
                            className="inline-flex h-10 items-center justify-center rounded-2xl bg-[#1E3A5F] px-4 text-sm font-bold text-white hover:bg-[#14304d]"
                          >
                            View report
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => markRead(item)}
                          disabled={item.read || isBusy}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
                        >
                          {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                          Mark read
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item)}
                          disabled={isBusy}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-45"
                          aria-label="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.article>
                  )
                })}
              </div>
            )}
          </section>
        </main>

        <aside className="space-y-5 xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#2563EB]">Controls</p>
                <h2 className="mt-2 text-xl font-black text-slate-950">Backend Actions</h2>
              </div>
              <button
                type="button"
                onClick={() => loadItems({ quiet: true })}
                disabled={refreshing}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white disabled:opacity-50"
                aria-label="Refresh notifications"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <button
                type="button"
                onClick={markAllRead}
                disabled={bulkBusy !== '' || unreadCount === 0}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1E3A5F] px-4 text-sm font-black text-white hover:bg-[#14304d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkBusy === 'read' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                Mark all as read
              </button>
              <button
                type="button"
                onClick={clearAll}
                disabled={bulkBusy !== '' || enrichedItems.length === 0}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 text-sm font-black text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bulkBusy === 'clear' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Clear notifications
              </button>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#E53935]">Latest</p>
            {latestItem ? (
              <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/80">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {latestItem.category}
                </div>
                <h3 className="mt-3 text-lg font-black">{latestItem.title || 'Notification'}</h3>
                <p className="mt-2 text-sm leading-6 text-white/70">{latestItem.message || 'No message provided.'}</p>
                <p className="mt-3 text-xs font-bold text-white/50">{latestItem.timeLabel}</p>
              </div>
            ) : (
              <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                No backend notifications are available for this account yet.
              </p>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}
