window.MathJax = {
  tex: { inlineMath: [['$', '$']], displayMath: [['$$', '$$']] },
  svg: { fontCache: 'global' },
  options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] },
  startup: { typeset: false, ready: function () { MathJax.startup.defaultReady(); mjReady = true; flushTypeset(); } }
};
var mjReady = false, mjQueue = [];
function typeset(el) { if (!el) return; watchFigs(el); mjQueue.push(el); if (mjReady) setTimeout(flushTypeset, 0); }
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
/* diagram build animation: lines draw themselves, everything else fades in, once when scrolled into view */
var REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
var figIO = (!REDUCED && 'IntersectionObserver' in window) ? new IntersectionObserver(function (ents) {
  ents.forEach(function (e) { if (e.isIntersecting) { figIO.unobserve(e.target); drawSvg(e.target); } });
}, { threshold: 0.3 }) : null;
function watchFigs(root) {
  if (!figIO || !root.querySelectorAll) return;
  root.querySelectorAll('.dg svg:not([data-w])').forEach(function (s) { s.setAttribute('data-w', '1'); figIO.observe(s); });
}
function drawSvg(svg) {
  if (REDUCED || !svg) return;
  var els = Array.prototype.slice.call(svg.children), n = els.length; if (!n) return;
  var span = Math.min(1.6, 0.3 + n * 0.03), prev = null;
  var tok = svg.__anim = (svg.__anim || 0) + 1;
  els.forEach(function (e, i) {
    var tag = e.tagName.toLowerCase(), cls = e.getAttribute('class') || '', len = 0;
    var d = i / n * span;
    var draw = /^ln\b/.test(cls) && !/\bdash\b/.test(cls) && (tag === 'line' || tag === 'path' || tag === 'polyline') && typeof e.getTotalLength === 'function';
    if (draw) { try { len = e.getTotalLength(); } catch (x) { len = 0; } if (!(len > 0)) draw = false; }
    if (tag === 'polygon' && prev && prev.__draw) d = prev.__d + 0.5;
    e.__d = d; e.__draw = draw; e.style.transition = 'none';
    if (draw) { e.style.strokeDasharray = len + ' ' + len; e.style.strokeDashoffset = String(len); }
    else e.style.opacity = '0';
    prev = e;
  });
  svg.getBoundingClientRect();
  requestAnimationFrame(function () { requestAnimationFrame(function () {
    els.forEach(function (e) {
      if (e.__draw) { e.style.transition = 'stroke-dashoffset .6s ease ' + e.__d.toFixed(2) + 's'; e.style.strokeDashoffset = '0'; }
      else { e.style.transition = 'opacity .45s ease ' + e.__d.toFixed(2) + 's'; e.style.opacity = '1'; }
    });
    setTimeout(function () { if (svg.__anim !== tok) return; els.forEach(function (e) { e.removeAttribute('style'); }); }, (span + 1.3) * 1000);
  }); });
}
document.addEventListener('click', function (e) {
  var b = e.target.closest && e.target.closest('.dg-replay'); if (!b) return;
  drawSvg(b.parentNode.querySelector('svg'));
});
var fitTimer = null;
window.addEventListener('resize', function () { clearTimeout(fitTimer); fitTimer = setTimeout(function () { if (window.MathJax && mjReady) fitMath(document.body); }, 250); });

