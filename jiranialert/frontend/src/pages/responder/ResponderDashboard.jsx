import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CloudLightning,
  Cpu,
  Flame,
  Globe,
  HeartPulse,
  LayoutGrid,
  MessageSquare,
  Mic,
  Navigation2,
  PhoneCall,
  Radar,
  Siren,
  ShieldCheck,
  SignalHigh,
  Star,
  Users,
  Video,
  Wind,
  Wifi,
  X,
  MapPin,
  Settings2,
  FileText,
} from 'lucide-react'
import Avatar from '../../components/UI/Avatar'
import ResponderCommandBar from '../../components/Layout/ResponderCommandBar'
import { getCurrentUser } from '../../lib/auth'

const severityStyles = {
  Critical: 'border-red-500/30 bg-red-500/10 text-red-200',
  High: 'border-orange-500/30 bg-orange-500/10 text-orange-200',
  Medium: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  Low: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
}

const liveAlerts = [
  { id: 'AL-1041', type: 'Fire', title: 'Warehouse smoke escalation', location: 'Westlands', eta: '4 min', severity: 'Critical', status: 'Dispatching', icon: Flame },
  { id: 'AL-1042', type: 'Medical', title: 'Chest pain incident', location: 'Kilimani', eta: '7 min', severity: 'High', status: 'En route', icon: HeartPulse },
  { id: 'AL-1043', type: 'Crime', title: 'Suspicious activity report', location: 'South B', eta: '5 min', severity: 'Medium', status: 'Standby', icon: ShieldCheck },
]

const activeMissions = [
  { label: 'Mission 01', title: 'Apartment fire suppression', team: 'Engine 12', progress: 78, color: 'from-red-500 to-orange-500' },
  { label: 'Mission 02', title: 'Medical triage response', team: 'Unit Medic 4', progress: 56, color: 'from-cyan-500 to-blue-500' },
  { label: 'Mission 03', title: 'Flood rescue standby', team: 'Rescue 8', progress: 41, color: 'from-indigo-500 to-violet-500' },
]

const comms = [
  { from: 'Dispatch', text: 'Unit 12 cleared to approach via Ring Road.', tone: 'text-slate-200' },
  { from: 'Responder', text: 'Visual confirmed. Requesting backup ladder and EMS support.', tone: 'text-slate-200' },
  { from: 'Dispatch', text: 'Backup approved. Drone feed is live on your channel.', tone: 'text-slate-200' },
]

const quickActions = [
  { label: 'Accept Mission', icon: CheckCircle2 },
  { label: 'Request Backup', icon: Users },
  { label: 'Mark Arrived', icon: Navigation2 },
  { label: 'Radio Check', icon: Mic },
]

const residentDirectory = [
  { name: 'Mwaniki Estate', status: '12 residents flagged', tone: 'text-red-200' },
  { name: 'Kilimani Block C', status: '8 residents checked in', tone: 'text-cyan-200' },
  { name: 'Westlands Tower B', status: '3 escalations open', tone: 'text-amber-200' },
]

const responderAnnouncements = [
  { title: 'Shift briefing updated', detail: 'New hazard map and coverage notes are live.' },
  { title: 'Weather advisory', detail: 'Heavy rain watch active for the evening window.' },
  { title: 'Protocol reminder', detail: 'Verify scene safety before entering high-rise incidents.' },
]

const responderResources = [
  'Triage checklist',
  'Radio codes sheet',
  'Scene safety guide',
  'Evacuation playbook',
]

const analytics = [
  { label: 'Avg response', value: '6.2 min', width: '78%' },
  { label: 'Missions completed', value: '128', width: '92%' },
  { label: 'Teams active', value: '14', width: '64%' },
  { label: 'Escalations handled', value: '23', width: '54%' },
]

