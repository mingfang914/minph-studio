import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default class ScrollEngine {
  constructor() {
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.lenis = null;
    this.init();
  }

  init() {
    if (this.reduceMotion) return;

    this.lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.9
    });

    this.lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      if (this.lenis) {
        this.lenis.raf(time * 1000);
      }
    });

    gsap.ticker.lagSmoothing(0);
  }

  scrollTo(target, options = {}) {
    if (this.lenis) {
      this.lenis.scrollTo(target, options);
    } else {
      const el = typeof target === "string" ? document.querySelector(target) : target;
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  get instance() {
    return this.lenis;
  }
}
