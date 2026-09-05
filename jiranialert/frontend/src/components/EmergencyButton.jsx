import { Siren } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

const hiddenPaths = ['/report-emergency', '/resident/report', '/responder/report-emergency']

export default function EmergencyButton() {
  const navigate = useNavigate()
  const location = useLocation()
  const shouldHide = hiddenPaths.some((path) => location.pathname === path || location.pathname.startsWith(`${path}/`))

  if (shouldHide) return null

  return (
    <button
      type="button"
      onClick={() => navigate('/report-emergency')}
      className="fixed bottom-5 right-4 z-[60] inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-red-900 bg-red-600 px-4 py-3 text-sm font-black text-white shadow-[0_12px_30px_rgba(153,27,27,0.3)] transition duration-150 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-[0_16px_36px_rgba(153,27,27,0.38)] active:translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300 focus-visible:ring-offset-2 sm:bottom-6 sm:right-6 sm:px-5"
      aria-label="Report Emergency"
    >
      <span aria-hidden="true" className="text-base leading-none">🚨</span>
      <Siren className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">Report Emergency</span>
      <span className="sm:hidden">Emergency</span>
    </button>
  )
}
