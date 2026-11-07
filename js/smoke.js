(() => {
  'use strict';

  const canvas = document.getElementById('smoke-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  // Refined Subtle Smoke Simulation Parameters
  // Tuned for elegant, whisper-soft incense trail that does not obscure text
  const settings = {
    maxParticles: 130,      // Reduced to keep screen clean and unobtrusive
    particlesPerStep: 1,    // 1 delicate particle per step instead of heavy clumps
    spacing: 16,            // Gentle interpolation spacing
    baseLife: 1.3,          // Dissipates swiftly so smoke never builds up into clouds
    rise: 16,               // Upward thermal buoyancy like altar incense
    drag: 0.982             // Natural atmospheric friction
  };

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let lastTime = 0;
  let particles = [];
  let pointer = { x: 0, y: 0, active: false };
  let previous = null;
  let sprite = null;

  /**
   * Creates an offscreen multi-lobed organic puff sprite.
   * Colors are specifically calibrated to be subtle, warm, and 100% compatible
   * with both dark/gold text and light/dark theme backgrounds without covering letters.
   */
  function makeSmokeSprite() {
    const size = 128;
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const g = offscreen.getContext('2d');

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const gradient = g.createRadialGradient(64, 64, 2, 64, 64, 60);

    if (isLight) {
      // Light Scriptorium Theme: Gentle warm parchment incense mist
      // Low opacity so dark letters remain 100% readable without smudging
      gradient.addColorStop(0, 'rgba(150, 135, 115, 0.11)');
      gradient.addColorStop(0.35, 'rgba(175, 160, 140, 0.06)');
      gradient.addColorStop(0.70, 'rgba(200, 185, 165, 0.02)');
      gradient.addColorStop(1, 'rgba(220, 205, 185, 0)');
    } else {
      // Dark Gothic Theme: Warm candlelight amber/gold incense mist
      // Soft warm golden-amber core with transparent charcoal feathering.
      // Replaces bright cold white so it does NOT wash out or cover white text!
      gradient.addColorStop(0, 'rgba(215, 175, 115, 0.13)');
      gradient.addColorStop(0.35, 'rgba(165, 135, 95, 0.07)');
      gradient.addColorStop(0.70, 'rgba(110, 90, 70, 0.025)');
      gradient.addColorStop(1, 'rgba(50, 40, 30, 0)');
    }

    g.fillStyle = gradient;
    g.fillRect(0, 0, size, size);

    // Subtle uneven lobes for organic flowing puff silhouette
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * i) / 7;
      const x = 64 + Math.cos(angle) * 18;
      const y = 64 + Math.sin(angle) * 16;
      const r = 20 + (i % 3) * 4;
      const lobe = g.createRadialGradient(x, y, 1, x, y, r);

      if (isLight) {
        lobe.addColorStop(0, 'rgba(160, 145, 125, 0.035)');
        lobe.addColorStop(1, 'rgba(210, 195, 175, 0)');
      } else {
        lobe.addColorStop(0, 'rgba(195, 155, 105, 0.045)');
        lobe.addColorStop(1, 'rgba(120, 95, 70, 0)');
      }

      g.fillStyle = lobe;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    return offscreen;
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

  function addParticle(x, y, velocityX, velocityY) {
    const spread = 0.7 + Math.random() * 0.5;

    particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: y + (Math.random() - 0.5) * 8,
      vx: velocityX * 0.10 + (Math.random() - 0.5) * 16,
      vy: velocityY * 0.08 - settings.rise - Math.random() * 12,
      size: (12 + Math.random() * 18) * spread,  // Narrow, delicate initial size
      growth: 6 + Math.random() * 10,             // Gentle, controlled expansion
      life: settings.baseLife * (0.7 + Math.random() * 0.5),
      maxLife: settings.baseLife * (0.7 + Math.random() * 0.5),
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.45,
      wobble: Math.random() * Math.PI * 2
    });

    if (particles.length > settings.maxParticles) {
      particles.splice(0, particles.length - settings.maxParticles);
    }
  }

  function emitBetween(from, to) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy);
    const steps = Math.max(1, Math.ceil(distance / settings.spacing));
    const velocityX = dx / Math.max(distance, 1);
    const velocityY = dy / Math.max(distance, 1);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = from.x + dx * t;
      const y = from.y + dy * t;
      for (let j = 0; j < settings.particlesPerStep; j++) {
        addParticle(x, y, velocityX * 70, velocityY * 70);
      }
    }
  }

  function setPointerPosition(event) {
    const next = { x: event.clientX, y: event.clientY };
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

      const turbulence = Math.sin(time * 1.5 + p.wobble + p.y * 0.008);
      p.vx += turbulence * 6 * step;
      p.vy -= 2.0 * step;
      p.vx *= settings.drag;
      p.vy *= settings.drag;
      p.x += p.vx * step;
      p.y += p.vy * step;
      p.size += p.growth * step;
      p.rotation += p.spin * step;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    // Dark mode: screen mode with warm amber core for delicate candlelight glow
    // Light mode: source-over with subtle alpha so dark letters remain completely crisp
    ctx.globalCompositeOperation = isLight ? 'source-over' : 'screen';

    for (const p of particles) {
      const progress = p.life / p.maxLife;
      const fadeIn = Math.min(1, (1 - progress) * 8);
      // Subtle alpha (0.32 max) prevents smoke from accumulating into opaque clouds
      const alpha = Math.pow(progress, 1.4) * fadeIn * (isLight ? 0.28 : 0.34);

      const wobbleScale = 1 + Math.sin(p.wobble + performance.now() * 0.0006) * 0.06;
      const sizeX = p.size * wobbleScale;
      const sizeY = p.size * (1.2 - (wobbleScale - 1));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, -sizeX / 2, -sizeY / 2, sizeX, sizeY);
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame(now) {
    const delta = lastTime ? (now - lastTime) / 1000 : 0;
    lastTime = now;
    update(delta);
    draw();
    requestAnimationFrame(frame);
  }

  // Global Smoke API
  window.Smoke = {
    setTheme() {
      sprite = makeSmokeSprite();
    },
    emit(x, y, vx, vy) {
      addParticle(x, y, vx || 0, vy || 0);
    }
  };

  sprite = makeSmokeSprite();
  resize();

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', setPointerPosition, { passive: true });
  window.addEventListener('pointerdown', setPointerPosition, { passive: true });
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches[0]) {
      setPointerPosition(e.touches[0]);
    }
  }, { passive: true });
  window.addEventListener('pointerleave', () => { previous = null; }, { passive: true });
  window.addEventListener('blur', () => { previous = null; }, { passive: true });

  // Watch for theme attribute changes to refresh sprite
  const themeObserver = new MutationObserver(() => {
    sprite = makeSmokeSprite();
  });
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // Gentle initial whisper of smoke
  setTimeout(() => {
    const cx = window.innerWidth * 0.35;
    const cy = window.innerHeight * 0.45;
    for (let i = 0; i < 4; i++) {
      addParticle(cx, cy, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 15);
    }
  }, 400);

  requestAnimationFrame(frame);
})();
