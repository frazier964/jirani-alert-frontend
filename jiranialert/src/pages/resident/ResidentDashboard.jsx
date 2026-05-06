import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function getAlerts() {
  try {
    return JSON.parse(localStorage.getItem('jiranialert_alerts') || '[]')
  } catch (e) {
    return []
  }
}

export default function ResidentDashboard() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    setAlerts(getAlerts().slice(0, 6))
  }, [])

  return (
    <div>
      <h2>Resident Dashboard</h2>
      <section>
        <h3>Emergency status summary</h3>
        <p>Active alerts near you: {alerts.filter(a => a.status === 'active').length}</p>
      </section>

      <section>
        <h3>Recent nearby alerts</h3>
        <ul>
          {alerts.map(a => (
            <li key={a.id}>
              <Link to={`/alerts/${a.id}`}>{a.type} — {a.severity} ({a.status})</Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Quick Actions</h3>
        <Link to="/resident/report"><button>Report Emergency</button></Link>
        <Link to="/resident/map"><button style={{ marginLeft: 8 }}>View Map</button></Link>
      </section>

      <section>
        <h3>Emergency contacts</h3>
        <p>Call: <a href="tel:+123456789">+1 (234) 567-89</a></p>
      </section>
    </div>
  )
}
