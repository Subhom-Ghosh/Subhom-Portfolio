/* ─── TYPING ANIMATION ─────────────────────────────────────── */
const phrases = [
  'Building intelligent solutions with code...',
  'Exploring the frontiers of AI & ML...',
  'Leading, learning, and building...',
  'Turning ideas into reality, one commit at a time.',
  'Passionate about NLP and intelligent systems.',
];
let pi = 0, ci = 0, deleting = false, wait = 0;
function type() {
  const el = document.getElementById('typed-text');
  const current = phrases[pi];
  if (wait > 0) { wait--; setTimeout(type, 50); return; }
  if (!deleting) {
    el.textContent = current.slice(0, ++ci);
    if (ci === current.length) { deleting = true; wait = 40; }
    setTimeout(type, 55);
  } else {
    el.textContent = current.slice(0, --ci);
    if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; wait = 8; }
    setTimeout(type, 28);
  }
}
type();

/* ─── SCROLL REVEAL ─────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObs.observe(el));

/* ─── SKILL BAR ANIMATION ───────────────────────────────────── */
const bars = document.querySelectorAll('.bar-fill');
const barObs = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('animate'); barObs.unobserve(e.target); } });
}, { threshold: 0.5 });
bars.forEach(b => barObs.observe(b));

/* ─── HAMBURGER NAV ─────────────────────────────────────────── */
function toggleNav() {
  document.getElementById('nav-links').classList.toggle('open');
}

