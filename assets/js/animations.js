document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initNavbarScroll();
  initBackToTop();
  initActiveNavLink();
  initHamburger();
  initSkillTabs();
  initProjectFilter();
  initScrollParallax();
  initPointerAccent();
});

function initScrollReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.counter[data-target]').forEach(animateCounter);
      entry.target.querySelectorAll('.skill-bar-fill[data-width]').forEach((bar) => {
        window.setTimeout(() => { bar.style.width = `${bar.dataset.width}%`; }, 160);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  window.revealObserver = observer;
  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
}

function animateCounter(el) {
  if (el.dataset.animated === 'true') return;
  el.dataset.animated = 'true';
  const target = Number.parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '+';
  const start = performance.now();
  const duration = 1100;

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = `${Math.floor(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const update = () => navbar.classList.toggle('scrolled', window.scrollY > 24);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

function initActiveNavLink() {
  const links = [...document.querySelectorAll('.nav-link')];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: '-42% 0px -48% 0px' });
  document.querySelectorAll('section[id]').forEach((section) => observer.observe(section));
}

function initBackToTop() {
  const button = document.getElementById('back-to-top');
  if (!button) return;
  const update = () => button.classList.toggle('visible', window.scrollY > 700);
  window.addEventListener('scroll', update, { passive: true });
  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initHamburger() {
  const button = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!button || !menu || button.dataset.bound === 'true') return;
  button.dataset.bound = 'true';

  const setOpen = (open) => {
    button.classList.toggle('active', open);
    menu.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.setAttribute('aria-hidden', String(!open));
  };

  button.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });
}

function initProjectFilter() {
  document.querySelectorAll('.filter-btn').forEach((button) => {
    if (button.dataset.bound === 'true') return;
    button.dataset.bound = 'true';
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;

      document.querySelectorAll('.project-card').forEach((card) => {
        const visible = filter === 'all' || card.dataset.category === filter;
        card.toggleAttribute('data-hidden', !visible);
      });
    });
  });
}

function initSkillTabs() {
  document.querySelectorAll('.tab[data-tab]').forEach((tab) => {
    if (tab.dataset.bound === 'true') return;
    tab.dataset.bound = 'true';
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab[data-tab]').forEach((item) => {
        const selected = item === tab;
        item.classList.toggle('active', selected);
        item.setAttribute('aria-selected', String(selected));
      });
      window.renderSkills?.(tab.dataset.tab);
    });
  });
}

function initScrollParallax() {
  const image = document.querySelector('.about-image img');
  if (!image || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let frame = null;
  const update = () => {
    frame = null;
    const rect = image.parentElement.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, 1 - rect.top / window.innerHeight));
    image.style.setProperty('--parallax-y', `${-14 + progress * 10}%`);
  };
  window.addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(update);
  }, { passive: true });
  update();
}

function initPointerAccent() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  const portrait = document.querySelector('.hero-portrait');
  if (!portrait) return;
  window.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 8;
    const y = (event.clientY / window.innerHeight - 0.5) * 8;
    portrait.style.translate = `${x}px ${y}px`;
  }, { passive: true });
}

window.PortfolioAnimations = { initProjectFilter, initSkillTabs, animateCounter };
