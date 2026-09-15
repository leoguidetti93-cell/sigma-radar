import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const {image}=await req.json(); if(!image)throw new Error("Imagem não enviada");
  const key=Deno.env.get("OPENAI_API_KEY"); if(!key)throw new Error("OPENAI_API_KEY não configurada");
  const prompt=`Você é o módulo de visão nutricional do Σ Coach. Analise UMA foto de um prato/refeição e estime o que está VISÍVEL. Não trate a estimativa como pesagem real.
Retorne SOMENTE JSON puro no formato:
{"foods":[{"name":"nome comum em português","estimated_amount":120,"unit":"g","confidence":0.86,"kcal":150,"protein_g":5,"carbs_g":28,"fat_g":2,"preparation":"cozido/grelhado/etc"}],"overall_confidence":0.82,"notes":"observação curta"}
Regras:
- use nomes comuns que facilitem casar com uma biblioteca brasileira (ex.: Arroz branco cozido, Feijão carioca cozido, Peito de frango grelhado);
- estimated_amount deve ser a quantidade VISÍVEL estimada em g ou ml; prefira g para sólidos e ml para líquidos;
- kcal/macros são estimativas para ESSA quantidade e servem apenas como fallback se o alimento não existir na biblioteca;
- confidence entre 0 e 1;
- não invente ingredientes invisíveis; se óleo/molho/recheio não puder ser determinado, mencione em notes em vez de assumir quantidade;
- se dois itens estiverem misturados mas distinguíveis, separe; se não forem distinguíveis, use um item composto com nome claro;
- se a imagem não mostrar comida suficiente para análise, foods deve ser [] e explique em notes.`;
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-5.6-luna",input:[{role:"user",content:[{type:"input_text",text:prompt},{type:"input_image",image_url:image}]}],max_output_tokens:900})});
  if(!r.ok)throw new Error(await r.text()); const out=await r.json();
  const text=out.output_text||out.output?.flatMap((x:any)=>x.content||[]).map((x:any)=>x.text||"").join("")||"";
  const clean=text.replace(/^```json\s*/i,"").replace(/```$/," ").trim(); const analysis=JSON.parse(clean);
  if(!Array.isArray(analysis.foods))analysis.foods=[];
  analysis.foods=analysis.foods.slice(0,12).map((x:any)=>({name:String(x.name||"").slice(0,100),estimated_amount:Math.max(1,Math.min(3000,Number(x.estimated_amount)||100)),unit:String(x.unit||"g").toLowerCase()==="ml"?"ml":"g",confidence:Math.max(0,Math.min(1,Number(x.confidence)||0)),kcal:Number(x.kcal)||0,protein_g:Number(x.protein_g)||0,carbs_g:Number(x.carbs_g)||0,fat_g:Number(x.fat_g)||0,preparation:String(x.preparation||"").slice(0,80)})).filter((x:any)=>x.name);
  return new Response(JSON.stringify({analysis}),{headers:{...cors,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:String(e?.message||e)}),{status:400,headers:{...cors,"Content-Type":"application/json"}})}
});
