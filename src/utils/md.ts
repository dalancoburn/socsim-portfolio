import { marked } from 'marked';

marked.use({
  gfm: true,
  breaks: true,
});

/**
 * Parse Markdown to HTML for use with Astro's set:html directive.
 * Returns empty string for null/empty input.
 */
export function md(text: string | null | undefined): string {
  if (!text?.trim()) return '';
  const result = marked.parse(text, { async: false });
  return typeof result === 'string' ? result : '';
}

/**
 * Flatten Markdown to plain text for meta descriptions / social previews.
 * Strips images, unwraps links, drops formatting chars, collapses whitespace.
 */
export function mdToText(text: string | null | undefined, max = 160): string {
  if (!text) return '';
  let t = text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')      // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // links → label
    .replace(/```[\s\S]*?```/g, '')            // fenced code blocks
    .replace(/[`*_>#~|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length > max) t = t.slice(0, max - 1).trimEnd() + '…';
  return t;
}
