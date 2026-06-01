const DEFAULT_BACKEND_ORIGIN = 'https://us-central1-jiranialert.cloudfunctions.net'

function getBackendOrigin() {
  const explicitOrigin = String(process.env.VERCEL_BACKEND_ORIGIN || process.env.BACKEND_ORIGIN || '').trim()
  return explicitOrigin || DEFAULT_BACKEND_ORIGIN
}

function readBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return Promise.resolve(undefined)

  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => {
      if (!chunks.length) {
        resolve(undefined)
        return
      }
      resolve(Buffer.concat(chunks))
    })
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  try {
    const requestUrl = new URL(req.url, 'http://localhost')
    const backendOrigin = getBackendOrigin()
    const proxyPath = requestUrl.pathname.replace(/^\/api\/?/, '')
    const targetUrl = `${backendOrigin}/${proxyPath}${requestUrl.search}`

    const headers = new Headers()
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value) continue
      const normalizedKey = key.toLowerCase()
      if (['host', 'connection', 'content-length'].includes(normalizedKey)) continue
      if (Array.isArray(value)) {
        headers.set(key, value.join(', '))
      } else {
        headers.set(key, value)
      }
    }

    const body = await readBody(req)
    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'follow',
    })

    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      const normalizedKey = key.toLowerCase()
      if (['content-encoding', 'transfer-encoding', 'connection'].includes(normalizedKey)) return
      res.setHeader(key, value)
    })

    const responseBuffer = Buffer.from(await response.arrayBuffer())
    res.end(responseBuffer)
  } catch (error) {
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: error?.message || 'Backend proxy failed' }))
  }
}