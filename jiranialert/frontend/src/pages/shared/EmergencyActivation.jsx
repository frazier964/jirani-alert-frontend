import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Loader2, Siren } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import reportApi from '../../lib/reportApi'

const ACTIVATION_KEY = 'jiranialert_emergency_activation'
const HOLD_MS = 3000

function getGuestIdentifier() {
  const stored = sessionStorage.getItem('jiranialert_guest_id')
  if (stored) return stored
  const identifier = `guest-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`}`
  sessionStorage.setItem('jiranialert_guest_id', identifier)
  return identifier
}

export default function EmergencyActivation() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [location, setLocation] = useState(null)
  const holdStartRef = useRef(0)
  const holdingRef = useRef(false)
  const frameRef = useRef(null)
  const activatedRef = useRef(false)
  const idempotencyKeyRef = useRef(crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    if (!navigator.geolocation) return undefined
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => setLocation({ latitude: coords.latitude, longitude: coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 120000, timeout: 1500 },
    )
    return undefined
  }, [])

  useEffect(() => () => cancelHold(false), [])

  const cancelHold = (showMessage = true) => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    holdingRef.current = false
    setHolding(false)
    setProgress(0)
    if (showMessage) setMessage('Keep holding for 3 seconds to activate the emergency.')
  }

  const activate = async () => {
    if (activatedRef.current || sending) return
    activatedRef.current = true
    setHolding(false)
    setSending(true)
    setProgress(1)
    setMessage('Sending emergency alert...')
    try {
      const response = await reportApi.activateEmergency({
        idempotencyKey: idempotencyKeyRef.current,
        guestIdentifier: getGuestIdentifier(),
        locationCoordinates: location,
      })
      sessionStorage.setItem(ACTIVATION_KEY, JSON.stringify({
        reportId: response.reportId || response.emergencyId,
        guestIdentifier: getGuestIdentifier(),
        locationCoordinates: location,
        status: 'ACTIVE',
      }))
      navigate('/report-emergency', { replace: true })
    } catch (error) {
      activatedRef.current = false
      setSending(false)
      setProgress(0)
      setMessage(`Unable to send emergency alert. ${error?.message || 'Something went wrong while sending the emergency alert. Please try again.'}`)
    }
  }

  const updateHold = () => {
    if (!holdingRef.current || activatedRef.current) return
    const elapsed = performance.now() - holdStartRef.current
    const nextProgress = Math.min(elapsed / HOLD_MS, 1)
    setProgress(nextProgress)
    if (nextProgress >= 1) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      void activate()
      return
    }
    frameRef.current = requestAnimationFrame(updateHold)
  }

  const startHold = (event) => {
    if (sending || activatedRef.current) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setMessage('')
    holdingRef.current = true
    setHolding(true)
    holdStartRef.current = performance.now()
    frameRef.current = requestAnimationFrame(updateHold)
  }

  const releaseHold = (event) => {
    if (!holdingRef.current || sending) return
    event?.currentTarget?.releasePointerCapture?.(event.pointerId)
    cancelHold(true)
  }

  const ringProgress = 2 * Math.PI * 112 * progress
  return <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#fee2e2,#fff1f2_42%,#f8fafc_80%)] px-4 py-8 text-slate-900 sm:px-6">
    <section className="w-full max-w-xl text-center"><button type="button" onClick={() => navigate(-1)} className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Back</button><div className="rounded-[2rem] border border-red-200 bg-white p-6 shadow-[0_24px_70px_rgba(127,29,29,0.16)] sm:p-10"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-200"><Siren className="h-8 w-8" /></div><h1 className="mt-6 text-3xl font-black tracking-tight text-red-700 sm:text-4xl">🚨 EMERGENCY ALERT</h1><p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600">Hold the button for 3 seconds to notify responders and authorities.</p><div className="relative mx-auto mt-10 h-64 w-64"><svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 256 256" aria-hidden="true"><circle cx="128" cy="128" r="112" fill="none" stroke="#fee2e2" strokeWidth="10" /><circle cx="128" cy="128" r="112" fill="none" stroke="#dc2626" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${ringProgress} ${2 * Math.PI * 112}`} /></svg><button type="button" disabled={sending} onPointerDown={startHold} onPointerUp={releaseHold} onPointerCancel={releaseHold} className="absolute inset-5 flex touch-none select-none flex-col items-center justify-center rounded-full border-8 border-red-800 bg-red-600 text-white shadow-[0_18px_40px_rgba(185,28,28,0.35)] transition hover:bg-red-700 active:scale-95 disabled:cursor-wait disabled:opacity-80" aria-label="Hold to alert responders"><Siren className="h-12 w-12" /><span className="mt-2 text-lg font-black">{sending ? 'SENDING' : holding ? `HOLD... ${(3 - progress * 3).toFixed(1)}s` : 'HOLD TO ALERT'}</span></button></div>{sending ? <p className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-red-700"><Loader2 className="h-4 w-4 animate-spin" />Emergency alert is being sent...</p> : null}{message ? <p role="status" className={`mx-auto mt-6 max-w-md text-sm font-semibold ${message.startsWith('Unable') ? 'text-red-700' : 'text-amber-700'}`}>{message}</p> : null}<p className="mt-8 text-xs leading-5 text-slate-500">Your alert is sent immediately after a complete 3-second hold. Details can be added next.</p></div></section>
  </main>
}
