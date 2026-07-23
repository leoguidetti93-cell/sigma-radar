const SOURCES = [
  'https://blaze.bet.br/api/singleplayer-originals/originals/roulette_games/recent/1',
  'https://blaze.bet.br/api/roulette_games/recent',
  'https://blaze.com/api/singleplayer-originals/originals/roulette_games/recent/1',
  'https://blaze.com/api/roulette_games/recent'
];

function normalize(item) {
  if (!item) return null;
  const src = item.payload && typeof item.payload === 'object' ? item.payload : item;
  const roll = Number(src.roll ?? src.number ?? src.value ?? src.result);
  if (!Number.isInteger(roll) || roll < 0 || roll > 14) return null;
  const created_at = src.created_at ?? src.createdAt ?? src.timestamp ?? src.time ?? src.updated_at;
  if (!created_at) return null;
  return {
    id: String(src.id ?? src.round_id ?? src.uuid ?? `${created_at}-${roll}`),
    roll,
    color: Number(src.color ?? (roll === 0 ? 0 : roll <= 7 ? 1 : 2)),
    created_at,
    updated_at: src.updated_at ?? src.updatedAt ?? null,
    status: src.status ?? 'complete'
  };
}

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  const candidates = [data.records, data.rounds, data.data, data.results, data.items, data.payload];
  for (const value of candidates) {
    if (Array.isArray(value)) return value;
    if (value && typeof value === 'object') {
      for (const nested of [value.records, value.rounds, value.data, value.results, value.items]) {
        if (Array.isArray(nested)) return nested;
      }
    }
  }
  return [];
}

async function requestSource(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'cache-control': 'no-cache',
        pragma: 'no-cache',
        referer: 'https://blaze.bet.br/pt/games/double',
        origin: 'https://blaze.bet.br',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/150 Safari/537.36'
      }
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('resposta não JSON'); }
    const rounds = extractList(data).map(normalize).filter(Boolean);
    if (!rounds.length) throw new Error('resposta sem rodadas válidas');
    rounds.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    return rounds;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const errors = [];
  for (const url of SOURCES) {
    try {
      const rounds = await requestSource(url);
      return res.status(200).json({ ok: true, rounds, count: rounds.length });
    } catch (error) {
      errors.push(`${url}: ${error.name === 'AbortError' ? 'timeout' : error.message}`);
    }
  }

  return res.status(502).json({
    ok: false,
    error: 'Nenhuma fonte respondeu',
    details: errors,
    rounds: []
  });
};
