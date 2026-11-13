"""NazClic - genere le visualiseur 3D autonome (three.js inline, hors-ligne, mobile)."""
import json, os
from params import *
SP = '/tmp/claude-0/-home-user-Standard-Pick-Pack/71330834-d432-5fec-be1d-f94199d6e607/scratchpad/package'
here = os.path.dirname(__file__)
three = open(f'{SP}/build/three.min.js').read(); orbit = open(f'{SP}/examples/js/controls/OrbitControls.js').read()
meshes = open(f'{here}/../cad/maillages.json').read()
C = calc()
P = dict(COURSE=COURSE, GARDE_MIN=GARDE_MIN, GARDE_FIN=GARDE_FIN, SUR=SURCOURSE, X_SIEGE=X_SIEGE, X_COL=X_COL, R_DM=R_DM, R_D=R_D, R_N=R_N+2,
         X_DISQ=X_DISQ, DISQ_D=DISQ_D, X_TIP=X_DISQ+DISQ_EP+COU_L+TETE_L+CIRE_EP, PIV_X=X_COL-COL_EP, PIV_Z=sum(LAME_Z)/2,
         LATCH=(DENT_Z-CAN_Z/2)/C['g_L'], BAR0=F2_X[1]-DENT_X[1], BAR1=F1_X[0]-DENT_X[0], Fa=round(C['F_arme'], 1), Fr=round(C['F_repos'], 1), Fg=round(C['F_gach'][1], 1), Fi=round(C['F_insert'], 1))
