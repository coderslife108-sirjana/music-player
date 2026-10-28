import 'dotenv/config'
import mongoose from 'mongoose'
import app from './app.js'
import { catalog } from './catalog.js'
import Track from './models/Track.js'
import Playlist from './models/Playlist.js'

const { MONGODB_URI, PORT = 5000 } = process.env

if (!MONGODB_URI) {
  console.error('MONGODB_URI is required. Copy server/.env.example to server/.env and configure MongoDB.')
  process.exit(1)
}

try {
  await mongoose.connect(MONGODB_URI)
  let tracks = await Track.find().sort({ _id: 1 })
  if (tracks.length === 0) tracks = await Track.insertMany(catalog)
  if (await Playlist.estimatedDocumentCount() === 0) {
    await Playlist.insertMany([
      { name: '01 - slow mornings', tracks: tracks.slice(0, 3).map((track) => track._id) },
      { name: 'the long way home', tracks: [tracks[4]?._id, tracks[6]?._id].filter(Boolean) },
      { name: 'little blue hours', tracks: [tracks[2]?._id, tracks[5]?._id].filter(Boolean) },
    ])
  }
  app.listen(PORT, () => console.info(`Frequency API listening on http://localhost:${PORT}`))
} catch (error) {
  console.error('Could not start the API:', error.message)
  await mongoose.disconnect()
  process.exit(1)
}
