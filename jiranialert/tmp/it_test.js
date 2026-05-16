const https = require('https')
const data = JSON.stringify({ email: 'test@example.com', password: 'password', returnSecureToken: true })
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  },
}
const url = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyD1mpP_omm9poTSwMWJq5oyBrPcSYHSYr8'
const req = https.request(url, options, (res) => {
  let body = ''
  res.on('data', (chunk) => (body += chunk))
  res.on('end', () => console.log(body))
})
req.on('error', (e) => console.error('request error', e))
req.write(data)
req.end()
