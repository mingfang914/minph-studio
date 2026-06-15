import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Preloader from "./modules/Preloader.js";
import ScrollEngine from "./modules/ScrollEngine.js";
import NoiseShader from "./modules/NoiseShader.js";
import FluidHoverShader from "./modules/FluidHoverShader.js";
import Cursor from "./modules/Cursor.js";
import Manifesto from "./modules/Manifesto.js";
import Work from "./modules/Work.js";
import PhysicsLab from "./modules/PhysicsLab.js";
import Menu from "./modules/Menu.js";
import I18n from "./modules/I18n.js";
import ChapterTransition from "./modules/ChapterTransition.js";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

document.body.classList.add("is-loading");

// 1. Initialize core engines
const i18n = new I18n();
const scrollEngine = new ScrollEngine();
const cursor = new Cursor();

// 2. Initialize interactive shaders
const heroShader = new FluidHoverShader(document.querySelector("#hero-canvas"), {
  texturePath: "/art/assets/hero.webp",
  colorA: "#070707",
  colorB: "#315cff",
  colorC: "#d9ff43",
  strength: 1.08,
  refraction: 0.92,
  metalness: 0.46,
  shine: 0.76,
  rainIntensity: 0.34,
  rainRate: 0.55,
  rippleStrength: 0.72
});
const contactShader = new FluidHoverShader(document.querySelector("#contact-canvas"), {
  colorA: "#070707",
  colorB: "#141416",
  colorC: "#ff4d2e",
  strength: 1.1,
  refraction: 0.92,
  metalness: 0.55,
  shine: 1.35,
  rainIntensity: 0.36,
  rainRate: 0.52,
  rippleStrength: 1.35
});
const menuShader = new NoiseShader(document.querySelector("#menu-canvas"), "#315cff", "#d9ff43");

// 3. Initialize components
const manifesto = new Manifesto();
const work = new Work();
const trail = new PhysicsLab();
const menu = new Menu(scrollEngine, menuShader);
const chapterTransition = new ChapterTransition();

// 4. Initialize Preloader with entry animations callback
const preloader = new Preloader(() => {
  initHeroAnimations();
  initArchivePreview();
  initContactAnimations();
  initContentReveals();
  ScrollTrigger.refresh();
});

function initHeroAnimations() {
  if (reduceMotion) return;

  // 1. Entrance staggered fade-reveal
  gsap.from(".hero-line", {
    yPercent: 100,
    rotateX: -15,
    opacity: 0,
    duration: 1.3,
    stagger: 0.15,
    ease: "expo.out",
    transformOrigin: "bottom center"
  });

  gsap.from(".hero-copy > p, .hero-label, .hero-footer, .hero-orbit", {
    opacity: 0,
    y: 25,
    duration: 1.1,
    stagger: 0.08,
    ease: "power3.out",
    delay: 0.4
  });

  // 2. Scroll parallax
  gsap.to(".hero-copy", {
    yPercent: 32,
    opacity: 0.15,
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  gsap.to(".hero-orbit", {
    rotate: 180,
    scale: 0.6,
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true
    }
  });

  // 3. Kinetic scroll skewing on velocity
  const heroLines = document.querySelectorAll(".hero-line");
  let proxy = { skew: 0 };
  const skewSetter = gsap.quickSetter(heroLines, "skewX", "deg");
  const clamp = gsap.utils.clamp(-12, 12);

  ScrollTrigger.create({
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    onUpdate: (self) => {
      const velocity = self.getVelocity() / 250;
      const skew = clamp(velocity);

      gsap.to(proxy, {
        skew: skew,
        duration: 0.25,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => skewSetter(proxy.skew)
      });

      gsap.to(proxy, {
        skew: 0,
        duration: 0.5,
        delay: 0.08,
        ease: "power3.out",
        overwrite: "auto",
        onUpdate: () => skewSetter(proxy.skew)
      });
    }
  });
}

function initArchivePreview() {
  if (coarsePointer) return;
  const preview = document.querySelector(".archive-preview");
  const image = preview?.querySelector("img");
  if (!preview || !image) return;

  const hidePreview = () => {
    gsap.to(preview, {
      opacity: 0,
      clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",
      duration: 0.25,
      overwrite: "auto"
    });
  };

  // Hide when mouse leaves the archive list container completely
  const listContainer = document.querySelector(".archive-list");
  if (listContainer) {
    listContainer.addEventListener("mouseleave", hidePreview);
  }

  document.querySelectorAll(".archive-list article").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      image.src = item.dataset.image;
      gsap.to(preview, {
        opacity: 1,
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        duration: 0.45,
        ease: "power3.out",
        overwrite: "auto"
      });
    });

    item.addEventListener("mousemove", (event) => {
      gsap.to(preview, {
        x: event.clientX + 24,
        y: event.clientY - 105,
        duration: 0.7,
        ease: "power3.out",
        overwrite: "auto"
      });
    });

    item.addEventListener("mouseleave", hidePreview);
  });
}

function initContactAnimations() {
  if (reduceMotion) return;

  gsap.from(".contact h2 span", {
    yPercent: 120,
    opacity: 0,
    duration: 1.2,
    stagger: 0.1,
    ease: "power4.out",
    scrollTrigger: {
      trigger: ".contact",
      start: "top 65%"
    }
  });
}

function initContentReveals() {
  if (reduceMotion) return;

  gsap.utils.toArray(".content-reveal").forEach((element) => {
    gsap.from(element, {
      y: 70,
      opacity: 0,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 86%",
        once: true
      }
    });
  });

  gsap.utils.toArray(".project-entry-media img, .experiment-visual img").forEach((image) => {
    gsap.fromTo(image,
      { scale: 1.12 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: image,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });
}

// 5. Global glitch scramble animation on language transition
document.addEventListener("langchanged", () => {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    if (el.tagName.startsWith("H") || el.classList.contains("scramble") || el.tagName === "SPAN") {
      const original = el.innerHTML;
      const txt = el.textContent;
      const chars = "▓▒░/<>[]{}01";
      let frame = 0;
      const interval = setInterval(() => {
        el.textContent = txt.split("").map((char, i) =>
          char === " " ? " " : i < frame ? txt[i] : chars[Math.floor(Math.random() * chars.length)]
        ).join("");

        frame += 1.5;
        if (frame >= txt.length) {
          clearInterval(interval);
          el.innerHTML = original;
        }
      }, 20);
    }
  });
});
