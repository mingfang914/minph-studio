import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const projects = [
  {
    title: "SAFETY",
    type: {
      en: "ASSESSMENT SAFETY / 2026",
      vi: "AN TOÀN KHẢO THÍ / 2026"
    },
    description: {
      en: "A secure examination platform combining real-time invigilation, anti-cheat controls, CLO-based exam design and AI-assisted grading.",
      vi: "Nền tảng khảo thí bảo mật kết hợp giám sát thời gian thực, kiểm soát gian lận, ma trận CLO và chấm điểm với AI."
    },
    image: "/art/assets/safety.webp",
    link: "https://itexam.nvtanh.id.vn"
  },
  {
    title: "MULTI",
    type: {
      en: "MULTI-SERVICE LEARNING / 2026",
      vi: "HỆ HỌC TẬP ĐA DỊCH VỤ / 2026"
    },
    description: {
      en: "A collaborative LMS connecting courses, groups, live classrooms, shared documents and assessment across a Dockerized service architecture.",
      vi: "Hệ LMS cộng tác kết nối khóa học, nhóm, lớp trực tuyến, tài liệu đồng biên tập và đánh giá trên kiến trúc dịch vụ Docker."
    },
    image: "/art/assets/multi.webp",
    link: "https://github.com/mingfang914/ExLMS-SpringBootProject"
  },
  {
    title: "EFFECT",
    type: {
      en: "REAL-TIME VISUAL EFFECTS / 2026",
      vi: "HIỆU ỨNG THỊ GIÁC THỜI GIAN THỰC / 2026"
    },
    description: {
      en: "A browser-based visual studio with a custom multi-pass WebGL 2 pipeline, 44 composable GLSL effects, reusable presets and direct media export.",
      vi: "Studio thị giác trên trình duyệt với pipeline WebGL 2 đa lượt, 44 hiệu ứng GLSL kết hợp được, preset tái sử dụng và xuất media trực tiếp."
    },
    image: "/art/assets/effect.webp",
    link: "https://projectmf.id.vn"
  },
  {
    title: "MOTION",
    type: {
      en: "MOTION-LED DIGITAL RITUAL / 2026",
      vi: "NGHI THỨC SỐ DẪN DẮT BỞI CHUYỂN ĐỘNG / 2026"
    },
    description: {
      en: "A cinematic Major Arcana observatory using orbital navigation, tactile card motion, a three-card ritual and a procedural Web Audio soundscape.",
      vi: "Đài quan sát Major Arcana điện ảnh với điều hướng quỹ đạo, chuyển động lá bài giàu xúc giác, nghi thức ba lá và âm cảnh Web Audio."
    },
    image: "/art/assets/motion.webp",
    link: "https://github.com/mingfang914/galaxy-tarot"
  }
];

export default class Work {
  constructor() {
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.current = 0;
    this.previousProgress = 0;
    this.init();
  }

  buildSlides() {
    const host = document.querySelector(".work-slides");
    if (!host) return;
    host.innerHTML = "";
    projects.forEach((project, index) => {
      const slide = document.createElement("article");
      slide.className = `work-slide${index === 0 ? " is-active" : ""}`;
      slide.dataset.index = index;
      slide.innerHTML = index === 0
        ? `<div class="work-slide-bg" style="background-image:url('${project.image}')"></div>`
        : `<div class="strip-layer">${Array.from({ length: 16 }, (_, i) => `<i class="strip" style="background-image:url('${project.image}');background-position:${(i / 15) * 100}% center"></i>`).join("")}</div>`;
      host.appendChild(slide);
    });
  }

  updateUI(index, direction = 1, animate = true) {
    const project = projects[index];
    const title = document.querySelector(".work-title");
    if (title) {
      if (animate) {
        gsap.to(title, {
          yPercent: direction > 0 ? -120 : 120, duration: 0.25, ease: "power2.in",
          onComplete: () => {
            title.textContent = project.title;
            gsap.set(title, { yPercent: direction > 0 ? 120 : -120 });
            gsap.to(title, { yPercent: 0, duration: 0.4, ease: "power3.out" });
          }
        });
      } else {
        title.textContent = project.title;
      }
    }

    const counter = document.querySelector(".work-counter");
    if (counter) counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;

    const lang = localStorage.getItem("mp-portfolio-lang") || "en";

    const type = document.querySelector(".work-type");
    if (type) type.textContent = project.type[lang];

    const desc = document.querySelector(".work-description");
    if (desc) desc.textContent = project.description[lang];

    const link = document.querySelector(".work-link");
    if (link) link.href = project.link;
  }

  init() {
    this.buildSlides();
    this.updateUI(this.current, 1, false);

    // Listen to language changes to update slides texts instantly
    document.addEventListener("langchanged", () => {
      this.updateUI(this.current, 1, false);
    });

    if (this.reduceMotion) return;

    ScrollTrigger.create({
      trigger: ".work-showcase",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onUpdate: (self) => {
        const scaled = self.progress * (projects.length - 1);
        const next = Math.min(projects.length - 1, Math.floor(scaled + 0.35));
        const transitionIndex = Math.min(projects.length - 2, Math.floor(scaled));
        let local = scaled - Math.floor(scaled);
        if (scaled >= projects.length - 1) {
          local = 1.0;
        }
        const targetSlide = document.querySelector(`.work-slide[data-index="${transitionIndex + 1}"]`);

        if (targetSlide) {
          targetSlide.classList.add("is-active");
          targetSlide.querySelectorAll(".strip").forEach((strip, i) => {
            const adjusted = gsap.utils.clamp(0, 1, (local - i * 0.018) * 1.35);
            strip.style.transform = `scaleY(${adjusted})`;
          });
        }

        document.querySelectorAll(".work-slide").forEach((slide) => {
          const i = Number(slide.dataset.index);
          if (i <= Math.floor(scaled) + 1) slide.classList.add("is-active");
          if (i > Math.floor(scaled) + 1) slide.classList.remove("is-active");
        });

        if (next !== this.current) {
          this.updateUI(next, self.progress >= this.previousProgress ? 1 : -1);
          this.current = next;
        }

        this.previousProgress = self.progress;

        const progressIndicator = document.querySelector(".work-progress i");
        if (progressIndicator) {
          progressIndicator.style.transform = `scaleX(${0.25 + self.progress * 0.75})`;
        }

        const activeBg = document.querySelector(`.work-slide[data-index="${Math.floor(scaled)}"] .work-slide-bg`);
        if (activeBg) {
          activeBg.style.transform = `scale(${1.12 - local * 0.12})`;
        }
      }
    });
  }
}
