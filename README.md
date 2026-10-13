# Charts

A lightweight dashboard for viewing multiple TradingView financial charts in one place. Choose markets, set their time intervals, and arrange them in a grid.

**[Open Charts](https://glipitch.github.io/charts/)** · [Try a two-chart example](https://glipitch.github.io/charts/NASDAQ:AAPL,BINANCE:BTCUSDT:240?g=2x1)

## Features

- Search markets by symbol and exchange, such as `btc binance` or `aapl nasdaq`.
- Set the number of columns and rows, and reorder your charts.
- Choose a separate time interval for each chart.
- Open known end-of-day markets at daily intervals automatically.
- Switch between light and dark themes and adjust the settings panel's opacity.
- Keep your selection in your browser and share a layout through its URL.
- View charts in a scrolling column on phones while retaining your desktop grid.

## Getting started

1. On an empty dashboard, type a symbol and exchange to see matching markets beneath the search field. Select a result to add your first chart, or open the two-chart example.
2. Open settings using the chevron in the top-right corner, or press **Escape**. Search under **Available** to add more charts.
3. Set **Columns** and **Rows** to fit your selection. When some selected charts are hidden, **Current** shows how many are displayed. Choose **Fit all** to expand the grid.
4. Choose a chart's interval from its dropdown under **Current**. Daily-only charts offer daily, weekly, and monthly choices. Drag a row to reorder it, or focus it and press **Alt + Up/Down**.
5. Close settings using the chevron or **Escape** to view your charts.

Use a chart's × button to remove it, or **Clear** to remove the whole selection. With a keyboard, use **Tab** to reach controls and **Enter** or **Space** to select an available market.

Choose **Light** or **Dark** beside **Theme** in settings, near the panel opacity control. The **Source on GitHub** link is at the bottom of settings. The toolbar keeps settings and sharing within reach.

## Sharing a layout

Use the link button in the top-right toolbar to copy your layout. It shows **Link copied** when successful, or a selectable link if clipboard access is unavailable. You can also copy the address bar. The URL includes the charts' order, intervals, and grid dimensions:

```text
https://glipitch.github.io/charts/NASDAQ:AAPL,BINANCE:BTCUSDT:240?g=2x1
```

This example shows Apple on a one-hour interval and Bitcoin/Tether on a four-hour interval, in two columns and one row. The path uses `EXCHANGE:SYMBOL[:INTERVAL]`; omitting the interval selects one hour. The optional `g=COLSxROWS` query sets the grid size.

Your browser remembers charts, grid dimensions, theme, search, and panel opacity. A shared URL supplies the charts and grid; theme and opacity stay local to each browser.

## Running locally

Install [Node.js](https://nodejs.org/) 22.12 or later, then run these commands from the repository directory. No package installation is needed.

```sh
node back/serve.js
```

Open [localhost:3000](http://localhost:3000/). Chart widgets require access to TradingView over the internet.

```sh
node --test
node back/build.js
```

The build writes a deployable site to `dist/`. See the [maintenance guide](docs/maintenance.md) for deployment, market catalogue refreshes, and search indexing.

## Chart data

Charts are embedded TradingView widgets. Market availability and data delays depend on TradingView and the exchange. Known end-of-day charts use daily, weekly, or monthly intervals. Entries verified as unavailable in widgets are omitted from search; an existing saved chart for one of these entries offers a link to TradingView instead.

The searchable market catalogue is refreshed separately from chart prices. Historical and untested series are retained, so search availability is not a guarantee that every TradingView widget can display data.

## License

[MIT](LICENSE).
