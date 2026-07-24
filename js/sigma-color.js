/* ===== SIGMA COLOR IA ===== */
function getSigmaBase(){return window.SIGMA_HYBRID_BASE||window.SIGMA_BASE_20||{meta:{},colorByHour:{},patterns:[]};}

function sigmaLevel(score){
  if(score>=88)return 'SIGMA ELITE';
  if(score>=80)return 'SIGMA PRO';
  if(score>=72)return 'SIGMA CORE';
  return 'SIGMA BASE';
}
function renderColorHourSelector(){
  const box=document.getElementById('colorHourSelector');
  box.innerHTML=Array.from({length:24},(_,h)=>`<button class="hour-btn ${h===14?'active':''}" onclick="selectColorHour(${h},this)">${String(h).padStart(2,'0')}h</button>`).join('');
}
function selectColorHour(hour,btn){
  document.querySelectorAll('#colorHourSelector .hour-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  const sigmaBase=getSigmaBase();
  const signals=(sigmaBase.colorByHour&&sigmaBase.colorByHour[String(hour)])||[];
  const avg=signals.length?signals.reduce((s,x)=>s+Number(x.score||0),0)/signals.length:0;
  const avgG1=signals.length?signals.reduce((s,x)=>s+Number(x.g1||0),0)/signals.length:0;
  const red=signals.filter(x=>x.color==='V').length;
  const black=signals.filter(x=>x.color==='P').length;
  document.getElementById('colorSessionTitle').textContent=String(hour).padStart(2,'0')+'h';
  document.getElementById('colorSessionLevel').textContent=sigmaLevel(avg);
  document.getElementById('colorSessionText').textContent=`${signals.length} sinais selecionados entre ${String(hour).padStart(2,'0')}:00 e ${String(hour).padStart(2,'0')}:59, ordenados pelo horário.`;
  document.getElementById('colorRedCount').textContent=red;
  document.getElementById('colorBlackCount').textContent=black;
  document.getElementById('colorAvgScore').textContent=Math.round(avg);
  document.getElementById('colorAvgG1').textContent=avgG1.toFixed(1).replace('.',',')+'%';
  document.getElementById('colorSignalGrid').innerHTML=signals.map((s,i)=>`
    <div class="signal-card ${s.color==='V'?'red':'black'}">
      <div class="signal-top">
        <div class="signal-time">${s.time}</div>
        <div class="color-ball ${s.color==='V'?'red':'black'}"></div>
      </div>
      <div class="signal-name">${s.colorName} + Branco</div>
      <div class="bar"><i style="width:${s.score}%"></i></div>
      <div class="signal-meta"><span>Até G1 ${String(s.g1).replace('.',',')}%</span><span class="signal-score">${s.score}</span></div>
    </div>`).join('')||'<div class="small">Não há dados suficientes para esta sessão.</div>';
  window.currentColorSignals={hour,signals};
}
function copyColorSignals(){
  const current=window.currentColorSignals;
  if(!current||!current.signals.length)return;
  const text=current.signals
    .map(s=>`${s.time} ${s.color==='V'?'🔴':'⚫'} + ⚪`)
    .join('\n');
  navigator.clipboard.writeText(text).then(()=>{
    const btn=document.getElementById('copyColorBtn');
    if(btn){
      const old=btn.textContent;
      btn.textContent='✓ Lista copiada';
      setTimeout(()=>btn.textContent=old,1600);
    }
  });
}

window.addEventListener('sigma:hybrid-update',()=>{const h=window.currentColorSignals?.hour??14;const btn=document.querySelectorAll('#colorHourSelector .hour-btn')[h];selectColorHour(h,btn);});
