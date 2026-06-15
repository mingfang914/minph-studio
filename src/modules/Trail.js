import gsap from "gsap";
import { projects } from "./Work.js";

export default class Trail {
  constructor() {
    this.coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.canvas = document.querySelector("#trail-canvas");
    this.container = document.querySelector(".trail-section");
    
    if (this.coarsePointer || this.reduceMotion || !this.canvas || !this.container) return;

    this.ctx = this.canvas.getContext("2d");
    this.items = [];
    this.index = 0;
    this.lastPosition = { x: 0, y: 0 };
    
    this.images = [];
    this.preloadImages();
    this.init();
  }

  preloadImages() {
    projects.forEach((project) => {
      const img = new Image();
      img.src = project.image;
      this.images.push(img);
    });
  }

  init() {
    this.resize = this.resize.bind(this);
    this.resize();
    window.addEventListener("resize", this.resize);

    this.container.addEventListener("pointermove", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      const dist = Math.hypot(mouseX - this.lastPosition.x, mouseY - this.lastPosition.y);
      if (dist < 100) return;

      this.lastPosition = { x: mouseX, y: mouseY };
      this.spawnItem(mouseX, mouseY);
    });

    this.render = this.render.bind(this);
    this.tick();
  }

  resize() {
    if (!this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  spawnItem(x, y) {
    if (this.images.length === 0) return;

    const img = this.images[this.index++ % this.images.length];
    
    const item = {
      image: img,
      x: x,
      y: y,
      targetY: y - 50,
      scale: 0.5,
      rotation: (Math.random() * 24 - 12) * Math.PI / 180,
      opacity: 0,
      clipWidth: 0,
      isDead: false
    };

    const tl = gsap.timeline({
      onComplete: () => {
        item.isDead = true;
      }
    });

    // Intro clip-path reveal + scale
    tl.to(item, {
      scale: 1,
      opacity: 1,
      clipWidth: 1,
      duration: 0.55,
      ease: "power4.out"
    })
    // Outro fade-out + scale-down + drift up
    .to(item, {
      y: item.targetY,
      opacity: 0,
      scale: 0.75,
      duration: 0.8,
      delay: 0.65,
      ease: "power2.in"
    });

    this.items.push(item);
  }

  tick() {
    this.render();
    requestAnimationFrame(this.tick.bind(this));
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Filter out dead items
    this.items = this.items.filter(item => !item.isDead);

    // Draw active items
    this.items.forEach((item) => {
      const w = 180;
      const h = 120;
      
      this.ctx.save();
      
      // Move to target center, apply rotation and scale
      this.ctx.translate(item.x, item.y);
      this.ctx.rotate(item.rotation);
      this.ctx.scale(item.scale, item.scale);
      this.ctx.globalAlpha = item.opacity;

      // Draw shadow simulating .trail-img box-shadow
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
      this.ctx.shadowBlur = 60;
      this.ctx.shadowOffsetY = 20;

      // Simulate clipPath: inset(0 50% 0 50%) where clipWidth animates from 0 to 1
      const visibleWidth = w * item.clipWidth;
      
      this.ctx.beginPath();
      this.ctx.rect(-visibleWidth / 2, -h / 2, visibleWidth, h);
      this.ctx.clip();

      // Draw image centered at (0, 0)
      this.ctx.drawImage(item.image, -w / 2, -h / 2, w, h);
      
      this.ctx.restore();
    });
  }
}
