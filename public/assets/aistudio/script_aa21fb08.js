(() => {
  'use strict';

  const canvas = document.getElementById('smoke-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const settings = {
    maxParticles: 260,
    particlesPerStep: 3,
    spacing: 10,
    baseLife: 1.8,
    rise: 13,
    drag: 0.986
  };

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let lastTime = 0;
  let particles = [];
  let pointer = { x: 0, y: 0, active: false };
  let previous = null;
  let sprite = null;

  function makeSmokeSprite() {
    const size = 128;
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const g = offscreen.getContext('2d');

    const gradient = g.createRadialGradient(64, 64, 3, 64, 64, 62);
    gradient.addColorStop(0, 'rgba(224, 234, 250, 0.23)');
    gradient.addColorStop(0.28, 'rgba(190, 207, 230, 0.16)');
    gradient.addColorStop(0.62, 'rgba(142, 164, 198, 0.065)');
    gradient.addColorStop(1, 'rgba(110, 130, 160, 0)');
    g.fillStyle = gradient;
    g.fillRect(0, 0, size, size);

    // Add soft, uneven lobes so each puff is less perfectly circular.
    for (let i = 0; i < 7; i++) {
      const angle = (Math.PI * 2 * i) / 7;
      const x = 64 + Math.cos(angle) * 19;
      const y = 64 + Math.sin(angle) * 17;
      const r = 24 + (i % 3) * 5;
      const lobe = g.createRadialGradient(x, y, 1, x, y, r);
      lobe.addColorStop(0, 'rgba(205, 218, 239, 0.075)');
      lobe.addColorStop(1, 'rgba(150, 170, 205, 0)');
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
    const spread = 0.75 + Math.random() * 0.7;
    particles.push({
      x: x + (Math.random() - 0.5) * 12,
      y: y + (Math.random() - 0.5) * 12,
      vx: velocityX * 0.12 + (Math.random() - 0.5) * 22,
      vy: velocityY * 0.10 - settings.rise - Math.random() * 15,
      size: (24 + Math.random() * 35) * spread,
      growth: 10 + Math.random() * 18,
      life: settings.baseLife * (0.7 + Math.random() * 0.6),
      maxLife: settings.baseLife * (0.7 + Math.random() * 0.6),
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.55,
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
        addParticle(x, y, velocityX * 90, velocityY * 90);
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

      const turbulence = Math.sin(time * 1.7 + p.wobble + p.y * 0.009);
      p.vx += turbulence * 8 * step;
      p.vy -= 2.2 * step;
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
    ctx.globalCompositeOperation = 'screen';

    for (const p of particles) {
      const progress = p.life / p.maxLife;
      const fadeIn = Math.min(1, (1 - progress) * 7);
      const alpha = Math.pow(progress, 1.35) * fadeIn * 0.82;
      const wobbleScale = 1 + Math.sin(p.wobble + performance.now() * 0.0007) * 0.08;
      const sizeX = p.size * wobbleScale;
      const sizeY = p.size * (1.25 - (wobbleScale - 1));

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

  sprite = makeSmokeSprite();
  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', setPointerPosition, { passive: true });
  window.addEventListener('pointerdown', setPointerPosition, { passive: true });
  window.addEventListener('pointerleave', () => { previous = null; }, { passive: true });
  window.addEventListener('blur', () => { previous = null; }, { passive: true });
  requestAnimationFrame(frame);
})();
