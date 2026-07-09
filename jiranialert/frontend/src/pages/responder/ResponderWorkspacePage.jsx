import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  HelpCircle,
  Map,
  Megaphone,
  MessageSquare,
  Mic,
  Navigation2,
  Radio,
  Settings2,
  ShieldCheck,
  Truck,
  Users,
  Video,
} from 'lucide-react'
import { getCurrentUser, getPreferredUserName } from '../../lib/auth'
import { listNotifications } from '../../lib/notificationsApi'
import { acceptIncident, listAssignedIncidents, listResponderIncidents, rejectIncident, updateIncidentStatus } from '../../lib/responderApi'
import { EmptyState, FilterBar, IncidentCard, LoadingState, NotificationCard, PageHeader, ResponderShell, SearchBar, SectionCard, StatCard, StatusBadge } from './ResponderComponents'
import { facilities, fallbackIncidents, normalizeIncident, responderUnits } from './responderUtils'

const pageMeta = {
  incidents: ['Active Incidents', 'Live incident queue with filters, severity, distance, and action controls.', AlertTriangle],
  assigned: ['Assigned Incidents', 'Incidents assigned to the logged-in responder with progress and completion controls.', CheckCircle2],
  map: ['Incident Map', 'Operational map with responder location, incidents, nearby units, facilities, and routes.', Map],
  dispatch: ['Dispatch Center', 'Unit availability, dispatch queue, assignments, transfers, and backup requests.', Radio],
  communications: ['Communications', 'Team chat, radio log, call placeholders, and emergency broadcasts.', MessageSquare],
  residents: ['Residents', 'Affected residents, evacuation status, welfare checks, and emergency contacts.', Users],
  team: ['Team Members', 'Responder teams, roles, current unit status, and handoff awareness.', ShieldCheck],
  equipment: ['Equipment', 'Assigned gear, equipment status, maintenance history, and request flow.', Truck],
  reports: ['Reports', 'Incident reports, completed reports, export actions, and submission queue.', FileText],
  analytics: ['Analytics', 'Response time, incidents handled, completion rate, and responder performance.', Activity],
  resources: ['Resources', 'Emergency protocols, first aid guides, SOP documents, and downloads.', BookOpen],
  announcements: ['Announcements', 'Operational updates, weather alerts, and command notices.', Megaphone],
  profile: ['Profile', 'Responder information, badge number, certifications, shift schedule, and availability.', ShieldCheck],
  settings: ['Settings', 'Notifications, password, privacy, language, and appearance preferences.', Settings2],
  notifications: ['Notifications', 'Responder command notifications and operational alerts.', Bell],
  help: ['Help & Support', 'FAQs, tutorials, contact support, and issue reporting.', HelpCircle],
}

function useResponderIncidents(assignedOnly = false) {
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = assignedOnly ? await listAssignedIncidents(50) : await listResponderIncidents(50)
      setIncidents(((data.incidents || data.reports || fallbackIncidents)).map(normalizeIncident))
    } catch (e) {
      setError(e?.message || 'Unable to load incidents')
      setIncidents(fallbackIncidents.map(normalizeIncident))
    } finally {
      setLoading(false)
    }
  }, [assignedOnly])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      reload()
    }, 0)
    return () => {
      window.clearTimeout(timer)
    }
  }, [reload])

  return { incidents, loading, error, reload, setIncidents }
}

export default function ResponderWorkspacePage({ page }) {
  const meta = pageMeta[page] || pageMeta.incidents
  const [title, description, Icon] = meta

  return (
    <ResponderShell>
      <div className="grid gap-5">
        <PageHeader title={title} description={description} icon={Icon} />
        {page === 'incidents' ? <ActiveIncidentsPage /> : null}
        {page === 'assigned' ? <AssignedIncidentsPage /> : null}
        {page === 'map' ? <IncidentMapPage /> : null}
        {page === 'dispatch' ? <DispatchPage /> : null}
        {page === 'communications' ? <CommunicationsPage /> : null}
        {page === 'residents' ? <ResidentsPage /> : null}
        {page === 'team' ? <TeamPage /> : null}
        {page === 'equipment' ? <EquipmentPage /> : null}
        {page === 'reports' ? <ReportsPage /> : null}
        {page === 'analytics' ? <AnalyticsPage /> : null}
        {page === 'resources' ? <ResourcesPage /> : null}
        {page === 'announcements' ? <AnnouncementsPage /> : null}
        {page === 'profile' ? <ProfilePage /> : null}
        {page === 'settings' ? <SettingsPage /> : null}
        {page === 'notifications' ? <NotificationsPage /> : null}
        {page === 'help' ? <HelpPage /> : null}
      </div>
    </ResponderShell>
  )
}

