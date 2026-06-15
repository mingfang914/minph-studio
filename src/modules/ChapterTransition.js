import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const transitions = [
  {
    id: "about",
    index: 2,
    label: {
      en: "02 / PROFILE",
      vi: "02 / HỒ SƠ"
    },
    title: {
      en: "HUMAN + MACHINE",
      vi: "CON NGƯỜI + MÁY MÓC"
    },
    desc: {
      en: "I translate complexity into experiences that feel inevitable.",
      vi: "Tôi chuyển hóa sự phức tạp thành những trải nghiệm tất yếu."
    },
    theme: {
      stroke1: "#315cff", // blue
      stroke2: "#f2f0e9", // white (matches #about bg)
      text: "#070707" // black text
    }
  },
  {
    id: "work",
    index: 3,
    label: {
      en: "03 / SELECTED OPERATIONS",
      vi: "03 / DỰ ÁN TIÊU BIỂU"
    },
    title: {
      en: "CREATIVE SYSTEMS",
      vi: "HỆ THỐNG SÁNG TẠO"
    },
    desc: {
      en: "Expressive digital systems built with engineering rigor.",
      vi: "Các hệ sinh thái kỹ thuật số được xây dựng chặt chẽ."
    },
    theme: {
      stroke1: "#d9ff43", // acid
      stroke2: "#070707", // black (matches #work bg)
      text: "#f2f0e9" // white text
    }
  },
  {
    id: "lab",
    index: 4,
    label: {
      en: "04 / EXPERIMENTAL LAB",
      vi: "04 / THỬ NGHIỆM SÁNG TẠO"
    },
    title: {
      en: "INTERACTIVE SANDBOX",
      vi: "HỘP CÁT TƯƠNG TÁC"
    },
    desc: {
      en: "Move fast. Leave traces. Physics simulation playground.",
      vi: "Di chuyển nhanh. Để lại dấu vết. Sân chơi mô phỏng vật lý."
    },
    theme: {
      stroke1: "#d9ff43", // acid
      stroke2: "#315cff", // blue (matches #lab bg)
      text: "#f2f0e9" // white text
    }
  },
  {
    id: "archive",
    index: 5,
    label: {
      en: "05 / CAPABILITY ARCHIVE",
      vi: "05 / KHO NĂNG LỰC"
    },
    title: {
      en: "VISUAL SYSTEMS & TECH",
      vi: "HỆ THỐNG THỊ GIÁC & CÔNG NGHỆ"
    },
    desc: {
      en: "Tools are temporary. Thinking is permanent.",
      vi: "Công cụ là nhất thời. Tư duy là vĩnh cửu."
    },
    theme: {
      stroke1: "#315cff", // blue
      stroke2: "#f2f0e9", // white (matches .archive bg)
      text: "#070707" // black text
    }
  },
  {
    id: "contact",
    index: 6,
    label: {
      en: "06 / OPEN CHANNEL",
      vi: "06 / KÊNH KẾT NỐI MỞ"
    },
    title: {
      en: "LET'S CREATE THE UNEXPECTED",
      vi: "HÃY CÙNG SÁNG TẠO"
    },
    desc: {
      en: "Get in touch for collaborations and opportunities.",
      vi: "Liên hệ hợp tác và phát triển cơ hội mới."
    },
    theme: {
      stroke1: "#d9ff43", // acid
      stroke2: "#ff4d2e", // red (matches #contact bg)
      text: "#070707" // black text
    }
  }
];

export default class ChapterTransition {
  constructor() {
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.overlay = document.getElementById("chapter-transition-overlay");
    this.labelEl = document.getElementById("transition-label");
    this.titleEl = document.getElementById("transition-title");
    this.descEl = document.getElementById("transition-desc");
    this.currentEl = document.getElementById("transition-current");
    this.content = this.overlay?.querySelector(".chapter-transition-content");
    this.panels = Array.from(this.overlay?.querySelectorAll(".chapter-transition-shutters i") || []);

    this.activeSectionId = null;
    this.currentLang = localStorage.getItem("mp-portfolio-lang") || "en";

    this.init();
  }

