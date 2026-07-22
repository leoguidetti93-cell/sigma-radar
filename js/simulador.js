/* ===== SIMULADOR AO VIVO ===== */
window.currentSimulatorSignals=null;

function parseClockValue(value){
  if(!/^\d{2}:\d{2}$/.test(value||''))return null;
  const [h,m]=value.split(':').map(Number);
  if(h<0||h>23||m<0||m>59)return null;
  return h*60+m;
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
  const raw=[1,2,3,4].map(i=>document.getElementById(`whiteTime${i}`).value);
  const parsed=raw.map(parseClockValue);

  if(parsed.some(v=>v===null)){
    showSimulatorError('Preencha os quatro horários corretamente no formato HH:MM.');
    return;
  }

  const chronological=[parsed[0]];
  for(let i=1;i<parsed.length;i++){
    let current=parsed[i];
    while(current<=chronological[i-1])current+=1440;
    chronological.push(current);
  }

  const intervals=[
    chronological[1]-chronological[0],
    chronological[2]-chronological[1],
    chronological[3]-chronological[2]
  ];

  if(intervals.some(v=>v<=0||v>720)){
    showSimulatorError('Confira a ordem dos horários. Foi identificado um intervalo incompatível.');
    return;
  }

  showSimulatorError('');

  const mean=intervals.reduce((a,b)=>a+b,0)/intervals.length;
  const median=medianOf(intervals);
  const sigma=(mean+median+14)/2;

  const meanRounded=Math.round(mean);
  const medianRounded=Math.round(median);
  const sigmaRounded=Math.round(sigma);
  const last=chronological[3];

  const projections={
    mean:formatClock(last+meanRounded),
    median:formatClock(last+medianRounded),
    sigma:formatClock(last+sigmaRounded)
  };

  const intervalDisplay=document.getElementById('intervalDisplay');
  if(intervalDisplay) intervalDisplay.innerHTML=intervals.map(v=>`<span>${v} min</span>`).join('');
  const meanValue=document.getElementById('meanValue');
  if(meanValue) meanValue.textContent=`${String(mean.toFixed(2)).replace('.',',')} min`;
  const medianValue=document.getElementById('medianValue');
  if(medianValue) medianValue.textContent=`${String(median.toFixed(2)).replace('.',',')} min`;
  const sigmaValue=document.getElementById('sigmaValue');
  if(sigmaValue) sigmaValue.textContent=`${String(sigma.toFixed(2)).replace('.',',')} min`;

  document.getElementById('meanSignal').textContent=projections.mean;
  document.getElementById('medianSignal').textContent=projections.median;
  document.getElementById('sigmaSignal').textContent=projections.sigma;
  const meanOffset=document.getElementById('meanOffset');
  if(meanOffset) meanOffset.textContent=`+${meanRounded} minutos`;
  const medianOffset=document.getElementById('medianOffset');
  if(medianOffset) medianOffset.textContent=`+${medianRounded} minutos`;
  const sigmaOffset=document.getElementById('sigmaOffset');
  if(sigmaOffset) sigmaOffset.textContent=`+${sigmaRounded} minutos`;

  window.currentSimulatorSignals={
    projections,
    intervals,
    mean:meanRounded,
    median:medianRounded,
    sigma:sigmaRounded
  };
}
function copySimulatorSignals(){
  const current=window.currentSimulatorSignals;
  if(!current){
    calculateLiveSimulator();
  }
  const data=window.currentSimulatorSignals;
  if(!data)return;

  const text=[
    `Média: ${data.projections.mean}`,
    `Mediana: ${data.projections.median}`,
    `Sigma: ${data.projections.sigma}`
  ].join('\n');

  navigator.clipboard.writeText(text).then(()=>{
    const btn=document.getElementById('copySimulatorBtn');
    if(btn){
      const old=btn.textContent;
      btn.textContent='✓ Horários copiados';
      setTimeout(()=>btn.textContent=old,1600);
    }
  });
}
[1,2,3,4].forEach(i=>{
  const field=document.getElementById(`whiteTime${i}`);
  if(field)field.addEventListener('change',calculateLiveSimulator);
});
calculateLiveSimulator();
