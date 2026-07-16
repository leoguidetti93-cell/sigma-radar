const {json,supabase,decorate,brazilDate}=require('./_lib');

module.exports=async function handler(req,res){
  if(req.method!=='GET')return json(res,405,{error:'Método não permitido'});
  try{
    const active=await supabase('sinais?select=*&status=eq.ativo&order=data_operacao.asc,horario.asc');
    const history=await supabase('sinais?select=*&status=in.(pago,falhou)&order=encerrado_em.desc&limit=10');
    const today=brazilDate();
    const todayRows=await supabase(`sinais?select=status&data_operacao=eq.${today}&status=in.(pago,falhou)`);
    const paid=(todayRows||[]).filter(item=>item.status==='pago').length;
    const failed=(todayRows||[]).filter(item=>item.status==='falhou').length;
    const total=paid+failed;
    return json(res,200,{
      active:decorate(active),
      history:decorate(history),
      stats:{paid,failed,accuracy:total?Math.round(paid/total*100):null}
    });
  }catch(error){
    console.error(error);
    return json(res,500,{error:'Falha ao consultar sinais'});
  }
};
