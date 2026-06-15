import * as THREE from "three";
import gsap from "gsap";

export default class NoiseShader {
  constructor(canvas, colorA, colorB, texturePath = null) {
    this.canvas = canvas;
    if (!this.canvas) return;

    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (this.reduceMotion) return;

    this.colorA = colorA;
    this.colorB = colorB;
    this.texturePath = texturePath;
    this.coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    
    this.isPlaying = true;
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.material = null;
    this.uniforms = null;
    this.startTime = 0;

    this.init();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance"
    });

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uTexture: { value: null },
      uHasTexture: { value: 0 },
      uColorA: { value: new THREE.Color(this.colorA) },
      uColorB: { value: new THREE.Color(this.colorB) },
      uAspect: { value: 1 }
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position,1.);}`,
      fragmentShader: `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2 uMouse;
        uniform sampler2D uTexture;
        uniform float uHasTexture;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform float uAspect;
        float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}
        void main(){
          vec2 uv=vUv;
          vec2 m=uMouse;
          float d=distance(vec2(uv.x*uAspect,uv.y),vec2(m.x*uAspect,m.y));
          float wave=sin(uv.y*28.0+uTime*1.4+noise(uv*5.0)*5.0)*0.006;
          uv.x += wave + (uv.y-m.y)*0.025*exp(-d*4.0);
          uv.y += sin(uv.x*18.0-uTime)*0.004;
          vec4 tex=texture2D(uTexture,uv);
          float n=noise(vUv*6.0+uTime*0.08);
          vec3 procedural=mix(uColorA,uColorB,smoothstep(0.2,0.9,n+d*0.25));
          vec3 col=mix(procedural,tex.rgb,uHasTexture);
          float scan=0.92+0.08*sin(vUv.y*900.0);
          gl_FragColor=vec4(col*scan,1.0);
        }`
    });

    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.material));

    if (this.texturePath) {
      new THREE.TextureLoader().load(this.texturePath, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        this.uniforms.uTexture.value = texture;
        this.uniforms.uHasTexture.value = 1;
      });
    }

    this.resize = this.resize.bind(this);
    this.pointer = this.pointer.bind(this);

    this.resize();
    window.addEventListener("resize", this.resize);
    this.canvas.parentElement.addEventListener("pointermove", this.pointer);

    this.startTime = performance.now();
    this.render = this.render.bind(this);
    this.startLoop();
  }

  resize() {
    if (!this.renderer) return;
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.coarsePointer ? 1 : 1.4));
    this.uniforms.uAspect.value = width / height;
  }

  pointer(event) {
    if (!this.uniforms) return;
    const rect = this.canvas.getBoundingClientRect();
    gsap.to(this.uniforms.uMouse.value, {
      x: (event.clientX - rect.left) / rect.width,
      y: 1 - (event.clientY - rect.top) / rect.height,
      duration: 0.8,
      ease: "power3.out"
    });
  }

  render() {
    if (!this.isPlaying || !this.renderer) return;
    this.uniforms.uTime.value = (performance.now() - this.startTime) * 0.001;
    this.renderer.render(this.scene, this.camera);
  }

  startLoop() {
    this.isPlaying = true;
    if (this.renderer) {
      this.renderer.setAnimationLoop(this.render);
    }
  }

  stopLoop() {
    this.isPlaying = false;
    if (this.renderer) {
      this.renderer.setAnimationLoop(null);
    }
  }

  destroy() {
    this.stopLoop();
    window.removeEventListener("resize", this.resize);
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeEventListener("pointermove", this.pointer);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}
