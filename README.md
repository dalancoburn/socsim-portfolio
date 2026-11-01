# SOCSIM Member Portfolio

A personal case-study portfolio for WDLabs / SOCSIM members. You own the content; the brand system and layout are locked.

---

## Member setup — four steps

**1. Create your repo**
Click **"Use this template"** (green button, top-right) → name it anything → create repository.

**2. Enable GitHub Pages**
Go to your repo → **Settings** → **Pages** → under *Build and deployment* set:
- Source: **GitHub Actions**

That's it — the deploy workflow in this repo does the rest. Your site goes live at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/` about 60 seconds after the first push.

**3. Create a GitHub Personal Access Token**
Go to **github.com → Settings → Developer settings → Personal access tokens → Tokens (classic)** → Generate new token.
- Name: `SOCSIM Portfolio Editor`
- Expiry: 90 days (or no expiry)
- Scope: tick **repo**
- Copy the token — you only see it once.

**4. Set up the editor (one time)**
Once your site is live, open your editor at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/editor.html
```
- Click **⚙ GitHub Settings**, enter your username, repo name, and the token from step 3 → Save.
- Click **⬇ Load from GitHub** to pull in the existing portfolio data.
- Fill in your **Profile** and add your first investigation.
- Click **⬆ Publish to GitHub** — your site rebuilds in ~60 seconds.

---

## Adding a new investigation (ongoing)

Every time you complete an investigation in the SOCSIM lab:

1. Open **`https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/editor.html`**
2. Click **⬇ Load from GitHub** — loads all your existing work
3. Click **+ Add Investigation** or **+ Add BEC Case Drop**
4. Fill in the fields — Markdown is supported in all narrative sections (bold, bullets, code blocks, images)
5. Click **⬆ Publish to GitHub**
6. Wait ~60 seconds → live

That's it. No JSON editing, no file downloads, no command line.

---

## Adding screenshots to write-ups

Click into a write-up field, hit the **camera icon (📷)** in its toolbar, and pick your image — the editor uploads it to your repo and inserts it automatically (requires your saved GitHub settings).

Manual alternative:
1. In your GitHub repo, navigate to `src/assets/` (create the folder if it doesn't exist)
2. Upload your screenshot file via drag-and-drop → commit
3. Click the file → click **Raw** → copy the URL
4. In the editor, paste it into any narrative field as: `![description](url)`

---

## Schema reference

`src/data/portfolio.json` — keep this schema unchanged so portfolios stay compatible with the future WDLabs directory.

**Older formats.** Before schema v3, write-ups were stored as `alerts[]`. Member data is never rewritten by a template update, so the site and editor both run every portfolio through `src/utils/migrate.js` (served to the editor at `/migrate.js`), which converts legacy alerts into investigations without dropping any field. Old `/alerts/<id>/` links redirect to `/investigations/<id>/`. Change the schema only by adding a new migration step there, with tests.

| Field | Type | Notes |
|---|---|---|
| `profile.name` | string | Full name |
| `profile.role` | string | Title / team |
| `profile.tagline` | string | One sentence |
| `profile.location` | string | City, Country |
| `profile.photo` | string | Direct image URL, or empty |
| `profile.theme` | string | `operator` (default), `terminal`, `midnight`, `obsidian`, `arctic`, `crimson` |
| `profile.links.linkedin` | string | URL or empty |
| `profile.links.github` | string | URL or empty |
| `profile.links.email` | string | Email address or empty |
| `schemaVersion` | number | `3` — written by the editor; older files have none |
| `investigations[].id` | string | Unique, URL-safe — e.g. `INV-001` |
| `investigations[].title` | string | Short descriptive title |
| `investigations[].reference` | string | Optional — e.g. the Defender incident or alert name |
| `investigations[].date` | string | ISO date investigated (used for sorting) |
| `investigations[].severity` | string | `Critical` / `High` / `Medium` / `Low` |
| `investigations[].categorisation` | string | Verdict: `TP` / `BTP` / `FP` |
| `investigations[].summary` | string | Plain-English summary, shown on the homepage card (Markdown ok) |
| `investigations[].affectedAssets[]` | `{name, note}` | Devices, servers, accounts, mailboxes… |
| `investigations[].whatHappened` | string | Main write-up (Markdown ok) |
| `investigations[].timeline[]` | `{time, activity, detail}` | Chronological entries; `detail` is Markdown |
| `investigations[].investigation` | string | Pivots, hunting, leads followed (Markdown ok) |
| `investigations[].queries` | string | Raw KQL, line breaks preserved |
| `investigations[].impact` / `verdictJustification` / `response` / `lessonsLearned` | string | Markdown ok |
| `investigations[].tools[]` | string[] | Tool names |
| `investigations[].customSections[]` | `{title, content}` | Optional member-defined sections (Markdown) |
| `investigations[].verified` | boolean | `true` = SOCSIM lab verified |
| `bec[].id` | string | Unique, URL-safe — e.g. `BEC-001` |
| `bec[].caseName` / `caseReference` | string | Title + WDLabs reference |
| `bec[].affectedAccount` | string | Compromised account |
| `bec[].incidentDateFrom` / `incidentDateTo` / `investigationDate` | string | ISO dates |
| `bec[].attackNarrative` | string | Plain-English summary (Markdown ok) |
| `bec[].timeline[]` | `{time, activity, detail}` | Chronological entries |
| `bec[].initialAccess` / `unauthorisedActivity` / `dataAccess` | string | Findings 3.1–3.3 (Markdown ok) |
| `bec[].lessonsLearned` | string | Markdown ok |
| `bec[].tools[]` | string[] | Tool names |
| `bec[].pdfUrl` | string | Optional hosted PDF report |
| `bec[].customSections[]` | `{title, content}` | Optional member-defined sections (Markdown) |
| `bec[].verified` | boolean | `true` = SOCSIM lab verified |

---

## Local development

Requires Node 18+.

```bash
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # static output → dist/
npm run preview    # preview the build
```

### Tests

```bash
npm test             # migration unit tests — incl. "no member text is ever lost"
npm run test:build   # builds the site against every file in tests/fixtures/ and checks the pages
npm run build && npm run test:editor   # drives the real editor in headless Chromium, GitHub API faked
```

`test:editor` needs Python Playwright (the script points at a local venv — adjust the path in `package.json` for your machine). Add a fixture to `tests/fixtures/` for any new data shape you need to support.

---

## Case ID convention

Investigations: `INV-001`, `INV-002`, … BEC case drops: `BEC-001`, `BEC-002`, … (older `ALT-` IDs carry over unchanged)
IDs become URLs, so stick to letters, numbers, dashes, dots and underscores — the editor enforces this on publish. This keeps IDs unique and sortable across the future central directory.

---

## Brand rules (read-only)

Members control **content only**. Layout, fonts, colours, and component structure are fixed by the template. Do not edit files in `src/components/`, `src/layouts/`, or `src/styles/`.
