import React, { useEffect, useMemo, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  Flame,
  HeartPulse,
  LocateFixed,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react'

const fallbackCenter = [-1.2921, 36.8219]

const alerts = [
  {
    id: 'AL-204',
    type: 'Fire',
    title: 'Smoke reported near Skyline Apartments',
    location: 'Westlands, Nairobi',
    time: '2 min ago',
    severity: 'Critical',
    status: 'Active',
    offset: [0.018, -0.022],
    description: 'Smoke and flames visible from the rooftop. Residents nearby should avoid the area.',
  },
  {
    id: 'AL-203',
    type: 'Medical',
    title: 'Medical emergency near central road',
    location: 'Near your area',
    time: '9 min ago',
    severity: 'High',
    status: 'Responding',
    offset: [-0.013, 0.018],
    description: 'Paramedics have been notified and are moving toward the reported location.',
  },
  {
    id: 'AL-202',
    type: 'Accident',
    title: 'Road accident on nearby route',
    location: 'Nearby route',
    time: '32 min ago',
    severity: 'Moderate',
    status: 'Active',
    offset: [0.009, 0.026],
    description: 'Two-vehicle collision blocking one lane. Use alternate routes if possible.',
  },
]

const severityStyles = {
  Critical: 'bg-red-100 text-red-700 border-red-200',
  High: 'bg-amber-100 text-amber-700 border-amber-200',
  Moderate: 'bg-emerald-100 text-emerald-700 border-emerald-200',
}

const markerColors = {
  Critical: '#dc2626',
  High: '#f59e0b',
  Moderate: '#10b981',
}

const typeIcons = {
  Fire: Flame,
  Medical: HeartPulse,
  Accident: ShieldAlert,
}

function createAlertIcon(alert) {
  throw new Error('Leaflet must be provided to createAlertIcon')
}

function createAlertIconWithLeaflet(leaflet, alert) {
  const color = markerColors[alert.severity] || '#2563eb'
  return leaflet.divIcon({
    className: '',
    html: `<div style="width:38px;height:38px;border-radius:9999px;background:${color};border:4px solid white;box-shadow:0 14px 32px rgba(15,23,42,.28);display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:12px;">${alert.type[0]}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  })
}

function createUserIconWithLeaflet(leaflet) {
  return leaflet.divIcon({
    className: '',
    html: '<div style="width:28px;height:28px;border-radius:9999px;background:#2563eb;border:5px solid white;box-shadow:0 0 0 10px rgba(37,99,235,.18),0 14px 30px rgba(15,23,42,.25);"></div>',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  })
}

export default function LiveMap() {
  const mapElementRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const leafletRef = useRef(null)
  const [query, setQuery] = useState('')
  const [type, setType] = useState('All')
  const [selectedId, setSelectedId] = useState(alerts[0].id)
  const [center, setCenter] = useState(fallbackCenter)
  const [locationStatus, setLocationStatus] = useState('Using default Nairobi location until GPS permission is allowed.')
  const [hasPreciseLocation, setHasPreciseLocation] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  const alertsWithCoords = useMemo(() => {
    return alerts.map((alert) => ({
      ...alert,
      coords: [center[0] + alert.offset[0], center[1] + alert.offset[1]],
    }))
  }, [center])

  const filteredAlerts = useMemo(() => {
    return alertsWithCoords.filter((alert) => {
      const matchesQuery = `${alert.title} ${alert.location} ${alert.id}`.toLowerCase().includes(query.toLowerCase())
      const matchesType = type === 'All' || alert.type === type
      return matchesQuery && matchesType
    })
  }, [alertsWithCoords, query, type])

  const selected = filteredAlerts.find((alert) => alert.id === selectedId) || filteredAlerts[0] || alertsWithCoords[0]
  const activeCount = alerts.filter((alert) => alert.status === 'Active').length
  const criticalCount = alerts.filter((alert) => alert.severity === 'Critical').length

  const locateUser = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Location is not supported by this browser. Showing Nairobi as the default area.')
      return
    }

    setLocationStatus('Requesting GPS location from your browser...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCenter = [position.coords.latitude, position.coords.longitude]
        setCenter(nextCenter)
        setHasPreciseLocation(true)
        setLocationStatus(`GPS location active. Accuracy is about ${Math.round(position.coords.accuracy)} meters.`)
        if (mapRef.current) {
          mapRef.current.setView(nextCenter, 15)
        }
      },
      () => {
        setHasPreciseLocation(false)
        setLocationStatus('Location permission was denied or unavailable. Showing Nairobi as the default area.')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    )
  }

  useEffect(() => {
    let cancelled = false

    async function initMap() {
      if (!mapElementRef.current || mapRef.current) return

      const leafletModule = await import('leaflet')
      const leaflet = leafletModule.default ?? leafletModule

      if (cancelled || !mapElementRef.current) return

      leafletRef.current = leaflet
      mapRef.current = leaflet.map(mapElementRef.current, {
        center,
        zoom: 13,
        minZoom: 3,
        zoomControl: false,
        maxBounds: [
          [-85, -180],
          [85, 180],
        ],
        maxBoundsViscosity: 1,
        worldCopyJump: false,
      })

      leaflet
        .tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          noWrap: true,
          bounds: [
            [-85, -180],
            [85, 180],
          ],
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri',
        })
        .addTo(mapRef.current)

      leaflet.control.zoom({ position: 'bottomright' }).addTo(mapRef.current)
      setMapReady(true)
      locateUser()
    }

    initMap()

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
      leafletRef.current = null
      setMapReady(false)
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current || !leafletRef.current) return

    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = filteredAlerts.map((alert) => {
      const marker = leafletRef.current.marker(alert.coords, { icon: createAlertIconWithLeaflet(leafletRef.current, alert) })
        .addTo(mapRef.current)
        .bindPopup(`<strong>${alert.title}</strong><br />${alert.location}<br />${alert.severity}`)
      marker.on('click', () => setSelectedId(alert.id))
      return marker
    })

    if (userMarkerRef.current) {
      userMarkerRef.current.remove()
    }
    userMarkerRef.current = leafletRef.current.marker(center, { icon: createUserIconWithLeaflet(leafletRef.current) })
      .addTo(mapRef.current)
      .bindPopup(hasPreciseLocation ? 'Your current GPS location' : 'Default map center')
  }, [center, filteredAlerts, hasPreciseLocation])

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ring-1 ring-slate-200 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                <MapPin className="h-4 w-4" />
                Live Satellite Map
              </div>
              <h1 className="mt-4 !text-3xl !font-black !leading-tight !text-slate-950 sm:!text-4xl">
                Nearby Emergency Map
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                Uses your browser GPS location when allowed, then displays nearby emergency markers on real satellite map imagery.
              </p>
              <p className={`mt-3 text-sm font-semibold ${hasPreciseLocation ? 'text-emerald-700' : 'text-amber-700'}`}>
                {locationStatus}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Active</p>
                <p className="mt-2 text-3xl font-black text-red-600">{activeCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Critical</p>
                <p className="mt-2 text-3xl font-black text-amber-600">{criticalCount}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Signal</p>
                <p className="mt-2 text-lg font-black text-slate-950">{hasPreciseLocation ? 'GPS' : 'Default'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="!text-xl !font-black !text-slate-950">Satellite Incident Map</h2>
                <p className="mt-1 text-sm text-slate-500">Allow location access for the map to center on your real current position.</p>
              </div>
              <button
                type="button"
                onClick={locateUser}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E53935] px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_26px_rgba(229,57,53,0.22)]"
              >
                <LocateFixed className="h-4 w-4" />
                Use My Location
              </button>
            </div>

            <div className="relative overflow-hidden rounded-3xl border border-slate-200">
              <div ref={mapElementRef} className="relative h-[620px] w-full bg-slate-200">
                {!mapReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 text-sm font-semibold text-slate-600">
                    Loading map...
                  </div>
                )}
              </div>
              <div className="pointer-events-none absolute bottom-4 left-4 right-4 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur sm:left-auto sm:w-[390px]">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">Selected Alert</p>
                    <h3 className="mt-1 truncate text-sm font-black text-slate-950">{selected.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{selected.location} • {selected.time}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-slate-500" />
                <h2 className="!text-lg !font-black !text-slate-950">Filters</h2>
              </div>
              <div className="mt-4 space-y-3">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2.5">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search alerts or location"
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  />
                </label>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none"
                >
                  <option>All</option>
                  <option>Fire</option>
                  <option>Medical</option>
                  <option>Accident</option>
                </select>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <h2 className="!text-lg !font-black !text-slate-950">Live Alerts</h2>
              <div className="mt-4 space-y-3">
                {filteredAlerts.map((alert) => {
                  const Icon = typeIcons[alert.type]
                  return (
                    <button
                      key={alert.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(alert.id)
                        mapRef.current?.setView(alert.coords, 15)
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition ${selected?.id === alert.id ? 'border-red-200 bg-red-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    >
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-black text-slate-950">{alert.title}</p>
                            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold ${severityStyles[alert.severity]}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{alert.location} • {alert.time}</p>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{alert.description}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 text-sm leading-6 text-blue-900">
              Browser GPS comes from the device location services. Satellite imagery is loaded from online map tiles, so internet access is required.
            </div>
          </aside>
        </section>
      </div>
    </main>
  )
}
