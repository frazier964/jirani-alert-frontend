import { useEffect, useRef, useState } from 'react'
import { Activity, ArrowLeft, BatteryMedium, Check, Crosshair, Cpu, Gauge, Loader2, MapPin, Navigation2, Radio, ShieldCheck, Siren, Wifi } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import reportApi from '../../lib/reportApi'
import './EmergencyActivation.css'

const ACTIVATION_KEY = 'jiranialert_emergency_activation'
const HOLD_MS = 3000
const RING_LENGTH = 2 * Math.PI * 112
const radarNodes = [
  { top: '25%', left: '62%', tone: 'amber', label: 'N-14' },
  { top: '40%', left: '31%', tone: 'emerald', label: 'S-08' },
  { top: '66%', left: '72%', tone: 'crimson', label: 'A-03' },
  { top: '73%', left: '24%', tone: 'amber', label: 'K-21' },
]

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getGuestIdentifier() {
  const stored = sessionStorage.getItem('jiranialert_guest_id')
  if (stored) return stored
  const identifier = `guest-${createId()}`
  sessionStorage.setItem('jiranialert_guest_id', identifier)
  return identifier
}

function formatCoordinate(value, positive, negative) {
  if (value === null || value === undefined) return '--.-----'
  return `${Math.abs(value).toFixed(5)}° ${value >= 0 ? positive : negative}`
}

function getNetworkSnapshot() {
  const connection = typeof navigator !== 'undefined'
    ? navigator.connection || navigator.mozConnection || navigator.webkitConnection
    : null
  if (!connection) return { percent: null, type: 'unknown', detail: 'Unavailable' }

  const typeScores = { 'slow-2g': 15, '2g': 35, '3g': 65, '4g': 95 }
  const measuredScore = Number.isFinite(connection.downlink)
    ? Math.min(100, Math.round(connection.downlink * 20))
    : null
  const percent = measuredScore === null
    ? (typeScores[connection.effectiveType] || null)
    : Math.min(typeScores[connection.effectiveType] || 100, measuredScore)
  const detail = connection.effectiveType
    ? `${connection.effectiveType.toUpperCase()}${Number.isFinite(connection.rtt) ? ` / ${connection.rtt}ms` : ''}`
    : 'Measured'
  return { percent, type: connection.effectiveType || 'unknown', detail }
}

function Waveform() {
  return <div className="emergency-waveform" aria-label="Scene audio recording active">
    {Array.from({ length: 28 }, (_, index) => <span key={index} style={{ '--wave-delay': `${index * -0.08}s`, '--wave-height': `${22 + ((index * 17) % 58)}%` }} />)}
  </div>
}

function TelemetryBar({ location, battery, signal, gpsStatus }) {
  const signalLevel = signal.percent === null ? 0 : signal.percent >= 75 ? 4 : signal.percent >= 50 ? 3 : signal.percent >= 25 ? 2 : 1
  return <div className="emergency-telemetry" aria-label="Live device telemetry">
    <div className="telemetry-cell"><Wifi className="telemetry-icon" /><div><span>Network signal</span><strong>{signal.percent === null ? signal.detail : `${signal.percent}%`}</strong></div><i className={`signal-bars signal-level-${signalLevel}`} aria-hidden="true"><b /><b /><b /><b /></i></div>
    <div className="telemetry-cell"><BatteryMedium className="telemetry-icon" /><div><span>Battery</span><strong>{battery === null ? 'Unavailable' : `${battery}%`}</strong></div></div>
    <div className="telemetry-cell telemetry-gps"><MapPin className="telemetry-icon" /><div><span>GPS lock</span><strong>{gpsStatus === 'locked' ? `${formatCoordinate(location?.latitude, 'N', 'S')} / ${formatCoordinate(location?.longitude, 'E', 'W')}` : gpsStatus}</strong></div></div>
  </div>
}

