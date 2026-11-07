/* ============================================================
   Precious Woods · Sales and Customer portals
   Same login, preferences and settings panel as the Operations
   portal (shared.js). Each portal is a thin page that calls
   PWLite.boot('sales') or PWLite.boot('customer').

   Anything still missing is shown as a dashed "TODO" box that says
   exactly which information is needed, so it can be filled in later.
   ============================================================ */
window.PWLite = (function () {

  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const t = (...a) => PW.t(...a);

  /* ---------- what each portal contains ---------- */
  const CFG = {
    sales:    { title: 'pSales',    side: true,  price: true,  avail: true,  order: true,
                tabs: ['home', 'catalogue', 'neworder', 'myorders', 'customers', 'flow', 'library'] },
    customer: { title: 'pCustomer', side: false, price: false, avail: false, order: false,
                tabs: ['home', 'catalogue', 'orders', 'documents', 'contact'] }
  };
  const LABEL  = { home:'home', catalogue:'catalogue', pricing:'priceLists', pipeline:'pipeline', customers:'customersTab',
                   flow:'flow', library:'documents', orders:'orders', documents:'documents', contact:'contact', neworder:'newOrder', myorders:'myOrders' };
  const STATUS = { home:null, catalogue:'ready', pricing:'todo', pipeline:'todo', customers:'todo', flow:'ready',
                   library:'ready', orders:'todo', documents:'todo', contact:'todo', neworder:'ready', myorders:'ready' };

  let ID = 'sales', TAB = 'home';
  let SPACES = [], SECTIONS = [], DOCS = [];
  let SP = null, SPERR = false, SAMPLE = false, Q = '', REG = 'all', APPS = [], AV = [], SORT = 'az';

  const title = () => t(CFG[ID].title);
  const tabLabel = x => t(LABEL[x]);

  /* ---------- access screens ---------- */
  function gate(h){ const g = $('gate'); g.innerHTML = h; g.style.display = 'flex'; }
  function ungate(){ $('gate').style.display = 'none'; }
  function shell(inner){
    return '<div class="gcard"><img class="gmk" src="../img/pw-mark.png" alt="">'
      + '<p class="gmark">Precious Woods</p><p class="gseg">' + esc(title()) + '</p>' + inner
      + '<div class="glang"><select id="glang">'
      + PW.LANGS.map(([c, n]) => '<option value="' + c + '"' + (c === PW.prefs.lang ? ' selected' : '') + '>' + n + '</option>').join('')
      + '</select></div></div>';
  }
  function wireLang(redraw){
    const s = $('glang');
    if(s) s.onchange = () => { PW.setPref('lang', s.value); document.documentElement.lang = s.value; redraw(); };
  }
  function loginScreen(msg){
    gate(shell('<p>' + esc(t('loginLead')) + '</p>'
      + '<form id="gf"><input id="gmail" type="email" required placeholder="' + esc(t('emailLabel')) + '" autocomplete="email">'
      + '<button type="submit">' + esc(t('sendLink')) + '</button></form>'
      + '<p class="gmsg" id="gmsg">' + (msg ? esc(msg) : '') + '</p>'));
    wireLang(() => loginScreen(msg));
    $('gf').addEventListener('submit', async e => {
      e.preventDefault();
      const em = $('gmail').value.trim(), m = $('gmsg');
      m.textContent = t('sending');
      const { error } = await PW.signIn(em);
      m.textContent = error ? t('sendFail', error.message) : t('sent', em);
    });
  }
  function noAccessScreen(){
    gate(shell('<h2>' + esc(t('noAccessT')) + '</h2><p>' + esc(t('noAccessB', PW.email)) + '</p>'
      + '<p>' + esc(t('noAccessH')) + '</p><button id="out2">' + esc(t('signout')) + '</button>'));
    wireLang(noAccessScreen);
    $('out2').onclick = async () => { await PW.signOut(); location.reload(); };
  }

  /* ---------- small building blocks ---------- */
  const none = key => '<p class="none">' + esc(t(key)) + '</p>';

  /* a visible placeholder: what is missing, and what is needed to fill it */
  function todo(heading, needs){
    return '<div class="todo"><p class="todo-h"><span class="todo-tag">TODO</span>' + esc(heading) + '</p>'
      + '<ul>' + needs.map(n => '<li>' + esc(n) + '</li>').join('') + '</ul></div>';
  }
  const section = (h, body) => '<section class="sec"><h2>' + esc(h) + '</h2>' + body + '</section>';

  const spaceName = id => (SPACES.find(s => s.id === id) || {}).name || '';
  const hrefOf = d => d.url ? d.url : '../doc.html?doc=' + encodeURIComponent(d.slug);
  const isExternal = d => d.kind === 'link' && d.url;
  function docCard(d){
    const vacio = !d.has_content && d.kind === 'diagram';
    return '<a class="card' + (vacio ? ' empty' : '') + '" href="' + esc(hrefOf(d)) + '"'
      + (isExternal(d) ? ' target="_blank" rel="noopener"' : '') + '>'
      + '<p class="t">' + esc(d.title)
        + (vacio ? ' <span class="tag">' + esc(t('empty')) + '</span>' : '')
        + (isExternal(d) ? ' <span class="tag">' + esc(t('link')) + '</span>' : '') + '</p>'
      + (d.subtitle ? '<p class="d">' + esc(d.subtitle) + '</p>' : '') + '</a>';
  }

  /* ---------- species catalogue (public technical data, no volumes) ---------- */
  /* applications: the Excel only has the EN 335 use class, so the applications are derived from it
     (indicative). Each application lists the use classes it is typically used in. Real per-species applications
     can be added in species-extra.json ("applications": [...]) and are matched by name. */
  const APP_LIST = [['ap0', [1, 2]], ['ap1', [1, 2]], ['ap2', [1, 2, 3]], ['ap3', [2, 3]], ['ap4', [3, 4]], ['ap5', [3, 4]], ['ap6', [3, 4]], ['ap7', [3, 4]], ['ap8', [4, 5]], ['ap9', [3, 4]], ['ap10', [4, 5]], ['ap11', [5]]];
  function classesOf(uc){
    if(!uc) return [];
    let x = String(uc).replace(/(\d)\.\d/g, '$1');
    const set = new Set();
    x.replace(/(\d)\s*-\s*(\d)/g, (m, a, b) => { for(let i = +a; i <= +b; i++) set.add(i); return ''; });
    (x.match(/\d/g) || []).forEach(d => set.add(+d));
    return [...set].filter(n => n >= 1 && n <= 5).sort();
  }
  const appsOf = uc => { const c = classesOf(uc); return APP_LIST.filter(([, cl]) => cl.some(n => c.includes(n))).map(([k]) => k); };

  async function loadSpecies(){
    if(SP || SPERR) return;
    try{
      const r = await fetch('../data/species.json', { cache: 'no-cache' });
      if(!r.ok) throw new Error(r.status);
      SP = (await r.json()).species || [];
    }catch(e){ SPERR = true; return; }
    let X = {};
    try{
      const r2 = await fetch('../data/species-extra.json', { cache: 'no-cache' });
      if(r2.ok){ const j = await r2.json(); X = j.species || {}; SAMPLE = !!j.sample; }
    }catch(e){}
    SP.forEach(s => {
      const x = X[s.code] || {};
      s.price = (CFG[ID].price && x.price && typeof x.price.value === 'number') ? x.price : null;
      s.av = CFG[ID].avail ? (['stock', 'produce'].includes(x.availability) ? x.availability : 'na') : 'na';
      s.desc = x.description || '';
      s.appN = appsOf(s.useClass);
      s.appX = Array.isArray(x.applications) ? x.applications : [];
      s._hay = [s.name, s.botanical, s.cirad, s.code, s.colour, s.durability, s.useClass, s.strength, s.remark, s.desc,
                s.appX.join(' ')].join(' ').toLowerCase();
    });
  }

  /* an indicative swatch from the colour description in the data, never a photo */
  function swatch(c){
    if(!c) return null;
    const s = c.toLowerCase();
    let h = 30, sa = 10, l = 50;
    if(/purple/.test(s))                { h = 290; sa = 30; l = 32; }
    else if(/red/.test(s) && /brown/.test(s)) { h = 12; sa = 45; l = 30; }
    else if(/red/.test(s))              { h = 5;  sa = 60; l = 38; }
    else if(/pink/.test(s))             { h = 350; sa = 35; l = 65; }
    else if(/orange/.test(s))           { h = 26; sa = 70; l = 50; }
    else if(/yellow/.test(s) && /brown/.test(s)) { h = 36; sa = 45; l = 45; }
    else if(/yellow/.test(s))           { h = 46; sa = 65; l = 62; }
    else if(/cream|white/.test(s))      { h = 42; sa = 40; l = 88; }
    else if(/brown/.test(s))            { h = 26; sa = 35; l = 36; }
    if(/light/.test(s)) l = Math.min(92, l + 18);
    if(/dark/.test(s))  l = Math.max(12, l - 12);
    return 'hsl(' + h + ' ' + sa + '% ' + l + '%)';
  }

  const AVKEY = { stock: 'avStock', produce: 'avProduce', na: 'avNA' };
  function money(p){
    let v;
    try{ v = new Intl.NumberFormat(PW.prefs.lang, { style: 'currency', currency: p.currency || 'EUR', maximumFractionDigits: 0 }).format(p.value); }
    catch(e){ v = p.value + ' ' + (p.currency || ''); }
    return v + (p.unit ? ' / ' + p.unit : '');
  }

  function speciesCard(s){
    const row = (k, v, extra) => v ? '<div><dt>' + esc(t(k)) + '</dt><dd>' + esc(v) + (extra ? '<small>' + esc(extra) + '</small>' : '') + '</dd></div>' : '';
    const sw = swatch(s.colour);
    const all = s.appX.concat(s.appN.map(k => t(k))), apps = all.slice(0, 4);
    const commercial = CFG[ID].price || CFG[ID].avail;
    return '<article class="spc">'
      + '<div class="sp-ph">' + (s.image ? '<img loading="lazy" src="' + esc(s.image) + '" alt="' + esc(s.name) + '">' : '<span>' + esc(t('photoTodo')) + '</span>')
      + (CFG[ID].avail ? '<span class="av-b av-' + s.av + '">' + esc(t(AVKEY[s.av])) + '</span>' : '') + '</div>'
      + '<div class="sp-b">'
      + '<p class="sp-rg">' + esc(s.code) + '</p>'
      + '<h3>' + esc(s.name) + '</h3>'
      + (s.botanical ? '<p class="sp-bot">' + esc(s.botanical) + '</p>' : '')
      + (s.cirad ? '<p class="sp-ci">' + esc(s.cirad) + '</p>' : '')
      + (CFG[ID].price ? '<p class="sp-price' + (s.price ? '' : ' none') + '"><span>' + esc(t('price')) + '</span> ' + esc(s.price ? money(s.price) : t('priceNone')) + '</p>' : '')
      + (s.desc ? '<p class="sp-desc">' + esc(s.desc) + '</p>' : '')
      + (apps.length ? '<div class="sp-apps">' + apps.map(a => '<span>' + esc(a) + '</span>').join('') + (all.length > 4 ? '<span>+' + (all.length - 4) + '</span>' : '') + '</div>' : '')
      + (CFG[ID].order ? '<button class="add-o' + (inCart(s.code) ? ' on' : '') + '" data-add="' + esc(s.code) + '">' + esc(inCart(s.code) ? t('inOrderRemove') : t('addToOrder')) + '</button>' : '')
      + '<dl>'
      + (s.colour ? '<div><dt>' + esc(t('colour')) + '</dt><dd>' + (sw ? '<i class="sw" style="background:' + sw + '"></i>' : '') + esc(s.colour) + '</dd></div>' : '')
      + row('sg', s.sg)
      + row('durability', s.durability)
      + row('useClass', s.useClass)
      + row('strength', s.strength, s.strengthSource ? t('source') + ': ' + s.strengthSource : '')
      + row('logDia', s.logs ? s.logs + ' ' + t('cm') : '')
      + row('sapwood', s.sapwood ? s.sapwood + ' ' + t('cm') : '')
      + row('remark', s.remark)
      + '</dl></div></article>';
  }

  function filtered(){
    const toks = Q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = (SP || []).filter(s => toks.every(w => s._hay.includes(w) || s.appN.some(k => t(k).toLowerCase().includes(w)))
      && (!APPS.length || APPS.some(k => s.appN.includes(k) || s.appX.some(x => x.toLowerCase() === t(k).toLowerCase())))
      && (!AV.length || AV.includes(s.av)));
    const byName = (a, b) => a.name.localeCompare(b.name);
    const byPrice = d => (a, b) => {
      const pa = a.price ? a.price.value : null, pb = b.price ? b.price.value : null;
      if(pa == null && pb == null) return byName(a, b);
      if(pa == null) return 1;
      if(pb == null) return -1;
      return (pa - pb) * d || byName(a, b);
    };
    list.sort(SORT === 'za' ? (a, b) => byName(b, a) : SORT === 'low' ? byPrice(1) : SORT === 'high' ? byPrice(-1) : byName);
    return list;
  }
  function drawGrid(){
    const g = $('spgrid'); if(!g) return;
    const list = filtered();
    g.innerHTML = list.length ? list.map(speciesCard).join('') : none('noMatch');
    $('spcount').textContent = t('results', list.length, SP.length);
    g.onclick = e => { const b = e.target.closest('[data-add]'); if(!b) return; toggleCart(b.dataset.add); drawGrid(); };
    const n = APPS.length, m = AV.length;
    const sm = $('appsum'); if(sm) sm.textContent = n ? t('applications') + ' (' + n + ')' : t('allApplications');
    const sa = $('avsum'); if(sa) sa.textContent = m ? t('availability') + ' (' + m + ')' : t('allAvailability');
    document.querySelectorAll('[data-app]').forEach(b => b.setAttribute('aria-pressed', String(APPS.includes(b.dataset.app))));
    document.querySelectorAll('[data-avf]').forEach(b => b.setAttribute('aria-pressed', String(AV.includes(b.dataset.avf))));
    const dirty = Q || n || m;
    $('spclear').hidden = !dirty;
  }

  async function renderCatalogue(){
    $('content').innerHTML = '<p class="none">' + esc(t('checking')) + '</p>';
    await loadSpecies();
    if(TAB !== 'catalogue') return;
    if(SPERR){ $('content').innerHTML = none('loadSpeciesFail'); return; }
    const sorts = [['az', 'sortAZ'], ['za', 'sortZA']].concat(CFG[ID].price ? [['low', 'sortPriceLow'], ['high', 'sortPriceHigh']] : []);
    if(!CFG[ID].price && (SORT === 'low' || SORT === 'high')) SORT = 'az';
    const missing = ID === 'sales'
      ? todo('Species catalogue: information still to add', [
          'Prices per species: fill portal/data/species-extra.json (or a Supabase table with access rules if prices must stay private).',
          'Availability per species: in stock / available to be produced / N/A (same file).',
          'Log volumes per species (internal commercial data: keep it behind the login, in a Supabase table with access rules, not in a public file).',
          'Photos per species (the lesser-known species project) and the field "image" in portal/data/species.json.',
          'Real applications per species (the Excel only has the use class, so applications are derived from it for now): add "applications" in species-extra.json.',
          'A short description per species (same file).'
        ])
      : todo('Species catalogue: information still to add', [
          'Photos per species and a short description with typical uses.',
          'Availability or lead time per species, if customers should see it.',
          'Certification (FSC / PEFC) per species, if it can differ.'
        ]);
    $('content').innerHTML = '<section class="sec">'
      + '<div class="sp-tools">'
      + '<input id="spq" type="search" autocomplete="off" placeholder="' + esc(t('searchSpecies')) + '" aria-label="' + esc(t('searchSpecies')) + '" value="' + esc(Q) + '">'
      + '<details class="sp-dd" id="appdd"><summary id="appsum"></summary><div class="sp-dd-b">'
        + APP_LIST.map(([k]) => '<button type="button" data-app="' + k + '" aria-pressed="false">' + esc(t(k)) + '</button>').join('')
      + '</div></details>'
      + (CFG[ID].avail ? '<details class="sp-dd" id="avdd"><summary id="avsum"></summary><div class="sp-dd-b">'
          + ['stock', 'produce', 'na'].map(v => '<button type="button" data-avf="' + v + '" aria-pressed="false">' + esc(t(AVKEY[v])) + '</button>').join('')
        + '</div></details>' : '')
      + '<select id="spsort" aria-label="' + esc(t('sortBy')) + '">'
        + sorts.map(([v, k]) => '<option value="' + v + '"' + (SORT === v ? ' selected' : '') + '>' + esc(t('sortBy') + ': ' + t(k)) + '</option>').join('') + '</select>'
      + '</div>'
      + '<div class="sp-tools">'
      + '<button class="sp-clear" id="spclear" hidden>' + esc(t('clearFilters')) + '</button>'
      + '<span class="sp-count" id="spcount"></span></div>'
      + '<div class="sp-grid" id="spgrid"></div></section>'
      + missing;
    $('spq').oninput = e => { Q = e.target.value; drawGrid(); };
    $('spsort').onchange = e => { SORT = e.target.value; drawGrid(); };
    const toggle = (arr, v) => arr.includes(v) ? arr.filter(x => x !== v) : arr.concat(v);
    document.querySelectorAll('[data-app]').forEach(c => c.onclick = () => { APPS = toggle(APPS, c.dataset.app); drawGrid(); });
    document.querySelectorAll('[data-avf]').forEach(c => c.onclick = () => { AV = toggle(AV, c.dataset.avf); drawGrid(); });
    $('spclear').onclick = () => { Q = ''; APPS = []; AV = []; renderCatalogue(); };
    drawGrid();
  }


  /* ============ orders: draft quote ("cart"), customers, saved orders ============ */
  const LS = {
    get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
    set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
  };
  let DRAFT = { cust: null, lines: [], terms: {}, cur: 'EUR' };
  let BASE_C = [], BASE_O = [], LOCAL_C = [], LOCAL_O = [], OD_LOADED = false;
  const OF = { cust: 'all', from: '', to: '', st: [], sp: 'all' };
  const ST = { quote: 'stQuote', submitted: 'stSubmitted', open: 'stOpen', transit: 'stTransit', delivered: 'stDelivered' };
  const custs = () => BASE_C.concat(LOCAL_C);
  const orders = () => BASE_O.concat(LOCAL_O).sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const custById = id => custs().find(c => c.id === id);
  const cartCount = () => DRAFT.lines.length;
  const inCart = code => DRAFT.lines.some(l => l.code === code);
  const saveDraft = () => LS.set('pw-draft', DRAFT);
  const nameOf = code => ((SP || []).find(s => s.code === code) || {}).name || code;
  const money2 = (v, cur) => { try{ return new Intl.NumberFormat(PW.prefs.lang, { style: 'currency', currency: cur || 'EUR', maximumFractionDigits: 2 }).format(v); }catch(e){ return v + ' ' + (cur || ''); } };
  const lineTotal = l => (+l.vol || 0) * (+l.price || 0);
  const draftTotal = () => DRAFT.lines.reduce((a, l) => a + lineTotal(l), 0);

  function flash(msg){
    const d = document.createElement('div'); d.className = 'pw-flash'; d.textContent = msg; document.body.appendChild(d);
    setTimeout(() => d.remove(), 2600);
  }

  function addLine(code){
    const s = (SP || []).find(x => x.code === code); if(!s) return;
    DRAFT.lines.push({ id: Date.now() + Math.random(), code, thick: '', width: '', length: '', vol: '', price: s.price ? s.price.value : '' });
    if(s.price && s.price.currency && DRAFT.lines.length === 1) DRAFT.cur = s.price.currency;
    saveDraft(); buildNav();
  }
  function toggleCart(code){
    if(inCart(code)) DRAFT.lines = DRAFT.lines.filter(l => l.code !== code); else addLine(code);
    saveDraft(); buildNav();
  }

  async function loadOrdersData(){
    if(OD_LOADED) return; OD_LOADED = true;
    LOCAL_C = LS.get('pw-sales-custs', []); LOCAL_O = LS.get('pw-sales-orders', []);
    const d = LS.get('pw-draft', null); if(d && Array.isArray(d.lines)) DRAFT = Object.assign(DRAFT, d);
    try{
      const r = await fetch('../data/orders.json', { cache: 'no-cache' });
      if(r.ok){ const j = await r.json(); BASE_C = j.customers || []; BASE_O = j.orders || []; }
    }catch(e){}
  }

  /* ---- quick new-customer form ---- */
  function openCustModal(){
    const bg = document.createElement('div'); bg.className = 'modal-bg';
    const f = (id, k, type) => '<label>' + esc(t(k)) + '<input id="' + id + '" type="' + (type || 'text') + '"></label>';
    bg.innerHTML = '<div class="modal" role="dialog" aria-modal="true"><h2>' + esc(t('newCustTitle')) + '</h2>'
      + f('nc-name', 'name') + f('nc-country', 'country') + f('nc-contact', 'contactPerson') + f('nc-mail', 'email', 'email') + f('nc-phone', 'phone')
      + '<label>' + esc(t('notes')) + '<textarea id="nc-notes" rows="2"></textarea></label>'
      + '<p class="modal-err" id="nc-err"></p>'
      + '<div class="modal-act"><button class="ghost2" id="nc-x">' + esc(t('cancel')) + '</button>'
      + '<button class="ghost2" id="nc-req">' + esc(t('submitReq')) + '</button><button class="primary" id="nc-ok">' + esc(t('saveApprove')) + '</button></div>'
      + '<p class="modal-note">TODO: "Submit request" should reach the master data admin (same as the full customer form); for now it is saved here only.</p></div>';
    document.body.appendChild(bg);
    $('nc-name').focus();
    const done = status => {
      const name = $('nc-name').value.trim();
      if(!name){ $('nc-err').textContent = t('nameNeeded'); return; }
      const c = { id: 'c' + Date.now(), name, country: $('nc-country').value.trim(), contact: $('nc-contact').value.trim(),
                  email: $('nc-mail').value.trim(), phone: $('nc-phone').value.trim(), notes: $('nc-notes').value.trim(), status };
      LOCAL_C.push(c); LS.set('pw-sales-custs', LOCAL_C);
      DRAFT.cust = c.id; saveDraft(); bg.remove(); renderNewOrder();
    };
    $('nc-x').onclick = () => bg.remove();
    $('nc-ok').onclick = () => done('approved');
    $('nc-req').onclick = () => done('requested');
    bg.onclick = e => { if(e.target === bg) bg.remove(); };
  }

  /* ---- export of the quote ---- */
  const HEAD = () => [t('species'), t('botanicalName'), t('thickness'), t('width'), t('length'), t('volume'), t('unitPrice') + ' (' + DRAFT.cur + ')', t('lineTotal') + ' (' + DRAFT.cur + ')'];
  function quoteRows(){
    return DRAFT.lines.map(l => { const s = (SP || []).find(x => x.code === l.code) || {};
      return [s.name || l.code, s.botanical || '', l.thick, l.width, l.length, l.vol, l.price, lineTotal(l) || '']; });
  }
  function quoteMeta(){
    const c = custById(DRAFT.cust), T = DRAFT.terms;
    return [[t('quoteTitle'), T.ref || ''], [t('customer'), c ? c.name : ''], [t('date'), new Date().toISOString().slice(0, 10)],
      [t('incoterm'), T.incoterm || ''], [t('payment'), T.payment || ''], [t('port'), T.port || ''], [t('shipment'), T.ship || ''],
      [t('certification'), T.cert || ''], [t('quality'), T.quality || ''], [t('remarks'), T.remarks || '']];
  }
  function download(name, mime, body){
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + body], { type: mime + ';charset=utf-8' }));
    a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function quoteHtml(){
    const th = HEAD().map(h => '<th>' + esc(h) + '</th>').join('');
    const tr = quoteRows().map(r => '<tr>' + r.map(c => '<td>' + esc(c) + '</td>').join('') + '</tr>').join('');
    return '<h1>Precious Woods · ' + esc(t('quoteTitle')) + '</h1>'
      + '<table class="qm">' + quoteMeta().map(([k, v]) => '<tr><th>' + esc(k) + '</th><td>' + esc(v) + '</td></tr>').join('') + '</table>'
      + '<table class="qt"><thead><tr>' + th + '</tr></thead><tbody>' + tr + '</tbody></table>'
      + '<p><b>' + esc(t('total')) + ': ' + esc(money2(draftTotal(), DRAFT.cur)) + '</b></p>';
  }
  function exportQuote(kind){
    if(!DRAFT.lines.length){ flash(t('needLines')); return; }
    const base = 'quote-' + (DRAFT.terms.ref || new Date().toISOString().slice(0, 10));
    if(kind === 'csv'){
      const q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
      const rows = quoteMeta().concat([[]], [HEAD()], quoteRows());
      download(base + '.csv', 'text/csv', rows.map(r => r.map(q).join(',')).join('\r\n'));
    }else if(kind === 'xls'){
      download(base + '.xls', 'application/vnd.ms-excel', '<html><head><meta charset="utf-8"></head><body>' + quoteHtml() + '</body></html>');
    }else if(kind === 'doc'){
      download(base + '.doc', 'application/msword', '<html><head><meta charset="utf-8"></head><body>' + quoteHtml() + '</body></html>');
    }else{
      let d = $('qprint'); if(!d){ d = document.createElement('div'); d.id = 'qprint'; document.body.appendChild(d); }
      d.innerHTML = quoteHtml(); window.print();
    }
  }

  function saveOrder(status){
    if(!DRAFT.lines.length){ flash(t('needLines')); return; }
    const c = custById(DRAFT.cust), n = BASE_O.length + LOCAL_O.length + 1;
    LOCAL_O.push({ id: 'o' + Date.now(), ref: DRAFT.terms.ref || ('Q-' + new Date().getFullYear() + '-' + String(n).padStart(3, '0')),
      cust: c ? c.id : '', custName: c ? c.name : '', date: new Date().toISOString().slice(0, 10), status, cur: DRAFT.cur,
      lines: DRAFT.lines.map(l => ({ code: l.code, thick: l.thick, width: l.width, length: l.length, vol: +l.vol || 0, price: +l.price || 0 })),
      total: draftTotal(), terms: DRAFT.terms });
    LS.set('pw-sales-orders', LOCAL_O);
    DRAFT = { cust: null, lines: [], terms: {}, cur: 'EUR' }; saveDraft();
    flash(t(status === 'quote' ? 'savedQuote' : 'submittedOrder'));
    go('myorders');
  }

  /* ---- New Order ---- */
  async function renderNewOrder(){
    $('content').innerHTML = '<p class="none">' + esc(t('checking')) + '</p>';
    await Promise.all([loadSpecies(), loadOrdersData()]);
    if(TAB !== 'neworder') return;
    if(SPERR){ $('content').innerHTML = none('loadSpeciesFail'); return; }
    const c = custById(DRAFT.cust), T = DRAFT.terms;
    const opt = (cur, list) => list.map(v => '<option' + (cur === v ? ' selected' : '') + '>' + esc(v) + '</option>').join('');
    const fld = (k, label, input) => '<label class="fld">' + esc(t(label)) + input + '</label>';
    const tin = (k, ph) => '<input data-t="' + k + '" value="' + esc(T[k] || '') + '"' + (ph ? ' placeholder="' + esc(ph) + '"' : '') + '>';
    const lines = DRAFT.lines.map((l, i) => '<tr data-i="' + i + '"><td class="sn">' + esc(nameOf(l.code)) + '<small>' + esc(l.code) + '</small></td>'
      + ['thick', 'width', 'length', 'vol', 'price'].map(k => '<td><input class="num" inputmode="decimal" data-li="' + i + '" data-f="' + k + '" value="' + esc(l[k]) + '"></td>').join('')
      + '<td class="lt" id="lt' + i + '">' + esc(lineTotal(l) ? money2(lineTotal(l), DRAFT.cur) : '–') + '</td>'
      + '<td><button class="rm" data-rm="' + i + '" aria-label="Remove">✕</button></td></tr>').join('');
    $('content').innerHTML = '<section class="sec"><h2>' + esc(t('customer')) + '</h2>'
      + '<div class="oc-row"><div class="oc-box"><input id="ocq" type="search" autocomplete="off" placeholder="' + esc(t('customerPh')) + '" aria-label="' + esc(t('customer')) + '">'
      + '<div class="qs-res" id="ocres" hidden></div></div>'
      + '<button class="primary" id="ocnew">' + esc(t('newPlus')) + '</button></div>'
      + '<p class="oc-sel">' + (c ? '<span class="chip-sel">' + esc(c.name) + (c.country ? ' · ' + esc(c.country) : '') + ' · ' + esc(t(c.status === 'requested' ? 'stRequested' : 'stApproved'))
          + ' <button id="ocx" aria-label="Remove">✕</button></span>' : esc(t('noCustomer'))) + '</p></section>'
      + '<section class="sec"><h2>' + esc(t('proposal')) + '</h2>'
      + '<div class="oc-box wide"><input id="oadd" list="spdl" autocomplete="off" placeholder="' + esc(t('addSpeciesPh')) + '" aria-label="' + esc(t('addSpeciesPh')) + '">'
      + '<datalist id="spdl">' + SP.map(s => '<option value="' + esc(s.name) + ' (' + esc(s.code) + ')"></option>').join('') + '</datalist></div>'
      + (DRAFT.lines.length
          ? '<div class="tbl-w"><table class="ol"><thead><tr><th>' + [t('species'), t('thickness'), t('width'), t('length'), t('volume'), t('unitPrice') + ' (' + DRAFT.cur + ')', t('lineTotal'), ''].map(esc).join('</th><th>') + '</th></tr></thead><tbody>' + lines + '</tbody></table></div>'
            + '<p class="ol-t">' + esc(t('total')) + ': <b id="otot">' + esc(money2(draftTotal(), DRAFT.cur)) + '</b></p>'
          : none('emptyLines')) + '</section>'
      + '<section class="sec"><h2>' + esc(t('contractDetails')) + '</h2><div class="form-g">'
      + fld('ref', 'reference', tin('ref'))
      + fld('incoterm', 'incoterm', '<select data-t="incoterm"><option value=""></option>' + opt(T.incoterm, ['EXW', 'FCA', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP']) + '</select>')
      + fld('cur', 'currency', '<select id="ocur">' + opt(DRAFT.cur, ['EUR', 'USD', 'GBP']) + '</select>')
      + fld('payment', 'payment', tin('payment'))
      + fld('port', 'port', tin('port'))
      + fld('ship', 'shipment', tin('ship'))
      + fld('cert', 'certification', '<select data-t="cert"><option value=""></option>' + opt(T.cert, ['FSC 100%', 'FSC Mix', 'FSC Controlled Wood', 'PEFC', 'None']) + '</select>')
      + fld('quality', 'quality', tin('quality'))
      + '<label class="fld full">' + esc(t('remarks')) + '<textarea rows="3" data-t="remarks">' + esc(T.remarks || '') + '</textarea></label></div>'
      + todo('Contract form: fields to confirm', [
          'The exact fields of the PWEU sales contract (payment terms, tolerances, packing, inspection, claims, signatures).',
          'Quote and contract layout (logo, legal text, numbering) so the PDF, Word and Excel match the real documents.',
          'Where a submitted order request goes (Acadon sales order, e-mail to the order desk, Supabase).'
        ]) + '</section>'
      + '<div class="act-bar"><span class="act-g">'
      + '<button data-ex="pdf">' + esc(t('printPdf')) + '</button><button data-ex="xls">' + esc(t('exportExcel')) + '</button>'
      + '<button data-ex="doc">' + esc(t('exportWord')) + '</button><button data-ex="csv">' + esc(t('exportCsv')) + '</button></span>'
      + '<span class="act-g"><button id="osave">' + esc(t('saveQuote')) + '</button><button class="primary" id="osub">' + esc(t('submitOrder')) + '</button></span></div>';

    // customer search
    const q = $('ocq'), res = $('ocres');
    q.oninput = () => {
      const v = q.value.trim().toLowerCase();
      const hits = custs().filter(x => !v || (x.name + ' ' + (x.country || '')).toLowerCase().includes(v)).slice(0, 8);
      res.innerHTML = hits.map(x => '<button data-cid="' + esc(x.id) + '"><b>' + esc(x.name) + '</b> <i>' + esc(x.country || '') + '</i><span>' + esc(t(x.status === 'requested' ? 'stRequested' : 'stApproved')) + '</span></button>').join('')
        || '<p class="none">' + esc(t('noMatch')) + '</p>';
      res.hidden = false;
      res.querySelectorAll('[data-cid]').forEach(b => b.onclick = () => { DRAFT.cust = b.dataset.cid; saveDraft(); renderNewOrder(); });
    };
    q.onfocus = q.oninput;
    $('ocnew').onclick = openCustModal;
    if($('ocx')) $('ocx').onclick = () => { DRAFT.cust = null; saveDraft(); renderNewOrder(); };
    // add species
    const add = () => {
      const m = /\(([^)]+)\)\s*$/.exec($('oadd').value); if(!m) return;
      $('oadd').value = ''; addLine(m[1]); renderNewOrder();
    };
    $('oadd').onchange = add;
    // lines
    document.querySelectorAll('[data-li]').forEach(inp => inp.oninput = () => {
      const i = +inp.dataset.li, l = DRAFT.lines[i]; l[inp.dataset.f] = inp.value; saveDraft();
      $('lt' + i).textContent = lineTotal(l) ? money2(lineTotal(l), DRAFT.cur) : '–';
      const tt = $('otot'); if(tt) tt.textContent = money2(draftTotal(), DRAFT.cur);
    });
    document.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { DRAFT.lines.splice(+b.dataset.rm, 1); saveDraft(); buildNav(); renderNewOrder(); });
    document.querySelectorAll('[data-t]').forEach(inp => inp.oninput = inp.onchange = () => { DRAFT.terms[inp.dataset.t] = inp.value; saveDraft(); });
    $('ocur').onchange = e => { DRAFT.cur = e.target.value; saveDraft(); renderNewOrder(); };
    document.querySelectorAll('[data-ex]').forEach(b => b.onclick = () => exportQuote(b.dataset.ex));
    $('osave').onclick = () => saveOrder('quote');
    $('osub').onclick = () => saveOrder('submitted');
  }

  /* ---- My orders ---- */
  async function renderMyOrders(){
    $('content').innerHTML = '<p class="none">' + esc(t('checking')) + '</p>';
    await Promise.all([loadSpecies(), loadOrdersData()]);
    if(TAB !== 'myorders') return;
    const all = orders();
    const names = [...new Set(all.map(o => o.custName || '').concat(custs().map(c => c.name)))].filter(Boolean).sort();
    const spCodes = [...new Set(all.flatMap(o => o.lines.map(l => l.code)))].sort((a, b) => nameOf(a).localeCompare(nameOf(b)));
    $('content').innerHTML = '<section class="sec"><div class="sp-tools">'
      + '<select id="ofc" aria-label="' + esc(t('customer')) + '"><option value="all">' + esc(t('allCustomers')) + '</option>'
        + names.map(n => '<option value="' + esc(n) + '"' + (OF.cust === n ? ' selected' : '') + '>' + esc(n) + '</option>').join('') + '</select>'
      + '<select id="ofs" aria-label="' + esc(t('species')) + '"><option value="all">' + esc(t('allSpecies')) + '</option>'
        + spCodes.map(c => '<option value="' + esc(c) + '"' + (OF.sp === c ? ' selected' : '') + '>' + esc(nameOf(c)) + '</option>').join('') + '</select>'
      + '<details class="sp-dd" id="ostd"><summary id="ostsum"></summary><div class="sp-dd-b">'
        + Object.keys(ST).map(k => '<button type="button" data-ost="' + k + '" aria-pressed="false">' + esc(t(ST[k])) + '</button>').join('') + '</div></details>'
      + '<label class="dt">' + esc(t('dateFrom')) + ' <input type="date" id="ofd1" value="' + esc(OF.from) + '"></label>'
      + '<label class="dt">' + esc(t('dateTo')) + ' <input type="date" id="ofd2" value="' + esc(OF.to) + '"></label>'
      + '<button class="sp-clear" id="ofclr">' + esc(t('clearFilters')) + '</button><span class="sp-count" id="ocount"></span></div>'
      + '<div id="oinsight"></div><div class="ord-g" id="olist"></div></section>'
      + todo('My orders: where the real data comes from', [
          'Source of orders, quotes and shipments (Acadon sales orders, shipping updates, Supabase). Today only quotes and orders created here are listed.',
          'Which orders each salesperson sees (all, or only their own customers).',
          'Statuses and dates for "In transit" (B/L date, ETA) once shipping data is available.'
        ]);
    const draw = () => {
      let L = orders();
      if(OF.cust !== 'all') L = L.filter(o => o.custName === OF.cust);
      if(OF.from) L = L.filter(o => o.date >= OF.from);
      if(OF.to) L = L.filter(o => o.date <= OF.to);
      if(OF.st.length) L = L.filter(o => OF.st.includes(o.status));
      const byCust = L, base = L;
      if(OF.sp !== 'all') L = L.filter(o => o.lines.some(l => l.code === OF.sp));
      $('ocount').textContent = t('ordersCount', L.length);
      $('ostsum').textContent = OF.st.length ? t('statusWord') + ' (' + OF.st.length + ')' : t('allStatuses');
      document.querySelectorAll('[data-ost]').forEach(b => b.setAttribute('aria-pressed', String(OF.st.includes(b.dataset.ost))));
      let ins = '';
      const chips = (arr, attr) => '<div class="sp-apps big">' + arr.map(v => '<button data-' + attr + '="' + esc(v[0]) + '">' + esc(v[1]) + '</button>').join('') + '</div>';
      if(OF.cust !== 'all' && OF.sp === 'all'){
        const cs = [...new Set(L.flatMap(o => o.lines.map(l => l.code)))];
        if(cs.length) ins = '<p class="ins-h">' + esc(t('specOfCust')) + '</p>' + chips(cs.map(c => [c, nameOf(c)]), 'isp');
      }else if(OF.sp !== 'all' && OF.cust === 'all'){
        const cn = [...new Set(L.map(o => o.custName || t('noCustName')))];
        if(cn.length) ins = '<p class="ins-h">' + esc(t('custOfSpec')) + '</p>' + chips(cn.map(c => [c, c]), 'ict');
      }
      $('oinsight').innerHTML = ins;
      $('oinsight').querySelectorAll('[data-isp]').forEach(b => b.onclick = () => { OF.sp = b.dataset.isp; renderMyOrders(); });
      $('oinsight').querySelectorAll('[data-ict]').forEach(b => b.onclick = () => { OF.cust = b.dataset.ict; renderMyOrders(); });
      $('olist').innerHTML = L.length ? L.map(o => '<article class="ord"><div class="ord-h"><b>' + esc(o.ref) + '</b><span class="st st-' + esc(o.status) + '">' + esc(t(ST[o.status] || 'stQuote')) + '</span></div>'
        + '<p class="ord-c">' + esc(o.custName || t('noCustName')) + ' · ' + esc(o.date) + '</p>'
        + '<ul>' + o.lines.map(l => '<li>' + esc(nameOf(l.code)) + (l.vol ? ' · ' + esc(l.vol) + ' m³' : '') + '</li>').join('') + '</ul>'
        + (o.total ? '<p class="ord-t">' + esc(money2(o.total, o.cur)) + '</p>' : '') + '</article>').join('') : none('noOrders');
    };
    $('ofc').onchange = e => { OF.cust = e.target.value; renderMyOrders(); };
    $('ofs').onchange = e => { OF.sp = e.target.value; renderMyOrders(); };
    $('ofd1').onchange = e => { OF.from = e.target.value; draw(); };
    $('ofd2').onchange = e => { OF.to = e.target.value; draw(); };
    document.querySelectorAll('[data-ost]').forEach(b => b.onclick = () => { OF.st = OF.st.includes(b.dataset.ost) ? OF.st.filter(x => x !== b.dataset.ost) : OF.st.concat(b.dataset.ost); draw(); });
    $('ofclr').onclick = () => { OF.cust = 'all'; OF.sp = 'all'; OF.st = []; OF.from = ''; OF.to = ''; renderMyOrders(); };
    draw();
  }

  /* ---------- the other tabs ---------- */
  /* ---- quick search + shortcuts (home) ---- */
  function openCatalogue(opts){
    Q = (opts && opts.q) || ''; AV = (opts && opts.av) ? [opts.av] : []; APPS = [];
    go('catalogue');
  }
  async function renderHome(){
    const tabs = CFG[ID].tabs.filter(x => x !== 'home');
    const sc = [{ k: 'catalogue', n: tabLabel('catalogue'), st: 'ready', f: () => openCatalogue() }];
    if(CFG[ID].avail){
      sc.push({ k: 'stock', n: t('scStock'), st: 'ready', f: () => openCatalogue({ av: 'stock' }) });
      sc.push({ k: 'produce', n: t('scProduce'), st: 'ready', f: () => openCatalogue({ av: 'produce' }) });
    }
    tabs.filter(x => x !== 'catalogue').forEach(x => sc.push({ k: x, n: tabLabel(x), st: STATUS[x], f: () => go(x) }));
    $('content').innerHTML = '<section class="sec qs"><h2>' + esc(t('quickSearch')) + '</h2>'
      + '<div class="qs-box"><input id="qsq" type="search" autocomplete="off" placeholder="' + esc(t('quickSearchPh')) + '" aria-label="' + esc(t('quickSearch')) + '">'
      + '<div class="qs-res" id="qsres" hidden></div></div></section>'
      + section(t('shortcuts'), '<div class="tiles">' + sc.map((x, i) =>
          '<button class="tile" data-sc="' + i + '"><span class="tile-n">' + esc(x.n) + '</span>'
          + '<span class="tile-s ' + (x.st === 'ready' ? 'ready' : 'pending') + '">' + esc(t(x.st === 'ready' ? 'ready' : 'toComplete')) + '</span></button>').join('') + '</div>')
      + (ID === 'customer'
          ? todo('Customer home: welcome message', [
              'Short welcome text and what customers can do here.',
              'Customer name shown after login (needs the link between a login and a customer in Acadon / Supabase).',
              'Next delivery or latest order summary, once orders are available.'
            ])
          : todo('Sales home: summary', [
              'Which numbers a salesperson wants on the first screen (open quotes, orders to confirm, stock by species).',
              'Where those numbers come from (Acadon export, Excel, Supabase).'
            ]));
    $('content').querySelectorAll('[data-sc]').forEach(b => b.onclick = () => sc[+b.dataset.sc].f());
    await loadSpecies();
    const inp = $('qsq'), res = $('qsres');
    if(!inp || SPERR) return;
    const draw = () => {
      const v = inp.value.trim().toLowerCase();
      if(!v){ res.hidden = true; return; }
      const toks = v.split(/\s+/);
      const hits = SP.filter(s => toks.every(w => s._hay.includes(w)));
      res.innerHTML = hits.slice(0, 6).map(s => '<button data-q="' + esc(s.name) + '"><b>' + esc(s.name) + '</b> <i>' + esc(s.botanical || '') + '</i><span>' + esc(s.code) + '</span></button>').join('')
        + (hits.length ? '<button class="qs-all" data-q="' + esc(inp.value.trim()) + '">' + esc(t('showResults')) + ' (' + hits.length + ')</button>' : '<p class="none">' + esc(t('noMatch')) + '</p>');
      res.hidden = false;
      res.querySelectorAll('[data-q]').forEach(b => b.onclick = () => openCatalogue({ q: b.dataset.q }));
    };
    inp.oninput = draw;
    inp.onkeydown = e => { if(e.key === 'Enter' && inp.value.trim()) openCatalogue({ q: inp.value.trim() }); };
  }

  async function renderSimple(tab){
    if(ID === 'sales') await loadOrdersData();
    const label = t(LABEL[tab]);
    const T = {
      customers: () => (custs().length ? '<div class="grid">' + custs().map(c => '<div class="card"><p class="t">' + esc(c.name) + '</p><p class="d">' + esc((c.country || '') + ' · ' + t(c.status === 'requested' ? 'stRequested' : 'stApproved')) + '</p></div>').join('') + '</div>' : '')
        + '<div class="grid"><a class="card" href="../forms/customer-request.html"><p class="t">' + esc(t('newCustomer')) + '</p>'
          + '<p class="d">Master data request, sent to the master data admin.</p></a></div>'
        + todo('Customers list', [
            'Source of the customer list (Acadon master data).',
            'Fields to show per customer: name, country, contact, payment terms, status of the request.',
            'Link between customer requests and their approval status.'
          ]),
      orders: () => none('ordersEmpty') + todo('My orders', [
        'Source of the orders and which login belongs to which customer.',
        'Columns and statuses to show (order, date, species, volume, status, expected delivery).',
        'Delivery documents to attach to each order (packing list, B/L, invoice).'
      ]),
      documents: () => none('docsEmpty') + todo('Customer documents', [
        'Which documents customers should get: invoices, certificates (FSC / PEFC), packing lists, product data sheets.',
        'Where they are stored and how each one is linked to a customer.'
      ]),
      contact: () => todo('Contact', [
        'Account manager name, e-mail and phone (one per customer, or a general sales contact).',
        'Opening hours and the e-mail for urgent delivery questions.'
      ])
    };
    $('content').innerHTML = section(label, T[tab]());
  }

  function renderFlow(){
    const list = DOCS.filter(d => d.kind === 'diagram');
    $('content').innerHTML = section(t('flow'),
      list.length ? '<div class="grid">' + list.map(docCard).join('') + '</div>' : none('nothingHere'));
  }

  function renderLibrary(){
    const secs = SECTIONS.filter(s => s.nav === 'commercial');
    const body = secs.map(sec => {
      const list = DOCS.filter(d => d.section === sec.id).sort((a, b) => (a.sort || 0) - (b.sort || 0));
      return '<h3 class="sub">' + esc(spaceName(sec.space) + ' · ' + sec.name) + '</h3>'
        + (list.length ? '<div class="grid">' + list.map(docCard).join('') + '</div>' : none('nothingHere'));
    }).join('');
    $('content').innerHTML = section(t('documents'), body || none('nothingHere'))
      + todo('Sales library', [
          'Brochures, certificates (FSC / PEFC) and product data sheets to publish here.',
          'Where the files live today (Drive, Acadon, SharePoint) so they can be linked from the portal.'
        ]);
  }

  function render(){
    if(TAB === 'home') return renderHome();
    if(TAB === 'catalogue') return renderCatalogue();
    if(TAB === 'neworder') return renderNewOrder();
    if(TAB === 'myorders') return renderMyOrders();
    if(TAB === 'flow') return renderFlow();
    if(TAB === 'library') return renderLibrary();
    return renderSimple(TAB);
  }

  /* ---------- navigation and chrome ---------- */
  const badge = x => (x === 'neworder' && cartCount()) ? '<b class="cart-n" aria-label="' + cartCount() + '">' + cartCount() + '</b>' : '';
  function buildNav(){
    $('nav').innerHTML = CFG[ID].tabs.map(x =>
      '<button data-tab="' + x + '" aria-expanded="' + (x === TAB) + '">' + esc(tabLabel(x)) + badge(x) + '</button>').join('');
    $('nav').querySelectorAll('button').forEach(b => b.onclick = () => go(b.dataset.tab));
    const sb = $('sidemenu');
    if(sb && CFG[ID].side){
      const sub = (v, k) => '<button class="sub' + (TAB === 'catalogue' && AV.length === 1 && AV[0] === v ? ' on' : '') + '" data-av="' + v + '">' + esc(t(k)) + '</button>';
      sb.innerHTML = '<p class="side-h">' + esc(t('menu')) + '</p>' + CFG[ID].tabs.map(x =>
        '<button class="' + (x === TAB && !(x === 'catalogue' && AV.length) ? 'on' : '') + '" data-tab="' + x + '">' + esc(tabLabel(x)) + badge(x) + '</button>'
        + (x === 'catalogue' && CFG[ID].avail ? sub('stock', 'avStock') + sub('produce', 'avProduce') : '')).join('');
      sb.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => go(b.dataset.tab));
      sb.querySelectorAll('[data-av]').forEach(b => b.onclick = () => openCatalogue({ av: b.dataset.av }));
    }
  }
  function go(tab){ TAB = tab; buildNav(); chrome(); render(); window.scrollTo(0, 0); }

  function chrome(){
    $('seg').textContent = title();
    $('main').classList.toggle('nosidebar', !CFG[ID].side);
    $('h1').textContent = tabLabel(TAB);
    $('av').textContent = PW.initials(PW.email || '?');
    document.title = 'Precious Woods · ' + title();
  }
  function redraw(){ chrome(); buildNav(); render(); }

  /* ---------- start ---------- */
  async function boot(id){
    ID = id;
    document.documentElement.lang = PW.prefs.lang;
    $('gatemsg').textContent = t('checking');

    const c = await PW.connect();
    if(!c.ok){
      gate(shell('<h2>' + esc(t('offlineT')) + '</h2><p>' + esc(t('offlineB')) + '</p>'
        + '<button onclick="location.reload()">' + esc(t('retry')) + '</button>'));
      wireLang(() => location.reload());
      return;
    }
    if(!c.session){ loginScreen(); return; }
    await PW.loadPrefs();
    document.documentElement.lang = PW.prefs.lang;

    if(ID === 'sales'){
      const [sp, se, dc] = await Promise.all([
        PW.sb.from('spaces').select('id,name,sort').order('sort'),
        PW.sb.from('sections').select('id,space,name,nav,sort').order('sort'),
        PW.sb.from('doc_index').select('*')
      ]);
      if(sp.error){ loginScreen(t('loadFail', sp.error.message)); return; }
      SPACES = sp.data || []; SECTIONS = se.data || []; DOCS = dc.data || [];
      if(!SPACES.length){ noAccessScreen(); return; }
    }

    if(ID === 'sales') await loadOrdersData();
    ungate(); $('main').hidden = false;
    redraw();
    PW.mountSettings({ current: ID, onLang: redraw });
  }

  return { boot };
})();
