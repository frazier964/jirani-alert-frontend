const { onRequest } = require('firebase-functions/v2/https')
const admin = require('firebase-admin')

admin.initializeApp()

const db = admin.firestore()
const FieldValue = admin.firestore.FieldValue

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

function setCors(req, res) {
  const origin = req.get('origin')
  if (allowedOrigins.has(origin)) {
    res.set('Access-Control-Allow-Origin', origin)
  }
  res.set('Vary', 'Origin')
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
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

  return admin.auth().verifyIdToken(match[1])
}

function sendError(res, error) {
  const status = error.status || 500
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : error.message,
  })
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
    if (typeof body.profileImageUrl === 'string') updates.profileImageUrl = body.profileImageUrl
    updates.updatedAt = FieldValue.serverTimestamp()

    await db.collection('profiles').doc(userId).set(updates, { merge: true })

    const saved = await db.collection('profiles').doc(userId).get()
    res.json({ ok: true, profile: saved.data() })
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
