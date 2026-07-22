/* ===== GESTOR DE BANCA ===== */
let bankSelectedEntries=24;
let bankSelectedUsage=95;
let currentBankPlan=[];

function bankMoney(cents){
  return (cents/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}
function ceilStakeCents(value){
  return Math.max(1,Math.ceil(value-1e-9));
}
function createProgression(firstStakeCents,entries,payout){
  const profitTarget=(payout-1)*firstStakeCents;
  const plan=[];
  let accumulated=0;

  for(let index=1;index<=entries;index++){
    const stake=index===1
      ? firstStakeCents
      : ceilStakeCents((profitTarget+accumulated)/(payout-1));

    accumulated+=stake;
    const returnCents=stake*payout;
    const profit=returnCents-accumulated;

    plan.push({
      index,
      stake,
      accumulated,
      returnCents,
      profit
    });
  }
  return plan;
}
function findMaximumFirstStake(budgetCents,entries,payout){
  let low=1,high=Math.max(1,budgetCents),best=1;

  while(low<=high){
    const middle=Math.floor((low+high)/2);
    const plan=createProgression(middle,entries,payout);
    const used=plan[plan.length-1].accumulated;

    if(used<=budgetCents){
      best=middle;
      low=middle+1;
    }else{
      high=middle-1;
    }
  }
  return best;
}
function buildBankPlan(bankrollCents,usage,entries,payout){
  const budget=Math.floor(bankrollCents*usage/100);
  const firstStake=findMaximumFirstStake(budget,entries,payout);
  const plan=createProgression(firstStake,entries,payout);
  const used=plan[plan.length-1].accumulated;

  return {
    entries,
    payout,
    budget,
    firstStake,
    plan,
    used,
    reserve:bankrollCents-used,
    fixedProfit:plan[0].profit
  };
}
function selectBankEntries(entries,button){
  bankSelectedEntries=entries;
  document.querySelectorAll('#bankEntryOptions button').forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  calculateBankManager();
}
function selectBankUsage(usage,button){
  bankSelectedUsage=usage;
  document.querySelectorAll('#bankUsageOptions button').forEach(item=>item.classList.remove('active'));
  button.classList.add('active');
  calculateBankManager();
}
function selectComparedPlan(entries){
  bankSelectedEntries=entries;
  document.querySelectorAll('#bankEntryOptions button').forEach(item=>{
    item.classList.toggle('active',Number(item.dataset.entries)===entries);
  });
  calculateBankManager();
}
function bankRiskInfo(usage){
  if(usage<=60)return {label:'CONSERVADOR',className:'low'};
  if(usage<=75)return {label:'MODERADO',className:'medium'};
  return {label:'ALTO',className:'high'};
}
function calculateBankManager(){
  const bankrollValue=Number(document.getElementById('bankrollValue')?.value||0);
  const payout=Number(document.getElementById('bankPayout')?.value||14);
  const bankrollCents=Math.max(100,Math.round(bankrollValue*100));

  const result=buildBankPlan(
    bankrollCents,
    bankSelectedUsage,
    bankSelectedEntries,
    payout
  );
  currentBankPlan=result.plan;

  document.getElementById('bankUsed').textContent=bankMoney(result.used);
  document.getElementById('bankReserve').textContent=bankMoney(result.reserve);
  document.getElementById('bankFirstStake').textContent=bankMoney(result.firstStake);
  document.getElementById('bankFixedProfit').textContent=bankMoney(result.fixedProfit);
  document.getElementById('bankUsageLabel').textContent=`${bankSelectedUsage}% da banca`;
  document.getElementById('bankBudgetLabel').textContent=bankMoney(result.budget);
  document.getElementById('bankUsageBar').style.width=`${Math.min(100,result.used/bankrollCents*100)}%`;
  document.getElementById('bankPlanTitle').textContent=`Plano de ${bankSelectedEntries} entradas • ${payout}x`;

  const risk=bankRiskInfo(bankSelectedUsage);
  const badge=document.getElementById('bankRiskBadge');
  badge.textContent=risk.label;
  badge.className=`bank-risk ${risk.className}`;

  document.getElementById('bankPlanBody').innerHTML=result.plan.map(row=>`
    <tr>
      <td>${String(row.index).padStart(2,'0')}</td>
      <td>${bankMoney(row.stake)}</td>
      <td>${bankMoney(row.accumulated)}</td>
      <td>${bankMoney(row.returnCents)}</td>
      <td>${bankMoney(row.profit)}</td>
    </tr>
  `).join('');

  const comparisons=[18,24,30].map(entries=>
    buildBankPlan(bankrollCents,bankSelectedUsage,entries,payout)
  );

  document.getElementById('bankComparison').innerHTML=comparisons.map(item=>`
    <div class="bank-compare-item ${item.entries===bankSelectedEntries?'active':''}" onclick="selectComparedPlan(${item.entries})">
      <span>${item.entries} ENTRADAS</span>
      <strong>${bankMoney(item.fixedProfit)}</strong>
      <small>Lucro fixo<br>1ª entrada: ${bankMoney(item.firstStake)}<br>Uso: ${bankMoney(item.used)}</small>
    </div>
  `).join('');
}
function copyBankPlan(){
  if(!currentBankPlan.length)return;

  const lines=currentBankPlan.map(row=>
    `${String(row.index).padStart(2,'0')} — ${bankMoney(row.stake)}`
  );
  navigator.clipboard.writeText(lines.join('\n')).then(()=>{
    const button=document.getElementById('copyBankPlanBtn');
    if(!button)return;
    const original=button.textContent;
    button.textContent='✓ Sequência copiada';
    setTimeout(()=>button.textContent=original,1600);
  });
}
calculateBankManager();
