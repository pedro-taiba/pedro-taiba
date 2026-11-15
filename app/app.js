/* =========================================================
   Marcaí — Marcações com IA · interface
   ========================================================= */

/* ---------------- utilidades ---------------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16); }));
const pad = n => String(n).padStart(2, '0');
const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const todayISO = () => iso(new Date());
const addDays = (s, n) => { const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return iso(d); };
const toMin = t => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
const toT = m => pad(Math.floor(m / 60)) + ':' + pad(m % 60);
const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DOWL = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
const MON = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const dow = s => new Date(s + 'T12:00:00').getDay();
const fmtDay = s => { const d = new Date(s + 'T12:00:00'); return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()]; };
const relDay = s => { const t = todayISO(); if (s === t) return 'Hoje'; if (s === addDays(t, 1)) return 'Amanhã'; if (s === addDays(t, -1)) return 'Ontem'; return fmtDay(s); };
const eur = n => LOC.money(n); // moeda do país do negócio (€ ou R$)
const daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
const initials = n => String(n).trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
const phoneDigits = p => LOC.phoneDigits(p);
const cleanPhone = p => String(p || '').replace(/[^\d+]/g, '');
function toast(t) { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => e.classList.remove('on'), 2600); }
async function copy(t) { try { await navigator.clipboard.writeText(LOC.t(t)); toast('Copiado ✓'); } catch (e) { toast('Não foi possível copiar'); } }

const COLORS = ['#1E5B47', '#3A6EA5', '#B8463B', '#8A5CB0', '#C98A1B', '#2F8C8C', '#6B7A2E'];
const PRESETS = {
  barbearia: { label: 'Barbearia', emoji: '💈', services: [['Corte', 30, 12], ['Corte + Barba', 45, 18], ['Barba', 20, 8], ['Corte criança', 25, 10], ['Desenho', 15, 4]] },
  salao: { label: 'Cabeleireiro', emoji: '✂️', services: [['Corte senhora', 45, 20], ['Brushing', 30, 15], ['Coloração', 90, 45], ['Madeixas', 120, 65], ['Tratamento', 30, 18]] },
  estetica: { label: 'Estética', emoji: '💅', services: [['Manicure gel', 60, 20], ['Pedicure', 50, 22], ['Limpeza de pele', 60, 35], ['Depilação pernas', 30, 15], ['Sobrancelhas', 15, 7]] },
  clinica: { label: 'Clínica', emoji: '🩺', services: [['Consulta', 30, 40], ['Fisioterapia', 50, 35], ['Massagem terapêutica', 60, 45], ['Avaliação inicial', 45, 30]] },
  tatuagem: { label: 'Tatuagem', emoji: '🖋️', services: [['Consulta de design', 30, 0], ['Tattoo pequena', 60, 60], ['Sessão 3h', 180, 180], ['Piercing', 20, 25]] },
  pt: { label: 'Personal', emoji: '🏋️', services: [['Treino PT', 60, 30], ['Avaliação física', 45, 25], ['Treino a dois', 60, 45]] },
  limpeza: { label: 'Limpezas', emoji: '🧽', home: true, word: 'Equipa', open: '08:00', close: '18:00', staff: ['Equipa 1', 'Equipa 2'], services: [['Limpeza doméstica 2h', 120, 30], ['Limpeza doméstica 3h', 180, 42], ['Limpeza profunda', 240, 75], ['Limpeza pós-obra', 360, 150], ['Limpeza de escritório', 120, 35], ['Engomadoria 2h', 120, 25]] },
  eletricista: { label: 'Eletricista', emoji: '⚡', home: true, open: '08:00', close: '19:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Visita e orçamento', 30, 25], ['Reparação de avaria', 60, 45], ['Tomada ou interruptor', 30, 35], ['Instalar candeeiro', 45, 40], ['Quadro elétrico', 120, 120], ['Certificação elétrica', 90, 90], ['Urgência', 60, 70]] },
  canalizador: { label: 'Canalizador', emoji: '🔧', home: true, open: '08:00', close: '19:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Visita e orçamento', 30, 25], ['Desentupimento', 60, 60], ['Fuga de água', 60, 55], ['Torneira ou autoclismo', 45, 40], ['Esquentador / termoacumulador', 90, 80], ['Urgência', 60, 75]] },
  climatizacao: { label: 'Ar condicionado', emoji: '❄️', home: true, open: '08:00', close: '19:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Visita e orçamento', 30, 25], ['Limpeza e manutenção AC', 60, 50], ['Reparação AC', 90, 70], ['Instalação AC', 180, 180]] },
  reparacoes: { label: 'Faz-tudo', emoji: '🛠️', home: true, open: '08:00', close: '19:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Pequenas reparações 1h', 60, 30], ['Montagem de móveis', 120, 50], ['Pendurar quadros e prateleiras', 60, 30], ['Estores', 60, 40], ['Visita e orçamento', 30, 20]] },
  pintura: { label: 'Pintura', emoji: '🎨', home: true, open: '08:00', close: '18:00', word: 'Equipa', staff: ['Equipa 1', 'Equipa 2'], services: [['Orçamento ao domicílio', 45, 0], ['Pequenos retoques', 120, 60], ['Pintar teto', 240, 90], ['Pintar divisão', 480, 180]] },
  jardinagem: { label: 'Jardinagem', emoji: '🌿', home: true, open: '08:00', close: '18:00', word: 'Equipa', staff: ['Equipa 1', 'Equipa 2'], services: [['Corte de relva', 60, 25], ['Manutenção de jardim 2h', 120, 40], ['Poda', 180, 70], ['Rega automática', 180, 120]] },
  serralharia: { label: 'Serralheiro', emoji: '🔑', home: true, open: '08:00', close: '20:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Abertura de porta', 30, 60], ['Troca de fechadura', 60, 70], ['Fechadura de segurança', 90, 140], ['Urgência', 30, 90]] },
  mudancas: { label: 'Mudanças', emoji: '🚚', home: true, open: '08:00', close: '19:00', word: 'Equipa', staff: ['Equipa 1', 'Equipa 2'], services: [['Orçamento', 30, 0], ['Frete pequeno', 120, 60], ['Mudança T1', 300, 250], ['Mudança T2/T3', 480, 450]] },
  estofos: { label: 'Lavar sofás', emoji: '🛋️', home: true, open: '08:00', close: '19:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Sofá 2 lugares', 90, 50], ['Sofá 3 lugares', 120, 65], ['Colchão', 60, 40], ['Tapete', 60, 30]] },
  domicilio: { label: 'Outro', emoji: '🏠', home: true, open: '08:00', close: '19:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Visita e orçamento', 30, 25], ['Serviço 1h', 60, 35], ['Serviço 2h', 120, 65]] }
};
// Brasil: nomes, serviços e preços em reais (R$) pensados para o mercado brasileiro
const PRESETS_BR = {
  barbearia: { label: 'Barbearia', emoji: '💈', services: [['Corte', 30, 40], ['Corte + Barba', 45, 65], ['Barba', 20, 30], ['Corte infantil', 25, 35], ['Pezinho e desenho', 15, 15]] },
  salao: { label: 'Salão', emoji: '✂️', services: [['Corte feminino', 45, 80], ['Escova', 30, 50], ['Coloração', 90, 150], ['Mechas', 120, 300], ['Hidratação', 30, 70]] },
  estetica: { label: 'Estética', emoji: '💅', services: [['Manicure e pedicure', 60, 60], ['Esmaltação em gel', 60, 90], ['Limpeza de pele', 60, 150], ['Depilação pernas', 30, 60], ['Design de sobrancelhas', 20, 40]] },
  clinica: { label: 'Clínica', emoji: '🩺', services: [['Consulta', 30, 200], ['Fisioterapia', 50, 150], ['Massagem terapêutica', 60, 150], ['Avaliação inicial', 45, 120]] },
  tatuagem: { label: 'Tatuagem', emoji: '🖋️', services: [['Orçamento de desenho', 30, 0], ['Tattoo pequena', 60, 250], ['Sessão 3h', 180, 900], ['Piercing', 20, 80]] },
  pt: { label: 'Personal', emoji: '🏋️', services: [['Treino personal', 60, 100], ['Avaliação física', 45, 80], ['Treino em dupla', 60, 150]] },
  limpeza: { label: 'Faxina', emoji: '🧽', home: true, word: 'Equipe', open: '08:00', close: '18:00', staff: ['Equipe 1', 'Equipe 2'], services: [['Diarista 4h', 240, 160], ['Diarista 8h', 480, 250], ['Faxina pesada', 480, 350], ['Limpeza pós-obra', 480, 600], ['Limpeza de escritório', 240, 200], ['Passadoria 4h', 240, 140]] },
  eletricista: { label: 'Eletricista', emoji: '⚡', home: true, open: '08:00', close: '19:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Visita e orçamento', 30, 80], ['Conserto de pane elétrica', 60, 150], ['Trocar tomada ou interruptor', 30, 60], ['Instalar luminária', 45, 90], ['Instalar chuveiro elétrico', 60, 120], ['Quadro de distribuição', 120, 400], ['Emergência', 60, 250]] },
  canalizador: { label: 'Encanador', emoji: '🔧', home: true, open: '08:00', close: '19:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Visita e orçamento', 30, 80], ['Desentupimento', 60, 200], ['Vazamento de água', 60, 180], ['Torneira ou descarga', 45, 120], ['Aquecedor a gás', 90, 250], ['Emergência', 60, 280]] },
  climatizacao: { label: 'Ar-condicionado', emoji: '❄️', home: true, open: '08:00', close: '19:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Visita e orçamento', 30, 80], ['Limpeza e higienização', 60, 180], ['Conserto de ar-condicionado', 90, 250], ['Instalação de split', 180, 600]] },
  reparacoes: { label: 'Marido de aluguel', emoji: '🛠️', home: true, open: '08:00', close: '19:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Pequenos reparos 1h', 60, 100], ['Montagem de móveis', 120, 180], ['Instalar quadros e prateleiras', 60, 100], ['Cortinas e persianas', 60, 120], ['Visita e orçamento', 30, 60]] },
  pintura: { label: 'Pintor', emoji: '🎨', home: true, open: '08:00', close: '18:00', word: 'Equipe', staff: ['Equipe 1', 'Equipe 2'], services: [['Orçamento no local', 45, 0], ['Retoques', 120, 250], ['Pintar teto', 240, 400], ['Pintar cômodo', 480, 900]] },
  jardinagem: { label: 'Jardinagem', emoji: '🌿', home: true, open: '08:00', close: '18:00', word: 'Equipe', staff: ['Equipe 1', 'Equipe 2'], services: [['Corte de grama', 60, 120], ['Manutenção de jardim 2h', 120, 180], ['Poda', 180, 300], ['Irrigação automática', 180, 600]] },
  serralharia: { label: 'Chaveiro', emoji: '🔑', home: true, open: '08:00', close: '20:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Abertura de porta', 30, 150], ['Troca de fechadura', 60, 200], ['Fechadura tetra', 90, 350], ['Emergência', 30, 250]] },
  mudancas: { label: 'Mudanças', emoji: '🚚', home: true, open: '08:00', close: '19:00', word: 'Equipe', staff: ['Equipe 1', 'Equipe 2'], services: [['Orçamento', 30, 0], ['Frete pequeno', 120, 250], ['Mudança 1 quarto', 300, 900], ['Mudança 2-3 quartos', 480, 1600]] },
  estofos: { label: 'Limpeza de sofá', emoji: '🛋️', home: true, open: '08:00', close: '19:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Sofá 2 lugares', 90, 180], ['Sofá 3 lugares', 120, 230], ['Colchão', 60, 150], ['Tapete', 60, 120]] },
  domicilio: { label: 'Outro', emoji: '🏠', home: true, open: '08:00', close: '19:00', staff: ['Técnico 1', 'Técnico 2'], services: [['Visita e orçamento', 30, 80], ['Serviço 1h', 60, 120], ['Serviço 2h', 120, 220]] }
};
const PR = () => (LOC.br ? PRESETS_BR : PRESETS);
const NAMES_BR = ['João Silva', 'Ana Souza', 'Lucas Santos', 'Beatriz Oliveira', 'Gabriel Lima', 'Juliana Rodrigues', 'Rafael Almeida', 'Camila Ferreira', 'Pedro Gomes', 'Mariana Costa', 'Thiago Carvalho', 'Larissa Ribeiro', 'Matheus Pereira', 'Fernanda Martins', 'Felipe Araújo', 'Letícia Barbosa', 'Bruno Rocha', 'Aline Moreira', 'Gustavo Dias', 'Vitória Mendes'];
const STREETS_BR = ['Rua Augusta 1200, ap 42', 'Av. Paulista 900, ap 101', 'Rua Oscar Freire 310', 'Rua da Consolação 55, casa 2', 'Rua Haddock Lobo 88', 'Av. Faria Lima 1500, sala 3', 'Rua Teodoro Sampaio 740', 'Alameda Santos 21, ap 8'];
const NAMES = ['João Silva', 'Ana Costa', 'Miguel Santos', 'Beatriz Ferreira', 'Tiago Oliveira', 'Inês Rodrigues', 'Rui Martins', 'Catarina Sousa', 'Pedro Gomes', 'Mariana Lopes', 'André Carvalho', 'Sofia Almeida', 'Diogo Pereira', 'Rita Ribeiro', 'Francisco Pinto', 'Joana Fernandes', 'Bruno Teixeira', 'Carla Moreira', 'Hugo Correia', 'Leonor Mendes'];
const isHome = () => !!PR()[S?.biz?.type]?.home;
const staffWord = () => PR()[S?.biz?.type]?.word || (isHome() ? 'Técnico' : 'Profissional');
const TRAVEL = 30; // minutos de deslocação entre serviços ao domicílio
const STREETS = ['Rua das Flores 12', 'Av. da Liberdade 210, 3º', 'Rua Augusta 45', 'Rua do Sol 8, r/c', 'Travessa da Fé 3', 'Av. da República 77, 2º Esq', 'Rua de Santa Catarina 101', 'Largo do Carmo 5'];
const DEFAULT_REMIND_PT = 'Olá {nome}! 👋 Lembrete da tua marcação de {servico} {dia} às {hora} na {negocio}. Até já!';
const DEFAULT_REMIND_BR = 'Oi {nome}! 👋 Lembrete do seu agendamento de {servico} {dia} às {hora} na {negocio}. Até logo!';
const defRemind = () => (LOC.br ? DEFAULT_REMIND_BR : DEFAULT_REMIND_PT);

/* ---------------- estado ---------------- */
let S = null;               // dados do negócio
LOC.biz = () => S && S.biz;  // o país do negócio decide língua e moeda
let phase = 'loading';      // loading | auth | onb | app | pub | error | notfound
let ERR = null, EMAIL = '', PUBSLUG = null;
const svc = id => S.services.find(s => s.id === id);
const stf = id => S.staff.find(s => s.id === id);
const cli = id => S.clients.find(c => c.id === id);
const AS = () => S.services.filter(s => s.active !== false);
const AT = () => S.staff.filter(s => s.active !== false);
const bDur = b => b.dur || svc(b.serviceId)?.dur || 30;
const bPrice = b => (b.price ?? svc(b.serviceId)?.price) || 0;
const isPaid = () => !DB.cloud || (S.biz.plan && S.biz.plan !== 'free');

