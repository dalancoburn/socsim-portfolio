# SOCSIM Member Portfolio

A personal case-study portfolio for WDLabs / SOCSIM members. You own the content; the brand system and layout are locked.

---

## Member setup — four steps

**1. Create your repo**
Click **"Use this template"** (green button, top-right) → name it anything → create repository.

**2. Enable GitHub Pages**
Go to your repo → **Settings** → **Pages** → under *Build and deployment* set **Source: GitHub Actions** → save.

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
3. Click **+ Add Alert Investigation** or **+ Add BEC Case Drop**
4. Fill in the fields — Markdown is supported in all narrative sections (bold, bullets, code blocks, images)
5. Click **⬆ Publish to GitHub**
6. Wait ~60 seconds → live

That's it. No JSON editing, no file downloads, no command line.

---

## Adding screenshots to write-ups

1. In your GitHub repo, navigate to `src/assets/` (create the folder if it doesn't exist)
2. Upload your screenshot file via drag-and-drop → commit
3. Click the file → click **Raw** → copy the URL
4. In the editor, paste it into any narrative field as: `![description](url)`

---

## Schema reference

`src/data/portfolio.json` — keep this schema unchanged so portfolios stay compatible with the future WDLabs directory.

| Field | Type | Notes |
|---|---|---|
| `profile.name` | string | Full name |
| `profile.role` | string | Title / team |
| `profile.tagline` | string | One sentence |
| `profile.location` | string | City, Country |
| `profile.photo` | string | Direct image URL, or empty |
| `profile.links.linkedin` | string | URL or empty |
| `profile.links.github` | string | URL or empty |
| `profile.links.email` | string | Email address or empty |
| `cases[].id` | string | e.g. `BEC-2024-001` |
| `cases[].title` | string | Incident title |
| `cases[].summary` | string | 2–3 sentence overview |
| `cases[].alert` | string | Alert trigger description |
| `cases[].methodology` | string | e.g. `PICERL` |
| `cases[].timeline[]` | `{time, event}` | Chronological entries |
| `cases[].rootCause` | string | Technical explanation |
| `cases[].containment` | string | Remediation actions |
| `cases[].iocs[]` | `{type, value, context}` | Indicators of Compromise |
| `cases[].detections[]` | string[] | New detection rules / controls |
| `cases[].tools[]` | string[] | Tool names |
| `cases[].verified` | boolean | `true` = SOCSIM lab verified |

---

## Local development

Requires Node 18+.

```bash
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # static output → dist/
npm run preview    # preview the build
```

---

## Case ID convention

Use the pattern `TYPE-YEAR-NNN` — e.g. `BEC-2025-001`, `RANSOMWARE-2025-002`. This keeps IDs unique and sortable across the future central directory.

---

## Brand rules (read-only)

Members control **content only**. Layout, fonts, colours, and component structure are fixed by the template. Do not edit files in `src/components/`, `src/layouts/`, or `src/styles/`.
