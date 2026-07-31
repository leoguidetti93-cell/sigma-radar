/* SIGMA LEITURA 1.2 — uma operação por vez + histórico automático das últimas 20 sugestões */
(() => {
  'use strict';
  let started = false;
  const HISTORY_KEY = 'sigma_reading_suggestions_v1';
  const HISTORY_LIMIT = 20;
  const STATS_KEY = 'sigma_reading_color_stats_v1';
  const SUMMARY_KEY = 'sigma_reading_color_summary_v1';
  const NEXT_SIGNAL_DELAY_MS = 1000;
  let lastRenderedRoundKey = null;
  const $ = id => document.getElementById(id);
  const pct = (n,d) => d ? Math.round(n/d*100) : 0;
  const median = values => { if(!values.length)return 0; const a=[...values].sort((x,y)=>x-y),m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2; };
  const colorName = c => c==='red'?'VERMELHO':c==='black'?'PRETO':'BRANCO';
  const colorShort = c => c==='red'?'V':c==='black'?'P':'B';

  const TELEGRAM_API = '/api/sigma-leitura-telegram';
  function telegramCredentials(){
    return {
      license_key:String(localStorage.getItem('sigma_access_license')||''),
      session_id:String(localStorage.getItem('sigma_access_session')||''),
      device_id:String(localStorage.getItem('sigma_access_device')||'')
    };
  }
  async function sendReadingTelegram(eventType,pending,extra={}){
    if(!pending)return null;
    const credentials=telegramCredentials();
    if(!credentials.license_key||!credentials.session_id||!credentials.device_id)return null;
    const response=await fetch(TELEGRAM_API,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        ...credentials,
        event_id:`${pending.id}:${eventType}`,
        event_type:eventType,
        operation:{
          id:pending.id,
          target:pending.target,
          score:pending.score,
          grade:pending.grade,
          pattern:pending.pattern,
          created_at:pending.createdAt,
          telegram_message_id:pending.telegramMessageId||null,
          ...extra
        }
      })
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok||data.ok===false)throw new Error(data.error||'Falha ao enviar ao Telegram.');
    return data;
  }
  function queueTelegramEvent(eventType,pending,extra={}){
    if(!pending)return;
    const state=loadTracker();
    if(!state.pending||state.pending.id!==pending.id)return;
    state.pending.telegramEvents ||= {};
    if(state.pending.telegramEvents[eventType])return;
    state.pending.telegramEvents[eventType]='sending';
    saveTracker(state);
    sendReadingTelegram(eventType,state.pending,extra).then(data=>{
      const latest=loadTracker();
      if(latest.pending?.id===pending.id){
        latest.pending.telegramEvents ||= {};
        latest.pending.telegramEvents[eventType]='sent';
        if(data?.message_id)latest.pending.telegramMessageId=data.message_id;
        saveTracker(latest);
      }
    }).catch(error=>{
      console.warn('[SIGMA LEITURA] Telegram:',error);
      const latest=loadTracker();
      if(latest.pending?.id===pending.id){
        latest.pending.telegramEvents ||= {};
        delete latest.pending.telegramEvents[eventType];
        saveTracker(latest);
      }
    });
  }


  const roundKey = r => String(r?.id ?? r?._id ?? r?.createdAt ?? r?.timestamp ?? '');
  function loadTracker(){
    try{
      const parsed=JSON.parse(localStorage.getItem(HISTORY_KEY)||'{}');
      return {pending:parsed.pending||null,history:Array.isArray(parsed.history)?parsed.history.slice(0,HISTORY_LIMIT):[],nextSignalAfter:Number(parsed.nextSignalAfter)||0};
    }catch(_){ return {pending:null,history:[],nextSignalAfter:0}; }
  }
  function saveTracker(state){
    state.history=(state.history||[]).slice(0,HISTORY_LIMIT);
    localStorage.setItem(HISTORY_KEY,JSON.stringify(state));
  }
  function formatRoundTime(value){
    if(!value)return '—';
    const d=new Date(value); return Number.isNaN(d.getTime())?'—':d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  }

  const dayKey = value => {
    const d=value instanceof Date?value:new Date(value||Date.now());
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const halfHourKey = value => {
    const d=value instanceof Date?value:new Date(value||Date.now());
    const minute=d.getMinutes()<30?'00':'30';
    return `${dayKey(d)}T${String(d.getHours()).padStart(2,'0')}:${minute}`;
  };
  function emptyStats(){return {signals:0,wins:0,losses:0,whites:0,direct:0,g1:0,processedIds:[]};}
  function loadStats(){
    try{return JSON.parse(localStorage.getItem(STATS_KEY)||'{"days":{},"sessions":{}}')}catch(_){return {days:{},sessions:{}}}
  }
  function saveStats(stats){
    const cutoff=new Date(); cutoff.setDate(cutoff.getDate()-3);
    for(const key of Object.keys(stats.days||{}))if(key<dayKey(cutoff))delete stats.days[key];
    const sessionKeys=Object.keys(stats.sessions||{}).sort().slice(-160);
    stats.sessions=Object.fromEntries(sessionKeys.map(k=>[k,stats.sessions[k]]));
    localStorage.setItem(STATS_KEY,JSON.stringify(stats));
  }
  function recordSettledStats(item){
    const stats=loadStats(); stats.days ||= {}; stats.sessions ||= {};
    const dKey=dayKey(item.resolvedAt||Date.now()), sKey=halfHourKey(item.resolvedAt||Date.now());
    for(const bucket of [stats.days[dKey] ||= emptyStats(),stats.sessions[sKey] ||= emptyStats()]){
      bucket.processedIds ||= [];
      if(bucket.processedIds.includes(item.id))continue;
      bucket.processedIds.push(item.id); bucket.processedIds=bucket.processedIds.slice(-500);
      bucket.signals++;
      if(item.result==='LOSS')bucket.losses++;
      else if(item.result==='WIN BRANCO')bucket.whites++;
      else {bucket.wins++; if(item.result==='WIN DIRETA')bucket.direct++; if(item.result==='WIN G1')bucket.g1++;}
    }
    saveStats(stats);
  }
  const accuracy = stats => stats?.signals ? Math.round(((Number(stats.wins)||0)+(Number(stats.whites)||0))/stats.signals*100) : 0;
  function loadSummaryState(){try{return JSON.parse(localStorage.getItem(SUMMARY_KEY)||'{}')}catch(_){return {}}}
  function saveSummaryState(state){localStorage.setItem(SUMMARY_KEY,JSON.stringify(state));}
  async function sendSummaryTelegram(eventType,summary,eventId){
    const credentials=telegramCredentials();
    if(!credentials.license_key||!credentials.session_id||!credentials.device_id)return null;
    const response=await fetch(TELEGRAM_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...credentials,event_id:eventId,event_type:eventType,summary})});
    const data=await response.json().catch(()=>({}));
    if(!response.ok||data.ok===false)throw new Error(data.error||'Falha ao enviar resumo ao Telegram.');
    return data;
  }
  function previousHalfHourSlot(now=new Date()){
    const d=new Date(now); d.setSeconds(0,0);
    if(d.getMinutes()<30){d.setHours(d.getHours()-1,30,0,0)}else d.setMinutes(0,0,0);
    return halfHourKey(d);
  }
  function maybeSendSummaries(){
    const now=new Date(), state=loadSummaryState(), stats=loadStats();
    const currentSlot=halfHourKey(now), previousSlot=previousHalfHourSlot(now);
    if(state.currentSlot && state.currentSlot!==currentSlot && state.lastSessionSent!==previousSlot){
      const bucket=stats.sessions?.[previousSlot]||emptyStats();
      const summary={period:previousSlot,signals:bucket.signals||0,wins:bucket.wins||0,losses:bucket.losses||0,whites:bucket.whites||0,direct:bucket.direct||0,g1:bucket.g1||0,accuracy:accuracy(bucket)};
      state.lastSessionSent=previousSlot; saveSummaryState(state);
      sendSummaryTelegram('SESSION_SUMMARY',summary,`session:${previousSlot}`).catch(e=>{console.warn('[SIGMA LEITURA] Resumo 30min:',e);const s=loadSummaryState();if(s.lastSessionSent===previousSlot)delete s.lastSessionSent;saveSummaryState(s)});
    }
    state.currentSlot=currentSlot;
    const today=dayKey(now);
    if(now.getHours()===23 && now.getMinutes()===59 && state.lastDailySent!==today){
      const bucket=stats.days?.[today]||emptyStats();
      const summary={period:today,signals:bucket.signals||0,wins:bucket.wins||0,losses:bucket.losses||0,whites:bucket.whites||0,direct:bucket.direct||0,g1:bucket.g1||0,accuracy:accuracy(bucket)};
      state.lastDailySent=today; saveSummaryState(state);
      sendSummaryTelegram('DAILY_SUMMARY',summary,`daily:${today}`).catch(e=>{console.warn('[SIGMA LEITURA] Resumo diário:',e);const s=loadSummaryState();if(s.lastDailySent===today)delete s.lastDailySent;saveSummaryState(s)});
    }else saveSummaryState(state);
  }

  function pendingStage(pending,rounds){
    if(!pending)return {stage:'IDLE',after:[]};
    let anchor=rounds.findIndex(r=>roundKey(r)===pending.anchorKey);
    if(anchor<0){
      const t=new Date(pending.anchorAt).getTime();
      anchor=rounds.findIndex(r=>new Date(r.createdAt).getTime()>=t);
    }
    const after=anchor>=0?rounds.slice(anchor+1):[];
    if(after.length===0)return {stage:'AGUARDANDO DIRETA',after};
    if(after.length===1)return {stage:'AGUARDANDO G1',after};
    return {stage:'FINALIZANDO',after};
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
    if(!state.pending)return state;
    const progress=pendingStage(state.pending,rounds);
    if(progress.after.length===1 && progress.after[0]?.color!==state.pending.target && progress.after[0]?.color!=='white'){
      queueTelegramEvent('G1',state.pending,{first_color:progress.after[0]?.color});
    }
    const settled=classifySuggestionResult(state.pending,rounds);
    if(!settled)return loadTracker();
    const finished={
      ...state.pending,
      result:settled.result,
      resultClass:settled.resultClass,
      resolvedAt:settled.resolvedRound?.createdAt||new Date().toISOString(),
      resolvedColor:settled.resolvedRound?.color||null
    };
    // Dispara o resultado antes de remover a operação pendente.
    sendReadingTelegram('RESULT',state.pending,{
      result:finished.result,
      resolved_at:finished.resolvedAt,
      resolved_color:finished.resolvedColor
    }).catch(error=>console.warn('[SIGMA LEITURA] Telegram resultado:',error));
    recordSettledStats(finished);
    state.history.unshift(finished);
    state.history=state.history.slice(0,HISTORY_LIMIT);
    state.pending=null;
    state.nextSignalAfter=Date.now()+NEXT_SIGNAL_DELAY_MS;
    saveTracker(state);
    setTimeout(()=>render(true),NEXT_SIGNAL_DELAY_MS+60);
    return state;
  }
  function registerSuggestion(rounds,entry,score,grade,pattern){
    if(!entry||!rounds.length)return loadTracker();
    const state=loadTracker();
    if(state.pending||Date.now()<(state.nextSignalAfter||0))return state;
    const anchor=rounds.at(-1);
    const stableAnchor=roundKey(anchor)||String(new Date(anchor?.createdAt||Date.now()).getTime());
    state.pending={
      id:`reading-${stableAnchor}-${entry}`,
      target:entry,
      score:Number(score)||0,
      grade:grade||'NEUTRO',
      pattern:pattern?pattern.pattern.map(colorShort).join(' • '):'LEITURA DINÂMICA',
      anchorKey:roundKey(anchor),
      anchorAt:anchor.createdAt||new Date().toISOString(),
      createdAt:new Date().toISOString()
    };
    saveTracker(state);
    queueTelegramEvent('SIGNAL',state.pending);
    return loadTracker();
  }
  function renderSuggestionHistory(rounds=getRounds()){
    const state=loadTracker(), root=$('readingSuggestionHistory'), pending=$('readingPendingSuggestion');
    if(pending){
      if(state.pending){
        const progress=pendingStage(state.pending,rounds);
        const stageText=progress.stage==='AGUARDANDO DIRETA'?'Aguardando a rodada da entrada':progress.stage==='AGUARDANDO G1'?'Direta não confirmou • aguardando G1':'Finalizando operação';
        pending.innerHTML=`<span class="reading-history-entry ${state.pending.target}">${colorName(state.pending.target)}</span><div><strong>${stageText}</strong><small>Gerada às ${formatRoundTime(state.pending.createdAt)} • score ${state.pending.score} • nenhuma nova sugestão até o resultado</small></div><b>${progress.stage}</b>`;
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
    const d=dist(rounds,n), root=$(id), label=$('readingDominant'+(n===3000?'1000':n)); if(!root)return;
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
    let tracker=settlePending(rounds);
    maybeSendSummaries();
    if($('readingSampleCount'))$('readingSampleCount').textContent=`${rounds.length} / 3000`;
    if($('readingLatestTime'))$('readingLatestTime').textContent=latest?new Date(latest.createdAt).toLocaleTimeString('pt-BR'):'—';
    if($('readingUpdatedAt'))$('readingUpdatedAt').textContent=new Date().toLocaleTimeString('pt-BR');
    const status=$('readingStatus'); if(status){status.textContent=rounds.length?'CONECTADO':'SINCRONIZANDO';status.className=`status-pill sigma-reading-status ${rounds.length?'online':'connecting'}`;}
    [20,50,100,3000].forEach(n=>renderDist(rounds,n,'readingBars'+n));
    if(!rounds.length){renderSuggestionHistory(rounds);return;}

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
    // Enquanto há uma operação ativa, a tela permanece travada na entrada original.
    // A análise continua sendo calculada em segundo plano, mas não vira nova sugestão.
    const activeEntry=tracker.pending?.target || entry;
    const activeScore=tracker.pending?.score ?? score;
    const activeGrade=tracker.pending?.grade || grade;
    const activeCls=activeGrade==='FORTE'?'strong':activeGrade==='ATENÇÃO'?'attention':activeGrade==='EVITAR'?'avoid':'neutral';
    const progress=tracker.pending?pendingStage(tracker.pending,rounds):null;
    $('readingScore').textContent=activeScore;$('readingScoreRing').style.setProperty('--score',activeScore);$('readingEntry').textContent=activeEntry?colorName(activeEntry):'—';
    $('readingDecision').textContent=tracker.pending?`${progress.stage} • ${colorName(activeEntry)}`:(entry?`ENTRADA NO ${colorName(entry)}`:'SEM DIREÇÃO');
    $('readingGrade').textContent=activeGrade;$('readingGrade').className=`reading-grade ${activeCls}`;
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

    // Registra somente quando não existe operação pendente.
    // Depois disso, aguarda DIRETA e, se necessário, G1 antes de liberar outra sugestão.
    if(!tracker.pending) tracker=registerSuggestion(rounds,entry,score,grade,pattern);
    renderSuggestionHistory(rounds);

    const tr=transitions(rounds), root=$('readingTransitions');
    root.innerHTML=['red','black','white'].map(c=>{const d=tr[c]||{red:0,black:0,white:0,total:0};const next=[['red',d.red],['black',d.black],['white',d.white]].sort((a,b)=>b[1]-a[1])[0];return `<div class="reading-transition"><span>Depois de ${colorName(c).toLowerCase()}</span><strong>${d.total?colorName(next[0])+' '+pct(next[1],d.total)+'%':'—'}</strong></div>`}).join('');
  }
  function start(){
    if(!started){started=true;window.addEventListener('sigma:live-round',()=>setTimeout(render,20));setInterval(()=>render(false),8000);}
    if(typeof window.startLiveCatalog==='function')window.startLiveCatalog(); setTimeout(()=>render(true),100);
  }
  window.SIGMA_READING={start,refresh:render,clearHistory(){const state=loadTracker();state.history=[];saveTracker(state);renderSuggestionHistory();}};
})();