async function persist(table, row) {
  try { await DB.save(S, table, row); }
  catch (e) { toast(DB.friendly(e)); await reload(); }
}
async function persistDel(table, id) {
  try { await DB.remove(S, table, id); }
  catch (e) { toast(DB.friendly(e)); await reload(); }
}
async function persistBiz() {
  try { await DB.saveBiz(S); } catch (e) { toast(DB.friendly(e)); await reload(); }
}
async function reload() { try { S = await DB.load(); } catch (e) {} render(); }

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function buildSeed(name, type, demo) {
  const p = PR()[type];
  const D = {
    biz: { name, type, country: LOC.code, phone: '', address: '', open: p.open || '09:00', close: p.close || '19:00', days: [1, 2, 3, 4, 5, 6], slot: 15, remind: defRemind(), plan: 'free', logo: '', color: '#1E5B47', review: '' },
    agents: defaultAgents(demo), tasks: [], waitlist: [],
    services: p.services.map((s, i) => ({ id: uid(), name: s[0], dur: s[1], price: s[2], color: COLORS[i % COLORS.length], active: true })),
    staff: [{ id: uid(), name: p.staff ? p.staff[0] : 'Eu', active: true }], clients: [], bookings: []
  };
  if (demo) {
    D.staff.push({ id: uid(), name: p.staff ? p.staff[1] : 'Rita', active: true });
    const R = rng(42);
    const br = LOC.br, NM = br ? NAMES_BR : NAMES, ST = br ? STREETS_BR : STREETS, CITY = LOC.c.city;
    D.clients = NM.map((n, i) => ({ id: uid(), name: n, phone: br ? '119' + String(Math.floor(1e7 + R() * 8999999e1)).slice(0, 8) : '9' + (1 + Math.floor(R() * 3)) + String(Math.floor(1e6 + R() * 8999999)).slice(0, 7), notes: p.home ? 'Morada: ' + ST[i % ST.length] + ', ' + CITY + (i % 4 === 0 ? (br ? ' · tem cachorro' : ' · tem cão') : '') : (i % 5 === 0 ? 'Prefere de manhã' : ''), created: addDays(todayISO(), -90), marketingOk: true, consentAt: new Date().toISOString(), optedOut: false }));
    const t = todayISO(), nowM = new Date().getHours() * 60 + new Date().getMinutes();
    for (let d = -60; d <= 6; d++) {
      const day = addDays(t, d); if (!D.biz.days.includes(dow(day))) continue;
      for (const st of D.staff) {
        let m = toMin(D.biz.open); const cl = toMin(D.biz.close);
        while (m < cl - 30) {
          if (R() < (p.home ? 0.45 : 0.38)) { m += 30; continue; }
          const sv = D.services[Math.floor(R() * D.services.length)];
          if (m + sv.dur > cl) break;
          let ci = Math.floor(R() * D.clients.length);
          if (ci >= 15 && d > -40) ci = Math.floor(R() * 15);
          let status = 'confirmada';
          if (d < 0 || (d === 0 && m + sv.dur <= nowM)) { const x = R(); status = x < .88 ? 'concluida' : x < .95 ? 'faltou' : 'cancelada'; }
          D.bookings.push({ id: uid(), clientId: D.clients[ci].id, serviceId: sv.id, staffId: st.id, date: day, time: toT(m), dur: sv.dur, price: sv.price, status, source: R() < .35 ? 'online' : 'app', notes: p.home ? 'Morada: ' + ST[ci % ST.length] + ', ' + CITY : '', isDemo: true });
          m += sv.dur + (p.home ? TRAVEL + (R() < .4 ? 60 : 0) : (R() < .3 ? 15 : 0));
        }
      }
    }
  }
  return D;
}

/* ---------------- lógica de negócio ---------------- */
// Horário de cada profissional: null = horário do negócio; senão { '1': [['09:00','13:00'],['14:00','19:00']], ... } (blocos = pausas no meio)
const isOwner = () => !S || S.role !== 'staff';
const doesSvc = (st, sid) => !sid || !st || !st.services || !st.services.length || st.services.includes(sid);
const staffFor = sid => AT().filter(st => doesSvc(st, sid));
const offOn = (date, staffId) => (S.timeOff || []).find(o => (!o.staffId || o.staffId === staffId) && date >= o.from && date <= o.to);
const bizClosed = date => (S.timeOff || []).find(o => !o.staffId && date >= o.from && date <= o.to);
function workIv(staffId, date) {
  if (offOn(date, staffId)) return [];
  const st = stf(staffId), d = dow(date);
  if (st && st.hours) return (st.hours[d] || []).map(([a, b]) => [toMin(a), toMin(b)]).filter(([a, b]) => b > a);
  return S.biz.days.includes(d) ? [[toMin(S.biz.open), toMin(S.biz.close)]] : [];
}
const dayOpen = (date, staffId) => (staffId && staffId !== 'all' ? [staffId] : AT().map(s => s.id)).some(id => workIv(id, date).length);
function dayRange(date) {
  let o = toMin(S.biz.open), c = toMin(S.biz.close);
  AT().forEach(st => workIv(st.id, date).forEach(([a, b]) => { o = Math.min(o, a); c = Math.max(c, b); }));
  return [Math.floor(o / 60) * 60, Math.ceil(c / 60) * 60];
}
function busy(date, staffId, exclude) {
  return S.bookings.filter(b => b.date === date && b.staffId === staffId && b.status !== 'cancelada' && b.id !== exclude)
    .map(b => { const s = toMin(b.time), buf = isHome() ? TRAVEL : 0; return [s - buf, s + bDur(b) + buf]; });
}
function freeSlots(date, serviceId, staffId, exclude) {
  const sv = svc(serviceId); if (!sv) return [];
  if (!doesSvc(stf(staffId), serviceId)) return [];
  const iv = workIv(staffId, date); if (!iv.length) return [];
  const bz = busy(date, staffId, exclude);
  const n = new Date(), t = todayISO();
  const nowMin = date === t ? n.getHours() * 60 + n.getMinutes() : (date < t ? 1e9 : -1);
  const out = [];
  for (const [o, c] of iv) for (let m = o; m + sv.dur <= c; m += S.biz.slot) { if (m <= nowMin) continue; if (bz.some(([a, b]) => m < b && m + sv.dur > a)) continue; out.push(toT(m)); }
  return out;
}
function freeAny(date, serviceId) {
  const map = {}; for (const st of staffFor(serviceId)) for (const t of freeSlots(date, serviceId, st.id)) (map[t] = map[t] || []).push(st.id);
  return map;
}
function clientStats(id) {
  const bs = S.bookings.filter(b => b.clientId === id);
  const done = bs.filter(b => b.status === 'concluida');
  const last = done.map(b => b.date).sort().pop() || null;
  const next = bs.filter(b => b.status === 'confirmada' && b.date >= todayISO()).map(b => b.date + ' ' + b.time).sort()[0] || null;
  return { visits: done.length, spent: done.reduce((a, b) => a + bPrice(b), 0), last, next, noshow: bs.filter(b => b.status === 'faltou').length };
}
function atRisk() {
  return S.clients.map(c => ({ c, s: clientStats(c.id) })).filter(x => x.s.last && !x.s.next && daysBetween(x.s.last, todayISO()) >= 35)
    .sort((a, b) => a.s.last.localeCompare(b.s.last));
}
function periodStats(days) {
  const t = todayISO(), from = addDays(t, -days);
  const bs = S.bookings.filter(b => b.date > from && b.date <= t);
  const done = bs.filter(b => b.status === 'concluida'), no = bs.filter(b => b.status === 'faltou');
  const rev = done.reduce((a, b) => a + bPrice(b), 0);
  const bySvc = {}; done.forEach(b => { const n = svc(b.serviceId)?.name || '?'; bySvc[n] = (bySvc[n] || 0) + 1; });
  return { marcacoes: bs.length, concluidas: done.length, faltas: no.length, taxaFaltas: bs.length ? Math.round(no.length / bs.length * 100) : 0, receita: rev, ticketMedio: done.length ? Math.round(rev / done.length * 100) / 100 : 0, online: bs.filter(b => b.source === 'online').length, servicos: bySvc };
}
function occupancy(from, days) {
  let avail = 0, used = 0;
  for (let i = 0; i < days; i++) {
    const d = addDays(from, i);
    AT().forEach(st => workIv(st.id, d).forEach(([a, b]) => avail += b - a));
    S.bookings.filter(b => b.date === d && b.status !== 'cancelada').forEach(b => used += bDur(b));
  }
  return avail ? Math.min(100, Math.round(used / avail * 100)) : 0;
}
const igHandle = v => String(v || '').trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/[/?#].*$/, '').replace(/^@/, '').slice(0, 30);
const igSig = () => (S.biz.instagram && S.biz.igInMsgs !== false) ? '\n\n📸 Segue-nos no Instagram: @' + S.biz.instagram : '';
const withSig = t => t + igSig();
function reminderText(b) {
  const c = cli(b.clientId), s = svc(b.serviceId);
  const r = relDay(b.date), dia = r === 'Hoje' ? 'hoje' : r === 'Amanhã' ? 'amanhã' : 'no dia ' + fmtDay(b.date);
  return (S.biz.remind || defRemind()).replaceAll('{nome}', (c?.name || '').split(' ')[0]).replaceAll('{servico}', s?.name || '').replaceAll('{dia}', dia).replaceAll('{hora}', b.time).replaceAll('{negocio}', S.biz.name);
}
const waLink = (phone, text) => 'https://wa.me/' + phoneDigits(phone) + '?text=' + encodeURIComponent(LOC.t(text));
function findOrCreateClient(name, phone, marketing) {
  const n = String(name).trim().toLowerCase(), pd = String(phone || '').replace(/\D/g, '').slice(-9);
  let c = (pd.length === 9 && S.clients.find(x => String(x.phone).replace(/\D/g, '').slice(-9) === pd)) || S.clients.find(x => x.name.toLowerCase() === n);
  let changed = false;
  if (!c) { c = { id: uid(), name: String(name).trim(), phone: cleanPhone(phone), notes: '', created: todayISO() }; S.clients.push(c); changed = true; }
  else if (phone && !c.phone) { c.phone = cleanPhone(phone); changed = true; }
  if (marketing && !c.marketingOk) { c.marketingOk = true; c.consentAt = new Date().toISOString(); c.optedOut = false; changed = true; }
  return { c, changed };
}
async function addBooking(data, source) {
  const s = svc(data.serviceId);
  const { c, changed } = findOrCreateClient(data.clientName, data.phone, data.marketing);
  if (changed) await persist('clients', c);
  const b = { id: uid(), clientId: c.id, serviceId: s.id, staffId: data.staffId, date: data.date, time: data.time, dur: s.dur, price: s.price, status: 'confirmada', source, notes: data.notes || '' };
  S.bookings.push(b);
  try { await DB.save(S, 'bookings', b); }
  catch (e) { S.bookings = S.bookings.filter(x => x.id !== b.id); throw e; }
  if (!DB.cloud && (source === 'online' || source === 'ia')) setTimeout(() => notifyBooking(b, 'nova'), 400); // na nuvem vem do servidor (push)
  return { b, c };
}

/* ---------------- ícones ---------------- */
const I = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/></svg>',
  cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>',
  ai: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l1.9 5.3 5.3 1.9-5.3 1.9L12 16.9l-1.9-5.3-5.3-1.9 5.3-1.9zM19 15l.9 2.4 2.4.9-2.4.9L19 21.6l-.9-2.4-2.4-.9 2.4-.9z"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.8a3.3 3.3 0 0 1 0 6.4M18 14.8c2 .7 3.2 2.4 3.6 5.2"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
};

/* ---------------- router ---------------- */
const VIEWS = ['hoje', 'agenda', 'agentes', 'ia', 'clientes', 'mais', 'reservar'];
let view = 'hoje', agendaDay = todayISO(), agendaStaff = 'all', cliQuery = '';
function go(v) { if (location.hash !== '#' + v) location.hash = v; else render(); }
window.addEventListener('hashchange', () => {
  if (phase === 'pub' && DB.cloud) return;
  const h = location.hash.slice(1); view = VIEWS.includes(h) ? h : 'hoje';
  if (view === 'reservar' && DB.cloud && S) { location.href = pubUrl(); return; }
  closeSheet(true); render();
});
{ const h = location.hash.slice(1); if (VIEWS.includes(h)) view = h; }
function pubSlugFromUrl() {
  const m = location.pathname.match(/\/b\/([a-z0-9-]{3,48})\/?$/i); if (m) return m[1].toLowerCase();
  const q = new URLSearchParams(location.search).get('b'); if (q) return q.toLowerCase();
  return null;
}
const pubUrl = () => location.origin + '/b/' + S.biz.slug;

function render() {
  const root = $('#root');
  if (phase === 'loading') { root.innerHTML = `<div class="center"><div class="logo big"><i>M</i></div><div class="spin"></div></div>`; return; }
  if (phase === 'error') { root.innerHTML = `<div class="onb"><div class="logo"><i>M</i>Marcaí</div><h1>Algo correu mal</h1><p class="muted">${esc(DB.friendly(ERR))}</p><button class="btn" onclick="location.reload()">Tentar de novo</button></div>`; return; }
  if (phase === 'notfound') { root.innerHTML = `<div class="onb"><div class="logo"><i>M</i>Marcaí</div><h1>Página não encontrada</h1><p class="muted">Este link de reservas não existe ou foi alterado.</p></div>`; return; }
  if (phase === 'auth') { root.innerHTML = authView(); bindAuth(); return; }
  if (phase === 'onb') { root.innerHTML = onboarding(); bindOnb(); return; }
  if (phase === 'pub' || view === 'reservar') { root.innerHTML = pubPage(); bindPub(); return; }
  if (!isOwner() && (view === 'agentes' || view === 'ia')) view = 'hoje';
  const body = { hoje: vHoje, agenda: vAgenda, agentes: vAgentes, ia: vIA, clientes: vClientes, mais: vMais }[view]();
  root.innerHTML = `<div class="app">${body}</div>${nav()}${view === 'hoje' || view === 'agenda' ? '<button class="fab" onclick="bookingSheet()" aria-label="Nova marcação">+</button>' : ''}`;
  if (view === 'ia') bindIA();
  if (view === 'agentes') bindAgentes();
  if (view === 'agenda') { const n = $('.now'); if (n && agendaDay === todayISO()) n.scrollIntoView({ block: 'center' }); }
}
function nav() {
  const pend = (S.tasks || []).filter(t => t.status === 'pendente').length;
  const b = (v, ic, l) => `<button class="${view === v || (v === 'agentes' && view === 'ia') ? 'on' : ''} ${v === 'agentes' ? 'ai' : ''}" onclick="go('${v}')">${v === 'agentes' ? `<span class="c">${ic}${pend ? `<em class="badge">${pend > 99 ? '99+' : pend}</em>` : ''}</span>` : ic}<span>${l}</span></button>`;
  return `<nav class="tab"><div class="in">${b('hoje', I.home, 'Hoje')}${b('agenda', I.cal, 'Agenda')}${isOwner() ? b('agentes', I.ai, 'Agentes') : ''}${b('clientes', I.users, 'Clientes')}${b('mais', I.more, 'Mais')}</div></nav>`;
}

/* ---------------- autenticação ---------------- */
let authMode = 'in';
function authView() {
  return `<div class="onb">
    <div class="logo"><i>M</i>Marcaí</div>
    <h1>${authMode === 'up' ? 'Cria a tua conta grátis.' : authMode === 'reset' ? 'Recuperar acesso' : 'Bem-vindo de volta.'}</h1>
    <p class="muted">${authMode === 'up' ? 'Em 2 minutos tens agenda, página de reservas e assistente de IA.' : authMode === 'reset' ? 'Enviamos-te um link para criares uma nova palavra-passe.' : 'Entra para gerir as tuas marcações.'}</p>
    <form class="card" id="authForm" style="margin-top:18px">
      <label class="f"><span>Email</span><input class="inp" id="aE" type="email" autocomplete="email" required></label>
      ${authMode !== 'reset' ? `<label class="f"><span>Palavra-passe</span><input class="inp" id="aP" type="password" minlength="6" autocomplete="${authMode === 'up' ? 'new-password' : 'current-password'}" required></label>` : ''}
      <div id="aMsg" class="small" style="margin-bottom:10px;color:var(--red)"></div>
      <button class="btn block" id="aBtn">${authMode === 'up' ? 'Criar conta' : authMode === 'reset' ? 'Enviar link' : 'Entrar'}</button>
      ${authMode === 'up' ? '<p class="small muted" style="margin:10px 0 0;text-align:center">Ao criar conta aceitas os <a href="../termos.html" target="_blank" rel="noopener">Termos</a> e a <a href="../privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a>.</p>' : ''}
    </form>
    <div style="text-align:center" class="small">
      ${authMode === 'in' ? `<button class="lnk" onclick="authMode='up';render()">Ainda não tens conta? <b>Criar conta</b></button><br><button class="lnk" onclick="authMode='reset';render()">Esqueci-me da palavra-passe</button>`
      : `<button class="lnk" onclick="authMode='in';render()">Já tenho conta — <b>Entrar</b></button>`}
    </div>
    <div style="display:flex;justify-content:center;margin-top:18px">${paisPicker()}</div>
  </div>`;
}
function bindAuth() {
  bindPais();
  $('#authForm').onsubmit = async e => {
    e.preventDefault();
    const em = $('#aE').value.trim(), pw = $('#aP')?.value || '', msg = $('#aMsg'), btn = $('#aBtn');
    btn.disabled = true; btn.textContent = 'Um momento…'; msg.textContent = '';
    try {
      if (authMode === 'in') { await DB.signIn(em, pw); }
      else if (authMode === 'up') {
        const r = await DB.signUp(em, pw);
        if (!r.session) { msg.style.color = 'var(--acc)'; msg.textContent = 'Conta criada! Abre o email que te enviámos para confirmar e depois entra.'; authMode = 'in'; btn.disabled = false; btn.textContent = 'Criar conta'; return; }
      } else { await DB.resetPw(em); msg.style.color = 'var(--acc)'; msg.textContent = 'Se o email existir, vais receber um link em instantes.'; }
    } catch (err) { msg.style.color = 'var(--red)'; msg.textContent = DB.friendly(err); }
    btn.disabled = false; btn.textContent = authMode === 'up' ? 'Criar conta' : authMode === 'reset' ? 'Enviar link' : 'Entrar';
  };
}
function newPwSheet() {
  openSheet(`<h2>Nova palavra-passe</h2><label class="f"><span>Palavra-passe</span><input class="inp" id="nP" type="password" minlength="6"></label><button class="btn block" id="nS">Guardar</button>`, sh => {
    sh.querySelector('#nS').onclick = async () => { try { await DB.setPw(sh.querySelector('#nP').value); closeSheet(); toast('Palavra-passe alterada ✓'); } catch (e) { toast(DB.friendly(e)); } };
  });
}

