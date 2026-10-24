// ============================================================
// FLEXI Cyberpunk Yellow/Black FX (Confetti & Interactive Sparkles)
// Matrix rain is handled by the dedicated MatrixBackground React component
// ============================================================

const YELLOW_COLORS = ['#facc15', '#fde047', '#eab308', '#ffd700', '#ffffff'];

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Yellow / Gold Burst Confetti ----------
export function confetti(x, y) {
  if (reduced()) return;
  for (let i = 0; i < 32; i++) {
    const c = document.createElement('div');
    c.className = 'fx-conf';
    c.style.left = x + 'px';
    c.style.top = y + 'px';
    c.style.background = YELLOW_COLORS[i % YELLOW_COLORS.length];
    c.style.boxShadow = '0 0 8px rgba(250, 204, 21, 0.8)';
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

document.addEventListener('mousemove', sparkle);
document.addEventListener('click', (e) => {
  if (e.target.closest('button.join-btn')) {
    confetti(e.clientX, e.clientY);
  }
});
