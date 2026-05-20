import AnnouncementBar from './components/AnnouncementBar'

function App() {
  return (
    <>
      <AnnouncementBar />
      <main className="relative min-h-screen bg-slate-950/5 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
          <section className="rounded-[2rem] border border-white/10 bg-white/95 px-6 py-8 shadow-[0_30px_120px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors duration-300 dark:bg-slate-950/95 dark:border-slate-700/70 sm:px-10 sm:py-12">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <p className="mb-4 inline-flex rounded-full bg-sky-100/90 px-4 py-2 text-sm font-semibold text-sky-700 dark:bg-sky-900/20 dark:text-sky-200">
                  Jirani Alert · Community safety system
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
                  Modern emergency alerts, trusted by communities.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
                  Stay ahead of urgent moments with real-time neighborhood notifications, severity-aware messaging, and a polished public safety interface designed for both desktop and mobile.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50/90 p-5 shadow-lg shadow-slate-900/5 transition duration-300 dark:border-slate-700/60 dark:bg-slate-900/80">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Live response</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">Real-time alerts</p>
                </div>
                <div className="rounded-3xl border border-slate-200/80 bg-slate-50/90 p-5 shadow-lg shadow-slate-900/5 transition duration-300 dark:border-slate-700/60 dark:bg-slate-900/80">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Community</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">Safer together</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/95 p-6 text-white shadow-[0_24px_90px_rgba(15,23,42,0.18)] transition duration-300 dark:bg-slate-900/95">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Urgent action</p>
              <h2 className="mt-4 text-2xl font-semibold">Fast incident reporting</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Capture alerts quickly and push them to your neighborhood with confidence.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/95 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] dark:bg-slate-950/90 dark:border-slate-700/60">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Connectivity</p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">Mobile-ready alerts</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                The design keeps every message readable and accessible on every screen size.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/95 p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] dark:bg-slate-950/90 dark:border-slate-700/60">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Trust</p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">Community safety</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                A professional interface built to convey urgency, authority, and calm control.
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export default App
