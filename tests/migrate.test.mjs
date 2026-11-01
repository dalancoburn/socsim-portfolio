// Run with: npm test   (Node's built-in test runner — no dependencies)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { migratePortfolio, alertToInvestigation, countEntries, SCHEMA_VERSION } from '../src/utils/migrate.js';

const fixture = (name) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));

/** Every non-empty string anywhere inside a value (recursively). */
function strings(v, out = []) {
  if (typeof v === 'string') { if (v.trim()) out.push(v.trim()); }
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') Object.values(v).forEach((x) => strings(x, out));
  return out;
}

test('no data loss: every piece of text in a legacy alert survives migration', () => {
  const legacy = fixture('legacy-v2.json');
  const migrated = migratePortfolio(legacy);
  for (const [i, alert] of legacy.alerts.entries()) {
    const haystack = JSON.stringify(migrated.investigations[i]);
    for (const s of strings(alert)) {
      assert.ok(haystack.includes(JSON.stringify(s).slice(1, -1)),
        `alert ${alert.id}: text not carried over → ${s.slice(0, 80)}`);
    }
  }
});

test('entry counts are preserved and BEC/profile are untouched', () => {
  const legacy = fixture('legacy-v2.json');
  const migrated = migratePortfolio(legacy);
  assert.equal(migrated.investigations.length, legacy.alerts.length);
  assert.equal(countEntries(migrated), countEntries(legacy));
  assert.deepEqual(migrated.bec, legacy.bec);
  assert.deepEqual(migrated.profile, legacy.profile);
  assert.equal(migrated.schemaVersion, SCHEMA_VERSION);
  assert.ok(!('alerts' in migrated), 'legacy alerts key should be removed after conversion');
});

test('does not mutate the input', () => {
  const legacy = fixture('legacy-v2.json');
  const before = JSON.stringify(legacy);
  migratePortfolio(legacy);
  assert.equal(JSON.stringify(legacy), before);
});

test('idempotent: migrating twice gives the same result', () => {
  const once = migratePortfolio(fixture('legacy-v2.json'));
  assert.deepEqual(migratePortfolio(once), once);
});

test('mixed data: existing investigations come first, legacy alerts appended', () => {
  const legacy = fixture('legacy-v2.json');
  const mixed = { ...legacy, investigations: [{ id: 'INV-001', title: 'New one' }] };
  const migrated = migratePortfolio(mixed);
  assert.deepEqual(migrated.investigations.map((i) => i.id), ['INV-001', 'ALT-001', 'ALT-002']);
});

test('duplicate IDs are kept, not silently dropped', () => {
  const migrated = migratePortfolio({ investigations: [{ id: 'ALT-001' }], alerts: [{ id: 'ALT-001' }] });
  assert.equal(migrated.investigations.length, 2);
});

test('empty template migrates cleanly', () => {
  const migrated = migratePortfolio(fixture('empty-template.json'));
  assert.deepEqual(migrated.investigations, []);
  assert.deepEqual(migrated.bec, []);
});

test('tolerates garbage input without throwing', () => {
  for (const bad of [null, undefined, 42, 'x', [], { alerts: 'nope', bec: null }, { alerts: [null, 7] }]) {
    const m = migratePortfolio(bad);
    assert.ok(Array.isArray(m.investigations) && Array.isArray(m.bec));
    assert.ok([...m.investigations, ...m.bec].every((e) => e && typeof e === 'object'));
  }
});

test('field mapping lands where members will look for it', () => {
  const inv = alertToInvestigation(fixture('legacy-v2.json').alerts[0]);
  assert.equal(inv.title, 'Suspicious Base64-Encoded PowerShell Command');
  assert.equal(inv.reference, 'MDE-ALERT-7823421');
  assert.deepEqual(inv.affectedAssets, [{ name: 'CORP-WKS-042 / sarah.mitchell@[org].com', note: '' }]);
  assert.equal(inv.timeline[0].time, '14 Nov 2024 09:47 UTC');
  assert.match(inv.timeline[0].detail, /Why it triggered/);
  assert.match(inv.investigation, /^1\. /);
  assert.match(inv.verdictJustification, /^\*\*Assessment:\*\* Malicious/);
  assert.match(inv.response, /\*\*Escalation:\*\* Urgent/);
  assert.equal(inv.categorisation, 'TP');
  assert.equal(inv.verified, true);
});

test('unknown hand-added keys ride along', () => {
  const inv = alertToInvestigation(fixture('legacy-v2.json').alerts[1]);
  assert.equal(inv.handAddedNote, 'a key the editor never wrote');
});
