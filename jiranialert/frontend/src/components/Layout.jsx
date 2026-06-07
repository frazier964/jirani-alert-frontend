import { useEffect, useRef, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { getIdTokenResult, onAuthStateChanged } from 'firebase/auth'
import TopNav from './Layout/TopNav'
import { getCurrentUser, resolveAccountRole, normalizeAccountRole } from '../lib/auth'
import { auth, prodAuth } from '../lib/firebase'

const TEXT_SIZE_OPTIONS = new Set(['Small', 'Medium', 'Large'])

function applyAccountPreferences(profile) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  const theme = profile?.theme === 'dark' ? 'dark' : 'light'
  const highContrast = profile?.highContrast === true
  const textSize = TEXT_SIZE_OPTIONS.has(profile?.textSize) ? profile.textSize : 'Medium'

  root.dataset.accountTheme = theme
  root.dataset.accountContrast = highContrast ? 'true' : 'false'
  root.dataset.accountTextSize = textSize.toLowerCase()
  root.style.colorScheme = theme
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isResident = location.pathname.startsWith('/resident')
  const isResponder = location.pathname.startsWith('/responder')
  const isAdmin = location.pathname.startsWith('/admin')
  const isProtectedRoute = ['/resident', '/responder', '/admin', '/alerts'].some((prefix) =>
    location.pathname.startsWith(prefix),
  )
  const [authChecked, setAuthChecked] = useState(!isProtectedRoute)
  const authReadyRef = useRef({ auth: !auth, prod: !prodAuth })

  useEffect(() => {
    applyAccountPreferences(getCurrentUser())

    const handleProfileUpdate = (event) => {
      applyAccountPreferences(event?.detail || getCurrentUser())
    }

    window.addEventListener('jiranialert_profile_updated', handleProfileUpdate)
    return () => window.removeEventListener('jiranialert_profile_updated', handleProfileUpdate)
  }, [])

  useEffect(() => {
    if (!isProtectedRoute) {
      return undefined
    }

    if (!auth && !prodAuth) {
      navigate('/login', { replace: true })
      return undefined
    }

    const checkUser = async () => {
      if ((auth && !authReadyRef.current.auth) || (prodAuth && !authReadyRef.current.prod)) {
        return
      }

      const user = auth?.currentUser || prodAuth?.currentUser
      const profile = getCurrentUser()
      const cachedRole = resolveAccountRole(profile)
      const tokenResult = user ? await getIdTokenResult(user, true).catch(() => null) : null
      const role = normalizeAccountRole(tokenResult?.claims?.role) || normalizeAccountRole(user?.role) || cachedRole
      setAuthChecked(true)
      if (!user) {
        navigate('/login', { replace: true })
        return
      }
      if (!user.emailVerified) {
        navigate('/login?verificationPending=true', { replace: true })
        return
      }

      if (!role) {
        navigate('/login', { replace: true })
        return
      }

      if (role === 'responder' && !isResponder) {
        navigate('/responder/dashboard', { replace: true })
        return
      }

      if (role === 'admin' && !isAdmin) {
        navigate('/admin/dashboard', { replace: true })
        return
      }

      if (role === 'resident' && isResponder) {
        navigate('/resident/dashboard', { replace: true })
        return
      }

      if (role === 'responder' && isResident) {
        navigate('/responder/dashboard', { replace: true })
        return
      }

      if (role === 'admin' && (isResident || isResponder)) {
        navigate('/admin/dashboard', { replace: true })
      }
    }

    const unsubscribeAuth = auth
      ? onAuthStateChanged(auth, () => {
          authReadyRef.current.auth = true
          void checkUser()
        })
      : null
    const unsubscribeProd = prodAuth
      ? onAuthStateChanged(prodAuth, () => {
          authReadyRef.current.prod = true
          void checkUser()
        })
      : null

    void checkUser()

    return () => {
      unsubscribeAuth?.()
      unsubscribeProd?.()
    }
  }, [isProtectedRoute, isResident, isResponder, isAdmin, navigate])

  return (
    <>
      {isResident && <TopNav />}
      {isProtectedRoute && !authChecked ? null : <Outlet />}
    </>
  )
}
