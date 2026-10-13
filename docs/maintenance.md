# Maintenance guide

## Project layout

- `front/`: the static site, styles, browser modules, and searchable market catalogue.
- `back/`: the local server, release builder, and TradingView catalogue fetcher.
- `test/`: automated checks using Node.js's built-in test runner.
- `.github/workflows/`: GitHub Pages deployment and scheduled catalogue refreshes.

## Build and verification

Edit `front/index.html` for changes to the page shell. Run:

```sh
node back/build.js
node --test
```

The build regenerates `front/404.html` from the same shell, with a `/charts/` base URL so shared chart paths can load their assets on GitHub Pages. It also writes the release to `dist/` and versions local asset URLs to prevent cached scripts from mixing with a newer page. `dist/` is generated and ignored by Git.

To preview the generated release:

```sh
node back/serve.js --built
```

## Deployment

The **Deploy Charts** workflow builds, tests, and publishes `dist/` to the `gh-pages` branch. It runs for changes on `main` to `front/`, the builder, or the deployment workflow; it can also be started manually. A successful **Fetch TradingView data** run triggers deployment.

Documentation-only changes do not require a site deployment.

## Market catalogue

The **Fetch TradingView data** workflow refreshes `front/available-markets/data.json` daily at 01:00 UTC and can be started manually. Search runs in a browser worker, returning up to 200 results and asking users to refine larger matches.

The refresh preserves the previous catalogue if requests fail or the total market count would drop by more than 25%. When an exchange search still hits TradingView's result cap after subdivision, the refresh retains that exchange's saved markets, emits a workflow warning, and updates the other exchanges. A capped exchange without valid saved data stops publication.

Review workflow warnings when checking catalogue completeness: a successful refresh can include older entries for an exchange whose search was capped.

## Search indexing

The page declares `https://glipitch.github.io/charts/` as its canonical address. `front/sitemap.xml` lists that page for Search Console submission.

Crawling rules for GitHub Pages belong at `https://glipitch.github.io/robots.txt`, outside this project. A `robots.txt` inside the `/charts/` subfolder does not control crawling. Check the host-level file when diagnosing indexing restrictions.
