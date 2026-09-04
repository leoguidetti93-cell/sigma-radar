import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const {image}=await req.json(); if(!image)throw new Error("Imagem não enviada");
  const key=Deno.env.get("OPENAI_API_KEY"); if(!key)throw new Error("OPENAI_API_KEY não configurada");
  const prompt=`Leia SOMENTE a tabela nutricional da embalagem. Extraia os valores referentes à porção declarada, não os valores por 100 g se houver uma coluna de porção. Retorne JSON puro com: name (se identificável, senão ""), category (protein|carb|fruit|veg|dairy|fat|drink|supp; melhor estimativa), portion (ex. "250 ml" ou "30 g"), kcal, protein_g, carbs_g, fat_g. Números devem ser numéricos. Não invente valor ilegível: use null.`;
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-5.6-luna",input:[{role:"user",content:[{type:"input_text",text:prompt},{type:"input_image",image_url:image}]}],max_output_tokens:300})});
  if(!r.ok)throw new Error(await r.text()); const out=await r.json();
  const text=out.output_text||out.output?.flatMap((x:any)=>x.content||[]).map((x:any)=>x.text||"").join("")||"";
  const clean=text.replace(/^```json\s*/i,"").replace(/```$/,"").trim(); const nutrition=JSON.parse(clean);
  return new Response(JSON.stringify({nutrition}),{headers:{...cors,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:String(e?.message||e)}),{status:400,headers:{...cors,"Content-Type":"application/json"}})}
});