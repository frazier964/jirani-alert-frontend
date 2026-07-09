import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Bell, ChevronRight, Search, ShieldCheck } from 'lucide-react'
import ResponderCommandBar from '../../components/Layout/ResponderCommandBar'
import { normalizeIncident, severityStyles, statusStyles } from './responderUtils'

export function ResponderShell({ children }) {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <ResponderCommandBar />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_88%_8%,rgba(239,68,68,0.12),transparent_20%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  )
}

export function PageHeader({ eyebrow = 'Responder workspace', title, description, icon: Icon = ShieldCheck, actions = null }) {
  return (
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="rounded-[30px] border border-white/10 bg-white/6 p-5 shadow-[0_24px_80px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-100">
            <Icon className="h-4 w-4" />
            {eyebrow}
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-normal text-white sm:text-4xl">{title}</h1>
          {description ? <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </motion.section>
  )
}

export function SectionCard({ title, subtitle, icon: Icon = ShieldCheck, children, className = '' }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`rounded-[26px] border border-white/10 bg-white/6 p-4 shadow-[0_18px_60px_rgba(2,6,23,0.28)] backdrop-blur-xl sm:p-5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">{subtitle}</p>
          <h2 className="mt-2 text-xl font-black tracking-normal text-white">{title}</h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 text-cyan-200">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </motion.section>
  )
}

export function StatCard({ label, value, detail, icon: Icon = ShieldCheck, tone = 'text-cyan-200' }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-black text-white">{value}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <Icon className={`h-5 w-5 ${tone}`} />
        </div>
      </div>
      {detail ? <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p> : null}
    </div>
  )
}

export function StatusBadge({ value, type = 'status' }) {
  const styles = type === 'severity' ? severityStyles : statusStyles
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${styles[value] || styles.Medium || styles.Pending}`}>{value}</span>
}

export function SearchBar({ value, onChange, placeholder = 'Search incidents, residents, or reports' }) {
  return (
    <label className="relative block">
      <span className="sr-only">Search</span>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/55 pl-11 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/15" />
    </label>
  )
}

export function FilterBar({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => onChange(option)} className={`rounded-full border px-3 py-2 text-xs font-bold transition ${value === option ? 'border-red-400/40 bg-red-500/15 text-red-100' : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'}`}>
          {option}
        </button>
      ))}
    </div>
  )
}

export function LoadingState({ label = 'Loading responder data...' }) {
  return <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 text-sm font-semibold text-slate-300">{label}</div>
}

export function EmptyState({ title = 'No records found', detail = 'New responder data will appear here as incidents are created.' }) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/15 bg-slate-950/35 p-6 text-center">
      <AlertTriangle className="mx-auto h-8 w-8 text-slate-500" />
      <p className="mt-3 text-lg font-black text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
    </div>
  )
}

export function IncidentCard({ incident, onAccept, onReject, actionLabel = 'Open details' }) {
  const item = normalizeIncident(incident)
  return (
    <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-4 transition hover:border-cyan-300/30 hover:bg-slate-900/70">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <StatusBadge value={item.severity} type="severity" />
            <StatusBadge value={item.status} />
          </div>
          <h3 className="mt-3 text-lg font-black text-white">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
        </div>
        <div className="grid min-w-[150px] grid-cols-2 gap-2 text-xs text-slate-300 sm:text-right">
          <span className="rounded-xl bg-white/5 px-3 py-2">ETA {item.eta}</span>
          <span className="rounded-xl bg-white/5 px-3 py-2">{item.distance}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-400">
          <span className="font-semibold text-slate-200">{item.location}</span>
          <span className="mx-2 text-slate-600">/</span>
          <span>{item.createdLabel}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {onReject ? <button type="button" onClick={() => onReject(item)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200 transition hover:bg-white/10">Reject</button> : null}
          {onAccept ? <button type="button" onClick={() => onAccept(item)} className="rounded-full border border-red-400/35 bg-red-500/15 px-3 py-2 text-xs font-bold text-red-100 transition hover:bg-red-500/25">Accept</button> : null}
          <Link to={`/responder/incidents/${encodeURIComponent(item.id)}`} className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-100 transition hover:bg-cyan-500/20">
            {actionLabel}
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function NotificationCard({ item }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 p-2 text-cyan-100">
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <p className="font-bold text-white">{item.title || 'Responder notification'}</p>
          <p className="mt-1 text-sm leading-6 text-slate-300">{item.message || item.detail || 'Operational update received.'}</p>
        </div>
      </div>
    </div>
  )
}
