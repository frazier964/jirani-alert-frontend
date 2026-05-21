const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const { getFirestore, FieldValue } = require('firebase-admin/firestore')
const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')

function loadLocalEnv() {
  const envFile = path.join(__dirname, '.env')
  if (!fs.existsSync(envFile)) return

  const data = fs.readFileSync(envFile, 'utf8')
  data.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const equalsIndex = trimmed.indexOf('=')
    if (equalsIndex === -1) return

    const key = trimmed.slice(0, equalsIndex).trim()
    let value = trimmed.slice(equalsIndex + 1).trim()
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  })
}

loadLocalEnv()

if (process.env.NODE_ENV !== 'production') {
  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9198'
  }
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8181'
  }
}

admin.initializeApp()

const db = getFirestore()

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://jirani-alert-frontend.vercel.app',
])

const allowedRoles = new Set(['resident', 'responder', 'admin'])
let mailTransporter = null

function normalizeEnvValue(value) {
  if (typeof value !== 'string') return ''
  let normalized = value.trim()
  if (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1)
  }
  return normalized
}

function getEnv(name) {
  return normalizeEnvValue(process.env[name] || process.env[name.toLowerCase()] || '')
}

function getMailTransporter() {
  const gmailUser = getEnv('GMAIL_USER')
  const gmailPass = getEnv('GMAIL_APP_PASSWORD').replace(/\s+/g, '')
  const smtpHost = getEnv('SMTP_HOST')
  const smtpPort = Number(getEnv('SMTP_PORT') || 587)
  const smtpUser = getEnv('SMTP_USER')
  const smtpPass = getEnv('SMTP_PASS')

  if (!gmailUser && !smtpHost) return null
  if (mailTransporter) return mailTransporter

  if (gmailUser && gmailPass) {
    mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    })
    return mailTransporter
  }

  if (smtpHost && smtpUser && smtpPass) {
    mailTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    })
    return mailTransporter
  }

  return null
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function sendSignupConfirmationEmail({ to, displayName, role }) {
  const transporter = getMailTransporter()
  if (!transporter || !to) return { sent: false, reason: 'Email is not configured' }

  const mailFrom =
    getEnv('MAIL_FROM') ||
    getEnv('GMAIL_USER') ||
    getEnv('SMTP_USER') ||
    'Jirani Alert <officialmablaryyvisuals@gmail.com>'
  const appUrl = getEnv('APP_URL') || 'https://jirani-alert-frontend.vercel.app'
  const safeName = displayName || 'there'
  const roleLabel = role === 'responder' ? 'Emergency Responder' : role === 'admin' ? 'Local Admin' : 'Resident'
  const htmlName = escapeHtml(safeName)
  const htmlRoleLabel = escapeHtml(roleLabel)
  const htmlAppUrl = escapeHtml(appUrl)

  await transporter.sendMail({
    from: mailFrom,
    replyTo: mailFrom,
    to,
    subject: 'Welcome to Jirani Alert',
    text: [
      `Hi ${safeName},`,
      '',
      `Your Jirani Alert ${roleLabel} account has been created successfully.`,
      'You can now sign in, manage your profile, and use live emergency reporting features.',
      '',
      `Open Jirani Alert: ${appUrl}`,
      '',
      'Stay safe,',
      'Jirani Alert Team',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="color:#2563eb">Welcome to Jirani Alert</h2>
        <p>Hi ${htmlName},</p>
        <p>Your <strong>${htmlRoleLabel}</strong> account has been created successfully.</p>
        <p>You can now sign in, manage your profile, and use live emergency reporting features.</p>
        <p><a href="${htmlAppUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">Open Jirani Alert</a></p>
        <p style="color:#64748b;font-size:13px">If you did not create this account, please contact Jirani Alert support.</p>
      </div>
    `,
  })

  return { sent: true }
}

function getEmailTestSecret() {
  return getEnv('EMAIL_TEST_SECRET')
}

function verifyTestEmailAccess(req) {
  const secret = getEmailTestSecret()
  if (secret) {
    const token = String((req.query && req.query.secret) || (req.body && req.body.secret) || '').trim()
    if (!token || token !== secret) {
      const error = new Error('Invalid email test secret')
      error.status = 401
      throw error
    }
  } else if (process.env.NODE_ENV === 'production') {
    const error = new Error('Email test endpoint is disabled in production')
    error.status = 403
    throw error
  }
}

async function sendTestEmail({ to, subject, message }) {
  const transporter = getMailTransporter()
  if (!transporter || !to) return { sent: false, reason: 'Email is not configured' }

  const mailFrom =
    getEnv('MAIL_FROM') ||
    getEnv('GMAIL_USER') ||
    getEnv('SMTP_USER') ||
    'Jirani Alert <officialmablaryyvisuals@gmail.com>'

  await transporter.sendMail({
    from: mailFrom,
    replyTo: mailFrom,
    to,
    subject: subject || 'Jirani Alert test email',
    text: message || 'This is a test email from the Jirani Alert backend.',
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a"><p>${escapeHtml(
      message || 'This is a test email from the Jirani Alert backend.',
    )}</p></div>`,
  })

  return { sent: true }
}

exports.sendTestEmail = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    verifyTestEmailAccess(req)

    const body = req.body || {}
    const to = String(body.to || req.query?.to || 'mabwogahillary@gmail.com').trim()
    const subject = String(body.subject || req.query?.subject || 'Jirani Alert test email').trim()
    const message = String(
      body.message || req.query?.message || 'This is a test email from the Jirani Alert backend.',
    ).trim()

    if (!to) {
      const error = new Error('Recipient email is required')
      error.status = 400
      throw error
    }

    const result = await sendTestEmail({ to, subject, message })
    res.json({ ok: true, result })
  } catch (error) {
    sendError(res, error)
  }
})

