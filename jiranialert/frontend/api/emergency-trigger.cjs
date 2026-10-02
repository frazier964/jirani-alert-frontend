let admin
try {
  admin = require('firebase-admin')
} catch {
  // Reuse the checked-in backend dependency for local development in this monorepo.
  admin = require('../../backend/functions/node_modules/firebase-admin')
}

function initializeFirebaseAdmin() {
  if (admin.apps.length) return

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || 'jiranialert'
  const serviceAccountValue = process.env.FIREBASE_SERVICE_ACCOUNT
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (serviceAccountValue) {
    const serviceAccount = JSON.parse(serviceAccountValue)
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount), projectId })
    return
  }

  if (privateKey && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
      projectId,
    })
    return
  }

  // Supports Google-hosted runtimes and local emulator credentials.
  admin.initializeApp({ projectId })
}

function fail(status, message) {
  const error = new Error(message)
  error.status = status
  throw error
}

function stringValue(value, maxLength = 120) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

module.exports = async function triggerEmergency(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const origin = req.headers.origin
  if (origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST for this endpoint' })

  try {
    initializeFirebaseAdmin()
    const body = req.body && typeof req.body === 'object' ? req.body : {}
    const idempotencyKey = stringValue(body.idempotencyKey)
    const guestIdentifier = stringValue(body.guestIdentifier)
    if (!idempotencyKey || !/^[\w-]{1,120}$/.test(idempotencyKey)) fail(400, 'A valid idempotencyKey is required')
    if (!guestIdentifier) fail(400, 'A guestIdentifier is required')

    const authorization = req.headers.authorization || ''
    let user = null
    if (authorization) {
      const match = authorization.match(/^Bearer\s+(.+)$/i)
      if (!match) fail(401, 'Invalid authorization header')
      try {
        user = await admin.auth().verifyIdToken(match[1])
      } catch {
        fail(401, 'Your session has expired. Sign in again and retry the emergency alert.')
      }
    }

    const coordinates = body.locationCoordinates
    let locationCoordinates = null
    if (coordinates != null) {
      const latitude = Number(coordinates.latitude)
      const longitude = Number(coordinates.longitude)
      if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude) || Math.abs(longitude) > 180) {
        fail(400, 'Location coordinates are invalid')
      }
      locationCoordinates = { latitude, longitude }
    }

    const db = admin.firestore()
    const activationRef = db.collection('emergencyActivations').doc(idempotencyKey)
    const reportRef = db.collection('reports').doc()
    const alertRef = db.collection('alerts').doc(reportRef.id)
    const now = admin.firestore.FieldValue.serverTimestamp()
    let existingReportId = null

    const profiles = await db.collection('profiles').where('role', 'in', ['responder', 'admin']).get().catch(() => ({ docs: [] }))
    const alternateProfiles = await db.collection('profiles').where('accountType', 'in', ['responder', 'admin']).get().catch(() => ({ docs: [] }))
    const responders = new Map()
    profiles.docs.concat(alternateProfiles.docs).forEach((profile) => responders.set(profile.id, profile))
    const responderNotifications = [...responders.keys()]
      .filter((recipientId) => recipientId !== user?.uid)
      .map((recipientId) => ({ recipientId, ref: db.collection('notifications').doc() }))

    await db.runTransaction(async (transaction) => {
      const activation = await transaction.get(activationRef)
      if (activation.exists) {
        existingReportId = activation.data().reportId
        return
      }

      const location = locationCoordinates
        ? `${locationCoordinates.latitude}, ${locationCoordinates.longitude}`
        : 'Location unavailable'
      transaction.create(activationRef, {
        reportId: reportRef.id,
        userId: user?.uid || null,
        guestIdentifier,
        createdAt: now,
      })
      transaction.set(reportRef, {
        type: 'Emergency',
        title: 'Emergency alert',
        description: '',
        location,
        locationCoordinates,
        severity: 'Critical',
        status: 'Pending',
        activationMethod: 'HOLD_TO_ALERT',
        userId: user?.uid || null,
        reporterId: user?.uid || null,
        guestIdentifier: user ? null : guestIdentifier,
        isPublic: true,
        anonymous: !user,
        createdAt: now,
        updatedAt: now,
      })
      transaction.set(alertRef, {
        reportId: reportRef.id,
        type: 'Emergency',
        title: 'Emergency alert',
        location,
        severity: 'Critical',
        status: 'Active',
        activationMethod: 'HOLD_TO_ALERT',
        isPublic: true,
        createdAt: now,
        updatedAt: now,
      })
      responderNotifications.forEach(({ recipientId, ref }) => transaction.set(ref, {
        recipientId,
        title: 'ACTIVE emergency alert',
        message: 'A hold-to-alert emergency was activated. Open the incident queue immediately.',
        reportId: reportRef.id,
        read: false,
        createdAt: now,
      }))
    })

    const reportId = existingReportId || reportRef.id
    return res.status(existingReportId ? 200 : 201).json({
      emergencyId: reportId,
      reportId,
      status: 'ACTIVE',
      alreadyActivated: Boolean(existingReportId),
    })
  } catch (error) {
    const status = error.status || 500
    if (status >= 500) console.error('Emergency trigger failed:', error)
    return res.status(status).json({ error: status >= 500 ? 'Emergency alert could not be saved. Please retry.' : error.message })
  }
}
