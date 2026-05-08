import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/Header'
import { AlertTriangle, CheckCircle2, FileText, Lock, ShieldCheck } from 'lucide-react'

const navItems = [
  { label: 'Home', to: '/home' },
  { label: 'Features', to: '/features' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Support', to: '/support' },
]

const terms = [
  {
    title: 'Platform Use',
    icon: ShieldCheck,
    text: 'Jirani Alert is provided to help communities share emergency information quickly. Users must submit accurate reports and avoid false, misleading, or abusive content.',
  },
  {
    title: 'Account Responsibility',
    icon: Lock,
    text: 'You are responsible for keeping your account details secure and for all activity that happens through your account.',
  },
  {
    title: 'Emergency Disclaimer',
    icon: AlertTriangle,
    text: 'Jirani Alert does not replace official emergency services. For life-threatening situations, contact local emergency responders immediately.',
  },
  {
    title: 'Content and Reports',
    icon: FileText,
    text: 'Reports, messages, and updates may be reviewed to protect community safety, improve reliability, and respond to misuse.',
  },
]

export default function Terms() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header
        navItems={navItems}
        initialBg="rgba(255,255,255,0.84)"
        scrolledBg="rgba(255,255,255,0.94)"
        primaryColor="#2563EB"
      />

      <main className="pt-32">
        <section className="bg-[linear-gradient(135deg,#0f2458_0%,#163b82_58%,#2563eb_100%)] px-4 py-20 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-black uppercase tracking-[0.24em] text-blue-100">Legal</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">
              Terms and Conditions
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50/90">
              Please read these terms before using Jirani Alert. They explain acceptable platform use, account responsibilities, and safety expectations.
            </p>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
            {terms.map((item) => {
              const Icon = item.icon
              return (
                <article key={item.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2563EB]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-xl font-bold text-slate-950">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </article>
              )
            })}
          </div>

          <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
            <p className="flex items-start gap-3 text-sm leading-7">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
              Continued use of Jirani Alert means you agree to these terms and any updates posted on this page.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-bold text-slate-900">Jirani Alert &copy; 2026</p>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
            <Link to="/contact" className="transition-colors hover:text-[#153b82]">Contact</Link>
            <Link to="/privacy" className="transition-colors hover:text-[#153b82]">Privacy Policy</Link>
            <Link to="/support" className="transition-colors hover:text-[#153b82]">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
