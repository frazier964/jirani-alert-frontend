import React from 'react'
import Header from '../../components/Header'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Flame,
  Globe2,
  Gauge,
  Lock,
  MapPin,
  Megaphone,
  MessageCircle,
  Radar,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'

const featureCards = [
  {
    title: 'Real-Time Emergency Reporting',
    description: 'Instantly report emergencies with one tap and capture the details that responders need most.',
    icon: AlertTriangle,
    highlights: ['Fast submission', 'Smart categorization', 'Emergency details capture'],
  },
  {
    title: 'Nearby Alerts',
    description: 'Receive alerts happening near your current location so you can stay aware of local risks.',
    icon: MapPin,
    highlights: ['Live location awareness', 'Distance indicators', 'Community safety radius'],
  },
  {
    title: 'Smart Notifications',
    description: 'Get relevant alerts only, filtered by severity and proximity for a calmer experience.',
    icon: BellRing,
    highlights: ['Personalized alerts', 'Severity filtering', 'Instant delivery'],
  },
  {
    title: 'Live Emergency Map',
    description: 'Visualize incidents in real time and understand where help is needed right now.',
    icon: Globe2,
    highlights: ['Map pins', 'Alert zones', 'Emergency heatmaps'],
  },
  {
    title: 'Panic Mode',
    description: 'Send emergency alerts instantly with a one-tap high-priority activation path.',
    icon: Flame,
    highlights: ['One-tap activation', 'High-priority routing', 'Auto-location sharing'],
  },
  {
    title: 'Emergency Tracking',
    description: 'Track alert progress live from submission through response and resolution.',
    icon: Radar,
    highlights: ['Status updates', 'Response monitoring', 'Resolution tracking'],
  },
  {
    title: 'Community Safety Feed',
    description: 'Stay updated on local incidents, community reports, and verified updates in one place.',
    icon: Users,
    highlights: ['Live updates', 'Community reports', 'Verified incident updates'],
  },
  {
    title: 'Secure Reporting',
    description: 'Keep personal safety data protected while using trusted emergency communication channels.',
    icon: Lock,
    highlights: ['Encrypted communication', 'Protected identity options', 'Safe reporting channels'],
  },
]

const timeline = [
  { title: 'Detect', description: 'User reports emergency', icon: Smartphone },
  { title: 'Analyze', description: 'System categorizes incident', icon: Sparkles },
  { title: 'Notify', description: 'Nearby users alerted', icon: Megaphone },
  { title: 'Respond', description: 'Community acts faster', icon: ShieldCheck },
  { title: 'Resolve', description: 'Incident tracked and closed', icon: CheckCircle2 },
]

const testimonials = [
  '"Jirani Alert helped our neighborhood respond faster during an emergency."',
  '"The real-time alerts are incredibly helpful."',
]

const comparisonRows = [
  ['Delayed awareness', 'Instant alerts'],
  ['Slow communication', 'Live updates'],
  ['Uncoordinated response', 'Coordinated action'],
]

function SectionTitle({ eyebrow, title, description, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="text-xs font-black uppercase tracking-[0.28em] text-[#E53935]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">{description}</p>
    </div>
  )
}

