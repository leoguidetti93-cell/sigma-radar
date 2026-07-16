const {env,json,signToken}=require('./_lib');

module.exports=async function handler(req,res){
  if(req.method!=='POST')return json(res,405,{error:'Método não permitido'});
  const password=String(req.body?.password||'');
  if(!password||password!==env('ANALISTA_PASSWORD')){
    return json(res,401,{error:'Senha inválida'});
  }
  return json(res,200,{token:signToken()});
};
