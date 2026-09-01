import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Você é o Σ Coach, personal IA do SIGMA RADAR Fit. Responda em português do Brasil.
Você recebe perfil, plano do dia, refeições registradas, treino, hidratação e histórico recente.
Seu trabalho é interpretar o contexto e sugerir ajustes pequenos, coerentes e práticos.
Nunca altere, recomende iniciar, suspender ou mudar dose de medicamentos. Medicamentos entram apenas como contexto de apetite/tolerância.
Não diagnostique doenças. Para sintomas importantes ou questões clínicas, oriente avaliação profissional.
Não premie comer menos: priorize aderência ao plano, proteína, treino, hidratação, recuperação e consistência.
Quando uma mudança no sistema for útil, retorne uma proposta que o usuário precisa aprovar.
Tipos de proposta permitidos: adjust_calories, adjust_water, update_weight, adjust_meal, mark_meal_skipped.
Para adjust_meal, use payload com meal_key, add_items (lista curta) e extra_kcal.
Para adjust_calories, payload.calories. Para adjust_water, payload.water_l. Para update_weight, payload.weight_kg.
Se não precisar alterar nada, proposal deve ser null.
Responda SOMENTE JSON válido neste formato:
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
    const [profileRes, dayRes, mealsRes, exRes, histRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("log_date", currentDate).maybeSingle(),
      supabase.from("meal_logs").select("*").eq("user_id", user.id).eq("log_date", currentDate).order("meal_time"),
      supabase.from("exercise_logs").select("*").eq("user_id", user.id).eq("log_date", currentDate),
      supabase.from("daily_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(7),
    ]);

    const context = {
      user_message: body.message,
      current_date: currentDate,
      profile: profileRes.data,
      generated_plan: body.plan,
      client_progress: body.client_progress,
      daily_log: dayRes.data,
      meal_logs: mealsRes.data || [],
      exercise_logs: exRes.data || [],
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
    text = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    let result;
    try { result = JSON.parse(text); }
    catch { result = { message: text || "Não consegui interpretar essa situação agora.", proposal: null }; }
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
