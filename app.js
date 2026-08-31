const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const state=JSON.parse(localStorage.getItem("sigmaRadarProto")||"null")||{
 profile:{name:"Leonardo",age:33,height:180,weight:97.4,target:90,sex:"m",goal:"loss",days:4,level:"Intermediário",minutes:60,cardio:3,priority:"Peitoral + braços",sleep:7,stress:"Moderado",steps:8000},
 water:2.6, protein:142, workoutDone:true, split:"upperlower"
};

const icons={
 press:`<svg viewBox="0 0 120 100"><circle cx="60" cy="20" r="9"/><path d="M60 30v28M42 45h36M42 45l-12 18M78 45l12 18M50 58l-9 25M70 58l9 25"/><path d="M18 68h84M28 60v16M92 60v16"/></svg>`,
 squat:`<svg viewBox="0 0 120 100"><circle cx="60" cy="18" r="9"/><path d="M60 28l-8 26M52 54l-18 15M52 54l13 17M65 71l16 14M34 69l-10 18"/><path d="M30 35h60M35 29v12M85 29v12"/></svg>`,
 row:`<svg viewBox="0 0 120 100"><circle cx="52" cy="20" r="8"/><path d="M50 28l-13 29M37 57l-18 20M37 57l20 18M57 75l18 13"/><path d="M41 39l34 9M75 48l22-5"/></svg>`,
 curl:`<svg viewBox="0 0 120 100"><circle cx="60" cy="18" r="9"/><path d="M60 28v33M42 42l18 12 18-12M42 42l-7 22M78 42l7 22M50 61l-8 25M70 61l8 25"/><path d="M25 66h20M75 66h20"/></svg>`,
 deadlift:`<svg viewBox="0 0 120 100"><circle cx="60" cy="19" r="8"/><path d="M58 27l-10 31M48 58l-18 16M48 58l15 19M63 77l19 11"/><path d="M19 72h82M24 66v12M96 66v12"/></svg>`,
 shoulder:`<svg viewBox="0 0 120 100"><circle cx="60" cy="20" r="8"/><path d="M60 28v32M42 43l18 10 18-10M50 60l-8 25M70 60l8 25"/><path d="M37 43L27 26M83 43l10-17M20 23h18M82 23h18"/></svg>`,
 leg:`<svg viewBox="0 0 120 100"><circle cx="60" cy="18" r="8"/><path d="M60 26v30M49 39h22M51 56l-5 30M69 56l12 23M81 79h15"/><path d="M31 72h33M31 62v20"/></svg>`,
 pullup:`<svg viewBox="0 0 120 100"><circle cx="60" cy="27" r="8"/><path d="M60 35v29M40 31l20 12 20-12M40 31l-7-16M80 31l7-16M50 64l-8 23M70 64l8 23"/><path d="M20 12h80"/></svg>`
};

