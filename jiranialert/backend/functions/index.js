const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')
const firestoreAdmin = require('firebase-admin/firestore')
const { getFirestore } = firestoreAdmin
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

const isLocalRuntime =
  process.env.FUNCTIONS_EMULATOR === 'true' ||
  process.env.NODE_ENV !== 'production'

if (isLocalRuntime) {
  // Align with firebase.json emulator ports to avoid startup timeouts and
  // metadata lookups against unavailable local endpoints.
  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'
  }
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:9001'
  }
  if (!process.env.GOOGLE_CLOUD_PROJECT) {
    process.env.GOOGLE_CLOUD_PROJECT = process.env.GCLOUD_PROJECT || 'jiranialert'
  }
  if (!process.env.GCLOUD_PROJECT) {
    process.env.GCLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT
  }
}

admin.initializeApp()

const db = getFirestore()

function serverTimestampValue() {
  if (admin.firestore?.FieldValue?.serverTimestamp) {
    return admin.firestore.FieldValue.serverTimestamp()
  }
  if (firestoreAdmin.FieldValue?.serverTimestamp) {
    return firestoreAdmin.FieldValue.serverTimestamp()
  }
  throw new Error('Firestore serverTimestamp is unavailable')
}

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

function getMailFromAddress() {
  return (
    getEnv('MAIL_FROM') ||
    getEnv('GMAIL_USER') ||
    getEnv('SMTP_USER') ||
    'Jirani Alert <no-reply@jiranialert.local>'
  )
}

