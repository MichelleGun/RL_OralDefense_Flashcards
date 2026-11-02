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
  MathJax.typesetPromise(els).then(function () { els.forEach(fitMath); }).catch(function () {});
}
function fitMath(root) {
  root.querySelectorAll('mjx-container:not([display="true"])').forEach(function (m) {
    var p = m.parentElement; if (!p || !p.clientWidth) return;
    m.classList.remove('wide');
    if (m.getBoundingClientRect().width > p.clientWidth - 2) m.classList.add('wide');
  });
}
var fitTimer = null;
window.addEventListener('resize', function () { clearTimeout(fitTimer); fitTimer = setTimeout(function () { if (window.MathJax && mjReady) fitMath(document.body); }, 250); });

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
    if ((m = line.match(/^I: ?(.*)$/))) { (cur.I = cur.I || []).push(m[1].trim()); field = null; return; }
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
  function figs(item) {
    var DG = window.DIAG || {};
    return (item.I || []).filter(function (n) { return DG[n]; }).map(function (n) {
      return '<figure class="dg">' + DG[n].svg + '<div class="zoom-hint">Tap the diagram to zoom, tap again to fit.</div><figcaption class="rich">' + inline(DG[n].cap) + '</figcaption></figure>';
    }).join('');
  }
  document.addEventListener('click', function (e) {
    var sv = e.target.closest && e.target.closest('.dg svg'); if (!sv) return;
    var f = sv.closest('.dg'); f.classList.toggle('zoom');
    if (f.classList.contains('zoom')) f.scrollLeft = (f.scrollWidth - f.clientWidth) / 2;
  });
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstChild; }

  /* ---------- progress store ---------- */
  var LS_KEY = 'rl-defense-progress-v1';
  var state = { marks: {}, mcq: {} };
  try { var raw = localStorage.getItem(LS_KEY); if (raw) { var p = JSON.parse(raw); state.marks = p.marks || {}; state.mcq = p.mcq || {}; } } catch (e) {}
  var saveOk = true;

  function mergeIn(remote) {
    var n = 0;
    ['marks', 'mcq'].forEach(function (k) {
      var r = (remote && remote[k]) || {};
      Object.keys(r).forEach(function (id) {
        var a = state[k][id], b = r[id];
        if (b && (!a || (b.t || 0) > (a.t || 0))) { state[k][id] = b; n++; }
      });
    });
    return n;
  }
  function persistLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); saveOk = true; } catch (e) { saveOk = false; } }
  function scheduleSave() { persistLocal(); }

  /* ---------- account sync (Supabase RPC, no Claude sign-in) ---------- */
  var SB_URL = 'https://havrwkeymjjzeypnjlgh.supabase.co', SB_KEY = 'sb_publishable_9efpWJ01urvHtJKxfvbl5g_yQOkIw5t', SKEY = 'rl-defense-session';
  var sess = null, acct = 'none', saveTimer = null, saving = false, dirty = false, lastSync = 0;
  try { sess = JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) {}
  function rpc(fn, body) {
    return fetch(SB_URL + '/rest/v1/rpc/' + fn, { method: 'POST', headers: { apikey: SB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.text().then(function (t) { var j = null; try { j = t ? JSON.parse(t) : null; } catch (e) {} if (!r.ok) throw new Error((j && j.message) || 'http'); if (j && j.error) throw new Error(j.error); return j; }); },
        function () { throw new Error('network'); });
  }
  var ERR = {
    bad_username: 'Usernames are 3 to 32 letters, numbers, dots, dashes or underscores.',
    bad_password: 'Passwords need at least 6 characters.',
    taken: 'That username is taken. Pick another, or log in if it is yours.',
    bad_login: 'Wrong username or password.',
    locked: 'Too many wrong tries. Wait 10 minutes and try again.',
    network: 'Could not reach the save server. Check your connection. Progress is still kept in this browser.'
  };
  function errText(e) { return ERR[e && e.message] || ('Something went wrong (' + ((e && e.message) || 'unknown') + '). Progress is still kept in this browser.'); }
  function adopt(progress) { if (progress) mergeIn(progress); persistLocal(); }
  function scheduleSave() {
    persistLocal();
    if (!sess) return;
    dirty = true; clearTimeout(saveTimer); saveTimer = setTimeout(pushRemote, 1500);
  }
  function pushRemote() {
    if (!sess || saving || !dirty) return;
    saving = true; dirty = false; acct = 'saving'; renderStats();
    var tok = sess.token;
    rpc('deck_save', { p_token: tok, p_progress: { marks: state.marks, mcq: state.mcq } })
      .then(function (merged) { if (!sess || sess.token !== tok) return; var n = mergeIn(merged); persistLocal(); acct = 'ok'; lastSync = Date.now(); if (n) renderView(currentView); })
      .catch(function (e) { if (!sess || sess.token !== tok) return; if (e.message === 'bad_session') { endSession('Your login expired. Log in again to keep syncing.'); } else { acct = 'offline'; dirty = true; } })
      .then(function () { saving = false; renderStats(); if (currentView === 'progress') renderProgress(); if (dirty && acct !== 'offline') pushRemote(); });
  }
  function startSession(res, msg) {
    sess = { u: res.username, token: res.token };
    try { localStorage.setItem(SKEY, JSON.stringify(sess)); } catch (e) {}
    adopt(res.progress); dirty = true; acct = 'ok'; pushRemote();
    renderAll(); if (msg) flash('a-msg', msg);
  }
  function endSession(msg) {
    sess = null; acct = 'none'; clearTimeout(saveTimer);
    try { localStorage.removeItem(SKEY); } catch (e) {}
    state.marks = {}; state.mcq = {}; persistLocal();
    renderAll(); if (msg) flash('a-msg', msg, true);
  }
  if (sess && sess.token) {
    acct = 'saving';
    rpc('deck_load', { p_token: sess.token })
      .then(function (res) { adopt(res.progress); acct = 'ok'; lastSync = Date.now(); dirty = true; pushRemote(); renderAll(); })
      .catch(function (e) { if (e.message === 'bad_session') endSession('Your login expired. Log in again to keep syncing.'); else { acct = 'offline'; renderStats(); } });
  }
  window.addEventListener('online', function () { if (sess && acct === 'offline') { dirty = true; pushRemote(); } });

  function mark(id, s, toggle) {
    var curm = state.marks[id];
    if (toggle && curm && curm.s === s) state.marks[id] = { s: 'none', t: Date.now() }; else state.marks[id] = { s: s, t: Date.now() };
    scheduleSave(); renderStats();
  }
  function markOf(id) { var m = state.marks[id]; return m && (m.s === 'know' || m.s === 'review') ? m.s : null; }
  function mcqOf(id) { var r = state.mcq[id]; return r && !r.x ? r : null; }

  /* ---------- stats ---------- */
  function renderStats() {
    var know = 0, rev = 0;
    C.forEach(function (c) { var s = markOf(c.id); if (s === 'know') know++; else if (s === 'review') rev++; });
    var ans = 0, ok = 0;
    M.forEach(function (q) { var r = mcqOf(q.id); if (r) { ans++; if (r.ok) ok++; } });
    var dk = D.filter(function (d) { return markOf(d.id) === 'know'; }).length;
    var syncTxt = !saveOk ? 'This browser is blocking storage, so progress will not be kept' : !sess ? 'Progress saves in this browser only. Log in to keep it on every device' : acct === 'saving' ? 'Saving to ' + sess.u + '…' : acct === 'offline' ? 'Offline, kept in this browser until the server is back' : 'Saved to account ' + sess.u;
    document.getElementById('stats').innerHTML =
      '<span class="stat know"><b>' + know + '</b> know it</span>' +
      '<span class="stat rev"><b>' + rev + '</b> review again</span>' +
      '<span class="stat"><b>' + (C.length - know - rev) + '</b> unseen of ' + C.length + '</span>' +
      '<span class="stat"><b>' + ok + '/' + ans + '</b> MCQs right (' + M.length + ' total)</span>' +
      '<span class="stat"><b>' + dk + '/' + D.length + '</b> derivations solid</span>' +
      '<a class="sync" href="#progress"></a>';
    document.querySelector('#stats .sync').textContent = syncTxt;
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
    card.appendChild(el('<div class="meta"><span class="pill">' + esc(WEEKS[c.wk]) + '</span>' + pillFor(markOf(c.id)) + '<span class="counter">' + (cIdx + 1) + ' / ' + list.length + '</span></div>'));
    var q = el('<div class="q rich"></div>'); q.innerHTML = inline(c.Q); card.appendChild(q);
    if (cShow) {
      var a = el('<div class="ans rich"></div>'); a.innerHTML = figs(c) + rich(c.A); card.appendChild(a);
      if (c.kws.length) card.appendChild(kwRow(c));
    } else {
      card.appendChild(el('<div class="hint">Say your answer out loud first. It is an oral exam.' + (c.I && c.I.length ? ' The answer has a diagram.' : '') + '</div>'));
      card.appendChild(el('<div class="hint swipe-hint">Swipe left or right on the card to move between cards.</div>'));
    }
    deck.appendChild(card);
    var bar = el('<div class="deckbar"><button type="button" class="nav" aria-label="Previous card">\u2039</button><div class="mid"></div><button type="button" class="nav" aria-label="Next card">\u203a</button></div>');
    var prev = bar.children[0], next = bar.children[2], mid = bar.children[1];
    prev.disabled = cIdx === 0; next.disabled = cIdx >= list.length - 1;
    prev.addEventListener('click', function () { go(-1, list.length); });
    next.addEventListener('click', function () { go(1, list.length); });
    if (cShow) {
      var s0 = markOf(c.id);
      var r = el('<button type="button" class="rev">Review again</button>'), k = el('<button type="button" class="know">Know it</button>');
      r.setAttribute('aria-pressed', String(s0 === 'review')); k.setAttribute('aria-pressed', String(s0 === 'know'));
      r.addEventListener('click', function () { mark(c.id, 'review'); advance(list.length); });
      k.addEventListener('click', function () { mark(c.id, 'know'); advance(list.length); });
      mid.appendChild(r); mid.appendChild(k);
    } else {
      var show = el('<button type="button" class="primary">Show answer</button>');
      show.addEventListener('click', function () { cShow = true; renderCards(); });
      mid.appendChild(show);
    }
    deck.appendChild(bar);
    body.appendChild(deck);
    var sx = null, sy = 0;
    card.addEventListener('touchstart', function (e) { if (e.touches.length !== 1) { sx = null; return; } sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    card.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy; sx = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (e.target.closest && e.target.closest('.dg.zoom')) return;
        var sc = e.target.closest && e.target.closest('mjx-container'); if (sc && sc.scrollWidth > sc.clientWidth) return;
        go(dx < 0 ? 1 : -1, list.length);
      }
    }, { passive: true });
    typeset(card);
  }
  function keepCardInView() {
    var cd = document.querySelector('#c-body .card'); if (!cd) return;
    var top = cd.getBoundingClientRect().top;
    if (top < 56) window.scrollTo(0, window.scrollY + top - 64);
  }
  function go(d, n) { var ni = cIdx + d; if (ni < 0 || ni >= n) return; cIdx = ni; cShow = false; saveUI(); renderCards(); keepCardInView(); }
  function advance(n) {
    var after = filteredCards();
    var stillHere = after.length === n;
    if (stillHere && cIdx < n - 1) cIdx++;
    if (!stillHere && cIdx >= after.length) cIdx = Math.max(0, after.length - 1);
    cShow = false; saveUI(); renderCards(); keepCardInView();
  }
  function renderList(body, list) {
    var wrap = el('<div class="list"></div>');
    list.forEach(function (c) {
      var d = el('<details class="li"><summary><span class="t"></span><span></span></summary><div class="rich"></div></details>');
      d.querySelector('.t').innerHTML = inline(c.Q);
      d.querySelector('summary span:last-child').innerHTML = pillFor(markOf(c.id));
      var inner = d.querySelector('.rich');
      inner.innerHTML = figs(c) + rich(c.A);
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
    if (d.I) { var fg = el('<div class="figs"></div>'); fg.innerHTML = figs(d); p.appendChild(fg); }
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
    var cnt = function (p) { return M.filter(function (q) { var r = mcqOf(q.id); return p === 'all' || (p === 'unanswered' ? !r : p === 'wrong' ? r && !r.ok : r && r.ok); }).length; };
    chipRow(document.getElementById('m-piles'), [['all', 'All (' + cnt('all') + ')'], ['unanswered', 'Unanswered (' + cnt('unanswered') + ')'], ['wrong', 'Got wrong (' + cnt('wrong') + ')'], ['right', 'Got right (' + cnt('right') + ')']], mPile, function (p) { mPile = p; renderMCQ(); });
    var ans = cnt('right') + cnt('wrong');
    document.getElementById('m-score').textContent = ans ? 'Score ' + cnt('right') + ' of ' + ans + ' answered' : '';
    var list = document.getElementById('m-list'); list.innerHTML = '';
    var items = M.filter(function (q) { var r = mcqOf(q.id); return mPile === 'all' || (mPile === 'unanswered' ? !r : mPile === 'wrong' ? r && !r.ok : r && r.ok); });
    if (!items.length) { list.appendChild(el('<div class="empty">' + (mPile === 'wrong' ? 'No wrong answers saved. Good, or you have not started yet.' : 'Nothing in this filter.') + '</div>')); return; }
    items.forEach(function (q) { list.appendChild(mcqPanel(q)); });
    typeset(list);
  }
  function mcqPanel(q) {
    var p = el('<article class="panel"></article>');
    var num = M.indexOf(q) + 1;
    p.appendChild(el('<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between"><span class="pill">' + esc(MTOPICS[q.topic] || q.topic) + '</span><span class="hint">Question ' + num + '</span></div>'));
    var h = el('<p class="rich" style="margin:8px 0 0;font-family:var(--f-display);font-weight:600;font-size:17px;line-height:1.35"></p>'); h.innerHTML = inline(q.Q); p.appendChild(h);
    var r = mcqOf(q.id);
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
      ex.innerHTML = '<p><strong>' + (r.ok ? 'Correct.' : 'Not quite. The answer is ' + 'ABCD'.charAt(q.order.indexOf(q.ans)) + '.') + '</strong></p>' + rich(q.E) + figs(q);
      p.appendChild(ex);
      var again = el('<div class="marks"><button type="button" class="ghost">Clear my answer and retry</button></div>');
      again.querySelector('button').addEventListener('click', function () { state.mcq[q.id] = { x: 1, t: Date.now() }; scheduleSave(); renderStats(); var np = mcqPanel(q); p.replaceWith(np); typeset(np); refreshMcqChips(); });
      p.appendChild(again);
    }
    return p;
  }
  function refreshMcqChips() {
    var cnt = function (pp) { return M.filter(function (q) { var r = mcqOf(q.id); return pp === 'all' || (pp === 'unanswered' ? !r : pp === 'wrong' ? r && !r.ok : r && r.ok); }).length; };
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
  function renderProgress() {
    document.getElementById('acct-out').hidden = !!sess;
    document.getElementById('acct-in').hidden = !sess;
    if (sess) {
      document.getElementById('a-name').textContent = sess.u;
      var nm = Object.keys(state.marks).filter(function (k) { return markOf(k); }).length, nq = Object.keys(state.mcq).filter(function (k) { return mcqOf(k); }).length;
      document.getElementById('a-status').textContent = (acct === 'offline' ? 'Cannot reach the server right now. Changes are kept here and sent when it is back. ' : acct === 'saving' ? 'Saving… ' : 'All changes saved. ') +
        nm + ' marks and ' + nq + ' MCQ answers in this account. Log in with the same username on another device to pick up where you left off.';
    }
  }
  function flash(id, msg, bad) { var e = document.getElementById(id); if (!e) return; e.textContent = msg; e.className = 'pmsg' + (bad ? ' bad' : ''); }
  function acctBusy(on) { ['a-login', 'a-register'].forEach(function (id) { document.getElementById(id).disabled = on; }); }
  function acctCall(fn) {
    var u = document.getElementById('a-user').value.trim(), pw = document.getElementById('a-pass').value;
    if (!u || !pw) { flash('a-msg', 'Enter a username and a password.', true); return; }
    if (fn === 'deck_register' && !/^[A-Za-z0-9_.-]{3,32}$/.test(u)) { flash('a-msg', ERR.bad_username, true); return; }
    if (fn === 'deck_register' && pw.length < 6) { flash('a-msg', ERR.bad_password, true); return; }
    acctBusy(true); flash('a-msg', fn === 'deck_register' ? 'Creating account…' : 'Logging in…');
    rpc(fn, { p_username: u, p_password: pw })
      .then(function (res) { document.getElementById('a-pass').value = ''; startSession(res, (fn === 'deck_register' ? 'Account created. ' : 'Logged in. ') + 'Progress from this browser was merged in.'); })
      .catch(function (e) { flash('a-msg', errText(e), true); })
      .then(function () { acctBusy(false); });
  }
  document.getElementById('acct-form').addEventListener('submit', function (e) { e.preventDefault(); acctCall('deck_login'); });
  document.getElementById('a-register').addEventListener('click', function () { acctCall('deck_register'); });
  document.getElementById('a-logout').addEventListener('click', function () {
    var tok = sess && sess.token;
    var finish = function () { endSession('Logged out. Progress on this device was cleared, your account still has it.'); };
    if (!tok) { finish(); return; }
    clearTimeout(saveTimer);
    rpc('deck_save', { p_token: tok, p_progress: { marks: state.marks, mcq: state.mcq } }).catch(function () {})
      .then(function () { return rpc('deck_logout', { p_token: tok }); }).then(finish, finish);
  });
  document.getElementById('a-sync').addEventListener('click', function () {
    if (!sess) return;
    rpc('deck_load', { p_token: sess.token }).then(function (res) { adopt(res.progress); dirty = true; pushRemote(); renderAll(); })
      .catch(function (e) { if (e.message === 'bad_session') endSession('Your login expired. Log in again to keep syncing.'); else { acct = 'offline'; renderStats(); renderProgress(); } });
  });
  document.getElementById('reset-1').addEventListener('click', function () { this.hidden = true; document.getElementById('reset-2').hidden = false; document.getElementById('reset-x').hidden = false; });
  document.getElementById('reset-x').addEventListener('click', function () { this.hidden = true; document.getElementById('reset-2').hidden = true; document.getElementById('reset-1').hidden = false; });
  document.getElementById('reset-2').addEventListener('click', function () {
    var now = Date.now();
    Object.keys(state.marks).forEach(function (k) { state.marks[k] = { s: 'none', t: now }; });
    Object.keys(state.mcq).forEach(function (k) { state.mcq[k] = { x: 1, t: now }; });
    scheduleSave(); renderAll();
    document.getElementById('reset-2').hidden = true; document.getElementById('reset-x').hidden = true; document.getElementById('reset-1').hidden = false;
  });

  /* ---------- theme ---------- */
  var TKEY = 'rl-defense-theme';
  function applyTheme(t) {
    if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
    document.querySelectorAll('#theme button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.t === t)); });
  }
  var theme = 'light';
  try { theme = localStorage.getItem(TKEY) || 'light'; } catch (e) {}
  applyTheme(theme);
  document.querySelectorAll('#theme button').forEach(function (b) {
    b.addEventListener('click', function () { theme = b.dataset.t; applyTheme(theme); try { localStorage.setItem(TKEY, theme); } catch (e) {} });
  });

  /* ---------- routing ---------- */
  var VIEWS = ['glossary', 'cards', 'derivations', 'models', 'weak', 'progress'];
  var currentView = 'glossary';
  function route() {
    var h = (location.hash || '').replace('#', '');
    currentView = VIEWS.indexOf(h) >= 0 ? h : 'glossary';
    VIEWS.forEach(function (v) { document.getElementById('v-' + v).hidden = v !== currentView; });
    document.querySelectorAll('nav.tabs a').forEach(function (a) { if (a.dataset.view === currentView) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    renderView(currentView);
  }
  function renderView(v) { if (v === 'glossary') renderGlossary(); else if (v === 'cards') renderCards(); else if (v === 'derivations') renderDerivs(); else if (v === 'models') renderMCQ(); else if (v === 'progress') renderProgress(); else renderWeak(); }
  function renderAll() { renderStats(); route(); }
  window.addEventListener('hashchange', function () { route(); });
  renderStats(); route();
})();