html = r'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<title>NazClic - visualiseur 3D</title><style>
html,body{margin:0;height:100%;overflow:hidden;background:#12161c;color:#e8edf2;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
#c{position:fixed;inset:0;width:100%;height:100%;touch-action:none}
#hud{position:fixed;top:0;left:0;right:0;padding:10px 12px;background:linear-gradient(#12161cee,#12161c00);pointer-events:none}
#hud h1{font-size:15px;margin:0 0 4px;font-weight:650}#ph{font-size:14px;color:#ffd166;min-height:36px;line-height:1.25}
#kv{font-size:12px;color:#9fb0c0;margin-top:4px}#kv b{color:#7ee0a1}
#ui{position:fixed;left:0;right:0;bottom:0;padding:8px 10px calc(8px + env(safe-area-inset-bottom));background:#1a2029ee;border-top:1px solid #2c3644}
.row{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:4px 0}
button{flex:1 1 auto;min-height:40px;border:1px solid #33404f;background:#243040;color:#e8edf2;border-radius:8px;font-size:13px;padding:6px 8px}
button.on{background:#2f6f4f;border-color:#3f9a6c}button.pri{background:#b5651d;border-color:#d98a3d;font-weight:650}
label{font-size:12px;color:#9fb0c0;white-space:nowrap}input[type=range]{flex:1;min-width:120px;height:32px}
</style></head><body><canvas id="c"></canvas>
<div id="hud"><h1>NazClic · épilateur nasal à cire</h1><div id="ph"></div><div id="kv"></div></div>
<div id="ui"><div class="row"><button class="pri" id="play">▶ Animation complète</button><button data-st="0">Repos</button><button data-st="1">Armé</button><button data-st="2">Emboîté</button><button data-st="3">Fin retrait</button></div>
<div class="row"><button id="bg" class="on">Zone de garde</button><button id="bc">Coupe</button><button id="bt" class="on">Corps transparent</button></div>
<div class="row"><label>Vue éclatée</label><input id="ex" type="range" min="0" max="1" step="0.01" value="0"></div></div>
<script>__THREE__</script><script>__ORBIT__</script><script>
const M=__MESHES__, P=__PARAMS__;
const cv=document.getElementById('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.localClippingEnabled=true;
const S=new THREE.Scene();S.background=new THREE.Color(0x12161c);
const cam=new THREE.PerspectiveCamera(32,1,1,2000);cam.up.set(0,0,1);cam.position.set(-20,-190,75);
const ctl=new THREE.OrbitControls(cam,cv);ctl.target.set(-30,0,0);ctl.enableDamping=true;ctl.update();
S.add(new THREE.HemisphereLight(0xffffff,0x334455,0.95));const dl=new THREE.DirectionalLight(0xffffff,0.75);dl.position.set(-60,-120,160);S.add(dl);
const clip=new THREE.Plane(new THREE.Vector3(0,1,0),0);
function mk(n,col,o){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(M[n].v,3));g.setIndex(M[n].t);g.computeVertexNormals();
 const m=new THREE.MeshStandardMaterial(Object.assign({color:col,roughness:.55,metalness:.05,side:THREE.DoubleSide},o||{}));return new THREE.Mesh(g,m)}
const dev=new THREE.Group();S.add(dev);
const corps=mk('corps',0x4f86c6,{transparent:true,opacity:.32,depthWrite:false}),nez=mk('nez',0xf0a04b),ch=new THREE.Group(),chm=mk('chariot',0xd9dde2),ver=new THREE.Group(),verm=mk('verrou',0xe63946);
verm.position.set(-P.PIV_X,0,-P.PIV_Z);ver.position.set(P.PIV_X,0,P.PIV_Z);ver.add(verm);ch.add(chm,ver);
const spg=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial({color:0x8d99a6,metalness:.7,roughness:.35}));
dev.add(corps,nez,ch,spg);
const bat=new THREE.Group(),batm=mk('baton',0xf4f7fa),cire=mk('cire',0xe0b020,{roughness:.3});
const zg=new THREE.Mesh(new THREE.CylinderGeometry(P.DISQ_D/2+P.GARDE_MIN,P.DISQ_D/2+P.GARDE_MIN,P.X_TIP-P.X_DISQ+P.GARDE_MIN,40,1,false),new THREE.MeshBasicMaterial({color:0xff4040,transparent:true,opacity:.10,depthWrite:false}));
zg.rotation.z=Math.PI/2;zg.position.x=(P.X_TIP+P.X_DISQ-P.GARDE_MIN)/2;bat.add(batm,cire,zg);S.add(bat);
const nar=new THREE.Mesh(new THREE.TorusGeometry(7.5,1.6,12,40),new THREE.MeshStandardMaterial({color:0xd9a38a,transparent:true,opacity:.55}));nar.rotation.y=Math.PI/2;nar.position.x=P.X_DISQ+3.4;S.add(nar);
function spring(s){const x1=P.X_SIEGE-P.R_D/2,x0=P.X_COL-s+P.R_D/2,n=P.R_N,pts=[];for(let i=0;i<=n*24;i++){const a=i/24*2*Math.PI,u=i/(n*24);pts.push(new THREE.Vector3(x0+(x1-x0)*u,P.R_DM/2*Math.cos(a),P.R_DM/2*Math.sin(a)))}
 spg.geometry.dispose();spg.geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),n*24,P.R_D/2,6,false)}
const sm=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x)};
let st={s:P.COURSE,app:1,press:0,bs:0,drop:0,vis:false,txt:''},ex=0,playing=false,t0=0;
const PH=[[1.6,'1 · REPOS — désarmé, dent rouge dans la fenêtre arrière',u=>({s:P.COURSE,app:1,vis:false})],
[1.8,'2 · ARMEMENT — pousser le poussoir (pouce ou contre une surface) jusqu\'au CLIC · '+P.Fa+' N',u=>({s:P.COURSE*(1-sm(u)),app:1,vis:false})],
[3.2,'3 · EMBOÎTEMENT À L\'AVEUGLE — le cône recentre la queue du bâtonnet (±5,5 mm / ±10°), CLIC des mâchoires · '+P.Fi+' N',u=>({s:0,app:1-sm(u),vis:true})],
[1.2,'4 · GÂCHETTE — appui de l\'index sur la dent · ≈'+P.Fg+' N, course 1,5 mm',u=>({s:0,app:0,vis:true,press:sm(u*1.6)})],
[0.7,'5 · RETRAIT — le ressort recule le chariot de '+P.COURSE+' mm (ralenti ×10)',u=>({s:P.COURSE*sm(u),app:0,vis:true,press:1-u,bs:P.COURSE*sm(u)})],
[2.2,'6 · FIN DE RETRAIT — garde cire/appareil = '+P.GARDE_FIN+' mm (critère ≥ '+P.GARDE_MIN+' mm)',u=>({s:P.COURSE,app:0,vis:true,bs:P.COURSE})],
[2.6,'7 · ÉJECTION — pousser à fond : la lèvre écarte les mâchoires, le bâtonnet tombe. Appareil réarmé.',u=>({s:u<.5?P.COURSE*(1-sm(u*2))-P.SUR*sm(u*4-1):-P.SUR*(1-sm(u*4-3)),app:-1,vis:true,bs:u<.5?P.COURSE*(1-sm(u*2))-P.SUR*sm(u*4-1):-P.SUR,drop:sm(u*2-1)})]];
const STEPS=[{s:P.COURSE,app:1,vis:false,txt:PH[0][1]},{s:0,app:1,vis:false,txt:'ARMÉ — dent dans la fenêtre gâchette, ressort '+P.Fa+' N'},{s:0,app:0,vis:true,txt:'EMBOÎTÉ — garde '+(P.GARDE_FIN+P.COURSE)+' mm'},{s:P.COURSE,app:0,vis:true,bs:P.COURSE,txt:PH[5][1]}];
function apply(){const s=st.s,e=ex;
 ch.position.x=-s+60*e;spring(Math.max(s,-P.SUR));spg.position.x=105*e;spg.visible=true;nez.position.x=125*e;
 let pr=st.press||0;if(s>P.BAR1+.2&&s<P.BAR0-.2)pr=1;ver.rotation.y=P.LATCH*pr*1.15;
 const a=st.app||0;dev.position.set(0,0,0);dev.rotation.set(0,0,0);bat.position.set(150*e,0,0);bat.rotation.set(0,0,0);
 if(a>0){const lat=Math.min(1,a*2.2);dev.position.set(-42*a,0,-5.2*lat);dev.rotation.y=-0.14*lat}
 if(a<0){dev.position.x=-34;bat.position.x+=-34}
 bat.position.x-=(st.bs||0);bat.position.z-=60*(st.drop||0);bat.visible=st.vis||e>0;nar.visible=(st.vis&&a>=0)&&e==0;
 const g=(P.X_DISQ+bat.position.x)-dev.position.x;
 document.getElementById('ph').textContent=st.txt||'';
 document.getElementById('kv').innerHTML=(bat.visible&&e==0?'Garde cire / appareil : <b>'+g.toFixed(1)+' mm</b> · ':'')+'Recul chariot : <b>'+Math.max(0,s).toFixed(1)+' mm</b> · Ressort : <b>'+(P.Fa-(P.Fa-P.Fr)*s/P.COURSE).toFixed(1)+' N</b>'}
