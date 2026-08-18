# Sound Search

**Live app:** _TODO - add the website link here after it is deployed (see [Deployment](#deployment))._
**Live API:** _TODO - add the backend link here._

Search for tracks on Mixcloud, look through the results 6 at a time, and click
one to play it in the middle of the page. It also remembers your last 5
searches for next time.

The website is built with React and TypeScript. It talks to a small backend
built with ASP.NET Core, which in turn talks to the
[Mixcloud API](https://www.mixcloud.com/developers/).

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
├── backend/Dockerfile              used to build the API for hosting
└── render.yaml                     settings for hosting the API on Render
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
  while typing, remembering recent searches, and the part that manages
  search requests (see below).
- `src/hooks/` - connects that logic to React.
- `src/components/` - the search box, the results list, the player box,
  pagination buttons, recent searches, and the loading/empty/error messages.

The `SearchController` keeps search results correct even if you type fast or
click Next/Previous quickly: every new search cancels the one before it, and
an old, slow answer can never overwrite a newer one.

The "flying image" effect: when you click a result, we note where its small
picture is on screen, make a copy of it, and animate that copy across the
page to the player box. We do this by adding the copy directly to the page
(instead of inside its normal container), so it isn't cut off by any
container's edges along the way.

## Running locally

You'll need [.NET SDK 9](https://dotnet.microsoft.com/download) and
[Node 20 or newer](https://nodejs.org/).

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

## Testing

```bash
cd backend && dotnet test
cd frontend && npm test
```

## Deployment

### Backend → Render

1. On [Render](https://render.com), choose **New → Blueprint** and point it
   at this repo. It will find `render.yaml` and build `backend/Dockerfile`
   for you.
2. Once it's live, copy the URL Render gives you.
3. After you also have the Vercel URL (next step), set it as the
   `AllowedOrigin` variable on the Render service and redeploy.

### Frontend → Vercel

1. On [Vercel](https://vercel.com), choose **Add New → Project**, import this
   repo, and set **Root Directory** to `frontend`.
2. Add an environment variable `VITE_API_BASE_URL` with your Render URL from
   above.
3. Deploy. Then put the resulting Vercel URL into Render's `AllowedOrigin`
   setting, and also into this README at the top.

## A few notes on why things are built this way

- The backend mainly exists so all the Mixcloud-specific details stay in one
  place. The website only ever sees our own simple data format.
- Recent searches and your list/tile choice are saved in the browser, not on
  a server, since they're just personal preferences, not account data.
- Page links (cursors) come straight from Mixcloud instead of us counting
  pages ourselves. If Mixcloud changes how paging works internally, nothing
  here needs to change.
- Each page always shows 6 results, even if something asks for more.
