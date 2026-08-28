import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, Bell, CalendarClock, CheckCircle2, ChevronRight, Clock3, Flame, HeartPulse, Radio, ShieldAlert, ShieldCheck, Siren, Users } from 'lucide-react'
import Avatar from '../../components/UI/Avatar'
import { getCurrentUser, getPreferredUserName } from '../../lib/auth'
import { listNotifications } from '../../lib/notificationsApi'
import { listResponderIncidents } from '../../lib/responderApi'
import { EmptyState, IncidentCard, LoadingState, NotificationCard, PageHeader, ResponderShell, SectionCard, StatCard } from './ResponderComponents'
import { normalizeIncident, statusStyles } from './responderUtils'

const inactiveStatuses = new Set(['completed', 'resolved', 'cancelled', 'rejected'])

function getIncidentIcon(type) {
  const normalized = String(type || '').trim().toLowerCase()
  if (normalized.includes('fire')) return Flame
  if (normalized.includes('medical')) return HeartPulse
  if (normalized.includes('security') || normalized.includes('crime')) return ShieldAlert
  return AlertTriangle
}

function getStatusTone(status) {
  const value = String(status || '').trim()
  return statusStyles[value] || 'border-slate-400/30 bg-slate-500/10 text-slate-200'
}

export default function ResponderDashboard() {
  const currentUser = getCurrentUser() || {}
  const [incidents, setIncidents] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [incidentsError, setIncidentsError] = useState('')
  const [online, setOnline] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load({ silent = false } = {}) {
      if (!silent) setLoading(true)
      if (!silent) setIncidentsError('')
      try {
        const [incidentData, notificationData] = await Promise.all([
          listResponderIncidents(25),
          listNotifications(8).catch(() => ({ notifications: [] })),
        ])
        if (!cancelled) {
          setIncidents((incidentData.reports || []).map(normalizeIncident))
          setNotifications(notificationData.notifications || [])
          setIncidentsError('')
        }
      } catch (error) {
        if (!cancelled) {
          setIncidents([])
          setIncidentsError(error?.message || 'Unable to load live emergency alerts right now.')
        }
      } finally {
        if (!cancelled && !silent) setLoading(false)
      }
    }
    load()

    const refreshTimer = window.setInterval(() => {
      load({ silent: true })
    }, 15000)

    return () => {
      cancelled = true
      window.clearInterval(refreshTimer)
    }
  }, [])

  const activeIncidents = incidents.filter((item) => !inactiveStatuses.has(String(item.status || '').trim().toLowerCase())).slice(0, 4)
  const assigned = incidents.filter((item) => item.assignedResponderId === currentUser.uid || item.assignmentStatus === 'Assigned' || item.status === 'Assigned')
  const criticalCount = incidents.filter((item) => item.severity === 'Critical' || item.severity === 'High').length
  const responderName = getPreferredUserName(currentUser) || 'Emergency Responder'

  const stats = useMemo(
    () => [
      { label: 'Active emergencies', value: activeIncidents.length || 0, detail: 'Live incidents requiring monitoring', icon: Siren, tone: 'text-red-200' },
      { label: 'Assigned today', value: assigned.length || 0, detail: 'Incidents linked to this shift', icon: CalendarClock, tone: 'text-cyan-200' },
      { label: 'Critical load', value: criticalCount, detail: 'High severity items in queue', icon: AlertTriangle, tone: 'text-orange-200' },
      { label: 'Unread notices', value: notifications.filter((item) => !item.read).length, detail: 'Command updates and alerts', icon: Bell, tone: 'text-amber-200' },
    ],
    [activeIncidents.length, assigned.length, criticalCount, notifications],
  )

  return (
    <ResponderShell>
      <div className="grid gap-5">
        <PageHeader
          eyebrow="Responder summary"
          title="Emergency Responder Dashboard"
          description="A focused command summary for your current shift. Detailed operations live in the Workspace menu."
          icon={ShieldCheck}
          actions={
            <>
              <Link to="/report-emergency" className="rounded-2xl border border-red-400/35 bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100">Report emergency</Link>
              <Link to="/responder/incidents" className="rounded-2xl border border-red-400/35 bg-red-500/15 px-4 py-3 text-sm font-bold text-red-100">Open incidents</Link>
              <Link to="/responder/dispatch" className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-100">Dispatch center</Link>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => <StatCard key={item.label} {...item} />)}
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)]">
          <div className="grid gap-5">
            <SectionCard title="Today's assignments" subtitle="Assigned incidents and operational priorities" icon={CalendarClock}>
              {loading ? <LoadingState /> : assigned.length ? (
                <div className="grid gap-3">
                  {assigned.slice(0, 3).map((incident) => <IncidentCard key={incident.id} incident={incident} actionLabel="Review" />)}
                </div>
              ) : <EmptyState title="No assigned incidents yet" detail="Accepted and dispatched incidents for this responder will appear here." />}
            </SectionCard>

            <SectionCard title="Live Alert Dashboard" subtitle="Live incidents requiring responder action" icon={AlertTriangle}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <p className="text-sm font-semibold text-slate-200">Monitor active emergency reports and open full incident records.</p>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  System Online
                </span>
              </div>

              {loading ? <LoadingState label="Loading live emergency alerts..." /> : null}
              {!loading && incidentsError ? (
                <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  Could not load live alerts. {incidentsError}
                </div>
              ) : null}
              {!loading && !incidentsError && !activeIncidents.length ? (
                <EmptyState title="No active emergency alerts" detail="New incidents will appear here in real time as reports are created or updated." />
              ) : null}
              {!loading && !incidentsError && activeIncidents.length ? (
                <div className="grid gap-3">
                  {activeIncidents.map((incident) => {
                    const Icon = getIncidentIcon(incident.type)
                    return (
                      <Link
                        key={incident.id}
                        to={`/alerts/${encodeURIComponent(incident.id)}`}
                        aria-label={`View report for ${incident.title}`}
                        className="group block cursor-pointer rounded-[24px] border border-white/10 bg-slate-950/45 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:bg-slate-900/70 hover:shadow-[0_18px_34px_rgba(8,145,178,0.15)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#020617]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-200">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-black text-white sm:text-base">{incident.title}</p>
                              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{incident.type || 'Emergency'}</p>
                              <p className="mt-2 inline-flex min-w-0 items-center gap-1.5 text-sm text-slate-300">
                                <span className="text-slate-500">📍</span>
                                <span className="truncate">{incident.location}</span>
                              </p>
                            </div>
                          </div>

                          <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${getStatusTone(incident.status)}`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current" />
                            {incident.status || 'Pending'}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-end border-t border-white/10 pt-3 text-sm font-bold text-cyan-100">
                          <span className="inline-flex items-center gap-1 opacity-90 transition group-hover:opacity-100">
                            View Report
                            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              ) : null}
            </SectionCard>
          </div>

          <aside className="grid gap-5 content-start">
            <SectionCard title="Responder summary" subtitle="Identity and shift status" icon={Users}>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <Avatar src={currentUser.profileImageUrl} alt={responderName} size={52} />
                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-white">{responderName}</p>
                  <p className="text-sm text-slate-400">Emergency Responder</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Shift status</p>
                  <p className="mt-1 text-sm font-bold text-white">{online ? 'Online and available' : 'Offline standby'}</p>
                </div>
                <button type="button" onClick={() => setOnline((value) => !value)} className={`relative h-7 w-14 rounded-full transition ${online ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${online ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Quick actions" subtitle="Fast operational routes" icon={Radio}>
              <div className="grid gap-2">
                {[
                  ['Active Incidents', '/responder/incidents', Siren],
                  ['Assigned Incidents', '/responder/assigned', CheckCircle2],
                  ['Communications', '/responder/communications', Radio],
                  ['Analytics', '/responder/analytics', Activity],
                ].map(([label, to, Icon]) => (
                  <Link key={to} to={to} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100 transition hover:border-cyan-300/30 hover:bg-white/10">
                    <Icon className="h-4 w-4 text-cyan-200" />
                    {label}
                  </Link>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Recent notifications" subtitle="Latest command updates" icon={Bell}>
              {notifications.length ? <div className="grid gap-3">{notifications.slice(0, 3).map((item) => <NotificationCard key={item.id || item.title} item={item} />)}</div> : <EmptyState title="No recent notifications" detail="Command notifications will appear here." />}
            </SectionCard>

            <SectionCard title="Readiness timer" subtitle="Shift cadence" icon={Clock3}>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                <p className="text-3xl font-black text-emerald-100">Ready</p>
                <p className="mt-2 text-sm leading-6 text-emerald-50/80">Status pings are active. Keep this page open during your shift.</p>
              </div>
            </SectionCard>
          </aside>
        </div>
      </div>
    </ResponderShell>
  )
}
