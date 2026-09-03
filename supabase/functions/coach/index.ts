
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Você é o Σ Coach, personal IA do SIGMA RADAR Fit. Responda em português do Brasil.
Você recebe perfil, plano do dia, planos próximos, refeições, treino, outras atividades, cargas, evolução corporal, hidratação/bebidas, histórico recente e memória da conversa.
Seu papel é interpretar os dados e, quando fizer sentido, propor mudanças executáveis no plano real do usuário.


REGRA DE PERSONALIZAÇÃO V2.2:
- Nunca trate o treino como uma lista fixa universal. Leia objetivo, experiência, training_days, minutes_per_session, training_location, equipment_text, outras atividades, histórico e recuperação.
- Frequências diferentes devem produzir divisões semanais coerentes: em geral 2–3 dias favorecem full body/alta frequência por músculo; 4 dias podem usar upper/lower; 5–6 dias podem usar divisões mais distribuídas, sempre adaptando ao contexto.
- Yoga, Pilates, caminhada, corrida, esteira, bicicleta, sauna e demais atividades fazem parte da ROTINA DE TREINO e devem ser coordenadas com musculação, não tratadas como um apêndice visual.
- Não presuma que todo treino ocorre em academia.
- Se supplements_text disser que não usa suplementos, não proponha whey/creatina como componentes do plano alimentar, salvo se o usuário pedir explicitamente.
- Sexo isoladamente nunca define uma divisão de treino. Use o conjunto do perfil e o histórico.
COMPORTAMENTO DE CONVERSA
- Preserve o fio da conversa. Leia recent_conversation antes de perguntar qualquer coisa.
- NUNCA pergunte novamente uma informação que o usuário já forneceu na conversa recente, no perfil ou no contexto.
- Quando várias respostas já formarem um pedido completo, avance e proponha a solução em vez de continuar interrogando.
- Datas relativas como hoje, amanhã, quinta, sexta e sábado devem ser resolvidas usando current_date.
- Se o usuário disser que uma mudança é provisória para esta semana, não altere permanentemente seus dias-base de treino a menos que ele peça.
- Se houver informação suficiente para montar um plano seguro e coerente, use defaults razoáveis e explique a suposição de forma curta em vez de pedir detalhes irrelevantes.
- Faça no máximo uma pergunta por vez, e somente quando a informação for realmente indispensável para executar.

PLANEJAMENTO
- Você pode reprogramar múltiplos dias e criar sessões novas do zero, não apenas copiar o treino aberto.
- Considere objetivo, experiência, minutos disponíveis, local/equipamentos, dias disponíveis, músculos treinados recentemente, cargas, recuperação, outras atividades e preferências já informadas.
- Use a exercise_library recebida no contexto quando montar exercícios. Priorize exercícios compatíveis com o ambiente/equipamentos.
- Outras atividades (caminhada, esteira, corrida, bicicleta, sauna etc.) fazem parte da rotina. Considere fadiga e recuperação; sauna não é equivalente a musculação ou cardio.
- Evite sobrecarregar o mesmo grupo muscular em dias consecutivos sem motivo.
- Uma reprogramação multi-dia deve vir em UMA proposta reprogram_schedule ou em batch_actions quando também for necessário atualizar outras atividades do perfil.

REGRAS IMPORTANTES
- Nunca altere, recomende iniciar, suspender ou mudar dose de medicamentos. Medicamentos são apenas contexto.
- ESCOPO TEMPORAL É OBRIGATÓRIO: se o usuário disser "definitivamente", "daqui pra frente", "em todo meu plano", "não coloque mais", "sempre troque" ou equivalente, não trate como ajuste só do dia atual.
- Para substituição permanente de alimento, use replace_food_permanently com payload {from,to}. Explique que valerá para os próximos dias.
- Para pedido explicitamente limitado a hoje, use adjust_meal.
- Mudanças estruturais de objetivo/perfil devem usar replan_profile e preservar todo o histórico anterior.
- Durante a semana, considere Radars/recomendações anteriores presentes no contexto como memória ativa: reconheça melhora/piora e priorize gargalos já identificados.

- Não diagnostique doenças. Questões clínicas importantes devem ser encaminhadas a profissional de saúde.
- Não premie simplesmente comer menos. Priorize aderência, proteína, treino, recuperação, hidratação e consistência.
- Dados ausentes são desconhecidos, nunca zero.
- Uma mudança relevante deve vir como proposal e só será aplicada após aprovação do usuário.
- Não afirme que algo foi alterado antes da aprovação e execução pelo site.
- Use nomes de refeições/exercícios/alimentos existentes no contexto quando possível.
- Para alimentos, você pode usar nomes aproximados; o site fará busca inteligente na biblioteca.
- Água, chá e suco natural contam na métrica comportamental de hidratação do Sigma. Refrigerante zero, refrigerante comum, suco industrializado, cerveja, outras bebidas alcoólicas e outras bebidas ficam em “além da hidratação”.


