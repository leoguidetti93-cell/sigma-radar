const screens=[...document.querySelectorAll('.screen')];

function setActiveSideLink(target){
  document.querySelectorAll('.side-link').forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.target===target);
  });
}
function sideNavigate(id,title,button){
  if(id==='home'){
    goHome();
    setActiveSideLink('home');
    return;
  }
  openFeature(id,title);
  setActiveSideLink(id);
}
const originalGoHome=goHome;
goHome=function(){
  originalGoHome();
  setActiveSideLink('home');
};
function updatePlayerClock(){
  const now=new Date();
  const clock=document.getElementById('playerClock');
  const date=document.getElementById('playerDate');
  if(clock)clock.textContent=now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
  if(date)date.textContent=now.toLocaleDateString('pt-BR',{weekday:'short',day:'2-digit',month:'short'}).toUpperCase();
}
updatePlayerClock();
setInterval(updatePlayerClock,1000);

function goHome(){screens.forEach(s=>s.classList.remove('active'));document.getElementById('home').classList.add('active');window.scrollTo(0,0)}
const loaderMessages={
  sigmaColor:'Calculando predominância e selecionando os 12 sinais da sessão.',
  padroes:'Minerando sequências de quatro casas e validando resultados até G1.',
  temporal:'Mapeando temperaturas históricas em janelas de três minutos.',
  operacional:'Consultando os ciclos e oportunidades da sessão escolhida.',
  gestor:'Calculando a progressão e o lucro fixo do plano.',
  ranking:'Classificando os horários históricos mais fortes.',
  tendencias:'Projetando as janelas mais promissoras para os próximos ciclos da semana.',
  simulador:'Calculando intervalos entre brancos e construindo três projeções ao vivo.',
  catalogador:'Conectando à fonte de resultados e montando o histórico ao vivo.'
};
function openFeature(id,title){
  const target=document.getElementById(id);
  if(!target){console.error('Módulo não encontrado:',id);return;}
  document.querySelectorAll('.screen').forEach(screen=>screen.classList.remove('active'));
  target.classList.add('active');
  setActiveSideLink(id);
  if(id==='gestor' && typeof calculateBankManager==='function')calculateBankManager();
  if(id==='catalogador' && typeof startLiveCatalog==='function')startLiveCatalog();
  window.scrollTo(0,0);
}

