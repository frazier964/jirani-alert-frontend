import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { listSystemAnnouncements } from '../lib/announcementApi'

const announcementItems = [
  '🚨 Emergency reported near your area',
  '🔥 Fire incident reported in Nairobi West',
  '🚑 Medical emergency responders dispatched',
  '⚠️ Heavy rainfall warning in your location',
  '✨ New Nearby Alerts feature now live',
  '📱 Mobile experience has been improved',
  '🔔 Real-time notifications are now faster',
  '❤️ Together we build safer neighborhoods',
  '🤝 Help your community by reporting incidents',
  '☎️ Emergency Hotline: 999 available 24/7',
  '📍 Enable location services for nearby alerts',
  '⚡ Live alert system active',
]

export default function AnnouncementBar() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [publishedAnnouncements, setPublishedAnnouncements] = useState([])
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const announcements = await listSystemAnnouncements()
        if (!cancelled) setPublishedAnnouncements(announcements)
      } catch {
        // Keep the built-in announcements visible when the backend is unavailable.
      }
    }
    void load()
    const refresh = window.setInterval(load, 30000)
    return () => {
      cancelled = true
      window.clearInterval(refresh)
    }
  }, [])

  const items = publishedAnnouncements.length
    ? publishedAnnouncements.map((announcement) => `${announcement.title}: ${announcement.message}`)
    : announcementItems

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length)
    }, 15000)

    return () => window.clearInterval(interval)
  }, [items.length])

  const activeAnnouncement = publishedAnnouncements[activeIndex % Math.max(publishedAnnouncements.length, 1)]
  const message = activeAnnouncement
    ? `${activeAnnouncement.title}: ${activeAnnouncement.message}`
    : items[activeIndex % items.length]

  return (
    <motion.section
      className="fixed inset-x-0 top-0 z-40 bg-gradient-to-r from-[#2563EB] via-sky-600 to-slate-900 text-white shadow-sm shadow-slate-950/15"
      initial={{ y: -18, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } }}
      aria-live="polite"
      role="status"
    >
      <div className="mx-auto flex max-w-7xl items-center min-h-[36px] px-3 text-sm sm:px-4 lg:px-6">
        <div className="relative flex flex-1 min-w-0 items-center overflow-hidden rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-white shadow-inner shadow-black/10 backdrop-blur-sm sm:text-base">
          <motion.div
            key={activeIndex}
            className="absolute left-0 top-1/2 whitespace-nowrap text-sm font-semibold text-white sm:text-base"
            initial={shouldReduceMotion ? { x: 0, y: '-50%' } : { x: '100vw', y: '-50%' }}
            animate={shouldReduceMotion ? { x: 0, y: '-50%' } : { x: ['100vw', '-100vw'], y: '-50%' }}
            transition={{ duration: shouldReduceMotion ? 0 : 16, repeat: shouldReduceMotion ? 0 : Infinity, ease: 'linear' }}
          >
            {activeAnnouncement ? <><strong className="mr-2">{activeAnnouncement.title}</strong><span>{activeAnnouncement.message}</span></> : message}
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}
