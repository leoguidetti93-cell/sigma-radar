const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
let user={}, qi=0, water=0, completedEx=new Set(), completedMeals=new Set(), selectedFoods=new Set(), foodFilter="all";
const questions=[
 {key:"goal",q:"Para começar: o que você quer conquistar agora?",sub:"Não existe resposta certa. Isso define o ponto de partida do seu Radar.",opts:[["loss","Emagrecer / perder gordura"],["recomp","Recomposição corporal"],["gain","Ganhar massa muscular"],["fitness","Melhorar condicionamento"]]},
 {key:"weight",q:"Qual é o seu peso atual?",sub:"Pode informar com uma casa decimal.",input:"kg"},
 {key:"target",q:"E qual peso você gostaria de alcançar?",sub:"Isso é uma referência inicial; o plano poderá ser ajustado.",input:"kg"},
 {key:"height",q:"Qual é a sua altura?",input:"cm"},
 {key:"age",q:"Quantos anos você tem?",input:"anos"},
 {key:"days",q:"Quantos dias por semana você consegue treinar de verdade?",sub:"Prefiro uma resposta realista a uma semana perfeita que não existe.",opts:[["2","2 dias"],["3","3 dias"],["4","4 dias"],["5","5 dias"],["6","6 dias"]]},
 {key:"level",q:"Como você descreveria sua experiência com musculação?",opts:[["beginner","Estou começando"],["intermediate","Já treino há algum tempo"],["advanced","Treino de forma consistente há anos"]]},
 {key:"med",conditional:()=>user.goal==="loss",q:"Você usa atualmente algum medicamento para controle de peso?",sub:"Isso serve para contextualizar apetite e tolerância alimentar. O Sigma não altera nem orienta medicação.",opts:[["none","Não uso"],["tirzepatide","Tirzepatida (ex.: Mounjaro)"],["semaglutide","Semaglutida"],["other","Outro"]]},
 {key:"appetite",conditional:()=>user.goal==="loss"&&user.med&&user.med!=="none",q:"Desde que começou, como ficou seu apetite?",opts:[["normal","Praticamente normal"],["lower","Menor que antes"],["verylow","Muito reduzido"]]},
 {key:"bigMeals",conditional:()=>user.goal==="loss"&&user.med&&user.med!=="none",q:"Refeições grandes passaram a incomodar?",opts:[["no","Não"],["sometimes","Às vezes"],["yes","Sim, bastante"]]},
 {key:"meals",q:"Quantas refeições combinam melhor com a sua rotina?",opts:[["3","3 refeições"],["4","4 refeições"],["5","5 refeições"],["flex","Prefiro que o Sigma sugira"]]},
 {key:"sleep",q:"Em média, quantas horas você dorme por noite?",opts:[["5","5h ou menos"],["6","Por volta de 6h"],["7","Por volta de 7h"],["8","8h ou mais"]]},
 {key:"done",q:"Última pergunta: você prefere seguir um plano pronto ou ter liberdade para trocar alimentos e refeições?",opts:[["guided","Quero um plano pronto"],["flexible","Quero plano + liberdade para trocar"],["custom","Prefiro montar boa parte sozinho"]]}
];
function show(id){$$(".screen").forEach(x=>x.classList.remove("active"));$("#"+id).classList.add("active");scrollTo(0,0)}
function openAuth(){show("auth")}
function startInterview(){user.name=$("#name").value||"Leonardo";user.email=$("#email").value;qi=0;show("interview");renderQ()}
function validIndex(i){while(i<questions.length&&questions[i].conditional&&!questions[i].conditional())i++;return i}
function renderQ(){qi=validIndex(qi);let q=questions[qi];$("#count").textContent=`${qi+1} / ${questions.length}`;$("#bar").style.width=((qi+1)/questions.length*100)+"%";$("#chat").innerHTML=`<div class="bubble">${q.q}${q.sub?`<p>${q.sub}</p>`:""}</div>`;let a=$("#answers");a.innerHTML="";
 if(q.opts){a.innerHTML=`<div class="answerGrid">${q.opts.map(o=>`<button onclick="answer('${o[0]}')">${o[1]}</button>`).join("")}</div>`}
 else if(q.input){a.innerHTML=`<div class="answerInput"><input id="qInput" type="number" step=".1" autofocus placeholder="Digite aqui"><button onclick="answer($('#qInput').value)">CONTINUAR →</button></div>`;setTimeout(()=>$("#qInput").focus(),50)}
 $("#backQ").style.visibility=qi?"visible":"hidden"}
