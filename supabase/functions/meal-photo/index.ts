import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type"};
Deno.serve(async(req)=>{
 if(req.method==="OPTIONS")return new Response("ok",{headers:cors});
 try{
  const body=await req.json(); const {image}=body||{}; if(!image)throw new Error("Imagem não enviada");
  const key=Deno.env.get("OPENAI_API_KEY"); if(!key)throw new Error("OPENAI_API_KEY não configurada");
  if(body?.mode==="rerank"){
   const foods=Array.isArray(body.foods)?body.foods.slice(0,12):[];
   const compact=foods.map((x:any)=>({index:Number(x.index),detected:x.detected||{},candidates:Array.isArray(x.candidates)?x.candidates.slice(0,5):[]}));
   const prompt=`Você é a segunda etapa do reconhecimento nutricional do Σ Coach. A primeira visão já descreveu os itens de uma foto e o sistema encontrou até 5 candidatos reais da biblioteca Sigma para cada item. Use A FOTO + descrição visual + preparação + candidatos para escolher o candidato MAIS COERENTE. Não force correspondência se nenhum candidato fizer sentido.
Retorne SOMENTE JSON puro: {"selections":[{"index":0,"chosen_name":"nome EXATO de um candidato ou null","confidence":0.82,"reason":"motivo curto"}]}
Regras: chosen_name deve copiar EXATAMENTE um nome listado em candidates; se houver ambiguidade relevante ou nenhum candidato combinar visualmente, use null; considere forma, textura, cor, contexto de prato salgado/doce e método de preparo; não escolha fruta para cubos de carne/frango/queijo; preparações específicas compatíveis (refogado, frito, assado, grelhado, purê) têm prioridade sobre versões genéricas; não mude quantidades nesta etapa.

CANDIDATOS:
${JSON.stringify(compact)}`;
   const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-5.6-luna",input:[{role:"user",content:[{type:"input_text",text:prompt},{type:"input_image",image_url:image}]}],reasoning:{effort:"low"},max_output_tokens:900})});
   if(!r.ok)throw new Error(await r.text());const out=await r.json();const text=out.output_text||out.output?.flatMap((x:any)=>x.content||[]).map((x:any)=>x.text||"").join("")||"";const clean=text.replace(/^```json\s*/i,"").replace(/```$/," ").trim();const parsed=JSON.parse(clean);const selections=(Array.isArray(parsed?.selections)?parsed.selections:[]).map((x:any)=>({index:Number(x.index),chosen_name:x.chosen_name==null?null:String(x.chosen_name).slice(0,120),confidence:Math.max(0,Math.min(1,Number(x.confidence)||0)),reason:String(x.reason||"").slice(0,180)}));return new Response(JSON.stringify({selections}),{headers:{...cors,"Content-Type":"application/json"}})
  }
  const prompt=`Você é o módulo de visão nutricional do Σ Coach. Analise UMA foto de um prato/refeição.
Faça internamente em 2 etapas: (1) leitura visual honesta do que aparece; (2) tradução disso para alimentos comuns no Brasil.
Não trate a estimativa como pesagem real.
Retorne SOMENTE JSON puro no formato:
{"foods":[{"name":"nome amigável em português","match_name":"nome mais canônico possível para tentar casar com a biblioteca","candidate_names":["opção 1","opção 2"],"estimated_amount":120,"unit":"g","confidence":0.62,"kcal":150,"protein_g":5,"carbs_g":28,"fat_g":2,"preparation":"cozido/grelhado/refogado/etc","ingredient_role":"main|side|mixed|garnish","needs_confirmation":true,"visual_description":"descrição visual curta"}],"overall_confidence":0.58,"notes":"observação curta"}
Regras obrigatórias:
- use nomes comuns que facilitem casar com uma biblioteca brasileira;
- primeiro descreva mentalmente o que está vendo; só depois escolha o alimento mais provável;
- pratos salgados do dia a dia devem ser interpretados primeiro como comida salgada; NÃO identifique fruta a menos que ela esteja nitidamente presente;
- não chame cubos de frango, carne ou queijo de pera, maçã ou outras frutas;
- estimated_amount deve ser a quantidade VISÍVEL estimada em g ou ml; prefira g para sólidos e ml para líquidos;
- kcal/macros são estimativas para ESSA quantidade e servem apenas como fallback se o alimento não existir na biblioteca;
- confidence entre 0 e 1 e deve ser REALISTA; se houver ambiguidade, reduza confidence;
- use candidate_names quando houver 2 ou 3 interpretações plausíveis;
- needs_confirmation deve ser true quando confidence < 0.72 ou houver candidate_names relevantes;
- se dois itens estiverem misturados mas distinguíveis, separe; se o preparo for claramente composto, prefira um item composto (ex.: "Frango refogado com tomate");
- tomate, cebola, cheiro-verde e outros temperos visíveis dentro de um preparo misto não devem virar uma porção grande independente; se necessário, marque como garnish ou incorpore ao item principal;
- purês devem ser identificados como purê quando a textura indicar alimento amassado/cremoso;
- diferencie arroz branco, arroz integral e arroz vermelho pela cor e textura quando isso estiver visível;
- evite duplicar o mesmo alimento mais de uma vez, a menos que existam porções visualmente separadas;
- não invente ingredientes invisíveis; se óleo/molho/recheio não puder ser determinado, mencione em notes em vez de assumir quantidade;
- se a imagem não mostrar comida suficiente para análise, foods deve ser [] e explique em notes.`;
  const r=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:"gpt-5.6-luna",input:[{role:"user",content:[{type:"input_text",text:prompt},{type:"input_image",image_url:image}]}],max_output_tokens:900})});
  if(!r.ok)throw new Error(await r.text()); const out=await r.json();
  const text=out.output_text||out.output?.flatMap((x:any)=>x.content||[]).map((x:any)=>x.text||"").join("")||"";
  const clean=text.replace(/^```json\s*/i,"").replace(/```$/," ").trim(); const analysis=JSON.parse(clean);
  if(!Array.isArray(analysis.foods))analysis.foods=[];
  analysis.foods=analysis.foods.slice(0,12).map((x:any)=>({
   name:String(x.name||"").slice(0,100),
   match_name:String(x.match_name||x.name||"").slice(0,100),
   candidate_names:Array.isArray(x.candidate_names)?x.candidate_names.map((v:any)=>String(v||"").slice(0,80)).filter(Boolean).slice(0,4):[],
   estimated_amount:Math.max(1,Math.min(3000,Number(x.estimated_amount)||100)),
   unit:String(x.unit||"g").toLowerCase()==="ml"?"ml":"g",
   confidence:Math.max(0,Math.min(1,Number(x.confidence)||0)),
   kcal:Number(x.kcal)||0,
   protein_g:Number(x.protein_g)||0,
   carbs_g:Number(x.carbs_g)||0,
   fat_g:Number(x.fat_g)||0,
   preparation:String(x.preparation||"").slice(0,80),
   ingredient_role:["main","side","mixed","garnish"].includes(String(x.ingredient_role||"").toLowerCase())?String(x.ingredient_role).toLowerCase():"side",
   needs_confirmation:!!x.needs_confirmation || Math.max(0,Math.min(1,Number(x.confidence)||0))<0.72,
   visual_description:String(x.visual_description||"").slice(0,140)
  })).filter((x:any)=>x.name);
  analysis.overall_confidence=Math.max(0,Math.min(1,Number(analysis.overall_confidence)||0));
  analysis.notes=String(analysis.notes||"").slice(0,280);
  return new Response(JSON.stringify({analysis}),{headers:{...cors,"Content-Type":"application/json"}});
 }catch(e){return new Response(JSON.stringify({error:String(e?.message||e)}),{status:400,headers:{...cors,"Content-Type":"application/json"}})}
});
