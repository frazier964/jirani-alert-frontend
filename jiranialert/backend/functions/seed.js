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

async function seedResponderAssignments(responderId = process.env.RESPONDER_UID || 'demo-responder') {
  const now = Date.now()
  const assignments = [
    { id: 'demo-assignment-medical', type: 'Medical', title: 'Chest pain welfare call', location: 'Kilimani Block C', severity: 'High', status: 'Pending', locationCoordinates: { latitude: -1.2921, longitude: 36.782 } },
    { id: 'demo-assignment-fire', type: 'Fire', title: 'Warehouse smoke escalation', location: 'Westlands Industrial Lane', severity: 'Critical', status: 'En Route', locationCoordinates: { latitude: -1.2676, longitude: 36.8108 } },
    { id: 'demo-assignment-security', type: 'Security', title: 'Suspicious activity near gate', location: 'South B Estate', severity: 'Medium', status: 'Completed', locationCoordinates: { latitude: -1.3208, longitude: 36.8422 } },
  ]

  await db.collection('profiles').doc(responderId).set({
    role: 'responder',
    accountType: 'responder',
    displayName: 'Demo Responder',
    email: process.env.RESPONDER_EMAIL || 'responder.demo@example.com',
  }, { merge: true })

  for (const assignment of assignments) {
    await db.collection('reports').doc(assignment.id).set({
      ...assignment,
      description: 'Seeded assignment for responder workspace testing.',
      reporterEmail: 'resident.demo@example.com',
      assignedResponderId: responderId,
      assignedResponderEmail: process.env.RESPONDER_EMAIL || 'responder.demo@example.com',
      assignmentStatus: assignment.status === 'Completed' ? 'Completed' : 'Assigned',
      createdAt: new Date(now - (assignments.indexOf(assignment) + 1) * 3600000),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })
    console.log(`✓ Created assignment ${assignment.id} for ${responderId}`)
  }

  const teamMembers = [
    { id: responderId, displayName: 'Demo Responder', role: 'responder', availability: 'Online', specialty: 'Field response', assignment: 'Warehouse smoke escalation', area: 'Westlands' },
    { id: 'demo-paramedic', displayName: 'Amina K.', role: 'responder', availability: 'Online', specialty: 'Paramedic', assignment: 'Medical triage', area: 'Kilimani' },
    { id: 'demo-fire-officer', displayName: 'David O.', role: 'responder', availability: 'Busy', specialty: 'Fire Officer', assignment: 'Warehouse fire', area: 'Westlands' },
    { id: 'demo-dispatcher', displayName: 'Wanjiku M.', role: 'responder', availability: 'Online', specialty: 'Dispatcher', assignment: 'Command desk', area: 'Central' },
  ]
  for (const member of teamMembers) {
    await db.collection('profiles').doc(member.id).set(member, { merge: true })
  }

  const resources = [
    { id: 'ambulance-unit-12', name: 'Ambulance Unit 12', type: 'Vehicle', status: 'Available', location: 'Kilimani Base', incident: '—', condition: 'Ready' },
    { id: 'fire-engine-4', name: 'Fire Engine 4', type: 'Vehicle', status: 'In Use', location: 'Westlands', incident: 'Warehouse fire', condition: 'Operational' },
    { id: 'trauma-kit-12', name: 'Trauma Kit 12', type: 'Medical', status: 'Available', location: 'Kilimani Base', incident: '—', condition: 'Ready' },
    { id: 'radio-pack-04', name: 'Radio Pack 04', type: 'Communication', status: 'Maintenance', location: 'Central depot', incident: '—', condition: 'Battery service' },
  ]
  for (const resource of resources) {
    await db.collection('responderResources').doc(resource.id).set(resource, { merge: true })
  }

  const conversations = [
    { id: 'emergency-response', name: 'Emergency Response Team', participants: 5 },
    { id: 'command-operations', name: 'Command Operations', participants: 4 },
  ]
  const messages = [
    { id: 'demo-message-1', conversationId: 'emergency-response', senderName: 'Dispatch', content: 'Unit 12 cleared for the northern approach.' },
    { id: 'demo-message-2', conversationId: 'emergency-response', senderName: 'Amina K.', content: 'Medical triage team is ready at Kilimani Base.' },
    { id: 'demo-message-3', conversationId: 'command-operations', senderName: 'Command', content: 'Weather watch is active. Keep radio channel Alpha open.' },
  ]
  for (const conversation of conversations) {
    await db.collection('conversations').doc(conversation.id).set({ ...conversation, updatedAt: FieldValue.serverTimestamp() }, { merge: true })
    await db.collection('conversations').doc(conversation.id).collection('members').doc(responderId).set({ userId: responderId, isMember: true, muted: false }, { merge: true })
  }
  for (const message of messages) {
    await db.collection('conversations').doc(message.conversationId).collection('messages').doc(message.id).set({
      senderId: responderId,
      senderName: message.senderName,
      content: message.content,
      sent: true,
      broadcast: false,
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true })
  }

  const activeEmergencies = [
    { id: 'demo-active-fire', type: 'Fire', title: 'Active warehouse fire alert', location: 'Industrial Area, Nairobi', severity: 'Critical', locationCoordinates: { latitude: -1.2966, longitude: 36.8452 } },
    { id: 'demo-active-medical', type: 'Medical', title: 'Medical assistance requested', location: 'Kilimani Block C', severity: 'High', locationCoordinates: { latitude: -1.2921, longitude: 36.782 } },
  ]
  for (const emergency of activeEmergencies) {
    const timestamp = FieldValue.serverTimestamp()
    await db.collection('reports').doc(emergency.id).set({
      ...emergency,
      description: 'Seeded active emergency for responder testing.',
      status: 'ACTIVE',
      activationMethod: 'HOLD_TO_ALERT',
      isPublic: true,
      anonymous: true,
      reporterId: null,
      guestIdentifier: `seed-${emergency.id}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    }, { merge: true })
    await db.collection('alerts').doc(emergency.id).set({
      reportId: emergency.id,
      type: emergency.type,
      title: emergency.title,
      location: emergency.location,
      severity: emergency.severity,
      status: 'ACTIVE',
      activationMethod: 'HOLD_TO_ALERT',
      isPublic: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    }, { merge: true })
  }
}

module.exports = { seedCommunityPosts, seedResponderAssignments }
