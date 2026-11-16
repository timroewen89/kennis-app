// Draait alle browsertests: start een kleine server die de repo aanbiedt onder /kennis-app/
// (zoals GitHub Pages) en voert daarna elke reeks uit.
//   node tests/browser/run.cjs            alle reeksen
//   node tests/browser/run.cjs vegen      alleen de genoemde reeks(en)
const { spawn } = require('child_process')
const fs = require('fs')
const http = require('http')
const path = require('path')

const ROOT = path.resolve(__dirname, '../..')
const PREFIX = '/kennis-app/'
const PORT = Number(process.env.KENNIS_PORT || 8000)
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png' }

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  if (!url.pathname.startsWith(PREFIX)) return res.writeHead(404).end('niet gevonden')
  let relative = decodeURIComponent(url.pathname.slice(PREFIX.length)) || 'index.html'
  if (relative.endsWith('/')) relative += 'index.html'
  const file = path.resolve(ROOT, relative)
  // Alleen bestanden binnen de repo, en geen verborgen mappen zoals .git.
  if (!file.startsWith(ROOT + path.sep) || relative.split('/').some((part) => part.startsWith('.'))) return res.writeHead(403).end('geen toegang')
  fs.readFile(file, (error, data) => {
    if (error) return res.writeHead(404).end('niet gevonden')
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(data)
  })
})

const all = fs.readdirSync(__dirname).filter((name) => name.endsWith('.cjs') && !['lib.cjs', 'run.cjs'].includes(name)).map((name) => name.slice(0, -4)).sort()
const wanted = process.argv.slice(2)
const suites = wanted.length ? wanted : all

const runSuite = (name) =>
  new Promise((resolve) => {
    const started = Date.now()
    const child = spawn(process.execPath, [path.join(__dirname, `${name}.cjs`)], { env: { ...process.env, KENNIS_URL: `http://localhost:${PORT}${PREFIX}` } })
    let output = ''
    child.stdout.on('data', (chunk) => (output += chunk))
    child.stderr.on('data', (chunk) => (output += chunk))
    child.on('close', (code) => resolve({ name, code, output, seconds: Math.round((Date.now() - started) / 1000) }))
  })

server.listen(PORT, async () => {
  const failed = []
  for (const name of suites) {
    if (!all.includes(name)) {
      console.log(`? ${name}: onbekende reeks (kies uit: ${all.join(', ')})`)
      failed.push(name)
      continue
    }
    const result = await runSuite(name)
    console.log(`${result.code === 0 ? '✓' : '✗'} ${name} (${result.seconds} s)`)
    // Bij een fout de hele uitvoer tonen; anders alleen de samenvatting.
    if (result.code !== 0) {
      console.log(result.output.split('\n').map((line) => `    ${line}`).join('\n'))
      failed.push(name)
    }
  }
  server.close()
  console.log(failed.length ? `\n${failed.length} van ${suites.length} reeksen mislukt: ${failed.join(', ')}` : `\nAlle ${suites.length} reeksen geslaagd`)
  process.exit(failed.length ? 1 : 0)
})
