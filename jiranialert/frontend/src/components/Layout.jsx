import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import TopNav from './Layout/TopNav'
import { auth } from '../lib/firebase'

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

    if (!auth) {
      setAuthChecked(true)
      navigate('/login', { replace: true })
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthChecked(true)
      if (!user) navigate('/login', { replace: true })
    })

    return () => unsubscribe()
  }, [isProtectedRoute, navigate])

  return (
    <>
      {isResident && <TopNav />}
      {isProtectedRoute && !authChecked ? null : <Outlet />}
    </>
  )
}
