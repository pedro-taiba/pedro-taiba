/* =========================================================
   Marcaí — Marca do negócio + Equipa de agentes de IA
   ========================================================= */

const AG = {
  rececionista: { icon: '💬', name: 'Rececionista', desc: 'Responde no WhatsApp 24 horas por dia e marca sozinho na agenda.', how: ['Responde a dúvidas sobre serviços, preços e horários', 'Propõe horas livres reais e marca na agenda', 'Remarca e desmarca a pedido do cliente', 'Online: liga-se ao número de WhatsApp do negócio'] },
  antifaltas: { icon: '⏰', name: 'Anti-faltas', desc: 'Envia lembretes com confirmação e preenche vagas com a lista de espera.', how: ['Na véspera envia o lembrete com "Responde SIM ou NÃO"', 'Se o cliente disser NÃO, liberta o horário', 'Quando abre uma vaga, avisa quem está na lista de espera', 'Fecha sozinho as marcações dos dias anteriores'] },
  recuperador: { icon: '💸', name: 'Recuperador', desc: 'Fala com os clientes que deixaram de vir, com mensagens pessoais.', how: ['Todas as semanas encontra quem não vem há X dias', 'Escreve uma mensagem pessoal com o serviço favorito', 'Não volta a falar com o mesmo cliente durante 30 dias', 'Pode incluir uma oferta à tua escolha'] },
  marketing: { icon: '📸', name: 'Marketing', desc: 'Cria posts para o Instagram para encher os dias mais vazios.', how: ['À segunda-feira analisa os horários livres da semana', 'Cria 3 posts com legenda, hashtags e ideia de foto', 'Foca-se nos dias e horas mais vazios', 'Copias e publicas em segundos'] },
  avaliacoes: { icon: '⭐', name: 'Avaliações', desc: 'Pede uma avaliação no Google depois de cada visita.', how: ['1 hora depois do serviço concluído', 'Envia uma mensagem simpática com o teu link do Google', 'Nunca pede duas vezes à mesma visita', 'Mais avaliações = mais clientes novos no Google Maps'] },
  gestor: { icon: '📊', name: 'Gestor', desc: 'Envia um resumo semanal com números e 3 sugestões concretas.', how: ['À segunda-feira de manhã', 'Receita, faltas e marcações vs semana anterior', '3 sugestões concretas (preços, horários, promoções)', 'E podes conversar com ele a qualquer hora'] }
};
const KINDS = Object.keys(AG);
function defaultAgents(on) { const o = {}; KINDS.forEach(k => o[k] = { enabled: !!on, mode: 'sugere', settings: {} }); return o; }
function ensureShape() {
  if (!S) return;
  const base = defaultAgents(false);
  S.agents = S.agents || {};
  KINDS.forEach(k => { S.agents[k] = Object.assign({}, base[k], S.agents[k] || {}); S.agents[k].settings = S.agents[k].settings || {}; });
  S.tasks = S.tasks || []; S.waitlist = S.waitlist || [];
  S.timeOff = S.timeOff || []; S.role = S.role || 'owner'; S.me = S.me || null;
  S.staff.forEach(t => { t.services = t.services || []; t.hours = t.hours || null; });
  S.biz.color = S.biz.color || '#1E5B47'; S.biz.logo = S.biz.logo || ''; S.biz.review = S.biz.review || '';
}
const _reload = reload;
reload = async function () { try { S = await DB.load(); ensureShape(); } catch (e) {} render(); };

/* ================= MARCA ================= */
function bizLogo(size, light) {
  const c = S.biz.color || '#1E5B47';
  if (S.biz.logo) return `<img class="blogo" src="${esc(S.biz.logo)}" style="width:${size}px;height:${size}px" alt="${esc(S.biz.name)}">`;
  return `<span class="blogo ph" style="width:${size}px;height:${size}px;background:${light ? 'rgba(255,255,255,.2)' : esc(c)};font-size:${Math.round(size * .38)}px">${esc(initials(S.biz.name))}</span>`;
}
const BRAND_COLORS = ['#1E5B47', '#17201C', '#3A6EA5', '#1F3A5F', '#8A5CB0', '#B8463B', '#C2185B', '#C98A1B', '#2F8C8C', '#6B4F3A'];
async function fileToLogo(file) {
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Imagem inválida')); i.src = URL.createObjectURL(file); });
  const max = 320, r = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.width * r)); c.height = Math.max(1, Math.round(img.height * r));
  const g = c.getContext('2d'); g.drawImage(img, 0, 0, c.width, c.height);
  // cor dominante (ignora branco, preto e transparente)
  let R = 0, G = 0, B = 0, n = 0;
  try {
    const d = g.getImageData(0, 0, c.width, c.height).data;
    for (let i = 0; i < d.length; i += 16) {
      const [r1, g1, b1, a] = [d[i], d[i + 1], d[i + 2], d[i + 3]];
      if (a < 200) continue; const mx = Math.max(r1, g1, b1), mn = Math.min(r1, g1, b1);
      if (mx > 235 && mn > 235) continue; if (mx < 25) continue; if (mx - mn < 25) continue;
      R += r1; G += g1; B += b1; n++;
    }
  } catch (e) {}
  let suggested = null;
  if (n > 20) {
    let r2 = R / n, g2 = G / n, b2 = B / n;
    const lum = (0.299 * r2 + 0.587 * g2 + 0.114 * b2) / 255;
    if (lum > 0.55) { const f = 0.55 / lum; r2 *= f; g2 *= f; b2 *= f; }
    suggested = '#' + [r2, g2, b2].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  }
  let type = 'image/webp', data = c.toDataURL(type, 0.9);
  if (!data.startsWith('data:image/webp')) { type = 'image/png'; data = c.toDataURL(type); }
  const blob = await new Promise(res => c.toBlob(res, type, 0.9));
  return { blob, data, suggested };
}
function brandSheet() {
  const st = { logo: S.biz.logo, color: S.biz.color || '#1E5B47', blob: null, data: null, suggested: null };
  const preview = () => `<div class="pubhead" style="background:${esc(st.color)};margin:0">${st.logo || st.data ? `<img class="blogo" src="${esc(st.data || st.logo)}" style="width:60px;height:60px;margin-bottom:10px" alt="">` : `<span class="blogo ph" style="width:60px;height:60px;background:rgba(255,255,255,.2);font-size:22px;margin-bottom:10px">${esc(initials(S.biz.name))}</span>`}<h1 style="font-size:24px">${esc(S.biz.name)}</h1><p>Assim te veem os teus clientes</p></div>`;
  openSheet(`<h2>Marca do negócio</h2>
    <div id="brPrev">${preview()}</div>
    <div class="grid2" style="margin:12px 0">
      <label class="btn ghost" style="cursor:pointer">📷 ${S.biz.logo ? 'Trocar logótipo' : 'Carregar logótipo'}<input type="file" id="brFile" accept="image/png,image/jpeg,image/webp" hidden></label>
      <button class="btn line" id="brDel" ${S.biz.logo ? '' : 'disabled'}>Remover</button>
    </div>
    <p class="small muted" style="margin-top:-4px">PNG ou JPG, de preferência quadrado. Ajustamos o tamanho sozinhos.</p>
    <label class="f"><span>Cor da marca</span><div class="chips" id="brCols" style="flex-wrap:wrap"></div></label>
    <label class="f"><span>Outra cor</span><input type="color" class="inp" id="brPick" value="${esc(st.color)}" style="height:46px;padding:4px"></label>
    <button class="btn block" id="brSave">Guardar marca</button>`, sh => {
    const drawCols = () => {
      const cols = [...new Set([st.suggested, ...BRAND_COLORS].filter(Boolean))];
      sh.querySelector('#brCols').innerHTML = cols.map(c => `<button class="chip cl" data-c="${c}" title="${c === st.suggested ? 'Cor do logótipo' : c}" style="background:${c};width:38px;height:38px;padding:0;border:3px solid ${c === st.color ? 'var(--ink)' : '#fff'};position:relative">${c === st.suggested ? '<span style="position:absolute;top:-8px;right:-8px;font-size:13px">✨</span>' : ''}</button>`).join('');
      sh.querySelectorAll('#brCols .cl').forEach(b => b.onclick = () => { st.color = b.dataset.c; sh.querySelector('#brPick').value = st.color; drawCols(); sh.querySelector('#brPrev').innerHTML = preview(); });
    };
    drawCols();
    sh.querySelector('#brPick').oninput = e => { st.color = e.target.value; drawCols(); sh.querySelector('#brPrev').innerHTML = preview(); };
    sh.querySelector('#brFile').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      if (f.size > 8e6) return toast('Imagem demasiado grande (máx. 8 MB)');
      try { const r = await fileToLogo(f); Object.assign(st, { blob: r.blob, data: r.data, suggested: r.suggested }); if (r.suggested) { st.color = r.suggested; sh.querySelector('#brPick').value = st.color; toast('Escolhemos a cor do teu logótipo ✨'); } drawCols(); sh.querySelector('#brPrev').innerHTML = preview(); }
      catch (err) { toast(DB.friendly(err)); }
    };
    sh.querySelector('#brDel').onclick = () => { st.logo = ''; st.data = null; st.blob = null; sh.querySelector('#brPrev').innerHTML = preview(); };
    sh.querySelector('#brSave').onclick = async e => {
      const btn = e.currentTarget; btn.disabled = true; btn.textContent = 'A guardar…';
      try {
        if (st.blob) st.logo = await DB.uploadLogo(S, st.blob, st.data);
        S.biz.logo = st.logo || ''; S.biz.color = st.color;
        await DB.saveBiz(S); closeSheet(); render(); toast('Marca guardada ✓');
      } catch (err) { btn.disabled = false; btn.textContent = 'Guardar marca'; toast(DB.friendly(err)); }
    };
  });
}

