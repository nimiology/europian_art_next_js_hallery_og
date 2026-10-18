# Hallery

A quiet, museum-style browser for a collection of **51,459 artworks**. Browse the collection, filter by artist, medium, year or location, open any work on its wall label, and zoom in fullscreen.

Built with Next.js (App Router) and a bundled read-only SQLite database. No external database or setup required.

[![Hallery walkthrough: browsing the collection, filtering by artist, opening an artwork, zooming in the lightbox, and Art of the moment](docs/demo.gif)](docs/demo.mp4)

<sub>Click for the full-quality video.</sub>

## Screens

- **Collection** (`/`): masonry gallery with title search, filter chips, sorting and "Load more". Filters live in the URL, so any view can be shared.
- **Artwork** (`/art/:id`): large image, museum wall label, fullscreen lightbox with click-to-zoom.
- **Art of the moment** (`/moment`): one random artwork, full-bleed.

Light and dark themes follow the system setting, with a toggle in the header.

## Run locally

Requires Node 22.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deploy to Vercel

Import the repo in Vercel and deploy. No settings or environment variables are needed: `data/arts.sqlite3` ships inside the serverless functions (see `next.config.ts`) and is opened read-only.

Page views are tracked with [Vercel Analytics](https://vercel.com/docs/analytics). Turn it on under the project's **Analytics** tab; until then the script does nothing.

## API

All endpoints return JSON.

| Endpoint | Returns |
|---|---|
| `GET /api/arts` | `{ count, next, previous, results }`, 25 per page |
| `GET /api/arts/:id` | one artwork, or 404 |
| `GET /api/random` | one random artwork |
| `GET /api/random/picture` | redirects to a random artwork's image |

`/api/arts` query parameters:

- `limit` (1–100, default 25), `offset`
- `artist__contains`, `title__contains`, `year__contains`, `type__contains`, `location__contains` (case-insensitive substring)
- `ordering`: `id`, `artist`, `title`, `year`, `type`, `location`, or prefix with `-` for descending. Without it, results are shuffled with a `seed` that the `next` link carries, so pages never repeat.

An artwork looks like:

```json
{
  "id": 1,
  "artist": "AACHEN, Hans von",
  "title": "A Couple in a Tavern",
  "picture": "https://www.wga.hu/art/a/aachen/k_couple.jpg",
  "year": "1595-1605",
  "type": "Oil on canvas, 63 x 51 cm",
  "location": "Kunsthistorisches Museum, Vienna"
}
```

## Data

`data/arts.sqlite3` holds a single table, `art_art`. Images are hotlinked from the [Web Gallery of Art](https://www.wga.hu/). To use a different database file, set `DATABASE_PATH`.

## Project layout

```
app/            pages and API routes
components/     header, lightbox, image with broken-image fallback, shared store
lib/db.ts       read-only SQLite queries
lib/ratio.ts    reserves image space from the work's size ("63 x 51 cm")
data/           the artwork database
```

## License

Code is [MIT](LICENSE). Artwork images and metadata come from the Web Gallery of Art and remain subject to its terms.