/* ─── SMOOTH ACTIVE NAV ─────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.getAttribute('id');
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--cyan)' : '';
  });
});


/* ─── INVOLVEMENT & ACHIEVEMENTS SLIDER ─────────────────────── */
(function () {
  // FIX: select by class inside #leadership, not by non-existent id
  const track  = document.querySelector('#leadership .track-outer');
  const slider = document.getElementById('slider');
  const dotsEl = document.getElementById('dots');

  if (!track || !slider || !dotsEl) return;

  const originalCards = Array.from(slider.children);
  const cardCount     = originalCards.length;
  const GAP           = 20;

  // ── Build dots
  originalCards.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'dot' + (i === 0 ? ' active' : '');
    d.addEventListener('click', () => jumpTo(i));
    dotsEl.appendChild(d);
  });

  const allDots = () => Array.from(dotsEl.children);

  function setActiveDot(i) {
    allDots().forEach((d, idx) => d.classList.toggle('active', idx === i % cardCount));
  }

  // ── Clone cards for seamless infinite loop
  function cloneSet() {
    const frag = document.createDocumentFragment();
    originalCards.forEach(c => frag.appendChild(c.cloneNode(true)));
    return frag;
  }

  slider.prepend(cloneSet());
  slider.appendChild(cloneSet());

  // ── Measure
  function cardWidth() {
    return slider.children[0].offsetWidth + GAP;
  }

  function totalSetWidth() {
    return cardWidth() * cardCount;
  }

  let position  = 0;
  let rafId     = null;
  let isPaused  = false;
  let pauseTimer = null;

  const AUTO_SPEED = 0.6;

  function initPosition() {
    position = -totalSetWidth();
    slider.style.transform = `translateX(${position}px)`;
  }
  initPosition();

  function wrapPosition() {
    const setW = totalSetWidth();
    if (position <= -setW * 2) position += setW;
    if (position > 0)          position -= setW;
  }

  function applyTransform(smooth) {
    slider.style.transition = smooth
      ? 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none';
    slider.style.transform = `translateX(${position}px)`;
  }

  function updateDot() {
    const setW   = totalSetWidth();
    const cW     = cardWidth();
    const offset = ((-position) % setW + setW) % setW;
    const idx    = Math.round(offset / cW) % cardCount;
    setActiveDot(idx);
  }

  function jumpTo(i) {
    const setW   = totalSetWidth();
    const cW     = cardWidth();
    const offset = ((-position) % setW + setW) % setW;
    const cur    = Math.round(offset / cW) % cardCount;
    const diff   = i - cur;
    position    -= diff * cW;
    applyTransform(true);
    updateDot();
    pauseTemp();
  }

  function autoLoop() {
    if (!isPaused) {
      position -= AUTO_SPEED;
      wrapPosition();
      slider.style.transition = 'none';
      slider.style.transform  = `translateX(${position}px)`;
      updateDot();
    }
    rafId = requestAnimationFrame(autoLoop);
  }

  rafId = requestAnimationFrame(autoLoop);

  function pauseTemp(ms = 3200) {
    isPaused = true;
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => { isPaused = false; }, ms);
  }

  // ── Arrow buttons
  const btnLeft  = document.getElementById('btnLeft');
  const btnRight = document.getElementById('btnRight');
  if (btnLeft)  btnLeft.addEventListener('click',  () => { position += cardWidth(); wrapPosition(); applyTransform(true); updateDot(); pauseTemp(); });
  if (btnRight) btnRight.addEventListener('click', () => { position -= cardWidth(); wrapPosition(); applyTransform(true); updateDot(); pauseTemp(); });

  // ── Drag / Swipe
  let isDragging   = false;
  let dragStartX   = 0;
  let dragLastX    = 0;
  let dragStartPos = 0;
  let dragVelX     = 0;
  let lastMoveTime = 0;
  let lastMoveX    = 0;

  function onDragStart(x) {
    isDragging   = true;
    dragStartX   = x;
    dragLastX    = x;
    dragStartPos = position;
    dragVelX     = 0;
    lastMoveX    = x;
    lastMoveTime = performance.now();
    track.classList.add('grabbing');
    slider.style.transition = 'none';
    isPaused = true;
    clearTimeout(pauseTimer);
  }

  function onDragMove(x) {
    if (!isDragging) return;
    const dx  = x - dragStartX;
    const now = performance.now();
    const dt  = now - lastMoveTime;
    if (dt > 0) dragVelX = (x - lastMoveX) / dt * 16;
    lastMoveX    = x;
    lastMoveTime = now;
    dragLastX    = x;
    position     = dragStartPos + dx;
    wrapPosition();
    slider.style.transform = `translateX(${position}px)`;
    updateDot();
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('grabbing');
    let vel = -dragVelX;
    const friction = 0.92;
    function glide() {
      if (Math.abs(vel) < 0.2) { snapToNearest(); pauseTemp(2400); return; }
      position += -vel;
      vel      *= friction;
      wrapPosition();
      slider.style.transform = `translateX(${position}px)`;
      updateDot();
      requestAnimationFrame(glide);
    }
    requestAnimationFrame(glide);
  }

  function snapToNearest() {
    const cW   = cardWidth();
    const setW = totalSetWidth();
    let norm   = position;
    while (norm > -setW)     norm -= setW;
    while (norm < -setW * 2) norm += setW;
    const nearest = Math.round(-norm / cW) * cW;
    position      = -nearest - setW;
    wrapPosition();
    applyTransform(true);
    updateDot();
  }

  // Mouse
  track.addEventListener('mousedown', e => { e.preventDefault(); onDragStart(e.clientX); });
  window.addEventListener('mousemove', e => onDragMove(e.clientX));
  window.addEventListener('mouseup', () => onDragEnd());

  // Touch
  track.addEventListener('touchstart', e => { onDragStart(e.touches[0].clientX); }, { passive: true });
  track.addEventListener('touchmove',  e => { onDragMove(e.touches[0].clientX); e.preventDefault(); }, { passive: false });
  track.addEventListener('touchend',   () => onDragEnd());

  // Hover pause
  track.addEventListener('mouseenter', () => { isPaused = true; clearTimeout(pauseTimer); });
  track.addEventListener('mouseleave', () => { if (!isDragging) pauseTemp(600); });

  window.addEventListener('resize', initPosition);
})();


