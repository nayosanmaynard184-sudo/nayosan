/**
 * Maynard K. Nay-osan — Portfolio Main Interactivity & Section Routing
 * 
 * Features:
 * - 5-Section Fixed-Screen Router (Home, About, Education, Skills, Projects)
 * - Zero page scroll; in-place animated section replacements
 * - Keyboard navigation (Left / Right Arrow keys)
 * - Footer pager & "Continue →" stepper
 * - Theme management (Dark / Light with localStorage persistence)
 * - Ambient floating dust particles canvas (#dust-canvas)
 */

(function () {
  'use strict';

  // Section Configuration (Ordered)
  const SECTIONS = ['home', 'about', 'education', 'skills', 'projects'];
  let currentSectionIndex = 0;

  // DOM Elements
  const html = document.documentElement;
  const navItems = document.querySelectorAll('.nav-item');
  const sectionViews = document.querySelectorAll('.section-view');
  const footerPageIndicator = document.getElementById('footer-page-indicator');
  const btnContinue = document.getElementById('btn-continue');
  const themeToggleBtn = document.getElementById('theme-toggle');

  // ==========================================
  // 1. Fixed-Screen Section Switcher
  // ==========================================
  function showSection(sectionId, updateHash = true) {
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

    // Update Nav Item States
    navItems.forEach((item) => {
      const link = item.querySelector('a');
      if (link && link.getAttribute('data-target') === sectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Footer Pager
    if (footerPageIndicator) {
      const currentFormatted = String(index + 1).padStart(2, '0');
      const totalFormatted = String(SECTIONS.length).padStart(2, '0');
      footerPageIndicator.textContent = `${currentFormatted} / ${totalFormatted}`;
    }

    // Update Stepper Label
    if (btnContinue) {
      btnContinue.innerHTML = index === SECTIONS.length - 1
        ? `<span>Back to Start</span> <span aria-hidden="true">↺</span>`
        : `<span>Continue</span> <span aria-hidden="true">→</span>`;
    }

    // Update Hash without jumping
    if (updateHash && window.location.hash !== `#${sectionId}`) {
      history.pushState(null, '', `#${sectionId}`);
    }
  }

  function nextSection() {
    const nextIndex = (currentSectionIndex + 1) % SECTIONS.length;
    showSection(SECTIONS[nextIndex]);
  }

  function prevSection() {
    const prevIndex = (currentSectionIndex - 1 + SECTIONS.length) % SECTIONS.length;
    showSection(SECTIONS[prevIndex]);
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

  // Footer Continue button listener
  if (btnContinue) {
    btnContinue.addEventListener('click', nextSection);
  }

  // Keyboard Navigation: Left & Right arrow keys
  window.addEventListener('keydown', (e) => {
    // Ignore if typing inside input or textarea
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

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
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (SECTIONS.includes(hash)) {
      showSection(hash, false);
    } else {
      showSection('home', false);
    }
  }

  window.addEventListener('popstate', initRoute);

  // Hook in-page navigation links (e.g. "Explore About", "View Projects")
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-go-section]');
    if (btn) {
      e.preventDefault();
      const sec = btn.getAttribute('data-go-section');
      if (sec && SECTIONS.includes(sec)) {
        showSection(sec);
      }
    }
  });

  // ==========================================
  // About Page Sub-Tabs Handler
  // ==========================================
  const abTabs = document.querySelectorAll('.ab-tab');
  const abPanels = document.querySelectorAll('.ab-panel');

  function selectAboutTab(tabName) {
    abTabs.forEach((tab) => {
      const match = tab.getAttribute('data-tab') === tabName;
      tab.classList.toggle('active', match);
      tab.setAttribute('aria-selected', match ? 'true' : 'false');
    });

    abPanels.forEach((panel) => {
      if (panel.id === `ab-panel-${tabName}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
  }

  abTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      if (target) selectAboutTab(target);
    });
  });

  // ==========================================
  // Inventory Hotbar Slots & Lore Inspector
  // ==========================================
  const invSlots = document.querySelectorAll('.inv-slot');
  const loreIcon = document.getElementById('lore-icon');
  const loreType = document.getElementById('lore-type');
  const loreTitle = document.getElementById('lore-title');
  const loreDesc = document.getElementById('lore-desc');

  function selectInventorySlot(slotButton) {
    if (!slotButton) return;
    invSlots.forEach(s => s.classList.remove('selected'));
    slotButton.classList.add('selected');

    const name = slotButton.getAttribute('data-name');
    const type = slotButton.getAttribute('data-type');
    const desc = slotButton.getAttribute('data-desc');
    const icon = slotButton.getAttribute('data-icon');
    const slotNum = slotButton.getAttribute('data-slot');

    if (loreIcon) loreIcon.textContent = icon || '🎨';
    if (loreType) loreType.textContent = `${type} · Slot ${slotNum}`;
    if (loreTitle) loreTitle.textContent = name;
    if (loreDesc) loreDesc.textContent = desc;
  }

  invSlots.forEach((slot) => {
    slot.addEventListener('click', () => selectInventorySlot(slot));
  });

  // Hotkeys 1-5 for inventory inspection when on About section
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (currentSectionIndex === 1) { // Index 1 is 'about'
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 5) {
        selectAboutTab('inventory');
        const targetSlot = document.querySelector(`.inv-slot[data-slot="${keyNum}"]`);
        if (targetSlot) {
          selectInventorySlot(targetSlot);
        }
      }
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
        ? `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>`
        : `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
            <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" fill="none"/>
            <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
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
      dctx.scale(dpr, dpr);
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
