import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, Clock3, MapPin, ShieldAlert } from 'lucide-react'
import reportApi from '../../lib/reportApi'

export default function GuestReportTracking() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    reportApi.getReport(id)
      .then((data) => active && setReport(data.report))
      .catch((err) => {
        console.error('Could not load emergency report:', err)
        if (active) setError('This report is unavailable in this browser session.')
      })
    return () => { active = false }
  }, [id])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-14">
      <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600"><CheckCircle2 /></div>
          <div><p className="text-sm font-semibold text-emerald-700">Emergency alert received</p><h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Track your report</h1></div>
        </div>
        {error ? <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{error}</p> : !report ? <p className="mt-6 text-slate-600">Loading your report…</p> : (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Report ID</p><p className="mt-1 font-bold text-slate-900">JA-{report.id.slice(-8).toUpperCase()}</p></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info icon={ShieldAlert} label="Emergency" value={report.type} />
              <Info icon={Clock3} label="Status" value={report.status || 'Pending'} />
              <Info icon={MapPin} label="Location" value={report.location} wide />
            </div>
          </div>
        )}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link to="/report-emergency" className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-center font-bold text-white">Report another emergency</Link>
          <Link to="/" className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-center font-bold text-slate-700">Return home</Link>
        </div>
      </section>
    </main>
  )
}

function Info({ icon: Icon, label, value, wide = false }) {
  return <div className={`rounded-2xl border border-slate-200 p-4 ${wide ? 'sm:col-span-2' : ''}`}><Icon className="h-4 w-4 text-blue-600" /><p className="mt-2 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 break-words font-semibold text-slate-900">{value}</p></div>
}
