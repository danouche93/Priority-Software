# Sound Search

**Live app:** _TODO - add the link here after it is deployed (see [Deployment](#deployment))._

Search for tracks on Mixcloud, look through the results 6 at a time, and click
one to play it in the middle of the page. It also remembers your last 5
searches for next time.

The website is built with React and TypeScript. A small ASP.NET Core backend
serves that website and also talks to the
[Mixcloud API](https://www.mixcloud.com/developers/) for it - so it's really
just one app to run or deploy.

## Project layout

```
.
├── backend/
│   ├── SoundSearch.Api/            the web API
│   └── SoundSearch.Api.Tests/      tests for the API
├── frontend/
│   └── src/
│       ├── api/                    talks to our backend
│       ├── core/                   plain logic, no React, has tests
│       ├── hooks/                  connects core/ to React
│       └── components/             the UI pieces
├── backend/Dockerfile              builds the website, then packages it
│                                    together with the API into one image
└── render.yaml                     settings for hosting on Render
```

The website never talks to Mixcloud directly, only to our own backend.
Everything about Mixcloud (its links, its data format, its paging) is kept in
one place on the backend. That means we could swap Mixcloud for a different
music API later without changing the website at all.

### Backend (`/backend`)

One address to call: `GET /api/search?q={term}` to start a new search, or
`GET /api/search?cursor={token}` to get the next or previous page.

- `Providers/MixcloudSearchProvider.cs` - the only file that knows about
  Mixcloud's links and data format.
- `Providers/MixcloudResponseMapper.cs` - turns Mixcloud's data into our own
  simpler `TrackResult` shape.
- `Cursors/CursorCodec.cs` - takes Mixcloud's own paging link and turns it
  into a safe token to send to the website, then reads it back later. This
  way paging uses Mixcloud's real link instead of us guessing a page number.
- `Controllers/SearchController.cs` - checks the request, asks the provider
  for results, and returns an error message if something goes wrong.

### Frontend (`/frontend`)

- `src/core/` - plain logic with no React in it: waiting before searching
  while typing, remembering recent searches.
- `src/hooks/useSearch.ts` - runs the actual search, using
  [TanStack Query](https://tanstack.com/query) to call the backend.
- `src/components/` - the search box, the results list, the player box,
  pagination buttons, recent searches, and the loading/empty/error messages.

Search results are cached: going back to a page you already saw (or
re-running a search you already ran) shows it instantly instead of asking
the backend again. Typing fast or clicking Next/Previous quickly also stays
correct - an old, slow answer can never overwrite a newer one, since each
search/page has its own place in the cache instead of one shared spot.

The "flying image" effect: when you click a result, we note where its small
picture is on screen, make a copy of it, and animate that copy across the
page to the player box. We do this by adding the copy directly to the page
(instead of inside its normal container), so it isn't cut off by any
container's edges along the way.

## Running locally

You'll need [.NET SDK 9](https://dotnet.microsoft.com/download) and
[Node 20 or newer](https://nodejs.org/).

While you're working on the code, it's easiest to run the two parts
separately, so the website reloads instantly as you edit it:

```bash
cd backend
dotnet run --project SoundSearch.Api --urls http://localhost:5080
```

The backend only allows requests from `http://localhost:5173` by default.
Change this with the `AllowedOrigin` environment variable if needed.

```bash
cd frontend
npm install
cp .env.example .env.local   # already points at http://localhost:5080
npm run dev
```

To try it the way it runs in production, as one single app, build the
Docker image from the repo root instead:

```bash
docker build -f backend/Dockerfile -t soundsearch .
docker run -p 8080:8080 -e PORT=8080 soundsearch
```

Then open `http://localhost:8080`.

## Testing

```bash
cd backend && dotnet test
cd frontend && npm test
```

## Deployment

Only one thing to deploy - the backend, which also serves the website.

1. On [Render](https://render.com), choose **New → Blueprint** and point it
   at this repo. It will find `render.yaml` and build `backend/Dockerfile`
   for you (this builds the website too, and packages it into the same
   image).
2. Once it's live, open the URL Render gives you - that's the whole app.
3. Put that URL into this README at the top.

## A few notes on why things are built this way

- The backend mainly exists so all the Mixcloud-specific details stay in one
  place. The website only ever sees our own simple data format.
- Recent searches and your list/tile choice are saved in the browser, not on
  a server, since they're just personal preferences, not account data.
- Page links (cursors) come straight from Mixcloud instead of us counting
  pages ourselves. If Mixcloud changes how paging works internally, nothing
  here needs to change.
- Each page always shows 6 results, even if something asks for more.
