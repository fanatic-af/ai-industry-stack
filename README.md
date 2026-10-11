# AI Industry Stack

An interactive website for the **AI Industry Taxonomy**: 11 layers (L0 to L10), their buckets and sub-buckets, and the companies in each, every one linked to LinkedIn.

**Live site:** https://fanatic-af.github.io/ai-industry-stack/

## Open it

Double-click `index.html`. It runs straight from the folder: no install, no build step, no server.
(Fonts load from Google Fonts when you are online; offline it falls back to system fonts.)

## What you can do

- **Home:** the 11 layers as a list. Hover a layer to peek inside, click to dive in: the list glides into the left sidebar.
- **Layer view:** every bucket as a card with its companies. Click a bucket (or sub-bucket) title to zoom into it.
- **Company chips and tiles:** click to open the company's LinkedIn page in a new tab.
- **L10 Applications:** the tie-breaker strip (Act → Interact → Retrieve → Judge → Transform → Create) and an **F1 Industry filter**. Pick one or more industries; buckets with no match fade or hide.
- **Search:** press `/` (or ⌘K / Ctrl+K) to find any company, product or bucket and jump straight to it.
- **Rules:** the five classification rules and the F1 to F10 filter tags, in a side drawer.
- **✦ Extra examples:** examples I added where your document had none (or to make the industry filter useful). Toggle them off to see only the companies from your document.
- **＋ Suggest:** visitors can suggest a company, a new bucket or a new layer. Approved suggestions show on the map with a small ● marker and "suggested by".
- **Keyboard:** `←` / `→` move between layers, `Esc` goes up one level. Light / dark theme toggle top right.

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page shell |
| `styles.css` | All styling and animations |
| `app.js` | Rendering, routing (URL hash such as `#/L4/4.2`), filter, search |
| `data.js` | **The taxonomy itself.** Edit this to add companies, buckets or industry tags |
| `community-data.js` | Approved visitor suggestions, written by the GitHub Action (editable by hand) |
| `suggest.js` | The Suggest form, and shows approved suggestions on the map |
| `config.js` | The GitHub repo that suggestions are filed in |
| `.github/` | Suggestion issue forms, the deploy workflow and the approve-and-publish workflow |

### Adding a company

In `data.js`, add a short string to a bucket's `L(...)` list:

```js
"Company Name"                    // plain name
"Company Name@linkedin-slug"      // links to linkedin.com/company/linkedin-slug
"Product~Parent Company"          // a product of a bigger company (links to the parent's page)
"Startup?search words"            // what to search LinkedIn for when no exact page is known
"+Something"                      // leading + marks an example that was not in your original document (✦)
"App#Healthcare,Insurance"        // L10 only: F1 industry tags (default Horizontal)
```

Parts combine, e.g. `"+Rufus~Amazon#Retail"`.

## LinkedIn links to check

LinkedIn could not be reached from where this was built, so no link was checked live.
Companies whose page address is known (the `SLUGS` list at the top of `data.js`, or an `@slug` on the entry) open that page directly. Everything else opens a **LinkedIn company search** for the name, which always finds the company but is one click longer. To upgrade one, copy the `linkedin.com/company/<slug>` part from its real page into `SLUGS`.

## Reviewing suggestions

1. A visitor clicks **Suggest** on the site, fills in the form and is taken to a pre-filled GitHub issue (they need a free GitHub account).
2. You get a GitHub notification. Read it, and fix anything in the issue text if needed (for example the bucket code).
3. **Approve:** add the `approved` label. The *Publish approved suggestion* Action checks the entry, adds it to `community-data.js`, republishes the site, comments and closes the issue. If something is wrong (an unknown bucket, a duplicate), it comments what to fix and removes the label instead.
4. **Reject:** close the issue.

To remove something later, delete its entry from `community-data.js` and commit; the site redeploys on every push to `main`.

## Hosting

GitHub Pages serves the repo as is (Settings → Pages → Source: GitHub Actions). The *Deploy site* workflow publishes on every push to `main`.
