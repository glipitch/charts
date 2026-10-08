export const prepare = grouped => Object.entries(grouped).map(([exchange, symbols]) => ({
  exchange, normalizedExchange: exchange.toLowerCase(), symbols,
  normalizedSymbols: symbols.map(symbol => symbol.toLowerCase()),
}));

export const findMarkets = (groups, query, limit = 200) => {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return { results: [], total: 0 };
  const ranked = [[], [], []];
  let total = 0;
  for (const group of groups) {
    for (let index = 0; index < group.symbols.length; index++) {
      const symbol = group.normalizedSymbols[index];
      if (!terms.every(term => group.normalizedExchange.includes(term) || symbol.includes(term))) continue;
      total++;
      const rank = terms.some(term => symbol === term) ? 0 : terms.some(term => symbol.startsWith(term)) ? 1 : 2;
      if (ranked[rank].length < limit) ranked[rank].push({ exchange: group.exchange, symbol: group.symbols[index] });
    }
  }
  return { results: ranked.flat().slice(0, limit), total };
};
