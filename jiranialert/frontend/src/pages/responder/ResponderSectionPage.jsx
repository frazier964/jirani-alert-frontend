import React from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Bell,
  FileText,
  LayoutDashboard,
  HelpCircle,
  ShieldCheck,
  Users,
  Settings2,
} from 'lucide-react'
import ResponderCommandBar from '../../components/Layout/ResponderCommandBar'
import Avatar from '../../components/UI/Avatar'
import { getCurrentUser, getPreferredUserName } from '../../lib/auth'

const sectionAliases = {
  dashboard: 'dashboard',
  incidents: 'incidents',
  reports: 'reports',
  equipment: 'equipment',
  'team-members': 'team-members',
  settings: 'settings',
  'help-support': 'help-support',
}

const sectionMeta = {
  incidents: {
    title: 'Incidents',
    subtitle: 'View and manage incidents',
    icon: AlertTriangle,
    cards: [
      ['Warehouse smoke escalation', 'Westlands · Critical · 2m ago'],
      ['Medical triage update', 'Kilimani · High · 8m ago'],
      ['Perimeter breach report', 'South B · Medium · 14m ago'],
    ],
  },
  reports: {
    title: 'Reports',
    subtitle: 'View and manage reports',
    icon: FileText,
    cards: [
      ['Active reports', '23 open incident reports'],
      ['Verified reports', '18 confirmed after review'],
      ['Escalated reports', '5 waiting for follow-up'],
    ],
  },
  equipment: {
    title: 'Equipment',
    subtitle: 'Track and maintain gear',
    icon: ShieldCheck,
    cards: [
      ['Ambulance kit 12', 'Ready · Last service 4 days ago'],
      ['Fire helmet set', 'In use · Safety check due tomorrow'],
      ['Radio pack 04', 'Ready · Battery 93%'],
      ['Drone battery bank', 'Charging · 2 units online'],
    ],
  },
  'team-members': {
    title: 'Team Members',
    subtitle: 'Contacts and roles',
    icon: Users,
    cards: [
      ['Amina Otieno', 'Lead responder · +254 700 000 001'],
      ['Brian Karanja', 'Dispatch operator · +254 700 000 002'],
      ['Grace Wanjiku', 'Field medic · +254 700 000 003'],
    ],
  },
  settings: {
    title: 'Settings',
    subtitle: 'Notifications and preferences',
    icon: Settings2,
    cards: [
      ['Notifications', 'Set alert sounds and delivery'],
      ['Password', 'Update account password'],
      ['Privacy', 'Control profile visibility'],
      ['Language', 'Set preferred interface language'],
    ],
  },
  'help-support': {
    title: 'Help / Support',
    subtitle: 'FAQs and contact support',
    icon: HelpCircle,
    cards: [
      ['FAQs', 'How to use the responder dashboard'],
      ['Tutorials', 'Short guides for field workflows'],
      ['Contact support', 'Reach the admin help desk'],
    ],
  },
}

const navItems = [
  { label: 'Dashboard', to: '/responder/dashboard', icon: LayoutDashboard },
  { label: 'Incidents', to: '/responder/incidents', icon: AlertTriangle },
  { label: 'Reports', to: '/responder/reports', icon: FileText },
  { label: 'Equipment', to: '/responder/equipment', icon: ShieldCheck },
  { label: 'Team Members', to: '/responder/team-members', icon: Users },
  { label: 'Settings', to: '/responder/settings', icon: Settings2 },
  { label: 'Help/Support', to: '/responder/help-support', icon: HelpCircle },
]

export default function ResponderSectionPage() {
  const { section } = useParams()
  const resolvedSection = sectionAliases[String(section || '').toLowerCase()] || null

  if (!resolvedSection) {
    return <Navigate to="/responder/dashboard" replace />
  }

  if (resolvedSection === 'dashboard') {
    return <Navigate to="/responder/dashboard" replace />
  }

  const currentUser = getCurrentUser() || {}
  const meta = sectionMeta[resolvedSection]
  const Icon = meta.icon

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <ResponderCommandBar />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <section className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-red-300">{meta.subtitle}</p>
                <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">{meta.title}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
                  {resolvedSection === 'settings'
                    ? 'Manage responder controls, alerts, and access settings from a dedicated page.'
                    : `Focused view for ${meta.title.toLowerCase()} so each menu action opens its own page.`}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-cyan-200">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {meta.cards.map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-sm font-bold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-300">{text}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="grid gap-4">
            <div className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Quick access</p>
              <div className="mt-4 grid gap-2">
                {navItems.map((item) => {
                  const ItemIcon = item.icon
                  const active = item.to === `/responder/${resolvedSection}`
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${active ? 'bg-[#E53935] text-white' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
                    >
                      <span className="flex items-center gap-3">
                        <ItemIcon className="h-4 w-4" />
                        {item.label}
                      </span>
                      <ChevronRightIcon />
                    </Link>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Signed in as</p>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                <Avatar src={currentUser.profileImageUrl} alt={getPreferredUserName(currentUser) || 'Emergency Responder'} size={44} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">{getPreferredUserName(currentUser) || 'Emergency Responder'}</p>
                  <p className="truncate text-xs text-slate-400">Emergency Responder</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

function ChevronRightIcon() {
  return <span className="text-slate-500">›</span>
}