// Pixel engine: draws a three.js scene small, then a post pass snaps colors to a fixed palette (ordered dither) and draws
// ink outlines wherever depth jumps. Ideas borrowed from "low-res render target + palette snap + Bayer dither + depth outlines"
// diorama demos; written fresh for this app. Only loaded (lazily) when the Pixel meadow or the Pixel Lab opens.
import type * as T from "three";
export type TH = typeof import("three");

export interface PostOpts { palette: boolean; outline: boolean; dither: boolean }
export const DEFAULT_POST: PostOpts = { palette: true, outline: true, dither: true };
export const INK_HEX = "#2b2540";
const LEVELS = 8; // 8 steps per channel = 512 fixed colors (0, 36, 73, 109, 146, 182, 219, 255)

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FRAG = `
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
  vec3 c = texture2D(tColor, vUv).rgb;
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
}`;

/** Three-step banded light, so shading looks like hand-placed pixel shades rather than a smooth gradient. */
export function toonMap(THREE: TH): T.DataTexture {
  const t = new THREE.DataTexture(new Uint8Array([105, 175, 255]), 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
}

export class Stage {
  renderer: T.WebGLRenderer; scene: T.Scene; camera: T.OrthographicCamera;
  private target: T.WebGLRenderTarget | null = null;
  private postScene: T.Scene; private postCam: T.OrthographicCamera; private postMat: T.ShaderMaterial;
  w = 1; h = 1; halfH = 6.1; post: PostOpts;
  constructor(private THREE: TH, public canvas: HTMLCanvasElement, w: number, h: number, post: PostOpts) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "low-power" });
    this.renderer.setPixelRatio(1);
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 90);
    this.postScene = new THREE.Scene(); this.postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.postMat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false,
      uniforms: { tColor: { value: null }, tDepth: { value: null }, texel: { value: new THREE.Vector2() }, res: { value: new THREE.Vector2() }, thr: { value: 0.003 }, levels: { value: LEVELS }, pal: { value: 1 }, dith: { value: 1 }, outl: { value: 1 }, ink: { value: new THREE.Color(INK_HEX) } },
    });
    this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMat));
    this.post = post; this.resize(w, h);
  }
  get usesPost() { return this.post.palette || this.post.outline || this.post.dither; }
  setPost(p: PostOpts) { this.post = p; }
  resize(w: number, h: number) {
    const THREE = this.THREE;
    this.w = Math.max(8, Math.floor(w)); this.h = Math.max(8, Math.floor(h));
    this.renderer.setSize(this.w, this.h, false);
    this.target?.dispose(); (this.target as T.WebGLRenderTarget | null)?.depthTexture?.dispose();
    const t = new THREE.WebGLRenderTarget(this.w, this.h, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
    t.texture.colorSpace = THREE.SRGBColorSpace; // keep stored colors in sRGB so the palette steps look even
    t.depthTexture = new THREE.DepthTexture(this.w, this.h); t.depthTexture.minFilter = t.depthTexture.magFilter = THREE.NearestFilter;
    this.target = t;
    const u = this.postMat.uniforms; u.texel.value.set(1 / this.w, 1 / this.h); u.res.value.set(this.w, this.h);
    this.frame(this.halfH);
  }
  /** Set how many world units fit the view height (the island stays fully in view on tall phones too). */
  frame(halfH: number) {
    this.halfH = halfH; const a = this.w / this.h, c = this.camera;
    const hh = a < 1 ? Math.max(halfH, 7.4 / a) : halfH;
    c.left = -hh * a; c.right = hh * a; c.top = hh; c.bottom = -hh; c.updateProjectionMatrix();
  }
  /** Put the camera on an orbit around `target` (yaw radians, elevation about 30 degrees = diorama angle). */
  orbit(yaw: number, tx = 0, ty = -0.1, tz = 0, elev = 0.52, dist = 40) {
    const c = this.camera;
    c.position.set(tx + Math.sin(yaw) * Math.cos(elev) * dist, ty + Math.sin(elev) * dist, tz + Math.cos(yaw) * Math.cos(elev) * dist);
    c.lookAt(tx, ty, tz); c.updateMatrixWorld();
  }
  render() {
    const r = this.renderer;
    if (!this.usesPost || !this.target) { r.setRenderTarget(null); r.render(this.scene, this.camera); return; }
    r.setRenderTarget(this.target); r.render(this.scene, this.camera); r.setRenderTarget(null);
    const u = this.postMat.uniforms;
    u.tColor.value = this.target.texture; u.tDepth.value = this.target.depthTexture;
    u.pal.value = this.post.palette ? 1 : 0; u.dith.value = this.post.dither ? 1 : 0; u.outl.value = this.post.outline ? 1 : 0;
    u.thr.value = 0.3 / (this.camera.far - this.camera.near); // ~0.3 world units of depth jump draws an outline
    r.render(this.postScene, this.postCam);
  }
  dispose() { this.target?.dispose(); this.postMat.dispose(); this.renderer.dispose(); this.renderer.forceContextLoss(); }
}
