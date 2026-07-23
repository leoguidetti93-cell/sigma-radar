const SOURCES = [
  'https://blaze.bet.br/api/roulette_games/recent',
  'https://blaze.com/api/roulette_games/recent'
];

function normalize(item) {
  if (!item) return null;
  const roll = Number(item.roll ?? item.number ?? item.value ?? item.result);
  if (!Number.isInteger(roll) || roll < 0 || roll > 14) return null;
  const created_at = item.created_at ?? item.createdAt ?? item.timestamp ?? item.time;
  if (!created_at) return null;
  return {
    id: String(item.id ?? item.round_id ?? `${created_at}-${roll}`),
    roll,
    color: Number(item.color ?? (roll === 0 ? 0 : roll <= 7 ? 1 : 2)),
    created_at,
    updated_at: item.updated_at ?? item.updatedAt ?? null,
    status: item.status ?? 'complete'
  };
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');

  let lastError = null;
  for (const url of SOURCES) {
    try {
      const response = await fetch(url, {
        headers: {
          'accept': 'application/json,text/plain,*/*',
          'user-agent': 'Mozilla/5.0 SIGMA-LIVE-ENGINE/3.0',
          'referer': 'https://blaze.bet.br/'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data.records || data.rounds || data.data || []);
      const rounds = list.map(normalize).filter(Boolean);
      if (!rounds.length) throw new Error('Resposta sem rodadas válidas');
      rounds.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
      return res.status(200).json({ ok: true, source: url, rounds });
    } catch (error) {
      lastError = error;
    }
  }

  return res.status(502).json({
    ok: false,
    error: lastError ? lastError.message : 'Fonte indisponível',
    rounds: []
  });
};