function isAllowedOrigin(origin) {
  if (!origin) return false
  if (allowedOrigins.has(origin)) return true
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true
  return /^https:\/\/jirani-alert-frontend(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin)
}

function setCors(req, res) {
  const origin = req.get('origin')
  if (isAllowedOrigin(origin)) {
    res.set('Access-Control-Allow-Origin', origin)
    res.set('Access-Control-Allow-Credentials', 'true')
  }
  res.set('Vary', 'Origin')
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Max-Age', '600')
}

function handleOptions(req, res) {
  setCors(req, res)
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return true
  }
  return false
}

async function requireUser(req) {
  const header = req.get('authorization') || ''
  const match = header.match(/^Bearer (.+)$/)
  if (!match) {
    const error = new Error('Missing Firebase ID token')
    error.status = 401
    throw error
  }

  try {
    return await admin.auth().verifyIdToken(match[1])
  } catch (e) {
    const error = new Error('Invalid or expired Firebase ID token')
    error.status = 401
    throw error
  }
}

function sendError(res, error) {
  const status = error.status || 500
  if (status === 500) {
    console.error(error)
  }
  const payload = {
    error: status === 500 ? 'Internal server error' : error.message,
  }
  if (status === 500 && process.env.NODE_ENV !== 'production') {
    payload.error = error.message || 'Internal server error'
    payload.stack = error.stack ? error.stack.split('\n') : []
  }
  res.status(status).json(payload)
}

function requireMethod(req, method) {
  if (req.method !== method) {
    const error = new Error(`Use ${method} for this endpoint`)
    error.status = 405
    throw error
  }
}

function requiredString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    const error = new Error(`${field} is required`)
    error.status = 400
    throw error
  }
  return value.trim()
}

exports.health = onRequest({ region: 'us-central1' }, (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  res.json({
    ok: true,
    service: 'jiranialert-firebase-backend',
    timestamp: new Date().toISOString(),
  })
})

exports.createUserProfile = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)
    const body = req.body || {}

    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : ''
    const requestedRole = typeof body.role === 'string' ? body.role.trim() : 'resident'
    const role = allowedRoles.has(requestedRole) ? requestedRole : 'resident'
    const now = FieldValue.serverTimestamp()
    const profileRef = db.collection('profiles').doc(user.uid)
    const notificationRef = db.collection('notifications').doc()
    const email = user.email || ''
    const emailVerified = Boolean(user.email_verified || user.emailVerified)

    try {
      await admin.auth().setCustomUserClaims(user.uid, { role })
    } catch (claimsError) {
      console.warn('Could not set custom user claims:', claimsError.message || claimsError)
    }

    await db.runTransaction(async (transaction) => {
      transaction.set(
        profileRef,
        {
          uid: user.uid,
          email,
          displayName,
          role,
          accountStatus: 'active',
          emailVerified,
          authProvider: 'password',
          profileImageUrl: '',
          createdAt: now,
          updatedAt: now,
        },
        { merge: true },
      )

      transaction.set(notificationRef, {
        recipientId: user.uid,
        title: 'Account created',
        message: 'Your Jirani Alert account is active and ready to use.',
        read: false,
        createdAt: now,
      })
    })

    let confirmationEmail = { sent: false, reason: 'Email is not configured' }
    try {
      confirmationEmail = await sendSignupConfirmationEmail({ to: email, displayName, role })
    } catch (emailError) {
      confirmationEmail = { sent: false, reason: emailError.message || 'Email could not be sent' }
    }

    const saved = await profileRef.get()
    res.status(201).json({
      ok: true,
      profile: saved.data(),
      notificationId: notificationRef.id,
      confirmationEmail,
    })
  } catch (error) {
    sendError(res, error)
  }
})

