/* SIGMA LIVE ENGINE + CATALOGADOR 3.0 */
(() => {
  'use strict';

  const MAX_ROUNDS = 500;
  const STORAGE_KEY = 'sigma-live-rounds-v3';
    const SETTINGS_KEY = 'sigma-live-settings-v1';
  const API_FALLBACK = '/api/blaze-double';
  const API_POLL_MS = 2500;
  const DEFAULT_SOCKET_URL = 'wss://api-gaming.blaze.bet.br/replication/?EIO=3&transport=websocket';

  let rounds = [];
  let socket = null;
  let reconnectTimer = null;
  let reconnectAttempt = 0;
  let fallbackTimer = null;
  let started = false;
  let latestRoundId = null;
  let lastMessageAt = 0;
  let lastRenderedBlock = '';

  const state = {
    socketUrl: DEFAULT_SOCKET_URL,
    connected: false,
    source: 'nenhuma',
    whiteFx: true,
    autoReconnect: true
  };

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
    const src = item.payload && typeof item.payload === 'object' ? item.payload : item;
    const roll = Number(src.roll ?? src.number ?? src.value ?? src.result);
    if (!Number.isInteger(roll) || roll < 0 || roll > 14) return null;
    const created = parseDate(src.created_at ?? src.createdAt ?? src.timestamp ?? src.time ?? Date.now());
    if (!created) return null;
    const id = String(src.id ?? src.round_id ?? src.uuid ?? `${created.toISOString()}-${roll}`);
    return {
      id,
      roll,
      color: inferColor(roll, src.color),
      createdAt: created.toISOString(),
      updatedAt: src.updated_at ?? src.updatedAt ?? null,
      status: src.status ?? null,
      roomId: src.room_id ?? src.roomId ?? null,
      receivedAt: new Date().toISOString()
    };
  }

  function loadState(){
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      rounds = Array.isArray(saved) ? saved.map(normalizeRound).filter(Boolean).slice(-MAX_ROUNDS) : [];
    } catch { rounds = []; }
    try {
      const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      state.whiteFx = settings.whiteFx !== false;
      state.autoReconnect = settings.autoReconnect !== false;
    } catch {}
    state.socketUrl = window.SIGMA_LIVE_SOCKET_URL || DEFAULT_SOCKET_URL;
  }

  function saveState(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rounds.slice(-MAX_ROUNDS)));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({whiteFx:state.whiteFx,autoReconnect:state.autoReconnect}));
  }

  function mergeRounds(items, animateNewest = false){
    const previousNewest = rounds.length ? rounds[rounds.length - 1].id : null;
    const map = new Map(rounds.map(r => [r.id, r]));
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
    const isNew = Boolean(animateNewest && latestRoundId && latestRoundId !== previousNewest);
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
      if (!map.has(key)) map.set(key, {key,date:new Date(d.getFullYear(),d.getMonth(),d.getDate(),d.getHours(),start),rounds:[]});
      map.get(key).rounds.push(round);
    });

    const now = new Date();
    const currentKey = blockKey(now);
    if (!map.has(currentKey)) {
      const start = blockStart(now.getMinutes());
      map.set(currentKey,{key:currentKey,date:new Date(now.getFullYear(),now.getMonth(),now.getDate(),now.getHours(),start),rounds:[]});
    }

    return [...map.values()].sort((a,b) => b.date - a.date).slice(0, 28);
  }

  function stoneHtml(round, isNewest){
    if (!round) return '<div class="sigma-stone sigma-stone-empty"><span>•</span><small>—</small></div>';
    const white = round.roll === 0;
    const newest = isNewest ? ' sigma-stone-new' : '';
    const fx = white && isNewest && state.whiteFx ? ' sigma-white-hit' : '';
    const value = white ? '<span class="sigma-white-mark">◇</span>' : `<span>${round.roll}</span>`;
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
      const hour = pad(block.date.getHours());
      const dateLabel = block.date.toLocaleDateString('pt-BR');
      const current = index === 0;
      const heads = Array.from({length:10},(_,i) => `<div class="sigma-minute-head">${pad(start+i)}</div>`).join('');
      const cells = Array.from({length:10},(_,i) => {
        const minute = start+i;
        const list = (byMinute.get(minute) || []).slice(0,2);
        return `<div class="sigma-minute-cell">${stoneHtml(list[0],animateNewest && list[0]?.id===latestRoundId)}${stoneHtml(list[1],animateNewest && list[1]?.id===latestRoundId)}</div>`;
      }).join('');
      return `<section class="sigma-live-row${current?' is-current':''}${current && newestBlock!==lastRenderedBlock?' row-enter':''}">
        <div class="sigma-row-meta"><strong>${hour}:${pad(start)}–${hour}:${pad(start+9)}</strong><span>${dateLabel}${current?' • LINHA ATUAL':''}</span></div>
        <div class="sigma-row-grid"><div class="sigma-row-heads">${heads}</div><div class="sigma-row-cells">${cells}</div></div>
      </section>`;
    }).join('');

    lastRenderedBlock = newestBlock;
    const count = $('catalogCount');
    if (count) count.textContent = `${rounds.length} / ${MAX_ROUNDS} rodadas`;
  }

  function updateStats(){
    const latest = rounds[rounds.length-1];
    const recent50 = rounds.slice(-50);
    const whites = recent50.filter(r => r.roll===0).length;
    const reds = recent50.filter(r => r.color==='red').length;
    const blacks = recent50.filter(r => r.color==='black').length;
    if ($('catalogLastRoll')) $('catalogLastRoll').textContent = latest ? String(latest.roll) : '—';
    if ($('catalogLastTime')) $('catalogLastTime').textContent = latest ? formatTime(latest.createdAt,true) : '—';
    if ($('catalogWhite50')) $('catalogWhite50').textContent = whites;
    if ($('catalogRed50')) $('catalogRed50').textContent = reds;
    if ($('catalogBlack50')) $('catalogBlack50').textContent = blacks;
    if ($('catalogUpdated')) $('catalogUpdated').textContent = lastMessageAt ? new Date(lastMessageAt).toLocaleTimeString('pt-BR') : '—';
  }

  function setConnection(status, message, source = state.source){
    state.connected = status === 'online';
    state.source = source;
    const pill = $('catalogStatus');
    const alert = $('catalogAlert');
    const dot = $('catalogLiveDot');
    if (pill) {
      pill.className = `status-pill sigma-live-pill ${status}`;
      pill.textContent = status==='online'?'● AO VIVO':status==='connecting'?'● CONECTANDO':'● OFFLINE';
    }
    if (dot) dot.className = `sigma-live-dot ${status}`;
    if (alert) {
      alert.className = `sigma-live-message ${status}`;
      alert.textContent = message;
    }
    if ($('catalogSource')) $('catalogSource').textContent = source || '—';
  }

  function parseSocketPacket(data){
    if (typeof data !== 'string') return;
    lastMessageAt = Date.now();

    // Engine.IO pode agrupar vários pacotes usando o separador 0x1e.
    const frames = data.split('\x1e').filter(Boolean);
    for (const frame of frames) {
      if (frame === '2') { try { socket?.send('3'); } catch {} continue; }
      if (frame.startsWith('0')) { try { socket?.send('40'); } catch {} continue; }
      if (frame === '40' || frame.startsWith('40{')) {
        setConnection('connecting','Socket.IO conectado. Aguardando a próxima rodada concluída…','Socket.IO • double.tick');
        continue;
      }
      if (!frame.startsWith('42')) continue;

      try {
        const packet = JSON.parse(frame.slice(2));
        const eventName = packet?.[0];
        const body = packet?.[1];
        const payload = body?.payload;
        if (eventName !== 'data' || body?.id !== 'double.tick') continue;
        if (!payload || payload.status !== 'complete') continue;

        const round = normalizeRound(payload);
        if (!round) continue;
        mergeRounds([round], true);
        setConnection('online','Rodada concluída recebida em tempo real.','Socket.IO • double.tick');
      } catch (error) {
        console.debug('SIGMA LIVE: pacote ignorado', error);
      }
    }
  }

  function normalizeSocketUrl(url){
    let value = String(url || '').trim();
    if (!value) return '';
    value = value.replace(/^https:/i,'wss:').replace(/^http:/i,'ws:');
    if (!/^wss?:\/\//i.test(value)) value = `wss://${value}`;
    if (!/[?&]transport=websocket/i.test(value)) {
      const sep = value.includes('?') ? '&' : '?';
      value += `${sep}EIO=3&transport=websocket`;
    }
    return value;
  }

  function connectLiveEngine(customUrl){
    const url = normalizeSocketUrl(customUrl ?? state.socketUrl);
    if (!url) {
      setConnection('connecting','Conectando automaticamente pelo coletor SIGMA…','SIGMA AUTO');
      hydrateFromApi(false);
      return;
    }
    state.socketUrl = url;
    saveState();
    clearTimeout(reconnectTimer);
    if (socket) { try { socket.onclose=null; socket.close(); } catch {} }
    setConnection('connecting','Conectando ao evento double.tick…','Socket.IO');
    try {
      socket = new WebSocket(url);
      socket.onopen = () => {
        reconnectAttempt = 0;
        setConnection('connecting','Canal aberto. Iniciando handshake Engine.IO…','Socket.IO');
      };
      socket.onmessage = event => parseSocketPacket(event.data);
      socket.onerror = () => {
        setConnection('connecting','Socket direto indisponível. Mantendo sincronização automática pela API…','SIGMA AUTO');
        hydrateFromApi(false);
      };
      socket.onclose = () => {
        state.connected = false;
        setConnection('connecting','Socket desconectado. API ativa enquanto reconectamos…','SIGMA AUTO');
        hydrateFromApi(false);
        if (state.autoReconnect) scheduleReconnect();
      };
    } catch (error) {
      setConnection('offline',`Não foi possível abrir o Socket: ${error.message}`,'Socket.IO');
      scheduleReconnect();
    }
  }

  function scheduleReconnect(){
    clearTimeout(reconnectTimer);
    reconnectAttempt += 1;
    const wait = Math.min(30000, 2000 * Math.pow(1.7, reconnectAttempt-1));
    reconnectTimer = setTimeout(() => connectLiveEngine(), wait);
  }

  async function hydrateFromApi(manual=false){
    try {
      const response = await fetch(API_FALLBACK,{cache:'no-store'});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const list = Array.isArray(payload) ? payload : payload.rounds ?? payload.records ?? payload.data ?? [];
      if (!Array.isArray(list) || !list.length) throw new Error('lista vazia');
      mergeRounds(list,false);
      lastMessageAt = Date.now();
      setConnection('online','Resultados sincronizados automaticamente pelo SIGMA LIVE ENGINE.','SIGMA AUTO • Double');
    } catch (error) {
      if (!state.connected) setConnection('offline','O coletor automático ainda não respondeu. Tentando novamente…','SIGMA AUTO');
    }
  }

  function startLiveCatalog(){
    if (!started) {
      loadState();
      renderCatalog(false);
      updateStats();
      started=true;
      window.SIGMA_LIVE_ENGINE = {
        get rounds(){ return rounds.slice(); },
        get latest(){ return rounds[rounds.length-1] || null; },
        connect: connectLiveEngine,
        hydrate: hydrateFromApi
      };
    }
    hydrateFromApi(false);
    clearInterval(fallbackTimer);
    fallbackTimer=setInterval(()=>hydrateFromApi(false),API_POLL_MS);
    setConnection('connecting','Inicializando Socket.IO e contingência automática…','SIGMA LIVE');
    connectLiveEngine(DEFAULT_SOCKET_URL);
  }

  window.startLiveCatalog = startLiveCatalog;
})();
