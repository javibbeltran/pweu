# Builds single-file demo pages (stubbed Supabase, sample data, forms inlined) from the real portal sources.
# Usage:  python3 tools/build-demo/build.py demo    -> writes salesportal/index.html (public open demo, no login)
#         python3 tools/build-demo/build.py          -> writes operations/sales/customer .html into tools/build-demo/out/
#         python3 tools/build-demo/build.py links    -> same, with links from links.json (claude.ai artifact links)
import re, json, sys, os
HERE=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(HERE,'..','..'))
R=os.path.join(REPO,'portal')+os.sep
OUT=os.path.join(HERE,'out'); os.makedirs(OUT,exist_ok=True)
rd=lambda p: open(R+p,encoding='utf8').read()
links=json.load(open(os.path.join(HERE,'links.json'))) if len(sys.argv)>1 and sys.argv[1]=='links' else {}

css = rd('pw.css').replace('@import url("settings.css");','') + rd('settings.css')
css_lite = css + rd('portal-lite.css')
species = json.load(open(R+'data/species.json'))
sections=[('pweu-acadon','pweu','Acadon','systems'),('pweu-catalogue','pweu','Catalogue','commercial'),('pweu-dd','pweu','Due Diligence','compliance'),
 ('pweu-flows','pweu','Workflows','operations'),('pweu-forms','pweu','Forms','operations'),('pweu-lks','pweu','Lesser Known Species','projects'),
 ('pweu-mkt','pweu','Marketing','commercial'),('pweu-ops','pweu','Operation chart','operations'),('pweu-sales','pweu','Sales','commercial'),
 ('pwh-acadon','pwh','Acadon','systems'),('pwh-catalogue','pwh','Catalogue','commercial'),('pwh-flows','pwh','Workflows','operations'),
 ('pwh-forms','pwh','Forms','operations'),('pwh-ops','pwh','Operation chart','operations')]
DATA={
 'spaces':[{'id':'pweu','name':'PWEU','sort':10},{'id':'pwh','name':'PWH','sort':20}],
 'sections':[{'id':i,'space':s,'name':n,'nav':nv,'sort':k+1,'icon':None,'nav_sort':None} for k,(i,s,n,nv) in enumerate(sections)],
 'doc_index':[
  {'slug':'customer-request','section':'pweu-forms','space':'pweu','kind':'form','title':'Request a new customer','subtitle':'Master data request, sent to the master data admin','url':'forms/customer-request.html','has_content':True,'sort':1},
  {'slug':'sop-pweu','section':'pweu-ops','space':'pweu','kind':'diagram','title':'PWEU — Order to Delivery','subtitle':'De la confirmacion del pedido a la entrega','url':None,'has_content':True,'sort':1},
  {'slug':'sop-pwh','section':'pwh-ops','space':'pwh','kind':'diagram','title':'PWH — Operational process','subtitle':'Pendiente de construir','url':None,'has_content':False,'sort':1}],
 'app_users':[{'role':'admin'}],'form_submissions':[]}

import random
rnd=random.Random(7)
EXTRA={}
REALX=json.load(open(R+'data/species-extra.json'))['species']
APPS_X={'1':['Flooring','Furniture','Joinery'],'2':['Windows','Cladding'],'3':['Decking','Fencing'],'4':['Bridges','Poles'],'5':['Piers','Marine works']}
for sp_ in species['species']:
    uc=str(sp_.get('useClass') or '')
    ap=APPS_X.get(uc[:1],['Joinery'])
    EXTRA[sp_['code']]={'price':{'value':rnd.choice([1050,1100,1150,1200,1250,1300,1350,1400,1450]),'unit':'m3','currency':'EUR'} if rnd.random()>.2 else None,
      'availability':REALX.get(sp_['code'],{}).get('availability','na'),
      'description':'Sample text: '+sp_['name']+' is used for '+', '.join(ap).lower()+'.'}
    if EXTRA[sp_['code']]['price'] is None: del EXTRA[sp_['code']]['price']
    _r=REALX.get(sp_['code'],{})
    for _k in ('applications','tags','description','image'):
        if _k in _r: EXTRA[sp_['code']][_k]=_r[_k]
XJ={'sample':True,'species':EXTRA}

codes=[x['code'] for x in species['species']]
CUS=[{'id':'c1','name':'Houtbedrijf De Vries','country':'Netherlands','status':'approved'},{'id':'c2','name':'Timberline GmbH','country':'Germany','status':'approved'},
 {'id':'c3','name':'Maison Duval','country':'France','status':'approved'},{'id':'c4','name':'Nordic Decking AB','country':'Sweden','status':'requested'}]