/* ================= AGENTES — ecrã ================= */
let agFilter = 'all', agBusy = {};
function weekAgo() { return new Date(Date.now() - 7 * 864e5).toISOString(); }
function agentStats() {
  const wk = weekAgo(), d7 = addDays(todayISO(), -7);
  const tasks = S.tasks.filter(t => t.created >= wk);
  const sent = tasks.filter(t => t.status === 'enviado').length;
  const aiBookings = S.bookings.filter(b => b.source === 'ia' && b.status !== 'cancelada' && (b.created ? b.created >= wk : b.date >= d7)).length;
  const recTasks = S.tasks.filter(t => t.kind === 'recuperador' && t.status === 'enviado' && t.clientId);
  const recovered = recTasks.filter(t => S.bookings.some(b => b.clientId === t.clientId && b.status !== 'cancelada' && b.date >= String(t.created).slice(0, 10))).length;
  const recVal = recTasks.filter(t => S.bookings.some(b => b.clientId === t.clientId && b.status !== 'cancelada' && b.date >= String(t.created).slice(0, 10)))
    .reduce((a, t) => a + (S.bookings.filter(b => b.clientId === t.clientId && b.date >= String(t.created).slice(0, 10) && b.status !== 'cancelada').reduce((x, b) => x + bPrice(b), 0)), 0);
  return { prepared: tasks.length, sent, aiBookings, recovered, recVal };
}
function vAgentes() {
  const pend = S.tasks.filter(t => t.status === 'pendente' && (agFilter === 'all' || t.kind === agFilter));
  const allPend = S.tasks.filter(t => t.status === 'pendente');
  const hist = S.tasks.filter(t => t.status !== 'pendente').slice(0, 8);
  const st = agentStats(); const on = KINDS.filter(k => S.agents[k].enabled).length;
  const locked = DB.cloud && !isPaid();
  return `<div class="top"><div><div class="k">Equipa de IA</div><h1>Os teus agentes</h1><div class="muted small">${on} de 6 a trabalhar${allPend.length ? ' · ' + allPend.length + ' tarefas para aprovar' : ''}</div></div></div>
  <div class="aihero"><div class="small" style="color:#CFE3DA;font-weight:600;text-transform:uppercase;letter-spacing:.06em">Esta semana</div>
    <div class="kgrid"><div><b>${st.prepared}</b><span>tarefas feitas</span></div><div><b>${st.sent}</b><span>mensagens enviadas</span></div><div><b>${st.aiBookings}</b><span>marcações pela IA</span></div><div><b>${st.recovered}</b><span>clientes recuperados${st.recVal ? ' · ' + eur(st.recVal) : ''}</span></div></div></div>
  ${locked ? `<div class="card small" style="background:var(--gold-soft);border-color:#F1DDB0">Os agentes trabalham sozinhos no plano Pro. <button class="lnk" onclick="plansSheet()"><b>Ver planos</b></button></div>` : ''}
  ${waCard()}
  <div class="grid2" style="margin-bottom:14px"><button class="btn ghost" onclick="simSheet()">📱 Testar Rececionista</button><button class="btn ghost" onclick="go('ia')">💬 Falar com o Gestor</button></div>
  <div class="card"><h3>Para aprovar <small>${allPend.length}</small></h3>
    ${allPend.length ? `<div class="chips" style="margin-bottom:6px"><button class="chip ${agFilter === 'all' ? 'on' : ''}" onclick="agFilter='all';render()">Todas</button>${KINDS.filter(k => allPend.some(t => t.kind === k)).map(k => `<button class="chip ${agFilter === k ? 'on' : ''}" onclick="agFilter='${k}';render()">${AG[k].icon} ${AG[k].name} (${allPend.filter(t => t.kind === k).length})</button>`).join('')}</div>` : ''}
    ${pend.length ? pend.slice(0, 25).map(taskCard).join('') + (pend.length > 25 ? `<p class="small muted" style="text-align:center">+${pend.length - 25} tarefas</p>` : '') : `<div class="empty">Tudo em dia ✨<br><span class="small">Quando um agente preparar algo, aparece aqui para aprovares.</span></div>`}
    ${pend.length > 1 && pend.every(t => t.type === 'relatorio' || t.type === 'info' || t.type === 'post') ? '' : ''}
  </div>
  <h3 style="margin:18px 2px 10px;font-size:19px">A equipa</h3>
  ${KINDS.map(agentCard).join('')}
  ${hist.length ? `<div class="card" style="margin-top:14px"><h3>Histórico <small>recente</small></h3>${hist.map(t => `<div class="row"><span style="font-size:18px">${AG[t.kind]?.icon || '•'}</span><div class="m"><b>${esc(t.title)}</b><span>${{ enviado: 'enviado', feito: 'feito', descartado: 'descartado' }[t.status]} · ${esc(relTime(t.created))}</span></div></div>`).join('')}</div>` : ''}`;
}
function relTime(iso) { const d = (Date.now() - Date.parse(iso)) / 6e4; if (d < 1) return 'agora'; if (d < 60) return Math.round(d) + ' min'; if (d < 1440) return Math.round(d / 60) + ' h'; return Math.round(d / 1440) + ' dias'; }
function agentCard(k) {
  const a = S.agents[k], m = AG[k];
  const pend = S.tasks.filter(t => t.kind === k && t.status === 'pendente').length;
  return `<div class="agent ${a.enabled ? 'on' : ''}" onclick="agentSheet('${k}')">
    <div class="aic">${m.icon}</div>
    <div class="m"><b>${m.name}${pend ? ` <span class="pill gold">${pend}</span>` : ''}</b><span>${a.enabled ? (a.mode === 'auto' ? '⚡ Automático' : '👀 Sugere, tu aprovas') + (a.lastRun ? ' · ' + relTime(a.lastRun) : '') : m.desc}</span></div>
    <button class="sw ${a.enabled ? 'on' : ''}" onclick="event.stopPropagation();toggleAgent('${k}')" aria-label="Ligar ${m.name}"><i></i></button>
  </div>`;
}
function bindAgentes() {}
async function toggleAgent(k) {
  S.agents[k].enabled = !S.agents[k].enabled; render();
  toast(AG[k].name + (S.agents[k].enabled ? ' ligado ✓' : ' desligado'));
  try { await DB.saveAgent(S, k); } catch (e) { toast(DB.friendly(e)); reload(); }
  if (S.agents[k].enabled && !DB.cloud && ['antifaltas', 'avaliacoes'].includes(k)) { runAgent(k, true); }
}
function taskCard(t) {
  const c = t.clientId ? cli(t.clientId) : null;
  const canAuto = DB.cloud && S.biz.wa && isPaid();
  let actions = '';
  if (t.phone) {
    actions = canAuto ? `<button class="btn sm wa" onclick="approveTask('${t.id}')">Enviar</button>`
      : `<a class="btn sm wa" href="${waLink(t.phone, t.body)}" target="_blank" rel="noopener" onclick="setTask('${t.id}','enviado')">Enviar no WhatsApp</a>`;
    actions += `<button class="btn sm line" onclick="editTask('${t.id}')">Editar</button>`;
    if (t.type === 'vaga') actions += `<button class="btn sm ghost" onclick="acceptVaga('${t.id}')">Aceitou → marcar</button>`;
  } else if (t.type === 'post') {
    actions = `<button class="btn sm" onclick="copy(S.tasks.find(x=>x.id==='${t.id}').body);setTask('${t.id}','feito')">Copiar legenda</button>`;
  } else {
    actions = `<button class="btn sm ghost" onclick="setTask('${t.id}','feito')">${t.type === 'info' ? 'Ok' : 'Lido ✓'}</button>`;
    if (t.kind === 'avaliacoes' && t.type === 'info') actions += `<button class="btn sm line" onclick="agentSheet('avaliacoes')">Configurar</button>`;
  }
  actions += `<button class="btn sm line" onclick="setTask('${t.id}','descartado')" aria-label="Descartar">✕</button>`;
  return `<div class="task"><div class="th"><span>${AG[t.kind]?.icon || '•'}</span><b>${esc(t.title)}</b><small>${esc(relTime(t.created))}</small></div>
    ${t.type === 'conversa' && t.payload?.pergunta ? `<div class="small muted" style="margin-bottom:4px">Cliente: "${esc(t.payload.pergunta)}"</div>` : ''}
    <div class="tb">${esc(t.body)}</div>
    ${t.type === 'post' && t.payload?.imagem ? `<div class="small muted" style="margin-top:6px">📷 ${esc(t.payload.imagem)}${t.payload.quando ? ' · 🕒 ' + esc(t.payload.quando) : ''}</div>` : ''}
    ${c && t.phone ? `<div class="small muted" style="margin-top:6px">Para ${esc(c.name)} · ${esc(c.phone)}</div>` : ''}
    <div class="ta">${actions}</div></div>`;
}
async function setTask(id, status) {
  const t = S.tasks.find(x => x.id === id); if (!t) return; t.status = status;
  setTimeout(render, 30);
  try { await DB.saveTask(S, t); } catch (e) { toast(DB.friendly(e)); }
}
async function approveTask(id) {
  toast('A enviar…');
  try { const r = await DB.agentApprove(id); const t = S.tasks.find(x => x.id === id); if (t) t.status = 'enviado'; render(); toast(r.sent ? 'Enviado pelo WhatsApp ✓' : 'Marcado como enviado'); }
  catch (e) { toast(DB.friendly(e)); }
}
function editTask(id) {
  const t = S.tasks.find(x => x.id === id);
  openSheet(`<h2>Editar mensagem</h2><textarea class="inp" id="etB" rows="7">${esc(t.body)}</textarea><button class="btn block" style="margin-top:10px" id="etS">Guardar</button>`, sh => {
    sh.querySelector('#etS').onclick = async () => { t.body = sh.querySelector('#etB').value.trim(); closeSheet(); render(); try { await DB.saveTask(S, t); } catch (e) { toast(DB.friendly(e)); } };
  });
}
async function acceptVaga(id) {
  const t = S.tasks.find(x => x.id === id); const p = t.payload || {}; const c = cli(t.clientId);
  const s = svc(p.service_id || p.serviceId); if (!s || !c) return toast('Dados da vaga incompletos');
  let staffId = p.staff_id || p.staffId;
  if (!freeSlots(p.date, s.id, staffId).includes(p.time)) { const m = freeAny(p.date, s.id)[p.time]; if (!m) return toast('Essa vaga já foi ocupada'); staffId = m[0]; }
  try {
    await addBooking({ serviceId: s.id, staffId, date: p.date, time: p.time, clientName: c.name, phone: c.phone }, 'ia');
    t.status = 'feito'; await DB.saveTask(S, t);
    const w = S.waitlist.find(x => x.id === (p.waitlist_id || p.waitlistId)); if (w) { S.waitlist = S.waitlist.filter(x => x !== w); await DB.removeWait(S, w.id); }
    render(); toast('Marcado ✓ ' + relDay(p.date) + ' às ' + p.time);
  } catch (e) { toast(DB.friendly(e)); }
}

