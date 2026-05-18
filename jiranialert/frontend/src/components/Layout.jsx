import React, { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import TopNav from './Layout/TopNav'
import { auth } from '../lib/firebase'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isResident = location.pathname.startsWith('/resident')
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    if (!isResident) {
      setAuthChecked(true)
      return undefined
    }

    if (!auth) {
      setAuthChecked(true)
      return undefined
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthChecked(true)
      if (!user) navigate('/login', { replace: true })
    })

    return () => unsubscribe()
  }, [isResident, navigate])

  return (
    <>
      {isResident && <TopNav />}
      {isResident && !authChecked ? null : <Outlet />}
    </>
  )
}