const hourlyData=[{"hour":0,"windows":[{"time":"00:36 → 00:45","score":87,"persistence":85,"level":"SIGMA PRO","historicalRate":9.77,"recentRate":11.0,"last3000Rate":5.0,"status":"Aquecendo","hour":0,"start":36},{"time":"00:37 → 00:46","score":87,"persistence":85,"level":"SIGMA PRO","historicalRate":9.52,"recentRate":10.0,"last3000Rate":5.0,"status":"Estável","hour":0,"start":37},{"time":"00:38 → 00:47","score":85,"persistence":80,"level":"SIGMA PRO","historicalRate":9.52,"recentRate":11.0,"last3000Rate":5.0,"status":"Aquecendo","hour":0,"start":38},{"time":"00:35 → 00:44","score":84,"persistence":85,"level":"SIGMA PRO","historicalRate":8.52,"recentRate":10.0,"last3000Rate":5.0,"status":"Aquecendo","hour":0,"start":35},{"time":"00:39 → 00:48","score":84,"persistence":80,"level":"SIGMA PRO","historicalRate":9.02,"recentRate":11.0,"last3000Rate":5.0,"status":"Aquecendo","hour":0,"start":39}]},{"hour":1,"windows":[{"time":"01:25 → 01:34","score":93,"persistence":80,"level":"SIGMA ELITE","historicalRate":9.52,"recentRate":11.0,"last3000Rate":10.0,"status":"Aquecendo","hour":1,"start":25},{"time":"01:24 → 01:33","score":92,"persistence":80,"level":"SIGMA ELITE","historicalRate":9.27,"recentRate":11.0,"last3000Rate":15.0,"status":"Aquecendo","hour":1,"start":24},{"time":"01:26 → 01:35","score":92,"persistence":80,"level":"SIGMA ELITE","historicalRate":9.27,"recentRate":11.0,"last3000Rate":10.0,"status":"Aquecendo","hour":1,"start":26},{"time":"01:23 → 01:32","score":90,"persistence":80,"level":"SIGMA ELITE","historicalRate":8.52,"recentRate":11.0,"last3000Rate":15.0,"status":"Aquecendo","hour":1,"start":23},{"time":"01:22 → 01:31","score":89,"persistence":80,"level":"SIGMA ELITE","historicalRate":8.31,"recentRate":11.0,"last3000Rate":20.0,"status":"Aquecendo","hour":1,"start":22}]},{"hour":2,"windows":[{"time":"02:39 → 02:48","score":92,"persistence":85,"level":"SIGMA ELITE","historicalRate":8.75,"recentRate":13.0,"last3000Rate":15.0,"status":"Aquecendo","hour":2,"start":39},{"time":"02:40 → 02:49","score":92,"persistence":85,"level":"SIGMA ELITE","historicalRate":9.0,"recentRate":12.0,"last3000Rate":15.0,"status":"Aquecendo","hour":2,"start":40},{"time":"02:41 → 02:50","score":90,"persistence":90,"level":"SIGMA ELITE","historicalRate":7.75,"recentRate":10.0,"last3000Rate":10.0,"status":"Aquecendo","hour":2,"start":41},{"time":"02:44 → 02:53","score":89,"persistence":85,"level":"SIGMA ELITE","historicalRate":8.75,"recentRate":9.0,"last3000Rate":10.0,"status":"Estável","hour":2,"start":44},{"time":"02:38 → 02:47","score":87,"persistence":80,"level":"SIGMA PRO","historicalRate":7.75,"recentRate":10.0,"last3000Rate":10.0,"status":"Aquecendo","hour":2,"start":38}]},{"hour":3,"windows":[{"time":"03:32 → 03:41","score":93,"persistence":85,"level":"SIGMA ELITE","historicalRate":9.05,"recentRate":13.0,"last3000Rate":15.0,"status":"Aquecendo","hour":3,"start":32},{"time":"03:31 → 03:40","score":91,"persistence":85,"level":"SIGMA ELITE","historicalRate":8.54,"recentRate":13.0,"last3000Rate":20.0,"status":"Aquecendo","hour":3,"start":31},{"time":"03:30 → 03:39","score":90,"persistence":80,"level":"SIGMA ELITE","historicalRate":8.77,"recentRate":13.0,"last3000Rate":20.0,"status":"Aquecendo","hour":3,"start":30},{"time":"03:33 → 03:42","score":90,"persistence":75,"level":"SIGMA ELITE","historicalRate":9.3,"recentRate":14.0,"last3000Rate":15.0,"status":"Aquecendo","hour":3,"start":33},{"time":"03:34 → 03:43","score":90,"persistence":75,"level":"SIGMA ELITE","historicalRate":9.32,"recentRate":14.0,"last3000Rate":15.0,"status":"Aquecendo","hour":3,"start":34}]},{"hour":4,"windows":[{"time":"04:25 → 04:34","score":98,"persistence":95,"level":"SIGMA ELITE","historicalRate":9.75,"recentRate":13.0,"last3000Rate":15.0,"status":"Aquecendo","hour":4,"start":25},{"time":"04:24 → 04:33","score":98,"persistence":95,"level":"SIGMA ELITE","historicalRate":9.75,"recentRate":12.0,"last3000Rate":15.0,"status":"Aquecendo","hour":4,"start":24},{"time":"04:23 → 04:32","score":97,"persistence":95,"level":"SIGMA ELITE","historicalRate":9.5,"recentRate":12.0,"last3000Rate":15.0,"status":"Aquecendo","hour":4,"start":23},{"time":"04:21 → 04:30","score":97,"persistence":95,"level":"SIGMA ELITE","historicalRate":9.5,"recentRate":11.0,"last3000Rate":10.0,"status":"Aquecendo","hour":4,"start":21},{"time":"04:22 → 04:31","score":96,"persistence":95,"level":"SIGMA ELITE","historicalRate":9.25,"recentRate":11.0,"last3000Rate":10.0,"status":"Aquecendo","hour":4,"start":22}]},{"hour":5,"windows":[{"time":"05:23 → 05:32","score":87,"persistence":80,"level":"SIGMA PRO","historicalRate":7.75,"recentRate":10.0,"last3000Rate":10.0,"status":"Aquecendo","hour":5,"start":23},{"time":"05:26 → 05:35","score":86,"persistence":80,"level":"SIGMA PRO","historicalRate":8.06,"recentRate":9.09,"last3000Rate":10.0,"status":"Aquecendo","hour":5,"start":26},{"time":"05:27 → 05:36","score":85,"persistence":75,"level":"SIGMA PRO","historicalRate":7.56,"recentRate":10.1,"last3000Rate":10.0,"status":"Aquecendo","hour":5,"start":27},{"time":"05:28 → 05:37","score":84,"persistence":75,"level":"SIGMA PRO","historicalRate":7.3,"recentRate":10.1,"last3000Rate":10.0,"status":"Aquecendo","hour":5,"start":28},{"time":"05:24 → 05:33","score":83,"persistence":80,"level":"SIGMA PRO","historicalRate":7.25,"recentRate":9.0,"last3000Rate":10.0,"status":"Aquecendo","hour":5,"start":24}]},{"hour":6,"windows":[{"time":"06:03 → 06:12","score":88,"persistence":80,"level":"SIGMA ELITE","historicalRate":8.02,"recentRate":10.0,"last3000Rate":20.0,"status":"Aquecendo","hour":6,"start":3},{"time":"06:00 → 06:09","score":87,"persistence":75,"level":"SIGMA PRO","historicalRate":8.27,"recentRate":12.0,"last3000Rate":15.0,"status":"Aquecendo","hour":6,"start":0},{"time":"06:01 → 06:10","score":87,"persistence":75,"level":"SIGMA PRO","historicalRate":8.02,"recentRate":11.0,"last3000Rate":20.0,"status":"Aquecendo","hour":6,"start":1},{"time":"06:21 → 06:30","score":85,"persistence":90,"level":"SIGMA PRO","historicalRate":8.5,"recentRate":16.0,"last3000Rate":5.0,"status":"Aquecendo","hour":6,"start":21},{"time":"06:02 → 06:11","score":85,"persistence":75,"level":"SIGMA PRO","historicalRate":7.52,"recentRate":11.0,"last3000Rate":20.0,"status":"Aquecendo","hour":6,"start":2}]},{"hour":7,"windows":[{"time":"07:03 → 07:12","score":92,"persistence":85,"level":"SIGMA ELITE","historicalRate":8.75,"recentRate":12.0,"last3000Rate":10.0,"status":"Aquecendo","hour":7,"start":3},{"time":"07:05 → 07:14","score":91,"persistence":85,"level":"SIGMA ELITE","historicalRate":8.5,"recentRate":12.0,"last3000Rate":10.0,"status":"Aquecendo","hour":7,"start":5},{"time":"07:04 → 07:13","score":91,"persistence":85,"level":"SIGMA ELITE","historicalRate":8.5,"recentRate":11.0,"last3000Rate":10.0,"status":"Aquecendo","hour":7,"start":4},{"time":"07:06 → 07:15","score":90,"persistence":85,"level":"SIGMA ELITE","historicalRate":8.25,"recentRate":11.0,"last3000Rate":15.0,"status":"Aquecendo","hour":7,"start":6},{"time":"07:02 → 07:11","score":88,"persistence":80,"level":"SIGMA ELITE","historicalRate":8.0,"recentRate":12.0,"last3000Rate":10.0,"status":"Aquecendo","hour":7,"start":2}]},{"hour":8,"windows":[{"time":"08:23 → 08:32","score":89,"persistence":90,"level":"SIGMA ELITE","historicalRate":8.04,"recentRate":9.0,"last3000Rate":10.0,"status":"Estável","hour":8,"start":23},{"time":"08:48 → 08:57","score":84,"persistence":80,"level":"SIGMA PRO","historicalRate":7.5,"recentRate":9.0,"last3000Rate":30.0,"status":"Aquecendo","hour":8,"start":48},{"time":"08:47 → 08:56","score":82,"persistence":80,"level":"SIGMA PRO","historicalRate":7.5,"recentRate":8.0,"last3000Rate":25.0,"status":"Estável","hour":8,"start":47},{"time":"08:45 → 08:54","score":82,"persistence":75,"level":"SIGMA PRO","historicalRate":8.02,"recentRate":8.08,"last3000Rate":25.0,"status":"Estável","hour":8,"start":45},{"time":"08:24 → 08:33","score":80,"persistence":85,"level":"SIGMA PRO","historicalRate":7.29,"recentRate":7.0,"last3000Rate":10.0,"status":"Estável","hour":8,"start":24}]},{"hour":9,"windows":[{"time":"09:36 → 09:45","score":81,"persistence":80,"level":"SIGMA PRO","historicalRate":8.27,"recentRate":12.12,"last3000Rate":5.0,"status":"Aquecendo","hour":9,"start":36},{"time":"09:37 → 09:46","score":77,"persistence":75,"level":"SIGMA CORE","historicalRate":7.27,"recentRate":12.12,"last3000Rate":5.0,"status":"Aquecendo","hour":9,"start":37},{"time":"09:38 → 09:47","score":77,"persistence":70,"level":"SIGMA CORE","historicalRate":7.79,"recentRate":12.12,"last3000Rate":5.0,"status":"Aquecendo","hour":9,"start":38},{"time":"09:39 → 09:48","score":77,"persistence":70,"level":"SIGMA CORE","historicalRate":7.79,"recentRate":11.11,"last3000Rate":5.0,"status":"Aquecendo","hour":9,"start":39},{"time":"09:35 → 09:44","score":75,"persistence":85,"level":"SIGMA CORE","historicalRate":8.27,"recentRate":11.11,"last3000Rate":0.0,"status":"Aquecendo","hour":9,"start":35}]},{"hour":10,"windows":[{"time":"10:50 → 10:59","score":94,"persistence":95,"level":"SIGMA ELITE","historicalRate":8.54,"recentRate":10.0,"last3000Rate":15.0,"status":"Aquecendo","hour":10,"start":50},{"time":"10:49 → 10:58","score":90,"persistence":90,"level":"SIGMA ELITE","historicalRate":8.54,"recentRate":9.0,"last3000Rate":10.0,"status":"Estável","hour":10,"start":49},{"time":"10:48 → 10:57","score":90,"persistence":85,"level":"SIGMA ELITE","historicalRate":8.27,"recentRate":10.0,"last3000Rate":10.0,"status":"Aquecendo","hour":10,"start":48},{"time":"10:47 → 10:56","score":86,"persistence":80,"level":"SIGMA PRO","historicalRate":8.02,"recentRate":9.0,"last3000Rate":10.0,"status":"Estável","hour":10,"start":47},{"time":"10:41 → 10:50","score":85,"persistence":95,"level":"SIGMA PRO","historicalRate":8.02,"recentRate":7.0,"last3000Rate":15.0,"status":"Perdendo força","hour":10,"start":41}]},{"hour":11,"windows":[{"time":"11:11 → 11:20","score":89,"persistence":80,"level":"SIGMA ELITE","historicalRate":8.27,"recentRate":10.0,"last3000Rate":15.0,"status":"Aquecendo","hour":11,"start":11},{"time":"11:13 → 11:22","score":85,"persistence":85,"level":"SIGMA PRO","historicalRate":8.02,"recentRate":8.0,"last3000Rate":15.0,"status":"Estável","hour":11,"start":13},{"time":"11:10 → 11:19","score":84,"persistence":80,"level":"SIGMA PRO","historicalRate":7.54,"recentRate":9.09,"last3000Rate":15.0,"status":"Aquecendo","hour":11,"start":10},{"time":"11:12 → 11:21","score":83,"persistence":75,"level":"SIGMA PRO","historicalRate":7.77,"recentRate":9.0,"last3000Rate":15.0,"status":"Aquecendo","hour":11,"start":12},{"time":"11:08 → 11:17","score":81,"persistence":70,"level":"SIGMA PRO","historicalRate":6.53,"recentRate":10.1,"last3000Rate":10.0,"status":"Aquecendo","hour":11,"start":8}]},{"hour":12,"windows":[{"time":"12:00 → 12:09","score":80,"persistence":80,"level":"SIGMA PRO","historicalRate":8.5,"recentRate":6.0,"last3000Rate":10.0,"status":"Perdendo força","hour":12,"start":0},{"time":"12:01 → 12:10","score":77,"persistence":75,"level":"SIGMA CORE","historicalRate":8.25,"recentRate":6.0,"last3000Rate":10.0,"status":"Perdendo força","hour":12,"start":1},{"time":"12:32 → 12:41","score":76,"persistence":75,"level":"SIGMA CORE","historicalRate":7.75,"recentRate":6.0,"last3000Rate":10.0,"status":"Perdendo força","hour":12,"start":32},{"time":"12:30 → 12:39","score":74,"persistence":75,"level":"SIGMA CORE","historicalRate":7.0,"recentRate":6.0,"last3000Rate":10.0,"status":"Estável","hour":12,"start":30},{"time":"12:31 → 12:40","score":74,"persistence":75,"level":"SIGMA CORE","historicalRate":7.0,"recentRate":6.0,"last3000Rate":10.0,"status":"Estável","hour":12,"start":31}]},{"hour":13,"windows":[{"time":"13:31 → 13:40","score":86,"persistence":81,"level":"SIGMA PRO","historicalRate":7.4,"recentRate":10.0,"last3000Rate":15.0,"status":"Aquecendo","hour":13,"start":31},{"time":"13:30 → 13:39","score":84,"persistence":76,"level":"SIGMA PRO","historicalRate":6.92,"recentRate":10.0,"last3000Rate":15.0,"status":"Aquecendo","hour":13,"start":30},{"time":"13:42 → 13:51","score":83,"persistence":81,"level":"SIGMA PRO","historicalRate":6.94,"recentRate":9.0,"last3000Rate":16.67,"status":"Aquecendo","hour":13,"start":42},{"time":"13:39 → 13:48","score":83,"persistence":76,"level":"SIGMA PRO","historicalRate":6.7,"recentRate":10.0,"last3000Rate":25.0,"status":"Aquecendo","hour":13,"start":39},{"time":"13:33 → 13:42","score":83,"persistence":76,"level":"SIGMA PRO","historicalRate":7.4,"recentRate":9.0,"last3000Rate":15.0,"status":"Aquecendo","hour":13,"start":33}]},{"hour":14,"windows":[{"time":"14:02 → 14:11","score":79,"persistence":71,"level":"SIGMA CORE","historicalRate":7.42,"recentRate":8.0,"last3000Rate":10.0,"status":"Estável","hour":14,"start":2},{"time":"14:07 → 14:16","score":78,"persistence":76,"level":"SIGMA CORE","historicalRate":6.68,"recentRate":8.0,"last3000Rate":10.0,"status":"Aquecendo","hour":14,"start":7},{"time":"14:09 → 14:18","score":76,"persistence":76,"level":"SIGMA CORE","historicalRate":6.9,"recentRate":7.0,"last3000Rate":10.0,"status":"Estável","hour":14,"start":9},{"time":"14:37 → 14:46","score":76,"persistence":71,"level":"SIGMA CORE","historicalRate":7.42,"recentRate":10.2,"last3000Rate":5.13,"status":"Aquecendo","hour":14,"start":37},{"time":"14:22 → 14:31","score":76,"persistence":67,"level":"SIGMA CORE","historicalRate":6.44,"recentRate":11.0,"last3000Rate":7.5,"status":"Aquecendo","hour":14,"start":22}]},{"hour":15,"windows":[{"time":"15:43 → 15:52","score":100,"persistence":100,"level":"SIGMA ELITE","historicalRate":10.25,"recentRate":10.0,"last3000Rate":10.0,"status":"Estável","hour":15,"start":43},{"time":"15:45 → 15:54","score":98,"persistence":100,"level":"SIGMA ELITE","historicalRate":9.5,"recentRate":10.0,"last3000Rate":10.0,"status":"Estável","hour":15,"start":45},{"time":"15:44 → 15:53","score":98,"persistence":95,"level":"SIGMA ELITE","historicalRate":10.25,"recentRate":11.25,"last3000Rate":10.0,"status":"Estável","hour":15,"start":44},{"time":"15:42 → 15:51","score":98,"persistence":95,"level":"SIGMA ELITE","historicalRate":10.0,"recentRate":10.0,"last3000Rate":10.0,"status":"Estável","hour":15,"start":42},{"time":"15:47 → 15:56","score":96,"persistence":95,"level":"SIGMA ELITE","historicalRate":9.25,"recentRate":12.5,"last3000Rate":10.0,"status":"Aquecendo","hour":15,"start":47}]},{"hour":16,"windows":[{"time":"16:08 → 16:17","score":82,"persistence":85,"level":"SIGMA PRO","historicalRate":7.5,"recentRate":7.5,"last3000Rate":10.0,"status":"Estável","hour":16,"start":8},{"time":"16:47 → 16:56","score":82,"persistence":80,"level":"SIGMA PRO","historicalRate":8.0,"recentRate":7.5,"last3000Rate":15.0,"status":"Estável","hour":16,"start":47},{"time":"16:09 → 16:18","score":81,"persistence":85,"level":"SIGMA PRO","historicalRate":7.25,"recentRate":7.5,"last3000Rate":10.0,"status":"Estável","hour":16,"start":9},{"time":"16:48 → 16:57","score":81,"persistence":75,"level":"SIGMA PRO","historicalRate":7.25,"recentRate":8.75,"last3000Rate":15.0,"status":"Aquecendo","hour":16,"start":48},{"time":"16:46 → 16:55","score":80,"persistence":75,"level":"SIGMA PRO","historicalRate":7.75,"recentRate":7.5,"last3000Rate":15.0,"status":"Estável","hour":16,"start":46}]},{"hour":17,"windows":[{"time":"17:47 → 17:56","score":86,"persistence":90,"level":"SIGMA PRO","historicalRate":8.27,"recentRate":7.5,"last3000Rate":10.0,"status":"Estável","hour":17,"start":47},{"time":"17:49 → 17:58","score":86,"persistence":90,"level":"SIGMA PRO","historicalRate":8.52,"recentRate":7.5,"last3000Rate":10.0,"status":"Perdendo força","hour":17,"start":49},{"time":"17:50 → 17:59","score":84,"persistence":90,"level":"SIGMA PRO","historicalRate":7.79,"recentRate":7.5,"last3000Rate":10.0,"status":"Estável","hour":17,"start":50},{"time":"17:48 → 17:57","score":83,"persistence":85,"level":"SIGMA PRO","historicalRate":8.02,"recentRate":7.5,"last3000Rate":10.0,"status":"Estável","hour":17,"start":48},{"time":"17:41 → 17:50","score":79,"persistence":85,"level":"SIGMA CORE","historicalRate":8.02,"recentRate":8.75,"last3000Rate":5.0,"status":"Estável","hour":17,"start":41}]},{"hour":18,"windows":[{"time":"18:25 → 18:34","score":90,"persistence":85,"level":"SIGMA ELITE","historicalRate":8.33,"recentRate":10.26,"last3000Rate":26.32,"status":"Aquecendo","hour":18,"start":25},{"time":"18:26 → 18:35","score":90,"persistence":85,"level":"SIGMA ELITE","historicalRate":9.09,"recentRate":8.97,"last3000Rate":26.32,"status":"Estável","hour":18,"start":26},{"time":"18:27 → 18:36","score":88,"persistence":90,"level":"SIGMA ELITE","historicalRate":8.84,"recentRate":7.69,"last3000Rate":21.05,"status":"Perdendo força","hour":18,"start":27},{"time":"18:46 → 18:55","score":88,"persistence":90,"level":"SIGMA ELITE","historicalRate":9.02,"recentRate":7.5,"last3000Rate":10.0,"status":"Perdendo força","hour":18,"start":46},{"time":"18:28 → 18:37","score":86,"persistence":90,"level":"SIGMA PRO","historicalRate":8.33,"recentRate":7.69,"last3000Rate":21.05,"status":"Estável","hour":18,"start":28}]},{"hour":19,"windows":[{"time":"19:05 → 19:14","score":91,"persistence":95,"level":"SIGMA ELITE","historicalRate":10.28,"recentRate":11.39,"last3000Rate":5.0,"status":"Aquecendo","hour":19,"start":5},{"time":"19:08 → 19:17","score":88,"persistence":85,"level":"SIGMA ELITE","historicalRate":10.03,"recentRate":10.13,"last3000Rate":5.0,"status":"Estável","hour":19,"start":8},{"time":"19:02 → 19:11","score":87,"persistence":100,"level":"SIGMA PRO","historicalRate":9.02,"recentRate":8.86,"last3000Rate":5.0,"status":"Estável","hour":19,"start":2},{"time":"19:00 → 19:09","score":86,"persistence":95,"level":"SIGMA PRO","historicalRate":8.5,"recentRate":10.0,"last3000Rate":5.0,"status":"Aquecendo","hour":19,"start":0},{"time":"19:09 → 19:18","score":86,"persistence":80,"level":"SIGMA PRO","historicalRate":9.77,"recentRate":10.13,"last3000Rate":5.0,"status":"Estável","hour":19,"start":9}]},{"hour":20,"windows":[{"time":"20:48 → 20:57","score":86,"persistence":90,"level":"SIGMA PRO","historicalRate":8.29,"recentRate":7.5,"last3000Rate":10.0,"status":"Estável","hour":20,"start":48},{"time":"20:07 → 20:16","score":85,"persistence":100,"level":"SIGMA PRO","historicalRate":7.5,"recentRate":12.5,"last3000Rate":5.0,"status":"Aquecendo","hour":20,"start":7},{"time":"20:46 → 20:55","score":85,"persistence":95,"level":"SIGMA PRO","historicalRate":7.54,"recentRate":7.5,"last3000Rate":10.0,"status":"Estável","hour":20,"start":46},{"time":"20:06 → 20:15","score":84,"persistence":95,"level":"SIGMA PRO","historicalRate":7.75,"recentRate":12.5,"last3000Rate":5.0,"status":"Aquecendo","hour":20,"start":6},{"time":"20:08 → 20:17","score":84,"persistence":95,"level":"SIGMA PRO","historicalRate":7.5,"recentRate":12.5,"last3000Rate":5.0,"status":"Aquecendo","hour":20,"start":8}]},{"hour":21,"windows":[{"time":"21:01 → 21:10","score":78,"persistence":90,"level":"SIGMA CORE","historicalRate":7.75,"recentRate":5.0,"last3000Rate":10.0,"status":"Perdendo força","hour":21,"start":1},{"time":"21:03 → 21:12","score":78,"persistence":85,"level":"SIGMA CORE","historicalRate":8.25,"recentRate":5.0,"last3000Rate":10.0,"status":"Perdendo força","hour":21,"start":3},{"time":"21:04 → 21:13","score":78,"persistence":85,"level":"SIGMA CORE","historicalRate":8.5,"recentRate":5.0,"last3000Rate":10.0,"status":"Perdendo força","hour":21,"start":4},{"time":"21:46 → 21:55","score":77,"persistence":95,"level":"SIGMA CORE","historicalRate":8.29,"recentRate":6.33,"last3000Rate":5.0,"status":"Perdendo força","hour":21,"start":46},{"time":"21:00 → 21:09","score":76,"persistence":90,"level":"SIGMA CORE","historicalRate":7.0,"recentRate":5.0,"last3000Rate":10.0,"status":"Perdendo força","hour":21,"start":0}]},{"hour":22,"windows":[{"time":"22:28 → 22:37","score":96,"persistence":90,"level":"SIGMA ELITE","historicalRate":9.75,"recentRate":11.25,"last3000Rate":10.0,"status":"Aquecendo","hour":22,"start":28},{"time":"22:29 → 22:38","score":96,"persistence":90,"level":"SIGMA ELITE","historicalRate":9.75,"recentRate":11.25,"last3000Rate":10.0,"status":"Aquecendo","hour":22,"start":29},{"time":"22:30 → 22:39","score":96,"persistence":90,"level":"SIGMA ELITE","historicalRate":9.5,"recentRate":10.0,"last3000Rate":10.0,"status":"Estável","hour":22,"start":30},{"time":"22:31 → 22:40","score":94,"persistence":90,"level":"SIGMA ELITE","historicalRate":9.0,"recentRate":10.0,"last3000Rate":10.0,"status":"Estável","hour":22,"start":31},{"time":"22:32 → 22:41","score":92,"persistence":90,"level":"SIGMA ELITE","historicalRate":8.5,"recentRate":11.25,"last3000Rate":10.0,"status":"Aquecendo","hour":22,"start":32}]},{"hour":23,"windows":[{"time":"23:40 → 23:49","score":90,"persistence":90,"level":"SIGMA ELITE","historicalRate":7.52,"recentRate":12.66,"last3000Rate":10.0,"status":"Aquecendo","hour":23,"start":40},{"time":"23:41 → 23:50","score":89,"persistence":90,"level":"SIGMA ELITE","historicalRate":7.29,"recentRate":12.66,"last3000Rate":10.0,"status":"Aquecendo","hour":23,"start":41},{"time":"23:45 → 23:54","score":89,"persistence":90,"level":"SIGMA ELITE","historicalRate":7.29,"recentRate":12.66,"last3000Rate":20.0,"status":"Aquecendo","hour":23,"start":45},{"time":"23:42 → 23:51","score":88,"persistence":90,"level":"SIGMA ELITE","historicalRate":7.04,"recentRate":13.92,"last3000Rate":15.0,"status":"Aquecendo","hour":23,"start":42},{"time":"23:44 → 23:53","score":87,"persistence":90,"level":"SIGMA PRO","historicalRate":6.78,"recentRate":13.92,"last3000Rate":20.0,"status":"Aquecendo","hour":23,"start":44}]}];

