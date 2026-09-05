import { useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const LOGOUT_NOTICE_KEY = 'jiranialert_logout_notice'

export function setLogoutNotice() {
  sessionStorage.setItem(LOGOUT_NOTICE_KEY, 'You’ve been logged out successfully. Stay safe!')
}

export default function LogoutToast() {
  const [message, setMessage] = useState('')
  const location = useLocation()

  useEffect(() => {
    const notice = sessionStorage.getItem(LOGOUT_NOTICE_KEY)
    if (!notice) return undefined
    sessionStorage.removeItem(LOGOUT_NOTICE_KEY)
    const timer = window.setTimeout(() => setMessage(notice), 0)
    const dismiss = window.setTimeout(() => setMessage(''), 5500)
    return () => {
      window.clearTimeout(timer)
      window.clearTimeout(dismiss)
    }
  }, [location.pathname, location.search])

  if (!message) return null
  return <div className="fixed bottom-5 left-1/2 z-[130] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-800 shadow-2xl" role="status"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /><span className="flex-1">{message}</span><button type="button" onClick={() => setMessage('')} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100" aria-label="Dismiss notification"><X className="h-4 w-4" /></button></div>
}
