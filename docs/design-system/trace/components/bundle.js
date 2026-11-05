/* @ds-bundle: {"format":4,"namespace":"Trace","components":[{"name":"Button"},{"name":"Tag"},{"name":"Marker"},{"name":"ArticleCard"},{"name":"Outline"},{"name":"Callout"},{"name":"SpecSheet"},{"name":"MathBlock"},{"name":"CodeBlock"},{"name":"Cells"},{"name":"Stepper"},{"name":"Figure"},{"name":"Compare"},{"name":"Diagram"}]} */
(function () {
  var R = window.React, h = R.createElement;

  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function omit(p, keys) { var o = {}; for (var k in p) if (keys.indexOf(k) < 0) o[k] = p[k]; return o; }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  /* ---------- Button ---------- */
  function Button(p) {
    var rest = omit(p, ['variant', 'size', 'className', 'children']);
    return h('button', Object.assign({ type: 'button' }, rest, {
      className: cx('tr-btn', 'tr-btn--' + (p.variant || 'secondary'), 'tr-btn--' + (p.size || 'md'), p.className)
    }), p.children);
  }

  /* ---------- Tag ---------- */
  function Tag(p) {
    return h('span', { className: cx('tr-tag', 'tr-tag--' + (p.tone || 'neutral'), p.className) }, p.children);
  }

  /* ---------- Marker: numbered cross-reference dot ---------- */
  function Marker(p) {
    return h('span', { className: cx('tr-marker', 'tr-marker--' + (p.tone || 'signal'), p.className), 'aria-label': '标注 ' + p.n }, p.n);
  }

  /* ---------- ArticleCard ---------- */
  function ArticleCard(p) {
    var Tagname = p.href ? 'a' : 'article';
    var meta = (p.meta || []).filter(Boolean);
    return h(Tagname, { className: cx('tr-card', p.href && 'tr-card--link', p.className), href: p.href },
      h('div', { className: 'tr-card__top' },
        p.no != null && h('span', { className: 'tr-card__no' }, 'No.' + String(p.no).padStart(3, '0')),
        p.kicker && h('span', { className: 'tr-card__kicker' }, p.kicker)
      ),
      h('h3', { className: 'tr-card__title' }, p.title),
      p.summary && h('p', { className: 'tr-card__summary' }, p.summary),
      h('div', { className: 'tr-card__foot' },
        h('div', { className: 'tr-card__tags' }, (p.tags || []).map(function (t, i) {
          return typeof t === 'string' ? h(Tag, { key: i }, t) : h(Tag, { key: i, tone: t.tone }, t.label);
        })),
        meta.length > 0 && h('span', { className: 'tr-card__meta' }, meta.join(' · '))
      )
    );
  }

  /* ---------- Outline: numbered table of contents ---------- */
  function Outline(p) {
    var a = 0, b = 0;
    return h('nav', { className: cx('tr-outline', p.className), 'aria-label': p.title || '本页目录' },
      h('div', { className: 'tr-outline__title' }, p.title || '本页目录'),
      h('ol', null, (p.items || []).map(function (it) {
        var num;
        if ((it.level || 1) === 1) { a++; b = 0; num = pad2(a); } else { b++; num = a + '.' + b; }
        var on = it.id === p.active;
        return h('li', { key: it.id, className: cx('tr-outline__item', 'tr-outline__item--l' + (it.level || 1), on && 'is-active') },
          h('a', { href: '#' + it.id, 'aria-current': on ? 'location' : undefined },
            h('span', { className: 'tr-outline__num' }, num),
            h('span', null, it.title)));
      }))
    );
  }

  /* ---------- Callout ---------- */
  var KINDS = {
    note:       { glyph: 'i', label: 'NOTE',       zh: '注' },
    definition: { glyph: '≡', label: 'DEFINITION', zh: '定义' },
    invariant:  { glyph: '∀', label: 'INVARIANT',  zh: '不变量' },
    insight:    { glyph: '→', label: 'INSIGHT',    zh: '关键直觉' },
    pitfall:    { glyph: '!', label: 'PITFALL',    zh: '陷阱' }
  };
  function Callout(p) {
    var k = KINDS[p.kind] ? p.kind : 'note', d = KINDS[k];
    return h('aside', { className: cx('tr-callout', 'tr-callout--' + k, p.className) },
      h('div', { className: 'tr-callout__head' },
        h('span', { className: 'tr-callout__glyph', 'aria-hidden': 'true' }, d.glyph),
        h('span', { className: 'tr-callout__label' }, d.zh + ' · ' + d.label),
        p.title && h('strong', { className: 'tr-callout__title' }, p.title)),
      h('div', { className: 'tr-callout__body' }, p.children)
    );
  }

  /* ---------- SpecSheet: key facts / complexity ---------- */
  function SpecSheet(p) {
    return h('section', { className: cx('tr-spec', p.className) },
      p.title && h('div', { className: 'tr-spec__head' }, h('span', null, 'SPEC'), h('span', { className: 'tr-spec__name' }, p.title)),
      h('dl', { className: 'tr-spec__grid' }, (p.rows || []).map(function (r, i) {
        return h('div', { key: i, className: cx('tr-spec__row', r.tone && 'tr-spec__row--' + r.tone) },
          h('dt', null, r.k),
          h('dd', null, h('span', { className: 'tr-spec__v' }, r.v), r.note && h('span', { className: 'tr-spec__note' }, r.note)));
      }))
    );
  }

  /* ---------- MathBlock ---------- */
  function MathBlock(p) {
    return h('div', { className: cx('tr-math', p.className), role: 'math' },
      h('div', { className: 'tr-math__expr' }, p.children),
      p.label != null && h('span', { className: 'tr-math__label' }, '(' + p.label + ')'),
      p.note && h('div', { className: 'tr-math__note' }, p.note));
  }

  /* ---------- CodeBlock ---------- */
  var KW = 'func|return|if|else|for|range|type|struct|var|const|package|import|go|defer|select|case|switch|default|map|chan|interface|nil|true|false|def|class|let|fn|pub|impl|while|in|new|break|continue|static|void|int|uint8|uintptr|bool|string|async|await|match|self|None|True|False';
  function tokenize(line, lang) {
    var hashComment = /^(py|python|sh|bash|yaml|yml|toml|rb|ruby|conf)$/.test(lang || '');
    var re = new RegExp('(' + (hashComment ? '#.*$' : '\\/\\/.*$|\\/\\*.*?\\*\\/|--\\s.*$') + ')|("(?:[^"\\\\]|\\\\.)*"|`[^`]*`|\'(?:[^\'\\\\]|\\\\.)*\')|\\b(\\d+(?:\\.\\d+)?|0x[0-9a-fA-F]+)\\b|\\b(' + KW + ')\\b', 'g');
    var out = [], last = 0, m, i = 0;
    while ((m = re.exec(line))) {
      if (m.index > last) out.push(line.slice(last, m.index));
      var cls = m[1] ? 'tr-c' : m[2] ? 'tr-s' : m[3] ? 'tr-n' : 'tr-k';
      out.push(h('span', { key: i++, className: cls }, m[0]));
      last = re.lastIndex;
      if (m[0].length === 0) re.lastIndex++;
    }
    if (last < line.length) out.push(line.slice(last));
    return out;
  }
  function CodeBlock(p) {
    var lines = String(p.code || '').replace(/\n$/, '').split('\n');
    var start = p.start || 1, hl = p.highlight || [], notes = p.notes || {};
    return h('figure', { className: cx('tr-code', p.className) },
      (p.filename || p.lang) && h('figcaption', { className: 'tr-code__head' },
        h('span', { className: 'tr-code__file' }, p.filename || ''),
        p.lang && h('span', { className: 'tr-code__lang' }, p.lang)),
      h('pre', { className: 'tr-code__pre' }, h('code', null, lines.map(function (ln, i) {
        var n = start + i;
        return h('span', { key: i, className: cx('tr-code__line', hl.indexOf(n) >= 0 && 'is-hl') },
          p.lineNumbers !== false && h('span', { className: 'tr-code__ln', 'aria-hidden': 'true' }, n),
          h('span', { className: 'tr-code__src' }, tokenize(ln, p.lang), '\n'),
          notes[n] != null && h(Marker, { n: notes[n], className: 'tr-code__mk' }));
      })))
    );
  }

  /* ---------- Cells: arrays, buckets, logs, memory ---------- */
  function Cells(p) {
    var showIndex = p.showIndex !== false, base = p.indexBase || 0;
    return h('div', { className: cx('tr-cells', p.className) },
      p.label && h('div', { className: 'tr-cells__label' }, p.label),
      h('div', { className: 'tr-cells__row', role: 'list' }, (p.cells || []).map(function (c, i) {
        if (c == null || typeof c !== 'object') c = { v: c };
        return h('div', { key: i, role: 'listitem', className: cx('tr-cell', 'tr-cell--' + (c.state || 'default')) },
          h('span', { className: 'tr-cell__tag' }, c.tag || ' '),
          h('span', { className: 'tr-cell__box', style: p.cellWidth ? { minWidth: p.cellWidth } : undefined }, c.v == null || c.v === '' ? '∅' : c.v),
          showIndex && h('span', { className: 'tr-cell__idx' }, c.idx != null ? c.idx : base + i));
      })),
      p.caption && h('div', { className: 'tr-cells__caption' }, p.caption)
    );
  }

  /* ---------- Stepper: step-through explanation ---------- */
  function Stepper(p) {
    var steps = p.steps || [], n = steps.length;
    var st = R.useState(Math.min(p.initial || 0, Math.max(0, n - 1))), i = st[0], set = st[1];
    function go(j) { j = Math.max(0, Math.min(n - 1, j)); set(j); if (p.onChange) p.onChange(j); }
    function onKey(e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); } }
    var s = steps[i] || {};
    return h('section', { className: cx('tr-stepper', p.className), tabIndex: 0, onKeyDown: onKey, 'aria-roledescription': 'stepper' },
      h('div', { className: 'tr-stepper__bar' },
        h('span', { className: 'tr-stepper__count' }, 'STEP ', h('b', null, pad2(i + 1)), ' / ' + pad2(n)),
        h('div', { className: 'tr-stepper__ticks' }, steps.map(function (_, j) {
          return h('button', { key: j, type: 'button', className: cx('tr-stepper__tick', j < i && 'is-done', j === i && 'is-now'), 'aria-label': '第 ' + (j + 1) + ' 步', onClick: function () { go(j); } });
        }))),
      p.renderStage && h('div', { className: 'tr-stepper__stage' }, p.renderStage(i)),
      h('div', { className: 'tr-stepper__text', 'aria-live': 'polite' },
        h('h4', { className: 'tr-stepper__title' }, s.title),
        s.desc && h('p', { className: 'tr-stepper__desc' }, s.desc)),
      h('div', { className: 'tr-stepper__nav' },
        h(Button, { variant: 'ghost', size: 'sm', disabled: i === 0, onClick: function () { go(i - 1); } }, '← 上一步'),
        h(Button, { variant: i === n - 1 ? 'secondary' : 'primary', size: 'sm', onClick: function () { go(i === n - 1 ? 0 : i + 1); } }, i === n - 1 ? '↺ 重来' : '下一步 →'))
    );
  }

  /* ---------- Figure ---------- */
  function Figure(p) {
    return h('figure', { className: cx('tr-figure', p.grid === false && 'tr-figure--plain', p.className) },
      h('div', { className: 'tr-figure__canvas' }, p.children),
      (p.caption || p.n != null) && h('figcaption', { className: 'tr-figure__cap' },
        p.n != null && h('span', { className: 'tr-figure__n' }, '图 ' + p.n),
        p.caption));
  }

  /* ---------- Compare: notebook (default) or Swiss grid ---------- */
  var VERDICT = { good: { g: '+', zh: '优' }, bad: { g: '−', zh: '劣' }, neutral: { g: '·', zh: '中' } };
  var SWATCH = ['signal', 'cobalt', 'ink', 'green'];
  function Compare(p) {
    var opts = p.options || [], n = opts.length, focus = p.focus, nb = p.variant !== 'swiss';
    var cols = 'minmax(120px, 1.1fr) repeat(' + n + ', minmax(140px, 1fr))';
    function cell(v, j, key) {
      if (v == null || typeof v !== 'object') v = { v: v };
      var d = v.verdict && VERDICT[v.verdict];
      var cls = cx('tr-cmp__cell', j === focus && 'is-focus', d && 'tr-cmp__cell--' + v.verdict);
      if (nb) return h('div', { key: key, role: 'cell', className: cls },
        d ? h('span', { className: cx('tr-cmp__pill', 'tr-cmp__pill--' + v.verdict) }, h('b', { 'aria-label': d.zh }, d.g), v.v) : h('span', { className: 'tr-cmp__val' }, v.v));
      return h('div', { key: key, role: 'cell', className: cls },
        d && h('span', { className: 'tr-cmp__vd', title: d.zh, 'aria-label': d.zh }, d.g),
        h('span', { className: 'tr-cmp__val' }, v.v));
    }
    function head(o, j) {
      var on = j === focus;
      if (nb) return h('div', { key: 'h' + j, role: 'columnheader', className: cx('tr-cmp__head', on && 'is-focus') },
        h('span', { className: 'tr-cmp__name' }, h('i', { className: 'tr-cmp__sw tr-cmp__sw--' + SWATCH[j % SWATCH.length], 'aria-hidden': 'true' }), o.name),
        o.sub && h('span', { className: 'tr-cmp__sub' }, o.sub),
        on && h('span', { className: 'tr-cmp__sticker' }, p.focusLabel || '本文焦点'));
      return h('div', { key: 'h' + j, role: 'columnheader', className: cx('tr-cmp__head', on && 'is-focus') },
        h('span', { className: 'tr-cmp__num' }, pad2(j + 1)),
        h('span', { className: 'tr-cmp__name' }, o.name),
        o.sub && h('span', { className: 'tr-cmp__sub' }, o.sub),
        on && h('span', { className: 'tr-cmp__flag' }, p.focusLabel || '本文焦点'));
    }
    return h('section', { className: cx('tr-cmp', nb ? 'tr-cmp--notebook' : 'tr-cmp--swiss', p.className) },
      (p.title || p.kicker) && h('header', { className: 'tr-cmp__intro' },
        p.kicker && h('div', { className: 'tr-cmp__kicker' }, p.kicker),
        p.title && h('h3', { className: 'tr-cmp__title' }, p.title)),
      h('div', { className: 'tr-cmp__scroll' },
        h('div', { className: 'tr-cmp__table', role: 'table', style: { gridTemplateColumns: cols } },
          h('div', { className: 'tr-cmp__corner', role: 'columnheader' }, p.corner || '维度'),
          opts.map(head),
          (p.rows || []).map(function (r, i) {
            return [h('div', { key: 'k' + i, role: 'rowheader', className: 'tr-cmp__key' },
              h('span', { className: 'tr-cmp__k' }, r.k), r.note && h('span', { className: 'tr-cmp__note' }, r.note))]
              .concat((r.values || []).map(function (v, j) { return cell(v, j, 'v' + i + '-' + j); }));
          }),
          nb && p.summary && h('div', { className: 'tr-cmp__summary', style: { gridColumn: '1 / -1' } },
            h('span', { className: 'tr-cmp__sumlabel' }, '→ 结论'), h('span', null, p.summary)))),
      p.footer && h('p', { className: 'tr-cmp__foot' }, p.footer));
  }

  /* ---------- Diagram: nodes + orthogonal arrows — notebook (default) or Swiss ---------- */
  function textW(t) { var w = 0; String(t).split('').forEach(function (c) { w += c.charCodeAt(0) > 0x2e80 ? 11 : 6.8; }); return w; }
  function roundPath(pts, r) {
    if (!r) return 'M' + pts.map(function (q) { return q[0] + ' ' + q[1]; }).join(' L');
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length - 1; i++) {
      var A = pts[i - 1], B = pts[i], Cc = pts[i + 1];
      var l1 = Math.hypot(B[0] - A[0], B[1] - A[1]), l2 = Math.hypot(Cc[0] - B[0], Cc[1] - B[1]);
      if (l1 < 0.5 || l2 < 0.5) continue;
      var rr = Math.min(r, l1 / 2, l2 / 2);
      var p1 = [B[0] - (B[0] - A[0]) / l1 * rr, B[1] - (B[1] - A[1]) / l1 * rr];
      var p2 = [B[0] + (Cc[0] - B[0]) / l2 * rr, B[1] + (Cc[1] - B[1]) / l2 * rr];
      d += ' L' + p1[0] + ' ' + p1[1] + ' Q' + B[0] + ' ' + B[1] + ' ' + p2[0] + ' ' + p2[1];
    }
    var L = pts[pts.length - 1];
    return d + ' L' + L[0] + ' ' + L[1];
  }
  function Diagram(p) {
    var nb = p.variant !== 'swiss';
    var U = p.unit || (nb ? 16 : 24), cols = p.cols || 24, rows = p.rows || 12, W = cols * U, H = rows * U;
    var nodes = p.nodes || [], byId = {}, hl = p.highlight;
    nodes.forEach(function (nd) { byId[nd.id] = nd; });
    var uid = R.useState(function () { return 'trd' + Math.random().toString(36).slice(2, 8); })[0];
    function box(nd) { return { x: nd.x * U, y: nd.y * U, w: (nd.w || 4) * U, h: (nd.h || 2) * U }; }
    function anchor(b, side, t) {
      t = t == null ? 0.5 : t;
      if (side === 'left') return [b.x, b.y + b.h * t];
      if (side === 'right') return [b.x + b.w, b.y + b.h * t];
      if (side === 'top') return [b.x + b.w * t, b.y];
      return [b.x + b.w * t, b.y + b.h];
    }
    function route(e) {
      var A = byId[e.from], B = byId[e.to]; if (!A || !B) return null;
      var a = box(A), b = box(B);
      var dx = (b.x + b.w / 2) - (a.x + a.w / 2), dy = (b.y + b.h / 2) - (a.y + a.h / 2);
      var horiz = e.axis ? e.axis === 'h' : Math.abs(dx) * a.h >= Math.abs(dy) * a.w;
      var s1 = e.fromSide || (horiz ? (dx >= 0 ? 'right' : 'left') : (dy >= 0 ? 'bottom' : 'top'));
      var s2 = e.toSide || (horiz ? (dx >= 0 ? 'left' : 'right') : (dy >= 0 ? 'top' : 'bottom'));
      var P = anchor(a, s1, e.fromAt), Q = anchor(b, s2, e.toAt), pts, lab;
      var h1 = s1 === 'left' || s1 === 'right', h2 = s2 === 'left' || s2 === 'right';
      if (h1 && h2) {
        var mx = e.mid != null ? e.mid * U : (P[0] + Q[0]) / 2;
        pts = [P, [mx, P[1]], [mx, Q[1]], Q]; lab = P[1] === Q[1] ? [(P[0] + Q[0]) / 2, P[1]] : [mx, (P[1] + Q[1]) / 2];
      } else if (!h1 && !h2) {
        var my = e.mid != null ? e.mid * U : (P[1] + Q[1]) / 2;
        pts = [P, [P[0], my], [Q[0], my], Q]; lab = P[0] === Q[0] ? [P[0], (P[1] + Q[1]) / 2] : [(P[0] + Q[0]) / 2, my];
      } else if (h1) { pts = [P, [Q[0], P[1]], Q]; lab = [(P[0] + Q[0]) / 2, P[1]]; }
      else { pts = [P, [P[0], Q[1]], Q]; lab = [P[0], (P[1] + Q[1]) / 2]; }
      return { d: roundPath(pts, nb ? 8 : 0), lab: lab };
    }
    /* highlight: lit nodes/edges become active, the rest recede */
    function nodeKind(nd) {
      if (!hl) return nd.kind || 'default';
      if ((hl.nodes || []).indexOf(nd.id) >= 0) return 'active';
      return nd.kind === 'external' ? 'external' : 'dim';
    }
    function edgeKind(e, i) {
      if (!hl) return e.kind || 'default';
      return (hl.edges || []).indexOf(i) >= 0 ? 'active' : 'dim';
    }
    var dots = [], step = nb ? 1 : 2;
    if (p.guides !== false) for (var gx = 0; gx <= cols; gx += step) for (var gy = 0; gy <= rows; gy += step)
      dots.push(nb ? h('circle', { key: gx + '-' + gy, className: 'tr-dg__dot', cx: gx * U, cy: gy * U, r: 1.2 }) : h('rect', { key: gx + '-' + gy, className: 'tr-dg__dot', x: gx * U - 1, y: gy * U - 1, width: 2, height: 2 }));
    function tone(k) { return k === 'active' ? 'signal' : k === 'ref' ? 'cobalt' : k === 'dim' ? 'dim' : 'ink'; }
    var pad = nb ? 12 : 0;
    var svg = h('svg', { className: 'tr-dg__svg', viewBox: (-pad) + ' ' + (-pad) + ' ' + (W + 2 * pad) + ' ' + (H + 2 * pad), width: W + 2 * pad, height: H + 2 * pad, role: 'img', 'aria-label': p.title || (typeof p.caption === 'string' ? p.caption : 'diagram') },
      h('defs', null, ['ink', 'signal', 'cobalt', 'dim'].map(function (t) {
        return h('marker', { key: t, id: uid + '-' + t, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: 'auto-start-reverse', markerUnits: 'userSpaceOnUse' },
          h('path', { d: 'M0 0 L10 5 L0 10 z', className: 'tr-dg__head--' + t }));
      })),
      h('g', null, dots),
      (p.groups || []).map(function (g, i) {
        var x = g.x * U, y = g.y * U, w = g.w * U, hh = g.h * U;
        if (nb) {
          var lw = textW(g.label) + 20;
          return h('g', { key: 'g' + i, className: 'tr-dg__group' },
            h('rect', { className: 'tr-dg__zone', x: x, y: y, width: w, height: hh, rx: 12 }),
            h('rect', { className: 'tr-dg__zpill', x: x + 12, y: y - 10, width: lw, height: 20, rx: 10 }),
            h('text', { className: 'tr-dg__zlabel', x: x + 12 + lw / 2, y: y + 4, textAnchor: 'middle' }, g.label));
        }
        return h('g', { key: 'g' + i, className: 'tr-dg__group' },
          h('rect', { className: 'tr-dg__zone', x: x, y: y, width: w, height: hh }),
          h('rect', { className: 'tr-dg__zrule', x: x, y: y, width: w, height: 3 }),
          h('text', { className: 'tr-dg__zlabel', x: x + 8, y: y + 20 }, g.label));
      }),
      (p.edges || []).map(function (e, i) {
        var r = route(e); if (!r) return null; var k = edgeKind(e, i), t = tone(k);
        var lw = e.label ? textW(e.label) + (nb ? 16 : 12) : 0;
        return h('g', { key: 'e' + i, className: cx('tr-dg__edge', 'tr-dg__edge--' + k) },
          h('path', { d: r.d, className: 'tr-dg__line', markerEnd: 'url(#' + uid + '-' + t + ')', markerStart: e.both ? 'url(#' + uid + '-' + t + ')' : undefined }),
          e.label && h('g', { transform: 'translate(' + r.lab[0] + ' ' + r.lab[1] + ')' },
            h('rect', { className: cx('tr-dg__lbg', 'tr-dg__lbg--' + t), x: -lw / 2, y: nb ? -10 : -9, width: lw, height: nb ? 20 : 18, rx: nb ? 10 : 0 }),
            h('text', { className: cx('tr-dg__elabel', 'tr-dg__elabel--' + t), x: 0, y: 4, textAnchor: 'middle' }, e.label)));
      }),
      nodes.map(function (nd) {
        var b = box(nd), k = nodeKind(nd), rx = nb ? 8 : 0, store = nd.kind === 'store';
        return h('g', { key: nd.id, className: cx('tr-dg__node', 'tr-dg__node--' + k, store && 'is-store') },
          nb && k === 'active' && h('rect', { className: 'tr-dg__pop', x: b.x + 4, y: b.y + 4, width: b.w, height: b.h, rx: rx }),
          h('rect', { className: 'tr-dg__box', x: b.x, y: b.y, width: b.w, height: b.h, rx: rx }),
          store && h('line', { className: 'tr-dg__store', x1: b.x + (nb ? 4 : 0), x2: b.x + b.w - (nb ? 4 : 0), y1: b.y + 7, y2: b.y + 7 }),
          nd.n != null && (nb
            ? h('g', { className: 'tr-dg__mk' }, h('circle', { cx: b.x, cy: b.y, r: 10 }), h('text', { x: b.x, y: b.y + 4, textAnchor: 'middle' }, nd.n))
            : h('text', { className: 'tr-dg__num', x: b.x + 8, y: b.y + 15 }, typeof nd.n === 'number' ? pad2(nd.n) : nd.n)),
          h('text', { className: 'tr-dg__label', x: b.x + b.w / 2, y: b.y + b.h / 2 + (nd.sub ? -1 : 5), textAnchor: 'middle' }, nd.label),
          nd.sub && h('text', { className: 'tr-dg__sub', x: b.x + b.w / 2, y: b.y + b.h / 2 + 15, textAnchor: 'middle' }, nd.sub));
      }));
    return h('figure', { className: cx('tr-dg', nb ? 'tr-dg--notebook' : 'tr-dg--swiss', p.className) },
      h('div', { className: 'tr-dg__scroll' }, svg),
      (p.caption || p.n != null) && h('figcaption', { className: 'tr-figure__cap' },
        p.n != null && h('span', { className: 'tr-figure__n' }, '图 ' + p.n), p.caption));
  }

  var C = window;
  C.Trace = C.Trace || {};
  Object.assign(C.Trace, { Button: Button, Tag: Tag, Marker: Marker, ArticleCard: ArticleCard, Outline: Outline, Callout: Callout, SpecSheet: SpecSheet, MathBlock: MathBlock, CodeBlock: CodeBlock, Cells: Cells, Stepper: Stepper, Figure: Figure, Compare: Compare, Diagram: Diagram });
})();
