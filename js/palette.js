(function () {
  var P = [
    { id: 'classic', name: 'Классика', year: 'H-studio', sw: '#111111' },
    { id: 'cloud', name: 'Cloud Dancer', year: '2026 · 11-4201', sw: '#F0EEE9', bg: '#F0EEE9', glass: 'rgba(240,238,233,0.5)', ac: '#2E2B27', ac2: '#55504A', band: '#2E2B27', line: 'rgba(46,43,39,0.16)' },
    { id: 'mocha', name: 'Mocha Mousse', year: '2025 · 17-1230', sw: '#A47864', bg: '#F5EFEB', glass: 'rgba(245,239,235,0.5)', ac: '#A47864', ac2: '#8A6250', band: '#4A362C', line: 'rgba(164,120,100,0.28)' },
    { id: 'peach', name: 'Peach Fuzz', year: '2024 · 13-1023', sw: '#FFBE98', bg: '#FFF5EF', glass: 'rgba(255,245,239,0.5)', ac: '#C8734B', ac2: '#AE5F3A', band: '#5A3526', line: 'rgba(200,115,75,0.26)' },
    { id: 'magenta', name: 'Viva Magenta', year: '2023 · 18-1750', sw: '#BB2649', bg: '#FBF1F3', glass: 'rgba(251,241,243,0.5)', ac: '#BB2649', ac2: '#9A1E3B', band: '#4E1222', line: 'rgba(187,38,73,0.24)' },
    { id: 'peri', name: 'Very Peri', year: '2022 · 17-3938', sw: '#6667AB', bg: '#F2F2F9', glass: 'rgba(242,242,249,0.5)', ac: '#6667AB', ac2: '#4F5094', band: '#2C2D57', line: 'rgba(102,103,171,0.26)' }
  ];
  var KEY = 'hs-palette';

  function rules(p) {
    var light = 'html[data-palette="' + p.id + '"] .page';
    var vars = '--bg:' + p.bg + ';--bg-glass:' + p.glass + ';--band-bg:' + p.band + ';--line:' + p.line + ';--accent:' + p.ac + ';--accent2:' + p.ac2 + ';';
    return '@media (prefers-color-scheme: light){' + light + ':not([data-theme="dark"]){' + vars + '}}' +
      '@media (prefers-color-scheme: dark){' + light + '[data-theme="light"]{' + vars + '}}' +
      light + '{--accent:' + p.ac + ';--accent2:' + p.ac2 + '}';
  }

  function css() {
    var s = document.createElement('style');
    var r = P.filter(function (p) { return p.bg; }).map(rules).join('');
    r += 'html[data-palette] .page{transition:background-color .5s ease,color .5s ease}' +
      'html[data-palette] .page .btn-dark{background:var(--accent,var(--fg));border-color:var(--accent,var(--fg));color:#fff}' +
      'html[data-palette] .page .btn-dark:hover{background:var(--accent2,var(--text2));border-color:var(--accent2,var(--text2));color:#fff}' +
      'html[data-palette] .page .nav-links a::after{background:var(--accent,currentColor)}' +
      'html[data-palette] .page .service:hover .arrow,html[data-palette] .page .row:hover .arrow{background:var(--accent,var(--fg));color:#fff}' +
      'html[data-palette] .page .chip:hover{border-color:var(--accent,var(--fg))}' +
      'html[data-palette] .page .pal-btn{color:var(--accent,inherit)}' +
      '.pal-pop{position:fixed;z-index:100000;width:280px;max-width:calc(100vw - 32px);box-sizing:border-box;padding:16px;border-radius:4px;background:#fff;color:#111;box-shadow:0 18px 50px rgba(0,0,0,.18);font-family:Manrope,sans-serif;opacity:0;transform:translateY(-6px);transition:opacity .2s ease,transform .2s ease}' +
      '.pal-pop.is-open{opacity:1;transform:none}' +
      '.pal-pop__t{font-size:11px;letter-spacing:.14em;text-transform:uppercase;opacity:.55;margin:2px 4px 10px}' +
      '.pal-pop button{display:flex;align-items:center;gap:14px;width:100%;padding:10px 8px;border:0;border-radius:3px;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer}' +
      '.pal-pop button:hover{background:rgba(0,0,0,.05)}' +
      '.pal-pop button.is-on{background:rgba(0,0,0,.07)}' +
      '.pal-pop i{flex:none;width:28px;height:28px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12)}' +
      '.pal-pop b{display:block;font-weight:500;font-size:15px}' +
      '.pal-pop small{display:block;font-size:12px;opacity:.55;margin-top:2px}';
    s.textContent = r;
    document.head.appendChild(s);
  }

  function get() { try { return localStorage.getItem(KEY) || 'classic'; } catch (e) { return 'classic'; } }
  function set(id) {
    try { localStorage.setItem(KEY, id); } catch (e) {}
    if (id === 'classic') document.documentElement.removeAttribute('data-palette');
    else document.documentElement.setAttribute('data-palette', id);
  }

  function close() {
    var pop = document.querySelector('.pal-pop');
    if (!pop) return;
    pop.classList.remove('is-open');
    setTimeout(function () { pop.remove(); }, 200);
  }

  function open(btn) {
    var cur = get();
    var pop = document.createElement('div');
    pop.className = 'pal-pop';
    pop.setAttribute('role', 'menu');
    pop.innerHTML = '<div class="pal-pop__t">Цвет года Pantone</div>' + P.map(function (p) {
      return '<button type="button" role="menuitemradio" aria-checked="' + (p.id === cur) + '" data-pal="' + p.id + '" class="' + (p.id === cur ? 'is-on' : '') + '"><i style="background:' + p.sw + '"></i><span><b>' + p.name + '</b><small>' + p.year + '</small></span></button>';
    }).join('');
    document.body.appendChild(pop);
    var r = btn.getBoundingClientRect();
    var left = Math.min(Math.max(16, r.right - pop.offsetWidth), window.innerWidth - pop.offsetWidth - 16);
    pop.style.left = left + 'px';
    pop.style.top = (r.bottom + 10) + 'px';
    requestAnimationFrame(function () { pop.classList.add('is-open'); });
  }

  css();
  set(get());

  document.addEventListener('click', function (e) {
    var item = e.target.closest('.pal-pop [data-pal]');
    if (item) {
      set(item.getAttribute('data-pal'));
      document.querySelectorAll('.pal-pop [data-pal]').forEach(function (b) {
        var on = b === item;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-checked', on);
      });
      return;
    }
    var btn = e.target.closest('.pal-btn');
    if (btn) {
      if (document.querySelector('.pal-pop')) close(); else open(btn);
      return;
    }
    if (!e.target.closest('.pal-pop')) close();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  window.addEventListener('scroll', close, { passive: true });
  window.addEventListener('resize', close);
})();