/* ---------------- país ---------------- */
const paisPicker = () => `<div class="chips pais" style="margin-bottom:12px">${Object.values(LOC.PAIS).map(c => `<button type="button" class="chip ${LOC.code === c.code ? 'on' : ''}" data-pais="${c.code}">${c.flag} ${c.name}</button>`).join('')}</div>`;
function bindPais(before) { document.querySelectorAll('[data-pais]').forEach(b => b.onclick = () => { before && before(); LOC.choose(b.dataset.pais); render(); }); }

/* ---------------- onboarding ---------------- */
let onbType = 'barbearia', onbNameVal = '';
function onboarding() {
  return `<div class="onb">
    <div class="logo"><i>M</i>Marcaí</div>
    <h1>A agenda que se enche sozinha.</h1>
    <p class="muted">Para barbearias, clínicas, eletricistas, canalizadores, limpezas e muito mais. Marcações online 24h, WhatsApp e uma equipa de IA a trabalhar por ti.</p>
    <div class="card" style="margin-top:18px">
      <span class="small muted" style="font-weight:600">País</span>
      <div style="margin-top:6px">${paisPicker()}</div>
      <label class="f"><span>Nome do negócio</span><input class="inp" id="onbName" placeholder="ex.: Barbearia do Zé" maxlength="40" value="${esc(onbNameVal)}"></label>
      <span class="small muted" style="font-weight:600">Tipo de negócio</span>
      <div class="small muted" style="margin-top:6px">No teu espaço</div>
      <div class="types">${Object.entries(PR()).filter(([, p]) => !p.home).map(([k, p]) => `<button data-t="${k}" class="${k === onbType ? 'on' : ''}"><span>${p.emoji}</span>${p.label}</button>`).join('')}</div>
      <div class="small muted">Ao domicílio</div>
      <div class="types">${Object.entries(PR()).filter(([, p]) => p.home).map(([k, p]) => `<button data-t="${k}" class="${k === onbType ? 'on' : ''}"><span>${p.emoji}</span>${p.label}</button>`).join('')}</div>
      <button class="btn block" id="onbEmpty">Criar o meu negócio</button>
      <button class="btn line block" id="onbDemo" style="margin-top:8px">Experimentar com dados de exemplo</button>
    </div>
    <div class="feat"><b>✓</b> Página de reservas com link próprio e QR code</div>
    <div class="feat"><b>✓</b> Lembretes no WhatsApp para teres menos faltas</div>
    <div class="feat"><b>✓</b> IA que marca, responde e recupera clientes</div>
    ${DB.cloud ? `<p class="small muted" style="text-align:center;margin-top:20px">${esc(EMAIL)} · <button class="lnk" onclick="logout()">sair</button></p>` : ''}
  </div>`;
}
function bindOnb() {
  bindPais(() => { onbNameVal = $('#onbName').value; });
  document.querySelectorAll('.types button').forEach(b => b.onclick = () => { onbType = b.dataset.t; document.querySelectorAll('.types button').forEach(x => x.classList.toggle('on', x === b)); });
  const start = async (demo, btn) => {
    const n = $('#onbName').value.trim() || (PR()[onbType].label + (demo ? ' Central' : ''));
    btn.disabled = true; btn.textContent = 'A preparar…';
    try { const seedS = buildSeed(n, onbType, demo); if (!DB.cloud && demo) { S = seedS; ensureShape(); runLocalBasics(true); } S = await DB.createBusiness(seedS); ensureShape(); startLive(); phase = 'app'; view = 'hoje'; location.hash = 'hoje'; render(); toast('Bem-vindo à Marcaí 🎉'); }
    catch (e) { toast(DB.friendly(e)); btn.disabled = false; btn.textContent = 'Tentar de novo'; }
  };
  $('#onbDemo').onclick = e => start(true, e.currentTarget); $('#onbEmpty').onclick = e => start(false, e.currentTarget);
}
async function logout() { await DB.signOut(); S = null; phase = 'auth'; authMode = 'in'; closeSheet(true); render(); }

/* ---------------- HOJE ---------------- */
function vHoje() {
  const t = todayISO(), h = new Date().getHours();
  const greet = h < 12 ? 'Bom dia' : h < 20 ? 'Boa tarde' : 'Boa noite';
  const mine = b => isOwner() || b.staffId === S.me;
  const todays = S.bookings.filter(b => b.date === t && b.status !== 'cancelada' && mine(b)).sort((a, b) => a.time.localeCompare(b.time));
  const prev = todays.reduce((a, b) => a + (b.status === 'faltou' ? 0 : bPrice(b)), 0);
  const nowM = new Date().getHours() * 60 + new Date().getMinutes();
  const upcoming = todays.filter(b => b.status === 'confirmada' && toMin(b.time) + bDur(b) > nowM);
  const toClose = todays.filter(b => b.status === 'confirmada' && toMin(b.time) + bDur(b) <= nowM);
  const p30 = periodStats(30), occ = occupancy(t, 7), risk = atRisk();
  const days = [...Array(14)].map((_, i) => addDays(t, i - 13));
  const rev = days.map(d => S.bookings.filter(b => b.date === d && b.status === 'concluida').reduce((a, b) => a + bPrice(b), 0));
  const max = Math.max(1, ...rev);
  const tomorrow = S.bookings.filter(b => b.date === addDays(t, 1) && b.status === 'confirmada' && mine(b));
  if (!isOwner()) {
    const st = stf(S.me), next7 = S.bookings.filter(b => b.date > t && b.date <= addDays(t, 7) && b.status === 'confirmada' && mine(b)).length, off = offOn(t, S.me) || (S.timeOff || []).find(o => o.staffId === S.me && o.from > t && o.from <= addDays(t, 14));
    return `<div class="top"><div><div class="k">${esc(fmtDay(t))}</div><h1>${greet}${st ? ', ' + esc(st.name.split(' ')[0]) : ''} 👋</h1><div class="muted small">${esc(S.biz.name)}</div></div>${bizLogo(46)}</div>
    <div class="kpis"><div class="kpi hero"><div class="l">Hoje</div><div class="v">${todays.length}</div><div class="d">marcações para ti</div></div><div class="kpi"><div class="l">Próximos 7 dias</div><div class="v">${next7}</div><div class="d">${st ? esc(hoursSummary(st)) : ''}</div></div></div>
    ${off ? `<div class="card" style="background:var(--gold-soft)">🏖️ ${off.from <= t ? 'Hoje estás de folga' : 'Próxima folga'}: ${esc(offLabel(off))}</div>` : ''}
    ${toClose.length ? `<div class="card"><h3>Já passaram <small>marca como concluídas</small></h3>${toClose.map(bookingRow).join('')}</div>` : ''}
    <div class="card"><h3>A seguir <small>${upcoming.length} por atender</small></h3>${upcoming.length ? upcoming.map(bookingRow).join('') : '<div class="empty">Sem mais marcações hoje.</div>'}</div>
    ${tomorrow.length ? `<div class="card"><h3>Amanhã <small>${tomorrow.length}</small></h3>${tomorrow.sort((a, b) => a.time.localeCompare(b.time)).map(bookingRow).join('')}</div>` : ''}
    ${'Notification' in window && Notification.permission !== 'granted' ? `<div class="card" onclick="notifySheet()" style="cursor:pointer"><h3>🔔 Ativa as notificações <small>›</small></h3><div class="small muted">Recebe um aviso no telemóvel quando alguém marca contigo.</div></div>` : ''}`;
  }
  return `
  <div class="top"><div><div class="k">${esc(fmtDay(t))}</div><h1>${greet} 👋</h1><div class="muted small">${esc(S.biz.name)}</div></div><button onclick="brandSheet()" aria-label="Marca">${bizLogo(46)}</button></div>
  ${!S.services.length ? `<div class="card" style="background:var(--gold-soft)"><b>Primeiro passo:</b> cria os teus serviços.<br><button class="btn sm" style="margin-top:8px" onclick="servicesSheet()">Criar serviços</button></div>` : ''}
  <div class="kpis">
    <div class="kpi hero"><div class="l">Hoje</div><div class="v">${todays.length}</div><div class="d">marcações · ${eur(prev)}</div></div>
    <div class="kpi"><div class="l">Ocupação 7 dias</div><div class="v">${occ}%</div><div class="d">${occ < 60 ? 'há espaço para mais' : 'agenda forte'}</div></div>
    <div class="kpi"><div class="l">Receita 30 dias</div><div class="v">${eur(p30.receita)}</div><div class="d">ticket médio ${eur(p30.ticketMedio)}</div></div>
    <div class="kpi"><div class="l">Faltas 30 dias</div><div class="v" style="color:${p30.taxaFaltas > 8 ? 'var(--red)' : 'inherit'}">${p30.taxaFaltas}%</div><div class="d">${p30.faltas} faltas registadas</div></div>
  </div>
  ${toClose.length ? `<div class="card"><h3>Já passaram <small>marca como concluídas</small></h3>${toClose.map(bookingRow).join('')}<button class="btn ghost block" style="margin-top:8px" onclick="closeAllToday()">✓ Marcar todas como concluídas</button></div>` : ''}
  <div class="card"><h3>A seguir <small>${upcoming.length} por atender</small></h3>
    ${upcoming.length ? upcoming.slice(0, 6).map(bookingRow).join('') : `<div class="empty">Sem mais marcações hoje.<br><button class="btn ghost sm" style="margin-top:10px" onclick="bookingSheet()">+ Nova marcação</button></div>`}
  </div>
  ${tomorrow.length ? `<div class="card" style="background:var(--gold-soft);border-color:#F1DDB0"><h3>📲 Lembretes para amanhã <small>${tomorrow.length}</small></h3>
    <div class="small" style="margin-bottom:10px;color:#6B4A00">${DB.cloud && isPaid() ? 'No plano Pro os lembretes saem sozinhos às 18h. Também podes enviá-los já à mão.' : 'Envia os lembretes por WhatsApp. As faltas descem muito quando o cliente recebe um.'}</div>
    <button class="btn block" style="background:var(--ink)" onclick="remindSheet()">Ver lembretes</button></div>` : ''}
  ${risk.length ? `<div class="card"><h3>💸 Clientes a perder <small>${risk.length}</small></h3>
    <div class="small muted" style="margin-bottom:6px">Não vêm há mais de 5 semanas e não têm marcação. Cada um vale cerca de ${eur(risk.reduce((a, x) => a + x.s.spent / Math.max(1, x.s.visits), 0) / risk.length)} por visita.</div>
    ${risk.slice(0, 3).map(x => `<div class="row" onclick="clientSheet('${x.c.id}')"><div class="av">${esc(initials(x.c.name))}</div><div class="m"><b>${esc(x.c.name)}</b><span>última visita há ${daysBetween(x.s.last, t)} dias</span></div><span class="pill red">em risco</span></div>`).join('')}
    <button class="btn ghost block" style="margin-top:8px" onclick="askAI('Escreve uma mensagem curta e simpática de WhatsApp para recuperar os clientes que não vêm há mais de 5 semanas. Diz-me quem são.')">✨ Recuperar com IA</button></div>` : ''}
  <div class="card"><h3>Receita <small>últimos 14 dias</small></h3>
    <div class="bars">${rev.map((v, i) => `<div class="${i === 13 ? 'hi' : ''}" style="height:${Math.max(3, v / max * 100)}%" title="${eur(v)}"></div>`).join('')}</div>
    <div class="barl">${days.map((d, i) => `<span>${i % 2 ? '' : new Date(d + 'T12:00').getDate()}</span>`).join('')}</div>
  </div>
  <div class="card" onclick="pubInfoSheet()" style="cursor:pointer"><h3>🌐 A tua página de reservas <small>›</small></h3><div class="small muted">${p30.online} marcações chegaram online nos últimos 30 dias. Partilha o link no Instagram, no Google e no WhatsApp.</div></div>`;
}
async function closeAllToday() {
  const nowM = new Date().getHours() * 60 + new Date().getMinutes();
  const list = S.bookings.filter(b => b.date === todayISO() && b.status === 'confirmada' && toMin(b.time) + bDur(b) <= nowM);
  list.forEach(b => b.status = 'concluida'); render();
  for (const b of list) await persist('bookings', b);
  toast(list.length + ' concluídas ✓');
}
function statusPill(b) { return { confirmada: '<span class="pill">confirmada</span>', concluida: '<span class="pill grey">concluída</span>', faltou: '<span class="pill red">faltou</span>', cancelada: '<span class="pill grey">cancelada</span>' }[b.status]; }
function bookingRow(b) {
  const c = cli(b.clientId), s = svc(b.serviceId), st = stf(b.staffId);
  return `<div class="row" onclick="bookingDetail('${b.id}')" style="cursor:pointer"><div class="t">${b.time}</div><span class="dot" style="background:${s?.color || '#999'}"></span><div class="m"><b>${esc(c?.name || 'Cliente')}</b><span>${esc(s?.name || '')} · ${bDur(b)} min${AT().length > 1 ? ' · ' + esc(st?.name || '') : ''}${b.source === 'online' ? ' · 🌐' : b.source === 'ia' ? ' · ✨' : ''}</span></div>${statusPill(b)}</div>`;
}

