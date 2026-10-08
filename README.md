### charts

The page declares `https://glipitch.github.io/charts/` as its canonical address. `front/sitemap.xml` lists that page for Search Console submission. A project-subfolder `robots.txt` would have no effect: crawling rules belong at `https://glipitch.github.io/robots.txt`, outside this project. The absent host-level file currently permits crawling.


View multiple financial charts at once


https://glipitch.github.io/charts

Shareable URLs can include charts in the path and an optional short grid query:

`https://glipitch.github.io/charts/NASDAQ:AAPL,BINANCE:BTCUSDT:240?g=2x4`

Phones default to a single chart, with a switcher and optional stacked or landscape comparison views. These preferences do not change the shared desktop grid. Open Markets with the button or Ctrl/Cmd+K; Escape closes it.

Run `node back/serve.js` locally and `node --test` for checks. Edit `front/index.html`, then run `node back/build.js` to generate the matching GitHub Pages fallback. Deployment also builds and tests the shell, runs on frontend changes, and follows successful catalogue refreshes.

Market search loads on demand in a worker. Catalogue refreshes preserve the previous file on request failures, capped results, or a drop greater than 25% in market count.
