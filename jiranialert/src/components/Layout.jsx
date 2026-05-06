import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TopNav from './Layout/TopNav'

export default function Layout() {
  const location = useLocation()
  const isResident = location.pathname.startsWith('/resident')

  return (
    <>
      {isResident && <TopNav />}
      <Outlet />
    </>
  )
}