/* ---------------- AGENDA ---------------- */
function vAgenda() {
  const t = todayISO(); const start = addDays(t, -3);
  const days = [...Array(28)].map((_, i) => addDays(start, i));
  if (agendaStaff !== 'all' && !AT().some(s => s.id === agendaStaff)) agendaStaff = 'all';
  const PX = 1.5, [o, c] = dayRange(agendaDay), H = (c - o) * PX;
  const list = S.bookings.filter(b => b.date === agendaDay && b.status !== 'cancelada' && (agendaStaff === 'all' || b.staffId === agendaStaff)).sort((a, b) => a.time.localeCompare(b.time));
  const open = dayOpen(agendaDay, agendaStaff), closedNote = bizClosed(agendaDay);
  let hours = ''; for (let m = Math.ceil(o / 60) * 60; m < c; m += 60) hours += `<div class="h" style="top:${(m - o) * PX}px">${toT(m)}</div>`;
  let slots = ''; if (open) for (let m = o; m < c; m += 30) slots += `<button class="slotbtn" style="top:${(m - o) * PX}px;height:${30 * PX}px" onclick="bookingSheet({date:'${agendaDay}',time:'${toT(m)}'${agendaStaff !== 'all' ? `,staffId:'${agendaStaff}'` : ''}})" aria-label="Marcar às ${toT(m)}"></button>`;
  const cols = agendaStaff === 'all' ? AT() : [stf(agendaStaff)];
  const colStyle = ci => cols.length > 1 ? `left:calc(54px + (100% - 62px) * ${ci}/${cols.length});right:auto;width:calc((100% - 62px)/${cols.length} - 4px);` : '';
  // tempo em que cada profissional não trabalha (pausas, folgas, fora do horário): riscado
  const offs = cols.map((st, ci) => {
    const iv = workIv(st.id, agendaDay), gaps = []; let cur = o;
    iv.slice().sort((a, b) => a[0] - b[0]).forEach(([a, b]) => { if (a > cur) gaps.push([cur, a]); cur = Math.max(cur, b); });
    if (cur < c) gaps.push([cur, c]);
    const why = offOn(agendaDay, st.id);
    return gaps.map(([a, b]) => { const h = (b - a) * PX; const lbl = why ? '🏖️ ' + (why.note || 'Folga') : (iv.length && a > iv[0][0] && b < iv[iv.length - 1][1] ? '☕ Pausa' : ''); return `<div class="offblk" style="${colStyle(ci)}top:${(a - o) * PX}px;height:${h}px">${h > 22 && lbl ? esc(lbl) + (cols.length > 1 ? '' : '') : ''}</div>`; }).join('');
  }).join('');
  const blocks = list.map(b => {
    const s = svc(b.serviceId), cl = cli(b.clientId); const top = (toMin(b.time) - o) * PX, h = Math.max(26, bDur(b) * PX - 3);
    let ci = cols.findIndex(x => x.id === b.staffId); if (ci < 0) ci = 0; const n = cols.length;
    const style = colStyle(ci);
    return `<button class="blk ${b.status}" style="${style}top:${top}px;height:${h}px;background:${s?.color || '#666'}" onclick="bookingDetail('${b.id}')"><b>${b.time} · ${esc(cl?.name.split(' ')[0] || '')}</b>${h > 36 ? esc(s?.name || '') : ''}</button>`;
  }).join('');
  const nM = new Date().getHours() * 60 + new Date().getMinutes();
  const now = agendaDay === t && nM > o && nM < c ? `<div class="now" style="top:${(nM - o) * PX}px"></div>` : '';
  const dayRev = list.filter(b => b.status !== 'faltou').reduce((a, b) => a + bPrice(b), 0);
  return `
  <div class="top"><div><div class="k">Agenda</div><h1>${esc(relDay(agendaDay))}</h1><div class="muted small">${list.length} marcações · ${eur(dayRev)}</div></div>
    ${agendaDay !== t ? `<button class="btn line sm" onclick="agendaDay=todayISO();render()">Hoje</button>` : ''}</div>
  <div class="days">${days.map(d => {
    const has = S.bookings.some(b => b.date === d && b.status === 'confirmada'); const dt = new Date(d + 'T12:00');
    return `<button class="day ${d === agendaDay ? 'on' : ''} ${dayOpen(d, agendaStaff) ? '' : 'off'}" onclick="agendaDay='${d}';render()"><small>${DOW[dt.getDay()]}</small><b>${dt.getDate()}</b>${has && d !== agendaDay ? '<i></i>' : ''}</button>`;
  }).join('')}</div>
  ${AT().length > 1 ? `<div class="chips" style="margin-bottom:12px"><button class="chip ${agendaStaff === 'all' ? 'on' : ''}" onclick="agendaStaff='all';render()">Todos</button>${AT().map(s => `<button class="chip ${agendaStaff === s.id ? 'on' : ''}" onclick="agendaStaff='${s.id}';render()">${esc(s.name)}</button>`).join('')}</div>` : ''}
  ${AT().length > 1 && agendaStaff === 'all' && open ? `<div class="colhead">${cols.map(st => `<span>${esc(st.name)}</span>`).join('')}</div>` : ''}
  ${open ? `<div class="tl" style="height:${H + 8}px">${hours}${offs}${slots}${blocks}${now}</div>
  <p class="small muted" style="text-align:center">Toca num espaço vazio para marcar.</p>` : `<div class="card empty">${closedNote ? '🏖️ Fechado: ' + esc(closedNote.note || 'férias') : agendaStaff !== 'all' && offOn(agendaDay, agendaStaff) ? '🏖️ ' + esc(stf(agendaStaff).name) + ' está de folga' : 'Ninguém trabalha neste dia.'}<br><button class="btn line sm" style="margin-top:10px" onclick="${isOwner() ? (agendaStaff !== 'all' ? `staffEdit('${agendaStaff}')` : 'hoursSheet()') : "go('mais')"}">${isOwner() ? 'Ver horários' : 'Voltar'}</button></div>`}`;
}

/* ---------------- sheets ---------------- */
function openSheet(html, onMount) {
  closeSheet(true);
  const sc = document.createElement('div'); sc.className = 'scrim'; sc.id = 'scrim'; sc.onclick = () => closeSheet();
  const sh = document.createElement('div'); sh.className = 'sheet'; sh.id = 'sheet'; sh.innerHTML = '<div class="grab"></div>' + html;
  document.body.append(sc, sh); requestAnimationFrame(() => { sc.classList.add('on'); sh.classList.add('on'); });
  onMount && onMount(sh);
}
function closeSheet(now) { const sc = $('#scrim'), sh = $('#sheet'); if (!sh) return; if (now) { sc?.remove(); sh.remove(); return; } sc.classList.remove('on'); sh.classList.remove('on'); setTimeout(() => { sc.remove(); sh.remove(); }, 250); }

