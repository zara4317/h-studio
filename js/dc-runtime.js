(function () {
  var handlers = {};
  var hid = 0;
  function get(path, sc) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return parseFloat(path);
    var ps = path.split('.'), v = sc;
    for (var i = 0; i < ps.length; i++) { if (v == null) return undefined; v = v[ps[i]]; }
    return v;
  }
  function whole(str) { var m = str.match(/^\s*\{\{([^}]+)\}\}\s*$/); return m ? m[1] : null; }
  function sub(str, sc) {
    var w = whole(str);
    if (w !== null) return get(w, sc);
    return str.replace(/\{\{([^}]+)\}\}/g, function (_, k) { var v = get(k, sc); return v == null || typeof v === 'function' ? '' : String(v); });
  }
  var SVG = 'http://www.w3.org/2000/svg';
  function rn(node, sc, out) {
    if (node.nodeType === 3) { out.appendChild(document.createTextNode(sub(node.textContent, sc))); return; }
    if (node.nodeType !== 1) return;
    var t = node.localName;
    if (t === 'helmet') return;
    if (t === 'sc-for') {
      var list = get((node.getAttribute('list') || '').replace(/[{}]/g, ''), sc) || [];
      var as = node.getAttribute('as') || 'item';
      for (var i = 0; i < list.length; i++) { var s2 = Object.create(sc); s2[as] = list[i]; s2.$index = i; for (var c = 0; c < node.childNodes.length; c++) rn(node.childNodes[c], s2, out); }
      return;
    }
    if (t === 'sc-if') {
      var v = get((node.getAttribute('value') || '').replace(/[{}]/g, ''), sc);
      if (v) for (var c2 = 0; c2 < node.childNodes.length; c2++) rn(node.childNodes[c2], sc, out);
      return;
    }
    var isSvg = t === 'svg' || (out.namespaceURI === SVG && t !== 'foreignobject');
    var el = isSvg ? document.createElementNS(SVG, node.tagName) : document.createElement(t);
    for (var a = 0; a < node.attributes.length; a++) {
      var at = node.attributes[a], n = at.name;
      if (n.indexOf('hint-') === 0) continue;
      if (/^on[a-z]+$/i.test(n) && /\{\{/.test(at.value)) {
        var fn = sub(at.value, sc);
        if (typeof fn === 'function') { var id = 'h' + (++hid); handlers[id] = fn; el.setAttribute('data-' + n.toLowerCase(), id); }
        continue;
      }
      var val = sub(at.value, sc);
      if (val === false || val == null || typeof val === 'function') continue;
      try { el.setAttribute(n, val === true ? '' : val); } catch (e) {}
    }
    var kids = node.content ? node.content.childNodes : node.childNodes;
    for (var k = 0; k < kids.length; k++) rn(kids[k], sc, el);
    out.appendChild(el);
  }
  function call(el, attr, ev) {
    var id = el.getAttribute(attr); var fn = id && handlers[id];
    if (fn) fn(ev);
  }
  function delegate() {
    document.addEventListener('click', function (e) {
      var el = e.target.closest && e.target.closest('[data-onclick]');
      if (el) call(el, 'data-onclick', e);
    });
    ['mouseover', 'mouseout'].forEach(function (type) {
      document.addEventListener(type, function (e) {
        var attr = type === 'mouseover' ? 'data-onmouseenter' : 'data-onmouseleave';
        var el = e.target;
        while (el && el.nodeType === 1) {
          if (el.hasAttribute(attr) && !(e.relatedTarget && el.contains(e.relatedTarget))) call(el, attr, e);
          el = el.parentElement;
        }
      });
    });
    ['input', 'change', 'focusin', 'focusout', 'keydown', 'submit'].forEach(function (type) {
      var map = { focusin: 'onfocus', focusout: 'onblur' };
      var attr = 'data-' + (map[type] || 'on' + type);
      document.addEventListener(type, function (e) {
        var el = e.target.closest && e.target.closest('[' + attr + ']');
        if (el) call(el, attr, e);
      });
    });
  }
  window.DCLogic = function (props) { this.props = props || {}; this.state = {}; };
  window.DCLogic.prototype.setState = function (s) {
    var self = this;
    var next = typeof s === 'function' ? s(this.state) : s;
    this.state = Object.assign({}, this.state, next);
    this._schedule();
  };
  window.DCLogic.prototype.forceUpdate = function () { this._schedule(); };
  window.DCLogic.prototype._schedule = function () {
    var self = this;
    if (self._pending) return;
    self._pending = true;
    requestAnimationFrame(function () { self._pending = false; self._render(); });
  };
  window.DCLogic.prototype._render = function () {
    handlers = {}; hid = 0;
    var vals = this.renderVals ? this.renderVals() : {};
    var frag = document.createElement('div');
    for (var i = 0; i < this._tpl.childNodes.length; i++) rn(this._tpl.childNodes[i], vals, frag);
    if (this._root.childNodes.length && window.Idiomorph) {
      Idiomorph.morph(this._root, frag.childNodes, { morphStyle: 'innerHTML', ignoreActiveValue: true });
    } else {
      this._root.innerHTML = '';
      while (frag.firstChild) this._root.appendChild(frag.firstChild);
    }
  };
  window.DC = {
    mount: function (Component, tplEl, root, props) {
      delegate();
      var inst = new Component(props || {});
      inst.props = inst.props || props || {};
      inst.state = inst.state || {};
      inst._tpl = tplEl.content || tplEl;
      inst._root = root;
      inst._render();
      if (inst.componentDidMount) inst.componentDidMount();
      return inst;
    }
  };
})();
