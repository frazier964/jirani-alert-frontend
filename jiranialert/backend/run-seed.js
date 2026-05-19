// Run seed data for Firestore emulator
const admin = require('firebase-admin')
const { seedCommunityPosts } = require('./functions/seed')

// Initialize Firebase Admin SDK with emulator
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8081'
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9098'

admin.initializeApp({
  projectId: 'jiranialert',
})

// Run the seed
seedCommunityPosts()
  .then(() => {
    console.log('✓ Seeding complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('✗ Seeding failed:', error)
    process.exit(1)
  })
