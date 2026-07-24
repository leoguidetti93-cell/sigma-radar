/* SIGMA ORION — CATALOGADOR LIVE SERVER 3.1 */
(() => {
  'use strict';

  const MAX_ROUNDS = 500;
  const STORAGE_KEY = 'sigma-live-rounds-v3';
  const LIVE_BASE = 'https://sigma-live-server.onrender.com';
  const MEMORY_URL = `${LIVE_BASE}/memory?limit=${MAX_ROUNDS}`;
  const HEALTH_URL = `${LIVE_BASE}/health`;
  const EVENTS_URL = `${LIVE_BASE}/events`;
  const POLL_MS = 10000;

  let rounds = [];
  let eventSource = null;
  let pollTimer = null;
  let reconnectTimer = null;
  let started = false;
  let latestRoundId = null;
  let lastMessageAt = 0;
  let lastRenderedBlock = '';
  let reconnectAttempt = 0;

  function $(id){ return document.getElementById(id); }
  function pad(value){ return String(value).padStart(2,'0'); }

  function parseDate(raw){
    const d = raw instanceof Date ? raw : new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function inferColor(roll, rawColor){
    const c = Number(rawColor);
    if (roll === 0 || c === 0) return 'white';
    if (c === 1 || (roll >= 1 && roll <= 7)) return 'red';
    return 'black';
  }

  function normalizeRound(item){
    if (!item) return null;
    const src = item.round && typeof item.round === 'object'
      ? item.round
      : item.payload && typeof item.payload === 'object'
        ? item.payload
        : item;

    if (src.status && src.status !== 'complete') return null;

    const roll = Number(src.roll ?? src.number ?? src.value ?? src.result);
    if (!Number.isInteger(roll) || roll < 0 || roll > 14) return null;

    const created = parseDate(
      src.created_at ?? src.createdAt ?? src.timestamp ?? src.time ?? src.received_at ?? Date.now()
    );
    if (!created) return null;

    const id = String(src.id ?? src.round_id ?? src.uuid ?? `${created.toISOString()}-${roll}`);

    return {
      id,
      roll,
      color: inferColor(roll, src.color),
      createdAt: created.toISOString(),
      updatedAt: src.updated_at ?? src.updatedAt ?? null,
      status: 'complete',
      roomId: src.room_id ?? src.roomId ?? null,
      receivedAt: src.received_at ?? src.receivedAt ?? new Date().toISOString()
    };
  }

  function loadState(){
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      rounds = Array.isArray(saved)
        ? saved.map(normalizeRound).filter(Boolean).slice(-MAX_ROUNDS)
        : [];
    } catch {
      rounds = [];
    }
  }

  function saveState(){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds.slice(-MAX_ROUNDS)));
    } catch (error) {
      console.warn('SIGMA: não foi possível preservar a memória local.', error);
    }
  }

  function mergeRounds(items, animateNewest = false){
    const previousNewest = rounds.length ? rounds[rounds.length - 1].id : null;
    const map = new Map(rounds.map(round => [round.id, round]));

    for (const raw of items || []) {
      const round = normalizeRound(raw);
      if (!round) continue;
      const previous = map.get(round.id);
      map.set(round.id, previous ? {...previous, ...round} : round);
    }

    rounds = [...map.values()]
      .sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-MAX_ROUNDS);

    latestRoundId = rounds.length ? rounds[rounds.length - 1].id : null;
    saveState();

    const isNew = Boolean(
      animateNewest && latestRoundId && latestRoundId !== previousNewest
    );

    renderCatalog(isNew);
    updateStats();

    if (isNew) broadcastRound(rounds[rounds.length - 1]);
    return isNew;
  }

  function broadcastRound(round){
    window.dispatchEvent(new CustomEvent('sigma:live-round', {detail: round}));
    window.SIGMA_LIVE_ENGINE = window.SIGMA_LIVE_ENGINE || {};
    window.SIGMA_LIVE_ENGINE.rounds = rounds.slice();
    window.SIGMA_LIVE_ENGINE.latest = round;
  }

  function formatTime(iso, includeSeconds = false){
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', includeSeconds
      ? {hour:'2-digit',minute:'2-digit',second:'2-digit'}
      : {hour:'2-digit',minute:'2-digit'});
  }

  function dateKey(d){ return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  function blockStart(minute){ return Math.floor(minute / 10) * 10; }
  function blockKey(d){ return `${dateKey(d)}-${pad(d.getHours())}-${pad(blockStart(d.getMinutes()))}`; }

  function groupBlocks(){
    const map = new Map();

    rounds.forEach(round => {
      const d = new Date(round.createdAt);
      const start = blockStart(d.getMinutes());
      const key = blockKey(d);

      if (!map.has(key)) {
        map.set(key, {
          key,
          date: new Date(d.getFullYear(),d.getMonth(),d.getDate(),d.getHours(),start),
          rounds: []
        });
      }

      map.get(key).rounds.push(round);
    });

    const now = new Date();
    const currentKey = blockKey(now);

    if (!map.has(currentKey)) {
      const start = blockStart(now.getMinutes());
      map.set(currentKey, {
        key: currentKey,
        date: new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),start),
        rounds: []
      });
    }

    return [...map.values()].sort((a,b) => b.date - a.date).slice(0, 28);
  }

  function stoneHtml(round, isNewest){
    if (!round) {
      return '<div class="sigma-stone sigma-stone-empty"><span>•</span><small>—</small></div>';
    }

    const white = round.roll === 0;
    const newest = isNewest ? ' sigma-stone-new' : '';
    const fx = white && isNewest ? ' sigma-white-hit' : '';
    const value = white
      ? '<span class="sigma-white-mark">◇</span>'
      : `<span>${round.roll}</span>`;

    return `<div class="sigma-stone sigma-stone-${round.color}${newest}${fx}" data-round-id="${round.id}" title="${formatTime(round.createdAt,true)} • ID ${round.id}">${value}<small>${formatTime(round.createdAt)}</small></div>`;
  }

  function renderCatalog(animateNewest = false){
    const root = $('catalogHours');
    if (!root) return;

    const blocks = groupBlocks();
    const newestBlock = blocks[0]?.key || '';

    root.innerHTML = blocks.map((block,index) => {
      const byMinute = new Map();

      block.rounds.forEach(round => {
        const minute = new Date(round.createdAt).getMinutes();
        if (!byMinute.has(minute)) byMinute.set(minute, []);
        byMinute.get(minute).push(round);
      });

      byMinute.forEach(list => list.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)));

      const start = block.date.getMinutes();
      const current = index === 0;
      const heads = Array.from({length:10},(_,i) => `<div class="sigma-minute-head">${pad(start+i)}</div>`).join('');
      const cells = Array.from({length:10},(_,i) => {
        const minute = start+i;
        const list = (byMinute.get(minute) || []).slice(0,2);
        return `<div class="sigma-minute-cell">${stoneHtml(list[0],animateNewest && list[0]?.id===latestRoundId)}${stoneHtml(list[1],animateNewest && list[1]?.id===latestRoundId)}</div>`;
      }).join('');

      return `<section class="sigma-live-row sigma-live-row-clean${current?' is-current':''}${current && newestBlock!==lastRenderedBlock?' row-enter':''}">
        <div class="sigma-row-grid"><div class="sigma-row-heads">${heads}</div><div class="sigma-row-cells">${cells}</div></div>
      </section>`;
    }).join('');

    lastRenderedBlock = newestBlock;
    if ($('catalogCount')) $('catalogCount').textContent = `${rounds.length} / ${MAX_ROUNDS} rodadas`;
  }

  function updateStats(){
    const latest = rounds[rounds.length-1];
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const lastHour = rounds.filter(r => new Date(r.createdAt).getTime() >= oneHourAgo);
    const total = lastHour.length;
    const whites = lastHour.filter(r => r.roll === 0 || r.color === 'white').length;
    const reds = lastHour.filter(r => r.color === 'red').length;
    const blacks = lastHour.filter(r => r.color === 'black').length;
    const percent = value => total ? Math.round((value / total) * 100) : 0;

    const lastStone = $('catalogLastStone');
    if (lastStone) {
      if (latest) {
        lastStone.className = `catalog-last-stone ${latest.color || 'unknown'}`;
        lastStone.textContent = latest.roll === 0 ? '□' : String(latest.roll);
      } else {
        lastStone.className = 'catalog-last-stone empty';
        lastStone.textContent = '—';
      }
    }

    if ($('catalogLastTime')) $('catalogLastTime').textContent = latest ? formatTime(latest.createdAt,true) : '—';
    if ($('catalogWhiteHour')) $('catalogWhiteHour').textContent = `${percent(whites)}%`;
    if ($('catalogRedHour')) $('catalogRedHour').textContent = `${percent(reds)}%`;
    if ($('catalogBlackHour')) $('catalogBlackHour').textContent = `${percent(blacks)}%`;
    if ($('catalogUpdated')) $('catalogUpdated').textContent = lastMessageAt
      ? new Date(lastMessageAt).toLocaleTimeString('pt-BR')
      : '—';
  }

  function setConnection(status, message, source){
    const pill = $('catalogStatus');
    const alert = $('catalogAlert');
    const dot = $('catalogLiveDot');

    if (pill) {
      pill.className = `status-pill sigma-live-pill ${status}`;
      pill.textContent = status==='online'
        ? '● STATUS: CONECTADO'
        : status==='connecting'
          ? '● STATUS: CONECTANDO'
          : '● STATUS: DESCONECTADO';
    }

    if (dot) dot.className = `sigma-live-dot ${status}`;

    if (alert) {
      alert.className = `sigma-live-message ${status}`;
      alert.textContent = message;
    }

    if ($('catalogSource')) $('catalogSource').textContent = source || '—';
  }

  async function hydrateFromServer(animateNewest = false){
    try {
      const response = await fetch(MEMORY_URL, {cache:'no-store'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const payload = await response.json();
      const list = Array.isArray(payload) ? payload : payload.rounds || [];

      mergeRounds(list, animateNewest);
      lastMessageAt = Date.now();
      updateStats();

      setConnection(
        'online',
        list.length
          ? 'Memória sincronizada. Aguardando novas rodadas ao vivo.'
          : 'Servidor conectado. Aguardando a próxima rodada completa.',
        'SIGMA LIVE SERVER'
      );

      return true;
    } catch (error) {
      setConnection(
        'connecting',
        'Acordando o servidor e tentando sincronizar as rodadas…',
        'SIGMA LIVE SERVER'
      );
      console.warn('SIGMA: falha ao sincronizar memória.', error);
      return false;
    }
  }

  function closeEventStream(){
    if (eventSource) {
      try { eventSource.close(); } catch {}
      eventSource = null;
    }
  }

  function scheduleEventReconnect(){
    clearTimeout(reconnectTimer);
    reconnectAttempt += 1;
    const wait = Math.min(30000, 1500 * Math.pow(1.7, reconnectAttempt - 1));
    reconnectTimer = setTimeout(connectEventStream, wait);
  }

  function connectEventStream(){
    closeEventStream();
    setConnection('connecting','Abrindo canal de rodadas em tempo real…','SIGMA LIVE SERVER');

    try {
      eventSource = new EventSource(EVENTS_URL);

      eventSource.onopen = () => {
        reconnectAttempt = 0;
        lastMessageAt = Date.now();
        setConnection('online','Canal ao vivo conectado. Aguardando a próxima rodada completa.','SIGMA LIVE SERVER • /events');
      };

      eventSource.addEventListener('round', event => {
        try {
          const payload = JSON.parse(event.data);
          lastMessageAt = Date.now();
          mergeRounds([payload.round || payload], true);
          setConnection('online','Nova rodada recebida em tempo real.','SIGMA LIVE SERVER • /events');
        } catch (error) {
          console.warn('SIGMA: evento de rodada inválido.', error);
        }
      });

      eventSource.addEventListener('state', event => {
        try {
          const state = JSON.parse(event.data);
          lastMessageAt = Date.now();
          if (state.socketIoConnected && state.subscribed) {
            setConnection('online','Servidor conectado à sala double_room_1.','SIGMA LIVE SERVER • double.tick');
          } else {
            setConnection('connecting','Servidor reconectando à fonte de resultados…','SIGMA LIVE SERVER');
          }
        } catch {}
      });

      eventSource.addEventListener('heartbeat', () => {
        lastMessageAt = Date.now();
        updateStats();
      });

      eventSource.onerror = () => {
        closeEventStream();
        setConnection('connecting','Canal ao vivo interrompido. Reconectando…','SIGMA LIVE SERVER');
        scheduleEventReconnect();
      };
    } catch (error) {
      console.warn('SIGMA: não foi possível abrir /events.', error);
      scheduleEventReconnect();
    }
  }

  async function checkHealth(){
    try {
      const response = await fetch(HEALTH_URL, {cache:'no-store'});
      if (!response.ok) return;
      const health = await response.json();

      if (health.socketIoConnected && health.subscribed) {
        setConnection('online','Servidor ativo e inscrito no Double.','SIGMA LIVE SERVER • double_room_1');
      }
    } catch {}
  }

  function startPolling(){
    clearInterval(pollTimer);
    pollTimer = setInterval(async () => {
      await hydrateFromServer(true);
      if (!eventSource) connectEventStream();
    }, POLL_MS);
  }

  async function startLiveCatalog(){
    if (!started) {
      loadState();
      renderCatalog(false);
      updateStats();
      started = true;

      window.SIGMA_LIVE_ENGINE = {
        get rounds(){ return rounds.slice(); },
        get latest(){ return rounds[rounds.length-1] || null; },
        hydrate: hydrateFromServer,
        reconnect: connectEventStream,
        server: LIVE_BASE
      };
    }

    setConnection('connecting','Conectando ao SIGMA LIVE SERVER…','SIGMA LIVE SERVER');
    await hydrateFromServer(false);
    await checkHealth();
    connectEventStream();
    startPolling();
  }

  window.startLiveCatalog = startLiveCatalog;
})();
