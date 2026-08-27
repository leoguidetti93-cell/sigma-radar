(function(){
'use strict';
const TZ='America/Sao_Paulo',$=id=>document.getElementById(id);
const API=(window.SIGMA_LIVE_SERVER_URL||'https://sigma-live-server.onrender.com').replace(/\/$/,'')+'/api/nexus/home-state';
const fmtIso=iso=>iso?new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(iso)):'—';
let loading=false,lastState=null;

function paint(state){
  if(!state||!state.ready)return false;
  lastState=state;
  const entry=$('nhNextEntry');
  if(entry){entry.textContent=state.nextEntry?fmtIso(state.nextEntry):'AGUARDAR';entry.classList.toggle('is-wait',!state.nextEntry)}
  const hist=$('nhSuggestionHistory');
  if(hist){
    const items=(state.suggestionHistory||[]).slice(0,3);
    hist.innerHTML=items.length?items.map(x=>{const paid=Boolean(x.paid),label=paid?(Number(x.whiteCount)>1?`PAGO • ${Number(x.whiteCount)} BRANCOS`:'PAGO'):'NÃO PAGOU';return `<article class="${paid?'is-paid':'is-loss'}"><b>${fmtIso(x.target)}</b><em>${label}</em></article>`}).join(''):'<article><b>—</b><em>AGUARDANDO HISTÓRICO</em></article>';
  }
  const root=$('nhWindows');
  if(root){
    const list=(state.windows||[]).slice(0,2);
    root.innerHTML=list.length?list.map((x,i)=>`<article><span>0${i+1}</span><strong>${fmtIso(x.start)} – ${fmtIso(x.end)}</strong></article>`).join(''):'<article><span>01</span><strong>—</strong></article><article><span>02</span><strong>—</strong></article>';
  }
  const wh=$('nhWindowHistory');
  if(wh){
    const items=(state.windowHistory||[]).slice(0,4);
    wh.innerHTML=items.length?items.map(x=>{const inside=Number(x.insideCount||0),border=Number(x.borderCount||0);let label=inside>0?`PAGOU${inside>1?` • ${inside} BRANCOS`:''}`:(border>0?'BRANCO NA BORDA':'NÃO PAGOU');if(inside>0&&border>0)label+=` • +${border} BORDA`;const cls=inside>0?'is-paid':(border>0?'is-border':'is-loss');return `<article class="${cls}"><b>${fmtIso(x.start)}–${fmtIso(x.end)}</b><em>${label}</em></article>`}).join(''):'<small>AGUARDANDO HISTÓRICO</small>';
  }
  [['nhMoment10','moment10'],['nhMoment20','moment20']].forEach(([id,key])=>{const el=$(id);if(!el)return;const v=state[key]||'ATENÇÃO';el.textContent=v;el.dataset.state=v});
  return true;
}

function showServerWaiting(){
  if(lastState)return;
  const entry=$('nhNextEntry');
  if(entry){entry.textContent='SINCRONIZANDO';entry.classList.add('is-wait')}
}

async function refresh(){
  if(loading)return;
  loading=true;
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),6500);
  try{
    const r=await fetch(`${API}?_=${Date.now()}`,{cache:'no-store',signal:controller.signal});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const state=await r.json();
    if(state?.ready)paint(state);else showServerWaiting();
  }catch(e){
    console.warn('SIGMA NEXUS HOME: aguardando estado oficial do servidor 24h.',e);
    showServerWaiting();
  }finally{clearTimeout(timeout);loading=false}
}

window.addEventListener('sigma:live-round',refresh);
window.addEventListener('sigma:memory-reconciled',refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
refresh();
setInterval(refresh,5000);
})();
