/* ===== CENTRAL DE OPERAÇÕES ===== */
let analystSignalsCache={active:[],history:[],stats:{paid:0,failed:0,accuracy:null}};
let analystClockTimer=null;

function analystPad(value){return String(value).padStart(2,'0')}

function analystShiftMinute(time,delta){
  const [hour,minute]=String(time).split(':').map(Number);
  const date=new Date(2000,0,1,hour,minute+delta,0);
  return `${analystPad(date.getHours())}:${analystPad(date.getMinutes())}`;
}

function analystSignalDate(signal){
  return new Date(`${signal.data_operacao}T${signal.horario}:00-03:00`);
}

function analystSignalState(signal){
  const center=analystSignalDate(signal);
  const start=new Date(center.getTime()-60000);
  const end=new Date(center.getTime()+119999);
  const now=new Date();

  if(now<start)return {key:'waiting',label:'AGUARDANDO',prefix:'Começa em',target:start};
  if(now<=end)return {key:'live',label:'AO VIVO',prefix:'Janela termina em',target:end};
  return {key:'finished',label:'JANELA ENCERRADA',prefix:'Resultado',target:null};
}

function analystCountdown(target){
  if(!target)return 'Aguardando analista';
  const diff=Math.max(0,target.getTime()-Date.now());
  const hours=Math.floor(diff/3600000);
  const minutes=Math.floor((diff%3600000)/60000);
  const seconds=Math.floor((diff%60000)/1000);
  return `${analystPad(hours)}:${analystPad(minutes)}:${analystPad(seconds)}`;
}

function analystEscape(text){
  return String(text??'').replace(/[&<>"']/g,char=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  })[char]);
}

function renderAnalystSignals(){
  const active=analystSignalsCache.active||[];
  const history=analystSignalsCache.history||[];
  const stats=analystSignalsCache.stats||{paid:0,failed:0,accuracy:null};

  const activeBox=document.getElementById('analystActiveSignals');
  if(activeBox){
    activeBox.innerHTML=active.length
      ? active.map(signal=>{
          const state=analystSignalState(signal);
          const meta=signal.meta||{};
          return `
            <article class="analyst-signal-card ${state.key}">
              <div class="analyst-signal-top">
                <div class="analyst-white-ball">⚪</div>
                <span class="analyst-live-pill ${state.key}">${state.label}</span>
              </div>

              <div class="analyst-signal-label">Entrada no branco</div>
              <div class="analyst-signal-time">${analystEscape(signal.horario)}</div>

              <div class="analyst-window">
                <span>${analystShiftMinute(signal.horario,-1)}</span>
                <span class="central">${analystEscape(signal.horario)}</span>
                <span>${analystShiftMinute(signal.horario,1)}</span>
              </div>

              <p class="analyst-note">${meta.texto?analystEscape(meta.texto):'Sinal manual do Analista Sigma.'}</p>

              <div class="analyst-countdown">
                <span>${state.prefix}</span>
                <strong data-analyst-countdown="${signal.id}">${analystCountdown(state.target)}</strong>
              </div>
            </article>`;
        }).join('')
      : '<div class="analyst-empty">Nenhum sinal ativo neste momento.</div>';
  }

  const historyBox=document.getElementById('analystHistory');
  if(historyBox){
    historyBox.innerHTML=history.length
      ? history.map(signal=>{
          const meta=signal.meta||{};
          const result=signal.status==='pago'?'PAGO':'FALHOU';
          const minute=meta.minuto_resultado
            ? `Branco em ${analystEscape(meta.minuto_resultado)}`
            : 'Janela encerrada';
          return `
            <div class="analyst-history-row">
              <strong class="analyst-history-time">${analystEscape(signal.horario)}</strong>
              <div class="analyst-history-window">
                ${analystShiftMinute(signal.horario,-1)} • ${analystEscape(signal.horario)} • ${analystShiftMinute(signal.horario,1)}
              </div>
              <span class="analyst-result-minute">${minute}</span>
              <span class="analyst-history-result ${signal.status}">${result}</span>
            </div>`;
        }).join('')
      : '<div class="analyst-empty">O histórico aparecerá após o primeiro sinal ser encerrado.</div>';
  }

  document.getElementById('analystActiveCount').textContent=active.length;
  document.getElementById('analystPaidToday').textContent=stats.paid||0;
  document.getElementById('analystFailedToday').textContent=stats.failed||0;
  document.getElementById('analystAccuracyToday').textContent=
    stats.accuracy===null||stats.accuracy===undefined?'—':`${stats.accuracy}%`;

  const badge=document.getElementById('analystMenuBadge');
  if(badge){
    badge.hidden=active.length===0;
    badge.textContent=active.length;
  }
}

function updateAnalystCountdowns(){
  (analystSignalsCache.active||[]).forEach(signal=>{
    const state=analystSignalState(signal);
    const target=document.querySelector(`[data-analyst-countdown="${signal.id}"]`);
    if(target)target.textContent=analystCountdown(state.target);
  });
}

async function loadAnalystSignals(){
  const status=document.getElementById('analystConnectionStatus');
  try{
    const response=await fetch('/api/sinais',{cache:'no-store'});
    if(!response.ok)throw new Error('Falha ao consultar sinais');
    analystSignalsCache=await response.json();
    renderAnalystSignals();
    if(status){
      status.textContent='AO VIVO';
      status.style.color='var(--green)';
    }
  }catch(error){
    if(status){
      status.textContent='SEM CONEXÃO';
      status.style.color='#ff8296';
    }
    console.error('Central de Operações:',error);
  }
}

loadAnalystSignals();
setInterval(loadAnalystSignals,4000);
analystClockTimer=setInterval(updateAnalystCountdowns,1000);

const tip=document.getElementById('tooltip');
document.querySelectorAll('.heat-cell').forEach(el=>{
  el.addEventListener('mousemove',event=>{
    tip.style.display='block';
    tip.style.left=(event.clientX+14)+'px';
    tip.style.top=(event.clientY+14)+'px';
    tip.innerHTML=`<strong>${el.dataset.time}</strong><br>Intensidade ${el.dataset.score}/100`;
  });
  el.addEventListener('mouseleave',()=>{tip.style.display='none';});
});