sts=['open','quote','transit','completed','partial','submitted','approved','transit']
ORD=[]
for i,st in enumerate(sts):
    c=CUS[i%4]; ls=[{'code':codes[(i*7+j*5)%len(codes)],'vol':10+i*3+j*4,'price':1050+j*100} for j in range(1+i%3)]
    ORD.append({'id':'so%d'%i,'ref':'Q-2026-%03d'%(i+1),'cust':c['id'],'custName':c['name'],'date':'2026-%02d-%02d'%(6+i//2,3+i*3),'status':st,'eta':'2026-%02d-%02d'%(10+i//3,4+i*3),'cur':'EUR','total':sum(l['vol']*l['price'] for l in ls),'lines':ls})
OJ={'sample':True,'customers':CUS,'orders':ORD}

DLJ={'groups':[{'name':'Catalogues','items':[{'title':'Precious Woods product catalogue','desc':'Sample entry','updated':'Updated: to add','url':None}]},
 {'name':'Commercial tools','items':[{'title':'Price list (current)','desc':'Sample entry','updated':'Updated: to add','url':None},{'title':'Quote template','desc':'Sample entry','url':None}]}]}

FEATJ=json.load(open(R+'data/featured.json'))

STUB_T = """
window.__PW_LINKS=%s;
window.__PREVIEW=true;
(function(){
 var DATA=%s, SPECIES=%s, XTRA=%s, ORDJ=%s, DLJ=%s, FEATJ=%s;
 var of=window.fetch;
 window.fetch=function(u,o){ if(/featured\\.json/.test(String(u))) return Promise.resolve(new Response(JSON.stringify(FEATJ),{status:200,headers:{'Content-Type':'application/json'}})); if(/downloads\\.json/.test(String(u))) return Promise.resolve(new Response(JSON.stringify(DLJ),{status:200,headers:{'Content-Type':'application/json'}})); if(/orders\\.json/.test(String(u))) return Promise.resolve(new Response(JSON.stringify(ORDJ),{status:200,headers:{'Content-Type':'application/json'}})); if(/species-extra\\.json/.test(String(u))) return Promise.resolve(new Response(JSON.stringify(XTRA),{status:200,headers:{'Content-Type':'application/json'}})); if(/species\\.json/.test(String(u))) return Promise.resolve(new Response(JSON.stringify(SPECIES),{status:200,headers:{'Content-Type':'application/json'}})); return of.apply(this,arguments); };
 window.supabase={createClient:function(){return {
  auth:{getSession:function(){return Promise.resolve({data:{session:{user:{email:'j.barredabeltran@gmail.com'}}}})},signOut:function(){return Promise.resolve({})},signInWithOtp:function(){return Promise.resolve({})}},
  from:function(tbl){var q={select:function(){return q},order:function(){return q},eq:function(){return q},update:function(){return q},
    upsert:function(){return Promise.resolve({})},
    maybeSingle:function(){return Promise.resolve({data:tbl==='user_prefs'?null:((DATA[tbl]||[])[0]||null)})},
    then:function(r,j){return Promise.resolve({data:DATA[tbl]||[],error:null,count:0}).then(r,j)}};return q},
  rpc:function(){return Promise.resolve({data:'editor'})}
 }}};
})();
"""
OPTS=[{"list":"language","value":"en","label":"English","sort":10},{"list":"segment","value":"PWH-GABON","label":"PWH-GABON","sort":10},{"list":"currency","value":"EUR","label":"EUR","sort":10},
 {"list":"terms","value":"CAD-15","label":"CAD-15 · Payment against copy documents, latest 15 days after shipment","sort":10},{"list":"shipment","value":"FOB LIB","label":"FOB LIB","sort":10},
 {"list":"country","value":"NL","label":"Netherlands","sort":10},{"list":"terms","value":"NET-14-ARR","label":"NET-14-ARR · Payment 14 days after arrival of the shipment","sort":20},
 {"list":"language","value":"fr","label":"French","sort":20},{"list":"currency","value":"USD","label":"USD","sort":20},{"list":"country","value":"DE","label":"Germany","sort":20},
 {"list":"country","value":"BE","label":"Belgium","sort":30},{"list":"language","value":"pt-BR","label":"Portuguese (Brazil)","sort":30},{"list":"country","value":"FR","label":"France","sort":40},
 {"list":"language","value":"nl","label":"Dutch","sort":40},{"list":"country","value":"ES","label":"Spain","sort":50},{"list":"country","value":"IT","label":"Italy","sort":60},
 {"list":"country","value":"PT","label":"Portugal","sort":70},{"list":"country","value":"GB","label":"United Kingdom","sort":80},{"list":"country","value":"BR","label":"Brazil","sort":90},
 {"list":"country","value":"GA","label":"Gabon","sort":100},{"list":"country","value":"CH","label":"Switzerland","sort":110}]
DATA_F=dict(DATA); DATA_F['docs']=[{'slug':'customer-request','space':'pweu','section':'pweu-sales','title':'Request a new customer'}]; DATA_F['options']=OPTS
def mk_stub(d): return STUB_T % (json.dumps(links), json.dumps(d), json.dumps(species), json.dumps(XJ), json.dumps(OJ), json.dumps(DLJ), json.dumps(FEATJ))
STUB = mk_stub(DATA); STUBF = mk_stub(DATA_F)

BANNER_CSS = """
#pvbadge{position:fixed;left:max(12px,env(safe-area-inset-left,0px));bottom:max(12px,env(safe-area-inset-bottom,0px));z-index:200;
 background:var(--surf);color:var(--mut);border:1px solid var(--ln2);border-radius:999px;padding:6px 13px;font-size:12px;box-shadow:0 4px 14px rgba(0,0,0,.25)}
#pvtoast{position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:201;background:var(--fg);color:var(--bg);border-radius:8px;padding:9px 15px;font-size:13px;max-width:90vw}
"""
BANNER_HTML = '<div id="pvbadge">Preview · sample data, no real login</div><div id="pvtoast" hidden></div>'
BANNER_JS = """
(function(){var tm;document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;
 var h=a.getAttribute('href');if(/^(https?:|blob:)/.test(h)||h.charAt(0)==='#')return;e.preventDefault();
 var t=document.getElementById('pvtoast');t.textContent='That page is not part of the preview.';t.hidden=false;clearTimeout(tm);tm=setTimeout(function(){t.hidden=true},2400)},true)})();
"""

def form_doc(name):
    h = rd('forms/'+name)
    inj = ''
    h = h.replace('<link rel="stylesheet" href="../pw.css">', '<style>'+css+'</style>')
    h = re.sub(r'<script src="https://cdn\.jsdelivr[^>]*></script>', '', h)
    h = h.replace('<script src="../shared.js"></script>', inj)
    h = h.replace('<html lang="en" data-theme="auto">', '<html lang="en" data-theme="auto" class="embed">')
    h = h.replace('src="../img/pw-mark.png"', 'src="data:image/png;base64,%s"' % PWMARK)
    return h
import base64
PWMARK = base64.b64encode(open(R+'img/pw-mark.png','rb').read()).decode()
FORMS_JS = 'window.__FORMS=' + json.dumps({'contractform': form_doc('contract-request.html'), 'customerform': form_doc('customer-request.html')}).replace('</','<\\/') + ';'

def build(src, out, title, use_lite):
    h = rd(src)
    body = re.search(r'<body>(.*)</body>', h, re.S).group(1)
    inline = [m for m in re.findall(r'<script>(.*?)</script>', body, re.S)]
    body = re.sub(r'<script[^>]*>.*?</script>', '', body, flags=re.S)
    body = body.replace('../img/pw-mark.png','img/pw-mark.png').replace('src="img/pw-mark.png"','src="img/pw-mark.png"')
    shared = rd('shared.js'); lite = rd('portal-lite.js') if use_lite else ''
    for s in (shared, lite, ''.join(inline)): assert '</script' not in s
    page = ('<title>%s</title>\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;500;600;700;800&family=Tinos:wght@400;700&display=swap">\n'
      '<style>%s%s</style>\n%s\n%s\n<script>%s</script>\n<script>%s</script>\n<script>%s</script>\n<script>%s</script>\n<script>%s</script>\n<script>%s</script>\n'
      ) % (title, css_lite if use_lite else css, BANNER_CSS, body, BANNER_HTML, (FORMS_JS if use_lite else ''), STUB, shared, lite, '\n'.join(inline), BANNER_JS)
    open(os.path.join(OUT,out),'w',encoding='utf8').write(page); print(out, len(page)//1024, 'KB')

build('index.html','operations.html','PWEU Operations Portal',False)
build('sales/index.html','sales.html','PWEU Sales Portal',True)
build('customer/index.html','customer.html','PWEU Customer Portal',True)

if len(sys.argv)>1 and sys.argv[1]=='demo':
    # open demo for GitHub Pages: not indexed, and BASE fallback points to /pweu/portal/
    page=open(os.path.join(OUT,'sales.html'),encoding='utf8').read()
    page=page.replace('<title>','<meta name="robots" content="noindex,nofollow">\n<title>',1)   # only the FIRST <title> (others sit inside inlined forms)
    page=page.replace("'/portal/'","'/pweu/portal/'",1)
    d=os.path.join(REPO,'salesportal'); os.makedirs(os.path.join(d,'img'),exist_ok=True)
    open(os.path.join(d,'index.html'),'w',encoding='utf8').write(page)
    import shutil; shutil.copy(R+'img/pw-mark.png',os.path.join(d,'img','pw-mark.png'))
    print('wrote salesportal/index.html')
