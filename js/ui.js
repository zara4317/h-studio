(function () {
  var pre = document.querySelector('.pre');
  function done() {
    if (!pre) return;
    var shown = parseFloat(getComputedStyle(pre).opacity) > 0.01;
    if (!shown) { pre.remove(); pre = null; return; }
    var el = pre;
    pre = null;
    el.style.opacity = getComputedStyle(el).opacity;
    el.classList.add('is-done');
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.style.opacity = '0'; }); });
    setTimeout(function () { el.remove(); }, 500);
  }
  if (document.readyState === 'complete') done(); else window.addEventListener('load', done);

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
  var PAL = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.7-1.6 1.6-1.6H16a5 5 0 0 0 5-5C21 6.4 17 3 12 3z"></path><circle cx="7.5" cy="11" r="1"></circle><circle cx="10.5" cy="7" r="1"></circle><circle cx="15" cy="7.5" r="1"></circle></svg>';
  var fab = document.createElement('div');
  fab.className = 'fab';
  var pal = document.createElement('button');
  pal.type = 'button';
  pal.className = 'fab__btn pal-btn';
  pal.setAttribute('aria-label', 'Цвет сайта');
  pal.title = 'Цвет сайта';
  pal.innerHTML = PAL;
  var th = document.createElement('button');
  th.type = 'button';
  th.className = 'fab__btn fab__theme';
  function headerTheme() { return document.querySelector('.header .hd-tools .theme-btn:not(.pal-btn)'); }
  function syncTheme() {
    var h = headerTheme();
    if (!h) return;
    th.innerHTML = h.innerHTML;
    th.title = h.title || 'Тема';
    th.setAttribute('aria-label', 'Переключить тему');
  }
  th.addEventListener('click', function () {
    var h = headerTheme();
    if (h) h.click();
    setTimeout(syncTheme, 30);
    setTimeout(syncTheme, 200);
  });
  fab.appendChild(pal);
  fab.appendChild(th);
  fab.appendChild(top);
  document.body.appendChild(fab);
  syncTheme();
  setTimeout(syncTheme, 100);
  setTimeout(syncTheme, 600);

  var VARS = ['--bg', '--fg', '--line-2', '--muted', '--text2'];
  function sync() {
    var pg = document.querySelector('.page');
    if (!pg) return;
    var cs = getComputedStyle(pg);
    [fab, document.querySelector('.ck')].forEach(function (el) {
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
