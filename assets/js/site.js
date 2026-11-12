/* nobuhikoshigyo.github.io - interactions
   1. mobile nav   2. header + progress + parallax on scroll   3. scroll reveal
   4. contour lines   5. mycelium canvas   6. hero slideshow
   7. topic hover preview   8. duplicated marquee tracks */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* 1. Mobile navigation ------------------------------------------------ */
  var header = $('.site-header');
  var toggle = $('.nav-toggle');
  var nav = $('.nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  }

  /* 2. Scroll-linked: header state, progress bar, banner parallax ------- */
  var bar = document.createElement('div');
  bar.className = 'progress';
  document.body.appendChild(bar);
  var bannerImg = $('.banner img');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle('scrolled', y > 24);
    bar.style.setProperty('--p', max > 0 ? Math.min(1, y / max) : 0);
    if (bannerImg && !reduced) bannerImg.style.setProperty('--py', (y * 0.22).toFixed(1) + 'px');
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* 3. Scroll reveal ---------------------------------------------------- */
  var revealSel = '.section-head, .topic-row, .topic, .pub, .pub-group h2, .approach > div, ' +
    '.contact-card, .band-dark .wrap > *, .site-list li, .map-shell, .strip figure, .lede-block, .drift';
  var targets = $$(revealSel);
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) {
      var sibs = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
      el.style.setProperty('--d', Math.min(sibs, 6) * 70 + 'ms');
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* 4. Contour lines (topographic rings) behind hero / page heads ------- */
  function contours(host) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '-500 -500 1000 1000');
    svg.setAttribute('class', 'contours');
    svg.setAttribute('aria-hidden', 'true');
    var p1 = Math.random() * 6.28, p2 = Math.random() * 6.28, p3 = Math.random() * 6.28;
    for (var k = 1; k <= 16; k++) {
      var r = 30 + k * 28, pts = [], N = 90;
      for (var i = 0; i < N; i++) {
        var t = i / N * Math.PI * 2;
        var wob = 1 + 0.13 * Math.sin(3 * t + p1 + k * 0.12) + 0.08 * Math.sin(5 * t + p2 - k * 0.2) + 0.05 * Math.sin(8 * t + p3 + k * 0.33);
        pts.push((Math.cos(t) * r * wob).toFixed(1) + ' ' + (Math.sin(t) * r * wob).toFixed(1));
      }
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', 'M' + pts.join('L') + 'Z');
      svg.appendChild(path);
    }
    host.insertBefore(svg, host.firstChild);
  }
  $$('.hero, .page-head').forEach(contours);

  /* 5. Mycelium: hyphae growing across dark sections -------------------- */
  function mycelium(canvas) {
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, tips = [], segs = 0, fading = 0, running = false, raf = 0;

    function seed() {
      tips = []; segs = 0; fading = 0;
      var n = Math.max(3, Math.round(w / 300));
      for (var i = 0; i < n; i++) {
        var x = Math.random() * w, y = Math.random() * h;
        for (var k = 0; k < 3; k++) tips.push({ x: x, y: y, a: Math.random() * 6.283, life: 220 + Math.random() * 420, w: 1.15 });
      }
    }
    function size() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      seed();
    }
    function step() {
      for (var i = tips.length - 1; i >= 0; i--) {
        var t = tips[i];
        var nx = t.x + Math.cos(t.a) * 1.5, ny = t.y + Math.sin(t.a) * 1.5;
        ctx.beginPath(); ctx.moveTo(t.x, t.y); ctx.lineTo(nx, ny);
        ctx.lineWidth = t.w;
        ctx.strokeStyle = 'rgba(214,222,234,' + (0.16 + 0.34 * t.w / 1.15).toFixed(2) + ')';
        ctx.stroke();
        t.x = nx; t.y = ny; t.a += (Math.random() - 0.5) * 0.36; t.life--; segs++;
        if (Math.random() < 0.02 && tips.length < 170) {
          tips.push({ x: nx, y: ny, a: t.a + (Math.random() < 0.5 ? -1 : 1) * (0.45 + Math.random() * 0.6), life: t.life * 0.85, w: Math.max(0.35, t.w * 0.8) });
          ctx.beginPath(); ctx.arc(nx, ny, 1.4, 0, 6.283);
          ctx.fillStyle = 'rgba(200,85,61,0.85)'; ctx.fill();
        }
        if (t.life <= 0 || nx < -20 || ny < -20 || nx > w + 20 || ny > h + 20) tips.splice(i, 1);
      }
    }
    function frame() {
      if (!running) return;
      if (tips.length && segs < w * h / 45) { step(); step(); }
      else {
        fading++;
        if (fading > 160) {
          ctx.globalCompositeOperation = 'destination-out';
          ctx.fillStyle = 'rgba(0,0,0,0.035)'; ctx.fillRect(0, 0, w, h);
          ctx.globalCompositeOperation = 'source-over';
        }
        if (fading > 330) { ctx.clearRect(0, 0, w, h); seed(); }
      }
      raf = requestAnimationFrame(frame);
    }
    size();
    if (reduced) { for (var s = 0; s < 700 && tips.length; s++) step(); return; }
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); });
    new IntersectionObserver(function (en) {
      running = en[0].isIntersecting;
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(frame);
    }).observe(canvas);
  }
  var footer = $('.site-footer');
  if (footer) {
    var fc = document.createElement('canvas');
    fc.className = 'mycelium';
    fc.setAttribute('aria-hidden', 'true');
    footer.insertBefore(fc, footer.firstChild);
  }
  if ('IntersectionObserver' in window) $$('canvas.mycelium').forEach(mycelium);

  /* 6. Hero slideshow --------------------------------------------------- */
  var slides = $$('.arch img');
  if (slides.length > 1 && !reduced) {
    var cur = 0;
    setInterval(function () {
      slides[cur].classList.remove('on');
      cur = (cur + 1) % slides.length;
      slides[cur].classList.add('on');
    }, 6500);
  }

  /* 7. Topic rows: photo preview that follows the cursor ---------------- */
  var rows = $$('.topic-row[data-img]');
  if (rows.length && window.matchMedia('(hover: hover) and (min-width: 901px)').matches) {
    var pv = document.createElement('div');
    pv.className = 'hover-preview';
    var pimg = document.createElement('img');
    pimg.alt = '';
    pv.appendChild(pimg);
    document.body.appendChild(pv);
    var tx = 0, ty = 0, px = 0, py = 0, live = false;
    rows.forEach(function (r) {
      new Image().src = r.getAttribute('data-img');
      r.addEventListener('mouseenter', function () { pimg.src = r.getAttribute('data-img'); pv.classList.add('show'); live = true; loop(); });
      r.addEventListener('mouseleave', function () { pv.classList.remove('show'); live = false; });
      r.addEventListener('mousemove', function (e) { tx = e.clientX + 28; ty = e.clientY - 120; });
    });
    var looping = false;
    function loop() {
      if (looping) return; looping = true;
      (function tick() {
        px += (tx - px) * 0.14; py += (ty - py) * 0.14;
        var rot = Math.max(-6, Math.min(6, (tx - px) * 0.05));
        pv.style.transform = 'translate3d(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
        if (live || Math.abs(tx - px) > 0.5) requestAnimationFrame(tick); else looping = false;
      })();
    }
  }

  /* 8. Seamless loops: duplicate marquee / gallery content -------------- */
  $$('.marquee-track, .drift-track').forEach(function (t) {
    var clone = t.innerHTML;
    t.insertAdjacentHTML('beforeend', clone);
    $$('figure, span', t).slice(t.children.length / 2).forEach(function (el) { el.setAttribute('aria-hidden', 'true'); });
  });
})();
