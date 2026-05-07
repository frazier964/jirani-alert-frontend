import React, { useEffect, useRef, useState } from 'react'
import Header from '../../components/Header'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  CheckCircle2,
  FileCheck2,
  Flame,
  HeartPulse,
  Instagram,
  Lock,
  Mail,
  Map,
  MapPin,
  Phone,
  Send,
  Shield,
  ShieldCheck,
  Siren,
  Star,
  Twitter,
  Zap,
} from 'lucide-react'

const navItems = [
  { label: 'Home', id: 'home' },
  { label: 'Features', id: 'features' },
  { label: 'How It Works', id: 'how-it-works' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Support', to: '/support' },
]

const features = [
  {
    title: 'Real-Time Alerts',
    description: 'Instant emergency notifications to nearby residents and responders.',
    icon: BellRing,
  },
  {
    title: 'Verified Reports',
    description: 'Community-confirmed incidents reduce misinformation during critical moments.',
    icon: BadgeCheck,
  },
  {
    title: 'Fast Response',
    description: 'Quick responder coordination with clear incident priorities.',
    icon: Zap,
  },
  {
    title: 'Neighborhood Coverage',
    description: 'Location-based alerts ensure relevance by proximity.',
    icon: Map,
  },
  {
    title: 'Secure Platform',
    description: 'Protected access and trusted channels for safety operations.',
    icon: Lock,
  },
  {
    title: 'Live Incident Tracking',
    description: 'Monitor active emergencies from report to resolution.',
    icon: Siren,
  },
]

const steps = [
  {
    title: 'Report Incident',
    description: 'Residents submit verified alerts with location and incident details.',
    icon: FileCheck2,
  },
  {
    title: 'Nearby Users Get Alerted',
    description: 'The system instantly notifies nearby community members and response teams.',
    icon: BellRing,
  },
  {
    title: 'Responders Take Action',
    description: 'Emergency responders coordinate and update status in real time.',
    icon: ShieldCheck,
  },
]

const liveAlerts = [
  {
    title: 'Fire Alert',
    location: 'Westlands - Ring Road',
    status: 'Active',
    color: 'bg-red-500',
    icon: Flame,
  },
  {
    title: 'Medical Emergency',
    location: 'Kilimani - Argwings Kodhek Rd',
    status: 'Responder En Route',
    color: 'bg-emerald-500',
    icon: HeartPulse,
  },
  {
    title: 'Security Threat',
    location: 'South B - Plainsview',
    status: 'Monitoring',
    color: 'bg-amber-500',
    icon: Shield,
  },
]

const stats = [
  { label: 'Active Communities', value: 120, suffix: '+' },
  { label: 'Alerts Sent', value: 32000, suffix: '+' },
  { label: 'Verified Reports', value: 18500, suffix: '+' },
  { label: 'Emergency Responses', value: 9400, suffix: '+' },
]

const testimonials = [
  {
    name: 'Amina Njeri',
    role: 'Resident - Kilimani',
    message:
      'Jirani Alert helped us respond to a building fire in minutes. The updates were clear and verified.',
  },
  {
    name: 'David Otieno',
    role: 'Community Volunteer',
    message:
      'The platform has become our trusted communication line during emergencies in our neighborhood.',
  },
  {
    name: 'Officer Mwangi',
    role: 'Local Responder',
    message:
      'The incident tracking and location details make coordination significantly faster and safer.',
  },
]

function Counter({ target, suffix = '' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!inView) return
    let current = 0
    const duration = 1400
    const frames = 36
    const step = target / frames
    const interval = duration / frames
    const id = setInterval(() => {
      current += step
      if (current >= target) {
        setCount(target)
        clearInterval(id)
      } else {
        setCount(Math.floor(current))
      }
    }, interval)

    return () => clearInterval(id)
  }, [inView, target])

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function Home() {
  const goToSection = (id) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="bg-slate-50 text-slate-900">
      <Header navItems={navItems} initialBg="transparent" scrolledBg="rgba(255,255,255,0.88)" primaryColor="#2563EB" />

      <main>
        <section id="home" className="relative overflow-hidden pt-28 sm:pt-32 pb-16 sm:pb-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(37,99,235,0.2),transparent_32%),radial-gradient(circle_at_85%_5%,rgba(220,38,38,0.16),transparent_28%),linear-gradient(180deg,#eff6ff_0%,#ffffff_45%,#f8fafc_100%)]" />
          <motion.div
            className="absolute top-20 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#2563EB]/20 blur-3xl"
            animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.7, 0.35] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 backdrop-blur border border-blue-100 text-xs font-bold text-[#2563EB]">
                  <ShieldCheck className="h-4 w-4" />
                  Trusted Emergency Network
                </span>
                <h1 className="mt-4 text-4xl sm:text-5xl lg:text-6xl leading-[1.05] font-extrabold text-slate-900">
                  Instant Emergency Alerts for Safer Communities
                </h1>
                <p className="mt-5 text-lg text-slate-600 max-w-xl">
                  Report emergencies, receive verified alerts, and protect your neighborhood in real time.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/signup" className="px-6 py-3 rounded-xl bg-[#2563EB] text-white font-bold shadow-[0_0_18px_rgba(37,99,235,0.45)] hover:shadow-[0_0_28px_rgba(37,99,235,0.6)] transition-all">
                    Get Started
                  </Link>
                  <Link to="/report" className="px-6 py-3 rounded-xl bg-[#DC2626] text-white font-bold shadow-[0_0_18px_rgba(220,38,38,0.35)] hover:shadow-[0_0_28px_rgba(220,38,38,0.55)] transition-all">
                    Report Emergency
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <div className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_30px_80px_rgba(37,99,235,0.22)] p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900">Live Alert Dashboard</h3>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      System Online
                    </span>
                  </div>

                  <div className="mt-5 space-y-3">
                    {liveAlerts.map((alert) => {
                      const Icon = alert.icon
                      return (
                        <div key={alert.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#2563EB]">
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-900">{alert.title}</p>
                                <p className="text-xs text-slate-500 flex min-w-0 items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                                  <span className="truncate">{alert.location}</span>
                                </p>
                              </div>
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${alert.color} animate-pulse`} />
                              {alert.status}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-4 border-y border-blue-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] px-6 py-4 text-white shadow-lg flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-center">
              <span className="inline-flex items-center gap-2 font-bold text-base sm:text-lg">
                <ShieldCheck className="h-5 w-5" />
                Trusted Community Protection
              </span>
              <span className="text-sm sm:text-base text-blue-100">Real-time verified emergency reporting</span>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Powerful Safety Features</h2>
              <p className="mt-3 text-slate-600">Built for speed, trust, and coordinated neighborhood response.</p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.article
                    key={feature.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    whileHover={{ y: -6 }}
                    className="group rounded-2xl border border-white/70 bg-white/70 backdrop-blur p-6 shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.18)] transition-all"
                  >
                    <div className="h-12 w-12 rounded-xl bg-blue-100 text-[#2563EB] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                  </motion.article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">How It Works</h2>
              <p className="mt-3 text-slate-600">A simple 3-step emergency response workflow.</p>
            </div>

            <div className="relative mt-12 grid gap-6 lg:grid-cols-3">
              <div className="hidden lg:block absolute top-16 left-[17%] right-[17%] h-0.5 bg-gradient-to-r from-[#2563EB] via-[#60a5fa] to-[#DC2626]" />
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className="relative rounded-2xl border border-slate-200 bg-slate-50 p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-[#2563EB]">Step {index + 1}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-slate-600 text-sm">{step.description}</p>
                    {index < steps.length - 1 && (
                      <ArrowRight className="hidden lg:block absolute -right-4 top-16 h-6 w-6 text-[#2563EB]" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-slate-800 to-slate-900 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <h2 className="text-3xl font-extrabold text-white">Live Alert Preview</h2>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-400/40 text-emerald-300 text-sm font-semibold">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  Monitoring Incidents
                </span>
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-3">
                {liveAlerts.map((alert) => {
                  const Icon = alert.icon
                  return (
                    <div key={`preview-${alert.title}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-white/10 text-white flex items-center justify-center">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="truncate font-bold text-white">{alert.title}</h3>
                        </div>
                        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-slate-200">
                          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${alert.color} animate-pulse`} />
                          {alert.status}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-slate-300 flex min-w-0 items-center gap-1.5">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{alert.location}</span>
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Community Impact</h2>
              <p className="mt-3 text-slate-600">Measured outcomes from connected, prepared neighborhoods.</p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center"
                >
                  <div className="text-3xl font-extrabold text-[#2563EB]">
                    <Counter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">What Communities Say</h2>
              <p className="mt-3 text-slate-600">Trusted by residents, volunteers, and local responders.</p>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {testimonials.map((testimonial, idx) => (
                <motion.article
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={`${testimonial.name}-${i}`} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-4 text-slate-700">"{testimonial.message}"</p>
                  <div className="mt-5">
                    <p className="font-bold text-slate-900">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-r from-[#1d4ed8] to-[#2563EB] p-8 sm:p-12 text-white text-center shadow-[0_24px_60px_rgba(37,99,235,0.35)]">
              <h2 className="text-3xl sm:text-4xl font-extrabold">Protect Your Neighborhood Today</h2>
              <p className="mt-3 text-blue-100 max-w-2xl mx-auto">
                Join a growing safety network where trusted reporting and rapid response keep communities secure.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/signup" className="px-6 py-3 rounded-xl bg-white text-[#2563EB] font-bold hover:translate-y-[-1px] transition-transform">
                  Join Jirani Alert
                </Link>
                <button type="button" onClick={() => goToSection('features')} className="px-6 py-3 rounded-xl border border-white/60 text-white font-bold hover:bg-white/10 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="bg-slate-950 text-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3">
                <img src="/jirani-alert-logo.svg" alt="Jirani Alert" className="h-10 w-10 rounded-full" />
                <p className="font-bold tracking-wide">JIRANI ALERT</p>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                A neighborhood emergency response platform connecting communities with verified alerts and local responders.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white">Quick Links</h3>
              <div className="mt-4 flex flex-col gap-2 text-sm">
                {navItems.map((item) => (
                  item.to ? (
                    <Link key={`footer-${item.label}`} to={item.to} className="text-left text-slate-400 hover:text-white">
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={`footer-${item.id}`}
                      type="button"
                      onClick={() => goToSection(item.id)}
                      className="text-left text-slate-400 hover:text-white"
                    >
                      {item.label}
                    </button>
                  )
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white">Contact Info</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-400">
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" /> jiranisupport@gmail.com</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> +254 700 123 456</p>
                <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Nairobi, Kenya</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white">Follow Us</h3>
              <div className="mt-4 flex items-center gap-3">
                <a href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2563EB] transition-colors" aria-label="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2563EB] transition-colors" aria-label="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#2563EB] transition-colors" aria-label="Send">
                  <Send className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-slate-800 text-sm text-slate-500 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Jirani Alert. All rights reserved.</p>
            <p className="inline-flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Real-time verified emergency reporting
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
