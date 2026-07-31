const {json,telegramSend,escapeTelegram}=require('./_lib');

const recentEvents=globalThis.__SIGMA_READING_TG_EVENTS__||(globalThis.__SIGMA_READING_TG_EVENTS__=new Map());
function cleanEvents(){const now=Date.now();for(const [key,time] of recentEvents){if(now-time>6*60*60*1000)recentEvents.delete(key)}}
async function validateAccess(body){
  const base=String(process.env.SIGMA_ACCESS_API_URL||'https://sigma-live-server.onrender.com').replace(/\/+$/,'');
  const response=await fetch(`${base}/api/access/validate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({license_key:body.license_key,device_id:body.device_id,session_id:body.session_id})});
  const data=await response.json().catch(()=>({}));
  return response.ok&&data.ok;
}
function colorLabel(value){return String(value).toLowerCase()==='black'?'⚫ PRETO':'🔴 VERMELHO'}
function message(type,op,summary={}){
  if(type==='SESSION_SUMMARY'||type==='DAILY_SUMMARY'){
    const title=type==='DAILY_SUMMARY'?'📅 RESULTADO GERAL DO DIA':'⏱ RESULTADO DA SESSÃO • 30 MIN';
    return `<b>Σ SIGMA LEITURA • COLOR</b>

<b>${title}</b>

📡 Sinais: <b>${Number(summary.signals)||0}</b>
✅ Wins: <b>${Number(summary.wins)||0}</b>
⚪ Brancos: <b>${Number(summary.whites)||0}</b>
❌ Loss: <b>${Number(summary.losses)||0}</b>
📊 Assertividade: <b>${Number(summary.accuracy)||0}%</b>`;
  }
  const color=colorLabel(op.target);
  const score=Math.max(0,Math.min(100,Number(op.score)||0));
  if(type==='SIGNAL')return `<b>Σ SIGMA LEITURA • COLOR</b>\n\n🎯 Entrada: <b>${color}</b>\n⚪ Proteção no branco\n🛡 Cobertura até G1\n📊 Score: <b>${score}</b>`;
  if(type==='G1')return `<b>🛡 G1 LIBERADO</b>\n\nManter entrada no <b>${color}</b>\n⚪ Proteção no branco`;
  const result=String(op.result||'LOSS').toUpperCase();
  if(result==='WIN DIRETA')return `<b>✅ WIN DIRETA • SIGMA COLOR</b>\n\n🎯 ${color}`;
  if(result==='WIN G1')return `<b>✅ WIN G1 • SIGMA COLOR</b>\n\n🎯 ${color}`;
  if(result==='WIN BRANCO')return `<b>⚪✅ WIN NO BRANCO • SIGMA COLOR</b>\n\n🛡 Cobertura confirmada.`;
  return `<b>❌ LOSS • SIGMA COLOR</b>\n\n📌 Operação encerrada.`;
}
module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{ok:false,error:'Método não permitido.'});
  try{
    if(!await validateAccess(req.body||{}))return json(res,401,{ok:false,error:'Sessão SIGMA inválida.'});
    const eventId=String(req.body?.event_id||'').slice(0,180);
    const eventType=String(req.body?.event_type||'').toUpperCase();
    const op=req.body?.operation||{};
    const summary=req.body?.summary||{};
    if(!eventId||!['SIGNAL','G1','RESULT','SESSION_SUMMARY','DAILY_SUMMARY'].includes(eventType))return json(res,400,{ok:false,error:'Evento inválido.'});
    cleanEvents();
    if(recentEvents.has(eventId))return json(res,200,{ok:true,deduplicated:true});
    const replyId=['SIGNAL','SESSION_SUMMARY','DAILY_SUMMARY'].includes(eventType)?null:Number(op.telegram_message_id)||null;
    const sent=await telegramSend(message(eventType,op,summary),replyId);
    if(!sent.ok)return json(res,502,{ok:false,error:sent.error||'Telegram indisponível.',configured:sent.configured});
    recentEvents.set(eventId,Date.now());
    return json(res,200,{ok:true,message_id:sent.message_id||null});
  }catch(error){console.error(error);return json(res,500,{ok:false,error:'Erro ao enviar evento do SIGMA Leitura.'})}
};
