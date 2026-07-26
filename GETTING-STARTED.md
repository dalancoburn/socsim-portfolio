# SOCSIM Member Portfolio — Getting Started

*The SOC Simulation Project · [skool.com/socsim](https://skool.com/socsim/about)*

Your portfolio is a personal website that documents every alert investigation and BEC case drop you complete in the SOCSIM lab — your methodology, your findings, your tooling. It shows the work behind the cert.

You fill it in through a form-based editor in your browser. **No coding required.**

---

## Part 1 — One-time setup

### Step 1: Create your portfolio repo
1. Go to **github.com/dalancoburn/socsim-portfolio**
2. Click the green **"Use this template"** button
3. Click **"Create a new repository"**
4. Name it whatever you like (e.g. `socsim-portfolio`)
5. Set it to **Public**
6. Click **"Create repository"**

### Step 2: Enable GitHub Pages
1. In your new repo, click **Settings**
2. In the left sidebar, click **Pages**
3. Under *Build and deployment*, set **Source** to **GitHub Actions**
4. Wait ~60 seconds — your site goes live at:
   `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

### Step 3: Create a Personal Access Token (PAT)
This lets the editor save your work directly to your repo. One-time setup.

1. Go to **github.com/settings/tokens**
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name it something like `SOCSIM Portfolio Editor`
4. Set expiration to 90 days (or "No expiration")
5. Tick the **repo** scope
6. Click **"Generate token"**
7. **Copy the token now** — GitHub only shows it once. It looks like `ghp_xxxxxxxxxxxxxxxxxxxx`

### Step 4: Connect your editor
1. Go to `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/editor.html`
2. Open **⚙ GitHub Settings** and fill in your username, repo name, and the token from Step 3
3. Click **Save settings**
4. Click **⬇ Load from GitHub** to pull in your current data

You're connected — this editor is now yours.

---

## Part 2 — Your profile

Fill in the Profile section:

| Field | Notes |
|---|---|
| Full Name | Your real name |
| Role / Title | e.g. Security Analyst · Blue Team |
| Tagline | One sentence — your focus and goals |
| Location | City, Country |
| Photo URL | Optional — direct link to a profile photo |
| LinkedIn / GitHub / Email | Optional contact links |

Pick a **theme**: Operator (default), Terminal, Midnight, Obsidian, Arctic, or Crimson.

Click **⬆ Publish to GitHub** — your profile goes live in ~60 seconds.

---

## Part 3 — Adding investigations

Every time you complete an investigation in the SOCSIM lab:

1. Open your editor
2. Click **⬇ Load from GitHub** (loads existing work so nothing gets overwritten)
3. Click **+ Add Alert Investigation** or **+ Add BEC Case Drop**
4. Fill in the fields
5. Click **⬆ Publish to GitHub** — live in ~60 seconds

### Alert Investigation fields
Case ID (`ALT-001`, `ALT-002`, …) · Alert Name · Alert ID · Date · Severity · Host/Account · Date & Time (with timezone) · What triggered it · Why it triggered · What happened · Evidence · Was it successful · Verdict + reason · Investigation steps · KQL queries · Categorisation (TP / BTP / FP) · Escalation · Containment · Alert tuning notes · Lessons learned · Tools used · Custom sections (optional, e.g. MITRE ATT&CK mapping) · SOCSIM Verified checkbox

### BEC Case Drop fields
Case ID (`BEC-001`, `BEC-002`, …) · Case Name · Case Reference · Affected Account · Incident dates · Investigation date · PDF Report URL (optional) · Attack Narrative (write this last, for a non-technical reader) · Timeline (time / activity / detail entries) · Initial Access · Unauthorised Activity · Data Access · Lessons Learned · Tools Used · Custom sections (optional) · SOCSIM Verified checkbox

---

## Part 4 — Formatting your write-ups

All narrative fields support Markdown — use the toolbar above each field, no syntax memorization needed:

| Button | Does |
|---|---|
| **B** | Bold |
| *I* | Italic |
| ≡ | Bullet list |
| 1. | Numbered list |
| `< >` | Inline code — good for IPs, filenames, commands |
| 👁 | Preview how it'll look live |

Or type it directly: `**bold**`, `` `code` ``, `- bullet`, `1. numbered`.

---

## Part 5 — Adding screenshots

**Easiest way:** click into a write-up field, hit the **camera icon (📷)** in its toolbar, pick your image (.png/.jpg, up to 10 MB). The editor uploads it to your repo and inserts it automatically. Requires your GitHub settings to be saved (Part 1, Step 4).

**Manual way**, if you'd rather do it yourself:
1. Go to your repo on GitHub → `src/assets/` (create the folder if needed)
2. **Add file → Upload files**, drag your screenshot in, commit
3. Click the uploaded file → **Raw** → copy the URL
4. Paste it into any narrative field: `![description](paste-url-here)`

---

## Part 6 — Editor conveniences

- **Collapsible cases** — loaded investigations collapse to a one-line summary (ID — name) so a long portfolio stays scannable. Click a case to expand it.
- **Save status** — the action bar shows *unpublished changes*, *draft saved [time]*, or *all changes published*, so you always know if something needs publishing.
- **Portfolio stats** — your published site auto-shows a stats strip (alert count, BEC count, lab-verified count, unique tools) once you have investigations live.

---

## Part 7 — Keeping your portfolio up to date

When the SOCSIM template gets new features or styling, pull them in without touching your data:

1. Open your editor
2. Click **↻ Update template** in the header
3. Confirm — your investigations are safe
4. Site rebuilds in ~60 seconds with the new features

Your data (`portfolio.json`) is never touched by an update — only the site code changes.

---

## Case ID convention

Keep IDs consistent so portfolios stay sortable and compatible with the future central SOCSIM member directory:

- Alert investigations: `ALT-001`, `ALT-002`, `ALT-003` …
- BEC case drops: `BEC-001`, `BEC-002`, `BEC-003` …

---

## Quick reference

| | |
|---|---|
| Your portfolio | `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/` |
| Your editor | `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/editor.html` |
| Your repo | `https://github.com/YOUR-USERNAME/YOUR-REPO-NAME` |
| To update | Editor → Load from GitHub → make changes → Publish |
| To check a deploy | Repo → **Actions** tab |
| Something looks wrong | Hard-refresh (Ctrl+Shift+R / Cmd+Shift+R), wait 60s, retry |

---

Questions? Head to the SOCSIM community: **[skool.com/socsim/about](https://skool.com/socsim/about)**