const exerciseDB={
 "Supino reto":{group:"PEITORAL",icon:"press",desc:"Movimento composto para força e hipertrofia do peitoral.",tip:"Controle a descida e mantenha as escápulas estabilizadas."},
 "Supino inclinado":{group:"PEITORAL",icon:"press",desc:"Ênfase na porção superior do peitoral e deltoide anterior.",tip:"Evite inclinação excessiva do banco para não transformar em desenvolvimento."},
 "Desenvolvimento":{group:"OMBROS",icon:"shoulder",desc:"Press vertical para deltoides e tríceps.",tip:"Mantenha abdômen firme e evite hiperextensão lombar."},
 "Tríceps corda":{group:"TRÍCEPS",icon:"press",desc:"Isolamento de tríceps com boa amplitude.",tip:"Abra a corda ao final sem deslocar os cotovelos."},
 "Remada baixa":{group:"COSTAS",icon:"row",desc:"Remada horizontal para dorsais e região média das costas.",tip:"Puxe com os cotovelos e evite jogar o tronco para trás."},
 "Puxada alta":{group:"COSTAS",icon:"pullup",desc:"Puxada vertical para dorsais.",tip:"Leve a barra ao topo do peito mantendo o tórax aberto."},
 "Rosca direta":{group:"BÍCEPS",icon:"curl",desc:"Movimento clássico para bíceps.",tip:"Evite balanço do tronco e controle a fase excêntrica."},
 "Rosca martelo":{group:"BÍCEPS",icon:"curl",desc:"Ênfase em braquial e braquiorradial.",tip:"Mantenha punhos neutros e cotovelos próximos ao corpo."},
 "Agachamento":{group:"PERNAS",icon:"squat",desc:"Movimento composto para quadríceps, glúteos e core.",tip:"Desça com controle mantendo joelhos acompanhando a ponta dos pés."},
 "Leg press":{group:"PERNAS",icon:"leg",desc:"Exercício guiado de alta produção de força para membros inferiores.",tip:"Não deixe a lombar perder contato com o encosto."},
 "Cadeira extensora":{group:"QUADRÍCEPS",icon:"leg",desc:"Isolamento de quadríceps.",tip:"Controle o topo do movimento sem chutar a carga."},
 "Mesa flexora":{group:"POSTERIORES",icon:"leg",desc:"Isolamento dos posteriores de coxa.",tip:"Mantenha quadril estável durante toda a série."},
 "Levantamento terra romeno":{group:"POSTERIORES",icon:"deadlift",desc:"Padrão de hinge para posteriores e glúteos.",tip:"Empurre o quadril para trás mantendo a coluna neutra."},
 "Elevação lateral":{group:"OMBROS",icon:"shoulder",desc:"Isolamento de deltoide lateral.",tip:"Use carga que permita controle, sem embalo."},
};

const splits={
 upperlower:[
  {day:"SEGUNDA",title:"Upper A — Peito + Costas + Braços",ex:[["Supino reto","4×8–10"],["Remada baixa","4×8–10"],["Supino inclinado","3×10–12"],["Puxada alta","3×10–12"],["Rosca direta","3×10–12"],["Tríceps corda","3×10–12"]]},
  {day:"QUARTA",title:"Lower A — Quadríceps + Posteriores",ex:[["Agachamento","4×6–8"],["Leg press","4×10–12"],["Cadeira extensora","3×12–15"],["Mesa flexora","3×10–12"],["Levantamento terra romeno","3×8–10"]]},
  {day:"QUINTA",title:"Upper B — Costas + Ombros + Braços",ex:[["Puxada alta","4×8–10"],["Supino inclinado","3×8–10"],["Remada baixa","4×10"],["Desenvolvimento","3×8–10"],["Elevação lateral","3×12–15"],["Rosca martelo","3×10–12"]]},
  {day:"SEXTA",title:"Lower B — Glúteos + Posteriores",ex:[["Levantamento terra romeno","4×8"],["Leg press","4×10"],["Mesa flexora","4×10–12"],["Agachamento","3×10"],["Cadeira extensora","3×12–15"]]}
 ],
 pushpulllegs:[
  {day:"SEGUNDA",title:"Push — Peito + Ombros + Tríceps",ex:[["Supino reto","4×6–8"],["Supino inclinado","3×8–10"],["Desenvolvimento","3×8–10"],["Elevação lateral","3×12–15"],["Tríceps corda","3×10–12"]]},
  {day:"TERÇA",title:"Pull — Costas + Bíceps",ex:[["Puxada alta","4×8"],["Remada baixa","4×8–10"],["Rosca direta","3×10"],["Rosca martelo","3×10–12"]]},
  {day:"QUINTA",title:"Legs — Pernas completas",ex:[["Agachamento","4×6–8"],["Leg press","4×10"],["Levantamento terra romeno","3×8–10"],["Mesa flexora","3×10–12"],["Cadeira extensora","3×12–15"]]},
  {day:"SEXTA",title:"Push B — Ênfase peitoral",ex:[["Supino inclinado","4×8"],["Supino reto","3×10"],["Elevação lateral","4×12"],["Tríceps corda","4×10"]]}
 ],
 abc:[
  {day:"SEGUNDA",title:"A — Peito + Tríceps",ex:[["Supino reto","4×8"],["Supino inclinado","4×10"],["Elevação lateral","3×12"],["Tríceps corda","4×10"]]},
  {day:"QUARTA",title:"B — Costas + Bíceps",ex:[["Puxada alta","4×8"],["Remada baixa","4×10"],["Rosca direta","3×10"],["Rosca martelo","3×12"]]},
  {day:"SEXTA",title:"C — Pernas + Ombros",ex:[["Agachamento","4×8"],["Leg press","4×10"],["Levantamento terra romeno","3×10"],["Desenvolvimento","3×10"],["Elevação lateral","3×15"]]}
 ],
 fullbody:[
  {day:"SEGUNDA",title:"Full Body A",ex:[["Agachamento","4×8"],["Supino reto","4×8"],["Remada baixa","4×10"],["Elevação lateral","3×12"],["Rosca direta","2×12"]]},
  {day:"QUARTA",title:"Full Body B",ex:[["Levantamento terra romeno","4×8"],["Supino inclinado","4×10"],["Puxada alta","4×10"],["Tríceps corda","3×12"],["Cadeira extensora","3×12"]]},
  {day:"SEXTA",title:"Full Body C",ex:[["Leg press","4×10"],["Desenvolvimento","4×8"],["Remada baixa","4×10"],["Mesa flexora","3×12"],["Rosca martelo","3×12"]]}
 ]
};

