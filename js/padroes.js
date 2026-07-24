/* ===== RANKING DE PADRÕES IA ===== */
function patternDots(raw){
  return raw.split('').map(x=>`<span class="pattern-dot ${x}">${x}</span>`).join('');
}
function renderPatterns(){
  const list=document.getElementById('patternList');
  const sigmaBase=window.SIGMA_HYBRID_BASE||window.SIGMA_BASE_20||{};
  const items=sigmaBase.patterns||[];
  list.innerHTML=items.map((p,i)=>`
    <div class="pattern-row" onclick="showPatternDetail(${i})">
      <div class="pattern-pos">${String(i+1).padStart(2,'0')}</div>
      <div class="pattern-seq">${patternDots(p.raw)}</div>
      <div class="pattern-signal ${p.signal}">${p.signalName}<div class="small">Entrada + cobertura até G1</div></div>
      <div class="pattern-mobile-hide"><div class="small">Ocorrências</div><strong>${p.occurrences.toLocaleString('pt-BR')}</strong></div>
      <div class="pattern-hide"><div class="small">Até G1</div><strong>${String(p.g1).replace('.',',')}%</strong></div>
      <div class="score">${p.score}</div>
    </div>`).join('');
  document.getElementById('patternBaseInfo').textContent=`${(sigmaBase.meta.records||0).toLocaleString('pt-BR')} rodadas processadas`;
  if(items.length)showPatternDetail(0);
}
function showPatternDetail(index){
  const sigmaBase=window.SIGMA_HYBRID_BASE||window.SIGMA_BASE_20||{};
  const p=(sigmaBase.patterns||[])[index];if(!p)return;
  const detail=document.getElementById('patternDetail');
  detail.classList.add('show');
  detail.innerHTML=`
    <div class="small">DETALHES DO PADRÃO #${String(index+1).padStart(2,'0')}</div>
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:10px">
      <div class="pattern-seq">${patternDots(p.raw)}</div>
      <div style="font-size:22px;color:var(--muted)">→</div>
      <div class="pattern-signal ${p.signal}" style="font-size:21px">${p.signalName} até G1</div>
    </div>
    <div class="pattern-kpis">
      <div class="metric"><span>Score Sigma</span><b>${p.score}</b></div>
      <div class="metric"><span>Ocorrências</span><b>${p.occurrences.toLocaleString('pt-BR')}</b></div>
      <div class="metric"><span>Acerto direto</span><b>${String(p.direct).replace('.',',')}%</b></div>
      <div class="metric"><span>Acumulado G1</span><b>${String(p.g1).replace('.',',')}%</b></div>
      <div class="metric"><span>Loss após G1</span><b>${String(p.loss).replace('.',',')}%</b></div>
    </div>`;
}

function initializeHistoricalModules(){
  const sigmaBase=window.SIGMA_HYBRID_BASE||window.SIGMA_BASE_20||{};
  const hasColors = sigmaBase && sigmaBase.colorByHour &&
    Object.keys(sigmaBase.colorByHour).length === 24;
  const hasPatterns = sigmaBase && Array.isArray(sigmaBase.patterns) &&
    sigmaBase.patterns.length >= 10;

  const colorStatus = document.getElementById('colorDataStatus');
  const patternStatus = document.getElementById('patternDataStatus');

  if(colorStatus){
    colorStatus.textContent = hasColors ? 'BASE 2.1.0 • CARREGADA' : 'BASE 1.1 • FALHA';
    if(!hasColors) colorStatus.classList.add('beta');
  }
  if(patternStatus){
    patternStatus.textContent = hasPatterns ? 'TOP 10 • BASE CARREGADA' : 'PADRÕES • FALHA';
    if(!hasPatterns) patternStatus.classList.add('beta');
  }

  renderColorHourSelector();

  if(hasColors){
    const defaultButton = document.querySelectorAll('#colorHourSelector .hour-btn')[14];
    selectColorHour(14, defaultButton);
  }else{
    document.getElementById('colorSignalGrid').innerHTML =
      '<div class="small">A Base Histórica não foi carregada. Atualize a página.</div>';
  }

  if(hasPatterns){
    renderPatterns();
  }else{
    document.getElementById('patternList').innerHTML =
      '<div class="small">O ranking histórico não pôde ser carregado.</div>';
  }
}
initializeHistoricalModules();


function renderHybridHeatMap(){
  const heat=document.getElementById('heatGrid');
  if(!heat)return;
  const sigmaBase=window.SIGMA_HYBRID_BASE||window.SIGMA_BASE_20||{};
  heat.innerHTML='<div></div>'+Array.from({length:60},(_,minute)=>`<div class="m-label">${String(minute).padStart(2,'0')}</div>`).join('');
  for(let hour=0;hour<24;hour++){
    heat.innerHTML+=`<div class="h-label">${String(hour).padStart(2,'0')}h</div>`;
    for(let minute=0;minute<60;minute++){
      const value=Number(sigmaBase.heatValues?.[hour]?.[minute]||1);
      const score=Math.min(99,50+value*5);
      heat.innerHTML+=`<div class="heat-cell t${value}" data-level="${value}" data-time="${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}" data-score="${score}"></div>`;
    }
  }
}
renderHybridHeatMap();

function filterHeatMap(levels,button){
  const allowed=levels==='all'
    ? null
    : new Set(String(levels).split(',').map(Number));

  document.querySelectorAll('.heat-filter').forEach(item=>{
    item.classList.toggle('active',item===button);
  });

  document.querySelectorAll('.heat-cell').forEach(cell=>{
    const level=Number(cell.dataset.level);
    const visible=!allowed||allowed.has(level);

    cell.classList.toggle('heat-muted',!visible);
    cell.classList.toggle('heat-highlight',visible&&Boolean(allowed));
  });
}

window.addEventListener('sigma:hybrid-update',()=>{renderPatterns();renderHybridHeatMap();});