exports.createEmergencyReport = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)
    const body = req.body || {}

    const type = requiredString(body.type, 'type')
    const title = requiredString(body.title, 'title')
    const location = requiredString(body.location, 'location')
    const description = requiredString(body.description, 'description')
    const severity = typeof body.severity === 'string' ? body.severity.trim() : 'Medium'
    const anonymous = Boolean(body.anonymous)
    const evidenceUrl = typeof body.evidenceUrl === 'string' && body.evidenceUrl.trim() !== '' ? body.evidenceUrl.trim() : null
    const notify = Array.isArray(body.notify) ? body.notify : []

    const now = FieldValue.serverTimestamp()
    const reportRef = db.collection('reports').doc()
    const alertRef = db.collection('alerts').doc(reportRef.id)
    const notificationRef = db.collection('notifications').doc()

    await db.runTransaction(async (transaction) => {
      transaction.set(reportRef, {
        type,
        title,
        location,
        description,
        severity,
        anonymous,
        status: 'Pending',
        evidenceUrl: evidenceUrl || null,
        notify: notify || [],
        reporterId: user.uid,
        reporterEmail: anonymous ? null : user.email || null,
        createdAt: now,
        updatedAt: now,
      })

      transaction.set(alertRef, {
        reportId: reportRef.id,
        type,
        title,
        location,
        description,
        severity,
        status: 'Active',
        evidenceUrl: evidenceUrl || null,
        createdAt: now,
        updatedAt: now,
      })

      transaction.set(notificationRef, {
        recipientId: user.uid,
        title: 'Report received',
        message: `Your ${type.toLowerCase()} report has been submitted.`,
        reportId: reportRef.id,
        read: false,
        createdAt: now,
      })
    })

    res.status(201).json({
      reportId: reportRef.id,
      alertId: alertRef.id,
      notificationId: notificationRef.id,
    })
  } catch (error) {
    sendError(res, error)
  }
})

exports.listEmergencyReports = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'GET')
    const user = await requireUser(req)
    const role = user.role || 'resident'
    const limit = Math.min(Number(req.query.limit || 25), 100)

    let query = db.collection('reports').orderBy('createdAt', 'desc').limit(limit)
    if (!['admin', 'responder'].includes(role)) {
      query = db
        .collection('reports')
        .where('reporterId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(limit)
    }

    const snapshot = await query.get()
    res.json({
      reports: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    })
  } catch (error) {
    sendError(res, error)
  }
})

exports.getEmergencyReport = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'GET')
    const user = await requireUser(req)
    const reportId = req.path.replace(/^\//, '') || req.query.reportId
    if (!reportId) {
      const error = new Error('reportId is required in path')
      error.status = 400
      throw error
    }

    const report = await db.collection('reports').doc(reportId).get()
    if (!report.exists) {
      const error = new Error('Report not found')
      error.status = 404
      throw error
    }

    const data = report.data()
    const role = user.role || 'resident'
    if (data.reporterId !== user.uid && !['admin', 'responder'].includes(role)) {
      const error = new Error('You cannot view this report')
      error.status = 403
      throw error
    }

    res.json({ report: { id: report.id, ...data } })
  } catch (error) {
    sendError(res, error)
  }
})

exports.listNotifications = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'GET')
    const user = await requireUser(req)
    const limit = Math.min(Number(req.query.limit || 25), 100)

    const snapshot = await db
      .collection('notifications')
      .where('recipientId', '==', user.uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    res.json({
      notifications: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    })
  } catch (error) {
    sendError(res, error)
  }
})

exports.markNotificationRead = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)
    const notificationId = requiredString(req.body && req.body.notificationId, 'notificationId')
    const notificationRef = db.collection('notifications').doc(notificationId)
    const notification = await notificationRef.get()

    if (!notification.exists) {
      const error = new Error('Notification not found')
      error.status = 404
      throw error
    }

    if (notification.data().recipientId !== user.uid) {
      const error = new Error('You cannot update this notification')
      error.status = 403
      throw error
    }

    await notificationRef.update({
      read: true,
      readAt: FieldValue.serverTimestamp(),
    })

    res.json({ ok: true })
  } catch (error) {
    sendError(res, error)
  }
})

