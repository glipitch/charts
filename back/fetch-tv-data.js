const fs = require('fs');
const path = require('path');
const targetDirectory = 'front/available-markets';

const DELAY = 200;

module.exports = async ({ fetch }) => {
    const t0 = Date.now();

    // Step 1: Discover all exchanges
    console.log('Discovering exchanges...');
    const exchanges = await discoverExchanges(fetch);
    console.log(`Found ${exchanges.length} exchanges\n`);

    // Step 2: Fetch each exchange (accept 10K cap per exchange)
    let allData = [];
    for (let i = 0; i < exchanges.length; i++) {
        const exchange = exchanges[i];
        const symbols = await fetchAllPages(exchange, fetch);
        allData = allData.concat(symbols);
        const pct = ((i + 1) / exchanges.length * 100).toFixed(0);
        console.log(`[${i + 1}/${exchanges.length}] ${exchange}: ${symbols.length} — ${allData.length} total (${pct}%)`);
    }

    // Step 3: Dedupe, sort, write
    ensureDirectory(targetDirectory);
    const reduced = reduce(allData);
    const filtered = dedupe(reduced, ({ symbol, exchange }) => `${symbol}-${exchange}`);
    filtered.sort((a, b) =>
        a.exchange.localeCompare(b.exchange) || a.symbol.localeCompare(b.symbol));

    writeFile('data.json', JSON.stringify(filtered));
    const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
    console.log(`\nDone: ${filtered.length} unique markets in ${elapsed}s`);
};

async function discoverExchanges(fetch) {
    // Query each type's first page to collect exchange names
    const types = ['stock', 'etf', 'futures', 'forex', 'crypto',
        'index', 'bond', 'cfd', 'warrant', 'crypto_futures'];
    const seen = new Set();
    for (const type of types) {
        try {
            const data = await fetchPage('', type, '', 0, fetch);
            if (data && data.symbols) {
                data.symbols.forEach(s => seen.add(s.exchange));
            }
            // Also grab a second page for more exchange coverage
            if (data && data.symbols_remaining > 0) {
                const data2 = await fetchPage('', type, '', 50, fetch);
                if (data2 && data2.symbols) {
                    data2.symbols.forEach(s => seen.add(s.exchange));
                }
            }
        } catch (e) {
            console.warn(`  discover ${type}: ${e.message}`);
        }
        await sleep(DELAY);
    }
    // Also load exchanges from existing data
    try {
        const existing = JSON.parse(fs.readFileSync(
            path.join(targetDirectory, 'data.json'), 'utf8'));
        existing.forEach(m => seen.add(m.exchange));
    } catch (e) { /* no existing file */ }
    return [...seen].sort();
}

async function fetchAllPages(exchange, fetch) {
    let start = 0;
    let remaining = 0;
    let symbols = [];
    do {
        await sleep(DELAY);
        const data = await fetchWithRetry(exchange, start, fetch);
        if (!data || !data.symbols) break;
        remaining = data.symbols_remaining || 0;
        symbols = symbols.concat(data.symbols);
        start += 50;
    } while (remaining > 0);
    return symbols;
}

async function fetchWithRetry(exchange, start, fetch, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fetchPage(exchange, '', '', start, fetch);
        } catch (err) {
            if (attempt === retries) {
                console.error(`  FAIL ${exchange}@${start}: ${err.message}`);
                return null;
            }
            await sleep(2000 * attempt);
        }
    }
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

function dedupe(arr, keyFn) {
    const seen = new Set();
    return arr.filter(item => {
        const key = keyFn(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function reduce(symbols) {
    return symbols.map(({ symbol, exchange }) => ({ symbol, exchange }));
}

function writeFile(fileName, content) {
    fs.writeFileSync(path.join(targetDirectory, fileName), content);
}

function ensureDirectory(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function fetchPage(exchange, type, text, start, fetch) {
    const params = new URLSearchParams({
        text, hl: '1', exchange, lang: 'en',
        type, domain: 'production', sort_by_country: 'US'
    });
    if (start > 0) params.set('start', start);
    return fetchUrl(`https://symbol-search.tradingview.com/s/?${params}`, fetch);
}

const headers = {
    Origin: 'https://www.tradingview.com',
    Referer: 'https://www.tradingview.com/'
};

async function fetchUrl(url, fetch) {
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

function ensureDirectory(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
