/* PICK // MISSION CONTROL — compilé depuis src/ (npm run build). Ne pas modifier ce fichier à la main. */
(()=>{var jf=Object.defineProperty;var Vt=(i,e,t)=>()=>{if(t)throw t[0];try{return i&&(e=i(i=0)),e}catch(n){throw t=[n],n}};var Xf=(i,e)=>{for(var t in e)jf(i,t,{get:e[t],enumerable:!0})};function dp(i,e,t,n,s,r=10){let a=[];for(let o=0;o<=r;o++){let l=n+(s-n)*o/r;a.push([i+t*Math.cos(l),e+t*Math.sin(l)])}return a}function fp(i,e,t,n=14){let s=[];for(let r=0;r<=n;r++){let a=r/n,o=1-a;s.push([o*o*i[0]+2*o*a*e[0]+a*a*t[0],o*o*i[1]+2*o*a*e[1]+a*a*t[1]])}return s}function hr(i){let e=ur[i],t=Gi.filter(([n,s],r)=>r>0&&!(n===-3&&s<=e.z));return[[e.x+.55,e.z],[-3,e.z],...t]}var zn,ur,hs,Na,Mh,xi,en,Da,Gi,Ua,ds,fs,bn,sc=Vt(()=>{zn={x:8.6,z:-2.7,l:2.4,p:1.7},ur=[-5.3,-2.7,-.1].map(i=>({x:-6.5,z:i})),hs={x0:-15.9,x1:-7.5,rangees:[-6.6,-4,-1.4,1.2],profondeur:1,niveaux:[.12,1.02,1.92,2.82],hauteur:3.1,travees:4},Na=[3.4,5.8,8.2].map(i=>({x:16.6,z:i})),Mh=[{x:13.9,z:6.7},{x:13.9,z:3.2}],xi={preparation:{rect:[-16.6,-4.5,-7.7,2.3],ancre:[-11.5,3.6,-1.5],hauteur:3.2},convoyeur:{rect:[-4.2,2,2.9,6.1],ancre:[-2.2,1.7,4.5],hauteur:1.3},controle:{rect:[2.2,4.9,3,6],ancre:[3.4,3.5,4.5],hauteur:2.6},rejet:{rect:[6.9,10.4,-4,2.4],ancre:[8.6,2,-2.4],hauteur:1.4},expedition:{rect:[10.6,18.8,2,9.6],ancre:[14.6,3.7,5.6],hauteur:3.2}},en={x0:-16.6,x1:19.2,z0:-7.6,z1:9.8,y1:3.2};Da=1.5,Gi=[[-3,-6.2],[-3,4.5-Da],...dp(-3+Da,4.5-Da,Da,Math.PI,Math.PI/2,12).slice(1),[5.7,4.5]],Ua=ur.map(i=>[[i.x+.55,i.z],[-3-.86/2,i.z]]),ds=[[5.7,4.5],[12.2,4.5]],fs=[...fp([5.7,4.5],[zn.x,4.5],[zn.x,4.5-2.4]),[zn.x,zn.z+zn.p/2+.15]],bn=class{constructor(e){this.p=e,this.cumul=[0];for(let t=1;t<e.length;t++)this.cumul.push(this.cumul[t-1]+Math.hypot(e[t][0]-e[t-1][0],e[t][1]-e[t-1][1]));this.longueur=this.cumul[this.cumul.length-1]}a(e,t){let n=this.longueur,s=Math.max(0,Math.min(n,e)),r=1;for(;r<this.cumul.length-1&&this.cumul[r]<s;)r++;let a=this.p[r-1],o=this.p[r],l=this.cumul[r]-this.cumul[r-1]||1,c=(s-this.cumul[r-1])/l;return t.x=a[0]+(o[0]-a[0])*c,t.z=a[1]+(o[1]-a[1])*c,t.cap=Math.atan2(o[0]-a[0],o[1]-a[1]),t}}});function pp(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function mp(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Er(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Ld(){let i=Er("canvas");return i.style.display="block",i}function Zc(...i){let e="THREE."+i.shift();Ls?Ls("log",e,...i):console.log(e,...i)}function Dd(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function ke(...i){i=Dd(i);let e="THREE."+i.shift();if(Ls)Ls("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function He(...i){i=Dd(i);let e="THREE."+i.shift();if(Ls)Ls("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Xi(...i){let e=i.join(" ");e in Eh||(Eh[e]=!0,ke(...i))}function Nd(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}function js(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(tn[i&255]+tn[i>>8&255]+tn[i>>16&255]+tn[i>>24&255]+"-"+tn[e&255]+tn[e>>8&255]+"-"+tn[e>>16&15|64]+tn[e>>24&255]+"-"+tn[t&63|128]+tn[t>>8&255]+"-"+tn[t>>16&255]+tn[t>>24&255]+tn[n&255]+tn[n>>8&255]+tn[n>>16&255]+tn[n>>24&255]).toLowerCase()}function et(i,e,t){return Math.max(e,Math.min(t,i))}function Jc(i,e){return(i%e+e)%e}function gp(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function xp(i,e,t){return i!==e?(t-i)/(e-i):0}function yr(i,e,t){return(1-t)*i+t*e}function vp(i,e,t,n){return yr(i,e,1-Math.exp(-t*n))}function _p(i,e=1){return e-Math.abs(Jc(i,e*2)-e)}function yp(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function bp(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Mp(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Sp(i,e){return i+Math.random()*(e-i)}function Ep(i){return i*(.5-Math.random())}function Tp(i){i!==void 0&&(Th=i);let e=Th+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function wp(i){return i*_r}function Ap(i){return i*Ds}function Rp(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Cp(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Pp(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Ip(i,e,t,n,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+n)/2),u=a((e+n)/2),d=r((e-n)/2),h=a((e-n)/2),p=r((n-e)/2),g=a((n-e)/2);switch(s){case"XYX":i.set(o*u,l*d,l*h,o*c);break;case"YZY":i.set(l*h,o*u,l*d,o*c);break;case"ZXZ":i.set(l*d,l*h,o*u,o*c);break;case"XZX":i.set(o*u,l*g,l*p,o*c);break;case"YXY":i.set(l*p,o*u,l*g,o*c);break;case"ZYZ":i.set(l*g,l*p,o*u,o*c);break;default:ke("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Rs(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function on(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Lp(){let i={enabled:!0,workingColorSpace:Mr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===it&&(s.r=ri(s.r),s.g=ri(s.g),s.b=ri(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===it&&(s.r=Cs(s.r),s.g=Cs(s.g),s.b=Cs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===li?Sr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Xi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Xi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Mr]:{primaries:e,whitePoint:n,transfer:Sr,toXYZ:Ah,fromXYZ:Rh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Lt},outputColorSpaceConfig:{drawingBufferColorSpace:Lt}},[Lt]:{primaries:e,whitePoint:n,transfer:it,toXYZ:Ah,fromXYZ:Rh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Lt}}}),i}function ri(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Cs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}function oc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?xo.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(ke("Texture: Unable to serialize Texture."),{})}function uc(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}function vc(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Wi.fromArray(i,r);let o=s.x*Math.abs(Wi.x)+s.y*Math.abs(Wi.y)+s.z*Math.abs(Wi.z),l=e.dot(Wi),c=t.dot(Wi),u=n.dot(Wi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}function Xp(i,e,t,n,s,r,a,o){let l;if(e.side===qt?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===Ii,o),l===null)return null;Ja.copy(o),Ja.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Ja);return c<t.near||c>t.far?null:{distance:c,point:Ja.clone(),object:i}}function Ka(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,ja),i.getVertexPosition(l,Xa),i.getVertexPosition(c,Ya);let u=Xp(i,e,t,n,ja,Xa,Ya,zh);if(u){let d=new O;Si.getBarycoord(zh,ja,Xa,Ya,d),s&&(u.uv=Si.getInterpolatedAttribute(s,o,l,c,d,new Oe)),r&&(u.uv1=Si.getInterpolatedAttribute(r,o,l,c,d,new Oe)),a&&(u.normal=Si.getInterpolatedAttribute(a,o,l,c,d,new O),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a:o,b:l,c,normal:new O,materialIndex:0};Si.getNormal(ja,Xa,Ya,h.normal),u.face=h,u.barycoord=d}return u}function Gh(i,e,t,n,s,r,a){let o=Pc.distanceSqToPoint(i);if(o<t){let l=new O;Pc.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}function ts(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if($h(s))s.isRenderTargetTexture?(ke("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if($h(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function sn(i){let e={};for(let t=0;t<i.length;t++){let n=ts(i[t]);for(let s in n)e[s]=n[s]}return e}function $h(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Jp(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Kc(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ke.workingColorSpace}function Ts(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Ec(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}function Od(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function em(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function tm(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=Od(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=em(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}function Wh(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}function nm(){this._document.hidden===!1&&this.reset()}function Jh(i,e){return i.distance-e.distance}function Nc(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)Nc(r[a],e,t,!0)}}function tu(i,e,t,n){let s=hm(n);switch(t){case qc:return i*e;case Go:return i*e/s.components*s.byteLength;case $o:return i*e/s.components*s.byteLength;case Ui:return i*e*2/s.components*s.byteLength;case Wo:return i*e*2/s.components*s.byteLength;case jc:return i*e*3/s.components*s.byteLength;case Tn:return i*e*4/s.components*s.byteLength;case qo:return i*e*4/s.components*s.byteLength;case Zr:case Jr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Kr:case Qr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Xo:case Zo:return Math.max(i,16)*Math.max(e,8)/4;case jo:case Yo:return Math.max(i,8)*Math.max(e,8)/2;case Jo:case Ko:case el:case tl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Qo:case ea:case nl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case il:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case sl:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case rl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case al:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case ol:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case ll:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case cl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case ul:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case hl:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case dl:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case fl:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case pl:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case ml:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case gl:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case xl:case vl:case _l:return Math.ceil(i/4)*Math.ceil(e/4)*16;case yl:case bl:return Math.ceil(i/4)*Math.ceil(e/4)*8;case ta:case Ml:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function hm(i){switch(i){case fn:case Vc:return{byteLength:1,components:1};case Ws:case Gc:case Nt:return{byteLength:2,components:1};case Ho:case Vo:return{byteLength:2,components:4};case Fn:case ko:case En:return{byteLength:4,components:1};case $c:case Wc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}var Kh,Fc,Qh,Ji,ed,Gs,Ii,qt,kt,Sn,$s,Xn,Oc,Bc,td,Ki,nd,id,sd,rd,ad,od,ld,cd,zc,kc,ud,hd,dd,fd,pd,md,gd,xd,vd,oo,lo,co,Ps,uo,ho,fo,po,Fo,_d,yd,Un,Vr,Gr,$r,Qi,Wr,qr,jr,Hc,Li,es,Oo,Bo,Xr,ai,Hn,mo,zt,bd,Yr,Wt,zo,Di,fn,Vc,Gc,Ws,ko,Fn,En,Nt,Ho,Vo,qs,$c,Wc,qc,jc,Tn,Vn,Ni,Go,$o,Ui,Wo,qo,Zr,Jr,Kr,Qr,jo,Xo,Yo,Zo,Jo,Ko,Qo,el,tl,ea,nl,il,sl,rl,al,ol,ll,cl,ul,hl,dl,fl,pl,ml,gl,xl,vl,_l,yl,bl,ta,Ml,br,go,ro,wc,Ac,Rc,Cc,Md,na,Sd,li,Lt,Mr,Sr,it,ao,Ed,Td,wd,Ad,Sl,Rd,Cd,El,Pd,Id,Xc,Yc,Nn,Is,Eh,Ls,Ud,Gn,tn,Th,_r,Ds,Tl,nu,Oe,$n,iu,O,rc,wh,su,$e,ac,Ah,Rh,Ke,ps,xo,Dp,Ns,Np,lc,cn,ru,yt,vo,Et,Tr,_o,Uo,ht,ms,In,Up,Fp,vi,Oa,mn,Ch,Ph,Wn,Us,Op,Ih,gs,ei,Ba,fr,Bp,zp,Lh,Dh,Nh,Uh,kp,xs,cc,bt,Bt,Hp,Fs,Fd,_i,za,Le,nn,wr,Yi,Ln,ti,hc,ni,vs,_s,Fh,dc,fc,pc,mc,gc,xc,Si,qn,ii,Dn,ka,ys,bs,Ms,yi,bi,$i,pr,Ha,Va,Wi,Ct,Ga,Vp,ln,Ar,Rr,gt,Gp,mr,_c,oi,$p,Mn,yc,Ss,gn,gr,Ot,Dt,bc,Wp,qp,xn,jp,jn,si,Mc,$a,Wa,Os,Pt,Oh,qi,qa,Bh,ja,Xa,Ya,Sc,Za,zh,Ja,Me,Cr,Pr,Es,kh,Qa,Hh,Yp,xr,vr,un,ji,Zp,eo,Bs,zs,Vh,Pc,to,no,Ir,Lr,Ei,Ti,yo,Dr,Je,wi,hn,Nr,ci,Kp,Qp,Mt,ks,Tt,Ur,bo,Mo,Ai,So,Eo,To,wo,vn,Ri,Ao,Ro,Co,Fr,Ci,Po,Io,Bd,Lo,Hs,Or,Tc,qh,jh,Br,io,so,kn,zr,Mi,Xh,Yh,$t,Ic,Zi,Pi,Lc,Vs,ws,As,Do,No,kr,Qc,im,eu,sm,rm,am,om,lm,cm,um,Dc,_t,Jy,Zh,Hr,au,Uc,ou=Vt(()=>{Kh=0,Fc=1,Qh=2,Ji=1,ed=2,Gs=3,Ii=0,qt=1,kt=2,Sn=0,$s=1,Xn=2,Oc=3,Bc=4,td=5,Ki=100,nd=101,id=102,sd=103,rd=104,ad=200,od=201,ld=202,cd=203,zc=204,kc=205,ud=206,hd=207,dd=208,fd=209,pd=210,md=211,gd=212,xd=213,vd=214,oo=0,lo=1,co=2,Ps=3,uo=4,ho=5,fo=6,po=7,Fo=0,_d=1,yd=2,Un=0,Vr=1,Gr=2,$r=3,Qi=4,Wr=5,qr=6,jr=7,Hc=300,Li=301,es=302,Oo=303,Bo=304,Xr=306,ai=1e3,Hn=1001,mo=1002,zt=1003,bd=1004,Yr=1005,Wt=1006,zo=1007,Di=1008,fn=1009,Vc=1010,Gc=1011,Ws=1012,ko=1013,Fn=1014,En=1015,Nt=1016,Ho=1017,Vo=1018,qs=1020,$c=35902,Wc=35899,qc=1021,jc=1022,Tn=1023,Vn=1026,Ni=1027,Go=1028,$o=1029,Ui=1030,Wo=1031,qo=1033,Zr=33776,Jr=33777,Kr=33778,Qr=33779,jo=35840,Xo=35841,Yo=35842,Zo=35843,Jo=36196,Ko=37492,Qo=37496,el=37488,tl=37489,ea=37490,nl=37491,il=37808,sl=37809,rl=37810,al=37811,ol=37812,ll=37813,cl=37814,ul=37815,hl=37816,dl=37817,fl=37818,pl=37819,ml=37820,gl=37821,xl=36492,vl=36494,_l=36495,yl=36283,bl=36284,ta=36285,Ml=36286,br=2300,go=2301,ro=2302,wc=2303,Ac=2400,Rc=2401,Cc=2402,Md=3200,na=0,Sd=1,li="",Lt="srgb",Mr="srgb-linear",Sr="linear",it="srgb",ao=7680,Ed=519,Td=512,wd=513,Ad=514,Sl=515,Rd=516,Cd=517,El=518,Pd=519,Id=35044,Xc=35048,Yc="300 es",Nn=2e3,Is=2001;Eh={},Ls=null;Ud={[oo]:lo,[co]:fo,[uo]:po,[Ps]:ho,[lo]:oo,[fo]:co,[po]:uo,[ho]:Ps},Gn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},tn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Th=1234567,_r=Math.PI/180,Ds=180/Math.PI;Tl={DEG2RAD:_r,RAD2DEG:Ds,generateUUID:js,clamp:et,euclideanModulo:Jc,mapLinear:gp,inverseLerp:xp,lerp:yr,damp:vp,pingpong:_p,smoothstep:yp,smootherstep:bp,randInt:Mp,randFloat:Sp,randFloatSpread:Ep,seededRandom:Tp,degToRad:wp,radToDeg:Ap,isPowerOfTwo:Rp,ceilPowerOfTwo:Cp,floorPowerOfTwo:Pp,setQuaternionFromProperEuler:Ip,normalize:on,denormalize:Rs},nu=class nu{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(et(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(et(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};nu.prototype.isVector2=!0;Oe=nu,$n=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],d=n[s+3],h=r[a+0],p=r[a+1],g=r[a+2],y=r[a+3];if(d!==y||l!==h||c!==p||u!==g){let m=l*h+c*p+u*g+d*y;m<0&&(h=-h,p=-p,g=-g,y=-y,m=-m);let f=1-o;if(m<.9995){let S=Math.acos(m),w=Math.sin(S);f=Math.sin(f*S)/w,o=Math.sin(o*S)/w,l=l*f+h*o,c=c*f+p*o,u=u*f+g*o,d=d*f+y*o}else{l=l*f+h*o,c=c*f+p*o,u=u*f+g*o,d=d*f+y*o;let S=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=S,c*=S,u*=S,d*=S}}e[t]=l,e[t+1]=c,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],d=r[a],h=r[a+1],p=r[a+2],g=r[a+3];return e[t]=o*g+u*d+l*p-c*h,e[t+1]=l*g+u*h+c*d-o*p,e[t+2]=c*g+u*p+o*h-l*d,e[t+3]=u*g-o*d-l*h-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),d=o(r/2),h=l(n/2),p=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=h*u*d+c*p*g,this._y=c*p*d-h*u*g,this._z=c*u*g+h*p*d,this._w=c*u*d-h*p*g;break;case"YXZ":this._x=h*u*d+c*p*g,this._y=c*p*d-h*u*g,this._z=c*u*g-h*p*d,this._w=c*u*d+h*p*g;break;case"ZXY":this._x=h*u*d-c*p*g,this._y=c*p*d+h*u*g,this._z=c*u*g+h*p*d,this._w=c*u*d-h*p*g;break;case"ZYX":this._x=h*u*d-c*p*g,this._y=c*p*d+h*u*g,this._z=c*u*g-h*p*d,this._w=c*u*d+h*p*g;break;case"YZX":this._x=h*u*d+c*p*g,this._y=c*p*d+h*u*g,this._z=c*u*g-h*p*d,this._w=c*u*d-h*p*g;break;case"XZY":this._x=h*u*d-c*p*g,this._y=c*p*d-h*u*g,this._z=c*u*g+h*p*d,this._w=c*u*d+h*p*g;break;default:ke("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],u=t[6],d=t[10],h=n+o+d;if(h>0){let p=.5/Math.sqrt(h+1);this._w=.25/p,this._x=(u-l)*p,this._y=(r-c)*p,this._z=(a-s)*p}else if(n>o&&n>d){let p=2*Math.sqrt(1+n-o-d);this._w=(u-l)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+c)/p}else if(o>d){let p=2*Math.sqrt(1+o-n-d);this._w=(r-c)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(l+u)/p}else{let p=2*Math.sqrt(1+d-n-o);this._w=(a-s)/p,this._x=(r+c)/p,this._y=(l+u)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(et(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,u=t._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),u=Math.sin(c);l=Math.sin(l*c)/u,t=Math.sin(t*c)/u,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},iu=class iu{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(wh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(wh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),u=2*(o*t-r*s),d=2*(r*n-a*t);return this.x=t+l*c+a*d-o*u,this.y=n+l*u+o*c-r*d,this.z=s+l*d+r*u-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(et(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return rc.copy(this).projectOnVector(e),this.sub(rc)}reflect(e){return this.sub(rc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(et(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};iu.prototype.isVector3=!0;O=iu,rc=new O,wh=new $n,su=class su{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let u=this.elements;return u[0]=e,u[1]=s,u[2]=o,u[3]=t,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],d=n[7],h=n[2],p=n[5],g=n[8],y=s[0],m=s[3],f=s[6],S=s[1],w=s[4],M=s[7],E=s[2],x=s[5],R=s[8];return r[0]=a*y+o*S+l*E,r[3]=a*m+o*w+l*x,r[6]=a*f+o*M+l*R,r[1]=c*y+u*S+d*E,r[4]=c*m+u*w+d*x,r[7]=c*f+u*M+d*R,r[2]=h*y+p*S+g*E,r[5]=h*m+p*w+g*x,r[8]=h*f+p*M+g*R,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8];return t*a*u-t*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=u*a-o*c,h=o*l-u*r,p=c*r-a*l,g=t*d+n*h+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/g;return e[0]=d*y,e[1]=(s*c-u*n)*y,e[2]=(o*n-s*a)*y,e[3]=h*y,e[4]=(u*t-s*l)*y,e[5]=(s*r-o*t)*y,e[6]=p*y,e[7]=(n*l-c*t)*y,e[8]=(a*t-n*r)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Xi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ac.makeScale(e,t)),this}rotate(e){return Xi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ac.makeRotation(-e)),this}translate(e,t){return Xi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ac.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};su.prototype.isMatrix3=!0;$e=su,ac=new $e,Ah=new $e().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Rh=new $e().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Ke=Lp();xo=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ps===void 0&&(ps=Er("canvas")),ps.width=e.width,ps.height=e.height;let s=ps.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=ps}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Er("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=ri(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(ri(t[n]/255)*255):t[n]=ri(t[n]);return{data:t,width:e.width,height:e.height}}else return ke("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Dp=0,Ns=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Dp++}),this.uuid=js(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(oc(s[a].image)):r.push(oc(s[a]))}else r=oc(s);n.url=r}return t||(e.images[this.uuid]=n),n}};Np=0,lc=new O,cn=class i extends Gn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Hn,s=Hn,r=Wt,a=Di,o=Tn,l=fn,c=i.DEFAULT_ANISOTROPY,u=li){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Np++}),this.uuid=js(),this.name="",this.source=new Ns(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Oe(0,0),this.repeat=new Oe(1,1),this.center=new Oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new $e,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(lc).x}get height(){return this.source.getSize(lc).y}get depth(){return this.source.getSize(lc).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){ke(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){ke(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Hc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case ai:e.x=e.x-Math.floor(e.x);break;case Hn:e.x=e.x<0?0:1;break;case mo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case ai:e.y=e.y-Math.floor(e.y);break;case Hn:e.y=e.y<0?0:1;break;case mo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};cn.DEFAULT_IMAGE=null;cn.DEFAULT_MAPPING=Hc;cn.DEFAULT_ANISOTROPY=1;ru=class ru{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],u=l[4],d=l[8],h=l[1],p=l[5],g=l[9],y=l[2],m=l[6],f=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-y)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+y)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let w=(c+1)/2,M=(p+1)/2,E=(f+1)/2,x=(u+h)/4,R=(d+y)/4,_=(g+m)/4;return w>M&&w>E?w<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(w),s=x/n,r=R/n):M>E?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=x/s,r=_/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=R/r,s=_/r),this.set(n,s,r,t),this}let S=Math.sqrt((m-g)*(m-g)+(d-y)*(d-y)+(h-u)*(h-u));return Math.abs(S)<.001&&(S=1),this.x=(m-g)/S,this.y=(d-y)/S,this.z=(h-u)/S,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this.w=et(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this.w=et(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(et(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};ru.prototype.isVector4=!0;yt=ru,vo=class extends Gn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Wt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new yt(0,0,e,t),this.scissorTest=!1,this.viewport=new yt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new cn(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Wt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Ns(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Et=class extends vo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Tr=class extends cn{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=zt,this.minFilter=zt,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},_o=class extends cn{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=zt,this.minFilter=zt,this.wrapR=Hn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Uo=class Uo{constructor(e,t,n,s,r,a,o,l,c,u,d,h,p,g,y,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,u,d,h,p,g,y,m)}set(e,t,n,s,r,a,o,l,c,u,d,h,p,g,y,m){let f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=s,f[1]=r,f[5]=a,f[9]=o,f[13]=l,f[2]=c,f[6]=u,f[10]=d,f[14]=h,f[3]=p,f[7]=g,f[11]=y,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Uo().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/ms.setFromMatrixColumn(e,0).length(),r=1/ms.setFromMatrixColumn(e,1).length(),a=1/ms.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let h=a*u,p=a*d,g=o*u,y=o*d;t[0]=l*u,t[4]=-l*d,t[8]=c,t[1]=p+g*c,t[5]=h-y*c,t[9]=-o*l,t[2]=y-h*c,t[6]=g+p*c,t[10]=a*l}else if(e.order==="YXZ"){let h=l*u,p=l*d,g=c*u,y=c*d;t[0]=h+y*o,t[4]=g*o-p,t[8]=a*c,t[1]=a*d,t[5]=a*u,t[9]=-o,t[2]=p*o-g,t[6]=y+h*o,t[10]=a*l}else if(e.order==="ZXY"){let h=l*u,p=l*d,g=c*u,y=c*d;t[0]=h-y*o,t[4]=-a*d,t[8]=g+p*o,t[1]=p+g*o,t[5]=a*u,t[9]=y-h*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let h=a*u,p=a*d,g=o*u,y=o*d;t[0]=l*u,t[4]=g*c-p,t[8]=h*c+y,t[1]=l*d,t[5]=y*c+h,t[9]=p*c-g,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let h=a*l,p=a*c,g=o*l,y=o*c;t[0]=l*u,t[4]=y-h*d,t[8]=g*d+p,t[1]=d,t[5]=a*u,t[9]=-o*u,t[2]=-c*u,t[6]=p*d+g,t[10]=h-y*d}else if(e.order==="XZY"){let h=a*l,p=a*c,g=o*l,y=o*c;t[0]=l*u,t[4]=-d,t[8]=c*u,t[1]=h*d+y,t[5]=a*u,t[9]=p*d-g,t[2]=g*d-p,t[6]=o*u,t[10]=y*d+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Up,e,Fp)}lookAt(e,t,n){let s=this.elements;return mn.subVectors(e,t),mn.lengthSq()===0&&(mn.z=1),mn.normalize(),vi.crossVectors(n,mn),vi.lengthSq()===0&&(Math.abs(n.z)===1?mn.x+=1e-4:mn.z+=1e-4,mn.normalize(),vi.crossVectors(n,mn)),vi.normalize(),Oa.crossVectors(mn,vi),s[0]=vi.x,s[4]=Oa.x,s[8]=mn.x,s[1]=vi.y,s[5]=Oa.y,s[9]=mn.y,s[2]=vi.z,s[6]=Oa.z,s[10]=mn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],d=n[5],h=n[9],p=n[13],g=n[2],y=n[6],m=n[10],f=n[14],S=n[3],w=n[7],M=n[11],E=n[15],x=s[0],R=s[4],_=s[8],T=s[12],C=s[1],P=s[5],L=s[9],z=s[13],I=s[2],B=s[6],W=s[10],X=s[14],re=s[3],q=s[7],te=s[11],ie=s[15];return r[0]=a*x+o*C+l*I+c*re,r[4]=a*R+o*P+l*B+c*q,r[8]=a*_+o*L+l*W+c*te,r[12]=a*T+o*z+l*X+c*ie,r[1]=u*x+d*C+h*I+p*re,r[5]=u*R+d*P+h*B+p*q,r[9]=u*_+d*L+h*W+p*te,r[13]=u*T+d*z+h*X+p*ie,r[2]=g*x+y*C+m*I+f*re,r[6]=g*R+y*P+m*B+f*q,r[10]=g*_+y*L+m*W+f*te,r[14]=g*T+y*z+m*X+f*ie,r[3]=S*x+w*C+M*I+E*re,r[7]=S*R+w*P+M*B+E*q,r[11]=S*_+w*L+M*W+E*te,r[15]=S*T+w*z+M*X+E*ie,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],u=e[2],d=e[6],h=e[10],p=e[14],g=e[3],y=e[7],m=e[11],f=e[15],S=l*p-c*h,w=o*p-c*d,M=o*h-l*d,E=a*p-c*u,x=a*h-l*u,R=a*d-o*u;return t*(y*S-m*w+f*M)-n*(g*S-m*E+f*x)+s*(g*w-y*E+f*R)-r*(g*M-y*x+m*R)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],u=e[10];return t*(a*u-o*c)-n*(r*u-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],u=e[8],d=e[9],h=e[10],p=e[11],g=e[12],y=e[13],m=e[14],f=e[15],S=t*o-n*a,w=t*l-s*a,M=t*c-r*a,E=n*l-s*o,x=n*c-r*o,R=s*c-r*l,_=u*y-d*g,T=u*m-h*g,C=u*f-p*g,P=d*m-h*y,L=d*f-p*y,z=h*f-p*m,I=S*z-w*L+M*P+E*C-x*T+R*_;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let B=1/I;return e[0]=(o*z-l*L+c*P)*B,e[1]=(s*L-n*z-r*P)*B,e[2]=(y*R-m*x+f*E)*B,e[3]=(h*x-d*R-p*E)*B,e[4]=(l*C-a*z-c*T)*B,e[5]=(t*z-s*C+r*T)*B,e[6]=(m*M-g*R-f*w)*B,e[7]=(u*R-h*M+p*w)*B,e[8]=(a*L-o*C+c*_)*B,e[9]=(n*C-t*L-r*_)*B,e[10]=(g*x-y*M+f*S)*B,e[11]=(d*M-u*x-p*S)*B,e[12]=(o*T-a*P-l*_)*B,e[13]=(t*P-n*T+s*_)*B,e[14]=(y*w-g*E-m*S)*B,e[15]=(u*E-d*w+h*S)*B,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,u=a+a,d=o+o,h=r*c,p=r*u,g=r*d,y=a*u,m=a*d,f=o*d,S=l*c,w=l*u,M=l*d,E=n.x,x=n.y,R=n.z;return s[0]=(1-(y+f))*E,s[1]=(p+M)*E,s[2]=(g-w)*E,s[3]=0,s[4]=(p-M)*x,s[5]=(1-(h+f))*x,s[6]=(m+S)*x,s[7]=0,s[8]=(g+w)*R,s[9]=(m-S)*R,s[10]=(1-(h+y))*R,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=ms.set(s[0],s[1],s[2]).length(),o=ms.set(s[4],s[5],s[6]).length(),l=ms.set(s[8],s[9],s[10]).length();r<0&&(a=-a),In.copy(this);let c=1/a,u=1/o,d=1/l;return In.elements[0]*=c,In.elements[1]*=c,In.elements[2]*=c,In.elements[4]*=u,In.elements[5]*=u,In.elements[6]*=u,In.elements[8]*=d,In.elements[9]*=d,In.elements[10]*=d,t.setFromRotationMatrix(In),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=Nn,l=!1){let c=this.elements,u=2*r/(t-e),d=2*r/(n-s),h=(t+e)/(t-e),p=(n+s)/(n-s),g,y;if(l)g=r/(a-r),y=a*r/(a-r);else if(o===Nn)g=-(a+r)/(a-r),y=-2*a*r/(a-r);else if(o===Is)g=-a/(a-r),y=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=d,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=Nn,l=!1){let c=this.elements,u=2/(t-e),d=2/(n-s),h=-(t+e)/(t-e),p=-(n+s)/(n-s),g,y;if(l)g=1/(a-r),y=a/(a-r);else if(o===Nn)g=-2/(a-r),y=-(a+r)/(a-r);else if(o===Is)g=-1/(a-r),y=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=d,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Uo.prototype.isMatrix4=!0;ht=Uo,ms=new O,In=new ht,Up=new O(0,0,0),Fp=new O(1,1,1),vi=new O,Oa=new O,mn=new O,Ch=new ht,Ph=new $n,Wn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],d=s[2],h=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(et(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-et(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(et(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-et(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(et(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-et(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,p),this._y=0);break;default:ke("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ch.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ch,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ph.setFromEuler(this),this.setFromQuaternion(Ph,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Wn.DEFAULT_ORDER="XYZ";Us=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Op=0,Ih=new O,gs=new $n,ei=new ht,Ba=new O,fr=new O,Bp=new O,zp=new $n,Lh=new O(1,0,0),Dh=new O(0,1,0),Nh=new O(0,0,1),Uh={type:"added"},kp={type:"removed"},xs={type:"childadded",child:null},cc={type:"childremoved",child:null},bt=class i extends Gn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Op++}),this.uuid=js(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new O,t=new Wn,n=new $n,s=new O(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ht},normalMatrix:{value:new $e}}),this.matrix=new ht,this.matrixWorld=new ht,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Us,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return gs.setFromAxisAngle(e,t),this.quaternion.multiply(gs),this}rotateOnWorldAxis(e,t){return gs.setFromAxisAngle(e,t),this.quaternion.premultiply(gs),this}rotateX(e){return this.rotateOnAxis(Lh,e)}rotateY(e){return this.rotateOnAxis(Dh,e)}rotateZ(e){return this.rotateOnAxis(Nh,e)}translateOnAxis(e,t){return Ih.copy(e).applyQuaternion(this.quaternion),this.position.add(Ih.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Lh,e)}translateY(e){return this.translateOnAxis(Dh,e)}translateZ(e){return this.translateOnAxis(Nh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ei.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ba.copy(e):Ba.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),fr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ei.lookAt(fr,Ba,this.up):ei.lookAt(Ba,fr,this.up),this.quaternion.setFromRotationMatrix(ei),s&&(ei.extractRotation(s.matrixWorld),gs.setFromRotationMatrix(ei),this.quaternion.premultiply(gs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(He("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Uh),xs.child=e,this.dispatchEvent(xs),xs.child=null):He("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(kp),cc.child=e,this.dispatchEvent(cc),cc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ei.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ei.multiply(e.parent.matrixWorld)),e.applyMatrix4(ei),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Uh),xs.child=e,this.dispatchEvent(xs),xs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fr,e,Bp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fr,zp,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),u=a(e.images),d=a(e.shapes),h=a(e.skeletons),p=a(e.animations),g=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};bt.DEFAULT_UP=new O(0,1,0);bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;Bt=class extends bt{constructor(){super(),this.isGroup=!0,this.type="Group"}},Hp={type:"move"},Fs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Bt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Bt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Bt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let y of e.hand.values()){let m=t.getJointPose(y,n),f=this._getHandJoint(c,y);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),p=.02,g=.005;c.inputState.pinching&&h>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&h<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Hp)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Bt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Fd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},_i={h:0,s:0,l:0},za={h:0,s:0,l:0};Le=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Lt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ke.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=Ke.workingColorSpace){return this.r=e,this.g=t,this.b=n,Ke.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=Ke.workingColorSpace){if(e=Jc(e,1),t=et(t,0,1),n=et(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=uc(a,r,e+1/3),this.g=uc(a,r,e),this.b=uc(a,r,e-1/3)}return Ke.colorSpaceToWorking(this,s),this}setStyle(e,t=Lt){function n(r){r!==void 0&&parseFloat(r)<1&&ke("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:ke("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);ke("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Lt){let n=Fd[e.toLowerCase()];return n!==void 0?this.setHex(n,t):ke("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=ri(e.r),this.g=ri(e.g),this.b=ri(e.b),this}copyLinearToSRGB(e){return this.r=Cs(e.r),this.g=Cs(e.g),this.b=Cs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Lt){return Ke.workingToColorSpace(nn.copy(this),e),Math.round(et(nn.r*255,0,255))*65536+Math.round(et(nn.g*255,0,255))*256+Math.round(et(nn.b*255,0,255))}getHexString(e=Lt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Ke.workingColorSpace){Ke.workingToColorSpace(nn.copy(this),t);let n=nn.r,s=nn.g,r=nn.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=u<=.5?d/(a+o):d/(2-a-o),a){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=u,e}getRGB(e,t=Ke.workingColorSpace){return Ke.workingToColorSpace(nn.copy(this),t),e.r=nn.r,e.g=nn.g,e.b=nn.b,e}getStyle(e=Lt){Ke.workingToColorSpace(nn.copy(this),e);let t=nn.r,n=nn.g,s=nn.b;return e!==Lt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(_i),this.setHSL(_i.h+e,_i.s+t,_i.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(_i),e.getHSL(za);let n=yr(_i.h,za.h,t),s=yr(_i.s,za.s,t),r=yr(_i.l,za.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},nn=new Le;Le.NAMES=Fd;wr=class i{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Le(e),this.near=t,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Yi=class extends bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Wn,this.environmentIntensity=1,this.environmentRotation=new Wn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Ln=new O,ti=new O,hc=new O,ni=new O,vs=new O,_s=new O,Fh=new O,dc=new O,fc=new O,pc=new O,mc=new yt,gc=new yt,xc=new yt,Si=class i{constructor(e=new O,t=new O,n=new O){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Ln.subVectors(e,t),s.cross(Ln);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Ln.subVectors(s,t),ti.subVectors(n,t),hc.subVectors(e,t);let a=Ln.dot(Ln),o=Ln.dot(ti),l=Ln.dot(hc),c=ti.dot(ti),u=ti.dot(hc),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let h=1/d,p=(c*l-o*u)*h,g=(a*u-o*l)*h;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,ni)===null?!1:ni.x>=0&&ni.y>=0&&ni.x+ni.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,ni)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ni.x),l.addScaledVector(a,ni.y),l.addScaledVector(o,ni.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return mc.setScalar(0),gc.setScalar(0),xc.setScalar(0),mc.fromBufferAttribute(e,t),gc.fromBufferAttribute(e,n),xc.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(mc,r.x),a.addScaledVector(gc,r.y),a.addScaledVector(xc,r.z),a}static isFrontFacing(e,t,n,s){return Ln.subVectors(n,t),ti.subVectors(e,t),Ln.cross(ti).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ln.subVectors(this.c,this.b),ti.subVectors(this.a,this.b),Ln.cross(ti).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;vs.subVectors(s,n),_s.subVectors(r,n),dc.subVectors(e,n);let l=vs.dot(dc),c=_s.dot(dc);if(l<=0&&c<=0)return t.copy(n);fc.subVectors(e,s);let u=vs.dot(fc),d=_s.dot(fc);if(u>=0&&d<=u)return t.copy(s);let h=l*d-u*c;if(h<=0&&l>=0&&u<=0)return a=l/(l-u),t.copy(n).addScaledVector(vs,a);pc.subVectors(e,r);let p=vs.dot(pc),g=_s.dot(pc);if(g>=0&&p<=g)return t.copy(r);let y=p*c-l*g;if(y<=0&&c>=0&&g<=0)return o=c/(c-g),t.copy(n).addScaledVector(_s,o);let m=u*g-p*d;if(m<=0&&d-u>=0&&p-g>=0)return Fh.subVectors(r,s),o=(d-u)/(d-u+(p-g)),t.copy(s).addScaledVector(Fh,o);let f=1/(m+y+h);return a=y*f,o=h*f,t.copy(n).addScaledVector(vs,a).addScaledVector(_s,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},qn=class{constructor(e=new O(1/0,1/0,1/0),t=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Dn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Dn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Dn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Dn):Dn.fromBufferAttribute(r,a),Dn.applyMatrix4(e.matrixWorld),this.expandByPoint(Dn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ka.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ka.copy(n.boundingBox)),ka.applyMatrix4(e.matrixWorld),this.union(ka)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Dn),Dn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(pr),Ha.subVectors(this.max,pr),ys.subVectors(e.a,pr),bs.subVectors(e.b,pr),Ms.subVectors(e.c,pr),yi.subVectors(bs,ys),bi.subVectors(Ms,bs),$i.subVectors(ys,Ms);let t=[0,-yi.z,yi.y,0,-bi.z,bi.y,0,-$i.z,$i.y,yi.z,0,-yi.x,bi.z,0,-bi.x,$i.z,0,-$i.x,-yi.y,yi.x,0,-bi.y,bi.x,0,-$i.y,$i.x,0];return!vc(t,ys,bs,Ms,Ha)||(t=[1,0,0,0,1,0,0,0,1],!vc(t,ys,bs,Ms,Ha))?!1:(Va.crossVectors(yi,bi),t=[Va.x,Va.y,Va.z],vc(t,ys,bs,Ms,Ha))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Dn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Dn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ii[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ii[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ii[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ii[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ii[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ii[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ii[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ii[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ii),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},ii=[new O,new O,new O,new O,new O,new O,new O,new O],Dn=new O,ka=new qn,ys=new O,bs=new O,Ms=new O,yi=new O,bi=new O,$i=new O,pr=new O,Ha=new O,Va=new O,Wi=new O;Ct=new O,Ga=new Oe,Vp=0,ln=class extends Gn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Vp++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Id,this.updateRanges=[],this.gpuType=En,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ga.fromBufferAttribute(this,t),Ga.applyMatrix3(e),this.setXY(t,Ga.x,Ga.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix3(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix4(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyNormalMatrix(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.transformDirection(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Rs(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=on(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Rs(t,this.array)),t}setX(e,t){return this.normalized&&(t=on(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Rs(t,this.array)),t}setY(e,t){return this.normalized&&(t=on(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Rs(t,this.array)),t}setZ(e,t){return this.normalized&&(t=on(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Rs(t,this.array)),t}setW(e,t){return this.normalized&&(t=on(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=on(t,this.array),n=on(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=on(t,this.array),n=on(n,this.array),s=on(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=on(t,this.array),n=on(n,this.array),s=on(s,this.array),r=on(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}},Ar=class extends ln{constructor(e,t,n){super(new Uint16Array(e),t,n)}},Rr=class extends ln{constructor(e,t,n){super(new Uint32Array(e),t,n)}},gt=class extends ln{constructor(e,t,n){super(new Float32Array(e),t,n)}},Gp=new qn,mr=new O,_c=new O,oi=class{constructor(e=new O,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Gp.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;mr.subVectors(e,this.center);let t=mr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(mr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(_c.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(mr.copy(e.center).add(_c)),this.expandByPoint(mr.copy(e.center).sub(_c))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},$p=0,Mn=new ht,yc=new bt,Ss=new O,gn=new qn,gr=new qn,Ot=new O,Dt=class i extends Gn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:$p++}),this.uuid=js(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(pp(e)?Rr:Ar)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new $e().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Mn.makeRotationFromQuaternion(e),this.applyMatrix4(Mn),this}rotateX(e){return Mn.makeRotationX(e),this.applyMatrix4(Mn),this}rotateY(e){return Mn.makeRotationY(e),this.applyMatrix4(Mn),this}rotateZ(e){return Mn.makeRotationZ(e),this.applyMatrix4(Mn),this}translate(e,t,n){return Mn.makeTranslation(e,t,n),this.applyMatrix4(Mn),this}scale(e,t,n){return Mn.makeScale(e,t,n),this.applyMatrix4(Mn),this}lookAt(e){return yc.lookAt(e),yc.updateMatrix(),this.applyMatrix4(yc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ss).negate(),this.translate(Ss.x,Ss.y,Ss.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new gt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&ke("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new qn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){He("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];gn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ot.addVectors(this.boundingBox.min,gn.min),this.boundingBox.expandByPoint(Ot),Ot.addVectors(this.boundingBox.max,gn.max),this.boundingBox.expandByPoint(Ot)):(this.boundingBox.expandByPoint(gn.min),this.boundingBox.expandByPoint(gn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&He('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new oi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){He("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(e){let n=this.boundingSphere.center;if(gn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];gr.setFromBufferAttribute(o),this.morphTargetsRelative?(Ot.addVectors(gn.min,gr.min),gn.expandByPoint(Ot),Ot.addVectors(gn.max,gr.max),gn.expandByPoint(Ot)):(gn.expandByPoint(gr.min),gn.expandByPoint(gr.max))}gn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)Ot.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Ot));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Ot.fromBufferAttribute(o,c),l&&(Ss.fromBufferAttribute(e,c),Ot.add(Ss)),s=Math.max(s,n.distanceToSquared(Ot))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&He('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){He("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new ln(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let _=0;_<n.count;_++)o[_]=new O,l[_]=new O;let c=new O,u=new O,d=new O,h=new Oe,p=new Oe,g=new Oe,y=new O,m=new O;function f(_,T,C){c.fromBufferAttribute(n,_),u.fromBufferAttribute(n,T),d.fromBufferAttribute(n,C),h.fromBufferAttribute(r,_),p.fromBufferAttribute(r,T),g.fromBufferAttribute(r,C),u.sub(c),d.sub(c),p.sub(h),g.sub(h);let P=1/(p.x*g.y-g.x*p.y);isFinite(P)&&(y.copy(u).multiplyScalar(g.y).addScaledVector(d,-p.y).multiplyScalar(P),m.copy(d).multiplyScalar(p.x).addScaledVector(u,-g.x).multiplyScalar(P),o[_].add(y),o[T].add(y),o[C].add(y),l[_].add(m),l[T].add(m),l[C].add(m))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let _=0,T=S.length;_<T;++_){let C=S[_],P=C.start,L=C.count;for(let z=P,I=P+L;z<I;z+=3)f(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let w=new O,M=new O,E=new O,x=new O;function R(_){E.fromBufferAttribute(s,_),x.copy(E);let T=o[_];w.copy(T),w.sub(E.multiplyScalar(E.dot(T))).normalize(),M.crossVectors(x,T);let P=M.dot(l[_])<0?-1:1;a.setXYZW(_,w.x,w.y,w.z,P)}for(let _=0,T=S.length;_<T;++_){let C=S[_],P=C.start,L=C.count;for(let z=P,I=P+L;z<I;z+=3)R(e.getX(z+0)),R(e.getX(z+1)),R(e.getX(z+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new ln(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,p=n.count;h<p;h++)n.setXYZ(h,0,0,0);let s=new O,r=new O,a=new O,o=new O,l=new O,c=new O,u=new O,d=new O;if(e)for(let h=0,p=e.count;h<p;h+=3){let g=e.getX(h+0),y=e.getX(h+1),m=e.getX(h+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,y),a.fromBufferAttribute(t,m),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),o.fromBufferAttribute(n,g),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(g,o.x,o.y,o.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,p=t.count;h<p;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),a.fromBufferAttribute(t,h+2),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ot.fromBufferAttribute(e,t),Ot.normalize(),e.setXYZ(t,Ot.x,Ot.y,Ot.z)}toNonIndexed(){function e(o,l){let c=o.array,u=o.itemSize,d=o.normalized,h=new c.constructor(l.length*u),p=0,g=0;for(let y=0,m=l.length;y<m;y++){o.isInterleavedBufferAttribute?p=l[y]*o.data.stride+o.offset:p=l[y]*u;for(let f=0;f<u;f++)h[g++]=c[p++]}return new ln(h,u,d)}if(this.index===null)return ke("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,d=c.length;u<d;u++){let h=c[u],p=e(h,n);l.push(p)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){let p=c[d];u.push(p.toJSON(e.data))}u.length>0&&(s[l]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(t))}let r=e.morphAttributes;for(let c in r){let u=[],d=r[c];for(let h=0,p=d.length;h<p;h++)u.push(d[h].clone(t));this.morphAttributes[c]=u}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,u=a.length;c<u;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},bc=new O,Wp=new O,qp=new $e,xn=class{constructor(e=new O(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=bc.subVectors(n,t).cross(Wp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(bc),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||qp.getNormalMatrix(e),s=this.coplanarPoint(bc).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},jp=0,jn=class extends Gn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:jp++}),this.uuid=js(),this.name="",this.type="Material",this.blending=$s,this.side=Ii,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=zc,this.blendDst=kc,this.blendEquation=Ki,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Le(0,0,0),this.blendAlpha=0,this.depthFunc=Ps,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ed,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ao,this.stencilZFail=ao,this.stencilZPass=ao,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){ke(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){ke(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Le().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new xn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Oe().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Oe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},si=new O,Mc=new O,$a=new O,Wa=new O,Os=class{constructor(e=new O,t=new O(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,si)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=si.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(si.copy(this.origin).addScaledVector(this.direction,t),si.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Mc.copy(e).add(t).multiplyScalar(.5),$a.copy(t).sub(e).normalize(),Wa.copy(this.origin).sub(Mc);let r=e.distanceTo(t)*.5,a=-this.direction.dot($a),o=Wa.dot(this.direction),l=-Wa.dot($a),c=Wa.lengthSq(),u=Math.abs(1-a*a),d,h,p,g;if(u>0)if(d=a*l-o,h=a*o-l,g=r*u,d>=0)if(h>=-g)if(h<=g){let y=1/u;d*=y,h*=y,p=d*(d+a*h+2*o)+h*(a*d+h+2*l)+c}else h=r,d=Math.max(0,-(a*h+o)),p=-d*d+h*(h+2*l)+c;else h=-r,d=Math.max(0,-(a*h+o)),p=-d*d+h*(h+2*l)+c;else h<=-g?(d=Math.max(0,-(-a*r+o)),h=d>0?-r:Math.min(Math.max(-r,-l),r),p=-d*d+h*(h+2*l)+c):h<=g?(d=0,h=Math.min(Math.max(-r,-l),r),p=h*(h+2*l)+c):(d=Math.max(0,-(a*r+o)),h=d>0?r:Math.min(Math.max(-r,-l),r),p=-d*d+h*(h+2*l)+c);else h=a>0?-r:r,d=Math.max(0,-(a*h+o)),p=-d*d+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Mc).addScaledVector($a,h),p}intersectSphere(e,t){if(e.radius<0)return null;si.subVectors(e.center,this.origin);let n=si.dot(this.direction),s=si.dot(si)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(n=(e.min.x-h.x)*c,s=(e.max.x-h.x)*c):(n=(e.max.x-h.x)*c,s=(e.min.x-h.x)*c),u>=0?(r=(e.min.y-h.y)*u,a=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,a=(e.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-h.z)*d,l=(e.max.z-h.z)*d):(o=(e.max.z-h.z)*d,l=(e.min.z-h.z)*d),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,si)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,u=o.z,d=e.x-a.x,h=e.y-a.y,p=e.z-a.z,g=t.x-a.x,y=t.y-a.y,m=t.z-a.z,f=n.x-a.x,S=n.y-a.y,w=n.z-a.z,M=Math.abs(l),E=Math.abs(c),x=Math.abs(u),R,_,T,C,P,L,z,I,B,W,X,re;if(M>=E&&M>=x?(T=l,L=d,B=g,re=f,l>=0?(R=c,_=u,C=h,P=p,z=y,I=m,W=S,X=w):(R=u,_=c,C=p,P=h,z=m,I=y,W=w,X=S)):E>=x?(T=c,L=h,B=y,re=S,c>=0?(R=u,_=l,C=p,P=d,z=m,I=g,W=w,X=f):(R=l,_=u,C=d,P=p,z=g,I=m,W=f,X=w)):(T=u,L=p,B=m,re=w,u>=0?(R=l,_=c,C=d,P=h,z=g,I=y,W=f,X=S):(R=c,_=l,C=h,P=d,z=y,I=g,W=S,X=f)),T===0)return null;let q=R/T,te=_/T,ie=1/T,Ce=C-q*L,xe=P-te*L,st=z-q*B,qe=I-te*B,Ze=W-q*re,Z=X-te*re,ee=Ze*qe-Z*st,be=Ce*Z-xe*Ze,Be=st*xe-qe*Ce;if(s){if(ee<0||be<0||Be<0)return null}else if((ee<0||be<0||Be<0)&&(ee>0||be>0||Be>0))return null;let N=ee+be+Be;if(N===0)return null;let H=ie*(ee*L+be*B+Be*re);return(N>0?H<0:H>0)?null:this.at(H/N,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Pt=class extends jn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wn,this.combine=Fo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Oh=new ht,qi=new Os,qa=new oi,Bh=new O,ja=new O,Xa=new O,Ya=new O,Sc=new O,Za=new O,zh=new O,Ja=new O,Me=class extends bt{constructor(e=new Dt,t=new Pt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Za.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],d=r[l];u!==0&&(Sc.fromBufferAttribute(d,e),a?Za.addScaledVector(Sc,u):Za.addScaledVector(Sc.sub(t),u))}t.add(Za)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),qa.copy(n.boundingSphere),qa.applyMatrix4(r),qi.copy(e.ray).recast(e.near),!(qa.containsPoint(qi.origin)===!1&&(qi.intersectSphere(qa,Bh)===null||qi.origin.distanceToSquared(Bh)>(e.far-e.near)**2))&&(Oh.copy(r).invert(),qi.copy(e.ray).applyMatrix4(Oh),!(n.boundingBox!==null&&qi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,qi)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,y=h.length;g<y;g++){let m=h[g],f=a[m.materialIndex],S=Math.max(m.start,p.start),w=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let M=S,E=w;M<E;M+=3){let x=o.getX(M),R=o.getX(M+1),_=o.getX(M+2);s=Ka(this,f,e,n,c,u,d,x,R,_),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),y=Math.min(o.count,p.start+p.count);for(let m=g,f=y;m<f;m+=3){let S=o.getX(m),w=o.getX(m+1),M=o.getX(m+2);s=Ka(this,a,e,n,c,u,d,S,w,M),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,y=h.length;g<y;g++){let m=h[g],f=a[m.materialIndex],S=Math.max(m.start,p.start),w=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let M=S,E=w;M<E;M+=3){let x=M,R=M+1,_=M+2;s=Ka(this,f,e,n,c,u,d,x,R,_),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),y=Math.min(l.count,p.start+p.count);for(let m=g,f=y;m<f;m+=3){let S=m,w=m+1,M=m+2;s=Ka(this,a,e,n,c,u,d,S,w,M),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};Cr=class extends cn{constructor(e=null,t=1,n=1,s,r,a,o,l,c=zt,u=zt,d,h){super(null,a,o,l,c,u,s,r,d,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Pr=class extends ln{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Es=new ht,kh=new ht,Qa=[],Hh=new qn,Yp=new ht,xr=new Me,vr=new oi,un=class extends Me{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new Pr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Yp)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new qn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Es),Hh.copy(e.boundingBox).applyMatrix4(Es),this.boundingBox.union(Hh)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new oi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Es),vr.copy(e.boundingSphere).applyMatrix4(Es),this.boundingSphere.union(vr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=e*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(xr.geometry=this.geometry,xr.material=this.material,xr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),vr.copy(this.boundingSphere),vr.applyMatrix4(n),e.ray.intersectsSphere(vr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Es),kh.multiplyMatrices(n,Es),xr.matrixWorld=kh,xr.raycast(e,Qa);for(let a=0,o=Qa.length;a<o;a++){let l=Qa[a];l.instanceId=r,l.object=this,t.push(l)}Qa.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new Pr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Cr(new Float32Array(s*this.count),s,this.count,Go,En));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},ji=new oi,Zp=new Oe(.5,.5),eo=new O,Bs=class{constructor(e=new xn,t=new xn,n=new xn,s=new xn,r=new xn,a=new xn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Nn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],d=r[5],h=r[6],p=r[7],g=r[8],y=r[9],m=r[10],f=r[11],S=r[12],w=r[13],M=r[14],E=r[15];if(s[0].setComponents(c-a,p-u,f-g,E-S).normalize(),s[1].setComponents(c+a,p+u,f+g,E+S).normalize(),s[2].setComponents(c+o,p+d,f+y,E+w).normalize(),s[3].setComponents(c-o,p-d,f-y,E-w).normalize(),n)s[4].setComponents(l,h,m,M).normalize(),s[5].setComponents(c-l,p-h,f-m,E-M).normalize();else if(s[4].setComponents(c-l,p-h,f-m,E-M).normalize(),t===Nn)s[5].setComponents(c+l,p+h,f+m,E+M).normalize();else if(t===Is)s[5].setComponents(l,h,m,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ji.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ji.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ji)}intersectsSprite(e){ji.center.set(0,0,0);let t=Zp.distanceTo(e.center);return ji.radius=.7071067811865476+t,ji.applyMatrix4(e.matrixWorld),this.intersectsSphere(ji)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(eo.x=s.normal.x>0?e.max.x:e.min.x,eo.y=s.normal.y>0?e.max.y:e.min.y,eo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(eo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},zs=class extends jn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Le(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Vh=new ht,Pc=new Os,to=new oi,no=new O,Ir=class extends bt{constructor(e=new Dt,t=new zs){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),to.copy(n.boundingSphere),to.applyMatrix4(s),to.radius+=r,e.ray.intersectsSphere(to)===!1)return;Vh.copy(s).invert(),Pc.copy(e.ray).applyMatrix4(Vh);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,d=n.attributes.position;if(c!==null){let h=Math.max(0,a.start),p=Math.min(c.count,a.start+a.count);for(let g=h,y=p;g<y;g++){let m=c.getX(g);no.fromBufferAttribute(d,m),Gh(no,m,l,s,e,t,this)}}else{let h=Math.max(0,a.start),p=Math.min(d.count,a.start+a.count);for(let g=h,y=p;g<y;g++)no.fromBufferAttribute(d,g),Gh(no,g,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};Lr=class extends cn{constructor(e=[],t=Li,n,s,r,a,o,l,c,u){super(e,t,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Ei=class extends cn{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},Ti=class extends cn{constructor(e,t,n=Fn,s,r,a,o=zt,l=zt,c,u=Vn,d=1){if(u!==Vn&&u!==Ni)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:e,height:t,depth:d};super(h,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ns(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},yo=class extends Ti{constructor(e,t=Fn,n=Li,s,r,a=zt,o=zt,l,c=Vn){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,n,s,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Dr=class extends cn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Je=class i extends Dt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],d=[],h=0,p=0;g("z","y","x",-1,-1,n,t,e,a,r,0),g("z","y","x",1,-1,n,t,-e,a,r,1),g("x","z","y",1,1,e,n,t,s,a,2),g("x","z","y",1,-1,e,n,-t,s,a,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new gt(c,3)),this.setAttribute("normal",new gt(u,3)),this.setAttribute("uv",new gt(d,2));function g(y,m,f,S,w,M,E,x,R,_,T){let C=M/R,P=E/_,L=M/2,z=E/2,I=x/2,B=R+1,W=_+1,X=0,re=0,q=new O;for(let te=0;te<W;te++){let ie=te*P-z;for(let Ce=0;Ce<B;Ce++){let xe=Ce*C-L;q[y]=xe*S,q[m]=ie*w,q[f]=I,c.push(q.x,q.y,q.z),q[y]=0,q[m]=0,q[f]=x>0?1:-1,u.push(q.x,q.y,q.z),d.push(Ce/R),d.push(1-te/_),X+=1}}for(let te=0;te<_;te++)for(let ie=0;ie<R;ie++){let Ce=h+ie+B*te,xe=h+ie+B*(te+1),st=h+(ie+1)+B*(te+1),qe=h+(ie+1)+B*te;l.push(Ce,xe,qe),l.push(xe,st,qe),re+=6}o.addGroup(p,re,T),p+=re,h+=X}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}},wi=class i extends Dt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let u=[],d=[],h=[],p=[],g=0,y=[],m=n/2,f=0;S(),a===!1&&(e>0&&w(!0),t>0&&w(!1)),this.setIndex(u),this.setAttribute("position",new gt(d,3)),this.setAttribute("normal",new gt(h,3)),this.setAttribute("uv",new gt(p,2));function S(){let M=new O,E=new O,x=0,R=(t-e)/n;for(let _=0;_<=r;_++){let T=[],C=_/r,P=C*(t-e)+e;for(let L=0;L<=s;L++){let z=L/s,I=z*l+o,B=Math.sin(I),W=Math.cos(I);E.x=P*B,E.y=-C*n+m,E.z=P*W,d.push(E.x,E.y,E.z),M.set(B,R,W).normalize(),h.push(M.x,M.y,M.z),p.push(z,1-C),T.push(g++)}y.push(T)}for(let _=0;_<s;_++)for(let T=0;T<r;T++){let C=y[T][_],P=y[T+1][_],L=y[T+1][_+1],z=y[T][_+1];(e>0||T!==0)&&(u.push(C,P,z),x+=3),(t>0||T!==r-1)&&(u.push(P,L,z),x+=3)}c.addGroup(f,x,0),f+=x}function w(M){let E=g,x=new Oe,R=new O,_=0,T=M===!0?e:t,C=M===!0?1:-1;for(let L=1;L<=s;L++)d.push(0,m*C,0),h.push(0,C,0),p.push(.5,.5),g++;let P=g;for(let L=0;L<=s;L++){let I=L/s*l+o,B=Math.cos(I),W=Math.sin(I);R.x=T*W,R.y=m*C,R.z=T*B,d.push(R.x,R.y,R.z),h.push(0,C,0),x.x=B*.5+.5,x.y=W*.5*C+.5,p.push(x.x,x.y),g++}for(let L=0;L<s;L++){let z=E+L,I=P+L;M===!0?u.push(I,I+1,z):u.push(I+1,I,z),_+=3}c.addGroup(f,_,M===!0?1:2),f+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},hn=class i extends Dt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,d=e/o,h=t/l,p=[],g=[],y=[],m=[];for(let f=0;f<u;f++){let S=f*h-a;for(let w=0;w<c;w++){let M=w*d-r;g.push(M,-S,0),y.push(0,0,1),m.push(w/o),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let S=0;S<o;S++){let w=S+c*f,M=S+c*(f+1),E=S+1+c*(f+1),x=S+1+c*f;p.push(w,M,x),p.push(M,E,x)}this.setIndex(p),this.setAttribute("position",new gt(g,3)),this.setAttribute("normal",new gt(y,3)),this.setAttribute("uv",new gt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},Nr=class i extends Dt{constructor(e=.5,t=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);let o=[],l=[],c=[],u=[],d=e,h=(t-e)/s,p=new O,g=new Oe;for(let y=0;y<=s;y++){for(let m=0;m<=n;m++){let f=r+m/n*a;p.x=d*Math.cos(f),p.y=d*Math.sin(f),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/t+1)/2,g.y=(p.y/t+1)/2,u.push(g.x,g.y)}d+=h}for(let y=0;y<s;y++){let m=y*(n+1);for(let f=0;f<n;f++){let S=f+m,w=S,M=S+n+1,E=S+n+2,x=S+1;o.push(w,M,x),o.push(M,E,x)}}this.setIndex(o),this.setAttribute("position",new gt(l,3)),this.setAttribute("normal",new gt(c,3)),this.setAttribute("uv",new gt(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};ci={clone:ts,merge:sn},Kp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Qp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Mt=class extends jn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Kp,this.fragmentShader=Qp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ts(e.uniforms),this.uniformsGroups=Jp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Le().setHex(s.value);break;case"v2":this.uniforms[n].value=new Oe().fromArray(s.value);break;case"v3":this.uniforms[n].value=new O().fromArray(s.value);break;case"v4":this.uniforms[n].value=new yt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new $e().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ht().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},ks=class extends Mt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Tt=class extends jn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Le(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=na,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Ur=class extends jn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Le(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Le(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=na,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wn,this.combine=Fo,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},bo=class extends jn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Md,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Mo=class extends jn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};Ai=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},So=class extends Ai{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ac,endingEnd:Ac}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Rc:r=e,o=2*t-n;break;case Cc:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Rc:a=e,l=2*n-t;break;case Cc:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,u=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,p=this._weightNext,g=(n-t)/(s-t),y=g*g,m=y*g,f=-h*m+2*h*y-h*g,S=(1+h)*m+(-1.5-2*h)*y+(-.5+h)*g+1,w=(-1-p)*m+(1.5+p)*y+.5*g,M=p*m-p*y;for(let E=0;E!==o;++E)r[E]=f*a[u+E]+S*a[c+E]+w*a[l+E]+M*a[d+E];return r}},Eo=class extends Ai{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=(n-t)/(s-t),d=1-u;for(let h=0;h!==o;++h)r[h]=a[c+h]*d+a[l+h]*u;return r}},To=class extends Ai{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},wo=class extends Ai{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,u=this.inTangents,d=this.outTangents;if(!u||!d){let g=(n-t)/(s-t),y=1-g;for(let m=0;m!==o;++m)r[m]=a[c+m]*y+a[l+m]*g;return r}let h=o*2,p=e-1;for(let g=0;g!==o;++g){let y=a[c+g],m=a[l+g],f=p*h+g*2,S=d[f],w=d[f+1],M=e*h+g*2,E=u[M],x=u[M+1],R=tm(n,t,S,E,s);r[g]=Od(R,y,w,x,m)}return r}};vn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ts(t,this.TimeBufferType),this.values=Ts(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ts(e.times,Array),values:Ts(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),Ec(e.settings)&&(n.settings={inTangents:Ts(e.settings.inTangents,Array),outTangents:Ts(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new To(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Eo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new So(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new wo(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case br:t=this.InterpolantFactoryMethodDiscrete;break;case go:t=this.InterpolantFactoryMethodLinear;break;case ro:t=this.InterpolantFactoryMethodSmooth;break;case wc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return ke("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return br;case this.InterpolantFactoryMethodLinear:return go;case this.InterpolantFactoryMethodSmooth:return ro;case this.InterpolantFactoryMethodBezier:return wc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;Ec(this.settings)&&(Wh(this.settings.inTangents,e),Wh(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(He("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(He("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){He("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){He("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&mp(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){He("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===ro,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],u=e[o+1];if(c!==u&&(o!==1||c!==e[0]))if(s)l=!0;else{let d=o*n,h=d-n,p=d+n;for(let g=0;g!==n;++g){let y=t[d+g];if(y!==t[h+g]||y!==t[p+g]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let d=o*n,h=a*n;for(let p=0;p!==n;++p)t[h+p]=t[d+p]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,Ec(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};vn.prototype.ValueTypeName="";vn.prototype.TimeBufferType=Float32Array;vn.prototype.ValueBufferType=Float32Array;vn.prototype.DefaultInterpolation=go;Ri=class extends vn{constructor(e,t,n){super(e,t,n)}};Ri.prototype.ValueTypeName="bool";Ri.prototype.ValueBufferType=Array;Ri.prototype.DefaultInterpolation=br;Ri.prototype.InterpolantFactoryMethodLinear=void 0;Ri.prototype.InterpolantFactoryMethodSmooth=void 0;Ao=class extends vn{constructor(e,t,n,s){super(e,t,n,s)}};Ao.prototype.ValueTypeName="color";Ro=class extends vn{constructor(e,t,n,s){super(e,t,n,s)}};Ro.prototype.ValueTypeName="number";Co=class extends Ai{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let u=c+o;c!==u;c+=4)$n.slerpFlat(r,0,a,c-o,a,c,l);return r}},Fr=class extends vn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Co(this.times,this.values,this.getValueSize(),e)}};Fr.prototype.ValueTypeName="quaternion";Fr.prototype.InterpolantFactoryMethodSmooth=void 0;Ci=class extends vn{constructor(e,t,n){super(e,t,n)}};Ci.prototype.ValueTypeName="string";Ci.prototype.ValueBufferType=Array;Ci.prototype.DefaultInterpolation=br;Ci.prototype.InterpolantFactoryMethodLinear=void 0;Ci.prototype.InterpolantFactoryMethodSmooth=void 0;Po=class extends vn{constructor(e,t,n,s){super(e,t,n,s)}};Po.prototype.ValueTypeName="vector";Io=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,d){return c.push(u,d),this},this.removeHandler=function(u){let d=c.indexOf(u);return d!==-1&&c.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=c.length;d<h;d+=2){let p=c[d],g=c[d+1];if(p.global&&(p.lastIndex=0),p.test(u))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Bd=new Io,Lo=class{constructor(e){this.manager=e!==void 0?e:Bd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Lo.DEFAULT_MATERIAL_NAME="__DEFAULT";Hs=class extends bt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Le(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Or=class extends Hs{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Le(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Tc=new ht,qh=new O,jh=new O,Br=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Oe(512,512),this.mapType=fn,this.map=null,this.mapPass=null,this.matrix=new ht,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Bs,this._frameExtents=new Oe(1,1),this._viewportCount=1,this._viewports=[new yt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;qh.setFromMatrixPosition(e.matrixWorld),t.position.copy(qh),jh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(jh),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){Tc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Tc,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===Is||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Tc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},io=new O,so=new $n,kn=new O,zr=class extends bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ht,this.projectionMatrix=new ht,this.projectionMatrixInverse=new ht,this.coordinateSystem=Nn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(io,so,kn),kn.x===1&&kn.y===1&&kn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(io,so,kn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(io,so,kn),kn.x===1&&kn.y===1&&kn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(io,so,kn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Mi=new O,Xh=new Oe,Yh=new Oe,$t=class extends zr{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ds*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(_r*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ds*2*Math.atan(Math.tan(_r*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Mi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Mi.x,Mi.y).multiplyScalar(-e/Mi.z),Mi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Mi.x,Mi.y).multiplyScalar(-e/Mi.z)}getViewSize(e,t){return this.getViewBounds(e,Xh,Yh),t.subVectors(Yh,Xh)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(_r*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Ic=class extends Br{constructor(){super(new $t(90,1,.5,500)),this.isPointLightShadow=!0}},Zi=class extends Hs{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Ic}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},Pi=class extends zr{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Lc=class extends Br{constructor(){super(new Pi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Vs=class extends Hs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.target=new bt,this.shadow=new Lc}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},ws=-90,As=1,Do=class extends bt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new $t(ws,As,e,t);s.layers=this.layers,this.add(s);let r=new $t(ws,As,e,t);r.layers=this.layers,this.add(r);let a=new $t(ws,As,e,t);a.layers=this.layers,this.add(a);let o=new $t(ws,As,e,t);o.layers=this.layers,this.add(o);let l=new $t(ws,As,e,t);l.layers=this.layers,this.add(l);let c=new $t(ws,As,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===Nn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Is)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,d=e.getRenderTarget(),h=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(d,h,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},No=class extends $t{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},kr=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=nm.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};Qc="\\[\\]\\.:\\/",im=new RegExp("["+Qc+"]","g"),eu="[^"+Qc+"]",sm="[^"+Qc.replace("\\.","")+"]",rm=/((?:WC+[\/:])*)/.source.replace("WC",eu),am=/(WCOD+)?/.source.replace("WCOD",sm),om=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",eu),lm=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",eu),cm=new RegExp("^"+rm+am+om+lm+"$"),um=["material","materials","bones","map"],Dc=class{constructor(e,t,n){let s=n||_t.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},_t=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(im,"")}static parseTrackName(e){let t=cm.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);um.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){ke("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){He("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){He("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){He("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===c){c=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){He("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){He("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){He("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){He("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;He("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){He("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){He("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};_t.Composite=Dc;_t.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};_t.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};_t.prototype.GetterByBindingType=[_t.prototype._getValue_direct,_t.prototype._getValue_array,_t.prototype._getValue_arrayElement,_t.prototype._getValue_toArray];_t.prototype.SetterByBindingTypeAndVersioning=[[_t.prototype._setValue_direct,_t.prototype._setValue_direct_setNeedsUpdate,_t.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_array,_t.prototype._setValue_array_setNeedsUpdate,_t.prototype._setValue_array_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_arrayElement,_t.prototype._setValue_arrayElement_setNeedsUpdate,_t.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[_t.prototype._setValue_fromArray,_t.prototype._setValue_fromArray_setNeedsUpdate,_t.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];Jy=new Float32Array(1),Zh=new ht,Hr=class{constructor(e,t,n=0,s=1/0){this.ray=new Os(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new Us,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):He("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Zh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Zh),this}intersectObject(e,t=!0,n=[]){return Nc(e,this,n,t),n.sort(Jh),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Nc(e[s],this,n,t);return n.sort(Jh),n}};au=class au{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};au.prototype.isMatrix2=!0;Uc=au;typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?ke("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186")});function of(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function fm(i){let e=new WeakMap;function t(o,l){let c=o.array,u=o.usage,d=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,l,c){let u=l.array,d=l.updateRanges;if(i.bindBuffer(c,o),d.length===0)i.bufferSubData(c,0,u);else{d.sort((p,g)=>p.start-g.start);let h=0;for(let p=1;p<d.length;p++){let g=d[h],y=d[p];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++h,d[h]=y)}d.length=h+1;for(let p=0,g=d.length;p<g;p++){let y=d[p];i.bufferSubData(c,y.start*u.BYTES_PER_ELEMENT,u,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=e.get(o);(!u||u.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}function Y0(i,e,t,n,s,r){let a=new Le(0),o=s===!0?0:1,l,c,u=null,d=0,h=null;function p(S){let w=S.isScene===!0?S.background:null;if(w&&w.isTexture){let M=S.backgroundBlurriness>0;w=e.get(w,M)}return w}function g(S){let w=!1,M=p(S);M===null?m(a,o):M&&M.isColor&&(m(M,1),w=!0);let E=i.xr.getEnvironmentBlendMode();E==="additive"?t.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||w)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function y(S,w){let M=p(w);M&&(M.isCubeTexture||M.mapping===Xr)?(c===void 0&&(c=new Me(new Je(1,1,1),new Mt({name:"BackgroundCubeMaterial",uniforms:ts(Zn.backgroundCube.uniforms),vertexShader:Zn.backgroundCube.vertexShader,fragmentShader:Zn.backgroundCube.fragmentShader,side:qt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,x,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=M,c.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(X0.makeRotationFromEuler(w.backgroundRotation)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(lf),c.material.toneMapped=Ke.getTransfer(M.colorSpace)!==it,(u!==M||d!==M.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=M,d=M.version,h=i.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null)):M&&M.isTexture&&(l===void 0&&(l=new Me(new hn(2,2),new Mt({name:"BackgroundMaterial",uniforms:ts(Zn.background.uniforms),vertexShader:Zn.background.vertexShader,fragmentShader:Zn.background.fragmentShader,side:Ii,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=M,l.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,l.material.toneMapped=Ke.getTransfer(M.colorSpace)!==it,M.matrixAutoUpdate===!0&&M.updateMatrix(),l.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||d!==M.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=M,d=M.version,h=i.toneMapping),l.layers.enableAll(),S.unshift(l,l.geometry,l.material,0,0,null))}function m(S,w){S.getRGB(wl,Kc(i)),t.buffers.color.setClear(wl.r,wl.g,wl.b,w,r)}function f(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(S,w=1){a.set(S),o=w,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(S){o=S,m(a,o)},render:g,addToRenderList:y,dispose:f}}function Z0(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,a=!1;function o(P,L,z,I,B){let W=!1,X=d(P,I,z,L);r!==X&&(r=X,c(r.object)),W=p(P,I,z,B),W&&g(P,I,z,B),B!==null&&e.update(B,i.ELEMENT_ARRAY_BUFFER),(W||a)&&(a=!1,M(P,L,z,I),B!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(B).buffer))}function l(){return i.createVertexArray()}function c(P){return i.bindVertexArray(P)}function u(P){return i.deleteVertexArray(P)}function d(P,L,z,I){let B=I.wireframe===!0,W=n[L.id];W===void 0&&(W={},n[L.id]=W);let X=P.isInstancedMesh===!0?P.id:0,re=W[X];re===void 0&&(re={},W[X]=re);let q=re[z.id];q===void 0&&(q={},re[z.id]=q);let te=q[B];return te===void 0&&(te=h(l()),q[B]=te),te}function h(P){let L=[],z=[],I=[];for(let B=0;B<t;B++)L[B]=0,z[B]=0,I[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:z,attributeDivisors:I,object:P,attributes:{},index:null}}function p(P,L,z,I){let B=r.attributes,W=L.attributes,X=0,re=z.getAttributes();for(let q in re)if(re[q].location>=0){let ie=B[q],Ce=W[q];if(Ce===void 0&&(q==="instanceMatrix"&&P.instanceMatrix&&(Ce=P.instanceMatrix),q==="instanceColor"&&P.instanceColor&&(Ce=P.instanceColor)),ie===void 0||ie.attribute!==Ce||Ce&&ie.data!==Ce.data)return!0;X++}return r.attributesNum!==X||r.index!==I}function g(P,L,z,I){let B={},W=L.attributes,X=0,re=z.getAttributes();for(let q in re)if(re[q].location>=0){let ie=W[q];ie===void 0&&(q==="instanceMatrix"&&P.instanceMatrix&&(ie=P.instanceMatrix),q==="instanceColor"&&P.instanceColor&&(ie=P.instanceColor));let Ce={};Ce.attribute=ie,ie&&ie.data&&(Ce.data=ie.data),B[q]=Ce,X++}r.attributes=B,r.attributesNum=X,r.index=I}function y(){let P=r.newAttributes;for(let L=0,z=P.length;L<z;L++)P[L]=0}function m(P){f(P,0)}function f(P,L){let z=r.newAttributes,I=r.enabledAttributes,B=r.attributeDivisors;z[P]=1,I[P]===0&&(i.enableVertexAttribArray(P),I[P]=1),B[P]!==L&&(i.vertexAttribDivisor(P,L),B[P]=L)}function S(){let P=r.newAttributes,L=r.enabledAttributes;for(let z=0,I=L.length;z<I;z++)L[z]!==P[z]&&(i.disableVertexAttribArray(z),L[z]=0)}function w(P,L,z,I,B,W,X){X===!0?i.vertexAttribIPointer(P,L,z,B,W):i.vertexAttribPointer(P,L,z,I,B,W)}function M(P,L,z,I){y();let B=I.attributes,W=z.getAttributes(),X=L.defaultAttributeValues;for(let re in W){let q=W[re];if(q.location>=0){let te=B[re];if(te===void 0&&(re==="instanceMatrix"&&P.instanceMatrix&&(te=P.instanceMatrix),re==="instanceColor"&&P.instanceColor&&(te=P.instanceColor)),te!==void 0){let ie=te.normalized,Ce=te.itemSize,xe=e.get(te);if(xe===void 0)continue;let st=xe.buffer,qe=xe.type,Ze=xe.bytesPerElement,Z=qe===i.INT||qe===i.UNSIGNED_INT||te.gpuType===ko;if(te.isInterleavedBufferAttribute){let ee=te.data,be=ee.stride,Be=te.offset;if(ee.isInstancedInterleavedBuffer){for(let N=0;N<q.locationSize;N++)f(q.location+N,ee.meshPerAttribute);P.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let N=0;N<q.locationSize;N++)m(q.location+N);i.bindBuffer(i.ARRAY_BUFFER,st);for(let N=0;N<q.locationSize;N++)w(q.location+N,Ce/q.locationSize,qe,ie,be*Ze,(Be+Ce/q.locationSize*N)*Ze,Z)}else{if(te.isInstancedBufferAttribute){for(let ee=0;ee<q.locationSize;ee++)f(q.location+ee,te.meshPerAttribute);P.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let ee=0;ee<q.locationSize;ee++)m(q.location+ee);i.bindBuffer(i.ARRAY_BUFFER,st);for(let ee=0;ee<q.locationSize;ee++)w(q.location+ee,Ce/q.locationSize,qe,ie,Ce*Ze,Ce/q.locationSize*ee*Ze,Z)}}else if(X!==void 0){let ie=X[re];if(ie!==void 0)switch(ie.length){case 2:i.vertexAttrib2fv(q.location,ie);break;case 3:i.vertexAttrib3fv(q.location,ie);break;case 4:i.vertexAttrib4fv(q.location,ie);break;default:i.vertexAttrib1fv(q.location,ie)}}}}S()}function E(){T();for(let P in n){let L=n[P];for(let z in L){let I=L[z];for(let B in I){let W=I[B];for(let X in W)u(W[X].object),delete W[X];delete I[B]}}delete n[P]}}function x(P){if(n[P.id]===void 0)return;let L=n[P.id];for(let z in L){let I=L[z];for(let B in I){let W=I[B];for(let X in W)u(W[X].object),delete W[X];delete I[B]}}delete n[P.id]}function R(P){for(let L in n){let z=n[L];for(let I in z){let B=z[I];if(B[P.id]===void 0)continue;let W=B[P.id];for(let X in W)u(W[X].object),delete W[X];delete B[P.id]}}}function _(P){for(let L in n){let z=n[L],I=P.isInstancedMesh===!0?P.id:0,B=z[I];if(B!==void 0){for(let W in B){let X=B[W];for(let re in X)u(X[re].object),delete X[re];delete B[W]}delete z[I],Object.keys(z).length===0&&delete n[L]}}}function T(){C(),a=!0,r!==s&&(r=s,c(r.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:T,resetDefaultState:C,dispose:E,releaseStatesOfGeometry:x,releaseStatesOfObject:_,releaseStatesOfProgram:R,initAttributes:y,enableAttribute:m,disableUnusedAttributes:S}}function J0(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,u){u!==0&&(i.drawArraysInstanced(n,l,c,u),t.update(c,n,u))}function o(l,c,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,u);let h=0;for(let p=0;p<u;p++)h+=c[p];t.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function K0(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let R=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(R){return!(R!==Tn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){let _=R===Nt&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==fn&&R!==En&&!_&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",u=l(c);u!==c&&(ke("WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let d=t.logarithmicDepthBuffer===!0,h=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&h===!1&&ke("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),f=i.getParameter(i.MAX_VERTEX_ATTRIBS),S=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),w=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=i.getParameter(i.MAX_SAMPLES),x=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:h,maxTextures:p,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:S,maxVaryings:w,maxFragmentUniforms:M,maxSamples:E,samples:x}}function Q0(i){let e=this,t=null,n=0,s=!1,r=!1,a=new xn,o=new $e,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){let p=d.length!==0||h||n!==0||s;return s=h,n=d.length,p},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){t=u(d,h,0)},this.setState=function(d,h,p){let g=d.clippingPlanes,y=d.clipIntersection,m=d.clipShadows,f=i.get(d);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{let S=r?0:n,w=S*4,M=f.clippingState||null;l.value=M,M=u(g,h,w,p);for(let E=0;E!==w;++E)M[E]=t[E];f.clippingState=M,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(d,h,p,g){let y=d!==null?d.length:0,m=null;if(y!==0){if(m=l.value,g!==!0||m===null){let f=p+y*4,S=h.matrixWorldInverse;o.getNormalMatrix(S),(m===null||m.length<f)&&(m=new Float32Array(f));for(let w=0,M=p;w!==y;++w,M+=4)a.copy(d[w]).applyMatrix4(S,o),a.normal.toArray(m,M),m[M+3]=a.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}function sx(i){let e=[],t=[],n=i,s=i-Ys+1+ex;for(let r=0;r<s;r++){let a=Math.pow(2,n);e.push(a);let o=1/(a-2),l=-o,c=1+o,u=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,h=6,p=3,g=new Float32Array(p*h*d),y=new Float32Array(p*h*d);for(let f=0;f<d;f++){let S=f%3*2/3-1,w=f>2?0:-1,M=[S,w,0,S+2/3,w,0,S+2/3,w+1,0,S,w,0,S+2/3,w+1,0,S,w+1,0];g.set(M,p*h*f);for(let E=0;E<h;E++){let x=u[E*2]*2-1,R=u[E*2+1]*2-1;f===0?ns.set(1,R,x):f===1?ns.set(-x,1,-R):f===2?ns.set(-x,R,1):f===3?ns.set(-1,R,-x):f===4?ns.set(-x,-1,R):ns.set(x,R,-1),ns.toArray(y,(f*h+E)*p)}}let m=new Dt;m.setAttribute("position",new ln(g,p)),m.setAttribute("outputDirection",new ln(y,p)),t.push(new Me(m,null)),n>Ys&&n--}return{lodMeshes:t,sizeLods:e}}function kd(i,e,t){let n=new Et(i,e,t);return n.texture.mapping=Xr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Xs(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function rx(i,e,t){return new Mt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:nx,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Pl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function ax(i,e,t){return new Mt({name:"SphericalGaussianBlur",defines:{SAMPLES:tx,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Pl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function Hd(){return new Mt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Pl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function Vd(){return new Mt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Pl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Sn,depthTest:!1,depthWrite:!1})}function Pl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}function ox(i){let e=new WeakMap,t=new WeakMap,n=null;function s(h,p=!1){return h==null?null:p?a(h):r(h)}function r(h){if(h&&h.isTexture){let p=h.mapping;if(p===Oo||p===Bo)if(e.has(h)){let g=e.get(h).texture;return o(g,h.mapping)}else{let g=h.image;if(g&&g.height>0){let y=new Rl(g.height);return y.fromEquirectangularTexture(i,h),e.set(h,y),h.addEventListener("dispose",c),o(y.texture,h.mapping)}else return null}}return h}function a(h){if(h&&h.isTexture){let p=h.mapping,g=p===Oo||p===Bo,y=p===Li||p===es;if(g||y){let m=t.get(h),f=m!==void 0?m.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==f)return n===null&&(n=new Js(i)),m=g?n.fromEquirectangular(h,m):n.fromCubemap(h,m),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),m.texture;if(m!==void 0)return m.texture;{let S=h.image;return g&&S&&S.height>0||y&&S&&l(S)?(n===null&&(n=new Js(i)),m=g?n.fromEquirectangular(h):n.fromCubemap(h),m.texture.pmremVersion=h.pmremVersion,t.set(h,m),h.addEventListener("dispose",u),m.texture):null}}}return h}function o(h,p){return p===Oo?h.mapping=Li:p===Bo&&(h.mapping=es),h}function l(h){let p=0,g=6;for(let y=0;y<g;y++)h[y]!==void 0&&p++;return p===g}function c(h){let p=h.target;p.removeEventListener("dispose",c);let g=e.get(p);g!==void 0&&(e.delete(p),g.dispose())}function u(h){let p=h.target;p.removeEventListener("dispose",u);let g=t.get(p);g!==void 0&&(t.delete(p),g.dispose())}function d(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:d}}function lx(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Xi("WebGLRenderer: "+n+" extension not supported."),s}}}function cx(i,e,t,n){let s={},r=new WeakMap;function a(d){let h=d.target;h.index!==null&&e.remove(h.index);for(let g in h.attributes)e.remove(h.attributes[g]);h.removeEventListener("dispose",a),delete s[h.id];let p=r.get(h);p&&(e.remove(p),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,t.memory.geometries--}function o(d,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,t.memory.geometries++),h}function l(d){let h=d.attributes;for(let p in h)e.update(h[p],i.ARRAY_BUFFER)}function c(d){let h=[],p=d.index,g=d.attributes.position,y=0;if(g===void 0)return;if(p!==null){let S=p.array;y=p.version;for(let w=0,M=S.length;w<M;w+=3){let E=S[w+0],x=S[w+1],R=S[w+2];h.push(E,x,x,R,R,E)}}else{let S=g.array;y=g.version;for(let w=0,M=S.length/3-1;w<M;w+=3){let E=w+0,x=w+1,R=w+2;h.push(E,x,x,R,R,E)}}let m=new(g.count>=65535?Rr:Ar)(h,1);m.version=y;let f=r.get(d);f&&e.remove(f),r.set(d,m)}function u(d){let h=r.get(d);if(h){let p=d.index;p!==null&&h.version<p.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:u}}function ux(i,e,t){let n;function s(d){n=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,h){i.drawElements(n,h,r,d*a),t.update(h,n,1)}function c(d,h,p){p!==0&&(i.drawElementsInstanced(n,h,r,d*a,p),t.update(h,n,p))}function u(d,h,p){if(p===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,d,0,p);let y=0;for(let m=0;m<p;m++)y+=h[m];t.update(y,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u}function hx(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:He("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function dx(i,e,t){let n=new WeakMap,s=new yt;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=u!==void 0?u.length:0,h=n.get(o);if(h===void 0||h.count!==d){let T=function(){R.dispose(),n.delete(o),o.removeEventListener("dispose",T)};h!==void 0&&h.texture.dispose();let p=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],f=o.morphAttributes.normal||[],S=o.morphAttributes.color||[],w=0;p===!0&&(w=1),g===!0&&(w=2),y===!0&&(w=3);let M=o.attributes.position.count*w,E=1;M>e.maxTextureSize&&(E=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);let x=new Float32Array(M*E*4*d),R=new Tr(x,M,E,d);R.type=En,R.needsUpdate=!0;let _=w*4;for(let C=0;C<d;C++){let P=m[C],L=f[C],z=S[C],I=M*E*4*C;for(let B=0;B<P.count;B++){let W=B*_;p===!0&&(s.fromBufferAttribute(P,B),x[I+W+0]=s.x,x[I+W+1]=s.y,x[I+W+2]=s.z,x[I+W+3]=0),g===!0&&(s.fromBufferAttribute(L,B),x[I+W+4]=s.x,x[I+W+5]=s.y,x[I+W+6]=s.z,x[I+W+7]=0),y===!0&&(s.fromBufferAttribute(z,B),x[I+W+8]=s.x,x[I+W+9]=s.y,x[I+W+10]=s.z,x[I+W+11]=z.itemSize===4?s.w:1)}}h={count:d,texture:R,size:new Oe(M,E)},n.set(o,h),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let p=0;for(let y=0;y<c.length;y++)p+=c[y];let g=o.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function fx(i,e,t,n,s){let r=new WeakMap;function a(c){let u=s.render.frame,d=c.geometry,h=e.get(c,d);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==u&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,u))),c.isSkinnedMesh){let p=c.skeleton;r.get(p)!==u&&(p.update(),r.set(p,u))}return h}function o(){r=new WeakMap}function l(c){let u=c.target;u.removeEventListener("dispose",l),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:a,dispose:o}}function mx(i,e,t,n,s,r){let a=new Et(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Dt;c.setAttribute("position",new gt([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new gt([0,2,0,0,2,0],2));let u=new ks({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Me(c,u),h=new Pi(-1,1,1,-1,0,1),p=null,g=null,y=!1,m,f=null,S=[],w=!1;this.setSize=function(M,E){a.setSize(M,E),o!==null&&o.setSize(M,E),l!==null&&l.setSize(M,E);for(let x=0;x<S.length;x++){let R=S[x];R.setSize&&R.setSize(M,E)}},this.setEffects=function(M){S=M,w=S.length>0&&S[0].isRenderPass===!0;let E=a.width,x=a.height;S.length>0&&o===null&&(o=new Et(E,x,{type:Nt,depthBuffer:!1,stencilBuffer:!1}),l=new Et(E,x,{type:Nt,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<S.length;R++){let _=S[R];_.setSize&&_.setSize(E,x)}},this.begin=function(M,E){if(y||M.toneMapping===Un&&S.length===0)return!1;if(f=E,E!==null){let x=E.width,R=E.height;(a.width!==x||a.height!==R)&&this.setSize(x,R)}return w===!1&&M.setRenderTarget(a),m=M.toneMapping,M.toneMapping=Un,!0},this.hasRenderPass=function(){return w},this.end=function(M,E){M.toneMapping=m,y=!0;let x=a,R=o;for(let _=0;_<S.length;_++){let T=S[_];T.enabled!==!1&&(T.render(M,R,x,E),T.needsSwap!==!1&&(x=R,R=R===o?l:o))}if(p!==M.outputColorSpace||g!==M.toneMapping){p=M.outputColorSpace,g=M.toneMapping,u.defines={},Ke.getTransfer(p)===it&&(u.defines.SRGB_TRANSFER="");let _=px[g];_&&(u.defines[_]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=x.texture,M.setRenderTarget(f),M.render(d,h),f=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),u.dispose()}}function Ks(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Gd[s];if(r===void 0&&(r=new Float32Array(s),Gd[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function Ut(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Ft(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Il(i,e){let t=$d[e];t===void 0&&(t=new Int32Array(e),$d[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function gx(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function xx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;i.uniform2fv(this.addr,e),Ft(t,e)}}function vx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ut(t,e))return;i.uniform3fv(this.addr,e),Ft(t,e)}}function _x(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;i.uniform4fv(this.addr,e),Ft(t,e)}}function yx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ut(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Ft(t,e)}else{if(Ut(t,n))return;jd.set(n),i.uniformMatrix2fv(this.addr,!1,jd),Ft(t,n)}}function bx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ut(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Ft(t,e)}else{if(Ut(t,n))return;qd.set(n),i.uniformMatrix3fv(this.addr,!1,qd),Ft(t,n)}}function Mx(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ut(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Ft(t,e)}else{if(Ut(t,n))return;Wd.set(n),i.uniformMatrix4fv(this.addr,!1,Wd),Ft(t,n)}}function Sx(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Ex(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;i.uniform2iv(this.addr,e),Ft(t,e)}}function Tx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;i.uniform3iv(this.addr,e),Ft(t,e)}}function wx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;i.uniform4iv(this.addr,e),Ft(t,e)}}function Ax(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Rx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ut(t,e))return;i.uniform2uiv(this.addr,e),Ft(t,e)}}function Cx(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ut(t,e))return;i.uniform3uiv(this.addr,e),Ft(t,e)}}function Px(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ut(t,e))return;i.uniform4uiv(this.addr,e),Ft(t,e)}}function Ix(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(pu.compareFunction=t.isReversedDepthBuffer()?El:Sl,r=pu):r=cf,t.setTexture2D(e||r,s)}function Lx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||hf,s)}function Dx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||df,s)}function Nx(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||uf,s)}function Ux(i){switch(i){case 5126:return gx;case 35664:return xx;case 35665:return vx;case 35666:return _x;case 35674:return yx;case 35675:return bx;case 35676:return Mx;case 5124:case 35670:return Sx;case 35667:case 35671:return Ex;case 35668:case 35672:return Tx;case 35669:case 35673:return wx;case 5125:return Ax;case 36294:return Rx;case 36295:return Cx;case 36296:return Px;case 35678:case 36198:case 36298:case 36306:case 35682:return Ix;case 35679:case 36299:case 36307:return Lx;case 35680:case 36300:case 36308:case 36293:return Dx;case 36289:case 36303:case 36311:case 36292:return Nx}}function Fx(i,e){i.uniform1fv(this.addr,e)}function Ox(i,e){let t=Ks(e,this.size,2);i.uniform2fv(this.addr,t)}function Bx(i,e){let t=Ks(e,this.size,3);i.uniform3fv(this.addr,t)}function zx(i,e){let t=Ks(e,this.size,4);i.uniform4fv(this.addr,t)}function kx(i,e){let t=Ks(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Hx(i,e){let t=Ks(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Vx(i,e){let t=Ks(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Gx(i,e){i.uniform1iv(this.addr,e)}function $x(i,e){i.uniform2iv(this.addr,e)}function Wx(i,e){i.uniform3iv(this.addr,e)}function qx(i,e){i.uniform4iv(this.addr,e)}function jx(i,e){i.uniform1uiv(this.addr,e)}function Xx(i,e){i.uniform2uiv(this.addr,e)}function Yx(i,e){i.uniform3uiv(this.addr,e)}function Zx(i,e){i.uniform4uiv(this.addr,e)}function Jx(i,e,t){let n=this.cache,s=e.length,r=Il(t,s);Ut(n,r)||(i.uniform1iv(this.addr,r),Ft(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=pu:a=cf;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function Kx(i,e,t){let n=this.cache,s=e.length,r=Il(t,s);Ut(n,r)||(i.uniform1iv(this.addr,r),Ft(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||hf,r[a])}function Qx(i,e,t){let n=this.cache,s=e.length,r=Il(t,s);Ut(n,r)||(i.uniform1iv(this.addr,r),Ft(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||df,r[a])}function ev(i,e,t){let n=this.cache,s=e.length,r=Il(t,s);Ut(n,r)||(i.uniform1iv(this.addr,r),Ft(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||uf,r[a])}function tv(i){switch(i){case 5126:return Fx;case 35664:return Ox;case 35665:return Bx;case 35666:return zx;case 35674:return kx;case 35675:return Hx;case 35676:return Vx;case 5124:case 35670:return Gx;case 35667:case 35671:return $x;case 35668:case 35672:return Wx;case 35669:case 35673:return qx;case 5125:return jx;case 36294:return Xx;case 36295:return Yx;case 36296:return Zx;case 35678:case 36198:case 36298:case 36306:case 35682:return Jx;case 35679:case 36299:case 36307:return Kx;case 35680:case 36300:case 36308:case 36293:return Qx;case 36289:case 36303:case 36311:case 36292:return ev}}function Xd(i,e){i.seq.push(e),i.map[e.id]=e}function nv(i,e,t){let n=i.name,s=n.length;for(du.lastIndex=0;;){let r=du.exec(n),a=du.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Xd(t,c===void 0?new mu(o,i,e):new gu(o,i,e));break}else{let d=t.map[o];d===void 0&&(d=new xu(o),Xd(t,d)),t=d}}}function Yd(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}function rv(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}function av(i){Ke._getMatrix(Zd,Ke.workingColorSpace,i);let e=`mat3( ${Zd.elements.map(t=>t.toFixed(4))} )`;switch(Ke.getTransfer(i)){case Sr:return[e,"LinearTransferOETF"];case it:return[e,"sRGBTransferOETF"];default:return ke("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Jd(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+rv(i.getShaderSource(e),o)}else return r}function ov(i,e){let t=av(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function cv(i,e){let t=lv[e];return t===void 0?(ke("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}function uv(){Ke.getLuminanceCoefficients(Al);let i=Al.x.toFixed(4),e=Al.y.toFixed(4),t=Al.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function hv(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ra).join(`
`)}function dv(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function fv(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function ra(i){return i!==""}function Kd(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Qd(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}function vu(i){return i.replace(pv,gv)}function gv(i,e){let t=Ye[e];if(t===void 0){let n=mv.get(e);if(n!==void 0)t=Ye[n],ke('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return vu(t)}function ef(i){return i.replace(xv,vv)}function vv(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function tf(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function yv(i){return _v[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}function Mv(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":bv[i.envMapMode]||"ENVMAP_TYPE_CUBE"}function Ev(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Sv[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}function wv(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Tv[i.combine]||"ENVMAP_BLENDING_NONE"}function Av(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Rv(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=yv(t),c=Mv(t),u=Ev(t),d=wv(t),h=Av(t),p=hv(t),g=dv(r),y=s.createProgram(),m,f,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ra).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ra).join(`
`),f.length>0&&(f+=`
`)):(m=[tf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ra).join(`
`),f=[tf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Un?"#define TONE_MAPPING":"",t.toneMapping!==Un?Ye.tonemapping_pars_fragment:"",t.toneMapping!==Un?cv("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ye.colorspace_pars_fragment,ov("linearToOutputTexel",t.outputColorSpace),uv(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ra).join(`
`)),a=vu(a),a=Kd(a,t),a=Qd(a,t),o=vu(o),o=Kd(o,t),o=Qd(o,t),a=ef(a),o=ef(o),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",t.glslVersion===Yc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Yc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let w=S+m+a,M=S+f+o,E=Yd(s,s.VERTEX_SHADER,w),x=Yd(s,s.FRAGMENT_SHADER,M);s.attachShader(y,E),s.attachShader(y,x),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function R(P){if(i.debug.checkShaderErrors){let L=s.getProgramInfoLog(y)||"",z=s.getShaderInfoLog(E)||"",I=s.getShaderInfoLog(x)||"",B=L.trim(),W=z.trim(),X=I.trim(),re=!0,q=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(re=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,E,x);else{let te=Jd(s,E,"vertex"),ie=Jd(s,x,"fragment");He("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+B+`
`+te+`
`+ie)}else B!==""?ke("WebGLProgram: Program Info Log:",B):(W===""||X==="")&&(q=!1);q&&(P.diagnostics={runnable:re,programLog:B,vertexShader:{log:W,prefix:m},fragmentShader:{log:X,prefix:f}})}s.deleteShader(E),s.deleteShader(x),_=new Zs(s,y),T=fv(s,y)}let _;this.getUniforms=function(){return _===void 0&&R(this),_};let T;this.getAttributes=function(){return T===void 0&&R(this),T};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(y,iv)),C},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=sv++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=E,this.fragmentShader=x,this}function Pv(i){return i===Ui||i===ea||i===ta}function Iv(i,e,t,n,s,r){let a=new Us,o=new _u,l=new Set,c=[],u=new Map,d=n.logarithmicDepthBuffer,h=n.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return l.add(_),_===0?"uv":`uv${_}`}function y(_,T,C,P,L,z){let I=P.fog,B=L.geometry,W=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?P.environment:null,X=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,re=e.get(_.envMap||W,X),q=re&&re.mapping===Xr?re.image.height:null,te=p[_.type];_.precision!==null&&(h=n.getMaxPrecision(_.precision),h!==_.precision&&ke("WebGLProgram.getParameters:",_.precision,"not supported, using",h,"instead."));let ie=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,Ce=ie!==void 0?ie.length:0,xe=0;B.morphAttributes.position!==void 0&&(xe=1),B.morphAttributes.normal!==void 0&&(xe=2),B.morphAttributes.color!==void 0&&(xe=3);let st,qe,Ze,Z;if(te){let pt=Zn[te];st=pt.vertexShader,qe=pt.fragmentShader}else{st=_.vertexShader,qe=_.fragmentShader;let pt=o.getVertexShaderStage(_),rt=o.getFragmentShaderStage(_);o.update(_,pt,rt),Ze=pt.id,Z=rt.id}let ee=i.getRenderTarget(),be=i.state.buffers.depth.getReversed(),Be=L.isInstancedMesh===!0,N=L.isBatchedMesh===!0,H=!!_.map,se=!!_.matcap,oe=!!re,le=!!_.aoMap,Te=!!_.lightMap,Re=!!_.bumpMap&&_.wireframe===!1,Ge=!!_.normalMap,lt=!!_.displacementMap,Ht=!!_.emissiveMap,St=!!_.metalnessMap,At=!!_.roughnessMap,F=_.anisotropy>0,Xt=_.clearcoat>0,ct=_.dispersion>0,A=_.retroreflectivity>0,v=_.iridescence>0,k=_.sheen>0,$=_.transmission>0,J=F&&!!_.anisotropyMap,ce=Xt&&!!_.clearcoatMap,ue=Xt&&!!_.clearcoatNormalMap,K=Xt&&!!_.clearcoatRoughnessMap,ne=v&&!!_.iridescenceMap,he=v&&!!_.iridescenceThicknessMap,De=k&&!!_.sheenColorMap,me=k&&!!_.sheenRoughnessMap,de=!!_.specularMap,Ne=!!_.specularColorMap,ze=!!_.specularIntensityMap,We=$&&!!_.transmissionMap,U=$&&!!_.thicknessMap,fe=!!_.gradientMap,Q=!!_.alphaMap,pe=_.alphaTest>0,ye=!!_.alphaHash,ae=!!_.extensions,Ue=Un;_.toneMapped&&(ee===null||ee.isXRRenderTarget===!0)&&(Ue=i.toneMapping);let Pe={shaderID:te,shaderType:_.type,shaderName:_.name,vertexShader:st,fragmentShader:qe,defines:_.defines,customVertexShaderID:Ze,customFragmentShaderID:Z,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:h,batching:N,batchingColor:N&&L._colorsTexture!==null,instancing:Be,instancingColor:Be&&L.instanceColor!==null,instancingMorph:Be&&L.morphTexture!==null,outputColorSpace:ee===null?i.outputColorSpace:ee.isXRRenderTarget===!0?ee.texture.colorSpace:Ke.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:H,matcap:se,envMap:oe,envMapMode:oe&&re.mapping,envMapCubeUVHeight:q,aoMap:le,lightMap:Te,bumpMap:Re,normalMap:Ge,displacementMap:lt,emissiveMap:Ht,normalMapObjectSpace:Ge&&_.normalMapType===Sd,normalMapTangentSpace:Ge&&_.normalMapType===na,packedNormalMap:Ge&&_.normalMapType===na&&Pv(_.normalMap.format),metalnessMap:St,roughnessMap:At,anisotropy:F,anisotropyMap:J,clearcoat:Xt,clearcoatMap:ce,clearcoatNormalMap:ue,clearcoatRoughnessMap:K,dispersion:ct,retroreflection:A,iridescence:v,iridescenceMap:ne,iridescenceThicknessMap:he,sheen:k,sheenColorMap:De,sheenRoughnessMap:me,specularMap:de,specularColorMap:Ne,specularIntensityMap:ze,transmission:$,transmissionMap:We,thicknessMap:U,gradientMap:fe,opaque:_.transparent===!1&&_.blending===$s&&_.alphaToCoverage===!1,alphaMap:Q,alphaTest:pe,alphaHash:ye,combine:_.combine,mapUv:H&&g(_.map.channel),aoMapUv:le&&g(_.aoMap.channel),lightMapUv:Te&&g(_.lightMap.channel),bumpMapUv:Re&&g(_.bumpMap.channel),normalMapUv:Ge&&g(_.normalMap.channel),displacementMapUv:lt&&g(_.displacementMap.channel),emissiveMapUv:Ht&&g(_.emissiveMap.channel),metalnessMapUv:St&&g(_.metalnessMap.channel),roughnessMapUv:At&&g(_.roughnessMap.channel),anisotropyMapUv:J&&g(_.anisotropyMap.channel),clearcoatMapUv:ce&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:ue&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:K&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:ne&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:he&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:De&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:me&&g(_.sheenRoughnessMap.channel),specularMapUv:de&&g(_.specularMap.channel),specularColorMapUv:Ne&&g(_.specularColorMap.channel),specularIntensityMapUv:ze&&g(_.specularIntensityMap.channel),transmissionMapUv:We&&g(_.transmissionMap.channel),thicknessMapUv:U&&g(_.thicknessMap.channel),alphaMapUv:Q&&g(_.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(Ge||F),vertexNormals:!!B.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!B.attributes.uv&&(H||Q),fog:!!I,useFog:_.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||B.attributes.normal===void 0&&Ge===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:be,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:B.attributes.position!==void 0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:Ce,morphTextureStride:xe,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:z.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ue,decodeVideoTexture:H&&_.map.isVideoTexture===!0&&Ke.getTransfer(_.map.colorSpace)===it,decodeVideoTextureEmissive:Ht&&_.emissiveMap.isVideoTexture===!0&&Ke.getTransfer(_.emissiveMap.colorSpace)===it,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===kt,flipSided:_.side===qt,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:ae&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ae&&_.extensions.multiDraw===!0||N)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Pe.vertexUv1s=l.has(1),Pe.vertexUv2s=l.has(2),Pe.vertexUv3s=l.has(3),l.clear(),Pe}function m(_){let T=[];if(_.shaderID?T.push(_.shaderID):(T.push(_.customVertexShaderID),T.push(_.customFragmentShaderID)),_.defines!==void 0)for(let C in _.defines)T.push(C),T.push(_.defines[C]);return _.isRawShaderMaterial===!1&&(f(T,_),S(T,_),T.push(i.outputColorSpace)),T.push(_.customProgramCacheKey),T.join()}function f(_,T){_.push(T.precision),_.push(T.outputColorSpace),_.push(T.envMapMode),_.push(T.envMapCubeUVHeight),_.push(T.mapUv),_.push(T.alphaMapUv),_.push(T.lightMapUv),_.push(T.aoMapUv),_.push(T.bumpMapUv),_.push(T.normalMapUv),_.push(T.displacementMapUv),_.push(T.emissiveMapUv),_.push(T.metalnessMapUv),_.push(T.roughnessMapUv),_.push(T.anisotropyMapUv),_.push(T.clearcoatMapUv),_.push(T.clearcoatNormalMapUv),_.push(T.clearcoatRoughnessMapUv),_.push(T.iridescenceMapUv),_.push(T.iridescenceThicknessMapUv),_.push(T.sheenColorMapUv),_.push(T.sheenRoughnessMapUv),_.push(T.specularMapUv),_.push(T.specularColorMapUv),_.push(T.specularIntensityMapUv),_.push(T.transmissionMapUv),_.push(T.thicknessMapUv),_.push(T.combine),_.push(T.fogExp2),_.push(T.sizeAttenuation),_.push(T.morphTargetsCount),_.push(T.morphAttributeCount),_.push(T.numSunLights),_.push(T.numDirLights),_.push(T.numPointLights),_.push(T.numSpotLights),_.push(T.numSpotLightMaps),_.push(T.numHemiLights),_.push(T.numRectAreaLights),_.push(T.numSunLightShadows),_.push(T.numDirLightShadows),_.push(T.numPointLightShadows),_.push(T.numSpotLightShadows),_.push(T.numSpotLightShadowsWithMaps),_.push(T.numLightProbes),_.push(T.shadowMapType),_.push(T.toneMapping),_.push(T.numClippingPlanes),_.push(T.numClipIntersection),_.push(T.depthPacking)}function S(_,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.retroreflection&&a.enable(24),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function w(_){let T=p[_.type],C;if(T){let P=Zn[T];C=ci.clone(P.uniforms)}else C=_.uniforms;return C}function M(_,T){let C=u.get(T);return C!==void 0?++C.usedTimes:(C=new Rv(i,T,_,s),c.push(C),u.set(T,C)),C}function E(_){if(--_.usedTimes===0){let T=c.indexOf(_);c[T]=c[c.length-1],c.pop(),u.delete(_.cacheKey),_.destroy()}}function x(_){o.remove(_)}function R(){o.dispose()}return{getParameters:y,getProgramCacheKey:m,getUniforms:w,acquireProgram:M,releaseProgram:E,releaseShaderCache:x,programs:c,dispose:R}}function Lv(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Dv(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function nf(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function sf(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(h){let p=0;return h.isInstancedMesh&&(p+=2),h.isSkinnedMesh&&(p+=1),p}function o(h,p,g,y,m,f){let S=i[e];return S===void 0?(S={id:h.id,object:h,geometry:p,material:g,materialVariant:a(h),groupOrder:y,renderOrder:h.renderOrder,z:m,group:f},i[e]=S):(S.id=h.id,S.object=h,S.geometry=p,S.material=g,S.materialVariant=a(h),S.groupOrder=y,S.renderOrder=h.renderOrder,S.z=m,S.group=f),e++,S}function l(h,p,g,y,m,f,S){S.reversedDepth===!0&&(m=-m);let w=o(h,p,g,y,m,f);g.transmission>0?n.push(w):g.transparent===!0?s.push(w):t.push(w)}function c(h,p,g,y,m,f){let S=o(h,p,g,y,m,f);g.transmission>0?n.unshift(S):g.transparent===!0?s.unshift(S):t.unshift(S)}function u(h,p){t.length>1&&t.sort(h||Dv),n.length>1&&n.sort(p||nf),s.length>1&&s.sort(p||nf)}function d(){for(let h=e,p=i.length;h<p;h++){let g=i[h];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:d,sort:u}}function Nv(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new sf,i.set(n,[a])):s>=r.length?(a=new sf,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Uv(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new O,color:new Le};break;case"SpotLight":t={position:new O,direction:new O,color:new Le,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new O,color:new Le,distance:0,decay:0};break;case"HemisphereLight":t={direction:new O,skyColor:new Le,groundColor:new Le};break;case"RectAreaLight":t={color:new Le,position:new O,halfWidth:new O,halfHeight:new O};break}return i[e.id]=t,t}}}function Fv(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}function Bv(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function zv(i){let e=new Uv,t=Fv(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new O);let s=new O,r=new ht,a=new ht;function o(c){let u=0,d=0,h=0;for(let L=0;L<9;L++)n.probe[L].set(0,0,0);let p=0,g=0,y=0,m=0,f=0,S=0,w=0,M=0,E=0,x=0,R=0,_=0,T=0,C=0;c.sort(Bv);for(let L=0,z=c.length;L<z;L++){let I=c[L],B=I.color,W=I.intensity,X=I.distance,re=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===Ui?re=I.shadow.map.texture:re=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)u+=B.r*W,d+=B.g*W,h+=B.b*W;else if(I.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(I.sh.coefficients[q],W);C++}else if(I.isSunLight){let q=e.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let te=I.shadow,ie=t.get(I);ie.shadowIntensity=te.intensity,ie.shadowBias=te.bias,ie.shadowNormalBias=te.normalBias,ie.shadowRadius=te.radius,ie.shadowMapSize.copy(te.mapSize).multiply(te.getFrameExtents()),n.sunShadow[g]=ie,n.sunShadowMap[g]=re;let Ce=te.getViewportCount();for(let xe=0;xe<Ce;xe++)n.sunShadowMatrix[y+xe]=te.getMatrix(xe),n.sunShadowCascade[y+xe]=te._cascadeData[xe];y+=Ce,g++}n.sun[p]=q,p++}else if(I.isDirectionalLight){let q=e.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let te=I.shadow,ie=t.get(I);ie.shadowIntensity=te.intensity,ie.shadowBias=te.bias,ie.shadowNormalBias=te.normalBias,ie.shadowRadius=te.radius,ie.shadowMapSize=te.mapSize,n.directionalShadow[m]=ie,n.directionalShadowMap[m]=re,n.directionalShadowMatrix[m]=I.shadow.matrix,E++}n.directional[m]=q,m++}else if(I.isSpotLight){let q=e.get(I);q.position.setFromMatrixPosition(I.matrixWorld),q.color.copy(B).multiplyScalar(W),q.distance=X,q.coneCos=Math.cos(I.angle),q.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),q.decay=I.decay,n.spot[S]=q;let te=I.shadow;if(I.map&&(n.spotLightMap[_]=I.map,_++,te.updateMatrices(I),I.castShadow&&T++),n.spotLightMatrix[S]=te.matrix,I.castShadow){let ie=t.get(I);ie.shadowIntensity=te.intensity,ie.shadowBias=te.bias,ie.shadowNormalBias=te.normalBias,ie.shadowRadius=te.radius,ie.shadowMapSize=te.mapSize,n.spotShadow[S]=ie,n.spotShadowMap[S]=re,R++}S++}else if(I.isRectAreaLight){let q=e.get(I);q.color.copy(B).multiplyScalar(W),q.halfWidth.set(I.width*.5,0,0),q.halfHeight.set(0,I.height*.5,0),n.rectArea[w]=q,w++}else if(I.isPointLight){let q=e.get(I);if(q.color.copy(I.color).multiplyScalar(I.intensity),q.distance=I.distance,q.decay=I.decay,I.castShadow){let te=I.shadow,ie=t.get(I);ie.shadowIntensity=te.intensity,ie.shadowBias=te.bias,ie.shadowNormalBias=te.normalBias,ie.shadowRadius=te.radius,ie.shadowMapSize=te.mapSize,ie.shadowCameraNear=te.camera.near,ie.shadowCameraFar=te.camera.far,n.pointShadow[f]=ie,n.pointShadowMap[f]=re,n.pointShadowMatrix[f]=I.shadow.matrix,x++}n.point[f]=q,f++}else if(I.isHemisphereLight){let q=e.get(I);q.skyColor.copy(I.color).multiplyScalar(W),q.groundColor.copy(I.groundColor).multiplyScalar(W),n.hemi[M]=q,M++}}w>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ge.LTC_FLOAT_1,n.rectAreaLTC2=ge.LTC_FLOAT_2):(n.rectAreaLTC1=ge.LTC_HALF_1,n.rectAreaLTC2=ge.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=h;let P=n.hash;(P.sunLength!==p||P.directionalLength!==m||P.pointLength!==f||P.spotLength!==S||P.rectAreaLength!==w||P.hemiLength!==M||P.numSunShadows!==g||P.numDirectionalShadows!==E||P.numPointShadows!==x||P.numSpotShadows!==R||P.numSpotMaps!==_||P.numLightProbes!==C)&&(n.sun.length=p,n.directional.length=m,n.spot.length=S,n.rectArea.length=w,n.point.length=f,n.hemi.length=M,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=y,n.sunShadowCascade.length=y,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.directionalShadowMatrix.length=E,n.pointShadow.length=x,n.pointShadowMap.length=x,n.pointShadowMatrix.length=x,n.spotShadow.length=R,n.spotShadowMap.length=R,n.spotLightMatrix.length=R+_-T,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=C,P.sunLength=p,P.directionalLength=m,P.pointLength=f,P.spotLength=S,P.rectAreaLength=w,P.hemiLength=M,P.numSunShadows=g,P.numDirectionalShadows=E,P.numPointShadows=x,P.numSpotShadows=R,P.numSpotMaps=_,P.numLightProbes=C,n.version=Ov++)}function l(c,u){let d=0,h=0,p=0,g=0,y=0,m=0,f=u.matrixWorldInverse;for(let S=0,w=c.length;S<w;S++){let M=c[S];if(M.isSunLight){let E=n.sun[d];E.direction.setFromMatrixPosition(M.matrixWorld),E.direction.transformDirection(f),d++}else if(M.isDirectionalLight){let E=n.directional[h];E.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(f),h++}else if(M.isSpotLight){let E=n.spot[g];E.position.setFromMatrixPosition(M.matrixWorld),E.position.applyMatrix4(f),E.direction.setFromMatrixPosition(M.matrixWorld),s.setFromMatrixPosition(M.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(f),g++}else if(M.isRectAreaLight){let E=n.rectArea[y];E.position.setFromMatrixPosition(M.matrixWorld),E.position.applyMatrix4(f),a.identity(),r.copy(M.matrixWorld),r.premultiply(f),a.extractRotation(r),E.halfWidth.set(M.width*.5,0,0),E.halfHeight.set(0,M.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),y++}else if(M.isPointLight){let E=n.point[p];E.position.setFromMatrixPosition(M.matrixWorld),E.position.applyMatrix4(f),p++}else if(M.isHemisphereLight){let E=n.hemi[m];E.direction.setFromMatrixPosition(M.matrixWorld),E.direction.transformDirection(f),m++}}}return{setup:o,setupView:l,state:n}}function rf(i){let e=new zv(i),t=[],n=[],s=[];function r(h){d.camera=h,t.length=0,n.length=0,s.length=0}function a(h){t.push(h)}function o(h){n.push(h)}function l(h){s.push(h)}function c(){e.setup(t)}function u(h){e.setupView(t,h)}let d={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:u,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function kv(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new rf(i),e.set(s,[o])):r>=a.length?(o=new rf(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}function Wv(i,e,t){let n=new Bs,s=new Oe,r=new Oe,a=new yt,o=new bo,l=new Mo,c={},u=t.maxTextureSize,d={[Ii]:qt,[qt]:Ii,[kt]:kt},h=new Mt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Oe},radius:{value:4}},vertexShader:Hv,fragmentShader:Vv}),p=h.clone();p.defines.HORIZONTAL_PASS=1;let g=new Dt;g.setAttribute("position",new ln(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Me(g,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ji;let f=this.type;this.render=function(x,R,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||x.length===0)return;this.type===ed&&(ke("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ji);let T=i.getRenderTarget(),C=i.getActiveCubeFace(),P=i.getActiveMipmapLevel(),L=i.state;L.setBlending(Sn),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let z=f!==this.type;z&&R.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(B=>B.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,B=x.length;I<B;I++){let W=x[I],X=W.shadow;if(X===void 0){ke("WebGLShadowMap:",W,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;s.copy(X.mapSize);let re=X.getFrameExtents();s.multiply(re),r.copy(X.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/re.x),s.x=r.x*re.x,X.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/re.y),s.y=r.y*re.y,X.mapSize.y=r.y));let q=i.state.buffers.depth.getReversed();if(X.camera._reversedDepth=q,X.map===null||z===!0){if(X.map!==null&&(X.map.depthTexture!==null&&(X.map.depthTexture.dispose(),X.map.depthTexture=null),X.map.dispose()),this.type===Gs){if(W.isPointLight){ke("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}X.map=new Et(s.x,s.y,{format:Ui,type:Nt,minFilter:Wt,magFilter:Wt,generateMipmaps:!1}),X.map.texture.name=W.name+".shadowMap",X.map.depthTexture=new Ti(s.x,s.y,En),X.map.depthTexture.name=W.name+".shadowMapDepth",X.map.depthTexture.format=Vn,X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=zt,X.map.depthTexture.magFilter=zt}else W.isPointLight?(X.map=new Rl(s.x),X.map.depthTexture=new yo(s.x,Fn)):(X.map=new Et(s.x,s.y),X.map.depthTexture=new Ti(s.x,s.y,Fn)),X.map.depthTexture.name=W.name+".shadowMap",X.map.depthTexture.format=Vn,this.type===Ji?(X.map.depthTexture.compareFunction=q?El:Sl,X.map.depthTexture.minFilter=Wt,X.map.depthTexture.magFilter=Wt):(X.map.depthTexture.compareFunction=null,X.map.depthTexture.minFilter=zt,X.map.depthTexture.magFilter=zt);X.camera.updateProjectionMatrix()}X.map.isWebGLCubeRenderTarget!==!0&&(X.map.width!==s.x||X.map.height!==s.y)&&X.map.setSize(s.x,s.y);let te=X.map.isWebGLCubeRenderTarget?6:X.getViewportCount();W.isPointLight!==!0&&X.updateMatrices(W,_);for(let ie=0;ie<te;ie++){let Ce=X.getCamera(ie);if(W.isPointLight){let xe=X.camera,st=X.matrix,qe=W.distance||xe.far;qe!==xe.far&&(xe.far=qe,xe.updateProjectionMatrix()),sa.setFromMatrixPosition(W.matrixWorld),xe.position.copy(sa),fu.copy(xe.position),fu.add(Gv[ie]),xe.up.copy($v[ie]),xe.lookAt(fu),xe.updateMatrixWorld(),st.makeTranslation(-sa.x,-sa.y,-sa.z),af.multiplyMatrices(xe.projectionMatrix,xe.matrixWorldInverse),X._frustum.setFromProjectionMatrix(af,xe.coordinateSystem,xe.reversedDepth)}if(X.map.isWebGLCubeRenderTarget)i.setRenderTarget(X.map,ie),i.clear();else{ie===0&&(i.setRenderTarget(X.map),i.clear());let xe=X.getViewport(ie);a.set(r.x*xe.x,r.y*xe.y,r.x*xe.z,r.y*xe.w),L.viewport(a)}n=X.getFrustum(ie),M(R,_,Ce,W,this.type)}X.isPointLightShadow!==!0&&this.type===Gs&&S(X,_),X.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(T,C,P)};function S(x,R){let _=e.update(y);h.defines.VSM_SAMPLES!==x.blurSamples&&(h.defines.VSM_SAMPLES=x.blurSamples,p.defines.VSM_SAMPLES=x.blurSamples,h.needsUpdate=!0,p.needsUpdate=!0),x.mapPass===null?x.mapPass=new Et(s.x,s.y,{format:Ui,type:Nt}):(x.mapPass.width!==x.map.width||x.mapPass.height!==x.map.height)&&x.mapPass.setSize(x.map.width,x.map.height),h.uniforms.shadow_pass.value=x.map.depthTexture,h.uniforms.resolution.value.set(x.map.width,x.map.height),h.uniforms.radius.value=x.radius,i.setRenderTarget(x.mapPass),i.clear(),i.renderBufferDirect(R,null,_,h,y,null),p.uniforms.shadow_pass.value=x.mapPass.texture,p.uniforms.resolution.value.set(x.map.width,x.map.height),p.uniforms.radius.value=x.radius,i.setRenderTarget(x.map),i.clear(),i.renderBufferDirect(R,null,_,p,y,null)}function w(x,R,_,T){let C=null,P=_.isPointLight===!0?x.customDistanceMaterial:x.customDepthMaterial;if(P!==void 0)C=P;else if(C=_.isPointLight===!0?l:o,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let L=C.uuid,z=R.uuid,I=c[L];I===void 0&&(I={},c[L]=I);let B=I[z];B===void 0&&(B=C.clone(),I[z]=B,R.addEventListener("dispose",E)),C=B}if(C.visible=R.visible,C.wireframe=R.wireframe,T===Gs?C.side=R.shadowSide!==null?R.shadowSide:R.side:C.side=R.shadowSide!==null?R.shadowSide:d[R.side],C.alphaMap=R.alphaMap,C.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,C.map=R.map,C.clipShadows=R.clipShadows,C.clippingPlanes=R.clippingPlanes,C.clipIntersection=R.clipIntersection,C.displacementMap=R.displacementMap,C.displacementScale=R.displacementScale,C.displacementBias=R.displacementBias,C.wireframeLinewidth=R.wireframeLinewidth,C.linewidth=R.linewidth,_.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let L=i.properties.get(C);L.light=_}return C}function M(x,R,_,T,C){if(x.visible===!1)return;if(x.layers.test(R.layers)&&(x.isMesh||x.isLine||x.isPoints)&&(x.castShadow||x.receiveShadow&&C===Gs)&&(!x.frustumCulled||x.intersectsFrustum(n))){x.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,x.matrixWorld);let z=e.update(x),I=x.material;if(Array.isArray(I)){let B=z.groups;for(let W=0,X=B.length;W<X;W++){let re=B[W],q=I[re.materialIndex];if(q&&q.visible){let te=w(x,q,T,C);x.onBeforeShadow(i,x,R,_,z,te,re),i.renderBufferDirect(_,null,z,te,x,re),x.onAfterShadow(i,x,R,_,z,te,re)}}}else if(I.visible){let B=w(x,I,T,C);x.onBeforeShadow(i,x,R,_,z,B,null),i.renderBufferDirect(_,null,z,B,x,null),x.onAfterShadow(i,x,R,_,z,B,null)}}let L=x.children;for(let z=0,I=L.length;z<I;z++)M(L[z],R,_,T,C)}function E(x){x.target.removeEventListener("dispose",E);for(let _ in c){let T=c[_],C=x.target.uuid;C in T&&(T[C].dispose(),delete T[C])}}}function qv(i,e){function t(){let U=!1,fe=new yt,Q=null,pe=new yt(0,0,0,0);return{setMask:function(ye){Q!==ye&&!U&&(i.colorMask(ye,ye,ye,ye),Q=ye)},setLocked:function(ye){U=ye},setClear:function(ye,ae,Ue,Pe,pt){pt===!0&&(ye*=Pe,ae*=Pe,Ue*=Pe),fe.set(ye,ae,Ue,Pe),pe.equals(fe)===!1&&(i.clearColor(ye,ae,Ue,Pe),pe.copy(fe))},reset:function(){U=!1,Q=null,pe.set(-1,0,0,0)}}}function n(){let U=!1,fe=!1,Q=null,pe=null,ye=null;return{setReversed:function(ae){if(fe!==ae){let Ue=e.get("EXT_clip_control");ae?Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.ZERO_TO_ONE_EXT):Ue.clipControlEXT(Ue.LOWER_LEFT_EXT,Ue.NEGATIVE_ONE_TO_ONE_EXT),fe=ae;let Pe=ye;ye=null,this.setClear(Pe)}},getReversed:function(){return fe},setTest:function(ae){ae?ee(i.DEPTH_TEST):be(i.DEPTH_TEST)},setMask:function(ae){Q!==ae&&!U&&(i.depthMask(ae),Q=ae)},setFunc:function(ae){if(fe&&(ae=Ud[ae]),pe!==ae){switch(ae){case oo:i.depthFunc(i.NEVER);break;case lo:i.depthFunc(i.ALWAYS);break;case co:i.depthFunc(i.LESS);break;case Ps:i.depthFunc(i.LEQUAL);break;case uo:i.depthFunc(i.EQUAL);break;case ho:i.depthFunc(i.GEQUAL);break;case fo:i.depthFunc(i.GREATER);break;case po:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}pe=ae}},setLocked:function(ae){U=ae},setClear:function(ae){ye!==ae&&(ye=ae,fe&&(ae=1-ae),i.clearDepth(ae))},reset:function(){U=!1,Q=null,pe=null,ye=null,fe=!1}}}function s(){let U=!1,fe=null,Q=null,pe=null,ye=null,ae=null,Ue=null,Pe=null,pt=null;return{setTest:function(rt){U||(rt?ee(i.STENCIL_TEST):be(i.STENCIL_TEST))},setMask:function(rt){fe!==rt&&!U&&(i.stencilMask(rt),fe=rt)},setFunc:function(rt,Rn,On){(Q!==rt||pe!==Rn||ye!==On)&&(i.stencilFunc(rt,Rn,On),Q=rt,pe=Rn,ye=On)},setOp:function(rt,Rn,On){(ae!==rt||Ue!==Rn||Pe!==On)&&(i.stencilOp(rt,Rn,On),ae=rt,Ue=Rn,Pe=On)},setLocked:function(rt){U=rt},setClear:function(rt){pt!==rt&&(i.clearStencil(rt),pt=rt)},reset:function(){U=!1,fe=null,Q=null,pe=null,ye=null,ae=null,Ue=null,Pe=null,pt=null}}}let r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap,u={},d={},h={},p=new WeakMap,g=[],y=null,m=!1,f=null,S=null,w=null,M=null,E=null,x=null,R=null,_=new Le(0,0,0),T=0,C=!1,P=null,L=null,z=null,I=null,B=null,W=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),X=!1,re=0,q=i.getParameter(i.VERSION);q.indexOf("WebGL")!==-1?(re=parseFloat(/^WebGL (\d)/.exec(q)[1]),X=re>=1):q.indexOf("OpenGL ES")!==-1&&(re=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),X=re>=2);let te=null,ie={},Ce=i.getParameter(i.SCISSOR_BOX),xe=i.getParameter(i.VIEWPORT),st=new yt().fromArray(Ce),qe=new yt().fromArray(xe);function Ze(U,fe,Q,pe){let ye=new Uint8Array(4),ae=i.createTexture();i.bindTexture(U,ae),i.texParameteri(U,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(U,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Ue=0;Ue<Q;Ue++)U===i.TEXTURE_3D||U===i.TEXTURE_2D_ARRAY?i.texImage3D(fe,0,i.RGBA,1,1,pe,0,i.RGBA,i.UNSIGNED_BYTE,ye):i.texImage2D(fe+Ue,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ye);return ae}let Z={};Z[i.TEXTURE_2D]=Ze(i.TEXTURE_2D,i.TEXTURE_2D,1),Z[i.TEXTURE_CUBE_MAP]=Ze(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[i.TEXTURE_2D_ARRAY]=Ze(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Z[i.TEXTURE_3D]=Ze(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ee(i.DEPTH_TEST),a.setFunc(Ps),Re(!1),Ge(Fc),ee(i.CULL_FACE),le(Sn);function ee(U){u[U]!==!0&&(i.enable(U),u[U]=!0)}function be(U){u[U]!==!1&&(i.disable(U),u[U]=!1)}function Be(U,fe){return h[U]!==fe?(i.bindFramebuffer(U,fe),h[U]=fe,U===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=fe),U===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=fe),!0):!1}function N(U,fe){let Q=g,pe=!1;if(U){Q=p.get(fe),Q===void 0&&(Q=[],p.set(fe,Q));let ye=U.textures;if(Q.length!==ye.length||Q[0]!==i.COLOR_ATTACHMENT0){for(let ae=0,Ue=ye.length;ae<Ue;ae++)Q[ae]=i.COLOR_ATTACHMENT0+ae;Q.length=ye.length,pe=!0}}else Q[0]!==i.BACK&&(Q[0]=i.BACK,pe=!0);pe&&i.drawBuffers(Q)}function H(U){return y!==U?(i.useProgram(U),y=U,!0):!1}let se={[Ki]:i.FUNC_ADD,[nd]:i.FUNC_SUBTRACT,[id]:i.FUNC_REVERSE_SUBTRACT};se[sd]=i.MIN,se[rd]=i.MAX;let oe={[ad]:i.ZERO,[od]:i.ONE,[ld]:i.SRC_COLOR,[zc]:i.SRC_ALPHA,[pd]:i.SRC_ALPHA_SATURATE,[dd]:i.DST_COLOR,[ud]:i.DST_ALPHA,[cd]:i.ONE_MINUS_SRC_COLOR,[kc]:i.ONE_MINUS_SRC_ALPHA,[fd]:i.ONE_MINUS_DST_COLOR,[hd]:i.ONE_MINUS_DST_ALPHA,[md]:i.CONSTANT_COLOR,[gd]:i.ONE_MINUS_CONSTANT_COLOR,[xd]:i.CONSTANT_ALPHA,[vd]:i.ONE_MINUS_CONSTANT_ALPHA};function le(U,fe,Q,pe,ye,ae,Ue,Pe,pt,rt){if(U===Sn){m===!0&&(be(i.BLEND),m=!1);return}if(m===!1&&(ee(i.BLEND),m=!0),U!==td){if(U!==f||rt!==C){if((S!==Ki||E!==Ki)&&(i.blendEquation(i.FUNC_ADD),S=Ki,E=Ki),rt)switch(U){case $s:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Xn:i.blendFunc(i.ONE,i.ONE);break;case Oc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Bc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:He("WebGLState: Invalid blending: ",U);break}else switch(U){case $s:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Xn:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Oc:He("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Bc:He("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:He("WebGLState: Invalid blending: ",U);break}w=null,M=null,x=null,R=null,_.set(0,0,0),T=0,f=U,C=rt}return}ye=ye||fe,ae=ae||Q,Ue=Ue||pe,(fe!==S||ye!==E)&&(i.blendEquationSeparate(se[fe],se[ye]),S=fe,E=ye),(Q!==w||pe!==M||ae!==x||Ue!==R)&&(i.blendFuncSeparate(oe[Q],oe[pe],oe[ae],oe[Ue]),w=Q,M=pe,x=ae,R=Ue),(Pe.equals(_)===!1||pt!==T)&&(i.blendColor(Pe.r,Pe.g,Pe.b,pt),_.copy(Pe),T=pt),f=U,C=!1}function Te(U,fe){U.side===kt?be(i.CULL_FACE):ee(i.CULL_FACE);let Q=U.side===qt;fe&&(Q=!Q),Re(Q),U.blending===$s&&U.transparent===!1?le(Sn):le(U.blending,U.blendEquation,U.blendSrc,U.blendDst,U.blendEquationAlpha,U.blendSrcAlpha,U.blendDstAlpha,U.blendColor,U.blendAlpha,U.premultipliedAlpha),a.setFunc(U.depthFunc),a.setTest(U.depthTest),a.setMask(U.depthWrite),r.setMask(U.colorWrite);let pe=U.stencilWrite;o.setTest(pe),pe&&(o.setMask(U.stencilWriteMask),o.setFunc(U.stencilFunc,U.stencilRef,U.stencilFuncMask),o.setOp(U.stencilFail,U.stencilZFail,U.stencilZPass)),Ht(U.polygonOffset,U.polygonOffsetFactor,U.polygonOffsetUnits),U.alphaToCoverage===!0?ee(i.SAMPLE_ALPHA_TO_COVERAGE):be(i.SAMPLE_ALPHA_TO_COVERAGE)}function Re(U){P!==U&&(U?i.frontFace(i.CW):i.frontFace(i.CCW),P=U)}function Ge(U){U!==Kh?(ee(i.CULL_FACE),U!==L&&(U===Fc?i.cullFace(i.BACK):U===Qh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):be(i.CULL_FACE),L=U}function lt(U){U!==z&&(X&&i.lineWidth(U),z=U)}function Ht(U,fe,Q){U?(ee(i.POLYGON_OFFSET_FILL),(I!==fe||B!==Q)&&(I=fe,B=Q,a.getReversed()&&(fe=-fe),i.polygonOffset(fe,Q))):be(i.POLYGON_OFFSET_FILL)}function St(U){U?ee(i.SCISSOR_TEST):be(i.SCISSOR_TEST)}function At(U){U===void 0&&(U=i.TEXTURE0+W-1),te!==U&&(i.activeTexture(U),te=U)}function F(U,fe,Q){Q===void 0&&(te===null?Q=i.TEXTURE0+W-1:Q=te);let pe=ie[Q];pe===void 0&&(pe={type:void 0,texture:void 0},ie[Q]=pe),(pe.type!==U||pe.texture!==fe)&&(te!==Q&&(i.activeTexture(Q),te=Q),i.bindTexture(U,fe||Z[U]),pe.type=U,pe.texture=fe)}function Xt(){let U=ie[te];U!==void 0&&U.type!==void 0&&(i.bindTexture(U.type,null),U.type=void 0,U.texture=void 0)}function ct(){try{i.compressedTexImage2D(...arguments)}catch(U){He("WebGLState:",U)}}function A(){try{i.compressedTexImage3D(...arguments)}catch(U){He("WebGLState:",U)}}function v(){try{i.texSubImage2D(...arguments)}catch(U){He("WebGLState:",U)}}function k(){try{i.texSubImage3D(...arguments)}catch(U){He("WebGLState:",U)}}function $(){try{i.compressedTexSubImage2D(...arguments)}catch(U){He("WebGLState:",U)}}function J(){try{i.compressedTexSubImage3D(...arguments)}catch(U){He("WebGLState:",U)}}function ce(){try{i.texStorage2D(...arguments)}catch(U){He("WebGLState:",U)}}function ue(){try{i.texStorage3D(...arguments)}catch(U){He("WebGLState:",U)}}function K(){try{i.texImage2D(...arguments)}catch(U){He("WebGLState:",U)}}function ne(){try{i.texImage3D(...arguments)}catch(U){He("WebGLState:",U)}}function he(U){return d[U]!==void 0?d[U]:i.getParameter(U)}function De(U,fe){d[U]!==fe&&(i.pixelStorei(U,fe),d[U]=fe)}function me(U){st.equals(U)===!1&&(i.scissor(U.x,U.y,U.z,U.w),st.copy(U))}function de(U){qe.equals(U)===!1&&(i.viewport(U.x,U.y,U.z,U.w),qe.copy(U))}function Ne(U,fe){let Q=c.get(fe);Q===void 0&&(Q=new WeakMap,c.set(fe,Q));let pe=Q.get(U);pe===void 0&&(pe=i.getUniformBlockIndex(fe,U.name),Q.set(U,pe))}function ze(U,fe){let pe=c.get(fe).get(U);l.get(fe)!==pe&&(i.uniformBlockBinding(fe,pe,U.__bindingPointIndex),l.set(fe,pe))}function We(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},d={},te=null,ie={},h={},p=new WeakMap,g=[],y=null,m=!1,f=null,S=null,w=null,M=null,E=null,x=null,R=null,_=new Le(0,0,0),T=0,C=!1,P=null,L=null,z=null,I=null,B=null,st.set(0,0,i.canvas.width,i.canvas.height),qe.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ee,disable:be,bindFramebuffer:Be,drawBuffers:N,useProgram:H,setBlending:le,setMaterial:Te,setFlipSided:Re,setCullFace:Ge,setLineWidth:lt,setPolygonOffset:Ht,setScissorTest:St,activeTexture:At,bindTexture:F,unbindTexture:Xt,compressedTexImage2D:ct,compressedTexImage3D:A,texImage2D:K,texImage3D:ne,pixelStorei:De,getParameter:he,updateUBOMapping:Ne,uniformBlockBinding:ze,texStorage2D:ce,texStorage3D:ue,texSubImage2D:v,texSubImage3D:k,compressedTexSubImage2D:$,compressedTexSubImage3D:J,scissor:me,viewport:de,reset:We}}function jv(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Oe,u=new WeakMap,d=new Set,h,p=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(A,v){return g?new OffscreenCanvas(A,v):Er("canvas")}function m(A,v,k){let $=1,J=ct(A);if((J.width>k||J.height>k)&&($=k/Math.max(J.width,J.height)),$<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){let ce=Math.floor($*J.width),ue=Math.floor($*J.height);h===void 0&&(h=y(ce,ue));let K=v?y(ce,ue):h;return K.width=ce,K.height=ue,K.getContext("2d").drawImage(A,0,0,ce,ue),ke("WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+ce+"x"+ue+")."),K}else return"data"in A&&ke("WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),A;return A}function f(A){return A.generateMipmaps}function S(A){i.generateMipmap(A)}function w(A){return A.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?i.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function M(A,v,k,$,J,ce=!1){if(A!==null){if(i[A]!==void 0)return i[A];ke("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let ue;$&&(ue=e.get("EXT_texture_norm16"),ue||ke("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=v;if(v===i.RED&&(k===i.FLOAT&&(K=i.R32F),k===i.HALF_FLOAT&&(K=i.R16F),k===i.UNSIGNED_BYTE&&(K=i.R8),k===i.UNSIGNED_SHORT&&ue&&(K=ue.R16_EXT),k===i.SHORT&&ue&&(K=ue.R16_SNORM_EXT)),v===i.RED_INTEGER&&(k===i.UNSIGNED_BYTE&&(K=i.R8UI),k===i.UNSIGNED_SHORT&&(K=i.R16UI),k===i.UNSIGNED_INT&&(K=i.R32UI),k===i.BYTE&&(K=i.R8I),k===i.SHORT&&(K=i.R16I),k===i.INT&&(K=i.R32I)),v===i.RG&&(k===i.FLOAT&&(K=i.RG32F),k===i.HALF_FLOAT&&(K=i.RG16F),k===i.UNSIGNED_BYTE&&(K=i.RG8),k===i.UNSIGNED_SHORT&&ue&&(K=ue.RG16_EXT),k===i.SHORT&&ue&&(K=ue.RG16_SNORM_EXT)),v===i.RG_INTEGER&&(k===i.UNSIGNED_BYTE&&(K=i.RG8UI),k===i.UNSIGNED_SHORT&&(K=i.RG16UI),k===i.UNSIGNED_INT&&(K=i.RG32UI),k===i.BYTE&&(K=i.RG8I),k===i.SHORT&&(K=i.RG16I),k===i.INT&&(K=i.RG32I)),v===i.RGB_INTEGER&&(k===i.UNSIGNED_BYTE&&(K=i.RGB8UI),k===i.UNSIGNED_SHORT&&(K=i.RGB16UI),k===i.UNSIGNED_INT&&(K=i.RGB32UI),k===i.BYTE&&(K=i.RGB8I),k===i.SHORT&&(K=i.RGB16I),k===i.INT&&(K=i.RGB32I)),v===i.RGBA_INTEGER&&(k===i.UNSIGNED_BYTE&&(K=i.RGBA8UI),k===i.UNSIGNED_SHORT&&(K=i.RGBA16UI),k===i.UNSIGNED_INT&&(K=i.RGBA32UI),k===i.BYTE&&(K=i.RGBA8I),k===i.SHORT&&(K=i.RGBA16I),k===i.INT&&(K=i.RGBA32I)),v===i.RGB&&(k===i.UNSIGNED_SHORT&&ue&&(K=ue.RGB16_EXT),k===i.SHORT&&ue&&(K=ue.RGB16_SNORM_EXT),k===i.UNSIGNED_INT_5_9_9_9_REV&&(K=i.RGB9_E5),k===i.UNSIGNED_INT_10F_11F_11F_REV&&(K=i.R11F_G11F_B10F)),v===i.RGBA){let ne=ce?Sr:Ke.getTransfer(J);k===i.FLOAT&&(K=i.RGBA32F),k===i.HALF_FLOAT&&(K=i.RGBA16F),k===i.UNSIGNED_BYTE&&(K=ne===it?i.SRGB8_ALPHA8:i.RGBA8),k===i.UNSIGNED_SHORT&&ue&&(K=ue.RGBA16_EXT),k===i.SHORT&&ue&&(K=ue.RGBA16_SNORM_EXT),k===i.UNSIGNED_SHORT_4_4_4_4&&(K=i.RGBA4),k===i.UNSIGNED_SHORT_5_5_5_1&&(K=i.RGB5_A1)}return(K===i.R16F||K===i.R32F||K===i.RG16F||K===i.RG32F||K===i.RGBA16F||K===i.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function E(A,v){let k;return A?v===null||v===Fn||v===qs?k=i.DEPTH24_STENCIL8:v===En?k=i.DEPTH32F_STENCIL8:v===Ws&&(k=i.DEPTH24_STENCIL8,ke("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Fn||v===qs?k=i.DEPTH_COMPONENT24:v===En?k=i.DEPTH_COMPONENT32F:v===Ws&&(k=i.DEPTH_COMPONENT16),k}function x(A,v){return f(A)===!0||A.isFramebufferTexture&&A.minFilter!==zt&&A.minFilter!==Wt?Math.log2(Math.max(v.width,v.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?v.mipmaps.length:1}function R(A){let v=A.target;v.removeEventListener("dispose",R),T(v),v.isVideoTexture&&u.delete(v),v.isHTMLTexture&&d.delete(v)}function _(A){let v=A.target;v.removeEventListener("dispose",_),P(v)}function T(A){let v=n.get(A);if(v.__webglInit===void 0)return;let k=A.source,$=p.get(k);if($){let J=$[v.__cacheKey];J.usedTimes--,J.usedTimes===0&&C(A),Object.keys($).length===0&&p.delete(k)}n.remove(A)}function C(A){let v=n.get(A);i.deleteTexture(v.__webglTexture);let k=A.source,$=p.get(k);delete $[v.__cacheKey],a.memory.textures--}function P(A){let v=n.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),n.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(v.__webglFramebuffer[$]))for(let J=0;J<v.__webglFramebuffer[$].length;J++)i.deleteFramebuffer(v.__webglFramebuffer[$][J]);else i.deleteFramebuffer(v.__webglFramebuffer[$]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[$])}else{if(Array.isArray(v.__webglFramebuffer))for(let $=0;$<v.__webglFramebuffer.length;$++)i.deleteFramebuffer(v.__webglFramebuffer[$]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let $=0;$<v.__webglColorRenderbuffer.length;$++)v.__webglColorRenderbuffer[$]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[$]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let k=A.textures;for(let $=0,J=k.length;$<J;$++){let ce=n.get(k[$]);ce.__webglTexture&&(i.deleteTexture(ce.__webglTexture),a.memory.textures--),n.remove(k[$])}n.remove(A)}let L=0;function z(){L=0}function I(){return L}function B(A){L=A}function W(){let A=L;return A>=s.maxTextures&&ke("WebGLTextures: Trying to use "+(A+1)+" texture units while this GPU supports only "+s.maxTextures),L+=1,A}function X(A){let v=[];return v.push(A.wrapS),v.push(A.wrapT),v.push(A.wrapR||0),v.push(A.magFilter),v.push(A.minFilter),v.push(A.anisotropy),v.push(A.internalFormat),v.push(A.format),v.push(A.type),v.push(A.generateMipmaps),v.push(A.premultiplyAlpha),v.push(A.flipY),v.push(A.unpackAlignment),v.push(A.colorSpace),v.join()}function re(A,v){let k=n.get(A);if(A.isVideoTexture&&F(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&k.__version!==A.version){let $=A.image;if($===null)ke("WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)ke("WebGLRenderer: Texture marked for update but image is incomplete");else{be(k,A,v);return}}else A.isExternalTexture&&(k.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,k.__webglTexture,i.TEXTURE0+v)}function q(A,v){let k=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&k.__version!==A.version){be(k,A,v);return}else A.isExternalTexture&&(k.__webglTexture=A.sourceTexture?A.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,k.__webglTexture,i.TEXTURE0+v)}function te(A,v){let k=n.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&k.__version!==A.version){be(k,A,v);return}t.bindTexture(i.TEXTURE_3D,k.__webglTexture,i.TEXTURE0+v)}function ie(A,v){let k=n.get(A);if(A.isCubeDepthTexture!==!0&&A.version>0&&k.__version!==A.version){Be(k,A,v);return}t.bindTexture(i.TEXTURE_CUBE_MAP,k.__webglTexture,i.TEXTURE0+v)}let Ce={[ai]:i.REPEAT,[Hn]:i.CLAMP_TO_EDGE,[mo]:i.MIRRORED_REPEAT},xe={[zt]:i.NEAREST,[bd]:i.NEAREST_MIPMAP_NEAREST,[Yr]:i.NEAREST_MIPMAP_LINEAR,[Wt]:i.LINEAR,[zo]:i.LINEAR_MIPMAP_NEAREST,[Di]:i.LINEAR_MIPMAP_LINEAR},st={[Td]:i.NEVER,[Pd]:i.ALWAYS,[wd]:i.LESS,[Sl]:i.LEQUAL,[Ad]:i.EQUAL,[El]:i.GEQUAL,[Rd]:i.GREATER,[Cd]:i.NOTEQUAL};function qe(A,v){if(v.type===En&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===Wt||v.magFilter===zo||v.magFilter===Yr||v.magFilter===Di||v.minFilter===Wt||v.minFilter===zo||v.minFilter===Yr||v.minFilter===Di)&&ke("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(A,i.TEXTURE_WRAP_S,Ce[v.wrapS]),i.texParameteri(A,i.TEXTURE_WRAP_T,Ce[v.wrapT]),(A===i.TEXTURE_3D||A===i.TEXTURE_2D_ARRAY)&&i.texParameteri(A,i.TEXTURE_WRAP_R,Ce[v.wrapR]),i.texParameteri(A,i.TEXTURE_MAG_FILTER,xe[v.magFilter]),i.texParameteri(A,i.TEXTURE_MIN_FILTER,xe[v.minFilter]),v.compareFunction&&(i.texParameteri(A,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(A,i.TEXTURE_COMPARE_FUNC,st[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===zt||v.minFilter!==Yr&&v.minFilter!==Di||v.type===En&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){let k=e.get("EXT_texture_filter_anisotropic");i.texParameterf(A,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function Ze(A,v){let k=!1;A.__webglInit===void 0&&(A.__webglInit=!0,v.addEventListener("dispose",R));let $=v.source,J=p.get($);J===void 0&&(J={},p.set($,J));let ce=X(v);if(ce!==A.__cacheKey){J[ce]===void 0&&(J[ce]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,k=!0),J[ce].usedTimes++;let ue=J[A.__cacheKey];ue!==void 0&&(J[A.__cacheKey].usedTimes--,ue.usedTimes===0&&C(v)),A.__cacheKey=ce,A.__webglTexture=J[ce].texture}return k}function Z(A,v,k){return Math.floor(Math.floor(A/k)/v)}function ee(A,v,k,$){let ce=A.updateRanges;if(ce.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,v.width,v.height,k,$,v.data);else{ce.sort((De,me)=>De.start-me.start);let ue=0;for(let De=1;De<ce.length;De++){let me=ce[ue],de=ce[De],Ne=me.start+me.count,ze=Z(de.start,v.width,4),We=Z(me.start,v.width,4);de.start<=Ne+1&&ze===We&&Z(de.start+de.count-1,v.width,4)===ze?me.count=Math.max(me.count,de.start+de.count-me.start):(++ue,ce[ue]=de)}ce.length=ue+1;let K=t.getParameter(i.UNPACK_ROW_LENGTH),ne=t.getParameter(i.UNPACK_SKIP_PIXELS),he=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,v.width);for(let De=0,me=ce.length;De<me;De++){let de=ce[De],Ne=Math.floor(de.start/4),ze=Math.ceil(de.count/4),We=Ne%v.width,U=Math.floor(Ne/v.width),fe=ze,Q=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,We),t.pixelStorei(i.UNPACK_SKIP_ROWS,U),t.texSubImage2D(i.TEXTURE_2D,0,We,U,fe,Q,k,$,v.data)}A.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,K),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ne),t.pixelStorei(i.UNPACK_SKIP_ROWS,he)}}function be(A,v,k){let $=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&($=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&($=i.TEXTURE_3D);let J=Ze(A,v),ce=v.source;t.bindTexture($,A.__webglTexture,i.TEXTURE0+k);let ue=n.get(ce);if(ce.version!==ue.__version||J===!0){if(t.activeTexture(i.TEXTURE0+k),(typeof ImageBitmap<"u"&&v.image instanceof ImageBitmap)===!1){let Q=Ke.getPrimaries(Ke.workingColorSpace),pe=v.colorSpace===li?null:Ke.getPrimaries(v.colorSpace),ye=v.colorSpace===li||Q===pe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye)}t.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment);let ne=m(v.image,!1,s.maxTextureSize);ne=Xt(v,ne);let he=r.convert(v.format,v.colorSpace),De=r.convert(v.type),me=M(v.internalFormat,he,De,v.normalized,v.colorSpace,v.isVideoTexture);qe($,v);let de,Ne=v.mipmaps,ze=v.isVideoTexture!==!0,We=ue.__version===void 0||J===!0,U=ce.dataReady,fe=x(v,ne);if(v.isDepthTexture)me=E(v.format===Ni,v.type),We&&(ze?t.texStorage2D(i.TEXTURE_2D,1,me,ne.width,ne.height):t.texImage2D(i.TEXTURE_2D,0,me,ne.width,ne.height,0,he,De,null));else if(v.isDataTexture)if(Ne.length>0){ze&&We&&t.texStorage2D(i.TEXTURE_2D,fe,me,Ne[0].width,Ne[0].height);for(let Q=0,pe=Ne.length;Q<pe;Q++)de=Ne[Q],ze?U&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,de.width,de.height,he,De,de.data):t.texImage2D(i.TEXTURE_2D,Q,me,de.width,de.height,0,he,De,de.data);v.generateMipmaps=!1}else ze?(We&&t.texStorage2D(i.TEXTURE_2D,fe,me,ne.width,ne.height),U&&ee(v,ne,he,De)):t.texImage2D(i.TEXTURE_2D,0,me,ne.width,ne.height,0,he,De,ne.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){ze&&We&&t.texStorage3D(i.TEXTURE_2D_ARRAY,fe,me,Ne[0].width,Ne[0].height,ne.depth);for(let Q=0,pe=Ne.length;Q<pe;Q++)if(de=Ne[Q],v.format!==Tn)if(he!==null)if(ze){if(U)if(v.layerUpdates.size>0){let ye=tu(de.width,de.height,v.format,v.type);for(let ae of v.layerUpdates){let Ue=de.data.subarray(ae*ye/de.data.BYTES_PER_ELEMENT,(ae+1)*ye/de.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,ae,de.width,de.height,1,he,Ue)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,de.width,de.height,ne.depth,he,de.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Q,me,de.width,de.height,ne.depth,0,de.data,0,0);else ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ze?U&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,de.width,de.height,ne.depth,he,De,de.data):t.texImage3D(i.TEXTURE_2D_ARRAY,Q,me,de.width,de.height,ne.depth,0,he,De,de.data);v.layerUpdates.size>0&&v.clearLayerUpdates()}else{ze&&We&&t.texStorage2D(i.TEXTURE_2D,fe,me,Ne[0].width,Ne[0].height);for(let Q=0,pe=Ne.length;Q<pe;Q++)de=Ne[Q],v.format!==Tn?he!==null?ze?U&&t.compressedTexSubImage2D(i.TEXTURE_2D,Q,0,0,de.width,de.height,he,de.data):t.compressedTexImage2D(i.TEXTURE_2D,Q,me,de.width,de.height,0,de.data):ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ze?U&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,de.width,de.height,he,De,de.data):t.texImage2D(i.TEXTURE_2D,Q,me,de.width,de.height,0,he,De,de.data)}else if(v.isDataArrayTexture)if(ze){if(We&&t.texStorage3D(i.TEXTURE_2D_ARRAY,fe,me,ne.width,ne.height,ne.depth),U)if(v.layerUpdates.size>0){let Q=tu(ne.width,ne.height,v.format,v.type);for(let pe of v.layerUpdates){let ye=ne.data.subarray(pe*Q/ne.data.BYTES_PER_ELEMENT,(pe+1)*Q/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,pe,ne.width,ne.height,1,he,De,ye)}v.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,he,De,ne.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,me,ne.width,ne.height,ne.depth,0,he,De,ne.data);else if(v.isData3DTexture)ze?(We&&t.texStorage3D(i.TEXTURE_3D,fe,me,ne.width,ne.height,ne.depth),U&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,he,De,ne.data)):t.texImage3D(i.TEXTURE_3D,0,me,ne.width,ne.height,ne.depth,0,he,De,ne.data);else if(v.isFramebufferTexture){if(We)if(ze)t.texStorage2D(i.TEXTURE_2D,fe,me,ne.width,ne.height);else{let Q=ne.width,pe=ne.height;for(let ye=0;ye<fe;ye++)t.texImage2D(i.TEXTURE_2D,ye,me,Q,pe,0,he,De,null),Q>>=1,pe>>=1}}else if(v.isHTMLTexture){if("texElementImage2D"in i){let Q=i.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),ne.parentNode!==Q){Q.appendChild(ne),d.add(v),Q.onpaint=pe=>{let ye=pe.changedElements;for(let ae of d)ye.includes(ae.image)&&(ae.needsUpdate=!0)},Q.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ne);else{let ye=i.RGBA,ae=i.RGBA,Ue=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,ye,ae,Ue,ne)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ne.length>0){if(ze&&We){let Q=ct(Ne[0]);t.texStorage2D(i.TEXTURE_2D,fe,me,Q.width,Q.height)}for(let Q=0,pe=Ne.length;Q<pe;Q++)de=Ne[Q],ze?U&&t.texSubImage2D(i.TEXTURE_2D,Q,0,0,he,De,de):t.texImage2D(i.TEXTURE_2D,Q,me,he,De,de);v.generateMipmaps=!1}else if(ze){if(We){let Q=ct(ne);t.texStorage2D(i.TEXTURE_2D,fe,me,Q.width,Q.height)}U&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,he,De,ne)}else t.texImage2D(i.TEXTURE_2D,0,me,he,De,ne);f(v)&&S($),ue.__version=ce.version,v.onUpdate&&v.onUpdate(v)}A.__version=v.version}function Be(A,v,k){if(v.image.length!==6)return;let $=Ze(A,v),J=v.source;t.bindTexture(i.TEXTURE_CUBE_MAP,A.__webglTexture,i.TEXTURE0+k);let ce=n.get(J);if(J.version!==ce.__version||$===!0){t.activeTexture(i.TEXTURE0+k);let ue=Ke.getPrimaries(Ke.workingColorSpace),K=v.colorSpace===li?null:Ke.getPrimaries(v.colorSpace),ne=v.colorSpace===li||ue===K?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ne);let he=v.isCompressedTexture||v.image[0].isCompressedTexture,De=v.image[0]&&v.image[0].isDataTexture,me=[];for(let ae=0;ae<6;ae++)!he&&!De?me[ae]=m(v.image[ae],!0,s.maxCubemapSize):me[ae]=De?v.image[ae].image:v.image[ae],me[ae]=Xt(v,me[ae]);let de=me[0],Ne=r.convert(v.format,v.colorSpace),ze=r.convert(v.type),We=M(v.internalFormat,Ne,ze,v.normalized,v.colorSpace),U=v.isVideoTexture!==!0,fe=ce.__version===void 0||$===!0,Q=J.dataReady,pe=x(v,de);qe(i.TEXTURE_CUBE_MAP,v);let ye;if(he){U&&fe&&t.texStorage2D(i.TEXTURE_CUBE_MAP,pe,We,de.width,de.height);for(let ae=0;ae<6;ae++){ye=me[ae].mipmaps;for(let Ue=0;Ue<ye.length;Ue++){let Pe=ye[Ue];v.format!==Tn?Ne!==null?U?Q&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ue,0,0,Pe.width,Pe.height,Ne,Pe.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ue,We,Pe.width,Pe.height,0,Pe.data):ke("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):U?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ue,0,0,Pe.width,Pe.height,Ne,ze,Pe.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ue,We,Pe.width,Pe.height,0,Ne,ze,Pe.data)}}}else{if(ye=v.mipmaps,U&&fe){ye.length>0&&pe++;let ae=ct(me[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,pe,We,ae.width,ae.height)}for(let ae=0;ae<6;ae++)if(De){U?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,me[ae].width,me[ae].height,Ne,ze,me[ae].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,We,me[ae].width,me[ae].height,0,Ne,ze,me[ae].data);for(let Ue=0;Ue<ye.length;Ue++){let pt=ye[Ue].image[ae].image;U?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ue+1,0,0,pt.width,pt.height,Ne,ze,pt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ue+1,We,pt.width,pt.height,0,Ne,ze,pt.data)}}else{U?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,Ne,ze,me[ae]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,We,Ne,ze,me[ae]);for(let Ue=0;Ue<ye.length;Ue++){let Pe=ye[Ue];U?Q&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ue+1,0,0,Ne,ze,Pe.image[ae]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Ue+1,We,Ne,ze,Pe.image[ae])}}}f(v)&&S(i.TEXTURE_CUBE_MAP),ce.__version=J.version,v.onUpdate&&v.onUpdate(v)}A.__version=v.version}function N(A,v,k,$,J,ce){let ue=r.convert(k.format,k.colorSpace),K=r.convert(k.type),ne=M(k.internalFormat,ue,K,k.normalized,k.colorSpace),he=n.get(v),De=n.get(k);if(De.__renderTarget=v,!he.__hasExternalTextures){let me=Math.max(1,v.width>>ce),de=Math.max(1,v.height>>ce);J===i.TEXTURE_3D||J===i.TEXTURE_2D_ARRAY?t.texImage3D(J,ce,ne,me,de,v.depth,0,ue,K,null):t.texImage2D(J,ce,ne,me,de,0,ue,K,null)}t.bindFramebuffer(i.FRAMEBUFFER,A),At(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,$,J,De.__webglTexture,0,St(v)):(J===i.TEXTURE_2D||J>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,$,J,De.__webglTexture,ce),t.bindFramebuffer(i.FRAMEBUFFER,null)}function H(A,v,k){if(i.bindRenderbuffer(i.RENDERBUFFER,A),v.depthBuffer){let $=v.depthTexture,J=$&&$.isDepthTexture?$.type:null,ce=E(v.stencilBuffer,J),ue=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;At(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,St(v),ce,v.width,v.height):k?i.renderbufferStorageMultisample(i.RENDERBUFFER,St(v),ce,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,ce,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ue,i.RENDERBUFFER,A)}else{let $=v.textures;for(let J=0;J<$.length;J++){let ce=$[J],ue=r.convert(ce.format,ce.colorSpace),K=r.convert(ce.type),ne=M(ce.internalFormat,ue,K,ce.normalized,ce.colorSpace);At(v)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,St(v),ne,v.width,v.height):k?i.renderbufferStorageMultisample(i.RENDERBUFFER,St(v),ne,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,ne,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function se(A,v,k){let $=v.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,A),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let J=n.get(v.depthTexture);if(J.__renderTarget=v,(!J.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),$){if(J.__webglInit===void 0&&(J.__webglInit=!0,v.depthTexture.addEventListener("dispose",R)),J.__webglTexture===void 0){J.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,J.__webglTexture),qe(i.TEXTURE_CUBE_MAP,v.depthTexture);let he=r.convert(v.depthTexture.format),De=r.convert(v.depthTexture.type),me;v.depthTexture.format===Vn?me=i.DEPTH_COMPONENT24:v.depthTexture.format===Ni&&(me=i.DEPTH24_STENCIL8);for(let de=0;de<6;de++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,me,v.width,v.height,0,he,De,null)}}else re(v.depthTexture,0);let ce=J.__webglTexture,ue=St(v),K=$?i.TEXTURE_CUBE_MAP_POSITIVE_X+k:i.TEXTURE_2D,ne=v.depthTexture.format===Ni?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(v.depthTexture.format===Vn)At(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,K,ce,0,ue):i.framebufferTexture2D(i.FRAMEBUFFER,ne,K,ce,0);else if(v.depthTexture.format===Ni)At(v)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,K,ce,0,ue):i.framebufferTexture2D(i.FRAMEBUFFER,ne,K,ce,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function oe(A){let v=n.get(A),k=A.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==A.depthTexture){let $=A.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),$){let J=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,$.removeEventListener("dispose",J)};$.addEventListener("dispose",J),v.__depthDisposeCallback=J}v.__boundDepthTexture=$}if(A.depthTexture&&!v.__autoAllocateDepthBuffer)if(k)for(let $=0;$<6;$++)se(v.__webglFramebuffer[$],A,$);else{let $=A.texture.mipmaps;$&&$.length>0?se(v.__webglFramebuffer[0],A,0):se(v.__webglFramebuffer,A,0)}else if(k){v.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[$]),v.__webglDepthbuffer[$]===void 0)v.__webglDepthbuffer[$]=i.createRenderbuffer(),H(v.__webglDepthbuffer[$],A,!1);else{let J=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=v.__webglDepthbuffer[$];i.bindRenderbuffer(i.RENDERBUFFER,ce),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,ce)}}else{let $=A.texture.mipmaps;if($&&$.length>0?t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),H(v.__webglDepthbuffer,A,!1);else{let J=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ce=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ce),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,ce)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function le(A,v,k){let $=n.get(A);v!==void 0&&N($.__webglFramebuffer,A,A.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),k!==void 0&&oe(A)}function Te(A){let v=A.texture,k=n.get(A),$=n.get(v);A.addEventListener("dispose",_);let J=A.textures,ce=A.isWebGLCubeRenderTarget===!0,ue=J.length>1;if(ue||($.__webglTexture===void 0&&($.__webglTexture=i.createTexture()),$.__version=v.version,a.memory.textures++),ce){k.__webglFramebuffer=[];for(let K=0;K<6;K++)if(v.mipmaps&&v.mipmaps.length>0){k.__webglFramebuffer[K]=[];for(let ne=0;ne<v.mipmaps.length;ne++)k.__webglFramebuffer[K][ne]=i.createFramebuffer()}else k.__webglFramebuffer[K]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){k.__webglFramebuffer=[];for(let K=0;K<v.mipmaps.length;K++)k.__webglFramebuffer[K]=i.createFramebuffer()}else k.__webglFramebuffer=i.createFramebuffer();if(ue)for(let K=0,ne=J.length;K<ne;K++){let he=n.get(J[K]);he.__webglTexture===void 0&&(he.__webglTexture=i.createTexture(),a.memory.textures++)}if(A.samples>0&&At(A)===!1){k.__webglMultisampledFramebuffer=i.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let K=0;K<J.length;K++){let ne=J[K];k.__webglColorRenderbuffer[K]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,k.__webglColorRenderbuffer[K]);let he=r.convert(ne.format,ne.colorSpace),De=r.convert(ne.type),me=M(ne.internalFormat,he,De,ne.normalized,ne.colorSpace,A.isXRRenderTarget===!0),de=St(A);i.renderbufferStorageMultisample(i.RENDERBUFFER,de,me,A.width,A.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+K,i.RENDERBUFFER,k.__webglColorRenderbuffer[K])}i.bindRenderbuffer(i.RENDERBUFFER,null),A.depthBuffer&&(k.__webglDepthRenderbuffer=i.createRenderbuffer(),H(k.__webglDepthRenderbuffer,A,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ce){t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture),qe(i.TEXTURE_CUBE_MAP,v);for(let K=0;K<6;K++)if(v.mipmaps&&v.mipmaps.length>0)for(let ne=0;ne<v.mipmaps.length;ne++)N(k.__webglFramebuffer[K][ne],A,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,ne);else N(k.__webglFramebuffer[K],A,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);f(v)&&S(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ue){for(let K=0,ne=J.length;K<ne;K++){let he=J[K],De=n.get(he),me=i.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(me=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(me,De.__webglTexture),qe(me,he),N(k.__webglFramebuffer,A,he,i.COLOR_ATTACHMENT0+K,me,0),f(he)&&S(me)}t.unbindTexture()}else{let K=i.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(K=A.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(K,$.__webglTexture),qe(K,v),v.mipmaps&&v.mipmaps.length>0)for(let ne=0;ne<v.mipmaps.length;ne++)N(k.__webglFramebuffer[ne],A,v,i.COLOR_ATTACHMENT0,K,ne);else N(k.__webglFramebuffer,A,v,i.COLOR_ATTACHMENT0,K,0);f(v)&&S(K),t.unbindTexture()}A.depthBuffer&&oe(A)}function Re(A){let v=A.textures;for(let k=0,$=v.length;k<$;k++){let J=v[k];if(f(J)){let ce=w(A),ue=n.get(J).__webglTexture;t.bindTexture(ce,ue),S(ce),t.unbindTexture()}}}let Ge=[],lt=[];function Ht(A){if(A.samples>0){if(At(A)===!1){let v=A.textures,k=A.width,$=A.height,J=i.COLOR_BUFFER_BIT,ce=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=n.get(A),K=v.length>1;if(K)for(let he=0;he<v.length;he++)t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,ue.__webglMultisampledFramebuffer);let ne=A.texture.mipmaps;ne&&ne.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ue.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ue.__webglFramebuffer);for(let he=0;he<v.length;he++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(J|=i.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(J|=i.STENCIL_BUFFER_BIT)),K){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ue.__webglColorRenderbuffer[he]);let De=n.get(v[he]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,De,0)}i.blitFramebuffer(0,0,k,$,0,0,k,$,J,i.NEAREST),l===!0&&(Ge.length=0,lt.length=0,Ge.push(i.COLOR_ATTACHMENT0+he),A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&(Ge.push(ce),lt.push(ce),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,lt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ge))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),K)for(let he=0;he<v.length;he++){t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.RENDERBUFFER,ue.__webglColorRenderbuffer[he]);let De=n.get(v[he]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,ue.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+he,i.TEXTURE_2D,De,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,ue.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&l){let v=A.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function St(A){return Math.min(s.maxSamples,A.samples)}function At(A){let v=n.get(A);return A.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function F(A){let v=a.render.frame;u.get(A)!==v&&(u.set(A,v),A.update())}function Xt(A,v){let k=A.colorSpace,$=A.format,J=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||k!==Mr&&k!==li&&(Ke.getTransfer(k)===it?($!==Tn||J!==fn)&&ke("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):He("WebGLTextures: Unsupported texture color space:",k)),v}function ct(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=W,this.resetTextureUnits=z,this.getTextureUnits=I,this.setTextureUnits=B,this.setTexture2D=re,this.setTexture2DArray=q,this.setTexture3D=te,this.setTextureCube=ie,this.rebindTextures=le,this.setupRenderTarget=Te,this.updateRenderTargetMipmap=Re,this.updateMultisampleRenderTarget=Ht,this.setupDepthRenderbuffer=oe,this.setupFrameBufferTexture=N,this.useMultisampledRTT=At,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Xv(i,e){function t(n,s=li){let r,a=Ke.getTransfer(s);if(n===fn)return i.UNSIGNED_BYTE;if(n===Ho)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Vo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===$c)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Wc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Vc)return i.BYTE;if(n===Gc)return i.SHORT;if(n===Ws)return i.UNSIGNED_SHORT;if(n===ko)return i.INT;if(n===Fn)return i.UNSIGNED_INT;if(n===En)return i.FLOAT;if(n===Nt)return i.HALF_FLOAT;if(n===qc)return i.ALPHA;if(n===jc)return i.RGB;if(n===Tn)return i.RGBA;if(n===Vn)return i.DEPTH_COMPONENT;if(n===Ni)return i.DEPTH_STENCIL;if(n===Go)return i.RED;if(n===$o)return i.RED_INTEGER;if(n===Ui)return i.RG;if(n===Wo)return i.RG_INTEGER;if(n===qo)return i.RGBA_INTEGER;if(n===Zr||n===Jr||n===Kr||n===Qr)if(a===it)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Zr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Jr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Kr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Qr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Zr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Jr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Kr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Qr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===jo||n===Xo||n===Yo||n===Zo)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===jo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Xo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Yo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Zo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Jo||n===Ko||n===Qo||n===el||n===tl||n===ea||n===nl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Jo||n===Ko)return a===it?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Qo)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===el)return r.COMPRESSED_R11_EAC;if(n===tl)return r.COMPRESSED_SIGNED_R11_EAC;if(n===ea)return r.COMPRESSED_RG11_EAC;if(n===nl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===il||n===sl||n===rl||n===al||n===ol||n===ll||n===cl||n===ul||n===hl||n===dl||n===fl||n===pl||n===ml||n===gl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===il)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===sl)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===rl)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===al)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ol)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ll)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===cl)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ul)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===hl)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===dl)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===fl)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===pl)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ml)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===gl)return a===it?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===xl||n===vl||n===_l)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===xl)return a===it?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===vl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===_l)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===yl||n===bl||n===ta||n===Ml)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===yl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===bl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ta)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ml)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===qs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}function Kv(i,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,Kc(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,S,w,M){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?r(m,f):f.isMeshLambertMaterial?(r(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(r(m,f),d(m,f)):f.isMeshPhongMaterial?(r(m,f),u(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(r(m,f),h(m,f),f.isMeshPhysicalMaterial&&p(m,f,M)):f.isMeshMatcapMaterial?(r(m,f),g(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),y(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(a(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?l(m,f,S,w):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===qt&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===qt&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let S=e.get(f),w=S.envMap,M=S.envMapRotation;w&&(m.envMap.value=w,m.envMapRotation.value.setFromMatrix4(Jv.makeRotationFromEuler(M)).transpose(),w.isCubeTexture&&w.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(ff),m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function a(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,S,w){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*S,m.scale.value=w*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function u(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function d(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function h(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,S){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===qt&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.retroreflectivity>0&&(m.retroreflectivity.value=f.retroreflectivity),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=S.texture,m.transmissionSamplerSize.value.set(S.width,S.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function y(m,f){let S=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(S.matrixWorld),m.nearDistance.value=S.shadow.camera.near,m.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Qv(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,E){let x=E.program;n.uniformBlockBinding(M,x)}function c(M,E){let x=s[M.id];x===void 0&&(m(M),x=u(M),s[M.id]=x,M.addEventListener("dispose",S));let R=E.program;n.updateUBOMapping(M,R);let _=e.render.frame;r[M.id]!==_&&(h(M),r[M.id]=_)}function u(M){let E=d();M.__bindingPointIndex=E;let x=i.createBuffer(),R=M.__size,_=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,x),i.bufferData(i.UNIFORM_BUFFER,R,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,x),x}function d(){for(let M=0;M<o;M++)if(a.indexOf(M)===-1)return a.push(M),M;return He("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(M){let E=s[M.id],x=M.uniforms,R=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let _=0,T=x.length;_<T;_++){let C=x[_];if(Array.isArray(C))for(let P=0,L=C.length;P<L;P++)p(C[P],_,P,R);else p(C,_,0,R)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(M,E,x,R){if(y(M,E,x,R)===!0){let _=M.__offset,T=M.value;if(Array.isArray(T)){let C=0;for(let P=0;P<T.length;P++){let L=T[P],z=f(L);g(L,M.__data,C),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(C+=z.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(T,M.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,M.__data)}}function g(M,E,x){typeof M=="number"||typeof M=="boolean"?E[0]=M:M.isMatrix3?(E[0]=M.elements[0],E[1]=M.elements[1],E[2]=M.elements[2],E[3]=0,E[4]=M.elements[3],E[5]=M.elements[4],E[6]=M.elements[5],E[7]=0,E[8]=M.elements[6],E[9]=M.elements[7],E[10]=M.elements[8],E[11]=0):ArrayBuffer.isView(M)?E.set(new M.constructor(M.buffer,M.byteOffset,E.length)):M.toArray(E,x)}function y(M,E,x,R){let _=M.value,T=E+"_"+x;if(R[T]===void 0)return typeof _=="number"||typeof _=="boolean"?R[T]=_:ArrayBuffer.isView(_)?R[T]=_.slice():R[T]=_.clone(),!0;{let C=R[T];if(typeof _=="number"||typeof _=="boolean"){if(C!==_)return R[T]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(C.equals(_)===!1)return C.copy(_),!0}}return!1}function m(M){let E=M.uniforms,x=0,R=16;for(let T=0,C=E.length;T<C;T++){let P=Array.isArray(E[T])?E[T]:[E[T]];for(let L=0,z=P.length;L<z;L++){let I=P[L],B=Array.isArray(I.value)?I.value:[I.value];for(let W=0,X=B.length;W<X;W++){let re=B[W],q=f(re),te=x%R,ie=te%q.boundary,Ce=te+ie;x+=ie,Ce!==0&&R-Ce<q.storage&&(x+=R-Ce),I.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=x,x+=q.storage}}}let _=x%R;return _>0&&(x+=R-_),M.__size=x,M.__cache={},this}function f(M){let E={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(E.boundary=4,E.storage=4):M.isVector2?(E.boundary=8,E.storage=8):M.isVector3||M.isColor?(E.boundary=16,E.storage=12):M.isVector4?(E.boundary=16,E.storage=16):M.isMatrix3?(E.boundary=48,E.storage=48):M.isMatrix4?(E.boundary=64,E.storage=64):M.isTexture?ke("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(M)?(E.boundary=16,E.storage=M.byteLength):ke("WebGLRenderer: Unsupported uniform value type.",M),E}function S(M){let E=M.target;E.removeEventListener("dispose",S);let x=a.indexOf(E.__bindingPointIndex);a.splice(x,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function w(){for(let M in s)i.deleteBuffer(s[M]);a=[],s={},r={}}return{bind:l,update:c,dispose:w}}function t_(){return Yn===null&&(Yn=new Cr(e_,16,16,Ui,Nt),Yn.name="DFG_LUT",Yn.minFilter=Wt,Yn.magFilter=Wt,Yn.wrapS=Hn,Yn.wrapT=Hn,Yn.generateMipmaps=!1,Yn.needsUpdate=!0),Yn}var pm,mm,gm,xm,vm,_m,ym,bm,Mm,Sm,Em,Tm,wm,Am,Rm,Cm,Pm,Im,Lm,Dm,Nm,Um,Fm,Om,Bm,zm,km,Hm,Vm,Gm,$m,Wm,qm,jm,Xm,Ym,Zm,Jm,Km,Qm,eg,tg,ng,ig,sg,rg,ag,og,lg,cg,ug,hg,dg,fg,pg,mg,gg,xg,vg,_g,yg,bg,Mg,Sg,Eg,Tg,wg,Ag,Rg,Cg,Pg,Ig,Lg,Dg,Ng,Ug,Fg,Og,Bg,zg,kg,Hg,Vg,Gg,$g,Wg,qg,jg,Xg,Yg,Zg,Jg,Kg,Qg,e0,t0,n0,i0,s0,r0,a0,o0,l0,c0,u0,h0,d0,f0,p0,m0,g0,x0,v0,_0,y0,b0,M0,S0,E0,T0,w0,A0,R0,C0,P0,I0,L0,D0,N0,U0,F0,O0,B0,z0,k0,H0,V0,G0,$0,W0,q0,j0,Ye,ge,Zn,wl,X0,lf,Ys,ex,tx,nx,ia,zd,lu,cu,uu,hu,ix,ns,Js,Rl,px,cf,pu,uf,hf,df,Gd,$d,Wd,qd,jd,mu,gu,xu,du,Zs,iv,sv,Zd,lv,Al,pv,mv,xv,_v,bv,Sv,Tv,Cv,_u,yu,Ov,Hv,Vv,Gv,$v,af,sa,fu,Yv,Zv,bu,Mu,Jv,ff,e_,Yn,Cl,wn=Vt(()=>{ou();ou();pm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,mm=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,gm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,xm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,vm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,_m=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ym=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,bm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Mm=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Sm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Em=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Tm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,wm=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Am=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Rm=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Cm=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Pm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Im=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Lm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Dm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Nm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Um=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Fm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Om=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Bm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,zm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,km=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Hm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Vm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Gm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,$m="gl_FragColor = linearToOutputTexel( gl_FragColor );",Wm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,qm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,jm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Xm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Ym=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Zm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Jm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Km=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Qm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,eg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,tg=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,ng=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ig=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,sg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,rg=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,ag=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,og=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lg=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,cg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,ug=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,hg=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,dg=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,fg=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,pg=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,mg=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,gg=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,xg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,vg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_g=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,yg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,bg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Mg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Sg=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Eg=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Tg=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,wg=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ag=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Rg=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Cg=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Pg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Ig=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Lg=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Dg=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Ng=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ug=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Fg=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Og=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Bg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,zg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,kg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Hg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Vg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Gg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,$g=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Wg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,qg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,jg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Xg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Yg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Zg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Jg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Kg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Qg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,e0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,t0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,n0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,i0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,s0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,r0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,a0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,o0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,l0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,c0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,u0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,h0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,d0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,f0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,p0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,m0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,g0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,x0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,v0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,y0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,b0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,M0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,S0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,E0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,T0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,w0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,A0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,R0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,C0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,P0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,I0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,L0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,D0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,N0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,U0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,F0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,O0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,B0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,z0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,k0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,H0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,V0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,G0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,$0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,W0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,q0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,j0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ye={alphahash_fragment:pm,alphahash_pars_fragment:mm,alphamap_fragment:gm,alphamap_pars_fragment:xm,alphatest_fragment:vm,alphatest_pars_fragment:_m,aomap_fragment:ym,aomap_pars_fragment:bm,batching_pars_vertex:Mm,batching_vertex:Sm,begin_vertex:Em,beginnormal_vertex:Tm,bsdfs:wm,iridescence_fragment:Am,bumpmap_pars_fragment:Rm,clipping_planes_fragment:Cm,clipping_planes_pars_fragment:Pm,clipping_planes_pars_vertex:Im,clipping_planes_vertex:Lm,color_fragment:Dm,color_pars_fragment:Nm,color_pars_vertex:Um,color_vertex:Fm,common:Om,cube_uv_reflection_fragment:Bm,defaultnormal_vertex:zm,displacementmap_pars_vertex:km,displacementmap_vertex:Hm,emissivemap_fragment:Vm,emissivemap_pars_fragment:Gm,colorspace_fragment:$m,colorspace_pars_fragment:Wm,envmap_fragment:qm,envmap_common_pars_fragment:jm,envmap_pars_fragment:Xm,envmap_pars_vertex:Ym,envmap_physical_pars_fragment:ag,envmap_vertex:Zm,fog_vertex:Jm,fog_pars_vertex:Km,fog_fragment:Qm,fog_pars_fragment:eg,gradientmap_pars_fragment:tg,lightmap_pars_fragment:ng,lights_lambert_fragment:ig,lights_lambert_pars_fragment:sg,lights_pars_begin:rg,lights_toon_fragment:og,lights_toon_pars_fragment:lg,lights_phong_fragment:cg,lights_phong_pars_fragment:ug,lights_physical_fragment:hg,lights_physical_pars_fragment:dg,lights_fragment_begin:fg,lights_fragment_maps:pg,lights_fragment_end:mg,lightprobes_pars_fragment:gg,logdepthbuf_fragment:xg,logdepthbuf_pars_fragment:vg,logdepthbuf_pars_vertex:_g,logdepthbuf_vertex:yg,map_fragment:bg,map_pars_fragment:Mg,map_particle_fragment:Sg,map_particle_pars_fragment:Eg,metalnessmap_fragment:Tg,metalnessmap_pars_fragment:wg,morphinstance_vertex:Ag,morphcolor_vertex:Rg,morphnormal_vertex:Cg,morphtarget_pars_vertex:Pg,morphtarget_vertex:Ig,normal_fragment_begin:Lg,normal_fragment_maps:Dg,normal_pars_fragment:Ng,normal_pars_vertex:Ug,normal_vertex:Fg,normalmap_pars_fragment:Og,clearcoat_normal_fragment_begin:Bg,clearcoat_normal_fragment_maps:zg,clearcoat_pars_fragment:kg,iridescence_pars_fragment:Hg,opaque_fragment:Vg,packing:Gg,premultiplied_alpha_fragment:$g,project_vertex:Wg,dithering_fragment:qg,dithering_pars_fragment:jg,roughnessmap_fragment:Xg,roughnessmap_pars_fragment:Yg,shadowmap_pars_fragment:Zg,shadowmap_pars_vertex:Jg,shadowmap_vertex:Kg,shadowmask_pars_fragment:Qg,skinbase_vertex:e0,skinning_pars_vertex:t0,skinning_vertex:n0,skinnormal_vertex:i0,specularmap_fragment:s0,specularmap_pars_fragment:r0,tonemapping_fragment:a0,tonemapping_pars_fragment:o0,transmission_fragment:l0,transmission_pars_fragment:c0,uv_pars_fragment:u0,uv_pars_vertex:h0,uv_vertex:d0,worldpos_vertex:f0,background_vert:p0,background_frag:m0,backgroundCube_vert:g0,backgroundCube_frag:x0,cube_vert:v0,cube_frag:_0,depth_vert:y0,depth_frag:b0,distance_vert:M0,distance_frag:S0,equirect_vert:E0,equirect_frag:T0,linedashed_vert:w0,linedashed_frag:A0,meshbasic_vert:R0,meshbasic_frag:C0,meshlambert_vert:P0,meshlambert_frag:I0,meshmatcap_vert:L0,meshmatcap_frag:D0,meshnormal_vert:N0,meshnormal_frag:U0,meshphong_vert:F0,meshphong_frag:O0,meshphysical_vert:B0,meshphysical_frag:z0,meshtoon_vert:k0,meshtoon_frag:H0,points_vert:V0,points_frag:G0,shadow_vert:$0,shadow_frag:W0,sprite_vert:q0,sprite_frag:j0},ge={common:{diffuse:{value:new Le(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new $e},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new $e}},envmap:{envMap:{value:null},envMapRotation:{value:new $e},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new $e}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new $e}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new $e},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new $e},normalScale:{value:new Oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new $e},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new $e}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new $e}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new $e}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Le(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new O},probesMax:{value:new O},probesResolution:{value:new O}},points:{diffuse:{value:new Le(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0},uvTransform:{value:new $e}},sprite:{diffuse:{value:new Le(16777215)},opacity:{value:1},center:{value:new Oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new $e},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0}}},Zn={basic:{uniforms:sn([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.fog]),vertexShader:Ye.meshbasic_vert,fragmentShader:Ye.meshbasic_frag},lambert:{uniforms:sn([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,ge.lights,{emissive:{value:new Le(0)},envMapIntensity:{value:1}}]),vertexShader:Ye.meshlambert_vert,fragmentShader:Ye.meshlambert_frag},phong:{uniforms:sn([ge.common,ge.specularmap,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,ge.lights,{emissive:{value:new Le(0)},specular:{value:new Le(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Ye.meshphong_vert,fragmentShader:Ye.meshphong_frag},standard:{uniforms:sn([ge.common,ge.envmap,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.roughnessmap,ge.metalnessmap,ge.fog,ge.lights,{emissive:{value:new Le(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ye.meshphysical_vert,fragmentShader:Ye.meshphysical_frag},toon:{uniforms:sn([ge.common,ge.aomap,ge.lightmap,ge.emissivemap,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.gradientmap,ge.fog,ge.lights,{emissive:{value:new Le(0)}}]),vertexShader:Ye.meshtoon_vert,fragmentShader:Ye.meshtoon_frag},matcap:{uniforms:sn([ge.common,ge.bumpmap,ge.normalmap,ge.displacementmap,ge.fog,{matcap:{value:null}}]),vertexShader:Ye.meshmatcap_vert,fragmentShader:Ye.meshmatcap_frag},points:{uniforms:sn([ge.points,ge.fog]),vertexShader:Ye.points_vert,fragmentShader:Ye.points_frag},dashed:{uniforms:sn([ge.common,ge.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ye.linedashed_vert,fragmentShader:Ye.linedashed_frag},depth:{uniforms:sn([ge.common,ge.displacementmap]),vertexShader:Ye.depth_vert,fragmentShader:Ye.depth_frag},normal:{uniforms:sn([ge.common,ge.bumpmap,ge.normalmap,ge.displacementmap,{opacity:{value:1}}]),vertexShader:Ye.meshnormal_vert,fragmentShader:Ye.meshnormal_frag},sprite:{uniforms:sn([ge.sprite,ge.fog]),vertexShader:Ye.sprite_vert,fragmentShader:Ye.sprite_frag},background:{uniforms:{uvTransform:{value:new $e},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ye.background_vert,fragmentShader:Ye.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new $e}},vertexShader:Ye.backgroundCube_vert,fragmentShader:Ye.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ye.cube_vert,fragmentShader:Ye.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ye.equirect_vert,fragmentShader:Ye.equirect_frag},distance:{uniforms:sn([ge.common,ge.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ye.distance_vert,fragmentShader:Ye.distance_frag},shadow:{uniforms:sn([ge.lights,ge.fog,{color:{value:new Le(0)},opacity:{value:1}}]),vertexShader:Ye.shadow_vert,fragmentShader:Ye.shadow_frag}};Zn.physical={uniforms:sn([Zn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new $e},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new $e},clearcoatNormalScale:{value:new Oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new $e},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new $e},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new $e},sheen:{value:0},sheenColor:{value:new Le(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new $e},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new $e},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new $e},transmissionSamplerSize:{value:new Oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new $e},attenuationDistance:{value:0},attenuationColor:{value:new Le(0)},specularColor:{value:new Le(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new $e},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new $e},anisotropyVector:{value:new Oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new $e}}]),vertexShader:Ye.meshphysical_vert,fragmentShader:Ye.meshphysical_frag};wl={r:0,b:0,g:0},X0=new ht,lf=new $e;lf.set(-1,0,0,0,1,0,0,0,1);Ys=4,ex=6,tx=20,nx=256,ia=new Pi,zd=new Le,lu=null,cu=0,uu=0,hu=!1,ix=new O,ns=new O,Js=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=ix}=r;lu=this._renderer.getRenderTarget(),cu=this._renderer.getActiveCubeFace(),uu=this._renderer.getActiveMipmapLevel(),hu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Vd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Hd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(lu,cu,uu),this._renderer.xr.enabled=hu,e.scissorTest=!1,Xs(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Li||e.mapping===es?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),lu=this._renderer.getRenderTarget(),cu=this._renderer.getActiveCubeFace(),uu=this._renderer.getActiveMipmapLevel(),hu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Wt,minFilter:Wt,generateMipmaps:!1,type:Nt,format:Tn,colorSpace:Mr,depthBuffer:!1},s=kd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=kd(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=sx(r)),this._blurMaterial=ax(r,e,t),this._ggxMaterial=rx(r,e,t)}return s}_compileMaterial(e){let t=new Me(new Dt,e);this._renderer.compile(t,ia)}_sceneToCubeUV(e,t,n,s,r){let l=new $t(90,1,t,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,p=d.toneMapping;d.getClearColor(zd),d.toneMapping=Un,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Me(new Je,new Pt({name:"PMREM.Background",side:qt,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,m=y.material,f=!1,S=e.background;S?S.isColor&&(m.color.copy(S),e.background=null,f=!0):(m.color.copy(zd),f=!0);for(let w=0;w<6;w++){let M=w%3;M===0?(l.up.set(0,c[w],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[w],r.y,r.z)):M===1?(l.up.set(0,0,c[w]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[w],r.z)):(l.up.set(0,c[w],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[w]));let E=this._cubeSize;Xs(s,M*E,w>2?E:0,E,E),d.setRenderTarget(s),f&&d.render(y,l),d.render(e,l)}d.toneMapping=p,d.autoClear=h,e.background=S}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Li||e.mapping===es;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Vd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Hd());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;Xs(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,ia)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-u*u),h=c*1.25,p=d*h,{_lodMax:g}=this,y=this._sizeLods[n],m=3*y*(n>g-Ys?n-g+Ys:0),f=4*(this._cubeSize-y);l.envMap.value=e.texture,l.roughness.value=p,l.mipInt.value=g-t,Xs(r,m,f,3*y,2*y),s.setRenderTarget(r),s.render(o,ia),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,Xs(e,m,f,3*y,2*y),s.setRenderTarget(e),s.render(o,ia)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,a),this._blurPass(r,e,n,n,a)}_blurPass(e,t,n,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let u=this._sizeLods[s],d=3*u*(s>this._lodMax-Ys?s-this._lodMax+Ys:0),h=4*(this._cubeSize-u);Xs(t,d,h,3*u,2*u),a.setRenderTarget(t),a.render(l,ia)}};Rl=class extends Et{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Lr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Je(5,5,5),r=new Mt({name:"CubemapFromEquirect",uniforms:ts(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:qt,blending:Sn});r.uniforms.tEquirect.value=t;let a=new Me(s,r),o=t.minFilter;return t.minFilter===Di&&(t.minFilter=Wt),new Do(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}};px={[Vr]:"LINEAR_TONE_MAPPING",[Gr]:"REINHARD_TONE_MAPPING",[$r]:"CINEON_TONE_MAPPING",[Qi]:"ACES_FILMIC_TONE_MAPPING",[qr]:"AGX_TONE_MAPPING",[jr]:"NEUTRAL_TONE_MAPPING",[Wr]:"CUSTOM_TONE_MAPPING"};cf=new cn,pu=new Ti(1,1),uf=new Tr,hf=new _o,df=new Lr,Gd=[],$d=[],Wd=new Float32Array(16),qd=new Float32Array(9),jd=new Float32Array(4);mu=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Ux(t.type)}},gu=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=tv(t.type)}},xu=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},du=/(\w+)(\])?(\[|\.)?/g;Zs=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);nv(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};iv=37297,sv=0;Zd=new $e;lv={[Vr]:"Linear",[Gr]:"Reinhard",[$r]:"Cineon",[Qi]:"ACESFilmic",[qr]:"AgX",[jr]:"Neutral",[Wr]:"Custom"};Al=new O;pv=/^[ \t]*#include +<([\w\d./]+)>/gm;mv=new Map;xv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;_v={[Ji]:"SHADOWMAP_TYPE_PCF",[Gs]:"SHADOWMAP_TYPE_VSM"};bv={[Li]:"ENVMAP_TYPE_CUBE",[es]:"ENVMAP_TYPE_CUBE",[Xr]:"ENVMAP_TYPE_CUBE_UV"};Sv={[es]:"ENVMAP_MODE_REFRACTION"};Tv={[Fo]:"ENVMAP_BLENDING_MULTIPLY",[_d]:"ENVMAP_BLENDING_MIX",[yd]:"ENVMAP_BLENDING_ADD"};Cv=0,_u=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new yu(e),t.set(e,n)),n}},yu=class{constructor(e){this.id=Cv++,this.code=e,this.usedTimes=0}};Ov=0;Hv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Vv=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Gv=[new O(1,0,0),new O(-1,0,0),new O(0,1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1)],$v=[new O(0,-1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1),new O(0,-1,0),new O(0,-1,0)],af=new ht,sa=new O,fu=new O;Yv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Zv=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,bu=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Dr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Mt({vertexShader:Yv,fragmentShader:Zv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Me(new hn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Mu=class extends Gn{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,d=null,h=null,p=null,g=null,y=typeof XRWebGLBinding<"u",m=new bu,f={},S=t.getContextAttributes(),w=null,M=null,E=[],x=[],R=new Oe,_=null,T=null,C=new $t;C.viewport=new yt;let P=new $t;P.viewport=new yt;let L=[C,P],z=new No,I=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let ee=E[Z];return ee===void 0&&(ee=new Fs,E[Z]=ee),ee.getTargetRaySpace()},this.getControllerGrip=function(Z){let ee=E[Z];return ee===void 0&&(ee=new Fs,E[Z]=ee),ee.getGripSpace()},this.getHand=function(Z){let ee=E[Z];return ee===void 0&&(ee=new Fs,E[Z]=ee),ee.getHandSpace()};function W(Z){let ee=x.indexOf(Z.inputSource);if(ee===-1)return;let be=E[ee];be!==void 0&&(be.update(Z.inputSource,Z.frame,c||a),be.dispatchEvent({type:Z.type,data:Z.inputSource}))}function X(){s.removeEventListener("select",W),s.removeEventListener("selectstart",W),s.removeEventListener("selectend",W),s.removeEventListener("squeeze",W),s.removeEventListener("squeezestart",W),s.removeEventListener("squeezeend",W),s.removeEventListener("end",X),s.removeEventListener("inputsourceschange",re);for(let Z=0;Z<E.length;Z++){let ee=x[Z];ee!==null&&(x[Z]=null,E[Z].disconnect(ee))}I=null,B=null,m.reset();for(let Z in f)delete f[Z];if(e.setRenderTarget(w),p=null,h=null,d=null,s=null,M=null,Ze.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(R.width,R.height,!1),T!==null){let Z=T.camera;Z.fov=T.fov,Z.zoom=T.zoom,Z.updateProjectionMatrix(),T=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,n.isPresenting===!0&&ke("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,n.isPresenting===!0&&ke("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return h!==null?h:p},this.getBinding=function(){return d===null&&y&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(w=e.getRenderTarget(),s.addEventListener("select",W),s.addEventListener("selectstart",W),s.addEventListener("selectend",W),s.addEventListener("squeeze",W),s.addEventListener("squeezestart",W),s.addEventListener("squeezeend",W),s.addEventListener("end",X),s.addEventListener("inputsourceschange",re),S.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(R),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let be=null,Be=null,N=null;S.depth&&(N=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,be=S.stencil?Ni:Vn,Be=S.stencil?qs:Fn);let H={colorFormat:t.RGBA8,depthFormat:N,scaleFactor:r};d=this.getBinding(),h=d.createProjectionLayer(H),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),M=new Et(h.textureWidth,h.textureHeight,{format:Tn,type:fn,depthTexture:new Ti(h.textureWidth,h.textureHeight,Be,void 0,void 0,void 0,void 0,void 0,void 0,be),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{let be={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,be),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),M=new Et(p.framebufferWidth,p.framebufferHeight,{format:Tn,type:fn,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Ze.setContext(s),Ze.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function re(Z){for(let ee=0;ee<Z.removed.length;ee++){let be=Z.removed[ee],Be=x.indexOf(be);Be>=0&&(x[Be]=null,E[Be].disconnect(be))}for(let ee=0;ee<Z.added.length;ee++){let be=Z.added[ee],Be=x.indexOf(be);if(Be===-1){for(let H=0;H<E.length;H++)if(H>=x.length){x.push(be),Be=H;break}else if(x[H]===null){x[H]=be,Be=H;break}if(Be===-1)break}let N=E[Be];N&&N.connect(be)}}let q=new O,te=new O;function ie(Z,ee,be){q.setFromMatrixPosition(ee.matrixWorld),te.setFromMatrixPosition(be.matrixWorld);let Be=q.distanceTo(te),N=ee.projectionMatrix.elements,H=be.projectionMatrix.elements,se=N[14]/(N[10]-1),oe=N[14]/(N[10]+1),le=(N[9]+1)/N[5],Te=(N[9]-1)/N[5],Re=(N[8]-1)/N[0],Ge=(H[8]+1)/H[0],lt=se*Re,Ht=se*Ge,St=Be/(-Re+Ge),At=St*-Re;if(ee.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(At),Z.translateZ(St),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),N[10]===-1)Z.projectionMatrix.copy(ee.projectionMatrix),Z.projectionMatrixInverse.copy(ee.projectionMatrixInverse);else{let F=se+St,Xt=oe+St,ct=lt-At,A=Ht+(Be-At),v=le*oe/Xt*F,k=Te*oe/Xt*F;Z.projectionMatrix.makePerspective(ct,A,v,k,F,Xt),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function Ce(Z,ee){ee===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(ee.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let ee=Z.near,be=Z.far;m.texture!==null&&(m.depthNear>0&&(ee=m.depthNear),m.depthFar>0&&(be=m.depthFar)),z.near=P.near=C.near=ee,z.far=P.far=C.far=be,(I!==z.near||B!==z.far)&&(s.updateRenderState({depthNear:z.near,depthFar:z.far}),I=z.near,B=z.far),z.layers.mask=Z.layers.mask|6,C.layers.mask=z.layers.mask&-5,P.layers.mask=z.layers.mask&-3;let Be=Z.parent,N=z.cameras;Ce(z,Be);for(let H=0;H<N.length;H++)Ce(N[H],Be);N.length===2?ie(z,C,P):z.projectionMatrix.copy(C.projectionMatrix),T===null&&Z.isPerspectiveCamera&&(T={camera:Z,fov:Z.fov,zoom:Z.zoom}),xe(Z,z,Be)};function xe(Z,ee,be){be===null?Z.matrix.copy(ee.matrixWorld):(Z.matrix.copy(be.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(ee.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(ee.projectionMatrix),Z.projectionMatrixInverse.copy(ee.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=Ds*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(h===null&&p===null))return l},this.setFoveation=function(Z){l=Z,h!==null&&(h.fixedFoveation=Z),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(z)},this.getCameraTexture=function(Z){return f[Z]};let st=null;function qe(Z,ee){if(u=ee.getViewerPose(c||a),g=ee,u!==null){let be=u.views;p!==null&&(e.setRenderTargetFramebuffer(M,p.framebuffer),e.setRenderTarget(M));let Be=!1;be.length!==z.cameras.length&&(z.cameras.length=0,Be=!0);for(let oe=0;oe<be.length;oe++){let le=be[oe],Te=null;if(p!==null)Te=p.getViewport(le);else{let Ge=d.getViewSubImage(h,le);Te=Ge.viewport,oe===0&&(e.setRenderTargetTextures(M,Ge.colorTexture,Ge.depthStencilTexture),e.setRenderTarget(M))}let Re=L[oe];Re===void 0&&(Re=new $t,Re.layers.enable(oe),Re.viewport=new yt,L[oe]=Re),Re.matrix.fromArray(le.transform.matrix),Re.matrix.decompose(Re.position,Re.quaternion,Re.scale),Re.projectionMatrix.fromArray(le.projectionMatrix),Re.projectionMatrixInverse.copy(Re.projectionMatrix).invert(),Re.viewport.set(Te.x,Te.y,Te.width,Te.height),oe===0&&(z.matrix.copy(Re.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),Be===!0&&z.cameras.push(Re)}let N=s.enabledFeatures;if(N&&N.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){d=n.getBinding();let oe=d.getDepthInformation(be[0]);oe&&oe.isValid&&oe.texture&&m.init(oe,s.renderState)}if(N&&N.includes("camera-access")&&y){e.state.unbindTexture(),d=n.getBinding();for(let oe=0;oe<be.length;oe++){let le=be[oe].camera;if(le){let Te=f[le];Te||(Te=new Dr,f[le]=Te);let Re=d.getCameraImage(le);Te.sourceTexture=Re}}}}for(let be=0;be<E.length;be++){let Be=x[be],N=E[be];Be!==null&&N!==void 0&&N.update(Be,ee,c||a)}st&&st(Z,ee),ee.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ee}),g=null}let Ze=new of;Ze.setAnimationLoop(qe),this.setAnimationLoop=function(Z){st=Z},this.dispose=function(){}}},Jv=new ht,ff=new $e;ff.set(-1,0,0,0,1,0,0,0,1);e_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Yn=null;Cl=class{constructor(e={}){let{canvas:t=Ld(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1,outputBufferType:p=fn}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=a;let y=p,m=new Set([qo,Wo,$o]),f=new Set([fn,Fn,Ws,qs,Ho,Vo]),S=new Uint32Array(4),w=new Int32Array(4),M=new O,E=null,x=null,R=[],_=[],T=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Un,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,P=!1,L=null,z=null,I=null,B=null;this._outputColorSpace=Lt;let W=0,X=0,re=null,q=-1,te=null,ie=new yt,Ce=new yt,xe=null,st=new Le(0),qe=0,Ze=t.width,Z=t.height,ee=1,be=null,Be=null,N=new yt(0,0,Ze,Z),H=new yt(0,0,Ze,Z),se=!1,oe=new Bs,le=!1,Te=!1,Re=new ht,Ge=new O,lt=new yt,Ht={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},St=!1;function At(){return re===null?ee:1}let F=n;function Xt(b,D){return t.getContext(b,D)}let ct,A,v,k,$,J,ce,ue,K,ne,he,De,me,de,Ne,ze,We,U,fe,Q,pe,ye,ae;try{let b={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",pt,!1),t.addEventListener("webglcontextrestored",rt,!1),t.addEventListener("webglcontextcreationerror",Rn,!1),F===null){let D="webgl2";if(F=Xt(D,b),F===null)throw Xt(D)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ue()}catch(b){throw t.removeEventListener("webglcontextlost",pt,!1),t.removeEventListener("webglcontextrestored",rt,!1),t.removeEventListener("webglcontextcreationerror",Rn,!1),He("WebGLRenderer: "+b.message),b}function Ue(){ct=new lx(F),ct.init(),pe=new Xv(F,ct),A=new K0(F,ct,e,pe),v=new qv(F,ct),A.reversedDepthBuffer&&h&&v.buffers.depth.setReversed(!0),z=F.createFramebuffer(),I=F.createFramebuffer(),B=F.createFramebuffer(),k=new hx(F),$=new Lv,J=new jv(F,ct,v,$,A,pe,k),ce=new ox(C),ue=new fm(F),ye=new Z0(F,ue),K=new cx(F,ue,k,ye),ne=new fx(F,K,ue,ye,k),U=new dx(F,A,J),Ne=new Q0($),he=new Iv(C,ce,ct,A,ye,Ne),De=new Kv(C,$),me=new Nv,de=new kv(ct),We=new Y0(C,ce,v,ne,g,l),ze=new Wv(C,ne,A),ae=new Qv(F,k,A,v),fe=new J0(F,ct,k),Q=new ux(F,ct,k),k.programs=he.programs,C.capabilities=A,C.extensions=ct,C.properties=$,C.renderLists=me,C.shadowMap=ze,C.state=v,C.info=k}y!==fn&&(T=new mx(y,t.width,t.height,o,s,r));let Pe=new Mu(C,F);this.xr=Pe,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let b=ct.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=ct.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return ee},this.setPixelRatio=function(b){b!==void 0&&(ee=b,this.setSize(Ze,Z,!1))},this.getSize=function(b){return b.set(Ze,Z)},this.setSize=function(b,D,j=!0){if(Pe.isPresenting){ke("WebGLRenderer: Can't change size while VR device is presenting.");return}Ze=b,Z=D,t.width=Math.floor(b*ee),t.height=Math.floor(D*ee),j===!0&&(t.style.width=b+"px",t.style.height=D+"px"),T!==null&&T.setSize(t.width,t.height),this.setViewport(0,0,b,D)},this.getDrawingBufferSize=function(b){return b.set(Ze*ee,Z*ee).floor()},this.setDrawingBufferSize=function(b,D,j){Ze=b,Z=D,ee=j,t.width=Math.floor(b*j),t.height=Math.floor(D*j),this.setViewport(0,0,b,D)},this.setEffects=function(b){if(y===fn){He("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let D=0;D<b.length;D++)if(b[D].isOutputPass===!0){ke("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(ie)},this.getViewport=function(b){return b.copy(N)},this.setViewport=function(b,D,j,V){b.isVector4?N.set(b.x,b.y,b.z,b.w):N.set(b,D,j,V),v.viewport(ie.copy(N).multiplyScalar(ee).round())},this.getScissor=function(b){return b.copy(H)},this.setScissor=function(b,D,j,V){b.isVector4?H.set(b.x,b.y,b.z,b.w):H.set(b,D,j,V),v.scissor(Ce.copy(H).multiplyScalar(ee).round())},this.getScissorTest=function(){return se},this.setScissorTest=function(b){v.setScissorTest(se=b)},this.setOpaqueSort=function(b){be=b},this.setTransparentSort=function(b){Be=b},this.getClearColor=function(b){return b.copy(We.getClearColor())},this.setClearColor=function(){We.setClearColor(...arguments)},this.getClearAlpha=function(){return We.getClearAlpha()},this.setClearAlpha=function(){We.setClearAlpha(...arguments)},this.clear=function(b=!0,D=!0,j=!0){let V=0;if(b){let G=!1;if(re!==null){let _e=re.texture.format;G=m.has(_e)}if(G){let _e=re.texture.type,Ee=f.has(_e),ve=We.getClearColor(),we=We.getClearAlpha(),Ie=ve.r,je=ve.g,Qe=ve.b;Ee?(S[0]=Ie,S[1]=je,S[2]=Qe,S[3]=we,F.clearBufferuiv(F.COLOR,0,S)):(w[0]=Ie,w[1]=je,w[2]=Qe,w[3]=we,F.clearBufferiv(F.COLOR,0,w))}else V|=F.COLOR_BUFFER_BIT}D&&(V|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),j&&(V|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&F.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),L=b},this.dispose=function(){t.removeEventListener("webglcontextlost",pt,!1),t.removeEventListener("webglcontextrestored",rt,!1),t.removeEventListener("webglcontextcreationerror",Rn,!1),We.dispose(),me.dispose(),de.dispose(),$.dispose(),ce.dispose(),ne.dispose(),ye.dispose(),ae.dispose(),he.dispose(),Pe.dispose(),Pe.removeEventListener("sessionstart",Iu),Pe.removeEventListener("sessionend",Lu),Oi.stop()};function pt(b){b.preventDefault(),Zc("WebGLRenderer: Context Lost."),P=!0}function rt(){Zc("WebGLRenderer: Context Restored."),P=!1;let b=k.autoReset,D=ze.enabled,j=ze.autoUpdate,V=ze.needsUpdate,G=ze.type;Ue(),k.autoReset=b,ze.enabled=D,ze.autoUpdate=j,ze.needsUpdate=V,ze.type=G}function Rn(b){He("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function On(b){let D=b.target;D.removeEventListener("dispose",On),kf(D)}function kf(b){Hf(b),$.remove(b)}function Hf(b){let D=$.get(b).programs;D!==void 0&&(D.forEach(function(j){he.releaseProgram(j)}),b.isShaderMaterial&&he.releaseShaderCache(b))}this.renderBufferDirect=function(b,D,j,V,G,_e){D===null&&(D=Ht);let Ee=G.isMesh&&G.matrixWorld.determinantAffine()<0,ve=$f(b,D,j,V,G);v.setMaterial(V,Ee);let we=j.index,Ie=1;if(V.wireframe===!0){if(we=K.getWireframeAttribute(j),we===void 0)return;Ie=2}let je=j.drawRange,Qe=j.attributes.position,Ae=je.start*Ie,at=(je.start+je.count)*Ie;_e!==null&&(Ae=Math.max(Ae,_e.start*Ie),at=Math.min(at,(_e.start+_e.count)*Ie)),we!==null?(Ae=Math.max(Ae,0),at=Math.min(at,we.count)):Qe!=null&&(Ae=Math.max(Ae,0),at=Math.min(at,Qe.count));let Rt=at-Ae;if(Rt<0||Rt===1/0)return;ye.setup(G,V,ve,j,we);let xt,dt=fe;if(we!==null&&(xt=ue.get(we),dt=Q,dt.setIndex(xt)),G.isMesh)V.wireframe===!0?(v.setLineWidth(V.wireframeLinewidth*At()),dt.setMode(F.LINES)):dt.setMode(F.TRIANGLES);else if(G.isLine){let Yt=V.linewidth;Yt===void 0&&(Yt=1),v.setLineWidth(Yt*At()),G.isLineSegments?dt.setMode(F.LINES):G.isLineLoop?dt.setMode(F.LINE_LOOP):dt.setMode(F.LINE_STRIP)}else G.isPoints?dt.setMode(F.POINTS):G.isSprite&&dt.setMode(F.TRIANGLES);if(G.isBatchedMesh)if(ct.get("WEBGL_multi_draw"))dt.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{let Yt=G._multiDrawStarts,Se=G._multiDrawCounts,rn=G._multiDrawCount,tt=we?ue.get(we).bytesPerElement:1,yn=$.get(V).currentProgram.getUniforms();for(let Bn=0;Bn<rn;Bn++)yn.setValue(F,"_gl_DrawID",Bn),dt.render(Yt[Bn]/tt,Se[Bn])}else if(G.isInstancedMesh)dt.renderInstances(Ae,Rt,G.count);else if(j.isInstancedBufferGeometry){let Yt=j._maxInstanceCount!==void 0?j._maxInstanceCount:1/0,Se=Math.min(j.instanceCount,Yt);dt.renderInstances(Ae,Rt,Se)}else dt.render(Ae,Rt)};function Pu(b,D,j,V){L!==null&&b.isNodeMaterial&&L.setObject(V,b),le===!0&&Ne.setState(b,j,!1),b.transparent===!0&&b.side===kt&&b.forceSinglePass===!1?(b.side=qt,b.needsUpdate=!0,ha(b,D,V),b.side=Ii,b.needsUpdate=!0,ha(b,D,V),b.side=kt):ha(b,D,V)}this.compile=function(b,D,j=null){j===null&&(j=b),L!==null&&L.renderStart(b,D,j),x=de.get(j),x.init(D),_.push(x),j.traverseVisible(function(G){G.isLight&&G.layers.test(D.layers)&&(x.pushLight(G),G.castShadow&&x.pushShadow(G))}),b!==j&&b.traverseVisible(function(G){G.isLight&&G.layers.test(D.layers)&&(x.pushLight(G),G.castShadow&&x.pushShadow(G))}),x.setupLights(),L!==null&&L.updateLights(x.state.lightsArray),Te=this.localClippingEnabled,le=Ne.init(this.clippingPlanes,Te),le===!0&&Ne.setGlobalState(this.clippingPlanes,D),L!==null&&ze.render(x.state.shadowsArray,j,D);let V=new Set;return b.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;let _e=G.material;if(_e)if(Array.isArray(_e))for(let Ee=0;Ee<_e.length;Ee++){let ve=_e[Ee];Pu(ve,j,D,G),V.add(ve)}else Pu(_e,j,D,G),V.add(_e)}),x=_.pop(),L!==null&&L.renderEnd(),V},this.compileAsync=function(b,D,j=null){let V=this.compile(b,D,j);return new Promise(G=>{function _e(){if(V.forEach(function(Ee){let we=$.get(Ee).currentProgram;(we===void 0||we.isReady())&&V.delete(Ee)}),V.size===0){G(b);return}setTimeout(_e,10)}ct.get("KHR_parallel_shader_compile")!==null?_e():setTimeout(_e,10)})};let kl=null;function Vf(b){kl&&kl(b)}function Iu(){Oi.stop()}function Lu(){Oi.start()}let Oi=new of;Oi.setAnimationLoop(Vf),typeof self<"u"&&Oi.setContext(self),this.setAnimationLoop=function(b){kl=b,Pe.setAnimationLoop(b),b===null?Oi.stop():Oi.start()},Pe.addEventListener("sessionstart",Iu),Pe.addEventListener("sessionend",Lu),this.render=function(b,D){if(D!==void 0&&D.isCamera!==!0){He("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;L!==null&&L.renderStart(b,D);let j=Pe.enabled===!0&&Pe.isPresenting===!0,V=T!==null&&(re===null||j)&&T.begin(C,re);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),Pe.enabled===!0&&Pe.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(Pe.cameraAutoUpdate===!0&&Pe.updateCamera(D),D=Pe.getCamera()),b.isScene===!0&&b.onBeforeRender(C,b,D,re),x=de.get(b,_.length),x.init(D),x.state.textureUnits=J.getTextureUnits(),_.push(x),Re.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),oe.setFromProjectionMatrix(Re,Nn,D.reversedDepth),Te=this.localClippingEnabled,le=Ne.init(this.clippingPlanes,Te),E=me.get(b,R.length),E.init(),R.push(E),Pe.enabled===!0&&Pe.isPresenting===!0){let Ee=C.xr.getDepthSensingMesh();Ee!==null&&Hl(Ee,D,-1/0,C.sortObjects)}Hl(b,D,0,C.sortObjects),E.finish(),L!==null&&L.updateLights(x.state.lightsArray),C.sortObjects===!0&&E.sort(be,Be),St=Pe.enabled===!1||Pe.isPresenting===!1||Pe.hasDepthSensing()===!1,St&&We.addToRenderList(E,b),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),le===!0&&Ne.beginShadows();let G=x.state.shadowsArray;if(ze.render(G,b,D),le===!0&&Ne.endShadows(),(V&&T.hasRenderPass())===!1){let Ee=E.opaque,ve=E.transmissive;if(x.setupLights(),D.isArrayCamera){let we=D.cameras;if(ve.length>0)for(let Ie=0,je=we.length;Ie<je;Ie++){let Qe=we[Ie];Nu(Ee,ve,b,Qe)}St&&We.render(b);for(let Ie=0,je=we.length;Ie<je;Ie++){let Qe=we[Ie];Du(E,b,Qe,Qe.viewport)}}else ve.length>0&&Nu(Ee,ve,b,D),St&&We.render(b),Du(E,b,D)}re!==null&&X===0&&(J.updateMultisampleRenderTarget(re),J.updateRenderTargetMipmap(re)),V&&T.end(C),b.isScene===!0&&b.onAfterRender(C,b,D),ye.resetDefaultState(),q=-1,te=null,_.pop(),_.length>0?(x=_[_.length-1],J.setTextureUnits(x.state.textureUnits),le===!0&&Ne.setGlobalState(C.clippingPlanes,x.state.camera)):x=null,R.pop(),R.length>0?E=R[R.length-1]:E=null,L!==null&&L.renderEnd()};function Hl(b,D,j,V){if(b.visible===!1)return;if(b.layers.test(D.layers)){if(b.isGroup)j=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(D);else if(b.isLightProbeGrid)x.pushLightProbeGrid(b);else if(b.isLight)x.pushLight(b),b.castShadow&&x.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||b.intersectsFrustum(oe)){V&&lt.setFromMatrixPosition(b.matrixWorld).applyMatrix4(Re);let Ee=ne.update(b),ve=b.material;ve.visible&&E.push(b,Ee,ve,j,lt.z,null,D)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||b.intersectsFrustum(oe))){let Ee=ne.update(b),ve=b.material;if(V&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),lt.copy(b.boundingSphere.center)):(Ee.boundingSphere===null&&Ee.computeBoundingSphere(),lt.copy(Ee.boundingSphere.center)),lt.applyMatrix4(b.matrixWorld).applyMatrix4(Re)),Array.isArray(ve)){let we=Ee.groups;for(let Ie=0,je=we.length;Ie<je;Ie++){let Qe=we[Ie],Ae=ve[Qe.materialIndex];Ae&&Ae.visible&&E.push(b,Ee,Ae,j,lt.z,Qe,D)}}else ve.visible&&E.push(b,Ee,ve,j,lt.z,null,D)}}let _e=b.children;for(let Ee=0,ve=_e.length;Ee<ve;Ee++)Hl(_e[Ee],D,j,V)}function Du(b,D,j,V){let{opaque:G,transmissive:_e,transparent:Ee}=b;x.setupLightsView(j),le===!0&&Ne.setGlobalState(C.clippingPlanes,j),V&&v.viewport(ie.copy(V)),G.length>0&&ua(G,D,j),_e.length>0&&ua(_e,D,j),Ee.length>0&&ua(Ee,D,j),v.buffers.depth.setTest(!0),v.buffers.depth.setMask(!0),v.buffers.color.setMask(!0),v.setPolygonOffset(!1)}function Nu(b,D,j,V){if((j.isScene===!0?j.overrideMaterial:null)!==null)return;if(x.state.transmissionRenderTarget[V.id]===void 0){let Ae=ct.has("EXT_color_buffer_half_float")||ct.has("EXT_color_buffer_float");x.state.transmissionRenderTarget[V.id]=new Et(1,1,{generateMipmaps:!0,type:Ae?Nt:fn,minFilter:Di,samples:Math.max(4,A.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Ke.workingColorSpace})}let _e=x.state.transmissionRenderTarget[V.id],Ee=V.viewport||ie;_e.setSize(Ee.z*C.transmissionResolutionScale,Ee.w*C.transmissionResolutionScale);let ve=C.getRenderTarget(),we=C.getActiveCubeFace(),Ie=C.getActiveMipmapLevel();C.setRenderTarget(_e),C.getClearColor(st),qe=C.getClearAlpha(),qe<1&&C.setClearColor(16777215,.5),C.clear(),St&&We.render(j);let je=C.toneMapping;C.toneMapping=Un;let Qe=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),x.setupLightsView(V),le===!0&&Ne.setGlobalState(C.clippingPlanes,V),ua(b,j,V),J.updateMultisampleRenderTarget(_e),J.updateRenderTargetMipmap(_e),ct.has("WEBGL_multisampled_render_to_texture")===!1){let Ae=!1;for(let at=0,Rt=D.length;at<Rt;at++){let xt=D[at],{object:dt,geometry:Yt,material:Se,group:rn}=xt;if(Se.side===kt&&dt.layers.test(V.layers)){let tt=Se.side;Se.side=qt,Se.needsUpdate=!0,Uu(dt,j,V,Yt,Se,rn),Se.side=tt,Se.needsUpdate=!0,Ae=!0}}Ae===!0&&(J.updateMultisampleRenderTarget(_e),J.updateRenderTargetMipmap(_e))}C.setRenderTarget(ve,we,Ie),C.setClearColor(st,qe),Qe!==void 0&&(V.viewport=Qe),C.toneMapping=je}function ua(b,D,j){let V=D.isScene===!0?D.overrideMaterial:null;for(let G=0,_e=b.length;G<_e;G++){let Ee=b[G],{object:ve,geometry:we,group:Ie}=Ee,je=Ee.material;je.allowOverride===!0&&V!==null&&(je=V),ve.layers.test(j.layers)&&Uu(ve,D,j,we,je,Ie)}}function Uu(b,D,j,V,G,_e){L!==null&&G.isNodeMaterial&&L.setObject(b,G),b.onBeforeRender(C,D,j,V,G,_e),b.modelViewMatrix.multiplyMatrices(j.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),G.onBeforeRender(C,D,j,V,b,_e),G.transparent===!0&&G.side===kt&&G.forceSinglePass===!1?(G.side=qt,G.needsUpdate=!0,C.renderBufferDirect(j,D,V,G,b,_e),G.side=Ii,G.needsUpdate=!0,C.renderBufferDirect(j,D,V,G,b,_e),G.side=kt):C.renderBufferDirect(j,D,V,G,b,_e),b.onAfterRender(C,D,j,V,G,_e)}function ha(b,D,j){D.isScene!==!0&&(D=Ht);let V=$.get(b),G=x.state.lights,_e=x.state.shadowsArray,Ee=G.state.version,ve=he.getParameters(b,G.state,_e,D,j,x.state.lightProbeGridArray),we=he.getProgramCacheKey(ve),Ie=V.programs;V.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?D.environment:null,V.fog=D.fog;let je=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;V.envMap=ce.get(b.envMap||V.environment,je),V.envMapRotation=V.environment!==null&&b.envMap===null?D.environmentRotation:b.envMapRotation,Ie===void 0&&(b.addEventListener("dispose",On),Ie=new Map,V.programs=Ie);let Qe=Ie.get(we);if(Qe!==void 0){if(V.currentProgram===Qe&&V.lightsStateVersion===Ee)return Ou(b,ve),Qe}else ve.uniforms=he.getUniforms(b),L!==null&&b.isNodeMaterial&&L.build(b,j,ve),b.onBeforeCompile(ve,C),Qe=he.acquireProgram(ve,we),Ie.set(we,Qe),V.uniforms=ve.uniforms;let Ae=V.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Ae.clippingPlanes=Ne.uniform),Ou(b,ve),V.needsLights=qf(b),V.lightsStateVersion=Ee,V.needsLights&&(Ae.ambientLightColor.value=G.state.ambient,Ae.lightProbe.value=G.state.probe,Ae.sunLights.value=G.state.sun,Ae.sunLightShadows.value=G.state.sunShadow,Ae.directionalLights.value=G.state.directional,Ae.directionalLightShadows.value=G.state.directionalShadow,Ae.spotLights.value=G.state.spot,Ae.spotLightShadows.value=G.state.spotShadow,Ae.rectAreaLights.value=G.state.rectArea,Ae.ltc_1.value=G.state.rectAreaLTC1,Ae.ltc_2.value=G.state.rectAreaLTC2,Ae.pointLights.value=G.state.point,Ae.pointLightShadows.value=G.state.pointShadow,Ae.hemisphereLights.value=G.state.hemi,Ae.sunShadowMatrix.value=G.state.sunShadowMatrix,Ae.sunShadowCascade.value=G.state.sunShadowCascade,Ae.directionalShadowMatrix.value=G.state.directionalShadowMatrix,Ae.spotLightMatrix.value=G.state.spotLightMatrix,Ae.spotLightMap.value=G.state.spotLightMap,Ae.pointShadowMatrix.value=G.state.pointShadowMatrix),V.lightProbeGrid=x.state.lightProbeGridArray.length>0,V.currentProgram=Qe,V.uniformsList=null,Qe}function Fu(b){if(b.uniformsList===null){let D=b.currentProgram.getUniforms();b.uniformsList=Zs.seqWithValue(D.seq,b.uniforms)}return b.uniformsList}function Ou(b,D){let j=$.get(b);j.outputColorSpace=D.outputColorSpace,j.batching=D.batching,j.batchingColor=D.batchingColor,j.instancing=D.instancing,j.instancingColor=D.instancingColor,j.instancingMorph=D.instancingMorph,j.skinning=D.skinning,j.morphTargets=D.morphTargets,j.morphNormals=D.morphNormals,j.morphColors=D.morphColors,j.morphTargetsCount=D.morphTargetsCount,j.numClippingPlanes=D.numClippingPlanes,j.numIntersection=D.numClipIntersection,j.vertexAlphas=D.vertexAlphas,j.vertexTangents=D.vertexTangents,j.toneMapping=D.toneMapping}function Gf(b,D){if(b.length===0)return null;if(b.length===1)return b[0].texture!==null?b[0]:null;M.setFromMatrixPosition(D.matrixWorld);for(let j=0,V=b.length;j<V;j++){let G=b[j];if(G.texture!==null&&G.boundingBox.containsPoint(M))return G}return null}function $f(b,D,j,V,G){D.isScene!==!0&&(D=Ht),J.resetTextureUnits();let _e=D.fog,Ee=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?D.environment:null,ve=re===null?C.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:Ke.workingColorSpace,we=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,Ie=ce.get(V.envMap||Ee,we),je=V.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,Qe=!!j.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),Ae=!!j.morphAttributes.position,at=!!j.morphAttributes.normal,Rt=!!j.morphAttributes.color,xt=Un;V.toneMapped&&(re===null||re.isXRRenderTarget===!0)&&(xt=C.toneMapping);let dt=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,Yt=dt!==void 0?dt.length:0,Se=$.get(V),rn=x.state.lights;if(le===!0&&(Te===!0||b!==te)){let mt=b===te&&V.id===q;Ne.setState(V,b,mt)}let tt=!1;V.version===Se.__version?(Se.needsLights&&Se.lightsStateVersion!==rn.state.version||Se.outputColorSpace!==ve||G.isBatchedMesh&&Se.batching===!1||!G.isBatchedMesh&&Se.batching===!0||G.isBatchedMesh&&Se.batchingColor===!0&&G._colorsTexture===null||G.isBatchedMesh&&Se.batchingColor===!1&&G._colorsTexture!==null||G.isInstancedMesh&&Se.instancing===!1||!G.isInstancedMesh&&Se.instancing===!0||G.isSkinnedMesh&&Se.skinning===!1||!G.isSkinnedMesh&&Se.skinning===!0||G.isInstancedMesh&&Se.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&Se.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&Se.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&Se.instancingMorph===!1&&G.morphTexture!==null||Se.envMap!==Ie||V.fog===!0&&Se.fog!==_e||Se.numClippingPlanes!==void 0&&(Se.numClippingPlanes!==Ne.numPlanes||Se.numIntersection!==Ne.numIntersection)||Se.vertexAlphas!==je||Se.vertexTangents!==Qe||Se.morphTargets!==Ae||Se.morphNormals!==at||Se.morphColors!==Rt||Se.toneMapping!==xt||Se.morphTargetsCount!==Yt||!!Se.lightProbeGrid!=x.state.lightProbeGridArray.length>0)&&(tt=!0):(tt=!0,Se.__version=V.version);let yn=Se.currentProgram;tt===!0&&(yn=ha(V,D,G),L&&V.isNodeMaterial&&L.onUpdateProgram(V,yn,Se));let Bn=!1,ui=!1,is=!1,ut=yn.getUniforms(),wt=Se.uniforms;if(v.useProgram(yn.program)&&(Bn=!0,ui=!0,is=!0),V.id!==q&&(q=V.id,ui=!0),Se.needsLights){let mt=Gf(x.state.lightProbeGridArray,G);Se.lightProbeGrid!==mt&&(Se.lightProbeGrid=mt,ui=!0)}if(Bn||te!==b){v.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),ut.setValue(F,"projectionMatrix",b.projectionMatrix),ut.setValue(F,"viewMatrix",b.matrixWorldInverse);let di=ut.map.cameraPosition;di!==void 0&&di.setValue(F,Ge.setFromMatrixPosition(b.matrixWorld)),A.logarithmicDepthBuffer&&ut.setValue(F,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&ut.setValue(F,"isOrthographic",b.isOrthographicCamera===!0),te!==b&&(te=b,ui=!0,is=!0)}if(Se.needsLights&&(rn.state.sunShadowMap.length>0&&ut.setValue(F,"sunShadowMap",rn.state.sunShadowMap,J),rn.state.directionalShadowMap.length>0&&ut.setValue(F,"directionalShadowMap",rn.state.directionalShadowMap,J),rn.state.spotShadowMap.length>0&&ut.setValue(F,"spotShadowMap",rn.state.spotShadowMap,J),rn.state.pointShadowMap.length>0&&ut.setValue(F,"pointShadowMap",rn.state.pointShadowMap,J)),G.isSkinnedMesh){ut.setOptional(F,G,"bindMatrix"),ut.setOptional(F,G,"bindMatrixInverse");let mt=G.skeleton;mt&&(mt.boneTexture===null&&mt.computeBoneTexture(),ut.setValue(F,"boneTexture",mt.boneTexture,J))}G.isBatchedMesh&&(ut.setOptional(F,G,"batchingTexture"),ut.setValue(F,"batchingTexture",G._matricesTexture,J),ut.setOptional(F,G,"batchingIdTexture"),ut.setValue(F,"batchingIdTexture",G._indirectTexture,J),ut.setOptional(F,G,"batchingColorTexture"),G._colorsTexture!==null&&ut.setValue(F,"batchingColorTexture",G._colorsTexture,J));let hi=j.morphAttributes;if((hi.position!==void 0||hi.normal!==void 0||hi.color!==void 0)&&U.update(G,j,yn),(ui||Se.receiveShadow!==G.receiveShadow)&&(Se.receiveShadow=G.receiveShadow,ut.setValue(F,"receiveShadow",G.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&D.environment!==null&&(wt.envMapIntensity.value=D.environmentIntensity),wt.dfgLUT!==void 0&&(wt.dfgLUT.value=t_()),ui){if(ut.setValue(F,"toneMappingExposure",C.toneMappingExposure),Se.needsLights&&Wf(wt,is),_e&&V.fog===!0&&De.refreshFogUniforms(wt,_e),De.refreshMaterialUniforms(wt,V,ee,Z,x.state.transmissionRenderTarget[b.id]),Se.needsLights&&Se.lightProbeGrid){let mt=Se.lightProbeGrid;wt.probesSH.value=mt.texture,wt.probesMin.value.copy(mt.boundingBox.min),wt.probesMax.value.copy(mt.boundingBox.max),wt.probesResolution.value.copy(mt.resolution)}Zs.upload(F,Fu(Se),wt,J)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(Zs.upload(F,Fu(Se),wt,J),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&ut.setValue(F,"center",G.center),ut.setValue(F,"modelViewMatrix",G.modelViewMatrix),ut.setValue(F,"normalMatrix",G.normalMatrix),ut.setValue(F,"modelMatrix",G.matrixWorld),V.uniformsGroups!==void 0){let mt=V.uniformsGroups;for(let di=0,ss=mt.length;di<ss;di++){let zu=mt[di];ae.update(zu,yn),ae.bind(zu,yn)}}return yn}function Wf(b,D){b.ambientLightColor.needsUpdate=D,b.lightProbe.needsUpdate=D,b.sunLights.needsUpdate=D,b.sunLightShadows.needsUpdate=D,b.directionalLights.needsUpdate=D,b.directionalLightShadows.needsUpdate=D,b.pointLights.needsUpdate=D,b.pointLightShadows.needsUpdate=D,b.spotLights.needsUpdate=D,b.spotLightShadows.needsUpdate=D,b.rectAreaLights.needsUpdate=D,b.hemisphereLights.needsUpdate=D}function qf(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return W},this.getActiveMipmapLevel=function(){return X},this.getRenderTarget=function(){return re},this.setRenderTargetTextures=function(b,D,j){let V=$.get(b);V.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),$.get(b.texture).__webglTexture=D,$.get(b.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:j,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,D){let j=$.get(b);j.__webglFramebuffer=D,j.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(b,D=0,j=0){re=b,W=D,X=j;let V=null,G=!1,_e=!1;if(b){let ve=$.get(b);if(ve.__useDefaultFramebuffer!==void 0){v.bindFramebuffer(F.FRAMEBUFFER,ve.__webglFramebuffer),ie.copy(b.viewport),Ce.copy(b.scissor),xe=b.scissorTest,v.viewport(ie),v.scissor(Ce),v.setScissorTest(xe),q=-1;return}else if(ve.__webglFramebuffer===void 0)J.setupRenderTarget(b);else if(ve.__hasExternalTextures)J.rebindTextures(b,$.get(b.texture).__webglTexture,$.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let je=b.depthTexture;if(ve.__boundDepthTexture!==je){if(je!==null&&$.has(je)&&(b.width!==je.image.width||b.height!==je.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");J.setupDepthRenderbuffer(b)}}let we=b.texture;(we.isData3DTexture||we.isDataArrayTexture||we.isCompressedArrayTexture)&&(_e=!0);let Ie=$.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Ie[D])?V=Ie[D][j]:V=Ie[D],G=!0):b.samples>0&&J.useMultisampledRTT(b)===!1?V=$.get(b).__webglMultisampledFramebuffer:Array.isArray(Ie)?V=Ie[j]:V=Ie,ie.copy(b.viewport),Ce.copy(b.scissor),xe=b.scissorTest}else ie.copy(N).multiplyScalar(ee).floor(),Ce.copy(H).multiplyScalar(ee).floor(),xe=se;if(j!==0&&(V=z),v.bindFramebuffer(F.FRAMEBUFFER,V)&&v.drawBuffers(b,V),v.viewport(ie),v.scissor(Ce),v.setScissorTest(xe),G){let ve=$.get(b.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+D,ve.__webglTexture,j)}else if(_e){let ve=D;for(let we=0;we<b.textures.length;we++){let Ie=$.get(b.textures[we]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+we,Ie.__webglTexture,j,ve)}}else if(b!==null&&j!==0){let ve=$.get(b.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,ve.__webglTexture,j)}q=-1};function Bu(b){let D=$.get(b);return(D.__readFormat!==b.format||D.__readType!==b.type)&&(D.__readFormat=b.format,D.__readType=b.type,D.__formatReadable=A.textureFormatReadable(b.format),D.__typeReadable=A.textureTypeReadable(b.type)),D}this.readRenderTargetPixels=function(b,D,j,V,G,_e,Ee,ve=0){if(!(b&&b.isWebGLRenderTarget)){He("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let we=$.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ee!==void 0&&(we=we[Ee]),we){v.bindFramebuffer(F.FRAMEBUFFER,we);try{let Ie=b.textures[ve],je=Ie.format,Qe=Ie.type;b.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+ve);let Ae=Bu(Ie);if(Ae.__formatReadable===!1){He("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ae.__typeReadable===!1){He("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=b.width-V&&j>=0&&j<=b.height-G&&F.readPixels(D,j,V,G,pe.convert(je),pe.convert(Qe),_e)}finally{let Ie=re!==null?$.get(re).__webglFramebuffer:null;v.bindFramebuffer(F.FRAMEBUFFER,Ie)}}},this.readRenderTargetPixelsAsync=async function(b,D,j,V,G,_e,Ee,ve=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let we=$.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Ee!==void 0&&(we=we[Ee]),we)if(D>=0&&D<=b.width-V&&j>=0&&j<=b.height-G){v.bindFramebuffer(F.FRAMEBUFFER,we);let Ie=b.textures[ve],je=Ie.format,Qe=Ie.type;b.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+ve);let Ae=Bu(Ie);if(Ae.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ae.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let at=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,at),F.bufferData(F.PIXEL_PACK_BUFFER,_e.byteLength,F.STREAM_READ),F.readPixels(D,j,V,G,pe.convert(je),pe.convert(Qe),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);let Rt=re!==null?$.get(re).__webglFramebuffer:null;v.bindFramebuffer(F.FRAMEBUFFER,Rt);let xt=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await Nd(F,xt,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,at),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,_e),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(at),F.deleteSync(xt),_e}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,D=null,j=0){let V=Math.pow(2,-j),G=Math.floor(b.image.width*V),_e=Math.floor(b.image.height*V),Ee=D!==null?D.x:0,ve=D!==null?D.y:0;J.setTexture2D(b,0),F.copyTexSubImage2D(F.TEXTURE_2D,j,0,0,Ee,ve,G,_e),v.unbindTexture()},this.copyTextureToTexture=function(b,D,j=null,V=null,G=0,_e=0){let Ee,ve,we,Ie,je,Qe,Ae,at,Rt,xt=b.isCompressedTexture?b.mipmaps[_e]:b.image;if(j!==null)Ee=j.max.x-j.min.x,ve=j.max.y-j.min.y,we=j.isBox3?j.max.z-j.min.z:1,Ie=j.min.x,je=j.min.y,Qe=j.isBox3?j.min.z:0;else{let wt=Math.pow(2,-G);Ee=Math.floor(xt.width*wt),ve=Math.floor(xt.height*wt),b.isDataArrayTexture?we=xt.depth:b.isData3DTexture?we=Math.floor(xt.depth*wt):we=1,Ie=0,je=0,Qe=0}V!==null?(Ae=V.x,at=V.y,Rt=V.z):(Ae=0,at=0,Rt=0);let dt=pe.convert(D.format),Yt=pe.convert(D.type),Se;D.isData3DTexture?(J.setTexture3D(D,0),Se=F.TEXTURE_3D):D.isDataArrayTexture||D.isCompressedArrayTexture?(J.setTexture2DArray(D,0),Se=F.TEXTURE_2D_ARRAY):(J.setTexture2D(D,0),Se=F.TEXTURE_2D),v.activeTexture(F.TEXTURE0),v.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,D.flipY),v.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),v.pixelStorei(F.UNPACK_ALIGNMENT,D.unpackAlignment);let rn=v.getParameter(F.UNPACK_ROW_LENGTH),tt=v.getParameter(F.UNPACK_IMAGE_HEIGHT),yn=v.getParameter(F.UNPACK_SKIP_PIXELS),Bn=v.getParameter(F.UNPACK_SKIP_ROWS),ui=v.getParameter(F.UNPACK_SKIP_IMAGES);v.pixelStorei(F.UNPACK_ROW_LENGTH,xt.width),v.pixelStorei(F.UNPACK_IMAGE_HEIGHT,xt.height),v.pixelStorei(F.UNPACK_SKIP_PIXELS,Ie),v.pixelStorei(F.UNPACK_SKIP_ROWS,je),v.pixelStorei(F.UNPACK_SKIP_IMAGES,Qe);let is=b.isDataArrayTexture||b.isData3DTexture,ut=D.isDataArrayTexture||D.isData3DTexture;if(b.isDepthTexture){let wt=$.get(b),hi=$.get(D),mt=$.get(wt.__renderTarget),di=$.get(hi.__renderTarget);v.bindFramebuffer(F.READ_FRAMEBUFFER,mt.__webglFramebuffer),v.bindFramebuffer(F.DRAW_FRAMEBUFFER,di.__webglFramebuffer);for(let ss=0;ss<we;ss++)is&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,$.get(b).__webglTexture,G,Qe+ss),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,$.get(D).__webglTexture,_e,Rt+ss)),F.blitFramebuffer(Ie,je,Ee,ve,Ae,at,Ee,ve,F.DEPTH_BUFFER_BIT,F.NEAREST);v.bindFramebuffer(F.READ_FRAMEBUFFER,null),v.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(G!==0||b.isRenderTargetTexture||$.has(b)){let wt=$.get(b),hi=$.get(D);v.bindFramebuffer(F.READ_FRAMEBUFFER,I),v.bindFramebuffer(F.DRAW_FRAMEBUFFER,B);for(let mt=0;mt<we;mt++)is?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,wt.__webglTexture,G,Qe+mt):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,wt.__webglTexture,G),ut?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,hi.__webglTexture,_e,Rt+mt):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,hi.__webglTexture,_e),G!==0?F.blitFramebuffer(Ie,je,Ee,ve,Ae,at,Ee,ve,F.COLOR_BUFFER_BIT,F.NEAREST):ut?F.copyTexSubImage3D(Se,_e,Ae,at,Rt+mt,Ie,je,Ee,ve):F.copyTexSubImage2D(Se,_e,Ae,at,Ie,je,Ee,ve);v.bindFramebuffer(F.READ_FRAMEBUFFER,null),v.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else ut?b.isDataTexture||b.isData3DTexture?F.texSubImage3D(Se,_e,Ae,at,Rt,Ee,ve,we,dt,Yt,xt.data):D.isCompressedArrayTexture?F.compressedTexSubImage3D(Se,_e,Ae,at,Rt,Ee,ve,we,dt,xt.data):F.texSubImage3D(Se,_e,Ae,at,Rt,Ee,ve,we,dt,Yt,xt):b.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,_e,Ae,at,Ee,ve,dt,Yt,xt.data):b.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,_e,Ae,at,xt.width,xt.height,dt,xt.data):F.texSubImage2D(F.TEXTURE_2D,_e,Ae,at,Ee,ve,dt,Yt,xt);v.pixelStorei(F.UNPACK_ROW_LENGTH,rn),v.pixelStorei(F.UNPACK_IMAGE_HEIGHT,tt),v.pixelStorei(F.UNPACK_SKIP_PIXELS,yn),v.pixelStorei(F.UNPACK_SKIP_ROWS,Bn),v.pixelStorei(F.UNPACK_SKIP_IMAGES,ui),_e===0&&D.generateMipmaps&&F.generateMipmap(Se),v.unbindTexture()},this.initRenderTarget=function(b){$.get(b).__webglFramebuffer===void 0&&J.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?J.setTextureCube(b,0):b.isData3DTexture?J.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?J.setTexture2DArray(b,0):J.setTexture2D(b,0),v.unbindTexture()},this.resetState=function(){W=0,X=0,re=null,v.reset(),ye.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Nn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ke._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ke._getUnpackColorSpace()}}});var Qs,Su=Vt(()=>{Qs={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`}});var _n,n_,Eu,i_,Fi,er=Vt(()=>{wn();_n=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},n_=new Pi(-1,1,1,-1,0,1),Eu=class extends Dt{constructor(){super(),this.setAttribute("position",new gt([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new gt([0,2,0,0,2,0],2))}},i_=new Eu,Fi=class{constructor(e){this._mesh=new Me(i_,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,n_)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}});var Ll,mf=Vt(()=>{wn();er();Ll=class extends _n{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Mt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=ci.clone(e.uniforms),this.material=new Mt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new Fi(this.material)}render(e,t,n){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=n.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}});var aa,Dl,gf=Vt(()=>{er();aa=class extends _n{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,n){let s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(n),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},Dl=class extends _n{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}});var Nl,xf=Vt(()=>{wn();Su();mf();gf();Nl=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let n=e.getSize(new Oe);this._width=n.width,this._height=n.height,t=new Et(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:Nt}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Ll(Qs),this.copyPass.material.blending=Sn,this.timer=new kr}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),n=!1;for(let s=0,r=this.passes.length;s<r;s++){let a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,n),a.needsSwap){if(n){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}aa!==void 0&&(a instanceof aa?n=!0:a instanceof Dl&&(n=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new Oe);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let n=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(n,s),this.renderTarget2.setSize(n,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(n,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}});var Ul,vf=Vt(()=>{wn();er();Ul=class extends _n{constructor(e,t,n=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=n,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Le}render(e,t,n){let s=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:n),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=s}}});var _f,yf=Vt(()=>{wn();_f={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Le(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`}});var tr,bf=Vt(()=>{wn();er();Su();yf();tr=class i extends _n{constructor(e,t=1,n,s){super(),this.strength=t,this.radius=n,this.threshold=s,this.resolution=e!==void 0?new Oe(e.x,e.y):new Oe(256,256),this.clearColor=new Le(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new Et(r,a,{type:Nt,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let u=0;u<this.nMips;u++){let d=new Et(r,a,{type:Nt,depthBuffer:!1});d.texture.name="UnrealBloomPass.h"+u,d.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(d);let h=new Et(r,a,{type:Nt,depthBuffer:!1});h.texture.name="UnrealBloomPass.v"+u,h.texture.generateMipmaps=!1,this.renderTargetsVertical.push(h),r=Math.round(r/2),a=Math.round(a/2)}let o=_f;this.highPassUniforms=ci.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Mt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let u=0;u<this.nMips;u++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[u])),this.separableBlurMaterials[u].uniforms.invSize.value=new Oe(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new O(1,1,1),new O(1,1,1),new O(1,1,1),new O(1,1,1),new O(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=ci.clone(Qs.uniforms),this.blendMaterial=new Mt({uniforms:this.copyUniforms,vertexShader:Qs.vertexShader,fragmentShader:Qs.fragmentShader,premultipliedAlpha:!0,blending:Xn,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Le,this._oldClearAlpha=1,this._basic=new Pt,this._fsQuad=new Fi(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let n=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(n,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(n,s),this.renderTargetsVertical[r].setSize(n,s),this.separableBlurMaterials[r].uniforms.invSize.value=new Oe(1/n,1/s),n=Math.round(n/2),s=Math.round(s/2)}render(e,t,n,s,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=n.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=n.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=i.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(n),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){let t=[],n=e/3;for(let a=0;a<e;a++)t.push(.39894*Math.exp(-.5*a*a/(n*n))/n);let s=[],r=[];for(let a=1;a<e;a+=2){let o=t[a],l=a+1<e?t[a+1]:0,c=o+l;s.push((a*o+(a+1)*l)/c),r.push(c)}return new Mt({defines:{KERNEL_PAIRS:s.length},uniforms:{colorTexture:{value:null},invSize:{value:new Oe(.5,.5)},direction:{value:new Oe(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:s},gaussianWeights:{value:r}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new Mt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};tr.BlurDirectionX=new Oe(1,0);tr.BlurDirectionY=new Oe(0,1)});var oa,Mf=Vt(()=>{oa={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`}});var Fl,Sf=Vt(()=>{wn();er();Mf();Fl=class extends _n{constructor(){super(),this.isOutputPass=!0,this.uniforms=ci.clone(oa.uniforms),this.material=new ks({name:oa.name,uniforms:this.uniforms,vertexShader:oa.vertexShader,fragmentShader:oa.fragmentShader}),this._fsQuad=new Fi(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,n){this.uniforms.tDiffuse.value=n.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},Ke.getTransfer(this._outputColorSpace)===it&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Vr?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Gr?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===$r?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Qi?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===qr?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===jr?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Wr&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}}});function nr(i){return new Ur({color:0,emissive:16777215,emissiveIntensity:i})}var Ol,Ef=Vt(()=>{wn();Ol=class extends Yi{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new Je;e.deleteAttribute("uv");let t=new Tt({side:qt}),n=new Tt,s=new Zi(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Me(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let a=new un(e,n,6),o=new bt;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let l=new Me(e,nr(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new Me(e,nr(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let u=new Me(e,nr(17));u.position.set(14.904,12.198,-1.832),u.scale.set(.15,4.265,6.331),this.add(u);let d=new Me(e,nr(43));d.position.set(-.462,8.89,14.52),d.scale.set(4.38,5.441,.088),this.add(d);let h=new Me(e,nr(20));h.position.set(3.235,11.486,-12.541),h.scale.set(2.5,2,.1),this.add(h);let p=new Me(e,nr(100));p.position.set(0,20,0),p.scale.set(1,.1,1),this.add(p)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}}});function An(i,e,t,n,s,r){let a=2*Math.PI*s/4,o=Math.max(r-2*s,0),l=Math.PI/4;la.copy(e),la[n]=0,la.normalize();let c=.5*a/(a+o),u=1-la.angleTo(i)/l;return Math.sign(la[t])===1?u*c:o/(a+o)+c+c*(1-u)}var la,ir,Tf=Vt(()=>{wn();la=new O;ir=class i extends Je{constructor(e=1,t=1,n=1,s=2,r=.1){let a=s*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,a,a,a),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:s,radius:r},a===1)return;let o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;let l=new O,c=new O,u=new O(e,t,n).divideScalar(2).subScalar(r),d=this.attributes.position.array,h=this.attributes.normal.array,p=this.attributes.uv.array,g=d.length/6,y=new O,m=.5/a;for(let f=0,S=0;f<d.length;f+=3,S+=2)switch(l.fromArray(d,f),c.copy(l),c.x-=Math.sign(c.x)*m,c.y-=Math.sign(c.y)*m,c.z-=Math.sign(c.z)*m,c.normalize(),d[f+0]=u.x*Math.sign(l.x)+c.x*r,d[f+1]=u.y*Math.sign(l.y)+c.y*r,d[f+2]=u.z*Math.sign(l.z)+c.z*r,h[f+0]=c.x,h[f+1]=c.y,h[f+2]=c.z,Math.floor(f/g)){case 0:y.set(1,0,0),p[S+0]=An(y,c,"z","y",r,n),p[S+1]=1-An(y,c,"y","z",r,t);break;case 1:y.set(-1,0,0),p[S+0]=1-An(y,c,"z","y",r,n),p[S+1]=1-An(y,c,"y","z",r,t);break;case 2:y.set(0,1,0),p[S+0]=1-An(y,c,"x","z",r,e),p[S+1]=An(y,c,"z","x",r,n);break;case 3:y.set(0,-1,0),p[S+0]=1-An(y,c,"x","z",r,e),p[S+1]=1-An(y,c,"z","x",r,n);break;case 4:y.set(0,0,1),p[S+0]=1-An(y,c,"x","y",r,e),p[S+1]=1-An(y,c,"y","x",r,t);break;case 5:y.set(0,0,-1),p[S+0]=An(y,c,"x","y",r,e),p[S+1]=1-An(y,c,"y","x",r,t);break}}static fromJSON(e){return new i(e.width,e.height,e.depth,e.segments,e.radius)}}});function Bl(i,e,t){let n=document.createElement("canvas");return n.width=i,n.height=e,t(n.getContext("2d"),i,e),n}function Tu(i,e,t,n,s=2400){for(let r=0;r<s;r++){let a=Math.random()*n;i.fillStyle=Math.random()>.5?`rgba(255,255,255,${a})`:`rgba(0,0,0,${a})`,i.fillRect(Math.random()*e,Math.random()*t,1+Math.random()*2,1+Math.random()*2)}}function wf(i=4){let e=Bl(256,256,(n,s,r)=>{let a=n.createLinearGradient(0,0,s,r);a.addColorStop(0,"#b48a5a"),a.addColorStop(1,"#a07746"),n.fillStyle=a,n.fillRect(0,0,s,r);for(let o=0;o<70;o++){n.strokeStyle=`rgba(80,50,20,${.04+Math.random()*.05})`,n.beginPath();let l=Math.random()*r;n.moveTo(0,l),n.lineTo(s,l+(Math.random()-.5)*8),n.stroke()}Tu(n,s,r,.06),n.fillStyle="rgba(205,175,125,0.85)",n.fillRect(s*.42,0,s*.16,r),n.fillStyle="rgba(255,255,255,0.12)",n.fillRect(s*.44,0,s*.03,r),n.fillStyle="#eef1f2",n.fillRect(s*.08,r*.1,s*.28,r*.22),n.fillStyle="#1b1f24";for(let o=0;o<9;o++)n.fillRect(s*.1+o*6,r*.14,2+o%3,r*.09);n.fillRect(s*.1,r*.26,s*.2,3)}),t=new Ei(e);return t.colorSpace=Lt,t.anisotropy=i,t}function Af(){let i=Bl(64,128,(t,n,s)=>{t.fillStyle="#10151d",t.fillRect(0,0,n,s);for(let r=0;r<s;r+=16)t.fillStyle="#1d2531",t.fillRect(0,r,n,5),t.fillStyle="#070a0f",t.fillRect(0,r+5,n,2);Tu(t,n,s,.05,400)}),e=new Ei(i);return e.wrapS=ai,e.wrapT=ai,e.colorSpace=Lt,e}function Rf(i=8){let e=Bl(1024,1024,(n,s,r)=>{n.fillStyle="#0b1322",n.fillRect(0,0,s,r),Tu(n,s,r,.035,9e3);let a=s/10;for(let o=0;o<=10;o++)n.strokeStyle=o%5===0?"rgba(90,170,255,0.22)":"rgba(90,170,255,0.08)",n.lineWidth=o%5===0?3:1.5,n.beginPath(),n.moveTo(o*a,0),n.lineTo(o*a,r),n.stroke(),n.beginPath(),n.moveTo(0,o*a),n.lineTo(s,o*a),n.stroke()}),t=new Ei(e);return t.wrapS=ai,t.wrapT=ai,t.colorSpace=Lt,t.anisotropy=i,t}function Cf(){let i=Bl(128,128,(e,t,n)=>{let s=e.createRadialGradient(t/2,n/2,0,t/2,n/2,t/2);s.addColorStop(0,"rgba(255,255,255,1)"),s.addColorStop(.25,"rgba(255,255,255,0.55)"),s.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=s,e.fillRect(0,0,t,n)});return new Ei(i)}var Pf=Vt(()=>{wn()});var Of={};Xf(Of,{Scene3D:()=>Cu,webglDisponible:()=>c_});function c_(){try{let i=document.createElement("canvas");return!!(window.WebGL2RenderingContext&&i.getContext("webgl2"))}catch{return!1}}function Uf(i){let e=[];for(let t=0;t<i.length;t++){let n=i[Math.max(0,t-1)],s=i[Math.min(i.length-1,t+1)],r=i[t],a=t>0?[r[0]-n[0],r[1]-n[1]]:[s[0]-r[0],s[1]-r[1]],o=t<i.length-1?[s[0]-r[0],s[1]-r[1]]:a,l=Math.hypot(...a)||1,c=Math.hypot(...o)||1,u=[-a[1]/l,a[0]/l],d=[-o[1]/c,o[0]/c],h=[u[0]+d[0],u[1]+d[1]],p=Math.hypot(...h)||1;h=[h[0]/p,h[1]/p];let g=1/Math.max(.4,h[0]*u[0]+h[1]*u[1]);e.push([h[0]*g,h[1]*g])}return e}function Ff(i,e=0){let t=[e];for(let n=1;n<i.length;n++)t.push(t[n-1]+Math.hypot(i[n][0]-i[n-1][0],i[n][1]-i[n-1][1]));return t}function Ru(i,e,t,n,s=0){let r=Uf(i),a=Ff(i,s),o=[],l=[],c=[];i.forEach((d,h)=>{let p=d[0]+r[h][0]*e,g=d[1]+r[h][1]*e;if(o.push(p-r[h][0]*t/2,n,g-r[h][1]*t/2,p+r[h][0]*t/2,n,g+r[h][1]*t/2),l.push(0,a[h],1,a[h]),h){let y=(h-1)*2;c.push(y,y+2,y+1,y+1,y+2,y+3)}});let u=new Dt;return u.setAttribute("position",new gt(o,3)),u.setAttribute("uv",new gt(l,2)),u.setIndex(c),u.computeVertexNormals(),u.attributes.normal.array[1]<0&&(u.setIndex(c.map((d,h)=>c[h-h%3+[0,2,1][h%3]])),u.computeVertexNormals()),u}function zl(i,e,t,n){let s=Uf(i),r=Ff(i),a=[],o=[],l=[];i.forEach((u,d)=>{let h=u[0]+s[d][0]*e,p=u[1]+s[d][1]*e;if(a.push(h,t,p,h,n,p),o.push(r[d],0,r[d],1),d){let g=(d-1)*2;l.push(g,g+2,g+1,g+1,g+2,g+3)}});let c=new Dt;return c.setAttribute("position",new gt(a,3)),c.setAttribute("uv",new gt(o,2)),c.setIndex(l),c.computeVertexNormals(),c}function u_(){return new Mt({transparent:!0,depthWrite:!1,blending:Xn,toneMapped:!1,clipping:!0,uniforms:{uTemps:{value:0},uCouleur:{value:jt.cyan.clone()},uIntensite:{value:1},uVague:{value:-100},uVagueCouleur:{value:jt.conforme.clone()},uActif:{value:1}},vertexShader:`#include <clipping_planes_pars_vertex>
      varying vec2 vUv;
      void main(){ vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
      #include <clipping_planes_vertex>
      }`,fragmentShader:`
      #include <clipping_planes_pars_fragment>
      uniform float uTemps; uniform vec3 uCouleur; uniform float uIntensite; uniform float uVague; uniform vec3 uVagueCouleur; uniform float uActif;
      varying vec2 vUv;
      void main(){
        #include <clipping_planes_fragment>
        float d = vUv.y;
        float f = fract((d - uTemps * ${sr.toFixed(2)}) / 1.6);
        float tiret = smoothstep(0.0, 0.06, f) * (1.0 - smoothstep(0.22, 0.42, f)) * uActif;
        float bord = 1.0 - abs(vUv.x - 0.5) * 1.6;
        float a = (0.22 + tiret * 1.1) * bord;
        float w = exp(-pow((d - uVague) / 1.4, 2.0));
        vec3 c = mix(uCouleur, uVagueCouleur, clamp(w * 1.6, 0.0, 1.0));
        a += w * 2.2 * bord;
        gl_FragColor = vec4(c * a * uIntensite, 1.0);
      }`})}var jt,wu,sr,If,Lf,Df,Nf,Au,o_,l_,Cu,Bf=Vt(()=>{wn();xf();vf();bf();Sf();Ef();Tf();Pf();sc();jt={conforme:new Le(2152093),vigilance:new Le(16757818),critique:new Le(16731487),indisponible:new Le(6122884),cyan:new Le(3987199)},wu=330519,sr=1.1,If=1.05,Lf=150,Df={haute:{budget:36e5,bloom:!0,ombres:2048,msaa:4},moyenne:{budget:21e5,bloom:!1,ombres:1024,msaa:0},basse:{budget:1e6,bloom:!1,ombres:0,msaa:0}},Nf=[{q:"haute",echelle:1},{q:"haute",echelle:.8},{q:"moyenne",echelle:.85},{q:"moyenne",echelle:.65},{q:"basse",echelle:.7},{q:"basse",echelle:.5}],Au=(i,e,t)=>i+(e-i)*t,o_=(i,e,t)=>{let n=Math.max(0,Math.min(1,(t-i)/(e-i)));return n*n*(3-2*n)},l_=i=>i<.5?4*i*i*i:1-Math.pow(-2*i+2,3)/2;Cu=class{constructor(e,t,{surZone:n,surCamera:s,surQualite:r}){this.canvas=e,this.conteneur=t,this.surZone=n,this.surCamera=s,this.surQualite=r,this.tAnim=0,this.animNiveau="plein",this.mode="exploitation",this.actifRendu=!0,this.zoneActive=null,this.etats={},this.flux={actif:!0,cadence:.7,taux:.03,attente:6,production:0},this.qualiteChoix="auto",this.palier=0,this.perf={n:0,somme:0,t0:0,fps:0,bas:0,haut:0,dernierChangement:0},this.impulsions=[],this.vague=null,this.particules=null,this.revelation=null,this.derive=0}init(){let e=new Cl({canvas:this.canvas,antialias:!0,powerPreference:"high-performance",stencil:!1});if(!e.capabilities.isWebGL2)throw new Error("WebGL2 indisponible");this.r=e,e.setClearColor(wu,1),e.toneMapping=Qi,e.toneMappingExposure=1.05,e.outputColorSpace=Lt,e.shadowMap.enabled=!0,e.shadowMap.type=Ji,this.canvas.addEventListener("webglcontextlost",s=>{var r;s.preventDefault(),this.perdu=!0,(r=this.surQualite)==null||r.call(this,{perdu:!0})});let t=new Yi;this.s=t,t.background=new Le(wu),t.fog=new wr(wu,34,74);let n=new Js(e);return t.environment=n.fromScene(new Ol,.04).texture,t.environmentIntensity=.32,n.dispose(),this.cam=new $t(26,1,.5,220),this.dir=new O().setFromSphericalCoords(1,Tl.degToRad(51),Tl.degToRad(15)),this.cible=new O(.6,0,.4),this.camVue={cible:this.cible.clone(),dist:50},this.lumieres(),this.textures={carton:wf(e.capabilities.getMaxAnisotropy()>4?4:2),tapis:Af(),sol:Rf(Math.min(8,e.capabilities.getMaxAnisotropy())),halo:Cf()},this.mat={cadre:new Tt({color:1713463,metalness:.75,roughness:.4,side:kt}),garde:new Tt({color:11846612,metalness:.9,roughness:.28,side:kt}),tapis:new Tt({color:16777215,map:this.textures.tapis,metalness:.1,roughness:.75}),pied:new Tt({color:2766408,metalness:.7,roughness:.45}),carton:new Tt({color:16777215,map:this.textures.carton,roughness:.82,metalness:0}),graphite:new Tt({color:1779256,metalness:.6,roughness:.42}),acier:new Tt({color:9413304,metalness:.85,roughness:.3}),bleu:new Tt({color:1920911,metalness:.55,roughness:.42}),bois:new Tt({color:7164470,metalness:0,roughness:.9}),flux:u_()},this.mat.tapis.map.repeat.set(1,1),this.racine=new Bt,t.add(this.racine),this.construireSol(),this.construireRayonnages(),this.construirePostes(),this.construireConvoyeurs(),this.construirePortique(),this.construireAiguillage(),this.construireRejet(),this.construireExpedition(),this.construireZones(),this.construireColis(),this.ancres=Object.fromEntries(Object.entries(xi).map(([s,r])=>[s,new O(...r.ancre)])),this.ombresMeshes(),this.ecouteurs(),this.appliquerQualite(!0),this.redimensionner(),this.prechauffer(30),this.horloge=performance.now(),this.boucle=this.boucle.bind(this),this.relancer(),!0}lumieres(){let e=this.s;e.add(new Or(10277631,395794,.6));let t=new Vs(15267327,2.5);t.position.set(-9,22,13),t.target.position.set(1,0,0),t.castShadow=!0,t.shadow.bias=-4e-4,t.shadow.normalBias=.03;let n=t.shadow.camera;n.left=-22,n.right=22,n.top=16,n.bottom=-16,n.near=4,n.far=60,e.add(t,t.target),this.soleil=t;let s=new Vs(3987199,.55);s.position.set(14,8,-16),e.add(s),this.lumiereControle=new Zi(3987199,7,7,1.8),this.lumiereControle.position.set(3.4,2.4,4.5),e.add(this.lumiereControle)}construireSol(){let e=this.textures.sol;e.repeat.set(12,12);let t=new Me(new hn(120,120),new Tt({color:16777215,map:e,roughness:.72,metalness:.2}));t.rotation.x=-Math.PI/2,t.position.set(0,0,0),t.receiveShadow=!0,this.racine.add(t);let n=new hn(.6,.12),s=new Pt({color:10466248,transparent:!0,opacity:.35}),r=new un(n,s,40),a=new bt,o=0;for(let l=-4;l<12;l+=1.1)a.position.set(l,.006,4.5+1.55),a.rotation.set(-Math.PI/2,0,0),a.updateMatrix(),r.setMatrixAt(o++,a.matrix);r.count=o,this.racine.add(r)}construireRayonnages(){let e=hs,t=(e.x1-e.x0)/e.travees,n=new un(new Je(.09,e.hauteur,.09),this.mat.bleu,e.rangees.length*(e.travees+1)*2),s=new un(new Je(t-.1,.1,.06),this.mat.acier,e.rangees.length*e.travees*e.niveaux.length*2),r=new un(new Je(t-.12,.03,e.profondeur-.1),this.mat.graphite,e.rangees.length*e.travees*(e.niveaux.length-1)),a=new un(new Je(1,1,1),this.mat.carton,400),o=new bt,l=new Le,c=0,u=0,d=0,h=0,p=7,g=()=>(p=p*16807%2147483647,p/2147483647);for(let y of e.rangees){for(let m=0;m<=e.travees;m++)for(let f of[-e.profondeur/2,e.profondeur/2])o.position.set(e.x0+m*t,e.hauteur/2,y+f),o.rotation.set(0,0,0),o.scale.set(1,1,1),o.updateMatrix(),n.setMatrixAt(c++,o.matrix);for(let m=0;m<e.travees;m++){let f=e.x0+(m+.5)*t;e.niveaux.forEach((S,w)=>{for(let E of[-e.profondeur/2,e.profondeur/2])o.position.set(f,S+.05,y+E),o.scale.set(1,1,1),o.updateMatrix(),s.setMatrixAt(u++,o.matrix);if(w>0&&(o.position.set(f,S+.1,y),o.updateMatrix(),r.setMatrixAt(d++,o.matrix)),w===e.niveaux.length-1)return;let M=f-t/2+.15;for(;M<f+t/2-.4&&h<400;){let E=.35+g()*.4,x=.3+g()*.42,R=.5+g()*.35;if(M+E>f+t/2-.1)break;g()>.18&&(o.position.set(M+E/2,S+.115+x/2,y+(g()-.5)*.1),o.rotation.set(0,(g()-.5)*.08,0),o.scale.set(E,x,R),o.updateMatrix(),a.setMatrixAt(h,o.matrix),a.setColorAt(h,l.setHSL(.08,.25+g()*.15,.62+g()*.22)),h++),M+=E+.06}})}}a.count=h,[n,s,r,a].forEach(y=>{y.castShadow=!0,y.receiveShadow=!0,this.racine.add(y)}),this.revelables=[n,s,r,a]}construirePostes(){let e=new Je(.9,.08,1.2),t=new Je(.06,.82,.06),n=new hn(.42,.26);this.ecrans=[],ur.forEach(s=>{let r=new Bt,a=new Me(e,this.mat.graphite);a.position.set(0,.86,0),r.add(a);for(let[p,g]of[[-.4,-.55],[.4,-.55],[-.4,.55],[.4,.55]]){let y=new Me(t,this.mat.pied);y.position.set(p,.41,g),r.add(y)}let o=new Me(n,new Pt({color:jt.cyan.clone().multiplyScalar(1.6),toneMapped:!1}));o.position.set(-.3,1.18,.35),o.rotation.y=Math.PI/2,r.add(o),this.ecrans.push(o);let l=new Me(new Je(.08,.36,.08),this.mat.acier);l.position.set(-.3,1,.35),r.add(l),r.position.set(s.x-.1,0,s.z),r.traverse(p=>{p.isMesh&&(p.castShadow=!0,p.receiveShadow=!0)}),this.racine.add(r);let c=new Bt,u=new Me(new Je(1.1,.5,.6),this.mat.graphite);u.position.y=.55;let d=new Me(new Je(.45,.32,.4),this.mat.carton);d.position.set(-.2,.96,0);let h=new Me(new Je(.05,.6,.55),this.mat.acier);h.position.set(.58,.95,0),c.add(u,d,h),c.position.set(s.x-3.4-(s.z+3)*.6,0,s.z),c.traverse(p=>{p.isMesh&&(p.castShadow=!0)}),this.racine.add(c)})}troncon(e,t){let n=.86,s=new Bt,r=new Me(Ru(e,0,n,.82,0),this.mat.tapis);r.receiveShadow=!0;let a=new Me(zl(e,-n/2-.01,.55,.82+.01),this.mat.cadre),o=new Me(zl(e,n/2+.01,.55,.82+.01),this.mat.cadre),l=new Me(zl(e,-n/2-.04,.82-.02,.82+.14),this.mat.garde),c=new Me(zl(e,n/2+.04,.82-.02,.82+.14),this.mat.garde),u=new Me(Ru(e,-n/2-.04,.05,.82+.142,t),this.mat.flux),d=new Me(Ru(e,n/2+.04,.05,.82+.142,t),this.mat.flux);[a,o,l,c].forEach(y=>{y.castShadow=!0,y.receiveShadow=!0}),s.add(r,a,o,l,c,u,d),this.racine.add(s);let h=new bn(e),p=new O,g={x:0,z:0,cap:0};for(let y=.4;y<h.longueur;y+=1.5){h.a(y,g),p.set(Math.cos(g.cap),0,-Math.sin(g.cap));for(let m of[-1,1])this.pieds.push([g.x+p.x*m*(n/2-.05),g.z+p.z*m*(n/2-.05)])}}construireConvoyeurs(){this.pieds=[],Ua.forEach(r=>this.troncon(r,0)),this.troncon(Gi,3),this.troncon(ds,3+new bn(Gi).longueur),this.troncon(fs,3+new bn(Gi).longueur);let e=new un(new wi(.035,.035,.55,8),this.mat.pied,this.pieds.length),t=new bt;this.pieds.forEach(([r,a],o)=>{t.position.set(r,.275,a),t.updateMatrix(),e.setMatrixAt(o,t.matrix)}),e.castShadow=!0,this.racine.add(e);let n=new Me(new Je(.5,.1,.86+.2),this.mat.graphite);n.position.set(12.2+.25,.82-.03,4.5),n.castShadow=!0,this.racine.add(n),this.routes=[0,1,2].map(r=>new bn(hr(r))),this.trajetExpe=new bn(ds),this.trajetRejet=new bn(fs);let s=4.5-1.5;this.versCommun=ur.map(r=>-3-(r.x+.55)+(s-r.z))}construirePortique(){let e=new Bt,t=1.5,n=.86+.75,s=2.05,r=new Je(.16,s,.16);for(let d of[-t/2,t/2])for(let h of[-n/2,n/2]){let p=new Me(r,this.mat.graphite);p.position.set(d,s/2,h),e.add(p)}let a=new Me(new Je(t+.24,.28,n+.24),this.mat.graphite);a.position.y=s+.1,e.add(a);let o=new Tt({color:795190,metalness:.2,roughness:.15,transparent:!0,opacity:.38,depthWrite:!1,side:kt});for(let d of[-n/2,n/2]){let h=new Me(new hn(t-.16,1.05),o);h.position.set(0,.82+.68,d),e.add(h)}let l=new Pt({color:jt.cyan.clone().multiplyScalar(2.4),toneMapped:!1});for(let d of[-n/2-.085,n/2+.085]){let h=new Me(new Je(t+.2,.035,.035),l);h.position.set(0,s-.02,d),e.add(h);for(let p of[-t/2,t/2]){let g=new Me(new Je(.035,s-.2,.035),l);g.position.set(p+(p<0?-.085:.085),s/2,d),e.add(g)}}let c=new Me(new hn(n-.1,1.1),new Pt({map:this.textures.halo,color:jt.cyan.clone().multiplyScalar(1.5),transparent:!0,opacity:.55,blending:Xn,depthWrite:!1,toneMapped:!1,side:kt}));c.rotation.y=Math.PI/2,c.position.y=.82+.62,e.add(c),this.nappe=c;let u=new Me(new Je(t-.2,.05,.86+.06),this.mat.acier);u.position.y=.82-.01,e.add(u),e.position.set(3.4,0,4.5),e.traverse(d=>{d.isMesh&&d.material!==l&&d!==c&&d.material!==o&&(d.castShadow=!0,d.receiveShadow=!0)}),this.racine.add(e),this.portique=e}construireAiguillage(){let e=new Bt,t=new Me(new Je(.4,1,.4),this.mat.graphite);t.position.set(0,.5,0),e.add(t);let n=new Bt,s=new Me(new Je(1,.16,.06),this.mat.acier);s.position.set(-.5,0,0),n.add(s);let r=new Me(new Je(1,.03,.065),new Pt({color:jt.cyan.clone().multiplyScalar(2),toneMapped:!1}));r.position.set(-.5,.06,0),n.add(r),n.position.set(0,.82+.1,0),e.add(n),e.position.set(5.7+.15,0,4.5+.86/2+.3),e.traverse(a=>{a.isMesh&&(a.castShadow=!0)}),this.racine.add(e),this.bras=n,this.brasAngle=0,this.brasCible=0}construireRejet(){let e=zn,t=new Me(new Je(e.l,.08,e.p),this.mat.acier);t.position.set(e.x,.78,e.z);let n=new Me(new Je(e.l-.1,.72,e.p-.1),this.mat.graphite);n.position.set(e.x,.37,e.z),[t,n].forEach(s=>{s.castShadow=!0,s.receiveShadow=!0,this.racine.add(s)}),this.fileRejet=new un(new ir(1,1,1,2,.06),this.mat.carton,24),this.fileRejet.castShadow=!0,this.fileRejet.count=0,this.racine.add(this.fileRejet)}construireExpedition(){this.palettes=Mh.map(s=>{let r=new Me(new Je(1.2,.14,1),this.mat.bois);return r.position.set(s.x,.07,s.z),r.castShadow=!0,r.receiveShadow=!0,this.racine.add(r),{...s,n:0}}),this.colisPalette=new un(new ir(1,1,1,2,.06),this.mat.carton,48),this.colisPalette.castShadow=!0,this.colisPalette.count=0,this.racine.add(this.colisPalette);let e=new Je(.24,3.2,.24),t=new Je(.3,.32,2.9),n=new Pt({color:new Le(14677247).multiplyScalar(2.2),toneMapped:!1});Na.forEach((s,r)=>{for(let u of[-1.35,1.35]){let d=new Me(e,this.mat.graphite);d.position.set(s.x,1.6,s.z+u),d.castShadow=!0,this.racine.add(d)}let a=new Me(t,this.mat.graphite);a.position.set(s.x,3.25,s.z),a.castShadow=!0,this.racine.add(a);let o=new Me(new Je(.06,.05,2.4),n);o.position.set(s.x-.17,3.05,s.z),this.racine.add(o);let l=new Me(new hn(2.46,.9),new Tt({color:2240838,metalness:.5,roughness:.5,side:kt}));l.rotation.y=-Math.PI/2,l.position.set(s.x+.05,2.62,s.z),this.racine.add(l);let c=new Me(new Je(1.6,.06,2.1),this.mat.acier);if(c.position.set(s.x-.9,.03,s.z),c.receiveShadow=!0,this.racine.add(c),r<2){let u=new Me(new Je(2.6,2.7,2.45),new Tt({color:2765892,metalness:.45,roughness:.55}));u.position.set(s.x+1.55,1.65,s.z),u.castShadow=!0,this.racine.add(u)}})}construireZones(){this.zones={};let e=new hn(1,1);for(let[t,n]of Object.entries(xi)){let[s,r,a,o]=n.rect,l=r-s,c=o-a,u=new Bt;u.position.set((s+r)/2,0,(a+o)/2);let d=jt.cyan.clone(),h=new Pt({color:d,transparent:!0,opacity:.045,depthWrite:!1,toneMapped:!1}),p=new Me(e,h);p.rotation.x=-Math.PI/2,p.scale.set(l,c,1),p.position.y=.008,u.add(p);let g=new Pt({color:d.clone().multiplyScalar(1.3),transparent:!0,opacity:.55,depthWrite:!1,toneMapped:!1}),y=new Pt({color:d.clone().multiplyScalar(2.4),toneMapped:!1}),m=(P,L,z,I,B)=>{let W=new Me(e,B);W.rotation.x=-Math.PI/2,W.scale.set(P,L,1),W.position.set(z,.012,I),u.add(W)};m(l,.05,0,-c/2,g),m(l,.05,0,c/2,g),m(.05,c,-l/2,0,g),m(.05,c,l/2,0,g);let f=Math.min(1.1,l*.18,c*.18);for(let P of[-1,1])for(let L of[-1,1])m(f,.12,P*(l/2-f/2),L*c/2,y),m(.12,f,P*l/2,L*(c/2-f/2),y);let S=new Bt,w=P=>new Tt({color:P,emissive:P,emissiveIntensity:.08,roughness:.3,metalness:.1,transparent:!0,opacity:.92}),M={conforme:w(2152093),vigilance:w(16757818),critique:w(16731487)},E=new Tt({color:2766408,metalness:.7,roughness:.4}),x=new wi(.12,.12,.2,16),R=new Me(new wi(.04,.04,2.1,8),E);R.position.y=1.05,S.add(R),["conforme","vigilance","critique"].forEach((P,L)=>{let z=new Me(x,M[P]);z.position.y=2.68-L*.22,S.add(z)});let _=new Me(new wi(.13,.13,.06,16),E);_.position.y=2.82,S.add(_),S.position.set(l/2-.35,0,-c/2+.35),S.traverse(P=>{P.isMesh&&(P.castShadow=!0)}),u.add(S);let T=new Me(new Je(l,n.hauteur,c),new Pt({visible:!1}));T.position.y=n.hauteur/2,T.userData.zone=t,u.add(T);let C=new Me(new Nr(.92,1,72),new Pt({color:d.clone().multiplyScalar(2),transparent:!0,opacity:0,depthWrite:!1,toneMapped:!1,side:kt}));C.rotation.x=-Math.PI/2,C.position.y=.02,u.add(C),this.racine.add(u),this.zones[t]={g:u,matFill:h,matBord:g,matCoin:y,mat3:M,vol:T,anneau:C,rayon:Math.max(l,c)*.62,etat:"indisponible",survol:!1}}this.volumes=Object.values(this.zones).map(t=>t.vol)}construireColis(){this.colisMesh=new un(new ir(1,1,1,2,.06),this.mat.carton,Lf),this.colisMesh.castShadow=!0,this.colisMesh.receiveShadow=!0,this.colisMesh.instanceMatrix.setUsage(Xc),this.colisMesh.count=0,this.colisMesh.frustumCulled=!1,this.racine.add(this.colisMesh),this.colisMesh.setColorAt(0,new Le(1,1,1)),this.colis=[],this.attenteSpawn=0,this.dernierCommun=-10,this.dernierParRoute=[-10,-10,-10],this.accRejet=0,this.tourRoute=0,this.horlogeFlux=0,this._o=new bt,this._c=new Le,this._p={x:0,z:0,cap:0}}majColis(e){let t=this.flux,n=t.actif?sr:0;if(this.horlogeFlux+=e*(t.actif?1:0),t.actif&&t.cadence>0&&(this.attenteSpawn-=e,this.attenteSpawn<=0&&this.colis.length<Lf-2)){let r=[0,2,1,0,1,2][this.tourRoute%6],a=this.horlogeFlux+this.versCommun[r]/sr;if(a-this.dernierCommun>=If/sr&&this.horlogeFlux-this.dernierParRoute[r]>=If/sr){let o=.85+this.tourRoute*37%10/33;this.colis.push({r,d:0,br:0,d2:0,sx:.56*o,sy:.4*(.85+this.tourRoute*13%7/18),sz:.5*o,teinte:.9+this.tourRoute*7%5/25,alpha:1}),this.dernierCommun=a,this.dernierParRoute[r]=this.horlogeFlux,this.tourRoute++,this.attenteSpawn=1/t.cadence,this.ecrans[r].material.color.copy(jt.cyan).multiplyScalar(3.2)}else this.tourRoute++,this.attenteSpawn=.05}this.ecrans.forEach(r=>r.material.color.lerp(this._c.copy(jt.cyan).multiplyScalar(1.4),Math.min(1,e*3)));let s=[];for(let r of this.colis){if(r.br===0){r.d+=n*e;let a=this.routes[r.r].longueur;r.d>=a&&(this.accRejet+=t.taux,this.accRejet>=1?(this.accRejet-=1,r.br=2,this.brasCible=1,this.brasT=.7):r.br=1,r.d2=r.d-a)}else{r.d2+=n*e;let a=r.br===1?this.trajetExpe:this.trajetRejet;if(r.d2>=a.longueur){r.br===1&&this.deposerPalette();continue}}s.push(r)}this.colis=s,this.brasT>0&&(this.brasT-=e,this.brasT<=0&&(this.brasCible=0)),this.brasAngle=Au(this.brasAngle,this.brasCible,Math.min(1,e*9)),this.bras.rotation.y=-this.brasAngle*.6,this.ecrireColis()}ecrireColis(){let e=this._o,t=this._p,n=0;for(let s of this.colis){s.br===0?this.routes[s.r].a(s.d,t):(s.br===1?this.trajetExpe:this.trajetRejet).a(s.d2,t),e.position.set(t.x,.82+s.sy/2+.005,t.z),e.rotation.set(0,t.cap,0),e.scale.set(s.sz,s.sy,s.sx),e.updateMatrix(),this.colisMesh.setMatrixAt(n,e.matrix);let r=s.br===2?Math.min(1,s.d2/1.2):0;this._c.setRGB(s.teinte,s.teinte,s.teinte).lerp(jt.vigilance,r*.55),this.colisMesh.setColorAt(n,this._c),n++}this.colisMesh.count=n,this.colisMesh.instanceMatrix.needsUpdate=!0,this.colisMesh.instanceColor&&(this.colisMesh.instanceColor.needsUpdate=!0)}deposerPalette(){let e=this.palettes[this.palIndex||0];e.n+=1,e.n>24&&(e.n=0,this.palIndex=((this.palIndex||0)+1)%this.palettes.length),this.ecrirePalettes()}ecrirePalettes(){let e=this._o,t=0;this.palettes.forEach(n=>{for(let s=0;s<Math.min(24,n.n);s++){let r=Math.floor(s/8),a=s%8;e.position.set(n.x-.42+a%4*.28,.14+.17+r*.34,n.z-.23+Math.floor(a/4)*.46),e.rotation.set(0,0,0),e.scale.set(.27,.33,.44),e.updateMatrix(),this.colisPalette.setMatrixAt(t++,e.matrix)}}),this.colisPalette.count=t,this.colisPalette.instanceMatrix.needsUpdate=!0}ecrireFileRejet(e){let t=zn,n=this._o,s=Math.min(24,Math.max(0,Math.round(e||0)));for(let r=0;r<s;r++){let a=Math.floor(r/12),o=r%12;n.position.set(t.x-t.l/2+.3+o%4*.58,.82+.17+a*.35,t.z-t.p/2+.3+Math.floor(o/4)*.55),n.rotation.set(0,(r*37%9-4)*.03,0),n.scale.set(.46,.33,.4),n.updateMatrix(),this.fileRejet.setMatrixAt(r,n.matrix),this.fileRejet.setColorAt(r,this._c.setRGB(1,.92,.82))}this.fileRejet.count=s,this.fileRejet.instanceMatrix.needsUpdate=!0,this.fileRejet.instanceColor&&(this.fileRejet.instanceColor.needsUpdate=!0)}prechauffer(e){let t=this.flux.actif;this.flux.actif=!0;for(let n=0;n<e;n+=.05)this.majColis(.05);this.flux.actif=t,this.palettes[0].n=14,this.palettes[1].n=6,this.ecrirePalettes()}ombresMeshes(){this.racine.traverse(e=>{e.isMesh&&e.material===this.mat.carton&&(e.castShadow=!0)})}majEtats(e){var t;for(let[n,s]of Object.entries(this.zones)){let r=((t=e==null?void 0:e[n])==null?void 0:t.etat)||"indisponible";s.etat=r;let a=r==="conforme"?jt.cyan:jt[r],o=r==="critique"||r==="vigilance";s.matFill.color.copy(a),s.matFill.opacity=o?.085:r==="indisponible"?.02:.04,s.matBord.color.copy(a).multiplyScalar(o?1.8:1.1),s.matBord.opacity=r==="indisponible"?.3:o?.9:.5,s.matCoin.color.copy(a).multiplyScalar(o?3.2:r==="indisponible"?.8:2.2);for(let[l,c]of Object.entries(s.mat3))c.emissiveIntensity=l===r?3.2:.06}this.demander()}majFlux({actif:e,debit:t,taux:n,attente:s}){let r=t!=null?Math.max(.22,Math.min(1.5,t/180*.9)):.7;this.flux.actif=!!e,this.flux.cadence=r,this.flux.taux=Math.max(0,Math.min(.5,n??.03)),this.flux.attente=s,this.mat.flux.uniforms.uActif.value=e?1:.15,this.ecrireFileRejet(s),this.demander()}impulsion(e,t){let n=this.zones[e];n&&(n.anneau.material.color.copy(jt[t]||jt.cyan).multiplyScalar(2.4),this.impulsions.push({z:n,t:0,duree:this.animNiveau==="plein"?2.6:6,statique:this.animNiveau!=="plein"}),this.demander())}celebrer(){if(this.animNiveau!=="plein"){for(let o of Object.values(this.zones))o.mat3.conforme.emissiveIntensity=4;setTimeout(()=>this.majEtats(Object.fromEntries(Object.entries(this.zones).map(([o,l])=>[o,{etat:l.etat}]))),3e3),this.demander();return}this.vague={t:0};let e=220,t=new Dt,n=new Float32Array(e*3),s=[];for(let o=0;o<e;o++){let l=Math.random()*Math.PI*2,c=Math.random()*1.6;n.set([14+Math.cos(l)*c,.6+Math.random()*.6,4.6+Math.sin(l)*c],o*3),s.push([Math.cos(l)*(.6+Math.random()),2.4+Math.random()*2.6,Math.sin(l)*(.6+Math.random())])}t.setAttribute("position",new ln(n,3));let r=new zs({map:this.textures.halo,color:jt.conforme.clone().multiplyScalar(2.2),size:.42,transparent:!0,depthWrite:!1,blending:Xn,toneMapped:!1});this.particules&&(this.s.remove(this.particules.p),this.particules.p.geometry.dispose());let a=new Ir(t,r);this.s.add(a),this.particules={p:a,vit:s,t:0}}ajuster(e,t={h:.13,b:.1,g:.05,d:.05},n){let s=[];for(let c of[e.x0,e.x1])for(let u of[0,e.y1])for(let d of[e.z0,e.z1])s.push(new O(c,u,d));let r=this.cam.clone(),a=4,o=160,l=new O;for(let c=0;c<26;c++){let u=(a+o)/2;r.position.copy(n).addScaledVector(this.dir,u),r.lookAt(n),r.updateMatrixWorld(),r.updateProjectionMatrix(),s.every(h=>(l.copy(h).project(r),l.x>-1+t.g*2&&l.x<1-t.d*2&&l.y>-1+t.b*2&&l.y<1-t.h*2))?o=u:a=u}return o}vueGenerale(e=!1){this.zoneActive=null,this.masque=0,this.cam.clearViewOffset();let t=this.mode==="immersion"?{h:.1,b:.04,g:.16,d:.16}:{h:.12,b:.05,g:.015,d:.015},n=new O((en.x0+en.x1)/2,0,(en.z0+en.z1)/2),s=this.ajuster(en,t,n);this.allerVers(n,s,e),Object.values(this.zones).forEach(r=>{r.survol=!1})}zoomZone(e,t=!1,n=this.masque||0){let s=xi[e];if(!s)return;this.zoneActive=e,this.masque=n;let{w:r,h:a}=this.taille||{w:1,h:1};n>0&&n<r*.7?this.cam.setViewOffset(r+n,a,n,0,r,a):this.cam.clearViewOffset();let[o,l,c,u]=s.rect,d=new O((o+l)/2,.6,(c+u)/2),h=n>0&&n<r*.7?n/r:0,p=this.ajuster({x0:o-1.2,x1:l+1.2,z0:c-1.2,z1:u+1.2,y1:s.hauteur+.6},{h:.2,b:.1,g:.06,d:.06+h/2},d);this.allerVers(d,p,t)}allerVers(e,t,n){let s={cible:this.camVue.cible.clone(),dist:this.camVue.dist};if(this.camVue={cible:e.clone(),dist:t},n||this.animNiveau!=="plein"||!this.camPrete){this.tween=null,this.placerCamera(e,t),this.camPrete=!0,this.demander();return}this.tween={dep:s,arr:{cible:e,dist:t},t:0,duree:.75},this.relancer()}placerCamera(e,t,n=0){let s=this.dir.clone().applyAxisAngle(new O(0,1,0),n);this.cam.position.copy(e).addScaledVector(s,t),this.cam.lookAt(e),this.cam.updateMatrixWorld(),this.s.fog.near=t+12,this.s.fog.far=t+60,this.camBouge=!0}reglerQualite(e){this.qualiteChoix=e,this.palier=0,this.appliquerQualite()}qualiteCourante(){return this.qualiteChoix==="auto"?Nf[this.palier]:{q:this.qualiteChoix,echelle:1}}infoQualite(){let e=this.qualiteCourante(),t={haute:"Haute",moyenne:"Moyenne",basse:"Basse"}[e.q];return`${this.qualiteChoix==="auto"?"Auto \u2192 ":""}${t}, r\xE9solution ${Math.round((this.prEffectif||1)*100)} %${this.perf.fps?` \xB7 ${Math.round(this.perf.fps)} img/s`:""}`}appliquerQualite(e=!1){var r,a;let t=this.qualiteCourante(),n=Df[t.q];this.Q=n,this.echelle=t.echelle;let s=n.ombres>0;this.r.shadowMap.enabled=s,this.soleil.castShadow=s,s&&this.soleil.shadow.mapSize.x!==n.ombres&&(this.soleil.shadow.mapSize.set(n.ombres,n.ombres),(r=this.soleil.shadow.map)==null||r.dispose(),this.soleil.shadow.map=null),e||this.s.traverse(o=>{o.material&&o.isMesh&&(Array.isArray(o.material)?o.material:[o.material]).forEach(l=>{l.needsUpdate=!0})}),n.bloom&&!this.composer&&this.creerComposer(),this.redimensionner(),(a=this.surQualite)==null||a.call(this,{info:this.infoQualite()})}creerComposer(){let e=new Et(4,4,{type:Nt,samples:Df.haute.msaa});this.composer=new Nl(this.r,e),this.composer.addPass(new Ul(this.s,this.cam)),this.bloom=new tr(new Oe(256,256),.6,.45,.82),this.composer.addPass(this.bloom),this.composer.addPass(new Fl)}redimensionner(){var a;if(!this.r)return;let e=Math.max(1,this.conteneur.clientWidth),t=Math.max(1,this.conteneur.clientHeight),n=Math.min(window.devicePixelRatio||1,2),s=((a=this.Q)==null?void 0:a.budget)||2e6,r=Math.max(.5,Math.min(n,Math.sqrt(s/(e*t)))*(this.echelle||1));this.prEffectif=r/n,this.r.setPixelRatio(r),this.r.setSize(e,t,!1),this.composer&&(this.composer.setPixelRatio(r),this.composer.setSize(e,t)),this.cam.aspect=e/t,this.cam.updateProjectionMatrix(),this.zoneActive?this.zoomZone(this.zoneActive,!0):this.vueGenerale(!0),this.taille={w:e,h:t},this.demander()}ecouteurs(){document.addEventListener("visibilitychange",()=>this.relancer());let e=new Hr,t=new Oe,n=null,s=r=>{let a=this.canvas.getBoundingClientRect();t.set((r.clientX-a.left)/a.width*2-1,-((r.clientY-a.top)/a.height)*2+1),e.setFromCamera(t,this.cam);let o=e.intersectObjects(this.volumes,!1)[0];return o?o.object.userData.zone:null};this.canvas.addEventListener("pointerdown",r=>{n={x:r.clientX,y:r.clientY,t:performance.now()}}),this.canvas.addEventListener("pointerup",r=>{var l;if(!n)return;let a=Math.hypot(r.clientX-n.x,r.clientY-n.y)<12&&performance.now()-n.t<800;if(n=null,!a)return;let o=s(r);o&&((l=this.surZone)==null||l.call(this,o))}),this.canvas.addEventListener("pointermove",r=>{if(r.pointerType!=="mouse")return;let a=s(r);this.canvas.style.cursor=a?"pointer":"default";let o=!1;for(let[l,c]of Object.entries(this.zones)){let u=l===a;c.survol!==u&&(c.survol=u,o=!0)}o&&this.demander()})}reglerAnimation(e){this.animNiveau=e,this.relancer(),this.demander()}reglerMode(e){this.mode=e,this.actifRendu=e!=="briefing",this.bloom&&(this.bloom.strength=e==="immersion"?.95:.6),this.r.toneMappingExposure=e==="immersion"?1.12:1.05,this.actifRendu?(this.redimensionner(),this.relancer()):this.r.setAnimationLoop(null)}revele(){if(this.animNiveau!=="plein")return;this.r.localClippingEnabled=!1,this.plan=new xn(new O(-1,0,0),en.x0-2),this.r.clippingPlanes=[this.plan];let e=new Bt,t=new Me(new hn(.08,en.z1-en.z0+3),new Pt({color:jt.cyan.clone().multiplyScalar(3),toneMapped:!1,transparent:!0,depthWrite:!1}));t.rotation.x=-Math.PI/2,t.position.y=.03;let n=new Me(new hn(en.z1-en.z0+3,3.4),new Mt({transparent:!0,depthWrite:!1,blending:Xn,toneMapped:!1,side:kt,uniforms:{uC:{value:jt.cyan.clone().multiplyScalar(.55)}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:"uniform vec3 uC; varying vec2 vUv; void main(){ float a = pow(1.0 - vUv.y, 2.2) * smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x); gl_FragColor = vec4(uC * a, 1.0); }"}));n.rotation.y=Math.PI/2,n.position.y=1.7,e.add(t,n),e.position.set(en.x0,0,(en.z0+en.z1)/2),this.s.add(e),this.revelation={t:0,duree:1.35,balai:e},this.relancer()}doitAnimer(){return this.actifRendu&&!document.hidden&&(this.animNiveau==="plein"||this.tween||this.revelation)}relancer(){!this.r||this.perdu||(this.doitAnimer()?(this.horloge=performance.now(),this.r.setAnimationLoop(this.boucle)):(this.r.setAnimationLoop(null),this.demander()))}demander(){!this.r||this.perdu||!this.actifRendu||this.doitAnimer()||this.attenteRendu||(this.attenteRendu=!0,requestAnimationFrame(()=>{this.attenteRendu=!1,this.majStatique(),this.rendre()}))}majStatique(){this.impulsions=this.impulsions.filter(e=>{let t=e.z;return t.anneau.material.opacity=0,t.matBord.opacity=Math.max(t.matBord.opacity,1),setTimeout(()=>this.majEtats(Object.fromEntries(Object.entries(this.zones).map(([n,s])=>[n,{etat:s.etat}]))),e.duree*1e3),!1}),this.ecrireColis(),this.survolVisuel()}survolVisuel(){for(let[e,t]of Object.entries(this.zones)){let n=t.survol||this.zoneActive===e;t.matFill.opacity=n?.13:t.etat==="critique"||t.etat==="vigilance"?.085:t.etat==="indisponible"?.02:.04}}boucle(e){let t=(e-this.horloge)/1e3,n=Math.min(.05,t),s=Math.min(.25,t);if(this.horloge=e,this.animNiveau==="plein"){this.tAnim+=n,this.flux.actif&&(this.mat.flux.uniforms.uTemps.value=this.tAnim,this.mat.tapis.map.offset.y=(this.mat.tapis.map.offset.y-n*sr)%1),this.majColis(n),this.nappe.position.x=Math.sin(this.tAnim*2.4)*.55,this.nappe.material.opacity=.35+.25*Math.abs(Math.sin(this.tAnim*2.4));let a=.5+.5*Math.sin(this.tAnim*4.2);for(let o of Object.values(this.zones))o.etat==="critique"&&(o.mat3.critique.emissiveIntensity=1.2+2.6*a);this.mode==="immersion"&&!this.zoneActive&&!this.tween&&(this.derive+=n,this.placerCamera(this.camVue.cible,this.camVue.dist,Math.sin(this.derive*.16)*.06))}if(this.tween){let a=this.tween;a.t+=s/a.duree;let o=l_(Math.min(1,a.t)),l=a.dep.cible.clone().lerp(a.arr.cible,o),c=Au(a.dep.dist,a.arr.dist,o)+Math.sin(o*Math.PI)*1.5;this.placerCamera(l,c),a.t>=1&&(this.tween=null)}if(this.impulsions=this.impulsions.filter(a=>{a.t+=s;let o=a.t%.85/.85,l=a.z.rayon*(.6+o*1.1);return a.z.anneau.scale.set(l,l,1),a.z.anneau.material.opacity=(1-o)*.95,a.z.matBord.opacity=.6+.4*(1-o),a.t>=a.duree?(a.z.anneau.material.opacity=0,!1):!0}),this.vague){this.vague.t+=s,this.mat.flux.uniforms.uVague.value=-2+this.vague.t*16;for(let a of Object.values(this.zones))a.mat3.conforme.emissiveIntensity=a.etat==="conforme"||Math.sin(this.vague.t*9)>0?3.6:.06;this.vague.t>2.6&&(this.vague=null,this.mat.flux.uniforms.uVague.value=-100,this.majEtats(Object.fromEntries(Object.entries(this.zones).map(([a,o])=>[a,{etat:o.etat}]))))}if(this.particules){let a=this.particules;a.t+=s;let o=a.p.geometry.attributes.position;for(let l=0;l<a.vit.length;l++)a.vit[l][1]-=2.2*s,o.array[l*3]+=a.vit[l][0]*s,o.array[l*3+1]=Math.max(.05,o.array[l*3+1]+a.vit[l][1]*s),o.array[l*3+2]+=a.vit[l][2]*s;o.needsUpdate=!0,a.p.material.opacity=Math.max(0,1-a.t/2.4),a.t>2.4&&(this.s.remove(a.p),a.p.geometry.dispose(),this.particules=null)}if(this.revelation){let a=this.revelation;a.t+=s;let o=1-Math.pow(1-Math.min(1,a.t/a.duree),2.2),l=Au(en.x0-2,en.x1+3,o);this.plan.constant=l,a.balai.position.x=l-.02,a.balai.children[0].material.opacity=1-o_(.85,1,o),a.t>=a.duree&&(this.r.clippingPlanes=[],this.s.remove(a.balai),a.balai.traverse(c=>{c.isMesh&&(c.geometry.dispose(),c.material.dispose())}),this.revelation=null)}this.survolVisuel(),this.rendre(),this.mesurer(n),this.doitAnimer()||this.r.setAnimationLoop(null)}rendre(){var e;this.composer&&this.Q.bloom?this.composer.render():this.r.render(this.s,this.cam),(this.camBouge||this.dernierTaille!==this.taille)&&(this.camBouge=!1,this.dernierTaille=this.taille,(e=this.surCamera)==null||e.call(this,this.projeter()))}projeter(){let e=new O,{w:t,h:n}=this.taille||{w:1,h:1},s={};for(let[r,a]of Object.entries(this.ancres))e.copy(a).project(this.cam),s[r]={x:(e.x+1)/2*t,y:(1-e.y)/2*n,visible:e.z<1&&e.x>-1.1&&e.x<1.1&&e.y>-1.1&&e.y<1.1};return s}mesurer(e){var r;let t=this.perf;if(t.n++,t.somme+=e,t.somme<2)return;let n=t.somme/t.n;if(t.fps=1/n,t.n=0,t.somme=0,(r=this.surQualite)==null||r.call(this,{fps:t.fps,info:this.infoQualite()}),this.qualiteChoix!=="auto"||this.animNiveau!=="plein"||document.hidden)return;let s=performance.now();n>1/40?t.bas++:t.bas=0,n<1/58?t.haut++:t.haut=0,t.bas>=2&&this.palier<Nf.length-1?(this.palier++,t.bas=0,t.dernierChangement=s,this.appliquerQualite()):t.haut>=6&&this.palier>0&&s-t.dernierChangement>3e4&&(this.palier--,t.haut=0,t.dernierChangement=s,this.appliquerQualite())}liberer(){var e,t;(e=this.r)==null||e.setAnimationLoop(null),(t=this.r)==null||t.dispose()}}});var ku="1.0.0",Vl={entreprise:"Rexel",site:"CLR Champigneulles",service:"Pick & Pack"},rr=[["P1","Prise de poste","La s\xE9curit\xE9 commence avant la production."],["P2","Consommables","Le bon contenant, au bon moment."],["P3","Affectation & montage chariot","Bien s'affecter, bien monter."],["P4","Pr\xE9paration d\xE9tail","Bien lire, bien pr\xE9lever, bien coller."],["P5","Pr\xE9paration carton","Bien trier, bien ins\xE9rer, bien exp\xE9dier."],["P6","Pr\xE9paration retract","S\xE9curiser chaque palette avant de gerber."],["P7","Changement de contenants","Le bon carton, d\xE8s le d\xE9part."],["P8","Ruptures & validation","Une rupture saisie = un colis conforme."],["P9","Gestion des d\xE9chets","Trier juste. \xC9vacuer net."],["P10","Circulation & s\xE9curit\xE9","Chaque d\xE9placement compte."],["P11","Fin de poste","Une zone pr\xEAte pour l'\xE9quipe suivante."],["P12","A\xE9rosol & batterie","Produits \xE0 risque \u2014 z\xE9ro tol\xE9rance sur le conditionnement."],["P13","Pr\xE9paration monolignes","Une \xE9tiquette, un article, un C16."],["P14","Les interdits","Les r\xE8gles internes \xE0 respecter dans le CLR."],["P15","Changement de batterie (Togger)","Manipuler le Togger avec rigueur et s\xE9curit\xE9."],["P16","Les compos\xE9s","Pr\xE9lever les compos\xE9s avec pr\xE9cision en all\xE9e 11."],["P17","S\xE9curit\xE9 incendie","\xC9vacuer, alerter, intervenir \u2014 chacun son r\xF4le."],["P18","S\xE9curit\xE9 au quotidien","Signaler, circuler, prot\xE9ger \u2014 chaque jour dans le CLR."]].map(([i,e,t])=>({id:i,titre:e,sous:t})),Zt=[{id:"preparation",code:"Z1",nom:"Pr\xE9paration",court:"PR\xC9PA"},{id:"convoyeur",code:"Z2",nom:"Convoyeur",court:"CONVOYEUR"},{id:"controle",code:"Z3",nom:"Contr\xF4le",court:"CONTR\xD4LE"},{id:"rejet",code:"Z4",nom:"Rejet",court:"REJET"},{id:"expedition",code:"Z5",nom:"Exp\xE9dition",court:"EXP\xC9"}],rs={affichage:{mode:"exploitation",qualite:"auto",rendu:"3d",animations:"auto",perf:!1},donnees:{source:"demo",fichier:"donnees/pick_data.js",variable:"PICK_MC_DATA",url:"",actualisation:120,seuilAncien:10,csv:{separateur:"auto",colonnes:{horodatage:"heure",lignes:"lignes",colis:"colis_controles",produits:"colis_expedies",rejets:"rejets",erreurs:"erreurs_decelees",charge:"charge_restante",attente:"attente_rejet",effectif:"effectif_present",effectifPrevu:"effectif_prevu",preparateurs:"preparateurs"}}},equipes:[{id:"matin",nom:"Matin",debut:"06:00",fin:"13:24",pauses:[["09:30","09:50"]]},{id:"apres-midi",nom:"Apr\xE8s-midi",debut:"13:24",fin:"20:48",pauses:[["17:00","17:20"]]}],objectifs:{quotaLignes:620,heuresRef:7.4,mode:"quota",objectifFixe:12e3,objectifColis:null},seuils:{rythme:{vigilance:5,critique:12},capacite:{vigilance:100,critique:115},rejetTaux:{vigilance:3,critique:5},rejetAttente:{vigilance:15,critique:30},ppmDecelee:{vigilance:1e3,critique:2e3,minLignes:1e3},effectif:{vigilance:1,critique:3},debit:{vigilance:60}},actions:{rythme:"V\xE9rifier les affectations et lever les blocages (ruptures, consommables) \u2014 standards P3 et P8.",capacite:"Arbitrer avec le responsable : renfort, heures suppl\xE9mentaires ou report de charge.",rejetTaux:"Analyser les motifs de rejet avec l'op\xE9rateur contr\xF4le et rappeler le standard P5.",rejetAttente:"Affecter une personne au poste de rejet jusqu\u2019au retour sous le seuil.",ppmDecelee:"Rappeler le standard P4 (bien lire, bien pr\xE9lever, bien coller) aux pr\xE9parateurs concern\xE9s.",effectif:"",debit:""},briefing:{standard:"P10",message:"All\xE9es d\xE9gag\xE9es, priorit\xE9 aux pi\xE9tons sur les passages marqu\xE9s.",priorites:["","",""]},demo:{scenario:"normal",horloge:"auto"}},Jt={rythme:{titre:"Rythme de pr\xE9paration",zone:"preparation",kpi:"lignes",validee:!1,formule:"\xE9cart = (lignes pr\xE9par\xE9es \u2212 lignes attendues \xE0 cette heure) \xF7 lignes attendues. Lignes attendues = objectif \xD7 temps productif \xE9coul\xE9 \xF7 temps productif total (pauses exclues)."},capacite:{titre:"Charge restante / capacit\xE9",zone:"preparation",kpi:"charge",validee:!1,formule:"capacit\xE9 restante (estimation) = pr\xE9parateurs pr\xE9sents \xD7 (quota \xF7 heures de r\xE9f\xE9rence) \xD7 heures productives restantes du poste."},rejetTaux:{titre:"Taux de rejet convoyeur",zone:"controle",kpi:"rejets",validee:!1,formule:"taux = colis rejet\xE9s \xF7 colis contr\xF4l\xE9s."},rejetAttente:{titre:"Colis en attente au rejet",zone:"rejet",kpi:"rejets",validee:!1,formule:"nombre de colis pr\xE9sents au poste de rejet au moment de l\u2019extraction."},ppmDecelee:{titre:"Qualit\xE9 d\xE9cel\xE9e (PPM)",zone:"controle",kpi:"qualite",validee:!0,formule:"PPM d\xE9cel\xE9e = erreurs d\xE9cel\xE9es au rejet \xF7 lignes pr\xE9par\xE9es \xD7 1 000 000 (d\xE9finition du bilan mensuel). Seuil vert < 1 000 (PARAMETRES)."},effectif:{titre:"Effectif pr\xE9sent",zone:"preparation",kpi:"effectif",validee:!1,formule:"absents = effectif pr\xE9vu \u2212 effectif pr\xE9sent."},debit:{titre:"D\xE9bit convoyeur",zone:"convoyeur",kpi:"production",validee:!1,formule:"d\xE9bit de la derni\xE8re heure compl\xE8te \xF7 d\xE9bit horaire moyen depuis le d\xE9but du poste."}};var Wl="pick-mc/reglages/v1",Gl=i=>i&&typeof i=="object"&&!Array.isArray(i);function as(i,e){if(!Gl(e))return $l(i);let t=$l(i);for(let n of Object.keys(e))Gl(i==null?void 0:i[n])&&Gl(e[n])?t[n]=as(i[n],e[n]):e[n]!==void 0&&(t[n]=$l(e[n]));return t}function $l(i){return i===void 0?void 0:JSON.parse(JSON.stringify(i))}function Yf(){try{let i=window.localStorage.getItem(Wl);return i?JSON.parse(i):null}catch{return null}}function Hu(i){try{return window.localStorage.setItem(Wl,JSON.stringify(i)),!0}catch{return!1}}function Vu(){try{window.localStorage.removeItem(Wl)}catch{}}function Zf(){let i=new URLSearchParams(window.location.search),e={},t=(c,u)=>{let d=c.split("."),h=e;d.slice(0,-1).forEach(p=>{h=h[p]??={}}),h[d[d.length-1]]=u},n=(c,u,d)=>{let h=i.get(c);h&&d.includes(h)&&t(u,h)};n("mode","affichage.mode",["exploitation","immersion","briefing"]),n("qualite","affichage.qualite",["auto","haute","moyenne","basse"]),n("rendu","affichage.rendu",["3d","2d"]),n("anim","affichage.animations",["auto","actives","reduites","suspendues"]),n("source","donnees.source",["demo","script","json","csv"]),n("scenario","demo.scenario",["normal","objectif","incident","ancienne","interrompue","vide"]),n("horloge","demo.horloge",["auto","reelle"]),i.get("perf")==="1"&&t("affichage.perf",!0);let s=i.get("fichier");s&&/^[\w./-]+\.js$/.test(s)&&!s.includes("..")&&t("donnees.fichier",s);let r=i.get("url");r&&/^(https?:\/\/|[\w./-]+$)/.test(r)&&t("donnees.url",r);let a=Number(i.get("actualisation"));a>=10&&t("donnees.actualisation",a);let o={};/^\d{4}-\d{2}-\d{2}$/.test(i.get("date")||"")&&(o.date=i.get("date")),["jour","semaine","mois"].includes(i.get("periode"))&&(o.periode=i.get("periode")),i.get("equipe")&&(o.equipe=i.get("equipe"));let l=i.get("heure");return{reglages:e,filtres:o,heureForcee:/^\d{2}:\d{2}$/.test(l||"")?l:null,webgl:i.get("webgl")!=="0"}}function Gu(){let i=Zf(),e=Yf(),t=as(rs,e||{});return{reglages:as(t,i.reglages),memorises:e,url:i}}var pn=i=>{if(typeof i!="string")return null;let e=/^(\d{1,2}):(\d{2})/.exec(i);return e?Number(e[1])*60+Number(e[2]):null},vt=i=>{let e=Math.max(0,Math.round(i));return`${String(Math.floor(e/60)%24).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`},Kt=i=>`${i.getFullYear()}-${String(i.getMonth()+1).padStart(2,"0")}-${String(i.getDate()).padStart(2,"0")}`,fi=i=>{let[e,t,n]=i.split("-").map(Number);return new Date(e,t-1,n,12,0,0)},ar=i=>i.getHours()*60+i.getMinutes()+i.getSeconds()/60,Jf=(i,e,t,n)=>Math.max(0,Math.min(e,n)-Math.max(i,t));function Bi(i,e){let t=e&&e!=="toutes"?i.filter(a=>a.id===e):i;if(!t.length)return null;let n=Math.min(...t.map(a=>pn(a.debut))),s=Math.max(...t.map(a=>pn(a.fin))),r=t.flatMap(a=>(a.pauses||[]).map(([o,l])=>[pn(o),pn(l)]));return{debut:n,fin:s,pauses:r,equipes:t}}function an(i,e,t){if(!i)return 0;let n=Math.max(e,i.debut),s=Math.min(t,i.fin);if(s<=n)return 0;let r=s-n;for(let[a,o]of i.pauses)r-=Jf(n,s,a,o);return Math.max(0,r)}function pi(i,e){let t=fi(i),n=[];if(e==="semaine"){let s=new Date(t);s.setDate(t.getDate()-(t.getDay()+6)%7);for(let r=0;r<5;r++){let a=new Date(s);a.setDate(s.getDate()+r),n.push(Kt(a))}}else if(e==="mois"){let s=new Date(t.getFullYear(),t.getMonth(),1,12);for(;s.getMonth()===t.getMonth();)s.getDay()!==0&&s.getDay()!==6&&n.push(Kt(s)),s.setDate(s.getDate()+1)}else n.push(i);return n}var ql=i=>{let e=fi(i).getDay();return e!==0&&e!==6};var os=5;function jl(i){let e=2166136261;for(let t=0;t<i.length;t++)e^=i.charCodeAt(t),e=Math.imul(e,16777619);return e>>>0}function Xl(i){let e=i>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function $u(i,e){let t=e.reduce((r,a)=>r+a,0)||1,n=0,s=0;return e.map(r=>{n+=r/t*i;let a=Math.round(n)-s;return s+=a,a})}function Wu(i,e,t){let{equipes:n,objectifs:s}=e,r=Xl(jl(`pmc-${i}`)),a={matin:13,"apres-midi":12},o={date:i,equipes:[]};for(let u of n){let d=Xl(jl(`pmc-${i}-${u.id}`)),h=Bi(n,u.id),p=a[u.id]??11,g=3,y=t==="objectif"?0:Math.floor(d()*d()*3.2),m=p-y,f=p-g-y,S=f*s.quotaLignes,w=t==="objectif"?1.075:.9+d()*.15,M=Math.round(S*w),E=3.7+d()*.7,x=.021+d()*.011,R=.08+d()*.07,_=[],T=1;for(let L=h.debut;L<h.fin;L+=os){let z=L-h.debut,I=h.fin-L;T=.75*T+.25*(.88+d()*.24);let B=z<15?.5:z<35?.85:I<=25?.72:1,W=an(h,L,L+os)/os;B*=W*T,_.push({m:L,w:B})}let C=$u(M,_.map(L=>L.w)),P=$u(Math.round(M/E),_.map((L,z)=>C[z]));_.forEach((L,z)=>{L.lignes=C[z],L.colis=P[z],L.tau=x}),o.equipes.push({id:u.id,nom:u.nom,f:h,prevu:p,present:m,prep:f,prepPrevu:p-g,objectif:S,creneaux:_,partErreur:R,lpc:E})}let l=o.equipes.reduce((u,d)=>u+d.creneaux.reduce((h,p)=>h+p.lignes,0),0),c=Math.round(l*(.965+r()*.025));return o.carnetInitial=Math.round(l*(.4+r()*.05)),o.arriveesTotal=c-o.carnetInitial,o.finArrivees=pn("16:30"),o.debutJour=Math.min(...o.equipes.map(u=>u.f.debut)),o}function Xu(i,e){let t=0;for(let r of i.equipes)for(let a of r.creneaux){if(a.m>=e)break;t+=Math.round(a.lignes*Math.min(1,(e-a.m)/os))}let n=Math.max(0,Math.min(1,(e-i.debutJour)/(i.finArrivees-i.debutJour))),s=Math.round(i.arriveesTotal*(1-Math.pow(1-n,1.25)));return Math.max(0,i.carnetInitial+s-t)}function Kf(i,e,t){let n=t==="incident"&&i.m>=e-40&&i.m<e;return{tau:n?.115:i.tau,incident:n}}function qu(i,e,t,n){let s=t==="toutes"?i.equipes:i.equipes.filter(u=>u.id===t),r={lignes:0,colis:0,rejets:0,erreurs:0},a=new Map,o=0;for(let u of s){let d=0,h=0;for(let p of u.creneaux){if(p.m>=e)break;let g=Math.min(1,(e-p.m)/os),y=Math.round(p.lignes*g),m=Math.round(p.colis*g),{tau:f,incident:S}=Kf(p,e,n);d+=m*f;let w=Math.floor(d);d-=w,h+=w*(S?.32:u.partErreur);let M=Math.floor(h);h-=M,r.lignes+=y,r.colis+=m,r.rejets+=w,r.erreurs+=M,p.m>=e-45&&(o+=w);let E=Math.floor(p.m/60)*60,x=a.get(E)||{lignes:0,colis:0,rejets:0,erreurs:0};x.lignes+=y,x.colis+=m,x.rejets+=w,x.erreurs+=M,a.set(E,x)}}let l=Xu(i,e),c=Math.round(3+o*.8);return{v:r,heures:a,charge:l,attente:c,eqs:s}}function Qf({maintenant:i,debutSession:e,demo:t,heureForcee:n,f:s,jour:r,scenario:a,equipeId:o,estAujourdhui:l}){if(!l)return s.fin;let c=(i-e)/6e4;if(n)return pn(n)+c;if(a==="objectif"){let h=o==="toutes"?r.equipes:r.equipes.filter(m=>m.id===o),p=h.reduce((m,f)=>m+f.objectif,0),g=0,y=h.flatMap(m=>m.creneaux).sort((m,f)=>m.m-f.m);for(let m of y){if(g+m.lignes>=p){let f=(p-g)/Math.max(1,m.lignes);return m.m+f*os-1.6+c}g+=m.lignes}}let u=ar(i);if(t.horloge==="reelle"||u>=s.debut+20&&u<s.fin-10)return u;let d=o==="apres-midi"?pn("15:12"):s.debut+Math.min(276,(s.fin-s.debut)*.62);return Math.min(s.fin-1,d+c)}var ju=0;function Yu({filtres:i,cfg:e,maintenant:t=new Date,debutSession:n=Date.now(),heureForcee:s=null}){let r=e.demo.scenario;if(ju+=1,r==="vide")return null;if(r==="interrompue"&&ju>1)throw new Error("D\xE9lai d\xE9pass\xE9 : la source de donn\xE9es ne r\xE9pond pas (sc\xE9nario de d\xE9monstration).");let a=Kt(t),{date:o,periode:l,equipe:c}=i,u=Bi(e.equipes,c),d=pi(o,l).filter(ql);if(!u||!d.length||d[0]>a)return null;let h=d.includes(a)?a:d[d.length-1],p=Wu(h,e,r),g=Qf({maintenant:t,debutSession:n,demo:e.demo,heureForcee:s,f:u,jour:p,scenario:r,equipeId:c,estAujourdhui:h===a}),y=vt(g),m=new Date(t);r==="ancienne"&&m.setMinutes(m.getMinutes()-34);let f={source:"D\xE9monstration \u2014 mod\xE8le fictif",genereLe:m.toISOString(),date:o,periode:l,equipe:c,heure:y,heureSimulee:h===a&&Math.abs(g-ar(t))>1,debut:vt(u.debut),fin:vt(u.fin),demo:!0,objectifMethode:`D\xE9monstration : pr\xE9parateurs \xD7 ${e.objectifs.quotaLignes} lignes (quota valid\xE9, PARAMETRES B5) pour chaque \xE9quipe du filtre ; une \xE9quipe qui n\u2019a pas encore pris son poste est compt\xE9e \xE0 son effectif pr\xE9vu.`};if(l==="jour"){if(!ql(o))return null;let x=qu(p,g,c,r),R=x.eqs.reduce((C,P)=>C+P.objectif,0),_=x.eqs.filter(C=>C.f.debut<=g),T=[];for(let C=Math.floor(u.debut/60)*60;C<u.fin;C+=60){let P=x.heures.get(C),L=x.eqs.reduce((z,I)=>z+I.objectif*an(I.f,C,C+60)/Math.max(1,an(I.f,I.f.debut,I.f.fin)),0);T.push(P&&C<g?{t:vt(C),lignes:P.lignes,colis:P.colis,rejets:P.rejets,erreurs:P.erreurs,charge:Xu(p,Math.min(g,C+60)),objectif:Math.round(L),partiel:C+60>g}:{t:vt(C),lignes:null,colis:null,rejets:null,erreurs:null,objectif:Math.round(L)})}return{version:1,meta:f,valeurs:{lignesPreparees:x.v.lignes,objectifLignes:R,colisControles:x.v.colis,rejetsConvoyeur:x.v.rejets,colisEnAttenteRejet:g>u.debut?x.attente:0,colisProduits:Math.max(0,x.v.colis-(g>u.debut?x.attente:0)),objectifColis:e.objectifs.objectifColis,chargeRestante:x.charge,erreursDecelees:x.v.erreurs,erreursAverees:null,effectifPresent:_.length?_.reduce((C,P)=>C+P.present,0):null,effectifPrevu:_.length?_.reduce((C,P)=>C+P.prevu,0):null,preparateursPresents:_.length?_.reduce((C,P)=>C+P.prep,0):null},serie:T,equipes:p.equipes.map(C=>({id:C.id,nom:C.nom,debut:vt(C.f.debut),fin:vt(C.f.fin),enPoste:C.f.debut<=g&&g<C.f.fin,effectifPresent:C.f.debut<=g?C.present:null,effectifPrevu:C.prevu,preparateursPresents:C.f.debut<=g?C.prep:null,preparateursPrevus:C.prepPrevu,objectifLignes:C.objectif}))}}let S=[],w={lignes:0,colis:0,rejets:0,erreurs:0,averees:0,obj:0,pres:0,prev:0,prep:0,n:0},M=null,E=0;for(let x of d){let R=x===h?p:Wu(x,e,r==="objectif"?"normal":r),T=(c==="toutes"?R.equipes:R.equipes.filter(B=>B.id===c)).reduce((B,W)=>B+W.objectif,0);if(w.obj+=T,x>a){S.push({t:x,lignes:null,colis:null,rejets:null,erreurs:null,objectif:T});continue}let C=x===a?g:u.fin,P=qu(R,C,c,x===a?r:"normal"),L=Xl(jl(`pmc-av-${x}`)),z=x<=Kt(new Date(t.getTime()-2*864e5))?Math.round(P.v.lignes*(12e-5+L()*12e-5)):0;w.lignes+=P.v.lignes,w.colis+=P.v.colis,w.rejets+=P.v.rejets,w.erreurs+=P.v.erreurs,w.averees+=z;let I=P.eqs.filter(B=>B.f.debut<=C);I.length&&(w.pres+=I.reduce((B,W)=>B+W.present,0),w.prev+=I.reduce((B,W)=>B+W.prevu,0),w.prep+=I.reduce((B,W)=>B+W.prep,0),w.n+=1),M=P.charge,E=x===a?P.attente:0,S.push({t:x,lignes:P.v.lignes,colis:P.v.colis,rejets:P.v.rejets,erreurs:P.v.erreurs,objectif:T,partiel:x===a&&g<u.fin})}return{version:1,meta:f,valeurs:{lignesPreparees:w.lignes,objectifLignes:w.obj,colisControles:w.colis,rejetsConvoyeur:w.rejets,colisEnAttenteRejet:E,colisProduits:Math.max(0,w.colis-E),objectifColis:null,chargeRestante:M,erreursDecelees:w.erreurs,erreursAverees:w.averees||null,effectifPresent:w.n?Math.round(w.pres/w.n*10)/10:null,effectifPrevu:w.n?Math.round(w.prev/w.n*10)/10:null,preparateursPresents:w.n?Math.round(w.prep/w.n*10)/10:null,effectifMoyen:!0},serie:S}}var ep={lignesPreparees:"lignes",objectifLignes:"lignes",colisProduits:"colis",objectifColis:"colis",chargeRestante:"lignes",colisControles:"colis",rejetsConvoyeur:"colis",colisEnAttenteRejet:"colis",erreursDecelees:"erreurs",erreursAverees:"litiges",effectifPresent:"personnes",effectifPrevu:"personnes",preparateursPresents:"personnes"},zi=i=>{if(i==null||i==="")return null;if(typeof i=="number")return Number.isFinite(i)?i:null;let e=Number(String(i).replace(/\s| | /g,"").replace(",","."));return Number.isFinite(e)?e:null};function Zu(i,e){if(!i||typeof i!="object")throw new Error("Instantan\xE9 vide ou illisible.");if(!i.valeurs||typeof i.valeurs!="object")throw new Error("Champ \xAB valeurs \xBB absent : le fichier ne suit pas le format normalis\xE9.");let t=[],n={...i.meta||{}};n.periode=n.periode||(e==null?void 0:e.periode)||"jour",n.equipe=n.equipe||(e==null?void 0:e.equipe)||"toutes",n.date=n.date||(e==null?void 0:e.date),n.genereLe||t.push("Horodatage \xAB meta.genereLe \xBB absent : l\u2019anciennet\xE9 des donn\xE9es ne peut pas \xEAtre contr\xF4l\xE9e.");let s={};for(let a of Object.keys(ep))s[a]=zi(i.valeurs[a]);s.effectifMoyen=!!i.valeurs.effectifMoyen;let r=Array.isArray(i.serie)?i.serie.filter(a=>a&&a.t).map(a=>({t:String(a.t),lignes:zi(a.lignes),colis:zi(a.colis),rejets:zi(a.rejets),erreurs:zi(a.erreurs),charge:zi(a.charge),objectif:zi(a.objectif),partiel:!!a.partiel})):[];return r.length||t.push("Aucune s\xE9rie horaire : courbe de production indisponible."),{version:1,meta:n,valeurs:s,serie:r,equipes:Array.isArray(i.equipes)?i.equipes:null,priorites:Array.isArray(i.priorites)?i.priorites.filter(Boolean).map(String):null,securite:i.securite&&typeof i.securite=="object"?i.securite:null,avertissements:t}}function da(i,e){if(!i)return null;let t=Array.isArray(i)?i:Array.isArray(i.instantanes)?i.instantanes:[i],n=s=>{var r,a,o;return(!((r=s.meta)!=null&&r.date)||s.meta.date===e.date)&&(!((a=s.meta)!=null&&a.periode)||s.meta.periode===e.periode)&&(!((o=s.meta)!=null&&o.equipe)||s.meta.equipe===e.equipe)};return t.find(n)||null}function tp(i){let e=i.split(/\r?\n/).find(n=>n.trim())||"",t=n=>e.split(n).length;return[";",",","	","|"].sort((n,s)=>t(s)-t(n))[0]}function Yl(i,e="auto"){let t=e==="auto"?tp(i):e,n=[],s="",r=[],a=!1,o=i.replace(/^﻿/,"");for(let c=0;c<o.length;c++){let u=o[c];a?u==='"'&&o[c+1]==='"'?(s+='"',c++):u==='"'?a=!1:s+=u:u==='"'?a=!0:u===t?(r.push(s),s=""):u===`
`||u==="\r"?(u==="\r"&&o[c+1]===`
`&&c++,r.push(s),s="",r.some(d=>d.trim()!=="")&&n.push(r),r=[]):s+=u}(s!==""||r.length)&&(r.push(s),r.some(c=>c.trim()!=="")&&n.push(r));let l=(n.shift()||[]).map(c=>c.trim());return{separateur:t,entetes:l,lignes:n.map(c=>Object.fromEntries(l.map((u,d)=>[u,(c[d]??"").trim()])))}}var Ju=i=>{if(i==null||String(i).trim()==="")return null;let e=Number(String(i).replace(/\s| | /g,"").replace(",","."));return Number.isFinite(e)?e:null};function np(i){let e=String(i||"").trim(),t=null,n=/(\d{4})-(\d{2})-(\d{2})/.exec(e);n&&(t=`${n[1]}-${n[2]}-${n[3]}`),n=!t&&/(\d{2})\/(\d{2})\/(\d{4})/.exec(e),n&&(t=`${n[3]}-${n[2]}-${n[1]}`);let s=/(\d{1,2})[:h](\d{2})/.exec(e);return{date:t,minutes:s?Number(s[1])*60+Number(s[2]):null}}function Zl(i,e,t,n){let{entetes:s,lignes:r,separateur:a}=Yl(i,e.separateur||"auto"),o=e.colonnes||{},l=Object.entries(o).filter(([,S])=>S&&!s.includes(S)).map(([S,w])=>`${S} \u2192 \xAB ${w} \xBB`);if(!s.includes(o.horodatage))throw new Error(`Colonne d'horodatage \xAB ${o.horodatage} \xBB introuvable. Colonnes lues : ${s.join(", ")}.`);let c=new Map,u={},d=null,h=null;for(let S of r){let{date:w,minutes:M}=np(S[o.horodatage]);if(M===null||w&&(t!=null&&t.date)&&w!==t.date)continue;h=h||w;let E=Math.floor(M/60)*60,x=c.get(E)||{lignes:null,colis:null,rejets:null,erreurs:null,produits:null};for(let R of["lignes","colis","rejets","erreurs","produits"]){let _=o[R]?Ju(S[o[R]]):null;_!==null&&(x[R]=(x[R]||0)+_)}c.set(E,x);for(let R of["charge","attente","effectif","effectifPrevu","preparateurs"]){let _=o[R]?Ju(S[o[R]]):null;_!==null&&(u[R]=_)}d=Math.max(d??0,M)}if(!c.size)throw new Error("Aucune ligne exploitable pour la date s\xE9lectionn\xE9e.");let p=[...c.keys()].sort((S,w)=>S-w),g=p.map(S=>({t:vt(S),...c.get(S),partiel:!1}));d!==null&&g.length&&d%60!==0&&d-p[p.length-1]<59&&(g[g.length-1].partiel=!0);let y=S=>g.some(w=>w[S]!==null)?g.reduce((w,M)=>w+(M[S]||0),0):null,m=y("colis"),f=y("produits");return g.forEach(S=>{delete S.produits}),{snap:{version:1,meta:{source:n,genereLe:null,date:h||(t==null?void 0:t.date),periode:"jour",equipe:(t==null?void 0:t.equipe)||"toutes",heure:d!==null?vt(d):null},valeurs:{lignesPreparees:y("lignes"),colisControles:m,rejetsConvoyeur:y("rejets"),erreursDecelees:y("erreurs"),colisEnAttenteRejet:u.attente??null,colisProduits:f,chargeRestante:u.charge??null,effectifPresent:u.effectif??null,effectifPrevu:u.effectifPrevu??null,preparateursPresents:u.preparateurs??null},serie:g},info:{separateur:a,entetes:s,nbLignes:r.length,manquantes:l}}}var Jl=15e3;function Kl(i,e,t){return Promise.race([i,new Promise((n,s)=>setTimeout(()=>s(new Error(t)),e))])}function ip(i,e){return new Promise((t,n)=>{if(!/^[A-Za-z_$][\w$]*$/.test(e)){n(new Error(`Nom de variable invalide : ${e}`));return}let s=document.querySelector("script[data-pick-source]");s&&s.remove();try{window[e]=void 0}catch{}let r=document.createElement("script");r.dataset.pickSource="1",r.src=`${i}${i.includes("?")?"&":"?"}t=${Date.now()}`,r.onload=()=>{let a=window[e];a===void 0?n(new Error(`Le fichier ${i} a \xE9t\xE9 lu mais ne d\xE9finit pas window.${e}.`)):t(a)},r.onerror=()=>n(new Error(`Fichier introuvable ou illisible : ${i}`)),document.head.appendChild(r)})}function Ku(i){let e=i.indexOf("{"),t=i.lastIndexOf("}"),n=i.indexOf("["),s=n!==-1&&(e===-1||n<e)?n:e,r=s===n?i.lastIndexOf("]"):t;if(s===-1||r<=s)throw new Error("Aucun objet de donn\xE9es trouv\xE9 dans le fichier JS.");try{return JSON.parse(i.slice(s,r+1))}catch{throw new Error("Le contenu du fichier JS n\u2019est pas du JSON strict : exporter les donn\xE9es au format JSON, ou utiliser le mod\xE8le donnees/pick_data.exemple.js.")}}function Qu(i,e){var s;let t=(i.split(".").pop()||"").toLowerCase(),n={nom:i,type:t,taille:e.length,cles:[],entetes:[],exemples:[],avertissement:null};try{if(t==="csv"||t==="txt"){let o=Yl(e);return n.separateur=o.separateur,n.entetes=o.entetes,n.exemples=o.lignes.slice(0,3),n.nbLignes=o.lignes.length,n}let r=t==="js"?Ku(e):JSON.parse(e),a=(o,l="",c=0)=>{if(c>3||o===null||typeof o!="object")return;let u=Array.isArray(o)?o.length?[["[0]",o[0]]]:[]:Object.entries(o).slice(0,40);for(let[d,h]of u){let p=l?`${l}.${d}`:d,g=Array.isArray(h)?`liste (${h.length})`:h===null?"null":typeof h;n.cles.push({chemin:p,type:g,exemple:typeof h=="object"?"":String(h).slice(0,40)}),a(h,p,c+1)}};a(r),n.normalise=!!(r&&(r.valeurs||r.instantanes||Array.isArray(r)&&((s=r[0])!=null&&s.valeurs))),n.normalise||(n.avertissement="Structure diff\xE9rente du format normalis\xE9 : un adaptateur est n\xE9cessaire (voir donnees/LISEZMOI.md \u203A Adaptateurs).")}catch(r){n.avertissement=r.message}return n}var fa=class{constructor(){this.importe=null,this.debutSession=Date.now(),this.heureForcee=null}libelle(e){let t=e.donnees;return{demo:"D\xE9monstration (donn\xE9es fictives)",script:`Fichier ${t.fichier}`,json:t.url?`JSON ${t.url}`:"JSON (adresse non renseign\xE9e)",csv:t.url?`CSV ${t.url}`:"CSV (adresse non renseign\xE9e)",fichier:this.importe?`Import manuel : ${this.importe.nom}`:"Import manuel (aucun fichier)"}[t.source]||t.source}actualisable(e){return e.donnees.source!=="fichier"}async charger(e,t){var o,l;let n=t.donnees,s;switch(n.source){case"demo":s=Yu({filtres:e,cfg:t,maintenant:new Date,debutSession:this.debutSession,heureForcee:this.heureForcee});break;case"script":{let c=await Kl(ip(n.fichier,n.variable||"PICK_MC_DATA"),Jl,`D\xE9lai d\xE9pass\xE9 en lisant ${n.fichier}`);s=da(c,e);break}case"json":{if(!n.url)throw new Error("Adresse JSON non renseign\xE9e (R\xE9glages \u203A Donn\xE9es).");let c=await Kl(fetch(n.url,{cache:"no-store"}),Jl,"D\xE9lai d\xE9pass\xE9 : la source JSON ne r\xE9pond pas.");if(!c.ok)throw new Error(`Source JSON : r\xE9ponse ${c.status}`);s=da(await c.json(),e);break}case"csv":{if(!n.url)throw new Error("Adresse CSV non renseign\xE9e (R\xE9glages \u203A Donn\xE9es).");let c=await Kl(fetch(n.url,{cache:"no-store"}),Jl,"D\xE9lai d\xE9pass\xE9 : la source CSV ne r\xE9pond pas.");if(!c.ok)throw new Error(`Source CSV : r\xE9ponse ${c.status}`);let{snap:u}=Zl(await c.text(),n.csv,e,n.url);u.meta.genereLe=c.headers.get("last-modified")?new Date(c.headers.get("last-modified")).toISOString():null,s=u;break}case"fichier":{if(!this.importe)return null;let{nom:c,texte:u,date:d}=this.importe,h=c.split(".").pop().toLowerCase();if(h==="csv"||h==="txt"){let{snap:p}=Zl(u,n.csv,e,c);p.meta.genereLe=d||null,s=p}else s=da(h==="js"?Ku(u):JSON.parse(u),e);break}default:throw new Error(`Source inconnue : ${n.source}`)}if(!s)return null;let r=Zu(s,e);n.source!=="demo"&&(r.meta.demo=!1);let a=`${n.source==="fichier"?((o=this.importe)==null?void 0:o.nom)||"":n.source==="script"?n.fichier:n.url}`;return r.meta.exemple=!!((l=s.meta)!=null&&l.exemple)||/exemple/i.test(a),r}};var nt=i=>typeof i=="number"&&Number.isFinite(i)?i:null,eh=(i,e)=>nt(i)!==null&&nt(e)?i/e:null;function sp(i,e,t){let n=e,s=t;for(;s>0&&n<i.fin;){let r=i.pauses.find(([l,c])=>n>=l&&n<c);if(r){n=r[1];continue}let a=Math.min(i.fin,...i.pauses.filter(([l])=>l>n).map(([l])=>l)),o=a-n;if(o>=s)return n+s;s-=o,n=a}return s>0?null:n}function th(i,e,t,n=new Date){if(!i)return{disponible:!1};let s=i.valeurs,r=i.meta.periode||t.periode,a=Bi(e.equipes,t.equipe),o=Bi(e.equipes,"toutes"),l=r==="jour",c=i.meta.genereLe?new Date(i.meta.genereLe):null,u=pn(i.meta.heure);u===null&&c&&!Number.isNaN(c.getTime())&&(u=c.getHours()*60+c.getMinutes());let d=l&&i.meta.date===Kt(n)&&u!==null&&a&&u<a.fin;l&&u===null&&(u=a?a.fin:null);let h=e.objectifs.quotaLignes/e.objectifs.heuresRef,p=nt(s.objectifLignes),g=p!==null?"source":null;p===null&&e.objectifs.mode==="quota"&&nt(s.preparateursPresents)!==null&&l&&(p=Math.round(s.preparateursPresents*e.objectifs.quotaLignes),g="quota"),p===null&&e.objectifs.mode==="fixe"&&l&&(p=e.objectifs.objectifFixe,g="fixe");let y={source:i.meta.objectifMethode||"Objectif transmis par la source de donn\xE9es.",quota:`Objectif calcul\xE9 : ${s.preparateursPresents} pr\xE9parateurs pr\xE9sents \xD7 ${e.objectifs.quotaLignes} lignes (quota valid\xE9, PARAMETRES B5).`,fixe:`Objectif fixe d\xE9fini dans les r\xE9glages : ${e.objectifs.objectifFixe} lignes / jour.`}[g]||"Objectif indisponible : ni objectif transmis, ni effectif de pr\xE9parateurs.",m=i.serie||[],f=m.map(se=>nt(se.objectif)),S=f.every(se=>se!==null)&&m.length?f:null,w=null,M="";if(p!==null){if(l&&a&&u!==null){let se=an(a,a.debut,a.fin);w=Math.round(p*an(a,a.debut,u)/Math.max(1,se)),M=`objectif \xD7 temps productif \xE9coul\xE9 (${Math.round(an(a,a.debut,u))} min) \xF7 temps productif du poste (${Math.round(se)} min), pauses exclues`}else if(!l&&S){let se=Kt(n);w=0,m.forEach((oe,le)=>{oe.t<se?w+=S[le]:oe.t===se&&a&&u!==null&&(w+=S[le]*an(a,a.debut,u)/Math.max(1,an(a,a.debut,a.fin)))}),w=Math.round(w),M="somme des objectifs des jours \xE9coul\xE9s + part \xE9coul\xE9e du jour en cours"}}let E=nt(s.lignesPreparees),x=E!==null&&w!==null?E-w:null,R=x!==null&&w>0?x/w*100:null,_=eh(E,p),T=null;for(let se=m.length-1;se>=0;se--)if(nt(m[se].lignes)!==null&&!m[se].partiel){T=m[se];break}let C=m.filter(se=>nt(se.lignes)!==null&&!se.partiel),P=l&&T?T.lignes:null,L=l&&T?nt(T.colis):null,z=l&&C.length&&C.every(se=>nt(se.colis)!==null)?C.reduce((se,oe)=>se+oe.colis,0)/C.length:null,I=l&&a&&u!==null?an(a,u,a.fin)/60:null,B=p!==null&&E!==null?Math.max(0,p-E):null,W=B!==null&&I>.05?B/I:null,X=null,re="";if(l&&o&&u!==null&&d){let se=Array.isArray(i.equipes)&&i.equipes.length?i.equipes:null;if(se){X=0;let oe=[];for(let le of se){let Te=Bi(e.equipes,le.id)||o,Re=nt(le.preparateursPresents)??nt(le.preparateursPrevus);if(Re===null){X=null;break}let Ge=an(Te,u,Te.fin)/60;X+=Re*h*Ge,Ge>0&&oe.push(`${le.nom||le.id} : ${Re} pr\xE9p. \xD7 ${Ge.toFixed(1).replace(".",",")} h`)}X!==null&&(X=Math.round(X),re=`${oe.join(" + ")} \xD7 ${h.toFixed(1).replace(".",",")} lignes/h (quota ${e.objectifs.quotaLignes} \xF7 ${String(e.objectifs.heuresRef).replace(".",",")} h). \xC9quipe \xE0 venir compt\xE9e \xE0 l\u2019effectif pr\xE9vu.`)}else if(nt(s.preparateursPresents)!==null&&o){let oe=an(o,u,o.fin)/60;X=Math.round(s.preparateursPresents*h*oe),re=`${s.preparateursPresents} pr\xE9parateurs \xD7 ${oe.toFixed(1).replace(".",",")} h productives restantes \xD7 ${h.toFixed(1).replace(".",",")} lignes/h.`}}let q=nt(s.chargeRestante),te=q!==null&&X?q/X*100:null,ie=null;if(l&&d&&q!==null&&P&&o){let se=q/P*60,oe=sp(o,u,se);ie={heure:oe===null?null:vt(oe),auDela:oe===null,heures:q/P,methode:`charge restante (${q} lignes) \xF7 cadence de la derni\xE8re heure compl\xE8te (${P} lignes/h), pauses exclues.`}}let Ce=nt(s.colisControles),xe=nt(s.rejetsConvoyeur),st=eh(xe,Ce),qe=null;if(l&&T){let se=m.indexOf(T),oe=m.slice(se).filter(Re=>nt(Re.rejets)!==null&&nt(Re.colis)!==null),le=oe.reduce((Re,Ge)=>Re+Ge.colis,0),Te=oe.reduce((Re,Ge)=>Re+Ge.rejets,0);le>0&&(qe={depuis:T.t,colis:le,rejets:Te,taux:Te/le})}let Ze=nt(s.erreursDecelees),Z=Ze!==null&&E?Math.round(Ze/E*1e6):null,ee=nt(s.erreursAverees),be=ee!==null&&E?Math.round(ee/E*1e6):null,Be=nt(s.effectifPresent),N=nt(s.effectifPrevu),H={type:l?"heure":"jour",reel:[],objectif:[],barres:[],etiquettes:[]};if(l&&a){let se=0,oe=0;H.reel.push({x:a.debut,y:0}),H.objectif.push({x:a.debut,y:0}),m.forEach((le,Te)=>{let Re=pn(le.t);if(Re===null)return;let Ge=Math.min(a.fin,Re+60),lt=S?S[Te]:p!==null?p*an(a,Re,Ge)/Math.max(1,an(a,a.debut,a.fin)):null;lt!==null&&(oe+=lt,H.objectif.push({x:Ge,y:oe})),nt(le.lignes)!==null&&(se+=le.lignes,H.reel.push({x:le.partiel&&u!==null?Math.min(Ge,u):Ge,y:se})),H.barres.push({x0:Math.max(a.debut,Re),x1:Ge,y:nt(le.lignes),partiel:!!le.partiel,objectif:lt})}),(!H.objectif.length||H.objectif.length<2)&&(H.objectif=[]),H.domaine=[a.debut,a.fin]}else{let se=0,oe=0;m.forEach((le,Te)=>{nt(le.objectif)!==null&&(oe+=le.objectif,H.objectif.push({x:Te+1,y:oe})),nt(le.lignes)!==null&&(se+=le.lignes,H.reel.push({x:Te+1,y:se})),H.barres.push({x0:Te,x1:Te+1,y:nt(le.lignes),partiel:!!le.partiel,objectif:nt(le.objectif),t:le.t})}),H.reel.length&&H.reel.unshift({x:0,y:0}),H.objectif.length&&H.objectif.unshift({x:0,y:0}),H.domaine=[0,Math.max(1,m.length)]}return{disponible:!0,periode:r,estJour:l,enCours:d,heure:u,fenetre:a,genere:c,lignes:{valeur:E,objectif:p,objectifMethode:g,objectifTexte:y,attendu:w,attenduMethode:M,ecart:x,ecartPct:R,pctObjectif:_,cadence:P,rythmeRequis:W,resteObjectif:B,heuresRestantes:I,derniere:T},production:{valeur:nt(s.colisProduits),objectif:nt(s.objectifColis),debit:L,debitMoyen:z,controles:Ce},charge:{valeur:q,capacite:X,capaciteMethode:re,ratio:te,finEstimee:ie},rejets:{valeur:xe,controles:Ce,taux:st,recent:qe,attente:nt(s.colisEnAttenteRejet)},qualite:{ppm:Z,erreurs:Ze,lignes:E,averees:ee,ppmAveree:be},effectif:{present:Be,prevu:N,absents:Be!==null&&N!==null?Math.max(0,N-Be):null,preparateurs:nt(s.preparateursPresents),moyen:!!s.effectifMoyen,equipes:i.equipes},serie:H,serieBrute:m}}var rp=new Intl.NumberFormat("fr-FR",{maximumFractionDigits:0}),A_=new Intl.NumberFormat("fr-FR",{minimumFractionDigits:1,maximumFractionDigits:1}),ls="\u2014",Y=(i,e=0)=>i==null||!Number.isFinite(i)?ls:e?new Intl.NumberFormat("fr-FR",{minimumFractionDigits:e,maximumFractionDigits:e}).format(i):rp.format(Math.round(i)),Jn=(i,e=0)=>{if(i==null||!Number.isFinite(i))return ls;let t=Y(Math.abs(i),e);return i>0?`+${t}`:i<0?`\u2212${t}`:t},Gt=(i,e=0)=>i==null||!Number.isFinite(i)?ls:`${Y(i*100,e)} %`;var nh=i=>{if(i===null||!Number.isFinite(i))return ls;let e=Math.round(i*60),t=Math.floor(e/60);return t?`${t} h ${String(e%60).padStart(2,"0")}`:`${e} min`},ap=["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],ih=["janvier","f\xE9vrier","mars","avril","mai","juin","juillet","ao\xFBt","septembre","octobre","novembre","d\xE9cembre"];var or=i=>`${ap[i.getDay()]} ${i.getDate()} ${ih[i.getMonth()]} ${i.getFullYear()}`;var sh=i=>`${ih[i.getMonth()]} ${i.getFullYear()}`,ki=i=>i.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});var lr=i=>i&&i.charAt(0).toUpperCase()+i.slice(1),pa=(i,e=new Date)=>{let t=Math.max(0,Math.round((e-i)/1e3));if(t<60)return`il y a ${t} s`;let n=Math.round(t/60);if(n<60)return`il y a ${n} min`;let s=Math.floor(n/60);return s<48?`il y a ${s} h ${String(n%60).padStart(2,"0")}`:`il y a ${Math.round(s/24)} jours`},Ve=i=>String(i??"").replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]);var us={critique:2,vigilance:1,conforme:0};function cs(i,e,t=!1){if(i==null)return null;if(t){if(e.critique!==void 0&&i<=e.critique)return"critique";if(i<=e.vigilance)return"vigilance"}else{if(e.critique!==void 0&&i>=e.critique)return"critique";if(i>=e.vigilance)return"vigilance"}return null}function Hi(i,e,t,n,s,r){var l;let a=Jt[i],o=(((l=s.actions)==null?void 0:l[i])||"").trim();return{id:i,regle:i,zone:a.zone,kpi:a.kpi,niveau:e,titre:a.titre,message:t,faits:n,formule:a.formule,validee:a.validee,seuil:r,action:o||null}}function rh(i,e){if(!(i!=null&&i.disponible))return[];let t=e.seuils,n=[],s=i.heure!==null&&i.heure!==void 0?vt(i.heure):"",r=i.lignes;if(r.ecartPct!==null&&r.attendu>0&&r.objectif&&r.attendu>=r.objectif*.04){let g=cs(-r.ecartPct,t.rythme);g&&n.push(Hi("rythme",g,`Pr\xE9paration en retard de ${Y(-r.ecart)} lignes sur le rythme attendu (${Jn(r.ecartPct,1)} %).`,[["Lignes pr\xE9par\xE9es",`${Y(r.valeur)} lignes`],[i.estJour?`Lignes attendues \xE0 ${s}`:"Lignes attendues \xE0 date",`${Y(r.attendu)} lignes`],["\xC9cart",`${Jn(r.ecart)} lignes (${Jn(r.ecartPct,1)} %)`],["Objectif",`${Y(r.objectif)} lignes`],...r.cadence!==null?[["Cadence de la derni\xE8re heure compl\xE8te",`${Y(r.cadence)} lignes/h`]]:[],...r.rythmeRequis!==null?[["Rythme requis pour atteindre l\u2019objectif",`${Y(r.rythmeRequis)} lignes/h`]]:[]],e,`vigilance au-del\xE0 de ${t.rythme.vigilance} % de retard, critique au-del\xE0 de ${t.rythme.critique} %`))}let a=i.charge;if(a.ratio!==null){let g=cs(a.ratio,t.capacite);g&&n.push(Hi("capacite",g,`Charge restante sup\xE9rieure \xE0 la capacit\xE9 restante estim\xE9e (${Y(a.ratio)} %).`,[["Charge restante",`${Y(a.valeur)} lignes`],["Capacit\xE9 restante (estimation)",`${Y(a.capacite)} lignes`],["M\xE9thode",a.capaciteMethode],["Rapport charge / capacit\xE9",`${Y(a.ratio)} %`]],e,`vigilance \xE0 ${t.capacite.vigilance} %, critique \xE0 ${t.capacite.critique} %`))}let o=i.rejets,l=i.estJour&&o.recent&&o.recent.colis>=40?o.recent:null,c=l?l.taux:o.taux;if(c!==null&&(l||(o.controles||0)>=50)){let g=cs(c*100,t.rejetTaux);if(g){let y=l?`depuis ${l.depuis}`:"sur la p\xE9riode";n.push(Hi("rejetTaux",g,`Taux de rejet convoyeur de ${Gt(c,1)} ${y} \u2014 seuil ${Y(t.rejetTaux.vigilance)} %.`,[["Taux \xE9valu\xE9",`${Gt(c,1)} ${y}`],...l?[[`Rejets depuis ${l.depuis}`,`${Y(l.rejets)} rejets / ${Y(l.colis)} colis`]]:[],["Cumul de la p\xE9riode",`${Y(o.valeur)} rejets / ${Y(o.controles)} colis contr\xF4l\xE9s (${Gt(o.taux,1)})`]],e,`vigilance \xE0 ${t.rejetTaux.vigilance} %, critique \xE0 ${t.rejetTaux.critique} %`))}}if(o.attente!==null){let g=cs(o.attente,t.rejetAttente);g&&n.push(Hi("rejetAttente",g,`${Y(o.attente)} colis en attente au poste de rejet (seuil ${t.rejetAttente.vigilance}).`,[["Colis en attente au rejet",`${Y(o.attente)} colis`],["Rejets de la p\xE9riode",`${Y(o.valeur)} colis`]],e,`vigilance \xE0 ${t.rejetAttente.vigilance} colis, critique \xE0 ${t.rejetAttente.critique}`))}let u=i.qualite,d=t.ppmDecelee.minLignes??1e3;if(u.ppm!==null&&(u.lignes||0)>=d){let g=cs(u.ppm,t.ppmDecelee);g&&n.push(Hi("ppmDecelee",g,`PPM d\xE9cel\xE9e \xE0 ${Y(u.ppm)} \u2014 au-dessus du seuil vert de ${Y(t.ppmDecelee.vigilance)}.`,[["Erreurs d\xE9cel\xE9es au rejet",`${Y(u.erreurs)}`],["Lignes pr\xE9par\xE9es",`${Y(u.lignes)}`],["PPM d\xE9cel\xE9e",`${Y(u.ppm)} (= ${Y(u.erreurs)} \xF7 ${Y(u.lignes)} \xD7 1 000 000)`]],e,`vert sous ${Y(t.ppmDecelee.vigilance)} (valid\xE9), critique \xE0 partir de ${Y(t.ppmDecelee.critique)} ; \xE9valu\xE9e d\xE8s ${Y(d)} lignes`))}let h=i.effectif;if(h.absents!==null&&!h.moyen){let g=cs(h.absents,t.effectif);g&&n.push(Hi("effectif",g,`${Y(h.absents)} absent${h.absents>1?"s":""} par rapport \xE0 l\u2019effectif pr\xE9vu.`,[["Effectif pr\xE9sent",`${Y(h.present)} personnes`],["Effectif pr\xE9vu",`${Y(h.prevu)} personnes`],...h.preparateurs!==null?[["Dont pr\xE9parateurs pr\xE9sents",`${Y(h.preparateurs)}`]]:[]],e,`vigilance d\xE8s ${t.effectif.vigilance} absent, critique d\xE8s ${t.effectif.critique}`))}let p=i.production;if(i.estJour&&i.enCours&&p.debit!==null&&p.debitMoyen>0){let g=p.debit/p.debitMoyen*100;g<t.debit.vigilance&&n.push(Hi("debit","vigilance",`D\xE9bit convoyeur de la derni\xE8re heure \xE0 ${Y(g)} % du d\xE9bit moyen du poste.`,[["D\xE9bit derni\xE8re heure compl\xE8te",`${Y(p.debit)} colis/h`],["D\xE9bit horaire moyen du poste",`${Y(p.debitMoyen)} colis/h`]],e,`vigilance sous ${t.debit.vigilance} % du d\xE9bit moyen`))}return n.sort((g,y)=>us[y.niveau]-us[g.niveau])}function ah(i,e){var s,r,a,o,l,c,u;let t={preparation:(s=i==null?void 0:i.lignes)==null?void 0:s.valeur,convoyeur:((r=i==null?void 0:i.production)==null?void 0:r.controles)??((a=i==null?void 0:i.production)==null?void 0:a.valeur),controle:(o=i==null?void 0:i.rejets)==null?void 0:o.controles,rejet:((l=i==null?void 0:i.rejets)==null?void 0:l.attente)??((c=i==null?void 0:i.rejets)==null?void 0:c.valeur),expedition:(u=i==null?void 0:i.production)==null?void 0:u.valeur},n={};for(let d of Zt){let h=e.filter(g=>g.zone===d.id),p=h.reduce((g,y)=>us[y.niveau]>us[g]?y.niveau:g,"conforme");n[d.id]={etat:!(i!=null&&i.disponible)||t[d.id]===null||t[d.id]===void 0?"indisponible":p==="conforme"?"conforme":p,alertes:h}}return n}function oh(i){var e;return i!=null&&i.disponible?{preparation:i.lignes.cadence!==null?[Y(i.lignes.cadence),"lignes/h"]:[Y(i.lignes.valeur),"lignes"],convoyeur:i.production.debit!==null?[Y(i.production.debit),"colis/h"]:[Y(i.production.controles),"colis"],controle:[Gt(((e=i.rejets.recent)==null?void 0:e.taux)??i.rejets.taux,1),"rejet"],rejet:[Y(i.rejets.attente),"en attente"],expedition:[Y(i.production.valeur),"colis"]}:{}}function Ql(i,e,t="moment"){let n=(e||[]).map(a=>(a||"").trim()).filter(Boolean).map((a,o)=>({id:`manuelle-${o}`,origine:"superviseur",texte:a,niveau:"info"})),s=i.map(a=>({id:a.id,origine:"regle",niveau:a.niveau,zone:a.zone,alerte:a,texte:a.action?a.action:a.message,constat:a.message}));return(t==="jour"?[...n,...s]:[...s,...n]).slice(0,3)}function lh(i,e){if(!i)return[];let t=new Map(i.map(n=>[n.id,n]));return e.filter(n=>!t.has(n.id)||us[n.niveau]>us[t.get(n.id).niveau])}var ma=class{constructor(e,t={},n=null,s=null){this.cfg=e,this.memo=s||{},this.connecteur=new fa,this.connecteur.heureForcee=n;let r=Kt(new Date);this.filtres={date:r,periode:"jour",equipe:"toutes",...t},this.snap=null,this.m=null,this.alertes=[],this.zones={},this.statut={etat:"chargement",derniereReussite:null,derniereTentative:null,erreur:null,ageDonnees:null},this.ecouteurs=new Map,this.minuteur=null,this.enCours=!1,this.cleFiltres=null}on(e,t){return this.ecouteurs.has(e)||this.ecouteurs.set(e,new Set),this.ecouteurs.get(e).add(t),()=>this.ecouteurs.get(e).delete(t)}emettre(e,t){(this.ecouteurs.get(e)||[]).forEach(n=>{try{n(t)}catch(s){console.error(`[${e}]`,s)}})}regler(e,{memoriser:t=!0,recharger:n=!1}={}){this.cfg=as(this.cfg,e),t&&(this.memo=as(this.memo,e),Hu(this.memo)),this.emettre("reglages",this.cfg),n?this.actualiser({raison:"reglages"}):this.snap&&this.recalculer()}setFiltres(e){this.filtres={...this.filtres,...e},this.emettre("filtres",this.filtres),this.actualiser({raison:"filtres"})}demarrer(){this.actualiser({raison:"ouverture"}),document.addEventListener("visibilitychange",()=>{if(document.hidden)return;let e=this.cfg.donnees.actualisation*1e3;(!this.statut.derniereTentative||Date.now()-this.statut.derniereTentative>e)&&this.actualiser({raison:"retour"})}),this.horloge=setInterval(()=>this.majStatut(),15e3)}planifier(){if(clearTimeout(this.minuteur),!this.connecteur.actualisable(this.cfg))return;let e=Math.max(10,Number(this.cfg.donnees.actualisation)||120);this.minuteur=setTimeout(()=>{if(document.hidden){this.planifier();return}this.actualiser({raison:"auto"})},e*1e3),this.prochaine=Date.now()+e*1e3}async actualiser({raison:e="manuel"}={}){if(this.enCours)return;this.enCours=!0,this.statut.derniereTentative=Date.now();let t=JSON.stringify(this.filtres),n=t===this.cleFiltres;this.emettre("chargement",{raison:e});try{let s=await this.connecteur.charger(this.filtres,this.cfg);s?(this.statut.derniereReussite=Date.now(),this.statut.erreur=null,this.appliquer(s,{memesFiltres:n,raison:e}),this.statut.etat="ok"):(n||this.appliquer(null,{memesFiltres:n,raison:e}),this.statut.etat="indisponible",this.statut.erreur=n&&this.snap?"La source ne contient plus de donn\xE9es pour ce filtre : derni\xE8res valeurs connues conserv\xE9es.":"Aucune donn\xE9e disponible pour cette date, p\xE9riode et \xE9quipe."),this.cleFiltres=t}catch(s){console.warn("Actualisation impossible :",s),n||(this.appliquer(null,{memesFiltres:n,raison:e}),this.cleFiltres=t),this.statut.etat=this.snap?"interrompue":"indisponible",this.statut.erreur=s.message||String(s)}finally{this.enCours=!1,this.majStatut(),this.planifier()}}recalculer(){this.appliquer(this.snap,{memesFiltres:!0,raison:"recalcul",silencieux:!0})}appliquer(e,{memesFiltres:t,raison:n,silencieux:s=!1}){var d,h,p;let r={m:this.m,alertes:this.alertes};this.snap=e,this.m=th(e,this.cfg,this.filtres,new Date),this.alertes=rh(this.m,this.cfg),this.zones=ah(this.m,this.alertes);let a=!r.m,o=t&&!a&&!s&&((d=r.m)==null?void 0:d.disponible),l=o?lh(r.alertes,this.alertes):[];this.emettre("donnees",{m:this.m,alertes:this.alertes,zones:this.zones,snap:e,premier:a,transition:o||n==="reglages",raison:n}),l.length&&this.emettre("nouvellesAlertes",l);let c=(h=r.m)==null?void 0:h.lignes,u=(p=this.m)==null?void 0:p.lignes;if(o&&c&&u&&u.objectif&&c.valeur!==null&&u.valeur!==null&&c.valeur<c.objectif&&u.valeur>=u.objectif){let g=`pick-mc/objectif/${JSON.stringify(this.filtres)}`,y=!1;try{y=!!sessionStorage.getItem(g),sessionStorage.setItem(g,"1")}catch{}y||this.emettre("objectif",{valeur:u.valeur,objectif:u.objectif})}}majStatut(){var r,a;let e=this.statut,t=(a=(r=this.snap)==null?void 0:r.meta)!=null&&a.genereLe?new Date(this.snap.meta.genereLe):null;e.ageDonnees=t&&!Number.isNaN(t.getTime())?(Date.now()-t.getTime())/6e4:null;let n=Kt(new Date),s=pi(this.filtres.date,this.filtres.periode).includes(n);if(e.etat==="ok"||e.etat==="ancienne"){let o=s&&e.ageDonnees!==null&&e.ageDonnees>this.cfg.donnees.seuilAncien,l=e.derniereReussite&&this.connecteur.actualisable(this.cfg)&&Date.now()-e.derniereReussite>Math.max(this.cfg.donnees.seuilAncien*6e4,this.cfg.donnees.actualisation*3e3);e.etat=o||s&&l?"ancienne":"ok"}e.source=this.connecteur.libelle(this.cfg),e.demo=this.cfg.donnees.source==="demo",e.genere=t,e.prochaine=this.prochaine,this.emettre("statut",e)}};function ot(i){let e=document.createElement("template");return e.innerHTML=i.trim(),e.content.firstElementChild}function ft(i,e){i&&i.textContent!==e&&(i.textContent=e)}function It(i,e){i&&i.__html!==e&&(i.innerHTML=e,i.__html=e)}var Qt={niveau:"plein",ecouteurs:new Set,regler(i){var t,n;let e=(t=window.matchMedia)==null?void 0:t.call(window,"(prefers-reduced-motion: reduce)").matches;this.niveau=i==="suspendues"?"off":i==="reduites"?"reduit":i==="actives"?"plein":e?"reduit":"plein",(n=document.getElementById("app"))==null||n.setAttribute("data-anim",this.niveau),this.ecouteurs.forEach(s=>s(this.niveau))},get plein(){return this.niveau==="plein"}};var ga={outCubic:i=>1-Math.pow(1-i,3),inOutCubic:i=>i<.5?4*i*i*i:1-Math.pow(-2*i+2,3)/2};function ec(i,e,t,n=ga.outCubic){if(!Qt.plein||i<=0)return e(1),t==null||t(),()=>{};let s=performance.now(),r,a=!1,o=l=>{if(a)return;let c=Math.min(1,(l-s)/i);e(n(c)),c<1?r=requestAnimationFrame(o):t==null||t()};return r=requestAnimationFrame(o),()=>{a=!0,cancelAnimationFrame(r)}}var Xe=(i,e="0 0 24 24")=>`<svg viewBox="${e}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${i}</svg>`,Fe={logo:`<svg viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="lg-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a5eeff"/><stop offset="1" stop-color="#1aa7d6"/></linearGradient></defs>
    <circle cx="32" cy="32" r="29" fill="none" stroke="#3cd6ff" stroke-opacity=".28" stroke-width="1.5"/>
    <path d="M32 3 a29 29 0 0 1 25.1 14.5" fill="none" stroke="#3cd6ff" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M32 61 a29 29 0 0 1 -25.1 -14.5" fill="none" stroke="#3cd6ff" stroke-opacity=".6" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M32 15 L47 23.5 V40.5 L32 49 L17 40.5 V23.5 Z" fill="url(#lg-a)" fill-opacity=".14" stroke="url(#lg-a)" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M17 23.5 L32 32 L47 23.5 M32 32 V49" fill="none" stroke="url(#lg-a)" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M24.5 19.2 L39.5 27.7" stroke="#eef7ff" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="57.1" cy="17.5" r="2.6" fill="#eef7ff"/>
  </svg>`,preparation:Xe('<path d="M3 21V4M21 21V4M3 9h18M3 15h18"/><rect x="6" y="5.5" width="4" height="3.5" rx=".5"/><rect x="12.5" y="11" width="5" height="4" rx=".5"/><rect x="6" y="16.5" width="5" height="4.5" rx=".5"/>'),colis:Xe('<path d="M12 2.8 20.5 7.4v9.2L12 21.2 3.5 16.6V7.4Z"/><path d="m3.5 7.4 8.5 4.6 8.5-4.6M12 12v9.2"/><path d="m7.7 5.1 8.6 4.6"/>'),convoyeur:Xe('<rect x="2.5" y="6" width="19" height="7" rx="3.5"/><circle cx="6" cy="9.5" r="1.2"/><circle cx="12" cy="9.5" r="1.2"/><circle cx="18" cy="9.5" r="1.2"/><path d="M5 13v7M19 13v7M8.5 3h7M13 1.5 15.5 3 13 4.5"/>'),controle:Xe('<path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16"/><path d="M2 21h20"/><rect x="8.5" y="12" width="7" height="6" rx=".6"/><path d="M7 8h10" stroke-dasharray="1.6 1.6"/>'),rejet:Xe('<path d="M3 17h8.5c2 0 3-1 4-2.6L19.5 7"/><path d="M15.4 6.2 19.8 6.6 19.4 11"/><path d="M11.5 17H21"/><path d="m18.5 14.5 2.5 2.5-2.5 2.5"/>'),expedition:Xe('<path d="M2.5 6.5h11v10h-11z"/><path d="M13.5 9.5h4.2l3.3 3.6v3.4h-7.5"/><circle cx="6.5" cy="17.5" r="1.9"/><circle cx="17" cy="17.5" r="1.9"/>'),effectif:Xe('<path d="M5.5 11a6.5 6.5 0 0 1 13 0"/><path d="M4 11h16v1.6H4z"/><path d="M12 4.5V7"/><path d="M7 15.5c.9 2.8 2.7 4.5 5 4.5s4.1-1.7 5-4.5"/>'),qualite:Xe('<path d="M12 2.5 19.5 5.3v6c0 4.6-3.2 8.4-7.5 10.2-4.3-1.8-7.5-5.6-7.5-10.2v-6Z"/><path d="m8.5 12 2.4 2.4 4.8-4.9"/>'),charge:Xe('<rect x="3" y="13" width="6" height="8" rx=".6"/><rect x="9" y="6.5" width="6" height="14.5" rx=".6"/><rect x="15" y="10" width="6" height="11" rx=".6"/><path d="M4.5 3.5h4M6.5 1.5v4"/>'),lignes:Xe('<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.3 1.3L7.2 4.8M3.5 12l1.3 1.3 2.4-2.5M3.5 18l1.3 1.3 2.4-2.5"/>'),courbe:Xe('<path d="M3 3v18h18"/><path d="m6.5 15.5 4-4.5 3.2 2.8L20 7"/><path d="M6.5 18 20 10" stroke-dasharray="2 2"/>'),cible:Xe('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'),priorite:Xe('<path d="M4 21V4"/><path d="M4 4.5h12.5l-2.4 4 2.4 4H4"/>'),securite:Xe('<path d="M3.5 18.5h17"/><path d="M5.5 18.5V15a6.5 6.5 0 0 1 13 0v3.5"/><path d="M12 8.5v-3M9 9.5V7.2M15 9.5V7.2"/><path d="M2.5 21h19"/>'),conforme:Xe('<circle cx="12" cy="12" r="9.2"/><path d="m7.8 12.3 2.8 2.8 5.6-5.8"/>'),vigilance:Xe('<path d="M12 3.2 21.3 19.6H2.7Z"/><path d="M12 9.5v4.6M12 16.9v.2"/>'),critique:Xe('<path d="M8.2 2.8h7.6l5.4 5.4v7.6l-5.4 5.4H8.2l-5.4-5.4V8.2Z"/><path d="M12 7.6v5.6M12 16.2v.2"/>'),indisponible:Xe('<circle cx="12" cy="12" r="9.2" stroke-dasharray="2.6 2.4"/><path d="M8.5 12h7"/>'),info:Xe('<circle cx="12" cy="12" r="9.2"/><path d="M12 11v5.5M12 7.6v.2"/>'),connecte:Xe('<path d="M2.5 9a14 14 0 0 1 19 0"/><path d="M5.8 12.6a9 9 0 0 1 12.4 0"/><path d="M9.2 16.1a4 4 0 0 1 5.6 0"/><circle cx="12" cy="19.4" r="1" fill="currentColor"/>'),ancien:Xe('<circle cx="12" cy="12" r="9.2"/><path d="M12 6.8V12l3.6 2.2"/>'),coupe:Xe('<path d="M2.5 9a14 14 0 0 1 7.2-3.7M14.3 5.3A14 14 0 0 1 21.5 9"/><path d="M5.8 12.6a9 9 0 0 1 3.3-2"/><path d="M9.2 16.1a4 4 0 0 1 5.6 0"/><path d="m3 3 18 18"/>'),vide:Xe('<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8v-13"/><path d="M4.5 12c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8"/><path d="m3 3 18 18"/>'),actualiser:Xe('<path d="M20 11a8 8 0 0 0-14.3-4.6L4 8.5"/><path d="M4 3.5v5h5"/><path d="M4 13a8 8 0 0 0 14.3 4.6l1.7-2.1"/><path d="M20 20.5v-5h-5"/>'),exploitation:Xe('<rect x="2.5" y="3.5" width="19" height="13" rx="1.6"/><path d="M8 20.5h8M12 16.5v4"/><path d="m6 12.5 3-3.2 2.6 2.2L17.5 6"/>'),immersion:Xe('<path d="M12 2.8 20.5 7.6v8.8L12 21.2 3.5 16.4V7.6Z"/><path d="M3.5 7.6 12 12.4l8.5-4.8M12 12.4v8.8"/>'),briefing:Xe('<circle cx="8" cy="7.5" r="2.6"/><circle cx="16.5" cy="7.5" r="2.6"/><path d="M3 19c.4-3.4 2.4-5.4 5-5.4s4.6 2 5 5.4"/><path d="M13.6 14.4c.9-.6 1.8-.8 2.9-.8 2.6 0 4.6 2 5 5.4"/>'),pause:Xe('<rect x="6.5" y="4.5" width="3.6" height="15" rx="1"/><rect x="13.9" y="4.5" width="3.6" height="15" rx="1"/>'),lecture:Xe('<path d="M7 4.5v15l12-7.5Z"/>'),pleinEcran:Xe('<path d="M3.5 9V3.5H9M15 3.5h5.5V9M20.5 15v5.5H15M9 20.5H3.5V15"/>'),quitterPleinEcran:Xe('<path d="M9 3.5V9H3.5M20.5 9H15V3.5M15 20.5V15h5.5M3.5 15H9v5.5"/>'),reglages:Xe('<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'),fermer:Xe('<path d="M6 6l12 12M18 6 6 18"/>'),retour:Xe('<path d="M10 5 3 12l7 7"/><path d="M3.5 12H21"/>'),vue:Xe('<path d="M3.5 9V3.5H9M15 3.5h5.5V9M20.5 15v5.5H15M9 20.5H3.5V15"/><circle cx="12" cy="12" r="3"/>'),chevron:Xe('<path d="m6 9 6 6 6-6"/>'),modifier:Xe('<path d="M4 20h4L19.5 8.5a2.8 2.8 0 0 0-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/>'),lien:Xe('<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'),importer:Xe('<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/>'),alerte:Xe('<path d="M6 17V11a6 6 0 0 1 12 0v6"/><path d="M4 17h16M10 20.5h4"/><path d="M12 2.5V4M4.2 5.6l1.1 1.1M19.8 5.6l-1.1 1.1"/>')},xa={conforme:"CONFORME",vigilance:"VIGILANCE",critique:"CRITIQUE",indisponible:"INDISPONIBLE"},Cn=(i,e)=>`<span class="etat" data-etat="${i}">${Fe[i]||Fe.info}<span>${e||xa[i]||i}</span></span>`;var ch={ok:["connecte","Donn\xE9es \xE0 jour"],ancienne:["ancien","Donn\xE9es anciennes"],interrompue:["coupe","Connexion interrompue"],indisponible:["vide","Donn\xE9es indisponibles"],chargement:["actualiser","Connexion\u2026"]},va=class{constructor(e,t){this.actions=t,this.bandeau=ot(`<div class="bandeau-demo" role="status" hidden>
      <b>\u25B2 DONN\xC9ES DE D\xC9MONSTRATION</b><span class="sep">\u2014</span><span class="fin">valeurs fictives, sans lien avec l\u2019activit\xE9 r\xE9elle</span><span class="sep">\xB7</span><span class="fin horloge-sim"></span>
    </div>`),this.noeud=ot(`<header class="entete">
      <div class="marque">
        <span class="marque-logo">${Fe.logo}</span>
        <div>
          <div class="marque-nom"><span class="pick">PICK</span><span class="barres">//</span>MISSION CONTROL</div>
          <div class="marque-site">${Vl.entreprise.toUpperCase()} \xB7 ${Vl.site.toUpperCase()}</div>
        </div>
      </div>
      <button class="contexte pressable" type="button" data-action="filtres" aria-label="Changer la date, la p\xE9riode ou l\u2019\xE9quipe">
        <div>
          <div class="contexte-date"></div>
          <div class="contexte-puces"></div>
        </div>
        <div class="contexte-horloge"><small>HEURE LOCALE</small><span class="hh">--:--:--</span></div>
        <span class="chevron">${Fe.chevron}</span>
      </button>
      <button class="statut pressable" type="button" data-action="actualiser" data-etat="chargement" aria-label="\xC9tat des donn\xE9es \u2014 toucher pour actualiser">
        <span class="statut-icone"></span>
        <span><div class="statut-texte"></div><div class="statut-heure"></div></span>
      </button>
      <button class="bouton-alertes pressable" type="button" data-action="alertes" aria-label="Alertes actives">
        <span class="ic"></span><span class="nb">0</span><span class="lib">alertes</span>
      </button>
      <div class="modes" role="group" aria-label="Mode de pr\xE9sentation">
        <button class="mode pressable" type="button" data-mode="exploitation" aria-pressed="true">${Fe.exploitation}<span class="lib">Exploitation</span></button>
        <button class="mode pressable" type="button" data-mode="immersion" aria-pressed="false">${Fe.immersion}<span class="lib">Immersion</span></button>
        <button class="mode pressable" type="button" data-mode="briefing" aria-pressed="false">${Fe.briefing}<span class="lib">Briefing</span></button>
      </div>
      <div class="outils">
        <button class="outil pressable" type="button" data-action="animations" aria-pressed="false" aria-label="Suspendre les animations">${Fe.pause}</button>
        <button class="outil pressable" type="button" data-action="plein-ecran" aria-label="Plein \xE9cran">${Fe.pleinEcran}</button>
        <button class="outil pressable" type="button" data-action="reglages" aria-label="R\xE9glages">${Fe.reglages}</button>
      </div>
    </header>`),e.prepend(this.noeud),e.prepend(this.bandeau),this.noeud.addEventListener("click",n=>{var r;let s=n.target.closest("button");s&&(s.dataset.mode?t.mode(s.dataset.mode):s.dataset.action&&((r=t[s.dataset.action])==null||r.call(t,s)))}),this.r={date:this.noeud.querySelector(".contexte-date"),puces:this.noeud.querySelector(".contexte-puces"),hh:this.noeud.querySelector(".hh"),statut:this.noeud.querySelector(".statut"),statutIc:this.noeud.querySelector(".statut-icone"),statutTx:this.noeud.querySelector(".statut-texte"),statutH:this.noeud.querySelector(".statut-heure"),alertes:this.noeud.querySelector(".bouton-alertes"),alertesIc:this.noeud.querySelector(".bouton-alertes .ic"),alertesNb:this.noeud.querySelector(".bouton-alertes .nb"),anim:this.noeud.querySelector('[data-action="animations"]'),plein:this.noeud.querySelector('[data-action="plein-ecran"]'),sim:this.bandeau.querySelector(".horloge-sim")},this.statut=null,setInterval(()=>this.tic(),1e3),this.tic(),document.addEventListener("fullscreenchange",()=>this.majPleinEcran()),document.addEventListener("webkitfullscreenchange",()=>this.majPleinEcran())}tic(){ft(this.r.hh,ki(new Date)),this.statut&&this.majStatut(this.statut)}majFiltres(e,t){var a;let n=fi(e.date),s;if(e.periode==="jour")s=lr(or(n));else if(e.periode==="mois")s=lr(sh(n));else{let o=pi(e.date,"semaine"),l=fi(o[0]),c=fi(o[o.length-1]);s=`Semaine du ${l.getDate()} au ${or(c).replace(/^\S+ /,"")}`}ft(this.r.date,s);let r=e.equipe==="toutes"?"TOUTES \xC9QUIPES":`\xC9QUIPE ${(((a=t.equipes.find(o=>o.id===e.equipe))==null?void 0:a.nom)||e.equipe).toUpperCase()}`;It(this.r.puces,`<span class="puce">${e.periode.toUpperCase()}</span><span class="puce">${r}</span>`)}majStatut(e){this.statut=e;let[t,n]=ch[e.etat]||ch.chargement;this.r.statut.dataset.etat=e.etat,It(this.r.statutIc,Fe[t]),ft(this.r.statutTx,n);let s=e.derniereReussite?new Date(e.derniereReussite):null,r;e.etat==="interrompue"?r=`Derni\xE8res valeurs : <b>${s?ki(s):"\u2014"}</b>`:e.etat==="ancienne"&&e.genere?r=`Extraites <b>${pa(e.genere)}</b>`:e.etat==="indisponible"?r=s?`Derni\xE8re r\xE9ussite : <b>${ki(s)}</b>`:"Aucune donn\xE9e re\xE7ue":r=s?`Actualis\xE9 \xE0 <b>${ki(s)}</b>`:"Chargement\u2026",It(this.r.statutH,r),this.r.statut.setAttribute("aria-label",`${n}. ${this.r.statutH.textContent}. Toucher pour actualiser.`)}majChargement(e){this.r.statut.classList.toggle("actualise",e)}majAlertes(e){let t=e.some(n=>n.niveau==="critique")?"critique":e.length?"vigilance":"conforme";this.r.alertes.dataset.niveau=t,It(this.r.alertesIc,Fe[t==="conforme"?"conforme":t]),ft(this.r.alertesNb,String(e.length)),ft(this.r.alertes.querySelector(".lib"),e.length>1?"alertes":"alerte"),this.r.alertes.setAttribute("aria-label",`${e.length} alerte(s) active(s) \u2014 ouvrir la liste`)}majMode(e){this.noeud.querySelectorAll(".mode").forEach(t=>t.setAttribute("aria-pressed",String(t.dataset.mode===e)))}majAnimations(e){let t=e==="off";this.r.anim.setAttribute("aria-pressed",String(t)),this.r.anim.innerHTML=t?Fe.lecture:Fe.pause,this.r.anim.setAttribute("aria-label",t?"Reprendre les animations":"Suspendre les animations")}majPleinEcran(){let e=!!(document.fullscreenElement||document.webkitFullscreenElement);this.r.plein.innerHTML=e?Fe.quitterPleinEcran:Fe.pleinEcran,this.r.plein.setAttribute("aria-label",e?"Quitter le plein \xE9cran":"Plein \xE9cran")}majDemo(e,t){var r,a;let n=!e&&!!((r=t==null?void 0:t.meta)!=null&&r.exemple);this.bandeau.hidden=!e&&!n,ft(this.bandeau.querySelector("b"),n?"\u25B2 DONN\xC9ES D\u2019EXEMPLE":"\u25B2 DONN\xC9ES DE D\xC9MONSTRATION");let s=n?"fichier mod\xE8le, \xE0 remplacer par l\u2019export r\xE9el":(a=t==null?void 0:t.meta)!=null&&a.heureSimulee?`horloge simul\xE9e ${t.meta.heure}`:"horloge r\xE9elle";ft(this.r.sim,s)}};var mi=class{constructor(e,{decimales:t=0,format:n=null}={}){this.noeud=e,this.dec=t,this.format=n||(s=>Y(s,this.dec)),this.valeur=null,this.raf=0}regler(e,{duree:t=700,depuisZero:n=!1}={}){if(cancelAnimationFrame(this.raf),e==null||!Number.isFinite(e)){this.valeur=null,this.noeud.textContent=ls;return}let s=n?0:this.valeur;if(this.valeur=e,s===null||s===e||!Qt.plein){this.noeud.textContent=this.format(e);return}let r=performance.now(),a=o=>{let l=Math.min(1,(o-r)/t),c=1-Math.pow(1-l,3),u=s+(e-s)*c;this.noeud.textContent=this.format(this.dec?u:Math.round(u)),l<1&&(this.raf=requestAnimationFrame(a))};this.raf=requestAnimationFrame(a)}};var op="http://www.w3.org/2000/svg",Pn=(i,e,t)=>i+(e-i)*t;function _a(i,e){if(!i.length)return 0;if(e<=i[0].x)return i[0].y;for(let t=1;t<i.length;t++)if(e<=i[t].x){let n=i[t-1],s=i[t];return Pn(n.y,s.y,(e-n.x)/Math.max(1e-6,s.x-n.x))}return i[i.length-1].y}function uh(i,e=4){if(!(i>0))return[0];let t=i/e,n=Math.pow(10,Math.floor(Math.log10(t))),s=[1,2,2.5,5,10].map(a=>a*n).find(a=>a>=t)||t,r=[];for(let a=0;a<=i+1e-9;a+=s)r.push(a);return r}var hh=i=>i>=1e4?`${Y(i/1e3,i%1e3?1:0)} k`:Y(i),ya=class{constructor(e,{compacte:t=!1}={}){this.c=e,this.compacte=t,this.svg=document.createElementNS(op,"svg"),this.svg.setAttribute("role","img"),this.c.appendChild(this.svg),this.vide=document.createElement("div"),this.vide.className="vide",this.vide.hidden=!0,this.c.appendChild(this.vide),this.affiche=null,this.cible=null,this.stop=()=>{},new ResizeObserver(()=>this.dessiner(this.affiche)).observe(this.c)}regler(e,{animer:t=!0}={}){if(!e||!e.reel.length&&!e.objectif.length){this.affiche=null,this.svg.innerHTML="",this.vide.hidden=!1,this.vide.textContent="Courbe indisponible : aucune s\xE9rie de production dans les donn\xE9es.";return}this.vide.hidden=!0;let n={...e,yMax:this.yMax(e)},s=this.affiche&&this.affiche.type===e.type&&this.affiche.domaine[0]===e.domaine[0]&&this.affiche.domaine[1]===e.domaine[1]?this.affiche:null;if(this.stop(),!t||!s){this.affiche=n,this.dessiner(n);return}let r=s.reel.length?s.reel[s.reel.length-1].x:e.domaine[0],a=n.reel.length?n.reel[n.reel.length-1].x:e.domaine[0];this.stop=ec(900,o=>{let l=Pn(r,a,o),c=[];for(let d of n.reel){if(d.x>l)break;c.push({x:d.x,y:Pn(_a(s.reel,d.x),d.y,o)})}n.reel.length&&(!c.length||c[c.length-1].x<l)&&c.push({x:l,y:Pn(_a(s.reel,l),_a(n.reel,l),o)});let u={...n,reel:c,objectif:n.objectif.map(d=>({x:d.x,y:Pn(_a(s.objectif,d.x),d.y,o)})),barres:n.barres.map((d,h)=>{var p;return{...d,y:d.y===null?null:Pn(((p=s.barres[h])==null?void 0:p.y)??0,d.y,o)}}),yMax:Pn(s.yMax,n.yMax,o),heure:s.heure!==null&&n.heure!==null?Pn(s.heure,n.heure,o):n.heure,attendu:s.attendu!==null&&n.attendu!==null?Pn(s.attendu,n.attendu,o):n.attendu};this.dessiner(u)},()=>{this.affiche=n,this.dessiner(n)},ga.inOutCubic),this.affiche=n}yMax(e){return Math.max(1,...e.reel.map(n=>n.y),...e.objectif.map(n=>n.y),e.objectifFinal||0)*1.08}dessiner(e){if(!e)return;let t=this.c.clientWidth,n=this.c.clientHeight;if(t<20||n<20)return;let s=parseFloat(getComputedStyle(document.documentElement).fontSize)||16,r=.78*s,a={l:3.7*s,r:1.2*s,t:.5*s,b:1.7*s},o=t-a.l-a.r,l=n-a.t-a.b,c=this.compacte?0:l*.24,[u,d]=e.domaine,h=f=>a.l+(f-u)/Math.max(1e-6,d-u)*o,p=f=>a.t+l-f/e.yMax*l,g=Math.max(1,...e.barres.map(f=>Math.max(f.y||0,f.objectif||0))),y=f=>a.t+l-f/g*c,m=[];m.push(`<defs>
      <linearGradient id="cp-aire" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3cd6ff" stop-opacity=".38"/><stop offset="1" stop-color="#3cd6ff" stop-opacity="0"/></linearGradient>
      <pattern id="cp-hach" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="3" height="6" fill="#3cd6ff" fill-opacity=".35"/></pattern>
      <filter id="cp-lueur" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="${.25*s}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>`);for(let f of uh(e.yMax/1.08)){let S=p(f);m.push(`<line x1="${a.l}" x2="${t-a.r}" y1="${S}" y2="${S}" stroke="rgba(120,180,255,${f===0?.3:.1})" stroke-width="1"/>`),m.push(`<text x="${a.l-.5*s}" y="${S+r*.35}" text-anchor="end" font-size="${r}">${hh(f)}</text>`)}if(e.type==="heure"){let f=o/((d-u)/60)<3.2*s?120:60;for(let S=Math.ceil(u/60)*60;S<=d;S+=f){let w=h(S);m.push(`<line x1="${w}" x2="${w}" y1="${a.t}" y2="${a.t+l}" stroke="rgba(120,180,255,.06)"/>`),m.push(`<text x="${w}" y="${n-.35*s}" text-anchor="middle" font-size="${r}">${String(Math.floor(S/60)).padStart(2,"0")}h</text>`)}}else{let f=e.barres.length,S=Math.max(1,Math.ceil(f*3.4*s/o));e.barres.forEach((w,M)=>{if(M%S)return;let E=w.t?new Date(`${w.t}T12:00:00`):null,x=E?`${["dim","lun","mar","mer","jeu","ven","sam"][E.getDay()]} ${E.getDate()}`:"";m.push(`<text x="${h(M+.5)}" y="${n-.35*s}" text-anchor="middle" font-size="${r}">${x}</text>`)})}if(!this.compacte)for(let f of e.barres){let S=h(f.x0)+.12*s,w=h(f.x1)-.12*s;if(f.objectif&&m.push(`<line x1="${S}" x2="${w}" y1="${y(f.objectif)}" y2="${y(f.objectif)}" stroke="rgba(238,247,255,.45)" stroke-width="1.5" stroke-dasharray="3 3"/>`),f.y===null||f.y===void 0)continue;let M=y(f.y);m.push(`<rect x="${S}" y="${M}" width="${Math.max(1,w-S)}" height="${Math.max(0,a.t+l-M)}" rx="${.15*s}" fill="${f.partiel?"url(#cp-hach)":"rgba(60,214,255,.26)"}" stroke="rgba(60,214,255,.45)" stroke-width="1"/>`)}if(e.objectif.length>1&&m.push(`<polyline points="${e.objectif.map(f=>`${h(f.x).toFixed(1)},${p(f.y).toFixed(1)}`).join(" ")}" fill="none" stroke="rgba(238,247,255,.7)" stroke-width="${.13*s}" stroke-dasharray="${.45*s} ${.35*s}"/>`),e.objectifFinal){let f=p(e.objectifFinal);m.push(`<line x1="${a.l}" x2="${t-a.r}" y1="${f}" y2="${f}" stroke="rgba(32,214,157,.45)" stroke-width="1"/>`),m.push(`<text x="${a.l+.4*s}" y="${f-.35*s}" text-anchor="start" font-size="${r}" fill="#20d69d">OBJECTIF ${Y(e.objectifFinal)}</text>`)}if(e.reel.length>1){let f=e.reel.map(T=>`${h(T.x).toFixed(1)},${p(T.y).toFixed(1)}`).join(" "),S=e.reel[e.reel.length-1];if(m.push(`<polygon points="${h(e.reel[0].x)},${p(0)} ${f} ${h(S.x)},${p(0)}" fill="url(#cp-aire)"/>`),m.push(`<polyline points="${f}" fill="none" stroke="#3cd6ff" stroke-width="${.2*s}" stroke-linejoin="round" filter="url(#cp-lueur)"/>`),e.heure!==null&&e.heure!==void 0&&e.type==="heure"){let T=h(e.heure);m.push(`<line x1="${T}" x2="${T}" y1="${a.t}" y2="${a.t+l}" stroke="rgba(158,234,255,.55)" stroke-dasharray="2 3"/>`),e.attendu!==null&&e.attendu!==void 0&&m.push(`<circle cx="${T}" cy="${p(e.attendu)}" r="${.32*s}" fill="#050c18" stroke="#eef7ff" stroke-width="${.11*s}"/>`)}let w=h(S.x),M=p(S.y);m.push(`<circle cx="${w}" cy="${M}" r="${.62*s}" fill="#3cd6ff" fill-opacity=".18"/><circle cx="${w}" cy="${M}" r="${.34*s}" fill="#eef7ff" stroke="#3cd6ff" stroke-width="${.12*s}"/>`);let E=`${e.type==="heure"&&e.heure!==null?`${vt(e.heure)} \xB7 `:""}${Y(S.y)}`,x=(E.length*.6+1.2)*r,R=Math.min(t-a.r-x,Math.max(a.l,w-x/2)),_=Math.max(a.t,M-2.5*s);m.push(`<g><rect x="${R}" y="${_}" width="${x}" height="${1.55*s}" rx="${.3*s}" fill="#06101f" stroke="rgba(60,214,255,.6)"/><text x="${R+x/2}" y="${_+1.06*s}" text-anchor="middle" font-size="${r*1.05}" fill="#eef7ff" font-weight="600">${E}</text></g>`)}this.svg.setAttribute("viewBox",`0 0 ${t} ${n}`),this.svg.innerHTML=m.join(""),this.svg.setAttribute("aria-label",`Courbe de production : ${e.reel.length?Y(e.reel[e.reel.length-1].y):"aucune"} lignes cumul\xE9es, objectif ${Y(e.objectifFinal)}`)}},ba=class{constructor(e,t="#3cd6ff"){this.svg=e,this.couleur=t,this.valeurs=null,this.stop=()=>{}}regler(e){let t=(e||[]).filter(s=>s!==null&&Number.isFinite(s));if(t.length<2){this.svg.innerHTML="",this.valeurs=null;return}let n=this.valeurs&&this.valeurs.length?this.valeurs:null;if(this.stop(),!n){this.valeurs=t,this.dessiner(t);return}this.stop=ec(800,s=>{let r=t.length,a=t.map((o,l)=>{let c=l/Math.max(1,r-1)*(n.length-1),u=n[Math.floor(c)]??n[n.length-1],d=n[Math.ceil(c)]??u;return Pn(Pn(u,d,c-Math.floor(c)),o,s)});this.dessiner(a)},()=>{this.valeurs=t,this.dessiner(t)},ga.inOutCubic),this.valeurs=t}dessiner(e){let s=Math.min(...e),r=Math.max(...e),a=u=>r===s?30/2:27-(u-s)/(r-s)*24,o=u=>u/(e.length-1)*100,l=e.map((u,d)=>`${o(d).toFixed(2)},${a(u).toFixed(2)}`).join(" "),c=`tg${Math.random().toString(36).slice(2,7)}`;this.svg.setAttribute("viewBox","0 0 100 30"),this.svg.setAttribute("preserveAspectRatio","none"),this.svg.innerHTML=`<defs><linearGradient id="${c}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${this.couleur}" stop-opacity=".3"/><stop offset="1" stop-color="${this.couleur}" stop-opacity="0"/></linearGradient></defs>
      <polygon points="0,30 ${l} 100,30" fill="url(#${c})"/>
      <polyline points="${l}" fill="none" stroke="${this.couleur}" stroke-width="1.6" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
      <circle cx="${o(e.length-1)}" cy="${a(e[e.length-1])}" r="2.4" fill="#eef7ff" vector-effect="non-scaling-stroke"/>`}};function dh(i,e,{unite:t="",format:n=l=>Y(l),objectif:s=!0,couleur:r="#3cd6ff",seuil:a=null,seuilLib:o=""}={}){i.innerHTML="";let l=i.clientWidth||600,c=i.clientHeight||240,u=parseFloat(getComputedStyle(document.documentElement).fontSize)||16,d=.75*u,h={l:3.4*u,r:.6*u,t:1.4*u,b:1.6*u},p=l-h.l-h.r,g=c-h.t-h.b,y=e.map(x=>x.y).filter(x=>x!==null&&Number.isFinite(x));if(!y.length){i.innerHTML='<div class="vide" style="display:grid;place-items:center;height:100%;color:var(--texte-2)">Historique indisponible</div>';return}let m=Math.max(...y,...s?e.map(x=>x.objectif||0):[0],a||0)*1.12||1,f=e.length,S=p/f,w=x=>h.t+g-x/m*g,M=[];for(let x of uh(m/1.12,3))M.push(`<line x1="${h.l}" x2="${l-h.r}" y1="${w(x)}" y2="${w(x)}" stroke="rgba(120,180,255,${x?.1:.3})"/>`),M.push(`<text x="${h.l-.4*u}" y="${w(x)+d*.35}" text-anchor="end" font-size="${d}">${hh(x)}</text>`);a!==null&&(M.push(`<line x1="${h.l}" x2="${l-h.r}" y1="${w(a)}" y2="${w(a)}" stroke="#ffb43a" stroke-width="1.5" stroke-dasharray="5 4"/>`),M.push(`<text x="${l-h.r}" y="${w(a)-.3*u}" text-anchor="end" font-size="${d}" fill="#ffb43a">${o}</text>`));let E=Math.max(1,Math.ceil(f*2.6*u/p));e.forEach((x,R)=>{let _=h.l+R*S+S*.14,T=S*.72;s&&x.objectif&&M.push(`<line x1="${_-S*.06}" x2="${_+T+S*.06}" y1="${w(x.objectif)}" y2="${w(x.objectif)}" stroke="rgba(238,247,255,.6)" stroke-width="1.5" stroke-dasharray="3 3"/>`),x.y!==null&&Number.isFinite(x.y)?(M.push(`<rect x="${_}" y="${w(x.y)}" width="${T}" height="${h.t+g-w(x.y)}" rx="${.15*u}" fill="${r}" fill-opacity="${x.partiel?.25:.55}" stroke="${r}" stroke-opacity=".8" ${x.partiel?'stroke-dasharray="3 2"':""}/>`),S>2.4*u&&M.push(`<text x="${_+T/2}" y="${w(x.y)-.3*u}" text-anchor="middle" font-size="${d*.95}" fill="#eef7ff">${n(x.y)}</text>`)):M.push(`<text x="${_+T/2}" y="${h.t+g-.3*u}" text-anchor="middle" font-size="${d*.9}" fill="#5f7491">\u2014</text>`),R%E===0&&M.push(`<text x="${_+T/2}" y="${c-.3*u}" text-anchor="middle" font-size="${d}">${x.lib||""}</text>`)}),i.innerHTML=`<svg viewBox="0 0 ${l} ${c}" role="img" aria-label="Historique ${t}">${M.join("")}</svg>`}var fh={critique:2,vigilance:1};function mh(i,e,t,n,s){var a;return e==null?"indisponible":i==="qualite"&&s&&(((a=n==null?void 0:n.qualite)==null?void 0:a.lignes)||0)<(s.seuils.ppmDecelee.minLignes??1e3)?"attente":t.filter(o=>o.kpi===i).reduce((o,l)=>fh[l.niveau]>(fh[o]||0)?l.niveau:o,"conforme")}var gh=i=>i.heure!==null&&i.heure!==void 0?vt(i.heure):"",Ma=(i,e)=>(i.serieBrute||[]).map(t=>t[e]).filter(t=>t!=null),tc=[{id:"lignes",col:"g",majeur:!0,code:"KPI\xB701",titre:"Lignes pr\xE9par\xE9es",icone:"lignes",unite:"lignes",zone:"preparation",valeur:i=>i.lignes.valeur,pied:i=>{let e=i.lignes,t=[[e.objectifMethode==="quota"?"Objectif (quota)":"Objectif",e.objectif!==null?`${Y(e.objectif)} \xB7 ${Gt(e.pctObjectif)}`:"indisponible"]];return e.attendu!==null&&t.push([i.estJour?`Attendu \xE0 ${gh(i)}`:"Attendu \xE0 date",`${Y(e.attendu)} (${Jn(e.ecart)})`]),t},tendance:i=>Ma(i,"lignes")},{id:"charge",col:"g",code:"KPI\xB703",titre:"Charge restante",icone:"charge",unite:"lignes",zone:"preparation",valeur:i=>i.charge.valeur,pied:i=>{let e=i.charge,t=[];return e.finEstimee&&t.push(["Fin de pr\xE9paration",e.finEstimee.auDela?'apr\xE8s fin de poste<span class="est">ESTIM.</span>':`\u2248 ${e.finEstimee.heure}<span class="est">ESTIM.</span>`]),e.ratio!==null&&t.push(["Charge / capacit\xE9",`${Y(e.ratio)} %<span class="est">ESTIM.</span>`]),t.length||t.push(["Carnet du service","toutes \xE9quipes"]),t},tendance:i=>Ma(i,"charge")},{id:"effectif",col:"g",code:"KPI\xB706",titre:"Effectif pr\xE9sent",icone:"effectif",unite:"personnes",zone:"preparation",valeur:i=>i.effectif.present,sur:i=>i.effectif.prevu!==null?` / ${Y(i.effectif.prevu,i.effectif.moyen?1:0)}`:"",decimales:i=>i.effectif.moyen?1:0,pied:i=>{let e=i.effectif,t=[];return e.preparateurs!==null&&t.push(["Dont pr\xE9parateurs",Y(e.preparateurs,e.moyen?1:0)]),t.push([e.moyen?"Moyenne par jour":"Absents vs pr\xE9vu",e.moyen?"sur la p\xE9riode":Y(e.absents)]),t}},{id:"production",col:"d",majeur:!0,code:"KPI\xB702",titre:"Production P&P",icone:"colis",unite:"colis",zone:"expedition",valeur:i=>i.production.valeur,pied:i=>{let e=i.production,t=[];return e.debit!==null&&t.push(["D\xE9bit derni\xE8re heure",`${Y(e.debit)} colis/h`]),e.debitMoyen!==null&&t.push(["D\xE9bit moyen du poste",`${Y(e.debitMoyen)} colis/h`]),e.objectif!==null&&t.unshift(["Objectif",`${Y(e.objectif)} \xB7 ${Gt(e.valeur/e.objectif)}`]),t.length||t.push(["Colis contr\xF4l\xE9s",Y(e.controles)]),t},tendance:i=>Ma(i,"colis")},{id:"rejets",col:"d",code:"KPI\xB704",titre:"Rejets convoyeur",icone:"rejet",unite:"colis",zone:"controle",valeur:i=>i.rejets.valeur,pied:i=>{let e=i.rejets,t=[["Taux de rejet",`${Gt(e.taux,1)} des colis contr\xF4l\xE9s`]];return e.recent&&t.push([`Depuis ${e.recent.depuis}`,Gt(e.recent.taux,1)]),e.attente!==null&&t.push(["En attente au rejet",`${Y(e.attente)} colis`]),t},tendance:i=>(i.serieBrute||[]).filter(e=>e.colis).map(e=>e.rejets/e.colis*100)},{id:"qualite",col:"d",code:"KPI\xB705",titre:"Qualit\xE9 d\xE9cel\xE9e",icone:"qualite",unite:"ppm",zone:"controle",valeur:i=>i.qualite.ppm,pied:i=>{let e=i.qualite,t=[["Erreurs d\xE9cel\xE9es",`${Y(e.erreurs)} / ${Y(e.lignes)} lignes`]];return t.push(["PPM av\xE9r\xE9e",e.ppmAveree!==null?`${Y(e.ppmAveree)} (${Y(e.averees)} litiges)`:"indisponible"]),t},tendance:i=>Ma(i,"erreurs")}],Sa=class{constructor(e,t){this.def=e,this.noeud=ot(`<button class="module kpi pressable${e.majeur?" majeur":""}" data-kpi="${e.id}" data-etat="indisponible" style="--i:${t}" type="button" aria-label="${e.titre} : ouvrir le d\xE9tail">
      <div class="module-tete"><span class="module-icone">${Fe[e.icone]}</span><span class="module-titre">${e.titre}</span><span class="kpi-etat"></span></div>
      <div class="kpi-corps"><div class="kpi-valeur-ligne"><span class="kpi-valeur"><span class="n">\u2014</span><span class="sur"></span></span><span class="kpi-unite">${e.unite}</span></div><svg class="spark" aria-hidden="true"></svg></div>
      <div class="kpi-indispo">Donn\xE9e indisponible dans la source</div>
      <div class="kpi-pied"></div>
      <span class="eclat"></span>
    </button>`),this.compteur=new mi(this.noeud.querySelector(".n")),this.tendance=new ba(this.noeud.querySelector(".spark")),this.etatNoeud=this.noeud.querySelector(".kpi-etat"),this.pied=this.noeud.querySelector(".kpi-pied"),this.sur=this.noeud.querySelector(".sur")}maj(e,t,{depuisZero:n=!1,cfg:s=null}={}){let r=this.def,a=e!=null&&e.disponible?r.valeur(e):null,o=e!=null&&e.disponible?mh(r.id,a,t,e,s):"indisponible";this.noeud.dataset.etat=o,this.compteur.dec=r.decimales&&(e!=null&&e.disponible)?r.decimales(e):0,this.compteur.regler(a,{depuisZero:n,duree:n?1100:700}),ft(this.sur,a!==null&&r.sur?r.sur(e):""),It(this.etatNoeud,o==="attente"?Cn("indisponible","NON \xC9VALU\xC9").replace('data-etat="indisponible"','data-etat="attente"'):Cn(o));let l=e!=null&&e.disponible?r.pied(e):[["Source","aucune donn\xE9e re\xE7ue"]];It(this.pied,l.map(([u,d])=>`<div class="l"><span>${u}</span><b>${d}</b></div>`).join(""));let c={critique:"#ff4d5f",vigilance:"#ffb43a",conforme:"#3cd6ff",attente:"#8ea5c2"}[o]||"#7d8da3";this.tendance.couleur=c,this.tendance.regler(e!=null&&e.disponible&&r.tendance?r.tendance(e):null),this.noeud.setAttribute("aria-label",`${r.titre} : ${a===null?"indisponible":`${Y(a)} ${r.unite}`}, \xE9tat ${o}. Ouvrir le d\xE9tail.`)}celebrer(){this.noeud.classList.remove("celebre"),this.noeud.offsetWidth,this.noeud.classList.add("celebre"),setTimeout(()=>this.noeud.classList.remove("celebre"),3600)}};function ph(i){return`<table class="faits"><tbody>${i.map(([e,t])=>`<tr><th>${e}</th><td>${t}</td></tr>`).join("")}</tbody></table>`}function Vi(i){let e=Jt[i];return e?e.validee?'<span class="badge-regle ok">\u25CF R\xC8GLE VALID\xC9E (source)</span>':'<span class="badge-regle av">\u25B2 SEUIL PAR D\xC9FAUT \u2014 \xC0 VALIDER</span>':""}function lp(i,e){if(e.estJour)return i.t.slice(0,2)+"h";let t=new Date(`${i.t}T12:00:00`);return`${["dim","lun","mar","mer","jeu","ven","sam"][t.getDay()]} ${t.getDate()}`}function xh(i,e,t,n,s,r){var w,M,E;let a=tc.find(x=>x.id===i),o=e!=null&&e.disponible?a.valeur(e):null,l=e!=null&&e.disponible?mh(i,o,t,e,n):"indisponible",c=n.seuils,u=(e==null?void 0:e.serieBrute)||[],d="",h="",p=[],g=null,y=gh(e||{});if(!(e!=null&&e.disponible))d="<p>Aucune donn\xE9e n\u2019a \xE9t\xE9 re\xE7ue pour cette date, cette p\xE9riode et cette \xE9quipe. La valeur est affich\xE9e comme indisponible, jamais comme z\xE9ro.</p>";else if(i==="lignes"){let x=e.lignes,R=e.fenetre;d=`<p>${e.estJour?`\xC0 ${y}`:"\xC0 date"}, <b>${Y(x.valeur)} lignes</b> pr\xE9par\xE9es${x.attendu!==null?` pour <b>${Y(x.attendu)}</b> attendues au rythme de l\u2019objectif`:""}${x.objectif!==null?` (${Y(x.objectif)} lignes${e.estJour&&R?` sur ${vt(R.debut)}\u2013${vt(R.fin)}`:""})`:""}.</p>`,x.ecart!==null&&(d+=`<p>${x.ecart>=0?"Avance":"Retard"} de <b>${Y(Math.abs(x.ecart))} lignes</b> (${Jn(x.ecartPct,1)} %) sur le rythme attendu.</p>`),x.cadence!==null&&(d+=`<p>Cadence de la derni\xE8re heure compl\xE8te (${(w=x.derniere)==null?void 0:w.t}) : <b>${Y(x.cadence)} lignes/h</b>${x.rythmeRequis!==null?` ; rythme requis pour atteindre l\u2019objectif : <b>${Y(x.rythmeRequis)} lignes/h</b> sur ${nh(x.heuresRestantes)} productives restantes`:""}.</p>`),x.objectif!==null&&x.valeur>=x.objectif&&(d+="<p><b>Objectif atteint.</b></p>"),h=`<p>${Ve(x.objectifTexte)}</p><p class="note">Lignes attendues = ${x.attenduMethode||"indisponible"}.</p><p class="note">Vigilance au-del\xE0 de ${c.rythme.vigilance} % de retard, critique au-del\xE0 de ${c.rythme.critique} %.</p>${Vi("rythme")}`,p=[["Lignes pr\xE9par\xE9es",Y(x.valeur)],["Objectif",Y(x.objectif)],["Pr\xE9parateurs pr\xE9sents",Y(e.effectif.preparateurs,e.effectif.moyen?1:0)]],g={cle:"lignes",unite:"lignes",objectif:!0}}else if(i==="production"){let x=e.production;d=`<p><b>${Y(x.valeur)} colis</b> produits par le Pick & Pack et dirig\xE9s vers l\u2019exp\xE9dition${e.rejets.attente!==null?` (colis contr\xF4l\xE9s ${Y(x.controles)}, dont ${Y(e.rejets.attente)} encore en attente au rejet)`:""}.</p>`,x.debit!==null&&(d+=`<p>D\xE9bit de la derni\xE8re heure compl\xE8te : <b>${Y(x.debit)} colis/h</b>${x.debitMoyen!==null?` \u2014 moyenne du poste : ${Y(x.debitMoyen)} colis/h`:""}.</p>`),x.objectif===null&&(d+='<p class="note">Aucun objectif de colis n\u2019est d\xE9fini (R\xE9glages \u203A Seuils & objectifs).</p>'),h=`<p class="note">D\xE9finition : ${(M=s==null?void 0:s.meta)!=null&&M.demo?"en d\xE9monstration, colis contr\xF4l\xE9s \u2212 colis en attente au rejet.":"valeur \xAB colisProduits \xBB transmise par la source."} \xC0 confirmer avec l\u2019export LOGYS (contenants exp\xE9di\xE9s).</p><p class="note">R\xE8gle d\xE9bit : ${Jt.debit.formule} Vigilance sous ${c.debit.vigilance} %.</p>${Vi("debit")}`,p=[["Colis produits",Y(x.valeur)],["Colis contr\xF4l\xE9s",Y(x.controles)],["D\xE9bit derni\xE8re heure",x.debit!==null?`${Y(x.debit)} colis/h`:"indisponible"]],g={cle:"colis",unite:"colis",objectif:!1}}else if(i==="charge"){let x=e.charge;d=`<p><b>${Y(x.valeur)} lignes</b> restent \xE0 pr\xE9parer : carnet du service, toutes \xE9quipes confondues, au moment de l\u2019extraction.</p>`,x.capacite!==null&&(d+=`<p>Capacit\xE9 restante <b>estim\xE9e</b> : ${Y(x.capacite)} lignes, soit une charge \xE0 <b>${Y(x.ratio)} %</b> de la capacit\xE9.</p><p class="note">M\xE9thode : ${x.capaciteMethode}</p>`),x.finEstimee&&(d+=`<p>Fin de pr\xE9paration <b>estim\xE9e</b> : ${x.finEstimee.auDela?"apr\xE8s la fin de poste":x.finEstimee.heure}.</p><p class="note">M\xE9thode : ${x.finEstimee.methode} Ce n\u2019est pas une pr\xE9vision : la cadence et les arriv\xE9es de commandes peuvent changer.</p>`),e.estJour||(d+='<p class="note">La comparaison charge / capacit\xE9 n\u2019est calcul\xE9e que sur la vue Jour.</p>'),h=`<p class="note">${Jt.capacite.formule}</p><p class="note">Vigilance \xE0 ${c.capacite.vigilance} %, critique \xE0 ${c.capacite.critique} %.</p>${Vi("capacite")}`,p=[["Charge restante",`${Y(x.valeur)} lignes`],["Capacit\xE9 estim\xE9e",x.capacite!==null?`${Y(x.capacite)} lignes`:"indisponible"]],g={cle:"charge",unite:"lignes",objectif:!1,libelle:"Charge en fin de tranche"}}else if(i==="rejets"){let x=e.rejets;d=`<p><b>${Y(x.valeur)} colis</b> rejet\xE9s par le convoyeur sur ${Y(x.controles)} colis contr\xF4l\xE9s, soit <b>${Gt(x.taux,1)}</b>.</p>`,x.recent&&(d+=`<p>Depuis ${x.recent.depuis} : ${Y(x.recent.rejets)} rejets / ${Y(x.recent.colis)} colis (${Gt(x.recent.taux,1)}).</p>`),x.attente!==null&&(d+=`<p><b>${Y(x.attente)} colis</b> en attente au poste de rejet.</p>`),h=`<p class="note">${Jt.rejetTaux.formule} Fen\xEAtre : derni\xE8re tranche horaire compl\xE8te et tranche en cours (vue Jour), p\xE9riode enti\xE8re sinon. Vigilance \xE0 ${c.rejetTaux.vigilance} %, critique \xE0 ${c.rejetTaux.critique} %.</p>${Vi("rejetTaux")}<p class="note" style="margin-top:.6rem">${Jt.rejetAttente.formule} Vigilance \xE0 ${c.rejetAttente.vigilance} colis, critique \xE0 ${c.rejetAttente.critique}.</p>${Vi("rejetAttente")}`,p=[["Rejets",Y(x.valeur)],["Colis contr\xF4l\xE9s",Y(x.controles)],["Taux",Gt(x.taux,2)],["En attente",Y(x.attente)]],g={cle:"taux",unite:"%",objectif:!1,seuil:c.rejetTaux.vigilance,seuilLib:`seuil ${c.rejetTaux.vigilance} %`}}else if(i==="qualite"){let x=e.qualite;d=`<p>PPM d\xE9cel\xE9e = <b>${Y(x.erreurs)}</b> erreur${x.erreurs>1?"s":""} d\xE9cel\xE9e${x.erreurs>1?"s":""} au rejet \xF7 <b>${Y(x.lignes)}</b> lignes pr\xE9par\xE9es \xD7 1 000 000 = <b>${Y(x.ppm)}</b>.</p>`,(x.lignes||0)<(c.ppmDecelee.minLignes??1e3)&&(d+=`<p class="note">Volume encore faible (< ${Y(c.ppmDecelee.minLignes??1e3)} lignes) : la r\xE8gle d\u2019alerte n\u2019est pas encore \xE9valu\xE9e.</p>`),d+=x.ppmAveree!==null?`<p>PPM av\xE9r\xE9e (litiges clients) : <b>${Y(x.ppmAveree)}</b> (${Y(x.averees)} litiges).</p>`:'<p class="note">PPM av\xE9r\xE9e indisponible : les litiges clients sont connus a posteriori (vues Semaine / Mois).</p>',h=`<p class="note">${Jt.ppmDecelee.formule} Critique \xE0 partir de ${Y(c.ppmDecelee.critique)} (par d\xE9faut).</p>${Vi("ppmDecelee")}`,p=[["Erreurs d\xE9cel\xE9es",Y(x.erreurs)],["Lignes pr\xE9par\xE9es",Y(x.lignes)],["Litiges (av\xE9r\xE9es)",x.averees!==null?Y(x.averees):"indisponible"]],g={cle:"erreurs",unite:"erreurs",objectif:!1}}else if(i==="effectif"){let x=e.effectif;d=`<p><b>${Y(x.present,x.moyen?1:0)}</b> personne${x.present>1?"s":""} pr\xE9sente${x.present>1?"s":""} sur ${Y(x.prevu,x.moyen?1:0)} pr\xE9vue${x.prevu>1?"s":""}${x.moyen?" (moyenne par jour sur la p\xE9riode)":" (\xE9quipes ayant pris leur poste)"}.</p>`,x.preparateurs!==null&&(d+=`<p>Dont <b>${Y(x.preparateurs,x.moyen?1:0)} pr\xE9parateurs</b>, base du calcul de l\u2019objectif (quota).</p>`),Array.isArray(x.equipes)&&x.equipes.length&&(d+=ph(x.equipes.map(R=>[`${Ve(R.nom||R.id)} ${R.debut?`(${R.debut}\u2013${R.fin})`:""}${R.enPoste?" \xB7 en poste":""}`,R.effectifPresent!==null&&R.effectifPresent!==void 0?`${Y(R.effectifPresent)} / ${Y(R.effectifPrevu)} \xB7 ${Y(R.preparateursPresents)} pr\xE9p.`:`pr\xE9vu ${Y(R.effectifPrevu)} \xB7 pas encore en poste`]))),h=`<p class="note">${Jt.effectif.formule} Vigilance d\xE8s ${c.effectif.vigilance} absent, critique d\xE8s ${c.effectif.critique}.</p>${Vi("effectif")}`,p=[["Pr\xE9sents",Y(x.present,1)],["Pr\xE9vus",Y(x.prevu,1)],["Pr\xE9parateurs",Y(x.preparateurs,1)]]}let m=t.filter(x=>x.kpi===i),f=`
    <div class="d-valeur"><span class="v">${o===null?"\u2014":Y(o,a.decimales?a.decimales(e):0)}</span><span class="u">${a.unite}</span>${l==="attente"?Cn("indisponible","NON \xC9VALU\xC9 \xB7 VOLUME FAIBLE"):Cn(l)}</div>
    <div class="d-section"><h3>Lecture de la situation</h3>${d}</div>
    ${g?`<div class="d-section"><h3>Historique ${e!=null&&e.estJour?"par heure":"par jour"}${g.libelle?` \xB7 ${g.libelle}`:""}</h3><div class="d-graph" data-histo></div></div>`:""}
    ${m.length?`<div class="d-section"><h3>Alertes li\xE9es</h3><ul class="liste-alertes">${m.map(x=>`<li><button class="pressable" data-alerte="${x.id}" data-etat="${x.niveau}">${Fe[x.niveau]}<span><span class="t">${x.titre}</span><br><span class="s">${x.message}</span></span></button></li>`).join("")}</ul></div>`:""}
    <div class="d-section"><h3>Objectif, seuils & r\xE8gle de calcul</h3>${h}</div>
    <div class="d-section"><h3>Donn\xE9es disponibles</h3>${ph([...p,["Source",Ve((r==null?void 0:r.source)||"\u2014")],["Donn\xE9es extraites le",(E=s==null?void 0:s.meta)!=null&&E.genereLe?new Date(s.meta.genereLe).toLocaleString("fr-FR"):"horodatage absent"],["Situation \xE0",e!=null&&e.estJour?y:"fin de p\xE9riode / date du jour"]])}</div>`,S=x=>{let R=x.querySelector("[data-histo]");if(!R||!g)return;let _=u.map(C=>({lib:lp(C,e),y:g.cle==="taux"?C.colis?C.rejets/C.colis*100:null:C[g.cle],objectif:g.objectif?C.objectif:null,partiel:C.partiel})),T={critique:"#ff4d5f",vigilance:"#ffb43a"}[l]||"#3cd6ff";requestAnimationFrame(()=>dh(R,_,{unite:g.unite,objectif:g.objectif,couleur:T,format:g.cle==="taux"?C=>`${Y(C,1)}`:C=>Y(C),seuil:g.seuil??null,seuilLib:g.seuilLib}))};return{code:a.code,titre:a.titre,etat:l,corps:f,apres:S}}var Ea=class{constructor(e,t){this.noeud=ot(`<button class="module courbe pressable" type="button" style="--i:7" aria-label="Courbe de production \u2014 ouvrir le d\xE9tail">
      <div class="module-tete"><span class="module-icone">${Fe.courbe}</span><span class="module-titre">Courbe de production</span>
        <span class="courbe-legende"><span><i></i>R\xE9alis\xE9 cumul\xE9</span><span><i class="obj"></i>Objectif au rythme</span><span><i class="barre"></i><span class="lib-b">Lignes / heure</span></span></span>
      </div>
      <div class="graphique"></div>
    </button>`),e.appendChild(this.noeud),this.courbe=new ya(this.noeud.querySelector(".graphique")),this.noeud.addEventListener("click",()=>t("lignes"))}maj(e,{animer:t}){if(!(e!=null&&e.disponible)){this.courbe.regler(null);return}ft(this.noeud.querySelector(".lib-b"),e.estJour?"Lignes / heure":"Lignes / jour");let n=e.serie;this.courbe.regler({type:n.type,domaine:n.domaine,reel:n.reel,objectif:n.objectif,barres:n.barres,heure:e.estJour?e.heure:null,attendu:e.estJour?e.lignes.attendu:null,objectifFinal:e.lignes.objectif},{animer:t})}},Ta=class{constructor(e,t){this.noeud=ot(`<button class="module progression pressable" type="button" data-etat="indisponible" style="--i:8" aria-label="Progression vers l\u2019objectif \u2014 ouvrir le d\xE9tail">
      <div class="module-tete"><span class="module-icone">${Fe.cible}</span><span class="module-titre">Progression vers l\u2019objectif</span></div>
      <div class="prog-chiffres"><span class="v">\u2014</span><span class="o"></span><span class="u">lignes</span><span class="p"></span></div>
      <div class="jauge"><div class="jauge-remplie"></div><div class="jauge-repere" hidden></div></div>
      <div class="prog-legende"><span class="g"></span><span class="d"></span></div>
      <div class="prog-detail"></div>
    </button>`),e.appendChild(this.noeud),this.c=new mi(this.noeud.querySelector(".v")),this.noeud.addEventListener("click",()=>t("lignes"))}maj(e,t,{depuisZero:n}){let s=this.noeud,r=e!=null&&e.disponible?e.lignes:null,a=r&&r.valeur!==null&&r.objectif,o=a?t.some(d=>d.kpi==="lignes"&&d.niveau==="critique")?"critique":t.some(d=>d.kpi==="lignes")?"vigilance":"conforme":"indisponible";s.dataset.etat=o,this.c.regler(r?r.valeur:null,{depuisZero:n,duree:n?1100:700}),ft(s.querySelector(".o"),a?`/ ${Y(r.objectif)}`:""),ft(s.querySelector(".p"),a?Gt(r.pctObjectif):"");let l=s.querySelector(".jauge-remplie");l.style.width=a?`${Math.min(100,r.pctObjectif*100)}%`:"0%";let c=s.querySelector(".jauge-repere");c.hidden=!(a&&r.attendu!==null),a&&r.attendu!==null&&(c.style.left=`calc(${Math.min(100,r.attendu/r.objectif*100)}% - 0.09rem)`),It(s.querySelector(".g"),a&&r.attendu!==null?`\u25BC attendu ${e.estJour?vt(e.heure):"\xE0 date"} : <b>${Y(r.attendu)}</b>`:""),It(s.querySelector(".d"),a?`<b>${Jn(r.ecart)}</b> lignes`:"");let u=[];a?(u.push(["Reste \xE0 pr\xE9parer",`<b>${Y(r.resteObjectif)}</b> lignes`]),r.rythmeRequis!==null&&u.push(["Rythme requis",`<b>${Y(r.rythmeRequis)}</b> lignes/h`]),r.cadence!==null&&u.push(["Cadence derni\xE8re heure",`<b>${Y(r.cadence)}</b> lignes/h`])):u.push(["Objectif","indisponible"]),It(s.querySelector(".prog-detail"),u.slice(0,2).map(([d,h])=>`<div class="l"><span>${d}</span><span>${h}</span></div>`).join(""))}},wa=class{constructor(e,t,n){this.noeud=ot(`<section class="module priorites" style="--i:9" aria-label="Trois priorit\xE9s du moment">
      <div class="module-tete"><span class="module-icone">${Fe.priorite}</span><span class="module-titre">Priorit\xE9s du moment</span><span class="module-code">TOP 3</span></div>
      <ol class="prio-liste"></ol>
    </section>`),e.appendChild(this.noeud),this.liste=this.noeud.querySelector(".prio-liste"),this.liste.addEventListener("click",s=>{let r=s.target.closest("button");r&&(r.dataset.alerte?t(r.dataset.alerte):n())})}maj(e,t){var s;let n=[];for(let r=0;r<3;r++){let a=e[r];if(!a){n.push(`<li class="prio vide">${r===0?t?"Aucune alerte \u2014 situation conforme aux seuils":"Donn\xE9es indisponibles":"Pas d\u2019autre priorit\xE9"}</li>`);continue}let o=Zt.find(c=>c.id===a.zone),l=a.origine==="superviseur"?"Fix\xE9e par le superviseur":`${o?`${o.code} ${o.nom}`:""} \xB7 ${((s=a.alerte)==null?void 0:s.titre)||""}`;n.push(`<li><button class="prio pressable" type="button" data-niveau="${a.niveau}" ${a.alerte?`data-alerte="${a.alerte.id}"`:""}>
        <span class="prio-n">${r+1}</span><span class="prio-icone">${Fe[a.niveau]||Fe.priorite}</span>
        <span class="prio-texte"><span class="t">${Ve(a.texte)}</span><span class="s">${Ve(l)}</span></span>
      </button></li>`)}It(this.liste,n.join("")),this.liste.querySelectorAll("li").forEach(r=>{r.style.display="flex",r.style.flex="1 1 0",r.style.minHeight="0"})}};var Aa=class{constructor(e){this.voile=ot('<div class="voile" hidden></div>'),this.noeud=ot(`<aside class="tiroir" role="dialog" aria-modal="true" aria-labelledby="tiroir-titre" hidden>
      <div class="tiroir-tete">
        <button class="tiroir-retour pressable" type="button" data-fermer>${Fe.retour}<span>Vue principale</span></button>
        <div class="tiroir-titre"><span class="c"></span><span class="t" id="tiroir-titre"></span></div>
        <button class="tiroir-fermer pressable" type="button" data-fermer aria-label="Fermer">${Fe.fermer}</button>
      </div>
      <div class="tiroir-onglets"></div>
      <div class="tiroir-corps"></div>
    </aside>`),e.appendChild(this.voile),e.appendChild(this.noeud),this.corps=this.noeud.querySelector(".tiroir-corps"),this.onglets=this.noeud.querySelector(".tiroir-onglets"),this.voile.addEventListener("click",()=>this.fermer()),this.noeud.addEventListener("click",t=>{t.target.closest("[data-fermer]")&&this.fermer()}),this.surFermeture=null,this.contenu=null}get ouvert(){return!this.noeud.hidden}ouvrir({code:e="",titre:t="",etat:n=null,corps:s="",onglets:r="",apres:a=null,type:o="",cle:l=""}){this.contenu={type:o,cle:l},this.noeud.querySelector(".c").textContent=e,this.noeud.querySelector(".t").textContent=t,this.noeud.style.setProperty("--c",{critique:"var(--rouge)",vigilance:"var(--ambre)",conforme:"var(--vert)"}[n]||"var(--cyan)"),this.onglets.innerHTML=r,this.corps.innerHTML=s,this.corps.scrollTop=0;let c=this.ouvert;this.voile.hidden=!1,this.noeud.hidden=!1,c||(this.noeud.offsetWidth,this.voile.classList.add("ouvert"),this.noeud.classList.add("ouvert"),setTimeout(()=>{var u;return(u=this.noeud.querySelector(".tiroir-retour"))==null?void 0:u.focus({preventScroll:!0})},50)),a==null||a(this.corps,this.onglets)}fermer(){var t;if(!this.ouvert)return;this.voile.classList.remove("ouvert"),this.noeud.classList.remove("ouvert"),setTimeout(()=>{this.noeud.classList.contains("ouvert")||(this.noeud.hidden=!0,this.voile.hidden=!0)},document.getElementById("app").dataset.anim==="plein"?380:0),this.contenu=null,(t=this.surFermeture)==null||t.call(this)}},vh=i=>`<table class="faits"><tbody>${i.map(([e,t])=>`<tr><th>${Ve(e)}</th><td>${Ve(t)}</td></tr>`).join("")}</tbody></table>`;function _h(i){var t;let e=Zt.find(n=>n.id===i.zone);return{type:"alerte",cle:i.id,code:`ALERTE \xB7 ${e?`${e.code} ${e.nom.toUpperCase()}`:""}`,titre:i.titre,etat:i.niveau,corps:`
      <div class="d-valeur">${Cn(i.niveau)}</div>
      <div class="d-section"><h3>Constat</h3><p><b>${Ve(i.message)}</b></p></div>
      <div class="d-section"><h3>\xC9l\xE9ments factuels</h3>${vh(i.faits)}</div>
      <div class="d-section"><h3>R\xE8gle d\xE9clench\xE9e</h3><p class="note">${Ve(i.formule)}</p><p class="note">Seuils : ${Ve(i.seuil)}.</p>
        ${i.validee?'<span class="badge-regle ok">\u25CF R\xC8GLE VALID\xC9E (source)</span>':'<span class="badge-regle av">\u25B2 SEUIL PAR D\xC9FAUT \u2014 \xC0 VALIDER</span>'}</div>
      <div class="d-section"><h3>Action propos\xE9e</h3>${i.action?`<div class="action">${Ve(i.action)}</div><p class="note" style="margin-top:.5rem">Action d\xE9finie dans les r\xE9glages pour la r\xE8gle \xAB ${Ve(((t=Jt[i.regle])==null?void 0:t.titre)||i.regle)} \xBB.</p>`:'<p class="note">Aucune action n\u2019est d\xE9finie pour cette r\xE8gle (R\xE9glages \u203A Seuils & actions). Aucune action n\u2019est donc propos\xE9e.</p>'}</div>
      ${e?`<button class="lien-zone pressable" type="button" data-zone="${e.id}">${Fe.vue}Voir la zone ${e.code} ${e.nom} dans le sch\xE9ma</button>`:""}`}}function yh(i){return{type:"alertes",cle:"liste",code:"ALERTES ACTIVES",titre:`${i.length} alerte${i.length>1?"s":""}`,etat:i.some(e=>e.niveau==="critique")?"critique":i.length?"vigilance":"conforme",corps:i.length?`<ul class="liste-alertes">${i.map(e=>`<li><button class="pressable" type="button" data-alerte="${e.id}" data-etat="${e.niveau}">${Fe[e.niveau]}<span><span class="t">${Ve(e.titre)} \xB7 ${e.niveau==="critique"?"CRITIQUE":"VIGILANCE"}</span><br><span class="s">${Ve(e.message)}</span></span></button></li>`).join("")}</ul>
         <p class="note" style="margin-top:1rem;color:var(--texte-2)">Chaque alerte d\xE9coule d\u2019un seuil appliqu\xE9 \xE0 une donn\xE9e mesur\xE9e. Aucune alerte n\u2019est g\xE9n\xE9r\xE9e al\xE9atoirement.</p>`:`<div class="d-valeur">${Cn("conforme","AUCUNE ALERTE")}</div><p style="margin-top:1rem">Toutes les r\xE8gles \xE9valu\xE9es sont sous leurs seuils.</p>`}}function nc(i,e,t,n){let s=Zt.find(l=>l.id===i),r=t[i]||{etat:"indisponible",alertes:[]},a=n==null?void 0:n[i],o={preparation:e!=null&&e.disponible?[["Lignes pr\xE9par\xE9es",e.lignes.valeur],["Cadence derni\xE8re heure",e.lignes.cadence!==null?`${e.lignes.cadence} lignes/h`:"indisponible"],["Pr\xE9parateurs pr\xE9sents",e.effectif.preparateurs??"indisponible"],["Charge restante",e.charge.valeur??"indisponible"]]:[],convoyeur:e!=null&&e.disponible?[["Colis contr\xF4l\xE9s (entr\xE9s sur le convoyeur)",e.production.controles??"indisponible"],["D\xE9bit derni\xE8re heure",e.production.debit!==null?`${e.production.debit} colis/h`:"indisponible"],["D\xE9bit moyen du poste",e.production.debitMoyen!==null?`${Math.round(e.production.debitMoyen)} colis/h`:"indisponible"]]:[],controle:e!=null&&e.disponible?[["Colis contr\xF4l\xE9s",e.rejets.controles??"indisponible"],["Taux de rejet (p\xE9riode)",e.rejets.taux!==null?`${(e.rejets.taux*100).toFixed(1).replace(".",",")} %`:"indisponible"],["Erreurs d\xE9cel\xE9es",e.qualite.erreurs??"indisponible"],["PPM d\xE9cel\xE9e",e.qualite.ppm??"indisponible"]]:[],rejet:e!=null&&e.disponible?[["Colis rejet\xE9s (p\xE9riode)",e.rejets.valeur??"indisponible"],["En attente au poste de rejet",e.rejets.attente??"indisponible"]]:[],expedition:e!=null&&e.disponible?[["Colis produits vers l\u2019exp\xE9dition",e.production.valeur??"indisponible"],["Objectif colis",e.production.objectif??"non d\xE9fini"]]:[]}[i]||[];return{type:"zone",cle:i,code:`ZONE ${s.code} \xB7 SCH\xC9MA DU FLUX`,titre:s.nom,etat:r.etat,corps:`
      <div class="d-valeur">${a?`<span class="v">${a[0]}</span><span class="u">${a[1]}</span>`:""}${Cn(r.etat)}</div>
      <div class="d-section"><h3>D\xE9tail op\xE9rationnel</h3>${o.length?vh(o.map(([l,c])=>[l,typeof c=="number"?new Intl.NumberFormat("fr-FR").format(c):c])):"<p>Donn\xE9es indisponibles.</p>"}</div>
      <div class="d-section"><h3>Alertes de la zone</h3>${r.alertes.length?`<ul class="liste-alertes">${r.alertes.map(l=>`<li><button class="pressable" type="button" data-alerte="${l.id}" data-etat="${l.niveau}">${Fe[l.niveau]}<span><span class="t">${Ve(l.titre)}</span><br><span class="s">${Ve(l.message)}</span></span></button></li>`).join("")}</ul>`:`<p>${r.etat==="indisponible"?"\xC9tat indisponible : la donn\xE9e de base de cette zone manque.":"Aucune alerte : zone conforme aux seuils."}</p>`}</div>
      <div class="d-section"><h3>\xC0 propos du sch\xE9ma</h3><p class="note">Sch\xE9ma du flux, sans reproduction de l\u2019implantation r\xE9elle. Les colis anim\xE9s illustrent le d\xE9bit agr\xE9g\xE9 de la p\xE9riode ; ils ne repr\xE9sentent ni une localisation ni un suivi individuel.</p></div>`}}var cp=[["affichage","Affichage"],["donnees","Donn\xE9es"],["seuils","Seuils & actions"],["equipes","\xC9quipes"],["briefing","Briefing"],["demo","D\xE9monstration"],["apropos","\xC0 propos"]],gi=(i,e,t)=>`<div class="segment" data-seg="${i}">${t.map(([n,s])=>`<button type="button" class="pressable" data-v="${n}" aria-pressed="${String(e)===String(n)}">${s}</button>`).join("")}</div>`,Kn=(i,e,t="")=>`<input class="saisie" type="number" inputmode="decimal" data-num="${i}" value="${e??""}" ${t}>`,cr=(i,e,t="")=>`<input class="saisie" type="text" data-txt="${i}" value="${Ve(e??"")}" ${t}>`,ic=i=>i?'<span class="tag ok">VALID\xC9 \xB7 SOURCE</span>':'<span class="tag av">PAR D\xC9FAUT \xB7 \xC0 VALIDER</span>';function up(i,e){let t=i.split("."),n={},s=n;return t.slice(0,-1).forEach(r=>{s=s[r]={}}),s[t[t.length-1]]=e,n}var Ra=class{constructor(e,t,n){this.t=e,this.p=t,this.ctx=n,this.onglet="affichage",this.inspection=null}ouvrir(e=this.onglet){this.onglet=e,this.t.ouvrir({type:"reglages",cle:e,code:"PARAM\xC8TRES DE L\u2019\xC9CRAN",titre:"R\xE9glages",onglets:`<div class="onglets" role="tablist">${cp.map(([t,n])=>`<button class="onglet pressable" type="button" role="tab" data-onglet="${t}" aria-selected="${t===e}">${n}</button>`).join("")}</div>`,corps:this.corps(e),apres:(t,n)=>this.brancher(t,n)})}rafraichir(){var e;this.t.ouvert&&((e=this.t.contenu)==null?void 0:e.type)==="reglages"&&this.ouvrir(this.onglet)}corps(e){var s,r,a;let t=this.p.cfg,n=this.p.statut;if(e==="affichage"){let o=((r=(s=this.ctx.scene)==null?void 0:s.infoQualite)==null?void 0:r.call(s))||"";return`
        <div class="champ"><span class="lib">Qualit\xE9 graphique de la sc\xE8ne 3D</span>${gi("affichage.qualite",t.affichage.qualite,[["auto","Auto"],["haute","Haute"],["moyenne","Moyenne"],["basse","Basse"]])}
          <span class="aide">Auto : r\xE9duit d\u2019abord la r\xE9solution de rendu, puis les reflets lumineux et les ombres si l\u2019animation devient saccad\xE9e. ${o?`\xC9tat actuel : <b>${o}</b>.`:""}</span></div>
        <div class="champ"><span class="lib">Rendu du sch\xE9ma de flux</span>${gi("affichage.rendu",t.affichage.rendu,[["3d","Sc\xE8ne 3D"],["2d","Sch\xE9ma 2D (secours)"]])}
          <span class="aide">Le sch\xE9ma 2D s\u2019active automatiquement si la 3D n\u2019est pas prise en charge.</span></div>
        <div class="champ"><span class="lib">Animations</span>${gi("affichage.animations",t.affichage.animations,[["auto","Auto (pr\xE9f\xE9rence syst\xE8me)"],["actives","Actives"],["reduites","R\xE9duites"],["suspendues","Suspendues"]])}
          <span class="aide">R\xE9duites ou suspendues : toute l\u2019information reste affich\xE9e, sans mouvement.</span></div>
        <div class="champ"><span class="lib">Compteur de performances (images / seconde)</span>${gi("affichage.perf",t.affichage.perf,[["false","Masqu\xE9"],["true","Affich\xE9"]])}</div>
        <div class="champ"><span class="lib">Raccourcis clavier</span><span class="aide">1 / 2 / 3 : modes \xB7 F : plein \xE9cran \xB7 Espace : suspendre les animations \xB7 R : actualiser \xB7 \xC9chap : vue principale.</span></div>`}if(e==="donnees"){let o=t.donnees,l=o.source;return`
        <div class="champ"><span class="lib">Source des donn\xE9es</span>${gi("donnees.source",l,[["demo","D\xE9monstration"],["script","Fichier JS"],["json","URL JSON"],["csv","URL CSV"],["fichier","Import manuel"]])}</div>
        ${l==="demo"?'<div class="message-info">Donn\xE9es fictives g\xE9n\xE9r\xE9es par un mod\xE8le d\xE9terministe. Le bandeau \xAB DONN\xC9ES DE D\xC9MONSTRATION \xBB reste affich\xE9. Aucune donn\xE9e r\xE9elle n\u2019est utilis\xE9e.</div>':""}
        ${l==="script"?`<div class="champ"><label>Fichier de donn\xE9es (chemin relatif \xE0 l\u2019application)</label>${cr("donnees.fichier",o.fichier)}
          <span class="aide">Fonctionne aussi en ouvrant index.html directement depuis un dossier partag\xE9. Le fichier doit contenir <code class="mono">window.${Ve(o.variable)} = { \u2026 }</code> au format normalis\xE9 (mod\xE8le : donnees/pick_data.exemple.js).</span></div>
          <div class="champ"><label>Nom de la variable globale</label>${cr("donnees.variable",o.variable)}</div>`:""}
        ${l==="json"||l==="csv"?`<div class="champ"><label>Adresse ${l.toUpperCase()} (http ou https)</label>${cr("donnees.url",o.url,'placeholder="https://\u2026" inputmode="url"')}
          <span class="aide">Le serveur doit autoriser la lecture depuis cette page (m\xEAme site, ou en-t\xEAte CORS).</span></div>`:""}
        ${l==="fichier"||l==="csv"||l==="script"?`<div class="champ"><span class="lib">${l==="fichier"?"Fichier \xE0 importer":"Inspecter un fichier source"} (JSON, JS, CSV)</span>
          <label class="depot" data-depot>${Fe.importer}<br>Glisser un fichier ici ou toucher pour le choisir<input type="file" accept=".json,.js,.csv,.txt" hidden data-fichier></label>
          <span class="aide">L\u2019inspection montre la structure r\xE9elle du fichier (colonnes, cl\xE9s, exemples) avant d\u2019\xE9tablir la correspondance avec les indicateurs. Rien n\u2019est envoy\xE9 sur internet.</span>
          <div class="inspection">${this.htmlInspection()}</div></div>`:""}
        ${l==="csv"||l==="fichier"?`<div class="champ"><span class="lib">Correspondance des colonnes CSV</span>
          <span class="aide">Une ligne = un cr\xE9neau horaire. Flux (lignes, colis, rejets, erreurs, colis exp\xE9di\xE9s) additionn\xE9s ; stocks (charge, attente, effectifs) : derni\xE8re valeur.</span>
          <div class="duo">${Object.entries(o.csv.colonnes).map(([c,u])=>`<div class="champ" style="margin-top:.3rem"><label class="mono" style="font-size:.85rem">${c}</label>${cr(`donnees.csv.colonnes.${c}`,u)}</div>`).join("")}</div></div>`:""}
        <div class="duo">
          <div class="champ"><label>Actualisation (secondes)</label>${Kn("donnees.actualisation",o.actualisation,'min="10" step="10"')}</div>
          <div class="champ"><label>Donn\xE9es anciennes au-del\xE0 de (minutes)</label>${Kn("donnees.seuilAncien",o.seuilAncien,'min="1"')}</div>
        </div>
        <div class="rangee"><button class="bouton primaire pressable" type="button" data-cmd="actualiser">${Fe.actualiser}Actualiser maintenant</button></div>
        <div class="message-info${n.erreur?" erreur":""}"><b>\xC9tat :</b> ${Ve({ok:"donn\xE9es \xE0 jour",ancienne:"donn\xE9es anciennes",interrompue:"connexion interrompue",indisponible:"donn\xE9es indisponibles",chargement:"chargement"}[n.etat])} \xB7 ${Ve(this.p.connecteur.libelle(t))}${n.erreur?`<br>${Ve(n.erreur)}`:""}
          ${(((a=this.p.snap)==null?void 0:a.avertissements)||[]).map(c=>`<br>\u25B2 ${Ve(c)}`).join("")}</div>`}if(e==="seuils"){let o=t.objectifs,l=(c,u,d=!0)=>`
        <div class="champ" style="padding-top:.8rem;border-top:1px solid var(--trait)"><span class="lib">${Jt[c].titre} ${ic(Jt[c].validee)}</span>
          <span class="aide">${Ve(Jt[c].formule)}</span>
          <div class="duo"><div class="champ" style="margin-top:.2rem"><label>Vigilance (${u})</label>${Kn(`seuils.${c}.vigilance`,t.seuils[c].vigilance)}</div>
          ${d?`<div class="champ" style="margin-top:.2rem"><label>Critique (${u})</label>${Kn(`seuils.${c}.critique`,t.seuils[c].critique)}</div>`:"<div></div>"}</div>
          <div class="champ" style="margin-top:.3rem"><label>Action propos\xE9e (laisser vide si aucune r\xE8gle d\xE9finie)</label>${cr(`actions.${c}`,t.actions[c])}</div></div>`;return`
        <div class="champ"><span class="lib">Objectif de lignes</span>${gi("objectifs.mode",o.mode,[["quota","Quota \xD7 pr\xE9parateurs pr\xE9sents"],["fixe","Valeur fixe"]])}
          <span class="aide">Un objectif transmis par la source est toujours prioritaire.</span></div>
        <div class="trio">
          <div class="champ"><label>Quota (lignes / jour) ${ic(!0)}</label>${Kn("objectifs.quotaLignes",o.quotaLignes)}</div>
          <div class="champ"><label>Heures de r\xE9f\xE9rence ${ic(!0)}</label>${Kn("objectifs.heuresRef",o.heuresRef,'step="0.1"')}</div>
          <div class="champ"><label>Objectif fixe (lignes)</label>${Kn("objectifs.objectifFixe",o.objectifFixe)}</div>
        </div>
        <div class="champ"><label>Objectif de colis / jour (vide = non suivi)</label>${Kn("objectifs.objectifColis",o.objectifColis)}</div>
        ${l("rythme","% de retard")}
        ${l("capacite","% de la capacit\xE9")}
        ${l("rejetTaux","%")}
        ${l("rejetAttente","colis")}
        ${l("ppmDecelee","PPM")}
        <div class="champ"><label>PPM d\xE9cel\xE9e : volume minimal avant \xE9valuation (lignes)</label>${Kn("seuils.ppmDecelee.minLignes",t.seuils.ppmDecelee.minLignes)}</div>
        ${l("effectif","absents")}
        ${l("debit","% du d\xE9bit moyen",!1)}
        <div class="rangee"><button class="bouton danger pressable" type="button" data-cmd="seuils-defaut">R\xE9tablir les seuils par d\xE9faut</button></div>`}if(e==="equipes")return`<p class="aide" style="margin-top:.8rem;color:var(--texte-2)">Horaires utilis\xE9s pour le rythme attendu, la capacit\xE9 restante et les filtres. \xC0 ajuster aux horaires r\xE9els du service.</p>
        ${t.equipes.map((o,l)=>{var c,u,d,h;return`<div class="champ" style="padding-top:.8rem;border-top:1px solid var(--trait)"><span class="lib">\xC9quipe ${Ve(o.nom)}</span>
          <div class="duo">
            <div class="champ" style="margin-top:.2rem"><label>D\xE9but</label><input class="saisie" type="time" data-eq="${l}.debut" value="${o.debut}"></div>
            <div class="champ" style="margin-top:.2rem"><label>Fin</label><input class="saisie" type="time" data-eq="${l}.fin" value="${o.fin}"></div>
            <div class="champ" style="margin-top:.2rem"><label>Pause : d\xE9but</label><input class="saisie" type="time" data-eq="${l}.p0" value="${((u=(c=o.pauses)==null?void 0:c[0])==null?void 0:u[0])||""}"></div>
            <div class="champ" style="margin-top:.2rem"><label>Pause : fin</label><input class="saisie" type="time" data-eq="${l}.p1" value="${((h=(d=o.pauses)==null?void 0:d[0])==null?void 0:h[1])||""}"></div>
          </div></div>`}).join("")}`;if(e==="briefing"){let o=t.briefing;return`
        <div class="champ"><label>Point s\xE9curit\xE9 : standard du jour</label>
          <select class="saisie" data-sel="briefing.standard">${rr.map(l=>`<option value="${l.id}" ${l.id===o.standard?"selected":""}>${l.id} \u2014 ${Ve(l.titre)}</option>`).join("")}</select></div>
        <div class="champ"><label>Message s\xE9curit\xE9</label><textarea class="saisie" data-txt="briefing.message" rows="3">${Ve(o.message)}</textarea></div>
        <div class="champ"><span class="lib">Trois priorit\xE9s du jour (fix\xE9es par le superviseur)</span>
          ${[0,1,2].map(l=>`<input class="saisie" type="text" data-prio="${l}" value="${Ve(o.priorites[l]||"")}" placeholder="Priorit\xE9 ${l+1}" style="margin-top:.4rem">`).join("")}
          <span class="aide">Vides : le briefing reprend les priorit\xE9s issues des r\xE8gles d\u2019alerte. M\xE9moris\xE9 sur cet \xE9cran.</span></div>`}return e==="demo"?`
        <div class="message-info">Ces sc\xE9narios ne concernent que la d\xE9monstration. Ils permettent de pr\xE9senter et de v\xE9rifier chaque \xE9tat de l\u2019\xE9cran. En exploitation, aucune alerte n\u2019est simul\xE9e.</div>
        <div class="champ"><span class="lib">Sc\xE9nario</span>${gi("demo.scenario",t.demo.scenario,[["normal","Journ\xE9e normale"],["objectif","Objectif bient\xF4t atteint"],["incident","Incident rejet"],["ancienne","Donn\xE9es anciennes"],["interrompue","Connexion interrompue"],["vide","Aucune donn\xE9e"]])}
          <span class="aide">\xAB Objectif bient\xF4t atteint \xBB : l\u2019objectif est franchi \xE0 l\u2019actualisation suivante (\u2248 2 min) et d\xE9clenche la c\xE9l\xE9bration.</span></div>
        <div class="champ"><span class="lib">Horloge de d\xE9monstration</span>${gi("demo.horloge",t.demo.horloge,[["auto","R\xE9elle pendant le poste, simul\xE9e sinon"],["reelle","Toujours r\xE9elle"]])}</div>`:`
      <div class="d-section"><h3>PICK // MISSION CONTROL</h3><p>Version ${ku} \xB7 format de donn\xE9es normalis\xE9 v1.</p>
        <p class="note">Sch\xE9ma de flux illustratif ; graphiques quantitatifs en 2D ; valeurs manquantes affich\xE9es comme indisponibles ; estimations identifi\xE9es avec leur m\xE9thode.</p></div>
      <div class="d-section"><h3>Liens utiles</h3><p class="note">Param\xE8tres d\u2019URL : <code class="mono">?mode=briefing</code>, <code class="mono">?mode=immersion</code>, <code class="mono">?qualite=basse</code>, <code class="mono">?rendu=2d</code>, <code class="mono">?anim=suspendues</code>, <code class="mono">?equipe=matin</code>.</p></div>
      <div class="rangee"><button class="bouton danger pressable" type="button" data-cmd="tout-reinitialiser">Effacer les r\xE9glages m\xE9moris\xE9s sur cet \xE9cran</button></div>`}htmlInspection(){let e=this.inspection;if(!e)return"";let t=`<div class="message-info${e.avertissement?" erreur":""}"><b>${Ve(e.nom)}</b> \xB7 ${Ve(e.type.toUpperCase())} \xB7 ${Math.round(e.taille/1024)} ko${e.avertissement?`<br>\u25B2 ${Ve(e.avertissement)}`:""}${e.normalise?"<br>\u25CF Format normalis\xE9 reconnu.":""}</div>`;return e.entetes.length&&(t+=`<p class="aide" style="margin-top:.5rem">${e.nbLignes} lignes \xB7 s\xE9parateur \xAB ${e.separateur==="	"?"tabulation":Ve(e.separateur)} \xBB \xB7 colonnes :</p>
        <code class="code-bloc">${e.entetes.map(Ve).join(" | ")}</code>
        <table><thead><tr>${e.entetes.slice(0,6).map(n=>`<th>${Ve(n)}</th>`).join("")}</tr></thead><tbody>${e.exemples.map(n=>`<tr>${e.entetes.slice(0,6).map(s=>`<td>${Ve(n[s])}</td>`).join("")}</tr>`).join("")}</tbody></table>`),e.cles.length&&(t+=`<table><thead><tr><th>Cl\xE9</th><th>Type</th><th>Exemple</th></tr></thead><tbody>${e.cles.slice(0,30).map(n=>`<tr><td>${Ve(n.chemin)}</td><td>${Ve(n.type)}</td><td>${Ve(n.exemple)}</td></tr>`).join("")}</tbody></table>`),t}appliquer(e,t){var s,r;let n=e.startsWith("donnees.")||e.startsWith("demo.")||e.startsWith("equipes");this.p.regler(up(e,t),{recharger:n}),(r=(s=this.ctx).surReglage)==null||r.call(s,e,t)}brancher(e,t){var s,r,a;t.querySelectorAll("[data-onglet]").forEach(o=>o.addEventListener("click",()=>this.ouvrir(o.dataset.onglet))),e.querySelectorAll("[data-seg]").forEach(o=>o.addEventListener("click",l=>{let c=l.target.closest("button");if(!c)return;let u=c.dataset.v;(u==="true"||u==="false")&&(u=u==="true"),this.appliquer(o.dataset.seg,u),["donnees.source","affichage.qualite"].includes(o.dataset.seg)?this.ouvrir(this.onglet):o.querySelectorAll("button").forEach(d=>d.setAttribute("aria-pressed",String(d===c)))})),e.querySelectorAll("[data-num]").forEach(o=>o.addEventListener("change",()=>{let l=o.value.trim().replace(",","."),c=l===""?null:Number(l);if(c!==null&&!Number.isFinite(c))return;let u=o.dataset.num;if(u==="donnees.actualisation"&&c!==null&&c<10){o.value=10,this.appliquer(u,10);return}this.appliquer(u,c)})),e.querySelectorAll("[data-txt]").forEach(o=>o.addEventListener("change",()=>this.appliquer(o.dataset.txt,o.value))),e.querySelectorAll("[data-sel]").forEach(o=>o.addEventListener("change",()=>this.appliquer(o.dataset.sel,o.value))),e.querySelectorAll("[data-prio]").forEach(o=>o.addEventListener("change",()=>{let l=[...this.p.cfg.briefing.priorites];l[Number(o.dataset.prio)]=o.value,this.appliquer("briefing.priorites",l)})),e.querySelectorAll("[data-eq]").forEach(o=>o.addEventListener("change",()=>{var h;let[l,c]=o.dataset.eq.split("."),u=JSON.parse(JSON.stringify(this.p.cfg.equipes)),d=u[Number(l)];if(o.value){if(c==="debut"||c==="fin")d[c]=o.value;else if(d.pauses=(h=d.pauses)!=null&&h.length?d.pauses:[["",""]],d.pauses[0][c==="p0"?0:1]=o.value,!d.pauses[0][0]||!d.pauses[0][1])return;this.p.cfg.equipes=u,this.appliquer("equipes",u)}})),(s=e.querySelector('[data-cmd="actualiser"]'))==null||s.addEventListener("click",()=>this.p.actualiser({raison:"manuel"})),(r=e.querySelector('[data-cmd="seuils-defaut"]'))==null||r.addEventListener("click",()=>{this.p.regler({seuils:rs.seuils,actions:rs.actions,objectifs:rs.objectifs}),this.ouvrir("seuils")}),(a=e.querySelector('[data-cmd="tout-reinitialiser"]'))==null||a.addEventListener("click",()=>{Vu(),window.location.reload()});let n=e.querySelector("[data-depot]");if(n){let o=l=>{if(!l)return;let c=new FileReader;c.onload=()=>{let u=String(c.result||"");this.inspection=Qu(l.name,u),this.p.cfg.donnees.source==="fichier"?(this.p.connecteur.importe={nom:l.name,texte:u,date:l.lastModified?new Date(l.lastModified).toISOString():null},this.p.actualiser({raison:"import"}).then(()=>this.ouvrir("donnees"))):this.ouvrir("donnees")},c.readAsText(l,(/\.csv$|\.txt$/i.test(l.name),"utf-8"))};n.querySelector("input").addEventListener("change",l=>o(l.target.files[0])),n.addEventListener("dragover",l=>{l.preventDefault(),n.classList.add("survol")}),n.addEventListener("dragleave",()=>n.classList.remove("survol")),n.addEventListener("drop",l=>{l.preventDefault(),n.classList.remove("survol"),o(l.dataTransfer.files[0])})}}};var Ca=class{constructor(e,t){this.p=t,this.app=e,this.noeud=null,this.fermerSiDehors=n=>{this.noeud&&!this.noeud.contains(n.target)&&!n.target.closest('[data-action="filtres"]')&&this.fermer()}}get ouvert(){return!!this.noeud}basculer(e){this.noeud?this.fermer():this.ouvrir(e)}ouvrir(e){let t=this.p.filtres,n=[["toutes","Toutes"],...this.p.cfg.equipes.map(a=>[a.id,a.nom])];this.noeud=ot(`<div class="popover" role="dialog" aria-label="Filtres">
      <h2>FILTRES \xB7 DATE, P\xC9RIODE, \xC9QUIPE</h2>
      <div class="champ"><label for="flt-date">Date</label>
        <div class="duo"><input id="flt-date" class="saisie" type="date" value="${t.date}" max="${Kt(new Date)}">
        <button class="bouton pressable" type="button" data-auj>Aujourd\u2019hui</button></div></div>
      <div class="champ"><span class="lib">P\xE9riode</span><div class="segment" data-k="periode">${[["jour","Jour"],["semaine","Semaine"],["mois","Mois"]].map(([a,o])=>`<button type="button" class="pressable" data-v="${a}" aria-pressed="${t.periode===a}">${o}</button>`).join("")}</div></div>
      <div class="champ"><span class="lib">\xC9quipe</span><div class="segment" data-k="equipe">${n.map(([a,o])=>`<button type="button" class="pressable" data-v="${a}" aria-pressed="${t.equipe===a}">${o}</button>`).join("")}</div></div>
      <div class="rangee"><button class="bouton primaire pressable" type="button" data-fermer style="flex:1">Retour au tableau de bord</button></div>
    </div>`),this.app.appendChild(this.noeud);let s=e.getBoundingClientRect(),r=this.noeud.offsetWidth;this.noeud.style.left=`${Math.max(8,Math.min(window.innerWidth-r-8,s.left+s.width/2-r/2))}px`,this.noeud.style.top=`${s.bottom+10}px`,this.noeud.querySelector("#flt-date").addEventListener("change",a=>{a.target.value&&this.p.setFiltres({date:a.target.value})}),this.noeud.querySelector("[data-auj]").addEventListener("click",()=>{let a=Kt(new Date);this.noeud.querySelector("#flt-date").value=a,this.p.setFiltres({date:a})}),this.noeud.querySelectorAll(".segment").forEach(a=>a.addEventListener("click",o=>{let l=o.target.closest("button");l&&(a.querySelectorAll("button").forEach(c=>c.setAttribute("aria-pressed",String(c===l))),this.p.setFiltres({[a.dataset.k]:l.dataset.v}))})),this.noeud.querySelector("[data-fermer]").addEventListener("click",()=>this.fermer()),setTimeout(()=>document.addEventListener("pointerdown",this.fermerSiDehors),0)}fermer(){var e;document.removeEventListener("pointerdown",this.fermerSiDehors),(e=this.noeud)==null||e.remove(),this.noeud=null}};var bh={critique:2,vigilance:1},hp=(i,e,t)=>e==null?"indisponible":t.filter(n=>n.kpi===i).reduce((n,s)=>bh[s.niveau]>(bh[n]||0)?s.niveau:n,"conforme"),Pa=class{constructor(e,t){this.noeud=ot(`<section class="briefing" aria-label="Briefing \xE9quipe">
      <div class="brief-titre"><h1>BRIEFING \xC9QUIPE</h1><span class="s"></span><span class="h"></span></div>
      <div class="brief-chiffres">
        ${[["lignes","Lignes pr\xE9par\xE9es","lignes"],["charge","Charge restante","charge"],["qualite","Qualit\xE9 \xB7 PPM","qualite"],["effectif","Effectif","effectif"]].map(([n,s,r],a)=>`
          <button class="module brief-chiffre pressable" type="button" data-kpi="${n}" data-etat="indisponible" style="--i:${a}">
            <span class="l">${Fe[r]}${s}</span>
            <span class="v"><span class="n">\u2014</span><small class="u"></small></span>
            <span class="c"><span class="x"></span><span class="etat-z"></span></span>
          </button>`).join("")}
      </div>
      <div class="brief-bas">
        <section class="module brief-bloc securite" data-etat="conforme">
          <h2>${Fe.securite}Point s\xE9curit\xE9<button class="modifier pressable" type="button" data-modifier>${Fe.modifier}Modifier</button></h2>
          <div class="std"><span class="code"></span><div><div class="t"></div><div class="s"></div></div></div>
          <div class="msg"></div>
          <a class="lien" target="_blank" rel="noopener">${Fe.lien}<span>Ouvrir le standard dans l\u2019application Standards</span></a>
        </section>
        <section class="module brief-bloc">
          <h2>${Fe.priorite}<span class="tp">3 priorit\xE9s du jour</span><button class="modifier pressable" type="button" data-modifier>${Fe.modifier}Modifier</button></h2>
          <ol class="brief-prio"></ol>
        </section>
      </div>
    </section>`),e.appendChild(this.noeud),this.compteurs={},this.noeud.querySelectorAll(".brief-chiffre").forEach(n=>{this.compteurs[n.dataset.kpi]=new mi(n.querySelector(".n")),n.addEventListener("click",()=>t.ouvrirKpi(n.dataset.kpi))}),this.noeud.querySelectorAll("[data-modifier]").forEach(n=>n.addEventListener("click",()=>t.modifier())),this.noeud.querySelector(".brief-prio").addEventListener("click",n=>{let s=n.target.closest("[data-alerte]");s&&t.ouvrirAlerte(s.dataset.alerte)})}maj(e,t,n,s,r){var y;let a=fi(r.date),o=r.equipe==="toutes"?"toutes \xE9quipes":`\xE9quipe ${((y=s.equipes.find(m=>m.id===r.equipe))==null?void 0:y.nom)||r.equipe}`;ft(this.noeud.querySelector(".brief-titre .s"),`${lr(or(a))} \xB7 ${o}`),ft(this.noeud.querySelector(".brief-titre .h"),e!=null&&e.disponible&&e.estJour&&e.heure!==null?`Situation \xE0 ${vt(e.heure)}`:"");let l=e==null?void 0:e.disponible,c={lignes:l?e.lignes.valeur:null,charge:l?e.charge.valeur:null,qualite:l?e.qualite.ppm:null,effectif:l?e.effectif.present:null},u={lignes:l&&e.lignes.objectif?`/ ${Y(e.lignes.objectif)}`:"lignes",charge:"lignes",qualite:"ppm",effectif:l&&e.effectif.prevu!==null?`/ ${Y(e.effectif.prevu,e.effectif.moyen?1:0)}`:"pers."},d={lignes:l&&e.lignes.objectif?`<span><b>${Gt(e.lignes.pctObjectif)}</b> de l\u2019objectif</span>`:"<span>objectif indisponible</span>",charge:l&&e.charge.finEstimee?`<span>fin estim\xE9e <b>${e.charge.finEstimee.auDela?"apr\xE8s le poste":e.charge.finEstimee.heure}</b></span>`:"<span>lignes \xE0 pr\xE9parer</span>",qualite:l?`<span><b>${Y(e.qualite.erreurs)}</b> erreurs d\xE9cel\xE9es \xB7 seuil ${Y(s.seuils.ppmDecelee.vigilance)}</span>`:"<span>\u2014</span>",effectif:l&&e.effectif.preparateurs!==null?`<span>dont <b>${Y(e.effectif.preparateurs,e.effectif.moyen?1:0)}</b> pr\xE9parateurs</span>`:"<span>personnes</span>"};this.noeud.querySelectorAll(".brief-chiffre").forEach(m=>{var w;let f=m.dataset.kpi,S=l?hp(f,c[f],t):"indisponible";m.dataset.etat=S,this.compteurs[f].dec=f==="effectif"&&((w=e==null?void 0:e.effectif)!=null&&w.moyen)?1:0,this.compteurs[f].regler(c[f]),ft(m.querySelector(".u"),u[f]),It(m.querySelector(".x"),d[f]),It(m.querySelector(".etat-z"),Cn(S))});let h=rr.find(m=>m.id===s.briefing.standard)||rr[9];ft(this.noeud.querySelector(".std .code"),h.id),ft(this.noeud.querySelector(".std .t"),h.titre),ft(this.noeud.querySelector(".std .s"),h.sous),ft(this.noeud.querySelector(".msg"),s.briefing.message||h.sous),this.noeud.querySelector(".lien").href=`../index.html#${h.id}`;let p=n.some(m=>m.origine==="superviseur");ft(this.noeud.querySelector(".tp"),"3 priorit\xE9s du jour");let g=[];for(let m=0;m<3;m++){let f=n[m];if(!f){g.push(`<li class="vide">${m===0?"Aucune priorit\xE9 : d\xE9finir les priorit\xE9s du jour (Modifier)":"Pas d\u2019autre priorit\xE9"}</li>`);continue}let S=Zt.find(w=>w.id===f.zone);g.push(`<li data-niveau="${f.niveau}" ${f.alerte?`data-alerte="${f.alerte.id}" role="button" tabindex="0"`:""}><span class="n">${m+1}</span><div><div class="t">${Ve(f.texte)}</div><div class="s">${f.origine==="superviseur"?"Fix\xE9e par le superviseur":`R\xE8gle d\u2019alerte \xB7 ${S?`${S.code} ${S.nom}`:""} \xB7 ${Ve(f.constat||"")}`}</div></div></li>`)}It(this.noeud.querySelector(".brief-prio"),g.join("")),this.noeud.dataset.manuelles=String(p)}};var Ia=class{constructor(e,t){this.c=e,this.pile=ot('<div class="toasts" aria-live="polite"></div>'),this.c.appendChild(this.pile),this.ouvrirAlerte=t}alerte(e){let t=Zt.find(r=>r.id===e.zone),n=ot(`<button class="toast pressable" type="button" data-niveau="${e.niveau}">
      ${Fe[e.niveau]}
      <span><span class="c">NOUVELLE ALERTE \xB7 ${e.niveau==="critique"?"CRITIQUE":"VIGILANCE"} \xB7 ${t?`${t.code} ${t.nom.toUpperCase()}`:""}</span><br><span class="t">${Ve(e.message)}</span></span>
    </button>`);n.addEventListener("click",()=>{this.ouvrirAlerte(e.id),s()});let s=()=>{n.isConnected&&(n.classList.add("sortie"),setTimeout(()=>n.remove(),360))};for(this.pile.prepend(n);this.pile.children.length>2;)this.pile.lastElementChild.remove();setTimeout(s,9e3)}info(e,t="info",n="INFORMATION"){let s=ot(`<div class="toast" data-niveau="${t}">${Fe.info}<span><span class="c">${n}</span><br><span class="t">${Ve(e)}</span></span></div>`);this.pile.prepend(s),setTimeout(()=>{s.classList.add("sortie"),setTimeout(()=>s.remove(),360)},5e3)}celebration(e,t){let n=ot(`<div class="celebration" role="status"><span class="c">LIGNES PR\xC9PAR\xC9ES</span><span class="t">OBJECTIF ATTEINT</span><span class="s">${Y(e)} / ${Y(t)} lignes</span></div>`);this.c.appendChild(n),setTimeout(()=>n.remove(),3500)}};var La=class{constructor(e,t){this.c=ot('<div class="etiquettes"></div>'),e.appendChild(this.c),this.n={};for(let n of Zt){let s=ot(`<button class="etiquette pressable" type="button" data-zone="${n.id}" data-etat="indisponible" aria-label="Zone ${n.nom}">
        <span class="h"><span class="code">${n.code}</span>${n.court}<span class="ic"></span></span>
        <span class="v"><b>\u2014</b><span></span></span>
        <span class="e"></span>
      </button>`);s.addEventListener("click",()=>t(n.id)),this.c.appendChild(s),this.n[n.id]=s}}positions(e){for(let[t,n]of Object.entries(this.n)){let s=e[t];s&&(n.style.visibility=s.visible?"visible":"hidden",n.style.transform=`translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(1)}px, 0) translate(-50%, -100%)`)}}maj(e,t){var n;for(let s of Zt){let r=this.n[s.id],a=((n=e==null?void 0:e[s.id])==null?void 0:n.etat)||"indisponible";r.dataset.etat=a,It(r.querySelector(".ic"),Fe[a]);let o=t==null?void 0:t[s.id];ft(r.querySelector(".v b"),o?o[0]:"\u2014"),ft(r.querySelector(".v span"),o?o[1]:""),ft(r.querySelector(".e"),xa[a]),r.setAttribute("aria-label",`Zone ${s.nom} : ${o?`${o[0]} ${o[1]}`:"indisponible"}, \xE9tat ${xa[a].toLowerCase()}. Ouvrir le d\xE9tail.`)}}activer(e){this.c.classList.toggle("masquees",!!e);for(let[t,n]of Object.entries(this.n))n.classList.toggle("active",t===e)}flash(e){let t=this.n[e];t&&(t.classList.remove("flash"),t.offsetWidth,t.classList.add("flash"),setTimeout(()=>t.classList.remove("flash"),3400))}};sc();var Sh={conforme:"#20d69d",vigilance:"#ffb43a",critique:"#ff4d5f",indisponible:"#5d6d84"},Fa=class{constructor(e,{surZone:t}){this.c=document.createElement("div"),this.c.className="schema2d",e.appendChild(this.c),this.surZone=t;let n=15*Math.PI/180,s=Math.sin(39*Math.PI/180),r=(f,S)=>[(f*Math.cos(n)-S*Math.sin(n))*24,(f*Math.sin(n)+S*Math.cos(n))*s*24],a=[];for(let f of Object.values(xi)){let[S,w,M,E]=f.rect;a.push(r(S,M),r(w,E),r(S,E),r(w,M))}let o=a.map(f=>f[0]),l=a.map(f=>f[1]),c=40;this.vb=[Math.min(...o)-c,Math.min(...l)-c-60,Math.max(...o)-Math.min(...o)+2*c,Math.max(...l)-Math.min(...l)+2*c+60],this.iso=r;let u=f=>f.map(([S,w])=>r(S,w).map(M=>M.toFixed(1)).join(",")).join(" "),d=([f,S,w,M])=>u([[f,w],[S,w],[S,M],[f,M]]),h=hs.rangees.map(f=>`<polygon points="${d([hs.x0,hs.x1,f-.5,f+.5])}" fill="#1d4f8f" fill-opacity=".55" stroke="#4d86c8" stroke-width="1"/>`).join(""),p=f=>`<polyline points="${u(f)}" fill="none" stroke="#1a2537" stroke-width="16" stroke-linejoin="round" stroke-linecap="round"/><polyline points="${u(f)}" fill="none" stroke="#3cd6ff" stroke-opacity=".55" stroke-width="2" stroke-dasharray="8 10" class="flux"/>`,g=Object.entries(xi).map(([f,S])=>`<g class="zone2d" data-zone="${f}" role="button" tabindex="0"><polygon points="${d(S.rect)}" fill="#3cd6ff" fill-opacity=".05" stroke="#3cd6ff" stroke-width="2" data-contour/></g>`).join(""),y=Na.map(f=>`<polygon points="${d([f.x-.15,f.x+.15,f.z-1.3,f.z+1.3])}" fill="#dff4ff" fill-opacity=".6"/>`).join(""),m=zn;this.c.innerHTML=`<svg viewBox="${this.vb.join(" ")}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Sch\xE9ma 2D du flux Pick & Pack">
      ${g}${h}
      ${Ua.map(p).join("")}${p(Gi)}${p(ds)}${p(fs)}
      <polygon points="${d([3.4-.75,3.4+.75,4.5-.75,4.5+.75])}" fill="none" stroke="#9eeaff" stroke-width="3"/>
      <polygon points="${d([m.x-m.l/2,m.x+m.l/2,m.z-m.p/2,m.z+m.p/2])}" fill="#8fa2b8" fill-opacity=".5" stroke="#b4c3d4"/>
      ${y}
      <g class="colis"></g>
    </svg>`,this.svg=this.c.querySelector("svg"),this.gColis=this.c.querySelector(".colis"),this.c.addEventListener("click",f=>{let S=f.target.closest("[data-zone]");S&&t(S.dataset.zone)}),this.trajets=[0,1,2].map(f=>new bn([...hr(f),...ds.slice(1)])),this.trajetRejet=new bn([...hr(1),...fs.slice(1)]),this.points=Array.from({length:26},(f,S)=>({k:S%4,d:S*1.4})),this.flux={actif:!0,taux:.03},this.boucle=this.boucle.bind(this),this.t0=performance.now(),this.dessinerColis(0),requestAnimationFrame(this.boucle)}ancres(e,t){let[n,s,r,a]=this.vb,o=Math.min(e/r,t/a),l=(e-r*o)/2,c=(t-a*o)/2,u={};for(let[d,h]of Object.entries(xi)){let[p,g,y,m]=h.rect,[f,S]=this.iso((p+g)/2,(y+m)/2);u[d]={x:l+(f-n)*o,y:c+(S-s)*o-18,visible:!0}}return u}majEtats(e){this.c.querySelectorAll("[data-zone]").forEach(t=>{var a;let n=((a=e==null?void 0:e[t.dataset.zone])==null?void 0:a.etat)||"indisponible",s=t.querySelector("[data-contour]");s.setAttribute("stroke",Sh[n]),s.setAttribute("fill",Sh[n]),s.setAttribute("fill-opacity",n==="critique"||n==="vigilance"?".14":".05"),s.setAttribute("stroke-width",n==="critique"?"4":"2"),s.setAttribute("stroke-dasharray",n==="indisponible"?"6 6":"");let r=Zt.find(o=>o.id===t.dataset.zone);t.setAttribute("aria-label",`Zone ${r==null?void 0:r.nom} : ${n}`)})}majFlux({actif:e,taux:t}){this.flux={actif:e,taux:t??.03}}dessinerColis(e){let t={x:0,z:0,cap:0},n=this.points.map((s,r)=>{let a=this.flux.taux>0&&r%Math.max(2,Math.round(1/Math.max(.02,this.flux.taux)))===0,o=a?this.trajetRejet:this.trajets[s.k%3],l=(s.d+e*1.1)%o.longueur;o.a(l,t);let[c,u]=this.iso(t.x,t.z);return`<rect x="${(c-5).toFixed(1)}" y="${(u-9).toFixed(1)}" width="10" height="8" rx="1.5" fill="${a&&l>o.longueur-7?"#ffcf8a":"#c49a68"}" stroke="#2a1d10" stroke-width=".8"/>`}).join("");this.gColis.innerHTML=n}boucle(e){this.c.isConnected&&(Qt.plein&&this.flux.actif&&!document.hidden&&this.c.offsetParent&&this.dessinerColis((e-this.t0)/1e3),requestAnimationFrame(this.boucle))}impulsion(){}celebrer(){}reglerAnimation(){}reglerMode(){}reglerQualite(){}redimensionner(){}zoomZone(){}vueGenerale(){}infoQualite(){return"Sch\xE9ma 2D (sans 3D)"}};function zf(){var Z,ee,be,Be;let{reglages:i,url:e,memorises:t}=Gu();i.affichage.mode=((Z=e.reglages.affichage)==null?void 0:Z.mode)||"exploitation";let n=document.getElementById("app");n.classList.add("ouverture"),n.dataset.mode=i.affichage.mode,Qt.regler(i.affichage.animations);let s=new ma(i,e.filtres,e.heureForcee,t),r={m:null,alertes:[],zones:{},snap:null,resume:{},scene:null,sceneType:null},a=ot('<main class="grille"></main>'),o=ot('<section class="col col-g" aria-label="Indicateurs : pr\xE9paration"></section>'),l=ot('<section class="col col-d" aria-label="Indicateurs : production et qualit\xE9"></section>'),c=ot(`<section class="scene-cadre" aria-label="Sch\xE9ma 3D du flux Pick & Pack">
    <canvas aria-hidden="true"></canvas>
    <div class="scene-bandeau">
      <div class="scene-titre"><span class="t">SCH\xC9MA DU FLUX \xB7 PR\xC9PARATION \u2192 EXP\xC9DITION</span><span class="s">Implantation non repr\xE9sentative \xB7 colis anim\xE9s : illustration du d\xE9bit agr\xE9g\xE9</span><span class="avis"></span></div>
      <div class="scene-legende"><span style="color:var(--vert)">${Fe.conforme}Conforme</span><span style="color:var(--ambre)">${Fe.vigilance}Vigilance</span><span style="color:var(--rouge)">${Fe.critique}Critique</span><span style="color:var(--gris)">${Fe.indisponible}Indisponible</span></div>
    </div>
    <div class="scene-pied"><span class="flux-etat"></span><span class="perf"></span></div>
    <button class="vue-generale pressable" type="button" hidden>${Fe.vue}Vue g\xE9n\xE9rale</button>
    <div class="scene-message" hidden><div><div class="t"></div><div class="s"></div></div></div>
  </section>`),u=ot('<section class="bas" aria-label="Production et priorit\xE9s"></section>');a.append(o,c,l,u),n.appendChild(a),[["scene",c],["colg",o],["cold",l],["bas",u]].forEach(([N,H])=>{H.style.viewTransitionName=N});let d=new Aa(n),h=new Ca(n,s),p=new Ia(c,N=>B(N)),g=new La(c,N=>X(N)),y=c.querySelector(".avis"),m=c.querySelector(".flux-etat"),f=c.querySelector(".perf"),S=c.querySelector(".vue-generale"),w=c.querySelector(".scene-message"),M=tc.map((N,H)=>{let se=new Sa(N,H+1);return(N.col==="g"?o:l).appendChild(se.noeud),se.noeud.addEventListener("click",()=>I(N.id)),se}),E=new Ea(u,N=>I(N)),x=new Ta(u,N=>I(N)),R=new wa(u,N=>B(N),()=>q.ouvrir("briefing")),_=new Pa(a,{ouvrirKpi:N=>I(N),ouvrirAlerte:N=>B(N),modifier:()=>q.ouvrir("briefing")});_.noeud.style.viewTransitionName="briefing";let T=c.querySelector("canvas");async function C(){var se,oe,le;let N=s.cfg.affichage.rendu==="3d"&&e.webgl;if(r.scene){if(r.sceneType==="3d"===N)return;(oe=(se=r.scene).liberer)==null||oe.call(se),(le=r.scene.c)==null||le.remove(),r.scene=null}let H="";if(N)try{let{Scene3D:Te,webglDisponible:Re}=await Promise.resolve().then(()=>(Bf(),Of));if(!Re())throw new Error("WebGL2 non pris en charge");let Ge=new Te(T,c,{surZone:lt=>X(lt),surCamera:lt=>g.positions(lt),surQualite:lt=>{var Ht;if(lt.perdu){H="Contexte 3D perdu",P("3D INTERROMPUE PAR LE NAVIGATEUR \xB7 SCH\xC9MA 2D");return}f.textContent=s.cfg.affichage.perf&&lt.info||"",((Ht=q==null?void 0:q.t.contenu)==null?void 0:Ht.cle)==="affichage"&&q.rafraichir()}});Ge.reglerAnimation(Qt.niveau),Ge.init(),Ge.reglerQualite(s.cfg.affichage.qualite),Ge.reglerMode(n.dataset.mode),T.hidden=!1,r.scene=Ge,r.sceneType="3d",new ResizeObserver(()=>Ge.redimensionner()).observe(c),Qt.plein&&!r.reveleFait&&Ge.revele(),r.reveleFait=!0,qe();return}catch(Te){console.warn("3D indisponible :",Te),H="3D INDISPONIBLE SUR CET \xC9CRAN \xB7 SCH\xC9MA 2D"}else H=e.webgl?"SCH\xC9MA 2D (R\xC9GLAGES)":"SCH\xC9MA 2D (3D D\xC9SACTIV\xC9E PAR L\u2019ADRESSE)";P(H)}function P(N){r.scene&&r.sceneType==="3d"&&r.scene.liberer(),T.hidden=!0;let H=new Fa(c,{surZone:oe=>X(oe)});c.insertBefore(H.c,T.nextSibling),r.scene=H,r.sceneType="2d",r.raison2d=N;let se=()=>g.positions(H.ancres(c.clientWidth,c.clientHeight));new ResizeObserver(se).observe(c),se(),qe()}function L(){if(!d.ouvert&&!z)return 0;let N=c.getBoundingClientRect(),H=Math.min(window.innerWidth,parseFloat(getComputedStyle(document.documentElement).fontSize)*46);return Math.max(0,N.right-(window.innerWidth-H))}let z=!1;function I(N){let H=xh(N,r.m,r.alertes,s.cfg,r.snap,s.statut);d.ouvrir({...H,type:"kpi",cle:N})}function B(N){let H=r.alertes.find(se=>se.id===N);if(!H){p.info("Cette alerte n\u2019est plus active \xE0 la derni\xE8re actualisation.");return}d.ouvrir(_h(H))}function W(){d.ouvrir(yh(r.alertes))}function X(N){var H;z=!0,n.dataset.mode==="briefing"&&ie("exploitation"),(H=r.scene)==null||H.zoomZone(N,!1,L()),g.activer(N),S.hidden=r.sceneType!=="3d",d.ouvrir(nc(N,r.m,r.zones,r.resume)),z=!1}function re(){var N;(N=r.scene)==null||N.vueGenerale(),g.activer(null),S.hidden=!0}d.surFermeture=()=>{var N;((N=r.scene)!=null&&N.zoneActive||!S.hidden)&&re()},S.addEventListener("click",()=>{d.fermer(),re()}),d.noeud.addEventListener("click",N=>{let H=N.target.closest("[data-alerte]");if(H){B(H.dataset.alerte);return}let se=N.target.closest("[data-zone]");se&&!N.target.closest(".tiroir-tete")&&X(se.dataset.zone)});let q=new Ra(d,s,{get scene(){return r.scene},surReglage:(N,H)=>{var se,oe,le,Te;N==="affichage.qualite"&&((oe=(se=r.scene)==null?void 0:se.reglerQualite)==null||oe.call(se,H)),N==="affichage.rendu"&&C(),N==="affichage.animations"&&te(H),N==="affichage.perf"&&(f.textContent=H&&((Te=(le=r.scene)==null?void 0:le.infoQualite)==null?void 0:Te.call(le))||""),N.startsWith("briefing")&&Ze(!1),N==="donnees.source"&&xe.majDemo(H==="demo",r.snap)}});function te(N){var H,se;Qt.regler(N),(se=(H=r.scene)==null?void 0:H.reglerAnimation)==null||se.call(H,Qt.niveau),xe.majAnimations(Qt.niveau)}function ie(N){if(n.dataset.mode===N)return;let H=()=>{var se,oe,le,Te;n.dataset.mode=N,xe.majMode(N),N==="briefing"&&d.fermer(),(oe=(se=r.scene)==null?void 0:se.reglerMode)==null||oe.call(se,N),N!=="briefing"&&((Te=(le=r.scene)==null?void 0:le.redimensionner)==null||Te.call(le))};document.startViewTransition&&Qt.plein?document.startViewTransition(H):H()}function Ce(){let N=document;if(N.fullscreenElement||N.webkitFullscreenElement)(N.exitFullscreen||N.webkitExitFullscreen).call(N);else{let H=N.documentElement,se=H.requestFullscreen||H.webkitRequestFullscreen;se?Promise.resolve(se.call(H)).catch(()=>p.info("Plein \xE9cran refus\xE9 par le navigateur.")):p.info("Plein \xE9cran non pris en charge par ce navigateur.")}}let xe=new va(n,{mode:ie,filtres:N=>h.basculer(N),actualiser:()=>s.actualiser({raison:"manuel"}),alertes:W,animations:()=>{let N=s.cfg.affichage.animations,H=Qt.niveau==="off"?r.animAvant&&r.animAvant!=="suspendues"?r.animAvant:"auto":"suspendues";r.animAvant=N,s.regler({affichage:{animations:H}}),te(H)},"plein-ecran":Ce,reglages:()=>q.ouvrir()});xe.majMode(n.dataset.mode),xe.majAnimations(Qt.niveau),xe.majFiltres(s.filtres,s.cfg),(Be=(ee=window.matchMedia)==null?void 0:(be=ee.call(window,"(prefers-reduced-motion: reduce)")).addEventListener)==null||Be.call(be,"change",()=>te(s.cfg.affichage.animations));function st(N){var oe,le;if(!(N!=null&&N.disponible))return!1;if(N.estJour)return!!N.enCours&&N.heure!==null&&N.fenetre&&N.heure>=N.fenetre.debut;let H=Kt(new Date);if(!pi(s.filtres.date,s.filtres.periode).includes(H))return!1;let se=pn((le=(oe=r.snap)==null?void 0:oe.meta)==null?void 0:le.heure)??ar(new Date);return N.fenetre&&se>=N.fenetre.debut&&se<N.fenetre.fin}function qe(){var le;let N=r.scene;if(!N)return;let H=r.m;N.majEtats(r.zones);let se=st(H);N.majFlux({actif:se,debit:H!=null&&H.disponible?H.production.debit??H.production.debitMoyen:null,taux:H!=null&&H.disponible?((le=H.rejets.recent)==null?void 0:le.taux)??H.rejets.taux:null,attente:H!=null&&H.disponible?H.rejets.attente:0});let oe;H!=null&&H.disponible?se?oe=`FLUX ILLUSTR\xC9 \xB7 D\xC9BIT ${H.production.debit!==null?`${Y(H.production.debit)} COLIS/H (DERNI\xC8RE HEURE)`:"MOYEN DE LA P\xC9RIODE"} \xB7 REJET ${H.rejets.recent?`${Y(H.rejets.recent.taux*100,1)} %`:H.rejets.taux!==null?`${Y(H.rejets.taux*100,1)} %`:"\u2014"}`:oe=H.estJour&&H.heure!==null&&H.fenetre&&H.heure<H.fenetre.debut?"FLUX \xC0 L\u2019ARR\xCAT \xB7 AVANT LA PRISE DE POSTE":"VUE HISTORIQUE \xB7 FLUX FIG\xC9 (P\xC9RIODE TERMIN\xC9E)":oe="FLUX : DONN\xC9ES INDISPONIBLES",m.textContent=r.sceneType==="2d"&&r.raison2d?`${r.raison2d} \xB7 ${oe}`:oe}function Ze(N){let{m:H,alertes:se}=r,oe=!r.dejaRendu&&!!(H!=null&&H.disponible),le=oe&&Qt.plein&&performance.now()<4e3;if(M.forEach(Re=>Re.maj(H,se,{depuisZero:le,cfg:s.cfg})),E.maj(H,{animer:!oe}),x.maj(H,se,{depuisZero:le}),R.maj(Ql(se,s.cfg.briefing.priorites,"moment"),!!(H!=null&&H.disponible)),_.maj(H,se,Ql(se,s.cfg.briefing.priorites,"jour"),s.cfg,s.filtres),r.resume=oh(H),g.maj(r.zones,r.resume),xe.majAlertes(se),xe.majDemo(s.cfg.donnees.source==="demo",r.snap),qe(),w.hidden=!!(H!=null&&H.disponible),!(H!=null&&H.disponible)){let Re=s.statut.etat==="chargement";w.querySelector(".t").textContent=Re?"CHARGEMENT DES DONN\xC9ES\u2026":"DONN\xC9ES INDISPONIBLES",w.querySelector(".s").textContent=Re?s.connecteur.libelle(s.cfg):s.statut.erreur||"Aucune donn\xE9e pour cette date, p\xE9riode et \xE9quipe."}let Te=d.contenu;d.ouvert&&Te&&!N&&(Te.type==="kpi"?I(Te.cle):Te.type==="alertes"?W():Te.type==="zone"?d.ouvrir(nc(Te.cle,r.m,r.zones,r.resume)):Te.type==="alerte"&&r.alertes.some(Re=>Re.id===Te.cle)&&B(Te.cle)),H!=null&&H.disponible&&(r.dejaRendu=!0)}s.on("donnees",({m:N,alertes:H,zones:se,snap:oe,transition:le})=>{var Te;Object.assign(r,{m:N,alertes:H,zones:se,snap:oe}),Ze(!1),le===!1&&((Te=d.contenu)==null?void 0:Te.type)==="reglages"&&q.rafraichir()}),s.on("nouvellesAlertes",N=>{N.slice(0,3).forEach((H,se)=>setTimeout(()=>{var oe,le;p.alerte(H),(le=(oe=r.scene)==null?void 0:oe.impulsion)==null||le.call(oe,H.zone,H.niveau),g.flash(H.zone)},se*600))}),s.on("objectif",({valeur:N,objectif:H})=>{var se,oe,le;p.celebration(N,H),(oe=(se=r.scene)==null?void 0:se.celebrer)==null||oe.call(se),(le=M.find(Te=>Te.def.id==="lignes"))==null||le.celebrer()}),s.on("chargement",()=>xe.majChargement(!0)),s.on("statut",N=>{var se,oe;xe.majChargement(!1),xe.majStatut(N);let H=N.derniereReussite?ki(new Date(N.derniereReussite)):"\u2014";y.innerHTML=N.etat==="interrompue"?`<span class="etat" data-etat="critique">${Fe.coupe}<span>CONNEXION INTERROMPUE \xB7 DERNI\xC8RES VALEURS CONNUES ${H}</span></span>`:N.etat==="ancienne"?`<span class="etat" data-etat="vigilance">${Fe.ancien}<span>DONN\xC9ES ANCIENNES \xB7 EXTRAITES ${N.genere?pa(N.genere).toUpperCase():""}</span></span>`:N.etat==="indisponible"&&((se=r.m)!=null&&se.disponible)?`<span class="etat" data-etat="indisponible">${Fe.vide}<span>DONN\xC9ES INDISPONIBLES \xB7 VALEURS DE ${H}</span></span>`:"",!((oe=r.m)!=null&&oe.disponible)&&N.etat!=="chargement"&&(w.querySelector(".t").textContent="DONN\xC9ES INDISPONIBLES",w.querySelector(".s").textContent=N.erreur||"Aucune donn\xE9e pour cette date, p\xE9riode et \xE9quipe.")}),s.on("filtres",N=>{xe.majFiltres(N,s.cfg),r.dejaRenduFiltre=!0}),s.on("reglages",()=>xe.majFiltres(s.filtres,s.cfg)),document.addEventListener("keydown",N=>{N.target.closest("input, textarea, select")||(N.key==="Escape"?(h.fermer(),d.fermer(),re()):N.key==="1"?ie("exploitation"):N.key==="2"?ie("immersion"):N.key==="3"?ie("briefing"):N.key==="f"||N.key==="F"?Ce():N.key==="r"||N.key==="R"?s.actualiser({raison:"manuel"}):N.key===" "&&(N.preventDefault(),xe.actions.animations()))}),Ze(!1),C(),s.demarrer(),setTimeout(()=>n.classList.remove("ouverture"),1900),window.PickMC={pilote:s,etat:r,changerMode:ie,ouvrirZone:X,vueGenerale:re}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",zf):zf();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
