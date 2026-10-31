(function () {
  var drag = null;
  var wheelAcc = 0;
  var wheelLock = 0;
  var wheelT = null;
  var dragEnd = 0;

  function parts(root) {
    return {
      track: root.querySelector('.fcar-track'),
      prev: root.querySelector('.fcar-ctl.prev'),
      next: root.querySelector('.fcar-ctl.next')
    };
  }

  function go(root, dir) {
    var p = parts(root);
    var b = dir > 0 ? p.next : p.prev;
    if (b) b.click();
  }

  function editable(el) {
    if (!el) return false;
    var t = el.tagName;
    return t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT' || el.isContentEditable;
  }

  function visibleSlider() {
    var list = document.querySelectorAll('.fcar');
    var best = null, bestV = 0;
    for (var i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      var v = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      if (v > bestV) { bestV = v; best = list[i]; }
    }
    return best && bestV > Math.min(240, window.innerHeight * 0.4) ? best : null;
  }

  document.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    var root = e.target.closest && e.target.closest('.fcar');
    if (!root || e.target.closest('.fcar-ctl')) return;
    var p = parts(root);
    if (!p.track) return;
    drag = { root: root, track: p.track, id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now(), dx: 0, axis: null, base: p.track.style.transform };
  });

  document.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.axis) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      if (drag.axis === 'y') { drag = null; return; }
      drag.track.style.transition = 'none';
    }
    drag.dx = dx;
    drag.track.style.transform = drag.base + ' translateX(' + dx + 'px)';
    if (e.cancelable) e.preventDefault();
  }, { passive: false });

  function end(e) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    var d = drag;
    drag = null;
    if (d.axis !== 'x') return;
    dragEnd = Date.now();
    d.track.style.transition = '';
    d.track.style.transform = d.base;
    var w = d.root.getBoundingClientRect().width;
    var v = Math.abs(d.dx) / Math.max(1, Date.now() - d.t);
    if (Math.abs(d.dx) > Math.min(120, w * 0.15) || (v > 0.5 && Math.abs(d.dx) > 30)) go(d.root, d.dx < 0 ? 1 : -1);
  }
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    drag.track.style.transition = '';
    drag.track.style.transform = drag.base;
    drag = null;
  });

  document.addEventListener('click', function (e) {
    if (Date.now() - dragEnd < 400 && e.target.closest && e.target.closest('.fcar') && !e.target.closest('.fcar-ctl')) {
      e.preventDefault();
      e.stopPropagation();
      dragEnd = 0;
    }
  }, true);

  document.addEventListener('dragstart', function (e) {
    if (e.target.closest && e.target.closest('.fcar')) e.preventDefault();
  });

  document.addEventListener('wheel', function (e) {
    var root = e.target.closest && e.target.closest('.fcar');
    if (!root) return;
    var dx = e.deltaX || (e.shiftKey ? e.deltaY : 0);
    if (Math.abs(dx) <= Math.abs(e.shiftKey ? 0 : e.deltaY)) return;
    e.preventDefault();
    clearTimeout(wheelT);
    wheelT = setTimeout(function () { wheelAcc = 0; wheelLock = 0; }, 180);
    if (wheelLock) return;
    wheelAcc += dx;
    if (Math.abs(wheelAcc) > 40) {
      go(root, wheelAcc > 0 ? 1 : -1);
      wheelAcc = 0;
      wheelLock = 1;
    }
  }, { passive: false });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.altKey || e.ctrlKey || e.metaKey || editable(document.activeElement)) return;
    var a = document.activeElement;
    var root = (a && a.closest && a.closest('.fcar')) || visibleSlider();
    if (!root) return;
    e.preventDefault();
    go(root, e.key === 'ArrowRight' ? 1 : -1);
  });
})();
