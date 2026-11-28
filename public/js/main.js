/**
 * Maynard Nay-osan — Portfolio Main Interactivity & 4-Page Router
 *
 * Features:
 * - 4-Page Fixed-Screen Router (Homepage, Personal Info, Achievements, Family and Friends)
 * - Zero outer page scroll on desktop; smooth in-place section transitions
 * - Previous / Continue directional buttons & 01 / 02 / 03 / 04 numbered page indicators
 * - Keyboard navigation (Left / Right Arrow keys clamped to the 4 pages)
 * - Personal Info section filter (Personal Profile / More About Me / Skills & Knowledge)
 * - Temporary passcode gate on Family and Friends
 * - Theme management (Dark / Light with localStorage persistence)
 * - Ambient floating dust particles canvas (#dust-canvas)
 */

(function () {
  'use strict';

  // Exact Four-Page Configuration
  const SECTIONS = ['home', 'personal-info', 'achievements', 'family-friends'];
  const SECTION_ALIASES = {
    about: 'personal-info',
    education: 'achievements',
    family: 'family-friends',
    friends: 'family-friends',
  };
  let currentSectionIndex = 0;
  let lastPublicSection = 'home';
  let syncFriendsSlideshowPlayback = null;
  let syncFamilyGateView = null;

  // DOM Elements
  const html = document.documentElement;
  const navItems = document.querySelectorAll('.nav-item');
  const sectionViews = document.querySelectorAll('.section-view');
  const footerPageIndicator = document.getElementById('footer-page-indicator');
  const btnPrev = document.getElementById('btn-prev');
  const btnContinue = document.getElementById('btn-continue');
  const pageNumBtns = document.querySelectorAll('.page-num-btn');
  const themeToggleBtn = document.getElementById('theme-toggle');

  // ==========================================
  // 1. Fixed-Screen 4-Page Section Switcher
  // ==========================================
  function showSection(rawSectionId, updateHash = true) {
    const sectionId = SECTION_ALIASES[rawSectionId] || rawSectionId;
    const index = SECTIONS.indexOf(sectionId);
    if (index === -1) return;

    currentSectionIndex = index;
    if (sectionId !== 'family-friends') {
      lastPublicSection = sectionId;
    }

    // Update Section Views
    sectionViews.forEach((view) => {
      if (view.id === `view-${sectionId}`) {
        view.classList.add('active');
      } else {
        view.classList.remove('active');
      }
    });

    // Update Top Nav Item States
    navItems.forEach((item) => {
      const link = item.querySelector('a');
      if (link && link.getAttribute('data-target') === sectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Numbered Page Buttons (01, 02, 03, 04)
    pageNumBtns.forEach((btn) => {
      const target = btn.getAttribute('data-go-section');
      const isActive = target === sectionId;
      btn.classList.toggle('active', isActive);
      if (isActive) {
        btn.setAttribute('aria-current', 'page');
      } else {
        btn.removeAttribute('aria-current');
      }
    });

    // Update Page Counter (01 / 04 .. 04 / 04)
    if (footerPageIndicator) {
      const currentFormatted = String(index + 1).padStart(2, '0');
      const totalFormatted = String(SECTIONS.length).padStart(2, '0');
      footerPageIndicator.textContent = `${currentFormatted} / ${totalFormatted}`;
    }

    // Disable Previous on Page 01, Disable Continue on Page 04
    if (btnPrev) {
      const isFirst = index === 0;
      btnPrev.disabled = isFirst;
      btnPrev.setAttribute('aria-disabled', String(isFirst));
    }

    if (btnContinue) {
      const isLast = index === SECTIONS.length - 1;
      btnContinue.disabled = isLast;
      btnContinue.setAttribute('aria-disabled', String(isLast));
    }

    // Update Hash without jumping
    if (updateHash && window.location.hash !== `#${sectionId}`) {
      history.pushState(null, '', `#${sectionId}`);
    }

    if (typeof syncFamilyGateView === 'function') {
      syncFamilyGateView(sectionId === 'family-friends');
    }

    if (typeof syncFriendsSlideshowPlayback === 'function') {
      syncFriendsSlideshowPlayback();
    }
  }

  function nextSection() {
    if (currentSectionIndex < SECTIONS.length - 1) {
      showSection(SECTIONS[currentSectionIndex + 1]);
    }
  }

  function prevSection() {
    if (currentSectionIndex > 0) {
      showSection(SECTIONS[currentSectionIndex - 1]);
    }
  }

  // Nav Links click listener
  navItems.forEach((item) => {
    const link = item.querySelector('a');
    if (link) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-target');
        if (target) showSection(target);
      });
    }
  });

  // Footer Previous & Continue buttons
  if (btnPrev) {
    btnPrev.addEventListener('click', prevSection);
  }

  if (btnContinue) {
    btnContinue.addEventListener('click', nextSection);
  }

  // Keyboard Navigation: Modals first, then Left & Right arrow keys (bounded to the 3 pages)
  window.addEventListener('keydown', (e) => {
    if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

    const portraitLightboxEl = document.getElementById('portrait-lightbox');
    const lightboxEl = document.getElementById('achievement-lightbox');
    const nc2El = document.getElementById('nc2-modal');

    if (portraitLightboxEl && portraitLightboxEl.classList.contains('open')) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePortraitLightbox();
      }
      return;
    }

    if (lightboxEl && lightboxEl.classList.contains('open')) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepLightbox(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepLightbox(-1);
      }
      return;
    }

    if (nc2El && nc2El.classList.contains('open')) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeNc2Modal();
      }
      return;
    }

    if (e.target && e.target.closest && e.target.closest('#friends-slideshow')) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepFriendsSlide(1);
        return;
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepFriendsSlide(-1);
        return;
      }
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSection();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSection();
    }
  });

  // Initial Section from URL Hash
  function initRoute() {
    const rawHash = window.location.hash.replace('#', '').toLowerCase();
    const resolved = SECTION_ALIASES[rawHash] || rawHash;
    if (SECTIONS.includes(resolved)) {
      showSection(resolved, false);
    } else {
      showSection('home', false);
    }
  }

  window.addEventListener('popstate', initRoute);
  window.addEventListener('hashchange', initRoute);

  // Hook in-page navigation links and numbered footer buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-go-section]');
    if (btn) {
      e.preventDefault();
      const rawSec = btn.getAttribute('data-go-section');
      const sec = SECTION_ALIASES[rawSec] || rawSec;
      if (sec && SECTIONS.includes(sec)) {
        showSection(sec);
      }
    }
  });

  // ==========================================
  // Personal Info Section Selector (3 Sections: Personal Profile / More About Me / Skills & Knowledge)
  // ==========================================
  const PI_SECTIONS = ['profile', 'bio', 'skills'];
  const piTabs = document.querySelectorAll('[data-pi-filter]');
  const piBlocks = document.querySelectorAll('[data-pi-section]');
  const piTabCounter = document.getElementById('pi-tab-counter');

  function selectPersonalInfoFilter(filterName) {
    const safeFilter = PI_SECTIONS.includes(filterName) ? filterName : 'profile';
    const sectionIndex = PI_SECTIONS.indexOf(safeFilter);

    piTabs.forEach((tab) => {
      const match = tab.getAttribute('data-pi-filter') === safeFilter;
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    piBlocks.forEach((block) => {
      const section = block.getAttribute('data-pi-section');
      block.classList.toggle('active', section === safeFilter);
    });

    if (piTabCounter) {
      const currentFormatted = String(sectionIndex + 1).padStart(2, '0');
      const totalFormatted = String(PI_SECTIONS.length).padStart(2, '0');
      piTabCounter.textContent = `${currentFormatted} / ${totalFormatted}`;
    }
  }

  piTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-pi-filter');
      if (target) selectPersonalInfoFilter(target);
    });
  });

  selectPersonalInfoFilter('profile');

  // ==========================================
  // Smaller-Screen Zero-Scroll Subsection Selectors
  // ==========================================
  function bindSubSelector(btnAttr, targetSelector, targetAttr, onChange) {
    const buttons = document.querySelectorAll(`[${btnAttr}]`);
    const container = document.querySelector(targetSelector);
    if (!buttons.length || !container) return;

    function activate(value) {
      container.setAttribute(targetAttr, value);
      buttons.forEach((btn) => {
        const match = btn.getAttribute(btnAttr) === value;
        btn.classList.toggle('active', match);
        btn.setAttribute('aria-selected', match ? 'true' : 'false');
      });
      if (typeof onChange === 'function') {
        onChange(value);
      }
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute(btnAttr);
        if (val) activate(val);
      });
    });
  }

  bindSubSelector('data-home-sub', '.home-grid', 'data-active-home-sub');
  bindSubSelector('data-pi-pane', '.about-grid', 'data-active-pi-pane');
  bindSubSelector('data-pp-sub', '.pp-dashboard', 'data-active-pp-sub');
  bindSubSelector('data-mam-sub', '.mam-dashboard', 'data-active-mam-sub');
  bindSubSelector('data-skills-sub', '.skills-panel-wrapper', 'data-active-skills-sub');
  bindSubSelector('data-ach-sub', '#achievements-track', 'data-active-ach-sub', (val) => {
    document.querySelectorAll('#achievements-track .archive-card[data-milestone]').forEach((card) => {
      card.classList.toggle('is-mob-active', card.getAttribute('data-milestone') === val);
    });
  });
  bindSubSelector('data-ff-sub', '.ff-split-grid', 'data-active-ff-sub', () => {
    if (typeof syncFriendsSlideshowPlayback === 'function') {
      syncFriendsSlideshowPlayback();
    }
  });

  // ==========================================
  // 2. Dual-Theme Management
  // ==========================================
  const THEME_KEY = 'mn-theme';

  function getSavedTheme() {
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch (e) {}
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  function applyTheme(theme, save = true) {
    html.setAttribute('data-theme', theme);
    if (save) {
      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch (e) {}
    }

    if (window.Smoke && typeof window.Smoke.setTheme === 'function') {
      window.Smoke.setTheme(theme === 'light');
    }

    if (themeToggleBtn) {
      const isLight = theme === 'light';
      themeToggleBtn.setAttribute('title', isLight ? 'Switch to Dark Gothic theme' : 'Switch to Light Scriptorium theme');
      themeToggleBtn.setAttribute('aria-label', isLight ? 'Switch to Dark Gothic theme' : 'Switch to Light Scriptorium theme');

      themeToggleBtn.innerHTML = isLight
        ? `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            <polygon points="15 4 16 6.5 18.5 7.5 16 8.5 15 11 14 8.5 11.5 7.5 14 6.5 15 4" fill="currentColor"/>
          </svg>`
        : `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="4.5"/>
            <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22"/>
            <path d="M4.93 4.93l1.8 1.8M17.27 17.27l1.8 1.8M4.93 19.07l1.8-1.8M17.27 6.73l1.8-1.8"/>
            <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
          </svg>`;
    }
  }

  const initialTheme = getSavedTheme();
  applyTheme(initialTheme, false);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
    });
  }

  // ==========================================
  // 3. Ambient Dust Motes Canvas (Lightweight Continuous Backdrop)
  // ==========================================
  const dustCanvas = document.getElementById('dust-canvas');
  if (dustCanvas) {
    const dctx = dustCanvas.getContext('2d', { alpha: true });
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let particles = [];
    let dustSprite = null;
    let dustSpriteTheme = null;
    let viewW = window.innerWidth;
    let viewH = window.innerHeight;

    function getTargetCount() {
      return window.innerWidth < 768 ? 24 : 42;
    }

    function createDustSprite(isLight) {
      const size = 32;
      const off = document.createElement('canvas');
      off.width = size;
      off.height = size;
      const g = off.getContext('2d');
      const grad = g.createRadialGradient(16, 16, 0.5, 16, 16, 15);

      if (isLight) {
        grad.addColorStop(0, 'rgba(146, 108, 56, 0.95)');
        grad.addColorStop(0.35, 'rgba(176, 134, 76, 0.45)');
        grad.addColorStop(1, 'rgba(176, 134, 76, 0)');
      } else {
        grad.addColorStop(0, 'rgba(235, 200, 142, 0.95)');
        grad.addColorStop(0.35, 'rgba(201, 164, 108, 0.42)');
        grad.addColorStop(1, 'rgba(201, 164, 108, 0)');
      }

      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      return off;
    }

    function resizeDust() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      dustCanvas.width = Math.floor(viewW * dpr);
      dustCanvas.height = Math.floor(viewH * dpr);
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      particles = [];
      const count = getTargetCount();
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * viewW,
          y: Math.random() * viewH,
          radius: Math.random() * 4.5 + 3.2,
          vx: (Math.random() - 0.5) * 0.14,
          vy: -(Math.random() * 0.24 + 0.08),
          swayAmp: Math.random() * 0.22 + 0.08,
          swayFreq: Math.random() * 0.6 + 0.35,
          phase: Math.random() * Math.PI * 2,
          alpha: Math.random() * 0.38 + 0.18,
          pulseSpeed: Math.random() * 0.9 + 0.5,
        });
      }
    }

    resizeDust();
    initParticles();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeDust();
        initParticles();
      }, 150);
    }, { passive: true });

    let rafId = null;
    let lastStamp = 0;

    function renderDust(now) {
      rafId = requestAnimationFrame(renderDust);
      const dt = lastStamp ? Math.min((now - lastStamp) / 1000, 0.05) : 0.016;
      lastStamp = now;

      dctx.clearRect(0, 0, viewW, viewH);

      const theme = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      if (!dustSprite || dustSpriteTheme !== theme) {
        dustSprite = createDustSprite(theme === 'light');
        dustSpriteTheme = theme;
      }

      const t = now * 0.001;
      const motionAllowed = !motionQuery.matches;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (motionAllowed) {
          const stepScale = dt * 60;
          p.x += (p.vx + Math.sin(t * p.swayFreq + p.phase) * p.swayAmp) * stepScale;
          p.y += p.vy * stepScale;

          if (p.y < -16) {
            p.y = viewH + 16;
            p.x = Math.random() * viewW;
          }
          if (p.x < -16) p.x = viewW + 16;
          if (p.x > viewW + 16) p.x = -16;
        }

        const twinkle = 0.62 + 0.38 * Math.sin(t * p.pulseSpeed + p.phase);
        dctx.globalAlpha = p.alpha * twinkle;
        const drawSize = p.radius * 2;
        dctx.drawImage(dustSprite, p.x - p.radius, p.y - p.radius, drawSize, drawSize);
      }

      dctx.globalAlpha = 1;
    }

    rafId = requestAnimationFrame(renderDust);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = null;
        lastStamp = 0;
      } else if (rafId === null) {
        lastStamp = 0;
        rafId = requestAnimationFrame(renderDust);
      }
    });
  }

  // ==========================================
  // 4. Page 03: Achievements Lightbox & TESDA NC II Modal
  // ==========================================
  const ACHIEVEMENT_EVIDENCE = [
    {
      src: 'assets/achievements/elementary-school.jpg',
      alt: 'Certificate of Elementary School Completion from Sadanga Central School dated April 3, 2020',
      kicker: '01 — ELEMENTARY EDUCATION',
      title: 'Certificate of Elementary School Completion',
      caption: 'Maynard K. Nay-osan · Sadanga Central School · Department of Education, Philippines · April 3, 2020',
    },
    {
      src: 'assets/achievements/junior-high-school.jpg',
      alt: 'Certificate of Junior High School Completion from Sadanga National Technical-Vocational & Skills Training High School dated May 29, 2024',
      kicker: '02 — JUNIOR HIGH SCHOOL (GRADES 7–10)',
      title: 'Certificate of Junior High School Completion',
      caption: 'Maynard K. Nay-osan · Sadanga National Tech-Voc & Skills Training High School · Department of Education, Philippines · May 29, 2024',
    },
    {
      src: 'assets/achievements/senior-high-school.jpg',
      alt: 'Senior High School Diploma in Academic Track HUMSS from Sadanga National Technical-Vocational & Skills Training High School dated March 31, 2026',
      kicker: '03 — SENIOR HIGH SCHOOL (GRADES 11–12)',
      title: 'Senior High School Diploma — Academic Track (HUMSS)',
      caption: 'Maynard K. Nay-osan · Sadanga National Tech-Voc & Skills Training High School · Department of Education, Philippines · March 31, 2026',
    },
    {
      src: 'assets/achievements/tesda-nc2.jpg',
      alt: 'TESDA National Certificate II in Carpentry issued March 10, 2026 and valid until March 9, 2031',
      kicker: '04 — NATIONAL CERTIFICATE II',
      title: 'TESDA National Certificate II — Carpentry',
      caption: 'Maynard K. Nay-osan · Technical Education and Skills Development Authority (TESDA) · Issued: March 10, 2026 · Valid Until: March 9, 2031',
    },
    {
      src: 'assets/achievements/uc-crest-dark.png',
      alt: 'University of the Cordilleras Official Seal (Est. 1946) on dark gothic backdrop',
      kicker: '05 — UNIVERSITY OF THE CORDILLERAS',
      title: 'University of the Cordilleras — Official University Seal',
      caption: 'Maynard K. Nay-osan · Bachelor of Science in Computer Science · First Year | AY 2026–2027 · Currently Enrolled',
    },
  ];

  const lightboxOverlay = document.getElementById('achievement-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxKicker = document.getElementById('lightbox-kicker');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCounter = document.getElementById('lightbox-counter');
  const lightboxCloseBtn = document.getElementById('lightbox-close');
  const lightboxPrevBtn = document.getElementById('lightbox-prev');
  const lightboxNextBtn = document.getElementById('lightbox-next');

  let currentLightboxIndex = 0;
  let lastFocusedBeforeModal = null;

  function renderLightbox(index) {
    const safeIdx = ((index % ACHIEVEMENT_EVIDENCE.length) + ACHIEVEMENT_EVIDENCE.length) % ACHIEVEMENT_EVIDENCE.length;
    currentLightboxIndex = safeIdx;
    const item = ACHIEVEMENT_EVIDENCE[safeIdx];

    if (lightboxImg) {
      lightboxImg.src = item.src;
      lightboxImg.alt = item.alt;
    }
    if (lightboxKicker) lightboxKicker.textContent = item.kicker;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${String(safeIdx + 1).padStart(2, '0')} / ${String(ACHIEVEMENT_EVIDENCE.length).padStart(2, '0')}`;
    }
  }

  function openLightbox(index) {
    if (!lightboxOverlay) return;
    lastFocusedBeforeModal = document.activeElement;
    renderLightbox(index);
    lightboxOverlay.classList.add('open');
    lightboxOverlay.setAttribute('aria-hidden', 'false');
    if (lightboxCloseBtn) lightboxCloseBtn.focus();
  }

  function closeLightbox() {
    if (!lightboxOverlay) return;
    lightboxOverlay.classList.remove('open');
    lightboxOverlay.setAttribute('aria-hidden', 'true');
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
      lastFocusedBeforeModal.focus();
    }
  }

  function stepLightbox(delta) {
    renderLightbox(currentLightboxIndex + delta);
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-lightbox-index]');
    if (trigger) {
      e.preventDefault();
      const idx = parseInt(trigger.getAttribute('data-lightbox-index') || '0', 10);
      openLightbox(Number.isNaN(idx) ? 0 : idx);
    }
  });

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', () => stepLightbox(-1));
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', () => stepLightbox(1));

  if (lightboxOverlay) {
    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay) closeLightbox();
    });
  }

  // NC II Qualification Details Modal
  const nc2ModalOverlay = document.getElementById('nc2-modal');
  const openNc2ModalBtn = document.getElementById('open-nc2-modal');
  const closeNc2ModalBtn = document.getElementById('nc2-modal-close');

  function openNc2Modal() {
    if (!nc2ModalOverlay) return;
    lastFocusedBeforeModal = document.activeElement;
    nc2ModalOverlay.classList.add('open');
    nc2ModalOverlay.setAttribute('aria-hidden', 'false');
    if (closeNc2ModalBtn) closeNc2ModalBtn.focus();
  }

  function closeNc2Modal() {
    if (!nc2ModalOverlay) return;
    nc2ModalOverlay.classList.remove('open');
    nc2ModalOverlay.setAttribute('aria-hidden', 'true');
    if (lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function') {
      lastFocusedBeforeModal.focus();
    }
  }

  if (openNc2ModalBtn) openNc2ModalBtn.addEventListener('click', openNc2Modal);
  if (closeNc2ModalBtn) closeNc2ModalBtn.addEventListener('click', closeNc2Modal);
  if (nc2ModalOverlay) {
    nc2ModalOverlay.addEventListener('click', (e) => {
      if (e.target === nc2ModalOverlay) closeNc2Modal();
    });
  }

  // Homepage Full-Body Portrait Lightbox
  const portraitLightboxOverlay = document.getElementById('portrait-lightbox');
  const openPortraitLightboxBtn = document.getElementById('open-portrait-lightbox');
  const closePortraitLightboxBtn = document.getElementById('portrait-lightbox-close');

  function openPortraitLightbox() {
    if (!portraitLightboxOverlay) return;
    lastFocusedBeforeModal = document.activeElement;
    document.documentElement.classList.add('modal-open');
    document.body.classList.add('modal-open');
    portraitLightboxOverlay.classList.add('open');
    portraitLightboxOverlay.setAttribute('aria-hidden', 'false');
    if (closePortraitLightboxBtn) closePortraitLightboxBtn.focus();
  }

  function closePortraitLightbox() {
    if (!portraitLightboxOverlay) return;
    portraitLightboxOverlay.classList.remove('open');
    portraitLightboxOverlay.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('modal-open');
    document.body.classList.remove('modal-open');
    const returnTarget =
      lastFocusedBeforeModal && typeof lastFocusedBeforeModal.focus === 'function'
        ? lastFocusedBeforeModal
        : openPortraitLightboxBtn;
    if (returnTarget && typeof returnTarget.focus === 'function') {
      returnTarget.focus();
    }
  }

  if (openPortraitLightboxBtn) {
    openPortraitLightboxBtn.addEventListener('click', openPortraitLightbox);
  }
  if (closePortraitLightboxBtn) {
    closePortraitLightboxBtn.addEventListener('click', closePortraitLightbox);
  }
  if (portraitLightboxOverlay) {
    portraitLightboxOverlay.addEventListener('click', (e) => {
      if (e.target === portraitLightboxOverlay) closePortraitLightbox();
    });
  }

  // ==========================================
  // 5. Page 04: Temporary Passcode Gate & Friends Slideshow
  // ==========================================
  const FF_PASSCODE = 'RYZEN7';
  const FF_SESSION_KEY = 'mn-ff-unlocked';
  let ffMemoryUnlocked = false;

  const familyViewEl = document.getElementById('view-family-friends');
  const ffGateEl = document.getElementById('ff-gate');
  const ffGateCardEl = document.getElementById('ff-gate-card');
  const ffGateFormEl = document.getElementById('ff-gate-form');
  const ffPasscodeInputEl = document.getElementById('ff-passcode-input');
  const ffToggleVisibilityBtn = document.getElementById('ff-toggle-visibility');
  const ffGateErrorEl = document.getElementById('ff-gate-error');
  const ffGateReturnBtn = document.getElementById('ff-gate-return');
  const ffProtectedContentEl = document.getElementById('ff-protected-content');
  const ffEyeShowIcon = ffToggleVisibilityBtn ? ffToggleVisibilityBtn.querySelector('.eye-show') : null;
  const ffEyeHideIcon = ffToggleVisibilityBtn ? ffToggleVisibilityBtn.querySelector('.eye-hide') : null;

  function readFamilySessionUnlock() {
    try {
      return window.sessionStorage.getItem(FF_SESSION_KEY) === 'true';
    } catch {
      return false;
    }
  }

  function writeFamilySessionUnlock() {
    ffMemoryUnlocked = true;
    try {
      window.sessionStorage.setItem(FF_SESSION_KEY, 'true');
    } catch {
      // Fallback to in-memory tab state when sessionStorage is restricted
    }
  }

  function isFamilyPageUnlocked() {
    return ffMemoryUnlocked || readFamilySessionUnlock();
  }

  function setPasscodeVisibility(showPlainText) {
    if (!ffPasscodeInputEl || !ffToggleVisibilityBtn) return;
    ffPasscodeInputEl.type = showPlainText ? 'text' : 'password';
    ffToggleVisibilityBtn.setAttribute('aria-pressed', String(showPlainText));
    const label = showPlainText ? 'Hide passcode' : 'Show passcode';
    ffToggleVisibilityBtn.setAttribute('aria-label', label);
    ffToggleVisibilityBtn.setAttribute('title', label);
    if (ffEyeShowIcon) ffEyeShowIcon.hidden = showPlainText;
    if (ffEyeHideIcon) ffEyeHideIcon.hidden = !showPlainText;
  }

  function clearGateError() {
    if (ffGateErrorEl) {
      ffGateErrorEl.textContent = '';
      ffGateErrorEl.hidden = true;
    }
    if (ffPasscodeInputEl) {
      ffPasscodeInputEl.classList.remove('has-error');
      ffPasscodeInputEl.removeAttribute('aria-invalid');
    }
  }

  function showGateError(message) {
    if (ffGateErrorEl) {
      ffGateErrorEl.textContent = message;
      ffGateErrorEl.hidden = false;
    }
    if (ffPasscodeInputEl) {
      ffPasscodeInputEl.classList.add('has-error');
      ffPasscodeInputEl.setAttribute('aria-invalid', 'true');
    }
    if (ffGateCardEl) {
      ffGateCardEl.classList.remove('is-shaking');
      void ffGateCardEl.offsetWidth;
      ffGateCardEl.classList.add('is-shaking');
    }
  }

  function applyFamilyGateState(shouldFocusInput = false) {
    const unlocked = isFamilyPageUnlocked();

    if (ffGateEl) {
      ffGateEl.hidden = unlocked;
      ffGateEl.setAttribute('aria-hidden', String(unlocked));
    }

    if (ffProtectedContentEl) {
      ffProtectedContentEl.hidden = !unlocked;
      ffProtectedContentEl.setAttribute('aria-hidden', String(!unlocked));
    }

    if (!unlocked && shouldFocusInput && ffPasscodeInputEl) {
      window.requestAnimationFrame(() => {
        if (!isFamilyPageUnlocked() && isFamilyPageActive()) {
          ffPasscodeInputEl.focus({ preventScroll: true });
        }
      });
    }
  }

  syncFamilyGateView = (isEnteringFamilyPage) => {
    applyFamilyGateState(isEnteringFamilyPage);
  };

  if (ffToggleVisibilityBtn) {
    ffToggleVisibilityBtn.addEventListener('click', () => {
      if (!ffPasscodeInputEl) return;
      const shouldReveal = ffPasscodeInputEl.type === 'password';
      setPasscodeVisibility(shouldReveal);
      ffPasscodeInputEl.focus({ preventScroll: true });
    });
  }

  if (ffPasscodeInputEl) {
    ffPasscodeInputEl.addEventListener('input', () => {
      if (ffGateErrorEl && !ffGateErrorEl.hidden) {
        clearGateError();
      }
    });
  }

  if (ffGateReturnBtn) {
    ffGateReturnBtn.addEventListener('click', () => {
      clearGateError();
      showSection(lastPublicSection || 'home');
    });
  }

  const FRIENDS_SLIDES = [
    {
      label: 'Picture 1',
      title: 'Good Company',
      desc: 'The people who make ordinary moments memorable.',
    },
    {
      label: 'Picture 2',
      title: 'Shared Memories',
      desc: 'Different moments, same unforgettable friendship.',
    },
    {
      label: 'Picture 3',
      title: 'Along the Way',
      desc: "Grateful for the people I've met along the journey.",
    },
    {
      label: 'Picture 4',
      title: 'The Good Times',
      desc: 'Simple moments and memories worth keeping.',
    },
  ];

  const slideshowEl = document.getElementById('friends-slideshow');
  const slideFigures = slideshowEl ? slideshowEl.querySelectorAll('.ff-slide') : [];
  const slideIndicators = slideshowEl ? slideshowEl.querySelectorAll('.ff-indicator-btn') : [];
  const slidePrevBtn = document.getElementById('ff-slide-prev');
  const slideNextBtn = document.getElementById('ff-slide-next');
  const slideCounterEl = document.getElementById('ff-slide-counter');
  const playbackStatusEl = document.getElementById('ff-playback-status');
  const slideLabelEl = document.getElementById('ff-slide-label');
  const slideTitleEl = document.getElementById('ff-slide-title');
  const slideDescEl = document.getElementById('ff-slide-desc');

  const SLIDE_INTERVAL_MS = 5000;
  let currentFriendSlide = 0;
  let slideTimerId = null;
  let isSlideshowHovered = false;
  let isSlideshowFocused = false;
  let lastInputWasPointer = false;

  document.addEventListener('pointerdown', () => {
    lastInputWasPointer = true;
  }, true);

  document.addEventListener('keydown', () => {
    lastInputWasPointer = false;
  }, true);

  function renderFriendsSlide(index) {
    if (!slideshowEl || !slideFigures.length) return;
    const total = FRIENDS_SLIDES.length;
    const safeIdx = ((index % total) + total) % total;
    currentFriendSlide = safeIdx;
    const meta = FRIENDS_SLIDES[safeIdx];

    slideFigures.forEach((fig, idx) => {
      const active = idx === safeIdx;
      fig.classList.toggle('is-active', active);
      fig.setAttribute('aria-hidden', active ? 'false' : 'true');
    });

    slideIndicators.forEach((btn, idx) => {
      const active = idx === safeIdx;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    if (slideCounterEl) {
      slideCounterEl.textContent = `${String(safeIdx + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
    }
    if (slideLabelEl) slideLabelEl.textContent = meta.label;
    if (slideTitleEl) slideTitleEl.textContent = meta.title;
    if (slideDescEl) slideDescEl.textContent = meta.desc;
  }

  function stopFriendsSlideshowTimer() {
    if (slideTimerId !== null) {
      window.clearInterval(slideTimerId);
      slideTimerId = null;
    }
  }

  function isFamilyPageActive() {
    if (familyViewEl) {
      return familyViewEl.classList.contains('active');
    }
    return SECTIONS[currentSectionIndex] === 'family-friends';
  }

  function updateSlideshowPlaybackState() {
    if (!slideshowEl) return;

    const isPageActive = isFamilyPageActive() && isFamilyPageUnlocked();
    if (!isPageActive) {
      isSlideshowHovered = false;
      isSlideshowFocused = false;
      stopFriendsSlideshowTimer();
      return;
    }

    const shouldPause = document.hidden || isSlideshowHovered || isSlideshowFocused;

    stopFriendsSlideshowTimer();

    if (!shouldPause) {
      slideTimerId = window.setInterval(() => {
        renderFriendsSlide(currentFriendSlide + 1);
      }, SLIDE_INTERVAL_MS);
    }

    if (playbackStatusEl) {
      playbackStatusEl.textContent = shouldPause ? 'PAUSED' : 'AUTO · 5S';
    }
  }

  function goToFriendsSlide(index, resetTimer = true) {
    renderFriendsSlide(index);
    if (resetTimer) {
      updateSlideshowPlaybackState();
    }
  }

  function stepFriendsSlide(delta) {
    goToFriendsSlide(currentFriendSlide + delta, true);
  }

  syncFriendsSlideshowPlayback = updateSlideshowPlaybackState;

  if (ffGateFormEl) {
    ffGateFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!ffPasscodeInputEl) return;

      const entered = ffPasscodeInputEl.value;
      if (entered === FF_PASSCODE) {
        writeFamilySessionUnlock();
        clearGateError();
        ffPasscodeInputEl.value = '';
        setPasscodeVisibility(false);
        applyFamilyGateState(false);
        renderFriendsSlide(0);
        updateSlideshowPlaybackState();
      } else {
        showGateError('Incorrect passcode. Please try again.');
        ffPasscodeInputEl.focus({ preventScroll: true });
        if (typeof ffPasscodeInputEl.select === 'function') {
          ffPasscodeInputEl.select();
        }
      }
    });
  }

  if (slideshowEl) {
    if (slidePrevBtn) {
      slidePrevBtn.addEventListener('click', () => stepFriendsSlide(-1));
    }
    if (slideNextBtn) {
      slideNextBtn.addEventListener('click', () => stepFriendsSlide(1));
    }

    slideIndicators.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-slide-to') || '0', 10);
        if (!Number.isNaN(idx)) {
          goToFriendsSlide(idx, true);
        }
      });
    });

    slideshowEl.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'touch') {
        isSlideshowHovered = true;
        updateSlideshowPlaybackState();
      }
    });

    slideshowEl.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'touch') {
        isSlideshowHovered = false;
        updateSlideshowPlaybackState();
      }
    });

    slideshowEl.addEventListener('focusin', (e) => {
      const target = e.target;
      const isKeyboardFocus =
        !lastInputWasPointer ||
        (target && typeof target.matches === 'function' && target.matches(':focus-visible'));
      if (isKeyboardFocus) {
        isSlideshowFocused = true;
        updateSlideshowPlaybackState();
      }
    });

    slideshowEl.addEventListener('focusout', (e) => {
      if (!slideshowEl.contains(e.relatedTarget)) {
        isSlideshowFocused = false;
        updateSlideshowPlaybackState();
      }
    });

    if (familyViewEl && typeof MutationObserver === 'function') {
      const viewObserver = new MutationObserver(() => {
        updateSlideshowPlaybackState();
      });
      viewObserver.observe(familyViewEl, { attributes: true, attributeFilter: ['class'] });
    }

    document.addEventListener('visibilitychange', updateSlideshowPlaybackState);
    window.addEventListener('hashchange', updateSlideshowPlaybackState);
    window.addEventListener('pagehide', stopFriendsSlideshowTimer);

    renderFriendsSlide(0);
  }

  // Initialize passcode gate & route on load
  applyFamilyGateState(false);
  initRoute();
  updateSlideshowPlaybackState();
})();
