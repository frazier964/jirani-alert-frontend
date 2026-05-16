const https = require('https')
const API_KEY = 'AIzaSyD1mpP_omm9poTSwMWJq5oyBrPcSYHSYr8'
const email = 'temp+ci-test@example.com'
const password = 'Testpass123!'

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
    console.log('Signing up test user:', email)
    const signUp = await postJson(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, { email, password, returnSecureToken: true })
    console.log('signUp:', JSON.stringify(signUp, null, 2))

    if (signUp.error) return

    console.log('Signing in test user...')
    const signIn = await postJson(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, { email, password, returnSecureToken: true })
    console.log('signIn:', JSON.stringify(signIn, null, 2))

    if (signIn.error) return

    console.log('Deleting test user...')
    const del = await postJson(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${API_KEY}`, { idToken: signIn.idToken })
    console.log('delete:', JSON.stringify(del, null, 2))
  } catch (e) {
    console.error('error', e)
  }
}

run()
