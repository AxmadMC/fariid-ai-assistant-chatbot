// Turns the Markdown files in content/ into src/knowledge.json, one entry per "## " section.
// Run after editing content:  node scripts/build-knowledge.mjs
//
// Each content file starts with:
//   ---
//   title: Page title
//   url: https://ahmedmc.com/page
//   ---
// A section heading can end with " #anchor" to link to a part of the page.

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const CONTENT = path.join(ROOT, 'content');
const OUT = path.join(ROOT, 'src', 'knowledge.json');

const files = (await readdir(CONTENT)).filter((f) => f.endsWith('.md')).sort();
const chunks = [];

for (const file of files) {
  const raw = await readFile(path.join(CONTENT, file), 'utf8');
  const fm = raw.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fm) throw new Error(`${file}: missing front matter`);
  const meta = Object.fromEntries(fm[1].split('\n').map((l) => l.split(/:\s(.+)/).slice(0, 2).map((s) => s.trim())));
  if (!meta.title || !meta.url) throw new Error(`${file}: needs title and url`);

  const body = raw.slice(fm[0].length);
  const parts = body.split(/^## /m).slice(1);
  parts.forEach((part, i) => {
    const [headLine, ...rest] = part.split('\n');
    const anchor = headLine.match(/\s#([\w-]+)\s*$/);
    const section = headLine.replace(/\s#[\w-]+\s*$/, '').trim();
    const text = rest.join(' ').replace(/\s+/g, ' ').trim();
    if (!text) return;
    chunks.push({
      id: `${file.replace(/\.md$/, '')}-${i + 1}`,
      title: meta.title,
      section,
      url: meta.url + (anchor ? `#${anchor[1]}` : ''),
      text,
    });
  });
}

await writeFile(OUT, JSON.stringify(chunks, null, 2) + '\n');
console.log(`Wrote ${chunks.length} sections from ${files.length} files to src/knowledge.json`);
