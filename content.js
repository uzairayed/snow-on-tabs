// content.js - Canvas snowflake overlay
(() => {
  // Configuration constants
  const IDLE_DELAY = 5000; // ms
  const MAX_SNOWFLAKES = 150;
  const MAX_ACCUMULATION = 200;
  const SPAWN_RATE = 30; // snowflakes per second
  const GENTLE_RATIO = 0.7; // 70% gentle, 30% dramatic
  const SCREEN_BUFFER = 100; // pixels beyond screen edge
  const GROUND_BUFFER = 20; // pixels below screen bottom
  const ACCUMULATION_FADE_RATE = 0.1; // fade speed for accumulated snow
  
  // Runtime variables
  let idleTimer = null;
  let overlay = null;
  let canvas = null;
  let ctx = null;
  let running = false;
  let rafId = null;
  const snowflakes = [];
  const accumulation = [];

  function createOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.id = "snow-overlay-canvas";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.zIndex = "2147483647";
    overlay.style.pointerEvents = "none";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 800ms ease";
    overlay.style.mixBlendMode = "normal";

    canvas = document.createElement("canvas");
    canvas.id = "snow-canvas";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";

    overlay.appendChild(canvas);
    document.documentElement.appendChild(overlay);

    ctx = canvas.getContext("2d");
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.floor(window.innerWidth * dpr));
    const h = Math.max(1, Math.floor(window.innerHeight * dpr));
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawnSnowflake() {
    const x = Math.random() * window.innerWidth;
    const type = Math.random() < GENTLE_RATIO ? 'gentle' : 'dramatic';
    const size = 2 + Math.random() * 8;
    const alpha = 0.4 + Math.random() * 0.6;
    
    if (type === 'gentle') {
      return {
        x,
        y: -20,
        vx: (Math.random() - 0.5) * 10, // gentle horizontal drift
        vy: 15 + Math.random() * 25, // very slow fall
        size,
        alpha,
        type: 'gentle',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
        swayAmplitude: 10 + Math.random() * 20,
        swaySpeed: 0.5 + Math.random() * 1.5,
        swayOffset: Math.random() * Math.PI * 2
      };
    } else {
      return {
        x,
        y: -20,
        vx: (Math.random() - 0.5) * 25, // more dramatic horizontal movement
        vy: 25 + Math.random() * 35, // moderate fall speed
        size,
        alpha,
        type: 'dramatic',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2,
        spiralRadius: 20 + Math.random() * 40,
        spiralSpeed: 1 + Math.random() * 2,
        spiralOffset: Math.random() * Math.PI * 2,
        time: 0
      };
    }
  }

  function populateSnowflakes() {
    snowflakes.length = 0;
    for (let i = 0; i < Math.min(80, MAX_SNOWFLAKES); i++) {
      const flake = spawnSnowflake();
      flake.y = Math.random() * window.innerHeight;
      snowflakes.push(flake);
    }
  }

  // Pre-calculated colors for performance
  const SNOWFLAKE_STROKE_COLOR = '173, 216, 230';
  const SNOWFLAKE_FILL_COLOR = '135, 206, 235';
  
  function drawSnowflake(x, y, size, rotation, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = `rgba(${SNOWFLAKE_STROKE_COLOR}, ${alpha})`;
    ctx.fillStyle = `rgba(${SNOWFLAKE_FILL_COLOR}, ${alpha * 0.8})`;
    
    if (size < 4) {
      // Small snowflakes as simple circles
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Detailed 6-pointed snowflakes
      ctx.lineWidth = Math.max(0.5, size / 8);
      
      // Main 6 spokes
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const length = size;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * length, Math.sin(angle) * length);
        ctx.stroke();
        
        // Add small branches
        const branchLength = length * 0.3;
        const branchPos = length * 0.7;
        
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * branchPos - Math.cos(angle + Math.PI/4) * branchLength,
                   Math.sin(angle) * branchPos - Math.sin(angle + Math.PI/4) * branchLength);
        ctx.lineTo(Math.cos(angle) * branchPos, Math.sin(angle) * branchPos);
        ctx.lineTo(Math.cos(angle) * branchPos - Math.cos(angle - Math.PI/4) * branchLength,
                   Math.sin(angle) * branchPos - Math.sin(angle - Math.PI/4) * branchLength);
        ctx.stroke();
      }
      
      // Center circle
      ctx.beginPath();
      ctx.arc(0, 0, size / 6, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.restore();
  }

  function addToAccumulation(x, size) {
    if (accumulation.length >= MAX_ACCUMULATION) {
      accumulation.shift(); // Remove oldest
    }
    
    accumulation.push({
      x: x + (Math.random() - 0.5) * 20, // slight spread
      y: window.innerHeight - 2,
      size: size * 0.5,
      alpha: 0.6 + Math.random() * 0.4,
      life: 1.0
    });
  }

  let lastTs = 0;
  function loop(ts) {
    if (!running) return;
    if (!lastTs) lastTs = ts;
    const dt = Math.min(50, ts - lastTs) / 1000;
    lastTs = ts;
    update(dt);
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function update(dt) {
    // Simple, reliable spawning - spawn 1-2 snowflakes per frame when below max
    if (snowflakes.length < MAX_SNOWFLAKES) {
      const spawnChance = Math.min(1.0, dt * SPAWN_RATE); // 30 per second target
      if (Math.random() < spawnChance) {
        snowflakes.push(spawnSnowflake());
        // Sometimes spawn a second one for denser snow
        if (Math.random() < 0.3 && snowflakes.length < MAX_SNOWFLAKES) {
          snowflakes.push(spawnSnowflake());
        }
      }
    }

    // Update snowflakes
    for (let i = snowflakes.length - 1; i >= 0; i--) {
      const flake = snowflakes[i];
      
      if (flake.type === 'gentle') {
        // Gentle swaying motion
        flake.swayOffset += flake.swaySpeed * dt;
        flake.x += flake.vx * dt + Math.sin(flake.swayOffset) * flake.swayAmplitude * dt;
        flake.y += flake.vy * dt;
      } else {
        // Dramatic spiral motion
        flake.time += dt;
        flake.spiralOffset += flake.spiralSpeed * dt;
        flake.x += flake.vx * dt + Math.cos(flake.spiralOffset) * flake.spiralRadius * dt;
        flake.y += flake.vy * dt;
      }
      
      flake.rotation += flake.rotationSpeed * dt;
      
      // Check if snowflake reached the ground or went off screen
      if (flake.y > window.innerHeight + GROUND_BUFFER) {
        addToAccumulation(flake.x, flake.size);
        snowflakes.splice(i, 1);
      } else if (flake.x < -SCREEN_BUFFER || flake.x > window.innerWidth + SCREEN_BUFFER) {
        snowflakes.splice(i, 1);
      }
    }

    // Update accumulation (fade over time)
    for (let i = accumulation.length - 1; i >= 0; i--) {
      const snow = accumulation[i];
      snow.life -= dt * ACCUMULATION_FADE_RATE; // very slow fade
      if (snow.life <= 0) {
        accumulation.splice(i, 1);
      }
    }
  }

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    
    // Draw accumulated snow
    for (let i = 0; i < accumulation.length; i++) {
      const snow = accumulation[i];
      ctx.globalAlpha = snow.alpha * snow.life;
      ctx.fillStyle = `rgba(${SNOWFLAKE_STROKE_COLOR}, ${snow.alpha * snow.life})`;
      ctx.beginPath();
      ctx.arc(snow.x, snow.y, snow.size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.globalAlpha = 1;
    
    // Draw falling snowflakes
    for (let i = 0; i < snowflakes.length; i++) {
      const flake = snowflakes[i];
      drawSnowflake(flake.x, flake.y, flake.size, flake.rotation, flake.alpha);
    }
  }

  function startSnow() {
    if (running) return;
    createOverlay();
    overlay.style.opacity = "1";
    populateSnowflakes();
    running = true;
    lastTs = 0;
    rafId = requestAnimationFrame(loop);
  }

  function stopSnow() {
    if (!running) return;
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    lastTs = 0;
    if (overlay) overlay.style.opacity = "0";
    setTimeout(() => { 
      if (overlay && overlay.contains(canvas)) { 
        ctx && ctx.clearRect(0, 0, canvas.width, canvas.height); 
        snowflakes.length = 0; 
        accumulation.length = 0; 
      } 
    }, 800);
  }

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    stopSnow();
    idleTimer = setTimeout(() => startSnow(), IDLE_DELAY);
  }

  ["mousemove","keydown","scroll","click","touchstart"].forEach(evt => 
    window.addEventListener(evt, resetIdleTimer, { passive: true })
  );

  createOverlay();
  resetIdleTimer();

  window.addEventListener("visibilitychange", () => { 
    if (document.visibilityState === "visible") resetIdleTimer(); 
    else stopSnow(); 
  });

})();