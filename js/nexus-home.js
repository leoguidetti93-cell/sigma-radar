(function(){
const TZ='America/Sao_Paulo',$=id=>document.getElementById(id);
const API='https://sigma-live-server.onrender.com/api/nexus/home-state';
const fmtIso=iso=>iso?new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(iso)):'—';
let lastState=null,loading=false;
function paint(state){
  if(!state||!state.ready)return;
  lastState=state;
  const entry=$('nhNextEntry');
  if(entry){entry.textContent=state.nextEntry?fmtIso(state.nextEntry):'AGUARDAR';entry.classList.toggle('is-wait',!state.nextEntry)}
  const root=$('nhWindows');
  if(root){root.innerHTML=(state.windows||[]).slice(0,2).map((x,i)=>`<article><span>0${i+1}</span><strong>${fmtIso(x.start)} – ${fmtIso(x.end)}</strong></article>`).join('')}
  [['nhMoment10','moment10'],['nhMoment20','moment20']].forEach(([id,key])=>{const el=$(id);if(el){const v=state[key]||'ATENÇÃO';el.textContent=v;el.dataset.state=v}});
}
async function refresh(){
  if(loading)return;loading=true;
  try{const r=await fetch(`${API}?_=${Date.now()}`,{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);paint(await r.json())}
  catch(e){console.warn('SIGMA NEXUS: home-state indisponível; mantendo última leitura.',e)}
  finally{loading=false}
}
// Estado da HOME vem pronto do Render. Nova rodada dispara atualização imediata; polling é redundância.
window.addEventListener('sigma:live-round',refresh);
window.addEventListener('sigma:memory-reconciled',refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
refresh();setInterval(refresh,10000);
})();