function answer(v){if(v===""||v==null)return;user[questions[qi].key]=v;if(questions[qi].key==="done"){buildPlan();return}qi++;renderQ()}
function prevQ(){qi=Math.max(0,qi-1);while(qi>0&&questions[qi].conditional&&!questions[qi].conditional())qi--;renderQ()}
function buildPlan(){show("building");setTimeout(()=>$("#buildLine").textContent="Organizando treino, metas e refeições... ",700);setTimeout(()=>{show("app");initApp()},1800)}
const imgs={
 "Supino reto":"https://images.pexels.com/photos/39077979/pexels-photo-39077979.jpeg?auto=compress&cs=tinysrgb&w=900",
 "Puxada alta":"https://images.pexels.com/photos/29218860/pexels-photo-29218860.jpeg?auto=compress&cs=tinysrgb&w=900",
 "Agachamento":"https://images.pexels.com/photos/20240046/pexels-photo-20240046.jpeg?auto=compress&cs=tinysrgb&w=900",
 "Remada baixa":"https://images.pexels.com/photos/3838700/pexels-photo-3838700.jpeg?auto=compress&cs=tinysrgb&w=900",
 "Rosca direta":"https://images.pexels.com/photos/5327556/pexels-photo-5327556.jpeg?auto=compress&cs=tinysrgb&w=900",
 "Tríceps corda":"https://images.pexels.com/photos/7293696/pexels-photo-7293696.jpeg?auto=compress&cs=tinysrgb&w=900"
};
const ex=[
 ["Supino reto","PEITORAL • TRÍCEPS","4 × 8–10","Escápulas estáveis, pés firmes e descida controlada."],
 ["Puxada alta","COSTAS • BÍCEPS","4 × 8–12","Conduza os cotovelos para baixo e mantenha o tórax aberto."],
 ["Remada baixa","COSTAS","3 × 10–12","Tronco estável e contração controlada no final do movimento."],
 ["Agachamento","PERNAS • GLÚTEOS","4 × 8–10","Desça dentro da sua mobilidade mantendo controle e estabilidade."],
 ["Rosca direta","BÍCEPS","3 × 10–12","Evite balanço; mantenha os cotovelos estáveis."],
 ["Tríceps corda","TRÍCEPS","3 × 12–15","Estenda os cotovelos com controle e sem movimentar os ombros."]
];
let meals=[
 ["07:30","Café da manhã","Ovos + pão integral + fruta","430 kcal • 31g proteína"],
 ["12:30","Almoço","Frango grelhado + arroz + feijão + salada","650 kcal • 52g proteína"],
 ["16:30","Pré / pós-treino","Iogurte proteico + banana + aveia","360 kcal • 28g proteína"],
 ["20:30","Jantar","Tilápia + batata + legumes","570 kcal • 49g proteína"]
];
const foods=[
 ["Frango grelhado","protein","100g • 165 kcal • 31g prot"],["Tilápia","protein","100g • 128 kcal • 26g prot"],["Patinho moído","protein","100g • 219 kcal • 27g prot"],["Ovos","protein","2 un • 140 kcal • 12g prot"],["Whey protein","protein","30g • 120 kcal • 23g prot"],
 ["Arroz branco","carb","100g • 130 kcal"],["Batata inglesa","carb","150g • 116 kcal"],["Batata-doce","carb","150g • 129 kcal"],["Aveia","carb","40g • 152 kcal"],
 ["Banana","fruit","1 un • 89 kcal"],["Maçã","fruit","1 un • 72 kcal"],["Morango","fruit","150g • 48 kcal"],
 ["Iogurte proteico","dairy","1 un • 130 kcal • 15g prot"],["Leite desnatado","dairy","250ml • 88 kcal • 8g prot"],["Queijo cottage","dairy","100g • 98 kcal • 11g prot"]
];
function initApp(){let first=user.name.split(" ")[0];$("#hello").textContent=`BOA TARDE, ${first.toUpperCase()}.`;$("#avatar").textContent=user.name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
 let w=+user.weight||98, kcal=Math.round((w*24*1.45-(user.goal==="loss"?500:0))/50)*50, prot=Math.round(w*2);$("#calTarget").textContent=kcal.toLocaleString("pt-BR")+" KCAL";$("#protTarget").textContent=`Meta • ${prot}g proteína`;$("#nutHeadline").textContent=`${kcal.toLocaleString("pt-BR")} kcal • ${prot}g proteína`;
 if(user.med&&user.med!=="none"&&(user.appetite==="lower"||user.appetite==="verylow"))$("#coachFirst").textContent="Seu apetite reduzido entrou no contexto do plano.";
 renderExercises();renderMeals();updateProgress()}
