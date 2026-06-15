const TRANSLATIONS = {
  vi: {
    meta: { title: 'Minh Phuong — Portfolio Lập Trình Viên', description: 'Portfolio cá nhân của Minh Phương — Lập trình viên Full-Stack với niềm đam mê tạo ra các ứng dụng web hiện đại.' },
    nav: { about: 'Giới Thiệu', skills: 'Kỹ Năng', projects: 'Dự Án', timeline: 'Lộ Trình', contact: 'Liên Hệ', top: 'Lên Đầu Trang' },
    hero: { greeting: 'Xin chào, tôi là', rolePrefix: 'Tôi là một ', roles: ['Lập Trình Viên Full-Stack', 'Nhà Thiết Kế UI/UX', 'Kỹ Sư Backend'], bio: 'Đam mê xây dựng các ứng dụng web hiện đại với trải nghiệm người dùng tốt nhất và kiến trúc hệ thống vững chắc.', cta: { work: 'Xem Dự Án', contact: 'Liên Hệ Ngay' }, scroll: 'Cuộn xuống' },
    about: { tag: '// về tôi', title: 'Về Tôi', para1: 'Lập trình viên Full-Stack với tinh thần học hỏi cao. Tôi có kinh nghiệm làm việc từ thiết kế giao diện người dùng cho đến triển khai hệ thống backend.', para2: 'Đam mê thiết kế trải nghiệm người dùng đẹp và hiệu suất cao. Luôn cập nhật công nghệ mới và áp dụng các best practices trong mọi dự án.', download: 'Tải CV', stat: { projects: 'Dự Án', years: 'Năm KN', clients: 'Khách Hàng' } },
    skills: { tag: '// công nghệ', title: 'Kỹ Năng', tab: { frontend: 'Frontend', backend: 'Backend', devops: 'DevOps', tools: 'Công Cụ' }, level: { expert: 'Thành thạo', advanced: 'Nâng cao', intermediate: 'Trung bình', beginner: 'Cơ bản' } },
    projects: { tag: '// công việc của tôi', title: 'Dự Án', filter: { all: 'Tất Cả', web: 'Web App', mobile: 'Mobile', backend: 'Backend' }, labels: { demo: 'Xem Demo', source: 'Mã Nguồn' }, featured: 'Nổi Bật' },
    timeline: { tag: '// lộ trình', title: 'Lộ Trình Sự Nghiệp', present: 'Hiện Tại' },
    contact: { tag: '// liên hệ', title: 'Liên Hệ', location: 'TP Hồ Chí Minh, Việt Nam', form: { name: 'Họ và Tên', email: 'Địa Chỉ Email', message: 'Tin Nhắn', send: 'Gửi Tin Nhắn', sending: 'Đang Gửi...', success: '✅ Tin nhắn đã được gửi thành công!', error: '❌ Gửi thất bại. Vui lòng thử lại.', required: 'Vui lòng điền đầy đủ thông tin.', invalidEmail: 'Email không hợp lệ.' } },
    footer: { made: 'Được tạo với', by: 'bởi' },
  },
  en: {
    meta: { title: 'Minh Phuong — Developer Portfolio', description: 'Personal portfolio of Minh Phuong — Full-Stack Developer passionate about building modern web applications.' },
    nav: { about: 'About', skills: 'Skills', projects: 'Projects', timeline: 'Journey', contact: 'Contact', top: 'Back to Top' },
    hero: { greeting: "Hi, I'm", rolePrefix: 'I am a ', roles: ['Full-Stack Developer', 'UI/UX Designer', 'Backend Engineer'], bio: 'Passionate about building modern web applications with outstanding user experience and robust system architecture.', cta: { work: 'View My Work', contact: 'Get In Touch' }, scroll: 'Scroll down' },
    about: { tag: '// about me', title: 'About Me', para1: 'I am a Full-Stack Developer with over 1 years of experience building modern web applications. I work across the stack, from beautiful UIs to complex backend systems.', para2: "I'm passionate about crafting high-performance user experiences and staying on the cutting edge of web technology.", download: 'Download CV', stat: { projects: 'Projects', years: 'Yrs Exp', clients: 'Clients' } },
    skills: { tag: '// tech stack', title: 'Skills', tab: { frontend: 'Frontend', backend: 'Backend', devops: 'DevOps', tools: 'Tools' }, level: { expert: 'Expert', advanced: 'Advanced', intermediate: 'Intermediate', beginner: 'Beginner' } },
    projects: { tag: '// my work', title: 'Projects', filter: { all: 'All', web: 'Web App', mobile: 'Mobile', backend: 'Backend' }, labels: { demo: 'Live Demo', source: 'Source Code' }, featured: 'Featured' },
    timeline: { tag: '// journey', title: 'Career Journey', present: 'Present' },
    contact: { tag: '// get in touch', title: 'Contact', location: 'Ho Chi Minh city, Vietnam', form: { name: 'Full Name', email: 'Email Address', message: 'Message', send: 'Send Message', sending: 'Sending...', success: '✅ Message sent successfully!', error: '❌ Failed to send. Please try again.', required: 'Please fill in all fields.', invalidEmail: 'Invalid email address.' } },
    footer: { made: 'Made with', by: 'by' },
  },
};

const I18N_KEY = 'portfolio-lang';
const DEFAULT_LANG = 'vi';

const i18n = {
  lang: DEFAULT_LANG,

  init() {
    this.lang = localStorage.getItem(I18N_KEY) || DEFAULT_LANG;
    this.apply(this.lang, false);
    this._bindToggle();
  },

  t(key, vars = {}) {
    const keys = key.split('.');
    let value = TRANSLATIONS[this.lang];
    for (const k of keys) {
      if (value === undefined) return key;
      value = value[k];
    }
    if (typeof value !== 'string') return key;
    return value.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? `{${name}}`);
  },

  apply(lang, save = true) {
    if (!TRANSLATIONS[lang]) return;
    this.lang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (el.placeholder !== undefined && el.tagName !== 'LABEL') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    });

    const titleKey = this.t('meta.title');
    if (titleKey !== 'meta.title') document.title = titleKey;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = this.t('meta.description');

    this._updateToggleUI(lang);

    if (window.initTypewriter) window.initTypewriter(lang);
    if (window.rerenderDynamicContent) window.rerenderDynamicContent(lang);

    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
    if (save) localStorage.setItem(I18N_KEY, lang);
  },

  toggle() {
    const next = this.lang === 'vi' ? 'en' : 'vi';
    this.apply(next);
  },

  _updateToggleUI(lang) {
    const btn = document.getElementById('lang-toggle');
    if (!btn) return;
    const flag = btn.querySelector('.lang-flag');
    const label = btn.querySelector('.lang-label');
    if (flag) flag.textContent = lang.toUpperCase();
    if (label) label.textContent = lang === 'vi' ? 'EN' : 'VI';

    btn.style.transform = 'scale(0.85)';
    btn.style.transition = 'transform 0.15s ease';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
  },

  _bindToggle() {
    const btn = document.getElementById('lang-toggle');
    if (btn) btn.addEventListener('click', () => this.toggle());
  },
};

document.addEventListener('DOMContentLoaded', () => i18n.init());
window.i18n = i18n;
window.t = (key, vars) => i18n.t(key, vars);
