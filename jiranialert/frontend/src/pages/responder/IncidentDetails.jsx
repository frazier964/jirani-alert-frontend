import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Camera, Clock3, FileText, MapPin, MessageSquare, Navigation2, Send, ShieldCheck, UserCircle2, Video } from 'lucide-react'
import { getReport } from '../../lib/reportApi'
import { addIncidentNote, listResponderIncidents, updateIncidentStatus } from '../../lib/responderApi'
import { EmptyState, LoadingState, PageHeader, ResponderShell, SectionCard, StatusBadge } from './ResponderComponents'
import { asArray, fallbackIncidents, normalizeIncident } from './responderUtils'

export default function IncidentDetails() {
  const { id } = useParams()
  const [incident, setIncident] = useState(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        if (id === 'latest') {
          const data = await listResponderIncidents(1)
          const first = (data.reports || fallbackIncidents)[0]
          if (!cancelled) setIncident(normalizeIncident(first))
        } else {
          const data = await getReport(id)
          if (!cancelled) setIncident(normalizeIncident(data.report))
        }
      } catch (e) {
        const fallback = fallbackIncidents.find((item) => item.id === id) || fallbackIncidents[0]
        if (!cancelled) {
          setIncident(normalizeIncident(fallback))
          setError(e?.message || 'Using fallback incident details')
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

  const timeline = useMemo(() => {
    const existing = asArray(incident?.timeline)
    if (existing.length) return existing
    return [
      { label: 'Incident report received', createdAt: incident?.createdLabel || 'Recent update' },
      { label: 'Responder review opened', createdAt: 'Current session' },
      { label: 'Awaiting field confirmation', createdAt: 'Pending' },
    ]
  }, [incident])

  const saveNote = async () => {
    if (!note.trim() || !incident?.id) return
    try {
      const data = await addIncidentNote(incident.id, note.trim())
      setIncident(normalizeIncident(data.incident))
      setNote('')
    } catch (e) {
      setError(e?.message || 'Unable to save note')
    }
  }

  const setStatus = async (status) => {
    try {
      const data = await updateIncidentStatus(incident.id, status)
      setIncident(normalizeIncident(data.incident))
    } catch (e) {
      setError(e?.message || 'Unable to update status')
    }
  }

  if (loading) {
    return (
      <ResponderShell>
        <LoadingState label="Loading incident details..." />
      </ResponderShell>
    )
  }

  if (!incident) {
    return (
      <ResponderShell>
        <EmptyState title="Incident not found" detail="The requested incident could not be loaded." />
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
          actions={<Link to="/responder/incidents" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100">Back to incidents</Link>}
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
                <Info label="Incident ID" value={incident.id} />
                <Info label="Type" value={incident.type} />
                <Info label="Location" value={incident.location} />
                <Info label="GPS coordinates" value={incident.gps} />
              </div>
              <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm leading-7 text-slate-300">{incident.description}</p>
            </SectionCard>

            <SectionCard title="Timeline" subtitle="Incident lifecycle and responder updates" icon={Clock3}>
              <div className="grid gap-3">
                {timeline.map((item, index) => (
                  <div key={`${item.label}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <p className="font-bold text-white">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.createdAt || item.time || 'Logged'}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Responder notes and comments" subtitle="Operational notes saved to incident record" icon={MessageSquare}>
              <div className="grid gap-3">
                {asArray(incident.responderNotes).length ? asArray(incident.responderNotes).map((item, index) => (
                  <div key={`${item.note}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm leading-6 text-slate-200">{item.note}</div>
                )) : <EmptyState title="No responder notes yet" detail="Add the first operational note below." />}
              </div>
              <div className="mt-4 flex gap-2">
                <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add responder note" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/55 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/40" />
                <button type="button" onClick={saveNote} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-100"><Send className="h-4 w-4" /> Save</button>
              </div>
            </SectionCard>
          </div>

          <aside className="grid gap-5 content-start">
            <SectionCard title="Victim information" subtitle="Reporter and affected resident details" icon={UserCircle2}>
              <div className="grid gap-3">
                <Info label="Victim" value={incident.victim || 'Pending confirmation'} />
                <Info label="Reporter" value={incident.anonymous ? 'Anonymous' : incident.reporterEmail || 'Community member'} />
                <Info label="Emergency contacts" value={asArray(incident.notify).join(', ') || 'No contacts attached'} />
              </div>
            </SectionCard>

            <SectionCard title="Evidence and media" subtitle="Attached images, videos, and uploaded evidence" icon={Camera}>
              <div className="grid gap-3">
                <MediaRow icon={Camera} label="Images" value={incident.evidenceUrl ? '1 attachment' : 'No images attached'} />
                <MediaRow icon={Video} label="Videos" value="No videos attached" />
                <MediaRow icon={FileText} label="Evidence" value={incident.evidenceUrl || 'No evidence URL'} />
              </div>
            </SectionCard>

            <SectionCard title="GPS and navigation" subtitle="Coordinates and route context" icon={Navigation2}>
              <div className="rounded-[22px] border border-white/10 bg-slate-950/45 p-4">
                <MapPin className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 text-lg font-black text-white">{incident.gps}</p>
                <p className="mt-2 text-sm text-slate-400">{incident.location}</p>
              </div>
            </SectionCard>

            <SectionCard title="Update status" subtitle="Persist response progress" icon={ShieldCheck}>
              <div className="grid grid-cols-2 gap-2">
                {['Accepted', 'En Route', 'On Scene', 'Completed'].map((status) => (
                  <button key={status} type="button" onClick={() => setStatus(status)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs font-bold text-slate-100 transition hover:bg-white/10">{status}</button>
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
      <p className="mt-2 break-words text-sm font-bold text-white">{value || 'Pending'}</p>
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
