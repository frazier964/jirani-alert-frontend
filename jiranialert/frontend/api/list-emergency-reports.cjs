let admin
try {
  admin = require('firebase-admin')
} catch {
  admin = require('../../backend/functions/node_modules/firebase-admin')
}

function getAdmin() {
  if (admin.apps.length) return admin

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'jiranialert'
  const serviceAccountValue = process.env.FIREBASE_SERVICE_ACCOUNT
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (serviceAccountValue) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(serviceAccountValue)), projectId })
  } else if (privateKey && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL, privateKey }),
      projectId,
    })
  } else {
    admin.initializeApp({ projectId })
  }
  return admin
}

module.exports = async function listEmergencyReports(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET for this endpoint' })
  try {
    const firebaseAdmin = getAdmin()
    const match = String(req.headers.authorization || '').match(/^Bearer\s+(.+)$/i)
    if (!match) return res.status(401).json({ error: 'Sign in to view emergency incidents' })
    let user
    try {
      user = await firebaseAdmin.auth().verifyIdToken(match[1])
    } catch {
      return res.status(401).json({ error: 'Your session has expired. Sign in again and retry.' })
    }

    const db = firebaseAdmin.firestore()
    const profile = (await db.collection('profiles').doc(user.uid).get()).data() || {}
    const role = String(user.role || profile.role || profile.accountType || '').trim().toLowerCase()
    if (!['admin', 'responder'].includes(role)) {
      return res.status(403).json({ error: 'Responder access is required' })
    }

    const requestedLimit = Number(req.query?.limit || 25)
    const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(Math.floor(requestedLimit), 100)) : 25
    const snapshot = await db.collection('reports').orderBy('createdAt', 'desc').limit(limit).get()
    return res.status(200).json({ reports: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) })
  } catch (error) {
    console.error('Emergency incident listing failed:', error)
    return res.status(500).json({ error: 'Emergency incidents could not be loaded. Please retry.' })
  }
}
