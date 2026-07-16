const crypto=require('crypto');

function env(name){
  const value=process.env[name];
  if(!value)throw new Error(`Variável ausente: ${name}`);
  return String(value).trim();
}

function json(res,status,data){
  res.status(status).setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  res.end(JSON.stringify(data));
}

function base64url(input){
  return Buffer.from(input).toString('base64url');
}

function signToken(){
  const payload=base64url(JSON.stringify({exp:Date.now()+8*60*60*1000,role:'analista'}));
  const signature=crypto.createHmac('sha256',env('ANALISTA_PASSWORD')).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function verifyToken(req){
  const auth=req.headers.authorization||'';
  const token=auth.startsWith('Bearer ')?auth.slice(7):'';
  const [payload,signature]=token.split('.');
  if(!payload||!signature)return false;
  const expected=crypto.createHmac('sha256',env('ANALISTA_PASSWORD')).update(payload).digest('base64url');
  const a=Buffer.from(signature);const b=Buffer.from(expected);
  if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return false;
  try{
    const data=JSON.parse(Buffer.from(payload,'base64url').toString());
    return data.role==='analista'&&data.exp>Date.now();
  }catch{return false}
}

function secretHeaders(extra={}){
  const key=env('SUPABASE_SECRET_KEY');
  return {'apikey':key,'Authorization':`Bearer ${key}`,'Content-Type':'application/json',...extra};
}

function supabaseEndpoint(path){
  const raw=env('SUPABASE_URL').replace(/\/+$/,'');
  const base=raw.replace(/\/rest\/v1$/i,'');
  const cleanPath=String(path||'').replace(/^\/+/, '');
  return `${base}/rest/v1/${cleanPath}`;
}

async function supabase(path,options={}){
  const url=supabaseEndpoint(path);
  const response=await fetch(url,{
    ...options,
    headers:secretHeaders(options.headers||{})
  });
  if(!response.ok){
    const text=await response.text();
    throw new Error(`Supabase ${response.status}: ${text}`);
  }
  if(response.status===204)return null;
  const text=await response.text();
  return text?JSON.parse(text):null;
}

function parseMeta(value){
  if(!value)return {texto:'',confianca:5,minuto_resultado:null};
  try{
    const parsed=JSON.parse(value);
    if(parsed&&typeof parsed==='object')return parsed;
  }catch{}
  return {texto:String(value),confianca:5,minuto_resultado:null};
}

function encodeMeta(meta){
  return JSON.stringify({
    texto:String(meta.texto||'').slice(0,180),
    confianca:Math.max(3,Math.min(5,Number(meta.confianca)||5)),
    minuto_resultado:meta.minuto_resultado||null
  });
}

function decorate(rows){
  return (rows||[]).map(row=>({...row,meta:parseMeta(row.observacao)}));
}

function brazilDate(){
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo'}).format(new Date());
}

module.exports={env,json,signToken,verifyToken,supabase,parseMeta,encodeMeta,decorate,brazilDate};
