// Turns an approved suggestion issue into an entry in community-data.js.
// Run by .github/workflows/publish-suggestion.yml when the "approved" label is added.
// The issue text comes from the public, so everything is validated and stored as plain JSON data.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = process.cwd();
const out = (k, v) => process.env.GITHUB_OUTPUT && fs.appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
const commentFile = path.join(process.env.RUNNER_TEMP || "/tmp", "suggestion-comment.md");

function load(file, key) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), ctx, { timeout: 2000 });
  return ctx.window[key];
}

// Issue forms render as "### <label>\n\n<value>" blocks.
const LABELS = {
  "Company or product name": "name", "Name of the new bucket": "name", "Name of the new layer": "name",
  "Layer": "layer", "Bucket": "bucket", "LinkedIn page": "linkedin", "Website": "website",
  "Industries": "industries", "Why it belongs here": "why",
  "What goes in it, and how it differs from what is already on the map": "why", "Credit me as": "by"
};
export function parseIssueBody(body) {
  const fields = {};
  const parts = String(body || "").replace(/\r\n/g, "\n").split(/^###[ \t]+(.+)$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const id = LABELS[parts[i].trim()];
    if (!id) continue;
    const v = parts[i + 1].trim();
    fields[id] = v === "_No response_" ? "" : v;
  }
  return fields;
}

const clean = (s, max) => String(s || "").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

function walk(nodes, fn) { (nodes || []).forEach((n) => { fn(n); walk(n.children, fn); }); }

export function buildEntry(issue, T, community) {
  const labels = (issue.labels || []).map((l) => (typeof l === "string" ? l : l.name));
  const f = parseIssueBody(issue.body);
  const kind = ["company", "bucket", "layer"].find((k) => labels.includes(k)) || (f.bucket ? "company" : f.layer ? "bucket" : "layer");
  const errors = [];

  const name = clean(f.name, 80);
  if (!name) errors.push("The name is empty.");
  const entry = { id: issue.number, kind, name };

  let layer = null;
  if (kind !== "layer") {
    const lid = clean(f.layer, 5).toUpperCase();
    layer = T.layers.find((l) => l.id === lid);
    if (!layer) errors.push(`"${clean(f.layer, 20)}" is not a layer id. Use L0 to L10.`);
    else entry.layer = layer.id;
  }

  if (kind === "company" && layer) {
    const code = clean(f.bucket, 20);
    const codes = new Map();
    walk(layer.buckets, (n) => codes.set(n.code.toLowerCase(), n));
    community.filter((c) => c.kind === "bucket" && c.layer === layer.id && c.id !== issue.number)
      .forEach((c) => codes.set(((layer.isApps ? "A" : layer.id.slice(1)) + ".C" + c.id).toLowerCase(), { code: (layer.isApps ? "A" : layer.id.slice(1)) + ".C" + c.id, companies: [] }));
    const node = codes.get(code.toLowerCase());
    if (!node) errors.push(`"${code}" is not a bucket in ${layer.id}. Check the bucket code on the site.`);
    else {
      entry.bucket = node.code;
      const taken = (node.companies || []).some((c) => c.name.toLowerCase() === name.toLowerCase()) ||
        community.some((c) => c.id !== issue.number && c.kind === "company" && c.layer === layer.id && c.bucket === node.code && c.name.toLowerCase() === name.toLowerCase());
      if (taken) errors.push(`${name} is already listed in ${node.code}.`);
    }
    const li = clean(f.linkedin, 200);
    if (li) { if (/^https:\/\/([a-z]+\.)?linkedin\.com\/\S+$/i.test(li)) entry.linkedin = li; else errors.push("The LinkedIn link must start with https://www.linkedin.com/"); }
    const site = clean(f.website, 200);
    if (site) { if (/^https?:\/\/\S+$/i.test(site)) entry.website = site; else errors.push("The website must start with https://"); }
    if (layer.isApps) {
      const wanted = clean(f.industries, 300).toLowerCase().split(/\s*,\s*/).filter(Boolean);
      const ind = T.industries.filter((d) => wanted.includes(d.toLowerCase()));
      entry.industries = ind.length ? ind : ["Horizontal"];
    }
  }

  if (kind === "bucket" && layer && community.some((c) => c.id !== issue.number && c.kind === "bucket" && c.layer === layer.id && c.name.toLowerCase() === name.toLowerCase()))
    errors.push(`A bucket called ${name} was already added to ${layer.id}.`);

  const why = clean(f.why, 600);
  if (kind !== "company" && why.length < 10) errors.push("Please describe the new " + kind + " in a sentence or two.");
  if (why) entry.note = why;
  const by = clean(f.by, 60);
  if (by) entry.by = by;
  entry.date = new Date().toISOString().slice(0, 10);
  return { entry, errors };
}

export function writeCommunity(file, list) {
  fs.writeFileSync(file,
    "/* Approved community suggestions. The \"Publish approved suggestion\" GitHub Action appends to this list;\n" +
    "   you can also edit or remove entries by hand. */\n" +
    "window.COMMUNITY = " + JSON.stringify(list, null, 2) + ";\n");
}

function main() {
  const event = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  const issue = event.issue;
  const T = load("data.js", "TAXONOMY");
  const community = load("community-data.js", "COMMUNITY") || [];
  const { entry, errors } = buildEntry(issue, T, community);

  if (errors.length) {
    fs.writeFileSync(commentFile, "I could not publish this suggestion yet:\n\n" + errors.map((e) => "- " + e).join("\n") +
      "\n\nEdit the issue to fix it, then add the `approved` label again.");
    out("ok", "false"); out("changed", "false");
    return;
  }
  const list = community.filter((c) => c.id !== entry.id).concat([entry]);
  writeCommunity(path.join(root, "community-data.js"), list);
  const where = entry.kind === "company" ? `${entry.layer} › ${entry.bucket}` : entry.kind === "bucket" ? entry.layer : "the proposed layers list on the home page";
  fs.writeFileSync(commentFile, `Approved and published: **${entry.name}** now appears in ${where}. The site updates within a couple of minutes.`);
  out("ok", "true"); out("changed", "true");
}

if (import.meta.url === `file://${process.argv[1]}`) main();
