// Keyword search (BM25) over the knowledge sections. No AI and no external service:
// it finds the sections whose words best match the question, so Claude only sees
// relevant parts of the site.

const STOP = new Set(('a an and are as at be by can do does for from has have how i in is it its me my of on or ' +
  'that the this to was what when where which why will with you your about he his him ahmed mc tell').split(' '));

// Everyday words visitors use, mapped to the words the site content uses.
const SYNONYMS = {
  job: ['role', 'career'], looking: ['career', 'goal', 'transition'], employer: ['role'],
  now: ['current', 'currently'], current: ['currently'],
  chatbot: ['assistant'], bot: ['assistant'], chat: ['assistant'], you: ['assistant'],
  language: ['javascript', 'python', 'php', 'java', 'html'], programming: ['javascript', 'python', 'java'], coding: ['javascript', 'python'],
  study: ['education', 'degree'], school: ['education', 'degree'], college: ['education', 'degree'], university: ['education', 'degree'],
  email: ['email'], reach: ['contact'], message: ['contact'], hire: ['contact', 'career'],
  built: ['build'], made: ['build'], created: ['build'], project: ['build'],
  plugin: ['plugin'], wordpress: ['wordpress'], setup: ['install'], set: ['install'],
  located: ['location', 'based'], locat: ['location', 'based'], live: ['location', 'based'], make: ['made', 'build'],
};

// Very small stemmer: plurals and common endings, enough for site content.
function stem(w) {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

export function tokenize(text) {
  return (String(text).toLowerCase().match(/[a-z0-9]+/g) || [])
    .filter((w) => !STOP.has(w))
    .map(stem);
}

export function buildIndex(chunks) {
  const docs = chunks.map((c) => {
    // Section headings count double: they say what the section is about.
    const tokens = [...tokenize(c.section), ...tokenize(c.section), ...tokenize(c.title), ...tokenize(c.text)];
    const tf = new Map();
    for (const t of tokens) tf.set(t, (tf.get(t) || 0) + 1);
    return { chunk: c, tf, len: tokens.length };
  });
  const df = new Map();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) || 0) + 1);
  const avgLen = docs.reduce((s, d) => s + d.len, 0) / Math.max(1, docs.length);
  return { docs, df, avgLen, n: docs.length };
}

export function expand(tokens) {
  const out = [...tokens];
  for (const t of tokens) for (const extra of SYNONYMS[t] || []) out.push(stem(extra));
  return out;
}

export function search(index, query, k = 4) {
  const q = [...new Set(expand(tokenize(query)))];
  if (!q.length) return [];
  const K1 = 1.4, B = 0.6;
  const scored = index.docs.map((d) => {
    let score = 0;
    for (const t of q) {
      const f = d.tf.get(t);
      if (!f) continue;
      const idf = Math.log(1 + (index.n - index.df.get(t) + 0.5) / (index.df.get(t) + 0.5));
      score += idf * (f * (K1 + 1)) / (f + K1 * (1 - B + B * (d.len / index.avgLen)));
    }
    return { chunk: d.chunk, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, k);
}
