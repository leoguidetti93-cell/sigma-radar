const DEFAULT_SOURCES = [
  'https://blaze.bet.br/api/roulette_games/recent',
  'https://blaze.com/api/roulette_games/recent'
];

function normalizeRound(item) {
  const roll = Number(item?.roll ?? item?.number ?? item?.value);
  const createdAt = item?.created_at ?? item?.createdAt ?? item?.timestamp;
  const date = new Date(createdAt);
  if (!Number.isInteger(roll) || roll < 0 || roll > 14 || Number.isNaN(date.getTime())) return null;

  const rawColor = Number(item?.color);
  const color = rawColor === 0 || roll === 0 ? 'white' : rawColor === 1 || (roll >= 1 && roll <= 7) ? 'red' : 'black';

  return {
    id: String(item?.id ?? item?.round_id ?? `${date.toISOString()}-${roll}`),
    roll,
    number: roll,
    color,
    created_at: date.toISOString()
  };
}

async function requestSource(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6500);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json,text/plain,*/*',
        'user-agent': 'SigmaRadar/2.1 (+https://sigmaradar.com.br)'
      },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = await response.json();
    const list = Array.isArray(json) ? json : json?.records ?? json?.rounds ?? json?.data ?? [];
    const rounds = list.map(normalizeRound).filter(Boolean);
    if (!rounds.length) throw new Error('lista vazia');

    const newest = rounds.reduce((max, round) => Math.max(max, new Date(round.created_at).getTime()), 0);
    const ageMs = Date.now() - newest;
    if (ageMs > 15 * 60 * 1000) throw new Error('dados desatualizados');

    return rounds;
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

  const custom = process.env.BLAZE_DOUBLE_API_URL;
  const sources = custom ? [custom, ...DEFAULT_SOURCES] : DEFAULT_SOURCES;
  const failures = [];

  for (const source of [...new Set(sources)]) {
    try {
      const rounds = await requestSource(source);
      return res.status(200).json({
        ok: true,
        source: new URL(source).hostname,
        fetchedAt: new Date().toISOString(),
        rounds
      });
    } catch (error) {
      failures.push(`${new URL(source).hostname}: ${error.message}`);
    }
  }

  return res.status(503).json({
    ok: false,
    error: 'Nenhuma fonte de resultados ao vivo respondeu com dados atuais.',
    details: failures
  });
};
