import gsap from "gsap";

export default class Manifesto {
  constructor() {
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.init();
  }

  init() {
    if (this.reduceMotion) return;

    const layers = gsap.utils.toArray(".peel-layer");
    gsap.set(layers, { scale: (i) => 0.35 + i * 0.14 });
    gsap.set(".peel-image", { width: 0, height: 0, opacity: 0 });
    gsap.set([".peel-left", ".peel-right"], { x: 0 });

    gsap.timeline({
      scrollTrigger: {
        trigger: ".manifesto-peel",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        invalidateOnRefresh: true
      }
    })
    // 1. Zoom out intro text slightly
    .to(".peel-intro", { scale: 0.94, duration: 0.2, ease: "none" }, 0)

    // 2. Immediately start sliding the words left and right to create a gap
    .to(".peel-left", {
      x: () => -window.innerWidth / 2 - 250,
      duration: 0.5,
      ease: "power2.inOut"
    }, 0)
    .to(".peel-right", {
      x: () => window.innerWidth / 2 + 250,
      duration: 0.5,
      ease: "power2.inOut"
    }, 0)

    // 3. Only reveal the center circle image AFTER the words have slid apart (delay to 0.2)
    .to(".peel-image", {
      width: () => Math.min(190, Math.max(120, window.innerWidth * 0.12)),
      height: () => Math.min(190, Math.max(120, window.innerWidth * 0.12)),
      opacity: 1,
      borderRadius: "40px",
      duration: 0.22,
      ease: "power1.out"
    }, 0.2)

    // 4. Once slide-out is complete (0.42), expand the image to cover the full viewport
    .to(".peel-image", {
      width: "100vw",
      height: "100vh",
      borderRadius: 0,
      duration: 0.43,
      ease: "power2.inOut"
    }, 0.42)
    .to(layers, {
      scale: 1,
      stagger: 0.03,
      duration: 0.43,
      ease: "power2.out"
    }, 0.42)

    // 5. Smooth reveal of the heading statement
    .to(".peel-image h2", {
      opacity: 1,
      duration: 0.3
    }, 0.72)
    .fromTo(".peel-image h2", 
      { filter: "blur(15px)", scale: 0.85 },
      { filter: "blur(0px)", scale: 1, duration: 0.35, ease: "power2.out" },
      0.72
    );
  }
}
