import {
  Activity,
  AlertTriangle,
  Bell,
  BookOpen,
  Building2,
  ClipboardList,
  FileText,
  HelpCircle,
  HeartPulse,
  LayoutDashboard,
  Map,
  Megaphone,
  MessageSquare,
  Radio,
  Settings2,
  ShieldCheck,
  Truck,
  Users,
  UserCircle2,
  Wrench,
} from 'lucide-react'

export const workspaceLinks = [
  { label: 'Active Incidents', to: '/responder/incidents', icon: AlertTriangle },
  { label: 'Assigned Incidents', to: '/responder/assigned', icon: ClipboardList },
  { label: 'Incident Details', to: '/responder/incidents/latest', icon: FileText },
  { label: 'Incident Map', to: '/responder/map', icon: Map },
  { label: 'Dispatch Center', to: '/responder/dispatch', icon: Radio },
  { label: 'Communications', to: '/responder/communications', icon: MessageSquare },
  { label: 'Residents', to: '/responder/residents', icon: Users },
  { label: 'Team Members', to: '/responder/team', icon: ShieldCheck },
  { label: 'Equipment', to: '/responder/equipment', icon: Truck },
  { label: 'Reports', to: '/responder/reports', icon: FileText },
  { label: 'Analytics', to: '/responder/analytics', icon: Activity },
  { label: 'Resources', to: '/responder/resources', icon: BookOpen },
  { label: 'Announcements', to: '/responder/announcements', icon: Megaphone },
]

export const accountLinks = [
  { label: 'Profile', to: '/responder/profile', icon: UserCircle2 },
  { label: 'Settings', to: '/responder/settings', icon: Settings2 },
  { label: 'Notifications', to: '/responder/notifications', icon: Bell },
  { label: 'Help & Support', to: '/responder/help', icon: HelpCircle },
]

export const dashboardLink = { label: 'Dashboard', to: '/responder/dashboard', icon: LayoutDashboard }

export const severityStyles = {
  Critical: 'border-red-200 bg-red-50 text-red-700',
  High: 'border-orange-200 bg-orange-50 text-orange-700',
  Medium: 'border-amber-200 bg-amber-50 text-amber-700',
  Low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

export const statusStyles = {
  Pending: 'border-slate-200 bg-slate-50 text-slate-700',
  Active: 'border-red-200 bg-red-50 text-red-700',
  Monitoring: 'border-amber-200 bg-amber-50 text-amber-700',
  Accepted: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  Assigned: 'border-blue-200 bg-blue-50 text-blue-700',
  'En Route': 'border-cyan-200 bg-cyan-50 text-cyan-700',
  'Responder En Route': 'border-cyan-200 bg-cyan-50 text-cyan-700',
  'On Scene': 'border-amber-200 bg-amber-50 text-amber-700',
  Stabilized: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Cancelled: 'border-slate-200 bg-slate-50 text-slate-700',
  Rejected: 'border-slate-200 bg-slate-50 text-slate-700',
}

export const fallbackIncidents = [
  {
    id: 'training-fire-westlands',
    type: 'Fire',
    title: 'Warehouse smoke escalation',
    location: 'Westlands Industrial Lane',
    description: 'Smoke reported from a storage unit. Nearby residents are being moved away from the perimeter.',
    severity: 'Critical',
    status: 'Active',
    distance: '2.4 km',
    eta: '5 min',
    reporterEmail: 'resident@jiranialert.local',
    createdAt: 'Training feed',
    gps: '-1.2676, 36.8108',
    victim: 'Two occupants possibly inside',
  },
  {
    id: 'training-medical-kilimani',
    type: 'Medical',
    title: 'Chest pain welfare call',
    location: 'Kilimani Block C',
    description: 'Resident reports severe chest pain and dizziness. Family member is on site.',
    severity: 'High',
    status: 'Pending',
    distance: '4.1 km',
    eta: '8 min',
    reporterEmail: 'anonymous',
    createdAt: 'Training feed',
    gps: '-1.2921, 36.7820',
    victim: 'Adult male, conscious',
  },
  {
    id: 'training-security-southb',
    type: 'Security',
    title: 'Suspicious activity near gate',
    location: 'South B Estate',
    description: 'Community watch flagged a perimeter breach near the east vehicle entrance.',
    severity: 'Medium',
    status: 'Assigned',
    assignmentStatus: 'Assigned',
    distance: '6.8 km',
    eta: '12 min',
    reporterEmail: 'watch@southb.local',
    createdAt: 'Training feed',
    gps: '-1.3208, 36.8422',
    victim: 'No injuries reported',
  },
]

export const responderUnits = [
  { id: 'AMB-12', name: 'Ambulance Unit 12', status: 'Available', crew: '2 medics', specialty: HeartPulse },
  { id: 'FIR-04', name: 'Fire Engine 4', status: 'En Route', crew: '5 firefighters', specialty: Truck },
  { id: 'POL-07', name: 'Police Patrol 7', status: 'Holding', crew: '3 officers', specialty: ShieldCheck },
  { id: 'RES-02', name: 'Rescue Drone 2', status: 'Ready', crew: 'Remote pilot', specialty: Wrench },
]

export const facilities = [
  { name: 'Mbagathi Hospital', type: 'Hospital', distance: '3.8 km', icon: Building2 },
  { name: 'Kilimani Police Station', type: 'Police station', distance: '2.1 km', icon: ShieldCheck },
  { name: 'Nairobi Fire Station', type: 'Fire station', distance: '5.6 km', icon: Truck },
]

export function asArray(value) {
  return Array.isArray(value) ? value : []
}

export function formatIncidentDate(value) {
  if (!value) return 'Just now'
  if (typeof value === 'string') return value
  if (typeof value.toDate === 'function') return value.toDate().toLocaleString()
  if (value.seconds) return new Date(value.seconds * 1000).toLocaleString()
  return 'Recent update'
}

export function normalizeIncident(report) {
  return {
    ...report,
    title: report.title || `${report.type || 'Emergency'} incident`,
    type: report.type || 'Emergency',
    location: report.location || 'Location pending',
    severity: report.severity || 'Medium',
    status: report.status || report.assignmentStatus || 'Pending',
    distance: report.distance || 'Nearby',
    eta: report.eta || 'Calculating',
    description: report.description || 'No description supplied yet.',
    createdLabel: formatIncidentDate(report.createdAt),
    gps: report.gps || report.coordinates || report.locationCoordinates || 'GPS pending',
  }
}