/* ================= AGENTES — definições ================= */
function agentSheet(k) {
  const a = S.agents[k], m = AG[k], s = a.settings;
  let extra = '';
  if (k === 'antifaltas') extra = `
    <label class="f"><span>Enviar lembretes a partir das</span><select class="inp" id="asHora">${[16, 17, 18, 19, 20].map(h => `<option value="${h}" ${(s.hora ?? 18) == h ? 'selected' : ''}>${h}h do dia anterior</option>`).join('')}</select></label>
    <label class="chk"><input type="checkbox" id="asAuto" ${s.autoConcluir !== false ? 'checked' : ''}> Fechar sozinho as marcações dos dias anteriores como concluídas</label>
    <div class="card" style="margin-top:12px"><h3>Lista de espera <small>${S.waitlist.length}</small></h3>${waitlistHTML()}<button class="btn ghost block sm" style="margin-top:8px" onclick="waitSheet()">+ Adicionar à lista de espera</button></div>`;
  if (k === 'recuperador') extra = `
    <label class="f"><span>Falar com quem não vem há mais de</span><select class="inp" id="asDias">${[21, 28, 35, 45, 60, 90].map(d => `<option value="${d}" ${(s.dias ?? 35) == d ? 'selected' : ''}>${d} dias</option>`).join('')}</select></label>
    <label class="f"><span>Oferta (opcional)</span><input class="inp" id="asOferta" placeholder="ex.: 10% de desconto até domingo" value="${esc(s.oferta || '')}"></label>
    <label class="f"><span>Máximo de mensagens por semana</span><select class="inp" id="asMax">${[5, 10, 20, 40].map(d => `<option value="${d}" ${(s.max ?? 10) == d ? 'selected' : ''}>${d}</option>`).join('')}</select></label>`;
  if (k === 'marketing') extra = `
    <label class="f"><span>Tom dos posts</span><select class="inp" id="asTom">${['próximo e divertido', 'elegante e premium', 'direto e promocional', 'jovem e com humor'].map(d => `<option ${(s.tom ?? 'próximo e divertido') === d ? 'selected' : ''}>${d}</option>`).join('')}</select></label>`;
  if (k === 'avaliacoes') extra = `
    <label class="f"><span>Link de avaliações do Google</span><input class="inp" id="asReview" placeholder="https://g.page/r/..." value="${esc(S.biz.review || '')}"></label>
    <p class="small muted" style="margin-top:-6px">No Google Business Profile: <b>Pedir avaliações</b> → copiar link.</p>`;
  if (k === 'rececionista') extra = `
    <div class="card small" onclick="waSheet()" style="cursor:pointer">${waAuto() ? '⚡ <b>Modo automático ligado:</b> o Rececionista responde sozinho no WhatsApp do negócio, 24 horas por dia.' : '👆 <b>Modo 1 toque:</b> as mensagens ficam prontas em "Para aprovar" e envias cada uma com um toque no teu WhatsApp. O modo automático (responder sozinho 24h) chega em breve. <b>Saber mais ›</b>'}</div>
    <button class="btn ghost block" style="margin-bottom:10px" onclick="simSheet()">📱 Abrir simulador de WhatsApp</button>`;
  if (k === 'recuperador' || k === 'avaliacoes') extra += `<div class="card small">🔒 Por lei (RGPD), este agente só fala com clientes que aceitaram promoções: <b>${S.clients.filter(canPromo).length} de ${S.clients.length}</b> clientes. Os clientes dão o consentimento na página de reservas, ou podes registá-lo na ficha do cliente.</div>`;
  openSheet(`<div style="display:flex;gap:12px;align-items:center;margin-bottom:6px"><div class="aic" style="width:52px;height:52px;font-size:26px">${m.icon}</div><div style="flex:1"><h2 style="margin:0">${m.name}</h2><div class="small muted">${m.desc}</div></div></div>
    <div class="row" style="border:0"><div class="m"><b>Ligado</b><span>${a.enabled ? 'Está a trabalhar' : 'Desligado'}</span></div><button class="sw ${a.enabled ? 'on' : ''}" id="asOn"><i></i></button></div>
    <label class="f"><span>Modo de trabalho</span><div class="seg" id="asMode"><button data-m="sugere" class="${a.mode !== 'auto' ? 'on' : ''}">👀 Sugere<small>tu aprovas cada envio</small></button><button data-m="auto" class="${a.mode === 'auto' ? 'on' : ''}">⚡ Automático<small>${DB.cloud ? 'envia sozinho' : 'envia sozinho (online)'}</small></button></div></label>
    ${extra}
    <div class="card small"><b>Como trabalha</b><br>${m.how.map(h => '• ' + h).join('<br>')}</div>
    <div class="grid2"><button class="btn line" id="asSave">Guardar</button>${k !== 'rececionista' ? `<button class="btn" id="asRun">${agBusy[k] ? 'A trabalhar…' : '▶ Executar agora'}</button>` : `<button class="btn" onclick="simSheet()">Testar</button>`}</div>`, sh => {
    let on = a.enabled, mode = a.mode;
    sh.querySelector('#asOn').onclick = e => { on = !on; e.currentTarget.classList.toggle('on', on); };
    sh.querySelectorAll('#asMode button').forEach(b => b.onclick = () => { mode = b.dataset.m; sh.querySelectorAll('#asMode button').forEach(x => x.classList.toggle('on', x === b)); });
    const collect = () => {
      a.enabled = on; a.mode = mode;
      const v = id => sh.querySelector(id);
      if (k === 'antifaltas') { s.hora = +v('#asHora').value; s.autoConcluir = v('#asAuto').checked; }
      if (k === 'recuperador') { s.dias = +v('#asDias').value; s.oferta = v('#asOferta').value.trim(); s.max = +v('#asMax').value; }
      if (k === 'marketing') s.tom = v('#asTom').value;
    };
    const persistAll = async () => {
      collect();
      try {
        await DB.saveAgent(S, k);
        if (k === 'avaliacoes') { const rv = sh.querySelector('#asReview').value.trim(); if (rv !== S.biz.review) { S.biz.review = rv; await DB.saveBiz(S); } }
      } catch (e) { toast(DB.friendly(e)); }
    };
    sh.querySelector('#asSave').onclick = async () => { await persistAll(); closeSheet(); render(); toast('Guardado ✓'); };
    const run = sh.querySelector('#asRun');
    if (run) run.onclick = async () => { await persistAll(); closeSheet(); go('agentes'); runAgent(k); };
  });
}
function waitlistHTML() {
  if (!S.waitlist.length) return '<div class="small muted">Ninguém em espera. Quando alguém quiser um horário que está cheio, põe-no aqui e o agente avisa quando abrir vaga.</div>';
  return S.waitlist.map(w => `<div class="row"><div class="m"><b>${esc(cli(w.clientId)?.name || '?')}</b><span>${esc(svc(w.serviceId)?.name || '')} · ${esc(fmtDay(w.from))} a ${esc(fmtDay(w.to))}${w.notified ? ' · avisado' : ''}</span></div><button class="btn sm line" onclick="delWait('${w.id}')">✕</button></div>`).join('');
}
function waitSheet() {
  openSheet(`<h2>Lista de espera</h2>
    <label class="f"><span>Cliente</span><input class="inp" id="wN" list="wCli" placeholder="Nome"><datalist id="wCli">${S.clients.map(c => `<option value="${esc(c.name)}">`).join('')}</datalist></label>
    <label class="f"><span>Telemóvel</span><input class="inp" id="wP" inputmode="tel"></label>
    <label class="f"><span>Serviço</span><select class="inp" id="wS">${AS().map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label>
    <div class="grid2"><label class="f"><span>De</span><input type="date" class="inp" id="wF" value="${todayISO()}"></label><label class="f"><span>Até</span><input type="date" class="inp" id="wT" value="${addDays(todayISO(), 7)}"></label></div>
    <button class="btn block" id="wSave">Adicionar</button>`, sh => {
    const nm = sh.querySelector('#wN'), ph = sh.querySelector('#wP');
    nm.onchange = () => { const c = S.clients.find(x => x.name.toLowerCase() === nm.value.trim().toLowerCase()); if (c && !ph.value) ph.value = c.phone; };
    sh.querySelector('#wSave').onclick = async () => {
      if (!nm.value.trim()) return toast('Falta o nome');
      const { c, changed } = findOrCreateClient(nm.value, ph.value); if (changed) await persist('clients', c);
      const w = { id: uid(), clientId: c.id, serviceId: sh.querySelector('#wS').value, from: sh.querySelector('#wF').value, to: sh.querySelector('#wT').value, notes: '' };
      if (w.to < w.from) return toast('Datas inválidas');
      S.waitlist.push(w);
      try { await DB.saveWait(S, w); } catch (e) { toast(DB.friendly(e)); }
      toast('Na lista de espera ✓'); agentSheet('antifaltas');
    };
  });
}
async function delWait(id) { S.waitlist = S.waitlist.filter(w => w.id !== id); try { await DB.removeWait(S, id); } catch (e) {} agentSheet('antifaltas'); }

