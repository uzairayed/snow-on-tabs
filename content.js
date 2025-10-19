// content.js - Canvas rain overlay (drop-in)
(() => {
  const IDLE_DELAY = 5000; // ms
  let idleTimer = null;
  let overlay = null;
  let canvas = null;
  let ctx = null;
  let running = false;
  let rafId = null;
  const drops = [];
  const maxDrops = 200;

  // Create overlay + canvas
  function createOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.id = "rain-overlay-canvas";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "2147483647"; // very top
    overlay.style.pointerEvents = "none";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 800ms ease";
    overlay.style.mixBlendMode = "normal";

    canvas = document.createElement("canvas");
    canvas.id = "rain-canvas";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";

    overlay.appendChild(canvas);
    document.documentElement.appendChild(overlay);

    ctx = canvas.getContext("2d");
    // Set sensible defaults on the 2D context to avoid rendering artifacts on some browsers
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = true;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    // Backing store size in device pixels for crisp rendering on high-DPI displays.
    const w = Math.max(1, Math.floor(window.innerWidth * dpr));
    const h = Math.max(1, Math.floor(window.innerHeight * dpr));
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    // Map CSS pixel coordinates to device pixels so drawing code can use CSS pixels.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Rain particle factory
  function spawnDrop() {
    // spawn across the screen width, speed depends on "depth"
    const x = Math.random() * window.innerWidth;
    // depth: 0 (far, slow & thin) -> 1 (near, fast & thick)
    const depth = Math.random();
    const length = 10 + depth * 40; // px
    const speed = 200 + depth * 800; // px / sec
    const thickness = 0.6 + depth * 1.6; // px
    const alpha = 0.15 + depth * 0.6;
    const wind = (Math.random() - 0.5) * 0.6 * (1 + depth);
    return { x, y: -20, vx: wind, vy: speed, length, thickness, alpha, splashed: false };
  }

  // Build initial drops when starting
  function populateDrops() {
    drops.length = 0;
    for (let i = 0; i < Math.min(60, maxDrops); i++) {
      const d = spawnDrop();
      // offset start Y randomly so rain feels continuous
      d.y = Math.random() * window.innerHeight;
      drops.push(d);
    }
  }

  // Animation loop
  let lastTs = 0;
  function loop(ts) {
    if (!running) return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min(50, ts - lastTs) / 1000; // clamp dt
    lastTs = ts;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function update(dt) {
    // spawn some drops gradually
    const spawnRate = 60; // drops per second max
    const toSpawn = Math.floor(spawnRate * dt);
    for (let i = 0; i < toSpawn && drops.length < maxDrops; i++) {
      drops.push(spawnDrop());
    }

    // update drops
    for (let i = drops.length - 1; i >= 0; i--) {
      const p = drops[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // when hitting "ground" (bottom of viewport)
      if (p.y > window.innerHeight - 4 && !p.splashed) {
        p.splashed = true;
        // create a small splash particle cluster
        createSplash(p.x, window.innerHeight - 2, p.length * 0.06, p.alpha);
        // remove drop with small delay or reuse
        drops.splice(i, 1);
      }

      // remove out-of-bounds horizontally
      if (p.x < -50 || p.x > window.innerWidth + 50) {
        drops.splice(i, 1);
      }
    }

    // update splashes
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      s.life -= dt;
      s.y -= s.vy * dt * 0.6; // slight upward fade
      s.x += s.vx * dt;
      if (s.life <= 0) splashes.splice(i, 1);
    }
  }

  // Drawing
  const splashes = [];
  function draw() {
    if (!ctx) return;
    // clear the canvas in CSS pixels (transform maps CSS->device pixels)
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Soft backdrop: subtle dimming and blur via CSS is handled in rain.css
    // draw drops
    for (let i = 0; i < drops.length; i++) {
      const p = drops[i];
      ctx.beginPath();
      // Ensure a minimum visible width to avoid near-zero widths that can render as squares.
      ctx.lineWidth = Math.max(0.8, p.thickness);
      ctx.strokeStyle = `rgba(200,220,255,${p.alpha})`;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.02, p.y + p.length);
      ctx.stroke();
    }

    // draw splashes
    for (let i = 0; i < splashes.length; i++) {
      const s = splashes[i];
      const progress = 1 - Math.max(0, Math.min(1, s.life / s.maxLife));
      ctx.globalAlpha = (1 - progress) * s.alpha;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius * (0.6 + progress), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${s.alpha * 0.6})`;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function createSplash(x, y, strength = 2, alpha = 0.4) {
    const count = Math.floor(3 + Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.9;
      const speed = 40 + Math.random() * 120 * strength;
      splashes.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1 + Math.random() * 3 * strength,
        life: 0.18 + Math.random() * 0.35,
        maxLife: 0.18 + Math.random() * 0.35,
        alpha: alpha
      });
    }
  }

  // Start / stop animation
  function startRain() {
    if (running) return;
    createOverlay();
    overlay.style.opacity = "1";
    populateDrops();
    running = true;
    lastTs = 0;
    rafId = requestAnimationFrame(loop);
  }

  function stopRain() {
    if (!running) return;
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    lastTs = 0;
    // fade out
    if (overlay) overlay.style.opacity = "0";
    // clear arrays after fade
    setTimeout(() => {
      if (overlay && overlay.contains(canvas)) {
        // keep canvas but clear content
        ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
        drops.length = 0;
        splashes.length = 0;
      }
    }, 800);
  }

  // Idle timer logic
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    stopRain();
    idleTimer = setTimeout(() => {
      startRain();
    }, IDLE_DELAY);
  }

  // Activity listeners
  ["mousemove", "keydown", "scroll", "click", "touchstart"].forEach(evt => {
    window.addEventListener(evt, resetIdleTimer, { passive: true });
  });

  // Initialization
  createOverlay();
  resetIdleTimer();

  // If the page navigates via SPA pushState, still keep handling
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") resetIdleTimer();
    else stopRain();
  });

})();
