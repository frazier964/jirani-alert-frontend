import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Menu,
  Phone,
  Shield,
  X,
} from 'lucide-react'
import { loginUser } from '../../lib/auth'

const trustItems = [
  { title: 'Real-Time Notifications', icon: Bell },
  { title: 'Secure Access', icon: Lock },
  { title: 'Verified Community Reports', icon: CheckCircle2 },
  { title: 'Instant Emergency Updates', icon: Shield },
]

const badgeItems = [
  { text: 'Community Verified', icon: CheckCircle2 },
  { text: 'Encrypted Access', icon: Lock },
  { text: 'Trusted Emergency Network', icon: Shield },
]

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const validate = () => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return false
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 700))
      const user = loginUser({ email, password })

      if (remember) {
        localStorage.setItem('jiranialert_remember_email', email)
      } else {
        localStorage.removeItem('jiranialert_remember_email')
      }

      if (user.role === 'resident') navigate('/resident/dashboard')
      else if (user.role === 'responder') navigate('/responder/dashboard')
      else navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message || 'Unable to sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgotSubmit = (e) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) return
    setForgotSuccess(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative overflow-hidden">
      <motion.div
        className="fixed inset-x-0 top-0 z-50"
        animate={{
          backgroundColor: scrolled ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.72)',
          boxShadow: scrolled ? '0 10px 26px rgba(15,23,42,0.1)' : '0 0 0 rgba(0,0,0,0)',
          backdropFilter: 'blur(10px)',
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/jirani-alert-logo.svg" alt="Jirani Alert" className="h-12 w-12 rounded-full" />
              <span className="font-bold tracking-wide text-[#2563EB]">JIRANI ALERT</span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
              <Link to="/" className="text-sm font-semibold text-slate-700 hover:text-[#2563EB] transition-colors">Home</Link>
              <Link to="/features" className="text-sm font-semibold text-slate-700 hover:text-[#2563EB] transition-colors">Features</Link>
              <Link to="/contact" className="text-sm font-semibold text-slate-700 hover:text-[#2563EB] transition-colors">Contact</Link>
              <Link to="/signup" className="px-4 py-2 rounded-xl bg-[#2563EB] text-white font-semibold hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] transition-all">Sign Up</Link>
            </div>

            <button
              type="button"
              className="md:hidden p-2 rounded-lg border border-slate-300"
              onClick={() => setMobileMenuOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 py-3 flex flex-col gap-2">
              <Link to="/" className="px-2 py-2 rounded-lg hover:bg-slate-100">Home</Link>
                      {showPassword ? <Eye className="h-4.5 w-4.5" /> : <EyeOff className="h-4.5 w-4.5" />}
              <Link to="/contact" className="px-2 py-2 rounded-lg hover:bg-slate-100 text-left">Contact</Link>
              <Link to="/signup" className="mt-2 px-4 py-2 rounded-xl bg-[#2563EB] text-white font-semibold text-center">Sign Up</Link>
            </div>
          )}
        </div>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(14)].map((_, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#2563EB]/20"
            style={{
              width: `${8 + (i % 5) * 6}px`,
              height: `${8 + (i % 5) * 6}px`,
              left: `${(i * 7) % 100}%`,
              top: `${(i * 9) % 100}%`,
            }}
            animate={{ y: [0, -20, 0], opacity: [0.25, 0.6, 0.25] }}
            transition={{ duration: 4 + (i % 4), repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <main className="pt-28 pb-16 relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch"
          >
            <section id="login-features" className="rounded-3xl bg-gradient-to-br from-[#1d4ed8] via-[#2563EB] to-[#1e3a8a] p-8 sm:p-10 text-white shadow-[0_28px_65px_rgba(37,99,235,0.35)] relative overflow-hidden">
              <motion.div
                className="absolute -top-12 -left-8 w-40 h-40 rounded-full bg-white/20 blur-2xl"
                animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -bottom-10 right-0 w-52 h-52 rounded-full bg-[#16A34A]/25 blur-2xl"
                animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.55, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/30 bg-white/10 text-xs font-semibold uppercase tracking-wide">
                  <Shield className="h-4 w-4" />
                  Secure Access To Your Community Safety Network
                </div>
                <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold leading-tight text-white">
                  Welcome Back to Jirani Alert
                </h1>
                <p className="mt-4 text-blue-100 text-lg">
                  Access real-time emergency alerts and help keep your community safe.
                </p>

                <div className="mt-8 grid sm:grid-cols-2 gap-3">
                  {trustItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <motion.div
                        key={item.title}
                        whileHover={{ y: -3 }}
                        className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur p-4"
                      >
                        <div className="h-9 w-9 rounded-lg bg-white/20 flex items-center justify-center mb-3">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <p className="text-sm font-semibold">{item.title}</p>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/80 bg-white/70 backdrop-blur-xl p-7 sm:p-8 shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-[#2563EB] text-white flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Login</h2>
                  <p className="text-sm text-slate-500">Protected & encrypted access</p>
                </div>
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="email">Email Address</label>
                  <div className="relative mt-1.5">
                    <Mail className="h-4.5 w-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-11 py-3 outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="password">Password</label>
                  <div className="relative mt-1.5">
                    <Lock className="h-4.5 w-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-11 pr-12 py-3 outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB] transition-all"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md text-slate-500 hover:bg-slate-100"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <Eye className="h-4.5 w-4.5 mx-auto" /> : <EyeOff className="h-4.5 w-4.5 mx-auto" />}
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      className="text-sm font-semibold text-[#2563EB] hover:text-[#1e40af]"
                      onClick={() => {
                        setForgotOpen(true)
                        setForgotEmail(email)
                        setForgotSuccess(false)
                      }}
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-700 text-sm flex items-center gap-2"
                  >
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#2563EB] text-white font-bold py-3.5 hover:shadow-[0_0_24px_rgba(37,99,235,0.55)] transition-all disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <span className="inline-flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    'Secure Login'
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-xs text-slate-500 uppercase tracking-wide">or continue with</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button type="button" className="rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 hover:-translate-y-0.5 hover:shadow-md transition-all">
                    Google
                  </button>
                  <button type="button" className="rounded-xl border border-slate-300 bg-white py-3 font-semibold text-slate-700 hover:-translate-y-0.5 hover:shadow-md transition-all inline-flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </button>
                </div>

                <p className="text-sm text-slate-600 text-center">
                  Don't have an account?{' '}
                  <Link to="/signup" className="font-bold text-[#2563EB] hover:text-[#1e40af]">
                    Sign Up
                  </Link>
                </p>
              </form>

              <div className="mt-6 grid sm:grid-cols-3 gap-2">
                {badgeItems.map((badge) => {
                  const Icon = badge.icon
                  return (
                    <div key={badge.text} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 flex items-center gap-1.5 justify-center">
                      <Icon className="h-3.5 w-3.5 text-[#16A34A]" />
                      {badge.text}
                    </div>
                  )
                })}
              </div>
            </section>
          </motion.div>
        </div>
      </main>

      <footer id="contact" className="border-t border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between text-sm text-slate-600">
          <p className="font-medium">Secure access to your community safety network.</p>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="hover:text-[#2563EB]">Contact Support</Link>
            <Link to="/privacy" className="hover:text-[#2563EB]">Privacy Policy</Link>
            <Link to="/support" className="hover:text-[#2563EB]">Support</Link>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setForgotOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/70 bg-white p-6 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Forgot Password</h3>
                  <p className="mt-1 text-sm text-slate-600">Enter your email to receive a reset link.</p>
                </div>
                <button
                  className="h-8 w-8 rounded-md text-slate-500 hover:bg-slate-100"
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  aria-label="Close forgot password modal"
                >
                  <X className="h-4 w-4 mx-auto" />
                </button>
              </div>

              {!forgotSuccess ? (
                <form className="mt-5" onSubmit={handleForgotSubmit}>
                  <label className="text-sm font-semibold text-slate-700" htmlFor="forgot-email">Email</label>
                  <div className="relative mt-1.5">
                    <Mail className="h-4.5 w-4.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-11 py-3 outline-none focus:ring-2 focus:ring-[#2563EB]/40 focus:border-[#2563EB]"
                      placeholder="you@example.com"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 rounded-xl bg-[#2563EB] text-white font-bold py-3 hover:shadow-[0_0_24px_rgba(37,99,235,0.5)] transition-all"
                  >
                    Send Reset Link
                  </button>
                </form>
              ) : (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700 text-sm">
                  <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Reset link sent successfully.</p>
                  <p className="mt-1">Please check your inbox for password recovery instructions.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
