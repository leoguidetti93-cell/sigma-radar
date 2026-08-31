const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const store={
 get(k,d=null){try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},
 set(k,v){localStorage.setItem(k,JSON.stringify(v))}
};
let auth=store.get("sigma_auth");
let profile=store.get("sigma_profile");
let onboarding={goal:null,med:"none"};
let step=1;

function showOnly(id){
 ["publicArea","authPage","onboardingPage","analysisPage","appArea"].forEach(x=>$("#"+x).classList.remove("active"));
 if(id==="publicArea") $("#publicArea").style.display="block"; else {$("#publicArea").style.display="none";$("#"+id).classList.add("active")}
 scrollTo(0,0);
}
if(auth&&profile) {showOnly("appArea");initApp()} else showOnly("publicArea");

$$("[data-auth]").forEach(b=>b.onclick=()=>openAuth(b.dataset.auth));
function openAuth(tab){showOnly("authPage");setAuthTab(tab)}
$("#backPublic").onclick=()=>showOnly("publicArea");
$("#demoBtn").onclick=()=>{auth={name:"Demo Sigma",email:"demo@sigmaradar.com.br"};store.set("sigma_auth",auth);profile=demoProfile();store.set("sigma_profile",profile);showOnly("appArea");initApp()}
$$(".auth-tabs button").forEach(b=>b.onclick=()=>setAuthTab(b.dataset.tab));
function setAuthTab(t){$$(".auth-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.tab===t));$("#signupForm").classList.toggle("hidden",t!=="signup");$("#loginForm").classList.toggle("hidden",t!=="login")}
$("#signupForm").onsubmit=e=>{e.preventDefault();auth={name:$("#signupName").value.trim(),email:$("#signupEmail").value.trim(),pass:$("#signupPass").value};store.set("sigma_auth",auth);startOnboarding()}
$("#loginForm").onsubmit=e=>{e.preventDefault();const a=store.get("sigma_auth");if(a&&a.email===$("#loginEmail").value.trim()&&a.pass===$("#loginPass").value){auth=a;profile=store.get("sigma_profile"); if(profile){showOnly("appArea");initApp()}else startOnboarding()}else $("#loginError").textContent="E-mail ou senha não encontrados neste protótipo."}
function startOnboarding(){step=1;onboarding={goal:null,med:"none"};showOnly("onboardingPage");renderStep()}
function renderStep(){
 $$(".onboard-step").forEach(s=>s.classList.toggle("active",+s.dataset.step===step));
 $("#stepCounter").textContent=`${step} / 7`;$("#onboardProgress").style.width=`${step/7*100}%`;$("#prevStep").classList.toggle("hidden",step===1);$("#nextStep").textContent=step===7?"GERAR MEU PLANO Σ":"CONTINUAR →";
 if(step===7) buildReview()
}
$("#prevStep").onclick=()=>{if(step>1){step--;renderStep()}};
$("#nextStep").onclick=()=>{
 if(step===1&&!onboarding.goal){alert("Escolha seu objetivo para continuar.");return}
 if(step===7){generateProfile();return}
 if(step===3 && onboarding.goal!=="loss"){step=5;renderStep();return}
 step++;renderStep()
};
$$(".goal-grid button").forEach(b=>b.onclick=()=>{onboarding.goal=b.dataset.value;$$(".goal-grid button").forEach(x=>x.classList.toggle("selected",x===b))});
$$(".meds button").forEach(b=>b.onclick=()=>{onboarding.med=b.dataset.med;$$(".meds button").forEach(x=>x.classList.toggle("selected",x===b));$("#medExtra").classList.toggle("hidden",onboarding.med==="none")});
function buildReview(){
 const goalNames={loss:"Perder gordura",recomp:"Recomposição",gain:"Ganhar massa",fitness:"Condicionamento"};
 const medNames={none:"Não usa",tirzepatide:"Tirzepatida",semaglutide:"Semaglutida",other:"Outro medicamento"};
 $("#reviewBox").innerHTML=`
 <div><span>OBJETIVO</span><b>${goalNames[onboarding.goal]}</b></div>
 <div><span>PONTO DE PARTIDA</span><b>${$("#obWeight").value} kg → ${$("#obTarget").value} kg</b></div>
 <div><span>TREINO</span><b>${$("#obDays").value} dias • ${$("#obMinutes").value} min</b></div>
 <div><span>EXPERIÊNCIA</span><b>${$("#obLevel").value}</b></div>
 <div><span>ALIMENTAÇÃO</span><b>${$("#obMeals").value} refeições • ${$("#obDiet").value}</b></div>
 <div><span>MEDICAÇÃO</span><b>${onboarding.goal==="loss"?medNames[onboarding.med]:"Não aplicável ao fluxo atual"}</b></div>`
}
function generateProfile(){
 profile={
  name:auth.name, goal:onboarding.goal, age:+$("#obAge").value,sex:$("#obSex").value,height:+$("#obHeight").value,weight:+$("#obWeight").value,target:+$("#obTarget").value,fat:+$("#obFat").value||null,
  level:$("#obLevel").value,days:+$("#obDays").value,minutes:+$("#obMinutes").value,place:$("#obPlace").value,priority:$("#obPriority").value,cardio:+$("#obCardio").value,
  medication:onboarding.goal==="loss"?onboarding.med:"none",medDetails:$("#obMedDetails").value||"",appetite:$("#obAppetite").value,gi:$("#obGI").value,largeMeals:$("#obLargeMeals").value,
  meals:+$("#obMeals").value,diet:$("#obDiet").value,dislikes:$("#obDislikes").value,restrictions:$("#obRestrictions").value,dietChallenge:$("#obDietChallenge").value,currentWater:+$("#obWater").value,
  sleep:+$("#obSleep").value,sleepQuality:$("#obSleepQuality").value,stress:$("#obStress").value,steps:+$("#obSteps").value,limitations:$("#obLimitations").value,notes:$("#obNotes").value
 };
 store.set("sigma_profile",profile);
 showOnly("analysisPage");
 if(profile.medication!=="none") $("#medAnalysis").textContent="✓ Tolerância alimentar e contexto medicamentoso considerados";
 setTimeout(()=>{showOnly("appArea");initApp()},2100)
}
function demoProfile(){return {name:"Leonardo",goal:"loss",age:33,sex:"m",height:180,weight:97.4,target:90,fat:null,level:"Intermediário",days:4,minutes:60,place:"Academia completa",priority:"Peitoral + braços",cardio:3,medication:"tirzepatide",medDetails:"Exemplo demonstrativo",appetite:"Menor que antes",gi:"Não",largeMeals:"Um pouco",meals:4,diet:"Sem restrição específica",dislikes:"",restrictions:"",dietChallenge:"Organização",currentWater:2.5,sleep:7,sleepQuality:"Regular",stress:"Moderado",steps:8000,limitations:"",notes:""}}

function calcNutrition(){
 let bmr=10*profile.weight+6.25*profile.height-5*profile.age+(profile.sex==="m"?5:-161);
 let mult=profile.days>=5?1.65:profile.days>=3?1.52:1.4, kcal=bmr*mult;
 if(profile.goal==="loss") kcal-=550; if(profile.goal==="gain") kcal+=250;
 kcal=Math.max(1400,Math.round(kcal/50)*50);
 let prot=Math.round(profile.weight*(profile.goal==="gain"?1.8:2.0));
 let fat=Math.round(profile.weight*.7);
 let carb=Math.max(80,Math.round((kcal-prot*4-fat*9)/4));
 return {kcal,prot,fat,carb,water:Math.max(2.2,profile.weight*.035)}
}
function splitInfo(){if(profile.days<=3)return {key:"full",name:"FULL BODY",sessions:3};if(profile.days===4)return {key:"upper",name:"UPPER / LOWER",sessions:4};return {key:"ppl",name:"PUSH / PULL / LEGS",sessions:profile.days}}
const exerciseInfo={
 "Supino reto":["PEITORAL","4","6–10","Pressione mantendo escápulas firmes e controle a descida.","Abrir cotovelos demais ou perder estabilidade das escápulas.","Priorize amplitude controlada antes de aumentar a carga."],
 "Supino inclinado":["PEITORAL SUPERIOR","3","8–12","Banco moderadamente inclinado, descida controlada e peito aberto.","Inclinar demais o banco e transferir trabalho para o ombro.","Pense em aproximar os braços do centro do peito."],
 "Remada baixa":["COSTAS","4","8–12","Puxe com os cotovelos mantendo tronco estável.","Usar balanço para movimentar mais carga.","Segure brevemente a contração no final."],
 "Puxada alta":["DORSAIS","3","8–12","Leve os cotovelos para baixo e mantenha o tórax aberto.","Puxar atrás da nuca ou jogar o tronco excessivamente.","Conduza o movimento pelos cotovelos."],
 "Desenvolvimento":["OMBROS","3","8–10","Pressione acima da cabeça com abdômen firme.","Arquear excessivamente a lombar.","Use amplitude confortável e estável."],
 "Elevação lateral":["OMBROS","3","12–15","Eleve os braços com controle até uma amplitude confortável.","Usar embalo e carga excessiva.","Controle a descida por mais tempo."],
 "Rosca direta":["BÍCEPS","3","10–12","Mantenha cotovelos estáveis e flexione sem balanço.","Projetar ombros ou tronco para trás.","Reduza a carga se perder controle."],
 "Tríceps corda":["TRÍCEPS","3","10–15","Estenda os cotovelos e abra a corda ao final.","Movimentar os cotovelos para frente e para trás.","Mantenha tensão contínua."],
 "Agachamento":["PERNAS","4","6–10","Desça com controle, joelhos acompanhando os pés e tronco firme.","Perder estabilidade ou amplitude para usar mais carga.","A técnica vem antes da progressão de peso."],
 "Leg press":["PERNAS","4","10–12","Empurre mantendo quadril e lombar estáveis no encosto.","Descer além da mobilidade e arredondar a lombar.","Ajuste a amplitude ao seu controle."],
 "Mesa flexora":["POSTERIORES","3","10–15","Flexione os joelhos mantendo quadril apoiado.","Levantar o quadril para completar a repetição.","Faça a fase de retorno lentamente."],
 "Terra romeno":["POSTERIORES + GLÚTEOS","3","8–12","Leve o quadril para trás mantendo coluna neutra.","Transformar em agachamento ou arredondar a coluna.","Pare a descida quando perder tensão controlada."],
 "Panturrilha":["PANTURRILHAS","4","10–15","Faça amplitude completa com pausa em cima e embaixo.","Repetições curtas e rápidas.","Controle cada repetição."],
 "Prancha":["CORE","3","30–45s","Mantenha alinhamento e abdômen ativo.","Deixar quadril cair ou subir demais.","Qualidade da posição vale mais que tempo."],
};
function day(name,title,ex){return {name,title,ex}}
function workoutPlan(){
 const s=splitInfo();
 if(s.key==="full")return [
  day("SEGUNDA","Full Body A",["Agachamento","Supino reto","Remada baixa","Elevação lateral","Prancha"]),
  day("QUARTA","Full Body B",["Terra romeno","Supino inclinado","Puxada alta","Tríceps corda","Panturrilha"]),
  day("SEXTA","Full Body C",["Leg press","Supino reto","Remada baixa","Rosca direta","Prancha"])
 ];
 if(s.key==="upper")return [
  day("SEGUNDA","Upper A • Peito + Costas + Braços",["Supino reto","Remada baixa","Supino inclinado","Puxada alta","Rosca direta","Tríceps corda"]),
  day("QUARTA","Lower A • Quadríceps + Posteriores",["Agachamento","Leg press","Mesa flexora","Terra romeno","Panturrilha"]),
  day("QUINTA","Upper B • Costas + Ombros + Braços",["Puxada alta","Supino inclinado","Remada baixa","Desenvolvimento","Elevação lateral","Rosca direta"]),
  day("SEXTA","Lower B • Posteriores + Glúteos",["Terra romeno","Leg press","Mesa flexora","Agachamento","Panturrilha"])
 ];
 let p=[
  day("SEGUNDA","Push • Peito + Ombros + Tríceps",["Supino reto","Supino inclinado","Desenvolvimento","Elevação lateral","Tríceps corda"]),
  day("TERÇA","Pull • Costas + Bíceps",["Puxada alta","Remada baixa","Rosca direta","Prancha"]),
  day("QUARTA","Legs • Pernas completas",["Agachamento","Leg press","Terra romeno","Mesa flexora","Panturrilha"]),
  day("SEXTA","Upper • Ênfase de prioridade",["Supino inclinado","Remada baixa","Puxada alta","Elevação lateral","Rosca direta"]),
  day("SÁBADO","Lower + Core",["Leg press","Terra romeno","Mesa flexora","Panturrilha","Prancha"])
 ];return p.slice(0,profile.days)
}
function initApp(){
 if(!profile)return;
 const n=calcNutrition(),s=splitInfo();
 $("#helloName").textContent=`${profile.name.split(" ")[0].toUpperCase()}, SEU RADAR DE HOJE.`;
 $("#userChip").textContent=profile.name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
 const recovery=Math.min(95,Math.round(profile.sleep/8*82+(profile.stress==="Baixo"?8:profile.stress==="Moderado"?2:-8)));
 const train=Math.min(95,78+profile.days*2),nut=profile.medication!=="none"&&profile.appetite==="Muito reduzido"?72:82;
 const score=Math.round(train*.36+nut*.34+recovery*.30);
 $("#scoreValue").textContent=score;$("#mainRing").style.background=`conic-gradient(#00e6a8 0 ${score}%,#222832 ${score}% 100%)`;$("#scoreTraining").textContent=train;$("#scoreNutrition").textContent=nut;$("#scoreRecovery").textContent=recovery;
 $("#planType").textContent=s.name;$("#planDays").textContent=`${s.sessions}x / semana`;$("#planCardio").textContent=`${profile.cardio}x / semana`;$("#planCalories").textContent=`${n.kcal.toLocaleString("pt-BR")} kcal`;$("#planProtein").textContent=`${n.prot} g`;$("#planWater").textContent=`${n.water.toFixed(1).replace(".",",")} L`;
 $("#dailyWater").textContent=`0 / ${n.water.toFixed(1).replace(".",",")} L`;$("#dailyProtein").textContent=`0 / ${n.prot} g`;
 $("#strategyInsight").textContent=profile.goal==="loss"?"Déficit moderado + musculação estruturada.":profile.goal==="gain"?"Superávit controlado + progressão de treino.":"Treino consistente + alimentação ajustada à resposta.";
 if(profile.medication!=="none"){
  $("#medInsightTitle").textContent="Refeições menores podem ser mais confortáveis.";
  $("#medInsightText").textContent=`Seu perfil informa ${profile.appetite.toLowerCase()} apetite. O plano prioriza proteína distribuída e hidratação sem interferir no tratamento.`;
 }
 $("#trainSplit").textContent=s.name;$("#trainSessions").textContent=`${s.sessions} / semana`;$("#trainDuration").textContent=`~${profile.minutes} min`;$("#trainPriority").textContent=profile.priority;
 renderTraining();renderNutrition();renderProgress();renderProfile();
}
function renderTraining(){
 const box=$("#trainingDays");box.innerHTML="";
 workoutPlan().forEach(d=>{
  let art=document.createElement("article");art.className="training-day glass";art.innerHTML=`<div class="day-header"><div><span>${d.name}</span><b>${d.title}</b></div><small>${d.ex.length} exercícios</small></div><div class="exercise-grid">${d.ex.map(name=>{let e=exerciseInfo[name]||["GERAL","3","10–12","","",""];return `<div class="exercise-card" data-ex="${name}"><div class="exercise-thumb"></div><div class="exercise-meta-card"><span>${e[0]}</span><b>${name}</b><small>${e[1]} séries • ${e[2]} reps</small></div></div>`}).join("")}</div>`;box.appendChild(art)
 });
 $$(".exercise-card").forEach(c=>c.onclick=()=>openExercise(c.dataset.ex))
}
function openExercise(name){let e=exerciseInfo[name];$("#exGroup").textContent=e[0];$("#artMuscle").textContent=e[0];$("#exName").textContent=name;$("#exDesc").textContent=`Exercício selecionado pelo Training Engine para o seu plano inicial.`;$("#exSets").textContent=e[1];$("#exReps").textContent=e[2];$("#exExecution").textContent=e[3];$("#exError").textContent=e[4];$("#exTip").textContent=e[5];$("#exerciseModal").classList.add("active")}
$("#modalClose").onclick=()=>$("#exerciseModal").classList.remove("active");$("#exerciseModal").onclick=e=>{if(e.target===$("#exerciseModal"))$("#exerciseModal").classList.remove("active")};
function renderNutrition(){
 const n=calcNutrition();$("#nutCal").textContent=n.kcal.toLocaleString("pt-BR");$("#nutProt").textContent=n.prot;$("#nutCarb").textContent=n.carb;$("#nutFat").textContent=n.fat;$("#mealMode").textContent=`${profile.meals} REFEIÇÕES`;
 let medSmall=profile.medication!=="none" && (profile.appetite!=="Normal"||profile.largeMeals==="Sim"||profile.largeMeals==="Um pouco");
 let meals=medSmall?[
  ["07:30","Café da manhã proteico","Ovos + opção de carboidrato + fruta","Porção moderada"],
  ["10:30","Lanche proteico","Iogurte proteico / whey + fruta","Pequeno volume"],
  ["13:30","Almoço","Proteína magra + arroz/batata + legumes","Sem exagerar no volume"],
  ["17:00","Pré/pós-treino","Proteína + carboidrato de boa tolerância","Ajustar ao treino"],
  ["20:30","Jantar","Peixe/frango + acompanhamento + legumes","Leve e proteico"]
 ]:[
  ["07:30","Café da manhã","Proteína + carboidrato + fruta","~25% das calorias"],
  ["12:30","Almoço","Proteína magra + carboidrato + legumes","~30% das calorias"],
  ["16:30","Lanche / pré-treino","Proteína + fonte de energia","~20% das calorias"],
  ["20:30","Jantar","Proteína + acompanhamento + vegetais","~25% das calorias"]
 ];
 $("#mealList").innerHTML=meals.map(m=>`<div class="meal-item"><span>${m[0]}</span><div><b>${m[1]}</b><p>${m[2]}</p></div><small>${m[3]}</small></div>`).join("");
 let reads=[["PROTEÍNA",`${n.prot} g/dia como referência inicial.`,"Distribua ao longo do dia para facilitar consistência."],["HIDRATAÇÃO",`${n.water.toFixed(1).replace(".",",")} L/dia como ponto de partida.`,"A necessidade real varia com clima, suor e treino."]];
 if(medSmall)reads.unshift(["TOLERÂNCIA ALIMENTAR","Prioridade para refeições menores e mais distribuídas.","Seu perfil relata redução de apetite e/ou desconforto com grandes volumes."]);
 $("#nutritionRead").innerHTML=reads.map(r=>`<div class="nutrition-read-item"><span>${r[0]}</span><b>${r[1]}</b><p>${r[2]}</p></div>`).join("")
}
function renderProgress(){let bmi=profile.weight/((profile.height/100)**2);$("#baseWeight").textContent=profile.weight.toFixed(1).replace(".",",")+" kg";$("#baseTarget").textContent=profile.target.toFixed(1).replace(".",",")+" kg";$("#baseGap").textContent=(profile.target-profile.weight).toFixed(1).replace(".",",")+" kg";$("#baseBmi").textContent=bmi.toFixed(1).replace(".",",")}
function renderProfile(){
 const goalNames={loss:"Perda de gordura",recomp:"Recomposição",gain:"Ganho de massa",fitness:"Condicionamento"},medNames={none:"Não informado / não usa",tirzepatide:"Tirzepatida",semaglutide:"Semaglutida",other:"Outro"};
 let cards=[
 ["DADOS CORPORAIS",[["Idade",profile.age+" anos"],["Altura",profile.height+" cm"],["Peso",profile.weight+" kg"],["Meta",profile.target+" kg"],["Objetivo",goalNames[profile.goal]]]],
 ["TREINO",[["Nível",profile.level],["Frequência",profile.days+"x/sem"],["Duração",profile.minutes+" min"],["Local",profile.place],["Prioridade",profile.priority]]],
 ["ROTINA",[["Cardio",profile.cardio+"x/sem"],["Sono",profile.sleep+" h"],["Estresse",profile.stress],["Passos",profile.steps+"/dia"],["Água atual",profile.currentWater+" L"]]],
 ["ALIMENTAÇÃO",[["Refeições",profile.meals+"/dia"],["Estilo",profile.diet],["Desafio",profile.dietChallenge],["Restrições",profile.restrictions||"Nenhuma informada"]]],
 ["CONTEXTO DE PESO",[["Medicação",medNames[profile.medication]],["Apetite",profile.medication!=="none"?profile.appetite:"—"],["Grandes refeições",profile.medication!=="none"?profile.largeMeals:"—"],["GI",profile.medication!=="none"?profile.gi:"—"]]],
 ["OBSERVAÇÕES",[["Limitações",profile.limitations||"Nenhuma informada"],["Observações",profile.notes||"Nenhuma"],["Plano",splitInfo().name],["Status","Baseline criado"]]]
 ];
 $("#profileCards").innerHTML=cards.map(c=>`<article class="profile-card glass"><span>${c[0]}</span><h3>${c[0]}</h3>${c[1].map(x=>`<div class="profile-line"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}</article>`).join("")
}
$$(".nav").forEach(n=>n.onclick=()=>{if(n.id==="logoutBtn")return;$$(".nav").forEach(x=>x.classList.remove("active"));n.classList.add("active");$$(".app-view").forEach(v=>v.classList.remove("active"));$("#"+n.dataset.view).classList.add("active");scrollTo(0,0)});
$$("[data-jump]").forEach(b=>b.onclick=()=>{const n=$(`.nav[data-view="${b.dataset.jump}"]`);if(n)n.click()});
$("#logoutBtn").onclick=()=>{showOnly("publicArea")};
$("#changeSplit").onclick=()=>alert("Na versão com banco, aqui o usuário poderá comparar outras divisões e pedir uma nova montagem.");
$("#nutritionSettings").onclick=()=>alert("Na versão seguinte, esta área permitirá trocar refeições, preferências e alimentos mantendo as metas do plano.");
$("#newCheckin").onclick=()=>alert("Próxima etapa do MVP: check-in com peso, medidas, fotos, cargas, sono e observações.");
$("#editProfile").onclick=()=>startOnboarding();
