/* SIGMA HYBRID ENGINE 1.0 — Base histórica 80% + memória viva até 20% */
(() => {
  'use strict';

  const HIST_WEIGHT = 0.80;
  const LIVE_WEIGHT_MAX = 0.20;
  const MAX_ROUNDS = 500;
  const LIVE_BASE = window.SIGMA_LIVE_SERVER_URL || 'https://sigma-live-server.onrender.com';
  const MEMORY_URL = `${LIVE_BASE}/memory?limit=${MAX_ROUNDS}`;
  const historical = window.SIGMA_BASE_20 || {};
  let rounds = [];
  let hybridBase = historical;
  let lastSignature = '';

  const clamp = (v,min=0,max=100) => Math.max(min,Math.min(max,Number(v)||0));
  const round1 = v => Math.round((Number(v)||0)*10)/10;
  const colorCode = r => r.roll===0 ? 'B' : (r.roll>=1&&r.roll<=7 ? 'V' : 'P');
  const parseRound = raw => {
    const src = raw?.round && typeof raw.round==='object' ? raw.round : raw?.payload && typeof raw.payload==='object' ? raw.payload : raw;
    if(!src) return null;
    const roll = Number(src.roll ?? src.number ?? src.value ?? src.result);
    const d = new Date(src.createdAt ?? src.created_at ?? src.timestamp ?? src.time ?? src.receivedAt ?? src.received_at);
    if(!Number.isInteger(roll)||roll<0||roll>14||Number.isNaN(d.getTime())) return null;
    return {id:String(src.id ?? src.round_id ?? `${d.toISOString()}-${roll}`),roll,createdAt:d.toISOString(),date:d,color:colorCode({roll})};
  };

  function normalize(items){
    const map = new Map();
    (items||[]).forEach(item=>{ const r=parseRound(item); if(r) map.set(r.id,r); });
    return [...map.values()].sort((a,b)=>a.date-b.date).slice(-MAX_ROUNDS);
  }

  function liveWeight(sample, fullAt=8){
    return LIVE_WEIGHT_MAX * clamp(sample/fullAt,0,1);
  }

  function blend(hist, live, sample, fullAt=8){
    const lw = liveWeight(sample,fullAt);
    return round1(clamp((Number(hist)||0)*(1-lw)+(Number(live)||0)*lw));
  }

  function minuteDistance(a,b){
    const d=Math.abs(a-b); return Math.min(d,60-d);
  }

  function nearMinute(hour,minute,radius=1){
    return rounds.filter(r=>r.date.getHours()===hour && minuteDistance(r.date.getMinutes(),minute)<=radius);
  }

  function inWindow(hour,start,duration=10){
    return rounds.filter(r=>{
      if(r.date.getHours()!==hour) return false;
      const m=r.date.getMinutes();
      return m>=start && m<Math.min(60,start+duration);
    });
  }

  function colorLiveScore(hour,minute,predicted){
    const sample=nearMinute(hour,minute,2);
    if(!sample.length) return {score:50,sample:0,direct:0,g1:0,predominance:0};
    const nonWhite=sample.filter(r=>r.color!=='B');
    const hits=nonWhite.filter(r=>r.color===predicted).length;
    const direct=nonWhite.length ? hits/nonWhite.length*100 : 50;
    const whites=sample.filter(r=>r.color==='B').length;
    const whiteBonus=clamp(50+((whites/sample.length)-(1/15))*240,0,100);
    return {score:clamp(direct*.82+whiteBonus*.18),sample:sample.length,direct,predominance:direct,g1:direct};
  }

  function buildColorByHour(){
    const out={};
    for(let h=0;h<24;h++){
      const list=(historical.colorByHour?.[String(h)]||[]).map(s=>{
        const live=colorLiveScore(h,Number(s.minute),s.color);
        return {...s,
          historicalScore:Number(s.score)||0,
          liveScore:round1(live.score),
          liveSamples:live.sample,
          score:Math.round(blend(s.score,live.score,live.sample,8)),
          direct:round1(blend(s.direct,live.direct,live.sample,8)),
          g1:round1(blend(s.g1,live.g1,live.sample,8)),
          predominance:round1(blend(s.predominance,live.predominance,live.sample,8))
        };
      }).sort((a,b)=>a.minute-b.minute);
      out[String(h)]=list;
    }
    return out;
  }

  function patternStats(raw,signal){
    const usable=rounds.filter(r=>r.color!=='B');
    let occurrences=0,direct=0,g1=0;
    for(let i=0;i<=usable.length-6;i++){
      const seq=usable.slice(i,i+4).map(r=>r.color).join('');
      if(seq!==raw) continue;
      occurrences++;
      if(usable[i+4]?.color===signal){direct++;g1++;}
      else if(usable[i+5]?.color===signal)g1++;
    }
    return {occurrences,direct:occurrences?direct/occurrences*100:0,g1:occurrences?g1/occurrences*100:0};
  }

  function buildPatterns(){
    return (historical.patterns||[]).map(p=>{
      const live=patternStats(p.raw,p.signal);
      const liveScore=live.occurrences ? live.g1 : 50;
      const score=Math.round(blend(p.score,liveScore,live.occurrences,10));
      const direct=round1(blend(p.direct,live.direct,live.occurrences,10));
      const g1=round1(blend(p.g1,live.g1,live.occurrences,10));
      return {...p,historicalScore:p.score,liveScore:round1(liveScore),liveOccurrences:live.occurrences,
        score,direct,g1,loss:round1(100-g1)};
    }).sort((a,b)=>b.score-a.score||b.g1-a.g1);
  }

  function liveWhiteScore(hour,minute,duration=10){
    const sample=duration===1?nearMinute(hour,minute,2):inWindow(hour,minute,duration);
    if(!sample.length)return {score:50,sample:0,rate:0};
    const rate=sample.filter(r=>r.color==='B').length/sample.length*100;
    const score=clamp(50+(rate-(100/15))*4.5,0,100);
    return {score,sample:sample.length,rate};
  }

  function buildHeatValues(){
    return Array.from({length:24},(_,h)=>Array.from({length:60},(_,m)=>{
      const hist=clamp(Number(historical.heatValues?.[h]?.[m]||1)*11.111,0,100);
      const live=liveWhiteScore(h,m,1);
      const hybrid=blend(hist,live.score,live.sample,6);
      return Math.max(1,Math.min(9,Math.round(hybrid/11.111)));
    }));
  }

  function buildHourlyData(){
    return (historical.hourlyData||[]).map(item=>({
      ...item,
      windows:(item.windows||[]).map(w=>{
        const live=liveWhiteScore(Number(w.hour??item.hour),Number(w.start),10);
        const score=Math.round(blend(w.score,live.score,live.sample,18));
        return {...w,historicalScore:w.score,liveScore:round1(live.score),liveSamples:live.sample,score,
          level:score>=89?'SIGMA ELITE':score>=78?'SIGMA PRO':score>=68?'SIGMA CORE':'SIGMA BASE',
          status:live.sample<4?w.status:(live.score>=60?'Aquecendo':live.score<=40?'Perdendo força':'Estável')};
      }).sort((a,b)=>b.score-a.score)
    }));
  }

  function buildRankingTimes(){
    return (historical.rankingTimes||[]).map(t=>{
      const [h,m]=String(t.time).split(':').map(Number);
      const live=liveWhiteScore(h,m,1);
      const score=Math.round(blend(t.score,live.score,live.sample,6));
      return {...t,historicalScore:t.score,liveScore:round1(live.score),liveSamples:live.sample,score,
        level:score>=89?'SIGMA ELITE':score>=78?'SIGMA PRO':score>=68?'SIGMA CORE':'SIGMA BASE'};
    }).sort((a,b)=>b.score-a.score||b.persistence-a.persistence);
  }

  function recalculate(){
    const signature=`${rounds.length}:${rounds.at(-1)?.id||''}`;
    if(signature===lastSignature)return;
    lastSignature=signature;
    hybridBase={...historical,
      meta:{...(historical.meta||{}),hybrid:true,historicalWeight:HIST_WEIGHT,liveWeight:LIVE_WEIGHT_MAX,liveRounds:rounds.length,hybridUpdatedAt:new Date().toISOString()},
      colorByHour:buildColorByHour(),patterns:buildPatterns(),heatValues:buildHeatValues(),hourlyData:buildHourlyData(),rankingTimes:buildRankingTimes()
    };
    window.SIGMA_HYBRID_BASE=hybridBase;
    window.dispatchEvent(new CustomEvent('sigma:hybrid-update',{detail:{rounds:rounds.length,base:hybridBase}}));
  }

  function setRounds(items){ rounds=normalize(items); recalculate(); }

  async function fetchMemory(){
    try{
      const res=await fetch(MEMORY_URL,{cache:'no-store'});
      if(!res.ok)throw new Error(`HTTP ${res.status}`);
      const data=await res.json();
      setRounds(Array.isArray(data)?data:(data.rounds||data.memory||data.data||[]));
    }catch(err){ console.warn('SIGMA HYBRID: memória viva indisponível; mantendo base histórica.',err); }
  }

  window.SIGMA_HYBRID_ENGINE={
    version:'1.0',weights:{historical:HIST_WEIGHT,live:LIVE_WEIGHT_MAX},
    getBase:()=>hybridBase,getRounds:()=>rounds.slice(),setRounds,recalculate
  };

  window.addEventListener('sigma:live-round',()=>{
    const live=window.SIGMA_LIVE_ENGINE?.rounds;
    if(Array.isArray(live))setRounds(live);
    else fetchMemory();
  });
  window.addEventListener('load',()=>{
    const live=window.SIGMA_LIVE_ENGINE?.rounds;
    if(Array.isArray(live)&&live.length)setRounds(live); else fetchMemory();
  });
  setTimeout(fetchMemory,800);
})();
