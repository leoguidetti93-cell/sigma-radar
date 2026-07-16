const {json,verifyToken,supabase,decorate,parseMeta,encodeMeta}=require('./_lib');

module.exports=async function handler(req,res){
  if(!verifyToken(req))return json(res,401,{error:'Sessão inválida'});

  try{
    if(req.method==='GET'){
      const active=await supabase('sinais?select=*&status=eq.ativo&order=data_operacao.asc,horario.asc');
      return json(res,200,{active:decorate(active)});
    }

    if(req.method==='POST'){
      const active=await supabase('sinais?select=id&status=eq.ativo');
      if((active||[]).length>=3)return json(res,409,{error:'Já existem três sinais ativos.'});

      const date=String(req.body?.data_operacao||'');
      const time=String(req.body?.horario||'');
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time)){
        return json(res,400,{error:'Data ou horário inválido.'});
      }

      const body={
        data_operacao:date,
        horario:time,
        observacao:encodeMeta({texto:req.body?.observacao,confianca:req.body?.confianca}),
        status:'ativo',
        publicado_em:new Date().toISOString(),
        encerrado_em:null
      };

      const created=await supabase('sinais',{
        method:'POST',
        headers:{'Prefer':'return=representation'},
        body:JSON.stringify(body)
      });
      return json(res,201,{signal:decorate(created)[0]});
    }

    if(req.method==='PATCH'){
      const id=Number(req.body?.id);
      const status=String(req.body?.status||'');
      if(!Number.isInteger(id)||!['pago','falhou'].includes(status)){
        return json(res,400,{error:'Dados inválidos.'});
      }

      const current=await supabase(`sinais?select=*&id=eq.${id}&limit=1`);
      if(!current?.length)return json(res,404,{error:'Sinal não encontrado.'});
      const meta=parseMeta(current[0].observacao);
      meta.minuto_resultado=status==='pago'?String(req.body?.minuto_resultado||current[0].horario):null;

      await supabase(`sinais?id=eq.${id}`,{
        method:'PATCH',
        headers:{'Prefer':'return=minimal'},
        body:JSON.stringify({
          status,
          observacao:encodeMeta(meta),
          encerrado_em:new Date().toISOString()
        })
      });
      return json(res,200,{ok:true});
    }

    if(req.method==='DELETE'){
      const id=Number(req.query?.id);
      if(!Number.isInteger(id))return json(res,400,{error:'ID inválido.'});
      await supabase(`sinais?id=eq.${id}`,{method:'DELETE',headers:{'Prefer':'return=minimal'}});
      return json(res,200,{ok:true});
    }

    return json(res,405,{error:'Método não permitido'});
  }catch(error){
    console.error(error);
    return json(res,500,{error:'Erro interno ao processar a operação.'});
  }
};
