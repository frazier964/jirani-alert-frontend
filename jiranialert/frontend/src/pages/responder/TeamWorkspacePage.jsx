import { useEffect, useMemo, useState } from 'react'
import { Check, ChevronRight, Circle, Search, ShieldCheck, User } from 'lucide-react'
import { listTeamMembers, updateAvailability } from '../../lib/responderWorkspaceApi'
import { ResponderShell } from './ResponderComponents'

const statuses = ['All', 'Online', 'Busy', 'Offline']
const tone = (value) => value === 'Online' ? 'bg-emerald-50 text-emerald-700' : value === 'Busy' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'

export default function TeamWorkspacePage() {
  const [members, setMembers] = useState([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const response = await listTeamMembers()
      setMembers(response.members || [])
      setError('')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load response team')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(load, 0)
    const timer = window.setInterval(load, 5000)
    return () => {
      window.clearTimeout(initialLoad)
      window.clearInterval(timer)
    }
  }, [])

  const visible = useMemo(() => members.filter((member) => {
    const text = `${member.displayName || member.fullName || member.name} ${member.specialty || member.role} ${member.assignment} ${member.area}`.toLowerCase()
    return (status === 'All' || member.availability === status) && text.includes(query.toLowerCase())
  }), [members, query, status])

  const changeMyStatus = async (availability) => {
    setBusy(true)
    try {
      const response = await updateAvailability(availability)
      setMembers((current) => current.map((member) => member.id === response.member.id ? { ...member, ...response.member } : member))
      if (!members.some((member) => member.id === response.member.id)) setMembers((current) => [...current, response.member])
      setError('')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to update your availability')
    } finally {
      setBusy(false)
    }
  }

  return <ResponderShell><div className="grid gap-5">
    <header className="border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-xs font-black uppercase tracking-[.2em] text-red-600">Responder Workspace</p><h1 className="mt-3 text-3xl font-black text-slate-900">Response Team</h1><p className="mt-2 text-slate-600">Live availability, assignments, and operational ownership.</p></div><ShieldCheck className="h-10 w-10 text-red-500" /></div><div className="mt-6 flex flex-wrap items-center gap-2"><span className="mr-2 text-xs font-bold uppercase tracking-wide text-slate-500">Set my status</span>{['Online', 'Busy', 'Offline'].map((value) => <button key={value} type="button" disabled={busy} onClick={() => changeMyStatus(value)} className={`inline-flex items-center gap-2 border px-3 py-2 text-sm font-bold ${tone(value)} hover:brightness-95`}><Circle className="h-3 w-3 fill-current" />{value}</button>)}</div></header>
    <section className="border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 md:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search responders, roles, areas" className="w-full border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-red-400" /></label><select value={status} onChange={(event) => setStatus(event.target.value)} className="border border-slate-200 bg-white px-3 py-2 text-sm"><option>All</option>{statuses.slice(1).map((value) => <option key={value}>{value}</option>)}</select></div>{error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}<div className="mt-4 overflow-x-auto"><table className="min-w-[820px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Responder</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Availability</th><th className="px-4 py-3">Current assignment</th><th className="px-4 py-3">Area</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{loading ? <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">Loading team...</td></tr> : visible.length ? visible.map((member) => <tr key={member.id} className="border-t border-slate-100"><td className="px-4 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"><User className="h-4 w-4" /></span><div><p className="font-bold text-slate-800">{member.displayName || member.fullName || member.name || member.email}</p><p className="text-xs text-slate-500">{member.email || member.id}</p></div></div></td><td className="px-4 py-4 text-slate-600">{member.specialty || member.role || 'Responder'}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone(member.availability)}`}>{member.availability || 'Offline'}</span></td><td className="px-4 py-4 text-slate-600">{member.assignment || 'Available for dispatch'}</td><td className="px-4 py-4 text-slate-600">{member.area || 'Command center'}</td><td className="px-4 py-4"><button type="button" onClick={() => setSelected(member)} className="inline-flex items-center gap-1 font-bold text-blue-700">Details <ChevronRight className="h-4 w-4" /></button></td></tr>) : <tr><td colSpan="6" className="px-4 py-8 text-center text-slate-500">No responders match this search.</td></tr>}</tbody></table></div></section>
    {selected ? <section className="border border-blue-200 bg-blue-50 p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wide text-blue-700">Responder details</p><h2 className="mt-2 text-xl font-black text-slate-900">{selected.displayName || selected.fullName || selected.name}</h2><p className="mt-1 text-sm text-slate-600">{selected.specialty || selected.role} · {selected.area || 'Command center'}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Close details"><Check className="h-5 w-5 text-blue-700" /></button></div><p className="mt-4 text-sm text-slate-700">Current assignment: <strong>{selected.assignment || 'Available for dispatch'}</strong></p></section> : null}
  </div></ResponderShell>
}
