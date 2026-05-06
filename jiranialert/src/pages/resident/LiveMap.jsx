import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  Slash,
  RefreshCw,
  Maximize2,
  AlertTriangle,
  Flame,
  HeartPulse,
  ShieldAlert,
  Navigation2,
  Square,
  Star,
  ChevronDown,
  Zap,
  ExternalLink,
  Map,
} from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'

const mockAlerts = [
  {
    id: 'a1',
    type: 'Fire',
    title: 'Smoke reported near Skyline Apartments',
    location: 'Westlands, Nairobi',
    time: '2m',
    severity: 'Critical',
    status: 'Active',
    coords: { x: 62, y: 28 },
    reporter: 'Resident',
    description: 'Smoke and flames visible from the rooftop. Evacuate nearby buildings.',
  },
  {
    id: 'a2',
    type: 'Medical',
    title: 'Medical emergency at Kilimani Roundabout',
    location: 'Kilimani',
    time: '9m',
    severity: 'High',
    status: 'Responding',
    coords: { x: 44, y: 55 },
    reporter: 'Authority',
    description: 'Person unconscious. Paramedics en route.',
  },
  {
    id: 'a3',
    type: 'Accident',
    title: 'Road accident near Ngong Road',
    location: 'Ngong Road',
    time: '32m',
    severity: 'Moderate',
    status: 'Active',
    coords: { x: 28, y: 40 },
    reporter: 'Resident',
    description: 'Two-vehicle collision blocking the left lane.',
  },
]

const sidebarItems = [
  { label: 'Dashboard', to: '/resident/dashboard' },
  { label: 'Report Emergency', to: '/report' },
  { label: 'Nearby Alerts', to: '/resident/map' },
  { label: 'Community Feed', to: '/resident/notifications' },
  { label: 'Messages', to: '/resident/notifications' },
  { label: 'My Reports', to: '/resident/notifications' },
  { label: 'Safety Tips', to: '/resident/contacts' },
  { label: 'Settings', to: '/resident/profile' },
]

