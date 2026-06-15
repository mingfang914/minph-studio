import Matter from "matter-js";
import gsap from "gsap";
import { projects } from "./Work.js";

const { Engine, World, Bodies, Body } = Matter;

export default class PhysicsLab {
  constructor() {
    this.coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    this.canvas = document.querySelector("#trail-canvas");
    this.container = document.querySelector(".trail-section");
    
    if (this.coarsePointer || this.reduceMotion || !this.canvas || !this.container) return;

    this.ctx = this.canvas.getContext("2d");
    this.bodies = [];
    this.index = 0;
    this.lastPosition = { x: 0, y: 0 };
    
    this.images = [];
    this.preloadImages();
    this.initPhysics();
    this.initEvents();
  }

  preloadImages() {
    projects.forEach((project) => {
      const img = new Image();
      img.src = project.image;
      this.images.push(img);
    });
  }

  initPhysics() {
    // Create physics engine with low gravity for floating/drift effect
    this.engine = Engine.create({
      gravity: { x: 0, y: 0.16 }
    });
    this.world = this.engine.world;

    // Boundaries container
    this.boundaries = {
      bottom: null,
      left: null,
      right: null
    };

    // Deflector field (Cursor collision body)
    this.cursorRadius = 90;
    this.cursorBody = Bodies.circle(-1000, -1000, this.cursorRadius, {
      isStatic: true
    });
    World.add(this.world, this.cursorBody);
  }

  initEvents() {
    this.resize = this.resize.bind(this);
    this.resize();
    window.addEventListener("resize", this.resize);

    this.container.addEventListener("pointermove", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      // Update deflector field position
      Body.setPosition(this.cursorBody, { x: mouseX, y: mouseY });

      // Check distance threshold to spawn new cards
      const dist = Math.hypot(mouseX - this.lastPosition.x, mouseY - this.lastPosition.y);
      if (dist < 85) return;

      this.lastPosition = { x: mouseX, y: mouseY };
      this.spawnItem(mouseX, mouseY);
    });

    this.container.addEventListener("pointerleave", () => {
      // Hide deflector field off-screen when mouse leaves
      Body.setPosition(this.cursorBody, { x: -1000, y: -1000 });
    });

    this.tick = this.tick.bind(this);
    this.tick();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    this.canvas.width = w;
    this.canvas.height = h;

    // Remove existing walls
    const toRemove = [];
    if (this.boundaries.bottom) toRemove.push(this.boundaries.bottom);
    if (this.boundaries.left) toRemove.push(this.boundaries.left);
    if (this.boundaries.right) toRemove.push(this.boundaries.right);
    World.remove(this.world, toRemove);

    // Recreate walls matching new dimensions
    const thickness = 100;
    this.boundaries.bottom = Bodies.rectangle(w / 2, h + thickness / 2, w * 1.5, thickness, { isStatic: true });
    this.boundaries.left = Bodies.rectangle(-thickness / 2, h / 2, thickness, h * 2, { isStatic: true });
    this.boundaries.right = Bodies.rectangle(w + thickness / 2, h / 2, thickness, h * 2, { isStatic: true });

    World.add(this.world, [
      this.boundaries.bottom,
      this.boundaries.left,
      this.boundaries.right
    ]);
  }

  spawnItem(x, y) {
    if (this.images.length === 0) return;

    const img = this.images[this.index++ % this.images.length];
    
    // Specimen card dimensions
    const w = 180;
    const h = 120;

    // Create a physical rectangle body
    const body = Bodies.rectangle(x, y, w, h, {
      restitution: 0.55,    // bounciness
      friction: 0.08,       // surface friction
      frictionAir: 0.015,   // air resistance/drift
      angle: (Math.random() * 24 - 12) * Math.PI / 180
    });

    // Apply spreading horizontal and gentle vertical initial impulses
    const angleSpread = (Math.random() * 40 - 20) * Math.PI / 180;
    const impulseMag = 2.0 + Math.random() * 2.5;
    Body.setVelocity(body, {
      x: Math.sin(angleSpread) * impulseMag,
      y: -Math.cos(angleSpread) * impulseMag - 1.0 // float slightly upwards initially
    });

    // Attachment properties for GSAP animations and rendering
    body.renderData = {
      image: img,
      width: w,
      height: h,
      scale: 0.45,
      opacity: 0,
      clipWidth: 0,
      isDead: false
    };

    // GSAP Intro Animation
    gsap.to(body.renderData, {
      scale: 1,
      opacity: 1,
      clipWidth: 1,
      duration: 0.5,
      ease: "power3.out"
    });

    // GSAP Outro Decay Animation
    gsap.delayedCall(4.2, () => {
      if (body.renderData && !body.renderData.isDead) {
        gsap.to(body.renderData, {
          scale: 0.7,
          opacity: 0,
          duration: 0.8,
          ease: "power2.in",
          onComplete: () => {
            body.renderData.isDead = true;
            World.remove(this.world, body);
            this.bodies = this.bodies.filter(b => b !== body);
          }
        });
      }
    });

    World.add(this.world, body);
    this.bodies.push(body);
  }

  tick() {
    // Update physics simulation
    Engine.update(this.engine, 16.666);
    this.render();
    
    this.tickId = requestAnimationFrame(this.tick);
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Active Specimen Cards
    this.bodies.forEach((body) => {
      const rd = body.renderData;
      if (!rd || rd.isDead) return;

      const { x, y } = body.position;
      const angle = body.angle;

      this.ctx.save();
      this.ctx.translate(x, y);
      this.ctx.rotate(angle);
      this.ctx.scale(rd.scale, rd.scale);
      this.ctx.globalAlpha = rd.opacity;

      // Card shadow
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.28)";
      this.ctx.shadowBlur = 45;
      this.ctx.shadowOffsetY = 15;

      // Animate slice reveal clip-rect
      const visibleWidth = rd.width * rd.clipWidth;
      this.ctx.beginPath();
      this.ctx.rect(-visibleWidth / 2, -rd.height / 2, visibleWidth, rd.height);
      this.ctx.clip();

      // Draw specimen image
      this.ctx.drawImage(rd.image, -rd.width / 2, -rd.height / 2, rd.width, rd.height);
      this.ctx.restore();
    });

    // 2. Draw Sci-Fi Collision Field Overlay (Dotted circle at cursor)
    const cx = this.cursorBody.position.x;
    const cy = this.cursorBody.position.y;
    if (cx > 0 && cy > 0) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, this.cursorRadius, 0, Math.PI * 2);
      this.ctx.strokeStyle = "rgba(219, 255, 67, 0.2)"; // acid with low transparency
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([4, 6]);
      this.ctx.stroke();

      // Diagnostic text near deflector
      this.ctx.font = "8px 'DM Mono', monospace";
      this.ctx.fillStyle = "rgba(219, 255, 67, 0.55)";
      this.ctx.fillText("COLLISION_DEFLECTOR_ACTIVE", cx + 10, cy - 10);
      this.ctx.restore();
    }
  }

  destroy() {
    if (this.tickId) cancelAnimationFrame(this.tickId);
    window.removeEventListener("resize", this.resize);
    
    // Clear GSAP calls
    gsap.killTweensOf(this.bodies.map(b => b.renderData));
    
    // Clear engine
    World.clear(this.world);
    Engine.clear(this.engine);
  }
}
