import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import { LocateFixed, MapPin, Navigation, RefreshCw, Search, X } from 'lucide-react'
import { listResponderIncidents } from '../../lib/responderApi'
import { normalizeIncident } from './responderUtils'
import { ResponderShell } from './ResponderComponents'

const nairobiCenter = [-1.2921, 36.8219]
const severities = ['All', 'Critical', 'High', 'Medium', 'Low']
const severityColors = { Critical: '#dc2626', High: '#ea580c', Medium: '#ca8a04', Low: '#16a34a' }

function coordinatesFor(item) {
  const value = item.locationCoordinates || item.gps || item.coordinates
  if (value && Number.isFinite(Number(value.latitude)) && Number.isFinite(Number(value.longitude))) return [Number(value.latitude), Number(value.longitude)]
  if (typeof value === 'string') {
    const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/)
    if (match) return [Number(match[1]), Number(match[2])]
  }
  return null
}

function markerIcon(leaflet, item) {
  const color = severityColors[item.severity] || '#2563eb'
  return leaflet.divIcon({
    className: '',
    html: `<div style="width:38px;height:38px;border-radius:999px;background:${color};border:3px solid white;box-shadow:0 4px 16px rgba(15,23,42,.35);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:11px">${String(item.type || '!').slice(0, 2).toUpperCase()}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  })
}

export default function ResponderMapPage() {
  const navigate = useNavigate()
  const mapElementRef = useRef(null)
  const mapRef = useRef(null)
  const leafletRef = useRef(null)
  const markersRef = useRef([])
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState(null)
  const [severity, setSeverity] = useState('All')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [locationStatus, setLocationStatus] = useState('Map centered on Nairobi')

  const load = async () => {
    try {
      const response = await listResponderIncidents(100)
      setItems((response.reports || response.incidents || []).map(normalizeIncident))
      setError('')
    } catch (requestError) {
      setError(requestError?.message || 'Unable to load incidents')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const timer = window.setInterval(load, 5000)
    return () => window.clearInterval(timer)
  }, [])

  const visible = useMemo(() => items.filter((item) => {
    const text = `${item.title} ${item.type} ${item.location} ${item.severity} ${item.status}`.toLowerCase()
    return (severity === 'All' || item.severity === severity) && text.includes(query.toLowerCase())
  }), [items, query, severity])
  const mappedItems = visible.map((item) => ({ item, coords: coordinatesFor(item) })).filter((entry) => entry.coords)

  useEffect(() => {
    let cancelled = false
    async function init() {
      if (!mapElementRef.current || mapRef.current) return
      const leafletModule = await import('leaflet')
      const leaflet = leafletModule.default ?? leafletModule
      if (cancelled) return
      leafletRef.current = leaflet
      mapRef.current = leaflet.map(mapElementRef.current, { center: nairobiCenter, zoom: 12, zoomControl: false })
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(mapRef.current)
      leaflet.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)
    }
    init()
    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      leafletRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !leafletRef.current) return
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = mappedItems.map(({ item, coords }) => {
      const marker = leafletRef.current.marker(coords, { icon: markerIcon(leafletRef.current, item) }).addTo(mapRef.current)
      marker.bindPopup(`<strong>${item.title}</strong><br>${item.location}<br>${item.severity} / ${item.status}`)
      marker.on('click', () => setSelected(item))
      return marker
    })
  }, [mappedItems])

  const fitIncidents = () => {
    if (!mapRef.current || !mappedItems.length) return
    const bounds = mappedItems.map(({ coords }) => coords)
    mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 })
  }

  const locateUser = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Browser location is unavailable')
      return
    }
    setLocationStatus('Requesting your location...')
    navigator.geolocation.getCurrentPosition((position) => {
      const coords = [position.coords.latitude, position.coords.longitude]
      mapRef.current?.setView(coords, 15)
      setLocationStatus(`Your location, accurate to about ${Math.round(position.coords.accuracy)}m`)
    }, () => setLocationStatus('Location permission was denied'))
  }

  return <ResponderShell><div className="grid gap-5">
    <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-300">Responder Operations</p><h1 className="mt-2 text-3xl font-extrabold text-white">Live Incident Map</h1><p className="mt-2 text-slate-300">Accurate map tiles and incident coordinates from the responder backend.</p></div><MapPin className="h-8 w-8 text-cyan-300" /></div>
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 shadow-xl"><div className="flex flex-col gap-3 border-b border-white/10 p-4 lg:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search incidents or locations" className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-500" /></label><div className="flex flex-wrap gap-2">{severities.map((value) => <button key={value} type="button" onClick={() => setSeverity(value)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${severity === value ? 'border-cyan-300 bg-cyan-400/20 text-cyan-100' : 'border-white/10 text-slate-300'}`}>{value}</button>)}</div></div><div ref={mapElementRef} className="min-h-[560px] w-full" /></section>
      <aside className="grid content-start gap-4"><div className="flex flex-wrap gap-2"><button type="button" onClick={fitIncidents} className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100"><Navigation className="h-4 w-4" />Fit incidents</button><button type="button" onClick={locateUser} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200"><LocateFixed className="h-4 w-4" />My location</button><button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-200"><RefreshCw className="h-4 w-4" />Refresh</button></div><p className="text-xs text-slate-400">{locationStatus}</p>{error ? <p className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}<div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4"><div className="flex items-center justify-between"><h2 className="font-bold text-white">Mapped incidents</h2><span className="text-xs text-slate-400">{mappedItems.length} shown</span></div><div className="mt-3 grid gap-2">{loading ? <p className="text-sm text-slate-400">Loading map data...</p> : visible.map((item) => <button key={item.id} type="button" onClick={() => { setSelected(item); const coords = coordinatesFor(item); if (coords) mapRef.current?.setView(coords, 15) }} className="rounded-lg border border-white/10 bg-white/5 p-3 text-left hover:bg-white/10"><div className="flex items-start justify-between gap-2"><span className="font-bold text-white">{item.title}</span><span className="text-xs font-bold" style={{ color: severityColors[item.severity] || '#93c5fd' }}>{item.severity}</span></div><p className="mt-1 text-xs text-slate-400">{item.location} / {item.status}</p></button>)}</div></div>{selected ? <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wide text-cyan-200">Selected incident</p><h2 className="mt-1 font-bold text-white">{selected.title}</h2><p className="mt-1 text-sm text-slate-300">{selected.location}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Close selected incident"><X className="h-4 w-4 text-slate-300" /></button></div><div className="mt-3 flex gap-2"><button type="button" onClick={() => navigate(`/responder/incidents/${selected.id}`)} className="rounded-lg bg-cyan-300 px-3 py-2 text-xs font-bold text-slate-950">View details</button><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.location)}`} target="_blank" rel="noreferrer" className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white">Open Google Maps</a></div></div> : null}</aside>
    </div>
  </div></ResponderShell>
}
