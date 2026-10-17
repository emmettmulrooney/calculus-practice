// Calculus Practice — every problem unlocked, unlimited random problems.

// ---------- Expression parser / evaluator / TeX ----------
const NAMES = ["arcsin","arccos","arctan","sqrt","sin","cos","tan","sec","csc","cot","exp","abs","log","ln","pi","x","e","C"];
const FUNCS = new Set(["arcsin","arccos","arctan","sqrt","sin","cos","tan","sec","csc","cot","exp","abs","log","ln"]);

function tokenize(s) {
  const toks = []; let i = 0;
  s = s.replace(/π/g, "pi").replace(/·|×/g, "*").replace(/−/g, "-");
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i; while (j < s.length && /[0-9.]/.test(s[j])) j++;
      toks.push({ t: "num", v: parseFloat(s.slice(i, j)) }); i = j; continue;
    }
    if (/[a-zA-Z]/.test(c)) {
      const name = NAMES.find(n => s.startsWith(n, i));
      if (!name) throw new Error(`Unknown symbol "${c}"`);
      toks.push({ t: FUNCS.has(name) ? "fn" : "id", v: name }); i += name.length; continue;
    }
    if ("+-*/^()|".includes(c)) { toks.push({ t: c }); i++; continue; }
    throw new Error(`Unexpected "${c}"`);
  }
  return toks;
}

function parse(str) {
  const toks = tokenize(str); let p = 0;
  const peek = () => toks[p], next = () => toks[p++];
  const expect = t => { if (!peek() || peek().t !== t) throw new Error(`Expected "${t}"`); p++; };
  const startsPrimary = tk => tk && (tk.t === "num" || tk.t === "id" || tk.t === "fn" || tk.t === "(");

  function expr() {
    let a = term();
    while (peek() && (peek().t === "+" || peek().t === "-")) { const op = next().t; a = { t: "bin", op, a, b: term() }; }
    return a;
  }
  function term() {
    let a = unary();
    for (;;) {
      if (peek() && (peek().t === "*" || peek().t === "/")) { const op = next().t; a = { t: "bin", op, a, b: unary() }; }
      else if (startsPrimary(peek())) a = { t: "bin", op: "*", a, b: power(), imp: true };
      else return a;
    }
  }
  function unary() {
    if (peek() && peek().t === "-") { next(); return { t: "neg", a: unary() }; }
    if (peek() && peek().t === "+") { next(); return unary(); }
    return power();
  }
  function power() {
    const base = primary();
    if (peek() && peek().t === "^") { next(); return { t: "bin", op: "^", a: base, b: unary() }; }
    return base;
  }
  function primary() {
    const tk = next();
    if (!tk) throw new Error("Unexpected end");
    if (tk.t === "num") return { t: "num", v: tk.v };
    if (tk.t === "id") return { t: "var", n: tk.v };
    if (tk.t === "(") { const e = expr(); expect(")"); return e; }
    if (tk.t === "|") { const e = expr(); expect("|"); return { t: "fn", f: "abs", a: e }; }
    if (tk.t === "fn") {
      let pw = null;
      if (peek() && peek().t === "^") { next(); pw = primary(); }
      let arg;
      if (peek() && peek().t === "(") { next(); arg = expr(); expect(")"); }
      else arg = power();
      return { t: "fn", f: tk.v, a: arg, pow: pw };
    }
    throw new Error(`Unexpected "${tk.t}"`);
  }
  const e = expr();
  if (p < toks.length) throw new Error(`Unexpected "${toks[p].t}"`);
  return e;
}

