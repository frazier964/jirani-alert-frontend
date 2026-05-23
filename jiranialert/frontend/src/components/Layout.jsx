import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import TopNav from './Layout/TopNav'
import { auth, prodAuth } from '../lib/firebase'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isResident = location.pathname.startsWith('/resident')
  const isProtectedRoute = ['/resident', '/responder', '/admin', '/alerts'].some((prefix) =>
    location.pathname.startsWith(prefix),
  )
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (!isProtectedRoute) {
      setAuthChecked(true)
      return undefined
    }

    if (!auth && !prodAuth) {
      setAuthChecked(true)
      navigate('/login', { replace: true })
      return undefined
    }

    const checkUser = () => {
      const user = auth?.currentUser || prodAuth?.currentUser
      setAuthChecked(true)
      if (!user) {
        navigate('/login', { replace: true })
        return
      }
      if (!user.emailVerified) {
        navigate('/login?verificationPending=true', { replace: true })
      }
    }

    checkUser()
    const unsubscribeAuth = auth ? onAuthStateChanged(auth, checkUser) : null
    const unsubscribeProd = prodAuth ? onAuthStateChanged(prodAuth, checkUser) : null

    return () => {
      unsubscribeAuth?.()
      unsubscribeProd?.()
    }
  }, [isProtectedRoute, navigate])

  return (
    <>
      {isResident && <TopNav />}
      {isProtectedRoute && !authChecked ? null : <Outlet />}
    </>
  )
}
