const https = require('https')
const API_KEY = 'AIzaSyD1mpP_omm9poTSwMWJq5oyBrPcSYHSYr8'
const email = 'drake34@gmail.com'
const password = '09876187'

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data)
    const req = https.request(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } }, (res) => {
      let body = ''
      res.on('data', (c) => (body += c))
      res.on('end', () => {
        try {
          resolve(JSON.parse(body || '{}'))
        } catch (e) {
          resolve({ raw: body })
        }
      })
    })
    req.on('error', reject)
    req.write(payload)
    req.end()
  })
}

async function run() {
  try {
    console.log('Signing in...')
    const signInRes = await postJson(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, { email, password, returnSecureToken: true })
    console.log('Sign-in response:')
    console.log(JSON.stringify(signInRes, null, 2))
    if (signInRes.error) return
    const idToken = signInRes.idToken
    if (!idToken) return
    console.log('Deleting user...')
    const delRes = await postJson(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { idToken })
    console.log('Delete response:')
    console.log(JSON.stringify(delRes, null, 2))
  } catch (e) {
    console.error('Error during flow', e)
  }
}

run()