/* ================= AGENTES — execução ================= */
async function runAgent(k, silent) {
  if (agBusy[k]) return; agBusy[k] = true; if (!silent) toast(AG[k].icon + ' ' + AG[k].name + ' a trabalhar…');
  try {
    let n;
    if (DB.cloud) { const r = await DB.agentRun(k); n = r.created; S = await DB.load(); ensureShape(); }
    else { n = await runLocal(k); S.agents[k].lastRun = new Date().toISOString(); DB.saveLocal(S); }
    if (!silent) toast(n ? `${AG[k].name}: ${n} ${n === 1 ? 'tarefa nova' : 'tarefas novas'} ✓` : `${AG[k].name}: nada a fazer agora ✓`);
  } catch (e) { if (!silent) toast(DB.friendly(e)); }
  agBusy[k] = false; if (phase === 'app') render();
}
function addTaskLocal(kind, t) { const x = { id: uid(), kind, status: 'pendente', created: new Date().toISOString(), payload: {}, phone: '', ...t }; S.tasks.unshift(x); return x; }
const firstName = n => String(n || '').trim().split(/\s+/)[0] || 'olá';
const STOP_LINE_PT = '\n\nResponde PARAR se não quiseres receber mais mensagens.';
let STOP_LINE = STOP_LINE_PT; // no Brasil o texto é convertido por LOC.t() ao mostrar/enviar
const canMsg = c => c && c.phone && !c.optedOut;            // lembretes e vagas (mensagens da marcação)
const canPromo = c => canMsg(c) && c.marketingOk === true;  // promoções: só com consentimento
async function aiJSON(prompt) {
  if (sampleState !== 'ok' || !sampleFn) return null;
  try {
    if (sampleFn.json) return await sampleFn.json(prompt, { cache: false });
    const r = await sampleFn(prompt + '\nResponde só com JSON.', { cache: false }); const m = r.text.match(/[\[{][\s\S]*[\]}]/); return JSON.parse(m ? m[0] : r.text);
  } catch (e) { return null; }
}
async function aiText(prompt) { if (sampleState !== 'ok' || !sampleFn) return null; try { return (await sampleFn(prompt, { cache: false })).text; } catch (e) { return null; } }

