import React from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import './layout.css'
import { getCurrentUser, logout } from '../lib/auth'

export default function Layout() {
  const user = getCurrentUser()
  const role = user?.role || 'resident'
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="app-root">
      <aside className="app-sidebar">
        <Sidebar role={role} />
      </aside>
      <main className="app-main">
        <header className="app-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1>JiranAlert</h1>
            <div>
              <span style={{ marginRight: 12 }}>{user?.email || 'Guest'}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </header>
        <section className="app-content">
          <Outlet />
        </section>
      </main>
    </div>
  )
}
