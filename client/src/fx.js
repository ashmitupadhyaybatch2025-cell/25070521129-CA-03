// ============================================================
// FLEXI Japanese Matrix Digital Rain & Cyberpunk Yellow/Black FX
// ============================================================

const KATAKANA = '日ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ0123456789ｱｲｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789:・."=*+-<>¦｜';
const YELLOW_COLORS = ['#facc15', '#fde047', '#eab308', '#ffd700', '#ffffff'];

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Matrix Digital Rain Canvas ----------
function initMatrix() {
  if (reduced()) return;
  if (document.getElementById('matrix-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  canvas.style.opacity = '0.38';
  canvas.style.background = '#050505';

  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const fontSize = 16;
  let columns = Math.floor(width / fontSize);
  let drops = [];

  const resetDrops = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -50);
    }
  };

  resetDrops();
  window.addEventListener('resize', resetDrops);

  // Fill initial background black
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, width, height);

  let lastTime = 0;
  const fpsInterval = 1000 / 33; // ~30 fps for authentic matrix cadence

  function draw(currentTime) {
    requestAnimationFrame(draw);

    const elapsed = currentTime - lastTime;
    if (elapsed < fpsInterval) return;
    lastTime = currentTime - (elapsed % fpsInterval);

    // Trailing fade effect
    ctx.fillStyle = 'rgba(5, 5, 5, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = KATAKANA.charAt(Math.floor(Math.random() * KATAKANA.length));
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      if (y > 0) {
        // Leading character glows bright white-yellow
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#facc15';
        ctx.fillStyle = '#fffde7';
        ctx.fillText(char, x, y);

        // Previous character in neon yellow
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#facc15';
        ctx.fillText(char, x, y - fontSize);
      }

      // Reset drop when off screen
      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  requestAnimationFrame(draw);
}

// ---------- Subtle Matrix / Gold Floating Symbols ----------
const FLOATING_CHARS = ['⚡', '✨', '日', 'ﾊ', 'ﾐ', '0', '1', '🎉', '💻', '🚀'];

function floaters() {
  if (reduced()) return;
  for (let i = 0; i < 8; i++) {
    const e = document.createElement('div');
    e.className = 'fx-float';
    e.textContent = FLOATING_CHARS[i % FLOATING_CHARS.length];
    e.style.left = Math.random() * 100 + 'vw';
    e.style.fontSize = 18 + Math.random() * 16 + 'px';
    e.style.animationDuration = 18 + Math.random() * 18 + 's';
    e.style.animationDelay = -Math.random() * 20 + 's';
    e.style.color = '#facc15';
    e.style.textShadow = '0 0 8px rgba(250, 204, 21, 0.5)';
    document.body.appendChild(e);
  }
}

// ---------- Yellow / Gold Burst Confetti ----------
export function confetti(x, y) {
  if (reduced()) return;
  for (let i = 0; i < 32; i++) {
    const c = document.createElement('div');
    c.className = 'fx-conf';
    c.style.left = x + 'px';
    c.style.top = y + 'px';
    c.style.background = YELLOW_COLORS[i % YELLOW_COLORS.length];
    c.style.boxShadow = '0 0 6px rgba(250, 204, 21, 0.8)';
    c.style.setProperty('--dx', (Math.random() - 0.5) * 360 + 'px');
    c.style.setProperty('--dy', (Math.random() - 0.7) * 320 + 'px');
    c.style.setProperty('--rot', Math.random() * 720 + 'deg');
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1000);
  }
}

// ---------- Sparkle on Mouse Move ----------
let lastSparkle = 0;
function sparkle(e) {
  if (reduced()) return;
  const now = Date.now();
  if (now - lastSparkle < 90) return;
  lastSparkle = now;
  const s = document.createElement('div');
  s.className = 'fx-spark';
  s.textContent = '⚡';
  s.style.left = e.clientX + 'px';
  s.style.top = e.clientY + 'px';
  s.style.color = '#facc15';
  s.style.textShadow = '0 0 10px #facc15';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 700);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initMatrix();
    floaters();
  });
} else {
  initMatrix();
  floaters();
}

document.addEventListener('mousemove', sparkle);
document.addEventListener('click', (e) => {
  if (e.target.closest('button.join-btn')) {
    confetti(e.clientX, e.clientY);
  }
});
