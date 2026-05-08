import React from 'react'
import { AlertTriangle, CheckCircle2, Flame, HeartPulse, LifeBuoy, Phone, Shield, Siren } from 'lucide-react'

const contacts = [
  { name: 'Police Emergency', phone: '999', detail: 'Security threats and urgent police response', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
  { name: 'Ambulance', phone: '112', detail: 'Medical emergencies and urgent health support', icon: HeartPulse, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { name: 'Fire Response', phone: '911', detail: 'Fire, smoke, and rescue emergencies', icon: Flame, color: 'text-red-600', bg: 'bg-red-50' },
]

const tips = [
  'Stay calm and move to a safe location before reporting an incident.',
  'Share clear location details, landmarks, and the emergency type.',
  'Do not put yourself in danger to take photos or videos.',
  'Keep your emergency contacts and phone number updated.',
  'Follow instructions from verified responders and official authorities.',
]

const readiness = [
  'Save local emergency numbers',
  'Enable location access for faster alerts',
  'Keep your phone charged when travelling',
  'Review nearby exits in buildings',
]

export default function EmergencyContacts() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#1E3A5F_0%,#2563EB_58%,#E53935_100%)] p-6 text-white shadow-[0_24px_70px_rgba(30,58,95,0.22)] sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em]">
                <LifeBuoy className="h-4 w-4" />
                Safety Tips
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                Emergency Contacts and Safety Guidance
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">
                Keep essential contacts close and follow simple safety steps before, during, and after an incident.
              </p>
            </div>
            <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#E53935]">
                  <Siren className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Quick Reminder</p>
                  <p className="text-xs text-blue-50">For life-threatening emergencies, contact official responders immediately.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {contacts.map((contact) => {
            const Icon = contact.icon
            return (
              <article key={contact.name} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${contact.bg} ${contact.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-black text-slate-950">{contact.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{contact.detail}</p>
                <a href={`tel:${contact.phone}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800">
                  <Phone className="h-4 w-4" />
                  Call {contact.phone}
                </a>
              </article>
            )
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h2 className="text-2xl font-black text-slate-950">What To Do During An Emergency</h2>
            </div>
            <div className="mt-6 space-y-3">
              {tips.map((tip) => (
                <div key={tip} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm leading-6 text-slate-700">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] sm:p-7">
            <h2 className="text-2xl font-black text-slate-950">Preparedness Checklist</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Small habits that make alerts and response smoother.</p>
            <div className="mt-6 space-y-3">
              {readiness.map((item) => (
                <label key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-semibold text-slate-700">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]" />
                  {item}
                </label>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
