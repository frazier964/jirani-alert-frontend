import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { applyActionCode, getIdTokenResult } from 'firebase/auth'
import { auth, prodAuth } from '../../lib/firebase'
import { resendVerificationEmail } from '../../lib/auth'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('pending')
  const [message, setMessage] = useState('Verifying your email now...')
  const [resendLoading, setResendLoading] = useState(false)
  const [resendResult, setResendResult] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const mode = searchParams.get('mode')
    const oobCode = searchParams.get('oobCode')

    if (mode !== 'verifyEmail' || !oobCode) {
      setStatus('error')
      setMessage(
        'The verification link is invalid or missing required information. Please open the email link again or sign in and request a new verification email.',
      )
      return
    }

    async function verify() {
      try {
        const currentUser = auth.currentUser || prodAuth.currentUser
        if (currentUser && currentUser.emailVerified) {
          setStatus('success')
          setMessage('Your email is already verified. Redirecting you to your dashboard...')
        } else {
          await applyActionCode(auth, oobCode)
          setStatus('success')
          setMessage('Email verified successfully. Redirecting you to your dashboard...')
        }

        const verifiedUser = auth.currentUser || prodAuth.currentUser
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
        setStatus('error')
        const errorMessage = error?.message || 'Email verification failed.'
        if (errorMessage.includes('expired') || errorMessage.includes('already been used')) {
          setMessage(
            'This verification link is no longer valid. Please sign in and request a fresh verification email if needed.',
          )
        } else {
          setMessage(errorMessage)
        }
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
            {status === 'success' && (
              <Link
                to="/login?verified=true"
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 font-semibold text-white transition hover:bg-sky-400"
              >
                Go to login
              </Link>
            )}
            {status === 'error' && auth.currentUser && (
              <button
                type="button"
                onClick={async () => {
                  setResendLoading(true)
                  setResendResult('')
                  try {
                    const result = await resendVerificationEmail()
                    if (result.sent) {
                      setResendResult('A fresh verification email has been sent. Please check your inbox.')
                    } else {
                      setResendResult(result.reason || 'Unable to resend verification email.')
                    }
                  } catch (e) {
                    setResendResult(e?.message || 'Unable to resend verification email.')
                  } finally {
                    setResendLoading(false)
                  }
                }}
                disabled={resendLoading}
                className="inline-flex items-center justify-center rounded-full bg-slate-700 px-6 py-3 font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resendLoading ? 'Resending...' : 'Resend verification email'}
              </button>
            )}
            {resendResult && (
              <p className="mt-3 rounded-2xl bg-slate-800/80 px-4 py-3 text-sm text-slate-100">
                {resendResult}
              </p>
            )}
            {status === 'error' && (
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20"
              >
                Return to sign up
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
