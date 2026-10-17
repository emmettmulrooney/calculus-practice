// Sanity checks: node test.js
const fs = require("fs");
const src = ["app.js", "word.js", "lessons.js"].map(f => fs.readFileSync(__dirname + "/" + f, "utf8")).join("\n").replace(/if \(typeof module[^\n]*\n/g, "");
const ctx = {}; new Function("ctx", src + "\nObject.assign(ctx,{GEN,WORD,SIMPLE,LESSONS,TOPICS,parse,ev,check});")(ctx);
const { GEN, WORD, SIMPLE, TOPICS, parse, ev, check } = ctx;
let bad = 0;
for (const k in GEN) {
  if (!SIMPLE[k]) { bad++; console.log("no SIMPLE for", k); }
  for (let i = 0; i < 300; i++) { const p = GEN[k](); if (!check(p, p.ans).ok) { bad++; console.log("gen", k, p.ans); } }
}
for (const k in WORD) for (let i = 0; i < 300; i++) {
  const w = WORD[k](), s = w.stages[4];
  if (w.stages.some(st => st.type === "mc" && st.options.filter(o => o.ok).length !== 1)) { bad++; console.log("mc", k); }
  let e = s.exact.replace(/\\frac\{(-?\d+)\}\{(\d*)\\pi\}/g, (_, n, d) => `(${n}/(${d || 1}*pi))`).replace(/\\frac\{(-?\d+)\}\{(\d+)\}/g, "($1/$2)").replace(/\\pi/g, "pi");
  const v = ev(parse(e), 0);
  if (Math.abs(v - +s.ans) > 1e-9 * Math.max(1, Math.abs(v))) { bad++; console.log("exact≠ans", k, s.exact, v, s.ans); }
  if (!check({ kind: "num", ans: s.ans, tol: 0.01 }, e).ok) { bad++; console.log("exact rejected", k, e); }
}
console.log(bad ? `FAIL: ${bad}` : "All checks passed");