function bookingSheet(pre = {}, editId) {
  const b = editId ? S.bookings.find(x => x.id === editId) : null;
  if (!AS().length) { toast('Cria primeiro um serviço'); serviceSheet(); return; }
  const preC = b ? cli(b.clientId) : (pre.clientId ? cli(pre.clientId) : null);
  const st = { date: b?.date || pre.date || todayISO(), serviceId: b?.serviceId || pre.serviceId || AS()[0].id, staffId: b?.staffId || pre.staffId || (S.role === 'staff' && S.me) || AT()[0].id, time: b?.time || pre.time || '' };
  if (!b && !doesSvc(stf(st.staffId), st.serviceId)) st.staffId = (staffFor(st.serviceId)[0] || AT()[0]).id;
  const staffOpts = (sid, sel) => (staffFor(sid).length ? staffFor(sid) : AT()).map(s => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
  openSheet(`<h2>${b ? 'Editar marcação' : 'Nova marcação'}</h2>
    <label class="f"><span>Cliente</span><input class="inp" id="bkName" list="cliList" placeholder="Nome do cliente" value="${esc(preC?.name || '')}" autocomplete="off" ${b ? 'disabled' : ''}></label>
    <datalist id="cliList">${S.clients.map(c => `<option value="${esc(c.name)}">`).join('')}</datalist>
    ${b ? '' : `<label class="f"><span>Telemóvel (para o lembrete)</span><input class="inp" id="bkPhone" inputmode="tel" placeholder="${LOC.c.phonePh}" value="${esc(preC?.phone || '')}"></label>`}
    <label class="f"><span>Serviço</span><select class="inp" id="bkSvc">${AS().map(s => `<option value="${s.id}" ${s.id === st.serviceId ? 'selected' : ''}>${esc(s.name)} · ${s.dur} min · ${eur(s.price)}</option>`).join('')}</select></label>
    <div class="grid2">
      <label class="f"><span>Dia</span><input type="date" class="inp" id="bkDate" value="${st.date}"></label>
      <label class="f"><span>${staffWord()}</span><select class="inp" id="bkStaff">${staffOpts(st.serviceId, st.staffId)}</select></label>
    </div>
    <label class="f"><span>Hora disponível</span><div class="slots" id="bkSlots"></div></label>
    <label class="f"><span>${isHome() ? 'Morada do serviço e notas' : 'Notas'}</span><input class="inp" id="bkNotes" placeholder="${isHome() ? 'Rua, nº, andar, cidade · ex.: tem animais' : 'opcional'}" value="${esc(b?.notes || (isHome() && preC?.notes ? preC.notes : ''))}"></label>
    <button class="btn block" id="bkSave">${b ? 'Guardar alterações' : 'Marcar'}</button>`, sh => {
    const nm = sh.querySelector('#bkName'), ph = sh.querySelector('#bkPhone');
    if (ph) nm.addEventListener('change', () => { const c = S.clients.find(x => x.name.toLowerCase() === nm.value.trim().toLowerCase()); if (c && !ph.value) ph.value = c.phone; });
    const draw = () => {
      const d = sh.querySelector('#bkDate').value, sv = sh.querySelector('#bkSvc').value, sf = sh.querySelector('#bkStaff').value;
      let fs = freeSlots(d, sv, sf, editId); if (b && b.date === d && b.staffId === sf && b.serviceId === sv && !fs.includes(b.time)) fs = [b.time, ...fs].sort();
      if (st.time && !fs.includes(st.time)) st.time = '';
      const why = offOn(d, sf);
      sh.querySelector('#bkSlots').innerHTML = fs.length ? fs.map(t => `<button class="slot ${t === st.time ? 'on' : ''}" data-t="${t}">${t}</button>`).join('') : `<div class="small muted" style="grid-column:1/-1">${why ? '🏖️ ' + esc(stf(sf)?.name || '') + ': ' + esc(why.note || 'folga') + ' neste dia.' : !workIv(sf, d).length ? esc(stf(sf)?.name || '') + ' não trabalha neste dia.' : 'Sem horários livres neste dia.'}</div>`;
      sh.querySelectorAll('.slot').forEach(x => x.onclick = () => { st.time = x.dataset.t; sh.querySelectorAll('.slot').forEach(y => y.classList.toggle('on', y === x)); });
    };
    ['#bkDate', '#bkStaff'].forEach(s => sh.querySelector(s).onchange = draw);
    sh.querySelector('#bkSvc').onchange = () => { const sel = sh.querySelector('#bkStaff'), cur = sel.value, sv = sh.querySelector('#bkSvc').value; sel.innerHTML = staffOpts(sv, cur); if (![...sel.options].some(o => o.value === cur)) sel.selectedIndex = 0; draw(); };
    draw();
    sh.querySelector('#bkSave').onclick = async e => {
      const name = nm.value.trim(); if (!name) return toast('Escreve o nome do cliente'); if (!st.time) return toast('Escolhe uma hora');
      if (isHome() && sh.querySelector('#bkNotes').value.trim().length < 6) return toast('Escreve a morada do serviço');
      const btn = e.currentTarget; btn.disabled = true;
      const data = { serviceId: sh.querySelector('#bkSvc').value, staffId: sh.querySelector('#bkStaff').value, date: sh.querySelector('#bkDate').value, time: st.time, notes: sh.querySelector('#bkNotes').value.trim() };
      try {
        if (b) {
          const s = svc(data.serviceId); const old = { ...b };
          Object.assign(b, data, { dur: s.dur, price: b.serviceId === data.serviceId ? b.price : s.price });
          try { await DB.save(S, 'bookings', b); } catch (err) { Object.assign(b, old); throw err; }
        } else await addBooking({ ...data, clientName: name, phone: ph.value.trim() }, 'app');
        closeSheet(); agendaDay = data.date; render(); toast(b ? 'Marcação atualizada' : 'Marcado para ' + relDay(data.date).toLowerCase() + ' às ' + data.time + ' ✓');
      } catch (err) { btn.disabled = false; toast(DB.friendly(err)); }
    };
  });
}
function bookingDetail(id) {
  const b = S.bookings.find(x => x.id === id); if (!b) return; const c = cli(b.clientId), s = svc(b.serviceId), st = stf(b.staffId);
  openSheet(`<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><h2 style="margin-bottom:2px">${esc(c?.name)}</h2><div class="muted">${esc(fmtDay(b.date))} · ${b.time}–${toT(toMin(b.time) + bDur(b))}</div></div>${statusPill(b)}</div>
    <div class="card" style="margin-top:14px">
      <div class="row"><span class="dot" style="background:${s?.color}"></span><div class="m"><b>${esc(s?.name)}</b><span>${bDur(b)} min · ${esc(st?.name)}</span></div><b>${eur(bPrice(b))}</b></div>
      ${b.notes ? `<div class="row"><div class="m"><span>Notas</span><b style="white-space:normal">${esc(b.notes)}</b></div></div>` : ''}
      <div class="row"><div class="m"><span>Origem</span><b>${b.source === 'online' ? '🌐 Página de reservas' : b.source === 'ia' ? '✨ Assistente IA' : 'Marcada na app'}</b></div></div>
    </div>
    ${c?.phone ? `<a class="btn block wa" style="margin-bottom:8px" href="${waLink(c.phone, withSig(reminderText(b)))}" target="_blank" rel="noopener">📲 Enviar lembrete WhatsApp</a>` : ''}
    <div class="grid2" style="margin-bottom:8px">
      <button class="btn ghost" onclick="setStatus('${id}','concluida')">✓ Concluída</button>
      <button class="btn red" onclick="setStatus('${id}','faltou')">Faltou</button>
    </div>
    <div class="grid2">
      <button class="btn line" onclick="bookingSheet({},'${id}')">Mudar hora</button>
      <button class="btn line" onclick="setStatus('${id}','cancelada')">Cancelar</button>
    </div>
    <button class="btn line block" style="margin-top:8px" onclick="clientSheet('${b.clientId}')">Ver ficha do cliente</button>`);
}
async function setStatus(id, stt) {
  const b = S.bookings.find(x => x.id === id); b.status = stt; closeSheet(); render();
  toast({ concluida: 'Marcada como concluída', faltou: 'Falta registada', cancelada: 'Cancelada — horário libertado' }[stt]);
  await persist('bookings', b);
}
function remindSheet() {
  const t = addDays(todayISO(), 1); const list = S.bookings.filter(b => b.date === t && b.status === 'confirmada').sort((a, b) => a.time.localeCompare(b.time));
  openSheet(`<h2>Lembretes de amanhã</h2><p class="small muted" style="margin-top:-8px">Toca em cada um para abrir o WhatsApp com a mensagem já escrita.</p>
  <div class="card">${list.map(b => { const c = cli(b.clientId); return `<div class="row"><div class="t">${b.time}</div><div class="m"><b>${esc(c?.name)}</b><span>${esc(svc(b.serviceId)?.name)}</span></div>${c?.phone ? `<a class="btn sm wa" href="${waLink(c.phone, withSig(reminderText(b)))}" target="_blank" rel="noopener">Enviar</a>` : '<span class="small muted">sem nº</span>'}</div>`; }).join('')}</div>
  <button class="btn line block" onclick="templateSheet()">Editar texto do lembrete</button>`);
}

/* ---------------- CLIENTES ---------------- */
function vClientes() {
  const q = cliQuery.toLowerCase();
  const list = S.clients.filter(c => !q || c.name.toLowerCase().includes(q) || String(c.phone).includes(q)).map(c => ({ c, s: clientStats(c.id) })).sort((a, b) => b.s.spent - a.s.spent || a.c.name.localeCompare(b.c.name));
  return `<div class="top"><div><div class="k">Clientes</div><h1>${S.clients.length} clientes</h1></div><button class="btn sm" onclick="clientEdit()">+ Novo</button></div>
  <div class="search">${I.search}<input class="inp" placeholder="Procurar nome ou telefone" value="${esc(cliQuery)}" oninput="cliQuery=this.value;clearTimeout(window._q);window._q=setTimeout(()=>{render();const i=document.querySelector('.search input');i.focus();i.setSelectionRange(i.value.length,i.value.length)},250)"></div>
  <div class="card">${list.length ? list.map(({ c, s }, i) => `<div class="row" onclick="clientSheet('${c.id}')" style="cursor:pointer"><div class="av">${esc(initials(c.name))}</div><div class="m"><b>${esc(c.name)}${i < 3 && !q && s.spent > 0 ? ' ⭐' : ''}</b><span>${s.visits} visitas · ${s.last ? 'última ' + relDay(s.last).toLowerCase() : 'sem visitas'}</span></div><b class="small">${eur(s.spent)}</b></div>`).join('') : '<div class="empty">Ainda sem clientes. Aparecem aqui com a primeira marcação.</div>'}</div>`;
}
function clientSheet(id) {
  const c = cli(id); if (!c) return; const s = clientStats(id);
  const hist = S.bookings.filter(b => b.clientId === id).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
  openSheet(`<div style="display:flex;gap:12px;align-items:center;margin-bottom:14px"><div class="av" style="width:54px;height:54px;font-size:19px">${esc(initials(c.name))}</div><div style="flex:1"><h2 style="margin:0">${esc(c.name)}</h2><div class="muted small">${esc(c.phone || 'sem telefone')}</div></div><button class="btn line sm" onclick="clientEdit('${id}')">Editar</button></div>
  <div class="kpis"><div class="kpi"><div class="l">Visitas</div><div class="v">${s.visits}</div></div><div class="kpi"><div class="l">Total gasto</div><div class="v">${eur(s.spent)}</div></div></div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px">${s.noshow ? `<span class="pill red">⚠ ${s.noshow} falta${s.noshow > 1 ? 's' : ''}</span>` : ''}${c.optedOut ? '<span class="pill red">🚫 Pediu para não receber mensagens</span>' : c.marketingOk ? '<span class="pill">✓ Aceita promoções</span>' : '<span class="pill grey">Sem consentimento para promoções</span>'}</div>
  ${c.notes ? `<div class="card small"><b>Notas:</b> ${esc(c.notes)}</div>` : ''}
  <div class="grid2" style="margin-bottom:14px"><button class="btn" onclick="bookingSheet({clientId:'${id}'})">+ Marcar</button>${c.phone ? `<a class="btn wa" href="${waLink(c.phone, 'Olá ' + c.name.split(' ')[0] + '! ')}" target="_blank" rel="noopener">WhatsApp</a>` : `<button class="btn line" onclick="clientEdit('${id}')">Pôr telefone</button>`}</div>
  <div class="card"><h3>Histórico</h3>${hist.length ? hist.slice(0, 15).map(b => `<div class="row" onclick="bookingDetail('${b.id}')" style="cursor:pointer"><div class="m"><b>${esc(svc(b.serviceId)?.name)}</b><span>${esc(fmtDay(b.date))} · ${b.time}</span></div>${statusPill(b)}</div>`).join('') : '<div class="empty">Sem marcações.</div>'}</div>`);
}
function clientEdit(id) {
  const c = id ? cli(id) : { name: '', phone: '', notes: '' };
  openSheet(`<h2>${id ? 'Editar cliente' : 'Novo cliente'}</h2>
  <label class="f"><span>Nome</span><input class="inp" id="cN" value="${esc(c.name)}" maxlength="60"></label>
  <label class="f"><span>Telemóvel</span><input class="inp" id="cP" inputmode="tel" value="${esc(c.phone)}"></label>
  <label class="f"><span>Notas (preferências…)</span><textarea class="inp" id="cO" rows="3">${esc(c.notes)}</textarea></label>
  <label class="chk"><input type="checkbox" id="cMk" ${c.marketingOk ? 'checked' : ''}> O cliente aceitou receber novidades e promoções por WhatsApp</label>
  <label class="chk"><input type="checkbox" id="cOut" ${c.optedOut ? 'checked' : ''}> O cliente pediu para não receber mensagens automáticas (PARAR)</label>
  <button class="btn block" id="cS">Guardar</button>${id ? `<button class="btn red block" style="margin-top:8px" id="cD">Apagar cliente</button>` : ''}`, sh => {
    sh.querySelector('#cS').onclick = async () => {
      const n = sh.querySelector('#cN').value.trim(); if (!n) return toast('Falta o nome');
      const mk = sh.querySelector('#cMk').checked, out = sh.querySelector('#cOut').checked;
      const d = { name: n, phone: cleanPhone(sh.querySelector('#cP').value), notes: sh.querySelector('#cO').value.trim(), marketingOk: mk && !out, optedOut: out };
      if (mk && !c.marketingOk) d.consentAt = new Date().toISOString();
      let row; if (id) { Object.assign(c, d); row = c; } else { row = { id: uid(), ...d, created: todayISO() }; S.clients.push(row); }
      closeSheet(); render(); toast('Guardado ✓'); await persist('clients', row);
    };
    const d = sh.querySelector('#cD'); if (d) d.onclick = async () => {
      if (!d.dataset.k) { d.dataset.k = 1; d.textContent = 'Toca de novo para confirmar (apaga também o histórico)'; return; }
      S.clients = S.clients.filter(x => x.id !== id); S.bookings = S.bookings.filter(b => b.clientId !== id);
      closeSheet(); render(); toast('Cliente apagado'); await persistDel('clients', id);
    };
  });
}

/* ---------------- MAIS ---------------- */
function vMais() {
  const it = (ic, t, s, fn) => `<div class="row" onclick="${fn}"><div class="ic">${ic}</div><div class="m"><b>${t}</b><span>${s}</span></div><span class="muted">›</span></div>`;
  if (!isOwner()) {
    const st = stf(S.me);
    return `<div class="top"><div><div class="k">${esc(S.biz.name)}</div><h1>${esc(st?.name || 'Equipa')}</h1><div class="muted small">${st ? esc(hoursSummary(st)) : ''}</div></div></div>
    <div class="card menu">
      ${it('🏖️', 'As minhas folgas e férias', 'Marca os dias em que não trabalhas', 'myOffSheet()')}
      ${it('🔔', 'Notificações', notifyOn() ? 'Ativas neste telemóvel' : 'Avisos de novas marcações', 'notifySheet()')}
      ${isStandalone() ? '' : it('📲', 'Instalar a app no telemóvel', 'Ícone no ecrã inicial, sem loja de apps', 'installSheet()')}
      ${it('🌐', 'Página de reservas', 'Para partilhar com clientes', 'pubInfoSheet()')}
      ${it('🔒', 'Privacidade e termos', 'Como tratamos os dados', "location.href='../privacidade.html'")}
      ${DB.cloud ? it('🚪', 'Terminar sessão', esc(EMAIL), 'logout()') : ''}
    </div><p class="small muted" style="text-align:center">Horários, preços e agentes são geridos pelo dono do negócio.</p>`;
  }
  const plan = { free: 'Grátis', pro: 'Pro', team: 'Equipa' }[S.biz.plan || 'free'];
  return `<div class="top"><div><div class="k">Definições</div><h1>${esc(S.biz.name)}</h1><div class="muted small">${PR()[S.biz.type]?.emoji || ''} ${PR()[S.biz.type]?.label || ''}${DB.cloud ? ' · plano ' + plan : ''}</div></div></div>
  <div class="card menu">
    ${it('🎨', 'Marca do negócio', S.biz.logo ? 'Logótipo e cor definidos' : 'Põe o teu logótipo e a tua cor', 'brandSheet()')}
    ${it('🌐', 'Página de reservas online', DB.cloud ? esc(location.host + '/b/' + S.biz.slug) : 'Os clientes marcam sozinhos, 24h', 'pubInfoSheet()')}
    ${it('✂️', 'Serviços e preços', AS().length + ' serviços', 'servicesSheet()')}
    ${it('👥', 'Equipa', AT().map(s => esc(s.name)).join(', ') + ' · horários, folgas e acessos', 'staffSheet()')}
    ${it('🕘', 'Horário', S.biz.open + '–' + S.biz.close + ' · ' + S.biz.days.map(d => DOW[d]).join(' '), 'hoursSheet()')}
    ${it('📲', 'Texto do lembrete', 'Mensagem de WhatsApp', 'templateSheet()')}
    ${it('🏪', 'Dados do negócio', 'Nome, telefone, morada' + (S.biz.instagram ? ' · @' + esc(S.biz.instagram) : ', Instagram'), 'bizSheet()')}
  </div>
  <div class="card menu">
    ${isStandalone() ? '' : it('📲', 'Instalar a app no telemóvel', 'Ícone no ecrã inicial, sem loja de apps', 'installSheet()')}
    ${it('🔔', 'Notificações', notifyOn() ? 'Ativas neste telemóvel' : 'Aviso no telemóvel a cada nova marcação', 'notifySheet()')}
    ${it('💬', 'WhatsApp', waAuto() ? 'Automático ligado ⚡' : waShared() && DB.cloud ? 'Link de marcação pelo WhatsApp' : 'Modo 1 toque ✅', 'waSheet()')}
    ${it('⭐', 'Plano e faturação', DB.cloud ? 'Atual: ' + plan : 'Grátis, Pro e Equipa', 'plansSheet()')}
    ${it('📤', 'Exportar dados', 'Copiar tudo em JSON', 'copy(JSON.stringify(S,null,1))')}
    ${it('🔒', 'Privacidade e termos', 'Como tratamos os dados', "location.href='../privacidade.html'")}
    ${DB.cloud ? it('🚪', 'Terminar sessão', esc(EMAIL), 'logout()') : ''}
    ${it('↺', DB.cloud ? 'Apagar negócio' : 'Recomeçar', 'Apaga todos os dados', 'resetSheet()')}
  </div>
  <p class="small muted" style="text-align:center">Marcaí ${DB.cloud ? '· dados guardados na nuvem com segurança' : '· modo demonstração · os dados ficam neste dispositivo'}</p>`;
}
function pubInfoSheet() {
  const url = DB.cloud ? pubUrl() : '';
  openSheet(`<h2>Página de reservas</h2>
  <p class="muted small" style="margin-top:-6px">Os clientes escolhem o serviço, o profissional e a hora, sem te ligarem. Entra logo na agenda com 🌐.</p>
  ${DB.cloud ? `<div class="card" style="text-align:center"><div id="qr" style="display:inline-block;padding:8px;background:#fff;border-radius:12px"></div><div class="small" style="margin-top:8px;word-break:break-all"><b>${esc(url)}</b></div>
    <div class="grid2" style="margin-top:10px"><button class="btn ghost" onclick="copy('${esc(url)}')">Copiar link</button><a class="btn line" href="${esc(url)}">Abrir</a></div></div>`
    : `<button class="btn block" onclick="go('reservar')">Abrir a página (vista do cliente)</button>`}
  <div class="card small" style="margin-top:12px"><b>Onde partilhar:</b><br>• Link na bio do Instagram e do TikTok<br>• Botão "Reservar" no perfil do Google<br>• Mensagem automática do WhatsApp Business<br>• QR code impresso ao balcão</div>`, sh => {
    const q = sh.querySelector('#qr'); if (q && window.QRCode) { try { new QRCode(q, { text: url, width: 170, height: 170, colorDark: '#17201C' }); } catch (e) {} }
  });
}
function servicesSheet() {
  openSheet(`<h2>Serviços</h2><div class="card">${AS().map(s => `<div class="row" onclick="serviceSheet('${s.id}')" style="cursor:pointer"><span class="dot" style="background:${s.color}"></span><div class="m"><b>${esc(s.name)}</b><span>${s.dur} min</span></div><b>${eur(s.price)}</b></div>`).join('') || '<div class="empty">Sem serviços</div>'}</div><button class="btn block" onclick="serviceSheet()">+ Novo serviço</button>`);
}
function serviceSheet(id) {
  const s = id ? svc(id) : { name: '', dur: 30, price: 15, color: COLORS[AS().length % COLORS.length] };
  openSheet(`<h2>${id ? 'Editar serviço' : 'Novo serviço'}</h2>
  <label class="f"><span>Nome</span><input class="inp" id="sN" value="${esc(s.name)}" maxlength="60"></label>
  <div class="grid2"><label class="f"><span>Duração (min)</span><input class="inp" id="sD" type="number" min="5" max="600" step="5" value="${s.dur}"></label><label class="f"><span>Preço (${LOC.sym()})</span><input class="inp" id="sP" type="number" min="0" step="0.5" value="${s.price}"></label></div>
  <label class="f"><span>Cor</span><div class="chips">${COLORS.map(c => `<button class="chip cl" data-c="${c}" style="background:${c};width:34px;height:34px;padding:0;border:3px solid ${c === s.color ? 'var(--ink)' : '#fff'}"></button>`).join('')}</div></label>
  <button class="btn block" id="sS">Guardar</button>${id ? '<button class="btn red block" style="margin-top:8px" id="sX">Apagar</button>' : ''}`, sh => {
    let col = s.color; sh.querySelectorAll('.cl').forEach(b => b.onclick = () => { col = b.dataset.c; sh.querySelectorAll('.cl').forEach(x => x.style.borderColor = x === b ? 'var(--ink)' : '#fff'); });
    sh.querySelector('#sS').onclick = async () => {
      const n = sh.querySelector('#sN').value.trim(); if (!n) return toast('Falta o nome');
      const d = { name: n, dur: Math.min(600, Math.max(5, +sh.querySelector('#sD').value || 30)), price: Math.max(0, +sh.querySelector('#sP').value || 0), color: col };
      let row; if (id) { Object.assign(s, d); row = s; } else { row = { id: uid(), ...d, active: true, position: S.services.length }; S.services.push(row); }
      servicesSheet(); render(); await persist('services', row);
    };
    const x = sh.querySelector('#sX'); if (x) x.onclick = async () => {
      if (S.bookings.some(b => b.serviceId === id && b.status === 'confirmada' && b.date >= todayISO())) return toast('Tem marcações futuras — cancela-as primeiro');
      s.active = false; if (!DB.cloud) S.services = S.services.filter(v => v.id !== id || S.bookings.some(b => b.serviceId === id));
      servicesSheet(); render(); await persistDel('services', id);
    };
  });
}
/* ---------- equipa: horário, pausas, folgas, serviços e acesso ---------- */
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const fmtD = d => d.split('-').reverse().slice(0, 2).join('/');
const offLabel = o => (o.from === o.to ? fmtD(o.from) : fmtD(o.from) + '–' + fmtD(o.to)) + (o.note ? ' · ' + o.note : '');
function hoursSummary(st) {
  if (!st.hours) return 'Horário do negócio';
  const ds = WEEK.filter(d => (st.hours[d] || []).length);
  if (!ds.length) return 'Sem dias definidos';
  const iv = st.hours[ds[0]]; return ds.map(d => DOW[d]).join(' ') + ' · ' + iv[0][0] + '–' + iv[iv.length - 1][1] + (iv.length > 1 ? ' (com pausa)' : '');
}
function staffSheet() {
  const t = todayISO();
  openSheet(`<h2>Equipa</h2><p class="small muted" style="margin-top:-6px">Toca numa pessoa para definir horário, pausas, folgas, férias e os serviços que faz.</p>
  <div class="card">${AT().map(s => { const off = (S.timeOff || []).find(o => o.staffId === s.id && o.to >= t && o.from <= addDays(t, 14));
    return `<div class="row" onclick="staffEdit('${s.id}')" style="cursor:pointer"><div class="av">${esc(initials(s.name))}</div><div class="m"><b>${esc(s.name)}${s.linked ? ' <span class="pill" style="font-size:10.5px">📱 tem acesso</span>' : ''}</b><span>${esc(hoursSummary(s))} · ${s.services?.length ? s.services.length + ' serviços' : 'todos os serviços'}${off ? ' · 🏖️ ' + esc(offLabel(off)) : ''}</span></div><span class="muted">›</span></div>`; }).join('')}</div>
  ${DB.cloud && S.biz.plan !== 'team' && AT().length >= 2 ? '<p class="small muted">Para mais de 2 profissionais recomenda-se o plano Equipa.</p>' : ''}
  <div style="display:flex;gap:8px"><input class="inp" id="stN" placeholder="Nome" maxlength="40"><button class="btn" onclick="addStaff()">Adicionar</button></div>`);
}
async function addStaff() { const n = $('#stN').value.trim(); if (!n) return; const row = { id: uid(), name: n, active: true, hours: null, services: [] }; S.staff.push(row); render(); await persist('staff', row); staffEdit(row.id); }
function offList(staffId) {
  const t = todayISO(), list = (S.timeOff || []).filter(o => (staffId ? o.staffId === staffId : !o.staffId) && o.to >= t).sort((a, b) => a.from.localeCompare(b.from));
  return list.length ? list.map(o => `<div class="row"><div class="m"><b>🏖️ ${esc(offLabel(o))}</b><span>${daysBetween(o.from, o.to) + 1} dia${o.from === o.to ? '' : 's'}${S.bookings.some(b => (!staffId || b.staffId === staffId) && b.status === 'confirmada' && b.date >= o.from && b.date <= o.to) ? ' · ⚠ há marcações nestes dias' : ''}</span></div><button class="btn line sm" data-deloff="${o.id}">Apagar</button></div>`).join('')
    : `<div class="small muted" style="padding:6px 0">${staffId ? 'Sem folgas nem férias marcadas.' : 'Sem fechos marcados (feriados, férias do negócio…).'}</div>`;
}
function offForm(prefix) {
  return `<div class="grid2" style="margin-top:8px"><label class="f"><span>De</span><input type="date" class="inp" id="${prefix}F" value="${addDays(todayISO(), 1)}"></label><label class="f"><span>Até</span><input type="date" class="inp" id="${prefix}T" value="${addDays(todayISO(), 1)}"></label></div>
  <div style="display:flex;gap:8px"><input class="inp" id="${prefix}N" placeholder="Motivo (opcional): férias, feriado, consulta…" maxlength="80"><button class="btn sm" id="${prefix}A">Adicionar</button></div>`;
}
function bindOff(sh, prefix, staffId, reopen) {
  sh.querySelector('#' + prefix + 'A').onclick = async () => {
    const f = sh.querySelector('#' + prefix + 'F').value, t = sh.querySelector('#' + prefix + 'T').value || f, n = sh.querySelector('#' + prefix + 'N').value.trim();
    if (!f) return toast('Escolhe a data'); if (t < f) return toast('A data final tem de ser depois da inicial');
    const row = { id: uid(), staffId: staffId || null, from: f, to: t, note: n }; S.timeOff.push(row);
    const clash = S.bookings.filter(b => (!staffId || b.staffId === staffId) && b.status === 'confirmada' && b.date >= f && b.date <= t).length;
    toast(clash ? `Guardado · atenção: há ${clash} marcações nesses dias` : 'Guardado ✓'); render(); reopen(); await persist('time_off', row);
  };
  sh.querySelectorAll('[data-deloff]').forEach(b => b.onclick = async e => { e.stopPropagation(); const id = b.dataset.deloff; S.timeOff = S.timeOff.filter(o => o.id !== id); render(); reopen(); await persistDel('time_off', id); });
}
function staffEdit(id) {
  const st = stf(id); if (!st) return;
  const same = !st.hours, base = d => S.biz.days.includes(d) ? [[S.biz.open, S.biz.close]] : [];
  const row = d => {
    const iv = st.hours ? (st.hours[d] || []) : base(d), on = iv.length > 0;
    const a = on ? iv[0][0] : S.biz.open, b = on ? iv[iv.length - 1][1] : S.biz.close, pa = iv.length > 1 ? iv[0][1] : '', pb = iv.length > 1 ? iv[1][0] : '';
    return `<div class="wk" data-d="${d}"><button type="button" class="chip ${on ? 'on' : ''}" data-day>${DOW[d]}</button>
      <div class="t4" style="${on ? '' : 'opacity:.35'}"><input type="time" class="inp" data-k="a" value="${a}" aria-label="Entrada"><input type="time" class="inp" data-k="b" value="${b}" aria-label="Saída"><span class="pz">☕ pausa</span><span></span><input type="time" class="inp" data-k="pa" value="${pa}" aria-label="Pausa de"><input type="time" class="inp" data-k="pb" value="${pb}" aria-label="Pausa até"></div></div>`;
  };
  openSheet(`<h2>${esc(st.name)}</h2>
  <label class="f"><span>Nome</span><input class="inp" id="seN" value="${esc(st.name)}" maxlength="40"></label>
  <span class="small muted" style="font-weight:600">Serviços que faz</span>
  <div class="chips" id="seS" style="flex-wrap:wrap;margin:6px 0 4px">${AS().map(v => `<button type="button" class="chip ${!st.services.length || st.services.includes(v.id) ? 'on' : ''}" data-s="${v.id}">${esc(v.name)}</button>`).join('')}</div>
  <div class="small muted" style="margin-bottom:14px">Os clientes só veem ${esc(st.name)} nos serviços escolhidos.</div>
  <div class="card"><h3>🕘 Horário de trabalho</h3>
    <label class="swrow"><span class="small">Igual ao horário do negócio<br><span class="muted">${S.biz.open}–${S.biz.close} · ${S.biz.days.map(d => DOW[d]).join(' ')}</span></span><input type="checkbox" id="seSame" ${same ? 'checked' : ''}></label>
    <div id="seWeek" style="${same ? 'display:none' : ''}"><div class="wk" style="padding-top:0"><span></span><div class="t4 small muted"><span>Entrada</span><span>Saída</span></div></div>${WEEK.map(row).join('')}</div>
  </div>
  <div class="card"><h3>🏖️ Folgas e férias</h3><div id="seOff">${offList(id)}</div>${offForm('so')}</div>
  ${DB.cloud ? `<div class="card"><h3>📱 Acesso à app</h3>${st.linked ? `<div class="small">✓ ${esc(st.name)} já entra com a própria conta e vê a agenda no telemóvel.</div>` : `<div class="small muted" style="margin-bottom:8px">Põe o email de ${esc(st.name)}. Depois envia-lhe o link da app: ao criar conta com este email, fica ligado(a) à tua equipa. Vê a agenda e recebe notificações, mas não mexe em preços, planos nem agentes.</div>`}
    <label class="f" style="margin:8px 0 0"><span>Email</span><input class="inp" id="seE" type="email" value="${esc(st.inviteEmail || '')}" placeholder="nome@email.com" autocomplete="off" autocapitalize="off"></label>
    ${!st.linked ? `<a class="btn line block wa" style="margin-top:8px" href="${waLink('', 'Olá ' + st.name.split(' ')[0] + '! Agora a nossa agenda está na Marcaí. Cria conta aqui com o teu email (' + (st.inviteEmail || 'o teu email') + ') e vês as tuas marcações no telemóvel: ' + location.origin + location.pathname)}" target="_blank" rel="noopener">📲 Enviar convite por WhatsApp</a>` : ''}</div>`
    : `<div class="card small muted">📱 Na versão online, ${esc(st.name)} entra com a própria conta, vê a agenda e recebe notificações no telemóvel.</div>`}
  <button class="btn block" id="seSave">Guardar</button>
  ${AT().length > 1 ? `<button class="btn red block" style="margin-top:8px" onclick="delStaff('${id}')">Remover da equipa</button>` : ''}`, sh => {
    sh.querySelector('#seSame').onchange = e => { sh.querySelector('#seWeek').style.display = e.target.checked ? 'none' : ''; };
    sh.querySelectorAll('#seS .chip').forEach(b => b.onclick = () => b.classList.toggle('on'));
    sh.querySelectorAll('[data-day]').forEach(b => b.onclick = () => { b.classList.toggle('on'); b.nextElementSibling.style.opacity = b.classList.contains('on') ? '' : '.35'; });
    bindOff(sh, 'so', id, () => { const o = sh.querySelector('#seOff'); if (o) { o.innerHTML = offList(id); bindOff(sh, 'so', id, () => staffEdit(id)); } });
    sh.querySelector('#seSave').onclick = async () => {
      const name = sh.querySelector('#seN').value.trim(); if (!name) return toast('Falta o nome');
      const svcOn = [...sh.querySelectorAll('#seS .chip.on')].map(b => b.dataset.s);
      if (!svcOn.length) return toast('Escolhe pelo menos um serviço');
      let hours = null;
      if (!sh.querySelector('#seSame').checked) {
        hours = {};
        for (const r of sh.querySelectorAll('#seWeek .wk[data-d]')) {
          const d = r.dataset.d; if (!r.querySelector('[data-day]').classList.contains('on')) continue;
          const v = k => r.querySelector(`[data-k="${k}"]`).value;
          const a = v('a'), b = v('b'), pa = v('pa'), pb = v('pb');
          if (!a || !b || toMin(b) <= toMin(a)) return toast(`${DOW[d]}: a saída tem de ser depois da entrada`);
          if (pa || pb) {
            if (!pa || !pb || toMin(pb) <= toMin(pa) || toMin(pa) <= toMin(a) || toMin(pb) >= toMin(b)) return toast(`${DOW[d]}: a pausa tem de ficar dentro do horário`);
            hours[d] = [[a, pa], [pb, b]];
          } else hours[d] = [[a, b]];
        }
        if (!Object.keys(hours).length) return toast('Escolhe pelo menos um dia de trabalho');
      }
      const email = sh.querySelector('#seE') ? sh.querySelector('#seE').value.trim().toLowerCase() : st.inviteEmail;
      if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast('Esse email não parece válido');
      Object.assign(st, { name, services: svcOn.length === AS().length ? [] : svcOn, hours, inviteEmail: email || '' });
      const lost = S.bookings.filter(b => b.staffId === id && b.status === 'confirmada' && b.date >= todayISO() && !workIv(id, b.date).some(([x, y]) => toMin(b.time) >= x && toMin(b.time) + bDur(b) <= y)).length;
      staffSheet(); render(); toast(lost ? `Guardado · ${lost} marcações ficaram fora do novo horário` : 'Guardado ✓'); await persist('staff', st);
    };
  });
}
async function delStaff(id) {
  if (S.bookings.some(b => b.staffId === id && b.status === 'confirmada' && b.date >= todayISO())) return toast('Tem marcações futuras');
  stf(id).active = false; if (agendaStaff === id) agendaStaff = 'all'; staffSheet(); render(); await persistDel('staff', id);
}
function hoursSheet() {
  openSheet(`<h2>Horário do negócio</h2><div class="grid2"><label class="f"><span>Abre</span><input type="time" class="inp" id="hO" value="${S.biz.open}"></label><label class="f"><span>Fecha</span><input type="time" class="inp" id="hC" value="${S.biz.close}"></label></div>
  <label class="f"><span>Dias abertos</span><div class="chips" id="hD">${WEEK.map(d => `<button class="chip ${S.biz.days.includes(d) ? 'on' : ''}" data-d="${d}">${DOW[d]}</button>`).join('')}</div></label>
  <label class="f"><span>Intervalo entre horários</span><select class="inp" id="hS">${[10, 15, 20, 30].map(m => `<option ${m === S.biz.slot ? 'selected' : ''} value="${m}">${m} min</option>`).join('')}</select></label>
  <button class="btn block" id="hSave">Guardar</button>
  <div class="small muted" style="margin:10px 0 4px">Horários diferentes por pessoa, pausas para almoço e folgas: <button class="lnk" onclick="staffSheet()"><b>Equipa ›</b></button></div>
  <div class="card" style="margin-top:12px"><h3>🏖️ Fechos e férias do negócio</h3><div class="small muted">Feriados ou férias em que ninguém trabalha. A página de reservas e os agentes deixam de oferecer esses dias.</div><div id="bzOff">${offList(null)}</div>${offForm('bo')}</div>`, sh => {
    sh.querySelectorAll('#hD .chip').forEach(b => b.onclick = () => b.classList.toggle('on'));
    bindOff(sh, 'bo', null, () => hoursSheet());
    sh.querySelector('#hSave').onclick = async () => {
      const o = sh.querySelector('#hO').value, c = sh.querySelector('#hC').value; if (toMin(c) <= toMin(o)) return toast('A hora de fecho tem de ser depois da abertura');
      Object.assign(S.biz, { open: o, close: c, slot: +sh.querySelector('#hS').value, days: [...sh.querySelectorAll('#hD .chip.on')].map(b => +b.dataset.d) });
      closeSheet(); render(); toast('Horário guardado'); await persistBiz();
    };
  });
}
function templateSheet() {
  openSheet(`<h2>Texto do lembrete</h2><p class="small muted" style="margin-top:-6px">Usa {nome}, {servico}, {dia}, {hora} e {negocio}.</p>
  <textarea class="inp" id="tT" rows="5">${esc(S.biz.remind || defRemind())}</textarea><button class="btn block" style="margin-top:10px" id="tS">Guardar</button>`, sh => {
    sh.querySelector('#tS').onclick = async () => { S.biz.remind = sh.querySelector('#tT').value; closeSheet(); toast('Guardado ✓'); await persistBiz(); };
  });
}
function bizSheet() {
  openSheet(`<h2>Dados do negócio</h2><label class="f"><span>Nome</span><input class="inp" id="bN" value="${esc(S.biz.name)}" maxlength="60"></label>
  <label class="f"><span>Telefone</span><input class="inp" id="bP" value="${esc(S.biz.phone)}"></label>
  <label class="f"><span>Morada</span><input class="inp" id="bA" value="${esc(S.biz.address)}"></label>
  <label class="f"><span>País</span><select class="inp" id="bC">${Object.values(LOC.PAIS).map(c => `<option value="${c.code}" ${LOC.code === c.code ? 'selected' : ''}>${c.flag} ${c.name}</option>`).join('')}</select></label>
  <label class="f"><span>Instagram do negócio</span><input class="inp" id="bI" placeholder="@barbeariadoze" value="${S.biz.instagram ? '@' + esc(S.biz.instagram) : ''}" autocapitalize="off" autocomplete="off"></label>
  <label class="chk"><input type="checkbox" id="bIM" ${S.biz.igInMsgs !== false ? 'checked' : ''}> Incluir o meu Instagram no fim das mensagens dos agentes (lembretes, avaliações, recuperação de clientes)</label>
  <div class="small muted" id="bIP" style="margin:-2px 0 12px"></div>
  <button class="btn block" id="bS">Guardar</button>`, sh => {
    const prev = () => { const h = igHandle(sh.querySelector('#bI').value); sh.querySelector('#bIP').textContent = h && sh.querySelector('#bIM').checked ? 'As mensagens vão terminar com: "📸 Segue-nos no Instagram: @' + h + '"' : ''; };
    sh.querySelector('#bI').oninput = prev; sh.querySelector('#bIM').onchange = prev; prev();
    sh.querySelector('#bS').onclick = async () => {
      const h = igHandle(sh.querySelector('#bI').value);
      if (h && !/^[A-Za-z0-9._]{1,30}$/.test(h)) return toast('Esse @ do Instagram não parece válido');
      S.biz.name = sh.querySelector('#bN').value.trim() || S.biz.name; S.biz.phone = sh.querySelector('#bP').value.trim(); S.biz.address = sh.querySelector('#bA').value.trim();
      S.biz.instagram = h; S.biz.igInMsgs = sh.querySelector('#bIM').checked;
      const pc = sh.querySelector('#bC').value; if (pc !== S.biz.country) { S.biz.country = pc; LOC.choose(pc); }
      closeSheet(); render(); toast('Guardado ✓'); await persistBiz(); };
  });
}
function plansSheet() {
  const cur = S.biz.plan || 'free';
  const btn = (p, label) => !DB.cloud ? '' : cur === p ? '<div class="pill" style="display:inline-block;margin-top:10px">Plano atual</div>'
    : cur === 'free' ? `<button class="btn block" style="margin-top:12px" onclick="billing('checkout','${p}')">${label}</button>` : '';
  const pr = LOC.c.plans;
  openSheet(`<h2>Planos Marcaí</h2>
  <div class="plan"><b>Grátis</b><div class="p">${pr.free}</div><ul><li>Até 50 marcações por mês</li><li>Página de reservas + QR</li><li>Lembretes WhatsApp manuais</li></ul>${DB.cloud && cur === 'free' ? '<div class="pill" style="display:inline-block;margin-top:10px">Plano atual</div>' : ''}</div>
  <div class="plan best"><b>Pro · a tua equipa de IA</b><div class="p">${pr.pro}<span class="small muted">/mês</span></div><ul><li>Marcações ilimitadas</li><li>6 agentes de IA: Rececionista, Anti-faltas, Recuperador, Marketing, Avaliações e Gestor</li><li>Envio automático no WhatsApp</li><li>Logótipo e cor da tua marca</li></ul>${btn('pro', 'Assinar Pro')}</div>
  <div class="plan"><b>Equipa</b><div class="p">${pr.team}<span class="small muted">/mês</span></div><ul><li>Tudo do Pro</li><li>Até 10 profissionais</li><li>Número de WhatsApp próprio para o Rececionista</li><li>Suporte prioritário</li></ul>${btn('team', 'Assinar Equipa')}</div>
  ${DB.cloud && cur !== 'free' ? (LOC.br
      ? `<button class="btn line block" onclick="pixAction('invoice')">Ver cobrança Pix do mês</button><button class="btn line block" style="margin-top:8px" onclick="pixCancelSheet()">Cancelar assinatura</button>`
      : `<button class="btn line block" onclick="billing('portal')">Gerir assinatura e faturas</button>`) : ''}
  ${LOC.br && S.biz.planUntil && cur !== 'free' ? `<p class="small"><b>Plano pago até ${S.biz.planUntil.split('-').reverse().join('/')}</b></p>` : ''}
  ${LOC.br ? '<p class="small muted">💠 Pagamento mensal por <b>Pix</b>: recebes o QR code e o Pix copia e cola todos os meses. Sem cartão, sem fidelidade.</p>' : ''}
  ${!DB.cloud ? '<p class="small muted">Os pagamentos ficam ativos na versão online.</p>' : LOC.br ? '' : '<p class="small muted">Pagamento seguro com Stripe. Cancelas quando quiseres.</p>'}`);
}
async function billing(action, plan) {
  if (LOC.br && action === 'checkout') return pixSheet(plan);
  toast('A abrir pagamento…'); try { location.href = await DB.billing(action, plan); } catch (e) { toast(DB.friendly(e)); }
}
/* ---------- Brasil: assinatura por Pix (Asaas) ---------- */
const docDigits = v => String(v || '').replace(/\D/g, '');
function docValid(v) {
  const d = docDigits(v); if (!/^\d{11}$|^\d{14}$/.test(d) || /^(\d)\1+$/.test(d)) return false;
  const calc = (base, w) => { const s = base.split('').reduce((a, n, i) => a + +n * w[i], 0) % 11; return s < 2 ? 0 : 11 - s; };
  if (d.length === 11) { const w1 = [10, 9, 8, 7, 6, 5, 4, 3, 2], w2 = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]; return calc(d.slice(0, 9), w1) === +d[9] && calc(d.slice(0, 10), w2) === +d[10]; }
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2], w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]; return calc(d.slice(0, 12), w1) === +d[12] && calc(d.slice(0, 13), w2) === +d[13];
}
function pixSheet(plan) {
  const name = plan === 'team' ? 'Equipa' : 'Pro', price = LOC.c.plans[plan === 'team' ? 'team' : 'pro'];
  openSheet(`<h2>Assinar ${name} com Pix</h2>
  <p class="small muted" style="margin-top:-6px">${price}/mês. Todos os meses recebes um QR code Pix (e o copia e cola). Pagas em segundos no app do teu banco e o plano fica ativo na hora.</p>
  <label class="f"><span>CPF ou CNPJ (para a cobrança)</span><input class="inp" id="pxDoc" inputmode="numeric" placeholder="000.000.000-00" maxlength="18" autocomplete="off"></label>
  <div class="small muted" style="margin:-4px 0 12px">Usamos só para emitir a cobrança Pix, como exige o Banco Central.</div>
  <button class="btn block" id="pxGo">💠 Gerar Pix</button>`, sh => {
    sh.querySelector('#pxGo').onclick = async e => {
      const doc = sh.querySelector('#pxDoc').value; if (!docValid(doc)) return toast('CPF ou CNPJ inválido');
      const btn = e.currentTarget; btn.disabled = true; btn.textContent = 'A gerar Pix…';
      try { const r = await DB.billingPix('checkout', plan, docDigits(doc)); location.href = r.url; }
      catch (err) { toast(DB.friendly(err)); btn.disabled = false; btn.textContent = '💠 Gerar Pix'; }
    };
  });
}
async function pixAction(action) {
  toast('A abrir…');
  try { const r = await DB.billingPix(action); if (r.url) location.href = r.url; else { toast(r.message || 'Feito ✓'); await reload(); } }
  catch (e) { toast(DB.friendly(e)); }
}
function pixCancelSheet() {
  openSheet(`<h2>Cancelar assinatura?</h2><p class="muted">Deixas de receber cobranças Pix. O plano volta a Grátis no fim do período já pago.</p><button class="btn red block" onclick="closeSheet();pixAction('cancel')">Cancelar assinatura</button>`);
}
function resetSheet() {
  openSheet(`<h2>${DB.cloud ? 'Apagar negócio?' : 'Recomeçar?'}</h2><p class="muted">Isto apaga definitivamente todas as marcações, clientes e definições.</p><button class="btn red block" id="rX">Apagar tudo</button>`, sh => {
    sh.querySelector('#rX').onclick = async () => { try { await DB.destroy(S); S = null; phase = 'onb'; closeSheet(true); location.hash = ''; render(); } catch (e) { toast(DB.friendly(e)); } };
  });
}

