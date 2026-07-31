/* SIGMA ORION 4.1.2 — projeção COLOR + WHITE contínuo com scanner de janela */
(() => {
  'use strict';
  const COLOR_LIST_KEY = 'sigma_reading_color_projection_v1';
  const WHITE_KEY = 'sigma_reading_white_auto_v1';
  const HISTORY_LIMIT = 20;
  const WHITE_MIN_SCORE = 72;
  const WHITE_OBSERVATION_MIN = 60;
  const WHITE_SCAN_MINUTES = 240;
  const $ = id => document.getElementById(id);
  const roundKey = r => String(r?.id ?? r?._id ?? r?.createdAt ?? r?.created_at ?? r?.timestamp ?? '');
  const createdAt = r => r?.createdAt ?? r?.created_at ?? r?.timestamp;
  const normalizeColor = value => {
    if (value === 1 || value === '1' || value === 'red') return 'red';
    if (value === 2 || value === '2' || value === 'black') return 'black';
    if (value === 0 || value === '0' || value === 'white') return 'white';
    return null;
  };
  const getRounds = () => {
    const list = window.SIGMA_LIVE_ENGINE?.rounds;
    return Array.isArray(list) ? list.map(r => ({...r, color: normalizeColor(r.color), createdAt: createdAt(r)})).filter(r => r.color && r.createdAt).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)).slice(-3000) : [];
  };
  const fmtTime = value => {
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  };
  const median = values => { if(!values.length)return 0; const a=[...values].sort((x,y)=>x-y),m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2; };
  const clamp = (n,min,max) => Math.min(max,Math.max(min,n));
  const colorLabel = c => c === 'red' ? 'VERMELHO' : 'PRETO';
  const colorIcon = c => c === 'red' ? '🔴' : '⚫';

  function safeLoad(key, fallback){
    try { return {...fallback, ...(JSON.parse(localStorage.getItem(key)||'{}')||{})}; } catch(_) { return fallback; }
  }
  function save(key,value){ localStorage.setItem(key,JSON.stringify(value)); }

  function transitionModel(rounds){
    const model = new Map();
    for(let len=1;len<=4;len++){
      for(let i=len;i<rounds.length;i++){
        const context=rounds.slice(i-len,i).map(r=>r.color).join('|');
        const next=rounds[i].color;
        const key=`${len}:${context}`;
        if(!model.has(key))model.set(key,{red:0,black:0,white:0,total:0});
        const item=model.get(key); item[next]++; item.total++;
      }
    }
    return model;
  }
  function currentColorReading(rounds, model, offset=0){
    let best=null;
    for(let len=4;len>=1;len--){
      if(rounds.length<len)continue;
      const context=rounds.slice(-len).map(r=>r.color).join('|');
      const item=model.get(`${len}:${context}`);
      if(!item || item.total<5)continue;
      const target=item.red>=item.black?'red':'black';
      const p=(item[target]+item.white)/item.total;
      const score=clamp(Math.round(52+p*42+Math.min(item.total,30)/5-offset),50,94);
      best={target,score,cases:item.total,len}; break;
    }
    if(!best){
      const recent=rounds.slice(-100).reduce((a,r)=>(a[r.color]++,a),{red:0,black:0,white:0});
      best={target:recent.red<=recent.black?'red':'black',score:58,cases:rounds.length,len:1};
    }
    return best;
  }
  function colorIntervals(rounds){
    const whiteIdx=[]; rounds.forEach((r,i)=>{if(r.color==='white')whiteIdx.push(i)});
    const gaps=[]; for(let i=1;i<whiteIdx.length;i++)gaps.push(whiteIdx[i]-whiteIdx[i-1]);
    const base=median(gaps.slice(-30))||14;
    return clamp(Math.round(base/2),4,11);
  }
  function generateColorList(){
    const rounds=getRounds();
    if(rounds.length<50){ alert('Aguarde pelo menos 50 rodadas no Catalogador.'); return; }
    const model=transitionModel(rounds);
    const baseGap=colorIntervals(rounds);
    const start=new Date(); start.setSeconds(0,0);
    const items=[]; let cursor=new Date(start.getTime()+3*60000);
    for(let i=0;i<20;i++){
      const reading=currentColorReading(rounds,model,i%5);
      const variation=((i*7 + reading.cases)%5)-2;
      const gap=clamp(baseGap+variation,4,12);
      if(i>0)cursor=new Date(cursor.getTime()+gap*60000);
      items.push({time:cursor.toISOString(),color:reading.target,score:reading.score,coverage:'WHITE',gale:'G1'});
    }
    const state={generatedAt:new Date().toISOString(),sample:rounds.length,items};
    save(COLOR_LIST_KEY,state); renderColorList(state);
  }
  function colorCopyText(state){
    return ['Σ SIGMA — LISTA COLOR','',...state.items.flatMap(item=>[
      `⏰ ${fmtTime(item.time)}`,
      `${colorIcon(item.color)} ${colorLabel(item.color)}`,
      '⚪ Proteção no branco',
      '🛡 Até G1',''
    ])].join('\n').trim();
  }
  async function copyColorList(){
    const state=safeLoad(COLOR_LIST_KEY,{items:[]});
    if(!state.items?.length)return;
    const text=colorCopyText(state);
    try{ await navigator.clipboard.writeText(text); }
    catch(_){ const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove(); }
    const btn=$('readingCopyColorList'); if(btn){const old=btn.textContent;btn.textContent='Copiado!';setTimeout(()=>btn.textContent=old,1400);}
  }
  function renderColorList(state=safeLoad(COLOR_LIST_KEY,{items:[]})){
    const root=$('readingColorProjectionList'), copy=$('readingCopyColorList'); if(!root)return;
    if(!state.items?.length){root.innerHTML='<div class="analyst-empty">Clique em “Gerar lista” para projetar 20 entradas COLOR com proteção no branco e até G1.</div>';if(copy)copy.disabled=true;return;}
    root.innerHTML=state.items.map((item,i)=>`<div class="reading-color-projection-row"><span>${String(i+1).padStart(2,'0')}</span><strong>${fmtTime(item.time)}</strong><b class="${item.color}">${colorIcon(item.color)} ${colorLabel(item.color)}</b><small>⚪ Branco • G1</small><em>Score ${item.score}</em></div>`).join('');
    if($('readingColorListGenerated'))$('readingColorListGenerated').textContent=`Gerada às ${fmtTime(state.generatedAt)}`;
    if($('readingColorListSample'))$('readingColorListSample').textContent=`Base: ${state.sample||0} rodadas`;
    if(copy)copy.disabled=false;
  }

  function whiteGaps(rounds){
    const idx=[]; rounds.forEach((r,i)=>{if(r.color==='white')idx.push(i)});
    const gaps=[]; for(let i=1;i<idx.length;i++)gaps.push(idx[i]-idx[i-1]);
    return {idx,gaps,since:idx.length?rounds.length-1-idx.at(-1):rounds.length};
  }
  function minuteWhiteModel(rounds){
    const model=Array.from({length:60},()=>({white:0,total:0}));
    rounds.forEach(r=>{
      const d=new Date(r.createdAt); if(Number.isNaN(d.getTime()))return;
      const m=d.getMinutes(); model[m].total++; if(r.color==='white')model[m].white++;
    });
    return model;
  }
  function projectNextWhite(rounds){
    const {gaps,since}=whiteGaps(rounds);
    if(gaps.length<5)return null;
    const recent=gaps.slice(-40);
    const weighted=recent.reduce((sum,g,i)=>sum+g*(i+1),0)/recent.reduce((sum,_,i)=>sum+i+1,0);
    const med=median(recent);
    const expected=Math.round(weighted*.65+med*.35);
    const mean=recent.reduce((a,b)=>a+b,0)/recent.length;
    const variance=recent.reduce((a,b)=>a+(b-mean)**2,0)/recent.length;
    const spread=Math.sqrt(variance);
    const minuteModel=minuteWhiteModel(rounds);
    const recentWhites=rounds.slice(-120).filter(r=>r.color==='white').length;
    const recentDensity=recentWhites/Math.max(1,Math.min(120,rounds.length));
    const now=new Date(); now.setSeconds(0,0);
    let best=null;
    for(let minuteOffset=1; minuteOffset<=WHITE_SCAN_MINUTES; minuteOffset++){
      const target=new Date(now.getTime()+minuteOffset*60000);
      const projectedGap=since + minuteOffset*2;
      const gapDistance=Math.abs(projectedGap-expected);
      const gapScore=clamp(92-gapDistance*3,45,92);
      const minuteStat=minuteModel[target.getMinutes()];
      const minuteRate=minuteStat.total?minuteStat.white/minuteStat.total:0;
      const minuteScore=clamp(Math.round(55+minuteRate*220),50,92);
      const densityScore=clamp(Math.round(70+(recentDensity-.07)*180),55,88);
      const stabilityScore=clamp(Math.round(88-spread*2-Math.abs(weighted-med)),50,90);
      const distancePenalty=Math.min(12,Math.floor(minuteOffset/35));
      const score=clamp(Math.round(gapScore*.42+minuteScore*.28+stabilityScore*.20+densityScore*.10-distancePenalty),50,94);
      const reasons=[
        `Intervalo projetado ${projectedGap} rodadas; referência ${expected}.`,
        minuteStat.total?`Minuto ${String(target.getMinutes()).padStart(2,'0')} teve ${Math.round(minuteRate*100)}% de brancos na amostra.`:'Minuto ainda com pouca recorrência histórica.',
        `Dispersão recente dos intervalos: ${spread.toFixed(1)}.`,
        `${recentWhites} brancos nas últimas ${Math.min(120,rounds.length)} rodadas.`
      ];
      const candidate={id:`white-${Date.now()}-${minuteOffset}`,targetAt:target.toISOString(),createdAt:new Date().toISOString(),score,expectedGap:expected,sinceAtProjection:since,status:'WAITING',classification:score>=WHITE_MIN_SCORE?'ACTIVE':'OBSERVATION',reasons};
      const targetMs=target.getTime();
      candidate.windowStartAt=new Date(targetMs-60000).toISOString();
      candidate.windowEndAt=new Date(targetMs+120000).toISOString();
      if(!best || candidate.score>best.score || (candidate.score===best.score && targetMs<new Date(best.targetAt).getTime())) best=candidate;
    }
    if(best && best.score<WHITE_OBSERVATION_MIN)return null;
    return best;
  }
  function loadWhite(){
    const st=safeLoad(WHITE_KEY,{active:null,history:[]});
    st.history=Array.isArray(st.history)?st.history.slice(0,HISTORY_LIMIT):[];
    return st;
  }
  function settleAndRenew(state,rounds){
    const active=state.active; if(!active)return false;
    const targetMs=new Date(active.targetAt).getTime();
    const windowStartMs=new Date(active.windowStartAt||new Date(targetMs-60000)).getTime();
    const windowEndMs=new Date(active.windowEndAt||new Date(targetMs+120000)).getTime();
    if(Date.now()<windowStartMs)return false;
    const candidates=rounds.filter(r=>{const ms=new Date(r.createdAt).getTime();return ms>=windowStartMs&&ms<windowEndMs;}).slice(0,6);
    const winIndex=candidates.findIndex(r=>r.color==='white');
    if(winIndex>=0){
      state.history.unshift({...active,status:'WIN',result:`WIN CASA ${winIndex+1}`,house:winIndex+1,resolvedAt:candidates[winIndex].createdAt});
      state.active=null;
    }else if(candidates.length>=6){
      state.history.unshift({...active,status:'LOSS',result:'LOSS',house:null,resolvedAt:candidates[5].createdAt});
      state.active=null;
    }else return false;
    state.history=state.history.slice(0,HISTORY_LIMIT);
    const next=projectNextWhite(rounds); if(next)state.active=next;
    save(WHITE_KEY,state); return true;
  }
  function ensureWhite(rounds){
    const state=loadWhite();
    settleAndRenew(state,rounds);
    const candidate=projectNextWhite(rounds);
    if(!state.active){
      if(candidate){state.active=candidate;state.waitingForScore=false;save(WHITE_KEY,state);}
      else {state.waitingForScore=true;save(WHITE_KEY,state);}
      return state;
    }
    const windowStartMs=new Date(state.active.windowStartAt).getTime();
    const frozen=Date.now()>=windowStartMs;
    if(!frozen && candidate){
      const activeStrong=state.active.score>=WHITE_MIN_SCORE;
      const candidateStrong=candidate.score>=WHITE_MIN_SCORE;
      const shouldReplace=(candidateStrong&&!activeStrong) || candidate.score>=state.active.score+3 || new Date(state.active.targetAt).getTime()<=Date.now();
      if(shouldReplace){state.active=candidate;state.waitingForScore=false;save(WHITE_KEY,state);}
    }
    return state;
  }
  function renderWhite(){
    const rounds=getRounds(), state=ensureWhite(rounds), active=state.active;
    if(active){
      const targetMs=new Date(active.targetAt).getTime();
      const windowStartMs=new Date(active.windowStartAt||new Date(targetMs-60000)).getTime();
      const windowEndMs=new Date(active.windowEndAt||new Date(targetMs+120000)).getTime();
      const now=Date.now();
      const candidates=now>=windowStartMs?rounds.filter(r=>{const ms=new Date(r.createdAt).getTime();return ms>=windowStartMs&&ms<windowEndMs;}).slice(0,6):[];
      $('readingWhiteAutoTime').textContent=fmtTime(active.targetAt);
      $('readingWhiteAutoScore').textContent=active.score;
      $('readingWhiteAutoProgress').textContent=`${candidates.length} / 6`;
      const strong=active.score>=WHITE_MIN_SCORE;
      $('readingWhiteAutoDetail').textContent=now<windowStartMs
        ? `Janela ${fmtTime(windowStartMs)} • ${fmtTime(active.targetAt)} • ${fmtTime(new Date(targetMs+60000))}`
        : `Operação ativa • ${candidates.length} casa(s) processada(s)`;
      const status=$('readingWhiteAutoStatus');
      status.textContent=now<windowStartMs?(strong?'SINAL ATIVO':'EM OBSERVAÇÃO'):'EM OPERAÇÃO';
      status.className=`reading-grade ${now<windowStartMs?(strong?'strong':'attention'):'strong'}`;
      const reasons=$('readingWhiteAutoReasons');
      if(reasons)reasons.innerHTML=(active.reasons||[]).map(x=>`<p>✓ ${x}</p>`).join('');
    }else{
      $('readingWhiteAutoTime').textContent='—';$('readingWhiteAutoScore').textContent='—';$('readingWhiteAutoProgress').textContent='0 / 6';
      $('readingWhiteAutoDetail').textContent=state.waitingForScore?'Procurando a melhor janela nas próximas horas.':'Aguardando base suficiente.';
      const status=$('readingWhiteAutoStatus');status.textContent='PROCURANDO';status.className='reading-grade neutral';
      const reasons=$('readingWhiteAutoReasons');if(reasons)reasons.innerHTML='<p>O scanner continua avaliando as próximas 4 horas.</p>';
    }
    const root=$('readingWhiteAutoHistory');
    if(!state.history.length)root.innerHTML='<div class="analyst-empty">Nenhuma projeção finalizada ainda.</div>';
    else root.innerHTML=state.history.map((item,i)=>`<div class="reading-white-auto-row"><span>${String(i+1).padStart(2,'0')}</span><strong>${fmtTime(item.targetAt)}</strong><b class="${item.status==='WIN'?'win':'loss'}">${item.result}</b><small>Score ${item.score} • encerrado ${fmtTime(item.resolvedAt)}</small></div>`).join('');
    const wins=state.history.filter(x=>x.status==='WIN').length;
    if($('readingWhiteAutoAccuracy'))$('readingWhiteAutoAccuracy').textContent=state.history.length?`${Math.round(wins/state.history.length*100)}%`:'—';
  }
  function clearWhite(){ save(WHITE_KEY,{active:null,history:[]}); renderWhite(); }
  function init(){
    $('readingGenerateColorList')?.addEventListener('click',generateColorList);
    $('readingCopyColorList')?.addEventListener('click',copyColorList);
    $('readingClearWhiteAuto')?.addEventListener('click',clearWhite);
    renderColorList(); renderWhite();
    window.addEventListener('sigma:live-round',()=>setTimeout(renderWhite,30));
    setInterval(renderWhite,5000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
  window.SIGMA_PROJECTIONS={generateColorList,copyColorList,refreshWhite:renderWhite};
})();
