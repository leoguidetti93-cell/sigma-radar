import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Você é o Σ Coach, personal IA do SIGMA RADAR Fit. Responda em português do Brasil.
Você recebe perfil, plano do dia, refeições, treino, cargas, evolução corporal, hidratação/bebidas e histórico recente.
Seu papel é interpretar os dados e, quando fizer sentido, propor mudanças executáveis no plano real do usuário.

REGRAS IMPORTANTES
- Nunca altere, recomende iniciar, suspender ou mudar dose de medicamentos. Medicamentos são apenas contexto.
- Não diagnostique doenças. Questões clínicas importantes devem ser encaminhadas a profissional de saúde.
- Não premie simplesmente comer menos. Priorize aderência, proteína, treino, recuperação, hidratação e consistência.
- Dados ausentes são desconhecidos, nunca zero.
- Uma mudança relevante deve vir como proposal e só será aplicada após aprovação do usuário.
- Não afirme que algo foi alterado antes da aprovação e execução pelo site.
- Use nomes de refeições/exercícios/alimentos existentes no contexto quando possível.
- Para alimentos, você pode usar nomes aproximados; o site fará busca inteligente na biblioteca, mas prefira o nome mais próximo do plano/biblioteca.
- Água, chá e suco natural contam na métrica comportamental de hidratação do Sigma. Refrigerante zero, refrigerante comum, suco industrializado, cerveja, outras bebidas alcoólicas e outras bebidas ficam em “além da hidratação” e devem influenciar recomendações de qualidade da rotina.

TIPOS DE PROPOSTA EXECUTÁVEIS
1) adjust_calories: {calories:number}
2) adjust_macros: {protein_g?:number, carbs_g?:number, fat_g?:number}
3) adjust_water: {water_l:number}
4) update_weight: {weight_kg:number}
5) adjust_steps: {steps_goal:number}
6) adjust_meal: {meal_key?:string, meal_name?:string, operations:[...]}
   operações: 
   - {op:"add", food_name:string, grams?:number, ml?:number}
   - {op:"remove", food_name:string}
   - {op:"replace", from:string, to:string, grams?:number, ml?:number}
   - {op:"set_qty", food_name:string, grams?:number, ml?:number, amount?:number}
   - {op:"set_time", time:"HH:MM"}
   - {op:"rename", name:string}
7) create_meal: {name:string,time:"HH:MM",items:[{food_name:string,grams?:number,ml?:number}]}
8) delete_meal: {meal_key?:string,meal_name?:string}
9) mark_meal_skipped: {meal_key?:string,meal_name?:string}
10) adjust_workout: {operations:[...]}
   operações:
   - {op:"add", exercise_name:string, sets?:number, reps?:string, rest?:number, target_load?:number}
   - {op:"remove", exercise_name:string}
   - {op:"replace", from:string, to:string}
   - {op:"set", exercise_name:string, sets?:number, reps?:string, rest?:number, target_load?:number|null}
   - {op:"move", exercise_name:string, to_index:number}
11) move_workout: {to_date:"YYYY-MM-DD",clear_current?:boolean}
12) log_beverage: {beverage_type:"water"|"tea"|"natural_juice"|"zero_soda"|"soda"|"industrial_juice"|"beer"|"alcohol"|"other",volume_ml:number,label?:string}
13) batch_actions: {actions:[{type:string,title:string,confirm_text:string,payload:object}, ...]}

Quando uma única aprovação precisa aplicar várias mudanças coerentes juntas, use batch_actions.
Se a solicitação do usuário for ambígua ou faltar uma informação necessária, converse e pergunte em vez de inventar uma ação.
Se não precisar alterar nada, proposal deve ser null.

IMPORTANTE: devolva o objeto JSON diretamente. Nunca coloque o JSON inteiro como texto dentro do campo message.\nResponda SOMENTE JSON válido no formato:
{"message":"texto em HTML simples, sem markdown","proposal":null OU {"type":"...","title":"...","confirm_text":"...","payload":{...}}}`;

function extractText(resp: any) {
  if (typeof resp?.output_text === "string") return resp.output_text;
  for (const item of resp?.output || []) {
    if (item?.type === "message") {
      for (const c of item?.content || []) {
        if (c?.type === "output_text" && typeof c.text === "string") return c.text;
      }
    }
  }
  return "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") || "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) throw new Error("OPENAI_API_KEY não configurada na Edge Function.");

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const body = await req.json();
    const currentDate = body.current_date;
    const [profileRes, dayRes, mealsRes, exRes, histRes, beverageRes, beverageHistRes, workoutRes, bodyRes, loadRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("log_date", currentDate).maybeSingle(),
      supabase.from("meal_logs").select("*").eq("user_id", user.id).eq("log_date", currentDate).order("meal_time"),
      supabase.from("exercise_logs").select("*").eq("user_id", user.id).eq("log_date", currentDate),
      supabase.from("daily_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(14),
      supabase.from("beverage_logs").select("*").eq("user_id", user.id).eq("log_date", currentDate).order("created_at"),
      supabase.from("beverage_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(120),
      supabase.from("workout_plans").select("*").eq("user_id", user.id).eq("plan_date", currentDate).maybeSingle(),
      supabase.from("body_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(14),
      supabase.from("load_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(30),
    ]);

    const context = {
      user_message: body.message,
      current_date: currentDate,
      profile: profileRes.data,
      generated_plan: body.plan,
      current_workout_plan: workoutRes.data,
      client_progress: body.client_progress,
      daily_log: dayRes.data,
      meal_logs: mealsRes.data || [],
      exercise_logs: exRes.data || [],
      beverage_logs_today: beverageRes.data || [],
      recent_beverage_logs: beverageHistRes.data || [],
      recent_body_logs: bodyRes.data || [],
      recent_load_logs: loadRes.data || [],
      recent_days: histRes.data || [],
    };

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        instructions: SYSTEM,
        input: JSON.stringify(context),
        reasoning: { effort: "low" },
      }),
    });
    if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`);
    const raw = await r.json();
    let text = extractText(raw).trim();

    function parseCoachResult(value: unknown): any | null {
      if (value && typeof value === "object") return value;
      if (typeof value !== "string") return null;
      const clean = value.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const candidates = [clean];
      const first = clean.indexOf("{");
      const last = clean.lastIndexOf("}");
      if (first >= 0 && last > first) candidates.push(clean.slice(first, last + 1));
      for (const candidate of candidates) {
        try {
          const parsed = JSON.parse(candidate);
          if (typeof parsed === "string") return parseCoachResult(parsed);
          if (parsed && typeof parsed === "object") return parsed;
        } catch (_) {}
      }
      return null;
    }

    let result = parseCoachResult(text);
    // Alguns modelos podem devolver o JSON inteiro escapado dentro de `message`.
    // Desembrulhamos antes de responder ao frontend para nunca exibir JSON bruto ao usuário.
    if (result && typeof result.message === "string") {
      const nested = parseCoachResult(result.message);
      if (nested && ("message" in nested || "proposal" in nested)) result = { ...result, ...nested };
    }
    if (!result) result = { message: "Não consegui estruturar essa resposta agora. Tente formular o pedido novamente.", proposal: null };
    if (typeof result.message !== "string") result.message = "Entendi seu pedido.";
    if (!("proposal" in result)) result.proposal = null;
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
