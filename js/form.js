(function () {
  var URL = 'https://script.google.com/macros/s/AKfycbyViB3NY6cYjPmlAGMczb6ptRafPTf1U-_gcS8o0_0efh7NJpEaoUxUOXsEa5LQt6h30Q/exec';

  function css() {
    if (document.getElementById('hs-modal-css')) return;
    var s = document.createElement('style');
    s.id = 'hs-modal-css';
    s.textContent =
      '.hs-modal{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(0,0,0,.45);opacity:0;transition:opacity .25s ease}' +
      '.hs-modal.is-open{opacity:1}' +
      '.hs-modal__box{position:relative;width:100%;max-width:520px;max-height:calc(100dvh - 32px);overflow:auto;box-sizing:border-box;padding:48px 40px 40px;border-radius:3px;font-family:Manrope,sans-serif;transform:translateY(12px);transition:transform .25s ease}' +
      '.hs-modal.is-open .hs-modal__box{transform:none}' +
      '.hs-modal__icon{width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:28px;border:1px solid currentColor}' +
      '.hs-modal__title{font-family:Unbounded,sans-serif;font-weight:300;font-size:28px;line-height:1.2;margin:0 0 16px}' +
      '.hs-modal__text{font-size:17px;line-height:1.6;margin:0 0 32px;opacity:.75}' +
      '.hs-modal__close{position:absolute;top:12px;right:12px;width:44px;height:44px;border:0;background:none;color:inherit;cursor:pointer;font-size:28px;line-height:1}' +
      '.hs-modal .btn{width:auto}' +
      '@media (max-width:560px){.hs-modal__box{padding:44px 24px 28px}.hs-modal__title{font-size:22px}.hs-modal__text{font-size:15px}.hs-modal .btn{width:100%}}';
    document.head.appendChild(s);
  }

  function modal(ok) {
    css();
    var page = document.querySelector('.page') || document.body;
    var cs = getComputedStyle(page);
    var bg = cs.getPropertyValue('--bg').trim() || '#fff';
    var fg = cs.getPropertyValue('--fg').trim() || '#111';
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
      '<button type="button" class="btn btn-dark hs-modal__ok" style="background:' + fg + ';color:' + bg + ';border-color:' + fg + '">Хорошо</button>' +
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

  document.addEventListener('submit', function (e) {
    var form = e.target.closest && e.target.closest('form.form');
    if (!form) return;
    e.preventDefault();
    var btn = form.querySelector('button[type="submit"]');
    if (btn.disabled) return;
    var data = new URLSearchParams(new FormData(form));
    btn.disabled = true;
    btn.style.opacity = '.5';
    fetch(URL, { method: 'POST', mode: 'no-cors', body: data })
      .then(function () {
        form.querySelectorAll('input, textarea').forEach(function (el) { el.value = ''; });
        form.querySelectorAll('select').forEach(function (el) { el.selectedIndex = 0; });
        modal(true);
      })
      .catch(function () { modal(false); })
      .then(function () { btn.disabled = false; btn.style.opacity = ''; });
  });
})();
