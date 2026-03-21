const fs = require('fs');
const path = require('path');
const targetDirectory = 'front/available-markets';

const DELAY = 200;
const CAP = 10000;
const TYPES = ['stock', 'etf', 'futures', 'forex', 'crypto',
    'index', 'bond', 'cfd', 'warrant', 'crypto_futures'];
const PREFIXES = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
const MAX_PREFIX_DEPTH = 2;

module.exports = async ({ fetch }) => {
    const t0 = Date.now();

    console.log('Discovering exchanges...');
    const exchanges = await discoverExchanges(fetch);
    console.log(`Found ${exchanges.length} exchanges\n`);

    let allData = [];
    for (let i = 0; i < exchanges.length; i++) {
        const exchange = exchanges[i];
        const symbols = await fetchExchange(exchange, fetch);
        allData = allData.concat(symbols);
        const pct = ((i + 1) / exchanges.length * 100).toFixed(0);
        console.log(`[${i + 1}/${exchanges.length}] ${exchange}: ${symbols.length} — ${allData.length} total (${pct}%)`);
    }

    ensureDirectory(targetDirectory);
    const reduced = reduce(allData);
    const filtered = dedupe(reduced, ({ symbol, exchange }) => `${symbol}-${exchange}`);
    filtered.sort((a, b) =>
        a.exchange.localeCompare(b.exchange) || a.symbol.localeCompare(b.symbol));

    const grouped = {};
    for (const { exchange, symbol } of filtered) {
        if (!grouped[exchange]) grouped[exchange] = [];
        grouped[exchange].push(symbol);
    }
    writeFile('data.json', JSON.stringify(grouped));
    const elapsed = ((Date.now() - t0) / 1000).toFixed(0);
    console.log(`\nDone: ${filtered.length} unique markets in ${elapsed}s`);
};

// --- Recursive fetching with subdivision on cap ---

async function fetchExchange(exchange, fetch) {
    await sleep(DELAY);
    const probe = await fetchPageSafe(exchange, '', '', 0, fetch);
    const total = probeTotal(probe);

    if (total === 0) {
        // Some exchanges need a type filter (e.g. crypto exchanges)
        console.log(`  ${exchange}: 0 broad results, trying by type`);
        return await fetchByTypes(exchange, '', fetch);
    }
    if (total >= CAP) {
        console.log(`  ${exchange}: ~${total} results, subdividing by type`);
        return await fetchByTypes(exchange, '', fetch);
    }
    return await paginateAll(probe, exchange, '', '', fetch);
}

async function fetchByTypes(exchange, text, fetch) {
    let all = [];
    for (const type of TYPES) {
        await sleep(DELAY);
        const probe = await fetchPageSafe(exchange, type, text, 0, fetch);
        const total = probeTotal(probe);
        if (total === 0) continue;
        if (total >= CAP) {
            console.log(`    ${exchange}/${type}: ~${total} results, subdividing by prefix`);
            all = all.concat(await fetchByPrefix(exchange, type, text, fetch));
        } else {
            all = all.concat(await paginateAll(probe, exchange, type, text, fetch));
        }
    }
    return all;
}

async function fetchByPrefix(exchange, type, text, fetch) {
    let all = [];
    for (const ch of PREFIXES) {
        const query = text + ch;
        await sleep(DELAY);
        const probe = await fetchPageSafe(exchange, type, query, 0, fetch);
        const total = probeTotal(probe);
        if (total === 0) continue;
        if (total >= CAP && query.length < MAX_PREFIX_DEPTH) {
            console.log(`    ${exchange}/${type}/${query}: ~${total} results, expanding`);
            all = all.concat(await fetchByPrefix(exchange, type, query, fetch));
        } else {
            if (total >= CAP) {
                console.log(`    ${exchange}/${type}/${query}: ~${total} results (max depth, accepting cap)`);
            }
            all = all.concat(await paginateAll(probe, exchange, type, query, fetch));
        }
    }
    return all;
}

function probeTotal(probe) {
    if (!probe?.symbols?.length) return 0;
    return probe.symbols.length + (probe.symbols_remaining || 0);
}

async function paginateAll(firstPage, exchange, type, text, fetch) {
    let symbols = firstPage?.symbols ? [...firstPage.symbols] : [];
    let remaining = firstPage?.symbols_remaining || 0;
    let start = 50;
    while (remaining > 0) {
        await sleep(DELAY);
        const page = await fetchPageSafe(exchange, type, text, start, fetch);
        if (!page?.symbols?.length) break;
        symbols.push(...page.symbols);
        remaining = page.symbols_remaining || 0;
        start += 50;
    }
    return symbols;
}

async function fetchPageSafe(exchange, type, text, start, fetch, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fetchPage(exchange, type, text, start, fetch);
        } catch (err) {
            if (attempt === retries) {
                console.error(`  FAIL ${exchange}/${type}/${text}@${start}: ${err.message}`);
                return null;
            }
            await sleep(2000 * attempt);
        }
    }
}

// --- Discovery ---

async function discoverExchanges(fetch) {
    const seen = new Set();
    for (const type of TYPES) {
        let start = 0;
        const maxPages = 5;
        for (let page = 0; page < maxPages; page++) {
            try {
                const data = await fetchPage('', type, '', start, fetch);
                if (data?.symbols) {
                    data.symbols.forEach(s => {
                        // prefix is the exchange filter name the API accepts
                        // source_id is the reliable uppercase fallback
                        seen.add(s.prefix || s.source_id || s.exchange);
                    });
                }
                if (!data?.symbols_remaining) break;
            } catch (e) {
                console.warn(`  discover ${type}@${start}: ${e.message}`);
                break;
            }
            start += 50;
            await sleep(DELAY);
        }
        await sleep(DELAY);
    }
    return [...seen].sort();
}

// --- Utilities ---

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
    const url = `https://symbol-search.tradingview.com/s/?${params}`;
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}

const HEADERS = {
    Origin: 'https://www.tradingview.com',
    Referer: 'https://www.tradingview.com/'
};

async function fetchUrl(url, fetch) {
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}
