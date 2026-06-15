class Typewriter {
  constructor(elementId, strings, options = {}) {
    this.el = document.getElementById(elementId);
    this.strings = strings;
    this.speed = options.typeSpeed ?? 90;
    this.erase = options.eraseSpeed ?? 50;
    this.pause = options.pauseMs ?? 2000;
    this.index = 0;
    this.charIdx = 0;
    this.deleting = false;
    this.timeout = null;
    this.running = true;
    this.run();
  }

  run() {
    if (!this.el || !this.running) return;

    const current = this.strings[this.index];

    if (!this.deleting) {
      this.el.textContent = current.substring(0, this.charIdx + 1);
      this.charIdx++;

      if (this.charIdx === current.length) {
        this.timeout = setTimeout(() => {
          if (this.running) {
            this.deleting = true;
            this.run();
          }
        }, this.pause);
        return;
      }
    } else {
      this.el.textContent = current.substring(0, this.charIdx - 1);
      this.charIdx--;

      if (this.charIdx === 0) {
        this.deleting = false;
        this.index = (this.index + 1) % this.strings.length;
      }
    }

    this.timeout = setTimeout(() => {
      if (this.running) this.run();
    }, this.deleting ? this.erase : this.speed);
  }

  stop() {
    this.running = false;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

function initTypewriter(lang = 'en') {
  const strings = {
    vi: ['Lập Trình Viên Full-Stack', 'Nhà Thiết Kế UI/UX', 'Kỹ Sư Backend'],
    en: ['Full-Stack Developer', 'UI/UX Designer', 'Backend Engineer'],
  };

  if (window._typewriter) {
    window._typewriter.stop();
  }

  const targetEl = document.getElementById('typewriter');
  if (targetEl) targetEl.textContent = "";

  window._typewriter = new Typewriter('typewriter', strings[lang] ?? strings.en);
}

window.initTypewriter = initTypewriter;

document.addEventListener('DOMContentLoaded', () => {
  const lang = localStorage.getItem('portfolio-lang') || 'en';
  initTypewriter(lang);
});
