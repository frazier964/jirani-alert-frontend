// Simple localStorage-based auth helper for prototyping
const USERS_KEY = 'jiranialert_users'
const CURRENT_KEY = 'jiranialert_current'

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch (e) {
    return []
  }
}

export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users || []))
}

export function registerUser({ email, password, role }) {
  const users = getUsers()
  if (users.find((u) => u.email === email)) {
    throw new Error('User already exists')
  }
  const user = { id: Date.now().toString(), email, password, role }
  users.push(user)
  saveUsers(users)
  setCurrentUser(user)
  return user
}

export function loginUser({ email, password }) {
  const users = getUsers()
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) throw new Error('Invalid credentials')
  setCurrentUser(user)
  return user
}

export function setCurrentUser(user) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(user || null))
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_KEY) || 'null')
  } catch (e) {
    return null
  }
}

export function logout() {
  localStorage.removeItem(CURRENT_KEY)
}
