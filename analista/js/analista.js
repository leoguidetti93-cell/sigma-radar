let analystToken=sessionStorage.getItem('sigmaAnalystToken')||'';

function pad(v){return String(v).padStart(2,'0')}
function shiftMinute(time,delta){const [h,m]=time.split(':').map(Number);const d=new Date(2000,0,1,h,m+delta);return `${pad(d.getHours())}:${pad(d.getMinutes())}`}
function escapeHtml(text){return String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function todayBrazil(){return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date())}
function showToast(message,type='ok'){const el=document.getElementById('toast');el.textContent=message;el.className=`toast ${type} show`;setTimeout(()=>el.className='toast',2200)}
function authHeaders(){return {'Content-Type':'application/json','Authorization':`Bearer ${analystToken}`}}

async function login(){
  const password=document.getElementById('password').value;
  const response=await fetch('/api/analista-login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
  if(!response.ok){document.getElementById('loginError').classList.add('show');return}
  const data=await response.json();
  analystToken=data.token;
  sessionStorage.setItem('sigmaAnalystToken',analystToken);
  openPanel();
}
function logout(){sessionStorage.removeItem('sigmaAnalystToken');analystToken='';location.reload()}
function openPanel(){
  document.getElementById('loginCard').style.display='none';
  document.getElementById('panel').classList.add('show');
  document.getElementById('signalDate').value=todayBrazil();
  loadActive();
}
async function verifySession(){
  if(!analystToken)return;
  const response=await fetch('/api/analista-sinais',{headers:authHeaders()});
  if(response.ok)openPanel();
  else logout();
}
async function loadActive(){
  const response=await fetch('/api/analista-sinais',{headers:authHeaders(),cache:'no-store'});
  if(response.status===401)return logout();
  const data=await response.json();
  const list=data.active||[];
  document.getElementById('activeCounter').textContent=`${list.length} de 3`;
  document.getElementById('publishBtn').disabled=list.length>=3;
  document.getElementById('activeList').innerHTML=list.length?list.map(signal=>{
    const meta=signal.meta||{};
    return `<article class="signal">
      <div class="signal-top"><strong class="signal-time">${escapeHtml(signal.horario)}</strong><span class="status">ATIVO</span></div>
      <div class="window">${shiftMinute(signal.horario,-1)} • ${escapeHtml(signal.horario)} • ${shiftMinute(signal.horario,1)}</div>
      <div class="note">${escapeHtml(meta.texto||'Sem observação')} · ${'★'.repeat(meta.confianca||5)}</div>
      <div class="result-row">
        <select id="resultMinute-${signal.id}">
          <option value="${shiftMinute(signal.horario,-1)}">Branco em ${shiftMinute(signal.horario,-1)}</option>
          <option value="${signal.horario}" selected>Branco em ${signal.horario}</option>
          <option value="${shiftMinute(signal.horario,1)}">Branco em ${shiftMinute(signal.horario,1)}</option>
        </select>
        <button class="btn btn-win" onclick="finishSignal(${signal.id},'pago')">PAGO</button>
        <button class="btn btn-loss" onclick="finishSignal(${signal.id},'falhou')">FALHOU</button>
        <button class="btn btn-delete" onclick="deleteSignal(${signal.id})">Excluir</button>
      </div>
    </article>`;
  }).join(''):'<div class="empty">Nenhum sinal ativo.</div>';
}
async function publishSignal(){
  const payload={
    data_operacao:document.getElementById('signalDate').value,
    horario:document.getElementById('signalTime').value,
    observacao:document.getElementById('signalNote').value.trim(),
    confianca:Number(document.getElementById('signalConfidence').value)
  };
  if(!payload.data_operacao||!payload.horario)return showToast('Informe data e horário.','bad');
  const response=await fetch('/api/analista-sinais',{method:'POST',headers:authHeaders(),body:JSON.stringify(payload)});
  const data=await response.json();
  if(!response.ok)return showToast(data.error||'Não foi possível publicar.','bad');
  document.getElementById('signalNote').value='';
  showToast('Sinal publicado.');
  loadActive();
}
async function finishSignal(id,status){
  const minuto=status==='pago'?document.getElementById(`resultMinute-${id}`).value:null;
  const response=await fetch('/api/analista-sinais',{method:'PATCH',headers:authHeaders(),body:JSON.stringify({id,status,minuto_resultado:minuto})});
  const data=await response.json();
  if(!response.ok)return showToast(data.error||'Erro ao encerrar.','bad');
  showToast(status==='pago'?'Sinal marcado como PAGO.':'Sinal marcado como FALHOU.');
  loadActive();
}
async function deleteSignal(id){
  if(!confirm('Excluir este sinal definitivamente?'))return;
  const response=await fetch(`/api/analista-sinais?id=${id}`,{method:'DELETE',headers:authHeaders()});
  if(!response.ok)return showToast('Erro ao excluir.','bad');
  showToast('Sinal excluído.');
  loadActive();
}
verifySession();
setInterval(()=>{if(analystToken)loadActive()},5000);
