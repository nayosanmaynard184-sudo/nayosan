/**
 * Maynard Nay-osan — Portfolio Main Interactivity & 3-Page Router
 *
 * Features:
 * - 3-Page Fixed-Screen Router (Homepage, Personal Info, Achievements)
 * - Zero outer page scroll on desktop; smooth in-place section transitions
 * - Previous / Continue directional buttons & 01 / 02 / 03 numbered page indicators
 * - Keyboard navigation (Left / Right Arrow keys clamped to the 3 pages)
 * - Personal Info section filter (All / More About Me / Skills / My Advancement)
 * - Theme management (Dark / Light with localStorage persistence)
 * - Ambient floating dust particles canvas (#dust-canvas)
 */

(function () {
  'use strict';

  // Exact Three-Page Configuration
  const SECTIONS = ['home', 'personal-info', 'achievements'];
  const SECTION_ALIASES = {
    about: 'personal-info',
    education: 'achievements',
  };
  let currentSectionIndex = 0;

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
  // 1. Fixed-Screen 3-Page Section Switcher
  // ==========================================
  function showSection(rawSectionId, updateHash = true) {
    const sectionId = SECTION_ALIASES[rawSectionId] || rawSectionId;
    const index = SECTIONS.indexOf(sectionId);
    if (index === -1) return;

    currentSectionIndex = index;

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

    // Update Numbered Page Buttons (01, 02, 03)
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

    // Update Page Counter (01 / 03, 02 / 03, 03 / 03)
    if (footerPageIndicator) {
      const currentFormatted = String(index + 1).padStart(2, '0');
      const totalFormatted = String(SECTIONS.length).padStart(2, '0');
      footerPageIndicator.textContent = `${currentFormatted} / ${totalFormatted}`;
    }

    // Disable Previous on Page 01, Disable Continue on Page 03
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

  // Keyboard Navigation: Left & Right arrow keys (bounded to the 3 pages)
  window.addEventListener('keydown', (e) => {
    if (e.target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

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
  // Personal Info Section Filter (All / More About Me / Skills / My Advancement)
  // ==========================================
  const piTabs = document.querySelectorAll('[data-pi-filter]');
  const piBlocks = document.querySelectorAll('[data-pi-section]');
  const piScrollStage = document.getElementById('pi-scroll-stage');

  function selectPersonalInfoFilter(filterName) {
    piTabs.forEach((tab) => {
      const match = tab.getAttribute('data-pi-filter') === filterName;
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    piBlocks.forEach((block) => {
      const section = block.getAttribute('data-pi-section');
      const visible = filterName === 'all' || section === filterName;
      block.classList.toggle('active', visible);
    });

    if (piScrollStage) {
      piScrollStage.scrollTop = 0;
    }
  }

  piTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-pi-filter');
      if (target) selectPersonalInfoFilter(target);
    });
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
  // 3. Ambient Dust Motes Canvas
  // ==========================================
  const dustCanvas = document.getElementById('dust-canvas');
  if (dustCanvas) {
    const dctx = dustCanvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let particles = [];
    const COUNT = 36;

    function resizeDust() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      dustCanvas.width = window.innerWidth * dpr;
      dustCanvas.height = window.innerHeight * dpr;
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      particles = [];
      const w = window.innerWidth;
      const h = window.innerHeight;
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          size: Math.random() * 1.5 + 0.6,
          vx: (Math.random() - 0.45) * 0.2,
          vy: -Math.random() * 0.3 - 0.08,
          alpha: Math.random() * 0.45 + 0.15,
          pulse: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.02 + 0.01,
        });
      }
    }

    resizeDust();
    initParticles();
    window.addEventListener('resize', () => {
      resizeDust();
      initParticles();
    }, { passive: true });

    let rafId;
    function renderDust() {
      rafId = requestAnimationFrame(renderDust);
      const w = window.innerWidth;
      const h = window.innerHeight;
      dctx.clearRect(0, 0, w, h);

      const isLight = html.getAttribute('data-theme') === 'light';
      const r = isLight ? 140 : 215;
      const g = isLight ? 110 : 185;
      const b = isLight ? 75 : 135;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.pulse += p.pulseSpeed;

          if (p.y < -10) {
            p.y = h + 10;
            p.x = Math.random() * w;
          }
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
        }

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        dctx.beginPath();
        dctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        dctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${currentAlpha})`;
        dctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.4)`;
        dctx.shadowBlur = 3;
        dctx.fill();
      }
    }

    rafId = requestAnimationFrame(renderDust);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        rafId = requestAnimationFrame(renderDust);
      }
    });
  }

  // Initialize route on load
  initRoute();
})();
