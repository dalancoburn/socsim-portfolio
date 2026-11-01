// The one place pages read portfolio data from. Always migrated to the
// current schema, so pages never need to know about older formats.
import raw from '../data/portfolio.json';
import { migratePortfolio } from './migrate.js';

export const portfolio = migratePortfolio(raw) as Record<string, any> & {
  profile: Record<string, any>;
  investigations: Record<string, any>[];
  bec: Record<string, any>[];
};

/**
 * Entries that can have their own page: non-blank ID, first occurrence wins,
 * so a copy-pasted duplicate ID can never break the whole build.
 */
export function routable<T extends Record<string, any>>(entries: T[]): T[] {
  const seen = new Set<string>();
  return entries.filter((e) => {
    const id = String(e?.id ?? '').trim();
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}
