# SOCSIM Member Portfolio

A personal case-study portfolio for WDLabs / SOCSIM members. You own the content; the brand system and layout are locked.

---

## Member setup — five steps

**1. Create your repo**
Click **"Use this template"** (green button, top-right) → name it anything → create repository.

**2. Enable GitHub Pages**
Go to your repo → **Settings** → **Pages** → under *Build and deployment* set **Source: GitHub Actions** → save.

**3. Fill in your portfolio**
Open `editor.html` in your browser (double-click the file — no server needed).
- Fill in your **Profile** (name, role, tagline, links).
- Add one or more **Case Studies** using the form.
- Click **⬇ Download portfolio.json**.

**4. Upload your data**
In your repo on GitHub:
- Navigate to `src/data/`
- Click `portfolio.json`
- Click the **pencil icon** (Edit)
- Click the **three dots → Upload file** — drag your downloaded `portfolio.json` onto the page
- Scroll down → click **Commit changes**

**5. Wait ~60 seconds**
GitHub Actions builds and deploys automatically. Your portfolio is live at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```
(Check **Actions** tab for build status.)

---

## Updating your portfolio

Re-open `editor.html` → click **↑ Load existing portfolio.json** → make changes → download the new file → repeat step 4.

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
