/* ===== SIMULADOR AO VIVO ===== */
window.currentSimulatorSignals=null;

function parseClockValue(value){
  if(!/^\d{2}:\d{2}$/.test(value||''))return null;
  const [h,m]=value.split(':').map(Number);
  if(h<0||h>23||m<0||m>59)return null;
  return h*60+m;
}
function parseStoneValue(value){
  if(value===''||value===null||value===undefined)return null;
  const parsed=Number(value);
  return Number.isInteger(parsed)&&parsed>=0&&parsed<=14?parsed:null;
}
function formatClock(totalMinutes){
  const normalized=((Math.round(totalMinutes)%1440)+1440)%1440;
  const h=Math.floor(normalized/60);
  const m=normalized%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}
function medianOf(values){
  const sorted=[...values].sort((a,b)=>a-b);
  const mid=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[mid]:(sorted[mid-1]+sorted[mid])/2;
}
function showSimulatorError(message){
  const el=document.getElementById('simulatorError');
  if(!el)return;
  el.textContent=message||'';
  el.classList.toggle('show',Boolean(message));
}
function calculateLiveSimulator(){
  const rawTimes=[1,2,3,4].map(i=>document.getElementById(`whiteTime${i}`)?.value||'');
  const rawStones=[1,2,3,4].map(i=>document.getElementById(`previousStone${i}`)?.value??'');
  const parsedTimes=rawTimes.map(parseClockValue);
  const stones=rawStones.map(parseStoneValue);

  if(parsedTimes.some(v=>v===null)){
    window.currentSimulatorSignals=null;
    showSimulatorError('Preencha os quatro horários corretamente no formato HH:MM.');
    return;
  }
  if(stones.some(v=>v===null)){
    window.currentSimulatorSignals=null;
    showSimulatorError('Preencha as quatro pedras anteriores com valores inteiros de 0 a 14.');
    return;
  }

  const chronological=[parsedTimes[0]];
  for(let i=1;i<parsedTimes.length;i++){
    let current=parsedTimes[i];
    while(current<chronological[i-1])current+=1440;
    chronological.push(current);
  }

  const intervals=[
    chronological[1]-chronological[0],
    chronological[2]-chronological[1],
    chronological[3]-chronological[2]
  ];

  if(intervals.some(v=>v<0||v>720)){
    window.currentSimulatorSignals=null;
    showSimulatorError('Confira a ordem dos horários. Foi identificado um intervalo incompatível.');
    return;
  }

  showSimulatorError('');

  const intervalMean=intervals.reduce((a,b)=>a+b,0)/intervals.length;
  const intervalMedian=medianOf(intervals);
  const stoneMean=stones.reduce((a,b)=>a+b,0)/stones.length;
  const last=chronological[3];

  const offsets={
    point1:Math.round(intervalMean),
    point2:Math.round(intervalMedian+4),
    point3:Math.round(intervalMean+stoneMean),
    point4:14-stones[3]
  };

  const projections={
    point1:formatClock(last+offsets.point1),
    point2:formatClock(last+offsets.point2),
    point3:formatClock(last+offsets.point3),
    point4:formatClock(last+offsets.point4)
  };

  Object.entries(projections).forEach(([key,value])=>{
    const number=key.replace('point','');
    const el=document.getElementById(`point${number}Signal`);
    if(el)el.textContent=value;
  });

  window.currentSimulatorSignals={projections,intervals,stones,offsets};
}
function copySimulatorSignals(){
  if(!window.currentSimulatorSignals)calculateLiveSimulator();
  const data=window.currentSimulatorSignals;
  if(!data)return;

  const text=[
    'LISTA SIGMA:',
    '',
    `Ponto 1: ${data.projections.point1}`,
    `Ponto 2: ${data.projections.point2}`,
    `Ponto 3: ${data.projections.point3}`,
    `Ponto 4: ${data.projections.point4}`
  ].join('\n');

  navigator.clipboard.writeText(text).then(()=>{
    const btn=document.getElementById('copySimulatorBtn');
    if(btn){
      const old=btn.textContent;
      btn.textContent='✓ Lista copiada';
      setTimeout(()=>btn.textContent=old,1600);
    }
  }).catch(()=>showSimulatorError('Não foi possível copiar automaticamente. Tente novamente.'));
}
[1,2,3,4].forEach(i=>{
  const timeField=document.getElementById(`whiteTime${i}`);
  const stoneField=document.getElementById(`previousStone${i}`);
  if(timeField)timeField.addEventListener('change',calculateLiveSimulator);
  if(stoneField)stoneField.addEventListener('input',calculateLiveSimulator);
});
calculateLiveSimulator();
