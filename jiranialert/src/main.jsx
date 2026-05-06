import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Layout from './components/Layout'
import Home from './pages/shared/Home'
import About from './pages/shared/About'
import Features from './pages/shared/Features'
import Contact from './pages/shared/Contact'
import Privacy from './pages/shared/Privacy'
import Support from './pages/shared/Support'
import Login from './pages/shared/Login'
import SignUp from './pages/shared/SignUp'
import ResidentDashboard from './pages/resident/ResidentDashboard'
import ReportEmergency from './pages/resident/ReportEmergency'
import LiveMap from './pages/resident/LiveMap'
import Notifications from './pages/resident/Notifications'
import EmergencyContacts from './pages/resident/EmergencyContacts'
import Profile from './pages/resident/Profile'
import ResponderDashboard from './pages/responder/ResponderDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import AlertDetails from './pages/alerts/AlertDetails'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/support" element={<Support />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/report" element={<ReportEmergency />} />

        <Route element={<Layout />}> 
          <Route path="/resident/dashboard" element={<ResidentDashboard />} />
          <Route path="/resident/map" element={<LiveMap />} />
          <Route path="/resident/notifications" element={<Notifications />} />
          <Route path="/resident/contacts" element={<EmergencyContacts />} />
          <Route path="/resident/profile" element={<Profile />} />
          <Route path="/alerts/:id" element={<AlertDetails />} />

          <Route path="/responder/dashboard" element={<ResponderDashboard />} />

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
