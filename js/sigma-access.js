
(() => {
  "use strict";
  const API_BASE = "https://sigma-live-server.onrender.com";
  const STORAGE = { key: "sigma_access_license", device: "sigma_access_device", session: "sigma_access_session" };
  const gate = document.getElementById("sigmaAccessGate");
  const title = document.getElementById("sigmaAccessTitle");
  const description = document.getElementById("sigmaAccessDescription");
  const form = document.getElementById("sigmaAccessForm");
  const input = document.getElementById("sigmaLicenseInput");
  const button = document.getElementById("sigmaActivateButton");
  const message = document.getElementById("sigmaAccessMessage");
  const account = document.getElementById("sigmaAccessAccount");
  const forget = document.getElementById("sigmaForgetLicense");
  let heartbeatTimer = null;

  document.documentElement.classList.add("sigma-access-locked");

  function getDeviceId() {
    let id = localStorage.getItem(STORAGE.device);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `web-${Date.now()}-${Math.random().toString(16).slice(2)}`);
      localStorage.setItem(STORAGE.device, id);
    }
    return id;
  }

  function normalizeKey(value) { return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6); }
  function setMessage(text, type = "") { message.textContent = text || ""; message.className = `sigma-access-message ${type}`.trim(); }
  function showForm(text = "Digite a chave liberada pelo administrador.") {
    title.textContent = "Ativação necessária"; description.textContent = text; form.hidden = false; account.hidden = true; forget.hidden = true; button.disabled = false; button.textContent = "ATIVAR ORION"; setTimeout(() => input.focus(), 50);
  }
  function unlock(license) {
    title.textContent = "Acesso liberado";
    description.textContent = "Licença validada com sucesso.";
    form.hidden = true;
    account.hidden = false;
    account.innerHTML = `<strong>${escapeHtml(license.display_name || "Cliente SIGMA")}</strong><br>${escapeHtml(license.plan || "")}`;
    setMessage("Abrindo o ORION...", "success");
    setTimeout(() => { gate.classList.add("unlocked"); document.documentElement.classList.remove("sigma-access-locked"); }, 420);
    startHeartbeat();
  }
  function escapeHtml(value) { const el = document.createElement("div"); el.textContent = String(value); return el.innerHTML; }

  async function call(path, payload) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${API_BASE}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), signal: controller.signal });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) { const err = new Error(data.message || "Falha ao validar a licença."); err.code = data.error; throw err; }
      return data;
    } finally { clearTimeout(timeout); }
  }

  async function activate(key) {
    button.disabled = true; button.textContent = "ATIVANDO..."; setMessage("Conferindo licença...");
    try {
      const payload = await call("/api/access/activate", { license_key: key, device_id: getDeviceId(), device_name: `${navigator.platform || "Web"} • ${navigator.userAgent.slice(0, 70)}` });
      localStorage.setItem(STORAGE.key, key); localStorage.setItem(STORAGE.session, payload.session_id); unlock(payload.license);
    } catch (error) {
      setMessage(error.message); button.disabled = false; button.textContent = "ATIVAR ORION";
      if (error.code === "DEVICE_MISMATCH") forget.hidden = false;
    }
  }

  async function validateSaved() {
    const key = normalizeKey(localStorage.getItem(STORAGE.key)); const sessionId = localStorage.getItem(STORAGE.session);
    if (!key || !sessionId) return showForm();
    try {
      const payload = await call("/api/access/validate", { license_key: key, device_id: getDeviceId(), session_id: sessionId });
      unlock(payload.license);
    } catch (error) {
      localStorage.removeItem(STORAGE.session);
      showForm(error.code === "LICENSE_BLOCKED" || error.code === "LICENSE_EXPIRED" ? error.message : "Sua sessão precisa ser ativada novamente.");
      setMessage(error.message); input.value = key; forget.hidden = false;
    }
  }

  function startHeartbeat() {
    clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(async () => {
      const key = normalizeKey(localStorage.getItem(STORAGE.key)); const sessionId = localStorage.getItem(STORAGE.session);
      if (!key || !sessionId) return;
      try { await call("/api/access/validate", { license_key: key, device_id: getDeviceId(), session_id: sessionId }); }
      catch (error) { clearInterval(heartbeatTimer); gate.classList.remove("unlocked"); document.documentElement.classList.add("sigma-access-locked"); showForm(error.message); setMessage(error.message); }
    }, 60000);
  }

  form.addEventListener("submit", event => { event.preventDefault(); const key = normalizeKey(input.value); input.value = key; if (key.length !== 6) return setMessage("Digite os seis caracteres da licença."); activate(key); });
  input.addEventListener("input", () => { input.value = normalizeKey(input.value); setMessage(""); });
  forget.addEventListener("click", () => { localStorage.removeItem(STORAGE.key); localStorage.removeItem(STORAGE.session); input.value = ""; showForm(); });
  if (DEV_MODE) {
    gate.classList.add("unlocked");
    document.documentElement.classList.remove("sigma-access-locked");
  } else {
    validateSaved();
  }
})();
