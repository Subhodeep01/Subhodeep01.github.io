'use strict';
const proofs = [...document.querySelectorAll('details.proof')];
const toggle = document.getElementById('proof-toggle');
function sync() {
  const open = proofs.every(p => p.open);
  toggle.textContent = open ? 'Collapse proofs' : 'Expand all proofs';
  toggle.setAttribute('aria-pressed', String(open));
}
toggle.addEventListener('click', () => {
  const open = !proofs.every(p => p.open);
  proofs.forEach(p => p.open = open);
  sync();
});
proofs.forEach(p => p.addEventListener('toggle', sync));
document.getElementById('print-article').addEventListener('click', () => window.print());
let printState = [];
window.addEventListener('beforeprint', () => {printState = proofs.map(p => p.open); proofs.forEach(p => p.open = true);});
window.addEventListener('afterprint', () => {proofs.forEach((p,i) => p.open = printState[i]); sync();});
const toc = [...document.querySelectorAll('.toc a')];
const headings = [...document.querySelectorAll('article h2')];
function position() {
  const length = document.documentElement.scrollHeight - innerHeight;
  document.querySelector('.progress').style.width = (length > 0 ? 100 * scrollY / length : 0) + '%';
  const current = headings.filter(h => h.getBoundingClientRect().top < 170).at(-1) || headings[0];
  toc.forEach(a => {
    const active = a.hash === '#' + current.id;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current');
  });
}
window.addEventListener('scroll', position, {passive:true});
window.addEventListener('resize', position);
position();

const lab = document.getElementById('certificate-lab');
lab.innerHTML = '<span class="eyebrow">Try the certificate</span><h3>How tight does the bound need to be?</h3><p class="lab-intro">Illustrative numbers only. Hold the value of a fair candidate at 45 and ε at 0.10. Move the slider to see what happens if you have a valid upper bound U of that size.</p><label for="bound-input">Assumed valid upper bound U: <output id="bound-number" for="bound-input"></output></label><input id="bound-input" style="display:block;width:100%;accent-color:#325e50;margin:12px 0" type="range" min="45" max="170" step="1" value="100"><p id="bound-result" class="lab-caption" aria-live="polite"></p>';
const input = document.getElementById('bound-input');
function update() {
  const upper = Number(input.value);
  const threshold = upper * 0.4;
  document.getElementById('bound-number').textContent = String(upper);
  document.getElementById('bound-result').textContent = 'Required value: 0.40 × ' + upper + ' = ' + threshold.toFixed(1) + '. ' +
    (45 >= threshold ? '45 meets the threshold. If U is valid, the candidate is certified.' : '45 falls below the threshold. This test is inconclusive.');
}
input.addEventListener('input', update);
update();
