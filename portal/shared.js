/* ============================================================
   Precious Woods · Operations portal
   Shared layer: connection, session, preferences, i18n, theme.
   ============================================================ */
window.PW = (function () {

  const SB_URL = 'https://idbammhbxqpkggpldwvr.supabase.co';
  const SB_KEY = 'sb_publishable_idFGGSO4ZSwwMwcEzLsapQ_MrDtt0OO';

  /* ---------- languages ---------- */
  const LANGS = [
    ['en',    'English'],
    ['nl',    'Nederlands'],
    ['de',    'Deutsch'],
    ['fr',    'Français'],
    ['pt-BR', 'Português (BR)'],
    ['es',    'Español'],
    ['it',    'Italiano']
  ];

  const T = {
    en: {
      portal:'Operations', signin:'Sign in', signout:'Sign out',
      emailLabel:'Work email', sendLink:'Send access link',
      loginLead:'Enter your email and we will send you an access link. No password to remember.',
      sending:'Sending…', sent:'Check your inbox at {0} and open the link we just sent.',
      sendFail:'Could not send the link: {0}',
      checking:'Checking your access…',
      noAccessT:'No access yet', noAccessB:'Your account {0} has not been given access to any company.',
      noAccessH:'Ask Javi to add you, then sign in again.',
      offlineT:'Cannot connect', offlineB:'The access library did not load. Usually the connection, or a browser blocker.',
      retry:'Retry',
      company:'Company', language:'Language', appearance:'Appearance', accent:'Accent colour',
      system:'System', light:'Light', dark:'Dark', preferences:'Preferences', account:'Account',
      canEdit:'Can edit', readOnly:'Read only',
      updated:'Updated', empty:'Empty', link:'Link',
      noContent:'No content yet', nothingHere:'Nothing here yet',
      noSections:'This company has no sections yet.',
      back:'Operations', close:'Close', saving:'Saving…', saved:'Saved',
      savedAll:'Saved · visible to the whole team',
      loadFail:'Could not load: {0}', saveFail:'Could not save ({0}). Your changes are still in this browser.',
      lastChange:'Last change',
      navoperations:'Operations', navcommercial:'Commercial', navcompliance:'Compliance', navprojects:'Projects', navsystems:'Systems', home:'Home', search:'Search', searchPh:'Search documents…', noResults:'Nothing matches that.', items:'{0} items', item:'1 item', openAll:'View all', recent:'Recently updated'
    },
    nl: {
      portal:'Operaties', signin:'Inloggen', signout:'Uitloggen',
      emailLabel:'Werk e-mail', sendLink:'Toegangslink sturen',
      loginLead:'Vul je e-mailadres in en we sturen je een toegangslink. Geen wachtwoord nodig.',
      sending:'Versturen…', sent:'Kijk in je inbox op {0} en open de link die we net hebben gestuurd.',
      sendFail:'Kon de link niet versturen: {0}',
      checking:'Je toegang wordt gecontroleerd…',
      noAccessT:'Nog geen toegang', noAccessB:'Je account {0} heeft nog geen toegang tot een bedrijf.',
      noAccessH:'Vraag Javi je toe te voegen en log daarna opnieuw in.',
      offlineT:'Geen verbinding', offlineB:'De toegangsbibliotheek is niet geladen. Meestal de verbinding of een blocker in de browser.',
      retry:'Opnieuw',
      company:'Bedrijf', language:'Taal', appearance:'Weergave', accent:'Accentkleur',
      system:'Systeem', light:'Licht', dark:'Donker', preferences:'Voorkeuren', account:'Account',
      canEdit:'Kan bewerken', readOnly:'Alleen lezen',
      updated:'Bijgewerkt', empty:'Leeg', link:'Link',
      noContent:'Nog geen inhoud', nothingHere:'Hier staat nog niets',
      noSections:'Dit bedrijf heeft nog geen secties.',
      back:'Operaties', close:'Sluiten', saving:'Opslaan…', saved:'Opgeslagen',
      savedAll:'Opgeslagen · zichtbaar voor het hele team',
      loadFail:'Kon niet laden: {0}', saveFail:'Kon niet opslaan ({0}). Je wijzigingen staan nog in deze browser.',
      lastChange:'Laatste wijziging',
      navoperations:'Operaties', navcommercial:'Commercieel', navcompliance:'Compliance', navprojects:'Projecten', navsystems:'Systemen', home:'Start', search:'Zoeken', searchPh:'Documenten zoeken…', noResults:'Niets gevonden.', items:'{0} items', item:'1 item', openAll:'Alles bekijken', recent:'Recent bijgewerkt'
    },
    de: {
      portal:'Operations', signin:'Anmelden', signout:'Abmelden',
      emailLabel:'Geschäftliche E-Mail', sendLink:'Zugangslink senden',
      loginLead:'Gib deine E-Mail-Adresse ein und wir senden dir einen Zugangslink. Kein Passwort nötig.',
      sending:'Wird gesendet…', sent:'Sieh in deinem Postfach {0} nach und öffne den Link.',
      sendFail:'Link konnte nicht gesendet werden: {0}',
      checking:'Zugang wird geprüft…',
      noAccessT:'Noch kein Zugang', noAccessB:'Dein Konto {0} hat noch keinen Zugang zu einem Unternehmen.',
      noAccessH:'Bitte Javi, dich freizuschalten, und melde dich erneut an.',
      offlineT:'Keine Verbindung', offlineB:'Die Zugangsbibliothek wurde nicht geladen. Meist die Verbindung oder ein Browser-Blocker.',
      retry:'Erneut versuchen',
      company:'Unternehmen', language:'Sprache', appearance:'Darstellung', accent:'Akzentfarbe',
      system:'System', light:'Hell', dark:'Dunkel', preferences:'Einstellungen', account:'Konto',
      canEdit:'Kann bearbeiten', readOnly:'Nur lesen',
      updated:'Aktualisiert', empty:'Leer', link:'Link',
      noContent:'Noch kein Inhalt', nothingHere:'Hier ist noch nichts',
      noSections:'Dieses Unternehmen hat noch keine Bereiche.',
      back:'Operations', close:'Schließen', saving:'Speichern…', saved:'Gespeichert',
      savedAll:'Gespeichert · für das ganze Team sichtbar',
      loadFail:'Konnte nicht geladen werden: {0}', saveFail:'Konnte nicht gespeichert werden ({0}). Deine Änderungen sind noch in diesem Browser.',
      lastChange:'Letzte Änderung',
      navoperations:'Operations', navcommercial:'Vertrieb', navcompliance:'Compliance', navprojects:'Projekte', navsystems:'Systeme', home:'Start', search:'Suche', searchPh:'Dokumente suchen…', noResults:'Keine Treffer.', items:'{0} Einträge', item:'1 Eintrag', openAll:'Alle ansehen', recent:'Zuletzt aktualisiert'
    },
    fr: {
      portal:'Opérations', signin:'Se connecter', signout:'Se déconnecter',
      emailLabel:'E-mail professionnel', sendLink:'Envoyer le lien',
      loginLead:'Saisis ton e-mail et nous t’envoyons un lien d’accès. Aucun mot de passe à retenir.',
      sending:'Envoi…', sent:'Consulte ta boîte {0} et ouvre le lien que nous venons d’envoyer.',
      sendFail:'Impossible d’envoyer le lien : {0}',
      checking:'Vérification de ton accès…',
      noAccessT:'Pas encore d’accès', noAccessB:'Ton compte {0} n’a accès à aucune société.',
      noAccessH:'Demande à Javi de t’ajouter, puis reconnecte-toi.',
      offlineT:'Connexion impossible', offlineB:'La bibliothèque d’accès n’a pas chargé. Souvent la connexion, ou un bloqueur du navigateur.',
      retry:'Réessayer',
      company:'Société', language:'Langue', appearance:'Apparence', accent:'Couleur d’accent',
      system:'Système', light:'Clair', dark:'Sombre', preferences:'Préférences', account:'Compte',
      canEdit:'Peut modifier', readOnly:'Lecture seule',
      updated:'Mis à jour', empty:'Vide', link:'Lien',
      noContent:'Pas encore de contenu', nothingHere:'Rien ici pour le moment',
      noSections:'Cette société n’a pas encore de sections.',
      back:'Opérations', close:'Fermer', saving:'Enregistrement…', saved:'Enregistré',
      savedAll:'Enregistré · visible par toute l’équipe',
      loadFail:'Chargement impossible : {0}', saveFail:'Enregistrement impossible ({0}). Tes modifications restent dans ce navigateur.',
      lastChange:'Dernière modification',
      navoperations:'Opérations', navcommercial:'Commercial', navcompliance:'Conformité', navprojects:'Projets', navsystems:'Systèmes', home:'Accueil', search:'Rechercher', searchPh:'Rechercher des documents…', noResults:'Aucun résultat.', items:'{0} éléments', item:'1 élément', openAll:'Tout voir', recent:'Mis à jour récemment'
    },
    'pt-BR': {
      portal:'Operações', signin:'Entrar', signout:'Sair',
      emailLabel:'E-mail corporativo', sendLink:'Enviar link de acesso',
      loginLead:'Informe seu e-mail e enviaremos um link de acesso. Sem senha para lembrar.',
      sending:'Enviando…', sent:'Confira sua caixa de entrada em {0} e abra o link que acabamos de enviar.',
      sendFail:'Não foi possível enviar o link: {0}',
      checking:'Verificando seu acesso…',
      noAccessT:'Ainda sem acesso', noAccessB:'Sua conta {0} ainda não tem acesso a nenhuma empresa.',
      noAccessH:'Peça ao Javi para incluir você e entre novamente.',
      offlineT:'Não foi possível conectar', offlineB:'A biblioteca de acesso não carregou. Geralmente é a conexão ou um bloqueador do navegador.',
      retry:'Tentar de novo',
      company:'Empresa', language:'Idioma', appearance:'Aparência', accent:'Cor de destaque',
      system:'Sistema', light:'Claro', dark:'Escuro', preferences:'Preferências', account:'Conta',
      canEdit:'Pode editar', readOnly:'Somente leitura',
      updated:'Atualizado', empty:'Vazio', link:'Link',
      noContent:'Ainda sem conteúdo', nothingHere:'Nada aqui ainda',
      noSections:'Esta empresa ainda não tem seções.',
      back:'Operações', close:'Fechar', saving:'Salvando…', saved:'Salvo',
      savedAll:'Salvo · visível para toda a equipe',
      loadFail:'Não foi possível carregar: {0}', saveFail:'Não foi possível salvar ({0}). Suas alterações continuam neste navegador.',
      lastChange:'Última alteração',
      navoperations:'Operações', navcommercial:'Comercial', navcompliance:'Compliance', navprojects:'Projetos', navsystems:'Sistemas', home:'Início', search:'Buscar', searchPh:'Buscar documentos…', noResults:'Nada encontrado.', items:'{0} itens', item:'1 item', openAll:'Ver tudo', recent:'Atualizados recentemente'
    },
    es: {
      portal:'Operaciones', signin:'Entrar', signout:'Salir',
      emailLabel:'Correo de trabajo', sendLink:'Enviar enlace de acceso',
      loginLead:'Introduce tu correo y te enviamos un enlace de acceso. No hay contraseña que recordar.',
      sending:'Enviando…', sent:'Abre el enlace que acabamos de enviar a {0}.',
      sendFail:'No se ha podido enviar el enlace: {0}',
      checking:'Comprobando tu acceso…',
      noAccessT:'Sin acceso todavía', noAccessB:'Tu cuenta {0} no tiene acceso a ninguna empresa.',
      noAccessH:'Pídele a Javi que te dé de alta y vuelve a entrar.',
      offlineT:'No se ha podido conectar', offlineB:'No ha cargado la librería de acceso. Suele ser la conexión, o un bloqueador del navegador.',
      retry:'Reintentar',
      company:'Empresa', language:'Idioma', appearance:'Apariencia', accent:'Color de acento',
      system:'Sistema', light:'Claro', dark:'Oscuro', preferences:'Preferencias', account:'Cuenta',
      canEdit:'Puedes editar', readOnly:'Solo lectura',
      updated:'Actualizado', empty:'Vacío', link:'Enlace',
      noContent:'Sin contenido todavía', nothingHere:'Nada aquí todavía',
      noSections:'Esta empresa todavía no tiene secciones.',
      back:'Operaciones', close:'Cerrar', saving:'Guardando…', saved:'Guardado',
      savedAll:'Guardado · visible para todo el equipo',
      loadFail:'No se ha podido cargar: {0}', saveFail:'No se ha podido guardar ({0}). Tus cambios siguen en este navegador.',
      lastChange:'Último cambio',
      navoperations:'Operaciones', navcommercial:'Comercial', navcompliance:'Cumplimiento', navprojects:'Proyectos', navsystems:'Sistemas', home:'Inicio', search:'Buscar', searchPh:'Buscar documentos…', noResults:'No hay coincidencias.', items:'{0} elementos', item:'1 elemento', openAll:'Ver todo', recent:'Actualizados hace poco'
    },
    it: {
      portal:'Operazioni', signin:'Accedi', signout:'Esci',
      emailLabel:'E-mail di lavoro', sendLink:'Invia link di accesso',
      loginLead:'Inserisci la tua e-mail e ti invieremo un link di accesso. Nessuna password da ricordare.',
      sending:'Invio…', sent:'Controlla la casella {0} e apri il link che abbiamo appena inviato.',
      sendFail:'Impossibile inviare il link: {0}',
      checking:'Verifica dell’accesso…',
      noAccessT:'Nessun accesso', noAccessB:'Il tuo account {0} non ha accesso a nessuna azienda.',
      noAccessH:'Chiedi a Javi di aggiungerti e accedi di nuovo.',
      offlineT:'Impossibile connettersi', offlineB:'La libreria di accesso non si è caricata. Di solito è la connessione o un blocco del browser.',
      retry:'Riprova',
      company:'Azienda', language:'Lingua', appearance:'Aspetto', accent:'Colore accento',
      system:'Sistema', light:'Chiaro', dark:'Scuro', preferences:'Preferenze', account:'Account',
      canEdit:'Puoi modificare', readOnly:'Sola lettura',
      updated:'Aggiornato', empty:'Vuoto', link:'Link',
      noContent:'Ancora nessun contenuto', nothingHere:'Qui non c’è ancora nulla',
      noSections:'Questa azienda non ha ancora sezioni.',
      back:'Operazioni', close:'Chiudi', saving:'Salvataggio…', saved:'Salvato',
      savedAll:'Salvato · visibile a tutto il team',
      loadFail:'Impossibile caricare: {0}', saveFail:'Impossibile salvare ({0}). Le modifiche restano in questo browser.',
      lastChange:'Ultima modifica',
      navoperations:'Operazioni', navcommercial:'Commerciale', navcompliance:'Conformità', navprojects:'Progetti', navsystems:'Sistemi', home:'Home', search:'Cerca', searchPh:'Cerca documenti…', noResults:'Nessun risultato.', items:'{0} elementi', item:'1 elemento', openAll:'Vedi tutto', recent:'Aggiornati di recente'
    }
  };

  /* ---------- strings for the portal switcher and the Sales / Customer portals ---------- */
  const T2 = {
    en:      { portals:'Portals', pOperations:'Operations', pSales:'Sales', pCustomer:'Customer', settings:'Settings', orders:'My orders', ordersEmpty:'Your orders will appear here.', documents:'Documents', docsEmpty:'Documents shared with you will appear here.', flow:'Process flow' },
    nl:      { portals:'Portalen', pOperations:'Operaties', pSales:'Verkoop', pCustomer:'Klant', settings:'Instellingen', orders:'Mijn bestellingen', ordersEmpty:'Je bestellingen verschijnen hier.', documents:'Documenten', docsEmpty:'Met jou gedeelde documenten verschijnen hier.', flow:'Procesflow' },
    de:      { portals:'Portale', pOperations:'Operations', pSales:'Vertrieb', pCustomer:'Kunde', settings:'Einstellungen', orders:'Meine Bestellungen', ordersEmpty:'Deine Bestellungen erscheinen hier.', documents:'Dokumente', docsEmpty:'Mit dir geteilte Dokumente erscheinen hier.', flow:'Prozessablauf' },
    fr:      { portals:'Portails', pOperations:'Opérations', pSales:'Ventes', pCustomer:'Client', settings:'Paramètres', orders:'Mes commandes', ordersEmpty:'Tes commandes apparaîtront ici.', documents:'Documents', docsEmpty:'Les documents partagés avec toi apparaîtront ici.', flow:'Flux de processus' },
    'pt-BR': { portals:'Portais', pOperations:'Operações', pSales:'Vendas', pCustomer:'Cliente', settings:'Configurações', orders:'Meus pedidos', ordersEmpty:'Seus pedidos aparecerão aqui.', documents:'Documentos', docsEmpty:'Os documentos compartilhados com você aparecerão aqui.', flow:'Fluxo de processo' },
    es:      { portals:'Portales', pOperations:'Operaciones', pSales:'Ventas', pCustomer:'Cliente', settings:'Ajustes', orders:'Mis pedidos', ordersEmpty:'Tus pedidos aparecerán aquí.', documents:'Documentos', docsEmpty:'Los documentos compartidos contigo aparecerán aquí.', flow:'Flujo de proceso' },
    it:      { portals:'Portali', pOperations:'Operazioni', pSales:'Vendite', pCustomer:'Cliente', settings:'Impostazioni', orders:'I miei ordini', ordersEmpty:'I tuoi ordini appariranno qui.', documents:'Documenti', docsEmpty:'I documenti condivisi con te appariranno qui.', flow:'Flusso di processo' }
  };
  Object.keys(T2).forEach(l => Object.assign(T[l], T2[l]));

  /* ---------- preferences ---------- */
  const DEF = { lang:'en', theme:'system', accent:'#00A65C', space:null };
  let prefs = Object.assign({}, DEF);

  function readLocal(){
    try{
      const r = localStorage.getItem('pw-prefs');
      if(r) Object.assign(prefs, JSON.parse(r));
    }catch(e){}
    if(!T[prefs.lang]) prefs.lang = 'en';
  }
  function writeLocal(){
    try{ localStorage.setItem('pw-prefs', JSON.stringify(prefs)); }catch(e){}
  }

  function t(key, ...args){
    const dict = T[prefs.lang] || T.en;
    let s = dict[key] != null ? dict[key] : (T.en[key] != null ? T.en[key] : key);
    args.forEach((a,i)=>{ s = s.split('{'+i+'}').join(a); });
    return s;
  }

  /* ---------- theme ---------- */
  function applyTheme(){
    const r = document.documentElement;
    r.setAttribute('data-theme', prefs.theme === 'system' ? 'auto' : prefs.theme);
    r.style.setProperty('--accent', prefs.accent || DEF.accent);
    const m = document.querySelector('meta[name="theme-color"]');
    if(m) m.setAttribute('content', resolved() === 'dark' ? '#121513' : '#f6f5f2');
  }
  function resolved(){
    if(prefs.theme === 'light' || prefs.theme === 'dark') return prefs.theme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  /* ---------- connection ---------- */
  let sb = null, session = null;

  function addScript(src){
    return new Promise(r=>{
      const n=document.createElement('script');
      n.src=src; n.onload=()=>r(1); n.onerror=()=>r(0);
      document.head.appendChild(n);
    });
  }
  async function waitLib(){
    for(let i=0;i<40;i++){
      if(window.supabase && window.supabase.createClient) return true;
      await new Promise(r=>setTimeout(r,150));
    }
    await addScript('https://unpkg.com/@supabase/supabase-js@2.45.4/dist/umd/supabase.js');
    return !!(window.supabase && window.supabase.createClient);
  }

  async function connect(){
    if(!(await waitLib())) return { ok:false, reason:'lib' };
    sb = window.supabase.createClient(SB_URL, SB_KEY);
    const { data } = await sb.auth.getSession();
    session = data.session || null;
    return { ok:true, session };
  }

  async function loadPrefs(){
    if(!session) return;
    try{
      const { data } = await sb.from('user_prefs').select('space,lang,theme,accent')
        .eq('email', session.user.email).maybeSingle();
      if(data){
        let changed = false;
        ['space','lang','theme','accent'].forEach(k=>{
          if(data[k] && !localStorage.getItem('pw-prefs')) { prefs[k]=data[k]; changed = true; }
        });
        if(changed){ writeLocal(); applyTheme(); }
      }
    }catch(e){}
  }

  function setPref(k, v){
    prefs[k] = v; writeLocal(); applyTheme();
    if(sb && session){
      sb.from('user_prefs').upsert({
        email: session.user.email, space: prefs.space, lang: prefs.lang,
        theme: prefs.theme, accent: prefs.accent, updated_at: new Date().toISOString()
      }).then(()=>{}, ()=>{});
    }
  }

  async function signIn(email){
    const url = location.href.split('#')[0].split('?')[0];
    return sb.auth.signInWithOtp({ email, options:{ emailRedirectTo: url } });
  }
  async function signOut(){ if(sb) await sb.auth.signOut(); }

  /* A page that already made its own client can hand it over, so the
     preferences still sync to the user's account. */
  function adopt(client, sess){ sb = client; session = sess || null; }

  /* ---------- portal switcher + shared settings panel ---------- */
  const BASE = (function(){
    const m = location.pathname.match(/^(.*\/portal\/)/);
    return m ? m[1] : '/portal/';
  })();
  const PORTALS = [
    ['operations', 'pOperations', ''],
    ['sales',      'pSales',      'sales/'],
    ['customer',   'pCustomer',   'customer/']
  ];
  const ACCENTS = ['#00a65c','#2f7d55','#6b7f3a','#8a6a3b','#3a6b7d','#54595f'];
  const esc = s => String(s==null?'':s).replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  function initials(em){
    const n = String(em||'?').split('@')[0].replace(/[._-]+/g,' ').trim().split(' ').filter(Boolean);
    return ((n[0]||'?')[0] + ((n[1]||'')[0]||'')).toUpperCase();
  }

  function portalsHtml(current){
    return '<h4>'+esc(t('portals'))+'</h4><div class="plist">'
      + PORTALS.map(([id,key,path]) =>
          '<a href="'+esc(BASE+path)+'"'+(id===current?' aria-current="page"':'')+'>'+esc(t(key))+'</a>').join('')
      + '</div>';
  }

  /* o: { btn, panel, current, email, sub, top(), onLang(), admin, adminHref }
     Language, appearance, accent colour, portal switcher and sign out.
     English unless the user has chosen otherwise. */
  function mountSettings(o){
    o = o || {};
    const btn = document.getElementById(o.btn || 'userbtn');
    const p   = document.getElementById(o.panel || 'panel');
    if(!btn || !p) return;
    const who = () => o.email || (session ? session.user.email : '');

    function render(){
      p.innerHTML =
        '<div class="who"><b>'+esc(who())+'</b>'+(o.sub?'<span>'+esc(o.sub)+'</span>':'')+'</div>'
        + (o.top ? o.top() : '')
        + portalsHtml(o.current)
        + '<h4>'+esc(t('language'))+'</h4><select id="pw-lang">'
          + LANGS.map(([c,n]) => '<option value="'+c+'"'+(c===prefs.lang?' selected':'')+'>'+n+'</option>').join('')
          + '</select>'
        + '<h4>'+esc(t('appearance'))+'</h4><div class="seg3">'
          + [['system',t('system')],['light',t('light')],['dark',t('dark')]]
            .map(([v,l]) => '<button data-pwtheme="'+v+'" aria-pressed="'+(prefs.theme===v)+'">'+esc(l)+'</button>').join('')
          + '</div>'
        + '<h4>'+esc(t('accent'))+'</h4><div class="swatches">'
          + ACCENTS.map(c => '<button data-pwacc="'+c+'" style="background:'+c+'" aria-label="'+c+'" aria-pressed="'
              + ((prefs.accent||'').toLowerCase()===c)+'"></button>').join('')
          + '<input type="color" id="pw-acc" value="'+esc(prefs.accent||DEF.accent)+'"></div>'
        + '<div class="foot">'
          + (o.admin ? '<button id="pw-admin">Administration</button>' : '')
          + '<button id="pw-out">'+esc(t('signout'))+'</button></div>';

      p.querySelector('#pw-lang').onchange = e => {
        setPref('lang', e.target.value);
        document.documentElement.lang = e.target.value;
        render();
        if(o.onLang) o.onLang();
      };
      p.querySelectorAll('[data-pwtheme]').forEach(b => b.onclick = () => { setPref('theme', b.dataset.pwtheme); render(); });
      p.querySelectorAll('[data-pwacc]').forEach(b => b.onclick = () => { setPref('accent', b.dataset.pwacc); render(); });
      p.querySelector('#pw-acc').oninput = e => setPref('accent', e.target.value);
      const a = p.querySelector('#pw-admin');
      if(a) a.onclick = () => { location.href = o.adminHref || (BASE + 'admin.html'); };
      p.querySelector('#pw-out').onclick = async () => { await signOut(); location.reload(); };
    }

    function toggle(open){
      const show = open === undefined ? !p.classList.contains('open') : open;
      p.classList.toggle('open', show);
      btn.setAttribute('aria-expanded', String(show));
    }

    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.onclick = e => { e.stopPropagation(); toggle(); };
    p.onclick = e => e.stopPropagation();
    document.addEventListener('click', () => toggle(false));
    document.addEventListener('keydown', e => { if(e.key === 'Escape') toggle(false); });
    render();
    return { render, toggle };
  }

  readLocal();
  applyTheme();
  if(window.matchMedia){
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    if(mq.addEventListener) mq.addEventListener('change', ()=>{ if(prefs.theme==='system') applyTheme(); });
  }

  return {
    LANGS, T, t, prefs, setPref, applyTheme, resolved,
    connect, loadPrefs, signIn, signOut, adopt,
    BASE, PORTALS, initials, portalsHtml, mountSettings,
    get sb(){ return sb; },
    get session(){ return session; },
    get email(){ return session ? session.user.email : null; }
  };
})();