exports.markAllNotificationsRead = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)

    const snapshot = await db
      .collection('notifications')
      .where('recipientId', '==', user.uid)
      .where('read', '==', false)
      .limit(200)
      .get()

    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        read: true,
        readAt: FieldValue.serverTimestamp(),
      })
    })
    await batch.commit()

    res.json({ ok: true, updatedCount: snapshot.size })
  } catch (error) {
    sendError(res, error)
  }
})

exports.deleteNotification = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)
    const notificationId = requiredString(req.body && req.body.notificationId, 'notificationId')
    const notificationRef = db.collection('notifications').doc(notificationId)
    const notification = await notificationRef.get()

    if (!notification.exists) {
      const error = new Error('Notification not found')
      error.status = 404
      throw error
    }

    if (notification.data().recipientId !== user.uid) {
      const error = new Error('You cannot delete this notification')
      error.status = 403
      throw error
    }

    await notificationRef.delete()
    res.json({ ok: true })
  } catch (error) {
    sendError(res, error)
  }
})

exports.clearNotifications = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)

    const snapshot = await db
      .collection('notifications')
      .where('recipientId', '==', user.uid)
      .limit(200)
      .get()

    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref)
    })
    await batch.commit()

    res.json({ ok: true, deletedCount: snapshot.size })
  } catch (error) {
    sendError(res, error)
  }
})

// Get user profile (public)
exports.getUserProfile = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'GET')
    const userId = req.path.replace(/^\//, '') || req.query.userId
    if (!userId) {
      const error = new Error('userId is required in path')
      error.status = 400
      throw error
    }

    const doc = await db.collection('profiles').doc(userId).get()
    if (!doc.exists) return res.json({ profile: null })
    res.json({ profile: doc.data() })
  } catch (error) {
    sendError(res, error)
  }
})

// Update user profile (public for prototype)
exports.updateUserProfile = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    // require authenticated user; use their uid for profile id
    const user = await requireUser(req)
    const userId = user.uid

    const body = req.body || {}
    const updates = {}
    if (typeof body.displayName === 'string') updates.displayName = body.displayName.trim()
    if (typeof body.phoneNumber === 'string') updates.phoneNumber = body.phoneNumber.trim()
    if (typeof body.residentialArea === 'string') updates.residentialArea = body.residentialArea.trim()
    if (typeof body.profileImageUrl === 'string') updates.profileImageUrl = body.profileImageUrl
    if (typeof body.theme === 'string') updates.theme = body.theme.trim()
    if (typeof body.highContrast === 'boolean') updates.highContrast = body.highContrast
    if (typeof body.textSize === 'string') updates.textSize = body.textSize.trim()
    if (typeof body.alertTone === 'string') updates.alertTone = body.alertTone.trim()
    updates.updatedAt = FieldValue.serverTimestamp()

    await db.collection('profiles').doc(userId).set(updates, { merge: true })

    const saved = await db.collection('profiles').doc(userId).get()
    res.json({ ok: true, profile: saved.data() })
  } catch (error) {
    sendError(res, error)
  }
})

// Contacts
function sanitizeContact(payload) {
  const body = payload || {}
  const contact = {}
  contact.fullName = requiredString(body.fullName, 'fullName')
  contact.phoneNumber = requiredString(body.phoneNumber, 'phoneNumber')

  if (typeof body.email === 'string') contact.email = body.email.trim()
  if (typeof body.category === 'string') contact.category = body.category.trim()
  if (typeof body.location === 'string') contact.location = body.location.trim()
  if (typeof body.emergencyLevel === 'string') contact.emergencyLevel = body.emergencyLevel.trim()
  if (typeof body.notes === 'string') contact.notes = body.notes.trim()
  if (typeof body.profileImageUrl === 'string') contact.profileImageUrl = body.profileImageUrl
  if (typeof body.favorite === 'boolean') contact.favorite = body.favorite

  // defaults
  if (!contact.email) contact.email = ''
  if (!contact.category) contact.category = 'Family'
  if (!contact.location) contact.location = ''
  if (!contact.emergencyLevel) contact.emergencyLevel = 'Normal'
  if (!contact.notes) contact.notes = ''
  if (!contact.profileImageUrl) contact.profileImageUrl = ''
  if (typeof contact.favorite !== 'boolean') contact.favorite = false

  return contact
}

exports.listContacts = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'GET')
    const user = await requireUser(req)
    const snapshot = await db
      .collection('profiles')
      .doc(user.uid)
      .collection('contacts')
      .orderBy('updatedAt', 'desc')
      .limit(200)
      .get()

    res.json({
      contacts: snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    })
  } catch (error) {
    sendError(res, error)
  }
})

