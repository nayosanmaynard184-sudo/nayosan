/**
 * Maynard K. Nay-osan — Medieval Gothic Portfolio
 * Interactive Smoke Cursor Trail Animation (Canvas 2D)
 * 
 * Based on the author's multi-lobed puff particle physics:
 * - Continuous unbroken smoke trail following pointer trajectory
 * - Offscreen multi-lobed organic puff sprites
 * - Natural momentum transfer, thermal buoyancy, and subtle sinusoidal turbulence
 * - Gradual expansion, diffusion, and soft alpha falloff
 * - Dual-theme support: soft warm cream, ivory, and subtle antique gold tones (Dark)
 *   and warm translucent charcoal/sepia tones (Light)
 */

(function () {
  'use strict';

  const canvas = document.getElementById('smoke-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Smoke Simulation Parameters
  const settings = {
    maxParticles: 320,
    particlesPerStep: 3,
    spacing: 8,          // Distance between interpolated emission steps
    baseLife: 2.1,       // Lingering lifespan in seconds
    rise: 14,            // Thermal upward drift
    drag: 0.985,         // Momentum friction
  };

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let lastTime = 0;
  let particles = [];
  let pointer = { x: 0, y: 0, active: false };
  let previous = null;
  let spriteIvory = null;
  let spriteGold = null;
  let isLightMode = document.documentElement.getAttribute('data-theme') === 'light';

  // Helper: Generate an organic, multi-lobed smoke puff sprite on an offscreen canvas
  function createSmokeSprite(color1, color2, color3) {
    const size = 140;
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const g = offscreen.getContext('2d');

    const cx = size / 2;
    const cy = size / 2;

    // Base central radial glow
    const gradient = g.createRadialGradient(cx, cy, 2, cx, cy, size * 0.44);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(0.32, color2);
    gradient.addColorStop(0.68, color3);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    g.fillStyle = gradient;
    g.fillRect(0, 0, size, size);

    // Multi-lobed irregular puffs around center for realistic non-circular smoke
    const lobeCount = 8;
    for (let i = 0; i < lobeCount; i++) {
      const angle = (Math.PI * 2 * i) / lobeCount + (i % 2) * 0.2;
      const dist = 18 + (i % 3) * 6;
      const lx = cx + Math.cos(angle) * dist;
      const ly = cy + Math.sin(angle) * dist;
      const radius = 28 + (i % 4) * 6;

      const lobe = g.createRadialGradient(lx, ly, 1, lx, ly, radius);
      lobe.addColorStop(0, color2);
      lobe.addColorStop(0.7, color3);
      lobe.addColorStop(1, 'rgba(0, 0, 0, 0)');
      g.fillStyle = lobe;
      g.fillRect(lx - radius, ly - radius, radius * 2, radius * 2);
    }

    return offscreen;
  }

  function initSprites() {
    if (isLightMode) {
      // Light Mode: Soft charcoal, warm taupe, and subtle sepia
      spriteIvory = createSmokeSprite(
        'rgba(75, 68, 60, 0.24)',
        'rgba(115, 102, 90, 0.15)',
        'rgba(150, 135, 120, 0.05)'
      );
      spriteGold = createSmokeSprite(
        'rgba(110, 85, 55, 0.22)',
        'rgba(145, 115, 80, 0.13)',
        'rgba(175, 145, 110, 0.04)'
      );
    } else {
      // Dark Mode: Soft warm cream, ivory, warm gray, and subtle antique gold tones
      spriteIvory = createSmokeSprite(
        'rgba(242, 235, 222, 0.25)',
        'rgba(215, 202, 185, 0.15)',
        'rgba(165, 150, 135, 0.05)'
      );
      spriteGold = createSmokeSprite(
        'rgba(235, 205, 150, 0.22)',
        'rgba(205, 175, 120, 0.14)',
        'rgba(170, 140, 95, 0.05)'
      );
    }
  }

  function resize() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  // Add individual smoke particle
  function addParticle(x, y, velocityX, velocityY) {
    if (prefersReducedMotion) return;

    const spread = 0.8 + Math.random() * 0.6;
    const isGold = Math.random() < 0.35; // 35% antique gold, 65% warm ivory

    particles.push({
      x: x + (Math.random() - 0.5) * 14,
      y: y + (Math.random() - 0.5) * 14,
      vx: velocityX * 0.14 + (Math.random() - 0.5) * 24,
      vy: velocityY * 0.12 - settings.rise - Math.random() * 16,
      size: (26 + Math.random() * 32) * spread,
      growth: 14 + Math.random() * 22, // Expands as it rises
      life: settings.baseLife * (0.75 + Math.random() * 0.5),
      maxLife: settings.baseLife * (0.75 + Math.random() * 0.5),
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.45,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 1.5 + Math.random() * 1.5,
      sprite: isGold ? spriteGold : spriteIvory,
    });

    if (particles.length > settings.maxParticles) {
      particles.splice(0, particles.length - settings.maxParticles);
    }
  }

  // Interpolate emission along pointer trajectory
  function emitBetween(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 2) return;

    const steps = Math.max(1, Math.ceil(distance / settings.spacing));
    const velocityX = dx / Math.max(distance, 1);
    const velocityY = dy / Math.max(distance, 1);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = from.x + dx * t;
      const y = from.y + dy * t;
      for (let j = 0; j < settings.particlesPerStep; j++) {
        addParticle(x, y, velocityX * 90, velocityY * 90);
      }
    }
  }

  function setPointerPosition(clientX, clientY) {
    const next = { x: clientX, y: clientY };
    pointer.x = next.x;
    pointer.y = next.y;
    pointer.active = true;
    if (previous) emitBetween(previous, next);
    previous = next;
  }

  function update(delta) {
    const step = Math.min(delta, 0.04);
    const time = performance.now() * 0.001;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= step;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      // Micro-turbulence
      const turbulence = Math.sin(time * p.wobbleSpeed + p.wobble + p.y * 0.008);
      p.vx += turbulence * 9 * step;
      p.vy -= 3.5 * step; // Buoyant upward drift
      p.vx *= settings.drag;
      p.vy *= settings.drag;
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.size += p.growth * step; // Natural smoke expansion
      p.rotation += p.spin * step;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Composite mode: screen in dark mode for soft glowing smoke; normal blend in light mode
    ctx.globalCompositeOperation = isLightMode ? 'source-over' : 'screen';

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const progress = p.life / p.maxLife;
      const fadeIn = Math.min(1, (1 - progress) * 8);
      const alpha = Math.pow(progress, 1.4) * fadeIn * 0.88;
      
      const wobbleScale = 1 + Math.sin(p.wobble + performance.now() * 0.0008) * 0.08;
      const sizeX = p.size * wobbleScale;
      const sizeY = p.size * (1.2 - (wobbleScale - 1));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.drawImage(p.sprite, -sizeX / 2, -sizeY / 2, sizeX, sizeY);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  let animationId = null;
  function frame(now) {
    animationId = requestAnimationFrame(frame);
    const delta = lastTime ? (now - lastTime) / 1000 : 0;
    lastTime = now;
    update(delta);
    draw();
  }

  // Global Smoke controller
  window.Smoke = {
    setTheme(light) {
      isLightMode = !!light;
      initSprites();
    },
    emit(x, y, vx, vy) {
      addParticle(x, y, vx || 0, vy || 0);
    }
  };

  initSprites();
  resize();

  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener('pointermove', (e) => {
    setPointerPosition(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('pointerdown', (e) => {
    setPointerPosition(e.clientX, e.clientY);
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      setPointerPosition(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('pointerleave', () => { previous = null; }, { passive: true });
  window.addEventListener('blur', () => { previous = null; }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animationId) cancelAnimationFrame(animationId);
      previous = null;
    } else {
      lastTime = performance.now();
      animationId = requestAnimationFrame(frame);
    }
  });

  // Initial ambient smoke puff so visitor immediately sees the atmosphere
  setTimeout(() => {
    const cx = window.innerWidth * 0.35;
    const cy = window.innerHeight * 0.45;
    for (let i = 0; i < 8; i++) {
      addParticle(cx, cy, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30);
    }
  }, 400);

  animationId = requestAnimationFrame(frame);

})();
