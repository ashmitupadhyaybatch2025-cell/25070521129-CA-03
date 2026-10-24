// FLEXI fun effects — no React needed. Imported once in main.jsx.
// Respects prefers-reduced-motion; stays subtle and behind content.
const EMOJIS = ['🎉', '🎶', '⚽', '🎨', '💻', '🏆', '🎤', '✨', '🎮', '🚀'];
const COLORS = ['#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function floaters() {
  if (reduced()) return;
  // max 10 floating emojis
  for (let i = 0; i < 10; i++) {
    const e = document.createElement('div');
    e.className = 'fx-float';
    e.textContent = EMOJIS[i % EMOJIS.length];
    e.style.left = Math.random() * 100 + 'vw';
    e.style.fontSize = 20 + Math.random() * 22 + 'px';
    e.style.animationDuration = 16 + Math.random() * 18 + 's';
    e.style.animationDelay = -Math.random() * 20 + 's';
    document.body.appendChild(e);
  }
}

export function confetti(x, y) {
  if (reduced()) return;
  for (let i = 0; i < 28; i++) {
    const c = document.createElement('div');
    c.className = 'fx-conf';
    c.style.left = x + 'px';
    c.style.top = y + 'px';
    c.style.background = COLORS[i % COLORS.length];
    c.style.setProperty('--dx', (Math.random() - 0.5) * 320 + 'px');
    c.style.setProperty('--dy', (Math.random() - 0.7) * 280 + 'px');
    c.style.setProperty('--rot', Math.random() * 720 + 'deg');
    document.body.appendChild(c);
    setTimeout(() => c.remove(), 1000);
  }
}

let last = 0;
function sparkle(e) {
  if (reduced()) return;
  const now = Date.now();
  if (now - last < 80) return;
  last = now;
  const s = document.createElement('div');
  s.className = 'fx-spark';
  s.textContent = '✨';
  s.style.left = e.clientX + 'px';
  s.style.top = e.clientY + 'px';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 700);
}

window.addEventListener('load', floaters);
document.addEventListener('mousemove', sparkle);
document.addEventListener('click', (e) => {
  if (e.target.closest('button.join-btn')) {
    confetti(e.clientX, e.clientY);
  }
});
