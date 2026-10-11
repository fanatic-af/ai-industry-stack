/* AI Industry Stack: rendering and interaction. Data lives in data.js. */
(function () {
  "use strict";

  var T = window.TAXONOMY;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var app = $("#app");

  var HUES = { L0: 22, L1: 350, L2: 318, L3: 285, L4: 258, L5: 228, L6: 200, L7: 176, L8: 150, L9: 100, L10: 44 };
  var IND_HUES = { Horizontal: 220, Legal: 30, Healthcare: 150, Finance: 120, Insurance: 190, Education: 50, Retail: 330, Manufacturing: 15, Media: 290, Government: 0, Science: 260 };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var state = {
    showAdded: store("showAdded", "1") === "1",
    industries: new Set()
  };

  /* ---------- small helpers ---------- */
  function store(k, d) { try { var v = localStorage.getItem("aistack." + k); return v === null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem("aistack." + k, v); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function hashHue(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360; return h; }
  function initials(n) {
    var w = n.replace(/[^A-Za-z0-9 .]/g, " ").trim().split(/\s+/);
    if (/^\d/.test(n)) return n.slice(0, 2);
    return (w.length > 1 ? w[0][0] + w[1][0] : w[0].slice(0, 2)).toUpperCase();
  }
  function linkedin(c) {
    if (c.slug) return "https://www.linkedin.com/company/" + c.slug + "/";
    return "https://www.linkedin.com/search/results/companies/?keywords=" + encodeURIComponent(c.q || c.of || c.name);
  }
  function layerById(id) { return T.layers.filter(function (l) { return l.id === id; })[0]; }
  function findNode(nodes, code, trail) {
    for (var i = 0; i < (nodes || []).length; i++) {
      var n = nodes[i], t = trail.concat([n]);
      if (n.code === code) return t;
      var f = findNode(n.children, code, t);
      if (f) return f;
    }
    return null;
  }
  function visible(c, layer) {
    if (!state.showAdded && c.added) return false;
    if (layer && layer.isApps && state.industries.size) {
      var ind = c.ind || ["Horizontal"];
      for (var i = 0; i < ind.length; i++) if (state.industries.has(ind[i])) return true;
      return false;
    }
    return true;
  }
  function allCompanies(node) {
    var out = (node.companies || []).slice();
    (node.children || []).forEach(function (ch) { out = out.concat(allCompanies(ch)); });
    return out;
  }
  function countVisible(node, layer) { return allCompanies(node).filter(function (c) { return visible(c, layer); }).length; }
  function layerCount(layer) { return layer.buckets.reduce(function (s, b) { return s + countVisible(b, layer); }, 0); }
  function plural(n, w) { return n + " " + w + (n === 1 ? "" : "s"); }

  var LI_SVG = '<svg class="li" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>';

  var COMM = '<sup class="comm" title="Suggested by a visitor">●</sup>';
  var ext = window.AIStackExt || null;
  function suggestBtn(layer, code, label) {
    return ext ? '<button class="btn suggest-btn" data-suggest data-layer="' + layer.id + '" data-bucket="' + esc(code || "") + '">＋ ' + label + "</button>" : "";
  }

  /* ---------- pieces ---------- */
  function chip(c, layer, i) {
    var title = (c.of ? c.name + " (by " + c.of + ")" : c.name) +
      (c.slug ? " · open LinkedIn page" : " · search LinkedIn for " + (c.q || c.of || c.name)) +
      (c.added ? " · ✦ added example" : "") + (c.community ? " · suggested by " + (c.by || "a visitor") : "");
    var dots = layer && layer.isApps ? (c.ind || ["Horizontal"]).map(function (d) {
      return '<i class="ind-dot" style="--ih:' + IND_HUES[d] + '" title="' + esc(d) + '"></i>';
    }).join("") : "";
    return '<a class="chip' + (c.added ? " added" : "") + (c.community ? " community" : "") + '" data-name="' + esc(c.name) + '" href="' + linkedin(c) +
      '" target="_blank" rel="noopener noreferrer" title="' + esc(title) + '" style="--ch:' + hashHue(c.of || c.name) + ';--i:' + (i || 0) + '">' +
      '<span class="av">' + esc(initials(c.name)) + "</span>" +
      '<span class="cn">' + esc(c.name) + (c.added ? '<sup class="spark">✦</sup>' : "") + (c.community ? COMM : "") + "</span>" + dots +
      LI_SVG + "</a>";
  }

  function chips(list, layer, limit, href) {
    var v = (list || []).filter(function (c) { return visible(c, layer); });
    if (!v.length) return "";
    var shown = limit && v.length > limit + 2 ? v.slice(0, limit) : v;
    return '<div class="chips">' + shown.map(function (c, i) { return chip(c, layer, i); }).join("") +
      (shown.length < v.length ? '<a class="chip more" href="' + href + '">+' + (v.length - shown.length) + " more →</a>" : "") + "</div>";
  }
  function nodeHref(layer, node) { return "#/" + layer.id + "/" + encodeURIComponent(node.code); }

  function concepts(list) {
    if (!list || !list.length) return "";
    return '<div class="concepts">' + list.map(function (s) { return '<span class="concept">' + esc(s) + "</span>"; }).join("") + "</div>";
  }

  function emptyNote(node, layer) {
    var hasAny = allCompanies(node).length > 0;
    if (countVisible(node, layer) || (node.concepts && node.concepts.length)) return "";
    if (layer.isApps && state.industries.size && hasAny) return '<p class="empty">No examples tagged with this industry here yet.</p>';
    return "";
  }

  function subBlock(node, layer, depth) {
    var n = countVisible(node, layer);
    var dim = layer.isApps && state.industries.size && !n ? " dim" : "";
    return '<div class="sub' + dim + '">' +
      '<a class="sub-head" href="#/' + layer.id + "/" + encodeURIComponent(node.code) + '"><span class="code">' + esc(node.code) + "</span><span>" + esc(node.name) + "</span>" +
      '<span class="count">' + n + "</span></a>" +
      (node.desc && depth < 2 ? '<p class="sub-desc">' + esc(node.desc) + "</p>" : "") +
      chips(node.companies, layer, 8, nodeHref(layer, node)) + concepts(node.concepts) +
      (node.children ? '<div class="subs nested">' + node.children.map(function (ch) { return subBlock(ch, layer, depth + 1); }).join("") + "</div>" : "") +
      "</div>";
  }

  function card(node, layer, i, big) {
    var n = countVisible(node, layer);
    var dim = layer.isApps && state.industries.size && !n ? " dim" : "";
    return '<article class="card' + (big ? " big" : "") + dim + '" style="--i:' + i + '">' +
      '<a class="card-head" href="#/' + layer.id + "/" + encodeURIComponent(node.code) + '" title="Open ' + esc(node.code) + '">' +
      (node.icon ? '<span class="arch-icon">' + node.icon + "</span>" : "") +
      '<span class="code">' + esc(node.code) + "</span>" +
      "<h3>" + esc(node.name) + "</h3>" +
      '<span class="go" aria-hidden="true">→</span></a>' +
      (node.community ? '<p class="comm-note">' + COMM + " Bucket suggested by " + esc(node.by || "a visitor") + "</p>" : "") +
      (node.desc ? '<p class="desc">' + esc(node.desc) + "</p>" : "") +
      chips(node.companies, layer, 12, nodeHref(layer, node)) + concepts(node.concepts) + emptyNote(node, layer) +
      (node.children ? '<div class="subs">' + node.children.map(function (ch) { return subBlock(ch, layer, 1); }).join("") + "</div>" : "") +
      '<div class="card-foot">' + plural(n, "example") + (node.children ? " · " + plural(node.children.length, "sub-bucket") : "") + "</div>" +
      "</article>";
  }

  function tile(c, layer, i) {
    return '<a class="tile' + (c.added ? " added" : "") + (c.community ? " community" : "") + '" data-name="' + esc(c.name) + '" href="' + linkedin(c) + '" target="_blank" rel="noopener noreferrer" style="--ch:' + hashHue(c.of || c.name) + ";--i:" + i + '">' +
      '<span class="av big">' + esc(initials(c.name)) + "</span>" +
      '<span class="t-name">' + esc(c.name) + (c.added ? ' <sup class="spark" title="Added example">✦</sup>' : "") + (c.community ? " " + COMM : "") + "</span>" +
      (c.of ? '<span class="t-of">by ' + esc(c.of) + "</span>" : c.community ? '<span class="t-of">suggested by ' + esc(c.by || "a visitor") + "</span>" : "") +
      (layer.isApps ? '<span class="t-ind">' + (c.ind || ["Horizontal"]).map(function (d) { return '<span style="--ih:' + IND_HUES[d] + '">' + esc(d) + "</span>"; }).join("") + "</span>" : "") +
      '<span class="t-cta">' + LI_SVG + (c.slug ? "View on LinkedIn" : "Find on LinkedIn") + " ↗</span></a>";
  }

  function industryBar(layer) {
    var counts = {};
    T.industries.forEach(function (d) { counts[d] = 0; });
    var all = layer.buckets.reduce(function (a, b) { return a.concat(allCompanies(b)); }, []).filter(function (c) { return state.showAdded || !c.added; });
    all.forEach(function (c) { (c.ind || ["Horizontal"]).forEach(function (d) { counts[d]++; }); });
    return '<div class="filterbar" role="group" aria-label="Filter by industry">' +
      '<span class="fb-label">F1 Industry filter</span>' +
      '<button class="fchip' + (state.industries.size ? "" : " on") + '" data-ind="">All <b>' + all.length + "</b></button>" +
      T.industries.map(function (d) {
        return '<button class="fchip' + (state.industries.has(d) ? " on" : "") + (counts[d] ? "" : " zero") + '" data-ind="' + esc(d) + '" style="--ih:' + IND_HUES[d] + '">' +
          '<i class="ind-dot" style="--ih:' + IND_HUES[d] + '"></i>' + esc(d) + " <b>" + counts[d] + "</b></button>";
      }).join("") + "</div>";
  }

  function flowStrip(layer, activeCode) {
    return '<div class="flow" aria-label="Tie-breaker order">' + layer.buckets.filter(function (b) { return !b.community; }).map(function (b, i) {
      return (i && i < 6 ? '<span class="arrow">→</span>' : i === 6 ? '<span class="sep">|</span>' : "") +
        '<a class="flow-step' + (b.code === activeCode ? " on" : "") + '" href="#/L10/' + b.code + '" style="--i:' + i + '">' +
        "<span>" + b.icon + "</span>" + b.code + " " + esc(b.name) + "</a>";
    }).join("") + '<span class="flow-note">first match wins</span></div>';
  }

  function rail(active) {
    return '<nav class="rail" aria-label="Layers">' + T.layers.slice().reverse().map(function (l, i) {
      return '<a href="#/' + l.id + '" class="rail-item' + (l.id === active ? " on" : "") + '" style="--h:' + HUES[l.id] + ";--n:" + i + ";view-transition-name:lyr-" + l.id + '" title="' + esc(l.name) + '">' +
        "<b>" + l.id + "</b><span>" + esc(l.name) + "</span></a>";
    }).join("") + "</nav>";
  }

  /* ---------- views ---------- */
  function viewHome() {
    var total = T.layers.reduce(function (s, l) { return s + layerCount(l); }, 0);
    var buckets = T.layers.reduce(function (s, l) { return s + l.buckets.length; }, 0);
    var slabs = T.layers.slice().reverse().map(function (l, i) {
      return (l.id === "L9" ? '<div class="stack-label">Enabling stack · L0 to L9 · what builders buy</div>' : "") +
        '<a class="slab" href="#/' + l.id + '" data-id="' + l.id + '" style="--h:' + HUES[l.id] + ";--i:" + i + ";view-transition-name:lyr-" + l.id + '">' +
        '<b class="slab-id">' + l.id + "</b>" +
        '<span class="slab-name">' + esc(l.name) + "</span>" +
        '<span class="slab-meta">' + plural(l.buckets.length, l.isApps ? "archetype" : "bucket") + " · " + layerCount(l) + " companies</span>" +
        "</a>";
    }).join("");
    return '<section class="home">' +
      '<div class="hero">' +
      '<p class="eyebrow">First-principles map · as of ' + esc(T.asOf) + "</p>" +
      "<h1>Every AI company sits on a <span class=\"grad\">stack</span>.</h1>" +
      '<p class="lede">' + esc(T.overview) + "</p>" +
      '<div class="stats"><div><b data-count="11">11</b><span>layers</span></div><div><b data-count="' + buckets + '">' + buckets + "</b><span>buckets &amp; archetypes</span></div><div><b data-count=\"" + total + "\">" + total + "</b><span>products &amp; companies</span></div></div>" +
      "</div>" +
      '<div class="home-grid">' +
      '<div class="stack-wrap" id="stackWrap"><div class="stack-label top">Applications · what users buy</div><div class="stack" id="stack">' + slabs + "</div>" +
      '<p class="hint">Hover a layer to peek · click to dive in</p></div>' +
      '<aside class="peek" id="peek">' + peekHtml(T.layers[10]) + "</aside>" +
      "</div>" +
      '<div class="mece"><span>💡</span><p>' + esc(T.mece) + ' <a href="#" data-open="rules">See the five classification rules →</a></p></div>' +
      (ext ? ext.homeExtra() : "") +
      "</section>";
  }

  function peekHtml(l) {
    return '<div class="peek-inner" style="--h:' + HUES[l.id] + '">' +
      '<div class="peek-top"><span class="peek-id">' + l.id + '</span><span class="peek-icon">' + l.icon + "</span></div>" +
      "<h2>" + esc(l.name) + "</h2>" +
      "<p>" + esc(l.tagline) + "</p>" +
      '<div class="test"><span>Placement test</span>' + esc(l.test) + "</div>" +
      '<ul class="peek-list">' + l.buckets.map(function (b, i) {
        return '<li style="--i:' + i + '"><span class="code">' + esc(b.code) + "</span>" + esc(b.name) + '<em>' + countVisible(b, l) + "</em></li>";
      }).join("") + "</ul>" +
      '<a class="btn primary" href="#/' + l.id + '">Explore ' + l.id + " →</a></div>";
  }

  function layerHeader(l, crumbExtra) {
    var idx = T.layers.indexOf(l);
    var prev = T.layers[idx - 1], next = T.layers[idx + 1];
    return '<header class="layer-head">' +
      '<span class="watermark">' + l.id + "</span>" +
      '<div class="lh-row"><span class="lh-icon">' + l.icon + '</span><div><p class="eyebrow">Layer ' + l.id.slice(1) + " of 10</p><h1>" + esc(l.name) + "</h1></div></div>" +
      '<p class="lede">' + esc(l.tagline) + "</p>" +
      '<div class="test"><span>Placement test</span>' + esc(l.test) + "</div>" +
      '<div class="pn">' +
      (prev ? '<a class="btn" href="#/' + prev.id + '" title="Previous layer (←)">← ' + prev.id + " " + esc(prev.name) + "</a>" : "<span></span>") +
      (next ? '<a class="btn" href="#/' + next.id + '" title="Next layer (→)">' + next.id + " " + esc(next.name) + " →</a>" : "") +
      "</div></header>";
  }

  function viewLayer(l) {
    var body = l.isApps ? flowStrip(l) + industryBar(l) : "";
    return '<section class="layer" style="--h:' + HUES[l.id] + '">' + rail(l.id) +
      '<div class="layer-main">' + layerHeader(l) + body +
      '<div class="cards' + (l.isApps ? " apps" : "") + '">' + l.buckets.map(function (b, i) { return card(b, l, i, l.isApps); }).join("") + "</div>" +
      (ext ? '<div class="suggest-row"><span class="muted">Missing something in ' + l.id + "?</span>" + suggestBtn(l, "", "Suggest a company") +
        '<button class="btn suggest-btn" data-suggest data-kind="bucket" data-layer="' + l.id + '">＋ Suggest a bucket</button></div>' : "") +
      "</div></section>";
  }

  function viewBucket(l, trail) {
    var node = trail[trail.length - 1];
    var parentList = trail.length > 1 ? trail[trail.length - 2].children : l.buckets;
    var idx = parentList.indexOf(node);
    var prev = parentList[idx - 1], next = parentList[idx + 1];
    var vis = (node.companies || []).filter(function (c) { return visible(c, l); });
    var top = l.isApps ? flowStrip(l, trail[0].code) + industryBar(l) : "";
    var content = "";
    if (node.children) {
      content += '<div class="cards">' + node.children.map(function (ch, i) { return card(ch, l, i); }).join("") + "</div>";
    }
    if (vis.length) content += '<div class="tiles">' + vis.map(function (c, i) { return tile(c, l, i); }).join("") + "</div>";
    if (node.concepts) content += '<div class="concept-panel"><h4>Also in this bucket</h4>' + concepts(node.concepts) + "</div>";
    content += emptyNote(node, l);
    if (!node.children && !vis.length && !node.concepts && !emptyNote(node, l)) content += '<p class="empty">No named examples yet.</p>';
    if (ext) content += '<div class="suggest-row"><span class="muted">Know one that belongs here?</span>' + suggestBtn(l, node.code, "Suggest a company for " + node.code) + "</div>";

    return '<section class="layer bucket" style="--h:' + HUES[l.id] + '">' + rail(l.id) +
      '<div class="layer-main">' +
      '<header class="bucket-head">' +
      '<a class="back" href="#/' + l.id + (trail.length > 1 ? "/" + encodeURIComponent(trail[trail.length - 2].code) : "") + '">← ' +
      (trail.length > 1 ? esc(trail[trail.length - 2].code + " " + trail[trail.length - 2].name) : esc(l.id + " " + l.name)) + "</a>" +
      '<div class="bh-row">' + (node.icon ? '<span class="lh-icon">' + node.icon + "</span>" : "") +
      '<span class="code xl">' + esc(node.code) + "</span><h1>" + esc(node.name) + "</h1></div>" +
      (node.desc ? '<p class="lede">' + esc(node.desc) + "</p>" : "") +
      '<div class="pn">' +
      (prev ? '<a class="btn" href="#/' + l.id + "/" + encodeURIComponent(prev.code) + '">← ' + esc(prev.code + " " + prev.name) + "</a>" : "<span></span>") +
      (next ? '<a class="btn" href="#/' + l.id + "/" + encodeURIComponent(next.code) + '">' + esc(next.code + " " + next.name) + " →</a>" : "") +
      "</div></header>" + top + content +
      "</div></section>";
  }

  function viewMissing() {
    return '<section class="missing"><h1>Lost in the stack 🧱</h1><p>That page does not exist.</p><a class="btn primary" href="#/">Back to the stack</a></section>';
  }

  /* ---------- routing ---------- */
  function parse() {
    var h = decodeURIComponent(location.hash.replace(/^#\/?/, ""));
    var q = "";
    var qi = h.indexOf("?");
    if (qi >= 0) { q = h.slice(qi + 1); h = h.slice(0, qi); }
    var parts = h.split("/").filter(Boolean);
    var hl = (q.match(/hl=([^&]*)/) || [])[1];
    return { layer: parts[0], bucket: parts[1], hl: hl ? decodeURIComponent(hl) : null };
  }

  var lastKey = null;
  function render(opts) {
    var r = parse();
    var html, crumbs = [{ t: "Stack", h: "#/" }], l = r.layer && layerById(r.layer);
    if (!r.layer) html = viewHome();
    else if (!l) html = viewMissing();
    else {
      crumbs.push({ t: l.id + " " + l.name, h: "#/" + l.id });
      if (r.bucket) {
        var trail = findNode(l.buckets, r.bucket, []);
        if (!trail) html = viewMissing();
        else {
          trail.forEach(function (n) { crumbs.push({ t: n.code + " " + n.name, h: "#/" + l.id + "/" + encodeURIComponent(n.code) }); });
          html = viewBucket(l, trail);
        }
      } else html = viewLayer(l);
    }
    var key = (r.layer || "") + "/" + (r.bucket || "");
    var canMorph = document.startViewTransition && !reduceMotion;
    // Without the View Transitions API, fake the "list slides into the sidebar" move with a CSS animation.
    var slideIn = !canMorph && lastKey === "/" && !!r.layer;
    var swap = function () {
      app.innerHTML = html;
      app.classList.toggle("slide-in", slideIn);
      $("#crumbs").innerHTML = crumbs.map(function (c, i) {
        return i === crumbs.length - 1 ? '<span aria-current="page">' + esc(c.t) + "</span>" : '<a href="' + c.h + '">' + esc(c.t) + "</a><i>/</i>";
      }).join("");
      document.documentElement.style.setProperty("--h", l ? HUES[l.id] : 258);
      document.title = (l ? l.id + " " + l.name + " · " : "") + "AI Industry Stack";
      wire();
      if (key !== lastKey && !(opts && opts.keepScroll)) window.scrollTo(0, 0);
      lastKey = key;
      if (r.hl) highlight(r.hl);
    };
    if (opts && opts.keepScroll) { var y = window.scrollY; swap(); window.scrollTo(0, y); return; }
    if (canMorph && key !== lastKey) document.startViewTransition(swap);
    else swap();
  }

  function highlight(name) {
    setTimeout(function () {
      var el = $$("[data-name]").filter(function (e) { return e.getAttribute("data-name") === name; })[0];
      if (!el) return;
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
      el.classList.add("flash");
      setTimeout(function () { el.classList.remove("flash"); }, 2600);
    }, 350);
  }

  /* ---------- wiring after each render ---------- */
  function wire() {
    // industry filter
    $$(".fchip").forEach(function (b) {
      b.addEventListener("click", function () {
        var d = b.getAttribute("data-ind");
        if (!d) state.industries.clear();
        else if (state.industries.has(d)) state.industries.delete(d);
        else state.industries.add(d);
        render({ keepScroll: true });
      });
    });

    // home stack: peek on hover
    var wrap = $("#stackWrap"), peek = $("#peek");
    if (wrap) {
      $$(".slab").forEach(function (s) {
        var show = function () {
          var l = layerById(s.getAttribute("data-id"));
          $$(".slab").forEach(function (o) { o.classList.toggle("active", o === s); });
          if (peek.getAttribute("data-id") !== l.id) {
            peek.setAttribute("data-id", l.id);
            peek.innerHTML = peekHtml(l);
          }
        };
        s.addEventListener("mouseenter", show);
        s.addEventListener("focus", show);
      });
      var first = $('.slab[data-id="L10"]'); if (first) first.classList.add("active");
      countUp();
    }
    $$('[data-open="rules"]').forEach(function (a) { a.addEventListener("click", function (e) { e.preventDefault(); openDrawer(); }); });
    $$("#app [data-suggest]").forEach(function (b) {
      b.addEventListener("click", function () {
        ext.open({ kind: b.getAttribute("data-kind") || undefined, layer: b.getAttribute("data-layer") || undefined, bucket: b.getAttribute("data-bucket") || undefined });
      });
    });
  }

  function countUp() {
    if (reduceMotion) return;
    $$("[data-count]").forEach(function (el) {
      var end = +el.getAttribute("data-count"), t0 = performance.now();
      (function step(t) {
        var p = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  /* ---------- drawer (rules + tags) ---------- */
  function openPanel(html) {
    $("#drawerBody").innerHTML = html;
    document.body.classList.add("drawer-open");
    $("#drawer").setAttribute("aria-hidden", "false");
    var first = $("#drawerBody input, #drawerBody select"); if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 50);
  }
  function openDrawer() {
    openPanel(
      '<h2>How the taxonomy works</h2><p class="muted">' + esc(T.mece) + "</p>" +
      '<h3>Five classification rules</h3><ol class="rules">' + T.rules.map(function (r) { return "<li><b>" + esc(r[0]) + "</b> " + esc(r[1]) + "</li>"; }).join("") + "</ol>" +
      '<h3>Filter tags</h3><p class="muted">Every product carries these tags; filter on them within a bucket. This site lets you filter L10 by F1 Industry.</p>' +
      '<table class="tags"><tbody>' + T.filterTags.map(function (t) { return "<tr><th><span class=\"code\">" + t[0] + "</span>" + esc(t[1]) + "</th><td>" + esc(t[2]) + "</td></tr>"; }).join("") + "</tbody></table>" +
      '<h3>Reading the chips</h3><ul class="legend">' +
      '<li><span class="chip demo"><span class="av" style="--ch:200">AB</span><span class="cn">Name</span>' + LI_SVG + "</span> opens the company's LinkedIn page (or a LinkedIn company search when the exact page is not confirmed).</li>" +
      '<li><sup class="spark">✦</sup> marks an example added on top of your original document. Toggle them with “Extra examples”.</li>' +
      '<li>Coloured dots on L10 chips are F1 Industry tags.</li>' +
      (ext ? "<li>" + COMM + " marks a company or bucket suggested by a visitor and approved by the curator.</li>" : "") + "</ul>" +
      '<p class="muted small">Company names are illustrative and reflect the landscape as of roughly mid-2026.</p>');
  }
  function closeDrawer() { document.body.classList.remove("drawer-open"); $("#drawer").setAttribute("aria-hidden", "true"); }

  /* ---------- search ---------- */
  var index = [];
  function buildIndex() {
    index = [];
    T.layers.forEach(function (l) {
      index.push({ kind: "layer", label: l.id + " " + l.name, sub: l.tagline, href: "#/" + l.id, h: HUES[l.id] });
      (function walk(nodes, path) {
        (nodes || []).forEach(function (n) {
          var p = path.concat([n.code + " " + n.name]);
          index.push({ kind: "bucket", label: n.code + " " + n.name, sub: l.id + " · " + p.slice(0, -1).join(" › "), href: "#/" + l.id + "/" + encodeURIComponent(n.code), h: HUES[l.id] });
          (n.companies || []).forEach(function (c) {
            index.push({ kind: "company", c: c, label: c.name, sub: (c.of ? "by " + c.of + " · " : "") + l.id + " › " + p.join(" › "), href: "#/" + l.id + "/" + encodeURIComponent(n.code) + "?hl=" + encodeURIComponent(c.name), h: HUES[l.id] });
          });
          walk(n.children, p);
        });
      })(l.buckets, []);
    });
  }
  var sel = 0, results = [];
  function runSearch() {
    var q = $("#searchInput").value.trim().toLowerCase();
    if (!q) { results = index.filter(function (r) { return r.kind === "layer"; }).reverse(); }
    else {
      results = index.filter(function (r) {
        if (r.c && !state.showAdded && r.c.added) return false;
        return (r.label + " " + (r.c && r.c.of || "")).toLowerCase().indexOf(q) >= 0;
      }).sort(function (a, b) {
        var as = a.label.toLowerCase().indexOf(q) === 0 ? 0 : 1, bs = b.label.toLowerCase().indexOf(q) === 0 ? 0 : 1;
        return as - bs || (a.kind === "company" ? 0 : 1) - (b.kind === "company" ? 0 : 1);
      }).slice(0, 40);
    }
    sel = 0;
    $("#searchResults").innerHTML = results.length ? results.map(function (r, i) {
      return '<a class="sr' + (i === sel ? " sel" : "") + '" href="' + r.href + '" style="--h:' + r.h + '"><span class="sr-kind">' + r.kind + "</span><span class=\"sr-main\"><b>" + esc(r.label) + "</b><small>" + esc(r.sub) + "</small></span></a>";
    }).join("") : '<p class="empty">Nothing matches “' + esc(q) + "”.</p>";
  }
  function moveSel(d) {
    var items = $$(".sr"); if (!items.length) return;
    sel = (sel + d + items.length) % items.length;
    items.forEach(function (el, i) { el.classList.toggle("sel", i === sel); });
    items[sel].scrollIntoView({ block: "nearest" });
  }
  function openSearch() {
    document.body.classList.add("search-open");
    $("#search").setAttribute("aria-hidden", "false");
    $("#searchInput").value = ""; runSearch();
    setTimeout(function () { $("#searchInput").focus(); }, 30);
  }
  function closeSearch() { document.body.classList.remove("search-open"); $("#search").setAttribute("aria-hidden", "true"); }

  /* ---------- global controls ---------- */
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 1800);
  }
  function setTheme(t) { document.documentElement.setAttribute("data-theme", t); save("theme", t); $("#themeBtn").textContent = t === "dark" ? "☀" : "☾"; }
  setTheme(store("theme", window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"));
  $("#themeBtn").addEventListener("click", function () { setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark"); });

  function syncAdded() { $("#addedBtn").setAttribute("aria-pressed", state.showAdded ? "true" : "false"); }
  syncAdded();
  $("#addedBtn").addEventListener("click", function () {
    state.showAdded = !state.showAdded; save("showAdded", state.showAdded ? "1" : "0"); syncAdded();
    toast(state.showAdded ? "Showing extra examples ✦" : "Showing only companies from your document");
    render({ keepScroll: true });
  });
  $("#rulesBtn").addEventListener("click", openDrawer);
  $("#drawerClose").addEventListener("click", closeDrawer);
  $("#scrim").addEventListener("click", closeDrawer);
  $("#searchBtn").addEventListener("click", openSearch);
  $("#search").addEventListener("click", function (e) { if (e.target.id === "search") closeSearch(); });
  $("#searchInput").addEventListener("input", runSearch);
  $("#searchInput").addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); moveSel(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveSel(-1); }
    else if (e.key === "Enter") { var a = $$(".sr")[sel]; if (a) { location.hash = a.getAttribute("href"); closeSearch(); } }
  });
  $("#searchResults").addEventListener("click", function (e) { if (e.target.closest(".sr")) closeSearch(); });

  document.addEventListener("keydown", function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (e.key === "Escape") {
      if (document.body.classList.contains("search-open")) return closeSearch();
      if (document.body.classList.contains("drawer-open")) return closeDrawer();
      var back = $(".back"); if (back) { location.hash = back.getAttribute("href"); return; }
      if (parse().layer) location.hash = "#/";
      return;
    }
    if (typing) return;
    if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) { e.preventDefault(); openSearch(); return; }
    var r = parse(), l = r.layer && layerById(r.layer);
    if (l && !r.bucket && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      var n = T.layers[T.layers.indexOf(l) + (e.key === "ArrowRight" ? 1 : -1)];
      if (n) location.hash = "#/" + n.id;
    }
  });

  if (ext) {
    ext.init({ T: T, esc: esc, layerById: layerById, findNode: findNode, parse: parse, openPanel: openPanel, toast: toast });
    $("#suggestBtn").addEventListener("click", function () { ext.open(); });
  } else $("#suggestBtn").hidden = true;

  window.addEventListener("hashchange", function () { render(); });
  buildIndex();
  render();
})();