function renderHourSelector(){
  const box=document.getElementById('hourSelector');
  if(!box)return;
  box.innerHTML=Array.from({length:24},(_,hour)=>`<button class="hour-btn ${hour===15?'active':''}" onclick="selectOperationalHour(${hour},this)">${String(hour).padStart(2,'0')}h</button>`).join('');
}

function radarBase(){
  return window.SIGMA_BASE_20||{hourlyData,heatValues:[]};
}
function radarIntensityLabel(score){
  if(score>=90)return 'Muito alta';
  if(score>=80)return 'Alta';
  if(score>=68)return 'Boa';
  if(score>=52)return 'Moderada';
  if(score>=35)return 'Baixa';
  return 'Muito baixa';
}
function radarLevel(score){
  if(score>=90)return 'SIGMA ELITE';
  if(score>=80)return 'SIGMA PRO';
  return 'SIGMA CORE';
}
function radarExpectedWhites(avgHeat,score){
  const expected=Math.max(0.15,((avgHeat-1)/8)*2.65+(score>=90?.25:score>=80?.12:0));
  let min,max,label;
  if(expected>=2.35){min=2;max=3;label='Pode esperar de 2 a 3 brancos';}
  else if(expected>=1.55){min=1;max=2;label='Pode esperar de 1 a 2 brancos';}
  else if(expected>=.85){min=1;max=1;label='Maior expectativa de 1 branco';}
  else {min=0;max=1;label='Baixa expectativa: 0 a 1 branco';}
  return {average:expected,label,min,max};
}
function radarWindowTime(hour,start){
  const end=start+9;
  return `${String(hour).padStart(2,'0')}:${String(start).padStart(2,'0')} → ${String(hour).padStart(2,'0')}:${String(end).padStart(2,'0')}`;
}
function buildRadarWindows(hour){
  const base=radarBase();
  const heat=((base.heatValues||[])[hour]||[]).map(Number);
  const official=((base.hourlyData||hourlyData)[hour]?.windows||[]);
  const officialByStart=new Map(official.map(w=>[Number(w.start),w]));
  const values=heat.length===60?heat:Array.from({length:60},(_,m)=>{
    const exact=officialByStart.get(m);
    return exact?Math.max(1,Math.min(9,(Number(exact.score)||50)/11)):4.5;
  });
  const windows=[];
  for(let start=0;start<=50;start++){
    const slice=values.slice(start,start+10);
    const avg=slice.reduce((a,b)=>a+b,0)/10;
    const spread=Math.max(...slice)-Math.min(...slice);
    const density=slice.filter(v=>v>=7).length;
    let score=Math.round(Math.max(0,Math.min(100,avg*10+density*1.8-spread*.8)));
    const officialWindow=officialByStart.get(start);
    if(officialWindow)score=Math.round(score*.35+(Number(officialWindow.score)||score)*.65);
    const persistence=Math.round(Math.max(18,Math.min(100,score*.72+density*3.2-spread)));
    const expectation=radarExpectedWhites(avg,score);
    windows.push({hour,start,time:radarWindowTime(hour,start),score,persistence,avgHeat:avg,expectation,level:radarLevel(score)});
  }
  return windows;
}
function setRadarText(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}
function selectOperationalHour(hour,btn){
  document.querySelectorAll('.hour-btn').forEach(b=>b.classList.remove('active'));
  if(btn)btn.classList.add('active');
  const windows=buildRadarWindows(hour);
  const best=windows.reduce((a,b)=>b.score>a.score?b:a);
  const worst=windows.reduce((a,b)=>b.score<a.score?b:a);
  setRadarText('operationalBestTime',best.time);
  setRadarText('operationalLevel',best.level);
  setRadarText('operationalScore',best.score);
  setRadarText('operationalPersistence',best.persistence+'%');
  setRadarText('operationalIntensity',radarIntensityLabel(best.score));
  setRadarText('operationalWhiteExpectation',best.expectation.label);
  setRadarText('operationalWhiteAverage',best.expectation.average.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1}));
  setRadarText('operationalExpectationText',`Faixa estimada pela concentração histórica dos minutos ${String(best.start).padStart(2,'0')} a ${String(best.start+9).padStart(2,'0')} nesta hora.`);
  setRadarText('operationalWorstTime',worst.time);
  setRadarText('operationalWorstScore',worst.score);
  setRadarText('operationalWorstPersistence',worst.persistence+'%');
  setRadarText('operationalWorstIntensity',radarIntensityLabel(worst.score));
  setRadarText('operationalWorstAverage',worst.expectation.average.toLocaleString('pt-BR',{minimumFractionDigits:1,maximumFractionDigits:1}));
  setRadarText('operationalAvoidMessage',worst.expectation.average<.85?'Baixa concentração de brancos':'Menor concentração desta hora');
  setRadarText('operationalAvoidText',`Evite priorizar operações entre ${worst.time.replace(' → ',' e ')}; foi a faixa móvel mais fraca entre as 51 analisadas.`);
  const gap=best.score-worst.score;
  const state=best.score>=88?'HORA FAVORÁVEL':best.score>=76?'HORA INTERESSANTE':'HORA MODERADA';
  setRadarText('operationalState',state);
  setRadarText('operationalStateText',`Melhor faixa: ${best.time}. Janela a evitar: ${worst.time}. Diferença estatística de ${gap} pontos entre os extremos da hora.`);
  const stateEl=document.getElementById('operationalState');
  if(stateEl)stateEl.style.color=best.score>=88?'var(--green)':best.score>=76?'#f2c94c':'var(--muted)';
}