export default function LiveMap() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [filterTypes, setFilterTypes] = useState({ Fire: true, Medical: true, Accident: true })
  const [severityFilter, setSeverityFilter] = useState('All')
  const [distance, setDistance] = useState(5000)
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    // simulate live updates
    const t = setInterval(() => {
      // minor pulse: toggle a fake resolved alert after some time (demo only)
      setAlerts((cur) => cur)
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const summary = useMemo(() => {
    const active = alerts.filter((a) => a.status === 'Active').length
    const critical = alerts.filter((a) => a.severity === 'Critical').length
    const resolved = alerts.filter((a) => a.status === 'Resolved').length
    const level = critical > 0 ? 'High Risk' : active > 2 ? 'Moderate' : 'Safe'
    return { active, critical, resolved, level }
  }, [alerts])

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (query && !`${a.title} ${a.location} ${a.id}`.toLowerCase().includes(query.toLowerCase())) return false
      if (!filterTypes[a.type] && a.type in filterTypes) return false
      if (severityFilter !== 'All' && a.severity !== severityFilter) return false
      return true
    })
  }, [alerts, query, filterTypes, severityFilter])

  function refresh() {
    // placeholder: in real app fetch latest alerts
    setAlerts((s) => [...s])
  }

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-slate-900 ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="mx-auto grid max-w-[1700px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)_360px] lg:px-8 lg:py-8">
        <aside className="hidden lg:block">
          <div className="sticky top-28 rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
            <div className="rounded-[22px] bg-gradient-to-br from-[#1E3A5F] to-[#2563EB] p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">Nearby Alerts</p>
                  <h2 className="mt-2 text-2xl font-black">Live Map</h2>
                </div>
                <Map className="h-10 w-10 text-white/80" />
              </div>
              <p className="mt-3 text-sm text-white/85">Track incidents and safety alerts around your area.</p>
            </div>

            <nav className="mt-4 space-y-1">
              {sidebarItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${isActive ? 'bg-[#E53935] text-white shadow-[0_14px_30px_rgba(229,57,53,0.22)]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`
                  }
                >
                  <Square className="h-4 w-4 text-slate-500" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-700">Quick actions</p>
              <div className="mt-3 flex flex-col gap-2">
                <button onClick={refresh} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:shadow">
                  <RefreshCw className="h-4 w-4 text-slate-700" /> Refresh Alerts
                </button>
                <button onClick={() => setFullscreen((f) => !f)} className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold shadow-sm hover:shadow">
                  <Maximize2 className="h-4 w-4 text-slate-700" /> Toggle Map Fullscreen
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-6 pb-24 lg:pb-0">
          <section className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black">Nearby Alerts</h1>
              <p className="mt-1 text-sm text-slate-600">Track emergency incidents and safety alerts happening around your location in real time.</p>
              <p className="mt-2 text-sm text-slate-500">📍 Current Area: <strong>Westlands, Nairobi</strong></p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 sm:flex">
                <Search className="h-4 w-4 text-slate-400" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search location, type, or report ID" className="ml-2 w-64 bg-transparent text-sm outline-none" />
                {query ? <button onClick={() => setQuery('')} className="text-slate-400"><Slash className="h-4 w-4" /></button> : null}
              </div>
              <button onClick={refresh} className="inline-flex items-center gap-2 rounded-2xl bg-[#E53935] px-4 py-2 text-sm font-semibold text-white shadow-sm">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Active Alerts</p>
              <p className="mt-2 text-2xl font-black text-[#E53935]">{summary.active}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Critical Incidents</p>
              <p className="mt-2 text-2xl font-black text-red-600">{summary.critical}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Resolved Alerts</p>
              <p className="mt-2 text-2xl font-black text-emerald-600">{summary.resolved}</p>
            </div>
            <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Community Safety Level</p>
              <p className="mt-2 text-2xl font-black text-slate-700">{summary.level}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-[0_20px_50px_rgba(2,6,23,0.06)]">
              <div className="relative h-[520px] overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-white">
                {/* faux map area - replace with a real map integration (Leaflet/Mapbox) */}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,#e6f2ff_0%,#f8fafc_100%)]" />

                {/* safe/high-risk overlay */}
                <div className="absolute left-10 top-10 w-40 h-24 rounded-xl bg-red-500/10 blur-3xl" />

                {/* markers */}
                {filtered.map((a) => (
                  <motion.button
                    key={a.id}
                    onClick={() => setSelected(a)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.06 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${a.coords.x}%`, top: `${a.coords.y}%` }}
                    title={`${a.title} — ${a.severity}`}
                  >
                    <div className={`flex items-center justify-center h-10 w-10 rounded-full ${a.severity === 'Critical' ? 'bg-red-600' : a.severity === 'High' ? 'bg-amber-500' : 'bg-emerald-500'} text-white shadow-lg animate-pulse`}></div>
                  </motion.button>
                ))}

                {/* center controls */}
                <div className="absolute right-4 bottom-4 flex flex-col gap-2">
                  <button className="rounded-full bg-white p-2 shadow-sm">
                    <ChevronDown className="h-4 w-4 text-slate-700 rotate-180" />
                  </button>
                  <button className="rounded-full bg-white p-2 shadow-sm">
                    <ChevronDown className="h-4 w-4 text-slate-700" />
                  </button>
                  <button className="rounded-full bg-white p-2 shadow-sm">
                    <Navigation2 className="h-4 w-4 text-slate-700" />
                  </button>
                </div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-700">Filters</p>
                <div className="mt-3 grid gap-2">
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={filterTypes.Fire} onChange={() => setFilterTypes((s) => ({ ...s, Fire: !s.Fire }))} />
                      <span className="text-sm">Fire</span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={filterTypes.Medical} onChange={() => setFilterTypes((s) => ({ ...s, Medical: !s.Medical }))} />
                      <span className="text-sm">Medical</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={filterTypes.Accident} onChange={() => setFilterTypes((s) => ({ ...s, Accident: !s.Accident }))} />
                      <span className="text-sm">Accident</span>
                    </label>
                  </div>

                  <div className="mt-2">
                    <label className="text-sm">Severity</label>
                    <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                      <option>All</option>
                      <option>Critical</option>
                      <option>High</option>
                      <option>Moderate</option>
                    </select>
                  </div>

                  <div className="mt-2">
                    <label className="text-sm">Distance: {Math.round(distance)}m</label>
                    <input type="range" min={500} max={20000} value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full mt-1" />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-700">Live Alerts Feed</p>
                <div className="mt-3 space-y-3 max-h-[48vh] overflow-y-auto">
                  {filtered.map((a) => (
                    <motion.article key={a.id} layout className="rounded-xl border p-3 shadow-sm hover:shadow-md">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-50 text-slate-700">
                            {a.type === 'Fire' ? <Flame className="h-5 w-5 text-red-600" /> : a.type === 'Medical' ? <HeartPulse className="h-5 w-5 text-emerald-600" /> : <ShieldAlert className="h-5 w-5 text-amber-500" />}
                          </div>
                          <div>
                            <h3 className="text-sm font-bold">{a.title}</h3>
                            <p className="text-xs text-slate-500">{a.location} • {a.time} • {a.status}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`rounded-xl px-2 py-1 text-xs font-semibold ${a.severity === 'Critical' ? 'bg-red-100 text-red-700' : a.severity === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{a.severity}</span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelected(a)} className="text-sm text-[#1E3A5F] hover:underline">View Details</button>
                            <button className="text-sm text-slate-500">Navigate</button>
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{a.description}</p>
                    </motion.article>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-center text-sm text-slate-500 py-8">
                      <Star className="mx-auto mb-3" />
                      <p className="font-bold">No Active Nearby Alerts</p>
                      <p className="mt-2">Your area is currently safe.</p>
                      <Link to="/resident/dashboard" className="mt-3 inline-block rounded-2xl bg-[#E53935] px-4 py-2 text-sm font-semibold text-white">Return to Dashboard</Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-700">Safety Recommendations</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li>⚠ Avoid Ngong Road due to traffic accident.</li>
                  <li>⚠ Increased theft reports in Kilimani tonight.</li>
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Details modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }} className="relative z-10 max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black">{selected.title}</h3>
                  <p className="text-sm text-slate-500">{selected.location} • {selected.time} • Reported by {selected.reporter}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setSelected(null)} className="text-sm text-slate-500">Close</button>
                  <button className="rounded-2xl bg-[#E53935] px-4 py-2 text-sm font-semibold text-white">Share Alert</button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-semibold">Description</p>
                  <p className="mt-2 text-sm text-slate-600">{selected.description}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-semibold">Map Preview</p>
                  <div className="mt-2 h-36 w-full rounded bg-slate-50" />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button className="rounded-2xl border px-3 py-2 text-sm">Confirm Seen</button>
                <button className="rounded-2xl bg-[#E53935] px-3 py-2 text-sm text-white">Contact Authorities</button>
                <button className="ml-auto text-sm text-slate-500">Share</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile floating action */}
      <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center justify-center sm:hidden">
        <button className="inline-flex items-center gap-2 rounded-full bg-[#E53935] px-5 py-3 text-sm font-black text-white shadow-lg">🚨 Report Alert</button>
      </div>
    </div>
  )
}
