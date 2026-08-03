/* SIGMA ORION 4.3.0 — WHITE exclusivo do servidor; lista COLOR removida */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const WHITE_STATE_URL = 'https://sigma-live-server.onrender.com/api/sigma-white/state';
  const fmtTime = value => {
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? '—' : d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  };
  function render(state){
    const active=state?.active;
    if(active){
      $('readingWhiteAutoTime').textContent=fmtTime(active.targetAt);
      $('readingWhiteAutoScore').textContent=active.score ?? '—';
      $('readingWhiteAutoProgress').textContent=`${active.processedHouses||0} / 6`;
      const inOperation=active.status==='IN_OPERATION';
      $('readingWhiteAutoDetail').textContent=inOperation
        ? `Operação ativa • ${active.processedHouses||0} casa(s) processada(s)`
        : `Janela ${fmtTime(active.windowStartAt)} • ${fmtTime(active.targetAt)} • ${fmtTime(new Date(new Date(active.targetAt).getTime()+60000))}`;
      const status=$('readingWhiteAutoStatus');
      status.textContent=inOperation?'EM OPERAÇÃO':active.score>=72?'SINAL ATIVO':'EM OBSERVAÇÃO';
      status.className=`reading-grade ${inOperation||active.score>=72?'strong':'attention'}`;
      $('readingWhiteAutoReasons').innerHTML=(active.reasons||[]).map(x=>`<p>✓ ${x}</p>`).join('');
    }else{
      $('readingWhiteAutoTime').textContent='—';
      $('readingWhiteAutoScore').textContent='—';
      $('readingWhiteAutoProgress').textContent='0 / 6';
      $('readingWhiteAutoDetail').textContent=state?.enabled?'Procurando a melhor janela.':'Motor WHITE aguardando ativação no servidor.';
      const status=$('readingWhiteAutoStatus'); status.textContent=state?.enabled?'PROCURANDO':'DESATIVADO'; status.className='reading-grade neutral';
      $('readingWhiteAutoReasons').innerHTML='<p>O cálculo e o acompanhamento são executados exclusivamente no servidor.</p>';
    }
    const history=Array.isArray(state?.history)?state.history:[];
    const root=$('readingWhiteAutoHistory');
    root.innerHTML=history.length?history.map((item,i)=>`<div class="reading-white-auto-row"><span>${String(i+1).padStart(2,'0')}</span><strong>${fmtTime(item.targetAt)}</strong><b class="${item.status==='WIN'?'win':'loss'}">${item.result}</b><small>Score ${item.score} • encerrado ${fmtTime(item.resolvedAt)}</small></div>`).join(''):'<div class="analyst-empty">Nenhuma projeção finalizada ainda.</div>';
    $('readingWhiteAutoAccuracy').textContent=state?.accuracy===null||state?.accuracy===undefined?'—':`${state.accuracy}%`;
  }
  async function sync(){
    try{
      const response=await fetch(`${WHITE_STATE_URL}?t=${Date.now()}`,{cache:'no-store'});
      if(!response.ok)throw new Error('Falha no servidor WHITE');
      render(await response.json());
    }catch(error){
      console.warn('[SIGMA WHITE]',error);
      render({enabled:false,history:[]});
    }
  }
  function init(){
    const clear=$('readingClearWhiteAuto');
    if(clear){ clear.hidden=true; clear.disabled=true; }
    sync(); setInterval(sync,2500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init); else init();
  window.SIGMA_PROJECTIONS={refreshWhite:sync};
})();