function save(){localStorage.setItem("sigmaRadarProto",JSON.stringify(state))}
function navigate(id){$$(".view").forEach(v=>v.classList.remove("active"));$("#"+id).classList.add("active");$$(".nav").forEach(n=>n.classList.toggle("active",n.dataset.view===id));scrollTo({top:0,behavior:"smooth"})}
$$(".nav").forEach(n=>n.onclick=()=>navigate(n.dataset.view)); $("#openProfile").onclick=()=>navigate("perfil");

function calcNutrition(p=state.profile){
 const w=+p.weight,h=+p.height,a=+p.age; 
 const bmr=(p.sex==="f"?10*w+6.25*h-5*a-161:10*w+6.25*h-5*a+5);
 const mult=1.6;
 let kcal=bmr*mult;
 if(p.goal==="loss") kcal-=600; else if(p.goal==="gain") kcal+=250;
 kcal=Math.round(kcal/50)*50;
 const prot=Math.round(w*(p.goal==="gain"?1.8:2.0));
 const fat=Math.round(w*.7);
 const carbs=Math.max(90,Math.round((kcal-prot*4-fat*9)/4));
 return {kcal,prot,fat,carbs}
}
function calcScore(){
 const waterGoal=Math.max(2.2,state.profile.weight*.035), waterPct=Math.min(1,state.water/waterGoal);
 const protGoal=calcNutrition().prot, protPct=Math.min(1,state.protein/protGoal);
 const workout=state.workoutDone?1:.68;
 const sleep=Math.min(1,state.profile.sleep/8);
 const cardio=Math.min(1,state.profile.cardio/3);
 return Math.round((workout*.26+protPct*.22+waterPct*.16+sleep*.16+cardio*.10+.1)*100)
}
function updateDashboard(){
 const n=calcNutrition(), score=calcScore(), p=state.profile;
 $("#scoreValue").textContent=score; $("#sideScore").textContent=score;
 $("#scoreRing").style.background=`conic-gradient(#00e6a8 0 ${score}%,#202630 ${score}% 100%)`;
 $("#miniWeight").textContent=p.weight.toFixed(1).replace(".",",")+" kg";
 $("#miniWorkouts").textContent=p.days+"/"+p.days;
 $("#miniProtein").textContent=Math.round(state.protein/n.prot*100)+"%";
 $("#waterNow").textContent=state.water.toFixed(1).replace(".",",");
 $("#waterGoal").textContent=Math.max(2.2,p.weight*.035).toFixed(1).replace(".",",");
 $("#proteinNow").textContent=Math.round(state.protein); $("#proteinGoal").textContent=n.prot;
 const gap=Math.max(0,p.weight-p.target), weeks=gap/.8; $("#projectionText").textContent=`Meta estimada em ~${Math.max(1,Math.round(weeks))} semanas.`;
 $("#scoreStatus").textContent=score>=82?"EVOLUÇÃO FAVORÁVEL":score>=70?"EM PROGRESSO":"PONTO DE ATENÇÃO";
 $("#scoreHeadline").textContent=score>=82?"Você está evoluindo bem.":score>=70?"Boa base, mas há ajustes claros.":"Seu radar pede consistência.";
}
$("#addWater").onclick=()=>{state.water=Math.min(6,state.water+.3);save();updateDashboard()}
$("#addProtein").onclick=()=>{state.protein=Math.min(350,state.protein+20);save();updateDashboard()}