function ActiveIncidentsPage() {
  const { incidents, loading, error, reload, setIncidents } = useResponderIncidents(false)
  const [query, setQuery] = useState('')
  const [severity, setSeverity] = useState('All')
  const navigate = useNavigate()
  const filtered = incidents.filter((item) => {
    const haystack = `${item.title} ${item.type} ${item.location} ${item.severity} ${item.status}`.toLowerCase()
    return haystack.includes(query.toLowerCase()) && (severity === 'All' || item.severity === severity)
  })

  const handleAccept = async (incident) => {
    const data = await acceptIncident(incident.id)
    setIncidents((items) => items.map((item) => (item.id === incident.id ? normalizeIncident(data.incident) : item)))
  }

  const handleReject = async (incident) => {
    const data = await rejectIncident(incident.id, 'Responder declined from active queue')
    setIncidents((items) => items.map((item) => (item.id === incident.id ? normalizeIncident(data.incident) : item)))
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <SectionCard title="Incident cards" subtitle="Search, filter, accept, reject, and open details" icon={AlertTriangle}>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <SearchBar value={query} onChange={setQuery} placeholder="Search active incidents" />
          <FilterBar options={['All', 'Critical', 'High', 'Medium', 'Low']} value={severity} onChange={setSeverity} />
        </div>
        {error ? <p className="mt-3 text-sm text-amber-200">Using fallback incident feed: {error}</p> : null}
        <div className="mt-5 grid gap-3">
          {loading ? <LoadingState /> : filtered.length ? filtered.map((incident) => <IncidentCard key={incident.id} incident={incident} onAccept={handleAccept} onReject={handleReject} />) : <EmptyState title="No matching incidents" />}
        </div>
      </SectionCard>
      <SectionCard title="Live status" subtitle="Operational signals" icon={Clock3}>
        <div className="grid gap-3">
          <StatCard label="Visible incidents" value={filtered.length} detail="After search and filters" icon={AlertTriangle} tone="text-red-200" />
          <StatCard label="Critical / High" value={incidents.filter((item) => ['Critical', 'High'].includes(item.severity)).length} detail="Escalated attention required" icon={SirenIcon} tone="text-orange-200" />
          <button type="button" onClick={reload} className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-100">Refresh queue</button>
          <button type="button" onClick={() => navigate('/responder/map')} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-100">Open incident map</button>
        </div>
      </SectionCard>
    </div>
  )
}

