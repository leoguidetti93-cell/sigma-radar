/* SIGMA ORION — CATALOGADOR LIVE SERVER 3.1 */
(() => {
  'use strict';

  const MAX_ROUNDS = 3000;
  let displayLimit = Number(localStorage.getItem("sigma-catalog-display-limit") || 500);
  const STORAGE_KEY = 'sigma-live-rounds-v3';
  const LIVE_BASE = 'https://sigma-live-server.onrender.com';
  const MEMORY_URL = `${LIVE_BASE}/memory?limit=${MAX_ROUNDS}`;
  const HEALTH_URL = `${LIVE_BASE}/health`;
  const EVENTS_URL = `${LIVE_BASE}/events`;
  const BOOTSTRAP_URL = `${LIVE_BASE}/memory/bootstrap`;
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

  async function bootstrapServerFromLocal(){
    if (rounds.length < 20) return;
    try {
      const response = await fetch(BOOTSTRAP_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({rounds:rounds.slice(-MAX_ROUNDS)})
      });
      const data = await response.json().catch(()=>null);
      if(response.ok && data?.ok){
        console.log(`SIGMA: memória central sincronizada (${data.count} rodadas).`);
      } else if(response.status !== 409){
        console.warn('SIGMA: servidor não aceitou a memória local.', data);
      }
    } catch(error){
      console.warn('SIGMA: não foi possível sincronizar a memória central.', error);
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

  function visibleRounds(){ return rounds.slice(-Math.min(displayLimit, rounds.length)); }

  function groupBlocks(){
    const map = new Map();

    visibleRounds().forEach(round => {
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

    return [...map.values()].sort((a,b) => b.date - a.date);
  }

  function stoneHtml(round, isNewest){
    if (!round) {
      return '<div class="sigma-stone sigma-stone-empty"><span>•</span><small>—</small></div>';
    }

    const white = round.roll === 0;
    const newest = isNewest ? ' sigma-stone-new' : '';
    const fx = white && isNewest ? ' sigma-white-hit' : '';
    const value = white
      ? '<span class="sigma-white-mark">Σ</span>'
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
      const cells = Array.from({length:10},(_,i) => {
        const minute = start+i;
        const list = (byMinute.get(minute) || []).slice(0,2);
        return `<div class="sigma-minute-cell">${stoneHtml(list[0],animateNewest && list[0]?.id===latestRoundId)}${stoneHtml(list[1],animateNewest && list[1]?.id===latestRoundId)}</div>`;
      }).join('');

      return `<section class="sigma-live-row sigma-live-row-clean${current?' is-current':''}${current && newestBlock!==lastRenderedBlock?' row-enter':''}">
        <div class="sigma-row-grid"><div class="sigma-row-cells">${cells}</div></div>
      </section>`;
    }).join('');

    if (blocks.length) {
      const globalHeads = Array.from(
        {length:10},
        (_,i) => `<div class="sigma-global-minute-head">${pad(i)}</div>`
      ).join('');

      root.innerHTML = `<div class="sigma-global-head-wrap"><div class="sigma-global-heads">${globalHeads}</div></div>${root.innerHTML}`;
    }

    lastRenderedBlock = newestBlock;
    if ($('catalogCount')) $('catalogCount').textContent = `${Math.min(displayLimit,rounds.length)} exibidas • ${rounds.length} / ${MAX_ROUNDS}`;
    window.dispatchEvent(new CustomEvent('sigma:catalog-rendered')); 
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
        lastStone.textContent = latest.roll === 0 ? 'Σ' : String(latest.roll);
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
      await bootstrapServerFromLocal();
      renderCatalog(false);
      updateStats();
      started = true;

      window.SIGMA_LIVE_ENGINE = {
        get rounds(){ return rounds.slice(); },
        get latest(){ return rounds[rounds.length-1] || null; },
        hydrate: hydrateFromServer,
        reconnect: connectEventStream,
        server: LIVE_BASE,
        get displayLimit(){ return displayLimit; },
        setDisplayLimit(limit){ displayLimit=[300,500,1000,3000].includes(Number(limit))?Number(limit):500; localStorage.setItem('sigma-catalog-display-limit',String(displayLimit)); renderCatalog(false); return displayLimit; },
        render(){ renderCatalog(false); }
      };
    }

    setConnection('connecting','Conectando ao SIGMA LIVE SERVER…','SIGMA LIVE SERVER');
    await hydrateFromServer(false);
    await checkHealth();
    connectEventStream();
    startPolling();
  }

  window.startLiveCatalog = startLiveCatalog;

  function ensureWhiteCelebrationLayer(){
    let canvas = document.getElementById("sigma-white-particles");
    if(!canvas){
      canvas = document.createElement("canvas");
      canvas.id = "sigma-white-particles";
      document.body.appendChild(canvas);
    }
    let flash = document.getElementById("sigma-white-flash");
    if(!flash){
      flash = document.createElement("div");
      flash.id = "sigma-white-flash";
      document.body.appendChild(flash);
    }
    return {canvas,flash};
  }

  function celebrateWhiteStone(stoneElement){
    if(!stoneElement || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

    const {canvas,flash} = ensureWhiteCelebrationLayer();
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.floor(width*dpr);
    canvas.height = Math.floor(height*dpr);
    canvas.style.width = width+"px";
    canvas.style.height = height+"px";
    ctx.setTransform(dpr,0,0,dpr,0,0);

    const rect = stoneElement.getBoundingClientRect();
    const originX = rect.left + rect.width/2;
    const originY = rect.top + rect.height/2;

    flash.style.setProperty("--fx", `${(originX/width)*100}%`);
    flash.style.setProperty("--fy", `${(originY/height)*100}%`);
    flash.classList.remove("is-active");
    void flash.offsetWidth;
    flash.classList.add("is-active");

    const row = stoneElement.closest(".sigma-live-row");
    if(row){
      row.classList.remove("white-row-flash");
      void row.offsetWidth;
      row.classList.add("white-row-flash");
      setTimeout(()=>row.classList.remove("white-row-flash"),1300);
    }

    const palette = [
      [255,255,255],
      [255,225,145],
      [255,190,50],
      [255,245,214]
    ];
    const particles = Array.from({length:110},(_,index)=>{
      const angle = Math.random()*Math.PI*2;
      const speed = 150 + Math.random()*520;
      const reachBoost = index < 30 ? 1.55 : 1;
      return {
        x:originX,
        y:originY,
        vx:Math.cos(angle)*speed*reachBoost,
        vy:Math.sin(angle)*speed*reachBoost - (40+Math.random()*130),
        gravity:70+Math.random()*120,
        drag:.975+Math.random()*.012,
        size:1.5+Math.random()*4.8,
        life:1,
        decay:.22+Math.random()*.2,
        color:palette[Math.floor(Math.random()*palette.length)],
        twinkle:Math.random()*Math.PI*2,
        streak:Math.random()>.7
      };
    });

    const started = performance.now();
    const duration = 3000;

    function frame(now){
      const dt = Math.min((now-(frame.last||now))/1000,.032);
      frame.last = now;
      ctx.clearRect(0,0,width,height);
      ctx.globalCompositeOperation = "lighter";

      let alive = false;
      for(const p of particles){
        if(p.life<=0) continue;
        alive = true;
        p.vx*=Math.pow(p.drag,dt*60);
        p.vy*=Math.pow(p.drag,dt*60);
        p.vy+=p.gravity*dt;
        p.x+=p.vx*dt;
        p.y+=p.vy*dt;
        p.life-=p.decay*dt;
        p.twinkle+=dt*9;

        const alpha=Math.max(0,p.life)*(.7+.3*Math.sin(p.twinkle));
        const [r,g,b]=p.color;
        ctx.strokeStyle=`rgba(${r},${g},${b},${alpha})`;
        ctx.fillStyle=`rgba(${r},${g},${b},${alpha})`;
        ctx.shadowColor=`rgba(${r},${g},${b},${alpha})`;
        ctx.shadowBlur=10;

        if(p.streak){
          ctx.lineWidth=Math.max(1,p.size*.55);
          ctx.beginPath();
          ctx.moveTo(p.x,p.y);
          ctx.lineTo(p.x-p.vx*.025,p.y-p.vy*.025);
          ctx.stroke();
        }else{
          ctx.beginPath();
          ctx.arc(p.x,p.y,p.size*Math.max(.35,p.life),0,Math.PI*2);
          ctx.fill();
        }
      }

      if(now-started<duration && alive){
        requestAnimationFrame(frame);
      }else{
        ctx.clearRect(0,0,width,height);
      }
    }
    requestAnimationFrame(frame);
  }

  function triggerWhiteCelebrationById(roundId){
    if(!roundId) return;
    requestAnimationFrame(()=>{
      const candidates=[...document.querySelectorAll('.sigma-stone.white-new, .sigma-stone.is-white.is-new, .sigma-stone[data-color="0"].stone-new, .sigma-stone[data-color="0"].is-new')];
      const stone=candidates[0] || [...document.querySelectorAll('.sigma-stone[data-color="0"], .sigma-stone.is-white')][0];
      if(stone) celebrateWhiteStone(stone);
    });
  }


  function applyDistributionBars(){
    const map=[
      [".sigma-hour-item.is-red", "red"],
      [".sigma-hour-item.is-black", "black"],
      [".sigma-hour-item.is-white", "white"]
    ];
    for(const [selector] of map){
      const item=document.querySelector(selector);
      if(!item || item.querySelector(".sigma-hour-bar")) continue;
      const text=item.textContent || "";
      const match=text.match(/(\d+(?:[.,]\d+)?)\s*%/);
      const pct=match ? Math.max(0,Math.min(100,Number(match[1].replace(",",".")))) : 0;
      const bar=document.createElement("div");
      bar.className="sigma-hour-bar";
      bar.innerHTML=`<span style="--pct:${pct}%"></span>`;
      item.appendChild(bar);
    }
  }
  const sigmaVisualObserver=new MutationObserver(()=>applyDistributionBars());
  document.addEventListener("DOMContentLoaded",()=>{
    applyDistributionBars();
    sigmaVisualObserver.observe(document.body,{subtree:true,childList:true,characterData:true});
  });

})();
