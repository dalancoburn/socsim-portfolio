"""
Browser tests for the editor (public/editor.html), with GitHub's API faked.
Nothing here talks to a real repo.

Run:  npm run build && npm run test:editor
"""
import base64, json, os, sys, functools, threading, http.server, socketserver
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
FIX = ROOT / "tests" / "fixtures"
PORT = 4329
BASE = f"http://127.0.0.1:{PORT}"
SHOTS = Path(os.environ.get("SHOT_DIR", "/tmp"))

failures = 0
def check(ok, msg):
    global failures
    print(f"  {'✓' if ok else '✗'} {msg}")
    if not ok: failures += 1

def load(name): return json.loads((FIX / name).read_text())
def b64(obj): return base64.b64encode(json.dumps(obj).encode()).decode()

def strings(v, out):
    if isinstance(v, str):
        if v.strip(): out.append(v.strip())
    elif isinstance(v, list): [strings(x, out) for x in v]
    elif isinstance(v, dict): [strings(x, out) for x in v.values()]
    return out

class GitHub:
    """Fake GitHub contents API: serves `data` for GET, records PUTs."""
    def __init__(self, data, fail_first_get=False):
        self.data, self.puts, self.fail_next = data, [], fail_first_get
    def handle(self, route):
        req = route.request
        if "/contents/src/data/portfolio.json" not in req.url:
            return route.fulfill(status=404, json={"message": "Not Found"})
        if req.method == "GET":
            if self.fail_next:
                self.fail_next = False
                return route.fulfill(status=500, json={"message": "boom"})
            return route.fulfill(json={"sha": "abc123", "content": b64(self.data)})
        if req.method == "PUT":
            body = json.loads(req.post_data)
            self.puts.append(json.loads(base64.b64decode(body["content"])))
            return route.fulfill(status=200, json={"content": {"sha": "def456"}})

def open_editor(browser, gh, *, creds=True, draft=None, block_migrate=False):
    ctx = browser.new_context()
    init = ""
    if creds:
        init += "localStorage.setItem('gh_owner','tester');localStorage.setItem('gh_repo','portfolio');localStorage.setItem('gh_token','ghp_fake');"
    if draft is not None:
        init += f"localStorage.setItem('socsim_draft', {json.dumps(json.dumps(draft))});"
    if init:
        ctx.add_init_script(f"if (!sessionStorage.getItem('seeded')) {{ {init} sessionStorage.setItem('seeded','1'); }}")
    page = ctx.new_page()
    page.on("dialog", lambda d: d.accept())  # OK on every confirm()
    page.route("https://api.github.com/**", gh.handle)
    if block_migrate:
        page.route("**/migrate.js", lambda r: r.fulfill(status=404, body="nope"))
    page.goto(f"{BASE}/editor.html")
    page.wait_for_load_state("networkidle")
    page.wait_for_timeout(500)
    return ctx, page

def publish(page):
    page.click("button.js-publish >> nth=0")
    page.wait_for_timeout(1200)

def notif(page): return page.locator("#notif").inner_text()

