(function(){
'use strict';
const TZ='America/Sao_Paulo',$=id=>document.getElementById(id);
const API='https://sigma-live-server.onrender.com/api/nexus/home-state';
const fmtIso=iso=>iso?new Intl.DateTimeFormat('pt-BR',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(iso)):'—';
let lastState=null,loading=false;
const LOCAL_STATE_KEY='sigma:nexus-home:virtual-suggestion:v1';

function paint(state){
  if(!state||!state.ready)return false;
  lastState=state;
  const entry=$('nhNextEntry');
  if(entry){
    entry.textContent=state.nextEntry?fmtIso(state.nextEntry):'AGUARDAR';
    entry.classList.toggle('is-wait',!state.nextEntry);
  }
  const hist=$('nhSuggestionHistory');
  if(hist){
    const items=(state.suggestionHistory||state.history||[]).slice(0,3);
    hist.innerHTML=items.length
      ? items.map(x=>{const paid=Boolean(x.paid),label=paid?(Number(x.whiteCount)>1?`PAGO • ${Number(x.whiteCount)} BRANCOS`:'PAGO'):'NÃO PAGOU';return `<article class="${paid?'is-paid':'is-loss'}"><b>${fmtIso(x.target)}</b><em>${label}</em></article>`}).join('')
      : '<article><b>—</b><em>AGUARDANDO HISTÓRICO</em></article>';
  }
  const root=$('nhWindows');
  if(root){
    const list=(state.windows||[]).slice(0,2);
    root.innerHTML=list.length
      ? list.map((x,i)=>`<article><span>0${i+1}</span><strong>${fmtIso(x.start)} – ${fmtIso(x.end)}</strong></article>`).join('')
      : '<article><span>01</span><strong>—</strong></article><article><span>02</span><strong>—</strong></article>';
  }
  const wh=$('nhWindowHistory');
  if(wh){
    const items=(state.windowHistory||[]).slice(0,4);
    wh.innerHTML=items.length?items.map(x=>{
      const inside=Number(x.insideCount||0),border=Number(x.borderCount||0);
      let label=inside>0?`PAGOU${inside>1?` • ${inside} BRANCOS`:''}`:(border>0?'BRANCO NA BORDA':'NÃO PAGOU');
      if(inside>0&&border>0)label+=` • +${border} BORDA`;
      const cls=inside>0?'is-paid':(border>0?'is-border':'is-loss');
      return `<article class="${cls}"><b>${fmtIso(x.start)}–${fmtIso(x.end)}</b><em>${label}</em></article>`;
    }).join(''):'<small>AGUARDANDO HISTÓRICO</small>';
  }
  [['nhMoment10','moment10'],['nhMoment20','moment20']].forEach(([id,key])=>{
    const el=$(id);if(!el)return;
    const v=state[key]||'ATENÇÃO';el.textContent=v;el.dataset.state=v;
  });
  return true;
}

// ---------------- FALLBACK LOCAL ----------------
// A HOME prefere o estado pré-calculado pelo Render. Se esse endpoint estiver
// indisponível / ainda não estiver pronto, usa a mesma memória global de 3.000
// rodadas que já alimenta Catalogador e Estatísticas.
const rn=r=>Number(r?.roll ?? r?.number ?? r?.value ?? r?.result);
const isWhite=r=>rn(r)===0 || r?.color==='white' || Number(r?.color)===0;
const rdate=r=>new Date(r?.createdAt || r?.created_at || r?.timestamp || r?.time || 0);
const addMin=(d,m)=>new Date(d.getTime()+m*60000);
const median=a=>{if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y),m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2};
function parts(d){
  if(!(d instanceof Date)||Number.isNaN(d.getTime()))return null;
  return Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:TZ,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(d).map(x=>[x.type,x.value]));
}
function localRounds(){
  const src=window.SIGMA_LIVE_ENGINE?.rounds;
  if(!Array.isArray(src))return [];
  const arr=src.filter(r=>!Number.isNaN(rdate(r).getTime())).slice(-3000);
  if(arr.length<2)return arr;
  return rdate(arr[0])<=rdate(arr[arr.length-1])?arr:arr.slice().reverse();
}
function whiteStats(rounds){
  const wi=[];rounds.forEach((r,i)=>{if(isWhite(r))wi.push(i)});
  const gaps=[];for(let i=1;i<wi.length;i++)gaps.push(wi[i]-wi[i-1]);
  const recent=gaps.slice(-30);
  return {wi,gaps,since:wi.length?rounds.length-1-wi[wi.length-1]:rounds.length,avg:recent.length?recent.reduce((a,b)=>a+b,0)/recent.length:0,median:median(recent)};
}
function regime(rounds){
  const base=rounds.filter(isWhite).length/Math.max(rounds.length,1);
  const recent=rounds.slice(-60).filter(isWhite).length;
  const expected=60*base;
  return recent>=expected*1.35?'PIPOCANDO':recent<=expected*.65?'RECUPERAÇÃO':'NORMAL';
}
function minuteModel(rounds){
  const a=Array.from({length:60},()=>({w:0,t:0}));
  rounds.forEach(r=>{const p=parts(rdate(r));if(!p)return;const m=+p.minute;a[m].t++;if(isWhite(r))a[m].w++});
  return a;
}
function candidateList(rounds,now){
  const out=[],st=whiteStats(rounds),model=minuteModel(rounds),base=rounds.filter(isWhite).length/Math.max(rounds.length,1);
  const push=(time,source,weight=1)=>{
    if(!(time instanceof Date)||Number.isNaN(time.getTime())||time<=now||time-now>45*60000)return;
    const p=parts(time),m=p?+p.minute:0,mm=model[m],rate=mm.t?mm.w/mm.t:base;
    out.push({time,source,weight,rate});
  };
  let zeroGroup=[];
  for(let i=rounds.length-1;i>=0;i--){
    const p=parts(rdate(rounds[i]));if(!p)continue;
    if((+p.minute)%10===0){
      const key=`${p.hour}:${p.minute}`;
      if(!zeroGroup.length||zeroGroup[0].key===key){zeroGroup.push({key,r:rounds[i]});if(zeroGroup.length===2)break}
      else if(zeroGroup.length)break;
    }
  }
  zeroGroup.forEach(x=>{const stone=rn(x.r);if(stone>0&&stone<=14){const t=rdate(x.r);push(addMin(t,stone),'PEDRA_0_MIN',1.1);push(addMin(t,stone/2),'PEDRA_0_RODADAS',1.0)}});
  let lastW=-1;for(let i=rounds.length-1;i>=0;i--){if(isWhite(rounds[i])){lastW=i;break}}
  if(lastW>0){
    const stone=rn(rounds[lastW-1]),wtime=rdate(rounds[lastW]);
    if(stone>0&&stone<=14){push(addMin(wtime,stone),'PEDRA_ANTES_BRANCO',1.25);push(addMin(wtime,stone/2),'PEDRA_ANTES_BRANCO_RODADAS',1.05)}
  }
  if(lastW>=0){const wtime=rdate(rounds[lastW]);if(st.avg)push(addMin(wtime,st.avg/2),'MEDIA_INTERVALO',1);if(st.median)push(addMin(wtime,st.median/2),'MEDIANA_INTERVALO',1)}
  return out;
}
function localInWindowTolerance(time,w){
  if(!w?.start||!w?.end)return false;
  const s=new Date(w.start),e=new Date(w.end);
  return time>=addMin(s,-2)&&time<=addMin(e,1);
}
function nextEntry(rounds,now,lockedWindows=[],moment='ATENÇÃO'){
  const rg=regime(rounds);if(rg==='RECUPERAÇÃO'||moment==='RECUPERAÇÃO')return null;
  const cs=candidateList(rounds,now).filter(c=>lockedWindows.some(w=>localInWindowTolerance(c.time,w)));if(!cs.length)return null;
  const groups=[];
  cs.forEach(c=>{let g=groups.find(x=>Math.abs(x.time-c.time)<=90000);if(!g){g={time:c.time,items:[]};groups.push(g)}g.items.push(c)});
  groups.forEach(g=>{
    g.time=new Date(g.items.reduce((a,x)=>a+x.time.getTime(),0)/g.items.length);
    const conv=g.items.reduce((a,x)=>a+x.weight,0),rate=Math.max(...g.items.map(x=>x.rate));
    const inside=lockedWindows.some(w=>{const s=new Date(w.start),e=new Date(w.end);return g.time>=s&&g.time<=e});
    g.score=conv*1.6+rate*10+(rg==='PIPOCANDO'?1.1:0)+(inside?0.8:0.25);
  });
  groups.sort((a,b)=>b.score-a.score||a.time-b.time);
  const best=groups[0],threshold=moment==='ATENÇÃO'?2.75:2.15;return best&&best.score>=threshold?best.time:null;
}
function windows(rounds,now){
  const model=minuteModel(rounds),base=rounds.filter(isWhite).length/Math.max(rounds.length,1),cand=[];
  for(let start=1;start<=40;start++){
    const s=addMin(now,start),e=addMin(s,5),rates=[];
    for(let k=0;k<6;k++){const p=parts(addMin(s,k)),m=+p.minute,x=model[m];rates.push(x.t?x.w/x.t:base)}
    cand.push({s,e,score:rates.reduce((a,b)=>a+b,0)/6});
  }
  cand.sort((a,b)=>b.score-a.score||a.s-b.s);
  const chosen=[];
  for(const c of cand){if(chosen.every(x=>Math.abs(c.s-x.s)>=8*60000)){chosen.push(c);if(chosen.length===2)break}}
  return chosen.sort((a,b)=>a.s-b.s);
}
function future(rounds,horizonMin){
  if(rounds.length<500)return 'ATENÇÃO';
  const base=rounds.filter(isWhite).length/rounds.length,target=horizonMin*2;
  const feature=arr=>{const s=whiteStats(arr),w20=arr.slice(-40).filter(isWhite).length,w60=arr.slice(-120).filter(isWhite).length;return[s.since/25,w20/4,w60/8,(s.avg||15)/15,(s.median||11)/11]};
  const cur=feature(rounds),samples=[];
  for(let i=500;i<rounds.length-target;i+=4){const f=feature(rounds.slice(0,i)),dist=f.reduce((a,v,j)=>a+Math.pow(v-cur[j],2),0),fw=rounds.slice(i,i+target).filter(isWhite).length;samples.push({dist,fw})}
  samples.sort((a,b)=>a.dist-b.dist);const near=samples.slice(0,Math.min(80,samples.length));if(!near.length)return 'ATENÇÃO';
  const pred=near.reduce((a,x)=>a+x.fw,0)/near.length,expected=target*base;
  if(pred>=expected*1.25)return 'FAVORÁVEL';if(pred<=expected*.72)return 'RECUPERAÇÃO';return 'ATENÇÃO';
}
function readLocalVirtual(){
  try{
    const raw=JSON.parse(localStorage.getItem(LOCAL_STATE_KEY)||'{}')||{};
    return {
      active: raw.active||null,
      history: Array.isArray(raw.history)?raw.history:[],
      windows: Array.isArray(raw.windows)?raw.windows:[],
      windowHistory: Array.isArray(raw.windowHistory)?raw.windowHistory:[]
    };
  }catch(_e){return {active:null,history:[],windows:[],windowHistory:[]}}
}
function saveLocalVirtual(v){
  try{localStorage.setItem(LOCAL_STATE_KEY,JSON.stringify(v))}catch(_e){}
}
function minuteFloor(d){return new Date(Math.floor(d.getTime()/60000)*60000)}
function makeWindow(c,now){
  return {id:`window-${c.s.getTime()}`,start:c.s.toISOString(),end:c.e.toISOString(),createdAt:now.toISOString(),score:c.score};
}
function settleSuggestion(rounds,now,st){
  if(!st.active?.target)return false;
  const target=minuteFloor(new Date(st.active.target)),start=addMin(target,-1),end=addMin(target,2);
  if(now<end)return false;
  const houses=rounds.filter(r=>{const t=rdate(r);return t>=start&&t<end}).slice(0,6);
  if(houses.length<6&&now<addMin(end,1.5))return false;
  const whiteCount=houses.filter(isWhite).length;
  st.history=[{target:target.toISOString(),paid:whiteCount>0,whiteCount,houses:houses.length,settledAt:now.toISOString()},...(st.history||[])].slice(0,20);
  st.active=null;
  return true;
}
function settleWindows(rounds,now,st){
  let changed=false;
  st.windows=(st.windows||[]).sort((a,b)=>new Date(a.start)-new Date(b.start));
  while(st.windows.length){
    const w=st.windows[0], start=new Date(w.start), end=new Date(w.end), settleAt=addMin(end,1);
    if(now<settleAt)break;
    const inside=rounds.filter(r=>{const t=rdate(r);return t>=start&&t<settleAt&&isWhite(r)});
    const before=rounds.filter(r=>{const t=rdate(r);return t>=addMin(start,-2)&&t<start&&isWhite(r)});
    const after=rounds.filter(r=>{const t=rdate(r);return t>=settleAt&&t<addMin(settleAt,1)&&isWhite(r)});
    st.windowHistory=[{
      id:w.id,start:w.start,end:w.end,settledAt:now.toISOString(),
      paid:inside.length>0,insideCount:inside.length,borderCount:before.length+after.length,
      totalWithBorder:inside.length+before.length+after.length,
      whiteTimes:inside.map(r=>rdate(r).toISOString()),
      borderTimes:[...before,...after].map(r=>rdate(r).toISOString())
    },...(st.windowHistory||[])].slice(0,20);
    st.windows.shift();changed=true;
  }
  return changed;
}
function ensureLockedWindows(rounds,now,st){
  // Regra central: uma janela publicada nunca é recalculada antes de terminar.
  // J1 termina -> é avaliada -> J2 sobe -> só então nasce uma nova J2.
  st.windows=(st.windows||[])
    .filter(w=>w?.start&&w?.end&&addMin(new Date(w.end),1)>now)
    .sort((a,b)=>new Date(a.start)-new Date(b.start))
    .slice(0,2);
  if(st.windows.length>=2)return false;

  const cand=windows(rounds,now);
  let changed=false;
  for(const c of cand){
    if(st.windows.some(w=>Math.abs(c.s-new Date(w.start))<8*60000))continue;
    if(st.windows.length){
      const last=st.windows[st.windows.length-1];
      if(c.s<=addMin(new Date(last.end),1))continue;
    }
    st.windows.push(makeWindow(c,now)); changed=true;
    if(st.windows.length>=2)break;
  }
  st.windows.sort((a,b)=>new Date(a.start)-new Date(b.start));
  return changed;
}
function validSuggestionCandidate(time,lockedWindows){
  return time>new Date() && lockedWindows.some(w=>localInWindowTolerance(time,w));
}
function ensureSuggestion(rounds,now,st,moment10){
  // Uma sugestão já aberta não é trocada até ser concluída.
  if(st.active?.target)return false;
  if(moment10==='RECUPERAÇÃO')return false;
  const entry=nextEntry(rounds,now,st.windows||[],moment10);
  if(!entry)return false;
  const target=minuteFloor(entry);
  if(target<=now || !(st.windows||[]).some(w=>localInWindowTolerance(target,w)))return false;
  st.active={target:target.toISOString(),createdAt:now.toISOString(),windowId:(st.windows.find(w=>localInWindowTolerance(target,w))||{}).id||null};
  return true;
}
function computeLocal(){
  const rounds=localRounds(),now=new Date();
  if(rounds.length<100)return null;

  const st=readLocalVirtual();
  let changed=false;
  changed=settleSuggestion(rounds,now,st)||changed;
  changed=settleWindows(rounds,now,st)||changed;
  changed=ensureLockedWindows(rounds,now,st)||changed;

  const moment10=future(rounds,10),moment20=future(rounds,20);
  changed=ensureSuggestion(rounds,now,st,moment10)||changed;
  if(changed)saveLocalVirtual(st);

  return {
    ready:true,source:'LOCAL_MEMORY_LOCKED',count:rounds.length,updatedAt:now.toISOString(),
    currentRegime:regime(rounds),
    nextEntry:st.active?.target||null,activeSuggestion:st.active||null,
    suggestionHistory:(st.history||[]).slice(0,3),
    windows:(st.windows||[]).slice(0,2).map(w=>({start:w.start,end:w.end,id:w.id})),
    windowHistory:(st.windowHistory||[]).slice(0,4),
    moment10,moment20
  };
}
function paintFallback(){
  const local=computeLocal();
  if(local){paint(local);return true}
  return false;
}
function mirrorServerStateToLocal(state){
  if(!state?.ready)return;
  try{
    const current=readLocalVirtual();
    const serverHistory=Array.isArray(state.suggestionHistory)?state.suggestionHistory:[];
    const serverWindows=Array.isArray(state.windows)?state.windows:[];
    const serverWindowHistory=Array.isArray(state.windowHistory)?state.windowHistory:[];
    saveLocalVirtual({
      active:state.activeSuggestion||null,
      history:serverHistory.length?serverHistory:(current.history||[]),
      windows:serverWindows.length?serverWindows:(current.windows||[]),
      windowHistory:serverWindowHistory.length?serverWindowHistory:(current.windowHistory||[])
    });
  }catch(_e){}
}

async function refresh(){
  if(loading)return;
  loading=true;

  // HOME híbrida: pinta imediatamente com a memória local para nunca congelar.
  // Em paralelo, sincroniza com o estado 24h do Render. Quando o servidor está
  // saudável, ele atualiza a tela e também alimenta o fallback local.
  paintFallback();
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),4500);
  try{
    const r=await fetch(`${API}?_=${Date.now()}`,{cache:'no-store',signal:controller.signal});
    if(r.ok){
      const state=await r.json();
      if(state?.ready){mirrorServerStateToLocal(state);paint(state)}
    }
  }catch(e){
    console.warn('SIGMA NEXUS: usando fallback local enquanto sincroniza o 24h.',e);
  }finally{clearTimeout(timeout);loading=false}
}

window.addEventListener('sigma:live-round',refresh);
window.addEventListener('sigma:memory-reconciled',refresh);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
paintFallback();
refresh();
setInterval(refresh,5000);
})();