async function runLocal(k) {
  const t = todayISO(), tomorrow = addDays(t, 1); let n = 0;
  const a = S.agents[k], s = a.settings;
  if (k === 'antifaltas') {
    for (const b of S.bookings.filter(b => b.date === tomorrow && b.status === 'confirmada' && !b.remindedAt)) {
      const c = cli(b.clientId); b.remindedAt = new Date().toISOString(); if (!canMsg(c)) continue;
      addTaskLocal(k, { type: 'mensagem', title: `Lembrete · ${c.name} · amanhã ${b.time}`, body: withSig(reminderText(b) + '\n\nResponde SIM para confirmar ou NÃO para desmarcar.'), phone: c.phone, clientId: c.id, bookingId: b.id }); n++;
    }
    for (const w of S.waitlist.filter(w => !w.notified && w.to >= t)) {
      for (let d = w.from > t ? w.from : t; d <= w.to; d = addDays(d, 1)) {
        const f = freeAny(d, w.serviceId); const h = Object.keys(f).sort()[0]; if (!h) continue;
        const c = cli(w.clientId), sv = svc(w.serviceId);
        if (!canMsg(c)) { w.notified = new Date().toISOString(); break; }
        addTaskLocal(k, { type: 'vaga', title: `Vaga para ${c?.name} · ${fmtDay(d)} ${h}`, body: `Olá ${firstName(c?.name)}! 🎉 Abriu uma vaga para ${sv?.name} ${d === tomorrow ? 'amanhã' : 'no dia ' + fmtDay(d)} às ${h} na ${S.biz.name}. Queres ficar com ela? Responde SIM e fica marcado.` + igSig(), phone: c?.phone || '', clientId: w.clientId, payload: { waitlistId: w.id, date: d, time: h, serviceId: w.serviceId, staffId: f[h][0] } });
        w.notified = new Date().toISOString(); n++; break;
      }
    }
    if (s.autoConcluir !== false) S.bookings.filter(b => b.status === 'confirmada' && b.date < t).forEach(b => b.status = 'concluida');
  }
  if (k === 'avaliacoes') {
    if (!S.biz.review) { if (!S.tasks.some(x => x.kind === k && x.type === 'info' && x.status === 'pendente')) { addTaskLocal(k, { type: 'info', title: 'Falta o link de avaliações do Google', body: 'Cola o link do teu perfil Google nas definições do agente Avaliações para ele começar a pedir avaliações.' }); n++; } }
    else {
      const nowM = new Date().getHours() * 60 + new Date().getMinutes(); const seen = new Set();
      for (const b of S.bookings.filter(b => b.status === 'concluida' && !b.reviewAsked && b.date >= addDays(t, -1) && b.date <= t && !(b.date === t && toMin(b.time) + bDur(b) + 60 > nowM)).slice(0, 8)) {
        b.reviewAsked = true; const c = cli(b.clientId); if (!canPromo(c) || seen.has(c.id)) continue; seen.add(c.id);
        addTaskLocal(k, { type: 'mensagem', title: `Pedir avaliação · ${c.name}`, body: `Olá ${firstName(c.name)}! Obrigado pela visita${b.date === t ? ' hoje' : ''} na ${S.biz.name} 🙏 Se gostaste, ajudas-nos imenso com uma avaliação (demora 30 segundos): ${S.biz.review}` + igSig() + STOP_LINE, phone: c.phone, clientId: c.id, bookingId: b.id }); n++;
      }
    }
  }
  if (k === 'recuperador') {
    const dias = s.dias ?? 35, max = Math.min(s.max ?? 10, 8), since = new Date(Date.now() - 30 * 864e5).toISOString();
    const skip = new Set(S.tasks.filter(x => x.kind === k && x.created >= since).map(x => x.clientId));
    const risk = S.clients.map(c => ({ c, st: clientStats(c.id) })).filter(x => x.st.last && !x.st.next && canPromo(x.c) && !skip.has(x.c.id) && daysBetween(x.st.last, t) >= dias).sort((a, b) => b.st.visits - a.st.visits).slice(0, max)
      .map(x => { const cnt = {}; S.bookings.filter(b => b.clientId === x.c.id && b.status === 'concluida').forEach(b => { const nm = svc(b.serviceId)?.name; cnt[nm] = (cnt[nm] || 0) + 1; }); return { ...x, dias: daysBetween(x.st.last, t), fav: Object.entries(cnt).sort((p, q) => q[1] - p[1])[0]?.[0] }; });
    let ai = null;
    if (risk.length) ai = await aiJSON(`És o agente "Recuperador" da ${S.biz.name}. Escreve mensagens de WhatsApp curtas (máx. 40 palavras), calorosas e pessoais, em ${LOC.c.lang}, para clientes que deixaram de vir. Usa o primeiro nome e o serviço favorito, 1 emoji no máximo, termina com uma pergunta simples para marcar.${s.oferta ? ' Inclui esta oferta: ' + s.oferta : ''}\nClientes: ${JSON.stringify(risk.map(r => ({ id: r.c.id, nome: firstName(r.c.name), dias_sem_vir: r.dias, servico_favorito: r.fav, visitas: r.st.visits })))}\nDevolve JSON: [{"id":"...","mensagem":"..."}]`);
    const map = {}; (Array.isArray(ai) ? ai : []).forEach(o => { if (o && o.id) map[o.id] = o.mensagem; });
    for (const r of risk) { addTaskLocal(k, { type: 'mensagem', title: `Recuperar ${r.c.name} · ${r.dias} dias sem vir`, body: withSig(map[r.c.id] || `Olá ${firstName(r.c.name)}! Já há ${r.dias} dias que não te vemos na ${S.biz.name} 😊 ${s.oferta ? s.oferta + ' ' : ''}Queres que te guarde um horário para ${String(r.fav || 'a próxima visita').toLowerCase()} esta semana?`) + STOP_LINE, phone: r.c.phone, clientId: r.c.id }); n++; }
  }
  if (k === 'marketing') {
    const week = []; for (let i = 0; i < 7; i++) { const d = addDays(t, i); if (!dayOpen(d)) continue; const sv = AS().slice().sort((p, q) => p.dur - q.dur)[0]; week.push({ dia: DOWL[dow(d)] + ' ' + d.slice(8), livres: sv ? Object.keys(freeAny(d, sv.id)).length : 0 }); }
    let posts = await aiJSON(`És o agente de Marketing da ${S.biz.name} (${PR()[S.biz.type]?.label}). Cria 3 posts diferentes para Instagram em ${LOC.c.lang}, tom ${s.tom || 'próximo e divertido'}, para encher horários livres (foca os dias mais vazios). Cada legenda até 70 palavras, chamada para marcar pelo link na bio, 3-6 hashtags locais.${S.biz.instagram ? ' A conta é @' + S.biz.instagram + '.' : ''}\nServiços: ${AS().map(x => x.name + ' ' + x.price + '€').join(', ')}\nHorários livres: ${JSON.stringify(week)}\nDevolve JSON: [{"titulo":"","legenda":"","imagem":"ideia de foto/vídeo","quando":"dia e hora para publicar"}]`);
    if (!Array.isArray(posts) || !posts.length) {
      const fraco = [...week].sort((p, q) => q.livres - p.livres)[0];
      posts = [
        { titulo: 'Vagas da semana', legenda: `Ainda há horários livres esta semana na ${S.biz.name}! ${fraco ? 'Sobretudo ' + fraco.dia + '. ' : ''}Marca em 30 segundos pelo link na bio 📅 #${PR()[S.biz.type]?.label.toLowerCase()} #portugal #marcaonline`, imagem: 'Foto do espaço com luz natural', quando: 'Hoje às 19h' },
        { titulo: 'Promoção do dia fraco', legenda: `${fraco ? fraco.dia.split(' ')[0][0].toUpperCase() + fraco.dia.split(' ')[0].slice(1) : 'Esta semana'} é o teu dia: marca até às 15h e recebe um mimo extra 🎁 Vagas limitadas, link na bio. #promo #${PR()[S.biz.type]?.label.toLowerCase()}`, imagem: 'Story com contagem decrescente', quando: 'Véspera às 20h' },
        { titulo: 'Bastidores', legenda: `Por trás de cada ${AS()[0]?.name.toLowerCase() || 'serviço'} há horas de prática ✂️ Vem conhecer a equipa. Marca pelo link na bio. #bastidores #feitoemportugal`, imagem: 'Vídeo curto do serviço em câmara rápida', quando: 'Sábado às 11h' }];
    }
    posts.slice(0, 3).forEach(p => { addTaskLocal(k, { type: 'post', title: '📸 ' + p.titulo, body: p.legenda, payload: { imagem: p.imagem, quando: p.quando } }); n++; });
  }
  if (k === 'gestor') {
    const cur = periodStats(7); const prevB = S.bookings.filter(b => b.date > addDays(t, -14) && b.date <= addDays(t, -7) && b.status === 'concluida');
    const prevRev = prevB.reduce((x, b) => x + bPrice(b), 0); const next = S.bookings.filter(b => b.date > t && b.date <= addDays(t, 7) && b.status === 'confirmada').length;
    const dados = { semana: cur, receita_semana_anterior: prevRev, marcacoes_proximos_7_dias: next, ocupacao_proximos_7_dias: occupancy(t, 7) + '%', clientes_em_risco: atRisk().length, precos: AS().map(x => x.name + ': ' + x.price + '€') };
    let body = await aiText(`És o agente Gestor da ${S.biz.name}. Escreve o resumo semanal para o dono em ${LOC.c.lang}, direto e motivador, texto simples sem markdown (usa "•"). Máx. 170 palavras: 1) como correu (números e % vs semana anterior), 2) o que aí vem, 3) exatamente 3 sugestões concretas e acionáveis.\nDados: ${JSON.stringify(dados)}`);
    if (!body) { const d = prevRev ? Math.round((cur.receita - prevRev) / prevRev * 100) : 0; body = `• Receita da semana: ${eur(cur.receita)} (${d >= 0 ? '+' : ''}${d}% vs anterior)\n• ${cur.concluidas} serviços, ${cur.faltas} faltas (${cur.taxaFaltas}%), ${cur.online} marcações online\n• Próximos 7 dias: ${next} marcações · ocupação ${occupancy(t, 7)}%\n\nSugestões:\n• ${cur.taxaFaltas > 6 ? 'Liga o Anti-faltas em automático para baixar as faltas' : 'Mantém os lembretes, as faltas estão controladas'}\n• ${atRisk().length ? 'Há ' + atRisk().length + ' clientes a perder: corre o Recuperador' : 'Pede avaliações para atrair clientes novos'}\n• ${occupancy(t, 7) < 60 ? 'Publica os posts do Marketing para encher a semana' : 'Agenda cheia: considera subir 1 € nos serviços mais pedidos'}`; }
    addTaskLocal(k, { type: 'relatorio', title: `📊 Resumo da semana · ${eur(cur.receita)}`, body, payload: dados }); n++;
  }
  DB.saveLocal(S);
  return n;
}
function runLocalBasics(force) {
  if (DB.cloud || !S) return;
  for (const k of ['antifaltas', 'avaliacoes', 'recuperador']) {
    const a = S.agents[k]; if (!a.enabled) continue;
    if (!force && a.lastRun && Date.now() - Date.parse(a.lastRun) < 20 * 36e5) continue;
    runLocal(k).then(() => { a.lastRun = new Date().toISOString(); DB.saveLocal(S); if (phase === 'app') render(); });
  }
}