exports.upsertContact = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)

    const body = req.body || {}
    const contactId = typeof body.contactId === 'string' && body.contactId.trim() !== '' ? body.contactId.trim() : null
    const contact = sanitizeContact(body)

    const now = FieldValue.serverTimestamp()
    const ref = contactId
      ? db.collection('profiles').doc(user.uid).collection('contacts').doc(contactId)
      : db.collection('profiles').doc(user.uid).collection('contacts').doc()

    const existing = await ref.get()
    const isNew = !existing.exists

    await ref.set(
      {
        ...contact,
        updatedAt: now,
        ...(isNew ? { createdAt: now } : {}),
      },
      { merge: true },
    )

    const saved = await ref.get()
    res.json({ ok: true, contact: { id: ref.id, ...saved.data() } })
  } catch (error) {
    sendError(res, error)
  }
})

exports.deleteContact = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)
    const contactId = requiredString(req.body && req.body.contactId, 'contactId')
    const ref = db.collection('profiles').doc(user.uid).collection('contacts').doc(contactId)
    await ref.delete()
    res.json({ ok: true })
  } catch (error) {
    sendError(res, error)
  }
})

// Community Feed - Get all posts with interaction counts
exports.getCommunityFeed = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'GET')
    const user = await requireUser(req)
    const limit = Math.min(Number(req.query.limit || 50), 100)

    const snapshot = await db
      .collection('communityPosts')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get()

    const posts = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const data = doc.data()
        const likesSnap = await db
          .collection('communityPosts')
          .doc(doc.id)
          .collection('likes')
          .get()
        const commentsSnap = await db
          .collection('communityPosts')
          .doc(doc.id)
          .collection('comments')
          .get()
        const userLiked = await db
          .collection('communityPosts')
          .doc(doc.id)
          .collection('likes')
          .doc(user.uid)
          .get()

        return {
          id: doc.id,
          ...data,
          likeCount: likesSnap.size,
          commentCount: commentsSnap.size,
          userLiked: userLiked.exists,
          likes: likesSnap.docs.map((d) => ({ userId: d.id, ...d.data() })),
          comments: commentsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
        }
      }),
    )

    res.json({ posts })
  } catch (error) {
    sendError(res, error)
  }
})

// Community Feed - Like/Unlike a post
exports.toggleLikePost = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)
    const postId = requiredString(req.body && req.body.postId, 'postId')

    const postRef = db.collection('communityPosts').doc(postId)
    const postExists = await postRef.get()

    if (!postExists.exists) {
      const error = new Error('Post not found')
      error.status = 404
      throw error
    }

    const likeRef = postRef.collection('likes').doc(user.uid)
    const likeExists = await likeRef.get()

    if (likeExists.exists) {
      await likeRef.delete()
    } else {
      await likeRef.set({
        userId: user.uid,
        createdAt: FieldValue.serverTimestamp(),
      })
    }

    const likesSnap = await postRef.collection('likes').get()
    res.json({
      ok: true,
      postId,
      liked: !likeExists.exists,
      likeCount: likesSnap.size,
    })
  } catch (error) {
    sendError(res, error)
  }
})

// Community Feed - Add comment to post
exports.commentOnPost = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)
    const postId = requiredString(req.body && req.body.postId, 'postId')
    const text = requiredString(req.body && req.body.text, 'text')

    const postRef = db.collection('communityPosts').doc(postId)
    const postExists = await postRef.get()

    if (!postExists.exists) {
      const error = new Error('Post not found')
      error.status = 404
      throw error
    }

    const commentRef = postRef.collection('comments').doc()
    await commentRef.set({
      userId: user.uid,
      text,
      createdAt: FieldValue.serverTimestamp(),
    })

    const commentsSnap = await postRef.collection('comments').get()
    res.json({
      ok: true,
      postId,
      commentId: commentRef.id,
      commentCount: commentsSnap.size,
    })
  } catch (error) {
    sendError(res, error)
  }
})

// Community Feed - Track shares
exports.sharePost = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)
    const postId = requiredString(req.body && req.body.postId, 'postId')

    const postRef = db.collection('communityPosts').doc(postId)
    const postExists = await postRef.get()

    if (!postExists.exists) {
      const error = new Error('Post not found')
      error.status = 404
      throw error
    }

    const shareRef = postRef.collection('shares').doc()
    await shareRef.set({
      userId: user.uid,
      createdAt: FieldValue.serverTimestamp(),
    })

    const sharesSnap = await postRef.collection('shares').get()
    res.json({
      ok: true,
      postId,
      shareCount: sharesSnap.size,
    })
  } catch (error) {
    sendError(res, error)
  }
})
