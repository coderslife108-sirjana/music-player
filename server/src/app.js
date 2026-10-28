import express from 'express'
import mongoose from 'mongoose'
import Playlist from './models/Playlist.js'
import Track from './models/Track.js'

const app = express()

app.use(express.json({ limit: '16kb' }))

app.get('/api/health', (_request, response) => {
  const connected = mongoose.connection.readyState === 1
  response.status(connected ? 200 : 503).json({
    status: connected ? 'ok' : 'unavailable',
    database: connected ? 'connected' : 'disconnected',
  })
})

app.get('/api/tracks', async (request, response, next) => {
  try {
    const filter = {}
    if (typeof request.query.genre === 'string' && request.query.genre !== 'All') {
      filter.genre = request.query.genre
    }
    if (request.query.liked === 'true') filter.liked = true
    if (request.query.recent === 'true') filter.lastPlayedAt = { $ne: null }

    let tracks = await Track.find(filter).lean()
    if (request.query.recent === 'true') {
      tracks.sort((first, second) => second.lastPlayedAt - first.lastPlayedAt)
    } else {
      tracks.sort((first, second) => first._id.toString().localeCompare(second._id.toString()))
    }

    if (typeof request.query.search === 'string' && request.query.search.trim()) {
      const search = request.query.search.trim().slice(0, 100).toLocaleLowerCase()
      tracks = tracks.filter((track) =>
        [track.title, track.artist, track.album, track.genre]
          .some((value) => value.toLocaleLowerCase().includes(search)),
      )
    }

    response.json(tracks)
  } catch (error) {
    next(error)
  }
})

app.patch('/api/tracks/:id/like', async (request, response, next) => {
  try {
    const track = await Track.findById(request.params.id)
    if (!track) return response.status(404).json({ error: 'Track not found.' })
    track.liked = !track.liked
    await track.save()
    response.json(track)
  } catch (error) {
    next(error)
  }
})

app.post('/api/tracks/:id/play', async (request, response, next) => {
  try {
    const track = await Track.findByIdAndUpdate(
      request.params.id,
      { lastPlayedAt: new Date() },
      { new: true, runValidators: true },
    )
    if (!track) return response.status(404).json({ error: 'Track not found.' })
    response.json(track)
  } catch (error) {
    next(error)
  }
})

app.get('/api/playlists', async (_request, response, next) => {
  try {
    const playlists = await Playlist.find().populate('tracks').sort({ createdAt: 1 }).lean()
    response.json(playlists)
  } catch (error) {
    next(error)
  }
})

app.post('/api/playlists', async (request, response, next) => {
  try {
    const name = typeof request.body?.name === 'string' ? request.body.name.trim() : ''
    if (!name || name.length > 40) {
      return response.status(400).json({ error: 'Playlist names must be between 1 and 40 characters.' })
    }
    const duplicate = await Playlist.findOne({ name: { $regex: `^${escapeRegex(name)}$`, $options: 'i' } })
    if (duplicate) return response.status(409).json({ error: 'A playlist with that name already exists.' })
    const playlist = await Playlist.create({ name, tracks: [] })
    response.status(201).json(playlist)
  } catch (error) {
    next(error)
  }
})

app.put('/api/playlists/:id/tracks', async (request, response, next) => {
  try {
    const { trackId, action } = request.body ?? {}
    if (typeof trackId !== 'string' || !mongoose.isValidObjectId(trackId)) {
      return response.status(400).json({ error: 'A valid trackId is required.' })
    }
    if (action !== 'add' && action !== 'remove') {
      return response.status(400).json({ error: 'Action must be "add" or "remove".' })
    }
    const [playlist, trackExists] = await Promise.all([
      Playlist.findById(request.params.id),
      Track.exists({ _id: trackId }),
    ])
    if (!playlist) return response.status(404).json({ error: 'Playlist not found.' })
    if (!trackExists) return response.status(404).json({ error: 'Track not found.' })

    if (action === 'add' && !playlist.tracks.some((id) => id.equals(trackId))) {
      playlist.tracks.push(trackId)
    } else if (action === 'remove') {
      playlist.tracks = playlist.tracks.filter((id) => !id.equals(trackId))
    }
    await playlist.save()
    await playlist.populate('tracks')
    response.json(playlist)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/playlists/:id', async (request, response, next) => {
  try {
    const playlist = await Playlist.findByIdAndDelete(request.params.id)
    if (!playlist) return response.status(404).json({ error: 'Playlist not found.' })
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.use((error, _request, response, _next) => {
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ error: 'Request body must be valid JSON.' })
  }
  if (error.type === 'entity.too.large') {
    return response.status(413).json({ error: 'Request body is too large.' })
  }
  if (error instanceof mongoose.Error.CastError) {
    return response.status(400).json({ error: 'The requested ID is not valid.' })
  }
  if (error instanceof mongoose.Error.ValidationError) {
    return response.status(400).json({ error: error.message })
  }
  console.error('API request failed:', error)
  response.status(500).json({ error: 'Something went wrong. Please try again.' })
})

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export default app
