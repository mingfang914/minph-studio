const PROJECTS = [
  {
    id: 'exlms', category: 'web', image: 'assets/images/projects/exlms.png',
    tags: ['Spring Boot', 'React', 'GitHub Actions', 'Docker', 'MySQL'],
    github: 'https://github.com/mingfang914/ExLMS-SpringBootProject', demo: 'https://projectmf.id.vn', featured: true,
    title: { vi: 'ExLMS - Hệ thống học tập trực tuyến', en: 'ExLMS - Online Learning Management System' },
    desc: {
      vi: 'Nền tảng học trực tuyến toàn diện với video call, bài tập trực tuyến, và quản lý khóa học.',
      en: 'A comprehensive online learning platform with video calls, online assignments, and course management.'
    }
  },
  {
    id: 'itexam', category: 'web', image: 'assets/images/projects/itexam.png',
    tags: ['ASP.NET Core', 'Razor Pages', 'Jenkins', 'Docker', 'SQL Server'],
    github: 'https://github.com/nguyenAnh132/ITEXAM_HUTECH', demo: 'https://itexam.nvtanh.id.vn', featured: true,
    title: { vi: 'ITExam - Hệ thống thi trực tuyến', en: 'ITExam - Online Examination System' },
    desc: {
      vi: 'Hệ thống quản lý thi trực tuyến giúp giảng viên tạo đề thi, quản lý ngân hàng câu hỏi và giám sát sinh viên trong quá trình thi.',
      en: 'An online examination management system that helps lecturers create exams, manage question banks, and monitor students during online tests.'
    }
  },
  {
    id: 'portfolio', category: 'web', image: 'assets/images/projects/portfolio.png',
    tags: ['HTML', 'CSS', 'JavaScript', 'Glassmorphism'],
    github: '#', demo: '#', featured: false,
    title: { vi: 'Portfolio Cá Nhân', en: 'Personal Portfolio' },
    desc: {
      vi: 'Portfolio cá nhân với thiết kế glassmorphism, hiệu ứng particle, đa ngôn ngữ VI/EN.',
      en: 'Personal portfolio with glassmorphism design, particle effects, and bilingual support.'
    }
  }
];

const SKILLS = {
  frontend: [
    { icon: '<i class="fa-brands fa-react" style="color: #61DAFB"></i>', name: 'React JS', level: 90, levelKey: 'expert' },
    { icon: '<i class="fa-brands fa-js" style="color: #F7DF1E"></i>', name: 'JavaScript', level: 88, levelKey: 'expert' },
    { icon: '<i class="fa-brands fa-html5" style="color: #E34F26"></i>', name: 'HTML5', level: 95, levelKey: 'expert' },
    { icon: '<i class="fa-brands fa-css3-alt" style="color: #1572B6"></i>', name: 'CSS3', level: 92, levelKey: 'expert' }
  ],
  backend: [
    { icon: '<i class="fa-solid fa-leaf" style="color: #6DB33F"></i>', name: 'Spring Boot', level: 85, levelKey: 'advanced' },
    { icon: '<i class="fa-solid fa-terminal" style="color: #512BD4"></i>', name: '.NET Core', level: 80, levelKey: 'advanced' },
    { icon: '<i class="fa-brands fa-node-js" style="color: #339933"></i>', name: 'Node JS', level: 75, levelKey: 'advanced' },
    { icon: '<i class="fa-solid fa-database" style="color: #4479A1"></i>', name: 'MySQL', level: 82, levelKey: 'advanced' },
    { icon: '<i class="fa-solid fa-server" style="color: #CC2927"></i>', name: 'SQL Server', level: 78, levelKey: 'advanced' }
  ],
  devops: [
    { icon: '<i class="fa-brands fa-docker" style="color: #2496ED"></i>', name: 'Docker', level: 80, levelKey: 'advanced' },
    { icon: '<i class="fa-solid fa-cloud" style="color: #FF9900"></i>', name: 'AWS', level: 65, levelKey: 'intermediate' }
  ],
  tools: [
    { icon: '<i class="fa-brands fa-jira" style="color: #0052CC"></i>', name: 'Jira', level: 85, levelKey: 'advanced' },
    { icon: '<i class="fa-brands fa-figma" style="color: #F24E1E"></i>', name: 'Figma', level: 75, levelKey: 'advanced' },
    { icon: '<i class="fa-brands fa-github" style="color: #f0f6fc"></i>', name: 'GitHub', level: 92, levelKey: 'expert' }
  ]
};

const TIMELINE = [
  {
    year: '2026 — Present', icon: '💼',
    title: { vi: 'Lập Trình Viên Full-Stack', en: 'Full-Stack Developer' },
    org: { vi: 'Công Ty Công Nghệ', en: 'Tech Company' },
    desc: {
      vi: 'Phát triển và duy trì các ứng dụng web quy mô lớn sử dụng Spring Boot và React.',
      en: 'Developing and maintaining large-scale web applications using Spring Boot and React.'
    }
  },
  {
    year: '2022 — 2026', icon: '🎓',
    title: { vi: 'Kỹ sư CNTT', en: 'Bachelor of Engineering in Information Technology' },
    org: { vi: 'Trường Đại học Công nghệ Thành phố Hồ Chí Minh', en: 'Ho Chi Minh City University of Technology' },
    desc: {
      vi: 'Tốt nghiệp loại Giỏi. Chuyên ngành Công Nghệ Phần Mềm.',
      en: 'Graduated with Distinction. Specialization in Software Engineering.'
    }
  }
];

