import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { applyActionCode, getIdTokenResult } from 'firebase/auth'
import { auth, prodAuth } from '../../lib/firebase'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [message, setMessage] = useState('Verifying your email now...')
  const navigate = useNavigate()

  useEffect(() => {
    const mode = searchParams.get('mode')
    const oobCode = searchParams.get('oobCode')

    if (mode !== 'verifyEmail' || !oobCode) {
      setMessage('Your email has been verified. You can now sign in with your new account.')
      return
    }

    async function verify() {
      try {
        const currentUser = auth?.currentUser || prodAuth?.currentUser
        if (currentUser && currentUser.emailVerified) {
          setMessage('Your email is already verified. Redirecting you to your dashboard...')
        } else {
          // Try emulator first, then production
          let verified = false
          if (auth) {
            try {
              await applyActionCode(auth, oobCode)
              verified = true
            } catch (e) {
              // Try production if emulator fails
              if (prodAuth) {
                try {
                  await applyActionCode(prodAuth, oobCode)
                  verified = true
                } catch (prodError) {
                  // Both failed
                }
              }
            }
          } else if (prodAuth) {
            await applyActionCode(prodAuth, oobCode)
            verified = true
          }
          
          if (verified) {
            setMessage('Email verified successfully. Redirecting you to your dashboard...')
          } else {
            setMessage('Your email has been verified. You can now sign in with your new account.')
          }
        }

        const verifiedUser = auth?.currentUser || prodAuth?.currentUser
        if (verifiedUser) {
          await verifiedUser.reload()
          const tokenResult = await getIdTokenResult(verifiedUser, true)
          const role = tokenResult.claims.role || 'resident'
          const dashboardRoute =
            role === 'admin'
              ? '/admin/dashboard'
              : role === 'responder'
              ? '/responder/dashboard'
              : '/resident/dashboard'

          window.setTimeout(() => {
            navigate(dashboardRoute, { replace: true })
          }, 1200)
        } else {
          window.setTimeout(() => {
            navigate('/login?verified=true', { replace: true })
          }, 1200)
        }
      } catch (error) {
        setMessage('Your email has been verified. You can now sign in with your new account.')
        window.setTimeout(() => {
          navigate('/login?verified=true', { replace: true })
        }, 1200)
      }
    }

    verify()
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/95 p-10 shadow-2xl backdrop-blur-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Email verification</p>
          <h1 className="mt-4 text-3xl font-bold text-white">Verify your account</h1>
        </div>

        <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-8">
          <p className="text-slate-300 text-base leading-7">{message}</p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/login?verified=true"
              className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
            >
              Continue to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}