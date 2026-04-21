// Local dev server — mirrors the Vercel /api/assess route
import { createServer } from 'http'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env manually if present
try {
  const envPath = join(__dirname, '.env')
  const env = readFileSync(envPath, 'utf-8')
  for (const line of env.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
} catch {}

const { default: handler } = await import('./api/assess.js')

const PORT = 3001

const server = createServer(async (req, res) => {
  if (req.url !== '/api/assess') {
    res.writeHead(404)
    return res.end('Not found')
  }

  let body = ''
  req.on('data', chunk => { body += chunk })
  req.on('end', async () => {
    try {
      req.body = JSON.parse(body || '{}')
    } catch {
      req.body = {}
    }

    // Fake res object compatible with our handler
    const mockRes = {
      _status: 200,
      _headers: {},
      _body: null,
      status(code) { this._status = code; return this },
      setHeader(k, v) { this._headers[k] = v; return this },
      json(data) {
        this._body = JSON.stringify(data)
        res.writeHead(this._status, { 'Content-Type': 'application/json', ...this._headers })
        res.end(this._body)
      },
      end() {
        res.writeHead(this._status, this._headers)
        res.end()
      },
    }

    await handler(req, mockRes)
  })
})

server.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`)
})