const quickNavigationButtons = [
  { label: 'Dashboard', target: '/responder/dashboard', icon: LayoutGrid, tone: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100', badge: null },
  { label: 'Active Incidents', target: '/responder/incidents', icon: AlertTriangle, tone: 'border-red-400/35 bg-red-500/10 text-red-100', badge: '18' },
  { label: 'Assigned Cases', target: '/responder/reports', icon: FileText, tone: 'border-amber-400/35 bg-amber-500/10 text-amber-100', badge: '6' },
  { label: 'Map View', target: '/responder/dashboard#responder-map', icon: Globe, tone: 'border-sky-400/35 bg-sky-500/10 text-sky-100', badge: null },
  { label: 'Messages', target: '/responder/help-support', icon: MessageSquare, tone: 'border-indigo-400/35 bg-indigo-500/10 text-indigo-100', badge: '4' },
  { label: 'Incident Reports', target: '/responder/reports', icon: FileText, tone: 'border-blue-400/35 bg-blue-500/10 text-blue-100', badge: null },
  { label: 'Community Alerts', target: '/responder/dashboard#responder-announcements', icon: Bell, tone: 'border-orange-400/35 bg-orange-500/10 text-orange-100', badge: '3' },
  { label: 'Team Coordination', target: '/responder/team-members', icon: Users, tone: 'border-violet-400/35 bg-violet-500/10 text-violet-100', badge: null },
  { label: 'Resources', target: '/responder/dashboard#responder-resources', icon: ShieldCheck, tone: 'border-emerald-400/35 bg-emerald-500/10 text-emerald-100', badge: null },
  { label: 'Analytics', target: '/responder/dashboard#responder-analytics', icon: Activity, tone: 'border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-100', badge: null },
  { label: 'Settings', target: '/responder/settings', icon: Settings2, tone: 'border-slate-300/30 bg-slate-500/10 text-slate-100', badge: null },
]

const recentActivityTimeline = [
  { time: '2m ago', title: 'Warehouse smoke escalation updated', detail: 'Priority changed to Critical and backup requested.', tone: 'text-red-200' },
  { time: '7m ago', title: 'Medic Unit 4 reached scene', detail: 'Patient triage initiated in Kilimani.', tone: 'text-cyan-200' },
  { time: '12m ago', title: 'Dispatch channel switched', detail: 'Team moved to secure channel 3.', tone: 'text-amber-200' },
  { time: '19m ago', title: 'Community alert broadcasted', detail: 'Residents notified to avoid Westlands route.', tone: 'text-emerald-200' },
]

const heatmapPoints = [
  { top: '18%', left: '18%', size: 1.2, tone: 'bg-red-500/60' },
  { top: '33%', left: '62%', size: 1.7, tone: 'bg-orange-400/60' },
  { top: '52%', left: '42%', size: 1.4, tone: 'bg-cyan-400/55' },
  { top: '68%', left: '74%', size: 1.1, tone: 'bg-emerald-400/55' },
  { top: '78%', left: '26%', size: 1.5, tone: 'bg-amber-400/55' },
]

export default function ResponderDashboard() {
  const currentUser = getCurrentUser() || {}
  const [online, setOnline] = useState(true)
  const [selectedAlert, setSelectedAlert] = useState(liveAlerts[0])
  const [commandMode, setCommandMode] = useState('Command')
  const [messagesOpen, setMessagesOpen] = useState(true)
  const [lastActive] = useState(() => new Date().toLocaleString())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSelectedAlert((current) => {
        const index = liveAlerts.findIndex((item) => item.id === current.id)
        return liveAlerts[(index + 1) % liveAlerts.length]
      })
    }, 4500)

    return () => window.clearInterval(timer)
  }, [])

  const responderName = currentUser.displayName || 'Emergency Responder'
  const responderRole = currentUser.role === 'responder' ? 'Emergency Responder' : 'Responder'

  const stats = useMemo(
    () => [
      { label: 'Active alerts', value: '18', icon: Siren, tone: 'text-red-200' },
      { label: 'Units online', value: '42', icon: Wifi, tone: 'text-cyan-200' },
      { label: 'Backups ready', value: '11', icon: Users, tone: 'text-amber-200' },
      { label: 'Threat level', value: 'Elevated', icon: AlertTriangle, tone: 'text-orange-200' },
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white" id="responder-dashboard">
      <ResponderCommandBar />
      <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-950 to-[#101a2f]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_24%),radial-gradient(circle_at_80%_10%,rgba(239,68,68,0.18),transparent_18%),radial-gradient(circle_at_55%_85%,rgba(251,191,36,0.12),transparent_22%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] xl:items-stretch">
            <div className="max-w-3xl self-stretch">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.26em] text-cyan-200">
                <Radar className="h-4 w-4" />
                Jirani Alert responder command center
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Emergency Responder Dashboard
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Mission control for ambulance responders, firefighters, police officers, disaster teams, and rescue personnel. Monitor alerts, coordinate units, and manage live emergencies from a single secure workspace.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {stats.map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="flex min-w-[160px] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                      <div className="rounded-xl bg-white/10 p-2">
                        <Icon className={`h-4 w-4 ${item.tone}`} />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                        <p className="text-sm font-bold text-white">{item.value}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Shift status</p>
                  <p className="mt-2 text-lg font-black text-white">Online and available</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Response focus</p>
                  <p className="mt-2 text-lg font-black text-white">{selectedAlert.title}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Crew readiness</p>
                  <p className="mt-2 text-lg font-black text-white">42 units online</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Weather risk</p>
                  <p className="mt-2 text-lg font-black text-white">Moderate rain watch</p>
                </div>
              </div>
            </div>

            <div className="flex h-full flex-col gap-3 rounded-[28px] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Command snapshot</p>
                  <p className="mt-1 text-sm font-bold text-white">Live responder overview</p>
                </div>
                <div className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-100">
                  18 active
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Responder identity</p>
                  <div className="mt-3 flex items-center gap-3">
                    <Avatar src={currentUser.profileImageUrl} alt={responderName} size={40} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{responderName}</p>
                      <p className="truncate text-xs text-slate-400">{responderRole}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Quick stats</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-white/5 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Alerts</p>
                      <p className="mt-1 font-bold text-white">7 live</p>
                    </div>
                    <div className="rounded-xl bg-white/5 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Role</p>
                      <p className="mt-1 font-bold text-white">Responder</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Responder status</p>
                  <p className="mt-1 text-sm font-bold text-white">{online ? 'Online and available' : 'Offline mode active'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOnline((value) => !value)}
                  className={`relative h-7 w-14 rounded-full transition-colors ${online ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${online ? 'left-8' : 'left-1'}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setCommandMode('Command')} className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition-all ${commandMode === 'Command' ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                  Command
                </button>
                <button type="button" onClick={() => setCommandMode('Offline')} className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition-all ${commandMode === 'Offline' ? 'border-orange-400/40 bg-orange-400/10 text-orange-100' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                  Offline Mode
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Selected incident</p>
                  <p className="mt-2 text-lg font-black text-white">{selectedAlert.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{selectedAlert.location} · ETA {selectedAlert.eta}</p>
                  <div className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-bold ${severityStyles[selectedAlert.severity] || severityStyles.Medium}`}>
                    {selectedAlert.severity}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Instant actions</p>
                  <div className="mt-3 grid gap-2">
                    {quickActions.slice(0, 3).map((action) => {
                      const Icon = action.icon
                      return (
                        <button key={action.label} type="button" className="inline-flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-cyan-200" />
                            {action.label}
                          </span>
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 sm:col-span-2 xl:col-span-1">
                  <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Live coordination</p>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                      <div>
                        <p className="text-sm font-bold text-white">Radio channels</p>
                        <p className="text-xs text-slate-400">Secure channels online</p>
                      </div>
                      <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-100">04 live</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                      <div>
                        <p className="text-sm font-bold text-white">Crew ETA</p>
                        <p className="text-xs text-slate-400">Fastest unit arrival window</p>
                      </div>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-100">4 min</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                      <div>
                        <p className="text-sm font-bold text-white">Weather risk</p>
                        <p className="text-xs text-slate-400">Potential rain within the hour</p>
                      </div>
                      <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-100">Moderate</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Active zones</p>
              <p className="mt-2 text-2xl font-black text-white">09</p>
              <p className="mt-1 text-sm text-slate-300">High-priority neighborhoods under watch</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Dispatch queue</p>
              <p className="mt-2 text-2xl font-black text-white">06</p>
              <p className="mt-1 text-sm text-slate-300">Units waiting for assignment</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Channel health</p>
              <p className="mt-2 text-2xl font-black text-white">99%</p>
              <p className="mt-1 text-sm text-slate-300">Voice and data links stable</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Support backlog</p>
              <p className="mt-2 text-2xl font-black text-white">03</p>
              <p className="mt-1 text-sm text-slate-300">Open assistance requests</p>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="mb-4 rounded-[30px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-200">Welcome back</p>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Hello, {responderName}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Stay ready for one-click emergency actions. This command view is optimized for rapid incident response, visibility, and team coordination.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <StatusMiniCard label="Shift status" value={online ? 'Online duty' : 'Offline duty'} tone={online ? 'text-emerald-200' : 'text-slate-300'} />
              <StatusMiniCard label="Location status" value="HQ linked" tone="text-cyan-200" />
              <StatusMiniCard label="Emergency status" value="Elevated" tone="text-red-200" />
              <StatusMiniCard label="Last active" value={lastActive} tone="text-slate-200" />
            </div>
          </div>
        </section>

        <section className="mb-4 rounded-[30px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Quick navigation</p>
              <h2 className="mt-2 text-2xl font-black text-white">One-tap page access</h2>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {quickNavigationButtons.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.label}
                  href={item.target}
                  className={`group relative flex min-h-[86px] items-center gap-3 rounded-2xl border px-4 py-4 transition-all hover:-translate-y-0.5 hover:brightness-110 ${item.tone}`}
                >
                  <span className="rounded-xl bg-slate-950/35 p-2.5">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-bold">{item.label}</span>
                  {item.badge ? (
                    <span className="ml-auto rounded-full border border-white/20 bg-white/10 px-2 py-1 text-[11px] font-black">
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="ml-auto h-4 w-4 opacity-70 transition group-hover:translate-x-0.5" />
                  )}
                </a>
              )
            })}
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
          <section className="space-y-4 xl:space-y-5">
            <motion.div
              id="responder-alerts"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[30px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-red-300">Real-time alerts</p>
                  <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Emergency alerts feed</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100">
                  <SignalHigh className="h-4 w-4" />
                  Live stream
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
                <div className="space-y-3">
                  {liveAlerts.map((alert) => {
                    const Icon = alert.icon
                    const active = selectedAlert.id === alert.id
                    return (
                      <button
                        key={alert.id}
                        type="button"
                        onClick={() => setSelectedAlert(alert)}
                        className={`w-full rounded-3xl border p-4 text-left transition-all ${active ? 'border-cyan-400/40 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]' : 'border-white/10 bg-slate-950/40 hover:border-white/20 hover:bg-white/5'}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`rounded-2xl border px-3 py-3 ${severityStyles[alert.severity] || severityStyles.Medium}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-white">{alert.title}</p>
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-300">
                                {alert.type}
                              </span>
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">
                                {alert.severity}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-300">{alert.location} ÔÇó ETA {alert.eta} ÔÇó {alert.status}</p>
                          </div>
                          <ChevronRight className={`mt-1 h-5 w-5 ${active ? 'text-cyan-200' : 'text-slate-500'}`} />
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="rounded-[28px] border border-white/10 bg-slate-950/60 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Selected incident</p>
                      <h3 className="mt-1 text-xl font-black text-white">{selectedAlert.title}</h3>
                    </div>
                    <div className={`rounded-full border px-3 py-1 text-xs font-bold ${severityStyles[selectedAlert.severity] || severityStyles.Medium}`}>
                      {selectedAlert.severity}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <DetailChip icon={MapPin} label="Location" value={selectedAlert.location} />
                    <DetailChip icon={Clock3} label="ETA" value={selectedAlert.eta} />
                    <DetailChip icon={Radar} label="Status" value={selectedAlert.status} />
                    <DetailChip icon={CalendarClock} label="Mission ID" value={selectedAlert.id} />
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    {quickActions.map((action) => {
                      const Icon = action.icon
                      return (
                        <button key={action.label} type="button" className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-white transition hover:border-cyan-400/30 hover:bg-cyan-400/10">
                          <Icon className="h-4 w-4 text-cyan-200" />
                          {action.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid gap-6 lg:grid-cols-2" id="responder-incidents">
              <Panel title="Nearby incidents" subtitle="Critical, high, medium, and low severity incidents in your response zone" icon={MapPin}>
                <div className="space-y-3">
                  {[
                    { type: 'Fire', place: 'Nairobi CBD', severity: 'Critical', time: '2 min ago' },
                    { type: 'Medical', place: 'Kilimani', severity: 'High', time: '8 min ago' },
                    { type: 'Flood', place: 'Eastlands', severity: 'Medium', time: '18 min ago' },
                    { type: 'Missing Person', place: 'South C', severity: 'Low', time: '34 min ago' },
                  ].map((item) => (
                    <div key={`${item.type}-${item.place}`} className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-white">{item.type}</p>
                          <p className="mt-1 text-sm text-slate-300">{item.place}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${severityStyles[item.severity] || severityStyles.Medium}`}>{item.severity}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                        <span>{item.time}</span>
                        <button type="button" className="inline-flex items-center gap-1 font-semibold text-cyan-200">
                          Accept mission <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Live response status" subtitle="Keep eyes on what is happening right now" icon={Activity} id="responder-status">
                <div className="space-y-3">
                  {activeMissions.map((mission) => (
                    <div key={mission.label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{mission.label}</p>
                          <p className="mt-1 font-bold text-white">{mission.title}</p>
                          <p className="mt-1 text-sm text-slate-300">Team: {mission.team}</p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">{mission.progress}%</span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                        <div className={`h-full rounded-full bg-gradient-to-r ${mission.color}`} style={{ width: `${mission.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <Panel title="Interactive map and incident heatmap" subtitle="Command visibility across the city" icon={Globe} id="responder-map">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
                <div className="relative min-h-[320px] overflow-hidden rounded-[26px] border border-white/10 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_24%),radial-gradient(circle_at_70%_30%,rgba(239,68,68,0.2),transparent_24%),linear-gradient(135deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))]">
                  <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                  <div className="absolute inset-y-0 left-1/3 w-px bg-white/10" />
                  <div className="absolute inset-y-0 right-1/3 w-px bg-white/10" />
                  {heatmapPoints.map((point, index) => (
                    <motion.div
                      key={index}
                      className={`absolute rounded-full ${point.tone} shadow-[0_0_40px_rgba(255,255,255,0.08)]`}
                      style={{ top: point.top, left: point.left, width: `${point.size * 36}px`, height: `${point.size * 36}px`, transform: 'translate(-50%, -50%)' }}
                      animate={{ scale: [1, 1.15, 1], opacity: [0.55, 1, 0.55] }}
                      transition={{ duration: 3 + index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  ))}
                  <div className="absolute left-5 top-5 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-200 backdrop-blur-xl">
                    Live city map
                  </div>
                  <div className="absolute bottom-5 right-5 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs font-semibold text-slate-200 backdrop-blur-xl">
                    Drone feed ÔÇó GPS locked
                  </div>
                </div>

                <div className="space-y-4">
                  <MiniCard icon={Wind} title="AI emergency prediction" text="Risk spikes detected around high-traffic corridors. Patrol teams have been pre-alerted." />
                  <MiniCard icon={CloudLightning} title="Live weather alerts" text="Heavy rain is expected in 35 minutes. Flood-prone zones are highlighted in orange." />
                  <MiniCard icon={Cpu} title="Offline emergency mode" text="Local command queue is ready if connectivity degrades." />
                  <MiniCard icon={Siren} title="SOS signal monitor" text="Panic signals are being tracked and clustered in real time." />
                </div>
              </div>
            </Panel>
          </section>

          <aside className="grid gap-4 xl:grid-cols-2 xl:items-start">
            <Panel className="xl:col-span-2" title="Recent activity timeline" subtitle="Incident updates and team events" icon={Clock3}>
              <div className="space-y-3">
                {recentActivityTimeline.map((item) => (
                  <div key={`${item.time}-${item.title}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-sm font-bold ${item.tone}`}>{item.title}</p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">{item.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="xl:col-span-2" title="Dispatch & coordination" subtitle="Assign units and control response lanes" icon={LayoutGrid} id="responder-dispatch">
              <div className="space-y-3">
                {[
                  { name: 'Ambulance Unit 12', status: 'Available', tone: 'text-emerald-200' },
                  { name: 'Fire Engine 4', status: 'En route', tone: 'text-cyan-200' },
                  { name: 'Police Patrol 7', status: 'Holding perimeter', tone: 'text-amber-200' },
                  { name: 'Rescue Drone 2', status: 'Launching', tone: 'text-orange-200' },
                ].map((unit) => (
                  <div key={unit.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                    <div>
                      <p className="font-bold text-white">{unit.name}</p>
                      <p className={`text-sm ${unit.tone}`}>{unit.status}</p>
                    </div>
                    <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white">
                      Assign
                    </button>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="xl:col-span-2" title="Emergency communication" subtitle="Secure responder chat and voice channels" icon={MessageSquare} id="responder-comms">
              <div className="space-y-3">
                {comms.map((message, index) => (
                  <div key={`${message.from}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{message.from}</p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-300">Secure</span>
                    </div>
                    <p className={`mt-2 text-sm leading-6 ${message.tone}`}>{message.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
                  <PhoneCall className="h-4 w-4 text-cyan-200" /> Voice call
                </button>
                <button type="button" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
                  <Video className="h-4 w-4 text-cyan-200" /> Video link
                </button>
              </div>

              <AnimatePresence>
                {messagesOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-cyan-100">AI responder assistant</p>
                        <p className="mt-1 text-sm text-cyan-50">Suggested next action: establish perimeter, confirm victim count, and request backup ladder.</p>
                      </div>
                      <button type="button" onClick={() => setMessagesOpen(false)} className="rounded-full p-2 text-cyan-100 hover:bg-white/10">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Panel>

            <Panel title="Reports & analytics" subtitle="Operational performance overview" icon={Star} id="responder-analytics">
              <div className="space-y-4">
                {analytics.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="font-bold text-white">{item.value}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-red-500" style={{ width: item.width }} />
                    </div>
                  </div>
                ))}
              </div>
              <button type="button" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white">
                Export reports <ArrowRight className="h-4 w-4" />
              </button>
            </Panel>

            <Panel title="Responder profile" subtitle="Personal readiness and credentials" icon={ShieldCheck} id="responder-profile">
              <div className="rounded-[24px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-2xl font-black text-white">
                    {String(responderName).slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Badge number</p>
                    <p className="mt-1 text-lg font-black text-white">RD-2048</p>
                    <p className="mt-2 text-sm text-slate-300">{responderName}</p>
                    <p className="text-xs text-cyan-200">{responderRole} ÔÇó Medic / Rescue specialization</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Metric label="Completed missions" value="128" />
                  <Metric label="Team membership" value="Delta-3" />
                  <Metric label="Certifications" value="6" />
                  <Metric label="Availability" value={online ? 'Ready' : 'Offline'} />
                </div>
              </div>
            </Panel>

            <Panel title="Residents" subtitle="Resident coordination and welfare checks" icon={Users} id="responder-residents">
              <div className="space-y-3">
                {residentDirectory.map((item) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                    <div>
                      <p className="font-bold text-white">{item.name}</p>
                      <p className={`text-sm ${item.tone}`}>{item.status}</p>
                    </div>
                    <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white">
                      Open
                    </button>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Announcements" subtitle="Operational updates and advisories" icon={Bell} id="responder-announcements">
              <div className="space-y-3">
                {responderAnnouncements.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-4">
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Resources" subtitle="Responder references and playbooks" icon={ShieldCheck} id="responder-resources">
              <div className="grid gap-3 sm:grid-cols-2">
                {responderResources.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-4">
                    <p className="font-bold text-white">{item}</p>
                    <p className="mt-1 text-sm text-slate-300">Fast access reference for field operations.</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel className="xl:col-span-2" title="Settings & security" subtitle="Responder controls and compliance" icon={ShieldCheck} id="responder-settings">
              <div className="space-y-3">
                {[
                  'Two-factor authentication',
                  'Notification preferences',
                  'Emergency sound controls',
                  'Device management',
                  'Privacy settings',
                  'Dark / light mode',
                  'Language settings',
                ].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                    <span className="text-sm font-medium text-slate-200">{item}</span>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </Panel>
          </aside>
        </div>
      </main>
    </div>
  )
}

function Panel({ title, subtitle, icon: Icon, children, id, className = '' }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-[30px] border border-white/10 bg-white/5 p-4 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-6 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{subtitle}</p>
          <h2 className="mt-2 text-2xl font-black text-white">{title}</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  )
}

function DetailChip({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-slate-400">
        <Icon className="h-4 w-4 text-cyan-200" />
        {label}
      </div>
      <p className="mt-2 text-sm font-bold text-white">{value}</p>
    </div>
  )
}

function MiniCard({ icon: Icon, title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-bold text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-bold text-white">{value}</p>
    </div>
  )
}

function StatusMiniCard({ label, value, tone = 'text-slate-200' }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">{label}</p>
      <p className={`mt-2 text-sm font-bold ${tone}`}>{value}</p>
    </div>
  )
}
