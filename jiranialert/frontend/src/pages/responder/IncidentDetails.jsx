import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Camera, Clock3, FileText, MapPin, MessageSquare, Navigation2, Phone, Send, ShieldCheck, UserCircle2, Video } from 'lucide-react'
import { getReport } from '../../lib/reportApi'
import { acceptIncident, addIncidentNote, listResponderIncidents, updateIncidentStatus } from '../../lib/responderApi'
import { EmptyState, LoadingState, PageHeader, ResponderShell, SectionCard, StatusBadge } from './ResponderComponents'
import { asArray, formatIncidentDate, normalizeIncident } from './responderUtils'

function parseCoordinates(value) {
  if (!value) return null
  if (typeof value === 'object' && Number.isFinite(value.latitude) && Number.isFinite(value.longitude)) {
    return { latitude: value.latitude, longitude: value.longitude }
  }
  if (typeof value === 'string') {
    const match = value.match(/(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)/)
    if (match) {
      return { latitude: Number(match[1]), longitude: Number(match[2]) }
    }
  }
  return null
}

function hasValue(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export default function IncidentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [actionBusy, setActionBusy] = useState(false)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      setNotFound(false)
      try {
        if (id === 'latest') {
          const data = await listResponderIncidents(1)
          const first = (data.reports || [])[0]
          if (!first) {
            if (!cancelled) {
              setIncident(null)
              setNotFound(true)
            }
            return
          }
          if (!cancelled) setIncident(normalizeIncident(first))
        } else {
          const data = await getReport(id)
          if (!cancelled) setIncident(normalizeIncident(data.report))
        }
      } catch (e) {
        if (!cancelled) {
          const message = String(e?.message || '')
          if (/not found|404/i.test(message)) {
            setIncident(null)
            setNotFound(true)
          } else {
            setIncident(null)
            setError(message || 'Unable to load incident details')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id])

  const timeline = useMemo(() => asArray(incident?.timeline), [incident])

  const locationCoordinates = parseCoordinates(incident?.locationCoordinates) || parseCoordinates(incident?.gps)
  const mapHref = locationCoordinates
    ? `https://www.google.com/maps?q=${locationCoordinates.latitude},${locationCoordinates.longitude}`
    : (hasValue(incident?.location) ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(incident.location)}` : '')

  const infoRows = [
    { label: 'Incident ID', value: incident?.id },
    { label: 'Emergency type', value: incident?.type },
    { label: 'Current status', value: incident?.status },
    { label: 'Severity', value: incident?.severity },
    { label: 'Location', value: incident?.location },
    { label: 'Date and time reported', value: formatIncidentDate(incident?.createdAt) },
    { label: 'People affected', value: incident?.peopleAffected || incident?.victimCount || '' },
    { label: 'Assigned responder', value: incident?.assignedResponderName || incident?.assignedResponderEmail || '' },
  ].filter((item) => hasValue(item.value))

  const saveNote = async () => {
    if (!note.trim() || !incident?.id) return
    try {
      setActionBusy(true)
      const data = await addIncidentNote(incident.id, note.trim())
      setIncident(normalizeIncident(data.incident))
      setNote('')
    } catch (e) {
      setError(e?.message || 'Unable to save note')
    } finally {
      setActionBusy(false)
    }
  }

  const setStatus = async (status) => {
    try {
      setActionBusy(true)
      const data = await updateIncidentStatus(incident.id, status)
      setIncident(normalizeIncident(data.incident))
    } catch (e) {
      const message = e?.message || 'Unable to update status'
      if (/not found|404/i.test(String(message))) {
        setNotFound(true)
        setIncident(null)
      } else {
        setError(message)
      }
    } finally {
      setActionBusy(false)
    }
  }

  const handleAccept = async () => {
    if (!incident?.id) return
    try {
      setActionBusy(true)
      const data = await acceptIncident(incident.id)
      setIncident(normalizeIncident(data.incident))
    } catch (e) {
      setError(e?.message || 'Unable to accept incident')
    } finally {
      setActionBusy(false)
    }
  }

  if (loading) {
    return (
      <ResponderShell>
        <LoadingState label="Loading incident details..." />
      </ResponderShell>
    )
  }

  if (notFound) {
    return (
      <ResponderShell>
        <div className="mx-auto grid max-w-2xl gap-4">
          <EmptyState title="Emergency report not found." detail="This report may have been deleted or you may no longer have permission to view it." />
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/responder/dashboard" className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-100">Return to Live Alert Dashboard</Link>
            <button type="button" onClick={() => navigate('/responder/incidents')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100">Open Incident Queue</button>
          </div>
        </div>
      </ResponderShell>
    )
  }

  if (!incident) {
    return (
      <ResponderShell>
        <EmptyState title="Unable to load emergency report" detail={error || 'Try reopening this incident from the dashboard.'} />
      </ResponderShell>
    )
  }

  return (
    <ResponderShell>
      <div className="grid gap-5">
        <PageHeader
          title={incident.title}
          description={`${incident.type} incident at ${incident.location}. Full operational record for responder review.`}
          icon={FileText}
          actions={<Link to="/responder/incidents" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100">Back to Live Alert Dashboard</Link>}
        />
        {error ? <p className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">{error}</p> : null}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <div className="grid gap-5">
            <SectionCard title="Incident information" subtitle="Type, severity, status, location, and description" icon={ShieldCheck}>
              <div className="flex flex-wrap gap-2">
                <StatusBadge value={incident.severity} type="severity" />
                <StatusBadge value={incident.status} />
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {infoRows.map((row) => <Info key={row.label} label={row.label} value={row.value} />)}
              </div>
              {hasValue(incident.description) ? <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm leading-7 text-slate-300">{incident.description}</p> : null}
            </SectionCard>

            <SectionCard title="Timeline" subtitle="Incident lifecycle and responder updates" icon={Clock3}>
              {timeline.length ? (
                <div className="grid gap-3">
                  {timeline.map((item, index) => (
                    <div key={`${item.label}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <p className="font-bold text-white">{item.label}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.createdAt || item.time || 'Logged'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No timeline updates yet" detail="Status and response updates will appear here as actions are taken." />
              )}
            </SectionCard>

            <SectionCard title="Responder notes and comments" subtitle="Operational notes saved to this emergency report" icon={MessageSquare}>
              <div className="grid gap-3">
                {asArray(incident.responderNotes).length ? asArray(incident.responderNotes).map((item, index) => (
                  <div key={`${item.note}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm leading-6 text-slate-200">{item.note}</div>
                )) : <EmptyState title="No responder notes yet" detail="Add the first operational note below." />}
              </div>
              <div className="mt-4 flex gap-2">
                <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add responder note" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40" />
                <button type="button" disabled={actionBusy || !note.trim()} onClick={saveNote} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-4 w-4" /> Save</button>
              </div>
            </SectionCard>
          </div>

          <aside className="grid gap-5 content-start">
            <SectionCard title="Reporter and impact" subtitle="Identity and affected person details" icon={UserCircle2}>
              <div className="grid gap-3">
                {hasValue(incident.victim) ? <Info label="Affected person" value={incident.victim} /> : null}
                {incident.anonymous || hasValue(incident.reporterName) || hasValue(incident.reporterEmail)
                  ? <Info label="Reporter" value={incident.anonymous ? 'Anonymous' : (incident.reporterName || incident.reporterEmail)} />
                  : null}
                {hasValue(incident.reporterPhone) ? <Info label="Reporter phone" value={incident.reporterPhone} /> : null}
                {asArray(incident.notify).length ? <Info label="Notify groups" value={asArray(incident.notify).join(', ')} /> : null}
              </div>
              {hasValue(incident.reporterPhone) || hasValue(incident.reporterEmail) ? (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {hasValue(incident.reporterPhone) ? <a href={`tel:${incident.reporterPhone}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-100"><Phone className="h-4 w-4" /> Call reporter</a> : null}
                  {hasValue(incident.reporterEmail) ? <a href={`mailto:${incident.reporterEmail}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-400/35 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-100">Email reporter</a> : null}
                </div>
              ) : null}
            </SectionCard>

            <SectionCard title="Evidence and media" subtitle="Attached images, videos, and uploaded evidence" icon={Camera}>
              {hasValue(incident.evidenceUrl) ? (
                <div className="grid gap-3">
                  <MediaRow icon={Camera} label="Images" value="1 attachment" />
                  <MediaRow icon={Video} label="Videos" value="No videos attached" />
                  <MediaRow icon={FileText} label="Evidence" value={incident.evidenceUrl} />
                  <a href={incident.evidenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-100">Open evidence</a>
                </div>
              ) : (
                <EmptyState title="No evidence attached" detail="This emergency report does not include image or file attachments." />
              )}
            </SectionCard>

            <SectionCard title="GPS and navigation" subtitle="Coordinates and route context" icon={Navigation2}>
              <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                <MapPin className="h-5 w-5 text-cyan-200" />
                {hasValue(incident.gps) ? <p className="mt-3 text-lg font-black text-white">{incident.gps}</p> : null}
                {hasValue(incident.location) ? <p className="mt-2 text-sm text-slate-400">{incident.location}</p> : null}
              </div>
              {mapHref ? <a href={mapHref} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-100">View location</a> : null}
            </SectionCard>

            <SectionCard title="Response actions" subtitle="Take action and sync status to Firebase" icon={ShieldCheck}>
              <div className="grid gap-2">
                {incident.status === 'Pending' || incident.status === 'Active' ? (
                  <button type="button" disabled={actionBusy} onClick={handleAccept} className="rounded-2xl border border-red-400/35 bg-red-500/15 px-3 py-2.5 text-xs font-bold text-red-100 transition hover:bg-red-500/25 disabled:cursor-not-allowed disabled:opacity-60">Accept / Respond to Alert</button>
                ) : null}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {['Active', 'En Route', 'Responder En Route', 'Monitoring', 'Resolved', 'Cancelled', 'Pending'].map((status) => (
                  <button key={status} type="button" disabled={actionBusy} onClick={() => setStatus(status)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-slate-100 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60">{status}</button>
                ))}
              </div>
            </SectionCard>
          </aside>
        </div>
      </div>
    </ResponderShell>
  )
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className="mt-2 break-words text-sm font-bold text-white">{String(value)}</p>
    </div>
  )
}

function MediaRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <Icon className="h-5 w-5 text-cyan-200" />
      <div className="min-w-0">
        <p className="font-bold text-white">{label}</p>
        <p className="break-words text-sm text-slate-400">{value}</p>
      </div>
    </div>
  )
}
