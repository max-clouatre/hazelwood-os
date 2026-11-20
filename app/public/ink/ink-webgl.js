var InkWebGL=(()=>{var xf=Object.create;var Ir=Object.defineProperty;var yf=Object.getOwnPropertyDescriptor;var bf=Object.getOwnPropertyNames;var gf=Object.getPrototypeOf,wf=Object.prototype.hasOwnProperty;var Yc=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports),kf=(e,t)=>{for(var i in t)Ir(e,i,{get:t[i],enumerable:!0})},Zc=(e,t,i,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of bf(t))!wf.call(e,r)&&r!==i&&Ir(e,r,{get:()=>t[r],enumerable:!(a=yf(t,r))||a.enumerable});return e};var Qc=(e,t,i)=>(i=e!=null?xf(gf(e)):{},Zc(t||!e||!e.__esModule?Ir(i,"default",{value:e,enumerable:!0}):i,e)),Tf=e=>Zc(Ir({},"__esModule",{value:!0}),e);var yu=Yc((xp,Fa)=>{var xu=(()=>{let e=38*Math.PI/180,t=24,i=Number.isFinite,a=(o,h)=>{if(!o)throw new RangeError("Camera lens: "+h)},r=o=>i(o)&&o>0&&o<Math.PI;function n(o,h=t){a(i(o)&&o>0&&i(h)&&h>0,"focal length and sensor height must be positive millimeters");let s=2*Math.atan(h/2/o);return a(r(s),"lens must have a representable vertical field of view"),s}function p(o,h=t){a(r(o)&&i(h)&&h>0,"invalid field of view or sensor height");let s=h/2/Math.tan(o/2);return a(i(s)&&s>0,"lens must have a representable focal length"),s}function c(o={},h={}){var O,V,Y,f,S;let s=(V=(O=h.sensorHeight)!=null?O:o.sensorHeight)!=null?V:t;a(i(s)&&s>0,"sensor height must be positive millimeters"),h.fov!==void 0&&h.focalLength!==void 0&&a(Math.abs(h.fov-n(h.focalLength,s))<1e-10,"choose field of view or focal length");let d=(Y=o.fov)!=null?Y:o.focalLength!==void 0?n(o.focalLength,o.sensorHeight):e,k=(f=h.fov)!=null?f:d;h.focalLength!==void 0?k=n(h.focalLength,s):h.sensorHeight!==void 0&&h.fov===void 0&&(k=n(p(d,o.sensorHeight),s)),a(r(k),"vertical field of view must be in (0, pi)");let B=(S=h.focusDistance)!=null?S:o.focusDistance;return a(B===void 0||i(B)&&B>0,"focus distance must be positive"),{fov:k,sensorHeight:s,focalLength:p(k,s),...B!==void 0&&{focusDistance:B}}}function m(o={},...h){let s={target:[0,0,0],dist:12,yaw:0,pitch:0,...o,...c(o)};for(let d of h)if(d){let k=c(s,d);s={...s,...d,...k},d.projection!==void 0&&d.ortho===void 0&&(s.ortho=d.projection==="orthographic")}return s.ortho===void 0&&(s.ortho=s.projection==="orthographic"),a(Array.isArray(s.target)&&s.target.length===3&&s.target.every(i)&&[s.yaw,s.pitch,s.dist].every(i)&&s.dist>0,"finite target, orbit and positive distance required"),s.target=s.target.slice(),s.composition!==void 0&&(s.composition=u(s.composition).slice()),s}function u(o){return a(Array.isArray(o)&&o.length===2&&o.every(h=>i(h)&&h>=0&&h<=1),"composition is a normalized screen point [u,v]"),o}function A(o,h){if(a(i(h)&&h>0,"aspect must be positive"),!o.composition)return o.target;let[s,d]=u(o.composition),k=o.dist*Math.tan(o.fov/2),B=Math.sin(o.yaw),O=Math.cos(o.yaw),V=Math.sin(o.pitch),Y=Math.cos(o.pitch),f=[O,0,-B],S=[-V*B,Y,-V*O],q=(.5-s)*2*k*h,P=(d-.5)*2*k;return o.target.map((W,R)=>W+f[R]*q+S[R]*P)}let j=(o,h)=>o[0]*h[0]+o[1]*h[1]+o[2]*h[2],z=(o,h)=>[o[1]*h[2]-o[2]*h[1],o[2]*h[0]-o[0]*h[2],o[0]*h[1]-o[1]*h[0]];function T(o){let h=d=>Array.isArray(d)&&d.length===3&&d.every(i);a(o&&[o.eye,o.right,o.up,o.back].every(h),"pose requires a finite eye and camera axes");let s=[o.right,o.up,o.back];return a(s.every(d=>Math.abs(j(d,d)-1)<1e-4)&&Math.abs(j(s[0],s[1]))<1e-4&&Math.abs(j(s[0],s[2]))<1e-4&&Math.abs(j(s[1],s[2]))<1e-4&&j(z(s[0],s[1]),s[2])>.9999,"pose axes must be right-handed and orthonormal"),Object.fromEntries(["eye","right","up","back"].map(d=>[d,o[d].slice()]))}function b(o){return a(o&&o.length===16&&Array.from(o).every(i),"view matrix must be finite"),T({eye:[-(o[0]*o[12]+o[1]*o[13]+o[2]*o[14]),-(o[4]*o[12]+o[5]*o[13]+o[6]*o[14]),-(o[8]*o[12]+o[9]*o[13]+o[10]*o[14])],right:[o[0],o[4],o[8]],up:[o[1],o[5],o[9]],back:[o[2],o[6],o[10]]})}function v(o){let{eye:h,right:s,up:d,back:k}=T(o);return[s[0],d[0],k[0],0,s[1],d[1],k[1],0,s[2],d[2],k[2],0,-j(s,h),-j(d,h),-j(k,h),1]}function w(o,h=0){a(i(h),"camera setback must be finite");let s=T(o);return s.eye=s.eye.map((d,k)=>d-s.back[k]*h),s}function F(o,h,{setback:s=0}={}){var P,W;let d=w(o,s),k=(P=h.translation)!=null?P:[0,0,0],B=(W=h.rotation)!=null?W:[0,0,0];a([k,B].every(R=>Array.isArray(R)&&R.length===3&&R.every(i)),"camera motion requires finite world translation and rotation vectors");let O=Math.hypot(...B);a(i(O),"rotation magnitude must be finite");let V=O?B.map(R=>R/O):[0,0,1],Y=Math.cos(O),f=Math.sin(O);function S(R){let U=z(V,R),J=j(V,R)*(1-Y);return R.map((ie,N)=>ie*Y+U[N]*f+V[N]*J)}let q=S(d.back);return{eye:d.eye.map((R,U)=>R+k[U]+q[U]*s),right:S(d.right),up:S(d.up),back:q}}let l=(o,h,s)=>Math.max(h,Math.min(s,o));function _(o,h){if(!h)return o;let{yaw:s,pitch:d,dist:k}=o;if(h.yaw&&h.yaw[1]-h.yaw[0]<2*Math.PI){let B=(h.yaw[0]+h.yaw[1])/2,O=s-B,V=B+Math.atan2(Math.sin(O),Math.cos(O));s+=l(V,...h.yaw)-V}return h.pitch&&(d=l(d,...h.pitch)),h.distance&&(k=l(k,...h.distance)),{...o,yaw:s,pitch:d,dist:k}}function C(o,h,s,d){let k=Math.sin(o),B=Math.cos(o),O=Math.cos(h),V=O<0?-1:1,Y=[O*k,Math.sin(h),O*B],f=[V*B,0,-V*k];return{eye:d.map((S,q)=>S+s*Y[q]),right:f,up:z(Y,f),back:Y}}function $(o,h,s){let d=o.slice();for(let k=0;k<2;k++){let B=s[0]*o[k]+s[1]*o[4+k]+s[2]*o[8+k]+o[12+k];d[k+12]+=Math.round(B*h)/h-B}return d}function I(o,h,s,d,k=1){let B=Y=>Y===!0?{snap:!0}:Y||{},{snap:O,anchor:V=[0,0,0]}={...B(s),...B(d)};return!o.ortho||!O||d===!1?o.view:(a(Array.isArray(V)&&V.length===3&&Array.from(V).every(i),"snap anchor must be finite XYZ"),$(o.view,h/(2*o.tangent*o.dist*k),V))}function y(o,h,s,d,{orbit:k,impulse:B,probe:O=!1}={}){var X,ae,Q,pe,Ae,Pe,Te,we,Me,He,qe,fe,Ne,We,Se,Ie,ne;a([s,d].every(Ce=>i(Ce)&&Ce>0),"viewport must be positive");let V=(Te=(Ae=(pe=(Q=h.cameraTime)!=null?Q:(ae=(X=h.timeDomains)!=null?X:o.timeDomains)==null?void 0:ae.read("camera").sampleTime)!=null?pe:h.time)!=null?Ae:h.t)!=null?Te:(Pe=o.lookSnapshot)==null?void 0:Pe.time,Y=V!=null?V:0,f=(we=o.cameraRig)==null?void 0:we.sample(Y,{shot:h.cameraShot}).camera,S=m(o.cam,f,O?void 0:h.camera),P=c(S,Object.fromEntries((O?["fov"]:["fov","focalLength","sensorHeight","focusDistance"]).filter(Ce=>h[Ce]!==void 0).map(Ce=>[Ce,h[Ce]]))),W=(Me=h.lensScale)!=null?Me:1,R=(He=h.zoom)!=null?He:1;a(i(W)&&W>0&&i(R)&&R>0,"lens scale and zoom must be positive");let U=Math.tan(P.fov/2)/W,J=s/d,ie=(qe=h.ortho)!=null?qe:h.projection===void 0?S.ortho:h.projection==="orthographic",N=h.lockCamera?void 0:o.anim,K=(fe=h.dist)!=null?fe:S.dist/R,{yaw:Z,pitch:ye,dist:ve}=_({yaw:(Ne=h.yaw)!=null?Ne:S.yaw,pitch:(We=h.pitch)!=null?We:S.pitch,dist:K/((N==null?void 0:N.zoom)||1)},k);a([Z,ye,ve].every(i)&&ve>0,"finite orbit and positive distance required");let me=!(h.target&&Object.hasOwn(h.target,"framebuffer"))&&h.target!=null?h.target:S.target;a((Array.isArray(me)||ArrayBuffer.isView(me))&&me.length===3&&Array.from(me).every(i),"target must be finite XYZ");let Le=A({target:Array.from(me),yaw:Z,pitch:ye,dist:ve,fov:2*Math.atan(U),composition:(Se=h.composition)!=null?Se:S.composition},J).map((Ce,Ue)=>{var Ke,ot;return Ce+((ot=(Ke=N==null?void 0:N.kick)==null?void 0:Ke[Ue])!=null?ot:0)}),te=(Ie=o.radius)!=null?Ie:14,H=ie&&!f&&!S.pose?2*te+4:0,g=ve+H,M=(ne=S.pose)!=null?ne:C(Z,ye,g,Le),G=!O&&(B==null?void 0:B(o,{...h,cameraTime:V},w(M,H)));return G&&(G.translation.some(Boolean)||G.rotation.some(Boolean))&&(M=F(M,G,{setback:H})),{base:S,lens:P,time:Y,motion:G||null,pose:M,view:v(M),framed:Le,yaw:Z,pitch:ye,dist:ve,dist0:K,distance:g,radius:te,setback:H,aspect:J,tangent:U,ortho:ie,clipNear:Math.max(.4,.15*ve),clipFar:400}}function E(o,h,s,d,k,B){let O=h.slice(),V=[0,0,0],Y={origin:O,direction:V,axial:1};return(f,S)=>{let q=(f-s/2)/k,P=(S-d/2)/k;Y.axial=B?1:1/Math.hypot(q,P,1);for(let W=0;W<3;W++){let R=W*4,U=q*o[R]+P*o[R+1];O[W]=h[W]+(B?U:0),V[W]=B?-o[R+2]:(U-o[R+2])*Y.axial}return Y}}return Object.freeze({rays:E,defaultFov:e,defaultSensorHeight:t,fieldOfView:n,focalLength:p,resolve:c,view:m,composition:u,target:A,pose:T,fromView:b,matrix:v,listenerPose:w,applyMotion:F,constrain:_,orbitPose:C,frame:y,snapView:$,artView:I})})();typeof Fa!="undefined"?Fa.exports=xu:globalThis[Symbol.for("ink-studio.camera-lens")]=xu});var ku=Yc((bp,Ca)=>{var wu=(()=>{let e=Number.isFinite,t=2*Math.PI,i=()=>[0,0,0],a={eye:[0,0,0],right:[1,0,0],up:[0,1,0],back:[0,0,1]},r=(f,S)=>{if(!f)throw new TypeError("Camera impulses: "+S)},n=f=>f&&typeof f=="object"&&!Array.isArray(f)&&[Object.prototype,null].includes(Object.getPrototypeOf(f)),p=(f,S)=>n(f)&&Object.keys(f).every(q=>S.includes(q)),c=f=>typeof f=="string"&&/^[A-Za-z0-9_][A-Za-z0-9_.:-]{0,95}$/.test(f)&&!["__proto__","prototype","constructor"].includes(f),m=f=>Array.isArray(f)&&f.length===3&&f.every(S=>e(S)&&Math.abs(S)<=1e6),u=(f,S,q)=>e(f)&&f>=S&&f<=q,A=f=>Math.hypot(...f),j=(f,S)=>f.map(q=>q*S),z=(f,S)=>f.reduce((q,P,W)=>q+P*S[W],0),T=(f,S)=>[f[1]*S[2]-f[2]*S[1],f[2]*S[0]-f[0]*S[2],f[0]*S[1]-f[1]*S[0]],b=(f,S)=>f.map((q,P)=>q-S[P]),v=(f,S=[0,0,1])=>A(f)>1e-10?j(f,1/A(f)):S.slice(),w=f=>(f=Math.max(0,Math.min(1,f)),f*f*(3-2*f)),F=f=>(f&&typeof f=="object"&&(Object.values(f).forEach(F),Object.freeze(f)),f);function l(f,S=0){return r(S<=32,"data nesting budget exceeded"),Array.isArray(f)?f.map(q=>l(q,S+1)):n(f)?Object.fromEntries(Object.entries(f).filter(([,q])=>q!==void 0).map(([q,P])=>[q,l(P,S+1)])):(r(f===null||typeof f=="string"||typeof f=="boolean"||e(f),"expected finite JSON data"),f)}function _(f,S){let q=f>>>0;for(let P of String(S))q=Math.imul(q^P.charCodeAt(0),16777619)>>>0;return q}function C(f,S){let q=(Math.imul(f|0,374761393)^S)>>>0;return q=Math.imul(q^q>>>13,1274126177),((q^q>>>16)>>>0)/4294967295*2-1}function $(f,S){let q=Math.floor(f),P=w(f-q);return C(q,S)*(1-P)+C(q+1,S)*P}function I(f=a){r(n(f)&&[f.eye,f.right,f.up,f.back].every(m),"expected an unshaken eye and orthonormal camera basis");let S=[f.right,f.up,f.back];return r(S.every(q=>Math.abs(A(q)-1)<1e-4)&&Math.abs(z(S[0],S[1]))<1e-4&&Math.abs(z(S[0],S[2]))<1e-4&&Math.abs(z(S[1],S[2]))<1e-4&&z(T(S[0],S[1]),S[2])>.9999,"camera basis must be right-handed and orthonormal"),f}function y(f,S){return[0,1,2].map(q=>f[0]*S.right[q]+f[1]*S.up[q]+f[2]*S.back[q])}function E(f){if(f===void 0||f===!1)return null;r(p(f,["inner","outer","power"]),"invalid distance falloff");let{inner:S=0,outer:q=20,power:P=2}=f;return r(u(S,0,1e6)&&u(q,0,1e6)&&q>S&&u(P,.05,16),"falloff needs increasing radii and a positive power"),{inner:S,outer:q,power:P}}function o(f,S,q,P){var ae,Q;r(p(f,["id","time","duration","translation","rotation","space","direction","source","falloff","propagationSpeed","frequency","damping","attack","release","profile","weight","seed","lever","angularGain","enabled"]),"unknown impulse field");let{id:W=S,time:R=q,duration:U=.7,translation:J=[0,0,0],rotation:ie=[0,0,0],space:N="camera",direction:K,source:Z,propagationSpeed:ye=0,frequency:ve=12,damping:ze=7,attack:me=.015,release:Fe=U*.2,profile:Le="spring",weight:te=1,seed:H=P,lever:g,angularGain:M=0,enabled:G=!0}=f;r(c(W)&&u(R,0,1e12)&&u(U,1e-4,3600)&&m(J)&&m(ie)&&["camera","world","impact"].includes(N)&&["spring","shake","pulse"].includes(Le)&&u(ve,.01,240)&&u(ze,0,1e3)&&u(me,0,U)&&u(Fe,1e-6,U)&&u(te,0,16)&&Number.isSafeInteger(H)&&u(H,0,4294967295)&&typeof G=="boolean","invalid impulse settings"),r((K===void 0||m(K)&&A(K)>1e-8)&&(Z===void 0||m(Z))&&(N!=="impact"||Z!==void 0||K!==void 0)&&(K===void 0||N==="impact"),"impact space needs a source or nonzero world direction"),r(u(ye,0,1e6)&&(!ye||Z!==void 0)&&(g===void 0||m(g))&&u(M,0,100),"invalid propagation or angular leverage");let X=E(f.falloff);return r(!X||Z!==void 0,"distance falloff needs a source"),{id:W,time:R,duration:U,translation:J.slice(),rotation:ie.slice(),space:N,direction:K?v(K):null,source:(ae=Z==null?void 0:Z.slice())!=null?ae:null,falloff:X,propagationSpeed:ye,frequency:ve,damping:ze,attack:me,release:Fe,profile:Le,weight:te,seed:H,lever:(Q=g==null?void 0:g.slice())!=null?Q:null,angularGain:M,enabled:G}}function h(f,S){r(p(f,["id","translation","rotation","space","frequency","octaves","persistence","weight","seed","time","fadeIn","enabled"]),"unknown handheld field");let{id:q,translation:P=[.006,.009,.002],rotation:W=[.001,.0012,8e-4],space:R="camera",frequency:U=.65,octaves:J=3,persistence:ie=.45,weight:N=1,seed:K=S,time:Z=0,fadeIn:ye=.5,enabled:ve=!0}=f;return r(c(q)&&m(P)&&m(W)&&["camera","world"].includes(R)&&u(U,.01,120)&&Number.isSafeInteger(J)&&u(J,1,5)&&u(ie,0,1)&&u(N,0,16)&&Number.isSafeInteger(K)&&u(K,0,4294967295)&&u(Z,0,1e12)&&u(ye,0,60)&&typeof ve=="boolean","invalid handheld layer"),{id:q,translation:P.slice(),rotation:W.slice(),space:R,frequency:U,octaves:J,persistence:ie,weight:N,seed:K,time:Z,fadeIn:ye,enabled:ve}}function s(f){let S=l(f);for(let q of["direction","source","falloff","lever"])S[q]===null&&delete S[q];return S}function d(f={}){r(p(f,["impulses","handheld","seed","translationLimit","rotationLimit","maxImpulses"]),"unknown configuration field");let{impulses:S=[],handheld:q=[],seed:P=1,translationLimit:W=1,rotationLimit:R=.35,maxImpulses:U=256}=f;r(Number.isSafeInteger(P)&&u(P,0,4294967295)&&u(W,0,100)&&u(R,0,Math.PI)&&Number.isSafeInteger(U)&&u(U,1,2048)&&Array.isArray(S)&&S.length<=U&&Array.isArray(q)&&q.length<=32,"invalid limits, seed or history budget");let J=S.map((M,G)=>{var X;return o(M,"impulse."+(G+1),0,_(P,(X=M.id)!=null?X:"impulse."+(G+1)))}),ie=q.map(M=>h(M,_(P,M.id))),N=0,K=0,Z=S.length;r(new Set(J.map(M=>M.id)).size===J.length&&new Set(ie.map(M=>M.id)).size===ie.length,"duplicate impulse or handheld ID");let ye=null,ve=null,ze=M=>M.slice().sort((G,X)=>G.time-X.time||(G.id<X.id?-1:G.id>X.id?1:0));function me(M=N,{pose:G=a}={}){var qe;r(u(M,0,1e12),"sample time must be nonnegative and finite"),I(G);let X=i(),ae=i(),Q=[],pe=[];function Ae(fe,Ne,We,Se,Ie){for(let ne=0;ne<3;ne++)X[ne]+=We[ne],ae[ne]+=Se[ne];Q.push({id:fe,type:Ne,...Ie,translation:We,rotation:Se})}for(let fe of ye!=null?ye:ye=ze(J)){if(!fe.enabled)continue;let Ne=fe.source?A(b(G.eye,fe.source)):0,We=fe.propagationSpeed?Ne/fe.propagationSpeed:0,Se=M-fe.time-We,Ie=fe.weight*(fe.falloff?Math.pow(Math.max(0,Math.min(1,(fe.falloff.outer-Ne)/(fe.falloff.outer-fe.falloff.inner))),fe.falloff.power):1);if(!Ie||Se>=fe.duration)continue;if(Se<0){pe.push({id:fe.id,arrival:fe.time+We,delay:We,distance:Ne,gain:Ie});continue}let ne=1-w((Se-(fe.duration-fe.release))/fe.release),Ce=fe.attack?w(Se/fe.attack):1,Ue=ne*Math.exp(-Se*fe.damping),Ke=fe.profile==="spring"?Math.sin(t*fe.frequency*Se)*Ue*Ce:fe.profile==="pulse"?Ce*(1-Se/fe.duration)**2*ne:Ce*Ue,ot=G;if(fe.space==="world"&&(ot=a),fe.space==="impact"){let ft=(qe=fe.direction)!=null?qe:v(b(G.eye,fe.source),G.back),rt=Math.abs(ft[1])>.97?[1,0,0]:[0,1,0],Et=v(T(rt,ft));ot={right:Et,up:T(ft,Et),back:ft}}let gt=(ft,rt,Et)=>ft*Ke*Ie*(fe.profile==="shake"?$(Se*fe.frequency*(1+rt*.13),fe.seed+Et+rt*231):1),xt=y(fe.translation.map((ft,rt)=>gt(ft,rt,11)),ot),Ye=y(fe.rotation.map((ft,rt)=>gt(ft,rt,397)),ot);if(fe.lever&&fe.angularGain){let ft=j(T(y(fe.lever,G),xt),fe.angularGain);for(let rt=0;rt<3;rt++)Ye[rt]+=ft[rt]}Ae(fe.id,"impulse",xt,Ye,{age:Se,arrival:fe.time+We,delay:We,distance:Ne,gain:Ie,envelope:Ke,profile:fe.profile,space:fe.space})}for(let fe of ve!=null?ve:ve=ze(ie)){let Ie=function(ne,Ce){let Ue=0,Ke=0,ot=1;for(let gt=0;gt<fe.octaves;gt++)Ue+=$(Ne*fe.frequency*(1+ne*.17)*2**gt,fe.seed+Ce+ne*307+gt*647)*ot,Ke+=ot,ot*=fe.persistence;return Ue/Ke*We};var He=Ie;if(!fe.enabled||M<fe.time)continue;let Ne=M-fe.time,We=fe.weight*(fe.fadeIn?w(Ne/fe.fadeIn):1),Se=fe.space==="camera"?G:a;We&&Ae(fe.id,"handheld",y(fe.translation.map((ne,Ce)=>ne*Ie(Ce,0)),Se),y(fe.rotation.map((ne,Ce)=>ne*Ie(Ce,991)),Se),{age:Ne,gain:We,frequency:fe.frequency,space:fe.space})}let Pe=A(X),Te=A(ae),we=Pe?Math.min(1,W/Pe):1,Me=Te?Math.min(1,R/Te):1;return F({time:M,translation:j(X,we),rotation:j(ae,Me),contributions:Q,pending:pe,limits:{translationScale:we,rotationScale:Me},activeCount:Q.length})}function Fe(M){var ae;r(J.length<U,"impulse history budget reached; cancel, prune or clear history");let G=Z+1;for(r(Number.isSafeInteger(G),"serial budget exceeded");J.some(Q=>Q.id==="impulse."+G);)G++,r(Number.isSafeInteger(G),"serial budget exceeded");let X=o(M,"impulse."+G,N,_(P,(ae=M==null?void 0:M.id)!=null?ae:"impulse."+G));return r(!J.some(Q=>Q.id===X.id),"duplicate impulse ID"),J.push(X),ye=null,Z=G,X.id}function Le(){return{format:"ink-studio/camera-impulses",version:1,time:N,compensation:K,serial:Z,settings:{seed:P,translationLimit:W,rotationLimit:R,maxImpulses:U},impulses:J.map(s),handheld:l(ie)}}let te=Le();function H(M){var X,ae,Q;r(n(M)&&M.format==="ink-studio/camera-impulses"&&M.version===1&&u(M.time,0,1e12)&&e((X=M.compensation)!=null?X:0)&&Math.abs((ae=M.compensation)!=null?ae:0)<=Number.EPSILON*Math.max(1,M.time)*4&&Array.isArray(M.impulses)&&Array.isArray(M.handheld)&&Number.isSafeInteger(M.serial)&&M.serial>=0&&p(M.settings,["seed","translationLimit","rotationLimit","maxImpulses"])&&Object.entries({seed:P,translationLimit:W,rotationLimit:R,maxImpulses:U}).every(([pe,Ae])=>M.settings[pe]===Ae),"incompatible checkpoint");let G=d({...M.settings,impulses:M.impulses,handheld:M.handheld}).snapshot();return J=G.impulses.map((pe,Ae)=>o(pe,pe.id,0,P+Ae*101>>>0)),ie=G.handheld.map((pe,Ae)=>h(pe,P+Ae*139>>>0)),ye=ve=null,N=M.time,K=(Q=M.compensation)!=null?Q:0,Z=M.serial,g}let g=Object.freeze({sample:me,emit:Fe,impulse:Fe,get time(){return N},advance(M,G){r(u(M,0,1e6)&&u(N+M,0,1e12),"advance needs bounded nonnegative seconds");let X=M-K,ae=N+X;return K=ae-N-X,N=ae,me(N,G)},seek(M,G){return r(u(M,0,1e12),"seek needs nonnegative seconds"),N=M,K=0,me(N,G)},setLayer(M){var ae,Q;r(n(M)&&c(M.id),"handheld edits need an ID");let G=ie.findIndex(pe=>pe.id===M.id),X=h({...ie[G],...M},(Q=(ae=ie[G])==null?void 0:ae.seed)!=null?Q:_(P,M.id));return r(G>=0||ie.length<32,"handheld layer budget reached"),ve=null,G>=0?ie[G]=X:ie.push(X),g},removeLayer:M=>(ie=ie.filter(G=>G.id!==M),ve=null,g),cancel:M=>(J=J.filter(G=>G.id!==M),ye=null,g),clear(){return J=[],ye=null,g},prune(M){return r(u(M,0,1e12),"prune needs nonnegative seconds"),ye=null,J=J.filter(G=>G.time+G.duration+(G.falloff&&G.propagationSpeed?G.falloff.outer/G.propagationSpeed:G.propagationSpeed?1/0:0)>M),g},snapshot:Le,restore:H,reset:()=>H(te),bind(M){r(n(M),"bind needs a mutable world");let G=M.cameraImpulses;return M.cameraImpulses=g,r(M.cameraImpulses===g,"world must allow a live camera binding"),()=>{M.cameraImpulses===g&&(G===void 0?delete M.cameraImpulses:M.cameraImpulses=G)}}});return g}let k=new WeakMap;function B(f){return f===void 0||f===!1?null:typeof(f==null?void 0:f.sample)=="function"?f:(r(n(f),"expected a motion definition or live impulse sampler"),k.has(f)||k.set(f,d(f)),k.get(f))}function O(f={},S={},q){var U,J,ie,N,K,Z,ye,ve,ze,me,Fe,Le;if(S.lockCamera)return null;let P=(ie=(U=S.cameraImpulses)!=null?U:f.cameraImpulses)!=null?ie:(J=f.look)==null?void 0:J.cameraImpulses,W=B(P);if(!W)return null;let R=(Le=(Fe=(me=(ve=(ye=(Z=(N=S.cameraImpulseTime)!=null?N:S.cameraTime)!=null?Z:(K=f.timeDomains)==null?void 0:K.read("camera").sampleTime)!=null?ye:S.time)!=null?ve:S.t)!=null?me:(ze=f.lookSnapshot)==null?void 0:ze.time)!=null?Fe:W.time)!=null?Le:0;return W.sample(R,{pose:q})}let V={recoil:{profile:"spring",space:"camera",duration:.42,frequency:17,damping:17,translation:[0,0,.12],rotation:[.045,0,.002]},crash:{profile:"spring",space:"impact",duration:1.7,frequency:5,damping:3.5,translation:[0,0,.42],rotation:[.012,.018,.018],lever:[0,.5,0],angularGain:.5,falloff:{inner:2,outer:24,power:1.5}},thunder:{profile:"shake",space:"impact",duration:3.4,frequency:1.8,damping:.7,attack:.12,translation:[0,.065,.035],rotation:[.004,.005,.003],falloff:{inner:0,outer:220,power:1.2},propagationSpeed:80}};function Y(f,S={}){r(Object.hasOwn(V,f)&&n(S),"unknown preset");let q={...l(V[f]),...l(S)};return q.space==="impact"&&q.source===void 0&&q.direction===void 0&&(q.direction=[0,0,1]),q.source===void 0&&(delete q.falloff,delete q.propagationSpeed),o(q,"preset",0,1),F(q)}return Object.freeze({create:d,prepare:B,frame:O,preset:Y,restore:f=>d(f.settings).restore(f)})})();typeof Ca!="undefined"?Ca.exports=wu:globalThis[Symbol.for("ink-studio.camera-impulses")]=wu});var Bd={};kf(Bd,{captureCamera:()=>or,createBrowserSimulationWorkers:()=>Ul,createCameraAtlas:()=>Bl,createComparisonRenderer:()=>Jr,createDrawingInput:()=>vl,createRenderer:()=>Bi,createSpatialAudioPlayer:()=>_l,createSplatInstances:()=>ju,createSplatPipeline:()=>Gr,createSurfacePipeline:()=>zo,createTransition:()=>ml,createTransitionComposer:()=>Do,createTransitionPlayback:()=>ll,createViewerInput:()=>Zi,default:()=>Bi,defineTransition:()=>Kr,mountCausalInspection:()=>ql,mountComparisonView:()=>Pl,mountLinkedViews:()=>Sl,mountSimulationBranches:()=>Il,pixelShaderSources:()=>Ur,splatShaderSources:()=>ir,transitionEasings:()=>ul,transitionPresets:()=>hl,transitionShaders:()=>nl});var Ef=`#version 300 es
void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.0-1.0,0,1);}`,Af=`#version 300 es
precision highp float;precision highp int;
uniform highp sampler2D u_matData,u_matSource,u_matBones,u_matBase;
uniform int u_matRows,u_matCount;uniform bool u_matHasBase,u_matOrtho,u_matLiveLight;
uniform vec3 u_matEye,u_matView,u_matLight;uniform float u_matTime;
out vec4 color;
vec4 setting(int id,int slot){int q=id*9+slot;return texelFetch(u_matData,ivec2(q%1024,u_matRows+q/1024),0);}
vec3 unit(vec3 a,vec3 fallback){float l=length(a);return l>1e-8?a/l:fallback;}
mat3 bone(int id,out vec3 translation){int i=id*3;ivec2 p=ivec2(i%768,i/768);vec4 a=texelFetch(u_matBones,p,0),b=texelFetch(u_matBones,p+ivec2(1,0),0),c=texelFetch(u_matBones,p+ivec2(2,0),0);translation=vec3(a.w,b.w,c.w);return transpose(mat3(a.xyz,b.xyz,c.xyz));}
float lobe(vec4 p,vec3 n,vec3 t,vec3 b,vec3 v,vec3 light,float visibility,float steps){
 vec3 h=unit(v+light,n);float nt=dot(n,h);if(dot(n,light)<=0.0||nt<=0.0)return 0.0;
 float ht=dot(t,h),hb=dot(b,h),c=cos(p.w),s=sin(p.w);
 float response=exp(-pow((ht*c+hb*s)/nt/max(.001,p.x),2.0))*exp(-pow((hb*c-ht*s)/nt/max(.001,p.y),2.0));
 float w=clamp(response*p.z*visibility,0.0,1.0);return steps>1.0?floor(w*steps+.5)/steps:w;
}
void main(){ivec2 pixel=ivec2(gl_FragCoord.xy);int i=pixel.x+pixel.y*512;
 vec4 previous=u_matHasBase?texelFetch(u_matBase,pixel,0):vec4(1,1,1,0);
 if(i>=u_matCount){color=vec4(0);return;}
 vec4 normal=texelFetch(u_matData,ivec2(pixel.x*2,pixel.y),0),axis=texelFetch(u_matData,ivec2(pixel.x*2+1,pixel.y),0);
 int id=int(normal.w)-1;ivec2 source=ivec2(pixel.x*4,pixel.y);
 vec4 at=texelFetch(u_matSource,source,0),shape=texelFetch(u_matSource,source+ivec2(2,0),0),animation=texelFetch(u_matSource,source+ivec2(3,0),0);
 int flags=int(shape.w),kind=flags&15;
 if(id<0||at.w<=0.0||(flags&(32768|32))!=0){color=previous;return;}
 vec3 position=at.xyz,n=normal.xyz,t=axis.xyz;mat3 transform=mat3(1);
 float ph=animation.x,sp=animation.y,rg=animation.z,ex=animation.w,time=u_matTime;
 if(kind==5){float a=time*sp,c=cos(a),s=sin(a);transform=mat3(c,0,-s,0,1,0,s,0,c);position=transform*position;}
 else if(kind==12||kind==13){vec3 move;transform=bone(int(ph+.5),move);vec3 p=transform*position+move;
  if(rg>0.0){vec3 move2;mat3 second=bone(int(sp+.5),move2);p=mix(p,second*position+move2,rg);transform=transform*(1.0-rg)+second*rg;}
  position=p;if(kind==13){position.x+=.022*sin(time*1.9+position.y*1.3+position.z*.9+1.0);position.y+=.0132*sin(time*2.47+position.x*1.1+1.0);}}
 else if(kind==6)position.y+=sin(time*sp+ph)*rg;
 else if(kind==8){float f=.2+.8*abs(sin(time*sp+ph));position.x=rg+(position.x-rg)*f;position.z=ex+(position.z-ex)*f;position.y+=.14*sin(time*sp*.31+ph);}
 else if(kind==9)position.xz*=1.0+rg*sin(time*sp+ph-position.y*ex);
 else if(kind==10){float q=length(position.xz),w=min(1.0,q*.22);position.y+=rg*w*sin(time*sp+ph-q*ex);position.xz+=rg*.6*w*vec2(-position.z,position.x)/max(q,.01)*sin(time*sp*.7+ph-q*ex*.6);}
 else if(kind==14){float spread=rg*max(0.0,position.y-ex);position.x+=spread*sin(time*sp+ph);position.z+=spread*.6*sin(time*sp*.73+ph*1.7);}
 else if(kind==2||kind==3||kind==15){float phase=fract(time*sp/max(rg,.000001)+ph);position.y+=(kind==3?1.0:-1.0)*phase*rg;
  if(kind==3)position.x+=sin(phase*7.0+ph*50.0)*.25*phase;
  if(kind==15){position.x+=sin(phase*11.0+ph*40.0)*ex;position.z+=cos(phase*7.0+ph*23.0)*ex*.6;}}
 else if(kind==11){position.x+=rg*sin(time*sp+position.y*1.3+position.z*.9+ph);position.y+=rg*.6*sin(time*sp*1.3+position.x*1.1+ph);}
 if(abs(determinant(transform))>1e-8)n=transpose(inverse(transform))*n;t=transform*t;
 n=unit(n,vec3(0,1,0));t-=n*dot(t,n);t=unit(t,unit(cross(abs(n.x)<.8?vec3(1,0,0):vec3(0,1,0),n),vec3(1,0,0)));
 vec3 b=cross(n,t),v=unit(u_matOrtho?u_matView:u_matEye-position,n),light=unit(u_matLiveLight?u_matLight:setting(id,8).xyz,vec3(0,1,0));
 float packed=texelFetch(u_matSource,source+ivec2(1,0),0).w;
 vec3 original=vec3(mod(packed,256.0),mod(floor(packed/256.0),256.0),floor(packed/65536.0))/255.0;
 vec3 rgb=min(vec3(1),original*(previous.w>0.0?previous.rgb:vec3(1)));
 vec4 diffuse=setting(id,0);rgb*=mix(vec3(1),diffuse.rgb,diffuse.a);
 vec4 sky=setting(id,3),horizon=setting(id,4),ground=setting(id,5);
 float nv=clamp(dot(n,v),0.0,1.0),up=n.y*2.0*nv-v.y,q=clamp(abs(up)/.8,0.0,1.0);q=q*q*(3.0-2.0*q);
 vec3 reflected=mix(horizon.rgb,up<0.0?ground.rgb:sky.rgb,q);
 float reflection=clamp((horizon.a+(1.0-horizon.a)*pow(1.0-nv,ground.a))*sky.a,0.0,1.0);
 rgb=mix(rgb,reflected,reflection);
 vec4 spec=setting(id,1),specColor=setting(id,2),coat=setting(id,6),coatColor=setting(id,7);
 rgb=mix(rgb,specColor.rgb,lobe(spec,n,t,b,v,light,axis.w,specColor.a));
 rgb=mix(rgb,coatColor.rgb,lobe(coat,n,t,b,v,light,axis.w,coatColor.a));
 color=vec4(rgb/max(original,vec3(.00001)),1);
}`;function Jc(e,t,i,a,r){var V,Y;let n=r.KIT,p=(V=r.MaterialControls)!=null?V:n==null?void 0:n.material,c=(Y=r.SurfaceLook)!=null?Y:n==null?void 0:n.surface,m=f=>{var S;return!!((S=f.surfaces)!=null&&S.some(q=>{var P;return(P=q.settings)==null?void 0:P.materialControls}))};if(!p||!c)return{has:()=>!1,compose:(f,S,q,P,W)=>W};let u,A,j,z,T,b,v,w,F,l,_,C,$,I,y,E,o=[],h,s;function d(f,S){if(f===void 0)return S;if(Array.isArray(f))return f;let q=typeof f=="string"?parseInt(f.slice(1),16):u.pal[f];return[q>>>16&255,q>>8&255,q&255].map(P=>P/255)}function k(f){var Z,ye,ve,ze,me,Fe,Le,te,H,g,M,G,X,ae,Q;let{settings:S,light:q}=f,P=(Z=S.layers)!=null?Z:{},W=["control-diffuse","control-reflection","control-specular","control-coating"],R=c.prepare({...S,layers:Object.fromEntries(W.map(pe=>[pe,P[pe]]))},u.pal,q,u.surfaceEffects,{paletteRoles:u.paletteRoles}),U=pe=>R.layers.find(Ae=>Ae.id===pe),J=U(W[0]),ie=U(W[1]),N=U(W[2]),K=U(W[3]);if(R.layers.some(pe=>pe.mask||pe.drive||pe.spatialMask))throw new Error("Native material-control slots do not accept masks or signal drives; add them as separate surface layers");return[...d(J==null?void 0:J.color,[1,1,1]),(ye=J==null?void 0:J.strength)!=null?ye:0,...(ve=N==null?void 0:N.roughness)!=null?ve:[.45,.45],(ze=N==null?void 0:N.strength)!=null?ze:0,(me=N==null?void 0:N.rotation)!=null?me:0,...d(N==null?void 0:N.color,[1,1,1]),(Le=(Fe=N==null?void 0:N.steps)!=null?Fe:S.steps)!=null?Le:0,...d(ie==null?void 0:ie.sky,[.6,.78,.97]),(te=ie==null?void 0:ie.strength)!=null?te:0,...d(ie==null?void 0:ie.horizon,[.86,.91,.97]),(H=ie==null?void 0:ie.f0)!=null?H:.04,...d(ie==null?void 0:ie.ground,[.21,.23,.28]),(g=ie==null?void 0:ie.power)!=null?g:5,...(M=K==null?void 0:K.roughness)!=null?M:[.12,.12],(G=K==null?void 0:K.strength)!=null?G:0,(X=K==null?void 0:K.rotation)!=null?X:0,...d(K==null?void 0:K.color,[1,1,1]),(Q=(ae=K==null?void 0:K.steps)!=null?ae:S.steps)!=null?Q:0,...q!=null?q:[0,1,0],0]}function B(f,S){var W,R,U,J,ie,N,K,Z,ye,ve,ze,me,Fe,Le,te,H,g;let q=(W=S.materialRevision)!=null?W:f.materialRevision,P=u!==f||A!==f.data||j!==f.count||(v==null?void 0:v.length)!==f.surfaces.length||z!==f.surfaceData||T!==f.surfaces||b!==q||(v==null?void 0:v.some((M,G)=>M!==f.surfaces[G].settings));if(P){u=f,A=f.data,j=f.count,z=f.surfaceData,T=f.surfaces,b=q,v=T.map(M=>M.settings),_=Math.ceil(f.count/512),w=new Float32Array((_+Math.ceil(T.length*9/1024))*4096),l=[],T.forEach((M,G)=>{var X;(X=M.settings)!=null&&X.materialControls&&w.set(k(M),_*4096+G*36)});for(let M=0;M<f.count;M++)(U=(R=T[(z==null?void 0:z[M*8])-1])==null?void 0:R.settings)!=null&&U.materialControls&&l.push(M);C!=null||(C=i.table(1024,31,a))}if(P||(J=f.anim)!=null&&J.rig||((ie=S.changedRows)==null?void 0:ie.length)!==0){let M=(N=f.anim)==null?void 0:N.rig,G=(ye=(Z=f.rest)!=null?Z:(K=f.anim)==null?void 0:K.base)!=null?ye:f.data,X=new Map;for(let ae of l){let Q=ae*8,pe=z[Q]-1,Ae=T[pe].settings,Pe=[0,1,2].map(qe=>{var fe,Ne,We;return(G[ae*16+qe]-((Ne=(fe=Ae.origin)==null?void 0:fe[qe])!=null?Ne:0))/((We=Ae.scale)!=null?We:1)}),Te=Array.from(z.subarray(Q+1,Q+4)),we=z[Q+5]||z[Q+6]||z[Q+7]?Array.from(z.subarray(Q+5,Q+8)):(ve=Ae.direction)!=null?ve:[1,0,0],Me={x:[1,0,0],y:[0,1,0],z:[0,0,1]};if(typeof we=="string")we=(ze=Me[we])!=null?ze:Me.x;else if(typeof we=="function")we=we(Pe,Te);else if(we.type==="circular")we=n.V.cross((me=Me[we.axis])!=null?me:Me.y,Pe);else if(we.type==="weave"){let qe=(Fe=Me[we.along])!=null?Fe:Array.isArray(we.along)?we.along:Me.x,fe=(Le=Me[we.across])!=null?Le:Array.isArray(we.across)?we.across:Me.y,Ne=(te=we.scale)!=null?te:.2;we=Math.floor(n.V.dot(qe,Pe)/Ne)+Math.floor(n.V.dot(fe,Pe)/Ne)&1?qe:fe}else Array.isArray(we)||(we=Me.x);if(!Array.isArray(we)||we.length!==3||!we.every(Number.isFinite))throw new TypeError("Material direction must produce finite XYZ");let He=(H=M==null?void 0:M.free)!=null&&H[ae]?0:(g=M==null?void 0:M.bid)==null?void 0:g[ae];if(He){let qe=X.get(He);if(!qe){let fe=M.M.subarray(He*12,He*12+9);qe={A:fe,normal:Math.abs(n.M.det(fe))>1e-8?n.M.tr(n.M.inv(fe)):n.M.id()},X.set(He,qe)}Te=n.M.app(qe.normal,Te),we=n.M.app(qe.A,we)}w.set([...Te,pe+1,...we,z[Q+4]],Q)}C.upload(w)}else C.bind()}function O(f,S,q,P,W){var ie;if(S.materialControls===!1||!f.count||!m(f))return W;if(!E&&!e.getExtension("EXT_color_buffer_float"))throw new Error("Native material controls require EXT_color_buffer_float");try{B(f,S)}catch(N){throw u=null,N}E!=null||(E=t.program(Ef,Af)),y!=null||(y=t.allocate("VertexArray")),$!=null||($=t.texture()),I!=null||(I=t.texture()),W||(i.textureUnit(21,I),e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,1,1,0,e.RGBA,e.FLOAT,new Float32Array([1,1,1,0])));let R=[512,Math.ceil(f.count/512)];(o[0]!==R[0]||o[1]!==R[1])&&(i.textureUnit(31,$),e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,...R,0,e.RGBA,e.FLOAT,null),o=R,C.bind());let U=F!=null?F:F=t.allocate("Framebuffer");if(e.bindFramebuffer(e.FRAMEBUFFER,U),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,$,0),e.drawBuffers([e.COLOR_ATTACHMENT0]),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)throw new Error("Material finish framebuffer is incomplete");s!==f.surfaceLight&&(s=f.surfaceLight,h=s?c.prepareLightTrack(s):null);let J=(ie=S.materialLight)!=null?ie:h==null?void 0:h(P);if(J&&(!Array.isArray(J)||J.length!==3||!J.every(Number.isFinite)||Math.hypot(...J)<1e-8))throw new TypeError("Material light needs a nonzero finite XYZ direction");return e.viewport(0,0,...o),e.disable(e.BLEND),e.disable(e.DEPTH_TEST),e.disable(e.SCISSOR_TEST),e.colorMask(!0,!0,!0,!0),e.bindVertexArray(y),e.useProgram(E.p),E.set({u_matData:31,u_matSource:0,u_matBones:4,u_matBase:21,u_matRows:_,u_matCount:f.count,u_matHasBase:W,u_matEye:q.eye,u_matView:[q.view[2],q.view[6],q.view[10]],u_matOrtho:q.ortho,u_matTime:P,u_matLight:J!=null?J:[0,1,0],u_matLiveLight:!!J}),e.drawArrays(e.TRIANGLES,0,3),e.bindFramebuffer(e.FRAMEBUFFER,null),i.textureUnit(21,$),!0}return{has:m,compose:O}}var So=`
uniform highp sampler2D u_eData,u_eCookies;
uniform highp sampler3D u_eShadow;
uniform int u_eCount,u_eFogCount,u_ePick;
uniform vec3 u_eShadowMin,u_eShadowSize;
uniform float u_eShadowStep,u_eAmbient;
uniform vec4 u_eSun;
uniform vec3 u_eSunColor;
vec4 eRow(int light,int row){return texelFetch(u_eData,ivec2(light*11+row,0),0);}
vec3 eLinear(vec3 s){return mix(s/12.92,pow((s+.055)/1.055,vec3(2.4)),step(vec3(.04045),s));}
vec3 eSRGB(vec3 s){s=max(s,vec3(0));return mix(s*12.92,1.055*pow(s,vec3(1.0/2.4))-.055,step(vec3(.0031308),s));}
float eShadow(vec3 p,vec3 toLight,float stop,float bias){
  if(u_eShadowStep<=0.0)return 1.0;
  float t=max(bias,u_eShadowStep*.12);
  for(int k=0;k<40;k++){
    if(t>=stop-bias)return 1.0;
    vec3 uv=((p+toLight*t-u_eShadowMin)/u_eShadowStep+.5)/u_eShadowSize;
    if(any(lessThan(uv,vec3(0)))||any(greaterThan(uv,vec3(1)))){t+=u_eShadowStep;continue;}
    float d=texture(u_eShadow,uv).r;
    if(d<max(.0015,u_eShadowStep*.025))return 0.0;
    t+=max(u_eShadowStep*.12,d*.8);
  }
  return 1.0;
}
vec3 eCookie(int i,vec3 p){
  vec4 region=eRow(i,6);if(region.z<=0.0)return vec3(1);
  vec4 at=eRow(i,0),n=eRow(i,1),u=eRow(i,7),v=eRow(i,8),move=eRow(i,9);
  vec3 delta=at.xyz-p;float forward=-dot(delta,n.xyz);if(forward<=0.0)return vec3(0);
  vec2 uv=vec2(.5-dot(delta,u.xyz)/forward,.5-dot(delta,v.xyz)/forward);
  if(any(lessThan(uv,vec2(0)))||any(greaterThanEqual(uv,vec2(1))))return vec3(0);
  uv=(uv-.5)*move.zw+.5+move.xy;if(v.w>.5)uv=fract(uv);
  if(any(lessThan(uv,vec2(0)))||any(greaterThanEqual(uv,vec2(1))))return vec3(0);
  if(u.w<.5)return texelFetch(u_eCookies,ivec2(region.xy+floor(uv*region.zw)),0).rgb;
  vec2 q=uv*region.zw-.5,f=fract(q);ivec2 a=ivec2(floor(q)),lo=ivec2(region.xy),hi=ivec2(region.zw)-1;
  return mix(mix(texelFetch(u_eCookies,lo+clamp(a,ivec2(0),hi),0).rgb,texelFetch(u_eCookies,lo+clamp(a+ivec2(1,0),ivec2(0),hi),0).rgb,f.x),mix(texelFetch(u_eCookies,lo+clamp(a+ivec2(0,1),ivec2(0),hi),0).rgb,texelFetch(u_eCookies,lo+clamp(a+ivec2(1),ivec2(0),hi),0).rgb,f.x),f.y);
}
vec2 eDisk(vec2 a){if(a.x==0.0&&a.y==0.0)return vec2(0);bool wide=abs(a.x)>abs(a.y);float r=wide?a.x:a.y,angle=.78539816339*(wide?a.y/a.x:2.0-a.x/a.y);return r*vec2(cos(angle),sin(angle));}
vec3 eLighting(vec3 p,vec3 normal,bool fog,vec3 viewRay){
  vec3 sum=vec3(0);
  for(int i=0;i<32;i++){
    if(i>=u_eCount||(fog&&i>=u_eFogCount))break;if(u_ePick>0&&i!=u_ePick-1)continue;
    vec4 c=eRow(i,4),params=eRow(i,5);float power=fog?c.w:params.x;if(power<=0.0)continue;
    vec4 at=eRow(i,0),n=eRow(i,1),u=eRow(i,2),v=eRow(i,3);
    if(distance(p,at.xyz)>at.w+length(vec2(u.w,v.w)))continue;
    vec3 transmission=eCookie(i,p);if(max(transmission.r,max(transmission.g,transmission.b))<=0.0)continue;
    int type=int(n.w),grid=fog?1:int(params.y);float total=0.0,lit=0.0;
    for(int j=0;j<64;j++){
      int count=type==2?grid:type>=3?1:grid*grid;if(j>=count)break;
      vec2 q=vec2(2.0*(float(j%grid)+.5)/float(grid)-1.0,2.0*(float(j/grid)+.5)/float(grid)-1.0);
      if(type==1)q=eDisk(q);if(type==2)q.y=0.0;
      vec3 sampleAt=at.xyz+(type<3?q.x*(type==2?max(0.0,u.w-v.w):u.w)*u.xyz+q.y*v.w*v.xyz:vec3(0));
      vec3 delta=sampleAt-p;float d=length(delta);if(d<=params.w||d>=at.w)continue;vec3 dir=delta/d;
      float facing=-dot(dir,n.xyz),receive=fog?1.0:max(0.0,dot(normal,dir));
      float angular=type>=3?1.0:type==2?1.0:max(0.0,params.z>=2.0?abs(facing):facing);
      if(type==3){float outer=u.w,inner=v.w;if(facing<outer)continue;float edge=inner==outer?1.0:clamp((facing-outer)/(inner-outer),0.0,1.0);angular*=edge*edge*(3.0-2.0*edge);}
      float amount=receive*angular*pow(1.0-d/at.w,2.0);total+=amount;
      bool shadows=mod(params.z,2.0)>.5&&(!fog||eRow(i,10).y>.5);
      float visible=shadows?eShadow(p+(fog?vec3(0):normal*params.w),dir,d,params.w):1.0;
      lit+=amount*visible;
    }
    float count=float(type==2?grid:type>=3?1:grid*grid),visibility=total>0.0?lit/total:0.0;
    float steps=eRow(i,10).x;
    if(steps>1.0)lit=total*floor(visibility*(steps-1.0)+.5)/(steps-1.0);
    sum+=(fog?eSRGB(c.rgb):c.rgb)*transmission*(power*lit/max(count,1.0));
  }
  return sum;
}
vec3 ePaint(vec3 rgb,vec3 p,vec3 n){return eSRGB(min(vec3(1),eLinear(rgb)*(vec3(1)+eLighting(p,n,false,vec3(0)))));}
`,hi=(e,t)=>(e==null?void 0:e.length)===t.length&&t.every((i,a)=>i===e[a]),eu=[1,1,1];function tu(e,t,{table:i,textureUnit:a},r,n){var Le,te;let p=n.KIT,c=(Le=n.AreaLights)!=null?Le:p==null?void 0:p.areaLights,m=(te=n.LightCookies)!=null?te:p==null?void 0:p.lightCookies;if(!c||!m)return{prepare:()=>null,compose:(H,g,M,G,X)=>X,fog:()=>{}};let u=i(352,26,r),A=i(1024,28,r),j=t.texture();a(25,j),e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,1,1,0,e.RGBA,e.FLOAT,new Float32Array([1,1,1,0]));let z=t.texture(),T=t.allocate("Texture"),b=t.texture(),v=t.allocate("Framebuffer"),w=t.allocate("VertexArray"),F=t.allocate("Texture"),l,_=[];e.activeTexture(e.TEXTURE0+30),e.bindTexture(e.TEXTURE_2D_ARRAY,F);for(let H of[e.TEXTURE_MIN_FILTER,e.TEXTURE_MAG_FILTER])e.texParameteri(e.TEXTURE_2D_ARRAY,H,e.NEAREST);let C,$,I,y,E=[],o,h=[],s,d,k,B,O,V,Y,f=t.allocate("Texture"),S=t.allocate("Framebuffer"),q,P=[],W,R;e.activeTexture(e.TEXTURE0+25),e.bindTexture(e.TEXTURE_3D,f);for(let H of[e.TEXTURE_MIN_FILTER,e.TEXTURE_MAG_FILTER])e.texParameteri(e.TEXTURE_3D,H,e.LINEAR);for(let H of[e.TEXTURE_WRAP_S,e.TEXTURE_WRAP_T,e.TEXTURE_WRAP_R])e.texParameteri(e.TEXTURE_3D,H,e.CLAMP_TO_EDGE);e.texImage3D(e.TEXTURE_3D,0,e.RGBA16F,1,1,1,0,e.RGBA,e.FLOAT,new Float32Array([.35,.35,.35,1]));let U=new WeakMap,J=new WeakMap,ie=1,N,K,Z,ye=!1,ve;e.activeTexture(e.TEXTURE0+29),e.bindTexture(e.TEXTURE_3D,T);for(let H of[e.TEXTURE_MIN_FILTER,e.TEXTURE_MAG_FILTER])e.texParameteri(e.TEXTURE_3D,H,e.LINEAR);for(let H of[e.TEXTURE_WRAP_S,e.TEXTURE_WRAP_T,e.TEXTURE_WRAP_R])e.texParameteri(e.TEXTURE_3D,H,e.CLAMP_TO_EDGE);e.texImage3D(e.TEXTURE_3D,0,e.R16F,1,1,1,0,e.RED,e.FLOAT,new Float32Array([1e3]));function ze(H,g,M,G=!1,X){var Ue,Ke,ot,gt,xt,Ye,ft,rt,Et,Mt,At,wt,it,qt,Lt,jt,Ot,Zt,ii,oi,Wt;let ae=c.prepare(g.areaLights===!0?H.areaLights:(Ue=g.areaLights)!=null?Ue:H.areaLights,{time:M}),Q=(Ke=g.volumeLighting)!=null?Ke:H.volumeLighting,pe=Q?p.atmosphere.lighting(Q,H.pal,{time:M}):null,Ae=[...pe!=null&&pe.point?[pe.point]:[],...(ot=pe==null?void 0:pe.locals)!=null?ot:[]],Pe=[...ae.map(D=>({...D,type:D.shape==="rectangle"?0:D.shape==="disk"?1:2,surface:D.intensity,volume:g.volumeLocalLights===!1?0:D.volumeIntensity})),...Ae.filter(D=>D.intensity||D.surfaceIntensity).map(D=>{var xe,de,ke;return{...D,type:D.direction?3:4,normal:(xe=D.direction)!=null?xe:[0,0,1],half:[0,0],u:[1,0,0],v:[0,1,0],linearRGB:D.rgb.map(se=>se<=.04045?se/12.92:((se+.055)/1.055)**2.4),surface:(de=D.surfaceIntensity)!=null?de:0,volume:g.volumeLocalLights===!1?0:D.intensity,sampleGrid:1,shadows:D.castsShadow,bias:.025,cookie:(ke=D.cookie)==null?void 0:ke.projection}})];if(Pe.sort((D,xe)=>+(xe.volume>0)-+(D.volume>0)),Pe.length>32)throw new RangeError("Native emitter lighting supports up to 32 active shaped/volume lights");if(!Pe.length&&!(Q!=null&&Q.sun)&&!((gt=H.atmosphere)!=null&&gt.some(D=>D.lit)))return null;if(!e.getExtension("EXT_color_buffer_float"))throw new Error("Native emitter lighting needs EXT_color_buffer_float");let Te=[...new Set(Pe.map(D=>{var xe;return(xe=D.cookie)==null?void 0:xe.image}).filter(Boolean))],we=new Map,Me=0,He=0,qe=0,fe=Math.min(r,1024);for(let D of Te){if(D.width>fe||D.height>r)throw new RangeError("Light cookie exceeds native atlas limits");if(Me+D.width>fe&&(Me=0,He+=qe,qe=0),He+D.height>r)throw new RangeError("Light cookie atlas is full");we.set(D,[Me,He,D.width,D.height]),Me+=D.width,qe=Math.max(qe,D.height)}let Ne=Math.max(1,He+qe);if(a(27,z),!hi(o,Te)){let D=new Uint8Array(fe*Ne*4);for(let[xe,[de,ke]]of we)for(let se=0;se<xe.height;se++)D.set(xe.data.subarray(se*xe.width*4,(se+1)*xe.width*4),((ke+se)*fe+de)*4);e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,fe,Ne,0,e.RGBA,e.UNSIGNED_BYTE,D),o=Te}let We=Pe.some(D=>D.shadows)?c.staticSources(H):[];if((xt=pe==null?void 0:pe.shadow)!=null&&xt.field){let D=(Ye=H.radius)!=null?Ye:10,xe={min:[-D,-D,-D],max:[D,D,D]},de=U.get(pe.shadow.field);de||(de={distance:pe.shadow.field,bounds:xe},U.set(pe.shadow.field,de)),We.push(de)}(!hi(h,We)||V!==((ft=g.emitterShadowResolution)!=null?ft:48)||Y!==g.emitterShadowRevision)&&(s=c.shadowField(We,{resolution:(rt=g.emitterShadowResolution)!=null?rt:48}),h=We,V=(Et=g.emitterShadowResolution)!=null?Et:48,Y=g.emitterShadowRevision,e.activeTexture(e.TEXTURE0+29),e.bindTexture(e.TEXTURE_3D,T),e.texImage3D(e.TEXTURE_3D,0,e.R16F,...(Mt=s==null?void 0:s.size)!=null?Mt:[1,1,1],0,e.RED,e.FLOAT,(At=s==null?void 0:s.data)!=null?At:new Float32Array([1e3]))),e.activeTexture(e.TEXTURE0+29),e.bindTexture(e.TEXTURE_3D,T);let Se=new Float32Array(352*4);Pe.forEach((D,xe)=>{var se,Ze,Ve;let de=xe*44,ke=D.cookie;Se.set([...D.at,D.radius,...D.normal,D.type,...D.u,D.type===3?D.outerCos:D.half[0],...D.v,D.type===3?D.innerCos:D.half[1],...(se=D.linearRGB)!=null?se:D.rgb,D.volume,D.surface,D.points?D.shape==="line"?D.points.length:Math.sqrt(D.points.length):1,(D.twoSided?2:0)+(D.shadows?1:0),(Ze=D.bias)!=null?Ze:.025],de),ke&&!J.has(ke.image)&&J.set(ke.image,ie++),ke&&(Se.set(we.get(ke.image),de+24),Se.set([...ke.u,+(ke.image.filter==="linear"),...ke.v,+!!ke.wrap],de+28),Se.set([...ke.offset,...ke.repeat],de+36)),Se.set([(Ve=D.shadowSteps)!=null?Ve:0,+(g.volumeLocalShadows!==!1),ke?J.get(ke.image):0,0],de+40)}),u.upload(Se);let Ie={u_eData:26,u_eCookies:27,u_eShadow:29,u_eCount:Pe.length,u_ePick:0,u_eFogCount:Pe.filter(D=>D.volume>0).length,u_eShadowMin:(wt=s==null?void 0:s.min)!=null?wt:[0,0,0],u_eShadowSize:(it=s==null?void 0:s.size)!=null?it:[1,1,1],u_eShadowStep:(qt=s==null?void 0:s.step)!=null?qt:0,u_eAmbient:(Lt=pe==null?void 0:pe.ambient)!=null?Lt:.35,u_eSun:[...(Ot=(jt=pe==null?void 0:pe.sun)==null?void 0:jt.direction)!=null?Ot:[0,1,0],(ii=(Zt=pe==null?void 0:pe.sun)==null?void 0:Zt.intensity)!=null?ii:0],u_eSunColor:(Wt=(oi=pe==null?void 0:pe.sun)==null?void 0:oi.rgb)!=null?Wt:eu},ne=ae.filter(D=>D.intensity&&(G?D.reflection:D.visible)&&(D.twoSided||!X||D.normal.reduce((xe,de,ke)=>xe+de*(X.eye[ke]-D.at[ke]),0)>0)),Ce=JSON.stringify(ne.map(D=>{var xe;return[D.at,D.normal,D.u,D.v,D.half,D.rgb,D.intensity,D.shape,((xe=D.cookie)==null?void 0:xe.image)&&Te.indexOf(D.cookie.image)]}));if(Ce!==$||I!==o){let xe=Math.max(1,ne.length*64),de=new Uint8Array(xe*64*4),ke=[];ne.forEach((se,Ze)=>{for(let Ve=0;Ve<64;Ve++)for(let dt=0;dt<64;dt++){let vt=2*(dt+.5)/64-1,kt=1-2*(Ve+.5)/64;if(se.shape==="disk"?vt*vt+kt*kt>1:se.shape==="line"?Math.hypot(Math.max(0,Math.abs(vt)*se.half[0]-Math.max(0,se.half[0]-se.half[1])),kt*se.half[1])>se.half[1]:!1)continue;let ri=se.cookie?m.sample(se.cookie.image,(vt+1)/2,(1-kt)/2):eu,pt=(Ve*xe+Ze*64+dt)*4;for(let st=0;st<3;st++)de[pt+st]=Math.round(255*se.rgb[st]*Math.min(1,se.intensity)*ri[st]);de[pt+3]=255}for(let[Ve,dt]of[[0,0],[1,0],[0,1],[0,1],[1,0],[1,1]])ke.push(...se.at.map((vt,kt)=>vt+se.u[kt]*(Ve*2-1)*se.half[0]+se.v[kt]*(1-dt*2)*se.half[1]),Ze*64+.5+Ve*63,.5+dt*63)}),C={width:xe,height:64,pixels:de,vertices:Float32Array.from(ke)},$=Ce,I=o}return{count:Pe.length,shadow:s,active:!0,surface:Pe.some(D=>D.surface>0),uniforms:Ie,areas:ae,rows:Se,world:H,frame:g,time:M,capture:G,display:C!=null&&C.vertices.length?C:null}}function me(H,g,M){var He,qe,fe,Ne,We;if(!H)return;let G=M.atmosphere===!1?[]:((He=g.atmosphere)!=null?He:[]).filter(Se=>Se.lit);if(!G.length)return;let X=[1/0,1/0,1/0],ae=[-1/0,-1/0,-1/0],Q=(qe=g.radius)!=null?qe:10;for(let Se of G){let Ie=Se.min,ne=Se.max;!Ie&&Se.type==="sphere"&&(Ie=Se.at.map(Ce=>Ce-Se.radius),ne=Se.at.map(Ce=>Ce+Se.radius)),!Ie&&Se.type==="shaft"&&(Ie=Se.from.map((Ce,Ue)=>Math.min(Ce,Se.to[Ue])-Se.radius),ne=Se.from.map((Ce,Ue)=>Math.max(Ce,Se.to[Ue])+Se.radius)),Ie||(Ie=[-Q,(fe=Se.bottom)!=null?fe:-Q,-Q],ne=[Q,(Ne=Se.top)!=null?Ne:Q,Q]);for(let Ce=0;Ce<3;Ce++)X[Ce]=Math.min(X[Ce],Ie[Ce]),ae[Ce]=Math.max(ae[Ce],ne[Ce])}let pe=(We=M.emitterFogResolution)!=null?We:48;if(!Number.isSafeInteger(pe)||pe<8||pe>128)throw new RangeError("Emitter fog resolution must be 8..128");let Ae=ae.map((Se,Ie)=>Se-X[Ie]),Pe=Math.max(...Ae)/(pe-1),Te=Ae.map(Se=>Math.max(2,Math.ceil(Se/Pe-1e-9)+1));e.activeTexture(e.TEXTURE0+25),e.bindTexture(e.TEXTURE_3D,f);let we=[...X,...Ae,pe,H.shadow,...H.uniforms.u_eSun,...H.uniforms.u_eSunColor,H.uniforms.u_eAmbient],Me=H.rows.subarray(0,H.uniforms.u_eFogCount*44);if(!hi(W,we)||!hi(R,Me)){W=we,R=Me.slice(),hi(P,Te)||(e.texImage3D(e.TEXTURE_3D,0,e.RGBA16F,...Te,0,e.RGBA,e.FLOAT,null),P=Te),q!=null||(q=t.program(`#version 300 es
precision highp float;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.0-1.0,0,1);}`,`#version 300 es
precision highp float;${So}
uniform vec3 u_fogMin,u_fogExtent,u_fogSize;uniform int u_fogSlice;out vec4 color;void main(){vec3 p=u_fogMin+vec3(gl_FragCoord.xy-.5,float(u_fogSlice))/(u_fogSize-1.0)*u_fogExtent;vec3 light=vec3(u_eAmbient)+eLighting(p,vec3(0),true,vec3(0));if(u_eSun.w>0.0)light+=u_eSunColor*u_eSun.w*eShadow(p,u_eSun.xyz,20.0,.025);color=vec4(light,1);}`)),e.bindFramebuffer(e.FRAMEBUFFER,S),e.drawBuffers([e.COLOR_ATTACHMENT0]),e.viewport(0,0,Te[0],Te[1]),e.disable(e.BLEND),e.disable(e.DEPTH_TEST),e.disable(e.SCISSOR_TEST),e.useProgram(q.p),q.set({...H.uniforms,u_fogMin:X,u_fogExtent:Ae,u_fogSize:Te}),e.bindVertexArray(w);for(let Se=0;Se<Te[2];Se++)e.framebufferTextureLayer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,f,0,Se),q.set({u_fogSlice:Se}),e.drawArrays(e.TRIANGLES,0,3);e.bindFramebuffer(e.FRAMEBUFFER,null)}Object.assign(H.uniforms,{u_eFogField:25,u_eFogMin:X,u_eFogExtent:Ae,u_eFogSize:Te})}function Fe(H,g,M,G,X){var qe,fe;if(!(H!=null&&H.surface)||!g.count)return X;if(N!==g||K!==g.data||Z!==g.renderMetadata){d=null,K=g.data,ye=!g.anim;for(let Ne=0;Ne<g.count&&ye;Ne++)ye=(Math.round(g.data[Ne*16+11])&15)===0;N=g,Z=g.renderMetadata}let ae=ye&&!g.anim&&(d==null?void 0:d.length)===g.count*8&&((qe=H.frame.changedRows)==null?void 0:qe.length)===0,Q=(d==null?void 0:d.length)===g.count*8?d:new Float32Array(g.count*8);if(!ae){let Ne=p.splatFrames.create(g,M,p.M);for(let We=0;We<g.count;We++){let Se=We*8,Ie=We*16,ne=Ne(We),Ce=ne.normal,Ue=ne.position();Math.round(g.data[Ie+11])&15&&(ye=!1),Q.set([...Ue,g.data[Ie+3],...Ce!=null?Ce:[0,0,0],g.data[Ie+7]],Se),(Math.round(g.data[Ie+11])&352||!Ce)&&(Q[Se+3]=0)}}d=Q;let pe=!hi(k,Q),Ae=X?G:null;if(!pe&&hi(B,H.rows)&&(Ae===null?O===null:hi(O,Ae))&&ve===s)return a(21,b),!0;pe&&(A.upload(Q),k=Q.slice());let Pe=B,Te=pe||ve!==s;B=H.rows.slice(),O=(fe=Ae==null?void 0:Ae.slice())!=null?fe:null,ve=s,X||a(21,j);let we=[512,Math.max(1,Math.ceil(g.count/512))],Me=`#version 300 es
precision highp float;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.0-1.0,0,1);}`;l!=null||(l=t.program(Me,`#version 300 es
precision highp float;${So}
uniform highp sampler2D u_eReceivers;uniform int u_eReceiverCount;out vec4 color;void main(){ivec2 p=ivec2(gl_FragCoord.xy);int i=p.x+p.y*512;if(i>=u_eReceiverCount){color=vec4(0);return;}vec4 at=texelFetch(u_eReceivers,ivec2(p.x*2,p.y),0),n=texelFetch(u_eReceivers,ivec2(p.x*2+1,p.y),0);color=vec4(at.w>0.0?eLighting(at.xyz,normalize(n.xyz),false,vec3(0)):vec3(0),1);}`)),y!=null||(y=t.program(Me,`#version 300 es
precision highp float;${So}
uniform highp sampler2D u_eReceivers,u_eBase;uniform highp sampler2DArray u_eBaked;uniform bool u_eHasBase;uniform int u_eReceiverCount;out vec4 color;void main(){ivec2 p=ivec2(gl_FragCoord.xy);int i=p.x+p.y*512;if(i>=u_eReceiverCount){color=vec4(0);return;}vec4 n=texelFetch(u_eReceivers,ivec2(p.x*2+1,p.y),0),base=u_eHasBase?texelFetch(u_eBase,p,0):vec4(1,1,1,0);vec3 light=vec3(0);for(int j=0;j<32;j++){if(j>=u_eCount)break;light+=texelFetch(u_eBaked,ivec3(p,j),0).rgb;}vec3 rgb=vec3(mod(n.w,256.0),mod(floor(n.w/256.0),256.0),floor(n.w/65536.0))/255.0,lit=eSRGB(min(vec3(1),eLinear(rgb)*(vec3(1)+light)));color=vec4(lit/max(rgb,vec3(.00001))*(base.w>0.0?base.rgb:vec3(1)),1);}`));let He=Te;if(e.activeTexture(e.TEXTURE0+30),e.bindTexture(e.TEXTURE_2D_ARRAY,F),!hi(_,[...we,H.count])){if(we[0]*we[1]*H.count>16777216)throw new RangeError("Emitter receiver lighting exceeds its texel budget");e.texImage3D(e.TEXTURE_2D_ARRAY,0,e.RGBA16F,...we,Math.max(1,H.count),0,e.RGBA,e.FLOAT,null),_=[...we,H.count],He=!0}e.bindFramebuffer(e.FRAMEBUFFER,v),e.drawBuffers([e.COLOR_ATTACHMENT0]),e.viewport(0,0,...we),e.disable(e.DEPTH_TEST),e.disable(e.BLEND),e.disable(e.SCISSOR_TEST),e.colorMask(!0,!0,!0,!0),e.bindVertexArray(w),e.useProgram(l.p),l.set({...H.uniforms,u_eReceivers:28,u_eReceiverCount:g.count});for(let Ne=0;Ne<H.count;Ne++)!He&&hi(Pe==null?void 0:Pe.subarray(Ne*44,Ne*44+44),H.rows.subarray(Ne*44,Ne*44+44))||(e.framebufferTextureLayer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,F,0,Ne),l.set({u_ePick:Ne+1}),e.drawArrays(e.TRIANGLES,0,3));if(!hi(E,we)){if(a(30,b),e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,...we,0,e.RGBA,e.FLOAT,null),e.bindFramebuffer(e.FRAMEBUFFER,v),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,b,0),e.drawBuffers([e.COLOR_ATTACHMENT0]),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)throw new Error("Emitter lighting target is incomplete");E=we}return e.bindFramebuffer(e.FRAMEBUFFER,v),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,b,0),e.viewport(0,0,...we),e.disable(e.DEPTH_TEST),e.disable(e.BLEND),e.disable(e.SCISSOR_TEST),e.colorMask(!0,!0,!0,!0),e.useProgram(y.p),y.set({...H.uniforms,u_eReceivers:28,u_eBaked:30,u_eBase:21,u_eHasBase:+X,u_eReceiverCount:g.count}),e.bindVertexArray(w),e.drawArrays(e.TRIANGLES,0,3),a(21,b),e.bindFramebuffer(e.FRAMEBUFFER,null),!0}return{prepare:ze,compose:Fe,fog:me}}var Ro=Symbol("inspection depth capture"),Sf=`#version 300 es
precision highp float;
uniform sampler2D u_depth;
uniform vec4 u_probes[160];
uniform vec4 u_states[32];
out vec4 color;
void main(){
 int i=int(gl_FragCoord.x);float visible=0.0;
 for(int j=0;j<5;j++){
  if(float(j)>=u_states[i].z)break;
  vec4 p=u_probes[i*5+j];
  float depth=texture(u_depth,vec2(p.x,1.0-p.y)).r;
  visible+=float(u_states[i].y<.5||depth+p.w>=p.z);
 }
 color=vec4(vec3(visible/u_states[i].z*u_states[i].x),1);
}`,Rf=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D u_scene,u_visibility,u_label,u_font;
uniform vec2 u_size,u_anchor;
uniform vec4 u_rect,u_labelRect,u_lens,u_crop,u_ripple;
uniform vec3 u_color;
uniform float u_width,u_corner,u_time,u_period;
uniform int u_slot,u_chars[64],u_count;
out vec4 color;
float segment(vec2 p,vec2 a,vec2 b){vec2 d=b-a;float t=clamp(dot(p-a,d)/max(dot(d,d),.00001),0.0,1.0);return length(p-a-t*d);}
bool inside(vec2 p,vec4 r){return all(greaterThanEqual(p,r.xy))&&all(lessThan(p,r.xy+r.zw));}
void over(vec3 rgb,float a){color=vec4(rgb*a+color.rgb*(1.0-a),a+color.a*(1.0-a));}
void main(){
 float opacity=texelFetch(u_visibility,ivec2(u_slot,0),0).r;if(opacity<=0.0)discard;
 vec2 p=vec2(gl_FragCoord.x,u_size.y-gl_FragCoord.y);color=vec4(0);
 if(u_lens.z>0.0&&inside(p,u_lens)){
  vec2 source=floor(u_crop.xy+(p-u_lens.xy)/u_lens.zw*u_crop.zw);
  over(texture(u_scene,vec2((source.x+.5)/u_size.x,1.0-(source.y+.5)/u_size.y)).rgb,1.0);
 }
 if(u_count>0){
  float cell=u_ripple.w;vec2 grid=floor(p/cell),center=(grid+.5)*cell;
  float radius=min(u_ripple.y,mod(u_time,u_period)*u_ripple.x);
  float wave=max(0.0,1.0-abs(length(center-u_anchor)-radius)/u_ripple.z)*(1.0-radius/u_ripple.y);
  int ch=int(mod(grid.x*13.0+grid.y*7.0+floor(u_time*7.0),float(u_count)));
  int index=u_chars[ch];ivec2 pos=ivec2(mod(p,cell)/cell*vec2(6,8));
  ivec2 texel=ivec2(index%64*6,index/64*8)+pos;
  float bit=texelFetch(u_font,texel,0).r;over(u_color,bit*wave*.65);
 }
 float line=1e6;vec2 a=u_rect.xy,b=a+u_rect.zw;
 for(int j=0;j<4;j++){
  vec2 sign=vec2(j%2==0?1:-1,j<2?1:-1),q=vec2(j%2==0?a.x:b.x,j<2?a.y:b.y);
  line=min(line,segment(p,q,q+vec2(sign.x*min(u_corner,u_rect.z*.5),0)));
  line=min(line,segment(p,q,q+vec2(0,sign.y*min(u_corner,u_rect.w*.5))));
 }
 vec2 delta=abs(p-u_anchor);
 if((delta.x>=3.0&&delta.x<=7.0&&delta.y<=u_width*.5)||(delta.y>=3.0&&delta.y<=7.0&&delta.x<=u_width*.5))line=0.0;
 line=min(line,segment(p,vec2(b.x,a.y),u_labelRect.xy));
 if(u_lens.z>0.0){
  vec2 a=u_lens.xy,b=a+u_lens.zw;
  line=min(line,min(min(segment(p,a,vec2(b.x,a.y)),segment(p,vec2(b.x,a.y),b)),min(segment(p,b,vec2(a.x,b.y)),segment(p,vec2(a.x,b.y),a))));
 }
 if(line<=u_width*.5)over(u_color,1.0);
 if(inside(p,u_labelRect)){
  vec4 label=texelFetch(u_label,ivec2(p-u_labelRect.xy),0);over(label.rgb,label.a);
 }
 color*=opacity;
}`,zf=`#version 300 es
precision highp float;
uniform sampler2D u_scene;
uniform vec2 u_size;
out vec4 color;
void main(){color=texture(u_scene,gl_FragCoord.xy/u_size);}`;function iu(e,{api:t,program:i,resources:a,target:r,textureUnit:n,fullscreen:p,maxSize:c,viewportLimit:m}){let u=r(),A=r(),j=r(),z=a.texture(),T=a.texture(),b=i(Sf),v=i(Rf),w=i(zf),F=new Map,l,_,C=($,I,y,E,o=e.RGBA)=>{n(0,$),e.texImage2D(e.TEXTURE_2D,0,o===e.RED?e.R8:e.RGBA8,I,y,0,o,e.UNSIGNED_BYTE,E)};return function(I,y,E,o,h,s,d){var S,q,P,W,R,U,J,ie,N,K,Z,ye,ve,ze,me,Fe,Le,te;if(o>Math.min(c,m[0])||h>Math.min(c,m[1]))throw new RangeError("Inspection frame exceeds texture limit");u.resize(o,h);let k,B=(H,g,M)=>{k={camera:M},j.resize(o,h),n(0,g),e.disable(e.BLEND),e.disable(e.DEPTH_TEST),e.disable(e.SCISSOR_TEST),e.colorMask(!0,!0,!0,!0),p(w,j.framebuffer,o,h,{u_scene:0,u_size:[o,h]})};if(d(I,{...y,[Ro]:B},o,h,u.framebuffer),!k)throw new Error("Inspection could not capture the scene camera");let O=t.plan(E,{world:I,time:(W=(P=(S=y.interfaceTime)!=null?S:y.time)!=null?P:(q=I.lookSnapshot)==null?void 0:q.time)!=null?W:0,sceneTime:(J=(U=y.time)!=null?U:(R=I.lookSnapshot)==null?void 0:R.time)!=null?J:0,width:o,height:h,camera:k.camera,focus:y.inspectionFocus});if(s||(e.canvas.width!==o&&(e.canvas.width=o),e.canvas.height!==h&&(e.canvas.height=h)),e.disable(e.BLEND),e.disable(e.DEPTH_TEST),e.disable(e.SCISSOR_TEST),e.colorMask(!0,!0,!0,!0),n(0,u.textures[0]),p(w,s,o,h,{u_scene:0,u_size:[o,h]}),!O.targets.length)return;let V=t.font(E);if(l!==V){let H=[...V],g=Math.ceil(H.length/64)*8,M=new Uint8Array(384*g);if(_=new Map,H.forEach(([G,X],ae)=>{_.set(G,ae);for(let Q=0;Q<8;Q++)M.set(X.subarray(Q*6,Q*6+6),(Math.floor(ae/64)*8+Q)*384+ae%64*6)}),g>c)throw new RangeError("Inspection glyph atlas exceeds texture limit");C(T,384,g,M,e.RED),l=V,F.clear()}let Y=new Float32Array(640),f=new Float32Array(128);O.targets.forEach((H,g)=>{Y.set(H.probes.flat(),g*20),f[g*4]=H.coverage,f[g*4+1]=+H.occlusion,f[g*4+2]=H.probes.length}),A.resize(O.targets.length,1),n(0,j.textures[0]),p(b,A.framebuffer,O.targets.length,1,{u_depth:0,u_probes:Y,u_states:f}),n(0,u.textures[0]),n(1,A.textures[0]),n(3,T),e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD),e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);for(let H=0;H<O.targets.length;H++){let g=O.targets[H],M=JSON.stringify([g.text,g.style,g.label.slice(2)]),G=F.get(M);G||(G=t.labels(g,V),F.size>=128&&F.clear(),F.set(M,G)),C(z,G.w,G.h,G.data),n(2,z),n(0,u.textures[0]);let X=new Int32Array(64),ae=[...(N=(ie=g.ripple)==null?void 0:ie.chars)!=null?N:""];ae.forEach((Me,He)=>{if(!_.has(Me))throw new RangeError("Missing inspection ripple glyph: "+Me);X[He]=_.get(Me)});let Q=g.ripple,pe=[g.rect,g.label,[g.anchor[0]-((K=Q==null?void 0:Q.radius)!=null?K:8),g.anchor[1]-((Z=Q==null?void 0:Q.radius)!=null?Z:8),((ye=Q==null?void 0:Q.radius)!=null?ye:8)*2,((ve=Q==null?void 0:Q.radius)!=null?ve:8)*2]];g.lens&&pe.push(g.lens.rect);let Ae=Math.max(0,Math.floor(Math.min(...pe.map(Me=>Me[0]))-2)),Pe=Math.max(0,Math.floor(Math.min(...pe.map(Me=>Me[1]))-2)),Te=Math.min(o,Math.ceil(Math.max(...pe.map(Me=>Me[0]+Me[2]))+2)),we=Math.min(h,Math.ceil(Math.max(...pe.map(Me=>Me[1]+Me[3]))+2));e.enable(e.SCISSOR_TEST),e.scissor(Ae,h-we,Te-Ae,we-Pe),p(v,s,o,h,{u_scene:0,u_visibility:1,u_label:2,u_font:3,u_size:[o,h],u_anchor:g.anchor,u_rect:g.rect,u_labelRect:g.label,u_lens:(me=(ze=g.lens)==null?void 0:ze.rect)!=null?me:[0,0,0,0],u_crop:(Le=(Fe=g.lens)==null?void 0:Fe.crop)!=null?Le:[0,0,0,0],u_ripple:Q?[Q.speed,Q.radius,Q.width,Q.cell]:[0,1,1,1],u_period:(te=Q==null?void 0:Q.period)!=null?te:1,u_time:O.time,u_color:g.style.rgb,u_width:g.style.width,u_corner:g.style.corner,u_slot:H,u_chars:X,u_count:ae.length})}e.disable(e.SCISSOR_TEST),e.disable(e.BLEND),e.activeTexture(e.TEXTURE0)}}function ou(e,t,i,a,r,n,p=1/0,c){var C,$,I,y,E;let m=t.water!==!1&&t.reflections!==!1&&((C=e.water)==null?void 0:C.reflectionPlanes);if(!(m!=null&&m.length))return null;if(!n)throw new TypeError("Water captures require KIT.reflection in the toolkit");let u=($=t.reflectionScale)!=null?$:.5,A=(I=t.reflectionMaxSize)!=null?I:512;if(!Number.isFinite(u)||u<=0||u>1||!Number.isSafeInteger(A)||A<1||A>2048)throw new RangeError("Reflection scale must be in (0,1] and max size in [1,2048]");let j=new Map;for(let o of(y=e.reflections)!=null?y:[]){let h=n.plane(o);if(j.has(h.id))throw new RangeError("Duplicate reflection plane "+h.id);j.set(h.id,h)}let z=Math.min(u,A/Math.max(a,r),p/(2*Math.max(a,r))),T=new Float32Array(4),b=new Float32Array(4),v=m.map((o,h)=>{let s=j.get(o);if(!s)throw new RangeError("Unknown water reflection plane "+o);if(Math.abs(s.normal[1]-1)>1e-6)throw new RangeError("Water reflection planes must face up");b[h]=s.at[1];let d=n.captureView(i.view,s,i.eye);if(!d)return null;let k=i.eye.slice();k[1]=2*s.at[1]-k[1];let B=d.equation.slice();return B[3]-=d.bias,{slot:h,plane:s,equation:B,camera:{...i,eye:k,view:d.view}}}).filter(Boolean),w=Math.max(1,Math.round(a*z)),F=Math.max(1,Math.round(r*z)),l=c==null?void 0:c(v.map(o=>o.plane.id)),_=[];for(let o of v){let h=(E=l==null?void 0:l.get(o.plane.id))!=null?E:1;h&&(T[o.slot]=1,_.push({...o,width:Math.max(1,Math.round(w*h)),height:Math.max(1,Math.round(F*h))}))}return{captures:_,active:T,heights:b,count:m.length,width:w,height:F,grid:[2,Math.ceil(m.length/2)]}}function ru(e,t,i,a){if(!t.select)return e;let r=e.data.slice(),n=a.KIT.splatFrames.create(e,i,a.KIT.M);for(let p=0;p<e.count;p++){let c=n(p).position();t.select(p,...c,e)||(r[p*16+3]=0)}return{...e,data:r}}var Br=Symbol("rendered camera");function Or(e,t){return{[Br](i){var a;t(i),(a=e[Br])==null||a.call(e,i)}}}var tr=`
vec4 layerTexel(sampler2D image, ivec2 pos, ivec2 size, bool topDown) {
  if (!topDown) pos.y = size.y - 1 - pos.y;
  return texelFetch(image, pos, 0);
}

vec4 layerRegionAt(sampler2D image, vec2 pixel, vec2 outputSize, ivec4 region, bool topDown, bool linear) {
  ivec2 size = region.zw, origin = region.xy, full = textureSize(image, 0);
  vec2 uv = pixel * vec2(size) / outputSize;
  if (!linear) return layerTexel(image, origin + clamp(ivec2(uv), ivec2(0), size - 1), full, topDown);
  vec2 pos = clamp(uv - 0.5, vec2(0.0), vec2(size) - 1.0);
  ivec2 p = ivec2(pos), q = min(p + 1, size - 1);
  vec2 f = fract(pos);
  return mix(mix(layerTexel(image, origin + p, full, topDown), layerTexel(image, origin + ivec2(q.x, p.y), full, topDown), f.x),
    mix(layerTexel(image, origin + ivec2(p.x, q.y), full, topDown), layerTexel(image, origin + q, full, topDown), f.x), f.y);
}

vec4 layerAt(sampler2D image, vec2 pixel, vec2 outputSize, bool topDown, bool linear) {
  return layerRegionAt(image, pixel, outputSize, ivec4(ivec2(0), textureSize(image, 0)), topDown, linear);
}

vec4 placedLayerAt(sampler2D image, vec2 pixel, vec4 dest, ivec4 region, bool topDown, bool linear) {
  vec2 position = pixel - dest.xy;
  if (any(lessThan(position, vec2(0.0))) || any(greaterThanEqual(position, dest.zw))) return vec4(0.0);
  return layerRegionAt(image, position, dest.zw, region, topDown, linear);
}
`,Ff=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D u_layer;
uniform vec2 u_outputSize;
uniform vec4 u_dest;
uniform ivec4 u_region;
uniform bool u_topDown, u_linear, u_opaque;
uniform float u_opacity;
out vec4 color;

${tr}

void main() {
  vec2 pixel = vec2(gl_FragCoord.x, u_outputSize.y - gl_FragCoord.y);
  color = placedLayerAt(u_layer, pixel, u_dest, u_region, u_topDown, u_linear);
  if (u_opaque) color.a = 1.0;
  color *= u_opacity;
}`;function au(e,{program:t,resources:i,target:a,textureUnit:r,fullscreen:n}){let p=t(Ff),c=a(),m=i.texture(),u=0,A=0;return function(z,T,b,v,w,F){var $,I;let{w:l,h:_}=b;c.resize(b.world.w,b.world.h),F(z,T,b.world.w,b.world.h,c.framebuffer);let C=typeof v=="function"?v():v;if(w||(e.canvas.width!==l&&(e.canvas.width=l),e.canvas.height!==_&&(e.canvas.height=_)),e.disable(e.DEPTH_TEST),e.disable(e.CULL_FACE),e.disable(e.STENCIL_TEST),e.disable(e.SCISSOR_TEST),e.disable(e.BLEND),e.colorMask(!0,!0,!0,!0),r(0,c.textures[0]),n(p,w,l,_,{u_layer:0,u_outputSize:[l,_],u_topDown:!1,u_opaque:!0,u_dest:[0,0,l,_],u_region:[0,0,c.width,c.height],u_linear:b.world.filter==="linear",u_opacity:1}),C.length){e.enable(e.BLEND),e.blendEquation(e.FUNC_ADD);for(let y of C)y.gpu?r(0,y.gpu.texture):(r(0,m),u!==y.w||A!==y.h?(e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,y.w,y.h,0,e.RGBA,e.UNSIGNED_BYTE,y.data),u=y.w,A=y.h):e.texSubImage2D(e.TEXTURE_2D,0,0,0,y.w,y.h,e.RGBA,e.UNSIGNED_BYTE,y.data)),e.blendFuncSeparate(e.ONE,y.blend==="add"?e.ONE:e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA),n(p,w,l,_,{u_topDown:!y.gpu,u_opaque:!1,u_dest:y.dest,u_region:(I=($=y.gpu)==null?void 0:$.region)!=null?I:[0,0,y.w,y.h],u_linear:y.filter==="linear",u_opacity:y.opacity});e.disable(e.BLEND)}}}var nu=`
precision highp float;
precision highp int;
uniform sampler2D u_input, u_mask, u_owner, u_selected, u_depth, u_groups, u_work;
uniform vec2 u_size, u_workSize, u_depthRange;
uniform bool u_packedDepth, u_hasMask, u_hasSelect, u_hasDepth, u_hasGroups, u_depthMask, u_depthInvert, u_background, u_protect, u_sourceMask, u_outputMask, u_linear;
uniform vec3 u_depthWindow, u_tint;
uniform int u_kind, u_samples, u_side, u_span;
uniform float u_depthThreshold, u_opacity, u_radius, u_threshold, u_intensity, u_inner, u_width, u_relativeDepth;
uniform vec2 u_offset, u_center, u_blockSize, u_sortThreshold;
uniform float u_radial, u_probability;
uniform uint u_seed, u_tick;
uniform bool u_horizontal, u_descending;
${tr}
vec4 readAt(vec2 p){return layerAt(u_input,p,u_size,false,false);}
bool inside(vec2 p){return all(greaterThanEqual(p,vec2(0.0)))&&all(lessThan(p,u_size));}
float zAt(vec2 p){
  if(!u_hasDepth)return 1e20;
  vec4 value=layerAt(u_depth,p,u_size,false,false);
  float n=u_packedDepth?(value.a<.5?1.0:dot(round(value.rgb*255.0),vec3(1.0,256.0,65536.0))/16777215.0):value.r;
  return n>=1.0?1e20:mix(u_depthRange.x,u_depthRange.y,n);
}
int ownerAt(vec2 p){
  ivec3 bytes=ivec3(floor(layerAt(u_owner,p,u_size,false,false).rgb*255.0+.5));
  return bytes.r+bytes.g*256+bytes.b*65536;
}
vec4 groupAt(vec2 p){
  if(!u_hasGroups)return vec4(0.0);
  int id=ownerAt(p),width=textureSize(u_groups,0).x;
  return texelFetch(u_groups,ivec2(id%width,id/width),0);
}
float weightAt(vec2 p){
  float weight=u_hasMask?layerAt(u_mask,p,u_size,false,false).r:1.0;
  if(u_hasSelect){int id=ownerAt(p),width=textureSize(u_selected,0).x;weight*=texelFetch(u_selected,ivec2(id%width,id/width),0).r;}
  if(u_depthMask){
    float z=zAt(p),edge=min(z-u_depthWindow.x,u_depthWindow.y-z);
    float a=u_depthWindow.z>0.0?clamp(edge/u_depthWindow.z,0.0,1.0):step(0.0,edge);
    weight*=z>1e19?(u_background?1.0:0.0):(u_depthInvert?1.0-a:a);
  }
  return weight;
}
bool compatible(vec2 p,vec2 q,bool emission){
  if(!inside(q))return false;
  float a=zAt(p),b=zAt(q);bool skyA=a>1e19,skyB=b>1e19;
  if(emission)return skyA||(!skyB&&b<=a+u_depthThreshold);
  return skyA==skyB&&(skyA||abs(a-b)<=u_depthThreshold)&&(!u_protect||groupAt(p)==groupAt(q));
}
float luminance(vec4 c){return dot(c.rgb,vec3(.2126,.7152,.0722))/max(1e-9,c.a);}
vec3 linearRGB(vec3 c){return mix(pow((c+.055)/1.055,vec3(2.4)),c/12.92,lessThanEqual(c,vec3(.04045)));}
vec3 displayRGB(vec3 c){return mix(1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-.055,c*12.92,lessThanEqual(c,vec3(.0031308)));}
uint hash(uint x){x=(x^(x>>16))*0x7feb352du;x=(x^(x>>15))*0x846ca68bu;return x^(x>>16);}
vec2 sortAt(int n,vec2 p){return u_horizontal?vec2((float(n)+.5)*u_size.x/u_workSize.x,p.y):vec2(p.x,(float(n)+.5)*u_size.y/u_workSize.y);}
bool eligible(vec2 p,vec2 q){
  if(!compatible(q,p,false)||(u_sourceMask&&weightAt(p)<=0.0))return false;
  vec4 c=readAt(p);float l=luminance(c);
  return c.a>0.0&&l>=u_sortThreshold.x&&l<=u_sortThreshold.y;
}
`,Cf=`#version 300 es
${nu}
out vec4 color;
void main(){
  vec2 site=vec2(gl_FragCoord.x,u_workSize.y-gl_FragCoord.y),p=site*u_size/u_workSize;
  vec4 base=readAt(p),result=base;
  if(u_kind==8||u_kind==9){
    vec3 sum=vec3(0.0);
    for(int k=0;k<64;k++){
      if(k>=u_samples)break;
      float t=(float(k)+.5)/float(u_samples),r=u_radius*sqrt(u_kind==9?u_inner*u_inner+t*(1.0-u_inner*u_inner):t),a=float(k)*2.39996323;
      vec2 q=p+r*vec2(cos(a),sin(a));
      if(!compatible(p,q,true))continue;
      vec4 c=readAt(q);float bright=max(c.r,max(c.g,c.b))/max(c.a,1e-9);
      float amount=clamp((bright-u_threshold)/(1.0-u_threshold),0.0,1.0)*(u_sourceMask?weightAt(q):1.0)*(u_kind==8?exp(-2.0*t):1.0);
      sum+=linearRGB(c.rgb/max(c.a,1e-9))*c.a*amount*u_tint/float(u_samples);
    }
    color=vec4(sum*u_intensity*(u_kind==8?2.35:1.0),1.0);return;
  }
  if(u_kind==10){
    float z=zAt(p),coverage=0.0;vec4 g=groupAt(p);
    for(int k=0;k<8;k++){
      if(k>=u_samples)break;float a=float(k)*6.28318530718/float(u_samples);vec2 q=p+u_width*vec2(cos(a),sin(a));if(!inside(q))continue;
      float nz=zAt(q);vec4 ng=groupAt(q);bool near=z<nz,far=nz<z,sky=z>1e19,nsky=nz>1e19;
      bool boundary=sky!=nsky||!sky&&!nsky&&abs(z-nz)>max(u_depthThreshold,min(z,nz)*u_relativeDepth)||u_protect&&g!=ng;
      if(!boundary)continue;
      if(u_side!=1&&!sky&&(near||g!=ng&&!far))coverage=max(coverage,u_sourceMask?weightAt(p):1.0);
      if(u_side!=0&&!nsky&&(far||g!=ng&&!near))coverage=max(coverage,u_sourceMask?weightAt(q):1.0);
    }
    color=vec4(u_tint,coverage);return;
  }
  if(u_kind==11){
    vec2 offset=u_offset+(p/u_size-u_center)*u_radial;
    if(compatible(p,p+offset,false)&&(!u_sourceMask||weightAt(p+offset)>0.0))result.r=readAt(p+offset).r;
    if(compatible(p,p-offset,false)&&(!u_sourceMask||weightAt(p-offset)>0.0))result.b=readAt(p-offset).b;
  }else if(u_kind==12){
    uvec2 block=uvec2(floor(p/u_blockSize));
    uint key=hash(block.x*73856093u^block.y*19349663u^u_tick*83492791u^u_seed);
    if(float(key>>8u)/16777216.0<u_probability){
      vec2 q=p+u_offset*((key&1u)==1u?1.0:-1.0);
      if(compatible(p,q,false)&&(!u_sourceMask||weightAt(q)>0.0))result=readAt(q);
    }
  }else if(u_kind==13){
    int center=int(u_horizontal?site.x:site.y),extent=int(u_horizontal?u_workSize.x:u_workSize.y),start=center/u_span*u_span;
    if(eligible(p,p)){
      int left=center,right=center;
      for(int k=0;k<32;k++){if(left<=start||!eligible(sortAt(left-1,p),sortAt(left,p)))break;left--;}
      for(int k=0;k<32;k++){if(right+1>=min(start+u_span,extent)||!eligible(sortAt(right+1,p),sortAt(right,p)))break;right++;}
      // Bounded insertion sort. Each bucket is <=32 working cells; the resource
      // plan charges its quadratic comparison cost as well as source samples.
      vec4 values[32];int count=right-left+1;
      for(int k=0;k<32;k++){
        if(k>=count)break;
        vec4 value=readAt(sortAt(left+k,p));int dest=k;
        for(int j=0;j<32;j++){
          if(dest<=0)break;
          float d=(luminance(values[dest-1])-luminance(value))*(u_descending?-1.0:1.0);
          if(d<=0.0)break;values[dest]=values[dest-1];dest--;
        }
        values[dest]=value;
      }
      result=values[center-left];
    }
  }
  float gate=u_sourceMask?weightAt(p):1.0;
  color=vec4((vec3(128.0)+(result.rgb-base.rgb)*gate*127.0)/255.0,1.0);
}`,Mf=`#version 300 es
${nu}
out vec4 color;
void main(){
  vec2 p=vec2(gl_FragCoord.x,u_size.y-gl_FragCoord.y);vec4 base=readAt(p);color=base;
  float amount=u_opacity*(u_outputMask?weightAt(p):1.0);if(amount<=0.0)return;
  vec2 uv=p*u_workSize/u_size-.5,origin=floor(uv),fraction=fract(uv);
  vec4 sum=vec4(0.0);float norm=0.0;bool glow=u_kind==8||u_kind==9;
  for(int k=0;k<4;k++){
    if(!u_linear&&k>0)break;
    vec2 index=clamp(u_linear?origin+vec2(k%2,k/2):floor(uv+.5),vec2(0.0),u_workSize-1.0);
    vec2 q=(index+.5)*u_size/u_workSize;
    if(!compatible(p,q,glow||u_kind==10&&u_side!=0))continue;
    float a=u_linear?(k%2==1?fraction.x:1.0-fraction.x)*(k>=2?fraction.y:1.0-fraction.y):1.0;
    sum+=layerAt(u_work,index+.5,u_workSize,false,false)*a;norm+=a;
  }
  if(norm<=0.0)return;sum/=norm;
  if(glow)color.rgb=displayRGB(linearRGB(base.rgb/max(base.a,1e-9))+sum.rgb*amount)*base.a;
  else if(u_kind==10)color.rgb=mix(base.rgb,sum.rgb*base.a,sum.a*amount);
  else color.rgb=base.rgb+(sum.rgb*255.0-128.0)/127.0*amount;
  color.rgb=clamp(color.rgb,vec3(0.0),vec3(base.a));
}`;function su(e,{program:t,target:i,textureUnit:a,fullscreen:r}){let n,p,c;return function(u,A,j,z,T,b,v,w){var l,_,C,$,I,y,E,o,h,s,d,k,B,O,V,Y,f;n!=null||(n=t(Cf)),p!=null||(p=t(Mf)),e.activeTexture(e.TEXTURE10),c!=null||(c=i()),c.resize(A.width,A.height),a(0,w),a(10,c.textures[0]);let F={...z,u_work:10,u_groups:9,u_workSize:[A.width,A.height],u_kind:u.operation,u_sourceMask:u.maskMode!=="output",u_outputMask:u.maskMode!=="source",u_protect:u.protectObjects,u_linear:u.budget.filter==="linear",u_samples:A.samples,u_tint:((_=(l=u.tint)!=null?l:u.color)!=null?_:[255,255,255]).map(S=>S/255),u_radius:(C=u.radius)!=null?C:1,u_threshold:Array.isArray(u.threshold)?0:($=u.threshold)!=null?$:0,u_intensity:(I=u.intensity)!=null?I:1,u_inner:(y=u.inner)!=null?y:0,u_width:(E=u.width)!=null?E:1,u_relativeDepth:(o=u.relativeDepth)!=null?o:0,u_side:["inner","outer","both"].indexOf(u.side),u_offset:(h=u.offset)!=null?h:[0,0],u_center:(s=u.center)!=null?s:[.5,.5],u_radial:(d=u.radial)!=null?d:0,u_blockSize:(k=u.blockSize)!=null?k:[1,1],u_probability:(B=u.probability)!=null?B:0,u_seed:(O=u.seed)!=null?O:1,u_tick:Math.floor(v*((V=u.rate)!=null?V:0))>>>0,u_span:Math.min((Y=u.span)!=null?Y:2,A.samples),u_sortThreshold:Array.isArray(u.threshold)?u.threshold:[0,1],u_horizontal:u.axis!=="y",u_descending:(f=u.descending)!=null?f:!1};r(n,c.framebuffer,A.width,A.height,F),r(p,j.framebuffer,T,b,F)}}var Vi=Symbol("render graph owner capture"),Df=`#version 300 es
precision highp float;
precision highp int;
uniform sampler2D u_input, u_source, u_mask, u_owner, u_selected, u_depth, u_history;
uniform highp sampler2D u_rows;
uniform highp sampler3D u_cube;
uniform vec2 u_size, u_passSize, u_offset, u_amplitude;
uniform bool u_packedDepth, u_depthMask, u_depthInvert, u_background, u_displayMask, u_budgetLinear;
uniform vec3 u_depthWindow;
uniform int u_operation;
uniform bool u_hasMask, u_hasSelect, u_hasRect, u_invert, u_layer, u_linear, u_add, u_enabled;
uniform float u_opacity, u_feather, u_line, u_frequency, u_phase, u_cubeSize;
uniform bool u_reflectX;
uniform vec4 u_rect, u_layerDest;
uniform ivec4 u_layerRegion;
uniform bool u_layerTopDown;
uniform vec3 u_volumeAt, u_extent, u_eye;
uniform vec2 u_depthRange, u_projectionScale;
uniform mat4 u_view;
uniform bool u_volume, u_ortho, u_captureHistory, u_hasHistory, u_hold;
uniform float u_volumeFeather, u_decay;
uniform vec2 u_feedbackPivot, u_feedbackTransform, u_threshold;
uniform float u_blockSize, u_gain;
uniform bool u_feedbackLinear, u_hasThreshold;
uniform bool u_scanlines, u_rejectDepth, u_hasDepth, u_isolated, u_over, u_wrap;
uniform float u_depthThreshold;
out vec4 color;

${tr}

float depthAt(vec2 pixel) {
  ivec2 size = textureSize(u_depth, 0);
  ivec2 site = min(ivec2(pixel / u_size * vec2(size)), size - 1);
  vec4 value=texelFetch(u_depth, ivec2(site.x, size.y - 1 - site.y), 0);
  return u_packedDepth ? (value.a<.5 ? 1.0 : dot(round(value.rgb*255.0),vec3(1.0,256.0,65536.0))/16777215.0) : value.r;
}

void main() {
  ivec2 pos = ivec2(gl_FragCoord.xy);
  vec2 pixel = vec2(gl_FragCoord.x, u_passSize.y - gl_FragCoord.y) * u_size / u_passSize;
  vec4 inputColor = layerAt(u_input, pixel, u_size, false, false);
  if (u_operation == 0) { color = inputColor; return; }
  if (u_isolated) inputColor = vec4(0.0);
  float weight = u_hasMask ? layerAt(u_mask, pixel, u_size, false, false).r : 1.0;
  float chosen = 1.0;
  if (u_hasSelect) {
    vec3 encoded = layerAt(u_owner, pixel, u_size, false, false).rgb;
    ivec3 bytes = ivec3(floor(encoded * 255.0 + 0.5));
    int id = bytes.r + bytes.g * 256 + bytes.b * 65536;
    int rowWidth = textureSize(u_selected, 0).x;
    chosen = texelFetch(u_selected, ivec2(id % rowWidth, id / rowWidth), 0).r;
    weight *= chosen;
  }
  if (u_depthMask) {
    float n = u_hasDepth ? depthAt(pixel) : 1.0;
    float z = mix(u_depthRange.x, u_depthRange.y, n);
    float edge = min(z - u_depthWindow.x, u_depthWindow.y - z);
    float a = u_depthWindow.z > 0.0 ? clamp(edge / u_depthWindow.z, 0.0, 1.0) : step(0.0, edge);
    weight *= n >= 1.0 ? (u_background ? 1.0 : 0.0) : (u_depthInvert ? 1.0 - a : a);
  }
  if (u_operation == 1) {
    if (u_volume) {
      ivec2 size = textureSize(u_depth, 0);
      ivec2 site = min(ivec2(pixel / u_size * vec2(size)), size - 1);
      float norm = depthAt(pixel);
      if (norm >= 1.0) weight = 0.0;
      else {
        float depth = mix(u_depthRange.x, u_depthRange.y, norm);
        vec2 uv = (vec2(site) + .5) / vec2(size);
        vec2 plane = (uv * vec2(2.0, -2.0) + vec2(-1.0, 1.0)) * u_projectionScale;
        vec3 local = vec3(plane * (u_ortho ? 1.0 : depth), -depth);
        vec3 position = u_eye + vec3(dot(u_view[0].xyz, local), dot(u_view[1].xyz, local), dot(u_view[2].xyz, local));
        float d = length((position - u_volumeAt) / u_extent);
        weight *= u_volumeFeather > 0.0 ? clamp((1.0 - d) / u_volumeFeather, 0.0, 1.0) : step(d, 1.0);
      }
    }
    if (u_hasRect) {
      vec2 edges = min(pixel - u_rect.xy, u_rect.xy + u_rect.zw - pixel);
      float edge = min(edges.x, edges.y);
      weight *= u_feather > 0.0 ? clamp(edge / u_feather, 0.0, 1.0) : step(0.0, edge);
    }
    color = vec4(u_enabled ? (u_invert ? 1.0 - weight : weight) * u_opacity : 0.0);
    return;
  }
  if (u_operation == 6) {
    vec4 previous = u_hasHistory ? layerAt(u_history, pixel, u_size, false, u_budgetLinear) : vec4(0.0);
    if (u_captureHistory) {
      vec4 fresh = inputColor * weight;
      color = u_hold && previous.a > 0.0 ? previous :
        min(vec4(1.0), fresh + floor(previous * u_decay * (1.0 - fresh.a) * 255.0 + .00001) / 255.0);
    } else {
      vec4 sampleColor = previous * (chosen * u_opacity);
      color = sampleColor + inputColor * (1.0 - sampleColor.a);
    }
    return;
  }
  if (u_operation == 7) {
    if (u_captureHistory) {
      vec4 previous = vec4(0.0);
      if (u_hasHistory) {
        vec2 local = pixel - u_feedbackPivot;
        float c = u_feedbackTransform.x, s = u_feedbackTransform.y;
        vec2 field = u_blockSize > 0.0 ? (floor(pixel / u_blockSize) + .5) * u_blockSize : pixel;
        vec2 sampleAt = u_feedbackPivot + vec2(c * local.x + s * local.y, -s * local.x + c * local.y)
          - u_offset - u_amplitude * sin(field.yx * u_frequency + u_phase);
        if (all(greaterThanEqual(sampleAt, vec2(0.0))) && all(lessThan(sampleAt, u_size)))
          previous = layerAt(u_history, sampleAt, u_size, false, u_feedbackLinear);
      }
      vec4 fresh = u_layer ? placedLayerAt(u_source, pixel, u_layerDest, u_layerRegion, u_layerTopDown, u_linear)
        : layerAt(u_source, pixel, u_size, false, false);
      float gain = weight * u_gain;
      if (u_hasThreshold && fresh.a > 0.0) {
        float amount = max(fresh.r, max(fresh.g, fresh.b)) / fresh.a;
        gain *= clamp((amount - u_threshold.x) / (u_threshold.y - u_threshold.x), 0.0, 1.0);
      }
      fresh *= gain;
      color = min(vec4(1.0), fresh + floor(previous * u_decay * (1.0 - fresh.a) * 255.0 + .00001) / 255.0);
    } else {
      vec4 signal = layerAt(u_history, pixel, u_size, false, u_budgetLinear) * u_opacity * (u_displayMask ? weight : 1.0);
      color.a = signal.a + inputColor.a * (1.0 - signal.a);
      color.rgb = min(vec3(color.a), signal.rgb + inputColor.rgb * (u_add ? 1.0 : 1.0 - signal.a));
    }
    return;
  }
  weight *= u_opacity;
  color = inputColor;
  if (weight <= 0.0) return;
  if (u_operation == 2) {
    if (inputColor.a <= 0.0) return;
    vec3 lookup = (clamp(inputColor.rgb / inputColor.a, 0.0, 1.0) * (u_cubeSize - 1.0) + 0.5) / u_cubeSize;
    color.rgb = mix(inputColor.rgb, texture(u_cube, lookup).rgb * inputColor.a, weight);
  } else if (u_operation == 5) {
    vec4 over = u_layer ? placedLayerAt(u_source, pixel, u_layerDest, u_layerRegion, u_layerTopDown, u_linear) : layerAt(u_source, pixel, u_size, false, false);
    over *= weight;
    color.a = over.a + inputColor.a * (1.0 - over.a);
    color.rgb = min(vec3(color.a), over.rgb + inputColor.rgb * (u_add ? 1.0 : 1.0 - over.a));
  } else {
    vec2 sourcePixel = pixel;
    vec3 tint = vec3(0.0);
    if (u_operation == 3) {
      if (u_reflectX) sourcePixel.x = 2.0 * u_line - sourcePixel.x;
      else sourcePixel.y = 2.0 * u_line - sourcePixel.y;
    } else {
      if (u_scanlines) {
        vec4 transform = texelFetch(u_rows, ivec2(0, int(pixel.y)), 0);
        vec2 pivot = u_size * 0.5;
        sourcePixel = (sourcePixel - pivot) * transform.zw + pivot + transform.xy;
        tint = texelFetch(u_rows, ivec2(1, int(pixel.y)), 0).rgb / 255.0;
      }
      sourcePixel += u_offset + u_amplitude * sin(pixel.yx * u_frequency + u_phase);
      if (u_wrap) sourcePixel = mod(sourcePixel, u_size);
    }
    if (!(all(greaterThanEqual(sourcePixel, vec2(0.0))) && all(lessThan(sourcePixel, u_size)))) return;
    if (u_rejectDepth) {
      if (!u_hasDepth) return;
      float a = depthAt(pixel), b = depthAt(floor(sourcePixel) + 0.5);
      bool aSky = a >= 1.0, bSky = b >= 1.0;
      if (aSky != bSky || (!aSky && abs(a - b) * (u_depthRange.y - u_depthRange.x) > u_depthThreshold)) return;
    }
    vec4 sampled = layerAt(u_source, sourcePixel, u_size, false, false);
    sampled.rgb = clamp(sampled.rgb + tint * sampled.a, vec3(0.0), vec3(sampled.a));
    if (u_over) {
      sampled *= weight;
      color = sampled + inputColor * (1.0 - sampled.a);
    } else color = mix(inputColor, sampled, weight);
  }
}`;function cu(e,{api:t,program:i,resources:a,target:r,textureUnit:n,fullscreen:p,maxSize:c}){let m=i(Df),u=r(),A=a.texture(),j=a.texture(),z=a.texture(),T=a.allocate("Texture"),b=[],v=[],w=a.texture(),F=su(e,{program:i,target:r,textureUnit:n,fullscreen:p}),l=t.history({release:$=>v.push($)}),_;e.activeTexture(e.TEXTURE4),e.bindTexture(e.TEXTURE_3D,T),e.texParameteri(e.TEXTURE_3D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_3D,e.TEXTURE_MAG_FILTER,e.LINEAR);for(let $ of[e.TEXTURE_WRAP_S,e.TEXTURE_WRAP_T,e.TEXTURE_WRAP_R])e.texParameteri(e.TEXTURE_3D,$,e.CLAMP_TO_EDGE);e.texImage3D(e.TEXTURE_3D,0,e.RGBA8,1,1,1,0,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array(4)),e.activeTexture(e.TEXTURE0);function C($,I,y,E,o,h,s){var U,J,ie,N,K,Z,ye,ve,ze,me,Fe,Le,te,H,g,M,G,X,ae,Q,pe,Ae,Pe,Te,we,Me,He,qe,fe,Ne,We,Se;let d=(U=t.resources)==null?void 0:U.call(t,y,E,o);u.resize(E,o);let k,B,O,V;s($,{...I,...y.needsCamera&&Or(I,Ie=>{B=Ie}),...y.needsDepth&&{[Ro](Ie,ne,Ce){var Ue;O=ne,V=Ce.depthRange,(Ue=I[Ro])==null||Ue.call(I,Ie,ne,Ce)}},[Vi]:y.needsOwner?Object.assign((Ie,ne,Ce,Ue)=>{k={world:Ie,texture:ne,depth:Ce,view:Ue}},{depth:y.needsDepth}):void 0},E,o,u.framebuffer),k!=null&&k.depth&&(O=k.depth,V=k.view.depthRange),h||(e.canvas.width!==E&&(e.canvas.width=E),e.canvas.height!==o&&(e.canvas.height=o));for(let Ie of[e.BLEND,e.DEPTH_TEST,e.CULL_FACE,e.SCISSOR_TEST,e.STENCIL_TEST])e.disable(Ie);e.colorMask(!0,!0,!0,!0),e.activeTexture(e.TEXTURE4),e.bindTexture(e.TEXTURE_3D,T);let Y=new Map([["scene",u]]),f=b.slice(),S=new Map,q=(K=(N=(J=I.interfaceTime)!=null?J:I.time)!=null?N:(ie=$.lookSnapshot)==null?void 0:ie.time)!=null?K:0,P=l.begin(y,{source:(Z=I.renderHistoryKey)!=null?Z:$,w:E,h:o,time:q,camera:B,reset:I.resetRenderHistory}),W=!1;if(y.passes.some(Ie=>Ie.enabled&&Ie.effect)&&k){let Ie=t.ownerGroups(k.world),ne=Math.min(2048,c),Ce=Math.ceil(Ie.length/ne),Ue=new Uint8Array(ne*Ce*4);for(let Ke=0;Ke<Ie.length;Ke++)Ue[Ke*4]=Ie[Ke]&255,Ue[Ke*4+1]=Ie[Ke]>>>8&255,Ue[Ke*4+2]=Ie[Ke]>>>16&255,Ue[Ke*4+3]=Ie[Ke]>>>24;n(9,w),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,ne,Ce,0,e.RGBA,e.UNSIGNED_BYTE,Ue),W=!0}let R;for(let[Ie,ne]of y.passes.entries()){let Ce=(ye=Y.get(ne.input))!=null?ye:u;if((!ne.enabled||ne.type==="history"&&!k)&&ne.type!=="mask")Y.set(ne.id,Ce);else{let Ue=(ve=f.pop())!=null?ve:r();b.includes(Ue)||b.push(Ue),Ue.resize(E,o);let Ke=ne.type==="feedback",ot=Ke||ne.type==="history"?P(ne):null,gt=Y.get(ne.mask),xt=ne.type==="grade"&&t.cube(ne),Ye=ne.layer&&(!Ke||ot.capture)&&t.layer(ne,E,o,$,q,B,e,I.time),ft=t.rowTable(ne.rows,E,o,q),rt=ne.enabled&&k&&ne.select&&JSON.stringify(ne.select),Et=ne.opacity*(ne.layer&&!Ke?(ze=Ye==null?void 0:Ye.opacity)!=null?ze:0:1);if(Ye!=null&&Ye.gpu)n(1,Ye.gpu.texture);else if(Ye){if(Ye.w>c||Ye.h>c)throw new RangeError("Render graph layer exceeds the WebGL texture size limit");n(1,j),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,Ye.w,Ye.h,0,e.RGBA,e.UNSIGNED_BYTE,Ye.data)}else n(1,((me=Y.get(ne.source))!=null?me:u).textures[0]);if(xt&&xt!==_&&(e.activeTexture(e.TEXTURE4),e.texImage3D(e.TEXTURE_3D,0,e.RGBA8,xt.size,xt.size,xt.size,0,e.RGBA,e.UNSIGNED_BYTE,xt.data),_=xt),rt&&rt!==R){if(!S.has(rt)){let qt=t.selection(k.world,ne.select),Lt=Math.min(2048,c),jt=Math.ceil(qt.length/Lt),Ot=new Uint8Array(Lt*jt);Ot.set(qt),S.set(rt,{width:Lt,height:jt,data:Ot})}let{width:At,height:wt,data:it}=S.get(rt);n(5,A),e.texImage2D(e.TEXTURE_2D,0,e.R8,At,wt,0,e.RED,e.UNSIGNED_BYTE,it),R=rt}n(0,Ce.textures[0]),n(2,(gt!=null?gt:u).textures[0]),n(3,(Fe=k==null?void 0:k.texture)!=null?Fe:u.textures[0]),n(5,rt?A:u.textures[0]),n(6,O!=null?O:u.textures[0]),n(8,ft?z:u.textures[0]),ft&&e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,2,o,0,e.RGBA,e.FLOAT,ft);let Mt={u_input:0,u_source:1,u_mask:2,u_owner:3,u_cube:4,u_selected:5,u_size:[E,o],u_passSize:[E,o],u_operation:ne.operation,u_opacity:Et,u_enabled:ne.enabled,u_hasMask:!!gt,u_hasSelect:!!rt,u_hasGroups:W,u_packedDepth:!!(k!=null&&k.depth),u_depthMask:!!ne.depth,u_depthInvert:(te=(Le=ne.depth)==null?void 0:Le.invert)!=null?te:!1,u_background:(g=(H=ne.depth)==null?void 0:H.background)!=null?g:!1,u_depthWindow:ne.depth?[ne.depth.near,ne.depth.far,ne.depth.feather]:[0,1,0],u_displayMask:(M=ne.displayMask)!=null?M:!1,u_budgetLinear:((G=ne.budget)==null?void 0:G.filter)==="linear",u_hasRect:!!ne.rect,...ne.rect&&{u_rect:ne.rect,u_feather:ne.feather},u_invert:(X=ne.invert)!=null?X:!1,u_cubeSize:(ae=xt==null?void 0:xt.size)!=null?ae:1,u_depth:6,u_history:7,u_volume:!!(ne.volume&&O&&B),u_rows:8,u_scanlines:!!ft,u_isolated:(Q=ne.isolated)!=null?Q:!1,u_wrap:(pe=ne.wrap)!=null?pe:!1,u_over:ne.type==="distortion"&&ne.blend==="over",u_rejectDepth:ne.depthThreshold!==void 0,u_hasDepth:!!O,u_depthThreshold:(Ae=ne.depthThreshold)!=null?Ae:0,u_depthRange:V!=null?V:[0,1],...ne.volume&&O&&B&&{u_volumeAt:ne.volume.at,u_extent:ne.volume.extent,u_volumeFeather:ne.volume.feather,u_eye:B.eye,u_view:B.view,u_projectionScale:[B.tangent*B.aspect,B.tangent],u_ortho:B.ortho},u_layer:!!Ye,...Ye&&{u_layerDest:Ye.dest,u_layerTopDown:!Ye.gpu,u_layerRegion:(Te=(Pe=Ye.gpu)==null?void 0:Pe.region)!=null?Te:[0,0,Ye.w,Ye.h]},u_linear:(Ye==null?void 0:Ye.filter)==="linear",u_add:(Ke?ne.blend:(we=Ye==null?void 0:Ye.blend)!=null?we:ne.blend)==="add",u_reflectX:ne.axis==="x",u_line:(Me=ne.line)!=null?Me:(ne.axis==="x"?E:o)*.5,...ne.offset&&{u_offset:ne.offset,u_amplitude:ne.amplitude,u_frequency:2*Math.PI/ne.period,u_phase:2*Math.PI*((ne.phase+q*ne.rate)%1)}};if(ne.effect)n(9,W?w:u.textures[0]),F(ne,d.passes[Ie],Ue,Mt,E,o,q,Ce.textures[0]);else if(ot){let At=ot.value;if(ot.capture){e.activeTexture(e.TEXTURE0),At=(He=v.pop())!=null?He:r();let wt=(qe=d==null?void 0:d.passes[Ie])!=null?qe:{width:E,height:o};At.resize(wt.width,wt.height),n(0,Ce.textures[0]),n(7,(Ne=(fe=ot.value)==null?void 0:fe.textures[0])!=null?Ne:u.textures[0]);let it=Ke&&t.feedbackMotion(ne,q,ot.decay>0?ot.elapsed:0,E,o);p(m,At.framebuffer,wt.width,wt.height,{...Mt,u_passSize:[wt.width,wt.height],u_captureHistory:!0,u_hasHistory:!!ot.value&&(!Ke||ot.decay>0),u_hold:ne.mode==="hold",u_decay:Ke||ne.mode==="persistence"?ot.decay:0,...it&&{u_feedbackTransform:it.transform,u_feedbackPivot:it.pivot,u_offset:it.offset,u_amplitude:it.wave,u_frequency:it.frequency,u_phase:it.theta,u_blockSize:it.blockSize,u_feedbackLinear:ne.filter==="linear",u_gain:ne.gain*(ne.layer?(We=Ye==null?void 0:Ye.opacity)!=null?We:0:1),u_hasThreshold:!!ne.threshold,u_threshold:(Se=ne.threshold)!=null?Se:[0,1]}}),ot.save(At)}n(7,At.textures[0]),p(m,Ue.framebuffer,E,o,{...Mt,u_captureHistory:!1,u_hasHistory:!0})}else n(7,u.textures[0]),p(m,Ue.framebuffer,E,o,Mt);Y.set(ne.id,Ue)}for(let Ue of ne.dependencies)if(y.lastUse.get(Ue)===Ie){let Ke=Y.get(Ue);Y.delete(Ue),Ke!==u&&![...Y.values()].includes(Ke)&&f.push(Ke)}}n(0,Y.get(y.output).textures[0]),p(m,h,E,o,{u_operation:0,u_cube:4,u_size:[E,o],u_passSize:[E,o]})}return Object.assign(C,{reset:l.clear})}var Pf=`
uniform vec3 u_envEye, u_envRight, u_envUp, u_envBack;
uniform vec4 u_envCamera; // tangent, aspect, orthographic, eye setback
uniform vec2 u_envSkyView;
uniform float u_envHorizon;
vec2 envScreen(vec2 pixel, vec2 size) { return 2.0 * pixel / size - 1.0; }
vec3 envOffset(vec2 p) { return p.x * u_envRight + p.y * u_envUp; }
vec3 envSkyRay(vec2 pixel, vec2 size) {
  return normalize(envOffset(envScreen(pixel,size) * u_envSkyView) - u_envBack);
}
`,Lf=`
uniform highp sampler2D u_envData;
vec4 envRow(int index) {
  return texelFetch(u_envData, ivec2(index & 63, index >> 6), 0);
}
`;function Li(e=!1){return Pf+Lf+(e?"uniform highp sampler3D u_eFogField;uniform vec3 u_eFogMin,u_eFogExtent,u_eFogSize;vec3 eFogLight(vec3 p){vec3 uv=(clamp((p-u_eFogMin)/u_eFogExtent,vec3(0),vec3(1))*(u_eFogSize-1.0)+.5)/u_eFogSize;return texture(u_eFogField,uv).rgb;}":"")+`
uniform int u_envFogCount, u_envCardSize;
uniform int u_envPaletteFog, u_envPaletteStart, u_envPaletteCard;
vec3 envPalette(vec3 base, int index, vec4 signals) {
  if (index < 0) return base;
  vec4 field = envRow(index);
  if (field.x < 0.5) return base;
  vec4 transfer = envRow(index+1);
  float value = clamp((signals[int(field.y)]-field.z)/field.w,0.0,1.0);
  int first = int(transfer.x), count = int(transfer.y);
  if (field.x < 1.5) {
    for (int i=32; i>=0; i--) {
      if (i >= count) continue;
      vec4 stop = envRow(first+i);
      if (value >= stop.w) return mix(base,stop.rgb,transfer.z);
    }
    return base;
  }
  return mix(base,envRow(first+int(floor(value*float(count-1)+0.5))).rgb,transfer.z);
}
uniform highp sampler2D u_envCard, u_envCloudLight;
uniform float u_envBands, u_envCloudHardness;
float envBand(float value) {
  return u_envBands > 1.0 ? floor(clamp(value,0.0,1.0)*(u_envBands-1.0)+0.5)/(u_envBands-1.0) : value;
}
uniform vec4 u_envCardFrame, u_envCloudStyle, u_envCloudDomain, u_envCloudHeight;
uniform vec3 u_envCardRight, u_envCardUp, u_envCardNormal, u_envCloudRGB, u_envCloudSun, u_envCloudLightRGB;

bool envSlab(inout vec2 hit, float pos, float dir, float lo, float hi) {
  if (abs(dir) < 1e-10) return pos > lo && pos < hi;
  vec2 a = (vec2(lo,hi) - pos) / dir;
  hit = vec2(max(hit.x,min(a.x,a.y)),min(hit.y,max(a.x,a.y)));
  return hit.y > hit.x;
}
bool envRadial(inout vec2 hit, float a, float b, float c) {
  if (a < 1e-10) return c < 0.0;
  float delta = b*b - a*c;
  if (delta <= 0.0) return false;
  float r = sqrt(delta);
  hit = vec2(max(hit.x,(-b-r)/a),min(hit.y,(-b+r)/a));
  return hit.y > hit.x;
}
bool envFogInterval(vec3 origin, vec3 ray, float stop, int index, out vec2 hit) {
  vec4 first = envRow(index), second = envRow(index+1), range = envRow(index+3);
  hit = vec2(range.x,min(range.y,stop));
  if (hit.y <= hit.x) return false;
  if (first.w < 0.5) return envSlab(hit,origin.y,ray.y,first.y,second.y);
  if (first.w < 1.5) return envSlab(hit,origin.x,ray.x,first.x,second.x) &&
    envSlab(hit,origin.y,ray.y,first.y,second.y) && envSlab(hit,origin.z,ray.z,first.z,second.z);
  vec3 offset = origin-first.xyz;
  if (first.w < 2.5) return envRadial(hit,1.0,dot(offset,ray),dot(offset,offset)-range.z*range.z);
  float p = dot(offset,second.xyz), d = dot(ray,second.xyz);
  return envSlab(hit,p,d,0.0,second.w) &&
    envRadial(hit,1.0-d*d,dot(offset,ray)-p*d,dot(offset,offset)-p*p-range.z*range.z);
}
vec4 envFog(vec3 origin, vec3 ray, float stop, float setback) {
  const int budget = ${2*16};
  vec2 events[budget];
  int n = 0;
  for (int i=0; i<16; i++) {
    if (i >= u_envFogCount) break;
    vec2 hit;
    if (envFogInterval(origin,ray,stop,4*i,hit)) {
      events[n++] = vec2(hit.x,float(i+1));
      events[n++] = vec2(hit.y,-float(i+1));
    }
  }
  for (int i=1; i<budget; i++) {
    if (i >= n) break;
    vec2 value = events[i];
    int j = i;
    for (; j>0; j--) {
      if (events[j-1].x <= value.x) break;
      events[j] = events[j-1];
    }
    events[j] = value;
  }
  vec4 result = vec4(0,0,0,1), medium = vec4(0);
  ${e?"vec3 luminous=vec3(0);":""}
  float last = 0.0;
  int fieldMask = 0;
  float rateFloor = n > 0 ? (events[n-1].x-events[0].x)/64.0 : 0.0;
  for (int i=0; i<budget; i++) {
    if (i >= n) break;
    vec2 event = events[i];
    if (medium.a > 1e-10 && event.x > last) {
      if (fieldMask != 0) {
        float stepSize = event.x-last;
        for (int v=0; v<16; v++) {
          if ((fieldMask & (1 << v)) != 0) stepSize = min(stepSize,envRow(u_envPaletteStart+v*2+1).w);
        }
        stepSize = max(stepSize, max(rateFloor,1e-5));
        for (int j=0; j<64; j++) {
          float from = last+float(j)*stepSize;
          if (from >= event.x) break;
          float distance = min(stepSize,event.x-from), depth = from+distance*0.5;
          vec3 point = origin+ray*depth, color = medium.rgb;
          ${e?"vec3 litColor=luminous;":""}
          for (int v=0; v<16; v++) {
            if ((fieldMask & (1 << v)) == 0) continue;
            vec4 source = envRow(v*4+2);
            vec3 tint = envPalette(source.rgb,u_envPaletteStart+v*2,vec4(max(0.0,depth-setback),point.y,0.0,0.0));
            vec3 change = (tint-source.rgb)*source.a;
            color += change;
            ${e?"if(envRow(v*4+3).w>.5)litColor+=change;":""}
          }
          ${e?"if(dot(litColor,vec3(1))>0.0)color+=litColor*(eFogLight(point)-1.0);":""}
          float alpha = 1.0-exp(-medium.a*distance);
          result.rgb += result.a*alpha*color/medium.a;
          result.a *= 1.0-alpha;
        }
      } else {
      ${e?`if(dot(luminous,vec3(1))>0.0){
        float ds=(event.x-last)/4.0,alpha=1.0-exp(-medium.a*ds);
        for(int j=0;j<4;j++){vec3 p=origin+ray*(last+(float(j)+.5)*ds);vec3 light=eFogLight(p);
          result.rgb+=result.a*alpha*(medium.rgb-luminous+luminous*light)/medium.a;result.a*=1.0-alpha;}
      }else{`:""}
      float alpha = 1.0-exp(-medium.a*(event.x-last));
      result.rgb += result.a * alpha * medium.rgb / medium.a;
      result.a *= 1.0-alpha;
      ${e?"}":""}
      }
    }
    int volumeIndex = int(abs(event.y))-1;
    if (u_envPaletteFog != 0 && envRow(u_envPaletteStart+volumeIndex*2).x > 0.5) {
      int bit = 1 << volumeIndex;
      if (event.y > 0.0) fieldMask |= bit;
      else fieldMask &= ~bit;
    }
    vec4 volume = envRow(4*volumeIndex+2);
    medium += sign(event.y)*vec4(volume.rgb*volume.a,volume.a);
    ${e?"if(envRow(4*(int(abs(event.y))-1)+3).w>.5)luminous+=sign(event.y)*volume.rgb*volume.a;":""}
    last = event.x;
  }
  if (u_envBands > 1.0 && result.a < 1.0) {
    float alpha = 1.0-result.a, styled = envBand(alpha);
    result = vec4(result.rgb*(styled/alpha),1.0-styled);
  }
  return result;
}
vec3 envCardTexel(ivec2 p) {
  if (any(lessThan(p,ivec2(0))) || any(greaterThanEqual(p,ivec2(u_envCardSize)))) return vec3(0);
  return texelFetch(u_envCard,p,0).rgb;
}
float envLightTexel(ivec2 p) {
  if (any(lessThan(p,ivec2(0))) || any(greaterThanEqual(p,textureSize(u_envCloudLight,0)))) return 0.0;
  return texelFetch(u_envCloudLight,p,0).r;
}
float envCone(vec2 point) {
  vec2 xy = (point-u_envCloudDomain.xy)/u_envCloudDomain.zw - 0.5;
  ivec2 p = ivec2(floor(xy));
  vec2 f = fract(xy);
  return mix(mix(envLightTexel(p),envLightTexel(p+ivec2(1,0)),f.x),
    mix(envLightTexel(p+ivec2(0,1)),envLightTexel(p+ivec2(1)),f.x),f.y);
}
vec4 envCard(vec3 origin, vec3 ray, float start, float stop) {
  if (u_envCardSize == 0) return vec4(0,0,0,1);
  float d = -dot(ray,u_envCardNormal);
  if (d <= 1e-8) return vec4(0,0,0,1);
  vec3 delta = u_envCardFrame.xyz-origin;
  float plane = -dot(delta,u_envCardNormal)/d;
  vec3 point = plane*ray-delta;
  vec2 uv = (0.5 + 0.5*vec2(dot(point,u_envCardRight),dot(point,u_envCardUp))/u_envCardFrame.w)*float(u_envCardSize)-0.5;
  ivec2 p = ivec2(floor(uv));
  vec2 f = fract(uv);
  vec3 texel = mix(mix(envCardTexel(p),envCardTexel(p+ivec2(1,0)),f.x),
    mix(envCardTexel(p+ivec2(0,1)),envCardTexel(p+ivec2(1)),f.x),f.y);
  if (texel.x <= 0.0) return vec4(0,0,0,1);
  vec2 span = plane + texel.yz/(texel.x*d);
  vec2 clip = vec2(max(start,span.x),min(stop,span.y));
  if (clip.y <= clip.x) return vec4(0,0,0,1);
  float mass = texel.x*(clip.y-clip.x)/((span.y-span.x)*d);
  float coverage = 1.0-exp(-mass), hardness = u_envCloudHardness;
  if (hardness > 0.5) coverage = clamp(0.5+(coverage-0.5)*(1.0+(hardness-0.5)*13.0),0.0,1.0);
  else if (hardness < 0.5) coverage = mix(coverage,acos(1.0-2.0*coverage)/3.14159265359,1.0-2.0*hardness);
  float alpha = u_envCloudHeight.z*coverage;
  vec3 at = origin + ray * (0.5*(clip.x+clip.y));
  float brightness = 0.0, density = coverage;
  if (u_envCloudHeight.w > 0.0) {
    float y = clamp((at.y-u_envCloudHeight.x)/u_envCloudHeight.y,0.0,1.0);
    density = envCone(at.xz);
    float rim = pow(max(0.0,dot(u_envCloudSun,ray)),12.0);
    float up = envCone(at.xz+u_envCloudSun.xz*u_envCloudHeight.w);
    float relief = clamp(0.52 + 1.45*(density-up),0.0,1.0);
    float light = clamp(u_envCloudStyle.x + u_envCloudStyle.w *
      (u_envCloudStyle.y*(0.24+0.76*relief)*(0.48+0.52*y)+u_envCloudStyle.z*rim),0.0,1.0);
    brightness = light*(0.49+0.51*exp(-mass*0.58));
  }
  vec3 color = envPalette(u_envCloudRGB,u_envPaletteCard,vec4(0.0,at.y,density,brightness));
  color = mix(color,u_envCloudLightRGB,brightness);
  return vec4(alpha*color,1.0-alpha);
}
vec3 envMedia(vec3 color, vec2 pixel, vec2 size, float axialDepth) {
  if (u_envFogCount == 0 && u_envCardSize == 0) return color;
  bool ortho = u_envCamera.z > 0.5;
  vec2 screen = envScreen(pixel,size) * u_envCamera.xy;
  vec3 offset = envOffset(screen);
  float axial = ortho ? 1.0 : inversesqrt(1.0+dot(screen,screen));
  vec3 origin = ortho ? u_envEye+offset : u_envEye;
  vec3 ray = ortho ? -u_envBack : (offset-u_envBack)*axial;
  float stop = min(axialDepth,u_envHorizon)/axial;
  if (u_envCardSize > 0) {
    vec4 card = envCard(origin,ray,u_envCamera.w,stop);
    color = card.rgb + card.a*color;
  }
  if (u_envFogCount > 0) {
    vec4 fog = envFog(origin,ray,stop,u_envCamera.w/axial);
    color = fog.rgb + fog.a*color;
  }
  return color;
}
`}var If=Li(),Aa=`
uniform int u_envHasSky, u_envSkySplats, u_envSkyStart, u_envBackdropSampled;
uniform highp sampler2D u_envBackdrop;
uniform vec3 u_envBackground, u_envZenith, u_envSkyHorizon, u_envGround, u_envSun, u_envSunRGB;
uniform vec3 u_envSunParams;
vec3 envBackdrop(vec2 pixel, vec2 size) {
  if (u_envBackdropSampled == 1) {
    vec2 pos = pixel * vec2(textureSize(u_envBackdrop,0)) / size;
    return texelFetch(u_envBackdrop,ivec2(pos),0).rgb;
  }
  if (u_envHasSky == 0) return u_envBackground;
  vec3 ray = envSkyRay(pixel,size);
  float y = ray.y, angle = dot(ray,u_envSun);
  float fade = envBand(y > 0.0 ? sqrt(y) : clamp(-y*3.0,0.0,1.0));
  float disk = y >= 0.0 ? 0.92*clamp((angle-u_envSunParams.x)/max(1e-8,u_envSunParams.y-u_envSunParams.x),0.0,1.0) : 0.0;
  float glow = angle > 0.0 && y >= 0.0 ? 0.22*exp(-19.0*(1.0-angle)) : 0.0;
  vec3 color = mix(mix(u_envSkyHorizon,y > 0.0 ? u_envZenith : u_envGround,fade),u_envSunRGB,
    clamp((disk+glow)*u_envSunParams.z,0.0,1.0));
  for (int i=0; i<u_envSkySplats; i++) {
    int at = u_envSkyStart + i*4;
    vec4 n = envRow(at), r = envRow(at+1), u = envRow(at+2), s = envRow(at+3);
    float z = dot(ray,n.xyz);
    if (z <= 0.0) continue;
    vec2 q = vec2(dot(ray,r.xyz),dot(ray,u.xyz))/(z*vec2(r.w,u.w));
    float d = dot(q,q);
    if (d < 9.0) color = mix(color,s.rgb,n.w*exp(-0.5*d));
  }
  return color;
}
`,Zd=If+Aa,uu=(e=!1)=>Li(e)+Aa,lu=(e,t=!1)=>`#version 300 es
precision highp float; precision highp int;
${Li(t)+Aa}
uniform vec2 u_envViewport;
layout(location=0) out vec4 scene;
layout(location=1) out vec4 depth;
${e?"layout(location=2) out vec4 back; layout(location=3) out vec4 through;":""}
void main() {
  scene = vec4(envMedia(envBackdrop(gl_FragCoord.xy,u_envViewport),gl_FragCoord.xy,u_envViewport,u_envHorizon),1);
  depth = vec4(1,0,0,1);
  ${e?"back = scene; through = vec4(1);":""}
}`;var mo=(e,t,i)=>`
${e?"#define WATER_AIR_POCKETS":""}
uniform highp sampler2D u_waterData;
uniform int u_waterCount;
${t?"#define WATER_LAYERED":""}
${i?"#define WATER_ATLAS":""}
#if defined(WATER_LAYERED) || defined(WATER_ATLAS)
precision highp int;
#endif
#ifdef WATER_ATLAS
uniform int u_waterNodeCount, u_waterBodyBase, u_waterStyleBase;
vec4 waterTexel(int i) {
  int width = textureSize(u_waterData, 0).x;
  return texelFetch(u_waterData, ivec2(i % width, i / width), 0);
}
#else
#ifdef WATER_LAYERED
uniform int u_waterSpanMode[8];
#endif
uniform vec4 u_waterMin[8], u_waterMax[8], u_waterGrid[8];
uniform vec4 u_waterTint[8], u_waterLoss[8], u_waterHighlight[8];
#endif

struct WaterStyle {
  vec4 tint, loss, highlight;
  int index;
  #ifdef WATER_ATLAS
  vec4 deep, sediment, depth;
  #else
  float refraction;
  #endif
};
WaterStyle readWaterStyle(int i) {
  #ifdef WATER_ATLAS
  int at = u_waterStyleBase + i * 6;
  return WaterStyle(waterTexel(at), waterTexel(at + 1), waterTexel(at + 2), i,
    waterTexel(at + 3), waterTexel(at + 4), waterTexel(at + 5));
  #else
  return WaterStyle(u_waterTint[i], u_waterLoss[i], u_waterHighlight[i], i, u_waterMax[i].w);
  #endif
}
uniform mat4 u_waterView;
uniform vec3 u_waterEye;
uniform vec3 u_waterCamera;
uniform vec4 u_arrivalPlane;
uniform float u_waterTime, u_waterWindGain;

// Captures reuse the same body/style index in the column and atlas layouts.
uniform sampler2D u_waterReflections;
uniform int u_waterReflectionBase, u_waterReflectionCount;
uniform vec4 u_waterReflectionActive, u_waterReflectionHeights;
uniform vec2 u_waterReflectionGrid, u_waterReflectionViewport;
uniform mat4 u_waterProjection;
vec3 waterReflectedColor(WaterStyle style, vec3 p, vec2 ripple) {
  if (u_waterReflectionCount == 0) return style.highlight.rgb;
  int offset = u_waterReflectionBase + style.index;
  int width = textureSize(u_waterData, 0).x;
  vec3 binding = texelFetch(u_waterData, ivec2(offset % width, offset / width), 0).xyz;
  int slot = int(binding.x) - 1;
  if (slot < 0 || u_waterReflectionActive[slot] == 0.0 || abs(p.y-u_waterReflectionHeights[slot]) > 0.002) return style.highlight.rgb;
  vec4 clip = u_waterProjection * u_waterView * vec4(p, 1.0);
  vec2 uv = clip.xy / clip.w * 0.5 + 0.5;
  vec2 normal = (mat3(u_waterView) * vec3(ripple.x, 0.0, ripple.y)).xy;
  uv += binding.y * normal / u_waterReflectionViewport;
  vec2 tile = vec2(slot % 2, slot / 2), size = vec2(textureSize(u_waterReflections, 0)) / u_waterReflectionGrid;
  vec2 edge = 0.5 / size;
  vec2 at = (tile + clamp(uv, edge, 1.0-edge)) / u_waterReflectionGrid;
  vec3 reflected = texture(u_waterReflections, at).rgb;
  if (binding.z > 0.0) {
    vec2 blur = binding.z / u_waterReflectionViewport;
    reflected *= 0.4;
    reflected += texture(u_waterReflections,(tile+clamp(uv+vec2(blur.x,0),edge,1.0-edge))/u_waterReflectionGrid).rgb * 0.15;
    reflected += texture(u_waterReflections,(tile+clamp(uv-vec2(blur.x,0),edge,1.0-edge))/u_waterReflectionGrid).rgb * 0.15;
    reflected += texture(u_waterReflections,(tile+clamp(uv+vec2(0,blur.y),edge,1.0-edge))/u_waterReflectionGrid).rgb * 0.15;
    reflected += texture(u_waterReflections,(tile+clamp(uv-vec2(0,blur.y),edge,1.0-edge))/u_waterReflectionGrid).rgb * 0.15;
  }
  return reflected * style.highlight.rgb;
}

bool waterSlab(inout vec2 interval, float p, float d, float low, float high) {
  if (abs(d) < 1e-8) return p >= low && p < high;
  vec2 times = (vec2(low, high) - p) / d;
  interval = vec2(max(interval.x, min(times.x, times.y)), min(interval.y, max(times.x, times.y)));
  return interval.x < interval.y;
}

#ifdef WATER_AIR_POCKETS
uniform int u_waterAirCount;
uniform vec4 u_waterAirMin[8], u_waterAirMax[8];

bool airSlab(inout vec2 interval, float p, float d, float low, float high) {
  if (abs(d) < 1e-8) return p > low && p < high;
  return waterSlab(interval, p, d, low, high);
}

bool inAir(float t, vec2 air[8], int count) {
  for (int i = 0; i < 8; i++) {
    if (i >= count || air[i].x > t) break;
    if (t < air[i].y) return true;
  }
  return false;
}

float wetLength(vec2 wet, vec2 air[8], int count) {
  float remaining = wet.y - wet.x;
  float cursor = wet.x;
  for (int i = 0; i < 8; i++) {
    if (i >= count || air[i].x >= wet.y) break;
    float a = max(cursor, air[i].x), b = min(wet.y, air[i].y);
    if (b > a) {
      remaining -= b - a;
      cursor = b;
    }
  }
  return max(0.0, remaining);
}
#endif

void waterSurface(int body, vec3 p, vec3 ray, vec4 column, WaterStyle style, inout vec3 light, inout vec3 through,
                  inout vec3 mark) {
  vec4 highlight = style.highlight;
  vec2 flow = clamp(column.zw, vec2(-4.0), vec2(4.0));
  vec2 position = p.xz - flow * (u_waterTime * 0.25);
  vec2 phase = vec2(dot(position, vec2(3.1, 1.9)), dot(position, vec2(-1.7, 4.4))) +
    u_waterTime * vec2(2.0, -1.6);
  vec2 ripple = sin(phase);
  float grazing = pow(max(0.0, 1.0 - abs(ray.y)), 3.0);
  float foam = (1.0 - smoothstep(0.05, 0.4, column.y - column.x)) *
    smoothstep(0.08, 0.73, (ripple.x + ripple.y) * 0.5) * style.tint.w;
  float reflection = highlight.w * (0.16 + 0.84 * grazing);
  if (highlight.w < 0.0) {
    float f0 = -1.0 - highlight.w;
    reflection = f0 > 0.0 ? f0 + (1.0 - f0) * pow(1.0 - abs(ray.y), 5.0) : 0.0;
  }
  float opacity = clamp(reflection + foam, 0.0, 1.0);
  light += through * mix(waterReflectedColor(style, p, ripple * (1.0 + u_waterWindGain)), vec3(0.9, 0.98, 0.94), foam) * opacity;
  through *= 1.0 - opacity;
  #ifdef WATER_ATLAS
  float refraction = style.deep.w;
  #else
  float refraction = style.refraction;
  #endif
  if (mark.x == 0.0 && refraction > 0.0) {
    vec2 shift = round(ripple * refraction);
    mark = vec3(1.0, float(body) / 255.0, ((shift.x + 4.0) + 9.0 * (shift.y + 4.0)) / 255.0);
  }
}

void waterInterval(int body, vec3 eye, vec3 ray, float limit, float start, float end,
                   vec4 column, bool exposed, bool layered, WaterStyle style, vec2 depthBounds,
                   #ifdef WATER_AIR_POCKETS
                   vec2 air[8], int airCount,
                   #endif
                   inout vec3 light, inout vec3 through, inout vec3 mark,
                   inout float caustic, inout bool surfaceSeen) {
  vec2 wet = vec2(start, end);
  bool horizontal = abs(ray.y) < 1e-8;
  bool inside = (eye.y > column.x || (layered && eye.y == column.x)) && eye.y < column.y;
  if (horizontal ? inside : waterSlab(wet, eye.y, ray.y, column.x, column.y)) {
    float top = horizontal ? -1.0 : (column.y - eye.y) / ray.y;
    bool surface = exposed && (layered || !surfaceSeen) && top >= start && top <= end && top < limit;
    float endpointY = eye.y + ray.y * limit;
    bool endpoint = wet.y == limit && (!layered || (exposed && endpointY >= column.x && endpointY < column.y));
    float distance = wet.y - wet.x;
    #ifdef WATER_AIR_POCKETS
    surface = surface && !inAir(top, air, airCount);
    endpoint = endpoint && !inAir(limit, air, airCount);
    distance = wetLength(wet, air, airCount);
    #endif
    if (surface && ray.y < 0.0)
      waterSurface(body, eye + ray * top, ray, column, style, light, through, mark);
    vec3 transmission = exp(-style.loss.rgb * distance);
    vec3 tint = style.tint.rgb;
    #ifdef WATER_ATLAS
    vec3 center = eye + ray * ((wet.x + wet.y) * 0.5);
    float deep = smoothstep(style.depth.x, style.depth.y, depthBounds.y - center.y);
    tint = mix(tint, style.deep.rgb, deep);
    if (style.sediment.w > 0.0) {
      vec3 drift = vec3(column.z, 0.03, column.w) * u_waterTime;
      vec3 grainPoint = (center - drift) * style.depth.w;
      vec3 bucket = floor(grainPoint), offset = fract(grainPoint) - 0.5;
      float grain = fract(sin(dot(bucket, vec3(2.13, 3.71, 5.73))) * 17368.429);
      float fleck = 1.0 - smoothstep(0.01, 0.19, dot(offset, offset));
      float nearBed = exp(-max(0.0, center.y - depthBounds.x) / style.depth.z);
      float grains = style.sediment.w * (0.22 + 0.78 * fleck * smoothstep(0.65, 0.97, grain)) *
        nearBed * (1.0 - exp(-1.8 * distance));
      light += through * style.sediment.rgb * grains;
      through *= 1.0 - grains * 0.65;
    }
    #endif
    light += through * (1.0 - transmission) * tint;
    through *= transmission;
    if (surface && ray.y > 0.0)
      waterSurface(body, eye + ray * top, ray, column, style, light, through, mark);
    surfaceSeen = surfaceSeen || surface;
    if (endpoint) {
      vec3 p = eye + ray * limit;
      float depth = column.y - p.y;
      vec2 xz = p.xz - clamp(column.zw, vec2(-4.0), vec2(4.0)) * (u_waterTime * 0.17);
      float a = sin(dot(xz, vec2(7.1, 3.8)) + u_waterTime * 2.1);
      float b = sin(dot(xz, vec2(-5.2, 6.4)) - u_waterTime * 1.7);
      caustic = smoothstep(0.78, 0.98, abs(a * b)) * exp(-max(0.0, depth) * 1.2) * style.loss.w;
    }
  }
}

void waterColumns(int body, vec3 eye, vec3 ray, float limit,
                  #ifdef WATER_AIR_POCKETS
                  vec2 air[8], int airCount,
                  #endif
                  inout vec3 light, inout vec3 through,
                  inout vec3 mark, inout float caustic) {
  #ifdef WATER_ATLAS
  int at = u_waterBodyBase + body * 4;
  vec4 low = waterTexel(at), high = waterTexel(at + 1), grid = waterTexel(at + 2);
  int styleId = int(high.w);
  #ifdef WATER_LAYERED
  bool layered = waterTexel(at + 3).x > 0.5;
  #endif
  WaterStyle style = readWaterStyle(styleId);
  #else
  vec4 low = u_waterMin[body], high = u_waterMax[body], grid = u_waterGrid[body];
  #ifdef WATER_LAYERED
  bool layered = u_waterSpanMode[body] == 1;
  #endif
  WaterStyle style = readWaterStyle(body);
  #endif
  vec2 range = vec2(0.0, limit);
  if (!waterSlab(range, eye.x, ray.x, low.x, high.x) ||
      !waterSlab(range, eye.z, ray.z, low.z, high.z)) return;
  vec2 origin = (eye.xz - low.xz) / grid.xy, direction = ray.xz / grid.xy;
  if (abs(ray.x) < 1e-8) direction.x = 0.0;
  if (abs(ray.z) < 1e-8) direction.y = 0.0;
  vec2 crossing = origin + direction * range.x;
  ivec2 count = ivec2(grid.zw), stepCell = ivec2(sign(direction));
  ivec2 cell = ivec2(floor(crossing));
  if (stepCell.x < 0 && crossing.x == floor(crossing.x)) cell.x--;
  if (stepCell.y < 0 && crossing.y == floor(crossing.y)) cell.y--;
  cell = clamp(cell, ivec2(0), count - 1);
  vec2 face = vec2(cell) + max(vec2(stepCell), 0.0);
  vec2 next = vec2(direction.x == 0.0 ? 1e30 : (face.x - origin.x) / direction.x,
                   direction.y == 0.0 ? 1e30 : (face.y - origin.y) / direction.y);
  vec2 stride = vec2(direction.x == 0.0 ? 0.0 : abs(1.0 / direction.x),
                     direction.y == 0.0 ? 0.0 : abs(1.0 / direction.y));
  float start = range.x;
  bool surfaceSeen = false;
  for (int cellStep = 0; cellStep < 128; cellStep++) {
    float end = max(start, min(range.y, min(next.x, next.y)));
    #ifdef WATER_ATLAS
    vec4 column = waterTexel(int(low.w) + cell.y * count.x + cell.x);
    #else
    vec4 column = texelFetch(u_waterData, cell + ivec2(0, int(low.w)), 0);
    #endif
    if (end > start) {
      #ifdef WATER_LAYERED
      if (layered) {
        int first = int(column.x), length = int(column.y);
        for (int i = 0; i < 32; i++) {
          if (i >= length) break;
          int slot = ray.y < 0.0 ? length - 1 - i : i;
          #ifdef WATER_ATLAS
          int offset = first + slot * 2;
          vec4 span = waterTexel(offset), info = waterTexel(offset + 1);
          bool exposed = info.y > 0.5;
          WaterStyle localStyle = style;
          if (int(info.x) != styleId) localStyle = readWaterStyle(int(info.x));
          vec2 depthBounds = info.zw;
          #else
          int width = textureSize(u_waterData, 0).x, offset = first + slot;
          int flags = int(slot < 16 ? column.z : column.w);
          bool exposed = (flags & (1 << (slot % 16))) != 0;
          vec4 span = texelFetch(u_waterData, ivec2(offset % width, offset / width), 0);
          WaterStyle localStyle = style;
          vec2 depthBounds = span.xy;
          #endif
          waterInterval(body, eye, ray, limit, start, end, span, exposed, true, localStyle, depthBounds,
            #ifdef WATER_AIR_POCKETS
            air, airCount,
            #endif
            light, through, mark, caustic, surfaceSeen);
        }
      } else
      #endif
      if (column.y > column.x) waterInterval(body, eye, ray, limit, start, end, column, true, false, style, column.xy,
        #ifdef WATER_AIR_POCKETS
        air, airCount,
        #endif
        light, through, mark, caustic, surfaceSeen);
    }
    if (end >= range.y) break;
    bvec2 crossFace = lessThanEqual(next, vec2(end));
    if (crossFace.x) { cell.x += stepCell.x; next.x += stride.x; }
    if (crossFace.y) { cell.y += stepCell.y; next.y += stride.y; }
    if (any(lessThan(cell, ivec2(0))) || any(greaterThanEqual(cell, count))) break;
    start = end;
  }
}

vec3 waterPaint(vec3 color, vec2 pixel, vec2 size, float axial, out vec3 mark) {
  mark = vec3(0);
  if (u_waterCount == 0 || axial <= 0.0) return color;
  vec2 plane = (pixel * 2.0 / size - 1.0) * u_waterCamera.xy;
  bool ortho = u_waterCamera.z > 0.5;
  mat3 basis = transpose(mat3(u_waterView));
  vec3 eye = u_waterEye + (ortho ? basis * vec3(plane, 0.0) : vec3(0));
  vec3 direction = basis * vec3(ortho ? vec2(0) : plane, -1.0);
  float rayScale = length(direction);
  vec3 ray = direction / rayScale;
  float limit = axial * rayScale;
  float startSide = dot(u_arrivalPlane, vec4(eye, 1.0));
  if (startSide < 0.0) {
    float into = dot(u_arrivalPlane.xyz, ray);
    if (into <= 0.0) return color;
    float entrance = -startSide / into;
    if (entrance >= limit) return color;
    eye += ray * entrance;
    limit -= entrance;
  }
  #ifdef WATER_AIR_POCKETS
  vec2 air[8];
  int airCount = 0;
  for (int i = 0; i < 8; i++) {
    if (i >= u_waterAirCount) break;
    vec3 low = u_waterAirMin[i].xyz, high = u_waterAirMax[i].xyz;
    vec2 hit = vec2(0.0, 1e30);
    if (!airSlab(hit, eye.x, ray.x, low.x, high.x) || !airSlab(hit, eye.y, ray.y, low.y, high.y) ||
        !airSlab(hit, eye.z, ray.z, low.z, high.z) || hit.x >= limit) continue;
    int at = airCount;
    for (int j = 0; j < 8; j++) {
      if (at <= 0 || air[at - 1].x <= hit.x) break;
      air[at] = air[at - 1];
      at--;
    }
    air[at] = hit;
    airCount++;
  }
  #endif
  vec3 light = vec3(0), through = vec3(1);
  float caustic = 0.0;
  #ifdef WATER_ATLAS
  // Each hit uses a stackless BVH walk bounded by the next nearer entry.
  // Body interiors are disjoint, so its exit is the next search cursor.
  float cursor = 0.0;
  for (int j = 0; j < u_waterCount; j++) {
    int body = -1, node = 0;
    float first = limit, exit = limit;
    while (node < u_waterNodeCount) {
      vec4 low = waterTexel(node * 2), high = waterTexel(node * 2 + 1);
      vec2 hit = vec2(cursor, first);
      if (waterSlab(hit, eye.x, ray.x, low.x, high.x) &&
          waterSlab(hit, eye.y, ray.y, low.y, high.y) &&
          waterSlab(hit, eye.z, ray.z, low.z, high.z)) {
        if (high.w < 0.0) {
          node++;
          continue;
        }
        body = int(high.w);
        first = hit.x;
        // The search bound clips hit.y and must not clip the actual exit.
        vec2 extent = vec2(cursor, limit);
        waterSlab(extent, eye.x, ray.x, low.x, high.x);
        waterSlab(extent, eye.y, ray.y, low.y, high.y);
        waterSlab(extent, eye.z, ray.z, low.z, high.z);
        exit = extent.y;
      }
      node = int(low.w);
    }
    if (body < 0) break;
    waterColumns(body, eye, ray, limit,
      #ifdef WATER_AIR_POCKETS
      air, airCount,
      #endif
      light, through, mark, caustic);
    if (exit >= limit) break;
    cursor = exit;
  }
  #else
  float starts[8];
  for (int i = 0; i < 8; i++) {
    starts[i] = 1e30;
    if (i >= u_waterCount) break;
    vec3 low = u_waterMin[i].xyz, high = u_waterMax[i].xyz;
    vec2 hit = vec2(0.0, limit);
    if (waterSlab(hit, eye.x, ray.x, low.x, high.x) && waterSlab(hit, eye.y, ray.y, low.y, high.y) &&
        waterSlab(hit, eye.z, ray.z, low.z, high.z)) starts[i] = hit.x;
  }
  for (int j = 0; j < 8; j++) {
    int body = -1;
    float first = 1e30;
    for (int i = 0; i < 8; i++) {
      if (i >= u_waterCount) break;
      if (starts[i] < first) { body = i; first = starts[i]; }
    }
    if (body < 0) break;
    starts[body] = 1e30;
    waterColumns(body, eye, ray, limit,
      #ifdef WATER_AIR_POCKETS
      air, airCount,
      #endif
      light, through, mark, caustic);
  }
  #endif
  return light + through * mix(color, vec3(0.93, 1.0, 0.86), caustic);
}
`,Sa=(e,t,i,a,r,n=!1)=>`#version 300 es
precision highp float;
${mo(e,t,i)}
uniform vec2 u_waterViewport;
uniform vec3 u_waterBackground;
${a?uu(n):""}
layout(location=0) out vec4 scene;
layout(location=1) out vec4 depth;
layout(location=2) out vec4 mask;
${r?"layout(location=3) out vec4 back; layout(location=4) out vec4 through;":""}
void main() {
  vec3 mark;
  vec3 source = ${a?"envBackdrop(gl_FragCoord.xy,u_waterViewport)":"u_waterBackground"};
  vec3 color = waterPaint(source,gl_FragCoord.xy,u_waterViewport,400.0,mark);
  ${a?"color = envMedia(color,gl_FragCoord.xy,u_waterViewport,u_envHorizon);":""}
  scene = vec4(color,1);
  depth = vec4(1, 0, 0, 1);
  mask = vec4(mark, 1);
  ${r?"back = scene; through = vec4(1);":""}
}`;function gi(e){let t=[];function i(n){let p=e["create"+n]();if(!p)throw new Error("Could not allocate WebGL "+n);return t.push(()=>e["delete"+n](p)),p}function a(){let n=i("Texture");return e.bindTexture(e.TEXTURE_2D,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),n}function r(n,p){let c=e.createProgram();if(!c)throw new Error("Could not allocate WebGL program");let m=[];try{for(let[z,T]of[[e.VERTEX_SHADER,n],[e.FRAGMENT_SHADER,p]]){let b=e.createShader(z);if(!b)throw new Error("Could not allocate WebGL shader");if(m.push(b),e.shaderSource(b,T),e.compileShader(b),!e.getShaderParameter(b,e.COMPILE_STATUS))throw new Error("Ink Studio shader compilation failed: "+e.getShaderInfoLog(b));e.attachShader(c,b)}if(e.linkProgram(c),!e.getProgramParameter(c,e.LINK_STATUS))throw new Error("Ink Studio program linking failed: "+e.getProgramInfoLog(c));let u=Object.create(null),A=Object.create(null),j={[e.FLOAT]:"uniform1f",[e.INT]:"uniform1i",[e.SAMPLER_2D]:"uniform1i",[e.SAMPLER_3D]:"uniform1i",[e.SAMPLER_2D_ARRAY]:"uniform1i",[e.INT_SAMPLER_2D]:"uniform1i",[e.UNSIGNED_INT_SAMPLER_2D]:"uniform1i",[e.FLOAT_VEC2]:"uniform2fv",[e.FLOAT_VEC3]:"uniform3fv",[e.FLOAT_VEC4]:"uniform4fv",[e.BOOL]:"uniform1i",[e.BOOL_VEC2]:"uniform2iv",[e.BOOL_VEC3]:"uniform3iv",[e.BOOL_VEC4]:"uniform4iv",[e.INT_VEC2]:"uniform2iv",[e.INT_VEC3]:"uniform3iv",[e.INT_VEC4]:"uniform4iv",[e.UNSIGNED_INT]:"uniform1ui",[e.UNSIGNED_INT_VEC2]:"uniform2uiv",[e.UNSIGNED_INT_VEC3]:"uniform3uiv",[e.UNSIGNED_INT_VEC4]:"uniform4uiv",[e.FLOAT_MAT2]:"uniformMatrix2fv",[e.FLOAT_MAT3]:"uniformMatrix3fv",[e.FLOAT_MAT4]:"uniformMatrix4fv",[e.FLOAT_MAT2x3]:"uniformMatrix2x3fv",[e.FLOAT_MAT2x4]:"uniformMatrix2x4fv",[e.FLOAT_MAT3x2]:"uniformMatrix3x2fv",[e.FLOAT_MAT3x4]:"uniformMatrix3x4fv",[e.FLOAT_MAT4x2]:"uniformMatrix4x2fv",[e.FLOAT_MAT4x3]:"uniformMatrix4x3fv"};for(let z=0,T=e.getProgramParameter(c,e.ACTIVE_UNIFORMS);z<T;z++){let b=e.getActiveUniform(c,z),v=b.name.replace(/\[0\]$/,""),w=u[v]=e.getUniformLocation(c,v),F=j[b.type];b.size>1&&["uniform1f","uniform1i","uniform1ui"].includes(F)&&(F+="v"),F!=null&&F.startsWith("uniformMatrix")?A[v]=l=>e[F](w,!1,l):F&&(A[v]=l=>e[F](w,l))}return t.push(()=>e.deleteProgram(c)),{p:c,u,set(z){var T;for(let b of Object.keys(z))(T=A[b])==null||T.call(A,z[b])}}}catch(u){throw e.deleteProgram(c),u}finally{for(let u of m)e.deleteShader(u)}}return{allocate:i,texture:a,program:r,dispose(){for(let n of t.splice(0).reverse())n()}}}function zo(e,{updatesSince:t,geometryUpdatesSince:i,cutaway:a}={}){let r=gi(e);try{let p=function(P,W,R,U){let J=[P==null?void 0:P.airPockets,P==null?void 0:P.layered,P==null?void 0:P.atlas,!!P,!!W,!!R,!!(U!=null&&U.media),!!(U!=null&&U.lit)].join("/");if(n.has(J))return n.get(J);let ie=r.program(`#version 300 es
precision highp float;
layout(location=0) in vec3 a_point;
layout(location=1) in vec2 a_texel;
uniform mat4 u_view,u_proj;
out vec2 v_texel;
out vec3 v_world;
${R?"layout(location=2)in vec2 a_light;out vec2 v_light;":""}
out float v_depth;
out vec3 v_camera;
void main(){
  vec4 p=u_view*vec4(a_point,1.0);
  ${R?"v_light=a_light;":""}
  v_texel=a_texel;v_world=a_point;v_depth=-p.z;v_camera=p.xyz;
  gl_Position=u_proj*p;
}`,`#version 300 es
precision highp float;
uniform sampler2D u_atlas;
uniform vec4 u_range,u_splatPlane;
${P?mo(P.airPockets,P.layered,P.atlas):"uniform vec4 u_arrivalPlane;"}
uniform vec2 u_surfaceViewport;
uniform vec3 u_fog;
uniform bool u_index, u_graphDepth;
${W?a:""}
${U!=null&&U.media?Li(U.lit):""}
${R?So:""}
${R?"uniform highp sampler2DArray u_surfaceLit;uniform int u_surfaceLightCount;in vec2 v_light;":""}
in vec2 v_texel;
in vec3 v_world;
in float v_depth;
in vec3 v_camera;
layout(location=0) out vec4 color;
layout(location=1) out vec4 depth;
layout(location=2) out vec4 water;
void main(){
  vec4 ink=texelFetch(u_atlas,ivec2(v_texel),0);
  if(ink.a<.5||dot(u_arrivalPlane,vec4(v_world,1.0))<0.0||dot(u_splatPlane,vec4(v_camera,1.0))<0.0)discard;
  ${W?"float margin=sectionMargin(v_world,v_depth); if(margin<0.0)discard;":""}
  float d=clamp((v_depth-u_range.x)/(u_range.y-u_range.x),0.0,1.0);
  float fog=u_range.z<1.0?smoothstep(u_range.z,1.0,d)*u_range.w:0.0;
  vec3 mark=vec3(0.0), rgb=ink.rgb;
  ${R?"if(!u_index){vec3 irradiance=vec3(0);for(int i=0;i<32;i++){if(i>=u_surfaceLightCount)break;irradiance+=texelFetch(u_surfaceLit,ivec3(ivec2(v_light),i),0).rgb;}rgb=eSRGB(min(vec3(1),eLinear(rgb)*(vec3(1)+irradiance)));}":""}
  ${P?"if(!u_index)rgb=waterPaint(rgb,gl_FragCoord.xy,u_surfaceViewport,v_depth,mark);":""}
  ${U!=null&&U.media?"if(!u_index)rgb=envMedia(rgb,gl_FragCoord.xy,u_surfaceViewport,v_depth);":""}
  rgb=mix(rgb,u_fog,fog);
  ${W?"rgb=mix(rgb,u_sectionEdge.rgb,sectionInk(margin));":""}
  color=u_index?vec4(0.0):vec4(rgb,1.0);
  depth=vec4(d,0.0,0.0,1.0);water=vec4(mark,1.0);
  if(u_index&&u_graphDepth){float z=round(d*16777215.0);water=vec4(mod(z,256.0),mod(floor(z/256.0),256.0),floor(z/65536.0),255.0)/255.0;}
}`);return n.set(J,ie),ie},_=function(P){var J,ie;if(l.textureBytes=0,l.geometryBytes=0,w)throw new Error("Surface pipeline has been disposed");let W=(J=P==null?void 0:P.revision)!=null?J:0,R=(ie=P==null?void 0:P.geometryRevision)!=null?ie:0;if(A===P&&z===W&&T===R&&j===P.vertices&&b===P.width&&v===P.height)return;if(!P||!(P.vertices instanceof Float32Array)||P.vertices.length%15||!Number.isSafeInteger(P.width)||P.width<1||!Number.isSafeInteger(P.height)||P.height<1||!(P.pixels instanceof Uint8Array)||P.pixels.length!==P.width*P.height*4||!Number.isSafeInteger(W)||W<0||!Number.isSafeInteger(R)||R<0)throw new RangeError("Invalid sprite surface atlas");if(Math.max(P.width,P.height)>e.getParameter(e.MAX_TEXTURE_SIZE))throw new RangeError("Surface atlas exceeds GPU size limit");let U=A!==P||b!==P.width||v!==P.height;if(U||j!==P.vertices){if(!P.vertices.every(Number.isFinite))throw new RangeError("Invalid sprite surface geometry");e.bindBuffer(e.ARRAY_BUFFER,m),e.bufferData(e.ARRAY_BUFFER,P.vertices,R?e.DYNAMIC_DRAW:e.STATIC_DRAW),l.geometryBytes=P.vertices.byteLength}if(!U&&j===P.vertices&&T!==R){let N=i==null?void 0:i(P,T),K=N!=null&&N.length?Math.min(...N.map(ve=>ve.first)):0,Z=N!=null&&N.length?Math.max(...N.map(ve=>ve.first+ve.count)):P.vertices.length/5,ye=P.vertices.subarray(K*5,Z*5);if(!ye.every(Number.isFinite))throw new RangeError("Invalid sprite surface geometry");e.bindBuffer(e.ARRAY_BUFFER,m),e.bufferSubData(e.ARRAY_BUFFER,K*20,ye),l.geometryBytes=ye.byteLength}if(e.activeTexture(e.TEXTURE0+6),e.bindTexture(e.TEXTURE_2D,u),U)e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,P.width,P.height,0,e.RGBA,e.UNSIGNED_BYTE,P.pixels),l.textureBytes=P.pixels.byteLength;else if(z!==W){let N=t==null?void 0:t(P,z),K=0,Z=0,ye=P.width,ve=P.height;N!=null&&N.length&&(K=Math.min(...N.map(me=>me.x)),Z=Math.min(...N.map(me=>me.y)),ye=Math.max(...N.map(me=>me.x+me.width))-K,ve=Math.max(...N.map(me=>me.y+me.height))-Z);let ze=ye*ve*4;F.length<ze&&(F=new Uint8Array(ze));for(let me=0;me<ve;me++)F.set(P.pixels.subarray(((Z+me)*P.width+K)*4,((Z+me)*P.width+K+ye)*4),me*ye*4);e.texSubImage2D(e.TEXTURE_2D,0,K,Z,ye,ve,e.RGBA,e.UNSIGNED_BYTE,F.subarray(0,ze)),l.textureBytes=ze}A=P,j=P.vertices,z=W,T=R,b=P.width,v=P.height},S=function(P,W,R){var me,Fe,Le;let U=(me=W.frame.emitterSurfaceResolution)!=null?me:16;if(!Number.isSafeInteger(U)||U<4||U>64)throw new RangeError("Surface light resolution must be 4..64");let J=Math.min(64,Math.floor(e.getParameter(e.MAX_TEXTURE_SIZE)/U));if(s!==P.vertices||d!==((Fe=P.geometryRevision)!=null?Fe:0)||O!==U){O=U,B=P.vertices.length/15,k=new Float32Array(B*9);let te=new Float32Array(B*6);for(let H=0;H<B;H++){let g=H%J*U,M=Math.floor(H/J)*U;for(let G=0;G<3;G++)k.set(P.vertices.subarray(H*15+G*5,H*15+G*5+3),H*9+G*3),te.set([g+.5+(G===1?U-1:0),M+.5+(G===2?U-1:0)],H*6+G*2)}e.bindBuffer(e.ARRAY_BUFFER,Y),e.bufferData(e.ARRAY_BUFFER,k,e.DYNAMIC_DRAW),e.bindBuffer(e.ARRAY_BUFFER,f),e.bufferData(e.ARRAY_BUFFER,te,e.DYNAMIC_DRAW),s=P.vertices,d=(Le=P.geometryRevision)!=null?Le:0}let ie=[0,1,2].map(te=>-(R[te*4]*R[12]+R[te*4+1]*R[13]+R[te*4+2]*R[14])),N=0;for(let te=0;te<k.length;te+=9){let H=k.subarray(te,te+3),g=[0,1,2].map(X=>k[te+3+X]-H[X]),M=[0,1,2].map(X=>k[te+6+X]-H[X]),G=[g[1]*M[2]-g[2]*M[1],g[2]*M[0]-g[0]*M[2],g[0]*M[1]-g[1]*M[0]];N=Math.imul(N,31)+(G.reduce((X,ae,Q)=>X+ae*(ie[Q]-H[Q]),0)<0?1:0)|0}let K=[s,d,W.shadow,U],Z=(te,H)=>(te==null?void 0:te.length)===H.length&&H.every((g,M)=>g===te[M]);if(Z(E,K)&&Z(o,W.rows)&&N===h){e.activeTexture(e.TEXTURE0+24),e.bindTexture(e.TEXTURE_2D_ARRAY,$);return}let ye=!Z(E,K)||N!==h,ve=o;if(E=K,o=W.rows.slice(),h=N,!$){$=r.allocate("Texture"),e.activeTexture(e.TEXTURE0+24),e.bindTexture(e.TEXTURE_2D_ARRAY,$);for(let te of[e.TEXTURE_MIN_FILTER,e.TEXTURE_MAG_FILTER])e.texParameteri(e.TEXTURE_2D_ARRAY,te,e.NEAREST);for(let te of[e.TEXTURE_WRAP_S,e.TEXTURE_WRAP_T])e.texParameteri(e.TEXTURE_2D_ARRAY,te,e.CLAMP_TO_EDGE)}I!=null||(I=r.allocate("Framebuffer")),e.activeTexture(e.TEXTURE0+24),e.bindTexture(e.TEXTURE_2D_ARRAY,$);let ze=[J*U,Math.max(1,Math.ceil(B/J))*U];if(ze[1]>e.getParameter(e.MAX_TEXTURE_SIZE))throw new RangeError("Surface lighting charts exceed the GPU atlas budget");if(y[0]!==ze[0]||y[1]!==ze[1]||y[2]!==W.count){if(ze[0]*ze[1]*W.count>16777216)throw new RangeError("Surface lighting cache exceeds its texel budget");e.texImage3D(e.TEXTURE_2D_ARRAY,0,e.RGBA16F,...ze,Math.max(1,W.count),0,e.RGBA,e.FLOAT,null),y=[...ze,W.count],ye=!0}if(e.bindFramebuffer(e.FRAMEBUFFER,I),e.framebufferTextureLayer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,$,0,0),e.drawBuffers([e.COLOR_ATTACHMENT0]),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)throw new Error("Surface lightmap target is incomplete");C!=null||(C=r.program(`#version 300 es
precision highp float;layout(location=0)in vec3 a_a;layout(location=1)in vec3 a_b;layout(location=2)in vec3 a_c;uniform vec2 u_lightSize;uniform float u_lightResolution;uniform int u_lightColumns;uniform vec3 u_surfaceEye;out vec3 v_world;flat out vec3 v_normal;void main(){vec2 q=vec2(gl_VertexID&1,gl_VertexID>>1);vec2 uv=(q*u_lightResolution-.5)/(u_lightResolution-1.0);v_world=a_a+(a_b-a_a)*uv.x+(a_c-a_a)*uv.y;v_normal=normalize(cross(a_b-a_a,a_c-a_a));if(dot(v_normal,u_surfaceEye-a_a)<0.0)v_normal=-v_normal;vec2 tile=vec2(gl_InstanceID%u_lightColumns,gl_InstanceID/u_lightColumns)*u_lightResolution;gl_Position=vec4((tile+q*u_lightResolution)/u_lightSize*2.0-1.0,0,1);}`,`#version 300 es
precision highp float;${So}
in vec3 v_world;flat in vec3 v_normal;out vec4 color;void main(){color=vec4(eLighting(v_world,v_normal,false,vec3(0)),1);}`)),e.disable(e.BLEND),e.disable(e.DEPTH_TEST),e.viewport(0,0,y[0],y[1]),e.useProgram(C.p),C.set({...W.uniforms,u_lightSize:y.slice(0,2),u_lightColumns:J,u_lightResolution:U,u_surfaceEye:ie}),e.bindVertexArray(V);for(let te=0;te<W.count;te++)!ye&&Z(ve==null?void 0:ve.subarray(te*44,te*44+44),W.rows.subarray(te*44,te*44+44))||(e.framebufferTextureLayer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,$,0,te),e.clearBufferfv(e.COLOR,0,[0,0,0,0]),C.set({u_ePick:te+1}),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,B))},q=function(P,{lighting:W,environment:R,view:U,projection:J,range:ie,fog:N,index:K=!1,graphDepth:Z=!1,arrivalPlane:ye=[0,0,0,0],clip:ve=[0,0,0,0],water:ze,wet:me,width:Fe=1,height:Le=1,section:te}){var g;if(_(P),W!=null&&W.active&&!K){let M=e.getParameter(e.DRAW_FRAMEBUFFER_BINDING),G=e.getParameter(e.VIEWPORT),X=e.isEnabled(e.BLEND),ae=e.isEnabled(e.DEPTH_TEST);S(P,W,U),e.bindFramebuffer(e.FRAMEBUFFER,M),e.viewport(...G),X?e.enable(e.BLEND):e.disable(e.BLEND),ae?e.enable(e.DEPTH_TEST):e.disable(e.DEPTH_TEST)}e.activeTexture(e.TEXTURE0+6),e.bindTexture(e.TEXTURE_2D,u);let H=p(me,te,!K&&(W==null?void 0:W.active),R);e.useProgram(H.p),H.set({u_view:U,u_proj:J,u_range:ie,u_fog:N,u_atlas:6,u_surfaceLightCount:(g=W==null?void 0:W.count)!=null?g:0,u_surfaceLit:24,u_index:+K,u_graphDepth:Z,u_arrivalPlane:ye,u_splatPlane:ve,u_surfaceViewport:[Fe,Le],...ze,...te,...R==null?void 0:R.uniforms,...W==null?void 0:W.uniforms}),e.bindVertexArray(c),!K&&(W!=null&&W.active)?e.enableVertexAttribArray(2):e.disableVertexAttribArray(2),e.drawArrays(e.TRIANGLES,0,A.vertices.length/5),e.activeTexture(e.TEXTURE0)},n=new Map,c=r.allocate("VertexArray"),m=r.allocate("Buffer"),u=r.texture();e.bindVertexArray(c),e.bindBuffer(e.ARRAY_BUFFER,m),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,3,e.FLOAT,!1,20,0),e.enableVertexAttribArray(1),e.vertexAttribPointer(1,2,e.FLOAT,!1,20,12),e.bindVertexArray(null);let A,j,z=-1,T=-1,b=0,v=0,w=!1,F=new Uint8Array(0),l={textureBytes:0,geometryBytes:0},C,$,I,y=[],E,o,h,s,d,k,B,O,V=r.allocate("VertexArray"),Y=r.allocate("Buffer"),f=r.allocate("Buffer");e.bindVertexArray(c),e.bindBuffer(e.ARRAY_BUFFER,f),e.enableVertexAttribArray(2),e.vertexAttribPointer(2,2,e.FLOAT,!1,8,0),e.bindVertexArray(V),e.bindBuffer(e.ARRAY_BUFFER,Y);for(let P=0;P<3;P++)e.enableVertexAttribArray(P),e.vertexAttribPointer(P,3,e.FLOAT,!1,36,P*12),e.vertexAttribDivisor(P,1);return e.bindVertexArray(null),{draw:q,get stats(){return{...l}},dispose(){w||(w=!0,r.dispose())}}}catch(n){throw r.dispose(),n}}function Nr(e,t){let i=(n,p)=>{e.activeTexture(e.TEXTURE0+n),e.bindTexture(e.TEXTURE_2D,p)};function a(n=1,{integer:p=!1,depth:c=!1}={}){let m=t.allocate("Framebuffer"),u=Array.from({length:n},()=>t.texture()),A=c?t.allocate("Renderbuffer"):null;e.bindFramebuffer(e.FRAMEBUFFER,m);let j=u.map((b,v)=>{let w=e.COLOR_ATTACHMENT0+v;return e.framebufferTexture2D(e.FRAMEBUFFER,w,e.TEXTURE_2D,b,0),w});e.drawBuffers(j),A&&(e.bindRenderbuffer(e.RENDERBUFFER,A),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,A)),e.bindFramebuffer(e.FRAMEBUFFER,null);let z=0,T=0;return{framebuffer:m,textures:u,get width(){return z},get height(){return T},ensureDepth(){A||(A=t.allocate("Renderbuffer"),e.bindRenderbuffer(e.RENDERBUFFER,A),z&&T&&e.renderbufferStorage(e.RENDERBUFFER,e.DEPTH_COMPONENT16,z,T),e.bindFramebuffer(e.FRAMEBUFFER,m),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.RENDERBUFFER,A))},resize(b,v){if(!(z===b&&T===v)){for(let w of u)i(0,w),p?e.texImage2D(e.TEXTURE_2D,0,e.RGBA32I,b,v,0,e.RGBA_INTEGER,e.INT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,b,v,0,e.RGBA,e.UNSIGNED_BYTE,null);if(A&&(e.bindRenderbuffer(e.RENDERBUFFER,A),e.renderbufferStorage(e.RENDERBUFFER,e.DEPTH_COMPONENT16,b,v)),e.bindFramebuffer(e.FRAMEBUFFER,m),e.checkFramebufferStatus(e.FRAMEBUFFER)!==e.FRAMEBUFFER_COMPLETE)throw new Error("Ink Studio could not build a complete WebGL render target");z=b,T=v}}}}function r(n,p,c){let m=t.texture(),u=n*4,A=new Float32Array(u),j=0;function z(T,b=T.length,v){let w=Math.max(1,Math.ceil(b/u));if(w>c)throw new RangeError("Ink Studio data exceeds the WebGL texture size limit");i(p,m),w!==j&&(e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,n,w,0,e.RGBA,e.FLOAT,null),j=w,v=void 0);let F=Math.floor(b/u);if(v!==void 0){for(let l of v){let _=l*u;l<F?e.texSubImage2D(e.TEXTURE_2D,0,0,l,n,1,e.RGBA,e.FLOAT,T,_):(A.fill(0),A.set(T.subarray(_,b)),e.texSubImage2D(e.TEXTURE_2D,0,0,l,n,1,e.RGBA,e.FLOAT,A))}return}F&&e.texSubImage2D(e.TEXTURE_2D,0,0,0,n,F,e.RGBA,e.FLOAT,T),F<w&&(A.fill(0),A.set(T.subarray(F*u,b)),e.texSubImage2D(e.TEXTURE_2D,0,0,F,n,1,e.RGBA,e.FLOAT,A))}return{bind:(T=p)=>i(T,m),upload:z}}return{target:a,table:r,textureUnit:i}}var Bf=`
float contributionAlpha(float power, float density, bool solid) {
  if (power > 0.0 || power < -4.5) return 0.0;
  float g = density * exp(power);
  return solid ? 0.99 * smoothstep(0.38, 0.62, g) : min(0.99, g);
}`,fu=e=>{var t;return(t=e==null?void 0:e.glsl)!=null?t:Bf},qr=`
uniform highp sampler2D u_constraintSlots, u_constraintRows;
uniform int u_constraintDefault, u_constraintMap, u_constraintLab, u_constraintPairs;
int contributionSlot(int index) {
  int span = textureSize(u_constraintSlots, 0).x * 4;
  int slot = int(texelFetch(u_constraintSlots, ivec2((index % span) / 4, index / span), 0)[index & 3]);
  return slot > 0 ? slot : u_constraintDefault;
}
`,jr=`
uniform int u_constraintMask;
vec4 maskSettings(int slot) { return texelFetch(u_constraintRows, ivec2(u_constraintMask, slot - 1), 0); }
`,Ra=e=>`
flat LOOK_IO vec4 v_maskCenter;
flat LOOK_IO vec3 v_maskNormal;
flat LOOK_IO vec3 v_maskAxis;
${e?"flat LOOK_IO vec4 v_maskSecond;":""}
`,du=e=>`
uniform vec2 u_lookViewport;
uniform mat4 u_lookProjection;
uniform float u_lookOrtho, u_lookRadius;
${e?"uniform highp sampler2D u_maskTextures; uniform float u_maskTime;":""}
float maskAt(int slot) {
  vec4 settings = maskSettings(slot);
  if (settings.x == 0.0) return 1.0;
  vec2 screen = (gl_FragCoord.xy * 2.0 / u_lookViewport - 1.0) /
    vec2(u_lookProjection[0][0], u_lookProjection[1][1]);
  vec3 center = v_maskCenter.xyz;
  vec3 ray = vec3(u_lookOrtho > 0.5 ? vec2(0.0) : screen, -1.0);
  vec3 at = vec3(screen * (u_lookOrtho > 0.5 ? 1.0 : -center.z), center.z);
  float facing = dot(v_maskNormal, ray);
  vec3 offset = vec3(0.0);
  if (abs(facing) > 1e-7) {
    float advance = dot(v_maskNormal, center - at) / facing;
    if (abs(advance) <= u_lookRadius && -center.z + advance > 0.0)
      offset = at + advance * ray - center;
  }
  vec4 limits = texelFetch(u_constraintRows, ivec2(u_constraintMask + 2, slot - 1), 0);
  float scalar = v_maskCenter.w + dot(v_maskAxis, offset);
  ${e?`if (settings.x == 2.0) {
    vec2 uv = vec2(scalar,v_maskSecond.w + dot(v_maskSecond.xyz,offset));
    if (limits.w == 0.0 && (any(lessThan(uv,vec2(0))) || any(greaterThanEqual(uv,vec2(1))))) scalar=0.0;
    else {
      vec4 dim=texelFetch(u_constraintRows,ivec2(u_constraintMask+4,slot-1),0);
      bool repeat=texelFetch(u_constraintRows,ivec2(u_constraintMask+5,slot-1),0).x > 0.0;
      int frame=int(max(0.0,floor(u_maskTime*dim.w)));
      frame=repeat ? frame%int(dim.z) : min(frame,int(dim.z)-1);
      ivec2 pixel=ivec2(floor(fract(uv)*dim.xy));
      int at=int(limits.z)+(frame*int(dim.y)+pixel.y)*int(dim.x)+pixel.x;
      int width=textureSize(u_maskTextures,0).x;
      scalar=texelFetch(u_maskTextures,ivec2(at%width,at/width),0).r;
    }
  }`:""}
  float f = clamp((scalar - limits.x) * limits.y, 0.0, 1.0);
  if (settings.z == 1.0) f = f * f * (3.0 - 2.0 * f);
  if (settings.z == 2.0) f = step(1.0, f);
  return settings.w > 0.0 ? 1.0 - f : f;
}
`,pu=e=>`
uniform highp sampler2D u_lookSites;
void placeMask(int index, int slot, vec3 posed, vec3 viewCenter, mat3 worldToRest, mat3 view) {
  v_maskCenter = vec4(viewCenter, 0.0);
  v_maskNormal = vec3(0.0);
  v_maskAxis = vec3(0.0);
  ${e?"v_maskSecond = vec4(0.0);":""}
  if (slot == 0) return;
  vec4 settings = maskSettings(slot);
  if (settings.x == 0.0) return;
  ivec2 uv = ivec2((index & 511) * 2, index >> 9);
  vec3 normal = texelFetch(u_lookSites, uv, 0).xyz;
  vec3 rest = texelFetch(u_lookSites, uv + ivec2(1,0), 0).xyz;
  vec4 axis = texelFetch(u_constraintRows, ivec2(u_constraintMask + 1, slot - 1), 0);
  v_maskNormal = view * transpose(worldToRest) * normal;
  v_maskAxis = view * (settings.y > 0.0 ? transpose(worldToRest) * axis.xyz : axis.xyz);
  vec3 point=settings.y > 0.0 ? rest : posed;
  v_maskCenter.w = dot(point, axis.xyz) + axis.w;
  ${e?`if (settings.x == 2.0) {
    vec4 second=texelFetch(u_constraintRows,ivec2(u_constraintMask+3,slot-1),0);
    v_maskSecond=vec4(view*(settings.y > 0.0 ? transpose(worldToRest)*second.xyz : second.xyz),dot(point,second.xyz)+second.w);
  }`:""}
}
`,hu=`
    float m = floor(maskAt(v_policySlot) * 65535.0 + 0.5);
    od = vec4(mod(m,256.0), floor(m/256.0), 0.0, 255.0) / 255.0;
`;var mu=`
vec3 axialPosition(vec2 pixel, float axial, vec2 size) {
  vec2 screen = (pixel * 2.0 / size - 1.0) / vec2(u_proj[0][0], u_proj[1][1]);
  return vec3(screen * (u_ortho > 0.5 ? 1.0 : axial), -axial);
}`,vu=`
float pixelStyleThreshold(int mode, ivec2 p) {
  const float ordered[16] = float[16](0.0,8.0,2.0,10.0,12.0,4.0,14.0,6.0,3.0,11.0,1.0,9.0,15.0,7.0,13.0,5.0);
  if (mode == 1) return (ordered[(p.x & 3) + ((p.y & 3) << 2)] + 0.5) / 16.0;
  if (mode == 2) return ((p.x + p.y) & 1) != 0 ? 0.75 : 0.25;
  return (float((p.x + p.y) & 3) + 0.5) / 4.0;
}
`,za=`
uniform highp sampler2D u_relight;
vec4 relightAt(int row) { return texelFetch(u_relight, ivec2(row & 511, row >> 9), 0); }
`;function ir(e,t,{water:i=!1,airPockets:a=!1,layered:r=!1,atlas:n=!1,portal:p=!1,instances:c=!1,contributions:m=!1,masked:u=!1,textured:A=!1,layeredGlass:j=!1,coverageRules:z,materialStyles:T=!1,environment:b=!1,emitterFog:v=!1,relighting:w=!1,optical:F=!1,stableDetail:l,cutaway:_,airflow:C}={}){var B,O,V,Y,f,S,q,P;let $=(B=z==null?void 0:z.coverageStride)!=null?B:4,I=(O=z==null?void 0:z.continuousCoverage)!=null?O:1,y=(V=z==null?void 0:z.softCoverage)!=null?V:2,E=(Y=z==null?void 0:z.nonSurface)!=null?Y:2559,o=(f=z==null?void 0:z.continuousVariance)!=null?f:.25,h=(S=z==null?void 0:z.continuousLow)!=null?S:.16,s=(q=z==null?void 0:z.continuousHigh)!=null?q:.3,d=`#version 300 es
precision highp float; precision highp int;
uniform highp sampler2D u_data;
uniform mat4 u_view, u_proj;
uniform bool u_geometryDepth;
uniform vec2 u_viewport;
uniform float u_focal, u_time, u_scale, u_snap, u_dilate, u_near, u_ortho, u_idx;
uniform bool u_motionCadence, u_motionWind;
uniform vec4 u_effectTimes, u_effectWind;
uniform vec2 u_waterAndRainTime, u_rainWind; uniform float u_emissiveWind;
${(P=C==null?void 0:C.glsl)!=null?P:""}
uniform float u_paintMarker; uniform int u_afterimageStart; flat out int v_paint;
uniform int u_splatCoverage; uniform float u_materialGridScale; flat out int v_coverage;
${l?`uniform vec2 u_detailTexture, u_detailGeometry;
flat out float v_detailGeometry, v_detailTexture;
${l.glsl}`:""}
${w?za+"flat out vec4 v_relight;":""}
${j?"uniform float u_glassTolerance; flat out float v_glassNearDepth;":""}
${F?`uniform highp sampler2D u_optical;
flat out vec4 v_optical;
flat out vec3 v_scatterTint, v_reflectTint;
flat out float v_opticalFog;`:""}
uniform vec4 u_actor; uniform float u_reveal, u_fade; uniform vec3 u_camdir; uniform ivec2 u_dyn;
uniform vec4 u_rev, u_rbox;   // the lit part of the world: centre x, z, sin and cos of the view's turn; then near, far, near half-width, far half-width
uniform vec4 u_sh[16]; uniform int u_shn;
uniform vec4 u_wc[4]; uniform vec4 u_wd[4];   // where a blow is about to land: painted on the ground itself (a disc that fills, or a lane), so grass cannot hide it
uniform vec4 u_hitf[4]; uniform vec3 u_fl[8];   // places just struck (a ball each), and bodies just hurt (a run of splats each): both go white for an instant
uniform highp sampler2D u_eco; uniform highp sampler2D u_bones; uniform float u_ecoOn;   // what the ground remembers, a texel to each unit of it: burnt, burning, frozen, and how high the ground is there   // round shadows: x, z, ground height, radius
uniform vec2 u_season;   // how far autumn, and how far winter, has come
${t?`uniform float u_sampleWithdrawal;
`+t.glsl:""}
uniform vec4 u_born;   // growth you can watch: when the diorama was shown, how fast its clock runs, how long a dab takes to grow, and the loop (0: once)
uniform vec2 u_cut;       // how wide a view is cleared between you and the eye, and how low it reaches
uniform float u_wl, u_slice; uniform vec2 u_lid; uniform vec4 u_pit; uniform vec4 u_portal; uniform vec2 u_pdoor; uniform vec3 u_eye;   // a doorway standing square to z (centre x, sill y, z, and which side of it this place is on), its half-width and height, and where the eye is
uniform vec3 u_fog;
uniform vec4 u_arrivalPlane;
uniform vec4 u_fogp;   // haze start, haze max, depth range near, depth range far
layout(location=0) in vec2 a_corner;
layout(location=1) in int a_index;
${c?"layout(location=2) in int a_instance; uniform highp sampler2D u_instances;":""}
out vec2 v_d; out vec3 v_conic; out vec4 v_color; out float v_depth;
${p?"flat out vec3 v_portalDepth;":"flat out float v_ownerDepth;"}
${_?"flat out vec4 v_sectionSample;":""}
out float v_gl; out float v_as; out float v_ast; uniform vec4 u_az[4]; uniform int u_azn; uniform float u_asoft, u_azst;
${i&&!p?"flat out float v_waterAxial;":""}
${b?"flat out float v_envAxial;":""}
${e?e.vsDecl:""}// Inked detail (an option, off unless asked for): a dab may carry a 4 by 4 picture of the surface under it. Its two half-axes are
// carried to the screen here and turned inside out, so each pixel can find where on the surface it is looking.
uniform highp sampler2D u_fine; uniform float u_fineOn;
// Carried lights (the game's lantern, things on fire): where each is and how far it reaches, how strong, the palette, and for each palette
// colour the next lighter one of its own family. What is near a light steps up its own colours; nothing is tinted.
uniform vec4 u_lamp[8]; uniform float u_lamps[8]; uniform int u_lampN; uniform float u_lampGain; uniform vec3 u_lpal[48]; uniform int u_lup[48];
flat out vec4 v_fm; flat out vec4 v_ft; flat out float v_fk; flat out float v_lit; flat out float v_ix;
${m||u?`${qr}flat out int v_policySlot;`:""}
${u?jr+Ra(A).replaceAll("LOOK_IO","out")+pu(A):""}
${T?"uniform highp sampler2D u_materialStyles; uniform bool u_materialPatterned, u_materialStylesOn; flat out vec4 v_pixelStyle; flat out float v_pixelFog;":""}
void main(){
  int record = a_index;
  ${c?`ivec2 inst = ivec2((a_instance & 15) * 16, a_instance >> 4);
  vec4 meta;
  if (a_instance != 0) {
    meta = texelFetch(u_instances, inst + ivec2(3, 0), 0);
    record += int(meta.x);
  }`:""}
  int row = record >> 9, col = (record & 511) << 2; v_ix = float(a_index);
  vec4 t0 = texelFetch(u_data, ivec2(col, row), 0);
  vec4 t1 = texelFetch(u_data, ivec2(col + 1, row), 0);
  vec4 t2 = texelFetch(u_data, ivec2(col + 2, row), 0);
  vec4 t3 = ${c?"a_instance != 0 ? vec4(0.0) : ":""}texelFetch(u_data, ivec2(col + 3, row), 0);
  v_paint = (u_paintMarker != 0.0 && t3.z == u_paintMarker ||
    u_afterimageStart > 0 && a_index >= u_afterimageStart) ? 1 : 0;
  ${T?"v_pixelStyle = texelFetch(u_materialStyles, ivec2(record & 511, row), 0);":""}
  vec3 pos = t0.xyz; float alpha = t0.w;
  if (alpha <= 0.0 || pos.y < -30.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }   // (what is put away is put far below: it is not drawn from there)
  mat3 cov = mat3(t1.x, t1.y, t1.z,  t1.y, t2.x, t2.y,  t1.z, t2.y, t2.z);
  ${c?`if (a_instance != 0) {
    int options = int(meta.w);
    if ((options & 2) != 0) {
      vec4 cut = texelFetch(u_instances, inst + ivec2(4, 0), 0);
      vec3 delta = pos - cut.xyz;
      if (dot(delta, delta) <= cut.w) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    }
    if ((options & 1) != 0) {
      vec4 axis = texelFetch(u_instances, inst + ivec2(13, 0), 0);
      pos = pos * axis.w + axis.xyz;
      cov *= axis.w * axis.w;
    } else {
      vec4 a = texelFetch(u_instances, inst, 0);
      vec4 b = texelFetch(u_instances, inst + ivec2(1, 0), 0);
      vec4 c = texelFetch(u_instances, inst + ivec2(2, 0), 0);
      mat3 transform = transpose(mat3(a.xyz, b.xyz, c.xyz));
      pos = transform * pos + vec3(a.w, b.w, c.w);
      cov = transform * cov * transpose(transform);
    }
    if (pos.y < -30.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    alpha *= meta.z;
    ${T?"float originalShade = t1.w; vec2 originalRamp = v_pixelStyle.zw;":""}
    if (meta.y > 0.0) for (int i = 0; i < 16; i++) {
      if (i >= int(meta.y)) break;
      vec4 pair = texelFetch(u_instances, inst + ivec2(5 + i / 2, 0), 0);
      vec2 swap = i % 2 == 0 ? pair.xy : pair.zw;
      ${T?`
      if (originalShade == swap.x) t1.w = swap.y;
      if (originalRamp.x == swap.x) v_pixelStyle.z = swap.y;
      if (originalRamp.y == swap.x) v_pixelStyle.w = swap.y;`:"if (t1.w == swap.x) { t1.w = swap.y; break; }"}
    }
  }`:""}
  vec3 color = vec3(mod(t1.w, 256.0), mod(floor(t1.w / 256.0), 256.0), floor(t1.w / 65536.0)) / 255.0;
  vec3 color0 = color; mat3 FM = mat3(1.0); v_fk = -1.0; v_lit = 0.0; v_fm = vec4(0.0); v_ft = vec4(0.0);
  int kraw = int(t2.w), flags = kraw / 16, kind = kraw - flags * 16;
  ${t?"if (!sampleCoverageVisible(kraw, u_sampleWithdrawal)) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }":""}
  float ph = t3.x, sp = t3.y, rg = t3.z, ex = t3.w, sc = u_scale;
  bool snap = false, stat = a_index < u_dyn.x || a_index >= u_dyn.y, pv = (flags & 8) != 0, green = (flags & 2) == 0 && color.g - max(color.r, color.b) > 0.06, veg = green || (flags & 6) == 0 && color.b - color.g > 0.15 && color.r - color.g > 0.08, fire = false;   // what grows: green things, and the purple grass
  if (u_ecoOn > 0.5 && stat && !pv && abs(t0.x) < 80.0 && t0.z > -208.0 && t0.z < 80.0) {
    vec4 eco = texelFetch(u_eco, ivec2(clamp(floor(t0.xz) + vec2(80.0, 208.0), vec2(0.0), vec2(159.0, 287.0))), 0);
    float hb = fract(sin(dot(floor(t0.xyz / 0.4), vec3(27.1, 61.7, 13.3))) * 4375.85), up = t0.y - (eco.a * 25.5 - 8.0);
    if ((flags & 4) != 0) { if (eco.b > hb * 0.8 + 0.1) { float h2 = fract(hb * 17.3), lm = dot(color, vec3(0.3, 0.59, 0.11)); kind = 0;   // water under frost: ice, still, with pale cracks in it
        color = h2 < 0.1 ? vec3(0.54, 0.52, 0.58) : lm < 0.34 || h2 < 0.7 ? vec3(0.56, 0.77, 0.96) : vec3(0.96, 0.95, 0.92); } }
    else if (eco.g > 0.9 && veg) { float fl = fract(hb * 7.0 + u_time * (2.0 + hb * 3.0)); fire = true; flags = flags | 2;   // alight
      color = fl < 0.33 ? vec3(1.0, 0.82, 0.29) : fl < 0.7 ? vec3(0.94, 0.54, 0.14) : vec3(0.72, 0.31, 0.10); }
    else if (eco.r > hb * 0.9 + 0.05 && (flags & 2) == 0) {   // burnt: leaves are gone, grass is black stubble, and everything else there is sooted
      if (veg) { if (up > 1.1) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; } veg = false; green = false; sc *= 0.72;
        color = eco.g > 0.1 && fract(hb * 13.0 + u_time * 0.7) < 0.12 ? vec3(0.94, 0.54, 0.14) : hb < 0.5 ? vec3(0.07, 0.06, 0.07) : vec3(0.17, 0.13, 0.12); }
      else color *= 0.5; }
    else if (veg && eco.b > hb * 0.8 + 0.1 && up < 1.2) { float lm = dot(color, vec3(0.3, 0.59, 0.11)); veg = false; green = false; color = lm < 0.45 ? vec3(0.54, 0.52, 0.58) : lm < 0.62 ? vec3(0.56, 0.77, 0.96) : vec3(0.96, 0.95, 0.92); }   // rime on the grass
  }
  bool fabric = (kraw & 6144) == 4096;
  float foliageTime = u_motionCadence ? u_effectTimes.x : u_time;
  float bendTime = fabric && u_motionCadence ? u_effectTimes.y : foliageTime;
  float fallTime = u_motionCadence ? ((kraw & 8192) != 0 ? u_waterAndRainTime.y : u_effectTimes.z) : u_time;
  float flickerTime = u_motionCadence ? u_effectTimes.w : u_time;
  float waterTime = u_motionCadence ? u_waterAndRainTime.x : u_time;
  if (kind == 1) { alpha *= 0.62 + 0.38 * sin(flickerTime * sp + ph); snap = u_snap > 0.5; }                      // twinkle
  else if (kind == 2) { float pr = fract(fallTime * sp / rg + ph); pos.y -= pr * rg; alpha *= 1.0 - pr * pr; sc *= 1.0 + pr * ex;
    pos.xz += u_rainWind * (pr * rg / max(sp, 0.00001)); }   // fall
  else if (kind == 3) { float pr = fract(u_time * sp / rg + ph); pos.y += pr * rg; pos.x += sin(pr * 7.0 + ph * 50.0) * 0.25 * pr;
                        alpha *= (1.0 - pr) * smoothstep(0.0, 0.1, pr); sc *= 0.6 + pr * ex; }                 // rise
  else if (kind == 4) { color += vec3(0.3) * smoothstep(0.75, 1.0, sin(waterTime * sp + ph)); }                   // shimmer
  else if (kind == 5) { float a = u_time * sp, c = cos(a), s = sin(a);
                        mat3 R = mat3(c, 0.0, -s,  0.0, 1.0, 0.0,  s, 0.0, c); pos = R * pos; cov = R * cov * transpose(R); FM = R; } // orbit
  else if (kind == 6) { pos.y += sin(u_time * sp + ph) * rg; }                                                 // bob
  else if (kind == 7) { alpha *= 0.82 + 0.18 * sin(flickerTime * sp + ph); }                                        // glow
  else if (kind == 8) { float f = 0.2 + 0.8 * abs(sin(u_time * sp + ph)); pos.x = rg + (pos.x - rg) * f; pos.z = ex + (pos.z - ex) * f; pos.y += 0.14 * sin(u_time * sp * 0.31 + ph); }   // flap about a pivot
  else if (kind == 9) { pos.xz *= 1.0 + rg * sin(u_time * sp + ph - pos.y * ex); }                                                         // swell about the centre line
  else if (kind == 10) { float q = length(pos.xz), w = min(1.0, q * 0.22); pos.y += rg * w * sin(u_time * sp + ph - q * ex);
                         pos.xz += rg * 0.6 * w * vec2(-pos.z, pos.x) / max(q, 0.01) * sin(u_time * sp * 0.7 + ph - q * ex * 0.6); }                 // writhe outward from the centre
  else if (kind == 11) {
    ${C?"if (u_motionWind && (kraw & 8192) != 0) pos.xz += (fabric ? u_effectWind.zw : u_effectWind.xy) * airflowBend(bendTime, ph, sp, rg); else":""}
    { pos.x += rg * sin(bendTime * sp + pos.y * 1.3 + pos.z * 0.9 + ph); pos.y += rg * 0.6 * sin(bendTime * sp * 1.3 + pos.x * 1.1 + ph); }
    vec2 dv = pos.xz - u_actor.xy; float q = length(dv); if (u_actor.z > 0.0 && q < u_actor.z && pos.y - u_actor.w < 2.3 && pos.y - u_actor.w > -0.4) { float pf = 1.0 - q / u_actor.z; pos.xz += dv / max(q, 0.05) * pf * pf * 0.5; pos.y -= pf * pf * 0.07; } }
  else if (kind == 12 || kind == 13) { int bi = int(ph + 0.5) * 3; ivec2 bq = ivec2(bi % 768, bi / 768); vec4 b0 = texelFetch(u_bones, bq, 0), b1 = texelFetch(u_bones, bq + ivec2(1, 0), 0), b2 = texelFetch(u_bones, bq + ivec2(2, 0), 0);   // carried by a bone: the splat is kept as it was made, and turned and moved here
                         mat3 A = mat3(b0.x, b1.x, b2.x, b0.y, b1.y, b2.y, b0.z, b1.z, b2.z); vec3 p1 = A * pos + vec3(b0.w, b1.w, b2.w); cov = A * cov * transpose(A); FM = A;
                         if (rg > 0.0) { int ci = int(sp + 0.5) * 3; ivec2 cq = ivec2(ci % 768, ci / 768); vec4 c0 = texelFetch(u_bones, cq, 0), c1 = texelFetch(u_bones, cq + ivec2(1, 0), 0), c2 = texelFetch(u_bones, cq + ivec2(2, 0), 0);   // shared with a second bone: its place is blended
                           p1 = mix(p1, vec3(dot(c0.xyz, pos) + c0.w, dot(c1.xyz, pos) + c1.w, dot(c2.xyz, pos) + c2.w), rg); }
                         pos = p1;
                         if (kind == 13) { pos.x += 0.022 * sin(foliageTime * 1.9 + pos.y * 1.3 + pos.z * 0.9 + 1.0); pos.y += 0.0132 * sin(foliageTime * 2.47 + pos.x * 1.1 + 1.0); } }   /* carried, and then stirred by the wind as hair and grass are */
  else if (kind == 15) { float pr = fract(foliageTime * sp / rg + ph); pos.y -= pr * rg; pos.x += sin(pr * 11.0 + ph * 40.0) * ex; pos.z += cos(pr * 7.0 + ph * 23.0) * ex * 0.6;   // flutter down: a leaf or a flake, swinging as it falls
                         alpha *= smoothstep(0.0, 0.05, pr) * (1.0 - smoothstep(0.92, 1.0, pr)); }
  else if (kind == 14) { float hg = max(0.0, pos.y - ex); pos.x += rg * hg * sin(foliageTime * sp + ph); pos.z += rg * 0.6 * hg * sin(foliageTime * sp * 0.73 + ph * 1.7); }   // sways as a whole from its foot (a placed copy: ex is where its foot is)
  if ((flags & 2) != 0 && (kind == 1 || (kind == 7 && ex != -7.0))) alpha *= 1.0 - u_emissiveWind;
  if ((flags & 32) != 0) { float gt = (u_time - u_born.x) * u_born.y; if (u_born.w > 0.0) gt = mod(gt, u_born.w); float gs = clamp((gt - ex) / u_born.z, 0.0, 1.0);   // born: not there till its time, then it grows to its size
                           if (gs <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; } sc *= gs * (2.0 - gs); }
  else if ((flags & 64) != 0) { float wt = clamp(((u_time - u_born.x) * u_born.y - ex) / 2.0, 0.0, 1.0); color = mix(color, color * vec3(0.58, 0.62, 0.7), wt); }   // wet: from its time on it darkens, as rain soaks it
  // The portal is not a picture. A piece of the other place really stands beyond the ring; of it, only what the eye sees through the
  // ring is drawn, and of this place, whatever lies beyond the ring on that same line of sight is left out.
  if (u_portal.w != 0.0) { bool thr = false; float sg = u_portal.w;
    if ((pos.z - u_portal.z) * sg < -0.12 && (u_eye.z - u_portal.z) * sg > 0.05) { vec3 hp = u_eye + (pos - u_eye) * ((u_eye.z - u_portal.z) / (u_eye.z - pos.z)); thr = abs(hp.x - u_portal.x) < u_pdoor.x && hp.y > u_portal.y && hp.y < u_portal.y + u_pdoor.y; }
    if (pv ? !thr : (thr && stat)) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; } }
  else if (pv) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  ${p?"":"if (dot(u_arrivalPlane, vec4(pos, 1.0)) < 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }"}
  // under a roof, the storey over your head is not drawn at all: the cut comes down from above to just over head height, block by block
  if (u_lid.y > 0.0 && !pv) { float hl = fract(sin(dot(floor(pos.xyz / 0.5), vec3(12.9898, 78.233, 37.719))) * 43758.5453); if (pos.y > u_lid.x + (stat ? 0.0 : 0.9) + (1.0 - u_lid.y) * (7.0 + 3.0 * hl)) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; } }
  // what moves (an enemy, a barrel, a saw, a rail's lights) is held to the same lit circle as the ground it stands on: nothing shows out in the black where there is no floor
  if (u_reveal > 0.0 && !stat && !pv && u_rbox.x > 0.5) { float hv2 = fract(sin(dot(floor(pos.xyz / 0.5), vec3(12.9898, 78.233, 37.719))) * 43758.5453); if (clamp((u_rbox.x - distance(pos.xz, u_rev.xy)) / 2.2, 0.0, 1.0) <= hv2 * 0.86 + 0.04) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; } }
  if (u_reveal > 0.0 && stat) {
    // The world exists only around you. Scenery stays exactly where it stands and comes up out of black, patch by patch:
    // when its cell arrives, and again at the edge of the lit ground, which trails a little behind as you run.
    // It forms in solid half-unit blocks, not as loose specks: every splat in a block appears at the same moment, low blocks before
    // high ones, so a tree arrives trunk first and its crown in clumps.
    float hv = fract(sin(dot(floor(t0.xyz / 0.5), vec3(12.9898, 78.233, 37.719))) * 43758.5453), hs = fract(float(a_index) * 0.6180339), yr = clamp(t0.y - u_actor.w, 0.0, 9.0);
    float de = pv ? 9.0 : u_rbox.x - distance(pos.xz, u_rev.xy) - (1.0 - u_fade) * 50.0;   // how far inside the circle of world round you this is
    bool own = kind == 2 || kind == 3 || kind == 8 || kind == 9 || kind == 10 || kind == 14 || kind == 15;   // these use the last number for their own motion, so they carry no arrival time
    float te = min(clamp((de - yr * 0.1) / 2.2, 0.0, 1.0), own ? 1.0 : clamp((u_time - ex) / 0.7 - yr * 0.06, 0.0, 1.0));
    if (te <= hv * 0.86 + 0.04) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }   // not formed yet: nothing is drawn, so what shows is plain black
    // seasons: everything green turns, a patch at a time: to amber and rust in autumn, to snow in winter
    if (green && !fire && u_season.x + u_season.y > 0.0) {
      float lm = dot(color, vec3(0.3, 0.59, 0.11)), hp = fract(sin(dot(floor(pos.xz / 0.7), vec2(41.3, 17.7))) * 9731.1) * 0.999;
      if (hp < u_season.y) color = lm < 0.3 ? vec3(0.34, 0.31, 0.42) : lm < 0.45 ? vec3(0.54, 0.52, 0.58) : lm < 0.62 ? vec3(0.56, 0.77, 0.96) : vec3(0.96, 0.95, 0.92);
      else if (hp < u_season.x) color = lm < 0.3 ? vec3(0.42, 0.27, 0.15) : lm < 0.45 ? vec3(0.72, 0.31, 0.10) : lm < 0.62 ? vec3(0.94, 0.54, 0.14) : vec3(1.0, 0.82, 0.29);
    }
    // round shadows under whoever is standing on this
    if ((flags & 6) == 0) for (int i = 0; i < 16; i++) { if (i >= u_shn) break; vec4 s4 = u_sh[i]; if (distance(pos.xz, s4.xy) < s4.w && pos.y > s4.z - 0.35 && pos.y < s4.z + 0.55) {   // the shadow is a darker colour of the same family, never a tint that lands on some other hue
      float lm = dot(color, vec3(0.3, 0.59, 0.11)); color = color.g - max(color.r, color.b) > 0.06 ? (lm > 0.62 ? vec3(0.227, 0.478, 0.235) : vec3(0.118, 0.29, 0.204)) : color * 0.45; break; } }
    for (int i = 0; i < 4; i++) { vec4 wc = u_wc[i], wd = u_wd[i]; if (wc.w > 0.0 && abs(pos.y - wc.y - 0.35) < 1.2) { vec2 ab = wd.zw - wc.xz; float tt = wd.y < 0.5 ? 0.0 : clamp(dot(pos.xz - wc.xz, ab) / max(dot(ab, ab), 0.001), 0.0, 1.0), dd = distance(pos.xz, wc.xz + ab * tt);
      if (dd < wc.w) { bool rim = dd > wc.w - 0.2 || (wd.y > 0.5 && (tt < 0.02 || tt > 0.98)), fill = wd.y < 0.5 ? dd < wc.w * wd.x : tt < wd.x; color = rim ? vec3(1.0, 0.64, 0.3) : mix(color, vec3(0.84, 0.17, 0.15), fill ? 0.62 : 0.26); } } }
    // whatever stands between you and the eye is simply not drawn
    vec3 rel = pos - vec3(u_actor.x, u_actor.w + 0.9, u_actor.y); float al = dot(rel, u_camdir), pr2 = length(rel - al * u_camdir);
    vec2 hc = normalize(u_camdir.xz + vec2(0.0, 1e-5));   // (only what is on the eye's side of you: a wall you have your back to is behind you however tall it is, and stays whole)
    if (al > 0.4 && dot(rel.xz, hc) > 0.2 + 0.25 * hs && pos.y > u_actor.w + u_cut.y && pr2 < u_cut.x - 0.4 * hs) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    // and, underground, whatever stands well to the eye's side of you is cut down to knee height right across: the back of the next
    // room's wall, its railings and its statues would otherwise fill the bottom of the picture
    if (u_slice > 0.0 && dot(rel.xz, hc) > u_slice + 0.8 * hv && pos.y > u_actor.w + u_cut.y) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
    // What lies under the water (a reflection, the bed) is seen only through water: the line from the eye to it has to cross the
    // surface where there is water, inside the lit circle. Otherwise it would hang in the dark under the edge of the world.
    // And a reflection goes when the thing it is the reflection of has been cut away.
    if (!pv && pos.y < u_wl - 0.02 && u_eye.y > u_wl + 0.1 && !(pos.x > u_pit.x && pos.x < u_pit.y && pos.z > u_pit.z && pos.z < u_pit.w)) { vec3 dd = pos - u_eye; vec2 q = u_eye.xz + dd.xz * ((u_wl - u_eye.y) / dd.y);
      if (distance(q, u_rev.xy) > u_rbox.x - 0.3 || (u_ecoOn > 0.5 && texelFetch(u_eco, ivec2(clamp(floor(q) + vec2(80.0, 208.0), vec2(0.0), vec2(159.0, 287.0))), 0).a * 25.5 - 8.0 > u_wl - 0.03)) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
      vec3 rs = vec3(pos.x, 2.0 * u_wl - pos.y, pos.z) - vec3(u_actor.x, u_actor.w + 0.9, u_actor.y); float as2 = dot(rs, u_camdir);
      if ((flags & 1) != 0 && rs.y + 0.9 > u_cut.y && (as2 > 0.4 && length(rs - as2 * u_camdir) < u_cut.x || u_slice > 0.0 && dot(rs.xz, hc) > u_slice)) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; } }
  }
  cov *= sc * sc;

  vec4 cam = u_view * vec4(pos, 1.0);
  if (cam.z > -u_near) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
${i&&!p?"  v_waterAxial = -cam.z;":""}
${b?"  v_envAxial = -cam.z;":""}
  vec4 clip = u_proj * cam;
  ${j?`
  vec4 nearGlass = u_proj * vec4(cam.xy, min(cam.z + u_glassTolerance, -u_near), cam.w);
  v_glassNearDepth = nearGlass.z / nearGlass.w * 0.5 + 0.5;`:""}
  ${m||u?"v_policySlot = contributionSlot(a_index);":""}
  ${u?"if (u_idx < 2.5) placeMask(a_index, v_policySlot, pos, cam.xyz, abs(determinant(FM)) > 1e-8 ? inverse(FM) : mat3(1.0), mat3(u_view));":""}
  ${p?"":`v_ownerDepth = ${j?"":"u_idx > 1.5 ? "}clip.z / clip.w * 0.5 + 0.5${j?"":" : 0.0"};`}
  float dn = clamp((-cam.z - u_fogp.z) / (u_fogp.w - u_fogp.z), 0.0, 1.0);
  if (u_lampN > 0 && (flags & 22) == 0 && alpha >= 1.0) {
    float tr = cov[0][0] + cov[1][1] + cov[2][2], pp = tr / 2.4253, add = 0.0;   // (a dab is a disc, thin the way it faces: from its shape, how squarely it faces a light)
    for (int i = 0; i < 8; i++) { if (i >= u_lampN) break; vec4 Lq = u_lamp[i]; vec3 dl = Lq.xyz - pos; float d2 = dot(dl, dl);
      if (d2 < Lq.w * Lq.w) { float fa = 1.0 - sqrt(d2) / Lq.w, nd = sqrt(clamp(dot(dl, (cov - mat3(pp)) * dl) / (-0.5747 * pp * max(d2, 1e-4)), 0.0, 1.0)); add += fa * fa * u_lamps[i] * (0.3 + 0.7 * nd); } }
    if (add > 0.0) { float hb = fract(sin(dot(floor(pos.xyz / 0.22), vec3(12.9898, 78.233, 37.719))) * 43758.5453); int steps = int(floor(add * u_lampGain + (hb - 0.5) * 0.5)); v_lit = clamp(add * 1.8, 0.0, 1.0);   // (how lit it is also goes to the last pass, which shows lit things in the colours they have by day)
      if (steps > 0) { int ci = -1; for (int k = 0; k < 48; k++) { vec3 dc = abs(color - u_lpal[k]); if (max(dc.r, max(dc.g, dc.b)) < 0.004) { ci = k; break; } }
        if (ci >= 0) { if (!stat) steps = min(steps, 1);   /* (whoever carries the light is not washed out by it) */
          for (int k = 0; k < 3; k++) { if (k >= steps) break; ci = u_lup[ci]; } color = u_lpal[ci]; color0 = color; } } } }
  bool plain = color == color0 && (kraw & 32768) == 0; float fogk = (flags & 2) == 0 && u_fogp.y > 0.0 && u_fogp.x < 1.0 ? smoothstep(u_fogp.x, 1.0, dn) * u_fogp.y : 0.0;   // (smoothstep from 1 to 1 is undefined: some cards give NaN, a black pixel)
  ${F?`
  ivec2 opticalUV = ivec2((a_index & 511) * 3, a_index >> 9);
  v_optical = texelFetch(u_optical, opticalUV, 0);
  v_scatterTint = texelFetch(u_optical, opticalUV + ivec2(1,0), 0).xyz;
  v_reflectTint = texelFetch(u_optical, opticalUV + ivec2(2,0), 0).xyz;
  v_opticalFog = v_optical.w > 0.5 ? fogk : 0.0;
  fogk -= v_opticalFog;`:""}
  ${w?"v_relight = relightAt(a_index); if (v_relight.w > 0.0) { v_relight.w += fogk; fogk = 0.0; }":""}
  if (fogk > 0.0) color = mix(color, u_fog, fogk);   // distance haze
  vec3 colorF = color;
  int coverage = u_splatCoverage;
  ${T?`
  int encodedCoverage = int(v_pixelStyle.x / ${$}.0);
  if (encodedCoverage > 0) coverage = encodedCoverage - 1;
  v_pixelStyle.x = mod(v_pixelStyle.x, ${$}.0);
  if (!u_materialStylesOn) v_pixelStyle.xy = vec2(0.0);`:""}
  bool continuous = coverage == ${I} && alpha >= 1.0 && (kraw & ${E}) == 0 && v_paint == 0
    ${F?"&& v_optical.w < 0.5":""};
  v_coverage = continuous ? ${I} : (coverage == ${y} ? ${y} : 0);
  v_depth = coverage == ${y} || (flags & 1) != 0 ${F?"|| v_optical.w > 0.5":""} ? -1.0 : dn;
  float iz = -1.0 / cam.z;
  vec2 lim = 1.3 * 0.5 * u_viewport / u_focal;
  float tx = clamp(cam.x * iz, -lim.x, lim.x) / iz, ty = clamp(cam.y * iz, -lim.y, lim.y) / iz;
  // Jacobian of the perspective projection, then covariance into screen space
  mat3 J = u_ortho > 0.5 ? mat3(u_focal, 0.0, 0.0,   0.0, u_focal, 0.0,   0.0, 0.0, 0.0)   // (orthographic: u_focal is pixels to a unit)
    : mat3(u_focal * iz, 0.0, 0.0,   0.0, u_focal * iz, 0.0,   u_focal * tx * iz * iz, u_focal * ty * iz * iz, 0.0);
  mat3 T = J * mat3(u_view);
  mat3 c2 = T * cov * transpose(T);
  float variance = continuous ? ${o} * u_materialGridScale * u_materialGridScale : u_dilate;
  float A = c2[0][0] + variance, B = c2[0][1], C = c2[1][1] + variance;
  ${l?`
  v_detailTexture = 1.0;
  v_detailGeometry = 1.0;
  if (u_detailGeometry.y > u_detailGeometry.x && detailStroke(kraw) && v_paint == 0
      ${F?"&& v_optical.w < 0.5":""}) {
    v_detailGeometry = detailWeight(u_detailGeometry,detailGeometryPixels(c2[0][0],B,c2[1][1],u_materialGridScale));
    if (v_detailGeometry <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  }`:""}
  float det = A * C - B * B;
  if (det <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  v_conic = vec3(C, -B, A) / det;
  ${p||_?`
  // Condition axial depth on pixel offset using projected Gaussian covariance.
  vec3 back = vec3(u_view[0].z, u_view[1].z, u_view[2].z);
  vec3 crossDepth = cov * back;
  vec2 depthCov = -(T * crossDepth).xy;
  `:""}
  ${p?"v_portalDepth = vec3(-cam.z, mat2(v_conic.x, v_conic.y, v_conic.y, v_conic.z) * depthCov);":""}
  ${_?`
  float pureDet = c2[0][0] * c2[1][1] - B * B;
  vec3 sectionConic = pureDet > 1e-8 * max(1.0, c2[0][0] * c2[1][1])
    ? vec3(c2[1][1], -B, c2[0][0]) / pureDet : v_conic;
  vec2 sectionSlope = mat2(sectionConic.x, sectionConic.y, sectionConic.y, sectionConic.z) * depthCov;
  v_sectionSample = vec4(-cam.z, sectionSlope, 3.0 * sqrt(max(0.0, dot(back, crossDepth))));
  `:""}
  vec2 ext = min(3.0 * sqrt(vec2(A, C)), vec2(2048.0));
  vec2 ndc = clip.xy / clip.w;
  if (snap) { vec2 px = floor((ndc * 0.5 + 0.5) * u_viewport) + 0.5; ndc = px / u_viewport * 2.0 - 1.0; }
  vec2 extN = ext * 2.0 / u_viewport;
  if (any(greaterThan(abs(ndc) - extN, vec2(1.0)))) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  v_d = a_corner * ext;
  if (stat) { for (int i = 0; i < 4; i++) { vec4 h4 = u_hitf[i]; if (h4.w > 0.0 && distance(pos, h4.xyz) < h4.w) color = vec3(1.0, 0.97, 0.88); } }
  else { float ai = float(a_index); for (int i = 0; i < 8; i++) { vec3 f3 = u_fl[i]; if (f3.z > 0.0 && ai >= f3.x && ai < f3.y) color = vec3(1.0, 0.97, 0.88); } }
  if (${c?"a_instance == 0 && ":""}u_fineOn > 0.5 && plain && color == colorF) {   // (a dab that has been recoloured since it was baked, by anything, is drawn plain)
    ivec2 fq = ivec2((a_index & 511) * 3, row); vec4 f1 = texelFetch(u_fine, fq + ivec2(1, 0), 0), f2 = texelFetch(u_fine, fq + ivec2(2, 0), 0);
    if (f2.w > 0.5 && f1.w == t1.w) { vec3 pu = T * (FM * f1.xyz) * sc, pw = T * (FM * f2.xyz) * sc; float dt = pu.x * pw.y - pw.x * pu.y;
      if (abs(dt) > 1e-4 * (abs(pu.x * pw.y) + abs(pw.x * pu.y) + 1e-9)) {
        ${l?`if (u_detailTexture.y > u_detailTexture.x) v_detailTexture =
          detailWeight(u_detailTexture,detailTexturePixels(pu.xy,pw.xy,u_materialGridScale));`:""}
        v_fm = vec4(pw.y, -pw.x, -pu.y, pu.x) / dt; v_ft = texelFetch(u_fine, fq, 0); v_fk = fogk; } } }
  ${T?`
  int styleCode = int(v_pixelStyle.y);
  if (!plain || color != colorF || v_lit > 0.0 ||
      (u_materialPatterned && (styleCode & 1024) != 0) ||
      t1.w != (fract(v_pixelStyle.y) >= 0.25 ? v_pixelStyle.w : v_pixelStyle.z)) v_pixelStyle.y = 0.0;
  v_pixelFog = fogk;`:""}
  v_color = vec4(min(color, 1.0), alpha);
  v_gl = (flags & 16) != 0 ? 1.0 : 0.0;   // glass
  v_as = (flags & 128) != 0 ? 1.0 : 0.0; v_ast = v_as > 0.5 ? float(((kraw >> 12) & 1) | (((kraw >> 14) & 1) << 1)) : 0.0;   // text (K.ascii): the dab asks for it (and maybe for a set of its own), or it lies inside a zone (0.5 on the zone's surface)
  for (int i = 0; i < 4; i++) { if (i >= u_azn) break; vec4 z4 = u_az[i]; float zm = clamp(0.5 + (z4.w - distance(pos, z4.xyz)) / (2.0 * u_asoft), 0.0, 1.0); if (zm > v_as) { v_as = zm; v_ast = u_azst; } }

${e?e.vsMain:""}  gl_Position = vec4(ndc + a_corner * extN, u_geometryDepth ? clip.z/clip.w : 0.0, 1.0);
}`,k=`#version 300 es
precision highp float; precision highp int;
in vec2 v_d; in vec3 v_conic; in vec4 v_color; in float v_depth; flat in int v_coverage;
${l?"flat in float v_detailGeometry, v_detailTexture;":""}
${p?"flat in vec3 v_portalDepth; uniform vec4 u_splatPlane;":"flat in float v_ownerDepth;"}
${p||_?"uniform mat4 u_proj; uniform float u_ortho;":""}
${_?_+`
flat in vec4 v_sectionSample;
uniform mat4 u_view;
uniform vec4 u_fogp;
uniform float u_near;
uniform bool u_geometryDepth;`:""}
in float v_gl; in float v_as; in float v_ast;
${e?e.fsDecl:`uniform float u_gly;
`}uniform float u_crisp, u_hard;
flat in vec4 v_fm; flat in vec4 v_ft; flat in float v_fk; flat in float v_lit; flat in float v_ix; uniform vec3 u_fpal[64]; uniform vec3 u_fog;
${T?`flat in vec4 v_pixelStyle; flat in float v_pixelFog; uniform float u_materialGridScale;
${vu}`:""}
uniform float u_idx;
uniform bool u_paintPass; flat in int v_paint;
${w?"flat in vec4 v_relight;":""}
${F?"flat in vec4 v_optical; flat in vec3 v_scatterTint, v_reflectTint; flat in float v_opticalFog;":""}
layout(location=0) out vec4 o;
layout(location=1) out vec4 od;
${j&&!i?"vec4 oa;":"layout(location=2) out vec4 oa;"}
${j?`layout(location=${i?3:2}) out vec4 o_back;
layout(location=${i?4:3}) out vec4 o_through;
uniform highp sampler2D u_glassBoundary;
flat in float v_glassNearDepth;
float glassDepth(vec4 sampleDepth) {
  return dot(floor(sampleDepth.rgb*255.0+0.5),vec3(1.0,256.0,65536.0)) / 16777215.0;
}`:""}
${i||p||b||_?"uniform vec2 u_viewport;":""}
${b?Li(v)+"flat in float v_envAxial;":""}
${p||_?mu:""}
${fu(z)}
${m||u?`${qr}flat in int v_policySlot;`:""}
${m?`uniform vec3 u_pal[64], u_out[64]; uniform int u_n;
uniform float u_toneOn, u_grade;
uniform vec2 u_lookGrid, u_lookViewportScale;
${_u}`:""}
${u?jr+Ra(A).replaceAll("LOOK_IO","in")+du(A):""}
${i?mo(a,r,n)+(p?"":"flat in float v_waterAxial;"):""}
void main(){
${e?e.fsMain:""}  float power = -0.5 * (v_conic.x * v_d.x * v_d.x + v_conic.z * v_d.y * v_d.y) - v_conic.y * v_d.x * v_d.y;
  if (power > 0.0 || power < -4.5) discard;
  float g = v_color.a * exp(power);
  bool continuous = v_coverage == ${I};
  float surfaceAlpha = continuous ? smoothstep(${h}, ${s.toFixed(2)}, g) : 0.0;
  ${F?"bool hasOptical = v_optical.w > 0.5; if (hasOptical && v_optical.x == 0.0) discard;":""}
  ${_?`
  float sectionAxial = v_sectionSample.x + clamp(dot(v_sectionSample.yz, v_d), -v_sectionSample.w, v_sectionSample.w);
  if (sectionAxial < u_near) discard;
  vec3 inView = axialPosition(gl_FragCoord.xy, sectionAxial, u_viewport);
  vec3 inWorld = transpose(mat3(u_view)) * (inView - u_view[3].xyz);
  float margin = sectionMargin(inWorld, sectionAxial);
  if (margin < 0.0) discard;
  float cutInk = sectionInk(margin);
  vec4 sectionProjected = u_proj * vec4(inView,1.0);
  float sectionZ = sectionProjected.z / sectionProjected.w * 0.5 + 0.5;
  gl_FragDepth = u_geometryDepth ? clamp(sectionZ,0.0,1.0) : gl_FragCoord.z;
  float sectionDepth = clamp((sectionAxial - u_fogp.z) / (u_fogp.w - u_fogp.z), 0.0, 1.0);
  `:""}
  ${j?`
  ${_?"":"gl_FragDepth = gl_FragCoord.z;"}
  if (u_idx > 2.5) {
    if (v_gl < 0.5 || g ${F?"* (hasOptical ? v_optical.x : 1.0)":""} < 0.004) discard;
    float depth = ${_?"sectionZ":"v_ownerDepth"};
    float z = round(clamp(depth,0.0,1.0)*16777215.0);
    gl_FragDepth = clamp(depth,0.000001,1.0);
    o = vec4(mod(z,256.0),mod(floor(z/256.0),256.0),floor(z/65536.0),255.0)/255.0;
    return;
  }`:""}
  ${p?`
  float axial = v_portalDepth.x + dot(v_portalDepth.yz, v_d);
  bool clipped = any(notEqual(u_splatPlane.xyz, vec3(0.0)));
  if (clipped) {
    if (axial <= 0.0 || dot(u_splatPlane, vec4(axialPosition(gl_FragCoord.xy, axial, u_viewport), 1.0)) < 0.0) discard;
  }
  if (u_idx > 1.5) {
    if (v_coverage == ${y} || v_color.a < 0.5 || (continuous ? surfaceAlpha <= 0.5 : g < 0.38)${F?" || hasOptical":""}) discard;
    o = vec4(1.0); od = vec4(0.0); oa = vec4(0.0);
    return;
  }
  `:`
  if (u_idx > 1.5) {
    if (v_coverage == ${y} || v_color.a < 0.5 || (continuous ? surfaceAlpha <= 0.5 : g < 0.38)${F?" || hasOptical":""}) discard;
    float k = v_ix + 1.0, z = round(clamp(${_?"sectionZ":"v_ownerDepth"}, 0.0, 1.0) * 16777215.0);
    o = vec4(mod(k, 256.0), mod(floor(k / 256.0), 256.0), floor(k / 65536.0), 255.0) / 255.0;
    od = vec4(mod(z, 256.0), mod(floor(z / 256.0), 256.0), floor(z / 65536.0), 255.0) / 255.0;
    oa = vec4(0);
    return;
  }
  `}
  if (u_idx > 0.5) {   // the index pass (colour per pixel): which solid dab is in front here, its number in three bytes
    if (v_color.a < 1.0 || (continuous ? surfaceAlpha <= 0.5 : g < 0.5) || v_depth < 0.0) discard;
    ${_?"if (cutInk > 0.0) { o = vec4(0.0); od = vec4(0.0); oa = vec4(0.0); return; }":""}
    float k = v_ix + 1.0;
    o = vec4(mod(k, 256.0), mod(floor(k / 256.0), 256.0), floor(k / 65536.0), 255.0) / 255.0;
    od = vec4(0.0); ${u?`if (v_policySlot > 0) {${hu}}`:""}
    float graphDepth = round(clamp(${_?"sectionDepth":"v_depth"}, 0.0, 1.0) * 16777215.0);
    oa = vec4(mod(graphDepth,256.0), mod(floor(graphDepth/256.0),256.0), floor(graphDepth/65536.0),255.0)/255.0; return; }
  bool solid = u_crisp > 0.5 && v_color.a >= 1.0 && v_coverage != ${y};
  float a = continuous ? surfaceAlpha :
    (solid && u_hard > 0.5 ? (g > 0.5 ? 1.0 : 0.0) : contributionAlpha(power,v_color.a,solid));
  ${T?`
  if (!continuous && solid && u_hard < 0.5 && v_pixelStyle.x > 0.0) {
    float width = 0.36 * (2.0 - v_pixelStyle.x);
    a = 0.99 * (width > 0.0 ? smoothstep(0.5 - width, 0.5 + width, g) : step(0.5, g));
  }`:""}
  ${l?"a *= v_detailGeometry;":""}
  if (a < 0.004) discard;
  vec3 rgb = v_color.rgb;
${T?`
  if ((v_fk < 0.0${l?" || v_detailTexture < 1.0":""}) && (int(v_pixelStyle.y) & 2048) != 0) {
    float rank = pixelStyleThreshold(int(v_pixelStyle.y) & 7, ivec2(gl_FragCoord.xy / u_materialGridScale));
    float pk = fract(v_pixelStyle.y) * 2.0 > rank ? v_pixelStyle.w : v_pixelStyle.z;
    vec3 shade = vec3(mod(pk, 256.0), mod(floor(pk / 256.0), 256.0), floor(pk / 65536.0)) / 255.0;
    rgb = mix(shade, u_fog, v_pixelFog);
  }`:""}
    if (v_fk >= 0.0) {   // inked detail: this pixel's own place on the dab's tile
    ivec2 ij = clamp(ivec2(floor(vec2(dot(v_fm.xy, v_d), dot(v_fm.zw, v_d)) * 2.0 + 2.0)), ivec2(0), ivec2(3));
    float f = ij.y == 0 ? v_ft.x : ij.y == 1 ? v_ft.y : ij.y == 2 ? v_ft.z : v_ft.w;
    int ci = int(mod(floor(f / (ij.x == 0 ? 1.0 : ij.x == 1 ? 64.0 : ij.x == 2 ? 4096.0 : 262144.0)), 64.0));
    vec3 tile = mix(u_fpal[min(ci, 63)], u_fog, v_fk);
    rgb = ${l?"mix(rgb, tile, v_detailTexture)":"tile"}; }
${w?"if (v_relight.w > 0.0) rgb = mix(min(vec3(1.0), rgb * v_relight.xyz), u_fog, v_relight.w - 1.0);":""}
${F?`
  if (hasOptical) {
    rgb = (v_scatterTint.x >= 0.0 ? v_scatterTint : rgb) * v_optical.y + v_reflectTint * v_optical.z;
    rgb = mix(rgb, u_fog, v_opticalFog);
    a *= v_optical.x;
    if (a < 0.004) discard;
  }`:""}
${m?`  if (v_policySlot > 0) {
    ivec2 p = ivec2(floor(gl_FragCoord.xy * u_lookViewportScale));
    p.y = int(u_lookGrid.y) - 1 - p.y;
    vec3 next = paletteRow(v_policySlot, rgb, p);
    float mask = ${u?"maskAt(v_policySlot)":"1.0"};
    if (mask < 1.0) {
      vec3 base = rgb;
      ${u?`if (u_constraintDefault > 0 && maskSettings(u_constraintDefault).x == 0.0)
        base = paletteRow(u_constraintDefault, rgb, p);`:""}
      next = mix(base, next, mask);
    }
    rgb = next;
  }`:""}
${_?"rgb = mix(rgb, u_sectionEdge.rgb, cutInk);":""}
${i?`  vec3 mark; rgb = waterPaint(rgb, gl_FragCoord.xy, u_viewport,
    ${_?"sectionAxial":p?"clipped ? axial : v_portalDepth.x":"v_waterAxial"}, mark);`:""}
  ${b?"rgb = envMedia(rgb, gl_FragCoord.xy, u_viewport, "+(_?"sectionAxial":"v_envAxial")+");":""}
  if (u_paintPass) {
    // Every fragment attenuates the overlay behind it.
    bool overlay = v_paint != 0 ${F?"|| hasOptical":""};
    o = vec4(overlay ? rgb * a : vec3(0.0), a);
    od = vec4(overlay ? a : 0.0, 0.0, 0.0, a);
    return;
  }
  o = vec4(rgb * a, a);
  ${j?`vec4 pane = texelFetch(u_glassBoundary,ivec2(gl_FragCoord.xy),0);
  // Keep near-coplanar transparent contributions together through crossings.
  float splitDepth = v_depth < 0.0 || v_color.a < 1.0 ? v_glassNearDepth : ${_?"sectionZ":"v_ownerDepth"};
  bool behind = pane.a > 0.0 && splitDepth > glassDepth(pane)+0.0000001;
  o_back = behind ? o : vec4(0.0);
  o_through = pane.a > 0.0 && !behind ? vec4(0.0,0.0,0.0,a) : vec4(0.0);`:""}
  float a2 = v_color.a >= 1.0 && v_depth >= 0.0 ? a : 0.0;   // only solid splats write depth
  od = vec4(${_?"sectionDepth":"v_depth"} * a2, v_gl * a * 0.5, v_lit * a2, a2);   // (green: how much glass lies over this pixel, in front of the last solid thing; a solid splat wipes it)
  oa = ${i?"vec4(mark * a, a)":"vec4(v_as * a, v_ast * 0.25 * a, 0.0, a)"};
}`;return{vertex:d,fragment:k}}var _u=`
// OKLab and matching coordinates mirror PixelLook.preparePalette.
vec4 paletteLab(vec3 rgb) {
  vec3 m = abs(rgb);
  vec3 c = sign(rgb) * mix(pow((m+.055)/1.055,vec3(2.4)),m/12.92,lessThanEqual(m,vec3(.04045)));
  vec3 lms = vec3(dot(vec3(.4122214708,.5363325363,.0514459929),c),
                  dot(vec3(.2119034982,.6806995451,.1073969566),c),
                  dot(vec3(.0883024619,.2817188376,.6299787005),c));
  lms = sign(lms)*pow(abs(lms),vec3(1.0/3.0));
  vec3 lab = vec3(dot(vec3(.2104542553,.7936177850,-.0040720468),lms),
                  dot(vec3(1.9779984951,-2.4285922050,.4505937099),lms),
                  dot(vec3(.0259040371,.7827717662,-.8086757660),lms));
  return vec4(lab,length(lab.yz));
}
float paletteLabDistance(vec4 a, vec4 b, int mode, float hue) {
  vec4 q = a-b;
  float distance = (mode == 2 ? 25.0 : 1.0)*q.x*q.x+dot(q.yz,q.yz);
  if (mode == 3) distance += 25.0*q.w*q.w;
  if (hue > 0.0) {
    vec2 d = a.yz/max(.04,a.w)-b.yz/max(.04,b.w);
    distance += hue*dot(d,d);
  }
  return distance;
}
bool paletteAccess(int slot, int row, int base) {
  int bits = int(texelFetch(u_constraintRows, ivec2(base + slot / 24, row), 0).a);
  return (bits & (1 << (slot % 24))) != 0;
}
vec3 paletteRow(int slot, vec3 inputColor, ivec2 p) {
  int row = slot - 1;
  vec4 settings = texelFetch(u_constraintRows, ivec2(0, row), 0);
  int count = int(settings.x), total = int(settings.y);
  vec3 bytes = floor(clamp(inputColor, 0.0, 1.0) * 255.0 + 0.5);
  const vec3 weight = vec3(0.30, 0.55, 0.15);
  vec3 gradedBytes = bytes, gradedReserve = vec3(0.0);
  bool hasGradedReserve = false;
  float mapping = texelFetch(u_constraintRows, ivec2(3, row), 0).a;
  if (mapping > 0.5 || (u_toneOn < 0.5 && u_grade > 0.5 && texelFetch(u_constraintRows, ivec2(2, row), 0).a > 0.5)) {
    int index = 0; float nearestDistance = 1e9;
    for (int i = 0; i < 64; i++) {
      if (i >= u_n) break;
      vec3 d = inputColor - u_pal[i];
      float distance = dot(weight, d * d);
      if (distance < nearestDistance) { index = i; nearestDistance = distance; }
    }
    inputColor = mapping > 0.5 ? texelFetch(u_constraintRows, ivec2(u_constraintMap + index, row), 0).rgb : u_out[index];
    if (mapping > 1.5) { return inputColor; }
    gradedBytes = floor(clamp(inputColor, 0.0, 1.0) * 255.0 + 0.5);
  }
  int mode = int(texelFetch(u_constraintRows, ivec2(4, row), 0).a);
  vec4 inputLab = mode == 0 ? vec4(0.0) : paletteLab(inputColor);
  float hue = mode == 4 ? .49*smoothstep(.02,.06,inputLab.w) : 0.0;
  float firstDistance = 1e9;
  int bestSlot = 0;
  vec3 best = vec3(0.0), second = vec3(0.0);
  vec4 firstLab = vec4(0.0), secondLab = vec4(0.0);
  for (int i = 0; i < 48; i++) {
    if (i >= total) break;
    vec3 swatch = texelFetch(u_constraintRows, ivec2(i + 1, row), 0).rgb;
    if (i >= count) {
      vec3 code = floor(swatch * 255.0 + 0.5);
      if (all(equal(bytes, code))) { return swatch; }
      if (all(equal(gradedBytes, code))) { gradedReserve = swatch; hasGradedReserve = true; }
      if (!paletteAccess(i, row, 8)) continue;
    }
    vec3 d = inputColor - swatch;
    vec4 swatchLab = mode == 0 ? vec4(0.0) : texelFetch(u_constraintRows,ivec2(u_constraintLab+i,row),0);
    float distance = mode == 0 ? dot(weight,d*d) : paletteLabDistance(inputLab,swatchLab,mode,hue);
    if (distance < firstDistance) {
      best = swatch; firstDistance = distance; firstLab = swatchLab; bestSlot = i;
    }
  }
  if (hasGradedReserve) { return gradedReserve; }
  vec3 color = best;
  float amount = texelFetch(u_constraintRows, ivec2(1, row), 0).a;
  float gain = texelFetch(u_constraintRows, ivec2(7, row), 0).a;
  if (total < 2 || amount == 0.0 || gain <= 0.0 ||
      (bestSlot >= count && !paletteAccess(bestSlot, row, 10))) return color;
  ivec2 size = ivec2(settings.zw);
  float scale = texelFetch(u_constraintRows, ivec2(6, row), 0).a;
  ivec2 grid = ivec2(floor(vec2(p) / scale));
  int cell = (grid.y % size.y) * size.x + grid.x % size.x;
  float rank = texelFetch(u_constraintRows, ivec2(49 + cell / 4, row), 0)[cell & 3] / gain;
  if (rank >= .5) return color;
  int pairCount = int(texelFetch(u_constraintRows,ivec2(5,row),0).a)-1;
  int partner = -1;
  float secondDistance = 1e9;
  float lightness = mode == 0 ? -1.0 : clamp(inputLab.x,0.0,1.0);
  int entries = pairCount >= 0 ? pairCount : total;
  for (int i = 0; i < 256; i++) {
    if (i >= entries) break;
    int candidate = i;
    if (pairCount >= 0) {
      vec4 pair = texelFetch(u_constraintRows, ivec2(u_constraintPairs + i, row), 0);
      ivec2 slots = ivec2(pair.xy);
      candidate = slots.x == bestSlot ? slots.y : slots.y == bestSlot ? slots.x : -1;
      if (candidate < 0) continue;
      if (pair.z >= 0.0) {
        if (lightness < 0.0) lightness = clamp(paletteLab(inputColor).x, 0.0, 1.0);
        if (lightness < pair.z || lightness > pair.w) continue;
      }
    } else if (candidate == bestSlot || (candidate >= count && !paletteAccess(candidate, row, 10))) continue;
    vec3 rgb = texelFetch(u_constraintRows, ivec2(candidate + 1, row), 0).rgb;
    vec4 lab = mode == 0 ? vec4(0.0) : texelFetch(u_constraintRows, ivec2(u_constraintLab + candidate, row), 0);
    vec3 d = inputColor - rgb;
    float distance = mode == 0 ? dot(weight, d*d) : paletteLabDistance(inputLab, lab, mode, hue);
    if (distance < secondDistance || distance == secondDistance && candidate < partner) {
      partner = candidate;
      second = rgb;
      secondLab = lab;
      secondDistance = distance;
    }
  }
  if (partner < 0) return color;
  float threshold = .5+(rank-.5)*amount;
  if (mode != 0) {
    float reach = paletteLabDistance(firstLab,secondLab,mode,hue);
    return reach > 0.0 && .5*(firstDistance+reach-secondDistance) >= threshold*reach ? second : color;
  }
  vec3 delta = second-best;
  if (dot(weight*delta,inputColor-best) >= threshold*dot(weight,delta*delta)) color = second;
  return color;
}
`;function Of(e){return`${qr}${_u}
bool g_constrained = false;
${e?`${jr}
uniform highp sampler2D u_maskOwner;
vec3 defaultMaskColor(vec3 rgb, ivec2 p) {
  float th = (BAYER[(p.x & 3) + ((p.y & 3) << 2)] + 0.5) / 16.0 - 0.5;
  rgb = clamp(rgb + th * u_dither, 0.0, 1.0);
  int best = 0; float bd = 1e9;
  for (int i = 0; i < 64; i++) {
    if (i >= u_n) break;
    vec3 d = rgb - u_pal[i];
    float dd = dot(d*d, vec3(0.30, 0.55, 0.15));
    if (dd < bd) { bd = dd; best = i; }
  }
  return u_grade > 0.5 ? u_out[best] : u_pal[best];
}`:""}
bool constrainPalette(ivec2 p, vec3 inputColor, out vec3 color) {
  int index = dabAt(p);
  if (index < 0) return false;
  int slot = contributionSlot(index);
  if (slot == 0) return false;
  ivec2 pos = ivec2(p.x, textureSize(u_idxTex, 0).y - 1 - p.y);
  color = paletteRow(slot,inputColor,pos);
  ${e?`if (maskSettings(slot).x != 0.0) {
    vec2 encoded = floor(texelFetch(u_maskOwner,p,0).rg * 255.0 + 0.5);
    float amount = dot(encoded, vec2(1.0,256.0)) / 65535.0;
    if (amount < 1.0) {
      vec3 base = u_constraintDefault > 0 && maskSettings(u_constraintDefault).x == 0.0 ?
        paletteRow(u_constraintDefault,inputColor,pos) : defaultMaskColor(inputColor,p);
      color = mix(base,color,amount);
    }
  }`:""}
  return true;
}`}function Ur(e,{water:t=!1,airPockets:i=!1,layered:a=!1,atlas:r=!1,paletteConstraints:n=!1,masked:p=!1,contributions:c=!1,layeredGlass:m=!1,materialStyles:u=!1,environment:A=!1,emitterFog:j=!1,relighting:z=!1,packedTone:T=!1,cutaway:b}={}){let v=`
uniform highp sampler2D u_waterMask;
ivec2 waterPixel(ivec2 p) {
  vec3 mark = texelFetch(u_waterMask, p, 0).rgb;
  if (mark.x < 0.98) return p;
  int body = int(round(mark.y * 255.0)), code = int(round(mark.z * 255.0));
  ivec2 shift = ivec2(code % 9 - 4, code / 9 - 4);
  ivec2 dest = clamp(p + shift, ivec2(0), textureSize(u_waterMask, 0) - 1);
  vec3 other = texelFetch(u_waterMask, dest, 0).rgb;
  return other.x >= 0.98 && int(round(other.y * 255.0)) == body ? dest : p;
}
`,w=`#version 300 es
void main(){ vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2); gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`,F=`#version 300 es
precision highp float;
${n||u||z?"precision highp int;":""}
uniform sampler2D u_scene, u_depth, u_crispScene, u_crispDepth;
${A?Li(j):""}
uniform bool u_paintOn;
${z?za+"uniform vec3 u_relightFog; uniform vec2 u_relightFogRange;":""}
uniform vec3 u_line;
uniform float u_edge;
// the tone look (a diorama's look.tone, or the Tone option: PixelLook's stipple): brightness below the cutoff is black, the rest
// mapped onto the stops (u_toneStops: colour, and its place in .a), each pixel between two stops taking one or the other by its rank
// in a fixed pattern (Bayer or blue noise) on the screen's art grid
uniform float u_toneOn, u_toneCut, u_toneAmt; uniform int u_toneN; uniform highp sampler2D u_toneStops;
${T?"uniform ivec2 u_toneThSize;":"uniform highp sampler2D u_toneTh;"}
uniform vec3 u_pal[64], u_out[64], u_outl[64];   // (u_outl: what each colour is shown as where a carried light falls on it)
uniform int u_n;
uniform float u_grade; uniform float u_bars; uniform int u_remapLine;
uniform float u_dither, u_luma, u_bypass, u_colored, u_refract, u_ao, u_aor;
uniform float u_lines, u_lineGap, u_lineK, u_lineLit;
out vec4 o;
${t?mo(i,a,r)+v:""}
const float BAYER[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0, 3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
const ivec2 AOT[8] = ivec2[8](ivec2(2, 0), ivec2(-2, 0), ivec2(0, 2), ivec2(0, -2), ivec2(1, 1), ivec2(-1, 1), ivec2(1, -1), ivec2(-1, -1));
// light in the air behind a round stained window (a diorama's .glass): the window's centre and radius, the way its light travels, six glass
// colours, and the eye. Each pixel's line of sight is walked where it crosses the beam; every step adds the colour of the pane it lies behind,
// thinned or thickened by a haze that drifts, and the sum is added to the finished picture: this is light, so it is not held to the palette.
uniform mat4 u_gview; uniform vec3 u_geye, u_gd; uniform vec4 u_gw, u_gcam; uniform float u_gk, u_gtime, u_gortho; uniform vec3 u_gc[6];
// colour per pixel (a diorama's look.pixel): the solid dab in front at each pixel (u_idxTex), what it is coloured from (u_pixTex: its
// ramp, how lit, its pattern, the way its surface truly faces), its middle (u_data); the camera, to meet each pixel's line of sight
// with the dab's plane; the patterns and ramps. The pixel is coloured at that exact place, its light the mean of the pixels round
// it on the same ramp and surface, and a stone, tile or board's edge is drawn where the cell changes from this pixel to the next
uniform highp sampler2D u_idxTex, u_pixTex, u_dat; uniform float u_pixOn, u_tanF, u_asp, u_fpG, u_ol, u_olEps, u_olGap, u_ptime, u_portho, u_shape; uniform int u_olK; uniform mat4 u_pview; uniform vec3 u_peye;
uniform vec4 u_patK4[8], u_patP[128], u_rmp4[128], u_rmpN4[16]; uniform float u_detail;
int jm2(int v) { return v - 2 * int(trunc(float(v) * 0.5)); }   // (v % 2 as script does it, negative for a negative odd v)
int dabAt(ivec2 q) { ivec2 s = textureSize(u_idxTex, 0); if (q.x < 0 || q.y < 0 || q.x >= s.x || q.y >= s.y) return -1;
  vec4 e = texelFetch(u_idxTex, q, 0) * 255.0; return int(e.r + 0.5) + int(e.g + 0.5) * 256 + int(e.b + 0.5) * 65536 - 1; }
vec4 pixA(int i) { return texelFetch(u_pixTex, ivec2((i & 1023) * 2, i >> 10), 0); }
vec4 pixB(int i) { return texelFetch(u_pixTex, ivec2((i & 1023) * 2 + 1, i >> 10), 0); }
uint hsh(int i, int j, int k, int s) { uint h = uint(i) * 374761393u + uint(j) * 668265263u + uint(k) * 1440662683u + uint(s) * 1274126177u;
  h = (h ^ (h >> 13u)) * 1274126177u; h ^= h >> 16u; h *= 2246822519u; h ^= h >> 13u; return h; }
float hsf(int i, int j, int k, int s) { return float(hsh(i, j, k, s)) / 4294967296.0; }
int rlen(int r) { return int(u_rmpN4[r >> 2][r & 3] + 0.5) & 15; }
bool lineOff(int r) { return (int(u_rmpN4[r >> 2][r & 3] + 0.5) & 16) != 0; }
// two ramps of one material (its shade ramp and its lit one share colours where they meet): not an edge between things
bool sameStuff(int a, int b) { return a == b || (int(u_rmpN4[a >> 2][a & 3] + 0.5) >> 5) == (int(u_rmpN4[b >> 2][b & 3] + 0.5) >> 5); }
int rampAt(int r, int b) { int x = r * 8 + clamp(b, 0, rlen(r) - 1); return int(u_rmp4[x >> 2][x & 3] + 0.5); }
int bandOf(int r, float t) { return clamp(int(floor(t * float(rlen(r)))), 0, rlen(r) - 1); }
float lvl(float px0, float fp) { return fp > 0.0 ? px0 * exp2(floor(log2(fp / px0) + 0.5)) : px0; }
// where this pixel's line of sight meets the plane of dab i, and how big a screen pixel is there
vec4 hitOf(ivec2 q, int i, vec3 n) { ivec2 sz = textureSize(u_idxTex, 0);
  vec3 v = vec3(((float(q.x) + 0.5) / float(sz.x) * 2.0 - 1.0) * u_tanF * u_asp, ((float(q.y) + 0.5) / float(sz.y) * 2.0 - 1.0) * u_tanF, -1.0);
  // (orthographic: each line of sight starts at its own point on the picture's plane and all run straight ahead)
  vec3 o0 = u_portho > 0.5 ? u_peye + transpose(mat3(u_pview)) * vec3(v.xy, 0.0) : u_peye;
  vec3 d = transpose(mat3(u_pview)) * (u_portho > 0.5 ? vec3(0.0, 0.0, -1.0) : v); vec3 c = texelFetch(u_dat, ivec2((i & 511) << 2, i >> 9), 0).xyz;
  float den = dot(n, d), s = abs(den) > 1e-6 ? dot(n, c - o0) / den : 0.0;
  // (a pixel's size on the surface, for the pattern's level: the same over a whole face, from the camera's distance and the face's slant)
  float ce = abs(dot(n, vec3(u_pview[0][2], u_pview[1][2], u_pview[2][2])));
  return s > 0.0 ? vec4(o0 + d * s, u_fpG / max(0.3, ce)) : vec4(c, 0.0); }
// a pattern's cell where the pixel lands (the same over one stone, tile or board), and the colours of its body and edges
struct Cell { ivec3 key, sel; int body, below, above, left; };
ivec2 g_q;   // (the pixel being coloured, for patterns drawn as upright pixel pictures)
float g_fp;   // (and the size of a screen pixel on its surface)
/* points pinned to the world, nested over detail levels. Level L's cells (a size times 2^L) each show one point: the one its chosen
   child shows, and so down to the finest level (LMIN). So a point shown at one level is shown at every finer one, in the same place:
   zooming out takes points away one by one (between L and L + 1 the cells not chosen by their parent go, each at its own moment)
   and zooming in brings them back; none ever moves */
const int LMIN = -2;
bool shown2(ivec2 c, int L, float f, int sd) { ivec2 pa = ivec2(floor(vec2(c) * 0.5)); int ch = int(hsf(pa.x, pa.y, 21 + L, sd) * 4.0);
  return c - pa * 2 == ivec2(ch & 1, ch >> 1) || hsf(c.x, c.y, 41 + L, sd) >= f; }
ivec2 atom2(ivec2 c, int L, int sd) { for (int l = 0; l < 8; l++) { if (L - l <= LMIN) break; int ch = int(hsf(c.x, c.y, 20 + L - l, sd) * 4.0); c = c * 2 + ivec2(ch & 1, ch >> 1); } return c; }
bool shown3(ivec3 c, int L, float f, int sd) { ivec3 pa = ivec3(floor(vec3(c) * 0.5)); int ch = int(hsf(pa.x + 7 * pa.z, pa.y, 21 + L, sd) * 8.0);
  return c - pa * 2 == ivec3(ch & 1, (ch >> 1) & 1, ch >> 2) || hsf(c.x + 7 * c.z, c.y, 41 + L, sd) >= f; }
ivec3 atom3(ivec3 c, int L, int sd) { for (int l = 0; l < 8; l++) { if (L - l <= LMIN) break; int ch = int(hsf(c.x + 7 * c.z, c.y, 20 + L - l, sd) * 8.0); c = c * 2 + ivec3(ch & 1, (ch >> 1) & 1, ch >> 2); } return c; }
// (the level for a surface's pixel size: L and how far toward L + 1)
int nestL(float p, out float f) { float lam = clamp(log2(max(g_fp, 1e-6) / p), float(LMIN), 4.0); int L = int(floor(lam)); f = lam - float(L); return L; }
const int TUFTS[6] = int[6](17732, 4782, 324, 11118, 2700, 8524); const int LEAFM[4] = int[4](2274, 4812, 10692, 5312); const int CLUMPS[4] = int[4](42975166, 17211164, 38797084, 9150366); const int NEEDLES[4] = int[4](21956, 3268, 24964, 10368); const int CRACKS[4] = int[4](1100, 4289, 368, 192); const int RIPPLES[4] = int[4](14, 108, 7, 22);
vec3 unfoldN(vec2 q, vec3 dflt) { if (q.x > 8.0) return dflt; float y = 1.0 - abs(q.x) - abs(q.y); vec2 xz = q;
  if (y < 0.0) xz = (1.0 - abs(q.yx)) * vec2(q.x >= 0.0 ? 1.0 : -1.0, q.y >= 0.0 ? 1.0 : -1.0); return normalize(vec3(xz.x, y, xz.y)); }
Cell cellAtL(int k, int r, vec3 P, vec3 n, vec3 fn, float t, float p) {
  Cell C; C.key = ivec3(-99999); C.sel = ivec3(0); int b = bandOf(r, t); C.body = rampAt(r, b); C.below = C.body; C.above = C.body; C.left = C.body;
  int kind = int(u_patK4[k >> 2][k & 3] + 0.5); vec4 a = u_patP[k * 4], e = u_patP[k * 4 + 1]; int sd = int(e.x + 0.5);
  if (kind == 1) {   // stones in courses
    float sl = a.x * p, sh = a.y * p; vec3 uvf = abs(n.y) > 0.7 ? vec3(P.x, P.z, 0.0) : abs(n.x) > abs(n.z) ? vec3(P.z * sign(n.x == 0.0 ? 1.0 : n.x), P.y, 1.0) : vec3(-P.x * sign(n.z == 0.0 ? 1.0 : n.z), P.y, 2.0);
    int face = int(uvf.z), row = int(floor(uvf.y / sh)); float off = float(jm2(row)) * 0.5 * sl + hsf(row, face, 0, sd) * sl * 0.3;
    int slot = int(floor((uvf.x + off) / sl)); float su = uvf.x + off - float(slot) * sl;
    bool halfS = hsf(slot, row, face, sd + 9) > 0.86, keepS = hsf(slot, row, face, sd + 7) > 0.28; int col;
    if (halfS && su > sl * 0.5) col = slot * 2 + 1; else if (keepS) col = slot * 2;
    else { int s2 = slot - 1; col = s2 * 2; for (int g = 0; g < 4; g++) { if (hsf(s2, row, face, sd + 9) > 0.86) { col = s2 * 2 + 1; break; } if (hsf(s2, row, face, sd + 7) > 0.28 || g == 3) { col = s2 * 2; break; } s2--; } }
    float hv = hsf(col, row, face, sd + 3); int dd = hv < a.w * 0.6 ? -1 : hv > 1.0 - a.w * 0.4 ? 1 : 0; int n0 = rlen(r);
    C.body = rampAt(r, b + dd); C.below = rampAt(r, b - int(a.z + 0.5)); C.left = C.below; C.above = rampAt(r, b + dd + (b < n0 - 1 ? 1 : 0));
    C.key = ivec3(face, row, col);
  } else if (kind == 2) {   // boards
    float w = a.x * p; int ax = int(a.y + 0.5); float al = ax == 0 ? P.x : ax == 1 ? P.z : P.y;
    float cc = ax == 2 ? (abs(n.x) > abs(n.z) ? P.z : P.x) : abs(n.y) > 0.7 ? (ax == 0 ? P.z : P.x) : P.y;
    int k0 = int(floor(cc / w)); bool wide = hsf(k0, 9, 0, sd) < 0.3; int kk = wide && jm2(k0) != 0 ? k0 - 1 : k0;
    float len = (6.0 + 10.0 * hsf(kk, 0, 0, sd)) * p * 4.0, ee = al + hsf(kk, 1, 0, sd) * len; int seg = int(floor(ee / len));
    C.body = rampAt(r, b + (hsf(kk, seg, 4, sd) < 0.2 ? -1 : 0)); C.below = rampAt(r, b - 2); C.left = C.below; C.above = C.body;
    C.key = ivec3(kk, seg, 0);
  } else if (kind == 3) {   // tiles: the lower edge a lit lip, the upper edge in the row above's shadow, the sides seams
    float tw = a.x * p, th = a.y * p, u = abs(n.x) > abs(n.z) ? P.z : P.x; int row = int(floor(P.y / th));
    float off = float(jm2(row)) * 0.5 * tw; int col = int(floor((u + off) / tw));
    C.body = rampAt(r, b + (hsf(col, row, 0, sd) < 0.08 ? -1 : 0)); C.below = rampAt(r, b + 1); C.above = rampAt(r, b - 2);
    C.left = P.y - float(row) * th < th * 0.5 ? rampAt(r, b - 1) : C.body;   // (seams only on a tile's lower half: shingles, not a grid)
    C.key = ivec3(row, col, 1);
  } else if (kind == 6) {   // thatch: courses along the eaves, bundles shading them, ragged feet; a course is one cell
    float ch = a.x * p, bw = a.y * p, u = abs(n.x) > abs(n.z) ? P.z : P.x; int row = int(floor(P.y / ch)); float f = P.y - float(row) * ch;
    int cU = int(floor((u + hsf(row + 1, 0, 2, sd) * bw) / bw)); float sagU = floor(hsf(cU, row + 1, 1, sd) * (a.z + 0.999)) * p; int col;
    if (f >= ch - sagU) { row++; col = cU; } else col = int(floor((u + hsf(row, 0, 2, sd) * bw) / bw));
    float hv = hsf(col, row, 3, sd); int dd = hv < 0.28 ? -1 : hv > 0.82 ? 1 : 0;
    C.body = rampAt(r, b + dd); C.below = rampAt(r, b + 1); C.above = rampAt(r, b - 2); C.left = rampAt(r, b - 1);
    C.key = ivec3(row, 0, 6);
  } else if (kind == 5) {   // leaves: clusters round Worley points, each lit as a dome and as the crown's shape: scalloped band edges
    float cl = a.x * p; vec3 g = P / cl; ivec3 ig = ivec3(floor(g)); float best = 1e9; vec3 fq = vec3(0.0);
    for (int kz = -1; kz <= 1; kz++) for (int ky = -1; ky <= 1; ky++) for (int kx = -1; kx <= 1; kx++) { ivec3 c3 = ig + ivec3(kx, ky, kz);
      vec3 q = vec3(c3) + 0.15 + 0.7 * vec3(hsf(c3.x, c3.y, c3.z, sd), hsf(c3.x, c3.y, c3.z, sd + 1), hsf(c3.x, c3.y, c3.z, sd + 2)); vec3 dq = q - g; float d2 = dot(dq, dq);
      if (d2 < best) { best = d2; fq = q; } }
    vec3 L = e.yzw, dd = normalize(P - fq * cl), nc = normalize(fn * (1.0 - a.y) + dd * a.y);
    float t2 = t + a.z * (max(0.0, dot(nc, L)) - max(0.0, dot(fn, L))); int b2 = bandOf(r, t2), body = rampAt(r, b2);
    // leaf marks: little upright pixel pictures of leaves at points over the crown, darker in the light and lighter in the shade
    if (a.w > 0.0) { float fr; int L = nestL(p, fr); float mc = u_patP[k * 4 + 2].x * p * exp2(float(L)), mA = u_patP[k * 4 + 2].x * p * exp2(float(LMIN)); ivec3 mg = ivec3(floor(P / mc)); int best = -9, col = -1; ivec2 sz = textureSize(u_idxTex, 0); mat3 V = mat3(u_pview);
      for (int kz = -1; kz <= 1; kz++) for (int ky = -1; ky <= 1; ky++) for (int kx = -1; kx <= 1; kx++) { ivec3 cL = mg + ivec3(kx, ky, kz); if (!shown3(cL, L, fr, sd)) continue; ivec3 c3 = atom3(cL, L, sd);
        if (hsf(c3.x, c3.y, c3.z, sd + 5) > a.w) continue;
        vec3 Q = (vec3(c3) + 0.15 + 0.7 * vec3(hsf(c3.x, c3.y, c3.z, sd), hsf(c3.x, c3.y, c3.z, sd + 1), hsf(c3.x, c3.y, c3.z, sd + 2))) * mA;
        if (dot(Q - P, Q - P) > mc * mc * 1.5) continue;
        vec3 vs = V * (Q - u_peye); float iw = u_portho > 0.5 ? 1.0 : 1.0 / max(-vs.z, 1e-6);
        vec2 sc = vec2((vs.x * iw / (u_tanF * u_asp) + 1.0) * 0.5 * float(sz.x) - 0.5, (vs.y * iw / u_tanF + 1.0) * 0.5 * float(sz.y) - 0.5);
        int ox = int(floor(float(g_q.x) - sc.x + 0.5)), oy = int(floor(float(g_q.y) - sc.y + 0.5));
        if (abs(ox) > 2 || oy < 0 || oy > 2 || oy <= best) continue;
        int m = LEAFM[int(hsf(c3.x, c3.y, c3.z, sd + 6) * 4.0) % 4]; if (((m >> (oy * 5 + ox + 2)) & 1) == 0) continue;
        best = oy; col = rampAt(r, b2 + (float(b2) >= float(rlen(r)) * 0.5 ? -1 : 1)); }
      if (col >= 0) body = col; }
    C.body = body; C.below = body; C.above = body; C.left = body; C.key = ivec3(floor(fq));
  } else if (kind == 7) {   // turf: an even ground (darker in big patches) scattered with upright tufts, each a little pixel picture anchored to the ground
    float ps = a.z, pn = sin(P.x / ps + 1.3 * sin(P.z / (ps * 1.7))) * sin(P.z / ps + 0.9 * sin(P.x / (ps * 1.3)));
    float fr; int L = nestL(p, fr); float cl = a.x * p * exp2(float(L)), cA = a.x * p * exp2(float(LMIN));
    int bb = max(0, b - (pn > 0.55 ? 1 : 0) + int(floor(e.z + 0.5))), body = rampAt(r, bb); int ix = int(floor(P.x / cl)), iz = int(floor(P.z / cl));
    if (n.y >= 0.5) {
      int d = bb <= rlen(r) - 2 ? 1 : -1, best = -9, col = -1, nf = int(a.w + 0.5); bool shade = false; vec4 F0 = u_patP[k * 4 + 2], F1 = u_patP[k * 4 + 3];
      ivec2 sz = textureSize(u_idxTex, 0); mat3 V = mat3(u_pview);
      for (int kz = -1; kz <= 1; kz++) for (int kx = -1; kx <= 1; kx++) { ivec2 c2 = ivec2(ix + kx, iz + kz); if (!shown2(c2, L, fr, sd)) continue;
        ivec2 at2 = atom2(c2, L, sd); int ax = at2.x, cz = at2.y;
        if (hsf(ax, cz, 4, sd) > a.y) continue;
        vec2 qw = vec2((float(ax) + 0.15 + 0.7 * hsf(ax, cz, 0, sd)) * cA, (float(cz) + 0.15 + 0.7 * hsf(ax, cz, 1, sd)) * cA);
        vec3 vs = V * (vec3(qw.x, P.y, qw.y) - u_peye); float iw = u_portho > 0.5 ? 1.0 : 1.0 / max(-vs.z, 1e-6);
        vec2 sc = vec2((vs.x * iw / (u_tanF * u_asp) + 1.0) * 0.5 * float(sz.x) - 0.5, (vs.y * iw / u_tanF + 1.0) * 0.5 * float(sz.y) - 0.5);
        int oy = int(floor(float(g_q.y) - sc.y + 0.5));
        int lean = e.w > 0.5 && oy >= 2 && sin(u_ptime * 1.5 - (qw.x * 0.8 + qw.y * 0.6) * 3.0) > 0.5 ? 1 : 0;   // (gusts over the lawn: tops lean a pixel)
        int ox = int(floor(float(g_q.x) - sc.x + 0.5)) - lean;
        if (hsf(ax, cz, 8, sd) < e.y) {   // (a clump: bigger, a step lighter, its top two, a dark line under it)
          if (oy == -1 && abs(ox) <= 2) shade = true;
          if (abs(ox) > 3 || oy < 0 || oy > 3 || oy <= best) continue;
          int m = CLUMPS[int(hsf(ax, cz, 6, sd) * 4.0) % 4], bit = oy * 7 + ox + 3; if (((m >> bit) & 1) == 0) continue;
          best = oy; col = rampAt(r, bb + (d > 0 ? (oy == 3 || ((m >> (bit + 7)) & 1) == 0 ? 2 : 1) : d)); continue; }
        if (oy == -1 && abs(ox) <= 1) shade = true;
        if (abs(ox) > 2 || oy < 0 || oy > 2 || oy <= best) continue;
        float hf = hsf(ax, cz, 5, sd); int fl = -1; if (nf > 0 && hf < F0.y) fl = 0; else if (nf > 1 && hf < F0.y + F1.x) fl = 1;
        int m = fl >= 0 ? 4548 : TUFTS[int(hsf(ax, cz, 6, sd) * 6.0) % 6];
        if (((m >> (oy * 5 + ox + 2)) & 1) == 0) continue;
        best = oy;
        if (fl == 0) col = int((ox == 0 && oy == 1 ? F0.z : F0.x) + 0.5); else if (fl == 1) col = int((ox == 0 && oy == 1 ? F1.y : F0.w) + 0.5);
        else col = rampAt(r, bb + (oy == 2 && d > 0 ? 2 : d)); }
      if (col >= 0) body = col; else if (shade) body = rampAt(r, bb - 1);
    }
    C.body = body; C.below = body; C.above = body; C.left = body; C.sel = ivec3(0, 0, 7);
  } else if (kind == 9) {   // needles: a conifer's tier lit as its cone, needle marks a step lighter, dark under the tier above
    int body = C.body; float fr; int L = nestL(p, fr); float mc = a.z * p * exp2(float(L)), mA = a.z * p * exp2(float(LMIN)); ivec3 mg = ivec3(floor(P / mc)); int best = -9; ivec2 sz = textureSize(u_idxTex, 0); mat3 V = mat3(u_pview);
    for (int kz = -1; kz <= 1; kz++) for (int ky = -1; ky <= 1; ky++) for (int kx = -1; kx <= 1; kx++) { ivec3 cL = mg + ivec3(kx, ky, kz); if (!shown3(cL, L, fr, sd)) continue; ivec3 c3 = atom3(cL, L, sd);
      if (hsf(c3.x, c3.y, c3.z, sd + 5) > a.y) continue;
      vec3 Q = (vec3(c3) + 0.15 + 0.7 * vec3(hsf(c3.x, c3.y, c3.z, sd), hsf(c3.x, c3.y, c3.z, sd + 1), hsf(c3.x, c3.y, c3.z, sd + 2))) * mA;
      if (dot(Q - P, Q - P) > mc * mc * 1.5) continue;
      vec3 vs = V * (Q - u_peye); float iw = u_portho > 0.5 ? 1.0 : 1.0 / max(-vs.z, 1e-6);
      vec2 sc = vec2((vs.x * iw / (u_tanF * u_asp) + 1.0) * 0.5 * float(sz.x) - 0.5, (vs.y * iw / u_tanF + 1.0) * 0.5 * float(sz.y) - 0.5);
      int ox = int(floor(float(g_q.x) - sc.x + 0.5)), oy = int(floor(float(g_q.y) - sc.y + 0.5));
      if (abs(ox) > 2 || oy < 0 || oy > 2 || oy <= best) continue;
      int m = NEEDLES[int(hsf(c3.x, c3.y, c3.z, sd + 6) * 4.0) % 4]; if (((m >> (oy * 5 + ox + 2)) & 1) == 0) continue;
      best = oy; body = rampAt(r, b + (b >= rlen(r) - 1 ? -1 : 1)); }
    C.body = body; C.below = body; C.left = body; C.above = rampAt(r, b - 2); C.key = ivec3(int(a.x + 0.5), 0, 9);
  } else if (kind == 10) {   // rock: plain stone with upright marks of cracks (two steps darker) and now and then a pebble of light
    int body = C.body; float fr; int L = nestL(p, fr); float mc = a.x * p * exp2(float(L)), mA = a.x * p * exp2(float(LMIN)); ivec3 mg = ivec3(floor(P / mc)); int best = -9; ivec2 sz = textureSize(u_idxTex, 0); mat3 V = mat3(u_pview);
    for (int kz = -1; kz <= 1; kz++) for (int ky = -1; ky <= 1; ky++) for (int kx = -1; kx <= 1; kx++) { ivec3 cL = mg + ivec3(kx, ky, kz); if (!shown3(cL, L, fr, sd)) continue; ivec3 c3 = atom3(cL, L, sd);
      if (hsf(c3.x, c3.y, c3.z, sd + 5) > a.y) continue;
      vec3 Q = (vec3(c3) + 0.15 + 0.7 * vec3(hsf(c3.x, c3.y, c3.z, sd), hsf(c3.x, c3.y, c3.z, sd + 1), hsf(c3.x, c3.y, c3.z, sd + 2))) * mA;
      if (dot(Q - P, Q - P) > mc * mc * 1.5) continue;
      vec3 vs = V * (Q - u_peye); float iw = u_portho > 0.5 ? 1.0 : 1.0 / max(-vs.z, 1e-6);
      vec2 sc = vec2((vs.x * iw / (u_tanF * u_asp) + 1.0) * 0.5 * float(sz.x) - 0.5, (vs.y * iw / u_tanF + 1.0) * 0.5 * float(sz.y) - 0.5);
      int ox = int(floor(float(g_q.x) - sc.x + 0.5)), oy = int(floor(float(g_q.y) - sc.y + 0.5));
      if (abs(ox) > 2 || oy < 0 || oy > 2 || oy <= best) continue;
      int mi = int(hsf(c3.x, c3.y, c3.z, sd + 6) * 4.0) % 4; if (((CRACKS[mi] >> (oy * 5 + ox + 2)) & 1) == 0) continue;
      best = oy; body = rampAt(r, b + (mi == 3 ? 1 : -2)); }
    C.body = body; C.below = body; C.above = body; C.left = body;
  } else if (kind == 8) {   // water: its own colour as it was made (shallows, foam), with ripples twinkling on it
    float fr; int L = nestL(p, fr); float cl = a.x * p * exp2(float(L)), cA = a.x * p * exp2(float(LMIN));
    C.body = -2; int ix = int(floor(P.x / cl)), iz = int(floor(P.z / cl)); C.sel = ivec3(0, 0, 8);
    ivec2 sz = textureSize(u_idxTex, 0); mat3 V = mat3(u_pview);
    for (int kz = -1; kz <= 1; kz++) for (int kx = -1; kx <= 1; kx++) { ivec2 c2 = ivec2(ix + kx, iz + kz); if (!shown2(c2, L, fr, sd)) continue;
      ivec2 at2 = atom2(c2, L, sd); int ax = at2.x, cz = at2.y;
      if (hsf(ax, cz, 4, sd) > a.y) continue; float ph = u_ptime * a.z + hsf(ax, cz, 7, sd); if (fract(ph) > 0.6) continue;
      vec3 vs = V * (vec3((float(ax) + 0.15 + 0.7 * hsf(ax, cz, 0, sd)) * cA, P.y, (float(cz) + 0.15 + 0.7 * hsf(ax, cz, 1, sd)) * cA) - u_peye); float iw = u_portho > 0.5 ? 1.0 : 1.0 / max(-vs.z, 1e-6);
      vec2 sc = vec2((vs.x * iw / (u_tanF * u_asp) + 1.0) * 0.5 * float(sz.x) - 0.5, (vs.y * iw / u_tanF + 1.0) * 0.5 * float(sz.y) - 0.5);
      int ox = int(floor(float(g_q.x) - sc.x + 0.5)), oy = int(floor(float(g_q.y) - sc.y + 0.5)), m = RIPPLES[int(hsf(ax, cz, 6, sd) * 4.0) % 4];
      if (abs(ox) <= 2 && oy >= 0 && oy <= 1 && ((m >> (oy * 5 + ox + 2)) & 1) != 0) { C.body = rampAt(r, b + 2); break; } }
    C.below = C.body; C.above = C.body; C.left = C.body;
  } else if (kind == 4) {   // grass: darker patches, tufts, flowers
    float ps = a.z, pn = sin(P.x / ps + 1.3 * sin(P.z / (ps * 1.7))) * sin(P.z / ps + 0.9 * sin(P.x / (ps * 1.3)));
    int bb = pn > 0.55 ? max(0, b - 1) : b; float cl = a.y * p; int ii = int(floor(P.x / cl)), kz = int(floor(P.z / cl));
    float h = hsf(ii, kz, 0, sd), cx = (float(ii) + 0.25 + 0.5 * hsf(ii, kz, 1, sd)) * cl, cz = (float(kz) + 0.25 + 0.5 * hsf(ii, kz, 2, sd)) * cl;
    float dx = (P.x - cx) / p, dz = (P.z - cz) / p, f = 0.0; int body = rampAt(r, bb); int nf = int(a.w + 0.5);
    vec4 F0 = u_patP[k * 4 + 1], F1 = u_patP[k * 4 + 2], F2 = u_patP[k * 4 + 3];
    float fc[3] = float[3](F0.y, F1.x, F1.w), fs[3] = float[3](F0.z, F1.y, F2.x), fm[3] = float[3](F0.w, F1.z, F2.y);
    bool done = false;
    for (int q = 0; q < 3; q++) { if (q >= nf || done) break; f += fs[q];
      if (h < f) { done = true; if (abs(dx) + abs(dz) < 1.1) body = int((abs(dx) < 0.5 && abs(dz) < 0.5 ? fm[q] : fc[q]) + 0.5); } }
    if (!done && h < f + a.x && abs(dz) < 0.6 && abs(dx) < 1.6) body = rampAt(r, bb + (bb >= rlen(r) - 2 ? -1 : 1));
    C.body = body; C.below = body; C.above = body; C.left = body; C.sel = ivec3(ii, kz, 4);
  }
  if (kind != 4 && kind != 7 && kind != 8) C.sel = C.key;
  return C; }
/* a pattern's detail, pinned to the world: stones, boards, tiles and thatch keep their real size at every zoom. Seen from far, where
   a screen pixel is bigger than the pattern's own, their seams go one by one: each cell joins its neighbour (along the course first,
   then course to course), each pair at its own moment as the camera draws back, so the stones merge and nothing moves; coming back in,
   the seams come back where they were. Points drawn as little pictures (tufts, marks, cracks, ripples) are pinned the same way,
   in nested sets (shown2/shown3). g_fp carries the size of a screen pixel on the surface to them */
ivec3 mergeKey(int kind, ivec3 k, int m) { if (m <= 0) return k;
  if (kind == 1) return ivec3(k.x, k.y >> max(0, m - 1), k.z >> (m + 1));   // stones: along the course first, then courses
  if (kind == 2) return ivec3(k.x >> max(0, m - 1), k.y >> m, k.z);          // boards: their ends first, then board to board
  if (kind == 3) return ivec3(k.x >> max(0, m - 1), k.y >> m, k.z);          // tiles: along the row, then rows
  if (kind == 6) return ivec3(k.x >> m, k.y, k.z);                           // thatch: course to course
  return k; }
Cell cellOf(int k, int r, vec3 P, vec3 n, vec3 fn, float t, float fp0) {
  /* (the level of detail is one for the whole picture, from the camera's distance alone: taken from each surface's slant it would
     differ from pixel to pixel, and change as the view turns, and the details would flicker) */
  float px0 = 1.0 / u_detail, fp = u_fpG; g_fp = fp;
  Cell C = cellAtL(k, r, P, n, fn, t, px0);
  if (C.key.x != -99999 && fp > px0) { int kind = int(u_patK4[k >> 2][k & 3] + 0.5); float lam = min(log2(fp / px0), 3.99); int m = int(floor(lam));
    ivec3 kn = mergeKey(kind, C.key, m + 1); C.key = hsf(kn.x, kn.y, kn.z, 4099) < lam - float(m) ? kn : mergeKey(kind, C.key, m); }
  return C; }
/* (smoothness: the cell of every pixel is worked out once, in a pass of its own (KEY_FS), and read here for the pixels round
   each one, instead of being worked out again for each of them) */
uniform highp isampler2D u_keyTex; uniform float u_keyOn;
ivec3 keyCalc(ivec2 q);
ivec3 keyAt(ivec2 q) { if (u_keyOn > 0.5) { ivec2 s = textureSize(u_keyTex, 0); if (q.x < 0 || q.y < 0 || q.x >= s.x || q.y >= s.y) return ivec3(-99999);
    ivec4 k = texelFetch(u_keyTex, q, 0); return k.w == 1 ? k.xyz : ivec3(-99999); } return keyCalc(q); }
ivec3 keyCalc(ivec2 q) { g_q = q; int i = dabAt(q); if (i < 0) return ivec3(-99999); if ((int(texelFetch(u_dat,ivec2(((i & 511)<<2)+2,i>>9),0).w) & 32768) != 0) return ivec3(-99999); vec4 A = pixA(i); if (A.x < 0.5 || A.z < 0.5) return ivec3(-99999);
  vec4 Bq = pixB(i); vec3 n = vec3(A.w, Bq.x, Bq.y); vec4 h = hitOf(q, i, n); return cellOf(int(A.z + 0.5) - 1, int(A.x + 0.5) - 1, h.xyz, n, unfoldN(Bq.zw, n), 0.5, h.w).key; }
bool differs(ivec3 k, ivec3 q) { return q.x != -99999 && q != k; }
const ivec2 N4o[4] = ivec2[4](ivec2(-1, 0), ivec2(1, 0), ivec2(0, -1), ivec2(0, 1)); bool g_pixed = false;
/* edge sprites (K.pixel.edge, an option): drawn first in a pass of their own (SPR_VS / SPR_FS: each stands on a point pinned to its
   surface), into u_sprLayer: which cell (8 + steps from the edge's own colour, or 100 + a palette colour), ramp and band */
uniform highp sampler2D u_sprLayer; uniform float u_sprOn, u_markA; bool g_spr = false;
${u?`uniform highp sampler2D u_materialStyles;
${vu}
float materialLight(float t, int id, int rampSize, ivec2 p) {
  int code = int(texelFetch(u_materialStyles, ivec2(id & 511, id >> 9), 0).y);
  int mode = code & 7, steps = (code >> 3) & 127;
  if (mode == 0 && steps == 0) return t;
  int bands = min(steps == 0 ? rampSize : steps, rampSize) - 1;
  if (bands < 1) return t;
  float level = clamp(t, 0.0, 1.0) * float(bands);
  return (mode == 0 ? floor(level + 0.5) :
    floor(level) + float(fract(level) > pixelStyleThreshold(mode, p))) / float(bands);
}
`:""}
vec3 pixColour(ivec2 p, vec3 c) {
  int i = dabAt(p); if (i < 0) return c;
  if ((int(texelFetch(u_dat,ivec2(((i & 511)<<2)+2,i>>9),0).w) & 32768) != 0) return c; vec4 A = pixA(i); if (A.x < 0.5) return c;
  // (only where the dab is what shows: nothing soft in front of it, no light carried onto it)
  vec4 t1 = texelFetch(u_dat, ivec2(((i & 511) << 2) + 1, i >> 9), 0); float pk = t1.w;
  vec3 baked = vec3(mod(pk, 256.0), mod(floor(pk / 256.0), 256.0), floor(pk / 65536.0)) / 255.0;
${z?`
  vec4 gain = relightAt(i);
  float fogAmount = 0.0;
  if (gain.w > 0.0) {
    if (u_relightFogRange.x < 1.0 && u_relightFogRange.y > 0.0)
      fogAmount = smoothstep(u_relightFogRange.x, 1.0, texelFetch(u_depth, p, 0).r) * u_relightFogRange.y;
    baked = mix(min(vec3(1.0), baked * gain.rgb), u_relightFog, fogAmount);
  }`:""}
${t||A?`
  vec3 center = texelFetch(u_dat, ivec2((i & 511) << 2, i >> 9), 0).xyz;
  float axial = ${t?"-(u_waterView * vec4(center, 1.0)).z":"dot(u_envEye-center,u_envBack)"};
  vec2 size = vec2(textureSize(u_scene, 0));`:""}
${t?`  vec3 mark;
  baked = waterPaint(baked, vec2(p) + 0.5, size, axial, mark);`:""}
${A?"  baked = envMedia(baked, vec2(p) + 0.5, size, axial);":""}
  if (max(abs(baked.r - c.r), max(abs(baked.g - c.g), abs(baked.b - c.b))) > 0.03) return c;
  int r = int(A.x + 0.5) - 1; float dc = texelFetch(u_depth, p, 0).r, sum = 0.0, cnt = 0.0;
  vec4 Bq = pixB(i); vec3 n = vec3(A.w, Bq.x, Bq.y);
  /* the light, smoothed over the same surface round the pixel (the same ramp, near in depth): over three by three; with the light
     shaper (an option), over seven by seven and only where the surface faces much the same way, so the light and the shade fall in a
     few big shapes with smooth edges, not wherever the light of each dab happens to cross a step */
  // (near the edge of a surface the big window is cut in half, and its mean would pull a lit rim toward the middle, shading that
  // follows the outline: there the three by three is kept, and the two are blended by how much of the big window is surface)
  bool shp = u_shape > 0.5; float s7 = 0.0, c7 = 0.0;
  for (int dy = -3; dy <= 3; dy++) for (int dx = -3; dx <= 3; dx++) { bool small = abs(dx) <= 1 && abs(dy) <= 1, wide = shp && ((dx + dy) & 1) == 0; if (!small && !wide) continue;
    ivec2 q = p + ivec2(dx, dy); int j = dabAt(q); if (j < 0) continue; vec4 Aj = pixA(j);
    if (abs(Aj.x - A.x) > 0.5 || abs(texelFetch(u_depth, q, 0).r - dc) > 0.03) continue;
    if (small) { sum += Aj.y; cnt += 1.0; }
    if (wide) { vec4 Bj = pixB(j); if (dot(n, vec3(Aj.w, Bj.x, Bj.y)) >= 0.8) { s7 += Aj.y; c7 += 1.0; } } }
  float t = cnt > 0.0 ? sum / cnt : A.y;
  if (shp && c7 > 0.0) t = mix(t, s7 / c7, smoothstep(0.5, 0.85, c7 / 25.0));
  ${u?"t = materialLight(t, i, rlen(r), p);":""}
  int ci;
  if (A.z < 0.5) ci = rampAt(r, bandOf(r, t));
  else { vec4 h = hitOf(p, i, n); g_q = p; Cell C = cellOf(int(A.z + 0.5) - 1, r, h.xyz, n, unfoldN(Bq.zw, n), t, h.w); ci = C.body;
    if (C.key.x != -99999) { if (differs(C.key, keyAt(p - ivec2(0, 1)))) ci = C.below; else if (differs(C.key, keyAt(p - ivec2(1, 0)))) ci = C.left; else if (differs(C.key, keyAt(p + ivec2(0, 1)))) ci = C.above; } }
  if (ci == -2) return c;   // (a pattern that keeps the colour the dab was made with, here and there drawn over)
  /* outlines (look.outline): at the edge of a thing, where it meets another material, the background or something well behind it,
     the nearer pixel takes a darker step of its own ramp, so each thing is ringed in its own darker colour (a lit one more softly) */
  if (u_ol > 0.5 && !lineOff(r) && dc > -0.5) { bool edge = false, sky = false;
    ivec2 omx = textureSize(u_depth, 0) - 1;
    for (int k = 0; k < 4; k++) { ivec2 q = p + N4o[k]; if (texelFetch(u_depth, q, 0).r < -0.5) continue; float dd = texelFetch(u_depth, q, 0).r - dc; if (dd <= u_olEps) continue;
      // (a break must carry on past the next pixel or two: a hole in a surface, where what lies under it shows through, is not an edge)
      if (texelFetch(u_depth, clamp(p + 2 * N4o[k], ivec2(0), omx), 0).r - dc <= u_olEps || texelFetch(u_depth, clamp(p + 3 * N4o[k], ivec2(0), omx), 0).r - dc <= u_olEps) continue;
      int j = dabAt(q); if (j < 0 || dd > u_olGap) { edge = true; sky = sky || texelFetch(u_depth, q, 0).r >= 0.995; break; } vec4 Aj = pixA(j); if (!sameStuff(int(Aj.x + 0.5) - 1, r)) { edge = true; break; } }
    // (and a crease: where its own surface turns sharply, the lit side a step lighter, the other a step darker; not in leaves or grass)
    int ck = 0; bool soft = false; if (A.z > 0.5) { int kk = int(A.z + 0.5) - 1; int kd = int(u_patK4[kk >> 2][kk & 3] + 0.5); soft = kd == 5 || kd == 7; }
    if (!edge && !soft) for (int k = 0; k < 4; k++) { ivec2 q = p + N4o[k]; int j = dabAt(q); if (j < 0) continue; vec4 Aj = pixA(j);
      if (abs(Aj.x - A.x) > 0.5 || abs(texelFetch(u_depth, q, 0).r - dc) > u_olGap) continue; vec4 Bj = pixB(j);
      if (dot(n, vec3(Aj.w, Bj.x, Bj.y)) > 0.7) continue; ck = A.y >= Aj.y ? 1 : -1; break; }
    if (edge || ck != 0) { int bb = -1; for (int k = 0; k < 8; k++) { if (k >= rlen(r)) break; if (rampAt(r, k) == ci) { bb = k; break; } }
      // (a rim in the light takes a softer line than one in shade, or none against another thing: so the outline does not darken a
      // shape all round, whichever way it faces, which is pillow shading)
      int kk2 = bb * 2 >= rlen(r) ? (sky ? 1 : 0) : u_olK;
      if (bb >= 0) ci = rampAt(r, edge ? max(0, bb - kk2) : bb + ck); } }
  g_pixed = true;
  vec3 surfaceColor = u_pal[clamp(ci,0,63)];
  ${z?"if (gain.w > 0.0) surfaceColor = mix(min(vec3(1.0), surfaceColor * gain.rgb), u_relightFog, fogAmount);":""}
  ${t?"surfaceColor = waterPaint(surfaceColor,vec2(p)+0.5,size,axial,mark);":""}
  ${A?"surfaceColor = envMedia(surfaceColor,vec2(p)+0.5,size,axial);":""}
  return surfaceColor; }
const int GPET[12] = int[12](0, 3, 1, 4, 0, 3, 2, 4, 0, 3, 1, 4); const int GOUT[6] = int[6](3, 1, 4, 2, 0, 1);
vec3 glassPane(vec2 q) {
  float r = length(q) / u_gw.w * 2.6, a = fract(atan(q.y, q.x) / 6.2831853 + 1.0);
  if (r > 2.52) return vec3(0.0); if (r < 0.5) return u_gc[5]; if (r < 0.64) return vec3(0.0);
  if (r < 1.72) { float s = a * 12.0, k = floor(s), f = s - k, w = 0.07 / r; if (f < w || f > 1.0 - w) return vec3(0.0); if (r > 1.2 && abs(f - 0.5) > 0.5 - (r - 1.2) * 0.75) return vec3(0.0); return r < 0.98 ? u_gc[5] : u_gc[GPET[int(k) % 12]]; }
  if (r < 1.86) return vec3(0.0); float s = a * 24.0 + 0.5, k = floor(s), f = s - k; if (f < 0.07 || f > 0.93) return vec3(0.0);
  return length(vec2((f - 0.5) * 0.6, (r - 2.19) * 1.25)) < 0.36 ? u_gc[GOUT[int(k) % 6]] : vec3(0.0);
}
float glassHash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float glassHaze(vec3 p) { vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(glassHash(i), glassHash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(glassHash(i + vec3(0.0, 1.0, 0.0)), glassHash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(glassHash(i + vec3(0.0, 0.0, 1.0)), glassHash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(glassHash(i + vec3(0.0, 1.0, 1.0)), glassHash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z); }
// sunlight through gaps in a canopy (a diorama's .glass with mode 'gaps', from K.dapple): each gap lets down a shaft along the light. A line
// of sight lights up by how much of a shaft it passes through, but only until it is well inside: a shaft is a flat, even band of light.
// Four looks along the part it passes through say how strong the band is there: it eases in just under its gap, thins as it goes down,
// is thicker where the haze drifts, and fades out toward the ground and toward the edge of the stand (the diorama's .glass at and r), so
// a shaft never ends on a hard line whatever it is seen from. With steps, the light is banded into that many levels, dithered only where
// one level gives way to the next, so a shaft is drawn as flat pixel tones are, with a stippled edge
uniform float u_gm, u_gq, u_gfl; uniform vec4 u_gh[24]; uniform int u_ghn;
vec3 glassGaps(vec3 c, ivec2 p, float dn, vec2 res) {
  vec2 ndc = (vec2(p) + 0.5) / res * 2.0 - 1.0; vec3 rv = u_gortho > 0.5 ? vec3(0.0, 0.0, -1.0) : normalize(vec3(ndc.x * u_gcam.x, ndc.y * u_gcam.y, -1.0)), dir = transpose(mat3(u_gview)) * rv;
  vec3 ge = u_gortho > 0.5 ? u_geye + transpose(mat3(u_gview)) * vec3(ndc.x * u_gcam.x, ndc.y * u_gcam.y, 0.0) : u_geye;   // (orthographic: parallel lines of sight)
  // (where nothing is drawn the line of sight goes on through the air: it is not stopped at the far side of the stand)
  float tmax = dn >= 0.999 ? 1e4 : (u_gcam.z + min(dn, 1.0) * (u_gcam.w - u_gcam.z)) / max(-rv.z, 0.05), sw = 0.0; vec3 sc = vec3(0.0);
  for (int i = 0; i < 24; i++) { if (i >= u_ghn) break;
    vec4 h = u_gh[i]; vec3 hc = h.xyz + vec3(sin(u_gtime * 0.7 + float(i) * 1.7), 0.0, cos(u_gtime * 0.6 + float(i) * 2.3)) * 0.05 * h.w;
    vec3 oc = ge - hc; float dd = dot(dir, u_gd), od = dot(oc, u_gd), A = 1.0 - dd * dd, Bq = dot(oc, dir) - od * dd, C = dot(oc, oc) - od * od - h.w * h.w, disc = Bq * Bq - A * C;
    if (A < 1e-5 || disc <= 0.0) continue;
    float sq = sqrt(disc), t0 = max((-Bq - sq) / A, 0.0), t1 = min((-Bq + sq) / A, tmax), lo = u_gfl - 0.6;
    if (abs(dir.y) > 1e-5) { float ty = (hc.y - ge.y) / dir.y, tf = (lo - ge.y) / dir.y; if (dir.y < 0.0) { t0 = max(t0, ty); t1 = min(t1, tf); } else { t0 = max(t0, tf); t1 = min(t1, ty); } }
    else if (ge.y > hc.y || ge.y < lo) continue;
    if (t1 <= t0) continue;
    float f = 0.0;
    for (int k = 0; k < 4; k++) { vec3 Q = ge + dir * mix(t0, t1, (float(k) + 0.5) / 4.0); float s = (hc.y - Q.y) / max(-u_gd.y, 0.05);
      f += smoothstep(0.0, 0.9, s) * smoothstep(lo, u_gfl + 0.6, Q.y) * (1.0 - smoothstep(u_gw.w * 0.72, u_gw.w, length(Q.xz - u_gw.xz))) * exp(-s * 0.09)
         * (0.8 + 0.45 * glassHaze(Q * 0.6 + vec3(u_gtime * 0.11, -u_gtime * 0.05, u_gtime * 0.07))); }
    float w = min(1.0, (t1 - t0) / (0.6 * h.w)) * f * 0.25 * (0.88 + 0.12 * sin(u_gtime * 1.3 + float(i) * 2.1));
    sc += u_gc[i - (i / 6) * 6] * w; sw += w; }
  if (sw <= 0.0) return c;
  vec3 col = sc / sw; float a = min(sw, 1.6);
  if (u_gq > 0.0) { float th = (BAYER[(p.x & 3) + ((p.y & 3) << 2)] + 0.5) / 16.0 - 0.5; a = floor(a * u_gq + 0.5 + th * 0.5) / u_gq; }   // (stippled only near a level's edge)
  return c + col * a * u_gk;
}
vec3 glassAir(vec3 c, ivec2 p, float dn, vec2 res) {
  if (u_gk <= 0.0) return c;
  if (u_gm > 0.5) return glassGaps(c, p, dn, res);
  vec2 ndc = (vec2(p) + 0.5) / res * 2.0 - 1.0; vec3 rv = u_gortho > 0.5 ? vec3(0.0, 0.0, -1.0) : normalize(vec3(ndc.x * u_gcam.x, ndc.y * u_gcam.y, -1.0)), dir = transpose(mat3(u_gview)) * rv;
  vec3 ge = u_gortho > 0.5 ? u_geye + transpose(mat3(u_gview)) * vec3(ndc.x * u_gcam.x, ndc.y * u_gcam.y, 0.0) : u_geye;   // (orthographic: parallel lines of sight)
  float tmax = (u_gcam.z + min(dn, 1.0) * (u_gcam.w - u_gcam.z)) / max(-rv.z, 0.05);
  vec3 oc = ge - u_gw.xyz; float dd = dot(dir, u_gd), od = dot(oc, u_gd), A = 1.0 - dd * dd, Bq = dot(oc, dir) - od * dd, C = dot(oc, oc) - od * od - u_gw.w * u_gw.w, disc = Bq * Bq - A * C;
  if (A < 1e-5 || disc <= 0.0) return c;
  float sq = sqrt(disc), t0 = max((-Bq - sq) / A, 0.0), t1 = min((-Bq + sq) / A, tmax), tm = -Bq / A, tw = 0.3 * sq / A; if (t1 <= t0) return c;
  // (the middle of the beam counts for most: what is seen is mainly the row of panes straight through its axis, drawn out along the light, so the
  // shafts keep their own colours side by side; the rest of the depth adds a little of everything, which is the haze)
  float jit = fract(52.9829189 * fract(dot(vec2(p), vec2(0.06711056, 0.00583715)))), dt = (t1 - t0) / 32.0, T = 1.0; vec3 sc = vec3(0.0);
  for (int i = 0; i < 32; i++) { vec3 P = ge + dir * (t0 + (float(i) + jit) * dt); float s = (P.z - u_gw.z) / u_gd.z; if (s < 0.05 || P.y < -0.05) continue;
    float dens = (0.45 + 1.0 * glassHaze(P * 0.5 + vec3(u_gtime * 0.07, -u_gtime * 0.04, u_gtime * 0.05))) * exp(-s * 0.02);
    float tt = (t0 + (float(i) + jit) * dt - tm) / tw; sc += T * glassPane(P.xy - u_gd.xy * s - u_gw.xy) * dens * dt * (0.22 + 1.9 * exp(-tt * tt)); T *= exp(-dens * dt * 0.03); }
  float lum = dot(sc, vec3(0.3, 0.55, 0.15)); sc = max(vec3(0.0), mix(vec3(lum), sc, 1.45));
  return c * mix(1.0, T, 0.7) + sc * u_gk;
}
// with coloured contours on, the inside of things comes from the picture drawn at its own size: glass bends that picture and contact shade
// darkens it here, exactly as they do in the plain look below
#define PIXEL_NATIVE
vec3 pixelNative(ivec2 p) {
  ivec2 mx = textureSize(u_crispDepth, 0) - 1; vec3 c = texelFetch(u_crispScene, p, 0).rgb; vec4 dm = texelFetch(u_crispDepth, p, 0);
  vec2 gg = vec2(texelFetch(u_crispDepth, clamp(p + ivec2(1, 0), ivec2(0), mx), 0).g - texelFetch(u_crispDepth, clamp(p - ivec2(1, 0), ivec2(0), mx), 0).g, texelFetch(u_crispDepth, clamp(p + ivec2(0, 1), ivec2(0), mx), 0).g - texelFetch(u_crispDepth, clamp(p - ivec2(0, 1), ivec2(0), mx), 0).g);
  if (dm.g + abs(gg.x) + abs(gg.y) > 0.0) c = texelFetch(u_crispScene, clamp(p + ivec2(round(gg * u_refract)), ivec2(0), mx), 0).rgb;
  if (u_ao > 0.0) { float occ = 0.0; for (int i = 0; i < 8; i++) { float dd = (dm.r - texelFetch(u_crispDepth, clamp(p + AOT[i], ivec2(0), mx), 0).r) / u_aor; if (dd > 0.08 && dd < 3.0) occ += min(1.0, dd); } c *= 1.0 - u_ao * min(1.0, occ / 4.0); }
  return c;
}
${m?`
uniform highp sampler2D u_glassBoundary, u_glassBack, u_glassThrough;
uniform vec2 u_glassRange;
uniform mat4 u_glassProjection;
float glassDepth(vec4 info) {
  return dot(floor(info.rgb*255.0+0.5),vec3(1.0,256.0,65536.0)) / 16777215.0;
}
vec3 refractContributions(ivec2 p, vec3 color) {
  vec4 front=texelFetch(u_glassBoundary,p,0);
  if (front.a==0.0) return color;
  float through=texelFetch(u_glassThrough,p,0).r;
  if (through<=0.0 || texelFetch(u_depth,p,0).g==0.0) return color;
  ivec2 mx=textureSize(u_depth,0)-1;
  vec2 delta=vec2(texelFetch(u_depth,clamp(p+ivec2(1,0),ivec2(0),mx),0).g-texelFetch(u_depth,clamp(p-ivec2(1,0),ivec2(0),mx),0).g,
    texelFetch(u_depth,clamp(p+ivec2(0,1),ivec2(0),mx),0).g-texelFetch(u_depth,clamp(p-ivec2(0,1),ivec2(0),mx),0).g);
  ivec2 source=clamp(p+ivec2(round(delta*u_refract)),ivec2(0),mx);
  if (all(equal(source,p))) return color;
  bool rear=texelFetch(u_glassBoundary,source,0).a>0.0;
  if (!rear) {
    float axial=mix(u_glassRange.x,u_glassRange.y,texelFetch(u_depth,source,0).r);
    vec4 clip=u_glassProjection*vec4(0.0,0.0,-axial,1.0);
    if (clip.z/clip.w*0.5+0.5 < glassDepth(front)) return color;
  }
  vec3 shifted=rear?texelFetch(u_glassBack,source,0).rgb:texelFetch(u_scene,source,0).rgb;
  return clamp(color + (shifted-texelFetch(u_glassBack,p,0).rgb)*through,0.0,1.0);
}`:""}
${e.glsl}
${n?Of(p):""}
// a hole a pixel across in a surface (its dabs, seen nearly edge on, leave gaps, and what lies under it or far behind shows through, as
// dark broken lines across the ground): it is drawn as the nearer of the pixels either side of it, which lie on the surface
ivec2 holeFill(ivec2 p) { ivec2 ms = textureSize(u_depth, 0) - 1; float d0 = texelFetch(u_depth, p, 0).r;
  // (colour per pixel knows which dab is in front at each pixel: a pixel with none, between two that have one, is a hole whatever the
  // depths say: dabs left out of outlines write none)
  if (u_pixOn > 0.5 && dabAt(p) < 0) for (int ax = 0; ax < 2; ax++) { ivec2 o = ax == 0 ? ivec2(0, 1) : ivec2(1, 0); if (dabAt(p + o) >= 0 && dabAt(p - o) >= 0) return p + o; }
  for (int ax = 0; ax < 2; ax++) { ivec2 o = ax == 0 ? ivec2(0, 1) : ivec2(1, 0), qa = clamp(p + o, ivec2(0), ms), qb = clamp(p - o, ivec2(0), ms);
    float da = texelFetch(u_depth, qa, 0).r, db = texelFetch(u_depth, qb, 0).r, gap = d0 - max(da, db);
    if (min(d0, min(da, db)) > -0.5 && gap > 0.004 && abs(da - db) < 0.6 * gap) return da < db ? qa : qb; }
  return p; }
// the finished colour of one pixel of the picture, in whichever look is on
vec3 plainAt(ivec2 p) {
  p = holeFill(p);
  vec3 c = texelFetch(u_scene, p, 0).rgb;
  ${m?"c = refractContributions(p,c);":""}
  g_pixed = false;
  if (u_pixOn > 0.5) { if (u_sprOn > 0.5) {
${t||A||z?"      vec4 sl = texelFetch(u_sprLayer, p, 0); if (sl.a > 0.5) { g_spr = true; g_pixed = true; return sl.rgb; }":"      vec4 sl = texelFetch(u_sprLayer, p, 0) * 255.0; if (sl.a > 127.0) { int v = int(sl.r + 0.5), ci = v >= 100 ? v - 100 : rampAt(int(sl.g + 0.5), int(sl.b + 0.5) + v - 8); g_spr = true; g_pixed = true; return u_pal[clamp(ci, 0, 63)]; }"} }
    if (u_paintOn) {
      vec3 paint = texelFetch(u_crispScene, p, 0).rgb;
      float through = 1.0 - texelFetch(u_crispDepth, p, 0).r;
      if (through > 0.01) {
        vec3 base = pixColour(p, clamp((c - paint) / through, 0.0, 1.0));
        if (g_pixed) c = paint + base * through;
      }
    } else c = pixColour(p, c);
  }
  // outline: this pixel sits clearly behind a neighbour, so it is the edge of something nearer
  ivec2 mx = textureSize(u_depth, 0) - 1;
  float dc = texelFetch(u_depth, p, 0).r;
  float dl = texelFetch(u_depth, clamp(p - ivec2(1, 0), ivec2(0), mx), 0).r, dr = texelFetch(u_depth, clamp(p + ivec2(1, 0), ivec2(0), mx), 0).r;
  float du = texelFetch(u_depth, clamp(p + ivec2(0, 1), ivec2(0), mx), 0).r, db = texelFetch(u_depth, clamp(p - ivec2(0, 1), ivec2(0), mx), 0).r;
  // glass bends what is behind it: the picture is looked up a little to one side, by how the thickness of glass changes across this pixel
  ${c?"":`{ vec2 gg = vec2(texelFetch(u_depth, clamp(p + ivec2(1, 0), ivec2(0), mx), 0).g - texelFetch(u_depth, clamp(p - ivec2(1, 0), ivec2(0), mx), 0).g, texelFetch(u_depth, clamp(p + ivec2(0, 1), ivec2(0), mx), 0).g - texelFetch(u_depth, clamp(p - ivec2(0, 1), ivec2(0), mx), 0).g);
    if (texelFetch(u_depth, p, 0).g + abs(gg.x) + abs(gg.y) > 0.0) c = texelFetch(u_scene, clamp(p + ivec2(round(gg * u_refract)), ivec2(0), mx), 0).rgb; }`}
  // where a diorama asks for it, a pixel with nearer things close round it is shaded: what moves still sits in its own shadow
  if (u_ao > 0.0) { float occ = 0.0;
    for (int i = 0; i < 8; i++) { float dd = (dc - texelFetch(u_depth, clamp(p + AOT[i], ivec2(0), mx), 0).r) / u_aor; if (dd > 0.08 && dd < 3.0) occ += min(1.0, dd); } c *= 1.0 - u_ao * min(1.0, occ / 4.0); }
  // part lines (a diorama's look.lines): the near side of a break in depth takes a darker shade of its own colour, or a lighter one
  // where the break is toward the light (up or to the left), as pixel art outlines a thing. (Second differences, so a floor that
  // only recedes is not a break)
  float dl2 = texelFetch(u_depth, clamp(p - ivec2(2, 0), ivec2(0), mx), 0).r, dr2 = texelFetch(u_depth, clamp(p + ivec2(2, 0), ivec2(0), mx), 0).r;
  float du2 = texelFetch(u_depth, clamp(p + ivec2(0, 2), ivec2(0), mx), 0).r, db2 = texelFetch(u_depth, clamp(p - ivec2(0, 2), ivec2(0), mx), 0).r;
  // (a dab left out of outlines writes no depth, -1: a neighbour like that is taken as level with this pixel, and such a pixel takes
  // no line, so where one ground that is left out meets one that is not, no line runs along the seam)
  if (dl < -0.5) dl = dc; if (dr < -0.5) dr = dc; if (du < -0.5) du = dc; if (db < -0.5) db = dc; if (dl2 < -0.5) dl2 = dc; if (dr2 < -0.5) dr2 = dc; if (du2 < -0.5) du2 = dc; if (db2 < -0.5) db2 = dc;
  // (a break in depth must show two pixels out as well as one: a hole in a surface, a pixel wide, where what lies under it shows
  // through, is not the edge of anything)
  if (u_lines > 0.0 && dc > -0.5 && !(g_pixed && u_ol > 0.5)) { float sx = min(dl + dr, dl2 + dr2) - 2.0 * dc, sy = min(du + db, du2 + db2) - 2.0 * dc;
    if (max(sx, sy) > u_lineGap) { bool litSide = sx >= sy ? dl > dr : du > db; c *= litSide ? u_lineLit : u_lineK; } }
  float dm = dc - max(2.0 * dc - min(dl + dr, dl2 + dr2), 2.0 * dc - min(du + db, du2 + db2));   // second difference, so a receding floor is not an edge
  if (u_edge > 0.0 && dc > -0.5 && dc - dm > u_edge) {
    if (u_remapLine > 0) return glassAir(u_out[u_remapLine - 1], p, dc, vec2(textureSize(u_depth, 0)));
    c = u_line;
  }
  ${c?"return glassAir(c, p, dc, vec2(textureSize(u_depth, 0)));":""}
  ${c?"":"else {"}
${n?"    vec3 constrained; if (constrainPalette(p, c, constrained)) { g_constrained = true; return constrained; }":""}
    float th = (BAYER[(p.x & 3) + ((p.y & 3) << 2)] + 0.5) / 16.0 - 0.5;
    c = clamp(c + th * u_dither, 0.0, 1.0);
  ${c?"":"}"}
  if (u_toneOn > 0.5) { float lu = dot(c, vec3(0.30, 0.55, 0.15)); if (lu <= u_toneCut) return vec3(0.0);
    float v = (lu - u_toneCut) / (1.0 - u_toneCut); int lo = 0; for (int i = 0; i < 46; i++) { if (lo >= u_toneN - 2 || v <= texelFetch(u_toneStops, ivec2(lo + 1, 0), 0).a) break; lo++; }
    vec4 s0 = texelFetch(u_toneStops, ivec2(lo, 0), 0), s1 = texelFetch(u_toneStops, ivec2(lo + 1, 0), 0); ivec2 th = ${T?"u_toneThSize":"textureSize(u_toneTh, 0)"}, sz = textureSize(u_depth, 0);
    ivec2 rankAt = ivec2(p.x % th.x, (sz.y - 1 - p.y) % th.y);
    float share = (v - s0.a) / max(1e-5, s1.a - s0.a),
      rank = ${T?"texelFetch(u_toneStops, rankAt + ivec2(0, 1), 0).r":"texelFetch(u_toneTh, rankAt, 0).r"};
    return share >= 0.5 + (rank - 0.5) * u_toneAmt ? s1.rgb : s0.rgb; }
  vec3 best = u_pal[0]; float bd = 1e9; int bi = 0;
  for (int i = 0; i < 64; i++) {
    if (i >= u_n) break;
    vec3 df = c - u_pal[i];
    float d = u_luma > 0.5 ? abs(dot(df, vec3(0.299, 0.587, 0.114))) : dot(df * df, vec3(0.30, 0.55, 0.15));
    if (d < bd) { bd = d; best = u_pal[i]; bi = i; }
  }
  bool lit = texelFetch(u_depth, p, 0).b > 0.3 + ((BAYER[(p.x & 3) + ((p.y & 3) << 2)] + 0.5) / 16.0 - 0.5) * 0.3;
  return glassAir(u_grade > 0.5 ? (lit ? u_outl[bi] : u_out[bi]) : best, p, dc, vec2(textureSize(u_depth, 0)));
}
bool like(vec3 a, vec3 b) { vec3 d = abs(a - b); return max(d.r, max(d.g, d.b)) < 0.004; }
vec3 lookAt(ivec2 p) {
  if (u_colored > 0.5) {
${n?"    vec3 constrained; if (constrainPalette(p, pixelNative(p), constrained)) { g_constrained = true; return constrained; }":""}
    vec3 c = pixelResolve(p); vec4 dq = texelFetch(u_crispDepth, p, 0);
    if (u_grade > 0.5 && dq.b > 0.3 + ((BAYER[(p.x & 3) + ((p.y & 3) << 2)] + 0.5) / 16.0 - 0.5) * 0.3) { for (int j = 0; j < 64; j++) { if (j >= u_n) break; if (like(c, u_out[j])) { c = u_outl[j]; break; } } }   // under a carried light
    return glassAir(c, p, dq.r, vec2(textureSize(u_crispScene, 0))); }
  return plainAt(p);
}
float depthAt(ivec2 p) { return u_colored > 0.5 ? texelFetch(u_crispDepth, p, 0).r : texelFetch(u_depth, p, 0).r; }
void main(){
  ivec2 p = ivec2(gl_FragCoord.xy);
  if (u_bars > 0.0 && abs(gl_FragCoord.y / float(textureSize(u_crispScene, 0).y) - 0.5) > 0.5 - u_bars) { o = vec4(0.0, 0.0, 0.0, 1.0); return; }   /* letterbox bars, when a diorama asks for them */
${t?"  p = waterPixel(p);":""}
  if (u_bypass > 0.5) { o = vec4(texelFetch(u_scene, p, 0).rgb, 1.0); return; }
  vec3 c0 = lookAt(p);
  o = vec4(c0, (g_spr${n?" || g_constrained":""}) && u_markA > 0.5 ? 0.5 : 1.0);
}`,l=`#version 300 es
precision highp float; precision highp int;
uniform sampler2D u_look, u_dep;
uniform highp sampler2D u_detailOwners, u_detailFlags;
uniform float u_keep, u_lineClean;
uniform bool u_scopedOnly, u_hasDetailFlags, u_detailWater;
out vec4 o;
${v}
bool like(vec3 a, vec3 b) { vec3 d = abs(a - b); return max(d.r, max(d.g, d.b)) < 0.004; }
vec3 at(ivec2 p) { return texelFetch(u_look, clamp(p, ivec2(0), textureSize(u_look, 0) - 1), 0).rgb; }
float dp(ivec2 p) { ivec2 q = clamp(p, ivec2(0), textureSize(u_dep, 0) - 1); return texelFetch(u_look, q, 0).a < 0.75 ? 0.5 : texelFetch(u_dep, u_detailWater ? waterPixel(q) : q, 0).r; }
const ivec2 N8[8] = ivec2[8](ivec2(-1, 0), ivec2(1, 0), ivec2(0, -1), ivec2(0, 1), ivec2(-1, -1), ivec2(1, -1), ivec2(-1, 1), ivec2(1, 1));
int detailFlags(ivec2 p) {
  if (!u_hasDetailFlags) return 0;
  ivec3 owner = ivec3(round(texelFetch(u_detailOwners, u_detailWater ? waterPixel(p) : p, 0).rgb * 255.0));
  int i = owner.r + owner.g * 256 + owner.b * 65536 - 1;
  if (i < 0) return 0;
  return 8 | int(texelFetch(u_detailFlags, ivec2((i >> 2) & 511, i >> 11), 0)[i & 3]);
}
bool protects(int flags) { return (flags & 6) != 0; }
int likes(ivec2 p, vec3 c, out ivec2 one) { int n = 0; one = p; for (int i = 0; i < 8; i++) if (like(c, at(p + N8[i]))) { n++; one = p + N8[i]; } return n; }
void main(){
  ivec2 p = ivec2(gl_FragCoord.xy); vec3 c0 = at(p); ivec2 q, q2;
  float alpha = texelFetch(u_look, p, 0).a;
  int flags = detailFlags(p);
  if (alpha < 0.75 || (flags & 2) != 0 || (u_scopedOnly && (flags & 1) == 0)) {
    o = vec4(c0, 1.0); return;
  }
  // outlines: a notch (an empty pixel with things on three or four sides) is filled from them, a bump (a pixel of a thing with
  // nothing on three or four sides) is taken off, so the edge of a thing against the background runs clean
  { bool e0 = dp(p) >= 0.995; int en = 0;
    for (int i = 0; i < 4; i++) {
      ivec2 q = clamp(p + N8[i], ivec2(0), textureSize(u_look, 0) - 1);
      if (dp(q) >= 0.995) en++;
      if (u_hasDetailFlags && (e0 || (flags & 8) == 0) &&
          protects(detailFlags(q))) { o = vec4(c0, 1.0); return; }
    }
    if (!e0 && en > 0 && protects(flags)) { o = vec4(c0, 1.0); return; }
    if (e0 && en <= 1) { int kb = 0, ib = -1; for (int i = 0; i < 4; i++) { if (dp(p + N8[i]) >= 0.995) continue; int k = 0; for (int j = 0; j < 4; j++) if (like(at(p + N8[i]), at(p + N8[j]))) k++; if (k > kb) { kb = k; ib = i; } }
      if (ib >= 0) { o = vec4(at(p + N8[ib]), 1.0); return; } }
    if (!e0 && en >= 3) { for (int i = 0; i < 4; i++) if (dp(p + N8[i]) >= 0.995) { o = vec4(at(p + N8[i]), 1.0); return; } } }
  /* the line cleaner (an option): a one-pixel kink in a straight edge between two colours is taken off (a pixel with one colour across
     from it and on both sides, its own colour carrying on straight behind it, takes the other colour: a bump, or a dent, filled);
     and on a dark line one pixel thick, the extra pixel at the inside corner of a step (a double) takes the colour beside it, so the
     line meets corner to corner as a pixel artist draws it */
  if (u_lineClean > 0.5) {
    for (int k = 0; k < 4; k++) { ivec2 d = N8[k], e = ivec2(d.y, d.x); vec3 X = at(p + d);
      if (like(X, c0) || !like(at(p + e), X) || !like(at(p - e), X)) continue;
      if (like(at(p - d), c0) && like(at(p - d + e), c0) && like(at(p - d - e), c0)) { o = vec4(X, 1.0); return; } }
    float l0 = dot(c0, vec3(0.3, 0.55, 0.15));
    for (int k = 4; k < 8; k++) { ivec2 dg = N8[k], h = ivec2(dg.x, 0), v = ivec2(0, dg.y);
      if (!like(at(p + h), c0) || !like(at(p + v), c0) || like(at(p + dg), c0) || like(at(p - h), c0) || like(at(p - v), c0)) continue;
      // (the line goes on past both arms, and is darker than what lies on the other side of the corner)
      bool goH = like(at(p + 2 * h), c0) || like(at(p + 2 * h - v), c0), goV = like(at(p + 2 * v), c0) || like(at(p + 2 * v - h), c0);
      vec3 a = at(p - h), b = at(p - v);
      if (goH && goV && dot(a, vec3(0.3, 0.55, 0.15)) > l0 + 0.06 && dot(b, vec3(0.3, 0.55, 0.15)) > l0 + 0.06) { o = vec4(like(a, b) ? a : at(p - h - v), 1.0); return; } } }
  int n = likes(p, c0, q);
  bool speck = n == 0 || (n == 1 && likes(q, c0, q2) == 1);
  if (speck) {
    vec3 nb[8]; for (int i = 0; i < 8; i++) nb[i] = at(p + N8[i]);
    int kb = 0; int ib = 0;
    for (int i = 0; i < 8; i++) { if (like(nb[i], c0)) continue; int k = 0; for (int j = 0; j < 8; j++) if (like(nb[i], nb[j])) k++; if (k > kb) { kb = k; ib = i; } }
    float lum0 = dot(c0, vec3(0.3, 0.55, 0.15)), lum1 = dot(nb[ib], vec3(0.3, 0.55, 0.15));
    if (kb >= 3 && abs(dp(p) - dp(p + N8[ib])) < 0.03 && abs(lum0 - lum1) < u_keep) c0 = nb[ib];
  }
  o = vec4(c0, 1.0);
}`,_=`#version 300 es
precision highp float;
uniform sampler2D u_cur, u_hist, u_dep; uniform vec3 u_pal[64]; uniform int u_n; uniform float u_have;
uniform mat4 u_iview, u_pvp; uniform vec4 u_cam; uniform vec2 u_rng;
out vec4 o;
int idxOf(vec3 c) { for (int i = 0; i < 64; i++) { if (i >= u_n) break; vec3 d = abs(c - u_pal[i]); if (max(d.r, max(d.g, d.b)) < 0.006) return i; } return -1; }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy), sz = textureSize(u_cur, 0); vec3 c = texelFetch(u_cur, p, 0).rgb; int ci = idxOf(c);
  o = vec4(c, float(ci + 1) / 255.0);
  if (u_have < 0.5 || ci < 0) return;
  float dn = texelFetch(u_dep, p, 0).r; ivec2 q = p;
  if (dn < 0.995) { float z = -(u_rng.x + dn * (u_rng.y - u_rng.x)); vec2 ndc = (vec2(p) + 0.5) / vec2(sz) * 2.0 - 1.0;
    vec3 v = u_cam.z > 0.5 ? vec3(ndc.x * u_cam.x * u_cam.y, ndc.y * u_cam.x, z) : vec3(ndc.x * u_cam.x * u_cam.y * -z, ndc.y * u_cam.x * -z, z);
    vec4 pc = u_pvp * (u_iview * vec4(v, 1.0)); q = ivec2(floor((pc.xy / pc.w * 0.5 + 0.5) * vec2(sz))); }
  if (q.x < 0 || q.y < 0 || q.x >= sz.x || q.y >= sz.y) return;
  vec4 h = texelFetch(u_hist, q, 0); int prev = int(h.a * 255.0 + 0.5) - 1;
  if (prev >= 0 && ci != prev) o.rgb = h.rgb; }`,C=`#version 300 es
precision highp float;
uniform sampler2D u_src; out vec4 o;
void main() { o = vec4(texelFetch(u_src, ivec2(gl_FragCoord.xy), 0).rgb, 1.0); }`,$=`#version 300 es
precision highp float; precision highp int;
uniform highp sampler2D u_anc, u_dat, u_sprTex; uniform mat4 u_view, u_proj; uniform vec2 u_vp, u_rng; uniform float u_time, u_keep, u_ortho; uniform vec4 u_rmpN4[16];
flat out ivec2 v_a; flat out ivec4 v_i; flat out float v_dA, v_axial; flat out vec3 v_P, v_N;
${z?"flat out int v_relightOwner;":""}
vec4 sprT(int x, int y) { return texelFetch(u_sprTex, ivec2(x, y), 0); }
int rlen(int r) { return int(u_rmpN4[r >> 2][r & 3] + 0.5) & 15; }
void main() {
  gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
  int i = gl_InstanceID; ivec2 b = ivec2((i & 255) * 3, i >> 8);
  vec4 t0 = texelFetch(u_anc, b, 0), t1 = texelFetch(u_anc, b + ivec2(1, 0), 0), t2 = texelFetch(u_anc, b + ivec2(2, 0), 0);
  int k = int(t2.x + 0.5); vec4 E0 = sprT(0, k), E1 = sprT(1, k);
  if (t1.w >= u_keep * E1.w) return;
  int j = int(t0.w + 0.5); vec4 m2 = texelFetch(u_dat, ivec2(((j & 511) << 2) + 2, j >> 9), 0), m3 = texelFetch(u_dat, ivec2(((j & 511) << 2) + 3, j >> 9), 0);
  if ((int(m2.w) & 32768) != 0) return;
  ${z?"v_relightOwner = j;":""}
  vec3 pos = t0.xyz;
  if (int(m2.w + 0.5) % 16 == 11) { pos.x += m3.z * sin(u_time * m3.y + pos.y * 1.3 + pos.z * 0.9 + m3.x); pos.y += m3.z * 0.6 * sin(u_time * m3.y * 1.3 + pos.x * 1.1 + m3.x); }
  vec4 cam = u_view * vec4(pos, 1.0); if (cam.z > -0.05) return;
  vec4 clip = u_proj * cam; ivec2 a = ivec2(floor((clip.xy / clip.w * 0.5 + 0.5) * u_vp));
  vec3 N = t1.xyz, vn = mat3(u_view) * N, c = cam.xyz;
  float facing = u_ortho > 0.5 ? -vn.z : dot(vn, c) / length(c); if (abs(facing) > 0.95) return;
  vec2 dir = u_ortho > 0.5 ? vn.xy : vec2(-vn.x * c.z + c.x * vn.z, -vn.y * c.z + c.y * vn.z); float dl = length(dir); if (dl < 1e-12) return; dir /= dl;
  int cat = dir.y > 0.38 ? 0 : dir.y < -0.38 ? 3 : dir.x > 0.0 ? 1 : 2;
  float first = cat == 0 ? E0.x : cat == 3 ? E1.x : E0.z, cnt = cat == 0 ? E0.y : cat == 3 ? E1.y : E0.w; if (cnt < 0.5) return;
  int s = int(first + 0.5) + min(int(cnt + 0.5) - 1, int(floor(t2.w * cnt))), r = int(t2.y + 0.5), band = clamp(int(floor(t2.z * float(rlen(r)))), 0, rlen(r) - 1);
  float dA = clamp((-cam.z - u_rng.x) / (u_rng.y - u_rng.x), 0.0, 1.0);
  vec2 corner = vec2(float(gl_VertexID & 1), float((gl_VertexID >> 1) & 1)) * 2.0 - 1.0;
  gl_Position = vec4((vec2(a) + 0.5 + corner * 8.0) / u_vp * 2.0 - 1.0, dA * 2.0 - 1.0, 1.0);
  v_a = a; v_i = ivec4(s, cat, r, band); v_dA = dA; v_axial = -cam.z; v_P = pos; v_N = N; }`,I=`#version 300 es
precision highp float; precision highp int;
uniform highp sampler2D u_sprTex, u_depth, u_idxTex, u_pixTex, u_dat; uniform mat4 u_pview; uniform vec3 u_peye; uniform float u_tanF, u_asp, u_portho, u_eGap, u_tol;
uniform mat4 u_proj; uniform vec2 u_vp; uniform float u_ortho; uniform vec4 u_splatPlane, u_spriteCover;
flat in ivec2 v_a; flat in ivec4 v_i; flat in float v_dA, v_axial; flat in vec3 v_P, v_N;
${z?za+"flat in int v_relightOwner;":""}
layout(location=0) out vec4 o;
layout(location=1) out vec4 cover;
${mu}
${b!=null?b:""}
${t?mo(i,a,r):""}
${A?Li(j):""}
${t||A||z?`
uniform vec3 u_waterSpritePalette[64];
uniform vec4 u_rmp4[128], u_rmpN4[16];
int spriteColor(int v) {
  if (v >= 100) return clamp(v - 100, 0, 63);
  int index = v_i.z;
  int count = int(u_rmpN4[index >> 2][index & 3] + 0.5) & 15;
  int offset = index * 8 + clamp(v_i.w + v - 8, 0, max(0, count - 1));
  return clamp(int(u_rmp4[offset >> 2][offset & 3] + 0.5), 0, 63);
}
`:""}
const ivec2 EOD[4] = ivec2[4](ivec2(0, 1), ivec2(1, 0), ivec2(-1, 0), ivec2(0, -1)), ETD[4] = ivec2[4](ivec2(1, 0), ivec2(0, -1), ivec2(0, 1), ivec2(1, 0));
vec4 sprT(int x, int y) { return texelFetch(u_sprTex, ivec2(x, y), 0); }
int dabAt(ivec2 q) { ivec2 s = textureSize(u_idxTex, 0); if (q.x < 0 || q.y < 0 || q.x >= s.x || q.y >= s.y) return -1;
  vec4 e = texelFetch(u_idxTex, q, 0) * 255.0; return int(e.r + 0.5) + int(e.g + 0.5) * 256 + int(e.b + 0.5) * 65536 - 1; }
vec4 pixA(int i) { return texelFetch(u_pixTex, ivec2((i & 1023) * 2, i >> 10), 0); }
vec4 pixB(int i) { return texelFetch(u_pixTex, ivec2((i & 1023) * 2 + 1, i >> 10), 0); }
vec3 hitAt(ivec2 q, int i, vec3 n) { ivec2 sz = textureSize(u_idxTex, 0);
  vec3 v = vec3(((float(q.x) + 0.5) / float(sz.x) * 2.0 - 1.0) * u_tanF * u_asp, ((float(q.y) + 0.5) / float(sz.y) * 2.0 - 1.0) * u_tanF, -1.0);
  vec3 o0 = u_portho > 0.5 ? u_peye + transpose(mat3(u_pview)) * vec3(v.xy, 0.0) : u_peye;
  vec3 d = transpose(mat3(u_pview)) * (u_portho > 0.5 ? vec3(0.0, 0.0, -1.0) : v); vec3 c = texelFetch(u_dat, ivec2((i & 511) << 2, i >> 9), 0).xyz;
  float den = dot(n, d), s = abs(den) > 1e-6 ? dot(n, c - o0) / den : 0.0; return s > 0.0 ? o0 + d * s : c; }
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy), d = p - v_a, od = EOD[v_i.y], td = ETD[v_i.y]; int s = v_i.x;
  vec4 I = sprT(0, 32 + s); int w = int(I.x + 0.5), h = int(I.y + 0.5), sk = int(I.w + 0.5), rr = d.x * od.x + d.y * od.y - 1 + sk, cc = d.x * td.x + d.y * td.y + int(I.z + 0.5);
  if (rr < 0 || rr >= h || cc < 0 || cc >= w) discard;
  int k = rr * w + cc; vec4 t = sprT(1 + (k >> 2), 32 + s); int v = int(t[k & 3] + 0.5); if (v == 0) discard;
  ${b?`
  vec3 inView = axialPosition(gl_FragCoord.xy, v_axial, u_vp);
  if (sectionMargin(transpose(mat3(u_pview)) * (inView - u_pview[3].xyz), v_axial) < 0.0) discard;
  `:""}
  cover = vec4(0.0);
  if (any(notEqual(u_splatPlane.xyz, vec3(0.0))) || any(notEqual(u_spriteCover.xyz, vec3(0.0)))) {
    vec4 at = vec4(axialPosition(gl_FragCoord.xy, v_axial, u_vp), 1.0);
    if (dot(u_splatPlane, at) < 0.0) discard;
    if (any(notEqual(u_spriteCover.xyz, vec3(0.0))) && dot(u_spriteCover, at) >= 0.0) cover = vec4(1.0);
  }
  float dp = texelFetch(u_depth, p, 0).r;
  if (dp < 0.995) {
    if (dp < v_dA - 0.008) discard;   // (something nearer stands here)
    if (rr >= sk) { int j = dabAt(p); bool other;   // (the root rows lie over the thing itself; the rest only past its own surface)
      if (j < 0 || pixA(j).x < 0.5) other = dp - v_dA > u_eGap;
      else { vec4 A = pixA(j), B = pixB(j); other = abs(dot(hitAt(p, j, vec3(A.w, B.x, B.y)) - v_P, v_N)) > u_tol; }
      if (!other) discard; } }
  ${t||A||z?`
  vec3 color = u_waterSpritePalette[spriteColor(v)];
  ${z?"vec4 gain = relightAt(v_relightOwner); if (gain.w > 0.0) color = min(vec3(1.0), color * gain.rgb);":""}
  ${t?"vec3 mark; color = waterPaint(color,gl_FragCoord.xy,u_vp,v_axial,mark);":""}
  ${A?"color = envMedia(color,gl_FragCoord.xy,u_vp,v_axial);":""}
  o = vec4(color,1.0);`:"o = vec4(float(v), float(v_i.z), float(v_i.w), 255.0) / 255.0;"} }`,y=F.replace("out vec4 o;","out ivec4 o;").replace(/void main\(\)\{[\s\S]*$/,"void main(){ ivec2 p = ivec2(gl_FragCoord.xy); ivec3 k = keyCalc(p); o = ivec4(k, k.x == -99999 ? 0 : 1); }");return{POST_VS:w,POST_FS:F,KEY_FS:y,CLEAN_FS:l,DAMP_FS:_,COPY_FS:C,SPR_VS:$,SPR_FS:I}}function Nf(e){return e.replace("if (u_lampN > 0 &&","if (false &&").replace("if (u_fineOn > 0.5 && plain","if (false && plain").replace("if (i >= u_azn) break;","break;")}function Gr(e,{ascii:t,specialize:i=!0,sampleCoverage:a,coverageRules:r,stableDetail:n,cutaway:p,airflow:c}={}){let m=gi(e);try{let E=function(){if(w)throw new Error("The Ink Studio splat pipeline has been disposed")},{vertex:u,fragment:A}=ir(t,a,{coverageRules:r,stableDetail:n,airflow:c}),j=m.program(u,A),z=new Map,T,b=!1,v,w=!1,F=0,l=0,_=!1,C=m.allocate("VertexArray");e.bindVertexArray(C);let $=m.allocate("Buffer");e.bindBuffer(e.ARRAY_BUFFER,$);let I=new Float32Array([-1,-1,1,-1,-1,1,1,1]);e.bufferData(e.ARRAY_BUFFER,I,e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);let y=m.allocate("Buffer");return e.bindBuffer(e.ARRAY_BUFFER,y),e.enableVertexAttribArray(1),e.vertexAttribIPointer(1,1,e.INT,0,0),e.vertexAttribDivisor(1,1),e.bindVertexArray(null),e.bindBuffer(e.ARRAY_BUFFER,null),{programFor(o){if(E(),o!=null&&o.water||o!=null&&o.portal||o!=null&&o.instances||o!=null&&o.contributions||o!=null&&o.masked||o!=null&&o.layeredGlass||o!=null&&o.materialStyles||o!=null&&o.environment||o!=null&&o.relighting||o!=null&&o.optical||o!=null&&o.cutaway){let h=!!o.water,s=!!o.portal,d=!!o.airPockets,k=!!o.layered,B=!!o.atlas,O=!!o.instances,V=!!o.contributions,Y=!!o.masked,f=!!o.textured,S=!!o.layeredGlass,q=!!o.materialStyles,P=!!o.environment,W=!!o.emitterFog,R=!!o.relighting,U=!!o.optical,J=+d+2*k+4*B+8*h+16*s+32*O+64*V+128*Y+256*f+512*S+1024*q+2048*P+4096*R+8192*U+16384*!!o.cutaway+32768*W;if(!z.has(J)){let ie=ir(t,a,{water:h,airPockets:d,layered:k,atlas:B,portal:s,instances:O,contributions:V,masked:Y,textured:f,layeredGlass:S,coverageRules:r,materialStyles:q,environment:P,emitterFog:W,relighting:R,optical:U,stableDetail:n,airflow:c,cutaway:o.cutaway?p:void 0});z.set(J,m.program(ie.vertex,ie.fragment))}return z.get(J)}if(!i||b||(o==null?void 0:o.lamps)!==!1||o.fine!==!1||o.textZones!==!1)return j;if(!T)try{T=m.program(Nf(u),A)}catch(h){if(e.isContextLost())throw h;return b=!0,j}return T},setOrder(o,h=!1){if(E(),!(o instanceof Int32Array)||h&&o.length%2)throw new TypeError("Draw order must be an Int32Array with the selected stride");e.bindBuffer(e.ARRAY_BUFFER,y),o.byteLength>F?(e.bufferData(e.ARRAY_BUFFER,o,e.DYNAMIC_DRAW),F=o.byteLength):o.length&&e.bufferSubData(e.ARRAY_BUFFER,0,o),h!==_&&(e.bindVertexArray(C),e.vertexAttribIPointer(1,1,e.INT,h?8:0,0),h?(e.enableVertexAttribArray(2),e.vertexAttribIPointer(2,1,e.INT,8,4),e.vertexAttribDivisor(2,1)):e.disableVertexAttribArray(2),e.bindVertexArray(null),_=h),l=o.length/(h?2:1)},draw(o=l,h=C){if(E(),!Number.isInteger(o)||o<0||h===C&&o>l)throw new RangeError("Invalid splat draw count");o&&(e.bindVertexArray(h),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,o))},drawSubset(o){if(E(),!(o instanceof Int32Array))throw new TypeError("Subset order must be an Int32Array");o.length&&(v||(v={vao:m.allocate("VertexArray"),buffer:m.allocate("Buffer")},e.bindVertexArray(v.vao),e.bindBuffer(e.ARRAY_BUFFER,$),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,v.buffer),e.enableVertexAttribArray(1),e.vertexAttribIPointer(1,1,e.INT,0,0),e.vertexAttribDivisor(1,1)),v.indices!==o&&(e.bindBuffer(e.ARRAY_BUFFER,v.buffer),e.bufferData(e.ARRAY_BUFFER,o,e.DYNAMIC_DRAW),v.indices=o),e.bindVertexArray(v.vao),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,o.length))},dispose(){w||(w=!0,m.dispose())}}}catch(u){throw m.dispose(),u}}var gu=Qc(yu(),1),bu,Fo=(bu=gu.default)!=null?bu:globalThis[Symbol.for("ink-studio.camera-lens")];var Eu=Qc(ku(),1),Tu,Au=(Tu=Eu.default)!=null?Tu:globalThis[Symbol.for("ink-studio.camera-impulses")];var Ma=new WeakMap;function or(e,t,i,a){if(!Number.isSafeInteger(i)||i<1||!Number.isSafeInteger(a)||a<1)throw new RangeError("Camera capture requires positive integer dimensions");let r=Xi(e,t,i,a),n=Object.freeze(Object.fromEntries(Object.entries(Ii(r)).map(([c,m])=>[c,Object.freeze(m)]))),p=Object.freeze({pose:n,ortho:r.ortho,yaw:Math.atan2(n.back[0],n.back[2]),pitch:Math.asin(Math.max(-1,Math.min(1,n.back[1])))});return Ma.set(p,{camera:r,height:a}),p}function Ru(e,t,i,a){let r=or(e,t,i,a),{camera:n}=Ma.get(r),{eye:p,back:c}=r.pose;return{snapshot:r,camera:{...r.pose,ortho:n.ortho,tangent:n.tangent,aspect:n.aspect,near:n.clipNear,far:n.clipFar,observer:p.map((m,u)=>m-c[u]*n.setback)}}}function Xi(e,t,i,a){var I,y,E,o,h;if(t.cameraSnapshot!==void 0){let s=Ma.get(t.cameraSnapshot);if(!s)throw new TypeError("Use a camera snapshot from captureCamera");let{camera:d}=s,k=i/a,B=s.height/a;if(k===d.aspect&&B===1)return d;let O=d.projection.slice();return O[0]*=d.aspect/k,{...d,aspect:k,projection:O,footprint:d.footprint*B,shadowFootprint:d.shadowFootprint*B}}let r=(y=t.cameraStaging)!=null?y:(I=e.look)==null?void 0:I.cameraStaging,n=Fo.frame(e,t,i,a,{orbit:r==null?void 0:r.orbit,impulse:Au.frame}),{dist:p,distance:c,aspect:m,radius:u,ortho:A,tangent:j,clipNear:z,clipFar:T,setback:b}=n,v=Fo.artView(n,a,(E=e.look)==null?void 0:E.stable,t.stable),w=v===n.view?n.pose.eye:Fo.fromView(v).eye,F=p*j,l=.4,_=1/j,C=A?new Float32Array([1/(F*m),0,0,0,0,1/F,0,0,0,0,-2/(T-l),0,0,0,-(T+l)/(T-l),1]):new Float32Array([_/m,0,0,0,0,_,0,0,0,0,(T+l)/(l-T),-1,0,0,2*T*l/(l-T),0]),$=A?c:p;return{view:Float32Array.from(v),projection:C,eye:w,aspect:m,ortho:A,radius:u,distance:c,lens:n.lens,composition:(h=(o=t.composition)!=null?o:n.base.composition)!=null?h:[.5,.5],setback:b,tangent:A?F:j,footprint:p*2*j/a,shadowFootprint:2*F/a,clipNear:z,clipFar:T,depthRange:[$-u,$+u],...n.motion&&{cameraImpulse:n.motion}}}function Ii({eye:e,view:t}){return{eye:e.slice(),right:[t[0],t[4],t[8]],up:[t[1],t[5],t[9]],back:[t[2],t[6],t[10]]}}function zu(e,t){let i=Fo.pose(t);return{...e,eye:i.eye,view:new Float32Array(Fo.matrix(i))}}function Su(e,t,i){let a=e.asset.data,r=e.matrix,n=e.at,p=a[t],c=a[t+1],m=a[t+2],u=Math.fround;return u(i(u(r[0]*p+r[1]*c+r[2]*m+n[0]),u(r[3]*p+r[4]*c+r[5]*m+n[1]),u(r[6]*p+r[7]*c+r[8]*m+n[2])))}function qf(e,t){let i=e.matrix,a=e.at,{sortLo:r,sortHi:n}=e.asset,p=t[2]*i[0]+t[6]*i[3]+t[10]*i[6],c=t[2]*i[1]+t[6]*i[4]+t[10]*i[7],m=t[2]*i[2]+t[6]*i[5]+t[10]*i[8],u=t[2]*a[0]+t[6]*a[1]+t[10]*a[2]+t[14],A=n.reduce((z,T,b)=>z+Math.max(Math.abs(T),Math.abs(r[b])),0),j=1e-6*(1+Math.abs(u)+Math.abs(a[0])+Math.abs(a[1])+Math.abs(a[2])+A*e.authored.scale);return[u+Math.min(p*r[0],p*n[0])+Math.min(c*r[1],c*n[1])+Math.min(m*r[2],m*n[2])-j,u+Math.max(p*r[0],p*n[0])+Math.max(c*r[1],c*n[1])+Math.max(m*r[2],m*n[2])+j]}function Fu(){let e=new Uint32Array(65536),t,i,a;return function(n,p,c,m,u,A,j=[c,c],z=[0,0]){var d,k,B,O,V,Y;let{count:T,data:b}=n,v=m?2:1,w=T+((d=m==null?void 0:m.reduce((f,S)=>f+S.asset.count,0))!=null?d:0);if(!t||t.length<w){let f=Math.max(w,Math.ceil(((k=t==null?void 0:t.length)!=null?k:0)*1.25));t=new Float32Array(f),i=new Uint16Array(f)}(!a||a.length<w*v)&&(a=new Int32Array(t.length*v));let F=p[2],l=p[6],_=p[10],C=p[14],$=(f,S,q)=>F*f+l*S+_*q+C;for(let f=0,S=0;f<T;f++,S+=16)t[f]=$(b[S],b[S+1],b[S+2]);for(let f of(B=n.moving)!=null?B:[]){if(f>=T)continue;let S=f*16,q=b[S+11]%16,P=b[S+12],W=b[S+13],R=b[S+14],U=b[S],J=b[S+1],ie=b[S+2];if(q===2||q===3){let K=(q===2?j[Math.round(b[S+11])&8192?1:0]:c)*W/R+P,Z=(K-Math.floor(K))*R;J+=q===2?-Z:Z,q===2&&(U+=z[0]*Z/Math.max(W,1e-5),ie+=z[1]*Z/Math.max(W,1e-5))}else if(q===5){let N=c*W,K=Math.cos(N),Z=Math.sin(N),ye=K*U+Z*ie;ie=-Z*U+K*ie,U=ye}else J+=Math.sin(c*W+P)*R;t[f]=$(U,J,ie)}let I=(O=n.anim)==null?void 0:O.bones;if(I)for(let f of(V=n.anim.boned)!=null?V:[]){if(f>=T)continue;let S=f*16,q=b[S],P=b[S+1],W=b[S+2],R=b[S+14],U=b[S+12]*12,J=b[S+13]*12,ie=(K,Z)=>I[K+Z*3]*q+I[K+Z*3+1]*P+I[K+Z*3+2]*W+I[K+9+Z],N=K=>{let Z=ie(U,K);return R>0?Z+(ie(J,K)-Z)*R:Z};t[f]=$(N(0),N(1),N(2))}let y=T;for(let f of m!=null?m:[])for(let S=0;S<f.asset.data.length;S+=16)t[y++]=Su(f,S,$);let E=1/0,o=-1/0;for(let f=0;f<w;f++){let S=t[f];S<E&&(E=S),S>o&&(o=S)}if(u&&m.length<u.length){let f=0;for(let S of u){if(S===m[f]){f++;continue}let[q,P]=qf(S,p);if(!(q>=E&&P<=o))for(let W=0;W<S.asset.data.length;W+=16){let R=Su(S,W,$);R<E&&(E=R),R>o&&(o=R)}}}for(let f of(Y=n.back)!=null?Y:[])f<T&&(t[f]=E);if(A){let f=a.subarray(0,T);for(let S=0;S<T;S++)f[S]=S;return f.sort((S,q)=>t[S]-t[q]),A(f,t)}let h=65535/(o-E||1);e.fill(0);for(let f=0;f<w;f++)e[i[f]=(t[f]-E)*h|0]++;let s=0;for(let f=0;f<e.length;f++){let S=e[f];e[f]=s,s+=S}if(m){for(let S=0;S<T;S++){let q=e[i[S]]++*2;a[q]=S,a[q+1]=0}let f=T;for(let S of m){let q=T+S.start,P=S.index+1;for(let W=0;W<S.asset.count;W++,f++){let R=e[i[f]]++*2;a[R]=q+W,a[R+1]=P}}}else for(let f=0;f<T;f++)a[e[i[f]]++]=f;return a.length===w*v?a:a.subarray(0,w*v)}}var Da=17,$r=18,Wr=19,Vr=20,Mu=new Map([["fog",0],["box",1],["sphere",2],["shaft",3]]),rr=[0,0,0],jf=e=>Math.round(255*Math.max(0,Math.min(1,e))),Uf=e=>[e>>16&255,e>>8&255,e&255].map(t=>t/255);function Gf(e,t,i){var p,c,m,u,A,j,z,T,b,v;let a=Mu.get(e.type),r=(u=(c=(p=e.min)!=null?p:e.at)!=null?c:e.from)!=null?u:[0,(m=e.bottom)!=null?m:-1e20,0],n=(z=(A=e.max)!=null?A:e.axis)!=null?z:[0,(j=e.top)!=null?j:1e20,0];t.set([...r,a,...n,(T=e.height)!=null?T:0,...e.rgb,e.density,e.near,(b=e.far)!=null?b:1e20,(v=e.radius)!=null?v:0,+!!e.lit],i)}function $f(e,t,i){var p;let a=[...e.map(c=>c.paletteField),t==null?void 0:t.paletteField];if(!a.some(c=>c==null?void 0:c.strength))return{rows:[],fog:!1,card:-1};let r=new Float32Array(a.length*8),n=[];return a.forEach((c,m)=>{var j,z,T,b;if(!(c!=null&&c.strength))return;let u=i+a.length*2+n.length/4;if(c.stops)for(let{at:v,rgb:w}of c.stops)n.push(...w,v);else for(let v=0;v<=128;v++)n.push(...c.sampleUnit(v/128),0);let A=["depth","altitude","density","light"].indexOf(c.source);r.set([c.stops?1:2,A,c.low,c.span,u,(z=(j=c.stops)==null?void 0:j.length)!=null?z:129,c.strength,(b=(T=e[m])==null?void 0:T.step)!=null?b:0],m*8)}),{rows:[...r,...n],fog:e.some(c=>c.paletteField),card:(p=t==null?void 0:t.paletteField)!=null&&p.strength?i+2*e.length:-1}}function Du(e,t,{table:i,textureUnit:a},r,n){var $,I,y,E,o;let p=n.KIT,c=($=n.EnvironmentFrame)!=null?$:p==null?void 0:p.environmentFrame,m=(I=n.SkyEnvironment)!=null?I:p==null?void 0:p.skyEnvironment,u=(y=n.CelestialTracks)!=null?y:p==null?void 0:p.celestialTracks,A=(E=n.ArtDirection)!=null?E:p==null?void 0:p.artDirection,j=(o=n.HorizonBands)!=null?o:p==null?void 0:p.horizonBands,z,T,b,v,w,F,l=new WeakMap;function _(h){return e.activeTexture(e.TEXTURE0+h),t.texture()}function C(h,s,d,k,B,O,V=!1){var we,Me,He,qe,fe,Ne,We,Se,Ie,ne,Ce,Ue,Ke,ot,gt,xt,Ye,ft,rt,Et,Mt,At,wt,it,qt,Lt,jt,Ot,Zt,ii,oi,Wt,D,xe,de;if(s.environment===!1||!c||!m)return null;let Y=(we=s.skyEnvironment)!=null?we:h.skyEnvironment,f=(Me=s.cloudField)!=null?Me:h.cloudField,S=s.atmosphere===!1?[]:(He=h.atmosphere)!=null?He:[],q=(fe=s.horizonBands)!=null?fe:(qe=h.look)==null?void 0:qe.horizonBands,P=(Ne=s.celestialTracks)!=null?Ne:h.celestialTracks;if(!Y&&!f&&!S.length&&!q&&!P)return null;let W=A==null?void 0:A.prepare((We=h.look)==null?void 0:We.artDirection,s.artDirection),R=c.timeline(h,s,k,W,(Se=p==null?void 0:p.weather)==null?void 0:Se.tracks),U=Uf(h.pal[0]),J=(Ie=u==null?void 0:u.settings(h.celestialTracks,s.celestialTracks))==null?void 0:Ie.frame(R.skyTime),ie=m.withCelestials((ne=R.environment)==null?void 0:ne.sky,J,U),N=V?m.forReflection(ie):ie,K=Ii(d),Z=K.eye.map((ke,se)=>ke-d.setback*K.back[se]),ye,ve,ze=c.opticalWeather(h,s,R);if(f&&(p!=null&&p.clouds)){let ke;typeof f=="string"?ke=p.clouds.compile(f):(ke=l.get(f),ke||(ke=p.clouds.compile(f),l.set(f,ke)));let{windConfig:se,flow:Ze}=c.wind(h,s,{...R,weather:ze}),Ve=se&&se.clouds!==!1?Ze.cloudTravel(0,R.skyTime).map(dt=>dt*se.clouds):void 0;ye=ke.frame(R.skyTime,null,(Ue=(Ce=J==null?void 0:J.sun)==null?void 0:Ce.direction)!=null?Ue:N==null?void 0:N.sun,Ve,(Ke=s.cloudRepresentation)!=null?Ke:h.cloudRepresentation,void 0,void 0,W==null?void 0:W.cloudEdge),ve=(ot=ye.view)==null?void 0:ot.call(ye,Z,d.ortho?K.back:null)}let me=ve==null?void 0:ve.card,Fe=(xt=(gt=p==null?void 0:p.atmosphere)==null?void 0:gt.prepare(S.filter(ke=>Mu.has(ke==null?void 0:ke.type)),h.pal,void 0,ze==null?void 0:ze.fogGain,R.skyTime))!=null?xt:[];if(Fe.length>16)throw new RangeError("WebGL supports up to "+16+" analytic atmosphere volumes per frame");let Le=Math.atan2(K.back[0],K.back[2]),te=Math.atan2(K.back[1],Math.hypot(K.back[0],K.back[2])),H=(rt=j==null?void 0:j.prepare((Ye=h.look)==null?void 0:Ye.horizonBands,s.horizonBands))==null?void 0:rt.frame({eye:Z,yaw:Le,pitch:te,distance:d.distance-d.setback,parameters:(ft=R.environment)==null?void 0:ft.parameters}),g=(ye==null?void 0:ye.visible)&&!ve;if(!N&&!me&&!Fe.length&&!H&&!g)return null;let M=d.ortho?Math.tan(((Et=N==null?void 0:N.orthoFov)!=null?Et:Math.PI/3)*.5):d.tangent,G=[M*d.aspect,M],X=Math.max(d.distance+2*d.radius,me?ve.horizon(K.eye):0),ae=!!(N!=null&&N.celestial||N!=null&&N.paletteRamp||N!=null&&N.paletteField||H||g),Q=ae?[]:(Mt=N==null?void 0:N.splats)!=null?Mt:[],pe=4*(Fe.length+Q.length),Ae=$f(Fe,me,pe),Pe=new Float32Array(pe*4+Ae.rows.length);Pe.set(Ae.rows,pe*4);for(let ke=0;ke<Fe.length;ke++)Gf(Fe[ke],Pe,ke*16);for(let ke=0;ke<Q.length;ke++){let se=Q[ke];Pe.set([...se.direction,se.opacity,...se.right,se.size[0],...se.up,se.size[1],...se.color,0],16*(ke+Fe.length))}if(z||(e.activeTexture(e.TEXTURE0+Da),z=i(64,Da,r)),z.upload(Pe),ae){F!=null||(F=_(Vr));let ke=new Uint8Array(B*O*4),se=[0,0,0],Ze=[0,0,0],Ve=N&&(W!=null&&W.bands)?{...N,bands:W.bands}:N;for(let dt=0;dt<O;dt++)for(let vt=0;vt<B;vt++){let kt=(2*(vt+.5)/B-1)*G[0],Vt=(2*(dt+.5)/O-1)*G[1],ri=1/Math.hypot(kt,Vt,1);for(let st=0;st<3;st++)Ze[st]=U[st],se[st]=(K.right[st]*kt+K.up[st]*Vt-K.back[st])*ri;Ve&&m.shade(Ve,se,Ze),H==null||H(se,Ze),g&&ye.paint(Z,se,Ze);let pt=4*(dt*B+vt);for(let st=0;st<3;st++)ke[pt+st]=jf(Ze[st]);ke[pt+3]=255}a(Vr,F),e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,B,O,0,e.RGBA,e.UNSIGNED_BYTE,ke)}else z.bind(Vr);me?(T!=null||(T=_($r)),a($r,T),b!==me.pixels&&(e.texImage2D(e.TEXTURE_2D,0,e.RGB32F,me.resolution,me.resolution,0,e.RGB,e.FLOAT,me.pixels),b=me.pixels)):z.bind($r);let Te=me==null?void 0:me.lighting;return Te?(v!=null||(v=_(Wr)),a(Wr,v),w!==Te.cells&&(e.texImage2D(e.TEXTURE_2D,0,e.R32F,Te.width,Te.rows,0,e.RED,e.FLOAT,Te.cells),w=Te.cells)):z.bind(Wr),{media:!!(me||Fe.length),lit:Fe.some(ke=>ke.lit),uniforms:{u_envData:Da,u_envCard:$r,u_envCloudLight:Wr,u_envBackdrop:Vr,u_envEye:K.eye,u_envRight:K.right,u_envUp:K.up,u_envBack:K.back,u_envCamera:[d.tangent*d.aspect,d.tangent,+d.ortho,d.setback],u_envSkyView:G,u_envHorizon:X,u_envBackground:U,u_envHasSky:+!!N,u_envSkySplats:Q.length,u_envSkyStart:Fe.length*4,u_envBackdropSampled:+ae,u_envZenith:(At=N==null?void 0:N.zenith)!=null?At:rr,u_envSkyHorizon:(wt=N==null?void 0:N.horizon)!=null?wt:rr,u_envGround:(it=N==null?void 0:N.ground)!=null?it:rr,u_envSun:(qt=N==null?void 0:N.sun)!=null?qt:rr,u_envSunRGB:(Lt=N==null?void 0:N.sunColor)!=null?Lt:rr,u_envSunParams:[(jt=N==null?void 0:N.sunEdge)!=null?jt:0,(Ot=N==null?void 0:N.sunCore)!=null?Ot:1,(Zt=N==null?void 0:N.sunStrength)!=null?Zt:0],u_envFogCount:Fe.length,u_envBands:(ii=W==null?void 0:W.atmosphereBands)!=null?ii:0,u_envPaletteFog:+Ae.fog,u_envPaletteStart:pe,u_envPaletteCard:Ae.card,u_envCardSize:(oi=me==null?void 0:me.resolution)!=null?oi:0,u_envCloudHardness:(Wt=W==null?void 0:W.cloudHardness)!=null?Wt:.5,...me&&{u_envCardFrame:[...me.center,me.radius],u_envCardRight:me.right,u_envCardUp:me.up,u_envCardNormal:me.normal,u_envCloudRGB:me.rgb,u_envCloudHeight:[(D=Te==null?void 0:Te.low)!=null?D:0,(xe=Te==null?void 0:Te.thickness)!=null?xe:1,me.opacity,(de=Te==null?void 0:Te.probe)!=null?de:0]},...Te&&{u_envCloudStyle:[Te.ambient,Te.strength,Te.rim,Te.daylight],u_envCloudDomain:[...Te.origin,...Te.cell],u_envCloudSun:Te.direction,u_envCloudLightRGB:Te.rgb}}}}return{prepare:C}}var Pu=`#version 300 es
precision highp float;
uniform sampler2D u_source, u_destination, u_cover, u_spriteCover;
uniform vec3 u_origin, u_right, u_up, u_normal, u_eye;
uniform mat4 u_portalView;
uniform vec3 u_settings;
uniform vec2 u_half, u_size;
uniform int u_opening, u_hasSpriteCover;
uniform float u_fade, u_far;
out vec4 o;
bool throughOpening() {
  vec2 p = (gl_FragCoord.xy / u_size * 2.0 - 1.0) * u_settings.xy;
  bool ortho = u_settings.z > 0.5;
  mat3 world = transpose(mat3(u_portalView));
  vec3 eye = u_eye + (ortho ? world * vec3(p, 0.0) : vec3(0));
  vec3 ray = world * vec3(ortho ? vec2(0) : p, -1.0);
  float towards = dot(ray, u_normal);
  if (towards >= -1e-7) return false;
  float t = dot(u_origin - eye, u_normal) / towards;
  if (t <= 0.0 || t >= u_far) return false;
  vec3 at = eye + ray * t;
  vec3 relative = at - u_origin;
  vec2 local = vec2(dot(relative, u_right), dot(relative, u_up)) / u_half;
  if (u_opening == 2 ? dot(local, local) > 1.0 : any(greaterThan(abs(local), vec2(1.0)))) return false;
  ivec2 pixel = ivec2(gl_FragCoord.xy);
  return texelFetch(u_cover, pixel, 0).r < 0.5 &&
    (u_hasSpriteCover == 0 || texelFetch(u_spriteCover, pixel, 0).r < 0.5);
}
void main() {
  ivec2 p = ivec2(gl_FragCoord.xy);
  vec3 color = u_opening != 0 && throughOpening() ? texelFetch(u_destination, p, 0).rgb :
    texelFetch(u_source, p, 0).rgb;
  o = vec4(color * (1.0 - u_fade), 1.0);
}`;var Ou=new WeakMap,Lu=[1,0,0,0,1,0,0,0,1],Nu=[0,0,0],Co=16777215,qu=e=>typeof e=="string"&&/^[\w][\w.-]{0,95}$/.test(e),Pa=(e,t)=>Array.isArray(e)&&e.length===t&&Array.from(e).every(i=>Number.isFinite(i)&&Math.abs(i)<=1e6),Iu=/^#[\da-f]{6}$/i,Wf=new Set(["id","prototype","position","rotation","scale","palette","damage","opacity","visible"]),La=e=>parseInt(e.slice(5)+e.slice(3,5)+e.slice(1,3),16),Hi=(e,t)=>e[0]*t[0]+e[1]*t[1]+e[2]*t[2];function Vf(e,t){let i=[1/0,1/0,1/0],a=[-1/0,-1/0,-1/0],r=i.slice(),n=a.slice(),p=0;for(let m=0;m<t*16;m+=16){let u=e[m],A=e[m+1],j=e[m+2],z=e[m+3],T=e[m+4],b=e[m+5],v=e[m+6],w=e[m+7],F=e[m+8],l=e[m+9],_=e[m+10],C=e[m+11];if(![u,A,j,z,T,b,v,F,l,_].every(Number.isFinite)||Math.max(Math.abs(u),Math.abs(A),Math.abs(j))>1e6||z<0||z>1e6||!Number.isInteger(w)||w<0||w>Co||!Number.isInteger(C)||C<0||C%16||C&1536||T<0||F<0||_<0)throw new TypeError("Instance prototypes need finite, stationary baked splats");r[0]=Math.min(r[0],u),n[0]=Math.max(n[0],u),r[1]=Math.min(r[1],A),n[1]=Math.max(n[1],A),r[2]=Math.min(r[2],j),n[2]=Math.max(n[2],j),!(!z||A<-30)&&(i[0]=Math.min(i[0],u),a[0]=Math.max(a[0],u),i[1]=Math.min(i[1],A),a[1]=Math.max(a[1],A),i[2]=Math.min(i[2],j),a[2]=Math.max(a[2],j),p=Math.max(p,T+Math.abs(b)+Math.abs(v),F+Math.abs(b)+Math.abs(l),_+Math.abs(v)+Math.abs(l)))}let c=i[0]===1/0;return{center:c?Nu:i.map((m,u)=>(m+a[u])*.5),extent:c?0:Math.hypot(...i.map((m,u)=>(a[u]-m)*.5)),spread:3*Math.sqrt(p),empty:c,sortLo:r,sortHi:n}}function Bu(e,t,i){let a={...i==null?void 0:i.authored,...e},{id:r,prototype:n,position:p=Nu,rotation:c=Lu,scale:m=1,palette:u={},damage:A=null,opacity:j=1,visible:z=!0}=a;if(!qu(r)||!t.has(n)||Object.keys(a).some(E=>!Wf.has(E))||!Pa(p,3)||!Pa(c,9)||!Number.isFinite(m)||m<1e-4||m>1e4||!Number.isFinite(j)||j<0||j>1||typeof z!="boolean"||!u||typeof u!="object"||Array.isArray(u))throw new TypeError("Invalid splat instance "+r);let T=[c.slice(0,3),c.slice(3,6),c.slice(6,9)],[b,v,w]=T;if(T.some(E=>Math.abs(Hi(E,E)-1)>1e-5)||Math.max(Math.abs(Hi(b,v)),Math.abs(Hi(b,w)),Math.abs(Hi(v,w)))>1e-5||Hi([b[1]*v[2]-b[2]*v[1],b[2]*v[0]-b[0]*v[2],b[0]*v[1]-b[1]*v[0]],w)<.99999)throw new RangeError("Instance rotation must be a right-handed row-major orthonormal matrix");let F=Object.entries(u);if(F.length>16||F.some(([E,o])=>!Iu.test(E)||typeof o!="string"||!Iu.test(o))||new Set(F.map(([E])=>La(E))).size!==F.length)throw new TypeError("Instance palette needs up to 16 distinct #RRGGBB replacements");if(A!==null&&(!Pa(A==null?void 0:A.center,3)||!Number.isFinite(A.radius)||A.radius<=0||A.radius>1e6))throw new TypeError("Instance damage needs a local XYZ center and positive radius");let l=t.get(n),_=Object.freeze({id:r,prototype:n,position:Object.freeze(p.slice()),rotation:Object.freeze(c.slice()),scale:m,palette:Object.freeze({...u}),opacity:j,visible:z,damage:A&&Object.freeze({center:Object.freeze(A.center.slice()),radius:A.radius})}),C=Float32Array.from(p),$=Float32Array.from(c,E=>E*m),I=c.every((E,o)=>E===Lu[o]),y=[Hi($.subarray(0,3),l.center)+C[0],Hi($.subarray(3,6),l.center)+C[1],Hi($.subarray(6,9),l.center)+C[2]];return{authored:_,asset:l,at:C,matrix:$,center:y,diagonal:I,extent:l.extent*m*1.00002,spread:l.spread*m*1.00002,swatches:F.map(([E,o])=>[La(E),La(o)]),mask:A&&Float32Array.from([...A.center,A.radius**2])}}function Ki(e){let t=Ou.get(e);if(!t)throw new TypeError("Expected instances from createSplatInstances");return t}function ju(e,t){var A,j,z,T,b,v,w;if(!e||typeof e!="object"||Array.isArray(e)||!Array.isArray(t)||t.length>65535)throw new TypeError("Expected prototype table and authored instance array");let i=new Map,a=new Map,r=0;for(let[F,l]of Object.entries(e)){if(!qu(F)||!((l==null?void 0:l.data)instanceof Float32Array)||!Number.isSafeInteger(l.count)||l.count<=0||l.count>Co||l.count*16>l.data.length||(A=l.moving)!=null&&A.length||(j=l.back)!=null&&j.length||l.anim||l.fine||l.pix||l.surfaceData||l.paintCorrections||(z=l.effectParticles)!=null&&z.length||(T=l.sortRanges)!=null&&T.length)throw new TypeError("Expected a stationary baked splat prototype for "+F);let _=a.get(l);if(!_){let C=l.data.slice(0,l.count*16),$=l.materialPixelStyles;if($!=null&&(!($ instanceof Float32Array)||$.length<l.count*4))throw new TypeError("Instance material pixel styles are shorter than their prototype");if(l.opticalSplats!=null&&(!(l.opticalSplats instanceof Float32Array)||l.opticalSplats.length!==l.count*12))throw new TypeError("Instance optical materials must match the prototype splat count");if(_={offset:r,count:l.count,data:C,opticalSplats:(b=l.opticalSplats)==null?void 0:b.slice(0,l.count*12),normals:(w=(v=l.renderMetadata)==null?void 0:v.normals)==null?void 0:w.slice(0,l.count*3),materialPixelStyles:$==null?void 0:$.slice(0,l.count*4),...Vf(C,l.count)},r+=_.count,r>Co)throw new RangeError("Too many shared splats");a.set(l,_)}i.set(F,_)}let n=new Map,p=[],c=0;for(let F of t){if(!F||typeof F!="object"||Array.isArray(F))throw new TypeError("Expected an authored splat instance");let l=Bu(F,i);if(n.has(l.authored.id))throw new TypeError("Duplicate splat instance "+l.authored.id);if(n.set(l.authored.id,p.length),p.push({...l,start:c,index:p.length}),c+=l.asset.count,c>Co)throw new RangeError("Too many logical splats")}let m={rows:p,assets:[...a.values()],count:c,sharedCount:r,revision:0,orderRevision:0,hasOpticalSplats:p.some(F=>F.asset.opticalSplats),hasMaterialPixelStyles:p.some(F=>F.asset.materialPixelStyles)},u=Object.freeze({count:t.length,splats:c,sharedSplats:r,get(F){var l;return(l=p[n.get(F)])==null?void 0:l.authored},update(F,l){let _=n.get(F),C=p[_];if(!C||!l||typeof l!="object"||Array.isArray(l)||Object.hasOwn(l,"id")||Object.hasOwn(l,"prototype"))throw new TypeError("Updates need an existing instance and editable placement fields");let $=Bu(l,i,C);return $.start=C.start,$.index=C.index,$.version=++m.revision,($.authored.visible!==C.authored.visible||!!$.authored.opacity!=!!C.authored.opacity||$.at.some((I,y)=>I!==C.at[y])||$.matrix.some((I,y)=>I!==C.matrix[y]))&&m.orderRevision++,p[_]=$,$.authored},owner(F,l=0){let _=F-l;if(!Number.isSafeInteger(F)||!Number.isSafeInteger(l)||l<0||_<0||_>=c)return;let C=0,$=p.length;for(;C+1<$;){let E=C+$>>>1;p[E].start<=_?C=E:$=E}let{start:I,authored:y}=p[C];return{id:y.id,prototype:y.prototype,splat:_-I}},flatten(F){return Xf(F,m)}});return Ou.set(u,m),u}function Ia(e,t,i){var T;let{asset:a,matrix:r,at:n,authored:p,swatches:c,mask:m,diagonal:u}=t,{opacity:A,visible:j}=p,z=new Map(c);for(let b=0,v=i*16;b<a.count*16;b+=16,v+=16){let w=a.data,F=w[b],l=w[b+1],_=w[b+2],C=F-(m==null?void 0:m[0]),$=l-(m==null?void 0:m[1]),I=_-(m==null?void 0:m[2]);e[v]=r[0]*F+r[1]*l+r[2]*_+n[0],e[v+1]=r[3]*F+r[4]*l+r[5]*_+n[1],e[v+2]=r[6]*F+r[7]*l+r[8]*_+n[2],e[v+3]=!j||l<-30||m&&C*C+$*$+I*I<=m[3]?0:w[b+3]*A;let y=w[b+4],E=w[b+5],o=w[b+6],h=w[b+8],s=w[b+9],d=w[b+10];if(u){let k=r[0]*r[0];e[v+4]=y*k,e[v+5]=E*k,e[v+6]=o*k,e[v+8]=h*k,e[v+9]=s*k,e[v+10]=d*k}else for(let k=0;k<3;k++){let B=k*3,O=r[B]*y+r[B+1]*E+r[B+2]*o,V=r[B]*E+r[B+1]*h+r[B+2]*s,Y=r[B]*o+r[B+1]*s+r[B+2]*d;for(let f=k;f<3;f++){let S=k===0?4+f:k===1?7+f:10,q=f*3;e[v+S]=O*r[q]+V*r[q+1]+Y*r[q+2]}}e[v+7]=(T=z.get(w[b+7]))!=null?T:w[b+7],e[v+11]=w[b+11]}}function Ba(e,t,i){var n,p;let a=t.asset.materialPixelStyles;if(!e||!a||(i*=4,e.set(a,i),!t.swatches.length))return;let r=new Map(t.swatches);for(let c=i+2;c<i+a.length;c+=4)e[c]=(n=r.get(e[c]))!=null?n:e[c],e[c+1]=(p=r.get(e[c+1]))!=null?p:e[c+1]}function Oa(e,{asset:t,authored:{rotation:i}},a){if(!(!e||!t.normals))for(let r=0,n=a*3;r+2<t.normals.length;r+=3,n+=3){let p=t.normals[r],c=t.normals[r+1],m=t.normals[r+2];for(let u=0;u<3;u++){let A=u*3;e[n+u]=i[A]*p+i[A+1]*c+i[A+2]*m}}}function Xf(e,t){var j,z,T;Na(e.count,t);let i=e.count+t.count,a=new Float32Array(i*16);a.set(e.data.subarray(0,e.count*16));for(let b of t.rows)Ia(a,b,e.count+b.start);let r=(j=e.renderMetadata)!=null?j:{},n=[...(z=r.objects)!=null?z:[null]],p=[...(T=r.targets)!=null?T:[null]],c=new Uint32Array(i),m=new Uint32Array(i);r.objectIds&&c.set(r.objectIds.subarray(0,e.count)),r.targetIds&&m.set(r.targetIds.subarray(0,e.count));for(let b of t.rows){let{id:v}=b.authored,w=e.count+b.start,F=w+b.asset.count;c.fill(n.push(v)-1,w,F),m.fill(p.push({entity:v})-1,w,F)}let u={...r,objects:n,targets:p,objectIds:c,targetIds:m};if(r.normals||t.assets.some(b=>b.normals)){let b=u.normals=new Float32Array(i*3);r.normals&&b.set(r.normals.subarray(0,e.count*3));for(let v of t.rows)Oa(b,v,e.count+v.start)}let A={...e,count:i,data:a,renderMetadata:u};if(e.opticalSplats||t.hasOpticalSplats){let b=A.opticalSplats=new Float32Array(i*12);e.opticalSplats&&b.set(e.opticalSplats.subarray(0,e.count*12));for(let v of t.rows)v.asset.opticalSplats&&b.set(v.asset.opticalSplats,(e.count+v.start)*12)}if(e.materialPixelStyles||t.hasMaterialPixelStyles){let b=A.materialPixelStyles=new Float32Array(i*4);e.materialPixelStyles&&b.set(e.materialPixelStyles.subarray(0,e.count*4));for(let v of t.rows)Ba(b,v,e.count+v.start)}for(let[b,v]of[["fine",12],["pix",8]])e[b]&&(A[b]=new Float32Array(i*v),A[b].set(e[b].subarray(0,e.count*v)));return A}function Na(e,t){if(e+t.count>Co||e+t.sharedCount>Co)throw new RangeError("Instances exceed the 24-bit splat address space")}var Yi=512,Gu=256,qa=64,Hf=Gu*4/qa;function Kf(e,t,i,a,r,n,p){let{authored:c,asset:m,center:u,extent:A,spread:j}=e;if(!c.visible||!c.opacity||m.empty)return!1;let[z,T,b]=u,v=t.view,w=.001+1e-6*(Math.abs(z)+Math.abs(T)+Math.abs(b)),F=-(v[2]*z+v[6]*T+v[10]*b+v[14]),l=A+w;if(F+l<t.clipNear)return!1;let _=Math.abs(v[0]*z+v[4]*T+v[8]*b+v[12]),C=Math.abs(v[1]*z+v[5]*T+v[9]*b+v[13]),$=j*Math.abs(p);return t.ortho?_<=i+r+l+$&&C<=a+n+l+$:_<=(i+r)*(F+l)+l+$*Math.hypot(1,1.3*i)&&C<=(a+n)*(F+l)+l+$*Math.hypot(1,1.3*a)}function Uu(e,{index:t,start:i,asset:a,matrix:r,at:n,authored:p,swatches:c,diagonal:m,mask:u}){let A=(t+1)*qa;for(let j=0;j<3;j++){let z=j*3;e.set([r[z],r[z+1],r[z+2],n[j]],A+j*4)}e.set([a.offset-i,c.length,p.opacity,+m+2*!!u],A+12),m&&e.set([n[0],n[1],n[2],r[0]],A+52),u&&e.set(u,A+16);for(let j=0;j<c.length;j++)e.set(c[j],A+20+j*2)}function $u(e,t,i,a,r){let n=t.tangent*t.aspect,p=t.tangent,c=6*n/i,m=6*p/a;return e.rows.filter(u=>Kf(u,t,n,p,c,m,r))}function Wu(e,t){return t!=null?t:Array.from({length:Math.ceil(e.count/Yi)},(i,a)=>a)}function Mo(){let e,t,i,a,r,n,p,c,m,u,A,j;return function(T,b,v){var _;let w=Ki(b);if(T!==e||b!==t||T.data!==r||T.count!==n||T.fine!==p||T.pix!==c||T.renderMetadata!==m||T.materialPixelStyles!==u||T.opticalSplats!==A){i=b.flatten(T);let{data:C,count:$,fine:I,pix:y,renderMetadata:E,materialPixelStyles:o,opticalSplats:h}=i;return j={data:C,count:$,fine:I,pix:y,renderMetadata:E,materialPixelStyles:o,opticalSplats:h},e=T,t=b,r=T.data,n=T.count,p=T.fine,c=T.pix,m=T.renderMetadata,u=T.materialPixelStyles,A=T.opticalSplats,a=w.revision,{world:i}}Object.assign(i,T,j);let F=Wu(T,v),l=new Set(F);for(let C of F){let $=C*Yi*16,I=Math.min($+Yi*16,T.count*16);i.data.set(T.data.subarray($,I),$),A&&i.opticalSplats.set(A.subarray($/16*12,I/16*12),$/16*12);let y=(_=T.renderMetadata)==null?void 0:_.normals;y&&i.renderMetadata.normals.set(y.subarray($/16*3,I/16*3),$/16*3)}if(a!==w.revision){for(let C of w.rows){if(!(C.version>a))continue;let $=T.count+C.start;Ia(i.data,C,$),Ba(i.materialPixelStyles,C,$),Oa(i.renderMetadata.normals,C,$);let I=Math.ceil(($+C.asset.count)/Yi);for(let y=Math.floor($/Yi);y<I;y++)l.add(y)}a=w.revision}return{world:i,changedRows:[...l]}}}function Vu(e,t,i){let a=e(Gu,15,i),r,n,p,c,m,u,A;return{bind(j,z,T,b,v=z.data){let w=Ki(j),F=r!==j||m!==z||u!==z.data||A!==z.count;if(F){let _=(z.count+w.sharedCount)*16;if(Math.ceil(_/(Yi*16))>i)throw new RangeError("Shared splat geometry exceeds the WebGL texture size limit");n=new Float32Array(_),n.set(v.subarray(0,z.count*16));for(let C of w.assets)n.set(C.data,(z.count+C.offset)*16)}let l=Wu(z,T);if(!F)for(let _ of l){let C=_*Yi*16;n.set(v.subarray(C,Math.min(C+Yi*16,z.count*16)),C)}if(t.upload(n,n.length,F||b?void 0:l),r!==j){p=new Float32Array((w.rows.length+1)*qa);for(let _ of w.rows)Uu(p,_);a.upload(p)}else if(c!==w.revision){let _=new Set;for(let C of w.rows)C.version>c&&(Uu(p,C),_.add(Math.floor((C.index+1)/Hf)));a.upload(p,p.length,[..._])}else a.bind();return r=j,m=z,u=z.data,A=z.count,c=w.revision,w}}}var Yf=["red","green","blue","luminance","alpha"],Xu=(e,t)=>e[0]*t[0]+e[1]*t[1]+e[2]*t[2];function Hu(e,t,i){var A,j,z,T,b;let a=[],r=[],n=0;for(let{maskSource:v}of e){if(!v){a.push(null);continue}let[w,F]=(A=v.range)!=null?A:[0,1],l=[v.type==="axis"?1:2,+(v.space!=="world"),["linear","smooth","step"].indexOf((j=v.interpolation)!=null?j:"smooth"),+!!v.invert];if(v.type==="axis"){let{direction:Y,offset:f}=t.axis(v);a.push([...l,...Y,f,w,1/(F-w)]);continue}let{x:_,z:C,origin:$}=t.plane(v.projection),[I,y]=(z=v.scale)!=null?z:[1,1],[E,o]=(T=v.offset)!=null?T:[0,0],{width:h,height:s,frames:d,fps:k=1,channels:B=4,repeat:O=!1,wrap:V=!1}=v.raster;a.push([...l,..._.map(Y=>Y/I),(-Xu(_,$)-E)/I,w,1/(F-w),n,+V,...C.map(Y=>Y/y),(-Xu(C,$)-o)/y,h,s,d.length,k,+O]),n+=h*s*d.length,r.push({frames:d,channels:B,channel:Yf.indexOf((b=v.channel)!=null?b:"alpha")})}if(!n)return{rows:a};let p=Math.min(i,1024),c=Math.ceil(n/p);if(c>i||n>2**22)throw new RangeError("WebGL look mask textures exceed their atlas budget");let m=new Float32Array(p*c),u=0;for(let{frames:v,channels:w,channel:F}of r)for(let l of v)for(let _=0;_<l.length;_+=w){let C=w===4?l[_+3]/255:1,$=F===4?1:F===3?(.3*l[_]+.55*l[_+1]+.15*l[_+2])/255:l[_+F]/255;m[u++]=$*C}return{rows:a,texture:{width:p,height:c,values:m}}}var Zf=["South","East","West","North","LeftBumper","RightBumper","LeftTrigger","RightTrigger","Back","Start","LeftStick","RightStick","DPadUp","DPadDown","DPadLeft","DPadRight","Home"],Qf=["LeftX","LeftY","RightX","RightY"],Jf=["Left","Middle","Right","Back","Forward"],ed={0:"Tip",2:"Barrel",5:"Eraser"},td=[1,4,2,8,16,32],Zu=["Alt","Control","Meta","Shift"],ja=new WeakSet,Ga=e=>Math.min(1,Math.max(-1,e)),vo=Object.freeze([]),Ku='input,textarea,select,button,a[href],[contenteditable]:not([contenteditable="false"]),[role="textbox"]';function Ua(e){return Zu.filter(t=>e[t==="Control"?"ctrlKey":t.toLowerCase()+"Key"])}function Yu(e,t){return Zu.filter(i=>e.includes(i)&&t!=="key:"+i+"Left"&&t!=="key:"+i+"Right")}function Xr(e,t){for(let[i,a]of e)Math.abs(a)>Math.abs(t[i])&&(t[i]=a)}function id(e){var a,r;let t=e.mapping==="standard",i=new Map;return Array.from((a=e.buttons)!=null?a:[]).slice(0,64).forEach((n,p)=>{let c=Number.isFinite(n==null?void 0:n.value)?n.value:n!=null&&n.pressed?1:0;i.set("pad:"+(t&&Zf[p]||"Button"+p),Math.max(0,Math.min(1,c)))}),Array.from((r=e.axes)!=null?r:[]).slice(0,32).forEach((n,p)=>{i.set("pad:"+(t&&Qf[p]||"Axis"+p),Number.isFinite(n)?Ga(n):0)}),i}function Zi(e,{toolkit:t,contexts:i,context:a,onAction:r,onPointer:n,onFocus:p,focusOnPointer:c=!0,tabStop:m=!0,motionScale:u=96,readGamepads:A}={}){var Fe,Le,te,H;let j=(H=(te=(Le=(Fe=t==null?void 0:t.KIT)!=null?Fe:t)==null?void 0:Le.procedural)==null?void 0:te.inputActions)==null?void 0:H.compile,z=e==null?void 0:e.ownerDocument,T=z==null?void 0:z.defaultView;if(typeof j!="function"||!T||typeof e.focus!="function"||ja.has(e)||[r,n,p,A].some(g=>g!==void 0&&typeof g!="function")||typeof c!="boolean"||typeof m!="boolean"||!Number.isFinite(u)||u<=0)throw new TypeError("Viewer input needs an available DOM surface, action toolkit, and valid options");let b=j(i),v=a!=null?a:Object.keys(b.profile)[0],w={...b.sample(v,vo)},F=!1,l=!0,_=!1,C=!1,$=new Set,I=new Map,y=new Map,E=new Map,o=new Set,h=new Set,s=[],d=[],k=e.getAttribute("tabindex"),B=m&&k===null&&e.tabIndex<0;B&&e.setAttribute("tabindex","0"),ja.add(e);function O(g,M,G,X){g.addEventListener(M,G,X),s.push(()=>g.removeEventListener(M,G,X))}function V(g,M,G,X){r==null||r(Object.freeze({action:g,phase:M,value:G,...X}))}function Y(g,M){var X;let G=w;w=g;for(let[ae,Q]of Object.entries(g)){if(w!==g)break;let pe=(X=G[ae])!=null?X:0;if(Q===pe)continue;let Ae=Q===0?"release":pe===0?"press":"change";Ae==="press"&&o.add(ae),Ae==="release"&&h.add(ae),V(ae,Ae,Q,M)}}function f(g){let M={...b.sample(v,vo)};for(let G of $){let X=b.resolve(v,G,1,Yu(d,G));X&&Xr([[X.action,X.value]],M)}for(let{binding:G}of I.values())G&&Xr([[G.action,G.value]],M);for(let{levels:G}of y.values())Xr(G,M);Y(M,g)}function S(g){var M;(M=e.hasPointerCapture)!=null&&M.call(e,g.id)&&e.releasePointerCapture(g.id)}function q(g,M,G,X=[0,0]){var ae,Q;n==null||n(Object.freeze({phase:M,id:g.id,device:g.device,action:(Q=(ae=g.binding)==null?void 0:ae.action)!=null?Q:null,input:g.input,point:Object.freeze(g.point.slice()),delta:Object.freeze(X),event:G}))}function P(){$.clear(),d=[],y.clear(),E.clear(),o.clear();let g=[...I.values()];I.clear(),Y({...b.sample(v,vo)},{device:"focus"});for(let M of g)S(M),q(M,"cancel")}function W(){var G,X;let g;try{g=A?A():(X=(G=T.navigator).getGamepads)==null?void 0:X.call(G)}catch{g=vo}let M=new Set;for(let[ae,Q]of Array.from(g!=null?g:vo).slice(0,16).entries()){if(!Q||Q.connected===!1)continue;M.add(ae);let pe=Q.id+"\0"+Q.mapping,Ae=y.get(ae),Pe=id(Q),Te=(Ae==null?void 0:Ae.identity)===pe?Ae.blocked:new Set([...Pe].filter(([,Me])=>Math.abs(Me)>.12).map(([Me])=>Me)),we=[];for(let[Me,He]of Pe){if(Te.has(Me)){Math.abs(He)<=.12&&Te.delete(Me);continue}let qe=b.resolve(v,Me,He);qe&&we.push([qe.action,qe.value])}y.set(ae,{identity:pe,blocked:Te,levels:we})}for(let ae of y.keys())M.has(ae)||y.delete(ae);f({device:"gamepad"})}function R(){var M,G,X;let g=!_&&l&&!C&&z.visibilityState!=="hidden"&&((G=(M=z.hasFocus)==null?void 0:M.call(z))!=null?G:!0)&&e.getRootNode().activeElement===e&&!((X=e.matches)!=null&&X.call(e,Ku))&&!e.isContentEditable;return g!==F&&(F=g,g?W():P(),p==null||p(F)),F}function U(g){var G,X,ae;let M=(X=(G=g.composedPath)==null?void 0:G.call(g)[0])!=null?X:g.target;return M===e&&!((ae=M.closest)!=null&&ae.call(M,Ku))&&!M.isContentEditable}function J(){return _||!l?!1:(e.focus({preventScroll:!0}),R())}function ie(g,M){if(!R()||!U(g)||g.defaultPrevented||g.isComposing||!g.code||g.code==="Tab"||!/^\w[\w-]{0,47}$/.test(g.code))return;let G="key:"+g.code;if(M&&g.repeat&&!$.has(G))return;d=Ua(g);let X=b.resolve(v,G,1,Yu(d,G)),ae=$.has(G);M?$.add(G):$.delete(G);let Q={device:"keyboard",input:G,event:g};f(Q),M&&g.repeat&&(X!=null&&X.value)&&V(X.action,"repeat",X.value,Q),X!=null&&X.value&&(M||ae)&&g.preventDefault()}function N(g){let M=e.getBoundingClientRect();return[g.clientX-M.left,g.clientY-M.top]}function K(g){var Pe;if(!l||g.defaultPrevented||!U(g)||I.has(g.pointerId)||I.size>=16||(c&&!R()&&J(),!R()))return;let M=g.pointerType==="touch"?"touch":g.pointerType==="pen"?"pen":"mouse",G=M==="touch"?"Contact":M==="pen"?ed[g.button]:Jf[g.button],X=Ua(g),ae=G&&M+":"+G,Q=ae?b.resolve(v,ae,1,X):null,pe=["X","Y"].some(Te=>{var we;return(we=b.resolve(v,M+":Drag"+Te,1,X))==null?void 0:we.value});if(!(Q!=null&&Q.value)&&!pe)return;let Ae={id:g.pointerId,device:M,input:ae,binding:Q,chord:X,button:g.button,point:N(g)};I.set(Ae.id,Ae);try{(Pe=e.setPointerCapture)==null||Pe.call(e,Ae.id)}catch{}g.preventDefault(),f({device:M,input:ae,event:g}),I.has(Ae.id)&&q(Ae,"start",g)}function Z(g,M,G,X){var Ae,Pe,Te;if(!Number.isFinite(M)||!M||!((Ae=b.resolve(v,g,1,G))!=null&&Ae.value))return!1;let ae=g+" "+G.join("+"),Q=((Te=(Pe=E.get(ae))==null?void 0:Pe.value)!=null?Te:0)+M;E.set(ae,{input:g,value:Q,chord:G});let pe=b.resolve(v,g,Ga(M/u),G);return pe.value&&V(pe.action,"pulse",pe.value,{...X,input:g}),!0}function ye(g){if(!R())return;let M=I.get(g.pointerId);if(!M)return;if(M.device!=="touch"&&g.isTrusted&&!(g.buttons&td[M.button])){ve(g,"end");return}let G=N(g),X=[G[0]-M.point[0],G[1]-M.point[1]];M.point=G;let ae={device:M.device,event:g};Z(M.device+":DragX",X[0],M.chord,ae),Z(M.device+":DragY",X[1],M.chord,ae),I.has(M.id)&&q(M,"move",g,X),g.preventDefault()}function ve(g,M){let G=I.get(g.pointerId);G&&(I.delete(G.id),M==="end"&&(G.point=N(g)),S(G),f({device:G.device,input:G.input,event:g}),q(G,M,g))}function ze(g){if(g.defaultPrevented||!U(g)||!R())return;let M=g.deltaMode===1?16:g.deltaMode===2?e.clientHeight:1,G=Ua(g),X={device:"wheel",event:g},ae=Z("wheel:X",g.deltaX*M,G,X),Q=Z("wheel:Y",g.deltaY*M,G,X);(ae||Q)&&g.preventDefault()}function me(g,M=v){if(_)throw new Error("Viewer input is disposed");let G=j(g);return G.sample(M,vo),P(),b=G,v=M,w={...b.sample(v,vo)},R()&&W(),b.profile}for(let[g,M]of Object.entries({focus:R,blur:R,keydown:G=>ie(G,!0),keyup:G=>ie(G,!1),pointerdown:K,pointermove:ye,pointerup:G=>ve(G,"end"),pointercancel:G=>ve(G,"cancel"),lostpointercapture:G=>ve(G,"cancel")}))O(e,g,M);return O(e,"wheel",ze,{passive:!1}),O(z,"visibilitychange",R),O(T,"blur",()=>{C=!0,R()}),O(T,"focus",()=>{C=!1,R()}),O(T,"gamepaddisconnected",()=>{R()&&W()}),Object.freeze({get focused(){return R()},get context(){return v},profile:()=>b.profile,focus:J,setProfile:me,setContext(g){g!==v&&me(b.profile,g)},setBindings(g,M,G){let X=b.profile;if(!Object.hasOwn(X,g)||!Object.hasOwn(X[g],M))throw new TypeError("Unknown viewer input context or action");return me({...X,[g]:{...X[g],[M]:G}})},setEnabled(g){if(typeof g!="boolean")throw new TypeError("Viewer input enabled state must be Boolean");l=g,R()},poll(){R()&&W();let g={...w};for(let{input:G,value:X,chord:ae}of E.values()){let Q=b.resolve(v,G,Ga(X/u),ae);Q&&Xr([[Q.action,Q.value]],g)}let M=Object.freeze({context:v,focused:F,values:Object.freeze(g),pressed:Object.freeze([...o]),released:Object.freeze([...h])});return o.clear(),h.clear(),E.clear(),M},dispose(){if(!_){_=!0;for(let g of s)g();ja.delete(e),B&&e.getAttribute("tabindex")==="0"&&e.removeAttribute("tabindex"),F&&(F=!1,P(),p==null||p(!1))}}})}var St=new Float32Array(4),Qu=new Float32Array(0),Ju=Symbol("reconstruction source");function rl(e,t,i,a){var n,p,c,m;let r=(n=e.KIT)==null?void 0:n.reconstruction;if(!r)throw new Error("World reconstruction needs the Ink Studio KIT");return r.frame(t,(m=(c=i.time)!=null?c:(p=t.lookSnapshot)==null?void 0:p.time)!=null?m:0,a)}var _o=e=>[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255];function el(e,t=64){let i=new Float32Array(t*3);for(let a=0;a<Math.min(t,e.length);a++)i.set(_o(e[a]),a*3);return i}function od(e,t){let i=new Float32Array(16);for(let a=0;a<4;a++)for(let r=0;r<4;r++){let n=0;for(let p=0;p<4;p++)n+=e[p*4+r]*t[a*4+p];i[a*4+r]=n}return i}function rd(e,t){return new Float32Array([e[0],e[4],e[8],0,e[1],e[5],e[9],0,e[2],e[6],e[10],0,...t,1])}function tl({origin:e,normal:[t,i,a]}){return[t,i,a,-(t*e[0]+i*e[1]+a*e[2])]}function il([e,t,i,a],{view:r,eye:n}){return[r[0]*e+r[4]*t+r[8]*i,r[1]*e+r[5]*t+r[9]*i,r[2]*e+r[6]*t+r[10]*i,e*n[0]+t*n[1]+i*n[2]+a]}function ad(e,t){let i=e.gpu(t),a=Float32Array.from(i.lens),r=Array.from(a,(c,m)=>Array.from(i.ramps.slice(m*8,m*8+(Math.round(c)&15)),Math.round)),n=r.map((c,m)=>m),p=c=>{for(;n[c]!==c;)c=n[c];return c};for(let c=0;c<a.length;c++)for(let m=c+1;m<a.length;m++){let u=0;for(let A of r[c])r[m].includes(A)&&u++;u>=2&&(n[p(m)]=p(c))}return a.forEach((c,m)=>{a[m]=(Math.round(c)&31)+p(m)*32}),{...i,lens:a}}function nd(e){return e.replaceAll("u_pixOn > 0.5","false").replaceAll("u_ao > 0.0","false").replaceAll("u_toneOn > 0.5","false").replaceAll("u_remapLine > 0","false").replaceAll("u_grade > 0.5","false").replace("if (u_gk <= 0.0) return c;","return c;")}function mi(e,t){return(e==null?void 0:e.length)===t.length&&t.every((i,a)=>i===e[a])}function ol(e,t,i,a){var A,j,z,T,b,v,w,F,l,_,C,$,I,y,E,o,h,s,d,k,B;let r=gi(e),n=(j=(A=t.KIT)==null?void 0:A.procedural)==null?void 0:j.sampleCoverage,p=(b=t.ContributionRules)!=null?b:(T=(z=t.KIT)==null?void 0:z.procedural)==null?void 0:T.contributionRules,c=(w=t.StableDetail)!=null?w:(v=t.KIT)==null?void 0:v.stableDetail,m=(F=t.KIT)==null?void 0:F.cutaway,u;try{let Zl=function(x,L,ee,oe,re,he,be,_e,le,Ee,ge,ue,Ge,ce,Be){var ao,si,no,so,co,ji,Dt,Ui;let et=(no=(si=L.time)!=null?si:(ao=x.lookSnapshot)==null?void 0:ao.time)!=null?no:0,ct=Ee&&(zt==null?void 0:zt.source)===ue&&zt.histories===ge&&et<zt.sceneTime,ut=ge.get(ue);if(!Ee||L.order?ge.delete(ue):(ut||ge.set(ue,ut=qo.history()),(L.resetTransparency||ct)&&ut.reset()),L.order){u.setOrder(Be?L.order.filter(ci=>Be.keep[ci]):L.order),zt=null;return}let De=(so=x.moving)!=null?so:[],Je=(co=x.back)!=null?co:[],tt=a&&!((Dt=(ji=x.anim)==null?void 0:ji.bones)!=null&&Dt.length),$e=De.length?[oe,...Ge,...ce]:[],ht=he?[be,_e,le,ee.tangent,ee.clipNear,+ee.ortho]:[];if(tt&&!re&&(((Ui=L.changedRows)==null?void 0:Ui.length)===0||he&&!x.count&&!L.changedRows)&&!L.resetTransparency&&!ct&&(zt==null?void 0:zt.tolerance)===Ee&&mi(zt.clock,$e)&&(!Ee||zt.histories===ge)&&zt.quality===Be&&zt.revision===(he==null?void 0:he.orderRevision)&&mi(zt.viewport,ht)&&mi(zt.view,ee.view)&&mi(zt.moving,De)&&mi(zt.back,Je)){zt.sceneTime=et;return}let mt=he&&$u(he,ee,be,_e,le),Qe=Ee&&Je.length?new Set(Je):null,{data:lt,opticalSplats:yt}=x,ni=Ee?(ci,yr)=>ut.sort(ci,{data:ue.data,layout:L.instances,view:ee.view,time:et,tolerance:Ee,depthAt:uo=>yr[uo],transparentAt:uo=>qo.isTransparent(lt,uo,lt[uo*16+3],yt==null?void 0:yt[uo*12+3],Qe)}):void 0,Si=Vl(x,ee.view,oe,mt,he==null?void 0:he.rows,ni,Ge,ce);u.setOrder(Be?Si.filter(ci=>Be.keep[ci]):Si,!!he),zt=tt?{view:ee.view,moving:Int32Array.from(De),back:Int32Array.from(Je),clock:$e,tolerance:Ee,sceneTime:et,source:ue,histories:ge,revision:he==null?void 0:he.orderRevision,viewport:ht,quality:Be}:null},Ql=function(x,L){var le;if(!(L!=null&&L.affectsCleanup)&&!(L!=null&&L.fineOff))return null;let ee=x.look.detailBudgets,oe=de.get(x);if((oe==null?void 0:oe.definition)===ee&&oe.count===x.count&&oe.metadata===x.renderMetadata&&oe.tiles===x.fine)return oe;let re=L.bind(x),he=L.affectsCleanup&&Float32Array.from({length:x.count},(Ee,ge)=>At.flags(re(ge))),be=x.fine;if(be&&L.fineOff)for(let Ee=0;Ee<x.count;Ee++){let ge=Ee*12+11;be[ge]&&((le=re(Ee))==null?void 0:le.fine)===!1&&(be===x.fine&&(be=be.slice()),be[ge]=0)}let _e={definition:ee,count:x.count,metadata:x.renderMetadata,tiles:x.fine,fine:be,flags:he&&he.some(Boolean)?he:null};return de.set(x,_e),_e},Jl=function(x,L,ee,oe,re){var _e;if(!(ee!=null&&ee.rows))return null;let he=ke.get(x);if(((_e=L.changedRows)==null?void 0:_e.length)===0&&(he==null?void 0:he.key)===oe&&he.data===x.data&&he.metadata===x.renderMetadata&&he.count===x.count&&he.particleStart===re)return he.selection;let be=wt.planRows(x,ee,{particleStart:re,silhouette:L.silhouetteProtection});return ke.set(x,{key:oe,data:x.data,metadata:x.renderMetadata,count:x.count,particleStart:re,selection:be}),be},ef=function(x,L,ee,oe){var _e,le;let re=x.materialPixelStyles,he=dt;if(!he||he.group!==L||he.source!==re||he.count!==x.count){let Ee=re;if(ee){Ee=new Float32Array((x.count+ee.sharedCount)*4),re&&Ee.set(re.subarray(0,x.count*4));for(let ge of ee.assets)ge.materialPixelStyles&&Ee.set(ge.materialPixelStyles,(x.count+ge.offset)*4)}dt={group:L,source:re,rows:Ee,count:x.count},Ve.upload(Ee,(x.count+((_e=ee==null?void 0:ee.sharedCount)!=null?_e:0))*4)}else if(oe!=null&&oe.length&&re){if(ee)for(let Ee of oe){let ge=Ee*512*4,ue=Math.min(ge+512*4,x.count*4);he.rows.set(re.subarray(ge,ue),ge)}Ve.upload(he.rows,(x.count+((le=ee==null?void 0:ee.sharedCount)!=null?le:0))*4,oe)}else Ve.bind()},tf=function(x,L,ee,oe,re){if(!i||cn||x||L||ee||oe||re)return f;if(!ra)try{ra=Y(nd(V.POST_FS))}catch(he){if(e.isContextLost())throw he;return cn=!0,f}return ra},ai=function(x,L,ee,oe,re){e.bindFramebuffer(e.FRAMEBUFFER,L),e.viewport(0,0,ee,oe),e.bindVertexArray(R),e.useProgram(x.p),x.set(re),e.drawArrays(e.TRIANGLES,0,3)},of=function(x){var ee,oe,re;let L=JSON.stringify(x);if(_n!==L){let he=x?t.PixelLook.prepareTone(x,(re=(oe=(ee=t.KIT)==null?void 0:ee.procedural)==null?void 0:oe.materials)!=null&&re.blueNoise?({seed:be})=>t.KIT.procedural.materials.blueNoise({seed:be}):void 0):null;if(he){let be=Math.max(48,he.width),_e=he.height+1,le=new Float32Array(be*_e*4);he.stops.forEach(([Ee,ge],ue)=>le.set([..._o(parseInt(ge.slice(1),16)),Ee],ue*4));for(let Ee=0;Ee<he.height;Ee++)for(let ge=0;ge<he.width;ge++)le[((Ee+1)*be+ge)*4]=he.thresholds[Ee*he.width+ge];Z(12,Tt),e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,be,_e,0,e.RGBA,e.FLOAT,le)}_n=L,ro=he}return ro?(Z(12,Tt),{u_toneOn:1,u_toneCut:ro.cutoff,u_toneAmt:ro.amount,u_toneN:ro.stops.length,u_toneStops:12,u_toneThSize:[ro.width,ro.height]}):{u_toneOn:0}},rf=function(x,L,ee){var he,be,_e;if(L===void 0||L===!1)return null;let oe=JSON.stringify([L,x.pal,x.paletteRoles,ee],(le,Ee)=>le!=="frames"||!Array.isArray(Ee)?Ee:(ta.has(Ee)||ta.set(Ee,++Wl),{rasterFrames:ta.get(Ee)}));if(oe===Ji&&x===Nt&&x.renderMetadata===Xt&&x.count===ki)return nr;let re=t.PixelLook.preparePaletteConstraints(L,{palette:x.pal,roles:x.paletteRoles,blueNoise:(_e=(be=(he=t.KIT)==null?void 0:he.procedural)==null?void 0:be.materials)==null?void 0:_e.blueNoise,skipMasks:ee,skipDitherRegions:!0,maskSupported:le=>!!(p!=null&&p.supportsMask(le))});if(re){Ut!=null||(Ut=r.texture()),_i!=null||(_i=K(1024,4,U)),Po=49+Math.ceil(Math.max(...re.palettes.map(ue=>ue.ranks.length))/4),Lo=Po+Math.max(...re.palettes.map(ue=>{var Ge,ce;return((ce=(Ge=ue.grade)==null?void 0:Ge.length)!=null?ce:0)/3})),re.masked=re.palettes.some(ue=>ue.maskSource);let le=re.masked&&Hu(re.palettes,p,U);re.textured=!!(le!=null&&le.texture),Io=Lo+(re.masked?6:0),Bo=Io+(re.palettes.some(ue=>ue.matchId)?48:0);let Ee=Bo+Math.max(...re.palettes.map(ue=>{var Ge,ce;return(ce=(Ge=ue.pairs)==null?void 0:Ge.length)!=null?ce:0})),ge=new Float32Array(Ee*4*re.palettes.length);if(re.palettes.forEach((ue,Ge)=>{var Be,et,ct,ut,De,Je,tt,$e,ht;let ce=Ge*Ee*4;if(ge.set([ue.count,ue.packed.length,ue.width,ue.height],ce),ue.mapOnly||ue.swatches.forEach((mt,Qe)=>ge.set(mt,ce+(Qe+1)*4)),ge[ce+7]=ue.amount,ge[ce+11]=+(ue.source==="graded"),ge[ce+15]=ue.mapOnly?2:+!!ue.grade,ge[ce+19]=(Be=ue.matchId)!=null?Be:0,ge[ce+23]=ue.pairs?ue.pairs.length+1:0,ge[ce+27]=(ct=(et=ue.tuning)==null?void 0:et.scale)!=null?ct:1,ge[ce+31]=(De=(ut=ue.tuning)==null?void 0:ut.screenGain)!=null?De:1,(Je=ue.reserveAccess)==null||Je.forEach((mt,Qe)=>{let lt=ue.count+Qe,yt=Math.floor(lt/24),ni=1<<lt%24;mt&1&&(ge[ce+(8+yt)*4+3]+=ni),mt&2&&(ge[ce+(10+yt)*4+3]+=ni)}),(tt=ue.pairs)==null||tt.forEach(({slots:mt,lightness:Qe},lt)=>ge.set([...mt,...Qe!=null?Qe:[-1,1]],ce+(Bo+lt)*4)),($e=ue.lab)==null||$e.forEach((mt,Qe)=>ge.set(mt,ce+(Io+Qe)*4)),ge.set(ue.ranks,ce+49*4),ue.grade)for(let mt=0;mt<ue.grade.length/3;mt++)ge.set(ue.grade.subarray(mt*3,mt*3+3),ce+(Po+mt)*4);(ht=le==null?void 0:le.rows)!=null&&ht[Ge]&&ge.set(le.rows[Ge],ce+Lo*4)}),Z(8,Ut),e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,Ee,re.palettes.length,0,e.RGBA,e.FLOAT,ge),_i.upload(Float32Array.from(re.slots(x))),le!=null&&le.texture){let{width:ue,height:Ge,values:ce}=le.texture;No!=null||(No=r.texture()),Z(14,No),e.texImage2D(e.TEXTURE_2D,0,e.R32F,ue,Ge,0,e.RED,e.FLOAT,ce)}}return Ji=oe,Nt=x,Xt=x.renderMetadata,ki=x.count,nr=re,re},af=function(x,L){var Be,et;sr!=null||(sr=K(1024,10,U));let{data:ee,pix:oe,renderMetadata:re,surfaceData:he,anim:be,count:_e}=x,le=(et=(Be=x.rest)!=null?Be:be==null?void 0:be.base)!=null?et:ee,Ee=[x,oe,re,he,le,_e],ge=mi(Oo==null?void 0:Oo.sources,Ee),ue=ge?Oo.values:new Float32Array(_e*8),Ge=ge?le===ee?L:[]:void 0,ce=(ct,ut)=>{var Je;let De=re==null?void 0:re.normals;for(let tt=ct;tt<ut;tt++){let $e=tt*3,ht=tt*8,mt=tt*16,Qe,lt;oe!=null&&oe[ht]?(Qe=oe,lt=ht+3):De!=null&&De[$e]||De!=null&&De[$e+1]||De!=null&&De[$e+2]?(Qe=De,lt=$e):he!=null&&he[ht]&&(Qe=he,lt=ht+1);for(let yt=0;yt<3;yt++)ue[ht+yt]=(Je=Qe==null?void 0:Qe[lt+yt])!=null?Je:0,ue[ht+4+yt]=le[mt+yt]}};if(Ge===void 0)ce(0,_e);else for(let ct of Ge)ce(ct*512,Math.min(_e,(ct+1)*512));sr.upload(ue,ue.length,Ge),Oo={sources:Ee,values:ue}},nf=function(x){if(!x){pt.bind();return}oo.length!==x.length&&(oo=new Float32Array(x.length));for(let L=0;L<x.length;L+=12)for(let ee=0;ee<3;ee++){let oe=L+ee*3,re=L+ee*4;oo[re]=x[oe],oo[re+1]=x[oe+1],oo[re+2]=x[oe+2],oo[re+3]=x[L+9+ee]}pt.upload(oo)},sf=function(x,L){var ge;hr=0;let ee=(ge=L.edgeTable)==null?void 0:ge.call(L,x);if(!(ee!=null&&ee.any)||!L.anchors)return;let{count:oe,data:re,detail:he,pix:be,pats:_e}=x,le=x.reconstructionPose?x._anchors:L.anchors({count:oe,data:re,detail:he,pix:be,pats:_e});if(!(le!=null&&le.n))return;dr!=null||(dr=r.program(V.SPR_VS,V.SPR_FS)),pr!=null||(pr=N(1,{depth:!0})),Uo!=null||(Uo=r.texture()),Go!=null||(Go=K(768,14,U));let Ee=new Float32Array(12*96*4);for(let ue=0;ue<32;ue++)Ee.set(ee.per.subarray(ue*8,ue*8+8),ue*48);ee.sprites.forEach((ue,Ge)=>{let ce=(32+Ge)*48;Ee.set([ue.w,ue.h,ue.ax,ue.sink],ce),Ee.set(ue.cells.slice(0,44),ce+4)}),Z(12,Uo),e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,12,96,0,e.RGBA,e.FLOAT,Ee),Go.upload(le.data),hr=le.n},cf=function(x,L,ee,oe,re,he,be){var _e,le,Ee,ge;if(!x)return null;if(ae!=null||(ae=r.texture()),Z(3,ae),x!==Se||!Q){let{width:ue,height:Ge,data:ce,uniforms:Be}=x.pack();ue===Ie&&Ge===ne?e.texSubImage2D(e.TEXTURE_2D,0,0,0,ue,Ge,e.RGBA,e.FLOAT,ce):(e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,ue,Ge,0,e.RGBA,e.FLOAT,ce),Ie=ue,ne=Ge),Q=Be,Se=x}return{...Q,u_waterData:3,u_waterView:L.view,u_waterEye:L.eye,u_arrivalPlane:oe,u_waterCamera:[L.tangent*L.aspect,L.tangent,+L.ortho],u_waterTime:ee,u_waterReflections:re?23:0,u_waterReflectionCount:(_e=re==null?void 0:re.count)!=null?_e:0,u_waterReflectionActive:(le=re==null?void 0:re.active)!=null?le:St,u_waterReflectionHeights:(Ee=re==null?void 0:re.heights)!=null?Ee:St,u_waterReflectionGrid:(ge=re==null?void 0:re.grid)!=null?ge:[2,1],u_waterReflectionViewport:[he,be],u_waterProjection:L.projection}},uf=function(x,L){let ee=!!x.u_waterAirCount,oe=!!x.u_waterLayered,re=!!x.u_waterAtlas,he=+ee+2*oe+4*re+8*Number(L);return g.has(he)||g.set(he,{airPockets:ee,layered:oe,atlas:re,sources:O({water:!0,airPockets:ee,layered:oe,atlas:re,environment:L})}),g.get(he)},go=function(x,L,ee,oe,re,he,be,_e){var ue,Ge,ce,Be,et,ct,ut,De,Je,tt,$e,ht,mt;if(e.bindFramebuffer(e.FRAMEBUFFER,L.framebuffer),e.viewport(0,0,ee,oe),re.u_paintPass)e.clearBufferfv(e.COLOR,0,St),e.clearBufferfv(e.COLOR,1,St),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA);else if(re.u_idx)e.disable(e.BLEND),re.u_idx===3&&(e.clearBufferfv(e.DEPTH,0,St),e.enable(e.DEPTH_TEST),e.depthFunc(e.GREATER)),e.clearBufferfv(e.COLOR,0,St),re.u_idx===1&&L.textures.length>1&&e.clearBufferfv(e.COLOR,1,St),re.u_idx===1&&L.textures.length>2&&e.clearBufferfv(e.COLOR,2,St);else{if(_e){let Qe=be?(ue=be.skyPrograms)!=null?ue:be.skyPrograms=new Map:me,lt=!!re.layeredGlass,yt=+lt+2*!!_e.lit;Qe.has(yt)||Qe.set(yt,Y(be?Sa(be.airPockets,be.layered,be.atlas,!0,lt,_e.lit):lu(lt,_e.lit))),e.disable(e.BLEND),ai(Qe.get(yt),L.framebuffer,ee,oe,{...he,..._e.uniforms,u_envViewport:[ee,oe],u_waterViewport:[ee,oe]})}else if(he?((Ge=be.background)!=null||(be.background=Y(Sa(be.airPockets,be.layered,be.atlas))),e.disable(e.BLEND),ai(be.background,L.framebuffer,ee,oe,{...he,u_waterViewport:[ee,oe],u_waterBackground:re.background.slice(0,3)})):(e.clearBufferfv(e.COLOR,0,re.background),e.clearBufferfv(e.COLOR,1,[1,0,0,1])),re.layeredGlass){let Qe=L.textures.length-2;e.clearBufferfv(e.COLOR,Qe,re.background),e.clearBufferfv(e.COLOR,Qe+1,[1,1,1,1])}e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA)}let le=re.surfaces,Ee=re.scaleSurfaces,ge=!!(le||Ee!=null&&Ee.some(Boolean));if(ge||(Be=(ce=re.surfaceFrame)==null?void 0:ce.lighting)!=null&&Be.display){let Qe={geometryUpdatesSince:(et=t.SpriteSurface)==null?void 0:et.geometryUpdatesSince,updatesSince:(Je=(ct=t.SpriteSurface)==null?void 0:ct.updatesSince)!=null?Je:(De=(ut=t.KIT)==null?void 0:ut.ecology)==null?void 0:De.atlasUpdates,cutaway:m==null?void 0:m.glsl};if(L.ensureDepth(),e.enable(e.DEPTH_TEST),e.depthFunc(e.LEQUAL),e.depthMask(!0),e.clearBufferfv(e.DEPTH,0,[1]),e.disable(e.BLEND),le&&(to!=null||(to=zo(e,Qe)),to.draw(le,{...re.surfaceFrame,water:he,wet:be,width:ee,height:oe})),Ee){e.depthFunc(e.LESS);for(let[lt,yt]of Ee.entries())yt&&((tt=jo[lt])!=null||(jo[lt]=zo(e,Qe)),jo[lt].draw(yt,{...re.surfaceFrame,water:he,wet:be,width:ee,height:oe}));e.depthFunc(e.LEQUAL)}(ht=($e=re.surfaceFrame)==null?void 0:$e.lighting)!=null&&ht.display&&(io!=null||(io=zo(e,{cutaway:m==null?void 0:m.glsl})),io.draw(re.surfaceFrame.lighting.display,{...re.surfaceFrame,lighting:null,water:he,wet:be,width:ee,height:oe})),ri.bind(),e.depthMask(!1),re.u_idx||(e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE_MINUS_SRC_ALPHA))}else re.u_idx!==3&&e.disable(e.DEPTH_TEST);e.useProgram(x.p),x.set({...re,u_geometryDepth:+ge,u_paintPass:!!re.u_paintPass,u_materialGridScale:(mt=re.u_materialGridScale)!=null?mt:1,u_viewport:[ee,oe],u_lookViewport:[ee,oe],...re.lookGrid&&{u_lookViewportScale:[re.lookGrid[0]/ee,re.lookGrid[1]/oe]},u_focal:oe/2/re.tangent}),re.u_idx===3?(u.drawSubset(re.indices),e.disable(e.DEPTH_TEST)):u.draw(),e.disable(e.DEPTH_TEST),e.depthMask(!0)},lf=function(x,L,ee,oe,re,he,be,_e,le,Ee,ge,ue,Ge,ce){var ct,ut;let Be=ge?qe:pr;Be.resize(ee,oe),ri.bind(),Z(13,null),Z(12,Uo),Go.bind(),e.bindFramebuffer(e.FRAMEBUFFER,Be.framebuffer),e.viewport(0,0,ee,oe),e.clearBufferfv(e.COLOR,0,St),ge&&e.clearBufferfv(e.COLOR,1,St),e.clearBufferfv(e.DEPTH,0,[1]),e.disable(e.BLEND),e.enable(e.DEPTH_TEST),e.depthFunc(e.LESS);let et;if(Ge||ce){let De=[!!le,le==null?void 0:le.airPockets,le==null?void 0:le.layered,le==null?void 0:le.atlas,!!(ue!=null&&ue.media),!!Ge,!!(ue!=null&&ue.lit),!!ce].join("/");if(!jt.has(De)){let Je=O({water:!!le,airPockets:le==null?void 0:le.airPockets,layered:le==null?void 0:le.layered,atlas:le==null?void 0:le.atlas,environment:!!(ue!=null&&ue.media),emitterFog:!!(ue!=null&&ue.lit),relighting:Ge,cutaway:ce?m.glsl:void 0});jt.set(De,r.program(Je.SPR_VS,Je.SPR_FS))}et=jt.get(De)}else et=le?(ct=le.sprites)!=null?ct:le.sprites=r.program(le.sources.SPR_VS,le.sources.SPR_FS):ue!=null&&ue.media?aa!=null?aa:aa=r.program(V.SPR_VS,O({environment:!0}).SPR_FS):dr;return e.useProgram(et.p),et.set({u_anc:14,u_sprTex:12,u_dat:0,u_depth:2,u_idxTex:9,u_pixTex:10,u_view:x.view,u_proj:x.projection,u_vp:[ee,oe],u_splatPlane:Ee,u_spriteCover:ge!=null?ge:St,u_rng:x.depthRange,u_time:re,u_keep:t.KIT.pixel.anchorKeep(L,x.footprint),u_ortho:+x.ortho,u_rmpN4:It.gpu.lens,u_pview:x.view,u_peye:x.eye,u_tanF:x.tangent,u_asp:x.aspect,u_portho:+x.ortho,u_eGap:((ut=he==null?void 0:he.gap)!=null?ut:.3)/(2*x.radius),u_tol:3*x.footprint+.02,...be,...ue==null?void 0:ue.uniforms,...ce,...Ge&&{u_relight:Lt},...be||ue!=null&&ue.media||Ge?{u_waterSpritePalette:_e,u_rmp4:It.gpu.ramps}:{}}),e.bindVertexArray(R),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,hr),e.disable(e.DEPTH_TEST),Z(13,Be.textures[0]),Be.textures[1]},xn=function(x,L,ee,oe,re,he,be){var Ee,ge,ue,Ge,ce,Be;let _e=ou(x,L,ee,oe,re,(Ee=t.KIT)==null?void 0:Ee.reflection,U,(be==null?void 0:be.captures)&&(et=>wt.reflectionPlan(be,et)));if(!(_e!=null&&_e.captures.length))return null;yo!=null||(yo=r.texture());let le=[_e.width*_e.grid[0],_e.height*_e.grid[1]];Z(23,yo),mi(sn,le)||(e.texImage2D(e.TEXTURE_2D,0,e.RGBA8,...le,0,e.RGBA,e.UNSIGNED_BYTE,null),sn=le);for(let et of _e.captures){let{width:ct,height:ut}=et,De=ct!==_e.width||ut!==_e.height,Je=De?oa!=null?oa:oa=N():ia!=null?ia:ia=N();Je.resize(ct,ut);let tt=x,$e=L.instances;$e&&et.plane.select&&(qi!=null||(qi=Mo()),tt=qi(x,$e,L.changedRows).world,$e=void 0);let ht=(Ge=(ue=L.time)!=null?ue:(ge=x.lookSnapshot)==null?void 0:ge.time)!=null?Ge:0,mt=(ce=it==null?void 0:it.clock(x,L).scene)!=null?ce:ht;tt=ru(tt,et.plane,mt,t),$o(tt,{...L,instances:$e,order:void 0,changedRows:void 0,water:!1,reflections:!1,raw:(Be=L.raw)!=null?Be:!1,outline:!1,dither:0,damp:!1,edges:!1,clean:!1,tone:!1},ct,ut,Je.framebuffer,et.camera,et.equation,void 0,!0,he),e.bindFramebuffer(e.READ_FRAMEBUFFER,Je.framebuffer),Z(23,yo);let Qe=et.slot%2*_e.width,lt=Math.floor(et.slot/2)*_e.height;De?(cr!=null||(cr=r.allocate("Framebuffer")),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,cr),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,yo,0),e.blitFramebuffer(0,0,ct,ut,Qe,lt,Qe+_e.width,lt+_e.height,e.COLOR_BUFFER_BIT,e.LINEAR)):e.copyTexSubImage2D(e.TEXTURE_2D,0,Qe,lt,0,0,ct,ut)}return e.activeTexture(e.TEXTURE0),_e},yn=function(x,L,ee){var le,Ee,ge,ue;let oe=(Ee=L.reconstruction)!=null?Ee:(le=x.look)==null?void 0:le.reconstruction;if(oe===void 0||oe===!1)return{world:x,frame:L};let re=x,he=L.instances,be=he?ee(x,he,L.changedRows):null,_e=rl(t,(ge=be==null?void 0:be.world)!=null?ge:x,L,oe);return _e===((ue=be==null?void 0:be.world)!=null?ue:x)?{world:x,frame:L}:{world:_e,frame:{...L,[Ju]:{source:re,layout:he},instances:void 0,changedRows:void 0}}},$o=function(x,L,ee,oe,re,he,be=St,_e,le=!1,Ee=0){var Ln,In,Bn,On,Nn,qn,jn,Un,Gn,$n,Wn,Vn,Xn,Hn,Kn,Yn,Zn,Qn,Jn,es,ts,is,os,rs,as,ns,ss,cs,us,ls,fs,ds,ps,hs,ms,vs,_s,xs,ys,bs,gs,ws,ks,Ts,Es,As,Ss,Rs,zs,Fs,Cs,Ms,Ds,Ps,Ls,Is,Bs,Os,Ns,qs,js,Us,Gs,$s,Ws,Vs,Xs,Hs,Ks,Ys,Zs,Qs,Js,ec,tc,ic,oc,rc,ac,nc,sc,cc,uc,lc,fc,dc,pc,hc,mc,vc,_c,xc,yc,bc,gc,wc,kc,Tc,Ec,Ac,Sc,Rc,zc,Fc,Cc,Mc,Dc,Pc,Lc,Ic,Bc,Oc,Nc,qc,jc,Uc,Gc,$c,Wc,Vc,Xc;let ge=L[Ju],ue=(Ln=ge==null?void 0:ge.source)!=null?Ln:x,Ge=be===St?Kl:Yl,ce=he!=null?he:Xi(x,L,ee,oe);x.shadowLod&&L.shadowArt!==!1&&(x=(On=(Bn=(In=t.KIT)==null?void 0:In.shadowArt)==null?void 0:Bn.frame(x,ce.shadowFootprint))!=null?On:x);let{raw:Be=!1,outline:et=!0,dither:ct=.35,scale:ut=1}=L,De=(Nn=x.look)!=null?Nn:{},Je=it==null?void 0:it.clock(x,L),tt=(Gn=(Un=(qn=Je==null?void 0:Je.time)!=null?qn:L.time)!=null?Un:(jn=x.lookSnapshot)==null?void 0:jn.time)!=null?Gn:0,$e=($n=Je==null?void 0:Je.scene)!=null?$n:L.stepAnimation!==!1&&De.pixel?Math.floor(tt*10)/10:tt;if(L.strictContract){if(!it)throw new Error("Strict frame validation needs the Ink Studio KIT");it.requirePortable(x,L)}let ht=(it==null?void 0:it.hasStages(x,L))&&!it.compatibility(x,L).length,mt=(Wn=L.passQuality)!=null?Wn:De.passQuality;if(mt&&!wt)throw new Error("Pass quality needs the Ink Studio KIT");let Qe=wt==null?void 0:wt.prepare(mt),lt=Qe?JSON.stringify([mt,(Vn=L.silhouetteProtection)!=null?Vn:De.silhouetteProtection]):"",yt=(Xn=L.cutaway)!=null?Xn:De.cutaway;if(yt&&!m)throw new Error("Cutaways need the Ink Studio KIT");let ni=m==null?void 0:m.prepare(yt),Si=ni&&m.uniforms(ni,ce.setback);if(!le&&be===St){let Re=ni?JSON.stringify(ni):null;Re!==mn&&(Qt=!1),mn=Re}let ao=(Hn=L.stableDetail)!=null?Hn:De.stableDetail;if(ao&&!c)throw new Error("Stable detail needs the Ink Studio KIT");let si=c==null?void 0:c.prepare(ao),no=(Kn=si==null?void 0:si.texture)!=null?Kn:[0,0],so=(Yn=si==null?void 0:si.geometry)!=null?Yn:[0,0],co=[...no,...so];mi(hn,co)||(Qt=!1),hn=co;let ji=(Jn=(Qn=qo==null?void 0:qo.transparency((Zn=L.stableTransparency)!=null?Zn:De.stableTransparency))==null?void 0:Qn.depthTolerance)!=null?Jn:0,Dt=Be?null:At==null?void 0:At.prepare(De.detailBudgets),Ui=!Be&&((es=L.clean)!=null?es:!!De.clean),ci=(Dt==null?void 0:Dt.affectsCleanup)&&(Ui||(Dt==null?void 0:Dt.enablesCleanup)),yr=(ts=L.paletteConstraints)!=null?ts:De.paletteConstraints,uo=L.areaLights!==!1&&((is=x.areaLights)==null?void 0:is.length)||Array.isArray(L.areaLights)&&L.areaLights.length||((as=(rs=(os=L.volumeLighting)!=null?os:x.volumeLighting)==null?void 0:rs.spots)==null?void 0:as.length),gn=qt&&((ns=L.relighting)!=null?ns:x.relighting),Gt=L.instances,da=(ss=L.afterimages)!=null?ss:De.afterimages,wn=!le&&!L.order&&da!==void 0&&da!==!1;if(wn&&!Ti)throw new Error("Afterimages need the Ink Studio KIT");let wo=wn?Ti.prepare(da):[],hf=wo.length?null:xn(x,L,ce,ee,oe,0,Qe);if(Gt&&(ze.has(x)||ht||Qe!=null&&Qe.rows||wo.length||L[Vi]||L.order||ji||gn||uo||x.opticalSplats||Ki(Gt).hasOpticalSplats||!Be&&(yr||De.pixel&&x.pix||ci||Dt!=null&&Dt.fineOn||Dt!=null&&Dt.fineOff))){qi!=null||(qi=Mo());let Re=qi(x,Gt,L.changedRows);x=Re.world,L={...L,changedRows:Re.changedRows},Gt=void 0}let br=(cs=L.afterimageHistory)!=null?cs:be===St?Xl:Hl,Wo=Ee;if(!le&&(L.resetAfterimages||!wo.length)&&(br==null||br.clear()),wo.length){let Re=br.frame(x,tt,wo,{source:ue,layout:(us=ge==null?void 0:ge.layout)!=null?us:L.instances,poseTime:$e,bornAt:L.bornAt,withdrawal:(fs=(ls=L.sampleWithdrawal)!=null?ls:x.sampleWithdrawal)!=null?fs:0});Re.length&&(Wo=x.count,x=Ti.append(x,Re))}let mf=wo.length?xn(x,{...L,instances:Gt},ce,ee,oe,Wo,Qe):hf,Gi=ht&&it.stagePlan(x,L,$e,{skipMasks:L.lookMasks===!1,blueNoise:Re=>t.KIT.procedural.materials.blueNoise(Re),query:()=>t.KIT.world.query.fromScene(x,$e)}),pa=Jl(x,L,Qe,lt,Wo||x.count),bt=!Be&&rf(x,yr,L.lookMasks===!1),Pt=!Be&&((ds=L.coverageAware)!=null?ds:De.coverageAware)===!0,Ri=!!(bt!=null&&bt.masked);Ri&&!Pt&&(pe!=null||(pe=N(2)));let ko=(ps=L[Vi])!=null&&ps.depth?M!=null?M:M=N(3):Ri&&!Pt?pe:te,yi=L.water!==!1&&((hs=x.water)!=null&&hs.count)?x.water:null,gr=Array.isArray(De.optics)&&De.optics.some(Re=>Re.driver)?(_s=(vs=L.time)!=null?vs:(ms=x.lookSnapshot)==null?void 0:ms.time)!=null?_s:0:void 0;!Be&&yi&&(De.optics!==gt||x!==xt||gr!==ft)&&(gt=De.optics,xt=x,ft=gr,Ye=(gs=t.RenderStages)==null?void 0:gs.optics(De.optics,{palette:x.pal,roles:x.paletteRoles,time:gr,query:()=>{var Re,at,_t,pi,Pi,ho;return(ho=(_t=(Re=x.lookSnapshot)==null?void 0:Re.query)!=null?_t:(at=x.surfaceEffects)==null?void 0:at.query)!=null?ho:(Pi=(pi=t.KIT)==null?void 0:pi.world)==null?void 0:Pi.query.fromScene(x,gr)},blueNoise:(bs=(ys=(xs=t.KIT)==null?void 0:xs.procedural)==null?void 0:ys.materials)==null?void 0:bs.blueNoise}));let To=Be?null:Ye;yi&&(yi!==Ce||bt!==Ue||To!==Ke)&&(Ce=yi,Ue=bt,Ke=To,ot=(bt||To)&&(yi!=null&&yi.mapColors)?yi.mapColors((Re,at)=>{var _t;return(_t=To==null?void 0:To.transform({kind:"medium",medium:Re,mediumKind:at}))!=null?_t:t.PixelLook.mediumTransform(bt,{medium:Re,mediumKind:at})}):yi);let zi=yi?ot:null;zi&&(G!=null||(G=N(3)),X!=null||(X=N(3)));let Jt=!1;if(Pt&&((ws=x.refract)!=null?ws:6)>0&&be===St&&!_e&&J>=(zi?5:4)){if(x!==an||x.data!==nn||((ks=L.changedRows)==null?void 0:ks.length)!==0){let Re=[];for(let at=0;at<x.count;at++)Math.round(x.data[at*16+11])&256&&Re.push(at);mi(eo,Re)||(eo=Int32Array.from(Re)),an=x,nn=x.data}Jt=!!(eo!=null&&eo.length)}Jt&&(Ae!=null||(Ae=N(1,{depth:!0})),Ae.resize(ee,oe),zi?Te!=null||(Te=N(5)):Pe!=null||(Pe=N(4)));let ui=zi?Jt?Te:G:Jt?Pe:Fe,Eo=zi?X:Le,Vo=x!==Ei||x.data!==na||x.count!==sa||Gt!==vr,Xo=(Ts=t.KIT)==null?void 0:Ts.pixel,Bt=!Be&&!!(De.pixel&&x.pix&&(Xo!=null&&Xo.gpu)),Ho=!!(x.materialPixelStyles||Gt&&Ki(Gt).hasMaterialPixelStyles),kn=(As=(Es=L.splatCoverage)!=null?Es:De.splatCoverage)!=null?As:"legacy",Tn=(Rs=(Ss=p==null?void 0:p.coverageMode)==null?void 0:Ss.call(p,kn))!=null?Rs:["legacy","continuous","soft"].indexOf(kn);if(Tn<0)throw new RangeError("Splat coverage must be legacy, continuous or soft");let bi=!Be&&!Gi&&!Bt&&!Pt&&((zs=L.colored)!=null?zs:!0),ei=Ql(x,Dt),Fi=!!ci&&!!(ei!=null&&ei.flags),wr=Ui||Fi,kr=!Be&&!Gi&&!Pt&&!bi&&!bt&&!!De.pixel&&L.damp!==!1,ha=bi?2:1,Tr=ee*ha,Er=oe*ha;if(Tr>U||Er>U||Tr>Ai[0]||Er>Ai[1])throw new RangeError("Ink Studio frame exceeds the WebGL viewport or texture size limit");re||(e.canvas.width!==ee&&(e.canvas.width=ee),e.canvas.height!==oe&&(e.canvas.height=oe));let vf=ee!==Et.width||oe!==Et.height;(Vo||lt!==vn||vf||re!==un||ei!==ln||!kr||zi!==Ne||zi&&L.time!==We)&&(Qt=!1),ui.resize(Tr,Er),Eo.resize(bi?ee:1,bi?oe:1);let ma=!!L[Vi]||Bt||!!bt&&!Pt||Fi;ko.resize(ma?ee:1,ma?oe:1),Fi&&(se!=null||(se=K(512,7,U))),Ho&&(Ve!=null||(Ve=K(512,16,U))),H.resize(Bt?ee:1,Bt?oe:1),_e&&Bt&&L.edges!==!1&&(qe!=null||(qe=N(2,{depth:!0}))),wr&&rt.resize(ee,oe),kr&&(Et.resize(ee,oe),Mt.forEach(Re=>Re.resize(ee,oe)));let $i=x.paintCorrections,Ko=x.data,va=!1;if($i&&L.paintCorrections!==!1){(kt==null?void 0:kt.length)!==x.count*16&&(kt=new Float32Array(x.count*16)),kt.set(x.data.subarray(0,x.count*16));let{view:Re,ortho:at,eye:_t}=ce;va=$i.paint(kt,x.pal,{direction:[Re[2],Re[6],Re[10]],...at?{}:{eye:_t}}),Ko=kt}let Ar=va?ce.view:void 0;Gi&&(Ko=it.materialData(Gi,x,Ko)),(Ar||Vt)&&(!Ar||!Vt||!mi(Ar,Vt))&&(Qt=!1),Vt=Ar;let Yo=Bt&&(va||!!Wo||!!x.opticalSplats);Yo&&(vt!=null||(vt=N(2)),vt.resize(ee,oe));let _a=be===St?St:il(be,ce),Rt=(Fs=Je==null?void 0:Je.direction)!=null?Fs:q==null?void 0:q.prepare(De.artDirection,L.artDirection),li=Je!=null?Je:q==null?void 0:q.motion(Rt,tt,(Cs=L.skyTime)!=null?Cs:tt,$e),Sr=li?[li.falling,li.rain]:[$e,$e],xa=Sr.some(Re=>Re!==$e)||["foliage","cloth","rain","water","emissive"].some(Re=>(Rt==null?void 0:Rt.cadence[Re])!==void 0),ti=Rt==null?void 0:Rt.windResponse,ya=W&&P&&(xa||(ti==null?void 0:ti.water)||(ti==null?void 0:ti.emissive))&&((Ds=(Ms=L.windField)!=null?Ms:x.windField)!=null?Ds:x.weatherBinding),Zo=()=>[0,0],ba=[0,0];if(ya){let Re=W.timeline(x,L,tt,Rt,(Ls=(Ps=t.KIT)==null?void 0:Ps.weather)==null?void 0:Ls.tracks),at=W.opticalWeather(x,L,Re,L.weatherFronts!==!1),_t=W.wind(x,L,{...Re,weather:at}),pi=Pi=>{var ho,Hc,Kc;return(Kc=(Hc=_t.windAt)==null?void 0:Hc.call(_t,(Rt==null?void 0:Rt.cadence[Pi])===void 0?Re.skyTime:(ho=L.skyTime)!=null?ho:li[Pi]))!=null?Kc:_t.wind.velocity};Zo=Pi=>P.frame(pi(Pi)).flex,(Rt==null?void 0:Rt.cadence.rain)!==void 0&&(ba=pi("rain"))}let Ht=cf(zi,ce,(Is=li==null?void 0:li.water)!=null?Is:$e,be,mf,ee,oe);Ht&&(Ht.u_waterWindGain=((Bs=ti==null?void 0:ti.water)!=null?Bs:0)*Math.hypot(...Zo("water")));let Xe=ye.prepare(x,L,ce,tt,ee,oe,le);(Xe||fn)&&(Qt=!1),fn=!!Xe;let nt=Ht&&uf(Ht,!!(Xe!=null&&Xe.media)),Qo=!!x.opticalSplats;if(Qo){let Re=t.KIT;D=Re.optical.frame(x,ce,Re.splatFrames.create(x,$e,Re.M),null,D),Wt!=null||(Wt=K(1536,oi,U)),Wt.upload(D)}(Qo||xe)&&(Qt=!1),xe=Qo;let fi=!1;if(gn){let Re=t.KIT,at=Re.environmentFrame.timeline(x,L,tt,Re.artDirection.prepare(De.artDirection,L.artDirection),(Os=Re.weather)==null?void 0:Os.tracks),_t=qt.frame(x,L,at);if(_t){let pi=qt.rows(x,_t,Re.splatFrames.create(x,$e,Re.M),null,Zt);pi&&(Zt=pi,Ot!=null||(Ot=K(512,Lt,U)),Ot.upload(pi),fi=!0)}}let lo=ve.prepare(x,L,tt,le,ce);fi=ve.compose(lo,x,$e,Zt,fi),ve.fog(lo,x,L),lo&&(Qt=!1,Xe&&(Xe.emitters=lo,Xe.uniforms={...Xe.uniforms,...lo.uniforms})),Xe&&(Xe.lit=!!(Xe.lit&&lo)),(fi||ii)&&(Qt=!1),ii=fi;let Rr=(Ns=ei==null?void 0:ei.fine)!=null?Ns:x.fine,En=!Be&&!!Rr,Ao=el(x.pal),zr=Math.min(x.pal.length,64),Ci=(qs=x.fog)!=null?qs:{},ga=L.previousWorld&&L.previousWorld===Ei&&Ei.data===na&&x.count===sa&&!Gt&&!vr&&!$i&&!Ei.paintCorrections&&!x.anim&&!Ei.anim,fo=!Vo||ga?L.changedRows:void 0,An=Gi||dn?void 0:fo&&$i?[...new Set([...fo,...$i.dirtyRows.filter(Re=>Re*512<x.count)])]:fo,Jo;if(Gt?(mr!=null||(mr=Vu(K,ri,U)),Jo=mr.bind(Gt,x,An,vr!==Gt,Ko)):ri.upload(Ko,x.count*16,An),Ho&&ef(x,Gt,Jo,fo),En&&(Vo||ca!==Rr)){let Re=ga&&!ei&&ca===Ei.fine?L.changedFineRows:void 0;st.upload(Rr,x.count*12,Re),ca=Rr}else st.bind();if(nf((js=x.anim)==null?void 0:js.bones),fi=ze.compose(x,L,ce,$e,fi),ze.has(x)&&(Qt=!1),Zl(x,L,ce,$e,Vo,Jo,ee,oe,ut,ji,Ge,ue,Sr,ba,pa),Bt)if(Vo||(It==null?void 0:It.world)!==x||It.values!==x.pix||It.ramps!==x.ramps||It.rampOff!==x.rampOff||It.patterns!==x.pats){let Re=ga&&(It==null?void 0:It.world)===Ei&&It.values===Ei.pix?L.changedPatternRows:void 0;vi.upload(x.pix,x.count*8,Re);let at=ad(Xo,x);sf(x,Xo),It={world:x,values:x.pix,ramps:x.ramps,rampOff:x.rampOff,patterns:x.pats,gpu:at}}else if((Us=x.anim)!=null&&Us.dynamicPatternNormals){let Re=fo&&[...new Set(fo.map(at=>Math.floor(at/2)))];vi.upload(x.pix,x.count*8,Re)}else vi.bind();let Sn=(Xs=($s=(Gs=t.PixelLook).framePalette)==null?void 0:$s.call(Gs,x,L,{grading:!Be&&!Gi,tone:!Be&&!Pt}))!=null?Xs:{toneDefinition:Be||Pt?null:(Ws=L.tone)!=null?Ws:De.tone,grade:L.ignoreLookGrade||(Vs=x.anim)==null?void 0:Vs.grade},{toneDefinition:Rn,colorGrade:wa}=Sn,Mi=le?null:Sn.grade;Ri&&af(x,fo),bt!=null&&bt.textured&&Z(14,No),bt&&(Pt||Ri)&&(_i.bind(9),Z(8,Ut)),e.disable(e.SCISSOR_TEST),e.disable(e.DEPTH_TEST),e.disable(e.CULL_FACE),e.disable(e.STENCIL_TEST),e.colorMask(!0,!0,!0,!0),e.depthMask(!0),e.blendEquation(e.FUNC_ADD);let Wi=u.programFor({water:!!nt,airPockets:nt==null?void 0:nt.airPockets,layered:nt==null?void 0:nt.layered,atlas:nt==null?void 0:nt.atlas,portal:be!==St||!!_e,instances:!!Jo,contributions:Pt&&!!bt,masked:Ri,textured:bt==null?void 0:bt.textured,layeredGlass:Jt,materialStyles:Ho,environment:Xe==null?void 0:Xe.media,emitterFog:!!(Xe!=null&&Xe.lit),relighting:fi,optical:Qo,cutaway:!!Si});e.useProgram(Wi.p);let ka=(Hs=x.grow)!=null?Hs:{};Wi.set({u_data:0,u_bones:4,u_fine:7,...Jo&&{u_instances:15},u_fineOn:+En,u_fpal:Ao,u_view:ce.view,...Ho&&{u_materialStyles:16,u_materialPatterned:Bt,u_materialStylesOn:!Be},u_proj:ce.projection,u_time:$e,u_scale:ut,u_ortho:+ce.ortho,u_motionCadence:xa,u_rainWind:ba,u_motionWind:!!ya&&((Rt==null?void 0:Rt.cadence.foliage)!==void 0||(Rt==null?void 0:Rt.cadence.cloth)!==void 0),...xa&&{u_effectTimes:[li.foliage,li.cloth,Sr[0],li.emissive],u_waterAndRainTime:[li.water,Sr[1]]},...ya&&{u_effectWind:[...Zo("foliage"),...Zo("cloth")]},u_emissiveWind:((Ks=ti==null?void 0:ti.emissive)!=null?Ks:0)*Math.hypot(...Zo("emissive")),...bt&&(Pt||Ri)&&{u_constraintSlots:9,u_constraintRows:8,u_constraintDefault:bt.defaultSlot,u_constraintMap:Po,u_constraintMask:Lo,u_constraintLab:Io,u_constraintPairs:Bo,u_lookSites:10,u_maskTextures:14,u_maskTime:tt,u_lookProjection:ce.projection,u_lookRadius:ce.radius,u_lookOrtho:+ce.ortho,u_pal:Ao,u_n:zr,u_grade:+!!Mi,u_out:Mi!=null?Mi:Ao,u_toneOn:0,u_lookGrid:[ee,oe]},u_arrivalPlane:be,u_splatPlane:_a,...Jt&&{u_glassBoundary:13,u_glassTolerance:ji},u_sampleWithdrawal:(Qs=n==null?void 0:n.amount((Zs=(Ys=L.sampleWithdrawal)!=null?Ys:x.sampleWithdrawal)!=null?Zs:0))!=null?Qs:0,u_born:[(Js=L.bornAt)!=null?Js:0,(ec=ka.rate)!=null?ec:1,(tc=ka.fade)!=null?tc:.5,(ic=ka.loop)!=null?ic:0],u_detailTexture:no,u_detailGeometry:so,u_crisp:+!Be,u_splatCoverage:Tn,u_dilate:Be?.3:.15,u_near:ce.clipNear,u_paintMarker:(oc=$i==null?void 0:$i.marker)!=null?oc:0,u_afterimageStart:Wo,...Qo&&{u_optical:oi},...fi&&{u_relight:Lt},u_fog:_o((ac=x.pal[(rc=Ci.c)!=null?rc:0])!=null?ac:0),u_fogp:[(nc=Ci.start)!=null?nc:1,(sc=Ci.max)!=null?sc:0,...ce.depthRange],...Ht,...Xe==null?void 0:Xe.uniforms,...Si});let zn=[..._o(x.pal[0]),1],di=ce.tangent,Fr=L.spriteSurfaces===!1?null:x.spriteSurfaces,Ta=L.spriteSurfaces!==!1&&L.scalePreviews!==!1&&x.scalePreviews,Fn=(lc=(uc=(cc=t.KIT)==null?void 0:cc.procedural)==null?void 0:uc.lod)==null?void 0:lc.preview;if(Ta&&!Fn)throw new TypeError("Scale previews need the Ink Studio KIT");let Cr=Ta?Fn.surfaces(Ta,{view:ce.view,width:ee,height:oe,focal:oe/(2*di),ortho:ce.ortho,near:ce.clipNear,far:ce.clipFar},le||be!==St?void 0:L.scalePreviewFrame):void 0,Mr={lighting:lo,environment:Xe,view:ce.view,projection:ce.projection,range:[...ce.depthRange,(fc=Ci.start)!=null?fc:1,(dc=Ci.max)!=null?dc:0],fog:_o((hc=x.pal[(pc=Ci.c)!=null?pc:0])!=null?hc:0),arrivalPlane:be,clip:_a,section:Si};if(Jt){Z(13,null);let Re=pa?eo.filter(at=>pa.keep[at]):eo;go(Wi,Ae,ee,oe,{u_idx:3,u_snap:1,u_hard:0,tangent:di,indices:Re}),Z(13,Ae.textures[0])}go(Wi,ui,Tr,Er,{u_idx:0,u_snap:+(!Be&&!bi),u_hard:0,u_materialGridScale:ha,background:zn,tangent:di,lookGrid:Pt&&[ee,oe],layeredGlass:Jt,surfaces:Fr,scaleSurfaces:Cr,surfaceFrame:Mr},Ht,nt,Xe),bi&&go(Wi,Eo,ee,oe,{u_idx:0,u_snap:1,u_hard:0,background:zn,tangent:di,surfaces:Fr,scaleSurfaces:Cr,surfaceFrame:Mr},Ht,nt,Xe),Yo&&go(Wi,vt,ee,oe,{u_idx:0,u_snap:1,u_hard:0,u_paintPass:!0,tangent:di,lookGrid:Pt&&[ee,oe]},Ht,nt,Xe),ma&&go(Wi,ko,ee,oe,{u_idx:1,u_snap:1,u_hard:0,tangent:di,surfaces:Fr,scaleSurfaces:Cr,surfaceFrame:{...Mr,index:!0,graphDepth:!!((mc=L[Vi])!=null&&mc.depth)}}),(vc=L[Vi])==null||vc.call(L,x,ko.textures[0],L[Vi].depth?ko.textures[2]:void 0,ce),_e&&go(Wi,_e.buffer,ee,oe,{u_idx:2,u_snap:+(!Be&&!bi),u_hard:0,u_splatPlane:_e.plane,tangent:di,surfaces:Fr,scaleSurfaces:Cr,surfaceFrame:{...Mr,index:!0,clip:_e.plane}}),e.disable(e.BLEND),Z(1,ui.textures[0]),Z(2,ui.textures[1]),Z(5,Yo?vt.textures[0]:Eo.textures[0]),Z(6,Yo?vt.textures[1]:Eo.textures[1]),Z(9,ko.textures[0]);let Di=De.outline===!0?{}:De.outline,Dr=It==null?void 0:It.gpu,Cn=Bt?{u_idxTex:9,u_pixTex:10,u_dat:0,u_depth:2,u_tanF:di,u_portho:+ce.ortho,u_asp:ce.aspect,u_pview:ce.view,u_peye:ce.eye,u_fpG:ce.footprint,u_ptime:$e,u_shape:+(L.lightShape!==!1),u_ol:+!!Di,u_olK:(_c=Di==null?void 0:Di.k)!=null?_c:2,u_olEps:Di?((xc=Di.eps)!=null?xc:.6)/(x.detail||12)/(2*ce.radius):0,u_olGap:Di?((yc=Di.gap)!=null?yc:.3)/(2*ce.radius):1,u_patK4:Dr.kinds,u_patP:Dr.params,u_rmp4:Dr.ramps,u_rmpN4:Dr.lens,u_detail:x.detail||12}:{};Bt&&(ur!=null||(ur=Y(V.KEY_FS)),Z(15,null),vi.bind(),ai(ur,H.framebuffer,ee,oe,{u_pixOn:1,...Cn})),Z(15,H.textures[0]);let Mn=Bt&&hr>0&&L.edges!==!1,_f=Mn&&lf(ce,x,ee,oe,$e,Di,Ht,Ao,nt,_a,_e==null?void 0:_e.plane,Xe,fi,Si),po=et&&De.lines,er=(gc=(bc=x.outline)==null?void 0:bc.c)!=null?gc:0,Kt=Be?null:x.glass,Dn={};if(Kt){let Re=new Float32Array(96),at=Math.min(24,(kc=(wc=Kt.gaps)==null?void 0:wc.length)!=null?kc:0);if(at)for(let _t=0;_t<at;_t++)Re.set(Kt.gaps[_t],_t*4);Object.assign(Dn,{u_gview:ce.view,u_geye:ce.eye,u_gd:Kt.dir,u_gw:[...Kt.at,Kt.r],u_gcam:[di*ce.aspect,di,...ce.depthRange],u_gortho:+ce.ortho,u_gtime:tt,u_gc:el(Kt.cols.map(_t=>x.pal[_t]),6),u_gm:+(Kt.mode==="gaps"),u_gq:(Tc=Kt.steps)!=null?Tc:0,u_gh:Re,u_ghn:at,u_gfl:(Ec=Kt.floor)!=null?Ec:-50})}let Pn=kr?Et.framebuffer:re,Ea,Pr=Bt&&Ho,Lr=Bt&&fi;if(Pt||bt||Pr||Lr||Xe!=null&&Xe.media&&Bt){let Re=Pt?Gl:$l,at=(nt?1+Number(nt.airPockets)+2*Number(nt.layered)+4*Number(nt.atlas):0)+16*Number(Ri)+32*Number(Jt)+64*Number(Pr)+128*+!!bt+256*+!!(Xe!=null&&Xe.media)+512*Number(Lr)+1024*+!!(Xe!=null&&Xe.lit);Re.has(at)||Re.set(at,Y(O({water:!!nt,airPockets:nt==null?void 0:nt.airPockets,layered:nt==null?void 0:nt.layered,atlas:nt==null?void 0:nt.atlas,paletteConstraints:!!bt&&!Pt,masked:Ri,contributions:Pt,layeredGlass:Jt,materialStyles:Pr,environment:!!(Xe!=null&&Xe.media),emitterFog:!!(Xe!=null&&Xe.lit),relighting:Lr}).POST_FS)),Ea=Re.get(at),bt&&!Pt&&(_i.bind(),Z(8,Ut),Ri&&Z(7,ko.textures[1]))}else Ea=nt?(Ac=nt.post)!=null?Ac:nt.post=Y(nt.sources.POST_FS):tf(Bt,Kt,x.ao,Rn,Mi);if(Ht&&Z(11,(bi?Eo:ui).textures[2]),Jt){let Re=ui.textures.length-2;Z(4,ui.textures[Re]),Z(7,ui.textures[Re+1]),Z(8,Ae.textures[0])}if(ai(Ea,wr?rt.framebuffer:Pn,ee,oe,{...Cn,...Dn,...of(Rn),...Ht,...Xe==null?void 0:Xe.uniforms,u_waterMask:11,...Jt&&{u_glassBoundary:8,u_glassBack:4,u_glassThrough:7,u_glassRange:ce.depthRange,u_glassProjection:ce.projection},...bt?{u_constraintSlots:4,u_constraintRows:8,u_constraintDefault:bt.defaultSlot,u_constraintMap:Po,u_constraintMask:Lo,u_constraintLab:Io,u_constraintPairs:Bo,u_maskOwner:7}:{},u_scene:1,u_depth:2,u_crispScene:5,u_crispDepth:6,u_keyTex:15,u_pixOn:+Bt,u_keyOn:+Bt,u_sprOn:+Mn,u_paintOn:Yo,...Pr&&{u_materialStyles:16},...Lr&&{u_relight:Lt,u_relightFog:_o((Rc=x.pal[(Sc=Ci.c)!=null?Sc:0])!=null?Rc:0),u_relightFogRange:[(zc=Ci.start)!=null?zc:1,(Fc=Ci.max)!=null?Fc:0]},u_idxTex:9,u_sprLayer:13,u_markA:+wr,u_pal:Ao,u_n:zr,u_luma:0,u_bypass:+(Be||!!Gi),u_colored:+bi,u_dither:ct*.3*((Cc=x.dither)!=null?Cc:1),u_line:_o((Mc=x.pal[er])!=null?Mc:0),u_remapLine:wa&&Number.isInteger(er)&&er>=0&&er<zr?er+1:0,u_edge:et?((Pc=(Dc=x.outline)==null?void 0:Dc.edge)!=null?Pc:0)/(2*ce.radius):0,u_lines:+!!po,u_lineGap:po?((Lc=po.gap)!=null?Lc:.3)/(2*ce.radius):1,u_lineK:po?(Ic=po.k)!=null?Ic:.55:1,u_lineLit:po?(Bc=po.lit)!=null?Bc:1.15:1,u_refract:(Oc=x.refract)!=null?Oc:6,u_ao:x.ao?(Nc=x.ao.k)!=null?Nc:.5:0,u_aor:((jc=(qc=x.ao)==null?void 0:qc.range)!=null?jc:.4)/(2*ce.radius),u_gk:Kt?Kt.k||.14:0,u_bars:Math.min(.45,(Gc=(Uc=x.anim)==null?void 0:Uc.bars)!=null?Gc:0),u_grade:+!!Mi,...Mi?{u_out:Mi,u_outl:Mi}:{}}),wr&&(Fi&&(Ze!==ei.flags?(se.upload(ei.flags),Ze=ei.flags):se.bind()),Z(8,rt.textures[0]),Z(6,bi?Eo.textures[1]:ui.textures[1]),ai(S,Pn,ee,oe,{u_look:8,u_dep:6,u_keep:(Wc=($c=De.clean)==null?void 0:$c.keep)!=null?Wc:.3,u_scopedOnly:!Ui,u_hasDetailFlags:Fi,u_detailOwners:Fi?9:8,u_detailFlags:Fi?7:8,u_detailWater:Fi&&!!Ht,u_waterMask:Fi&&Ht?11:8,u_lineClean:+(L.lineClean!==!1&&!!De.pixel)})),kr){lr!=null||(lr=Y(V.DAMP_FS)),fr!=null||(fr=Y(V.COPY_FS));let Re=wa||Qu;mi(pn,Re)||(Qt=!1),pn=Re;let at=1-ua,_t=od(ce.projection,ce.view),pi=bo&&_t.every((Pi,ho)=>Math.abs(Pi-bo[ho])<1e-6);Z(8,Et.textures[0]),Z(11,Mt[ua].textures[0]),Z(6,ui.textures[1]),ai(lr,Mt[at].framebuffer,ee,oe,{u_cur:8,u_hist:11,u_dep:6,u_pal:wa||Ao,u_n:zr,u_have:+(Qt&&!!pi),u_iview:rd(ce.view,ce.eye),u_pvp:bo!=null?bo:_t,u_cam:[di,ce.aspect,+ce.ortho,0],u_rng:ce.depthRange}),Z(8,Mt[at].textures[0]),ai(fr,re,ee,oe,{u_src:8}),ua=at,Qt=!0,bo=_t}return e.activeTexture(e.TEXTURE0),Ei=x,vr=Gt,na=x.data,dn=!!Gi,sa=x.count,un=re,ln=ei,vn=lt,Ne=zi,We=L.time,le||((Vc=L[Br])==null||Vc.call(L,ce),(Xc=L[Ro])==null||Xc.call(L,x,ui.textures[1],ce)),_f},bn=function(x,L,ee,oe,re){let{portal:he,fade:be=0}=L;if(!he&&!be)return $o(x,L,ee,oe,re);let _e=Xi(x,L,ee,oe),le=he==null?void 0:he.opening,Ee=le&&il(tl(le.from),_e),ge=Ee&&(_e.ortho?Ee[2]>1e-7:Ee[3]>1e-6);if(!ge&&!be)return $o(x,L,ee,oe,re,_e);if(ee>U||oe>U||ee>Ai[0]||oe>Ai[1])throw new RangeError("Ink Studio frame exceeds the WebGL viewport or texture size limit");if(re||(e.canvas.width!==ee&&(e.canvas.width=ee),e.canvas.height!==oe&&(e.canvas.height=oe)),we!=null||(we=N()),we.resize(ee,oe),ge){Me!=null||(Me=N()),He!=null||(He=N()),Me.resize(ee,oe),He.resize(ee,oe);let Ge=zu(_e,le.camera(Ii(_e))),{raw:ce,outline:Be,dither:et,scale:ct,clean:ut,lineClean:De,colored:Je,tone:tt,edges:$e,water:ht,time:mt,skyTime:Qe,cameraTime:lt,stepAnimation:yt,artDirection:ni,renderStages:Si,strictContract:ao,environment:si,stableTransparency:no,resetTransparency:so,stableDetail:co,passQuality:ji,silhouetteProtection:Dt,scalePreviews:Ui}=L,ci=yn(he.destination,{raw:ce,outline:Be,dither:et,scale:ct,clean:ut,lineClean:De,colored:Je,tone:tt,edges:$e,water:ht,time:mt,skyTime:Qe,cameraTime:lt,stepAnimation:yt,artDirection:ni,renderStages:Si,strictContract:ao,environment:si,stableTransparency:no,resetTransparency:so,stableDetail:co,passQuality:ji,silhouetteProtection:Dt,scalePreviews:Ui,...he.destinationFrame,damp:!1},df);$o(ci.world,ci.frame,ee,oe,Me.framebuffer,Ge,tl(le.to))}let ue=$o(x,ge?{...L,damp:!1}:L,ee,oe,we.framebuffer,_e,St,ge?{buffer:He,plane:Ee}:void 0);fe!=null||(fe=Y(Pu)),Z(0,we.textures[0]),Z(1,ge?Me.textures[0]:we.textures[0]),Z(2,ge?He.textures[0]:we.textures[0]),Z(3,ue||we.textures[0]),ai(fe,re,ee,oe,{u_source:0,u_destination:1,u_cover:2,u_spriteCover:3,u_hasSpriteCover:+!!ue,u_opening:ge?le.shape==="ellipse"?2:1:0,u_size:[ee,oe],u_fade:be,...ge?{u_origin:le.from.origin,u_right:le.from.right,u_up:le.from.up,u_normal:le.from.normal,u_half:[le.halfWidth,le.halfHeight],u_eye:_e.eye,u_portalView:_e.view,u_far:_e.clipFar,u_settings:[_e.tangent*_e.aspect,_e.tangent,+_e.ortho]}:{}}),e.activeTexture(e.TEXTURE0)},la=function(x,L,ee,oe,re){var Ge,ce,Be,et,ct,ut,De,Je,tt;let he=(ce=L.composite)!=null?ce:(Ge=x.look)==null?void 0:Ge.composite;if(he===void 0||he===!1)return bn(x,L,ee,oe,re);let be=(Be=t.KIT)==null?void 0:Be.frameComposite;if(!be)throw new Error("Mixed-resolution frames need the Ink Studio KIT");let _e=be.prepare(he,ee,oe,(ct=(et=x.look)==null?void 0:et.pixelSize)!=null?ct:1);if([_e,_e.world].some(({w:$e,h:ht})=>$e>Math.min(U,Ai[0])||ht>Math.min(U,Ai[1]))||_e.layers.some(({w:$e,h:ht})=>$e>U||ht>U))throw new RangeError("Composite frame exceeds the WebGL viewport or texture size limit");let le=(tt=(Je=(ut=L.interfaceTime)!=null?ut:L.time)!=null?Je:(De=x.lookSnapshot)==null?void 0:De.time)!=null?tt:0,Ee,ge=_e.needsCamera?{...L,...Or(L,$e=>{Ee=$e})}:L,ue=_e.needsCamera?()=>be.layers(_e,x,le,Ee,e,L.time):be.layers(_e,x,le,void 0,e,L.time);_r!=null||(_r=au(e,{program:Y,resources:r,target:N,textureUnit:Z,fullscreen:ai})),_r(x,ge,_e,ue,re,bn)},fa=function(x,L,ee,oe,re){var le,Ee,ge;let he=(Ee=L.renderGraph)!=null?Ee:(le=x.look)==null?void 0:le.renderGraph;if(he===!1||he===void 0)return xi==null||xi.reset(),la(x,L,ee,oe,re);let be=(ge=t.KIT)==null?void 0:ge.renderGraph;if(!be)throw new Error("Render graphs need the Ink Studio KIT");let _e=be.prepare(he);if(!(_e!=null&&_e.passes.length))return xi==null||xi.reset(),la(x,L,ee,oe,re);if(ee>Math.min(U,Ai[0])||oe>Math.min(U,Ai[1]))throw new RangeError("Render graph exceeds the WebGL viewport or texture size limit");xi!=null||(xi=cu(e,{api:be,program:Y,resources:r,target:N,textureUnit:Z,fullscreen:ai,maxSize:U})),xi(x,L,_e,ee,oe,re,la)},pf=function(x,L,ee,oe,re){var ge,ue,Ge,ce,Be,et,ct,ut,De,Je,tt,$e,ht;L=(Ge=it==null?void 0:it.options(x,L,(ge=t.KIT.timeDomains)==null?void 0:ge.frame))!=null?Ge:{...L,time:(ue=L.time)!=null?ue:L.t};let he=(ce=L.renderHistoryKey)!=null?ce:x;({world:x,frame:L}=yn(x,L,ff)),he!==x&&(L={...L,renderHistoryKey:he});let be=(Je=(Be=t.KIT)==null?void 0:Be.presentationTimeline)==null?void 0:Je.sample(x,(De=(ut=(et=L.interfaceTime)!=null?et:L.time)!=null?ut:(ct=x.lookSnapshot)==null?void 0:ct.time)!=null?De:0,L);be&&(L={...L,...be});let _e=($e=L.inspection)!=null?$e:(tt=x.look)==null?void 0:tt.inspection;if(_e===void 0||_e===!1)return fa(x,L,ee,oe,re);let le=(ht=t.KIT)==null?void 0:ht.inspection;if(!le)throw new Error("Target inspection needs the Ink Studio KIT");let Ee=le.prepare(_e);if(!Ee.targets.length)return fa(x,L,ee,oe,re);xr!=null||(xr=iu(e,{api:le,program:Y,resources:r,target:N,textureUnit:Z,fullscreen:ai,maxSize:U,viewportLimit:Ai})),xr(x,L,Ee,ee,oe,re,fa)},O=x=>Ur(t.PixelLook,{packedTone:!0,...x}),V=O(),Y=x=>r.program(V.POST_VS,x),f=Y(V.POST_FS),S=Y(V.CLEAN_FS),q=(_=t.ArtDirection)!=null?_:(l=t.KIT)==null?void 0:l.artDirection,P=($=(C=t.KIT)==null?void 0:C.procedural)==null?void 0:$.airflow,W=(I=t.KIT)==null?void 0:I.environmentFrame;u=Gr(e,{specialize:!1,sampleCoverage:n,coverageRules:p,stableDetail:c,cutaway:m==null?void 0:m.glsl,airflow:P});let R=r.allocate("VertexArray"),U=e.getParameter(e.MAX_TEXTURE_SIZE),J=e.getParameter(e.MAX_DRAW_BUFFERS),ie=Nr(e,r),{target:N,table:K,textureUnit:Z}=ie,ye=Du(e,r,ie,U,t),ve=tu(e,r,ie,U,t),ze=Jc(e,r,ie,U,t),me=new Map,Fe=N(2),Le=N(2),te=N(),H=N(1,{integer:!0}),g=new Map,M,G,X,ae,Q,pe,Ae,Pe,Te,we,Me,He,qe,fe,Ne,We,Se,Ie=0,ne=0,Ce,Ue,Ke,ot,gt,xt,Ye,ft,rt=N(),Et=N(),Mt=[N(),N()],At=(E=t.DetailBudgets)!=null?E:(y=t.KIT)==null?void 0:y.detailBudgets,wt=(o=t.KIT)==null?void 0:o.passQuality,it=(h=t.KIT)==null?void 0:h.renderContract,qt=(s=t.KIT)==null?void 0:s.splatRelighting,Lt=21,jt=new Map,Ot,Zt,ii,oi=22,Wt,D,xe,de=new WeakMap,ke=new WeakMap,se,Ze,Ve,dt,vt,kt,Vt,ri=K(2048,0,U),pt=K(768,4,U),st=K(1536,7,U),vi=K(2048,10,U),Tt=r.texture(),Ut,_i,nr,Ji,Nt,Xt,ki,Po,Lo,Io,Bo,Gl=new Map,$l=new Map,sr,Oo,No,an,nn,eo,ta=new WeakMap,Wl=0,Vl=Fu(),qo=(k=(d=t.KIT)==null?void 0:d.procedural)==null?void 0:k.splatOrder,Ti=(B=t.KIT)==null?void 0:B.afterimages,Xl=Ti==null?void 0:Ti.history(),Hl=Ti==null?void 0:Ti.history(),Kl=new WeakMap,Yl=new WeakMap,jo=[],to,io,ia,oa,yo,sn,cr,ra,cn=!1,ur,lr,fr,dr,aa,pr,Uo,Go,Ei,na,sa,un,ln,fn,dn,ca,It,hr=0,oo=Qu,ua=0,Qt=!1,bo,pn,hn,mn,vn,_n,ro,zt,mr,qi,vr,ff=Mo(),df=Mo(),Ai=e.getParameter(e.MAX_VIEWPORT_DIMS),_r,xi,xr;return{render:pf,dispose(){to==null||to.dispose();for(let x of jo)x==null||x.dispose();io==null||io.dispose(),u.dispose(),r.dispose()}}}catch(O){throw u==null||u.dispose(),r.dispose(),O}}function Bi(e,{toolkit:t,specialize:i=!0,reuseOrder:a=!0,contextAttributes:r,input:n}={}){var w,F;if(typeof(e==null?void 0:e.getContext)!="function")throw new TypeError("Ink Studio needs a canvas or OffscreenCanvas");if(typeof((w=t==null?void 0:t.PixelLook)==null?void 0:w.glsl)!="string")throw new TypeError("Pass the Ink Studio toolkit, including PixelLook, to createRenderer");let p=e.getContext("webgl2",{...r,alpha:!1,antialias:!1,depth:!1,stencil:!1});if(!p)throw new Error("Ink Studio GPU rendering requires WebGL 2");let c=ol(p,t,i,a),m;if(n!==void 0&&n!==!1)try{m=Zi(e,{...n,toolkit:t})}catch(l){throw c.dispose(),l}let u=!1,A,j=new WeakMap,z=Mo(),T=l=>{l.preventDefault(),c=null};(F=e.addEventListener)==null||F.call(e,"webglcontextlost",T);function b(l,_){var I,y,E,o,h,s,d;if(!((l==null?void 0:l.data)instanceof Float32Array)||!Number.isSafeInteger(l.count)||l.count<0||l.count*16>l.data.length||!((I=l.pal)!=null&&I.length))throw new TypeError("Render expects a world with packed splats, a count, and a palette");if(l.fine&&l.fine.length<l.count*12||l.pix&&l.pix.length<l.count*8)throw new RangeError("Ink Studio material data is shorter than the splat count");if(l.materialPixelStyles!=null&&(!(l.materialPixelStyles instanceof Float32Array)||l.materialPixelStyles.length<l.count*4))throw new RangeError("Ink Studio material pixel styles must cover the splat count");if(l.opticalSplats!=null&&(!(l.opticalSplats instanceof Float32Array)||l.opticalSplats.length!==l.count*12))throw new RangeError("Ink Studio optical materials must match the splat count");let C=_.instances===void 0?null:Ki(_.instances);C&&Na(l.count,C);let $=l.count+((y=C==null?void 0:C.count)!=null?y:0);if(_.order!==void 0&&(!(_.order instanceof Int32Array)||_.order.length!==$||_.order.some(k=>k<0||k>=$)))throw new TypeError("Draw order must contain valid Int32 splat indices");for(let[k,B]of[["changedRows",512],["changedFineRows",512],["changedPatternRows",1024]]){let O=_[k];if(O!==void 0&&(!Array.isArray(O)||O.some(V=>!Number.isInteger(V)||V<0||V>=Math.max(1,Math.ceil(l.count/B)))))throw new RangeError(k+" must contain valid "+B+"-splat row indices")}if(![(o=(E=_.time)!=null?E:_.t)!=null?o:0,(h=_.bornAt)!=null?h:0,(s=_.scale)!=null?s:1,(d=_.dither)!=null?d:.35].every(Number.isFinite))throw new RangeError("Ink Studio frame parameters must be finite")}let v={...m&&{input:m},describeFrame(l,_={}){var $,I,y,E,o,h,s,d,k,B;let C=($=t.KIT)==null?void 0:$.renderContract;if(!C)throw new Error("Frame descriptions need the Ink Studio KIT");return C.describe(l,{..._,width:(o=(E=(I=_.width)!=null?I:_.w)!=null?E:(y=_.target)==null?void 0:y.width)!=null?o:e.width,height:(k=(d=(h=_.height)!=null?h:_.h)!=null?d:(s=_.target)==null?void 0:s.height)!=null?k:e.height},(B=t.KIT.timeDomains)==null?void 0:B.frame)},cameraPose(l,_={}){var C,$,I,y,E,o,h,s;return Ii(Xi(l,_,(y=(I=(C=_.width)!=null?C:_.w)!=null?I:($=_.target)==null?void 0:$.width)!=null?y:e.width,(s=(h=(E=_.height)!=null?E:_.h)!=null?h:(o=_.target)==null?void 0:o.height)!=null?s:e.height))},renderStream(l,_,{place:C,portals:$=[],selected:I,assemble:y,...E}={}){var q,P,W,R,U,J,ie,N;if(u)throw new Error("The Ink Studio renderer has been disposed");if(typeof(l==null?void 0:l.advance)!="function"||typeof y!="function")throw new TypeError("Stream rendering needs a scene stream and a world assembler");let o=(R=(W=(q=E.width)!=null?q:E.w)!=null?W:(P=E.target)==null?void 0:P.width)!=null?R:e.width,h=(N=(ie=(U=E.height)!=null?U:E.h)!=null?ie:(J=E.target)==null?void 0:J.height)!=null?N:e.height,{snapshot:s,camera:d}=Ru(_,E,o,h),k=l.advance({place:C,camera:d,portals:$,selected:I,portalLimit:1}),B=j.get(l),O=new Map;function V({id:K,place:Z,entries:ye}){let ve=(B==null?void 0:B.assemble)===y&&B.worlds.get(K),me=(ve==null?void 0:ve.place)===Z&&ye.length===ve.entries.length&&ye.every((Fe,Le)=>{let te=ve.entries[Le];return te.key===Fe.key&&te.revision===Fe.revision&&te.value===Fe.value})?ve.world:y(Z,ye);if((me==null?void 0:me.count)>ye.reduce((Fe,Le)=>Fe+Le.splats,0))throw new RangeError("Assembled scene exceeds its packed splat budget");return O.set(K,{place:Z,entries:ye,world:me}),me}let Y=V(k.views[0]),f=k.views[1],S=f!=null&&f.entries.length?{opening:f.opening,destination:V(f)}:void 0;return v.render(Y,{...E,cameraSnapshot:s,portal:S}),j.set(l,{assemble:y,worlds:O}),{world:Y,portal:S,scene:k}},render(l,_={}){var E,o,h,s,d,k,B,O,V,Y;if(u)throw new Error("The Ink Studio renderer has been disposed");if(p.isContextLost())throw new Error("The Ink Studio WebGL context is lost");if(b(l,_),_.portal){let{source:f,destination:S,opening:q,destinationFrame:P={}}=_.portal;if(f&&f!==l||typeof(q==null?void 0:q.camera)!="function"||!q.from||!q.to)throw new TypeError("Expected an oriented portal view for the rendered world");b(S,P)}if(_.fade!==void 0&&(!Number.isFinite(_.fade)||_.fade<0||_.fade>1))throw new RangeError("Scene fade opacity must be in [0, 1]");let C=Array.isArray(_.target)||ArrayBuffer.isView(_.target)?void 0:_.target,$=(h=(o=(E=_.width)!=null?E:_.w)!=null?o:C==null?void 0:C.width)!=null?h:e.width,I=(k=(d=(s=_.height)!=null?s:_.h)!=null?d:C==null?void 0:C.height)!=null?k:e.height,y=(B=C==null?void 0:C.framebuffer)!=null?B:null;if(C&&($!==C.width||I!==C.height||!y||!p.isFramebuffer(y)))throw new TypeError("Draw target must match the frame size and use the renderer WebGL context");if(!Number.isSafeInteger($)||!Number.isSafeInteger(I)||$<1||I<1)throw new RangeError("Ink Studio frame width and height must be positive integers");c!=null||(c=ol(p,t,i,a)),c.render(l,_,$,I,y),(A==null?void 0:A.world)===l&&(((O=_.changedRows)==null?void 0:O.length)!==0||(Y=(V=l.anim)==null?void 0:V.bones)!=null&&Y.length)&&(A=void 0)},pick(l,_,C={}){var Y,f,S,q,P,W,R,U,J,ie,N,K,Z,ye,ve,ze,me,Fe,Le,te,H,g,M,G,X,ae;if(u)throw new Error("The Ink Studio renderer has been disposed");b(l,C);let $=(S=(f=(Y=t.KIT)==null?void 0:Y.procedural)==null?void 0:f.contributions)==null?void 0:S.create;if(!$)throw new Error("Contribution picking needs the Ink Studio KIT");let I=C.instances,y=I&&Ki(I).revision,E=(R=(W=(q=C.time)!=null?q:C.t)!=null?W:(P=l.lookSnapshot)==null?void 0:P.time)!=null?R:0,o=(J=(U=C.sampleWithdrawal)!=null?U:l.sampleWithdrawal)!=null?J:0,h=(N=C.splatCoverage)!=null?N:(ie=l.look)==null?void 0:ie.splatCoverage,s=l.materialPixelStyles,d=(K=l.dataMarks)==null?void 0:K.snapshot(),k=(ye=C.reconstruction)!=null?ye:(Z=l.look)==null?void 0:Z.reconstruction,B=k===void 0||k===!1?void 0:JSON.stringify(k);if((A==null?void 0:A.world)!==l||A.data!==l.data||A.count!==l.count||A.opticalSplats!==l.opticalSplats||A.group!==I||A.revision!==y||A.withdrawal!==o||A.splatCoverage!==h||A.materialStyles!==s||A.marks!==d||A.reconstruction!==B||A.time!==E&&(B!==void 0||(ve=l.moving)!=null&&ve.length||l.grow||(ze=l.anim)!=null&&ze.bones)){let Q=I?z(l,I,C.changedRows).world:l;B!==void 0&&(Q=rl(t,Q,C,k));let pe=$(Q,{time:E,sampleWithdrawal:o,splatCoverage:h,cutaway:!1});A={world:l,data:l.data,count:l.count,opticalSplats:l.opticalSplats,group:I,revision:y,time:E,withdrawal:o,reconstruction:B,splatCoverage:h,materialStyles:s,marks:d,picker:pe}}let O=(te=t.KIT.cutaway)==null?void 0:te.prepare((Le=(me=_==null?void 0:_.cutaway)!=null?me:C.cutaway)!=null?Le:(Fe=l.look)==null?void 0:Fe.cutaway),V=_==null?void 0:_.camera;if(O!=null&&O.range&&!V){let Q=Xi(l,C,(M=(g=C.width)!=null?g:(H=C.target)==null?void 0:H.width)!=null?M:e.width,(ae=(X=C.height)!=null?X:(G=C.target)==null?void 0:G.height)!=null?ae:e.height);V={...Ii(Q),setback:Q.setback}}return A.picker.ray({water:C.water!==!1,..._,cutaway:O,camera:V})},dispose(){var l;if(!u){u=!0,j=new WeakMap;try{m==null||m.dispose()}finally{c==null||c.dispose(),(l=e.removeEventListener)==null||l.call(e,"webglcontextlost",T)}}}};return v}var al=`#version 300 es
out vec2 v_uv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  v_uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,sd=`#version 300 es
precision highp float;
precision highp int;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_from, u_to, u_mask;
uniform vec2 u_size;
uniform vec4 u_color;
uniform vec2 u_anchor, u_direction;
uniform float u_progress, u_phase, u_time, u_value;
uniform float u_cells, u_bands, u_steps, u_strength, u_seed, u_softness, u_width;
uniform int u_fromCover, u_toCover, u_hasMask;
uniform int u_fromFlip, u_toFlip, u_maskFlip;
vec2 oriented(vec2 uv, int flip) { return vec2(uv.x, flip != 0 ? 1.0 - uv.y : uv.y); }
vec4 sourceFrom(vec2 uv) {
  return u_fromCover != 0 ? u_color : texture(u_from, clamp(oriented(uv, u_fromFlip), 0.0, 1.0));
}
vec4 sourceTo(vec2 uv) {
  return u_toCover != 0 ? u_color : texture(u_to, clamp(oriented(uv, u_toFlip), 0.0, 1.0));
}
float maskAt(vec2 uv) {
  vec4 value = texture(u_mask, clamp(oriented(uv, u_maskFlip), 0.0, 1.0));
  return value.r * value.a;
}
float hash(vec2 v) {
  uvec2 bits = uvec2(ivec2(v)) + uvec2(uint(u_seed), uint(u_seed) * 11u);
  uint n = (bits.x * 1664525u + bits.y * 1013904223u) ^ 2246822519u;
  n = (n ^ (n >> 16u)) * 2246822519u;
  n = (n ^ (n >> 13u)) * 3266489917u;
  return float(n >> 8u) / 16777216.0;
}
float luma(vec3 color) { return dot(color, vec3(0.299, 0.587, 0.114)); }
float reveal(float rank) {
  if (u_value <= 0.0) return 0.0;
  if (u_value >= 1.0) return 1.0;
  return u_softness > 0.0
    ? smoothstep(rank - u_softness, rank + u_softness, u_value)
    : step(rank, u_value);
}
vec4 swapAt(vec2 uv, float rank) { return mix(sourceFrom(uv), sourceTo(uv), reveal(rank)); }
vec2 metric(vec2 uv) { return uv * u_size / min(u_size.x, u_size.y); }
vec2 grid() { return max(vec2(1.0), floor(u_size / u_cells)); }
float axisRank(vec2 uv, vec2 dir) {
  float bounds = abs(dir.x) + abs(dir.y);
  return bounds > 0.0 ? 0.5 + dot(uv - 0.5, dir) / bounds : uv.x;
}
float aperture(vec2 uv, bool diamond) {
  vec2 q = abs(metric(uv - u_anchor));
  vec2 limit = metric(max(u_anchor, 1.0 - u_anchor));
  return diamond ? (q.x + q.y) / max(0.001, limit.x + limit.y) : length(q) / max(0.001, length(limit));
}
`,$a={mix:"return mix(sourceFrom(uv), sourceTo(uv), u_value);",stepped:"return mix(sourceFrom(uv), sourceTo(uv), floor(u_value * u_steps) / u_steps);",silhouette:`
    vec4 a = sourceFrom(uv), b = sourceTo(uv);
    float subject = u_hasMask != 0 ? maskAt(uv) : smoothstep(0.30, 0.64, luma(a.rgb));
    vec4 shade = vec4(mix(a.rgb * 0.27, u_color.rgb, 0.18), a.a);
    vec4 held = mix(b, shade, subject);
    return u_value < 0.58 ? mix(a, held, u_value / 0.58) : mix(held, b, (u_value - 0.58) / 0.42);`,light:`
    vec4 a = sourceFrom(uv), b = sourceTo(uv);
    float local = 1.0 - smoothstep(u_width * 0.35, u_width, length(metric(uv - u_anchor)));
    float lamp = u_hasMask != 0 ? maskAt(uv) : local;
    float fade = mix(min(1.0, u_value / 0.55), max(0.0, (u_value - 0.78) / 0.22), lamp);
    return mix(a, b, fade);`,slit:"return swapAt(uv, abs(uv.y - u_anchor.y) / max(u_anchor.y, 1.0 - u_anchor.y));",eyelid:`
    float x = (uv.x - u_anchor.x) / max(u_anchor.x, 1.0 - u_anchor.x);
    float curve = mix(1.0, sqrt(max(0.0, 1.0 - x * x)), u_strength);
    float y = (uv.y - u_anchor.y) / max(u_anchor.y, 1.0 - u_anchor.y);
    return swapAt(uv, abs(y + u_direction.y * (1.0 - u_value) * 0.15) / max(0.04, curve));`,upperLid:`
    float x = (uv.x - u_anchor.x) * 2.0;
    return swapAt(uv, uv.y + u_strength * x * x * (1.0 - u_value) * 0.25);`,squint:`
    float x = (uv.x - u_anchor.x) * 2.0;
    float y = abs(uv.y - u_anchor.y) / max(u_anchor.y, 1.0 - u_anchor.y);
    float open = reveal(y / max(0.12, 1.0 - x * x * u_strength));
    vec4 image = sourceTo(uv);
    float glare = clamp(u_width, 0.0, 1.0);
    return mix(sourceFrom(uv), vec4(mix(image.rgb, vec3(1.0), glare), image.a), open);`,circle:"return swapAt(uv, aperture(uv, false));",diamond:"return swapAt(uv, aperture(uv, true));",faint:`
    vec2 center = u_anchor + u_direction * (1.0 - u_value) * u_strength;
    vec2 delta = metric(uv - center);
    delta.y *= 1.75;
    return swapAt(uv, length(delta) / length(metric(vec2(1.0, 1.75))));`,split:"return swapAt(uv, abs(uv.x - u_anchor.x) / max(u_anchor.x, 1.0 - u_anchor.x));",wipe:"return swapAt(uv, axisRank(uv, u_direction));",stairs:`
    vec2 stepped = vec2(uv.x, (floor(uv.y * u_bands) + 0.5) / u_bands);
    return swapAt(uv, axisRank(stepped, u_direction));`,clock:`
    vec2 delta = metric(uv - u_anchor);
    float angle = atan(delta.x, delta.y) / 6.28318530718;
    return swapAt(uv, fract(angle * sign(u_direction.x) + u_width));`,blinds:`
    float stripe = uv.y * u_bands;
    return swapAt(uv, (mod(floor(stripe), 2.0) + fract(stripe)) * 0.5);`,door:`
    float x = axisRank(uv, u_direction);
    float edge = u_value * (1.0 + u_width);
    if (u_value <= 0.0) return sourceFrom(uv);
    if (u_value >= 1.0) return sourceTo(uv);
    if (x < edge - u_width) return sourceTo(uv);
    if (x < edge) {
      float jamb = (x - edge + u_width) / max(0.001, u_width);
      if (u_hasMask != 0) {
        vec4 panel = texture(u_mask, oriented(vec2(jamb, uv.y), u_maskFlip));
        return mix(sourceFrom(uv), panel, panel.a);
      }
      return vec4(u_color.rgb * (jamb < 0.16 || jamb > 0.84 ? 1.15 : 0.65), 1.0);
    }
    return sourceFrom(uv);`,checker:`
    vec2 tile = floor(uv * grid());
    return swapAt(uv, (mod(tile.x + tile.y, 2.0) + hash(tile)) * 0.5);`,random:"return swapAt(uv, (floor(hash(floor(uv * grid())) * u_steps) + 0.5) / u_steps);",flood:`
    vec2 size = grid(), tile = floor(uv * size), center = floor(u_anchor * size);
    float radius = length((tile - center) / size);
    float total = length(max(u_anchor, 1.0 - u_anchor));
    return swapAt(uv, min(0.995, 0.84 * radius / total + 0.16 * hash(tile)));`,spiral:`
    float size = max(3.0, floor(min(u_size.x, u_size.y) / u_cells));
    size = 2.0 * floor(size * 0.5) + 1.0;
    vec2 tile = floor(uv * size) - floor(size * 0.5);
    float ring = max(abs(tile.x), abs(tile.y));
    float offset = tile.y == ring ? tile.x + ring :
      tile.x == ring ? 3.0 * ring - tile.y :
      tile.y == -ring ? 5.0 * ring - tile.x : 7.0 * ring + tile.y;
    float side = 2.0 * ring + 1.0;
    float index = side * side - 1.0 - offset;
    return swapAt(uv, 1.0 - (index + 0.5) / (size * size));`,scan:"return swapAt(uv, (floor((1.0 - uv.y) * u_size.y) + 0.5) / u_size.y);",pixel:`
    if (u_value <= 0.0) return sourceFrom(uv);
    if (u_value >= 1.0) return sourceTo(uv);
    float block = 1.0 + floor(max(0.0, sin(u_value * 3.14159265359)) * (u_cells - 1.0));
    vec2 coord = (floor(uv * u_size / block) + 0.5) * block / u_size;
    return u_value < 0.5 ? sourceFrom(coord) : sourceTo(coord);`,dither:`
    ivec2 pt = ivec2(floor(uv * u_size / u_cells));
    const float bayer[16] = float[16](0.0, 8.0, 2.0, 10.0, 12.0, 4.0, 14.0, 6.0,
      3.0, 11.0, 1.0, 9.0, 15.0, 7.0, 13.0, 5.0);
    float rank = (bayer[(pt.x & 3) + (pt.y & 3) * 4] + 0.5) / 16.0;
    return swapAt(uv, rank);`,colors:`
    vec4 a = sourceFrom(uv);
    float brightness = u_direction.x < 0.0 ? 1.0 - luma(a.rgb) : luma(a.rgb);
    vec3 quant = floor(a.rgb * 7.999);
    float bucket = floor(brightness * (u_steps - 1.0)) + 0.76 * hash(quant.rg + vec2(17.0, 7.0) * quant.b);
    return mix(a, sourceTo(uv), reveal((bucket + 0.12) / u_steps));`,strips:`
    float band = mod(floor(uv.y * u_bands), 2.0);
    float x = uv.x + (band * 2.0 - 1.0) * u_value;
    return x < 0.0 || x >= 1.0 ? sourceTo(uv) : sourceFrom(vec2(x, uv.y));`,rush:`
    float lane = floor(uv.y * u_bands);
    float speed = 0.55 + hash(vec2(lane, 27.0)) * 0.65;
    float x = uv.x + u_value * speed * 1.9;
    vec4 base = x >= 1.0 ? sourceTo(uv) : sourceFrom(vec2(x, uv.y));
    float streak = step(0.65, hash(vec2(lane, 12.0))) * step(0.82, fract(x * 3.0));
    return mix(base, vec4(vec3(0.86, 0.91, 1.0), 1.0), streak * sin(u_value * 3.14159265) * u_strength);`,exposure:`
    vec4 a = sourceFrom(uv);
    vec3 bright = min(vec3(1.0), a.rgb * (1.0 + 3.0 * u_value));
    return mix(vec4(bright, a.a), sourceTo(uv), u_value * u_value);`,palette:`
    vec4 a = sourceFrom(uv);
    vec3 shadow = vec3(0.10, 0.06, 0.27), light = vec3(0.92, 0.57, 0.76);
    float level = floor(luma(a.rgb) * u_steps) / u_steps;
    vec3 shifted = mix(shadow, light, level);
    shifted = mix(shifted, u_color.rgb, 0.24);
    return vec4(mix(a.rgb, shifted, u_value * u_strength), a.a);`,era:`
    float band = floor(uv.y * u_bands);
    float rank = (mod(band, 2.0) + uv.y) * 0.5;
    return swapAt(uv, rank);`,threat:`
    vec4 a = sourceFrom(uv), b = sourceTo(uv);
    float local = 1.0 - smoothstep(u_width * 0.75, u_width, length(metric(uv - u_anchor)));
    float subject = u_hasMask != 0 ? maskAt(uv) : local;
    float holdThreat = (1.0 - smoothstep(0.50, 1.0, u_value)) * subject;
    float visible = 1.0 - reveal(1.0 - aperture(uv, false));
    return mix(b, a, max(visible, holdThreat));
  `,afterimage:`
    vec4 ghost = sourceFrom(uv), destination = sourceTo(uv);
    float mask = u_hasMask != 0 ? maskAt(uv) : 1.0 - smoothstep(u_width * 0.55, u_width, length(metric(uv - u_anchor)));
    return mix(destination, ghost, mask * (1.0 - u_value) * u_strength);`,ripple:`
    if (u_value <= 0.0) return sourceFrom(uv);
    if (u_value >= 1.0) return sourceTo(uv);
    float q = axisRank(uv, u_direction), wave = q - u_value;
    float displaced = sin(wave * u_bands) * exp(-abs(wave) * 16.0) * u_strength * sin(u_value * 3.14159265);
    vec2 at = uv - vec2(u_direction.y, -u_direction.x) * displaced;
    return mix(sourceFrom(at), sourceTo(at), reveal(q));`,ink:`
    vec2 q = metric(uv), extent = metric(vec2(1.0));
    float distance = 2.0;
    for (int i = 0; i < 8; ++i) {
      vec2 pt = vec2(hash(vec2(i, 1)), hash(vec2(i, 2))) * extent;
      if (i == 0) pt = metric(u_anchor);
      distance = min(distance, length((q - pt) / extent) * (0.72 + 0.52 * hash(vec2(i, 3))));
    }
    float ragged = hash(floor(uv * u_size / u_cells)) * 0.105;
    return swapAt(uv, clamp(distance * 1.43 + ragged, 0.002, 0.998));`},nl=Object.freeze(Object.keys($a));function Wa({source:e,uniforms:t=""}){return sd+`
`+t+`
vec4 transition(vec2 uv) {
`+e+`
}
void main() { outColor = transition(v_uv); }
`}function Va(e){return Object.hasOwn($a,e)?Wa({source:$a[e]}):void 0}var cd={u_color:[0,0,0,1],u_anchor:[.5,.5],u_direction:[1,0],u_cells:8,u_bands:12,u_steps:6,u_strength:.65,u_seed:27,u_softness:0,u_width:.19},sl={fragment1:"from",fragment2:"to"},cl=/^[_a-zA-Z][_a-zA-Z0-9]*$/,ud=new Set(["u_from","u_to","u_mask"]),Hr=e=>e.activeTexture(e.TEXTURE0);function Do(e,{contextAttributes:t}={}){var h;let i=typeof(e==null?void 0:e.getContext)=="function"?e.getContext("webgl2",{alpha:!1,antialias:!1,...t}):e;if(typeof(i==null?void 0:i.createVertexArray)!="function"||typeof(i==null?void 0:i.texStorage2D)!="function")throw new Error("Ink Studio transitions require a canvas with WebGL 2 or a WebGL 2 context");let a=i.canvas,r=new Map,n=new Map,p=new Map,c=new Map,m,u,A,j=!1;function z(){if(j)throw new Error("The Ink Studio transition composer has been disposed");if(i.isContextLost())throw new Error("The Ink Studio WebGL context is lost")}function T(s){var d;if(s){for(let k of n.values())k.resources.dispose();for(let k of r.values())k.upload&&k.texture&&i.deleteTexture(k.texture);for(let k of c.values())(d=k.resources)==null||d.dispose();m==null||m.dispose()}n.clear();for(let k of r.values())k.texture=null;for(let k of c.values())k.resources=k.buffer=null;m=u=A=null}let b=s=>{s.preventDefault(),T(!1)};(h=a.addEventListener)==null||h.call(a,"webglcontextlost",b);function v(s,d,k=!0){let B=i.getParameter(i.MAX_TEXTURE_SIZE),[O,V]=k?i.getParameter(i.MAX_VIEWPORT_DIMS):[B,B];if(!Number.isInteger(s)||!Number.isInteger(d)||s<1||d<1||s>Math.min(B,O)||d>Math.min(B,V))throw new RangeError("Transition dimensions must fit the WebGL limits")}function w(s){if(z(),!c.has(s.target))throw new Error("The Ink Studio transition target has been disposed");if(!s.buffer){s.resources=gi(i);try{Hr(i),s.buffer=Nr(i,s.resources).target(),s.buffer.resize(s.width,s.height)}catch(d){throw s.resources.dispose(),s.resources=s.buffer=null,d}}return s.buffer}function F(s,d){z(),v(s,d);let k={width:s,height:d},B=k.target={get width(){return k.width},get height(){return k.height},get framebuffer(){return w(k).framebuffer},get texture(){return w(k).textures[0]},resize(O,V){z(),v(O,V),w(k).resize(O,V),k.width=O,k.height=V},dispose(){var O;(O=k.resources)==null||O.dispose();for(let[V,Y]of r)Y.target===B&&r.delete(V);c.delete(B)}};return c.set(B,k),B}function l(s,d){i.activeTexture(i.TEXTURE0+s),i.bindTexture(i.TEXTURE_2D,d)}function _(s){let{input:d}=s;Hr(i);let k=i.createTexture();if(!k)throw new Error("Could not allocate a WebGL transition source");i.bindTexture(i.TEXTURE_2D,k);let B=s.filter==="nearest"?i.NEAREST:i.LINEAR;i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,B),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,B),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE);let O=[[i.UNPACK_ALIGNMENT,1],[i.UNPACK_FLIP_Y_WEBGL,!1],[i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1],[i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.NONE],[i.UNPACK_ROW_LENGTH,0],[i.UNPACK_SKIP_PIXELS,0],[i.UNPACK_SKIP_ROWS,0]],V=O.map(([f])=>i.getParameter(f)),Y=i.getParameter(i.PIXEL_UNPACK_BUFFER_BINDING);i.bindBuffer(i.PIXEL_UNPACK_BUFFER,null);try{for(let[f,S]of O)i.pixelStorei(f,S);return s.raw?i.texImage2D(i.TEXTURE_2D,0,i.RGBA8,d.width,d.height,0,i.RGBA,i.UNSIGNED_BYTE,d.data):i.texImage2D(i.TEXTURE_2D,0,i.RGBA8,i.RGBA,i.UNSIGNED_BYTE,d),k}catch(f){throw i.deleteTexture(k),f}finally{for(let f=0;f<O.length;f++)i.pixelStorei(O[f][0],V[f]);i.bindBuffer(i.PIXEL_UNPACK_BUFFER,Y)}}function C(s){let d=r.get(s);return d!=null&&d.upload&&d.texture&&i.deleteTexture(d.texture),r.delete(s)}function $(s,d,{origin:k,filter:B="nearest"}={}){var V,Y,f,S,q,P;if(z(),typeof s!="string"||!s||s==="cover")throw new TypeError("Specify a named transition source other than the reserved cover");if(d==null)return C(s);if(k!==void 0&&k!=="top-left"&&k!=="bottom-left")throw new RangeError("A transition source origin is top-left or bottom-left");if(B!=="nearest"&&B!=="linear")throw new RangeError("A transition source filter is nearest or linear");let O;if(c.has(d))O={target:d,flip:+(k==="top-left")};else if(d.texture!==void 0){if(!i.isTexture(d.texture))throw new TypeError("Use a texture from the transition composer context");O={texture:d.texture,flip:+(k==="top-left")}}else{let W=d.data!==void 0,R=(f=(Y=(V=d.videoWidth)!=null?V:d.naturalWidth)!=null?Y:d.displayWidth)!=null?f:d.width,U=(P=(q=(S=d.videoHeight)!=null?S:d.naturalHeight)!=null?q:d.displayHeight)!=null?P:d.height;if(v(R,U,!1),W&&(!(d.data instanceof Uint8Array||d.data instanceof Uint8ClampedArray)||d.data.length!==R*U*4))throw new TypeError("Raw transition sources require width \xD7 height \xD7 4 RGBA bytes");O={input:d,upload:!0,raw:W,filter:B,flip:+(k!=="bottom-left")},O.texture=_(O)}C(s),r.set(s,O)}function I(s,d=!1){var B,O;if(s==="cover")return{texture:u,flip:0};let k=(B=r.get(s))!=null?B:Object.hasOwn(sl,s)?r.get(sl[s]):void 0;if(!k&&d)return{texture:u,flip:0};if(!k)throw new Error("Missing transition source "+s);if(k.target)return{texture:k.target.texture,flip:k.flip,exists:!0};if(k.upload&&((O=k.texture)!=null||(k.texture=_(k))),!k.texture)throw new Error("Set transition source "+s+" again after context restoration");return{texture:k.texture,flip:k.flip,exists:!0}}function y(s){var d;(d=n.get(s))==null||d.resources.dispose(),n.delete(s)}function E(s){var d;if(!n.has(s)){let k=(d=p.get(s))!=null?d:Va(s);if(!k)throw new RangeError("Unknown transition shader "+s);let B=gi(i);try{n.set(s,{resources:B,program:B.program(al,k)})}catch(O){throw B.dispose(),new Error("Transition shader "+s+": "+O.message,{cause:O})}}return n.get(s).program}function o(s,{target:d=null,width:k=(V=>(V=d==null?void 0:d.width)!=null?V:a.width)(),height:B=(Y=>(Y=d==null?void 0:d.height)!=null?Y:a.height)(),uniforms:O={}}={}){var U,J,ie;if(z(),typeof(s==null?void 0:s.shader)!="string"||![s.value,s.phase,s.progress,s.time].every(Number.isFinite))throw new TypeError("Draw expects a frame from a sampled transition");if(v(k,B),d&&(k!==d.width||B!==d.height))throw new RangeError("Transition draw dimensions must match the target");let f=(U=d==null?void 0:d.framebuffer)!=null?U:null;if(d&&!i.isFramebuffer(f))throw new TypeError("Transition target must use a framebuffer on the same WebGL context");if(!m){m=gi(i);try{Hr(i),u=m.texture(),i.texStorage2D(i.TEXTURE_2D,1,i.RGBA8,1,1),A=m.allocate("VertexArray")}catch(N){throw m.dispose(),m=u=A=null,N}}let S=E(s.shader),q=[I(s.from),I(s.to),I(s.mask,!0)],P={},W=Object.entries((J=s.samplers)!=null?J:{});if(W.length+3>i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS))throw new RangeError("Transition shader uses too many texture units");for(let[N,K]of W){let{source:Z,flipUniform:ye}=typeof K=="string"?{source:K}:K;if(!cl.test(N)||ud.has(N)||ye!==void 0&&!cl.test(ye))throw new TypeError("Invalid custom transition sampler "+N);let ve=I(Z);P[N]=q.length,ye&&(P[ye]=ve.flip),q.push(ve)}if(d||(a.width!==k&&(a.width=k),a.height!==B&&(a.height=B)),i.bindFramebuffer(i.FRAMEBUFFER,f),d){let N=(ie=d.texture)!=null?ie:i.getFramebufferAttachmentParameter(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);if(q.some(K=>K.texture===N))throw new Error("A transition cannot sample its draw target")}i.viewport(0,0,k,B),i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SCISSOR_TEST),i.disable(i.RASTERIZER_DISCARD),i.colorMask(!0,!0,!0,!0),q.forEach((N,K)=>{i.bindSampler(K,null),l(K,N.texture)}),i.bindVertexArray(A),i.useProgram(S.p),S.set({...cd,...s.uniforms,...O,...P,u_from:0,u_to:1,u_mask:2,u_size:[k,B],u_fromCover:+(s.from==="cover"),u_toCover:+(s.to==="cover"),u_hasMask:+!!q[2].exists,u_fromFlip:q[0].flip,u_toFlip:q[1].flip,u_maskFlip:q[2].flip,u_progress:s.progress,u_phase:s.phase,u_time:s.time,u_value:s.value});let R=i.isEnabled(i.DITHER);i.disable(i.DITHER),i.drawArrays(i.TRIANGLES,0,3),R&&i.enable(i.DITHER),Hr(i)}return{setSource:$,removeSource:C,createTarget:F,draw:o,registerShader(s,d){if(z(),typeof s!="string"||!s||Va(s))throw new TypeError("Use a new name for a custom transition shader");if(typeof(d==null?void 0:d.source)!="string"||!d.source.trim()||d.uniforms!==void 0&&typeof d.uniforms!="string")throw new TypeError("A custom transition shader requires a GLSL body and optional uniform declarations");y(s),p.set(s,Wa(d))},unregisterShader(s){return z(),p.delete(s)?(y(s),!0):!1},dispose(){var s;j||(j=!0,T(!i.isContextLost()),r.clear(),c.clear(),p.clear(),(s=a.removeEventListener)==null||s.call(a,"webglcontextlost",b))}}}var Ha={linear:e=>e,smooth:e=>e*e*(3-2*e),in:e=>e*e,out:e=>e*(2-e),inOut:e=>e<.5?2*e*e:1-2*(1-e)**2},ul=Object.freeze(Object.keys(Ha)),Xa=e=>Math.max(0,Math.min(1,e));function Kr({duration:e=1,stages:t,cues:i=[]}={}){if(!Number.isFinite(e)||e<=0||!Array.isArray(t)||!t.length)throw new TypeError("A transition requires a positive duration in seconds and at least one stage");let a=0,r=t.map(p=>{let{span:c=1,shader:m="mix",from:u="from",to:A="to",start:j=0,end:z=1,easing:T="linear",mask:b="mask",uniforms:v={},samplers:w={}}=p;if(!Number.isFinite(c)||c<=0||![j,z].every(l=>Number.isFinite(l)&&l>=0&&l<=1)||typeof T!="function"&&!Object.hasOwn(Ha,T)||![m,u,A,b].every(l=>typeof l=="string"&&l.length))throw new TypeError("A transition stage requires a positive span, source names, an easing, and endpoints in [0, 1]");let F=a;return a+=c,{begin:F,finish:a,span:c,shader:m,from:u,to:A,start:j,end:z,easing:T,mask:b,uniforms:v,samplers:w}});if(!Number.isFinite(a))throw new RangeError("Transition stage spans exceed the supported range");let n=i.map(p=>{let{at:c,name:m,detail:u}=p;if(!Number.isFinite(c)||c<0||c>1||typeof m!="string"||!m)throw new TypeError("A transition cue requires a name and a normalized time in [0, 1]");return Object.freeze({name:m,detail:u,at:c,time:c*e})}).sort((p,c)=>p.at-c.at);return Object.freeze(n),Object.freeze({duration:e,cues:n,sample(p){var T;if(!Number.isFinite(p))throw new TypeError("Transition time must be finite");let c=Xa(p/e),m=c*a,u=(T=r.find(b=>m<b.finish))!=null?T:r.at(-1),A=c===1?1:Xa((m-u.begin)/u.span),z=(typeof u.easing=="function"?u.easing:Ha[u.easing])(A);if(!Number.isFinite(z))throw new TypeError("Transition easing must return a finite number");return{shader:u.shader,from:u.from,to:u.to,mask:u.mask,samplers:u.samplers,progress:c,phase:A,time:c*e,value:u.start+(u.end-u.start)*Xa(z),uniforms:typeof u.uniforms=="function"?u.uniforms({progress:c,phase:A,time:c*e}):u.uniforms}}})}function ll(e,{onCue:t}={}){let i=-1/0;return{update(a){let r=e.sample(a);if(r.time>=i)for(let n of e.cues)n.time>i&&n.time<=r.time&&(t==null||t(n));return i=r.time,r},seek(a){let r=e.sample(a);return i=r.time,r},reset(){i=-1/0}}}var ld=[0,0,0,1],Ka=[1,1,1,1],Ni=(e,t,i="from",a="to",r={})=>({shader:e,span:t,from:i,to:a,...r}),Oe=(e,t)=>Ni("mix",t,e,e,{start:0,end:0}),Yt=(e,t,i)=>Ni(e,t,"from","cover",i),Ft=(e,t,i)=>Ni(e,t,"cover","to",i),Oi=(e,t,i)=>Ni(e,t,"cover","from",{start:1,end:0,...i}),$t=e=>[Ni(e,1)],Ya=(e,{target:t})=>[Oi(e,.43),Oe("cover",.14),Ft(e,.43,{anchor:t})],fl=e=>[Yt(e,.42),Oe("cover",.14),Ft("mix",.44)],je=(e,t,i,a,r={},n)=>({id:e,name:t,duration:i,passes:a,options:r,cues:n}),fd={"Blackouts and fades":[je("hard-blackout","Hard blackout",.48,[Oe("cover",.82),Oe("to",.18)]),je("fade-out-cut-in","Fade out, cut in",.75,[Yt("mix",.78),Oe("cover",.13),Oe("to",.09)]),je("cut-out-fade-in","Cut out, fade in",.83,[Oe("cover",.26),Ft("mix",.74)]),je("stepped-fade","Stepped fade",.95,[Yt("stepped",.45),Oe("cover",.1),Ft("stepped",.45)],{steps:5}),je("fade-through-white","Fade through white",.84,fl("mix"),{color:Ka}),je("fade-through-color","Fade through a shared color",1.05,fl("mix"),{color:[.09,.16,.33,1]}),je("silhouette-to-black","Silhouette to black",1.05,[Yt("silhouette",.81,{mask:"subject"}),Oe("cover",.11),Oe("to",.08)]),je("last-light-out","Last light out",1.18,[Yt("light",.83,{mask:"light"}),Oe("cover",.1),Oe("to",.07)],{width:.16,anchor:[.69,.35]})],"Waking, sleeping, and coming to":[je("first-slit-of-light","First slit of light",1.48,[Oe("cover",.18),Ft("slit",.2,{end:.09,easing:"out"}),Ft("slit",.62,{start:.09,easing:"in"})]),je("eyelid-reveal","Eyelid reveal",1.13,[Oe("cover",.15),Ft("eyelid",.85,{easing:"inOut"})],{strength:.68}),je("sleepy-double-blink","Sleepy double blink",1.68,[Oe("cover",.1),Ft("eyelid",.16,{end:.43}),Ft("eyelid",.09,{start:.43,end:0}),Oe("cover",.11),Ft("eyelid",.54,{easing:"inOut"})],{strength:.64}),je("squint-into-daylight","Squint into daylight",1.65,[Oe("cover",.1),Ft("squint",.19,{end:.36,width:1}),Ft("squint",.14,{start:.36,end:.13,width:1}),Ft("squint",.57,{start:.13,width:({phase:e})=>1-e,easing:"inOut"})],{strength:.55}),je("come-to-in-fragments","Come to in fragments",1.66,[Oe("cover",.14),Oe("fragment1",.09),Oe("cover",.2),Oe("fragment2",.11),Oe("cover",.16),Ft("mix",.16),Oe("to",.14)]),je("drift-off","Drift off",1.83,[Oi("upperLid",.27,{end:.52,easing:"in"}),Oi("upperLid",.12,{start:.52,end:.79}),Oi("upperLid",.2,{start:.79,end:.22}),Oi("upperLid",.12,{start:.22,end:.4}),Oi("upperLid",.17,{start:.4,easing:"in"}),Oe("cover",.12)],{strength:.75}),je("faint","Faint",.99,[Oi("faint",.73,{easing:"in"}),Oe("cover",.27)],{direction:[-.35,1],strength:.28}),je("wake-from-a-dream","Wake from a dream",1.43,[Oi("eyelid",.25,{easing:"in"}),Oe("cover",.23),Ft("eyelid",.52,{easing:"out"})],{strength:.65}),je("wake-in-darkness","Wake in darkness",2.08,[Oe("cover",.59),Ft("mix",.41,{easing:"in"})],{},({cue:e="rain",cueAt:t=0,cueDetail:i})=>[{at:t,name:e,detail:i}])],"Irises, wipes, and room changes":[je("character-centered-iris","Character-centered iris",.88,[Oi("circle",.74,{easing:"in"}),Oe("cover",.16),Oe("to",.1)]),je("destination-iris","Destination iris",.88,({target:e})=>[Oe("cover",.22),Ft("circle",.78,{anchor:e,easing:"out"})]),je("diamond-iris","Diamond iris",.88,e=>Ya("diamond",e)),je("horizontal-squeeze","Horizontal squeeze",.66,e=>Ya("slit",e)),je("vertical-split","Vertical split",.69,e=>Ya("split",e)),je("side-wipe","Side wipe",.59,$t("wipe")),je("diagonal-wipe","Diagonal wipe",.65,$t("wipe"),{direction:[1,.75]}),je("stair-step-wipe","Stair-step wipe",.71,$t("stairs"),{direction:[1,.85],bands:9}),je("clock-wipe","Clock wipe",.76,$t("clock"),{width:0}),je("blind-wipe","Blind wipe",.74,$t("blinds"),{bands:12}),je("doorframe-wipe","Doorframe wipe",.81,[Ni("door",1,"from","to",{mask:"jamb"})],{width:.13,color:[.13,.08,.11,1]}),je("stairwell-blackout","Stairwell blackout",.94,[Yt("wipe",.49),Oe("cover",.16),Ft("wipe",.35,{direction:[0,1]})],{direction:[0,-1]})],"Tiles, dissolves, and encounter transitions":[je("checkerboard-swap","Checkerboard swap",.68,$t("checker"),{cellSize:13}),je("random-block-blackout","Random block blackout",.6,[Yt("random",.75),Oe("cover",.13),Oe("to",.12)],{cellSize:11,steps:6}),je("tile-flood","Tile flood",.72,[Yt("flood",.73),Oe("cover",.13),Oe("to",.14)],{cellSize:10}),je("spiral-blackout","Spiral blackout",.82,[Yt("spiral",.77),Oe("cover",.12),Oe("to",.11)],{cellSize:14}),je("scanline-build","Scanline build",.58,$t("scan")),je("pixelate-and-rebuild","Pixelate and rebuild",.87,$t("pixel"),{cellSize:35}),je("dither-dissolve","Dither dissolve",.72,$t("dither"),{cellSize:1}),je("color-by-color-dissolve","Color-by-color dissolve",.81,$t("colors"),{steps:5}),je("strip-pull-apart","Strip pull-apart",.51,$t("strips"),{bands:10}),je("rush-to-black","Rush to black",.56,[Yt("rush",.69,{easing:"in"}),Oe("cover",.17),Oe("to",.14)],{bands:45,strength:.82}),je("freeze-flash-swap","Freeze, flash, swap",.52,[Oe("from",.49),Oe("cover",.14),Oe("to",.37)],{color:Ka},()=>[{at:0,name:"freeze"},{at:.49,name:"flash"},{at:.63,name:"swap"}]),je("threat-centered-blackout","Threat-centered blackout",.76,[Yt("threat",.75,{mask:"threat"}),Oe("cover",.12),Oe("to",.13)],{anchor:[.73,.54],width:.21})],"Dreams, memories, and jumps in time":[je("bright-memory-wash","Bright memory wash",1.2,[Yt("exposure",.43),Oe("cover",.16),Ft("mix",.41,{easing:"in"})],{color:Ka}),je("palette-drift","Palette drift",1.08,[Ni("palette",.73),Oe("to",.27)],{steps:6,strength:.98,color:[.63,.19,.72,1]}),je("same-room-time-jump","Same-room time jump",1.22,$t("mix")),je("alternating-era-bands","Alternating-era bands",.91,$t("era"),{bands:16}),je("lingering-afterimage","Lingering afterimage",1.04,[Oe("from",.12),Ni("afterimage",.88,"from","to",{mask:"subject",easing:"out"})],{strength:.76,width:.3}),je("ripple-into-a-vision","Ripple into a vision",.92,$t("ripple"),{direction:[1,.32],strength:.073,bands:57,softness:.035}),je("ink-soak","Ink soak",1.22,[Yt("ink",.43),Oe("cover",.15),Ni("ink",.42,"to","cover",{start:1,end:0})],{cellSize:2}),je("black-between-fragments","Black between fragments",1.87,[Oe("from",.13),Oe("cover",.14),Oe("fragment1",.13),Oe("cover",.1),Oe("fragment2",.13),Oe("cover",.1),Oe("to",.27)])]},dl={color:ld,anchor:[.5,.5],direction:[1,0],cellSize:8,bands:12,steps:6,strength:.65,seed:27,softness:0,width:.19},dd={color:"u_color",anchor:"u_anchor",direction:"u_direction",cellSize:"u_cells",bands:"u_bands",steps:"u_steps",strength:"u_strength",seed:"u_seed",softness:"u_softness",width:"u_width"},Za={color:4,anchor:2,direction:2},pd={color:[0,1],anchor:[0,1],direction:[-1,1],cellSize:[1,512],bands:[1,512],steps:[1,256],strength:[0,1],seed:[0,16777215],softness:[0,.5],width:[0,1]};function Qa(e,t){var n;let[i,a]=pd[e],r=Za[e]?t:[t];if(!Array.isArray(r)&&!ArrayBuffer.isView(r)||r.length!==((n=Za[e])!=null?n:1)||!Array.from(r).every(p=>Number.isFinite(p)&&p>=i&&p<=a))throw new RangeError("Invalid transition "+e+" (expected values in ["+i+", "+a+"])");return e==="anchor"?[r[0],1-r[1]]:e==="direction"?[r[0],-r[1]]:Za[e]?Array.from(r):t}var pl=new Map,hl=Object.freeze(Object.entries(fd).flatMap(([e,t])=>t.map(i=>{pl.set(i.id,i);let a={...i.options};for(let n of Object.keys(a))Array.isArray(a[n])&&(a[n]=Object.freeze([...a[n]]));let r=typeof i.passes=="function"?i.passes({target:dl.anchor}):i.passes;return Object.freeze({id:i.id,name:i.name,group:e,duration:i.duration,defaults:Object.freeze(a),spans:Object.freeze(r.map(n=>n.span))})})));function ml(e,t={}){var m,u,A,j,z;let i=pl.get(e);if(!i)throw new RangeError("Unknown Ink Studio transition "+e);let a={...dl,...i.options,...t};(m=a.target)!=null||(a.target=a.anchor),Qa("anchor",a.target);let r=typeof i.passes=="function"?i.passes(a):i.passes;if(t.timing!==void 0&&(!Array.isArray(t.timing)||t.timing.length!==r.length||!Array.from(t.timing).every(T=>Number.isFinite(T)&&T>0)))throw new RangeError("Transition timing must contain one positive span for each stage");let n=r.map((T,b)=>{var w,F,l;let v=Object.entries(dd).map(([_,C])=>{var I;let $=(I=T[_])!=null?I:a[_];return[_,C,typeof $=="function"?$:Qa(_,$)]});return{...T,span:(F=(w=t.timing)==null?void 0:w[b])!=null?F:T.span,easing:(l=t.easing)!=null?l:T.easing,uniforms(_){return{...Object.fromEntries(v.map(([C,$,I])=>[$,typeof I=="function"?Qa(C,I(_)):I])),...typeof t.uniforms=="function"?t.uniforms(_):t.uniforms}}}}),p=(j=(A=t.cues)!=null?A:(u=i.cues)==null?void 0:u.call(i,t))!=null?j:[],c=t.timing&&!t.cues&&e==="freeze-flash-swap"?p.map((T,b)=>({...T,at:n.slice(0,b).reduce((v,w)=>v+w.span,0)/n.reduce((v,w)=>v+w.span,0)})):p;return Kr({duration:(z=t.duration)!=null?z:i.duration,stages:n,cues:c})}function vl(e,{brush:t,project:i,commit:a,preview:r}={}){if(typeof t!="function"||typeof i!="function"||typeof a!="function")throw new TypeError("Drawing input needs brush, project and commit callbacks");let n,p=v=>v.kind==="fill"?3:1;function c({mark:v,points:w,pressure:F}){let l=w.map(_=>_.slice());return v.kind==="fill"?{...v,rings:[l]}:{...v,points:l,pressure:F.slice()}}function m(v,w=!1){var y;let{points:F,pressure:l,mark:_}=n,C=i(v,_);if(C==null)return;let $=_.surface||_.kind==="fill"?2:3;if(!Array.isArray(C)||C.length!==$||!C.every(Number.isFinite))throw new TypeError("Drawing projection must return a finite "+$+"D point or null");let I=v.pointerType==="pen"?w?l.at(-1):Math.min(1,Math.max(0,v.pressure)):1;if((y=F.at(-1))!=null&&y.every((E,o)=>E===C[o])){!w&&_.kind==="stroke"&&(l[l.length-1]=Math.max(I,l.at(-1)));return}F.push(C.slice()),l.push(I)}function u(v){if(n||v.button!==0)return;let w=t(v);if(w!=null){if(w.kind!=="stroke"&&w.kind!=="fill")throw new TypeError("Drawing brush needs kind stroke or fill");n={id:v.pointerId,mark:{...w},points:[],pressure:[]};try{if(m(v),!n.points.length){n=void 0;return}e.setPointerCapture(v.pointerId)}catch(F){throw n=void 0,F}v.preventDefault(),r==null||r(c(n))}}function A(v){var w;if((n==null?void 0:n.id)===v.pointerId){for(let F of((w=v.getCoalescedEvents)==null?void 0:w.call(v))||[])m(F);m(v),v.preventDefault(),r==null||r(c(n))}}function j(v,w){if(!n||v&&v.pointerId!==n.id)return;let F=n;try{w&&m(v,!0)}finally{n=void 0,e.hasPointerCapture(F.id)&&e.releasePointerCapture(F.id),r==null||r(null)}w&&F.points.length>=p(F.mark)&&a(c(F))}let z=v=>j(v,!0),T=v=>j(v,!1),b={pointerdown:u,pointermove:A,pointerup:z,pointercancel:T,lostpointercapture:T};for(let[v,w]of Object.entries(b))e.addEventListener(v,w);return{cancel:()=>j(void 0,!1),dispose(){for(let[v,w]of Object.entries(b))e.removeEventListener(v,w);j(void 0,!1)}}}var hd=(e,t,i)=>Math.min(i,Math.max(t,e)),wi=(e,t,i)=>Number.isFinite(e)&&e>=t&&e<=i,Ja=e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite);function _l(e,{resolveAsset:t,destination:i=e==null?void 0:e.destination,panning:a="HRTF",maxVoices:r=32,smoothing:n=.025}={}){if(typeof(e==null?void 0:e.createBufferSource)!="function"||!e.listener||!i||typeof t!="function"||!["HRTF","equalpower"].includes(a)||!Number.isSafeInteger(r)||r<1||r>128||!wi(n,0,1))throw new TypeError("Spatial audio needs a Web Audio context, asset resolver, and valid mix settings");let p=new Map,c=new Set,m=new Map,u=new Set,A=!1,j=-1/0;function z(y){c.add(y),c.size>8192&&c.delete(c.values().next().value)}function T(y){if(!m.has(y)){let E=Promise.resolve().then(()=>t(y)).then(o=>{if(!o||!wi(o.duration,Number.EPSILON,1e9)||typeof o.getChannelData!="function")throw new TypeError("Audio asset resolver must return an AudioBuffer for "+y);return o}).catch(o=>{throw m.get(y)===E&&m.delete(y),o});m.set(y,E),m.size>512&&m.delete(m.keys().next().value)}return m.get(y)}function b(y,E,o,h=!1){y.cancelScheduledValues(o),n&&!h?y.setTargetAtTime(E,o,n):y.setValueAtTime(E,o)}function v(y,E,o,h,s){o.forEach((d,k)=>b(y[E+"XYZ"[k]],d,h,s))}function w(y,E){if(!y)return;let o=e.listener,h=e.currentTime;o.positionX?(v(o,"position",y.position,h,E),v(o,"forward",y.forward,h,E),v(o,"up",y.up,h,E)):(o.setPosition(...y.position),o.setOrientation(...y.forward,...y.up))}function F(y,E){var Y;if(!y.source)return;let{voice:o,gain:h,low:s,high:d,filter:k,panner:B}=y,O=e.currentTime;b(h.gain,o.gain,O,E);let V=f=>hd(20*Math.log10(Math.max(1e-8,o.bands[f]/o.gain)),-60,40);if(b(s.gain,V("low"),O,E),b(d.gain,V("high"),O,E),b(k.frequency,Math.min(o.cutoff,e.sampleRate*.49),O,E),B){let f=(Y=o.apparentSource)!=null?Y:o.position;B.positionX?v(B,"position",f,O,E):B.setPosition(...f)}}function l(y){var E;for(let o of(E=y.nodes)!=null?E:[])o.disconnect()}function _(y,E=!1){if(p.get(y.voice.id)===y&&p.delete(y.voice.id),!y.source)return;let o=e.currentTime,h=E&&e.state==="running"&&y.started<=o?n*3:0;h?(u.size>=r&&_(u.values().next().value),b(y.gain.gain,0,o),u.add(y)):u.delete(y),y.source.stop(o+h),h||l(y)}function C(){for(let y of p.values())_(y);for(let y of u)_(y);c.clear(),j=-1/0}function $(y){let E={voice:y,when:e.currentTime+y.delay};return p.set(y.id,E),E.pending=T(y.asset).then(o=>{if(A||p.get(y.id)!==E)return;let h=E.voice,s=Math.max(e.currentTime,E.when),d=s-E.when,k=h.offset+d*h.rate,B=h.duration===void 0?void 0:h.duration-d;if(h.mode==="loop"&&(k%=o.duration),k>=o.duration||B!==void 0&&B<=0){p.delete(h.id),h.mode==="clip"&&z(h.id);return}let O=e.createBufferSource(),V=e.createBiquadFilter(),Y=e.createBiquadFilter(),f=e.createBiquadFilter(),S=e.createGain();O.buffer=o,O.loop=h.mode==="loop",O.playbackRate.value=h.rate,V.type="lowshelf",V.frequency.value=Math.min(250,e.sampleRate*.1),Y.type="highshelf",Y.frequency.value=Math.min(2600,e.sampleRate*.4),f.type="lowpass",f.Q.value=-3,O.connect(V),V.connect(Y),Y.connect(f),f.connect(S);let q=[O,V,Y,f,S],P;h.position?(P=e.createPanner(),P.panningModel=a,P.rolloffFactor=0,S.connect(P),P.connect(i),q.push(P)):S.connect(i),Object.assign(E,{source:O,low:V,high:Y,filter:f,gain:S,panner:P,nodes:q,started:s}),F(E,!0),O.onended=()=>{u.delete(E),p.get(h.id)===E&&(p.delete(h.id),h.mode==="clip"&&z(h.id)),l(E)},B===void 0?O.start(s,k):O.start(s,k,B*h.rate)}).catch(o=>{if(p.get(y.id)===E)throw p.delete(y.id),y.mode==="cue"&&c.delete(y.id),l(E),o}),E.pending}function I(y){if(!y||!wi(y.time,0,1e9)||!Array.isArray(y.active)||!Array.isArray(y.cues)||y.active.length+y.cues.length>4096||y.listener&&![y.listener.position,y.listener.forward,y.listener.up].every(Ja))throw new TypeError("Expected a spatial audio mix frame");let E=new Set;for(let[o,h]of[[y.active,["loop","clip"]],[y.cues,["cue"]]])for(let s of o){if(typeof(s==null?void 0:s.id)!="string"||E.has(s.id)||typeof s.asset!="string"||!h.includes(s.mode)||!wi(s.gain,0,16384)||!["low","mid","high"].every(d=>{var k;return wi((k=s.bands)==null?void 0:k[d],0,16384)})||!wi(s.rate,.001,64)||!wi(s.offset,0,65e9)||!wi(s.cutoff,20,22e3)||!wi(s.delay,0,1e9)||s.position!==null&&!Ja(s.position)||s.apparentSource!==void 0&&!Ja(s.apparentSource)||(s.mode==="clip"?!wi(s.duration,0,1e9):s.duration!==void 0))throw new TypeError("Invalid spatial audio voice");E.add(s.id)}}return Object.freeze({update(y,{seek:E=!1}={}){if(A)throw new Error("Spatial audio player is disposed");I(y),(E||y.time<j)&&C(),w(y.listener,j===-1/0),j=y.time;let o=new Map;for(let d of p.values())d.voice.mode==="cue"&&o.set(d.voice.id,d.voice);for(let d of y.active)d.gain>0&&!c.has(d.id)&&o.set(d.id,d);for(let d of y.cues)c.has(d.id)||(z(d.id),d.gain>0&&o.set(d.id,d));let h=new Map([...o].sort(([,d],[,k])=>k.gain-d.gain).slice(0,r));for(let d of p.values())h.has(d.voice.id)||_(d,!0);let s=[];for(let[d,k]of h){let B=p.get(d);B&&(B.voice.asset!==k.asset||B.voice.rate!==k.rate||!!B.voice.position!=!!k.position)&&(_(B),B=void 0),B?(B.source||(k.mode!=="cue"&&(B.when=e.currentTime+k.delay),s.push(B.pending)),B.voice=k,F(B,!1)):s.push($(k))}return Promise.all(s).then(()=>{})},reset:C,dispose(){A||(A=!0,C(),m.clear())}})}var md={solid:[],diagonal:[7,3],dots:[1,4],crosshatch:[6,2,2,2],horizontal:[10,4],vertical:[3,3],checker:[3,2,3,5]};function Yr(e,t,i,a,r){if(r==="square")e.rect(t-a,i-a,2*a,2*a);else if(r==="diamond"||r==="triangle"||r==="hexagon"){let n={triangle:3,diamond:4,hexagon:6}[r];for(let p=0;p<n;p++){let c=-Math.PI/2+p*2*Math.PI/n,m=[t+Math.cos(c)*a,i+Math.sin(c)*a];p?e.lineTo(...m):e.moveTo(...m)}e.closePath()}else e.moveTo(t+a,i),e.arc(t,i,a,0,2*Math.PI),r==="ring"&&(e.moveTo(t+a*.52,i),e.arc(t,i,a*.52,0,2*Math.PI,!0))}function vd(e,t,i){if(t==="solid")return;let a=e.canvas.ownerDocument.createElement("canvas");a.width=a.height=6;let r=a.getContext("2d");if(r.fillStyle=r.strokeStyle=i,r.lineWidth=1.35,t==="dots")r.beginPath(),r.arc(2,2,1.15,0,Math.PI*2),r.fill();else if(t==="checker")r.fillRect(0,0,3,3),r.fillRect(3,3,3,3);else{if(r.beginPath(),t==="horizontal"&&(r.moveTo(0,2.5),r.lineTo(6,2.5)),t==="vertical"&&(r.moveTo(2.5,0),r.lineTo(2.5,6)),t==="diagonal"||t==="crosshatch")for(let n of[-6,0,6])r.moveTo(n,6),r.lineTo(n+6,0),t==="crosshatch"&&(r.moveTo(n,0),r.lineTo(n+6,6));r.stroke()}return e.createPattern(a,"repeat")}function Zr(e,t,i,a){let r=new Map,n=t["pattern-fill"],p=t["pattern-ink"];return{tint(c){var m;return i.monochrome?n:(m=a==null?void 0:a(c))!=null?m:i.mark(c)?n:t.point},fill(c,m,u,{area:A=!1}={}){if(e.fillStyle=m,e.globalAlpha=A?u?.66:.24:1,e.fill(c,"evenodd"),e.globalAlpha=1,!u)return;r.has(u.pattern)||r.set(u.pattern,vd(e,u.pattern,p));let j=r.get(u.pattern);j&&(e.fillStyle=j,e.fill(c,"evenodd"))},dash(c){var m;e.setLineDash((m=md[c==null?void 0:c.pattern])!=null?m:[])}}}var _d=`
  :host{display:block;color:var(--ink);font:var(--ink-linked-font,14px system-ui,sans-serif);
    --surface:var(--ink-linked-surface,#132130);--ink:var(--ink-linked-text,#e4edf6);
    --muted:var(--ink-linked-muted,#9fb2c7);--line:var(--ink-linked-border,#2b3d50);
    --accent:var(--ink-linked-selection,#ffc477);background:var(--ink-linked-background,#0c151f);color-scheme:dark}
  *{box-sizing:border-box}
  .shell{max-width:1500px;margin:auto;padding:32px 34px 38px}
  h1,h2,p{margin:0}h1{font-size:clamp(27px,4vw,43px);letter-spacing:-.045em;line-height:1.1}
  h2{font-size:15px;letter-spacing:.015em}
  .top{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:22px}
  output,.meta,.small{color:var(--muted);font-size:12px}
  .toolbar{display:flex;align-items:end;gap:16px;padding:13px 15px;margin-bottom:17px;border:1px solid var(--line);border-radius:8px;background:var(--surface)}
  label{display:grid;gap:6px;font-size:12px;color:var(--muted)}
  .clock{flex:1;min-width:100px;max-width:540px}.clock span{display:flex;justify-content:space-between}
  input[type=range]{width:100%;accent-color:var(--accent);min-height:30px;margin:0}
  select,button{min-height:32px;background:var(--ink-linked-control,#192a3a);border:1px solid var(--ink-linked-control-border,#3a5167);color:var(--ink);border-radius:5px;font:inherit;padding:4px 10px}
  button{cursor:pointer}button:disabled{opacity:.42;cursor:default}
  .panels{display:grid;grid-template-columns:var(--ink-linked-columns,minmax(0,1.28fr) minmax(0,1fr));gap:16px}
  .panels:has(>section:only-child){grid-template-columns:1fr}
  section{min-width:0;border:1px solid var(--line);border-radius:8px;overflow:hidden;background:var(--surface)}
  .panel-head{height:51px;padding:0 15px;display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid var(--line)}
  canvas{display:block;width:100%;height:var(--ink-linked-canvas-height,300px);touch-action:none}
  canvas[data-view=chart]{height:var(--ink-linked-chart-height,270px)}
  .table-wrap{height:var(--ink-linked-table-height,226px);overflow:auto}
  table{width:100%;border-collapse:collapse;white-space:nowrap;font-size:13px}
  th,td{text-align:left;padding:7px 9px;border-bottom:1px solid var(--line)}
  th{position:sticky;top:0;background:var(--ink-linked-table-header,#192939);color:var(--muted);font-size:11px;font-weight:600}
  td:first-child button{padding:0 4px;min-height:22px;border:0;background:none;text-align:left}
  tr[data-selected=true]{background:var(--ink-linked-selected-row,#594634);color:var(--ink-linked-selected-text,#ffe0ab)}
  tr[data-selected=true] button{color:var(--ink-linked-selected-text,#ffe0ab)}
  .table-controls{height:44px;display:flex;gap:8px;align-items:center;justify-content:flex-end;padding:6px 12px;border-top:1px solid var(--line)}
  .table-controls button{min-height:25px}
  .encoding-legend{display:flex;align-items:center;flex-wrap:wrap;gap:10px 18px;padding:9px 12px;margin:0 0 14px;
    border:1px solid var(--line);border-radius:7px;background:var(--surface)}
  .encoding-legend strong{font-size:12px}
  .encoding-legend ul{display:flex;flex-wrap:wrap;gap:8px 16px;list-style:none;padding:0;margin:0}
  .encoding-legend li{display:flex;align-items:center;gap:5px;font-size:12px}
  [part~=pattern-swatch]{width:23px;height:20px;flex:none;display:inline-block;vertical-align:middle;touch-action:auto}
  .scale{margin:0;padding:9px 13px;border-top:1px solid var(--line);display:grid;gap:4px;font-size:12px}
  .scale>div{display:flex;gap:12px;justify-content:space-between;flex-wrap:wrap}
  .scale dt{font-weight:600}.scale dd{margin:0;display:flex;gap:8px;color:var(--muted);font-variant-numeric:tabular-nums}
  .scale dd span:last-child::before{content:'\u2013';padding-right:8px}
  :is(canvas,button):focus-visible{outline:2px solid var(--ink-linked-focus,#e8f3ff);outline-offset:-3px}
  button[aria-pressed=true]{text-decoration:underline;text-underline-offset:3px}
  .sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
  [hidden]{display:none!important}
  @media(max-width:760px){.shell{padding:20px 14px}.panels{grid-template-columns:1fr}.toolbar,.top{flex-wrap:wrap}}
`,xd={selection:"#ffc477",point:"#6cdadf",grid:"#263a4c",muted:"#9fb2c7","plot-background":"#101b28","plot-font":"11px system-ui,sans-serif",playhead:"#d89445",series:"#527285","pattern-fill":"#e8edf2","pattern-ink":"#26313c",focus:"#f4f8ff"},xl=["scene","map","chart","table"],yl=new WeakMap;function tn(e){let t=e.ownerDocument.defaultView.getComputedStyle(e);return Object.fromEntries(Object.entries(xd).map(([i,a])=>[i,t.getPropertyValue("--ink-linked-"+i).trim()||a]))}var Qr=Number.isFinite,Qi=e=>e==null?"\u2014":Array.isArray(e)?e.map(Qi).join(", "):typeof e=="number"?Number(e.toFixed(2)).toString():String(e),en=e=>e.shiftKey||e.metaKey||e.ctrlKey?"toggle":"replace",bl={previous:"ArrowLeft",next:"ArrowRight",start:"Home",end:"End",select:"Enter",clear:"Escape"},gl=e=>e.flatMap(t=>[t,...["Shift","Control","Meta"].map(i=>({input:t,modifiers:[i]}))]),yd={records:{previous:["key:ArrowLeft","key:ArrowUp","pad:DPadLeft","pad:DPadUp"],next:["key:ArrowRight","key:ArrowDown","pad:DPadRight","pad:DPadDown"],start:["key:Home"],end:["key:End"],select:[...gl(["key:Enter","key:Space"]),"pad:South"],clear:["key:Escape","pad:East"],point:gl(["mouse:Left","pen:Tip","touch:Contact"])}},Ct=(e,t,i)=>{let a=e.createElement(t);return i!==void 0&&(a.textContent=i),a};function wl(e){let t=1/0,i=1/0,a=-1/0,r=-1/0;for(let p of e)p.every(Qr)&&(t=Math.min(t,p[0]),a=Math.max(a,p[0]),i=Math.min(i,p[1]),r=Math.max(r,p[1]));if(t===1/0)return[[0,1],[0,1]];let n=(p,c)=>p===c?[p-.5,p+.5]:[p,c];return[n(t,a),n(i,r)]}function on(e,t){if(!e)return;if(e.type==="GeometryCollection")return e.geometries.forEach(a=>on(a,t));function i(a){typeof a[0]=="number"?t(a):a.forEach(i)}i(e.coordinates)}function El(e,t){let i=Math.max(1,Math.round(e.clientWidth)),a=Math.max(1,Math.round(e.clientHeight));e.width!==i&&(e.width=i),e.height!==a&&(e.height=a);let r=e.getContext("2d");return r.fillStyle=t["plot-background"],r.fillRect(0,0,i,a),r.font=t["plot-font"],{ctx:r,width:i,height:a}}function bd(e,t,i,a,r,{connect:n,color:p,brush:c,encoding:m,focusRow:u}){let A=tn(e),{selection:j,grid:z,muted:T,playhead:b,series:v}=A,{ctx:w,width:F,height:l}=El(e,A),_=56,C=F-20,$=22,I=l-43,y=Zr(w,A,m,p),[[E,o],[h,s]]=i,d=O=>_+(O-E)/(o-E)*(C-_),k=O=>I-(O-h)/(s-h)*(I-$);w.strokeStyle=z,w.fillStyle=T;for(let O=0;O<=4;O++){let V=_+(C-_)*O/4,Y=I-(I-$)*O/4;w.beginPath(),w.moveTo(V,$),w.lineTo(V,I),w.moveTo(_,Y),w.lineTo(C,Y),w.stroke(),w.textAlign="center",w.fillText(Qi(E+(o-E)*O/4),V,I+17),w.textAlign="right",w.fillText(Qi(h+(s-h)*O/4),_-8,Y+3)}w.textAlign="center",w.fillText(a[0],(_+C)/2,l-8),w.save(),w.translate(14,($+I)/2),w.rotate(-Math.PI/2),w.fillText(a[1],0,0),w.restore(),Qr(r)&&r>=E&&r<=o&&(w.strokeStyle=b,w.setLineDash([4,4]),w.beginPath(),w.moveTo(d(r),$),w.lineTo(d(r),I),w.stroke(),w.setLineDash([])),n&&t.length>1&&(w.strokeStyle=v,w.beginPath(),t.forEach((O,V)=>V?w.lineTo(d(O.x),k(O.y)):w.moveTo(d(O.x),k(O.y))),w.stroke());let B=t.map(O=>({...O,px:d(O.x),py:k(O.y)}));for(let O of[...B].sort((V,Y)=>Number(V.selected)-Number(Y.selected))){let V=m.mark(O.ref),Y=V?7:O.selected?6:3.4,f=new Path2D;Yr(f,O.px,O.py,Y,V==null?void 0:V.symbol),y.fill(f,V||!O.selected?y.tint(O.ref):j,V),V&&(w.strokeStyle=A["pattern-ink"],w.stroke(f),V.code&&(w.textAlign="left",w.fillStyle=A.focus,w.fillText(V.code,O.px+Y+4,O.py-5))),O.selected&&(w.strokeStyle=j,w.lineWidth=1.6,w.beginPath(),w.arc(O.px,O.py,V?11:9,0,2*Math.PI),w.stroke(),w.lineWidth=1),O.ref.row===u&&Al(w,A,O.px,O.py,V?14:12)}if(c){let[O,V]=c,Y=Math.min(O[0],V[0]),f=Math.min(O[1],V[1]),S=Math.abs(O[0]-V[0]),q=Math.abs(O[1]-V[1]);w.fillStyle=j,w.globalAlpha=.15,w.fillRect(Y,f,S,q),w.globalAlpha=1,w.strokeStyle=j,w.strokeRect(Y,f,S,q)}return B}function Al(e,t,i,a,r){e.save(),e.setLineDash([3,2]),e.strokeStyle=t.focus,e.lineWidth=1.5,e.strokeRect(i-r,a-r,r*2,r*2),e.restore()}function gd(e,t,i,{color:a,encoding:r,focusRow:n}){let p=tn(e),{selection:c,grid:m}=p,{ctx:u,width:A,height:j}=El(e,p),[[z,T],[b,v]]=i,w=24,F=Zr(u,p,r,a),l=Math.max(.001,Math.min((A-2*w)/(T-z),(j-2*w)/(v-b))),_=([I,y])=>[A*.5+(I-(z+T)*.5)*l,j*.5-(y-(b+v)*.5)*l];u.strokeStyle=m,u.beginPath();for(let I=0;I<=8;I++){let y=A*I/8+.5,E=j*I/8+.5;u.moveTo(y,0),u.lineTo(y,j),u.moveTo(0,E),u.lineTo(A,E)}u.stroke();let C=[];function $(I,y,E){var q;if(I.type==="GeometryCollection"){I.geometries.forEach(P=>$(P,y,E));return}let o=new Path2D,h=I.coordinates,s=r.mark(y),d=[];function k(P){let[W,R]=_(P);d.push([W,R]),Yr(o,W,R,s?7:E?6:4,s==null?void 0:s.symbol)}function B(P,W=!1){P.forEach((R,U)=>U?o.lineTo(..._(R)):o.moveTo(..._(R))),W&&o.closePath()}function O(P){P.forEach(W=>B(W,!0))}let V={Point:k,MultiPoint:P=>P.forEach(k),LineString:B,MultiLineString:P=>P.forEach(W=>B(W)),Polygon:O,MultiPolygon:P=>P.forEach(O)};(q=V[I.type])==null||q.call(V,h);let Y=I.type.includes("Polygon"),f=Y||I.type.includes("Point"),S=E&&!s?c:F.tint(y);u.strokeStyle=E?c:f&&s?p["pattern-ink"]:S,u.lineWidth=E?2.6:1.5,f?F.fill(o,S,s,{area:Y}):F.dash(s),u.stroke(o),u.setLineDash([]),s!=null&&s.code&&!d.length&&on(I,P=>{d.length||d.push(_(P))});for(let[P,W]of d)s!=null&&s.code&&(u.textAlign="left",u.fillStyle=p.focus,u.fillText(s.code,P+10,W-6)),E&&(u.strokeStyle=c,u.beginPath(),u.arc(P,W,11,0,2*Math.PI),u.stroke()),y.row===n&&Al(u,p,P,W,14);y.row===n&&!d.length&&(u.strokeStyle=p.focus,u.setLineDash([2,2]),u.lineWidth=2,u.stroke(o),u.setLineDash([])),C.push({p:o,ref:y,fill:f})}return[...t].sort((I,y)=>Number(I.selected)-Number(y.selected)).forEach(I=>$(I.geometry,I.ref,I.selected)),I=>{var y;return u.lineWidth=10,(y=C.findLast(({p:E,fill:o})=>o&&u.isPointInPath(E,...I,"evenodd")||u.isPointInStroke(E,...I)))==null?void 0:y.ref}}function kl(e,t,i){let a=Ct(e,"canvas");a.width=23,a.height=20,a.setAttribute("aria-hidden","true"),a.setAttribute("part","pattern-swatch");let r=a.getContext("2d"),n=new Path2D;return Yr(n,11.5,10,8,i.symbol),Zr(r,t,{}).fill(n,t["pattern-fill"],i),r.strokeStyle=t["pattern-ink"],r.stroke(n),a}function Tl(e,t,i,a,r={}){let n=i.map(([p,c],m)=>{var v,w;let u=Ct(e,"div"),A=Ct(e,"dd"),[j,z]=a[m],T=z==="$time"?{min:"Start",max:"End"}:{min:"Min",max:"Max"},b=(v=r[m===0?"x":"y"])!=null?v:{};for(let[F,l]of[["min",p],["max",c]]){let _=((w=b[F])!=null?w:T[F])+" "+String(Number(l.toPrecision(10))),C=Ct(e,"span",_);C.setAttribute("part","scale-endpoint "+F+"-endpoint"),A.append(C)}return u.append(Ct(e,"dt",j),A),u});t.replaceChildren(...n)}function wd(e,t,i,[a,r]){let n=Xi(e,t,i.width,i.height),{eye:p,right:c,up:m,back:u}=Ii(n),A=(2*a/i.clientWidth-1)*n.tangent*n.aspect,j=(1-2*r/i.clientHeight)*n.tangent,z=(T,b)=>T.map((v,w)=>v+(A*c[w]+j*m[w])*b);return n.ortho?{origin:z(p,1).map((T,b)=>T-n.clipNear*u[b]),direction:u.map(T=>-T),maxDistance:n.clipFar-n.clipNear}:{origin:z(p,n.clipNear).map((T,b)=>T-n.clipNear*u[b]),direction:z(u.map(T=>-T),1),maxDistance:(n.clipFar-n.clipNear)*Math.hypot(1,A,j)}}function Sl(e,{toolkit:t,session:i,chart:a,map:r={},table:n={},scene:p,title:c="Linked views",filterBy:m,timeRange:u=i==null?void 0:i.timeRange,timeStep:A=.01,color:j,panels:z=xl,labels:T={},controls:b={},stylesheet:v="",defaultStyles:w=!0,encoding:F,input:l={}}={}){var rt,Et,Mt,At,wt,it,qt,Lt,jt,Ot,Zt,ii,oi,Wt;if(!Array.isArray(z)||!z.length||new Set(z).size!==z.length||!Array.from(z).every(D=>xl.includes(D))||typeof v!="string"||typeof w!="boolean")throw new TypeError("Invalid linked panel layout or stylesheet");let _=D=>z.includes(D),C=b.keyboard!==!1;if(!(i!=null&&i.subscribe)||_("chart")&&!a||_("scene")&&(!(p!=null&&p.world)||!(t!=null&&t.KIT)))throw new TypeError("Linked panels need a session, chart axes for a chart, and a world and toolkit for a scene");if(u&&(!Array.isArray(u)||u.length!==2||!u.every(Qr)||u[1]<u[0]||!Qr(A)||A<=0))throw new TypeError("Invalid linked time range");let{columns:$}=i.description,I=(rt=n.pageSize)!=null?rt:10,y=(Et=n.columns)!=null?Et:Object.keys($);if(m&&!Object.hasOwn($,m))throw new TypeError("Unknown filter column");if(_("table")&&(!y.length||!Number.isSafeInteger(I)||I<1||I>100))throw new TypeError("Invalid linked table columns or page size");let E=i.encoding(F);_("chart")&&i.chart(a),_("map")&&i.map(r),_("table")&&i.table({columns:y,limit:1});let o=e.ownerDocument,h=o.defaultView,s=(Mt=yl.get(e))!=null?Mt:e.attachShadow({mode:"open"});if(s.childElementCount)throw new Error("This host already has mounted linked views");yl.set(e,s),s.innerHTML=`<div class="shell" part="shell">
    <header class="top" part="header"><h1 part="title"></h1><output class="summary" part="summary" aria-live="polite"></output></header>
    <div class="toolbar" part="toolbar"><label class="filter" part="filter"><span data-label="filter">Filter</span>
      <select part="filter-input" aria-label="Filter records"></select></label>
      <label class="clock" part="clock"><span><span data-label="time">Time</span><output part="time-value"></output></span>
        <input part="time-slider" type="range" aria-label="Scene time in seconds"></label>
      <button class="clear" part="clear-selection" data-label="clear">Clear selection</button></div>
    <div class="encoding-legend" part="encoding-legend"><strong id="encoding-title"></strong>
      <ul aria-labelledby="encoding-title" part="encoding-items"></ul></div>
    <p class="sr-only" id="keyboard-help" part="keyboard-help">Use arrow keys to move between records.
      Home and End jump to the first or last record. Press Enter or Space to select, or hold Shift to toggle selection. Press Escape to clear selection.</p>
    <output class="sr-only" role="status" aria-live="polite" part="record-status"></output>
    <div class="panels" part="panels">
      <section data-panel="scene" part="panel scene-panel"><div class="panel-head" part="panel-header"><h2 data-label="scene">Scene</h2>
        <span class="meta" part="panel-detail" data-label="world">World view</span></div>
        <canvas data-view="scene" part="canvas scene-canvas" aria-label="3D scene"></canvas></section>
      <section data-panel="map" part="panel map-panel"><div class="panel-head" part="panel-header"><h2 data-label="map">Map</h2>
        <span class="meta map-meta" part="panel-detail"></span></div>
        <canvas data-view="map" part="canvas map-canvas" aria-label="Spatial map"></canvas>
        <dl class="scale" id="map-scale" part="scale map-scale"></dl></section>
      <section data-panel="chart" part="panel chart-panel"><div class="panel-head" part="panel-header"><h2 data-label="chart">Chart</h2>
        <span class="meta chart-meta" part="panel-detail"></span></div>
        <canvas data-view="chart" part="canvas chart-canvas" aria-label="Data chart"></canvas>
        <dl class="scale" id="chart-scale" part="scale chart-scale"></dl></section>
      <section data-panel="table" part="panel table-panel"><div class="panel-head" part="panel-header"><h2 data-label="table">Records</h2>
        <span class="meta record-meta" part="panel-detail"></span></div>
        <div class="table-wrap" part="table-scroll"><table part="table" tabindex="-1">
          <caption class="sr-only" part="table-caption"></caption>
          <thead part="table-header"></thead><tbody part="table-body"></tbody></table></div>
        <div class="table-controls" part="pagination"><button class="prev" part="previous-page" aria-label="Previous records">\u2039</button>
          <span class="small page" part="page"></span><button class="next" part="next-page" aria-label="Next records">\u203A</button></div></section>
    </div></div>`,w&&s.prepend(Ct(o,"style",_d)),v&&s.append(Ct(o,"style",v));let d=D=>s.querySelector(D),k=D=>d(`[data-view="${D}"]`);d(".panels").replaceChildren(...z.map(D=>d(`[data-panel="${D}"]`))),d("h1").textContent=c;for(let D of s.querySelectorAll("[data-label]"))Object.hasOwn(T,D.dataset.label)&&(D.textContent=T[D.dataset.label]);let B=D=>{var xe;return D==="$time"?"Time \xB7 s":[D,(xe=$[D])==null?void 0:xe.units].filter(Boolean).join(" \xB7 ")};_("chart")&&(d(".chart-meta").textContent=B(a.y)),_("map")&&(d(".map-meta").textContent=(it=(At=r.coordinates)==null?void 0:At.join(" / "))!=null?it:((wt=r.plane)!=null?wt:"xz").toUpperCase()),d("#keyboard-help").hidden=!C;let O=d('[part="record-status"]'),V=d(".encoding-legend");V.hidden=b.legend===!1||!E.entries.length,d("#encoding-title").textContent=(Lt=(qt=T.encoding)!=null?qt:E.category)!=null?Lt:"";let Y,f,S=new Map;function q(){if(!E.entries.length)return;let D=tn(e),xe=D["pattern-fill"]+"/"+D["pattern-ink"];xe!==Y&&(Y=xe,f=D,S.clear(),V.hidden||V.querySelector("ul").replaceChildren(...E.entries.map(de=>{let ke=Ct(o,"li");return ke.setAttribute("part","encoding-item"),ke.append(kl(o,D,de),Ct(o,"span",de.code===void 0?de.label:de.code+" \xB7 "+de.label)),ke})))}function P(D){let xe=D.pattern+"/"+D.symbol;S.has(xe)||S.set(xe,kl(o,f,D).toDataURL());let de=Ct(o,"img");return de.src=S.get(xe),de.alt="",de.width=23,de.height=20,de.setAttribute("aria-hidden","true"),de.setAttribute("part","pattern-swatch"),de}let W=k("chart"),R=k("map"),U=k("scene"),J;try{U&&(J=Bi(U,{toolkit:t}))}catch(D){throw s.replaceChildren(),D}let ie=d("select"),N=d("input"),K=m?Array.from(new Set(i.records.map(D=>D.record[m]).filter(D=>["string","number","boolean"].includes(typeof D)))):[];d(".filter").hidden=!m||b.filter===!1;let Z=(D,xe)=>{let de=Ct(o,"option",D);return de.value=xe,ie.append(de),de};Z((jt=T.allRecords)!=null?jt:"All records",""),K.forEach((D,xe)=>Z(Qi(D),String(xe)));let ye=Z((Ot=T.customFilter)!=null?Ot:"Custom filter","custom");ye.disabled=!0,d(".clock").hidden=!u||b.time===!1,d(".clear").hidden=b.clear===!1,d(".toolbar").hidden=[".filter",".clock",".clear"].every(D=>d(D).hidden),u&&(N.min=u[0],N.max=u[1],N.step=A);let ve=W&&wl(i.records.map(D=>[a.x==="$time"?D.time:D.record[a.x],D.record[a.y]])),ze=[],me={xy:[0,1],xz:[0,2],yz:[1,2]}[(Zt=r.plane)!=null?Zt:"xz"];if(R)for(let D of i.records)r.coordinates?ze.push(r.coordinates.map(xe=>D.record[xe])):on(D.geometry,xe=>ze.push(me.map(de=>xe[de])));let Fe=wl(ze);if(W){let D=d("#chart-scale");D.hidden=b.scales===!1,Tl(o,D,ve,[[B(a.x),a.x],[B(a.y),a.y]],a.scaleLabels)}if(R){let D=d("#map-scale");D.hidden=b.scales===!1;let xe=r.coordinates?r.coordinates.map(de=>[B(de),de]):Array.from(((ii=r.plane)!=null?ii:"xz").toUpperCase(),de=>[de+" \xB7 world units",de]);Tl(o,D,Fe,xe,r.scaleLabels)}let Le=d("tbody");if(Le){d("caption").textContent=(Wt=n.caption)!=null?Wt:(oi=T.table)!=null?oi:"Records";let D=Ct(o,"tr");for(let xe of y){let de=Ct(o,"th",B(xe));de.scope="col",D.append(de)}d("thead").append(D)}let te=0,H=0,g=0,M=!1,G,X,ae,Q,pe=[],Ae=()=>{},Pe,Te,we={};function Me(D){Te=D.row,Le&&(te=Math.floor(i.snapshot().visible.findIndex(xe=>xe.ref.row===Te)/I))}let He=(D,xe)=>{D&&(Me(D),i.update({selection:[D],mode:en(xe)}),fe())},qe=(D,xe)=>{let de=xe.getBoundingClientRect();return[D.clientX-de.left,D.clientY-de.top]},fe=()=>{!H&&!M&&(H=h.requestAnimationFrame(Ie))};function Ne(D,xe){var de,ke;if(D==="chart")return i.chart(a,xe).map(se=>se.ref);if(D==="map")return i.map(r,xe).map(se=>se.ref);if(D==="scene"){let se=(ke=(de=ae==null?void 0:ae.dataMarks)==null?void 0:de.list({limit:2e4}).marks)!=null?ke:[],Ze=new Set(se.filter(Ve=>{var dt;return Ve.status==="visible"&&((dt=Ve.source)==null?void 0:dt.dataset)===i.description.id}).map(Ve=>Ve.source.row));return xe.visible.filter(Ve=>Ze.has(Ve.ref.row)).map(Ve=>Ve.ref)}return xe.visible.map(se=>se.ref)}function We(D,xe){var se;if(!D)return;Me(D);let de=(se=E.mark(D))==null?void 0:se.label,ke=i.snapshot().selection.some(Ze=>Ze.row===Te);O.textContent=[E.name(D),de,"Record "+(xe.indexOf(D)+1)+" of "+xe.length,ke?"Selected":"Unselected"].filter(Boolean).join(". "),fe()}function Se(D,xe,de=D.key){let ke={ArrowLeft:-1,ArrowUp:-1,ArrowRight:1,ArrowDown:1};if(!Object.hasOwn(ke,de)&&!["Home","End","Enter"," ","Escape"].includes(de))return;let se=Ne(xe,i.snapshot());if(de==="Escape"&&(D.preventDefault(),i.update({selection:[]}),se.length||(O.textContent="No matching records in this view")),!se.length)return;D.preventDefault();let Ze=se.findIndex(vt=>vt.row===Te),Ve;Object.hasOwn(ke,de)?Ve=Ze<0?0:Math.max(0,Math.min(se.length-1,Ze+ke[de])):Ve=de==="Home"?0:de==="End"?se.length-1:Math.max(0,Ze);let dt=se[Ve];(de==="Enter"||de===" ")&&He(dt,D),We(dt,se)}if(C){for(let D of[W,R,U])if(D){let xe=D.dataset.view;D.tabIndex=0,D.setAttribute("aria-describedby",["keyboard-help",...(xe==="chart"||xe==="map")&&b.scales!==!1?[xe+"-scale"]:[]].join(" ")),l!=null&&l[xe]||(D.onkeydown=de=>Se(de,xe)),D.onfocus=()=>{var se;let de=Ne(xe,i.snapshot()),ke=(se=de.find(Ze=>Ze.row===Te))!=null?se:de[0];ke?We(ke,de):O.textContent="No matching records in this view"},D.onblur=fe}}function Ie(){var Ve,dt,vt,kt,Vt,ri;if(H=0,M)return;let D=i.snapshot(),{time:xe,selection:de,visible:ke}=D;if(q(),d(".summary").textContent=ke.length+" / "+i.records.length+" records \xB7 "+de.length+" selected",d(".clock output").textContent=Qi(xe)+" s",N.value=xe,d(".clear").disabled=!de.length,m){let pt=D.filter,st=((Ve=pt==null?void 0:pt.path)==null?void 0:Ve.length)===1&&pt.path[0]===m&&((dt=pt.op)!=null?dt:"eq")==="eq"?K.indexOf(pt.value):-1;ye.hidden=!pt||st>=0,ie.value=st>=0?String(st):pt?"custom":""}let se=s.activeElement,Ze=C&&(se!=null&&se.dataset.view||Le!=null&&Le.contains(se))?Te:void 0;if(W&&(pe=bd(W,i.chart(a,D),ve,[B(a.x),B(a.y)],a.x==="$time"?xe:void 0,{connect:a.connect,color:j,brush:Pe,encoding:E,focusRow:Ze})),R&&(Ae=gd(R,i.map(r,D),Fe,{color:j,encoding:E,focusRow:Ze})),Le){te=Math.max(0,Math.min(te,Math.ceil(ke.length/I)-1));let pt=i.table({columns:y,offset:te*I,limit:I},D),st=Le.contains(se)?se.dataset.row:void 0,vi=(Vt=(vt=pt.rows.find(Tt=>Tt.ref.row===Te))==null?void 0:vt.ref)!=null?Vt:(kt=pt.rows[0])==null?void 0:kt.ref;if(Le.replaceChildren(...pt.rows.map(Tt=>{let Ut=Ct(o,"tr");return Ut.dataset.selected=Tt.selected,Ut.setAttribute("part",Tt.selected?"row selected-row":"row"),Tt.values.forEach((_i,nr)=>{let Ji=Ct(o,"td");if(Ji.setAttribute("part","cell"),nr===0){let Nt=Ct(o,"button",Qi(_i));Nt.type="button",Nt.setAttribute("part","record"),Nt.dataset.row=Tt.ref.row,Nt.setAttribute("aria-pressed",String(Tt.selected));let Xt=E.mark(Tt.ref);if(Xt&&Nt.prepend(P(Xt)),Xt!=null&&Xt.code){let ki=Ct(o,"span",Xt.code+" ");ki.setAttribute("aria-hidden","true"),Nt.insertBefore(ki,Nt.lastChild)}(Xt||E.label!==void 0)&&Nt.setAttribute("aria-label",[E.label===void 0?Qi(_i):E.name(Tt.ref),Xt==null?void 0:Xt.label].filter(Boolean).join(". ")),Nt.onclick=ki=>He(Tt.ref,ki),C&&(Nt.tabIndex=Tt.ref===vi?0:-1,Nt.onkeydown=ki=>Se(ki,"table"),Nt.onfocus=()=>{Te!==Tt.ref.row&&(Te=Tt.ref.row,fe())}),Ji.append(Nt)}else Ji.textContent=Qi(_i);Ut.append(Ji)}),Ut})),!pt.rows.length){let Tt=Ct(o,"tr"),Ut=Ct(o,"td",(ri=T.empty)!=null?ri:"No matching records");Ut.colSpan=y.length,Tt.append(Ut),Le.append(Tt)}if(st!==void 0){let Tt=Le.querySelector(`button[data-row="${C?vi==null?void 0:vi.row:st}"]`);(Tt!=null?Tt:d("table")).focus({preventScroll:!0})}d(".record-meta").textContent=String(pt.total),d(".prev").disabled=te===0,d(".next").disabled=(te+1)*I>=pt.total,d(".page").textContent=pt.total?te*I+1+"\u2013"+Math.min(pt.total,(te+1)*I):"0"}if(U){let pt=Math.max(1,U.clientWidth),st=Math.max(1,U.clientHeight);(G!==D||Q.width!==pt||Q.height!==st)&&(G!==D&&(X=typeof p.world=="function"?p.world(D):p.world,ae=i.scene(X,D,{highlight:p.highlight})),Q={raw:!0,...typeof p.frame=="function"?p.frame(D):p.frame,time:xe,width:pt,height:st},J.render(ae,Q),G=D)}}ie.onchange=()=>{te=0,i.update({filter:ie.value===""?null:{path:[m],value:K[Number(ie.value)]}})},N.oninput=()=>i.update({time:Number(N.value)}),d(".clear").onclick=()=>i.update({selection:[]}),_("table")&&(d(".prev").onclick=()=>{te--,fe()},d(".next").onclick=()=>{te++,fe()});function ne(D){Pe=[D,D]}function Ce(D){Pe&&(Pe[1]=D,fe())}function Ue(){Pe=void 0,fe()}function Ke(D){if(!Pe)return;let[xe]=Pe,de=qe(D,W);if(Pe=void 0,Math.hypot(xe[0]-de[0],xe[1]-de[1])>5){let ke=pe.filter(se=>se.px>=Math.min(xe[0],de[0])&&se.px<=Math.max(xe[0],de[0])&&se.py>=Math.min(xe[1],de[1])&&se.py<=Math.max(xe[1],de[1])).map(se=>se.ref);i.update({selection:ke,mode:en(D)})}else{let ke=10,se;for(let Ze of pe){let Ve=Math.hypot(Ze.px-de[0],Ze.py-de[1]);Ve<ke&&(ke=Ve,se=Ze.ref)}He(se,D)}fe()}W&&!(l!=null&&l.chart)&&(W.onpointerdown=D=>{D.button===0&&(ne(qe(D,W)),W.setPointerCapture(D.pointerId))},W.onpointermove=D=>Ce(qe(D,W)),W.onpointercancel=Ue,W.onpointerup=Ke);let ot=D=>He(Ae(qe(D,R)),D),gt=D=>{ae&&Q&&i.pick(J.pick(ae,wd(ae,Q,U,qe(D,U)),Q).dominant,{mode:en(D)})};R&&!(l!=null&&l.map)&&(R.onclick=ot),U&&!(l!=null&&l.scene)&&(U.onclick=gt);function xt(){!g&&!M&&(g=h.requestAnimationFrame(()=>{g=0;let D=!1;for(let xe of Object.values(we))D=xe.poll().focused||D;D&&xt()}))}try{for(let[D,xe]of Object.entries({chart:W,map:R,scene:U})){let de=l==null?void 0:l[D];if(!xe||!de)continue;let ke;we[D]=Zi(xe,{contexts:yd,...de,toolkit:t,onFocus(se){var Ze;se&&xt(),(Ze=de.onFocus)==null||Ze.call(de,se)},onAction(se){var Ve,dt;let Ze=Object.hasOwn(bl,se.action)&&bl[se.action];if(Ze&&(se.phase==="press"||se.phase==="repeat")){let{shiftKey:vt,ctrlKey:kt,metaKey:Vt}=(Ve=se.event)!=null?Ve:{};Se({shiftKey:vt,ctrlKey:kt,metaKey:Vt,preventDefault(){}},D,Ze)}(dt=de.onAction)==null||dt.call(de,se)},onPointer(se){var Ze;se.action==="point"&&(se.phase==="start"&&ke===void 0?(ke=se.id,D==="chart"&&ne(se.point)):ke===se.id&&(se.phase==="move"&&D==="chart"&&Ce(se.point),(se.phase==="cancel"||se.phase==="end")&&(ke=void 0,D==="chart"?se.phase==="end"?Ke(se.event):Ue():se.phase==="end"&&(D==="map"?ot:gt)(se.event)))),(Ze=de.onPointer)==null||Ze.call(de,se)}})}}catch(D){M=!0;for(let xe of Object.values(we))xe.dispose();throw h.cancelAnimationFrame(g),h.cancelAnimationFrame(H),J==null||J.dispose(),s.replaceChildren(),D}let Ye=i.subscribe(fe),ft=new h.ResizeObserver(fe);ft.observe(e);for(let D of[W,R,U])D&&ft.observe(D);return Object.freeze({input:Object.freeze(we),render(){h.cancelAnimationFrame(H),G=void 0,Ie()},destroy(){if(!M){M=!0,Ye(),ft.disconnect(),h.cancelAnimationFrame(H),h.cancelAnimationFrame(g);for(let D of Object.values(we))D.dispose();J==null||J.dispose(),s.replaceChildren()}}})}var kd={uniforms:`
uniform int u_compareMode, u_compareChannel, u_compareAxis;
uniform vec2 u_compareView;
uniform vec4 u_compareCurve;
uniform vec3 u_compareNegative, u_comparePositive;
vec3 comparisonLinear(vec3 value) {
  return mix(pow((value + .055) / 1.055, vec3(2.4)), value / 12.92, lessThanEqual(value, vec3(.04045)));
}
float comparisonLuma(vec3 color) { return dot(color, vec3(.2126, .7152, .0722)); }
float comparisonValue(vec4 color) {
  vec3 linear = comparisonLinear(color.rgb) * color.a;
  return u_compareChannel == 0 ? comparisonLuma(linear) : linear[u_compareChannel - 1];
}
`,source:`
    if (u_compareMode == 0) {
      float x = gl_FragCoord.x, split = u_size.x - u_compareView.x;
      if (x >= u_compareView.x && x < split) return vec4(.09, .12, .16, 1.0);
      vec4 src = x < u_compareView.x ? sourceFrom(vec2(x / u_compareView.x, uv.y))
        : sourceTo(vec2((x - split) / u_compareView.x, uv.y));
      return vec4(src.rgb * src.a, 1.0);
    }
    vec4 a = sourceFrom(uv), b = sourceTo(uv);
    if (u_compareMode == 1) {
      float at = u_compareAxis == 0 ? uv.x : 1.0 - uv.y;
      vec4 src = at < u_value ? a : b;
      return vec4(src.rgb * src.a, 1.0);
    }
    float delta = comparisonValue(b) - comparisonValue(a);
    float gray = comparisonLuma(a.rgb) * a.a * u_compareCurve.w;
    float amount = clamp((abs(delta) - u_compareCurve.y) * u_compareCurve.x, 0.0, 1.0) * u_compareCurve.z;
    vec3 ink = delta < 0.0 ? u_compareNegative : u_comparePositive;
    return vec4(mix(vec3(gray), ink, amount), 1.0);
  `},ar=["left","right"],Td=["side-by-side","swipe","difference"],Ed=["luminance","red","green","blue"];function Ad(e,t){if(!(e!=null&&e.world))throw new TypeError("Comparison renderer needs a world for each source");let i=typeof e.world=="function"?e.world(t):e.world,a=typeof e.frame=="function"?e.frame(t,i):e.frame;return{world:i,frame:{...a,time:t.time}}}function Jr(e,{toolkit:t,contextAttributes:i}={}){var T,b,v,w;let a=(T=t==null?void 0:t.KIT)==null?void 0:T.comparison;if(!a)throw new TypeError("Comparison rendering needs the Ink Studio toolkit");let r={},n;try{for(let F of ar)r[F]=Bi(e,{toolkit:t,contextAttributes:i});n=Do(e,{contextAttributes:i}),n.registerShader("comparison-view",kd)}catch(F){throw(b=r.left)==null||b.dispose(),(v=r.right)==null||v.dispose(),n==null||n.dispose(),F}let p={},c,m=!1,u=()=>{c=void 0};(w=e.addEventListener)==null||w.call(e,"webglcontextlost",u);function A(){if(m)throw new Error("The comparison renderer has been disposed")}function j(F,l,{width:_=e.width,height:C=e.height}={}){var k,B,O;A();let{mode:$}=a.settings(l),I=a.dimensions(_,C,$);if(!Number.isFinite((k=l==null?void 0:l.time)!=null?k:0))throw new TypeError("Comparison time must be finite");let y={...l,time:(B=l==null?void 0:l.time)!=null?B:0},E=(O=y.cameraSource)!=null?O:"left";if(!ar.includes(E))throw new TypeError("Comparison camera source must be left or right");let o=Object.fromEntries(ar.map(V=>[V,Ad(F==null?void 0:F[V],y)])),h=o[E],s=h.frame,d=or(h.world,y.camera?{...s,camera:{...s.camera,...y.camera},cameraSnapshot:void 0}:s,I.width,I.height);c=void 0;for(let V of ar){let Y=p[V];Y?(Y.width!==I.width||Y.height!==I.height)&&Y.resize(I.width,I.height):(Y=p[V]=n.createTarget(I.width,I.height),n.setSource(V,Y));let{world:f,frame:S}=o[V];r[V].render(f,{...S,cameraSnapshot:d,width:I.width,height:I.height,target:Y})}return c={width:I.width,height:I.height,camera:d},d}function z(F,{target:l,width:_=($=>($=l==null?void 0:l.width)!=null?$:e.width)(),height:C=(I=>(I=l==null?void 0:l.height)!=null?I:e.height)()}={}){var S;A();let{mode:y,divider:E,axis:o,difference:h}=a.settings(F),s=a.dimensions(_,C,y);if((c==null?void 0:c.width)!==s.width||(c==null?void 0:c.height)!==s.height)throw new RangeError("Capture both views at the current comparison dimensions first");let{channel:d,gain:k,deadband:B,opacity:O,context:V,negative:Y,positive:f}=h;return n.draw({shader:"comparison-view",from:"left",to:"right",value:E,phase:0,progress:0,time:(S=F==null?void 0:F.time)!=null?S:0},{target:l,width:_,height:C,uniforms:{u_compareMode:Td.indexOf(y),u_compareChannel:Ed.indexOf(d),u_compareAxis:+(o==="y"),u_compareView:[s.width,s.height],u_compareCurve:[k,B,O,V],u_compareNegative:a.color(Y),u_comparePositive:a.color(f)}}),c.camera}return Object.freeze({capture:j,present:z,render(F,l,_){var $,I,y,E,o,h;let C={..._,width:(y=(I=_==null?void 0:_.width)!=null?I:($=_==null?void 0:_.target)==null?void 0:$.width)!=null?y:e.width,height:(h=(o=_==null?void 0:_.height)!=null?o:(E=_==null?void 0:_.target)==null?void 0:E.height)!=null?h:e.height};return j(F,l,C),z(l,C)},dispose(){var F;if(!m){m=!0;for(let l of ar)r[l].dispose();n.dispose(),(F=e.removeEventListener)==null||F.call(e,"webglcontextlost",u),c=void 0}}})}var Sd=`
  :host{display:block;color:var(--ink-compare-text,#edf2f7);background:var(--ink-compare-background,#111925);
    font:var(--ink-compare-font,14px system-ui,sans-serif);color-scheme:dark}
  *{box-sizing:border-box}
  .shell{max-width:1500px;margin:auto;padding:28px 32px 32px}
  h1{margin:0 0 16px;font-size:clamp(24px,4vw,40px);line-height:1.05;letter-spacing:-.045em}
  :is(nav,footer){display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  nav{padding:10px;margin-bottom:12px;background:var(--ink-compare-control,#1c2a3b);border-radius:6px}
  :is(button,select){color:inherit;background:var(--ink-compare-background,#111925);font:inherit;min-height:30px;
    padding:0 9px;border:1px solid var(--ink-compare-border,#52657e);border-radius:4px}
  :is(input,button,select){accent-color:var(--ink-compare-accent,#ffc27e)}
  label.time{display:flex;align-items:center;gap:8px;flex:1;min-width:135px}
  .time input{flex:1}
  output{min-width:66px;text-align:right;font-variant-numeric:tabular-nums}
  .stage{position:relative;isolation:isolate;overflow:hidden;border:1px solid var(--ink-compare-border,#52657e);border-radius:7px}
  canvas{display:block;width:100%;height:var(--ink-compare-height,440px)}
  canvas[data-orbit]{cursor:grab;touch-action:none}
  canvas:focus-visible{outline:3px solid var(--ink-compare-accent,#ffc27e);outline-offset:-3px}
  .source{position:absolute;inset-block-start:11px;padding:5px 8px;border-radius:3px;pointer-events:none;
    color:var(--ink-compare-source-text,#f6f9ff);background:var(--ink-compare-source,#172232e8)}
  .left{inset-inline-start:11px}.right{inset-inline-end:11px}
  .stage[data-mode=side-by-side] .right{inset-inline-start:calc(50% + 11px);inset-inline-end:auto}
  .divider{position:absolute;touch-action:none;z-index:1;color:var(--ink-compare-divider,#fff)}
  .stage[data-axis=x] .divider{top:0;bottom:0;width:24px;transform:translateX(-50%);cursor:ew-resize}
  .stage[data-axis=y] .divider{left:0;right:0;height:24px;transform:translateY(-50%);cursor:ns-resize}
  .divider::before,.divider::after{content:"";position:absolute;background:currentColor}
  .divider::before{top:0;bottom:0;left:calc(50% - 1px);width:2px}
  .stage[data-axis=y] .divider::before{left:0;right:0;top:calc(50% - 1px);height:2px;width:auto}
  .divider::after{width:18px;height:18px;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);
    border:5px double var(--ink-compare-background,#111925)}
  .divider:focus-visible{outline:3px solid var(--ink-compare-accent,#ffc27e);outline-offset:-3px}
  footer{justify-content:center;padding-top:11px;color:var(--ink-compare-muted,#afc0d3);font-size:12px}
  footer i{display:inline-block;width:11px;height:11px;margin-right:4px;vertical-align:-1px;border-radius:2px}
  [hidden]{display:none!important}
  @media(max-width:640px){.shell{padding:16px 12px}canvas{height:var(--ink-compare-height,340px)}}
`,Rl=new WeakMap,Rd={title:"Comparison",left:"Reference",right:"Comparison",play:"Play",pause:"Pause",time:"Time",mode:"View",axis:"Swipe axis",side:"Side by side",swipe:"Swipe",difference:"Signed difference",x:"Horizontal",y:"Vertical",negative:"Decrease",positive:"Increase",divider:"Swipe divider"},ea=(e,t,i)=>Math.min(i,Math.max(t,e)),Dl=["mouse:Left","pen:Tip","touch:Contact"],zl=(e,t)=>({input:e,scale:t}),zd={camera:{orbit:Dl,yaw:[zl("key:ArrowLeft",-1),"key:ArrowRight",{input:"pad:RightX",deadZone:.2}],pitch:["key:ArrowUp",zl("key:ArrowDown",-1),{input:"pad:RightY",deadZone:.2,scale:-1}]}},Fl=e=>e.map(t=>({input:t,modifiers:["Shift"]})),Cl=["key:ArrowLeft","key:ArrowUp"],Ml=["key:ArrowRight","key:ArrowDown"],Fd={divider:{drag:Dl,previous:[...Cl,"pad:DPadLeft","pad:DPadUp"],next:[...Ml,"pad:DPadRight","pad:DPadDown"],"previous-fast":Fl(Cl),"next-fast":Fl(Ml),start:["key:Home"],end:["key:End"]}};function Pl(e,{toolkit:t,session:i,left:a,right:r,labels:n={},controls:p={},stylesheet:c="",defaultStyles:m=!0,input:u={}}={}){var Fe,Le;let A=(Fe=t==null?void 0:t.KIT)==null?void 0:Fe.comparison;if(!A||!(i!=null&&i.subscribe)||!(a!=null&&a.world)||!(r!=null&&r.world)||typeof c!="string"||typeof m!="boolean")throw new TypeError("Comparison view needs a toolkit, session, two worlds and valid stylesheet options");let j={...Rd,...n},z=e.ownerDocument,T=z.defaultView,b=(Le=Rl.get(e))!=null?Le:e.attachShadow({mode:"open"});if(b.childElementCount)throw new Error("This host already has a mounted comparison");Rl.set(e,b),b.innerHTML=`<div class="shell" part="shell">
    <h1 part="title" data-label="title"></h1>
    <nav part="toolbar">
      <button type="button" data-control="play" part="playback"></button>
      <label class="time" data-control="time" part="timeline">
        <span data-label="time"></span><input type="range" step="any" part="scrubber">
        <output part="time-value"></output></label>
      <label data-control="mode" part="mode-control"><span data-label="mode"></span>
        <select part="mode"><option value="side-by-side" data-label="side"></option>
          <option value="swipe" data-label="swipe"></option><option value="difference" data-label="difference"></option></select></label>
      <label data-control="axis" part="axis-control"><span data-label="axis"></span>
        <select part="axis"><option value="x" data-label="x"></option><option value="y" data-label="y"></option></select></label>
    </nav>
    <div class="stage" part="stage">
      <canvas part="canvas"></canvas><span class="source left" data-label="left" part="source left-label"></span>
      <span class="source right" data-label="right" part="source right-label"></span>
      <div class="divider" part="divider" role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100"></div>
    </div>
    <footer part="legend"><span><i part="negative-swatch"></i><span data-label="negative"></span></span>
      <span><i part="positive-swatch"></i><span data-label="positive"></span></span></footer>
  </div>`;function v(te,H){let g=z.createElement("style");g.textContent=te,H?b.prepend(g):b.append(g)}m&&v(Sd,!0),c&&v(c,!1);let w=te=>b.querySelector(te),F=te=>w('[part="'+te+'"]');for(let te of b.querySelectorAll("[data-label]"))te.textContent=j[te.dataset.label];let l=F("stage"),_=F("canvas"),C=F("divider"),$=F("toolbar"),I=F("playback"),y=F("scrubber"),E=F("mode"),o=F("axis"),h=F("legend");F("title").hidden=!j.title,C.setAttribute("aria-label",j.divider),_.setAttribute("aria-label",j.left+" / "+j.right),p.camera!==!1&&(_.dataset.orbit="");let s;try{s=Jr(_,{toolkit:t})}catch(te){throw b.replaceChildren(),te}let d,k,B=0,O=!1,V=!1,Y,f,S,q,P,W=!0;function R(){!B&&!O&&!V&&(B=T.requestAnimationFrame(ie))}function U(){W=!0,R()}function J(te){if(O||V)return;let{time:H,range:g,playing:M,mode:G,axis:X,divider:ae,difference:Q}=te;l.dataset.mode=G,l.dataset.axis=X,C.hidden=G!=="swipe"||p.divider===!1,C.style.left=X==="x"?100*ae+"%":"",C.style.top=X==="y"?100*ae+"%":"",C.setAttribute("aria-valuenow",String(Math.round(ae*100))),C.setAttribute("aria-orientation",X==="x"?"horizontal":"vertical"),E.value=G,o.value=X,y.min=g[0],y.max=g[1],y.value=H,F("time-value").textContent=H.toFixed(2)+" s",I.textContent=M?j.pause:j.play,$.hidden=!0;for(let we of $.querySelectorAll("[data-control]"))we.hidden=p[we.dataset.control]===!1||we.dataset.control==="axis"&&G!=="swipe",we.hidden||($.hidden=!1);w(".left").hidden=p.sourceLabels===!1||G==="difference",w(".right").hidden=w(".left").hidden,h.hidden=p.legend===!1||G!=="difference",F("negative-swatch").style.backgroundColor=Q.negative,F("positive-swatch").style.backgroundColor=Q.positive;let pe=Math.max(G==="side-by-side"?2:1,_.clientWidth),Ae=Math.max(1,_.clientHeight),Pe={width:pe,height:Ae},Te=A.dimensions(pe,Ae,G);(!d||d.width!==Te.width||d.height!==Te.height||d.time!==H||d.camera!==te.camera||d.cameraSource!==te.cameraSource)&&(k=s.capture({left:a,right:r},te,Pe),d={...Te,time:H,camera:te.camera,cameraSource:te.cameraSource}),s.present(te,Pe)}function ie(te){var ae,Q;if(B=0,O||V)return;let H=q==null?void 0:q.poll(),g=P==null?void 0:P.poll(),M=(H==null?void 0:H.focused)||(g==null?void 0:g.focused),G=f===void 0?0:ea((te-f)/1e3,0,.05);f=M?te:void 0,H!=null&&H.focused&&k&&G&&(H.values.yaw||H.values.pitch)&&K(k.yaw+((ae=H.values.yaw)!=null?ae:0)*G*1.8,k.pitch+((Q=H.values.pitch)!=null?Q:0)*G*1.8);let X=i.snapshot();X.playing&&Y!==void 0&&(X=i.advance(Math.max(0,te-Y)/1e3)),Y=X.playing?te:void 0,(W||X.playing)&&(W=!1,J(X)),(X.playing||M)&&R()}I.onclick=()=>i.snapshot().playing?i.pause():i.play(),E.onchange=()=>i.update({mode:E.value}),o.onchange=()=>i.update({axis:o.value}),y.oninput=()=>i.seek(Number(y.value));function N(te){let H=l.getBoundingClientRect(),M=i.snapshot().axis==="x"?(te.clientX-H.left)/H.width:(te.clientY-H.top)/H.height;i.update({divider:ea(M,0,1)})}function K(te,H){i.update({camera:{...i.snapshot().camera,yaw:te,pitch:ea(H,-1.55,1.55),pose:null}})}function Z(te,H,g,M,G){return Zi(te,{contexts:H,...g,toolkit:t,onFocus(X){var ae;U(),(ae=g==null?void 0:g.onFocus)==null||ae.call(g,X)},onAction(X){var ae;M==null||M(X),(ae=g==null?void 0:g.onAction)==null||ae.call(g,X)},onPointer(X){var ae;G==null||G(X),(ae=g==null?void 0:g.onPointer)==null||ae.call(g,X)}})}try{u!==!1&&(u==null?void 0:u.divider)!==!1&&p.divider!==!1?P=Z(C,Fd,u==null?void 0:u.divider,te=>{if(C.hidden||!["press","repeat"].includes(te.phase))return;let{divider:H}=i.snapshot(),g={start:0,end:1,previous:H-.01,next:H+.01,"previous-fast":H-.1,"next-fast":H+.1}[te.action];Number.isFinite(g)&&i.update({divider:ea(g,0,1)})},te=>{!C.hidden&&te.action==="drag"&&te.phase!=="cancel"&&N(te.event)}):C.tabIndex=-1,u!==!1&&(u==null?void 0:u.canvas)!==!1&&p.camera!==!1&&(q=Z(_,zd,u==null?void 0:u.canvas,void 0,te=>{te.action==="orbit"&&(te.phase==="start"&&k&&!S&&(S={id:te.id,point:te.point,yaw:k.yaw,pitch:k.pitch}),(S==null?void 0:S.id)===te.id&&(te.phase==="move"?K(S.yaw-(te.point[0]-S.point[0])*.008,S.pitch+(te.point[1]-S.point[1])*.008):(te.phase==="end"||te.phase==="cancel")&&(S=void 0)))}))}catch(te){throw P==null||P.dispose(),q==null||q.dispose(),s.dispose(),b.replaceChildren(),T.cancelAnimationFrame(B),te}let ye=()=>{V=!0,Y=f=void 0,d=void 0,T.cancelAnimationFrame(B),B=0},ve=()=>{V=!1,U()};_.addEventListener("webglcontextlost",ye),_.addEventListener("webglcontextrestored",ve);let ze=new T.ResizeObserver(U);ze.observe(_);let me=i.subscribe(U);return Object.freeze({input:Object.freeze({canvas:q,divider:P}),render(){T.cancelAnimationFrame(B),B=0,d=void 0;let te=i.snapshot();J(te),(te.playing||q!=null&&q.focused||P!=null&&P.focused)&&R()},destroy(){O||(O=!0,me(),ze.disconnect(),q==null||q.dispose(),P==null||P.dispose(),T.cancelAnimationFrame(B),_.removeEventListener("webglcontextlost",ye),_.removeEventListener("webglcontextrestored",ve),s.dispose(),b.replaceChildren())}})}var Ll=new WeakMap,Cd={title:"Checkpoint branches",play:"Play",pause:"Pause",step:"Step",branch:"Active branch",tick:"Tick",playing:"Playing",paused:"Paused",mark:"Pin checkpoint",markName:"Checkpoint ID",fork:"Fork branch",forkName:"Branch ID",origin:"Starting point",current:"Active branch head",inputs:"Simulation inputs",apply:"Queue inputs",actions:"Actions"},Md=`
  :host{display:block;color:var(--ink-branch-text,#eaf0f5);background:var(--ink-branch-background,#18232e);
    font:var(--ink-branch-font,14px system-ui,sans-serif);color-scheme:var(--ink-branch-color-scheme,dark)}
  *{box-sizing:border-box}
  [hidden]{display:none!important}
  .shell{padding:var(--ink-branch-padding,16px);display:grid;gap:12px}
  h2{margin:0;font-size:18px}
  :is(.bar,form,.actions,label){display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  label{font-size:12px}
  .bar,form,.actions{display:flex;gap:10px;align-items:end;border:1px solid var(--ink-branch-border,#4e6172);
    border-radius:7px;padding:9px;background:var(--ink-branch-panel,#202e3b)}
  :is(button,input,select){font:inherit;color:inherit;background:var(--ink-branch-background,#18232e);
    border:1px solid var(--ink-branch-border,#4e6172);border-radius:4px;min-height:32px;padding:4px 8px}
  :is(button,input,select):focus-visible{outline:2px solid var(--ink-branch-accent,#e9b77b);outline-offset:2px}
  button{cursor:pointer}input[type=number]{width:88px}input[required]{max-width:160px}
  label span{white-space:nowrap}output{margin-inline-start:auto;font-variant-numeric:tabular-nums}
  [role=alert]{margin:0;color:var(--ink-branch-error,#ffbcab)}
`;function Il(e,{session:t,inputs:i=[],actions:a=[],labels:r={},controls:n={},clock:p=!0,stylesheet:c="",defaultStyles:m=!0}={}){var P,W;if(!(t!=null&&t.subscribe)||!(t!=null&&t.checkpoint)||!Array.isArray(i)||!Array.isArray(a)||typeof p!="boolean"||typeof m!="boolean"||typeof c!="string")throw new TypeError("Branch controls need a branch session and valid mount settings");let u=t.checkpoint().manual,A=i.map(R=>{if(!R||!Object.hasOwn(u,R.port))throw new Error("Unknown mounted input "+(R==null?void 0:R.port));let U=u[R.port];return{spec:R,type:typeof U}});if(a.some(R=>!R||typeof R.action!="string"))throw new TypeError("Invalid mounted simulation action");let j={...Cd,...r},z=e.ownerDocument,T=z.defaultView,b=(P=Ll.get(e))!=null?P:e.attachShadow({mode:"open"});if(b.childElementCount)throw new Error("This host already has mounted branch controls");if(Ll.set(e,b),b.innerHTML=`<div class="shell" part="shell">
    <h2 part="title" data-label="title"></h2>
    <div class="bar" part="transport">
      <label part="branch-control"><span data-label="branch"></span><select part="branch"></select></label>
      <button type="button" part="playback"></button><button type="button" part="step" data-label="step"></button>
      <output part="status" role="timer" aria-live="off"></output>
    </div>
    <form part="mark-controls">
      <label><span data-label="markName"></span><input name="id" part="mark-name" required maxlength="96"></label>
      <button part="mark" data-label="mark"></button>
    </form>
    <form part="fork-controls">
      <label><span data-label="origin"></span><select name="origin" part="origin"></select></label>
      <label><span data-label="forkName"></span><input name="id" part="fork-name" required maxlength="96"></label>
      <button part="fork" data-label="fork"></button>
    </form>
    <form part="input-controls" aria-label=""><button part="apply" data-label="apply"></button></form>
    <div class="actions" part="action-controls" role="group" aria-label=""></div>
    <p part="error" role="alert" hidden></p><slot></slot>
  </div>`,m||c){let R=z.createElement("style");R.textContent=(m?Md:"")+c,b.prepend(R)}let v=R=>b.querySelector('[part="'+R+'"]');for(let R of b.querySelectorAll("[data-label]"))R.textContent=j[R.dataset.label];let w=v("playback"),F=v("step"),l=v("branch"),_=v("origin"),C=v("error"),$=v("input-controls"),I=v("action-controls"),y=v("mark-controls"),E=v("fork-controls");v("title").hidden=!j.title,v("branch-control").hidden=n.branch===!1,w.hidden=F.hidden=n.playback===!1,y.hidden=n.mark===!1,E.hidden=n.fork===!1,$.hidden=n.inputs===!1||!i.length,I.hidden=n.actions===!1||!a.length,$.setAttribute("aria-label",j.inputs),I.setAttribute("aria-label",j.actions);let o=0,h,s,d,k;function B(R){try{return R(),C.hidden=!0,C.textContent="",!0}catch(U){return C.hidden=!1,C.textContent=U.message,!1}}function O(R){t.pause(),t.queue(R)}let V=A.map(({spec:R,type:U})=>{var K,Z;let J=z.createElement("label"),ie=z.createElement("span"),N=z.createElement("input");return ie.textContent=(K=R.label)!=null?K:R.port,N.setAttribute("part","input"),N.type=U==="boolean"?"checkbox":U==="number"?"number":"text",U==="number"&&(N.required=!0,N.step=(Z=R.step)!=null?Z:"any",R.min!==void 0&&(N.min=R.min),R.max!==void 0&&(N.max=R.max)),J.append(ie,N),$.insertBefore(J,v("apply")),{port:R.port,input:N,type:U}});for(let R of a){let U=z.createElement("button");U.type="button",U.textContent=(W=R.label)!=null?W:R.action,U.setAttribute("part","action"),U.onclick=()=>B(()=>{var J;return O({actions:[{action:R.action,args:(J=R.args)!=null?J:{}}]})}),I.append(U)}function Y(R,U){let J=R.value;R.replaceChildren(...U.map(([ie,N])=>{let K=z.createElement("option");return K.value=ie,K.textContent=N,K})),U.some(([ie])=>ie===J)&&(R.value=J)}function f(R){if(w.textContent=R.playing?j.pause:j.play,v("status").textContent=j.tick+" "+R.tick+" \xB7 "+(R.playing?j.playing:j.paused),(!d||d!==R.branches.length)&&(Y(l,R.branches.map(U=>[U.id,U.label])),d=R.branches.length),l.value=R.active,k!==R.marks.length&&(Y(_,[["",j.current],...R.marks.map(U=>[U.id,U.id+" \xB7 "+j.tick.toLowerCase()+" "+U.tick])]),k=R.marks.length),V.length){let U=t.checkpoint(),J=s!==R.active;for(let ie of V){let N=U.pending.findLast(Z=>Z.tick===R.tick+1&&Z.action==="world/input"&&Z.args.port===ie.port),K=N?N.args.value:U.manual[ie.port];(J||b.activeElement!==ie.input)&&(ie.type==="boolean"?ie.input.checked=K:ie.input.value=ie.type==="number"?String(K):JSON.stringify(K))}s=R.active}R.playing&&p&&!o&&(o=T.requestAnimationFrame(S)),R.playing||(T.cancelAnimationFrame(o),o=0,h=void 0)}function S(R){if(o=0,!t.status().playing)return;let U=h;h=R,U!==void 0&&B(()=>t.update(Math.max(0,(R-U)/1e3))),t.status().playing&&!o&&(o=T.requestAnimationFrame(S))}w.onclick=()=>B(()=>t.status().playing?t.pause():t.play()),F.onclick=()=>B(()=>t.step()),l.onchange=()=>B(()=>t.select(l.value)),y.onsubmit=R=>{R.preventDefault(),B(()=>{t.pause(),t.mark(v("mark-name").value.trim())})&&y.reset()},E.onsubmit=R=>{R.preventDefault(),B(()=>t.fork(v("fork-name").value.trim(),_.value?{mark:_.value}:{}))&&(v("fork-name").value="")},$.onsubmit=R=>{R.preventDefault(),B(()=>O({inputs:Object.fromEntries(V.map(({port:U,input:J,type:ie})=>[U,ie==="number"?J.valueAsNumber:ie==="boolean"?J.checked:JSON.parse(J.value)]))}))};let q=t.subscribe(f);return Object.freeze({destroy(){q(),T.cancelAnimationFrame(o),p&&t.pause(),b.replaceChildren()}})}function Bl(e,{toolkit:t,contextAttributes:i,...a}={}){var w,F;let r=(w=t==null?void 0:t.KIT)==null?void 0:w.cameraAtlas;if(!r)throw new TypeError("Camera atlases need the Ink Studio toolkit");let n=r.prepare(a),p=Bi(e,{toolkit:t,contextAttributes:i,reuseOrder:!1}),c=e.getContext("webgl2"),{width:m,height:u}=n,A,j,z=!1;function T(){if(z)throw new Error("The camera atlas has been disposed");if(c.isContextLost())throw new Error("The camera atlas WebGL context is lost")}function b(l){let _=c.getParameter(c.READ_FRAMEBUFFER_BINDING),C=c.getParameter(c.DRAW_FRAMEBUFFER_BINDING);try{return l()}finally{c.bindFramebuffer(c.READ_FRAMEBUFFER,_),c.bindFramebuffer(c.DRAW_FRAMEBUFFER,C)}}let v=()=>j.reset();try{A=Do(c);let l=A.createTarget(m,u),_=A.createTarget(1,1),C=new Float32Array(4);return j=r.create(n,{clear(){T();let $=c.isEnabled(c.SCISSOR_TEST),I=c.getParameter(c.COLOR_WRITEMASK);try{b(()=>{c.bindFramebuffer(c.DRAW_FRAMEBUFFER,l.framebuffer),c.disable(c.SCISSOR_TEST),c.colorMask(!0,!0,!0,!0),c.clearBufferfv(c.COLOR,0,C)})}finally{c.colorMask(...I),$&&c.enable(c.SCISSOR_TEST)}},capture($,I,y){T(),b(()=>{let{x:E,y:o,width:h,height:s}=y;(_.width!==h||_.height!==s)&&_.resize(h,s),p.render($,{...I,target:_});let d=_.framebuffer,k=l.framebuffer;c.bindFramebuffer(c.READ_FRAMEBUFFER,d),c.bindFramebuffer(c.DRAW_FRAMEBUFFER,k),c.disable(c.SCISSOR_TEST),c.blitFramebuffer(0,0,h,s,E,u-o-s,E+h,u-o,c.COLOR_BUFFER_BIT,c.NEAREST)})},read({x:$,y:I,width:y,height:E}){T();let o=new Uint8Array(y*E*4);b(()=>{c.bindFramebuffer(c.READ_FRAMEBUFFER,l.framebuffer);let d=c.getParameter(c.PIXEL_PACK_BUFFER_BINDING),k=[c.PACK_ALIGNMENT,c.PACK_ROW_LENGTH,c.PACK_SKIP_PIXELS,c.PACK_SKIP_ROWS],B=k.map(O=>c.getParameter(O));c.bindBuffer(c.PIXEL_PACK_BUFFER,null);try{k.forEach((O,V)=>c.pixelStorei(O,V===0?4:0)),c.readPixels($,u-I-E,y,E,c.RGBA,c.UNSIGNED_BYTE,o)}finally{k.forEach((O,V)=>c.pixelStorei(O,B[V])),c.bindBuffer(c.PIXEL_PACK_BUFFER,d)}});let h=new Uint8Array(o.length),s=y*4;for(let d=0;d<E;d++){let k=(E-1-d)*s;h.set(o.subarray(k,k+s),d*s)}return{w:y,h:E,rgba:h}},texture($,I){return $!==c?null:(T(),{texture:b(()=>l.texture),region:[I.x,I.y,I.width,I.height]})},dispose(){var $;z=!0,($=e.removeEventListener)==null||$.call(e,"webglcontextrestored",v),p.dispose(),A.dispose()}}),(F=e.addEventListener)==null||F.call(e,"webglcontextrestored",v),Object.freeze({...j,get texture(){return T(),b(()=>l.texture)}})}catch(l){throw p.dispose(),A==null||A.dispose(),l}}var Ol=new WeakMap,Dd={title:"Causal inspection",selection:"Inspect",current:"Current condition",evidence:"Recorded evidence",tick:"Tick",choose:"Select an object or region",disabled:"Causal recording is disabled",unrecorded:"No retained evidence for this selection",complete:"Recorded links available",partial:"Some ancestors are unavailable",parents:"Recorded links",state:"State",event:"Event",command:"Action",reading:"Reading",decision:"Decision",input:"Input",output:"Output",transfer:"Transfer"},Pd=`
  :host{display:block;background:var(--ink-cause-background,#17232b);color:var(--ink-cause-text,#eff2f4);
    font:var(--ink-cause-font,14px system-ui,sans-serif);color-scheme:var(--ink-cause-color-scheme,dark)}
  *{box-sizing:border-box}
  [hidden]{display:none!important}
  .shell{padding:var(--ink-cause-padding,14px);display:grid;gap:14px;
    grid-template-columns:minmax(0,1fr) minmax(280px,var(--ink-cause-width,390px))}
  .preview{min-width:0}.panel{min-width:0;display:grid;gap:12px;align-content:start}
  h2,h3,p,dl,ol{margin:0}h2{font-size:18px}h3{font-size:14px}
  header{display:flex;gap:12px;justify-content:space-between;align-items:center;flex-wrap:wrap}
  select,button{font:inherit;color:inherit;background:var(--ink-cause-background,#17232b);
    border:1px solid var(--ink-cause-border,#52646e);border-radius:4px;padding:4px 7px}
  :is(select,button,summary):focus-visible{outline:2px solid var(--ink-cause-accent,#9bd6c1);outline-offset:2px}
  label{display:flex;gap:7px;align-items:center}button,summary{cursor:pointer}summary strong{font-weight:650}
  .muted{color:var(--ink-cause-muted,#b3c2ca);font-size:12px}
  dl{display:grid;gap:6px;margin-top:6px}dl div{display:flex;gap:8px;justify-content:space-between}
  dd{margin:0;overflow-wrap:anywhere;text-align:end}
  ol{list-style:none;padding:0;display:grid;gap:6px;margin-top:7px;max-height:var(--ink-cause-height,430px);overflow:auto}
  li{border:1px solid var(--ink-cause-border,#52646e);border-radius:5px;padding:7px 9px;overflow-wrap:anywhere}
  li[data-root=true]{border-inline-start:3px solid var(--ink-cause-accent,#9bd6c1)}
  summary>span{float:inline-end;margin-inline-start:6px}
  li p{margin-top:6px}li button{font-size:12px;margin:5px 5px 0 0}
  @media(max-width:710px){.shell{grid-template-columns:minmax(0,1fr)}}
`,rn=e=>String(e).replaceAll("-"," ");function xo(e){let t=typeof e=="string"?e:JSON.stringify(e);return(t==null?void 0:t.length)>150?t.slice(0,147)+"\u2026":t!=null?t:""}function Nl({kind:e,sample:t}){var r,n;if(t.status!=="ok")return(r=t.reason)!=null?r:t.status;let i=e==="account"?t.value.balance:t.value,a=e==="account"?t.value.units:(n=t.provenance)==null?void 0:n.units;return xo(i)+(a?" "+a:"")}function Ld(e){let{data:t,kind:i,type:a}=e;return a==="state"&&i==="account-balance"?t.account+" \xB7 "+xo(t.previous)+" \u2192 "+xo(t.balance)+" "+t.units:a==="state"&&i==="balance-before-transfer"?t.account+" \xB7 "+xo(t.balance)+" "+t.units:i==="transfer"&&typeof t.from=="string"&&typeof t.to=="string"?t.from+" \u2192 "+t.to+" \xB7 "+xo(t.applied)+" "+t.units+" \xB7 "+t.status:a==="command"?t.action+(t.commandId?" \xB7 "+t.commandId:""):a==="reading"?t.field+" \xB7 "+Nl({sample:t.result}):e.port?e.port+" \xB7 "+xo(t.value):e.system+" \xB7 "+xo(t)}function ql(e,{query:t,targets:i=[],selection:a,options:r={},labels:n={},controls:p={},stylesheet:c="",defaultStyles:m=!0,formatCondition:u=Nl,formatEvidence:A=Ld}={}){var y,E;if(typeof t!="function"&&typeof(t==null?void 0:t.trace)!="function"||!Array.isArray(i)||typeof c!="string"||typeof m!="boolean"||typeof u!="function"||typeof A!="function")throw new TypeError("Invalid causal inspection view settings");let j=new Map;for(let o of i){if(!o||typeof o.id!="string"||!o.id||!o.at||j.has(o.id))throw new TypeError("Causal inspection targets need distinct IDs and selectors");j.set(o.id,o)}let z=e.ownerDocument,T={...Dd,...n},b=(y=Ol.get(e))!=null?y:e.attachShadow({mode:"open"});if(b.childElementCount)throw new Error("This host already has a causal inspection");if(Ol.set(e,b),b.innerHTML=`<div class="shell" part="shell">
    <div class="preview" part="preview"><slot></slot></div>
    <aside class="panel" part="panel">
      <header><h2 part="title"></h2><label part="selection-control"><span></span><select part="selection"></select></label></header>
      <div class="muted" part="coverage" role="status"></div>
      <section part="current"><h3></h3><dl part="conditions"></dl></section>
      <section part="evidence"><h3></h3><ol part="nodes"></ol></section>
    </aside></div>`,m||c){let o=z.createElement("style");o.textContent=(m?Pd:"")+c,b.prepend(o)}let v=o=>b.querySelector('[part="'+o+'"]'),w=v("selection");v("title").textContent=T.title,v("title").hidden=!T.title,v("selection-control").hidden=p.selection===!1||!i.length,v("selection-control").querySelector("span").textContent=T.selection,v("current").querySelector("h3").textContent=T.current,v("evidence").querySelector("h3").textContent=T.evidence;for(let[o,h]of[["",T.choose],...i.map(s=>{var d;return[s.id,(d=s.label)!=null?d:s.id]})]){let s=z.createElement("option");s.value=o,s.textContent=h,w.append(s)}let F=a!=null?a:(E=i[0])==null?void 0:E.id,l,_=!1;function C(o){var f,S,q,P,W;let h=v("nodes"),s=v("conditions"),d=v("coverage");if(h.replaceChildren(),s.replaceChildren(),v("current").hidden=p.current===!1||!(o!=null&&o.conditions.length),v("evidence").hidden=p.evidence===!1||!(o!=null&&o.nodes.length),d.textContent=o?T.tick+" "+o.tick+" \xB7 "+((f=T[o.status])!=null?f:o.status)+(o.gaps.length?" ("+o.gaps.length+")":""):T.choose,!o)return;for(let R of o.conditions){let U=z.createElement("div"),J=z.createElement("dt"),ie=z.createElement("dd");J.textContent=R.name,ie.textContent=u(R),U.append(J,ie),s.append(U)}let k=new Map,B=new Map,O=new Map(o.roots.map(R=>[R.id,R.match])),V=new Map(o.nodes.map(R=>[R.id,R])),Y=new Map(o.gaps.map(R=>[R.id,R.reason]));for(let{effect:R,cause:U}of o.edges)B.has(R)||B.set(R,[]),B.get(R).push(U);for(let R of o.nodes){let U=z.createElement("li"),J=z.createElement("details"),ie=z.createElement("summary"),N=z.createElement("strong"),K=z.createElement("span"),Z=z.createElement("p");if(U.setAttribute("part","node"),U.dataset.root=String(O.has(R.id)),U.dataset.type=R.kind==="transfer"?"transfer":R.type,N.textContent=rn(R.kind),K.className="muted",K.textContent=((S=T[U.dataset.type])!=null?S:U.dataset.type)+" \xB7 "+T.tick+" "+R.tick,ie.append(N,K),Z.textContent=A(R),J.append(ie,Z),R.basis){let ve=z.createElement("p");ve.className="muted",ve.setAttribute("part","basis"),ve.textContent=(q=T[R.basis])!=null?q:rn(R.basis),J.append(ve)}J.open=O.has(R.id);let ye=(P=B.get(R.id))!=null?P:[];if(ye.length){let ve=z.createElement("p");ve.className="muted",ve.textContent=T.parents,J.append(ve);for(let ze of ye){let me=z.createElement("button");me.type="button";let Fe=V.get(ze);me.textContent=Fe?rn(Fe.kind)+" \xB7 "+T.tick+" "+Fe.tick:ze,me.title=Fe?ze:(W=Y.get(ze))!=null?W:ze,me.onclick=()=>{let Le=k.get(ze);Le.open=!0,Le.querySelector("summary").focus()},me.disabled=!Fe,J.append(me)}}k.set(R.id,J),U.append(J),h.append(U)}}function $(){var s,d;if(_)return l;let o=typeof F=="string"?j.get(F):null,h=(s=o==null?void 0:o.at)!=null?s:F;return w.value=(d=o==null?void 0:o.id)!=null?d:"",l=h?(typeof t=="function"?t():t).trace("world/causal-inspection",h,{...r,...o==null?void 0:o.options}).value:null,C(l),l}function I(o){if(typeof o=="string"&&!j.has(o))throw new Error("Unknown causal inspection target "+o);return F=o,$()}w.onchange=()=>I(w.value||null);try{$()}catch(o){throw b.replaceChildren(),o}return Object.freeze({select:I,refresh:$,report:()=>l,destroy(){_=!0,b.replaceChildren()}})}async function jl(e){let t=Object.create(null);for(let i of e){let{default:a}=await import(i);if(!a||typeof a!="object"||Array.isArray(a))throw Error("A simulation worker module must default-export a system factory table");for(let[r,n]of Object.entries(a)){if(!/^[A-Za-z0-9_][A-Za-z0-9_.-]{0,95}$/.test(r)||["__proto__","constructor","prototype"].includes(r)||typeof n!="function"||Object.hasOwn(t,r))throw Error("Invalid or duplicate simulation worker factory "+r);t[r]=n}}return Object.freeze(t)}var Id={};async function Ul(e,{bundle:t,modules:i=[],timeoutMs:a=3e4}={}){if(!Number.isInteger(e)||e<1||e>32)throw Error("Worker count must be 1\u201332");if(!Number.isInteger(a)||a<1||a>6e4)throw Error("Simulation worker timeout must be 1\u201360000 ms");if(typeof Worker!="function")throw Error("Browser simulation workers need the Worker API");let r=w=>w instanceof URL||typeof w=="string"&&w.length>0;if(!r(t)||!Array.isArray(i)||!i.every(r))throw Error("Browser simulation workers need an explicit module bundle and module URLs");let n=w=>new URL(w,globalThis.location.href).href,p=n(t),c=i.map(n),m=await jl(c),u=[],A=!1,j=Promise.resolve();function z(w){if(!A){A=!0;for(let F of u)F.close(w);u.length=0}}function T(){let w=new Worker(new URL("./simulation-worker.mjs",Id.url),{type:"module"}),F,l;return w.addEventListener("message",({data:_})=>F==null?void 0:F(null,_)),w.addEventListener("error",_=>z(Error(_.message||"Simulation worker failed to load"))),w.addEventListener("messageerror",()=>z(Error("Invalid simulation worker message"))),{send(_,C){return A?Promise.reject(Error("Simulation worker pool is closed")):new Promise(($,I)=>{let y=setTimeout(()=>z(Error("Simulation worker timed out")),a);F=(E,o)=>{F=void 0,clearTimeout(y),E?I(E):$(o)};try{w.postMessage({...!l&&{bundle:p,modules:c},...l!==_&&{world:_},jobs:C}),l=_}catch(E){z(E)}})},close(_){F==null||F(_),w.terminate()}}}async function b(w,F){if(A)throw Error("Simulation worker pool is closed");let l=Math.min(F.length,e),_=Array.from({length:l},()=>[]);for(let C=0;C<F.length;C++)_[C%l].push(F[C]);try{let C=_.map((y,E)=>{var o;return(o=u[E])!=null?o:u[E]=T()}),$=await Promise.all(C.map((y,E)=>y.send(w,_[E]))),I=new Map;for(let[y,E]of $.entries()){if(E!=null&&E.error)throw Error(E.error.message,{cause:E.error});if(!Array.isArray(E==null?void 0:E.results)||E.results.length!==_[y].length)throw Error("Invalid simulation worker reply");for(let[o,[h,s]]of E.results.entries()){if(h!==_[y][o].name||!s)throw Error("Invalid simulation worker job result");I.set(h,s)}}return{workers:l,results:I}}catch(C){throw z(C),C}}function v(w,F){let l=j.then(()=>b(w,F));return j=l.catch(()=>{}),l}return Object.freeze({size:e,async:!0,implementations:m,solve:v,close:()=>z(Error("Simulation worker pool is closed"))})}return Tf(Bd);})();
