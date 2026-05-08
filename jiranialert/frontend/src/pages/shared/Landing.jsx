import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const navItems = ['Home', 'Services', 'About', 'Contact']

export default function Landing() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#3d63b8] relative flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.09),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.08),_transparent_26%),linear-gradient(135deg,_rgba(44,72,158,0.2)_0%,_rgba(44,72,158,0.2)_46%,_transparent_46%,_transparent_100%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[1120px]"
      >
        <div className="absolute -top-6 left-0 w-0 h-0 border-t-[64px] border-t-transparent border-r-[64px] border-r-[#ff43c7] border-b-[64px] border-b-transparent">
          <div className="absolute -left-1 -top-5 -rotate-45 text-white text-xl font-black tracking-[0.2em]">
            Pro
          </div>
        </div>

        <div className="absolute top-0 right-0 w-14 h-14 rounded-xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)] flex items-center justify-center">
          <span className="text-[28px] leading-none text-[#e60023] font-black">p</span>
        </div>

        <div className="relative rounded-[2px] bg-[#345aa6] shadow-[0_35px_80px_rgba(8,18,57,0.35)] overflow-hidden border border-white/10">
          <div className="absolute inset-x-0 top-0 h-[120px] bg-[linear-gradient(180deg,rgba(25,178,255,0.75),rgba(25,178,255,0.12))] opacity-90" />
          <div className="absolute inset-x-0 top-0 h-[140px] opacity-45 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_30%),radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.2),transparent_32%)]" />

          <div className="absolute inset-x-0 top-[130px] h-[340px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_24%)]" />

          <div className="absolute inset-0">
            <div className="absolute bottom-0 left-[-6%] right-[-6%] h-[30%] bg-[radial-gradient(circle_at_10%_70%,rgba(119,218,255,0.95)_0,rgba(119,218,255,0.35)_2px,transparent_2px),radial-gradient(circle_at_16%_60%,rgba(119,218,255,0.9)_0,rgba(119,218,255,0.3)_1.8px,transparent_2px),radial-gradient(circle_at_22%_80%,rgba(119,218,255,0.8)_0,rgba(119,218,255,0.26)_1.8px,transparent_2px),radial-gradient(circle_at_30%_55%,rgba(119,218,255,0.85)_0,rgba(119,218,255,0.25)_1.6px,transparent_2px),radial-gradient(circle_at_38%_72%,rgba(119,218,255,0.9)_0,rgba(119,218,255,0.28)_2px,transparent_2px),radial-gradient(circle_at_46%_62%,rgba(119,218,255,0.7)_0,rgba(119,218,255,0.24)_1.8px,transparent_2px),radial-gradient(circle_at_54%_82%,rgba(119,218,255,0.8)_0,rgba(119,218,255,0.25)_2px,transparent_2px),radial-gradient(circle_at_62%_68%,rgba(119,218,255,0.72)_0,rgba(119,218,255,0.22)_1.7px,transparent_2px),radial-gradient(circle_at_70%_56%,rgba(119,218,255,0.8)_0,rgba(119,218,255,0.25)_2px,transparent_2px),radial-gradient(circle_at_78%_78%,rgba(119,218,255,0.88)_0,rgba(119,218,255,0.3)_2px,transparent_2px),radial-gradient(circle_at_86%_64%,rgba(119,218,255,0.8)_0,rgba(119,218,255,0.22)_1.8px,transparent_2px)]" />
            <div className="absolute bottom-0 left-[-10%] right-[-10%] h-[44%] bg-[linear-gradient(180deg,transparent,rgba(67,118,191,0.82)_75%)]" />
            <div className="absolute top-[10%] left-[7%] right-[7%] h-[12px] bg-[linear-gradient(90deg,rgba(255,255,255,0.12),rgba(255,255,255,0.18),rgba(255,255,255,0.08))] rounded-full blur-[1px] opacity-50" />
          </div>

          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-10 left-10 w-4/5 h-28 rounded-[2px] bg-[linear-gradient(90deg,rgba(0,209,255,0.3),rgba(0,209,255,0.06),rgba(0,209,255,0.3))] blur-sm opacity-80"
          />

          <div className="relative z-10 px-5 sm:px-8 lg:px-10 pt-9 pb-10 lg:pb-14">
            <div className="flex items-center justify-between gap-6 text-white">
              <img
                src="/jirani-alert-logo.svg"
                alt="JiraniAlert logo"
                className="h-20 sm:h-24 w-auto object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.2)]"
              />

              <nav className="hidden md:flex items-center gap-10 text-[0.74rem] font-semibold tracking-[0.28em] uppercase">
                {navItems.map((item) => (
                  item === 'Home' ? (
                    <Link key={item} to="/home" className="opacity-90 hover:opacity-100 transition-opacity">
                      {item}
                    </Link>
                  ) : (
                    <a key={item} href="#" className="opacity-90 hover:opacity-100 transition-opacity">
                      {item}
                    </a>
                  )
                ))}
              </nav>

              <button
                type="button"
                className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-full border border-white/0 bg-transparent md:bg-transparent text-white"
                aria-label="Menu"
              >
                <span className="relative block w-7 h-[2px] bg-white before:content-[''] before:absolute before:left-0 before:-top-2 before:w-7 before:h-[2px] before:bg-white after:content-[''] after:absolute after:left-0 after:top-2 after:w-7 after:h-[2px] after:bg-white" />
              </button>
            </div>

            <div className="mt-20 sm:mt-24 lg:mt-28 text-center text-white max-w-3xl mx-auto">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-[-0.04em] drop-shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
                Welcome
              </h1>
              <p className="mt-2 text-lg sm:text-xl lg:text-2xl font-semibold opacity-95">
                To Our Company
              </p>

              <p className="mt-7 text-[0.78rem] sm:text-sm leading-6 sm:leading-7 text-white/75 max-w-2xl mx-auto">
                JiraniAlert helps neighbors, responders, and local administrators coordinate faster during emergencies.
                Share alerts, track incidents, and support your community in one trusted place.
              </p>

              <Link
                to="/signup"
                className="inline-flex items-center justify-center mt-8 px-6 py-3 rounded-full bg-white text-[#3b65b7] text-[0.72rem] sm:text-[0.78rem] font-extrabold tracking-[0.22em] uppercase shadow-[0_12px_28px_rgba(0,0,0,0.22)] hover:translate-y-[-1px] hover:shadow-[0_16px_34px_rgba(0,0,0,0.28)] transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
