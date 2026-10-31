(function () {
  var URL = 'https://script.google.com/macros/s/AKfycbyViB3NY6cYjPmlAGMczb6ptRafPTf1U-_gcS8o0_0efh7NJpEaoUxUOXsEa5LQt6h30Q/exec';

  var STYLES = [
    { id: 'minimal', t: 'Тёплый минимализм', d: 'Спокойная база, натуральные фактуры и много света. Ничего лишнего — только то, что радует каждый день.', img: 'img/acb4cf43eb6042edfe72c9bb55ae6608.jpg', mix: 'тёплого минимализма' },
    { id: 'japandi', t: 'Японди', d: 'Скандинавский уют и японская сдержанность: светлое дерево, лён, низкая мебель и тишина.', img: 'img/ced7444c60e0d43f4f7901d0258c32c5.jpg', mix: 'японди' },
    { id: 'wabi', t: 'Ваби-саби', d: 'Красота несовершенства: живая штукатурка, грубый текстиль, керамика ручной работы.', img: 'img/af7ae81baa624015456ad97bf30e55d9.jpg', mix: 'ваби-саби' },
    { id: 'classic', t: 'Современная классика', d: 'Высокие потолки, лепнина и строгая геометрия в современном прочтении.', img: 'img/e9b3207f6ac82ff24410cbb01c7da66d.jpg', mix: 'современной классики' },
    { id: 'loft', t: 'Лофт', d: 'Открытые пространства, кирпич, металл и честные материалы с характером.', img: 'img/3b1b19ead3b20eabcf2f89fa54489767.jpg', mix: 'лофта' },
    { id: 'scandi', t: 'Скандинавский', d: 'Светлые стены, функциональное хранение и мягкая мебель — легко и практично.', img: 'img/f1d3cd6f0e1a965a65100eb24eb6c0c7.jpg', mix: 'скандинавского стиля' }
  ];
  var MATERIALS = [
    { id: 'oak', t: 'Светлый дуб', img: 'img/quiz/m-oak.jpg' },
    { id: 'darkwood', t: 'Тёмное дерево', img: 'img/quiz/m-darkwood.jpg' },
    { id: 'travertine', t: 'Травертин', img: 'img/quiz/m-travertine.jpg' },
    { id: 'microcement', t: 'Микроцемент', img: 'img/quiz/m-microcement.jpg' },
    { id: 'plaster', t: 'Декоративная штукатурка', img: 'img/quiz/m-plaster.jpg' },
    { id: 'linen', t: 'Лён и текстиль', img: 'img/quiz/m-linen.jpg' },
    { id: 'brass', t: 'Латунь', img: 'img/quiz/m-brass.jpg' },
    { id: 'brick', t: 'Кирпич', img: 'img/quiz/m-brick.jpg' }
  ];
  var PALETTES = [
    { id: 'warm', t: 'Светлая тёплая', c: ['#F3EEE7', '#E4D8C8', '#C9B49A', '#8C7259'] },
    { id: 'neutral', t: 'Нейтральная', c: ['#F2F1EE', '#DAD7D1', '#A9A49B', '#5E5A54'] },
    { id: 'contrast', t: 'Контрастная', c: ['#FFFFFF', '#D9D9D9', '#4A4A4A', '#111111'] },
    { id: 'deep', t: 'Глубокая природная', c: ['#E9E3D6', '#8E8A6B', '#4F5A45', '#7A4B34'] },
    { id: 'soft', t: 'Мягкая пастель', c: ['#F6F1EE', '#E9D9D2', '#D3DAD5', '#B7C2C8'] }
  ];
  var OBJECTS = ['Квартира', 'Частный дом', 'Коммерческое помещение', 'Другое'];
  var NEEDS = ['Много хранения', 'Гардеробная', 'Рабочий кабинет', 'Детская', 'Кухня-гостиная', 'Мастер-спальня с ванной', 'Домашние животные', 'Тишина и звукоизоляция', 'Место для гостей', 'Умный дом'];
  var BUDGETS = ['до 60 000 ₽', '60 000 – 120 000 ₽', '120 000 – 200 000 ₽', 'от 200 000 ₽', 'Пока не знаю'];
  var WHEN = ['В ближайший месяц', 'В течение 3 месяцев', 'Позже'];
  var CONTACT = ['Звонок', 'Telegram', 'WhatsApp'];
  var TOTAL = 7;

  var s = { step: 1, object: '', area: '', styles: [], materials: [], palette: '', needs: [], budget: '', when: '', name: '', phone: '', contact: 'Звонок', note: '', sending: false, done: false, error: false };

  function esc(v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function on(list, v) { return list.indexOf(v) > -1; }
  function toggle(list, v, max) {
    var i = list.indexOf(v);
    if (i > -1) list.splice(i, 1);
    else if (!max || list.length < max) list.push(v);
    else { list.shift(); list.push(v); }
  }
  function find(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  function check() { return '<span class="q-check" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg></span>'; }

  function ok() {
    if (s.step === 1) return !!s.object;
    if (s.step === 2) return s.styles.length > 0;
    if (s.step === 3) return s.materials.length > 0;
    if (s.step === 4) return !!s.palette;
    if (s.step === 5) return true;
    if (s.step === 6) return !!s.budget && !!s.when;
    if (s.step === 7) return s.name.trim() && s.phone.replace(/\D/g, '').length >= 10;
    return true;
  }

  function head(title, hint) {
    return '<div class="q-head"><p class="q-count">Шаг ' + s.step + ' из ' + TOTAL + '</p><h2 class="q-title display">' + title + '</h2>' + (hint ? '<p class="q-hint">' + hint + '</p>' : '') + '</div>';
  }
  function tiles(group, items, cur, multi) {
    return '<div class="q-tiles">' + items.map(function (v) {
      var sel = multi ? on(cur, v) : cur === v;
      return '<button type="button" class="q-tile' + (sel ? ' is-on' : '') + '" data-g="' + group + '" data-v="' + esc(v) + '" aria-pressed="' + sel + '">' + esc(v) + '</button>';
    }).join('') + '</div>';
  }

  function body() {
    if (s.step === 1) return head('Какой у вас объект?') + tiles('object', OBJECTS, s.object) +
      '<div class="field q-field"><label for="q-area">Площадь, м²</label><input id="q-area" data-in="area" type="text" inputmode="numeric" placeholder="Например, 85" value="' + esc(s.area) + '"></div>';
    if (s.step === 2) return head('Какой стиль вам ближе?', 'Выберите один или два — смешивать стили можно и нужно.') +
      '<div class="q-cards">' + STYLES.map(function (x) {
        var sel = on(s.styles, x.id);
        return '<button type="button" class="q-card' + (sel ? ' is-on' : '') + '" data-g="styles" data-v="' + x.id + '" aria-pressed="' + sel + '"><span class="q-img"><img src="' + x.img + '" alt="" loading="lazy"></span>' + check() + '<span class="q-cap"><b>' + x.t + '</b><small>' + x.d + '</small></span></button>';
      }).join('') + '</div>';
    if (s.step === 3) return head('Какие материалы хочется трогать каждый день?', 'До четырёх вариантов.') +
      '<div class="q-cards q-cards--sq">' + MATERIALS.map(function (x) {
        var sel = on(s.materials, x.id);
        return '<button type="button" class="q-card' + (sel ? ' is-on' : '') + '" data-g="materials" data-v="' + x.id + '" aria-pressed="' + sel + '"><span class="q-img"><img src="' + x.img + '" alt="" loading="lazy"></span>' + check() + '<span class="q-cap"><b>' + x.t + '</b></span></button>';
      }).join('') + '</div>';
    if (s.step === 4) return head('Какая цветовая гамма?') +
      '<div class="q-pals">' + PALETTES.map(function (x) {
        var sel = s.palette === x.id;
        return '<button type="button" class="q-pal' + (sel ? ' is-on' : '') + '" data-g="palette" data-v="' + x.id + '" aria-pressed="' + sel + '"><span class="q-sw">' + x.c.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</span>' + check() + '<b>' + x.t + '</b></button>';
      }).join('') + '</div>';
    if (s.step === 5) return head('Что важно предусмотреть?', 'Можно выбрать несколько или пропустить.') + tiles('needs', NEEDS, s.needs, true);
    if (s.step === 6) return head('Бюджет и сроки') +
      '<p class="q-sub">Бюджет на ремонт с материалами, за м²</p>' + tiles('budget', BUDGETS, s.budget) +
      '<p class="q-sub">Когда планируете начать</p>' + tiles('when', WHEN, s.when);
    return head('Куда прислать идеи?', 'Покажу ваш стиль сразу, а я получу бриф и подготовлюсь к разговору.') +
      '<div class="row2"><div class="field"><label for="q-name">Имя</label><input id="q-name" data-in="name" type="text" autocomplete="name" placeholder="Как к вам обращаться" value="' + esc(s.name) + '"></div>' +
      '<div class="field"><label for="q-phone">Телефон</label><input id="q-phone" data-in="phone" type="tel" autocomplete="tel" placeholder="+7" value="' + esc(s.phone) + '"></div></div>' +
      '<p class="q-sub">Как удобнее связаться</p>' + tiles('contact', CONTACT, s.contact) +
      '<div class="field q-field"><label for="q-note">Комментарий</label><textarea id="q-note" data-in="note" placeholder="Сроки, состав семьи, что точно не нравится">' + esc(s.note) + '</textarea></div>' +
      '<p class="hint">Отправляя форму, вы соглашаетесь с обработкой персональных данных. Данные нужны только для ответа на вашу заявку.</p>';
  }

  function nav() {
    var last = s.step === TOTAL;
    return '<div class="q-nav">' +
      (s.step > 1 ? '<button type="button" class="btn btn-outline btn-small q-back" data-act="back"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"></path></svg>Назад</button>' : '<span></span>') +
      '<button type="button" class="btn btn-dark q-next" data-act="' + (last ? 'send' : 'next') + '"' + (ok() && !s.sending ? '' : ' disabled') + '>' + (last ? (s.sending ? 'Отправляем…' : 'Узнать свой стиль') : (s.step === 5 && !s.needs.length ? 'Пропустить' : 'Далее')) + ' <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></button>' +
      '</div>' + (s.error ? '<p class="q-err">Не получилось отправить. Проверьте интернет и попробуйте ещё раз — или напишите на h.studio.arch@mail.ru.</p>' : '');
  }

  function summary() {
    var st = s.styles.map(function (id) { return find(STYLES, id); });
    var title = st[0].t + (st[1] ? ' с нотами ' + st[1].mix : '');
    var mats = s.materials.map(function (id) { return find(MATERIALS, id); });
    var pal = find(PALETTES, s.palette);
    return { title: title, desc: st[0].d, st: st, mats: mats, pal: pal };
  }

  function result() {
    var r = summary();
    return '<div class="q-result">' +
      '<div class="q-res-text"><p class="q-count">Ваш стиль</p><h2 class="q-title display">' + esc(r.title) + '</h2><p class="q-hint">' + esc(r.desc) + '</p>' +
      '<p class="q-sub">Материалы</p><div class="q-mats">' + r.mats.map(function (m) { return '<span><i style="background-image:url(' + m.img + ')"></i>' + m.t + '</span>'; }).join('') + '</div>' +
      '<p class="q-sub">Гамма · ' + r.pal.t + '</p><div class="q-sw q-sw--big">' + r.pal.c.map(function (c) { return '<i style="background:' + c + '"></i>'; }).join('') + '</div>' +
      '<div class="q-thanks"><b>Спасибо' + (s.name ? ', ' + esc(s.name.trim()) : '') + '! Заявка отправлена.</b><span>Я свяжусь с вами в течение рабочего дня — ' + (s.contact === 'Звонок' ? 'позвоню' : 'напишу в ' + s.contact) + ' и предложу удобное время, чтобы обсудить идеи для вашего интерьера.</span></div>' +
      '<div class="q-nav q-nav--end"><a class="btn btn-dark" href="projects.html">Смотреть проекты <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg></a><button type="button" class="btn btn-outline btn-small" data-act="again">Пройти заново</button></div></div>' +
      '<div class="q-res-pic"><img src="' + r.st[0].img + '" alt=""></div></div>';
  }

  function render(focusTop) {
    var root = document.getElementById('quiz');
    if (!root) return;
    if (s.done) {
      root.innerHTML = result();
    } else {
      root.innerHTML = '<div class="q-bar"><span style="width:' + Math.round((s.step - 1) / TOTAL * 100) + '%"></span></div><div class="q-body">' + body() + '</div>' + nav();
    }
    if (focusTop) {
      var y = root.getBoundingClientRect().top + window.pageYOffset - 120;
      if (window.pageYOffset > y) window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  function refreshNav() {
    var root = document.getElementById('quiz');
    var btn = root && root.querySelector('.q-next');
    if (btn) btn.disabled = !ok() || s.sending;
  }

  function brief() {
    var r = summary();
    return [
      'Квиз «Подбор стиля»',
      'Стиль: ' + r.st.map(function (x) { return x.t; }).join(' + '),
      'Материалы: ' + r.mats.map(function (x) { return x.t; }).join(', '),
      'Гамма: ' + r.pal.t,
      'Важно: ' + (s.needs.length ? s.needs.join(', ') : '—'),
      'Бюджет ремонта за м²: ' + s.budget,
      'Связь: ' + s.contact,
      s.note.trim() ? 'Комментарий: ' + s.note.trim() : ''
    ].filter(Boolean).join('\n');
  }

  function send() {
    s.sending = true;
    s.error = false;
    render();
    var data = new URLSearchParams({
      name: s.name.trim(), phone: s.phone.trim(), type: s.object, area: s.area.trim(),
      service: 'Подбор стиля (квиз)', when: s.when, message: brief()
    });
    fetch(URL, { method: 'POST', mode: 'no-cors', body: data })
      .then(function () { s.sending = false; s.done = true; render(true); })
      .catch(function () { s.sending = false; s.error = true; render(); });
  }

  document.addEventListener('click', function (e) {
    var go = e.target.closest && e.target.closest('[data-quiz-start]');
    if (go) {
      var card = go.closest('[data-quiz-card]');
      if (card) card.classList.add('is-started');
      render();
      var y = (card || document.getElementById('quiz')).getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: y, behavior: 'smooth' });
      return;
    }
    var root = document.getElementById('quiz');
    if (!root || !root.contains(e.target)) return;
    var o = e.target.closest('[data-g]');
    if (o) {
      var g = o.getAttribute('data-g'), v = o.getAttribute('data-v');
      if (g === 'styles') toggle(s.styles, v, 2);
      else if (g === 'materials') toggle(s.materials, v, 4);
      else if (g === 'needs') toggle(s.needs, v);
      else s[g] = v;
      render();
      return;
    }
    var a = e.target.closest('[data-act]');
    if (!a || a.disabled) return;
    var act = a.getAttribute('data-act');
    if (act === 'next' && ok()) { s.step++; render(true); }
    else if (act === 'back') { s.step--; s.error = false; render(true); }
    else if (act === 'send' && ok() && !s.sending) send();
    else if (act === 'again') {
      s = { step: 1, object: '', area: '', styles: [], materials: [], palette: '', needs: [], budget: '', when: '', name: s.name, phone: s.phone, contact: s.contact, note: '', sending: false, done: false, error: false };
      render(true);
    }
  });

  document.addEventListener('input', function (e) {
    var k = e.target.getAttribute && e.target.getAttribute('data-in');
    if (!k || !document.getElementById('quiz').contains(e.target)) return;
    s[k] = e.target.value;
    refreshNav();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.target.tagName === 'TEXTAREA') return;
    if (!e.target.getAttribute || !e.target.getAttribute('data-in')) return;
    e.preventDefault();
    var btn = document.querySelector('#quiz .q-next');
    if (btn && !btn.disabled) btn.click();
  });

  function start() { if (document.getElementById('quiz')) render(); else requestAnimationFrame(start); }
  start();
})();