function renderWorkout(){
 const cont=$("#workoutDays"), plan=splits[state.split]; cont.innerHTML="";
 plan.forEach(d=>{
  const el=document.createElement("div"); el.className="workout-day";
  el.innerHTML=`<div class="day-head"><b>${d.day} • ${d.title}</b><span>${d.ex.length} EXERCÍCIOS</span></div><div class="exercise-list">${d.ex.map(([name,setrep])=>{
   const ex=exerciseDB[name], [sets,reps]=setrep.split("×");
   return `<div class="exercise" data-name="${name}" data-sets="${sets}" data-reps="${reps}"><div class="exercise-visual">${icons[ex.icon]}</div><div class="exercise-info"><b>${name}</b><span>${ex.group}</span><em>${setrep}</em></div></div>`
  }).join("")}</div>`;
  cont.appendChild(el)
 });
 $$(".exercise").forEach(e=>e.onclick=()=>openExercise(e.dataset.name,e.dataset.sets,e.dataset.reps));
 const names={upperlower:"UPPER / LOWER",pushpulllegs:"PUSH / PULL / LEGS",abc:"ABC CLÁSSICO",fullbody:"FULL BODY"};
 $("#splitName").textContent=names[state.split];
 $("#strategyLabel").textContent=names[state.split];
}
$$(".split").forEach(b=>b.onclick=()=>{state.split=b.dataset.split; $$(".split").forEach(x=>x.classList.toggle("active",x===b)); save();renderWorkout()});
$("#generateWorkout").onclick=()=>{
 const d=+state.profile.days;
 state.split=d<=3?"fullbody":d===4?"upperlower":"pushpulllegs";
 $$(".split").forEach(x=>x.classList.toggle("active",x.dataset.split===state.split)); save();renderWorkout();
 $("#coachText").innerHTML=`<h3>Plano ajustado para ${d} dias e objetivo de ${state.profile.goal==="loss"?"perda de gordura com preservação muscular":"performance"}.</h3><p>Priorizamos exercícios compostos, volume compatível com sua frequência e recuperação suficiente entre estímulos.</p>`;
};

function openExercise(name,sets,reps){
 const ex=exerciseDB[name]; $("#modalName").textContent=name;$("#modalGroup").textContent=ex.group;$("#modalDesc").textContent=ex.desc;$("#modalTip").textContent=ex.tip;$("#modalSets").textContent=sets;$("#modalReps").textContent=reps;$("#modalVisual").innerHTML=icons[ex.icon];$("#exerciseModal").classList.add("open")
}
$("#closeExercise").onclick=()=>$("#exerciseModal").classList.remove("open");
$("#exerciseModal").onclick=e=>{if(e.target.id==="exerciseModal")$("#exerciseModal").classList.remove("open")};

