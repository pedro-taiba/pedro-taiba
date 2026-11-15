/* =========================================================
   Marcaí — Portugal 🇵🇹 e Brasil 🇧🇷
   País do negócio → língua, moeda, telefone, preços e textos.
   A interface está escrita em português de Portugal; no Brasil
   um tradutor converte o texto do ecrã para português do Brasil.
   ========================================================= */
(function () {
  const PAIS = {
    PT: { code: 'PT', flag: '🇵🇹', name: 'Portugal', locale: 'pt-PT', currency: 'EUR', tz: 'Europe/Lisbon', dial: '351', phoneLen: [9], phonePh: '912 345 678', city: 'Lisboa',
      plans: { free: '0 €', pro: '29 €', team: '49 €' }, lang: 'português de Portugal' },
    BR: { code: 'BR', flag: '🇧🇷', name: 'Brasil', locale: 'pt-BR', currency: 'BRL', tz: 'America/Sao_Paulo', dial: '55', phoneLen: [10, 11], phonePh: '(11) 91234-5678', city: 'São Paulo',
      plans: { free: 'R$ 0', pro: 'R$ 49', team: 'R$ 89' }, lang: 'português do Brasil' }
  };

  function detect() {
    if (window.MARCAI_PAIS && PAIS[window.MARCAI_PAIS]) return window.MARCAI_PAIS; // páginas fixas (ex.: /br/)
    try {
      const q = new URLSearchParams(location.search).get('pais');
      if (q && PAIS[q.toUpperCase()]) { localStorage.setItem('marcai_pais', q.toUpperCase()); return q.toUpperCase(); }
      const s = localStorage.getItem('marcai_pais'); if (s && PAIS[s]) return s;
    } catch (e) {}
    if (/(^|\/)br(\/|$)/i.test(location.pathname)) return 'BR';
    const l = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    return /^pt-BR/i.test(l) ? 'BR' : 'PT';
  }
  let chosen = detect();

  /* ---------- tradução PT → BR ---------- */
  // 1) frases inteiras (protegidas: as regras de palavras não lhes tocam depois)
  const PHRASES = [
    ['Cria a tua conta grátis.', 'Crie sua conta grátis.'],
    ['Em 2 minutos tens agenda', 'Em 2 minutos você tem agenda'],
    ['Enviamos-te um link para criares uma nova palavra-passe.', 'Enviamos um link para você criar uma nova senha.'],
    ['Entra para gerir as tuas marcações.', 'Entre para gerenciar seus agendamentos.'],
    ['Ao criar conta aceitas os', 'Ao criar a conta você aceita os'],
    ['Esqueci-me da palavra-passe', 'Esqueci minha senha'],
    ['Abre o email que te enviámos para confirmar e depois entra.', 'Abra o email que enviamos para confirmar e depois entre.'],
    ['a trabalhar por ti', 'trabalhando por você'],
    ['Também podes enviá-los já à mão.', 'Você também pode enviá-los manualmente agora.'],
    ['sem te ligarem', 'sem precisar ligar'],
    ['Cancelas quando quiseres.', 'Cancele quando quiser.'],
    ['Para desmarcar liga', 'Para desmarcar, ligue para'],
    ['escreve mensagens por ti', 'escreve mensagens por você'],
    ['Assim te veem os teus clientes', 'É assim que seus clientes veem você'],
    ['Sugere, tu aprovas', 'Sugere, você aprova'],
    ['tu aprovas cada envio', 'você aprova cada envio'],
    ['Entretanto podes', 'Enquanto isso, você pode'],
    ['podes registá-lo', 'pode registrá-lo'],
    ['que não te vemos', 'que não vemos você'],
    ['Queres que te guarde um horário', 'Quer que eu reserve um horário'],
    ['Quando quiseres marcar, é só escreveres-nos.', 'Quando quiser agendar, é só mandar mensagem.'],
    ['Diz-me quem são', 'Diga quem são'],
    ['Segue-nos no Instagram', 'Siga a gente no Instagram'],
    ['Algo correu mal', 'Algo deu errado'],
    ['Copias e publicas em segundos', 'Você copia e publica em segundos'],
    ['Marcar todas como concluídas', 'Marcar todas como concluídas'],
    ['marca como concluídas', 'marque como concluídas'],
    ['Marcada como concluída', 'Marcada como concluída'],
    ['Marca do negócio', 'Marca do negócio'],
    ['Marca já', 'Agende já'], ['marca até às', 'agende até as'], ['até às', 'até as'],
    ['Toca num espaço vazio para marcar.', 'Toque em um espaço vazio para agendar.'], ['Toca em cada um', 'Toque em cada um'], ['Toca de novo', 'Toque de novo'],
    ['cancela-as primeiro', 'cancele primeiro'], ['cancela-a primeiro', 'cancele primeiro'],
    ['Ao domicílio', 'Em domicílio'], ['ao domicílio', 'em domicílio'], ['Pagas em segundos', 'Você paga em segundos'],
    ['Tu só trabalhas', 'Você só trabalha'], ['Envio-te', 'Te envio'], ['Guardo-te um horário?', 'Reservo um horário pra você?'],
    ['Ligas os que quiser e escolhes', 'Você liga os que quiser e escolhe'], ['Ligas os que quiseres e escolhes', 'Você liga os que quiser e escolhe'], ['se te pedem aprovação', 'se pedem sua aprovação'],
    ['e tu aprovas', 'e você aprova'], ['tu vês tudo', 'você vê tudo'], ['Só tu usas', 'Só você usa'], ['Ajudamos-te a fazer a ligação', 'Ajudamos você a fazer a conexão'], ['Ajudamos-te', 'Ajudamos você'],
    ['Falar connosco', 'Falar com a gente'], ['Há fidelização?', 'Tem fidelidade?'], ['Sem fidelização.', 'Sem fidelidade. Pagamento mensal por Pix.'], ['Sem fidelização', 'Sem fidelidade'], ['Pagas mês a mês e cancelas quando quiseres', 'Você paga mês a mês e cancela quando quiser'], ['Pagas mês a mês', 'Você paga mês a mês'], ['e cancelas', 'e cancela'], ['mostramos-te', 'mostramos'],
    ['falar contigo', 'falar com você'], ['Deixa o teu contacto', 'Deixe seu contato'], ['Deixa o seu contacto', 'Deixe seu contato'], ['Marca pelo link', 'Agende pelo link'], ['enche-se sozinha', 'se enche sozinha'],
    ['marca noutro lado', 'agenda em outro lugar'], ['à espera de resposta', 'esperando resposta'], ['responde e marca sozinho', 'responde e agenda sozinho'], ['responde e marca sozinha', 'responde e agenda sozinha'],
    ['responde e marca', 'responde e agenda'], ['e marca, remarca ou desmarca', 'e agenda, reagenda ou desmarca'], ['e marca sozinho', 'e agenda sozinho'], ['noutro', 'em outro'], ['noutra', 'em outra'],
    ['Toca numa', 'Toque em uma'], ['Marca os dias', 'Marque os dias'], ['para ti', 'para você'], ['contigo', 'com você'], ['Põe o email', 'Coloque o email'], ['estás de folga', 'está de folga'],
    ['Pôr telefone', 'Adicionar telefone'],
    ['Põe o teu logótipo e a tua cor', 'Coloque seu logotipo e sua cor'],
    ['Terminar sessão', 'Sair da conta'],
    ['Instalar a app no telemóvel', 'Instalar o app no celular'],
    ['Preço (€)', 'Preço (R$)'],
    ['Pagamento seguro com Stripe.', 'Pagamento por Pix, seguro e na hora.'],
    // morada (f.) → endereço (m.)
    ['Escreve a morada completa', 'Digite o endereço completo'], ['Escreve a morada do serviço', 'Digite o endereço do serviço'],
    ['a morada completa', 'o endereço completo'], ['a morada do serviço', 'o endereço do serviço'], ['A morada', 'O endereço'], ['a morada', 'o endereço'],
    ['Morada do serviço', 'Endereço do serviço'],
    // marcação (f.) → agendamento (m.)
    ['Nova marcação', 'Novo agendamento'], ['Editar marcação', 'Editar agendamento'], ['Marcação confirmada!', 'Agendamento confirmado!'],
    ['Marcação atualizada', 'Agendamento atualizado'], ['Marcada na app', 'Agendado no app'],
    ['uma marcação', 'um agendamento'], ['esta marcação', 'este agendamento'], ['Esta marcação', 'Este agendamento'], ['essa marcação', 'esse agendamento'],
    ['da marcação', 'do agendamento'], ['da tua marcação', 'do seu agendamento'], ['na marcação', 'no agendamento'], ['A marcação', 'O agendamento'], ['a marcação', 'o agendamento'],
    ['as marcações', 'os agendamentos'], ['As marcações', 'Os agendamentos'], ['das marcações', 'dos agendamentos'], ['nas marcações', 'nos agendamentos'],
    ['tuas marcações', 'seus agendamentos'], ['suas marcações', 'seus agendamentos'], ['novas marcações', 'novos agendamentos'], ['Novas marcações', 'Novos agendamentos'],
    ['fica marcado', 'fica agendado'], ['Marcado para', 'Agendado para'],
    ['Esse horário já está ocupado para esse profissional.', 'Esse horário já está ocupado para esse profissional.'],
    ['Email ou palavra-passe errados.', 'Email ou senha incorretos.'],
    ['Sem ligação à internet.', 'Sem conexão com a internet.'],
    ['Confirma primeiro o teu email (vê a caixa de entrada).', 'Confirme seu email primeiro (veja a caixa de entrada).'],
    ['Esse email já tem conta. Entra em vez de criar.', 'Esse email já tem conta. Entre em vez de criar.'],
    ['ecrã inicial', 'tela inicial'], ['no ecrã', 'na tela'], ['o ecrã', 'a tela'],
    ['a app', 'o app'], ['A app', 'O app'], ['da app', 'do app'], ['na app', 'no app'], ['à app', 'ao app'],
    ['a equipa', 'a equipe'], ['Equipa de agentes', 'Equipe de agentes'], ['Até já!', 'Até logo!'], ['à mão', 'manualmente']
  ];
  // 2) palavras soltas
  const WORDS = {
    'marcações': 'agendamentos', 'Marcações': 'Agendamentos', 'marcação': 'agendamento', 'Marcação': 'Agendamento',
    'marcar': 'agendar', 'Marcar': 'Agendar', 'marcado': 'agendado', 'Marcado': 'Agendado', 'marcada': 'agendada', 'marcadas': 'agendadas',
    'remarcar': 'reagendar', 'Remarca': 'Reagenda',
    'telemóvel': 'celular', 'Telemóvel': 'Celular', 'telemóveis': 'celulares', 'ecrã': 'tela',
    'equipa': 'equipe', 'Equipa': 'Equipe', 'equipas': 'equipes',
    'palavra-passe': 'senha', 'Palavra-passe': 'Senha', 'logótipo': 'logotipo', 'Logótipo': 'Logotipo',
    'faturação': 'cobrança', 'Faturação': 'Cobrança', 'gerir': 'gerenciar', 'Gerir': 'Gerenciar',
    'utilizador': 'usuário', 'registadas': 'registradas', 'registada': 'registrada', 'registados': 'registrados', 'registado': 'registrado', 'registar': 'registrar',
    'partilhar': 'compartilhar', 'Partilhar': 'Compartilhar', 'Partilha': 'Compartilhe', 'partilha': 'compartilhe',
    'contacto': 'contato', 'contactos': 'contatos', 'ficheiro': 'arquivo', 'Definições': 'Configurações', 'definições': 'configurações',
    'Guardar': 'Salvar', 'guardar': 'salvar', 'Guardado': 'Salvo', 'guardado': 'salvo', 'guardados': 'salvos',
    'Apagar': 'Excluir', 'apagar': 'excluir', 'Apaga': 'Exclui', 'apaga': 'exclui', 'apagado': 'excluído',
    'Morada': 'Endereço', 'morada': 'endereço', 'moradas': 'endereços', 'Rececionista': 'Recepcionista', 'rececionista': 'recepcionista',
    'Canalizador': 'Encanador', 'canalizador': 'encanador', 'canalizadores': 'encanadores', 'Canalizadores': 'Encanadores', 'Cabeleireiro': 'Salão', 'autoclismo': 'descarga',
    'tua': 'sua', 'teu': 'seu', 'tuas': 'suas', 'teus': 'seus', 'Tua': 'Sua', 'Teu': 'Seu',
    'tens': 'tem', 'Tens': 'Tem', 'podes': 'pode', 'Podes': 'Pode', 'queres': 'quer', 'Queres': 'Quer', 'vais': 'vai', 'Vais': 'Vai',
    'quiseres': 'quiser', 'estás': 'está', 'Estás': 'Está', 'aceitas': 'aceita', 'Cancelas': 'Cancela', 'consegues': 'consegue', 'precisas': 'precisa',
    'sabes': 'sabe', 'ficas': 'fica', 'recebes': 'recebe', 'Ficaste': 'Você ficou', 'escreveres': 'escrever', 'criares': 'criar',
    'Põe': 'Coloque', 'põe': 'coloque', 'Pôr': 'Colocar', 'pôr': 'colocar', 'Experimenta': 'Experimente', 'experimenta': 'experimente',
    'Enviámos': 'Enviamos', 'enviámos': 'enviamos', 'Esqueci-me': 'Esqueci', 'Diz-me': 'Me diga', 'Liga-se': 'Conecta-se', 'liga-se': 'conecta-se',
    'Foca-se': 'Foca', 'liberta': 'libera', 'Liberta': 'Libera', 'libertado': 'liberado', 'Olá': 'Oi'
  };
  const GER = { ver: 'vendo', procurar: 'procurando', criar: 'criando', consultar: 'consultando', atualizar: 'atualizando', calcular: 'calculando', analisar: 'analisando',
    preparar: 'preparando', confirmar: 'confirmando', pensar: 'pensando', abrir: 'abrindo', enviar: 'enviando', gerar: 'gerando', ligar: 'conectando', carregar: 'carregando',
    guardar: 'salvando', publicar: 'publicando', trabalhar: 'trabalhando', escrever: 'escrevendo', processar: 'processando' };
  const L = '\\p{L}';
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const phraseRx = new RegExp(`(?<![${L}])(?:${PHRASES.map(p => p[0]).sort((a, b) => b.length - a.length).map(esc).join('|')})(?![${L}])`, 'gu');
  const phraseMap = Object.fromEntries(PHRASES);
  const wordRx = new RegExp(`(?<![${L}-])(${Object.keys(WORDS).sort((a, b) => b.length - a.length).map(esc).join('|')})(?![${L}-])`, 'gu');
  const gerRx = new RegExp(`(?<![${L}])([Aa]) (${Object.keys(GER).join('|')})(?![${L}])`, 'gu');
  const fixRx = /([Aa]gendamentos?) (futur|feit|confirmad|concluíd|cancelad|registrad|nov|próxim|marcad|agendad|ilimitad)(as|a)(?![\p{L}])/gu;
  const memo = new Map();

  function toBR(s) {
    if (!s || !/[\p{L}€]/u.test(s)) return s;
    const hit = memo.get(s); if (hit !== undefined) return hit;
    const keep = [];
    let o = s.replace(phraseRx, m => { keep.push(phraseMap[m]); return '\u0001' + (keep.length - 1) + '\u0002'; });
    o = o.replace(gerRx, (m, a, v) => (a === 'A' ? GER[v][0].toUpperCase() + GER[v].slice(1) : GER[v]));
    o = o.replace(wordRx, m => WORDS[m]);
    o = o.replace(/\u0001(\d+)\u0002/g, (m, i) => keep[+i]);
    o = o.replace(fixRx, (m, n, r, e) => n + ' ' + r + (e === 'as' ? 'os' : 'o'));
    if (memo.size > 5000) memo.clear();
    memo.set(s, o);
    return o;
  }

  /* ---------- API ---------- */
  const LOC = {
    PAIS,
    get code() { const b = LOC.biz && LOC.biz(); return (b && PAIS[b.country] && b.country) || chosen; },
    get c() { return PAIS[LOC.code]; },
    get br() { return LOC.code === 'BR'; },
    choose(code) { if (!PAIS[code]) return; chosen = code; try { localStorage.setItem('marcai_pais', code); } catch (e) {} LOC.apply(); },
    money(n) {
      const c = PAIS[LOC.code], v = Math.round((n || 0) * 100) / 100;
      return v.toLocaleString(c.locale, { style: 'currency', currency: c.currency, maximumFractionDigits: v % 1 ? 2 : 0, minimumFractionDigits: v % 1 ? 2 : 0 });
    },
    sym() { return LOC.br ? 'R$' : '€'; },
    phoneDigits(p) {
      let d = String(p || '').replace(/\D/g, '');
      if (LOC.br) { d = d.replace(/^0+/, ''); if (d.length === 10 || d.length === 11) d = '55' + d; }
      else if (d.length === 9) d = '351' + d;
      return d;
    },
    phoneOk(p) { const d = String(p || '').replace(/\D/g, ''); return LOC.br ? d.length >= 10 : d.length >= 9; },
    t(s) { return LOC.br ? toBR(String(s ?? '')) : s; },
    toBR,
    // traduz o ecrã automaticamente (só no Brasil)
    apply() {
      document.documentElement.lang = PAIS[LOC.code].locale;
      if (LOC.br) { LOC.walk(document.body); if (document.title) document.title = toBR(document.title); }
    },
    walk(root) {
      if (!LOC.br || !root) return;
      if (root.nodeType === 3) { fixText(root); return; }
      if (root.nodeType !== 1) return;
      if (skip(root)) return;
      fixAttrs(root);
      const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode: n => (n.nodeType === 1 && skip(n)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
      let n; while ((n = w.nextNode())) { if (n.nodeType === 3) fixText(n); else fixAttrs(n); }
    }
  };
  function skip(el) {
    const t = el.tagName;
    if (t === 'TEXTAREA' || t === 'SCRIPT' || t === 'STYLE') return true;
    if (t === 'INPUT') { fixAttrs(el); return true; }
    return !!(el.hasAttribute && el.hasAttribute('data-notr'));
  }
  function fixText(n) { if (n.parentNode && n.parentNode.closest && n.parentNode.closest('textarea,[data-notr],script,style')) return; const v = n.nodeValue, t = toBR(v); if (t !== v) n.nodeValue = t; }
  function fixAttrs(el) { for (const a of ['placeholder', 'title', 'aria-label']) { const v = el.getAttribute && el.getAttribute(a); if (v) { const t = toBR(v); if (t !== v) el.setAttribute(a, t); } } }

  let obs = null;
  function startObserver() {
    if (obs || !window.MutationObserver) return;
    obs = new MutationObserver(list => {
      if (!LOC.br) return;
      for (const m of list) {
        if (m.type === 'characterData') fixText(m.target);
        else if (m.type === 'attributes') fixAttrs(m.target);
        else m.addedNodes.forEach(n => LOC.walk(n));
      }
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] });
  }
  if (document.body) startObserver(); else document.addEventListener('DOMContentLoaded', startObserver);
  window.LOC = LOC;
})();
