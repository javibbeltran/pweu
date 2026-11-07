/* ============================================================
   Precious Woods · Sales and Customer portals
   Same login, preferences and settings panel as the Operations
   portal (shared.js). Each portal is a thin page that calls
   PWLite.boot('sales') or PWLite.boot('customer').
   ============================================================ */
window.PWLite = (function () {

  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const t = (...a) => PW.t(...a);

  let ID = 'sales', TAB = null;
  let SPACES = [], SECTIONS = [], DOCS = [];

  const title = () => t(ID === 'sales' ? 'pSales' : 'pCustomer');

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

  /* ---------- data (Sales only; Customer has none yet) ---------- */
  const hrefOf = d => d.url ? d.url : '../doc.html?doc=' + encodeURIComponent(d.slug);
  const isExternal = d => d.kind === 'link' && d.url;
  const spaceName = id => (SPACES.find(s => s.id === id) || {}).name || '';

  function salesTabs(){
    const names = [];
    SECTIONS.filter(s => s.nav === 'commercial').forEach(s => { if(!names.includes(s.name)) names.push(s.name); });
    return names.map(n => ({ id: 'sec:' + n, label: n })).concat([{ id: 'flow', label: t('flow') }]);
  }
  function customerTabs(){
    return [{ id: 'orders', label: t('orders') }, { id: 'docs', label: t('documents') }];
  }
  const tabs = () => ID === 'sales' ? salesTabs() : customerTabs();

  /* ---------- rendering ---------- */
  function docCard(d){
    const vacio = !d.has_content && d.kind === 'diagram';
    return '<a class="card' + (vacio ? ' empty' : '') + '" href="' + esc(hrefOf(d)) + '"'
      + (isExternal(d) ? ' target="_blank" rel="noopener"' : '') + '>'
      + '<p class="t">' + esc(d.title)
        + (vacio ? ' <span class="tag">' + esc(t('empty')) + '</span>' : '')
        + (isExternal(d) ? ' <span class="tag">' + esc(t('link')) + '</span>' : '') + '</p>'
      + (d.subtitle ? '<p class="d">' + esc(d.subtitle) + '</p>' : '') + '</a>';
  }
  const none = key => '<p class="none">' + esc(t(key)) + '</p>';

  function renderSales(){
    let h = '';
    if(TAB === 'flow'){
      const list = DOCS.filter(d => d.kind === 'diagram');
      h = '<section class="sec"><h2>' + esc(t('flow')) + '</h2>'
        + (list.length ? '<div class="grid">' + list.map(d => docCard(d)).join('') + '</div>' : none('nothingHere'))
        + '</section>';
    } else {
      const name = (TAB || '').replace(/^sec:/, '');
      const secs = SECTIONS.filter(s => s.nav === 'commercial' && s.name === name);
      h = secs.map(sec => {
        const list = DOCS.filter(d => d.section === sec.id).sort((a, b) => (a.sort || 0) - (b.sort || 0));
        return '<section class="sec"><h2>' + esc(spaceName(sec.space) + ' · ' + sec.name) + '</h2>'
          + (list.length ? '<div class="grid">' + list.map(d => docCard(d)).join('') + '</div>' : none('nothingHere'))
          + '</section>';
      }).join('');
    }
    $('content').innerHTML = h || none('nothingHere');
  }
  function renderCustomer(){
    $('content').innerHTML = '<section class="sec"><h2>' + esc(t(TAB === 'orders' ? 'orders' : 'documents')) + '</h2>'
      + none(TAB === 'orders' ? 'ordersEmpty' : 'docsEmpty') + '</section>';
  }
  const render = () => ID === 'sales' ? renderSales() : renderCustomer();

  function buildNav(){
    const ts = tabs();
    if(!ts.find(x => x.id === TAB)) TAB = ts[0] && ts[0].id;
    $('nav').innerHTML = ts.map(x =>
      '<button data-tab="' + esc(x.id) + '" aria-expanded="' + (x.id === TAB) + '">' + esc(x.label) + '</button>').join('');
    $('nav').querySelectorAll('button').forEach(b => b.onclick = () => { TAB = b.dataset.tab; buildNav(); render(); });
  }

  function chrome(){
    $('seg').textContent = title();
    $('h1').textContent = title();
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

    ungate(); $('main').hidden = false;
    redraw();
    PW.mountSettings({ current: ID, onLang: redraw });
  }

  return { boot };
})();
