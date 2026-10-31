/**
 * Portfolio schema migration — the single source of truth for turning any
 * older portfolio.json into the current shape.
 *
 * Used by BOTH the site build (Astro pages import it) and the editor
 * (served at /migrate.js by src/pages/migrate.js.ts), so the published site
 * and the editor can never disagree about how old data maps across.
 *
 * Rules:
 *   - Never lose member data. Every legacy field is carried into a new field.
 *   - Never mutate the input.
 *   - Idempotent: migrating already-migrated data returns the same content.
 *   - Plain JS, no imports — it must run unbundled in the browser.
 *
 * Schema history:
 *   v2  alerts[]          (single-alert write-ups)
 *   v3  investigations[]  (general investigations: timeline, affected assets)
 */

export const SCHEMA_VERSION = 3;

const arr = (v) => (Array.isArray(v) ? v : []);
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
/** Entries must be objects — a stray null/number in a hand-edited file holds no data and would crash rendering. */
const entries = (v) => arr(v).filter(isObj);
const str = (v) => (v === undefined || v === null ? '' : String(v));
const trim = (v) => str(v).trim();

/** Join non-empty Markdown chunks with a blank line between them. */
const joinMd = (...parts) => parts.map(trim).filter(Boolean).join('\n\n');

/** Legacy alert keys that alertToInvestigation() maps explicitly. */
const LEGACY_ALERT_KEYS = new Set([
  'id', 'alertName', 'alertId', 'date', 'severity', 'hostOrAccount', 'dateTime',
  'whatTriggered', 'whyTriggered', 'whatHappened', 'evidence', 'wasSuccessful',
  'verdict', 'verdictJustification', 'investigationSteps', 'queries',
  'categorisation', 'escalation', 'containment', 'alertTuning',
  'lessonsLearned', 'tools', 'customSections', 'verified',
]);

/**
 * Convert one v2 alert write-up into a v3 investigation.
 * Fields with no direct equivalent are folded into the closest free-text
 * section, labelled, so nothing a member wrote disappears.
 */
export function alertToInvestigation(alert) {
  const a = alert && typeof alert === 'object' ? alert : {};

  // The alert itself becomes the first timeline entry: when it fired,
  // what fired, and why.
  const timeline = [];
  const triggerDetail = joinMd(
    a.whatTriggered,
    trim(a.whyTriggered) && `**Why it triggered:** ${trim(a.whyTriggered)}`,
  );
  if (trim(a.dateTime) || triggerDetail) {
    timeline.push({
      time: trim(a.dateTime),
      activity: trim(a.alertName) ? `Alert triggered: ${trim(a.alertName)}` : 'Alert triggered',
      detail: triggerDetail,
    });
  }

  const steps = arr(a.investigationSteps).map(trim).filter(Boolean);

  const investigation = {
    id: trim(a.id),
    title: trim(a.alertName),
    reference: trim(a.alertId),
    date: trim(a.date),
    severity: trim(a.severity),
    categorisation: trim(a.categorisation),
    summary: '',
    affectedAssets: trim(a.hostOrAccount) ? [{ name: trim(a.hostOrAccount), note: '' }] : [],
    whatHappened: str(a.whatHappened),
    timeline,
    investigation: joinMd(
      steps.map((s, i) => `${i + 1}. ${s}`).join('\n'),
      trim(a.evidence) && `**Evidence**\n\n${trim(a.evidence)}`,
    ),
    queries: str(a.queries),
    impact: trim(a.wasSuccessful) ? `**Was the activity successful?** ${trim(a.wasSuccessful)}` : '',
    verdictJustification: joinMd(
      trim(a.verdict) && `**Assessment:** ${trim(a.verdict)}`,
      a.verdictJustification,
    ),
    response: joinMd(
      trim(a.escalation) && `**Escalation:** ${trim(a.escalation)}`,
      a.containment,
      trim(a.alertTuning) && `**Alert tuning:** ${trim(a.alertTuning)}`,
    ),
    lessonsLearned: str(a.lessonsLearned),
    tools: arr(a.tools).map(trim).filter(Boolean),
    customSections: arr(a.customSections),
    verified: a.verified === true,
  };

  // Hand-added keys we don't know about ride along untouched.
  for (const [k, v] of Object.entries(a)) {
    if (!LEGACY_ALERT_KEYS.has(k) && !(k in investigation)) investigation[k] = v;
  }
  return investigation;
}

/**
 * Bring a whole portfolio up to the current schema.
 * Legacy alerts are appended after any existing investigations. Duplicate
 * IDs are kept (not dropped) so the editor's validation can flag them —
 * deciding which copy to discard is the member's call, not ours.
 */
export function migratePortfolio(data) {
  const d = data && typeof data === 'object' ? data : {};
  const { alerts, ...rest } = d;
  return {
    ...rest,
    schemaVersion: SCHEMA_VERSION,
    profile: d.profile && typeof d.profile === 'object' ? d.profile : {},
    investigations: [
      ...entries(d.investigations),
      ...entries(alerts).map(alertToInvestigation),
    ],
    bec: entries(d.bec),
  };
}

/** Total number of write-ups in a portfolio of any schema version. */
export function countEntries(data) {
  const d = data && typeof data === 'object' ? data : {};
  return entries(d.investigations).length + entries(d.alerts).length + entries(d.bec).length;
}
