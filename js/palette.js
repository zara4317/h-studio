(function () {
  var P = [
    { id: 'classic', name: 'Классика', code: 'Ч/Б', sw: '#111111' },
    { id: 'cloud', name: 'Cloud Dancer', code: '11-4201 TCX', sw: '#F0EEE9' },
    { id: 'acacia', name: 'Acacia', code: '13-0640 TCX', sw: '#DACD65' },
    { id: 'marina', name: 'Marina', code: '17-4041 TCX', sw: '#4F84C4' },
    { id: 'muskmelon', name: 'Muskmelon', code: '15-1242 TCX', sw: '#EC935E' },
    { id: 'lava', name: 'Lava Falls', code: '18-1552 TCX', sw: '#9A3B34' },
    { id: 'dustyrose', name: 'Dusty Rose', code: '17-1718 TCX', sw: '#BA797D' },
    { id: 'amaranth', name: 'Amaranth', code: '19-2410 TCX', sw: '#6F3C56' },
    { id: 'lilac', name: 'Burnished Lilac', code: '15-1905 TCX', sw: '#C5AEB1' },
    { id: 'dutch', name: 'Dutch Canal', code: '14-4124 TCX', sw: '#8FB8D8' },
    { id: 'banana', name: 'Pale Banana', code: '12-0824 TCX', sw: '#FAE199' },
    { id: 'shale', name: 'Shale Green', code: '16-6116 TCX', sw: '#739072' }
  ];
  var KEY = 'hs-palette';

  function get() { var v; try { v = localStorage.getItem(KEY); } catch (e) {} return P.some(function (p) { return p.id === v; }) ? v : 'classic'; }
  function set(id) {
    try { localStorage.setItem(KEY, id); } catch (e) {}
    if (id === 'classic') document.documentElement.removeAttribute('data-palette');
    else document.documentElement.setAttribute('data-palette', id);
  }

  function close() {
    var pop = document.querySelector('.pal-pop');
    if (!pop) return;
    pop.classList.remove('is-open');
    document.documentElement.classList.remove('pal-open');
    document.querySelectorAll('.pal-btn').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', 'Цвет сайта'); });
    setTimeout(function () { pop.remove(); }, 200);
  }

  function open(btn) {
    var cur = get();
    var pop = document.createElement('div');
    pop.className = 'pal-pop';
    pop.setAttribute('role', 'menu');
    pop.innerHTML = '<div class="pal-pop__t">Выберите своё настроение<small>Цвета Pantone 2026</small></div><div class="pal-grid">' + P.map(function (p) {
      var brand = p.id === 'classic' ? 'H-STUDIO' : 'PANTONE';
      return '<button type="button" role="menuitemradio" aria-checked="' + (p.id === cur) + '" aria-label="' + p.name + '" data-pal="' + p.id + '" class="pal-chip' + (p.id === cur ? ' is-on' : '') + '"><span class="pal-chip__c" style="background:' + p.sw + '"></span><span class="pal-chip__l"><b>' + brand + '</b><small>' + p.code + '</small><em>' + p.name + '</em></span></button>';
    }).join('') + '</div>';
    document.body.appendChild(pop);
    var r = btn.getBoundingClientRect();
    var left = Math.min(Math.max(16, r.right - pop.offsetWidth), window.innerWidth - pop.offsetWidth - 16);
    pop.style.left = left + 'px';
    pop.style.top = (r.bottom + 10) + 'px';
    pop.style.maxHeight = (window.innerHeight - r.bottom - 26) + 'px';
    document.documentElement.classList.add('pal-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Закрыть выбор цвета');
    requestAnimationFrame(function () { pop.classList.add('is-open'); });
  }

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
