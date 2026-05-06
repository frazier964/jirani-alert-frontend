import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

function getAlerts() {
  try {
    return JSON.parse(localStorage.getItem('jiranialert_alerts') || '[]')
  } catch (e) {
    return []
  }
}

function saveAlerts(alerts) {
  localStorage.setItem('jiranialert_alerts', JSON.stringify(alerts || []))
}

export default function AlertDetails() {
  const { id } = useParams()
  const [alert, setAlert] = useState(null)
  const [comment, setComment] = useState('')

  useEffect(() => {
    const alerts = getAlerts()
    const a = alerts.find((x) => x.id === id)
    setAlert(a || null)
  }, [id])

  if (!alert) return <div>Alert not found</div>

  function addComment() {
    if (!comment) return
    const alerts = getAlerts()
    const idx = alerts.findIndex((x) => x.id === alert.id)
    if (idx === -1) return
    alerts[idx].comments = alerts[idx].comments || []
    alerts[idx].comments.push({ id: Date.now().toString(), text: comment, at: new Date().toISOString() })
    saveAlerts(alerts)
    setAlert(alerts[idx])
    setComment('')
  }

  function markSafe() {
    const alerts = getAlerts()
    const idx = alerts.findIndex((x) => x.id === alert.id)
    if (idx === -1) return
    alerts[idx].status = 'resolved'
    saveAlerts(alerts)
    setAlert(alerts[idx])
  }

  return (
    <div>
      <h2>{alert.type} — {alert.severity}</h2>
      <p>{alert.description}</p>
      <p>Reported: {alert.createdAt}</p>
      <p>Reporter: {alert.anonymous ? 'Anonymous' : alert.reporterEmail}</p>

      <div>
        <h3>Live updates</h3>
        <ul>
          {(alert.comments || []).map((c) => (
            <li key={c.id}>{c.text} <small>({c.at})</small></li>
          ))}
        </ul>
      </div>

      <div style={{ marginTop: 12 }}>
        <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment" />
        <button onClick={addComment}>Comment</button>
        <button onClick={markSafe} style={{ marginLeft: 8 }}>Mark Safe</button>
      </div>
    </div>
  )
}