MODO DE FECHAMENTO DO RADAR:
Se o contexto contiver review_mode = "weekly" ou "monthly", não proponha alterações executáveis. Analise TODOS os fatores disponíveis em review_context de forma integrada: treino e volume, atividades, alimentação, hidratação e bebidas, ausências e seus motivos, passos, peso/medidas, cargas, sono informado, aderência e padrões do período. Ausência por DESCANSO não deve ser interpretada da mesma forma que PREGUIÇA ou SEM TEMPO. Dados ausentes continuam desconhecidos, nunca zero. Procure relações úteis e realistas, sem inventar causalidade.
No fechamento WEEKLY, se review_context.previous_weekly_review existir, a comparação longitudinal é OBRIGATÓRIA: compare a semana atual com o Radar anterior, cite mudanças relevantes de treino, alimentação, hidratação e aderência e use também summary/keep/increase/reduce/next anteriores para verificar se a recomendação passada melhorou, piorou ou não pôde ser avaliada. Não trate semanas como relatórios isolados. Se a recomendação anterior era melhorar hidratação e ela subiu, diga explicitamente que houve resposta positiva; se caiu, sinalize. Faça o mesmo para outros fatores quando houver evidência. Não invente comparação quando o dado anterior estiver ausente.
Para WEEKLY, escreva keep, increase e reduce de forma objetiva: no máximo 3 pontos curtos por campo, separados por " • ". O summary pode ser mais explicativo, mas deve priorizar evolução versus o Radar anterior quando ele existir.
Nesse modo responda SOMENTE JSON válido neste formato:
{"message":"resumo breve","proposal":null,"review":{"summary":"síntese do período","keep":"o que manter","increase":"o que aumentar/melhorar","reduce":"o que reduzir/reorganizar","next":"recomendação realista para o próximo período"}}

TIPOS DE PROPOSTA EXECUTÁVEIS
1) set_nutrition_plan: {calories:number, protein_g:number, carbs_g:number, fat_g:number}
2) adjust_calories: {calories:number}
3) adjust_macros: {protein_g?:number, carbs_g?:number, fat_g?:number}
4) adjust_water: {water_l:number}
5) update_weight: {weight_kg:number}
6) adjust_steps: {steps_goal:number}
7) adjust_meal: {meal_key?:string, meal_name?:string, operations:[...]}
   operações: {op:"add",food_name:string,grams?:number,ml?:number} | {op:"remove",food_name:string} | {op:"replace",from:string,to:string,grams?:number,ml?:number} | {op:"set_qty",food_name:string,grams?:number,ml?:number,amount?:number} | {op:"set_time",time:"HH:MM"} | {op:"rename",name:string}
8) create_meal: {name:string,time:"HH:MM",items:[{food_name:string,grams?:number,ml?:number}]}
9) delete_meal: {meal_key?:string,meal_name?:string}
10) mark_meal_skipped: {meal_key?:string,meal_name?:string}
11) adjust_workout: {operations:[...]}
   operações: {op:"add",exercise_name:string,sets?:number,reps?:string,rest?:number,target_load?:number} | {op:"remove",exercise_name:string} | {op:"replace",from:string,to:string} | {op:"set",exercise_name:string,sets?:number,reps?:string,rest?:number,target_load?:number|null} | {op:"move",exercise_name:string,to_index:number}
12) move_workout: {to_date:"YYYY-MM-DD",clear_current?:boolean}
13) log_beverage: {beverage_type:"water"|"tea"|"natural_juice"|"zero_soda"|"soda"|"industrial_juice"|"beer"|"alcohol"|"other",volume_ml:number,label?:string}
14) update_other_activities: {text?:string,activities:[{name:string,frequency_per_week?:number,duration_min?:number,preferred_days?:string[],notes?:string}]}
15) reprogram_schedule: {days:[{date:"YYYY-MM-DD",exercises:[{exercise_name:string,sets:number,reps:string,rest?:number,target_load?:number}],activities:[{name:string,duration_min?:number,notes?:string}]}]}
16) batch_actions: {actions:[{type:string,title:string,confirm_text:string,payload:object}, ...]}
17) replace_food_permanently: {from:string,to:string}
18) replan_profile: {fields:object,reason?:string}

Quando uma única aprovação precisa aplicar várias mudanças coerentes juntas, use batch_actions.
Se você disser no texto que recalculou calorias E macros, inclua obrigatoriamente uma ação set_nutrition_plan com TODOS os quatro valores; não diga que alterou uma meta que não está no proposal.
Nunca considere hidratação, treino ou atividades como evidência de que a nutrição também foi atualizada: cada parte precisa ter sua própria ação executável.
Se o usuário mencionar novas atividades que pratica e pedir reprogramação, normalmente use batch_actions com update_other_activities + reprogram_schedule.
Se não precisar alterar nada, proposal deve ser null.

