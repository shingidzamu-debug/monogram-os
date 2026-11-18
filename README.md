# Monogram OS

Studio OS for The Monogram Club: clients, projects, tasks, calendar and
discovery, saved in your browser.

The app itself is still the single file `index.html` — you can open it
directly in a browser. It is wrapped in a small Next.js project so it can be
deployed to Vercel and, over time, moved into React components.

## Run it

Without Node, just open the file:

    open index.html

With Node (20 or newer), run the Next.js version:

    npm install
    npm run dev

then open http://localhost:3000. `npm run build` makes a production build.

## How the Next.js shell works

`scripts/build-legacy.mjs` runs before every `dev` and `build`. It splits
`index.html` into the page markup and styles (`app/legacy.generated.js`) and
the script (`public/legacy/app.js`). `app/layout.jsx` and `app/page.jsx`
render those pieces. The generated files are not committed — edit
`index.html`, not them.

## Deploy to Vercel

1. Push this repo to GitHub.
2. On vercel.com choose **Add New → Project**, import the `monogram-os`
   repo and keep the detected **Next.js** settings.
3. Click **Deploy**. Every push to `main` deploys again.

## Your data

Data is stored in the browser you use (localStorage), per web address. The
local file, `localhost:3000` and your Vercel URL each have their own separate
data. Use Settings → Download backup regularly, and Restore from backup to
move your studio between them.

See `CLAUDE.md` for the design system and working rules, and
`docs/CHANGELOG.md` for version history.
