### charts

The page declares `https://glipitch.github.io/charts/` as its canonical address. `front/sitemap.xml` lists that page for Search Console submission. A project-subfolder `robots.txt` would have no effect: crawling rules belong at `https://glipitch.github.io/robots.txt`, outside this project. The absent host-level file currently permits crawling.


View multiple financial charts at once


https://glipitch.github.io/charts

Shareable URLs can include charts in the path and an optional short grid query:

`https://glipitch.github.io/charts/NASDAQ:AAPL,BINANCE:BTCUSDT:240?g=2x4`

Open settings with the rotating chevron or Escape. Set columns, rows and opacity at the top; click available markets to add charts, click an interval to cycle it, and drag Current rows to reorder charts.

On phones, the same selected charts form a scrolling column without changing the saved desktop grid. Vertical touch drags scroll the page; horizontal chart dragging and pinch zoom remain available. Settings retain their original order, with larger touch targets and one scrolling page. Keyboard users can reorder a focused Current row with Alt + Up/Down.

Run `node back/serve.js` locally and `node --test` for checks. Edit `front/index.html`, then run `node back/build.js` to generate the matching GitHub Pages fallback and a versioned release in `dist`. Deployment builds and tests the release, runs on frontend changes, and follows successful catalogue refreshes. Versioned asset URLs keep older cached scripts from mixing with a new page.

Market search runs in a worker. Catalogue refreshes preserve the previous file on request failures or a drop greater than 25% in market count. When a search remains capped after subdivision, the refresh retains that exchange's previously saved markets with a workflow warning and updates the other exchanges. A capped exchange without valid saved data still stops publication.
