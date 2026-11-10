import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  UserPlus,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { assignIncident, listResponderIncidents, updateIncidentStatus } from '../../lib/responderApi'
import { listTeamMembers } from '../../lib/responderWorkspaceApi'
import { normalizeIncident } from './responderUtils'

const priorities = ['All', 'Critical', 'High', 'Medium', 'Low']
const assignmentFilters = ['All', 'Unassigned', 'Assigned']
const unitFilters = ['All', 'Available', 'Assigned', 'En Route', 'Unavailable']
const lifecycle = ['New', 'Pending Assignment', 'Assigned', 'Acknowledged', 'En Route', 'On Scene', 'Resolved', 'Closed']
const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 }

function formatDate(value) {
  if (!value) return 'Just now'
  const date = value?.toDate ? value.toDate() : value?.seconds ? new Date(value.seconds * 1000) : new Date(value)
  return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleString()
}

function timestampMs(value) {
  if (!value) return 0
  if (typeof value?.toDate === 'function') return value.toDate().getTime()
  if (value?.seconds) return Number(value.seconds) * 1000
  const parsed = new Date(value).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

function coordinatesFor(item) {
  const value = item.locationCoordinates || item.coordinates || item.gps
  if (value && Number.isFinite(Number(value.latitude)) && Number.isFinite(Number(value.longitude))) return [Number(value.latitude), Number(value.longitude)]
  if (typeof value === 'string') {
    const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/)
    if (match) return [Number(match[1]), Number(match[2])]
  }
  return null
}

function priorityClass(value) {
  return {
    Critical: 'border-red-400/40 bg-red-500/15 text-red-200',
    High: 'border-orange-400/40 bg-orange-500/15 text-orange-200',
    Medium: 'border-amber-400/40 bg-amber-500/15 text-amber-200',
    Low: 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200',
  }[value] || 'border-slate-600 bg-slate-800 text-slate-300'
}

function statusClass(value) {
  if (['Resolved', 'Closed'].includes(value)) return 'text-emerald-300'
  if (['Critical', 'New'].includes(value)) return 'text-red-300'
  if (['En Route', 'Acknowledged'].includes(value)) return 'text-cyan-300'
  return 'text-amber-300'
}

function Stat({ label, value, icon: Icon, tone }) {
  return <article className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20"><div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-400">{label}</p><p className="mt-1 text-2xl font-black text-white">{value}</p></article>
}

function IncidentRow({ incident, selected, onSelect }) {
  return <button type="button" onClick={() => onSelect(incident)} className={`w-full rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-red-400 ${selected ? 'border-red-400/70 bg-red-500/10' : 'border-white/10 bg-slate-900/50 hover:border-white/25 hover:bg-slate-800'}`}>
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-black text-white">{incident.title}</p><p className="mt-1 truncate text-xs text-slate-400">#{incident.id.slice(-8)} · {incident.type}</p></div><span className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-black uppercase ${priorityClass(incident.severity)}`}>{incident.severity}</span></div>
    <p className="mt-3 flex items-center gap-1 truncate text-xs text-slate-300"><MapPin className="h-3.5 w-3.5 shrink-0 text-red-300" />{incident.location}</p>
    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500"><span>{incident.createdLabel}</span><span className={statusClass(incident.status)}>{incident.assignedResponderId ? 'Assigned' : 'Unassigned'}</span></div>
  </button>
}

