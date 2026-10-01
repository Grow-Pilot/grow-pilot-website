/* GrowPilot — site.js : scroll-reveal, tellende cijfers, video, menu, cookie */
var GP_EN = document.documentElement.lang === 'en';
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Scroll-reveal */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.setAttribute('data-reveal', 'in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.setAttribute('data-reveal', 'in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* Tellende cijfers (nl-NL notatie, 2,2 s ease-out) */
  var fmt = function (n) { return Math.round(n).toLocaleString(GP_EN ? 'en-GB' : 'nl-NL'); };
  var counters = document.querySelectorAll('[data-count]');
  var runCount = function (el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var dur = 2200, start = null;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
    };
    requestAnimationFrame(step);
  };
  if (!reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { runCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* Video: poster -> YouTube nocookie embed */
  var playBtn = document.getElementById('play-btn');
  var frame = document.getElementById('video-frame');
  if (playBtn && frame) {
    var id = frame.getAttribute('data-video') || 'Q0wPi7Shk6I';
    var loadVideo = function () {
      var ifr = document.createElement('iframe');
      ifr.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1&autoplay=1';
      ifr.title = GP_EN ? 'GrowPilot video' : 'Uitlegvideo GrowPilot';
      ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      ifr.allowFullscreen = true;
      frame.innerHTML = '';
      frame.appendChild(ifr);
    };
    playBtn.addEventListener('click', loadVideo);
    frame.addEventListener('click', function (e) { if (e.target === frame || e.target.classList.contains('video-poster')) loadVideo(); });
  }

  /* Mobiel menu */
  var burger = document.getElementById('nav-burger');
  var menu = document.getElementById('nav-menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* Cookie-banner */
  var banner = document.getElementById('cookie-banner');
  var ok = document.getElementById('cookie-ok');
  try {
    if (banner && !localStorage.getItem('gp_cookie_ok')) banner.hidden = false;
    if (ok) ok.addEventListener('click', function () {
      localStorage.setItem('gp_cookie_ok', '1');
      banner.hidden = true;
    });
  } catch (e) { if (banner) banner.hidden = false; }
})();

/* Klanten: filter op padregistratie */
(function () {
  var bar = document.getElementById('kfilter'); if (!bar) return;
  var cards = document.querySelectorAll('.kcard'); var count = document.getElementById('kcount');
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    bar.querySelectorAll('button').forEach(function (x) { x.classList.remove('is-on'); });
    b.classList.add('is-on');
    var sys = b.getAttribute('data-sys'), n = 0;
    cards.forEach(function (c) { var show = sys === 'alle' || c.getAttribute('data-sys') === sys; c.hidden = !show; if (show) n++; });
    if (count) count.textContent = n + (GP_EN ? (n === 1 ? ' company' : ' companies') : (n === 1 ? ' bedrijf' : ' bedrijven'));
  });
})();

/* Functionaliteiten: filter op status */
(function () {
  var bar = document.getElementById('ffilter'); if (!bar) return;
  var cards = document.querySelectorAll('.fcard'); var count = document.getElementById('fcount');
  bar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    bar.querySelectorAll('button').forEach(function (x) { x.classList.remove('is-on'); });
    b.classList.add('is-on');
    var st = b.getAttribute('data-status'), n = 0;
    cards.forEach(function (c) { var show = st === 'alle' || c.getAttribute('data-status') === st; c.hidden = !show; if (show) n++; });
    if (count) count.textContent = n + (n === 1 ? ' update' : ' updates');
  });
})();

/* Formulieren: web3forms */
(function () {
  function wire(id, onSuccess) {
    var form = document.getElementById(id); if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]'); var orig = btn.textContent;
      var bad = false;
      form.querySelectorAll('input[required]').forEach(function (i) { var ok = i.checkValidity(); i.classList.toggle('is-error', !ok); if (!ok) bad = true; });
      if (bad) return;
      btn.disabled = true; btn.textContent = GP_EN ? 'Sending…' : 'Versturen…'; btn.style.opacity = '.7';
      var fail = function () { alert(GP_EN ? 'Something went wrong. Please try again or email info@grow-pilot.nl' : 'Er ging iets mis. Probeer opnieuw of mail naar info@grow-pilot.nl'); btn.disabled = false; btn.textContent = orig; btn.style.opacity = '1'; };
      fetch('https://api.web3forms.com/submit', { method: 'POST', body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (d) { if (d.success) onSuccess(form); else fail(); })
        .catch(fail);
    });
  }
  wire('demo-form', function () { window.location.href = GP_EN ? '/en/demo/applied/' : '/demo/aangemeld/'; });
  wire('contact-form', function (form) { form.hidden = true; var ok = document.getElementById('contact-ok'); if (ok) ok.hidden = false; });
})();

/* Demo: modal + app-slider */
(function () {
  var modal = document.getElementById('demo-modal');
  if (modal) {
    var open = function (e) { e.preventDefault(); modal.hidden = false; document.body.classList.add('modal-open'); var f = modal.querySelector('input[type=text]'); if (f) setTimeout(function () { f.focus(); }, 50); };
    var close = function () { modal.hidden = true; document.body.classList.remove('modal-open'); };
    document.querySelectorAll('.js-open-demo').forEach(function (b) { b.addEventListener('click', open); });
    document.querySelectorAll('.js-close-demo').forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
    if (location.hash === '#demo-modal') modal.hidden = false;
  }
  var sl = document.getElementById('app-slider');
  if (sl) {
    var slides = sl.querySelectorAll('.slide'), i = 0, label = document.getElementById('slider-label');
    var show = function (n) { slides[i].classList.remove('is-on'); i = (n + slides.length) % slides.length; slides[i].classList.add('is-on'); if (label) label.textContent = slides[i].getAttribute('data-label'); };
    sl.querySelectorAll('.slider-arrow').forEach(function (b) { b.addEventListener('click', function () { show(i + parseInt(b.getAttribute('data-dir'), 10)); }); });
  }
})();

/* Generieke sliders (.gslider) */
(function () {
  document.querySelectorAll('.gslider').forEach(function (sl) {
    var slides = sl.querySelectorAll('.slide'), i = 0, cur = sl.querySelector('.gcur');
    var show = function (n) { slides[i].classList.remove('is-on'); i = (n + slides.length) % slides.length; slides[i].classList.add('is-on'); if (cur) cur.textContent = i + 1; };
    sl.querySelectorAll('.slider-arrow').forEach(function (b) { b.addEventListener('click', function () { show(i + parseInt(b.getAttribute('data-dir'), 10)); }); });
  });
})();

