class ParticleSystem {
  constructor(canvasId) {
    this.canvas  = document.getElementById(canvasId);
    this.ctx     = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse   = { x: null, y: null, radius: 120 };
    this.config  = { count: 80, speed: 0.4, minRadius: 1, maxRadius: 3, connectDist: 130, mouseRepel: true };
    this.animId  = null;
    this.init();
  }

  getColor() {
    const theme = document.documentElement.getAttribute('data-theme');
    return theme === 'light' ? 'rgba(109, 40, 217, VAL)' : 'rgba(124, 58, 237, VAL)';
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  createParticle() {
    return {
      x:  Math.random() * this.canvas.width,
      y:  Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * this.config.speed,
      vy: (Math.random() - 0.5) * this.config.speed,
      r:  Math.random() * (this.config.maxRadius - this.config.minRadius) + this.config.minRadius,
      opacity: Math.random() * 0.5 + 0.2,
    };
  }

  init() {
    this.resize();
    this.particles = Array.from({ length: this.config.count }, () => this.createParticle());

    window.addEventListener('resize', () => {
      this.resize();
      this.particles = Array.from({ length: this.config.count }, () => this.createParticle());
    });

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(this.animId);
      else this.animate();
    });

    this.animate();
  }

  drawParticle(p) {
    const color = this.getColor().replace('VAL', p.opacity);
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
  }

  drawConnection(p1, p2, dist) {
    const opacity = (1 - dist / this.config.connectDist) * 0.3;
    const color   = this.getColor().replace('VAL', opacity);
    this.ctx.beginPath();
    this.ctx.moveTo(p1.x, p1.y);
    this.ctx.lineTo(p2.x, p2.y);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth   = 0.8;
    this.ctx.stroke();
  }

  updateParticle(p) {
    if (this.config.mouseRepel && this.mouse.x !== null) {
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < this.mouse.radius) {
        const force = (this.mouse.radius - d) / this.mouse.radius;
        p.vx += (dx / d) * force * 0.8;
        p.vy += (dy / d) * force * 0.8;
      }
    }

    p.vx *= 0.99; p.vy *= 0.99;
    p.x += p.vx; p.y += p.vy;

    if (p.x < 0) p.x = this.canvas.width;
    if (p.x > this.canvas.width)  p.x = 0;
    if (p.y < 0) p.y = this.canvas.height;
    if (p.y > this.canvas.height) p.y = 0;
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      this.updateParticle(p);
      this.drawParticle(p);

      for (let j = i + 1; j < this.particles.length; j++) {
        const q  = this.particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < this.config.connectDist) {
          this.drawConnection(p, q, d);
        }
      }
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }
}

function shouldRunParticles() {
  return window.innerWidth > 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

document.addEventListener('DOMContentLoaded', () => {
  if (shouldRunParticles() && document.getElementById('particles-canvas')) {
    window._particles = new ParticleSystem('particles-canvas');
  } else {
    document.getElementById('particles-canvas')?.remove();
  }
});