const FN = {
  sin: Math.sin, cos: Math.cos, tan: Math.tan, sec: x => 1 / Math.cos(x), csc: x => 1 / Math.sin(x),
  cot: x => 1 / Math.tan(x), arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan,
  sqrt: Math.sqrt, exp: Math.exp, abs: Math.abs, ln: Math.log, log: Math.log,
};
function ev(n, x) {
  switch (n.t) {
    case "num": return n.v;
    case "var": return n.n === "x" ? x : n.n === "pi" ? Math.PI : n.n === "e" ? Math.E : 0; // C -> 0
    case "neg": return -ev(n.a, x);
    case "fn": { const v = FN[n.f](ev(n.a, x)); return n.pow ? Math.pow(v, ev(n.pow, x)) : v; }
    case "bin": {
      const a = ev(n.a, x), b = ev(n.b, x);
      return n.op === "+" ? a + b : n.op === "-" ? a - b : n.op === "*" ? a * b : n.op === "/" ? a / b : Math.pow(a, b);
    }
  }
}
const isSum = n => n.t === "bin" && (n.op === "+" || n.op === "-");
const wrap = (n, cond) => cond ? `\\left(${tex(n)}\\right)` : tex(n);
function tex(n) {
  switch (n.t) {
    case "num": return String(n.v);
    case "var": return n.n === "pi" ? "\\pi" : n.n;
    case "neg": return "-" + wrap(n.a, isSum(n.a));
    case "fn": {
      if (n.f === "sqrt") return `\\sqrt{${tex(n.a)}}`;
      if (n.f === "abs") return `\\left|${tex(n.a)}\\right|`;
      const name = n.f.startsWith("arc") ? `\\operatorname{${n.f}}` : `\\${n.f}`;
      return `${name}${n.pow ? `^{${tex(n.pow)}}` : ""}\\left(${tex(n.a)}\\right)`;
    }
    case "bin": {
      if (n.op === "+") return `${tex(n.a)} + ${tex(n.b)}`;
      if (n.op === "-") return `${tex(n.a)} - ${wrap(n.b, isSum(n.b))}`;
      if (n.op === "/") return `\\frac{${tex(n.a)}}{${tex(n.b)}}`;
      if (n.op === "^") return `{${wrap(n.a, n.a.t === "bin" || n.a.t === "neg" || n.a.t === "fn")}}^{${tex(n.b)}}`;
      const L = wrap(n.a, isSum(n.a)), R = wrap(n.b, isSum(n.b) || n.b.t === "neg");
      const needDot = n.b.t === "num" || (n.b.t === "bin" && n.b.op === "^" && n.b.a.t === "num");
      return needDot ? `${L} \\cdot ${R}` : `${L}\\,${R}`;
    }
  }
}

// ---------- Answer checking ----------
const PTS = [0.31, 0.74, 1.13, 1.58, 2.21, 2.87, -0.47, -1.36];
const close = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
function check(prob, input) {
  let s = input.trim().replace(/^y\s*=/, "");
  if (!s) return { ok: false, msg: "Enter an answer first." };
  let user;
  try { user = parse(s); } catch (e) { return { ok: false, msg: "Couldn't read that: " + e.message }; }
  const correct = parse(prob.ans);
  if (prob.kind === "num") {
    const u = ev(user, 0), c = ev(correct, 0);
    if (prob.tol) return { ok: Math.abs(u - c) <= Math.max(prob.tol * Math.abs(c), 0.0005) };
    return { ok: close(u, c) };
  }
  const vals = PTS.map(x => [ev(user, x), ev(correct, x)]).filter(([u, c]) => isFinite(u) && isFinite(c));
  if (vals.length < 3) return { ok: false, msg: "That answer isn't defined at the test points." };
  if (prob.kind === "expr") return { ok: vals.every(([u, c]) => close(u, c)) };
  const d0 = vals[0][0] - vals[0][1];
  const ok = vals.every(([u, c]) => close(u - c, d0));
  return { ok, warnC: ok && !/C/.test(s) };
}

// ---------- Problem generators ----------
const ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const nz = (a, b) => { let v; do v = ri(a, b); while (v === 0); return v; };
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
function frac(n, d) {
  if (d < 0) { n = -n; d = -d; }
  const g = gcd(n, d) || 1; n /= g; d /= g;
  return d === 1 ? { s: `${n}`, t: `${n}` } : { s: `(${n}/${d})`, t: `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${d}}` };
}
function poly(terms) {
  let s = "", t = "";
  terms.filter(([c]) => c !== 0).forEach(([c, n], i) => {
    const sign = i === 0 ? (c < 0 ? "-" : "") : c < 0 ? " - " : " + ";
    const a = Math.abs(c), coef = a === 1 && n !== 0 ? "" : String(a);
    s += sign + coef + (coef && n ? "*" : "") + (n === 0 ? "" : n === 1 ? "x" : `x^${n}`);
    t += sign + coef + (n === 0 ? "" : n === 1 ? "x" : `x^{${n}}`);
  });
  return { s: s || "0", t: t || "0" };
}
const lin = (a, b) => poly([[a, 1], [b, 0]]);

