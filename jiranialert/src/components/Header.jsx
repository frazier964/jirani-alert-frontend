import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Header({ navItems = [], initialBg = 'transparent', scrolledBg = 'rgba(255,255,255,0.92)', primaryColor = '#2563EB', textColor = 'text-slate-700' }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-50"
      animate={{
        backgroundColor: scrolled ? scrolledBg : initialBg,
        boxShadow: scrolled ? '0 8px 28px rgba(15,23,42,0.1)' : '0 0 0 rgba(0,0,0,0)',
        backdropFilter: scrolled ? 'blur(10px)' : 'blur(0px)',
      }}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3">
            <img src="/jirani-alert-logo.svg" alt="Jirani Alert" className="h-11 w-11 rounded-full bg-white" />
            <span className="text-sm sm:text-base font-bold tracking-wide" style={{ color: primaryColor }}>JIRANI ALERT</span>
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              item.to ? (
                <Link key={item.label} to={item.to} className={`text-sm font-semibold ${textColor} hover:opacity-100 transition-opacity`}>
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    const section = document.getElementById(item.id)
                    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`text-sm font-semibold ${textColor} hover:opacity-100 transition-opacity`}
                >
                  {item.label}
                </button>
              )
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:border-opacity-100 transition-colors">
              Login
            </Link>
            <Link to="/signup" className="px-4 py-2 rounded-xl bg-[var(--primary,#2563EB)] text-white font-semibold shadow-[0_0_18px_rgba(37,99,235,0.45)] transition-all" style={{ backgroundColor: primaryColor }}>
              Sign Up
            </Link>
          </div>

          <button type="button" onClick={() => setMobileOpen((s) => !s)} className="lg:hidden p-2 rounded-lg border border-slate-300 text-slate-700" aria-label="Toggle Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-3">
            {navItems.map((item) => (
              item.to ? (
                <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)} className={`text-left px-2 py-2 rounded-lg ${textColor} hover:bg-slate-100`}>
                  {item.label}
                </Link>
              ) : (
                <button key={item.id} type="button" onClick={() => setMobileOpen(false)} className={`text-left px-2 py-2 rounded-lg ${textColor} hover:bg-slate-100`}>
                  {item.label}
                </button>
              )
            ))}

            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1 px-4 py-2 rounded-xl border border-slate-300 text-center font-semibold text-slate-700">Login</Link>
              <Link to="/signup" className="flex-1 px-4 py-2 rounded-xl bg-[#2563EB] text-center font-semibold text-white">Sign Up</Link>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
