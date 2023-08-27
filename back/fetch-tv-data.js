const fs = require('fs');
const targetDirectory = 'data';
var path = require('path');
module.exports = async ({ fetch }) => {
    let start = 0;
    let remaining = 0;
    let allData = [];
    do {
        await sleep(500);
        const data = await fetchTvData(start, fetch);
        remaining = data["symbols_remaining"];
        console.log(remaining);
        allData = allData.concat(data.symbols);
        start += 50;
    } while (remaining > 0);
    ensureDirectory(targetDirectory);
    allData.sort((a, b) => (a.symbol > b.symbol) ? 1 : -1);
    writeFile("full-data.json", JSON.stringify(allData));
    const reducedComboArray = reduce(allData);
    const filtered = dedupe(reducedComboArray, ({ symbol, exchange }) => `${symbol}-${exchange}`);

    filtered.sort((a, b) => (a.exchange > b.exchange) ? 1 : -1);

    writeFile("data.json", JSON.stringify(filtered));
    //    writeExchanges(filtered);
    //writeCrypto(allData);
    //const result = inventory.group(({ type }) => type);
    console.log('finished');
}
const sleep = ms => new Promise(r => setTimeout(r, ms));
function writeCrypto(allData) {
    let crypto = allData.filter(item => item.hasOwnProperty('typespecs'));
    let crypto1 = crypto.filter(item => item.typespecs.includes('crypto'));
    const cryRed = reduce(crypto1);
    const cryde = dedupe(cryRed, ({ symbol, exchange }) => `${symbol}-${exchange}`);
    writeFile("crypto.json", JSON.stringify(cryde));
}

function writeExchanges(filtered) {
    let exchanges = [];
    filtered.forEach(item => {
        if (!exchanges.includes(item.exchange)) {
            exchanges.push(item.exchange);
        }
    });
    exchanges.sort();
    writeFile("exchanges.json", JSON.stringify(exchanges));
}
function dedupe(reducedComboArray, f) {
    const ids = reducedComboArray.map(f);
    const filtered = reducedComboArray.filter((item, index) => !ids.includes(f(item), index + 1));
    return filtered;
}
function writeFile(fileName, strung) {
    let fn = path.join(targetDirectory, fileName);
    fs.writeFile(fn, strung, err => {
        if (err) {
            console.error(err);
        }
    });
}
function reduce(symbols) {
    return symbols.map(item => {
        return {
            symbol: item.symbol, exchange: item.exchange
        };
    });
}
async function fetchTvData(start = 0, fetch) {
    let startSegment;
    if (start == 0) {
        startSegment = '';
    }
    else {
        startSegment = `&start=${start}`;
    }
    let url = `https://symbol-search.tradingview.com/s/?text=&hl=1&exchange=&lang=en&type=${startSegment}&domain=production&sort_by_country=US`;
    return await fetchUrl(url, fetch);
}
async function fetchUrl(url, fetch) {
    const response = await fetch(url);
    return await response.json();
}
function ensureDirectory(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}
