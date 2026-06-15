const THEME_KEY   = 'portfolio-theme';
const THEMES      = { DARK: 'dark', LIGHT: 'light' };

const ThemeManager = {
  get current() {
    return document.documentElement.getAttribute('data-theme') || THEMES.DARK;
  },

  init() {
    this._applyTheme(this.current, false);
    this._bindToggle();
    this._watchSystemPreference();
  },

  toggle() {
    const next = this.current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    this._applyTheme(next, true);
    localStorage.setItem(THEME_KEY, next);
  },

  _applyTheme(theme, animate) {
    const html = document.documentElement;

    if (animate) {
      html.classList.add('theme-transitioning');
      setTimeout(() => html.classList.remove('theme-transitioning'), 400);
    }

    html.setAttribute('data-theme', theme);
    this._updateIcon(theme);
    this._updateParticles(theme);

    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  },

  _updateIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;

    icon.style.transform = 'rotate(360deg) scale(0)';
    icon.style.transition = 'transform 0.3s ease';

    setTimeout(() => {
      icon.className = theme === THEMES.DARK ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
      icon.style.transform = 'rotate(0deg) scale(1)';
    }, 150);
  },

  _updateParticles(theme) {
    if (window._particles) {
      // Color fetch happens automatically per frame
    }
  },

  _bindToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => this.toggle());
  },

  _watchSystemPreference() {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', (e) => {
      if (!localStorage.getItem(THEME_KEY)) {
        this._applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT, true);
      }
    });
  },
};

document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
window.ThemeManager = ThemeManager;
