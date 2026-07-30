/* SIGMA LEITURA 1.1 — leitura + histórico automático das últimas 20 sugestões */
(() => {
  'use strict';
  let started = false;
  const HISTORY_KEY = 'sigma_reading_suggestions_v1';
  const HISTORY_LIMIT = 20;
  let lastRenderedRoundKey = null;
  const $ = id => document.getElementById(id);
  const pct = (n,d) => d ? Math.round(n/d*100) : 0;
  const median = values => { if(!values.length)return 0; const a=[...values].sort((x,y)=>x-y),m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2; };
  const colorName = c => c==='red'?'VERMELHO':c==='black'?'PRETO':'BRANCO';
  const colorShort = c => c==='red'?'V':c==='black'?'P':'B';


  const roundKey = r => String(r?.id ?? r?._id ?? r?.createdAt ?? r?.timestamp ?? '');
  function loadTracker(){
    try{
      const parsed=JSON.parse(localStorage.getItem(HISTORY_KEY)||'{}');
      return {pending:parsed.pending||null,history:Array.isArray(parsed.history)?parsed.history.slice(0,HISTORY_LIMIT):[]};
    }catch(_){ return {pending:null,history:[]}; }
  }
  function saveTracker(state){
    state.history=(state.history||[]).slice(0,HISTORY_LIMIT);
    localStorage.setItem(HISTORY_KEY,JSON.stringify(state));
  }
  function formatRoundTime(value){
    if(!value)return '—';
    const d=new Date(value); return Number.isNaN(d.getTime())?'—':d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }
  function classifySuggestionResult(pending,rounds){
    if(!pending)return null;
    let anchor=rounds.findIndex(r=>roundKey(r)===pending.anchorKey);
    if(anchor<0){
      const t=new Date(pending.anchorAt).getTime();
      anchor=rounds.findIndex(r=>new Date(r.createdAt).getTime()>=t);
    }
    if(anchor<0)return null;
    const after=rounds.slice(anchor+1);
    if(!after.length)return null;
    const first=after[0]?.color;
    if(first===pending.target)return {result:'WIN DIRETA',resultClass:'direct',resolvedRound:after[0]};
    if(first==='white')return {result:'WIN BRANCO',resultClass:'white',resolvedRound:after[0]};
    if(after.length<2)return null;
    const second=after[1]?.color;
    if(second===pending.target)return {result:'WIN G1',resultClass:'g1',resolvedRound:after[1]};
    if(second==='white')return {result:'WIN BRANCO',resultClass:'white',resolvedRound:after[1]};
    return {result:'LOSS',resultClass:'loss',resolvedRound:after[1]};
  }
  function settlePending(rounds){
    const state=loadTracker();
    const settled=classifySuggestionResult(state.pending,rounds);
    if(!settled)return state;
    state.history.unshift({
      ...state.pending,
      result:settled.result,
      resultClass:settled.resultClass,
      resolvedAt:settled.resolvedRound?.createdAt||new Date().toISOString(),
      resolvedColor:settled.resolvedRound?.color||null
    });
    state.history=state.history.slice(0,HISTORY_LIMIT);
    state.pending=null;
    saveTracker(state);
    return state;
  }
  function registerSuggestion(rounds,entry,score,grade,pattern){
    if(!entry||!rounds.length)return loadTracker();
    const state=loadTracker();
    if(state.pending)return state;
    const anchor=rounds.at(-1);
    state.pending={
      id:`reading-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      target:entry,
      score:Number(score)||0,
      grade:grade||'NEUTRO',
      pattern:pattern?pattern.pattern.map(colorShort).join(' • '):'LEITURA DINÂMICA',
      anchorKey:roundKey(anchor),
      anchorAt:anchor.createdAt||new Date().toISOString(),
      createdAt:new Date().toISOString()
    };
    saveTracker(state);
    return state;
  }
  function renderSuggestionHistory(){
    const state=loadTracker(), root=$('readingSuggestionHistory'), pending=$('readingPendingSuggestion');
    if(pending){
      if(state.pending){
        pending.innerHTML=`<span class="reading-history-entry ${state.pending.target}">${colorName(state.pending.target)}</span><div><strong>Entrada em acompanhamento</strong><small>Gerada às ${formatRoundTime(state.pending.createdAt)} • score ${state.pending.score} • até G1 + branco</small></div><b>AGUARDANDO</b>`;
        pending.hidden=false;
      }else pending.hidden=true;
    }
    if(!root)return;
    if(!state.history.length){root.innerHTML='<div class="analyst-empty">Nenhuma entrada finalizada ainda.</div>';return;}
    root.innerHTML=state.history.map((item,index)=>`<div class="reading-history-row">
      <span class="reading-history-index">${String(index+1).padStart(2,'0')}</span>
      <span class="reading-history-entry ${item.target}">${colorName(item.target)}</span>
      <div class="reading-history-info"><strong>${item.pattern||'LEITURA DINÂMICA'}</strong><small>${formatRoundTime(item.createdAt)} • score ${item.score} • resultado ${formatRoundTime(item.resolvedAt)}</small></div>
      <span class="reading-history-result ${item.resultClass||''}">${item.result}</span>
    </div>`).join('');
    const total=state.history.length,wins=state.history.filter(x=>x.result!=='LOSS').length;
    if($('readingHistoryCount'))$('readingHistoryCount').textContent=`${total} / ${HISTORY_LIMIT}`;
    if($('readingHistoryAccuracy'))$('readingHistoryAccuracy').textContent=total?`${pct(wins,total)}%`:'—';
  }

  function getRounds(){
    const list = window.SIGMA_LIVE_ENGINE?.rounds;
    return Array.isArray(list) ? list.slice().sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)) : [];
  }
  function dist(rounds,n){
    const a=rounds.slice(-Math.min(n,rounds.length)), d={red:0,black:0,white:0,total:a.length};
    a.forEach(r=>d[r.color]=(d[r.color]||0)+1); return d;
  }
  function renderDist(rounds,n,id){
    const d=dist(rounds,n), root=$(id), label=$('readingDominant'+(n===1000?'1000':n)); if(!root)return;
    const pr=pct(d.red,d.total),pb=pct(d.black,d.total),pw=pct(d.white,d.total);
    root.innerHTML=`<i class="red" style="width:${pr}%"></i><i class="black" style="width:${pb}%"></i><i class="white" style="width:${pw}%"></i>`+
      `</div><div class="reading-bar-labels"><span>V ${pr}%</span><span>P ${pb}%</span><span>B ${pw}%</span>`;
    const diff=Math.abs(pr-pb); const dominant=pr===pb?'EQUILÍBRIO':pr>pb?'VERMELHO':'PRETO';
    if(label) label.textContent=d.total?`${dominant} • diferença ${diff} pts`:'SEM DADOS';
  }
  function currentStreak(rounds){
    if(!rounds.length)return {color:null,count:0}; const c=rounds.at(-1).color; let count=0;
    for(let i=rounds.length-1;i>=0 && rounds[i].color===c;i--)count++; return {color:c,count};
  }
  function whiteStats(rounds){
    const indexes=[]; rounds.forEach((r,i)=>{if(r.color==='white')indexes.push(i)});
    const gaps=[]; for(let i=1;i<indexes.length;i++)gaps.push(indexes[i]-indexes[i-1]);
    const since=indexes.length?rounds.length-1-indexes.at(-1):rounds.length;
    return {since,gaps,avg:gaps.length?gaps.reduce((a,b)=>a+b,0)/gaps.length:0,med:median(gaps),max:gaps.length?Math.max(...gaps):0,count:indexes.length};
  }
  function testPattern(rounds,pattern,target){
    let direct=0,g1=0,white=0,loss=0,cases=0;
    const len=pattern.length;
    for(let i=len-1;i<rounds.length-2;i++){
      const seq=rounds.slice(i-len+1,i+1).map(r=>r.color);
      if(!seq.every((c,j)=>c===pattern[j]))continue;
      cases++; const a=rounds[i+1].color,b=rounds[i+2].color;
      if(a===target)direct++; else if(a==='white')white++; else if(b===target)g1++; else if(b==='white')white++; else loss++;
    }
    return {cases,direct,g1,white,loss,success:cases?pct(direct+g1+white,cases):0};
  }
  function choosePattern(rounds){
    const nonWhite=rounds.filter(r=>r.color!=='white');
    if(nonWhite.length<3)return null;
    const lengths=[4,3,2]; let best=null;
    for(const len of lengths){
      const pattern=nonWhite.slice(-len).map(r=>r.color);
      for(const target of ['red','black']){
        const t=testPattern(rounds,pattern,target);
        if(t.cases>=5 && (!best || t.success>best.success || (t.success===best.success&&t.cases>best.cases)))best={...t,pattern,target};
      }
      if(best&&best.cases>=10)break;
    }
    return best;
  }
  function transitions(rounds){
    const pairs={};
    for(let i=0;i<rounds.length-1;i++){
      const key=rounds[i].color; pairs[key] ||= {red:0,black:0,white:0,total:0}; pairs[key][rounds[i+1].color]++; pairs[key].total++;
    }
    return pairs;
  }
  function render(force=false){
    const rounds=getRounds(); const latest=rounds.at(-1);
    settlePending(rounds);
    if($('readingSampleCount'))$('readingSampleCount').textContent=`${rounds.length} / 1000`;
    if($('readingLatestTime'))$('readingLatestTime').textContent=latest?new Date(latest.createdAt).toLocaleTimeString('pt-BR'):'—';
    if($('readingUpdatedAt'))$('readingUpdatedAt').textContent=new Date().toLocaleTimeString('pt-BR');
    const status=$('readingStatus'); if(status){status.textContent=rounds.length?'CONECTADO':'SINCRONIZANDO';status.className=`status-pill sigma-reading-status ${rounds.length?'online':'connecting'}`;}
    [20,50,100,1000].forEach(n=>renderDist(rounds,n,'readingBars'+n));
    if(!rounds.length){renderSuggestionHistory();return;}

    const ws=whiteStats(rounds), streak=currentStreak(rounds), recent=dist(rounds,50), pattern=choosePattern(rounds);
    $('readingSinceWhite').textContent=ws.since; $('readingWhiteAverage').textContent=ws.avg?ws.avg.toFixed(1):'—'; $('readingWhiteMedian').textContent=ws.med||'—'; $('readingWhiteMax').textContent=ws.max||'—';
    const ratio=ws.avg?ws.since/ws.avg:0; $('readingWhiteProgress').style.width=Math.min(100,ratio*70)+'%';
    let whiteState='NORMAL',whiteText='O intervalo atual está dentro da faixa média observada.';
    if(ws.gaps.length<3){whiteState='AMOSTRA CURTA';whiteText='Ainda são necessários mais brancos para uma leitura de intervalo consistente.';}
    else if(ratio>=1.35){whiteState='ACIMA DA MÉDIA';whiteText=`O intervalo atual está ${Math.round((ratio-1)*100)}% acima da média da amostra.`;}
    else if(ratio>=.9){whiteState='ZONA DE ATENÇÃO';whiteText='O intervalo atual se aproxima ou supera a média observada.';}
    $('readingWhiteState').textContent=whiteState;$('readingWhiteText').textContent=whiteText;

    const redP=pct(recent.red,recent.total),blackP=pct(recent.black,recent.total); const dominant=redP>blackP?'red':blackP>redP?'black':null;
    const reversal=streak.color==='red'?'black':streak.color==='black'?'red':dominant;
    const entry=pattern?.target || reversal || dominant;
    let score=45;
    if(pattern) score=Math.round(pattern.success*.65 + Math.min(100,pattern.cases*3)*.20 + Math.min(100,Math.abs(redP-blackP)*4)*.15);
    if(streak.count>=3)score=Math.min(96,score+5); if(ws.avg&&ratio>=.9)score=Math.min(96,score+3);
    let grade='NEUTRO',cls='neutral'; if(score>=78){grade='FORTE';cls='strong'}else if(score>=62){grade='ATENÇÃO';cls='attention'}else if(score<45){grade='EVITAR';cls='avoid'};
    $('readingScore').textContent=score;$('readingScoreRing').style.setProperty('--score',score);$('readingEntry').textContent=entry?colorName(entry):'—';$('readingDecision').textContent=entry?`ENTRADA NO ${colorName(entry)}`:'SEM DIREÇÃO';$('readingGrade').textContent=grade;$('readingGrade').className=`reading-grade ${cls}`;
    const reasons=[];
    if(streak.color)reasons.push(`Sequência atual: ${streak.count} ${colorName(streak.color).toLowerCase()}${streak.count>1?'s':''}.`);
    reasons.push(`Últimas 50: vermelho ${redP}%, preto ${blackP}% e branco ${pct(recent.white,recent.total)}%.`);
    if(pattern)reasons.push(`${pattern.cases} ocorrências semelhantes, com ${pattern.success}% de acerto até G1 ou branco.`);
    if(ws.avg)reasons.push(`Branco há ${ws.since} rodadas; média observada ${ws.avg.toFixed(1)}.`);
    $('readingReasons').innerHTML=reasons.map(x=>`<p>${x}</p>`).join('');

    if(pattern){
      const name=pattern.pattern.map(colorShort).join(' • '); $('readingPatternName').textContent=name+` → ${colorName(pattern.target)}`;$('readingPatternOccurrences').textContent=`${pattern.cases} casos`;
      $('readingDirectWin').textContent=pct(pattern.direct,pattern.cases)+'%';$('readingG1Win').textContent=pct(pattern.g1,pattern.cases)+'%';$('readingWhiteWin').textContent=pct(pattern.white,pattern.cases)+'%';$('readingLoss').textContent=pct(pattern.loss,pattern.cases)+'%';
      $('readingPatternText').textContent=`Teste interno na memória: entrada em ${colorName(pattern.target).toLowerCase()}, proteção G1 e cobertura no branco.`;
    } else {$('readingPatternName').textContent='AMOSTRA INSUFICIENTE';$('readingPatternOccurrences').textContent='0 casos';}

    registerSuggestion(rounds,entry,score,grade,pattern);
    renderSuggestionHistory();

    const tr=transitions(rounds), root=$('readingTransitions');
    root.innerHTML=['red','black','white'].map(c=>{const d=tr[c]||{red:0,black:0,white:0,total:0};const next=[['red',d.red],['black',d.black],['white',d.white]].sort((a,b)=>b[1]-a[1])[0];return `<div class="reading-transition"><span>Depois de ${colorName(c).toLowerCase()}</span><strong>${d.total?colorName(next[0])+' '+pct(next[1],d.total)+'%':'—'}</strong></div>`}).join('');
  }
  function start(){
    if(!started){started=true;window.addEventListener('sigma:live-round',()=>setTimeout(render,20));setInterval(()=>render(false),8000);}
    if(typeof window.startLiveCatalog==='function')window.startLiveCatalog(); setTimeout(()=>render(true),100);
  }
  window.SIGMA_READING={start,refresh:render,clearHistory(){const state=loadTracker();state.history=[];saveTracker(state);renderSuggestionHistory();}};
})();
