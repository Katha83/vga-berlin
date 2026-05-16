/* ============================================================
   ASSEKURANZCLUB BERLIN & OSTDEUTSCHLAND — script.js
   ============================================================ */

'use strict';

// ── Register GSAP Plugins ──────────────────────────────────────
gsap.registerPlugin(ScrollTrigger);

// ── Global state ──────────────────────────────────────────────
let lenis = null;
let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.set(dot, { x: mouseX, y: mouseY });
  });

  // Ring follows with lerp
  (function loop() {
    ringX += (mouseX - ringX) * 0.13;
    ringY += (mouseY - ringY) * 0.13;
    gsap.set(ring, { x: ringX, y: ringY });
    requestAnimationFrame(loop);
  })();

  // Hover state
  document.querySelectorAll(
    'a, button, .benefit-card, .team-card, .event-card-sm, .event-featured, .nav-cta'
  ).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });

  document.addEventListener('mouseleave', () => {
    gsap.to([dot, ring], { opacity: 0, duration: .3 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([dot, ring], { opacity: 1, duration: .3 });
  });
}

/* ============================================================
   PRELOADER
   ============================================================ */
function initPreloader() {
  const bar = document.getElementById('pl-bar');
  const pct = document.getElementById('pl-pct');
  if (!bar || !pct) { initMain(); return; }

  let progress = 0;
  const iv = setInterval(() => {
    progress += Math.random() * 14 + 4;
    if (progress >= 100) {
      progress = 100;
      clearInterval(iv);
      bar.style.width = '100%';
      pct.textContent = '100%';
      setTimeout(hidePreloader, 280);
      return;
    }
    bar.style.width = progress + '%';
    pct.textContent = Math.floor(progress) + '%';
  }, 70);
}

function hidePreloader() {
  gsap.to('#preloader', {
    clipPath: 'inset(0 0 100% 0)',
    duration: 1.3,
    ease: 'power4.inOut',
    onComplete: () => {
      const pl = document.getElementById('preloader');
      if (pl) pl.style.display = 'none';
      initMain();
    }
  });
}

/* ============================================================
   LENIS SMOOTH SCROLL
   ============================================================ */
function initLenis() {
  lenis = new Lenis({
    duration: 1.4,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Smooth anchor links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -80, duration: 1.6 });
    });
  });
}

/* ============================================================
   PARTICLE NETWORK (canvas hero background)
   ============================================================ */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT    = window.innerWidth < 768 ? 38 : 75;
  const MAX_DIST = 135;
  const particles = [];

  class Particle {
    constructor() { this.init(); }
    init() {
      this.x  = Math.random() * canvas.width;
      this.y  = Math.random() * canvas.height;
      this.vx = (Math.random() - .5) * .45;
      this.vy = (Math.random() - .5) * .45;
      this.r  = Math.random() * 1.5 + .5;
      this.a  = Math.random() * .45 + .15;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -60) this.x = canvas.width  + 60;
      if (this.x > canvas.width  + 60) this.x = -60;
      if (this.y < -60) this.y = canvas.height + 60;
      if (this.y > canvas.height + 60) this.y = -60;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(201,169,110,${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Particle());

  // Mouse influence
  let mx = -9999, my = -9999;
  canvas.parentElement.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  canvas.parentElement.addEventListener('mouseleave', () => { mx = -9999; my = -9999; });

  function drawEdges() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * .14;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(201,169,110,${alpha})`;
          ctx.lineWidth = .7;
          ctx.stroke();
        }
      }
      // Mouse connection
      const mdx  = particles[i].x - mx;
      const mdy  = particles[i].y - my;
      const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (mdist < 160) {
        const alpha = (1 - mdist / 160) * .4;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(mx, my);
        ctx.strokeStyle = `rgba(201,169,110,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  (function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawEdges();
    requestAnimationFrame(loop);
  })();
}

/* ============================================================
   NAVBAR – scroll behaviour
   ============================================================ */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  ScrollTrigger.create({
    start: 'top -80',
    onEnter:     () => nav.classList.add('scrolled'),
    onLeaveBack: () => nav.classList.remove('scrolled')
  });
}

/* ============================================================
   HERO ENTRANCE ANIMATIONS
   ============================================================ */
function initHeroAnimations() {
  const tl = gsap.timeline({ delay: .15 });

  tl.to('.hero-eyebrow', {
    opacity: 1, y: 0,
    duration: .9, ease: 'power3.out'
  });

  document.querySelectorAll('.hero-title .line-inner').forEach(el => {
    tl.to(el, {
      y: 0, opacity: 1,
      duration: 1.1, ease: 'power4.out'
    }, '-=.72');
  });

  tl.to('.hero-subtitle', {
    opacity: 1, y: 0,
    duration: .85, ease: 'power3.out'
  }, '-=.55')
  .to('.hero-ctas', {
    opacity: 1, y: 0,
    duration: .8, ease: 'power3.out'
  }, '-=.6')
  .to('.hero-stats', {
    opacity: 1, y: 0,
    duration: .8, ease: 'power3.out',
    onComplete: () => {
      runCounter('stat1', 2500, '+');
      runCounter('stat2', 15,   '');
      runCounter('stat3', 30,   '+');
    }
  }, '-=.6');
}

function runCounter(id, target, suffix) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = performance.now();
  const dur   = 1800;
  (function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const e = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.floor(e * target).toLocaleString('de-DE') + suffix;
    if (p < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString('de-DE') + suffix;
  })(performance.now());
}

/* ============================================================
   SCROLL-TRIGGERED ANIMATIONS
   ============================================================ */