/* ================= WHATSAPP: modo 1 toque / automático ================= */
const waShared = () => (window.VEZ_CONFIG || {}).WA_SHARED_NUMBER || '';
// automático quando o negócio tem número próprio OU usa o número partilhado da Marcaí
const waAuto = () => DB.cloud && isPaid() && (!!S.biz.wa || !!waShared());
function waBookLink() {
  const n = waShared(); if (!n || !S.biz.slug) return '';
  const t = (LOC.br ? 'Olá! Quero agendar na ' : 'Olá! Quero marcar na ') + S.biz.name + ' (código: ' + S.biz.slug + ')';
  return 'https://wa.me/' + n.replace(/\D/g, '') + '?text=' + encodeURIComponent(t);
}
function waCard() {
  return waAuto()
    ? `<div class="card small" onclick="waSheet()" style="cursor:pointer;margin-bottom:14px">⚡ <b>WhatsApp automático ligado</b> · os agentes respondem e marcam sozinhos.${!S.biz.wa && waShared() ? ' <b>Partilha o teu link ›</b>' : ''}</div>`
    : `<div class="card small" onclick="waSheet()" style="cursor:pointer;margin-bottom:14px;background:#EEF6F1;border-color:#CFE3DA">👆 <b>WhatsApp: modo 1 toque ✅</b> · os agentes preparam as mensagens e tu envias com um toque. <span class="muted">Automático: brevemente ›</span></div>`;
}
const waCfg = () => window.VEZ_CONFIG || {};
const waCanConnect = () => DB.cloud && S.role !== 'staff' && !!waCfg().META_APP_ID && !!waCfg().META_CONFIG_ID;
function waSheet() {
  const auto = waAuto(), linked = !!S.biz.wa, can = waCanConnect();
  const num = S.biz.waPhone ? ` (${esc(S.biz.waPhone)})` : '';
  const wl = waBookLink();
  openSheet(`<h2>💬 WhatsApp do negócio</h2>
  ${wl ? `<div class="card" style="border:2px solid var(--acc);text-align:center"><h3 style="text-align:left">⚡ Marcar pelo WhatsApp ${isPaid() ? '<span class="pill">ativo</span>' : ''}</h3>
    <div class="small" style="text-align:left">Os teus clientes tocam no link (ou leem o QR), escrevem no WhatsApp e a IA responde e marca por ti, 24 horas por dia. <b>Não precisas de configurar nada.</b></div>
    <div id="waqr" style="display:inline-block;padding:8px;background:#fff;border-radius:12px;margin-top:12px"></div>
    <div class="grid2" style="margin-top:10px"><button class="btn" id="waCopy">Copiar link</button><a class="btn line" href="${esc(wl)}" target="_blank" rel="noopener">Experimentar</a></div>
    <div class="small muted" style="text-align:left;margin-top:8px">Põe o link na bio do Instagram e na mensagem automática do teu WhatsApp, e o QR ao balcão. ${isPaid() ? '' : '<b>A resposta automática faz parte do plano Pro.</b>'}</div></div>` : ''}
  <div class="card ${auto ? '' : 'on'}" style="${auto ? '' : 'border:2px solid var(--acc)'}"><h3>👆 Modo 1 toque ${auto ? '' : '<span class="pill">ativo</span>'}</h3>
    <div class="small">Funciona já, com o teu WhatsApp normal ou Business, sem configurar nada.</div>
    <div class="small muted" style="margin-top:6px">• Os agentes escrevem os lembretes, as vagas e as mensagens a clientes<br>• Aparecem em <b>Agentes → Para aprovar</b><br>• Carregas em <b>Enviar no WhatsApp</b>: abre a conversa com o texto pronto e só confirmas</div></div>
  <div class="card" style="${auto ? 'border:2px solid var(--acc)' : ''}"><h3>${wl ? '📱 Usar o teu próprio número (opcional)' : '⚡ Modo automático'} ${linked ? '<span class="pill">ligado</span>' : wl ? '' : auto ? '<span class="pill">ativo</span>' : can ? '' : '<span class="pill" style="background:var(--gold-soft);color:#8a5a00">brevemente</span>'}</h3>
    <div class="small">O Rececionista responde e marca sozinho no teu número, 24 horas por dia, e os lembretes saem sem tocares em nada.</div>
    <div class="small muted" style="margin-top:6px">• Ligas com um botão: entras com o Facebook e confirmas o teu número<br>• Continuas a usar a app WhatsApp Business no telemóvel<br>• Os teus clientes não notam diferença: escrevem para o mesmo número</div>
    ${linked
      ? `<div class="small" style="margin-top:10px">✅ <b>WhatsApp ligado${num}</b>${isPaid() ? '' : ' · ativa o plano Pro para os agentes responderem sozinhos'}</div>
         ${S.role !== 'staff' ? '<button class="btn line block" style="margin-top:10px" id="waOff">Desligar o WhatsApp</button>' : ''}`
      : can
        ? `<button class="btn block" style="margin-top:10px" id="waConnect">🔗 Ligar o meu WhatsApp</button><div class="small muted" style="margin-top:6px">Precisas do número na app WhatsApp Business. Demora 2 minutos.</div>`
        : `<button class="btn line block" style="margin-top:10px" id="waNotify">${localStorage.getItem('marcai_wa_aviso') ? '✓ Vamos avisar-te' : 'Avisem-me quando estiver disponível'}</button>`}
  </div>
  <button class="btn ghost block" onclick="closeSheet();simSheet()">📱 Ver como o Rececionista responde (simulador)</button>`, sh => {
    const b = sh.querySelector('#waNotify');
    if (b) b.onclick = () => { try { localStorage.setItem('marcai_wa_aviso', '1'); } catch (e) {} b.textContent = '✓ Vamos avisar-te'; toast('Combinado! Avisamos-te na app quando estiver pronto.'); };
    const c = sh.querySelector('#waConnect'); if (c) c.onclick = () => waConnect(c);
    const q = sh.querySelector('#waqr'); if (q && window.QRCode) { try { new QRCode(q, { text: wl, width: 170, height: 170, colorDark: '#17201C' }); } catch (e) {} }
    const cp = sh.querySelector('#waCopy'); if (cp) cp.onclick = () => copy(wl);
    const o = sh.querySelector('#waOff');
    if (o) o.onclick = async () => {
      if (!confirm('Desligar o WhatsApp automático? Voltas ao modo 1 toque.')) return;
      o.disabled = true;
      try { await DB.waConnect({ action: 'disconnect' }); S = await DB.load(); ensureShape(); toast('WhatsApp desligado'); closeSheet(); render(); }
      catch (e) { toast('⚠️ ' + DB.friendly(e)); o.disabled = false; }
    };
  });
}

