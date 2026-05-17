import React from 'react'
import Header from '../../components/Header'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BellRing,
  CalendarCheck2,
  Gauge,
  Globe2,
  MapPin,
  Megaphone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'

const storySteps = [
  {
    title: 'Problem Identified',
    description: 'Communities needed a faster way to share urgent incidents before damage spread.',
    icon: BellRing,
  },
  {
    title: 'Platform Designed',
    description: 'Jirani Alert was built to make reporting simple, calm, and accessible on mobile.',
    icon: Smartphone,
  },
  {
    title: 'Community Connected',
    description: 'Residents, responders, and local administrators coordinate from one trusted system.',
    icon: Users,
  },
  {
    title: 'Safer Neighborhoods',
    description: 'Clear alerts and faster response help reduce confusion during critical moments.',
    icon: ShieldCheck,
  },
]

const values = [
  { title: 'Trust', icon: ShieldCheck, description: 'Reliable emergency communication that people can depend on.' },
  { title: 'Speed', icon: Zap, description: 'Rapid alert delivery when every second matters.' },
  { title: 'Community', icon: Users, description: 'Neighborhood collaboration that improves collective safety.' },
  { title: 'Safety', icon: ShieldCheck, description: 'Technology that helps protect lives and reduce risk.' },
]

const steps = [
  { title: 'Detect Emergency', description: 'Users report incidents instantly with location and key details.', icon: MapPin },
  { title: 'Alert Community', description: 'Nearby residents receive immediate notifications.', icon: Megaphone },
  { title: 'Notify Responders', description: 'Relevant authorities are informed with actionable context.', icon: ShieldCheck },
  { title: 'Improve Response Time', description: 'Communities act faster and responders reach incidents sooner.', icon: Gauge },
]

const features = [
  { title: 'Real-Time Alerts', description: 'Instant notifications that reach the right people quickly.', icon: BellRing },
  { title: 'Location Detection', description: 'Accurate pinpointing for faster incident coordination.', icon: MapPin },
  { title: 'Smart Notifications', description: 'Relevant nearby alerts without unnecessary noise.', icon: Globe2 },
  { title: 'Secure Reporting', description: 'Protected user data with a focus on trust and privacy.', icon: ShieldCheck },
]

const stats = [
  { label: 'Alerts Reported', value: '1,200+' },
  { label: 'Residents Connected', value: '5,000+' },
  { label: 'Communities Protected', value: '300+' },
  { label: 'Faster Awareness', value: '98%' },
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

function Metric({ value, label }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-6 text-center backdrop-blur-xl">
      <div className="text-3xl font-black text-white drop-shadow sm:text-4xl">{value}</div>
      <p className="mt-2 text-sm font-semibold text-slate-200">{label}</p>
    </div>
  )
}

