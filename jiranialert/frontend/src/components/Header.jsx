import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function Header({
  navItems = [],
  initialBg = 'transparent',
  scrolledBg = 'rgba(255,255,255,0.92)',
  primaryColor = '#2563EB',
  textColor = 'text-slate-700',
  theme = 'light',
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const isDarkTheme = theme === 'dark'
  const navTextClass = isDarkTheme ? 'text-white/90' : textColor
  const navButtonClass = isDarkTheme ? 'border-white/30 text-white/90 bg-white/10 hover:bg-white/15' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
  const navToggleClass = isDarkTheme ? 'border-white/30 text-white/90' : 'border-slate-300 text-slate-700'
  const mobilePanelClass = isDarkTheme ? 'bg-slate-950/95 border-white/10' : 'bg-white/95 border-slate-200'
  const mobileLinkHoverClass = isDarkTheme ? 'hover:bg-white/10' : 'hover:bg-slate-100'
  const mobileLoginClass = isDarkTheme ? 'border-white/20 text-white/90 hover:bg-white/10' : 'border-slate-300 text-slate-700 hover:bg-slate-50'

  const goToSection = (id) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setMobileOpen(false)
  }

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
      initial={{ backgroundColor: initialBg }}
    >
      {/* Mobile background overlay for visibility */}
      <div className={`lg:hidden absolute inset-0 pointer-events-none ${isDarkTheme ? 'bg-slate-950/35' : 'bg-gradient-to-r from-slate-900/40 to-slate-900/20'}`}></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-2 sm:gap-3">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <img src="/jirani-alert-logo.svg" alt="Jirani Alert" className="h-9 sm:h-11 w-9 sm:w-11 rounded-full bg-white" />
            <span className="inline-block max-w-[9rem] truncate text-xs sm:max-w-none sm:text-sm font-bold tracking-wide" style={{ color: isDarkTheme ? '#FFFFFF' : primaryColor }}>JIRANI ALERT</span>
          </button>

          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              item.to ? (
                <Link key={item.label} to={item.to} className={`text-sm font-semibold ${navTextClass} hover:opacity-100 transition-opacity`}>
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToSection(item.id)}
                  className={`text-sm font-semibold ${navTextClass} hover:opacity-100 transition-opacity`}
                >
                  {item.label}
                </button>
              )
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border text-xs sm:text-sm font-semibold transition-colors ${navButtonClass}`}>
              Login
            </Link>
            <Link to="/signup" className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-[var(--primary,#2563EB)] text-xs sm:text-sm text-white font-semibold shadow-[0_0_18px_rgba(37,99,235,0.45)] transition-all" style={{ backgroundColor: primaryColor }}>
              Sign Up
            </Link>
          </div>

          <button type="button" onClick={() => setMobileOpen((s) => !s)} className={`lg:hidden p-1.5 sm:p-2 rounded-lg border flex-shrink-0 ${navToggleClass}`} aria-label="Toggle Menu">
            {mobileOpen ? <X className="w-4 sm:w-5 h-4 sm:h-5" /> : <Menu className="w-4 sm:w-5 h-4 sm:h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className={`lg:hidden border-t backdrop-blur relative z-10 ${mobilePanelClass}`}>
          <div className="mx-auto max-w-7xl px-4 py-3 sm:py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              item.to ? (
                <Link key={item.label} to={item.to} onClick={() => setMobileOpen(false)} className={`text-left px-2 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${navTextClass} ${mobileLinkHoverClass}`}>
                  {item.label}
                </Link>
              ) : (
                <button key={item.id} type="button" onClick={() => goToSection(item.id)} className={`text-left px-2 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm ${navTextClass} ${mobileLinkHoverClass}`}>
                  {item.label}
                </button>
              )
            ))}

            <div className="flex gap-3 pt-4">
              <Link to="/login" className={`flex-1 px-4 py-3 rounded-lg text-center font-semibold text-sm border transition-colors ${mobileLoginClass}`}>Login</Link>
              <Link to="/signup" className="flex-1 px-4 py-3 rounded-lg text-center font-semibold text-sm bg-[#2563EB] text-white hover:opacity-90 transition-opacity">Sign Up</Link>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
