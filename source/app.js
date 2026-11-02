window.MathJax = {
  tex: { inlineMath: [['$', '$']], displayMath: [['$$', '$$']] },
  svg: { fontCache: 'global' },
  options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] },
  startup: { typeset: false, ready: function () { MathJax.startup.defaultReady(); mjReady = true; flushTypeset(); } }
};
var mjReady = false, mjQueue = [];
function typeset(el) { if (!el) return; mjQueue.push(el); if (mjReady) setTimeout(flushTypeset, 0); }
function flushTypeset() {
  var els = mjQueue.splice(0).filter(function (e) { return e.isConnected; });
  if (!els.length) return;
  MathJax.typesetPromise(els).catch(function () {});
}

(function () {
  'use strict';
  var WEEKS = {
    w1: 'Week 1 Intro', w2: 'Week 2 Bandits', w3: 'Week 3 MDPs', w4: 'Week 4 Bellman', w5: 'Week 5 DP',
    w6: 'Week 6 Monte Carlo', w7: 'Week 7 TD', w8: 'Week 8 Function approx', w9: 'Week 9 Deep RL',
    w10: 'Week 10 Policy gradients', w11: 'Week 11 MCTS and RLHF', x: 'Cross-topic', p: 'Your project'
  };
  var MTOPICS = { bandit: 'Bandits', dp: 'Dynamic programming', mc: 'Monte Carlo', td: 'TD control', fa: 'Function approximation', deep: 'Deep RL', pg: 'Policy gradients', plan: 'Planning', rlhf: 'RLHF', other: 'Framing' };

  /* ---------- parse source ---------- */
  function hash(s) { var h = 5381; for (var i = 0; i < s.length; i++) { h = ((h << 5) + h + s.charCodeAt(i)) | 0; } return (h >>> 0).toString(36); }
  var src = document.getElementById('src').textContent.replace(/\r/g, '');
  var G = [], C = [], D = [], M = [], W = [];
  var cur = null, field = null;
  src.split('\n').forEach(function (line) {
    var m;
    if ((m = line.match(/^@g (\S+) \| (.+?) \| (.+)$/))) { G.push({ wk: m[1], term: m[2], def: m[3] }); cur = null; return; }
    if ((m = line.match(/^@card (\S+)\s*$/))) { cur = { kind: 'card', wk: m[1], Q: '', A: '', K: '' }; C.push(cur); field = null; return; }
    if ((m = line.match(/^@deriv (\S+) \| (.+)$/))) { cur = { kind: 'deriv', wk: m[1], title: m[2], G: '', steps: [] }; D.push(cur); field = null; return; }
    if ((m = line.match(/^@mcq (\S+)\s*$/))) { cur = { kind: 'mcq', topic: m[1], Q: '', opts: [], ans: -1, E: '' }; M.push(cur); field = null; return; }
    if ((m = line.match(/^@(weak|tip) (.+)$/))) { cur = { kind: m[1], title: m[2], A: '' }; W.push(cur); field = null; return; }
    if (!cur) return;
    if ((m = line.match(/^(Q|A|K|G|E): ?(.*)$/))) { field = m[1]; cur[field] = m[2]; return; }
    if (cur.kind === 'deriv' && (m = line.match(/^(S|W): ?(.*)$/))) {
      if (m[1] === 'S') { cur.steps.push({ s: m[2], w: '' }); field = 'S'; }
      else if (cur.steps.length) { cur.steps[cur.steps.length - 1].w = m[2]; field = 'W'; }
      return;
    }
    if (cur.kind === 'mcq' && (m = line.match(/^O(\*?): ?(.*)$/))) { if (m[1]) cur.ans = cur.opts.length; cur.opts.push(m[2]); field = null; return; }
    if (line.trim() === '') { field = null; return; }
    if (field && cur.kind !== 'deriv') cur[field] += '\n' + line;
  });
  C.forEach(function (c) { c.id = 'c' + hash(c.wk + c.Q); c.kws = c.K ? c.K.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : []; });
  D.forEach(function (d) { d.id = 'd' + hash(d.title); });
  M.forEach(function (q, i) { q.id = 'm' + hash(q.Q); q.order = seededOrder(q.opts.length, 67 + i); });

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function seededOrder(n, seed) { var r = mulberry32(seed), a = []; for (var i = 0; i < n; i++) a.push(i); for (var j = n - 1; j > 0; j--) { var k = Math.floor(r() * (j + 1)); var t = a[j]; a[j] = a[k]; a[k] = t; } return a; }

  /* ---------- tiny markdown ---------- */
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function inline(s) {
    var math = [];
    s = s.replace(/\$\$[\s\S]+?\$\$|\$[^$]+?\$/g, function (x) { math.push(x); return '\u0000' + (math.length - 1) + '\u0000'; });
    s = esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return s.replace(/\u0000(\d+)\u0000/g, function (_, i) { return esc(math[+i]); });
  }
  function rich(text) {
    var out = [], list = null;
    text.split('\n').forEach(function (ln) {
      var m;
      if ((m = ln.match(/^- (.*)$/))) { if (!list || list.t !== 'ul') { close(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); return; }
      if ((m = ln.match(/^\d+\. (.*)$/))) { if (!list || list.t !== 'ol') { close(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); return; }
      close();
      if (ln.trim()) out.push('<p>' + inline(ln) + '</p>');
    });
    close();
    function close() { if (list) { out.push('<' + list.t + '>' + list.items.map(function (i) { return '<li>' + inline(i) + '</li>'; }).join('') + '</' + list.t + '>'); list = null; } }
    return out.join('');
  }
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }

  /* ---------- progress store ---------- */
  var LS_KEY = 'rl-defense-progress-v1';
  var state = { marks: {}, mcq: {} };
  var sync = 'local';
  try { var raw = localStorage.getItem(LS_KEY); if (raw) { var p = JSON.parse(raw); state.marks = p.marks || {}; state.mcq = p.mcq || {}; } } catch (e) {}
  var dbRef = null, saveTimer = null, saving = false, dirty = false;

  function mergeIn(remote) {
    ['marks', 'mcq'].forEach(function (k) {
      var r = (remote && remote[k]) || {};
      Object.keys(r).forEach(function (id) {
        var a = state[k][id], b = r[id];
        if (!a || (b && (b.t || 0) > (a.t || 0))) state[k][id] = b;
      });
    });
  }
  function persistLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }
  function scheduleSave() {
    persistLocal();
    dirty = true;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushRemote, 1200);
  }
  function flushRemote() {
    if (!dbRef || saving || !dirty) return;
    saving = true; dirty = false;
    var body = JSON.parse(JSON.stringify({ marks: state.marks, mcq: state.mcq, updated: Date.now() }));
    dbRef.set(body).then(function () { sync = 'account'; }).catch(function () { sync = 'local-fallback'; })
      .then(function () { saving = false; renderStats(); if (dirty) flushRemote(); });
  }
  (async function connect() {
    try {
      if (!window.claude || !window.claude.use) return;
      var db = await window.claude.use('db');
      var user = await window.claude.use('user');
      if (!db || !user) return;
      var id = await user.id();
      if (!id) return;
      var ref = db.collection('data/users/' + id).doc('progress');
      var timer = setTimeout(function () { renderStats(); }, 10000);
      var snap = await ref.get();
      clearTimeout(timer);
      if (snap.exists) mergeIn(snap.data());
      dbRef = ref; sync = 'account';
      persistLocal();
      if (!snap.exists && (Object.keys(state.marks).length || Object.keys(state.mcq).length)) { dirty = true; flushRemote(); }
      renderAll();
    } catch (e) { sync = 'local-fallback'; renderStats(); }
  })();

  function mark(id, s, toggle) {
    var curm = state.marks[id];
    if (toggle && curm && curm.s === s) delete state.marks[id]; else state.marks[id] = { s: s, t: Date.now() };
    scheduleSave(); renderStats();
  }
  function markOf(id) { return state.marks[id] ? state.marks[id].s : null; }

  /* ---------- stats ---------- */
  function renderStats() {
    var know = 0, rev = 0;
    C.forEach(function (c) { var s = markOf(c.id); if (s === 'know') know++; else if (s === 'review') rev++; });
    var ans = 0, ok = 0;
    M.forEach(function (q) { var r = state.mcq[q.id]; if (r) { ans++; if (r.ok) ok++; } });
    var dk = D.filter(function (d) { return markOf(d.id) === 'know'; }).length;
    var syncTxt = sync === 'account' ? 'Progress saves to your Claude account' : sync === 'local-fallback' ? 'Account save failed, progress kept in this browser' : 'Progress saves in this browser';
    document.getElementById('stats').innerHTML =
      '<span class="stat know"><b>' + know + '</b> know it</span>' +
      '<span class="stat rev"><b>' + rev + '</b> review again</span>' +
      '<span class="stat"><b>' + (C.length - know - rev) + '</b> unseen of ' + C.length + '</span>' +
      '<span class="stat"><b>' + ok + '/' + ans + '</b> MCQs right (' + M.length + ' total)</span>' +
      '<span class="stat"><b>' + dk + '/' + D.length + '</b> derivations solid</span>' +
      '<span class="sync">' + syncTxt + '</span>';
    var sd = document.getElementById('sync-detail');
    if (sd) sd.textContent = sync === 'account'
      ? 'Your marks and MCQ answers are stored privately in your Claude account, so they follow you to other devices when you open this page signed in. A copy is also kept in this browser.'
      : 'Your marks and MCQ answers are stored in this browser. Open the page signed in to claude.ai to keep them in your account across devices.';
  }

  /* ---------- glossary ---------- */
  var gWeek = 'all';
  function chipRow(container, items, current, onPick) {
    container.innerHTML = '';
    items.forEach(function (it) {
      var b = el('<button type="button"></button>');
      b.textContent = it[1]; b.setAttribute('aria-pressed', String(it[0] === current));
      b.addEventListener('click', function () { onPick(it[0]); });
      container.appendChild(b);
    });
  }
  function renderGlossary() {
    var weeks = [['all', 'All']].concat(Object.keys(WEEKS).filter(function (w) { return G.some(function (g) { return g.wk === w; }); }).map(function (w) { return [w, WEEKS[w].replace(/^Week (\d+).*/, 'W$1')]; }));
    chipRow(document.getElementById('g-weeks'), weeks, gWeek, function (w) { gWeek = w; renderGlossary(); });
    var q = document.getElementById('g-search').value.trim().toLowerCase();
    var list = document.getElementById('g-list');
    var items = G.filter(function (g) { return (gWeek === 'all' || g.wk === gWeek) && (!q || (g.term + ' ' + g.def).toLowerCase().indexOf(q) >= 0); });
    list.innerHTML = items.length ? items.map(function (g) {
      return '<div class="gitem"><div class="gterm">' + inline(g.term) + '<div><span class="pill">' + esc(WEEKS[g.wk] || g.wk) + '</span></div></div><div class="gdef rich">' + inline(g.def) + '</div></div>';
    }).join('') : '<div class="empty">No terms match. Try a shorter word.</div>';
    typeset(list);
  }
  document.getElementById('g-search').addEventListener('input', renderGlossary);
  function lookup(term) {
    var box = document.getElementById('g-search');
    var t = term.toLowerCase();
    var hit = G.find(function (g) { return g.term.toLowerCase().indexOf(t) >= 0; });
    box.value = hit ? t : t.split(' ')[0];
    gWeek = 'all'; if (location.hash !== '#glossary') location.hash = 'glossary'; else route(); window.scrollTo(0, 0);
  }

  /* ---------- flashcards ---------- */
  var cPile = 'all', cWeek = 'all', cMode = 'deck', cShuffle = false, cIdx = 0, cShow = false;
  try { var ui = JSON.parse(localStorage.getItem('rl-defense-ui') || '{}'); cPile = ui.p || cPile; cWeek = ui.w || cWeek; cMode = ui.m || cMode; cIdx = ui.i || 0; } catch (e) {}
  function saveUI() { try { localStorage.setItem('rl-defense-ui', JSON.stringify({ p: cPile, w: cWeek, m: cMode, i: cIdx })); } catch (e) {} }
  var PILES = [['all', 'All'], ['unseen', 'Unseen'], ['review', 'Review again'], ['know', 'Know it'], ['answered', 'Answered, newest first']];
  function filteredCards() {
    var list = C.filter(function (c) {
      if (cWeek !== 'all' && c.wk !== cWeek) return false;
      var s = markOf(c.id);
      if (cPile === 'unseen') return !s;
      if (cPile === 'review') return s === 'review';
      if (cPile === 'know') return s === 'know';
      if (cPile === 'answered') return !!s;
      return true;
    });
    if (cPile === 'answered') list.sort(function (a, b) { return state.marks[b.id].t - state.marks[a.id].t; });
    else if (cShuffle) { var ord = seededOrder(list.length, 67 + shuffleN); list = ord.map(function (i) { return list[i]; }); }
    return list;
  }
  var shuffleN = 0;
  function pileCount(p) { return C.filter(function (c) { var s = markOf(c.id); if (cWeek !== 'all' && c.wk !== cWeek) return false; return p === 'all' ? true : p === 'unseen' ? !s : p === 'answered' ? !!s : s === p; }).length; }
  function pillFor(s) { return s === 'know' ? '<span class="pill know">Know it</span>' : s === 'review' ? '<span class="pill review">Review again</span>' : '<span class="pill">Unseen</span>'; }
  function markButtons(id, onDone, toggle) {
    var s = markOf(id);
    var wrap = el('<div class="marks"></div>');
    var r = el('<button type="button" class="rev">Review again</button>');
    var k = el('<button type="button" class="know">Know it</button>');
    r.setAttribute('aria-pressed', String(s === 'review')); k.setAttribute('aria-pressed', String(s === 'know'));
    r.addEventListener('click', function () { mark(id, 'review', toggle); onDone('review'); });
    k.addEventListener('click', function () { mark(id, 'know', toggle); onDone('know'); });
    wrap.appendChild(r); wrap.appendChild(k);
    return wrap;
  }
  function kwRow(c) {
    var row = el('<div class="kw"><span class="hint">Keywords</span></div>');
    c.kws.forEach(function (k) { var b = el('<button type="button"></button>'); b.textContent = k; b.title = 'Look up in glossary'; b.addEventListener('click', function () { lookup(k); }); row.appendChild(b); });
    return row;
  }
  function renderCards() {
    chipRow(document.getElementById('c-piles'), PILES.map(function (p) { return [p[0], p[1] + ' (' + pileCount(p[0]) + ')']; }), cPile, function (p) { cPile = p; cIdx = 0; cShow = false; saveUI(); renderCards(); });
    var wk = [['all', 'All']].concat(Object.keys(WEEKS).filter(function (w) { return C.some(function (c) { return c.wk === w; }); }).map(function (w) { return [w, WEEKS[w]]; }));
    chipRow(document.getElementById('c-weeks'), wk, cWeek, function (w) { cWeek = w; cIdx = 0; cShow = false; saveUI(); renderCards(); });
    document.getElementById('c-mode-deck').setAttribute('aria-pressed', String(cMode === 'deck'));
    document.getElementById('c-mode-list').setAttribute('aria-pressed', String(cMode === 'list'));
    document.getElementById('c-shuffle').setAttribute('aria-pressed', String(cShuffle));
    var body = document.getElementById('c-body');
    body.innerHTML = '';
    var list = filteredCards();
    if (!list.length) {
      var msg = cPile === 'review' ? 'Nothing in Review again for this topic. Cards you mark Review again land here.' : cPile === 'know' ? 'No cards marked Know it yet for this topic.' : cPile === 'answered' ? 'You have not marked any cards in this topic yet.' : cPile === 'unseen' ? 'You have marked every card in this topic. Switch to Review again to keep drilling.' : 'No cards here.';
      body.appendChild(el('<div class="empty"></div>')).textContent = msg; return;
    }
    if (cMode === 'deck') renderDeck(body, list); else renderList(body, list);
  }
  function renderDeck(body, list) {
    if (cIdx >= list.length) cIdx = list.length - 1; if (cIdx < 0) cIdx = 0;
    var c = list[cIdx];
    var deck = el('<div class="deck"></div>');
    var card = el('<article class="card" aria-live="polite"></article>');
    card.appendChild(el('<div class="meta"><span class="pill">' + esc(WEEKS[c.wk]) + '</span>' + pillFor(markOf(c.id)) + '</div>'));
    var q = el('<div class="q rich"></div>'); q.innerHTML = inline(c.Q); card.appendChild(q);
    if (cShow) {
      var a = el('<div class="ans rich"></div>'); a.innerHTML = rich(c.A); card.appendChild(a);
      if (c.kws.length) card.appendChild(kwRow(c));
      card.appendChild(markButtons(c.id, function () { advance(list.length); }));
    } else {
      var show = el('<button type="button" class="primary">Show answer</button>');
      show.addEventListener('click', function () { cShow = true; renderCards(); });
      var w = el('<div></div>'); w.appendChild(show); card.appendChild(w);
      card.appendChild(el('<div class="hint">Say your answer out loud first. It is an oral exam.</div>'));
    }
    deck.appendChild(card);
    var bar = el('<div class="deckbar"><div class="grp"></div><span class="counter"></span><div class="grp"></div></div>');
    var prev = el('<button type="button">Previous</button>'), next = el('<button type="button">Next</button>');
    prev.disabled = cIdx === 0; next.disabled = cIdx >= list.length - 1;
    prev.addEventListener('click', function () { go(-1, list.length); });
    next.addEventListener('click', function () { go(1, list.length); });
    bar.children[0].appendChild(prev);
    bar.children[1].textContent = 'Card ' + (cIdx + 1) + ' of ' + list.length;
    bar.children[2].appendChild(next);
    deck.appendChild(bar);
    body.appendChild(deck);
    typeset(card);
  }
  function go(d, n) { var ni = cIdx + d; if (ni < 0 || ni >= n) return; cIdx = ni; cShow = false; saveUI(); renderCards(); }
  function advance(n) {
    var after = filteredCards();
    var stillHere = after.length === n;
    if (stillHere && cIdx < n - 1) cIdx++;
    if (!stillHere && cIdx >= after.length) cIdx = Math.max(0, after.length - 1);
    cShow = false; saveUI(); renderCards();
  }
  function renderList(body, list) {
    var wrap = el('<div class="list"></div>');
    list.forEach(function (c) {
      var d = el('<details class="li"><summary><span class="t"></span><span></span></summary><div class="rich"></div></details>');
      d.querySelector('.t').innerHTML = inline(c.Q);
      d.querySelector('summary span:last-child').innerHTML = pillFor(markOf(c.id));
      var inner = d.querySelector('.rich');
      inner.innerHTML = rich(c.A);
      if (c.kws.length) d.appendChild(kwRow(c));
      d.appendChild(markButtons(c.id, function () {
        d.querySelector('summary span:last-child').innerHTML = pillFor(markOf(c.id));
        d.querySelectorAll('.marks button').forEach(function (b) { b.setAttribute('aria-pressed', String((b.classList.contains('know') ? 'know' : 'review') === markOf(c.id))); });
        renderPilesOnly();
      }, true));
      d.addEventListener('toggle', function () { if (d.open) typeset(d); }, { once: true });
      wrap.appendChild(d);
    });
    body.appendChild(wrap);
    typeset(wrap);
  }
  function renderPilesOnly() { chipRow(document.getElementById('c-piles'), PILES.map(function (p) { return [p[0], p[1] + ' (' + pileCount(p[0]) + ')']; }), cPile, function (p) { cPile = p; cIdx = 0; cShow = false; saveUI(); renderCards(); }); }
  document.getElementById('c-mode-deck').addEventListener('click', function () { cMode = 'deck'; saveUI(); renderCards(); });
  document.getElementById('c-mode-list').addEventListener('click', function () { cMode = 'list'; saveUI(); renderCards(); });
  document.getElementById('c-shuffle').addEventListener('click', function () { cShuffle = !cShuffle; if (cShuffle) shuffleN++; cIdx = 0; cShow = false; renderCards(); });
  document.addEventListener('keydown', function (e) {
    if (currentView !== 'cards' || cMode !== 'deck') return;
    if (e.target && /INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName) && e.key === ' ') return;
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    var list = filteredCards(); if (!list.length) return;
    var c = list[Math.min(cIdx, list.length - 1)];
    if (e.key === ' ' || e.key === 'Enter') { if (!cShow) { e.preventDefault(); cShow = true; renderCards(); } }
    else if (e.key === 'ArrowRight') go(1, list.length);
    else if (e.key === 'ArrowLeft') go(-1, list.length);
    else if (cShow && e.key === '1') { mark(c.id, 'review'); advance(list.length); }
    else if (cShow && e.key === '2') { mark(c.id, 'know'); advance(list.length); }
  });

  /* ---------- derivations ---------- */
  var dPile = 'all', dReveal = {};
  function renderDerivs() {
    var cnt = function (p) { return D.filter(function (d) { var s = markOf(d.id); return p === 'all' || (p === 'unseen' ? !s : s === p); }).length; };
    chipRow(document.getElementById('d-piles'), [['all', 'All (' + cnt('all') + ')'], ['review', 'Practise again (' + cnt('review') + ')'], ['know', 'Can write it (' + cnt('know') + ')'], ['unseen', 'Not marked (' + cnt('unseen') + ')']], dPile, function (p) { dPile = p; renderDerivs(); });
    var list = document.getElementById('d-list'); list.innerHTML = '';
    var items = D.filter(function (d) { var s = markOf(d.id); return dPile === 'all' || (dPile === 'unseen' ? !s : s === dPile); });
    if (!items.length) { list.appendChild(el('<div class="empty">Nothing in this pile yet.</div>')); return; }
    items.forEach(function (d) { list.appendChild(derivPanel(d)); });
  }
  function derivPanel(d) {
    var p = el('<article class="panel"></article>');
    var n = dReveal[d.id] || 0;
    p.appendChild(el('<div class="meta" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between;align-items:center"><span class="pill">' + esc(WEEKS[d.wk]) + '</span>' + (markOf(d.id) === 'know' ? '<span class="pill know">Can write it</span>' : markOf(d.id) === 'review' ? '<span class="pill review">Practise again</span>' : '') + '</div>'));
    var h = el('<h3 style="margin-top:8px"></h3>'); h.innerHTML = inline(d.title); p.appendChild(h);
    var g = el('<p class="goal rich muted"></p>'); g.innerHTML = '<strong>Goal.</strong> ' + inline(d.G); p.appendChild(g);
    var ol = el('<ol class="steps"></ol>');
    d.steps.slice(0, n).forEach(function (s) {
      var li = el('<li><div class="m rich"></div><div class="why rich"></div></li>');
      li.querySelector('.m').innerHTML = inline(s.s); li.querySelector('.why').innerHTML = inline(s.w);
      ol.appendChild(li);
    });
    p.appendChild(ol);
    var bar = el('<div class="marks"></div>');
    if (n < d.steps.length) {
      var nx = el('<button type="button" class="primary"></button>'); nx.textContent = n === 0 ? 'Show step 1 of ' + d.steps.length : 'Next step (' + (n + 1) + ' of ' + d.steps.length + ')';
      nx.addEventListener('click', function () { dReveal[d.id] = n + 1; p.replaceWith(derivPanel(d)); });
      var all = el('<button type="button">Show all steps</button>');
      all.addEventListener('click', function () { dReveal[d.id] = d.steps.length; p.replaceWith(derivPanel(d)); });
      bar.appendChild(nx); bar.appendChild(all);
    } else {
      var rs = el('<button type="button" class="ghost">Hide steps and try again</button>');
      rs.addEventListener('click', function () { dReveal[d.id] = 0; p.replaceWith(derivPanel(d)); });
      bar.appendChild(rs);
    }
    var s = markOf(d.id);
    var r = el('<button type="button" class="rev">Practise again</button>'), k = el('<button type="button" class="know">Can write it</button>');
    r.setAttribute('aria-pressed', String(s === 'review')); k.setAttribute('aria-pressed', String(s === 'know'));
    r.addEventListener('click', function () { mark(d.id, 'review', true); renderDerivs(); });
    k.addEventListener('click', function () { mark(d.id, 'know', true); renderDerivs(); });
    bar.appendChild(r); bar.appendChild(k);
    p.appendChild(bar);
    typeset(p);
    return p;
  }

  /* ---------- MCQ ---------- */
  var mPile = 'all';
  function renderMCQ() {
    var cnt = function (p) { return M.filter(function (q) { var r = state.mcq[q.id]; return p === 'all' || (p === 'unanswered' ? !r : p === 'wrong' ? r && !r.ok : r && r.ok); }).length; };
    chipRow(document.getElementById('m-piles'), [['all', 'All (' + cnt('all') + ')'], ['unanswered', 'Unanswered (' + cnt('unanswered') + ')'], ['wrong', 'Got wrong (' + cnt('wrong') + ')'], ['right', 'Got right (' + cnt('right') + ')']], mPile, function (p) { mPile = p; renderMCQ(); });
    var ans = cnt('right') + cnt('wrong');
    document.getElementById('m-score').textContent = ans ? 'Score ' + cnt('right') + ' of ' + ans + ' answered' : '';
    var list = document.getElementById('m-list'); list.innerHTML = '';
    var items = M.filter(function (q) { var r = state.mcq[q.id]; return mPile === 'all' || (mPile === 'unanswered' ? !r : mPile === 'wrong' ? r && !r.ok : r && r.ok); });
    if (!items.length) { list.appendChild(el('<div class="empty">' + (mPile === 'wrong' ? 'No wrong answers saved. Good, or you have not started yet.' : 'Nothing in this filter.') + '</div>')); return; }
    items.forEach(function (q) { list.appendChild(mcqPanel(q)); });
    typeset(list);
  }
  function mcqPanel(q) {
    var p = el('<article class="panel"></article>');
    var num = M.indexOf(q) + 1;
    p.appendChild(el('<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between"><span class="pill">' + esc(MTOPICS[q.topic] || q.topic) + '</span><span class="hint">Question ' + num + '</span></div>'));
    var h = el('<p class="rich" style="margin:8px 0 0;font-family:var(--f-display);font-weight:600;font-size:17px;line-height:1.35"></p>'); h.innerHTML = inline(q.Q); p.appendChild(h);
    var r = state.mcq[q.id];
    var opts = el('<div class="opts"></div>');
    q.order.forEach(function (oi, pos) {
      var b = el('<button type="button" class="opt"><span class="l">' + 'ABCD'.charAt(pos) + '</span><span class="rich"></span></button>');
      b.querySelector('.rich').innerHTML = inline(q.opts[oi]);
      if (r) {
        b.disabled = true;
        if (oi === q.ans) b.classList.add('right');
        else if (oi === r.pick) b.classList.add('wrong');
      } else b.addEventListener('click', function () { state.mcq[q.id] = { pick: oi, ok: oi === q.ans, t: Date.now() }; scheduleSave(); renderStats(); var np = mcqPanel(q); p.replaceWith(np); typeset(np); refreshMcqChips(); });
      opts.appendChild(b);
    });
    p.appendChild(opts);
    if (r) {
      var ex = el('<div class="expl rich' + (r.ok ? '' : ' bad') + '"></div>');
      ex.innerHTML = '<p><strong>' + (r.ok ? 'Correct.' : 'Not quite. The answer is ' + 'ABCD'.charAt(q.order.indexOf(q.ans)) + '.') + '</strong></p>' + rich(q.E);
      p.appendChild(ex);
      var again = el('<div class="marks"><button type="button" class="ghost">Clear my answer and retry</button></div>');
      again.querySelector('button').addEventListener('click', function () { delete state.mcq[q.id]; scheduleSave(); renderStats(); var np = mcqPanel(q); p.replaceWith(np); typeset(np); refreshMcqChips(); });
      p.appendChild(again);
    }
    return p;
  }
  function refreshMcqChips() {
    var cnt = function (pp) { return M.filter(function (q) { var r = state.mcq[q.id]; return pp === 'all' || (pp === 'unanswered' ? !r : pp === 'wrong' ? r && !r.ok : r && r.ok); }).length; };
    chipRow(document.getElementById('m-piles'), [['all', 'All (' + cnt('all') + ')'], ['unanswered', 'Unanswered (' + cnt('unanswered') + ')'], ['wrong', 'Got wrong (' + cnt('wrong') + ')'], ['right', 'Got right (' + cnt('right') + ')']], mPile, function (pp) { mPile = pp; renderMCQ(); });
    var ans = cnt('right') + cnt('wrong');
    document.getElementById('m-score').textContent = ans ? 'Score ' + cnt('right') + ' of ' + ans + ' answered' : '';
  }

  /* ---------- weak spots ---------- */
  function renderWeak() {
    var list = document.getElementById('w-list'); list.innerHTML = '';
    W.forEach(function (w) {
      var p = el('<article class="panel weak"><div class="tag' + (w.kind === 'tip' ? ' tip' : '') + '">' + (w.kind === 'tip' ? 'How to answer' : 'Weak spot') + '</div><h3></h3><div class="rich"></div></article>');
      p.querySelector('h3').innerHTML = inline(w.title); p.querySelector('.rich').innerHTML = rich(w.A);
      list.appendChild(p);
    });
    typeset(list);
  }
  document.getElementById('reset-1').addEventListener('click', function () { this.hidden = true; document.getElementById('reset-2').hidden = false; document.getElementById('reset-x').hidden = false; });
  document.getElementById('reset-x').addEventListener('click', function () { this.hidden = true; document.getElementById('reset-2').hidden = true; document.getElementById('reset-1').hidden = false; });
  document.getElementById('reset-2').addEventListener('click', function () {
    state.marks = {}; state.mcq = {};
    scheduleSave(); renderAll();
    document.getElementById('reset-2').hidden = true; document.getElementById('reset-x').hidden = true; document.getElementById('reset-1').hidden = false;
  });

  /* ---------- routing ---------- */
  var VIEWS = ['glossary', 'cards', 'derivations', 'models', 'weak'];
  var currentView = 'glossary';
  function route() {
    var h = (location.hash || '').replace('#', '');
    currentView = VIEWS.indexOf(h) >= 0 ? h : 'glossary';
    VIEWS.forEach(function (v) { document.getElementById('v-' + v).hidden = v !== currentView; });
    document.querySelectorAll('nav.tabs a').forEach(function (a) { if (a.dataset.view === currentView) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    renderView(currentView);
  }
  function renderView(v) { if (v === 'glossary') renderGlossary(); else if (v === 'cards') renderCards(); else if (v === 'derivations') renderDerivs(); else if (v === 'models') renderMCQ(); else renderWeak(); }
  function renderAll() { renderStats(); route(); }
  window.addEventListener('hashchange', function () { route(); });
  renderStats(); route();
})();
