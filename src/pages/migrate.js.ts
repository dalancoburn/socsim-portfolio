// Serves src/utils/migrate.js verbatim at /migrate.js so the editor
// (public/editor.html) runs the exact same migration code as the site build.
import type { APIRoute } from 'astro';
import source from '../utils/migrate.js?raw';

export const GET: APIRoute = () =>
  new Response(source, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
