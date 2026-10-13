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

The catalogue groups symbols by their canonical TradingView `prefix` or `source_id`, rather than the display exchange. Ordinary entries and entries covered by the known EOD rules stay strings. For other daily-only instruments, `["SYMBOL", "D"]` entries retain end-of-day metadata in the same download. This avoids repeating source-wide EOD information for hundreds of thousands of symbols. The collector, search worker, and capped-source retention support both formats. Use Node.js 22.12 or later for the collector's shared browser module.

Futures search responses can name a family such as `RUS:BT` and put its chartable symbols in `contracts`. Expand those contracts using each contract's own source prefix, rather than saving the family as a chart symbol. Continuous contracts (such as `RUS:BT1!`) and dated contracts remain separate choices. The individually verified old `RUS:BT` selection migrates to its working front continuous contract; other symbols are not guessed from their names.

The build publishes the enriched data as `available-markets/catalogue.json` for the current worker, and keeps `available-markets/data.json` as a strings-only compatibility endpoint for cached older releases. Only one catalogue is downloaded by either worker. The source-mode local server maps `catalogue.json` to the saved source file.

`front/market-rules.mjs` keeps verified source aliases for old saved/shared layouts and familiar search terms, known end-of-day sources, and exact widget restrictions confirmed on 13 October 2026. The EOD source rules follow [TradingView's European widget availability](https://www.tradingview.com/widget-docs/markets/europe/). The 13 excluded instruments displayed TradingView's "only available on TradingView" message, whose meaning is explained in its [widget data FAQ](https://www.tradingview.com/widget-docs/faq/data/). Review these rules if TradingView changes availability; do not add whole-provider exclusions based on a small sample.

New selections inherit EOD metadata. Existing layouts retain their order and chart IDs, resolve verified old source labels, and replace unsupported intraday intervals with daily. Once the catalogue loads, its per-symbol metadata also updates saved/shared charts. The interval dropdown offers only D/W/M for known daily-only series. Discontinued data is retained because its history can still be useful.

Legacy COT records can combine COT and COT2 identifiers. Only individually verified old symbols are remapped during migration; subsequent complete refreshes retain the exact source IDs from each search response. A capped COT2 refresh can retain the old combined COT records with their existing identifiers rather than guessing a blanket rename.

The refresh preserves the previous catalogue if requests fail or the total market count would drop by more than 25%. When an exchange search still hits TradingView's result cap after subdivision, the refresh retains that exchange's saved markets, emits a workflow warning, and updates the other exchanges. A capped exchange without valid saved data stops publication.

A new refresh cancels an older running refresh, so retained data comes from the latest checkout rather than a snapshot preceding a catalogue repair.

Review workflow warnings when checking catalogue completeness: a successful refresh can include older entries for an exchange whose search was capped.

## Search indexing

The page declares `https://glipitch.github.io/charts/` as its canonical address. `front/sitemap.xml` lists that page for Search Console submission.

Crawling rules for GitHub Pages belong at `https://glipitch.github.io/robots.txt`, outside this project. A `robots.txt` inside the `/charts/` subfolder does not control crawling. Check the host-level file when diagnosing indexing restrictions.