function AssignedIncidentsPage() {
  const { incidents, loading, error, setIncidents } = useResponderIncidents(true)
  const fallbackAssigned = incidents.length ? incidents : fallbackIncidents.filter((item) => item.status === 'Assigned').map(normalizeIncident)
  const updateStatus = async (incident, status) => {
    const data = await updateIncidentStatus(incident.id, status)
    setIncidents((items) => items.map((item) => (item.id === incident.id ? normalizeIncident(data.incident) : item)))
  }

  return (
    <SectionCard title="Assigned response work" subtitle="Progress, ETA, status updates, and completion" icon={CheckCircle2}>
      {error ? <p className="mb-3 text-sm text-amber-200">Using fallback assigned feed: {error}</p> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        {loading ? <LoadingState /> : fallbackAssigned.map((incident, index) => (
          <div key={incident.id} className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <StatusBadge value={incident.status} />
                <h3 className="mt-3 text-lg font-black text-white">{incident.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{incident.location} / ETA {incident.eta}</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-slate-300">{45 + index * 18}%</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-red-500" style={{ width: `${45 + index * 18}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {['En Route', 'On Scene', 'Stabilized', 'Completed'].map((status) => (
                <button key={status} type="button" onClick={() => updateStatus(incident, status)} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-100 transition hover:bg-white/10">{status}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function IncidentMapPage() {
  const { incidents } = useResponderIncidents(false)
  const points = incidents.slice(0, 5).map((item, index) => ({ item, top: `${18 + index * 14}%`, left: `${20 + ((index * 17) % 62)}%` }))
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
      <SectionCard title="Interactive operations map" subtitle="Responder location, incidents, units, facilities, and safe routes" icon={Map}>
        <div className="relative min-h-[430px] overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.96)),radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.24),transparent_24%)]">
          <div className="absolute inset-x-0 top-1/3 h-px bg-white/10" />
          <div className="absolute inset-x-0 top-2/3 h-px bg-white/10" />
          <div className="absolute inset-y-0 left-1/3 w-px bg-white/10" />
          <div className="absolute inset-y-0 right-1/3 w-px bg-white/10" />
          <div className="absolute left-[48%] top-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/40 bg-cyan-400/20 px-3 py-2 text-xs font-black text-cyan-50">You</div>
          {points.map(({ item, top, left }) => (
            <button key={item.id} type="button" className="absolute rounded-full border border-red-300/40 bg-red-500/25 px-3 py-2 text-xs font-bold text-red-50 shadow-[0_0_30px_rgba(239,68,68,0.28)]" style={{ top, left }}>
              {item.type}
            </button>
          ))}
          <div className="absolute bottom-5 left-5 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-100">
            Safe route active / northern corridor
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Nearby facilities" subtitle="Hospitals, police stations, fire stations" icon={Navigation2}>
        <div className="grid gap-3">
          {facilities.map((facility) => {
            const Icon = facility.icon
            return (
              <div key={facility.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-cyan-200" />
                  <div>
                    <p className="font-bold text-white">{facility.name}</p>
                    <p className="text-sm text-slate-400">{facility.type}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-200">{facility.distance}</span>
              </div>
            )
          })}
        </div>
      </SectionCard>
    </div>
  )
}

function DispatchPage() {
  const { incidents } = useResponderIncidents(false)
  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <SectionCard title="Available units" subtitle="Assign responder resources" icon={Radio}>
        <div className="grid gap-3">
          {responderUnits.map((unit) => {
            const Icon = unit.specialty
            return (
              <div key={unit.id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-cyan-200" />
                    <div>
                      <p className="font-bold text-white">{unit.name}</p>
                      <p className="text-sm text-slate-400">{unit.crew}</p>
                    </div>
                  </div>
                  <StatusBadge value={unit.status === 'Available' ? 'Completed' : unit.status === 'En Route' ? 'En Route' : 'Assigned'} />
                </div>
              </div>
            )
          })}
        </div>
      </SectionCard>
      <SectionCard title="Dispatch queue" subtitle="Assign, transfer, and request backup" icon={AlertTriangle}>
        <div className="grid gap-3">
          {incidents.slice(0, 5).map((incident) => (
            <div key={incident.id} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="font-bold text-white">{incident.title}</p>
              <p className="mt-1 text-sm text-slate-400">{incident.location}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-100">Assign responder</button>
                <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-100">Transfer</button>
                <button type="button" className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100">Request backup</button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function CommunicationsPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
      <SectionCard title="Team chat" subtitle="Secure responder coordination" icon={MessageSquare}>
        <div className="grid gap-3">
          {['Dispatch: Unit 12 cleared for north approach.', 'Medic 4: Patient contact established.', 'Command: Broadcast weather advisory to field teams.'].map((message) => <div key={message} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-200">{message}</div>)}
        </div>
      </SectionCard>
      <SectionCard title="Radio and call controls" subtitle="Radio log, voice, video, broadcasts" icon={Mic}>
        <div className="grid gap-3">
          {['Radio channel Alpha online', 'Voice call placeholder ready', 'Video call placeholder ready', 'Emergency broadcast channel armed'].map((item, index) => (
            <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              {index === 2 ? <Video className="h-5 w-5 text-cyan-200" /> : <Mic className="h-5 w-5 text-cyan-200" />}
              <span className="text-sm font-bold text-white">{item}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function ResidentsPage() {
  const residents = ['Kilimani Block C / Evacuating / 8 contacts', 'Westlands Tower B / Welfare checks / 12 residents', 'South B Estate / Shelter in place / 5 emergency contacts']
  return <ListPage title="Resident operations" subtitle="Affected residents, evacuation status, welfare checks, and emergency contacts" icon={Users} items={residents} />
}

function TeamPage() {
  return <ListPage title="Responder team roster" subtitle="Team members and active unit roles" icon={ShieldCheck} items={responderUnits.map((unit) => `${unit.name} / ${unit.status} / ${unit.crew}`)} />
}

function EquipmentPage() {
  const items = ['Trauma kit 12 / Ready / Maintenance due in 12 days', 'Radio pack 04 / Ready / Battery 91%', 'Thermal camera / In use / Last checked today', 'Rescue drone battery bank / Charging / 2 units online']
  return <ListPage title="Equipment status" subtitle="Assigned equipment, maintenance history, and request controls" icon={Truck} items={items} action="Request equipment" />
}

function ReportsPage() {
  const { incidents } = useResponderIncidents(false)
  return (
    <SectionCard title="Incident reports" subtitle="Completed reports, export actions, and submission queue" icon={FileText}>
      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-100"><Download className="h-4 w-4" /> Export report</button>
        <button type="button" className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">Submit report</button>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {incidents.slice(0, 6).map((incident) => <IncidentCard key={incident.id} incident={incident} actionLabel="Report details" />)}
      </div>
    </SectionCard>
  )
}

function AnalyticsPage() {
  const metrics = [
    ['Response time', '6.2 min', 'Average first response window', Clock3],
    ['Incidents handled', '128', 'Completed across current period', FileText],
    ['Completion rate', '92%', 'Closed incidents against assignments', CheckCircle2],
    ['Performance', 'A-', 'Responder readiness score', Activity],
  ]
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{metrics.map(([label, value, detail, Icon]) => <StatCard key={label} label={label} value={value} detail={detail} icon={Icon} />)}</div>
      <SectionCard title="Performance charts" subtitle="Operational chart placeholders" icon={Activity}>
        <div className="grid gap-4 lg:grid-cols-3">
          {['Response trend', 'Incident severity mix', 'Completion curve'].map((label, index) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
              <p className="font-bold text-white">{label}</p>
              <div className="mt-4 flex h-36 items-end gap-2">
                {[40, 68, 52, 88, 74].map((height, barIndex) => <div key={barIndex} className="flex-1 rounded-t-xl bg-gradient-to-t from-red-500 to-cyan-400" style={{ height: `${Math.max(18, height - index * 8)}%` }} />)}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function ResourcesPage() {
  return <ListPage title="Responder resource library" subtitle="Emergency protocols, first aid guides, SOPs, and downloadable PDFs" icon={BookOpen} items={['Fire response SOP.pdf', 'Medical triage guide.pdf', 'Flood evacuation playbook.pdf', 'Radio codes quick sheet.pdf']} action="Download PDF" />
}

function AnnouncementsPage() {
  return <ListPage title="Operational announcements" subtitle="Command notices, operational updates, and weather alerts" icon={Megaphone} items={['Weather alert: Heavy rain watch from 21:00', 'Command notice: Alpha channel maintenance at midnight', 'Operational update: New route advisory for Westlands']} />
}

function ProfilePage() {
  const currentUser = getCurrentUser() || {}
  const name = getPreferredUserName(currentUser) || 'Emergency Responder'
  return (
    <SectionCard title="Responder profile" subtitle="Information, badge, certifications, schedule, and availability" icon={ShieldCheck}>
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-5">
          <p className="text-3xl font-black text-white">{name}</p>
          <p className="mt-2 text-sm text-cyan-200">Badge RD-{String(currentUser.uid || '2048').slice(0, 4).toUpperCase()}</p>
          <p className="mt-4 text-sm leading-6 text-slate-300">Certifications: First Aid, Incident Command, Radio Operations, Community Safety</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {['Shift schedule: Today 18:00-06:00', 'Availability: Ready', 'Specialization: Rescue / medical support', 'Unit: Delta response team'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm font-bold text-slate-100">{item}</div>)}
        </div>
      </div>
    </SectionCard>
  )
}

function SettingsPage() {
  return <ListPage title="Responder settings" subtitle="Notifications, password, privacy, language, and appearance" icon={Settings2} items={['Notifications: Emergency tone enabled', 'Password: Last updated recently', 'Privacy: Team visible', 'Language: English', 'Appearance: Dark command theme']} />
}

function NotificationsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    listNotifications(30).then((data) => setItems(data.notifications || [])).catch(() => setItems([])).finally(() => setLoading(false))
  }, [])
  return (
    <SectionCard title="Responder notifications" subtitle="Account and command alerts" icon={Bell}>
      {loading ? <LoadingState /> : items.length ? <div className="grid gap-3">{items.map((item) => <NotificationCard key={item.id} item={item} />)}</div> : <EmptyState title="No notifications" detail="Responder account notifications will appear here." />}
    </SectionCard>
  )
}

function HelpPage() {
  return <ListPage title="Help and support" subtitle="FAQs, tutorials, contact support, and issue reporting" icon={HelpCircle} items={['FAQs: Responder workspace navigation', 'Tutorial: Accepting and completing incidents', 'Contact support: support@jiranialert.com', 'Report issue: Send diagnostics to command']} />
}

function ListPage({ title, subtitle, icon: Icon, items, action = 'Open' }) {
  return (
    <SectionCard title={title} subtitle={subtitle} icon={Icon}>
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-4">
            <p className="text-sm font-bold leading-6 text-white">{item}</p>
            <button type="button" className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-100">{action}</button>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

function SirenIcon(props) {
  return <AlertTriangle {...props} />
}
