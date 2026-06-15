import * as THREE from "three";

const TRAIL_LENGTH = 12;

export default class FluidHoverShader {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    if (!this.canvas) return;

    this.options = {
      colorA: "#070707",
      colorB: "#315cff",
      colorC: "#d9ff43",
      texturePath: null,
      strength: 1,
      refraction: 0.8,
      metalness: 0.7,
      shine: 0.8,
      rainIntensity: 0.45,
      rainRate: 0.7,
      rippleStrength: 0.8,
      ...options
    };

    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (this.reduceMotion) return;

    this.coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    this.pointerTarget = new THREE.Vector2(0.5, 0.5);
    this.previousPointer = new THREE.Vector2(0.5, 0.5);
    this.currentMouse = new THREE.Vector2(0.5, 0.5);
    this.lastMouse = new THREE.Vector2(0.5, 0.5);
    this.hasPointer = false;
    this.trail = Array.from({ length: TRAIL_LENGTH }, () => ({
      position: new THREE.Vector2(0.5, 0.5),
      velocity: new THREE.Vector2(),
      life: 0,
      speed: 0
    }));
    this.trailCursor = 0;
    this.lastTrailTime = 0;
    this.pointerImpulse = new THREE.Vector4();
    this.dropImpulse = new THREE.Vector4();
    this.nextRainAt = performance.now() + 400;
    this.simulationFrame = 0;
    this.isPlaying = true;
    this.isVisible = true;
    this.startTime = performance.now();
    this.lastFrame = this.startTime;

