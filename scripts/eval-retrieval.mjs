// Checks that the keyword search finds the right part of the site for each test question.
// Runs locally, no API key needed:  node scripts/eval-retrieval.mjs
import { readFile } from 'node:fs/promises';
import { buildIndex, search } from '../src/retrieve.js';

const knowledge = JSON.parse(await readFile(new URL('../src/knowledge.json', import.meta.url)));
const questions = JSON.parse(await readFile(new URL('../eval/questions.json', import.meta.url)));
const index = buildIndex(knowledge);

let total = 0, top1 = 0, top3 = 0;
for (const item of questions) {
  if (item.outOfScope) continue;
  total++;
  const ids = search(index, item.q, 3).map((r) => r.chunk.id);
  const hit1 = item.expect.includes(ids[0]);
  const hit3 = ids.some((id) => item.expect.includes(id));
  if (hit1) top1++;
  if (hit3) top3++;
  console.log(`${hit3 ? 'PASS' : 'FAIL'}  ${item.q}  →  ${ids.join(', ') || '(nothing)'}`);
}
console.log(`\nRight section ranked first: ${top1}/${total}   In top 3: ${top3}/${total}`);
process.exit(top3 === total ? 0 : 1);
