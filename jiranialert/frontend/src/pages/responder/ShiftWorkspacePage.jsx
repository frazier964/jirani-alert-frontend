import { useEffect, useState } from 'react'
import { CalendarClock, Check, Circle, Save } from 'lucide-react'
import { auth } from '../../lib/firebase'
import { listTeamMembers, updateAvailability, updateResponderProfile } from '../../lib/responderWorkspaceApi'
import { ResponderShell } from './ResponderComponents'

export default function ShiftWorkspacePage() {
  const [profile, setProfile] = useState({ availability: 'Online', shiftStatus: 'Online', handoverNote: '' })
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const response = await listTeamMembers()
      const current = (response.members || []).find((member) => member.id === auth.currentUser?.uid)
      if (current) {
        setProfile(current)
        setNote(current.handoverNote || '')
      }
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load shift status')
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

  const setStatus = async (status) => {
    setBusy(true)
    try {
      const response = await updateAvailability(status)
      setProfile((current) => ({ ...current, ...response.member, shiftStatus: status }))
      setNotice(`Shift status saved as ${status}.`)
      setError('')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to update shift status')
    } finally {
      setBusy(false)
    }
  }

  const saveNote = async (event) => {
    event.preventDefault()
    setBusy(true)
    try {
      await updateResponderProfile({ handoverNote: note })
      setNotice('Handover note saved.')
      setError('')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to save handover note')
    } finally {
      setBusy(false)
    }
  }

  const currentStatus = profile.shiftStatus || profile.availability || 'Offline'
  return <ResponderShell><div className="grid gap-5">
    <header className="border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.2em] text-red-600">Responder Workspace</p><h1 className="mt-3 text-3xl font-black text-slate-900">Shift Management</h1><p className="mt-2 text-slate-600">Live availability and handover information for the response team.</p></div><CalendarClock className="h-10 w-10 text-red-500" /></div></header>
    {notice ? <div className="border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><Check className="mr-2 inline h-4 w-4" />{notice}</div> : null}{error ? <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</div> : null}
    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><section className="border border-slate-200 bg-white p-6 shadow-sm"><p className="text-xs font-black uppercase tracking-wide text-red-600">Current shift</p><h2 className="mt-3 text-3xl font-black text-slate-900">08:00 AM - 04:00 PM</h2><div className="mt-6 grid gap-4 sm:grid-cols-3"><div><p className="text-xs font-bold uppercase text-slate-500">Status</p><p className="mt-2 flex items-center gap-2 font-black text-slate-900"><Circle className={`h-3 w-3 fill-current ${currentStatus === 'Online' ? 'text-emerald-500' : currentStatus === 'Busy' ? 'text-amber-500' : 'text-slate-400'}`} />{currentStatus}</p></div><div><p className="text-xs font-bold uppercase text-slate-500">Time remaining</p><p className="mt-2 font-black text-slate-900">Live shift</p></div><div><p className="text-xs font-bold uppercase text-slate-500">Assigned area</p><p className="mt-2 font-black text-slate-900">{profile.area || 'Kilimani'}</p></div></div><div className="mt-6 flex flex-wrap gap-2">{['Online', 'Busy', 'Offline'].map((status) => <button key={status} type="button" disabled={busy} onClick={() => setStatus(status)} className={`inline-flex items-center gap-2 border px-4 py-2.5 text-sm font-bold ${currentStatus === status ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-700 hover:border-slate-500'}`}><Circle className="h-3 w-3 fill-current" />Set {status}</button>)}</div></section><section className="border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-slate-900">Handover notes</h2><p className="mt-2 text-sm leading-6 text-slate-600">Save notes for the next responder. Notes persist to your responder profile.</p><form onSubmit={saveNote}><textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-5 min-h-36 w-full border border-slate-200 p-3 text-sm text-slate-800 outline-none focus:border-red-400" placeholder="Add shift note..." /><button type="submit" disabled={busy} className="mt-3 inline-flex items-center gap-2 bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"><Save className="h-4 w-4" />Save handover</button></form></section></div>
  </div></ResponderShell>
}