    this.init();
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.uniforms = {
      uTime: { value: 0 },
      uAspect: { value: 1 },
      uTextureAspect: { value: 16 / 9 },
      uTexture: { value: null },
      uHasTexture: { value: 0 },
      uColorA: { value: new THREE.Color(this.options.colorA) },
      uColorB: { value: new THREE.Color(this.options.colorB) },
      uColorC: { value: new THREE.Color(this.options.colorC) },
      uStrength: { value: this.options.strength },
      uRefraction: { value: this.options.refraction },
      uMetalness: { value: this.options.metalness },
      uShine: { value: this.options.shine },
      uRipple: { value: null },
      uRippleStrength: { value: this.options.rippleStrength },
      uTrail: { value: this.trail.map(() => new THREE.Vector4()) },
      uTrailVelocity: { value: this.trail.map(() => new THREE.Vector2()) }
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      transparent: true,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        #define TRAIL_LENGTH ${TRAIL_LENGTH}

        varying vec2 vUv;
        uniform float uTime;
        uniform float uAspect;
        uniform float uTextureAspect;
        uniform float uHasTexture;
        uniform float uStrength;
        uniform float uRefraction;
        uniform float uMetalness;
        uniform float uShine;
        uniform float uRippleStrength;
        uniform sampler2D uTexture;
        uniform sampler2D uRipple;
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        uniform vec3 uColorC;
        uniform vec4 uTrail[TRAIL_LENGTH];
        uniform vec2 uTrailVelocity[TRAIL_LENGTH];

        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
        }

        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
            f.y
          );
        }

        float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < 4; i++) {
            value += amplitude * noise(p);
            p = p * 2.03 + 17.17;
            amplitude *= 0.5;
          }
          return value;
        }

        vec2 coverUv(vec2 uv) {
          vec2 scale = vec2(1.0);
          if (uAspect > uTextureAspect) {
            scale.y = uTextureAspect / uAspect;
          } else {
            scale.x = uAspect / uTextureAspect;
          }
          return (uv - 0.5) * scale + 0.5;
        }

        void main() {
          vec2 uv = vUv;
          vec2 flow = vec2(0.0);
          float field = 0.0;
          float edge = 0.0;

          for (int i = 0; i < TRAIL_LENGTH; i++) {
            vec4 trail = uTrail[i];
            vec2 delta = uv - trail.xy;
            delta.x *= uAspect;
            float radius = 0.055 + trail.w * 0.08;
            float influence = exp(-dot(delta, delta) / max(radius * radius, 0.0001)) * trail.z;
            vec2 velocity = uTrailVelocity[i];
            vec2 tangent = vec2(-delta.y, delta.x);

            flow += velocity * influence * 0.28;
            flow += tangent * influence * (0.018 + trail.w * 0.02);
            field += influence;
            edge += influence * (1.0 - influence);
          }

          float ambient = fbm(uv * 3.2 + vec2(uTime * 0.035, -uTime * 0.025));
          vec4 ripple = texture2D(uRipple, uv);
          vec2 rippleGradient = ripple.zw;
          vec2 distortion = flow * uStrength;
          distortion += rippleGradient * (0.055 * uRefraction * uRippleStrength);
          distortion += vec2(
            noise(uv * 5.0 + uTime * 0.08) - 0.5,
            noise(uv.yx * 5.0 - uTime * 0.07) - 0.5
          ) * 0.004 * (0.25 + field);

          vec2 sampleUv = coverUv(uv - distortion);
          float split = min(0.018, length(distortion) * 0.34 + field * 0.0015);
          vec2 splitDirection = normalize(distortion + vec2(0.0001)) * split;
          vec3 textureColor = vec3(
            texture2D(uTexture, sampleUv + splitDirection).r,
            texture2D(uTexture, sampleUv).g,
            texture2D(uTexture, sampleUv - splitDirection).b
          );

          float bands = sin((uv.x + uv.y * 0.55 + ambient * 0.45) * 12.0 - uTime * 0.3);
          float colorMix = smoothstep(-0.75, 0.9, bands + field * 0.36);
          vec3 procedural = mix(uColorA, uColorB, colorMix);
          procedural = mix(procedural, uColorC, clamp(field * 0.42 + edge * 0.3, 0.0, 0.72));
          procedural *= 0.9 + ambient * 0.18;

          vec3 color = mix(procedural, textureColor, uHasTexture);
          color += uColorC * edge * 0.12;

          vec3 rainNormal = normalize(vec3(
            -rippleGradient.x * (2.2 + uMetalness * 2.0),
            -rippleGradient.y * (2.2 + uMetalness * 2.0),
            0.72
          ));
          vec3 lightDirection = normalize(vec3(-0.45, 0.65, 0.8));
          float rainSpecular = pow(max(dot(rainNormal, lightDirection), 0.0), mix(16.0, 48.0, uMetalness));
          float rainFresnel = pow(1.0 - max(rainNormal.z, 0.0), 2.4);
          color += mix(vec3(1.0), uColorC, 0.4) * rainSpecular * uShine * 2.2;
          color += uColorC * rainFresnel * (0.15 + uMetalness * 0.25) * uRippleStrength;
          color += uColorC * (abs(ripple.x) * 0.5 * uRippleStrength);
          color += uColorC * (length(rippleGradient) * 3.0 * uRippleStrength);
          color *= 1.0 - clamp(abs(ripple.x) * 0.055, 0.0, 0.12);

          float vignette = smoothstep(1.0, 0.28, distance(vUv, vec2(0.5)));
          color *= 0.84 + vignette * 0.16;

          gl_FragColor = vec4(color, 1.0);
        }
      `
    });

    this.geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
    this.initRainSimulation();

    if (this.options.texturePath) {
      new THREE.TextureLoader().load(this.options.texturePath, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        this.uniforms.uTexture.value = texture;
        this.uniforms.uTextureAspect.value = texture.image.width / texture.image.height;
        this.uniforms.uHasTexture.value = 1;
      });
    }

    this.resize = this.resize.bind(this);
    this.onPointerMove = this.onPointerMove.bind(this);
    this.onPointerLeave = this.onPointerLeave.bind(this);
    this.render = this.render.bind(this);

    this.resize();
    window.addEventListener("resize", this.resize);
    this.canvas.parentElement.addEventListener("pointermove", this.onPointerMove);
    this.canvas.parentElement.addEventListener("pointerleave", this.onPointerLeave);

    this.observer = new IntersectionObserver(([entry]) => {
      this.isVisible = entry.isIntersecting;
      if (this.isVisible) this.startLoop();
      else this.stopLoop();
    }, { rootMargin: "20%" });
    this.observer.observe(this.canvas.parentElement);

    this.startLoop();
  }

  initRainSimulation() {
    this.simulationScene = new THREE.Scene();
    this.simulationUniforms = {
      uPrevious: { value: null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPointerCurrent: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerLast: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerActive: { value: 0.0 },
      uPointerStrength: { value: 0.0 },
      uPointerRadius: { value: 0.0 },
      uDrop: { value: this.dropImpulse },
      uFrame: { value: 0 }
    };

    this.simulationMaterial = new THREE.ShaderMaterial({
      uniforms: this.simulationUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        varying vec2 vUv;
        uniform sampler2D uPrevious;
        uniform vec2 uResolution;
        uniform vec2 uPointerCurrent;
        uniform vec2 uPointerLast;
        uniform float uPointerActive;
        uniform float uPointerStrength;
        uniform float uPointerRadius;
        uniform vec4 uDrop;
        uniform int uFrame;

        float impulse(vec2 uv, vec4 source) {
          if (source.w <= 0.0) return 0.0;
          vec2 delta = uv - source.xy;
          delta.x *= uResolution.x / uResolution.y;
          float distanceToSource = length(delta);
          return smoothstep(source.z, 0.0, distanceToSource) * source.w;
        }

        float segmentImpulse(vec2 uv, vec2 a, vec2 b, float radius, float strength) {
          if (strength <= 0.0) return 0.0;
          vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
          vec2 p = uv * aspect;
          vec2 pA = a * aspect;
          vec2 pB = b * aspect;
          
          vec2 pa = p - pA;
          vec2 ba = pB - pA;
          float lenBa = length(ba);
          
          float d;
          if (lenBa < 0.0001) {
            d = length(pa);
          } else {
            float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
            d = length(pa - ba * h);
          }
          return smoothstep(radius, 0.0, d) * strength;
        }

        void main() {
          if (uFrame < 2) {
            gl_FragColor = vec4(0.0);
            return;
          }

          vec2 texel = 1.0 / uResolution;
          vec4 data = texture2D(uPrevious, vUv);
          float pressure = data.x;
          float velocity = data.y;

          float right = texture2D(uPrevious, vUv + vec2(texel.x, 0.0)).x;
          float left = texture2D(uPrevious, vUv - vec2(texel.x, 0.0)).x;
          float up = texture2D(uPrevious, vUv + vec2(0.0, texel.y)).x;
          float down = texture2D(uPrevious, vUv - vec2(0.0, texel.y)).x;

          if (vUv.x <= texel.x) left = right;
          if (vUv.x >= 1.0 - texel.x) right = left;
          if (vUv.y <= texel.y) down = up;
          if (vUv.y >= 1.0 - texel.y) up = down;

          float laplacian = right + left + up + down - 4.0 * pressure;
          velocity += laplacian * 0.34;
          velocity -= pressure * 0.012;
          velocity *= 0.991;
          pressure = (pressure + velocity) * 0.9992;
          
          if (uPointerActive > 0.5) {
            pressure += segmentImpulse(vUv, uPointerLast, uPointerCurrent, uPointerRadius, uPointerStrength);
          }
          pressure += impulse(vUv, uDrop);

          vec2 gradient = vec2(right - left, up - down) * 0.5;
          gl_FragColor = vec4(pressure, velocity, gradient);
        }
      `
    });

    this.simulationQuad = new THREE.Mesh(this.geometry, this.simulationMaterial);
    this.simulationScene.add(this.simulationQuad);
  }

  createRenderTargets(width, height) {
    this.rainTargetA?.dispose();
    this.rainTargetB?.dispose();

    const maxDimension = this.coarsePointer ? 480 : 760;
    const scale = Math.min(this.coarsePointer ? 0.34 : 0.48, maxDimension / Math.max(width, height));
    const simWidth = Math.max(160, Math.round(width * scale));
    const simHeight = Math.max(160, Math.round(height * scale));
    const options = {
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      stencilBuffer: false
    };

    this.rainTargetA = new THREE.WebGLRenderTarget(simWidth, simHeight, options);
    this.rainTargetB = new THREE.WebGLRenderTarget(simWidth, simHeight, options);
    this.simulationUniforms.uResolution.value.set(simWidth, simHeight);
    this.uniforms.uRipple.value = this.rainTargetA.texture;
    this.simulationFrame = 0;
  }

  addTrailPoint(position, velocity, speed) {
    const point = this.trail[this.trailCursor];
    point.position.copy(position);
    point.velocity.copy(velocity);
    point.life = 1;
    point.speed = Math.min(speed, 1.6);
    this.trailCursor = (this.trailCursor + 1) % TRAIL_LENGTH;
  }

  onPointerMove(event) {
    if (!this.uniforms) return;
    const rect = this.canvas.getBoundingClientRect();
    const next = new THREE.Vector2(
      (event.clientX - rect.left) / rect.width,
      1 - (event.clientY - rect.top) / rect.height
    );
    if (!this.hasPointer) {
      this.previousPointer.copy(next);
      this.currentMouse.copy(next);
      this.lastMouse.copy(next);
      this.hasPointer = true;
    } else {
      this.currentMouse.copy(next);
    }
    const velocity = next.clone().sub(this.previousPointer);
    const speed = Math.min(1.6, velocity.length() * 18);
    const now = performance.now();

    if (now - this.lastTrailTime > (this.coarsePointer ? 42 : 22)) {
      this.addTrailPoint(next, velocity.multiplyScalar(1.8), speed);
      this.lastTrailTime = now;
    }
    this.previousPointer.copy(next);
  }

  onPointerLeave() {
    this.hasPointer = false;
  }

  resize() {
    if (!this.renderer) return;
    const parent = this.canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    this.renderer.setSize(width, height, false);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, this.coarsePointer ? 1 : 1.35));
    this.uniforms.uAspect.value = width / height;
    this.createRenderTargets(width, height);
  }

  render(now) {
    if (!this.renderer || !this.isPlaying) return;
    const delta = Math.min(0.05, (now - this.lastFrame) / 1000);
    this.lastFrame = now;
    this.uniforms.uTime.value = (now - this.startTime) * 0.001;

    this.trail.forEach((point, index) => {
      point.life = Math.max(0, point.life - delta * 1.15);
      point.velocity.multiplyScalar(Math.pow(0.12, delta));
      this.uniforms.uTrail.value[index].set(
        point.position.x,
        point.position.y,
        point.life * point.life,
        point.speed
      );
      this.uniforms.uTrailVelocity.value[index].copy(point.velocity);
    });

    if (now >= this.nextRainAt) {
      const intensity = this.options.rainIntensity;
      this.dropImpulse.set(
        0.08 + Math.random() * 0.84,
        0.08 + Math.random() * 0.84,
        0.009 + Math.random() * 0.016,
        (0.18 + Math.random() * 0.24) * intensity
      );
      const rate = Math.max(0.1, this.options.rainRate);
      this.nextRainAt = now + (260 + Math.random() * 520) / rate;
    }

    if (this.hasPointer) {
      const dist = this.currentMouse.distanceTo(this.lastMouse);
      const speed = Math.min(1.6, dist * 55.0);
      
      this.simulationUniforms.uPointerCurrent.value.copy(this.currentMouse);
      this.simulationUniforms.uPointerLast.value.copy(this.lastMouse);
      
      const baseStrength = 0.06;
      const strength = (baseStrength + speed * 1.6) * this.options.rippleStrength;
      const radius = 0.01 + speed * 0.008;
      
      this.simulationUniforms.uPointerStrength.value = strength;
      this.simulationUniforms.uPointerRadius.value = radius;
      this.simulationUniforms.uPointerActive.value = 1.0;
    } else {
      this.simulationUniforms.uPointerActive.value = 0.0;
      this.simulationUniforms.uPointerStrength.value = 0.0;
    }

    this.simulationUniforms.uFrame.value = this.simulationFrame++;
    this.simulationUniforms.uPrevious.value = this.rainTargetA.texture;
    this.renderer.setRenderTarget(this.rainTargetB);
    this.renderer.render(this.simulationScene, this.camera);
    this.uniforms.uRipple.value = this.rainTargetB.texture;
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);

    [this.rainTargetA, this.rainTargetB] = [this.rainTargetB, this.rainTargetA];
    this.lastMouse.copy(this.currentMouse);
    this.dropImpulse.w = 0;
  }

  startLoop() {
    if (!this.renderer || !this.isVisible) return;
    this.isPlaying = true;
    this.lastFrame = performance.now();
    this.renderer.setAnimationLoop(this.render);
  }

  stopLoop() {
    this.isPlaying = false;
    if (this.renderer) this.renderer.setAnimationLoop(null);
  }

  destroy() {
    this.stopLoop();
    window.removeEventListener("resize", this.resize);
    this.canvas?.parentElement?.removeEventListener("pointermove", this.onPointerMove);
    this.canvas?.parentElement?.removeEventListener("pointerleave", this.onPointerLeave);
    this.observer?.disconnect();
    this.uniforms?.uTexture.value?.dispose();
    this.rainTargetA?.dispose();
    this.rainTargetB?.dispose();
    this.simulationMaterial?.dispose();
    this.geometry?.dispose();
    this.material?.dispose();
    this.renderer?.dispose();
  }
}