const periods=[
  {label:'00h → 05h',start:0},
  {label:'06h → 11h',start:6},
  {label:'12h → 17h',start:12},
  {label:'18h → 23h',start:18}
];
function renderPeriodSelector(){
  const selector=document.getElementById('periodSelector');
  if(!selector)return;
  selector.innerHTML=periods.map((p,i)=>`<button class="period-btn ${i===0?'active':''}" onclick="selectPeriod(${p.start},this)">${p.label}</button>`).join('');
}
function selectPeriod(start,btn){
  document.querySelectorAll('.period-btn').forEach(b=>b.classList.remove('active'));
  if(btn) btn.classList.add('active');
  const rows=hourlyData.slice(start,start+6).map(x=>{
    const b=x.windows[0];
    return `<tr><td><strong>${String(x.hour).padStart(2,'0')}h</strong></td><td>${b.time}</td><td>${b.level}</td><td class="score">${b.score}</td></tr>`;
  }).join('');
  const sessionTable=document.getElementById('sessionTable');
  if(sessionTable)sessionTable.innerHTML=rows;
}

const rankingTimes=[{"time":"17:41","score":82,"persistence":40,"level":"SIGMA PRO"},{"time":"01:06","score":80,"persistence":35,"level":"SIGMA PRO"},{"time":"02:40","score":80,"persistence":35,"level":"SIGMA PRO"},{"time":"04:30","score":80,"persistence":35,"level":"SIGMA PRO"},{"time":"07:25","score":80,"persistence":35,"level":"SIGMA PRO"},{"time":"13:07","score":80,"persistence":35,"level":"SIGMA PRO"},{"time":"21:54","score":80,"persistence":35,"level":"SIGMA PRO"},{"time":"01:26","score":79,"persistence":30,"level":"SIGMA CORE"},{"time":"02:45","score":79,"persistence":30,"level":"SIGMA CORE"},{"time":"03:34","score":79,"persistence":30,"level":"SIGMA CORE"},{"time":"03:35","score":79,"persistence":30,"level":"SIGMA CORE"},{"time":"06:22","score":79,"persistence":30,"level":"SIGMA CORE"},{"time":"07:07","score":79,"persistence":30,"level":"SIGMA CORE"},{"time":"08:48","score":79,"persistence":30,"level":"SIGMA CORE"},{"time":"10:41","score":79,"persistence":30,"level":"SIGMA CORE"},{"time":"12:49","score":79,"persistence":30,"level":"SIGMA CORE"},{"time":"19:05","score":79,"persistence":30,"level":"SIGMA CORE"},{"time":"22:20","score":79,"persistence":30,"level":"SIGMA CORE"},{"time":"04:25","score":78,"persistence":25,"level":"SIGMA CORE"},{"time":"05:32","score":78,"persistence":25,"level":"SIGMA CORE"},{"time":"08:24","score":78,"persistence":25,"level":"SIGMA CORE"},{"time":"16:17","score":76,"persistence":35,"level":"SIGMA CORE"},{"time":"05:31","score":72,"persistence":25,"level":"SIGMA CORE"},{"time":"06:06","score":72,"persistence":25,"level":"SIGMA CORE"},{"time":"07:31","score":72,"persistence":25,"level":"SIGMA CORE"},{"time":"07:53","score":72,"persistence":25,"level":"SIGMA CORE"},{"time":"10:56","score":72,"persistence":25,"level":"SIGMA CORE"},{"time":"11:30","score":72,"persistence":25,"level":"SIGMA CORE"},{"time":"11:51","score":72,"persistence":25,"level":"SIGMA CORE"},{"time":"12:38","score":72,"persistence":25,"level":"SIGMA CORE"}];

