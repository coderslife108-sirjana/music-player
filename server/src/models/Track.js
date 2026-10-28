import mongoose from 'mongoose'

const trackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, required: true, trim: true },
    album: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true, index: true },
    duration: { type: String, default: '--:--' },
    image: { type: String, required: true },
    audio: { type: String, required: true },
    liked: { type: Boolean, default: false, index: true },
    lastPlayedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true },
)

export default mongoose.model('Track', trackSchema)