function getMailTransporter() {
  const gmailUser = getEnv('GMAIL_USER')
  const gmailPass = getEnv('GMAIL_APP_PASSWORD').replace(/\s+/g, '')
  const smtpHost = getEnv('SMTP_HOST')
  const smtpPort = Number(getEnv('SMTP_PORT') || 587)
  const smtpUser = getEnv('SMTP_USER')
  const smtpPass = getEnv('SMTP_PASS')

  if (!gmailUser && !smtpHost) {
    console.warn('Email not configured: missing SMTP or Gmail credentials')
    return null
  }
  if (mailTransporter) return mailTransporter

  if (gmailUser && !gmailPass) {
    console.warn('Email not configured: GMAIL_APP_PASSWORD is missing')
    return null
  }

  if (gmailUser && gmailPass) {
    console.log(`Configuring Gmail SMTP transporter for ${gmailUser}`)
    mailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
      tls: {
        rejectUnauthorized: false,
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

  if (smtpHost && (!smtpUser || !smtpPass)) {
    console.warn('Email not configured: SMTP_HOST requires SMTP_USER and SMTP_PASS')
    return null
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

function getFrontendAppUrl(req) {
  const origin = String(req?.get?.('origin') || '').trim()
  if (origin && isAllowedOrigin(origin)) {
    return origin
  }

  return getEnv('APP_URL') || 'https://jirani-alert-frontend.vercel.app'
}

async function generateEmailVerificationLink(to, appUrl) {
  const destinationAppUrl = appUrl || getEnv('APP_URL') || 'https://jirani-alert-frontend.vercel.app'
  if (!to) {
    throw new Error('Recipient email is required for verification link generation')
  }

  const link = await admin.auth().generateEmailVerificationLink(to, {
    url: `${destinationAppUrl}/verify-email`,
    handleCodeInApp: true,
  })

  console.log(`Generated verification link for ${to}`)
  return link
}

async function sendSignupConfirmationEmail({ to, displayName, firstName, fullName, role, verificationLink, appUrl }) {
  const transporter = getMailTransporter()
  if (!to) return { sent: false, reason: 'Recipient email is required', verificationLink }
  if (!transporter) return { sent: false, reason: 'Email is not configured', verificationLink }

  const mailFrom = getMailFromAddress()
  const resolvedAppUrl = appUrl || getEnv('APP_URL') || 'https://jirani-alert-frontend.vercel.app'
  const safeName = firstName || displayName || fullName || 'there'
  const roleLabel = role === 'responder' ? 'Emergency Responder' : role === 'admin' ? 'Local Admin' : 'Resident'
  const roleTone = role === 'responder' ? '#0f766e' : role === 'admin' ? '#7c2d12' : '#1d4ed8'
  const htmlName = escapeHtml(safeName)
  const htmlRoleLabel = escapeHtml(roleLabel)
  const htmlAppUrl = escapeHtml(resolvedAppUrl)
  const verificationHref = verificationLink || `${resolvedAppUrl}/verify-email`
  const htmlVerificationLink = escapeHtml(verificationHref)
  const verificationPreview = escapeHtml(new URL(verificationHref).host)

  const info = await transporter.sendMail({
    from: mailFrom,
    replyTo: mailFrom,
    to,
    subject: 'Confirm your Jirani Alert account',
    text: [
      `Hi ${safeName},`,
      '',
      `Thanks for signing up for Jirani Alert as a ${roleLabel}.`,
      '',
      'Verify your email to activate your account and unlock the correct dashboard for your role.',
      '',
      `Verification link: ${verificationHref}`,
      '',
      `Open Jirani Alert: ${resolvedAppUrl}`,
      '',
      'Stay safe,',
      'Jirani Alert Team',
    ].join('\n'),
    html: `
      <div style="margin:0;padding:0;background:#eef4fb">
        <div style="max-width:680px;margin:0 auto;padding:28px 16px;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
          <div style="border-radius:28px;overflow:hidden;border:1px solid #dbe4f0;box-shadow:0 18px 60px rgba(15,23,42,0.12)">
            <div style="background:linear-gradient(135deg,#0f3d91 0%,#2563eb 55%,#1d4ed8 100%);padding:30px 32px;color:#fff">
              <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.9">Jirani Alert</div>
              <h1 style="margin:10px 0 0;font-size:30px;line-height:1.15">Verify your email address</h1>
              <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#eff6ff">Complete signup to unlock your ${htmlRoleLabel} dashboard.</p>
            </div>
            <div style="background:#ffffff;padding:32px">
              <div style="display:inline-block;border-radius:999px;background:${roleTone};color:#fff;padding:8px 14px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase">${htmlRoleLabel}</div>
              <p style="margin:18px 0 0;font-size:16px;line-height:1.8">Hi ${htmlName},</p>
              <p style="margin:12px 0 0;font-size:16px;line-height:1.8;color:#334155">Your account is ready. Confirm this address so Jirani Alert can activate the profile you registered for and keep your emergency notifications flowing to the right dashboard.</p>
              <div style="margin:28px 0;padding:18px 20px;border-radius:20px;background:#f8fafc;border:1px solid #e2e8f0">
                <p style="margin:0;font-size:14px;line-height:1.7;color:#475569">Use the button below to verify your email. After that, sign in again and you will be taken to the account type you registered as.</p>
              </div>
              <p style="margin:0 0 28px">
                <a href="${htmlVerificationLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:15px 24px;border-radius:14px;text-decoration:none;font-weight:700;box-shadow:0 10px 24px rgba(37,99,235,0.28)">Verify email</a>
              </p>
              <div style="padding:16px 18px;border-radius:16px;background:#f8fafc;border:1px solid #e2e8f0">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#475569">If the button does not work, open the link below.</p>
                <p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:#64748b;word-break:break-word">${verificationPreview}</p>
              </div>
              <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#64748b">If you did not create a Jirani Alert account, you can ignore this email.</p>
              <p style="margin:18px 0 0;font-size:13px;color:#64748b">Open Jirani Alert: <a href="${htmlAppUrl}" style="color:#2563eb;text-decoration:none">${htmlAppUrl}</a></p>
            </div>
          </div>
        </div>
      </div>
    `,
  })

  console.log(`Sent verification email to ${to}. messageId=${info.messageId || 'unknown'}`)
  return { sent: true, messageId: info.messageId, verificationLink }
}

function getConfiguredAdminEmails() {
  return getEnv('SUPER_ADMIN_EMAILS')
    .split(/[;,]/)
    .map((email) => email.trim().toLowerCase())
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
}

async function getEmergencyAdminEmails() {
  const configured = getConfiguredAdminEmails()
  const admins = await db.collection('profiles').where('role', '==', 'admin').get()
  const profileEmails = admins.docs
    .map((snap) => String(snap.data()?.email || '').trim().toLowerCase())
    .filter((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  return [...new Set([...configured, ...profileEmails])]
}

async function sendEmergencyReportEmails({ reportId, type, title, description, location, severity, reporterName, reporterPhone, reporterEmail, appUrl }) {
  const transporter = getMailTransporter()
  if (!transporter) return { sent: false, reason: 'Email is not configured' }

  const mailFrom = getMailFromAddress()
  const reportCode = `JA-${reportId.slice(-8).toUpperCase()}`
  const reportUrl = `${appUrl}/report-emergency/${encodeURIComponent(reportId)}`
  const safe = {
    type: escapeHtml(type), title: escapeHtml(title), description: escapeHtml(description), location: escapeHtml(location),
    severity: escapeHtml(severity), reporterName: escapeHtml(reporterName || 'Not provided'), reporterPhone: escapeHtml(reporterPhone || 'Not provided'),
    reportCode: escapeHtml(reportCode), reportUrl: escapeHtml(reportUrl),
  }
  const adminEmails = await getEmergencyAdminEmails()
  const jobs = []

  if (adminEmails.length) {
    jobs.push(transporter.sendMail({
      from: mailFrom, replyTo: mailFrom, to: adminEmails,
      subject: `Emergency alert ${reportCode}: ${type}`,
      text: `A new ${type} emergency has been reported.\n\nReport: ${reportCode}\nTitle: ${title}\nSeverity: ${severity}\nLocation: ${location}\nDescription: ${description}\nReporter: ${reporterName || 'Not provided'}\nPhone: ${reporterPhone || 'Not provided'}\nEmail: ${reporterEmail || 'Not provided'}`,
      html: `<div style="font-family:Arial,sans-serif;color:#0f172a"><h1 style="color:#b91c1c">New emergency alert</h1><p><strong>${safe.reportCode}</strong> · ${safe.type} · ${safe.severity}</p><p><strong>Location:</strong> ${safe.location}</p><p><strong>Details:</strong> ${safe.description}</p><hr><p><strong>Reporter:</strong> ${safe.reporterName}<br><strong>Phone:</strong> ${safe.reporterPhone}<br><strong>Email:</strong> ${escapeHtml(reporterEmail || 'Not provided')}</p></div>`,
    }))
  }
  if (reporterEmail) {
    jobs.push(transporter.sendMail({
      from: mailFrom, replyTo: mailFrom, to: reporterEmail,
      subject: `Emergency report received (${reportCode})`,
      text: `Your ${type} emergency report has been received. Report ID: ${reportCode}. Responders are being notified. Track it here: ${reportUrl}`,
      html: `<div style="font-family:Arial,sans-serif;color:#0f172a"><h1 style="color:#047857">Emergency report received</h1><p>Your <strong>${safe.type}</strong> report has been received and responders are being notified.</p><p><strong>Report ID:</strong> ${safe.reportCode}</p><p><a href="${safe.reportUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:bold">Track my report</a></p></div>`,
    }))
  }
  const results = await Promise.allSettled(jobs)
  const sent = results.filter((result) => result.status === 'fulfilled').length
  results.filter((result) => result.status === 'rejected').forEach((result) => console.error('Emergency email failed:', result.reason))
  return { sent: sent > 0, recipients: sent, adminRecipients: adminEmails.length, reporterConfirmation: Boolean(reporterEmail) }
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

async function sendTestEmail({ to, subject, message, verificationLink }) {
  const transporter = getMailTransporter()
  if (!transporter || !to) return { sent: false, reason: 'Email is not configured. Set GMAIL_APP_PASSWORD or SMTP_* in backend/functions/.env and restart the backend.' }

  const mailFrom = getMailFromAddress()
  const appUrl = getEnv('APP_URL') || 'https://jirani-alert-frontend.vercel.app'
  const safeMessage = message || 'You have been invited to Jirani Alert. Click the link below to verify your account and sign in.'
  const link = verificationLink || `${appUrl}/verify-email`
  const safeLink = escapeHtml(link)

  const info = await transporter.sendMail({
    from: mailFrom,
    replyTo: mailFrom,
    to,
    subject: subject || 'Confirm your Jirani Alert account',
    text: [
      safeMessage,
      '',
      `Verify your account: ${link}`,
      '',
      `If the button does not work, paste this link into your browser.`,
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2 style="color:#2563eb">You are invited to Jirani Alert</h2>
        <p>${escapeHtml(safeMessage)}</p>
        <p>
          <a href="${safeLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">
            Verify your account
          </a>
        </p>
        <p style="margin-top:1rem;color:#64748b;font-size:13px">
          If the button does not work, paste this link into your browser:
        </p>
        <p style="word-break:break-word"><a href="${safeLink}" style="color:#2563eb">${safeLink}</a></p>
      </div>
    `,
  })

  console.log(`Sent backend test email to ${to}. messageId=${info.messageId || 'unknown'}`)
  return { sent: true, messageId: info.messageId }
}

exports.sendTestEmail = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    verifyTestEmailAccess(req)

    const body = req.body || {}
    const to = String(body.to || req.query?.to || 'mabwogahillary@gmail.com').trim()
    const subject = String(body.subject || req.query?.subject || 'You are invited to Jirani Alert').trim()
    const message = String(
      body.message || req.query?.message || 'You have been invited to Jirani Alert. Click the verification link below to verify your account and access your assigned account type.',
    ).trim()
    const verificationLink = String(body.verificationLink || req.query?.verificationLink || '').trim()

    if (!to) {
      const error = new Error('Recipient email is required')
      error.status = 400
      throw error
    }

    const result = await sendTestEmail({ to, subject, message, verificationLink })
    res.json({ ok: true, result })
  } catch (error) {
    sendError(res, error)
  }
})

exports.resendVerificationEmail = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const body = req.body || {}
    const requestedEmail = String(body.email || req.query?.email || '').trim().toLowerCase()
    const appUrl = getFrontendAppUrl(req)

    let user = null
    if (requestedEmail) {
      try {
        user = await admin.auth().getUserByEmail(requestedEmail)
      } catch (lookupError) {
        const error = new Error('No account found for that email')
        error.status = 404
        throw error
      }
    } else {
      user = await requireUser(req)
    }

    const profileSnap = await db.collection('profiles').doc(user.uid).get()
    const profile = profileSnap.exists ? profileSnap.data() : {}
    const firstName = profile.firstName || String(user.displayName || '').trim().split(/\s+/)[0] || ''
    const lastName = profile.lastName || ''
    const fullName = profile.fullName || [firstName, lastName].filter(Boolean).join(' ')
    const displayName = profile.displayName || firstName || user.displayName || ''
    const role = typeof profile.role === 'string' && profile.role ? profile.role : 'resident'
    const email = String(user.email || requestedEmail || '').trim()

    if (!email) {
      const error = new Error('User email is missing')
      error.status = 400
      throw error
    }

    const verificationLink = await generateEmailVerificationLink(email, appUrl)
    const result = await sendSignupConfirmationEmail({ to: email, displayName, firstName, fullName, role, verificationLink, appUrl })
    if (!result.sent) {
      const error = new Error(result.reason || 'Unable to send verification email')
      error.status = 500
      throw error
    }

    res.json({ ok: true, result })
  } catch (error) {
    sendError(res, error)
  }
})

function isAllowedOrigin(origin) {
  if (!origin) return false
  if (allowedOrigins.has(origin)) return true
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return true
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return true
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

async function requireResponderUser(req) {
  const user = await requireUser(req)
  const profileSnap = await db.collection('profiles').doc(user.uid).get().catch(() => null)
  const role = normalizeRole(user.role) || normalizeRole(profileSnap?.data?.()?.role)
  if (!['responder', 'admin'].includes(role)) {
    const error = new Error('Responder access is required')
    error.status = 403
    throw error
  }
  return { ...user, role }
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

function optionalString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function normalizeRole(role) {
  const value = String(role || '').trim().toLowerCase()
  return allowedRoles.has(value) ? value : null
}

async function resolveProfileRole({ userId, email, profile }) {
  const profileRole = normalizeRole(profile?.role) || normalizeRole(profile?.accountType)
  if (profileRole) return profileRole

  const authUser = await admin.auth().getUser(userId).catch(() => null)
  const authRole = normalizeRole(authUser?.customClaims?.role) || normalizeRole(authUser?.role)
  if (authRole) return authRole

  const normalizedEmail = String(email || authUser?.email || '').trim().toLowerCase()
  if (normalizedEmail) {
    const roleIndexSnap = await db.collection('accountRoles').doc(normalizedEmail).get().catch(() => null)
    const roleIndexData = roleIndexSnap?.data ? roleIndexSnap.data() : null
    const roleIndexRole = normalizeRole(roleIndexData?.role)
    if (roleIndexRole) return roleIndexRole
  }

  return null
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
    const appUrl = getFrontendAppUrl(req)

    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : ''
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
    const displayName = (typeof body.displayName === 'string' ? body.displayName.trim() : '') || firstName
    const requestedRole = typeof body.role === 'string' ? body.role.trim() : 'resident'
    const role = allowedRoles.has(requestedRole) ? requestedRole : 'resident'
    const now = serverTimestampValue()
    const profileRef = db.collection('profiles').doc(user.uid)
    const notificationRef = db.collection('notifications').doc()
    const email = user.email || ''
    const emailVerified = Boolean(user.email_verified || user.emailVerified)

    try {
      await admin.auth().setCustomUserClaims(user.uid, { role })
    } catch (claimsError) {
      console.warn('Could not set custom user claims:', claimsError.message || claimsError)
    }

    try {
      if (firstName || displayName) {
        await admin.auth().updateUser(user.uid, { displayName: firstName || displayName })
      }
    } catch (displayNameError) {
      console.warn('Could not set auth displayName:', displayNameError.message || displayNameError)
    }

    await db.runTransaction(async (transaction) => {
      transaction.set(
        profileRef,
        {
          uid: user.uid,
          email,
          displayName,
          firstName,
          lastName,
          fullName: fullName || [firstName, lastName].filter(Boolean).join(' '),
          role,
          accountStatus: emailVerified ? 'active' : 'pending_verification',
          emailVerified,
          authProvider: 'password',
          profileImageUrl: '',
          theme: 'light',
          highContrast: false,
          textSize: 'Medium',
          alertTone: 'Gentle',
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

    let verificationEmail = { sent: false, reason: 'Email is not configured' }
    try {
      const verificationLink = await generateEmailVerificationLink(email, appUrl)
      verificationEmail = await sendSignupConfirmationEmail({ to: email, displayName, firstName, fullName, role, verificationLink, appUrl })
    } catch (emailError) {
      verificationEmail = { sent: false, reason: emailError.message || 'Verification email could not be sent' }
    }

    const saved = await profileRef.get()
    res.status(201).json({
      ok: true,
      profile: saved.data(),
      notificationId: notificationRef.id,
      verificationEmail,
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
    const isAnonymousUser = user.firebase?.sign_in_provider === 'anonymous'
    const anonymous = isAnonymousUser || Boolean(body.anonymous)
    const evidenceUrl = typeof body.evidenceUrl === 'string' && body.evidenceUrl.trim() !== '' ? body.evidenceUrl.trim() : null
    const notify = Array.isArray(body.notify) ? body.notify : []
    const reporterName = typeof body.reporterName === 'string' ? body.reporterName.trim().slice(0, 120) : ''
    const reporterPhone = typeof body.reporterPhone === 'string' ? body.reporterPhone.trim().slice(0, 32) : ''
    const suppliedReporterEmail = typeof body.reporterEmail === 'string' ? body.reporterEmail.trim().toLowerCase().slice(0, 254) : ''
    if (suppliedReporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(suppliedReporterEmail)) {
      const error = new Error('A valid reporter email is required when one is provided')
      error.status = 400
      throw error
    }
    const reporterEmail = user.email || suppliedReporterEmail || null
    const locationCoordinates = body.locationCoordinates
      && Number.isFinite(body.locationCoordinates.latitude)
      && Number.isFinite(body.locationCoordinates.longitude)
      ? { latitude: body.locationCoordinates.latitude, longitude: body.locationCoordinates.longitude }
      : null

    const now = serverTimestampValue()
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
        reporterEmail,
        reporterName,
        reporterPhone,
        locationCoordinates,
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

    const savedReport = await reportRef.get()
    let emailNotifications = { sent: false, reason: 'Email notifications were not attempted' }
    try {
      emailNotifications = await sendEmergencyReportEmails({
        reportId: reportRef.id,
        type,
        title,
        description,
        location,
        severity,
        reporterName,
        reporterPhone,
        reporterEmail,
        appUrl: getFrontendAppUrl(req),
      })
    } catch (emailError) {
      console.error('Emergency report email notification setup failed:', emailError)
      emailNotifications = { sent: false, reason: 'Email notifications could not be delivered' }
    }

    res.status(201).json({
      reportId: reportRef.id,
      alertId: alertRef.id,
      notificationId: notificationRef.id,
      emailNotifications,
      report: savedReport.exists ? { id: reportRef.id, ...savedReport.data() } : { id: reportRef.id, type, title, location, description, severity, anonymous, evidenceUrl, notify },
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

exports.listAssignedIncidents = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'GET')
    const user = await requireResponderUser(req)
    const limit = Math.min(Number(req.query.limit || 50), 100)
    const snapshot = await db
      .collection('reports')
      .where('assignedResponderId', '==', user.uid)
      .orderBy('updatedAt', 'desc')
      .limit(limit)
      .get()

    res.json({
      incidents: snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
    })
  } catch (error) {
    sendError(res, error)
  }
})

exports.acceptIncident = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireResponderUser(req)
    const reportId = requiredString(req.body?.reportId, 'reportId')
    const reportRef = db.collection('reports').doc(reportId)
    const alertRef = db.collection('alerts').doc(reportId)
    const now = serverTimestampValue()

    await db.runTransaction(async (transaction) => {
      const report = await transaction.get(reportRef)
      if (!report.exists) {
        const error = new Error('Incident not found')
        error.status = 404
        throw error
      }

      transaction.set(
        reportRef,
        {
          assignedResponderId: user.uid,
          assignedResponderEmail: user.email || null,
          assignmentStatus: 'Accepted',
          status: 'Accepted',
          acceptedAt: now,
          updatedAt: now,
          timeline: admin.firestore.FieldValue.arrayUnion({
            type: 'accepted',
            label: 'Responder accepted incident',
            responderId: user.uid,
            createdAt: new Date().toISOString(),
          }),
        },
        { merge: true },
      )
      transaction.set(alertRef, { status: 'Accepted', updatedAt: now }, { merge: true })
    })

    const saved = await reportRef.get()
    res.json({ ok: true, incident: { id: saved.id, ...saved.data() } })
  } catch (error) {
    sendError(res, error)
  }
})

exports.rejectIncident = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireResponderUser(req)
    const reportId = requiredString(req.body?.reportId, 'reportId')
    const reason = optionalString(req.body?.reason)
    const reportRef = db.collection('reports').doc(reportId)
    const now = serverTimestampValue()

    await reportRef.set(
      {
        rejectedBy: admin.firestore.FieldValue.arrayUnion(user.uid),
        lastRejectionReason: reason || null,
        assignmentStatus: 'Rejected',
        updatedAt: now,
        timeline: admin.firestore.FieldValue.arrayUnion({
          type: 'rejected',
          label: reason ? `Responder rejected incident: ${reason}` : 'Responder rejected incident',
          responderId: user.uid,
          createdAt: new Date().toISOString(),
        }),
      },
      { merge: true },
    )

    const saved = await reportRef.get()
    res.json({ ok: true, incident: { id: saved.id, ...saved.data() } })
  } catch (error) {
    sendError(res, error)
  }
})

exports.updateIncidentStatus = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireResponderUser(req)
    const reportId = requiredString(req.body?.reportId, 'reportId')
    const status = requiredString(req.body?.status, 'status')
    const note = optionalString(req.body?.note)
    const reportRef = db.collection('reports').doc(reportId)
    const alertRef = db.collection('alerts').doc(reportId)
    const now = serverTimestampValue()
    const updates = {
      status,
      updatedAt: now,
      timeline: admin.firestore.FieldValue.arrayUnion({
        type: 'status',
        label: note ? `${status}: ${note}` : `Status updated to ${status}`,
        responderId: user.uid,
        createdAt: new Date().toISOString(),
      }),
    }
    if (status.toLowerCase() === 'completed') {
      updates.completedAt = now
      updates.assignmentStatus = 'Completed'
    }

    await db.runTransaction(async (transaction) => {
      const report = await transaction.get(reportRef)
      if (!report.exists) {
        const error = new Error('Incident not found')
        error.status = 404
        throw error
      }
      transaction.set(reportRef, updates, { merge: true })
      transaction.set(alertRef, { status, updatedAt: now }, { merge: true })
    })

    const saved = await reportRef.get()
    res.json({ ok: true, incident: { id: saved.id, ...saved.data() } })
  } catch (error) {
    sendError(res, error)
  }
})

exports.assignIncident = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireResponderUser(req)
    const reportId = requiredString(req.body?.reportId, 'reportId')
    const responderId = requiredString(req.body?.responderId, 'responderId')
    const reportRef = db.collection('reports').doc(reportId)
    const now = serverTimestampValue()

    await reportRef.set(
      {
        assignedResponderId: responderId,
        dispatchedBy: user.uid,
        assignmentStatus: 'Assigned',
        status: 'Assigned',
        updatedAt: now,
        timeline: admin.firestore.FieldValue.arrayUnion({
          type: 'assigned',
          label: 'Incident assigned from dispatch center',
          responderId: user.uid,
          assignedResponderId: responderId,
          createdAt: new Date().toISOString(),
        }),
      },
      { merge: true },
    )

    const saved = await reportRef.get()
    res.json({ ok: true, incident: { id: saved.id, ...saved.data() } })
  } catch (error) {
    sendError(res, error)
  }
})

exports.addIncidentNote = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireResponderUser(req)
    const reportId = requiredString(req.body?.reportId, 'reportId')
    const note = requiredString(req.body?.note, 'note')
    const reportRef = db.collection('reports').doc(reportId)
    const now = serverTimestampValue()

    await reportRef.set(
      {
        responderNotes: admin.firestore.FieldValue.arrayUnion({
          note,
          responderId: user.uid,
          responderEmail: user.email || null,
          createdAt: new Date().toISOString(),
        }),
        updatedAt: now,
      },
      { merge: true },
    )

    const saved = await reportRef.get()
    res.json({ ok: true, incident: { id: saved.id, ...saved.data() } })
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
      readAt: serverTimestampValue(),
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
        readAt: serverTimestampValue(),
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
    const requestPath = String(req.path || req.url || '').split('?')[0].replace(/^\/+/, '')
    const pathParts = requestPath.split('/').filter(Boolean)
    const userId = String(req.query.userId || pathParts[1] || pathParts[0] || '').trim()
    if (!userId) {
      const error = new Error('userId is required in path')
      error.status = 400
      throw error
    }

    const doc = await db.collection('profiles').doc(userId).get()
    const currentProfile = doc.exists ? doc.data() || {} : {}
    const authUser = await admin.auth().getUser(userId).catch(() => null)
    const fallbackEmail = String(currentProfile.email || authUser?.email || '').trim()
    const fallbackDisplayName = currentProfile.firstName || currentProfile.displayName || authUser?.displayName || ''
    const resolvedRole = await resolveProfileRole({
      userId,
      email: fallbackEmail,
      profile: currentProfile,
    })

    if (!doc.exists && !authUser) {
      return res.json({ profile: null })
    }

    const resolvedProfile = {
      uid: userId,
      email: fallbackEmail,
      ...currentProfile,
      displayName: currentProfile.firstName || currentProfile.displayName || authUser?.displayName || fallbackDisplayName,
      firstName: currentProfile.firstName || authUser?.displayName?.split(/\s+/)[0] || '',
      lastName: currentProfile.lastName || '',
      fullName: currentProfile.fullName || [currentProfile.firstName || authUser?.displayName || '', currentProfile.lastName || ''].filter(Boolean).join(' '),
    }

    if (resolvedRole) {
      resolvedProfile.role = resolvedRole
      resolvedProfile.accountType = resolvedProfile.accountType || resolvedRole
      if (!resolvedProfile.accountStatus) {
        resolvedProfile.accountStatus = authUser?.emailVerified || currentProfile.emailVerified ? 'active' : 'pending_verification'
      }

      if (!doc.exists || !normalizeRole(currentProfile.role)) {
        await db.collection('profiles').doc(userId).set(
          {
            ...resolvedProfile,
            updatedAt: serverTimestampValue(),
          },
          { merge: true },
        )
      }
    }

    if (authUser) {
      resolvedProfile.emailVerified = Boolean(currentProfile.emailVerified ?? authUser.emailVerified)
    }

    res.json({ profile: resolvedProfile })
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
    if (typeof body.firstName === 'string') updates.firstName = body.firstName.trim()
    if (typeof body.lastName === 'string') updates.lastName = body.lastName.trim()
    if (typeof body.fullName === 'string') updates.fullName = body.fullName.trim()
    if (typeof body.phoneNumber === 'string') updates.phoneNumber = body.phoneNumber.trim()
    if (typeof body.residentialArea === 'string') updates.residentialArea = body.residentialArea.trim()
    if (typeof body.profileImageUrl === 'string') updates.profileImageUrl = body.profileImageUrl
    if (typeof body.theme === 'string') {
      const theme = body.theme.trim().toLowerCase()
      if (theme === 'light' || theme === 'dark') updates.theme = theme
    }
    if (typeof body.highContrast === 'boolean') updates.highContrast = body.highContrast
    if (typeof body.textSize === 'string') {
      const textSize = body.textSize.trim()
      if (['Small', 'Medium', 'Large'].includes(textSize)) updates.textSize = textSize
    }
    if (typeof body.alertTone === 'string') {
      const alertTone = body.alertTone.trim()
      if (['Gentle', 'Loud', 'Siren'].includes(alertTone)) updates.alertTone = alertTone
    }
    if (typeof body.role === 'string') {
      const requestedRole = body.role.trim()
      if (allowedRoles.has(requestedRole)) {
        updates.role = requestedRole
        try {
          await admin.auth().setCustomUserClaims(userId, { role: requestedRole })
        } catch (claimsError) {
          console.warn('Could not update custom user claims:', claimsError.message || claimsError)
        }
      }
    }
    if (!updates.displayName && updates.firstName) {
      updates.displayName = updates.firstName
    }
    if (!updates.fullName && (updates.firstName || updates.lastName || updates.displayName)) {
      updates.fullName = [updates.firstName || updates.displayName || '', updates.lastName || ''].filter(Boolean).join(' ')
    }
    if (typeof body.emailVerified === 'boolean') updates.emailVerified = body.emailVerified
    if (typeof body.accountStatus === 'string') updates.accountStatus = body.accountStatus.trim()
    updates.updatedAt = serverTimestampValue()

    await db.collection('profiles').doc(userId).set(updates, { merge: true })

    const saved = await db.collection('profiles').doc(userId).get()
    res.json({ ok: true, profile: saved.data() })
  } catch (error) {
    sendError(res, error)
  }
})

async function deleteByQuery(query, batchSize = 200) {
  const snapshot = await query.limit(batchSize).get()
  if (snapshot.empty) return 0

  const batch = db.batch()
  snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref))
  await batch.commit()

  if (snapshot.size < batchSize) return snapshot.size
  return snapshot.size + (await deleteByQuery(query, batchSize))
}

exports.deactivateUserAccount = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)
    const now = serverTimestampValue()

    await db.collection('profiles').doc(user.uid).set(
      {
        accountStatus: 'deactivated',
        deactivatedAt: now,
        updatedAt: now,
      },
      { merge: true },
    )

    res.json({ ok: true })
  } catch (error) {
    sendError(res, error)
  }
})

exports.deleteUserAccount = onRequest({ region: 'us-central1' }, async (req, res) => {
  setCors(req, res)
  if (handleOptions(req, res)) return

  try {
    requireMethod(req, 'POST')
    const user = await requireUser(req)
    const profileRef = db.collection('profiles').doc(user.uid)

    await deleteByQuery(profileRef.collection('contacts'))
    await deleteByQuery(db.collection('notifications').where('recipientId', '==', user.uid))
    await profileRef.delete().catch(() => null)

    try {
      await admin.auth().deleteUser(user.uid)
    } catch (authDeleteError) {
      console.warn('Could not delete auth user:', authDeleteError.message || authDeleteError)
    }

    res.json({ ok: true })
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

    const now = serverTimestampValue()
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
    let user = null
    try {
      user = await requireUser(req)
    } catch (e) {
      user = null
    }
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
        const userLiked = user
          ? await db
              .collection('communityPosts')
              .doc(doc.id)
              .collection('likes')
              .doc(user.uid)
              .get()
          : { exists: false }

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
        createdAt: serverTimestampValue(),
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
      createdAt: serverTimestampValue(),
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
      createdAt: serverTimestampValue(),
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
