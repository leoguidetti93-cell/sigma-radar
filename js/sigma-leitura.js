/* SIGMA LEITURA 1.0 — abastecido exclusivamente pelo Catalogador */
(() => {
  'use strict';
  let started = false;
  const $ = id => document.getElementById(id);
  const pct = (n,d) => d ? Math.round(n/d*100) : 0;
  const median = values => { if(!values.length)return 0; const a=[...values].sort((x,y)=>x-y),m=Math.floor(a.length/2); return a.length%2?a[m]:(a[m-1]+a[m])/2; };
  const colorName = c => c==='red'?'VERMELHO':c==='black'?'PRETO':'BRANCO';
  const colorShort = c => c==='red'?'V':c==='black'?'P':'B';

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
    if($('readingSampleCount'))$('readingSampleCount').textContent=`${rounds.length} / 1000`;
    if($('readingLatestTime'))$('readingLatestTime').textContent=latest?new Date(latest.createdAt).toLocaleTimeString('pt-BR'):'—';
    if($('readingUpdatedAt'))$('readingUpdatedAt').textContent=new Date().toLocaleTimeString('pt-BR');
    const status=$('readingStatus'); if(status){status.textContent=rounds.length?'CONECTADO':'SINCRONIZANDO';status.className=`status-pill sigma-reading-status ${rounds.length?'online':'connecting'}`;}
    [20,50,100,1000].forEach(n=>renderDist(rounds,n,'readingBars'+n));
    if(!rounds.length)return;

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

    const tr=transitions(rounds), root=$('readingTransitions');
    root.innerHTML=['red','black','white'].map(c=>{const d=tr[c]||{red:0,black:0,white:0,total:0};const next=[['red',d.red],['black',d.black],['white',d.white]].sort((a,b)=>b[1]-a[1])[0];return `<div class="reading-transition"><span>Depois de ${colorName(c).toLowerCase()}</span><strong>${d.total?colorName(next[0])+' '+pct(next[1],d.total)+'%':'—'}</strong></div>`}).join('');
  }
  function start(){
    if(!started){started=true;window.addEventListener('sigma:live-round',()=>setTimeout(render,20));setInterval(()=>render(false),8000);}
    if(typeof window.startLiveCatalog==='function')window.startLiveCatalog(); setTimeout(()=>render(true),100);
  }
  window.SIGMA_READING={start,refresh:render};
})();