(function () {
  'use strict';
  var WEEKS = {
    w1: 'Week 1 Intro', w2: 'Week 2 Bandits', w3: 'Week 3 MDPs', w4: 'Week 4 Bellman', w5: 'Week 5 DP',
    w6: 'Week 6 Monte Carlo', w7: 'Week 7 TD', w8: 'Week 8 Function approx', w9: 'Week 9 Deep RL',
    w10: 'Week 10 Policy gradients', w11: 'Week 11 MCTS and RLHF', x: 'Cross-topic', p: 'Your project', d: 'Drone project'
  };
  var MTOPICS = { bandit: 'Bandits', dp: 'Dynamic programming', mc: 'Monte Carlo', td: 'TD control', fa: 'Function approximation', deep: 'Deep RL', pg: 'Policy gradients', plan: 'Planning', rlhf: 'RLHF', other: 'Framing' };

  var MWK = { bandit: 'w2', dp: 'w5', mc: 'w6', td: 'w7', fa: 'w8', deep: 'w9', pg: 'w10', plan: 'w11', rlhf: 'w11', other: 'x' };
  function wkVar(wk) { return 'var(--' + (wk === 'x' ? 'wx' : wk === 'p' ? 'wp' : wk === 'd' ? 'wd' : wk) + ')'; }
  function wkPill(wk, label) { return '<span class="pill wk" style="--wc:' + wkVar(wk) + '">' + esc(label || WEEKS[wk] || wk) + '</span>'; }
  var ICON = {
    user: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
    trophy: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 21h8M9 17h6"/></svg>',
    play: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>'
  };

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
    if ((m = line.match(/^(Q|A|K|G|E|P): ?(.*)$/))) { field = m[1]; cur[field] = m[2]; return; }
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
    var out = [], list = null, tbl = null;
    text.split('\n').forEach(function (ln) {
      var m;
      if (/^\|.*\|\s*$/.test(ln)) {
        if (list) close();
        if (/^\|[\s:|-]+\|\s*$/.test(ln)) return;
        var cells = ln.trim().replace(/\\\|/g, '\u0000').slice(1, -1).split('|').map(function (c) { return c.replace(/\u0000/g, '|').trim(); });
        if (!tbl) tbl = { head: cells, rows: [] }; else tbl.rows.push(cells);
        return;
      }
      closeT();
      if ((m = ln.match(/^- (.*)$/))) { if (!list || list.t !== 'ul') { close(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); return; }
      if ((m = ln.match(/^\d+\. (.*)$/))) { if (!list || list.t !== 'ol') { close(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); return; }
      close();
      if (ln.trim()) out.push('<p>' + inline(ln) + '</p>');
    });
    close(); closeT();
    function closeT() { if (!tbl) return; out.push('<div class="cmp-wrap"><table class="cmp"><thead><tr>' + tbl.head.map(function (h) { return '<th>' + inline(h) + '</th>'; }).join('') + '</tr></thead><tbody>' + tbl.rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return i ? '<td>' + inline(c) + '</td>' : '<th scope="row">' + inline(c) + '</th>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'); tbl = null; }
    function close() { if (list) { out.push('<' + list.t + '>' + list.items.map(function (i) { return '<li>' + inline(i) + '</li>'; }).join('') + '</' + list.t + '>'); list = null; } }
    return out.join('');
  }
  function figs(item) {
    var DG = window.DIAG || {};
    return (item.I || []).filter(function (n) { return DG[n]; }).map(function (n) {
      return '<figure class="dg">' + DG[n].svg + '<button type="button" class="dg-replay" aria-label="Replay the diagram animation">Replay</button><div class="zoom-hint">Tap the diagram to zoom, tap again to fit.</div><figcaption class="rich">' + inline(DG[n].cap) + '</figcaption></figure>';
    }).join('');
  }
  document.addEventListener('click', function (e) {
    var sv = e.target.closest && e.target.closest('.dg svg'); if (!sv) return;
    var f = sv.closest('.dg'); f.classList.toggle('zoom');
    if (f.classList.contains('zoom')) f.scrollLeft = (f.scrollWidth - f.clientWidth) / 2;
  });
  function answerHTML(c) {
    if (!c.P) return figs(c) + rich(c.A);
    return '<div class="plain"><div class="plain-h">In plain words</div>' + rich(c.P) + '</div>' + figs(c) + '<div class="exam-h">Exam answer, with the keywords</div>' + rich(c.A);
  }
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
  var board = null, boardErr = '', boardAt = 0, boardLoading = false, boardShow = true;
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
      .then(function (merged) { if (!sess || sess.token !== tok) return; var n = mergeIn(merged); persistLocal(); acct = 'ok'; lastSync = Date.now(); if (currentView === 'board') loadBoard(true); else if (n) renderView(currentView); })
      .catch(function (e) { if (!sess || sess.token !== tok) return; if (e.message === 'bad_session') { endSession('Your login expired. Log in again to keep syncing.'); } else { acct = 'offline'; dirty = true; } })
      .then(function () { saving = false; renderStats(); if (currentView === 'progress') renderProgress(); if (dirty && acct !== 'offline') pushRemote(); });
  }
  function startSession(res, msg) {
    sess = { u: res.username, token: res.token };
    try { localStorage.setItem(SKEY, JSON.stringify(sess)); } catch (e) {}
    adopt(res.progress); dirty = true; acct = 'ok'; pushRemote(); board = null;
    boardShow = true;
    rpc('deck_load', { p_token: res.token }).then(function (r) { if (r) boardShow = r.show_on_board !== false; syncSwitches(); }).catch(function () {});
    renderAll(); if (msg) flash('a-msg', msg);
  }
  function endSession(msg) {
    sess = null; acct = 'none'; clearTimeout(saveTimer); board = null;
    try { localStorage.removeItem(SKEY); } catch (e) {}
    state.marks = {}; state.mcq = {}; persistLocal();
    renderAll(); if (msg) flash('a-msg', msg, true);
  }
  if (sess && sess.token) {
    acct = 'saving';
    rpc('deck_load', { p_token: sess.token })
      .then(function (res) { boardShow = res.show_on_board !== false; adopt(res.progress); acct = 'ok'; lastSync = Date.now(); dirty = true; pushRemote(); renderAll(); })
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
    renderBanner();
  }
  var bannerFor;
  function renderBanner() {
    var b = document.getElementById('abanner'), who = sess ? sess.u : '';
    if (!b || bannerFor === who) return; bannerFor = who;
    if (sess) {
      b.className = 'abanner in';
      b.innerHTML = '<div class="ab-t"><b>Logged in as <span></span>.</b> Your progress syncs to your account on every device.</div><div class="ab-b"><a class="btn" href="#board">' + ICON.trophy + 'Leaderboard</a><a class="btn" href="#progress">' + ICON.user + 'Account</a></div>';
      b.querySelector('.ab-t span').textContent = sess.u;
    } else {
      b.className = 'abanner';
      b.innerHTML = '<div class="ab-t"><b>Free accounts are here.</b> Pick a username and a password, no email needed. Your progress follows you to any phone or laptop, and you join the study leaderboard.</div><div class="ab-b"><a class="btn primary" href="#progress">' + ICON.user + 'Create account or log in</a><a class="btn" href="#board">' + ICON.trophy + 'Leaderboard</a></div>';
    }
  }

  /* ---------- glossary ---------- */
  var gWeek = 'all';
  function chipRow(container, items, current, onPick) {
    container.innerHTML = '';
    items.forEach(function (it) {
      var b = el('<button type="button"></button>');
      if (it[2]) b.innerHTML = '<span class="dot" style="--wc:' + it[2] + '"></span>' + esc(it[1]); else b.textContent = it[1];
      b.setAttribute('aria-pressed', String(it[0] === current));
      b.addEventListener('click', function () { onPick(it[0]); });
      container.appendChild(b);
    });
  }
  function renderGlossary() {
    var weeks = [['all', 'All']].concat(Object.keys(WEEKS).filter(function (w) { return G.some(function (g) { return g.wk === w; }); }).map(function (w) { return [w, WEEKS[w].replace(/^Week (\d+).*/, 'W$1'), wkVar(w)]; }));
    chipRow(document.getElementById('g-weeks'), weeks, gWeek, function (w) { gWeek = w; renderGlossary(); });
    var q = document.getElementById('g-search').value.trim().toLowerCase();
    var list = document.getElementById('g-list');
    var items = G.filter(function (g) { return (gWeek === 'all' || g.wk === gWeek) && (!q || (g.term + ' ' + g.def).toLowerCase().indexOf(q) >= 0); });
    list.innerHTML = items.length ? items.map(function (g) {
      return '<div class="gitem" style="--wc:' + wkVar(g.wk) + '"><div class="gterm">' + inline(g.term) + '<div>' + wkPill(g.wk) + '</div></div><div class="gdef rich">' + inline(g.def) + '</div></div>';
    }).join('') : '<div class="empty">No terms match. Try a shorter word.</div>';
    typeset(list);
  }
  document.getElementById('g-search').addEventListener('input', renderGlossary);
  var gMode = 'terms', cmpDone = false;
  function setGMode(m) {
    gMode = m;
    document.querySelectorAll('#g-mode button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-gm') === m)); });
    document.getElementById('g-terms').hidden = m !== 'terms';
    var c = document.getElementById('g-compare'); c.hidden = m !== 'compare';
    if (m === 'compare' && !cmpDone) { cmpDone = true; typeset(c); }
  }
  document.querySelectorAll('#g-mode button').forEach(function (b) { b.addEventListener('click', function () { setGMode(b.getAttribute('data-gm')); }); });
  function lookup(term) {
    var box = document.getElementById('g-search');
    var t = term.toLowerCase();
    var hit = G.find(function (g) { return g.term.toLowerCase().indexOf(t) >= 0; });
    box.value = hit ? t : t.split(' ')[0];
    setGMode('terms');
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
    var wk = [['all', 'All']].concat(Object.keys(WEEKS).filter(function (w) { return C.some(function (c) { return c.wk === w; }); }).map(function (w) { return [w, WEEKS[w], wkVar(w)]; }));
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
    var card = el('<article class="card wkc" aria-live="polite" style="--wc:' + wkVar(c.wk) + '"></article>');
    card.appendChild(el('<div class="meta">' + wkPill(c.wk) + pillFor(markOf(c.id)) + '<span class="counter">' + (cIdx + 1) + ' / ' + list.length + '</span></div>'));
    var q = el('<div class="q rich"></div>'); q.innerHTML = inline(c.Q); card.appendChild(q);
    if (cShow) {
      var a = el('<div class="ans rich"></div>'); a.innerHTML = answerHTML(c); card.appendChild(a);
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
      inner.innerHTML = answerHTML(c);
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
    var p = el('<article class="panel wkc" style="--wc:' + wkVar(d.wk) + '"></article>');
    var n = dReveal[d.id] || 0;
    p.appendChild(el('<div class="meta" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between;align-items:center">' + wkPill(d.wk) + (markOf(d.id) === 'know' ? '<span class="pill know">Can write it</span>' : markOf(d.id) === 'review' ? '<span class="pill review">Practise again</span>' : '') + '</div>'));
    var h = el('<h3 style="margin-top:8px"></h3>'); h.innerHTML = inline(d.title); p.appendChild(h);
    var g = el('<p class="goal rich muted"></p>'); g.innerHTML = '<strong>Goal.</strong> ' + inline(d.G); p.appendChild(g);
    var pb = el('<div class="marks"><button type="button" class="play">' + ICON.play + 'Play with voice</button><span class="hint" style="align-self:center">' + d.steps.length + ' steps, narrated and animated</span></div>');
    pb.querySelector('button').addEventListener('click', function () { openPlayer(d, this); });
    p.appendChild(pb);
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
    var p = el('<article class="panel wkc" style="--wc:' + wkVar(MWK[q.topic] || 'x') + '"></article>');
    var num = M.indexOf(q) + 1;
    p.appendChild(el('<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between">' + wkPill(MWK[q.topic] || 'x', MTOPICS[q.topic] || q.topic) + '<span class="hint">Question ' + num + '</span></div>'));
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
      syncSwitches();
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

  /* ---------- leaderboard ---------- */
  function ago(ts) {
    var s = (Date.now() - new Date(ts).getTime()) / 1000;
    if (!(s >= 0)) return '';
    if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' min ago';
    if (s < 86400) return Math.round(s / 3600) + ' h ago';
    return Math.round(s / 86400) + ' d ago';
  }
  function localScore() {
    var c = C.filter(function (x) { return markOf(x.id) === 'know'; }).length;
    var d = D.filter(function (x) { return markOf(x.id) === 'know'; }).length;
    var m = M.filter(function (x) { var r = mcqOf(x.id); return r && r.ok; }).length;
    return c + 2 * d + m;
  }
  function syncSwitches() { document.querySelectorAll('#a-board,#b-board').forEach(function (x) { x.checked = !!boardShow; }); }
  function setBoard(on) {
    if (!sess) return;
    var before = boardShow; boardShow = on; syncSwitches();
    rpc('deck_set_board', { p_token: sess.token, p_show: on })
      .then(function () { if (currentView === 'board') loadBoard(true); })
      .catch(function (e) {
        if (e.message === 'bad_session') { endSession('Your login expired. Log in again to keep syncing.'); return; }
        boardShow = before; syncSwitches(); flash('a-msg', errText(e), true);
        var bm = document.getElementById('b-msg'); if (bm) bm.textContent = errText(e);
      });
  }
  document.addEventListener('change', function (e) { if (e.target && (e.target.id === 'a-board' || e.target.id === 'b-board')) setBoard(e.target.checked); });
  function loadBoard(force) {
    if (!force && board && Date.now() - boardAt < 30000) { renderBoard(); return; }
    if (boardLoading) return;
    boardLoading = true; boardErr = ''; renderBoard();
    rpc('deck_leaderboard', {})
      .then(function (rows) { board = Array.isArray(rows) ? rows : []; boardAt = Date.now(); })
      .catch(function (e) { boardErr = errText(e); })
      .then(function () { boardLoading = false; renderBoard(); });
  }
  function renderBoard() {
    var me = document.getElementById('b-me'), list = document.getElementById('b-list'), when = document.getElementById('b-when');
    var maxP = C.length + 2 * D.length + M.length;
    var rows = board || [], myRank = -1;
    rows.forEach(function (r, i) { if (sess && r.username === sess.u) myRank = i; });
    if (sess) {
      me.innerHTML = '<h3>' + ICON.trophy + '<span></span></h3><p class="muted" id="b-stat" style="margin:6px 0 10px"></p><label class="switch"><input type="checkbox" id="b-board"> Show me on the leaderboard</label><p class="pmsg bad" id="b-msg"></p>';
      me.querySelector('h3 span').textContent = sess.u;
      me.querySelector('#b-stat').textContent = myRank >= 0 ? 'Rank ' + (myRank + 1) + ' of ' + rows.length + ', score ' + rows[myRank].score + ' out of ' + maxP + ' possible.' :
        boardShow ? 'Your score is ' + localScore() + '. It shows up here a few seconds after your next save.' : 'You are hidden from the leaderboard. Your progress still syncs.';
      syncSwitches();
    } else {
      me.innerHTML = '<h3>Want to be on here?</h3><p class="muted" style="margin:6px 0 10px">Your score in this browser is <b>' + localScore() + '</b>. Create a free account, username and password only, to save it and appear on the board.</p><a class="btn primary" href="#progress">' + ICON.user + 'Create account or log in</a>';
    }
    if (boardLoading && !board) { list.innerHTML = '<div class="empty">Loading the leaderboard…</div>'; }
    else if (boardErr && !board) { list.innerHTML = ''; list.appendChild(el('<div class="empty"></div>')).textContent = boardErr; }
    else if (!rows.length) { list.innerHTML = '<div class="empty">Nobody is on the board yet. Create an account and be first.</div>'; }
    else {
      list.innerHTML = rows.map(function (r, i) {
        var mine = i === myRank, w = function (v) { return (100 * v / Math.max(1, maxP)).toFixed(1) + '%'; };
        return '<div class="brow' + (mine ? ' me' : '') + (i < 3 ? ' top' + (i + 1) : '') + '">' +
          '<span class="rk">' + (i + 1) + '</span><span class="nm">' + esc(r.username) + (mine ? ' (you)' : '') + '</span><span class="sc"><b>' + r.score + '</b></span>' +
          '<span class="bar" aria-hidden="true"><i class="bc" style="width:' + w(r.cards_known) + '"></i><i class="bd" style="width:' + w(2 * r.derivs_known) + '"></i><i class="bm" style="width:' + w(r.mcq_right) + '"></i></span>' +
          '<span class="br">' + r.cards_known + ' cards, ' + r.derivs_known + ' derivations, ' + r.mcq_right + '/' + r.mcq_answered + ' MCQs' + (r.last_active ? ', active ' + ago(r.last_active) : '') + '</span></div>';
      }).join('');
    }
    when.textContent = boardLoading ? 'Refreshing…' : boardErr ? (board ? boardErr : '') : boardAt ? 'Updated ' + new Date(boardAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  }
  document.getElementById('b-refresh').addEventListener('click', function () { loadBoard(true); });

  /* ---------- derivation player: animated steps with voice ---------- */
  var HAS_TTS = 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
  var VOICE = null, PKEY = 'rl-defense-player', pref = { rate: 1, voice: true };
  try { var pp = JSON.parse(localStorage.getItem(PKEY) || '{}'); if (pp.rate) pref.rate = pp.rate; if (pp.voice === false) pref.voice = false; } catch (e) {}
  function savePref() { try { localStorage.setItem(PKEY, JSON.stringify(pref)); } catch (e) {} }
  function pickVoice() {
    if (!HAS_TTS) return;
    var vs = []; try { vs = speechSynthesis.getVoices() || []; } catch (e) {}
    var good = /natural|neural|premium|enhanced|google|siri/i;
    var langs = ['en-AU', 'en-GB', 'en-US', 'en'];
    for (var i = 0; i < langs.length; i++) {
      var L = langs[i].toLowerCase();
      var m = vs.filter(function (v) { var l = (v.lang || '').replace('_', '-').toLowerCase(); return L === 'en' ? l.indexOf('en') === 0 : l === L; });
      if (m.length) { VOICE = m.filter(function (v) { return good.test(v.name); })[0] || m[0]; return; }
    }
    VOICE = vs[0] || null;
  }
  if (HAS_TTS) { pickVoice(); try { speechSynthesis.onvoiceschanged = pickVoice; } catch (e) {} }

  var GREEK = { alpha: 1, beta: 1, gamma: 1, delta: 1, epsilon: 1, theta: 1, lambda: 1, mu: 1, pi: 1, rho: 1, sigma: 1, tau: 1, phi: 1, psi: 1, omega: 1, eta: 1, xi: 1, kappa: 1, nu: 1, zeta: 1, chi: 1 };
  var TW = { varepsilon: 'epsilon', Delta: 'delta', Pi: 'pi', Sigma: 'sigma', Omega: 'omega', Phi: 'phi', nabla: 'grad', sum: 'sum over', prod: 'product over', max: 'max over', min: 'min over', log: 'log', ln: 'log', exp: 'exp',
    leftarrow: 'gets', gets: 'gets', to: 'to', rightarrow: 'goes to', Rightarrow: 'which means', approx: 'is approximately', le: 'is at most', leq: 'is at most', ge: 'is at least', geq: 'is at least', ne: 'is not equal to', neq: 'is not equal to',
    infty: 'infinity', cdot: 'times', times: 'times', mid: 'given', in: 'in', propto: 'is proportional to', doteq: 'is defined as', equiv: 'is defined as', partial: 'partial', top: 'transpose', dots: 'and so on', ldots: 'and so on', cdots: 'and so on',
    sim: 'sampled from', forall: 'for all', int: 'integral of', quad: ',', qquad: '. Also,', clip: 'clip', Pr: 'probability of', E: 'expectation', left: '', right: '', lfloor: 'the floor of', rfloor: '', lceil: 'the ceiling of', rceil: '', frac: 'fraction', underbrace: '', limits: '', displaystyle: '', star: 'star', sqrt: 'root', uparrow: 'goes up', downarrow: 'goes down', overbrace: '', tfrac: 'fraction', dfrac: 'fraction' };
  function tex2say(t) {
    var s = ' ' + t + ' ', i;
    s = s.replace(/\\\\/g, ', ').replace(/&/g, ' ');
    s = s.replace(/\\left\s*\\?([(\[{|.])/g, ' $1').replace(/\\right\s*\\?([)\]}|.])/g, '$1 ');
    s = s.replace(/\\[bB]igg?[lr]?\s*/g, ' ');
    s = s.replace(/\\(?:text|mathrm|operatorname|textrm|textbf)\s*\{([^{}]*)\}/g, function (_, x) { return ' ' + x.replace(/-/g, ' ') + ' '; });
    s = s.replace(/([A-Za-z0-9}'*])([(\[])/g, '$1 of $2');
    s = s.replace(/\\mathbb\s*\{?E\}?\s*_\s*/g, ' the expectation under ').replace(/\\mathbb\s*\{?E\}?/g, ' the expectation ');
    s = s.replace(/\\arg\s*\\?max/g, ' arg max over ').replace(/\\arg\s*\\?min/g, ' arg min over ');
    s = s.replace(/\\(?:hat|widehat)\s*(?:\{\s*\\?([A-Za-z]+)\s*\}|\\?([A-Za-z]))/g, function (_, a, b) { return ' ' + (a || b) + ' hat '; }).replace(/\\(?:bar|overline)\s*(?:\{\s*\\?([A-Za-z]+)\s*\}|\\?([A-Za-z]))/g, function (_, a, b) { return ' ' + (a || b) + ' bar '; });
    s = s.replace(/\\(?:mathbf|boldsymbol|mathcal|mathbb)\s*(?:\{\s*\\?([A-Za-z]+)\s*\}|\\?([A-Za-z]))/g, function (_, a, b) { return ' ' + (a || b) + ' '; });
    s = s.replace(/\\[dt]?frac\s*(\d)\s*(\d)/g, ' $1 over $2 ');
    for (i = 0; i < 6; i++) {
      s = s.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, ' $1 over $2 ');
      s = s.replace(/\\underbrace\s*\{([^{}]*)\}\s*_\s*\{([^{}]*)\}/g, ' $1, which is $2, ');
      s = s.replace(/\\sqrt\s*\{([^{}]*)\}/g, ' the square root of $1 ');
      s = s.replace(/\\(sum|prod|max|min)\s*_\s*\{([^{}]*)\}\s*\^\s*\{?([^{}\s]*)\}?/g, ' $1 from $2 to $3, ');
      s = s.replace(/\\(sum|prod|max|min)\s*_\s*\{([^{}]*)\}/g, ' \\$1 $2, ');
      s = s.replace(/\^\s*\{\s*-\s*1\s*\}/g, ' inverse ').replace(/\^\s*\{?\s*(\\top|T)\s*\}?(?![A-Za-z])/g, ' transpose ').replace(/[\^_]\s*\{?\s*\*\s*\}?/g, ' star ');
      s = s.replace(/\^\s*\{?\s*2\s*\}?(?![0-9])/g, ' squared ').replace(/\^\s*\{([^{}]*)\}/g, ' to the $1, ').replace(/\^\s*(\\[A-Za-z]+|[A-Za-z0-9])/g, ' to the $1 ');
      s = s.replace(/_\s*\{([^{}]*)\}/g, ' sub $1, ').replace(/_\s*(\\[A-Za-z]+|[A-Za-z0-9])/g, ' $1 ');
    }
    for (i = 0; i < 4; i++) s = s.replace(/\{([^{}]*)\}/g, ' $1 ');
    s = s.replace(/\\([A-Za-z]+)/g, function (_, w) { return ' ' + (GREEK[w] ? w : TW[w] != null ? TW[w] : w) + ' '; });
    s = s.replace(/\\[,;:! ]/g, ' ').replace(/\\/g, ' ');
    s = s.replace(/'/g, ' prime ').replace(/</g, ' is less than ').replace(/>/g, ' is greater than ').replace(/\|/g, ' ');
    s = s.replace(/=/g, ' equals ').replace(/\+/g, ' plus ').replace(/-/g, ' minus ').replace(/:/g, ' to ');
    s = s.replace(/[{}()\[\]]/g, ' ').replace(/\s*,\s*/g, ', ').replace(/(,\s*)+/g, ', ').replace(/\s+/g, ' ');
    return s.replace(/^[\s,]+|[\s,]+$/g, '');
  }
  function prose2say(t) {
    return String(t || '').replace(/\$\$([\s\S]+?)\$\$|\$([^$]+?)\$/g, function (_, a, b) { return ' ' + tex2say(a || b) + ' '; })
      .replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim();
  }
  function estMs(text, rate) { var w = (text.match(/\S+/g) || []).length; return Math.max(2600, w / (165 * rate) * 60000 + 900); }
  function stopSpeech() { if (HAS_TTS) { try { speechSynthesis.cancel(); } catch (e) {} } }
  function unlockSpeech() { if (!HAS_TTS || !pref.voice) return; try { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch (e) {} }
  function speak(text, rate, tok, done) {
    var parts = (text.match(/[^.!?]+[.!?]*\s*/g) || [text]).reduce(function (acc, p) { if (acc.length && (acc[acc.length - 1] + p).length < 180) acc[acc.length - 1] += p; else acc.push(p); return acc; }, []);
    var idx = 0;
    (function next() {
      if (!PL || PL.tok !== tok) return;
      if (idx >= parts.length) { done(); return; }
      var txt = parts[idx++], fired = false, safety;
      var fin = function () { if (fired) return; fired = true; clearTimeout(safety); next(); };
      var u = new SpeechSynthesisUtterance(txt);
      if (VOICE) { u.voice = VOICE; u.lang = VOICE.lang; } else u.lang = 'en-AU';
      u.rate = rate; u.onend = fin; u.onerror = fin;
      try { speechSynthesis.speak(u); } catch (e) { fin(); return; }
      safety = setTimeout(fin, estMs(txt, rate) * 2 + 4000);
    })();
  }
  function whenMath(nodes, cb) {
    if (!window.MathJax || !MathJax.typesetPromise) { var tries = 0; (function w() { if (window.MathJax && MathJax.typesetPromise && mjReady) whenMath(nodes, cb); else if (++tries > 40) cb(); else setTimeout(w, 150); })(); return; }
    if (!mjReady) { setTimeout(function () { whenMath(nodes, cb); }, 150); return; }
    MathJax.typesetPromise(nodes).then(cb, cb);
  }
  function eqPieces(root) {
    var svg = root.querySelector('mjx-container svg'); if (!svg) return [];
    var g = svg.querySelector('g[data-mml-node="math"]'); if (!g) return [];
    var out = [];
    (function walk(node, depth) {
      var kids = Array.prototype.filter.call(node.children, function (c) { return c.tagName.toLowerCase() === 'g'; });
      if (kids.length === 1 && depth < 5) { walk(kids[0], depth + 1); return; }
      kids.forEach(function (k) { out.push(k); });
    })(g, 0);
    return out;
  }
  function animateEq(root, rate, tok) {
    var parts = eqPieces(root); if (!parts.length || REDUCED) return;
    parts.forEach(function (p) { p.classList.add('tok'); });
    root.getBoundingClientRect();
    var total = Math.min(2600, Math.max(700, parts.length * 75)) / rate, step = total / parts.length;
    parts.forEach(function (p, i) { setTimeout(function () { if (PL && PL.tok === tok) p.classList.add('on'); else p.classList.add('on'); }, 60 + i * step); });
  }

  var PL = null;
  function openPlayer(d, from) {
    closePlayer();
    unlockSpeech();
    var slides = [{ k: 'intro' }].concat(d.steps.map(function (s, i) { return { k: 'step', i: i }; })).concat([{ k: 'end' }]);
    var ov = el('<div class="player" role="dialog" aria-modal="true" aria-label="Narrated derivation"><div class="pl-box" style="--wc:' + wkVar(d.wk) + '">' +
      '<div class="pl-top">' + wkPill(d.wk, (WEEKS[d.wk] || '').replace(/^Week (\d+).*/, 'W$1')) + '<div class="pl-title rich"></div><button type="button" class="pl-x" aria-label="Close player">×</button></div>' +
      '<div class="pl-bars"></div><div class="pl-stage"></div><div class="pl-cap rich" aria-live="polite"></div>' +
      '<div><div class="pl-ctl"><button type="button" class="sm" data-a="prev" aria-label="Previous step">‹</button><button type="button" class="primary big" data-a="play"></button><button type="button" class="sm" data-a="next" aria-label="Next step">›</button><button type="button" class="sm" data-a="rate" aria-label="Narration speed"></button><button type="button" class="sm" data-a="voice"></button></div><div class="pl-note"></div></div>' +
      '</div></div>');
    ov.querySelector('.pl-title').innerHTML = inline(d.title);
    var bars = ov.querySelector('.pl-bars');
    slides.forEach(function (s, i) { var b = el('<button type="button"></button>'); b.setAttribute('aria-label', s.k === 'intro' ? 'Goal' : s.k === 'end' ? 'Finish' : 'Step ' + (s.i + 1)); b.addEventListener('click', function () { showSlide(i); }); bars.appendChild(b); });
    document.body.appendChild(ov); document.body.classList.add('pl-open');
    PL = { d: d, slides: slides, i: 0, playing: true, ov: ov, tok: 0, timer: null, raf: 0, from: from };
    ov.addEventListener('click', function (e) {
      if (e.target === ov) { closePlayer(); return; }
      var b = e.target.closest && e.target.closest('[data-a]'); if (!b) { if (e.target.closest && e.target.closest('.pl-x')) closePlayer(); return; }
      var a = b.dataset.a;
      if (a === 'play') togglePlay();
      else if (a === 'prev') showSlide(Math.max(0, PL.i - 1));
      else if (a === 'next') showSlide(Math.min(PL.slides.length - 1, PL.i + 1));
      else if (a === 'rate') { pref.rate = pref.rate === 1 ? 1.25 : pref.rate === 1.25 ? 0.8 : 1; savePref(); ctlLabels(); if (PL.playing) showSlide(PL.i); }
      else if (a === 'voice') { pref.voice = !pref.voice; savePref(); if (pref.voice) unlockSpeech(); ctlLabels(); if (PL.playing) showSlide(PL.i); }
      else if (a === 'replay') { PL.playing = true; unlockSpeech(); showSlide(0); }
      else if (a === 'know' || a === 'review') { mark(d.id, a); var lbl = ov.querySelector('.pl-marked'); if (lbl) lbl.textContent = a === 'know' ? 'Marked Can write it.' : 'Marked Practise again.'; }
    });
    ctlLabels();
    showSlide(0);
    setTimeout(function () { var x = ov.querySelector('[data-a="play"]'); if (x) x.focus(); }, 30);
  }
  function ctlLabels() {
    if (!PL) return;
    var ov = PL.ov;
    ov.querySelector('[data-a="play"]').innerHTML = PL.playing ? '<span aria-hidden="true">❚❚</span> Pause' : ICON.play + (PL.i >= PL.slides.length - 1 ? 'Replay' : 'Play');
    ov.querySelector('[data-a="rate"]').textContent = (pref.rate === 1 ? '1' : pref.rate === 1.25 ? '1.25' : '0.8') + '×';
    var vb = ov.querySelector('[data-a="voice"]');
    vb.textContent = 'Voice'; vb.setAttribute('aria-label', HAS_TTS && pref.voice ? 'Voice on, tap to mute' : 'Voice off, tap to turn on'); vb.setAttribute('aria-pressed', String(HAS_TTS && pref.voice)); vb.disabled = !HAS_TTS;
    ov.querySelector('[data-a="prev"]').disabled = PL.i === 0;
    ov.querySelector('[data-a="next"]').disabled = PL.i >= PL.slides.length - 1;
    ov.querySelector('.pl-note').textContent = !HAS_TTS ? 'This browser has no built-in voice, so captions play on a timer.' : pref.voice ? 'Voice uses your device. Check your phone is not on silent.' : 'Voice is off. Captions play on a timer.';
  }
  function togglePlay() {
    if (!PL) return;
    if (PL.playing) { PL.playing = false; PL.tok++; stopSpeech(); clearTimeout(PL.timer); cancelAnimationFrame(PL.raf); ctlLabels(); return; }
    PL.playing = true; unlockSpeech();
    showSlide(PL.i >= PL.slides.length - 1 ? 0 : PL.i);
  }
  function closePlayer() {
    if (!PL) return;
    var P = PL; PL = null; P.tok++;
    stopSpeech(); clearTimeout(P.timer); cancelAnimationFrame(P.raf);
    P.ov.remove(); document.body.classList.remove('pl-open');
    if (currentView === 'derivations') renderDerivs();
  }
  function showSlide(i) {
    var P = PL; if (!P) return;
    stopSpeech(); clearTimeout(P.timer); cancelAnimationFrame(P.raf);
    P.i = i; var tok = ++P.tok, sl = P.slides[i], d = P.d, ov = P.ov;
    ov.querySelectorAll('.pl-bars button').forEach(function (b, j) { b.className = j < i ? 'done' : j === i ? 'now' : ''; b.style.setProperty('--p', '0'); });
    var stage = ov.querySelector('.pl-stage'), cap = ov.querySelector('.pl-cap'), say = '';
    if (sl.k === 'intro') {
      stage.innerHTML = '<div class="pl-step">Goal</div><div class="pl-goal rich">' + inline(d.G) + '</div>' + (d.I && d.I.length ? figs({ I: [d.I[0]] }) : '');
      cap.innerHTML = '<p>' + d.steps.length + ' steps. Each line appears as it is read out. Try to say the next line before it shows up.</p>';
      say = prose2say(d.title) + '. ' + prose2say(d.G) + ' This takes ' + d.steps.length + ' steps.';
    } else if (sl.k === 'step') {
      var st = d.steps[sl.i], pv = sl.i > 0 ? d.steps[sl.i - 1] : null;
      stage.innerHTML = (pv ? '<div class="pl-prev rich">' + inline(pv.s) + '</div><div class="pl-arrow">↓ step ' + (sl.i + 1) + ' of ' + d.steps.length + '</div>' : '<div class="pl-step">Step 1 of ' + d.steps.length + '</div>') + '<div class="pl-eq rich">' + inline(st.s) + '</div>';
      cap.innerHTML = '<p>' + inline(st.w) + '</p>';
      say = 'Step ' + (sl.i + 1) + '. ' + tex2say(st.s.replace(/^\$\$|\$\$$/g, '')) + '. ' + prose2say(st.w);
    } else {
      stage.innerHTML = '<div class="pl-end"><div class="pl-step">Done</div><div class="pl-goal">That is the whole derivation. Now cover the screen and write it out from memory.</div><div class="marks"><button type="button" data-a="replay">Replay from start</button><button type="button" class="rev" data-a="review">Practise again</button><button type="button" class="know" data-a="know">Can write it</button></div><p class="hint pl-marked"></p></div>';
      cap.innerHTML = '<p>Saying each step and its reason out loud is exactly what the oral defense asks of you.</p>';
      say = 'Done. Now cover the screen and write the derivation out from memory.';
    }
    ctlLabels();
    stage.scrollTop = 0;
    watchFigs(stage);
    var rate = pref.rate;
    whenMath([ov.querySelector('.pl-title'), stage, cap], function () {
      if (!PL || PL.tok !== tok) return;
      stage.querySelectorAll('.pl-eq,.pl-prev').forEach(function (e) {
        e.style.fontSize = ''; var fs = parseFloat(getComputedStyle(e).fontSize) || 20, min = e.classList.contains('pl-eq') ? 13 : 11;
        while (e.scrollWidth > e.clientWidth + 1 && fs > min) { fs -= 1; e.style.fontSize = fs + 'px'; }
      });
      var eq = stage.querySelector('.pl-eq'); if (eq) animateEq(eq, rate, tok);
      if (!P.playing) return;
      var bar = ov.querySelectorAll('.pl-bars button')[i], ms = estMs(say, rate), t0 = performance.now(), ended = false;
      (function tick() { if (!PL || PL.tok !== tok) return; var f = Math.min(1, (performance.now() - t0) / ms); bar.style.setProperty('--p', ended ? 1 : f.toFixed(3)); if (!ended && f < 1) P.raf = requestAnimationFrame(tick); })();
      var after = function () {
        if (!PL || PL.tok !== tok) return; ended = true; bar.style.setProperty('--p', '1');
        if (i < P.slides.length - 1) P.timer = setTimeout(function () { if (PL && PL.tok === tok && P.playing) showSlide(i + 1); }, 800);
        else { P.playing = false; ctlLabels(); }
      };
      if (HAS_TTS && pref.voice) setTimeout(function () { if (PL && PL.tok === tok) speak(say, rate, tok, after); }, 250);
      else P.timer = setTimeout(after, ms);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (!PL) return;
    if (e.key === 'Escape') { e.preventDefault(); closePlayer(); }
    else if (e.key === ' ' && !(e.target && e.target.tagName === 'BUTTON')) { e.preventDefault(); togglePlay(); }
    else if (e.key === 'ArrowRight') showSlide(Math.min(PL.slides.length - 1, PL.i + 1));
    else if (e.key === 'ArrowLeft') showSlide(Math.max(0, PL.i - 1));
  });
  window.addEventListener('pagehide', function () { stopSpeech(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden && PL && PL.playing) togglePlay(); });
  window.__tex2say = tex2say;

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
  var VIEWS = ['glossary', 'cards', 'derivations', 'models', 'weak', 'board', 'progress'];
  var currentView = 'glossary';
  function route() {
    var h = (location.hash || '').replace('#', '');
    currentView = VIEWS.indexOf(h) >= 0 ? h : 'glossary';
    VIEWS.forEach(function (v) { document.getElementById('v-' + v).hidden = v !== currentView; });
    document.querySelectorAll('nav.tabs a').forEach(function (a) { if (a.dataset.view === currentView) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    renderView(currentView);
  }
  function renderView(v) { if (v === 'glossary') renderGlossary(); else if (v === 'cards') renderCards(); else if (v === 'derivations') renderDerivs(); else if (v === 'models') renderMCQ(); else if (v === 'progress') renderProgress(); else if (v === 'board') loadBoard(false); else renderWeak(); }
  function renderAll() { renderStats(); route(); }
  window.addEventListener('hashchange', function () { route(); });
  renderStats(); route();
})();
