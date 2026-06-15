import gsap from "gsap";

export default class Cursor {
  constructor() {
    this.coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    this.cursor = document.querySelector(".cursor");
    this.init();
  }

  init() {
    if (this.coarsePointer || !this.cursor) return;

    window.addEventListener("pointermove", (event) => {
      gsap.to(this.cursor, {
        x: event.clientX,
        y: event.clientY,
        opacity: 1,
        duration: 0.45,
        ease: "power3.out"
      });
    });

    this.registerHoverables("a, button, .archive-list article");
  }

  registerHoverables(selector) {
    if (this.coarsePointer || !this.cursor) return;

    document.querySelectorAll(selector).forEach((target) => {
      target.addEventListener("mouseenter", () => {
        gsap.to(this.cursor, { scale: 1, duration: 0.3 });
      });
      target.addEventListener("mouseleave", () => {
        gsap.to(this.cursor, { scale: 0.2, duration: 0.3 });
      });
    });
  }
}
