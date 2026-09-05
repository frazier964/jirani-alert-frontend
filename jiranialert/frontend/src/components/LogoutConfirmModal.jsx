import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, X } from 'lucide-react'

export default function LogoutConfirmModal({ open, onCancel, onConfirm, busy = false }) {
  return <AnimatePresence>
    {open ? <motion.div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onCancel() }}>
      <motion.section initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }} transition={{ duration: 0.18 }} className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="logout-title">
        <button type="button" onClick={onCancel} disabled={busy} className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close logout confirmation"><X className="h-5 w-5" /></button>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-700"><LogOut className="h-6 w-6" /></div>
        <h2 id="logout-title" className="mt-5 text-2xl font-black text-slate-900">Log Out?</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Are you sure you want to log out of your Jirani Alert account?</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={onCancel} disabled={busy} className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">Cancel</button><button type="button" onClick={onConfirm} disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-60">{busy ? 'Logging out...' : 'Log Out'}<LogOut className="h-4 w-4" /></button></div>
      </motion.section>
    </motion.div> : null}
  </AnimatePresence>
}
