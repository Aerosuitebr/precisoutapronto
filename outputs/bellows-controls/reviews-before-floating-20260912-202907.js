(() => {
  const panel = document.querySelector('.reviews-panel');
  if (!panel) return;
  const slides = [...panel.querySelectorAll('.review-slide')];
  const dots = [...panel.querySelectorAll('.reviews-dots button')];
  const pause = panel.querySelector('.reviews-pause');
  let index = 0, paused = false, timer;
  function schedule() {
    clearTimeout(timer);
    if (!paused && !document.hidden && !panel.querySelector('details[open]')) timer = setTimeout(() => show(index + 1), 5000);
  }
  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => { slide.hidden = i !== index; });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
    panel.style.setProperty('--review-run', 'none');
    void panel.offsetWidth;
    panel.style.setProperty('--review-run', 'review-progress 5s linear forwards');
    schedule();
  }
  function setPaused(value) {
    paused = value;
    pause.textContent = paused ? '▷' : 'Ⅱ';
    panel.classList.toggle('is-paused', paused);
    pause.setAttribute('aria-label', paused ? 'Continuar depoimentos' : 'Pausar depoimentos');
    pause.title = pause.getAttribute('aria-label');
    schedule();
  }
  pause.addEventListener('click', () => setPaused(!paused));
  panel.querySelector('.reviews-prev').addEventListener('click', () => { setPaused(true); show(index - 1); });
  panel.querySelector('.reviews-next').addEventListener('click', () => { setPaused(true); show(index + 1); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { setPaused(true); show(i); }));
  panel.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => { if (detail.open) setPaused(true); }));
  panel.addEventListener('mouseenter', () => clearTimeout(timer));
  panel.addEventListener('mouseleave', schedule);
  panel.addEventListener('focusin', () => clearTimeout(timer));
  panel.addEventListener('focusout', event => { if (!panel.contains(event.relatedTarget)) schedule(); });
  document.addEventListener('visibilitychange', schedule);
  show(0);
})();

(() => {
 const floating = document.querySelector('.floating-contact');
 if (!floating || !('IntersectionObserver' in window)) return;
 const visible = new Set();
 const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
  floating.hidden = visible.size > 0;
 }, {threshold: 0});
 document.querySelectorAll('#contato, footer').forEach(el => observer.observe(el));
})();
