/* =========================================================
   Dr. Kaelen Valerius — Portfolio
   1. Generative glyph-grid patterns (canvas)
   2. Scroll reveals
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* =======================================================
     1. GENERATIVE GLYPH GRID
     -------------------------------------------------------
     A grid of marks whose size / weight follows a smooth
     scalar field, so density blooms organically across the
     canvas instead of reading as a flat halftone.
     ======================================================= */

  /* --- glyph vocabulary --------------------------------- */
  var GLYPHS = {
    dot: function (c, x, y, s) {
      c.beginPath();
      c.arc(x, y, s * 0.11, 0, Math.PI * 2);
      c.fill();
    },
    circle: function (c, x, y, s) {
      c.beginPath();
      c.arc(x, y, s * 0.3, 0, Math.PI * 2);
      c.fill();
    },
    ring: function (c, x, y, s) {
      c.lineWidth = Math.max(1, s * 0.1);
      c.beginPath();
      c.arc(x, y, s * 0.3, 0, Math.PI * 2);
      c.stroke();
    },
    square: function (c, x, y, s) {
      var d = s * 0.56;
      c.fillRect(x - d / 2, y - d / 2, d, d);
    },
    squareLg: function (c, x, y, s) {
      var d = s * 0.72;
      c.fillRect(x - d / 2, y - d / 2, d, d);
    },
    plus: function (c, x, y, s) {
      var a = s * 0.36, t = Math.max(1, s * 0.11);
      c.fillRect(x - a, y - t / 2, a * 2, t);
      c.fillRect(x - t / 2, y - a, t, a * 2);
    },
    cross: function (c, x, y, s) {
      var a = s * 0.28, t = Math.max(1, s * 0.1);
      c.save();
      c.translate(x, y);
      c.rotate(Math.PI / 4);
      c.fillRect(-a, -t / 2, a * 2, t);
      c.fillRect(-t / 2, -a, t, a * 2);
      c.restore();
    },
    hash: function (c, x, y, s) {
      var a = s * 0.34, g = s * 0.14, t = Math.max(1, s * 0.09);
      c.fillRect(x - a, y - g - t / 2, a * 2, t);
      c.fillRect(x - a, y + g - t / 2, a * 2, t);
      c.fillRect(x - g - t / 2, y - a, t, a * 2);
      c.fillRect(x + g - t / 2, y - a, t, a * 2);
    },
    tri: function (c, x, y, s) {
      var a = s * 0.32;
      c.beginPath();
      c.moveTo(x + a, y);
      c.lineTo(x - a * 0.75, y - a * 0.85);
      c.lineTo(x - a * 0.75, y + a * 0.85);
      c.closePath();
      c.fill();
    },
    triOutline: function (c, x, y, s) {
      var a = s * 0.32;
      c.lineWidth = Math.max(1, s * 0.09);
      c.beginPath();
      c.moveTo(x + a, y);
      c.lineTo(x - a * 0.75, y - a * 0.85);
      c.lineTo(x - a * 0.75, y + a * 0.85);
      c.closePath();
      c.stroke();
    },
    diamond: function (c, x, y, s) {
      var a = s * 0.3;
      c.lineWidth = Math.max(1, s * 0.09);
      c.beginPath();
      c.moveTo(x, y - a);
      c.lineTo(x + a, y);
      c.lineTo(x, y + a);
      c.lineTo(x - a, y);
      c.closePath();
      c.stroke();
    },
    bar: function (c, x, y, s) {
      var t = Math.max(1, s * 0.1);
      c.fillRect(x - t / 2, y - s * 0.34, t, s * 0.68);
    },
    dash: function (c, x, y, s) {
      var t = Math.max(1, s * 0.1);
      c.fillRect(x - s * 0.34, y - t / 2, s * 0.68, t);
    }
  };

  /* --- ramps: low field value -> high field value -------- */
  var SETS = {
    mixed: ['dot', 'dot', 'plus', 'cross', 'hash', 'tri', 'circle', 'circle', 'square', 'squareLg'],
    marks: ['dot', 'dash', 'bar', 'plus', 'cross', 'plus', 'dash', 'square', 'square', 'squareLg'],
    geo:   ['dot', 'ring', 'diamond', 'triOutline', 'hash', 'diamond', 'circle', 'square', 'square', 'squareLg']
  };

  /* --- smooth pseudo-random scalar field -----------------
     A radial bloom supplies the overall composition; heavily
     warped sine noise breaks it up so the result never reads
     as concentric halftone rings.
     ------------------------------------------------------ */
  function makeField(seed, focus, spread, stretch) {
    var fx = focus[0], fy = focus[1];
    var st = stretch || 1;

    return function (u, v) {
      /* domain warp — bends the sampling grid before sampling */
      var wu = u + 0.17 * Math.sin(v * 6.1 + seed * 1.3);
      var wv = v + 0.15 * Math.cos(u * 5.3 - seed * 0.8);

      var a = Math.sin(wu * 4.7 + seed) * Math.cos(wv * 3.3 - seed * 0.6);
      var b = Math.sin((wu * 2.9 + wv * 3.6) * 1.5 + seed * 1.9);
      var c = Math.cos((wv * 5.2 - wu * 2.4) * 1.1 - seed * 1.4);
      var d = Math.sin((wu - wv) * 8.7 + seed * 2.6);
      var noise = a * 0.42 + b * 0.3 + c * 0.24 + d * 0.14; /* ~ -1.1 .. 1.1 */

      /* elliptical bloom — `stretch` widens it horizontally */
      var dx = (u - fx) / st;
      var dy = (v - fy);
      var dist = Math.sqrt(dx * dx + dy * dy);
      var bloom = 1 - Math.min(1, dist / spread);
      bloom = bloom * bloom * (3 - 2 * bloom); /* smoothstep */

      /* deliberately weak bloom + strong noise: the composition
         should read as drifting texture, never as a hot spot */
      var val = bloom * 0.6 + noise * 0.42 + 0.18;
      return Math.max(0, Math.min(0.999, val));
    };
  }

  function drawPattern(canvas) {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var bg     = canvas.dataset.bg || '#f1ecf6';
    var fg     = canvas.dataset.fg || '#c9b2de';
    var set    = SETS[canvas.dataset.set] || SETS.mixed;
    var seed   = parseFloat(canvas.dataset.seed || '1');
    var cell   = parseFloat(canvas.dataset.cell || '24');
    var spread = parseFloat(canvas.dataset.spread || '0.6');
    var stretch = parseFloat(canvas.dataset.stretch || '1');

    var focusRaw = (canvas.dataset.focus || '0.5,0.5').split(',');
    var focus = [parseFloat(focusRaw[0]), parseFloat(focusRaw[1])];

    /* render at the element's real pixel size, DPR-aware */
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(1, Math.round(rect.width));
    var h = Math.max(1, Math.round(rect.height));
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    /* scale the cell with the canvas so density stays constant */
    var unit = cell * (w / 1160);
    unit = Math.max(11, unit);

    var cols = Math.ceil(w / unit);
    var rows = Math.ceil(h / unit);
    var offX = (w - cols * unit) / 2 + unit / 2;
    var offY = (h - rows * unit) / 2 + unit / 2;

    var field = makeField(seed, focus, spread, stretch);

    ctx.fillStyle = fg;
    ctx.strokeStyle = fg;

    for (var r = 0; r < rows; r++) {
      for (var col = 0; col < cols; col++) {
        var u = (col + 0.5) / cols;
        var v = (r + 0.5) / rows;
        var f = field(u, v);

        var idx = Math.floor(f * set.length);
        if (idx >= set.length) idx = set.length - 1;

        var glyph = GLYPHS[set[idx]];
        if (!glyph) continue;

        /* never reaches full opacity — keeps the field airy */
        ctx.globalAlpha = 0.22 + f * 0.6;

        var size = unit * (0.68 + f * 0.34);
        glyph(ctx, offX + col * unit, offY + r * unit, size);
      }
    }

    ctx.globalAlpha = 1;
  }

  var patterns = Array.prototype.slice.call(document.querySelectorAll('canvas.pattern'));

  function drawAll() {
    patterns.forEach(drawPattern);
  }

  /* redraw on resize, but only when the width actually changed */
  var lastW = window.innerWidth;
  var resizeTimer;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawAll, 160);
  });

  drawAll();
  /* webfonts can shift layout height; repaint once they settle */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(drawAll);
  }


  /* =======================================================
     2. SCROLL REVEALS
     ======================================================= */

  /* stagger index for each masked title line */
  document.querySelectorAll('.lines').forEach(function (group) {
    group.querySelectorAll('.line > span').forEach(function (span, i) {
      span.style.setProperty('--i', i);
    });
  });

  var revealables = document.querySelectorAll('.reveal');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
    return;
  }

  revealables.forEach(function (el) {
    var delay = el.dataset.delay;
    if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -6% 0px'
  });

  revealables.forEach(function (el) { observer.observe(el); });

}());
