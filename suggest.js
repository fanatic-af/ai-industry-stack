/* AI Industry Stack: community suggestions.
   Visitors fill in a short form; it opens a pre-filled GitHub issue on the repo in config.js.
   When the owner adds the "approved" label, a GitHub Action appends the entry to community-data.js
   and republishes the site. This file shows those approved entries on the map. */
(function () {
  "use strict";

  var CFG = window.STACK_CONFIG || {};
  var REPO = CFG.repo || "";
  var api = null;
  var KINDS = { company: "A company", bucket: "A new bucket", layer: "A new layer" };

  /* ---------- show approved entries on the map ---------- */
  function liSlug(url) {
    var m = String(url || "").match(/linkedin\.com\/company\/([^/?#]+)/i);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function communityCode(layer, id) { return (layer.isApps ? "A" : layer.id.slice(1)) + ".C" + id; }

  function merge(T, list) {
    T.proposedLayers = [];
    var order = { bucket: 0, company: 1, layer: 2 };
    list.slice().sort(function (a, b) { return order[a.kind] - order[b.kind]; }).forEach(function (r) {
      var l = r.layer && api.layerById(r.layer);
      if (r.kind === "layer") T.proposedLayers.push(r);
      else if (r.kind === "bucket" && l) {
        l.buckets.push({ code: communityCode(l, r.id), name: r.name, desc: r.note || "", companies: [], community: true, by: r.by });
      } else if (r.kind === "company" && l) {
        var trail = api.findNode(l.buckets, r.bucket, []);
        if (!trail) return;
        var node = trail[trail.length - 1];
        var ind = (r.industries || []).filter(function (d) { return T.industries.indexOf(d) >= 0; });
        (node.companies = node.companies || []).push({
          name: r.name, slug: liSlug(r.linkedin), q: r.name, community: true, by: r.by,
          ind: l.isApps ? (ind.length ? ind : ["Horizontal"]) : undefined
        });
      }
    });
  }

  /* ---------- the Suggest form ---------- */
  function flatBuckets(layer) {
    var out = [];
    (function walk(nodes, depth) {
      (nodes || []).forEach(function (n) { out.push({ code: n.code, label: n.code + " " + n.name, depth: depth }); walk(n.children, depth + 1); });
    })(layer.buckets, 0);
    return out;
  }
  function layerOptions(sel) {
    return api.T.layers.slice().reverse().map(function (l) {
      return '<option value="' + l.id + '"' + (l.id === sel ? " selected" : "") + ">" + l.id + " " + api.esc(l.name) + "</option>";
    }).join("");
  }
  function bucketOptions(layerId, sel) {
    var l = api.layerById(layerId); if (!l) return "";
    return flatBuckets(l).map(function (b) {
      return '<option value="' + api.esc(b.code) + '"' + (b.code === sel ? " selected" : "") + ">" + "   ".repeat(b.depth) + api.esc(b.label) + "</option>";
    }).join("");
  }
  function findListed(name) {
    var n = name.trim().toLowerCase(), hit = null;
    api.T.layers.forEach(function (l) {
      (function walk(nodes) {
        (nodes || []).forEach(function (x) {
          (x.companies || []).forEach(function (c) { if (!hit && c.name.toLowerCase() === n) hit = l.id + " › " + x.code + " " + x.name; });
          walk(x.children);
        });
      })(l.buckets);
    });
    return hit;
  }

  function issueUrl(kind, fields) {
    var p = ["template=suggest-" + kind + ".yml", "title=" + encodeURIComponent(fields.title)];
    Object.keys(fields).forEach(function (k) {
      if (k !== "title" && fields[k]) p.push(k + "=" + encodeURIComponent(fields[k]));
    });
    return "https://github.com/" + REPO + "/issues/new?" + p.join("&");
  }

  function open(pre) {
    pre = pre || {};
    var r = api.parse();
    var here = r.layer && api.layerById(r.layer);
    var layerId = pre.layer || (here ? here.id : "L10");
    var bucket = pre.bucket || (here && here.id === layerId ? r.bucket : "") || "";
    var kind = pre.kind || "company";
    api.openPanel(
      "<h2>Suggest an addition</h2>" +
      '<p class="muted">Know a company that belongs on the map, or a bucket or layer that is missing? Suggestions go to the curator as a GitHub issue, and appear here once approved.</p>' +
      (REPO ? "" : '<p class="note warn">Suggestions are not switched on for this copy of the site. Set the repo in config.js.</p>') +
      '<form class="suggest" id="suggestForm" novalidate>' +
      '<div class="seg" role="radiogroup" aria-label="What are you suggesting?">' +
      Object.keys(KINDS).map(function (k) {
        return '<label><input type="radio" name="kind" value="' + k + '"' + (k === kind ? " checked" : "") + "><span>" + KINDS[k] + "</span></label>";
      }).join("") + "</div>" +
      '<label class="f" data-for="company bucket"><span>Layer</span><select name="layer">' + layerOptions(layerId) + "</select></label>" +
      '<label class="f" data-for="company"><span>Bucket</span><select name="bucket">' + bucketOptions(layerId, bucket) + "</select></label>" +
      '<label class="f"><span data-label="name">Name</span><input name="name" maxlength="80" autocomplete="off"></label>' +
      '<p class="form-hint" id="dupHint"></p>' +
      '<label class="f" data-for="company"><span>LinkedIn page <em>optional</em></span><input name="linkedin" type="url" inputmode="url" placeholder="https://www.linkedin.com/company/…" maxlength="200"></label>' +
      '<label class="f" data-for="company"><span>Website <em>optional</em></span><input name="website" type="url" inputmode="url" placeholder="https://…" maxlength="200"></label>' +
      '<div class="f" data-for="company" data-apps><span>Industry <em>pick any that apply</em></span><div class="checks">' +
      api.T.industries.map(function (d) { return '<label><input type="checkbox" name="industries" value="' + d + '"><span>' + d + "</span></label>"; }).join("") + "</div></div>" +
      '<label class="f"><span data-label="why">Why it belongs here</span><textarea name="why" maxlength="600" rows="3"></textarea></label>' +
      '<label class="f"><span>Credit me as <em>optional, shown on the site</em></span><input name="by" maxlength="60" autocomplete="name"></label>' +
      '<p class="form-msg" id="suggestMsg" role="status"></p>' +
      '<button class="btn primary" type="submit"' + (REPO ? "" : " disabled") + ">Continue on GitHub ↗</button>" +
      '<p class="muted small">You will need a free GitHub account to submit. The form opens with everything filled in; just press “Create”.</p>' +
      "</form>"
    );
    var f = document.getElementById("suggestForm");
    var msg = document.getElementById("suggestMsg");
    function say(t, ok) { msg.textContent = t; msg.className = "form-msg " + (t ? (ok ? "ok" : "bad") : ""); }
    function sync() {
      var k = f.kind.value, l = api.layerById(f.layer.value);
      Array.prototype.forEach.call(f.querySelectorAll("[data-for]"), function (el) {
        el.hidden = el.getAttribute("data-for").split(" ").indexOf(k) < 0 || (el.hasAttribute("data-apps") && !(l && l.isApps));
      });
      f.querySelector('[data-label="name"]').textContent = { company: "Company or product name", bucket: "Name of the new bucket", layer: "Name of the new layer" }[k];
      f.querySelector('[data-label="why"]').innerHTML = k === "company" ? "Why it belongs here <em>optional</em>" : "What goes in it, and how it differs from what is already on the map";
      dup();
    }
    function dup() {
      var hit = f.kind.value === "company" && f.name.value.trim() && findListed(f.name.value);
      document.getElementById("dupHint").textContent = hit ? "Already on the map in " + hit + ". You can still suggest it for another bucket." : "";
    }
    Array.prototype.forEach.call(f.kind, function (el) { el.addEventListener("change", sync); });
    f.layer.addEventListener("change", function () { f.bucket.innerHTML = bucketOptions(f.layer.value); sync(); });
    f.name.addEventListener("input", dup);
    sync();

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var k = f.kind.value, name = f.name.value.trim(), why = f.why.value.trim();
      var li = f.linkedin.value.trim(), site = f.website.value.trim();
      var l = api.layerById(f.layer.value);
      if (!name) return say("Please enter a name.");
      if (k !== "company" && why.length < 10) return say("Please describe the new " + k + " in a sentence or two.");
      if (k === "company" && li && !/^https:\/\/([a-z]+\.)?linkedin\.com\//i.test(li)) return say("The LinkedIn link should start with https://www.linkedin.com/");
      if (k === "company" && site && !/^https?:\/\/\S+$/i.test(site)) return say("The website should start with https://");
      say("");
      var fields = { by: f.by.value.trim(), why: why };
      if (k === "company") {
        fields.title = "Add " + name + " to " + f.bucket.value;
        fields.name = name; fields.layer = l.id; fields.bucket = f.bucket.value; fields.linkedin = li; fields.website = site;
        if (l.isApps) fields.industries = Array.prototype.filter.call(f.industries, function (c) { return c.checked; }).map(function (c) { return c.value; }).join(", ");
      } else if (k === "bucket") {
        fields.title = "New bucket in " + l.id + ": " + name; fields.name = name; fields.layer = l.id;
      } else {
        fields.title = "New layer: " + name; fields.name = name;
      }
      window.open(issueUrl(k, fields), "_blank", "noopener");
      say("GitHub opened in a new tab. Press “Create” there to send it.", true);
    });
  }

  /* ---------- extras shown in the views ---------- */
  function homeExtra() {
    var p = api.T.proposedLayers || [];
    var list = p.length ? '<ul class="proposal-list">' + p.map(function (r) {
      return "<li><b>" + api.esc(r.name) + "</b>" + (r.note ? "<span>" + api.esc(r.note) + "</span>" : "") + (r.by ? "<em>suggested by " + api.esc(r.by) + "</em>" : "") + "</li>";
    }).join("") + "</ul>" : "";
    return '<div class="community">' +
      '<div><h3>Help grow the map</h3><p class="muted">Spot a missing company, bucket or layer? Suggest it, and it appears here once approved.' +
      (p.length ? " Layers proposed by visitors are listed below; they are not part of the stack yet." : "") + "</p></div>" +
      '<button class="btn primary" data-suggest>＋ Suggest an addition</button>' + list + "</div>";
  }

  window.AIStackExt = {
    init: function (a) { api = a; merge(api.T, window.COMMUNITY || []); },
    open: open,
    homeExtra: homeExtra
  };
})();