document.getElementById('rankTable').innerHTML=rankingTimes.map((c,i)=>`
<tr>
  <td class="rank">${String(i+1).padStart(2,'0')}</td>
  <td><strong>${c.time}</strong></td>
  <td>${c.level}</td>
  <td>${c.persistence}%</td>
  <td class="score">${c.score}</td>
</tr>`).join('');

function pad2(value){return String(value).padStart(2,'0')}
function addDays(date,days){const copy=new Date(date);copy.setDate(copy.getDate()+days);return copy}
function clamp(value,min,max){return Math.max(min,Math.min(max,value))}

function buildTrendSlots(){
  const base=(window.SIGMA_BASE_20&&window.SIGMA_BASE_20.hourlyData)||hourlyData;
  const strengths=base.map(item=>{
    const windows=(item.windows||[]).slice(0,5);
    const avgScore=windows.reduce((sum,w)=>sum+(Number(w.score)||0),0)/Math.max(1,windows.length);
    const avgPersistence=windows.reduce((sum,w)=>sum+(Number(w.persistence)||0),0)/Math.max(1,windows.length);
    const historical=windows.reduce((sum,w)=>sum+(Number(w.historicalRate)||0),0)/Math.max(1,windows.length);
    const recent=windows.reduce((sum,w)=>sum+(Number(w.recentRate)||0),0)/Math.max(1,windows.length);
    const composite=avgScore*.52+avgPersistence*.28+clamp(historical*5,0,100)*.12+clamp(recent*4,0,100)*.08;
    return {hour:item.hour,score:Math.round(composite),persistence:Math.round(avgPersistence),peak:windows[0]};
  });

  const candidates=[];
  for(let startHour=0;startHour<24;startHour++){
    for(const duration of [2,3]){
      if(startHour+duration>24)continue;
      const block=strengths.slice(startHour,startHour+duration);
      const score=Math.round(block.reduce((s,x)=>s+x.score,0)/duration);
      const persistence=Math.round(block.reduce((s,x)=>s+x.persistence,0)/duration);
      const peak=Math.max(...block.map(x=>Number(x.peak?.score)||0));
      candidates.push({startHour,endHour:startHour+duration,score:Math.round(score*.82+peak*.18),persistence});
    }
  }

  candidates.sort((a,b)=>b.score-a.score||b.persistence-a.persistence);
  const chosen=[];
  for(const item of candidates){
    if(chosen.some(x=>Math.abs(x.startHour-item.startHour)<2))continue;
    chosen.push(item);
    if(chosen.length===7)break;
  }
  return chosen;
}

