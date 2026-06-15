import gsap from "gsap";

export default class Preloader {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.count = document.querySelector(".loader-count");
    this.blocks = gsap.utils.toArray(".loader-grid i");
    this.init();
  }

  init() {
    const finishLoading = () => {
      document.body.classList.remove("is-loading");
      const preloader = document.querySelector(".preloader");
      if (preloader) preloader.style.display = "none";
      if (this.onComplete) this.onComplete();
    };

    // Fallback safety timeout
    const fallbackTimeout = window.setTimeout(finishLoading, 4200);

    const state = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        window.clearTimeout(fallbackTimeout);
        finishLoading();
      }
    });

    // Animate count and loader blocks
    tl.to(state, {
      value: 100,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        if (this.count) {
          this.count.textContent = String(Math.round(state.value)).padStart(3, "0");
        }
      }
    })
      .to(".loader-title span", { yPercent: -400, duration: 0.7, ease: "power3.inOut" }, 1.15)
      .to(this.blocks, {
        scaleY: 0,
        duration: 0.8,
        stagger: { each: 0.045, from: "random" },
        ease: "power4.inOut"
      }, 1.35)
      .set(".preloader", { display: "none" })
      .from(".hero-line", { yPercent: 110, duration: 1.2, stagger: 0.08, ease: "power4.out" }, 1.65)
      .from(".hero-label, .hero-copy > p, .hero-footer, .hero-orbit", { opacity: 0, y: 20, duration: 0.7, stagger: 0.08 }, 1.85);
  }
}
