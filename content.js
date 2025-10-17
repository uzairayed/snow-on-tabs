let rainOverlay = null;
let idleTimer = null;
const IDLE_DELAY = 5000; // 15 seconds

function createRainOverlay() {
  if (rainOverlay) return;
  rainOverlay = document.createElement("div");
  rainOverlay.id = "rain-overlay";
  document.body.appendChild(rainOverlay);
}

function showRain() {
  createRainOverlay();
  if (!rainOverlay.classList.contains("active")) {
    rainOverlay.classList.add("active");
    generateRaindrops();
  }
}

function generateRaindrops() {
  // Clear old drops
  rainOverlay.innerHTML = "";

  const numDrops = 40;
  for (let i = 0; i < numDrops; i++) {
    const drop = document.createElement("div");
    drop.classList.add("rain-drop");

    // Random horizontal position
    drop.style.left = Math.random() * 100 + "vw";

    // Random animation delay/speed
    drop.style.animationDelay = (Math.random() * 1).toFixed(2) + "s";
    drop.style.animationDuration = (0.5 + Math.random() * 0.5).toFixed(2) + "s";

    // Random size
    drop.style.height = 40 + Math.random() * 40 + "px";
    drop.style.opacity = 0.2 + Math.random() * 0.4;

    rainOverlay.appendChild(drop);
  }
}


function hideRain() {
  if (rainOverlay) rainOverlay.classList.remove("active");
}

function resetIdleTimer() {
  clearTimeout(idleTimer);
  hideRain();
  idleTimer = setTimeout(showRain, IDLE_DELAY);
}

// Detect activity
["mousemove", "keydown", "scroll", "click"].forEach(evt => {
  window.addEventListener(evt, resetIdleTimer);
});

resetIdleTimer(); // start on load
