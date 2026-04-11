
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


/*  Slider of Involvement and Achievements */ 
(function () {
  const track   = document.getElementById('trackOuter');
  const slider  = document.getElementById('slider');
  const dotsEl  = document.getElementById('dots');
  const hint    = document.getElementById('dragHint');

  // ── Gather original cards
  const originalCards = Array.from(slider.children);
  const cardCount     = originalCards.length;
  const GAP           = 20;

  // ── Build dots (only for originals)
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

  // ── Clone cards for seamless infinite loop (prepend + append set)
  function cloneSet() {
    const frag = document.createDocumentFragment();
    originalCards.forEach(c => frag.appendChild(c.cloneNode(true)));
    return frag;
  }

  slider.prepend(cloneSet()); // one set before
  slider.appendChild(cloneSet()); // one set after

  // ── Measure
  function cardWidth() {
    return slider.children[0].offsetWidth + GAP;
  }

  function totalSetWidth() {
    return cardWidth() * cardCount;
  }

  // Position tracker (in px, raw offset from left)
  let position   = 0;         // current visual x offset
  let velocity   = 0;         // px/frame inertia
  let rafId      = null;
  let isPaused   = false;     // user paused auto-scroll
  let pauseTimer = null;

  // Auto-scroll speed (px per frame at 60fps)
  const AUTO_SPEED = 0.6;

  // ── Set initial offset so we start at the "real" first clone set
  function initPosition() {
    position = -totalSetWidth(); // start at the middle clone set
    slider.style.transform = `translateX(${position}px)`;
  }
  initPosition();

  // ── Seamless wrap
  function wrapPosition() {
    const setW = totalSetWidth();
    // If we've scrolled past the end of the real set (into 3rd clone)
    if (position <= -setW * 2) {
      position += setW;
    }
    // If we've scrolled back past the start (into nothing before 1st clone)
    if (position > 0) {
      position -= setW;
    }
  }

  function applyTransform(smooth) {
    slider.style.transition = smooth
      ? 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none';
    slider.style.transform = `translateX(${position}px)`;
  }

  // ── Active dot from current position
  function updateDot() {
    const setW    = totalSetWidth();
    const cW      = cardWidth();
    const offset  = ((-position) % setW + setW) % setW;
    const idx     = Math.round(offset / cW) % cardCount;
    setActiveDot(idx);
  }

  // ── Dot jump
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

  // ── Auto scroll loop
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

  // ── Pause helpers
  function pauseTemp(ms = 3200) {
    isPaused = true;
    clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => {
      isPaused = false;
    }, ms);
  }

  // ─────────────────────────────────────────
  //  DRAG / SWIPE (mouse + touch)
  // ─────────────────────────────────────────
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
    hint.classList.add('hidden');
  }

  function onDragMove(x) {
    if (!isDragging) return;
    const dx   = x - dragStartX;
    const now  = performance.now();
    const dt   = now - lastMoveTime;

    if (dt > 0) {
      dragVelX = (x - lastMoveX) / dt * 16; // normalize to ~60fps frame
    }

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

    // Momentum glide
    let vel = -dragVelX; // invert: drag right => scroll left
    const friction = 0.92;

    function glide() {
      if (Math.abs(vel) < 0.2) {
        // Snap to nearest card
        snapToNearest();
        pauseTemp(2400);
        return;
      }
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
    const cW     = cardWidth();
    const setW   = totalSetWidth();
    // Normalize position into the middle set
    let norm = position;
    while (norm > -setW)    norm -= setW;
    while (norm < -setW * 2) norm += setW;

    const nearest = Math.round(-norm / cW) * cW;
    position      = -nearest - setW;

    // Re-apply wrap just in case
    wrapPosition();
    applyTransform(true);
    updateDot();
  }

  // Mouse events
  track.addEventListener('mousedown', e => {
    e.preventDefault();
    onDragStart(e.clientX);
  });
  window.addEventListener('mousemove', e => onDragMove(e.clientX));
  window.addEventListener('mouseup', () => onDragEnd());

  // Touch events
  track.addEventListener('touchstart', e => {
    onDragStart(e.touches[0].clientX);
  }, { passive: true });
  track.addEventListener('touchmove', e => {
    onDragMove(e.touches[0].clientX);
    e.preventDefault();
  }, { passive: false });
  track.addEventListener('touchend', () => onDragEnd());

  // Hover pause
  track.addEventListener('mouseenter', () => { isPaused = true; clearTimeout(pauseTimer); });
  track.addEventListener('mouseleave', () => {
    if (!isDragging) pauseTemp(600);
  });

  // ── Init
  window.addEventListener('resize', initPosition);
})();


/* Certificate Section
*/






/* ─── CONTACT FORM ──────────────────────────────────────────── */
function handleSubmit(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button[type=submit]');
  btn.innerHTML = 'Sending...';
  btn.disabled = true;

  const formData = {
    name: e.target.name.value,
    email: e.target.email.value,
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
      btn.innerHTML = 'Send Message';
      btn.disabled = false;
    }, 3000);
  });
}
/* ─── CLOSE NAV ON LINK CLICK ──────────────────────────────── */
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => document.getElementById('nav-links').classList.remove('open'));
});