  init() {
    if (!this.overlay || !this.content || !this.panels.length || this.reduceMotion) return;

    gsap.set(this.panels, { scaleY: 0 });
    gsap.set(this.content, { opacity: 0 });

    document.addEventListener("langchanged", () => {
      this.currentLang = localStorage.getItem("mp-portfolio-lang") || "en";
      if (this.activeSectionId) {
        const sect = transitions.find((s) => s.id === this.activeSectionId);
        if (sect) this.updateText(sect);
      }
    });

    transitions.forEach((sect) => {
      const triggerEl = document.getElementById(sect.id);
      if (!triggerEl) return;

      const updateThemeAndText = () => {
        this.activeSectionId = sect.id;
        this.updateText(sect);
        this.overlay.style.setProperty("--transition-accent", sect.theme.stroke1);
        this.overlay.style.setProperty("--transition-panel", sect.theme.stroke2);
        this.overlay.style.setProperty("--transition-text-color", sect.theme.text);
      };

      const tl = gsap.timeline({ paused: true });
      tl
        .set(this.panels, {
          scaleY: 0,
          transformOrigin: (index) => index % 2 === 0 ? "top" : "bottom"
        }, 0)
        .to(this.panels, {
          scaleY: 1,
          duration: 0.34,
          stagger: { each: 0.018, from: "edges" },
          ease: "power4.inOut"
        }, 0)
        .to(this.content, { opacity: 1, duration: 0.06 }, 0.2)
        .fromTo(this.labelEl,
          { opacity: 0, yPercent: 120 },
          { opacity: 1, yPercent: 0, duration: 0.22, ease: "power3.out" },
          0.21
        )
        .fromTo(this.titleEl,
          { opacity: 0, yPercent: 38, scaleX: 0.94 },
          { opacity: 1, yPercent: 0, scaleX: 1, duration: 0.3, ease: "expo.out" },
          0.22
        )
        .fromTo([this.descEl, ".chapter-transition-progress"],
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.22, stagger: 0.03, ease: "power3.out" },
          0.29
        )
        .to([this.labelEl, this.titleEl, this.descEl, ".chapter-transition-progress"], {
          opacity: 0,
          y: -18,
          duration: 0.16,
          ease: "power2.in"
        }, 0.58)
        .set(this.panels, {
          transformOrigin: (index) => index % 2 === 0 ? "bottom" : "top"
        }, 0.6)
        .to(this.panels, {
          scaleY: 0,
          duration: 0.34,
          stagger: { each: 0.018, from: "center" },
          ease: "power4.inOut"
        }, 0.6)
        .set(this.content, { opacity: 0 }, 0.94)
        .set(this.overlay, { visibility: "hidden" }, 0.98);

      ScrollTrigger.create({
        trigger: triggerEl,
        start: "top 92%",
        end: "top 8%",
        scrub: 0.55,
        animation: tl,
        onEnter: () => {
          updateThemeAndText();
          gsap.set(this.overlay, { visibility: "visible" });
        },
        onEnterBack: () => {
          updateThemeAndText();
          gsap.set(this.overlay, { visibility: "visible" });
        },
        onLeave: () => gsap.set(this.overlay, { visibility: "hidden" }),
        onLeaveBack: () => gsap.set(this.overlay, { visibility: "hidden" }),
        invalidateOnRefresh: true
      });
    });
  }

  updateText(sect) {
    if (this.labelEl) this.labelEl.textContent = sect.label[this.currentLang];
    if (this.titleEl) this.titleEl.textContent = sect.title[this.currentLang];
    if (this.descEl) this.descEl.textContent = sect.desc[this.currentLang];
    if (this.currentEl) this.currentEl.textContent = String(sect.index).padStart(2, "0");
  }
}
