import React from 'react'
import { NavLink } from 'react-router-dom'

const links = {
  resident: [
    ['Dashboard', '/resident/dashboard'],
    ['Report Alert', '/resident/report'],
    ['Live Map', '/resident/map'],
    ['Notifications', '/resident/notifications'],
    ['Contacts', '/resident/contacts'],
    ['Profile', '/resident/profile'],
  ],
  responder: [
    ['Dashboard', '/responder/dashboard'],
    ['Queue', '/responder/queue'],
    ['Active Responses', '/responder/active'],
    ['Messages', '/responder/messages'],
    ['History', '/responder/history'],
    ['Profile', '/responder/profile'],
  ],
  admin: [
    ['Dashboard', '/admin/dashboard'],
    ['Users', '/admin/users'],
    ['Incidents', '/admin/incidents'],
    ['Map', '/admin/map'],
    ['Announcements', '/admin/announcements'],
    ['Analytics', '/admin/analytics'],
    ['Settings', '/admin/settings'],
  ],
}

export default function Sidebar({ role = 'resident' }) {
  const menu = links[role] || links.resident

  return (
    <nav className="sidebar-nav">
      <div className="sidebar-brand">JiranAlert</div>
      <ul>
        {menu.map(([label, to]) => (
          <li key={to}>
            <NavLink to={to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