/* Embedded Signup da Meta: o dono liga o próprio número sem configurar nada */
let fbReady = null;
function loadFB() {
  if (fbReady) return fbReady;
  fbReady = new Promise((res, rej) => {
    window.fbAsyncInit = () => { FB.init({ appId: waCfg().META_APP_ID, autoLogAppEvents: true, xfbml: false, version: 'v21.0' }); res(); };
    const s = document.createElement('script');
    s.src = 'https://connect.facebook.net/pt_PT/sdk.js'; s.async = true; s.defer = true; s.crossOrigin = 'anonymous';
    s.onerror = () => { fbReady = null; rej(new Error('Não foi possível abrir o Facebook. Verifica a ligação.')); };
    document.head.appendChild(s);
  });
  return fbReady;
}
async function waConnect(btn) {
  btn.disabled = true; const label = btn.textContent; btn.textContent = 'A abrir o Facebook…';
  let info = null;
  const onMsg = ev => {
    if (!/facebook\.com$/.test(new URL(ev.origin).hostname)) return;
    try {
      const d = typeof ev.data === 'string' ? JSON.parse(ev.data) : ev.data;
      if (d && d.type === 'WA_EMBEDDED_SIGNUP') {
        if (/^FINISH/.test(d.event) && d.data) info = d.data;
        else if (d.event === 'CANCEL') info = { cancel: true, step: d.data?.current_step };
        else if (d.event === 'ERROR') info = { error: d.data?.error_message };
      }
    } catch (e) {}
  };
  window.addEventListener('message', onMsg);
  const done = () => { window.removeEventListener('message', onMsg); btn.disabled = false; btn.textContent = label; };
  try {
    await loadFB();
    btn.textContent = 'A aguardar o Facebook…';
    FB.login(async resp => {
      const code = resp?.authResponse?.code;
      // a mensagem com o número pode chegar uns instantes depois do login
      for (let i = 0; i < 20 && !info; i++) await new Promise(r => setTimeout(r, 150));
      if (!code || info?.cancel) { done(); toast('Ligação cancelada.'); return; }
      if (info?.error) { done(); toast('⚠️ ' + info.error); return; }
      if (!info?.phone_number_id || !info?.waba_id) { done(); toast('⚠️ A Meta não enviou o número. Tenta outra vez.'); return; }
      btn.textContent = 'A ligar o teu número…';
      try {
        const r = await DB.waConnect({ code, phone_number_id: info.phone_number_id, waba_id: info.waba_id });
        S = await DB.load(); ensureShape();
        done(); closeSheet(); render();
        toast(`✅ WhatsApp ligado${r?.phone ? ' (' + r.phone + ')' : ''}! O Rececionista já responde sozinho.`);
      } catch (e) { done(); toast('⚠️ ' + DB.friendly(e)); }
    }, {
      config_id: waCfg().META_CONFIG_ID,
      response_type: 'code',
      override_default_response_type: true,
      extras: { setup: {}, featureType: waCfg().META_COEXISTENCE === false ? '' : 'whatsapp_business_app_onboarding', sessionInfoVersion: '3' }
    });
  } catch (e) { done(); toast('⚠️ ' + (e.message || e)); }
}

/* ================= SIMULADOR DO RECECIONISTA ================= */
let sim = [], simBusy = false;
const SIM_PHONE = '910000000';
function simSheet() {
  const sugg = ['Olá! Queria marcar ' + (AS()[0]?.name || 'um serviço').toLowerCase() + ' para amanhã', 'Quanto custa ' + (AS()[1]?.name || AS()[0]?.name || 'o serviço').toLowerCase() + '?', 'Têm vaga sábado de manhã?', 'Preciso de desmarcar a minha marcação'];
  openSheet(`<div class="simtop">${bizLogo(38)}<div><b>${esc(S.biz.name)}</b><small>${S.agents.rececionista.enabled ? 'Rececionista IA · online' : 'Rececionista desligado (teste)'}</small></div><button class="btn sm line" onclick="sim=[];simSheet()">Limpar</button></div>
    <div class="simchat" id="simChat">${simMsgs()}</div>
    ${sim.length ? '' : `<div class="chips" id="simSugg" style="margin:8px 0">${sugg.map(s => `<button class="chip" onclick="simSend(this.textContent)">${esc(s)}</button>`).join('')}</div>`}
    <div style="display:flex;gap:8px;margin-top:8px"><input class="inp" id="simIn" placeholder="Mensagem" autocomplete="off"><button class="btn" id="simGo">${I.send}</button></div>
    <p class="small muted" style="margin-top:8px">${DB.cloud ? 'Usa o mesmo motor que responde aos teus clientes reais.' : sampleState === 'ok' ? 'Demo: as marcações feitas aqui entram mesmo na tua agenda.' : 'O simulador precisa da IA: abre a app dentro do Claude ou usa a versão online.'}</p>`, sh => {
    const inp = sh.querySelector('#simIn');
    sh.querySelector('#simGo').onclick = () => simSend(inp.value);
    inp.onkeydown = e => { if (e.key === 'Enter') simSend(inp.value); };
    const ch = sh.querySelector('#simChat'); ch.scrollTop = ch.scrollHeight;
    if (!simBusy) setTimeout(() => inp.focus(), 300);
  });
}
function simMsgs() { return (sim.length ? sim.map(m => `<div class="sb ${m.r}">${esc(m.t)}</div>`).join('') : `<div class="small muted" style="text-align:center;padding:16px">Escreve como se fosses um cliente no WhatsApp 👇</div>`) + (simBusy ? '<div class="sb a typing">a escrever…</div>' : ''); }
function simRefresh() {
  const ch = $('#simChat'); if (!ch) return simSheet();
  ch.innerHTML = simMsgs(); ch.scrollTop = ch.scrollHeight;
  const sg = $('#simSugg'); if (sg && sim.length) sg.remove();
  const inp = $('#simIn'); if (inp && !simBusy) inp.focus();
}
async function simSend(text) {
  text = String(text || '').trim(); if (!text || simBusy) return;
  const inp = $('#simIn'); if (inp) inp.value = '';
  sim.push({ r: 'u', t: text }); simBusy = true; simRefresh();
  let reply;
  try {
    if (DB.cloud) { const r = await DB.agentSimulate(SIM_PHONE, 'Cliente Teste', text); reply = r.reply; if (r.booked) { S = await DB.load(); ensureShape(); } }
    else reply = await simLocal(text);
  } catch (e) { reply = '⚠️ ' + DB.friendly(e); }
  sim.push({ r: 'a', t: reply || '…' }); simBusy = false;
  if (phase === 'app') { const y = window.scrollY; render(); window.scrollTo(0, y); }
  simRefresh();
}
async function simLocal(text) {
  const { c } = findOrCreateClient(sim.find(m => /chamo-me|sou o|sou a/i.test(m.t))?.t.match(/(?:chamo-me|sou o|sou a)\s+([A-Za-zÀ-ÿ]+)/i)?.[1] || 'Cliente Teste', SIM_PHONE);
  if (!S.clients.includes(c)) S.clients.push(c);
  await persist('clients', c);
  if (/^\s*(parar|stop|sair|não quero (mais )?mensagens)\b/i.test(text)) {
    c.optedOut = true; c.marketingOk = false; await persist('clients', c);
    return `Combinado, não vais receber mais mensagens automáticas da ${S.biz.name}. Quando quiseres marcar, é só escreveres-nos.`;
  }
  const yes = /^\s*(sim|confirmo|ok|claro)\b/i.test(text), no = /^\s*(n[aã]o|cancela|desmarca)\b/i.test(text);
  const next = S.bookings.filter(b => b.clientId === c.id && b.status === 'confirmada' && b.date >= todayISO()).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  if ((yes || no) && next && next.remindedAt) {
    if (yes) { next.confirmedAt = new Date().toISOString(); await persist('bookings', next); return `Perfeito, está confirmado: ${svc(next.serviceId)?.name} ${relDay(next.date).toLowerCase()} às ${next.time}. Até lá! 👋`; }
    next.status = 'cancelada'; await persist('bookings', next); return `Sem problema, desmarquei. Queres marcar para outro dia?`;
  }
  if (sampleState !== 'ok') return 'Para testar o Rececionista no modo demo, abre a app dentro do Claude (ou usa a versão online).';
  const t = todayISO();
  const tools = [
    { name: 'horarios_livres', description: 'Horas livres num dia (YYYY-MM-DD) para um serviço.', inputSchema: { type: 'object', properties: { data: { type: 'string' }, servico: { type: 'string' } }, required: ['data', 'servico'] },
      execute: ({ data, servico }) => { const s = matchService(servico); if (!s) throw new Error('Serviços: ' + AS().map(x => x.name).join(', ')); if (!dayOpen(data)) return { fechado: true }; return { servico: s.name, horas: Object.keys(freeAny(data, s.id)).sort() }; } },
    { name: 'marcar', description: 'Marca para ESTE cliente, só depois de ele confirmar dia, hora e serviço.' + (isHome() ? ' Obrigatório: morada completa.' : ''), inputSchema: { type: 'object', properties: { servico: { type: 'string' }, data: { type: 'string' }, hora: { type: 'string' }, nome: { type: 'string' }, morada: { type: 'string', description: 'morada do serviço (domicílio)' }, notas: { type: 'string' } }, required: isHome() ? ['servico', 'data', 'hora', 'morada'] : ['servico', 'data', 'hora'] },
      execute: async a => {
        const s = matchService(a.servico); if (!s) throw new Error('Serviço inválido'); const h = toT(toMin(a.hora)); const m = freeAny(a.data, s.id)[h];
        if (!m) throw new Error('Ocupado. Livres: ' + Object.keys(freeAny(a.data, s.id)).sort().slice(0, 8).join(', '));
        if (a.nome && c.name === 'Cliente Teste') { c.name = a.nome; await persist('clients', c); }
        if (isHome() && String(a.morada || '').trim().length < 6) throw new Error('Falta a morada completa do serviço');
        await addBooking({ serviceId: s.id, staffId: m[0], date: a.data, time: h, clientName: c.name, phone: SIM_PHONE, notes: [a.morada ? 'Morada: ' + a.morada : '', a.notas || ''].filter(Boolean).join(' · ') }, 'ia');
        return { ok: true, servico: s.name, dia: fmtDay(a.data), hora: h };
      } },
    { name: 'minhas_marcacoes', description: 'Marcações futuras deste cliente.', inputSchema: { type: 'object', properties: {} },
      execute: () => S.bookings.filter(b => b.clientId === c.id && b.status === 'confirmada' && b.date >= t).map(b => ({ id: b.id, dia: fmtDay(b.date), data: b.date, hora: b.time, servico: svc(b.serviceId)?.name })) },
    { name: 'desmarcar', description: 'Desmarca uma marcação deste cliente pelo id.', inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
      execute: async ({ id }) => { const b = S.bookings.find(x => x.id === id && x.clientId === c.id); if (!b) throw new Error('Não encontrada'); b.status = 'cancelada'; await persist('bookings', b); return { ok: true }; } }
  ];
  const system = `És o Rececionista da ${S.biz.name} no WhatsApp. Respondes como uma pessoa simpática da equipa: ${LOC.c.lang}, mensagens curtas (1-3 frases), sem markdown, no máximo 1 emoji.
Hoje é ${DOWL[dow(t)]}, ${t}, ${toT(new Date().getHours() * 60 + new Date().getMinutes())}. Horário: ${S.biz.open}-${S.biz.close}, aberto: ${S.biz.days.map(d => DOWL[d]).join(', ')}.${S.biz.address ? ' Morada: ' + S.biz.address + '.' : ''}
Serviços: ${AS().map(s => `${s.name} (${s.dur} min, ${eur(s.price)})`).join('; ')}.
Cliente: ${c.name}${c.name === 'Cliente Teste' ? ' (pergunta o nome antes de marcar)' : ''}.${S.biz.instagram ? ' Instagram do negócio: @' + S.biz.instagram + ' (partilha se o cliente pedir fotos, trabalhos ou redes sociais; depois de marcar podes convidar a seguir).' : ''}
${homeHint()}Ajudas a marcar, remarcar, desmarcar e tirar dúvidas sobre serviços, preços e horários. Usa as ferramentas para horários reais; propõe 2-3 opções. Marca só depois de o cliente confirmar. Se não souberes algo, diz que o responsável responde em breve. Nunca inventes preços nem promoções.`;
  const msgs = sim.map(m => ({ role: m.r === 'u' ? 'user' : 'assistant', content: m.t }));
  msgs[0] = { role: 'user', content: system + '\n\n---\nMensagem do cliente:\n' + msgs[0].content };
  const r = await sampleFn(msgs, { tools, cache: false });
  return r.text;
}

