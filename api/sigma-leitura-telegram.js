const { json } = require('./_lib');

/**
 * ENDPOINT DESATIVADO DE FORMA DEFINITIVA.
 *
 * O motor COLOR e todos os envios (SIGNAL, G1, RESULT e resumos)
 * são exclusivos do SIGMA Live Server no Render.
 *
 * Esta trava fica no backend da Vercel para bloquear inclusive:
 * - navegadores com JavaScript antigo em cache;
 * - abas que permaneceram abertas antes do deploy;
 * - versões antigas do ORION ainda tentando enviar eventos.
 */
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Método não permitido.' });
  }

  return json(res, 410, {
    ok: false,
    disabled: true,
    code: 'COLOR_SERVER_ONLY',
    error: 'Envio COLOR pelo navegador desativado. O SIGMA Server é a única fonte oficial.'
  });
};
