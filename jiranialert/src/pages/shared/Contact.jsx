import React, { useState } from 'react'
import Header from '../../components/Header'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BellRing,
  CheckCircle2,
  ChevronDown,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  ShieldAlert,
  Sparkles,
  Wrench,
  X,
  Zap,
} from 'lucide-react'

const contactCards = [
  { title: 'General Support', icon: MessageSquare, detail: 'help@jiranialert.com', description: 'For account support and general questions.' },
  { title: 'Emergency Coordination', icon: ShieldAlert, detail: 'emergency@jiranialert.com', description: 'Urgent platform-related emergency reporting issues.' },
  { title: 'Technical Assistance', icon: Wrench, detail: 'tech@jiranialert.com', description: 'Bug reports and platform issues.' },
  { title: 'Phone Support', icon: Phone, detail: '+254 XXX XXX XXX', description: 'Available 24/7' },
]

const faqs = [
  { q: 'How do I report an emergency?', a: 'Open the emergency reporting page, choose the incident type, share your location, and submit the alert.' },
  { q: 'How are alerts verified?', a: 'Alerts are reviewed using the incident details, location context, and community signal to reduce misinformation.' },
  { q: 'Can I change my notification settings?', a: 'Yes. Notification preferences can be adjusted from your account once signed in.' },
  { q: 'Is my location private?', a: 'Your data is handled with security controls and location is shared only when needed for the alert workflow.' },
  { q: 'How quickly are alerts delivered?', a: 'Alerts are designed to be delivered in near real time to nearby users and responders.' },
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
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.45, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function FaqItem({ item, open, onToggle }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="text-base font-bold text-slate-900 sm:text-lg">{item.q}</span>
        <ChevronDown className={`h-5 w-5 shrink-0 text-[#E53935] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-5 pb-5"
          >
            <p className="text-sm leading-7 text-slate-600">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
    priority: 'Normal',
  })
  const [openFaq, setOpenFaq] = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const nextErrors = {}
    if (!formData.fullName.trim()) nextErrors.fullName = 'Full name is required.'
    if (!formData.email.trim()) nextErrors.email = 'Email address is required.'
    if (!formData.message.trim()) nextErrors.message = 'Please include a short message.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSuccess('')
    if (!validate()) return

    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 900))
    setLoading(false)
    setSuccess('Your message has been sent successfully.')
    setFormData({ fullName: '', email: '', subject: 'General Inquiry', message: '', priority: 'Normal' })
  }

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
        scrolledBg="rgba(12,31,73,0.94)"
        primaryColor="#113a7a"
        textColor="text-white"
      />
      <main className="overflow-hidden">
        <section className="relative isolate overflow-hidden bg-[linear-gradient(135deg,#0c1f49_0%,#113a7a_45%,#ffffff_45%,#ffffff_100%)] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,57,53,0.18),transparent_24%),radial-gradient(circle_at_80%_15%,rgba(59,130,246,0.2),transparent_22%),radial-gradient(circle_at_18%_82%,rgba(255,255,255,0.15),transparent_16%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
            <Reveal className="space-y-6 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-xl">
                <Sparkles className="h-4 w-4 text-[#ffb4b0]" />
                Professional support for every community
              </div>
              <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                We’re Here to Help
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-blue-50/90 sm:text-xl">
                Reach out to the Jirani Alert team for support, feedback, or assistance.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <a href="#contact-form" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-bold text-[#113a7a] shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-transform hover:-translate-y-0.5">
                  Send Message
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#faqs" className="inline-flex items-center gap-2 rounded-full bg-[#E53935] px-6 py-3 font-bold text-white shadow-[0_18px_40px_rgba(229,57,53,0.28)] transition-transform hover:-translate-y-0.5">
                  View FAQs
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="relative">
              <div className="rounded-[2rem] border border-white/50 bg-white/85 p-4 shadow-[0_28px_80px_rgba(15,23,42,0.2)] backdrop-blur-2xl sm:p-6">
                <div className="rounded-[1.75rem] bg-[linear-gradient(180deg,#0c1f49_0%,#163b82_52%,#1f6bda_100%)] p-5 text-white shadow-inner">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-100">Support Network</p>
                      <h3 className="mt-2 text-2xl font-extrabold">Chat bubbles and emergency coordination</h3>
                    </div>
                    <div className="rounded-2xl bg-white/12 p-3 backdrop-blur">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Chat bubbles</p>
                      <p className="mt-3 text-sm text-white/90">Support conversations are clear and easy to start.</p>
                    </div>
                    <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Agent icons</p>
                      <p className="mt-3 text-sm text-white/90">Friendly support identities make communication simple.</p>
                    </div>
                    <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Emergency graphics</p>
                      <p className="mt-3 text-sm text-white/90">Escalations remain calm, visible, and trustworthy.</p>
                    </div>
                    <div className="rounded-2xl bg-white/12 p-4 backdrop-blur">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100">Support response</p>
                      <p className="mt-3 text-sm text-white/90">Issues are routed to the right team quickly.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {contactCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <Reveal key={card.title} delay={index * 0.04} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
                    <div className="rounded-2xl bg-[#113a7a]/10 p-3 text-[#113a7a] w-fit">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-slate-950">{card.title}</h3>
                    <p className="mt-2 text-sm font-semibold text-[#E53935]">{card.detail}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{card.description}</p>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        <section id="contact-form" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl">
            <Reveal className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-8">
              <SectionTitle
                eyebrow="Contact Form"
                title="Send Us a Message"
                description="Tell us what you need and our team will get back to you as soon as possible."
                align="center"
              />

              <form onSubmit={handleSubmit} className="mt-10 space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="fullName">Full Name</label>
                    <input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all focus:border-[#113a7a] focus:ring-2 focus:ring-[#113a7a]/20"
                      placeholder="Full Name"
                    />
                    {errors.fullName && <p className="mt-2 text-sm text-[#E53935]">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all focus:border-[#113a7a] focus:ring-2 focus:ring-[#113a7a]/20"
                      placeholder="Email Address"
                    />
                    {errors.email && <p className="mt-2 text-sm text-[#E53935]">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-slate-700" htmlFor="subject">Subject</label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all focus:border-[#113a7a] focus:ring-2 focus:ring-[#113a7a]/20"
                    >
                      {['General Inquiry', 'Technical Support', 'Emergency Assistance', 'Feedback', 'Partnership Request'].map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Priority Level</label>
                    <div className="mt-2 grid gap-2 sm:grid-cols-3">
                      {['Normal', 'Important', 'Urgent'].map((item) => (
                        <label key={item} className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${formData.priority === item ? 'border-[#113a7a] bg-blue-50 text-[#113a7a]' : 'border-slate-300 bg-white text-slate-700'}`}>
                          <span>{item}</span>
                          <input type="radio" name="priority" value={item} checked={formData.priority === item} onChange={handleChange} className="h-4 w-4 text-[#E53935]" />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="mt-2 w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 outline-none transition-all focus:border-[#113a7a] focus:ring-2 focus:ring-[#113a7a]/20"
                    placeholder="How can we assist you?"
                  />
                  {errors.message && <p className="mt-2 text-sm text-[#E53935]">{errors.message}</p>}
                </div>

                {success && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                    {success}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(90deg,#e53935_0%,#ef4444_55%,#b91c1c_100%)] px-6 py-4 font-extrabold text-white shadow-[0_18px_40px_rgba(229,57,53,0.28)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_22px_55px_rgba(229,57,53,0.35)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                  <Zap className="h-4 w-4 group-hover:animate-pulse" />
                </button>
              </form>
            </Reveal>
          </div>
        </section>

        <section id="faqs" className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="FAQ Quick Help"
              title="Quick answers to common questions"
              description="Tap a question to expand the answer."
              align="center"
            />

            <div className="mt-10 grid gap-3 lg:grid-cols-2">
              {faqs.map((item, index) => (
                <Reveal key={item.q} delay={index * 0.04}>
                  <FaqItem item={item} open={openFaq === index} onToggle={() => setOpenFaq(openFaq === index ? -1 : index)} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
            <Reveal className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <div className="h-full bg-[radial-gradient(circle_at_top_left,rgba(229,57,53,0.16),transparent_26%),linear-gradient(135deg,#0f2458_0%,#153b82_100%)] p-8 text-white sm:p-10">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">Operations Center</p>
                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Our Operations Center</h2>
                <div className="mt-6 rounded-[1.5rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold">Nairobi, Kenya</p>
                      <p className="mt-2 text-sm leading-7 text-blue-50/90">Supporting safer communities through real-time emergency communication.</p>
                    </div>
                    <div className="rounded-2xl bg-white/12 p-3">
                      <MapPin className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="mt-5 h-52 rounded-[1.25rem] border border-dashed border-white/20 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.35),transparent_20%),radial-gradient(circle_at_70%_55%,rgba(255,255,255,0.25),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))]" />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] sm:p-10">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#E53935]">Hours</p>
              <h3 className="mt-3 text-3xl font-extrabold text-slate-950">Operating Hours</h3>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">24/7 Emergency Monitoring</p>
                  <p className="mt-1 text-sm text-slate-600">Support Hours: Always available for emergency system assistance</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-900">General inquiries</p>
                  <p className="mt-1 text-sm text-slate-600">Mon – Fri, 8AM – 6PM</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <Reveal className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)] sm:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#E53935]">Social Connect</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Stay connected for platform updates and safety awareness.</h2>
                </div>
                <div className="flex items-center gap-3">
                  <a href="#" className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#113a7a] transition-transform hover:-translate-y-0.5">
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a href="#" className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#113a7a] transition-transform hover:-translate-y-0.5">
                    <Instagram className="h-5 w-5" />
                  </a>
                  <a href="#" className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#113a7a] transition-transform hover:-translate-y-0.5">
                    <X className="h-5 w-5" />
                  </a>
                  <a href="#" className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-[#113a7a] transition-transform hover:-translate-y-0.5">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            <Reveal className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.05)] sm:p-8">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                  <X className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-950">Jirani Alert is a community emergency notification platform.</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    For life-threatening emergencies, contact official emergency responders immediately.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl">
            <Reveal className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#153b82_0%,#0f2458_100%)] p-8 text-center text-white shadow-[0_28px_80px_rgba(15,23,42,0.16)] sm:p-12">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Together, We Build Safer Communities</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-blue-50/90 sm:text-lg">
                Reach out and let us help improve your emergency response experience.
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
            </Reveal>
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
            <Link to="/privacy" className="transition-colors hover:text-[#153b82]">Privacy Policy</Link>
            <Link to="/support" className="transition-colors hover:text-[#153b82]">Support</Link>
            <Link to="/terms" className="transition-colors hover:text-[#153b82]">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