function renderExercises(){$("#exerciseList").innerHTML=ex.map((e,i)=>`<article class="exercise ${completedEx.has(i)?"done":""}"><img src="${imgs[e[0]]}" alt="${e[0]}"><div class="exerciseInfo" onclick="openExercise(${i})"><span>${e[1]}</span><h3>${e[0]}</h3><p>${e[2]} • toque para ver execução</p></div><button class="check" onclick="toggleEx(${i})">${completedEx.has(i)?"✓":""}</button></article>`).join("")}
function toggleEx(i){completedEx.has(i)?completedEx.delete(i):completedEx.add(i);renderExercises();updateProgress()}
function completeAllExercises(){ex.forEach((_,i)=>completedEx.add(i));renderExercises();updateProgress()}
function openExercise(i){let e=ex[i];$("#modalImg").src=imgs[e[0]];$("#modalMuscle").textContent=e[1];$("#modalName").textContent=e[0];$("#modalSets").textContent=e[2];$("#modalHow").textContent=e[3];$("#modalComplete").onclick=()=>{completedEx.add(i);closeModal();renderExercises();updateProgress()};$("#exerciseModal").classList.add("active")}
function closeModal(){$("#exerciseModal").classList.remove("active")}
function renderMeals(){$("#mealList").innerHTML=meals.map((m,i)=>`<article class="meal ${completedMeals.has(i)?"done":""}"><span>${m[0]}</span><div><h3>${m[1]}</h3><p>${m[2]} • ${m[3]}</p></div><button class="check" onclick="toggleMeal(${i})">${completedMeals.has(i)?"✓":""}</button></article>`).join("")}
function toggleMeal(i){completedMeals.has(i)?completedMeals.delete(i):completedMeals.add(i);renderMeals();updateProgress()}
function addWater(){water=Math.min(3.4,water+.3);$("#water").textContent=`${water.toFixed(1).replace(".",",")} / 3,4 L`;updateProgress()}
function updateProgress(){let exP=completedEx.size/ex.length, mealP=completedMeals.size/meals.length, waterP=water/3.4, total=Math.round((exP*.45+mealP*.4+waterP*.15)*100);$("#dayScore").textContent=total;$("#trainDone").textContent=`${completedEx.size}/${ex.length} concluídos →`;$("#mealDone").textContent=`${completedMeals.size}/${meals.length} refeições →`;$("#pToday").textContent=total+"%";$("#pMeals").textContent=completedMeals.size}
$$(".tab").forEach(b=>b.onclick=()=>{$$(".tab").forEach(x=>x.classList.remove("active"));b.classList.add("active");$$(".view").forEach(v=>v.classList.remove("active"));$("#"+b.dataset.v).classList.add("active")});
$$(".switch button").forEach(b=>b.onclick=()=>{gotoPlan(b.dataset.p)});
function gotoPlan(p){$$(".tab").forEach(x=>x.classList.toggle("active",x.dataset.v==="plan"));$$(".view").forEach(v=>v.classList.toggle("active",v.id==="plan"));$$(".switch button").forEach(x=>x.classList.toggle("active",x.dataset.p===p));$("#trainingPanel").classList.toggle("active",p==="training");$("#nutritionPanel").classList.toggle("active",p==="nutrition");scrollTo(0,0)}
function openBuilder(){$("#builder").classList.add("active");renderFoods()}
function closeBuilder(){$("#builder").classList.remove("active")}
$$(".filters button").forEach(b=>b.onclick=()=>{foodFilter=b.dataset.f;$$(".filters button").forEach(x=>x.classList.toggle("active",x===b));renderFoods()});
function renderFoods(){let q=($("#foodSearch")?.value||"").toLowerCase();$("#foods").innerHTML=foods.map((f,i)=>({f,i})).filter(x=>(foodFilter==="all"||x.f[1]===foodFilter)&&x.f[0].toLowerCase().includes(q)).map(x=>`<div class="food ${selectedFoods.has(x.i)?"selected":""}" onclick="toggleFood(${x.i})"><div><span>${x.f[0]}</span><small>${x.f[2]}</small></div><b>${selectedFoods.has(x.i)?"✓":"+"}</b></div>`).join("");$("#selectedCount").textContent=`${selectedFoods.size} itens selecionados`}
function toggleFood(i){selectedFoods.has(i)?selectedFoods.delete(i):selectedFoods.add(i);renderFoods()}
function saveCustomMeal(){if(!selectedFoods.size)return;let names=[...selectedFoods].map(i=>foods[i][0]).join(" + ");meals.push(["—","Minha refeição",names,"Personalizada"]);selectedFoods.clear();closeBuilder();renderMeals();updateProgress()}