/* ---------------- notificações ---------------- */
const notifyOn = () => { try { return localStorage.getItem('marcai_push') === '1' && 'Notification' in window && Notification.permission === 'granted'; } catch (e) { return false; } };
const b64key = k => { const p = '='.repeat((4 - k.length % 4) % 4), r = atob((k + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); };
const iOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent);
async function showLocal(title, body) {
  if (!notifyOn()) return;
  try { const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (reg) return reg.showNotification(title, { body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'marcai-' + Date.now() }); new Notification(title, { body, icon: 'icon-192.png' }); } catch (e) {}
}
function notifySheet() {
  const supported = 'Notification' in window, push = 'serviceWorker' in navigator && 'PushManager' in window;
  openSheet(`<h2>🔔 Notificações</h2>
  <p class="small muted" style="margin-top:-6px">Um aviso no telemóvel sempre que um cliente marca pela página de reservas ou pelo WhatsApp, e quando alguém desmarca. ${isOwner() ? 'Cada pessoa da equipa recebe só as marcações dela.' : 'Recebes só as marcações contigo.'}</p>
  <div class="card"><div class="small"><b>Exemplo:</b></div><div class="notifex"><b>📅 Nova marcação</b><span>João Silva · Corte · amanhã às 15:00 · Rita<br>Marcado pela página de reservas</span></div></div>
  ${!supported ? `<div class="card small" style="background:var(--gold-soft)">Este navegador não suporta notificações.${iOS() ? ' No iPhone: instala primeiro a app no ecrã inicial (Partilhar → Adicionar ao ecrã principal) e abre-a por lá.' : ''}</div>`
    : notifyOn() ? `<div class="pill" style="display:inline-block;margin-bottom:12px">✓ Ativas neste telemóvel</div><button class="btn line block" id="nTest">Enviar notificação de teste</button><button class="btn line block" style="margin-top:8px" id="nOff">Desativar</button>`
    : `<button class="btn block" id="nOn">Ativar notificações</button>${iOS() && !isStandalone() ? '<p class="small muted">No iPhone as notificações só funcionam com a app instalada no ecrã inicial.</p>' : ''}`}
  ${DB.cloud && push && !DB.vapid() ? '<p class="small muted">Falta configurar a chave VAPID no servidor (ver README) para os avisos chegarem com a app fechada.</p>' : ''}`, sh => {
    const on = sh.querySelector('#nOn'), off = sh.querySelector('#nOff'), test = sh.querySelector('#nTest');
    if (on) on.onclick = async () => {
      on.disabled = true; on.textContent = 'A ativar…';
      try {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') { toast('Permissão recusada. Ativa nas definições do navegador.'); on.disabled = false; on.textContent = 'Ativar notificações'; return; }
        if (DB.cloud && push && DB.vapid()) {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64key(DB.vapid()) });
          await DB.savePush(S, sub);
        }
        localStorage.setItem('marcai_push', '1'); toast('Notificações ativas 🔔'); notifySheet(); render();
        showLocal(LOC.t('🔔 Notificações ativas'), LOC.t('Vais receber aqui um aviso a cada nova marcação.'));
      } catch (e) { toast(DB.friendly(e)); on.disabled = false; on.textContent = 'Ativar notificações'; }
    };
    if (test) test.onclick = () => { const b = S.bookings.filter(x => x.status === 'confirmada' && x.date >= todayISO())[0]; showLocal(LOC.t('📅 Nova marcação'), LOC.t(b ? `${cli(b.clientId)?.name} · ${svc(b.serviceId)?.name} · ${relDay(b.date).toLowerCase()} às ${b.time}` : 'Exemplo de notificação')); toast('Enviada ✓'); };
    if (off) off.onclick = async () => {
      try { localStorage.removeItem('marcai_push'); const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); const sub = reg && await reg.pushManager.getSubscription(); if (sub) { if (DB.cloud) await DB.removePush(sub.endpoint); await sub.unsubscribe(); } } catch (e) {}
      toast('Notificações desativadas'); notifySheet(); render();
    };
  });
}
function notifyBooking(b, ev) {
  const c = cli(b.clientId), s = svc(b.serviceId), st = stf(b.staffId);
  if (!isOwner() && b.staffId !== S.me) return;
  const title = LOC.t(ev === 'cancelada' ? '❌ Marcação desmarcada' : '📅 Nova marcação');
  const body = LOC.t(`${c?.name || 'Cliente'} · ${s?.name || ''} · ${relDay(b.date).toLowerCase()} às ${b.time}${AT().length > 1 && st ? ' · ' + st.name : ''}`);
  toast(title + ' · ' + (c?.name || '')); showLocal(title, body);
}
function myOffSheet() {
  openSheet(`<h2>🏖️ As minhas folgas</h2><p class="small muted" style="margin-top:-6px">Nestes dias ninguém consegue marcar contigo (página de reservas, WhatsApp e IA).</p><div class="card"><div id="moOff">${offList(S.me)}</div>${offForm('mo')}</div>`, sh => bindOff(sh, 'mo', S.me, () => myOffSheet()));
}

