(function () {
  var KEY = 'hs-cookie';
  var arrow = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"></path></svg>';

  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, JSON.stringify({ v: v, d: new Date().toISOString() })); } catch (e) {} }

  var top = document.createElement('button');
  top.type = 'button';
  top.className = 'to-top';
  top.setAttribute('aria-label', 'Наверх');
  top.innerHTML = arrow;
  top.addEventListener('click', function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  document.body.appendChild(top);

  var VARS = ['--bg', '--fg', '--line-2', '--muted', '--text2'];
  function sync() {
    var pg = document.querySelector('.page');
    if (!pg) return;
    var cs = getComputedStyle(pg);
    [top, document.querySelector('.ck')].forEach(function (el) {
      if (!el) return;
      VARS.forEach(function (k) { el.style.setProperty(k, cs.getPropertyValue(k)); });
    });
  }
  document.addEventListener('click', function () { setTimeout(sync, 60); });
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', function () { setTimeout(sync, 60); });
  }
  if (window.MutationObserver) new MutationObserver(function () { setTimeout(sync, 60); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-palette'] });
  setTimeout(sync, 0);
  setTimeout(sync, 400);

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      top.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.8);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (get()) return;

  var bar = document.createElement('div');
  bar.className = 'ck';
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-live', 'polite');
  bar.setAttribute('aria-label', 'Использование cookie');
  bar.innerHTML =
    '<p class="ck__t">Мы используем cookie</p>' +
    '<p class="ck__p">Сайт использует cookie, чтобы запоминать тему, цвет оформления и ваш выбор. Нажимая «Принять», вы соглашаетесь с обработкой данных по 152-ФЗ и <a href="privacy.html">Политикой конфиденциальности</a>.</p>' +
    '<div class="ck__b"><button type="button" class="ck__btn ck__btn--dark" data-ck="all">Принять</button><button type="button" class="ck__btn" data-ck="necessary">Только необходимые</button></div>';
  document.body.appendChild(bar);
  document.documentElement.classList.add('ck-open');
  sync();
  requestAnimationFrame(function () { requestAnimationFrame(function () { bar.classList.add('is-on'); }); });

  bar.addEventListener('click', function (e) {
    var b = e.target.closest('[data-ck]');
    if (!b) return;
    set(b.getAttribute('data-ck'));
    bar.classList.remove('is-on');
    document.documentElement.classList.remove('ck-open');
    setTimeout(function () { bar.remove(); }, 300);
  });
})();