const meals=[
 ["07:30","Café da manhã","Ovos mexidos + pão integral + fruta","430 kcal • 32g P"],
 ["10:30","Lanche","Iogurte proteico + banana","220 kcal • 20g P"],
 ["13:00","Almoço","Frango grelhado + arroz + legumes + salada","610 kcal • 52g P"],
 ["16:30","Pré-treino","Aveia + iogurte + fruta","340 kcal • 24g P"],
 ["20:00","Jantar","Tilápia + batata + legumes","510 kcal • 48g P"],
 ["22:30","Ceia","Opção proteica leve","160 kcal • 20g P"]
];
function renderMeals(){ $("#mealPlan").innerHTML=meals.map(m=>`<div class="meal"><div class="meal-time">${m[0]}</div><div><b>${m[1]}</b><p>${m[2]}</p></div><div class="meal-macros">${m[3]}</div></div>`).join("") }
function updateNutrition(){
 const n=calcNutrition(); $("#calGoal").textContent=n.kcal.toLocaleString("pt-BR");$("#protGoal").textContent=n.prot;$("#carbGoal").textContent=n.carbs;$("#fatGoal").textContent=n.fat; $("#profileCalories").textContent=n.kcal.toLocaleString("pt-BR")+" kcal"; updateDashboard()
}
$("#recalcNutrition").onclick=updateNutrition;
$("#nutritionSim").onclick=()=>{
 const tmp={...state.profile,weight:+$("#nWeight").value,goal:$("#nGoal").value}; const n=calcNutrition(tmp);
 $("#calGoal").textContent=n.kcal.toLocaleString("pt-BR");$("#protGoal").textContent=n.prot;$("#carbGoal").textContent=n.carbs;$("#fatGoal").textContent=n.fat;
};

function profileToForm(){
 const p=state.profile;
 $("#pName").value=p.name;$("#pAge").value=p.age;$("#pHeight").value=p.height;$("#pWeight").value=p.weight;$("#pTarget").value=p.target;$("#pSex").value=p.sex;$("#pGoal").value=p.goal;$("#pDays").value=p.days;$("#pLevel").value=p.level;$("#pMinutes").value=p.minutes;$("#pCardio").value=p.cardio;$("#pPriority").value=p.priority;$("#pSleep").value=p.sleep;$("#pStress").value=p.stress;$("#pSteps").value=p.steps;$("#profileName").textContent=p.name.toUpperCase(); updateProfileSummary()
}
function updateProfileSummary(){
 const p=state.profile,bmi=p.weight/((p.height/100)**2);$("#bmiValue").textContent=bmi.toFixed(1).replace(".",",");$("#goalGap").textContent="-"+Math.max(0,p.weight-p.target).toFixed(1).replace(".",",")+" kg";$("#profileName").textContent=p.name.toUpperCase(); updateNutrition()
}
$("#saveProfile").onclick=()=>{
 state.profile={name:$("#pName").value,age:+$("#pAge").value,height:+$("#pHeight").value,weight:+$("#pWeight").value,target:+$("#pTarget").value,sex:$("#pSex").value,goal:$("#pGoal").value,days:+$("#pDays").value,level:$("#pLevel").value,minutes:+$("#pMinutes").value,cardio:+$("#pCardio").value,priority:$("#pPriority").value,sleep:+$("#pSleep").value,stress:$("#pStress").value,steps:+$("#pSteps").value};
 save();updateProfileSummary();$("#nWeight").value=state.profile.weight; alert("Perfil salvo no navegador para este protótipo.")
};
$("#addCheckin").onclick=()=>alert("No produto real, aqui abriria um check-in com peso, medidas, fotos, força, sono e observações.");

renderWorkout();renderMeals();profileToForm();updateNutrition();updateDashboard();
