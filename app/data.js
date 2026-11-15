/* =========================================================
   Camada de dados da Marcaí
   - Modo DEMO: guarda tudo no dispositivo (localStorage)
   - Modo NUVEM: Supabase (login, base de dados, funções)
   ========================================================= */
(function () {
  const CFG = window.VEZ_CONFIG || {};
  const CLOUD = !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY && window.supabase && window.supabase.createClient);
  const sb = CLOUD ? window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY) : null;
  const LS = 'vez_app_v1';
  const T5 = t => (t ? String(t).slice(0, 5) : t);

  const MAP = {
    services: {
      to: (r, b) => ({ id: r.id, business_id: b, name: r.name, dur: r.dur, price: r.price, color: r.color, active: r.active !== false, position: r.position || 0 }),
      from: r => ({ id: r.id, name: r.name, dur: r.dur, price: +r.price, color: r.color, active: r.active, position: r.position })
    },
    staff: {
      to: (r, b) => ({ id: r.id, business_id: b, name: r.name, active: r.active !== false, hours: r.hours || null, services: r.services || [], invite_email: r.inviteEmail || null }),
      from: r => ({ id: r.id, name: r.name, active: r.active, hours: r.hours || null, services: r.services || [], inviteEmail: r.invite_email || '', linked: !!r.user_id, userId: r.user_id || null })
    },
    time_off: {
      to: (r, b) => ({ id: r.id, business_id: b, staff_id: r.staffId || null, date_from: r.from, date_to: r.to, note: r.note || '' }),
      from: r => ({ id: r.id, staffId: r.staff_id, from: r.date_from, to: r.date_to, note: r.note || '' })
    },
    clients: {
      to: (r, b) => ({ id: r.id, business_id: b, name: r.name, phone: r.phone || '', notes: r.notes || '', marketing_ok: !!r.marketingOk, consent_at: r.consentAt || null, opted_out: !!r.optedOut }),
      from: r => ({ id: r.id, name: r.name, phone: r.phone || '', notes: r.notes || '', created: String(r.created_at).slice(0, 10), marketingOk: !!r.marketing_ok, consentAt: r.consent_at, optedOut: !!r.opted_out })
    },
    bookings: {
      to: (r, b) => ({ id: r.id, business_id: b, client_id: r.clientId, service_id: r.serviceId, staff_id: r.staffId, date: r.date, time: r.time, dur: r.dur, price: r.price, status: r.status, source: r.source, notes: r.notes || '', is_demo: !!r.isDemo }),
      from: r => ({ id: r.id, clientId: r.client_id, serviceId: r.service_id, staffId: r.staff_id, date: r.date, time: T5(r.time), dur: r.dur, price: +r.price, status: r.status, source: r.source, notes: r.notes || '' })
    }
  };
  const bizFrom = r => ({ id: r.id, owner: r.owner, slug: r.slug, name: r.name, type: r.type, phone: r.phone || '', address: r.address || '', open: T5(r.opens), close: T5(r.closes), days: r.days, slot: r.slot, remind: r.remind, plan: r.plan, timezone: r.timezone, logo: r.logo_url || '', color: r.brand_color || '#1E5B47', review: r.google_review_url || '', wa: !!r.wa_phone_id, waPhone: r.wa_display_phone || '', instagram: r.instagram || '', igInMsgs: r.ig_in_msgs !== false, country: r.country || 'PT', billingBR: !!r.asaas_subscription, planUntil: r.plan_until || null });
  const bizTo = b => ({ name: b.name, type: b.type, phone: b.phone, address: b.address, opens: b.open, closes: b.close, days: b.days, slot: b.slot, remind: b.remind, logo_url: b.logo || null, brand_color: b.color || '#1E5B47', google_review_url: b.review || '', instagram: b.instagram || '', ig_in_msgs: b.igInMsgs !== false, country: b.country === 'BR' ? 'BR' : 'PT' });
  const taskFrom = r => ({ id: r.id, kind: r.kind, type: r.type, status: r.status, title: r.title, body: r.body, phone: r.phone || '', clientId: r.client_id, bookingId: r.booking_id, payload: r.payload || {}, created: r.created_at });
  const waitFrom = r => ({ id: r.id, clientId: r.client_id, serviceId: r.service_id, from: r.date_from, to: r.date_to, notes: r.notes || '', notified: r.notified_at });
  async function invoke(name, body) {
    const { data, error } = await sb.functions.invoke(name, { body });
    if (error) {
      let msg = error.message;
      try { const j = await error.context.json(); if (j && j.error) msg = j.error; } catch (e) {}
      throw new Error(msg);
    }
    return data;
  }

  async function all(build) { // contorna o limite de 1000 linhas por pedido
    const out = []; const step = 1000;
    for (let i = 0; ; i += step) {
      const { data, error } = await build().range(i, i + step - 1);
      if (error) throw error;
      out.push(...data);
      if (data.length < step) break;
    }
    return out;
  }
  async function insertChunks(table, rows) {
    for (let i = 0; i < rows.length; i += 400) {
      const { error } = await sb.from(table).insert(rows.slice(i, i + 400));
      if (error) throw error;
    }
  }
  function slugify(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 36) || 'negocio';
  }
  function friendly(e) {
    const m = (e && (e.message || e.error_description || e.error)) || String(e);
    if (e && e.code === '23P01' || /no_double_booking|exclusion/.test(m)) return 'Esse horário já está ocupado para esse profissional.';
    if (/Invalid login credentials/i.test(m)) return 'Email ou palavra-passe errados.';
    if (/Email not confirmed/i.test(m)) return 'Confirma primeiro o teu email (vê a caixa de entrada).';
    if (/User already registered/i.test(m)) return 'Esse email já tem conta. Entra em vez de criar.';
    if (/Password should be/i.test(m)) return 'A palavra-passe tem de ter pelo menos 6 caracteres.';
    if (/Failed to fetch|NetworkError/i.test(m)) return 'Sem ligação à internet.';
    return m;
  }

  const DB = {
    cloud: CLOUD,
    friendly,
    // ---------- autenticação ----------
    async session() { if (!CLOUD) return null; const { data } = await sb.auth.getSession(); return data.session; },
    onAuth(cb) { if (CLOUD) sb.auth.onAuthStateChange((e, s) => cb(e, s)); },
    async signIn(email, pw) { const { error } = await sb.auth.signInWithPassword({ email, password: pw }); if (error) throw error; },
    async signUp(email, pw) { const { data, error } = await sb.auth.signUp({ email, password: pw, options: { emailRedirectTo: location.origin + location.pathname } }); if (error) throw error; return data; },
    async resetPw(email) { const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }); if (error) throw error; },
    async setPw(pw) { const { error } = await sb.auth.updateUser({ password: pw }); if (error) throw error; },
    async signOut() { if (CLOUD) await sb.auth.signOut(); },
    async email() { if (!CLOUD) return ''; const { data } = await sb.auth.getUser(); return data.user ? data.user.email : ''; },

    // ---------- carregar ----------
    async load() {
      if (!CLOUD) { try { return JSON.parse(localStorage.getItem(LS)); } catch (e) { return null; } }
      const { data: u } = await sb.auth.getUser(); const uid = u.user && u.user.id;
      let { data: b, error } = await sb.from('businesses').select('*').maybeSingle();
      if (error) throw error;
      if (!b) { // membro da equipa convidado pelo email? liga a conta à ficha
        const { data: claimed } = await sb.rpc('claim_staff');
        if (claimed) ({ data: b } = await sb.from('businesses').select('*').maybeSingle());
      }
      if (!b) return null;
      const owner = b.owner === uid;
      const from = new Date(Date.now() - 400 * 864e5).toISOString().slice(0, 10);
      const [sv, st, cl, bk] = await Promise.all([
        all(() => sb.from('services').select('*').order('position').order('created_at')),
        all(() => sb.from('staff').select('*').order('created_at')),
        all(() => sb.from('clients').select('*').order('created_at')),
        all(() => sb.from('bookings').select('id,client_id,service_id,staff_id,date,time,dur,price,status,source,notes').gte('date', from).order('date'))
      ]);
      const since = new Date(Date.now() - 60 * 864e5).toISOString();
      const [ag, tk, wl, off] = await Promise.all([
        sb.from('agents').select('*'),
        owner ? sb.from('agent_tasks').select('*').gte('created_at', since).order('created_at', { ascending: false }).limit(400) : { data: [] },
        sb.from('waitlist').select('*').order('created_at'),
        sb.from('time_off').select('*').gte('date_to', new Date(Date.now() - 2 * 864e5).toISOString().slice(0, 10)).order('date_from')
      ]);
      const agents = {}; (ag.data || []).forEach(a => agents[a.kind] = { enabled: a.enabled, mode: a.mode, settings: a.settings || {}, lastRun: a.last_run_at });
      const staff = st.map(MAP.staff.from);
      return { biz: bizFrom(b), services: sv.map(MAP.services.from), staff, clients: cl.map(MAP.clients.from), bookings: bk.map(MAP.bookings.from),
        agents, tasks: (tk.data || []).map(taskFrom), waitlist: (wl.data || []).map(waitFrom), timeOff: (off.data || []).map(MAP.time_off.from),
        role: owner ? 'owner' : 'staff', me: (staff.find(x => x.userId === uid) || {}).id || null };
    },

    // ---------- criar negócio ----------
    async createBusiness(S) {
      if (!CLOUD) { DB.saveLocal(S); return S; }
      const { data: u } = await sb.auth.getUser();
      let row = null, lastErr = null;
      for (let i = 0; i < 4 && !row; i++) {
        const slug = slugify(S.biz.name) + (i ? '-' + Math.random().toString(36).slice(2, 6) : '');
        const { data, error } = await sb.from('businesses').insert({ owner: u.user.id, slug, ...bizTo(S.biz) }).select('*').single();
        if (error) { lastErr = error; if (!/duplicate|unique/i.test(error.message)) throw error; } else row = data;
      }
      if (!row) throw lastErr;
      const bid = row.id;
      await insertChunks('services', S.services.map((s, i) => MAP.services.to({ ...s, position: i }, bid)));
      await insertChunks('staff', S.staff.map(s => MAP.staff.to(s, bid)));
      if (S.clients.length) await insertChunks('clients', S.clients.map(c => MAP.clients.to(c, bid)));
      if (S.bookings.length) await insertChunks('bookings', S.bookings.map(b => MAP.bookings.to(b, bid)));
      const ag = Object.entries(S.agents || {}).map(([kind, a]) => ({ business_id: bid, kind, enabled: a.enabled, mode: a.mode, settings: a.settings || {} }));
      if (ag.length) await sb.from('agents').insert(ag);
      return DB.load();
    },

    // ---------- gravar ----------
    saveLocal(S) { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) {} },
    async save(S, table, row) {
      if (!CLOUD) return DB.saveLocal(S);
      const { error } = await sb.from(table).upsert(MAP[table].to(row, S.biz.id));
      if (error) throw error;
    },
    async remove(S, table, id) {
      if (!CLOUD) return DB.saveLocal(S);
      const q = (table === 'services' || table === 'staff')
        ? sb.from(table).update({ active: false }).eq('id', id)
        : sb.from(table).delete().eq('id', id); // time_off, clients…
      const { error } = await q;
      if (error) throw error;
    },
    async saveBiz(S) {
      if (!CLOUD) return DB.saveLocal(S);
      const { error } = await sb.from('businesses').update(bizTo(S.biz)).eq('id', S.biz.id);
      if (error) throw error;
    },
    async destroy(S) {
      if (!CLOUD) { try { localStorage.removeItem(LS); } catch (e) {} return; }
      const { error } = await sb.from('businesses').delete().eq('id', S.biz.id);
      if (error) throw error;
    },

    // ---------- marca ----------
    async uploadLogo(S, blob, dataUrl) {
      if (!CLOUD) return dataUrl;
      const path = S.biz.id + '/logo-' + Date.now() + '.' + (blob.type === 'image/png' ? 'png' : 'webp');
      const { error } = await sb.storage.from('logos').upload(path, blob, { contentType: blob.type, upsert: true, cacheControl: '31536000' });
      if (error) throw error;
      return sb.storage.from('logos').getPublicUrl(path).data.publicUrl;
    },

    // ---------- agentes ----------
    async saveAgent(S, kind) {
      if (!CLOUD) return DB.saveLocal(S);
      const a = S.agents[kind];
      const { error } = await sb.from('agents').upsert({ business_id: S.biz.id, kind, enabled: a.enabled, mode: a.mode, settings: a.settings || {} });
      if (error) throw error;
    },
    async saveTask(S, t) {
      if (!CLOUD) return DB.saveLocal(S);
      const { error } = await sb.from('agent_tasks').update({ status: t.status, body: t.body, done_at: t.status === 'pendente' ? null : new Date().toISOString() }).eq('id', t.id);
      if (error) throw error;
    },
    async saveWait(S, w) {
      if (!CLOUD) return DB.saveLocal(S);
      const { error } = await sb.from('waitlist').upsert({ id: w.id, business_id: S.biz.id, client_id: w.clientId, service_id: w.serviceId, date_from: w.from, date_to: w.to, notes: w.notes || '' });
      if (error) throw error;
    },
    async removeWait(S, id) {
      if (!CLOUD) return DB.saveLocal(S);
      const { error } = await sb.from('waitlist').delete().eq('id', id);
      if (error) throw error;
    },
    agentRun: kind => invoke('agents', { action: 'run', kind }),
    agentApprove: taskId => invoke('agents', { action: 'approve', taskId }),
    agentSimulate: (phone, name, text) => invoke('agents', { action: 'simulate', phone, name, text }),
    waConnect: body => invoke('wa-connect', body),

    // ---------- página pública ----------
    async pubLoad(slug) {
      const { data, error } = await sb.rpc('public_business', { p_slug: slug });
      if (error) throw error;
      if (!data) return null;
      return {
        biz: { ...data.biz, logo: data.biz.logo || '', color: data.biz.color || '#1E5B47', instagram: data.biz.instagram || '', country: data.biz.country || 'PT' }, services: data.services,
        staff: data.staff.map(t => ({ ...t, hours: t.hours || null, services: t.services || [] })), clients: [],
        timeOff: (data.off || []).map(o => ({ id: 'off' + o.from + o.staffId, staffId: o.staffId, from: o.from, to: o.to })),
        bookings: data.busy.map((k, i) => ({ id: 'busy' + i, staffId: k.staffId, date: k.date, time: k.time, dur: k.dur, status: 'confirmada' }))
      };
    },
    async pubBook(a) {
      const { data, error } = await sb.rpc('public_book', { p_slug: a.slug, p_service: a.serviceId, p_staff: a.staffId || null, p_date: a.date, p_time: a.time, p_name: a.name, p_phone: a.phone, p_notes: a.notes || '', p_marketing: !!a.marketing });
      if (error) throw error;
      return data;
    },

    // ---------- funções de servidor ----------
    assistant: messages => invoke('assistant', { messages }),
    // ---------- notificações ----------
    vapid: () => CFG.VAPID_PUBLIC_KEY || '',
    async savePush(S, sub) {
      const { data: u } = await sb.auth.getUser(); const j = sub.toJSON();
      const { error } = await sb.from('push_subs').upsert({ business_id: S.biz.id, user_id: u.user.id, staff_id: S.role === 'staff' ? S.me : null, endpoint: j.endpoint, p256dh: j.keys.p256dh, auth: j.keys.auth }, { onConflict: 'endpoint' });
      if (error) throw error;
    },
    async removePush(endpoint) { await sb.from('push_subs').delete().eq('endpoint', endpoint); },
    // marcações novas/alteradas em tempo real (respeita as regras de acesso)
    live(cb) {
      if (!CLOUD || DB._live) return;
      DB._live = sb.channel('agenda').on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, p => cb(p)).subscribe();
    },
    async billing(action, plan) { return (await invoke('stripe-checkout', { action, plan, origin: location.origin })).url; },
    // Brasil: assinatura mensal por Pix (Asaas) — action: checkout | invoice | cancel
    billingPix: (action, plan, taxId) => invoke('pix-checkout', { action, plan, taxId, origin: location.origin })
  };
  window.DB = DB;
})();
