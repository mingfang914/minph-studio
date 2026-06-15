import gsap from "gsap";

export default class Menu {
  constructor(scrollEngine, menuShader = null) {
    this.scrollEngine = scrollEngine;
    this.menuShader = menuShader;
    
    this.overlay = document.querySelector(".menu-overlay");
    this.toggle = document.querySelector(".menu-toggle");
    this.closeBtn = document.querySelector(".menu-close");
    this.radialMenu = document.querySelector(".radial-menu");
    this.links = document.querySelectorAll(".radial-menu a");
    
    // Physics variables for rotational dragging
    this.currentRotation = 0;
    this.isDragging = false;
    this.startAngle = 0;
    this.startRotation = 0;
    this.velocity = 0;
    this.lastTime = 0;
    this.lastAngle = 0;
    this.isOpen = false;

    this.init();
  }

  init() {
    if (!this.overlay || !this.toggle || !this.closeBtn || !this.radialMenu) return;

    // Standard Open/Close actions
    this.toggle.addEventListener("click", () => this.setOpen(true));
    this.closeBtn.addEventListener("click", () => this.setOpen(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.isOpen) this.setOpen(false);
    });

    // Hover scramble microinteractions
    document.querySelectorAll(".scramble").forEach((el) => {
      el.addEventListener("mouseenter", () => this.scramble(el));
    });

    // Radial Menu Rotational Dragging setup
    this.radialMenu.addEventListener("pointerdown", this.onPointerDown.bind(this));
    window.addEventListener("pointermove", this.onPointerMove.bind(this));
    window.addEventListener("pointerup", this.onPointerUp.bind(this));

    // Nav link transitions
    this.links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetId = link.getAttribute("href");
        this.triggerTransition(targetId);
      });
    });

    // Stop shader by default
    if (this.menuShader) {
      this.menuShader.stopLoop();
    }
  }

  setOpen(open) {
    this.isOpen = open;
    this.toggle.setAttribute("aria-expanded", String(open));
    this.overlay.setAttribute("aria-hidden", String(!open));
    this.overlay.inert = !open;

    if (open) {
      this.overlay.style.pointerEvents = "auto";
      
      // Start Menu WebGL Loop
      if (this.menuShader) {
        this.menuShader.startLoop();
      }

      gsap.to(this.overlay, { opacity: 1, duration: 0.35 });
      
      // Radial Menu zoom + spin-in
      gsap.fromTo(this.radialMenu, 
        { scale: 0.55, rotation: this.currentRotation - 20 }, 
        { scale: 1, rotation: this.currentRotation, duration: 0.9, ease: "expo.out" }
      );
      
      // Glitch blink nav links
      gsap.fromTo(this.links, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.08, stagger: { each: 0.08, from: "random" }, repeat: 2, yoyo: true }
      );
    } else {
      // Stop Menu WebGL Loop to save resources
      if (this.menuShader) {
        this.menuShader.stopLoop();
      }
      
      gsap.to(this.overlay, { 
        opacity: 0, 
        duration: 0.35, 
        onComplete: () => { 
          this.overlay.style.pointerEvents = "none"; 
        } 
      });
    }
  }

  // Rotational math
  getAngle(clientX, clientY) {
    const rect = this.radialMenu.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * 180 / Math.PI;
  }

  onPointerDown(e) {
    // Avoid triggering on links directly if clicking specific targets, but allow general dragging
    this.isDragging = true;
    this.radialMenu.style.cursor = "grabbing";
    
    const angle = this.getAngle(e.clientX, e.clientY);
    this.startAngle = angle;
    this.lastAngle = angle;
    this.startRotation = this.currentRotation;
    this.velocity = 0;
    this.lastTime = Date.now();
  }

  onPointerMove(e) {
    if (!this.isDragging) return;

    const angle = this.getAngle(e.clientX, e.clientY);
    let diff = angle - this.lastAngle;

    // Handle wrap boundary
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    this.currentRotation += diff;
    this.lastAngle = angle;

    const now = Date.now();
    const dt = now - this.lastTime;
    if (dt > 0) {
      this.velocity = (diff / dt) * 16; // instant speed
    }
    this.lastTime = now;

    this.updateMenuRotation();
  }

  onPointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.radialMenu.style.cursor = "";

    // Smooth inertia loop
    this.tickPhysics();
  }

  tickPhysics() {
    if (this.isDragging) return;
    if (Math.abs(this.velocity) < 0.05) {
      this.velocity = 0;
      return;
    }

    this.currentRotation += this.velocity;
    this.velocity *= 0.94; // friction decay
    this.updateMenuRotation();

    requestAnimationFrame(this.tickPhysics.bind(this));
  }

  updateMenuRotation() {
    gsap.set(this.radialMenu, { rotation: this.currentRotation });
    this.links.forEach((link) => {
      link.style.setProperty("--counter-rot", `${-this.currentRotation}deg`);
    });
  }

  // Text scramble glitch interaction
  scramble(element) {
    const original = element.textContent;
    const chars = "▓▒░/<>[]{}01";
    let frame = 0;
    const interval = setInterval(() => {
      element.textContent = original.split("").map((char, i) => 
        char === " " ? " " : i < frame ? original[i] : chars[Math.floor(Math.random() * chars.length)]
      ).join("");
      
      frame += 0.8;
      if (frame >= original.length) {
        clearInterval(interval);
        element.textContent = original;
      }
    }, 32);
  }

  // Smooth Grid Page Wipe transitions
  triggerTransition(targetId) {
    const grid = document.querySelector(".transition-grid");
    const blocks = gsap.utils.toArray(".transition-grid i");

    if (grid && blocks.length > 0) {
      gsap.set(grid, { visibility: "visible" });
      blocks.forEach((block, index) => {
        gsap.set(block, { transformOrigin: index % 2 === 0 ? "top" : "bottom" });
      });

      const tl = gsap.timeline();

      tl.to(blocks, {
        scaleY: 1,
        duration: 0.52,
        stagger: { each: 0.025, from: "edges" },
        ease: "power4.inOut"
      })
      .add(() => {
        this.setOpen(false);
        blocks.forEach((block, index) => {
          gsap.set(block, { transformOrigin: index % 2 === 0 ? "bottom" : "top" });
        });

        if (this.scrollEngine) {
          this.scrollEngine.scrollTo(targetId, { immediate: true });
        } else {
          document.querySelector(targetId)?.scrollIntoView();
        }
      })
      .to(blocks, {
        scaleY: 0,
        duration: 0.48,
        stagger: { each: 0.025, from: "center" },
        ease: "power4.inOut"
      })
      .set(grid, { visibility: "hidden" });
    } else {
      this.setOpen(false);
      if (this.scrollEngine) {
        this.scrollEngine.scrollTo(targetId);
      }
    }
  }
}