function frame(now){if(playing){let t=(now-t0)/1000,i=0;while(i<PH.length&&t>PH[i][0]){t-=PH[i][0];i++}
  if(i>=PH.length){t0=now;i=0;t=0}st=Object.assign({press:0,bs:0,drop:0},PH[i][2](t/PH[i][0]),{txt:PH[i][1]})}
 apply();ctl.update();R.render(S,cam);requestAnimationFrame(frame)}
function size(){const w=innerWidth,h=innerHeight;R.setSize(w,h,false);cam.aspect=w/h;cam.fov=w<h?48:30;const d=w<h?400:230,v=cam.position.clone().sub(ctl.target).normalize();cam.position.copy(ctl.target).addScaledVector(v,d);cam.updateProjectionMatrix()}addEventListener('resize',size);size();
const $=id=>document.getElementById(id);
$('play').onclick=()=>{playing=!playing;t0=performance.now();$('play').textContent=playing?'⏸ Pause':'▶ Animation complète';$('ex').value=0;ex=0};
document.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{playing=false;$('play').textContent='▶ Animation complète';st=Object.assign({press:0,bs:0,drop:0},STEPS[+b.dataset.st])});
$('ex').oninput=e=>{ex=+e.target.value;if(ex>0){playing=false;$('play').textContent='▶ Animation complète';st=Object.assign({},STEPS[2],{txt:'VUE ÉCLATÉE — corps · chariot monobloc · ressort · nez · bâtonnet'})}};
$('bg').onclick=e=>{zg.visible=!zg.visible;e.target.classList.toggle('on')};
$('bt').onclick=e=>{const o=corps.material.opacity<1;corps.material.opacity=o?1:.32;corps.material.transparent=!o;corps.material.depthWrite=o;e.target.classList.toggle('on')};
$('bc').onclick=e=>{const on=!e.target.classList.contains('on');[corps,nez].forEach(m=>{m.material.clippingPlanes=on?[clip]:[];m.material.needsUpdate=true});e.target.classList.toggle('on')};
st=Object.assign({press:0,bs:0,drop:0},STEPS[2]);requestAnimationFrame(frame);
</script></body></html>'''
html = html.replace('__THREE__', three).replace('__ORBIT__', orbit).replace('__MESHES__', meshes).replace('__PARAMS__', json.dumps(P))
out = f'{here}/../livrables/NazClic_visualiseur_3D.html'; open(out, 'w').write(html); print(out, len(html)//1024, 'ko')
