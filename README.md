# Frequency

Frequency is a full-stack music player built with React, Vite, Express, and MongoDB. It includes a searchable music library, genre filters, persistent playlists and likes, recently played tracks, and an audio player with seek, volume, shuffle, and repeat controls.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- MongoDB 7.0+ (local instance or MongoDB Atlas)

## Run locally

1. Install dependencies from the repository root:

   ```sh
   npm install
   npm install --prefix client
   npm install --prefix server
   ```

2. Copy `server/.env.example` to `server/.env` and set `MONGODB_URI` to your MongoDB connection string.

3. Start the frontend and API together:

   ```sh
   npm run dev
   ```

4. Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

On its first successful connection, the API seeds a small demo catalog and three starter playlists. Audio and artwork are sample external URLs; replace the demo catalog in `server/src/catalog.js` with music you have permission to distribute.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Run the Express API and Vite frontend together |
| `npm run build` | Create the production frontend bundle in `client/dist` |
| `npm run lint` | Lint the React client |
| `npm test` | Run API tests |
| `npm --prefix server start` | Run the API in production mode |

The API listens on port `5000` by default. The Vite development server proxies `/api` requests to it. Configure a different API port by setting `PORT` in `server/.env` and updating the proxy in `client/vite.config.js` if necessary.

## API

- `GET /api/health` — API and database connection status
- `GET /api/tracks?search=&genre=&liked=true&recent=true` — search and filter the catalog
- `PATCH /api/tracks/:id/like` — toggle a track like
- `POST /api/tracks/:id/play` — record a play
- `GET /api/playlists` — list playlists with their tracks
- `POST /api/playlists` — create a playlist
- `PUT /api/playlists/:id/tracks` — add or remove a track (`{ "trackId": "...", "action": "add" }`)
- `DELETE /api/playlists/:id` — delete a playlist
