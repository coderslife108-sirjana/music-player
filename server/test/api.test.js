import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import app from '../src/app.js'

let server
let baseUrl

before(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
})

test('health endpoint reports unavailable when MongoDB is disconnected', async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), { status: 'unavailable', database: 'disconnected' })
})

test('playlist creation rejects blank names before accessing the database', async () => {
  const response = await fetch(`${baseUrl}/api/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '   ' }),
  })
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Playlist names must be between 1 and 40 characters.' })
})

test('playlist creation rejects names longer than forty characters', async () => {
  const response = await fetch(`${baseUrl}/api/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'a'.repeat(41) }),
  })
  assert.equal(response.status, 400)
})

test('playlist creation safely rejects a JSON null body', async () => {
  const response = await fetch(`${baseUrl}/api/playlists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'null',
  })
  assert.equal(response.status, 400)
})

test('playlist track updates reject unsupported actions', async () => {
  const response = await fetch(`${baseUrl}/api/playlists/100000000000000000000001/tracks`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackId: '000000000000000000000001', action: 'replace' }),
  })
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'Action must be "add" or "remove".' })
})

test('invalid track ids return a client error instead of a server error', async () => {
  const response = await fetch(`${baseUrl}/api/tracks/not-an-id/like`, { method: 'PATCH' })
  assert.equal(response.status, 400)
  assert.deepEqual(await response.json(), { error: 'The requested ID is not valid.' })
})