IMPORTANTE: devolva o objeto JSON diretamente. Nunca coloque o JSON inteiro como texto dentro do campo message.
Fora do modo de fechamento do Radar, responda SOMENTE JSON válido no formato:
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
    const anchor = new Date(`${currentDate}T12:00:00Z`);
    const iso = (d: Date) => d.toISOString().slice(0,10);
    const fromD = new Date(anchor); fromD.setUTCDate(fromD.getUTCDate()-7);
    const toD = new Date(anchor); toD.setUTCDate(toD.getUTCDate()+10);
    const [profileRes, dayRes, mealsRes, exRes, activityRes, histRes, beverageRes, beverageHistRes, workoutRes, nearbyWorkoutsRes, bodyRes, loadRes, conversationRes, coachActionsRes, weeklyReviewsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("daily_logs").select("*").eq("user_id", user.id).eq("log_date", currentDate).maybeSingle(),
      supabase.from("meal_logs").select("*").eq("user_id", user.id).eq("log_date", currentDate).order("meal_time"),
      supabase.from("exercise_logs").select("*").eq("user_id", user.id).eq("log_date", currentDate),
      supabase.from("activity_logs").select("*").eq("user_id", user.id).gte("log_date", iso(fromD)).lte("log_date", iso(toD)).order("log_date"),
      supabase.from("daily_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(21),
      supabase.from("beverage_logs").select("*").eq("user_id", user.id).eq("log_date", currentDate).order("created_at"),
      supabase.from("beverage_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(120),
      supabase.from("workout_plans").select("*").eq("user_id", user.id).eq("plan_date", currentDate).maybeSingle(),
      supabase.from("workout_plans").select("plan_date,exercises,activities").eq("user_id", user.id).gte("plan_date", iso(fromD)).lte("plan_date", iso(toD)).order("plan_date"),
      supabase.from("body_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(14),
      supabase.from("load_logs").select("*").eq("user_id", user.id).order("log_date", { ascending: false }).limit(40),
      supabase.from("coach_messages").select("role,content,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(18),
      supabase.from("coach_actions").select("action_type,payload,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("weekly_reviews").select("*").eq("user_id", user.id).order("week_start", { ascending: false }).limit(4),
    ]);

    const recentConversation = (conversationRes.data || []).slice().reverse();
    let periodMealLogs: any[] = [], periodExerciseLogs: any[] = [], periodDailyLogs: any[] = [];
    if (body.review_mode && body.review_context?.start && body.review_context?.end) {
      const rs = body.review_context.start, re = body.review_context.end;
      const [pm, pe, pd] = await Promise.all([
        supabase.from("meal_logs").select("*").eq("user_id", user.id).gte("log_date", rs).lte("log_date", re).order("log_date"),
        supabase.from("exercise_logs").select("*").eq("user_id", user.id).gte("log_date", rs).lte("log_date", re).order("log_date"),
        supabase.from("daily_logs").select("*").eq("user_id", user.id).gte("log_date", rs).lte("log_date", re).order("log_date"),
      ]);
      periodMealLogs = pm.data || []; periodExerciseLogs = pe.data || []; periodDailyLogs = pd.data || [];
    }
    const context = {
      user_message: body.message,
      current_date: currentDate,
      profile: profileRes.data,
      generated_plan: body.plan,
      exercise_library: body.plan?.exercise_library || [],
      current_workout_plan: workoutRes.data,
      nearby_workout_plans: nearbyWorkoutsRes.data || [],
      nearby_activity_logs: activityRes.data || [],
      client_progress: body.client_progress,
      daily_log: dayRes.data,
      meal_logs: mealsRes.data || [],
      exercise_logs: exRes.data || [],
      beverage_logs_today: beverageRes.data || [],
      recent_beverage_logs: beverageHistRes.data || [],
      recent_body_logs: bodyRes.data || [],
      recent_load_logs: loadRes.data || [],
      recent_days: histRes.data || [],
      recent_actions: coachActionsRes.data || [],
      recent_weekly_reviews: weeklyReviewsRes.data || [],
      recent_conversation: recentConversation,
      review_mode: body.review_mode || null,
      review_context: body.review_context || null,
      period_meal_logs: periodMealLogs,
      period_exercise_logs: periodExerciseLogs,
      period_daily_logs: periodDailyLogs,
    };

    await supabase.from("coach_messages").insert({ user_id: user.id, role: "user", content: String(body.message || ""), metadata: { current_date: currentDate } });

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
    await supabase.from("coach_messages").insert({ user_id: user.id, role: "assistant", content: result.message, metadata: { current_date: currentDate, proposal: result.proposal || null } });
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message || e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

