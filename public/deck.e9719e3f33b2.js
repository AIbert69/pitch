(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const stage = document.querySelector('.stage');
  const tabs = document.querySelector('.page-tabs');
  const picker = document.querySelector('.page-picker');
  const previous = document.querySelector('#previous');
  const next = document.querySelector('#next');
  let current = 0;
  slides.forEach((slide, index) => {
    const number = String(index + 1).padStart(2, '0');
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.page = String(index + 1);
    button.textContent = number;
    button.setAttribute('aria-label', slide.getAttribute('aria-label'));
    button.addEventListener('click', () => show(index));
    tabs.append(button);
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = number + ' / ' + slides.length;
    picker.append(option);
  });
  function fit() {
    const scale = Math.min((innerWidth - 32) / 1600, (innerHeight - 88) / 900, 1.5);
    document.documentElement.style.setProperty('--scale', Math.max(.1, scale));
  }
  function show(index, updateHash = true) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    slides.forEach((slide, i) => { slide.hidden = i !== current; });
    tabs.querySelectorAll('button').forEach((button, i) => {
      if (i === current) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    picker.value = String(current);
    previous.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    document.querySelector('#page-status').textContent = slides[current].getAttribute('aria-label');
    if (updateHash) history.replaceState(null, '', '#s' + (current + 1));
    stage.scrollTo(0, 0);
  }
  function fromHash() {
    const match = /^#s(\d+)$/.exec(location.hash);
    show(match ? Number(match[1]) - 1 : 0, false);
  }
  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  picker.addEventListener('change', () => show(Number(picker.value)));
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable) return;
    if (event.key === ' ' && event.target.closest('button,a')) return;
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) { event.preventDefault(); show(current + 1); }
    if (['ArrowLeft', 'PageUp'].includes(event.key)) { event.preventDefault(); show(current - 1); }
    if (event.key === 'Home') { event.preventDefault(); show(0); }
    if (event.key === 'End') { event.preventDefault(); show(slides.length - 1); }
  });
  let touch;
  stage.addEventListener('touchstart', event => {
    if (event.touches.length === 1) touch = {x:event.touches[0].clientX, y:event.touches[0].clientY};
  }, {passive:true});
  stage.addEventListener('touchend', event => {
    if (!touch) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
    touch = null;
  }, {passive:true});
  const fullscreen = document.querySelector('#fullscreen');
  if (!document.fullscreenEnabled) fullscreen.hidden = true;
  fullscreen.addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { fullscreen.hidden = true; }
  });
  document.addEventListener('fullscreenchange', () => {
    fullscreen.setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen');
    fit();
  });
  window.addEventListener('resize', fit);
  window.addEventListener('hashchange', fromHash);
  fit(); fromHash();
})();
