(function () {
  function boot() {
  var L = window.libphonenumber;
  if (!L || window.HSPhone) return;
  var DEF = 'RU';
  var TOP = ['RU', 'KZ', 'BY', 'UZ', 'KG', 'TJ', 'AM', 'AZ', 'GE', 'TR', 'AE'];
  var names;
  try { names = new Intl.DisplayNames(['ru'], { type: 'region' }); } catch (e) { names = null; }

  function name(c) { try { return names ? names.of(c) : c; } catch (e) { return c; } }
  function flag(c) { return String.fromCodePoint.apply(null, c.split('').map(function (ch) { return 127397 + ch.charCodeAt(0); })); }
  function code(c) { try { return L.getCountryCallingCode(c); } catch (e) { return ''; } }
  function esc(v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var LIST = null;
  function list() {
    if (LIST) return LIST;
    var all = L.getCountries().filter(code).map(function (c) { return { c: c, n: name(c), d: code(c) }; });
    all.sort(function (a, b) { return a.n.localeCompare(b.n, 'ru'); });
    var top = TOP.map(function (c) { return all.filter(function (x) { return x.c === c; })[0]; }).filter(Boolean);
    LIST = { top: top, all: all };
    return LIST;
  }

  function format(c, digits) {
    if (!digits) return '';
    var nat = new L.AsYouType(c).input(digits);
    if (/\D/.test(nat) && nat.replace(/\D/g, '') === digits) return nat;
    var cc = code(c);
    var intl = new L.AsYouType().input('+' + cc + digits);
    return intl.replace(new RegExp('^\\+' + cc + '\\s?'), '');
  }

  function fits(d, c) {
    for (var k = d.length; k <= 17; k++) {
      var r = L.validatePhoneNumberLength(d + new Array(k - d.length + 1).join('0'), c);
      if (!r) return true;
      if (r === 'TOO_LONG') return false;
    }
    return false;
  }

  function placeholder(c) { return c === 'RU' ? '900 000-00-00' : 'Номер телефона'; }

  function clean(c, raw) {
    var d = raw.replace(/\D/g, '');
    if ((c === 'RU' || c === 'KZ') && d.length === 11 && (d[0] === '8' || d[0] === '7')) d = d.slice(1);
    return d;
  }

  function state(w) {
    var c = w.getAttribute('data-country') || DEF;
    var inp = w.querySelector('.tel-input');
    var d = clean(c, inp.value);
    var valid = !!d && L.isValidPhoneNumber(d, c);
    var full = d ? '+' + code(c) + ' ' + format(c, d) : '';
    return { country: c, digits: d, national: inp.value, full: full, valid: valid };
  }

  function sync(w) {
    var s = state(w);
    var hid = w.querySelector('input[type="hidden"]');
    if (hid) hid.value = s.full;
    var inp = w.querySelector('.tel-input');
    inp.setCustomValidity(s.digits && !s.valid ? 'Проверьте номер телефона' : '');
    w.classList.toggle('is-invalid', !!s.digits && !s.valid && w.classList.contains('was-blurred'));
    w.dispatchEvent(new CustomEvent('hs-tel', { bubbles: true, detail: s }));
  }

  function digitsBefore(str, pos) { return str.slice(0, pos).replace(/\D/g, '').length; }
  function posAfter(str, n) {
    if (!n) return 0;
    var k = 0;
    for (var i = 0; i < str.length; i++) { if (/\d/.test(str[i])) { k++; if (k === n) return i + 1; } }
    return str.length;
  }

  function reformat(w, inp) {
    var c = w.getAttribute('data-country') || DEF;
    var raw = inp.value;
    if (/^\s*\+/.test(raw)) {
      var t = new L.AsYouType();
      t.input(raw);
      var dial = t.getCallingCode && t.getCallingCode();
      if (!dial) { sync(w); return; }
      var nc = t.getCountry() || (code(c) === dial ? c : (dial === '7' ? 'RU' : L.getCountries().filter(function (x) { return code(x) === dial; })[0]));
      if (!nc) { sync(w); return; }
      setCountry(w, nc, true); c = nc; raw = raw.replace(/\D/g, '').slice(dial.length);
    }
    var caret = digitsBefore(raw, inp.selectionStart == null ? raw.length : inp.selectionStart);
    var d = clean(c, raw);
    if (d.length < raw.replace(/\D/g, '').length) caret = Math.max(0, caret - (raw.replace(/\D/g, '').length - d.length));
    while (d.length > 1 && (!fits(d, c) || (!L.isValidPhoneNumber(d, c) && L.isValidPhoneNumber(d.slice(0, -1), c)))) d = d.slice(0, -1);
    var out = format(c, d);
    inp.value = out;
    var p = posAfter(out, Math.min(caret, d.length));
    try { if (document.activeElement === inp) inp.setSelectionRange(p, p); } catch (e) {}
    sync(w);
  }

  function setCountry(w, c, silent) {
    w.setAttribute('data-country', c);
    var b = w.querySelector('.tel-cc');
    b.querySelector('.tel-flag').textContent = flag(c);
    b.querySelector('.tel-code').textContent = '+' + code(c);
    b.setAttribute('aria-label', 'Код страны: ' + name(c) + ', +' + code(c));
    var inp = w.querySelector('.tel-input');
    inp.placeholder = placeholder(c);
    if (!silent) { inp.value = format(c, clean(c, inp.value)); sync(w); }
  }

  var pop = null, popFor = null, active = -1;

  function items() { return pop ? Array.prototype.slice.call(pop.querySelectorAll('.tel-opt:not([hidden])')) : []; }
  function mark(i) {
    var its = items();
    its.forEach(function (el, k) { el.classList.toggle('is-active', k === i); el.setAttribute('aria-selected', k === i); });
    active = i;
    if (its[i]) its[i].scrollIntoView({ block: 'nearest' });
  }

  function row(x, cur) {
    return '<li class="tel-opt' + (x.c === cur ? ' is-current' : '') + '" role="option" data-c="' + x.c + '" data-s="' + esc((x.n + ' ' + x.c + ' +' + x.d).toLowerCase()) + '"><span class="tel-flag">' + flag(x.c) + '</span><span class="tel-name">' + esc(x.n) + '</span><span class="tel-dial">+' + x.d + '</span></li>';
  }

  function place() {
    if (!pop || !popFor) return;
    var r = popFor.querySelector('.tel-cc').getBoundingClientRect();
    var w = Math.min(360, window.innerWidth - 32);
    pop.style.width = w + 'px';
    pop.style.left = Math.max(16, Math.min(r.left, window.innerWidth - w - 16)) + 'px';
    var below = window.innerHeight - r.bottom - 16;
    var h = Math.min(380, Math.max(below, r.top - 16));
    pop.style.maxHeight = h + 'px';
    if (below >= Math.min(380, 260) || below >= r.top) { pop.style.top = (r.bottom + 6) + 'px'; pop.style.bottom = ''; }
    else { pop.style.top = ''; pop.style.bottom = (window.innerHeight - r.top + 6) + 'px'; }
  }

  function open(w) {
    close();
    var cur = w.getAttribute('data-country') || DEF;
    var data = list();
    pop = document.createElement('div');
    pop.className = 'tel-pop';
    pop.innerHTML = '<div class="tel-search"><input type="text" placeholder="Поиск страны или кода" aria-label="Поиск страны" autocomplete="off"></div><ul class="tel-list" role="listbox">' +
      data.top.map(function (x) { return row(x, cur); }).join('') + '<li class="tel-sep" aria-hidden="true"></li>' +
      data.all.map(function (x) { return row(x, cur); }).join('') + '</ul>';
    document.body.appendChild(pop);
    popFor = w;
    w.querySelector('.tel-cc').setAttribute('aria-expanded', 'true');
    place();
    var s = pop.querySelector('.tel-search input');
    if (window.matchMedia('(hover: hover)').matches) s.focus();
    var i = items().map(function (el) { return el.getAttribute('data-c'); }).indexOf(cur);
    mark(i);
    requestAnimationFrame(function () { if (pop) pop.classList.add('is-open'); });
  }

  function close(focus) {
    if (!pop) return;
    if (popFor) {
      popFor.querySelector('.tel-cc').setAttribute('aria-expanded', 'false');
      if (focus) popFor.querySelector('.tel-input').focus();
    }
    pop.remove();
    pop = null; popFor = null; active = -1;
  }

  function choose(c) {
    var w = popFor;
    close();
    if (!w) return;
    setCountry(w, c);
    w.querySelector('.tel-input').focus();
  }

  function filter(q) {
    q = q.trim().toLowerCase().replace(/^\+/, '+');
    var seen = {};
    Array.prototype.forEach.call(pop.querySelectorAll('.tel-opt'), function (el) {
      var ok = !q || el.getAttribute('data-s').indexOf(q) > -1;
      if (q && ok) { if (seen[el.getAttribute('data-c')]) ok = false; else seen[el.getAttribute('data-c')] = 1; }
      el.hidden = !ok;
    });
    pop.querySelector('.tel-sep').hidden = !!q;
    mark(items().length ? 0 : -1);
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    var cc = t.closest && t.closest('.tel-cc');
    if (cc) {
      e.preventDefault();
      var w = cc.closest('[data-tel]');
      if (pop && popFor === w) close(); else open(w);
      return;
    }
    var opt = t.closest && t.closest('.tel-opt');
    if (opt && pop && pop.contains(opt)) { choose(opt.getAttribute('data-c')); return; }
    if (pop && !pop.contains(t)) close();
  });

  document.addEventListener('input', function (e) {
    if (pop && e.target.closest && e.target.closest('.tel-search')) { filter(e.target.value); return; }
    if (!e.target.classList || !e.target.classList.contains('tel-input')) return;
    reformat(e.target.closest('[data-tel]'), e.target);
  });

  document.addEventListener('focusout', function (e) {
    if (!e.target.classList || !e.target.classList.contains('tel-input')) return;
    var w = e.target.closest('[data-tel]');
    w.classList.add('was-blurred');
    sync(w);
  });

  document.addEventListener('keydown', function (e) {
    if (!pop) return;
    var its = items();
    if (e.key === 'Escape') { e.preventDefault(); close(true); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); mark(Math.min(its.length - 1, active + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); mark(Math.max(0, active - 1)); }
    else if (e.key === 'Enter' && pop.contains(e.target)) { e.preventDefault(); if (its[active]) choose(its[active].getAttribute('data-c')); }
  });

  window.addEventListener('resize', function () { if (pop) place(); });
  window.addEventListener('scroll', function (e) { if (pop && !pop.contains(e.target)) close(); }, true);

  window.HSPhone = {
    markup: function (o) {
      o = o || {};
      var c = o.country || DEF;
      return '<div class="tel" data-tel data-country="' + c + '"' + (o.keep ? ' data-keep' : '') + '>' +
        '<button type="button" class="tel-cc" aria-haspopup="listbox" aria-expanded="false" aria-label="Код страны: ' + esc(name(c)) + ', +' + code(c) + '"><span class="tel-flag">' + flag(c) + '</span><span class="tel-code">+' + code(c) + '</span><svg class="tel-chev" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M6 9l6 6 6-6"></path></svg></button>' +
        '<input' + (o.id ? ' id="' + o.id + '"' : '') + ' class="tel-input" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="' + placeholder(c) + '" value="' + esc(o.value || '') + '"' + (o.attrs || '') + (o.required ? ' required' : '') + '>' +
        (o.name ? '<input type="hidden" name="' + o.name + '" value="">' : '') + '</div>';
    },
    state: state,
    sync: sync
  };
  }
  if (window.libphonenumber) boot();
  else {
    var sc = document.createElement('script');
    sc.src = 'https://cdn.jsdelivr.net/npm/libphonenumber-js@1.11.20/bundle/libphonenumber-min.js';
    sc.onload = boot;
    document.head.appendChild(sc);
  }
})();