/* ---------------- PÁGINA PÚBLICA ---------------- */
let P = { step: 0 };
function pubPage() {
  const steps = ['Serviço', 'Profissional', 'Dia e hora', 'Os teus dados'];
  const multi = staffFor(P.serviceId).length > 1;
  let body = '';
  if (P.done) {
    const d = P.done;
    body = `<div class="card" style="text-align:center"><div class="ok">✅</div><h2>Marcação confirmada!</h2><p class="muted">${esc(d.service)} · ${esc(fmtDay(d.date))} às ${d.time}${multi ? ' com ' + esc(d.staff) : ''}</p>
      ${isHome() ? `<p class="small">🏠 ${/^Equip/.test(staffWord()) ? 'A equipa vai' : 'O técnico vai'} a: ${esc(d.addr || 'tua casa')}</p>` : S.biz.address ? `<p class="small">📍 ${esc(S.biz.address)}</p>` : ''}<p class="small muted">Vais receber um lembrete no WhatsApp na véspera.${S.biz.phone ? ' Para desmarcar liga ' + esc(S.biz.phone) + '.' : ''}</p>
      <button class="btn line block" onclick="P={step:0};render()">Fazer outra marcação</button></div>`;
  } else if (!AS().length) {
    body = `<div class="card empty">Este negócio ainda não tem serviços disponíveis.</div>`;
  } else if (P.step === 0) {
    body = `<h3 style="margin:4px 0 10px">Escolhe o serviço</h3>${AS().filter(s => staffFor(s.id).length).map(s => { const m = staffFor(s.id).length > 1; return `<button class="opt ${P.serviceId === s.id ? 'on' : ''}" onclick="P.serviceId='${s.id}';P.date='';P.time='';P.step=${m ? 1 : 2};${m ? '' : `P.staffId='any';`}render()"><span class="dot" style="background:${s.color};width:12px;height:12px"></span><div class="m"><b>${esc(s.name)}</b><span class="small muted">${s.dur} min</span></div><span class="pr">${s.price > 0 ? eur(s.price) : 'Grátis'}</span></button>`; }).join('')}`;
  } else if (P.step === 1) {
    body = `<h3 style="margin:4px 0 10px">${isHome() ? (/^Equip/.test(staffWord()) ? 'Que equipa?' : 'Que técnico?') : 'Com quem?'}</h3><button class="opt" onclick="P.staffId='any';P.step=2;render()"><div class="av">✦</div><div class="m"><b>Sem preferência</b><span class="small muted">Primeiro horário livre</span></div></button>${staffFor(P.serviceId).map(s => `<button class="opt" onclick="P.staffId='${s.id}';P.date='';P.step=2;render()"><div class="av">${esc(initials(s.name))}</div><div class="m"><b>${esc(s.name)}</b></div></button>`).join('')}`;
  } else if (P.step === 2) {
    const t = todayISO(); if (!P.date) { for (let i = 0; i < 30; i++) { const d = addDays(t, i); if (slotsFor(d).length) { P.date = d; break; } } P.date = P.date || t; }
    const days = [...Array(30)].map((_, i) => addDays(t, i)); const sl = slotsFor(P.date);
    body = `<h3 style="margin:4px 0 10px">Quando?</h3><div class="days" style="margin:0 -18px 14px;padding:0 18px 4px">${days.map(d => { const dt = new Date(d + 'T12:00'); const n = slotsFor(d).length; return `<button class="day ${d === P.date ? 'on' : ''} ${n ? '' : 'off'}" ${n ? `onclick="P.date='${d}';P.time='';render()"` : 'disabled'}><small>${DOW[dt.getDay()]}</small><b>${dt.getDate()}</b></button>`; }).join('')}</div>
    ${sl.length ? `<div class="slots">${sl.map(x => `<button class="slot ${P.time === x ? 'on' : ''}" onclick="P.time='${x}';P.step=3;render()">${x}</button>`).join('')}</div>` : '<div class="card empty">Sem horários neste dia.</div>'}`;
  } else {
    const s = svc(P.serviceId);
    body = `<div class="card"><b>${esc(s?.name)}</b><div class="muted small">${esc(fmtDay(P.date))} às ${P.time} · ${s?.dur} min · ${eur(s?.price || 0)}</div></div>
    <form id="pForm"><label class="f"><span>Nome</span><input class="inp" id="pN" autocomplete="name" maxlength="60" required></label>
    <label class="f"><span>Telemóvel</span><input class="inp" id="pP" inputmode="tel" autocomplete="tel" placeholder="${LOC.c.phonePh}" required></label>
    ${isHome() ? `<label class="f"><span>Morada do serviço</span><input class="inp" id="pA" autocomplete="street-address" placeholder="Rua, nº, andar, código postal, cidade" required></label>
    <label class="f"><span>Notas (opcional)</span><input class="inp" id="pX" placeholder="ex.: tem animais, chave na portaria, m² aproximados"></label>` : ''}
    <label class="chk"><input type="checkbox" id="pC" required> <span>Aceito que a ${esc(S.biz.name)} use os meus dados para gerir esta marcação e me envie o lembrete por WhatsApp (<a href="../privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a>).</span></label>
    <label class="chk"><input type="checkbox" id="pM"> <span>Quero receber novidades e promoções da ${esc(S.biz.name)} por WhatsApp. Posso responder PARAR a qualquer momento.</span></label>
    <button class="btn block" id="pOk">Confirmar marcação</button></form>`;
  }
  const back = P.step > 0 && !P.done ? `P.step=${P.step === 2 && !multi ? 0 : P.step - 1};render()` : (phase === 'pub' ? '' : `go('mais')`);
  return `<div class="pub" style="--acc:${esc(S.biz.color || '#1E5B47')};--acc-soft:${esc((S.biz.color || '#1E5B47') + '1F')}">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;min-height:38px">${back ? `<button class="btn line sm" onclick="${back}">‹ ${P.step > 0 && !P.done ? 'Voltar' : 'Gestão'}</button>` : '<span></span>'}${phase !== 'pub' ? '<span class="small muted">Vista do cliente</span>' : ''}</div>
    <div class="pubhead" style="background:${esc(S.biz.color || '#1E5B47')}">${S.biz.logo ? `<div style="margin-bottom:10px">${bizLogo(64, true)}</div>` : `<div class="small" style="opacity:.8">${PR()[S.biz.type]?.emoji || ''} Reservas online</div>`}<h1>${esc(S.biz.name)}</h1><p>${S.biz.open}–${S.biz.close} · ${S.biz.days.map(d => DOW[d]).join(' ')}${S.biz.address ? '<br>📍 ' + esc(S.biz.address) : ''}${S.biz.instagram ? `<br><a href="https://www.instagram.com/${esc(S.biz.instagram)}/" target="_blank" rel="noopener" style="color:#fff">📸 @${esc(S.biz.instagram)}</a>` : ''}</p></div>
    ${P.done || !AS().length ? '' : `<div class="steps">${steps.map((_, i) => `<i class="${i <= P.step ? 'on' : ''}"></i>`).join('')}</div>`}
    ${body}
    <p class="small muted" style="text-align:center;margin-top:20px">Reservas com <b>Marcaí</b> · <a href="../privacidade.html" target="_blank" rel="noopener" style="color:inherit">Privacidade</a></p></div>`;
}
function slotsFor(d) { if (!P.serviceId) return []; if (P.staffId && P.staffId !== 'any') return freeSlots(d, P.serviceId, P.staffId); return Object.keys(freeAny(d, P.serviceId)).sort(); }
function bindPub() {
  const f = $('#pForm'); if (!f) return;
  f.onsubmit = async e => {
    e.preventDefault();
    const n = $('#pN').value.trim(), p = $('#pP').value.trim(), btn = $('#pOk');
    if (n.length < 2) return toast('Escreve o teu nome'); if (!LOC.phoneOk(p)) return toast('Telemóvel inválido');
    const addr = $('#pA') ? $('#pA').value.trim() : '', extra = $('#pX') ? $('#pX').value.trim() : '';
    if ($('#pA') && addr.length < 8) return toast('Escreve a morada completa');
    const notes = addr ? ('Morada: ' + addr + (extra ? ' · ' + extra : '')) : '';
    if (!$('#pC').checked) return toast('Tens de aceitar o tratamento dos dados para marcar');
    const marketing = $('#pM').checked;
    btn.disabled = true; btn.textContent = 'A confirmar…';
    try {
      if (DB.cloud && phase === 'pub') {
        const r = await DB.pubBook({ slug: PUBSLUG, serviceId: P.serviceId, staffId: P.staffId === 'any' ? null : P.staffId, date: P.date, time: P.time, name: n, phone: p, notes, marketing });
        S.bookings.push({ id: r.id, staffId: r.staffId, date: P.date, time: P.time, dur: svc(P.serviceId).dur, status: 'confirmada' });
        P = { step: 0, done: { service: r.service, date: P.date, time: r.time, staff: r.staff, addr } };
      } else {
        let staffId = P.staffId;
        if (!staffId || staffId === 'any') { const m = freeAny(P.date, P.serviceId)[P.time]; if (!m) throw new Error('Esse horário acabou de ser ocupado'); staffId = m[0]; }
        if (!freeSlots(P.date, P.serviceId, staffId).includes(P.time)) { P.step = 2; render(); throw new Error('Esse horário já não está livre'); }
        await addBooking({ serviceId: P.serviceId, staffId, date: P.date, time: P.time, clientName: n, phone: p, notes, marketing }, 'online');
        P = { step: 0, done: { service: svc(P.serviceId).name, date: P.date, time: P.time, staff: stf(staffId).name, addr } };
      }
      render(); window.scrollTo(0, 0);
    } catch (err) {
      toast(DB.friendly(err)); btn.disabled = false; btn.textContent = 'Confirmar marcação';
      if (DB.cloud && phase === 'pub') { try { S = await DB.pubLoad(PUBSLUG); P.step = 2; P.time = ''; render(); } catch (e2) {} }
    }
  };
}

