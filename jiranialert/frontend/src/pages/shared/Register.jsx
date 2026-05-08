import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../../lib/auth'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('resident')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const user = registerUser({ email, password, role })
      // redirect to role-specific dashboard
      if (user.role === 'resident') navigate('/resident/dashboard')
      else if (user.role === 'responder') navigate('/responder/dashboard')
      else navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div style={{ padding: 40, maxWidth: 640 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <br />
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label>Account Type</label>
          <br />
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="resident">Resident / Community Member</option>
            <option value="responder">Emergency Responder</option>
            <option value="admin">Local Admin</option>
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <button type="submit">Create Account</button>
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </form>
    </div>
  )
}
