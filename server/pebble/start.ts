import { createServer } from 'node:http'
import { pebbleMiddleware } from './chat.ts'

const port = Number(process.env.PEBBLE_PORT || 8787)
const chat = pebbleMiddleware(process.env)
createServer({ requestTimeout: 30_000 }, (req, res) => {
  void chat(req, res, () => {
    res.writeHead(404)
    res.end()
  })
}).listen(port, process.env.PEBBLE_HOST || '127.0.0.1', () => {
  console.log(`PEBBLE API listening on port ${port}`)
})