function homeHint() {
  if (!isHome()) return '';
  let h = `É um serviço ao domicílio (${PR()[S.biz.type]?.label}): antes de marcar pede a morada completa (rua, nº, andar, cidade) e uma descrição curta do problema ou do trabalho. Se o problema for pouco claro ou grande, propõe "Visita e orçamento". Se disser que é urgente e houver serviço "${LOC.br ? 'Emergência' : 'Urgência'}", propõe a hora livre mais próxima. Nunca dês preços finais de obras: diz que o técnico confirma no local. `;
  if (S.biz.type === 'limpeza') h += LOC.br ? 'Se o cliente não souber o que escolher, sugere pelo tamanho da casa (até 2 quartos: diarista 4h; 3 quartos ou casa grande: 8h ou faxina pesada) e pergunta se há animais. ' : 'Se o cliente não souber que limpeza escolher, sugere pela casa (T0-T1: 2h, T2-T3: 3h, moradias ou limpeza profunda: 4h ou mais) e pergunta se há animais. ';
  return h;
}

/* ================= INSTALAR A APP ================= */
let installEvt = null;
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
window.addEventListener('appinstalled', () => { installEvt = null; closeSheet(); toast('App instalada 🎉 Procura o ícone M no ecrã inicial'); });
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function installSheet() {
  if (isStandalone()) { toast('A app já está instalada ✓'); return; }
  const ios = isIOS(), safari = ios && !/crios|fxios|edgios/i.test(navigator.userAgent);
  let body;
  if (installEvt) body = `<p class="muted">Fica com o ícone <b>M</b> no ecrã inicial e abre em ecrã inteiro, como uma app normal.</p><button class="btn block" id="insGo">📲 Instalar agora</button>`;
  else if (ios && !safari) body = `<p class="muted">No iPhone, a instalação é feita pelo <b>Safari</b>.</p><div class="card small">1. Copia o link abaixo<br>2. Abre o <b>Safari</b> e cola-o<br>3. Segue os passos de instalação</div><button class="btn block" onclick="copy(location.origin + '/app/')">Copiar link</button>`;
  else if (ios) body = `<div class="card"><div class="row"><span style="font-size:22px">1</span><div class="m"><b>Toca em Partilhar</b><span>o quadrado com a seta ⬆️, na barra do Safari</span></div></div><div class="row"><span style="font-size:22px">2</span><div class="m"><b>"Adicionar ao ecrã principal"</b><span>desliza a lista para baixo até encontrares</span></div></div><div class="row"><span style="font-size:22px">3</span><div class="m"><b>Toca em "Adicionar"</b><span>e o ícone M aparece no teu ecrã</span></div></div></div>`;
  else body = `<div class="card"><div class="row"><span style="font-size:22px">1</span><div class="m"><b>Abre o menu ⋮</b><span>no canto superior direito do Chrome</span></div></div><div class="row"><span style="font-size:22px">2</span><div class="m"><b>"Instalar app"</b><span>ou "Adicionar ao ecrã inicial"</span></div></div><div class="row"><span style="font-size:22px">3</span><div class="m"><b>Confirma</b><span>e o ícone M aparece no teu ecrã</span></div></div></div><p class="small muted">No computador, procura o ícone de instalar na barra de endereço.</p>`;
  openSheet(`<div style="display:flex;gap:12px;align-items:center;margin-bottom:12px"><div class="logo big"><i style="width:52px;height:52px;font-size:24px;border-radius:16px">M</i></div><div><h2 style="margin:0">Instalar a Marcaí</h2><div class="small muted">Grátis · sem loja de apps · ocupa pouco espaço</div></div></div>${body}`, sh => {
    const g = sh.querySelector('#insGo'); if (g) g.onclick = async () => { installEvt.prompt(); const r = await installEvt.userChoice; installEvt = null; if (r.outcome !== 'accepted') closeSheet(); };
  });
}

/* ================= arranque ================= */
const _loadApp = loadApp;
loadApp = async function () { await _loadApp(); if (S && phase === 'app') { ensureShape(); render(); runLocalBasics(false); } };
boot().then(() => { if (new URLSearchParams(location.search).has('instalar')) { history.replaceState(null, '', location.pathname + location.hash); setTimeout(installSheet, 600); } });
if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claude|anthropic/.test(location.hostname)) { navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {}); }