function renderProjects(lang) {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = PROJECTS.map((p, index) => `
    <article class="project-card reveal" data-category="${p.category}" data-index="${String(index + 1).padStart(2, '0')}">
      <div class="project-thumbnail-wrap" style="overflow:hidden">
        <img src="${p.image}" alt="${p.title[lang]}" class="project-thumbnail" loading="lazy" />
      </div>
      <div class="project-body">
        ${p.featured ? `<span class="project-badge">${window.t('projects.featured')}</span>` : ''}
        <div class="project-tags">
          ${p.tags.map((tag) => `<span class="project-tag">${tag}</span>`).join('')}
        </div>
        <h3 class="project-title">${p.title[lang]}</h3>
        <p class="project-desc">${p.desc[lang]}</p>
        <div class="project-links">
          <a href="${p.demo}" target="_blank" rel="noopener" class="project-link" aria-label="${window.t('projects.labels.demo')}: ${p.title[lang]}">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
            ${window.t('projects.labels.demo')}
          </a>
          <a href="${p.github}" target="_blank" rel="noopener" class="project-link" aria-label="${window.t('projects.labels.source')}: ${p.title[lang]}">
            <i class="fa-brands fa-github"></i>
            ${window.t('projects.labels.source')}
          </a>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('#projects-grid .reveal').forEach((el) => {
    if (window.revealObserver) window.revealObserver.observe(el);
  });
  if (window.PortfolioAnimations) window.PortfolioAnimations.initProjectFilter();
}

function renderSkills(category = 'frontend') {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  const skills = SKILLS[category] || [];
  grid.style.opacity = '0';
  grid.style.transform = 'translateY(10px)';

  setTimeout(() => {
    grid.innerHTML = skills.map((s) => `
      <div class="skill-card reveal">
        <span class="skill-icon">${s.icon}</span>
        <div class="skill-name">${s.name}</div>
        <div class="skill-level">${window.t('skills.level.' + s.levelKey)}</div>
        <div class="skill-bar">
          <div class="skill-bar-fill" data-width="${s.level}" style="width:0"></div>
        </div>
      </div>
    `).join('');

    grid.style.transition = 'opacity 0.3s, transform 0.3s';
    grid.style.opacity = '1';
    grid.style.transform = 'translateY(0)';

    grid.querySelectorAll('.skill-bar-fill').forEach((bar) => {
      setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, 200);
    });

    // Re-observe new reveal elements
    grid.querySelectorAll('.reveal').forEach((el) => {
      if (window.revealObserver) window.revealObserver.observe(el);
    });
  }, 150);
}

function renderTimeline(lang) {
  const list = document.getElementById('timeline-list');
  if (!list) return;

  list.innerHTML = TIMELINE.map((item) => `
    <div class="timeline-item reveal">
      <div class="timeline-dot"></div>
      <div class="timeline-content glass">
        <div class="timeline-meta">
          <span class="timeline-icon">${item.icon}</span>
          <span class="timeline-year">${item.year}</span>
        </div>
        <h3 class="timeline-title">${item.title[lang]}</h3>
        <p class="timeline-org">${item.org[lang]}</p>
        <p class="timeline-desc">${item.desc[lang]}</p>
      </div>
    </div>
  `).join('');

  // Observe new elements
  document.querySelectorAll('#timeline-list .reveal').forEach((el) => {
    if (window.revealObserver) window.revealObserver.observe(el);
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.querySelector('#contact-name');
    const email = form.querySelector('#contact-email');
    const message = form.querySelector('#contact-message');
    const submit = form.querySelector('#form-submit');

    [name, email, message].forEach((el) => el.classList.remove('error'));
    let valid = true;

    if (!name.value.trim()) { name.classList.add('error'); valid = false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { email.classList.add('error'); valid = false; }
    if (!message.value.trim()) { message.classList.add('error'); valid = false; }

    if (!valid) {
      showToast(window.t('contact.form.required') || 'Please fill all fields.', 'error');
      form.querySelector('.error')?.focus();
      return;
    }

    const submitText = submit.querySelector('span');
    submitText.textContent = window.t('contact.form.sending') || 'Sending...';
    submit.disabled = true;

    try {
      await new Promise((r) => setTimeout(r, 1500));
      showToast(window.t('contact.form.success') || '✅ Sent!', 'success');
      form.reset();
    } catch {
      showToast(window.t('contact.form.error') || '❌ Failed.', 'error');
    } finally {
      submitText.textContent = window.t('contact.form.send') || 'Send';
      submit.disabled = false;
    }
  });
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 4000);
}

document.addEventListener('DOMContentLoaded', () => {
  const lang = window.i18n?.lang || localStorage.getItem('portfolio-lang') || 'vi';
  renderProjects(lang);
  renderSkills('frontend');
  renderTimeline(lang);

  if (window.PortfolioAnimations) {
    window.PortfolioAnimations.initSkillTabs();
    window.PortfolioAnimations.initProjectFilter();
  }
  initContactForm();

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

window.rerenderDynamicContent = function (lang) {
  renderProjects(lang);
  const activeTab = document.querySelector('.tab.active')?.dataset.tab || 'frontend';
  renderSkills(activeTab);
  renderTimeline(lang);
};
window.renderSkills = renderSkills;
