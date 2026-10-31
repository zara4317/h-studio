(function () {
  var URL = 'https://script.google.com/macros/s/AKfycbyViB3NY6cYjPmlAGMczb6ptRafPTf1U-_gcS8o0_0efh7NJpEaoUxUOXsEa5LQt6h30Q/exec';

  function modal(ok) {
    var page = document.querySelector('.page') || document.body;
    var cs = getComputedStyle(page);
    var bg = cs.getPropertyValue('--bg').trim() || '#fff';
    var fg = cs.getPropertyValue('--fg').trim() || '#111';
    var ac = cs.getPropertyValue('--accent').trim() || fg;
    var acf = cs.getPropertyValue('--accent-fg').trim() || bg;
    var old = document.querySelector('.hs-modal');
    if (old) old.remove();
    var m = document.createElement('div');
    m.className = 'hs-modal';
    m.setAttribute('role', 'dialog');
    m.setAttribute('aria-modal', 'true');
    var title = ok ? 'Спасибо, заявка отправлена' : 'Заявка не отправилась';
    var text = ok
      ? 'Я свяжусь с вами в течение рабочего дня, чтобы обсудить задачу и предложить удобное время для встречи.'
      : 'Проверьте интернет и попробуйте ещё раз — или напишите мне на почту h.studio.arch@mail.ru.';
    var icon = ok
      ? '<path d="M5 12.5l4.5 4.5L19 7.5"></path>'
      : '<path d="M12 7v6M12 16.5v.5"></path>';
    m.innerHTML =
      '<div class="hs-modal__box" style="background:' + bg + ';color:' + fg + '">' +
      '<button type="button" class="hs-modal__close" aria-label="Закрыть">×</button>' +
      '<div class="hs-modal__icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' + icon + '</svg></div>' +
      '<h3 class="hs-modal__title">' + title + '</h3>' +
      '<p class="hs-modal__text">' + text + '</p>' +
      '<button type="button" class="btn btn-dark hs-modal__ok" style="background:' + ac + ';color:' + acf + ';border-color:' + ac + '">Хорошо</button>' +
      '</div>';
    function close() {
      m.classList.remove('is-open');
      document.removeEventListener('keydown', esc);
      setTimeout(function () { m.remove(); }, 250);
    }
    function esc(e) { if (e.key === 'Escape') close(); }
    m.addEventListener('click', function (e) {
      if (e.target === m || e.target.closest('.hs-modal__close') || e.target.closest('.hs-modal__ok')) close();
    });
    document.addEventListener('keydown', esc);
    document.body.appendChild(m);
    requestAnimationFrame(function () { m.classList.add('is-open'); m.querySelector('.hs-modal__ok').focus(); });
  }

  var MAX_FILES = 10;
  var MAX_TOTAL = 20 * 1024 * 1024;
  var files = [];

  function size(b) {
    if (b < 1024 * 1024) return Math.max(1, Math.round(b / 1024)) + ' КБ';
    return (b / 1024 / 1024).toFixed(1).replace('.', ',') + ' МБ';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function error(text) {
    var drop = document.getElementById('f-drop');
    if (!drop) return;
    var old = drop.querySelector('.drop-err');
    if (old) old.remove();
    if (!text) return;
    var p = document.createElement('p');
    p.className = 'drop-err';
    p.textContent = text;
    drop.appendChild(p);
  }

  function render() {
    var list = document.getElementById('f-list');
    if (!list) return;
    list.innerHTML = files.map(function (f, i) {
      return '<li><span class="nm">' + esc(f.name) + '</span><span class="sz">' + size(f.size) + '</span><button type="button" data-rm="' + i + '" aria-label="Убрать файл ' + esc(f.name) + '">×</button></li>';
    }).join('');
  }

  function add(list) {
    var msg = '';
    var total = files.reduce(function (s, f) { return s + f.size; }, 0);
    Array.prototype.forEach.call(list, function (f) {
      if (files.some(function (x) { return x.name === f.name && x.size === f.size; })) return;
      if (files.length >= MAX_FILES) { msg = 'Можно прикрепить до ' + MAX_FILES + ' файлов. Остальные пришлите на почту h.studio.arch@mail.ru.'; return; }
      if (total + f.size > MAX_TOTAL) { msg = 'Файл «' + f.name + '» не поместился: всего можно до 20 МБ. Большие файлы пришлите на почту h.studio.arch@mail.ru.'; return; }
      files.push(f);
      total += f.size;
    });
    error(msg);
    render();
  }

  function read(f) {
    return new Promise(function (ok, fail) {
      var r = new FileReader();
      r.onload = function () { ok({ name: f.name, type: f.type || 'application/octet-stream', data: String(r.result).split(',')[1] || '' }); };
      r.onerror = fail;
      r.readAsDataURL(f);
    });
  }

  document.addEventListener('change', function (e) {
    if (e.target.id !== 'f-files') return;
    add(e.target.files);
    e.target.value = '';
  });

  document.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-rm]');
    if (!rm) return;
    files.splice(+rm.getAttribute('data-rm'), 1);
    error('');
    render();
  });

  ['dragenter', 'dragover'].forEach(function (t) {
    document.addEventListener(t, function (e) {
      var drop = e.target.closest && e.target.closest('#f-drop');
      if (!drop) return;
      e.preventDefault();
      drop.classList.add('is-over');
    });
  });
  ['dragleave', 'drop'].forEach(function (t) {
    document.addEventListener(t, function (e) {
      var drop = e.target.closest && e.target.closest('#f-drop');
      if (!drop) return;
      if (t === 'dragleave' && drop.contains(e.relatedTarget)) return;
      e.preventDefault();
      drop.classList.remove('is-over');
      if (t === 'drop' && e.dataTransfer && e.dataTransfer.files.length) add(e.dataTransfer.files);
    });
  });

  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('form.form');
    if (!form) return;
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    if (btn.disabled) return;
    var data = new URLSearchParams(new FormData(form));
    btn.disabled = true;
    btn.style.opacity = '.5';
    Promise.all(files.map(read))
      .then(function (list) {
        if (list.length) data.append('files', JSON.stringify(list));
        return fetch(URL, { method: 'POST', mode: 'no-cors', body: data });
      })
      .then(function () {
        form.querySelectorAll('input, textarea').forEach(function (el) { el.value = ''; });
        form.querySelectorAll('select').forEach(function (el) { el.selectedIndex = 0; });
        form.querySelectorAll('[data-tel]').forEach(function (w) { w.classList.remove('was-blurred'); if (window.HSPhone) HSPhone.sync(w); });
        files = [];
        error('');
        render();
        modal(true);
      })
      .catch(function () { modal(false); })
      .then(function () { btn.disabled = false; btn.style.opacity = ''; });
  });
})();