def run():
    legacy = load("legacy-v2.json")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        print("\n1. Legacy portfolio on GitHub → editor converts → publish")
        gh = GitHub(legacy)
        ctx, page = open_editor(browser, gh)
        check(page.evaluate("typeof EasyMDE") == "function", "pinned EasyMDE loaded and passed its SRI integrity check")
        check(page.evaluate("!!window.SOCSIM_SCHEMA"), "migration script loaded from /migrate.js")
        n = page.locator('[data-type="investigation"]').count()
        check(n == len(legacy["alerts"]), f"{n} investigation blocks shown for {len(legacy['alerts'])} legacy alerts")
        check(page.locator('[data-type="bec"]').count() == len(legacy["bec"]), "BEC cases loaded")
        check("converted" in page.locator("#save-status").inner_text(), "status bar says entries were converted and need publishing")
        page.locator('[data-type="investigation"] .inv-block-header').first.click()
        page.wait_for_timeout(300)
        page.screenshot(path=str(SHOTS / "editor-legacy-converted.png"), full_page=True)
        publish(page)
        check(len(gh.puts) == 1, "publish sent exactly one write to GitHub")
        if gh.puts:
            out = gh.puts[0]
            check("alerts" not in out and out.get("schemaVersion") == 3, "published file is the new format (schemaVersion 3, no alerts key)")
            check(len(out["investigations"]) == len(legacy["alerts"]), "every legacy alert published as an investigation")
            # The editor always writes customSections (an empty list when unset) — not a change in content
            expected_bec = [{"customSections": [], **b} for b in legacy["bec"]]
            check(out["bec"] == expected_bec, "BEC cases published unchanged")
            check(out["profile"] == legacy["profile"], "profile published unchanged")
            hay = json.dumps(out["investigations"], ensure_ascii=False)
            lost = [s for a in legacy["alerts"] for s in strings(a, []) if json.dumps(s, ensure_ascii=False)[1:-1] not in hay
                    and s != "a key the editor never wrote"]
            check(not lost, "no text lost between GitHub → editor → publish" + (f" (lost: {lost[:2]})" if lost else ""))
        ctx.close()

        print("\n2. Safety: failed load + publish must never wipe GitHub")
        gh = GitHub(legacy, fail_first_get=True)
        ctx, page = open_editor(browser, gh)
        check(page.locator('[data-type="investigation"]').count() == 0, "form empty after failed load")
        page.fill("#p-name", "Someone")
        publish(page)
        check(len(gh.puts) == 0, "publish BLOCKED (legacy alerts counted as existing cases)")
        check("Publish blocked" in notif(page), "member told why")
        ctx.close()

        print("\n3. Old-format unsaved draft in the browser → restored and converted")
        gh = GitHub({"profile": legacy["profile"], "investigations": [], "bec": []})
        ctx, page = open_editor(browser, gh, draft=legacy)
        check(page.locator('[data-type="investigation"]').count() == len(legacy["alerts"]), "old-format draft restored as investigations")
        ctx.close()

        print("\n4. migrate.js unavailable → editor stops instead of guessing")
        gh = GitHub(legacy)
        ctx, page = open_editor(browser, gh, draft=legacy, block_migrate=True)
        check("could not load a required file" in notif(page), "member shown a clear error")
        page.evaluate("autosave()")
        kept = page.evaluate("JSON.parse(localStorage.getItem('socsim_draft'))")
        check(kept == legacy, "existing draft NOT overwritten by autosave")
        publish(page)
        check(len(gh.puts) == 0, "publish refused")
        ctx.close()

        print("\n5. New investigation entered through the form")
        gh = GitHub({"profile": legacy["profile"], "investigations": [], "bec": []})
        ctx, page = open_editor(browser, gh)
        page.click("text=+ Add Investigation")
        blk = page.locator('[data-type="investigation"]').last
        blk.locator('[data-f="id"]').fill("INV-001")
        blk.locator('[data-f="title"]').fill("Credential dumping on WS-FIN-04")
        blk.locator('[data-f="categorisation"]').select_option("BTP")
        blk.locator("text=+ Add Asset").click()
        blk.locator('[data-rep="assets"] [data-sub="name"]').fill("WS-FIN-04")
        blk.locator('[data-rep="assets"] [data-sub="note"]').fill("Compromised")
        blk.locator("text=+ Add Timeline Entry").click()
        blk.locator('[data-rep="timeline"] [data-sub="time"]').fill("01:22")
        blk.locator('[data-rep="timeline"] [data-sub="activity"]').fill("LSASS dumped")
        blk.locator('[data-rep="timeline"] [data-sub="detail"]').fill("`rundll32 comsvcs.dll MiniDump`")
        blk.locator('[data-f="queries"]').fill("DeviceProcessEvents\n| take 10")
        # EasyMDE field: type into its CodeMirror
        blk.locator('[data-f="summary"] + .EasyMDEContainer .CodeMirror, .EasyMDEContainer .CodeMirror').first.click()
        page.keyboard.type("Plain English summary.")
        page.screenshot(path=str(SHOTS / "editor-new-investigation.png"), full_page=True)
        publish(page)
        check(len(gh.puts) == 1, "published")
        if gh.puts:
            inv = gh.puts[0]["investigations"][0]
            check(inv["id"] == "INV-001" and inv["title"] == "Credential dumping on WS-FIN-04", "id + title saved")
            check(inv["categorisation"] == "BTP", "verdict saved")
            check(inv["affectedAssets"] == [{"name": "WS-FIN-04", "note": "Compromised"}], "affected asset saved")
            check(inv["timeline"] == [{"time": "01:22", "activity": "LSASS dumped", "detail": "`rundll32 comsvcs.dll MiniDump`"}], "timeline entry saved")
            check(inv["queries"] == "DeviceProcessEvents\n| take 10", "KQL saved with line breaks")
            check(inv["summary"] == "Plain English summary.", "Markdown summary saved")
        ctx.close()
        browser.close()

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    def guess_type(self, path):
        return "text/javascript" if str(path).endswith(".js") else super().guess_type(path)

if __name__ == "__main__":
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.TCPServer(("127.0.0.1", PORT), functools.partial(Quiet, directory=str(DIST)))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    try:
        run()
    finally:
        httpd.shutdown()
    print(f"\n{failures} check(s) failed" if failures else "\nAll editor checks passed")
    sys.exit(1 if failures else 0)