export default function About() {
  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
      <Header
        navItems={[
          { label: 'Home', to: '/home' },
          { label: 'Features', to: '/features' },
          { label: 'How It Works', id: 'how-it-works' },
          { label: 'About', to: '/about' },
          { label: 'Contact', to: '/contact' },
          { label: 'Support', to: '/support' },
        ]}
        initialBg="transparent"
        scrolledBg="rgba(15,36,88,0.94)"
        primaryColor="#153b82"
        textColor="text-white"
      />
      <main className="overflow-hidden">
        <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#0f2458_0%,#153b82_45%,#ffffff_45%,#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,57,53,0.18),transparent_26%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.18),transparent_20%),radial-gradient(circle_at_20%_85%,rgba(255,255,255,0.18),transparent_18%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="space-y-6 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-[#ffb4b0]" />
                Community-centered civic safety platform
              </div>
              <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Keeping Communities Safe, Connected, and Informed
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-blue-50/90 sm:text-xl">
                Jirani Alert empowers neighborhoods with real-time emergency reporting and instant community alerts.
                It helps people act faster, communicate clearly, and protect one another when it matters most.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[#153b82] shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/report" className="inline-flex items-center gap-2 rounded-full bg-[#E53935] px-6 py-3 font-bold text-white shadow-[0_18px_40px_rgba(229,57,53,0.3)] transition-transform hover:-translate-y-0.5">
                  Report Emergency
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.65, delay: 0.1 }} className="relative">
              <div className="rounded-[2rem] border border-white/50 bg-white/85 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.2)] backdrop-blur-2xl sm:p-6">
                <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,#0f2458_0%,#163b82_56%,#1f6bda_100%)] p-5 text-white shadow-inner">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-100">Emergency Network</p>
                      <h3 className="mt-2 text-2xl font-extrabold">Fast, calm, reliable communication</h3>
                    </div>
                    <div className="rounded-2xl bg-white/12 p-3 backdrop-blur">
                      <ShieldCheck className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Live Alerts</p>
                      <p className="mt-3 text-sm text-white/90">Mobile notifications reach nearby residents in seconds.</p>
                    </div>
                    <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Safety Focus</p>
                      <p className="mt-3 text-sm text-white/90">Clear location data helps responders act with confidence.</p>
                    </div>
                    <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Map Pins</p>
                      <p className="mt-3 text-sm text-white/90">Incident locations are easy to understand at a glance.</p>
                    </div>
                    <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Connected Users</p>
                      <p className="mt-3 text-sm text-white/90">Residents and responders stay informed together.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                        <Smartphone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Mobile-first reporting</p>
                        <p className="text-xs text-slate-500">Designed for fast action under stress</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-red-100 p-3 text-[#E53935]">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Emergency response ready</p>
                        <p className="text-xs text-slate-500">Immediate reporting to the right people</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Creator"
              title="About the Creator"
              description="Meet the person who built Jirani Alert."
              align="center"
            />

            <div className="mt-10 grid gap-6 md:grid-cols-3 items-center">
              <div className="md:col-span-1 flex justify-center">
                <div className="h-36 w-36 rounded-full border border-slate-200 bg-white p-1 shadow-lg sm:h-40 sm:w-40">
                  <img
                    src="/creator-photo.jpg"
                    alt="Hillary Ocharo"
                    loading="eager"
                    decoding="async"
                    className="h-full w-full rounded-full object-cover object-center"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-xl font-extrabold text-slate-900">Hillary Ocharo</h3>
                <p className="mt-2 text-sm text-slate-600">Creator & Lead Engineer</p>
                <p className="mt-4 text-sm text-slate-700">Hillary Ocharo is the creator of Jirani Alert — a community-first emergency notification platform focused on timely, trustworthy communication during critical events. For inquiries or collaboration, reach out via email.</p>
                <p className="mt-4 text-sm font-semibold text-[#153b82]">Email: mablaryyvisuals@gmail.com</p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Our Story"
              title="Why Jirani Alert Was Created"
              description="Jirani Alert was built to bridge the communication gap during emergencies. In many communities, delays in sharing emergency information can lead to preventable harm. Our platform ensures residents can instantly notify nearby people and responders when urgent situations arise."
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-4">
              {storySteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.06 }}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] transition-transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="rounded-2xl bg-[#E53935]/10 p-3 text-[#E53935]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.24em] text-slate-400">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-slate-950">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#E53935]">Mission</p>
              <h3 className="mt-3 text-3xl font-extrabold text-slate-950">Our Mission</h3>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                To provide communities with fast, reliable emergency communication tools that save time and improve response coordination.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                <CalendarCheck2 className="h-4 w-4 text-[#E53935]" />
                Built for immediate action
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }} className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-[#102857] to-[#173d85] p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">Vision</p>
              <h3 className="mt-3 text-3xl font-extrabold">Our Vision</h3>
              <p className="mt-4 text-lg leading-8 text-blue-50/90">
                A future where every neighborhood is connected through technology that protects lives.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur">
                <Globe2 className="h-4 w-4 text-blue-200" />
                Safer communities, connected everywhere
              </div>
            </motion.div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="How It Works"
              title="A Simple Flow Built for Stressful Moments"
              description="The platform is designed to reduce friction so people can report emergencies in just a few steps."
              align="center"
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.45, delay: index * 0.05 }}
                    className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="rounded-2xl bg-[#153b82]/10 p-3 text-[#153b82] transition-colors group-hover:bg-[#E53935]/10 group-hover:text-[#E53935]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-black text-slate-300">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-slate-950">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{step.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Core Values"
              title="Principles That Shape the Platform"
              description="Every design decision is built around trust, speed, community, and safety."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition-transform hover:-translate-y-1"
                  >
                    <div className="w-fit rounded-2xl bg-slate-100 p-3 text-[#E53935]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-950">{value.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{value.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-[#0b1d43] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <Metric key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Platform Features"
              title="Meet the Platform"
              description="A professional feature set built for clarity, confidence, and rapid emergency coordination."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(15,23,42,0.1)]"
                  >
                    <div className="w-fit rounded-2xl bg-[#153b82]/10 p-3 text-[#153b82]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-slate-950">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{feature.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }} className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#153b82_0%,#0f2458_100%)] p-8 text-center text-white shadow-[0_28px_80px_rgba(15,23,42,0.16)] sm:p-12">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Be Part of a Safer Community</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-blue-50/90 sm:text-lg">
                Join Jirani Alert and help create faster, smarter emergency response networks.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/signup" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[#153b82] transition-transform hover:-translate-y-0.5">
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/features" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-6 py-3 font-bold text-white backdrop-blur transition-colors hover:bg-white/15">
                  Explore Features
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Jirani Alert © 2026</p>
            <p className="mt-1 text-sm text-slate-500">Building safer communities through technology.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
            <Link to="/about" className="transition-colors hover:text-[#153b82]">About</Link>
            <Link to="/contact" className="transition-colors hover:text-[#153b82]">Contact</Link>
            <Link to="/privacy" className="transition-colors hover:text-[#153b82]">Privacy Policy</Link>
            <Link to="/support" className="transition-colors hover:text-[#153b82]">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}