function agendaConfidence(score){
  if(score>=91)return {label:'Probabilidade muito alta',level:'SIGMA ELITE'};
  if(score>=86)return {label:'Probabilidade alta',level:'SIGMA PRO'};
  if(score>=80)return {label:'Boa probabilidade',level:'SIGMA CORE'};
  return {label:'Probabilidade moderada',level:'SIGMA CORE'};
}

function renderTrendAgenda(){
  const container=document.getElementById('trendAgenda');
  if(!container)return;
  const now=new Date();
  const slots=buildTrendSlots();
  const days=[];
  for(let offset=0;offset<7;offset++){
    const date=addDays(now,offset);
    let selected=slots[(offset*2)%slots.length];
    if(offset===0 && selected.endHour<=now.getHours())selected=slots.find(s=>s.endHour>now.getHours())||slots[0];
    const secondary=slots.find((s,i)=>i!==((offset*2)%slots.length)&&Math.abs(s.startHour-selected.startHour)>=4);
    const windows=[selected];
    if(secondary && (offset===1||offset===3||offset===5))windows.push(secondary);
    days.push({date,offset,windows});
  }

  const total=days.reduce((sum,d)=>sum+d.windows.length,0);
  const count=document.getElementById('agendaWindowCount');
  if(count)count.textContent=total;
  const period=document.getElementById('agendaPeriod');
  if(period){
    const first=days[0].date.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
    const last=days[days.length-1].date.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
    period.textContent=`${first} a ${last}`;
  }

  container.innerHTML=days.map(day=>{
    const dateLabel=day.date.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'});
    const weekday=day.date.toLocaleDateString('pt-BR',{weekday:'long'});
    const relative=day.offset===0?'HOJE':day.offset===1?'AMANHÃ':`EM ${day.offset} DIAS`;
    return `<article class="agenda-day">
      <div class="agenda-day-date">
        <span class="weekday">${weekday}</span>
        <strong>${dateLabel}</strong>
        <span class="relative">${relative}</span>
      </div>
      <div class="agenda-window-list">
        ${day.windows.map((slot,index)=>{
          const confidence=agendaConfidence(slot.score);
          return `<div class="agenda-window ${index===0?'best':''}">
            <div class="agenda-time">${pad2(slot.startHour)}:00 às ${pad2(slot.endHour)}:00<span>POSSÍVEL JANELA DE AQUECIMENTO</span></div>
            <div class="agenda-confidence"><strong>${confidence.label}</strong><div class="bar"><i style="width:${slot.score}%"></i></div><span class="small">${confidence.level} · ${slot.persistence}% persistência</span></div>
            <div class="agenda-score"><strong>${slot.score}</strong><span>SCORE</span></div>
          </div>`;
        }).join('')}
      </div>
    </article>`;
  }).join('');
}

renderTrendAgenda();

renderHourSelector();
selectOperationalHour(15,document.querySelectorAll('.hour-btn')[15]);