/* ---------------- ASSISTENTE IA ---------------- */
let chat = [], aiBusy = false, sampleFn = null, sampleState = DB.cloud ? 'cloud' : 'loading', pendingAsk = null;
if (!DB.cloud) {
  (async () => { try { sampleFn = window.claude && window.claude.use ? await window.claude.use('sample') : null; } catch (e) { sampleFn = null; } sampleState = sampleFn ? 'ok' : 'off'; if (view === 'ia' && phase === 'app') render(); })();
  setTimeout(() => { if (sampleState === 'loading') { sampleState = 'off'; if (view === 'ia' && phase === 'app') render(); } }, 11000);
}
function askAI(q) { pendingAsk = q; go('ia'); }
function vIA() {
  const sug = ['Marca o João Silva amanhã às 15h para ' + (AS()[0]?.name || 'um serviço').toLowerCase(), 'Que horários tenho livres na sexta?', 'Como correu o negócio este mês?', 'Quem são os meus melhores clientes?', 'Escreve um post de Instagram a anunciar horários livres esta semana'];
  const locked = DB.cloud && !isPaid();
  return `<div class="top"><div><button class="lnk" style="padding:0 0 4px" onclick="go('agentes')">‹ Agentes</button><h1>Fala com o Gestor</h1></div>${chat.length ? `<button class="btn line sm" onclick="chat=[];render()">Nova conversa</button>` : ''}</div>
  ${chat.length ? '' : `<div class="aihero"><h2>✨ Pede como pedirias a um rececionista</h2><p>Marca, desmarca, encontra horários, analisa as contas e escreve mensagens por ti.</p></div>
  ${sampleState === 'off' ? `<div class="card small" style="background:var(--gold-soft);border-color:#F1DDB0">No modo demo, o assistente só funciona quando abres a app dentro do Claude. Na versão online funciona em qualquer lado.</div>` : ''}
  ${locked ? `<div class="card small" style="background:var(--gold-soft);border-color:#F1DDB0">O assistente IA faz parte do plano Pro. <button class="lnk" onclick="plansSheet()"><b>Ver planos</b></button> (se a tua instalação permitir IA no plano Grátis, funciona na mesma.)</div>` : ''}
  <div class="sugg">${sug.map(s => `<button onclick="sendAI(this.textContent)">${esc(s)}</button>`).join('')}</div>`}
  <div class="chat" id="chat">${chat.map(m => m.role === 'tool' ? `<div class="msg tool">⚙︎ ${esc(m.content)}</div>` : `<div class="msg ${m.role === 'user' ? 'u' : 'a'}">${esc(m.content)}</div>`).join('')}</div>
  <div style="height:90px"></div>
  <div class="composer"><div class="in"><textarea id="aiIn" rows="1" placeholder="Pede qualquer coisa…"></textarea><button id="aiSend" aria-label="Enviar">${I.send}</button></div></div>`;
}
function bindIA() {
  const ta = $('#aiIn');
  ta.oninput = () => { ta.style.height = 'auto'; ta.style.height = Math.min(110, ta.scrollHeight) + 'px'; };
  ta.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendAI(ta.value); } };
  $('#aiSend').onclick = () => sendAI(ta.value);
  if (chat.length) window.scrollTo(0, document.body.scrollHeight); else window.scrollTo(0, 0);
  if (pendingAsk) { const q = pendingAsk; pendingAsk = null; setTimeout(() => sendAI(q), 50); }
}
function matchService(q) { q = String(q || '').toLowerCase(); return AS().find(s => s.name.toLowerCase() === q) || AS().find(s => s.name.toLowerCase().includes(q) || q.includes(s.name.toLowerCase())); }
function matchStaff(q) { if (!q) return null; q = String(q).toLowerCase(); return AT().find(s => s.name.toLowerCase().includes(q)); }
// Ferramentas usadas no modo demo (no modo nuvem correm no servidor — ver supabase/functions/assistant)
const TOOLS = [
  { name: 'pesquisar_clientes', description: 'Procura clientes pelo nome ou telefone.', inputSchema: { type: 'object', properties: { texto: { type: 'string' } }, required: ['texto'] },
    execute: ({ texto }) => { const q = String(texto).toLowerCase(); return S.clients.filter(c => c.name.toLowerCase().includes(q) || String(c.phone).includes(q)).slice(0, 8).map(c => ({ id: c.id, nome: c.name, telefone: c.phone, ...clientStats(c.id) })); } },
  { name: 'horarios_livres', description: 'Lista horas livres num dia (YYYY-MM-DD) para um serviço. profissional é opcional.', inputSchema: { type: 'object', properties: { data: { type: 'string' }, servico: { type: 'string' }, profissional: { type: 'string' } }, required: ['data', 'servico'] },
    execute: ({ data, servico, profissional }) => { const s = matchService(servico); if (!s) throw new Error('Serviço não encontrado. Serviços: ' + AS().map(x => x.name).join(', ')); if (!dayOpen(data)) return { fechado: true }; const st = matchStaff(profissional); if (st) return { servico: s.name, profissional: st.name, horas: freeSlots(data, s.id, st.id) }; const m = freeAny(data, s.id); return { servico: s.name, horas: Object.keys(m).sort().map(h => ({ hora: h, profissionais: m[h].map(i => stf(i).name) })) }; } },
  { name: 'criar_marcacao', description: 'Cria uma marcação. Cria o cliente se não existir.', inputSchema: { type: 'object', properties: { cliente: { type: 'string' }, telefone: { type: 'string' }, servico: { type: 'string' }, data: { type: 'string' }, hora: { type: 'string', description: 'HH:MM' }, profissional: { type: 'string' }, notas: { type: 'string' } }, required: ['cliente', 'servico', 'data', 'hora'] },
    execute: async (a) => {
      const s = matchService(a.servico); if (!s) throw new Error('Serviço não encontrado. Serviços: ' + AS().map(x => x.name).join(', '));
      const h = toT(toMin(a.hora)); let st = matchStaff(a.profissional);
      if (!st) { const m = freeAny(a.data, s.id)[h]; if (!m) throw new Error('Hora ocupada ou fora do horário. Livres: ' + Object.keys(freeAny(a.data, s.id)).sort().slice(0, 10).join(', ')); st = stf(m[0]); }
      else if (!freeSlots(a.data, s.id, st.id).includes(h)) throw new Error('Hora não disponível para ' + st.name);
      const { b, c } = await addBooking({ serviceId: s.id, staffId: st.id, date: a.data, time: h, clientName: a.cliente, phone: a.telefone || '', notes: a.notas || '' }, 'ia');
      return { ok: true, id: b.id, cliente: c.name, servico: s.name, dia: fmtDay(a.data), hora: h, profissional: st.name, preco: s.price };
    } },
  { name: 'listar_marcacoes', description: 'Lista marcações entre duas datas (YYYY-MM-DD, inclusivo).', inputSchema: { type: 'object', properties: { de: { type: 'string' }, ate: { type: 'string' } }, required: ['de', 'ate'] },
    execute: ({ de, ate }) => S.bookings.filter(b => b.date >= de && b.date <= ate).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).slice(0, 60).map(b => ({ id: b.id, data: b.date, hora: b.time, cliente: cli(b.clientId)?.name, servico: svc(b.serviceId)?.name, profissional: stf(b.staffId)?.name, estado: b.status })) },
  { name: 'alterar_estado', description: 'Muda o estado de uma marcação: cancelada, concluida ou faltou.', inputSchema: { type: 'object', properties: { id: { type: 'string' }, estado: { type: 'string', enum: ['cancelada', 'concluida', 'faltou'] } }, required: ['id', 'estado'] },
    execute: async ({ id, estado }) => { const b = S.bookings.find(x => x.id === id); if (!b) throw new Error('Marcação não encontrada'); b.status = estado; await DB.save(S, 'bookings', b); return { ok: true }; } },
  { name: 'estatisticas', description: 'Estatísticas dos últimos N dias e comparação com o período anterior.', inputSchema: { type: 'object', properties: { dias: { type: 'number' } }, required: ['dias'] },
    execute: ({ dias }) => { const n = Math.min(365, Math.max(1, dias || 30)), t = todayISO(); const prev = S.bookings.filter(b => b.date > addDays(t, -2 * n) && b.date <= addDays(t, -n) && b.status === 'concluida'); return { ...periodStats(n), periodo_anterior: { receita: prev.reduce((a, b) => a + bPrice(b), 0), concluidas: prev.length }, ocupacao_proximos_7_dias: occupancy(t, 7) + '%' }; } },
  { name: 'clientes_em_risco', description: 'Clientes que não vêm há 35+ dias e não têm marcação futura.', inputSchema: { type: 'object', properties: {} },
    execute: () => atRisk().slice(0, 15).map(x => ({ nome: x.c.name, telefone: x.c.phone, ultima_visita: x.s.last, dias: daysBetween(x.s.last, todayISO()), visitas: x.s.visits })) },
  { name: 'melhores_clientes', description: 'Top clientes por total gasto.', inputSchema: { type: 'object', properties: {} },
    execute: () => S.clients.map(c => ({ nome: c.name, ...clientStats(c.id) })).sort((a, b) => b.spent - a.spent).slice(0, 8) }
];
const TOOL_LABEL = { pesquisar_clientes: 'a procurar cliente', horarios_livres: 'a ver horários', criar_marcacao: 'a criar marcação', listar_marcacoes: 'a consultar agenda', alterar_estado: 'a atualizar marcação', estatisticas: 'a calcular estatísticas', clientes_em_risco: 'a analisar clientes', melhores_clientes: 'a analisar clientes' };
function sysPrompt() {
  const t = todayISO();
  return `És o assistente de gestão da app Marcaí para o negócio "${S.biz.name}" (${PR()[S.biz.type]?.label}). Falas ${LOC.c.lang}, de forma curta, calorosa e prática. Sem markdown: texto simples, listas curtas com "•" quando ajuda.
Hoje é ${DOWL[dow(t)]}, ${t}. Horário: ${S.biz.open}-${S.biz.close}, dias abertos: ${S.biz.days.map(d => DOWL[d]).join(', ')}.
Serviços: ${AS().map(s => `${s.name} (${s.dur} min, ${eur(s.price)})`).join('; ')}. Equipa: ${AT().map(s => s.name).join(', ')}.${S.biz.instagram ? ' Instagram do negócio: @' + S.biz.instagram + ' (usa-o em posts e mensagens quando fizer sentido).' : ''}
${isHome() ? 'É um serviço ao domicílio: ao criar marcações, põe a morada do cliente nas notas. ' : ''}Usa SEMPRE as ferramentas para dados reais; nunca inventes marcações, números ou clientes. Converte datas relativas para YYYY-MM-DD a partir de hoje. Antes de marcar um cliente existente, procura-o. Se a hora estiver ocupada, propõe as alternativas mais próximas. Depois de criar, confirma numa linha. Para mensagens de WhatsApp ou posts, escreve o texto pronto a copiar.`;
}
async function sendAI(text) {
  text = String(text || '').trim(); if (!text || aiBusy) return;
  if (sampleState === 'off' || sampleState === 'loading') {
    chat.push({ role: 'user', content: text }, { role: 'assistant', content: sampleState === 'loading' ? 'Ainda estou a ligar-me… tenta de novo daqui a um segundo.' : 'No modo demo o assistente só funciona dentro do Claude. A agenda, os clientes e as reservas funcionam normalmente.' }); render(); return;
  }
  aiBusy = true; chat.push({ role: 'user', content: text }); const a = { role: 'assistant', content: 'A pensar…' }; chat.push(a); render();
  const msgs = chat.filter(m => m.role !== 'tool' && m !== a).map(m => ({ role: m.role, content: m.content }));
  try {
    if (sampleState === 'cloud') {
      const r = await DB.assistant(msgs);
      (r.tools || []).forEach(n => chat.splice(chat.indexOf(a), 0, { role: 'tool', content: TOOL_LABEL[n] || n }));
      a.content = r.text || '…';
      if (r.changed) { try { S = await DB.load(); } catch (e) {} }
    } else {
      msgs[0] = { role: 'user', content: sysPrompt() + '\n\n---\nPedido do utilizador:\n' + msgs[0].content };
      const tools = TOOLS.map(t => ({ ...t, execute: async inp => { chat.splice(chat.indexOf(a), 0, { role: 'tool', content: TOOL_LABEL[t.name] }); if (view === 'ia') render(); return t.execute(inp || {}); } }));
      const r = await sampleFn(msgs, { tools, cache: false, onText: ({ text }) => { a.content = text; const bs = document.querySelectorAll('#chat .msg.a'); const el = bs[bs.length - 1]; if (el && view === 'ia') { el.textContent = text; window.scrollTo(0, document.body.scrollHeight); } } });
      a.content = r.text || a.content;
    }
  } catch (e) {
    if (e?.code === 'not_granted') a.content = 'Sem autorização para usar a IA. Podes ativá-la quando o Claude pedir.';
    else if (e?.code === 'rate_limited') a.content = 'Muitos pedidos seguidos — espera um pouco e tenta de novo.';
    else a.content = (e?.text ? e.text + '\n\n' : '') + DB.friendly(e);
  }
  aiBusy = false; if (view === 'ia') render();
}

/* ---------------- arranque ---------------- */
function startLive() {
  if (!S || !DB.cloud) return;
  DB.live(async p => {
    const r = p.new || {};
    if (p.eventType === 'INSERT' && (r.source === 'online' || r.source === 'ia')) { await reload(); const b = S.bookings.find(x => x.id === r.id); if (b) notifyBooking(b, 'nova'); return; }
    clearTimeout(window._lv); window._lv = setTimeout(reload, 800);
  });
}
async function loadApp() {
  phase = 'loading'; render();
  try { S = await DB.load(); if (S) ensureShape(); EMAIL = await DB.email(); }
  catch (e) { ERR = e; phase = 'error'; render(); return; }
  phase = S ? 'app' : 'onb';
  if (S && S.role === 'staff' && S.me) agendaStaff = S.me;
  render();
  startLive();
  if (S && new URLSearchParams(location.search).get('pago')) { history.replaceState(null, '', location.pathname + location.hash); toast('Pagamento recebido 🎉 O plano fica ativo em segundos.'); setTimeout(reload, 4000); }
}
async function boot() {
  PUBSLUG = pubSlugFromUrl();
  if (PUBSLUG && DB.cloud) {
    try { S = await DB.pubLoad(PUBSLUG); } catch (e) { ERR = e; phase = 'error'; render(); return; }
    phase = S ? 'pub' : 'notfound'; render(); return;
  }
  if (DB.cloud) {
    let session = await DB.session();
    DB.onAuth((ev, s) => {
      if (ev === 'PASSWORD_RECOVERY') { setTimeout(newPwSheet, 300); }
      if (ev === 'SIGNED_IN' && !session) { session = s; loadApp(); }
      if (ev === 'SIGNED_OUT') { session = null; S = null; phase = 'auth'; render(); }
    });
    if (!session) { phase = 'auth'; render(); return; }
  }
  await loadApp();
}