function LiveMap({ incidents, responders, onSelect }) {
  const mapped = incidents.map((incident) => ({ incident, coordinates: coordinatesFor(incident) })).filter(({ coordinates }) => coordinates)
  return <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-lg shadow-slate-950/20"><div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div><h2 className="font-black text-white">Live map</h2><p className="text-xs text-slate-400">Incident and response-unit locations</p></div><MapPin className="h-5 w-5 text-red-300" /></div><div className="relative min-h-[360px] overflow-hidden bg-[#0b1628]" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.08) 1px, transparent 1px)', backgroundSize: '36px 36px' }}><div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(30,64,175,.22),transparent_55%)]" /><div className="absolute left-4 top-4 rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-xs text-slate-300"><span className="mr-3 inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-red-400" />Incidents</span><span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-400" />Units</span></div>{mapped.length ? mapped.map(({ incident, coordinates }) => <button key={incident.id} type="button" title={`Open ${incident.title}`} onClick={() => onSelect(incident)} className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-red-600 text-[10px] font-black text-white shadow-lg shadow-red-950/60 focus:outline-none focus:ring-2 focus:ring-red-300" style={{ left: `${50 + (coordinates[1] + 36.82) * 55}%`, top: `${50 - (coordinates[0] + 1.29) * 55}%` }}>!</button>) : <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-slate-400">No incident coordinates are available yet.</div>}{responders.filter((responder) => responder.availability === 'Online' && responder.currentAssignment).slice(0, 5).map((responder, index) => <span key={responder.id} className="absolute flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-[9px] font-black text-white" style={{ left: `${22 + index * 14}%`, top: `${72 - index * 8}%` }} title={responder.fullName || responder.email}>U</span>)}</div></section>
}

export default function DispatchCommandCentre() {
  const [incidents, setIncidents] = useState([])
  const [responders, setResponders] = useState([])
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState('All')
  const [assignment, setAssignment] = useState('All')
  const [sort, setSort] = useState('priority')
  const [unitFilter, setUnitFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [assignmentOpen, setAssignmentOpen] = useState(false)
  const [responderQuery, setResponderQuery] = useState('')
  const [selectedResponder, setSelectedResponder] = useState('')
  const [statusBusy, setStatusBusy] = useState(false)
  const [muted, setMuted] = useState(() => localStorage.getItem('jiranialert_dispatch_muted') === 'true')
  const knownIncidentIds = useRef(new Set())
  const hasLoadedIncidents = useRef(false)

  const load = async (background = false) => {
    if (background) setRefreshing(true)
    else setLoading(true)
    try {
      const [incidentData, teamData] = await Promise.all([listResponderIncidents(100), listTeamMembers()])
      setIncidents((incidentData.reports || incidentData.incidents || []).map(normalizeIncident))
      setResponders(teamData.members || [])
      setError('')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load dispatch data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    const timer = window.setInterval(() => load(true), 10000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!incidents.length) return
    if (!hasLoadedIncidents.current) {
      incidents.forEach((incident) => knownIncidentIds.current.add(incident.id))
      hasLoadedIncidents.current = true
      return
    }
    const newIncident = incidents.some((incident) => !knownIncidentIds.current.has(incident.id))
    incidents.forEach((incident) => knownIncidentIds.current.add(incident.id))
    if (!newIncident || muted) return
    try {
      const context = new window.AudioContext()
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      oscillator.frequency.value = 660
      gain.gain.value = 0.04
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start()
      oscillator.stop(context.currentTime + 0.12)
    } catch {
      // Browsers can block audio until the user interacts with the page.
    }
  }, [incidents, muted])

  const filteredIncidents = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return incidents.filter((incident) => {
      const matchesText = !needle || `${incident.id} ${incident.title} ${incident.type} ${incident.location} ${incident.status}`.toLowerCase().includes(needle)
      const matchesPriority = priority === 'All' || incident.severity === priority
      const matchesAssignment = assignment === 'All' || (assignment === 'Assigned' ? Boolean(incident.assignedResponderId) : !incident.assignedResponderId)
      return matchesText && matchesPriority && matchesAssignment
    }).sort((a, b) => sort === 'priority' ? (priorityWeight[b.severity] || 0) - (priorityWeight[a.severity] || 0) : timestampMs(b.createdAt) - timestampMs(a.createdAt))
  }, [assignment, incidents, priority, query, sort])

  const filteredResponders = useMemo(() => responders.filter((responder) => {
    const status = responder.currentAssignment ? (responder.currentAssignment.status || 'Assigned') : responder.availability === 'Online' ? 'Available' : 'Unavailable'
    const matchesStatus = unitFilter === 'All' || status === unitFilter
    const matchesText = !responderQuery || `${responder.fullName} ${responder.displayName} ${responder.email} ${responder.specialization || responder.role}`.toLowerCase().includes(responderQuery.toLowerCase())
    return matchesStatus && matchesText
  }), [responderQuery, responders, unitFilter])

  const stats = useMemo(() => ({
    unassigned: incidents.filter((incident) => !incident.assignedResponderId && !['Resolved', 'Closed', 'Completed'].includes(incident.status)).length,
    active: incidents.filter((incident) => !['Resolved', 'Closed', 'Completed'].includes(incident.status)).length,
    available: responders.filter((responder) => responder.availability === 'Online' && !responder.currentAssignment).length,
    resolved: incidents.filter((incident) => ['Resolved', 'Closed', 'Completed'].includes(incident.status) && new Date(timestampMs(incident.updatedAt || incident.createdAt)).toDateString() === new Date().toDateString()).length,
  }), [incidents, responders])

  const activity = useMemo(() => incidents.flatMap((incident) => (incident.timeline || []).map((entry) => ({ ...entry, incidentTitle: incident.title }))).sort((a, b) => timestampMs(b.createdAt) - timestampMs(a.createdAt)).slice(0, 8), [incidents])

  const toggleMuted = () => {
    setMuted((current) => {
      const next = !current
      localStorage.setItem('jiranialert_dispatch_muted', String(next))
      return next
    })
  }

  const assign = async () => {
    if (!selected || !selectedResponder) return
    setStatusBusy(true)
    try {
      const response = await assignIncident(selected.id, selectedResponder)
      const updated = normalizeIncident(response.incident)
      setIncidents((items) => items.map((item) => item.id === updated.id ? updated : item))
      setSelected(updated)
      setAssignmentOpen(false)
      setNotice('Responder assigned successfully.')
      await load(true)
    } catch (requestError) {
      setNotice(requestError?.message || 'Unable to assign responder.')
    } finally {
      setStatusBusy(false)
    }
  }

  const updateStatus = async (status) => {
    if (!selected) return
    setStatusBusy(true)
    try {
      const response = await updateIncidentStatus(selected.id, status)
      const updated = normalizeIncident(response.incident)
      setIncidents((items) => items.map((item) => item.id === updated.id ? updated : item))
      setSelected(updated)
      setNotice(`Incident status updated to ${status}.`)
    } catch (requestError) {
      setNotice(requestError?.message || 'Unable to update incident status.')
    } finally {
      setStatusBusy(false)
    }
  }

  return <div className="space-y-5 rounded-3xl bg-slate-950 p-4 text-slate-100 shadow-2xl sm:p-6">
    <header className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end"><div><Link to="/responder/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white">← Back to dashboard</Link><p className="mt-4 text-xs font-black uppercase tracking-[.22em] text-red-300">Responder operations</p><h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">Dispatch Command Centre</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Coordinate incidents and response units from one live operational view.</p></div><div className="flex flex-wrap items-center gap-3 text-sm"><span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 font-bold text-emerald-300"><i className="h-2 w-2 rounded-full bg-emerald-400" />Live connection</span><button type="button" onClick={toggleMuted} aria-pressed={muted} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10">{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}{muted ? 'Sound off' : 'Sound on'}</button><button type="button" onClick={() => load(true)} aria-label="Refresh dispatch data" className="rounded-xl border border-white/10 p-2.5 text-slate-300 hover:bg-white/10">{refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}</button></div></header>
    {error ? <div role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">{error}</div> : null}
    {notice ? <div role="status" className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-3 text-sm font-semibold text-blue-200">{notice}</div> : null}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Unassigned incidents" value={stats.unassigned} icon={AlertTriangle} tone="bg-red-500/15 text-red-300" /><Stat label="Active incidents" value={stats.active} icon={Clock3} tone="bg-amber-500/15 text-amber-300" /><Stat label="Available responders" value={stats.available} icon={ShieldCheck} tone="bg-emerald-500/15 text-emerald-300" /><Stat label="Resolved today" value={stats.resolved} icon={CheckCircle2} tone="bg-blue-500/15 text-blue-300" /></div>
    <div className="grid gap-5 xl:grid-cols-[minmax(260px,.85fr)_minmax(360px,1.35fr)_minmax(260px,.85fr)]">
      <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20"><div className="flex items-center justify-between"><div><h2 className="font-black text-white">Incident queue</h2><p className="text-xs text-slate-400">{filteredIncidents.length} visible</p></div><Filter className="h-5 w-5 text-slate-400" /></div><label className="relative mt-4 block"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search incidents..." className="h-10 w-full rounded-xl border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none focus:border-red-400" /></label><div className="mt-3 grid grid-cols-2 gap-2"><select value={priority} onChange={(event) => setPriority(event.target.value)} className="rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-slate-200"><option>All</option>{priorities.slice(1).map((value) => <option key={value}>{value}</option>)}</select><select value={assignment} onChange={(event) => setAssignment(event.target.value)} className="rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-slate-200">{assignmentFilters.map((value) => <option key={value}>{value}</option>)}</select></div><select value={sort} onChange={(event) => setSort(event.target.value)} className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-xs text-slate-200"><option value="priority">Sort: priority</option><option value="time">Sort: newest</option></select><div className="mt-4 grid max-h-[560px] gap-2 overflow-y-auto pr-1">{loading ? <p className="py-8 text-center text-sm text-slate-400">Loading incidents...</p> : filteredIncidents.length ? filteredIncidents.map((incident) => <IncidentRow key={incident.id} incident={incident} selected={selected?.id === incident.id} onSelect={setSelected} />) : <p className="py-8 text-center text-sm text-slate-400">No incidents match the current filters.</p>}</div></section>
      <LiveMap incidents={filteredIncidents} responders={responders} onSelect={setSelected} />
      <section className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20"><div className="flex items-center justify-between"><div><h2 className="font-black text-white">Response units</h2><p className="text-xs text-slate-400">{filteredResponders.length} visible</p></div><ShieldCheck className="h-5 w-5 text-emerald-300" /></div><label className="relative mt-4 block"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input value={responderQuery} onChange={(event) => setResponderQuery(event.target.value)} placeholder="Search responders..." className="h-10 w-full rounded-xl border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none focus:border-emerald-400" /></label><div className="mt-3 flex gap-1 overflow-x-auto pb-1">{unitFilters.map((value) => <button type="button" key={value} onClick={() => setUnitFilter(value)} className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-[11px] font-bold ${unitFilter === value ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-slate-400 hover:text-white'}`}>{value}</button>)}</div><div className="mt-4 grid max-h-[560px] gap-2 overflow-y-auto pr-1">{filteredResponders.length ? filteredResponders.map((responder) => <div key={responder.id} className="rounded-xl border border-white/10 bg-slate-950/60 p-3"><div className="flex items-start justify-between gap-2"><div><p className="font-bold text-white">{responder.fullName || responder.displayName || responder.email}</p><p className="mt-1 text-xs text-slate-500">ID {responder.id.slice(-8)} · {responder.specialization || 'Emergency responder'}</p></div><span className={`text-xs font-bold ${responder.availability === 'Online' ? 'text-emerald-300' : 'text-slate-400'}`}>{responder.availability || 'Unavailable'}</span></div><p className="mt-3 text-xs text-slate-400">{responder.currentAssignment ? `Assigned: ${responder.currentAssignment.title || responder.currentAssignment.id}` : 'No current assignment'}</p><p className="mt-1 text-[11px] text-slate-500">Last update: {formatDate(responder.updatedAt)}</p></div>) : <p className="py-8 text-center text-sm text-slate-400">No responders match this filter.</p>}</div></section>
    </div>
    <section className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 shadow-lg shadow-slate-950/20"><div className="flex items-center justify-between"><div><h2 className="font-black text-white">Recent dispatch activity</h2><p className="text-xs text-slate-400">Assignments, acknowledgements, status changes, and resolutions</p></div><Clock3 className="h-5 w-5 text-slate-400" /></div><div className="mt-4 grid gap-2 md:grid-cols-2">{activity.length ? activity.map((entry, index) => <div key={`${entry.createdAt || index}-${entry.incidentTitle}`} className="rounded-xl border border-white/10 bg-slate-950/50 p-3"><p className="text-sm font-bold text-slate-200">{entry.label || entry.type || 'Dispatch update'}</p><p className="mt-1 text-xs text-slate-400">{entry.incidentTitle}</p><p className="mt-1 text-[11px] text-slate-600">{formatDate(entry.createdAt)}</p></div>) : <p className="py-5 text-sm text-slate-400">No dispatch activity has been recorded yet.</p>}</div></section>
    {selected ? <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/70" role="dialog" aria-modal="true" aria-label="Incident details"><button type="button" aria-label="Close incident details" onClick={() => setSelected(null)} className="absolute inset-0 cursor-default" /><aside className="relative h-full w-full max-w-xl overflow-y-auto border-l border-white/10 bg-slate-900 p-5 shadow-2xl sm:p-7"><button type="button" onClick={() => setSelected(null)} aria-label="Close" className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X /></button><p className="text-xs font-black uppercase tracking-[.18em] text-red-300">Incident #{selected.id.slice(-8)}</p><h2 className="mt-3 pr-8 text-2xl font-black text-white">{selected.title}</h2><div className="mt-3 flex flex-wrap gap-2"><span className={`rounded-full border px-3 py-1 text-xs font-bold ${priorityClass(selected.severity)}`}>{selected.severity} priority</span><span className={`rounded-full border border-white/10 bg-slate-950 px-3 py-1 text-xs font-bold ${statusClass(selected.status)}`}>{selected.status}</span></div><dl className="mt-6 grid gap-4 text-sm"><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Category</dt><dd className="mt-1 text-slate-200">{selected.type}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Location</dt><dd className="mt-1 text-slate-200">{selected.location}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Reported</dt><dd className="mt-1 text-slate-200">{formatDate(selected.createdAt)}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Description</dt><dd className="mt-1 leading-6 text-slate-300">{selected.description}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Reporter</dt><dd className="mt-1 text-slate-200">{selected.anonymous ? 'Anonymous reporter' : selected.reporterName || selected.reporterEmail || 'Restricted by privacy settings'}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Assigned responder</dt><dd className="mt-1 text-slate-200">{selected.assignedResponderEmail || selected.assignedResponderId || 'Unassigned'}</dd></div></dl><div className="mt-7 flex flex-wrap gap-2"><button type="button" disabled={statusBusy} onClick={() => { setSelectedResponder(''); setAssignmentOpen(true) }} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-50"><UserPlus className="h-4 w-4" />Assign responder</button><select disabled={statusBusy} value={selected.status} onChange={(event) => updateStatus(event.target.value)} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-sm font-bold text-white"><option value={selected.status}>{selected.status}</option>{lifecycle.filter((status) => status !== selected.status).map((status) => <option key={status}>{status}</option>)}</select>{coordinatesFor(selected) ? <button type="button" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${coordinatesFor(selected).join(',')}`, '_blank', 'noopener,noreferrer')} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10"><ExternalLink className="h-4 w-4" />View location</button> : null}</div><div className="mt-7 border-t border-white/10 pt-5"><h3 className="font-black text-white">Assignment history</h3><div className="mt-3 grid gap-2">{(selected.timeline || []).slice().reverse().slice(0, 8).map((entry, index) => <div key={`${entry.createdAt || index}`} className="rounded-lg bg-slate-950/70 p-3 text-xs text-slate-300"><p className="font-bold">{entry.label || entry.type || 'Dispatch update'}</p><p className="mt-1 text-slate-500">{formatDate(entry.createdAt)}</p></div>)}{!(selected.timeline || []).length ? <p className="text-sm text-slate-500">No dispatch history recorded.</p> : null}</div></div></aside></div> : null}
    {assignmentOpen && selected ? <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4" role="dialog" aria-modal="true" aria-label="Assign responder"><div className="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl sm:p-6"><div className="flex items-start justify-between"><div><h2 className="text-xl font-black text-white">Assign responder</h2><p className="mt-1 text-sm text-slate-400">{selected.title}</p></div><button type="button" onClick={() => setAssignmentOpen(false)} aria-label="Close assignment dialog" className="rounded-lg p-2 text-slate-400 hover:bg-white/10"><X /></button></div><label className="relative mt-5 block"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input value={responderQuery} onChange={(event) => setResponderQuery(event.target.value)} placeholder="Search available responders..." className="h-11 w-full rounded-xl border border-white/10 bg-slate-950 pl-9 pr-3 text-sm text-white outline-none focus:border-emerald-400" /></label><div className="mt-4 max-h-64 space-y-2 overflow-y-auto">{responders.filter((responder) => responder.availability === 'Online' && !responder.currentAssignment && `${responder.fullName} ${responder.email}`.toLowerCase().includes(responderQuery.toLowerCase())).map((responder) => <button type="button" key={responder.id} onClick={() => setSelectedResponder(responder.id)} className={`w-full rounded-xl border p-3 text-left ${selectedResponder === responder.id ? 'border-emerald-400 bg-emerald-500/10' : 'border-white/10 bg-slate-950/60 hover:border-white/25'}`}><p className="font-bold text-white">{responder.fullName || responder.displayName || responder.email}</p><p className="mt-1 text-xs text-slate-400">{responder.specialization || 'Emergency responder'} · Available</p></button>)}{!responders.some((responder) => responder.availability === 'Online' && !responder.currentAssignment) ? <p className="py-5 text-center text-sm text-slate-400">No available responders can be assigned.</p> : null}</div><button type="button" disabled={!selectedResponder || statusBusy} onClick={assign} className="mt-5 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">{statusBusy ? 'Assigning...' : 'Confirm assignment'}</button></div></div> : null}
  </div>
}
