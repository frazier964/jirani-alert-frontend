import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  MapPin,
  Clock3,
  ChevronRight,
  Flame,
  HeartPulse,
  ShieldAlert,
  Car,
  AlertTriangle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react'

const reportsSeed = [
  {
    id: 'r-1',
    title: 'Fire incident reported near South B Estate',
    type: 'Fire',
    location: 'South B Estate, Nairobi',
    date: '2025-05-07',
    time: '14:32',
    status: 'Resolved',
    severity: 'Critical',
    icon: Flame,
    description: 'Smoke reported from building complex. Authorities notified and incident resolved.',
  },
  {
    id: 'r-2',
    title: 'Medical emergency at Kilimani Roundabout',
    type: 'Medical',
    location: 'Kilimani Roundabout, Nairobi',
    date: '2025-05-06',
    time: '09:15',
    status: 'Resolved',
    severity: 'High',
    icon: HeartPulse,
    description: 'Resident required urgent assistance. Ambulance dispatched and situation stabilized.',
  },
  {
    id: 'r-3',
    title: 'Suspicious vehicle at Gate 2',
    type: 'Crime',
    location: 'Estate Gate 2',
    date: '2025-05-05',
    time: '22:48',
    status: 'Under Review',
    severity: 'Medium',
    icon: ShieldAlert,
    description: 'Unusual vehicle activity reported. Security team investigating the incident.',
  },
  {
    id: 'r-4',
    title: 'Road accident near main entrance',
    type: 'Accident',
    location: 'Main Entrance, Estate',
    date: '2025-05-04',
    time: '16:22',
    status: 'Pending',
    severity: 'High',
    icon: Car,
    description: 'Vehicle collision reported. Responders en route to the scene.',
  },
  {
    id: 'r-5',
    title: 'Hazard reported in common area',
    type: 'Other',
    location: 'Community Hall',
    date: '2025-05-03',
    time: '11:45',
    status: 'Resolved',
    severity: 'Medium',
    icon: AlertTriangle,
    description: 'Structural hazard identified and maintenance team alerted.',
  },
]

const tabs = ['All', 'Pending', 'Under Review', 'Resolved']

function statusTone(status) {
  if (status === 'Resolved') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (status === 'Under Review') return 'bg-amber-100 text-amber-700 border-amber-200'
  return 'bg-blue-100 text-blue-700 border-blue-200'
}

function severityTone(severity) {
  if (severity === 'Critical') return 'bg-red-100 text-red-700 border-red-200'
  if (severity === 'High') return 'bg-orange-100 text-orange-700 border-orange-200'
  return 'bg-amber-100 text-amber-700 border-amber-200'
}

function statusIcon(status) {
  if (status === 'Resolved') return <CheckCircle2 className="h-4 w-4" />
  if (status === 'Under Review') return <Clock className="h-4 w-4" />
  return <AlertCircle className="h-4 w-4" />
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [reports, setReports] = useState(reportsSeed)
  const navigate = useNavigate()

  const filteredReports = useMemo(() => {
    return reports.filter((item) => {
      const matchesTab = activeTab === 'All' || item.status === activeTab
      const haystack = `${item.title} ${item.location} ${item.type} ${item.description}`.toLowerCase()
      const matchesSearch = haystack.includes(searchQuery.toLowerCase())
      return matchesTab && matchesSearch
    })
  }, [activeTab, reports, searchQuery])

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === 'Pending').length,
    underReview: reports.filter((r) => r.status === 'Under Review').length,
    resolved: reports.filter((r) => r.status === 'Resolved').length,
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="space-y-4">
          {/* Header Section */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-r from-[#1E3A5F] via-[#2563EB] to-[#0f172a] p-5 text-white shadow-[0_30px_80px_rgba(15,23,42,0.24)] sm:p-6"
          >
            <motion.div
              className="absolute right-6 top-6 h-28 w-28 rounded-full bg-white/10 blur-3xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.6, 0.25] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]">
                  <Sparkles className="h-4 w-4" />
                  My reports
                </div>
                <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Your Submitted Reports</h1>
                <p className="mt-3 text-lg text-blue-100">Track the status of all your emergency reports and submissions.</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:w-full lg:max-w-2xl">
                <div className="rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Total</p>
                  <p className="mt-2 text-2xl font-black">{stats.total}</p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Pending</p>
                  <p className="mt-2 text-2xl font-black text-blue-300">{stats.pending}</p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Under Review</p>
                  <p className="mt-2 text-2xl font-black text-amber-300">{stats.underReview}</p>
                </div>
                <div className="rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/70">Resolved</p>
                  <p className="mt-2 text-2xl font-black text-emerald-300">{stats.resolved}</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Search and Filter Section */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-[26px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#E53935]">Search & filter</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">Find Your Reports</h2>
              </div>
              <Filter className="h-5 w-5 text-[#2563EB] shrink-0" />
            </div>

            <div className="mt-4 flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, location, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold transition-all ${activeTab === tab ? 'border-[#2563EB] bg-blue-50 text-[#2563EB]' : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </motion.section>

          {/* Reports List */}
          <div className="space-y-3">
            {filteredReports.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[26px] border border-white/80 bg-white/90 p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-10"
              >
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-100 text-slate-500">
                  <FileText className="h-9 w-9" />
                </div>
                <h2 className="mt-5 text-3xl font-black text-slate-900">No reports found</h2>
                <p className="mt-3 text-slate-500">Try adjusting your search or filter to find what you're looking for.</p>
              </motion.div>
            ) : (
              filteredReports.map((report, index) => {
                const Icon = report.icon
                return (
                  <motion.article
                    key={report.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className="rounded-[26px] border border-white/80 bg-white/90 p-4 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-5 hover:shadow-[0_24px_80px_rgba(15,23,42,0.12)] transition-all"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[#2563EB]">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white">
                              {report.type}
                            </span>
                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusTone(report.status)}`}>
                              {report.status}
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-slate-900 line-clamp-1">{report.title}</h3>
                          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{report.description}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {report.location}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {report.date} at {report.time}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${severityTone(report.severity)}`}>
                          {report.severity}
                        </span>
                        <button
                          type="button"
                          onClick={() => navigate(`/alerts/${report.id}`)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          View Details
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </motion.article>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
