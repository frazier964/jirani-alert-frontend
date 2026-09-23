const DEFAULT_BACKEND_ORIGIN = 'https://us-central1-jiranialert.cloudfunctions.net'

function getBackendOrigin() {
  const explicitOrigin = String(process.env.VERCEL_BACKEND_ORIGIN || process.env.BACKEND_ORIGIN || '').trim()
  return (explicitOrigin || DEFAULT_BACKEND_ORIGIN).replace(/\/+$/, '')
}

function readBody(req) {
  if (req.method === 'GET' || req.method === 'HEAD') return Promise.resolve(undefined)

  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)))
    req.on('end', () => resolve(chunks.length ? Buffer.concat(chunks) : undefined))
    req.on('error', reject)
  })
}

module.exports = async function handler(req, res) {
  try {
    const requestUrl = new URL(req.url, 'http://localhost')
    const requestedPath = requestUrl.pathname.replace(/^\/api\/?/, '').replace(/^\/+|\/+$/g, '')
    const targetUrl = `${getBackendOrigin()}/${requestedPath}${requestUrl.search}`
    const headers = new Headers()

    for (const [key, value] of Object.entries(req.headers)) {
      if (!value || ['host', 'connection', 'content-length'].includes(key.toLowerCase())) continue
      headers.set(key, Array.isArray(value) ? value.join(', ') : value)
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: await readBody(req),
      redirect: 'follow',
    })

    res.statusCode = response.status
    response.headers.forEach((value, key) => {
      if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) res.setHeader(key, value)
    })
    res.end(Buffer.from(await response.arrayBuffer()))
  } catch (error) {
    res.statusCode = 502
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: error?.message || 'Backend proxy failed' }))
  }
}