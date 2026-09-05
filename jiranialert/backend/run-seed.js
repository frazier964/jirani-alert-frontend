// Run seed data for Firestore emulator
const admin = require('./functions/node_modules/firebase-admin')

// Initialize Firebase Admin SDK with emulator
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:9001'
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099'

admin.initializeApp({
  projectId: 'jiranialert',
})

const { seedCommunityPosts, seedResponderAssignments } = require('./functions/seed')

async function ensureDemoResponder() {
  if (process.env.RESPONDER_UID) return
  try {
    await admin.auth().createUser({
      uid: 'demo-responder',
      email: 'responder.demo@example.com',
      password: 'Responder123!',
      displayName: 'Demo Responder',
    })
  } catch (error) {
    if (error.code !== 'auth/uid-already-exists' && error.code !== 'auth/email-already-exists') throw error
  }
}

seedCommunityPosts()
  .then(ensureDemoResponder)
  .then(() => seedResponderAssignments())
  .then(() => {
    console.log('✓ Seeding complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('✗ Seeding failed:', error)
    process.exit(1)
  })
