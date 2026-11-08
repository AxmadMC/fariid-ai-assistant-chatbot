// Asks the deployed assistant every test question and writes a report for you to review.
//   ASK_URL=https://fariid-ai-assistant.YOUR-SUBDOMAIN.workers.dev EVAL_KEY=your-eval-key node scripts/eval-live.mjs
// Needs the EVAL_KEY secret set on the Worker. Uses about 30 questions of your daily limit.
import { readFile, writeFile } from 'node:fs/promises';

const url = process.env.ASK_URL, key = process.env.EVAL_KEY;
if (!url || !key) { console.error('Set ASK_URL and EVAL_KEY first.'); process.exit(1); }
const questions = JSON.parse(await readFile(new URL('../eval/questions.json', import.meta.url)));
const DECLINE = /(don't have|do not have|not able|can't help|cannot help|outside|only answer|contact page|not something)/i;

let ok = 0;
const lines = ['# Fariid AI Assistant — live test results', '', `Run: ${new Date().toISOString()}`, ''];
for (const item of questions) {
  const res = await fetch(`${url}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Eval-Key': key },
    body: JSON.stringify({ question: item.q }),
  });
  const data = await res.json().catch(() => ({}));
  const answer = data.answer || `(error: ${data.error || res.status})`;
  const cited = (data.sources || []).length > 0;
  const pass = item.outOfScope ? DECLINE.test(answer) && !/@/.test(answer) : res.ok && cited;
  if (pass) ok++;
  lines.push(`## ${pass ? '✅' : '❌'} ${item.q}`, '', answer, '', ...(data.sources || []).map((s) => `- [${s.n}] ${s.title}: ${s.url}`), '');
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${item.q}`);
}
lines.splice(3, 0, `**${ok}/${questions.length} passed** (answerable questions must cite a source; off-topic ones must be declined).`, '');
await writeFile(new URL('../eval/results.md', import.meta.url), lines.join('\n'));
console.log(`\n${ok}/${questions.length} passed. Full answers saved to eval/results.md — read them, don't just trust the score.`);