const D = "Find the derivative \\(f'(x)\\).";
const GEN = {
  limSub() {
    const a = ri(-3, 3), p = nz(-4, 4), q = ri(-6, 6), r = ri(-9, 9), f = poly([[p, 2], [q, 1], [r, 0]]);
    const v = p * a * a + q * a + r;
    return { kind: "num", prompt: "Evaluate the limit.", tex: `\\lim_{x \\to ${a}} \\left(${f.t}\\right)`, ans: `${v}`, ansTex: `${v}`,
      hint: "Polynomials are continuous — just substitute.", steps: [["Substitute \\(x = " + a + "\\):", `${p}(${a})^2 + ${q}(${a}) + ${r} = ${v}`]] };
  },
  limFactor() {
    const a = nz(-5, 5); let b; do b = ri(-6, 6); while (b === -a);
    const num = poly([[1, 2], [b - a, 1], [-a * b, 0]]), den = lin(1, -a);
    return { kind: "num", prompt: "Evaluate the limit.", tex: `\\lim_{x \\to ${a}} \\frac{${num.t}}{${den.t}}`, ans: `${a + b}`, ansTex: `${a + b}`,
      hint: "Plugging in gives 0/0. Factor the numerator and cancel.",
      steps: [["Factor:", `\\frac{(${den.t})(${lin(1, b).t})}{${den.t}} = ${lin(1, b).t}`], ["Substitute \\(x=" + a + "\\):", `${a} + (${b}) = ${a + b}`]] };
  },
  limTrig() {
    const a = ri(2, 9), b = ri(2, 9), f = frac(a, b);
    return { kind: "num", prompt: "Evaluate the limit.", tex: `\\lim_{x \\to 0} \\frac{\\sin(${a}x)}{${b}x}`, ans: f.s, ansTex: f.t,
      hint: "Use the special limit \\(\\lim_{u \\to 0} \\frac{\\sin u}{u} = 1\\).",
      steps: [["Multiply and divide by \\(" + a + "\\) to match the inside of sine:", `\\frac{\\sin(${a}x)}{${b}x} = \\frac{${a}}{${b}} \\cdot \\frac{\\sin(${a}x)}{${a}x}`],
        ["As \\(x \\to 0\\), \\(\\frac{\\sin(" + a + "x)}{" + a + "x} \\to 1\\):", `\\frac{${a}}{${b}} \\cdot 1 = ${f.t}`]] };
  },
  limConj() {
    const a = ri(1, 6), f = frac(1, 2 * a);
    return { kind: "num", prompt: "Evaluate the limit.", tex: `\\lim_{x \\to 0} \\frac{\\sqrt{x + ${a * a}} - ${a}}{x}`, ans: f.s, ansTex: f.t,
      hint: "Plugging in gives 0/0. Multiply top and bottom by the conjugate \\(\\sqrt{x+" + a * a + "} + " + a + "\\).",
      steps: [["Multiply by the conjugate:", `\\frac{(\\sqrt{x+${a * a}}-${a})(\\sqrt{x+${a * a}}+${a})}{x(\\sqrt{x+${a * a}}+${a})} = \\frac{x}{x(\\sqrt{x+${a * a}}+${a})}`],
        ["Cancel \\(x\\), then plug in \\(x = 0\\):", `\\frac{1}{\\sqrt{${a * a}}+${a}} = ${f.t}`]] };
  },
  limOneSided() {
    const c = ri(-3, 3), p = nz(-5, 5), q = ri(-9, 9), r = nz(-5, 5), s = ri(-9, 9), left = Math.random() < 0.5;
    const L = lin(p, q), R = lin(r, s), v = left ? p * c + q : r * c + s;
    return { kind: "num", prompt: `Use the piecewise function to find the one-sided limit.`,
      tex: `f(x) = \\begin{cases} ${L.t} & x < ${c} \\\\ ${R.t} & x \\ge ${c} \\end{cases} \\qquad \\lim_{x \\to ${c}^{${left ? "-" : "+"}}} f(x)`,
      ans: `${v}`, ansTex: `${v}`, hint: `\\(x \\to ${c}^{${left ? "-" : "+"}}\\) means x approaches from the ${left ? "left (values slightly less than " + c + ")" : "right (values slightly more than " + c + ")"}.`,
      steps: [[`From the ${left ? "left" : "right"}, use the piece for \\(x ${left ? "<" : "\\ge"} ${c}\\):`, left ? L.t : R.t], ["Substitute \\(x = " + c + "\\):", `${v}`]] };
  },
  limInf() {
    if (Math.random() < 0.35) {
      const p = nz(-9, 9), r = nz(-9, 9), q = ri(-9, 9);
      return { kind: "num", prompt: "Evaluate the limit.", tex: `\\lim_{x \\to \\infty} \\frac{${poly([[p, 1], [q, 0]]).t}}{${poly([[r, 3], [1, 0]]).t}}`, ans: "0", ansTex: "0",
        hint: "Compare the highest powers on top and bottom.", steps: [["The bottom grows faster (\\(x^3\\) vs \\(x\\)), so the fraction shrinks to 0:", "0"]] };
    }
    const p = nz(-9, 9), r = nz(-9, 9), q = ri(-9, 9), s = ri(-9, 9), f = frac(p, r);
    return { kind: "num", prompt: "Evaluate the limit.", tex: `\\lim_{x \\to \\infty} \\frac{${poly([[p, 2], [q, 0]]).t}}{${poly([[r, 2], [s, 1]]).t}}`,
      ans: f.s, ansTex: f.t, hint: "Divide top and bottom by the highest power of x.",
      steps: [["Same degree on top and bottom, so the limit is the ratio of leading coefficients:", `\\frac{${p}}{${r}} = ${f.t}`]] };
  },
  power() {
    const n = ri(3, 7), m = ri(1, n - 1), a = nz(-9, 9), b = nz(-9, 9), c = ri(-9, 9);
    const f = poly([[a, n], [b, m], [c, 0]]), d = poly([[a * n, n - 1], [b * m, m - 1]]);
    return { kind: "expr", prompt: D, tex: `f(x) = ${f.t}`, fs: f.s, ans: d.s, ansTex: d.t,
      hint: "Power rule: \\(\\frac{d}{dx} x^n = n x^{n-1}\\). Constants vanish.", steps: [["Apply the power rule term by term:", `f'(x) = ${d.t}`]] };
  },
  product() {
    const n = ri(2, 5), g = pick([["sin(x)", "cos(x)", "\\sin x", "\\cos x"], ["cos(x)", "-sin(x)", "\\cos x", "-\\sin x"], ["e^x", "e^x", "e^{x}", "e^{x}"]]);
    const xn1 = n - 1 === 1 ? "x" : `x^{${n - 1}}`;
    return { kind: "expr", prompt: D, tex: `f(x) = x^{${n}} ${g[2]}`, fs: `x^${n}*${g[0]}`,
      ans: `${n}*x^${n - 1}*${g[0]} + x^${n}*(${g[1]})`, ansTex: `${n}${xn1}${g[2]} + x^{${n}}\\left(${g[3]}\\right)`,
      hint: "Product rule: \\((uv)' = u'v + uv'\\).", steps: [["Let \\(u = x^{" + n + "}\\), \\(v = " + g[2] + "\\):", `u' = ${n}${xn1},\\quad v' = ${g[3]}`], ["So", `f'(x) = ${n}${xn1}${g[2]} + x^{${n}}\\left(${g[3]}\\right)`]] };
  },
  quotient() {
    let a, b, c, d; do { a = nz(-6, 6); b = ri(-6, 6); c = nz(-6, 6); d = nz(-6, 6); } while (a * d - b * c === 0);
    const top = lin(a, b), bot = lin(c, d), k = a * d - b * c;
    return { kind: "expr", prompt: D, tex: `f(x) = \\frac{${top.t}}{${bot.t}}`, fs: `(${top.s})/(${bot.s})`,
      ans: `${k}/(${bot.s})^2`, ansTex: `\\frac{${k}}{(${bot.t})^2}`, hint: "Quotient rule: \\(\\left(\\frac{u}{v}\\right)' = \\frac{u'v - uv'}{v^2}\\).",
      steps: [["Apply the quotient rule:", `f'(x) = \\frac{${a}(${bot.t}) - ${c}(${top.t})}{(${bot.t})^2}`], ["Simplify the numerator:", `f'(x) = \\frac{${k}}{(${bot.t})^2}`]] };
  },
  chain() {
    const v = ri(0, 2);
    if (v === 0) {
      const a = nz(-5, 5), b = nz(-7, 7), n = ri(2, 8), in_ = lin(a, b);
      return { kind: "expr", prompt: D, tex: `f(x) = (${in_.t})^{${n}}`, fs: `(${in_.s})^${n}`,
        ans: `${n * a}*(${in_.s})^${n - 1}`, ansTex: `${n * a}(${in_.t})^{${n - 1}}`, hint: "Chain rule: outer derivative × inner derivative.",
        steps: [["Outer: \\(u^{" + n + "} \\to " + n + "u^{" + (n - 1) + "}\\). Inner derivative: \\(" + a + "\\).", `f'(x) = ${n}(${in_.t})^{${n - 1}} \\cdot ${a} = ${n * a}(${in_.t})^{${n - 1}}`]] };
    }
    const k = nz(-5, 5), fn = v === 1 ? "sin" : "cos", in_ = poly([[k, 2]]);
    const dfs = v === 1 ? `cos(${in_.s})` : `-sin(${in_.s})`, dft = v === 1 ? `\\cos(${in_.t})` : `\\sin(${in_.t})`;
    const coef = v === 1 ? 2 * k : -2 * k;
    return { kind: "expr", prompt: D, tex: `f(x) = \\${fn}(${in_.t})`, fs: `${fn}(${in_.s})`,
      ans: `${2 * k}*x*${dfs}`, ansTex: `${coef}x${dft}`, hint: "Chain rule: differentiate the outside, keep the inside, multiply by the inside's derivative.",
      steps: [["Inner derivative: \\(" + 2 * k + "x\\).", `f'(x) = ${coef}x${dft}`]] };
  },
  trigExp() {
    const a = nz(-6, 6), b = ri(2, 5), c = nz(-6, 6), k = nz(-4, 4);
    const ek = k === 1 ? "x" : k === -1 ? "-x" : `${k}x`;
    return { kind: "expr", prompt: D, tex: `f(x) = ${a}\\sin(${b}x) ${c < 0 ? "-" : "+"} ${Math.abs(c)}e^{${ek}}`, fs: `${a}*sin(${b}*x) + (${c})*e^(${k}*x)`,
      ans: `${a * b}*cos(${b}*x) + (${c * k})*e^(${k}*x)`, ansTex: `${a * b}\\cos(${b}x) ${c * k < 0 ? "-" : "+"} ${Math.abs(c * k)}e^{${ek}}`,
      hint: "\\(\\frac{d}{dx}\\sin(bx) = b\\cos(bx)\\), \\(\\frac{d}{dx}e^{kx} = ke^{kx}\\).",
      steps: [["Differentiate each term:", `f'(x) = ${a * b}\\cos(${b}x) ${c * k < 0 ? "-" : "+"} ${Math.abs(c * k)}e^{${ek}}`]] };
  },
  derivAt() {
    const a = nz(-5, 5), b = ri(-6, 6), c = ri(-9, 9), x0 = ri(-3, 3), f = poly([[a, 3], [b, 2], [c, 1], [ri(-9, 9), 0]]);
    const d = poly([[3 * a, 2], [2 * b, 1], [c, 0]]), v = 3 * a * x0 * x0 + 2 * b * x0 + c;
    return { kind: "num", prompt: `Find \\(f'(${x0})\\).`, tex: `f(x) = ${f.t}`, ans: `${v}`, ansTex: `${v}`,
      hint: "Differentiate first, then plug in.", steps: [["Derivative:", `f'(x) = ${d.t}`], ["Evaluate:", `f'(${x0}) = ${v}`]] };
  },
  tangent() {
    const p = nz(-4, 4), q = ri(-6, 6), r = ri(-9, 9), a = ri(-3, 3);
    const f = poly([[p, 2], [q, 1], [r, 0]]), m = 2 * p * a + q, y0 = p * a * a + q * a + r, L = poly([[m, 1], [y0 - m * a, 0]]);
    return { kind: "expr", prompt: `Find the equation of the tangent line at \\(x = ${a}\\). Answer as \\(y = \\ldots\\)`, tex: `f(x) = ${f.t}`,
      ans: L.s, ansTex: `y = ${L.t}`, hint: "Slope = f'(a). Point = (a, f(a)). Then use point-slope form.",
      steps: [["Point:", `f(${a}) = ${y0}`], ["Slope:", `f'(x) = ${poly([[2 * p, 1], [q, 0]]).t},\\; f'(${a}) = ${m}`], ["Point-slope:", `y = ${y0} + ${m}(x - (${a})) = ${L.t}`]] };
  },
  intPower() {
    const n = ri(2, 6), A = nz(-5, 5), B = nz(-5, 5), c = ri(-9, 9);
    const f = poly([[A * (n + 1), n], [2 * B, 1], [c, 0]]), F = poly([[A, n + 1], [B, 2], [c, 1]]);
    return { kind: "anti", prompt: "Find the indefinite integral.", tex: `\\int \\left(${f.t}\\right)\\,dx`, fs: f.s, ans: F.s, ansTex: `${F.t} + C`,
      hint: "\\(\\int x^n\\,dx = \\frac{x^{n+1}}{n+1} + C\\).", steps: [["Integrate term by term:", `${F.t} + C`]] };
  },
  intTrig() {
    const b = ri(2, 5), k = ri(2, 4), A = nz(-4, 4), B = nz(-4, 4);
    return { kind: "anti", prompt: "Find the indefinite integral.", tex: `\\int \\left(${A * b}\\cos(${b}x) ${B * k < 0 ? "-" : "+"} ${Math.abs(B * k)}e^{${k}x}\\right)dx`,
      fs: `${A * b}*cos(${b}*x) + (${B * k})*e^(${k}*x)`, ans: `${A}*sin(${b}*x) + (${B})*e^(${k}*x)`,
      ansTex: `${A}\\sin(${b}x) ${B < 0 ? "-" : "+"} ${Math.abs(B)}e^{${k}x} + C`, hint: "\\(\\int \\cos(bx)dx = \\frac{1}{b}\\sin(bx)\\), \\(\\int e^{kx}dx = \\frac{1}{k}e^{kx}\\).",
      steps: [["Divide each coefficient by the inner constant:", `${A}\\sin(${b}x) ${B < 0 ? "-" : "+"} ${Math.abs(B)}e^{${k}x} + C`]] };
  },
  uSub() {
    const m = nz(-6, 6), n = ri(2, 6), in_ = poly([[1, 2], [m, 0]]);
    return { kind: "anti", prompt: "Find the indefinite integral.", tex: `\\int 2x\\,(${in_.t})^{${n}}\\,dx`, fs: `2*x*(${in_.s})^${n}`,
      ans: `(${in_.s})^${n + 1}/${n + 1}`, ansTex: `\\frac{(${in_.t})^{${n + 1}}}{${n + 1}} + C`, hint: "Let \\(u = x^2 " + (m < 0 ? "-" : "+") + Math.abs(m) + "\\). What is du?",
      steps: [["Let \\(u = " + in_.t + "\\), so \\(du = 2x\\,dx\\):", `\\int u^{${n}}\\,du = \\frac{u^{${n + 1}}}{${n + 1}} + C`], ["Back-substitute:", `\\frac{(${in_.t})^{${n + 1}}}{${n + 1}} + C`]] };
  },
  definite() {
    const a = ri(-2, 2), b = a + ri(1, 3), p = ri(-3, 3), q = ri(-5, 5), r = ri(-5, 5);
    const f = poly([[p, 2], [q, 1], [r, 0]]), num = 2 * p * (b ** 3 - a ** 3) + 3 * q * (b * b - a * a) + 6 * r * (b - a), v = frac(num, 6);
    const F = `${frac(p, 3).t}x^3 + ${frac(q, 2).t}x^2 + ${r}x`;
    return { kind: "num", prompt: "Evaluate the definite integral (exact fraction or decimal).", tex: `\\int_{${a}}^{${b}} \\left(${f.t}\\right)dx`, ans: v.s, ansTex: v.t,
      hint: "Find an antiderivative F, then compute F(b) − F(a).", steps: [["Antiderivative:", `F(x) = ${F}`], ["\\(F(" + b + ") - F(" + a + ")\\):", v.t]] };
  },
};

const TOPICS = [
  { name: "Limits", skills: [["limSub", "Direct substitution"], ["limFactor", "Factor & cancel (0/0)"], ["limConj", "Conjugate (square roots)"], ["limTrig", "Trig limits (sin x / x)"], ["limOneSided", "One-sided limits"], ["limInf", "Limits at infinity"]] },
  { name: "Derivatives", skills: [["power", "Power rule"], ["product", "Product rule"], ["quotient", "Quotient rule"], ["chain", "Chain rule"], ["trigExp", "Trig & exponential"], ["derivAt", "Derivative at a point"]] },
  { name: "Applications", skills: [["tangent", "Tangent lines"]] },
  { name: "Integrals", skills: [["intPower", "Power rule integrals"], ["intTrig", "Trig & exponential integrals"], ["uSub", "u-substitution"], ["definite", "Definite integrals"]] },
];

if (typeof module !== "undefined" && typeof document === "undefined") module.exports = { GEN, parse, ev, check, frac, ri, nz, pick, TOPICS };
