import { StrictMode, lazy, Suspense, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import { ensureAnonymous } from './lib/firebase'
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
const ResidentDashboard = lazy(() => import('./pages/resident/ResidentDashboard'))
const ReportEmergency = lazy(() => import('./pages/resident/ReportEmergency'))
const LiveMap = lazy(() => import('./pages/resident/LiveMap'))
const Notifications = lazy(() => import('./pages/resident/Notifications'))
const Reports = lazy(() => import('./pages/resident/Reports'))
const Messages = lazy(() => import('./pages/resident/Messages'))
const EmergencyContacts = lazy(() => import('./pages/resident/EmergencyContacts'))
const Profile = lazy(() => import('./pages/resident/Profile'))
const ResponderDashboard = lazy(() => import('./pages/responder/ResponderDashboard'))
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
          <Route path="/report" element={<ReportEmergency />} />

          <Route element={<Layout />}>
            <Route path="/resident/dashboard" element={<ResidentDashboard />} />
            <Route path="/resident/report" element={<ReportEmergency />} />
            <Route path="/resident/map" element={<LiveMap />} />
            <Route path="/resident/notifications" element={<Notifications />} />
            <Route path="/resident/reports" element={<Reports />} />
            <Route path="/resident/messages" element={<Messages />} />
            <Route path="/resident/contacts" element={<EmergencyContacts />} />
            <Route path="/resident/profile" element={<Profile />} />
            <Route path="/alerts/:id" element={<AlertDetails />} />

            <Route path="/responder/dashboard" element={<ResponderDashboard />} />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppRoutes />
  </StrictMode>,
)
