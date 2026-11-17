const d={palette:!0,outline:!0,dither:!0},l="#2b2540",u=8,p="varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",c=`
precision highp float;
uniform sampler2D tColor; uniform sampler2D tDepth;
uniform vec2 texel; uniform vec2 res; uniform float thr; uniform float levels;
uniform float pal; uniform float dith; uniform float outl; uniform vec3 ink;
varying vec2 vUv;
float bayer4(vec2 p){
  vec2 q = mod(floor(p), 4.0);
  float x0 = mod(q.x, 2.0), x1 = floor(q.x / 2.0), y0 = mod(q.y, 2.0), y1 = floor(q.y / 2.0);
  return (8.0 * abs(x0 - y0) + 4.0 * y0 + 2.0 * abs(x1 - y1) + y1 + 0.5) / 16.0 - 0.5;
}
void main(){
  vec3 c = pow(texture2D(tColor, vUv).rgb, vec3(1.0 / 2.2)); // the target is sRGB: sampling gives linear values, so encode them back for the screen
  if (pal > 0.5) {
    float d = dith > 0.5 ? bayer4(vUv * res) * 0.5 : 0.0;
    c = clamp(floor(c * (levels - 1.0) + 0.5 + d) / (levels - 1.0), 0.0, 1.0);
  }
  if (outl > 0.5) {
    float d0 = texture2D(tDepth, vUv).r;
    float dl = texture2D(tDepth, vUv + vec2(-texel.x, 0.0)).r;
    float dr = texture2D(tDepth, vUv + vec2( texel.x, 0.0)).r;
    float du = texture2D(tDepth, vUv + vec2(0.0,  texel.y)).r;
    float dd = texture2D(tDepth, vUv + vec2(0.0, -texel.y)).r;
    float m = max(max(d0 - dl, d0 - dr), max(d0 - du, d0 - dd));
    if (m > thr) c = ink;
  }
  gl_FragColor = vec4(c, 1.0);
}`;function v(h){const e=new h.DataTexture(new Uint8Array([178,218,255]),3,1,h.RedFormat);return e.minFilter=e.magFilter=h.NearestFilter,e.needsUpdate=!0,e}class m{constructor(e,t,r,s,i,o={}){var a;this.THREE=e,this.canvas=t,this.target=null,this.w=1,this.h=1,this.halfH=6.1,this.snap={value:new e.Vector2(1,1)},this.renderer=new e.WebGLRenderer({canvas:t,antialias:!1,alpha:!1,powerPreference:"low-power",stencil:!1,precision:"mediump"}),this.renderer.setPixelRatio(1),this.scene=new e.Scene,this.camera=new e.OrthographicCamera(-1,1,1,-1,1,90),this.postScene=new e.Scene,this.postCam=new e.OrthographicCamera(-1,1,1,-1,0,1),this.postMat=new e.ShaderMaterial({vertexShader:p,fragmentShader:c,depthTest:!1,depthWrite:!1,uniforms:{tColor:{value:null},tDepth:{value:null},texel:{value:new e.Vector2},res:{value:new e.Vector2},thr:{value:.003},levels:{value:(a=o.levels)!=null?a:u},pal:{value:1},dith:{value:1},outl:{value:1},ink:{value:new e.Color(l)}}}),this.postScene.add(new e.Mesh(new e.PlaneGeometry(2,2),this.postMat)),this.post=i,this.resize(r,s)}get usesPost(){return this.post.palette||this.post.outline||this.post.dither}setPost(e){this.post=e}resize(e,t){var o,a,n;const r=this.THREE;this.w=Math.max(8,Math.floor(e)),this.h=Math.max(8,Math.floor(t)),this.renderer.setSize(this.w,this.h,!1),(o=this.target)==null||o.dispose(),(n=(a=this.target)==null?void 0:a.depthTexture)==null||n.dispose();const s=new r.WebGLRenderTarget(this.w,this.h,{minFilter:r.NearestFilter,magFilter:r.NearestFilter});s.texture.colorSpace=r.SRGBColorSpace,s.depthTexture=new r.DepthTexture(this.w,this.h),s.depthTexture.minFilter=s.depthTexture.magFilter=r.NearestFilter,this.target=s;const i=this.postMat.uniforms;i.texel.value.set(1/this.w,1/this.h),i.res.value.set(this.w,this.h),this.snap.value.set(this.w/2,this.h/2),this.frame(this.halfH)}frame(e){this.halfH=e;const t=this.w/this.h,r=this.camera,s=t<1?Math.max(e,7.4/t):e;r.left=-s*t,r.right=s*t,r.top=s,r.bottom=-s,r.updateProjectionMatrix()}orbit(e,t=0,r=-.1,s=0,i=.52,o=40){const a=this.camera;a.position.set(t+Math.sin(e)*Math.cos(i)*o,r+Math.sin(i)*o,s+Math.cos(e)*Math.cos(i)*o),a.lookAt(t,r,s),a.updateMatrixWorld()}render(){const e=this.renderer;if(!this.usesPost||!this.target){e.setRenderTarget(null),e.render(this.scene,this.camera);return}e.setRenderTarget(this.target),e.render(this.scene,this.camera),e.setRenderTarget(null);const t=this.postMat.uniforms;t.tColor.value=this.target.texture,t.tDepth.value=this.target.depthTexture,t.pal.value=this.post.palette?1:0,t.dith.value=this.post.dither?1:0,t.outl.value=this.post.outline?1:0,t.thr.value=.3/(this.camera.far-this.camera.near),e.render(this.postScene,this.postCam)}ps1(e){const t=this.snap;return e.onBeforeCompile=r=>{r.uniforms.uSnap=t,r.vertexShader=r.vertexShader.replace("void main() {",`uniform vec2 uSnap;
void main() {`).replace("#include <project_vertex>",`#include <project_vertex>
  gl_Position.xy = floor(gl_Position.xy / gl_Position.w * uSnap + 0.5) / uSnap * gl_Position.w;`)},e.customProgramCacheKey=()=>"ps1snap",e}dispose(){var e;(e=this.target)==null||e.dispose(),this.postMat.dispose(),this.renderer.dispose(),this.renderer.forceContextLoss()}}export{d as D,m as S,v as t};
