/* SIGMA ORION 4.1 — projeção COLOR 20 sinais + WHITE automático em 6 casas */
(() => {
  'use strict';
  const COLOR_LIST_KEY = 'sigma_reading_color_projection_v1';
  const WHITE_KEY = 'sigma_reading_white_auto_v1';
  const HISTORY_LIMIT = 20;
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
  function projectNextWhite(rounds){
    const {gaps,since}=whiteGaps(rounds);
    if(gaps.length<5)return null;
    const recent=gaps.slice(-30);
    const weighted=recent.reduce((sum,g,i)=>sum+g*(i+1),0)/recent.reduce((sum,_,i)=>sum+i+1,0);
    const med=median(recent);
    const expected=Math.round(weighted*.65+med*.35);
    const roundsUntil=clamp(expected-since,2,40);
    const minutesUntil=Math.max(1,Math.ceil(roundsUntil/2));
    const target=new Date(); target.setSeconds(0,0); target.setMinutes(target.getMinutes()+minutesUntil);
    const mean=recent.reduce((a,b)=>a+b,0)/recent.length;
    const variance=recent.reduce((a,b)=>a+(b-mean)**2,0)/recent.length;
    const score=clamp(Math.round(88-Math.sqrt(variance)*2-Math.abs(weighted-med)),55,91);
    return {id:`white-${Date.now()}`,targetAt:target.toISOString(),createdAt:new Date().toISOString(),score,expectedGap:expected,sinceAtProjection:since,status:'WAITING',anchorKey:roundKey(rounds.at(-1))};
  }
  function loadWhite(){
    const st=safeLoad(WHITE_KEY,{active:null,history:[]});
    st.history=Array.isArray(st.history)?st.history.slice(0,HISTORY_LIMIT):[];
    return st;
  }
  function settleAndRenew(state,rounds){
    const active=state.active; if(!active)return false;
    const targetMs=new Date(active.targetAt).getTime(); if(Date.now()<targetMs)return false;
    const candidates=rounds.filter(r=>new Date(r.createdAt).getTime()>=targetMs).slice(0,6);
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
    if(!state.active){ const next=projectNextWhite(rounds); if(next){state.active=next;save(WHITE_KEY,state);} }
    return state;
  }
  function renderWhite(){
    const rounds=getRounds(), state=ensureWhite(rounds), active=state.active;
    if(active){
      const targetMs=new Date(active.targetAt).getTime();
      const candidates=Date.now()>=targetMs?rounds.filter(r=>new Date(r.createdAt).getTime()>=targetMs).slice(0,6):[];
      $('readingWhiteAutoTime').textContent=fmtTime(active.targetAt);
      $('readingWhiteAutoScore').textContent=active.score;
      $('readingWhiteAutoProgress').textContent=`${candidates.length} / 6`;
      $('readingWhiteAutoDetail').textContent=Date.now()<targetMs?`Aguardando o horário • intervalo estimado ${active.expectedGap} rodadas`:`Operação ativa • procurando o primeiro branco`;
      const status=$('readingWhiteAutoStatus'); status.textContent=Date.now()<targetMs?'AGUARDANDO':'EM OPERAÇÃO';status.className=`reading-grade ${Date.now()<targetMs?'attention':'strong'}`;
    }else{
      $('readingWhiteAutoTime').textContent='—';$('readingWhiteAutoScore').textContent='—';$('readingWhiteAutoProgress').textContent='0 / 6';
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
