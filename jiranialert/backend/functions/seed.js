// Seed data for development
// Run once to populate the Firestore database with demo community posts

const admin = require('firebase-admin')

// Make sure to initialize admin SDK before calling this
const db = admin.firestore()
const FieldValue = admin.firestore.FieldValue

async function seedCommunityPosts() {
  const seedPosts = [
    {
      id: '1',
      name: 'Amina W.',
      email: 'amina@example.com',
      post: 'Community watch patrol started at 7 PM. Please keep gates locked and report unusual activity.',
      createdAt: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    },
    {
      id: '2',
      name: 'Brian K.',
      email: 'brian@example.com',
      post: 'Roadside lamp near the estate entrance is now fixed. Safer visibility for the evening commute.',
      createdAt: new Date(Date.now() - 19 * 60000), // 19 minutes ago
    },
    {
      id: '3',
      name: 'Fatuma N.',
      email: 'fatuma@example.com',
      post: 'First aid kit restocked at the community center. Thanks to everyone who contributed.',
      createdAt: new Date(Date.now() - 60 * 60000), // 1 hour ago
    },
  ]

  try {
    for (const post of seedPosts) {
      await db.collection('communityPosts').doc(post.id).set({
        name: post.name,
        email: post.email,
        post: post.post,
        createdAt: FieldValue.serverTimestamp(),
      })

      console.log(`✓ Created post ${post.id}`)
    }

    console.log('✓ Community posts seeded successfully')
  } catch (error) {
    console.error('Error seeding posts:', error)
  }
}

module.exports = { seedCommunityPosts }
