/* ===== CATALOGADOR AO VIVO ===== */
const CATALOG_STORAGE_KEY='sigma-live-catalog-v1';
let catalogRounds=[];
let catalogTimer=null;
let catalogStarted=false;
let catalogLatestId=null;

function normalizeCatalogRound(item){
  if(!item)return null;

  const number=Number(
    item.roll ?? item.number ?? item.value ?? item.result ?? item.color_number
  );
  if(!Number.isFinite(number)||number<0||number>14)return null;

  const createdRaw=
    item.created_at ?? item.createdAt ?? item.date ?? item.timestamp ?? item.time;
  const created=new Date(createdRaw);
  if(Number.isNaN(created.getTime()))return null;

  let color=item.color;
  if(typeof color==='string'){
    const c=color.toLowerCase();
    color=c.includes('white')||c==='b'?'white':
      c.includes('red')||c==='v'?'red':
      c.includes('black')||c==='p'?'black':null;
  }else{
    color=number===0?'white':number<=7?'red':'black';
  }

  const id=String(item.id ?? item.round_id ?? item.uuid ?? `${created.toISOString()}-${number}`);
  return {id,number,color,createdAt:created.toISOString()};
}

function loadCatalogStorage(){
  try{
    const raw=JSON.parse(localStorage.getItem(CATALOG_STORAGE_KEY)||'[]');
    catalogRounds=Array.isArray(raw)
      ?raw.map(normalizeCatalogRound).filter(Boolean).slice(-300)
      :[];
  }catch{
    catalogRounds=[];
  }
}
function saveCatalogStorage(){
  localStorage.setItem(CATALOG_STORAGE_KEY,JSON.stringify(catalogRounds.slice(-300)));
}
function mergeCatalogRounds(incoming){
  const beforeLatest=catalogRounds.length?catalogRounds[catalogRounds.length-1].id:null;
  const map=new Map(catalogRounds.map(r=>[r.id,r]));

  incoming.map(normalizeCatalogRound).filter(Boolean).forEach(r=>map.set(r.id,r));

  catalogRounds=[...map.values()]
    .sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt))
    .slice(-300);

  catalogLatestId=catalogRounds.length?catalogRounds[catalogRounds.length-1].id:null;
  saveCatalogStorage();
  return beforeLatest!==catalogLatestId;
}
function catalogColorClass(color){
  return color==='white'?'catalog-white':color==='red'?'catalog-red':'catalog-black';
}
function formatCatalogTime(iso){
  return new Date(iso).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
}
function renderLiveCatalog(isNew=false){
  const root=document.getElementById('catalogHours');
  const count=document.getElementById('catalogCount');
  if(!root||!count)return;

  count.textContent=`${catalogRounds.length} / 300 rodadas`;

  if(!catalogRounds.length){
    root.innerHTML='<div class="catalog-alert">Nenhuma rodada recebida ainda.</div>';
    return;
  }

  const groups={};
  catalogRounds.forEach(r=>{
    const d=new Date(r.createdAt);
    const key=[
      d.getFullYear(),
      String(d.getMonth()+1).padStart(2,'0'),
      String(d.getDate()).padStart(2,'0'),
      String(d.getHours()).padStart(2,'0')
    ].join('-');
    if(!groups[key])groups[key]=[];
    groups[key].push(r);
  });

  const keys=Object.keys(groups).sort().reverse();
  root.innerHTML=keys.map((key,keyIndex)=>{
    const parts=key.split('-');
    const hour=parts[3];
    const date=`${parts[2]}/${parts[1]}/${parts[0]}`;

    const byMinute={};
    groups[key].forEach(r=>{
      const minute=String(new Date(r.createdAt).getMinutes()).padStart(2,'0');
      if(!byMinute[minute])byMinute[minute]=[];
      byMinute[minute].push(r);
    });

    let sections='';
    for(let row=5;row>=0;row--){
      const heads=Array.from({length:10},(_,col)=>{
        const minute=String(row*10+col).padStart(2,'0');
        return `<div class="catalog-minute-head">${minute}</div>`;
      }).join('');

      const minutes=Array.from({length:10},(_,col)=>{
        const minute=String(row*10+col).padStart(2,'0');
        const results=(byMinute[minute]||[]).slice(0,2);
        const slots=[0,1].map(i=>{
          const r=results[i];
          if(!r)return '<div class="catalog-result catalog-empty">○<small>—</small></div>';
          const newClass=isNew&&r.id===catalogLatestId?' catalog-new':'';
          const icon=r.color==='white'?'◆':r.number;
          return `<div class="catalog-result ${catalogColorClass(r.color)}${newClass}">
            ${icon}<small>${formatCatalogTime(r.createdAt)}</small>
          </div>`;
        }).join('');
        return `<div class="catalog-minute">${slots}</div>`;
      }).join('');

      sections+=heads+minutes;
    }

    return `<section class="catalog-hour">
      <div class="catalog-hour-head">
        <h3>Hora ${hour}</h3>
        <span>${date}${keyIndex===0?' • MAIS RECENTE':''}</span>
      </div>
      <div class="catalog-grid-wrap"><div class="catalog-grid">${sections}</div></div>
    </section>`;
  }).join('');
}
function setCatalogState(state,message){
  const status=document.getElementById('catalogStatus');
  const alert=document.getElementById('catalogAlert');
  if(status){
    status.classList.remove('beta');
    status.textContent=state==='online'?'● AO VIVO':state==='loading'?'CONECTANDO':'OFFLINE';
    if(state!=='online')status.classList.add('beta');
  }
  if(alert){
    alert.className=`catalog-alert ${state==='online'?'online':state==='error'?'error':''}`;
    alert.textContent=message;
  }
}
async function refreshLiveCatalog(manual=false){
  if(manual)setCatalogState('loading','Atualizando resultados...');

  try{
    const response=await fetch('/api/blaze-double',{cache:'no-store'});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const payload=await response.json();
    const rounds=Array.isArray(payload)?payload:(payload.rounds||payload.records||payload.data||[]);
    if(!Array.isArray(rounds)||!rounds.length)throw new Error('Fonte retornou lista vazia');

    const changed=mergeCatalogRounds(rounds);
    renderLiveCatalog(changed);

    const updated=document.getElementById('catalogUpdated');
    if(updated)updated.textContent=new Date().toLocaleTimeString('pt-BR');
    setCatalogState('online',`Conectado. ${rounds.length} resultado(s) recebidos nesta leitura.`);
  }catch(error){
    console.error('Catalogador:',error);
    renderLiveCatalog(false);
    setCatalogState(
      'error',
      catalogRounds.length
        ?'Fonte temporariamente indisponível. Exibindo o histórico salvo neste navegador.'
        :'Não foi possível conectar à fonte ao vivo. Verifique o deploy da pasta api.'
    );
  }
}
function startLiveCatalog(){
  if(!catalogStarted){
    loadCatalogStorage();
    renderLiveCatalog(false);
    catalogStarted=true;
  }
  refreshLiveCatalog();
  clearInterval(catalogTimer);
  catalogTimer=setInterval(refreshLiveCatalog,5000);
}