function initScrollAnimations() {

  // ── About – slide in from sides ──
  gsap.from('.about-visual', {
    scrollTrigger: { trigger: '#about', start: 'top 78%' },
    x: -70, opacity: 0,
    duration: 1.3, ease: 'power4.out'
  });
  gsap.from('.about-text', {
    scrollTrigger: { trigger: '#about', start: 'top 78%' },
    x: 70, opacity: 0,
    duration: 1.3, ease: 'power4.out'
  });

  // ── Parallax on about visual ──
  gsap.to('.about-visual', {
    scrollTrigger: {
      trigger: '#about',
      start: 'top bottom',
      end:   'bottom top',
      scrub: 2
    },
    y: -55
  });

  // ── Hero canvas parallax ──
  gsap.to('#particle-canvas', {
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end:   'bottom top',
      scrub: true
    },
    y: 120
  });

  // ── Section titles ──
  gsap.utils.toArray('.section-title').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 88%' },
      y: 44, opacity: 0,
      duration: 1, ease: 'power3.out'
    });
  });

  gsap.utils.toArray('.section-subtitle').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%' },
      y: 28, opacity: 0,
      duration: .9, ease: 'power3.out',
      delay: .15
    });
  });

  // ── Benefit cards stagger ──
  gsap.from('.benefit-card', {
    scrollTrigger: {
      trigger: '.benefit-grid',
      start: 'top 85%'
    },
    opacity: 0, y: 40,
    duration: .85, ease: 'power3.out',
    stagger: { amount: .5, from: 'start' }
  });

  // ── Event cards ──
  gsap.from('.event-featured', {
    scrollTrigger: { trigger: '#events', start: 'top 82%' },
    x: -50, opacity: 0,
    duration: 1.1, ease: 'power4.out'
  });
  gsap.from('.event-card-sm', {
    scrollTrigger: { trigger: '.events-side', start: 'top 85%' },
    opacity: 0, y: 20,
    duration: .8, ease: 'power3.out',
    stagger: .12
  });

  // ── Team cards ──
  gsap.from('.team-card', {
    scrollTrigger: { trigger: '.team-grid', start: 'top 85%' },
    opacity: 0, y: 40,
    duration: .85, ease: 'power3.out',
    stagger: .15
  });

  // ── Contact form ──
  gsap.from('.form-wrap', {
    scrollTrigger: { trigger: '.form-wrap', start: 'top 85%' },
    opacity: 0, y: 30,
    duration: 1, ease: 'power3.out'
  });

  // ── Netzwerk header ──
  gsap.from('.netzwerk-header', {
    scrollTrigger: { trigger: '.netzwerk-header', start: 'top 82%' },
    y: 44, opacity: 0,
    duration: 1, ease: 'power3.out'
  });

  // ── Contact info blocks ──
  gsap.utils.toArray('.contact-block').forEach((el, i) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%' },
      x: -30, opacity: 0,
      duration: .8, ease: 'power3.out',
      delay: i * .12
    });
  });
}

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
function initMagnetic() {
  document.querySelectorAll('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
      const r  = this.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width  / 2);
      const dy = e.clientY - (r.top  + r.height / 2);
      gsap.to(this, {
        x: dx * .28, y: dy * .28,
        duration: .4, ease: 'power2.out'
      });
    });
    btn.addEventListener('mouseleave', function() {
      gsap.to(this, {
        x: 0, y: 0,
        duration: .7, ease: 'elastic.out(1, .45)'
      });
    });
  });
}

/* ============================================================
   HOVER GLOW ON TEAM / BENEFIT CARDS
   ============================================================ */
function initCardGlow() {
  document.querySelectorAll('.benefit-card, .team-card').forEach(card => {
    card.addEventListener('mousemove', function(e) {
      const r  = this.getBoundingClientRect();
      const x  = ((e.clientX - r.left) / r.width  * 100).toFixed(1);
      const y  = ((e.clientY - r.top)  / r.height * 100).toFixed(1);
      this.style.setProperty('--mx', x + '%');
      this.style.setProperty('--my', y + '%');
    });
  });
}

/* ============================================================
   CONTACT FORM – basic UX
   ============================================================ */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn  = form.querySelector('.btn-submit span');
    const orig = btn.textContent;
    btn.textContent = '✓ Nachricht gesendet!';
    btn.closest('button').style.background    = '#2d6a3f';
    btn.closest('button').style.borderColor   = '#2d6a3f';
    btn.closest('button').style.pointerEvents = 'none';
    setTimeout(() => {
      btn.textContent = orig;
      const b = btn.closest('button');
      b.style.background = b.style.borderColor = '';
      b.style.pointerEvents = '';
      form.reset();
    }, 3200);
  });

  // Live label lift
  form.querySelectorAll('input, textarea, select').forEach(input => {
    input.addEventListener('focus', () => {
      gsap.to(input, { borderColor: 'rgba(201,169,110,.7)', duration: .25 });
    });
    input.addEventListener('blur', () => {
      if (!input.value) {
        gsap.to(input, { borderColor: 'rgba(255,255,255,.1)', duration: .25 });
      }
    });
  });
}

/* ============================================================
   SECTION TAG LINES – animated entry
   ============================================================ */
function initSectionTags() {
  gsap.utils.toArray('.section-tag').forEach(el => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: 'top 90%' },
      x: -20, opacity: 0,
      duration: .7, ease: 'power3.out'
    });
  });
}

/* ============================================================
   INIT – called after preloader exits
   ============================================================ */
function initMain() {
  initLenis();
  initNavbar();
  initParticles();
  initHeroAnimations();
  initScrollAnimations();
  initMagnetic();
  initCardGlow();
  initContactForm();
  initSectionTags();
  ScrollTrigger.refresh();
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initPreloader();
});
