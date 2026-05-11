// ── CURSOR ──────────────────────────────────────────────
const cursor    = document.getElementById('cursor');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function animCursor() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursor.style.transform     = `translate(${mx - 4}px, ${my - 4}px)`;
  cursorRing.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
  requestAnimationFrame(animCursor);
})();

// ── SCROLL REVEAL ────────────────────────────────────────
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// ── THREE.JS — carregado via ES module em index.html ─────
// A função loadModel é exposta em window pelo módulo three-viewer.js