/* ─── CERTIFICATIONS SLIDER ─────────────────────────────────── */
(function () {
  function initCertSlider() {
    const slider = document.querySelector('#certSlider');
    const dotsEl = document.querySelector('#certDots');

    if (!slider || !dotsEl) { console.warn('Cert slider or dots not found'); return; }

    // FIX: go up to .slider-wrapper so both arrow buttons are siblings
    const track = slider.parentElement;
    if (!track) { console.warn('Cert track not found'); return; }

    const originalCards = Array.from(slider.querySelectorAll('.certifications-card'));
    if (originalCards.length === 0) { console.warn('No certification cards found'); return; }

    const cardCount = originalCards.length;
    const GAP       = 20;
    let cardWidth   = 290;
    let setWidth    = 0;

    // ── Build dots
    dotsEl.innerHTML = '';
    originalCards.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'dot' + (i === 0 ? ' active' : '');
      d.addEventListener('click', () => snapToCard(i));
      dotsEl.appendChild(d);
    });

    const dots = Array.from(dotsEl.querySelectorAll('.dot'));

    function setActiveDot(i) {
      dots.forEach((d, idx) => d.classList.toggle('active', idx === (i % cardCount)));
    }

    // ── Clone cards
    function cloneSet() {
      const frag = document.createDocumentFragment();
      originalCards.forEach(c => frag.appendChild(c.cloneNode(true)));
      return frag;
    }

    slider.insertBefore(cloneSet(), slider.firstChild);
    slider.appendChild(cloneSet());

    void slider.offsetHeight; // force reflow

    // ── Measure
    function recalc() {
      const c = slider.querySelector('.certifications-card');
      if (c) {
        const rect = c.getBoundingClientRect();
        if (rect.width > 0) cardWidth = rect.width;
      }
      setWidth = cardCount * (cardWidth + GAP);
    }

    // ── State
    let position   = 0;
    let isPaused   = false;
    let pauseTimer = null;
    let isDragging = false;

    const AUTO_SPEED = 0.6;

    function setTransform(val) {
      position = val;
      slider.style.transform = 'translateX(' + val + 'px)';
    }

    function initPos() {
      recalc();
      setTransform(-setWidth);
      updateDot();
    }
    initPos();

    function wrap() {
      if (position <= -setWidth * 2) {
        position += setWidth;
        slider.style.transform = 'translateX(' + position + 'px)';
      }
      if (position > 0) {
        position -= setWidth;
        slider.style.transform = 'translateX(' + position + 'px)';
      }
    }

    function applyTransform(smooth) {
      slider.style.transition = smooth ? 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none';
      slider.style.transform  = 'translateX(' + position + 'px)';
    }

    function updateDot() {
      if (setWidth === 0) return;
      const offset = ((-position) % setWidth + setWidth) % setWidth;
      const idx    = Math.round(offset / (cardWidth + GAP)) % cardCount;
      setActiveDot(idx);
    }

    function snapToCard(i) {
      const offset = ((-position) % setWidth + setWidth) % setWidth;
      const cur    = Math.round(offset / (cardWidth + GAP)) % cardCount;
      const diff   = i - cur;
      position    -= diff * (cardWidth + GAP);
      applyTransform(true);
      updateDot();
      pauseTemp();
    }

    // ── Pause helper (defined before button wiring)
    function pauseTemp(ms) {
      ms = ms || 3200;
      isPaused = true;
      clearTimeout(pauseTimer);
      pauseTimer = setTimeout(function () { isPaused = false; }, ms);
    }

    // ── Auto scroll
    function autoLoop() {
      if (!isPaused && setWidth > 0) {
        position += AUTO_SPEED;
        wrap();
        slider.style.transition = 'none';
        slider.style.transform  = 'translateX(' + position + 'px)';
        updateDot();
      }
      requestAnimationFrame(autoLoop);
    }
    autoLoop();

    // ── Arrow buttons (FIX: wired after pauseTemp is defined)
    var btnLeft  = document.getElementById('certBtnLeft');
    var btnRight = document.getElementById('certBtnRight');
    if (btnLeft)  btnLeft.addEventListener('click',  function () { position -= (cardWidth + GAP); wrap(); applyTransform(true); updateDot(); pauseTemp(); });
    if (btnRight) btnRight.addEventListener('click', function () { position += (cardWidth + GAP); wrap(); applyTransform(true); updateDot(); pauseTemp(); });

    // ── Drag / Swipe
    let dragStartX   = 0;
    let dragStartPos = 0;
    let dragVelX     = 0;
    let lastMoveTime = 0;
    let lastMoveX    = 0;

    function onDragStart(x) {
      isDragging   = true;
      dragStartX   = x;
      dragStartPos = position;
      dragVelX     = 0;
      lastMoveX    = x;
      lastMoveTime = performance.now();
      track.classList.add('grabbing');
      slider.style.transition = 'none';
      isPaused = true;
      clearTimeout(pauseTimer);
    }

    function onDragMove(x) {
      if (!isDragging) return;
      var dx  = x - dragStartX;
      var now = performance.now();
      var dt  = now - lastMoveTime;
      if (dt > 0) dragVelX = (x - lastMoveX) / dt * 16;
      lastMoveX    = x;
      lastMoveTime = now;
      setTransform(dragStartPos + dx);
      wrap();
      updateDot();
    }

    function onDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('grabbing');
      var vel     = -dragVelX;
      var friction = 0.92;
      function glide() {
        if (Math.abs(vel) < 0.2) { snapToNearest(); pauseTemp(2400); return; }
        position += -vel;
        vel      *= friction;
        wrap();
        slider.style.transform = 'translateX(' + position + 'px)';
        updateDot();
        requestAnimationFrame(glide);
      }
      requestAnimationFrame(glide);
    }

    function snapToNearest() {
      if (setWidth === 0) return;
      var norm = position;
      while (norm > -setWidth)     norm -= setWidth;
      while (norm < -setWidth * 2) norm += setWidth;
      var nearest = Math.round(-norm / (cardWidth + GAP)) * (cardWidth + GAP);
      position    = -nearest - setWidth;
      wrap();
      applyTransform(true);
      updateDot();
    }

    // Mouse
    track.addEventListener('mousedown', function (e) { e.preventDefault(); onDragStart(e.clientX); });
    window.addEventListener('mousemove', function (e) { onDragMove(e.clientX); });
    window.addEventListener('mouseup',   function ()  { onDragEnd(); });

    // Touch
    track.addEventListener('touchstart', function (e) { onDragStart(e.touches[0].clientX); }, { passive: true });
    track.addEventListener('touchmove',  function (e) { onDragMove(e.touches[0].clientX); e.preventDefault(); }, { passive: false });
    track.addEventListener('touchend',   function ()  { onDragEnd(); });

    // Hover pause
    track.addEventListener('mouseenter', function () { isPaused = true; clearTimeout(pauseTimer); });
    track.addEventListener('mouseleave', function () { if (!isDragging) pauseTemp(600); });

    window.addEventListener('resize', function () { initPos(); });
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(initCertSlider, 100); });
  } else {
    setTimeout(initCertSlider, 100);
  }
})();


/* ─── CONTACT FORM ──────────────────────────────────────────── */
function handleSubmit(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button[type=submit]');
  btn.innerHTML = 'Sending...';
  btn.disabled  = true;

  const formData = {
    name:    e.target.name.value,
    email:   e.target.email.value,
    message: e.target.message.value
  };

  fetch("https://script.google.com/macros/s/AKfycbxCO5DzwcCI7g6-qmSXGzLcknIu9mTod_RQ-jUt-px6IDuvz0EN1h2s8E7QE8Sed-w/exec", {
    method: "POST",
    body: JSON.stringify(formData)
  })
  .then(res => res.json())
  .then(() => {
    btn.innerHTML = 'Message Sent!';
    e.target.reset();
  })
  .catch(() => {
    btn.innerHTML = 'Failed!';
  })
  .finally(() => {
    setTimeout(() => {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      btn.disabled  = false;
    }, 3000);
  });
}

/* ─── CLOSE NAV ON LINK CLICK ──────────────────────────────── */
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => document.getElementById('nav-links').classList.remove('open'));
});