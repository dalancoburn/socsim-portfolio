// Builds the site once per fixture in tests/fixtures/ and checks the output.
// Run with: npm run test:build
//
// Each build happens in a throwaway copy of the project so the real
// src/data/portfolio.json is never touched.
import { cpSync, mkdtempSync, rmSync, symlinkSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { migratePortfolio } from '../src/utils/migrate.js';

const root = new URL('..', import.meta.url).pathname;
const fixtures = ['empty-template.json', 'legacy-v2.json', 'v3-sample.json', 'mixed.json'];
let failed = 0;

const check = (ok, msg) => {
  console.log(`  ${ok ? '✓' : '✗'} ${msg}`);
  if (!ok) failed++;
};

for (const name of fixtures) {
  console.log(`\n${name}`);
  const dir = mkdtempSync(join(tmpdir(), 'socsim-build-'));
  try {
    for (const p of ['src', 'public', 'astro.config.mjs', 'package.json']) {
      cpSync(join(root, p), join(dir, p), { recursive: true });
    }
    symlinkSync(join(root, 'node_modules'), join(dir, 'node_modules'));
    const raw = readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
    writeFileSync(join(dir, 'src/data/portfolio.json'), raw);

    try {
      execSync('npx astro build', { cwd: dir, stdio: 'pipe' });
      check(true, 'build succeeded');
    } catch (e) {
      check(false, `build failed:\n${e.stdout}\n${e.stderr}`);
      continue;
    }

    const dist = join(dir, 'dist');
    const page = (p) => (existsSync(join(dist, p)) ? readFileSync(join(dist, p), 'utf8') : null);
    const data = migratePortfolio(JSON.parse(raw));
    const isTemplate = !data.profile?.name || data.profile.name.startsWith('[');

    check(page('migrate.js')?.includes('export function migratePortfolio'), 'editor migration script published at /migrate.js');
    const home = page('index.html') ?? '';

    if (isTemplate) {
      check(home.includes('Open editor'), 'empty template shows the getting-started screen');
      continue;
    }

    for (const inv of data.investigations) {
      const detail = page(`investigations/${inv.id}/index.html`);
      check(!!detail, `investigation page /investigations/${inv.id}/`);
      if (detail && inv.title) check(detail.includes(inv.title.replace(/&/g, '&amp;')), `  …shows title "${inv.title.slice(0, 40)}"`);
      const redirect = page(`alerts/${inv.id}/index.html`) ?? '';
      check(redirect.includes(`/investigations/${inv.id}/`), `old link /alerts/${inv.id}/ redirects`);
      check(home.includes(`/investigations/${inv.id}/`), `homepage links to ${inv.id}`);
    }
    for (const b of data.bec) check(!!page(`bec/${b.id}/index.html`), `BEC page /bec/${b.id}/`);
    check(!/Invalid Date|undefined|\[object Object\]/.test(home), 'homepage has no "Invalid Date" / "undefined" / "[object Object]"');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

console.log(failed ? `\n${failed} check(s) failed` : '\nAll build checks passed');
process.exit(failed ? 1 : 0);