function Reveal({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.45, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Features() {
  return (
    <div className="min-h-screen bg-[#f3f6fb] text-slate-900">
      <Header
        navItems={[
          { label: 'Home', to: '/home' },
          { label: 'Features', to: '/features' },
          { label: 'How It Works', id: 'how-it-works' },
          { label: 'About', to: '/about' },
          { label: 'Contact', to: '/contact' },
          { label: 'Support', to: '/support' },
        ]}
        initialBg="rgba(12,31,73,0.96)"
        scrolledBg="rgba(12,31,73,0.98)"
        primaryColor="#113a7a"
        textColor="text-white/90"
        theme="dark"
      />
      <main className="overflow-hidden">
        <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#0c1f49_0%,#113a7a_45%,#ffffff_45%,#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,57,53,0.18),transparent_24%),radial-gradient(circle_at_80%_15%,rgba(59,130,246,0.2),transparent_22%),radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.15),transparent_16%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
            <Reveal className="space-y-6 text-white">
              <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 rounded-full border border-slate-300 bg-slate-100 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-semibold backdrop-blur-xl text-slate-900">
                <Sparkles className="h-4 w-4 text-[#E53935] flex-shrink-0" />
                <span>Explore the platform that powers safer communities</span>
              </div>
              <h1 className="max-w-2xl text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.22)]">
                Powerful Features Built for Safer Communities
              </h1>
              <p className="max-w-2xl text-base sm:text-lg leading-8 text-blue-100 lg:text-xl">
                Discover how Jirani Alert helps residents report emergencies, receive real-time alerts, and improve community response.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[#113a7a] shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/report" className="inline-flex items-center gap-2 rounded-full bg-[#E53935] px-6 py-3 font-bold text-white shadow-[0_18px_40px_rgba(229,57,53,0.28)] transition-transform hover:-translate-y-0.5">
                  Report Emergency
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="relative">
              <div className="rounded-[2rem] border border-white/50 bg-white/85 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.2)] backdrop-blur-2xl sm:p-6">
                <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,#0c1f49_0%,#163b82_52%,#1f6bda_100%)] p-5 text-white shadow-inner">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-100">Interactive Dashboard</p>
                      <h3 className="mt-2 text-2xl font-extrabold text-white">Emergency awareness in motion</h3>
                    </div>
                    <div className="rounded-2xl bg-white/12 p-3 backdrop-blur">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Alert pins</p>
                      <p className="mt-3 text-sm text-white/90">Visual markers show urgent incidents clearly.</p>
                    </motion.div>
                    <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }} className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Notification popups</p>
                      <p className="mt-3 text-sm text-white/90">Helpful nudges keep users informed quickly.</p>
                    </motion.div>
                    <motion.div animate={{ x: [0, -6, 0] }} transition={{ duration: 3.3, repeat: Infinity, ease: 'easeInOut' }} className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Safety map indicators</p>
                      <p className="mt-3 text-sm text-white/90">Understand risk zones at a glance.</p>
                    </motion.div>
                    <motion.div animate={{ x: [0, 6, 0] }} transition={{ duration: 3.7, repeat: Infinity, ease: 'easeInOut' }} className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Connected responders</p>
                      <p className="mt-3 text-sm text-white/90">Watch community action build in real time.</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Feature Overview"
              title="All the tools your community needs"
              description="Each feature is designed to reduce confusion, improve awareness, and make emergency response easier to coordinate."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {featureCards.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <Reveal key={feature.title} delay={index * 0.04} className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="rounded-2xl bg-[#113a7a]/10 p-3 text-[#113a7a] transition-colors group-hover:bg-[#E53935]/10 group-hover:text-[#E53935]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <button type="button" className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-[0.22em] text-slate-400 transition-colors group-hover:text-[#E53935]">
                        Learn More
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-slate-950">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
                    <div className="mt-5 space-y-2">
                      {feature.highlights.map((item) => (
                        <p key={item} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          {item}
                        </p>
                      ))}
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Platform Demo"
              title="See Jirani Alert in Action"
              description="A mock dashboard shows how the platform moves from alert to map update to community response."
            />

            <Reveal className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8">
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,#071532_0%,#0f2458_100%)] p-5 text-white shadow-inner sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-100">Demo Mode</p>
                      <h3 className="mt-2 text-2xl font-extrabold">Mock app dashboard animation</h3>
                        <h3 className="mt-2 text-2xl font-extrabold text-white">Mock app dashboard animation</h3>
                    </div>
                    <div className="rounded-2xl bg-white/12 p-3 backdrop-blur">
                      <Smartphone className="h-6 w-6" />
                        <Smartphone className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {[
                      ['Alert appearing', 'A fire alert is submitted nearby', Flame],
                      ['Notification sent', 'Nearby residents are notified', BellRing],
                      ['Map update', 'The live map pin updates instantly', Globe2],
                      ['Community response', 'Responders and users acknowledge the event', Users],
                    ].map(([title, text, Icon], index) => (
                      <motion.div
                        key={title}
                        animate={{ y: [0, index % 2 === 0 ? -5 : 5, 0] }}
                        transition={{ duration: 3.2 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                        className="rounded-2xl bg-white/10 p-4 backdrop-blur"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-white/15 p-3">
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{title}</p>
                              <p className="text-sm font-bold text-white">{title}</p>
                            <p className="text-xs text-blue-50/80">{text}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <button type="button" className="w-full rounded-2xl bg-[#E53935] px-5 py-4 text-left font-bold text-white shadow-[0_18px_40px_rgba(229,57,53,0.28)] transition-transform hover:-translate-y-0.5">
                    Try Demo
                  </button>
                  <button type="button" className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-5 py-4 text-left font-bold text-slate-800 transition-colors hover:bg-white">
                    Watch Walkthrough
                  </button>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">What you will see</p>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <p className="flex items-center gap-2"><Zap className="h-4 w-4 text-[#E53935]" /> Alert sent in seconds</p>
                      <p className="flex items-center gap-2"><BellRing className="h-4 w-4 text-[#E53935]" /> Nearby users notified</p>
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#E53935]" /> Location pinned automatically</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="How It Works"
              title="How features work together"
              description="Every capability supports the next so the experience stays fast and easy to understand."
              align="center"
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-5">
              {timeline.map((item, index) => {
                const Icon = item.icon
                return (
                  <React.Fragment key={item.title}>
                    <Reveal delay={index * 0.05} className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                      <div className="mx-auto rounded-2xl bg-[#113a7a]/10 p-3 text-[#113a7a] w-fit">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-lg font-bold text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                    </Reveal>
                    {index < timeline.length - 1 && (
                      <div className="hidden items-center justify-center lg:flex">
                        <ArrowRight className="h-6 w-6 text-slate-300" />
                      </div>
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <Reveal className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#10254f_0%,#163b82_100%)] p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.16)] sm:p-10">
              <div className="flex items-center gap-3 text-blue-100">
                <MessageCircle className="h-5 w-5" />
                Connected neighborhood illustration
              </div>
              <p className="mt-5 max-w-md text-lg leading-8 text-blue-50/90">
                A fast network of nearby users, live alerts, and coordinated response helps communities know sooner and act faster.
              </p>
            </Reveal>
            <Reveal delay={0.08} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
              <h3 className="text-xl font-bold text-slate-950">Comparison</h3>
              <div className="mt-6 space-y-4">
                {comparisonRows.map((row, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <p className="text-sm font-semibold text-red-900">{row[0]}</p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-sm font-semibold text-emerald-900">{row[1]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  )
}