function TacticalGrid({ location }) {
  return <section className="tactical-panel" aria-label="Simulated live tactical mapping grid">
    <div className="panel-heading"><div><span className="panel-kicker"><span className="live-dot" /> Live tactical grid</span><h2>Neighborhood response map</h2></div><span className="panel-chip"><Crosshair /> TRACKING</span></div>
    <div className="radar-map"><div className="radar-sweep" aria-hidden="true" /><div className="radar-crosshair" aria-hidden="true" /><div className="map-label map-label-top">SECTOR 04 / NAIROBI</div><div className="map-label map-label-bottom">RANGE 1.8 KM</div>{radarNodes.map((node) => <div key={node.label} className={`radar-node node-${node.tone}`} style={{ top: node.top, left: node.left }}><span /><b>{node.label}</b></div>)}<div className="you-marker"><span /><b>YOU</b></div></div>
    <div className="map-footer"><span><span className="legend-dot legend-emerald" /> Secure channel</span><span><span className="legend-dot legend-amber" /> Response unit</span><span className="map-coords">{location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Acquiring coordinates...'}</span></div>
  </section>
}

export default function EmergencyActivation() {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const [sending, setSending] = useState(false)
  const [dispatched, setDispatched] = useState(false)
  const [message, setMessage] = useState('')
  const [location, setLocation] = useState(null)
  const [gpsStatus, setGpsStatus] = useState('Acquiring...')
  const [battery, setBattery] = useState(null)
  const [signal, setSignal] = useState(getNetworkSnapshot)
  const [activityLog, setActivityLog] = useState([])
  const holdStartRef = useRef(0)
  const holdingRef = useRef(false)
  const frameRef = useRef(null)
  const progressCircleRef = useRef(null)
  const progressRef = useRef(0)
  const lastLabelUpdateRef = useRef(0)
  const activatedRef = useRef(false)
  const idempotencyKeyRef = useRef(createId())

  useEffect(() => {
    if (!navigator.geolocation) return undefined
    const watchId = navigator.geolocation.watchPosition(({ coords }) => {
      setLocation({ latitude: coords.latitude, longitude: coords.longitude, accuracy: coords.accuracy })
      setGpsStatus('locked')
    }, (error) => {
      setGpsStatus(error.code === error.PERMISSION_DENIED ? 'Permission denied' : 'Unavailable')
    }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 })
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  useEffect(() => {
    if (!navigator.getBattery) return undefined
    let mounted = true
    let batteryManager
    const updateBattery = () => {
      if (mounted && batteryManager) setBattery(Math.round(batteryManager.level * 100))
    }
    navigator.getBattery().then((manager) => {
      if (!mounted) return
      batteryManager = manager
      updateBattery()
      batteryManager.addEventListener('levelchange', updateBattery)
    }).catch(() => {})
    return () => {
      mounted = false
      batteryManager?.removeEventListener('levelchange', updateBattery)
    }
  }, [])

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (!connection) return undefined
    const updateSignal = () => setSignal(getNetworkSnapshot())
    connection.addEventListener?.('change', updateSignal)
    return () => connection.removeEventListener?.('change', updateSignal)
  }, [])

  useEffect(() => () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }, [])

  useEffect(() => {
    if (!dispatched) return undefined
    const entries = [
      { delay: 100, text: '0.0s: SOS initiated', icon: Siren },
      { delay: 1200, text: '1.2s: Secure ping received', icon: Radio },
      { delay: 2200, text: '2.2s: Nearest response unit notified', icon: ShieldCheck },
      { delay: 3000, text: '3.0s: Route locked to dispatch', icon: Navigation2 },
    ]
    const timers = entries.map((entry) => window.setTimeout(() => setActivityLog((current) => [...current, entry]), entry.delay))
    const redirectTimer = window.setTimeout(() => navigate('/report-emergency', { replace: true }), 7200)
    return () => { timers.forEach((timer) => window.clearTimeout(timer)); window.clearTimeout(redirectTimer) }
  }, [dispatched, navigate])

  const cancelHold = (showMessage = true) => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    holdingRef.current = false
    progressRef.current = 0
    setHolding(false)
    setProgress(0)
    if (progressCircleRef.current) progressCircleRef.current.style.strokeDasharray = `0 ${RING_LENGTH}`
    if (showMessage) setMessage('Hold continuously for the full 3 seconds to send.')
  }

  const activate = async () => {
    if (activatedRef.current || sending) return
    activatedRef.current = true
    setHolding(false)
    setSending(true)
    progressRef.current = 1
    setProgress(1)
    if (progressCircleRef.current) progressCircleRef.current.style.strokeDasharray = `${RING_LENGTH} 0`
    setMessage('Broadcasting emergency alert...')
    try {
      const response = await reportApi.activateEmergency({
        idempotencyKey: idempotencyKeyRef.current,
        guestIdentifier: getGuestIdentifier(),
        locationCoordinates: location,
        device_telemetry: { battery_level: battery === null ? null : battery / 100, connection_type: signal.type },
      })
      sessionStorage.setItem(ACTIVATION_KEY, JSON.stringify({ reportId: response.reportId || response.emergencyId, guestIdentifier: getGuestIdentifier(), locationCoordinates: location, status: 'ACTIVE' }))
      setSending(false)
      setDispatched(true)
    } catch (error) {
      activatedRef.current = false
      setSending(false)
      progressRef.current = 0
      setProgress(0)
      if (progressCircleRef.current) progressCircleRef.current.style.strokeDasharray = `0 ${RING_LENGTH}`
      setMessage(`Unable to send emergency alert. ${error?.message || 'Please try again.'}`)
    }
  }

  const updateHold = (timestamp) => {
    if (!holdingRef.current || activatedRef.current) return
    const nextProgress = Math.min((timestamp - holdStartRef.current) / HOLD_MS, 1)
    progressRef.current = nextProgress
    if (progressCircleRef.current) progressCircleRef.current.style.strokeDasharray = `${RING_LENGTH * nextProgress} ${RING_LENGTH}`
    if (timestamp - lastLabelUpdateRef.current >= 80 || nextProgress >= 1) {
      lastLabelUpdateRef.current = timestamp
      setProgress(nextProgress)
    }
    if (nextProgress >= 1) { frameRef.current = null; void activate(); return }
    frameRef.current = requestAnimationFrame(updateHold)
  }

  const startHold = (event) => {
    if (sending || dispatched || activatedRef.current || holdingRef.current) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setMessage('')
    holdingRef.current = true
    setHolding(true)
    frameRef.current = requestAnimationFrame((timestamp) => {
      holdStartRef.current = timestamp
      lastLabelUpdateRef.current = timestamp
      updateHold(timestamp)
    })
  }

  const releaseHold = (event) => {
    if (!holdingRef.current || sending) return
    if (event?.type === 'pointerleave' && event.currentTarget.hasPointerCapture?.(event.pointerId)) return
    event?.currentTarget?.releasePointerCapture?.(event.pointerId)
    if (performance.now() - holdStartRef.current >= HOLD_MS) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      progressRef.current = 1
      setProgress(1)
      if (progressCircleRef.current) progressCircleRef.current.style.strokeDasharray = `${RING_LENGTH} 0`
      void activate()
      return
    }
    cancelHold(true)
  }

  const ringProgress = RING_LENGTH * progress
  const remaining = Math.max(0, 3 - progress * 3).toFixed(1)

  if (dispatched) return <main className="emergency-page dispatched-page"><div className="dispatch-shell"><div className="dispatch-banner"><span className="live-dot" /> CRITICAL ALERT BROADCASTED</div><div className="dispatch-icon"><Check /></div><p className="eyebrow amber-text">JIRANIALERT / DISPATCH CONTROL</p><h1>DISPATCHED</h1><p className="dispatch-summary">Your emergency signal is active. Nearby responders have been notified and your location is being shared securely.</p><div className="dispatch-grid"><section className="dispatch-log"><div className="panel-heading"><div><span className="panel-kicker"><Activity /> Activity stream</span><h2>Response timeline</h2></div><span className="panel-chip secure-chip">LIVE</span></div><div className="activity-list">{activityLog.map(({ text, icon: Icon }) => <div className="activity-entry" key={text}><Icon /><span>{text}</span><Check /></div>)}{activityLog.length < 4 && <div className="activity-pending"><Loader2 /> Establishing secure response route...</div>}</div></section><section className="audio-card"><div className="panel-heading"><div><span className="panel-kicker"><Radio /> Evidence capture</span><h2>Scene audio</h2></div><span className="recording-status"><span className="record-dot" /> REC</span></div><Waveform /><p>Recording locally for responder context</p></section></div><div className="dispatch-actions"><span><MapPin /> GPS shared with authorities</span><button type="button" onClick={() => navigate('/report-emergency', { replace: true })}>Continue to details <ArrowLeft /></button></div></div></main>

  return <main className="emergency-page"><header className="emergency-header"><button type="button" className="back-button" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft /></button><div className="brand-lockup"><img src="/jirani-alert-logo.svg" alt="Jirani Alert" /><span>JIRAN<span>ALERT</span></span></div><div className="system-state"><span className="live-dot" /> System secure</div></header><TelemetryBar location={location} battery={battery} signal={signal} gpsStatus={gpsStatus} /><div className="emergency-layout"><TacticalGrid location={location} /><section className="controls-panel"><div className="controls-heading"><div><p className="eyebrow crimson-text">Emergency activation</p><h1>Need help now?</h1><p>Hold the button to broadcast your location to emergency responders.</p></div><div className="secure-badge"><ShieldCheck /> Secure</div></div><div className={`sos-stage ${holding ? 'is-holding' : ''}`}><span className="sos-ripple ripple-one" /><span className="sos-ripple ripple-two" /><svg className="sos-progress" viewBox="0 0 256 256" aria-hidden="true"><circle cx="128" cy="128" r="112" /><circle ref={progressCircleRef} cx="128" cy="128" r="112" style={{ strokeDasharray: `${ringProgress} ${RING_LENGTH}` }} /></svg><button type="button" className="sos-button" disabled={sending} onPointerDown={startHold} onPointerUp={releaseHold} onPointerCancel={releaseHold} onPointerLeave={releaseHold} onTouchStart={startHold} onTouchEnd={releaseHold} onTouchCancel={releaseHold} aria-label="Hold to alert responders">{sending ? <Loader2 className="spin-icon" /> : <Siren />}<strong>{sending ? 'SENDING' : holding ? `HOLD ${remaining}s` : 'HOLD 3s TO SOS'}</strong><span>{holding ? 'Keep holding' : 'Release to cancel'}</span></button></div><div className="hold-instruction"><Gauge /> {message || 'Continuous pressure activates the emergency broadcast.'}</div><div className="controls-footer"><span><MapPin /> GPS Active: {gpsStatus === 'locked' ? 'Shared with authorities' : gpsStatus}</span><span><Cpu /> Device ID verified</span></div></section></div></main>
}
