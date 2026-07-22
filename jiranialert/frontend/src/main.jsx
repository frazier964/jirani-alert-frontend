import { StrictMode, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import './index.css'
import AnnouncementBar from './components/AnnouncementBar'
import Layout from './components/Layout'
import { initAuthListener } from './lib/auth'

const Home = lazy(() => import('./pages/shared/Home'))
const About = lazy(() => import('./pages/shared/About'))
const Features = lazy(() => import('./pages/shared/Features'))
const Contact = lazy(() => import('./pages/shared/Contact'))
const Privacy = lazy(() => import('./pages/shared/Privacy'))
const Support = lazy(() => import('./pages/shared/Support'))
const Terms = lazy(() => import('./pages/shared/Terms'))
const Login = lazy(() => import('./pages/shared/Login'))
const SignUp = lazy(() => import('./pages/shared/SignUp'))
const VerifyEmail = lazy(() => import('./pages/shared/VerifyEmail'))
const ResidentDashboard = lazy(() => import('./pages/resident/ResidentDashboard'))
const ReportEmergency = lazy(() => import('./pages/resident/ReportEmergency'))
const GuestReportTracking = lazy(() => import('./pages/shared/GuestReportTracking'))
const LiveMap = lazy(() => import('./pages/resident/LiveMap'))
const Notifications = lazy(() => import('./pages/resident/Notifications'))
const Reports = lazy(() => import('./pages/resident/Reports'))
const Messages = lazy(() => import('./pages/resident/Messages'))
const EmergencyContacts = lazy(() => import('./pages/resident/EmergencyContacts'))
const Profile = lazy(() => import('./pages/resident/Profile'))
const ResponderDashboard = lazy(() => import('./pages/responder/ResponderDashboard'))
const ResponderWorkspacePage = lazy(() => import('./pages/responder/ResponderWorkspacePage'))
const ResponderIncidentDetails = lazy(() => import('./pages/responder/IncidentDetails'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AlertDetails = lazy(() => import('./pages/alerts/AlertDetails'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-700">
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        Loading page...
      </div>
    </div>
  )
}

function AppRoutes() {
  useEffect(() => {
    initAuthListener()
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/support" element={<Support />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/report" element={<Navigate to="/report-emergency" replace />} />
          <Route path="/report-emergency" element={<ReportEmergency />} />
          <Route path="/report-emergency/:id" element={<GuestReportTracking />} />
          <Route path="/resident/report" element={<Navigate to="/report-emergency" replace />} />

          <Route element={<Layout />}>
            <Route path="/resident/dashboard" element={<ResidentDashboard />} />
            <Route path="/resident/map" element={<LiveMap />} />
            <Route path="/resident/notifications" element={<Notifications />} />
            <Route path="/resident/reports" element={<Reports />} />
            <Route path="/resident/messages" element={<Messages />} />
            <Route path="/resident/contacts" element={<EmergencyContacts />} />
            <Route path="/resident/profile" element={<Profile />} />
            <Route path="/alerts/:id" element={<AlertDetails />} />

            <Route path="/responder/dashboard" element={<ResponderDashboard />} />
            <Route path="/responder/incidents" element={<ResponderWorkspacePage page="incidents" />} />
            <Route path="/responder/incidents/:id" element={<ResponderIncidentDetails />} />
            <Route path="/responder/assigned" element={<ResponderWorkspacePage page="assigned" />} />
            <Route path="/responder/map" element={<ResponderWorkspacePage page="map" />} />
            <Route path="/responder/dispatch" element={<ResponderWorkspacePage page="dispatch" />} />
            <Route path="/responder/communications" element={<ResponderWorkspacePage page="communications" />} />
            <Route path="/responder/residents" element={<ResponderWorkspacePage page="residents" />} />
            <Route path="/responder/team" element={<ResponderWorkspacePage page="team" />} />
            <Route path="/responder/equipment" element={<ResponderWorkspacePage page="equipment" />} />
            <Route path="/responder/reports" element={<ResponderWorkspacePage page="reports" />} />
            <Route path="/responder/analytics" element={<ResponderWorkspacePage page="analytics" />} />
            <Route path="/responder/resources" element={<ResponderWorkspacePage page="resources" />} />
            <Route path="/responder/announcements" element={<ResponderWorkspacePage page="announcements" />} />
            <Route path="/responder/profile" element={<ResponderWorkspacePage page="profile" />} />
            <Route path="/responder/settings" element={<ResponderWorkspacePage page="settings" />} />
            <Route path="/responder/notifications" element={<ResponderWorkspacePage page="notifications" />} />
            <Route path="/responder/help" element={<ResponderWorkspacePage page="help" />} />
            <Route path="/responder" element={<Navigate to="/responder/dashboard" replace />} />
            <Route path="/responder/team-members" element={<Navigate to="/responder/team" replace />} />
            <Route path="/responder/help-support" element={<Navigate to="/responder/help" replace />} />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AnnouncementBar />
    <AppRoutes />
  </StrictMode>,
)
