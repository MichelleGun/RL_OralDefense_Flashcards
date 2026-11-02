/* Diagrams: inline SVG, themed through page CSS classes on .dg (no ids, no markers, no external images). */
window.DIAG = (function () {
  'use strict';
  var D = {};
  function n(v) { return Math.round(v * 10) / 10; }
  function ex(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function lc(f) { f = f || ''; var c = 'ln'; if (/a/.test(f)) c += ' lna'; else if (/r/.test(f)) c += ' lnr'; else if (/m/.test(f)) c += ' lnm'; if (/d/.test(f)) c += ' dash'; if (/t/.test(f)) c += ' thin'; if (/b/.test(f)) c += ' bold'; return c; }
  function hc(f) { f = f || ''; return /a/.test(f) ? 'hda' : /r/.test(f) ? 'hdr' : /m/.test(f) ? 'hdm' : 'hd'; }
  function head(x, y, ang, f) {
    var s = 7, w = 3.5, ca = Math.cos(ang), sa = Math.sin(ang);
    return '<polygon class="' + hc(f) + '" points="' + n(x) + ',' + n(y) + ' ' + n(x - s * ca + w * sa) + ',' + n(y - s * sa - w * ca) + ' ' + n(x - s * ca - w * sa) + ',' + n(y - s * sa + w * ca) + '"/>';
  }
  function L(x1, y1, x2, y2, f) { return '<line class="' + lc(f) + '" x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '"/>'; }
  function A(x1, y1, x2, y2, f) { var g = Math.atan2(y2 - y1, x2 - x1); return L(x1, y1, x2 - 5 * Math.cos(g), y2 - 5 * Math.sin(g), f) + head(x2, y2, g, f); }
  function AQ(x1, y1, cx, cy, x2, y2, f) { var g = Math.atan2(y2 - cy, x2 - cx); return '<path class="' + lc(f) + '" d="M' + n(x1) + ' ' + n(y1) + ' Q' + n(cx) + ' ' + n(cy) + ' ' + n(x2 - 5 * Math.cos(g)) + ' ' + n(y2 - 5 * Math.sin(g)) + '"/>' + head(x2, y2, g, f); }
  function P(d, f) { return '<path class="' + lc(f) + '" d="' + d + '"/>'; }
  function SH(d, c) { return '<path class="' + c + '" d="' + d + '"/>'; }
  function PL(pts, f) { return '<polyline class="' + lc(f) + '" points="' + pts.map(function (p) { return n(p[0]) + ',' + n(p[1]); }).join(' ') + '"/>'; }
  function APL(pts, f) { var a = pts[pts.length - 2], b = pts[pts.length - 1], g = Math.atan2(b[1] - a[1], b[0] - a[0]); return PL(pts.slice(0, -1).concat([[b[0] - 5 * Math.cos(g), b[1] - 5 * Math.sin(g)]]), f) + head(b[0], b[1], g, f); }
  function T(x, y, s, o) {
    o = o || {};
    var a = ' x="' + n(x) + '" y="' + n(y) + '" text-anchor="' + (o.a || 'middle') + '"';
    if (o.c) a += ' class="' + o.c + '"';
    if (o.s) a += ' font-size="' + o.s + '"';
    if (o.w) a += ' font-weight="' + o.w + '"';
    if (o.tr) a += ' transform="' + o.tr + '"';
    return '<text' + a + '>' + ex(s) + '</text>';
  }
  function R(x, y, w, h, c, rx, extra) { return '<rect class="' + (c || 'bx') + '" x="' + n(x) + '" y="' + n(y) + '" width="' + n(w) + '" height="' + n(h) + '" rx="' + (rx == null ? 6 : rx) + '"' + (extra || '') + '/>'; }
  function C(x, y, r, c, extra) { return '<circle class="' + (c || 'bx') + '" cx="' + n(x) + '" cy="' + n(y) + '" r="' + r + '"' + (extra || '') + '/>'; }
  function BOX(x, y, w, h, label, c, o) {
    o = o || {};
    var lines = String(label).split('\n'), lh = o.lh || 14, y0 = y + h / 2 - (lines.length - 1) * lh / 2, out = R(x, y, w, h, c, o.rx);
    lines.forEach(function (t, i) {
      var opt = {};
      if (i === 0 && o.head) opt.w = 600;
      if (i > 0 && o.sub) { opt.c = 't-m'; opt.s = 10; } else if (o.s) opt.s = o.s;
      out += T(x + w / 2, y0 + i * lh, t, opt);
    });
    return out;
  }
  function add(name, w, h, cap, body) {
    var aria = cap.replace(/\*\*/g, '').replace(/"/g, '');
    D[name] = { cap: cap, svg: '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + ex(aria) + '">' + body + '</svg>' };
  }
  var i, k, s;

  /* 1. agent environment loop */
  add('loop', 360, 184, 'The agent environment loop. Each step the agent sees a state, picks an action, and the environment answers with a reward and the next state. The agent only ever sees these signals, never the dynamics inside the box.',
    BOX(20, 62, 110, 46, 'Agent\npolicy π', 'bxa', { head: 1, sub: 1 }) +
    BOX(230, 62, 110, 46, 'Environment\np(s′, r | s, a)', 'bx', { head: 1, sub: 1 }) +
    AQ(75, 62, 180, 0, 285, 62, 'a') + T(180, 18, 'action Aₜ', { c: 't-a' }) +
    AQ(285, 108, 180, 160, 75, 108, '') + T(180, 122, 'reward Rₜ₊₁') +
    AQ(305, 108, 180, 205, 55, 108, '') + T(180, 172, 'next state Sₜ₊₁'));

  /* 2. epsilon greedy */
  s = T(180, 12, 'every time step', { c: 't-m', s: 10 }) + A(168, 20, 100, 40) + A(192, 20, 260, 40) +
    BOX(30, 40, 140, 28, 'exploit, 1 − ε = 0.8') + BOX(190, 40, 140, 28, 'explore, ε = 0.2') +
    A(100, 68, 100, 90) + BOX(55, 90, 90, 26, 'greedy a*', 'bxa');
  for (i = 0; i < 4; i++) { var ex0 = 196 + 33 * i; s += A(260, 68, ex0 + 14.5, 90, 'm') + BOX(ex0, 90, 29, 26, '¼', 'bxm'); }
  s += T(260, 128, 'uniform over all 4 arms,', { c: 't-m', s: 10 }) + T(260, 141, 'a* included', { c: 't-m', s: 10 }) +
    T(20, 158, 'total probability of each arm', { a: 'start', c: 't-m', s: 10 }) +
    R(20, 166, 272, 22, 'bxa', 0) + T(156, 177, 'a*: 0.8 + 0.2/4 = 0.85');
  for (i = 0; i < 3; i++) s += R(292 + 16 * i, 166, 16, 22, 'bxr', 0);
  s += T(316, 198, '0.05 each', { c: 't-r', s: 10 });
  add('egreedy', 360, 206, 'Epsilon-greedy with ε = 0.2 and k = 4 arms. Exploring picks uniformly, so the greedy arm can also be chosen while exploring. That is why its total is 1 − ε + ε/k, and every other arm gets ε/k.', s);

  /* 3. UCB */
  (function () {
    function yv(v) { return 150 - 120 * v; }
    var u = L(40, 30, 40, 150, 'm') + L(40, 150, 340, 150, 'm') + T(34, 150, '0', { a: 'end', c: 't-m', s: 10 }) + T(34, 90, '0.5', { a: 'end', c: 't-m', s: 10 }) + T(34, 30, '1', { a: 'end', c: 't-m', s: 10 });
    [[100, .6, .08, 'N = 100', 'bxr'], [190, .5, .35, 'N = 5', 'bxa'], [280, .3, .12, 'N = 40', 'bx']].forEach(function (a, j) {
      var top = yv(a[1]), up = yv(a[1] + a[2]);
      u += R(a[0] - 22, top, 44, 150 - top, a[4], 2) + L(a[0], top, a[0], up) + L(a[0] - 8, up, a[0] + 8, up) + C(a[0], up, 3, 'fi') + T(a[0], 163, 'arm ' + (j + 1)) + T(a[0], 176, a[3], { c: 't-m', s: 10 });
    });
    u += T(100, 56, 'greedy picks', { c: 't-r', s: 10 }) + T(190, 36, 'UCB picks', { c: 't-a', s: 10, w: 600 }) + T(190, 198, 'bar = Q(a)    whisker = c·√(ln t / N(a))', { c: 't-m', s: 10 });
    add('ucb', 360, 208, 'UCB adds an uncertainty bonus that shrinks as an arm is tried more. Arm 1 has the best average but is already well known. Arm 2 has barely been tried, so its upper bound is the highest and UCB tries it. Greedy never would.', u);
  })();

  /* 4. Markov chain, MRP, MDP */
  s = '';
  [[60, 'Markov chain', '⟨S, P⟩', 'just transitions', '', 0], [180, 'MRP', '⟨S, P, R, γ⟩', 'adds rewards, γ', 'states get values', 1], [300, 'MDP', '⟨S, A, P, R, γ⟩', 'adds actions', 'the agent chooses', 2]].forEach(function (c) {
    var x = c[0];
    s += T(x, 14, c[1], { w: 600, s: 12 });
    if (c[5] < 2) s += A(x - 24, 52, x + 24, 52, c[5] ? 'a' : '') + T(x, 40, c[5] ? 'P, r' : 'P', { c: c[5] ? 't-a' : 't-m', s: 10 });
    else s += A(x - 24, 52, x - 5, 52, 'a') + C(x, 52, 3.5, 'fi') + A(x + 4, 52, x + 24, 52) + T(x - 14, 40, 'a', { c: 't-a', s: 10 }) + T(x + 14, 40, 'P', { c: 't-m', s: 10 });
    s += C(x - 36, 52, 12) + T(x - 36, 52, 's') + C(x + 36, 52, 12) + T(x + 36, 52, 's′') + T(x, 86, c[2]) + T(x, 106, c[3], { c: 't-m', s: 10 }) + (c[4] ? T(x, 119, c[4], { c: 't-m', s: 10 }) : '');
  });
  s += A(110, 52, 128, 52, 'm') + A(230, 52, 248, 52, 'm');
  add('mdpladder', 360, 128, 'Each model adds one ingredient. A Markov chain only moves between states. An MRP attaches rewards and a discount, so states have values. An MDP adds actions, so there is finally something to optimise.', s);

  /* 5. discount weights */
  s = R(60, 8, 10, 10, 'fa', 1) + T(76, 13, 'γ = 0.9', { a: 'start' }) + R(150, 8, 10, 10, 'fr', 1) + T(166, 13, 'γ = 0.5', { a: 'start' }) + L(40, 160, 340, 160, 'm') + T(34, 40, '1', { a: 'end', c: 't-m', s: 10 }) + T(34, 160, '0', { a: 'end', c: 't-m', s: 10 });
  for (k = 0; k < 10; k++) { var x0 = 45 + 29 * k, h1 = 120 * Math.pow(.9, k), h2 = 120 * Math.pow(.5, k); s += R(x0 + 3, 160 - h1, 11, h1, 'fa', 0) + R(x0 + 14, 160 - h2, 11, h2, 'fr', 0) + T(x0 + 14, 172, String(k), { c: 't-m', s: 10 }); }
  s += T(190, 188, 'k steps ahead: the reward counts γᵏ', { c: 't-m', s: 10 }) + T(335, 50, 'horizon ≈ 1 / (1 − γ)', { a: 'end', s: 10 }) + T(335, 64, '10 steps vs 2 steps', { a: 'end', c: 't-m', s: 10 });
  add('discount', 360, 196, 'How much a reward k steps ahead counts. With γ = 0.9 the agent still cares about rewards ten steps out. With γ = 0.5 anything past three steps is nearly ignored. Small γ is short-sighted, γ close to 1 is far-sighted.', s);

  /* 6. backup diagrams */
  (function () {
    function tree(ox, oy, title, stateRoot, maxLvl, sub) {
      var t = '', r = [ox + 90, oy + 32], l1 = [[ox + 50, oy + 66], [ox + 130, oy + 66]], l2 = [[ox + 28, oy + 100], [ox + 72, oy + 100], [ox + 108, oy + 100], [ox + 152, oy + 100]];
      l1.forEach(function (p) { t += L(r[0], r[1], p[0], p[1]); });
      l2.forEach(function (p, j) { var q = l1[j < 2 ? 0 : 1]; t += L(q[0], q[1], p[0], p[1]); });
      if (maxLvl === 1) t += P('M' + (ox + 76.3) + ' ' + (oy + 43.7) + ' Q' + (ox + 90) + ' ' + (oy + 52) + ' ' + (ox + 103.7) + ' ' + (oy + 43.7), 'a b') + T(ox + 90, oy + 62, 'max', { c: 't-a', s: 9 });
      if (maxLvl === 2) l1.forEach(function (q) { t += P('M' + n(q[0] - 7.6) + ' ' + n(q[1] + 11.8) + ' Q' + q[0] + ' ' + (q[1] + 18) + ' ' + n(q[0] + 7.6) + ' ' + n(q[1] + 11.8), 'a b') + T(q[0], q[1] + 28, 'max', { c: 't-a', s: 9 }); });
      function node(p, st) { return st ? C(p[0], p[1], 7) : C(p[0], p[1], 4, 'fi'); }
      t += node(r, stateRoot); l1.forEach(function (p) { t += node(p, !stateRoot); }); l2.forEach(function (p) { t += node(p, stateRoot); });
      return t + T(ox + 8, oy + 12, title, { a: 'start', w: 600 }) + T(ox + 90, oy + 118, sub, { c: 't-m', s: 10 });
    }
    add('backup', 360, 252, 'Backup diagrams. Open circles are states, black dots are actions. Each value looks one step ahead and averages over what can happen next. The optimality versions replace the average over actions with a max, shown by the arc.',
      L(180, 8, 180, 244, 'm t') + L(8, 125, 352, 125, 'm t') +
      tree(0, 0, 'vπ(s)', true, 0, 'average over a and s′') + tree(180, 0, 'v*(s)', true, 1, 'max over a, average s′') +
      tree(0, 128, 'qπ(s, a)', false, 0, 'average over s′ and a′') + tree(180, 128, 'q*(s, a)', false, 2, 'average s′, max over a′'));
  })();

  /* 7. GPI */
  (function () {
    function y1(x) { return 30 + 65 * (x - 30) / 270; }
    function y2(x) { return 160 - 65 * (x - 30) / 270; }
    var g = L(30, 30, 300, 95, '') + L(30, 160, 300, 95, '') + T(30, 18, 'v = vπ  (evaluation finished)', { a: 'start' }) + T(30, 176, 'π = greedy(v)  (improvement finished)', { a: 'start' });
    var xs = [40, 90, 140, 180, 215, 245, 270];
    for (var j = 0; j < xs.length - 1; j++) { var up = j % 2 === 0; g += A(xs[j], up ? y2(xs[j]) : y1(xs[j]), xs[j + 1], up ? y1(xs[j + 1]) : y2(xs[j + 1]), up ? 'a' : 'r'); }
    g += C(300, 95, 4.5, 'fi') + T(309, 95, 'v*, π*', { a: 'start', w: 600 }) + T(30, 196, '↑ evaluate', { a: 'start', c: 't-a', s: 10 }) + T(120, 196, '↓ improve', { a: 'start', c: 't-r', s: 10 });
    add('gpi', 360, 204, 'Generalised policy iteration. Evaluation pulls the value toward the true value of the current policy. Improvement makes the policy greedy with respect to that value. Each step partly undoes the other, yet together they converge to v* and π*. DP, MC, TD and actor-critic all follow this pattern.', g);
  })();

  /* 8. policy iteration vs value iteration */
  add('pivi', 360, 212, 'Policy iteration alternates a full evaluation with a greedy improvement, so it needs few but expensive iterations. Value iteration folds the improvement into every sweep with a max, so each sweep is cheap and you read off the greedy policy at the end.',
    T(10, 12, 'Policy iteration', { a: 'start', w: 600 }) +
    BOX(10, 24, 150, 40, 'evaluate vπ fully\nmany sweeps until Δ < θ', 'bx', { head: 1, sub: 1 }) +
    BOX(200, 24, 150, 40, 'improve\nπ ← greedy(v)', 'bxa', { head: 1, sub: 1 }) + A(160, 44, 200, 44) +
    AQ(275, 64, 180, 100, 85, 64, 'm') + T(180, 98, 'repeat until π stops changing', { c: 't-m', s: 10 }) +
    T(10, 124, 'Value iteration', { a: 'start', w: 600 }) +
    BOX(10, 136, 200, 40, 'one sweep with a max\nv(s) ← maxₐ Σ p (r + γ v(s′))', 'bxa', { head: 1, sub: 1 }) +
    A(210, 156, 246, 156, 'm d') + BOX(246, 136, 104, 40, 'at the end\nπ = greedy(v)', 'bx', { head: 1, sub: 1 }) +
    AQ(150, 176, 110, 206, 70, 176, 'm') + T(160, 200, 'repeat until Δ < θ', { a: 'start', c: 't-m', s: 10 }));

  /* 9. 4x4 gridworld */
  (function () {
    var V = [[0, -14, -20, -22], [-14, -18, -20, -20], [-20, -20, -18, -14], [-22, -20, -14, 0]];
    var dirs = { '0,1': 'l', '0,2': 'l', '0,3': 'ld', '1,0': 'u', '1,1': 'ul', '1,2': 'ld', '1,3': 'd', '2,0': 'u', '2,1': 'ur', '2,2': 'rd', '2,3': 'd', '3,0': 'ur', '3,1': 'r', '3,2': 'r' };
    var g = T(94, 12, 'vπ of the random policy', { w: 600, s: 10 }) + T(266, 12, 'greedy policy from vπ', { w: 600, s: 10 });
    for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {
      var term = (r === 0 && c === 0) || (r === 3 && c === 3), cx = 190 + 38 * c + 19, cy = 24 + 38 * r + 19;
      g += R(18 + 38 * c, 24 + 38 * r, 38, 38, term ? 'bxa' : 'bx', 0) + T(18 + 38 * c + 19, cy, String(V[r][c]).replace('-', '−'));
      g += R(190 + 38 * c, 24 + 38 * r, 38, 38, term ? 'bxa' : 'bx', 0);
      if (term) g += T(cx, cy, 'end', { c: 't-m', s: 9 });
      (dirs[r + ',' + c] || '').split('').forEach(function (d) {
        var dx = d === 'l' ? -1 : d === 'r' ? 1 : 0, dy = d === 'u' ? -1 : d === 'd' ? 1 : 0;
        g += A(cx, cy, cx + dx * 14, cy + dy * 14, 'a');
      });
    }
    g += T(180, 194, 'shaded = terminal, every move costs −1', { c: 't-m', s: 10 });
    add('grid4', 360, 202, 'The 4x4 gridworld. Left, the converged value of the random policy: each number is minus the expected number of steps to reach a corner. Right, acting greedily on those values already gives an optimal policy after one improvement step.', g);
  })();

  /* 10. unified view */
  (function () {
    var u = R(70, 20, 280, 190, 'bxm', 4) + L(210, 20, 210, 210, 'm d') + L(70, 115, 350, 115, 'm d');
    u += L(140, 38, 140, 74) + C(140, 38, 5) + C(140, 56, 3, 'fi') + C(140, 74, 5) + T(140, 96, 'TD(0)', { w: 600 });
    var dp = [258, 280, 302];
    dp.forEach(function (x, j) { u += L(280, 38, x, 56); [x - 6, x + 6].forEach(function (x2) { u += L(x, 56, x2, 74); }); });
    u += C(280, 38, 5); dp.forEach(function (x) { u += C(x, 56, 3, 'fi'); [x - 6, x + 6].forEach(function (x2) { u += C(x2, 74, 4); }); });
    u += T(280, 96, 'DP', { w: 600 });
    u += L(140, 128, 140, 170) + C(140, 128, 4.5) + C(140, 137, 2.5, 'fi') + C(140, 146, 4.5) + C(140, 155, 2.5, 'fi') + C(140, 164, 4.5) + R(136, 170, 8, 8, 'fi', 1) + T(140, 194, 'Monte Carlo', { w: 600 });
    var lv1 = [264, 296], lv2 = [256, 272, 288, 304];
    lv1.forEach(function (x) { u += L(280, 128, x, 142); });
    lv2.forEach(function (x, j) { u += L(lv1[j < 2 ? 0 : 1], 142, x, 156); u += L(x, 156, x - 4, 168) + L(x, 156, x + 4, 168); });
    u += C(280, 128, 4.5); lv1.forEach(function (x) { u += C(x, 142, 2.5, 'fi'); }); lv2.forEach(function (x) { u += C(x, 156, 4) + R(x - 7, 168, 6, 6, 'fi', 1) + R(x + 1, 168, 6, 6, 'fi', 1); });
    u += T(280, 194, 'exhaustive search', { w: 600 });
    u += T(140, 224, 'sample one path', { c: 't-m', s: 10 }) + T(280, 224, 'full expectation', { c: 't-m', s: 10 }) + T(210, 240, 'width of the backup', { c: 't-m', s: 10 });
    u += T(58, 67, 'one step', { c: 't-m', s: 10, tr: 'rotate(-90 58 67)' }) + T(58, 162, 'to the end', { c: 't-m', s: 10, tr: 'rotate(-90 58 162)' }) + T(36, 115, 'depth of the backup', { c: 't-m', s: 10, tr: 'rotate(-90 36 115)' });
    add('unified', 360, 248, 'The unified view. Depth: does the target bootstrap after one step, or wait for the end of the episode? Width: does it sample one next state, or average over all of them using the model? TD is shallow and sampled, MC is deep and sampled, DP is shallow and full width.', u);
  })();

  /* 11. first-visit vs every-visit */
  (function () {
    var xs = [40, 115, 190, 265], lab = ['A', 'B', 'A', 'C'], rw = ['1', '2', '1'], G = ['9', '8', '6', '5'];
    var f = T(10, 12, 'one episode, γ = 1', { a: 'start', c: 't-m', s: 10 });
    for (var j = 0; j < 3; j++) f += A(xs[j] + 16, 50, xs[j + 1] - 16, 50) + T((xs[j] + xs[j + 1]) / 2, 38, 'r = ' + rw[j], { c: 't-m', s: 10 });
    f += A(281, 50, 318, 50) + T(299, 38, 'r = 5', { c: 't-m', s: 10 }) + R(318, 38, 24, 24, 'bxm', 2) + T(330, 50, 'end', { c: 't-m', s: 8 });
    xs.forEach(function (x, j) { f += C(x, 50, 16, j === 0 ? 'bxa' : j === 2 ? 'bxr' : 'bx') + T(x, 50, lab[j], { w: 600 }) + T(x, 80, 'G = ' + G[j]); });
    f += T(40, 98, 'first visit', { c: 't-a', s: 10 }) + T(190, 98, 'second visit', { c: 't-r', s: 10 });
    f += T(180, 126, 'first-visit:  V(A) = 9') + T(180, 144, 'every-visit:  V(A) = (9 + 6) / 2 = 7.5') + T(180, 162, 'both:  V(B) = 8,  V(C) = 5', { c: 't-m' });
    add('fvev', 360, 172, 'One episode visits A twice. Each return is the sum of rewards from that point to the end. First-visit MC only uses the return from the first time A appears. Every-visit MC averages both.', f);
  })();

  /* 12. driving home */
  (function () {
    var pr = [30, 40, 35, 40, 43, 43], stg = ['leave', 'car', 'exit hwy', 'truck', 'street', 'home'];
    function xs(j) { return 50 + 56 * j; }
    function panel(oy, title, mc) {
      function yv(v) { return oy + 82 - (v - 28) * 3.6; }
      var p = T(8, oy + 6, title, { a: 'start', w: 600 }) + L(40, yv(43), 340, yv(43), 'm d') + T(44, yv(43) - 9, 'actual 43', { a: 'start', c: 't-m', s: 9 });
      p += PL(pr.map(function (v, j) { return [xs(j), yv(v)]; }), 'm t');
      for (var j = 0; j < 5; j++) { var tg = mc ? 43 : pr[j + 1]; if (tg !== pr[j]) p += A(xs(j), yv(pr[j]), xs(j), yv(tg), 'a b'); }
      pr.forEach(function (v, j) { p += C(xs(j), yv(v), 3.5, 'fi') + (j < 4 ? T(xs(j) - 7, yv(v) + 6, String(v), { a: 'end', c: 't-m', s: 9 }) : ''); });
      return p;
    }
    var d = panel(8, 'MC: every guess moves toward the final 43', true) + panel(110, 'TD: each guess moves toward the next guess', false);
    stg.forEach(function (t, j) { d += T(xs(j), 206, t, { c: 't-m', s: 9 }); });
    add('drive', 360, 214, 'Driving home. Each dot is your predicted total travel time at that point of the trip. Monte Carlo has to wait until you are home, then pulls every guess toward the real 43 minutes. TD updates each guess right away toward the next guess.', d);
  })();

  /* 13. AB example */
  add('ab', 360, 154, 'The AB example, eight episodes. Both methods agree that B is worth 0.75. MC gives A a value of 0 because its only return was 0. TD says A always leads to B, so A is worth what B is worth. TD fits the Markov model behind the data, which is called certainty equivalence.',
    A(76, 60, 164, 60) + T(120, 48, 'r = 0', { c: 't-m', s: 10 }) + T(120, 72, 'seen once', { c: 't-m', s: 9 }) +
    A(195, 53, 290, 32) + R(290, 22, 20, 20, 'bxm', 2) + T(238, 22, 'r = 1, 6 times', { c: 't-a', s: 10 }) +
    A(195, 67, 290, 88) + R(290, 78, 20, 20, 'bxm', 2) + T(238, 100, 'r = 0, 2 times', { c: 't-r', s: 10 }) +
    C(60, 60, 16) + T(60, 60, 'A', { w: 600 }) + C(180, 60, 16) + T(180, 60, 'B', { w: 600 }) + T(150, 96, 'V(B) = 0.75', { w: 600, s: 10 }) +
    BOX(5, 112, 170, 36, 'MC: V(A) = 0\nonly return seen from A', 'bxr', { head: 1, sub: 1 }) +
    BOX(185, 112, 170, 36, 'TD: V(A) = V(B) = 0.75\nA always led to B', 'bxa', { head: 1, sub: 1 }));

  /* 14. SARSA vs Q-learning backups */
  s = T(90, 12, 'SARSA, on-policy', { w: 600 }) + T(270, 12, 'Q-learning, off-policy', { w: 600 }) + L(180, 22, 180, 164, 'm t');
  s += L(90, 32, 90, 70) + L(90, 70, 90, 108) + C(90, 32, 4, 'fi') + C(90, 70, 8) + C(90, 108, 4, 'fi') +
    T(100, 32, 'S, A', { a: 'start', s: 10 }) + T(102, 70, 'R, S′', { a: 'start', s: 10 }) + T(100, 108, 'A′ taken', { a: 'start', s: 10, c: 't-a' });
  s += L(270, 32, 270, 70) + L(270, 70, 240, 108) + L(270, 70, 270, 108) + L(270, 70, 300, 108) +
    P('M261.3 81 Q270 88 278.7 81', 'a b') + C(270, 32, 4, 'fi') + C(270, 70, 8) + C(240, 108, 4, 'fi') + C(270, 108, 4, 'fi') + C(300, 108, 4, 'fi') +
    T(280, 32, 'S, A', { a: 'start', s: 10 }) + T(282, 66, 'R, S′', { a: 'start', s: 10 }) + T(270, 124, 'best a′', { c: 't-a', s: 10 });
  s += T(90, 144, 'R + γ Q(S′, A′)', { s: 10 }) + T(270, 144, 'R + γ maxₐ Q(S′, a)', { s: 10 }) + T(90, 158, 'learns the ε-greedy π', { c: 't-m', s: 9 }) + T(270, 158, 'learns the greedy π', { c: 't-m', s: 9 });
  add('sarsaq', 360, 166, 'Same transition, different target. SARSA backs up the value of the next action it actually took, so it learns about the ε-greedy policy it follows. Q-learning backs up the best next action, so it learns about the greedy policy no matter how it behaves.', s);

  /* 15. cliff walking */
  s = '';
  for (var r = 0; r < 4; r++) for (var c = 0; c < 12; c++) s += R(24 + 26 * c, 16 + 26 * r, 26, 26, (r === 3 && c > 0 && c < 11) ? 'bxr' : (r === 3) ? 'bxa' : 'bxm', 0);
  s += T(37, 107, 'S', { w: 600 }) + T(323, 107, 'G', { w: 600 }) + T(180, 107, 'cliff, −100', { c: 't-r', w: 600 }) +
    APL([[41, 99], [41, 81], [319, 81], [319, 99]], 'r b') + APL([[33, 99], [33, 29], [327, 29], [327, 99]], 'a b') +
    L(24, 136, 44, 136, 'r b') + T(50, 136, 'Q-learning: optimal path along the edge', { a: 'start', s: 10 }) +
    L(24, 152, 44, 152, 'a b') + T(50, 152, 'SARSA: safer path, away from the edge', { a: 'start', s: 10 });
  add('cliff', 360, 160, 'Cliff walking. Q-learning learns the shortest path along the edge because its target assumes greedy behaviour. It still explores with ε-greedy though, so it sometimes falls and earns less reward during training. SARSA accounts for its own exploration and learns the safer path.', s);

  /* 16. maximisation bias */
  (function () {
    function xv(v) { return 180 + 150 * v; }
    var m = T(10, 14, '6 actions, all truly worth 0, estimates are noisy', { a: 'start', c: 't-m', s: 10 }) + L(30, 60, 330, 60, 'm') + L(180, 50, 180, 70) + T(180, 84, 'true value 0', { c: 't-m', s: 10 });
    [-0.6, -0.3, -0.1, 0.15, 0.35].forEach(function (v) { m += C(xv(v), 60, 4, 'fi'); });
    m += C(xv(.55), 60, 5.5, 'fr') + T(xv(.55), 40, 'max of Q₁ = +0.55', { c: 't-r' }) +
      AQ(xv(.55), 68, 240, 104, xv(-.05) + 7, 108, 'a') + C(xv(-.05), 108, 5.5, 'fa') + T(180, 128, 'Double Q: pick with Q₁, score with Q₂ ≈ 0', { c: 't-a' });
    add('maxbias', 360, 138, 'Maximisation bias. If every action is truly worth 0 but the estimates are noisy, the max of the estimates is almost always above 0. Q-learning bootstraps on that max, so it overestimates. Double Q-learning picks the action with one estimate and scores it with an independent one, which removes the bias.', m);
  })();

  /* 17. on-policy vs off-policy */
  add('onoff', 360, 186, 'On-policy methods learn about the policy they are running. Off-policy methods run an exploratory behaviour policy b but learn about a different target policy π. In Q-learning the target π is hidden inside the max: it is the greedy policy.',
    T(10, 12, 'On-policy: SARSA, MC control', { a: 'start', w: 600 }) +
    BOX(10, 24, 100, 34, 'π, ε-greedy', 'bxa') + A(110, 41, 150, 41) + T(130, 32, 'acts', { c: 't-m', s: 9 }) +
    BOX(150, 24, 90, 34, 'environment', 'bxm') + A(240, 41, 270, 41) + T(255, 32, 'data', { c: 't-m', s: 9 }) + BOX(270, 24, 80, 34, 'update π') +
    AQ(310, 58, 180, 92, 60, 58, 'a') + T(180, 88, 'learns about the same π it follows', { c: 't-a', s: 10 }) +
    T(10, 112, 'Off-policy: Q-learning, off-policy MC', { a: 'start', w: 600 }) +
    BOX(10, 124, 100, 34, 'b, behaviour\nexplores freely', 'bxr', { head: 1, sub: 1, lh: 13 }) + A(110, 141, 150, 141) + T(130, 132, 'acts', { c: 't-m', s: 9 }) +
    BOX(150, 124, 90, 34, 'environment', 'bxm') + A(240, 141, 270, 141) + T(255, 132, 'data', { c: 't-m', s: 9 }) +
    BOX(270, 124, 80, 34, 'π, target\ngreedy', 'bxa', { head: 1, sub: 1, lh: 13 }) +
    T(180, 176, 'b generates the data, π is what gets learned', { c: 't-m', s: 10 }));

  /* 18. bias variance dartboards */
  (function () {
    function board(cx, cy) { return C(cx, cy, 55, 'bxm') + C(cx, cy, 37, 'bxm') + C(cx, cy, 19, 'bxm') + C(cx, cy, 3, 'fm'); }
    var d = T(180, 12, 'centre = true vπ(s), dots = update targets', { c: 't-m', s: 10 }) + board(90, 80) + board(270, 80);
    [[-30, -22], [25, -35], [38, 18], [-15, 40], [-42, 10], [10, 28], [30, -8], [-8, -40]].forEach(function (p) { d += C(90 + p[0], 80 + p[1], 3.5, 'fr'); });
    [[16, -12], [21, -16], [14, -17], [20, -10], [24, -13], [17, -19], [13, -11]].forEach(function (p) { d += C(270 + p[0], 80 + p[1], 3.5, 'fa'); });
    d += T(90, 150, 'MC: unbiased, high variance', { w: 600, s: 10 }) + T(90, 164, 'full noisy return', { c: 't-m', s: 10 }) + T(270, 150, 'TD: biased, low variance', { w: 600, s: 10 }) + T(270, 164, 'bootstraps on current V', { c: 't-m', s: 10 });
    add('dart', 360, 172, 'Bias versus variance. MC targets are real returns, so they are right on average but spread widely, because a whole episode of random steps adds noise. TD targets lean on the current estimate, so they can sit off-centre at first but vary much less.', d);
  })();

  /* 19. return spectrum */
  s = L(40, 22, 320, 22, 'a d') + L(40, 17, 40, 27, 'a') + L(320, 17, 320, 27, 'a') + T(180, 10, 'TD(λ) blends them: λ = 0 is TD(0), λ = 1 is MC', { c: 't-a', s: 10 }) + L(40, 55, 320, 55, 'm');
  [[40, 'n = 1'], [95, 'n = 2'], [150, 'n = 3'], [320, 'n = ∞']].forEach(function (t) { s += L(t[0], 49, t[0], 61) + T(t[0], 41, t[1], { s: 10 }); });
  s += T(235, 41, '…', { s: 10 }) + T(40, 72, 'TD(0)', { w: 600 }) + T(150, 72, 'n-step TD', { w: 600 }) + T(320, 72, 'MC', { w: 600 }) +
    T(40, 88, 'R + γV(S′)', { c: 't-m', s: 9 }) + T(150, 88, 'R + … + γⁿV', { c: 't-m', s: 9 }) + T(320, 88, 'full Gₜ', { c: 't-m', s: 9 }) +
    T(20, 106, 'more bias, less variance', { a: 'start', c: 't-a', s: 10 }) + T(340, 106, 'no bias, more variance', { a: 'end', c: 't-r', s: 10 });
  add('spectrum', 360, 114, 'One family of targets. TD(0) looks one step ahead and then bootstraps, n-step methods look further, and Monte Carlo waits for the full return. Moving right trades bias for variance. TD(λ) and GAE average across the whole range with weight λ.', s);

  /* 20. table vs function */
  (function () {
    var rows = [['size', 'price'], ['60 m²', '450k'], ['80 m²', '600k'], ['120 m²', '850k'], ['95 m²', '?']];
    var h = '';
    rows.forEach(function (rw, j) { var y = 16 + 22 * j, cl = j === 0 ? 'bxm' : j === 4 ? 'bxr' : 'bx', o = j === 0 ? { w: 600 } : {}; h += R(10, y, 75, 22, cl, 0) + R(85, y, 75, 22, cl, 0) + T(47.5, y + 11, rw[0], o) + T(122.5, y + 11, rw[1], o); });
    h += T(85, 142, 'table: one entry per state', { c: 't-m', s: 10 }) + T(85, 156, 'unseen state: no answer', { c: 't-r', s: 10 });
    h += L(200, 110, 350, 110, 'm') + L(200, 110, 200, 16, 'm') + T(204, 10, 'price', { a: 'start', c: 't-m', s: 9 }) + T(345, 120, 'size', { a: 'end', c: 't-m', s: 9 });
    h += L(207.5, 106.4, 342.5, 22.1, 'a b');
    [[60, 450], [80, 600], [100, 700], [120, 850], [140, 950]].forEach(function (p) { h += C(200 + (p[0] - 50) * 1.5, 110 - (p[1] - 400) * .15, 3.5, 'fi'); });
    h += L(267.5, 110, 267.5, 68.9, 'r d') + L(200, 68.9, 267.5, 68.9, 'r d') + C(267.5, 68.9, 5, 'fr');
    h += T(275, 142, 'function: a line v̂(s, w)', { c: 't-m', s: 10 }) + T(275, 156, '95 m² → about 675k', { c: 't-a', s: 10 });
    add('houseprice', 360, 164, 'Why function approximation. A table only knows states it has seen, so a new state gets nothing. A function with a few weights generalises: nearby states get similar values, and you can query states you have never visited. In RL the inputs are state features and the output is a value.', h);
  })();

  /* 21. three VFA architectures */
  add('vfa3', 360, 150, 'Three ways to set up the approximator. Feed in a state to get its value. Feed in a state and an action to get one Q value. Or feed in a state and get a Q value for every action at once, which is what DQN does, because one forward pass then gives the argmax.',
    T(60, 22, 's') + A(60, 30, 60, 48) + BOX(25, 48, 70, 32, 'w', 'bxa') + A(60, 80, 60, 98) + T(60, 108, 'v̂(s, w)') +
    T(160, 22, 's') + T(200, 22, 'a') + A(160, 30, 170, 48) + A(200, 30, 190, 48) + BOX(145, 48, 70, 32, 'w', 'bxa') + A(180, 80, 180, 98) + T(180, 108, 'q̂(s, a, w)') +
    T(300, 22, 's') + A(300, 30, 300, 48) + BOX(265, 48, 70, 32, 'w', 'bxa') + A(285, 80, 270, 98) + A(300, 80, 300, 98) + A(315, 80, 330, 98) + T(270, 108, 'q̂₁') + T(300, 108, '…') + T(330, 108, 'q̂ₘ') +
    L(120, 14, 120, 144, 'm t') + L(240, 14, 240, 144, 'm t') +
    T(60, 130, 'prediction', { c: 't-m', s: 10 }) + T(180, 130, 'control,', { c: 't-m', s: 10 }) + T(180, 143, 'any action space', { c: 't-m', s: 10 }) + T(300, 130, 'control, discrete', { c: 't-m', s: 10 }) + T(300, 143, 'actions (DQN)', { c: 't-m', s: 10 }));

  /* 22. tile coding */
  (function () {
    var t = R(15, 20, 150, 130, 'bxm', 0), offs = [0, 13, 26], fl = ['a', 'r', 'm d'];
    t += R(95, 60, 40, 40, 'fa', 0, ' opacity=".22"') + R(68, 73, 40, 40, 'fr', 0, ' opacity=".22"') + R(81, 46, 40, 40, 'fm', 0, ' opacity=".25"');
    offs.forEach(function (o, j) {
      for (var x = 15 + o; x < 165; x += 40) if (x > 15) t += L(x, 20, x, 150, fl[j] + ' t');
      for (var y = 20 + o; y < 150; y += 40) if (y > 20) t += L(15, y, 165, y, fl[j] + ' t');
    });
    t += C(100, 82, 4, 'fi') + T(92, 90, 's', { a: 'end', w: 600 }) + T(90, 162, 'position →', { c: 't-m', s: 9 }) + T(8, 85, 'velocity →', { c: 't-m', s: 9, tr: 'rotate(-90 8 85)' });
    t += L(180, 30, 200, 30, 'a b') + T(206, 30, 'tiling 1', { a: 'start', s: 10 }) + L(180, 46, 200, 46, 'r b') + T(206, 46, 'tiling 2', { a: 'start', s: 10 }) + L(180, 62, 200, 62, 'm d b') + T(206, 62, 'tiling 3, each offset', { a: 'start', s: 10 }) +
      T(180, 88, 's lands in 1 tile per', { a: 'start', s: 10 }) + T(180, 102, 'tiling: 3 features on', { a: 'start', s: 10 }) +
      T(180, 122, 'nearby states share', { a: 'start', s: 10, c: 't-m' }) + T(180, 136, 'tiles, so they generalise', { a: 'start', s: 10, c: 't-m' });
    add('tile', 360, 168, 'Tile coding with three offset tilings over a two-dimensional state such as position and velocity. The state switches on exactly one tile in each tiling, so the feature vector is mostly zeros with three ones. The offsets give fine resolution while the linear updates stay cheap.', t);
  })();

  /* 23. coarse coding */
  (function () {
    var cs = [[50, 50], [95, 45], [140, 55], [70, 95], [115, 100], [160, 100]];
    var c = R(10, 10, 190, 130, 'bxm', 0);
    cs.forEach(function (p, j) { if (j === 1 || j === 4) c += C(p[0], p[1], 34, 'fa', ' opacity=".16"'); if (j === 2) c += C(p[0], p[1], 34, 'fr', ' opacity=".14"'); });
    cs.forEach(function (p) { c += C(p[0], p[1], 34, 'ol'); });
    c += C(100, 72, 4, 'fi') + T(92, 66, 's', { a: 'end', w: 600 }) + C(128, 80, 4, 'fr') + T(136, 84, 's′', { a: 'start', c: 't-r', w: 600 });
    c += T(212, 24, 'each circle is one', { a: 'start', s: 10 }) + T(212, 38, '0/1 feature', { a: 'start', s: 10 }) + T(212, 60, 's switches on 2', { a: 'start', s: 10, c: 't-a' }) + T(212, 74, 's′ shares 1 with s', { a: 'start', s: 10, c: 't-r' }) + T(212, 96, 'bigger circles:', { a: 'start', s: 10, c: 't-m' }) + T(212, 110, 'broader generalisation', { a: 'start', s: 10, c: 't-m' });
    add('coarse', 360, 150, 'Coarse coding. Each circle is a binary feature that is on when the state falls inside it. States that share circles share weights, so learning about one moves the other. Circle size sets how far generalisation reaches.', c);
  })();

  /* 24. RBF */
  (function () {
    var sub = ['₁', '₂', '₃', '₄', '₅'];
    var b = L(20, 110, 350, 110, 'm') + T(180, 14, 'φᵢ(s) = exp(−‖s − cᵢ‖² / 2σ²)');
    [70, 130, 190, 250, 310].forEach(function (c, j) {
      var pts = []; for (var x = 20; x <= 350; x += 5) pts.push([x, 110 - 70 * Math.exp(-((x - c) * (x - c)) / 1250)]);
      b += PL(pts, j === 1 || j === 2 ? 'a b' : 'm') + T(c, 122, 'c' + sub[j], { c: 't-m', s: 9 });
    });
    b += L(150, 30, 150, 110, 'r d') + C(150, 59.2, 4, 'fa') + C(150, 90.5, 4, 'fa') + T(156, 54, '0.73', { a: 'start', s: 9 }) + T(156, 86, '0.28', { a: 'start', s: 9 }) + T(150, 122, 's', { c: 't-r', w: 600 }) +
      T(180, 140, 'graded, not 0/1: closer centre, bigger feature', { c: 't-m', s: 10 });
    add('rbf', 360, 150, 'Radial basis functions. Each feature is a bump centred somewhere in state space. A state turns on nearby bumps strongly and distant ones barely, which gives a smooth, graded feature vector instead of the 0 or 1 features of tile coding.', b);
  })();

  /* 25. deadly triad */
  add('triad', 360, 196, 'The deadly triad. Combining function approximation, bootstrapping and off-policy training can make values blow up. Any two are fine: drop bootstrapping and use MC, train on-policy, or go back to a table. DQN keeps all three, so it leans on replay and a target network to stay stable.',
    L(180, 28, 65, 154, 'r b') + L(180, 28, 290, 154, 'r b') + L(65, 154, 290, 154, 'r b') +
    BOX(95, 10, 170, 36, 'function approximation\nlinear or neural net', 'bxr', { head: 1, sub: 1, lh: 13 }) +
    BOX(10, 136, 110, 36, 'bootstrapping\nTD, DP targets', 'bxr', { head: 1, sub: 1, lh: 13 }) +
    BOX(230, 136, 120, 36, 'off-policy\nQ-learning, replay', 'bxr', { head: 1, sub: 1, lh: 13 }) +
    T(180, 112, 'all three together', { w: 600 }) + T(180, 128, 'can diverge', { c: 't-r', w: 600 }) +
    T(180, 188, 'remove any one and it is stable again', { c: 't-m', s: 10 }));

  /* 26. convolution */
  (function () {
    var IN = [[1, 0, 1, 0, 1], [0, 1, 1, 0, 0], [1, 0, 1, 1, 0], [0, 0, 1, 0, 1], [1, 1, 0, 1, 0]], F = [[1, 0, 1], [0, 1, 0], [1, 0, 1]];
    var c = T(65, 14, 'input 5×5', { w: 600 }) + T(183, 36, 'filter 3×3', { w: 600 }) + T(293, 36, 'output 3×3', { w: 600 });
    var r, q, a, b2;
    for (r = 0; r < 5; r++) for (q = 0; q < 5; q++) c += R(10 + 22 * q, 26 + 22 * r, 22, 22, 'bx', 0) + T(21 + 22 * q, 37 + 22 * r, String(IN[r][q]));
    c += R(10, 26, 66, 66, 'win', 0);
    for (r = 0; r < 3; r++) for (q = 0; q < 3; q++) c += R(150 + 22 * q, 48 + 22 * r, 22, 22, 'bxm', 0) + T(161 + 22 * q, 59 + 22 * r, String(F[r][q]));
    for (r = 0; r < 3; r++) for (q = 0; q < 3; q++) {
      var sum = 0; for (a = 0; a < 3; a++) for (b2 = 0; b2 < 3; b2++) sum += IN[r + a][q + b2] * F[a][b2];
      c += R(260 + 22 * q, 48 + 22 * r, 22, 22, 'bx', 0) + T(271 + 22 * q, 59 + 22 * r, String(sum));
    }
    c += R(260, 48, 22, 22, 'win', 0) + T(133, 81, '*', { s: 18 }) + T(238, 81, '=', { s: 16 });
    c += T(180, 148, 'out = (n + 2p − f) / s + 1 = (5 − 3) / 1 + 1 = 3', { s: 10 }) + T(180, 164, 'highlighted: multiply overlapping cells, add them up', { c: 't-m', s: 10 });
    add('conv', 360, 172, 'Convolution. The 3x3 filter slides over the 5x5 input one cell at a time. At each position you multiply the overlapping numbers and add them up, giving one output number. With no padding and stride 1, the output is (5 − 3)/1 + 1 = 3 wide.', c);
  })();

  /* 27. pooling */
  (function () {
    var PI = [[7, 8, 2, 4], [1, 5, 6, 1], [3, 0, 9, 2], [4, 2, 1, 1]], MX = [['8', '6'], ['4', '9']], AV = [['5.25', '3.25'], ['2.25', '3.25']];
    var p = T(58, 14, 'input 4×4', { w: 600 }) + T(188, 34, 'max pool', { w: 600 }) + T(294, 34, 'average pool', { w: 600 }), r, q;
    for (r = 0; r < 4; r++) for (q = 0; q < 4; q++) p += R(10 + 24 * q, 26 + 24 * r, 24, 24, 'bx', 0) + T(22 + 24 * q, 38 + 24 * r, String(PI[r][q]));
    p += L(58, 26, 58, 122, 'b') + L(10, 74, 106, 74, 'b') + R(10, 26, 48, 48, 'win', 0);
    for (r = 0; r < 2; r++) for (q = 0; q < 2; q++) { p += R(160 + 28 * q, 46 + 28 * r, 28, 28, 'bx', 0) + T(174 + 28 * q, 60 + 28 * r, MX[r][q]) + R(266 + 28 * q, 46 + 28 * r, 28, 28, 'bx', 0) + T(280 + 28 * q, 60 + 28 * r, AV[r][q], { s: 9 }); }
    p += R(160, 46, 28, 28, 'win', 0) + R(266, 46, 28, 28, 'win', 0) + A(112, 74, 154, 74, 'm') + T(133, 64, '2×2', { c: 't-m', s: 9 });
    p += T(180, 140, 'window (7, 8, 1, 5): max = 8, average = 5.25', { s: 10 }) + T(180, 154, 'halves width and height, nothing to learn', { c: 't-m', s: 10 });
    add('pool', 360, 162, 'Pooling with a 2x2 window and stride 2. Max pooling keeps the strongest response in each window, average pooling keeps the mean. Both halve the map in each direction and have no parameters.', p);
  })();

  /* 28. DQN architecture */
  (function () {
    var d = '', j;
    for (j = 3; j >= 0; j--) d += R(10 + 4 * j, 34 - 4 * j, 46, 46, 'bx', 2);
    for (j = 2; j >= 0; j--) d += R(88 + 4 * j, 40 - 4 * j, 36, 36, 'bxa', 2);
    for (j = 2; j >= 0; j--) d += R(152 + 3 * j, 46 - 3 * j, 26, 26, 'bxa', 2);
    d += R(206, 20, 16, 80, 'bxa', 2);
    for (j = 0; j < 6; j++) d += R(248, 24 + 12 * j, 16, 10, j === 2 ? 'bxr' : 'bx', 1);
    d += A(70, 57, 86, 57, 'm') + A(134, 58, 150, 58, 'm') + A(186, 59, 204, 59, 'm') + A(224, 60, 246, 60, 'm') + A(268, 53, 286, 53, 'r') + T(290, 47, 'argmax', { a: 'start', s: 10 }) + T(290, 61, '= action', { a: 'start', s: 10 });
    [[39, 'input', '84×84×4', '4 frames'], [110, 'conv1', '8×8, s4', '20×20×16'], [168, 'conv2', '4×4, s2', '9×9×32'], [214, 'fc', '256', ''], [256, 'Q(s, ·)', 'per', 'action']].forEach(function (t) {
      d += T(t[0], 118, t[1], { s: 9, w: 600 }) + T(t[0], 131, t[2], { s: 9, c: 't-m' }) + (t[3] ? T(t[0], 144, t[3], { s: 9, c: 't-m' }) : '');
    });
    add('dqnarch', 360, 152, 'The DQN network from the Atari paper as given in the notes. Four stacked 84x84 frames go through two convolution layers and one fully connected layer, ending in one Q value per joystick action. One forward pass scores every action, and the agent takes the argmax.', d);
  })();

  /* 29. DQN loop */
  add('dqnloop', 360, 162, 'The DQN training loop. Experience goes into a replay buffer, and random minibatches break the correlation between consecutive frames. Targets come from a frozen copy of the network that is refreshed every C steps, so the target does not move with every gradient step.',
    BOX(10, 24, 80, 34, 'environment', 'bxm') + BOX(140, 24, 100, 34, 'online net\nQ(s, a; w)', 'bxa', { head: 1, sub: 1, lh: 13 }) + BOX(262, 24, 88, 34, 'target net\nQ(s, a; w⁻)', 'bx', { head: 1, sub: 1, lh: 13 }) +
    BOX(10, 120, 110, 34, 'replay buffer D\nsample at random', 'bx', { head: 1, sub: 1, lh: 13 }) + BOX(160, 120, 190, 34, 'loss (y − Q(s, a; w))²\ny = r + γ maxₐ′ Q(s′, a′; w⁻)', 'bxr', { sub: 1, lh: 13 }) +
    A(140, 41, 90, 41) + T(115, 33, 'acts', { c: 't-m', s: 9 }) +
    A(50, 58, 50, 120) + T(56, 90, 'store (s, a, r, s′)', { a: 'start', c: 't-m', s: 9 }) +
    A(120, 137, 160, 137) + T(140, 128, 'batch', { c: 't-m', s: 9 }) +
    A(306, 58, 306, 120) + T(300, 90, 'targets', { a: 'end', c: 't-m', s: 9 }) +
    A(215, 120, 195, 58, 'a b') + T(212, 98, 'update w', { a: 'start', c: 't-a', s: 9 }) +
    A(240, 41, 262, 41, 'm d') + T(251, 14, 'copy w → w⁻ every C steps', { c: 't-m', s: 9 }));

  /* 30. softmax policy push */
  (function () {
    var b = [.33, .33, .34], a2 = [.30, .48, .22], p = T(180, 14, 'θ ← θ + α · A · ∇θ log π(a | s)');
    p += L(30, 120, 160, 120, 'm') + L(200, 120, 330, 120, 'm');
    b.forEach(function (v, j) { var x = 40 + 42 * j, h = v * 150; p += R(x, 120 - h, 30, h, 'bxm', 2) + T(x + 15, 112 - h, v.toFixed(2), { s: 9, c: 't-m' }) + T(x + 15, 130, 'a' + (j + 1), { s: 10 }); });
    a2.forEach(function (v, j) { var x = 210 + 42 * j, h = v * 150; p += R(x, 120 - h, 30, h, j === 1 ? 'bxa' : j === 2 ? 'bxr' : 'bxm', 2) + T(x + 15, 112 - h, v.toFixed(2), { s: 9, c: 't-m' }) + T(x + 15, 130, 'a' + (j + 1), { s: 10 }); });
    p += T(267, 30, 'A > 0 ↑', { c: 't-a', s: 10, w: 600 }) + T(309, 66, 'A < 0 ↓', { c: 't-r', s: 10, w: 600 }) + A(166, 80, 196, 80, 'm') +
      T(95, 146, 'before', { c: 't-m', s: 10 }) + T(265, 146, 'after one update', { c: 't-m', s: 10 });
    add('softmaxpush', 360, 154, 'A policy gradient step on a softmax policy. Actions with positive advantage gain probability, actions with negative advantage lose it, and the probabilities still sum to 1. The size of the push is proportional to the advantage and the step size.', p);
  })();

  /* 31. baseline */
  (function () {
    var G = [8, 10, 12, 14], p = T(90, 14, 'raw returns Gₜ', { w: 600 }) + T(270, 14, 'Gₜ − b, with b = 11', { w: 600 });
    p += L(20, 130, 160, 130, 'm');
    G.forEach(function (g, j) { var x = 30 + 32 * j, h = g * 6; p += R(x, 130 - h, 24, h, 'bxa', 2) + T(x + 12, 122 - h, String(g), { s: 9 }); });
    p += L(20, 64, 160, 64, 'r d') + T(20, 56, 'b = 11', { a: 'start', c: 't-r', s: 9 });
    p += L(200, 90, 340, 90, 'm');
    G.forEach(function (g, j) {
      var x = 210 + 32 * j, v = g - 11, h = Math.abs(v) * 8;
      p += R(x, v > 0 ? 90 - h : 90, 24, h, v > 0 ? 'bxa' : 'bxr', 2) + T(x + 12, v > 0 ? 82 - h : 98 + h, (v > 0 ? '+' : '−') + Math.abs(v), { s: 9, c: v > 0 ? 't-a' : 't-r' });
    });
    p += T(90, 150, 'all pushed up,', { c: 't-m', s: 10 }) + T(90, 164, 'by different amounts', { c: 't-m', s: 10 }) + T(270, 150, 'worse than average pushed down,', { c: 't-m', s: 10 }) + T(270, 164, 'same expected gradient', { c: 't-m', s: 10 });
    add('baseline', 360, 172, 'Why a baseline helps. All four returns are positive, so plain REINFORCE pushes every sampled action up and relies on different push sizes to sort them out. Subtracting a baseline of 11 centres them: better than average goes up, worse goes down. Same expected gradient, much less variance.', p);
  })();

  /* 32. aliased gridworld */
  (function () {
    var a = '';
    for (var c2 = 0; c2 < 5; c2++) a += R(55 + 50 * c2, 30, 50, 40, (c2 === 1 || c2 === 3) ? 'bxr' : 'bx', 0);
    a += R(55, 70, 50, 40, 'bxm', 0) + T(80, 90, 'trap', { c: 't-r' }) + R(155, 70, 50, 40, 'bxa', 0) + T(180, 90, 'goal', { w: 600 }) + R(255, 70, 50, 40, 'bxm', 0) + T(280, 90, 'trap', { c: 't-r' });
    a += T(130, 50, '← →', { c: 't-a', w: 600 }) + T(230, 50, '← →', { c: 't-a', w: 600 });
    a += P('M84 30 Q105 10 126 30', 'r') + head(126, 30, Math.atan2(20, 21), 'r') + head(84, 30, Math.atan2(20, -21), 'r') + T(150, 16, 'deterministic: can loop forever', { a: 'start', c: 't-r', s: 10 });
    a += T(180, 128, 'shaded cells look identical to the agent', { c: 't-m', s: 10 }) + T(180, 142, 'stochastic 50/50 reaches the goal in a few steps', { c: 't-a', s: 10 });
    add('alias', 360, 150, 'Aliased gridworld. The two shaded cells look identical to the agent, so a deterministic policy must do the same thing in both. One of them then always sends the agent the wrong way, and it can loop forever. A stochastic policy that goes left or right 50/50 reaches the goal quickly. This is why policy-based methods can beat value-based ones under partial observability.', a);
  })();

  /* 33. actor-critic */
  add('actorcritic', 360, 178, 'Actor-critic. The actor is the policy, the critic is a value function. After each step the critic computes the TD error δ, a one-sample estimate of the advantage. The actor moves toward actions with positive δ, and the critic moves its estimate toward the TD target.',
    BOX(20, 30, 130, 40, 'actor\nπ(a | s, θ)', 'bxa', { head: 1, sub: 1 }) + BOX(210, 30, 130, 40, 'critic\nv̂(s, w)', 'bx', { head: 1, sub: 1 }) + BOX(115, 118, 130, 34, 'environment', 'bxm') +
    A(80, 70, 140, 118) + T(98, 100, 'a', { a: 'end' }) + A(220, 118, 270, 70) + T(252, 100, 'r, s′', { a: 'start' }) +
    A(210, 50, 150, 50, 'a b') + T(180, 40, 'δ', { c: 't-a', w: 600 }) + T(180, 14, 'δ = r + γ v̂(s′) − v̂(s)', { c: 't-a' }) +
    T(180, 170, 'actor: θ += α δ ∇log π    critic: w += β δ ∇v̂', { c: 't-m', s: 10 }));

  /* 34. PPO clip */
  add('ppoclip', 360, 164, 'The PPO clipped objective, plotted against the ratio r between the new and old policy for one action. For a good action the objective stops growing once r passes 1 + ε, and for a bad action it stops once r drops below 1 − ε. There is nothing to gain from moving the policy further, so updates stay small.',
    T(95, 12, 'A > 0: good action', { w: 600 }) + T(275, 12, 'A < 0: bad action', { w: 600 }) +
    L(30, 120, 170, 120, 'm') + L(30, 22, 30, 120, 'm') + L(110, 24, 110, 120, 'm d t') + L(126, 24, 126, 120, 'm d t') + T(110, 132, '1', { c: 't-m', s: 10 }) + T(128, 132, '1+ε', { c: 't-m', s: 10 }) + T(170, 132, 'r', { a: 'end', c: 't-m', s: 10 }) +
    L(126, 36, 150, 15, 'm d') + PL([[30, 120], [126, 36], [158, 36]], 'a b') +
    L(210, 30, 350, 30, 'm') + L(210, 22, 210, 126, 'm') + L(274, 30, 274, 126, 'm d t') + L(290, 30, 290, 126, 'm d t') + T(272, 138, '1−ε', { c: 't-m', s: 10 }) + T(292, 138, '1', { c: 't-m', s: 10 }) + T(350, 42, 'r', { a: 'end', c: 't-m', s: 10 }) +
    L(210, 30, 274, 66, 'm d') + PL([[210, 66], [274, 66], [338, 102]], 'r b') +
    T(100, 154, 'no extra gain past 1 + ε', { c: 't-m', s: 10 }) + T(280, 154, 'no extra gain below 1 − ε', { c: 't-m', s: 10 }));

  /* 35. TRPO trust region */
  add('trpo', 360, 156, 'TRPO takes the step that improves the surrogate objective most while staying inside a trust region, measured by the KL divergence between the old and new policy. A raw gradient step can be far too big in policy space and collapse performance. PPO approximates the same idea with clipping.',
    C(120, 80, 55, 'bxa dash') + C(120, 80, 4, 'fi') + T(112, 92, 'old θ', { a: 'end', s: 10 }) +
    A(124, 79, 250, 30, 'r d') + A(124, 79, 171, 60, 'a b') + T(178, 72, 'safe step', { a: 'start', c: 't-a', s: 10 }) +
    T(256, 30, 'raw step', { a: 'start', c: 't-r', s: 10 }) + T(256, 44, 'can overshoot', { a: 'start', c: 't-r', s: 10 }) +
    T(120, 148, 'trust region: KL ≤ δ', { c: 't-a', s: 10 }) +
    T(215, 96, 'TRPO: improve surrogate', { a: 'start', s: 10 }) + T(215, 110, 'subject to KL ≤ δ', { a: 'start', s: 10 }) + T(215, 128, 'PPO: clip the ratio', { a: 'start', s: 10, c: 't-m' }) + T(215, 142, 'instead of the KL', { a: 'start', s: 10, c: 't-m' }));

  /* 36. Gaussian policy */
  (function () {
    function curve(c) { var pts = []; for (var x = 20; x <= 340; x += 4) pts.push([x, 118 - 70 * Math.exp(-((x - c) * (x - c)) / (2 * 34 * 34))]); return pts; }
    add('gaussian', 360, 156, 'A Gaussian policy for continuous actions. The network outputs the mean, and actions are sampled around it. When a sampled action has positive advantage, the score (a − μ)/σ² points toward it, so the mean shifts toward that action.',
      L(20, 118, 340, 118, 'm') + PL(curve(140), 'm d') + PL(curve(185), 'a b') +
      T(10, 14, 'π(a | s) = N(μ(s), σ²)', { a: 'start' }) + T(350, 30, '∇μ log π = (a − μ) / σ²', { a: 'end', s: 10 }) +
      C(225, 118, 4.5, 'fa') + T(232, 132, 'sampled a, A > 0', { a: 'start', c: 't-a', s: 10 }) +
      A(140, 132, 185, 132, 'a b') + T(140, 146, 'μ', { s: 10 }) + T(185, 146, 'μ′', { s: 10, c: 't-a' }) + L(140, 118, 140, 48, 'm d t'));
  })();

  /* 37. MCTS four phases */
  (function () {
    var m = '';
    function tree(cx, ph) {
      var t = '', r = [cx, 30], c1 = [cx - 20, 55], c2 = [cx + 15, 55], g1 = [cx + 5, 80], g2 = [cx + 28, 80], nw = [cx + 28, 105];
      var hot = ph === 1 || ph === 4;
      t += L(r[0], r[1], c1[0], c1[1]) + L(r[0], r[1], c2[0], c2[1], hot ? 'a b' : '') + L(c2[0], c2[1], g1[0], g1[1]) + L(c2[0], c2[1], g2[0], g2[1], hot ? 'a b' : '');
      if (ph >= 2) t += L(g2[0], g2[1], nw[0], nw[1], ph === 4 ? 'a b' : 'r');
      if (ph === 3) t += PL([[nw[0], nw[1] + 7], [nw[0] - 6, 116], [nw[0] + 6, 122], [nw[0] - 6, 128], [nw[0] + 4, 134]], 'r d') + R(nw[0] - 2, 136, 10, 8, 'fr', 1);
      if (ph === 4) t += AQ(cx + 40, 104, cx + 46, 52, cx + 9, 26, 'a');
      [r, c1, c2, g1, g2].forEach(function (p) { t += C(p[0], p[1], 7); });
      if (ph >= 2) t += C(nw[0], nw[1], 7, ph === 2 ? 'bxr dash' : 'bxr');
      return t;
    }
    [['1 select', 'pick by UCT'], ['2 expand', 'add one node'], ['3 simulate', 'random rollout'], ['4 back up', 'update N and Q']].forEach(function (t, j) {
      var cx = 40 + 90 * j;
      m += tree(cx, j + 1) + T(45 + 90 * j, 12, t[0], { w: 600, s: 11 }) + T(45 + 90 * j, 160, t[1], { c: 't-m', s: 9 });
      if (j) m += L(90 * j, 20, 90 * j, 150, 'm t');
    });
    add('mcts', 360, 168, 'One MCTS iteration. Select walks down the tree using UCT. Expand adds one new node. Simulate plays a fast default policy to the end of the game. Back up adds the result to the visit counts and value averages of every node on the path. Repeat thousands of times, then play the most visited move.', m);
  })();

  /* 38. AlphaZero */
  add('alphazero', 360, 160, 'AlphaZero\'s loop. MCTS guided by the network plays games against itself. Each position is stored with the search\'s move probabilities and the final result. The network learns to predict both, and the improved network makes the next round of search stronger.',
    BOX(10, 20, 150, 40, 'self-play\nMCTS guided by p, v', 'bxa', { head: 1, sub: 1 }) + BOX(200, 20, 150, 40, 'training data\n(s, π_MCTS, z)', 'bx', { head: 1, sub: 1 }) +
    BOX(95, 106, 170, 44, 'network f_θ(s) → (p, v)\nloss (z − v)² − πᵀ log p', 'bx', { head: 1, sub: 1 }) +
    A(160, 40, 200, 40) + T(180, 30, 'games', { c: 't-m', s: 9 }) +
    A(275, 60, 230, 106) + T(262, 88, 'train', { a: 'start', c: 't-m', s: 10 }) +
    A(130, 106, 85, 60, 'a b') + T(98, 88, 'better priors', { a: 'end', c: 't-a', s: 10 }));

  /* 39. RLHF pipeline */
  add('rlhf', 360, 212, 'The RLHF pipeline. Pretraining gives general language ability, supervised fine-tuning teaches the answer style, a reward model learns human preferences from rankings, and PPO optimises the policy against that reward while a KL penalty keeps it close to the SFT model.',
    BOX(10, 14, 160, 66, '1  Pretrain\nnext-token prediction\non huge amounts of text', 'bx', { head: 1, sub: 1 }) +
    BOX(190, 14, 160, 66, '2  Supervised fine-tune\nimitate human-written\ngood answers', 'bx', { head: 1, sub: 1 }) +
    BOX(190, 114, 160, 66, '3  Reward model\nhumans rank outputs\nA better than B → r(x, y)', 'bxa', { head: 1, sub: 1 }) +
    BOX(10, 114, 160, 66, '4  RL with PPO\nmaximise r(x, y)\n− β · KL(π ‖ π_SFT)', 'bxa', { head: 1, sub: 1 }) +
    A(170, 47, 190, 47) + A(270, 80, 270, 114) + A(190, 147, 170, 147) +
    T(180, 202, 'the KL term limits reward hacking', { c: 't-m', s: 10 }));

  /* 40. model-based loop */
  add('modelbased', 360, 192, 'Model-based RL. Real experience is used twice: directly to improve the value or policy, and to learn a model. The model then generates simulated experience for planning, which squeezes much more learning out of every real step. If the model is wrong, planning learns the wrong thing.',
    BOX(120, 12, 120, 30, 'value / policy', 'bxa', { head: 1 }) + BOX(120, 156, 120, 30, 'experience', 'bx', { head: 1 }) + BOX(280, 84, 75, 30, 'model', 'bxr', { head: 1 }) +
    A(140, 42, 140, 156) + T(132, 100, 'acting', { a: 'end', c: 't-m', s: 10 }) +
    A(220, 156, 220, 42, 'm d') + T(226, 68, 'direct RL', { a: 'start', c: 't-m', s: 10 }) +
    A(240, 160, 300, 114) + T(282, 150, 'learn model', { a: 'start', c: 't-m', s: 10 }) +
    A(305, 84, 240, 32, 'r') + T(282, 52, 'planning', { a: 'start', c: 't-r', s: 10 }));

  /* 41. method choice tree */
  add('taxonomy', 360, 246, 'A quick way to answer a which-model question. Start from what you know about the environment, then the size of the state space, then the action space. Real problems mix these, so always justify your choice with the deciding property.',
    L(180, 36, 85, 64) + L(180, 36, 275, 64) + L(85, 92, 41, 120) + L(85, 92, 125, 120) + L(275, 92, 227, 120) + L(275, 92, 313, 120) + L(313, 160, 254, 196) + L(313, 160, 324, 196) +
    BOX(120, 8, 120, 28, 'model known?', 'bxm', { head: 1 }) +
    BOX(10, 64, 150, 28, 'can sweep all states?', 'bxm') + BOX(200, 64, 150, 28, 'fits in a table?', 'bxm') +
    BOX(5, 120, 72, 40, 'DP\nPI / VI', 'bxa', { head: 1, sub: 1 }) + BOX(85, 120, 80, 40, 'MCTS\nplan online', 'bxa', { head: 1, sub: 1 }) +
    BOX(190, 120, 75, 40, 'tabular\nSARSA, Q', 'bxa', { head: 1, sub: 1 }) + BOX(272, 120, 82, 40, 'continuous\nactions?', 'bxm') +
    BOX(222, 196, 64, 40, 'DQN\nfamily', 'bxa', { head: 1, sub: 1 }) + BOX(292, 196, 64, 40, 'PG\nPPO, A-C', 'bxa', { head: 1, sub: 1 }) +
    T(120, 46, 'yes', { c: 't-m', s: 9 }) + T(240, 46, 'no', { c: 't-m', s: 9 }) + T(52, 104, 'yes', { c: 't-m', s: 9 }) + T(118, 104, 'no', { c: 't-m', s: 9 }) +
    T(241, 104, 'yes', { c: 't-m', s: 9 }) + T(308, 104, 'no', { c: 't-m', s: 9 }) + T(272, 176, 'no', { c: 't-m', s: 9 }) + T(330, 176, 'yes', { c: 't-m', s: 9 }));

  /* 42. Mountain Car */
  (function () {
    function px(p) { return 20 + (p + 1.2) / 1.7 * 320; }
    function py(p) { return 95 - 45 * Math.sin(3 * p); }
    var pts = []; for (var p = -1.2; p <= 0.5001; p += 0.02) pts.push([px(p), py(p)]);
    var m = PL(pts, 'b') + T(180, 16, 'engine too weak to drive straight up', { c: 't-m', s: 10 });
    var cx = px(-0.5236), cy = py(-0.5236);
    m += R(cx - 11, cy - 15, 22, 10, 'bxa', 2) + C(cx - 6, cy - 3, 3, 'fi') + C(cx + 6, cy - 3, 3, 'fi');
    m += L(336, 50, 336, 26) + SH('M336 26 L350 31 L336 36 Z', 'fr') + T(330, 64, 'goal', { a: 'end', c: 't-r', s: 10 });
    m += AQ(132, 124, 100, 100, 70, 96, 'a b') + T(70, 64, '1 back up left', { c: 't-a', s: 10 }) + AQ(164, 124, 220, 112, 268, 76, 'a b') + T(228, 82, '2 swing right', { a: 'end', c: 't-a', s: 10 });
    m += T(180, 160, 'state: position and velocity, both continuous', { c: 't-m', s: 10 }) + T(180, 174, 'reward −1 every step until the flag', { c: 't-m', s: 10 });
    add('mountaincar', 360, 182, 'Mountain Car. The engine is too weak to drive straight up, so the agent must first roll back up the left slope to build momentum. Reward is −1 per step until the flag. The state is continuous position and velocity, which is why tile coding or another approximator is needed.', m);
  })();

  /* 43. terminated vs truncated */
  (function () {
    var t = '';
    [25, 65, 105].forEach(function (x, j) { t += C(x, 40, 10) + (j < 2 ? A(x + 10, 40, x + 30, 40) : ''); t += C(x, 105, 10) + A(x + 10, 105, x + 30, 105, j === 2 ? 'm d' : ''); });
    t += A(115, 40, 138, 40) + R(138, 30, 20, 20, 'bxa', 2) + T(148, 40, 'T', { w: 600, s: 10 });
    t += C(145, 105, 10, 'bx dash') + T(145, 105, 's′', { s: 10 }) + L(125, 86, 125, 124, 'r b') + T(125, 80, 'time limit', { c: 't-r', s: 9 });
    t += T(180, 32, 'terminated (hole, goal)', { a: 'start', w: 600, s: 11 }) + T(180, 48, 'target y = r, since V(T) = 0', { a: 'start', c: 't-a', s: 10 }) +
      T(180, 97, 'truncated (time limit)', { a: 'start', w: 600, s: 11 }) + T(180, 113, 'target y = r + γ V(s′)', { a: 'start', c: 't-a', s: 10 }) +
      T(180, 142, 'treating truncated as terminated teaches a fake failure', { c: 't-m', s: 10 });
    add('termtrunc', 360, 150, 'Terminated versus truncated in Gymnasium. A real terminal state has value 0, so the target is just the reward. A time-limit cut-off is not the end of the world: the next state still has a future, so you keep bootstrapping.', t);
  })();

  /* 44. POMDP belief */
  (function () {
    var b = [.05, .40, .10, .40, .05], p = T(180, 14, 'the agent sees only o and keeps a belief b(s) = P(s | history)', { c: 't-m', s: 9 });
    b.forEach(function (v, j) { var x = 40 + 56 * j, h = v * 120; p += R(x + 8, 100 - h, 34, h, v > .2 ? 'bxa' : 'bxm', 2) + T(x + 25, 92 - h, v.toFixed(2), { s: 9 }) + R(x, 100, 50, 26, 'bx', 0) + T(x + 25, 113, 's' + (j + 1), { s: 10 }); });
    p += T(180, 140, 'observation "wall on the left" fits s2 and s4 equally', { c: 't-m', s: 10 });
    add('belief', 360, 148, 'A POMDP. The agent cannot see its true position, only a noisy observation. It keeps a belief, a probability for each possible state given everything seen so far, and acts on that. Here the observation fits two cells equally well, so the belief splits between them.', p);
  })();

  /* 45. importance sampling ratio */
  (function () {
    var r = T(180, 12, 'ρ = Π π(Aₖ | Sₖ) / b(Aₖ | Sₖ), no p(s′ | s, a) needed', { s: 10 });
    r += T(10, 32, 'π greedy, b picks 2 actions 50/50', { a: 'start', c: 't-m', s: 9 });
    [[58, ['×2', '×2', '×2'], '= 8', 'bxa', 'b agreed with π every step'], [106, ['×2', '×2', '×0'], '= 0', 'bxr', 'one non-greedy step']].forEach(function (row) {
      row[1].forEach(function (f, j) { r += BOX(80 + 60 * j, row[0], 46, 26, f, f === '×0' ? 'bxr' : 'bx') + (j < 2 ? T(133 + 60 * j, row[0] + 13, '·', {}) : ''); });
      r += T(80, row[0] - 8, row[4], { a: 'start', s: 9, c: 't-m' }) + BOX(268, row[0], 70, 26, 'ρ ' + row[2], row[3], { head: 1 });
    });
    r += T(180, 150, 'one miss zeroes the episode, long agreement explodes', { c: 't-m', s: 10 });
    add('isratio', 360, 158, 'Off-policy Monte Carlo with importance sampling. The ratio multiplies π over b for every step, and the unknown dynamics cancel out. With a greedy target, one non-greedy action makes the whole ratio 0, while long episodes where b happens to agree give huge ratios. That is the high-variance problem.', r);
  })();

  /* 46. Bellman chain */
  (function () {
    var c = '', v = ['−5', '−4', '−3', '−2', '−1', '0'];
    for (var j = 0; j < 6; j++) { if (j < 5) c += A(30 + 60 * j + 18, 40, 30 + 60 * (j + 1) - 18, 40) + T(60 + 60 * j, 12, 'r = −1', { c: 't-m', s: 9 }); }
    for (j = 0; j < 6; j++) c += C(30 + 60 * j, 40, 18, j === 5 ? 'bxa' : 'bx') + T(30 + 60 * j, 40, v[j], { w: 600 });
    c += T(330, 68, 'goal', { c: 't-a', s: 10 }) + T(180, 86, 'v(s) = −1 + v(next state), solved backward from the goal', { c: 't-m', s: 10 });
    add('taxichain', 360, 94, 'The Bellman equation on a straight path to a goal, with reward −1 per step and γ = 1. Each state is worth the reward for one step plus the value of the next state. Solving backward from the goal fills in the whole table.', c);
  })();

  /* 47. incremental mean */
  add('incmean', 360, 128, 'The incremental mean. Instead of storing every sample, move the old estimate a fraction of the way toward the new sample. With step 1/n this is exactly the running average. Replace 1/n with a constant α and you have the update used everywhere in RL: estimate += step × (target − estimate).',
    L(30, 56, 330, 56, 'm') + C(80, 56, 5, 'fi') + T(80, 40, 'Qₙ', { w: 600 }) + C(280, 56, 5, 'fr') + T(280, 40, 'Rₙ, new sample', { c: 't-r' }) +
    AQ(84, 50, 107, 30, 130, 50, 'a b') + C(130, 56, 5, 'fa') + T(130, 70, 'Qₙ₊₁', { c: 't-a', w: 600 }) + T(110, 14, 'step 1/n of the way, n = 4', { c: 't-a', s: 10 }) +
    L(80, 86, 280, 86, 'm t') + L(80, 81, 80, 91, 'm t') + L(280, 81, 280, 91, 'm t') + T(180, 98, 'error Rₙ − Qₙ', { c: 't-m', s: 10 }) +
    T(180, 118, 'Qₙ₊₁ = Qₙ + (1/n)(Rₙ − Qₙ)', { w: 600 }));

  /* 48. sparse vs shaped reward */
  (function () {
    var s2 = T(10, 14, 'sparse: one reward at the very end', { a: 'start', c: 't-m', s: 10 }) + T(10, 66, 'shaped: small hints along the way', { a: 'start', c: 't-m', s: 10 });
    for (var t = 0; t < 20; t++) {
      var x = 40 + 15 * t;
      s2 += t === 19 ? R(x - 4, 24, 8, 26, 'fa', 1) : C(x, 50, 1.6, 'fm');
      s2 += t === 19 ? R(x - 4, 76, 8, 26, 'fa', 1) : (t % 4 === 3 ? R(x - 4, 94, 8, 8, 'fa', 1) : C(x, 102, 1.6, 'fm'));
    }
    s2 += L(30, 50, 335, 50, 'm t') + L(30, 102, 335, 102, 'm t') + T(180, 116, 'time →', { c: 't-m', s: 9 });
    add('sparse', 360, 122, 'Sparse versus shaped reward. With one reward at the end, random exploration may never see it, and credit has to travel back through every step. Shaping adds intermediate hints, which speeds learning but can be exploited if the hints do not match the real goal.', s2);
  })();

  /* 49. history vs state */
  (function () {
    var h = T(14, 10, 'history Hₜ: everything seen so far', { a: 'start', c: 't-m', s: 10 });
    ['O₁', 'A₁', 'R₂', 'O₂', 'A₂', 'R₃', '…', 'Oₜ'].forEach(function (t, j) { h += BOX(14 + 36 * j, 20, 32, 24, t, j === 6 ? 'bxm' : 'bx', { s: 10 }); });
    h += P('M14 52 L14 58 L298 58 L298 52', 'm') + A(156, 58, 156, 78) + BOX(86, 78, 140, 28, 'state Sₜ = f(Hₜ)', 'bxa', { head: 1 });
    h += T(236, 82, 'Markov if Sₜ keeps', { a: 'start', s: 9, c: 't-m' }) + T(236, 95, 'all that matters', { a: 'start', s: 9, c: 't-m' }) + T(236, 108, 'for the future', { a: 'start', s: 9, c: 't-m' });
    add('history', 360, 114, 'History versus state. The history is the full stream of observations, actions and rewards, and a state is a summary of it. The state is Markov when it keeps everything about the history that matters for predicting the future, so the rest can be thrown away.', h);
  })();

  /* 50. state aggregation */
  (function () {
    function yt(x) { return 110 - 80 * Math.sqrt((x - 30) / 300); }
    var pts = [], a = L(30, 112, 330, 112, 'm') + L(30, 112, 30, 18, 'm');
    for (var x = 30; x <= 330; x += 5) pts.push([x, yt(x)]);
    a += PL(pts, 'm b');
    for (var g = 0; g < 5; g++) { var x0 = 30 + 60 * g, m = 0; for (var q = 0; q <= 60; q++) m += yt(x0 + q); m /= 61; a += L(x0, m, x0 + 60, m, 'a b') + (g ? L(x0, 18, x0, 112, 'm d t') : ''); }
    a += T(36, 18, 'value', { a: 'start', c: 't-m', s: 9 }) + T(330, 122, 'state →', { a: 'end', c: 't-m', s: 9 }) + T(120, 136, 'true v (curve)', { c: 't-m', s: 10 }) + T(260, 136, 'one weight per group', { c: 't-a', s: 10 });
    add('stateagg', 360, 144, 'State aggregation. States are grouped, and each group shares one value, so the estimate is a staircase over the true value curve. It is the simplest linear approximator: one one-hot feature per group.', a);
  })();

  /* 51. ExpectiMax */
  add('expectimax', 360, 140, 'An ExpectiMax tree. The triangle is the agent\'s choice, where you take the max. Circles are chance nodes, where the environment moves at random, so you take the probability-weighted average. Action a₂ wins with 5.2 even though a₁ holds the single best outcome of 10.',
    L(180, 30, 100, 70) + L(180, 30, 260, 70, 'a b') + L(100, 70, 70, 112) + L(100, 70, 130, 112) + L(260, 70, 230, 112) + L(260, 70, 290, 112) +
    SH('M180 14 L192 34 L168 34 Z', 'bxa') + C(100, 70, 12) + C(260, 70, 12) +
    R(58, 112, 24, 20, 'bxm', 2) + T(70, 122, '10') + R(118, 112, 24, 20, 'bxm', 2) + T(130, 122, '0') + R(218, 112, 24, 20, 'bxm', 2) + T(230, 122, '6') + R(278, 112, 24, 20, 'bxm', 2) + T(290, 122, '−2') +
    T(132, 44, 'a₁', { s: 10 }) + T(228, 44, 'a₂', { s: 10, c: 't-a' }) + T(70, 88, '0.5', { s: 9, c: 't-m' }) + T(130, 88, '0.5', { s: 9, c: 't-m' }) + T(228, 88, '0.9', { s: 9, c: 't-m' }) + T(292, 88, '0.1', { s: 9, c: 't-m' }) +
    T(84, 70, 'E = 5', { a: 'end', s: 10 }) + T(276, 70, 'E = 5.2', { a: 'start', s: 10, c: 't-a' }) + T(198, 24, 'max = 5.2', { a: 'start', s: 10, c: 't-a', w: 600 }));

  /* 52. MCTS backup numbers */
  add('mctsback', 360, 156, 'MCTS backpropagation with the numbers from the reading, γ = 0.8. The rollout return is discounted back up the path, adding each reward on the way. Every edge on the path updates its visit count and running average, so a well-visited edge moves only a little.',
    A(54, 50, 136, 50) + T(95, 38, 'a, r = 6', { s: 10 }) + A(164, 50, 246, 50) + T(205, 38, 'f, r = 0', { s: 10 }) + APL([[274, 50], [290, 44], [302, 56], [318, 50]], 'm d') + T(296, 30, 'rollout', { c: 't-m', s: 9 }) +
    C(40, 50, 14) + T(40, 50, 's', { w: 600 }) + C(150, 50, 14) + T(150, 50, 't', { w: 600 }) + C(260, 50, 14, 'bxr') + T(260, 50, 'y', { w: 600 }) + R(320, 40, 30, 20, 'bxm', 2) + T(335, 50, '31.25', { s: 8 }) +
    T(40, 80, 'G = 18.8', { s: 10, w: 600 }) + T(150, 80, 'G = 16', { s: 10, w: 600 }) + T(260, 80, 'G = 20', { s: 10, w: 600 }) +
    T(95, 102, 'Q(s,a): 18 → 18.16', { s: 10, c: 't-a' }) + T(205, 102, 'Q(t,f): 0 → 8', { s: 10, c: 't-a' }) + T(95, 116, 'N(s,a) = 5', { s: 10, c: 't-m' }) + T(205, 116, 'N(t,f) = 2', { s: 10, c: 't-m' }) +
    A(330, 134, 30, 134, 'a') + T(180, 148, 'G ← r + γ G, carried back up the path', { c: 't-m', s: 10 }));

  return D;
})();
